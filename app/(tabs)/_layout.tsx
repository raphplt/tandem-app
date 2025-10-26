import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeStore } from "@/hooks/use-theme-store";
import { Trans } from "@lingui/react/macro";
import { Href, Redirect, Tabs } from "expo-router";
import { AirplaneTilt, GearIcon, HouseIcon } from "phosphor-react-native";

import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function TabLayout() {
	const colorScheme = useColorScheme();
	const { mode } = useThemeStore();
	const { data: session, isLoading, isRefetching } = useAuthSession();
	const signInHref = "/(auth)/sign-in" as Href;

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
		return <Redirect href={signInHref} />;
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
						<Text>
							<Trans id="tabs.home">Home</Trans>
						</Text>
					),
					tabBarIcon: ({ color }) => <HouseIcon size={28} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="explore"
				options={{
					tabBarLabel: () => (
						<Text>
							<Trans id="tabs.explore">Explore</Trans>
						</Text>
					),
					tabBarIcon: ({ color }) => <AirplaneTilt size={28} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					tabBarLabel: () => (
						<Text>
							<Trans id="tabs.settings">Settings</Trans>
						</Text>
					),
					tabBarIcon: ({ color }) => <GearIcon size={28} color={color} />,
				}}
			/>
		</Tabs>
	);
}
