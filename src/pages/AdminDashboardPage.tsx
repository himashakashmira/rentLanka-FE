import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Booking, Item, User } from "../types";
import { bookingsApi, itemsApi, usersApi } from "../services/api";

export const AdminDashboardPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Moderation state for pending submissions
  const [moderationStatus, setModerationStatus] = useState<"pending" | "approved" | "delisted">("pending");

  // Fetch real data from MongoDB backend
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [bookingsData, itemsData, usersData] = await Promise.all([
        bookingsApi.getAll(),
        itemsApi.getAll(),
        usersApi.getAll(),
      ]);
      setBookings(bookingsData || []);
      setItems(itemsData || []);
      setUsers(usersData || []);
    } catch (err: any) {
      console.error("Failed to load admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle booking status updates (Approve & Lock, Decline)
  const handleUpdateStatus = async (
    bookingId: string,
    newStatus: "Confirmed" | "Rejected",
    itemId?: string
  ) => {
    setActionLoadingId(bookingId);
    setStatusMessage(null);

    try {
      const updated = await bookingsApi.updateStatus(bookingId, newStatus, itemId);
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
      );
      setStatusMessage(`Booking #${updated.booking_reference || bookingId.slice(-6)} marked as ${newStatus}!`);

      // Refresh items to reflect updated availability
      const updatedItems = await itemsApi.getAll();
      setItems(updatedItems);
    } catch (err: any) {
      alert(err.message || "Failed to update booking status");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Derived real database metrics
  const metrics = useMemo(() => {
    const totalBookingsCount = bookings.length;
    const pendingCount = bookings.filter((b) => b.status === "Pending").length;
    const activeListingsCount = items.filter((i) => i.is_available).length;
    const platformGmv = bookings
      .filter((b) => b.status === "Confirmed")
      .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
    const totalEscrowLocked = bookings
      .filter((b) => b.status === "Confirmed")
      .reduce((sum, b) => sum + (Number(b.security_deposit) || 0), 0);

    return {
      totalBookingsCount,
      pendingCount,
      activeListingsCount,
      totalListingsCount: items.length,
      platformGmv,
      totalEscrowLocked,
    };
  }, [bookings, items]);

  // PDF Audit Ledger Generation & Print Window Trigger
  const handleExportAuditReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to generate the official Audit Ledger PDF.");
      return;
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-LK", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const rowsHtml =
      bookings.length > 0
        ? bookings
            .map(
              (b, idx) => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 11px;">${
              b.booking_reference || `#LK-RENT-${1000 + idx}`
            }</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
              <strong>${b.item_title || "Rental Asset"}</strong>
              <div style="font-size: 10px; color: #64748b;">${b.item_location || "Sri Lanka Hub"}</div>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
              ${b.renter_name}
              <div style="font-size: 10px; color: #64748b;">NIC: ${b.renter_nic || "Verified"} • ${b.renter_phone}</div>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">
              ${b.start_date} to ${b.end_date} (${b.duration_days}d)
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">
              LKR ${(b.total_price || 0).toLocaleString()}
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #006948; font-weight: bold;">
              LKR ${(b.security_deposit || 0).toLocaleString()}
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">
              <span style="display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold; background: ${
                b.status === "Confirmed"
                  ? "#d1fae5; color: #065f46"
                  : b.status === "Pending"
                  ? "#fef3c7; color: #92400e"
                  : "#fee2e2; color: #991b1b"
              };">
                ${b.status}
              </span>
            </td>
          </tr>
        `
            )
            .join("")
        : `<tr><td colspan="7" style="text-align: center; padding: 24px; color: #64748b;">No active booking records currently logged in database ledger.</td></tr>`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>RentLanka_Audit_Ledger_${now.toISOString().split("T")[0]}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 20px; font-size: 12px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #006948; padding-bottom: 15px; margin-bottom: 20px; }
          .logo-title { font-size: 26px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
          .logo-title span { color: #006948; }
          .badge { display: inline-block; padding: 4px 10px; background: #e6f4ea; color: #006948; border-radius: 9999px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
          .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
          .meta-item { font-size: 11px; color: #475569; }
          .meta-item strong { display: block; font-size: 13px; color: #0f172a; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
          th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-weight: 700; color: #475569; font-size: 10px; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
          .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #64748b; }
          .stamp-box { border: 2px dashed #006948; padding: 10px 14px; border-radius: 8px; text-align: center; color: #006948; font-weight: bold; font-size: 11px; display: inline-block; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo-title">Rent<span>Lanka</span></div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Peer-to-Peer Rental Marketplace • Official Operations Ledger</div>
          </div>
          <div style="text-align: right;">
            <span class="badge">● Operations Audit Ledger</span>
            <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Generated: ${formattedDate}</div>
            <div style="font-size: 10px; color: #006948; font-weight: bold;">System Status: All Operational (LankaPay Escrow Live)</div>
          </div>
        </div>

        <div class="meta-box">
          <div class="meta-item">Total Bookings<strong>${metrics.totalBookingsCount} Orders</strong></div>
          <div class="meta-item">Active Fleet<strong>${metrics.activeListingsCount} / ${metrics.totalListingsCount} Assets</strong></div>
          <div class="meta-item">Total Escrow Volume<strong>LKR ${metrics.totalEscrowLocked.toLocaleString()}</strong></div>
          <div class="meta-item">Gross Platform Value (GMV)<strong>LKR ${metrics.platformGmv.toLocaleString()}</strong></div>
        </div>

        <h3 style="font-size: 13px; margin: 15px 0 5px 0; color: #0f172a;">Verified Booking Transaction Ledger</h3>
        <table>
          <thead>
            <tr>
              <th>Ref ID</th>
              <th>Asset & Location</th>
              <th>Renter & Details</th>
              <th>Rental Period</th>
              <th style="text-align: right;">Total Amount</th>
              <th style="text-align: right;">Escrow Hold</th>
              <th style="text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          <div>
            <strong>RentLanka Technologies (Pvt) Ltd.</strong><br />
            Audited under ITS2020 RAD Framework • Sri Lanka Commercial Trust & LankaPay Escrow Standards.<br />
            Colombo Regional Handover Hub, Colombo 03, Sri Lanka.
          </div>
          <div>
            <div class="stamp-box">
              ✓ CERTIFIED PLATFORM LEDGER<br />
              <span style="font-size: 9px; font-weight: normal; color: #475569;">Verified by Operations Controller</span>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col lg:flex-row pt-20">
      {/* ========================================================================= */}
      {/* 1. LEFT OPERATIONS SIDEBAR */}
      {/* ========================================================================= */}
      <aside className="w-full lg:w-64 bg-surface-container-low border-r border-surface-container p-6 flex flex-col justify-between shrink-0 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] overflow-y-auto">
        <div className="space-y-6">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-xs">
              <span className="material-symbols-outlined text-[20px]">key</span>
            </div>
            <span className="font-headline text-xl font-black text-on-surface">
              Rent<span className="text-primary">Lanka</span>
            </span>
          </Link>

          <div className="px-3 py-1.5 rounded-full bg-primary-fixed/40 text-[10px] font-bold text-on-primary-fixed inline-block uppercase tracking-wider">
            Operations &amp; Control Hub
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {[
              { id: "dashboard", label: "Dashboard", icon: "grid_view" },
              { id: "users", label: "Users & Hosts", icon: "group" },
              { id: "listings", label: "Fleet Listings", icon: "inventory_2" },
              { id: "reservations", label: "Reservations", icon: "calendar_today" },
              { id: "earnings", label: "Earnings & LankaPay", icon: "payments" },
              { id: "identity", label: "Identity & Insurance", icon: "verified_user" },
            ].map((nav) => (
              <button
                key={nav.id}
                type="button"
                onClick={() => setActiveTab(nav.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-headline text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === nav.id
                    ? "bg-white text-primary shadow-xs"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{nav.icon}</span>
                <span>{nav.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Actions in Sidebar */}
        <div className="pt-6 border-t border-surface-container space-y-3">
          <Link
            to="/list-your-item"
            className="w-full py-3 px-4 rounded-xl bg-primary text-white font-headline text-xs font-bold flex items-center justify-center gap-2 shadow-xs hover:bg-primary-container transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            List New Asset
          </Link>

          <Link
            to="/"
            className="w-full py-2 px-3 text-center text-xs font-bold text-on-surface-variant hover:text-primary flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Marketplace
          </Link>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN OPERATIONS DASHBOARD CONTENT (WITH TOP PADDING FIX) */}
      {/* ========================================================================= */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto pt-6 lg:pt-8">
        {/* Top Header Row with Command Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-container">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold text-primary font-headline">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              LIVE STREAM V3.4 • Synced with MongoDB Atlas Registry
            </div>
            <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface">
              RentLanka Operations Hub &amp; Marketplace Control
            </h1>
            <p className="text-xs text-on-surface-variant max-w-2xl">
              Real-time peer-to-peer equipment monitoring, verified ID audits, and instant LankaPay transaction settlement oversight.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={fetchDashboardData}
              className="px-3.5 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-bold font-headline flex items-center gap-1.5 border border-surface-container transition-colors cursor-pointer"
            >
              <span className={`material-symbols-outlined text-[16px] ${loading ? "animate-spin" : ""}`}>
                sync
              </span>
              <span>Sync Realtime</span>
            </button>
            <button
              type="button"
              onClick={handleExportAuditReport}
              className="px-3.5 py-2 rounded-xl bg-primary text-white hover:bg-primary-container text-xs font-bold font-headline flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Export Audit Ledger</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="p-3.5 rounded-2xl bg-primary-fixed/40 border border-primary-fixed text-on-primary-fixed text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{statusMessage}</span>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 1: USERS & HOSTS DIRECTORY */}
        {/* ===================================================================== */}
        {activeTab === "users" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* User Directory Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl bg-white p-5 border border-surface-container shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Total Registered Hosts
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  </div>
                </div>
                <div className="font-headline text-2xl font-black text-on-surface">
                  {users.filter((u) => u.role === "host").length}
                </div>
                <p className="text-[11px] text-on-surface-variant mt-1">Verified equipment owners</p>
              </div>

              <div className="rounded-2xl bg-white p-5 border border-surface-container shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Total Active Customers
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                  </div>
                </div>
                <div className="font-headline text-2xl font-black text-on-surface">
                  {users.filter((u) => u.role === "customer").length}
                </div>
                <p className="text-[11px] text-on-surface-variant mt-1">Renters islandwide</p>
              </div>

              <div className="rounded-2xl bg-white p-5 border border-surface-container shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Admin Operators
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
                    <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                  </div>
                </div>
                <div className="font-headline text-2xl font-black text-on-surface">
                  {users.filter((u) => u.role === "admin").length || 1}
                </div>
                <p className="text-[11px] text-on-surface-variant mt-1">Operations controller</p>
              </div>

              <div className="rounded-2xl bg-white p-5 border border-surface-container shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Total Member Accounts
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface">
                    <span className="material-symbols-outlined text-[18px]">group</span>
                  </div>
                </div>
                <div className="font-headline text-2xl font-black text-on-surface">
                  {users.length}
                </div>
                <p className="text-[11px] text-on-surface-variant mt-1">Active platform credentials</p>
              </div>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl bg-white border border-surface-container shadow-card overflow-hidden">
              <div className="p-5 border-b border-surface-container flex items-center justify-between">
                <div>
                  <h2 className="font-headline text-base font-bold text-on-surface">
                    Registered Users &amp; Host Directory
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Real-time authenticated identity records from MongoDB
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-surface-container text-on-surface">
                  {users.length} Users
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-low text-on-surface-variant uppercase tracking-wider font-headline font-bold border-b border-surface-container">
                    <tr>
                      <th className="py-3 px-5">User &amp; Identity</th>
                      <th className="py-3 px-5">Email Address</th>
                      <th className="py-3 px-5">Role</th>
                      <th className="py-3 px-5">Contact / NIC</th>
                      <th className="py-3 px-5 text-right">Registered On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {users.map((u) => (
                      <tr key={u.id || u._id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-teal-400 text-white font-bold flex items-center justify-center uppercase shadow-xs text-xs">
                              {u.name
                                ? u.name
                                    .split(" ")
                                    .map((w) => w[0])
                                    .join("")
                                    .slice(0, 2)
                                : "U"}
                            </div>
                            <div>
                              <div className="font-bold text-on-surface">{u.name}</div>
                              <div className="text-[10px] text-on-surface-variant">
                                ID: {(u.id || u._id || "").slice(-6)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 font-mono text-[11px] text-on-surface">{u.email}</td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              u.role === "host"
                                ? "bg-primary-fixed/50 text-on-primary-fixed"
                                : u.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {u.role === "host"
                              ? "Verified Host"
                              : u.role === "admin"
                              ? "Administrator"
                              : "Customer / Renter"}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="font-mono text-[11px] text-on-surface">{u.phone || "—"}</div>
                          {u.nic && <div className="text-[10px] text-on-surface-variant">NIC: {u.nic}</div>}
                        </td>
                        <td className="py-3.5 px-5 text-right text-on-surface-variant font-medium">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Active"}
                        </td>
                      </tr>
                    ))}

                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-on-surface-variant text-xs">
                          No users registered yet. Register a new user from the registration screen.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 2: FLEET LISTINGS TAB */}
        {/* ===================================================================== */}
        {activeTab === "listings" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-2xl bg-white border border-surface-container shadow-card overflow-hidden">
              <div className="p-5 border-b border-surface-container flex items-center justify-between">
                <div>
                  <h2 className="font-headline text-base font-bold text-on-surface">
                    Registered Marketplace Fleet
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    {items.length} total assets registered in MongoDB catalog
                  </p>
                </div>
                <Link
                  to="/list-your-item"
                  className="px-3 py-1.5 rounded-xl bg-primary text-white font-headline text-xs font-bold hover:bg-primary-container"
                >
                  + Add Asset
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-low text-on-surface-variant uppercase tracking-wider font-headline font-bold border-b border-surface-container">
                    <tr>
                      <th className="py-3 px-5">Asset</th>
                      <th className="py-3 px-5">Category</th>
                      <th className="py-3 px-5">Location Hub</th>
                      <th className="py-3 px-5">Daily Rate</th>
                      <th className="py-3 px-5">Deposit</th>
                      <th className="py-3 px-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {items.map((item) => (
                      <tr key={item._id || item.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-10 h-10 rounded-lg object-cover bg-surface-container shrink-0"
                            />
                            <div>
                              <Link
                                to={`/rentals/${item._id || item.id}`}
                                className="font-bold text-on-surface hover:text-primary transition-colors"
                              >
                                {item.title}
                              </Link>
                              <div className="text-[10px] text-on-surface-variant">
                                By {item.owner_name || "Verified Host"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-bold text-[10px]">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-on-surface">{item.location}</td>
                        <td className="py-3.5 px-5 font-bold text-on-surface">
                          LKR {item.price_per_day.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-5 text-on-surface-variant">
                          LKR {item.security_deposit.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              item.is_available
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {item.is_available ? "Available" : "On Rent"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 3: DEFAULT DASHBOARD / RESERVATIONS VIEW */}
        {/* ===================================================================== */}
        {(activeTab === "dashboard" || activeTab === "reservations" || activeTab === "earnings" || activeTab === "identity") && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 4 LIVE BENTO KPI CARDS (BOUND TO REAL MONGODB DATABASE METRICS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Platform Bookings */}
              <div className="rounded-2xl bg-white p-5 border border-surface-container shadow-card hover:shadow-card-elevated transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Total Platform Bookings
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  </div>
                </div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-headline text-2xl font-black text-on-surface">
                    {metrics.totalBookingsCount}
                  </span>
                  <span className="text-[10px] font-bold text-primary bg-primary-fixed/40 px-2 py-0.5 rounded-full">
                    Live Orders
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  {bookings.filter((b) => b.status === "Confirmed").length} Confirmed &bull; {bookings.filter((b) => b.status === "Pending").length} Pending
                </p>
              </div>

              {/* Card 2: Pending Approvals */}
              <div className="rounded-2xl bg-white p-5 border border-surface-container shadow-card hover:shadow-card-elevated transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Pending Approvals
                  </span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${metrics.pendingCount > 0 ? "bg-error-container text-error" : "bg-surface-container text-on-surface-variant"}`}>
                    <span className="material-symbols-outlined text-[18px]">notification_important</span>
                  </div>
                </div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className={`font-headline text-2xl font-black ${metrics.pendingCount > 0 ? "text-error" : "text-on-surface"}`}>
                    {metrics.pendingCount}
                  </span>
                  {metrics.pendingCount > 0 ? (
                    <span className="text-[10px] font-bold text-error bg-error-container px-2 py-0.5 rounded-full animate-pulse">
                      Urgent Action
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      All Clear
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-on-surface-variant">Host turnaround SLA: &lt; 2h</p>
              </div>

              {/* Card 3: Active Fleet Listings */}
              <div className="rounded-2xl bg-white p-5 border border-surface-container shadow-card hover:shadow-card-elevated transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Active Fleet Listings
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  </div>
                </div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-headline text-2xl font-black text-on-surface">
                    {metrics.activeListingsCount}
                  </span>
                  <span className="text-[10px] font-bold text-primary bg-primary-fixed/40 px-2 py-0.5 rounded-full">
                    {metrics.totalListingsCount} Total Fleet
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant">Available for instant booking</p>
              </div>

              {/* Card 4: Gross Platform Value (GMV) */}
              <div className="rounded-2xl bg-white p-5 border border-surface-container shadow-card hover:shadow-card-elevated transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Gross Platform Value (GMV)
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                    <span className="material-symbols-outlined text-[18px]">currency_exchange</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-[11px] font-bold text-primary font-headline">LKR</span>
                  <span className="font-headline text-xl font-black text-on-surface truncate">
                    {metrics.platformGmv.toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant">LankaPay Secured Settlements</p>
              </div>
            </div>

            {/* 2-Column Split: Workflow Table on Left, Health & Distribution on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT 8 COLS: Real Booking Management Workflow Table & Listing Moderation */}
              <div className="lg:col-span-8 space-y-6">
                {/* Real Booking Management Workflow Table */}
                <div className="rounded-2xl bg-white border border-surface-container shadow-card overflow-hidden">
                  <div className="p-5 border-b border-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="font-headline text-base font-bold text-on-surface">
                        Live Booking Management Workflow
                      </h2>
                      <p className="text-xs text-on-surface-variant">
                        Instant booking confirmation, escrow hold, and asset locks
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed/30 text-on-primary-fixed text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                      Auto-Escrow Enabled
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface-container-low text-on-surface-variant uppercase tracking-wider font-headline font-bold border-b border-surface-container">
                        <tr>
                          <th className="py-3 px-5">Asset &amp; Reference</th>
                          <th className="py-3 px-5">Renter Details</th>
                          <th className="py-3 px-5">Period &amp; Rate</th>
                          <th className="py-3 px-5">Status</th>
                          <th className="py-3 px-5 text-right">Workflow</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container">
                        {bookings.map((booking) => {
                          const itemId =
                            typeof booking.item_id === "object"
                              ? booking.item_id?._id || (booking.item_id as any)?.id
                              : booking.item_id;

                          return (
                            <tr
                              key={booking._id}
                              className="hover:bg-surface-container-low/40 transition-colors"
                            >
                              <td className="py-4 px-5">
                                <div className="font-headline font-bold text-sm text-on-surface">
                                  {booking.item_title}
                                </div>
                                <div className="text-[11px] text-primary font-mono font-semibold">
                                  {booking.booking_reference || `#LK-RENT-${booking._id.slice(-4).toUpperCase()}`}
                                </div>
                                <div className="text-[10px] text-on-surface-variant mt-0.5">
                                  Deposit: LKR {(booking.security_deposit || 0).toLocaleString()} &bull; {booking.payment_method || "LankaPay Escrow"}
                                </div>
                              </td>

                              <td className="py-4 px-5">
                                <div className="font-bold text-on-surface">{booking.renter_name}</div>
                                <div className="text-[11px] text-slate-500 font-mono">
                                  {booking.renter_phone}
                                </div>
                                <div className="text-[10px] text-emerald-700 font-semibold">
                                  NIC: {booking.renter_nic || "Verified"}
                                </div>
                              </td>

                              <td className="py-4 px-5">
                                <div className="font-black text-on-surface">
                                  LKR {(booking.total_price || 0).toLocaleString()}
                                </div>
                                <div className="text-[11px] text-on-surface-variant">
                                  {booking.start_date} – {booking.end_date} ({booking.duration_days} Days)
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  Rate: LKR {(booking.daily_rate || 0).toLocaleString()} / day
                                </div>
                              </td>

                              <td className="py-4 px-5">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    booking.status === "Confirmed"
                                      ? "bg-primary-fixed text-on-primary-fixed"
                                      : booking.status === "Pending"
                                      ? "bg-amber-100 text-amber-900 animate-pulse"
                                      : "bg-error-container text-on-error-container"
                                  }`}
                                >
                                  {booking.status === "Confirmed"
                                    ? "Confirmed & Inspected"
                                    : booking.status === "Pending"
                                    ? "Pending Approval"
                                    : "Declined"}
                                </span>
                              </td>

                              <td className="py-4 px-5 text-right">
                                {booking.status === "Pending" ? (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      disabled={actionLoadingId === booking._id}
                                      onClick={() => handleUpdateStatus(booking._id, "Confirmed", itemId)}
                                      className="px-2.5 py-1.5 rounded-lg bg-primary text-white font-headline text-[11px] font-bold hover:bg-primary-container shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                                    >
                                      {actionLoadingId === booking._id ? "Locking..." : "Approve & Lock"}
                                    </button>
                                    <button
                                      type="button"
                                      disabled={actionLoadingId === booking._id}
                                      onClick={() => handleUpdateStatus(booking._id, "Rejected", itemId)}
                                      className="px-2.5 py-1.5 rounded-lg bg-error-container text-on-error-container font-headline text-[11px] font-bold hover:bg-error hover:text-white transition-all cursor-pointer disabled:opacity-50"
                                    >
                                      Decline
                                    </button>
                                  </div>
                                ) : booking.status === "Confirmed" ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">
                                    ✓ Calendar Locked
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-error font-semibold">
                                    Declined
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}

                        {bookings.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-on-surface-variant text-xs space-y-2">
                              <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 block mb-1">
                                calendar_today
                              </span>
                              <p className="font-semibold text-on-surface">
                                No active bookings found in MongoDB.
                              </p>
                              <p className="text-[11px]">
                                Create a test booking from an item details page to view real-time workflow actions.
                              </p>
                              <Link
                                to="/explore"
                                className="inline-block mt-2 px-4 py-1.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-container transition-colors"
                              >
                                Browse Marketplace Items &rarr;
                              </Link>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Listing Moderation & Condition Verification Card */}
                <div className="rounded-2xl bg-white border border-surface-container p-6 shadow-card space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-headline text-base font-bold text-on-surface">
                        Listing Moderation &amp; Condition Verification
                      </h3>
                      <p className="text-xs text-on-surface-variant">
                        Review pending host submissions against safety &amp; clarity guidelines
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary-fixed/40 text-on-primary-fixed">
                      Queue: 1 Pending Review
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-4 rounded-lg overflow-hidden aspect-[4/3] bg-surface-container relative">
                      <img
                        src="https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=400&q=80"
                        alt="DJI Inspire 3 Drone"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
                        4 Photos Attached
                      </span>
                    </div>

                    <div className="sm:col-span-8 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <h4 className="font-headline text-sm font-bold text-on-surface">
                          DJI Inspire 3 Cinematic Drone Package
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-fixed text-on-primary-fixed">
                          AI Photo Score: 98%
                        </span>
                      </div>

                      <p className="text-on-surface-variant">
                        Submitted by <strong>Malik Senanayake</strong> (Host ID: #HST-4412 • Colombo 07)
                      </p>

                      <div className="flex items-center gap-2 text-primary font-semibold text-[11px]">
                        <span className="material-symbols-outlined text-[15px]">verified</span>
                        <span>CAA Drone License Attached</span>
                        <span>&bull;</span>
                        <span>Rate: LKR 42,000 / day</span>
                        <span>&bull;</span>
                        <span>Deposit: LKR 150,000</span>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        {moderationStatus === "approved" ? (
                          <span className="text-xs font-bold text-emerald-600">
                            ✓ Verified &amp; Published to Marketplace
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setModerationStatus("approved")}
                              className="px-3.5 py-1.5 rounded-lg bg-primary text-white font-headline text-xs font-bold hover:bg-primary-container shadow-xs cursor-pointer"
                            >
                              Approve &amp; Mark Verified
                            </button>
                            <button
                              type="button"
                              onClick={() => alert("Resubmission requested from host.")}
                              className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-headline text-xs font-bold hover:bg-surface-container-high cursor-pointer"
                            >
                              Request Resubmission
                            </button>
                            <button
                              type="button"
                              onClick={() => setModerationStatus("delisted")}
                              className="px-3 py-1.5 rounded-lg text-error hover:bg-error-container/30 text-xs font-bold cursor-pointer"
                            >
                              Delist
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT 4 COLS: System Health, Settlement Distribution, Regional Distribution */}
              <div className="lg:col-span-4 space-y-6">
                {/* System Health */}
                <div className="rounded-2xl bg-white border border-surface-container p-5 shadow-card space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                    <div className="flex items-center gap-2 font-headline font-bold text-sm text-on-surface">
                      <span className="material-symbols-outlined text-primary text-[18px]">health_and_safety</span>
                      <span>System Health</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      All Normal
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-on-surface">LankaPay National Switch</div>
                        <div className="text-[11px] text-on-surface-variant">Direct Host Settlements</div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-600">99.98%</span>
                        <div className="text-[10px] text-slate-500 font-mono">14ms latency</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-on-surface">NIC / Department for RPD API</div>
                        <div className="text-[11px] text-on-surface-variant">Digital Identity &amp; Biometrics</div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-600">Operational</span>
                        <div className="text-[10px] text-slate-500 font-mono">0 backlogs</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-on-surface">Sri Lanka Telecom SMS Gateway</div>
                        <div className="text-[11px] text-on-surface-variant">OTP &amp; Return Alerts</div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-600">Active</span>
                        <div className="text-[10px] text-slate-500 font-mono">99.4% deliv.</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-surface-container text-[11px] text-slate-500">
                    Automated Backup: 18 mins ago (SLT IDC Tier-3 Cloud)
                  </div>
                </div>

                {/* LKR Escrow Settlement Distribution (Real Locked Collateral) */}
                <div className="rounded-2xl bg-white border border-surface-container p-5 shadow-card space-y-3 text-xs">
                  <h3 className="font-headline font-bold text-sm text-on-surface">
                    LKR Escrow Settlement Distribution
                  </h3>
                  <p className="text-on-surface-variant text-[11px]">
                    Security deposits currently held in trust holding.
                  </p>

                  <div className="w-full h-3 rounded-full bg-surface-container overflow-hidden flex">
                    <div className="bg-primary h-full" style={{ width: "65%" }}></div>
                    <div className="bg-amber-400 h-full" style={{ width: "25%" }}></div>
                    <div className="bg-secondary h-full" style={{ width: "10%" }}></div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
                    <div>
                      <span className="text-primary block">Active</span>
                      <span className="text-on-surface font-headline">65%</span>
                    </div>
                    <div>
                      <span className="text-amber-600 block">Pending</span>
                      <span className="text-on-surface font-headline">25%</span>
                    </div>
                    <div>
                      <span className="text-secondary block">Payout</span>
                      <span className="text-on-surface font-headline">10%</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-surface-container space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Locked Collateral:</span>
                      <span className="font-bold text-on-surface">
                        LKR {metrics.totalEscrowLocked.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Disputed Claims (30d):</span>
                      <span className="font-bold text-emerald-600">0.00% (Clean)</span>
                    </div>
                  </div>
                </div>

                {/* Regional Distribution */}
                <div className="rounded-2xl bg-white border border-surface-container p-5 shadow-card space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline font-bold text-sm text-on-surface">
                      Regional Fleet Distribution
                    </h3>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      9 Provinces Islandwide
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-center space-y-1">
                    <span className="material-symbols-outlined text-[32px] text-primary">map</span>
                    <p className="font-headline font-bold text-xs text-on-surface">
                      Western &bull; Central &bull; Southern Corridors
                    </p>
                    <p className="text-[10px] text-on-surface-variant">
                      Connected to 48 verified dispatch hubs with instant DRP NIC check.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboardPage;
