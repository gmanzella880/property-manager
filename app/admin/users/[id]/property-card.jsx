"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Home, Pencil, Trash2, X } from "lucide-react";

export default function PropertyCard({ property, userName }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: property.name, address: property.address });
  const [loading, setLoading] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/admin/properties/${property.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete "${property.name}"? This will also delete all its units, tenants, and data.`)) return;
    await fetch(`/api/admin/properties/${property.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
      {editing ? (
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Property Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">{property.name}</h2>
              {property.address && (
                <span className="text-sm text-gray-400">— {property.address}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setEditing(true)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                title="Edit property"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                title="Delete property"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid gap-2">
            {property.units.map((unit) => (
              <div
                key={unit.id}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <Home className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900">Unit {unit.unitNumber}</span>
                  <span className="text-sm text-gray-500">${unit.rentAmount}/mo</span>
                </div>
                <div>
                  {unit.tenant ? (
                    <span
                      className={`text-sm ${
                        unit.tenant.active ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {unit.tenant.name}{" "}
                      {!unit.tenant.active && (
                        <span className="text-xs">(inactive)</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-sm text-amber-500">Vacant</span>
                  )}
                </div>
              </div>
            ))}
            {property.units.length === 0 && (
              <p className="text-sm text-gray-400 py-2">No units added yet</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
