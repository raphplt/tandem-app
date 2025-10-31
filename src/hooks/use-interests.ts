import { apiFetch } from "@/src/lib/api/client";
import type { InterestResponseDto } from "@/types/interest";
import { useQuery } from "@tanstack/react-query";

const INTERESTS_KEY = ["interests"];

export function useInterests() {
	return useQuery({
		queryKey: [...INTERESTS_KEY, "all"],
		queryFn: async () => {
			const result = await apiFetch<InterestResponseDto[]>("/api/v1/interests");
			if (result.error) {
				throw new Error(
					typeof result.error.message === "string"
						? result.error.message
						: result.error.message[0]
				);
			}
			return result.data || [];
		},
	});
}

export function usePopularInterests(limit = 10) {
	return useQuery({
		queryKey: [...INTERESTS_KEY, "popular", limit],
		queryFn: async () => {
			const result = await apiFetch<InterestResponseDto[]>(
				`/api/v1/interests/popular?limit=${limit}`
			);
			if (result.error) {
				throw new Error(
					typeof result.error.message === "string"
						? result.error.message
						: result.error.message[0]
				);
			}
			return result.data || [];
		},
	});
}

export function useSearchInterests(query: string, limit = 20) {
	return useQuery({
		queryKey: [...INTERESTS_KEY, "search", query, limit],
		queryFn: async () => {
			const result = await apiFetch<InterestResponseDto[]>(
				`/api/v1/interests/search?q=${encodeURIComponent(query)}&limit=${limit}`
			);
			if (result.error) {
				throw new Error(
					typeof result.error.message === "string"
						? result.error.message
						: result.error.message[0]
				);
			}
			return result.data || [];
		},
		enabled: query.length > 0,
	});
}
