import { apiFetch } from "@/src/lib/api/client";
import type { MessageResponse } from "@/types/message";
import { useQuery } from "@tanstack/react-query";

const MESSAGES_KEY = ["messages"];

function normalizeMessages(messages: MessageResponse[]) {
	return [...messages].sort(
		(a, b) =>
			new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
	);
}

export function useMessages(
	conversationId?: string,
	options?: { limit?: number }
) {
	const { limit = 50 } = options ?? {};

	return useQuery({
		queryKey: [...MESSAGES_KEY, conversationId, limit],
		enabled: Boolean(conversationId),
		queryFn: async () => {
			const endpoint = `/api/v1/messages?conversationId=${conversationId}&limit=${limit}&offset=0`;
			const result = await apiFetch<MessageResponse[]>(endpoint);
			if (result.error) {
				throw new Error(
					Array.isArray(result.error.message)
						? result.error.message.join(" • ")
						: result.error.message
				);
			}
			return normalizeMessages(result.data ?? []);
		},
	});
}

