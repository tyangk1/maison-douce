"use client";

import { useEffect, useState } from "react";
import { AccountNav } from "@/components/store/account-nav";

type Address = {
  id: string;
  label: string;
  line1: string;
  line2?: string | null;
  city: string;
  postcode: string;
  isDefault: boolean;
};

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState({ label: "Home", line1: "", line2: "", city: "", postcode: "" });
  const [addressError, setAddressError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.user) {
        setName(d.user.name ?? "");
        setEmail(d.user.email ?? "");
      }
    }).catch(() => {});
    fetch("/api/orders/mine").catch(() => {});
    loadAddresses();
  }, []);

  async function loadAddresses() {
    try {
      const res = await fetch("/api/account/addresses");
      if (res.ok) setAddresses((await res.json()).addresses ?? []);
    } catch {}
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(Object.values(data.fields ?? {}).join(", ") || data.error);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save");
    }
  }

  async function addAddress(e: React.FormEvent) {
    e.preventDefault();
    setAddressError("");
    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newAddress, isDefault: addresses.length === 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invalid address");
      setNewAddress({ label: "Home", line1: "", line2: "", city: "", postcode: "" });
      loadAddresses();
    } catch (err) {
      setAddressError(err instanceof Error ? err.message : "Couldn't add address");
    }
  }

  async function removeAddress(id: string) {
    await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    loadAddresses();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-14 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">My account</p>
          <h1 className="mt-2 font-display text-display-xl">Profile &amp; addresses</h1>
        </div>
        <AccountNav />
      </header>

      <div className="grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="profile-h" className="rounded-card border border-espresso/10 bg-white/70 p-7 shadow-card">
          <h2 id="profile-h" className="font-display text-xl">Your details</h2>
          <form onSubmit={saveProfile} className="mt-5 space-y-4">
            <div>
              <label htmlFor="pf-name" className="field-label">Full name</label>
              <input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} className="input-field" autoComplete="name" />
            </div>
            <div>
              <label htmlFor="pf-email" className="field-label">Email</label>
              <input id="pf-email" value={email} disabled className="input-field" />
              <p className="mt-1 text-[11px] text-cocoa/55">Email changes require contacting the bakery.</p>
            </div>
            <div>
              <label htmlFor="pf-phone" className="field-label">Phone</label>
              <input id="pf-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" autoComplete="tel" placeholder="+44…" />
            </div>
            {error && <p role="alert" className="field-error">{error}</p>}
            {saved && <p role="status" className="text-sm text-sage">Saved.</p>}
            <button type="submit" className="btn-primary">Save changes</button>
          </form>
        </section>

        <section aria-labelledby="addr-h" className="rounded-card border border-espresso/10 bg-white/70 p-7 shadow-card">
          <h2 id="addr-h" className="font-display text-xl">Delivery addresses</h2>
          <ul className="mt-5 space-y-3">
            {addresses.length === 0 && <li className="text-sm text-cocoa/65">No saved addresses yet.</li>}
            {addresses.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3 rounded-lg border border-espresso/10 p-4 text-sm">
                <div>
                  <p className="font-medium">{a.label}{a.isDefault ? " · default" : ""}</p>
                  <p className="mt-0.5 text-cocoa/70">
                    {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city} {a.postcode}
                  </p>
                </div>
                <button type="button" onClick={() => removeAddress(a.id)} className="text-xs underline underline-offset-2 hover:text-red-800">
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <form onSubmit={addAddress} className="mt-6 space-y-3 border-t border-espresso/10 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-cocoa/60">Add an address</p>
            <input required placeholder="Street address" value={newAddress.line1} onChange={(e) => setNewAddress((v) => ({ ...v, line1: e.target.value }))} className="input-field" autoComplete="address-line1" aria-label="Street address" />
            <input placeholder="Apartment, floor… (optional)" value={newAddress.line2} onChange={(e) => setNewAddress((v) => ({ ...v, line2: e.target.value }))} className="input-field" autoComplete="address-line2" aria-label="Address line 2" />
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress((v) => ({ ...v, city: e.target.value }))} className="input-field" autoComplete="address-level2" aria-label="City" />
              <input required placeholder="Postcode" value={newAddress.postcode} onChange={(e) => setNewAddress((v) => ({ ...v, postcode: e.target.value }))} className="input-field" autoComplete="postal-code" aria-label="Postcode" />
            </div>
            {addressError && <p role="alert" className="field-error">{addressError}</p>}
            <button type="submit" className="btn-secondary !py-2.5">Add address</button>
          </form>
        </section>
      </div>
    </div>
  );
}
