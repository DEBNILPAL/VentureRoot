import { z } from "zod";

const locationSchema = z
  .object({
    state: z.string().trim().min(1),
    district: z.string().trim().min(1),
    block: z.string().trim().optional().or(z.literal("")),
    village: z.string().trim().optional().or(z.literal("")),
  })
  .passthrough();

const financialSchema = z
  .object({
    availableCapital: z.coerce.number().nonnegative().optional().default(0),
    income: z.coerce.number().nonnegative().optional().default(0),
  })
  .passthrough();

const experienceSchema = z
  .object({
    businessExperience: z
      .string()
      .trim()
      .min(1)
      .optional()
      .default("1-3 years"),

    skills: z
      .array(z.string().trim())
      .optional()
      .default([]),

    education: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),
  })
  .passthrough();

export const updateProfileSchema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required").max(201),
    email: z.string().email().optional().or(z.literal("")).or(z.undefined()),
    phone: z.string().trim().optional().or(z.literal("")).or(z.undefined()),
    location: locationSchema,
    financial: financialSchema,
    experience: experienceSchema,
  })
  .passthrough();