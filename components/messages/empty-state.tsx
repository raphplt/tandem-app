import { Trans } from "@lingui/react/macro";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

interface EmptyStateProps {
	onRefresh: () => Promise<unknown> | void;
	loading: boolean;
}

export function EmptyState({ onRefresh, loading }: EmptyStateProps) {
	return (
		<View className="mt-8 rounded-3xl border border-dashed border-outline-200 bg-white/70 p-6 dark:border-white/15 dark:bg-white/5">
			<Text className="text-lg font-heading text-typography-900 dark:text-typography-white">
				<Trans id="conversation.empty.title">Pas de conversation active</Trans>
			</Text>
			<Text className="mt-2 text-sm text-typography-600 dark:text-typography-200">
				<Trans id="conversation.empty.subtitle">
					Ton prochain match apparaîtra ici dès que tu accepteras une connexion.
				</Trans>
			</Text>
			<Pressable
				onPress={onRefresh}
				disabled={loading}
				className="mt-5 items-center rounded-2xl border border-outline-100 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/10"
			>
				{loading ? (
					<ActivityIndicator />
				) : (
					<Text className="font-semibold text-typography-900 dark:text-white">
						<Trans id="conversation.empty.refresh">Actualiser</Trans>
					</Text>
				)}
			</Pressable>
		</View>
	);
}

