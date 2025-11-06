import { Trans } from "@lingui/react/macro";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Eye, EyeSlash } from "phosphor-react-native";
import { useMemo, useState } from "react";
import { Text, useColorScheme } from "react-native";

import {
	OnboardingGradientButton,
	OnboardingShell,
	StepIndicator,
} from "@/components/onboarding";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
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
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const colorScheme = useColorScheme();
	const passwordIconColor = colorScheme === "dark" ? "#d4d4d8" : "#6b7280";

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
				<Trans id="onboarding.auth.email.title">Finalise ton compte Tandem</Trans>
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

			<Input accessibilityLabel="Saisis ton nom">
				<InputField
					value={lastName}
					onChangeText={setLastName}
					autoCapitalize="words"
					autoComplete="name"
					placeholder="Ton nom"
				/>
			</Input>

			<Input accessibilityLabel="Choisis un mot de passe">
				<InputField
					value={password}
					onChangeText={setPassword}
					secureTextEntry={!passwordVisible}
					autoComplete="password-new"
					textContentType="newPassword"
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

			<Input accessibilityLabel="Confirme ton mot de passe">
				<InputField
					value={confirmPassword}
					onChangeText={setConfirmPassword}
					secureTextEntry={!confirmPasswordVisible}
					autoComplete="password-new"
					textContentType="newPassword"
					placeholder="Confirme ton mot de passe"
				/>
				<InputSlot
					onPress={() => setConfirmPasswordVisible((prev) => !prev)}
					hitSlop={10}
					accessibilityLabel={
						confirmPasswordVisible
							? "Masquer le mot de passe"
							: "Afficher le mot de passe"
					}
				>
					<InputIcon>
						{confirmPasswordVisible ? (
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
