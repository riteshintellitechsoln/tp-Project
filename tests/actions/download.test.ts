import { describe, expect, it, vi } from "vitest";

// db is mocked to THROW if touched at all. This test exists specifically
// to guard against a regression where someone reorders initiateDownload()
// and validation stops happening before the first database call — if that
// ever happens, this test fails loudly instead of the bug being discovered
// via a real (rejected) email quietly creating a Lead row anyway.
vi.mock("@/lib/db", () => ({
  db: {
    book: {
      findUnique: () => {
        throw new Error("db.book.findUnique should not be called for invalid input");
      },
    },
    lead: {
      upsert: () => {
        throw new Error("db.lead.upsert should not be called for invalid input");
      },
    },
    download: {
      create: () => {
        throw new Error("db.download.create should not be called for invalid input");
      },
    },
    $transaction: () => {
      throw new Error("db.$transaction should not be called for invalid input");
    },
  },
}));

import { initiateDownload } from "@/actions/download";

function baseInput() {
  return {
    salutation: "Ms" as const,
    fullName: "Jane Smith",
    email: "jane@acme.com",
    phone: "+1 555 123 4567",
    companyName: "Acme",
    jobTitle: "Director",
    country: "United States",
    state: "",
    city: "",
    department: "IT / Engineering",
    industry: "Information Technology",
    companySize: "SIZE_51_200" as const,
    consentGiven: true,
    bookSlug: "any-book",
  };
}

describe("initiateDownload — server-side validation short-circuit", () => {
  it("rejects a free-provider email before ever touching the database", async () => {
    const result = await initiateDownload({ ...baseInput(), email: "jane@gmail.com" });
    expect(result.success).toBe(false);
  });

  it("rejects a submission where consent was not actually given", async () => {
    const result = await initiateDownload({ ...baseInput(), consentGiven: false });
    expect(result.success).toBe(false);
  });

  it("rejects a companySize value outside the enum", async () => {
    const result = await initiateDownload({
      ...baseInput(),
      // @ts-expect-error — deliberately invalid to prove the schema catches it
      companySize: "ENORMOUS",
    });
    expect(result.success).toBe(false);
  });
});
