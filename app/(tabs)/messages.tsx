import { useAuthSession } from "@/hooks/use-auth-session";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeStore } from "@/hooks/use-theme-store";
import {
	useConversations,
	useMarkConversationRead,
} from "@/src/hooks/use-conversations";
import type { ConversationResponse } from "@/types/conversation";
import { Trans } from "@lingui/react/macro";
import { formatDistanceToNowStrict } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
	ArrowRight,
	ChatCenteredDots,
	ChatsTeardrop,
	Clock,
} from "phosphor-react-native";
import { useCallback, useMemo, type ReactNode } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MessagesScreen() {
	const { mode } = useThemeStore();
	const colorScheme = useColorScheme();
	const { data: session } = useAuthSession();
	const router = useRouter();
	const {
		data: conversations,
		isLoading,
		refetch,
		isRefetching,
	} = useConversations();
	const { mutate: markConversationRead } = useMarkConversationRead();

	const actualMode =
		mode === "system" ? (colorScheme === "dark" ? "dark" : "light") : mode;

	const handleOpenConversation = useCallback(
		(conversationId: string) => {
			markConversationRead(conversationId);
			router.push(`/chat/${conversationId}` as never);
		},
		[markConversationRead, router]
	);

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-background-0 dark:bg-background-950">
				<ActivityIndicator />
			</View>
		);
	}

	const content =
		conversations && conversations.length > 0 ? (
			<View className="mt-6 flex-1 gap-4">
				{conversations.map((conversation) => (
					<ConversationCard
						key={conversation.id}
						conversation={conversation}
						currentUserId={session?.user?.id}
						onPress={() => handleOpenConversation(conversation.id)}
					/>
				))}
			</View>
		) : (
			<EmptyState onRefresh={() => refetch()} loading={isRefetching} />
		);

	return (
		<SafeAreaView className="flex-1 bg-background-0 dark:bg-background-950">
			<ScrollView className="flex-1" contentContainerClassName="px-6 pb-12 pt-6">
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
							actualMode === "dark"
								? ["#0A0A0B", "#121315", "#7A5400"]
								: ["#FFF5F8", "#F8E9B8"]
						}
					>
						<Text className="text-xs font-semibold uppercase tracking-[1.4px] text-typography-900 dark:text-typography-white">
							<Trans id="messages.daily-limit">1 / jour</Trans>
						</Text>
					</LinearGradient>
				</View>
				{content}
			</ScrollView>
		</SafeAreaView>
	);
}

function ConversationCard({
	conversation,
	currentUserId,
	onPress,
}: {
	conversation: ConversationResponse;
	currentUserId?: string;
	onPress: () => void;
}) {
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
				{/* {conversation.hasUnreadMessages ? (
					<View className="rounded-full bg-accentRose-200/80 px-3 py-1">
						<Text className="text-xs font-semibold uppercase tracking-[1px] text-accentRose-800">
							<Trans id="conversation.unread">Nouveaux</Trans>
						</Text>
					</View>
				) : null}
				 */}
			</View>
		</Pressable>
	);
}

function Tag({
	icon,
	label,
}: {
	icon?: ReactNode;
	label: ReactNode;
}) {
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

function EmptyState({
	onRefresh,
	loading,
}: {
	onRefresh: () => Promise<unknown> | void;
	loading: boolean;
}) {
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

function formatTimeUntilExpiry(hoursLeft?: number) {
	if (typeof hoursLeft !== "number") return null;
	const hours = Math.floor(hoursLeft);
	const minutes = Math.max(0, Math.round((hoursLeft - hours) * 60));
	if (hours <= 0 && minutes <= 0) {
		return "quelques minutes";
	}
	if (hours === 0) {
		return `${minutes} min`;
	}
	return `${hours} h ${minutes} min`;
}
