"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, User, Plus, Check, X, Clock } from "lucide-react";

const applicantStatuses = ["pending", "showing scheduled", "approved", "rejected"];

const statusColors = {
  pending: "bg-gray-100 text-gray-600",
  "showing scheduled": "bg-blue-50 text-blue-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

export default function VacancyPipeline({ units, vacancies }) {
  const router = useRouter();
  const [showAddApplicant, setShowAddApplicant] = useState(null);

  const vacantUnits = units.filter((u) => !u.tenant);
  const occupiedUnits = units.filter((u) => u.tenant);

  function getVacancy(unitId) {
    return vacancies.find((v) => v.unitId === unitId);
  }

  async function createVacancy(unitId) {
    await fetch("/api/admin/vacancy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unitId }),
    });
    router.refresh();
  }

  async function addApplicant(e, vacancyId) {
    e.preventDefault();
    const form = new FormData(e.target);
    await fetch("/api/admin/vacancy/applicants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vacancyId,
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
      }),
    });
    setShowAddApplicant(null);
    router.refresh();
  }

  async function updateApplicantStatus(applicantId, status) {
    await fetch("/api/admin/vacancy/applicants", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicantId, status }),
    });
    router.refresh();
  }

  async function fillUnit(unitId, applicant) {
    // Create tenant from approved applicant
    const res = await fetch("/api/admin/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: applicant.name,
        email: applicant.email,
        phone: applicant.phone,
        unitId,
        leaseStart: new Date().toISOString(),
        leaseEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    });
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Vacant Units */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full" /> Vacant ({vacantUnits.length})
          </h2>
          <div className="space-y-4">
            {vacantUnits.map((unit) => {
              const vacancy = getVacancy(unit.id);
              return (
                <div key={unit.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-600" />
                      <h3 className="font-medium text-gray-900">Unit {unit.unitNumber}</h3>
                    </div>
                    {!vacancy && (
                      <button
                        onClick={() => createVacancy(unit.id)}
                        className="text-xs text-[#1e3a5f] hover:underline cursor-pointer"
                      >
                        Start tracking
                      </button>
                    )}
                  </div>

                  {vacancy && (
                    <div>
                      <p className="text-xs text-gray-500 mb-3">
                        Listed: {vacancy.listedAt ? new Date(vacancy.listedAt).toLocaleDateString() : "Not listed"}
                      </p>

                      {/* Applicants */}
                      <div className="space-y-2">
                        {vacancy.applicants.map((app) => (
                          <div key={app.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{app.name}</p>
                                <p className="text-xs text-gray-500">{app.email} · {app.phone}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[app.status] || statusColors.pending}`}>
                                {app.status}
                              </span>
                            </div>
                            <div className="flex gap-1 mt-2">
                              {applicantStatuses.map((s) => (
                                <button
                                  key={s}
                                  onClick={() => updateApplicantStatus(app.id, s)}
                                  className={`px-2 py-0.5 rounded text-xs cursor-pointer ${
                                    app.status === s ? "bg-[#1e3a5f] text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                  }`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                            {app.status === "approved" && (
                              <button
                                onClick={() => fillUnit(unit.id, app)}
                                className="mt-2 w-full px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 cursor-pointer"
                              >
                                Mark as Filled (Create Tenant)
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Add applicant */}
                      {showAddApplicant === vacancy.id ? (
                        <form onSubmit={(e) => addApplicant(e, vacancy.id)} className="mt-3 space-y-2">
                          <input name="name" required placeholder="Name" className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
                          <input name="email" type="email" required placeholder="Email" className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
                          <input name="phone" type="tel" required placeholder="Phone" className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
                          <div className="flex gap-2">
                            <button type="button" onClick={() => setShowAddApplicant(null)} className="px-3 py-1 border border-gray-300 rounded-lg text-xs hover:bg-gray-50 cursor-pointer">Cancel</button>
                            <button type="submit" className="px-3 py-1 bg-[#1e3a5f] text-white rounded-lg text-xs hover:bg-[#2a5280] cursor-pointer">Add</button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => setShowAddApplicant(vacancy.id)}
                          className="mt-3 w-full flex items-center justify-center gap-1 px-3 py-1.5 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:bg-gray-50 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Applicant
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {vacantUnits.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <p className="text-gray-400">No vacant units</p>
              </div>
            )}
          </div>
        </div>

        {/* Occupied Units */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" /> Occupied ({occupiedUnits.length})
          </h2>
          <div className="space-y-2">
            {occupiedUnits.map((unit) => (
              <div key={unit.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Unit {unit.unitNumber}</p>
                    <p className="text-xs text-gray-500">{unit.tenant?.name}</p>
                  </div>
                </div>
                <Check className="w-4 h-4 text-green-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
