import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeStore } from "@/hooks/use-theme-store";
import { useIntlayer } from "react-intlayer";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { mode } = useThemeStore();
		const { home, explore, settings } = useIntlayer("tabs");

		// Determine the actual theme mode based on user preference
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
						title: home,
						tabBarIcon: ({ color }) => (
							<IconSymbol size={28} name="house.fill" color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name="explore"
					options={{
						title: explore,
						tabBarIcon: ({ color }) => (
							<IconSymbol size={28} name="paperplane.fill" color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name="settings"
					options={{
						title: settings,
						tabBarIcon: ({ color }) => (
							<IconSymbol size={28} name="gearshape.fill" color={color} />
						),
					}}
				/>
			</Tabs>
		);
}
