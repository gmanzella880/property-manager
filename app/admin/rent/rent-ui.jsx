"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { METHODS, dollars, periodLabel, addMonths } from "@/lib/rent";

const PILL = {
  paid: ["Paid", "bg-green-50 text-green-700"],
  pending: ["Pending", "bg-blue-50 text-blue-700"],
  partial: ["Partial", "bg-amber-50 text-amber-700"],
  unpaid: ["Unpaid", "bg-red-50 text-red-700"],
};
export function StatusPill({ status }) {
  const [label, cls] = PILL[status] || PILL.unpaid;
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}

const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Record a cash / check / money order / other payment. */
export function RecordPaymentModal({ tenant, period, suggestedCents, onClose }) {
  const router = useRouter();
  const [form, setForm] = useState({
    amount: suggestedCents > 0 ? String(suggestedCents / 100) : "",
    paidAt: todayLocal(),
    period,
    method: "cash",
    note: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const months = [-3, -2, -1, 0, 1].map((n) => addMonths(period, n));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId: tenant.id, ...form }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Could not save the payment.");
      onClose();
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const input = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <form onSubmit={save} className="relative z-10 mx-4 w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Record payment · {tenant.name}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium text-gray-700">Amount ($)
            <input name="amount" inputMode="decimal" required value={form.amount} onChange={set("amount")} className={`${input} mt-1`} />
          </label>
          <label className="text-sm font-medium text-gray-700">Date paid
            <input name="paidAt" type="date" required value={form.paidAt} max={todayLocal()} onChange={set("paidAt")} className={`${input} mt-1`} />
          </label>
        </div>
        <label className="block text-sm font-medium text-gray-700">Rent for
          <select name="period" value={form.period} onChange={set("period")} className={`${input} mt-1`}>
            {months.map((m) => <option key={m} value={m}>{periodLabel(m)}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium text-gray-700">How they paid
          <select name="method" value={form.method} onChange={set("method")} className={`${input} mt-1`}>
            <option value="cash">Cash</option>
            <option value="check">Check</option>
            <option value="money_order">Money order</option>
            <option value="other">Other (write in)</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-gray-700">
          {form.method === "other" ? "How did they pay?" : form.method === "check" ? "Check number (optional)" : "Note (optional)"}
          <input name="note" value={form.note} onChange={set("note")} required={form.method === "other"} maxLength={200} className={`${input} mt-1`} />
        </label>
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a5280] disabled:opacity-50 cursor-pointer">
            {saving ? "Saving..." : "Save payment"}
          </button>
        </div>
      </form>
    </div>
  );
}

const STATUS_TEXT = { succeeded: "", pending: "Clearing", failed: "Failed", voided: "Voided" };

/** Payment history table, with Void for manually recorded payments. */
export function PaymentHistory({ payments, canVoid = true }) {
  const router = useRouter();
  async function voidPayment(p) {
    const reason = window.prompt(`Void the ${dollars(p.amountCents)} payment from ${new Date(p.paidAt).toLocaleDateString()}? It stays in the history but no longer counts.\n\nReason:`);
    if (!reason?.trim()) return;
    const res = await fetch(`/api/admin/payments/${p.id}/void`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) window.alert((await res.json().catch(() => ({}))).error || "Could not void the payment.");
    router.refresh();
  }

  if (!payments.length) return <p className="py-6 text-center text-sm text-gray-500">No payments recorded yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
            <th className="py-2 pr-3 font-medium">Date paid</th>
            <th className="py-2 pr-3 font-medium">For</th>
            <th className="py-2 pr-3 font-medium">Amount</th>
            <th className="py-2 pr-3 font-medium">Method</th>
            <th className="py-2 pr-3 font-medium">Note</th>
            {canVoid && <th className="py-2 font-medium"></th>}
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => {
            const off = p.status === "voided" || p.status === "failed";
            return (
              <tr key={p.id} className={`border-b border-gray-100 ${off ? "text-gray-400" : "text-gray-800"}`}>
                <td className="py-2 pr-3 whitespace-nowrap">{new Date(p.paidAt).toLocaleDateString()}</td>
                <td className="py-2 pr-3 whitespace-nowrap">{periodLabel(p.period)}</td>
                <td className={`py-2 pr-3 whitespace-nowrap ${off ? "line-through" : ""}`}>{dollars(p.amountCents)}</td>
                <td className="py-2 pr-3 whitespace-nowrap">
                  {METHODS[p.method] || p.method}
                  {STATUS_TEXT[p.status] && <span className="ml-1.5 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{STATUS_TEXT[p.status]}</span>}
                </td>
                <td className="py-2 pr-3">
                  {p.note}
                  {p.status === "voided" && <span className="block text-xs">Voided{p.voidedBy ? ` by ${p.voidedBy}` : ""}: {p.voidReason}</span>}
                  {p.source === "manual" && p.recordedBy && p.status !== "voided" && <span className="block text-xs text-gray-400">Recorded by {p.recordedBy}</span>}
                </td>
                {canVoid && (
                  <td className="py-2 text-right">
                    {p.source === "manual" && p.status !== "voided" && (
                      <button type="button" onClick={() => voidPayment(p)} className="text-xs text-red-600 hover:underline cursor-pointer">Void</button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
