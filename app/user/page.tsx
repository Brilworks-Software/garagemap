"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { colors, colorClasses } from "@/lib/colors";
import { useGetJobsByServiceId } from "@/firebase/hooks/useJob";
import { useGetCustomersByServiceId } from "@/firebase/hooks/useCustomer";
import { useGetInventoryByServiceId } from "@/firebase/hooks/useInventory";
import { useGetInvoicesByServiceId } from "@/firebase/hooks/useInvoice";
import { AuthService } from "@/firebase/services/AuthService";
import { useGetUser } from "@/firebase/hooks/useUser";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { data: userData } = useGetUser(currentUserId || "", { enabled: !!currentUserId });
  
  const serviceId = userData?.serviceId || "";
  
  const { data: jobs = [], isLoading: jobsLoading } = useGetJobsByServiceId(serviceId, { enabled: !!serviceId });
  const { data: customers = [], isLoading: customersLoading } = useGetCustomersByServiceId(serviceId, { enabled: !!serviceId });
  const { data: inventory = [], isLoading: inventoryLoading } = useGetInventoryByServiceId(serviceId, { enabled: !!serviceId });
  const { data: invoices = [], isLoading: invoicesLoading } = useGetInvoicesByServiceId(serviceId, { enabled: !!serviceId });

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      setCurrentUserId(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  const activeJobs = jobs.filter(j => j.jobStatus === "in-progress" || j.jobStatus === "pending");
  const completedJobs = jobs.filter(j => j.jobStatus === "completed");
  const lowStockItems = inventory.filter(i => i.quantity <= (i.minStockLevel || 0));
  const recentJobs = jobs.slice(0, 4);
  const recentCustomers = customers.slice(0, 3);
  const recentInvoices = invoices.slice(0, 4);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll(".alloy-card");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.05) 0%, transparent 50%), linear-gradient(145deg, ${colors.background.card.from}, ${colors.background.card.to})`;
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (jobsLoading || customersLoading || inventoryLoading || invoicesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="font-mono text-[#22d3ee]">LOADING_DATA...</div>
      </div>
    );
  }

  const stats = [
    { label: "Active Jobs", value: activeJobs.length.toString(), change: `+${activeJobs.length}`, color: colorClasses.textBlue, borderColor: colors.primary.blue },
    { label: "Total Customers", value: customers.length.toString(), change: `+${customers.length}`, color: colorClasses.textCyan, borderColor: colors.primary.cyan },
    { label: "Completed Jobs", value: completedJobs.length.toString(), change: `+${completedJobs.length}`, color: colorClasses.textBlue, borderColor: colors.primary.blue },
    { label: "Parts In Stock", value: inventory.length.toString(), change: `${inventory.length}`, color: colorClasses.textBlue, borderColor: colors.primary.blue },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-white mb-2 font-mono uppercase">
          DASHBOARD
        </h1>
        <p className="font-mono text-sm text-[#94a3b8] uppercase tracking-wider">
          {/* // */} WORKSHOP_OVERVIEW_AND_METRICS
        </p>
      </div>

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
                {stat.change} total
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="alloy-card bg-gradient-to-br from-[#2a2e33] to-[#16181b] border border-white/5 p-6 relative overflow-hidden shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
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
            {recentJobs.length === 0 ? (
              <div className="text-center py-8 text-[#94a3b8] font-mono text-sm">NO_JOBS_FOUND</div>
            ) : (
              recentJobs.map((job) => (
                <div
                  key={job.jobId}
                  className="bg-[#1a1c1e] border border-white/5 p-4 hover:border-[#3b82f6]/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-mono text-sm font-bold text-white mb-1">{job.jobId}</div>
                      <div className="font-mono text-xs text-[#94a3b8]">{job.jobTitle || "No Title"}</div>
                      <div className="font-mono text-xs text-[#475569]">{job.jobDescription || "No Description"}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-white mb-1">${job.jobAmount || 0}</div>
                      <span
                        className={`font-mono text-[0.65rem] uppercase px-2 py-1 ${
                          job.jobStatus === "completed"
                            ? "bg-[#22d3ee]/20 text-[#22d3ee]"
                            : job.jobStatus === "in-progress"
                            ? "bg-[#3b82f6]/20 text-[#3b82f6]"
                            : "bg-[#ef4444]/20 text-[#ef4444]"
                        }`}
                      >
                        {job.jobStatus}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="alloy-card bg-gradient-to-br from-[#2a2e33] to-[#16181b] border border-white/5 p-6 relative overflow-hidden shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
          <div className="absolute top-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
          <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
          <div className="absolute bottom-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
          <div className="absolute bottom-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="font-mono text-xs text-[#3b82f6] uppercase tracking-wider">
              RECENT_INVOICES
            </h2>
            <Link
              href="/user/invoices"
              className="font-mono text-[0.65rem] text-[#22d3ee] hover:text-[#3b82f6] transition-colors uppercase"
            >
              VIEW_ALL →
            </Link>
          </div>

          <div className="space-y-4">
            {recentInvoices.length === 0 ? (
              <div className="text-center py-8 text-[#94a3b8] font-mono text-sm">NO_INVOICES_FOUND</div>
            ) : (
              recentInvoices.map((invoice) => (
                <div
                  key={invoice.invoiceId}
                  className="bg-[#1a1c1e] border border-white/5 p-4 hover:border-[#3b82f6]/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-mono text-sm font-bold text-white mb-1">{invoice.invoiceNumber}</div>
                      <div className="font-mono text-xs text-[#94a3b8]">Job: {invoice.jobId}</div>
                      <div className="font-mono text-xs text-[#475569]">{formatDate(invoice.issueDate)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-white mb-1">${invoice.total}</div>
                      <span
                        className={`font-mono text-[0.65rem] uppercase px-2 py-1 ${
                          invoice.status === "paid"
                            ? "bg-[#22d3ee]/20 text-[#22d3ee]"
                            : invoice.status === "sent"
                            ? "bg-[#3b82f6]/20 text-[#3b82f6]"
                            : "bg-[#ef4444]/20 text-[#ef4444]"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            {recentCustomers.length === 0 ? (
              <div className="text-center py-4 text-[#94a3b8] font-mono text-sm">NO_CUSTOMERS_FOUND</div>
            ) : (
              recentCustomers.map((customer) => (
                <div
                  key={customer.customerId}
                  className="bg-[#1a1c1e] border border-white/5 p-3 hover:border-[#3b82f6]/50 transition-all duration-300"
                >
                  <div className="font-mono text-sm font-bold text-white mb-1">{customer.customerName || "Unknown"}</div>
                  <div className="font-mono text-xs text-[#94a3b8] mb-1">{customer.customerEmail || "No Email"}</div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[0.65rem] text-[#475569]">
                      {customer.customerPhone || "No Phone"}
                    </span>
                    <span className="font-mono text-[0.65rem] text-[#475569]">
                      {customer.customerStatus || "active"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

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
            {lowStockItems.length === 0 ? (
              <div className="text-center py-4 text-[#94a3b8] font-mono text-sm">ALL_STOCK_LEVELS_OK</div>
            ) : (
              lowStockItems.map((item) => (
                <div
                  key={item.itemId}
                  className="bg-[#1a1c1e] border border-[#ef4444]/30 p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-mono text-sm font-bold text-white">{item.itemName || "Unknown Item"}</div>
                    <div className="font-mono text-xs text-[#ef4444]">
                      {item.quantity} / {item.minStockLevel || 0}
                    </div>
                  </div>
                  <div className="h-1 bg-black relative overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-[#ef4444]"
                      style={{ width: `${(item.quantity / (item.minStockLevel || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
