const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { configMetroIntlayer } = require("react-native-intlayer/metro");

module.exports = (async () => {
	const defaultConfig = getDefaultConfig(__dirname);
	const intlayerConfig = await configMetroIntlayer(defaultConfig);

	return withNativeWind(intlayerConfig, { input: "./global.css" });
})();
