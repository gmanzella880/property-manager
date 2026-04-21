"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function AddTenantModal({ vacantUnits }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.target);

    const res = await fetch("/api/admin/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        unitId: form.get("unitId"),
        leaseStart: form.get("leaseStart"),
        leaseEnd: form.get("leaseEnd"),
        rentAmount: form.get("rentAmount") ? parseInt(form.get("rentAmount")) : undefined,
      }),
    });

    if (res.ok) {
      router.push("/admin/tenants");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to add tenant");
    }
    setLoading(false);
  }

  function close() {
    router.push("/admin/tenants");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={close} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 mx-4 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Add Tenant</h2>
          <button onClick={close} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input name="name" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input name="email" type="email" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input name="phone" type="tel" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign Unit</label>
              <select name="unitId" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]">
                <option value="">Select a unit</option>
                {vacantUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    Unit {unit.unitNumber} — ${unit.rentAmount}/mo
                  </option>
                ))}
              </select>
              {vacantUnits.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">No vacant units available</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rent Amount ($)</label>
              <input name="rentAmount" type="number" min="0" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" placeholder="Leave blank to keep unit default" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lease Start</label>
              <input name="leaseStart" type="date" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lease End</label>
              <input name="leaseEnd" type="date" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={close} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 rounded-lg bg-[#1e3a5f] text-white text-sm font-medium hover:bg-[#2a5280] disabled:opacity-50 transition-colors cursor-pointer">
              {loading ? "Adding..." : "Add Tenant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
