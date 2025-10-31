import { usePopularInterests } from "@/src/hooks/use-interests";
import { onboardingStep2Schema } from "@/src/lib/validations/onboarding";
import { useOnboardingStore } from "@/src/stores/onboarding-store";
import { Trans } from "@lingui/react/macro";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

export default function ProfileStep3Screen() {
	const router = useRouter();
	const { data, updateData } = useOnboardingStore();
	const { data: interests, isLoading } = usePopularInterests(20);
	const [selectedInterests, setSelectedInterests] = useState<string[]>(
		data.interests || []
	);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (data.interests) {
			setSelectedInterests(data.interests);
		}
	}, [data.interests]);

	const toggleInterest = (interestName: string) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		if (selectedInterests.includes(interestName)) {
			setSelectedInterests(selectedInterests.filter((i) => i !== interestName));
		} else if (selectedInterests.length < 5) {
			setSelectedInterests([...selectedInterests, interestName]);
		}
		setError(null);
	};

	const handleNext = () => {
		const result = onboardingStep2Schema.safeParse({
			interests: selectedInterests,
		});

		if (!result.success) {
			setError(result.error.issues[0].message);
			return;
		}

		updateData({ interests: selectedInterests });
		router.push("/(onboarding)/profile-step-4");
	};

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-white dark:bg-black">
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return (
		<ScrollView
			className="flex-1 bg-white dark:bg-black"
			contentContainerStyle={{ flexGrow: 1 }}
		>
			<View className="flex-1 justify-center px-6 py-12">
				<Text className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
					<Trans id="onboarding.profile.step3.title">
						Tes centres d&apos;intérêt
					</Trans>
				</Text>
				<Text className="text-base text-zinc-600 dark:text-zinc-400 mb-8">
					<Trans id="onboarding.profile.step3.subtitle">
						Sélectionne 3 à 5 intérêts qui te correspondent
					</Trans>
				</Text>

				<View className="flex-row flex-wrap gap-3 mb-8">
					{interests?.map((interest) => {
						const isSelected = selectedInterests.includes(interest.name);
						return (
							<TouchableOpacity
								key={interest.id}
								onPress={() => toggleInterest(interest.name)}
								className={`rounded-full px-4 py-2 border-2 ${
									isSelected
										? "bg-blue-600 border-blue-600"
										: "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
								}`}
							>
								<Text
									className={`text-sm font-medium ${
										isSelected ? "text-white" : "text-zinc-900 dark:text-zinc-100"
									}`}
								>
									{interest.name}
								</Text>
							</TouchableOpacity>
						);
					})}
				</View>

				{error && (
					<Text className="mb-4 text-sm text-red-600 dark:text-red-400">
						{error}
					</Text>
				)}

				<Text className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
					<Trans id="onboarding.profile.step3.selected">
						{selectedInterests.length} sélectionné(s) sur 5 maximum
					</Trans>
				</Text>

				<TouchableOpacity
					onPress={handleNext}
					disabled={selectedInterests.length < 3}
					className={`rounded-xl py-4 ${
						selectedInterests.length < 3
							? "bg-zinc-300 dark:bg-zinc-700"
							: "bg-blue-600"
					}`}
				>
					<Text className="text-center text-base font-semibold text-white">
						<Trans id="onboarding.common.continue">Continuer</Trans>
					</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
}
