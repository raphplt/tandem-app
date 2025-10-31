import { env } from "@/src/config/env";
import * as SecureStore from "expo-secure-store";

let memoryStore: Record<string, string> = {};
let isInitialized = false;
let initPromise: Promise<void> | null = null;

async function initializeStore() {
	if (isInitialized) return;
	if (initPromise) return initPromise;

	initPromise = (async () => {
		try {
			const keys = ["session", "cookie"];
			const prefix = `${env.authStoragePrefix}_`;
			const loadPromises = keys.map(async (key) => {
				const prefixedKey = `${prefix}${key}`;
				try {
					const value = await SecureStore.getItemAsync(prefixedKey);
					if (value) {
						memoryStore[prefixedKey] = value;
					}
				} catch {
					// Ignore
				}
			});

			await Promise.all(loadPromises);
			isInitialized = true;
		} catch {
			isInitialized = true;
		}
	})();

	return initPromise;
}

export async function ensureInitialized() {
	if (!isInitialized) {
		await initializeStore();
	}
}

export const storage = {
	getItem: (key: string): string | null => {
		return memoryStore[key] || null;
	},

	setItem: (key: string, value: string): void => {
		memoryStore[key] = value;
		SecureStore.setItemAsync(key, value).catch(() => {});
	},

	removeItem: (key: string): void => {
		delete memoryStore[key];
		SecureStore.deleteItemAsync(key).catch(() => {});
	},
};
