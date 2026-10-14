// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { Bookmark, Trash2 } from "lucide-react";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";

// const SAVED_BOOKS_KEY = "tradehub:saved-books";

// interface SavedBookEntry {
//   url: string;
//   title: string;
//   savedAt: number;
// }

// function readSavedBooks(): SavedBookEntry[] {
//   try {
//     const raw = window.localStorage.getItem(SAVED_BOOKS_KEY);
//     const entries = raw ? (JSON.parse(raw) as SavedBookEntry[]) : [];
//     return entries.sort((a, b) => b.savedAt - a.savedAt);
//   } catch {
//     return [];
//   }
// }

// export default function SavedBooksPage() {
//   const [entries, setEntries] = useState<SavedBookEntry[]>([]);
//   const [hasLoaded, setHasLoaded] = useState(false);

//   useEffect(() => {
//     setEntries(readSavedBooks());
//     setHasLoaded(true);
//   }, []);

//   function remove(url: string) {
//     const next = entries.filter((entry) => entry.url !== url);
//     setEntries(next);
//     window.localStorage.setItem(SAVED_BOOKS_KEY, JSON.stringify(next));
//     toast.success("Removed from your saved list");
//   }

//   return (
//     <div className="container py-12">
//       <div className="mb-8">
//         <p className="text-xs font-semibold uppercase tracking-[0.15em] text-seal">Your list</p>
//         <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">Saved for Later</h1>
//         <div className="my-4 h-px w-16 bg-seal" />
//         <p className="max-w-2xl text-muted-foreground">
//           Saved on this browser only — it won&apos;t follow you to another device. Click the
//           bookmark icon on any resource to add it here.
//         </p>
//       </div>

//       {!hasLoaded ? null : entries.length === 0 ? (
//         <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
//           <Bookmark className="h-8 w-8 text-muted-foreground" />
//           <p className="font-medium">Nothing saved yet</p>
//           <p className="max-w-sm text-sm text-muted-foreground">
//             Browse resources and use the &quot;⋯&quot; menu on any card to save it for later.
//           </p>
//           <Button asChild className="mt-2">
//             <Link href="/category">Browse resources</Link>
//           </Button>
//         </div>
//       ) : (
//         <div className="divide-y rounded-xl border">
//           {entries.map((entry) => (
//             <div key={entry.url} className="flex items-center justify-between gap-4 p-4">
//               <Link href={entry.url} className="font-medium hover:underline">
//                 {entry.title}
//               </Link>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => remove(entry.url)}
//                 aria-label={`Remove ${entry.title} from saved`}
//               >
//                 <Trash2 className="h-4 w-4" />
//               </Button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }


"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Bookmark, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BookGrid } from "@/components/books/book-grid";
import { BookCard } from "@/components/books/book-card";
import { BookGridSkeleton } from "@/components/books/book-grid-skeleton";
import { SectionHeader } from "@/components/home/section-header";
import {
  isSavedBooksReady,
  readSavedBooks,
  removeSavedBook,
  SAVED_BOOKS_EVENT,
} from "@/lib/saved-books";
import { getBooksBySlugs, getRecommendationsForSlugs } from "@/actions/books";
import type { BookCardData } from "@/types";

function slugFromUrl(url: string): string | null {
  const match = url.match(/\/book\/([^/?#]+)/);
  return match?.[1] ?? null;
}

export default function SavedBooksPage() {
  const [books, setBooks] = useState<BookCardData[]>([]);
  const [recommendations, setRecommendations] = useState<BookCardData[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [, startTransition] = useTransition();
  const { data: session, status } = useSession();
  const isSignedInUser = !!session?.user;

  useEffect(() => {
    function loadAll() {
      // A signed-in user's list is still coming from the server.
      if (!isSavedBooksReady()) {
        setHasLoaded(false);
        return;
      }
      const entries = readSavedBooks();
      const slugs = entries
        .map((e) => slugFromUrl(e.url))
        .filter((s): s is string => Boolean(s));

      startTransition(async () => {
        const [fullBooks, recs] = await Promise.all([
          getBooksBySlugs(slugs),
          getRecommendationsForSlugs(slugs.slice(0, 3), 4),
        ]);
        setBooks(fullBooks);
        setRecommendations(recs);
        setHasLoaded(true);
      });
    }

    loadAll();
    window.addEventListener(SAVED_BOOKS_EVENT, loadAll);
    return () => window.removeEventListener(SAVED_BOOKS_EVENT, loadAll);
  }, []);

  function handleRemove(book: BookCardData) {
    removeSavedBook(`/book/${book.slug}`);
    setBooks((prev) => prev.filter((b) => b.id !== book.id));
    toast.success("Removed from your saved list");
  }

  return (
    <div className="container py-12">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-seal">Your list</p>
        <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">Saved for Later</h1>
        <div className="my-4 h-px w-16 bg-seal" />
        <p className="max-w-2xl text-muted-foreground">
          Click the &quot;⋯&quot; menu on any resource to save it here.{" "}
          {isSignedInUser
            ? "Your list is saved to your account."
            : "You're browsing as a guest, so this list is cleared when you refresh the page."}
        </p>
        {status === "unauthenticated" && (
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/login?callbackUrl=/saved">Sign in to keep your saved list</Link>
          </Button>
        )}
      </div>

      {!hasLoaded ? (
        <BookGridSkeleton count={4} />
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <Bookmark className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">Nothing saved yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Browse resources and use the &quot;⋯&quot; menu on any card to save it for later.
          </p>
          <Button asChild className="mt-2">
            <Link href="/category">Browse resources</Link>
          </Button>
        </div>
      ) : (
        <>
          <BookGrid>
            {books.map((book) => (
              <div key={book.id} className="group/saved relative">
                <BookCard book={book} />
                {/* <button
                  type="button"
                  onClick={() => handleRemove(book)}
                  aria-label={`Remove ${book.title} from saved`}
                  className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-muted-foreground opacity-0 shadow-md backdrop-blur transition-all duration-200 hover:scale-110 hover:bg-destructive hover:text-destructive-foreground group-hover/saved:opacity-100"
                > */}

                <button
                  type="button"
                  onClick={() => handleRemove(book)}
                  aria-label={`Remove ${book.title} from saved`}
                  className="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-muted-foreground opacity-0 shadow-md backdrop-blur transition-all duration-200 hover:scale-110 hover:bg-destructive hover:text-destructive-foreground group-hover/saved:opacity-100"
                > 
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </BookGrid>

          {recommendations.length > 0 && (
            <div className="mt-16 border-t pt-12">
              <SectionHeader
                eyebrow="Based on what you saved"
                title="You might also like"
                description="Picked from the same topics as your top 3 saved resources."
              />
              <BookGrid>
                {recommendations.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </BookGrid>
            </div>
          )}
        </>
      )}
    </div>
  );
}