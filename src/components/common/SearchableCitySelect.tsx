import React, { useState, useRef, useEffect, useMemo } from "react";
import { SRI_LANKAN_CITIES, SriLankanCity } from "../../data/sriLankanCities";

export interface SearchableCitySelectProps {
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
  allowAll?: boolean;
  allLabel?: string;
  label?: string;
  required?: boolean;
  error?: string;
  id?: string;
  className?: string;
  variant?: "default" | "hero" | "filter" | "darkHero";
  helperText?: string;
}

export const SearchableCitySelect: React.FC<SearchableCitySelectProps> = ({
  value,
  onChange,
  placeholder = "Select dispatch hub / city",
  allowAll = false,
  allLabel = "All Sri Lanka",
  label,
  required = false,
  error,
  id = "searchable-city-select",
  className = "",
  variant = "default",
  helperText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Auto-focus search input when opening
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Filter cities based on search query
  const filteredCities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SRI_LANKAN_CITIES;

    return SRI_LANKAN_CITIES.filter((city) => {
      if (city.name.toLowerCase().includes(q)) return true;
      if (city.province.toLowerCase().includes(q)) return true;
      if (city.region && city.region.toLowerCase().includes(q)) return true;
      if (city.keywords && city.keywords.some((kw) => kw.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [searchQuery]);

  // Resolve display name for current value
  const displayValue = useMemo(() => {
    if (!value || value === "all" || value === "All") {
      return allowAll ? allLabel : "";
    }
    // Match exact name or partial case-insensitive
    const match = SRI_LANKAN_CITIES.find(
      (c) =>
        c.name.toLowerCase() === value.toLowerCase() ||
        value.toLowerCase().includes(c.name.toLowerCase())
    );
    return match ? match.name : value;
  }, [value, allowAll, allLabel]);

  const handleSelectCity = (cityName: string) => {
    onChange(cityName);
    setIsOpen(false);
  };

  const handleSelectAll = () => {
    onChange("all");
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(allowAll ? "all" : "");
  };

  // Keyboard navigation on input
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCities.length > 0) {
        handleSelectCity(filteredCities[0].name);
      } else if (allowAll && searchQuery.toLowerCase().includes("all")) {
        handleSelectAll();
      }
    }
  };

  const isAllSelected = allowAll && (!value || value === "all" || value === "All");

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Optional Label (outside) */}
      {label && variant === "default" && (
        <label htmlFor={id} className="block text-xs font-bold text-on-surface mb-1">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}

      {/* ========================================================================= */}
      {/* TRIGGER BUTTON (VARIANT-SPECIFIC) */}
      {/* ========================================================================= */}

      {/* 1. HERO VARIANT (HomePage Hero Glassmorphic Search Bar) */}
      {variant === "hero" || variant === "darkHero" ? (
        <div
          role="button"
          tabIndex={0}
          id={id}
          onClick={() => setIsOpen((prev) => !prev)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpen((prev) => !prev);
            }
          }}
          className="w-full flex items-center gap-3 text-left cursor-pointer select-none group"
        >
          <span
            className={`material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform shrink-0 ${
              variant === "darkHero" ? "text-emerald-400" : "text-primary"
            }`}
          >
            pin_drop
          </span>
          <div className="w-full min-w-0 pr-1">
            <span
              className={`block text-[10px] font-bold uppercase tracking-wider ${
                variant === "darkHero" ? "text-emerald-200/80" : "text-on-surface-variant"
              }`}
            >
              Pickup Hub
            </span>
            <div className="flex items-center justify-between gap-1">
              <span
                className={`truncate font-headline text-xs sm:text-sm font-bold ${
                  variant === "darkHero"
                    ? displayValue
                      ? "text-white"
                      : "text-emerald-100/60"
                    : displayValue
                    ? "text-on-surface"
                    : "text-slate-400"
                }`}
              >
                {displayValue || placeholder}
              </span>
              <span
                className={`material-symbols-outlined text-[18px] shrink-0 transition-colors ${
                  variant === "darkHero"
                    ? "text-emerald-300 group-hover:text-emerald-100"
                    : "text-on-surface-variant group-hover:text-primary"
                }`}
              >
                {isOpen ? "expand_less" : "expand_more"}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* 2. FILTER VARIANT (ExplorePage Filter Bar) */}
      {variant === "filter" && (
        <button
          type="button"
          id={id}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-surface-container-low border transition-all text-left ${
            isOpen
              ? "border-primary ring-2 ring-primary/20 bg-white"
              : "border-surface-container hover:border-outline hover:bg-surface-container"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 truncate">
            <span className="material-symbols-outlined text-primary text-[18px] shrink-0">
              location_on
            </span>
            <span
              className={`text-sm font-semibold truncate ${
                displayValue ? "text-on-surface" : "text-on-surface-variant"
              }`}
            >
              {displayValue || placeholder}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {displayValue && displayValue !== allLabel && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                className="text-on-surface-variant hover:text-error p-0.5 rounded-full hover:bg-surface-container"
                title="Reset location"
              >
                <span className="material-symbols-outlined text-[16px] block">close</span>
              </span>
            )}
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
              {isOpen ? "expand_less" : "arrow_drop_down"}
            </span>
          </div>
        </button>
      )}

      {/* 3. DEFAULT FORM INPUT VARIANT (ListItemPage, Forms) */}
      {variant === "default" && (
        <button
          type="button"
          id={id}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-surface-container-low border text-xs text-left cursor-pointer transition-all ${
            isOpen ? "border-primary ring-2 ring-primary/20 bg-white" : ""
          } ${
            error
              ? "border-error ring-1 ring-error bg-red-50/20"
              : "border-surface-container hover:border-outline"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 truncate">
            <span className="material-symbols-outlined text-primary text-[18px] shrink-0">
              pin_drop
            </span>
            <span
              className={`truncate ${
                displayValue ? "text-on-surface font-semibold" : "text-slate-400 font-normal"
              }`}
            >
              {displayValue || placeholder}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {displayValue && !required && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                className="text-on-surface-variant hover:text-error p-0.5 rounded-full hover:bg-surface-container"
                title="Clear location"
              >
                <span className="material-symbols-outlined text-[16px] block">close</span>
              </span>
            )}
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
              {isOpen ? "expand_less" : "arrow_drop_down"}
            </span>
          </div>
        </button>
      )}

      {/* Form Error or Helper Text */}
      {error && (
        <span className="text-[10px] text-error font-medium mt-1 block">{error}</span>
      )}
      {!error && helperText && (
        <span className="text-[10px] text-on-surface-variant mt-1 block">{helperText}</span>
      )}

      {/* ========================================================================= */}
      {/* SLEEK FLOATING AUTOCOMPLETE DROPDOWN POPOVER */}
      {/* ========================================================================= */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-full min-w-[290px] sm:min-w-[340px] z-50 bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.14)] border border-surface-container-high/90 p-2.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Search Box Header */}
          <div className="relative mb-2">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Type city (e.g. Tan, Bel, Galle)..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs sm:text-sm font-semibold text-on-surface placeholder:text-on-surface-variant/60 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Quick Stats or All Sri Lanka option */}
          {allowAll && !searchQuery && (
            <div
              role="button"
              tabIndex={0}
              onClick={handleSelectAll}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs font-semibold mb-1 transition-colors ${
                isAllSelected
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface-container-low/70 hover:bg-primary-fixed/20 text-on-surface"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">travel_explore</span>
                <span>{allLabel}</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  isAllSelected
                    ? "bg-white/20 text-white"
                    : "bg-primary-fixed text-on-primary-fixed"
                }`}
              >
                Islandwide
              </span>
            </div>
          )}

          {/* Scrollable City List */}
          <div className="max-h-60 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-surface-container scrollbar-track-transparent">
            {filteredCities.map((city: SriLankanCity) => {
              const isSelected =
                value &&
                (city.name.toLowerCase() === value.toLowerCase() ||
                  value.toLowerCase().includes(city.name.toLowerCase()));

              return (
                <div
                  key={`${city.province}-${city.name}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectCity(city.name)}
                  className={`group flex items-center justify-between p-2 rounded-xl cursor-pointer text-xs transition-colors ${
                    isSelected
                      ? "bg-primary/10 text-primary font-bold border border-primary/20"
                      : "hover:bg-surface-container-low text-on-surface"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span
                      className={`material-symbols-outlined text-[18px] shrink-0 ${
                        isSelected
                          ? "text-primary"
                          : "text-on-surface-variant group-hover:text-primary transition-colors"
                      }`}
                    >
                      location_on
                    </span>
                    <div className="min-w-0">
                      <p
                        className={`truncate ${
                          isSelected ? "text-primary font-bold" : "font-semibold text-on-surface"
                        }`}
                      >
                        {city.name}
                      </p>
                      {city.region && (
                        <p className="text-[10px] text-on-surface-variant truncate font-normal">
                          {city.region}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                        isSelected
                          ? "bg-primary text-white"
                          : "bg-surface-container text-on-surface-variant group-hover:bg-primary-fixed group-hover:text-on-primary-fixed transition-colors"
                      }`}
                    >
                      {city.province.replace(" Province", "")}
                    </span>
                    {isSelected && (
                      <span className="material-symbols-outlined text-primary text-[16px]">
                        check
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredCities.length === 0 && (
              <div className="p-6 text-center">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant/40 mb-1">
                  location_off
                </span>
                <p className="text-xs font-semibold text-on-surface">No cities found</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  Try typing "Matara", "Colombo", "Kandy", or "Tangalle"
                </p>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="mt-2 pt-2 border-t border-surface-container flex items-center justify-between text-[10px] text-on-surface-variant px-1 font-medium">
            <span>{filteredCities.length} locations across 9 provinces</span>
            <span className="text-primary font-bold">Islandwide Escrow</span>
          </div>
        </div>
      )}
    </div>
  );
};
