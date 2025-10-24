import { useIntlayer } from "react-intlayer";
import { Text, View } from "react-native";

export default function HomeScreen() {
	const { title } = useIntlayer("home-screen");

	return (
		<View className="flex-1 items-center justify-center">
			<Text className="text-3xl font-bold text-blue-500">{title}</Text>
		</View>
	);
}
