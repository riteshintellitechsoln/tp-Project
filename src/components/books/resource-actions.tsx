// // "use client";

// // import { useEffect, useState } from "react";
// // import { Bookmark, Check, Ellipsis, EyeOff, Share2 } from "lucide-react";
// // import { toast } from "sonner";
// // import { Button } from "@/components/ui/button";
// // import {
// //   DropdownMenu,
// //   DropdownMenuContent,
// //   DropdownMenuItem,
// //   DropdownMenuSeparator,
// //   DropdownMenuTrigger,
// // } from "@/components/ui/dropdown-menu";

// // export function ResourceActions({ title, url }: { title: string; url: string }) {
// //   const [saved, setSaved] = useState(false);
// //   const storageKey = `tradehub:saved:${url}`;

// //   useEffect(() => {
// //     setSaved(window.localStorage.getItem(storageKey) === "true");
// //   }, [storageKey]);

// //   function toggleSaved() {
// //     const nextSaved = !saved;
// //     setSaved(nextSaved);
// //     window.localStorage.setItem(storageKey, String(nextSaved));
// //     toast.success(nextSaved ? "Saved for later" : "Removed from your saved list");
// //   }

// //   async function share() {
// //     const shareData = { title, text: `Take a look at ${title}` };
// //     try {
// //       if (navigator.share) await navigator.share(shareData);
// //       else {
// //         await navigator.clipboard.writeText(new URL(url, window.location.origin).toString());
// //         toast.success("Link copied to your clipboard");
// //       }
// //     } catch {
// //       // Dismissing the native share dialog is an expected user choice.
// //     }
// //   }

// //   return (
// //     <DropdownMenu>
// //       <DropdownMenuTrigger asChild>
// //         <Button
// //           variant="secondary"
// //           size="icon"
// //           className="h-8 w-8 rounded-full bg-background/90 shadow-sm backdrop-blur hover:bg-background"
// //           aria-label={`More choices for ${title}`}
// //         >
// //           <Ellipsis className="h-4 w-4" />
// //         </Button>
// //       </DropdownMenuTrigger>
// //       <DropdownMenuContent align="end" className="w-48">
// //         <DropdownMenuItem
// //           onClick={toggleSaved}
// //         >
// //           {saved ? <Check /> : <Bookmark />}
// //           {saved ? "Saved" : "Save for later"}
// //         </DropdownMenuItem>
// //         <DropdownMenuItem onClick={share}>
// //           <Share2 /> Share resource
// //         </DropdownMenuItem>
// //         <DropdownMenuSeparator />
// //         <DropdownMenuItem onClick={() => toast.info("We’ll show you fewer resources like this.")}>
// //           <EyeOff /> Not interested
// //         </DropdownMenuItem>
// //       </DropdownMenuContent>
// //     </DropdownMenu>
// //   );
// // }


// "use client";

// import { useEffect, useState } from "react";
// import { Bookmark, Check, Ellipsis, EyeOff, Share2 } from "lucide-react";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// const SAVED_BOOKS_KEY = "tradehub:saved-books";

// interface SavedBookEntry {
//   url: string;
//   title: string;
//   savedAt: number;
// }

// function readSavedBooks(): SavedBookEntry[] {
//   try {
//     const raw = window.localStorage.getItem(SAVED_BOOKS_KEY);
//     return raw ? (JSON.parse(raw) as SavedBookEntry[]) : [];
//   } catch {
//     return [];
//   }
// }

// function writeSavedBooks(entries: SavedBookEntry[]) {
//   window.localStorage.setItem(SAVED_BOOKS_KEY, JSON.stringify(entries));
// }

// export function ResourceActions({ title, url }: { title: string; url: string }) {
//   const [saved, setSaved] = useState(false);

//   useEffect(() => {
//     setSaved(readSavedBooks().some((entry) => entry.url === url));
//   }, [url]);

//   function toggleSaved() {
//     const current = readSavedBooks();
//     const alreadySaved = current.some((entry) => entry.url === url);

//     if (alreadySaved) {
//       writeSavedBooks(current.filter((entry) => entry.url !== url));
//       setSaved(false);
//       toast.success("Removed from your saved list");
//     } else {
//       writeSavedBooks([...current, { url, title, savedAt: Date.now() }]);
//       setSaved(true);
//       toast.success("Saved for later", {
//         description: "View everything you've saved on the Saved page.",
//       });
//     }
//   }

//   async function share() {
//     const shareData = { title, text: `Take a look at ${title}` };
//     try {
//       if (navigator.share) await navigator.share(shareData);
//       else {
//         await navigator.clipboard.writeText(new URL(url, window.location.origin).toString());
//         toast.success("Link copied to your clipboard");
//       }
//     } catch {
//       // Dismissing the native share dialog is an expected user choice.
//     }
//   }

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button
//           variant="secondary"
//           size="icon"
//           className="h-8 w-8 rounded-full bg-background/90 shadow-sm backdrop-blur hover:bg-background"
//           aria-label={`More choices for ${title}`}
//         >
//           <Ellipsis className="h-4 w-4" />
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end" className="w-48">
//         <DropdownMenuItem onClick={toggleSaved}>
//           {saved ? <Check /> : <Bookmark />}
//           {saved ? "Saved" : "Save for later"}
//         </DropdownMenuItem>
//         <DropdownMenuItem onClick={share}>
//           <Share2 /> Share resource
//         </DropdownMenuItem>
//         <DropdownMenuSeparator />
//         <DropdownMenuItem onClick={() => toast.info("We'll show you fewer resources like this.")}>
//           <EyeOff /> Not interested
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Bookmark, Check, Ellipsis, EyeOff, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isBookSaved, SAVED_BOOKS_EVENT, toggleSavedBook } from "@/lib/saved-books";

export function ResourceActions({ title, url }: { title: string; url: string }) {
  const [saved, setSaved] = useState(false);
  const { data: session } = useSession();
  const isSignedInUser = !!session?.user;

  useEffect(() => {
    const sync = () => setSaved(isBookSaved(url));
    sync();
    window.addEventListener(SAVED_BOOKS_EVENT, sync);
    return () => window.removeEventListener(SAVED_BOOKS_EVENT, sync);
  }, [url]);

  function handleToggleSaved() {
    const nowSaved = toggleSavedBook({ url, title });
    setSaved(nowSaved);
    toast.success(
      nowSaved ? "Saved for later" : "Removed from your saved list",
      nowSaved
        ? {
            description: isSignedInUser
              ? "View everything you've saved on the Saved page."
              : "Sign in to keep it — guest saves are cleared when you refresh.",
          }
        : undefined,
    );
  }

  async function share() {
    const shareData = { title, text: `Take a look at ${title}` };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(new URL(url, window.location.origin).toString());
        toast.success("Link copied to your clipboard");
      }
    } catch {
      // Dismissing the native share dialog is an expected user choice.
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 rounded-full bg-background/90 shadow-sm backdrop-blur hover:bg-background"
          aria-label={`More choices for ${title}`}
        >
          <Ellipsis className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleToggleSaved}>
          {saved ? <Check /> : <Bookmark />}
          {saved ? "Saved" : "Save for later"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={share}>
          <Share2 /> Share resource
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => toast.info("We'll show you fewer resources like this.")}>
          <EyeOff /> Not interested
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}