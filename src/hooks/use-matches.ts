import { apiFetch } from "@/src/lib/api/client";
import { unwrapApiResponse } from "@/src/lib/api/unwrap";
import type { MatchResponse } from "@/types/match";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const MATCHES_KEY = ["matches"];

function buildDailyMatchEndpoint(date?: string) {
	const base = "/api/v1/matches/daily";
	if (!date) {
		return base;
	}
	return `${base}?date=${encodeURIComponent(date)}`;
}

function invalidateMatchQueries(queryClient: ReturnType<typeof useQueryClient>) {
	queryClient.invalidateQueries({ queryKey: MATCHES_KEY });
	queryClient.invalidateQueries({ queryKey: [...MATCHES_KEY, "daily"] });
}

export function useDailyMatch(date?: string) {
	return useQuery({
		queryKey: [...MATCHES_KEY, "daily", date ?? "today"],
		queryFn: async () => {
			const endpoint = buildDailyMatchEndpoint(date);
			const result = await apiFetch<MatchResponse | null>(endpoint);
			if (result.error) {
				throw new Error(
					Array.isArray(result.error.message)
						? result.error.message.join(" • ")
						: result.error.message
				);
			}
			return result.data ?? null;
		},
		staleTime: 30_000,
	});
}

export function useMatches() {
	return useQuery({
		queryKey: [...MATCHES_KEY, "me"],
		queryFn: async () => {
			const matches = await unwrapApiResponse<MatchResponse[]>(
				apiFetch("/api/v1/matches/me"),
				{ fallbackMessage: "No matches found" }
			);
			return matches;
		},
	});
}

export function useAcceptMatch() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (matchId: string) => {
			return unwrapApiResponse<MatchResponse>(
				apiFetch(`/api/v1/matches/${matchId}/accept`, {
					method: "POST",
				})
			);
		},
		onSuccess: () => {
			invalidateMatchQueries(queryClient);
		},
	});
}

export function useRejectMatch() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			matchId,
			reason,
		}: {
			matchId: string;
			reason?: string;
		}) => {
			return unwrapApiResponse<MatchResponse>(
				apiFetch(`/api/v1/matches/${matchId}/reject`, {
					method: "POST",
					body: reason ? JSON.stringify({ reason }) : undefined,
				})
			);
		},
		onSuccess: () => {
			invalidateMatchQueries(queryClient);
		},
	});
}

export function useCancelMatch() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (matchId: string) => {
			return unwrapApiResponse<MatchResponse>(
				apiFetch(`/api/v1/matches/${matchId}/cancel`, {
					method: "POST",
				})
			);
		},
		onSuccess: () => {
			invalidateMatchQueries(queryClient);
		},
	});
}

