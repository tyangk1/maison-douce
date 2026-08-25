"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/components/store/store-provider";
import { formatPrice } from "@/lib/money";

type Fulfilment = "DELIVERY" | "PICKUP";
type Fields = Record<string, string>;

export default function CheckoutPage() {
  const { lines, subtotalCents, hydrated, clearCart } = useStore();
  const router = useRouter();

  const [fulfilment, setFulfilment] = useState<Fulfilment>("DELIVERY");
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{ code: string; title: string; discountCents: number } | null>(null);
  const [promoMsg, setPromoMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Fields>({});
  const [form, setForm] = useState({
    email: "",
    customerName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postcode: "",
    notes: "",
    cardNumber: "4242 4242 4242 4242",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setForm((f) => ({ ...f, email: d.user.email ?? "", customerName: f.customerName || d.user.name || "" }));
      })
      .catch(() => {});
  }, []);

  const deliveryCents = fulfilment === "DELIVERY" ? (subtotalCents >= 5000 ? 0 : subtotalCents > 0 ? 495 : 0) : 0;
  const discountCents = promo?.discountCents ?? 0;
  const totalCents = Math.max(0, subtotalCents - discountCents) + deliveryCents;

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setFieldErrors((e) => {
      const next = { ...e };
      delete next[field];
      return next;
    });
  }

  async function applyPromo() {
    if (!promoInput.trim()) return;
    try {
      const res = await fetch(`/api/promotions/validate?code=${encodeURIComponent(promoInput)}&subtotal=${subtotalCents}`);
      const data = await res.json();
      if (data.valid) {
        setPromo(data);
        setPromoMsg(`${data.title} applied.`);
      } else {
        setPromo(null);
        setPromoMsg(data.message);
      }
    } catch {
      setPromoMsg("Couldn't check that code right now.");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: lines.map((l) => ({ productId: l.productId, quantity: l.quantity, variantId: l.variantId })),
          checkout: {
            email: form.email,
            customerName: form.customerName,
            phone: form.phone,
            fulfilment,
            ...(fulfilment === "DELIVERY"
              ? { addressLine1: form.addressLine1, addressLine2: form.addressLine2 || undefined, city: form.city, postcode: form.postcode }
              : {}),
            notes: form.notes || undefined,
            promoCode: promo?.code,
            paymentMethod: "mock_card",
            mockCardNumber: form.cardNumber.replace(/\s+/g, ""),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fields) setFieldErrors(data.fields);
        throw new Error(data.error ?? "Checkout failed");
      }
      clearCart();
      router.push(`/order/${data.order.orderNumber}?new=1`);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Checkout failed");
      setSubmitting(false);
    }
  }

  if (!hydrated) return <div className="mx-auto max-w-3xl px-4 py-32 text-center text-cocoa/60">Loading your basket…</div>;

  if (lines.length === 0 && !submitting) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-28 text-center">
        <h1 className="font-display text-display">Your basket is empty</h1>
        <p className="mt-4 text-bark">Add something delicious before checking out.</p>
        <Link href="/shop" className="btn-primary mt-8">Back to the shop</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-14 sm:px-6 lg:px-8">
      <header className="mb-10">
        <p className="eyebrow">Almost there</p>
        <h1 className="mt-2 font-display text-display-xl">Checkout</h1>
        <p className="mt-3 max-w-lg text-sm text-cocoa/75">
          This storefront runs on a clearly labelled <strong>mock payment provider</strong> — no real cards are charged.
          Use 4242 4242 4242 4242 to succeed, or any number ending in 0002 to see the decline path.
        </p>
      </header>

      <form onSubmit={submit} noValidate className="grid gap-12 lg:grid-cols-[1.5fr_1fr]" id="checkout-form">
        <div className="space-y-10">
          <section aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="font-display text-xl">1 · Contact</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Full name" name="customerName" value={form.customerName} onChange={(v) => set("customerName", v)} error={fieldErrors["checkout.customerName"]} required autoComplete="name" />
              <Field label="Email" name="email" type="email" value={form.email} onChange={(v) => set("email", v)} error={fieldErrors["checkout.email"]} required autoComplete="email" />
              <Field label="Phone" name="phone" value={form.phone} onChange={(v) => set("phone", v)} error={fieldErrors["checkout.phone"]} required autoComplete="tel" />
            </div>
          </section>

          <section aria-labelledby="fulfilment-heading">
            <h2 id="fulfilment-heading" className="font-display text-xl">2 · Collection or delivery</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Fulfilment method">
              {(["PICKUP", "DELIVERY"] as Fulfilment[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  role="radio"
                  aria-checked={fulfilment === mode}
                  onClick={() => setFulfilment(mode)}
                  className={`rounded-card border p-5 text-left transition ${
                    fulfilment === mode ? "border-espresso bg-espresso/[0.04] shadow-card" : "border-espresso/15 hover:border-espresso/40"
                  }`}
                >
                  <span className="block font-semibold">{mode === "PICKUP" ? "Collect from the bakery" : "Local courier delivery"}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-cocoa/70">
                    {mode === "PICKUP"
                      ? "58 Lamb's Conduit Street · ready from your chosen slot"
                      : "Free over £50 · otherwise £4.95 · same-day cut-off 2pm"}
                  </span>
                </button>
              ))}
            </div>

            {fulfilment === "DELIVERY" && (
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Address line 1" name="addressLine1" value={form.addressLine1} onChange={(v) => set("addressLine1", v)} error={fieldErrors["checkout.addressLine1"]} required autoComplete="address-line1" />
                </div>
                <div className="sm:col-span-2">
                  <Field label="Address line 2 (optional)" name="addressLine2" value={form.addressLine2} onChange={(v) => set("addressLine2", v)} error={fieldErrors["checkout.addressLine2"]} autoComplete="address-line2" />
                </div>
                <Field label="City" name="city" value={form.city} onChange={(v) => set("city", v)} error={fieldErrors["checkout.city"]} required autoComplete="address-level2" />
                <Field label="Postcode" name="postcode" value={form.postcode} onChange={(v) => set("postcode", v)} error={fieldErrors["checkout.postcode"]} required autoComplete="postal-code" />
              </div>
            )}

            <div className="mt-6">
              <label htmlFor="notes" className="field-label">Delivery notes / gift message (optional)</label>
              <textarea id="notes" rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} className="input-field" />
            </div>
          </section>

          <section aria-labelledby="payment-heading">
            <h2 id="payment-heading" className="font-display text-xl">3 · Payment</h2>
            <div className="mt-5 rounded-card border border-caramel/50 bg-caramel/[0.07] p-5">
              <p className="text-sm font-semibold">Mock card payment</p>
              <p className="mt-1 text-xs text-cocoa/75">Provider adapter: <code>mock</code> — swap for Stripe by implementing the same interface.</p>
              <div className="mt-4 max-w-xs">
                <Field
                  label="Card number"
                  name="cardNumber"
                  value={form.cardNumber}
                  onChange={(v) => set("cardNumber", v)}
                  hint="Test: success 4242…, decline …0002"
                  autoComplete="cc-number"
                  inputMode="numeric"
                />
              </div>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-card border border-espresso/10 bg-white/70 p-7 shadow-card lg:sticky lg:top-24">
          <h2 className="font-display text-xl">Order summary</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {lines.map((l) => (
              <li key={l.productId} className="flex justify-between gap-3">
                <span className="min-w-0 truncate text-cocoa/85">
                  {l.quantity} × {l.name}
                  {l.variantName ? ` (${l.variantName})` : ""}
                </span>
                <span className="shrink-0">{formatPrice(l.priceCents * l.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-espresso/10 pt-4">
            <label htmlFor="promo" className="field-label">Promo code</label>
            <div className="flex gap-2">
              <input
                id="promo"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="WELCOME10"
                className="input-field rounded-full uppercase"
              />
              <button type="button" onClick={applyPromo} className="btn-secondary !px-5 !py-2">Apply</button>
            </div>
            {promoMsg && (
              <p role="status" className={`mt-2 text-xs ${promo ? "text-sage" : "text-red-700"}`}>{promoMsg}</p>
            )}
          </div>

          <dl className="mt-5 space-y-2.5 border-t border-espresso/10 pt-4 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(subtotalCents)}</dd></div>
            {discountCents > 0 && (
              <div className="flex justify-between text-sage"><dt>Discount ({promo?.code})</dt><dd>−{formatPrice(discountCents)}</dd></div>
            )}
            <div className="flex justify-between text-cocoa/75"><dt>{fulfilment === "PICKUP" ? "Collection" : "Delivery"}</dt><dd>{deliveryCents === 0 ? "Free" : formatPrice(deliveryCents)}</dd></div>
            <div className="flex justify-between border-t border-espresso/10 pt-3 text-base font-semibold"><dt>Total</dt><dd>{formatPrice(totalCents)}</dd></div>
          </dl>

          {serverError && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{serverError}</p>
          )}

          <button type="submit" form="checkout-form" disabled={submitting} className="btn-primary mt-6 w-full !py-3.5">
            {submitting ? "Processing payment…" : `Pay ${formatPrice(totalCents)}`}
          </button>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-cocoa/55">
            By paying you agree to our terms. Demo environment — no real payment is taken.
          </p>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  error,
  required,
  autoComplete,
  hint,
  inputMode,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
  required?: boolean;
  autoComplete?: string;
  hint?: string;
  inputMode?: "numeric" | "text";
}) {
  return (
    <div>
      <label htmlFor={`f-${name}`} className="field-label">
        {label}{required ? " *" : ""}
      </label>
      <input
        id={`f-${name}`}
        type={type}
        value={value}
        inputMode={inputMode}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `f-${name}-err` : hint ? `f-${name}-hint` : undefined}
        className={`input-field ${error ? "!border-red-600 focus:!ring-red-200" : ""}`}
      />
      {hint && !error && <p id={`f-${name}-hint`} className="mt-1 text-[11px] text-cocoa/55">{hint}</p>}
      {error && <p id={`f-${name}-err`} role="alert" className="field-error">{error}</p>}
    </div>
  );
}

