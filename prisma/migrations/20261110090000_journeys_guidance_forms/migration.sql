-- Journeys, guidance articles, dynamic forms, submissions, homepage settings.
-- Additive only. (Prisma's diff also proposed dropping the hand-written pg_trgm
-- search indexes from the init migration; those statements were removed on purpose.)

-- CreateEnum
CREATE TYPE "GuidanceSectionKind" AS ENUM ('CONTENT', 'NOTE', 'WARNING');

-- CreateEnum
CREATE TYPE "FormFieldType" AS ENUM ('TEXT', 'EMAIL', 'NUMBER', 'DATE', 'TEXTAREA', 'SELECT', 'CHECKBOX', 'RADIO');

-- CreateEnum
CREATE TYPE "FormSubmissionStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "googleSub" TEXT,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Journey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleKm" TEXT,
    "verb" TEXT NOT NULL,
    "verbKm" TEXT,
    "description" TEXT,
    "descriptionKm" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'grid',
    "accentColor" TEXT NOT NULL DEFAULT '#09786a',
    "coverId" TEXT,
    "videoId" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Journey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuidanceArticle" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "coverId" TEXT,
    "videoId" TEXT,
    "lastReviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuidanceArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuidanceArticleTranslation" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "nextSteps" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,

    CONSTRAINT "GuidanceArticleTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuidanceSection" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "kind" "GuidanceSectionKind" NOT NULL DEFAULT 'CONTENT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "imageId" TEXT,
    "heading" TEXT NOT NULL,
    "headingKm" TEXT,
    "body" TEXT NOT NULL,
    "bodyKm" TEXT,

    CONSTRAINT "GuidanceSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuidanceReference" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleKm" TEXT,
    "url" TEXT NOT NULL,
    "publisher" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GuidanceReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyForm" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT,
    "title" TEXT NOT NULL,
    "titleKm" TEXT,
    "description" TEXT,
    "descriptionKm" TEXT,
    "submitLabel" TEXT,
    "submitLabelKm" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JourneyForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormField" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" "FormFieldType" NOT NULL,
    "label" TEXT NOT NULL,
    "labelKm" TEXT,
    "helpText" TEXT,
    "helpTextKm" TEXT,
    "placeholder" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "options" JSONB,
    "validation" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FormField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSubmission" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "journeyId" TEXT,
    "userId" TEXT NOT NULL,
    "status" "FormSubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "internalNotes" TEXT,
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "locale" "Locale" NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionAnswer" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "fieldId" TEXT,
    "fieldKey" TEXT NOT NULL,
    "fieldLabel" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "SubmissionAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionReviewHistory" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "fromStatus" "FormSubmissionStatus",
    "toStatus" "FormSubmissionStatus" NOT NULL,
    "note" TEXT,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionReviewHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "heroPrefix" TEXT NOT NULL DEFAULT 'I want to',
    "heroPrefixKm" TEXT,
    "heroSuffix" TEXT NOT NULL DEFAULT 'in Cambodia.',
    "heroSuffixKm" TEXT,
    "heroSubtitle" TEXT,
    "heroSubtitleKm" TEXT,
    "ctaLabel" TEXT NOT NULL DEFAULT 'Start exploring',
    "ctaLabelKm" TEXT,
    "heroVideoId" TEXT,
    "heroImageId" TEXT,
    "sections" JSONB,
    "resources" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Journey_key_key" ON "Journey"("key");

-- CreateIndex
CREATE INDEX "Journey_isEnabled_sortOrder_idx" ON "Journey"("isEnabled", "sortOrder");

-- CreateIndex
CREATE INDEX "GuidanceArticle_journeyId_status_sortOrder_idx" ON "GuidanceArticle"("journeyId", "status", "sortOrder");

-- CreateIndex
CREATE INDEX "GuidanceArticle_status_isFeatured_idx" ON "GuidanceArticle"("status", "isFeatured");

-- CreateIndex
CREATE UNIQUE INDEX "GuidanceArticle_journeyId_slug_key" ON "GuidanceArticle"("journeyId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "GuidanceArticleTranslation_articleId_locale_key" ON "GuidanceArticleTranslation"("articleId", "locale");

-- CreateIndex
CREATE INDEX "GuidanceSection_articleId_sortOrder_idx" ON "GuidanceSection"("articleId", "sortOrder");

-- CreateIndex
CREATE INDEX "GuidanceReference_articleId_sortOrder_idx" ON "GuidanceReference"("articleId", "sortOrder");

-- CreateIndex
CREATE INDEX "JourneyForm_journeyId_isActive_idx" ON "JourneyForm"("journeyId", "isActive");

-- CreateIndex
CREATE INDEX "FormField_formId_sortOrder_idx" ON "FormField"("formId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "FormField_formId_key_key" ON "FormField"("formId", "key");

-- CreateIndex
CREATE INDEX "FormSubmission_status_createdAt_idx" ON "FormSubmission"("status", "createdAt");

-- CreateIndex
CREATE INDEX "FormSubmission_userId_createdAt_idx" ON "FormSubmission"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "FormSubmission_journeyId_status_idx" ON "FormSubmission"("journeyId", "status");

-- CreateIndex
CREATE INDEX "SubmissionAnswer_submissionId_idx" ON "SubmissionAnswer"("submissionId");

-- CreateIndex
CREATE INDEX "SubmissionReviewHistory_submissionId_createdAt_idx" ON "SubmissionReviewHistory"("submissionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleSub_key" ON "User"("googleSub");

-- AddForeignKey
ALTER TABLE "Journey" ADD CONSTRAINT "Journey_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Journey" ADD CONSTRAINT "Journey_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuidanceArticle" ADD CONSTRAINT "GuidanceArticle_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuidanceArticle" ADD CONSTRAINT "GuidanceArticle_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuidanceArticle" ADD CONSTRAINT "GuidanceArticle_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuidanceArticle" ADD CONSTRAINT "GuidanceArticle_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuidanceArticle" ADD CONSTRAINT "GuidanceArticle_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuidanceArticleTranslation" ADD CONSTRAINT "GuidanceArticleTranslation_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "GuidanceArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuidanceSection" ADD CONSTRAINT "GuidanceSection_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "GuidanceArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuidanceSection" ADD CONSTRAINT "GuidanceSection_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuidanceReference" ADD CONSTRAINT "GuidanceReference_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "GuidanceArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyForm" ADD CONSTRAINT "JourneyForm_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormField" ADD CONSTRAINT "FormField_formId_fkey" FOREIGN KEY ("formId") REFERENCES "JourneyForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "JourneyForm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionAnswer" ADD CONSTRAINT "SubmissionAnswer_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "FormSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionAnswer" ADD CONSTRAINT "SubmissionAnswer_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "FormField"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionReviewHistory" ADD CONSTRAINT "SubmissionReviewHistory_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "FormSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionReviewHistory" ADD CONSTRAINT "SubmissionReviewHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomepageSettings" ADD CONSTRAINT "HomepageSettings_heroVideoId_fkey" FOREIGN KEY ("heroVideoId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomepageSettings" ADD CONSTRAINT "HomepageSettings_heroImageId_fkey" FOREIGN KEY ("heroImageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Only one homepage settings row may exist.
ALTER TABLE "HomepageSettings" ADD CONSTRAINT "HomepageSettings_singleton" CHECK ("id" = 1);
