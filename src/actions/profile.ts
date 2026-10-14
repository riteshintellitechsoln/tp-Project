"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profileSchema, profileWithLeadSchema } from "@/lib/validations/profile";

type UpdateProfileResult =
  | { success: true; name: string }
  | { success: false; error: string };

// A user's details live in two places: the User row (account) and the
// Lead row (what they typed on the download form, matched by email). The
// download wizard pre-fills and quick-downloads from the Lead, so both
// are kept in sync here — otherwise the next download would still carry
// the old name/company.
export async function getMyProfile() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email || session.user.role !== "USER") return null;

  const [user, lead] = await Promise.all([
    db.user.findUnique({
      where: { email },
      select: {
        email: true,
        name: true,
        salutation: true,
        firstName: true,
        lastName: true,
        phone: true,
        companyName: true,
        jobTitle: true,
        createdAt: true,
      },
    }),
    db.lead.findUnique({
      where: { email },
      select: {
        salutation: true,
        country: true,
        state: true,
        city: true,
        department: true,
        industry: true,
        companySize: true,
      },
    }),
  ]);

  if (!user) return null;
  return { user, lead };
}

export async function updateMyProfile(input: unknown): Promise<UpdateProfileResult> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email || session.user.role !== "USER") {
    return { success: false, error: "Please sign in to update your profile." };
  }

  const [user, lead] = await Promise.all([
    db.user.findUnique({ where: { email }, select: { id: true } }),
    db.lead.findUnique({ where: { email }, select: { id: true } }),
  ]);
  if (!user) {
    return { success: false, error: "We couldn't find your account." };
  }

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  // Lead fields are only required (and only saved) when a Lead exists.
  const parsedLead = lead ? profileWithLeadSchema.safeParse(input) : null;
  if (parsedLead && !parsedLead.success) {
    return { success: false, error: parsedLead.error.issues[0]?.message ?? "Invalid input" };
  }

  const { salutation, firstName, lastName, phone, companyName, jobTitle } = parsed.data;
  const fullName = `${firstName} ${lastName}`.trim();

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { name: fullName, salutation, firstName, lastName, phone, companyName, jobTitle },
    });

    if (lead && parsedLead?.success) {
      const { country, state, city, department, industry, companySize } = parsedLead.data;
      await tx.lead.update({
        where: { id: lead.id },
        data: {
          salutation,
          fullName,
          phone,
          companyName,
          jobTitle,
          country,
          state: state || null,
          city: city || null,
          department,
          industry,
          companySize,
          userId: user.id,
        },
      });
    }
  });

  revalidatePath("/profile");
  return { success: true, name: fullName };
}
