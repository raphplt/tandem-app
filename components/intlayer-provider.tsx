import { useLocaleStore } from "@/hooks/use-locale-store";
import { useEffect } from "react";
import { IntlayerProvider } from "react-native-intlayer";

export function CustomIntlayerProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { locale } = useLocaleStore();

	useEffect(() => {
		// Force intlayer to use the stored locale
		if (typeof window !== "undefined" && window.intlayer) {
			window.intlayer.setLocale(locale);
		}
	}, [locale]);

	return <IntlayerProvider>{children}</IntlayerProvider>;
}
