import type { MessageResponse } from "@/types/message";
import { MessageStatus } from "@/types/message";
import { format } from "date-fns";
import { CheckCircleIcon } from "phosphor-react-native";
import { Text, View } from "react-native";

interface MessageBubbleProps {
	message: MessageResponse;
	isOwnMessage: boolean;
	theme: "light" | "dark";
}

export function MessageBubble({
	message,
	isOwnMessage,
	theme,
}: MessageBubbleProps) {
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
			<View className="mt-1 flex-row items-center gap-1">
				<Text className="text-[11px] uppercase tracking-[1px] text-typography-500 dark:text-typography-300">
					{timestamp}
				</Text>
				{isOwnMessage && (
					<MessageStatusIndicator status={message.status} theme={theme} />
				)}
			</View>
		</View>
	);
}

interface MessageStatusIndicatorProps {
	status: MessageStatus;
	theme: "light" | "dark";
}

function MessageStatusIndicator({
	status,
	theme,
}: MessageStatusIndicatorProps) {
	const isDark = theme === "dark";

	if (status === MessageStatus.READ) {
		// Double check bleu
		return (
			<View className="flex-row items-center">
				<CheckCircleIcon
					size={12}
					weight="fill"
					color={isDark ? "#A74660" : "#7A2742"}
				/>
				<CheckCircleIcon
					size={12}
					weight="fill"
					color={isDark ? "#A74660" : "#7A2742"}
					style={{ marginLeft: -4 }}
				/>
			</View>
		);
	}

	if (status === MessageStatus.DELIVERED) {
		// Double check gris
		return (
			<View className="flex-row items-center">
				<CheckCircleIcon
					size={12}
					weight="fill"
					color={isDark ? "#9CA3AF" : "#6B7280"}
				/>
				<CheckCircleIcon
					size={12}
					weight="fill"
					color={isDark ? "#9CA3AF" : "#6B7280"}
					style={{ marginLeft: -4 }}
				/>
			</View>
		);
	}

	// Sent: un seul check gris
	return (
		<CheckCircleIcon
			size={12}
			weight="fill"
			color={isDark ? "#9CA3AF" : "#6B7280"}
		/>
	);
}

