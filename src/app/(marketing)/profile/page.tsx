import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import type { Metadata } from "next";

import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/rbac";
import { getMyProfile } from "@/actions/profile";
import { ProfileForm } from "@/components/forms/profile-form";
import { SALUTATIONS, type Salutation } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "My Profile",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/profile");
  }

  // Admin accounts live in a separate table and have no download profile.
  if (isAdminRole(session.user.role)) {
    redirect("/admin");
  }

  const profile = await getMyProfile();

  if (!profile) {
    return (
      <div className="container max-w-md py-20 text-center">
        <p className="text-sm font-medium text-destructive">
          We couldn&apos;t load your profile. Please sign in again.
        </p>
        <Button asChild className="mt-6">
          <Link href="/login?callbackUrl=/profile">Sign in</Link>
        </Button>
      </div>
    );
  }

  const { user, lead } = profile;

  // Older accounts may only have `name` set — split it as a fallback.
  const [fallbackFirst = "", ...fallbackRest] = (user.name ?? "").trim().split(/\s+/);

  return (
    <div className="container max-w-3xl py-16">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-seal">
          Your account
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold">My Profile</h1>
        <div className="my-4 h-px w-16 bg-seal" />
        <p className="text-sm text-muted-foreground">
          These are the details you shared when downloading. Changes here are used to pre-fill
          your next download. Member since {format(user.createdAt, "MMM d, yyyy")}.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <ProfileForm
          defaults={{
            email: user.email,
            // Fall back to the download form's choice for accounts created before
            // salutation existed on User.
            salutation: toSalutation(user.salutation ?? lead?.salutation),
            firstName: user.firstName ?? fallbackFirst,
            lastName: user.lastName ?? fallbackRest.join(" "),
            phone: user.phone ?? "",
            companyName: user.companyName ?? "",
            jobTitle: user.jobTitle ?? "",
            lead,
          }}
        />
      </div>
    </div>
  );
}

function toSalutation(value: string | null | undefined): Salutation | null {
  return SALUTATIONS.find((s) => s === value) ?? null;
}
