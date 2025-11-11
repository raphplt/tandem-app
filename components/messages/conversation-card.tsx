import { formatTimeUntilExpiry } from "@/src/utils/date";
import type { ConversationResponse } from "@/types/conversation";
import { Trans } from "@lingui/react/macro";
import { formatDistanceToNowStrict } from "date-fns";
import {
	ArrowRight,
	ChatCenteredDots,
	ChatsTeardrop,
	Clock,
} from "phosphor-react-native";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { Tag } from "./tag";

interface ConversationCardProps {
	conversation: ConversationResponse;
	currentUserId?: string;
	onPress: () => void;
}

export function ConversationCard({
	conversation,
	currentUserId,
	onPress,
}: ConversationCardProps) {
	const partnerDisplayName = useMemo(() => {
		const isUser1 = conversation.user1Id === currentUserId;
		const name = isUser1
			? conversation.profile2?.firstName
			: conversation.profile1?.firstName;
		return name ?? "Ton match";
	}, [conversation, currentUserId]);

	const expiresIn = formatTimeUntilExpiry(conversation.timeUntilExpiry);
	const lastMessageLabel = conversation.lastMessageAt
		? formatDistanceToNowStrict(new Date(conversation.lastMessageAt), {
				addSuffix: true,
		  })
		: null;

	return (
		<Pressable
			onPress={onPress}
			className="rounded-3xl border border-outline-100 bg-white/95 p-5 dark:border-white/10 dark:bg-white/5"
		>
			<View className="flex-row items-center justify-between">
				<View className="flex-row items-center gap-3">
					<View className="rounded-2xl bg-accentRose-100/70 p-3 dark:bg-accentRose-900/20">
						<ChatsTeardrop size={24} weight="fill" color="#7A2742" />
					</View>
					<View>
						<Text className="text-lg font-heading text-typography-900 dark:text-typography-white">
							{partnerDisplayName}
						</Text>
						{lastMessageLabel ? (
							<Text className="text-xs uppercase tracking-[1.2px] text-typography-500 dark:text-typography-300">
								<Trans id="conversation.last-message">
									Dernier échange {lastMessageLabel}
								</Trans>
							</Text>
						) : null}
					</View>
				</View>
				<ArrowRight size={20} color="#7A2742" weight="bold" />
			</View>
			<View className="mt-4 flex-row gap-3">
				<Tag
					icon={<ChatCenteredDots size={14} color="#9A6A00" weight="bold" />}
					label={
						<Text className="text-xs font-semibold uppercase tracking-[1px] text-typography-700 dark:text-typography-200">
							{conversation.status === "active" ? (
								<Trans id="conversation.status.active">Active</Trans>
							) : (
								<Trans id="conversation.status.closed">Terminée</Trans>
							)}
						</Text>
					}
				/>
				{expiresIn ? (
					<Tag
						icon={<Clock size={14} color="#7A2742" weight="bold" />}
						label={
							<Text className="text-xs font-semibold uppercase tracking-[1px] text-typography-700 dark:text-typography-200">
								<Trans id="conversation.expires">Expire dans {expiresIn}</Trans>
							</Text>
						}
					/>
				) : null}
				{conversation.hasUnreadMessages && (
					<UnreadBadge />
				)}
			</View>
		</Pressable>
	);
}

function UnreadBadge() {
	return (
		<View className="rounded-full bg-accentRose-200/80 px-3 py-1">
			<Text className="text-xs font-semibold uppercase tracking-[1px] text-accentRose-800">
				<Trans id="conversation.unread">Nouveaux</Trans>
			</Text>
		</View>
	);
}

