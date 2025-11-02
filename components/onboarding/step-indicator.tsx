import { Text, View } from "react-native";

type StepIndicatorProps = {
	current: number;
	total: number;
};

export function StepIndicator({ current, total }: StepIndicatorProps) {
	return (
		<View className="items-end">
			<Text className="text-sm font-body text-typography-500 dark:text-zinc-400">
				{current}/{total}
			</Text>
		</View>
	);
}
