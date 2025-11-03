import { useMemo, useState } from "react";
import { Trans } from "@lingui/react/macro";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, TextInput } from "react-native";

import {
 	OnboardingGradientButton,
 	OnboardingShell,
} from "@/components/onboarding";
import { useAuthActions } from "@/hooks/use-auth-actions";
import { useOnboardingStep } from "@/src/hooks/use-onboarding-step";
import { useOnboardingAnalytics } from "@/src/hooks/use-onboarding-analytics";
import { extractErrorMessage } from "@/src/utils/error";

export default function AuthEmailSigninScreen() {
	const router = useRouter();
	const params = useLocalSearchParams<{
		returnTo?: string;
		draftId?: string;
		draftToken?: string;
	}>();
	const { signIn } = useAuthActions();
	const { trackContinue } = useOnboardingStep("auth-email");
const { trackAuthSuccess } = useOnboardingAnalytics();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const isButtonDisabled = useMemo(() => {
		return loading || email.trim().length === 0 || password.trim().length === 0;
	}, [email, loading, password]);

	const handleSubmit = async () => {
		setError(null);
		setLoading(true);

		try {
			await signIn({
				email: email.trim(),
				password,
				draftId: params.draftId,
				draftToken: params.draftToken,
			});
			trackContinue({ method: "email-signin" });
			trackAuthSuccess("email", { kind: "signin" });
			const nextRoute =
				typeof params.returnTo === "string" && params.returnTo.length > 0
					? params.returnTo
					: "/(tabs)";
			router.replace(nextRoute);
		} catch (err) {
			setError(extractErrorMessage(err));
			setLoading(false);
		}
	};

	return (
		<OnboardingShell
			title={<Trans id="onboarding.auth.email.login.title">Connexion Tandem</Trans>}
			subtitle={
				<Trans id="onboarding.auth.email.login.subtitle">
					Renseigne ton email et ton mot de passe pour retrouver ton compte.
				</Trans>
			}
			footer={
				<OnboardingGradientButton
					label={<Trans id="onboarding.auth.email.login.cta">Me connecter</Trans>}
					onPress={handleSubmit}
					disabled={isButtonDisabled}
					loading={loading}
					accessibilityLabel="Connexion à Tandem"
				/>
			}
		>
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
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				autoComplete="password"
				placeholder="Mot de passe"
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
