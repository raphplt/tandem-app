import { i18n } from "@lingui/core";
import { useEffect } from "react";
import { useLocaleStore } from "./use-locale-store";

const localeLoaders = {
	en: () => import("../src/locales/en"),
	fr: () => import("../src/locales/fr"),
};

export const useLinguiLocale = () => {
	const { locale } = useLocaleStore();

	useEffect(() => {
		const loadMessages = async () => {
			try {
				const catalogModule = await localeLoaders[locale]();
				const messages =
					catalogModule.messages ?? catalogModule.default?.messages ?? null;

				if (!messages) {
					console.warn(`Lingui: no messages found for locale "${locale}"`);
					return;
				}

				i18n.loadAndActivate({ locale, messages });
			} catch (error) {
				console.error("Failed to load locale messages:", error);
			}
		};

		loadMessages();
	}, [locale]);

	return { locale };
};
