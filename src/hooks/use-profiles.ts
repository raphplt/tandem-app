import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/src/lib/api/client";
import type {
	CreateProfileDto,
	ProfileResponseDto,
	UpdateProfileDto,
} from "@/types/profile";

const PROFILES_KEY = ["profiles"];

export function useMyProfile() {
	return useQuery({
		queryKey: [...PROFILES_KEY, "my"],
		queryFn: async () => {
			const result = await apiFetch<ProfileResponseDto>("/api/v1/profiles/my");
			if (result.error) {
				if (result.error.statusCode === 404) {
					return null;
				}
				throw new Error(
					typeof result.error.message === "string"
						? result.error.message
						: result.error.message[0]
				);
			}
			return result.data;
		},
	});
}

export function useCreateProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateProfileDto) => {
			const result = await apiFetch<ProfileResponseDto>("/api/v1/profiles", {
				method: "POST",
				body: JSON.stringify(data),
			});

			if (result.error) {
				throw new Error(
					typeof result.error.message === "string"
						? result.error.message
						: result.error.message[0]
				);
			}

			return result.data!;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PROFILES_KEY });
		},
	});
}

export function useUpdateProfile(profileId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: UpdateProfileDto) => {
			const result = await apiFetch<ProfileResponseDto>(
				`/api/v1/profiles/${profileId}`,
				{
					method: "PATCH",
					body: JSON.stringify(data),
				}
			);

			if (result.error) {
				throw new Error(
					typeof result.error.message === "string"
						? result.error.message
						: result.error.message[0]
				);
			}

			return result.data!;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PROFILES_KEY });
		},
	});
}

