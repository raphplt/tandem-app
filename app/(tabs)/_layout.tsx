import { HapticTab } from "@/components/haptic-tab";
import { CustomTabBar } from "@/components/ui/custom-tab-bar";
import { Colors } from "@/constants/theme";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeStore } from "@/hooks/use-theme-store";
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { Href, Redirect, Tabs } from "expo-router";
import {
	Icon as NativeTabIcon,
	Label,
	NativeTabs,
} from "expo-router/unstable-native-tabs";
import { Chat, GearIcon, HouseIcon } from "phosphor-react-native";
import React, { useMemo } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";

const TAB_ROUTES = [
	{
		name: "index",
		labelId: "tabs.home",
		fallbackLabel: "Home",
		Icon: HouseIcon,
		sfSymbol: { default: "house", selected: "house.fill" },
	},
	{
		name: "messages",
		labelId: "tabs.messages",
		fallbackLabel: "Messages",
		Icon: Chat,
		sfSymbol: { default: "bubble.left.and.bubble.right", selected: "bubble.left.and.bubble.right.fill" },
	},
	{
		name: "settings",
		labelId: "tabs.settings",
		fallbackLabel: "Settings",
		Icon: GearIcon,
		sfSymbol: { default: "gearshape", selected: "gearshape.fill" },
	},
] as const;

type TabRoute = (typeof TAB_ROUTES)[number]["name"];

export default function TabLayout() {
	const colorScheme = useColorScheme();
	const { mode } = useThemeStore();
	const { data: session, isLoading, isRefetching } = useAuthSession();
	const { i18n } = useLingui();
	const onboardingHref = "/(onboarding)/intro-values" as Href;

	const getActualThemeMode = () => {
		if (mode === "system") {
			return colorScheme === "dark" ? "dark" : "light";
		}
		return mode;
	};

	const actualThemeMode = getActualThemeMode();
	const isDark = actualThemeMode === "dark";
	const localizedLabels = useMemo<Record<TabRoute, string>>(() => {
		return TAB_ROUTES.reduce((acc, tab) => {
			acc[tab.name as TabRoute] = i18n._(
				t({
					id: tab.labelId,
					message: tab.fallbackLabel,
				}),
			);
			return acc;
		}, {} as Record<TabRoute, string>);
	}, [i18n]);

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

	if (Platform.OS === "ios") {
		return (
			<NativeTabs
				screenOptions={{ headerShown: false }}
				blurEffect="systemMaterial"
				tintColor={Colors[actualThemeMode ?? "light"].tint}
				iconColor={{
					default: isDark ? "#A3A3A3" : "#525252",
					selected: isDark ? "#F8E9B8" : "#C08A12",
				}}
				labelStyle={{
					default: {
						fontFamily: "Plus Jakarta Sans",
						fontSize: 11,
						fontWeight: "600",
						color: isDark ? "#A1A1AA" : "#525252",
					},
					selected: {
						fontFamily: "Plus Jakarta Sans",
						fontSize: 11,
						fontWeight: "600",
						color: isDark ? "#F8E9B8" : "#C08A12",
					},
				}}
				backgroundColor={null}
				shadowColor={isDark ? "#000000" : "#E5C079"}
				minimizeBehavior="automatic"
			>
				{TAB_ROUTES.map((tab) => (
					<NativeTabs.Screen
						key={`screen-${tab.name}`}
						name={tab.name}
						options={{ headerShown: false }}
					/>
				))}
				{TAB_ROUTES.map((tab) => (
					<NativeTabs.Trigger name={tab.name} key={`trigger-${tab.name}`}>
						<NativeTabIcon
							sf={tab.sfSymbol}
							selectedColor={isDark ? "#F8E9B8" : "#C08A12"}
						/>
						<Label>{localizedLabels[tab.name]}</Label>
					</NativeTabs.Trigger>
				))}
			</NativeTabs>
		);
	}

	return (
		<Tabs
			tabBar={(props) => <CustomTabBar {...props} />}
			screenOptions={{
				tabBarActiveTintColor: Colors[actualThemeMode ?? "light"].tint,
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarStyle: {
					position: "absolute",
					height: 90,
					backgroundColor: "transparent",
					borderTopWidth: 0,
					elevation: 0,
				},
			}}
		>
			{TAB_ROUTES.map((tab) => {
				const IconComponent = tab.Icon;
				return (
					<Tabs.Screen
						key={tab.name}
						name={tab.name}
						options={{
							tabBarLabel: () => (
								<Text className="text-typography-900 dark:text-typography-100">
									<Trans id={tab.labelId}>{tab.fallbackLabel}</Trans>
								</Text>
							),
							tabBarIcon: ({ color }) => (
								<IconComponent size={28} color={color} />
							),
						}}
					/>
				);
			})}
		</Tabs>
	);
}
