import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Item, Booking } from "../types";
import { itemsApi } from "../services/api";
import PaymentModal from "../components/ui/PaymentModal";
import { useAppSelector } from "../app/store";

export const RentalDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAppSelector((state) => state.auth);

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Gallery state
  const [selectedPhoto, setSelectedPhoto] = useState<string>("");

  // Delivery option
  const [deliveryMode, setDeliveryMode] = useState<"pickup" | "door">("pickup");

  // Booking Calculator State
  const [startDate, setStartDate] = useState<string>("2026-10-14");
  const [endDate, setEndDate] = useState<string>("2026-10-17");

  // Renter Form State matching Image 5
  const [renterName, setRenterName] = useState<string>("Dhanushka Jayawardena");
  const [renterPhone, setRenterPhone] = useState<string>("+94 77 482 9102");
  const [renterNic, setRenterNic] = useState<string>("199228401928");
  const [emergencyContact, setEmergencyContact] = useState<string>("Anoma J. (Sister) - 071 882 1209");

  // Payment Modal Trigger
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
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

  useEffect(() => {
    if (user) {
      if (user.name) setRenterName(user.name);
      if (user.phone) setRenterPhone(user.phone);
      if (user.nic) setRenterNic(user.nic);
    }
  }, [user]);

  // Calculations matching Image 5
  const calculations = useMemo(() => {
    const dailyPrice = item?.price_per_day || 18500;
    const durationDays = 3;
    const subtotal = dailyPrice * durationDays; // 55,500
    const deposit = item?.security_deposit || 20000; // 20,000
    const deliveryFee = deliveryMode === "door" ? 1500 : 0;
    const platformFee = 2500; // Shield Platform & Insurance Fee
    const totalPayable = subtotal + deposit + deliveryFee + platformFee; // 78,000

    return {
      durationDays,
      dailyPrice,
      subtotal,
      deposit,
      deliveryFee,
      platformFee,
      totalPayable,
    };
  }, [item, deliveryMode]);

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
          <p className="text-sm text-on-surface-variant">{error || "Could not load the requested rental item."}</p>
          <Link
            to="/explore"
            className="inline-block px-5 py-2.5 rounded-xl bg-primary text-white font-headline text-sm font-bold shadow-xs"
          >
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const defaultThumbs = [
    item.image_url,
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80",
  ];
  const galleryList = item.images && item.images.length > 0 ? item.images : defaultThumbs;

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumbs matching Image 5 */}
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <Link to="/explore?category=Cameras" className="hover:text-primary transition-colors">
            Commercial &amp; Film
          </Link>
          <span>&gt;</span>
          <span className="text-on-surface-variant">Sony Cinema Line</span>
          <span>&gt;</span>
          <span className="font-semibold text-on-surface truncate">
            {item.title}
          </span>
        </nav>

        {/* Title and Top Header */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-primary-fixed text-on-primary-fixed uppercase tracking-wider">
              Verified Cinema Equipment
            </span>
            <span className="text-xs text-on-surface-variant">• 4.98 (79 verified hires)</span>
            <span className="text-xs text-on-surface-variant">• Colombo 03 Central Handover</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-extrabold text-on-surface">
            {item.title} (4K 120p, RAW Out, 24-70mm GM II)
          </h1>
        </div>

        {/* Bento Gallery Showcase matching Image 5 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 rounded-3xl overflow-hidden bg-surface-container aspect-[16/10] relative shadow-card">
            <img
              src={selectedPhoto || item.image_url}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold font-headline bg-white/90 backdrop-blur-md text-on-surface shadow-xs">
              4K Full-Frame Cinema Line Rig
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

        {/* 2-Column Split: Specs & Details on Left, Calculator on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 7 COLS: Specs, Inclusions, Shield Banner, Dispatch Map */}
          <div className="lg:col-span-7 space-y-6">
            {/* Kit Specifications Bento Box matching Image 5 */}
            <div className="p-6 rounded-3xl bg-white border border-surface-container shadow-card space-y-4">
              <h2 className="font-headline text-lg font-bold text-on-surface">
                Kit Specifications
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                  <span className="material-symbols-outlined text-primary text-[20px] mb-1">
                    photo_camera
                  </span>
                  <div className="text-[10px] text-on-surface-variant">Sensor</div>
                  <strong className="block text-on-surface font-headline">4K Full-Frame Exmor R</strong>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                  <span className="material-symbols-outlined text-primary text-[20px] mb-1">
                    sd_card
                  </span>
                  <div className="text-[10px] text-on-surface-variant">Recording Media</div>
                  <strong className="block text-on-surface font-headline">2x 160GB CFexpress A</strong>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                  <span className="material-symbols-outlined text-primary text-[20px] mb-1">
                    battery_charging_full
                  </span>
                  <div className="text-[10px] text-on-surface-variant">Power Support</div>
                  <strong className="block text-on-surface font-headline">3x 150Wh V-Mounts</strong>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                  <span className="material-symbols-outlined text-primary text-[20px] mb-1">
                    mic
                  </span>
                  <div className="text-[10px] text-on-surface-variant">Audio Inputs</div>
                  <strong className="block text-on-surface font-headline">Dual XLR 4-Channel</strong>
                </div>
              </div>

              {/* Bullet Features */}
              <div className="space-y-2 text-xs pt-2">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <span>
                    <strong>Included Prime Zoom:</strong> Sony FE 24-70mm f/2.8 GM II Lens with UV protection filter and polarized circular filter.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <span>
                    <strong>Dynamic Internal ND:</strong> Electronically variable ND filter (1/4ND to 1/128ND) for instant exposure adaptation in bright Sri Lankan daylight.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <span>
                    <strong>RAW Output:</strong> 16-bit RAW output via SDI for external Atomos / Ninja V+ cinema recording.
                  </span>
                </div>
              </div>

              {/* Everything Included in This Hire */}
              <div className="pt-4 border-t border-surface-container space-y-3">
                <h3 className="font-headline text-sm font-bold text-on-surface">
                  Everything Included in This Hire
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[22px]">luggage</span>
                    <div>
                      <strong className="block text-on-surface">Pelican 1510 Hard Case</strong>
                      <span className="text-[10px] text-on-surface-variant">IP67 waterproof, padded dividers</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[22px]">crop_free</span>
                    <div>
                      <strong className="block text-on-surface">Tilta Full Camera Cage</strong>
                      <span className="text-[10px] text-on-surface-variant">Top plate, baseplate &amp; 15mm rods</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[22px]">power</span>
                    <div>
                      <strong className="block text-on-surface">Dual V-Mount Fast Charger</strong>
                      <span className="text-[10px] text-on-surface-variant">Includes AC power chord &amp; D-Tap cable</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[22px]">record_voice_over</span>
                    <div>
                      <strong className="block text-on-surface">Sony Top Handle Audio Mic</strong>
                      <span className="text-[10px] text-on-surface-variant">Dual XLR interface with shotgun mic</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RentLanka Shield Protection™ Banner matching Image 5 */}
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
                onClick={() => alert("RentLanka Shield covers unintentional mechanical failure, transit damages, and theft holds.")}
                className="px-4 py-2 rounded-xl bg-white text-primary text-xs font-headline font-bold shrink-0 hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                Read Shield Terms
              </button>
            </div>

            {/* Dispatch & Handover Map Card */}
            <div className="p-5 rounded-2xl bg-white border border-surface-container shadow-card space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">
                    Dispatch &amp; Handover
                  </span>
                  <h4 className="font-headline text-sm font-bold text-on-surface">
                    Kollupitiya Hub, Colombo 03
                  </h4>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-surface-container text-[10px] font-bold text-on-surface-variant">
                  Doorstep Delivery in Colombo 01-15: LKR 1,500
                </span>
              </div>

              {/* Map Illustration Container */}
              <div className="rounded-xl overflow-hidden aspect-[21/9] bg-gradient-to-br from-emerald-50 to-teal-100 border border-surface-container p-4 flex flex-col justify-between relative">
                <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
                  <span className="material-symbols-outlined text-[18px]">near_me</span>
                  <span>Colombo 03 — Galle Road Corridor</span>
                </div>
                <div className="p-2 rounded bg-white/90 backdrop-blur-md text-[11px] text-on-surface-variant self-start shadow-xs">
                  Exact pickup landmark revealed upon reservation approval
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: ACTIVE PRICE CALCULATION & BOOKING FORM */}
          <div className="lg:col-span-5 sticky top-28 space-y-4">
            <div className="p-6 rounded-3xl bg-white border-2 border-surface-container shadow-xl space-y-4">
              {/* Delivery Radio Options matching Image 5 */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label
                  onClick={() => setDeliveryMode("pickup")}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                    deliveryMode === "pickup"
                      ? "border-primary bg-primary-fixed/20 text-on-surface font-bold"
                      : "border-surface-container text-on-surface-variant"
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMode === "pickup"}
                    onChange={() => setDeliveryMode("pickup")}
                    className="text-primary"
                  />
                  <span>Self Pickup (Colombo 03)</span>
                </label>

                <label
                  onClick={() => setDeliveryMode("door")}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                    deliveryMode === "door"
                      ? "border-primary bg-primary-fixed/20 text-on-surface font-bold"
                      : "border-surface-container text-on-surface-variant"
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMode === "door"}
                    onChange={() => setDeliveryMode("door")}
                    className="text-primary"
                  />
                  <span>Door Delivery (+LKR 1,500)</span>
                </label>
              </div>

              {/* Active Price Calculation Breakdown Box */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  <span>Active Price Calculation</span>
                  <span className="text-primary">3 Days Selected</span>
                </div>

                <div className="flex justify-between pt-1">
                  <span className="text-on-surface-variant">LKR 18,500 × 3 Days</span>
                  <span className="font-semibold text-on-surface">LKR 55,500</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Refundable Security Deposit (Hold)</span>
                  <span className="font-semibold text-on-surface">LKR 20,000</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Shield Platform &amp; Insurance Fee</span>
                  <span className="font-semibold text-on-surface">LKR 2,500</span>
                </div>

                {deliveryMode === "door" && (
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Doorstep Courier Delivery</span>
                    <span className="font-semibold text-on-surface">LKR 1,500</span>
                  </div>
                )}

                <div className="border-t border-surface-container pt-2 flex justify-between items-baseline text-sm">
                  <span className="font-bold text-on-surface">Total Payable</span>
                  <span className="font-headline font-black text-xl text-primary">
                    LKR {calculations.totalPayable.toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Includes full refundable LKR 20,000 deposit
                </div>
              </div>

              {/* Renter Inputs matching Image 5 */}
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
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
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
                      className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
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
                      className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
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
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Request to Book Button */}
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(true)}
                className="w-full py-4 rounded-2xl bg-primary text-white font-headline font-bold text-sm shadow-[0_4px_16px_rgba(0,105,72,0.35)] hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">lock</span>
                Request to Book &amp; Proceed to Checkout
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

        {/* 3. COMPLETE YOUR FILM PRODUCTION RIG (CAROUSEL / BUNDLES) */}
        <section className="pt-10 border-t border-surface-container">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                Frequently Rented Together
              </span>
              <h3 className="font-headline text-xl font-bold text-on-surface">
                Complete Your Film Production Rig
              </h3>
            </div>
            <Link to="/explore?category=Cameras" className="text-xs font-bold text-primary">
              Explore All Film Gear →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
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
            ].map((bundle, idx) => (
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

      {/* Escrow Modal */}
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
    </div>
  );
};

export default RentalDetailsPage;
