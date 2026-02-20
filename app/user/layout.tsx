"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Menu,
  X,
  LogOut,
  FileText,
  Settings,
  Receipt,
  Car,
} from "lucide-react";
import { colors, colorClasses } from "@/lib/colors";
import { AuthService } from "@/firebase/services/AuthService";
import { useGetUser } from "@/firebase/hooks/useUser";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const { data: userData } = useGetUser(currentUserId || "", { enabled: !!currentUserId });

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      setCurrentUserId(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/user", icon: LayoutDashboard },
    { name: "Job Cards", href: "/user/jobs", icon: FileText },
    { name: "Customers", href: "/user/customers", icon: Users },
    { name: "Vehicles", href: "/user/vehicles", icon: Car },
    { name: "Inventory", href: "/user/inventory", icon: Package },
    { name: "Invoices", href: "/user/invoices", icon: Receipt },
    { name: "Configure", href: "/user/configure", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/user") {
      return pathname === "/user";
    }
    return pathname?.startsWith(href);
  };

  return (
    <div style={{ backgroundColor: colors.background.base }} className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`${colorClasses.sidebarGradient} border-r ${colorClasses.borderDefault} transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        } flex flex-col fixed h-screen z-50`}
      >
        {/* Logo */}
        <div className={`h-20 flex items-center justify-between px-6 border-b ${colorClasses.borderDefault}`}>
          {sidebarOpen && (
            <Link href="/user" className="flex items-center gap-2.5 font-mono font-bold tracking-[-2px] text-xl">
              <div className={`w-5 h-5 ${colorClasses.iconBgBlue} shadow-[0_0_15px_${colors.primary.blue}] [clip-path:polygon(25%_0%,100%_0%,75%_100%,0%_100%)]`} style={{ boxShadow: `0 0 15px ${colors.primary.blue}` }}></div>
              GARAGEMAP
            </Link>
          )}
          {!sidebarOpen && (
            <div className={`w-5 h-5 ${colorClasses.iconBgBlue} shadow-[0_0_15px_${colors.primary.blue}] [clip-path:polygon(25%_0%,100%_0%,75%_100%,0%_100%)] mx-auto`} style={{ boxShadow: `0 0 15px ${colors.primary.blue}` }}></div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`${colorClasses.textSecondary} ${colorClasses.textCyan.replace('text-', 'hover:text-')} transition-colors`}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto flex-col">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <div key={item.href}>
                <div className="flex">
                  <Link
                    href={item.href}
                    className={`flex-1 flex gap-3 px-4 py-3 font-mono text-sm uppercase tracking-wider transition-all duration-300 relative group ${
                      active
                        ? `${colorClasses.badgeInfo.replace('bg-', 'bg-').replace('/20', '/20')} ${colorClasses.textBlue} border-l-2`
                        : `${colorClasses.textSecondary} ${colorClasses.textCyan.replace('text-', 'hover:text-')} hover:bg-white/5`
                    }`}
                    style={active ? { borderColor: colors.primary.blue } : {}}
                  >
                    <item.icon size={18} />
                    {sidebarOpen && <span className="">{item.name}</span>}
                    {!sidebarOpen && (
                      <div style={{ backgroundColor: colors.background.surface }} className={`${colorClasses.borderInput} text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 absolute left-full ml-2 px-3 py-2 border`}>
                        {item.name}
                      </div>
                    )}
                  </Link>
                </div>
              </div>
            );
          })}
        </nav>

        {/* User Section */}
        <div className={`p-4 border-t ${colorClasses.borderDefault}`}>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className={`w-10 h-10 rounded-full ${colorClasses.iconBgBlue} border flex items-center justify-center font-mono text-xs`} style={{ borderColor: `${colors.primary.blue}80` }}>
              {userData?.displayName?.[0]?.toUpperCase() || userData?.email?.[0]?.toUpperCase() || "U"}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className={`font-mono text-xs ${colorClasses.textSecondary} uppercase truncate`}>
                  {userData?.displayName || "User Account"}
                </div>
                <div className="font-mono text-[0.65rem] text-[#475569] truncate">
                  {userData?.email || "No email"}
                </div>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className={`flex items-center justify-center gap-2 font-mono text-xs ${colorClasses.textSecondary} ${colorClasses.textRed.replace('text-', 'hover:text-')} transition-colors uppercase tracking-wider py-2 w-full`}
            >
              <LogOut size={14} />
              LOGOUT
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        {/* Top Bar */}
        <header className={`h-20 flex items-center justify-between px-8 border-b ${colorClasses.borderDefault} bg-gradient-to-b from-[rgba(30,32,35,0.8)] to-transparent backdrop-blur-xl sticky top-0 z-40`}>
          <div className={`font-mono text-xs ${colorClasses.textSecondary} uppercase tracking-wider`}>
            {/* // */} WORKSHOP_CONTROL_PANEL
          </div>
          <div className="flex items-center gap-4">
            {/* <div className={`font-mono text-[10px] ${colorClasses.textCyan}`}>
              SYS_STATUS: ACTIVE<br />
              LATENCY: 12ms
            </div> */}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
