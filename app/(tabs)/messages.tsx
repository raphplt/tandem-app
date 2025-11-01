import { ThemedText } from "@/components/themed-text";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabTwoScreen() {
	return (
		<SafeAreaView className="flex-1">
			<View className="flex-1 p-6">
				<ThemedText className="text-2xl font-bold text-gray-800 dark:text-gray-200">
					Messages
				</ThemedText>
			</View>
		</SafeAreaView>
	);
}
