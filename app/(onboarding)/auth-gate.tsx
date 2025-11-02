import { useEffect, useMemo, useState } from "react";
import { Trans } from "@lingui/react/macro";
import { Stack, useRouter } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";

import {
	OnboardingGradientButton,
	OnboardingShell,
	StepIndicator,
} from "@/components/onboarding";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useOnboardingAnalytics } from "@/src/hooks/use-onboarding-analytics";
import { useOnboardingDraft } from "@/src/hooks/use-onboarding-draft";
import { useOnboardingStep } from "@/src/hooks/use-onboarding-step";

type AuthMode = "apple" | "google" | "phone" | "email";

export default function AuthGateScreen() {
	const router = useRouter();
	const { data: session } = useAuthSession();
	const { trackContinue } = useOnboardingStep("auth-gate");
	const { trackAuthSuccess } = useOnboardingAnalytics();
	const draftId = useOnboardingDraft((state) => state.draftId);
	const draftToken = useOnboardingDraft((state) => state.draftToken);
	const ensureDeviceId = useOnboardingDraft((state) => state.ensureDeviceId);
	const saveDraft = useOnboardingDraft((state) => state.saveDraft);
	const [isEnsuringDraft, setIsEnsuringDraft] = useState(false);
	const [lastMode, setLastMode] = useState<AuthMode>("email");

	const draftMeta = useMemo(
		() => ({ draftId, draftToken }),
		[draftId, draftToken]
	);

	useEffect(() => {
		if (session) {
			trackAuthSuccess(lastMode);
			router.replace("/(onboarding)/welcome");
		}
	}, [lastMode, router, session, trackAuthSuccess]);

	useEffect(() => {
		let canceled = false;
		(async () => {
			setIsEnsuringDraft(true);
			try {
				ensureDeviceId();
				if (!draftMeta.draftId || !draftMeta.draftToken) {
					await saveDraft();
				}
			} finally {
				if (!canceled) {
					setIsEnsuringDraft(false);
				}
			}
		})();
		return () => {
			canceled = true;
		};
	}, [draftMeta.draftId, draftMeta.draftToken, ensureDeviceId, saveDraft]);

	const navigateToAuth = (mode: AuthMode) => {
		if (!draftMeta.draftId || !draftMeta.draftToken) {
			Alert.alert(
				"Brouillon introuvable",
				"Impossible de poursuivre l’authentification. Réessaie dans un instant."
			);
			return;
		}

		setLastMode(mode);
		trackContinue({ mode });
		router.push({
			pathname: "/(auth)/sign-in",
			params: {
				draftId: draftMeta.draftId ?? "",
				draftToken: draftMeta.draftToken ?? "",
				returnTo: "/(onboarding)/welcome",
				mode,
			},
		});
	};

	const handleUnavailable = (mode: Exclude<AuthMode, "email">) => {
		Alert.alert(
			"Bientôt disponible",
			mode === "phone"
				? "La connexion par téléphone arrive très vite. En attendant, utilise ton adresse e-mail."
				: "Cette méthode d’authentification arrive très vite."
		);
	};

	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<OnboardingShell
				title={
					<Trans id="onboarding.authGate.title">
						Dernière étape : confirme ton compte
					</Trans>
				}
				subtitle={
					<Trans id="onboarding.authGate.subtitle">
						Ton brouillon est prêt. Connecte-toi pour le fusionner avec ton compte.
					</Trans>
				}
				headerAccessory={<StepIndicator current={9} total={9} />}
				footer={
				<View className="flex flex-col" style={{ gap: 12 }}>
						<OnboardingGradientButton
							label={
								<Trans id="onboarding.authGate.email">
									Continuer avec l&apos;email
								</Trans>
							}
							onPress={() => navigateToAuth("email")}
							disabled={isEnsuringDraft}
							loading={isEnsuringDraft}
							accessibilityLabel="Continuer avec l’authentification e-mail"
						/>
						<Pressable
							onPress={() =>
								router.push({
									pathname: "/(auth)/sign-up",
									params: {
										draftId: draftMeta.draftId ?? "",
										draftToken: draftMeta.draftToken ?? "",
										returnTo: "/(onboarding)/welcome",
									},
								})
							}
							disabled={isEnsuringDraft}
						>
							<Text className="text-center text-sm font-semibold text-typography-500 underline dark:text-zinc-300">
								<Trans id="onboarding.authGate.signup">Créer un nouveau compte</Trans>
							</Text>
						</Pressable>
					</View>
				}
			>
			<View className="flex flex-col" style={{ gap: 16 }}>
					<Pressable
						onPress={() => handleUnavailable("apple")}
						className="flex-row items-center justify-between rounded-3xl border border-outline-200 bg-white px-4 py-4 dark:border-zinc-700 dark:bg-zinc-900"
					>
						<Text className="text-base font-semibold text-typography-900 dark:text-zinc-100">
							<Trans id="onboarding.authGate.apple">Continuer avec Apple</Trans>
						</Text>
						<Text className="text-xs font-body text-typography-400 dark:text-zinc-500">
							<Trans id="onboarding.authGate.comingSoon">Bientôt</Trans>
						</Text>
					</Pressable>

					<Pressable
						onPress={() => handleUnavailable("google")}
						className="flex-row items-center justify-between rounded-3xl border border-outline-200 bg-white px-4 py-4 dark:border-zinc-700 dark:bg-zinc-900"
					>
						<Text className="text-base font-semibold text-typography-900 dark:text-zinc-100">
							<Trans id="onboarding.authGate.google">Continuer avec Google</Trans>
						</Text>
						<Text className="text-xs font-body text-typography-400 dark:text-zinc-500">
							<Trans id="onboarding.authGate.comingSoon">Bientôt</Trans>
						</Text>
					</Pressable>

					<Pressable
						onPress={() => handleUnavailable("phone")}
						className="flex-row items-center justify-between rounded-3xl border border-outline-200 bg-white px-4 py-4 dark:border-zinc-700 dark:bg-zinc-900"
					>
						<Text className="text-base font-semibold text-typography-900 dark:text-zinc-100">
							<Trans id="onboarding.authGate.phone">Continuer avec le téléphone</Trans>
						</Text>
						<Text className="text-xs font-body text-typography-400 dark:text-zinc-500">
							<Trans id="onboarding.authGate.comingSoon">Bientôt</Trans>
						</Text>
					</Pressable>
				</View>
			</OnboardingShell>
		</>
	);
}
