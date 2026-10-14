import { z } from "zod";

export const services = ["Consultation", "Bilan de santé", "Échographie", "Prélèvement à domicile"] as const;

export const appointmentSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(30),
  email: z.union([z.literal(""), z.email().max(150)]).default(""),
  service: z.enum(services),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().trim().max(1000).default(""),
  website: z.string().max(0).optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(150),
  message: z.string().trim().min(5).max(3000),
  website: z.string().max(0).optional(),
});

export const adminLoginSchema = z.object({
  username: z.string().trim().min(3).max(50),
  password: z.string().min(8).max(200),
});

export const patientAccessSchema = z.object({
  patientNumber: z.string().trim().min(1).max(50),
  accessCode: z.string().min(1).max(200),
});

export const settingsSchema = z
  .object({
    username: z.string().trim().regex(/^[A-Za-z0-9_.-]{3,50}$/),
    displayName: z.string().trim().min(2).max(100),
    currentPassword: z.string().min(1).max(200),
    newPassword: z.union([z.literal(""), z.string().min(12).max(200)]),
    confirmPassword: z.string().max(200),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les nouveaux mots de passe ne correspondent pas.",
  });

export const blogSchema = z.object({
  id: z.coerce.number().int().nonnegative().default(0),
  title: z.string().trim().min(3).max(180),
  excerpt: z.string().trim().min(10).max(300),
  content: z.string().trim().min(20).max(50000),
  isPublished: z.boolean().default(false),
});
