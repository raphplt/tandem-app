import { useRouter } from "expo-router";
import { useState } from "react";

import { useAuthActions } from "@/hooks/use-auth-actions";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useLocale } from "@/hooks/use-locale";
import { useThemeStore, type ThemeMode } from "@/hooks/use-theme-store";
import { Trans } from "@lingui/react/macro";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
	const { mode, setMode } = useThemeStore();
	const { locale, changeLocale } = useLocale();
	const { data: session } = useAuthSession();
	const { signOut } = useAuthActions();
	const router = useRouter();
	const [isSigningOut, setIsSigningOut] = useState(false);

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

	const handleSignOut = async () => {
		setIsSigningOut(true);
		try {
			const result = await signOut();
			if (result?.error) {
				throw result.error;
			}
			router.replace("/(auth)/sign-in");
		} catch (error) {
			console.error("Failed to sign out", error);
		} finally {
			setIsSigningOut(false);
		}
	};

	return (
		<SafeAreaView className="flex-1  p-6">
			<View>
				<Text className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8">
					<Trans id="settings-screen.title">Settings</Trans>
				</Text>

				{session?.user && (
					<View className="mb-10 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
						<Text className="text-base font-semibold text-gray-800 dark:text-gray-100">
							<Trans id="settings-screen.account">Signed in as</Trans>
						</Text>
						<Text className="mt-1 text-lg text-gray-900 dark:text-gray-50">
							{session.user.firstName}
						</Text>
						<Text className="text-sm text-gray-500 dark:text-gray-400">
							{session.user.email}
						</Text>
					</View>
				)}

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

				<TouchableOpacity
					onPress={handleSignOut}
					disabled={isSigningOut}
					className="mt-12 rounded-xl border border-red-500 bg-transparent py-4"
				>
					<Text className="text-center text-base font-semibold text-red-600 dark:text-red-400">
						{isSigningOut ? (
							<Trans id="settings-screen.signing-out">Signing out...</Trans>
						) : (
							<Trans id="settings-screen.sign-out">Sign out</Trans>
						)}
					</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}
