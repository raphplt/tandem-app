import { useAuthSession } from "@/hooks/use-auth-session";
import { env } from "@/src/config/env";
import { MATCHES_QUERY_KEY } from "@/src/hooks/use-matches";
import { apiFetch } from "@/src/lib/api/client";
import { extractErrorMessage } from "@/src/utils/error";
import type { HeartbeatEventPayload, SearchStateEventPayload } from "@/types/availability";
import type { MatchResponse } from "@/types/match";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

const SEARCH_STREAM_ENDPOINT = "/api/v1/matches/search/stream";
const JOIN_QUEUE_ENDPOINT = "/api/v1/availability/queue/join";
const LEAVE_QUEUE_ENDPOINT = "/api/v1/availability/queue/leave";
const HEARTBEAT_ENDPOINT = "/api/v1/availability/heartbeat";
const HEARTBEAT_INTERVAL_MS = 120_000;
const RECONNECT_DELAY_MS = 4_000;

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

	const [searchState, setSearchState] = useState<SearchStateEventPayload | null>(null);
	const [isSearching, setIsSearching] = useState(false);
	const [streamError, setStreamError] = useState<string | null>(null);
	const [lastHeartbeatAt, setLastHeartbeatAt] = useState<string | null>(null);

	const controllerRef = useRef<AbortController | null>(null);
	const streamCleanupRef = useRef<(() => void) | null>(null);
	const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const shouldStayConnectedRef = useRef(false);
	const isStartingRef = useRef(false);
	const isSearchingRef = useRef(false);
	const connectStreamRef = useRef<(() => void) | null>(null);

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

	const clearReconnectTimeout = useCallback(() => {
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current);
			reconnectTimeoutRef.current = null;
		}
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
		clearReconnectTimeout();
	}, [clearReconnectTimeout]);

	const stopSearch = useCallback(
		async ({ callLeave = true, silent = false }: StopSearchOptions = {}) => {
			shouldStayConnectedRef.current = false;
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

	const queueReconnect = useCallback(() => {
		if (reconnectTimeoutRef.current || !shouldStayConnectedRef.current) {
			return;
		}
		reconnectTimeoutRef.current = setTimeout(() => {
			reconnectTimeoutRef.current = null;
			connectStreamRef.current?.();
		}, RECONNECT_DELAY_MS);
	}, []);

	const connectStream = useCallback(() => {
		if (!shouldStayConnectedRef.current || controllerRef.current) {
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
					Accept: "text/event-stream",
				},
				signal: controller.signal,
				onEvent: handleStreamEvent,
				onError: (error) => {
					if (controller.signal.aborted) {
						return;
					}
					streamCleanupRef.current = null;
					controllerRef.current = null;
					setStreamError(extractErrorMessage(error));
					if (shouldStayConnectedRef.current) {
						queueReconnect();
					}
				},
				onClose: () => {
					streamCleanupRef.current = null;
					controllerRef.current = null;
					if (shouldStayConnectedRef.current) {
						queueReconnect();
					}
				},
			});

			streamCleanupRef.current = cleanup;
			setStreamError(null);
		} catch (error) {
			controllerRef.current = null;
			streamCleanupRef.current = null;
			setStreamError(extractErrorMessage(error));
			queueReconnect();
		}
	}, [handleStreamEvent, queueReconnect, sessionToken, updateIsSearching]);

	useEffect(() => {
		connectStreamRef.current = connectStream;
	}, [connectStream]);

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
			shouldStayConnectedRef.current = true;
			updateIsSearching(true);
			const joined = await joinQueue();
			if (!joined) {
				throw new Error("Impossible de rejoindre la file d'attente.");
			}
			await sendHeartbeat(true);
			startHeartbeatLoop();
			connectStream();
		} catch (error) {
			shouldStayConnectedRef.current = false;
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
	if (typeof XMLHttpRequest === "undefined") {
		throw new Error("SSE is not supported in this environment.");
	}

	const xhr = new XMLHttpRequest();
	let buffer = "";
	let lastIndex = 0;
	let aborted = false;

	const abortHandler = () => {
		aborted = true;
		xhr.abort();
		options.signal.removeEventListener("abort", abortHandler);
	};

	options.signal.addEventListener("abort", abortHandler);

	xhr.onreadystatechange = () => {
		if (xhr.readyState === xhr.LOADING || xhr.readyState === xhr.DONE) {
			const chunk = xhr.responseText.substring(lastIndex);
			lastIndex = xhr.responseText.length;
			if (chunk) {
				buffer += chunk.replace(/\r\n/g, "\n");
				let boundaryIndex = buffer.indexOf("\n\n");
				while (boundaryIndex !== -1) {
					const rawEvent = buffer.slice(0, boundaryIndex);
					buffer = buffer.slice(boundaryIndex + 2);
					const parsed = parseSseEvent(rawEvent);
					if (parsed) {
						options.onEvent(parsed);
					}
					boundaryIndex = buffer.indexOf("\n\n");
				}
			}
		}

		if (xhr.readyState === xhr.DONE) {
			if (buffer.trim().length > 0) {
				const parsed = parseSseEvent(buffer);
				buffer = "";
				if (parsed) {
					options.onEvent(parsed);
				}
			}
			options.signal.removeEventListener("abort", abortHandler);
			options.onClose();
		}
	};

	xhr.onerror = () => {
		options.signal.removeEventListener("abort", abortHandler);
		if (!aborted) {
			options.onError(new Error("SSE connection error"));
		}
	};

	xhr.open("GET", options.url, true);
	xhr.setRequestHeader("Accept", "text/event-stream");
	Object.entries(options.headers ?? {}).forEach(([key, value]) => {
		if (value) {
			xhr.setRequestHeader(key, value);
		}
	});
	xhr.send();

	return () => {
		abortHandler();
	};
}

function parseSseEvent(block: string): SSEMessage | null {
	const trimmed = block.trim();
	if (!trimmed) {
		return null;
	}

	const lines = trimmed.split("\n");
	let eventName = "message";
	const dataLines: string[] = [];

	for (const line of lines) {
		if (!line || line.startsWith(":")) {
			continue;
		}
		const colonIndex = line.indexOf(":");
		if (colonIndex === -1) {
			continue;
		}
		const field = line.slice(0, colonIndex).trim();
		let value = line.slice(colonIndex + 1);
		if (value.startsWith(" ")) {
			value = value.slice(1);
		}

		if (field === "event" && value) {
			eventName = value;
		} else if (field === "data") {
			dataLines.push(value);
		}
	}

	if (dataLines.length === 0) {
		return null;
	}

	return {
		event: eventName,
		data: dataLines.join("\n"),
	};
}
