"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Phone, Mail, HardHat, Wrench, DollarSign, Pencil, Trash2 } from "lucide-react";

export default function VendorsManager({ vendors }) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorDetail, setVendorDetail] = useState(null);

  async function handleDelete(vendorId, name) {
    if (!confirm(`Delete vendor "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/vendors/${vendorId}`, { method: "DELETE" });
    router.refresh();
  }

  async function handleEdit(e, vendorId) {
    e.preventDefault();
    const form = new FormData(e.target);
    await fetch(`/api/admin/vendors/${vendorId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        phone: form.get("phone"),
        email: form.get("email") || null,
        specialty: form.get("specialty"),
      }),
    });
    setEditingVendor(null);
    router.refresh();
  }

  async function handleAdd(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    await fetch("/api/admin/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        phone: form.get("phone"),
        email: form.get("email") || null,
        specialty: form.get("specialty"),
      }),
    });
    setShowAdd(false);
    router.refresh();
  }

  async function viewVendor(id) {
    const res = await fetch(`/api/admin/vendors/${id}`);
    if (res.ok) {
      const data = await res.json();
      setVendorDetail(data);
      setSelectedVendor(id);
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowAdd(!showAdd)} className="inline-flex items-center gap-2 bg-[#1e3a5f] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#2a5280] cursor-pointer">
          <Plus className="w-4 h-4" /> Add Vendor
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
              <input name="name" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <input name="phone" type="tel" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email (optional)</label>
              <input name="email" type="email" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Specialty</label>
              <input name="specialty" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="e.g. Plumbing, Electrical" />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm hover:bg-[#2a5280] cursor-pointer">Add Vendor</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vendors.map((vendor) => (
          editingVendor === vendor.id ? (
            <div key={vendor.id} className="bg-white rounded-xl border border-blue-200 p-5">
              <form onSubmit={(e) => handleEdit(e, vendor.id)} className="space-y-3">
                <input name="name" defaultValue={vendor.name} required className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm" placeholder="Name" />
                <input name="phone" defaultValue={vendor.phone} required className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm" placeholder="Phone" />
                <input name="email" defaultValue={vendor.email || ""} className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm" placeholder="Email" />
                <input name="specialty" defaultValue={vendor.specialty} required className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm" placeholder="Specialty" />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditingVendor(null)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs hover:bg-gray-50 cursor-pointer">Cancel</button>
                  <button type="submit" className="px-3 py-1.5 bg-[#1e3a5f] text-white rounded-lg text-xs hover:bg-[#2a5280] cursor-pointer">Save</button>
                </div>
              </form>
            </div>
          ) : (
          <div key={vendor.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <HardHat className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{vendor.name}</h3>
                <p className="text-xs text-gray-500">{vendor.specialty}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{vendor.phone}</p>
                  {vendor.email && <p className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" />{vendor.email}</p>}
                </div>
                <div className="mt-3 flex gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Wrench className="w-3 h-3" />{vendor._count.tickets} tickets</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{vendor._count.expenses} expenses</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => viewVendor(vendor.id)}
                    className="text-xs text-[#1e3a5f] hover:underline cursor-pointer"
                  >
                    View details →
                  </button>
                  <button onClick={() => setEditingVendor(vendor.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#1e3a5f] cursor-pointer">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(vendor.id, vendor.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          )
        ))}
        {vendors.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-400">No vendors yet</p>
          </div>
        )}
      </div>

      {/* Vendor detail modal */}
      {vendorDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setVendorDetail(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 mx-4 z-10 max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-1">{vendorDetail.name}</h2>
            <p className="text-sm text-gray-500 mb-4">{vendorDetail.specialty}</p>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Assigned Tickets ({vendorDetail.tickets.length})</h3>
                {vendorDetail.tickets.length > 0 ? (
                  <div className="space-y-2">
                    {vendorDetail.tickets.map((t) => (
                      <div key={t.id} className="p-2 rounded-lg bg-gray-50 text-sm">
                        <span className="font-medium">{t.category}</span> · Unit {t.unit?.unitNumber} · <span className="capitalize">{t.status}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-gray-400">No tickets</p>}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Linked Expenses ({vendorDetail.expenses.length})</h3>
                {vendorDetail.expenses.length > 0 ? (
                  <div className="space-y-2">
                    {vendorDetail.expenses.map((e) => (
                      <div key={e.id} className="p-2 rounded-lg bg-gray-50 text-sm flex justify-between">
                        <span>{e.description} · Unit {e.unit?.unitNumber}</span>
                        <span className="font-medium">${e.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-gray-400">No expenses</p>}
              </div>
            </div>

            <button onClick={() => setVendorDetail(null)} className="mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm w-full hover:bg-gray-50 cursor-pointer">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
