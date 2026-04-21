"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ExternalLink, Trash2 } from "lucide-react";
import AddTenantModal from "./add-tenant-modal";

export default function TenantsList({ tenants, vacantUnits }) {
  const [search, setSearch] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const showModal = searchParams.get("modal") === "add";

  async function handleDelete(tenantId, name) {
    if (!confirm(`Delete tenant "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/tenants/${tenantId}`, { method: "DELETE" });
    router.refresh();
  }

  const filtered = tenants.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    t.unit?.unitNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {showModal && <AddTenantModal vacantUnits={vacantUnits} />}

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tenants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Unit</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Rent</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Lease End</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Portal</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tenant) => (
                <tr key={tenant.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/tenants/${tenant.id}`} className="font-medium text-[#1e3a5f] hover:underline">
                      {tenant.name}
                    </Link>
                    <p className="text-xs text-gray-500">{tenant.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{tenant.unit?.unitNumber || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">${tenant.unit?.rentAmount?.toLocaleString() || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(tenant.leaseEnd).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {tenant.active !== false ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">Active</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/portal/${tenant.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs text-[#1e3a5f] hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Portal
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(tenant.id, tenant.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No tenants found
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
