import { z } from "zod";
import { CompanySize } from "@prisma/client";
import { companyEmailSchema } from "@/lib/validations/email";
import { SALUTATIONS } from "@/lib/constants";

// The FULL lead schema — every field from the spec's Lead Form. Replaces
// Module 13's minimal (name + email + consent) scaffold now that the real
// form exists. initiateDownload() (Module 13, updated here) already
// accepted this shape structurally; only the placeholder values it used to
// fill in are gone now.
export const leadSchema = z.object({
  salutation: z.enum(SALUTATIONS, {
    errorMap: () => ({ message: "Select a salutation" }),
  }),
  fullName: z.string().min(2, "Enter your full name"),
  email: companyEmailSchema,
  phone: z.string().min(6, "Enter a valid phone number"),
  companyName: z.string().min(2, "Enter your company name"),
  jobTitle: z.string().min(2, "Enter your job title"),
  country: z.string().min(1, "Select a country"),
  // State/City are optional free text — see the COUNTRIES comment in
  // lib/constants.ts for why these aren't dependent dropdowns.
  state: z.string().optional().default(""),
  city: z.string().optional().default(""),
  department: z.string().min(1, "Select a department"),
  industry: z.string().min(1, "Select an industry"),
  companySize: z.nativeEnum(CompanySize, {
    errorMap: () => ({ message: "Select a company size" }),
  }),
  consentGiven: z.boolean().refine((value) => value === true, {
    message: "You must agree to continue",
  }),
});

export type LeadInput = z.infer<typeof leadSchema>;

// What the DownloadWizard's step-2 form actually collects — email was
// already captured and verified in step 1, so it's omitted here rather
// than asked for twice.
export const leadFormSchema = leadSchema.omit({ email: true });
export type LeadFormInput = z.infer<typeof leadFormSchema>;
