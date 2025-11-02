import { Href, Redirect, usePathname } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";

import { useAuthSession } from "@/hooks/use-auth-session";
import { useMyProfile } from "@/src/hooks/use-profiles";

export default function Index() {
	const {
		data: session,
		isLoading: isAuthLoading,
		isRefetching,
	} = useAuthSession();
	const { data: profile, isLoading: isProfileLoading } = useMyProfile();
	const pathname = usePathname();
	const tabRoute = "/(tabs)" as Href;
	const signInRoute = "/(auth)/sign-in" as Href;
	const onboardingRoute = "/(onboarding)/welcome" as Href;

	const shouldShowLoader = useMemo(
		() => isAuthLoading || isRefetching || isProfileLoading,
		[isAuthLoading, isRefetching, isProfileLoading]
	);

	if (shouldShowLoader) {
		return (
			<View className="flex-1 items-center justify-center bg-white dark:bg-black">
				<ActivityIndicator size="large" />
			</View>
		);
	}

	if (session) {
		if (pathname?.startsWith("/(tabs)")) {
			return null;
		}

		if (!profile) {
			return <Redirect href={onboardingRoute} />;
		}

		return <Redirect href={tabRoute} />;
	}

	return <Redirect href={signInRoute} />;
}
