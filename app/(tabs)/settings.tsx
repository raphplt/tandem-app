import { useLocale } from "@/hooks/use-locale";
import { useThemeStore, type ThemeMode } from "@/hooks/use-theme-store";
import { Trans } from "@lingui/react/macro";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
	const { mode, setMode } = useThemeStore();
	const { locale, changeLocale } = useLocale();

	const handleThemeChange = (newMode: ThemeMode) => {
		setMode(newMode);
	};

	const handleLocaleChange = (newLocale: "en" | "fr") => {
		changeLocale(newLocale);
	};

	const themeOptions = [
		{
			value: "light" as ThemeMode,
			label: <Trans id="settings-screen.light">Light</Trans>,
		},
		{
			value: "dark" as ThemeMode,
			label: <Trans id="settings-screen.dark">Dark</Trans>,
		},
		{
			value: "system" as ThemeMode,
			label: <Trans id="settings-screen.system">System</Trans>,
		},
	];

	const localeOptions: {
		value: "en" | "fr";
		label: React.ReactNode;
	}[] = [
		{ value: "en", label: <Trans id="settings-screen.english">English</Trans> },
		{ value: "fr", label: <Trans id="settings-screen.french">French</Trans> },
	];

	return (
		<SafeAreaView className="flex-1  p-6">
			<View>
				<Text className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8">
					<Trans id="settings-screen.title">Settings</Trans>
				</Text>

				{/* Language Section */}
				<View className="mb-8">
					<Text className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
						<Trans id="settings-screen.language">Language</Trans>
					</Text>
					<View className="space-y-2">
						{localeOptions.map((option) => (
							<TouchableOpacity
								key={option.value}
								onPress={() => handleLocaleChange(option.value)}
								className={`p-4 rounded-lg border-2 ${
									locale === option.value
										? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
										: "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
								}`}
							>
								<Text
									className={`text-lg ${
										locale === option.value
											? "text-blue-600 dark:text-blue-400 font-semibold"
											: "text-gray-700 dark:text-gray-300"
									}`}
								>
									{option.label}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>

				{/* Theme Section */}
				<View>
					<Text className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
						<Trans id="settings-screen.theme">Theme</Trans>
					</Text>
					<View className="space-y-2">
						{themeOptions.map((option) => (
							<TouchableOpacity
								key={option.value}
								onPress={() => handleThemeChange(option.value)}
								className={`p-4 rounded-lg border-2 ${
									mode === option.value
										? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
										: "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
								}`}
							>
								<Text
									className={`text-lg ${
										mode === option.value
											? "text-blue-600 dark:text-blue-400 font-semibold"
											: "text-gray-700 dark:text-gray-300"
									}`}
								>
									{option.label}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>
			</View>
		</SafeAreaView>
	);
}
