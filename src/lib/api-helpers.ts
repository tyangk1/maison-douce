import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "./auth";
import { formatZodIssues } from "./validation";

export function jsonError(message: string, status = 400, fields?: Record<string, string>) {
  return NextResponse.json({ error: message, fields }, { status });
}

export function handleApiError(e: unknown) {
  if (e instanceof AuthError) return jsonError(e.message, e.status);
  if (e instanceof ZodError) {
    const fields = formatZodIssues(e);
    return jsonError("Please check the highlighted fields.", 422, fields);
  }
  console.error("[api]", e);
  return jsonError("Something went wrong on our side. Please try again.", 500);
}

export async function readJson<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new Error("Invalid request body");
  }
}
