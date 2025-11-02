import { useMemo, useState } from "react";
import { Trans } from "@lingui/react/macro";
import { useRouter } from "expo-router";
import { Text, TextInput } from "react-native";

import {
	OnboardingGradientButton,
	OnboardingShell,
	StepIndicator,
} from "@/components/onboarding";
import { useOnboardingDraft } from "@/src/hooks/use-onboarding-draft";
import { useOnboardingStep } from "@/src/hooks/use-onboarding-step";
import { onboardingBioSchema, MAX_BIO_LENGTH } from "@/src/lib/validations/onboarding";
import { extractErrorMessage } from "@/src/utils/error";

export default function BioScreen() {
	const router = useRouter();
	const profile = useOnboardingDraft((state) => state.profile);
	const updateProfile = useOnboardingDraft((state) => state.updateProfile);
	const saveDraft = useOnboardingDraft((state) => state.saveDraft);
	const { trackContinue } = useOnboardingStep("bio");

	const [bio, setBio] = useState(profile.bio ?? "");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const isContinueDisabled = useMemo(
		() => loading || bio.trim().length < 10,
		[bio, loading]
	);

	const handleContinue = async () => {
		setError(null);
		setLoading(true);

		const validation = onboardingBioSchema.safeParse({ bio });

		if (!validation.success) {
			setLoading(false);
			setError(validation.error.issues[0]?.message ?? null);
			return;
		}

		updateProfile({ bio: validation.data.bio });

		try {
			await saveDraft({
				profile: { bio: validation.data.bio },
			});
			trackContinue();
			router.push("/(onboarding)/auth-gate");
		} catch (err) {
			setError(extractErrorMessage(err));
		} finally {
			setLoading(false);
		}
	};

	return (
		<OnboardingShell
			title={<Trans id="onboarding.bio.title">Ton message d&apos;accueil</Trans>}
			subtitle={
				<Trans id="onboarding.bio.subtitle">
					Quelques lignes pour évoquer ton état d&apos;esprit, ce que tu cherches, ce qui
					t&apos;inspire.
				</Trans>
			}
			headerAccessory={<StepIndicator current={8} total={9} />}
			footer={
				<OnboardingGradientButton
					label={<Trans id="onboarding.common.continue">Continuer</Trans>}
					onPress={handleContinue}
					disabled={isContinueDisabled}
					loading={loading}
					accessibilityLabel="Continuer vers l’authentification"
				/>
			}
		>
			<TextInput
				value={bio}
				onChangeText={setBio}
				placeholder="Présente-toi en douceur..."
				multiline
				numberOfLines={6}
				maxLength={MAX_BIO_LENGTH}
				textAlignVertical="top"
				className="h-48 rounded-3xl border border-outline-200 bg-white px-4 py-4 font-body text-base text-typography-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
			/>
			<Text className="text-sm font-body text-typography-500 dark:text-zinc-400">
				{bio.length}/{MAX_BIO_LENGTH}
			</Text>
			{error ? (
				<Text className="text-sm font-body text-error-500" role="alert">
					{error}
				</Text>
			) : null}
		</OnboardingShell>
	);
}
