import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  Bike,
  Camera,
  Hammer,
  Zap,
  Volume2,
  Tent,
  Armchair,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Search,
  CheckCircle2,
} from "lucide-react";
import { itemsApi } from "../services/api";
import { Item } from "../types";

interface CategoryCard {
  id: string;
  name: string;
  queryParam: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  imageUrl: string;
  badge: string;
  colorScheme: string;
  accentBg: string;
  sampleItems: string[];
  startingPrice: string;
}

const CATEGORIES: CategoryCard[] = [
  {
    id: "vehicles",
    name: "Vehicles & SUVs",
    queryParam: "Vehicles",
    tagline: "Prados, Double Cabs, Sedans, Vans",
    description:
      "All-wheel drive 4x4 SUVs, luxury passenger vans, and economical sedans inspected for rugged Sri Lankan hill country journeys.",
    icon: <Car className="w-6 h-6 text-emerald-400" />,
    imageUrl:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    badge: "Highest Demand",
    colorScheme: "from-emerald-950/80 via-emerald-900/60 to-transparent",
    accentBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    sampleItems: ["Toyota Land Cruiser Prado", "Hilux Revo Double Cab", "Toyota KDH Van", "Prius / Axio"],
    startingPrice: "LKR 12,500/day",
  },
  {
    id: "motorcycles",
    name: "Motorcycles & Scooters",
    queryParam: "Motorcycles",
    tagline: "Bikes, Scooters, Adventure Touring",
    description:
      "Dual-sport adventure motorbikes, city commuter scooters, and high-displacement touring bikes for Southern coast and mountain roads.",
    icon: <Bike className="w-6 h-6 text-sky-400" />,
    imageUrl:
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
    badge: "Quick Turnaround",
    colorScheme: "from-sky-950/80 via-sky-900/60 to-transparent",
    accentBg: "bg-sky-50 text-sky-700 border-sky-200",
    sampleItems: ["Honda CB500X", "Yamaha Tenere 700", "Vespa 150 Sprint", "Royal Enfield Classic"],
    startingPrice: "LKR 3,500/day",
  },
  {
    id: "cameras",
    name: "Cameras & Cine Gear",
    queryParam: "Cameras",
    tagline: "Sony FX, RED, G-Master Lenses",
    description:
      "Commercial 4K/8K cinema rigs, full-frame mirrorless cameras, prime cinema lenses, wireless mics, and heavy-duty gimbals.",
    icon: <Camera className="w-6 h-6 text-purple-400" />,
    imageUrl:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
    badge: "Production Ready",
    colorScheme: "from-purple-950/80 via-purple-900/60 to-transparent",
    accentBg: "bg-purple-50 text-purple-700 border-purple-200",
    sampleItems: ["Sony FX6 Cinema Line", "Sony FX3 Rig Kit", "GM II 24-70mm & 70-200mm", "DJI RS3 Pro Gimbal"],
    startingPrice: "LKR 18,000/day",
  },
  {
    id: "construction",
    name: "Heavy Machinery",
    queryParam: "Construction",
    tagline: "JCB Backhoes, Excavators, Mixers",
    description:
      "Certified civil engineering equipment, 20-ton excavators, concrete pumps, and backhoe loaders with certified operator hire options.",
    icon: <Hammer className="w-6 h-6 text-amber-400" />,
    imageUrl:
      "https://images.unsplash.com/photo-1579847188804-ecba0e2ea330?auto=format&fit=crop&w=800&q=80",
    badge: "Industrial Grade",
    colorScheme: "from-amber-950/80 via-amber-900/60 to-transparent",
    accentBg: "bg-amber-50 text-amber-700 border-amber-200",
    sampleItems: ["CAT 320D 20T Excavator", "JCB 3DX Eco Backhoe", "Self-Loading Concrete Mixer", "Road Roller 10T"],
    startingPrice: "LKR 38,000/day",
  },
  {
    id: "tools",
    name: "Power Tools & Generators",
    queryParam: "Tools & Machinery",
    tagline: "Silent Diesel Gensets, Drills",
    description:
      "High-output silent three-phase diesel generators, demolition jackhammers, high-pressure washers, and cordless rotary hammer sets.",
    icon: <Zap className="w-6 h-6 text-yellow-400" />,
    imageUrl:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
    badge: "24/7 Island Power",
    colorScheme: "from-yellow-950/80 via-yellow-900/60 to-transparent",
    accentBg: "bg-yellow-50 text-yellow-700 border-yellow-200",
    sampleItems: ["45kVA Silent Cummins Genset", "Bosch Pro Jackhammer", "DeWalt 18V Brushless Combo", "Kärcher Pro Washer"],
    startingPrice: "LKR 6,500/day",
  },
  {
    id: "events",
    name: "Audio & Event Lighting",
    queryParam: "Events",
    tagline: "Stage Truss, Line Arrays, Mics",
    description:
      "Concert-grade line array sound systems, moving beam lights, wireless Shure microphones, aluminum stage trusses, and LED video walls.",
    icon: <Volume2 className="w-6 h-6 text-pink-400" />,
    imageUrl:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
    badge: "Festivals & Concerts",
    colorScheme: "from-pink-950/80 via-pink-900/60 to-transparent",
    accentBg: "bg-pink-50 text-pink-700 border-pink-200",
    sampleItems: ["JBL VTX Line Array System", "Beam 230W Moving Heads", "Shure QLX-D Wireless Sets", "P3.91 LED Video Wall"],
    startingPrice: "LKR 22,000/day",
  },
  {
    id: "outdoor",
    name: "Outdoor & Adventure",
    queryParam: "Outdoor",
    tagline: "Roof Tents, 4-Season Tents, Surfboards",
    description:
      "Hard-shell rooftop vehicle tents, hiking packs, expedition cooking gear, and high-performance surfboards for Weligama and Arugam Bay.",
    icon: <Tent className="w-6 h-6 text-teal-400" />,
    imageUrl:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
    badge: "Eco Adventure",
    colorScheme: "from-teal-950/80 via-teal-900/60 to-transparent",
    accentBg: "bg-teal-50 text-teal-700 border-teal-200",
    sampleItems: ["iKamper Rooftop 4-Person Tent", "MSR 3-Person All-Weather Tent", "Torq 7'2 Surfboard", "Garmin InReach GPS"],
    startingPrice: "LKR 4,500/day",
  },
  {
    id: "furniture",
    name: "Furniture & Staging",
    queryParam: "Furniture",
    tagline: "Event Seating, Wedding Stages",
    description:
      "Banquet Chiavari chairs, modular wedding stages, marquees, lounge sofas, and exhibition display partitions with on-site setup teams.",
    icon: <Armchair className="w-6 h-6 text-indigo-400" />,
    imageUrl:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    badge: "Banquet & Weddings",
    colorScheme: "from-indigo-950/80 via-indigo-900/60 to-transparent",
    accentBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    sampleItems: ["Gold Chiavari Chairs (500x)", "24x16 Modular Event Stage", "Canopy Marquee 40x20", "Chesterfield VIP Sofas"],
    startingPrice: "LKR 15,000/day",
  },
];

