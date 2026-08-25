import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsletterSchema } from "@/lib/validation";
import { handleApiError, readJson } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const data = newsletterSchema.parse(await readJson<unknown>(req));
    await db.newsletterSubscriber.upsert({
      where: { email: data.email },
      create: { email: data.email, source: data.source || "footer" },
      update: {},
    });
    return NextResponse.json({ ok: true, message: "Welcome to the Maison. Check your inbox soon." });
  } catch (e) {
    return handleApiError(e);
  }
}
