import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";

import { env } from "@/src/config/env";
import { apiFetch } from "@/src/lib/api/client";
import { ensureInitialized, storage } from "@/src/lib/auth/storage";
import { extractErrorMessage } from "@/src/utils/error";

//TODO : au global ce fichier avait été pas mal modifié car j'ai eu des soucis avec la gestion de la session, mais maintenant c'est réglé (on passe par bearer), donc voir si on peut simplifier certaines choses

export type AuthResponse = {
	sessionToken?: string;
	expiresIn?: number;
	user?: {
		id: string;
		email: string;
		firstName?: string;
		lastName?: string;
		roles?: string[];
		[key: string]: unknown;
	};
	[key: string]: unknown;
};

type AuthState = {
	data: AuthResponse | null;
	isLoading: boolean;
	isRefetching: boolean;
	error: string | null;
};

type AuthContextValue = AuthState & {
	refetch: () => Promise<void>;
	setSession: (session: AuthResponse | null) => void;
	clearSession: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadSessionFromStorage(): AuthResponse | null {
	try {
		const prefixedKey = `${env.authStoragePrefix}_session`;
		const sessionStr = storage.getItem(prefixedKey);

		if (!sessionStr) {
			return null;
		}
		const session = JSON.parse(sessionStr) as AuthResponse;

		return session;
	} catch (error) {
		console.error("[Auth] Error loading session from storage:", error);
		return null;
	}
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<AuthState>({
		data: null,
		isLoading: true,
		isRefetching: false,
		error: null,
	});

	const setSession = useCallback((session: AuthResponse | null) => {
		if (session) {
			const minimal: AuthResponse = {
				sessionToken: session.sessionToken,
				expiresIn: session.expiresIn,
				user: session.user,
			};
			const prefixedKey = `${env.authStoragePrefix}_session`;
			storage.setItem(prefixedKey, JSON.stringify(minimal));
		} else {
			const prefixedKey = `${env.authStoragePrefix}_session`;
			storage.removeItem(prefixedKey);
		}

		setState({
			data: session,
			isLoading: false,
			isRefetching: false,
			error: null,
		});
	}, []);

	// Méthode pour effacer la session
	const clearSession = useCallback(() => {
		storage.removeItem(`${env.authStoragePrefix}_session`);
		setState({
			data: null,
			isLoading: false,
			isRefetching: false,
			error: null,
		});
	}, []);

	// Méthode pour refetcher le profil utilisateur
	const refetch = useCallback(async () => {
		const existingSessionBeforeRefetch = loadSessionFromStorage();
		setState((prev) => ({
			data: prev.data,
			isLoading: prev.data === null,
			isRefetching: prev.data !== null,
			error: null,
		}));

		try {
			const result = await apiFetch<{ user?: AuthResponse["user"] }>(
				"/api/v1/auth/profile",
				{ method: "GET" }
			);

			if (result?.error) {
				const status =
					(result.error as { status?: number; statusCode?: number }).status ??
					(result.error as { status?: number; statusCode?: number }).statusCode;
				const message = status === 401 ? null : extractErrorMessage(result.error);

				//TODO : ce n'est pas très propre tout ça... est ce qu'il ne faut pas carrément supprimer ca ? je ne comprends pas trop l'intérêt
				if (status === 401 && existingSessionBeforeRefetch) {
					setState({
						data: existingSessionBeforeRefetch,
						isLoading: false,
						isRefetching: false,
						error: null,
					});
					return;
				}

				setState({
					data: null,
					isLoading: false,
					isRefetching: false,
					error: message,
				});
				return;
			}

			const payload = (result?.data ?? null) as {
				user?: AuthResponse["user"];
			} | null;
			const existingSession = loadSessionFromStorage();
			//TODO : idem, revoir tout ça (c'est peut etre bien mais je comprends pas trop l'intérêt, du moins les opérateurs tertiaries imbriqué c'est pas super lisible)
			const mergedSession: AuthResponse | null = existingSession
				? { ...existingSession, user: payload?.user || existingSession?.user }
				: payload
				? ({ ...payload } as unknown as AuthResponse)
				: null;

			if (mergedSession) {
				storage.setItem(
					`${env.authStoragePrefix}_session`,
					JSON.stringify(mergedSession)
				);
			}

			setState({
				data: mergedSession,
				isLoading: false,
				isRefetching: false,
				error: null,
			});
		} catch (error) {
			const existingSession = loadSessionFromStorage();
			if (existingSession) {
				setState({
					data: existingSession,
					isLoading: false,
					isRefetching: false,
					error: null,
				});
			} else {
				setState({
					data: null,
					isLoading: false,
					isRefetching: false,
					error: extractErrorMessage(error),
				});
			}
		}
	}, []);

	useEffect(() => {
		let mounted = true;

		async function initialize() {
			try {
				await ensureInitialized();
				if (!mounted) return;

				const savedSession = loadSessionFromStorage();

				if (savedSession) {
					setState((prev) => ({
						...prev,
						data: savedSession,
						isLoading: false,
					}));
					refetch();
				} else {
					await refetch();
				}
			} catch (error) {
				if (mounted) {
					setState((prev) => ({
						...prev,
						isLoading: false,
						error: extractErrorMessage(error),
					}));
				}
			}
		}

		initialize();

		return () => {
			mounted = false;
		};
	}, [refetch]);

	const value = useMemo<AuthContextValue>(
		() => ({
			...state,
			refetch,
			setSession,
			clearSession,
		}),
		[state, refetch, setSession, clearSession]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuthContext must be used within an AuthProvider");
	}

	return context;
}
