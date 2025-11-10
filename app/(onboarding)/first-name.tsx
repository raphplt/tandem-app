import { Trans } from "@lingui/react/macro";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Text, TextInput, View } from "react-native";

import {
	OnboardingGradientButton,
	OnboardingShell,
	StepIndicator,
} from "@/components/onboarding";
import { useOnboardingDraft } from "@/src/hooks/use-onboarding-draft";
import { useOnboardingStep } from "@/src/hooks/use-onboarding-step";
import { onboardingFirstNameSchema } from "@/src/lib/validations/onboarding";
import { extractErrorMessage } from "@/src/utils/error";

export default function FirstNameScreen() {
	const router = useRouter();
	const profile = useOnboardingDraft((state) => state.profile);
	const updateProfile = useOnboardingDraft((state) => state.updateProfile);
	const saveDraft = useOnboardingDraft((state) => state.saveDraft);
	const { trackContinue } = useOnboardingStep("first-name");

	const [firstName, setFirstName] = useState(profile.firstName ?? "");
	const [intention, setIntention] = useState(profile.intention ?? "");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const isContinueDisabled = useMemo(
		() => firstName.trim().length === 0 || loading,
		[firstName, loading]
	);

	const handleContinue = async () => {
		setError(null);
		setLoading(true);

		const validation = onboardingFirstNameSchema.safeParse({
			firstName,
		});

		if (!validation.success) {
			setLoading(false);
			setError(validation.error.issues[0]?.message ?? null);
			return;
		}

		const trimmedName = validation.data.firstName.trim();
		const trimmedIntention = intention.trim();

		updateProfile({
			firstName: trimmedName,
			intention: trimmedIntention.length > 0 ? trimmedIntention : undefined,
		});

		try {
			await saveDraft({
				profile: {
					firstName: trimmedName,
					intention: trimmedIntention.length > 0 ? trimmedIntention : undefined,
				},
			});
			trackContinue();
			router.push("/(onboarding)/gender-seeking");
		} catch (err) {
			setError(extractErrorMessage(err));
		} finally {
			setLoading(false);
		}
	};

	return (
		<OnboardingShell
			title={<Trans id="onboarding.firstName.title">Quel est ton prénom ?</Trans>}
			subtitle={
				<Trans id="onboarding.firstName.subtitle">
					Dis-nous comment nous devrions t&apos;appeler et partage ton intention si
					tu le souhaites.
				</Trans>
			}
			headerAccessory={<StepIndicator current={1} total={9} />}
			footer={
				<OnboardingGradientButton
					label={<Trans id="onboarding.common.continue">Continuer</Trans>}
					onPress={handleContinue}
					disabled={isContinueDisabled}
					loading={loading}
					accessibilityLabel="Continuer vers les préférences de genre"
				/>
			}
		>
			<View className="flex flex-col" style={{ gap: 12 }}>
				<Text className="text-sm font-body text-typography-500 dark:text-zinc-400">
					<Trans id="onboarding.firstName.label">Prénom</Trans>
				</Text>
				<TextInput
					autoCapitalize="words"
					autoComplete="given-name"
					placeholder="ex : Alice"
					value={firstName}
					onChangeText={setFirstName}
					className="rounded-2xl border border-outline-200 bg-white px-4 py-3 font-body text-base text-typography-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
					returnKeyType="next"
				/>
			</View>

			<View className="flex flex-col" style={{ gap: 12 }}>
				<Text className="text-sm font-body text-typography-500 dark:text-zinc-400">
					<Trans id="onboarding.firstName.intentionLabel">
						Ton intention (facultatif)
					</Trans>
				</Text>
				<TextInput
					placeholder="ex : Construire une relation sincère"
					value={intention}
					onChangeText={setIntention}
					className="rounded-2xl border border-outline-200 bg-white px-4 py-3 font-body text-base text-typography-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
					returnKeyType="done"
				/>
			</View>

			{error ? (
				<Text className="text-sm font-body text-error-500" role="alert">
					{error}
				</Text>
			) : null}
		</OnboardingShell>
	);
}
