import { storage } from "@/storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LocaleType = "en" | "fr";

interface LocaleStore {
	locale: LocaleType;
	setLocale: (locale: LocaleType) => void;
}

export const useLocaleStore = create<LocaleStore>()(
	persist(
		(set) => ({
			locale: "fr",
			setLocale: (locale) => set({ locale }),
		}),
		{
			name: "locale-storage",
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
