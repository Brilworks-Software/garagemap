"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSignIn } from "@/firebase/hooks/useAuth";
import { useUpdateUser } from "@/firebase/hooks/useUser";
import { AuthService } from "@/firebase/services/AuthService";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Mail } from "lucide-react";
import { colors, colorClasses } from "@/lib/colors";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const router = useRouter();
  const signInMutation = useSignIn();
  const updateUserMutation = useUpdateUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowVerificationModal(false);
    
    try {
      const user = await signInMutation.mutateAsync({ email, password });
      
      // Reload user to get the latest email verification status
      if (user) {
        try {
          await user.reload();
        } catch (reloadError) {
          // If reload fails, continue with the current user state
          console.warn("Failed to reload user:", reloadError);
        }
        
        const reloadedUser = AuthService.getCurrentUser();
        
        // Check if email is verified after reload (or use original user if reload failed)
        const currentUser = reloadedUser || user;
        if (currentUser && !currentUser.emailVerified) {
          setShowVerificationModal(true);
          setError("Please verify your email address before signing in.");
          return;
        }
        
        // Email is verified - update user document emailVerified to true
        if (currentUser && currentUser.emailVerified && currentUser.uid) {
          try {
            await updateUserMutation.mutateAsync({
              uid: currentUser.uid,
              data: { emailVerified: true },
            });
          } catch (updateError) {
            // Log error but don't block login if update fails
            console.error("Failed to update user emailVerified:", updateError);
          }
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
            <Image 
              src="/logo.png" 
              alt="GarageMap Logo" 
              width={48} 
              height={48} 
              className="object-contain"
            />
            GARAGEMAP_OS
          </Link>
          <p className={`font-mono text-xs ${colorClasses.textCyan} uppercase tracking-wider opacity-80`}>
            {/* // */} AUTHENTICATION_PROTOCOL
          </p>
        </div>

        {/* Login Card */}
        <div className={`alloy-card ${colorClasses.cardGradient} ${colorClasses.borderDefault} p-10 relative overflow-hidden shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]`}>
          {/* Hex Bolts */}
          <div className="absolute top-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
          <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
          <div className="absolute bottom-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
          <div className="absolute bottom-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>

          <h2 className={`font-mono text-xs mb-8 ${colorClasses.textBlue} uppercase tracking-wider`}>
            SYSTEM_ACCESS
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className={`block font-mono text-[0.65rem] ${colorClasses.textSecondary} mb-2 uppercase tracking-wider`}>
                Email_Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="user@garagemap.io"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className={`block font-mono text-[0.65rem] ${colorClasses.textSecondary} mb-2 uppercase tracking-wider`}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ 
                    backgroundColor: colors.background.input,
                    borderColor: colors.border.input,
                  }}
                  className={`w-full px-4 py-3 pr-12 ${colorClasses.textPrimary} font-mono text-sm focus:outline-none transition-all duration-300 border`}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primary.blue;
                    e.target.style.boxShadow = `0 0 0 1px ${colors.primary.blue}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border.input;
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className={`absolute inset-y-0 right-0 flex items-center px-3 ${colorClasses.textSecondary} ${colorClasses.textBlue.replace('text-', 'hover:text-')} transition-colors`}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`${colorClasses.badgeError} border p-3 rounded`} style={{ borderColor: `${colors.primary.red}80` }}>
                <p className={`font-mono text-xs ${colorClasses.textRed}`}>{error}</p>
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              {/* <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 bg-[#1a1c1e] border border-white/10 text-[#3b82f6] focus:ring-[#3b82f6] focus:ring-1 rounded-sm"
                />
                <span className={`font-mono text-[0.7rem] ${colorClasses.textSecondary} uppercase`}>Remember_Me</span>
              </label> */}
              <Link
                href="/auth/forgotpassword"
                className={`font-mono text-[0.7rem] ${colorClasses.textCyan} ${colorClasses.textBlue.replace('text-', 'hover:text-')} transition-colors duration-300 uppercase`}
              >
                Forgot_Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={signInMutation.isPending}
              className={`w-full inline-flex items-center justify-center gap-3 ${colorClasses.buttonPrimary} py-4 px-8 font-mono font-bold uppercase transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
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
          <div className={`mt-8 pt-8 border-t ${colorClasses.borderDefault}`}>
            <p className={`text-center font-mono text-[0.7rem] ${colorClasses.textSecondary} mb-4`}>
              NO_ACCOUNT_REGISTERED?
            </p>
            <Link
              href="/auth/register"
              className={`block w-full text-center font-mono text-sm ${colorClasses.textCyan} ${colorClasses.textBlue.replace('text-', 'hover:text-')} transition-all duration-300 uppercase tracking-wider py-2 border`}
              style={{ borderColor: `${colors.primary.cyan}4d` }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${colors.primary.blue}80`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${colors.primary.cyan}4d`; }}
            >
              CREATE_NEW_ACCOUNT
            </Link>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className={`font-mono text-xs ${colorClasses.textSecondary} ${colorClasses.textCyan.replace('text-', 'hover:text-')} transition-colors duration-300 uppercase tracking-wider`}
          >
            ← RETURN_TO_HOME
          </Link>
        </div>
      </div>

      {/* Email Verification Modal */}
      <Dialog open={showVerificationModal} onOpenChange={setShowVerificationModal}>
        <DialogContent style={{ backgroundColor: colors.background.surface }} className={`${colorClasses.borderInput} ${colorClasses.textPrimary}`}>
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className={`w-16 h-16 rounded-full ${colorClasses.iconBgCyan} flex items-center justify-center`}>
                <Mail className="h-8 w-8" />
              </div>
            </div>
            <DialogTitle className={`font-mono uppercase ${colorClasses.textBlue} text-center`}>
              VERIFICATION_EMAIL_SENT
            </DialogTitle>
            <DialogDescription className={`${colorClasses.textSecondary} font-mono text-sm text-center mt-4`}>
              A verification link has been sent to your email address. Please check your inbox and click the verification link to activate your account.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 space-y-4">
            <div style={{ backgroundColor: colors.background.input }} className={`${colorClasses.borderInput} p-4 rounded`}>
              <p className={`font-mono text-xs ${colorClasses.textSecondary} mb-2`}>Email sent to:</p>
              <p className={`font-mono text-sm ${colorClasses.textPrimary} font-bold`}>{email || "your email"}</p>
            </div>
            <p className={`font-mono text-xs ${colorClasses.textSecondary} text-center`}>
              Didn&apos;t receive the email? Check your spam folder or try signing up again.
            </p>
            <Button
              onClick={() => {
                setShowVerificationModal(false);
                router.push("/auth/login");
              }}
              className={`w-full font-mono uppercase ${colorClasses.buttonPrimary}`}
            >
              GO TO LOGIN
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
