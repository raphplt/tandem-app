import { useAuthSession } from "@/hooks/use-auth-session";
import { env } from "@/src/config/env";
import { MATCHES_QUERY_KEY } from "@/src/hooks/use-matches";
import { apiFetch } from "@/src/lib/api/client";
import { extractErrorMessage } from "@/src/utils/error";
import type { HeartbeatEventPayload, SearchStateEventPayload } from "@/types/availability";
import type { MatchResponse } from "@/types/match";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import EventSource, { type EventSourceListener } from "react-native-sse";

const SEARCH_STREAM_ENDPOINT = "/api/v1/matches/search/stream";
const JOIN_QUEUE_ENDPOINT = "/api/v1/availability/queue/join";
const LEAVE_QUEUE_ENDPOINT = "/api/v1/availability/queue/leave";
const HEARTBEAT_ENDPOINT = "/api/v1/availability/heartbeat";
const HEARTBEAT_INTERVAL_MS = 120_000;

type SSEMessage = {
	event: string;
	data: string;
};

type StopSearchOptions = {
	callLeave?: boolean;
	silent?: boolean;
};

type LeaveQueueOptions = {
	silent?: boolean;
};

export function useDailySearchStream() {
	const { data: session } = useAuthSession();
	const sessionToken = session?.sessionToken;
	const queryClient = useQueryClient();

	const [searchState, setSearchState] = useState<SearchStateEventPayload | null>(
		null
	);
	const [isSearching, setIsSearching] = useState(false);
	const [streamError, setStreamError] = useState<string | null>(null);
	const [lastHeartbeatAt, setLastHeartbeatAt] = useState<string | null>(null);

	const controllerRef = useRef<AbortController | null>(null);
	const streamCleanupRef = useRef<(() => void) | null>(null);
	const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
		null
	);
	const isStartingRef = useRef(false);
	const isSearchingRef = useRef(false);

	const updateIsSearching = useCallback((value: boolean) => {
		isSearchingRef.current = value;
		setIsSearching(value);
	}, []);

	const clearHeartbeat = useCallback(() => {
		if (heartbeatIntervalRef.current) {
			clearInterval(heartbeatIntervalRef.current);
			heartbeatIntervalRef.current = null;
		}
		setLastHeartbeatAt(null);
	}, []);

	const callAvailabilityEndpoint = useCallback(
		async (
			endpoint: string,
			{ silent = false }: { silent?: boolean } = {}
		): Promise<boolean> => {
			const result = await apiFetch(endpoint, { method: "POST" });
			if (result.error) {
				const message = extractErrorMessage(result.error);
				if (silent) {
					console.warn(`[match-search] ${endpoint} failed: ${message}`);
					return false;
				}
				throw new Error(message);
			}
			return true;
		},
		[]
	);

	const joinQueue = useCallback(async () => {
		return callAvailabilityEndpoint(JOIN_QUEUE_ENDPOINT);
	}, [callAvailabilityEndpoint]);

	const leaveQueue = useCallback(
		async ({ silent = false }: LeaveQueueOptions = {}) => {
			return callAvailabilityEndpoint(LEAVE_QUEUE_ENDPOINT, { silent });
		},
		[callAvailabilityEndpoint]
	);

	const sendHeartbeat = useCallback(
		async (silent = false) => {
			const succeeded = await callAvailabilityEndpoint(HEARTBEAT_ENDPOINT, {
				silent,
			});
			if (succeeded) {
				setLastHeartbeatAt(new Date().toISOString());
			}
		},
		[callAvailabilityEndpoint]
	);

	const startHeartbeatLoop = useCallback(() => {
		clearHeartbeat();
		heartbeatIntervalRef.current = setInterval(() => {
			void sendHeartbeat(true);
		}, HEARTBEAT_INTERVAL_MS);
	}, [clearHeartbeat, sendHeartbeat]);

	const stopStream = useCallback(() => {
		if (streamCleanupRef.current) {
			streamCleanupRef.current();
			streamCleanupRef.current = null;
		}
		if (controllerRef.current) {
			controllerRef.current.abort();
			controllerRef.current = null;
		}
	}, []);

	const stopSearch = useCallback(
		async ({ callLeave = true, silent = false }: StopSearchOptions = {}) => {
			stopStream();
			clearHeartbeat();
			updateIsSearching(false);
			setSearchState(null);
			if (!silent) {
				setStreamError(null);
			}
			if (callLeave) {
				await leaveQueue({ silent });
			}
		},
		[clearHeartbeat, leaveQueue, stopStream, updateIsSearching]
	);

	const applyMatchToCache = useCallback(
		(match: MatchResponse) => {
			const dailyQueries = queryClient.getQueriesData<MatchResponse | null>({
				queryKey: [...MATCHES_QUERY_KEY, "daily"],
			});
			dailyQueries.forEach(([key]) => {
				queryClient.setQueryData(key, match);
			});
			queryClient.invalidateQueries({ queryKey: MATCHES_QUERY_KEY });
		},
		[queryClient]
	);

	const handleMatchFound = useCallback(
		async (payload: { match?: MatchResponse }) => {
			if (!payload?.match) {
				return;
			}
			await stopSearch({ callLeave: false, silent: true });
			setSearchState((prev) => ({
				...(prev ?? { status: "matched" }),
				status: "matched",
			}));
			applyMatchToCache(payload.match);
		},
		[applyMatchToCache, stopSearch]
	);

	const handleStreamEvent = useCallback(
		(message: SSEMessage) => {
			if (!message?.data) {
				return;
			}
			try {
				const parsed = JSON.parse(message.data);
				switch (message.event) {
					case "search_state": {
						const state = parsed as SearchStateEventPayload;
						setSearchState(state);
						if (state.status === "idle") {
							updateIsSearching(false);
						} else {
							updateIsSearching(true);
						}
						setStreamError(null);
						break;
					}
					case "match_found":
						void handleMatchFound(parsed as { match?: MatchResponse });
						break;
					case "heartbeat": {
						const heartbeat = parsed as HeartbeatEventPayload;
						setLastHeartbeatAt(heartbeat.timestamp ?? new Date().toISOString());
						break;
					}
					default:
						break;
				}
			} catch (error) {
				console.warn("[match-search] Failed to parse SSE payload", error);
			}
		},
		[handleMatchFound, updateIsSearching]
	);

	const connectStream = useCallback(() => {
		if (controllerRef.current) {
			return;
		}
		if (!sessionToken) {
			setStreamError("Session expirée, merci de te reconnecter.");
			updateIsSearching(false);
			return;
		}

		const controller = new AbortController();
		controllerRef.current = controller;

		try {
			const cleanup = openEventStream({
				url: `${env.baseURL}${SEARCH_STREAM_ENDPOINT}`,
				headers: {
					Authorization: `Bearer ${sessionToken}`,
				},
				signal: controller.signal,
				onEvent: handleStreamEvent,
				onError: (error) => {
					console.warn("[match-search] SSE stream error", error);
					if (controller.signal.aborted) {
						return;
					}
					streamCleanupRef.current = null;
					controllerRef.current = null;
					setStreamError(extractErrorMessage(error));
				},
				onClose: () => {
					streamCleanupRef.current = null;
					controllerRef.current = null;
				},
				onOpen: () => {
					console.debug("[match-search] SSE stream connected");
				},
			});

			streamCleanupRef.current = cleanup;
			setStreamError(null);
		} catch (error) {
			controllerRef.current = null;
			streamCleanupRef.current = null;
			setStreamError(extractErrorMessage(error));
		}
	}, [handleStreamEvent, sessionToken, updateIsSearching]);

	const startSearch = useCallback(async () => {
		if (isStartingRef.current || isSearchingRef.current) {
			return;
		}
		if (!sessionToken) {
			throw new Error("Session expirée, merci de te reconnecter.");
		}

		isStartingRef.current = true;
		setSearchState(null);
		setStreamError(null);

		try {
			updateIsSearching(true);
			const joined = await joinQueue();
			if (!joined) {
				throw new Error("Impossible de rejoindre la file d'attente.");
			}
			await sendHeartbeat(true);
			startHeartbeatLoop();
			connectStream();
		} catch (error) {
			updateIsSearching(false);
			stopStream();
			clearHeartbeat();
			throw error;
		} finally {
			isStartingRef.current = false;
		}
	}, [
		clearHeartbeat,
		connectStream,
		joinQueue,
		sendHeartbeat,
		sessionToken,
		startHeartbeatLoop,
		stopStream,
		updateIsSearching,
	]);

	const cancelSearch = useCallback(async () => {
		await stopSearch({ callLeave: true, silent: false });
	}, [stopSearch]);

	useEffect(() => {
		return () => {
			stopSearch({ silent: true }).catch(() => undefined);
		};
	}, [stopSearch]);

	return {
		isSearching,
		searchState,
		error: streamError,
		lastHeartbeatAt,
		startSearch,
		cancelSearch,
	};
}

