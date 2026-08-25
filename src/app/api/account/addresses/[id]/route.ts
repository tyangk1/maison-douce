import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";

/** Deletes an address owned exclusively by the authenticated user. */
export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await requireUser();
    const existing = await db.address.findUnique({ where: { id: ctx.params.id } });
    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await db.address.delete({ where: { id: ctx.params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
