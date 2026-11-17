import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store";
import { login, register, clearError } from "../app/slices/authSlice";
import { authApi } from "../services/api";

interface AuthPageProps {
  initialMode?: "login" | "register";
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const isRegisterFromUrl = location.pathname.includes("register");
  const [isRegister, setIsRegister] = useState<boolean>(
    initialMode === "register" || isRegisterFromUrl
  );

  // Forgot Password Flow State
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>("");
  const [resetLoading, setResetLoading] = useState<boolean>(false);
  const [resetEmailSent, setResetEmailSent] = useState<boolean>(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // Form Fields
  const [role, setRole] = useState<"customer" | "host">("customer");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phone, setPhone] = useState<string>("+94 ");
  const [nic, setNic] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    if (isRegister) {
      const result = await dispatch(
        register({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          phone: phone.trim(),
          nic: nic.trim(),
        })
      );
      if (register.fulfilled.match(result)) {
        const searchParams = new URLSearchParams(location.search);
        const redirectParam = searchParams.get("redirect");
        if (redirectParam) {
          navigate(redirectParam);
        } else {
          navigate(role === "host" ? "/list-your-item" : "/explore");
        }
      }
    } else {
      const result = await dispatch(
        login({ email: email.trim(), password })
      );
      if (login.fulfilled.match(result)) {
        const searchParams = new URLSearchParams(location.search);
        const redirectParam = searchParams.get("redirect");
        if (redirectParam) {
          navigate(redirectParam);
        } else {
          navigate(result.payload.user.role === "admin" ? "/admin" : "/explore");
        }
      }
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    setResetLoading(true);
    setResetMessage(null);

    try {
      await authApi.forgotPassword(resetEmail.trim());
      setResetEmailSent(true);
      setResetMessage(
        `We've sent a password reset verification link to ${resetEmail.trim()}. Please check your inbox and spam folder.`
      );
    } catch (err: any) {
      // Even if network fails, provide clean feedback
      setResetEmailSent(true);
      setResetMessage(
        `If ${resetEmail.trim()} is registered with RentLanka, you will receive password reset instructions shortly.`
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface pt-28 pb-20 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-surface-container shadow-xl space-y-6">
        {/* ========================================================================= */}
        {/* VIEW 1: FORGOT PASSWORD FLOW */}
        {/* ========================================================================= */}
        {isForgotPassword ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-primary-fixed/40 text-primary mx-auto flex items-center justify-center mb-1">
                <span className="material-symbols-outlined text-[28px]">lock_reset</span>
              </div>
              <h2 className="font-headline text-2xl font-extrabold text-on-surface">
                Reset Your Password
              </h2>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                Enter your registered email address, and we'll send you a password reset verification link.
              </p>
            </div>

            {resetEmailSent ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-4 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">mark_email_read</span>
                </div>
                <h4 className="font-headline font-bold text-sm text-emerald-950">
                  Verification Link Sent
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  {resetMessage}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setResetEmailSent(false);
                      setResetEmail("");
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold font-headline hover:bg-primary-container shadow-xs transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Back to Login
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="block text-xs font-bold text-on-surface mb-1.5">
                    Email Address <span className="text-error">*</span>
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    placeholder="you@domain.lk"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-3.5 rounded-xl bg-primary text-white hover:bg-primary-container font-headline font-bold text-sm shadow-[0_4px_16px_rgba(0,105,72,0.3)] transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {resetLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
                      Send Reset Link
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      dispatch(clearError());
                    }}
                    className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Back to Login
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: LOGIN & REGISTRATION FLOW (CLEAN PRODUCTION AUTH) */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* Brand Logo & Header */}
            <div className="text-center space-y-2">
              <Link to="/" className="inline-flex items-center gap-2 group mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-md">
                  <span className="material-symbols-outlined text-[24px]">key</span>
                </div>
                <span className="font-headline text-2xl font-black text-on-surface">
                  Rent<span className="text-primary">Lanka</span>
                </span>
              </Link>

              <h2 className="font-headline text-2xl font-extrabold text-on-surface">
                {isRegister ? "Create RentLanka Account" : "Welcome Back"}
              </h2>
              <p className="text-xs text-on-surface-variant">
                {isRegister
                  ? "Join Sri Lanka's largest peer-to-peer equipment rental network"
                  : "Sign in to manage bookings, host equipment, and access escrow receipts"}
              </p>
            </div>

            {/* Role Toggle for Registration */}
            {isRegister && (
              <div className="p-1 rounded-2xl bg-surface-container-low border border-surface-container flex gap-1">
                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  className={`flex-1 py-2.5 rounded-xl font-headline text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    role === "customer"
                      ? "bg-primary text-white shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                  I Want to Rent
                </button>
                <button
                  type="button"
                  onClick={() => setRole("host")}
                  className={`flex-1 py-2.5 rounded-xl font-headline text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    role === "host"
                      ? "bg-primary text-white shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">storefront</span>
                  I Want to Host
                </button>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Main Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label htmlFor="auth-name" className="block text-xs font-bold text-on-surface mb-1.5">
                    Full Legal Name <span className="text-error">*</span>
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    required
                    placeholder="e.g., Nadeesha Perera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              <div>
                <label htmlFor="auth-email" className="block text-xs font-bold text-on-surface mb-1.5">
                  Email Address <span className="text-error">*</span>
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  placeholder="you@domain.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="auth-password" className="text-xs font-bold text-on-surface">
                    Password <span className="text-error">*</span>
                  </label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        dispatch(clearError());
                      }}
                      className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <input
                  id="auth-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {isRegister && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="auth-phone" className="block text-xs font-bold text-on-surface mb-1.5">
                      WhatsApp Phone
                    </label>
                    <input
                      id="auth-phone"
                      type="text"
                      placeholder="+94 77 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label htmlFor="auth-nic" className="block text-xs font-bold text-on-surface mb-1.5">
                      National NIC
                    </label>
                    <input
                      id="auth-nic"
                      type="text"
                      placeholder="200012345678"
                      value={nic}
                      onChange={(e) => setNic(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-primary text-white hover:bg-primary-container font-headline font-bold text-sm shadow-[0_4px_16px_rgba(0,105,72,0.3)] transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : isRegister ? (
                  "Create Account"
                ) : (
                  "Sign In to RentLanka"
                )}
              </button>
            </form>

            {/* Toggle Between Login and Register */}
            <div className="text-center text-xs text-on-surface-variant pt-4 border-t border-surface-container">
              {isRegister ? (
                <span>
                  Already have a RentLanka account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(false);
                      dispatch(clearError());
                    }}
                    className="font-bold text-primary hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  Don't have an account yet?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(true);
                      dispatch(clearError());
                    }}
                    className="font-bold text-primary hover:underline cursor-pointer"
                  >
                    Register Now
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
