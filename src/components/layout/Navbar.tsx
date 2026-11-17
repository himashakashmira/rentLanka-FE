import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { logout } from "../../app/slices/authSlice";

export const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
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
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-[0_4px_14px_rgba(0,105,72,0.3)] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">key</span>
            </div>
            <span className="font-headline text-2xl font-black text-on-surface tracking-tight group-hover:text-primary transition-colors">
              Rent<span className="text-primary">Lanka</span>
            </span>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* CENTER: CLEAN NAVIGATION LINKS ONLY (Explore Rentals | Categories | How It Works) */}
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
        {/* RIGHT: + LIST YOUR ITEM (EMERALD) | LOG IN | REGISTER (OR USER DROPDOWN) */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-3">
          {/* + List Your Item Primary Emerald Button */}
          <Link
            to="/list-your-item"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-headline text-xs font-bold bg-primary text-white hover:bg-primary-container shadow-[0_4px_14px_rgba(0,105,72,0.28)] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            List Your Item
          </Link>

          {isAuthenticated && user ? (
            /* Authenticated User Profile Pill & Dropdown */
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 pr-2.5 rounded-full bg-surface-container-low hover:bg-surface-container border border-surface-container-high transition-all cursor-pointer"
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

                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low font-medium"
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
                    className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low font-medium"
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

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-on-surface hover:bg-surface-container-low focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-surface-container-high px-4 py-4 space-y-2 shadow-lg animate-modal-enter">
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-headline font-semibold text-on-surface hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-primary text-[20px]">explore</span>
            Explore Rentals
          </Link>
          <Link
            to="/categories"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-headline font-semibold text-on-surface hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-primary text-[20px]">category</span>
            Categories
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-headline font-semibold text-on-surface hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-primary text-[20px]">help_outline</span>
            How It Works
          </Link>
          <Link
            to="/list-your-item"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-headline font-bold text-white bg-primary hover:bg-primary-container shadow-xs"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            + List Your Item
          </Link>

          {!isAuthenticated ? (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-surface-container">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-center rounded-xl font-headline font-bold text-xs bg-surface-container-low text-on-surface"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-center rounded-xl font-headline font-bold text-xs border border-surface-container text-on-surface"
              >
                Register
              </Link>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-xl font-headline font-semibold text-error hover:bg-error-container/20 pt-2 border-t border-surface-container"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Sign Out
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
