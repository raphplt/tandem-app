import { differenceInYears, isValid, parse } from "date-fns";
import { z } from "zod";

import { Gender } from "@/types/user";

export const MIN_ONBOARDING_AGE = 18;
export const MAX_ONBOARDING_AGE = 80;
export const MAX_DISTANCE_KM = 500;
export const MIN_DISTANCE_KM = 10;
export const MAX_INTERESTS = 5;
export const MIN_INTERESTS = 1;
export const MAX_BIO_LENGTH = 240;

export const onboardingFirstNameSchema = z.object({
	firstName: z
		.string({ error: "Ton prénom est requis" })
		.trim()
		.min(1, "Ton prénom est requis")
		.max(50, "Ton prénom ne peut pas dépasser 50 caractères"),
});

export const onboardingGenderSeekingSchema = z.object({
	gender: z.nativeEnum(Gender, { error: "Sélectionne ton genre" }),
	seeking: z
		.array(z.nativeEnum(Gender))
		.min(1, "Choisis au moins une préférence")
		.max(3, "Tu peux sélectionner jusqu'à trois préférences"),
});

const birthdateTransform = z
	.string({ error: "Renseigne ta date de naissance" })
	.trim()
	.refine((value) => {
		const parsed = parse(value, "dd/MM/yyyy", new Date());
		return isValid(parsed);
	}, "Format attendu : JJ/MM/AAAA")
	.transform((value, ctx) => {
		const parsed = parse(value, "dd/MM/yyyy", new Date());
		if (!isValid(parsed)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Format attendu : JJ/MM/AAAA",
			});
			return z.NEVER;
		}
		const age = differenceInYears(new Date(), parsed);
		if (age < MIN_ONBOARDING_AGE) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Tu dois avoir au moins 18 ans",
			});
			return z.NEVER;
		}
		return parsed.toISOString();
	});

export const onboardingBirthdateSchema = z.object({
	birthdate: birthdateTransform,
});

export const onboardingLocationSchema = z.object({
	city: z
		.string({ error: "Indique ta ville" })
		.trim()
		.min(2, "Indique ta ville"),
	country: z
		.string({ error: "Indique ton pays" })
		.trim()
		.min(2, "Indique ton pays"),
	coords: z
		.object({
			latitude: z
				.number({ error: "Latitude invalide" })
				.refine((value) => Math.abs(value) <= 90, "Latitude invalide"),
			longitude: z
				.number({ error: "Longitude invalide" })
				.refine((value) => Math.abs(value) <= 180, "Longitude invalide"),
		})
		.optional(),
});

export const onboardingPreferencesSchema = z
	.object({
		ageMin: z
			.number({ error: "Âge minimum invalide" })
			.int()
			.min(MIN_ONBOARDING_AGE, `Âge minimum ${MIN_ONBOARDING_AGE}+`) 
			.max(MAX_ONBOARDING_AGE, `Âge maximum ${MAX_ONBOARDING_AGE}`),
		ageMax: z
			.number({ error: "Âge maximum invalide" })
			.int()
			.min(MIN_ONBOARDING_AGE, `Âge maximum ${MIN_ONBOARDING_AGE}+`) 
			.max(MAX_ONBOARDING_AGE, `Âge maximum ${MAX_ONBOARDING_AGE}`),
		distanceKm: z
			.number({ error: "Distance invalide" })
			.int()
			.min(MIN_DISTANCE_KM, `Distance min ${MIN_DISTANCE_KM} km`)
			.max(MAX_DISTANCE_KM, `Distance max ${MAX_DISTANCE_KM} km`),
	})
	.refine((data) => data.ageMax >= data.ageMin, {
		message: "Âge maximum doit être supérieur ou égal", 
		path: ["ageMax"],
	});

export const onboardingInterestsSchema = z.object({
	interests: z
		.array(z.string())
		.min(MIN_INTERESTS, "Choisis au moins un centre d'intérêt")
		.max(MAX_INTERESTS, `Tu peux sélectionner ${MAX_INTERESTS} intérêts`),
});

export const onboardingBioSchema = z.object({
	bio: z
		.string({ error: "Écris une courte bio" })
		.trim()
		.min(10, "Écris quelques lignes pour te présenter")
		.max(MAX_BIO_LENGTH, `Maximum ${MAX_BIO_LENGTH} caractères`),
});
