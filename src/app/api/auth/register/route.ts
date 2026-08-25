import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { handleApiError, readJson } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const body = await readJson<unknown>(req);
    const data = registerSchema.parse(body);

    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists.", fields: { email: "Already registered" } },
        { status: 409 }
      );
    }

    const user = await db.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: await hashPassword(data.password),
        role: "CUSTOMER",
      },
    });

    await createSession({ userId: user.id, email: user.email, role: "CUSTOMER", name: user.name });
    await db.activityLog.create({ data: { actor: user.email, action: "auth.register", detail: "New customer account" } });

    return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    return handleApiError(e);
  }
}
