import { useCallback } from "react";

import { useAuthSession } from "@/hooks/use-auth-session";
import { authClient, getAuthHeaders } from "@/src/lib/auth/client";
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
	const { setSession, clearSession } = useAuthSession();

	const signIn = useCallback(
		async (input: { email: string; password: string }) => {
			const result = await authClient.$fetch("/login", {
				method: "POST",
				body: input,
			});

			if (!result.error) {
				setSession((result.data ?? null) as AuthResponse | null);
			}

			return result;
		},
		[setSession]
	);

	const signUp = useCallback(
		async (input: { email: string; password: string; name: string }) => {
			const { firstName, lastName } = splitFullName(input.name);
			const result = await authClient.$fetch("/register", {
				method: "POST",
				body: {
					email: input.email,
					password: input.password,
					firstName,
					lastName,
				},
			});

			if (!result.error) {
				setSession((result.data ?? null) as AuthResponse | null);
			}

			return result;
		},
		[setSession]
	);

	const signOut = useCallback(async () => {
		const result = await authClient.$fetch("/logout", {
			method: "POST",
			headers: getAuthHeaders(),
		});

		if (!result.error) {
			clearSession();
		}

		return result;
	}, [clearSession]);

	const changePassword = useCallback(
		async (input: { currentPassword: string; newPassword: string }) => {
			return authClient.$fetch("/change-password", {
				method: "POST",
				body: input,
				headers: getAuthHeaders(),
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
