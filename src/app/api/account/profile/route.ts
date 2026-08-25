import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { profileUpdateSchema } from "@/lib/validation";
import { handleApiError, readJson } from "@/lib/api-helpers";

export async function PATCH(req: Request) {
  try {
    const session = await requireUser();
    const data = profileUpdateSchema.parse(await readJson<unknown>(req));
    const user = await db.user.update({
      where: { id: session.userId },
      data: { name: data.name, phone: data.phone || null },
    });
    return NextResponse.json({ ok: true, user: { name: user.name, phone: user.phone, email: user.email } });
  } catch (e) {
    return handleApiError(e);
  }
}
