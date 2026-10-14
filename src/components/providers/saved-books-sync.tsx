"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { syncSavedBooks } from "@/lib/saved-books";

// Keeps the "Save for later" store in step with the session: loads the
// signed-in account's saved list from the database, and clears it on sign-out
// so the next person on this browser starts empty.
export function SavedBooksSync() {
  const { data: session, status } = useSession();
  // Any signed-in account (User or Admin) keeps its list in the database.
  const userKey = session?.user?.id ?? null;

  useEffect(() => {
    if (status === "loading") return;
    void syncSavedBooks(userKey !== null);
  }, [status, userKey]);

  return null;
}
