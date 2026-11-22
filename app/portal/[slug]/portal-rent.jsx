"use client";

import { useState } from "react";
import { METHODS, dollars, periodLabel } from "@/lib/rent";

const TEXT = {
  paid: ["Paid", "bg-green-50 text-green-700"],
  pending: ["Payment clearing", "bg-blue-50 text-blue-700"],
  partial: ["Partly paid", "bg-amber-50 text-amber-700"],
  unpaid: ["Due", "bg-red-50 text-red-700"],
};

/** The tenant's rent status, Pay rent button and payment history. */
export default function PortalRent({ months, payments, online, preview, justPaid }) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  async function pay(period) {
    setBusy(period);
    setError("");
    try {
      const res = await fetch("/api/portal/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || "Could not start the payment. Please try again.");
      window.location.assign(data.url); // Stripe's secure payment page
    } catch (e) {
      setError(e.message);
      setBusy("");
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-lg font-bold text-gray-900">Rent</h2>
      {justPaid && (
        <p className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Thanks! Your payment was submitted. Bank payments take a few business days to clear.
        </p>
      )}
      <div className="mt-3 space-y-3">
        {months.map((m) => {
          const [label, cls] = TEXT[m.status];
          return (
            <div key={m.period} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-gray-50 p-3">
              <div>
                <p className="font-medium text-gray-900">{periodLabel(m.period)}</p>
                <p className="text-sm text-gray-600">
                  <span className={`mr-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
                  {m.status === "paid" ? `${dollars(m.paid)} paid` : m.status === "pending" ? `${dollars(m.pending)} clearing` : `${dollars(m.balance)} due`}
                </p>
              </div>
              {online && !preview && m.balance > 0 && (
                <button type="button" onClick={() => pay(m.period)} disabled={!!busy}
                  className="rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a5280] disabled:opacity-50 cursor-pointer">
                  {busy === m.period ? "Opening..." : `Pay ${dollars(m.balance)}`}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {online
        ? <p className="mt-3 text-xs text-gray-500">Pay online by bank account or card. You can also pay by cash or check.</p>
        : <p className="mt-3 text-xs text-gray-500">Pay your landlord by cash or check. Online payments are coming soon.</p>}

      <button type="button" onClick={() => setShowHistory(!showHistory)} className="mt-4 text-sm text-[#1e3a5f] hover:underline cursor-pointer">
        {showHistory ? "Hide payment history" : `Payment history (${payments.length})`}
      </button>
      {showHistory && (
        <ul className="mt-2 divide-y divide-gray-100 text-sm">
          {payments.map((p) => (
            <li key={p.id} className={`flex justify-between gap-3 py-2 ${p.status === "succeeded" ? "text-gray-800" : "text-gray-400"}`}>
              <span>{new Date(p.paidAt).toLocaleDateString()} · {periodLabel(p.period)}</span>
              <span className="text-right">
                {dollars(p.amountCents)} {METHODS[p.method]}
                {p.status === "pending" && " (clearing)"}{p.status === "failed" && " (failed)"}
              </span>
            </li>
          ))}
          {!payments.length && <li className="py-2 text-gray-500">No payments yet.</li>}
        </ul>
      )}
    </div>
  );
}
