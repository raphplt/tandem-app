import { useLocaleStore } from "@/hooks/use-locale-store";
import { i18n } from "@lingui/core";
import { useEffect } from "react";

export const useLinguiLocale = () => {
	const { locale } = useLocaleStore();

	useEffect(() => {
		// Load and activate the locale when it changes
		const loadMessages = async () => {
			try {
				if (locale === "fr") {
					const { messages } = await import("../locales/fr");
					i18n.load("fr", messages);
					i18n.activate("fr");
				} else {
					const { messages } = await import("../locales/en");
					i18n.load("en", messages);
					i18n.activate("en");
				}
			} catch (error) {
				console.error("Failed to load locale messages:", error);
			}
		};

		loadMessages();
	}, [locale]);

	return { locale };
};
