import { Stack } from "expo-router";

export default function OnboardingLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="welcome" />
			<Stack.Screen name="profile-step-1" />
			<Stack.Screen name="profile-step-2" />
			<Stack.Screen name="profile-step-3" />
			<Stack.Screen name="profile-step-4" />
			<Stack.Screen name="profile-step-5" />
			<Stack.Screen name="confirmation" />
		</Stack>
	);
}

