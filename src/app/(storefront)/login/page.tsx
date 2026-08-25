import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/store/auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 pb-28 pt-16">
      <div className="text-center">
        <p className="eyebrow">Welcome back</p>
        <h1 className="mt-2 font-display text-headline sm:text-display">Good morning.</h1>
        <p className="mt-3 text-sm text-cocoa/70">
          Sign in for faster checkout, order history and your favourites.
        </p>
      </div>
      <Suspense fallback={<div className="mt-10 h-72 animate-pulse rounded-card bg-cream" />}>
        <AuthForm />
      </Suspense>
      <p className="mt-6 text-center text-xs leading-relaxed text-cocoa/50">
        Demo customer: customer@example.com / DemoCustomer1 · admin: <a href="/admin/login" className="underline hover:text-espresso">admin sign-in here</a>
      </p>
    </div>
  );
}
