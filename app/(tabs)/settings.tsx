import { useLocale } from "@/hooks/use-locale";
import { useThemeStore, type ThemeMode } from "@/hooks/use-theme-store";
import { Locales } from "intlayer";
import { useIntlayer } from "react-intlayer";
import { Text, TouchableOpacity, View } from "react-native";

export default function SettingsScreen() {
	const { title, language, theme, light, dark, system, english, french } =
		useIntlayer("settings-screen");

	const { mode, setMode } = useThemeStore();
	const { locale, changeLocale } = useLocale();

	const handleThemeChange = (newMode: ThemeMode) => {
		setMode(newMode);
	};

	const handleLocaleChange = (newLocale: Locales.ENGLISH | Locales.FRENCH) => {
		changeLocale(newLocale);
	};

	const themeOptions = [
		{ value: "light" as ThemeMode, label: light },
		{ value: "dark" as ThemeMode, label: dark },
		{ value: "system" as ThemeMode, label: system },
	];

	const localeOptions = [
		{ value: Locales.ENGLISH, label: english },
		{ value: Locales.FRENCH, label: french },
	];

	return (
		<View className="flex-1 bg-white dark:bg-gray-900 p-6">
			<Text className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
				{title}
			</Text>

			{/* Language Section */}
			<View className="mb-8">
				<Text className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
					{language}
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
					{theme}
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
	);
}
