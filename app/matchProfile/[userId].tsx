import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ConversationScreen() {
	const { userId: rawUserId } = useLocalSearchParams<{
		userId: string;
	}>();
	const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;

	return (
		<SafeAreaView className="flex-1 bg-background-0 dark:bg-background-950">
			<Text>Match Profile</Text>
			<Text>{userId}</Text>
		</SafeAreaView>
	);
}
