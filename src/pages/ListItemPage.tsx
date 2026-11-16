import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { itemsApi, aiApi } from "../services/api";
import { useAppSelector } from "../app/store";

export const ListItemPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  // Form State matching Image 4
  const [title, setTitle] = useState<string>("2023 Toyota Hilux Double Cab 4x4");
  const [category, setCategory] = useState<string>("Vehicles & SUVs");
  const [location, setLocation] = useState<string>("Colombo (Districts 01 - 15)");
  const [contactNumber, setContactNumber] = useState<string>("+94 77 123 4567");
  const [conditionLevel, setConditionLevel] = useState<string>("Mint (Near New)");

  const [description, setDescription] = useState<string>(
    "Professional grade Sony FX6 cinema package in immaculate condition. Includes Tilta cage, 2x V-mount batteries, and Pelican case. Available for pickup in Colombo 03 or insured islandwide delivery."
  );

  const [pricePerDay, setPricePerDay] = useState<number>(18500);
  const [weeklyDiscount, setWeeklyDiscount] = useState<string>("15% off for 7+ days");
  const [securityDeposit, setSecurityDeposit] = useState<number>(20000);
  const [bookingProtocol, setBookingProtocol] = useState<"instant" | "manual">("instant");

  // Selected highlight tags
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "All-Islandwide Delivery",
    "Insured Transit",
    "Immediate Dispatch",
    "Serviced & Tested",
  ]);

  // Uploaded photo cards preview
  const [photos, setPhotos] = useState<string[]>([
    "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80",
  ]);

  // UI state
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setPhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // AI Description Generation
  const handleGenerateAiDescription = async () => {
    if (!title.trim()) {
      setErrorMessage("Please enter an Item Title first.");
      return;
    }

    setErrorMessage(null);
    setIsGeneratingAi(true);

    try {
      const res = await aiApi.generateDescription({
        title,
        category,
        location,
      });

      if (res && res.description) {
        setDescription(res.description);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Could not generate AI description.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Submit Listing
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("Item title is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const primaryCategory = category.includes("Vehicle") ? "Vehicles" : category.includes("Camera") ? "Cameras" : "Tools & Machinery";
      const primaryLocation = location.includes("Colombo") ? "Colombo" : "Kandy";

      const newItem = await itemsApi.create({
        title: title.trim(),
        category: primaryCategory,
        location: primaryLocation,
        contact_number: contactNumber,
        description: description.trim(),
        price_per_day: Number(pricePerDay),
        security_deposit: Number(securityDeposit),
        image_url: photos[0] || "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80",
        images: photos,
        owner_name: user?.name || "Kasun Perera",
        is_available: true,
      });

      navigate(`/rentals/${newItem._id || newItem.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to list item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb strip */}
        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <span>Host Portal</span>
          <span>&gt;</span>
          <span>New Inventory Entry</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-fixed text-on-primary-fixed">
            Standard Listing Mode
          </span>
        </div>

        {/* Top Header & Projected Payout Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
          <div>
            <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-on-surface">
              List Your Item on RentLanka
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl mt-1">
              Earn extra income by renting your vehicle, machinery, equipment, or cameras to verified
              Sri Lankans with automated NIC verification and escrow deposit coverage.
            </p>
          </div>

          {/* Projected Payout Widget */}
          <div className="p-4 rounded-2xl bg-white border border-surface-container shadow-card space-y-2 shrink-0">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                Projected Payout
              </span>
              <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                Colombo Avg
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-headline text-2xl font-black text-on-surface">
                LKR 140,000
              </span>
              <span className="text-xs text-on-surface-variant">/ month</span>
            </div>
            {/* Mini Bar Graph */}
            <div className="flex items-end gap-1 h-5 pt-1">
              <div className="flex-1 bg-surface-container h-[40%] rounded-t-xs"></div>
              <div className="flex-1 bg-surface-container h-[55%] rounded-t-xs"></div>
              <div className="flex-1 bg-primary-fixed h-[70%] rounded-t-xs"></div>
              <div className="flex-1 bg-primary h-[100%] rounded-t-xs"></div>
              <div className="flex-1 bg-primary-fixed h-[85%] rounded-t-xs"></div>
              <div className="flex-1 bg-surface-container h-[60%] rounded-t-xs"></div>
            </div>
            <p className="text-[10px] text-on-surface-variant leading-tight">
              Based on 11 active rental days in your primary zone. Payouts transferred directly via LankaPay.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-error-container text-on-error-container text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 8 COLS: FORM STEPS */}
          <div className="lg:col-span-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 1. Item Information */}
              <div className="p-6 rounded-2xl bg-white border border-surface-container shadow-card space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-surface-container">
                  <div className="w-7 h-7 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h2 className="font-headline text-base font-bold text-on-surface">
                      Item Information
                    </h2>
                    <p className="text-xs text-on-surface-variant">
                      General identification for renter discovery across Sri Lanka.
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="host-title" className="block text-xs font-bold text-on-surface mb-1">
                    Item Title <span className="text-error">*</span>
                  </label>
                  <input
                    id="host-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-[10px] text-on-surface-variant mt-1 block">
                    Include year, brand, and main specification for maximum trust.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="host-cat" className="block text-xs font-bold text-on-surface mb-1">
                      Primary Category <span className="text-error">*</span>
                    </label>
                    <select
                      id="host-cat"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    >
                      <option value="Vehicles & SUVs">Vehicles & SUVs</option>
                      <option value="Cameras & Cinema Rig">Cameras & Cinema Rig</option>
                      <option value="Heavy Machinery">Heavy Machinery & Construction</option>
                      <option value="Power Tools & DIY">Power Tools & DIY</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="host-hub" className="block text-xs font-bold text-on-surface mb-1">
                      Dispatch Hub / City <span className="text-error">*</span>
                    </label>
                    <select
                      id="host-hub"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    >
                      <option value="Colombo (Districts 01 - 15)">Colombo (Districts 01 - 15)</option>
                      <option value="Kandy Central Hub">Kandy Central Hub</option>
                      <option value="Galle & Coastal South">Galle & Coastal South</option>
                      <option value="Negombo & Airport Corridor">Negombo & Airport Corridor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="host-phone" className="block text-xs font-bold text-on-surface mb-1">
                      Host Direct Phone / WhatsApp <span className="text-error">*</span>
                    </label>
                    <input
                      id="host-phone"
                      type="text"
                      required
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                      ✓ Verified to receive SMS booking alerts
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Item Condition Level <span className="text-error">*</span>
                    </label>
                    <div className="flex gap-1.5 pt-0.5">
                      {["Brand New", "Mint (Near New)", "Good Working"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setConditionLevel(c)}
                          className={`flex-1 py-2 px-2 rounded-lg text-[10px] font-headline font-bold transition-all ${
                            conditionLevel === c
                              ? "bg-primary text-white shadow-xs"
                              : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Item Description & Specs with AI Assist */}
              <div className="p-6 rounded-2xl bg-white border border-surface-container shadow-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-surface-container">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <div>
                      <h2 className="font-headline text-base font-bold text-on-surface">
                        Item Description & Specs
                      </h2>
                      <p className="text-xs text-on-surface-variant">
                        Accurate details boost your listing position by 40%.
                      </p>
                    </div>
                  </div>

                  {/* AI Assist: Auto-Generate Button */}
                  <button
                    type="button"
                    onClick={handleGenerateAiDescription}
                    disabled={isGeneratingAi}
                    className="ai-sparkle-btn px-3.5 py-1.5 rounded-xl text-white text-xs font-headline font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                  >
                    {isGeneratingAi ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                    )}
                    ✨ AI Assist: Auto-Generate
                  </button>
                </div>

                <div>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
                  ></textarea>

                  <div className="flex items-center justify-between text-[10px] text-on-surface-variant mt-1">
                    <span className="flex items-center gap-1 text-primary font-semibold">
                      <span className="material-symbols-outlined text-[14px]">tune</span>
                      Optimized for local search algorithms (RentLanka SEO)
                    </span>
                    <span>{description.length} / 1,200 chars</span>
                  </div>
                </div>

                {/* Suggested Highlight Tags */}
                <div>
                  <label className="block text-[11px] font-bold text-on-surface mb-1.5">
                    Suggested Highlight Tags:
                  </label>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {[
                      "All-Islandwide Delivery",
                      "Insured Transit",
                      "Immediate Dispatch",
                      "Serviced & Tested",
                    ].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-full font-headline font-bold flex items-center gap-1 transition-all ${
                          selectedTags.includes(tag)
                            ? "bg-primary-fixed text-on-primary-fixed"
                            : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {selectedTags.includes(tag) ? "check" : "add"}
                        </span>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Visual Showcase & Photos */}
              <div className="p-6 rounded-2xl bg-white border border-surface-container shadow-card space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-surface-container">
                  <div className="w-7 h-7 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h2 className="font-headline text-base font-bold text-on-surface">
                      Visual Showcase & Photos
                    </h2>
                    <p className="text-xs text-on-surface-variant">
                      Upload at least 3 crisp angles. First photo serves as thumbnail on search feeds.
                    </p>
                  </div>
                </div>

                {/* Drag and Drop Zone */}
                <div className="border-2 border-dashed border-surface-container-high hover:border-primary rounded-2xl p-6 text-center bg-surface-container-low/40 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    id="host-upload"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="host-upload"
                    className="cursor-pointer flex flex-col items-center justify-center space-y-1.5"
                  >
                    <span className="material-symbols-outlined text-primary text-[32px]">
                      add_photo_alternate
                    </span>
                    <span className="font-headline text-xs font-bold text-on-surface">
                      Drag & drop high-res photos or browse from your computer
                    </span>
                    <span className="text-[10px] text-on-surface-variant">
                      PNG, JPG, or WEBP up to 25MB each. High-dynamic range photos perform best.
                    </span>
                  </label>
                </div>

                {/* 3 Photo Thumbnail Cards matching Image 4 */}
                <div className="grid grid-cols-3 gap-3">
                  {photos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl overflow-hidden aspect-[4/3] bg-surface-container border border-surface-container shadow-xs group"
                    >
                      <img
                        src={photo}
                        alt={`Asset angle ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-primary text-white text-[9px] font-bold">
                          ★ Cover Photo
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                      >
                        <span className="material-symbols-outlined text-[13px]">close</span>
                      </button>
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex justify-between text-[9px] text-white bg-black/50 px-1.5 py-0.5 rounded">
                        <span>Position #{idx + 1}</span>
                        <span>2.4 MB</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Rates, Escrow & Availability */}
              <div className="p-6 rounded-2xl bg-white border border-surface-container shadow-card space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-surface-container">
                  <div className="w-7 h-7 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <div>
                    <h2 className="font-headline text-base font-bold text-on-surface">
                      Rates, Escrow & Availability
                    </h2>
                    <p className="text-xs text-on-surface-variant">
                      Set transparent compensation and damage insurance requirements.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="rate-price" className="block text-xs font-bold text-on-surface mb-1">
                      Daily Rental Rate *
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-[11px] font-bold text-primary font-headline">
                        LKR
                      </span>
                      <input
                        id="rate-price"
                        type="number"
                        required
                        value={pricePerDay}
                        onChange={(e) => setPricePerDay(Number(e.target.value))}
                        className="w-full pl-11 pr-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <span className="text-[9px] text-on-surface-variant mt-1 block">
                      Recommended: LKR 16k - 22k
                    </span>
                  </div>

                  <div>
                    <label htmlFor="rate-discount" className="block text-xs font-bold text-on-surface mb-1">
                      Weekly Discount
                    </label>
                    <input
                      id="rate-discount"
                      type="text"
                      value={weeklyDiscount}
                      onChange={(e) => setWeeklyDiscount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-[9px] text-on-surface-variant mt-1 block">
                      Attracts long-duration commercial shoots
                    </span>
                  </div>

                  <div>
                    <label htmlFor="rate-deposit" className="block text-xs font-bold text-on-surface mb-1">
                      Refundable Deposit *
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-[11px] font-bold text-secondary font-headline">
                        LKR
                      </span>
                      <input
                        id="rate-deposit"
                        type="number"
                        required
                        value={securityDeposit}
                        onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                        className="w-full pl-11 pr-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <span className="text-[9px] text-on-surface-variant mt-1 block">
                      Held securely in RentLanka SafeEscrow
                    </span>
                  </div>
                </div>

                {/* Booking Acceptance Protocol */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-on-surface mb-2">
                    Booking Acceptance Protocol:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setBookingProtocol("instant")}
                      className={`p-3.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        bookingProtocol === "instant"
                          ? "border-primary bg-primary-fixed/20 shadow-xs"
                          : "border-surface-container bg-surface-container-low"
                      }`}
                    >
                      <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
                        bolt
                      </span>
                      <div>
                        <strong className="block text-on-surface font-headline font-bold">
                          Instant Booking
                        </strong>
                        <span className="text-[10px] text-on-surface-variant">
                          Verified renters can confirm dates automatically without waiting for host confirmation.
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBookingProtocol("manual")}
                      className={`p-3.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        bookingProtocol === "manual"
                          ? "border-primary bg-primary-fixed/20 shadow-xs"
                          : "border-surface-container bg-surface-container-low"
                      }`}
                    >
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px] shrink-0 mt-0.5">
                        person_check
                      </span>
                      <div>
                        <strong className="block text-on-surface font-headline font-bold">
                          Host Manual Approval
                        </strong>
                        <span className="text-[10px] text-on-surface-variant">
                          Review renter identity, project synopsis, and ratings before agreeing to hand over keys.
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-primary text-white font-headline font-bold text-sm shadow-[0_4px_18px_rgba(0,105,72,0.35)] hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span className="material-symbols-outlined text-[20px]">publish</span>
                )}
                Publish Listing Now
              </button>
            </form>
          </div>

          {/* RIGHT 4 COLS: HOST PROFILE & LIVE MARKETPLACE PREVIEW */}
          <div className="lg:col-span-4 space-y-6 sticky top-28">
            {/* Kasun Perera Host Profile Card */}
            <div className="rounded-2xl bg-white border border-surface-container p-5 shadow-card space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-primary to-teal-400 text-white font-bold flex items-center justify-center uppercase shadow-xs">
                  KP
                </div>
                <div>
                  <div className="flex items-center gap-1 font-headline font-bold text-sm text-on-surface">
                    <span>Kasun Perera</span>
                    <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
                  </div>
                  <div className="text-[11px] text-on-surface-variant">
                    NIC Verified (Sri Lanka) • SuperHost
                  </div>
                  <div className="text-[10px] text-amber-500 font-bold">
                    ★ 4.96 (28 completed rentals)
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-between">
                <span className="font-semibold text-on-surface">Account Trust Score</span>
                <span className="font-headline font-black text-primary text-sm">98 / 100</span>
              </div>
            </div>

            {/* Live Marketplace Card Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-on-surface-variant px-1">
                <span className="font-headline font-bold uppercase tracking-wider text-[10px]">
                  Live Marketplace Card Preview
                </span>
                <span className="text-[10px] text-primary font-bold bg-primary-fixed/40 px-2 py-0.5 rounded">
                  Preview
                </span>
              </div>

              <div className="rounded-2xl bg-white border border-surface-container shadow-card overflow-hidden">
                <div className="relative aspect-[16/10] bg-surface-container">
                  <img
                    src={photos[0] || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80"}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-primary shadow-xs">
                    ● Available Today
                  </span>
                </div>

                <div className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                    <span className="text-primary font-bold">Cameras &amp; Rigs</span>
                    <span>Colombo 03</span>
                  </div>
                  <h3 className="font-headline text-sm font-bold text-on-surface line-clamp-1">
                    {title || "Sony FX6 Cinema Package (Tilta Cage)"}
                  </h3>

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span className="px-1.5 py-0.5 rounded bg-surface-container">Mint Condition</span>
                    <span>•</span>
                    <span className="text-primary font-semibold">Deposit Protected</span>
                  </div>

                  <div className="pt-2 border-t border-surface-container flex items-baseline justify-between">
                    <div>
                      <span className="font-headline font-black text-base text-on-surface">
                        LKR {Number(pricePerDay).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-on-surface-variant"> / day</span>
                    </div>
                    <span className="text-amber-500 font-bold text-[11px]">★ 5.0 (New)</span>
                  </div>
                </div>

                <div className="p-3 bg-surface-container-low border-t border-surface-container text-[10px] text-on-surface-variant space-y-1">
                  <div className="flex items-center gap-1 text-primary font-semibold">
                    <span className="material-symbols-outlined text-[13px]">security</span>
                    <span>RentLanka Guarantee: Up to LKR 1,500,000</span>
                  </div>
                  <p>Host platform commission is only 6% upon completed rental payouts.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListItemPage;
