import { Trans } from "@lingui/react/macro";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

import { useAuthActions } from "@/hooks/use-auth-actions";
import { useAuthSession } from "@/hooks/use-auth-session";
import { extractErrorMessage } from "@/src/utils/error";

type ErrorState =
	| { kind: "key"; key: "missing-details" }
	| { kind: "message"; message: string }
	| null;

export default function SignUpScreen() {
	const router = useRouter();
	const { signUp } = useAuthActions();
	const { data: session } = useAuthSession();
	const params = useLocalSearchParams<{
		draftId?: string;
		draftToken?: string;
		returnTo?: string;
		mode?: string;
	}>();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [error, setError] = useState<ErrorState>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const draftId = useMemo(() => {
		const value = params.draftId;
		return typeof value === "string" && value.length > 0 ? value : undefined;
	}, [params.draftId]);

	const draftToken = useMemo(() => {
		const value = params.draftToken;
		return typeof value === "string" && value.length > 0 ? value : undefined;
	}, [params.draftToken]);

	const returnTo = useMemo(() => {
		const value = params.returnTo;
		if (typeof value === "string" && value.length > 0) {
			return value;
		}
		return "#";
	}, [params.returnTo]);

	useEffect(() => {
		if (session) {
			router.replace(
				returnTo === "#" ? "/(onboarding)/welcome" : (returnTo as any)
			);
		}
	}, [returnTo, router, session]);

	const handleSubmit = async () => {
		if (!email || !password || !name) {
			setError({ kind: "key", key: "missing-details" });
			return;
		}

		setIsSubmitting(true);
		setError(null);

		try {
			const result = await signUp({
				email,
				password,
				name,
				draftId,
				draftToken,
			});
			if (result?.error) {
				throw result.error;
			}
		} catch (err: unknown) {
			setError({ kind: "message", message: extractErrorMessage(err) });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			className="flex-1 bg-white dark:bg-black"
		>
			<View className="flex-1 justify-center px-6">
				<Text className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">
					<Trans id="auth.signUp.title">Create your account</Trans>
				</Text>
				{/* {draftId && draftToken ? (
					<Text className="mb-4 text-sm text-zinc-600 dark:text-zinc-300">
					<Trans id="auth.signUp.onboardingResume">
							Nous lierons ton brouillon d&apos;onboarding à ton nouveau compte.
						</Trans>
					</Text>
				) : null} */}

				<View className="flex flex-col" style={{ gap: 16 }}>
					<View>
						<Text className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
							<Trans id="auth.signUp.name">Full name</Trans>
						</Text>
						<TextInput
							autoCapitalize="words"
							autoComplete="name"
							placeholder="Jane Doe"
							placeholderTextColor="#9ca3af"
							value={name}
							onChangeText={setName}
							className="rounded-xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
						/>
					</View>

					<View>
						<Text className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
							<Trans id="auth.signUp.email">Email</Trans>
						</Text>
						<TextInput
							autoCapitalize="none"
							autoComplete="email"
							keyboardType="email-address"
							placeholder="email@example.com"
							placeholderTextColor="#9ca3af"
							value={email}
							onChangeText={setEmail}
							className="rounded-xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
						/>
					</View>

					<View>
						<Text className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
							<Trans id="auth.signUp.password">Password</Trans>
						</Text>
						<TextInput
							secureTextEntry
							autoComplete="password"
							placeholder="********"
							placeholderTextColor="#9ca3af"
							value={password}
							onChangeText={setPassword}
							className="rounded-xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
						/>
					</View>
				</View>

				{error && (
					<Text className="mt-4 text-sm text-red-600 dark:text-red-400">
						{error.kind === "key" ? (
							<Trans id={`auth.signUp.error.${error.key}`}>
								Please share your name, email, and password.
							</Trans>
						) : (
							error.message
						)}
					</Text>
				)}

				<TouchableOpacity
					onPress={handleSubmit}
					disabled={isSubmitting}
					className="mt-8 rounded-xl bg-blue-600 py-4"
				>
					<Text className="text-center text-base font-semibold text-white">
						{isSubmitting ? (
							<Trans id="auth.signUp.submitting">Creating...</Trans>
						) : (
							<Trans id="auth.signUp.cta">Create account</Trans>
						)}
					</Text>
				</TouchableOpacity>

				<View className="mt-8 flex-row justify-center">
					<Text className="text-sm text-zinc-600 dark:text-zinc-300">
						<Trans id="auth.signUp.toSignIn">Already registered?</Trans>{" "}
						<Link
							href={{
								pathname: "/(auth)/sign-in",
								params: {
									draftId: draftId ?? "",
									draftToken: draftToken ?? "",
									returnTo,
								},
							}}
							className="font-semibold text-blue-600"
						>
							<Trans id="auth.signUp.goToSignIn">Sign in</Trans>
						</Link>
					</Text>
				</View>
			</View>
		</KeyboardAvoidingView>
	);
}
