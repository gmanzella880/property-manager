"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CheckCircle2, Trash2 } from "lucide-react";

export default function FeedbackList({ feedback }) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const router = useRouter();

  const filtered = feedback.filter((f) => {
    const matchType = typeFilter === "all" || f.type === typeFilter;
    const matchStatus = statusFilter === "all" || f.status === statusFilter;
    return matchType && matchStatus;
  });

  async function updateStatus(id, status) {
    await fetch(`/api/admin/feedback/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this feedback? This cannot be undone.")) return;
    await fetch(`/api/admin/feedback/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
        >
          <option value="all">All Types</option>
          <option value="idea">Ideas</option>
          <option value="complaint">Complaints</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="space-y-4">
        {filtered.map((f) => (
          <div key={f.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                    f.type === "complaint" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
                  }`}>{f.type}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                    f.status === "open" ? "bg-gray-100 text-gray-600" :
                    f.status === "reviewed" ? "bg-amber-50 text-amber-700" :
                    "bg-green-50 text-green-700"
                  }`}>{f.status}</span>
                  <span className="text-xs text-gray-400">{new Date(f.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-900">{f.body}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {f.anonymous ? "Anonymous" : f.tenant?.name || "Unknown"}
                </p>
              </div>
              <div className="flex gap-1">
                {f.status === "open" && (
                  <button
                    onClick={() => updateStatus(f.id, "reviewed")}
                    className="px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 cursor-pointer"
                  >
                    Mark Reviewed
                  </button>
                )}
                {f.status !== "resolved" && (
                  <button
                    onClick={() => updateStatus(f.id, "resolved")}
                    className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 cursor-pointer"
                  >
                    Resolve
                  </button>
                )}
                <button
                  onClick={() => handleDelete(f.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-400">No feedback found</p>
          </div>
        )}
      </div>
    </div>
  );
}
