import { useEffect } from "react";

import type { OnboardingStepKey } from "@/src/lib/onboarding/types";
import { useOnboardingAnalytics } from "@/src/hooks/use-onboarding-analytics";
import { useOnboardingDraft } from "@/src/hooks/use-onboarding-draft";

export function useOnboardingStep(step: OnboardingStepKey) {
	const setStep = useOnboardingDraft((state) => state.setStep);
	const { trackStepView, trackContinue } = useOnboardingAnalytics();

	useEffect(() => {
		setStep(step);
		trackStepView(step);
	}, [setStep, step, trackStepView]);

	return {
		trackContinue: (extras?: Record<string, unknown>) =>
			trackContinue(step, extras),
	};
}
