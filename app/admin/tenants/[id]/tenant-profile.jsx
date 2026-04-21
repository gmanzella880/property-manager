"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, Building2, Wrench, MessageSquare, FileText, Lightbulb,
  Pencil, Save, X, Trash2, ExternalLink, Phone, Mail
} from "lucide-react";

const statusColors = {
  open: "bg-red-50 text-red-700",
  "in-progress": "bg-amber-50 text-amber-700",
  closed: "bg-green-50 text-green-700",
};

export default function TenantProfile({ tenant }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: tenant.name,
    email: tenant.email,
    phone: tenant.phone,
    leaseStart: tenant.leaseStart.split("T")[0],
    leaseEnd: tenant.leaseEnd.split("T")[0],
  });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("tickets");
  const [active, setActive] = useState(tenant.active !== false);
  const [showInactiveModal, setShowInactiveModal] = useState(false);
  const [inactiveDate, setInactiveDate] = useState(form.leaseEnd);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/admin/tenants/${tenant.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditing(false);
    setSaving(false);
    router.refresh();
  }

  async function toggleActive() {
    if (active) {
      // Going from active -> inactive: show modal
      setShowInactiveModal(true);
    } else {
      // Going from inactive -> active
      setActive(true);
      await fetch(`/api/admin/tenants/${tenant.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: true }),
      });
      router.refresh();
    }
  }

  async function confirmInactive() {
    setActive(false);
    setForm({ ...form, leaseEnd: inactiveDate });
    await fetch(`/api/admin/tenants/${tenant.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: false, leaseEnd: inactiveDate }),
    });
    setShowInactiveModal(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete ${tenant.name}? This will remove all their data.`)) return;
    await fetch(`/api/admin/tenants/${tenant.id}`, { method: "DELETE" });
    router.push("/admin/tenants");
    router.refresh();
  }

  const tabs = [
    { key: "tickets", label: "Tickets", icon: Wrench, count: tenant.tickets.length },
    { key: "messages", label: "Messages", icon: MessageSquare, count: tenant.messages.length },
    { key: "documents", label: "Documents", icon: FileText, count: tenant.documents.length },
    { key: "feedback", label: "Feedback", icon: Lightbulb, count: tenant.feedback.length },
  ];

  return (
    <div>
      {/* Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#1e3a5f] rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              {editing ? (
                <div className="space-y-3">
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
                  <div className="grid grid-cols-2 gap-3">
                    <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
                    <input type="date" value={form.leaseStart} onChange={(e) => setForm({ ...form, leaseStart: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
                    <input type="date" value={form.leaseEnd} onChange={(e) => setForm({ ...form, leaseEnd: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-gray-900">{tenant.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{tenant.email}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{tenant.phone}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />Unit {tenant.unit?.unitNumber} · ${tenant.unit?.rentAmount?.toLocaleString()}/mo</span>
                    <span>Lease: {new Date(tenant.leaseStart).toLocaleDateString()} — {new Date(tenant.leaseEnd).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-2">
                    <Link href={`/portal/${tenant.slug}`} target="_blank" className="inline-flex items-center gap-1 text-xs text-[#1e3a5f] hover:underline">
                      <ExternalLink className="w-3 h-3" /> Portal: /portal/{tenant.slug}
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button onClick={() => setEditing(false)} className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-4 h-4" /></button>
                <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#1e3a5f] text-white rounded-lg text-sm hover:bg-[#2a5280] cursor-pointer">
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              </>
            ) : (
              <>
                <button onClick={toggleActive} className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer ${active ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {active ? "Active" : "Inactive"}
                </button>
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
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6 overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            <span className="text-gray-400">({count})</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {tab === "tickets" && (
          <div>
            {tenant.tickets.length > 0 ? (
              <div className="space-y-3">
                {tenant.tickets.map((t) => (
                  <Link key={t.id} href={`/admin/tickets/${t.id}`} className="block p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{t.category}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[t.status] || "bg-gray-50 text-gray-600"}`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(t.createdAt).toLocaleDateString()}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No tickets</p>
            )}
          </div>
        )}

        {tab === "messages" && (
          <div>
            {tenant.messages.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tenant.messages.map((m) => (
                  <div key={m.id} className={`flex ${m.direction === "outbound" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                      m.direction === "outbound"
                        ? "bg-[#1e3a5f] text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}>
                      <p>{m.body}</p>
                      <p className={`text-xs mt-1 ${m.direction === "outbound" ? "text-blue-200" : "text-gray-400"}`}>
                        {new Date(m.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No messages</p>
            )}
          </div>
        )}

        {tab === "documents" && (
          <div>
            {tenant.documents.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {tenant.documents.map((doc) => (
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
        )}

        {tab === "feedback" && (
          <div>
            {tenant.feedback.length > 0 ? (
              <div className="space-y-3">
                {tenant.feedback.map((f) => (
                  <div key={f.id} className="p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        f.type === "complaint" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
                      }`}>{f.type}</span>
                      <span className="text-xs text-gray-400">{new Date(f.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-900 mt-2">{f.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No feedback</p>
            )}
          </div>
        )}
      </div>

      {/* Mark Inactive Modal */}
      {showInactiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowInactiveModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 mx-4 z-10">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Mark Tenant Inactive</h2>
            <p className="text-sm text-gray-600 mb-4">Are you sure you want to mark inactive? Please fill out lease end date.</p>
            <label className="block text-xs font-medium text-gray-700 mb-1">Lease End Date</label>
            <input
              type="date"
              value={inactiveDate}
              onChange={(e) => setInactiveDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowInactiveModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmInactive}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 cursor-pointer"
              >
                Mark Inactive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
