import { t, type Dictionary } from "intlayer";

const tabsContent = {
	key: "tabs",
	content: {
		home: t({
			en: "Home",
			fr: "Accueil",
		}),
		explore: t({
			en: "Explore",
			fr: "Explorer",
		}),
		settings: t({
			en: "Settings",
			fr: "Paramètres",
		}),
	},
} satisfies Dictionary;

export default tabsContent;
