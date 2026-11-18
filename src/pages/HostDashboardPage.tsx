import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Item, Booking } from "../types";
import { itemsApi, bookingsApi } from "../services/api";
import { useAppSelector } from "../app/store";

interface HostDashboardPageProps {
  initialTab?: "pending" | "inventory" | "history";
}

export const HostDashboardPage: React.FC<HostDashboardPageProps> = ({
  initialTab = "pending",
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<"pending" | "inventory" | "history">(initialTab);
  const [items, setItems] = useState<Item[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch all items and bookings
  const loadHostData = async () => {
    try {
      setLoading(true);
      const [allItems, allBookings] = await Promise.all([
        itemsApi.getAll(),
        bookingsApi.getAll(),
      ]);
      setItems(allItems || []);
      setBookings(allBookings || []);
    } catch (err: any) {
      console.error("Failed to load host portal data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHostData();
  }, []);

  // Filter items owned by this host
  const hostItems = useMemo(() => {
    if (!user) return [];
    const filtered = items.filter((item) => {
      // Check owner ID or owner name match, or if admin allow full fleet overview
      const matchId = item.owner_id && (item.owner_id === user.id || item.owner_id === user._id);
      const matchName =
        item.owner_name &&
        item.owner_name.toLowerCase().trim() === user.name.toLowerCase().trim();
      return matchId || matchName || user.role === "admin";
    });
    // If logged in as host and has no specific items tagged yet, include all marketplace items so they can test/manage inventory
    if (filtered.length === 0 && user.role === "host") {
      return items;
    }
    return filtered;
  }, [items, user]);

  const hostItemIds = useMemo(() => {
    return new Set(hostItems.map((i) => i._id || (i as any).id));
  }, [hostItems]);

  // Filter bookings for this host's items
  const hostBookings = useMemo(() => {
    return bookings.filter((b) => {
      const bItemId = typeof b.item_id === "object" ? b.item_id?._id || (b.item_id as any)?.id : b.item_id;
      const matchHostId = b.host_id && (b.host_id === user?.id || b.host_id === user?._id);
      const matchOwnerName = b.owner_name && user?.name && b.owner_name.toLowerCase().trim() === user.name.toLowerCase().trim();
      // If host owns the item, or if the booking item title matches, or if admin/host testing
      const matchesHostItem = hostItemIds.has(bItemId);
      const matchesTitle = hostItems.some((hi) => hi.title === b.item_title);
      return matchHostId || matchOwnerName || matchesHostItem || matchesTitle || user?.role === "admin" || user?.role === "host";
    });
  }, [bookings, hostItemIds, hostItems, user]);

  // Derived Financial & Listing Overview Cards
  const pendingRequests = useMemo(() => {
    return hostBookings.filter((b) => b.status === "Pending");
  }, [hostBookings]);

  const confirmedBookings = useMemo(() => {
    return hostBookings.filter((b) => b.status === "Confirmed");
  }, [hostBookings]);

  const activeListingsCount = useMemo(() => {
    return hostItems.filter((i) => i.is_available).length;
  }, [hostItems]);

  const totalEarnings = useMemo(() => {
    // 94% net payout (after 6% platform protection fee)
    return confirmedBookings.reduce((sum, b) => {
      const gross = Number(b.total_price) || 0;
      return sum + Math.round(gross * 0.94);
    }, 0);
  }, [confirmedBookings]);

  // Handle status update (Confirm & Lock Dates, or Decline)
  const handleUpdateBookingStatus = async (
    bookingId: string,
    newStatus: "Confirmed" | "Rejected",
    itemId?: string
  ) => {
    setActionLoadingId(bookingId);
    setToastMessage(null);

    try {
      const updated = await bookingsApi.updateStatus(bookingId, newStatus, itemId);
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
      );
      setToastMessage({
        type: "success",
        text: `Booking #${updated.booking_reference || bookingId.slice(-6)} successfully marked as ${newStatus}!`,
      });

      // Refresh items to update calendar lock
      const refreshedItems = await itemsApi.getAll();
      setItems(refreshedItems);
    } catch (err: any) {
      setToastMessage({
        type: "error",
        text: err.message || "Failed to update booking status.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle Item Availability
  const handleToggleAvailability = async (item: Item) => {
    const id = item._id || (item as any).id;
    try {
      const updated = await itemsApi.update(id, { is_available: !item.is_available });
      setItems((prev) => prev.map((i) => ((i._id || (i as any).id) === id ? updated : i)));
      setToastMessage({
        type: "success",
        text: `"${item.title}" availability marked as ${updated.is_available ? "Available" : "Unavailable"}.`,
      });
    } catch (err: any) {
      alert(err.message || "Could not toggle availability");
    }
  };

  // Delete an item
  const handleDeleteItem = async (item: Item) => {
    const id = item._id || (item as any).id;
    if (!window.confirm(`Are you sure you want to delete "${item.title}" from your inventory?`)) {
      return;
    }
    try {
      await itemsApi.delete(id);
      setItems((prev) => prev.filter((i) => (i._id || (i as any).id) !== id));
      setToastMessage({
        type: "success",
        text: `"${item.title}" removed from your fleet inventory.`,
      });
    } catch (err: any) {
      alert(err.message || "Failed to delete item");
    }
  };

  return (
    <div className="min-h-screen bg-surface pt-24 sm:pt-28 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Toast Feedback */}
        {toastMessage && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold transition-all shadow-card ${
              toastMessage.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                : "bg-red-50 border border-red-200 text-red-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                {toastMessage.type === "success" ? "check_circle" : "error"}
              </span>
              <span>{toastMessage.text}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-on-surface-variant hover:text-on-surface p-1"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* HEADER: HOST BRANDING & QUICK ACTIONS */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-container">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed/40 text-[10px] font-bold text-on-primary-fixed uppercase tracking-wider mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Host Operations Portal &bull; LankaPay Escrow Live
            </div>
            <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface">
              Welcome Back, {user?.name || "Verified Host"}
            </h1>
            <p className="text-xs text-on-surface-variant max-w-xl">
              Manage incoming rental requests, verify renter identities, track your asset calendar, and withdraw completed payouts.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={loadHostData}
              className="px-3.5 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container text-xs font-bold font-headline text-on-surface flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className={`material-symbols-outlined text-[16px] ${loading ? "animate-spin" : ""}`}>
                sync
              </span>
              <span>Refresh</span>
            </button>

            <Link
              to="/list-your-item"
              className="px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-container font-headline text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>+ List New Inventory</span>
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. FINANCIAL & LISTING OVERVIEW CARDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Earnings (Profit) */}
          <div className="rounded-2xl bg-white p-5 border border-surface-container shadow-card hover:shadow-card-elevated transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Total Earnings (Net Profit)
              </span>
              <div className="w-9 h-9 rounded-xl bg-primary-fixed flex items-center justify-center text-primary font-bold shadow-xs">
                <span className="material-symbols-outlined text-[20px]">payments</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-xs font-bold text-primary font-headline">LKR</span>
              <span className="font-headline text-2xl font-black text-on-surface">
                {totalEarnings.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Net payout after 6% platform fee &bull; LankaPay Protected
            </p>
          </div>

          {/* Card 2: Active Listings */}
          <div className="rounded-2xl bg-white p-5 border border-surface-container shadow-card hover:shadow-card-elevated transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Active Listings
              </span>
              <div className="w-9 h-9 rounded-xl bg-secondary-container flex items-center justify-center text-secondary font-bold shadow-xs">
                <span className="material-symbols-outlined text-[20px]">inventory_2</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="font-headline text-2xl font-black text-on-surface">
                {activeListingsCount}
              </span>
              <span className="text-[10px] font-bold text-primary bg-primary-fixed/40 px-2 py-0.5 rounded-full">
                {hostItems.length} Total Fleet
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant">
              {activeListingsCount} ready for instant reservation
            </p>
          </div>

          {/* Card 3: Pending Requests */}
          <div className="rounded-2xl bg-white p-5 border border-surface-container shadow-card hover:shadow-card-elevated transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Pending Requests
              </span>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-xs ${
                  pendingRequests.length > 0
                    ? "bg-error-container text-error"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">notification_important</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between mb-1">
              <span
                className={`font-headline text-2xl font-black ${
                  pendingRequests.length > 0 ? "text-error" : "text-on-surface"
                }`}
              >
                {pendingRequests.length}
              </span>
              {pendingRequests.length > 0 ? (
                <span className="text-[10px] font-bold text-error bg-error-container px-2 py-0.5 rounded-full animate-pulse">
                  Awaiting Host Action
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Up to Date
                </span>
              )}
            </div>
            <p className="text-[11px] text-on-surface-variant">Host turnaround SLA: &lt; 2h</p>
          </div>

          {/* Card 4: Confirmed Orders */}
          <div className="rounded-2xl bg-white p-5 border border-surface-container shadow-card hover:shadow-card-elevated transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Confirmed Rentals
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold shadow-xs">
                <span className="material-symbols-outlined text-[20px]">task_alt</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="font-headline text-2xl font-black text-on-surface">
                {confirmedBookings.length}
              </span>
              <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                100% Escrow
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant">Completed &amp; active hires</p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TABBED WORKSPACE NAVIGATION */}
        {/* ========================================================================= */}
        <div className="border-b border-surface-container">
          <nav className="flex space-x-2 sm:space-x-4">
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`py-3 px-4 font-headline text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "pending"
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">pending_actions</span>
              <span>Pending Approvals</span>
              {pendingRequests.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("inventory")}
              className={`py-3 px-4 font-headline text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "inventory"
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              <span>My Inventory</span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-bold">
                {hostItems.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`py-3 px-4 font-headline text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "history"
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">history</span>
              <span>Completed History &amp; Payouts</span>
            </button>
          </nav>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: PENDING APPROVALS WORKSPACE */}
        {/* ========================================================================= */}
        {activeTab === "pending" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="rounded-2xl bg-white border border-surface-container shadow-card overflow-hidden">
              <div className="p-5 border-b border-surface-container flex items-center justify-between">
                <div>
                  <h2 className="font-headline text-base font-bold text-on-surface">
                    Incoming Rental Requests Awaiting Confirmation
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Review dates and renter credentials before locking your asset calendar.
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900">
                  {pendingRequests.length} Pending
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-low text-on-surface-variant uppercase tracking-wider font-headline font-bold border-b border-surface-container">
                    <tr>
                      <th className="py-3 px-5">Requested Asset</th>
                      <th className="py-3 px-5">Renter Details</th>
                      <th className="py-3 px-5">Requested Dates</th>
                      <th className="py-3 px-5">Total &amp; Escrow Deposit</th>
                      <th className="py-3 px-5 text-right">Host Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {pendingRequests.map((booking) => {
                      const itemId =
                        typeof booking.item_id === "object"
                          ? booking.item_id?._id || (booking.item_id as any)?.id
                          : booking.item_id;

                      return (
                        <tr key={booking._id} className="hover:bg-surface-container-low/40 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-2xs">
                                <img
                                  src={
                                    booking.item_image ||
                                    (typeof booking.item_id === "object" ? (booking.item_id as any)?.image_url : null) ||
                                    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341"
                                  }
                                  alt={booking.item_title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341";
                                  }}
                                />
                              </div>
                              <div>
                                <div className="font-headline font-bold text-sm text-on-surface line-clamp-1">
                                  {booking.item_title}
                                </div>
                                <div className="text-[11px] text-primary font-mono font-semibold">
                                  {booking.booking_reference || `#LK-REQ-${booking._id.slice(-4).toUpperCase()}`}
                                </div>
                                <div className="text-[10px] text-on-surface-variant">
                                  Location: {booking.item_location || "Sri Lanka"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-5">
                            <div className="font-bold text-on-surface">{booking.renter_name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              WhatsApp: {booking.renter_phone}
                            </div>
                            <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">verified</span>
                              NIC: {booking.renter_nic || "Verified"}
                            </div>
                          </td>

                          <td className="py-4 px-5">
                            <div className="font-semibold text-on-surface">
                              {booking.start_date} → {booking.end_date}
                            </div>
                            <div className="text-[11px] text-primary font-bold">
                              Duration: {booking.duration_days} Days
                            </div>
                            <div className="text-[10px] text-slate-500">
                              LKR {(booking.daily_rate || 0).toLocaleString()} / day
                            </div>
                          </td>

                          <td className="py-4 px-5">
                            <div className="font-black text-on-surface text-sm">
                              LKR {(booking.total_price || 0).toLocaleString()}
                            </div>
                            <div className="text-[10px] text-primary font-semibold">
                              + LKR {(booking.security_deposit || 0).toLocaleString()} Security Deposit
                            </div>
                            <div className="text-[10px] text-on-surface-variant">
                              LankaPay Escrow Pre-authorized
                            </div>
                          </td>

                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                disabled={actionLoadingId === booking._id}
                                onClick={() => handleUpdateBookingStatus(booking._id, "Confirmed", itemId)}
                                className="px-3.5 py-2 rounded-xl bg-primary text-white font-headline text-xs font-bold hover:bg-primary-container shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                              >
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                <span>{actionLoadingId === booking._id ? "Approving..." : "✓ Approve & Confirm"}</span>
                              </button>

                              <button
                                type="button"
                                disabled={actionLoadingId === booking._id}
                                onClick={() => handleUpdateBookingStatus(booking._id, "Rejected", itemId)}
                                className="px-3 py-2 rounded-xl bg-error-container text-on-error-container font-headline text-xs font-bold hover:bg-error hover:text-white transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                                <span>Decline</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {pendingRequests.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-on-surface-variant text-xs space-y-2">
                          <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 block mb-1">
                            task_alt
                          </span>
                          <p className="font-semibold text-on-surface">No pending approval requests</p>
                          <p className="text-[11px]">
                            Your listings are active and available for customer bookings across Sri Lanka.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MY INVENTORY WORKSPACE */}
        {/* ========================================================================= */}
        {activeTab === "inventory" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="rounded-2xl bg-white border border-surface-container shadow-card overflow-hidden">
              <div className="p-5 border-b border-surface-container flex items-center justify-between">
                <div>
                  <h2 className="font-headline text-base font-bold text-on-surface">
                    My Registered Fleet &amp; Equipment
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    {hostItems.length} assets registered under your host profile
                  </p>
                </div>
                <Link
                  to="/list-your-item"
                  className="px-3.5 py-2 rounded-xl bg-primary text-white font-headline text-xs font-bold hover:bg-primary-container flex items-center gap-1 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Add Asset</span>
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-low text-on-surface-variant uppercase tracking-wider font-headline font-bold border-b border-surface-container">
                    <tr>
                      <th className="py-3 px-5">Asset</th>
                      <th className="py-3 px-5">Category &amp; Hub</th>
                      <th className="py-3 px-5">Rates (LKR)</th>
                      <th className="py-3 px-5">Live Status</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {hostItems.map((item) => (
                      <tr key={item._id || (item as any).id} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-12 h-12 rounded-xl object-cover bg-surface-container shrink-0"
                            />
                            <div>
                              <Link
                                to={`/rentals/${item._id || (item as any).id}`}
                                className="font-bold text-sm text-on-surface hover:text-primary transition-colors block"
                              >
                                {item.title}
                              </Link>
                              <div className="text-[10px] text-on-surface-variant">
                                Added {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Active"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-bold text-[10px] mb-1">
                            {item.category}
                          </span>
                          <div className="text-[11px] text-on-surface font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px] text-primary">location_on</span>
                            <span>{item.location}</span>
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <div className="font-bold text-on-surface text-sm">
                            LKR {item.price_per_day.toLocaleString()} / day
                          </div>
                          <div className="text-[10px] text-on-surface-variant">
                            Deposit: LKR {item.security_deposit.toLocaleString()}
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              item.is_available
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.is_available ? "bg-emerald-600" : "bg-amber-600"
                              }`}
                            ></span>
                            {item.is_available ? "Available for Hire" : "Booked / Out on Rent"}
                          </span>
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleAvailability(item)}
                              className="px-2.5 py-1.5 rounded-lg border border-surface-container hover:bg-surface-container text-on-surface text-[11px] font-bold transition-colors cursor-pointer"
                              title="Toggle between Available and Out on Rent"
                            >
                              {item.is_available ? "Mark Booked" : "Mark Available"}
                            </button>

                            <Link
                              to={`/rentals/${item._id || (item as any).id}`}
                              className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                              title="View Public Listing"
                            >
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item)}
                              className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors cursor-pointer"
                              title="Delete Item"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {hostItems.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-on-surface-variant text-xs space-y-3">
                          <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 block mb-1">
                            inventory_2
                          </span>
                          <p className="font-semibold text-on-surface text-sm">
                            You haven't listed any equipment or vehicles yet
                          </p>
                          <p className="text-[11px] max-w-sm mx-auto">
                            List your 4x4 SUVs, cinema gear, construction generators, or event tools to start earning passive income.
                          </p>
                          <Link
                            to="/list-your-item"
                            className="inline-block mt-2 px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-container shadow-xs transition-all"
                          >
                            + List Your First Asset
                          </Link>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: COMPLETED HISTORY & PAYOUTS */}
        {/* ========================================================================= */}
        {activeTab === "history" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="rounded-2xl bg-white border border-surface-container shadow-card overflow-hidden">
              <div className="p-5 border-b border-surface-container flex items-center justify-between">
                <div>
                  <h2 className="font-headline text-base font-bold text-on-surface">
                    Completed Rentals &amp; Settlement Ledger
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Historical logs of completed handovers, inspection releases, and LankaPay payouts.
                  </p>
                </div>
                <div className="text-xs font-bold text-primary font-headline">
                  Total Disbursed: LKR {totalEarnings.toLocaleString()}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-low text-on-surface-variant uppercase tracking-wider font-headline font-bold border-b border-surface-container">
                    <tr>
                      <th className="py-3 px-5">Booking Ref</th>
                      <th className="py-3 px-5">Renter</th>
                      <th className="py-3 px-5">Asset</th>
                      <th className="py-3 px-5">Period</th>
                      <th className="py-3 px-5">Gross Rate</th>
                      <th className="py-3 px-5">Host Net (94%)</th>
                      <th className="py-3 px-5 text-right">Escrow Settlement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {confirmedBookings.map((b) => {
                      const gross = Number(b.total_price) || 0;
                      const net = Math.round(gross * 0.94);

                      return (
                        <tr key={b._id} className="hover:bg-surface-container-low/40 transition-colors">
                          <td className="py-4 px-5 font-mono font-bold text-primary">
                            {b.booking_reference || `#LK-${b._id.slice(-6).toUpperCase()}`}
                          </td>
                          <td className="py-4 px-5">
                            <div className="font-bold text-on-surface">{b.renter_name}</div>
                            <div className="text-[10px] text-slate-500">NIC: {b.renter_nic || "Verified"}</div>
                          </td>
                          <td className="py-4 px-5 font-semibold text-on-surface">{b.item_title}</td>
                          <td className="py-4 px-5 text-on-surface-variant">
                            {b.start_date} → {b.end_date} ({b.duration_days}d)
                          </td>
                          <td className="py-4 px-5 text-on-surface-variant">
                            LKR {gross.toLocaleString()}
                          </td>
                          <td className="py-4 px-5 font-black text-primary text-sm">
                            LKR {net.toLocaleString()}
                          </td>
                          <td className="py-4 px-5 text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <span className="material-symbols-outlined text-[13px]">verified</span>
                              LankaPay Disbursed
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {confirmedBookings.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-on-surface-variant text-xs">
                          No completed rentals yet. When you approve incoming requests and complete return inspections, payout logs appear here.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostDashboardPage;
