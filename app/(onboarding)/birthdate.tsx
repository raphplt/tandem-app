import { useMemo, useState } from "react";
import { Trans } from "@lingui/react/macro";
import { useRouter } from "expo-router";
import { Text, TextInput } from "react-native";
import { format, parseISO } from "date-fns";

import {
	OnboardingGradientButton,
	OnboardingShell,
	StepIndicator,
} from "@/components/onboarding";
import { useOnboardingDraft } from "@/src/hooks/use-onboarding-draft";
import { useOnboardingStep } from "@/src/hooks/use-onboarding-step";
import { onboardingBirthdateSchema } from "@/src/lib/validations/onboarding";
import { extractErrorMessage } from "@/src/utils/error";
import { formatBirthdateInput } from "@/src/utils/date";

export default function BirthdateScreen() {
	const router = useRouter();
	const profile = useOnboardingDraft((state) => state.profile);
	const updateProfile = useOnboardingDraft((state) => state.updateProfile);
	const saveDraft = useOnboardingDraft((state) => state.saveDraft);
	const { trackContinue } = useOnboardingStep("birthdate");

	const [birthdateInput, setBirthdateInput] = useState(() => {
		if (!profile.birthdate) return "";
		try {
			return format(parseISO(profile.birthdate), "dd/MM/yyyy");
		} catch {
			return "";
		}
	});
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const isContinueDisabled = useMemo(
		() => birthdateInput.trim().length < 8 || loading,
		[birthdateInput, loading]
	);

	const handleContinue = async () => {
		setError(null);
		setLoading(true);

		const validation = onboardingBirthdateSchema.safeParse({
			birthdate: birthdateInput,
		});

		if (!validation.success) {
			setLoading(false);
			setError(validation.error.issues[0]?.message ?? null);
			return;
		}

		updateProfile({ birthdate: validation.data.birthdate });

		try {
			await saveDraft({
				profile: { birthdate: validation.data.birthdate },
			});
			trackContinue();
			router.push("/(onboarding)/location");
		} catch (err) {
			setError(extractErrorMessage(err));
		} finally {
			setLoading(false);
		}
	};

	return (
		<OnboardingShell
			title={<Trans id="onboarding.birthdate.title">Ton anniversaire</Trans>}
			subtitle={
				<Trans id="onboarding.birthdate.subtitle">
					Nous vérifions simplement que tu as au moins 18 ans pour rejoindre Tandem.
				</Trans>
			}
			headerAccessory={<StepIndicator current={3} total={9} />}
			footer={
				<OnboardingGradientButton
					label={<Trans id="onboarding.common.continue">Continuer</Trans>}
					onPress={handleContinue}
					disabled={isContinueDisabled}
					loading={loading}
					accessibilityLabel="Continuer vers ta localisation"
				/>
			}
		>
			<Text className="text-sm font-body text-typography-500 dark:text-zinc-400">
				<Trans id="onboarding.birthdate.helper">
					Format JJ/MM/AAAA (ex : 14/07/1994)
				</Trans>
			</Text>
	<TextInput
		value={birthdateInput}
		onChangeText={(value) => setBirthdateInput(formatBirthdateInput(value))}
				placeholder="JJ/MM/AAAA"
				keyboardType="number-pad"
				maxLength={10}
				className="rounded-2xl border border-outline-200 bg-white px-4 py-3 font-body text-base text-typography-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
			/>
			{error ? (
				<Text className="text-sm font-body text-error-500" role="alert">
					{error}
				</Text>
			) : null}
		</OnboardingShell>
	);
}
