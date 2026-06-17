import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

// Reserved words nobody should use as a slug
const RESERVED = ["api", "admin", "dashboard", "login", "signup", "shorten"];

function generateSlug() {
  return nanoid(6);
}

export async function POST(req: NextRequest) {
  const { url, customSlug, expiresAt, startsAt, clickLimit } = await req.json();

  // Validate URL
  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // Handle slug
  let slug = customSlug ? customSlug.toLowerCase().trim() : generateSlug();

  // Block reserved words
  if (RESERVED.includes(slug)) {
    return NextResponse.json(
      { error: "That slug is reserved. Pick another." },
      { status: 400 }
    );
  }

  // Check if custom slug is already taken
  if (customSlug) {
    const existing = await prisma.link.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "That slug is already taken. Try another." },
        { status: 409 }
      );
    }
  }

  const link = await prisma.link.create({
    data: {
      slug,
      originalUrl: url,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      startsAt: startsAt ? new Date(startsAt) : null,
      clickLimit: clickLimit || null,
    },
  });

  const host = req.headers.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const shortUrl = `${protocol}://${host}/${link.slug}`;
  return NextResponse.json({ shortUrl, slug });
}