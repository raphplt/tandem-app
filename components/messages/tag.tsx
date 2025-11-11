import type { ReactNode } from "react";
import { Text, View } from "react-native";

interface TagProps {
	icon?: ReactNode;
	label: ReactNode;
}

export function Tag({ icon, label }: TagProps) {
	return (
		<View className="flex-row items-center gap-2 rounded-2xl border border-outline-100/80 px-3 py-1.5 dark:border-white/10">
			{icon}
			{typeof label === "string" || typeof label === "number" ? (
				<Text className="text-xs font-semibold uppercase tracking-[1px] text-typography-700 dark:text-typography-200">
					{label}
				</Text>
			) : (
				label
			)}
		</View>
	);
}

