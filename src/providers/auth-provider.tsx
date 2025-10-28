import { env } from "@/src/config/env";
import { authClient } from "@/src/lib/auth/client";
import * as SecureStore from "expo-secure-store";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";

export type AuthResponse = {
	token?: string;
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

const SESSION_STORAGE_KEY = `${env.authStoragePrefix}_session_state`;

export function AuthProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<AuthState>({
		data: null,
		isLoading: true,
		isRefetching: false,
		error: null,
	});
	const mountedRef = useRef(true);

	useEffect(() => () => {
		mountedRef.current = false;
	}, []);

	const safeSetState = useCallback(
		(updater: AuthState | ((prev: AuthState) => AuthState)) => {
			if (!mountedRef.current) return;
			setState((prev) => (typeof updater === "function" ? (updater as any)(prev) : updater));
		},
		[]
	);

	const refetch = useCallback(async () => {
		safeSetState((prev) => ({
			data: prev.data,
			isLoading: prev.data === null,
			isRefetching: prev.data !== null,
			error: null,
		}));

		try {
			const result = await authClient.$fetch("/profile", { method: "GET" });
			if (result.error) {
				safeSetState({ data: null, isLoading: false, isRefetching: false, error: null });
				await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
			} else if (result.data) {
				const sessionData = result.data as AuthResponse;
				safeSetState({ data: sessionData, isLoading: false, isRefetching: false, error: null });
				await SecureStore.setItemAsync(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
			}
		} catch (e) {
			safeSetState((prev) => ({ ...prev, isLoading: false, isRefetching: false }));
		}
	}, [safeSetState]);

	// restore persisted snapshot then validate against backend
	useEffect(() => {
		let active = true;
		(async () => {
			try {
				const stored = await SecureStore.getItemAsync(SESSION_STORAGE_KEY);
				if (stored && active) {
					safeSetState({ data: JSON.parse(stored), isLoading: false, isRefetching: false, error: null });
				}
			} finally {
				if (active) await refetch();
			}
		})();
		return () => {
			active = false;
		};
	}, [refetch, safeSetState]);

	// Listen to Better Auth cookie changes to refetch session
	useEffect(() => {
		const unsubscribe = authClient.$store.listen("$sessionSignal", () => {
			void refetch();
		}) as (() => void) | void;
		return () => unsubscribe?.();
	}, [refetch]);

	const setSession = useCallback(async (session: AuthResponse | null) => {
		if (session) {
			await SecureStore.setItemAsync(SESSION_STORAGE_KEY, JSON.stringify(session));
		} else {
			await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
		}
		safeSetState({ data: session, isLoading: false, isRefetching: false, error: null });
	}, [safeSetState]);

	const clearSession = useCallback(async () => {
		await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
		safeSetState({ data: null, isLoading: false, isRefetching: false, error: null });
	}, [safeSetState]);

	const value = useMemo<AuthContextValue>(
		() => ({ ...state, refetch, setSession, clearSession }),
		[state, refetch, setSession, clearSession]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuthContext must be used within an AuthProvider");
	return context;
}
