import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

import { env } from "@/src/config/env";

export const authClient = createAuthClient({
	baseURL: env.authBaseURL,
	plugins: [
		expoClient({
			storage: SecureStore,
			storagePrefix: env.authStoragePrefix,
			scheme: env.appScheme,
		}),
	],
});
