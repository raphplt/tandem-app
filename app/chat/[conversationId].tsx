import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageBubble } from "@/components/chat/message-bubble";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeStore } from "@/hooks/use-theme-store";
import { useChatMessages } from "@/src/hooks/use-chat-messages";
import { useConversation } from "@/src/hooks/use-conversations";
import { formatTimeUntilExpiry } from "@/src/utils/date";
import { extractErrorMessage } from "@/src/utils/error";
import type { MessageResponse } from "@/types/message";
import { Trans } from "@lingui/react/macro";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	ActivityIndicator,
	Alert,
	FlatList,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	Text,
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
		isPartnerTyping,
		sendTypingStart,
		sendTypingStop,
	} = useChatMessages(conversationId, 100);

	const [inputValue, setInputValue] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [keyboardHeight, setKeyboardHeight] = useState(0);
	const flatListRef = useRef<FlatList<MessageResponse>>(null);
	const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastTypingSentRef = useRef<boolean>(false);
	const isInitialLoadRef = useRef<boolean>(true);

	const actualTheme =
		mode === "system" ? (colorScheme === "dark" ? "dark" : "light") : mode;

	useEffect(() => {
		markRead().catch(() => {});
	}, [conversationId, markRead]);

	useEffect(() => {
		const keyboardWillShowListener = Keyboard.addListener(
			Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
			(e) => {
				setKeyboardHeight(e.endCoordinates.height);
			}
		);

		const keyboardDidHideListener = Keyboard.addListener(
			Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
			() => {
				setKeyboardHeight(0);
			}
		);

		return () => {
			keyboardWillShowListener.remove();
			keyboardDidHideListener.remove();
		};
	}, []);

	useEffect(() => {
		isInitialLoadRef.current = true;
	}, [conversationId]);

	useEffect(() => {
		if (messages.length === 0 || !flatListRef.current) return;

		if (!isInitialLoadRef.current) {
			flatListRef.current.scrollToEnd({ animated: true });
		}
	}, [messages]);

	const partnerName = useMemo(() => {
		if (!conversation) return "Ton match";
		const isUser1 = conversation.user1Id === session?.user?.id;
		const name = isUser1
			? conversation.profile2?.firstName
			: conversation.profile1?.firstName;
		return name ?? "Ton match";
	}, [conversation, session?.user?.id]);

	const partnerPhotoUrl = useMemo(() => {
		if (!conversation) return null;
		const isUser1 = conversation.user1Id === session?.user?.id;
		return isUser1
			? conversation.profile2?.photoUrl
			: conversation.profile1?.photoUrl;
	}, [conversation, session?.user?.id]);

	const partnerId = useMemo(() => {
		if (!conversation) return "";
		const isUser1 = conversation.user1Id === session?.user?.id;
		return isUser1
			? conversation.profile2?.userId
			: conversation.profile1?.userId;
	}, [conversation, session?.user?.id]);

	const expiresIn = formatTimeUntilExpiry(conversation?.timeUntilExpiry);

	const handleSend = useCallback(async () => {
		if (!inputValue.trim()) {
			return;
		}
		// Arrêter le typing avant d'envoyer
		if (lastTypingSentRef.current) {
			sendTypingStop();
			lastTypingSentRef.current = false;
		}
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
			typingTimeoutRef.current = null;
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
	}, [inputValue, markRead, sendMessage, sendTypingStop]);

	const handleInputChange = useCallback(
		(text: string) => {
			setInputValue(text);

			if (text.trim().length > 0) {
				if (!lastTypingSentRef.current) {
					sendTypingStart();
					lastTypingSentRef.current = true;
				}

				if (typingTimeoutRef.current) {
					clearTimeout(typingTimeoutRef.current);
				}

				typingTimeoutRef.current = setTimeout(() => {
					if (lastTypingSentRef.current) {
						sendTypingStop();
						lastTypingSentRef.current = false;
					}
				}, 3000);
			} else {
				if (lastTypingSentRef.current) {
					sendTypingStop();
					lastTypingSentRef.current = false;
				}
				if (typingTimeoutRef.current) {
					clearTimeout(typingTimeoutRef.current);
					typingTimeoutRef.current = null;
				}
			}
		},
		[sendTypingStart, sendTypingStop]
	);

	useEffect(() => {
		return () => {
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
			}
			if (lastTypingSentRef.current) {
				sendTypingStop();
			}
		};
	}, [sendTypingStop]);

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
			>
				<View
					className="flex-1"
					style={{
						paddingBottom:
							Platform.OS === "android" && keyboardHeight > 0 ? keyboardHeight : 0,
					}}
				>
					<ChatHeader
						name={partnerName}
						expiresIn={expiresIn}
						onBack={router.back}
						isActive={conversation?.status === "active"}
						photoUrl={partnerPhotoUrl}
						partnerId={partnerId}
					/>
					{isConversationLoading || areMessagesLoading ? (
						<View className="flex-1 items-center justify-center">
							<ActivityIndicator />
						</View>
					) : (
						<>
							<MessagesList
								ref={flatListRef}
								messages={messages}
								userId={session?.user?.id}
								theme={actualTheme}
								conversationId={conversationId}
								onInitialScrollComplete={() => {
									isInitialLoadRef.current = false;
								}}
							/>
							{isPartnerTyping && <TypingIndicator partnerName={partnerName} />}
						</>
					)}
					{disabledInput && <ClosedConversationBanner />}
					<ChatInput
						value={inputValue}
						onChangeText={handleInputChange}
						onSend={handleSend}
						disabled={disabledInput}
						isSending={isSending}
					/>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

