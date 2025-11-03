import { Trans } from "@lingui/react/macro";
import { Link, useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

import {
	OnboardingGradientButton,
	OnboardingShell,
} from "@/components/onboarding";
import { useOnboardingAnalytics } from "@/src/hooks/use-onboarding-analytics";
import { useOnboardingDraft } from "@/src/hooks/use-onboarding-draft";

export default function IntroValuesScreen() {
	const router = useRouter();
	const setStep = useOnboardingDraft((state) => state.setStep);
	const ensureDeviceId = useOnboardingDraft((state) => state.ensureDeviceId);
	const { trackStepView, trackContinue } = useOnboardingAnalytics();

	useEffect(() => {
		setStep("intro-values");
		ensureDeviceId();
		trackStepView("intro-values");
	}, [ensureDeviceId, setStep, trackStepView]);

	const handleStart = () => {
		trackContinue("intro-values");
		router.push("/(onboarding)/first-name");
	};

	return (
		<OnboardingShell
			title={
				<Trans id="onboarding.intro.title">
					Une seule conversation par jour, tout en douceur.
				</Trans>
			}
			subtitle={
				<Trans id="onboarding.intro.subtitle">
					On vous accompagne pas à pas pour construire un profil authentique et
					apaisant.
				</Trans>
			}
			footer={
				<View className="flex flex-col" style={{ gap: 16 }}>
					<OnboardingGradientButton
						label="Commencer"
						accessibilityRole="button"
						onPress={handleStart}
					/>
					<View className="items-center">
						<Link
							href="/(auth)/sign-in"
							className="text-sm font-body text-typography-500 underline dark:text-zinc-400"
						>
							<Trans id="onboarding.intro.alreadyAccount">
								J&apos;ai déjà un compte
							</Trans>
						</Link>
					</View>
				</View>
			}
		>
			<View className="flex flex-col" style={{ gap: 16 }}>
				<Text className="text-center text-base font-body text-typography-500 dark:text-zinc-400">
					<Trans id="onboarding.intro.value1">
						Flint ralentit les choses pour que chaque échange compte.
					</Trans>
				</Text>
				<Text className="text-center text-base font-body text-typography-500 dark:text-zinc-400">
					<Trans id="onboarding.intro.value2">
						Vous ne verrez qu&apos;une rencontre par jour : soignez votre profil, on
						s&apos;occupe du reste.
					</Trans>
				</Text>
			</View>
		</OnboardingShell>
	);
}
