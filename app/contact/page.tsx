"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { colors, colorClasses } from "@/lib/colors";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const features = [
    {
      title: "Customer Management",
      description: "Add, edit, and delete customers. Store contact information and service history.",
    },
    {
      title: "Vehicle Management",
      description: "Register customer vehicles. Track vehicle details and associate with service jobs.",
    },
    {
      title: "Job Management",
      description: "Create job cards. Assign service tasks. Track job status and record service notes.",
    },
    {
      title: "Invoice Management",
      description: "Generate invoices from completed jobs. Calculate costs and track payment status.",
    },
    {
      title: "Inventory Management",
      description: "Add and manage spare parts. Track stock quantity and receive low stock alerts.",
    },
    {
      title: "Parts Management",
      description: "Manage vehicle parts and components. Track suppliers and pricing.",
    },
  ];

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
            <Link href="/about" className={`${colorClasses.textSecondary} ${colorClasses.textCyan.replace('text-', 'hover:text-')} transition-colors duration-300`}>
              About
            </Link>
            <Link href="/contact" className={`${colorClasses.textBlue} transition-colors duration-300`}>
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
            CONTACT US
          </h1>
          <p className={`font-mono text-sm ${colorClasses.textCyan} uppercase tracking-wider opacity-80`}>
            {/* // */} GET_IN_TOUCH_WITH_OUR_TEAM
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className={`alloy-card ${colorClasses.cardGradient} ${colorClasses.borderDefault} p-10 relative overflow-hidden shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10] border`}>
            <div className="absolute top-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
            <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
            <div className="absolute bottom-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
            <div className="absolute bottom-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
            
            <h2 className={`font-mono text-xs ${colorClasses.textBlue} mb-6 uppercase tracking-wider`}>
              SEND_US_A_MESSAGE
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className={`block font-mono text-[0.65rem] ${colorClasses.textSecondary} mb-2 uppercase tracking-wider`}>
                  Your_Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{ 
                    backgroundColor: colors.background.input,
                    borderColor: colors.border.input,
                  }}
                  className={`w-full px-4 py-3 ${colorClasses.textPrimary} font-mono text-sm focus:outline-none transition-all duration-300 border`}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primary.blue;
                    e.target.style.boxShadow = `0 0 0 1px ${colors.primary.blue}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border.input;
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Enter your name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className={`block font-mono text-[0.65rem] ${colorClasses.textSecondary} mb-2 uppercase tracking-wider`}>
                  Email_Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{ 
                    backgroundColor: colors.background.input,
                    borderColor: colors.border.input,
                  }}
                  className={`w-full px-4 py-3 ${colorClasses.textPrimary} font-mono text-sm focus:outline-none transition-all duration-300 border`}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primary.blue;
                    e.target.style.boxShadow = `0 0 0 1px ${colors.primary.blue}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border.input;
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="your@email.com"
                />
              </div>

              {/* Subject Field */}
              <div>
                <label htmlFor="subject" className={`block font-mono text-[0.65rem] ${colorClasses.textSecondary} mb-2 uppercase tracking-wider`}>
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  style={{ 
                    backgroundColor: colors.background.input,
                    borderColor: colors.border.input,
                  }}
                  className={`w-full px-4 py-3 ${colorClasses.textPrimary} font-mono text-sm focus:outline-none transition-all duration-300 border`}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primary.blue;
                    e.target.style.boxShadow = `0 0 0 1px ${colors.primary.blue}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border.input;
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="What is this regarding?"
                />
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className={`block font-mono text-[0.65rem] ${colorClasses.textSecondary} mb-2 uppercase tracking-wider`}>
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  style={{ 
                    backgroundColor: colors.background.input,
                    borderColor: colors.border.input,
                    color: colors.text.primary,
                  }}
                  className={`w-full px-4 py-3 ${colorClasses.textPrimary} font-mono text-sm focus:outline-none transition-all duration-300 border resize-none`}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primary.blue;
                    e.target.style.boxShadow = `0 0 0 1px ${colors.primary.blue}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border.input;
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Tell us how we can help..."
                />
              </div>

              {/* Success/Error Message */}
              {submitStatus === "success" && (
                <div className={`${colorClasses.badgeSuccess} border p-3 rounded`} style={{ borderColor: `${colors.primary.cyan}80` }}>
                  <p className={`font-mono text-xs ${colorClasses.textCyan}`}>Message sent successfully! We'll get back to you soon.</p>
                </div>
              )}
              {submitStatus === "error" && (
                <div className={`${colorClasses.badgeError} border p-3 rounded`} style={{ borderColor: `${colors.primary.red}80` }}>
                  <p className={`font-mono text-xs ${colorClasses.textRed}`}>Failed to send message. Please try again.</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full inline-flex items-center justify-center gap-3 ${colorClasses.buttonPrimary} py-4 px-8 font-mono font-bold uppercase transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    SENDING...
                  </>
                ) : (
                  <>
                    SEND_MESSAGE
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Features Section */}
          <div className="space-y-6">
            <div className={`alloy-card ${colorClasses.cardGradient} ${colorClasses.borderDefault} p-10 relative overflow-hidden shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10] border`}>
              <div className="absolute top-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
              <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
              <div className="absolute bottom-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
              <div className="absolute bottom-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
              
              <h2 className={`font-mono text-xs ${colorClasses.textBlue} mb-6 uppercase tracking-wider`}>
                GARAGEMAP_FEATURES
              </h2>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className={`border-l-2 pl-4`} style={{ borderColor: index % 2 === 0 ? colors.primary.blue : colors.primary.cyan }}>
                    <div className={`font-mono text-xs ${index % 2 === 0 ? colorClasses.textBlue : colorClasses.textCyan} mb-2 uppercase`}>
                      {feature.title}
                    </div>
                    <div className={`${colorClasses.textSecondary} text-sm`}>
                      {feature.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className={`alloy-card ${colorClasses.cardGradient} ${colorClasses.borderDefault} p-10 relative overflow-hidden shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10] border`}>
              <div className="absolute top-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
              <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
              <div className="absolute bottom-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
              <div className="absolute bottom-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
              
              <h2 className={`font-mono text-xs ${colorClasses.textBlue} mb-6 uppercase tracking-wider`}>
                CONTACT_INFORMATION
              </h2>
              <div className={`space-y-4 ${colorClasses.textSecondary} font-mono text-sm`}>
                <div>
                  <div className={`${colorClasses.textBlue} mb-1 uppercase text-xs`}>Email</div>
                  <div>support@garagemap.io</div>
                </div>
                <div>
                  <div className={`${colorClasses.textBlue} mb-1 uppercase text-xs`}>Support</div>
                  <div>Available 24/7</div>
                </div>
                <div>
                  <div className={`${colorClasses.textBlue} mb-1 uppercase text-xs`}>Response Time</div>
                  <div>Within 24 hours</div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
