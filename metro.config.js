const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Add alias configuration
config.resolver.alias = {
	"@": path.resolve(__dirname, "./"),
	"@/locales": path.resolve(__dirname, "./src/locales"),
};

module.exports = withNativeWind(config, { input: "./global.css" });
