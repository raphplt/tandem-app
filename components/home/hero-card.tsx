import { Trans } from "@lingui/react/macro";
import { FlameIcon } from "phosphor-react-native";
import { Text, View } from "react-native";

import { getDateWelcomeMessage } from "@/utils/time";

type HeroCardProps = {
	streak: number;
	greetingKey: string;
	name: string;
};

export function HeroCard({ streak, greetingKey, name }: HeroCardProps) {
	return (
		<View className="overflow-hidden rounded-[32px] border border-outline-100 bg-white/95 p-6 dark:border-white/10 dark:bg-white/5">
			<View className="flex-row items-center gap-2">
				<FlameIcon size={18} weight="fill" color="#E08AA4" />
				<Text className="text-xs uppercase tracking-[2px] text-typography-500 dark:text-typography-400">
					{streak} jours
				</Text>
			</View>
			<Text className="mt-5 font-heading text-[34px] leading-tight text-typography-900 dark:text-typography-white">
				<Trans id={greetingKey}>
					{getDateWelcomeMessage(new Date())}, {name} !
				</Trans>
			</Text>
			<Text className="mt-3 text-base text-typography-600 dark:text-typography-200">
				<Trans id="home-screen.subtitle">
					C&apos;est le moment de ta rencontre du jour.
				</Trans>
			</Text>
		</View>
	);
}
