-- AlterTable: saved books can belong to a User or an Admin
ALTER TABLE "saved_books" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "saved_books" ADD COLUMN     "adminId" TEXT;

-- Exactly one owner per row
ALTER TABLE "saved_books" ADD CONSTRAINT "saved_books_one_owner_check"
  CHECK (("userId" IS NOT NULL) <> ("adminId" IS NOT NULL));

-- CreateIndex
CREATE INDEX "saved_books_adminId_createdAt_idx" ON "saved_books"("adminId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "saved_books_adminId_bookId_key" ON "saved_books"("adminId", "bookId");

-- AddForeignKey
ALTER TABLE "saved_books" ADD CONSTRAINT "saved_books_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
