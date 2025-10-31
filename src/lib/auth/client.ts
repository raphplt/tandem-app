import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";

import { env } from "@/src/config/env";
import { ensureInitialized, storage } from "./storage";

interface ApiResponse {
	config: {
		url?: string;
	};
	data?: any;
	headers?: {
		"set-cookie"?: string | string[];
	};
}

export function getAccessToken(): string | null {
	try {
		const prefix = env.authStoragePrefix + "_";
		const sessionStr = storage.getItem(`${prefix}session`);
		if (!sessionStr) return null;
		const session = JSON.parse(sessionStr);
		return session?.accessToken || null;
	} catch {
		return null;
	}
}

export function getAuthHeaders(): Record<string, string> | undefined {
	const token = getAccessToken();
	if (!token) return undefined;
	return {
		Authorization: `Bearer ${token}`,
	};
}

export const authClient = createAuthClient({
	baseURL: env.authBaseURL,
	plugins: [
		expoClient({
			storage,
			storagePrefix: env.authStoragePrefix,
			scheme: env.appScheme,
		}),
	],
	onSuccess: (response: ApiResponse) => {
		const cookies = response.headers?.["set-cookie"];
		if (cookies) {
			const cookieValue = Array.isArray(cookies) ? cookies.join("; ") : cookies;
			storage.setItem(`${env.authStoragePrefix}_cookie`, cookieValue);
		}

		if (response.config.url?.includes("/logout")) {
			storage.removeItem(`${env.authStoragePrefix}_session`);
			storage.removeItem(`${env.authStoragePrefix}_cookie`);
		}
	},
});

ensureInitialized().catch(() => {});
