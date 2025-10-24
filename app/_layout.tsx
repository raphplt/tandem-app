import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useLinguiLocale } from "@/hooks/use-lingui-locale";
import { useThemeStore } from "@/hooks/use-theme-store";
import { I18nProvider, i18n } from "@/src/i18n";
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

// export const unstable_settings = {
// 	anchor: "(tabs)",
// };

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const { mode } = useThemeStore();

	// Initialize LinguiJS locale management
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
					<Stack>
						<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
						<Stack.Screen
							name="modal"
							options={{ presentation: "modal", title: "Modal" }}
						/>
					</Stack>
				</I18nProvider>
				<StatusBar style="auto" />
			</ThemeProvider>
		</GluestackUIProvider>
	);
}
