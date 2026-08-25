import { NextResponse } from "next/server";
import { getVerifiedSession } from "@/lib/auth";

export async function GET() {
  const session = await getVerifiedSession();
  if (!session) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: { id: session.userId, name: session.name, email: session.email, role: session.role },
  });
}
