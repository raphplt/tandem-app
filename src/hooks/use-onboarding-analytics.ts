import { useCallback } from "react";
import { usePostHog } from "posthog-react-native";

import type { OnboardingStepKey } from "@/src/lib/onboarding/types";

type AnalyticsPayload = Record<string, unknown>;

export function useOnboardingAnalytics() {
	const posthog = usePostHog();

	const safeCapture = useCallback(
		(event: string, payload?: AnalyticsPayload) => {
			if (!posthog) {
				if (__DEV__) {
					console.info("[Onboarding][Analytics]", event, payload);
				}
				return;
			}
			posthog.capture(event, payload as any);
		},
		[posthog]
	);

	const trackStepView = useCallback(
		(step: OnboardingStepKey, extras?: AnalyticsPayload) => {
			safeCapture("onboarding_step_view", { step, ...extras });
		},
		[safeCapture]
	);

	const trackContinue = useCallback(
		(step: OnboardingStepKey, extras?: AnalyticsPayload) => {
			safeCapture("onboarding_continue", { step, ...extras });
		},
		[safeCapture]
	);

	const trackAuthSuccess = useCallback(
		(provider: string, extras?: AnalyticsPayload) => {
			safeCapture("auth_success", { provider, ...extras });
		},
		[safeCapture]
	);

	const trackProfilePublished = useCallback(
		(extras?: AnalyticsPayload) => {
			safeCapture("profile_published", extras);
		},
		[safeCapture]
	);

	return {
		trackStepView,
		trackContinue,
		trackAuthSuccess,
		trackProfilePublished,
	};
}
