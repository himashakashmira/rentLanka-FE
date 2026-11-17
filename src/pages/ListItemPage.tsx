import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { itemsApi, aiApi } from "../services/api";
import { uploadImageToSupabase, SUPABASE_BUCKET } from "../services/supabase";
import { useAppSelector } from "../app/store";
import { SearchableCitySelect } from "../components/common/SearchableCitySelect";

interface ListingImage {
  id: string;
  file: File;
  previewUrl: string;
  publicUrl?: string;
  isUploading: boolean;
  error?: string;
  sizeFormatted: string;
}

interface FormErrors {
  title?: string;
  category?: string;
  location?: string;
  contactNumber?: string;
  conditionLevel?: string;
  description?: string;
  pricePerDay?: string;
  securityDeposit?: string;
  images?: string;
}

interface CategoryOption {
  id: string;
  name: string;
  title: string;
  tagline: string;
  icon: string;
  badge: string;
  handoverMode: string;
  color: string;
  examples: string[];
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    id: "vehicles",
    name: "Vehicles & SUVs",
    title: "Vehicles & SUVs",
    tagline: "Cars, Vans, Double Cabs, 4x4 SUVs, Coaches",
    icon: "directions_car",
    badge: "Highest Demand",
    handoverMode: "Self-Pickup & Physical Inspection Only",
    color: "from-emerald-500 to-teal-700",
    examples: ["Toyota Land Cruiser", "Hilux Double Cab", "Axio / Prius", "KDH Van"],
  },
  {
    id: "motorcycles",
    name: "Motorcycles & Scooters",
    title: "Motorcycles & Scooters",
    tagline: "Bikes, Scooters, Adventure Touring, Dirt Bikes",
    icon: "two_wheeler",
    badge: "Quick Turnaround",
    handoverMode: "Self-Pickup & License Inspection Only",
    color: "from-blue-500 to-indigo-700",
    examples: ["Honda CB500X", "Yamaha Tenere 700", "Vespa 150", "Royal Enfield"],
  },
  {
    id: "cameras",
    name: "Cameras & Cine Gear",
    title: "Cameras & Cine Gear",
    tagline: "Mirrorless, Cinema Rigs, Lenses, Lighting & Audio",
    icon: "photo_camera",
    badge: "SafeEscrow™ Covered",
    handoverMode: "Self-Pickup or Insured Courier Delivery",
    color: "from-purple-500 to-indigo-800",
    examples: ["Sony FX6 / FX3", "Canon C70 / R5", "RED Komodo", "GM II Lenses"],
  },
  {
    id: "tools",
    name: "Tools & Power Machinery",
    title: "Tools & Power Machinery",
    tagline: "Power Tools, Generators, Breakers, Construction Equipment",
    icon: "precision_manufacturing",
    badge: "Industrial Grade",
    handoverMode: "Self-Pickup or Heavy Transport Truck",
    color: "from-amber-500 to-orange-700",
    examples: ["Silent Diesel Gensets", "CAT / JCB Backhoes", "Demolition Hammers", "Welding Rigs"],
  },
  {
    id: "events",
    name: "General & Events",
    title: "General & Events",
    tagline: "Stage Sound, Event Lights, Furniture, Party & Production",
    icon: "celebration",
    badge: "Production Ready",
    handoverMode: "Self-Pickup or Event Logistics Truck",
    color: "from-pink-500 to-rose-700",
    examples: ["Line-Array Audio", "LED Stage Walls", "Outdoor Canopies", "Trusses"],
  },
];

