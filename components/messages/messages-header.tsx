import { Trans } from "@lingui/react/macro";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";

interface MessagesHeaderProps {
	mode: "light" | "dark";
}

export function MessagesHeader({ mode }: MessagesHeaderProps) {
	return (
		<View className="flex-row items-center justify-between">
			<View>
				<Text className="text-xs uppercase tracking-[2px] text-typography-500 dark:text-typography-300">
					<Trans id="messages.title.caption">Tes conversations</Trans>
				</Text>
				<Text className="mt-1 text-3xl font-heading text-typography-900 dark:text-typography-white">
					<Trans id="messages.title">Moments à deux</Trans>
				</Text>
			</View>
			<LinearGradient
				style={{
					borderRadius: 16,
					justifyContent: "center",
					alignItems: "center",
					paddingVertical: 4,
					paddingHorizontal: 12,
				}}
				colors={
					mode === "dark"
						? ["#0A0A0B", "#121315", "#7A5400"]
						: ["#FFF5F8", "#F8E9B8"]
				}
			>
				<Text className="text-xs font-semibold uppercase tracking-[1.4px] text-typography-900 dark:text-typography-white">
					<Trans id="messages.daily-limit">1 / jour</Trans>
				</Text>
			</LinearGradient>
		</View>
	);
}

