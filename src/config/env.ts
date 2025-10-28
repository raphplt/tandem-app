import Constants from "expo-constants";

const expoConfig = Constants.expoConfig ?? (Constants.manifest as any) ?? {};
const extra = expoConfig?.extra ?? {};
const authExtra = extra?.auth ?? {};
const defaultAuthBaseURL =
	authExtra.baseURL ?? "http://localhost:3001/api/auth";

const fallbackScheme = Array.isArray(expoConfig?.scheme)
	? expoConfig.scheme[0]
	: expoConfig?.scheme;

export const env = {
	authBaseURL: process.env.EXPO_PUBLIC_AUTH_BASE_URL ?? defaultAuthBaseURL,
	authStoragePrefix:
		process.env.EXPO_PUBLIC_AUTH_STORAGE_PREFIX ??
		extra?.eas?.projectId ??
		expoConfig?.slug ??
		"tandem",
	appScheme: process.env.EXPO_PUBLIC_APP_SCHEME ?? fallbackScheme ?? "tandem",
};

