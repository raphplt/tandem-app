import { useAuthSession } from "@/hooks/use-auth-session";
import { env } from "@/src/config/env";
import type { MessageResponse, CreateMessageDto, UpdateMessageDto } from "@/types/message";
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
			transports: ["websocket"],
			autoConnect: false,
			extraHeaders: {
				Authorization: `Bearer ${token}`,
			},
		});

		socketRef.current = socket;

		const handleConnect = () => setIsConnected(true);
		const handleDisconnect = () => setIsConnected(false);

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

	const sendMessage = useCallback(
		async (payload: CreateMessageDto) => {
			if (!socketRef.current) {
				throw new Error("Socket not connected");
			}
			const ack = (await emitWithAck<MessageAck>(
				socketRef.current,
				"message.send",
				payload
			)) as Extract<MessageAck, { status: "ok" }>;
			return ack.message;
		},
		[]
	);

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
		await emitWithAck<SimpleAck>(
			socketRef.current,
			"message.read",
			{ conversationId }
		);
	}, []);

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
		}),
		[
			isConnected,
			joinConversation,
			leaveConversation,
			sendMessage,
			updateMessage,
			deleteMessage,
			markConversationRead,
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
