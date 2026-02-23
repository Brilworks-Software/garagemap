"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { colors, colorClasses } from "@/lib/colors";

export default function AboutPage() {
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
          <Image 
            src="/logo.png" 
            alt="GarageMap Logo" 
            width={48} 
            height={48} 
            className="object-contain"
          />
          GARAGEMAP_OS
        </Link>
        <div className="flex items-center gap-8">
          <div className="flex gap-8 font-mono text-xs uppercase tracking-wider max-lg:hidden">
            <Link href="/#features" className={`${colorClasses.textSecondary} ${colorClasses.textCyan.replace('text-', 'hover:text-')} transition-colors duration-300`}>
              Features
            </Link>
            <Link href="/about" className={`${colorClasses.textBlue} transition-colors duration-300`}>
              About
            </Link>
            <Link href="/contact" className={`${colorClasses.textSecondary} ${colorClasses.textCyan.replace('text-', 'hover:text-')} transition-colors duration-300`}>
              Contact
            </Link>
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
        <div className="mb-12">
          <h1 className="text-[clamp(3rem,6vw,5rem)] font-black leading-[0.9] tracking-[-0.04em] uppercase mb-4 bg-gradient-to-b from-white to-[#475569] bg-clip-text text-transparent drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
            ABOUT GARAGEMAP
          </h1>
          <p className={`font-mono text-sm ${colorClasses.textCyan} uppercase tracking-wider opacity-80`}>
            {/* // */} GARAGE_AND_SERVICE_MANAGEMENT_SOLUTION
          </p>
        </div>

        <section className="space-y-12">
          {/* Mission Section */}
          <div className={`alloy-card ${colorClasses.cardGradient} ${colorClasses.borderDefault} p-10 relative overflow-hidden shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10] border`}>
            <div className="absolute top-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
            <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
            <div className="absolute bottom-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
            <div className="absolute bottom-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
            
            <h2 className={`font-mono text-xs ${colorClasses.textBlue} mb-6 uppercase tracking-wider`}>
              OUR_MISSION
            </h2>
            <div className="space-y-4">
              <p className={`${colorClasses.textSecondary} text-base leading-relaxed`}>
                GarageMap is a comprehensive, modern garage and service management system designed to revolutionize how automotive workshops and service centers operate. We work specifically for garage owners and service center managers who need an efficient, unified platform to manage all aspects of their business.
              </p>
              <p className={`${colorClasses.textSecondary} text-base leading-relaxed`}>
                Our mission is to streamline daily operations, reduce manual paperwork, and help garage owners focus on what they do best—serving their customers. With real-time data synchronization, intuitive interfaces, and powerful analytics, GarageMap empowers workshops to operate more efficiently and profitably.
              </p>
            </div>
          </div>

          {/* What We Do Section */}
          <div className={`alloy-card ${colorClasses.cardGradient} ${colorClasses.borderDefault} p-10 relative overflow-hidden shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10] border`}>
            <div className="absolute top-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
            <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
            <div className="absolute bottom-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
            <div className="absolute bottom-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
            
            <h2 className={`font-mono text-xs ${colorClasses.textBlue} mb-6 uppercase tracking-wider`}>
              WHAT_WE_DO
            </h2>
            <div className="space-y-4">
              <p className={`${colorClasses.textSecondary} text-base leading-relaxed`}>
                GarageMap provides a complete solution for garage and service center management. We specialize in helping automotive businesses manage:
              </p>
              <ul className={`${colorClasses.textSecondary} text-base leading-relaxed space-y-2 ml-6 list-disc`}>
                <li>Customer relationships and service history tracking</li>
                <li>Vehicle registration and maintenance records</li>
                <li>Job card creation and workflow management</li>
                <li>Invoice generation and payment tracking</li>
                <li>Inventory and parts management</li>
                <li>Financial reporting and analytics</li>
                <li>Policy and warranty claim management</li>
              </ul>
              <p className={`${colorClasses.textSecondary} text-base leading-relaxed mt-6`}>
                Whether you run a small independent garage or a large service center, GarageMap adapts to your needs, providing the tools necessary to grow your business and improve customer satisfaction.
              </p>
            </div>
          </div>

          {/* Key Features Grid */}
          <div>
            <h2 className={`font-mono text-xs ${colorClasses.textCyan} mb-8 uppercase tracking-wider text-center opacity-80`}>
              {/* // */} WHY_CHOOSE_GARAGEMAP
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`border-l-2 pl-4`} style={{ borderColor: colors.primary.cyan }}>
                <div className={`font-mono text-xs ${colorClasses.textCyan} mb-2 uppercase`}>Cloud-Based</div>
                <div className={`${colorClasses.textSecondary} text-sm`}>Access your data from anywhere, anytime. No need for expensive on-premise servers.</div>
              </div>
              <div className={`border-l-2 pl-4`} style={{ borderColor: colors.primary.blue }}>
                <div className={`font-mono text-xs ${colorClasses.textBlue} mb-2 uppercase`}>Secure & Reliable</div>
                <div className={`${colorClasses.textSecondary} text-sm`}>Enterprise-grade security and data protection. Your business data is safe with us.</div>
              </div>
              <div className={`border-l-2 pl-4`} style={{ borderColor: colors.primary.blue }}>
                <div className={`font-mono text-xs ${colorClasses.textBlue} mb-2 uppercase`}>Easy to Use</div>
                <div className={`${colorClasses.textSecondary} text-sm`}>Intuitive interface designed for garage professionals. Minimal training required.</div>
              </div>
              <div className={`border-l-2 pl-4`} style={{ borderColor: colors.primary.cyan }}>
                <div className={`font-mono text-xs ${colorClasses.textCyan} mb-2 uppercase`}>Scalable</div>
                <div className={`${colorClasses.textSecondary} text-sm`}>Grows with your business. From small garages to large service centers.</div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className={`alloy-card ${colorClasses.cardGradient} ${colorClasses.borderDefault} p-10 relative overflow-hidden shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10] border text-center`}>
            <div className="absolute top-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
            <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
            <div className="absolute bottom-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
            <div className="absolute bottom-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
            
            <h2 className={`font-mono text-sm ${colorClasses.textBlue} mb-4 uppercase tracking-wider`}>
              READY_TO_STREAMLINE_YOUR_GARAGE?
            </h2>
            <p className={`${colorClasses.textSecondary} text-sm mb-6 max-w-2xl mx-auto`}>
              Join garage owners and service center managers who are already using GarageMap to transform their operations.
            </p>
            <Link
              href="/auth/register"
              className={`inline-flex items-center gap-4 ${colorClasses.buttonPrimary} py-5 px-10 font-mono font-bold uppercase no-underline transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] relative hover:-translate-y-0.5`}
            >
              Get Started Today
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`mt-32 pb-16 border-t ${colorClasses.borderDefault} px-16 max-lg:px-8`}>
        <div className="max-w-[1400px] mx-auto pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className={`font-mono text-[0.7rem] ${colorClasses.textSecondary}`}>
            MADE WITH GARAGEMAP BY DEVELOPERS
          </div>
          <div className={`font-mono text-[0.7rem] ${colorClasses.textSecondary}`}>
            BUILT WITH ❤️ FOR GARAGE OWNERS
          </div>
        </div>
      </footer>
    </>
  );
}
