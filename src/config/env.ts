import Constants from "expo-constants";

const expoConfig = Constants.expoConfig ?? (Constants.manifest as any) ?? {};
const extra = expoConfig?.extra ?? {};
const authExtra = extra?.auth ?? {};
const defaultAuthBaseURL = authExtra.baseURL ?? "http://localhost:3001/api/v1";

const fallbackScheme = Array.isArray(expoConfig?.scheme)
	? expoConfig.scheme[0]
	: expoConfig?.scheme;

export const env = {
	authBaseURL:
		process.env.EXPO_PUBLIC_AUTH_BASE_URL ??
		process.env.EXPO_PUBLIC_API_URL ??
		defaultAuthBaseURL,
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
