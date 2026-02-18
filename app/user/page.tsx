"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardPage() {
  useEffect(() => {
    // Subtle Mouse Interaction for Alloy Sheen
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll(".alloy-card");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.05) 0%, transparent 50%), linear-gradient(145deg, #2a2e33, #16181b)`;
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const stats = [
    { label: "Active Jobs", value: "24", change: "+3", color: "text-[#3b82f6]", borderColor: "#3b82f6" },
    { label: "Total Customers", value: "156", change: "+12", color: "text-[#22d3ee]", borderColor: "#22d3ee" },
    { label: "Pending Invoices", value: "12", change: "-2", color: "text-[#ef4444]", borderColor: "#ef4444" },
    { label: "Parts In Stock", value: "1,284", change: "+45", color: "text-[#3b82f6]", borderColor: "#3b82f6" },
  ];

  const recentJobs = [
    { id: "JOB-001", customer: "John Doe", vehicle: "Toyota Camry 2020", status: "In Progress", amount: "$450" },
    { id: "JOB-002", customer: "Jane Smith", vehicle: "Honda Civic 2019", status: "Pending", amount: "$320" },
    { id: "JOB-003", customer: "Mike Johnson", vehicle: "Ford F-150 2021", status: "Completed", amount: "$680" },
    { id: "JOB-004", customer: "Sarah Williams", vehicle: "BMW 3 Series 2022", status: "In Progress", amount: "$890" },
  ];

  const recentCustomers = [
    { name: "John Doe", email: "john@example.com", vehicles: 2, lastVisit: "2 days ago" },
    { name: "Jane Smith", email: "jane@example.com", vehicles: 1, lastVisit: "5 days ago" },
    { name: "Mike Johnson", email: "mike@example.com", vehicles: 3, lastVisit: "1 week ago" },
  ];

  const lowStockItems = [
    { name: "Brake Pads", stock: 5, threshold: 10 },
    { name: "Oil Filter", stock: 8, threshold: 15 },
    { name: "Air Filter", stock: 3, threshold: 10 },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight text-white mb-2 font-mono uppercase">
          DASHBOARD
        </h1>
        <p className="font-mono text-sm text-[#94a3b8] uppercase tracking-wider">
          {/* // */} WORKSHOP_OVERVIEW_AND_METRICS
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="alloy-card bg-gradient-to-br from-[#2a2e33] to-[#16181b] border border-white/5 p-6 relative overflow-hidden shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]"
          >
            <div className="border-l-2 pl-4" style={{ borderColor: stat.borderColor }}>
              <div className="font-mono text-[0.65rem] text-[#94a3b8] mb-2 uppercase tracking-wider">
                {stat.label}
              </div>
              <div className={`text-3xl font-bold mb-1 ${stat.color}`}>
                {stat.value}
              </div>
              <div className="font-mono text-xs text-[#22d3ee]">
                {stat.change} from last month
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Jobs */}
        <div className="lg:col-span-2 alloy-card bg-gradient-to-br from-[#2a2e33] to-[#16181b] border border-white/5 p-6 relative overflow-hidden shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
          <div className="absolute top-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
          <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
          <div className="absolute bottom-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
          <div className="absolute bottom-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="font-mono text-xs text-[#3b82f6] uppercase tracking-wider">
              RECENT_JOBS
            </h2>
            <Link
              href="/user/jobs"
              className="font-mono text-[0.65rem] text-[#22d3ee] hover:text-[#3b82f6] transition-colors uppercase"
            >
              VIEW_ALL →
            </Link>
          </div>

          <div className="space-y-4">
            {recentJobs.map((job) => (
              <div
                key={job.id}
                className="bg-[#1a1c1e] border border-white/5 p-4 hover:border-[#3b82f6]/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-mono text-sm font-bold text-white mb-1">{job.id}</div>
                    <div className="font-mono text-xs text-[#94a3b8]">{job.customer}</div>
                    <div className="font-mono text-xs text-[#475569]">{job.vehicle}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-bold text-white mb-1">{job.amount}</div>
                    <span
                      className={`font-mono text-[0.65rem] uppercase px-2 py-1 ${
                        job.status === "Completed"
                          ? "bg-[#22d3ee]/20 text-[#22d3ee]"
                          : job.status === "In Progress"
                          ? "bg-[#3b82f6]/20 text-[#3b82f6]"
                          : "bg-[#ef4444]/20 text-[#ef4444]"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Recent Customers */}
          <div className="alloy-card bg-gradient-to-br from-[#2a2e33] to-[#16181b] border border-white/5 p-6 relative overflow-hidden shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
            <div className="absolute top-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
            <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
            <div className="absolute bottom-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
            <div className="absolute bottom-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="font-mono text-xs text-[#3b82f6] uppercase tracking-wider">
                RECENT_CUSTOMERS
              </h2>
              <Link
                href="/user/customers"
                className="font-mono text-[0.65rem] text-[#22d3ee] hover:text-[#3b82f6] transition-colors uppercase"
              >
                VIEW_ALL →
              </Link>
            </div>

            <div className="space-y-3">
              {recentCustomers.map((customer, index) => (
                <div
                  key={index}
                  className="bg-[#1a1c1e] border border-white/5 p-3 hover:border-[#3b82f6]/50 transition-all duration-300"
                >
                  <div className="font-mono text-sm font-bold text-white mb-1">{customer.name}</div>
                  <div className="font-mono text-xs text-[#94a3b8] mb-1">{customer.email}</div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[0.65rem] text-[#475569]">
                      {customer.vehicles} vehicles
                    </span>
                    <span className="font-mono text-[0.65rem] text-[#475569]">
                      {customer.lastVisit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="alloy-card bg-gradient-to-br from-[#2a2e33] to-[#16181b] border border-[#ef4444]/30 p-6 relative overflow-hidden shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
            <div className="absolute top-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
            <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
            <div className="absolute bottom-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
            <div className="absolute bottom-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="font-mono text-xs text-[#ef4444] uppercase tracking-wider">
                LOW_STOCK_ALERT
              </h2>
              <Link
                href="/user/inventory"
                className="font-mono text-[0.65rem] text-[#22d3ee] hover:text-[#3b82f6] transition-colors uppercase"
              >
                VIEW_ALL →
              </Link>
            </div>

            <div className="space-y-3">
              {lowStockItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#1a1c1e] border border-[#ef4444]/30 p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-mono text-sm font-bold text-white">{item.name}</div>
                    <div className="font-mono text-xs text-[#ef4444]">
                      {item.stock} / {item.threshold}
                    </div>
                  </div>
                  <div className="h-1 bg-black relative overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-[#ef4444]"
                      style={{ width: `${(item.stock / item.threshold) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="alloy-card bg-gradient-to-br from-[#2a2e33] to-[#16181b] border border-white/5 p-6 relative overflow-hidden shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
        <h2 className="font-mono text-xs text-[#3b82f6] uppercase tracking-wider mb-6">
          QUICK_ACTIONS
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/user/jobs/new"
            className="bg-[#1a1c1e] border border-white/10 p-4 hover:border-[#3b82f6] hover:bg-[#3b82f6]/10 transition-all duration-300 text-center"
          >
            <div className="text-2xl mb-2">🛠</div>
            <div className="font-mono text-xs text-white uppercase">New Job</div>
          </Link>
          <Link
            href="/user/customers/new"
            className="bg-[#1a1c1e] border border-white/10 p-4 hover:border-[#22d3ee] hover:bg-[#22d3ee]/10 transition-all duration-300 text-center"
          >
            <div className="text-2xl mb-2">👤</div>
            <div className="font-mono text-xs text-white uppercase">Add Customer</div>
          </Link>
          <Link
            href="/user/inventory/new"
            className="bg-[#1a1c1e] border border-white/10 p-4 hover:border-[#3b82f6] hover:bg-[#3b82f6]/10 transition-all duration-300 text-center"
          >
            <div className="text-2xl mb-2">📦</div>
            <div className="font-mono text-xs text-white uppercase">Add Part</div>
          </Link>
          <Link
            href="/user/policy/new"
            className="bg-[#1a1c1e] border border-white/10 p-4 hover:border-[#ef4444] hover:bg-[#ef4444]/10 transition-all duration-300 text-center"
          >
            <div className="text-2xl mb-2">🛡</div>
            <div className="font-mono text-xs text-white uppercase">New Claim</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
