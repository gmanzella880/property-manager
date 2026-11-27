"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function AddUnitModal() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.target);

    try {
      const res = await fetch("/api/admin/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitNumber: form.get("unitNumber"),
          rentAmount: parseInt(form.get("rentAmount")),
          bedrooms: form.get("bedrooms"),
          bathrooms: form.get("bathrooms"),
          squareFeet: form.get("squareFeet"),
          propertyId: form.get("propertyId") || undefined,
        }),
      });

      if (res.ok) {
        router.push("/admin/units");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(
          data.error === "No property selected"
            ? "Add a property first: go to Users, open your name, and click Add Property."
            : data.error ||
                `Could not add the unit (error ${res.status}). Please try again.`,
        );
      }
    } catch {
      setError(
        "Could not reach the server. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function close() {
    router.push("/admin/units");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={close} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Add Unit</h2>
          <button
            onClick={close}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Number
            </label>
            <input
              name="unitNumber"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rent Amount ($)
            </label>
            <input
              name="rentAmount"
              type="number"
              required
              min="0"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
            />
          </div>

          <div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms
                </label>
                <input
                  name="bedrooms"
                  type="number"
                  min="0"
                  step="1"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms
                </label>
                <input
                  name="bathrooms"
                  type="number"
                  min="0"
                  step="0.5"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sq ft
                </label>
                <input
                  name="squareFeet"
                  type="number"
                  min="0"
                  step="1"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Optional. Shown on the public website when this unit is vacant.
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={close}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-[#1e3a5f] text-white text-sm font-medium hover:bg-[#2a5280] disabled:opacity-50 transition-colors cursor-pointer"
            >
              {loading ? "Adding..." : "Add Unit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
