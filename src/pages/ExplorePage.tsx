import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Item, Category } from "../types";
import { itemsApi, categoriesApi } from "../services/api";
import RentalCard from "../components/ui/RentalCard";

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state from URL or defaults
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || "all"
  );
  const [selectedLocation, setSelectedLocation] = useState<string>(
    searchParams.get("location") || "all"
  );
  const [sortBy, setSortBy] = useState<string>(searchParams.get("sortBy") || "newest");
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(
    searchParams.get("available") === "true"
  );
  const [maxPrice, setMaxPrice] = useState<number>(100000);

  // Load items & categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [itemsData, categoriesData] = await Promise.all([
          itemsApi.getAll(),
          categoriesApi.getAll(),
        ]);
        setItems(itemsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Failed to load catalog:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Sync state with URL params
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
    const loc = searchParams.get("location");
    if (loc) setSelectedLocation(loc);
    const q = searchParams.get("search");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // Client-side filtering & sorting
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Category filter
        if (selectedCategory && selectedCategory !== "all" && selectedCategory !== "All") {
          if (item.category.toLowerCase() !== selectedCategory.toLowerCase()) {
            return false;
          }
        }
        // Location filter
        if (selectedLocation && selectedLocation !== "all" && selectedLocation !== "All") {
          if (!item.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
            return false;
          }
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchDesc = item.description?.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat) return false;
        }
        // Availability
        if (onlyAvailable && !item.is_available) {
          return false;
        }
        // Price
        if (item.price_per_day > maxPrice) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.price_per_day - b.price_per_day;
        if (sortBy === "price_desc") return b.price_per_day - a.price_per_day;
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        return 0; // default newest
      });
  }, [items, selectedCategory, selectedLocation, searchQuery, onlyAvailable, maxPrice, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedLocation("all");
    setSortBy("newest");
    setOnlyAvailable(false);
    setMaxPrice(100000);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title & Intro */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-headline text-3xl font-extrabold text-on-surface">
                RentLanka Marketplace Catalog
              </h1>
              <p className="text-sm text-on-surface-variant mt-1">
                Browse verified rental equipment, vehicles, and industrial machinery across Sri Lanka.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low border border-surface-container text-xs font-bold font-headline text-primary self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              {filteredItems.length} Available Listings
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mt-6 p-4 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm space-y-4">
            {/* Search and Sort row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search input */}
              <div className="md:col-span-5 relative">
                <input
                  type="text"
                  placeholder="Search by title, brand, or model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-sm font-medium text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px]">
                  search
                </span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
              </div>

              {/* Location Select */}
              <div className="md:col-span-3">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  <option value="all">All Sri Lanka Locations</option>
                  <option value="colombo">Colombo (Western)</option>
                  <option value="kandy">Kandy (Central)</option>
                  <option value="galle">Galle (Southern)</option>
                  <option value="negombo">Negombo (Airport)</option>
                  <option value="jaffna">Jaffna (Northern)</option>
                </select>
              </div>

              {/* Sort By Select */}
              <div className="md:col-span-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  <option value="newest">Sort: Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

              {/* Available Only Toggle */}
              <div className="md:col-span-2 flex items-center">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold font-headline text-on-surface">
                  <input
                    type="checkbox"
                    checked={onlyAvailable}
                    onChange={(e) => setOnlyAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                  />
                  <span>Available Now</span>
                </label>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`px-3.5 py-1.5 rounded-full font-headline font-bold whitespace-nowrap transition-all ${
                  selectedCategory === "all"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                All Sectors
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3.5 py-1.5 rounded-full font-headline font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedCategory.toLowerCase() === cat.name.toLowerCase()
                      ? "bg-primary text-white shadow-sm"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Catalog Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-surface-container animate-pulse h-84 border border-surface-container"
              ></div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <RentalCard key={item._id || item.id} item={item} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-surface-container-low rounded-3xl border border-surface-container p-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-primary mx-auto">
              <span className="material-symbols-outlined text-[32px]">manage_search</span>
            </div>
            <h3 className="font-headline text-xl font-bold text-on-surface">
              No matching listings found
            </h3>
            <p className="text-sm text-on-surface-variant max-w-md mx-auto">
              We couldn't find any rentals matching your criteria in Sri Lanka. Try adjusting your
              search term, hub, or category filter.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-primary text-white font-headline text-xs font-bold hover:bg-primary-container transition-all shadow-sm"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;

