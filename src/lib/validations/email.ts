import { z } from "zod";

// Free/consumer email providers TradeHub rejects at the door — publishers
// are paying to reach business professionals, not personal inboxes. This
// list is deliberately a curated set of the well-known providers named in
// the spec (Gmail, Yahoo, Hotmail, Outlook.com, iCloud) plus a handful of
// other common ones, not an exhaustive database — Module 16's Settings
// screen is where an Admin could extend this without a code deploy, if
// that becomes necessary.
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "yahoo.co.in",
  "ymail.com",
  "hotmail.com",
  "hotmail.co.uk",
  "outlook.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
  "zoho.com",
  "mail.com",
  "gmx.com",
  "yandex.com",
  "qq.com",
  "163.com",
]);

export function isCompanyEmailDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return false;
  return !FREE_EMAIL_DOMAINS.has(domain);
}

export const companyEmailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Enter a valid email address")
  .refine(isCompanyEmailDomain, {
    message:
      "Please use your company email — free providers like Gmail, Yahoo, Hotmail, Outlook.com, and iCloud aren't accepted.",
  });
