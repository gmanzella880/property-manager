"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { METHODS, dollars, periodLabel } from "@/lib/rent";
import { StatusPill, RecordPaymentModal } from "./rent-ui";

export default function RentBoard({ period, prev, next, isCurrent, rows }) {
  const [recording, setRecording] = useState(null);
  const total = (k) => rows.reduce((s, r) => s + r[k], 0);
  const count = (st) => rows.filter((r) => r.status === st).length;

  return (
    <div>
      {recording && (
        <RecordPaymentModal tenant={recording.tenant} period={period} suggestedCents={recording.balance} onClose={() => setRecording(null)} />
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rent</h1>
          <p className="mt-1 text-sm text-gray-500">Who has paid, and how.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/rent?month=${prev}`} aria-label="Previous month" className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50"><ChevronLeft className="h-4 w-4" /></Link>
          <span className="min-w-36 text-center font-medium text-gray-900">{periodLabel(period)}</span>
          <Link href={`/admin/rent?month=${next}`} aria-label="Next month" className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50"><ChevronRight className="h-4 w-4" /></Link>
          {!isCurrent && <Link href="/admin/rent" className="ml-1 text-sm text-[#1e3a5f] hover:underline">This month</Link>}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["Collected", dollars(total("paid")), "text-green-600"],
          ["Clearing (bank)", dollars(total("pending")), "text-blue-600"],
          ["Still owed", dollars(total("balance")), "text-red-600"],
          ["Paid in full", `${count("paid")} of ${rows.length}`, "text-gray-900"],
        ].map(([label, value, cls]) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-2xl font-bold ${cls}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
              <th className="px-4 py-3 font-medium">Unit</th>
              <th className="px-4 py-3 font-medium">Tenant</th>
              <th className="px-4 py-3 font-medium">Rent</th>
              <th className="px-4 py-3 font-medium">Paid</th>
              <th className="px-4 py-3 font-medium">Owed</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">How</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.tenant.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 font-medium text-gray-900">{r.unitNumber}</td>
                <td className="px-4 py-3"><Link href={`/admin/tenants/${r.tenant.id}`} className="text-[#1e3a5f] hover:underline">{r.tenant.name}</Link></td>
                <td className="px-4 py-3">{dollars(r.rentCents)}</td>
                <td className="px-4 py-3">{dollars(r.paid)}{r.pending > 0 && <span className="block text-xs text-blue-600">+{dollars(r.pending)} clearing</span>}</td>
                <td className="px-4 py-3">{r.balance > 0 ? dollars(r.balance) : "—"}</td>
                <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                <td className="px-4 py-3 text-gray-600">
                  {r.payments.filter((p) => p.status === "succeeded" || p.status === "pending").map((p) => (
                    <span key={p.id} className="block whitespace-nowrap">
                      {METHODS[p.method]} {dollars(p.amountCents)} · {new Date(p.paidAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  ))}
                </td>
                <td className="px-4 py-3 text-right">
                  {r.balance > 0 && (
                    <button type="button" onClick={() => setRecording(r)} className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                      <Plus className="h-3.5 w-3.5" /> Record payment
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-500">No active tenants for this month.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
