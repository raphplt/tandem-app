import { Trans } from "@lingui/react/macro";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	Text,
	TextInput,
	View,
} from "react-native";

import {
	OnboardingGradientButton,
	OnboardingShell,
	StepIndicator,
} from "@/components/onboarding";
import { useInterests } from "@/src/hooks/use-interests";
import { useOnboardingDraft } from "@/src/hooks/use-onboarding-draft";
import { useOnboardingStep } from "@/src/hooks/use-onboarding-step";
import {
	MAX_INTERESTS,
	onboardingInterestsSchema,
} from "@/src/lib/validations/onboarding";
import { extractErrorMessage } from "@/src/utils/error";

export default function InterestsScreen() {
	const router = useRouter();
	const interests = useOnboardingDraft((state) => state.interests);
	const setInterests = useOnboardingDraft((state) => state.setInterests);
	const saveDraft = useOnboardingDraft((state) => state.saveDraft);
	const { trackContinue } = useOnboardingStep("interests");
	const { data: allInterests, isLoading, isError, refetch } = useInterests();

	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState<string[]>(interests ?? []);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const filteredInterests = useMemo(() => {
		if (!allInterests || allInterests.length === 0) {
			return [];
		}
		const normalizedQuery = query.trim().toLowerCase();
		return allInterests
			.filter((interest) => {
				if (!normalizedQuery) return true;
				const haystack = `${interest.displayName ?? interest.name} ${
					interest.description ?? ""
				}`.toLowerCase();
				return haystack.includes(normalizedQuery);
			})
			.slice(0, 40);
	}, [allInterests, query]);

	const toggleInterest = (slug: string) => {
		setError(null);
		setSelected((prev) => {
			if (prev.includes(slug)) {
				return prev.filter((item) => item !== slug);
			}
			if (prev.length >= MAX_INTERESTS) {
				return prev;
			}
			return [...prev, slug];
		});
	};

	const handleContinue = async () => {
		setError(null);
		setLoading(true);

		const validation = onboardingInterestsSchema.safeParse({
			interests: selected,
		});

		if (!validation.success) {
			setLoading(false);
			setError(validation.error.issues[0]?.message ?? null);
			return;
		}

		setInterests(validation.data.interests);

		try {
			await saveDraft({
				interests: validation.data.interests,
			});
			trackContinue({ count: validation.data.interests.length });
			router.push("/(onboarding)/photos");
		} catch (err) {
			setError(extractErrorMessage(err));
		} finally {
			setLoading(false);
		}
	};

	return (
		<OnboardingShell
			title={<Trans id="onboarding.interests.title">Ce qui te fait vibrer</Trans>}
			subtitle={
				<Trans id="onboarding.interests.subtitle">
					Sélectionne jusqu&apos;à cinq centres d&apos;intérêt pour nourrir les conversations.
				</Trans>
			}
			headerAccessory={<StepIndicator current={6} total={9} />}
			footer={
				<OnboardingGradientButton
					label={<Trans id="onboarding.common.continue">Continuer</Trans>}
					onPress={handleContinue}
					disabled={loading || selected.length === 0}
					loading={loading}
					accessibilityLabel="Continuer vers les photos"
				/>
			}
		>
			<TextInput
				value={query}
				onChangeText={setQuery}
				placeholder="Recherche un centre d’intérêt"
				className="rounded-2xl border border-outline-200 bg-white px-4 py-3 font-body text-base text-typography-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
			/>

			<View className="flex-row items-center justify-between">
				<Text className="text-sm font-body text-typography-500 dark:text-zinc-400">
					<Trans id="onboarding.interests.counter">
						{selected.length} sélectionné(s) / {MAX_INTERESTS}
					</Trans>
				</Text>
				{isError ? (
					<Pressable onPress={() => refetch()}>
						<Text className="text-sm font-semibold text-error-500">
							<Trans id="onboarding.interests.retry">Réessayer</Trans>
						</Text>
					</Pressable>
				) : null}
			</View>

			{isLoading ? (
				<View className="items-center py-8">
					<ActivityIndicator />
				</View>
			) : (
				<View className="flex-row flex-wrap gap-2">
					{filteredInterests.map((interest) => {
						const slug = interest.id ?? interest.name;
						const selectedState = selected.includes(slug);
						return (
							<Pressable
								key={slug}
								onPress={() => toggleInterest(slug)}
								className={`rounded-full border px-4 py-2 ${
									selectedState
										? "border-accentGold-500 bg-accentGold-100"
										: "border-outline-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
								}`}
							>
								<Text
									className={`text-sm font-semibold ${
										selectedState
											? "text-accentGold-700"
											: "text-typography-600 dark:text-zinc-300"
									}`}
								>
									{interest.displayName ?? interest.name}
								</Text>
							</Pressable>
						);
					})}
				</View>
			)}

			{filteredInterests.length === 0 && !isLoading ? (
				<Text className="text-sm font-body text-typography-500 dark:text-zinc-400">
					<Trans id="onboarding.interests.empty">
						Aucun centre trouvé pour cette recherche.
					</Trans>
				</Text>
			) : null}

			{error ? (
				<Text className="text-sm font-body text-error-500" role="alert">
					{error}
				</Text>
			) : null}
		</OnboardingShell>
	);
}
