import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";

import { env } from "@/src/config/env";
import { ensureInitialized, storage } from "./storage";

interface ApiResponse {
	config: {
		url?: string;
	};
	data?: any;
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
		if (response.config.url?.includes("/logout")) {
			storage.removeItem(`${env.authStoragePrefix}_session`);
		}
	},
});

ensureInitialized().catch(() => {});
