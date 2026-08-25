import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { handleApiError, readJson } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const body = await readJson<unknown>(req);
    const data = loginSchema.parse(body);

    const user = await db.user.findUnique({ where: { email: data.email } });
    if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
      // Generic message: never reveal whether the account exists.
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
      name: user.name,
    });

    return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    return handleApiError(e);
  }
}
