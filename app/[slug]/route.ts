import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Basic bot detection by user-agent
function isBot(userAgent: string): boolean {
  const bots = ["bot", "crawler", "spider", "scraper", "curl", "wget", "python"];
  return bots.some((b) => userAgent.toLowerCase().includes(b));
}

function getDevice(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return "mobile";
  if (/tablet/i.test(userAgent)) return "tablet";
  return "desktop";
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const now = new Date();

  const link = await prisma.link.findUnique({ where: { slug } });

  // Not found
  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  // Not live yet
  if (link.startsAt && now < link.startsAt) {
    return new NextResponse("This link is not active yet.", { status: 403 });
  }

  // Expired
  if (link.expiresAt && now > link.expiresAt) {
    return new NextResponse("This link has expired.", { status: 410 });
  }

  // Click limit reached
  if (link.clickLimit && link.clicks >= link.clickLimit) {
    return new NextResponse("This link has reached its limit.", { status: 410 });
  }

  const userAgent = req.headers.get("user-agent") || "";

  // Skip bots from analytics
  if (!isBot(userAgent)) {
    const referrer = req.headers.get("referer") || "direct";
    const device = getDevice(userAgent);
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    await Promise.all([
      prisma.click.create({
        data: { linkId: link.id, referrer, device, ip },
      }),
      prisma.link.update({
        where: { slug },
        data: { clicks: { increment: 1 } },
      }),
    ]);
  }

  return NextResponse.redirect(link.originalUrl, 307);
}