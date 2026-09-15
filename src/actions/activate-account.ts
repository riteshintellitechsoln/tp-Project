"use server";

import { db } from "@/lib/db";
import { generatePasswordSetToken } from "@/lib/password-reset-token";
import { sendSetPasswordEmail } from "@/lib/email/set-password";
import { deriveCompanyWebsiteFromEmail } from "@/lib/company-website";

type ActivateResult =
  | { success: true; mode: "created" | "reset" }
  | { success: false; error: string };

// Powers the "Set your password" prompt shown right after a successful
// download. Reuses the Lead record the person JUST filled in (name,
// phone, company, job title) instead of making them type all of that
// again on a separate Sign Up form — the whole point of this shortcut.
//
// If this email already has a User account, this becomes a password
// RESET instead of account creation — same token mechanism either way,
// just a different starting point.
export async function activateAccountForEmail(email: string): Promise<ActivateResult> {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await db.user.findUnique({ where: { email: normalizedEmail } });

  const { token, tokenHash, expiresAt } = generatePasswordSetToken();
  const setPasswordUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/set-password?token=${token}`;

  // Case 1: account already exists — this becomes a password reset.
  if (existingUser) {
    await db.user.update({
      where: { id: existingUser.id },
      data: { passwordResetTokenHash: tokenHash, passwordResetTokenExpiresAt: expiresAt },
    });

    const emailResult = await sendSetPasswordEmail({
      to: normalizedEmail,
      firstName: existingUser.firstName ?? existingUser.name ?? "there",
      setPasswordUrl,
    });

    if (!emailResult.success) {
      return { success: false, error: "Couldn't send the email. Please try again shortly." };
    }

    return { success: true, mode: "reset" };
  }

  // Case 2: no account yet — build one from the Lead data they already
  // gave us on the download form moments ago.
  const lead = await db.lead.findUnique({ where: { email: normalizedEmail } });
  if (!lead) {
    return { success: false, error: "We couldn't find a download for this email yet." };
  }

  const [firstNamePart, ...rest] = lead.fullName.trim().split(/\s+/);
  const lastNamePart = rest.join(" ");

  await db.user.create({
    data: {
      name: lead.fullName,
      firstName: firstNamePart || lead.fullName,
      lastName: lastNamePart || "",
      email: normalizedEmail,
      phone: lead.phone,
      companyName: lead.companyName,
      companyWebsite: deriveCompanyWebsiteFromEmail(normalizedEmail),
      jobTitle: lead.jobTitle,
      passwordResetTokenHash: tokenHash,
      passwordResetTokenExpiresAt: expiresAt,
    },
  });

  const emailResult = await sendSetPasswordEmail({
    to: normalizedEmail,
    firstName: firstNamePart || lead.fullName,
    setPasswordUrl,
  });

  if (!emailResult.success) {
    return {
      success: false,
      error: "Account created, but we couldn't send the email. Please try again shortly.",
    };
  }

  return { success: true, mode: "created" };
}