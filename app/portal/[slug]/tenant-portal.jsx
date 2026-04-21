"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Wrench, Lightbulb, Send, Clock, CheckCircle2 } from "lucide-react";

const categories = ["Plumbing", "Electrical", "HVAC", "Appliance", "Structural", "Pest Control", "Other"];
const priorities = ["low", "medium", "high", "urgent"];

const statusColors = {
  open: "bg-red-50 text-red-700",
  "in-progress": "bg-amber-50 text-amber-700",
  closed: "bg-green-50 text-green-700",
};

export default function TenantPortal({ tenant }) {
  const router = useRouter();
  const [tab, setTab] = useState("home");
  const [ticketForm, setTicketForm] = useState({ category: "", description: "", priority: "medium" });
  const [feedbackForm, setFeedbackForm] = useState({ type: "idea", body: "", anonymous: false });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  async function submitTicket(e) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/portal/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: tenant.id,
        unitId: tenant.unitId,
        ...ticketForm,
      }),
    });
    if (res.ok) {
      setSuccess("Ticket submitted successfully!");
      setTicketForm({ category: "", description: "", priority: "medium" });
      setTimeout(() => setSuccess(""), 3000);
      router.refresh();
    }
    setSubmitting(false);
  }

  async function submitFeedback(e) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/portal/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: tenant.id,
        ...feedbackForm,
      }),
    });
    if (res.ok) {
      setSuccess("Feedback submitted! Thank you.");
      setFeedbackForm({ type: "idea", body: "", anonymous: false });
      setTimeout(() => setSuccess(""), 3000);
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1e3a5f] text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Georgian Oaks Apartments</h1>
              <p className="text-sm text-blue-200">Tenant Portal</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Welcome */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="text-lg font-bold text-gray-900">Welcome, {tenant.name}</h2>
          <div className="mt-2 text-sm text-gray-600 space-y-1">
            <p>Unit {tenant.unit?.unitNumber} · {tenant.unit?.property?.name}</p>
            <p className="font-medium text-gray-900">Rent: ${tenant.unit?.rentAmount?.toLocaleString()}/mo</p>
          </div>
        </div>

        {/* Success message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Tab nav */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6">
          {[
            { key: "home", label: "Submit Ticket", icon: Wrench },
            { key: "feedback", label: "Feedback", icon: Lightbulb },
            { key: "history", label: "My Tickets", icon: Clock },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Submit Ticket */}
        {tab === "home" && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Submit a Maintenance Request</h3>
            <form onSubmit={submitTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] resize-none"
                  placeholder="Describe the issue..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <div className="flex gap-2">
                  {priorities.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTicketForm({ ...ticketForm, priority: p })}
                      className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${
                        ticketForm.priority === p
                          ? "bg-[#1e3a5f] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-[#1e3a5f] text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-[#2a5280] disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>
        )}

        {/* Feedback */}
        {tab === "feedback" && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Share Feedback</h3>
            <form onSubmit={submitFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <div className="flex gap-2">
                  {["idea", "complaint"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFeedbackForm({ ...feedbackForm, type: t })}
                      className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${
                        feedbackForm.type === t
                          ? "bg-[#1e3a5f] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Feedback</label>
                <textarea
                  value={feedbackForm.body}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, body: e.target.value })}
                  required
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] resize-none"
                  placeholder="Share your thoughts..."
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={feedbackForm.anonymous}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, anonymous: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Submit anonymously</span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-[#1e3a5f] text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-[#2a5280] disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {submitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </form>
          </div>
        )}

        {/* Ticket History */}
        {tab === "history" && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Your Tickets</h3>
            {tenant.tickets.length > 0 ? (
              <div className="space-y-3">
                {tenant.tickets.map((t) => (
                  <div key={t.id} className="p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{t.category}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[t.status] || "bg-gray-50 text-gray-600"}`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
                <Link href={`/portal/${tenant.slug}/tickets`} className="block text-center text-sm text-[#1e3a5f] hover:underline pt-2">
                  View all tickets →
                </Link>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No tickets submitted yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
