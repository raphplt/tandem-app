import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeStore } from "@/hooks/use-theme-store";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function CustomTabBar({
	state,
	descriptors,
	navigation,
}: BottomTabBarProps) {
	const insets = useSafeAreaInsets();
	const colorScheme = useColorScheme();
	const { mode } = useThemeStore();

	const getActualThemeMode = () => {
		if (mode === "system") {
			return colorScheme === "dark" ? "dark" : "light";
		}
		return mode;
	};

	const actualThemeMode = getActualThemeMode();
	const isDark = actualThemeMode === "dark";

	const handlePress = (route: any, isFocused: boolean) => {
		const event = navigation.emit({
			type: "tabPress",
			target: route.key,
			canPreventDefault: true,
		});

		if (!isFocused && !event.defaultPrevented) {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			navigation.navigate(route.name);
		}
	};

	return (
		<View
			style={{
				position: "absolute",
				bottom: insets.bottom + 16,
				left: 20,
				right: 20,
			}}
		>
			<BlurView
				intensity={isDark ? 80 : 95}
				tint={isDark ? "dark" : "light"}
				className="overflow-hidden rounded-3xl"
				style={{
					shadowColor: isDark ? "#000" : "#262626",
					shadowOffset: { width: 0, height: 12 },
					shadowOpacity: isDark ? 0.4 : 0.25,
					shadowRadius: 20,
					elevation: 12,
					backgroundColor: isDark
						? "rgba(18, 18, 18, 0.75)"
						: "rgba(255, 255, 255, 0.85)",
				}}
			>
				<View
					className="flex-row items-center justify-around px-4 py-3"
					style={{
						borderWidth: 1,
						borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
					}}
				>
					{state.routes.map((route: any, index: number) => {
						const { options } = descriptors[route.key];
						const isFocused = state.index === index;

						const icon = options.tabBarIcon
							? options.tabBarIcon({
									focused: isFocused,
									color: isFocused
										? isDark
											? "#F8E9B8"
											: "#C08A12"
										: isDark
										? "#A3A3A3"
										: "#525252",
									size: 24,
							  })
							: null;

						const label =
							options.tabBarLabel !== undefined
								? options.tabBarLabel
								: options.title !== undefined
								? options.title
								: route.name;

						return (
							<Pressable
								key={route.key}
								onPress={() => handlePress(route, isFocused)}
								className="flex-1 items-center justify-center py-2"
								style={{ minHeight: 44 }}
								android_ripple={{
									color: isDark ? "#fff2" : "#0002",
									borderless: true,
								}}
							>
								<AnimatedIcon isFocused={isFocused}>{icon}</AnimatedIcon>
								<AnimatedLabel isFocused={isFocused} isDark={isDark}>
									{typeof label === "function"
										? label({
												focused: isFocused,
												color: isFocused
													? isDark
														? "#F8E9B8"
														: "#C08A12"
													: isDark
													? "#A3A3A3"
													: "#525252",
												position: "below-icon",
												children: route.name,
										  })
										: label}
								</AnimatedLabel>
							</Pressable>
						);
					})}
				</View>
			</BlurView>
		</View>
	);
}

function AnimatedIcon({
	isFocused,
	children,
}: {
	isFocused: boolean;
	children: React.ReactNode;
}) {
	const animatedStyle = useAnimatedStyle(() => {
		const translateY = withSpring(isFocused ? -2 : 0, {
			damping: 15,
			stiffness: 150,
		});
		const scale = withSpring(isFocused ? 1.05 : 1, {
			damping: 15,
			stiffness: 150,
		});

		return {
			transform: [{ translateY }, { scale }],
		};
	});

	return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

function AnimatedLabel({
	isFocused,
	isDark,
	children,
}: {
	isFocused: boolean;
	isDark: boolean;
	children: React.ReactNode;
}) {
	const animatedStyle = useAnimatedStyle(() => {
		const opacity = withSpring(isFocused ? 1 : 0.7, {
			damping: 15,
			stiffness: 150,
		});

		return {
			opacity,
		};
	});

	return (
		<Animated.Text
			style={animatedStyle}
			className={`text-2xs mt-1 font-body font-semibold ${
				isFocused
					? isDark
						? "text-accentGold-100"
						: "text-accentGold-600"
					: isDark
					? "text-typography-400"
					: "text-typography-700"
			}`}
		>
			{children}
		</Animated.Text>
	);
}
