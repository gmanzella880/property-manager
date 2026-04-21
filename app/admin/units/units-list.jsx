"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Search, Check, X, Pencil, Trash2 } from "lucide-react";
import AddUnitModal from "./add-unit-modal";

export default function UnitsList({ units }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, occupied, vacant
  const searchParams = useSearchParams();
  const router = useRouter();
  const showModal = searchParams.get("modal") === "add";

  async function handleDelete(unitId, unitNumber) {
    if (!confirm(`Delete Unit ${unitNumber}? This cannot be undone.`)) return;
    await fetch(`/api/admin/units/${unitId}`, { method: "DELETE" });
    router.refresh();
  }

  const filtered = units.filter((unit) => {
    const matchSearch =
      unit.unitNumber.toLowerCase().includes(search.toLowerCase()) ||
      unit.property?.name?.toLowerCase().includes(search.toLowerCase()) ||
      unit.tenant?.name?.toLowerCase().includes(search.toLowerCase());

    if (filter === "occupied") return matchSearch && unit.tenant;
    if (filter === "vacant") return matchSearch && !unit.tenant;
    return matchSearch;
  }).sort((a, b) => {
    const numA = parseInt(a.unitNumber) || 0;
    const numB = parseInt(b.unitNumber) || 0;
    if (numA !== numB) return numA - numB;
    return a.unitNumber.localeCompare(b.unitNumber);
  });

  const occupied = units.filter((u) => u.tenant).length;
  const vacant = units.length - occupied;

  return (
    <>
      {showModal && <AddUnitModal />}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{units.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Occupied</p>
          <p className="text-2xl font-bold text-green-600">{occupied}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Vacant</p>
          <p className="text-2xl font-bold text-amber-600">{vacant}</p>
        </div>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search units..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {["all", "occupied", "vacant"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize cursor-pointer ${
                filter === f
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Unit</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Property</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tenant</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Rent</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((unit) => (
                <tr key={unit.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/units/${unit.id}`} className="font-medium text-[#1e3a5f] hover:underline">
                      {unit.unitNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{unit.property?.name || "—"}</td>
                  <td className="px-4 py-3">
                    {unit.tenant ? (
                      <Link href={`/admin/tenants/${unit.tenant.id}`} className="text-[#1e3a5f] hover:underline">
                        {unit.tenant.name}
                      </Link>
                    ) : (
                      <span className="text-gray-400">Vacant</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">${unit.rentAmount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {unit.tenant ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        <Check className="w-3 h-3" /> Occupied
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                        Vacant
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link href={`/admin/units/${unit.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#1e3a5f]">
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      <button onClick={() => handleDelete(unit.id, unit.unitNumber)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No units found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
