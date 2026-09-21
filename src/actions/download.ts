
"use server";

import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { leadSchema, type LeadInput } from "@/lib/validations/lead";
import { createDownloadToken } from "@/lib/tokens";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendDownloadEmail } from "@/lib/email/resend";
import { deriveCompanyWebsiteFromEmail } from "@/lib/company-website";

import { domainCanReceiveEmail } from "@/lib/mx-check";
import { isCompanyEmailDomain } from "@/lib/validations/email";


interface InitiateDownloadInput extends LeadInput {
  bookSlug: string;
}

type InitiateDownloadResult =
  | { success: true; downloadId: string }
  | { success: false; error: string };

const MONTHLY_DOWNLOAD_LIMIT = Number(process.env.MONTHLY_DOWNLOAD_LIMIT ?? 999);

type MinimalLead = { id: string; email: string; fullName: string };
type MinimalBook = {
  id: string;
  title: string;
  coverImageUrl: string;
  company: { name: string };
  downloadCount: number;
  downloadLimit: number | null;
  forceOutOfStock: boolean;
};

async function createOrResendDownload(
  lead: MinimalLead,
  book: MinimalBook,
): Promise<InitiateDownloadResult> {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = headersList.get("user-agent") ?? undefined;

  const existingDownload = await db.download.findFirst({
    where: { leadId: lead.id, bookId: book.id },
    orderBy: { createdAt: "desc" },
  });

  if (existingDownload) {
    const alreadyDelivered =
      existingDownload.status === "EMAIL_SENT" || existingDownload.status === "DOWNLOADED";

    if (alreadyDelivered) {
      return {
        success: false,
        error:
          "You've already downloaded this resource with this email — check your inbox for the link we sent.",
      };
    }

    if (book.forceOutOfStock) {
      return {
        success: false,
        error: "This resource is currently out of stock. Please check back later.",
      };
    }
    if (book.downloadLimit != null && book.downloadCount >= book.downloadLimit) {
      return {
        success: false,
        error: "This resource is currently out of stock. Please check back later.",
      };
    }

    return resendDownloadEmail(existingDownload.id);
  }

  if (book.forceOutOfStock) {
    return {
      success: false,
      error: "This resource is currently out of stock. Please check back later.",
    };
  }

  if (book.downloadLimit != null && book.downloadCount >= book.downloadLimit) {
    return {
      success: false,
      error: "This resource is currently out of stock. Please check back later.",
    };
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyCount = await db.download.count({
    where: { createdAt: { gte: startOfMonth } },
  });

  if (monthlyCount >= MONTHLY_DOWNLOAD_LIMIT) {
    return {
      success: false,
      error:
        "We've reached this month's download limit across all resources. Please try again next month.",
    };
  }

  const downloadId = nanoid();
  const { token, tokenHash, expiresAt } = createDownloadToken({ downloadId });

  const download = await db.download.create({
    data: {
      id: downloadId,
      leadId: lead.id,
      bookId: book.id,
      tokenHash,
      tokenExpiresAt: expiresAt,
      status: "PENDING",
      ipAddress: ip,
      userAgent,
    },
  });

  const ttlMinutes = Number(process.env.DOWNLOAD_TOKEN_TTL_MINUTES ?? 30);
  const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/download?token=${token}`;
  const subject = `Your download: ${book.title}`;

  const emailResult = await sendDownloadEmail({
    to: lead.email,
    recipientName: lead.fullName,
    bookTitle: book.title,
    coverImageUrl: book.coverImageUrl,
    publisherName: book.company.name,
    downloadUrl,
    expiresInMinutes: ttlMinutes,
  });

  if (!emailResult.success) {
    await db.$transaction([
      db.download.update({ where: { id: download.id }, data: { status: "FAILED" } }),
      db.emailLog.create({
        data: {
          downloadId: download.id,
          to: lead.email,
          subject,
          status: "FAILED",
          error: emailResult.error,
        },
      }),
    ]);

    return {
      success: false,
      error: "We couldn't send your download link. Please try again in a moment.",
    };
  }

  await db.$transaction([
    db.download.update({
      where: { id: download.id },
      data: { status: "EMAIL_SENT" },
    }),
    db.emailLog.create({
      data: {
        downloadId: download.id,
        to: lead.email,
        subject,
        status: "SENT",
        sentAt: new Date(),
        providerMessageId: emailResult.providerMessageId,
      },
    }),
    db.book.update({
      where: { id: book.id },
      data: { downloadCount: { increment: 1 } },
    }),
  ]);

  return { success: true, downloadId: download.id };
}

export async function checkExistingLead(
  email: string,
): Promise<{ exists: boolean; fullName?: string; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  if (!isCompanyEmailDomain(normalizedEmail)) {
    return {
      exists: false,
      error:
        "Please use your company email — free providers like Gmail, Yahoo, Hotmail, Outlook.com, and iCloud aren't accepted.",
    };
  }
  if (!(await domainCanReceiveEmail(normalizedEmail))) {
    return {
      exists: false,
      error: "This email domain doesn't seem to be valid. Please double-check for typos.",
    };
  }

  const lead = await db.lead.findUnique({
    where: { email: normalizedEmail },
    select: { fullName: true },
  });
  return lead ? { exists: true, fullName: lead.fullName } : { exists: false };
}

export async function quickDownload({
  email,
  bookSlug,
}: {
  email: string;
  bookSlug: string;
}): Promise<InitiateDownloadResult> {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const { success: withinRateLimit } = await checkRateLimit(ip);
  if (!withinRateLimit) {
    return { success: false, error: "Too many requests — please try again in a minute." };
  }

  const normalizedEmail = email.toLowerCase().trim();

  const [book, lead] = await Promise.all([
    db.book.findUnique({
      where: { slug: bookSlug, status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        coverImageUrl: true,
        company: { select: { name: true } },
        downloadCount: true,
        downloadLimit: true,
        forceOutOfStock: true,
      },
    }),
    db.lead.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, fullName: true },
    }),
  ]);

  if (!book) {
    return { success: false, error: "This resource is no longer available." };
  }
  if (!lead) {
    return {
      success: false,
      error: "We couldn't find saved details for this email. Please fill in the form.",
    };
  }

  return createOrResendDownload(lead, book);
}

export async function initiateDownload(
  input: InitiateDownloadInput,
): Promise<InitiateDownloadResult> {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid submission",
    };
  }

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = headersList.get("user-agent") ?? undefined;

  const { success: withinRateLimit } = await checkRateLimit(ip);
  if (!withinRateLimit) {
    return { success: false, error: "Too many requests — please try again in a minute." };
  }

  const book = await db.book.findUnique({
    where: { slug: input.bookSlug, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      coverImageUrl: true,
      company: { select: { name: true } },
      downloadCount: true,
      downloadLimit: true,
      forceOutOfStock: true,
    },
  });
  if (!book) {
    return { success: false, error: "This resource is no longer available." };
  }

  const {
    fullName,
    phone,
    companyName,
    jobTitle,
    country,
    state,
    city,
    department,
    industry,
    companySize,
    consentGiven,
  } = parsed.data;
   

    const email = parsed.data.email.toLowerCase().trim();
  const domain = email.split("@")[1];

  console.log("[initiateDownload] checking domain:", domain);
  const canReceiveEmail = await domainCanReceiveEmail(email);
  console.log("[initiateDownload] canReceiveEmail:", canReceiveEmail, "for", email);
  if (!canReceiveEmail) {
    return {
      success: false,
      error: "This email domain doesn't seem to be valid. Please double-check for typos.",
    };
  }

  
  const lead = await db.lead.upsert({
    where: { email },
    update: {
      fullName,
      phone,
      companyName,
      companyWebsite: deriveCompanyWebsiteFromEmail(email),
      jobTitle,
      country,
      state: state || null,
      city: city || null,
      department,
      industry,
      companySize,
      consentGiven,
      consentAt: new Date(),
      ipAddress: ip,
      userAgent,
    },
    create: {
      fullName,
      email,
      companyDomain: domain,
      companyWebsite: deriveCompanyWebsiteFromEmail(email),
      phone,
      companyName,
      jobTitle,
      country,
      state: state || null,
      city: city || null,
      department,
      industry,
      companySize,
      consentGiven,
      consentAt: new Date(),
      ipAddress: ip,
      userAgent,
    },
  });

  return createOrResendDownload(lead, book);
}

export async function resendDownloadEmail(
  downloadId: string,
): Promise<InitiateDownloadResult> {
  const download = await db.download.findUnique({
    where: { id: downloadId },
    include: {
      lead: { select: { email: true, fullName: true } },
      book: {
        select: { title: true, coverImageUrl: true, company: { select: { name: true } } },
      },
    },
  });
  if (!download) {
    return { success: false, error: "Download not found." };
  }

  const { token, tokenHash, expiresAt } = createDownloadToken({ downloadId: download.id });
  await db.download.update({
    where: { id: download.id },
    data: { tokenHash, tokenExpiresAt: expiresAt, status: "PENDING" },
  });

  const ttlMinutes = Number(process.env.DOWNLOAD_TOKEN_TTL_MINUTES ?? 30);
  const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/download?token=${token}`;
  const subject = `Your download: ${download.book.title}`;

  const emailResult = await sendDownloadEmail({
    to: download.lead.email,
    recipientName: download.lead.fullName,
    bookTitle: download.book.title,
    coverImageUrl: download.book.coverImageUrl,
    publisherName: download.book.company.name,
    downloadUrl,
    expiresInMinutes: ttlMinutes,
  });

  if (!emailResult.success) {
    await db.emailLog.create({
      data: {
        downloadId: download.id,
        to: download.lead.email,
        subject,
        status: "FAILED",
        error: emailResult.error,
      },
    });
    return { success: false, error: emailResult.error ?? "Failed to resend email." };
  }

  await db.$transaction([
    db.download.update({ where: { id: download.id }, data: { status: "EMAIL_SENT" } }),
    db.emailLog.create({
      data: {
        downloadId: download.id,
        to: download.lead.email,
        subject,
        status: "SENT",
        sentAt: new Date(),
        providerMessageId: emailResult.providerMessageId,
      },
    }),
  ]);

  return { success: true, downloadId: download.id };
}