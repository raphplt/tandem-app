import { useEffect } from "react";
import { Trans } from "@lingui/react/macro";
import { useRouter } from "expo-router";

import { Text } from "react-native";
import {
	OnboardingGradientButton,
	OnboardingShell,
} from "@/components/onboarding";
import { useOnboardingAnalytics } from "@/src/hooks/use-onboarding-analytics";
import { useOnboardingDraft } from "@/src/hooks/use-onboarding-draft";

export default function WelcomeScreen() {
	const router = useRouter();
	const setStep = useOnboardingDraft((state) => state.setStep);
	const { trackStepView, trackContinue } = useOnboardingAnalytics();

	useEffect(() => {
		setStep("welcome");
		trackStepView("welcome");
	}, [setStep, trackStepView]);

	const handleContinue = () => {
		trackContinue("welcome");
		router.push("/(onboarding)/home-gate");
	};

	return (
		<OnboardingShell
			title={
				<Trans id="onboarding.welcome.postAuth.title">
					Bienvenue dans Tandem.
				</Trans>
			}
			subtitle={
				<Trans id="onboarding.welcome.postAuth.subtitle">
					Nous finalisons ton arrivée et préparons ta première connexion.
				</Trans>
			}
			footer={
				<OnboardingGradientButton
					label={
						<Trans id="onboarding.welcome.postAuth.cta">
							Continuer en douceur
						</Trans>
					}
					onPress={handleContinue}
					accessibilityLabel="Continuer vers l’écran de synchronisation"
				/>
			}
		>
			<Text className="text-center text-base font-body text-typography-500 dark:text-zinc-400">
				<Trans id="onboarding.welcome.postAuth.reminder">
					Ton brouillon vient d’être fusionné avec ton compte.
				</Trans>
			</Text>
		</OnboardingShell>
	);
}
