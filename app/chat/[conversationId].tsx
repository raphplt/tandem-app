import { useAuthSession } from "@/hooks/use-auth-session";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeStore } from "@/hooks/use-theme-store";
import { useChatMessages } from "@/src/hooks/use-chat-messages";
import { useConversation } from "@/src/hooks/use-conversations";
import { extractErrorMessage } from "@/src/utils/error";
import type { MessageResponse } from "@/types/message";
import { t } from "@lingui/macro";
import { Trans } from "@lingui/react/macro";
import { format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	ArrowLeft,
	PaperPlaneTilt,
	Sparkle,
} from "phosphor-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	FlatList,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	Text,
	TextInput,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ConversationScreen() {
	const { conversationId: rawConversationId } = useLocalSearchParams<{
		conversationId: string;
	}>();
	const conversationId = Array.isArray(rawConversationId)
		? rawConversationId[0]
		: rawConversationId;
	const router = useRouter();
	const { data: session } = useAuthSession();
	const { mode } = useThemeStore();
	const colorScheme = useColorScheme();

	const { data: conversation, isLoading: isConversationLoading } =
		useConversation(conversationId);
	const {
		messages,
		isLoading: areMessagesLoading,
		sendMessage,
		markRead,
	} = useChatMessages(conversationId, 100);

	const [inputValue, setInputValue] = useState("");
	const [isSending, setIsSending] = useState(false);
	const flatListRef = useRef<FlatList<MessageResponse>>(null);

	const actualTheme =
		mode === "system" ? (colorScheme === "dark" ? "dark" : "light") : mode;

	useEffect(() => {
		markRead().catch(() => {});
	}, [conversationId, markRead]);

	useEffect(() => {
		if (messages.length === 0 || !flatListRef.current) return;
		flatListRef.current.scrollToEnd({ animated: true });
	}, [messages]);

	const partnerName = useMemo(() => {
		if (!conversation) return "Ton match";
		const { metadata } = conversation;
		const isUser1 = conversation.user1Id === session?.user?.id;
		return (
			(isUser1 ? metadata?.user2DisplayName : metadata?.user1DisplayName) ??
			"Ton match"
		);
	}, [conversation, session?.user?.id]);

	const expiresIn = formatTimeUntilExpiry(conversation?.timeUntilExpiry);

	const handleSend = useCallback(async () => {
		if (!inputValue.trim()) {
			return;
		}
		try {
			setIsSending(true);
			await sendMessage({ content: inputValue.trim() });
			setInputValue("");
			markRead().catch(() => {});
		} catch (error) {
			Alert.alert("WeTwo", extractErrorMessage(error));
		} finally {
			setIsSending(false);
		}
	}, [inputValue, markRead, sendMessage]);

	const disabledInput =
		!conversation?.isActiveConversation || conversation.status !== "active";

	if (!conversationId) {
		return (
			<View className="flex-1 items-center justify-center bg-background-0 dark:bg-background-950">
				<Text className="text-base text-typography-900 dark:text-typography-white">
					<Trans id="chat.invalid-id">
						Conversation introuvable. Reviens en arrière.
					</Trans>
				</Text>
			</View>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-background-0 dark:bg-background-950">
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
			>
				<View className="flex-1">
					<ChatHeader
						name={partnerName}
						expiresIn={expiresIn}
						onBack={router.back}
						isActive={conversation?.status === "active"}
					/>
					{isConversationLoading || areMessagesLoading ? (
						<View className="flex-1 items-center justify-center">
							<ActivityIndicator />
						</View>
					) : (
						<FlatList
							ref={flatListRef}
							contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
							data={messages}
							renderItem={({ item }) => (
								<MessageBubble
									message={item}
									isOwnMessage={item.authorId === session?.user?.id}
									theme={actualTheme}
								/>
							)}
							keyExtractor={(item) => item.id}
						/>
					)}
				</View>
				{disabledInput ? (
					<View className="mx-4 mb-2 rounded-2xl border border-outline-200 bg-white/80 px-4 py-2 dark:border-white/10 dark:bg-white/10">
						<Text className="text-xs text-typography-600 dark:text-typography-300">
							<Trans id="chat.closed">
								Conversation terminée. Tu peux revoir l&apos;historique mais pas
								écrire.
							</Trans>
						</Text>
					</View>
				) : null}
				<ChatInput
					value={inputValue}
					onChangeText={setInputValue}
					onSend={handleSend}
					disabled={disabledInput}
					isSending={isSending}
				/>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

function ChatHeader({
	name,
	expiresIn,
	onBack,
	isActive,
}: {
	name: string;
	expiresIn: string | null;
	onBack: () => void;
	isActive?: boolean;
}) {
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
				<Sparkle size={18} color="#7A2742" weight="fill" />
			</View>
		</View>
	);
}

function MessageBubble({
	message,
	isOwnMessage,
	theme,
}: {
	message: MessageResponse;
	isOwnMessage: boolean;
	theme: "light" | "dark";
}) {
	const alignment = isOwnMessage ? "items-end" : "items-start";
	const bgClass = isOwnMessage
		? "bg-typography-900"
		: "bg-accentRose-100 dark:bg-accentRose-900/30";
	const textClass = isOwnMessage
		? "text-white"
		: "text-typography-900 dark:text-typography-white";
	const timestamp = format(new Date(message.createdAt), "HH:mm");

	if (message.isSystemMessage) {
		return (
			<View className="my-2 items-center">
				<Text className="text-xs uppercase tracking-[1px] text-typography-500 dark:text-typography-300">
					{message.content}
				</Text>
			</View>
		);
	}

	return (
		<View className={`mb-3 w-full ${alignment}`}>
			<View className={`max-w-[80%] rounded-3xl px-4 py-3 ${bgClass}`}>
				<Text className={`text-base ${textClass}`}>{message.content}</Text>
			</View>
			<Text className="mt-1 text-[11px] uppercase tracking-[1px] text-typography-500 dark:text-typography-300">
				{timestamp}
			</Text>
		</View>
	);
}

function ChatInput({
	value,
	onChangeText,
	onSend,
	disabled,
	isSending,
}: {
	value: string;
	onChangeText: (next: string) => void;
	onSend: () => void;
	disabled?: boolean;
	isSending?: boolean;
}) {
	const placeholder = t({
		id: "chat.input.placeholder",
		message: "Écris ton message...",
	});

	return (
		<View className="border-t border-outline-50/80 px-4 py-3 dark:border-white/10">
			<View className="flex-row items-center rounded-3xl border border-outline-100 bg-white px-4 py-2 dark:border-white/20 dark:bg-white/10">
				<TextInput
					value={value}
					onChangeText={onChangeText}
					editable={!disabled}
					placeholder={placeholder}
					placeholderTextColor="#9E9E9E"
					multiline
					className="flex-1 text-base text-typography-900 dark:text-white"
				/>
				<Pressable
					disabled={disabled || !value.trim() || isSending}
					onPress={onSend}
					className={`ml-2 rounded-full p-2 ${
						disabled || !value.trim()
							? "bg-outline-50"
							: "bg-typography-900 dark:bg-white"
					}`}
				>
					{isSending ? (
						<ActivityIndicator color="#FFFFFF" />
					) : (
						<PaperPlaneTilt
							size={20}
							color={
								disabled || !value.trim()
									? "#7A7A7A"
									: "#FFFFFF"
							}
							weight="fill"
						/>
					)}
				</Pressable>
			</View>
		</View>
	);
}

function formatTimeUntilExpiry(hoursLeft?: number | null) {
	if (typeof hoursLeft !== "number") return null;
	const hours = Math.floor(hoursLeft);
	const minutes = Math.round((hoursLeft - hours) * 60);
	if (hours <= 0 && minutes <= 0) {
		return "quelques minutes";
	}
	if (hours === 0) {
		return `${minutes} min`;
	}
	return `${hours} h ${minutes} min`;
}
