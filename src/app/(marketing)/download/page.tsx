import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getBookPreview } from "@/actions/books";
import { DownloadWizard } from "@/components/download/download-wizard";
import { EmptyState } from "@/components/shared/empty-state";
import { BackButton } from "@/components/shared/back-button";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Download" };

interface DownloadPageProps {
  searchParams: Promise<{ book?: string; error?: string }>;
}

export default async function DownloadPage({ searchParams }: DownloadPageProps) {
  const { book: slug, error } = await searchParams;

  // No ?book= at all — someone navigated here directly rather than
  // clicking a Download button. Send them somewhere useful instead of
  // showing a broken form.
  if (!slug) {
    return (
      <div className="container max-w-lg py-20">
        <EmptyState
          title="Choose a resource to download"
          description="Head back to the catalog and pick something to download."
        />
        <div className="mt-6 flex justify-center">
          <Button asChild>
            <Link href="/category">Browse resources</Link>
          </Button>
        </div>
      </div>
    );
  }

  const book = await getBookPreview(slug);
  if (!book) notFound();

  return (
    <div className="container py-16">
      <div className="mx-auto mb-6 max-w-4xl">
        <BackButton fallbackHref={`/book/${book.slug}`} />
      </div>
      {error && (
        <div className="mx-auto mb-8 max-w-4xl rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
          {getErrorMessage(error)}
        </div>
      )}
      <DownloadWizard book={book} />
    </div>
  );
}

// Maps the error codes GET /api/download redirects back here with (an
// expired or tampered link, storage not yet configured) to a human message.
function getErrorMessage(code: string): string {
  switch (code) {
    case "expired":
      return "That download link has expired. Please request a new one below.";
    case "invalid-or-expired":
      return "That download link is invalid or has expired. Please request a new one below.";
    case "storage-not-configured":
      return "Your request was received, but file storage isn't fully configured yet — please try again shortly.";
    default:
      return "Something went wrong with your last download link. Please try again.";
  }
}
