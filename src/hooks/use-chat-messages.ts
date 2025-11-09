import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

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
	} = useChatSocket();
	const queryClient = useQueryClient();
	const messagesQuery = useMessages(conversationId, { limit });

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

		joinConversation(conversationId);
		socket.on("message.new", handleNewMessage);
		socket.on("message.updated", handleUpdatedMessage);
		socket.on("message.deleted", handleDeletedMessage);

		return () => {
			socket.off("message.new", handleNewMessage);
			socket.off("message.updated", handleUpdatedMessage);
			socket.off("message.deleted", handleDeletedMessage);
			leaveConversation(conversationId);
		};
	}, [
		conversationId,
		joinConversation,
		leaveConversation,
		queryClient,
		queryKey,
		socket,
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
	};
}
