import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useState, type ReactNode } from "react";
import {
	ActivityIndicator,
	Pressable,
	PressableProps,
	Text,
	ViewStyle,
	type ColorValue,
} from "react-native";
import Animated, {
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from "react-native-reanimated";

type OnboardingGradientButtonProps = PressableProps & {
	label: ReactNode;
	loading?: boolean;
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
	disabled?: boolean;
};

const G1: readonly [ColorValue, ColorValue, ...ColorValue[]] = [
	"#D6A53A",
	"#E08AA4",
	"#9A6A00",
];
const G1_PRESSED: readonly [ColorValue, ColorValue, ...ColorValue[]] = [
	"#E6BF63",
	"#F3B3C8",
	"#7A5400",
];

export function OnboardingGradientButton({
	label,
	loading,
	disabled,
	style,
	leftIcon,
	rightIcon,
	onPressIn,
	onPressOut,
	onPress,
	...rest
}: OnboardingGradientButtonProps) {
	const isDisabled = !!disabled || !!loading;

	const [pressed, setPressed] = useState(false); 
	const p = useSharedValue(0); 

	const glowStyle: ViewStyle = {
		shadowColor: "#D6A53A",
		shadowOpacity: pressed ? 0.5 : 0.28,
		shadowRadius: pressed ? 14 : 10,
		shadowOffset: { width: 0, height: 6 },
		elevation: pressed ? 8 : 5,
	};

	const containerAnim = useAnimatedStyle(() => {
		const scale = interpolate(p.value, [0, 1], [1, 0.985]);
		const translateY = interpolate(p.value, [0, 1], [0, 0.5]);
		const rotateZ = `${interpolate(p.value, [0, 1], [0, -0.2])}deg`;
		return { transform: [{ scale }, { translateY }, { rotateZ }] };
	});

	const pressedOverlayAnim = useAnimatedStyle(() => ({
		opacity: withTiming(p.value, { duration: 120 }),
	}));

	const ringAnim = useAnimatedStyle(() => ({
		opacity: withTiming(p.value, { duration: 120 }),
		transform: [
			{ scale: withSpring(p.value ? 1.03 : 1, { stiffness: 260, damping: 22 }) },
		],
	}));

	return (
		<Animated.View
			style={[{ width: "100%" }, glowStyle, style as any, containerAnim]}
		>
			<Pressable
				{...rest}
				accessibilityRole="button"
				disabled={isDisabled}
				className="rounded-full overflow-hidden"
				onPressIn={(e) => {
					if (!isDisabled)
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
					setPressed(true);
					p.value = withSpring(1, { stiffness: 520, damping: 30 });
					onPressIn?.(e);
				}}
				onPressOut={(e) => {
					setPressed(false);
					p.value = withSpring(0, { stiffness: 520, damping: 30 });
					onPressOut?.(e);
				}}
				onPress={onPress}
			>
				<LinearGradient
					colors={G1}
					start={{ x: 0, y: 0.5 }}
					end={{ x: 1, y: 0.5 }}
					style={{
						paddingVertical: 16,
						paddingHorizontal: 24,
						alignItems: "center",
						justifyContent: "center",
						borderRadius: 999,
						opacity: isDisabled ? 0.75 : 1,
					}}
				>
					<Animated.View
						pointerEvents="none"
						style={[
							{
								position: "absolute",
								top: 0,
								right: 0,
								bottom: 0,
								left: 0,
								borderRadius: 999,
								overflow: "hidden",
							},
							pressedOverlayAnim,
						]}
					>
						<LinearGradient
							colors={G1_PRESSED}
							start={{ x: 1, y: 0.5 }}
							end={{ x: 0, y: 0.5 }}
							style={{
								position: "absolute",
								top: 0,
								right: 0,
								bottom: 0,
								left: 0,
								borderRadius: 999,
							}}
						/>
					</Animated.View>

					<Animated.View
						pointerEvents="none"
						style={[
							{
								position: "absolute",
								top: -4,
								right: -4,
								bottom: -4,
								left: -4,
								borderRadius: 999,
								borderWidth: 2,
								borderColor: "rgba(214,165,58,0.35)",
							},
							ringAnim,
						]}
					/>

					<LinearGradient
						pointerEvents="none"
						colors={[
							"rgba(255,255,255,0.35)",
							"rgba(255,255,255,0.06)",
							"rgba(255,255,255,0)",
						]}
						start={{ x: 0.2, y: 0 }}
						end={{ x: 0.8, y: 1 }}
						style={{
							position: "absolute",
							top: 0,
							right: 0,
							bottom: 0,
							left: 0,
							borderRadius: 999,
						}}
					/>

					<Animated.View
						className="flex-row items-center justify-center"
						style={{ gap: 8 }}
					>
						{loading ? (
							<ActivityIndicator size="small" color="#FFFFFF" />
						) : (
							<>
								{leftIcon}
								<Text className="text-base font-semibold text-white" numberOfLines={1}>
									{label}
								</Text>
								{rightIcon}
							</>
						)}
					</Animated.View>
				</LinearGradient>
			</Pressable>
		</Animated.View>
	);
}
