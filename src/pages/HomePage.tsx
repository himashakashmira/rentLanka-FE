import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Item, Category } from "../types";
import { itemsApi, categoriesApi } from "../services/api";
import RentalCard from "../components/ui/RentalCard";
import { SearchableCitySelect } from "../components/common/SearchableCitySelect";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeRentalFilter, setActiveRentalFilter] = useState<string>("all");

  // Search widget state
  const [searchLocation, setSearchLocation] = useState<string>("colombo");
  const [searchCategory, setSearchCategory] = useState<string>("all");
  const [searchStartDate, setSearchStartDate] = useState<string>("2026-05-10");
  const [searchEndDate, setSearchEndDate] = useState<string>("2026-05-14");

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [itemsData, categoriesData] = await Promise.all([
          itemsApi.getAll(),
          categoriesApi.getAll(),
        ]);
        setItems(itemsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error loading home data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchLocation && searchLocation !== "all") query.append("location", searchLocation);
    if (searchCategory && searchCategory !== "all") query.append("category", searchCategory);
    if (searchStartDate) query.append("startDate", searchStartDate);
    if (searchEndDate) query.append("endDate", searchEndDate);
    navigate(`/explore?${query.toString()}`);
  };

  // Filter featured items by category pill
  const filteredFeaturedItems = items.filter((item) => {
    if (activeRentalFilter === "production") return item.category.toLowerCase().includes("camera");
    if (activeRentalFilter === "heavy") return item.category.toLowerCase().includes("construction") || item.category.toLowerCase().includes("tool");
    if (activeRentalFilter === "southern") return item.location.toLowerCase().includes("galle") || item.location.toLowerCase().includes("matara");
    return true;
  });

  const faqs = [
    {
      q: "What documents are required to rent equipment or vehicles in Sri Lanka?",
      a: "Sri Lankan citizens must present a valid National Identity Card (NIC) or Sri Lankan Driving License, verified through our automated DRP interface. For international travelers, an original passport along with an International Driving Permit (for vehicles) is required. Security deposits are held securely via LankaPay escrow.",
    },
    {
      q: "How does the security deposit escrow process operate (LankaPay)?",
      a: "When booking, the refundable deposit amount (e.g. LKR 20,000) is placed on a pre-authorized escrow hold using LankaPay switch or Visa/Mastercard. The funds remain locked in escrow until the host conducts an inspection upon return, after which the hold is automatically released within 2 hours.",
    },
    {
      q: "Can heavy machinery or cinema equipment be delivered to our production site?",
      a: "Yes. Most hosts in Western, Central, and Southern hubs offer delivery options ranging from standard van courier to heavy low-bed transporters for excavators and backhoes. Delivery fees are calculated transparently during the interactive checkout.",
    },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* 1. HERO SECTION WITH BESPOKE ANIMATED MESH CANVAS */}
      <section className="relative pt-24 pb-10 sm:pt-28 sm:pb-14 px-3 sm:px-6 lg:px-8 max-w-[1360px] mx-auto overflow-visible">
        {/* Deep Base Gradient Bento Canvas */}
        <div className="bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#0b1c30] rounded-3xl overflow-hidden relative shadow-2xl p-6 sm:p-10 lg:p-12 border border-emerald-500/25">
          {/* ========================================================================= */}
          {/* ANIMATED SVG FLOWING GRID LINES & PULSING RADIAL AMBIENT LIGHTS */}
          {/* ========================================================================= */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            {/* Animated SVG Flowing Grid Lines */}
            <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] opacity-20 pointer-events-none animate-grid-flow">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern
                    id="rentlanka-bespoke-mesh"
                    width="50"
                    height="50"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 50 0 L 0 0 0 50"
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="1"
                      strokeOpacity="0.45"
                    />
                    <circle cx="50" cy="0" r="1.5" fill="#10b981" fillOpacity="0.8" />
                    <circle cx="0" cy="50" r="1.5" fill="#14b8a6" fillOpacity="0.8" />
                  </pattern>
                  <linearGradient id="wave-sweep" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                    <stop offset="50%" stopColor="#34d399" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#rentlanka-bespoke-mesh)" />
                <path
                  d="M -200 150 Q 600 400 1600 150 T 3200 150"
                  fill="none"
                  stroke="url(#wave-sweep)"
                  strokeWidth="2"
                  opacity="0.6"
                />
                <path
                  d="M -200 350 Q 700 100 1600 350 T 3200 350"
                  fill="none"
                  stroke="url(#wave-sweep)"
                  strokeWidth="1.5"
                  opacity="0.4"
                />
              </svg>
            </div>

            {/* Pulsing Radial Ambient Lights (Emerald #10b981 & Cyan/Teal #14b8a6 with blur-90px) */}
            <div
              className="absolute -top-24 -left-20 w-[480px] h-[480px] rounded-full pointer-events-none animate-pulse-glow"
              style={{
                background:
                  "radial-gradient(circle, #10b981 0%, rgba(16, 185, 129, 0.4) 45%, transparent 70%)",
                filter: "blur(90px)",
              }}
            />
            <div
              className="absolute -bottom-28 -right-16 w-[520px] h-[520px] rounded-full pointer-events-none animate-pulse-glow-reverse"
              style={{
                background:
                  "radial-gradient(circle, #14b8a6 0%, rgba(20, 184, 166, 0.35) 50%, transparent 75%)",
                filter: "blur(90px)",
              }}
            />

            {/* Soft Radial Vignette */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, transparent 35%, rgba(2, 44, 34, 0.55) 85%)",
              }}
            />
          </div>

          {/* ========================================================================= */}
          {/* FOREGROUND CONTENT (HIGH CONTRAST & ORIGINAL BRAND IDENTITY) */}
          {/* ========================================================================= */}
          <div className="relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-8">
              {/* Left Column: Headline and Tagline */}
              <div className="lg:col-span-7 space-y-4">
                <h1 className="font-headline text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
                  Rent Anything. <br />
                  <span className="text-emerald-400 drop-shadow-[0_2px_16px_rgba(52,211,153,0.4)]">
                    Anywhere in Sri Lanka.
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-emerald-100/85 max-w-2xl leading-relaxed pt-1 font-normal">
                  From rugged 4x4 double cab Hiluxes for hill country passes to Sony FX6 4K cinema rigs,
                  Caterpillar 20-ton excavators, and event production sound gear across all 9 provinces. Pre-inspected, fully insured, backed by LankaPay escrow.
                </p>

                {/* Quick Trust Badges */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-xs font-semibold text-white shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>12,000+ Active Rentals</span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-xs font-semibold text-white shadow-xs">
                    <span className="material-symbols-outlined text-emerald-400 text-[16px]">verified_user</span>
                    <span>LankaPay Escrow Protection</span>
                  </div>
                </div>
              </div>

              {/* Right Column Visual Bento Showcase Container */}
              <div className="lg:col-span-5 relative">
                {/* Showcase Card */}
                <div className="relative rounded-3xl overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-3.5 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(16,185,129,0.25)] group">
                  {/* Vehicle Showcase Image */}
                  <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden bg-emerald-950/60">
                    <img
                      src="https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1000&q=80"
                      alt="Toyota Land Cruiser Prado TX / Hilux 4x4 Luxury Rental"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                    {/* Top-Left: Live Availability Beacon */}
                    <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-emerald-500/30 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[11px] font-bold text-white uppercase tracking-wide">
                        Available in Colombo
                      </span>
                    </div>

                    {/* Top-Right: Floating 4.9★ Rating Badge */}
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md border border-white/60 animate-float-slow">
                      <span className="text-amber-500 text-xs font-bold">★</span>
                      <span className="text-xs font-extrabold text-slate-900">4.9</span>
                      <span className="text-[10px] text-slate-500 font-medium">(142 reviews)</span>
                    </div>

                    {/* Bottom Information Overlay */}
                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between text-white">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                          Featured Fleet
                        </span>
                        <h4 className="font-headline font-bold text-base sm:text-lg leading-tight text-white drop-shadow-sm">
                          Toyota Land Cruiser Prado TX
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-emerald-200/80 block">From</span>
                        <span className="font-headline font-extrabold text-sm sm:text-base text-white">
                          LKR 28,000<span className="text-xs font-normal text-emerald-200/80">/day</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Floating Verified Host Guarantee Card */}
                  <div className="mt-3 bg-black/25 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 shrink-0">
                        <span className="material-symbols-outlined text-[20px]">shield</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">
                          🛡️ Verified Host Guarantee
                        </p>
                        <p className="text-[11px] text-emerald-200/75">
                          LKR 1.5M Comprehensive Cover • LankaPay Escrow
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase tracking-wide shrink-0 border border-emerald-500/30">
                      Inspected
                    </span>
                  </div>
                </div>

                {/* Floating Ambient Proof Cards Stack */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl p-3 rounded-2xl border border-white/15 shadow-xs animate-float-slow text-white">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-bold shadow-xs shrink-0">
                      <span className="material-symbols-outlined text-[20px]">group</span>
                    </div>
                    <div>
                      <p className="font-headline text-base text-white font-extrabold leading-tight">
                        12,000+
                      </p>
                      <p className="text-[11px] text-emerald-100/70 font-medium">
                        Verified Renters
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl p-3 rounded-2xl border border-white/15 shadow-xs animate-float-reverse text-white">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300 font-bold shadow-xs shrink-0">
                      <span className="material-symbols-outlined text-[20px]">lock</span>
                    </div>
                    <div>
                      <p className="font-headline text-base text-white font-extrabold leading-tight">
                        100% Escrow
                      </p>
                      <p className="text-[11px] text-emerald-100/70 font-medium">
                        LankaPay Handshake
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FLOATING GLASSMORPHIC SEARCH WIDGET */}
            <div className="w-full bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-3.5 sm:p-5 mt-6 sm:mt-8">
              <form
                onSubmit={handleSearchSubmit}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center"
              >
                {/* Pickup Hub */}
                <div className="lg:col-span-3 bg-black/30 hover:bg-black/40 transition-colors rounded-2xl px-4 py-3 border border-white/15 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20">
                  <SearchableCitySelect
                    variant="darkHero"
                    value={searchLocation}
                    onChange={(city) => setSearchLocation(city)}
                    allowAll
                    allLabel="All Sri Lanka"
                    placeholder="Select pickup city"
                  />
                </div>

                {/* Rental Type */}
                <div className="lg:col-span-3 bg-black/30 hover:bg-black/40 transition-colors rounded-2xl px-4 py-3 flex items-center gap-3 border border-white/15 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20">
                  <span className="material-symbols-outlined text-emerald-400 text-[22px]">category</span>
                  <div className="w-full min-w-0">
                    <label
                      htmlFor="search-category"
                      className="block text-[10px] font-bold uppercase tracking-wider text-emerald-200/80"
                    >
                      Rental Type
                    </label>
                    <select
                      id="search-category"
                      value={searchCategory}
                      onChange={(e) => setSearchCategory(e.target.value)}
                      className="w-full bg-transparent font-headline text-xs sm:text-sm font-bold text-white focus:outline-none cursor-pointer [color-scheme:dark]"
                    >
                      <option value="Vehicles" className="bg-slate-900 text-white">Vehicles & SUVs</option>
                      <option value="Cameras" className="bg-slate-900 text-white">Cameras & Cine Gear</option>
                      <option value="Construction" className="bg-slate-900 text-white">Heavy Machinery</option>
                      <option value="Tools & Machinery" className="bg-slate-900 text-white">Power Tools & Gensets</option>
                      <option value="Motorcycles" className="bg-slate-900 text-white">Motorcycles & Scooters</option>
                      <option value="all" className="bg-slate-900 text-white">Everything</option>
                    </select>
                  </div>
                </div>

                {/* Dates */}
                <div className="lg:col-span-4 bg-black/30 hover:bg-black/40 transition-colors rounded-2xl px-4 py-3 grid grid-cols-2 gap-2 border border-white/15 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20">
                  <div>
                    <label
                      htmlFor="search-start"
                      className="block text-[10px] font-bold uppercase tracking-wider text-emerald-200/80"
                    >
                      From
                    </label>
                    <input
                      id="search-start"
                      type="date"
                      value={searchStartDate}
                      onChange={(e) => setSearchStartDate(e.target.value)}
                      className="w-full bg-transparent font-headline text-xs sm:text-sm font-bold text-white focus:outline-none cursor-pointer [color-scheme:dark]"
                    />
                  </div>
                  <div className="border-l border-white/15 pl-2">
                    <label
                      htmlFor="search-end"
                      className="block text-[10px] font-bold uppercase tracking-wider text-emerald-200/80"
                    >
                      Until
                    </label>
                    <input
                      id="search-end"
                      type="date"
                      value={searchEndDate}
                      onChange={(e) => setSearchEndDate(e.target.value)}
                      className="w-full bg-transparent font-headline text-xs sm:text-sm font-bold text-white focus:outline-none cursor-pointer [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* Search Button */}
                <div className="lg:col-span-2 w-full h-full flex">
                  <button
                    type="submit"
                    className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-headline text-sm font-extrabold flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(16,185,129,0.45)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.6)] btn-press"
                  >
                    <span className="material-symbols-outlined text-[20px]">search</span>
                    Search Gear
                  </button>
                </div>
              </form>
            </div>

            {/* Value Prop Micro Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs text-emerald-100/75 font-medium">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
                <span>100% Inspected Machinery</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">security</span>
                <span>LKR 1.5M Damage Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">account_balance_wallet</span>
                <span>Automated Escrow Holds</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">local_shipping</span>
                <span>Islandwide Courier / Pickup</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EXPLORE BY SRI LANKAN EQUIPMENT CATEGORY (8 CURATED CARDS) */}
      <section id="categories" className="py-14 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface">
              Explore by Sri Lankan Equipment Category
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              Browse all 18 sub-categories backed by certified Ceylon technical checklists.
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs font-bold font-headline text-primary hover:text-primary-container flex items-center gap-1 shrink-0"
          >
            Browse all 18 sub-categories
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat, idx) => (
            <Link
              key={cat._id || idx}
              to={`/explore?category=${encodeURIComponent(cat.name)}`}
              className="group p-5 rounded-2xl bg-white border border-surface-container-high/80 hover:border-primary/50 shadow-card card-hover-lift flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-surface-container-low group-hover:bg-primary-fixed text-primary group-hover:text-on-primary-fixed flex items-center justify-center transition-colors shadow-xs">
                  <span className="material-symbols-outlined text-[24px]">{cat.icon}</span>
                </div>
                <span className="text-[11px] font-bold font-headline px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant group-hover:bg-primary-fixed group-hover:text-on-primary-fixed transition-colors">
                  {cat.count}
                </span>
              </div>
              <div>
                <h3 className="font-headline text-sm sm:text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-on-surface-variant line-clamp-1 mt-1">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED RENTALS AVAILABLE NOW */}
      <section className="py-14 bg-surface-container-low/40 border-t border-b border-surface-container-high/60">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface">
                Featured Rentals Available Now
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                Direct owner handovers available with LankaPay escrow protection across all 9 provinces.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto text-xs font-headline font-bold">
              {[
                { id: "all", label: "All Equipment" },
                { id: "production", label: "Production" },
                { id: "heavy", label: "Heavy" },
                { id: "southern", label: "Southern Fleet" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setActiveRentalFilter(pill.id)}
                  className={`px-3.5 py-1.5 rounded-full transition-all ${
                    activeRentalFilter === pill.id
                      ? "bg-primary text-white shadow-xs"
                      : "bg-white text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-surface-container animate-pulse h-80 border border-surface-container"
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFeaturedItems.slice(0, 6).map((item) => (
                <RentalCard key={item._id || item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. HOST EARNINGS BANNER */}
      <section className="py-14 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-3">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold font-headline uppercase tracking-wider bg-emerald-500/20 text-emerald-400">
                RentLanka Host Guarantee
              </span>
              <h3 className="font-headline text-2xl sm:text-4xl font-black leading-tight">
                Earn up to LKR 250,000/mo renting out idle equipment & vehicles
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Every rental is protected with NIC identity screening, security deposits held via
                LankaPay escrow, and comprehensive damage coverage.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center items-start lg:items-end">
              <Link
                to="/list-your-item"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-container text-white font-headline font-bold text-xs shadow-lg active:scale-95 transition-all text-center flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">payments</span>
                Calculate Your Earnings
              </Link>
              <Link
                to="/explore"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-headline font-bold text-xs transition-all text-center"
              >
                Host Guidelines
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRIME RENTAL HUBS ACROSS SRI LANKA (4 MAP CARDS) */}
      <section className="py-12 bg-white border-t border-b border-surface-container-high/60">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface">
              Prime Rental Hubs Across Sri Lanka
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              Instant handovers or direct dispatch within designated provincial centers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                name: "Colombo District",
                region: "Western Gateway",
                assets: "820+ assets",
                desc: "High density of heavy vehicles, cinema gear, and generator sets with 24/7 courier dispatch.",
                mapBg: "from-blue-500/10 to-teal-500/10",
              },
              {
                name: "Kandy & Highlands",
                region: "Central Province",
                assets: "340+ assets",
                desc: "4x4 Hiluxes and excavators tailored for plantation estates, mountain transit, and resort builds.",
                mapBg: "from-emerald-500/10 to-green-500/10",
              },
              {
                name: "Galle & Matara",
                region: "Southern Coast",
                assets: "280+ assets",
                desc: "Coastal camera gear, adventure touring bikes, sound stages, and marine equipment.",
                mapBg: "from-cyan-500/10 to-blue-500/10",
              },
              {
                name: "Negombo & Katunayake",
                region: "Airport Corridor",
                assets: "190+ assets",
                desc: "Immediate airport delivery for arriving film crews, heavy generator backups, and cargo haulers.",
                mapBg: "from-indigo-500/10 to-purple-500/10",
              },
            ].map((hub, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-surface-container p-5 bg-surface-container-lowest shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
                      {hub.region}
                    </span>
                    <span className="text-[10px] font-bold font-headline px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                      {hub.assets}
                    </span>
                  </div>
                  <h3 className="font-headline text-base font-bold text-on-surface mb-1">
                    {hub.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {hub.desc}
                  </p>
                </div>

                <Link
                  to={`/explore?location=${encodeURIComponent(hub.name.split(" ")[0].toLowerCase())}`}
                  className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-xs font-bold text-primary hover:text-primary-container"
                >
                  <span>Explore Regional Hub</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOW RENTING ON RENTLANKA WORKS (3 NUMBERED STEPS) */}
      <section id="how-it-works" className="py-16 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[10px] font-bold font-headline uppercase tracking-wider text-primary">
            Quick 3-Step Handshake Protocol
          </span>
          <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface mt-1">
            How Renting on RentLanka Works
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1.5">
            From booking and escrow verification to physical handover with complete peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              num: "01",
              title: "Search & Reserve Online",
              desc: "Filter through thousands of pre-inspected items by hub, date availability, and specifications. Lock in your dates directly with instant booking approvals.",
            },
            {
              num: "02",
              title: "NIC Verification & Escrow",
              desc: "Verify via Sri Lankan NIC or passport in 45 seconds. Security deposits are held securely in a LankaPay escrow account and never released until your safe return.",
            },
            {
              num: "03",
              title: "Pickup, Deliver & Return",
              desc: "Meet the host safely at their designated hub or request direct site delivery to your job site. Inspect 2-minute checklist on our app, use the item, and get prompt refund of deposit.",
            },
          ].map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-surface-container shadow-xs space-y-3"
            >
              <span className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-headline text-sm font-bold shadow-xs">
                {step.num}
              </span>
              <h3 className="font-headline text-base font-bold text-on-surface">
                {step.title}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. TRUST STATISTICS ACROSS 9 PROVINCES */}
      <section className="py-12 bg-surface-container-low/50 border-t border-b border-surface-container-high/60">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <p className="font-headline text-3xl sm:text-4xl font-black text-on-surface">99.8%</p>
              <p className="text-xs text-on-surface-variant font-medium mt-1">Incident-Free Rentals</p>
            </div>
            <div>
              <p className="font-headline text-3xl sm:text-4xl font-black text-primary">&lt; 18 min</p>
              <p className="text-xs text-on-surface-variant font-medium mt-1">Fast Dispatch Turnaround</p>
            </div>
            <div>
              <p className="font-headline text-3xl sm:text-4xl font-black text-on-surface">4.92 / 5</p>
              <p className="text-xs text-on-surface-variant font-medium mt-1">Average Ceylon Host Rating</p>
            </div>
            <div>
              <p className="font-headline text-3xl sm:text-4xl font-black text-primary">100%</p>
              <p className="text-xs text-on-surface-variant font-medium mt-1">LankaPay Escrow Compliance</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FREQUENTLY ASKED QUESTIONS (ACCORDION) */}
      <section className="py-16 max-w-[900px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface">
            Frequently Asked Rental Questions
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Need help with long-term rentals or custom fleet requirements in Sri Lanka?
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-surface-container overflow-hidden shadow-xs"
            >
              <button
                type="button"
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-headline text-sm font-bold text-on-surface hover:text-primary transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant shrink-0">
                  {openFaqIndex === idx ? "expand_less" : "expand_more"}
                </span>
              </button>
              {openFaqIndex === idx && (
                <div className="px-5 pb-5 pt-0 text-xs text-on-surface-variant leading-relaxed border-t border-surface-container/60 animate-modal-enter">
                  <div className="pt-3">{faq.a}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
