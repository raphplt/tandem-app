import { storage } from "@/storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeStore {
	mode: ThemeMode;
	setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>()(
	persist(
		(set) => ({
			mode: "system",
			setMode: (mode) => set({ mode }),
		}),
		{
			name: "theme-storage",
			storage: {
				getItem: (name) => {
					const value = storage.getString(name);
					return value ? JSON.parse(value) : null;
				},
				setItem: (name, value) => {
					storage.set(name, JSON.stringify(value));
				},
				removeItem: (name) => {
					storage.remove(name);
				},
			},
		}
	)
);
