// import type { Metadata } from "next";
// import Link from "next/link";
// import { CheckCircle2 } from "lucide-react";
// import { getBookPreview } from "@/actions/books";
// import { Button } from "@/components/ui/button";

// export const metadata: Metadata = { title: "Thank You" };

// interface ThankYouPageProps {
//   searchParams: Promise<{ book?: string }>;
// }

// export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
//   const { book: slug } = await searchParams;
//   const book = slug ? await getBookPreview(slug) : null;

//   return (
//     <div className="container flex min-h-[60vh] max-w-lg flex-col items-center justify-center py-20 text-center">
//       <CheckCircle2 className="h-12 w-12 text-success" />
//       <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl">You&apos;re all set</h1>
//       <p className="mt-2 text-muted-foreground">
//         {book ? (
//           <>
//             We&apos;ve sent <span className="font-medium text-foreground">{book.title}</span> to
//             your inbox — it should arrive within a couple of minutes.
//           </>
//         ) : (
//           "Your download link is on its way to your inbox."
//         )}
//       </p>
//       <p className="mt-1 text-sm text-muted-foreground">
//         Don&apos;t see it? Check your spam folder — the sender may need a moment.
//       </p>
//       <div className="mt-8 flex gap-3">
//         <Button asChild>
//           <Link href="/category">Browse more resources</Link>
//         </Button>
//         <Button variant="outline" asChild>
//           <Link href="/my-library">Go to My Library</Link>
//         </Button>
//       </div>
//     </div>
//   );
// }




import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getBookPreview } from "@/actions/books";
import { Button } from "@/components/ui/button";
import { SetPasswordPrompt } from "@/components/download/set-password-prompt";

export const metadata: Metadata = { title: "Thank You" };

interface ThankYouPageProps {
  searchParams: Promise<{ book?: string; email?: string }>;
}

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const { book: slug, email } = await searchParams;
  const book = slug ? await getBookPreview(slug) : null;

  return (
    <div className="container flex min-h-[60vh] max-w-lg flex-col items-center justify-center py-20 text-center">
      <CheckCircle2 className="h-12 w-12 text-success" />
      <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl">You&apos;re all set</h1>
      <p className="mt-2 text-muted-foreground">
        {book ? (
          <>
            We&apos;ve sent <span className="font-medium text-foreground">{book.title}</span> to
            your inbox — it should arrive within a couple of minutes.
          </>
        ) : (
          "Your download link is on its way to your inbox."
        )}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Don&apos;t see it? Check your spam folder — the sender may need a moment.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/category">Browse more resources</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/my-library">Go to My Library</Link>
        </Button>
      </div>

      {/* One-click account activation — only shown when we actually know
          which email just downloaded, since that's what lets this reuse
          their Lead data instead of asking them to fill Sign Up out
          separately. */}
      {email && <SetPasswordPrompt email={email} />}
    </div>
  );
}