"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { formatPrice } from "@/lib/money";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  createdAt: string;
  addressCount: number;
  orderCount: number;
  lifetimeCents: number;
  lastOrderAt?: string | null;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(
    (c) => !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.email.includes(q.toLowerCase())
  );

  if (loading) return <div className="h-64 animate-pulse rounded-xl bg-white/5" aria-busy="true" />;

  return (
    <>
      <AdminPageHeader
        title="Customers"
        subtitle={`${customers.length} registered accounts · read-only overview`}
        action={
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search customers…"
            aria-label="Search customers"
            className="rounded-lg border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm outline-none focus:border-amber-600/70"
          />
        }
      />
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th scope="col" className="px-5 py-3">Customer</th>
              <th scope="col" className="px-5 py-3">Orders</th>
              <th scope="col" className="px-5 py-3">Lifetime spend</th>
              <th scope="col" className="px-5 py-3">Last order</th>
              <th scope="col" className="px-5 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  {c.name}
                  <span className="block text-xs text-stone-500">{c.email}{c.phone ? ` · ${c.phone}` : ""}</span>
                </td>
                <td className="px-5 py-3">{c.orderCount}</td>
                <td className="px-5 py-3 font-medium">{formatPrice(c.lifetimeCents)}</td>
                <td className="px-5 py-3 text-stone-400">
                  {c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </td>
                <td className="px-5 py-3 text-stone-400">
                  {new Date(c.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-stone-500">No customers match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
