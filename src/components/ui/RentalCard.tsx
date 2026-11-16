import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Item } from "../../types";

interface RentalCardProps {
  item: Item;
}

export const RentalCard: React.FC<RentalCardProps> = ({ item }) => {
  const isAvailable = item.is_available;
  const itemId = item._id || item.id;
  const [isSaved, setIsSaved] = useState(false);

  return (
    <div className="group relative rounded-2xl bg-white border border-surface-container-high/80 overflow-hidden shadow-card card-hover-lift flex flex-col justify-between">
      <div>
        {/* Image Container with Zoom */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-container">
          <img
            src={
              item.image_url ||
              "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80"
            }
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80";
            }}
          />

          {/* Gradient Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15 pointer-events-none"></div>

          {/* Top Left: Pulsing Live Status Pill */}
          <div className="absolute top-3 left-3">
            {isAvailable ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-headline bg-white/95 backdrop-blur-md text-primary shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Available Today
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-headline bg-slate-900/85 backdrop-blur-md text-amber-300 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                Booked • Available May 02
              </span>
            )}
          </div>

          {/* Top Right: Bookmark / Save button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsSaved(!isSaved);
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-on-surface hover:text-rose-500 shadow-sm transition-colors"
            aria-label="Save rental"
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                isSaved ? "text-rose-500" : "text-on-surface-variant"
              }`}
              style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>

          {/* Bottom Left on Image: Location Hub */}
          <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-white text-xs font-semibold drop-shadow-md">
            <span className="material-symbols-outlined text-[15px] text-emerald-300">location_on</span>
            <span>{item.location} Hub</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5">
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              {item.category}
            </span>

            <div className="flex items-center gap-1 text-amber-500">
              <span
                className="material-symbols-outlined text-[16px] font-bold"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span className="font-headline text-xs font-bold text-on-surface">
                {item.rating || 4.9}
              </span>
              <span className="text-[10px] text-on-surface-variant">
                ({item.reviews_count || 24})
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-headline text-base font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1 mb-1">
            {item.title}
          </h3>

          {/* Specs / Features snippet */}
          <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-4">
            {item.description || "Fully inspected Ceylon rental equipment ready for dispatch with escrow protection."}
          </p>
        </div>
      </div>

      {/* Card Footer: LKR Price & Action Button */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 border-t border-surface-container-high/60 flex items-center justify-between gap-3 mt-auto">
        <div className="pt-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant block">
            Daily Hire
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-bold text-primary font-headline">LKR</span>
            <span className="font-headline text-lg sm:text-xl font-black text-on-surface">
              {Number(item.price_per_day).toLocaleString()}
            </span>
            <span className="text-[11px] text-on-surface-variant font-medium">/ day</span>
          </div>
        </div>

        <Link
          to={`/rentals/${itemId}`}
          className={`mt-3 inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl font-headline text-xs font-bold transition-all shadow-xs btn-press ${
            isAvailable
              ? "bg-primary text-white hover:bg-primary-container shadow-[0_4px_12px_rgba(0,105,72,0.25)]"
              : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
          }`}
        >
          {isAvailable ? "Book Now" : "Details"}
          <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
};

export default RentalCard;
