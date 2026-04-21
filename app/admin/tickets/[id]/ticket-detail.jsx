"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Clock, Send, HardHat } from "lucide-react";

const statusOptions = ["open", "in-progress", "closed"];
const priorityOptions = ["low", "medium", "high", "urgent"];

const statusColors = {
  open: "bg-red-50 text-red-700 border-red-200",
  "in-progress": "bg-amber-50 text-amber-700 border-amber-200",
  closed: "bg-green-50 text-green-700 border-green-200",
};

const priorityColors = {
  low: "text-gray-500",
  medium: "text-amber-600",
  high: "text-orange-600",
  urgent: "text-red-600",
};

export default function TicketDetail({ ticket, vendors }) {
  const router = useRouter();
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);
  const [vendorId, setVendorId] = useState(ticket.vendorId || "");
  const [newMessage, setNewMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function updateTicket(updates) {
    setSaving(true);
    await fetch(`/api/admin/tickets/${ticket.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setSaving(false);
    router.refresh();
  }

  async function addUpdate(e) {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await fetch(`/api/admin/tickets/${ticket.id}/updates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: newMessage, from: "Admin" }),
    });
    setNewMessage("");
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main thread */}
      <div className="lg:col-span-2 space-y-6">
        {/* Ticket info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-900">{ticket.category}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[ticket.status]}`}>
              {ticket.status}
            </span>
          </div>
          <p className="text-sm text-gray-600">{ticket.description}</p>
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><User className="w-3 h-3" />{ticket.tenant?.name}</span>
            <span>Unit {ticket.unit?.unitNumber}</span>
            <span className={`font-medium capitalize ${priorityColors[ticket.priority]}`}>{ticket.priority} priority</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(ticket.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Thread */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Updates</h2>
          <div className="space-y-3 mb-4">
            {ticket.updates.length > 0 ? (
              ticket.updates.map((u) => (
                <div key={u.id} className={`p-3 rounded-lg ${u.from === "Admin" ? "bg-blue-50 border border-blue-100" : "bg-gray-50 border border-gray-100"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">{u.from}</span>
                    <span className="text-xs text-gray-400">{new Date(u.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-700">{u.message}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No updates yet</p>
            )}
          </div>

          <form onSubmit={addUpdate} className="flex gap-2">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Add an update..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm hover:bg-[#2a5280] cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </form>
        </div>

        {/* Documents */}
        {ticket.documents.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Attachments</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {ticket.documents.map((doc) => (
                <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.fileName}</p>
                  <p className="text-xs text-gray-500 capitalize">{doc.type}</p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              updateTicket({ status: e.target.value });
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Priority</h3>
          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              updateTicket({ priority: e.target.value });
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
          >
            {priorityOptions.map((p) => (
              <option key={p} value={p} className="capitalize">{p}</option>
            ))}
          </select>
        </div>

        {/* Vendor */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <HardHat className="w-3.5 h-3.5" /> Assigned Vendor
          </h3>
          <select
            value={vendorId}
            onChange={(e) => {
              setVendorId(e.target.value);
              updateTicket({ vendorId: e.target.value });
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
          >
            <option value="">None</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>{v.name} — {v.specialty}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
