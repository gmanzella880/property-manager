"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { dollars, periodLabel } from "@/lib/rent";
import { StatusPill, RecordPaymentModal, PaymentHistory } from "../../rent/rent-ui";

/** Rent status, track record and full payment history for one tenant. */
export default function RentPanel({ tenant, current, record, payments, canRecord }) {
  const [recording, setRecording] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? payments : payments.slice(0, 8);

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
      {recording && (
        <RecordPaymentModal tenant={tenant} period={current.period} suggestedCents={current.balance} onClose={() => setRecording(false)} />
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-900">Rent</h2>
        {canRecord && (
          <button type="button" onClick={() => setRecording(true)} className="inline-flex items-center gap-1 rounded-lg bg-[#1e3a5f] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#2a5280] cursor-pointer">
            <Plus className="h-4 w-4" /> Record payment
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-500">{periodLabel(current.period)}</p>
          <div className="mt-1 flex items-center gap-2">
            <StatusPill status={current.status} />
            <span className="text-sm text-gray-700">
              {current.status === "paid" ? `${dollars(current.paid)} paid`
                : current.status === "pending" ? `${dollars(current.pending)} clearing`
                : `${dollars(current.balance)} owed of ${dollars(current.rentCents)}`}
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Last {record.months || 0} month{record.months === 1 ? "" : "s"}</p>
          {record.months ? (
            <p className="mt-1 text-sm text-gray-800">
              <b>{record.onTime}</b> on time · <b className={record.late ? "text-amber-700" : ""}>{record.late}</b> late · <b className={record.missed ? "text-red-700" : ""}>{record.missed}</b> not paid in full
            </p>
          ) : <p className="mt-1 text-sm text-gray-500">No earlier months yet.</p>}
          <p className="mt-0.5 text-xs text-gray-400">On time = paid in full by the 5th.</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Owed from earlier months</p>
          <p className={`mt-1 text-lg font-bold ${record.owedCents ? "text-red-700" : "text-gray-900"}`}>{dollars(record.owedCents)}</p>
          {record.rows.filter((r) => r.balance > 0).slice(0, 3).map((r) => (
            <p key={r.period} className="text-xs text-gray-500">{periodLabel(r.period)}: {dollars(r.balance)}</p>
          ))}
        </div>
      </div>

      <h3 className="mt-6 mb-1 text-sm font-semibold text-gray-700">Payment history</h3>
      <PaymentHistory payments={shown} canVoid={canRecord} />
      {payments.length > 8 && (
        <button type="button" onClick={() => setShowAll(!showAll)} className="mt-2 text-sm text-[#1e3a5f] hover:underline cursor-pointer">
          {showAll ? "Show fewer" : `Show all ${payments.length} payments`}
        </button>
      )}
    </div>
  );
}
