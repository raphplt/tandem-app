import { t, type Dictionary } from "intlayer";

const settingsContent = {
	key: "settings-screen",
	content: {
		title: t({
			en: "Settings",
			fr: "Paramètres",
		}),
		language: t({
			en: "Language",
			fr: "Langue",
		}),
		theme: t({
			en: "Theme",
			fr: "Thème",
		}),
		light: t({
			en: "Light",
			fr: "Clair",
		}),
		dark: t({
			en: "Dark",
			fr: "Sombre",
		}),
		system: t({
			en: "System",
			fr: "Système",
		}),
		english: t({
			en: "English",
			fr: "Anglais",
		}),
		french: t({
			en: "French",
			fr: "Français",
		}),
	},
} satisfies Dictionary;

export default settingsContent;
