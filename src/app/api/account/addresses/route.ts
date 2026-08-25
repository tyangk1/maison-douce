import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleApiError, readJson } from "@/lib/api-helpers";
import { z } from "zod";

const addressSchema = z.object({
  label: z.string().trim().max(40).default("Home"),
  line1: z.string().trim().min(3).max(160),
  line2: z.string().trim().max(160).optional(),
  city: z.string().trim().min(2).max(80),
  postcode: z.string().trim().min(3).max(12),
  isDefault: z.boolean().default(false),
});

export async function GET() {
  try {
    const session = await requireUser();
    const addresses = await db.address.findMany({
      where: { userId: session.userId },
      orderBy: [{ isDefault: "desc" }, { id: "asc" }],
    });
    return NextResponse.json({ addresses });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireUser();
    const data = addressSchema.parse(await readJson<unknown>(req));
    if (data.isDefault) {
      await db.address.updateMany({ where: { userId: session.userId }, data: { isDefault: false } });
    }
    const address = await db.address.create({ data: { ...data, userId: session.userId } });
    return NextResponse.json({ ok: true, address });
  } catch (e) {
    return handleApiError(e);
  }
}
