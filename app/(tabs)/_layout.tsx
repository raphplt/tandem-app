import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeStore } from "@/hooks/use-theme-store";
import { Trans } from "@lingui/macro";
import { Tabs } from "expo-router";
import { GearIcon, House, PaperPlane } from "phosphor-react-native";
import React from "react";
import { Text } from "react-native";

export default function TabLayout() {
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
					tabBarIcon: ({ color }) => <House size={28} color={color} />,
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
					tabBarIcon: ({ color }) => <PaperPlane size={28} color={color} />,
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
