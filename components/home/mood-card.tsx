import { Trans } from "@lingui/react/macro";
import { CaretRightIcon, SunHorizonIcon } from "phosphor-react-native";
import { Text, View } from "react-native";

type MoodCardProps = {
	mood: string;
};

export function MoodCard({ mood }: MoodCardProps) {
	return (
		<View className="overflow-hidden rounded-[28px] border border-outline-100 bg-white/95 p-6 dark:border-white/10 dark:bg-black/40">
			<View className="flex-row items-center justify-between">
				<View>
					<Text className="text-[11px] uppercase tracking-[2px] text-typography-500 dark:text-typography-400">
						<Trans id="home-screen.mode.label">Ton mode</Trans>
					</Text>
					<Text className="mt-2 text-xl text-typography-900 dark:text-typography-white">
						{mood}
					</Text>
				</View>
				<View className="rounded-full bg-background-100 p-3 dark:bg-white/5">
					<SunHorizonIcon size={22} weight="bold" color="#E6BF63" />
				</View>
			</View>
			<View className="mt-4 flex-row items-center gap-2">
				<Text className="text-xs text-typography-600 dark:text-typography-400">
					<Trans id="home-screen.mode.hint">
						Ajuste tes intentions dans tes préférences.
					</Trans>
				</Text>
				<CaretRightIcon size={16} weight="bold" color="#E08AA4" />
			</View>
		</View>
	);
}
