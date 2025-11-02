import { useAuthSession } from "@/hooks/use-auth-session";
import { Trans } from "@lingui/react/macro";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
	const { data: session, isLoading } = useAuthSession();

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center">
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return (
		<View className="flex-1 items-center justify-center">
			<Text className="text-3xl font-bold text-blue-500">
				<Trans id="home-screen.title">Bienvenue {session?.user?.firstName}!</Trans>
			</Text>
			<TouchableOpacity className="mt-4 px-4 py-2 bg-blue-500 rounded">
				<Text className="text-white text-xl">Trouver un match</Text>
			</TouchableOpacity>
		</View>
	);
}
