import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Item, Booking } from "../types";
import { itemsApi } from "../services/api";
import PaymentModal from "../components/ui/PaymentModal";
import { useAppSelector } from "../app/store";

export const RentalDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Gallery state
  const [selectedPhoto, setSelectedPhoto] = useState<string>("");

  // Delivery option
  const [deliveryMode, setDeliveryMode] = useState<"pickup" | "door">("pickup");

  // Booking Calculator State (Real Interactive Dates)
  const todayStr = new Date().toISOString().split("T")[0];
  const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(inThreeDays);

  // Renter Form State (Empty for guests, auto-filled for authenticated users)
  const [renterName, setRenterName] = useState<string>(user?.name || "");
  const [renterPhone, setRenterPhone] = useState<string>(user?.phone || "");
  const [renterNic, setRenterNic] = useState<string>(user?.nic || "");
  const [emergencyContact, setEmergencyContact] = useState<string>("");

  // Payment & Auth Modal Triggers
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [showAuthBookingModal, setShowAuthBookingModal] = useState<boolean>(false);
  const [bookingConfirmed, setBookingConfirmed] = useState<Booking | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await itemsApi.getById(id);
        setItem(data);
        setSelectedPhoto(data.image_url);
      } catch (err: any) {
        setError(err.message || "Failed to load rental item details");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  // Restore booking intent if user was redirected back after login/register
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("rentlanka_booking_intent");
      if (!saved) return;
      const intent = JSON.parse(saved);
      if (intent.itemId === id) {
        if (intent.startDate) setStartDate(intent.startDate);
        if (intent.endDate) setEndDate(intent.endDate);
        if (intent.deliveryMode) setDeliveryMode(intent.deliveryMode);
        if (intent.renterName) setRenterName(intent.renterName);
        if (intent.renterPhone) setRenterPhone(intent.renterPhone);
        if (intent.renterNic) setRenterNic(intent.renterNic);
        if (intent.emergencyContact) setEmergencyContact(intent.emergencyContact);
      }
    } catch (e) {
      console.warn("Could not load booking intent from sessionStorage:", e);
    }
  }, [id]);

  useEffect(() => {
    if (user) {
      if (user.name) setRenterName(user.name);
      if (user.phone) setRenterPhone(user.phone);
      if (user.nic) setRenterNic(user.nic);
    }
  }, [user]);

  // Save booking intent to sessionStorage before redirecting to login/register
  const saveBookingIntentToSession = () => {
    try {
      sessionStorage.setItem(
        "rentlanka_booking_intent",
        JSON.stringify({
          itemId: id,
          startDate,
          endDate,
          deliveryMode,
          renterName,
          renterPhone,
          renterNic,
          emergencyContact,
        })
      );
    } catch (e) {
      console.warn("Could not save booking intent to sessionStorage:", e);
    }
  };

  const handleRequestToBook = () => {
    if (!isAuthenticated || !user) {
      saveBookingIntentToSession();
      setShowAuthBookingModal(true);
      return;
    }
    setIsPaymentModalOpen(true);
  };

  // Category Detection Helpers
  const categoryLower = (item?.category || "").toLowerCase();
  const isVehicle =
    categoryLower.includes("vehicle") ||
    categoryLower.includes("car") ||
    categoryLower.includes("suv") ||
    categoryLower.includes("van") ||
    categoryLower.includes("4x4");

  const isMotorcycle =
    categoryLower.includes("motorcycle") ||
    categoryLower.includes("scooter") ||
    categoryLower.includes("bike");

  const isVehicleOrMoto = isVehicle || isMotorcycle;

  const isCamera =
    categoryLower.includes("camera") ||
    categoryLower.includes("cine") ||
    categoryLower.includes("film") ||
    categoryLower.includes("photo");

  const isTool =
    categoryLower.includes("tool") ||
    categoryLower.includes("machinery") ||
    categoryLower.includes("generator") ||
    categoryLower.includes("construction");

  // Interactive Dynamic Calculations
  const calculations = useMemo(() => {
    const dailyPrice = item?.price_per_day || 18500;

    // Calculate real duration in days from selected dates
    let durationDays = 3;
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      durationDays = diffDays > 0 ? diffDays : 1;
    } catch {
      durationDays = 3;
    }

    const subtotal = dailyPrice * durationDays;
    const deposit = item?.security_deposit !== undefined ? item.security_deposit : 20000;
    const platformFee = 2500; // Shield Platform & Insurance Fee

    // For vehicles/motorcycles, deliveryFee is strictly 0 (no courier)
    const deliveryFee = isVehicleOrMoto ? 0 : deliveryMode === "door" ? 2500 : 0;
    const totalPayable = subtotal + deposit + deliveryFee + platformFee;

    return {
      durationDays,
      dailyPrice,
      subtotal,
      deposit,
      deliveryFee,
      platformFee,
      totalPayable,
    };
  }, [item, startDate, endDate, deliveryMode, isVehicleOrMoto]);

  const handleBookingSuccess = (booking: Booking) => {
    setBookingConfirmed(booking);
    if (item) {
      setItem({ ...item, is_available: false });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface pt-32 pb-20 max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-48 bg-surface-container rounded-lg"></div>
          <div className="h-10 w-3/4 bg-surface-container rounded-lg"></div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 h-96 bg-surface-container rounded-2xl"></div>
            <div className="lg:col-span-4 h-96 bg-surface-container rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-surface pt-32 pb-20 max-w-[1280px] mx-auto px-4 text-center">
        <div className="p-8 rounded-3xl bg-white max-w-lg mx-auto border border-surface-container shadow-card space-y-4">
          <span className="material-symbols-outlined text-error text-[48px]">warning</span>
          <h2 className="font-headline text-2xl font-bold text-on-surface">Item Not Found</h2>
          <p className="text-sm text-on-surface-variant">
            {error || "Could not load the requested rental item."}
          </p>
          <Link
            to="/explore"
            className="inline-block px-5 py-2.5 rounded-xl bg-primary text-white font-headline text-sm font-bold shadow-xs hover:bg-primary-container transition-colors"
          >
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  // Gallery photos (use real uploaded images array, or fallback to primary image)
  const galleryList =
    item.images && item.images.length > 0
      ? item.images
      : [
          item.image_url,
          "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80",
        ];

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Dynamic Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <Link
            to={`/explore?category=${encodeURIComponent(item.category)}`}
            className="hover:text-primary transition-colors"
          >
            {item.category}
          </Link>
          <span>&gt;</span>
          <span className="font-semibold text-on-surface truncate">{item.title}</span>
        </nav>

        {/* Title and Top Header: STRICTLY ITEM.TITLE (No Hardcoded (4K 120p, RAW Out)) */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-primary-fixed text-on-primary-fixed uppercase tracking-wider">
              {item.category}
            </span>
            <span className="text-xs text-on-surface-variant">
              • ★ {item.rating || 4.96} ({item.reviews_count || 32} verified hires)
            </span>
            <span className="text-xs text-on-surface-variant">
              • {item.location || "Colombo Central Hub"}
            </span>
            {item.is_available ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Available Today
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                Currently Out on Rent
              </span>
            )}
          </div>

          {/* Strictly Dynamic Title */}
          <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-extrabold text-on-surface">
            {item.title}
          </h1>
        </div>

        {/* Bento Gallery Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 rounded-3xl overflow-hidden bg-surface-container aspect-[16/10] relative shadow-card">
            <img
              src={selectedPhoto || item.image_url}
              alt={item.title}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold font-headline bg-white/90 backdrop-blur-md text-on-surface shadow-xs">
              {item.category}
            </span>
          </div>

          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3">
            {galleryList.slice(0, 4).map((thumb, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedPhoto(thumb)}
                className={`relative rounded-2xl overflow-hidden aspect-[16/9] lg:aspect-auto lg:h-[86px] w-full border-2 transition-all group focus:outline-none cursor-pointer ${
                  selectedPhoto === thumb
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-transparent opacity-75 hover:opacity-100"
                }`}
              >
                <img
                  src={thumb}
                  alt={`View ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Split: Dynamic Specs on Left, Calculator on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 7 COLS: DYNAMIC BENTO SPECS, INCLUSIONS, SHIELD BANNER */}
          <div className="lg:col-span-7 space-y-6">
            {/* Category-Aware Bento Specifications Box */}
            <div className="p-6 rounded-3xl bg-white border border-surface-container shadow-card space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                <h2 className="font-headline text-lg font-bold text-on-surface">
                  {item.category} Specifications
                </h2>
                <span className="text-[11px] font-semibold text-primary">
                  Verified by RentLanka Hub
                </span>
              </div>

              {/* SPECIFICATION BENTO TILES BASED ON CATEGORY */}
              {isVehicleOrMoto ? (
                /* 1. VEHICLE / MOTORCYCLE BENTO */
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                    <span className="material-symbols-outlined text-primary text-[20px] mb-1">
                      settings
                    </span>
                    <div className="text-[10px] text-on-surface-variant">Transmission</div>
                    <strong className="block text-on-surface font-headline">
                      {item.specs?.Transmission || "Automatic"}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                    <span className="material-symbols-outlined text-primary text-[20px] mb-1">
                      local_gas_station
                    </span>
                    <div className="text-[10px] text-on-surface-variant">Fuel Type</div>
                    <strong className="block text-on-surface font-headline">
                      {item.specs?.["Fuel Type"] || "Diesel / Hybrid"}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                    <span className="material-symbols-outlined text-primary text-[20px] mb-1">
                      airline_seat_recline_normal
                    </span>
                    <div className="text-[10px] text-on-surface-variant">
                      {isMotorcycle ? "Riding Capacity" : "Seating Capacity"}
                    </div>
                    <strong className="block text-on-surface font-headline">
                      {item.specs?.["Capacity / Seating"] ||
                        item.specs?.["Seating Capacity"] ||
                        "5 Passenger Seats"}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                    <span className="material-symbols-outlined text-primary text-[20px] mb-1">
                      badge
                    </span>
                    <div className="text-[10px] text-on-surface-variant">License Required</div>
                    <strong className="block text-on-surface font-headline">
                      {isMotorcycle ? "Class A (Motorcycle)" : "Class B / C Driving"}
                    </strong>
                  </div>
                </div>
              ) : isCamera ? (
                /* 2. CAMERA & CINE GEAR BENTO */
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                    <span className="material-symbols-outlined text-primary text-[20px] mb-1">
                      photo_camera
                    </span>
                    <div className="text-[10px] text-on-surface-variant">Sensor</div>
                    <strong className="block text-on-surface font-headline">
                      {item.specs?.["Sensor / Resolution"] || "4K Full-Frame Cinema"}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                    <span className="material-symbols-outlined text-primary text-[20px] mb-1">
                      filter_vintage
                    </span>
                    <div className="text-[10px] text-on-surface-variant">Included Lens</div>
                    <strong className="block text-on-surface font-headline truncate">
                      {item.specs?.["Included Lens"] || "24-70mm f/2.8 GM II"}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                    <span className="material-symbols-outlined text-primary text-[20px] mb-1">
                      battery_charging_full
                    </span>
                    <div className="text-[10px] text-on-surface-variant">Power Support</div>
                    <strong className="block text-on-surface font-headline">
                      3x High-Capacity Batteries
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                    <span className="material-symbols-outlined text-primary text-[20px] mb-1">
                      sd_card
                    </span>
                    <div className="text-[10px] text-on-surface-variant">Recording Media</div>
                    <strong className="block text-on-surface font-headline">
                      CFexpress / SDXC High Speed
                    </strong>
                  </div>
                </div>
              ) : isTool ? (
                /* 3. TOOLS & POWER MACHINERY BENTO */
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                    <span className="material-symbols-outlined text-primary text-[20px] mb-1">
                      bolt
                    </span>
                    <div className="text-[10px] text-on-surface-variant">Power Source</div>
                    <strong className="block text-on-surface font-headline">
                      {item.specs?.["Power Source"] || "Silent Diesel Engine"}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                    <span className="material-symbols-outlined text-primary text-[20px] mb-1">
                      engineering
                    </span>
                    <div className="text-[10px] text-on-surface-variant">Operator Mode</div>
                    <strong className="block text-on-surface font-headline truncate">
                      {item.specs?.["Operation Mode"] || "Self-Operated"}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                    <span className="material-symbols-outlined text-primary text-[20px] mb-1">
                      construction
                    </span>
                    <div className="text-[10px] text-on-surface-variant">Duty Rating</div>
                    <strong className="block text-on-surface font-headline">
                      Commercial Heavy-Duty
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                    <span className="material-symbols-outlined text-primary text-[20px] mb-1">
                      verified
                    </span>
                    <div className="text-[10px] text-on-surface-variant">Inspection</div>
                    <strong className="block text-on-surface font-headline">
                      SLSI / Safety Tested
                    </strong>
                  </div>
                </div>
              ) : (
                /* 4. GENERAL & EVENTS BENTO */
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                    <span className="material-symbols-outlined text-primary text-[20px] mb-1">
                      celebration
                    </span>
                    <div className="text-[10px] text-on-surface-variant">Suitability</div>
                    <strong className="block text-on-surface font-headline truncate">
                      {item.specs?.["Event Suitability"] || "Stage & Weddings"}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                    <span className="material-symbols-outlined text-primary text-[20px] mb-1">
                      groups
                    </span>
                    <div className="text-[10px] text-on-surface-variant">Setup Crew</div>
                    <strong className="block text-on-surface font-headline truncate">
                      {item.specs?.["Crew Support"] || "Support Available"}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                    <span className="material-symbols-outlined text-primary text-[20px] mb-1">
                      shield
                    </span>
                    <div className="text-[10px] text-on-surface-variant">Protection</div>
                    <strong className="block text-on-surface font-headline">
                      SafeEscrow Covered
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                    <span className="material-symbols-outlined text-primary text-[20px] mb-1">
                      verified_user
                    </span>
                    <div className="text-[10px] text-on-surface-variant">Condition</div>
                    <strong className="block text-on-surface font-headline">
                      Inspected Gear
                    </strong>
                  </div>
                </div>
              )}

              {/* Description Section */}
              <div className="pt-2 text-xs text-on-surface-variant leading-relaxed space-y-2">
                <h3 className="font-headline text-sm font-bold text-on-surface">Description</h3>
                <p className="whitespace-pre-line">{item.description}</p>
              </div>

              {/* Dynamic Inclusions Checklist */}
              <div className="pt-4 border-t border-surface-container space-y-3">
                <h3 className="font-headline text-sm font-bold text-on-surface">
                  Everything Included in This Hire
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {isVehicleOrMoto ? (
                    <>
                      <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-[22px]">
                          verified_user
                        </span>
                        <div>
                          <strong className="block text-on-surface">
                            Comprehensive Commercial Insurance
                          </strong>
                          <span className="text-[10px] text-on-surface-variant">
                            Includes passenger &amp; collision liability cover
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-[22px]">
                          sos
                        </span>
                        <div>
                          <strong className="block text-on-surface">
                            24/7 Roadside Assistance
                          </strong>
                          <span className="text-[10px] text-on-surface-variant">
                            Islandwide breakdown &amp; recovery support
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-[22px]">
                          build
                        </span>
                        <div>
                          <strong className="block text-on-surface">
                            Spare Wheel &amp; Jack Tool Kit
                          </strong>
                          <span className="text-[10px] text-on-surface-variant">
                            Factory emergency wheel kit &amp; warning triangle
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-[22px]">
                          clean_hands
                        </span>
                        <div>
                          <strong className="block text-on-surface">
                            Pre-Rental Sanitization &amp; Log
                          </strong>
                          <span className="text-[10px] text-on-surface-variant">
                            Full fluid check, clean interior &amp; fuel verification
                          </span>
                        </div>
                      </div>
                    </>
                  ) : isCamera ? (
                    <>
                      <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-[22px]">
                          luggage
                        </span>
                        <div>
                          <strong className="block text-on-surface">Pelican Waterproof Case</strong>
                          <span className="text-[10px] text-on-surface-variant">
                            IP67 certified padded flight case
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-[22px]">
                          crop_free
                        </span>
                        <div>
                          <strong className="block text-on-surface">Full Camera Cage</strong>
                          <span className="text-[10px] text-on-surface-variant">
                            Top plate, baseplate &amp; mounting rods
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-[22px]">
                          power
                        </span>
                        <div>
                          <strong className="block text-on-surface">Dual Battery Fast Charger</strong>
                          <span className="text-[10px] text-on-surface-variant">
                            Includes AC power cable &amp; DC adapters
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-[22px]">
                          mic
                        </span>
                        <div>
                          <strong className="block text-on-surface">Top Handle Audio Shotgun</strong>
                          <span className="text-[10px] text-on-surface-variant">
                            Dual XLR audio inputs with windshield
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-[22px]">
                          security
                        </span>
                        <div>
                          <strong className="block text-on-surface">Safety Equipment Kit</strong>
                          <span className="text-[10px] text-on-surface-variant">
                            Protective goggles, work gloves &amp; ear protection
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-[22px]">
                          cable
                        </span>
                        <div>
                          <strong className="block text-on-surface">Heavy Extension Loom</strong>
                          <span className="text-[10px] text-on-surface-variant">
                            Weatherproof heavy armored electrical leads
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-[22px]">
                          menu_book
                        </span>
                        <div>
                          <strong className="block text-on-surface">Operating Guide &amp; Safety Log</strong>
                          <span className="text-[10px] text-on-surface-variant">
                            Step-by-step startup &amp; safety instructions
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-[22px]">
                          handyman
                        </span>
                        <div>
                          <strong className="block text-on-surface">Routine Service Log</strong>
                          <span className="text-[10px] text-on-surface-variant">
                            Certified fully functional &amp; tested
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* RentLanka Shield Protection™ Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-card">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px] text-white">verified_user</span>
                </div>
                <div>
                  <h3 className="font-headline text-sm font-bold">
                    RentLanka Shield Protection™
                  </h3>
                  <p className="text-xs text-emerald-100 max-w-md leading-relaxed mt-0.5">
                    Up to LKR 500,000 equipment coverage. Security deposit held in Sri Lankan licensed bank escrow until return is confirmed.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  alert(
                    "RentLanka Shield covers unintentional mechanical failure, transit damages, and escrow dispute resolution."
                  )
                }
                className="px-4 py-2 rounded-xl bg-white text-primary text-xs font-headline font-bold shrink-0 hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                Read Shield Terms
              </button>
            </div>

            {/* Dispatch & Handover Location Card */}
            <div className="p-5 rounded-2xl bg-white border border-surface-container shadow-card space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">
                    Dispatch &amp; Handover
                  </span>
                  <h4 className="font-headline text-sm font-bold text-on-surface">
                    {item.location || "Colombo Regional Handover Hub"}
                  </h4>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-surface-container text-[10px] font-bold text-on-surface-variant">
                  {isVehicleOrMoto
                    ? "In-Person Key Handover Only"
                    : "Doorstep Courier Available"}
                </span>
              </div>

              <div className="rounded-xl overflow-hidden aspect-[21/9] bg-gradient-to-br from-emerald-50 to-teal-100 border border-surface-container p-4 flex flex-col justify-between relative">
                <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
                  <span className="material-symbols-outlined text-[18px]">near_me</span>
                  <span>{item.location} — Verified Handover Corridor</span>
                </div>
                <div className="p-2 rounded bg-white/90 backdrop-blur-md text-[11px] text-on-surface-variant self-start shadow-xs">
                  Exact landmark and host coordinates released immediately upon reservation confirmation.
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: DYNAMIC BOOKING CALCULATOR & CHECKOUT */}
          <div className="lg:col-span-5 sticky top-28 space-y-4">
            <div className="p-6 rounded-3xl bg-white border-2 border-surface-container shadow-xl space-y-4">
              {/* Daily Rate Header */}
              <div className="flex items-baseline justify-between pb-3 border-b border-surface-container">
                <div>
                  <span className="font-headline text-3xl font-black text-on-surface">
                    LKR {item.price_per_day.toLocaleString()}
                  </span>
                  <span className="text-xs text-on-surface-variant font-medium"> / day</span>
                </div>
                <span className="text-amber-500 font-bold text-xs">★ 4.98 (Verified)</span>
              </div>

              {/* Interactive Pick-up & Return Date Pickers */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-on-surface">
                  Rental Period (Select Dates):
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-on-surface-variant block mb-1">Pick-up Date:</span>
                    <input
                      type="date"
                      value={startDate}
                      min={todayStr}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant block mb-1">Return Date:</span>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* DYNAMIC DELIVERY OPTION: VEHICLES LOCKED TO PICKUP */}
              {isVehicleOrMoto ? (
                /* VEHICLE LOCK BANNER (NO COURIER ALLOWED) */
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-headline font-bold text-amber-950">
                    <span className="material-symbols-outlined text-[18px] text-amber-700">lock</span>
                    <span>Self-Pickup &amp; Local Handover (Free)</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Due to insurance and motor traffic laws in Sri Lanka, courier delivery is disabled for vehicles. Renter must present physical Driving License &amp; NIC upon key handover.
                  </p>
                  <div className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 pt-0.5">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    <span>Handover Hub: {item.location || "Colombo Regional Hub"}</span>
                  </div>
                </div>
              ) : (
                /* NON-VEHICLES: SHOW BOTH PICKUP AND COURIER */
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label
                    onClick={() => setDeliveryMode("pickup")}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      deliveryMode === "pickup"
                        ? "border-primary bg-primary-fixed/20 text-on-surface font-bold"
                        : "border-surface-container text-on-surface-variant hover:bg-surface-container-low"
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryMode === "pickup"}
                      onChange={() => setDeliveryMode("pickup")}
                      className="text-primary"
                    />
                    <span>Self Pickup (Free)</span>
                  </label>

                  <label
                    onClick={() => setDeliveryMode("door")}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      deliveryMode === "door"
                        ? "border-primary bg-primary-fixed/20 text-on-surface font-bold"
                        : "border-surface-container text-on-surface-variant hover:bg-surface-container-low"
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryMode === "door"}
                      onChange={() => setDeliveryMode("door")}
                      className="text-primary"
                    />
                    <span>Door Delivery (+LKR 2,500)</span>
                  </label>
                </div>
              )}

              {/* Dynamic Price Calculation Breakdown Box */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  <span>Active Price Calculation</span>
                  <span className="text-primary font-bold">
                    {calculations.durationDays} Day{calculations.durationDays > 1 ? "s" : ""} Selected
                  </span>
                </div>

                <div className="flex justify-between pt-1">
                  <span className="text-on-surface-variant">
                    LKR {calculations.dailyPrice.toLocaleString()} × {calculations.durationDays} Days
                  </span>
                  <span className="font-semibold text-on-surface">
                    LKR {calculations.subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Refundable Security Deposit (Hold)</span>
                  <span className="font-semibold text-on-surface">
                    LKR {calculations.deposit.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Shield Platform &amp; Insurance Fee</span>
                  <span className="font-semibold text-on-surface">
                    LKR {calculations.platformFee.toLocaleString()}
                  </span>
                </div>

                {!isVehicleOrMoto && deliveryMode === "door" && (
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Insured Courier Delivery</span>
                    <span className="font-semibold text-on-surface">
                      LKR {calculations.deliveryFee.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="border-t border-surface-container pt-2 flex justify-between items-baseline text-sm">
                  <span className="font-bold text-on-surface">Total Payable</span>
                  <span className="font-headline font-black text-xl text-primary">
                    LKR {calculations.totalPayable.toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Includes full refundable LKR {calculations.deposit.toLocaleString()} deposit
                </div>
              </div>

              {/* Renter Information Inputs */}
              <div className="space-y-3 text-xs">
                <div>
                  <label htmlFor="detail-name" className="block text-[11px] font-bold text-on-surface mb-1">
                    Renter Full Name as per Sri Lankan NIC / Passport
                  </label>
                  <input
                    id="detail-name"
                    type="text"
                    value={renterName}
                    onChange={(e) => setRenterName(e.target.value)}
                    placeholder="e.g. Dhanushka Jayawardena"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface placeholder:text-on-surface-variant/50 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="detail-phone" className="block text-[11px] font-bold text-on-surface mb-1">
                      WhatsApp Number (+94)
                    </label>
                    <input
                      id="detail-phone"
                      type="text"
                      value={renterPhone}
                      onChange={(e) => setRenterPhone(e.target.value)}
                      placeholder="+94 7X XXX XXXX"
                      className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface placeholder:text-on-surface-variant/50 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="detail-nic" className="block text-[11px] font-bold text-on-surface mb-1">
                      National NIC / Passport No.
                    </label>
                    <input
                      id="detail-nic"
                      type="text"
                      value={renterNic}
                      onChange={(e) => setRenterNic(e.target.value)}
                      placeholder="e.g. 199228401928"
                      className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface placeholder:text-on-surface-variant/50 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="detail-emergency" className="block text-[11px] font-bold text-on-surface mb-1">
                    Emergency Contact Person &amp; Tel
                  </label>
                  <input
                    id="detail-emergency"
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="e.g. Anoma J. (Sister) - 071 882 1209"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface placeholder:text-on-surface-variant/50 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Request to Book CTA */}
              <button
                type="button"
                onClick={handleRequestToBook}
                disabled={!item.is_available}
                className="w-full py-4 rounded-2xl bg-primary text-white font-headline font-bold text-sm shadow-[0_4px_16px_rgba(0,105,72,0.35)] hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">lock</span>
                {item.is_available
                  ? "Request to Book & Proceed to Checkout"
                  : "Currently Out on Rent"}
              </button>

              <div className="flex items-center justify-between text-[10px] text-on-surface-variant pt-1">
                <span>🛡️ NIC ID Verified</span>
                <span>•</span>
                <span>💳 LankaPay Escrow</span>
                <span>•</span>
                <span>⚡ Instant Return Refund</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. FREQUENTLY RENTED TOGETHER (CATEGORY-RELEVANT BUNDLES) */}
        <section className="pt-10 border-t border-surface-container">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                Frequently Rented Together
              </span>
              <h3 className="font-headline text-xl font-bold text-on-surface">
                {isVehicleOrMoto
                  ? "Popular Vehicle Touring Add-Ons"
                  : isCamera
                  ? "Complete Your Film Production Rig"
                  : isTool
                  ? "Recommended Jobsite Power & Safety Gear"
                  : "Complementary Event & Production Gear"}
              </h3>
            </div>
            <Link
              to={`/explore?category=${encodeURIComponent(item.category)}`}
              className="text-xs font-bold text-primary hover:underline"
            >
              Explore All {item.category} →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(isVehicleOrMoto
              ? [
                  {
                    title: "Dual 4K Dashcam with GPS & Parking Guard",
                    price: 2500,
                    desc: "Sony Starvis 2 night vision sensor, front and rear cabin recording with 128GB high-endurance SD.",
                    img: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80",
                  },
                  {
                    title: "Garmin DriveSmart 66 GPS Navigator",
                    price: 1800,
                    desc: "Detailed Sri Lankan offline road map with voice guidance, speed trap alerts, and scenic routes.",
                    img: "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=400&q=80",
                  },
                  {
                    title: "Child Safety Seat (ISOFIX Certified)",
                    price: 1500,
                    desc: "360-degree rotation, 5-point harness safety for infants up to 12 years with breathable comfort padding.",
                    img: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=400&q=80",
                  },
                ]
              : isCamera
              ? [
                  {
                    title: "DJI RS 3 Pro Gimbal Combo",
                    price: 6500,
                    desc: "Automated axis locks, 4.5kg payload, carbon fiber construction with RavenEye wireless transmission.",
                    img: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=400&q=80",
                  },
                  {
                    title: "Sennheiser MKH 416 Mic + Boom Kit",
                    price: 5000,
                    desc: "Industry gold-standard condenser shotgun mic, Rycote blimp wind shield, XLR cable, and K-Tek pole.",
                    img: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=400&q=80",
                  },
                  {
                    title: "Aputure LS 600d Pro Daylight LED",
                    price: 11000,
                    desc: "Weatherproof 600W point-source daylight fixture, high CRI 96+, Barn doors, and heavy C-Stand.",
                    img: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=400&q=80",
                  },
                ]
              : [
                  {
                    title: "50m Heavy-Duty 3-Phase Extension Loom",
                    price: 4500,
                    desc: "Industrial weatherproof rubber jacket, IP67 industrial plugs for site generators and distribution.",
                    img: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=400&q=80",
                  },
                  {
                    title: "Certified SLSI Jobsite Safety Equipment Pack",
                    price: 2000,
                    desc: "High-visibility vests, hard hats, eye protection goggles, and heavy-duty cut-resistant gloves.",
                    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80",
                  },
                  {
                    title: "Portable 5kW Digital Inverter Backup Generator",
                    price: 12000,
                    desc: "Ultra-quiet pure sine wave power for sensitive electronics, audio gear, and lighting.",
                    img: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400&q=80",
                  },
                ]
            ).map((bundle, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-surface-container shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[16/9] rounded-xl overflow-hidden bg-surface-container mb-2">
                    <img
                      src={bundle.img}
                      alt={bundle.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-headline text-sm font-bold text-on-surface">
                    {bundle.title}
                  </h4>
                  <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">
                    {bundle.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-surface-container">
                  <div className="font-headline font-bold text-xs text-on-surface">
                    LKR {bundle.price.toLocaleString()} / day
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(`Added ${bundle.title} to rental package!`)}
                    className="px-3 py-1 rounded-lg bg-surface-container hover:bg-primary-fixed text-primary font-headline text-xs font-bold transition-colors cursor-pointer"
                  >
                    + Bundle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* LankaPay Escrow Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        item={item}
        rentalData={{
          startDate,
          endDate,
          durationDays: calculations.durationDays,
          dailyPrice: calculations.dailyPrice,
          subtotal: calculations.subtotal,
          deposit: calculations.deposit,
          platformFee: calculations.platformFee,
          totalPayable: calculations.totalPayable,
          renterName,
          renterPhone,
          renterNic,
        }}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* ========================================================================= */}
      {/* AUTH GUARD: ACCOUNT REQUIRED TO COMPLETE BOOKING MODAL */}
      {/* ========================================================================= */}
      {showAuthBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-surface-container relative space-y-5 animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setShowAuthBookingModal(false)}
              className="absolute top-5 right-5 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            {/* Icon Header */}
            <div className="w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary mx-auto shadow-xs">
              <span className="material-symbols-outlined text-[32px]">lock_person</span>
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-headline text-xl sm:text-2xl font-black text-on-surface tracking-tight">
                Account Required to Complete Booking
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Please log in or create your free RentLanka renter account so the host can verify your booking and identity.
              </p>
            </div>

            {/* Preserved Booking Summary */}
            <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-on-surface">
                <span className="truncate pr-2">{item.title}</span>
                <span className="text-primary shrink-0">{calculations.durationDays} Days</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-on-surface-variant border-t border-surface-container pt-2">
                <span>Period: {startDate} → {endDate}</span>
                <span className="font-bold text-on-surface">LKR {calculations.totalPayable.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-primary font-semibold pt-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>Your rental dates &amp; calculated rate are saved and ready.</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <Link
                to={`/login?redirect=${encodeURIComponent(`/rentals/${id}`)}`}
                className="w-full py-3.5 rounded-xl bg-primary text-white font-headline text-sm font-bold shadow-xs hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span>Log In to Continue</span>
              </Link>

              <Link
                to={`/register?redirect=${encodeURIComponent(`/rentals/${id}`)}`}
                className="w-full py-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container text-on-surface font-headline text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <span>Create Free Account</span>
              </Link>
            </div>

            <p className="text-center text-[10px] text-on-surface-variant">
              Backed by LankaPay Escrow Guarantee &amp; National Identity Verification
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalDetailsPage;
