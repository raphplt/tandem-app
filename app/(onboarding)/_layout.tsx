import { Stack } from "expo-router";

export default function OnboardingLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				animation: "fade_from_bottom",
				presentation: "card",
			}}
		>
			<Stack.Screen name="intro-values" />
			<Stack.Screen name="first-name" />
			<Stack.Screen name="gender-seeking" />
			<Stack.Screen name="birthdate" />
			<Stack.Screen name="location" />
			<Stack.Screen name="prefs-age-distance" />
			<Stack.Screen name="interests" />
			<Stack.Screen name="photos" />
			<Stack.Screen name="bio" />
			<Stack.Screen name="auth-gate" />
			<Stack.Screen name="welcome" />
			<Stack.Screen name="home-gate" />
		</Stack>
	);
}

