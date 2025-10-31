import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Gender } from "@/types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface OnboardingData {
	// Étape 1: Identité
	firstName?: string;
	age?: number;

	// Étape 2: Centres d'intérêt
	interests?: string[]; // Noms d'intérêts sélectionnés

	// Étape 3: Bio
	bio?: string;

	// Étape 4: Photo
	photoUrl?: string;

	// Données supplémentaires nécessaires pour l'API
	city?: string;
	country?: string;
	gender?: Gender;
	interestedIn?: Gender[];
}

interface OnboardingStore {
	data: OnboardingData;
	currentStep: number;
	setCurrentStep: (step: number) => void;
	updateData: (data: Partial<OnboardingData>) => void;
	reset: () => void;
}

const initialState: OnboardingData = {
	firstName: undefined,
	age: undefined,
	interests: undefined,
	bio: undefined,
	photoUrl: undefined,
	city: undefined,
	country: undefined,
	gender: undefined,
	interestedIn: undefined,
};

export const useOnboardingStore = create<OnboardingStore>()(
	persist(
		(set) => ({
			data: initialState,
			currentStep: 0,
			setCurrentStep: (step) => set({ currentStep: step }),
			updateData: (partialData) =>
				set((state) => ({
					data: { ...state.data, ...partialData },
				})),
			reset: () =>
				set({
					data: initialState,
					currentStep: 0,
				}),
		}),
		{
			name: "onboarding-storage",
			storage: createJSONStorage(() => AsyncStorage),
		}
	)
);

