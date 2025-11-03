import { Trans } from "@lingui/react/macro";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { OnboardingShell } from "@/components/onboarding";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useOnboardingDraft } from "@/src/hooks/use-onboarding-draft";
import { useOnboardingStep } from "@/src/hooks/use-onboarding-step";
import { useMyProfile } from "@/src/hooks/use-profiles";

export default function HomeGateScreen() {
	const router = useRouter();
	const { data: session } = useAuthSession();
	const resetDraft = useOnboardingDraft((state) => state.reset);
	const { trackContinue } = useOnboardingStep("home-gate");
	const { data: profile, isLoading, refetch, isError } = useMyProfile();

	useEffect(() => {
		if (!session) {
			router.replace("/(onboarding)/auth-gate");
		}
	}, [router, session]);

	useEffect(() => {
		if (!profile) return;
		resetDraft();
		trackContinue();
		router.replace("/(tabs)");
	}, [profile, resetDraft, router, trackContinue]);

	useEffect(() => {
		if (isLoading || isError) return;
		if (profile !== null) return;
		const timer = setTimeout(() => {
			refetch();
		}, 2000);
		return () => clearTimeout(timer);
	}, [isError, isLoading, profile, refetch]);

	return (
		<OnboardingShell
			title={<Trans id="onboarding.homeGate.title">Tout est prêt</Trans>}
			subtitle={
				<Trans id="onboarding.homeGate.subtitle">
					Nous récupérons ton profil côté Flint et préparons ton premier match.
				</Trans>
			}
		>
			<View className="items-center flex flex-col py-12" style={{ gap: 16 }}>
				<ActivityIndicator size="large" />
				<Text className="text-sm font-body text-typography-500 dark:text-zinc-400">
					{isLoading ? (
						<Trans id="onboarding.homeGate.loading">
							Synchronisation de ton compte en cours…
						</Trans>
					) : isError ? (
						<Trans id="onboarding.homeGate.error">
							Impossible de récupérer ton profil pour le moment. Réessaie dans un
							instant.
						</Trans>
					) : (
						<Trans id="onboarding.homeGate.success">
							Profil synchronisé, préparation du premier match…
						</Trans>
					)}
				</Text>
				{isError ? (
					<Text
						onPress={() => refetch()}
						className="text-sm font-semibold text-typography-500 underline dark:text-zinc-300"
					>
						<Trans id="onboarding.homeGate.retry">Réessayer</Trans>
					</Text>
				) : null}
			</View>
		</OnboardingShell>
	);
}
