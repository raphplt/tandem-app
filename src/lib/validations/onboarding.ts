import { z } from "zod";
import { Gender } from "@/types/user";

export const onboardingStep1Schema = z.object({
	firstName: z.string().min(1, "Le prénom est requis"),
	age: z.number().min(18, "Vous devez avoir au moins 18 ans").max(100, "Âge invalide"),
});

export const onboardingStep2Schema = z.object({
	interests: z.array(z.string()).min(3, "Sélectionnez au moins 3 intérêts").max(5, "Maximum 5 intérêts"),
});

export const onboardingStep3Schema = z.object({
	bio: z.string().min(10, "La bio doit contenir au moins 10 caractères").max(500, "La bio ne peut pas dépasser 500 caractères"),
});

export const createProfileSchema = z.object({
	bio: z.string().min(10).max(500),
	city: z.string().min(2).max(100),
	country: z.string().min(2).max(100).optional(),
	age: z.number().min(18).max(100),
	gender: z.nativeEnum(Gender),
	interestedIn: z.array(z.nativeEnum(Gender)).min(1),
	photoUrl: z.string().url().optional(),
});

