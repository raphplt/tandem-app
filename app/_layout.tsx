import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useLinguiLocale } from "@/hooks/use-lingui-locale";
import { useThemeStore } from "@/hooks/use-theme-store";
import { I18nProvider, i18n } from "@/src/i18n";
import { AuthProvider } from "@/src/providers/auth-provider";
import { QueryProvider } from "@/src/providers/query-provider";
import { ChatSocketProvider } from "@/src/providers/chat-socket-provider";
import {
	Fraunces_400Regular,
	Fraunces_500Medium,
	Fraunces_600SemiBold,
	Fraunces_700Bold,
	Fraunces_800ExtraBold,
	Fraunces_900Black,
} from "@expo-google-fonts/fraunces";
import {
	PlusJakartaSans_400Regular,
	PlusJakartaSans_500Medium,
	PlusJakartaSans_600SemiBold,
	PlusJakartaSans_700Bold,
	PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import "react-native-svg";
import { PostHogProvider } from "posthog-react-native";
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://eda9d819f003da054a54824f29dfd6d3@o4510342966804480.ingest.de.sentry.io/4510342969098320',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

// TODO : utile ?
SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
	anchor: "(tabs)",
};

export default Sentry.wrap(function RootLayout() {
	const colorScheme = useColorScheme();
	const { mode } = useThemeStore();
	const [fontsLoaded, fontsError] = useFonts({
		Fraunces_400Regular,
		Fraunces_500Medium,
		Fraunces_600SemiBold,
		Fraunces_700Bold,
		Fraunces_800ExtraBold,
		Fraunces_900Black,
		PlusJakartaSans_400Regular,
		PlusJakartaSans_500Medium,
		PlusJakartaSans_600SemiBold,
		PlusJakartaSans_700Bold,
		PlusJakartaSans_800ExtraBold,
		Fraunces: Fraunces_400Regular,
		"Fraunces-Bold": Fraunces_700Bold,
		"Plus Jakarta Sans": PlusJakartaSans_400Regular,
		"PlusJakartaSans-Bold": PlusJakartaSans_700Bold,
	});

	useLinguiLocale();

	useEffect(() => {
		if (fontsLoaded || fontsError) {
			SplashScreen.hideAsync();
		}
	}, [fontsLoaded, fontsError]);

	if (!fontsLoaded && !fontsError) {
		return null;
	}

	if (fontsError) {
		throw fontsError;
	}

	const getActualThemeMode = () => {
		if (mode === "system") {
			return colorScheme === "dark" ? "dark" : "light";
		}
		return mode;
	};

	const actualThemeMode = getActualThemeMode();

	return (
		<PostHogProvider
			apiKey="phc_acE9fPowwZkVHVqkTy2ynA7zf9hHIg2G23ru2yLRaof"
			options={{
				host: 'https://eu.i.posthog.com',
				enableSessionReplay: true,
			}}
			autocapture
		>
			<GluestackUIProvider mode={actualThemeMode}>
				<ThemeProvider value={
					actualThemeMode === "dark" ? DarkTheme : DefaultTheme
				}>
					<I18nProvider i18n={i18n}>
						<QueryProvider>
							<AuthProvider>
								<ChatSocketProvider>
									<Stack screenOptions={{ headerShown: false }}>
										<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
										<Stack.Screen
											name="(onboarding)"
											options={{ headerShown: false }}
										/>
									</Stack>
								</ChatSocketProvider>
							</AuthProvider>
						</QueryProvider>
					</I18nProvider>
					<StatusBar style="auto" />
				</ThemeProvider>
			</GluestackUIProvider>
		</PostHogProvider>
	);
});