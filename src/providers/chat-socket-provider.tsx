import { useAuthSession } from "@/hooks/use-auth-session";
import { env } from "@/src/config/env";
import { apiFetch } from "@/src/lib/api/client";
import type {
	CreateMessageDto,
	MessageResponse,
	UpdateMessageDto,
} from "@/types/message";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";

type MessageAck =
	| { status: "ok"; message: MessageResponse }
	| { status: "error"; error: string };

type SimpleAck = { status: "ok" } | { status: "error"; error: string };

interface ChatSocketContextValue {
	socket: Socket | null;
	isConnected: boolean;
	joinConversation: (conversationId: string) => void;
	leaveConversation: (conversationId: string) => void;
	sendMessage: (payload: CreateMessageDto) => Promise<MessageResponse>;
	updateMessage: (
		messageId: string,
		update: UpdateMessageDto
	) => Promise<MessageResponse>;
	deleteMessage: (messageId: string) => Promise<MessageResponse>;
	markConversationRead: (conversationId: string) => Promise<void>;
	acknowledgeMessage: (messageId: string) => Promise<void>;
	sendTypingStart: (conversationId: string) => void;
	sendTypingStop: (conversationId: string) => void;
}

const ChatSocketContext = createContext<ChatSocketContextValue | undefined>(
	undefined
);

function emitWithAck<T extends MessageAck | SimpleAck>(
	socket: Socket,
	event: string,
	payload: unknown
): Promise<T> {
	return new Promise((resolve, reject) => {
		socket.timeout(5000).emit(event, payload, (err: unknown, ack: T) => {
			if (err) {
				reject(err);
				return;
			}
			if (!ack) {
				reject(new Error("No acknowledgement received"));
				return;
			}
			if ("status" in ack && ack.status === "error") {
				reject(new Error(ack.error ?? "Socket error"));
				return;
			}
			resolve(ack);
		});
	});
}

