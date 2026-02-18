"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useResetPassword } from "@/firebase/hooks/useAuth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const resetPasswordMutation = useResetPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await resetPasswordMutation.mutateAsync(email);
      setIsSuccess(true);
    } catch (err: unknown) {
      const error = err as Error;
      // Handle common Firebase auth errors
      let errorMessage = "Failed to send password reset email. Please try again.";

      if (error.message.includes("user-not-found") || error.message.includes("auth/user-not-found")) {
        errorMessage = "No account found with this email address.";
      } else if (error.message.includes("invalid-email") || error.message.includes("auth/invalid-email")) {
        errorMessage = "Invalid email address format.";
      } else if (error.message.includes("too-many-requests") || error.message.includes("auth/too-many-requests")) {
        errorMessage = "Too many requests. Please try again later.";
      } else if (error.message.includes("network-request-failed") || error.message.includes("auth/network-request-failed")) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-2.5 font-mono font-bold tracking-[-2px] text-2xl mb-4 hover:opacity-80 transition-opacity">
            <div className="w-6 h-6 bg-[#3b82f6] shadow-[0_0_15px_#3b82f6] [clip-path:polygon(25%_0%,100%_0%,75%_100%,0%_100%)]"></div>
            GARAGEMAP_OS
          </Link>
          <p className="font-mono text-xs text-[#22d3ee] uppercase tracking-wider opacity-80">
            {/* // */} PASSWORD_RECOVERY_PROTOCOL
          </p>
        </div>

        {/* Forgot Password Card */}
        <div className="alloy-card bg-gradient-to-br from-[#2a2e33] to-[#16181b] border border-white/5 p-10 relative overflow-hidden shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
          {/* Hex Bolts */}
          <div className="absolute top-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
          <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
          <div className="absolute bottom-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
          <div className="absolute bottom-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>

          {!isSuccess ? (
            <>
              <h2 className="font-mono text-xs mb-8 text-[#3b82f6] uppercase tracking-wider">
                RESET_PASSWORD
              </h2>

              <p className="font-mono text-sm text-[#94a3b8] mb-6 leading-relaxed">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block font-mono text-[0.65rem] text-[#94a3b8] mb-2 uppercase tracking-wider">
                    Email_Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-[#1a1c1e] border border-white/10 px-4 pl-10 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all duration-300 placeholder:text-[#475569]"
                      placeholder="user@garagemap.io"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-[#ef4444]/20 border border-[#ef4444]/50 p-3 rounded">
                    <p className="font-mono text-xs text-[#ef4444]">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className="w-full inline-flex items-center justify-center gap-3 bg-[#e2e8f0] text-[#0f172a] py-4 px-8 font-mono font-bold uppercase [clip-path:polygon(0_0,90%_0,100%_30%,100%_100%,10%_100%,0_70%)] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:bg-[#22d3ee] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {resetPasswordMutation.isPending ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      SENDING...
                    </>
                  ) : (
                    <>
                      SEND_RESET_LINK
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[#22d3ee]/20 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-[#22d3ee]" />
                </div>
              </div>
              <h2 className="font-mono text-xs mb-4 text-[#22d3ee] uppercase tracking-wider">
                EMAIL_SENT
              </h2>
              <p className="font-mono text-sm text-[#94a3b8] mb-6 leading-relaxed">
                We&apos;ve sent a password reset link to <span className="text-white font-bold">{email}</span>. Please check your inbox and follow the instructions to reset your password.
              </p>
              <p className="font-mono text-xs text-[#94a3b8] mb-6">
                Didn&apos;t receive the email? Check your spam folder or try again.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail("");
                    setError("");
                  }}
                  className="w-full inline-flex items-center justify-center gap-3 bg-[#e2e8f0] text-[#0f172a] py-4 px-8 font-mono font-bold uppercase [clip-path:polygon(0_0,90%_0,100%_30%,100%_100%,10%_100%,0_70%)] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:bg-[#22d3ee] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]"
                >
                  RESEND_EMAIL
                </button>
                <Link
                  href="/auth/login"
                  className="block w-full text-center font-mono text-sm text-[#22d3ee] hover:text-[#3b82f6] transition-all duration-300 uppercase tracking-wider py-2 border border-[#22d3ee]/30 hover:border-[#3b82f6]/50"
                >
                  BACK_TO_LOGIN
                </Link>
              </div>
            </div>
          )}

          {/* Divider */}
          {!isSuccess && (
            <div className="mt-8 pt-8 border-t border-white/5">
              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 font-mono text-sm text-[#22d3ee] hover:text-[#3b82f6] transition-all duration-300 uppercase tracking-wider"
              >
                <ArrowLeft className="h-4 w-4" />
                BACK_TO_LOGIN
              </Link>
            </div>
          )}
        </div>

        {/* Back to Home Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="font-mono text-xs text-[#94a3b8] hover:text-[#22d3ee] transition-colors duration-300 uppercase tracking-wider"
          >
            ← RETURN_TO_HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
