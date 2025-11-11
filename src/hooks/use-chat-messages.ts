import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { useAuthSession } from "@/hooks/use-auth-session";
import { useMessages } from "@/src/hooks/use-messages";
import { useChatSocket } from "@/src/providers/chat-socket-provider";
import type {
	CreateMessageDto,
	MessageResponse,
	UpdateMessageDto,
} from "@/types/message";

function upsertMessage(list: MessageResponse[], incoming: MessageResponse) {
	const index = list.findIndex((msg) => msg.id === incoming.id);
	if (index === -1) {
		return [...list, incoming].sort(
			(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
		);
	}
	const updated = [...list];
	updated[index] = incoming;
	return updated;
}

export function useChatMessages(conversationId?: string, limit = 50) {
	const {
		socket,
		joinConversation,
		leaveConversation,
		sendMessage: emitSendMessage,
		updateMessage: emitUpdateMessage,
		deleteMessage: emitDeleteMessage,
		markConversationRead,
		acknowledgeMessage,
		sendTypingStart,
		sendTypingStop,
	} = useChatSocket();
	const { data: session } = useAuthSession();
	const queryClient = useQueryClient();
	const messagesQuery = useMessages(conversationId, { limit });
	const [isPartnerTyping, setIsPartnerTyping] = useState(false);

	const queryKey = useMemo(
		() => ["messages", conversationId, limit] as const,
		[conversationId, limit]
	);

	useEffect(() => {
		if (!conversationId || !socket) {
			return;
		}

		const handleNewMessage = (message: MessageResponse) => {
			if (message.conversationId !== conversationId) return;
			queryClient.setQueryData<MessageResponse[]>(queryKey, (prev = []) =>
				upsertMessage(prev, message)
			);

			// Envoyer un accusé de réception si ce n'est pas notre propre message
			if (message.authorId !== session?.user?.id) {
				// Délai court pour s'assurer que le message est bien rendu
				setTimeout(() => {
					acknowledgeMessage(message.id).catch(() => {
						// Erreur silencieuse, l'ack sera retenté plus tard via la queue
					});
				}, 100);
			}
		};

		const handleUpdatedMessage = (message: MessageResponse) => {
			if (message.conversationId !== conversationId) return;
			queryClient.setQueryData<MessageResponse[]>(queryKey, (prev = []) =>
				upsertMessage(prev, message)
			);
		};

		const handleDeletedMessage = (message: MessageResponse) => {
			if (message.conversationId !== conversationId) return;
			queryClient.setQueryData<MessageResponse[]>(queryKey, (prev = []) =>
				upsertMessage(prev, message)
			);
		};

		const handleReadEvent = (payload: {
			conversationId: string;
			userId: string;
			unreadCount: number;
		}) => {
			if (payload.conversationId !== conversationId) return;
			// Mettre à jour tous les messages de l'utilisateur courant pour passer à "read"
			// (seulement si c'est l'autre utilisateur qui a lu)
			if (payload.userId !== session?.user?.id) {
				queryClient.setQueryData<MessageResponse[]>(queryKey, (prev = []) => {
					if (!prev) return prev;
					return prev.map((msg) => {
						// Si c'est notre message et qu'il n'est pas déjà "read", passer à "read"
						if (
							msg.authorId === session?.user?.id &&
							msg.status !== "read"
						) {
							return { ...msg, status: "read" as const };
						}
						return msg;
					});
				});
			}
		};

		const handleUserTyping = (payload: {
			conversationId: string;
			userId: string;
			isTyping: boolean;
		}) => {
			if (payload.conversationId !== conversationId) return;
			// Ne mettre à jour que si c'est l'autre utilisateur qui tape
			if (payload.userId !== session?.user?.id) {
				setIsPartnerTyping(payload.isTyping);
			}
		};

		joinConversation(conversationId);
		socket.on("message.new", handleNewMessage);
		socket.on("message.updated", handleUpdatedMessage);
		socket.on("message.deleted", handleDeletedMessage);
		socket.on("message.read", handleReadEvent);
		socket.on("user.typing", handleUserTyping);

		return () => {
			socket.off("message.new", handleNewMessage);
			socket.off("message.updated", handleUpdatedMessage);
			socket.off("message.deleted", handleDeletedMessage);
			socket.off("message.read", handleReadEvent);
			socket.off("user.typing", handleUserTyping);
			leaveConversation(conversationId);
		};
	}, [
		conversationId,
		joinConversation,
		leaveConversation,
		queryClient,
		queryKey,
		socket,
		session?.user?.id,
		acknowledgeMessage,
	]);

	const sendMessage = async (
		payload: Omit<CreateMessageDto, "conversationId"> & { content: string }
	) => {
		if (!conversationId) {
			throw new Error("Missing conversationId");
		}
		return emitSendMessage({ ...payload, conversationId });
	};

	const updateMessage = (messageId: string, update: UpdateMessageDto) => {
		return emitUpdateMessage(messageId, update);
	};

	const deleteMessage = (messageId: string) => {
		return emitDeleteMessage(messageId);
	};

	const markRead = () => {
		if (!conversationId) return Promise.resolve();
		return markConversationRead(conversationId);
	};

	return {
		messages: messagesQuery.data ?? [],
		isLoading: messagesQuery.isLoading,
		isRefetching: messagesQuery.isRefetching,
		refetch: messagesQuery.refetch,
		sendMessage,
		updateMessage,
		deleteMessage,
		markRead,
		isPartnerTyping,
		sendTypingStart: conversationId
			? () => sendTypingStart(conversationId)
			: () => {},
		sendTypingStop: conversationId
			? () => sendTypingStop(conversationId)
			: () => {},
	};
}
