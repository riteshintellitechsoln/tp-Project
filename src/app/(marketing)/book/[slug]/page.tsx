import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { format as formatDate } from "date-fns";
import { Calendar, Download, FileText, Globe } from "lucide-react";

import {
  getBookBySlug,
  getRelatedBooks,
  incrementBookViewCount,
} from "@/actions/books";
import { BackButton } from "@/components/shared/back-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookGrid } from "@/components/books/book-grid";
import { BookCard } from "@/components/books/book-card";
import { SectionHeader } from "@/components/home/section-header";
import { BOOK_FORMAT_OPTIONS } from "@/lib/constants";

interface BookDetailPageProps {
  params: Promise<{ slug: string }>;
}

// Real per-page SEO: OpenGraph + Twitter Card, since this is the page people
// actually paste into Slack/LinkedIn/email when sharing a resource — a
// missing preview image or a generic site-wide description here is the
// highest-cost place in the app to get SEO wrong.
export async function generateMetadata({
  params,
}: BookDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book || book.status !== "PUBLISHED") return {};

  const description =
    book.description.length > 155
      ? `${book.description.slice(0, 155)}...`
      : book.description;

  return {
    title: book.title,
    description,
    openGraph: {
      title: book.title,
      description,
      type: "book",
      images: [{ url: book.coverImageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: book.title,
      description,
      images: [book.coverImageUrl],
    },
  };
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  // Drafts/archived books 404 on the public site even if someone guesses
  // the slug — only Admin > Books (Module 16) can view non-published books.
  if (!book || book.status !== "PUBLISHED") notFound();

  void incrementBookViewCount(book.id).catch(() => {});

  const categorySlugs = book.categories.map((c) => c.category.slug);
  const relatedBooks = await getRelatedBooks({
    bookId: book.id,
    categorySlugs,
    limit: 4,
  });

  const formatLabel =
    BOOK_FORMAT_OPTIONS.find((opt) => opt.value === book.format)?.label ?? book.format;

  // schema.org structured data — the SEO spec section's "Structured Data"
  // requirement, made concrete on the one page it matters most for.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    description: book.description,
    image: book.coverImageUrl,
    inLanguage: book.language,
    ...(book.pages ? { numberOfPages: book.pages } : {}),
    ...(book.publishedAt ? { datePublished: book.publishedAt.toISOString() } : {}),
    publisher: { "@type": "Organization", name: book.company.name },
  };

  return (
    <div className="container py-12">
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mb-6">
        <BackButton fallbackHref="/category" />
      </div>

      <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
        <div>
          <div className="lg:sticky lg:top-24">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border shadow-md">
              <Image
                src={book.coverImageUrl}
                alt={book.title}
                fill
                sizes="(min-width: 1024px) 320px, 80vw"
                className="object-cover"
                priority
              />
            </div>
            <Button size="lg" className="mt-6 w-full" asChild>
              <Link href={`/download?book=${book.slug}`}>
                <Download className="h-4 w-4" />
                Download Free
              </Link>
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Business email required · No spam
            </p>
          </div>
        </div>

        <div>
          {book.categories[0] && (
            <Link
              href={`/category/${book.categories[0].category.slug}`}
              className="text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
            >
              {book.categories[0].category.name}
            </Link>
          )}

          <h1 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            {book.title}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            {book.company.logoUrl && (
              <div className="relative h-8 w-8 overflow-hidden rounded-full border bg-background">
                <Image
                  src={book.company.logoUrl}
                  alt={book.company.name}
                  fill
                  sizes="32px"
                  className="object-contain"
                />
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Published by{" "}
              <span className="font-medium text-foreground">{book.company.name}</span>
            </p>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-lg border bg-muted/30 p-4 sm:grid-cols-4">
            <div>
              <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                Format
              </dt>
              <dd className="mt-1 text-sm font-medium">{formatLabel}</dd>
            </div>
            {book.pages && (
              <div>
                <dt className="text-xs text-muted-foreground">Pages</dt>
                <dd className="mt-1 text-sm font-medium">{book.pages}</dd>
              </div>
            )}
            <div>
              <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                <Globe className="h-3.5 w-3.5" />
                Language
              </dt>
              <dd className="mt-1 text-sm font-medium">{book.language}</dd>
            </div>
            {book.publishedAt && (
              <div>
                <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Published
                </dt>
                <dd className="mt-1 text-sm font-medium">
                  {formatDate(book.publishedAt, "MMM yyyy")}
                </dd>
              </div>
            )}
          </dl>

          <div className="prose prose-sm mt-8 max-w-none text-foreground dark:prose-invert">
            {book.description
              .split("\n")
              .filter(Boolean)
              .map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
          </div>

          {book.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {book.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {relatedBooks.length > 0 && (
        <section className="mt-20 border-t pt-12">
          <SectionHeader eyebrow="You might also like" title="Related Resources" />
          <BookGrid>
            {relatedBooks.map((related) => (
              <BookCard key={related.id} book={related} />
            ))}
          </BookGrid>
        </section>
      )}
    </div>
  );
}
