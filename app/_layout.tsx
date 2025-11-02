import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useLinguiLocale } from "@/hooks/use-lingui-locale";
import { useThemeStore } from "@/hooks/use-theme-store";
import { I18nProvider, i18n } from "@/src/i18n";
import { AuthProvider } from "@/src/providers/auth-provider";
import { QueryProvider } from "@/src/providers/query-provider";
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "react-native-svg";

export const unstable_settings = {
	anchor: "(tabs)",
};

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const { mode } = useThemeStore();

	useLinguiLocale();

	const getActualThemeMode = () => {
		if (mode === "system") {
			return colorScheme === "dark" ? "dark" : "light";
		}
		return mode;
	};

	const actualThemeMode = getActualThemeMode();

	return (
		<GluestackUIProvider mode={actualThemeMode}>
			<ThemeProvider value={actualThemeMode === "dark" ? DarkTheme : DefaultTheme}>
				<I18nProvider i18n={i18n}>
					<QueryProvider>
						<AuthProvider>
							<Stack>
								<Stack.Screen name="(auth)" options={{ headerShown: false }} />
								<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
								<Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
							</Stack>
						</AuthProvider>
					</QueryProvider>
				</I18nProvider>
				<StatusBar style="auto" />
			</ThemeProvider>
		</GluestackUIProvider>
	);
}
