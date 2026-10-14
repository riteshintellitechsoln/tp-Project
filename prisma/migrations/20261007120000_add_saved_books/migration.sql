-- CreateTable
CREATE TABLE "saved_books" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_books_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_books_userId_createdAt_idx" ON "saved_books"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "saved_books_userId_bookId_key" ON "saved_books"("userId", "bookId");

-- AddForeignKey
ALTER TABLE "saved_books" ADD CONSTRAINT "saved_books_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_books" ADD CONSTRAINT "saved_books_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
