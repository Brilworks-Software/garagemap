"use client";

import { useEffect } from "react";
import Link from "next/link";
import { colors, colorClasses } from "@/lib/colors";

export default function Home() {
  useEffect(() => {
    // Subtle Mouse Interaction for Alloy Sheen
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

  return (
    <>
      <nav className={`h-20 flex items-center justify-between px-16 ${colorClasses.borderDefault} bg-gradient-to-b from-[rgba(30,32,35,0.8)] to-transparent backdrop-blur-xl sticky top-0 z-[1000] max-lg:px-8 border-b`}>
        <Link href="/" className="font-mono font-bold tracking-[-2px] text-2xl flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className={`w-6 h-6 ${colorClasses.iconBgBlue} shadow-[0_0_15px_${colors.primary.blue}] [clip-path:polygon(25%_0%,100%_0%,75%_100%,0%_100%)]`} style={{ boxShadow: `0 0 15px ${colors.primary.blue}` }}></div>
          GARAGEMAP_OS
        </Link>
        <div className="flex items-center gap-8">
          <div className="flex gap-8 font-mono text-xs uppercase tracking-wider max-lg:hidden">
            <a href="#features" className={`${colorClasses.textSecondary} ${colorClasses.textCyan.replace('text-', 'hover:text-')} transition-colors duration-300`}>
              Features
            </a>
            <a href="#about" className={`${colorClasses.textSecondary} ${colorClasses.textCyan.replace('text-', 'hover:text-')} transition-colors duration-300`}>
              About
            </a>
            <a href="#contact" className={`${colorClasses.textSecondary} ${colorClasses.textCyan.replace('text-', 'hover:text-')} transition-colors duration-300`}>
              Contact
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className={`font-mono text-xs uppercase tracking-wider ${colorClasses.textSecondary} ${colorClasses.textCyan.replace('text-', 'hover:text-')} transition-colors duration-300 px-4 py-2`}
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className={`inline-flex items-center gap-2 ${colorClasses.buttonPrimary} py-2 px-6 font-mono font-bold text-xs uppercase no-underline transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5`}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="p-16 max-w-[1400px] mx-auto max-lg:p-8">
        <section className="grid grid-cols-[1.2fr_0.8fr] gap-8 items-center min-h-[70vh] max-lg:grid-cols-1">
          <div className="relative">
            <span className={`font-mono ${colorClasses.textCyan} text-sm mb-4 block opacity-80`}>
              {/* // */} GARAGE_MANAGEMENT_SYSTEM
            </span>
            <h1 className="text-[clamp(4rem,8vw,7rem)] font-black leading-[0.9] tracking-[-0.04em] uppercase mb-8 bg-gradient-to-b from-white to-[#475569] bg-clip-text text-transparent drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] animate-reveal">
              STREAMLINE<br />WORKSHOP<br />OPERATIONS.
            </h1>
            <p className={`${colorClasses.textSecondary} max-w-[500px] mb-12 leading-[1.8]`}>
              A modern web-based garage management system designed to streamline daily workshop operations. Manage customers, vehicles, job cards, invoices, inventory, and insurance policy claims — all in one place.
            </p>
            <Link
              href="/auth/register"
              className={`inline-flex items-center gap-4 ${colorClasses.buttonPrimary} py-5 px-10 font-mono font-bold uppercase no-underline transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] relative hover:-translate-y-0.5`}
            >
              Get Started
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className={`alloy-card ${colorClasses.cardGradient} ${colorClasses.borderDefault} p-10 relative overflow-hidden shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10] animate-reveal stagger-1 border`}>
            <div className="absolute top-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
            <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
            <div className="absolute bottom-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
            <div className="absolute bottom-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>

            <h3 className={`font-mono text-xs mb-8 ${colorClasses.textBlue}`}>
              LIVE_WORKSHOP_DASHBOARD
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div className={`border-l-2 pl-4 bg-white/5`} style={{ borderColor: colors.primary.blue }}>
                <div className={`font-mono text-[0.65rem] ${colorClasses.textSecondary} mb-2 uppercase`}>
                  Active_Jobs
                </div>
                <div className="text-2xl font-bold tabular-nums">24</div>
              </div>
              <div className={`border-l-2 pl-4 bg-white/5`} style={{ borderColor: colors.primary.cyan }}>
                <div className={`font-mono text-[0.65rem] ${colorClasses.textSecondary} mb-2 uppercase`}>
                  Total_Customers
                </div>
                <div className="text-2xl font-bold tabular-nums">156</div>
              </div>
              <div className={`border-l-2 pl-4 bg-white/5`} style={{ borderColor: colors.primary.red }}>
                <div className={`font-mono text-[0.65rem] ${colorClasses.textSecondary} mb-2 uppercase`}>
                  Pending_Invoices
                </div>
                <div className="text-2xl font-bold tabular-nums">12</div>
              </div>
              <div className={`border-l-2 pl-4 bg-white/5`} style={{ borderColor: colors.primary.blue }}>
                <div className={`font-mono text-[0.65rem] ${colorClasses.textSecondary} mb-2 uppercase`}>
                  Parts_In_Stock
                </div>
                <div className="text-2xl font-bold tabular-nums">1,284</div>
              </div>
            </div>

            <div className={`mt-8 border-t ${colorClasses.borderDefault} pt-6`}>
              <div className={`flex justify-between font-mono text-[0.7rem] ${colorClasses.textSecondary} mb-2.5`}>
                <span>System: Online</span>
                <span>Backend: Firebase</span>
              </div>
              <div className="h-1 bg-black mt-2.5 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-[85%]" style={{ backgroundColor: colors.primary.blue, boxShadow: `0 0 10px ${colors.primary.blue}` }}></div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mt-24">
          <h2 className={`font-mono text-xs ${colorClasses.textCyan} mb-8 uppercase tracking-wider text-center opacity-80`}>
            {/* // */} CORE_FEATURES
          </h2>
          <div className={`grid grid-cols-3 gap-px bg-white/10 ${colorClasses.borderInput} animate-reveal stagger-2 max-lg:grid-cols-2 max-md:grid-cols-1 border`}>
            <div style={{ backgroundColor: colors.background.base }} className={`p-12 px-8 transition-colors duration-400 relative`} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.background.surface; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.background.base; }}>
              <div className={`${colorClasses.textBlue} mb-6 text-xs font-mono`}>[ 01 ]</div>
              <h4 className="font-bold text-xl mb-4 tracking-[-0.02em]">Customer Management</h4>
              <p className={`${colorClasses.textSecondary} text-sm leading-relaxed`}>
                Add, edit, and delete customers. Store contact information and service history. Link multiple vehicles to a single customer.
              </p>
            </div>
            <div style={{ backgroundColor: colors.background.base }} className={`p-12 px-8 transition-colors duration-400 relative`} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.background.surface; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.background.base; }}>
              <div className={`${colorClasses.textBlue} mb-6 text-xs font-mono`}>[ 02 ]</div>
              <h4 className="font-bold text-xl mb-4 tracking-[-0.02em]">Vehicle Management</h4>
              <p className={`${colorClasses.textSecondary} text-sm leading-relaxed`}>
                Register customer vehicles. Track vehicle details (model, number, year, etc.). Associate vehicles with service jobs.
              </p>
            </div>
            <div style={{ backgroundColor: colors.background.base }} className={`p-12 px-8 transition-colors duration-400 relative`} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.background.surface; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.background.base; }}>
              <div className={`${colorClasses.textBlue} mb-6 text-xs font-mono`}>[ 03 ]</div>
              <h4 className="font-bold text-xl mb-4 tracking-[-0.02em]">Job Management</h4>
              <p className={`${colorClasses.textSecondary} text-sm leading-relaxed`}>
                Create job cards. Assign service tasks. Track job status (Pending, In Progress, Completed). Record service notes and labor charges.
              </p>
            </div>
            <div style={{ backgroundColor: colors.background.base }} className={`p-12 px-8 transition-colors duration-400 relative`} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.background.surface; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.background.base; }}>
              <div className={`${colorClasses.textBlue} mb-6 text-xs font-mono`}>[ 04 ]</div>
              <h4 className="font-bold text-xl mb-4 tracking-[-0.02em]">Invoice Management</h4>
              <p className={`${colorClasses.textSecondary} text-sm leading-relaxed`}>
                Generate invoices from completed jobs. Calculate labor + parts cost. Track payment status (Paid / Unpaid). Download or print invoices.
              </p>
            </div>
            <div style={{ backgroundColor: colors.background.base }} className={`p-12 px-8 transition-colors duration-400 relative`} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.background.surface; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.background.base; }}>
              <div className={`${colorClasses.textBlue} mb-6 text-xs font-mono`}>[ 05 ]</div>
              <h4 className="font-bold text-xl mb-4 tracking-[-0.02em]">Inventory Management</h4>
              <p className={`${colorClasses.textSecondary} text-sm leading-relaxed`}>
                Add and manage spare parts. Track stock quantity. Update inventory after job completion. Low stock alerts.
              </p>
            </div>
            <div style={{ backgroundColor: colors.background.base }} className={`p-12 px-8 transition-colors duration-400 relative`} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.background.surface; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.background.base; }}>
              <div className={`${colorClasses.textBlue} mb-6 text-xs font-mono`}>[ 06 ]</div>
              <h4 className="font-bold text-xl mb-4 tracking-[-0.02em]">Policy Claim Management</h4>
              <p className={`${colorClasses.textSecondary} text-sm leading-relaxed`}>
                Manage insurance claim records. Link claims to customer vehicles. Track claim approval status. Store claim-related documents.
              </p>
            </div>
          </div>
        </section>

        <footer id="contact" className={`mt-32 pb-16 border-t ${colorClasses.borderDefault} flex justify-between items-center max-lg:flex-col max-lg:gap-4 max-lg:items-start`}>
          <div className={`font-mono text-[0.7rem] ${colorClasses.textSecondary}`}>
            &copy; 2024 GARAGEMAP. MODERN GARAGE MANAGEMENT SYSTEM.
          </div>
          <div className="flex gap-5">
            <div className="w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)] relative"></div>
            <div className="w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)] relative"></div>
            <div className="w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)] relative"></div>
          </div>
        </footer>
      </main>
    </>
  );
}
