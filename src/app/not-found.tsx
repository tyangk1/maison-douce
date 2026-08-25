import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-display text-display-xl">This shelf is empty.</h1>
      <p className="mt-4 text-bark">The page you&apos;re after has moved on — like yesterday&apos;s canelés.</p>
      <div className="mt-9 flex gap-3">
        <Link href="/" className="btn-primary">Back home</Link>
        <Link href="/shop" className="btn-secondary">Browse the shop</Link>
      </div>
    </div>
  );
}
