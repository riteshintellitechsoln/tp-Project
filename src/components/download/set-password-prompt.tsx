"use client";

import { useState } from "react";
import { Loader2, KeyRound, MailCheck } from "lucide-react";
import { activateAccountForEmail } from "@/actions/activate-account";
import { Button } from "@/components/ui/button";

// Shown on the "You're all set" success screen right after a download —
// lets the person turn the Lead record they just created into a real,
// password-protected account with ONE click, no re-typing their name,
// phone, or company.
export function SetPasswordPrompt({ email }: { email: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setIsSubmitting(true);
    setError(null);
    const result = await activateAccountForEmail(email);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-left">
        <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-semibold">Check your email</p>
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent a link to <span className="font-medium text-foreground">{email}</span> —
            set your password there to access My Library anytime.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-left">
      <div className="flex items-start gap-3">
        <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="flex-1">
          <p className="text-sm font-semibold">Want to access your downloads anytime?</p>
          <p className="text-sm text-muted-foreground">
            Set a password for <span className="font-medium text-foreground">{email}</span> — no
            need to fill this form again.
          </p>
          {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
          <Button size="sm" className="mt-3" onClick={handleClick} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Set my password
          </Button>
        </div>
      </div>
    </div>
  );
}