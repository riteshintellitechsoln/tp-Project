import { z } from "zod";
import { CompanySize } from "@prisma/client";
import { SALUTATIONS } from "@/lib/constants";

// Account fields every signed-in User has (same rules as the signup form).
export const profileSchema = z.object({
  salutation: z.enum(SALUTATIONS, {
    errorMap: () => ({ message: "Select a salutation" }),
  }),
  firstName: z.string().trim().min(1, "Enter your first name"),
  lastName: z.string().trim().min(1, "Enter your last name"),
  phone: z.string().trim().min(6, "Enter a valid phone number"),
  companyName: z.string().trim().min(2, "Enter your company name"),
  jobTitle: z.string().trim().min(2, "Enter your job title"),
});

// Extra fields that only exist once the user has filled in the download
// (Lead) form — same rules as leadSchema so a saved profile is always a
// valid lead for the next quick download.
export const profileWithLeadSchema = profileSchema.extend({
  country: z.string().min(1, "Select a country"),
  state: z.string().optional().default(""),
  city: z.string().optional().default(""),
  department: z.string().min(1, "Select a department"),
  industry: z.string().min(1, "Select an industry"),
  companySize: z.nativeEnum(CompanySize, {
    errorMap: () => ({ message: "Select a company size" }),
  }),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type ProfileWithLeadInput = z.infer<typeof profileWithLeadSchema>;
