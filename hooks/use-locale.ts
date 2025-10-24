import { Locales } from "intlayer";
import { useLocaleStore } from "./use-locale-store";

export const useLocale = () => {
	const { locale, setLocale } = useLocaleStore();

	const changeLocale = (newLocale: Locales.ENGLISH | Locales.FRENCH) => {
		setLocale(newLocale);
		// Force a reload to apply the new locale
		if (typeof window !== "undefined") {
			window.location.reload();
		}
	};

	return {
		locale,
		changeLocale,
	};
};
