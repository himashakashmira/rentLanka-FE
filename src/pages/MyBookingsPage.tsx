import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  ShieldCheck,
  FileText,
  MessageCircle,
  XCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Search,
  ExternalLink,
} from "lucide-react";
import { useAppSelector } from "../app/store";
import { bookingsApi } from "../services/api";
import { Booking } from "../types";

export const MyBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "pending" | "history">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchCustomerBookings = async () => {
    try {
      setLoading(true);
      const allBookings = await bookingsApi.getAll();
      // Filter bookings placed by this user (by email or phone/name)
      if (user) {
        const userEmail = (user.email || "").toLowerCase().trim();
        const userName = (user.name || "").toLowerCase().trim();
        const userBookings = (allBookings || []).filter((b) => {
          const bEmail = (b.renter_email || "").toLowerCase().trim();
          const bName = (b.renter_name || "").toLowerCase().trim();
          return bEmail === userEmail || bName === userName;
        });
        setBookings(userBookings);
      } else {
        setBookings(allBookings || []);
      }
    } catch (err: any) {
      console.error("Failed to load customer bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchCustomerBookings();
  }, [user]);

  // Handle Cancel Request
  const handleCancelBooking = async (booking: Booking) => {
    if (!window.confirm(`Are you sure you want to cancel your rental request for "${booking.item_title}"?`)) {
      return;
    }

    setActionLoadingId(booking._id);
    setToastMessage(null);

    try {
      const itemId =
        typeof booking.item_id === "object"
          ? booking.item_id?._id || (booking.item_id as any)?.id
          : booking.item_id;

      await bookingsApi.updateStatus(booking._id, "Cancelled", itemId);
      setBookings((prev) =>
        prev.map((b) => (b._id === booking._id ? { ...b, status: "Cancelled" } : b))
      );
      setToastMessage({
        type: "success",
        text: `Rental request #${booking.booking_reference} has been cancelled.`,
      });
    } catch (err: any) {
      setToastMessage({
        type: "error",
        text: err.message || "Failed to cancel booking request.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Generate & Print Official PDF Receipt / Voucher
  const handlePrintReceipt = (booking: Booking) => {
    const voucherWindow = window.open("", "_blank");
    if (!voucherWindow) {
      alert("Please allow pop-ups to view and download your official rental voucher.");
      return;
    }

    const itemTitle = booking.item_title;
    const ref = booking.booking_reference || "#LK-RENT";
    const total = Number(booking.total_price || 0).toLocaleString();
    const deposit = Number(booking.security_deposit || 20000).toLocaleString();
    const platformFee = Number(booking.platform_fee || 2500).toLocaleString();

    const voucherHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>RentLanka Rental Voucher - ${ref}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0b1c30; padding: 30px; background: #fff; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #006948; padding-bottom: 16px; margin-bottom: 24px; }
          .logo { font-size: 24px; font-weight: 900; color: #0b1c30; }
          .logo span { color: #006948; }
          .badge { background: #e6f4ea; color: #006948; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 12px; }
          .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; background: #f8fafc; }
          .card-title { font-size: 14px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 12px; }
          .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #edf2f7; font-size: 13px; }
          .row:last-child { border-bottom: none; }
          .bold { font-weight: 700; color: #0b1c30; }
          .total { font-size: 18px; font-weight: 900; color: #006948; padding-top: 10px; border-top: 2px solid #006948; }
          .checklist { background: #f0fdf4; border: 1px dashed #006948; border-radius: 12px; padding: 16px; margin-top: 20px; font-size: 12px; }
          .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">Rent<span>Lanka</span></div>
            <p style="margin: 3px 0 0; font-size: 12px; color: #64748b;">Official Peer Rental Escrow Agreement</p>
          </div>
          <div style="text-align: right;">
            <div class="badge">● LANKAPAY ESCROW PROTECTED</div>
            <p style="margin: 4px 0 0; font-family: monospace; font-size: 13px; font-weight: bold; color: #006948;">${ref}</p>
          </div>
        </div>

        <div class="card">
          <div class="card-title">Rental Asset &amp; Handover Schedule</div>
          <div class="row"><span>Asset Booked:</span><span class="bold">${itemTitle}</span></div>
          <div class="row"><span>Handover Location:</span><span class="bold">📍 ${booking.item_location || "Colombo Central Hub"}</span></div>
          <div class="row"><span>Rental Duration:</span><span class="bold">${booking.start_date} to ${booking.end_date} (${booking.duration_days} Days)</span></div>
          <div class="row"><span>Handover Window:</span><span class="bold">08:00 AM onwards (Inspection Required)</span></div>
          <div class="row"><span>Return Deadline:</span><span class="bold">By 06:00 PM on ${booking.end_date}</span></div>
        </div>

        <div class="card">
          <div class="card-title">Verified Customer Information</div>
          <div class="row"><span>Customer Name:</span><span class="bold">${booking.renter_name}</span></div>
          <div class="row"><span>Contact Phone:</span><span class="bold">${booking.renter_phone}</span></div>
          <div class="row"><span>National NIC / ID:</span><span class="bold">${booking.renter_nic || "Verified"}</span></div>
          <div class="row"><span>Customer Email:</span><span class="bold">${booking.renter_email || "N/A"}</span></div>
        </div>

        <div class="card">
          <div class="card-title">Financial Breakdown &amp; Escrow Guarantee</div>
          <div class="row"><span>Daily Rate:</span><span>LKR ${(booking.daily_rate || 0).toLocaleString()} / day</span></div>
          <div class="row"><span>Total Hire Amount:</span><span class="bold">LKR ${total}</span></div>
          <div class="row"><span>Refundable Security Deposit (Hold):</span><span class="bold">LKR ${deposit}</span></div>
          <div class="row"><span>RentLanka Shield Fee:</span><span>LKR ${platformFee}</span></div>
          <div class="row total"><span>Total Authorized via LankaPay:</span><span>LKR ${(Number(booking.total_price || 0) + Number(booking.security_deposit || 0)).toLocaleString()}</span></div>
        </div>

        <div class="checklist">
          <strong>Handover Instructions:</strong>
          <ul style="margin: 6px 0 0; padding-left: 18px;">
            <li>Present this document with original National NIC and Driver's License at pickup.</li>
            <li>Perform joint inspection and photograph all pre-existing conditions.</li>
            <li>Security deposit hold will be automatically released within 2-4 hours of return.</li>
          </ul>
        </div>

        <div class="footer">
          <p>© 2025 RentLanka Technologies (Pvt) Ltd. Verified via LankaPay Switch. Customer Hotline: +94 78 360 4911</p>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    voucherWindow.document.write(voucherHtml);
    voucherWindow.document.close();
  };

  // Open WhatsApp with prefilled message
  const handleChatWithHost = (booking: Booking) => {
    // If item has contact number, use it; otherwise fallback to default RentLanka host operations hotline
    let hostPhone = "+94783604911";
    if (typeof booking.item_id === "object" && (booking.item_id as any)?.contact_number) {
      hostPhone = (booking.item_id as any).contact_number;
    }
    const cleanPhone = hostPhone.replace(/[^0-9]/g, "");
    const message = `Hello! I have booked "${booking.item_title}" (Ref: ${booking.booking_reference}) on RentLanka. I'd like to coordinate pickup and handover details!`;
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  // Filtering tabs
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Tab filter
      if (activeTab === "pending" && b.status !== "Pending") return false;
      if (activeTab === "active" && b.status !== "Confirmed") return false;
      if (activeTab === "history" && !["Rejected", "Cancelled"].includes(b.status)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = b.item_title.toLowerCase().includes(q);
        const matchRef = (b.booking_reference || "").toLowerCase().includes(q);
        const matchLoc = (b.item_location || "").toLowerCase().includes(q);
        return matchTitle || matchRef || matchLoc;
      }
      return true;
    });
  }, [bookings, activeTab, searchQuery]);

  const pendingCount = useMemo(() => bookings.filter((b) => b.status === "Pending").length, [bookings]);
  const activeCount = useMemo(() => bookings.filter((b) => b.status === "Confirmed").length, [bookings]);

  return (
    <div className="min-h-screen bg-surface pt-24 sm:pt-28 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold transition-all shadow-card ${
              toastMessage.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                : "bg-rose-50 border border-rose-200 text-rose-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{toastMessage.text}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-500 hover:text-slate-800 p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* HEADER: CUSTOMER DASHBOARD TITLE & METRICS */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-container">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                Customer Operations Portal
              </span>
              <span className="text-xs text-on-surface-variant font-medium">• LankaPay Escrow Protected</span>
            </div>
            <h1 className="font-headline text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
              My Rental Reservations
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              Track real-time host confirmations, inspect handover vouchers, and download receipts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchCustomerBookings}
              className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-headline text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
              <span>Sync Status</span>
            </button>
            <Link
              to="/explore"
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-headline text-xs font-bold transition-all shadow-[0_4px_14px_rgba(0,105,72,0.25)] flex items-center gap-1.5"
            >
              <span>Explore More Fleet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick Stat Pill Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white p-4 border border-surface-container shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-400">Total Bookings</p>
              <h3 className="font-headline text-2xl font-black text-on-surface">{bookings.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 border border-surface-container shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-400">Pending Host Review</p>
              <h3 className={`font-headline text-2xl font-black ${pendingCount > 0 ? "text-amber-600" : "text-on-surface"}`}>
                {pendingCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 border border-surface-container shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-400">Approved &amp; Confirmed</p>
              <h3 className="font-headline text-2xl font-black text-primary">{activeCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-primary font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TABS & SEARCH BAR */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container pb-2">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`py-2.5 px-4 rounded-xl font-headline text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "all"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80"
              }`}
            >
              <span>All Bookings</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">{bookings.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("active")}
              className={`py-2.5 px-4 rounded-xl font-headline text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "active"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80"
              }`}
            >
              <span>Active Rentals</span>
              {activeCount > 0 && (
                <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                  {activeCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("pending")}
              className={`py-2.5 px-4 rounded-xl font-headline text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "pending"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80"
              }`}
            >
              <span>Pending Review</span>
              {pendingCount > 0 && (
                <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`py-2.5 px-4 rounded-xl font-headline text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "history"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80"
              }`}
            >
              <span>Past History</span>
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by asset or ref..."
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-on-surface placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOOKINGS LIST */}
        {/* ========================================================================= */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500 font-headline">Loading your rental orders...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-surface-container shadow-xs space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-primary mx-auto flex items-center justify-center font-bold">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-headline text-xl font-bold text-on-surface">No Reservations Found</h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                {searchQuery
                  ? `No orders matching "${searchQuery}". Try clearing your search.`
                  : "You haven't placed any rental bookings yet. Explore 4x4 SUVs, FX6 cine cameras, and machinery across Sri Lanka!"}
              </p>
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-headline text-xs font-bold hover:bg-primary-container transition-all shadow-xs"
            >
              <span>Browse Rental Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => {
              const isPending = b.status === "Pending";
              const isConfirmed = b.status === "Confirmed";
              const isDeclined = b.status === "Rejected" || b.status === "Cancelled";

              const itemId =
                typeof b.item_id === "object"
                  ? b.item_id?._id || (b.item_id as any)?.id
                  : b.item_id;

              return (
                <div
                  key={b._id}
                  className="rounded-3xl bg-white border border-surface-container-high/90 p-5 sm:p-6 shadow-card hover:shadow-card-elevated transition-all space-y-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-surface-container">
                    {/* Asset Overview */}
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-slate-900 overflow-hidden shrink-0 shadow-xs">
                        <img
                          src={
                            b.item_image ||
                            (typeof b.item_id === "object" ? (b.item_id as any)?.image_url : null) ||
                            "https://images.unsplash.com/photo-1549399542-7e3f8b79c341"
                          }
                          alt={b.item_title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1549399542-7e3f8b79c341";
                          }}
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={`/rentals/${itemId}`}
                            className="font-headline font-bold text-base sm:text-lg text-on-surface hover:text-primary transition-colors line-clamp-1"
                          >
                            {b.item_title}
                          </Link>
                          <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                            {b.booking_reference || `#LK-RENT-${b._id.slice(-4).toUpperCase()}`}
                          </span>
                        </div>

                        <p className="text-xs text-on-surface-variant flex items-center gap-1 font-medium">
                          <span>📍 Handover Hub:</span>
                          <strong className="text-slate-800">{b.item_location || "Colombo Central Hub"}</strong>
                        </p>

                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Rental Window:</span>
                          <strong className="text-slate-700">
                            {b.start_date} → {b.end_date} ({b.duration_days} Day{b.duration_days > 1 ? "s" : ""})
                          </strong>
                        </p>
                      </div>
                    </div>

                    {/* Status Badge & Escrow Metric */}
                    <div className="flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-end justify-between gap-2 shrink-0">
                      <div>
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                            <span>Pending Host Approval</span>
                          </span>
                        )}

                        {isConfirmed && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            <span>Approved &amp; Confirmed ✓</span>
                          </span>
                        )}

                        {isDeclined && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300">
                            <XCircle className="w-4 h-4 text-rose-600" />
                            <span>{b.status === "Cancelled" ? "Cancelled by You" : "Declined by Host"}</span>
                          </span>
                        )}
                      </div>

                      <div className="text-left lg:text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Authorized</span>
                        <span className="font-headline font-black text-lg text-on-surface">
                          LKR {Number(b.total_price || 0).toLocaleString()}
                        </span>
                        <span className="text-[11px] text-primary font-semibold block">
                          + LKR {Number(b.security_deposit || 20000).toLocaleString()} Deposit Held in Escrow
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <span>Protected by LankaPay Escrow Switch • Refund released in 2-4 hours after check-in</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* WhatsApp Chat Button */}
                      <button
                        type="button"
                        onClick={() => handleChatWithHost(b)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006948] border border-emerald-200 font-headline text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 text-[#006948]" />
                        <span>Chat with Host on WhatsApp</span>
                      </button>

                      {/* Download PDF Voucher */}
                      <button
                        type="button"
                        onClick={() => handlePrintReceipt(b)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-headline text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-slate-600" />
                        <span>📄 Official PDF Voucher</span>
                      </button>

                      {/* Cancel Request Option (Only if Pending) */}
                      {isPending && (
                        <button
                          type="button"
                          disabled={actionLoadingId === b._id}
                          onClick={() => handleCancelBooking(b)}
                          className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-headline text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{actionLoadingId === b._id ? "Cancelling..." : "Cancel Request"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
