import { Trans } from "@lingui/react/macro";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Eye, EyeSlash } from "phosphor-react-native";
import { useMemo, useState } from "react";
import { Text, useColorScheme } from "react-native";

import {
	OnboardingGradientButton,
	OnboardingShell,
} from "@/components/onboarding";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { useAuthActions } from "@/hooks/use-auth-actions";
import { useOnboardingAnalytics } from "@/src/hooks/use-onboarding-analytics";
import { useOnboardingStep } from "@/src/hooks/use-onboarding-step";
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
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const colorScheme = useColorScheme();
	const passwordIconColor = colorScheme === "dark" ? "#d4d4d8" : "#6b7280";

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
			router.replace(nextRoute as never);
		} catch (err) {
			setError(extractErrorMessage(err));
			setLoading(false);
		}
	};

	return (
		<OnboardingShell
			title={
				<Trans id="onboarding.auth.email.login.title">Connexion Tandem</Trans>
			}
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
			<Input accessibilityLabel="Saisis ton email">
				<InputField
					value={email}
					onChangeText={setEmail}
					autoCapitalize="none"
					autoComplete="email"
					keyboardType="email-address"
					placeholder="email@example.com"
				/>
			</Input>

			<Input accessibilityLabel="Saisis ton mot de passe">
				<InputField
					value={password}
					onChangeText={setPassword}
					secureTextEntry={!passwordVisible}
					autoComplete="password"
					textContentType="password"
					placeholder="Mot de passe"
				/>
				<InputSlot
					onPress={() => setPasswordVisible((prev) => !prev)}
					hitSlop={10}
					accessibilityLabel={
						passwordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"
					}
				>
					<InputIcon>
						{passwordVisible ? (
							<EyeSlash size={22} color={passwordIconColor} />
						) : (
							<Eye size={22} color={passwordIconColor} />
						)}
					</InputIcon>
				</InputSlot>
			</Input>

			{error ? (
				<Text className="text-sm font-body text-error-500" role="alert">
					{error}
				</Text>
			) : null}
		</OnboardingShell>
	);
}
