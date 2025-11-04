import { Redirect } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

import { useAuthSession } from "@/hooks/use-auth-session";
import { useMyProfile } from "@/src/hooks/use-profiles";

const ONBOARDING_START = "/(onboarding)/intro-values";
const ONBOARDING_RESUME = "/(onboarding)/welcome";
const HOME_ROUTE = "/(tabs)";

export default function Index() {
	const {
		data: session,
		isLoading: isAuthLoading,
		isRefetching: isAuthRefetching,
	} = useAuthSession();
	const {
		data: profile,
		isLoading: isProfileLoading,
		isFetching: isProfileFetching,
	} = useMyProfile({
		enabled: !!session?.sessionToken && !isAuthLoading && !isAuthRefetching,
	});

	const isLoading =
		isAuthLoading || isAuthRefetching || isProfileLoading || isProfileFetching;

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-white dark:bg-black">
				<ActivityIndicator size="large" />
				<Text className="mt-4 text-base text-typography-500 dark:text-zinc-400">
					Chargement…
				</Text>
			</View>
		);
	}

	if (!session) {
		return <Redirect href={ONBOARDING_START} />;
	}

	if (!profile) {
		return <Redirect href={ONBOARDING_RESUME} />;
	}

	return <Redirect href={HOME_ROUTE} />;
}
