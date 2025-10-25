import { Trans } from "@lingui/macro";
import { Text, View } from "react-native";

export default function HomeScreen() {
	return (
		<View className="flex-1 items-center justify-center">
			<Text className="text-3xl font-bold text-blue-500">
				<Trans id="home-screen.title">Welcome!</Trans>
			</Text>

		</View>
	);
}
