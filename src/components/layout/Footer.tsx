import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-inverse-surface text-inverse-on-surface pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          {/* ========================================================================= */}
          {/* BRAND COLUMN (lg:col-span-4) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-bold shadow-[0_4px_14px_rgba(0,105,72,0.35)]">
                <span className="material-symbols-outlined text-[22px]">key</span>
              </div>
              <span className="font-headline text-2xl font-black text-white tracking-tight">
                Rent<span className="text-primary-fixed">Lanka</span>
              </span>
            </div>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Sri Lanka&apos;s trusted peer-to-peer and B2C rental ecosystem. Verified identity trust, protected deposits, and islandwide delivery.
            </p>

            {/* Live Security Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs font-semibold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>LankaPay Escrow Live</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs font-semibold text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-primary-fixed" />
                <span>DRP NIC Verified</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* DIRECT SUPPORT & INQUIRIES BOX (lg:col-span-4) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 space-y-3.5 bg-slate-900/90 rounded-2xl p-5 border border-slate-800">
            <h4 className="font-headline text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Direct Support &amp; Operations</span>
            </h4>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              {/* Phone & WhatsApp */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">24/7 Hotline &amp; WhatsApp</p>
                  <a
                    href="tel:+94783604911"
                    className="font-bold text-white hover:text-primary-fixed transition-colors text-sm"
                  >
                    +94 78 360 4911
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Direct Inquiries Email</p>
                  <a
                    href="mailto:himashakashmira7@gmail.com"
                    className="font-semibold text-white hover:text-primary-fixed transition-colors text-xs sm:text-sm break-all"
                  >
                    himashakashmira7@gmail.com
                  </a>
                </div>
              </div>

              {/* Hubs */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Operations &amp; Handover Hubs</p>
                  <p className="font-medium text-slate-200 text-xs leading-relaxed">
                    Colombo Metro &amp; Southern Hub (Matara / Beliatta / Galle)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* QUICK LINKS: DISCOVER (lg:col-span-2) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-headline text-xs font-bold text-white uppercase tracking-wider">
              Discover
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400 font-medium">
              <li>
                <Link to="/explore" className="hover:text-primary-fixed transition-colors flex items-center gap-1 group">
                  <span>Explore Fleet</span>
                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-primary-fixed group-hover:translate-x-0.5 transition-all" />
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-primary-fixed transition-colors flex items-center gap-1 group">
                  <span>Browse Categories</span>
                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-primary-fixed group-hover:translate-x-0.5 transition-all" />
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-primary-fixed transition-colors flex items-center gap-1 group">
                  <span>How It Works</span>
                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-primary-fixed group-hover:translate-x-0.5 transition-all" />
                </Link>
              </li>
              <li>
                <Link to="/list-your-item" className="hover:text-primary-fixed transition-colors flex items-center gap-1 group">
                  <span>List Asset</span>
                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-primary-fixed group-hover:translate-x-0.5 transition-all" />
                </Link>
              </li>
            </ul>
          </div>

          {/* ========================================================================= */}
          {/* QUICK LINKS: TRUST & SAFETY (lg:col-span-2) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-headline text-xs font-bold text-white uppercase tracking-wider">
              Trust &amp; Safety
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400 font-medium">
              <li className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>LankaPay Escrow Scheme</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>NIC Verification</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Host Protection Guarantee</span>
              </li>
              <li className="pt-1">
                <Link
                  to="/list-your-item"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline"
                >
                  <span>Become a Verified Host →</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COPYRIGHT BAR */}
        {/* ========================================================================= */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="text-center sm:text-left">
            © 2025 RentLanka Technologies (Pvt) Ltd. Developed by Himasha Kashmira. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-slate-500">
            <span>Colombo</span>
            <span>•</span>
            <span>Galle</span>
            <span>•</span>
            <span>Kandy</span>
            <span>•</span>
            <span>Matara</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
