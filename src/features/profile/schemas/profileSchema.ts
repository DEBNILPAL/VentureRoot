import { z } from "zod";
import {
  isValidIndianState,
  validateDistrictForState,
  validateLocalityText,
} from "@/lib/data/indiaLocations";

export const profileSchema = z.object({
  // Basic Profile
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Valid phone number is required").optional().or(z.literal("")),

  // Location
  location: z.object({
    state: z.string().min(1, "State is required").refine(
      (val) => isValidIndianState(val),
      { message: "Please select a valid Indian State or Union Territory" }
    ),
    district: z.string().min(1, "District is required"),
    block: z.string().optional().or(z.literal("")),
    village: z.string().optional().or(z.literal("")),
  }).superRefine((loc, ctx) => {
    if (loc.state && loc.district) {
      const distValidation = validateDistrictForState(loc.state, loc.district);
      if (!distValidation.valid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            distValidation.errorMessage ||
            `Invalid district "${loc.district}" for ${loc.state}`,
          path: ["district"],
        });
      }
    }
    if (loc.block) {
      const bCheck = validateLocalityText(loc.block, "Block / Taluka");
      if (!bCheck.valid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: bCheck.errorMessage || "Invalid block name",
          path: ["block"],
        });
      }
    }
    if (loc.village) {
      const vCheck = validateLocalityText(loc.village, "Village / Town");
      if (!vCheck.valid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: vCheck.errorMessage || "Invalid village name",
          path: ["village"],
        });
      }
    }
  }),

  // Financial Background
  financial: z.object({
    availableCapital: z.number().min(0, "Capital cannot be negative"),
    income: z.number().min(0, "Income cannot be negative"),
  }),

  // Experience
  experience: z.object({
    businessExperience: z.enum(["None", "0-2 years", "3-5 years", "5+ years"]),
    skills: z.union([z.array(z.string()), z.string()]).optional().nullable(),
    education: z.string().optional().nullable(),
  }),
});

export type ProfileData = z.infer<typeof profileSchema>;
