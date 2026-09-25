import { z } from "zod";
import {
  isValidIndianState,
  validateDistrictForState,
  validateLocalityText,
} from "@/lib/data/indiaLocations";

export const businessFormSchema = z
  .object({
    categoryId: z.string().min(1, "Business category is required"),
    state: z.string().min(1, "State is required"),
    district: z.string().min(1, "District is required"),
    block: z.string().optional(),
    village: z.string().optional(),
    availableMargin: z.number().min(5000, "Minimum available margin is ₹5,000"),
    existingResources: z.string().optional(),
    expectedRevenue: z.number().min(0, "Revenue cannot be negative"),
  })
  .superRefine((data, ctx) => {
    if (data.state && !isValidIndianState(data.state)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `"${data.state}" is not a recognized Indian State or Union Territory`,
        path: ["state"],
      });
    }

    if (data.state && data.district) {
      const distValidation = validateDistrictForState(data.state, data.district);
      if (!distValidation.valid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            distValidation.errorMessage ||
            `Invalid district "${data.district}" for ${data.state}`,
          path: ["district"],
        });
      }
    }

    if (data.block) {
      const blockCheck = validateLocalityText(data.block, "Block / Taluka");
      if (!blockCheck.valid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: blockCheck.errorMessage || "Invalid block or taluka name",
          path: ["block"],
        });
      }
    }

    if (data.village) {
      const villageCheck = validateLocalityText(data.village, "Village / Town");
      if (!villageCheck.valid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: villageCheck.errorMessage || "Invalid village or town name",
          path: ["village"],
        });
      }
    }
  });

export type BusinessFormValues = z.infer<typeof businessFormSchema>;

