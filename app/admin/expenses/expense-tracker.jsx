"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Download, DollarSign, Search, Pencil, Trash2 } from "lucide-react";

export default function ExpenseTracker({ expenses, units, vendors }) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [unitFilter, setUnitFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = expenses.filter((e) => {
    const matchUnit = unitFilter === "all" || e.unitId === unitFilter;
    const matchVendor = vendorFilter === "all" || e.vendorId === vendorFilter;
    const matchSearch = e.description.toLowerCase().includes(search.toLowerCase());
    return matchUnit && matchVendor && matchSearch;
  });

  const totalAll = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalFiltered = filtered.reduce((sum, e) => sum + e.amount, 0);

  // Monthly total
  const now = new Date();
  const monthlyTotal = expenses
    .filter((e) => {
      const d = new Date(e.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  // Yearly total
  const yearlyTotal = expenses
    .filter((e) => new Date(e.createdAt).getFullYear() === now.getFullYear())
    .reduce((sum, e) => sum + e.amount, 0);

  function exportCSV() {
    const headers = "Date,Description,Amount,Unit,Vendor\n";
    const rows = filtered.map((e) =>
      `${new Date(e.createdAt).toLocaleDateString()},"${e.description}",${e.amount},${e.unit?.unitNumber || ""},${e.vendor?.name || ""}`
    ).join("\n");
    const csv = headers + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleAdd(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    await fetch("/api/admin/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: form.get("description"),
        amount: parseInt(form.get("amount")),
        unitId: form.get("unitId"),
        vendorId: form.get("vendorId") || null,
        receiptUrl: form.get("receiptUrl") || null,
      }),
    });
    setShowAdd(false);
    router.refresh();
  }

  async function handleDelete(expenseId) {
    if (!confirm("Delete this expense? This cannot be undone.")) return;
    await fetch(`/api/admin/expenses/${expenseId}`, { method: "DELETE" });
    router.refresh();
  }

  async function handleEdit(e, expenseId) {
    e.preventDefault();
    const form = new FormData(e.target);
    await fetch(`/api/admin/expenses/${expenseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: form.get("description"),
        amount: parseInt(form.get("amount")),
        unitId: form.get("unitId"),
        vendorId: form.get("vendorId") || null,
      }),
    });
    setEditingId(null);
    router.refresh();
  }

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Total (All Time)</p>
          <p className="text-xl font-bold text-gray-900">${totalAll.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">This Year</p>
          <p className="text-xl font-bold text-gray-900">${yearlyTotal.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">This Month</p>
          <p className="text-xl font-bold text-gray-900">${monthlyTotal.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Filtered Total</p>
          <p className="text-xl font-bold text-[#1e3a5f]">${totalFiltered.toLocaleString()}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
          />
        </div>
        <select value={unitFilter} onChange={(e) => setUnitFilter(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="all">All Units</option>
          {units.map((u) => <option key={u.id} value={u.id}>Unit {u.unitNumber}</option>)}
        </select>
        <select value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="all">All Vendors</option>
          {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <button onClick={exportCSV} className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 cursor-pointer">
          <Download className="w-3.5 h-3.5" /> CSV
        </button>
        <button onClick={() => setShowAdd(!showAdd)} className="inline-flex items-center gap-1 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#2a5280] cursor-pointer">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <input name="description" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Amount ($)</label>
              <input name="amount" type="number" min="0" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
              <select name="unitId" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="">Select unit</option>
                {units.map((u) => <option key={u.id} value={u.id}>Unit {u.unitNumber}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Vendor (optional)</label>
              <select name="vendorId" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="">None</option>
                {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Receipt URL (optional)</label>
              <input name="receiptUrl" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm hover:bg-[#2a5280] cursor-pointer">Add Expense</button>
            </div>
          </form>
        </div>
      )}

      {/* Expense list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Unit</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Vendor</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((exp) => (
              editingId === exp.id ? (
                <tr key={exp.id} className="border-b border-gray-100 bg-blue-50/50">
                  <td colSpan={6} className="px-4 py-3">
                    <form onSubmit={(e) => handleEdit(e, exp.id)} className="flex flex-wrap gap-2 items-end">
                      <input name="description" defaultValue={exp.description} required className="rounded-lg border border-gray-300 px-2 py-1 text-sm flex-1 min-w-[120px]" />
                      <input name="amount" type="number" defaultValue={exp.amount} required className="rounded-lg border border-gray-300 px-2 py-1 text-sm w-24" />
                      <select name="unitId" defaultValue={exp.unitId} required className="rounded-lg border border-gray-300 px-2 py-1 text-sm">
                        {units.map((u) => <option key={u.id} value={u.id}>Unit {u.unitNumber}</option>)}
                      </select>
                      <select name="vendorId" defaultValue={exp.vendorId || ""} className="rounded-lg border border-gray-300 px-2 py-1 text-sm">
                        <option value="">No vendor</option>
                        {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                      <button type="submit" className="px-3 py-1 bg-[#1e3a5f] text-white rounded-lg text-xs cursor-pointer">Save</button>
                      <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1 border border-gray-300 rounded-lg text-xs cursor-pointer">Cancel</button>
                    </form>
                  </td>
                </tr>
              ) : (
                <tr key={exp.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{new Date(exp.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-900">{exp.description}</td>
                  <td className="px-4 py-3 text-gray-600">{exp.unit?.unitNumber || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{exp.vendor?.name || "—"}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">${exp.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button onClick={() => setEditingId(exp.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#1e3a5f] cursor-pointer">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(exp.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No expenses found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
