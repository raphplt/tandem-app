import { env } from "@/src/config/env";
import { storage } from "@/src/lib/auth/storage";
import { extractErrorMessage } from "@/src/utils/error";

const API_BASE_URL = env.baseURL;

export interface ApiError {
	statusCode: number;
	message: string | string[];
	error: string;
}

function getCookies(): string | null {
	const cookieKey = `${env.authStoragePrefix}_cookie`;
	return storage.getItem(cookieKey);
}

export async function apiFetch<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<{ data: T | null; error: ApiError | null }> {
	const url = `${API_BASE_URL}${endpoint}`;

	const cookies = getCookies();
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		...((options.headers as Record<string, string>) || {}),
	};

	if (cookies) {
		headers.Cookie = cookies;
	}

	try {
		const response = await fetch(url, {
			...options,
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
