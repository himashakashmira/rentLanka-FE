import React from "react";
import { Link } from "react-router-dom";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-inverse-surface text-inverse-on-surface pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-md">
                <span className="material-symbols-outlined text-[20px]">key</span>
              </div>
              <span className="font-headline text-2xl font-black text-white tracking-tight">
                Rent<span className="text-primary-fixed">Lanka</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Sri Lanka’s premier decentralized peer-to-peer and commercial rental marketplace.
              Securing high-value assets across Western, Central, Southern and Northern provinces through
              LankaPay Escrow holds and verified digital handshakes.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                LankaPay Switch 14ms Live
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
                <span className="material-symbols-outlined text-[14px] text-primary-fixed">verified_user</span>
                DRP NIC Verified
              </div>
            </div>
          </div>

          {/* Quick Hubs */}
          <div className="space-y-3">
            <h4 className="font-headline text-sm font-bold text-white uppercase tracking-wider">
              Island Hubs
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/explore?location=colombo" className="hover:text-primary-fixed transition-colors">
                  Colombo (Western Hub)
                </Link>
              </li>
              <li>
                <Link to="/explore?location=kandy" className="hover:text-primary-fixed transition-colors">
                  Kandy (Central Province)
                </Link>
              </li>
              <li>
                <Link to="/explore?location=galle" className="hover:text-primary-fixed transition-colors">
                  Galle (Southern Coast)
                </Link>
              </li>
              <li>
                <Link to="/explore?location=negombo" className="hover:text-primary-fixed transition-colors">
                  Negombo (Airport Corridor)
                </Link>
              </li>
              <li>
                <Link to="/explore?location=jaffna" className="hover:text-primary-fixed transition-colors">
                  Jaffna (Northern Hub)
                </Link>
              </li>
            </ul>
          </div>

          {/* Equipment Types */}
          <div className="space-y-3">
            <h4 className="font-headline text-sm font-bold text-white uppercase tracking-wider">
              Popular Rentals
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/explore?category=Vehicles" className="hover:text-primary-fixed transition-colors">
                  4x4 SUVs & Double Cabs
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Cameras" className="hover:text-primary-fixed transition-colors">
                  Sony FX6 & Cinema Lenses
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Construction" className="hover:text-primary-fixed transition-colors">
                  CAT Hydraulic Excavators
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Tools %26 Machinery" className="hover:text-primary-fixed transition-colors">
                  Soundproof Silent Generators
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Motorcycles" className="hover:text-primary-fixed transition-colors">
                  Touring Adventure Bikes
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Trust */}
          <div className="space-y-3">
            <h4 className="font-headline text-sm font-bold text-white uppercase tracking-wider">
              RentLanka Shield™
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every peer transaction is protected by automated deposit escrow locks and digital insurance policies up to LKR 500,000.
            </p>
            <div className="pt-2">
              <Link
                to="/list-your-item"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold font-headline transition-all shadow-md"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                Become a Verified Host
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 RentLanka Technologies (Pvt) Ltd. All Rights Reserved. Built for IJSE ITS2020 RAD.</p>
          <div className="flex items-center gap-4">
            <span>Terms of Service</span>
            <span>•</span>
            <span>LankaPay Escrow Guidelines</span>
            <span>•</span>
            <span>Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

