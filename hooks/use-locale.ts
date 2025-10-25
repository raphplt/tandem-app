import { useLocaleStore } from "./use-locale-store";

export const useLocale = () => {
	const { locale, setLocale } = useLocaleStore();

	const changeLocale = (newLocale: "en" | "fr") => {
		setLocale(newLocale);
	};

	return {
		locale,
		changeLocale,
	};
};
