import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store";
import { login, register, clearError, setMockUser } from "../app/slices/authSlice";

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

  // Form Fields
  const [role, setRole] = useState<"customer" | "host">("customer");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phone, setPhone] = useState<string>("+94 77 ");
  const [nic, setNic] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    if (isRegister) {
      const result = await dispatch(
        register({
          name,
          email,
          password,
          role,
          phone,
          nic,
        })
      );
      if (register.fulfilled.match(result)) {
        navigate(role === "host" ? "/list-your-item" : "/explore");
      }
    } else {
      const result = await dispatch(login({ email, password }));
      if (login.fulfilled.match(result)) {
        navigate(result.payload.user.role === "admin" ? "/admin" : "/explore");
      }
    }
  };

  // Demo Login Quick-Fill for instant IJSE evaluation
  const handleQuickDemoLogin = (demoRole: "customer" | "host" | "admin") => {
    dispatch(clearError());
    const demoUsers = {
      customer: {
        id: "demo-cust-1",
        name: "Nadeesha Perera",
        email: "nadeesha@rentlanka.lk",
        role: "customer" as const,
        phone: "+94 77 123 4567",
        nic: "199424801234",
      },
      host: {
        id: "demo-host-1",
        name: "Ceylon Cine Solutions",
        email: "host@rentlanka.lk",
        role: "host" as const,
        phone: "+94 71 888 9900",
        nic: "198812304567",
      },
      admin: {
        id: "demo-admin-1",
        name: "IJSE Ops Officer",
        email: "admin@rentlanka.lk",
        role: "admin" as const,
        phone: "+94 11 222 3344",
        nic: "198012345678",
      },
    };

    const targetUser = demoUsers[demoRole];
    dispatch(
      setMockUser({
        user: targetUser,
        token: `mock_jwt_token_${demoRole}_7d_valid`,
      })
    );

    if (demoRole === "admin") navigate("/admin");
    else if (demoRole === "host") navigate("/list-your-item");
    else navigate("/explore");
  };

  return (
    <div className="min-h-screen bg-surface pt-28 pb-20 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-8 border border-surface-container shadow-xl space-y-6">
        {/* Brand & Mode Switch */}
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
              : "Sign in with your verified Sri Lankan credentials"}
          </p>
        </div>

        {/* Role Toggle for Register Mode */}
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
          <div className="p-3.5 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label
                htmlFor="auth-name"
                className="block text-xs font-bold text-on-surface mb-1.5"
              >
                Full Legal Name <span className="text-error">*</span>
              </label>
              <input
                id="auth-name"
                type="text"
                required
                placeholder="e.g. Nadeesha Perera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="block text-xs font-bold text-on-surface mb-1.5"
            >
              Email Address <span className="text-error">*</span>
            </label>
            <input
              id="auth-email"
              type="email"
              required
              placeholder="you@domain.lk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="block text-xs font-bold text-on-surface mb-1.5"
            >
              Password <span className="text-error">*</span>
            </label>
            <input
              id="auth-password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {isRegister && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="auth-phone"
                  className="block text-xs font-bold text-on-surface mb-1.5"
                >
                  WhatsApp Phone
                </label>
                <input
                  id="auth-phone"
                  type="text"
                  placeholder="+94 77 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="auth-nic"
                  className="block text-xs font-bold text-on-surface mb-1.5"
                >
                  National NIC
                </label>
                <input
                  id="auth-nic"
                  type="text"
                  placeholder="200012345678"
                  value={nic}
                  onChange={(e) => setNic(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-headline font-bold text-sm shadow-[0_4px_16px_rgba(0,105,72,0.3)] transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : isRegister ? (
              "Complete Registration"
            ) : (
              "Sign In to Dashboard"
            )}
          </button>
        </form>

        {/* Toggle Login / Register */}
        <div className="text-center text-xs text-on-surface-variant pt-2 border-t border-surface-container">
          {isRegister ? (
            <span>
              Already registered on RentLanka?{" "}
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
                Join RentLanka
              </button>
            </span>
          )}
        </div>

        {/* ACADEMIC EVALUATION PRESETS */}
        <div className="pt-2">
          <div className="text-center text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
            ⚡ Quick Academic Assessment Logins
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("customer")}
              className="py-2 px-1 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container text-[11px] font-headline font-bold text-on-surface transition-colors text-center"
            >
              Renter Role
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("host")}
              className="py-2 px-1 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container text-[11px] font-headline font-bold text-primary transition-colors text-center"
            >
              Host Role
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("admin")}
              className="py-2 px-1 rounded-xl bg-secondary-container hover:bg-secondary-container/80 text-[11px] font-headline font-bold text-on-secondary-fixed transition-colors text-center"
            >
              Admin Role
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

