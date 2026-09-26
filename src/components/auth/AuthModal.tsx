import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Chrome,
  Github,
  ArrowRight,
  Mail,
  AlertCircle,
} from "lucide-react";
import { UserRole } from "../../types";
import { InfinityLogoIcon } from "../common/InfinityLogo";
import { authApi } from "../../services/api";

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (role: UserRole, name: string, token?: string, user?: any) => void;
  onSignupSuccess: (role: UserRole, name: string, token?: string, user?: any) => void;
  initialMode?: "login" | "signup";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onLoginSuccess,
  onSignupSuccess,
  initialMode = "login",
}) => {
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot" | "verify">(
    initialMode
  );
  const [selectedRole, setSelectedRole] = useState<UserRole>("STUDENT");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  
  // OTP State
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6).replace(/\D/g, "");
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      const res = await authApi.resendOtp({ email });
      setInfoMessage(res.message);
      setResendCooldown(60);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to resend OTP");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);
    setIsLoading(true);

    try {
      if (authMode === "signup") {
        if (password.length < 6) {
          setErrorMessage("Password must be at least 6 characters long.");
          setIsLoading(false);
          return;
        }

        const res = await authApi.register({
          name: fullName,
          email,
          password,
          role: selectedRole,
        });

        setInfoMessage(res.message || "Verification code sent to your email!");
        setAuthMode("verify");
        setResendCooldown(60);
      } else if (authMode === "login") {
        const res = await authApi.login({ email, password, role: selectedRole });
        if (res.success) {
          onLoginSuccess((res.user?.role || selectedRole) as UserRole, res.user?.name || fullName, res.token, res.user);
          onClose();
        }
      } else if (authMode === "forgot") {
        const res = await authApi.forgotPassword({ email });
        setInfoMessage(res.message);
        setAuthMode("verify");
      } else if (authMode === "verify") {
        const otpString = otp.join("");
        if (otpString.length < 6) {
          setErrorMessage("Please enter the complete 6-digit OTP.");
          setIsLoading(false);
          return;
        }
        const res = await authApi.verifyEmail({ email, token: otpString });
        if (res.success) {
          onSignupSuccess(selectedRole, res.user?.name || fullName, res.token, res.user);
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    setErrorMessage(null);
    window.location.assign(`/api/auth/${provider}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#112D4E]/60  flex items-center justify-center p-4">
      <div className="bg-white/95  w-full max-w-md rounded-lg shadow-md border border-[#112D4E]/[.12] p-6 sm:p-8 space-y-6 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#112D4E]/[.55] hover:text-[#112D4E]/[.72] rounded-full hover:bg-[#112D4E]/[.04] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <InfinityLogoIcon size="xl" className="mx-auto" />
          <h2 className="text-2xl font-black text-[#112D4E] tracking-tight">
            {authMode === "login" && "Welcome Back"}
            {authMode === "signup" && "Create Your Account"}
            {authMode === "forgot" && "Reset Password"}
            {authMode === "verify" && "Verify your email"}
          </h2>
          <p className="text-xs font-semibold text-[#112D4E]/[.55]">
            LearnX — <span className="text-[#3F72AF]">Learn</span> • <span className="text-[#3F72AF]">Connect</span> • <span className="text-[#3F72AF]">Build</span>
          </p>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] text-[#112D4E] text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {infoMessage && (
          <div className="p-3 rounded-lg bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] text-[#3F72AF] text-xs font-bold flex items-center gap-2">
            <Mail className="w-4 h-4 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* MODE 1: EMAIL VERIFICATION STEP */}
        {authMode === "verify" && (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="text-center space-y-2">
              <p className="text-[#112D4E]/[.55]">We sent a 6-digit verification code to:</p>
              <p className="font-mono text-[#3F72AF] font-bold text-sm bg-[#112D4E]/[.04] py-1.5 px-3 rounded-lg inline-block">{email}</p>
            </div>

            <div className="flex justify-between gap-2 my-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  className="w-12 h-14 text-center text-2xl font-bold rounded-xl bg-white border border-[#112D4E]/[.12] focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-transparent transition-all"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.join("").length < 6}
              className="w-full py-3.5 rounded-lg bg-[#3F72AF] text-white font-bold text-xs hover:bg-[#112D4E] transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </button>

            <div className="flex flex-col gap-3 pt-4 text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || isLoading}
                className="font-bold text-[#3F72AF] hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("signup")}
                className="font-bold text-[#112D4E]/[.55] hover:underline"
              >
                Change Email
              </button>
            </div>
          </form>
        )}

        {/* MODE 2: FORGOT PASSWORD */}
        {authMode === "forgot" && (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <p className="text-[#112D4E]/[.55] text-center">
              Enter your account email address and we will send you a password reset verification link.
            </p>
            <div>
              <label className="font-bold text-[#112D4E] block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl bg-white border border-[#112D4E]/[.12] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-lg bg-[#3F72AF] text-white font-bold text-xs hover:bg-[#112D4E] transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setAuthMode("reset")}
                className="font-bold text-[#3F72AF] hover:underline"
              >
                Already have a reset token?
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className="font-bold text-[#112D4E]/[.55] hover:underline"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        )}

        {/* MODE 2.5: RESET PASSWORD FORM */}
        {authMode === "reset" && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setErrorMessage(null);
              setInfoMessage(null);
              if (password.length < 6) {
                setErrorMessage("Password must be at least 6 characters long.");
                return;
              }
              setIsLoading(true);
              try {
                const tokenInput = (document.getElementById("reset-token-input") as HTMLInputElement)?.value;
                const res = await authApi.resetPassword({ email, token: tokenInput, newPassword: password });
                setInfoMessage(res.message || "Password updated successfully!");
                setTimeout(() => setAuthMode("login"), 1500);
              } catch (err: any) {
                setErrorMessage(err.message || "Failed to reset password.");
              } finally {
                setIsLoading(false);
              }
            }}
            className="space-y-3 text-xs"
          >
            <div>
              <label className="font-bold text-[#112D4E] block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-[#112D4E]/[.12] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              />
            </div>
            <div>
              <label className="font-bold text-[#112D4E] block mb-1">Reset Token / Code</label>
              <input
                id="reset-token-input"
                type="text"
                required
                placeholder="Paste the token from your email"
                className="w-full p-2.5 rounded-xl bg-white border border-[#112D4E]/[.12] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              />
            </div>
            <div>
              <label className="font-bold text-[#112D4E] block mb-1">New Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-[#112D4E]/[.12] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-lg bg-[#3F72AF] text-white font-bold text-xs hover:bg-[#112D4E] transition-colors cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? "Updating..." : "Update Password"}
            </button>

            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className="w-full text-center font-bold text-[#112D4E]/[.55] hover:underline block pt-2"
            >
              ← Back to Login
            </button>
          </form>
        )}

        {/* MODE 3: LOGIN / SIGNUP */}
        {(authMode === "login" || authMode === "signup") && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleOAuthLogin("google")}
                disabled={isLoading}
                className="p-2.5 rounded-lg border border-[#112D4E]/[.12] hover:bg-[#112D4E]/[.04] flex items-center justify-center gap-2 text-[#112D4E] cursor-pointer disabled:opacity-50"
              >
                <Chrome className="w-4 h-4 text-[#112D4E]" /> Google
              </button>
              <button
                type="button"
                onClick={() => handleOAuthLogin("github")}
                disabled={isLoading}
                className="p-2.5 rounded-lg border border-[#112D4E]/[.12] hover:bg-[#112D4E]/[.04] flex items-center justify-center gap-2 text-[#112D4E] cursor-pointer disabled:opacity-50"
              >
                <Github className="w-4 h-4 text-[#112D4E]" /> GitHub
              </button>
            </div>

            <div className="relative text-center text-[10px] uppercase font-bold text-[#112D4E]/[.55] my-2">
              <span className="bg-white px-2 relative z-10">Or Continue With Email</span>
              <div className="absolute inset-x-0 top-1/2 border-t border-[#112D4E]/[.12]" />
            </div>

            {authMode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#112D4E] block">Select Role:</label>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {[
                    { role: "STUDENT", label: "Student" },
                    { role: "COURSE_EDUCATOR", label: "Educator" },
                    { role: "FREELANCER", label: "Freelancer" },
                  ].map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => setSelectedRole(r.role as UserRole)}
                      className={`p-2 rounded-xl text-center border cursor-pointer transition-colors ${
                        selectedRole === r.role
                          ? "border-[#3F72AF] bg-[#112D4E]/[.04] text-[#3F72AF] font-extrabold"
                          : "border-[#112D4E]/[.12] text-[#112D4E]/[.72] hover:bg-[#112D4E]/[.04]"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs font-medium">
              {authMode === "signup" && (
                <div>
                  <label className="font-bold text-[#112D4E] block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#112D4E]/[.12] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-[#112D4E] block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-[#112D4E]/[.12] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                />
              </div>

              <div>
                <label className="font-bold text-[#112D4E] block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-[#112D4E]/[.12] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                />
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#112D4E]/[.72]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-[#3F72AF] rounded"
                  />
                  <span>Remember me</span>
                </label>

                {authMode === "login" && (
                  <button
                    type="button"
                    onClick={() => setAuthMode("forgot")}
                    className="font-bold text-[#3F72AF] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-lg bg-[#3F72AF] text-white font-bold text-xs hover:bg-[#112D4E] transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                <span>{isLoading ? "Processing..." : authMode === "login" ? "Sign In to LearnX" : "Create Account & Verify"}</span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="text-center text-xs text-[#112D4E]/[.55] pt-2 border-t border-[#112D4E]/[.12]">
              {authMode === "login" ? "Don't have an account?" : "Already registered?"}{" "}
              <button
                type="button"
                onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                className="font-bold text-[#3F72AF] hover:underline cursor-pointer"
              >
                {authMode === "login" ? "Sign Up Free" : "Log In"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
