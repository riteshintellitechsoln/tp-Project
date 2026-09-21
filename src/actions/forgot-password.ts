"use server";

import { db } from "@/lib/db";
import { generatePasswordSetToken } from "@/lib/password-reset-token";
import { sendSetPasswordEmail } from "@/lib/email/set-password";

type ForgotPasswordResult = { success: true } | { success: false; error: string };

export async function requestPasswordReset(email: string): Promise<ForgotPasswordResult> {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await db.user.findUnique({ where: { email: normalizedEmail } });

  if (!user) {
    return { success: true };
  }

  const { token, tokenHash, expiresAt } = generatePasswordSetToken();

  await db.user.update({
    where: { id: user.id },
    data: {
      passwordResetTokenHash: tokenHash,
      passwordResetTokenExpiresAt: expiresAt,
    },
  });

  const setPasswordUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/set-password?token=${token}`;

  await sendSetPasswordEmail({
    to: normalizedEmail,
    firstName: user.firstName ?? user.name ?? "there",
    setPasswordUrl,
  });

  return { success: true };
}