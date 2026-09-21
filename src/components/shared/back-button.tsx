"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// Goes back to wherever the visitor came from. A page opened directly (new
// tab, shared link) has no history to go back to, so it falls back to
// `fallbackHref` instead of doing nothing.
export function BackButton({
  fallbackHref = "/",
  label = "Back",
}: {
  fallbackHref?: string;
  label?: string;
}) {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="-ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallbackHref);
      }}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}