export function ChatSocketProvider({ children }: { children: ReactNode }) {
	const { data: session } = useAuthSession();
	const token = session?.sessionToken;
	const socketRef = useRef<Socket | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	// Queue d'acks en attente (pour gérer les déconnexions)
	const pendingAcksRef = useRef<Set<string>>(new Set());
	// Ref pour stocker la fonction d'acknowledge pour la reconnexion
	const acknowledgeMessageViaSocketRef = useRef<
		((messageId: string) => Promise<void>) | null
	>(null);

	// Fonction interne pour envoyer un ack via WebSocket
	const acknowledgeMessageViaSocket = useCallback(
		async (messageId: string) => {
			if (!socketRef.current || !isConnected) {
				// Si déconnecté, ajouter à la queue
				pendingAcksRef.current.add(messageId);
				return;
			}
			try {
				socketRef.current.emit("message.delivery.ack", { messageId });
				// Retirer de la queue si présent
				pendingAcksRef.current.delete(messageId);
			} catch (error) {
				// En cas d'erreur, ajouter à la queue pour retry
				pendingAcksRef.current.add(messageId);
				throw error;
			}
		},
		[isConnected]
	);

	// Stocker la fonction dans la ref pour l'utiliser dans handleConnect
	acknowledgeMessageViaSocketRef.current = acknowledgeMessageViaSocket;

	useEffect(() => {
		if (!token) {
			if (socketRef.current) {
				socketRef.current.disconnect();
				socketRef.current = null;
			}
			setIsConnected(false);
			return;
		}

		const socket = io(`${env.baseURL}/chat`, {
			transports: ["websocket", "polling"],
			autoConnect: false,
			auth: {
				token: token,
			},
			query: {
				token: token,
			},
			extraHeaders: {
				Authorization: `Bearer ${token}`,
			},
		});

		socketRef.current = socket;

		const handleConnect = () => {
			setIsConnected(true);
			// Rejouer les acks en attente lors de la reconnexion
			if (
				pendingAcksRef.current.size > 0 &&
				acknowledgeMessageViaSocketRef.current
			) {
				const acksToReplay = Array.from(pendingAcksRef.current);
				pendingAcksRef.current.clear();
				acksToReplay.forEach((messageId) => {
					acknowledgeMessageViaSocketRef.current?.(messageId).catch(() => {
						// Si l'émission échoue, remettre dans la queue
						pendingAcksRef.current.add(messageId);
					});
				});
			}
		};

		const handleDisconnect = () => {
			setIsConnected(false);
		};

		socket.on("connect", handleConnect);
		socket.on("disconnect", handleDisconnect);
		socket.connect();

		return () => {
			socket.off("connect", handleConnect);
			socket.off("disconnect", handleDisconnect);
			socket.disconnect();
			socketRef.current = null;
		};
	}, [token]);

	const joinConversation = useCallback((conversationId: string) => {
		socketRef.current?.emit("conversation.join", { conversationId });
	}, []);

	const leaveConversation = useCallback((conversationId: string) => {
		socketRef.current?.emit("conversation.leave", { conversationId });
	}, []);

	const sendMessage = useCallback(async (payload: CreateMessageDto) => {
		if (!socketRef.current) {
			throw new Error("Socket not connected");
		}
		const ack = (await emitWithAck<MessageAck>(
			socketRef.current,
			"message.send",
			payload
		)) as Extract<MessageAck, { status: "ok" }>;
		return ack.message;
	}, []);

	const updateMessage = useCallback(
		async (messageId: string, update: UpdateMessageDto) => {
			if (!socketRef.current) {
				throw new Error("Socket not connected");
			}
			const ack = (await emitWithAck<MessageAck>(
				socketRef.current,
				"message.update",
				{ messageId, update }
			)) as Extract<MessageAck, { status: "ok" }>;
			return ack.message;
		},
		[]
	);

	const deleteMessage = useCallback(async (messageId: string) => {
		if (!socketRef.current) {
			throw new Error("Socket not connected");
		}
		const ack = (await emitWithAck<MessageAck>(
			socketRef.current,
			"message.delete",
			{ messageId }
		)) as Extract<MessageAck, { status: "ok" }>;
		return ack.message;
	}, []);

	const markConversationRead = useCallback(async (conversationId: string) => {
		if (!socketRef.current) {
			throw new Error("Socket not connected");
		}
		await emitWithAck<SimpleAck>(socketRef.current, "message.read", {
			conversationId,
		});
	}, []);

	// Fonction publique pour confirmer la réception d'un message
	const acknowledgeMessage = useCallback(
		async (messageId: string) => {
			// Essayer d'abord via WebSocket
			if (socketRef.current && isConnected) {
				try {
					await acknowledgeMessageViaSocket(messageId);
					return;
				} catch {
					// Si échec, fallback sur REST
				}
			}

			// Fallback REST si WebSocket indisponible
			try {
				const result = await apiFetch(`/api/v1/messages/${messageId}/acknowledge`, {
					method: "POST",
				});
				if (result.error) {
					// Si REST échoue aussi, ajouter à la queue pour retry plus tard
					pendingAcksRef.current.add(messageId);
					throw new Error(result.error.message as string);
				}
				// Retirer de la queue si présent
				pendingAcksRef.current.delete(messageId);
			} catch (error) {
				// En cas d'erreur réseau, ajouter à la queue
				pendingAcksRef.current.add(messageId);
				throw error;
			}
		},
		[isConnected, acknowledgeMessageViaSocket]
	);

	const sendTypingStart = useCallback(
		(conversationId: string) => {
			if (!socketRef.current || !isConnected) return;
			socketRef.current.emit("typing.start", { conversationId });
		},
		[isConnected]
	);

	const sendTypingStop = useCallback(
		(conversationId: string) => {
			if (!socketRef.current || !isConnected) return;
			socketRef.current.emit("typing.stop", { conversationId });
		},
		[isConnected]
	);

	const value = useMemo<ChatSocketContextValue>(
		() => ({
			socket: socketRef.current,
			isConnected,
			joinConversation,
			leaveConversation,
			sendMessage,
			updateMessage,
			deleteMessage,
			markConversationRead,
			acknowledgeMessage,
			sendTypingStart,
			sendTypingStop,
		}),
		[
			isConnected,
			joinConversation,
			leaveConversation,
			sendMessage,
			updateMessage,
			deleteMessage,
			markConversationRead,
			acknowledgeMessage,
			sendTypingStart,
			sendTypingStop,
		]
	);

	return (
		<ChatSocketContext.Provider value={value}>
			{children}
		</ChatSocketContext.Provider>
	);
}

export function useChatSocket() {
	const context = useContext(ChatSocketContext);
	if (!context) {
		throw new Error("useChatSocket must be used within ChatSocketProvider");
	}
	return context;
}
