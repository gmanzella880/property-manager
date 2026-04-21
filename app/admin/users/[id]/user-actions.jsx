"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, ShieldCheck, Trash2, Plus, Pencil, X, Building2 } from "lucide-react";

export default function UserActions({ user, currentUserId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [propertyForm, setPropertyForm] = useState({ name: "", address: "" });
  const isSelf = user.id === currentUserId;

  async function toggleRole() {
    if (isSelf) return;
    setLoading(true);
    const newRole = user.role === "super_admin" ? "admin" : "super_admin";
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setLoading(false);
    router.refresh();
  }

  async function deleteUser() {
    if (isSelf) return;
    if (!confirm(`Delete ${user.name}? This will remove their account but NOT their properties/data.`)) return;
    setLoading(true);
    await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    setLoading(false);
    router.push("/admin/users");
    router.refresh();
  }

  function openAddProperty() {
    setEditingProperty(null);
    setPropertyForm({ name: "", address: "" });
    setShowPropertyForm(true);
  }

  function openEditProperty(property) {
    setEditingProperty(property);
    setPropertyForm({ name: property.name, address: property.address });
    setShowPropertyForm(true);
  }

  async function handlePropertySubmit(e) {
    e.preventDefault();
    setLoading(true);

    if (editingProperty) {
      await fetch(`/api/admin/properties/${editingProperty.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(propertyForm),
      });
    } else {
      await fetch("/api/admin/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...propertyForm, landlordId: user.id }),
      });
    }

    setLoading(false);
    setShowPropertyForm(false);
    router.refresh();
  }

  async function deleteProperty(property) {
    if (!confirm(`Delete "${property.name}"? This will also delete all its units, tenants, and data.`)) return;
    await fetch(`/api/admin/properties/${property.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={openAddProperty}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Property
        </button>
        {!isSelf && (
          <>
            <button
              onClick={toggleRole}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              {user.role === "super_admin" ? (
                <>
                  <Shield className="w-3.5 h-3.5" /> Demote to Admin
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" /> Promote to Super Admin
                </>
              )}
            </button>
            <button
              onClick={deleteUser}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </>
        )}
        {isSelf && (
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">You</span>
        )}
      </div>

      {/* Property Form Modal */}
      {showPropertyForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingProperty ? "Edit Property" : "Add Property"}
              </h2>
              <button
                onClick={() => setShowPropertyForm(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePropertySubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Name
                </label>
                <input
                  type="text"
                  required
                  value={propertyForm.name}
                  onChange={(e) => setPropertyForm({ ...propertyForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Georgian Oaks Apartments"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={propertyForm.address}
                  onChange={(e) => setPropertyForm({ ...propertyForm, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Main St, City, State"
                />
              </div>
              <p className="text-xs text-gray-400">
                This property will be assigned to <strong>{user.name}</strong>
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPropertyForm(false)}
                  className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingProperty ? "Save Changes" : "Add Property"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
