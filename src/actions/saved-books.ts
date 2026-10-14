"use server";

import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdminRole } from "@/lib/rbac";

// Server side of "Save for later". Every signed-in account gets a
// persistent list — site Users and Admins alike (they live in separate
// tables, hence the two owner columns). Guests keep their saves in memory
// on the client and never call these.

export interface SavedBookRecord {
  url: string;
  title: string;
  savedAt: number;
}

type Owner = { userId: string } | { adminId: string };

async function currentOwner(): Promise<Owner | null> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  if (session.user.role === "USER") return { userId: id };
  if (isAdminRole(session.user.role)) return { adminId: id };
  return null;
}

export async function getMySavedBooks(): Promise<SavedBookRecord[]> {
  const owner = await currentOwner();
  if (!owner) return [];

  const rows = await db.savedBook.findMany({
    where: owner,
    orderBy: { createdAt: "desc" },
    select: { createdAt: true, book: { select: { slug: true, title: true } } },
  });

  return rows.map((row) => ({
    url: `/book/${row.book.slug}`,
    title: row.book.title,
    savedAt: row.createdAt.getTime(),
  }));
}

export async function setBookSaved(
  slug: string,
  saved: boolean,
): Promise<{ success: boolean }> {
  const owner = await currentOwner();
  if (!owner) return { success: false };

  try {
    const book = await db.book.findUnique({ where: { slug }, select: { id: true } });
    if (!book) return { success: false };

    if (saved) {
      try {
        await db.savedBook.create({ data: { ...owner, bookId: book.id } });
      } catch (error) {
        // Already saved (e.g. double click / second tab) — that's fine.
        const isDuplicate =
          error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
        if (!isDuplicate) throw error;
      }
    } else {
      await db.savedBook.deleteMany({ where: { ...owner, bookId: book.id } });
    }

    return { success: true };
  } catch (error) {
    console.error("[setBookSaved] failed for", { owner, slug, saved }, error);
    return { success: false };
  }
}
