import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { logout } from "../../app/slices/authSlice";
import {
  Menu,
  X,
  Compass,
  Layers,
  HelpCircle,
  Plus,
  LogIn,
  UserPlus,
  LogOut,
  TrendingUp,
  LayoutDashboard,
  CalendarCheck,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  // Prevent background scrolling on mobile when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close desktop dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-xl border-b border-surface-container-high/70 shadow-[0_1px_8px_rgba(0,0,0,0.03)] transition-all">
      <div className="h-20 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* ========================================================================= */}
        {/* LEFT: BRAND LOGO */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-4 shrink-0">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-[0_4px_14px_rgba(0,105,72,0.3)] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">key</span>
            </div>
            <span className="font-headline text-2xl font-black text-on-surface tracking-tight group-hover:text-primary transition-colors">
              Rent<span className="text-primary">Lanka</span>
            </span>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* CENTER: DESKTOP NAVIGATION LINKS ONLY (Hidden on Mobile < md) */}
        {/* ========================================================================= */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <Link
            to="/explore"
            className={`px-3.5 py-2 rounded-xl font-headline text-xs lg:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              isActive("/explore")
                ? "bg-primary text-white shadow-xs"
                : "text-on-surface hover:text-primary hover:bg-surface-container-low"
            }`}
          >
            Explore Rentals
          </Link>

          <Link
            to="/categories"
            className={`px-3.5 py-2 rounded-xl font-headline text-xs lg:text-sm font-semibold transition-colors ${
              isActive("/categories")
                ? "bg-primary text-white shadow-xs"
                : "text-on-surface hover:text-primary hover:bg-surface-container-low"
            }`}
          >
            Categories
          </Link>

          <Link
            to="/how-it-works"
            className={`px-3.5 py-2 rounded-xl font-headline text-xs lg:text-sm font-semibold transition-colors ${
              isActive("/how-it-works")
                ? "bg-primary text-white shadow-xs"
                : "text-on-surface hover:text-primary hover:bg-surface-container-low"
            }`}
          >
            How It Works
          </Link>
        </nav>

        {/* ========================================================================= */}
        {/* RIGHT: DESKTOP ONLY ACTIONS (Hidden on Mobile < md) */}
        {/* ========================================================================= */}
        <div className="hidden md:flex items-center gap-3">
          {/* + List Your Item Primary Emerald Button */}
          <Link
            to="/list-your-item"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-headline text-xs font-bold bg-primary text-white hover:bg-primary-container shadow-[0_4px_14px_rgba(0,105,72,0.28)] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            List Your Item
          </Link>

          {isAuthenticated && user ? (
            /* Authenticated User Profile Pill & Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 pr-2.5 rounded-full bg-surface-container-low hover:bg-surface-container border border-surface-container-high transition-all cursor-pointer"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-emerald-400 text-white font-bold text-xs flex items-center justify-center uppercase shadow-xs">
                    {user.name.charAt(0)}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold font-headline text-on-surface leading-tight">
                    {user.name.split(" ")[0]}
                  </div>
                  <div className="text-[10px] text-primary font-semibold uppercase tracking-wider">
                    {user.role === "host" ? "SuperHost" : user.role}
                  </div>
                </div>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                  expand_more
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-surface-container py-2 z-50 animate-modal-enter">
                  <div className="px-4 py-2 border-b border-surface-container">
                    <p className="text-xs font-semibold text-on-surface-variant">Signed in as</p>
                    <p className="text-sm font-bold text-on-surface truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-primary-fixed text-on-primary-fixed">
                      {user.role} Verified
                    </span>
                  </div>

                  <Link
                    to="/my-bookings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      receipt_long
                    </span>
                    My Bookings
                  </Link>

                  {user.role === "host" && (
                    <Link
                      to="/host-dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low font-semibold transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-primary">
                        monitoring
                      </span>
                      Host Dashboard &amp; Earnings
                    </Link>
                  )}

                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low font-semibold transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-primary">
                        dashboard
                      </span>
                      Admin Operations
                    </Link>
                  )}

                  <Link
                    to="/list-your-item"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      add_business
                    </span>
                    List New Inventory
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error-container/20 font-medium border-t border-surface-container mt-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Clean Public Log In & Register Buttons */
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 rounded-xl text-xs font-bold font-headline text-on-surface hover:text-primary hover:bg-surface-container-low transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-xs font-bold font-headline bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-on-surface hover:text-primary transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* MOBILE ONLY: SLEEK HAMBURGER TOGGLE BUTTON (< md / < 768px) */}
        {/* ========================================================================= */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2.5 rounded-xl text-on-surface hover:text-primary hover:bg-surface-container-low active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-on-surface" />
            ) : (
              <Menu className="w-6 h-6 text-on-surface" />
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE SLIDE-DOWN DRAWER & BACKDROP OVERLAY */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 top-20 bg-slate-950/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Menu */}
          <div className="md:hidden relative z-50 bg-white/98 backdrop-blur-2xl border-b border-surface-container-high/90 shadow-2xl px-5 py-5 space-y-4 animate-modal-enter max-h-[calc(100vh-5rem)] overflow-y-auto">
            {/* Navigation Links */}
            <div className="space-y-1">
              <Link
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-headline font-semibold text-sm transition-colors ${
                  isActive("/explore")
                    ? "bg-primary text-white shadow-xs"
                    : "text-on-surface hover:bg-surface-container-low hover:text-primary"
                }`}
              >
                <Compass className={`w-5 h-5 ${isActive("/explore") ? "text-white" : "text-primary"}`} />
                <span>Explore Rentals</span>
              </Link>

              <Link
                to="/categories"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-headline font-semibold text-sm transition-colors ${
                  isActive("/categories")
                    ? "bg-primary text-white shadow-xs"
                    : "text-on-surface hover:bg-surface-container-low hover:text-primary"
                }`}
              >
                <Layers className={`w-5 h-5 ${isActive("/categories") ? "text-white" : "text-primary"}`} />
                <span>Categories</span>
              </Link>

              <Link
                to="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-headline font-semibold text-sm transition-colors ${
                  isActive("/how-it-works")
                    ? "bg-primary text-white shadow-xs"
                    : "text-on-surface hover:bg-surface-container-low hover:text-primary"
                }`}
              >
                <HelpCircle className={`w-5 h-5 ${isActive("/how-it-works") ? "text-white" : "text-primary"}`} />
                <span>How It Works</span>
              </Link>
            </div>

            {/* Subtle Divider */}
            <div className="border-t border-surface-container-high/60" />

            {/* Prominent Call to Action: + List Your Item */}
            <Link
              to="/list-your-item"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 px-4 rounded-xl font-headline font-bold text-sm bg-primary hover:bg-primary-container text-white shadow-[0_4px_14px_rgba(0,105,72,0.28)] flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Plus className="w-5 h-5" />
              <span>+ List Your Item</span>
            </Link>

            {/* Auth Section */}
            {!isAuthenticated ? (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 text-center rounded-xl font-headline font-bold text-sm bg-surface-container-low hover:bg-surface-container text-on-surface transition-all flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4 text-primary" />
                  <span>Log In</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 text-center rounded-xl font-headline font-bold text-sm border-2 border-primary text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4 text-primary" />
                  <span>Register</span>
                </Link>
              </div>
            ) : (
              <div className="pt-2 border-t border-surface-container-high/60 space-y-2">
                {/* User Profile Card */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low border border-surface-container">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-emerald-400 text-white font-bold text-sm flex items-center justify-center uppercase shadow-xs shrink-0">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold font-headline text-on-surface truncate">
                      {user?.name}
                    </div>
                    <div className="text-xs text-on-surface-variant truncate">
                      {user?.email}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-primary-fixed text-on-primary-fixed shrink-0">
                    {user?.role === "host" ? "SuperHost" : user?.role}
                  </span>
                </div>

                {/* My Bookings Link */}
                <Link
                  to="/my-bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl font-headline font-semibold text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  <CalendarCheck className="w-4 h-4 text-primary" />
                  <span>My Bookings</span>
                </Link>

                {/* Host Dashboard Link */}
                {user?.role === "host" && (
                  <Link
                    to="/host-dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl font-headline font-semibold text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span>Host Dashboard &amp; Earnings</span>
                  </Link>
                )}

                {/* Admin Operations Link */}
                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl font-headline font-semibold text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-primary" />
                    <span>Admin Operations</span>
                  </Link>
                )}

                {/* Sign Out Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl font-headline font-semibold text-sm text-error hover:bg-error-container/20 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-error" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;
