import { describe, expect, it } from "vitest";
import { leadSchema, leadFormSchema } from "@/lib/validations/lead";

function validLead() {
  return {
    salutation: "Ms" as const,
    fullName: "Jane Smith",
    email: "jane@acme.com",
    phone: "+1 555 123 4567",
    companyName: "Acme Corp",
    jobTitle: "IT Director",
    country: "United States",
    state: "California",
    city: "San Francisco",
    department: "IT / Engineering",
    industry: "Information Technology",
    companySize: "SIZE_51_200" as const,
    consentGiven: true,
  };
}

describe("leadSchema", () => {
  it("accepts a fully valid lead", () => {
    const result = leadSchema.safeParse(validLead());
    expect(result.success).toBe(true);
  });

  it("rejects a free-provider email even if every other field is valid", () => {
    const result = leadSchema.safeParse({ ...validLead(), email: "jane@gmail.com" });
    expect(result.success).toBe(false);
  });

  it("rejects consentGiven: false — the checkbox must actually be checked", () => {
    const result = leadSchema.safeParse({ ...validLead(), consentGiven: false });
    expect(result.success).toBe(false);
  });

  it("defaults state and city to empty strings when omitted", () => {
    const { state, city, ...rest } = validLead();
    const result = leadSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.state).toBe("");
      expect(result.data.city).toBe("");
    }
  });

  it("rejects an invalid companySize value not in the enum", () => {
    const result = leadSchema.safeParse({ ...validLead(), companySize: "HUGE" });
    expect(result.success).toBe(false);
  });
});

describe("leadFormSchema", () => {
  it("is leadSchema without the email field", () => {
    const lead = validLead();
    const withoutEmail = { ...lead, email: undefined };
    delete withoutEmail.email;
    const result = leadFormSchema.safeParse(withoutEmail);
    expect(result.success).toBe(true);
  });
});
