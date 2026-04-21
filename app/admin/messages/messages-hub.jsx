"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Users, MessageSquare, Radio } from "lucide-react";

export default function MessagesHub({ tenants }) {
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [showBroadcast, setShowBroadcast] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedTenant) {
      loadMessages(selectedTenant.id);
    }
  }, [selectedTenant]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadMessages(tenantId) {
    const res = await fetch(`/api/admin/tenants/${tenantId}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages || []);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTenant) return;
    setSending(true);

    const res = await fetch("/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: selectedTenant.id, message: newMessage }),
    });

    if (res.ok) {
      setNewMessage("");
      await loadMessages(selectedTenant.id);
    }
    setSending(false);
  }

  async function sendBroadcast(e) {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    if (!confirm(`Send this message to all ${tenants.length} tenants?`)) return;
    setBroadcasting(true);

    await fetch("/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: broadcastMsg, broadcast: true }),
    });

    setBroadcastMsg("");
    setShowBroadcast(false);
    setBroadcasting(false);
    if (selectedTenant) await loadMessages(selectedTenant.id);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ height: "calc(100vh - 200px)" }}>
      <div className="flex h-full">
        {/* Tenant list */}
        <div className="w-72 border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200">
            <button
              onClick={() => setShowBroadcast(!showBroadcast)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 transition-colors cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
              Broadcast to All
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {tenants.map((tenant) => (
              <button
                key={tenant.id}
                onClick={() => setSelectedTenant(tenant)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                  selectedTenant?.id === tenant.id ? "bg-blue-50 border-l-2 border-l-[#1e3a5f]" : ""
                }`}
              >
                <p className="text-sm font-medium text-gray-900">{tenant.name}</p>
                <p className="text-xs text-gray-500">Unit {tenant.unit?.unitNumber}</p>
                {tenant.messages[0] && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{tenant.messages[0].body}</p>
                )}
              </button>
            ))}
            {tenants.length === 0 && (
              <p className="p-4 text-sm text-gray-400 text-center">No tenants</p>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {showBroadcast ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="w-full max-w-md">
                <div className="text-center mb-4">
                  <Radio className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Broadcast Message</h3>
                  <p className="text-sm text-gray-500">Send to all {tenants.length} tenants</p>
                </div>
                <form onSubmit={sendBroadcast} className="space-y-3">
                  <textarea
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    placeholder="Type your broadcast message..."
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowBroadcast(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={broadcasting}
                      className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50 cursor-pointer"
                    >
                      {broadcasting ? "Sending..." : "Send Broadcast"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : selectedTenant ? (
            <>
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <p className="font-medium text-gray-900">{selectedTenant.name}</p>
                <p className="text-xs text-gray-500">Unit {selectedTenant.unit?.unitNumber}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((m) => (
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
                <div ref={messagesEndRef} />
                {messages.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-8">No messages yet</p>
                )}
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="p-3 border-t border-gray-200 flex gap-2">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm hover:bg-[#2a5280] disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Select a tenant to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
