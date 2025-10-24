const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

module.exports = (async () => {
	const defaultConfig = getDefaultConfig(__dirname);
	return withNativeWind(defaultConfig, { input: "./global.css" });
})();