export const ListItemPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Workflow Step State (Step 1: Visual Category Selector, Step 2: Tailored Form)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Common Form State (All initialized empty)
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [conditionLevel, setConditionLevel] = useState<string>("");

  const [description, setDescription] = useState<string>("");
  const [pricePerDay, setPricePerDay] = useState<string>("");
  const [weeklyDiscount, setWeeklyDiscount] = useState<string>("");
  const [securityDeposit, setSecurityDeposit] = useState<string>("");
  const [bookingProtocol, setBookingProtocol] = useState<"instant" | "manual">("instant");

  // Selected highlight tags
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Auth Required Modal State
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // ================= DYNAMIC CATEGORY-SPECIFIC FIELDS =================
  // 1. Vehicles / Motorcycles
  const [vehicleTransmission, setVehicleTransmission] = useState<string>("Automatic");
  const [vehicleFuel, setVehicleFuel] = useState<string>("Diesel");
  const [vehicleSeats, setVehicleSeats] = useState<string>("5 Seats");

  // 2. Cameras
  const [cameraSensor, setCameraSensor] = useState<string>("4K Full-Frame Cinema");
  const [cameraLens, setCameraLens] = useState<string>("Sony FE 24-70mm f/2.8 GM II Included");
  const [cameraAccessories, setCameraAccessories] = useState<string[]>([
    "CFexpress Cards (2x 160GB)",
    "3x Extra Rechargeable Batteries",
    "Pelican 1510 Hard Case",
    "Tilta Full Camera Cage",
  ]);

  // 3. Tools & Machinery
  const [toolPowerSource, setToolPowerSource] = useState<string>("Silent Diesel Engine");
  const [toolOperator, setToolOperator] = useState<string>("Self-Operated (Hirer provides operator)");

  // 4. General & Events
  const [eventType, setEventType] = useState<string>("Weddings, Concerts & Corporate Events");
  const [eventSetup, setEventSetup] = useState<string>("On-Site Technical Crew Available");

  // Delivery Option (Vehicles locked to pickup; others customizable)
  const [deliveryOption, setDeliveryOption] = useState<"pickup" | "courier">("pickup");

  // Images State with instant local preview & Supabase storage tracking
  const [images, setImages] = useState<ListingImage[]>([]);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const imagesRef = useRef<ListingImage[]>([]);
  imagesRef.current = images;

  // Single replace file input tracker
  const replaceIndexRef = useRef<number | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);

  // UI, Validation & Toast State
  const [errors, setErrors] = useState<FormErrors>({});
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Clean up object URLs on component unmount
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => {
        if (img.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, []);

  // Save listing draft to localStorage so no user input is lost
  const saveDraftToLocalStorage = () => {
    try {
      const draft = {
        currentStep,
        title,
        category,
        location,
        contactNumber,
        conditionLevel,
        description,
        pricePerDay,
        weeklyDiscount,
        securityDeposit,
        bookingProtocol,
        selectedTags,
        vehicleTransmission,
        vehicleFuel,
        vehicleSeats,
        cameraSensor,
        cameraLens,
        cameraAccessories,
        toolPowerSource,
        toolOperator,
        eventType,
        eventSetup,
        deliveryOption,
        uploadedUrls: images.filter((img) => img.publicUrl).map((img) => img.publicUrl),
      };
      localStorage.setItem("rentlanka_listing_draft", JSON.stringify(draft));
    } catch (e) {
      console.warn("Could not save listing draft to localStorage:", e);
    }
  };

  // Restore listing draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("rentlanka_listing_draft");
      if (!saved) return;
      const draft = JSON.parse(saved);
      if (draft.category) {
        setCategory(draft.category);
        setCurrentStep(2);
      }
      if (draft.title) setTitle(draft.title);
      if (draft.location) setLocation(draft.location);
      if (draft.contactNumber) setContactNumber(draft.contactNumber);
      if (draft.conditionLevel) setConditionLevel(draft.conditionLevel);
      if (draft.description) setDescription(draft.description);
      if (draft.pricePerDay) setPricePerDay(draft.pricePerDay);
      if (draft.weeklyDiscount) setWeeklyDiscount(draft.weeklyDiscount);
      if (draft.securityDeposit) setSecurityDeposit(draft.securityDeposit);
      if (draft.bookingProtocol) setBookingProtocol(draft.bookingProtocol);
      if (draft.selectedTags) setSelectedTags(draft.selectedTags);
      if (draft.vehicleTransmission) setVehicleTransmission(draft.vehicleTransmission);
      if (draft.vehicleFuel) setVehicleFuel(draft.vehicleFuel);
      if (draft.vehicleSeats) setVehicleSeats(draft.vehicleSeats);
      if (draft.cameraSensor) setCameraSensor(draft.cameraSensor);
      if (draft.cameraLens) setCameraLens(draft.cameraLens);
      if (draft.cameraAccessories) setCameraAccessories(draft.cameraAccessories);
      if (draft.toolPowerSource) setToolPowerSource(draft.toolPowerSource);
      if (draft.toolOperator) setToolOperator(draft.toolOperator);
      if (draft.eventType) setEventType(draft.eventType);
      if (draft.eventSetup) setEventSetup(draft.eventSetup);
      if (draft.deliveryOption) setDeliveryOption(draft.deliveryOption);
      if (draft.uploadedUrls && draft.uploadedUrls.length > 0) {
        setImages(
          draft.uploadedUrls.map((url: string, idx: number) => ({
            id: `restored-${idx}-${Date.now()}`,
            file: new File([], `photo-${idx}.jpg`),
            previewUrl: url,
            publicUrl: url,
            isUploading: false,
            sizeFormatted: "Stored",
          }))
        );
      }
    } catch (e) {
      console.warn("Could not load listing draft from localStorage:", e);
    }
  }, []);

  // Format file size helper
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Helper flags
  const isVehicle = category === "Vehicles & SUVs";
  const isMotorcycle = category === "Motorcycles & Scooters";
  const isVehicleOrMoto = isVehicle || isMotorcycle;
  const isCamera = category === "Cameras & Cine Gear";
  const isTool = category === "Tools & Power Machinery";
  const isEvent = category === "General & Events";

  // Step 1: Select Category Handler
  const handleSelectCategory = (cat: CategoryOption) => {
    setCategory(cat.name);
    setErrors((prev) => ({ ...prev, category: undefined }));

    // Preset sensible category defaults
    if (cat.id === "vehicles") {
      setVehicleTransmission("Automatic");
      setVehicleFuel("Diesel");
      setVehicleSeats("5 Seats");
      setDeliveryOption("pickup");
      if (!pricePerDay) setPricePerDay("28000");
      if (!securityDeposit) setSecurityDeposit("25000");
    } else if (cat.id === "motorcycles") {
      setVehicleTransmission("Manual");
      setVehicleFuel("Petrol");
      setVehicleSeats("2 Seats");
      setDeliveryOption("pickup");
      if (!pricePerDay) setPricePerDay("12500");
      if (!securityDeposit) setSecurityDeposit("15000");
    } else if (cat.id === "cameras") {
      setDeliveryOption("pickup");
      if (!pricePerDay) setPricePerDay("18500");
      if (!securityDeposit) setSecurityDeposit("20000");
    } else if (cat.id === "tools") {
      setDeliveryOption("pickup");
      if (!pricePerDay) setPricePerDay("35000");
      if (!securityDeposit) setSecurityDeposit("30000");
    } else if (cat.id === "events") {
      setDeliveryOption("pickup");
      if (!pricePerDay) setPricePerDay("22000");
      if (!securityDeposit) setSecurityDeposit("20000");
    }

    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Process and upload new files
  const processFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    const validImageFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        setToast({
          type: "error",
          message: `"${file.name}" is not an image file (PNG, JPG, WEBP only).`,
        });
        return false;
      }
      if (file.size > 25 * 1024 * 1024) {
        setToast({
          type: "error",
          message: `"${file.name}" exceeds the 25MB maximum file size limit.`,
        });
        return false;
      }
      return true;
    });

    if (validImageFiles.length === 0) return;

    setErrors((prev) => ({ ...prev, images: undefined }));

    const newEntries: ListingImage[] = validImageFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      publicUrl: undefined,
      isUploading: true,
      sizeFormatted: formatFileSize(file.size),
    }));

    setImages((prev) => [...prev, ...newEntries]);

    for (const entry of newEntries) {
      try {
        const uploadRes = await uploadImageToSupabase(entry.file, SUPABASE_BUCKET);
        if (uploadRes.success && uploadRes.publicUrl) {
          setImages((prev) =>
            prev.map((img) =>
              img.id === entry.id
                ? { ...img, publicUrl: uploadRes.publicUrl, isUploading: false, error: undefined }
                : img
            )
          );
        } else {
          setImages((prev) =>
            prev.map((img) =>
              img.id === entry.id
                ? {
                    ...img,
                    isUploading: false,
                    error: uploadRes.error || "Upload failed",
                  }
                : img
            )
          );
          setToast({
            type: "error",
            message: `Supabase upload error for "${entry.file.name}": ${
              uploadRes.error || "Storage rejected request."
            }`,
          });
        }
      } catch (err: any) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === entry.id
              ? { ...img, isUploading: false, error: err.message || "Upload exception" }
              : img
          )
        );
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    const target = images[index];
    if (target) {
      if (target.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(target.previewUrl);
      }
      setImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const triggerReplacePhoto = (index: number) => {
    replaceIndexRef.current = index;
    if (replaceInputRef.current) {
      replaceInputRef.current.click();
    }
  };

  const handleReplaceFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const index = replaceIndexRef.current;
    if (!file || index === null || !images[index]) return;

    if (!file.type.startsWith("image/")) {
      setToast({ type: "error", message: "Selected file must be an image." });
      return;
    }

    const oldEntry = images[index];
    if (oldEntry.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(oldEntry.previewUrl);
    }

    const newPreviewUrl = URL.createObjectURL(file);
    const updatedEntry: ListingImage = {
      ...oldEntry,
      file,
      previewUrl: newPreviewUrl,
      publicUrl: undefined,
      isUploading: true,
      error: undefined,
      sizeFormatted: formatFileSize(file.size),
    };

    setImages((prev) => {
      const copy = [...prev];
      copy[index] = updatedEntry;
      return copy;
    });

    e.target.value = "";

    try {
      const uploadRes = await uploadImageToSupabase(file, SUPABASE_BUCKET);
      if (uploadRes.success && uploadRes.publicUrl) {
        setImages((prev) => {
          const copy = [...prev];
          if (copy[index]) {
            copy[index] = {
              ...copy[index],
              publicUrl: uploadRes.publicUrl,
              isUploading: false,
              error: undefined,
            };
          }
          return copy;
        });
      } else {
        setImages((prev) => {
          const copy = [...prev];
          if (copy[index]) {
            copy[index] = {
              ...copy[index],
              isUploading: false,
              error: uploadRes.error || "Upload failed",
            };
          }
          return copy;
        });
        setToast({
          type: "error",
          message: `Replace upload failed: ${uploadRes.error}`,
        });
      }
    } catch (err: any) {
      setImages((prev) => {
        const copy = [...prev];
        if (copy[index]) {
          copy[index] = {
            ...copy[index],
            isUploading: false,
            error: err.message,
          };
        }
        return copy;
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleCameraAccessory = (acc: string) => {
    setCameraAccessories((prev) =>
      prev.includes(acc) ? prev.filter((a) => a !== acc) : [...prev, acc]
    );
  };

  // AI Description Generation with category context
  const handleGenerateAiDescription = async () => {
    if (!title.trim()) {
      setErrors((prev) => ({ ...prev, title: "Please enter an Item Title first." }));
      setToast({
        type: "error",
        message: "Please enter an Item Title before generating an AI description.",
      });
      return;
    }

    setToast(null);
    setIsGeneratingAi(true);

    try {
      const res = await aiApi.generateDescription({
        title,
        category: category || "General Rental Asset",
        location: location || "Sri Lanka",
      });

      if (res && res.description) {
        setDescription(res.description);
        setErrors((prev) => ({ ...prev, description: undefined }));
        setToast({
          type: "success",
          message: "✨ AI description generated successfully!",
        });
      }
    } catch (err: any) {
      setToast({
        type: "error",
        message: err.message || "Could not generate AI description. Try again.",
      });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Client-Side Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = "Item title is required.";
    } else if (title.trim().length < 4) {
      newErrors.title = "Item title must be at least 4 characters.";
    }

    if (!category) {
      newErrors.category = "Please select a category.";
    }

    if (!location) {
      newErrors.location = "Please select a dispatch hub / city.";
    }

    if (!contactNumber.trim()) {
      newErrors.contactNumber = "Host direct phone / WhatsApp is required.";
    } else if (contactNumber.trim().length < 9) {
      newErrors.contactNumber = "Enter a valid phone number (e.g., +94 77 123 4567).";
    }

    if (!conditionLevel) {
      newErrors.conditionLevel = "Please select an item condition level.";
    }

    if (!description.trim()) {
      newErrors.description = "Item description is required.";
    } else if (description.trim().length < 15) {
      newErrors.description = "Description should be at least 15 characters.";
    }

    if (!pricePerDay || Number(pricePerDay) <= 0) {
      newErrors.pricePerDay = "Daily rental rate must be greater than 0.";
    }

    if (!securityDeposit || Number(securityDeposit) < 0) {
      newErrors.securityDeposit = "Refundable deposit amount is required.";
    }

    if (images.length === 0) {
      newErrors.images = "Please upload at least one photo of your item.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Compile Tailored Specifications & Inclusions
  const compileSpecsAndInclusions = () => {
    let specs: Record<string, string> = {};
    let inclusions: string[] = [];

    if (isVehicle) {
      specs = {
        Transmission: vehicleTransmission,
        "Fuel Type": vehicleFuel,
        "Capacity / Seating": vehicleSeats,
        "License Required": "Valid Sri Lankan Driving License (Class B/C)",
        "Handover Mode": "Self-Pickup & In-Person Physical Inspection Only",
        "Insurance Status": "Comprehensive Commercial Rental Policy",
      };
      inclusions = [
        "Commercial Insurance Policy Cover",
        "24/7 Islandwide Emergency Breakdown Assist",
        "Sanitized Pre-Rental Handover & Fuel Log",
        "Emergency Spare Wheel, Jack & Tool Kit",
      ];
    } else if (isMotorcycle) {
      specs = {
        Transmission: vehicleTransmission,
        "Fuel Type": vehicleFuel,
        "Capacity / Seating": vehicleSeats,
        "License Required": "Valid Sri Lankan Driving License (Class A)",
        "Handover Mode": "In-Person Inspection & License Check",
      };
      inclusions = [
        "2x DOT Certified Modular Helmets Included",
        "RAM Phone Mount with USB Quick Charge",
        "Comprehensive Collision & Third Party Cover",
        "Tool Kit & Tyre Repair Kit",
      ];
    } else if (isCamera) {
      specs = {
        "Sensor / Resolution": cameraSensor,
        "Included Lens": cameraLens,
        "Mount Type": "Standard Cinema / Mirrorless Mount",
        "Media Support": "CFexpress Type A / High-Speed SDXC",
        "Delivery Support": deliveryOption === "courier" ? "Insured Courier (+LKR 1,500)" : "Self-Pickup",
      };
      inclusions = cameraAccessories;
    } else if (isTool) {
      specs = {
        "Power Source": toolPowerSource,
        "Operation Mode": toolOperator,
        "Duty Rating": "Commercial Heavy-Duty Certified",
        "Safety Certification": "Tested & Certified Safe",
        "Delivery Support": deliveryOption === "courier" ? "Heavy Low-Bed Transport (+LKR 4,500)" : "Self-Pickup",
      };
      inclusions = [
        "Operator Safety Goggles & Work Gloves",
        "Heavy-Duty Weatherproof Extension Cables",
        "Comprehensive Maintenance Log & Operating Guide",
      ];
    } else {
      specs = {
        "Event Suitability": eventType,
        "Crew Support": eventSetup,
        "Durability": "Event Standard Commercial",
      };
      inclusions = [
        "Complete Interconnect Cable Loom",
        "Protective Flight Transport Cases",
        "Fast Deployment Rigging Hardware",
      ];
    }

    return { specs, inclusions };
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    if (!validateForm()) {
      setToast({
        type: "error",
        message: "Please complete all required fields highlighted in red.",
      });
      return;
    }

    // AUTH GUARD: Enforce user authentication to publish
    if (!isAuthenticated || !user) {
      saveDraftToLocalStorage();
      setShowAuthModal(true);
      return;
    }

    const stillUploading = images.some((img) => img.isUploading);
    if (stillUploading) {
      setToast({
        type: "info",
        message: "Please wait a moment while your photos finish uploading to Supabase Storage...",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedUrls = images.map((img) => img.publicUrl || img.previewUrl);
      const primaryImageUrl = uploadedUrls[0] || "";
      const { specs, inclusions } = compileSpecsAndInclusions();

      const newItem = await itemsApi.create({
        title: title.trim(),
        category,
        location,
        contact_number: contactNumber.trim(),
        description: description.trim(),
        price_per_day: Number(pricePerDay),
        security_deposit: Number(securityDeposit),
        image_url: primaryImageUrl,
        images: uploadedUrls,
        owner_name: user?.name || "RentLanka Verified Host",
        is_available: true,
        specs,
        inclusions,
      });

      // Clear stored draft upon successful publish
      localStorage.removeItem("rentlanka_listing_draft");

      setToast({
        type: "success",
        message: "Listing published successfully to RentLanka!",
      });

      setTimeout(() => {
        navigate(`/rentals/${newItem._id || newItem.id}`);
      }, 1000);
    } catch (err: any) {
      setToast({
        type: "error",
        message: err.message || "Failed to publish listing. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Host info calculations (Dynamic for authenticated user; no fake Kasun Perera)
  const hostName = user?.name || (isAuthenticated ? "Verified Host" : "Verified Member");
  const hostInitials =
    user?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "RL";
  const isHostVerified = !!(user?.nic || user?.phone || isAuthenticated);

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20">
      {/* Hidden file input for single image replacement */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        onChange={handleReplaceFileInputChange}
        className="hidden"
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Floating Toast Notification */}
        {toast && (
          <div
            className={`fixed top-24 right-4 sm:right-8 z-50 p-4 rounded-2xl shadow-card border flex items-center gap-3 max-w-md transition-all duration-300 ${
              toast.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            <span className="material-symbols-outlined text-[20px] shrink-0">
              {toast.type === "error"
                ? "error"
                : toast.type === "success"
                ? "check_circle"
                : "info"}
            </span>
            <span className="text-xs font-medium leading-relaxed">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-auto text-on-surface-variant hover:text-on-surface p-1"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Breadcrumb strip & 2-Step Progress Tracker */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-primary transition-colors">
              Marketplace
            </Link>
            <span>&gt;</span>
            <span className="text-on-surface font-medium">Host Listing Portal</span>
            <span>&gt;</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-fixed text-on-primary-fixed">
              {currentStep === 1 ? "Step 1: Choose Category" : `Step 2: ${category}`}
            </span>
          </div>

          {/* Stepper Pills */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`px-3 py-1 rounded-full text-[11px] font-headline font-bold flex items-center gap-1.5 transition-all ${
                currentStep === 1
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span>1</span>
              <span>Select Category</span>
            </button>
            <span className="text-slate-300">→</span>
            <button
              type="button"
              disabled={!category}
              onClick={() => category && setCurrentStep(2)}
              className={`px-3 py-1 rounded-full text-[11px] font-headline font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 ${
                currentStep === 2
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface-container text-on-surface-variant"
              }`}
            >
              <span>2</span>
              <span>Asset Specs &amp; Rates</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: CATEGORY SELECTION SCREEN (INITIAL VIEW) */}
        {/* ========================================================================= */}
        {currentStep === 1 ? (
          <div className="space-y-8 py-4">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-headline font-bold uppercase tracking-wider bg-primary-fixed text-on-primary-fixed">
                Sri Lanka Peer-to-Peer Rental Network
              </span>
              <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-on-surface">
                What would you like to rent out?
              </h1>
              <p className="text-sm text-on-surface-variant">
                Select your asset category below. RentLanka automatically tailors insurance coverage, technical specifications, and legal verification based on your asset type.
              </p>
            </div>

            {/* Visual 5-Category Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {CATEGORY_OPTIONS.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat)}
                  className="group relative p-6 rounded-3xl bg-white border border-surface-container hover:border-primary shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden -translate-y-0 hover:-translate-y-1.5"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-surface-container-low group-hover:bg-primary-fixed/40 text-primary flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-[32px] group-hover:scale-110 transition-transform">
                          {cat.icon}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-headline bg-surface-container text-on-surface-variant group-hover:bg-primary group-hover:text-white transition-colors">
                        {cat.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-headline text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                        {cat.tagline}
                      </p>
                    </div>

                    {/* Example assets pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cat.examples.map((ex, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-surface-container-low text-[10px] text-on-surface-variant font-medium"
                        >
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-surface-container flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <span className="material-symbols-outlined text-[15px] text-primary">verified</span>
                      <span>{cat.handoverMode}</span>
                    </div>
                    <span className="font-headline font-bold text-primary group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                      Select →
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Host Advantage Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-primary to-teal-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-card">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[32px] text-primary-fixed shrink-0">
                  shield_with_heart
                </span>
                <div>
                  <h3 className="font-headline text-base font-bold">
                    RentLanka Host SafeGuard™ Coverage Included
                  </h3>
                  <p className="text-xs text-emerald-100 max-w-xl leading-relaxed mt-0.5">
                    Every asset listed on RentLanka is protected by automated Sri Lankan NIC verification, mandatory escrow deposits held in licensed banks, and instant digital lease agreements.
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-emerald-200 block">Host Commission</span>
                <span className="font-headline text-2xl font-black text-primary-fixed">Only 6%</span>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* STEP 2: TAILORED LISTING FORM (CATEGORY-SPECIFIC FIELDS) */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* Top Bar with Category Lock & "Change Category" Action */}
            <div className="p-4 rounded-2xl bg-white border border-surface-container shadow-card flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-3 py-1.5 rounded-xl border border-surface-container bg-surface-container-low hover:bg-surface-container text-on-surface font-headline font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>← Change Category</span>
                </button>

                <div className="h-6 w-px bg-surface-container hidden sm:block"></div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant">Listing in:</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-headline font-bold bg-primary-fixed text-on-primary-fixed flex items-center gap-1 shadow-xs">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    {category}
                  </span>
                </div>
              </div>

              <span className="text-[11px] text-on-surface-variant">
                Form customized for Sri Lankan regulations &amp; equipment standards
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT 8 COLS: TAILORED FORM */}
              <div className="lg:col-span-8 space-y-6">
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  {/* 1. Basic Item Identification */}
                  <div className="p-6 rounded-2xl bg-white border border-surface-container shadow-card space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-surface-container">
                      <div className="w-7 h-7 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <div>
                        <h2 className="font-headline text-base font-bold text-on-surface">
                          Item Identification
                        </h2>
                        <p className="text-xs text-on-surface-variant">
                          General identification for renter discovery across Sri Lanka.
                        </p>
                      </div>
                    </div>

                    {/* Item Title */}
                    <div>
                      <label htmlFor="host-title" className="block text-xs font-bold text-on-surface mb-1">
                        Item Title <span className="text-error">*</span>
                      </label>
                      <input
                        id="host-title"
                        type="text"
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                        }}
                        placeholder={
                          isVehicle
                            ? "e.g., 2023 Toyota Hilux Double Cab 4×4"
                            : isMotorcycle
                            ? "e.g., 2022 Honda CB500X Adventure Tourer"
                            : isCamera
                            ? "e.g., Sony FX6 Full-Frame Cinema Camera Kit"
                            : isTool
                            ? "e.g., Denyo 60kVA Ultra-Silent Diesel Generator"
                            : "e.g., JBL Professional Line-Array Concert Sound System"
                        }
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border text-xs font-semibold text-on-surface placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                          errors.title
                            ? "border-error ring-1 ring-error bg-red-50/20"
                            : "border-surface-container"
                        }`}
                      />
                      {errors.title ? (
                        <span className="text-[10px] text-error font-medium mt-1 block">
                          {errors.title}
                        </span>
                      ) : (
                        <span className="text-[10px] text-on-surface-variant mt-1 block">
                          Include year, brand, and main specification for maximum trust.
                        </span>
                      )}
                    </div>

                    {/* Dispatch Hub & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <SearchableCitySelect
                          id="host-hub"
                          label="Dispatch Hub / City"
                          required
                          value={location}
                          onChange={(city) => {
                            setLocation(city);
                            if (errors.location)
                              setErrors((prev) => ({ ...prev, location: undefined }));
                          }}
                          placeholder="Select dispatch hub / city"
                          error={errors.location}
                        />
                      </div>

                      <div>
                        <label htmlFor="host-phone" className="block text-xs font-bold text-on-surface mb-1">
                          Host Direct Phone / WhatsApp <span className="text-error">*</span>
                        </label>
                        <input
                          id="host-phone"
                          type="text"
                          value={contactNumber}
                          onChange={(e) => {
                            setContactNumber(e.target.value);
                            if (errors.contactNumber)
                              setErrors((prev) => ({ ...prev, contactNumber: undefined }));
                          }}
                          placeholder="e.g., +94 77 123 4567"
                          className={`w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border text-xs font-semibold text-on-surface placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                            errors.contactNumber
                              ? "border-error ring-1 ring-error bg-red-50/20"
                              : "border-surface-container"
                          }`}
                        />
                        {errors.contactNumber ? (
                          <span className="text-[10px] text-error font-medium mt-1 block">
                            {errors.contactNumber}
                          </span>
                        ) : contactNumber.trim().length >= 9 ? (
                          <span className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Verified to receive SMS booking alerts
                          </span>
                        ) : (
                          <span className="text-[10px] text-on-surface-variant mt-1 block">
                            Format: +94 7X XXX XXXX for SMS booking alerts
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Condition Level */}
                    <div>
                      <label className="block text-xs font-bold text-on-surface mb-1">
                        Item Condition Level <span className="text-error">*</span>
                      </label>
                      <div className="flex gap-2">
                        {["Brand New", "Mint (Near New)", "Good Working"].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setConditionLevel(c);
                              if (errors.conditionLevel)
                                setErrors((prev) => ({ ...prev, conditionLevel: undefined }));
                            }}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-headline font-bold transition-all border ${
                              conditionLevel === c
                                ? "bg-primary text-white border-primary shadow-xs"
                                : "bg-surface-container-low text-on-surface-variant border-surface-container hover:bg-surface-container"
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                      {errors.conditionLevel && (
                        <span className="text-[10px] text-error font-medium mt-1 block">
                          {errors.conditionLevel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ============================================================= */}
                  {/* 2. DYNAMIC CATEGORY-SPECIFIC SPECIFICATIONS SECTION */}
                  {/* ============================================================= */}
                  <div className="p-6 rounded-2xl bg-white border border-surface-container shadow-card space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-surface-container">
                      <div className="w-7 h-7 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-xs">
                        2
                      </div>
                      <div>
                        <h2 className="font-headline text-base font-bold text-on-surface">
                          {category} Specifications
                        </h2>
                        <p className="text-xs text-on-surface-variant">
                          Tailored technical attributes for {category.toLowerCase()}.
                        </p>
                      </div>
                    </div>

                    {/* SPEC CASE A: VEHICLES & MOTORCYCLES */}
                    {isVehicleOrMoto && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Transmission */}
                          <div>
                            <label className="block text-xs font-bold text-on-surface mb-1">
                              Transmission <span className="text-error">*</span>
                            </label>
                            <select
                              value={vehicleTransmission}
                              onChange={(e) => setVehicleTransmission(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="Automatic">Automatic</option>
                              <option value="Manual">Manual</option>
                              <option value="Tiptronic">Tiptronic / Paddle Shift</option>
                            </select>
                          </div>

                          {/* Fuel Type */}
                          <div>
                            <label className="block text-xs font-bold text-on-surface mb-1">
                              Fuel Type <span className="text-error">*</span>
                            </label>
                            <select
                              value={vehicleFuel}
                              onChange={(e) => setVehicleFuel(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="Diesel">Diesel</option>
                              <option value="Petrol">Petrol</option>
                              <option value="Hybrid">Hybrid (Petrol/Electric)</option>
                              <option value="Electric">Pure Electric (EV)</option>
                            </select>
                          </div>

                          {/* Seating / Capacity */}
                          <div>
                            <label className="block text-xs font-bold text-on-surface mb-1">
                              {isMotorcycle ? "Riding Capacity" : "Seating Capacity"}{" "}
                              <span className="text-error">*</span>
                            </label>
                            <select
                              value={vehicleSeats}
                              onChange={(e) => setVehicleSeats(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              {isMotorcycle ? (
                                <>
                                  <option value="2 Seats">2 Seats (Rider + Pillion)</option>
                                  <option value="1 Seat (Solo)">1 Seat (Solo)</option>
                                </>
                              ) : (
                                <>
                                  <option value="2 Seats">2 Seats (Coupe / Pickup)</option>
                                  <option value="4-5 Seats">5 Seats (Sedan / Hatch / SUV)</option>
                                  <option value="7 Seats">7 Seats (Large 4x4 SUV)</option>
                                  <option value="10-14 Seats">10-14 Seats (Passenger Van)</option>
                                </>
                              )}
                            </select>
                          </div>
                        </div>

                        {/* MANDATORY LEGAL & DELIVERY LOCK BANNER FOR VEHICLES */}
                        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 space-y-1.5">
                          <div className="flex items-center gap-1.5 font-headline font-bold text-xs text-amber-950">
                            <span className="material-symbols-outlined text-[18px] text-amber-700">
                              gavel
                            </span>
                            <span>Delivery Mode: Self-Pickup &amp; In-Person Inspection Only (Locked)</span>
                          </div>
                          <p className="text-[11px] text-amber-800 leading-relaxed">
                            Due to insurance &amp; vehicle registration laws in Sri Lanka, courier delivery is strictly disabled for vehicles. Renter must present physical Driving License &amp; NIC upon key handover.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* SPEC CASE B: CAMERAS & CINE GEAR */}
                    {isCamera && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Sensor / Resolution */}
                          <div>
                            <label className="block text-xs font-bold text-on-surface mb-1">
                              Sensor / Resolution <span className="text-error">*</span>
                            </label>
                            <select
                              value={cameraSensor}
                              onChange={(e) => setCameraSensor(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="4K Full-Frame Cinema">4K Cinema Full-Frame (Exmor R / Dual ISO)</option>
                              <option value="8K Full-Frame Cinema">8K Full-Frame Cinema</option>
                              <option value="Super35 / APS-C Cinema">Super35 / APS-C Cinema</option>
                              <option value="Mirrorless Stills & 4K Video">Mirrorless Stills &amp; 4K Video</option>
                            </select>
                          </div>

                          {/* Included Lenses */}
                          <div>
                            <label className="block text-xs font-bold text-on-surface mb-1">
                              Included Lenses / Glass
                            </label>
                            <input
                              type="text"
                              value={cameraLens}
                              onChange={(e) => setCameraLens(e.target.value)}
                              placeholder="e.g., Sony FE 24-70mm f/2.8 GM II or Prime Trio"
                              className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>

                        {/* Accessories Included Checklist */}
                        <div>
                          <label className="block text-xs font-bold text-on-surface mb-1.5">
                            Accessories Included in this Kit:
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {[
                              "CFexpress Cards (2x 160GB)",
                              "3x Extra Rechargeable Batteries",
                              "Pelican 1510 Hard Case",
                              "Tilta Full Camera Cage",
                              "Dual V-Mount Fast Charger",
                              "Top Handle Shotgun Mic",
                            ].map((acc) => (
                              <label
                                key={acc}
                                className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                                  cameraAccessories.includes(acc)
                                    ? "bg-primary-fixed/20 border-primary text-on-surface font-semibold"
                                    : "bg-surface-container-low border-surface-container text-on-surface-variant hover:bg-surface-container"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={cameraAccessories.includes(acc)}
                                  onChange={() => toggleCameraAccessory(acc)}
                                  className="w-3.5 h-3.5 rounded text-primary focus:ring-primary"
                                />
                                <span className="text-[11px]">{acc}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Delivery Option for Cameras */}
                        <div>
                          <label className="block text-xs font-bold text-on-surface mb-1.5">
                            Fulfillment &amp; Delivery Option:
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <label
                              onClick={() => setDeliveryOption("pickup")}
                              className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                                deliveryOption === "pickup"
                                  ? "border-primary bg-primary-fixed/20 font-bold text-on-surface"
                                  : "border-surface-container bg-surface-container-low text-on-surface-variant"
                              }`}
                            >
                              <input
                                type="radio"
                                name="camera-delivery"
                                checked={deliveryOption === "pickup"}
                                onChange={() => setDeliveryOption("pickup")}
                                className="text-primary"
                              />
                              <span>Self-Pickup at Handover Hub (Free)</span>
                            </label>

                            <label
                              onClick={() => setDeliveryOption("courier")}
                              className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                                deliveryOption === "courier"
                                  ? "border-primary bg-primary-fixed/20 font-bold text-on-surface"
                                  : "border-surface-container bg-surface-container-low text-on-surface-variant"
                              }`}
                            >
                              <input
                                type="radio"
                                name="camera-delivery"
                                checked={deliveryOption === "courier"}
                                onChange={() => setDeliveryOption("courier")}
                                className="text-primary"
                              />
                              <span>Secure Courier Delivery (+LKR 1,500)</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SPEC CASE C: TOOLS & POWER MACHINERY */}
                    {isTool && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Power Source */}
                          <div>
                            <label className="block text-xs font-bold text-on-surface mb-1">
                              Power Source <span className="text-error">*</span>
                            </label>
                            <select
                              value={toolPowerSource}
                              onChange={(e) => setToolPowerSource(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="Silent Diesel Engine">Silent Diesel Engine</option>
                              <option value="Electric 230V Single Phase">Electric 230V Single Phase</option>
                              <option value="Industrial 415V 3-Phase">Industrial 415V 3-Phase</option>
                              <option value="Lithium-Ion Battery Powered">Lithium-Ion Battery Powered</option>
                              <option value="Manual / Hydraulic">Manual / Hydraulic</option>
                            </select>
                          </div>

                          {/* Operator Option */}
                          <div>
                            <label className="block text-xs font-bold text-on-surface mb-1">
                              Operator Option <span className="text-error">*</span>
                            </label>
                            <select
                              value={toolOperator}
                              onChange={(e) => setToolOperator(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="Self-Operated (Hirer provides operator)">
                                Self-Operated (Hirer provides operator)
                              </option>
                              <option value="Certified Operator Included in Daily Hire">
                                Certified Operator Included in Daily Hire
                              </option>
                            </select>
                          </div>
                        </div>

                        {/* Delivery Option for Machinery */}
                        <div>
                          <label className="block text-xs font-bold text-on-surface mb-1.5">
                            Machinery Logistics &amp; Transport:
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <label
                              onClick={() => setDeliveryOption("pickup")}
                              className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                                deliveryOption === "pickup"
                                  ? "border-primary bg-primary-fixed/20 font-bold text-on-surface"
                                  : "border-surface-container bg-surface-container-low text-on-surface-variant"
                              }`}
                            >
                              <input
                                type="radio"
                                name="tool-delivery"
                                checked={deliveryOption === "pickup"}
                                onChange={() => setDeliveryOption("pickup")}
                                className="text-primary"
                              />
                              <span>Self-Pickup from Workshop (Free)</span>
                            </label>

                            <label
                              onClick={() => setDeliveryOption("courier")}
                              className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                                deliveryOption === "courier"
                                  ? "border-primary bg-primary-fixed/20 font-bold text-on-surface"
                                  : "border-surface-container bg-surface-container-low text-on-surface-variant"
                              }`}
                            >
                              <input
                                type="radio"
                                name="tool-delivery"
                                checked={deliveryOption === "courier"}
                                onChange={() => setDeliveryOption("courier")}
                                className="text-primary"
                              />
                              <span>Low-Bed Transport Truck (+LKR 4,500)</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SPEC CASE D: GENERAL & EVENTS */}
                    {isEvent && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-on-surface mb-1">
                              Event Suitability <span className="text-error">*</span>
                            </label>
                            <input
                              type="text"
                              value={eventType}
                              onChange={(e) => setEventType(e.target.value)}
                              placeholder="e.g., Weddings, Stage Concerts & Festivals"
                              className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-on-surface mb-1">
                              Setup Support <span className="text-error">*</span>
                            </label>
                            <select
                              value={eventSetup}
                              onChange={(e) => setEventSetup(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="On-Site Technical Crew Available">
                                On-Site Technical Crew Available
                              </option>
                              <option value="Self-Setup by Hirer">Self-Setup by Hirer</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Description & AI Specs Assist */}
                  <div className="p-6 rounded-2xl bg-white border border-surface-container shadow-card space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-surface-container">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-xs">
                          3
                        </div>
                        <div>
                          <h2 className="font-headline text-base font-bold text-on-surface">
                            Item Description &amp; Details
                          </h2>
                          <p className="text-xs text-on-surface-variant">
                            Accurate details boost your listing discovery by 40%.
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
                        ✨ Auto-Generate Description with AI
                      </button>
                    </div>

                    <div>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => {
                          setDescription(e.target.value);
                          if (errors.description)
                            setErrors((prev) => ({ ...prev, description: undefined }));
                        }}
                        placeholder={
                          isVehicle
                            ? "e.g., Immaculate 4x4 double cab with comprehensive insurance, pristine AC, Bluetooth multimedia, and all-island permit. Available for pickup in Colombo or Kandy."
                            : isCamera
                            ? "e.g., Professional grade full-frame cinema kit with prime lenses, Pelican hard flight case, and dual chargers. Clean sensor and verified firmware."
                            : "e.g., Well-maintained commercial asset tested and ready for immediate deployment across Sri Lanka."
                        }
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border text-xs text-on-surface placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed transition-all ${
                          errors.description
                            ? "border-error ring-1 ring-error bg-red-50/20"
                            : "border-surface-container"
                        }`}
                      ></textarea>

                      <div className="flex items-center justify-between text-[10px] text-on-surface-variant mt-1">
                        {errors.description ? (
                          <span className="text-error font-medium">{errors.description}</span>
                        ) : (
                          <span className="flex items-center gap-1 text-primary font-semibold">
                            <span className="material-symbols-outlined text-[14px]">tune</span>
                            Optimized for local search algorithms (RentLanka SEO)
                          </span>
                        )}
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
                          "Driver / Operator Option",
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

                  {/* 4. Visual Showcase & Photos */}
                  <div className="p-6 rounded-2xl bg-white border border-surface-container shadow-card space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-surface-container">
                      <div className="w-7 h-7 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-xs">
                        4
                      </div>
                      <div>
                        <h2 className="font-headline text-base font-bold text-on-surface">
                          Visual Showcase &amp; Photos <span className="text-error">*</span>
                        </h2>
                        <p className="text-xs text-on-surface-variant">
                          Upload at least 1 clear photo. First photo serves as the marketplace thumbnail.
                        </p>
                      </div>
                    </div>

                    {/* Drag and Drop Zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                        isDragOver
                          ? "border-primary bg-primary-fixed/20 scale-[1.01]"
                          : errors.images
                          ? "border-error bg-red-50/30"
                          : "border-surface-container-high hover:border-primary bg-surface-container-low/40"
                      }`}
                    >
                      <input
                        type="file"
                        multiple
                        accept="image/png,image/jpeg,image/webp"
                        id="host-upload"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="host-upload"
                        className="cursor-pointer flex flex-col items-center justify-center space-y-1.5"
                      >
                        <span className="material-symbols-outlined text-primary text-[36px]">
                          add_photo_alternate
                        </span>
                        <span className="font-headline text-xs font-bold text-on-surface">
                          Drag &amp; drop high-res photos or browse from your computer
                        </span>
                        <span className="text-[10px] text-on-surface-variant">
                          PNG, JPG, or WEBP up to 25MB each.
                        </span>
                      </label>
                    </div>

                    {errors.images && (
                      <span className="text-[10px] text-error font-medium block">
                        {errors.images}
                      </span>
                    )}

                    {/* Uploaded Photos Grid */}
                    {images.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-on-surface-variant">
                          <span className="font-semibold text-on-surface">
                            {images.length} Photo{images.length > 1 ? "s" : ""} Selected
                          </span>
                          <span className="text-[10px] text-primary font-bold">
                            {images.filter((img) => !img.isUploading && img.publicUrl).length} / {images.length} Uploaded to Supabase
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {images.map((img, idx) => (
                            <div
                              key={img.id}
                              className="relative rounded-xl overflow-hidden aspect-[4/3] bg-surface-container border border-surface-container shadow-xs group"
                            >
                              <img
                                src={img.previewUrl}
                                alt={`Item angle ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />

                              {idx === 0 && (
                                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-primary text-white text-[9px] font-bold shadow-xs flex items-center gap-1">
                                  ★ Cover Photo
                                </span>
                              )}

                              <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => triggerReplacePhoto(idx)}
                                  title="Replace Photo"
                                  className="w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[13px]">sync</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removePhoto(idx)}
                                  title="Remove Photo"
                                  className="w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[13px]">close</span>
                                </button>
                              </div>

                              <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-[9px] text-white bg-black/60 backdrop-blur-xs px-2 py-1 rounded">
                                <div className="flex items-center gap-1">
                                  <span>#{idx + 1}</span>
                                  <span className="text-slate-300">•</span>
                                  <span>{img.sizeFormatted}</span>
                                </div>

                                {img.isUploading ? (
                                  <span className="flex items-center gap-1 text-amber-300 font-bold">
                                    <span className="w-2.5 h-2.5 border border-amber-300 border-t-transparent rounded-full animate-spin"></span>
                                    Uploading
                                  </span>
                                ) : img.error ? (
                                  <span className="text-red-400 font-bold" title={img.error}>
                                    Error
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-0.5 text-emerald-400 font-bold">
                                    <span className="material-symbols-outlined text-[11px]">cloud_done</span>
                                    Supabase
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 5. Rates, Escrow & Availability */}
                  <div className="p-6 rounded-2xl bg-white border border-surface-container shadow-card space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-surface-container">
                      <div className="w-7 h-7 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-xs">
                        5
                      </div>
                      <div>
                        <h2 className="font-headline text-base font-bold text-on-surface">
                          Rates, Escrow &amp; Availability
                        </h2>
                        <p className="text-xs text-on-surface-variant">
                          Set transparent compensation and damage insurance requirements.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Daily Rate */}
                      <div>
                        <label htmlFor="rate-price" className="block text-xs font-bold text-on-surface mb-1">
                          Daily Rental Rate <span className="text-error">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-[11px] font-bold text-primary font-headline">
                            LKR
                          </span>
                          <input
                            id="rate-price"
                            type="number"
                            min="0"
                            value={pricePerDay}
                            onChange={(e) => {
                              setPricePerDay(e.target.value);
                              if (errors.pricePerDay)
                                setErrors((prev) => ({ ...prev, pricePerDay: undefined }));
                            }}
                            placeholder="e.g., 18500"
                            className={`w-full pl-11 pr-3 py-2 rounded-xl bg-surface-container-low border text-xs font-bold text-on-surface placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                              errors.pricePerDay
                                ? "border-error ring-1 ring-error bg-red-50/20"
                                : "border-surface-container"
                            }`}
                          />
                        </div>
                        {errors.pricePerDay && (
                          <span className="text-[10px] text-error font-medium mt-1 block">
                            {errors.pricePerDay}
                          </span>
                        )}
                      </div>

                      {/* Weekly Discount */}
                      <div>
                        <label htmlFor="rate-discount" className="block text-xs font-bold text-on-surface mb-1">
                          Weekly Discount
                        </label>
                        <input
                          id="rate-discount"
                          type="text"
                          value={weeklyDiscount}
                          onChange={(e) => setWeeklyDiscount(e.target.value)}
                          placeholder="e.g., 15% off for 7+ days"
                          className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      {/* Refundable Deposit */}
                      <div>
                        <label htmlFor="rate-deposit" className="block text-xs font-bold text-on-surface mb-1">
                          Refundable Deposit <span className="text-error">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-[11px] font-bold text-secondary font-headline">
                            LKR
                          </span>
                          <input
                            id="rate-deposit"
                            type="number"
                            min="0"
                            value={securityDeposit}
                            onChange={(e) => {
                              setSecurityDeposit(e.target.value);
                              if (errors.securityDeposit)
                                setErrors((prev) => ({ ...prev, securityDeposit: undefined }));
                            }}
                            placeholder="e.g., 20000"
                            className={`w-full pl-11 pr-3 py-2 rounded-xl bg-surface-container-low border text-xs font-bold text-on-surface placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                              errors.securityDeposit
                                ? "border-error ring-1 ring-error bg-red-50/20"
                                : "border-surface-container"
                            }`}
                          />
                        </div>
                        {errors.securityDeposit && (
                          <span className="text-[10px] text-error font-medium mt-1 block">
                            {errors.securityDeposit}
                          </span>
                        )}
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
                    className="w-full py-4 rounded-2xl bg-primary text-white font-headline font-bold text-sm shadow-[0_4px_18px_rgba(0,105,72,0.35)] hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Saving to RentLanka Database...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">publish</span>
                        <span>Publish {category} Listing Now</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* RIGHT 4 COLS: HOST PROFILE & DYNAMIC LIVE MARKETPLACE PREVIEW */}
              <div className="lg:col-span-4 space-y-6 sticky top-28">
                {/* Host Profile Card / Guest Host Protection Shield */}
                {isAuthenticated && user ? (
                  <div className="rounded-2xl bg-white border border-surface-container p-5 shadow-card space-y-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-primary to-teal-400 text-white font-bold flex items-center justify-center uppercase shadow-xs shrink-0">
                        {hostInitials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 font-headline font-bold text-sm text-on-surface truncate">
                          <span className="truncate">{user.name}</span>
                          <span className="material-symbols-outlined text-primary text-[16px] shrink-0" title="Verified Host">
                            verified
                          </span>
                        </div>
                        <div className="text-[11px] text-on-surface-variant truncate">
                          {user.email}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-fixed/40 text-[10px] font-bold text-on-primary-fixed">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                            {user.role === "host" ? "Verified Host" : "Verified Member"}
                          </span>
                          {user.nic && (
                            <span className="text-[10px] text-on-surface-variant font-medium">
                              • NIC: {user.nic}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
                        <span className="font-semibold text-on-surface">Account Trust Score</span>
                      </div>
                      <span className="font-headline font-black text-primary text-sm">
                        98 / 100
                      </span>
                    </div>
                  </div>
                ) : (
                  /* GUEST STATE: RENTLANKA HOST PROTECTION SHIELD */
                  <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-white to-primary-fixed/20 border-2 border-primary/25 p-5 shadow-card space-y-4 text-xs">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center shadow-[0_4px_14px_rgba(0,105,72,0.25)] shrink-0">
                        <span className="material-symbols-outlined text-[24px]">shield_with_heart</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-headline font-extrabold text-sm text-on-surface">
                            RentLanka Host Protection
                          </h4>
                        </div>
                        <p className="text-[11px] text-on-surface-variant font-medium leading-tight mt-0.5">
                          Islandwide asset safety &amp; verified renter protocol
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-1 border-t border-surface-container">
                      <div className="flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">
                          health_and_safety
                        </span>
                        <div>
                          <p className="font-bold text-on-surface text-[11px]">
                            LKR 1,500,000 Damage Cover
                          </p>
                          <p className="text-[10px] text-on-surface-variant">
                            Underwritten insurance and collision protection for complete peace of mind.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">
                          lock
                        </span>
                        <div>
                          <p className="font-bold text-on-surface text-[11px]">
                            LankaPay Escrow Security
                          </p>
                          <p className="text-[10px] text-on-surface-variant">
                            Refundable deposit is locked upfront before you hand over any equipment.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">
                          badge
                        </span>
                        <div>
                          <p className="font-bold text-on-surface text-[11px]">
                            100% NIC-Verified Renters
                          </p>
                          <p className="text-[10px] text-on-surface-variant">
                            Every renter undergoes automated Sri Lankan NIC / Passport checks.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-surface-container flex items-center justify-between">
                      <span className="text-[10px] text-on-surface-variant">Already a verified host?</span>
                      <Link
                        to="/login?redirect=/list-your-item"
                        className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5"
                      >
                        <span>Sign In</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                )}

                {/* 100% Dynamic Live Marketplace Card Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-on-surface-variant px-1">
                    <span className="font-headline font-bold uppercase tracking-wider text-[10px]">
                      Live Marketplace Card Preview
                    </span>
                    <span className="text-[10px] text-primary font-bold bg-primary-fixed/40 px-2 py-0.5 rounded">
                      Live Preview
                    </span>
                  </div>

                  <div className="rounded-2xl bg-white border border-surface-container shadow-card overflow-hidden">
                    {/* Photo Preview / Empty State Box */}
                    <div className="relative aspect-[16/10] bg-surface-container">
                      {images.length > 0 ? (
                        <>
                          <img
                            src={images[0].previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover transition-all duration-300"
                          />
                          {images[0].isUploading ? (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-1">
                              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              <span className="text-[10px] font-semibold">Uploading to Supabase...</span>
                            </div>
                          ) : (
                            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-primary shadow-xs flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Available Today
                            </span>
                          )}
                          {images.length > 1 && (
                            <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[9px] font-bold bg-black/70 text-white backdrop-blur-xs">
                              +{images.length - 1} more
                            </span>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-surface-container-high/60 bg-surface-container-low/50">
                          <span className="material-symbols-outlined text-[36px] text-slate-300 mb-1">
                            add_photo_alternate
                          </span>
                          <span className="font-headline text-xs font-semibold text-slate-500">
                            Photo preview will appear here
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            Upload a photo in Section 4
                          </span>
                          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-slate-200/70 text-slate-600">
                            ○ Draft Preview
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                        <span className="text-primary font-bold">{category || "Category"}</span>
                        <span className="truncate max-w-[140px]">
                          {location ? location.replace(/\s*\(.*\)/, "") : "Location"}
                        </span>
                      </div>

                      <h3
                        className={`font-headline text-sm font-bold line-clamp-1 ${
                          title.trim() ? "text-on-surface" : "text-slate-400 italic"
                        }`}
                      >
                        {title.trim() || "Item Title"}
                      </h3>

                      {/* Dynamic Specs Micro-Pills in Preview Card */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-600">
                        {isVehicleOrMoto ? (
                          <>
                            <span className="px-1.5 py-0.5 rounded bg-surface-container font-medium">
                              {vehicleTransmission}
                            </span>
                            <span>•</span>
                            <span className="px-1.5 py-0.5 rounded bg-surface-container font-medium">
                              {vehicleFuel}
                            </span>
                            <span>•</span>
                            <span className="px-1.5 py-0.5 rounded bg-surface-container font-medium">
                              {vehicleSeats}
                            </span>
                          </>
                        ) : isCamera ? (
                          <>
                            <span className="px-1.5 py-0.5 rounded bg-surface-container font-medium">
                              {cameraSensor}
                            </span>
                            <span>•</span>
                            <span className="text-primary font-semibold">Kit Ready</span>
                          </>
                        ) : isTool ? (
                          <>
                            <span className="px-1.5 py-0.5 rounded bg-surface-container font-medium">
                              {toolPowerSource}
                            </span>
                            <span>•</span>
                            <span className="text-primary font-semibold">Heavy Duty</span>
                          </>
                        ) : (
                          <>
                            <span className="px-1.5 py-0.5 rounded bg-surface-container font-medium">
                              {conditionLevel ? `${conditionLevel} Condition` : "Verified Gear"}
                            </span>
                            <span>•</span>
                            <span className="text-primary font-semibold">Deposit Protected</span>
                          </>
                        )}
                      </div>

                      {/* Price */}
                      <div className="pt-2 border-t border-surface-container flex items-baseline justify-between">
                        <div>
                          <span className="font-headline font-black text-base text-on-surface">
                            {pricePerDay && Number(pricePerDay) > 0
                              ? `LKR ${Number(pricePerDay).toLocaleString()}`
                              : "LKR --"}
                          </span>
                          <span className="text-[10px] text-on-surface-variant"> / day</span>
                        </div>
                        <span className="text-amber-500 font-bold text-[11px]">★ 5.0 (New)</span>
                      </div>
                    </div>

                    {/* Card Guarantee Footer */}
                    <div className="p-3 bg-surface-container-low border-t border-surface-container text-[10px] text-on-surface-variant space-y-1">
                      <div className="flex items-center gap-1 text-primary font-semibold">
                        <span className="material-symbols-outlined text-[13px]">security</span>
                        <span>RentLanka Guarantee: Up to LKR 1,500,000</span>
                      </div>
                      <p>
                        {isVehicleOrMoto
                          ? "Includes licensed roadside assist and collision escrow protection."
                          : "Host platform commission is only 6% upon completed rental payouts."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SIGN IN REQUIRED TO HOST MODAL */}
      {/* ========================================================================= */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-surface-container relative space-y-5 animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            {/* Icon Header */}
            <div className="w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary mx-auto shadow-xs">
              <span className="material-symbols-outlined text-[32px]">shield_person</span>
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-headline text-xl sm:text-2xl font-black text-on-surface tracking-tight">
                Sign In or Register to Publish Your Listing
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                To protect the RentLanka marketplace and connect renters to your verified host profile, please sign in.
              </p>
            </div>

            {/* Saved Draft Notice */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-900">
              <span className="material-symbols-outlined text-emerald-700 text-[20px] shrink-0 mt-0.5">
                bookmark_check
              </span>
              <div>
                <p className="font-bold">Your listing draft is safely saved!</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  All your filled specifications, rates, and photos have been preserved. You will not lose your work upon returning.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  saveDraftToLocalStorage();
                  navigate("/login?redirect=/list-your-item");
                }}
                className="w-full py-3.5 rounded-xl bg-primary text-white font-headline text-sm font-bold shadow-xs hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span>Log In / Register</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  saveDraftToLocalStorage();
                  navigate("/register?redirect=/list-your-item");
                }}
                className="w-full py-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container text-on-surface font-headline text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Create Free Host Account</span>
              </button>
            </div>

            <p className="text-center text-[11px] text-on-surface-variant pt-1">
              Protected by LankaPay Escrow &amp; Government NIC Verification
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListItemPage;
