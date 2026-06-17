import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const links = await prisma.link.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { clicks_rel: true } },
    },
  });
  return NextResponse.json(links);
}