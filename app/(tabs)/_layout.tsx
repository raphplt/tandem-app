import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeStore } from "@/hooks/use-theme-store";
import { Trans } from "@lingui/react/macro";
import { Href, Redirect, Tabs } from "expo-router";
import { Chat, GearIcon, HouseIcon } from "phosphor-react-native";

import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function TabLayout() {
	const colorScheme = useColorScheme();
	const { mode } = useThemeStore();
	const { data: session, isLoading, isRefetching } = useAuthSession();
	const onboardingHref = "/(onboarding)/intro-values" as Href;

	const getActualThemeMode = () => {
		if (mode === "system") {
			return colorScheme === "dark" ? "dark" : "light";
		}
		return mode;
	};

	const actualThemeMode = getActualThemeMode();

	if (isLoading || isRefetching) {
		return (
			<View className="flex-1 items-center justify-center bg-white dark:bg-black">
				<ActivityIndicator size="large" />
			</View>
		);
	}

	if (!session) {
		return <Redirect href={onboardingHref} />;
	}

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[actualThemeMode ?? "light"].tint,
				headerShown: false,
				tabBarButton: HapticTab,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					tabBarLabel: () => (
						<Text className="text-typography-900 dark:text-typography-100">
							<Trans id="tabs.home">Home</Trans>
						</Text>
					),
					tabBarIcon: ({ color }) => <HouseIcon size={28} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="messages"
				options={{
					tabBarLabel: () => (
						<Text className="text-typography-900 dark:text-typography-100">
							<Trans id="tabs.messages">Messages</Trans>
						</Text>
					),
					tabBarIcon: ({ color }) => <Chat size={28} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					tabBarLabel: () => (
						<Text className="text-typography-900 dark:text-typography-100">
							<Trans id="tabs.settings">Settings</Trans>
						</Text>
					),
					tabBarIcon: ({ color }) => <GearIcon size={28} color={color} />,
				}}
			/>
		</Tabs>
	);
}
