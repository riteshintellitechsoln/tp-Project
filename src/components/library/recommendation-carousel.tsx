"use client";

import { useRef } from "react";
import type { BookCardData } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { BookCard } from "@/components/books/book-card";
import { SectionHeader } from "@/components/home/section-header";


interface RecommendationCarouselProps {
  recommendations: BookCardData[];
}

export function RecommendationCarousel({
  recommendations,
}: RecommendationCarouselProps) {
  const recommendationsRef = useRef<HTMLDivElement>(null);

  const scrollRecommendations = (
    direction: "left" | "right",
  ) => {
    if (!recommendationsRef.current) return;

    recommendationsRef.current.scrollBy({
      left: direction === "right" ? 320 : -320,
      behavior: "smooth",
    });
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 border-t pt-10">
      <div className="flex items-end justify-between gap-4">
        <SectionHeader
          eyebrow="Based on your downloads"
          title="You might also like"
          description="Picked from the same topics as what you've downloaded."
        />

        <div className="mb-6 flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => scrollRecommendations("left")}
            className="flex h-12 w-12 items-center justify-center rounded-full border bg-background shadow-sm transition-all duration-200 hover:scale-105 hover:border-primary hover:bg-primary hover:text-primary-foreground"
            aria-label="Previous recommendations"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => scrollRecommendations("right")}
            className="flex h-12 w-12 items-center justify-center rounded-full border bg-background shadow-sm transition-all duration-200 hover:scale-105 hover:border-primary hover:bg-primary hover:text-primary-foreground"
            aria-label="Next recommendations"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={recommendationsRef}
        className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide"
      >
        {recommendations.map((book) => (
          <div
            key={book.id}
            className="w-44 shrink-0 sm:w-48"
          >
            <BookCard book={book} />
          </div>
        ))}
      </div>
    </div>
  );
}