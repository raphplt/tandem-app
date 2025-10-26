import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";

import { authClient } from "@/src/lib/auth/client";
import { extractErrorMessage } from "@/src/utils/error";

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

export function AuthProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<AuthState>({
		data: null,
		isLoading: true,
		isRefetching: false,
		error: null,
	});

	const setSession = useCallback((session: AuthResponse | null) => {
		setState({
			data: session,
			isLoading: false,
			isRefetching: false,
			error: null,
		});
	}, []);

	const clearSession = useCallback(() => {
		setState({
			data: null,
			isLoading: false,
			isRefetching: false,
			error: null,
		});
	}, []);

	const refetch = useCallback(async () => {
		setState((prev) => ({
			data: prev.data,
			isLoading: prev.data === null,
			isRefetching: prev.data !== null,
			error: null,
		}));

		try {
			const result = await authClient.$fetch("/profile", {
				method: "GET",
			});

			if (result?.error) {
				const status =
					(result.error as { status?: number; statusCode?: number }).status ??
					(result.error as { status?: number; statusCode?: number }).statusCode;
				const message = status === 401 ? null : extractErrorMessage(result.error);
				setState({
					data: null,
					isLoading: false,
					isRefetching: false,
					error: message,
				});
				return;
			}

			const payload = (result?.data ?? null) as AuthResponse | null;

			setState({
				data: payload,
				isLoading: false,
				isRefetching: false,
				error: null,
			});
		} catch (error) {
			setState({
				data: null,
				isLoading: false,
				isRefetching: false,
				error: extractErrorMessage(error),
			});
		}
	}, []);

	useEffect(() => {
		refetch();
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
