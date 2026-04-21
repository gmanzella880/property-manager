"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Upload, FileText, AlertTriangle } from "lucide-react";

const docTypes = ["lease", "id", "insurance", "invoice", "photo", "other"];

export default function DocumentsManager({ documents, tenants, units }) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const router = useRouter();

  const filtered = documents.filter((d) => {
    const matchType = typeFilter === "all" || d.type === typeFilter;
    const matchSearch =
      d.fileName.toLowerCase().includes(search.toLowerCase()) ||
      d.tenant?.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.unit?.unitNumber?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  // Alert for insurance expiring within 30 days
  const now = new Date();
  const expiringInsurance = documents.filter((d) => {
    if (d.type !== "insurance" || !d.expiryDate) return false;
    const expiry = new Date(d.expiryDate);
    const daysUntil = (expiry - now) / (1000 * 60 * 60 * 24);
    return daysUntil <= 30 && daysUntil > 0;
  });

  async function handleUpload(e) {
    e.preventDefault();
    const form = new FormData(e.target);

    const res = await fetch("/api/admin/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: form.get("fileName"),
        fileUrl: form.get("fileUrl"),
        type: form.get("type"),
        tenantId: form.get("tenantId") || null,
        unitId: form.get("unitId") || null,
        expiryDate: form.get("expiryDate") || null,
        uploadedBy: "admin",
      }),
    });

    if (res.ok) {
      setShowUpload(false);
      router.refresh();
    }
  }

  return (
    <div>
      {/* Insurance alert */}
      {expiringInsurance.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Insurance Expiring Soon</p>
            <p className="text-xs text-amber-600 mt-1">
              {expiringInsurance.length} insurance document(s) expiring within 30 days
            </p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
        >
          <option value="all">All Types</option>
          {docTypes.map((t) => (
            <option key={t} value={t} className="capitalize">{t}</option>
          ))}
        </select>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="inline-flex items-center gap-2 bg-[#1e3a5f] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#2a5280] cursor-pointer"
        >
          <Upload className="w-4 h-4" /> Upload
        </button>
      </div>

      {/* Upload form */}
      {showUpload && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <form onSubmit={handleUpload} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">File Name</label>
              <input name="fileName" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">File URL</label>
              <input name="fileUrl" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" placeholder="Paste Supabase storage URL" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <select name="type" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]">
                {docTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tenant (optional)</label>
              <select name="tenantId" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]">
                <option value="">None</option>
                {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Unit (optional)</label>
              <select name="unitId" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]">
                <option value="">None</option>
                {units.map((u) => <option key={u.id} value={u.id}>Unit {u.unitNumber}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Expiry Date (insurance)</label>
              <input name="expiryDate" type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="button" onClick={() => setShowUpload(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm hover:bg-[#2a5280] cursor-pointer">Save Document</button>
            </div>
          </form>
        </div>
      )}

      {/* Documents grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((doc) => (
          <a
            key={doc.id}
            href={doc.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{doc.fileName}</p>
                <p className="text-xs text-gray-500 capitalize mt-0.5">{doc.type}</p>
                {doc.tenant && <p className="text-xs text-gray-400 mt-1">{doc.tenant.name}</p>}
                {doc.unit && <p className="text-xs text-gray-400">Unit {doc.unit.unitNumber}</p>}
                {doc.expiryDate && (
                  <p className={`text-xs mt-1 ${
                    new Date(doc.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                      ? "text-amber-600 font-medium"
                      : "text-gray-400"
                  }`}>
                    Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </a>
        ))}
        {filtered.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-400">No documents found</p>
          </div>
        )}
      </div>
    </div>
  );
}
