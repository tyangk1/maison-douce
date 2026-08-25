import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, readJson } from "@/lib/api-helpers";

/**
 * Homepage content + site settings management.
 * Values are stored as validated JSON blobs keyed by `SiteSetting.key`.
 */
const allowedKeys = ["hero", "announcement", "contact", "hours", "story"];

export async function GET() {
  try {
    await requireAdmin();
    const settings = await db.siteSetting.findMany();
    return NextResponse.json({
      content: Object.fromEntries(settings.filter((s) => allowedKeys.includes(s.key)).map((s) => [s.key, JSON.parse(s.valueJson)])),
    });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await readJson<Record<string, unknown>>(req);
    const updates = Object.entries(body).filter(([key]) => allowedKeys.includes(key));
    if (!updates.length) return NextResponse.json({ error: "No valid content keys provided." }, { status: 422 });

    for (const [key, value] of updates) {
      await db.siteSetting.upsert({
        where: { key },
        create: { key, valueJson: JSON.stringify(value ?? {}) },
        update: { valueJson: JSON.stringify(value ?? {}) },
      });
    }
    await db.activityLog.create({
      data: { actor: session.email, action: "content.updated", detail: updates.map(([k]) => k).join(", ") },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
