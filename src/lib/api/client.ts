import { env } from "@/src/config/env";
import { storage } from "@/src/lib/auth/storage";
import { extractErrorMessage } from "@/src/utils/error";

const API_BASE_URL = env.baseURL;

export interface ApiError {
	statusCode: number;
	message: string | string[];
	error: string;
}

type StoredSession = {
	sessionToken?: string;
	user?: unknown;
} | null;

function getStoredSession(): StoredSession {
	const key = `${env.authStoragePrefix}_session`;
	const raw = storage.getItem(key);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as StoredSession;
	} catch {
		return null;
	}
}

type ApiRequestInit = RequestInit & {
    skipAuth?: boolean;
};

export async function apiFetch<T>(
    endpoint: string,
    options: ApiRequestInit = {}
): Promise<{ data: T | null; error: ApiError | null }> {
    const { skipAuth, headers: initHeaders, ...fetchOptions } = options;
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...((initHeaders as Record<string, string>) || {}),
    };

    if (!skipAuth) {
        const session = getStoredSession();
        const bearer = session?.sessionToken;
        if (bearer) {
            headers.Authorization = `Bearer ${bearer}`;
        }
    }

	try {
        const response = await fetch(url, {
            ...fetchOptions,
            headers,
        });

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({
				statusCode: response.status,
				message: response.statusText,
				error: "Error",
			}));

			return {
				data: null,
				error: errorData as ApiError,
			};
		}

		const data = await response.json().catch(() => null);
		return { data, error: null };
	} catch (error) {
		return {
			data: null,
			error: {
				statusCode: 0,
				message: extractErrorMessage(error),
				error: "Network Error",
			} as ApiError,
		};
	}
}
