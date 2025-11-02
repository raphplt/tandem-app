/** @type {import('tailwindcss').Config} */
const primary = {
	0: "#B3B3B3",
	50: "#999999",
	100: "#808080",
	200: "#737373",
	300: "#666666",
	400: "#525252",
	500: "#333333",
	600: "#292929",
	700: "#1F1F1F",
	800: "#0D0D0D",
	900: "#0A0A0A",
	950: "#080808",
};

const secondary = {
	0: "#FDFDFD",
	50: "#FBFBFB",
	100: "#F6F6F6",
	200: "#F2F2F2",
	300: "#EDEDED",
	400: "#E6E6E7",
	500: "#D9D9DB",
	600: "#C6C7C7",
	700: "#BDBDBD",
	800: "#B1B1B1",
	900: "#A5A4A4",
	950: "#9D9D9D",
};

const tertiary = {
	0: "#FFFAF5",
	50: "#FFF2E5",
	100: "#FFE9D5",
	200: "#FED1AA",
	300: "#FDB474",
	400: "#FB9D4B",
	500: "#E78128",
	600: "#D7751F",
	700: "#B4621A",
	800: "#824917",
	900: "#6C3D13",
	950: "#543112",
};

const accentGold = {
	50: "#FCF5E3",
	100: "#F8E9B8",
	200: "#F0D68D",
	300: "#E6BF63",
	400: "#D6A53A",
	500: "#C08A12",
	600: "#9A6A00",
	700: "#7A5400",
	800: "#593E00",
	900: "#3B2A00",
};

const accentRose = {
	50: "#FFF5F8",
	100: "#FDE5ED",
	200: "#F9CFDA",
	300: "#F3B3C8",
	400: "#E08AA4",
	500: "#C85F7C",
	600: "#A74660",
	700: "#7A2742",
	800: "#51172B",
	900: "#2B0E18",
};

const error = {
	0: "#FEE9E9",
	50: "#FEE2E2",
	100: "#FECACA",
	200: "#FCA5A5",
	300: "#F87171",
	400: "#EF4444",
	500: "#E63535",
	600: "#DC2626",
	700: "#B91C1C",
	800: "#991B1B",
	900: "#7F1D1D",
	950: "#531313",
};

const success = {
	0: "#E4FFF4",
	50: "#CAFFE8",
	100: "#A2F1C0",
	200: "#84D3A2",
	300: "#66B584",
	400: "#489766",
	500: "#348352",
	600: "#2A7948",
	700: "#206F3E",
	800: "#166534",
	900: "#14532D",
	950: "#1B3224",
};

const warning = {
	0: "#FFF9F5",
	50: "#FFF4EC",
	100: "#FFE7D5",
	200: "#FECDAA",
	300: "#FDAD74",
	400: "#FB954B",
	500: "#E77828",
	600: "#D76C1F",
	700: "#B45A1A",
	800: "#824417",
	900: "#6C3813",
	950: "#542D12",
};

const info = {
	0: "#ECF8FE",
	50: "#C7EBFC",
	100: "#A2DDFA",
	200: "#7CCFF8",
	300: "#57C2F6",
	400: "#32B4F4",
	500: "#0DA6F2",
	600: "#0B8DCD",
	700: "#0973A8",
	800: "#075A83",
	900: "#05405D",
	950: "#032638",
};

const typography = {
	0: "#FEFEFF",
	50: "#F5F5F5",
	100: "#E5E5E5",
	200: "#DBDBDC",
	300: "#D4D4D4",
	400: "#A3A3A3",
	500: "#8C8C8C",
	600: "#737373",
	700: "#525252",
	800: "#404040",
	900: "#262627",
	950: "#171717",
	white: "#FFFFFF",
	gray: "#D4D4D4",
	black: "#181718",
};

const outline = {
	0: "#FDFEFE",
	50: "#F3F3F3",
	100: "#E6E6E6",
	200: "#DDDCDB",
	300: "#D3D3D3",
	400: "#A5A3A3",
	500: "#8C8D8D",
	600: "#737474",
	700: "#535252",
	800: "#414141",
	900: "#272624",
	950: "#1A1717",
};

const background = {
	0: "#FFFFFF",
	50: "#F6F6F6",
	100: "#F2F1F1",
	200: "#DCDBDB",
	300: "#D5D4D4",
	400: "#A2A3A3",
	500: "#8E8E8E",
	600: "#747474",
	700: "#535252",
	800: "#414040",
	900: "#272625",
	950: "#121212",
	error: "#FEF1F1",
	warning: "#FFF3EA",
	muted: "#F7F8F7",
	success: "#EDFCF2",
	info: "#EBF8FE",
	light: "#FBFBFB",
	dark: "#181719",
};

const indicator = {
	primary: "#373737",
	info: "#5399EC",
	error: "#B91C1C",
};

module.exports = {
	darkMode: "class",
	content: [
		"./app/**/*.{html,js,jsx,ts,tsx,mdx}",
		"./components/**/*.{html,js,jsx,ts,tsx,mdx}",
		"./utils/**/*.{html,js,jsx,ts,tsx,mdx}",
		"./*.{html,js,jsx,ts,tsx,mdx}",
		"./src/**/*.{html,js,jsx,ts,tsx,mdx}",
	],
	presets: [require("nativewind/preset")],
	important: "html",
	safelist: [
		{
			pattern:
				/(bg|border|text|stroke|fill)-(primary|secondary|tertiary|accentGold|accentRose|error|success|warning|info|typography|outline|background|indicator)-(0|50|100|200|300|400|500|600|700|800|900|950|white|gray|black|error|warning|muted|success|info|light|dark|primary)/,
		},
	],
	theme: {
		extend: {
			colors: {
				primary,
				secondary,
				tertiary,
				accentGold,
				accentRose,
				error,
				success,
				warning,
				info,
				typography,
				outline,
				background,
				indicator,
			},
			fontFamily: {
				heading: ["Fraunces_700Bold", "Fraunces", "sans-serif"],
				body: [
					"PlusJakartaSans_400Regular",
					"PlusJakartaSans",
					"Plus Jakarta Sans",
					"sans-serif",
				],
			},
			fontWeight: {
				extrablack: "950",
			},
			fontSize: {
				"2xs": "10px",
			},
			boxShadow: {
				"hard-1": "-2px 2px 8px 0px rgba(38, 38, 38, 0.20)",
				"hard-2": "0px 3px 10px 0px rgba(38, 38, 38, 0.20)",
				"hard-3": "2px 2px 8px 0px rgba(38, 38, 38, 0.20)",
				"hard-4": "0px -3px 10px 0px rgba(38, 38, 38, 0.20)",
				"hard-5": "0px 2px 10px 0px rgba(38, 38, 38, 0.10)",
				"soft-1": "0px 0px 10px rgba(38, 38, 38, 0.1)",
				"soft-2": "0px 0px 20px rgba(38, 38, 38, 0.2)",
				"soft-3": "0px 0px 30px rgba(38, 38, 38, 0.1)",
				"soft-4": "0px 0px 40px rgba(38, 38, 38, 0.1)",
			},
			backgroundImage: {
				brand: "linear-gradient(135deg, #D6A53A 0%, #E08AA4 45%, #9A6A00 100%)",
				hero: "linear-gradient(145deg, #0A0A0B 0%, #121315 30%, #7A5400 100%)",
				"rose-gold": "linear-gradient(120deg, #F3B3C8 0%, #F8E9B8 100%)",
			},
		},
	},
};
