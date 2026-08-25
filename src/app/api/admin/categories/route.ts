import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, readJson } from "@/lib/api-helpers";
import { categoryInputSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    await requireAdmin();
    const categories = await db.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json({ categories });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const data = categoryInputSchema.parse(await readJson<unknown>(req));
    const slug = data.slug ? slugify(data.slug) : slugify(data.name);
    const clash = await db.category.findUnique({ where: { slug } });
    if (clash) return NextResponse.json({ error: "A category with this slug already exists." }, { status: 409 });
    const category = await db.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        image: data.image ?? null,
        sortOrder: data.sortOrder,
      },
    });
    await db.activityLog.create({ data: { actor: session.email, action: "category.created", detail: category.name } });
    return NextResponse.json({ ok: true, category });
  } catch (e) {
    return handleApiError(e);
  }
}
