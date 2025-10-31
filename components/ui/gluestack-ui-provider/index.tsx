import { OverlayProvider } from "@gluestack-ui/core/overlay/creator";
import { ToastProvider } from "@gluestack-ui/core/toast/creator";
import { useColorScheme } from "nativewind";
import React, { useEffect } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";
import { View, ViewProps } from "react-native";
import { config } from "./config";

export type ModeType = "light" | "dark" | "system";

export function GluestackUIProvider({
	mode = "light",
	...props
}: {
	mode?: ModeType;
	children?: React.ReactNode;
	style?: ViewProps["style"];
}) {
	const { colorScheme, setColorScheme } = useColorScheme();
	const systemColorScheme = useRNColorScheme();

	// Calculer le mode réel (convertir "system" en "light" ou "dark")
	const actualMode = mode === "system" 
		? (systemColorScheme ?? "light") 
		: mode;

	useEffect(() => {
		// NativeWind n'accepte que "light" ou "dark", pas "system"
		// Il faut convertir "system" en "light" ou "dark" basé sur le colorScheme du système
		setColorScheme(actualMode);
	}, [mode, actualMode, setColorScheme]);

	// Utiliser actualMode pour le style, avec fallback sur colorScheme si nécessaire
	const themeColorScheme = colorScheme ?? actualMode;

	return (
		<View
			style={[
				config[themeColorScheme as keyof typeof config],
				{ flex: 1, height: "100%", width: "100%" },
				props.style,
			]}
		>
			<OverlayProvider>
				<ToastProvider>{props.children}</ToastProvider>
			</OverlayProvider>
		</View>
	);
}
