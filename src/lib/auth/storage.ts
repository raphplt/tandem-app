import { env } from "@/src/config/env";
import * as SecureStore from "expo-secure-store";

let memoryStore: Record<string, string> = {};
let isInitialized = false;
let initPromise: Promise<void> | null = null;

//TODO : ajouter un mécanisme de verrouillage pour éviter les accès concurrents ?
//TODO : ce fichier est il bien codé ? 
async function initializeStore() {
	if (isInitialized) {
		return;
	}
	if (initPromise) {
		return initPromise;
	}

	initPromise = (async () => {
		try {
			const keys = ["session"];
			const prefix = `${env.authStoragePrefix}_`;
			const loadPromises = keys.map(async (key) => {
				const prefixedKey = `${prefix}${key}`;
				try {
					const value = await SecureStore.getItemAsync(prefixedKey);

					if (value) {
						memoryStore[prefixedKey] = value;
					}
				} catch (error) {
					console.error("[Storage] Error loading from SecureStore:", {
						key: prefixedKey,
						error,
					});
				}
			});

			//TODO : utiliser un meilleur truc que Promise.all ?
			await Promise.all(loadPromises);
			isInitialized = true;
		} catch (error) {
			console.error("[Storage] Initialization error:", error);
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

// Stockage utilisant SecureStore avec un cache en mémoire
export const storage = {
	getItem: (key: string): string | null => {
		return memoryStore[key] || null;
	},

	setItem: (key: string, value: string): void => {
		memoryStore[key] = value;
		SecureStore.setItemAsync(key, value);
	},

	removeItem: (key: string): void => {
		delete memoryStore[key];
		SecureStore.deleteItemAsync(key);
	},
};
