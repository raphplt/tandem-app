import { useMemo, useState } from "react";
import { Trans } from "@lingui/react/macro";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, TextInput } from "react-native";

import {
	OnboardingGradientButton,
	OnboardingShell,
	StepIndicator,
} from "@/components/onboarding";
import { useAuthActions } from "@/hooks/use-auth-actions";
import { useOnboardingAnalytics } from "@/src/hooks/use-onboarding-analytics";
import { useOnboardingDraft } from "@/src/hooks/use-onboarding-draft";
import { useOnboardingStep } from "@/src/hooks/use-onboarding-step";
import { extractErrorMessage } from "@/src/utils/error";

export default function AuthEmailSignupScreen() {
	const router = useRouter();
	const params = useLocalSearchParams<{
		draftId?: string;
		draftToken?: string;
	}>();
	const onboardingProfile = useOnboardingDraft((state) => state.profile);
	const { signUp } = useAuthActions();
	const { trackContinue } = useOnboardingStep("auth-email");
const { trackAuthSuccess } = useOnboardingAnalytics();

	const [email, setEmail] = useState("");
	const [lastName, setLastName] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const isButtonDisabled = useMemo(() => {
		return (
			loading ||
			email.trim().length === 0 ||
			lastName.trim().length < 2 ||
			password.trim().length < 8 ||
			password !== confirmPassword
		);
	}, [confirmPassword, email, lastName, loading, password]);

	const handleSubmit = async () => {
		setError(null);
		setLoading(true);

		if (password !== confirmPassword) {
			setError("Les mots de passe ne correspondent pas.");
			setLoading(false);
			return;
		}

		try {
			await signUp({
				email: email.trim(),
				password,
				name: `${onboardingProfile.firstName ?? ""} ${lastName}`.trim(),
				draftId: params.draftId,
				draftToken: params.draftToken,
			});
			trackContinue({ method: "email-signup" });
			trackAuthSuccess("email", { kind: "signup" });
			router.replace("/(onboarding)/welcome");
		} catch (err) {
			setError(extractErrorMessage(err));
			setLoading(false);
		}
	};

	return (
		<OnboardingShell
			title={
				<Trans id="onboarding.auth.email.title">
					Finalise ton compte Tandem
				</Trans>
			}
			subtitle={
				<Trans id="onboarding.auth.email.subtitle">
					Choisis un email et un mot de passe pour sécuriser ton profil.
				</Trans>
			}
			headerAccessory={<StepIndicator current={9} total={9} />}
			footer={
				<OnboardingGradientButton
					label={<Trans id="onboarding.auth.email.cta">Créer mon compte</Trans>}
					onPress={handleSubmit}
					disabled={isButtonDisabled}
					loading={loading}
					accessibilityLabel="Créer mon compte Tandem"
				/>
			}
		>
			<Text className="text-sm font-body text-typography-500 dark:text-zinc-400">
				<Trans id="onboarding.auth.email.helper">
					Tu pourras te reconnecter avec ces identifiants.
				</Trans>
			</Text>

			<TextInput
				value={email}
				onChangeText={setEmail}
				autoCapitalize="none"
				autoComplete="email"
				keyboardType="email-address"
				placeholder="email@example.com"
				placeholderTextColor="#9ca3af"
				className="rounded-2xl border border-outline-200 bg-white px-4 py-3 font-body text-base text-typography-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
			/>

			<TextInput
				value={lastName}
				onChangeText={setLastName}
				autoCapitalize="words"
				autoComplete="name"
				placeholder="Ton nom"
				placeholderTextColor="#9ca3af"
				className="rounded-2xl border border-outline-200 bg-white px-4 py-3 font-body text-base text-typography-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
			/>

			<TextInput
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				autoComplete="password-new"
				placeholder="Mot de passe"
				placeholderTextColor="#9ca3af"
				className="rounded-2xl border border-outline-200 bg-white px-4 py-3 font-body text-base text-typography-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
			/>

			<TextInput
				value={confirmPassword}
				onChangeText={setConfirmPassword}
				secureTextEntry
				autoComplete="password-new"
				placeholder="Confirme ton mot de passe"
				placeholderTextColor="#9ca3af"
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
