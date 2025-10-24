import { t, type Dictionary } from "intlayer";

const homeScreenContent = {
	key: "home-screen",
	content: {
		title: t({
			en: "Welcome!",
			fr: "Bienvenue !",
			es: "¡Bienvenido!",
		}),
	},
} satisfies Dictionary;

export default homeScreenContent;
