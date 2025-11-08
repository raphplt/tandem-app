import { apiFetch } from "@/src/lib/api/client";
import { unwrapApiResponse } from "@/src/lib/api/unwrap";
import type { ConversationResponse } from "@/types/conversation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const CONVERSATIONS_KEY = ["conversations"];

function invalidateConversationQueries(
	queryClient: ReturnType<typeof useQueryClient>
) {
	queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
	queryClient.invalidateQueries({ queryKey: [...CONVERSATIONS_KEY, "active"] });
}

export function useConversations() {
	return useQuery({
		queryKey: [...CONVERSATIONS_KEY, "me"],
		queryFn: () =>
			unwrapApiResponse<ConversationResponse[]>(
				apiFetch("/api/v1/conversations/me"),
				{ fallbackMessage: "No conversations found" }
			),
		refetchInterval: 60_000,
	});
}

export function useActiveConversation(options?: { enabled?: boolean }) {
	const { enabled = true } = options ?? {};
	return useQuery({
		queryKey: [...CONVERSATIONS_KEY, "active"],
		queryFn: () =>
			unwrapApiResponse<ConversationResponse | null>(
				apiFetch("/api/v1/conversations/active/me"),
				{ fallbackMessage: "No active conversation" }
			),
		select: (data) => data ?? null,
		enabled,
	});
}

export function useConversation(conversationId?: string) {
	return useQuery({
		queryKey: [...CONVERSATIONS_KEY, conversationId],
		enabled: Boolean(conversationId),
		queryFn: () =>
			unwrapApiResponse<ConversationResponse>(
				apiFetch(`/api/v1/conversations/${conversationId}`)
			),
	});
}

export function useCreateConversationFromMatch() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (matchId: string) =>
			unwrapApiResponse<ConversationResponse>(
				apiFetch(`/api/v1/conversations/from-match/${matchId}`, {
					method: "POST",
				})
			),
		onSuccess: () => {
			invalidateConversationQueries(queryClient);
		},
	});
}

export function useExtendConversation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (conversationId: string) =>
			unwrapApiResponse<ConversationResponse>(
				apiFetch(`/api/v1/conversations/${conversationId}/extend`, {
					method: "POST",
				})
			),
		onSuccess: () => {
			invalidateConversationQueries(queryClient);
		},
	});
}

export function useCloseConversation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (conversationId: string) =>
			unwrapApiResponse<ConversationResponse>(
				apiFetch(`/api/v1/conversations/${conversationId}/close`, {
					method: "POST",
				})
			),
		onSuccess: () => {
			invalidateConversationQueries(queryClient);
		},
	});
}

export function useArchiveConversation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (conversationId: string) =>
			unwrapApiResponse<ConversationResponse>(
				apiFetch(`/api/v1/conversations/${conversationId}/archive`, {
					method: "POST",
				})
			),
		onSuccess: () => {
			invalidateConversationQueries(queryClient);
		},
	});
}

export function useMarkConversationRead() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (conversationId: string) =>
			unwrapApiResponse<ConversationResponse>(
				apiFetch(`/api/v1/conversations/${conversationId}/read`, {
					method: "POST",
				})
			),
		onSuccess: (_, conversationId) => {
			queryClient.invalidateQueries({
				queryKey: [...CONVERSATIONS_KEY, conversationId],
			});
			invalidateConversationQueries(queryClient);
		},
	});
}

