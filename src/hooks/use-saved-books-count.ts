"use client";

import { useEffect, useState } from "react";
import { readSavedBooks, SAVED_BOOKS_EVENT } from "@/lib/saved-books";

export function useSavedBooksCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function sync() {
      setCount(readSavedBooks().length);
    }
    sync();
    window.addEventListener(SAVED_BOOKS_EVENT, sync);
    return () => window.removeEventListener(SAVED_BOOKS_EVENT, sync);
  }, []);

  return count;
}