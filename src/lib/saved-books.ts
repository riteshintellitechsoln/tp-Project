import { toast } from "sonner";
import { getMySavedBooks, setBookSaved } from "@/actions/saved-books";

// "Save for later" store, shared by every client component on the page.
//
//   - Guest:  saves live only in this module's memory. They survive
//             client-side navigation but are gone on refresh — nothing is
//             written to the browser, so a shared computer never shows one
//             visitor's list to the next.
//   - Signed in (User or Admin): the same in-memory list, loaded from and
//             written through to the database (actions/saved-books.ts), so
//             it survives refresh and follows the account to any device.
//
// <SavedBooksSync /> switches between the two whenever the session changes.

export const SAVED_BOOKS_EVENT = "tradehub:saved-books-changed";

// Pre-database versions kept saves in localStorage; removed on first load.
const LEGACY_STORAGE_KEY = "tradehub:saved-books";

export interface SavedBookEntry {
  url: string;
  title: string;
  savedAt: number;
}

let entries: SavedBookEntry[] = [];
let persistToAccount = false;
let ready = false;

function emitChange() {
  window.dispatchEvent(new Event(SAVED_BOOKS_EVENT));
}

function slugFromUrl(url: string): string | null {
  const match = url.match(/\/book\/([^/?#]+)/);
  return match?.[1] ?? null;
}

export function readSavedBooks(): SavedBookEntry[] {
  return [...entries].sort((a, b) => b.savedAt - a.savedAt);
}

// False while a signed-in user's list is still loading from the server.
export function isSavedBooksReady(): boolean {
  return ready;
}

export function isBookSaved(url: string): boolean {
  return entries.some((entry) => entry.url === url);
}

function persist(url: string, saved: boolean, previous: SavedBookEntry[]) {
  if (!persistToAccount) return;
  const slug = slugFromUrl(url);
  if (!slug) return;

  setBookSaved(slug, saved)
    .then((result) => {
      if (!result.success) throw new Error("save failed");
    })
    .catch(() => {
      // Roll back the optimistic change so the UI matches the database.
      entries = previous;
      emitChange();
      toast.error("Couldn't update your saved list. Please try again.");
    });
}

export function toggleSavedBook(entry: { url: string; title: string }): boolean {
  const previous = entries;
  const alreadySaved = isBookSaved(entry.url);

  entries = alreadySaved
    ? entries.filter((e) => e.url !== entry.url)
    : [...entries, { ...entry, savedAt: Date.now() }];
  emitChange();
  persist(entry.url, !alreadySaved, previous);
  return !alreadySaved;
}

export function removeSavedBook(url: string) {
  const previous = entries;
  entries = entries.filter((e) => e.url !== url);
  emitChange();
  persist(url, false, previous);
}

let syncId = 0;

// Called by <SavedBooksSync /> on load and whenever the user signs in/out.
export async function syncSavedBooks(isSignedInUser: boolean) {
  try {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Storage blocked — nothing to clean up.
  }

  const id = ++syncId;
  persistToAccount = isSignedInUser;
  entries = [];

  if (!isSignedInUser) {
    ready = true;
    emitChange();
    return;
  }

  ready = false;
  emitChange();
  try {
    const fromServer = await getMySavedBooks();
    if (id !== syncId) return; // session changed again while loading
    entries = fromServer;
  } catch {
    if (id !== syncId) return;
  }
  ready = true;
  emitChange();
}
