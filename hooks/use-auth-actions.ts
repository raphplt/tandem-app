import { useCallback } from "react";

import { useAuthSession } from "@/hooks/use-auth-session";
import { authClient } from "@/src/lib/auth/client";
import type { AuthResponse } from "@/src/providers/auth-provider";

function splitFullName(fullName: string) {
	const trimmed = fullName.trim();
	if (!trimmed) {
		return { firstName: "", lastName: "" };
	}
	const [firstName, ...rest] = trimmed.split(/\s+/);
	return {
		firstName,
		lastName: rest.length > 0 ? rest.join(" ") : "",
	};
}

export function useAuthActions() {
	const { refetch } = useAuthSession();

	const signIn = useCallback(
		async (input: { email: string; password: string }) => {
			// Use Better Auth's email sign-in to ensure cookie/session management is handled
			const result = await authClient.signIn.email({
				email: input.email,
				password: input.password,
			});

			if (!result.error) {
				await refetch();
			}

			return {
				error: result.error ?? null,
				data: (result.data ?? null) as AuthResponse | null,
			};
		},
		[refetch]
	);

	const signUp = useCallback(
		async (input: { email: string; password: string; name: string }) => {
			const { firstName, lastName } = splitFullName(input.name);
			// Use Better Auth's email sign-up
			const result = await authClient.signUp.email({
				email: input.email,
				password: input.password,
				name: `${firstName} ${lastName}`.trim(),
			});

			if (!result.error) {
				await refetch();
			}

			return result;
		},
		[refetch]
	);

	const signOut = useCallback(async () => {
		// Use better-auth's native signOut for proper session cleanup
		const result = await authClient.signOut();

		if (!result.error) {
			await refetch();
		}

		return { error: result.error, data: null };
	}, [refetch]);

	const changePassword = useCallback(
		async (input: { currentPassword: string; newPassword: string }) => {
			return authClient.$fetch("/change-password", {
				method: "POST",
				body: input,
			});
		},
		[]
	);

	return {
		signIn,
		signUp,
		signOut,
		changePassword,
	};
}
