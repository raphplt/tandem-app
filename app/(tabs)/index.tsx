import { Box } from "@/components/ui/box";
import { Text, View } from "react-native";

export default function HomeScreen() {
	return (
		<View className="flex-1 items-center justify-center">
			<Text className="text-3xl font-bold text-blue-500">
				Welcome to Nativewind!
			</Text>

			<Box>
				<Text>Hello</Text>
			</Box>
		</View>
	);
}
