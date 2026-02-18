"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Shield,
  Menu,
  X,
  LogOut,
  FileText,
  ShoppingCart,
  Boxes,
  Settings,
  Receipt,
  BarChart3,
  CreditCard,
  Bell,
  Upload,
  ClipboardCheck,
  ChevronDown,
  Car,
} from "lucide-react";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/user", icon: LayoutDashboard },
    { name: "Job Cards", href: "/user/jobs", icon: FileText },
    { name: "Customers", href: "/user/customers", icon: Users },
    { name: "Vehicles", href: "/user/vehicles", icon: Car },
    { name: "Inventory", href: "/user/inventory", icon: Package },
    { name: "Parts", href: "/user/parts", icon: Boxes },
    { name: "Sell Products", href: "/user/sell", icon: ShoppingCart },
    { name: "Invoices", href: "/user/invoices", icon: Receipt },
    { name: "Transactions", href: "/user/transactions", icon: CreditCard },
    { name: "Policy Management", href: "/user/policy", icon: Shield },
    { name: "Reports", href: "/user/reports", icon: BarChart3 },
    { name: "Audit", href: "/user/audit", icon: ClipboardCheck },
    { name: "Reminders", href: "/user/reminders", icon: Bell },
    { name: "Upload Stock", href: "/user/upload", icon: Upload },
    { name: "Configure", href: "/user/configure", icon: Settings, hasSubmenu: true },
  ];

  const toggleSubmenu = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => {
    if (href === "/user") {
      return pathname === "/user";
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#1a1c1e] flex">
      {/* Sidebar */}
      <aside
        className={`bg-gradient-to-b from-[#25282c] to-[#1a1c1e] border-r border-white/5 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        } flex flex-col fixed h-screen z-50`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
          {sidebarOpen && (
            <Link href="/user" className="flex items-center gap-2.5 font-mono font-bold tracking-[-2px] text-xl">
              <div className="w-5 h-5 bg-[#3b82f6] shadow-[0_0_15px_#3b82f6] [clip-path:polygon(25%_0%,100%_0%,75%_100%,0%_100%)]"></div>
              GARAGEMAP
            </Link>
          )}
          {!sidebarOpen && (
            <div className="w-5 h-5 bg-[#3b82f6] shadow-[0_0_15px_#3b82f6] [clip-path:polygon(25%_0%,100%_0%,75%_100%,0%_100%)] mx-auto"></div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-[#94a3b8] hover:text-[#22d3ee] transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isExpanded = expandedItems.includes(item.name);
            const active = isActive(item.href);

            return (
              <div key={item.href}>
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    className={`flex-1 flex items-center gap-3 px-4 py-3 font-mono text-sm uppercase tracking-wider transition-all duration-300 relative group ${
                      active
                        ? "bg-[#3b82f6]/20 text-[#3b82f6] border-l-2 border-[#3b82f6]"
                        : "text-[#94a3b8] hover:text-[#22d3ee] hover:bg-white/5"
                    }`}
                  >
                    <item.icon size={18} />
                    {sidebarOpen && <span className="flex-1">{item.name}</span>}
                    {!sidebarOpen && (
                      <div className="absolute left-full ml-2 px-3 py-2 bg-[#25282c] border border-white/10 text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                        {item.name}
                      </div>
                    )}
                  </Link>
                  {item.hasSubmenu && sidebarOpen && (
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      className={`px-2 py-3 text-[#94a3b8] hover:text-[#22d3ee] transition-colors ${
                        active ? "text-[#3b82f6]" : ""
                      }`}
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>
                {item.hasSubmenu && isExpanded && sidebarOpen && (
                  <div className="ml-4 pl-4 border-l border-white/10 space-y-1">
                    {item.name === "Configure" && (
                      <>
                        <Link
                          href="/user/configure/settings"
                          className="block px-4 py-2 text-xs text-[#94a3b8] hover:text-[#22d3ee] hover:bg-white/5 transition-all font-mono uppercase"
                        >
                          Settings
                        </Link>
                        <Link
                          href="/user/configure/users"
                          className="block px-4 py-2 text-xs text-[#94a3b8] hover:text-[#22d3ee] hover:bg-white/5 transition-all font-mono uppercase"
                        >
                          Users
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-[#3b82f6]/20 border border-[#3b82f6]/50 flex items-center justify-center font-mono text-xs text-[#3b82f6]">
              U
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs text-[#94a3b8] uppercase truncate">
                  User Account
                </div>
                <div className="font-mono text-[0.65rem] text-[#475569] truncate">
                  user@garagemap.io
                </div>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 font-mono text-xs text-[#94a3b8] hover:text-[#ef4444] transition-colors uppercase tracking-wider py-2"
            >
              <LogOut size={14} />
              LOGOUT
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        {/* Top Bar */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-gradient-to-b from-[rgba(30,32,35,0.8)] to-transparent backdrop-blur-xl sticky top-0 z-40">
          <div className="font-mono text-xs text-[#94a3b8] uppercase tracking-wider">
            {/* // */} WORKSHOP_CONTROL_PANEL
          </div>
          <div className="flex items-center gap-4">
            <div className="font-mono text-[10px] text-[#22d3ee]">
              SYS_STATUS: ACTIVE<br />
              LATENCY: 12ms
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
