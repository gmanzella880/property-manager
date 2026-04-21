"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  UsersRound,
  Wrench,
  MessageSquare,
  FileText,
  DollarSign,
  HardHat,
  DoorOpen,
  Lightbulb,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Check,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/units", label: "Units", icon: Building2 },
  { href: "/admin/tenants", label: "Tenants", icon: Users },
  { href: "/admin/tickets", label: "Tickets", icon: Wrench },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/feedback", label: "Feedback", icon: Lightbulb },
  { href: "/admin/documents", label: "Documents", icon: FileText },
  { href: "/admin/expenses", label: "Expenses", icon: DollarSign },
  { href: "/admin/vendors", label: "Vendors", icon: HardHat },
  { href: "/admin/vacancy", label: "Vacancy", icon: DoorOpen },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const superAdminItems = [
  { href: "/admin/users", label: "Users", icon: UsersRound, superOnly: true },
];

export default function AdminShell({ children, role, properties, selectedPropertyId }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);

  // Don't show sidebar on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const allNavItems =
    role === "super_admin" ? [...navItems, ...superAdminItems] : navItems;

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);

  async function switchProperty(propertyId) {
    setOrgDropdownOpen(false);
    await fetch("/api/admin/switch-property", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId }),
    });
    router.refresh();
  }

  async function handleLogout() {
    window.location.href = "/api/admin/logout";
  }

  function isActive(href) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const sidebar = (
    <nav className="flex flex-col h-full">
      {/* PropertyBase branding */}
      <div className="p-5 border-b border-[#2a5280]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm leading-tight">PropertyBase</h2>
            <p className="text-xs text-blue-200">Management Platform</p>
          </div>
        </div>

        {/* Org / Property switcher */}
        {properties.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
              className="w-full flex items-center justify-between bg-white/10 hover:bg-white/15 rounded-lg px-3 py-2 text-left transition-colors cursor-pointer"
            >
              <div className="min-w-0">
                <p className="text-xs text-blue-200 leading-none mb-0.5">Viewing</p>
                <p className="text-sm font-medium text-white truncate">
                  {selectedProperty?.name || "Select property"}
                </p>
              </div>
              <ChevronDown
                className={clsx(
                  "w-4 h-4 text-blue-200 flex-shrink-0 transition-transform",
                  orgDropdownOpen && "rotate-180"
                )}
              />
            </button>

            {orgDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 max-h-60 overflow-y-auto">
                {properties.map((property) => (
                  <button
                    key={property.id}
                    onClick={() => switchProperty(property.id)}
                    className={clsx(
                      "w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors cursor-pointer",
                      property.id === selectedPropertyId
                        ? "text-blue-600 font-medium"
                        : "text-gray-700"
                    )}
                  >
                    <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{property.name}</p>
                      {role === "super_admin" && property.landlord && (
                        <p className="text-xs text-gray-400 truncate">
                          {property.landlord.name}
                        </p>
                      )}
                    </div>
                    {property.id === selectedPropertyId && (
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {properties.length === 0 && (
          <p className="text-xs text-blue-300/60 mt-1">No properties yet</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {allNavItems.map(({ href, label, icon: Icon, superOnly }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setSidebarOpen(false)}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              isActive(href)
                ? "bg-white/15 text-white font-medium"
                : "text-blue-100 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
            {superOnly && (
              <span className="ml-auto text-[10px] bg-purple-500/30 text-purple-200 px-1.5 py-0.5 rounded">
                SA
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className="p-3 border-t border-[#2a5280]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-100 hover:bg-white/10 hover:text-white transition-colors w-full cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-60 bg-[#1e3a5f] flex-shrink-0">
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-60 bg-[#1e3a5f] z-50">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="cursor-pointer">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="font-semibold text-gray-900 text-sm">
            PropertyBase{selectedProperty ? ` — ${selectedProperty.name}` : ""}
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