type EventStreamOptions = {
	url: string;
	headers?: Record<string, string>;
	onEvent: (event: SSEMessage) => void;
	onError: (error: unknown) => void;
	onClose: () => void;
	onOpen?: () => void;
	signal: AbortSignal;
};

function openEventStream(options: EventStreamOptions) {
	const eventSource = new EventSource(options.url, {
		headers: options.headers,
		pollingInterval: 0,
		timeoutBeforeConnection: 250,
		withCredentials: false,
	});

	let isClosed = false;

	const finalizeClose = () => {
		if (isClosed) {
			return;
		}
		isClosed = true;
		options.onClose();
	};

	const forwardEvent: EventSourceListener<string> = (event) => {
		if (!event?.type || typeof event.data === "undefined" || event.data === null) {
			return;
		}
		options.onEvent({
			event: event.type,
			data:
				typeof event.data === "string"
					? event.data
					: JSON.stringify(event.data),
		});
	};

	const handleCloseEvent = () => {
		options.signal.removeEventListener("abort", abortHandler);
		eventSource.removeAllEventListeners();
		finalizeClose();
	};

	const abortHandler = () => {
		handleCloseEvent();
		eventSource.close();
	};

	options.signal.addEventListener("abort", abortHandler);

	eventSource.addEventListener("open", () => {
		options.onOpen?.();
	});

	eventSource.addEventListener("close", () => {
		handleCloseEvent();
	});

	eventSource.addEventListener("error", (error) => {
		if (options.signal.aborted) {
			return;
		}
		options.onError(error instanceof Error ? error : new Error("SSE error"));
	});

	["message", "search_state", "match_found", "heartbeat"].forEach(
		(eventName) => {
			eventSource.addEventListener(eventName as any, forwardEvent);
		}
	);

	return () => {
		abortHandler();
	};
}
