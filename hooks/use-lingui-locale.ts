import { i18n } from "@lingui/core";
import { useEffect } from "react";
import { useLocaleStore } from "./use-locale-store";

export const useLinguiLocale = () => {
	const { locale } = useLocaleStore();

	useEffect(() => {
		const loadMessages = async () => {
			try {
				if (locale === "fr") {
					const { messages } = await import("../src/locales/fr");
					i18n.loadAndActivate({ locale: "fr", messages });
				} else {
					const { messages } = await import("../src/locales/en");
					i18n.loadAndActivate({ locale: "en", messages });
				}
			} catch (error) {
				console.error("Failed to load locale messages:", error);
			}
		};

		loadMessages();
	}, [locale]);

	return { locale };
};
