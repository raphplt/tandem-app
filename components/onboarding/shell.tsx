import {
	PropsWithChildren,
	ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type OnboardingShellProps = PropsWithChildren<{
	title: ReactNode;
	subtitle?: ReactNode;
	headerAccessory?: ReactNode;
	footer?: ReactNode;
	contentSpacing?: "loose" | "normal" | "tight";
	icon?: ReactNode;
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
	icon,
}: OnboardingShellProps) {
	const scrollViewRef = useRef<ScrollView>(null);
	const [keyboardHeight, setKeyboardHeight] = useState(0);
	const insets = useSafeAreaInsets();

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
				setTimeout(
					() => {
						scrollViewRef.current?.scrollTo({ y: 0, animated: true });
					},
					Platform.OS === "android" ? 100 : 0
				);
			}
		);

		return () => {
			keyboardWillShowListener.remove();
			keyboardDidHideListener.remove();
		};
	}, []);

	return (
		<KeyboardAvoidingView
			className="flex-1 bg-white dark:bg-black"
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<View
				className="flex-1"
				style={{
					paddingBottom:
						Platform.OS === "android" && keyboardHeight > 0
							? keyboardHeight + 10
							: Platform.OS === "ios"
							? 0
							: insets.bottom,
				}}
			>
				<ScrollView
					ref={scrollViewRef}
					className="flex-1"
					contentContainerStyle={{
						paddingHorizontal: 24,
						paddingTop: 80,
						paddingBottom: footer ? 24 : 80,
					}}
					keyboardShouldPersistTaps="handled"
					keyboardDismissMode="on-drag"
					showsVerticalScrollIndicator={false}
				>
					<View className="flex flex-col" style={{ gap: 32 }}>
						<View className="flex flex-col" style={{ gap: 24 }}>
							<View className="flex-row items-center justify-between">
								<View className="flex-1 flex-col" style={{ gap: 12 }}>
									{icon ? (
										<View className="flex items-center justify-center">{icon}</View>
									) : null}
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
				</ScrollView>

				{footer ? (
					<View
						className="bg-white px-6 py-4 dark:bg-black"
						style={{
							paddingBottom:
								Platform.OS === "android" && keyboardHeight > 0
									? 24
									: Math.max(insets.bottom, 16),
						}}
					>
						{footer}
					</View>
				) : null}
			</View>
		</KeyboardAvoidingView>
	);
}
