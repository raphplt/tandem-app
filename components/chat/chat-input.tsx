import { t } from "@lingui/macro";
import { PaperPlaneTilt } from "phosphor-react-native";
import { ActivityIndicator, Pressable, TextInput, View } from "react-native";

interface ChatInputProps {
	value: string;
	onChangeText: (next: string) => void;
	onSend: () => void;
	disabled?: boolean;
	isSending?: boolean;
}

export function ChatInput({
	value,
	onChangeText,
	onSend,
	disabled,
	isSending,
}: ChatInputProps) {
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

