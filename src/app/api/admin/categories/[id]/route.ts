import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, readJson } from "@/lib/api-helpers";
import { categoryInputSchema } from "@/lib/validation";

/** Category updates are partial; deletion is blocked while products reference it. */
export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    const existing = await db.category.findUnique({ where: { id: ctx.params.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const data = categoryInputSchema.partial().parse(await readJson<unknown>(req));
    const category = await db.category.update({
      where: { id: ctx.params.id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.image !== undefined ? { image: data.image ?? null } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      },
    });
    await db.activityLog.create({ data: { actor: session.email, action: "category.updated", detail: category.name } });
    return NextResponse.json({ ok: true, category });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    const count = await db.product.count({ where: { categoryId: ctx.params.id, NOT: { status: "ARCHIVED" } } });
    if (count > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${count} product(s) still use this category. Move or archive them first.` },
        { status: 409 }
      );
    }
    const category = await db.category.findUnique({ where: { id: ctx.params.id } });
    if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await db.category.delete({ where: { id: ctx.params.id } });
    await db.activityLog.create({ data: { actor: session.email, action: "category.deleted", detail: category.name } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
