import { ConversationCard } from "@/components/messages/conversation-card";
import { EmptyState } from "@/components/messages/empty-state";
import { MessagesHeader } from "@/components/messages/messages-header";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeStore } from "@/hooks/use-theme-store";
import {
	useConversations,
	useMarkConversationRead,
} from "@/src/hooks/use-conversations";
import type { ConversationResponse } from "@/types/conversation";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
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
			<ConversationsList
				conversations={conversations}
				currentUserId={session?.user?.id}
				onConversationPress={handleOpenConversation}
			/>
		) : (
			<EmptyState onRefresh={() => refetch()} loading={isRefetching} />
		);

	return (
		<SafeAreaView className="flex-1 bg-background-0 dark:bg-background-950">
			<ScrollView className="flex-1" contentContainerClassName="px-6 pb-12 pt-6">
				<MessagesHeader mode={actualMode} />
				{content}
			</ScrollView>
		</SafeAreaView>
	);
}

interface ConversationsListProps {
	conversations: ConversationResponse[];
	currentUserId?: string;
	onConversationPress: (conversationId: string) => void;
}

function ConversationsList({
	conversations,
	currentUserId,
	onConversationPress,
}: ConversationsListProps) {
	return (
		<View className="mt-6 flex-1 gap-4">
			{conversations.map((conversation) => (
				<ConversationCard
					key={conversation.id}
					conversation={conversation}
					currentUserId={currentUserId}
					onPress={() => onConversationPress(conversation.id)}
				/>
			))}
		</View>
	);
}
