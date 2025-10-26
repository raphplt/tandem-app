import { Href, Redirect, usePathname } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";

import { useAuthSession } from "@/hooks/use-auth-session";

export default function Index() {
	const { data, isLoading, isRefetching } = useAuthSession();
	const pathname = usePathname();
	const tabRoute = "/(tabs)" as Href;
	const signInRoute = "/(auth)/sign-in" as Href;

	const shouldShowLoader = useMemo(
		() => isLoading || isRefetching,
		[isLoading, isRefetching]
	);

	if (shouldShowLoader) {
		return (
			<View className="flex-1 items-center justify-center bg-white dark:bg-black">
				<ActivityIndicator size="large" />
			</View>
		);
	}

	if (data) {
		if (pathname?.startsWith("/(tabs)")) {
			return null;
		}

		return <Redirect href={tabRoute} />;
	}

	return <Redirect href={signInRoute} />;
}
