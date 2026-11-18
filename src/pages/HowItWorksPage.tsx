import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Upload,
  CalendarCheck,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Lock,
  FileCheck,
} from "lucide-react";

export const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"renters" | "hosts">("renters");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const renterSteps = [
    {
      step: "01",
      title: "Search & Filter Gear",
      subtitle: "Find inspected vehicles & equipment near your city",
      desc: "Search through verified listings across Colombo, Kandy, Galle, Matara, Beliatta, Negombo, and Jaffna. Filter by category, pickup hub, daily rate, and availability dates with transparent pricing.",
      icon: <Search className="w-6 h-6 text-emerald-400" />,
      badges: ["GPS Handover Hubs", "Live Availability Calendar"],
      highlight: "No hidden charges or surprise markups.",
    },
    {
      step: "02",
      title: "LankaPay Escrow & NIC Check",
      subtitle: "Safe digital verification & deposit protection",
      desc: "Authenticate securely with your Sri Lankan National NIC / Passport. Your refundable security deposit is held in LankaPay escrow and NEVER transferred directly to the host's personal account.",
      icon: <Lock className="w-6 h-6 text-emerald-400" />,
      badges: ["DRP NIC Verified", "LankaPay 14ms Escrow Switch"],
      highlight: "Funds protected until safe return.",
    },
    {
      step: "03",
      title: "Pickup & Instant Refund",
      subtitle: "Inspect condition and receive automatic deposit release",
      desc: "Perform a quick 2-minute digital condition inspection at pickup. Enjoy your rental, return the equipment on time, and your security deposit hold is automatically released back to your card within 2 to 4 hours.",
      icon: <RotateCcw className="w-6 h-6 text-emerald-400" />,
      badges: ["Digital Inspection Log", "Fast 2-4h Deposit Release"],
      highlight: "Guaranteed peer-to-peer peace of mind.",
    },
  ];

  const hostSteps = [
    {
      step: "01",
      title: "List Your Asset with AI",
      subtitle: "Take photos and generate pro rental descriptions",
      desc: "Upload 2 to 6 photos of your car, cinema camera, excavator, or power tools. Specify your daily rate and location. Click 'Generate with RentLanka AI' to automatically create an appealing, high-converting listing.",
      icon: <Upload className="w-6 h-6 text-emerald-400" />,
      badges: ["AI Description Copywriter", "Free Listing Verification"],
      highlight: "Set your own rates and rules.",
    },
    {
      step: "02",
      title: "Review & Approve Bookings",
      subtitle: "Screen verified renters and lock your rental calendar",
      desc: "Receive real-time booking requests from NIC-verified customers. Inspect their profile, verification badge, and rental dates. Accept the hire to automatically lock dates and trigger escrow deposit collection.",
      icon: <CalendarCheck className="w-6 h-6 text-emerald-400" />,
      badges: ["Renter NIC Background Check", "Conflict-Free Calendar"],
      highlight: "You have complete authority over who rents.",
    },
    {
      step: "03",
      title: "Get Paid Directly via LankaPay",
      subtitle: "Secure payout straight to your Sri Lankan bank",
      desc: "Hand over the item at your preferred hub. Once the rental concludes smoothly, your earnings are automatically wired directly into your Commercial Bank, Sampath, HNB, or BOC account via LankaPay CEFT.",
      icon: <CreditCard className="w-6 h-6 text-emerald-400" />,
      badges: ["LKR 1.5M Host Protection", "Same-Day Bank Settlement"],
      highlight: "Zero collection hassle or payment chasing.",
    },
  ];

  const faqs = [
    {
      q: "How does the LankaPay security deposit escrow work?",
      a: "When you request a rental, your security deposit is pre-authorized and locked inside LankaPay's protected escrow vault. It is never transferred to the host's personal bank account. Once you return the item and the host completes the digital handover check, the hold is automatically released back to your bank within 2-4 hours.",
    },
    {
      q: "What documents are required to rent equipment or vehicles?",
      a: "Renters must provide a valid Sri Lankan National Identity Card (NIC) or Passport for verification. For vehicles and motorcycles, a valid Sri Lankan Driving License is also required at pickup for verification against the Department of Motor Traffic standards.",
    },
    {
      q: "What happens if equipment gets damaged during a rental?",
      a: "Every transaction on RentLanka is covered by the RentLanka Host & Renter Protection Shield. Minor accidental wear is assessed transparently against the digital pickup photos. For major incidents, our claims dispute resolution team coordinates with our partnered insurance underwriters with coverage up to LKR 1,500,000.",
    },
    {
      q: "Can equipment be delivered across provinces (e.g., Colombo to Galle)?",
      a: "Yes! Many verified hosts offer islandwide courier delivery or specialized heavy transport (for excavators and 45kVA generators) to Matara, Galle, Kandy, and Jaffna. Delivery fees and handover hubs are clearly displayed on each listing's detail page.",
    },
    {
      q: "How and when do equipment hosts get paid?",
      a: "Hosts receive payouts directly via LankaPay CEFT to their registered Sri Lankan bank account (BOC, Commercial Bank, HNB, Sampath, etc.) upon successful equipment return and condition inspection verification.",
    },
  ];

  return (
    <div className="pt-24 pb-20 bg-surface min-h-screen">
      {/* Hero Section */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#022c22] via-[#006948] to-[#043328] text-white p-8 sm:p-14 overflow-hidden shadow-2xl border border-emerald-800/40 text-center">
          {/* Ambient Lighting */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-200 mb-4 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Sri Lanka&apos;s Most Trusted Peer Rental Protocol</span>
            </div>

            <h1 className="font-headline text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15] mb-4">
              How Renting Works on <span className="text-emerald-300">RentLanka</span>
            </h1>

            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed mb-8 max-w-2xl mx-auto">
              A seamless, transparent peer-to-peer ecosystem connecting verified equipment owners
              with high-trust renters across all 9 provinces. Powered by LankaPay Escrow and National NIC verification.
            </p>

            {/* Dual Flow Tab Switcher */}
            <div className="inline-flex p-1.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 shadow-lg">
              <button
                onClick={() => setActiveTab("renters")}
                className={`px-6 sm:px-8 py-3 rounded-xl font-headline text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === "renters"
                    ? "bg-[#006948] text-white shadow-md scale-100"
                    : "text-emerald-100 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>👤 For Renters</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">3 Steps</span>
              </button>
              <button
                onClick={() => setActiveTab("hosts")}
                className={`px-6 sm:px-8 py-3 rounded-xl font-headline text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === "hosts"
                    ? "bg-[#006948] text-white shadow-md scale-100"
                    : "text-emerald-100 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>💼 For Equipment Hosts</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">3 Steps</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Process Walkthrough Section */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            {activeTab === "renters" ? "Renter Journey" : "Host Monetization Flow"}
          </span>
          <h2 className="font-headline text-2xl sm:text-3xl font-black text-on-surface tracking-tight mt-2">
            {activeTab === "renters"
              ? "Simple 3-Step Process to Hire Any Gear"
              : "Monetize Idle Machinery & Vehicles with Zero Risk"}
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl mx-auto mt-1">
            {activeTab === "renters"
              ? "From road trips in Nuwara Eliya to commercial film shoots in Colombo, hire in minutes."
              : "Keep your capital equipment earning while maintaining full protection and insured custody."}
          </p>
        </div>

        {/* 3 Step Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(activeTab === "renters" ? renterSteps : hostSteps).map((step, idx) => (
            <div
              key={idx}
              className="relative rounded-3xl bg-white border border-surface-container-high/80 p-8 shadow-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Step Counter Top Bar */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#006948] text-white flex items-center justify-center shadow-md">
                    {step.icon}
                  </div>
                  <span className="font-headline text-3xl font-black text-slate-200">
                    {step.step}
                  </span>
                </div>

                <h3 className="font-headline text-xl font-bold text-on-surface mb-1">
                  {step.title}
                </h3>
                <p className="text-xs font-semibold text-primary mb-3">
                  {step.subtitle}
                </p>

                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-6">
                  {step.desc}
                </p>
              </div>

              {/* Badges & Key Highlight */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {step.badges.map((b, bIdx) => (
                    <span
                      key={bIdx}
                      className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2 py-0.5 rounded-md"
                    >
                      ✓ {b}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  <span>{step.highlight}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button for the active tab */}
        <div className="mt-10 text-center">
          {activeTab === "renters" ? (
            <button
              onClick={() => navigate("/explore")}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary hover:bg-primary-container text-white font-headline text-sm font-bold shadow-lg shadow-primary/20 hover:scale-102 transition-all"
            >
              <span>Explore Available Fleet Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => navigate("/list-your-item")}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary hover:bg-primary-container text-white font-headline text-sm font-bold shadow-lg shadow-primary/20 hover:scale-102 transition-all"
            >
              <span>Publish Your First Inventory Item</span>
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>
      </section>

      {/* Trust & Guarantee Standards Section */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-xl">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              The RentLanka Security Protocol
            </span>
            <h2 className="font-headline text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Built on Institutional-Grade Trust Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              We eliminated the risk of scams, damaged gear, and lost deposits through verified automated protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-headline font-bold text-sm text-white">DRP NIC Verification</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every renter and host identity is checked against National Identity databases before any handover occurs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="font-headline font-bold text-sm text-white">LankaPay Escrow Vault</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deposits remain locked in independent banking escrow, released instantly upon verified equipment check-in.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                <FileCheck className="w-5 h-5" />
              </div>
              <h4 className="font-headline font-bold text-sm text-white">Condition Handshake</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Time-stamped photo logs taken at pickup eliminate disputes over pre-existing scratches or mechanical wear.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-headline font-bold text-sm text-white">Islandwide Hubs</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Handover hubs in Colombo Metro, Galle Fort, Kandy City, and Matara with optional flatbed transport.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="max-w-[880px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-headline text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Everything you need to know about safety, payments, and peer rentals in Sri Lanka
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-headline font-bold text-sm text-on-surface hover:text-primary transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-on-surface-variant leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Help Banner */}
        <div className="mt-10 p-6 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="font-headline font-bold text-sm text-emerald-950">
              Have specific logistics or corporate rental inquiries?
            </h4>
            <p className="text-xs text-emerald-800 mt-0.5">
              Our 24/7 Colombo operations concierge is available via WhatsApp or phone.
            </p>
          </div>
          <a
            href="tel:+94783604911"
            className="px-5 py-2.5 rounded-xl bg-[#006948] text-white font-headline text-xs font-bold hover:bg-[#00855d] transition-colors shrink-0 shadow-sm"
          >
            Call +94 78 360 4911
          </a>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;
