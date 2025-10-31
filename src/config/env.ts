import Constants from "expo-constants";

const expoConfig = Constants.expoConfig ?? (Constants.manifest as any) ?? {};
const extra = expoConfig?.extra ?? {};
const authExtra = extra?.auth ?? {};
const defaultAuthBaseURL = authExtra.baseURL ?? "http://localhost:3001/api/v1";

const fallbackScheme = Array.isArray(expoConfig?.scheme)
	? expoConfig.scheme[0]
	: expoConfig?.scheme;

// Nettoyer l'URL pour enlever les guillemets en trop et les espaces
function cleanUrl(url: string | undefined): string | undefined {
	if (!url) return undefined;
	return url.replace(/^["']|["']$/g, "").trim().replace(/\/$/, "");
}

const rawApiUrl = process.env.EXPO_PUBLIC_API_URL;
const cleanedApiUrl = cleanUrl(rawApiUrl);
// Si l'URL contient déjà /api/v1, on l'enlève
const baseURL = cleanedApiUrl?.replace(/\/api\/v1\/?$/, "") || "http://localhost:3001";

export const env = {
	baseURL,
	authBaseURL: cleanUrl(process.env.EXPO_PUBLIC_AUTH_BASE_URL) ?? defaultAuthBaseURL,
	authStoragePrefix:
		process.env.EXPO_PUBLIC_AUTH_STORAGE_PREFIX ??
		extra?.eas?.projectId ??
		expoConfig?.slug ??
		"tandem",
	appScheme: process.env.EXPO_PUBLIC_APP_SCHEME ?? fallbackScheme ?? "tandem",
};

if (__DEV__ && !env.authBaseURL) {
	console.warn(
		"[auth] Missing EXPO_PUBLIC_AUTH_BASE_URL. Configure it to point to the Better Auth backend."
	);
}
