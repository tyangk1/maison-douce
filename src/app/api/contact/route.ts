import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactSchema } from "@/lib/validation";
import { handleApiError, readJson } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const data = contactSchema.parse(await readJson<unknown>(req));
    await db.contactMessage.create({ data });
    return NextResponse.json({ ok: true, message: "Thank you — we read every message and reply within two working days." });
  } catch (e) {
    return handleApiError(e);
  }
}