interface MessagesListProps {
	messages: MessageResponse[];
	userId?: string;
	theme: "light" | "dark";
	conversationId?: string;
	onInitialScrollComplete?: () => void;
}

const MessagesList = React.forwardRef<
	FlatList<MessageResponse>,
	MessagesListProps
>(
	(
		{ messages, userId, theme, conversationId, onInitialScrollComplete },
		ref
	) => {
		const hasScrolledToEndRef = React.useRef<boolean>(false);

		const handleContentSizeChange = React.useCallback(() => {
			if (
				!hasScrolledToEndRef.current &&
				messages.length > 0 &&
				ref &&
				"current" in ref &&
				ref.current
			) {
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						if (ref && "current" in ref && ref.current) {
							ref.current.scrollToEnd({ animated: false });
							hasScrolledToEndRef.current = true;
							onInitialScrollComplete?.();
						}
					});
				});
			}
		}, [messages.length, ref, onInitialScrollComplete]);

		React.useEffect(() => {
			hasScrolledToEndRef.current = false;
		}, [conversationId]);

		return (
			<FlatList
				ref={ref}
				contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
				data={messages}
				renderItem={({ item }) => (
					<MessageBubble
						message={item}
						isOwnMessage={item.authorId === userId}
						theme={theme}
					/>
				)}
				keyExtractor={(item) => item.id}
				keyboardShouldPersistTaps="handled"
				keyboardDismissMode="on-drag"
				showsVerticalScrollIndicator={false}
				onContentSizeChange={handleContentSizeChange}
			/>
		);
	}
);

MessagesList.displayName = "MessagesList";

interface TypingIndicatorProps {
	partnerName: string;
}

function TypingIndicator({ partnerName }: TypingIndicatorProps) {
	return (
		<View className="mx-4 mb-2 px-4 py-2">
			<Text className="text-sm italic text-typography-500 dark:text-typography-400">
				<Trans id="chat.typing">{partnerName} écrit...</Trans>
			</Text>
		</View>
	);
}

function ClosedConversationBanner() {
	return (
		<View className="mx-4 mb-2 rounded-2xl border border-outline-200 bg-white/80 px-4 py-2 dark:border-white/10 dark:bg-white/10">
			<Text className="text-xs text-typography-600 dark:text-typography-300">
				<Trans id="chat.closed">
					Conversation terminée. Tu peux revoir l&apos;historique mais pas écrire.
				</Trans>
			</Text>
		</View>
	);
}
