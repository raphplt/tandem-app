import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Messages() {
	return (
		<SafeAreaView className="flex-1 bg-background-0 dark:bg-background-950">
			<View className="flex-1 gap-6 p-6">
				<Text className="text-3xl font-heading text-primary-500">Messages</Text>
				<Text className="text-base font-body text-typography-600 dark:text-typography-200">
					Palette custom NativeWind en action.
				</Text>
				<View className="rounded-2xl bg-background-muted p-4 dark:bg-background-700">
					<Text className="font-body text-typography-700 dark:text-typography-100">
						Les badges ci-dessous utilisent les nouvelles couleurs.
					</Text>
					<View className="mt-4 flex-row flex-wrap gap-3">
						<View className="rounded-full bg-success-100 px-3 py-1">
							<Text className="text-xs font-semibold uppercase tracking-widest text-success-700">
								Success
							</Text>
						</View>
						<View className="rounded-full bg-warning-100 px-3 py-1">
							<Text className="text-xs font-semibold uppercase tracking-widest text-warning-700">
								Warning
							</Text>
						</View>
						<View className="rounded-full bg-accentGold-200 px-3 py-1">
							<Text className="text-xs font-semibold uppercase tracking-widest text-info-700">
								Info
							</Text>
						</View>
						<View className="rounded-full bg-rose-100 px-3 py-1">
							<Text className="text-xs font-semibold uppercase tracking-widest text-error-700">
								Error
							</Text>
						</View>
					</View>
				</View>
			</View>
		</SafeAreaView>
	);
}
