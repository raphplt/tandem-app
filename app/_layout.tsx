import { CustomIntlayerProvider } from "@/components/intlayer-provider";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeStore } from "@/hooks/use-theme-store";
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
				<CustomIntlayerProvider>
					<Stack>
						<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
						<Stack.Screen
							name="modal"
							options={{ presentation: "modal", title: "Modal" }}
						/>
					</Stack>
				</CustomIntlayerProvider>
				<StatusBar style="auto" />
			</ThemeProvider>
		</GluestackUIProvider>
	);
}
