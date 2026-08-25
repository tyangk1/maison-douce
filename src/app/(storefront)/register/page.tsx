import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/store/auth-form";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 pb-28 pt-16">
      <div className="text-center">
        <p className="eyebrow">Join the Maison</p>
        <h1 className="mt-2 font-display text-headline sm:text-display">A little sweetness awaits.</h1>
        <p className="mt-3 text-sm text-cocoa/70">
          Create an account to track orders, save favourites and check out in seconds.
        </p>
      </div>
      <Suspense fallback={<div className="mt-10 h-80 animate-pulse rounded-card bg-cream" />}>
        <AuthForm defaultMode="register" />
      </Suspense>
    </div>
  );
}
