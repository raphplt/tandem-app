import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import * as Localization from "expo-localization";
import { messages as enMessages } from "../locales/en";
import { messages as frMessages } from "../locales/fr";

const locale = Localization.getLocales()[0]?.languageCode || "en";
const catalogs: Record<string, any> = { fr: frMessages, en: enMessages };

i18n.load(locale, catalogs[locale]);
i18n.activate(locale);

export { i18n, I18nProvider };
