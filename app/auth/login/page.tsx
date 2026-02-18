"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@/firebase/hooks/useAuth";
import { useUpdateUser } from "@/firebase/hooks/useUser";
import { AuthService } from "@/firebase/services/AuthService";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const router = useRouter();
  const signInMutation = useSignIn();
  const updateUserMutation = useUpdateUser();

  // Check if user is logged in but email not verified
  useEffect(() => {
    const checkEmailVerification = () => {
      const currentUser = AuthService.getCurrentUser();
      if (currentUser && !currentUser.emailVerified) {
        setShowVerificationModal(true);
      }
    };
    checkEmailVerification();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const user = await signInMutation.mutateAsync({ email, password });
      
      // Check if email is verified
      if (user && !user.emailVerified) {
        setShowVerificationModal(true);
        setError("Please verify your email address before signing in.");
        return;
      }
      
      // Email is verified - update user document emailVerified to true
      if (user && user.emailVerified && user.uid) {
        try {
          await updateUserMutation.mutateAsync({
            uid: user.uid,
            data: { emailVerified: true },
          });
        } catch (updateError) {
          // Log error but don't block login if update fails
          console.error("Failed to update user emailVerified:", updateError);
        }
      }
      
      // Redirect to dashboard
      router.push("/user");
    } catch (err: unknown) {
      const error = err as Error;
      // Handle common Firebase auth errors
      let errorMessage = "Failed to sign in. Please try again.";
      
      // Firebase updated error codes - invalid-credential replaces user-not-found and wrong-password
      if (error.message.includes("invalid-credential") || error.message.includes("auth/invalid-credential")) {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      } else if (error.message.includes("user-not-found")) {
        errorMessage = "No account found with this email address.";
      } else if (error.message.includes("wrong-password")) {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.message.includes("invalid-email") || error.message.includes("auth/invalid-email")) {
        errorMessage = "Invalid email address format.";
      } else if (error.message.includes("too-many-requests") || error.message.includes("auth/too-many-requests")) {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (error.message.includes("user-disabled") || error.message.includes("auth/user-disabled")) {
        errorMessage = "This account has been disabled. Please contact support.";
      } else if (error.message.includes("network-request-failed") || error.message.includes("auth/network-request-failed")) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message.includes("auth/email-not-verified")) {
        errorMessage = "Please verify your email address before signing in.";
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
            {/* // */} AUTHENTICATION_PROTOCOL
          </p>
        </div>

        {/* Login Card */}
        <div className="alloy-card bg-gradient-to-br from-[#2a2e33] to-[#16181b] border border-white/5 p-10 relative overflow-hidden shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
          {/* Hex Bolts */}
          <div className="absolute top-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
          <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
          <div className="absolute bottom-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
          <div className="absolute bottom-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>

          <h2 className="font-mono text-xs mb-8 text-[#3b82f6] uppercase tracking-wider">
            SYSTEM_ACCESS
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block font-mono text-[0.65rem] text-[#94a3b8] mb-2 uppercase tracking-wider">
                Email_Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#1a1c1e] border border-white/10 px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all duration-300 placeholder:text-[#475569]"
                placeholder="user@garagemap.io"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block font-mono text-[0.65rem] text-[#94a3b8] mb-2 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#1a1c1e] border border-white/10 px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all duration-300 placeholder:text-[#475569]"
                placeholder="••••••••"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-[#ef4444]/20 border border-[#ef4444]/50 p-3 rounded">
                <p className="font-mono text-xs text-[#ef4444]">{error}</p>
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 bg-[#1a1c1e] border border-white/10 text-[#3b82f6] focus:ring-[#3b82f6] focus:ring-1 rounded-sm"
                />
                <span className="font-mono text-[0.7rem] text-[#94a3b8] uppercase">Remember_Me</span>
              </label>
              <Link
                href="/auth/forgotpassword"
                className="font-mono text-[0.7rem] text-[#22d3ee] hover:text-[#3b82f6] transition-colors duration-300 uppercase"
              >
                Forgot_Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={signInMutation.isPending}
              className="w-full inline-flex items-center justify-center gap-3 bg-[#e2e8f0] text-[#0f172a] py-4 px-8 font-mono font-bold uppercase [clip-path:polygon(0_0,90%_0,100%_30%,100%_100%,10%_100%,0_70%)] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:bg-[#22d3ee] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {signInMutation.isPending ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  ACCESS_SYSTEM
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 pt-8 border-t border-white/5">
            <p className="text-center font-mono text-[0.7rem] text-[#94a3b8] mb-4">
              NO_ACCOUNT_REGISTERED?
            </p>
            <Link
              href="/auth/register"
              className="block w-full text-center font-mono text-sm text-[#22d3ee] hover:text-[#3b82f6] transition-all duration-300 uppercase tracking-wider py-2 border border-[#22d3ee]/30 hover:border-[#3b82f6]/50"
            >
              CREATE_NEW_ACCOUNT
            </Link>
          </div>
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

      {/* Email Verification Modal */}
      <Dialog open={showVerificationModal} onOpenChange={setShowVerificationModal}>
        <DialogContent className="bg-[#25282c] border-white/10 text-white">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-[#22d3ee]/20 flex items-center justify-center">
                <Mail className="h-8 w-8 text-[#22d3ee]" />
              </div>
            </div>
            <DialogTitle className="font-mono uppercase text-[#3b82f6] text-center">
              VERIFICATION_EMAIL_SENT
            </DialogTitle>
            <DialogDescription className="text-[#94a3b8] font-mono text-sm text-center mt-4">
              A verification link has been sent to your email address. Please check your inbox and click the verification link to activate your account.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 space-y-4">
            <div className="bg-[#1a1c1e] border border-white/10 p-4 rounded">
              <p className="font-mono text-xs text-[#94a3b8] mb-2">Email sent to:</p>
              <p className="font-mono text-sm text-white font-bold">{email || "your email"}</p>
            </div>
            <p className="font-mono text-xs text-[#94a3b8] text-center">
              Didn&apos;t receive the email? Check your spam folder or try signing up again.
            </p>
            <Button
              onClick={() => {
                setShowVerificationModal(false);
                router.push("/auth/login");
              }}
              className="w-full font-mono uppercase [clip-path:polygon(0_0,90%_0,100%_30%,100%_100%,10%_100%,0_70%)] bg-[#e2e8f0] text-[#0f172a] hover:bg-[#22d3ee] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]"
            >
              GO TO LOGIN
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
