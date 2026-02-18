"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignUp } from "@/firebase/hooks/useAuth";
import { useCreateUser } from "@/firebase/hooks/useUser";
import { useCreateService } from "@/firebase/hooks/useService";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const router = useRouter();

  // Step 1: Auth data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ownerName, setOwnerName] = useState("");

  // Step 2: Service info
  const [serviceType, setServiceType] = useState<"garage" | "service" | "">("");
  const [serviceName, setServiceName] = useState("");
  const [memberCount, setMemberCount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");

  // Hooks
  const signUpMutation = useSignUp();
  const createUserMutation = useCreateUser();
  const createServiceMutation = useCreateService();

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!serviceType) {
      setError("Please select a service type.");
      return;
    }

    try {
      // Step 1: Create Auth Account with ownerName as displayName
      const authUser = await signUpMutation.mutateAsync({
        email,
        password,
        displayName: ownerName || undefined,
      });

      if (!authUser?.uid) {
        throw new Error("Failed to create authentication account.");
      }

      // Step 2: Create Service Document (serviceId is the same as ownerId)
      const serviceId = authUser.uid;
      await createServiceMutation.mutateAsync({
        ownerId: serviceId,
        serviceData: {
          serviceType: serviceType as "garage" | "service",
          serviceName: serviceName || null,
          memberCount: memberCount ? parseInt(memberCount, 10) : null,
          phoneNumber: phoneNumber || null,
          address: address || null,
        },
      });

      // Step 3: Create User Document with ownerName and serviceId
      await createUserMutation.mutateAsync({
        uid: authUser.uid,
        email: authUser.email,
        displayName: ownerName || null,
        ownerName: ownerName || null,
        serviceId: serviceId,
        photoURL: null,
        emailVerified: authUser.emailVerified,
        userRole: "owner",
      });

      // Show verification modal instead of redirecting
      setShowVerificationModal(true);
    } catch (err: unknown) {
      const error = err as Error;
      // Handle common Firebase auth errors
      let errorMessage = "Failed to create account. Please try again.";

      if (error.message.includes("email-already-in-use") || error.message.includes("auth/email-already-in-use")) {
        errorMessage = "An account with this email already exists. Please use a different email or try logging in.";
      } else if (error.message.includes("invalid-email") || error.message.includes("auth/invalid-email")) {
        errorMessage = "Invalid email address format.";
      } else if (error.message.includes("weak-password") || error.message.includes("auth/weak-password")) {
        errorMessage = "Password is too weak. Please use a stronger password.";
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
      <div className="w-full max-w-2xl">
        {/* Logo/Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-2.5 font-mono font-bold tracking-[-2px] text-2xl mb-4 hover:opacity-80 transition-opacity">
            <div className="w-6 h-6 bg-[#3b82f6] shadow-[0_0_15px_#3b82f6] [clip-path:polygon(25%_0%,100%_0%,75%_100%,0%_100%)]"></div>
            GARAGEMAP_OS
          </Link>
          <p className="font-mono text-xs text-[#22d3ee] uppercase tracking-wider opacity-80">
            {/* // */} ACCOUNT_CREATION_PROTOCOL
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8 gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-sm font-bold border-2 transition-all duration-300 ${
                step >= 1
                  ? "bg-[#3b82f6] border-[#3b82f6] text-white"
                  : "bg-transparent border-[#94a3b8] text-[#94a3b8]"
              }`}
            >
              1
            </div>
            <span className={`font-mono text-xs uppercase ${step >= 1 ? "text-[#3b82f6]" : "text-[#94a3b8]"}`}>
              AUTH
            </span>
          </div>
          <div className={`h-px w-16 ${step >= 2 ? "bg-[#3b82f6]" : "bg-[#94a3b8]/30"}`}></div>
          <div className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-sm font-bold border-2 transition-all duration-300 ${
                step >= 2
                  ? "bg-[#3b82f6] border-[#3b82f6] text-white"
                  : "bg-transparent border-[#94a3b8] text-[#94a3b8]"
              }`}
            >
              2
            </div>
            <span className={`font-mono text-xs uppercase ${step >= 2 ? "text-[#3b82f6]" : "text-[#94a3b8]"}`}>
              SERVICE
            </span>
          </div>
        </div>

        {/* Signup Card */}
        <div className="alloy-card bg-gradient-to-br from-[#2a2e33] to-[#16181b] border border-white/5 p-10 relative overflow-hidden shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
          {/* Hex Bolts */}
          <div className="absolute top-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
          <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
          <div className="absolute bottom-2.5 left-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>
          <div className="absolute bottom-2.5 right-2.5 w-2 h-2 bg-[#334155] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]"></div>

          {/* Step 1: Authentication */}
          {step === 1 && (
            <>
              <h2 className="font-mono text-xs mb-8 text-[#3b82f6] uppercase tracking-wider">
                STEP_01: AUTHENTICATION
              </h2>

              <form onSubmit={handleStep1Submit} className="space-y-6">
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
                    placeholder="admin@garagemap.io"
                  />
                </div>

                {/* Owner Name Field */}
                <div>
                  <label htmlFor="ownerName" className="block font-mono text-[0.65rem] text-[#94a3b8] mb-2 uppercase tracking-wider">
                    Owner_Name
                  </label>
                  <input
                    type="text"
                    id="ownerName"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    required
                    className="w-full bg-[#1a1c1e] border border-white/10 px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all duration-300 placeholder:text-[#475569]"
                    placeholder="Enter owner name"
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
                    minLength={6}
                    className="w-full bg-[#1a1c1e] border border-white/10 px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all duration-300 placeholder:text-[#475569]"
                    placeholder="Minimum 6 characters"
                  />
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block font-mono text-[0.65rem] text-[#94a3b8] mb-2 uppercase tracking-wider">
                    Confirm_Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-[#1a1c1e] border border-white/10 px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all duration-300 placeholder:text-[#475569]"
                    placeholder="Re-enter password"
                  />
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
                  className="w-full inline-flex items-center justify-center gap-3 bg-[#e2e8f0] text-[#0f172a] py-4 px-8 font-mono font-bold uppercase [clip-path:polygon(0_0,90%_0,100%_30%,100%_100%,10%_100%,0_70%)] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:bg-[#22d3ee] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]"
                >
                  CONTINUE_TO_SERVICE_INFO
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </form>
            </>
          )}

          {/* Step 2: Service Information */}
          {step === 2 && (
            <>
              <h2 className="font-mono text-xs mb-8 text-[#3b82f6] uppercase tracking-wider">
                STEP_02: SERVICE_INFORMATION
              </h2>

              <form onSubmit={handleStep2Submit} className="space-y-6">
                {/* Service Type */}
                <div>
                  <label className="block font-mono text-[0.65rem] text-[#94a3b8] mb-3 uppercase tracking-wider">
                    Service_Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setServiceType("garage")}
                      className={`p-4 border-2 transition-all duration-300 font-mono text-sm uppercase ${
                        serviceType === "garage"
                          ? "border-[#3b82f6] bg-[#3b82f6]/10 text-[#3b82f6]"
                          : "border-white/10 bg-[#1a1c1e] text-[#94a3b8] hover:border-white/20"
                      }`}
                    >
                      Garage
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceType("service")}
                      className={`p-4 border-2 transition-all duration-300 font-mono text-sm uppercase ${
                        serviceType === "service"
                          ? "border-[#3b82f6] bg-[#3b82f6]/10 text-[#3b82f6]"
                          : "border-white/10 bg-[#1a1c1e] text-[#94a3b8] hover:border-white/20"
                      }`}
                    >
                      Service Center
                    </button>
                  </div>
                </div>

                {/* Service Name */}
                <div>
                  <label htmlFor="serviceName" className="block font-mono text-[0.65rem] text-[#94a3b8] mb-2 uppercase tracking-wider">
                    Service_Name
                  </label>
                  <input
                    type="text"
                    id="serviceName"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    required
                    className="w-full bg-[#1a1c1e] border border-white/10 px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all duration-300 placeholder:text-[#475569]"
                    placeholder="Enter service/garage name"
                  />
                </div>

                {/* Member Count */}
                <div>
                  <label htmlFor="memberCount" className="block font-mono text-[0.65rem] text-[#94a3b8] mb-2 uppercase tracking-wider">
                    Member_Count
                  </label>
                  <input
                    type="number"
                    id="memberCount"
                    value={memberCount}
                    onChange={(e) => setMemberCount(e.target.value)}
                    required
                    min="1"
                    className="w-full bg-[#1a1c1e] border border-white/10 px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all duration-300 placeholder:text-[#475569]"
                    placeholder="Number of team members"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block font-mono text-[0.65rem] text-[#94a3b8] mb-2 uppercase tracking-wider">
                    Phone_Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="w-full bg-[#1a1c1e] border border-white/10 px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all duration-300 placeholder:text-[#475569]"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block font-mono text-[0.65rem] text-[#94a3b8] mb-2 uppercase tracking-wider">
                    Address
                  </label>
                  <textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    rows={3}
                    className="w-full bg-[#1a1c1e] border border-white/10 px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all duration-300 placeholder:text-[#475569] resize-none"
                    placeholder="Enter full address"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-[#ef4444]/20 border border-[#ef4444]/50 p-3 rounded">
                    <p className="font-mono text-xs text-[#ef4444]">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 inline-flex items-center justify-center gap-3 bg-transparent border-2 border-white/10 text-white py-4 px-8 font-mono font-bold uppercase transition-all duration-300 hover:border-[#94a3b8] hover:bg-white/5"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    BACK
                  </button>
                  <button
                    type="submit"
                    disabled={signUpMutation.isPending || createUserMutation.isPending || createServiceMutation.isPending || !serviceType}
                    className="flex-1 inline-flex items-center justify-center gap-3 bg-[#e2e8f0] text-[#0f172a] py-4 px-8 font-mono font-bold uppercase [clip-path:polygon(0_0,90%_0,100%_30%,100%_100%,10%_100%,0_70%)] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:bg-[#22d3ee] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {signUpMutation.isPending || createUserMutation.isPending || createServiceMutation.isPending ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        CREATING_ACCOUNT...
                      </>
                    ) : (
                      <>
                        CREATE_ACCOUNT
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Back to Login Link */}
        <div className="mt-8 text-center">
          <p className="font-mono text-xs text-[#94a3b8] mb-2">
            ALREADY_HAVE_AN_ACCOUNT?
          </p>
          <Link
            href="/auth/login"
            className="font-mono text-xs text-[#22d3ee] hover:text-[#3b82f6] transition-colors duration-300 uppercase tracking-wider"
          >
            LOGIN_HERE
          </Link>
        </div>

        {/* Back to Home Link */}
        <div className="mt-4 text-center">
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
                <CheckCircle2 className="h-8 w-8 text-[#22d3ee]" />
              </div>
            </div>
            <DialogTitle className="font-mono uppercase text-[#3b82f6] text-center">
              VERIFICATION_EMAIL_SENT
            </DialogTitle>
            <DialogDescription className="text-[#94a3b8] font-mono text-sm text-center mt-4">
              Account created successfully! A verification link has been sent to your email address. Please check your inbox and click the verification link to activate your account.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 space-y-4">
            <div className="bg-[#1a1c1e] border border-white/10 p-4 rounded">
              <p className="font-mono text-xs text-[#94a3b8] mb-2">Email sent to:</p>
              <p className="font-mono text-sm text-white font-bold">{email}</p>
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
