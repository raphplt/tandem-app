import { useLocaleStore } from "./use-locale-store";

export const useLocale = () => {
	const { locale, setLocale } = useLocaleStore();

	const changeLocale = (newLocale: "en" | "fr") => {
		setLocale(newLocale);
		// No need to reload the page with LinguiJS
	};

	return {
		locale,
		changeLocale,
	};
};
