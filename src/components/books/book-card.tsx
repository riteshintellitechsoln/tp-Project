import Link from "next/link";
import Image from "next/image";
import { Eye, Download } from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { ResourceActions } from "@/components/books/resource-actions";
import type { BookCardData } from "@/types";

// The reusable Book Card — built here in Module 9 because the Home page
// needs it first, but this exact component is what Module 10 (Category
// pages), Module 11 (Books/Search), and Module 12 (related books) all reuse.
//
// The signature interaction: hovering the cover reveals a torn-ticket-style
// "Download Pass" panel — a deliberate nod to the library-checkout subject
// matter, kept as the one bold visual moment on an otherwise quiet card.
//
// Structural note: the full cover and the two action links are DOM
// SIBLINGS (not nested) inside the same relative container — this is what
// lets "click anywhere on the cover to view" and "click Download inside the
// hover panel" both work without illegally nesting an <a> inside an <a>.
export function BookCard({
  book,
  badge,
}: {
  book: BookCardData;
  badge?: { label: string; variant?: BadgeProps["variant"] };
}) {
  const category = book.categories[0]?.category;

  return (
    <div className="group flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl border bg-muted shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
        <Link
          href={`/book/${book.slug}`}
          className="absolute inset-0 z-0 block"
          aria-label={`View ${book.title}`}
        >
          <Image
            src={book.coverImageUrl}
            alt={book.title}
            fill
            sizes="(min-width: 1024px) 240px, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
          />
        </Link>

        {badge && (
          <Badge
            variant={badge.variant ?? "seal"}
            className="pointer-events-none absolute left-2 top-2 z-10 text-[10px] uppercase tracking-wide"
          >
            {badge.label}
          </Badge>
        )}

        <div className="absolute right-2 top-2 z-30 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
          <ResourceActions title={book.title} url={`/book/${book.slug}`} />
        </div>

        {/* "Download Pass" — slides up from the bottom edge on hover. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 translate-y-full border-t-2 border-dashed border-background/70 bg-background/95 p-3 backdrop-blur transition-transform duration-300 ease-out group-hover:translate-y-0">
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Download Pass
          </p>
          <div className="pointer-events-auto flex gap-2">
            <Link
              href={`/book/${book.slug}`}
              className="flex flex-1 items-center justify-center gap-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
            >
              <Eye className="h-3.5 w-3.5" />
              View
            </Link>
            <Link
              href={`/download?book=${book.slug}`}
              className="flex flex-1 items-center justify-center gap-1 rounded-md bg-primary px-2 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1 px-0.5">
        {category && (
          <p className="text-[11px] font-medium uppercase tracking-wide text-primary">
            {category.name}
          </p>
        )}
        <Link
          href={`/book/${book.slug}`}
          className="block break-words font-display text-sm font-semibold leading-snug hover:underline"
        >
          {book.title}
        </Link>
        <p className="text-xs text-muted-foreground">{book.company.name}</p>
        {book.shortDescription && (
          <p className="break-words text-xs text-muted-foreground">
            {book.shortDescription}
          </p>
        )}
      </div>
    </div>
  );
}
