import { PropsWithChildren, ReactNode } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	View,
} from "react-native";

type OnboardingShellProps = PropsWithChildren<{
	title: ReactNode;
	subtitle?: ReactNode;
	headerAccessory?: ReactNode;
	footer?: ReactNode;
	contentSpacing?: "loose" | "normal" | "tight";
}>;

const contentGap = {
	loose: 24,
	normal: 16,
	tight: 12,
} as const;

export function OnboardingShell({
	title,
	subtitle,
	headerAccessory,
	children,
	footer,
	contentSpacing = "normal",
}: OnboardingShellProps) {
	return (
		<KeyboardAvoidingView
			className="flex-1 bg-white dark:bg-black"
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<ScrollView
				className="flex-1"
				contentContainerStyle={{
					flexGrow: 1,
				}}
				keyboardShouldPersistTaps="handled"
			>
				<View className="flex-1 justify-between px-6 py-16">
					<View className="flex flex-col" style={{ gap: 32 }}>
						<View className="flex flex-col" style={{ gap: 24 }}>
							<View className="flex-row items-center justify-between">
								<View className="flex-1 flex-col" style={{ gap: 12 }}>
									<Text className="text-3xl font-heading text-typography-900 dark:text-zinc-100">
										{title}
									</Text>
									{subtitle ? (
										<Text className="text-base font-body text-typography-500 dark:text-zinc-400">
											{subtitle}
										</Text>
									) : null}
								</View>
								{headerAccessory ? (
									<View className="ml-4">{headerAccessory}</View>
								) : null}
							</View>
						</View>

						<View
							className="flex flex-col"
							style={{ gap: contentGap[contentSpacing] }}
						>
							{children}
						</View>
					</View>

					{footer ? <View className="mt-12">{footer}</View> : null}
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
