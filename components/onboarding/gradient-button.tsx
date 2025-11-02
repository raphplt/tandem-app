import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Pressable, Text } from "react-native";
import type { ReactNode } from "react";
import type { PressableProps } from "react-native";

type OnboardingGradientButtonProps = PressableProps & {
	label: ReactNode;
	loading?: boolean;
};

export function OnboardingGradientButton({
	label,
	loading,
	disabled,
	style,
	...pressableProps
}: OnboardingGradientButtonProps) {
	const isDisabled = disabled || loading;

	return (
		<Pressable
			{...pressableProps}
			disabled={isDisabled}
			style={[{ width: "100%" }, style]}
			className="overflow-hidden rounded-full"
		>
			<LinearGradient
				colors={["#D6A53A", "#E08AA4", "#9A6A00"]}
				start={{ x: 0, y: 0.5 }}
				end={{ x: 1, y: 0.5 }}
				style={{
					paddingVertical: 16,
					paddingHorizontal: 24,
					alignItems: "center",
					justifyContent: "center",
					opacity: isDisabled ? 0.65 : 1,
				}}
			>
				{loading ? (
					<ActivityIndicator size="small" color="#FFFFFF" />
				) : (
					<Text className="text-base font-semibold text-white">{label}</Text>
				)}
			</LinearGradient>
		</Pressable>
	);
}