export const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [searchFilter, setSearchFilter] = useState<string>("");

  useEffect(() => {
    // Scroll to top on page mount
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Fetch live items to display real MongoDB counts
    const fetchInventory = async () => {
      try {
        const data = await itemsApi.getAll();
        setItems(data);
      } catch (err) {
        console.error("Failed to load inventory counts:", err);
      }
    };
    fetchInventory();
  }, []);

  // Helper to count active items for each category
  const getItemCount = (queryParam: string): number => {
    return items.filter(
      (item) =>
        item.category.toLowerCase().includes(queryParam.toLowerCase()) ||
        queryParam.toLowerCase().includes(item.category.toLowerCase())
    ).length;
  };

  const filteredCategories = CATEGORIES.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      cat.tagline.toLowerCase().includes(searchFilter.toLowerCase()) ||
      cat.sampleItems.some((s) => s.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="pt-24 pb-20 bg-surface min-h-screen">
      {/* Top Banner / Hero Header */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#022c22] via-[#006948] to-[#043328] text-white p-8 sm:p-14 overflow-hidden shadow-2xl border border-emerald-800/40">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-10 w-80 h-80 bg-teal-300/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-200 mb-4 shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Sri Lanka&apos;s Verified Asset Directory</span>
            </div>

            <h1 className="font-headline text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15] mb-4">
              Browse Sri Lanka&apos;s <br />
              <span className="text-emerald-300">Complete Rental Inventory</span>
            </h1>

            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed mb-8 max-w-2xl">
              Choose from 8 inspected categories across vehicles, cinema gear, and heavy plant.
              Every listing is pre-inspected, identity-verified, and protected by LankaPay escrow holds.
            </p>

            {/* Quick In-Page Category Filter */}
            <div className="flex items-center bg-white/15 backdrop-blur-md rounded-2xl border border-white/25 px-4 py-2.5 max-w-lg shadow-inner">
              <Search className="w-5 h-5 text-emerald-200 mr-3 shrink-0" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter by keyword (e.g. Prado, FX6, Genset, Excavator)..."
                className="w-full bg-transparent text-sm text-white placeholder-emerald-200/70 outline-none"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter("")}
                  className="text-xs text-emerald-200 hover:text-white px-2 py-1 rounded bg-black/20"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 8-Category Interactive Bento Grid */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-headline text-xl sm:text-2xl font-black text-on-surface tracking-tight">
              All 8 Rental Sectors
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-1">
              Select any category to view live available gear and instant booking calendars
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Escrow Backed</span>
          </div>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
            <p className="text-base font-bold text-slate-700">No categories matching &quot;{searchFilter}&quot;</p>
            <p className="text-xs text-slate-500 mt-1">Try searching for generic terms like &quot;SUV&quot;, &quot;Camera&quot;, or &quot;Tent&quot;.</p>
            <button
              onClick={() => setSearchFilter("")}
              className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container"
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCategories.map((cat) => {
              const liveCount = getItemCount(cat.queryParam);
              const displayCount = liveCount > 0 ? `${liveCount} Live in Fleet` : "Available On-Demand";

              return (
                <div
                  key={cat.id}
                  onClick={() => navigate(`/explore?category=${encodeURIComponent(cat.queryParam)}`)}
                  className="group relative rounded-3xl bg-white border border-surface-container-high/80 overflow-hidden shadow-card hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  {/* Photo Container with subtle zoom */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                    {/* Badge top-left */}
                    <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-md text-slate-900 shadow-sm border border-white/40">
                        {cat.badge}
                      </span>
                    </div>

                    {/* Icon Top Right */}
                    <div className="absolute top-3.5 right-3.5 w-10 h-10 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-md">
                      {cat.icon}
                    </div>

                    {/* Bottom overlay: Starting price & live fleet count */}
                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white text-xs font-bold">
                      <span className="bg-[#006948] px-2.5 py-1 rounded-lg text-[11px] shadow-sm">
                        {displayCount}
                      </span>
                      <span className="text-emerald-300 drop-shadow-sm text-[11px]">
                        From {cat.startingPrice}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-headline text-lg font-bold text-on-surface group-hover:text-primary transition-colors flex items-center justify-between">
                        <span>{cat.name}</span>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </h3>

                      <p className="text-xs font-semibold text-primary mt-0.5">
                        {cat.tagline}
                      </p>

                      <p className="text-xs text-on-surface-variant/80 mt-2.5 leading-relaxed line-clamp-2">
                        {cat.description}
                      </p>
                    </div>

                    {/* Sample items pill tags */}
                    <div className="mt-4 pt-3.5 border-t border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Popular in Sri Lanka:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.sampleItems.slice(0, 3).map((item, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 px-2 py-0.5 rounded-md transition-colors"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="rounded-3xl bg-surface-container-low border border-surface-container-high p-8 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>National Safety Protocols</span>
            </div>
            <h3 className="font-headline text-2xl font-black text-on-surface tracking-tight">
              Looking to monetize equipment or vehicles you already own?
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              RentLanka allows verified equipment owners, production houses, and car fleets to list inventory safely with complete identity verification, LankaPay escrow holds, and damage cover up to LKR 1.5 Million.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => navigate("/list-your-item")}
              className="px-6 py-3.5 rounded-2xl bg-primary hover:bg-primary-container text-white font-headline text-sm font-bold shadow-[0_4px_14px_rgba(0,105,72,0.28)] transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>List Your Item</span>
            </button>
            <button
              onClick={() => navigate("/explore")}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-on-surface font-headline text-sm font-bold transition-all flex items-center justify-center"
            >
              <span>Explore All Listings</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoriesPage;
