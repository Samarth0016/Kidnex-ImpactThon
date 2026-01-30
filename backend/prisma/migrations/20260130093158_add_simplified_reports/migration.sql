-- CreateTable
CREATE TABLE "simplified_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "imageUrl" TEXT,
    "extractedText" TEXT NOT NULL,
    "simplifiedExplanation" TEXT NOT NULL,
    "aiModel" TEXT NOT NULL DEFAULT 'gemini',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "simplified_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "simplified_reports_userId_createdAt_idx" ON "simplified_reports"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "simplified_reports" ADD CONSTRAINT "simplified_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
