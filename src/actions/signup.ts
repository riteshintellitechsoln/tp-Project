"use server";

 import { db } from "@/lib/db";
import { signupSchema, type SignupInput } from "@/lib/validations/signup";
import { generatePasswordSetToken } from "@/lib/password-reset-token";
import { sendSetPasswordEmail } from "@/lib/email/set-password";
import { deriveCompanyWebsiteFromEmail } from "@/lib/company-website";


type SignupResult = { success: true } | { success: false; error: string };

export async function signUpUser(input: SignupInput): Promise<SignupResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const email = parsed.data.email.toLowerCase().trim();

  const [existingAdmin, existingUser] = await Promise.all([
    db.admin.findUnique({ where: { email } }),
    db.user.findUnique({ where: { email } }),
  ]);

  if (existingAdmin || existingUser) {
    return { success: false, error: "An account with this email already exists." };
  }

  const { token, tokenHash, expiresAt } = generatePasswordSetToken();

   await db.user.create({
    data: {
      name: `${parsed.data.firstName} ${parsed.data.lastName}`,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email,
      phone: parsed.data.phone,
      companyName: parsed.data.companyName,
      companyWebsite: deriveCompanyWebsiteFromEmail(email),
      jobTitle: parsed.data.jobTitle,
      passwordResetTokenHash: tokenHash,
      passwordResetTokenExpiresAt: expiresAt,
    },
  });

  
  const setPasswordUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/set-password?token=${token}`;

  const emailResult = await sendSetPasswordEmail({
    to: email,
    firstName: parsed.data.firstName,
    setPasswordUrl,
  });

  if (!emailResult.success) {
    return {
      success: false,
      error: "Account created, but we couldn't send the password-setup email. Please contact support.",
    };
  }

  return { success: true };
}