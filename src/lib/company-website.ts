import { isCompanyEmailDomain } from "@/lib/validations/email";

export function deriveCompanyWebsiteFromEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const domain = trimmed.split("@")[1];
  if (!domain) return null;
  if (!isCompanyEmailDomain(trimmed)) return null;
  return `https://${domain}`;
}