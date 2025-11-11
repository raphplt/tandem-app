import { getImageUrl } from "@/utils/image";
import { Trans } from "@lingui/react/macro";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { ArrowLeft } from "phosphor-react-native";
import { Pressable, Text, View } from "react-native";

interface ChatHeaderProps {
	name: string;
	expiresIn: string | null;
	onBack: () => void;
	isActive?: boolean;
	photoUrl?: string | null;
	partnerId?: string;
}

export function ChatHeader({
	name,
	expiresIn,
	onBack,
	isActive,
	photoUrl,
	partnerId,
}: ChatHeaderProps) {
	return (
		<View className="flex-row items-center justify-between border-b border-outline-50/80 px-4 py-3 dark:border-white/5">
			<Pressable
				accessibilityRole="button"
				onPress={onBack}
				className="rounded-full border border-outline-100/60 p-2 dark:border-white/20"
			>
				<ArrowLeft size={20} weight="bold" color="#7A2742" />
			</Pressable>
			<View className="flex-1 px-4">
				<Text className="text-base font-heading text-center text-typography-900 dark:text-typography-white">
					{name}
				</Text>
				{expiresIn ? (
					<Text className="text-xs text-center text-typography-500 dark:text-typography-300">
						{isActive ? (
							<Trans id="chat.expires">Expire dans {expiresIn}</Trans>
						) : (
							<Trans id="chat.closed.short">Session clôturée</Trans>
						)}
					</Text>
				) : null}
			</View>
			<View className="rounded-full bg-accentRose-100/70 p-2 dark:bg-accentRose-800/30">
				<Link
					href={{
						pathname: "/matchProfile/[userId]",
						params: { userId: partnerId ?? "" },
					}}
				>
					<Image
						source={photoUrl ? { uri: getImageUrl(photoUrl) } : undefined}
						style={{ width: 24, height: 24 }}
						contentFit="cover"
					/>
				</Link>
			</View>
		</View>
	);
}
