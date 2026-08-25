import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Public read of site content used by the homepage (hero copy, announcement…).
 * Only whitelisted keys are exposed — never internal settings.
 */
export async function GET() {
  try {
    const settings = await db.siteSetting.findMany({
      where: { key: { in: ["hero", "announcement", "story"] } },
    });
    const out: Record<string, unknown> = {};
    for (const s of settings) out[s.key] = JSON.parse(s.valueJson);
    return NextResponse.json({ content: out });
  } catch {
    return NextResponse.json({ content: {} });
  }
}
