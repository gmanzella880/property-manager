"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Wrench, FileText, DollarSign, Pencil, Save, X, Trash2 } from "lucide-react";

const statusColors = {
  open: "bg-red-50 text-red-700",
  "in-progress": "bg-amber-50 text-amber-700",
  closed: "bg-green-50 text-green-700",
};

export default function UnitDetail({ unit }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [unitNumber, setUnitNumber] = useState(unit.unitNumber);
  const [rentAmount, setRentAmount] = useState(unit.rentAmount);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/admin/units/${unit.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unitNumber, rentAmount: parseInt(rentAmount) }),
    });
    setEditing(false);
    setSaving(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this unit? This action cannot be undone.")) return;
    await fetch(`/api/admin/units/${unit.id}`, { method: "DELETE" });
    router.push("/admin/units");
    router.refresh();
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Unit Number</label>
                  <input
                    value={unitNumber}
                    onChange={(e) => setUnitNumber(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Rent Amount ($)</label>
                  <input
                    type="number"
                    value={rentAmount}
                    onChange={(e) => setRentAmount(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                  />
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900">Unit {unit.unitNumber}</h1>
                <p className="text-sm text-gray-500 mt-1">{unit.property?.name}</p>
                <p className="text-lg font-semibold text-gray-900 mt-2">${unit.rentAmount.toLocaleString()}/mo</p>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button onClick={() => setEditing(false)} className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
                <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#1e3a5f] text-white rounded-lg text-sm hover:bg-[#2a5280] cursor-pointer">
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 cursor-pointer">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={handleDelete} className="p-2 text-red-400 hover:text-red-600 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tenant info */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          {unit.tenant ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#1e3a5f] rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <Link href={`/admin/tenants/${unit.tenant.id}`} className="font-medium text-[#1e3a5f] hover:underline text-sm">
                  {unit.tenant.name}
                </Link>
                <p className="text-xs text-gray-500">
                  Lease: {new Date(unit.tenant.leaseStart).toLocaleDateString()} — {new Date(unit.tenant.leaseEnd).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No tenant assigned</p>
          )}
        </div>
      </div>

      {/* Tabs content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tickets */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Wrench className="w-4 h-4" /> Maintenance History
          </h2>
          {unit.tickets.length > 0 ? (
            <div className="space-y-3">
              {unit.tickets.map((t) => (
                <Link key={t.id} href={`/admin/tickets/${t.id}`} className="block p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{t.category}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[t.status] || "bg-gray-50 text-gray-600"}`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{t.description}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No maintenance tickets</p>
          )}
        </div>

        {/* Expenses */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4" /> Expenses
          </h2>
          {unit.expenses.length > 0 ? (
            <div className="space-y-3">
              {unit.expenses.map((exp) => (
                <div key={exp.id} className="p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{exp.description}</p>
                    <p className="text-sm font-semibold text-gray-900">${exp.amount.toLocaleString()}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {exp.vendor?.name || "No vendor"} · {new Date(exp.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No expenses logged</p>
          )}
        </div>

        {/* Documents */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 lg:col-span-2">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4" /> Documents
          </h2>
          {unit.documents.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {unit.documents.map((doc) => (
                <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.fileName}</p>
                  <p className="text-xs text-gray-500 mt-1 capitalize">{doc.type}</p>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No documents</p>
          )}
        </div>
      </div>
    </div>
  );
}
