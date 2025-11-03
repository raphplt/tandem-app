import { useCallback } from "react";

import { useAuthSession } from "@/hooks/use-auth-session";
import { apiFetch } from "@/src/lib/api/client";
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
		async (input: {
			email: string;
			password: string;
			draftId?: string;
			draftToken?: string;
		}) => {
			const { draftId, draftToken, ...credentials } = input;
			const result = await apiFetch<AuthResponse>("/api/v1/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...credentials,
					...(draftId ? { draftId } : {}),
					...(draftToken ? { draftToken } : {}),
				}),
			});

			if (!result.error) {
				const data = (result.data ?? null) as any;
				const minimal: AuthResponse | null = data
					? {
							sessionToken: data.sessionToken,
							expiresIn: data.expiresIn,
							user: data.user,
					  }
					: null;
				setSession(minimal);
			}

			return result;
		},
		[setSession]
	);

	const signUp = useCallback(
		async (input: {
			email: string;
			password: string;
			name?: string;
			draftId?: string;
			draftToken?: string;
		}) => {
			const { firstName, lastName } = splitFullName(input.name ?? "");
			const result = await apiFetch<AuthResponse>("/api/v1/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: input.email,
					password: input.password,
					...(firstName ? { firstName } : {}),
					...(lastName ? { lastName } : {}),
					...(input.draftId ? { draftId: input.draftId } : {}),
					...(input.draftToken ? { draftToken: input.draftToken } : {}),
				}),
			});

			if (!result.error) {
				const data = (result.data ?? null) as any;
				const minimal: AuthResponse | null = data
					? {
							sessionToken: data.sessionToken,
							expiresIn: data.expiresIn,
							user: data.user,
					  }
					: null;
				setSession(minimal);
			}

			return result;
		},
		[setSession]
	);

	const signOut = useCallback(async () => {
		try {
			// Bearer-only: call logout endpoint with Authorization header, then clear local session
			await apiFetch("/api/v1/auth/logout", { method: "POST" });
			clearSession();
		} catch (error) {
			console.error("Failed to sign out", error);
			throw error;
		}
	}, [clearSession]);

	const changePassword = useCallback(
		async (input: { currentPassword: string; newPassword: string }) => {
			return apiFetch("/api/v1/auth/change-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
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
