import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Booking } from "../types";
import { bookingsApi } from "../services/api";

export const AdminDashboardPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Moderation state for DJI Inspire 3 Drone card
  const [moderationStatus, setModerationStatus] = useState<"pending" | "approved" | "delisted">("pending");

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingsApi.getAll();
      setBookings(data);
    } catch (err: any) {
      console.error("Failed to load admin bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, []);

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
      setStatusMessage(`Booking #${updated.booking_reference} marked as ${newStatus}!`);
    } catch (err: any) {
      alert(err.message || "Failed to update booking status");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Derived metrics
  const metrics = useMemo(() => {
    const totalBookingsCount = 3842;
    const pendingCount = bookings.filter((b) => b.status === "Pending").length || 14;
    const activeListingsCount = 1289;
    const platformGmv = 48250000;

    return {
      totalBookingsCount,
      pendingCount,
      activeListingsCount,
      platformGmv,
    };
  }, [bookings]);

  return (
    <div className="min-h-screen bg-surface flex flex-col lg:flex-row">
      {/* 1. LEFT OPERATIONS SIDEBAR */}
      <aside className="w-full lg:w-64 bg-surface-container-low border-r border-surface-container p-6 flex flex-col justify-between shrink-0">
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
            Host Operations Portal
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {[
              { id: "dashboard", label: "Dashboard", icon: "grid_view" },
              { id: "listings", label: "My Listings", icon: "inventory_2" },
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

        {/* Bottom Action in Sidebar */}
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

      {/* 2. MAIN OPERATIONS DASHBOARD CONTENT */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-container">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold text-primary font-headline">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              LIVE STREAM V3.4 • Synced with Central Colombo Registry
            </div>
            <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface">
              RentLanka Operations Hub & Marketplace Control
            </h1>
            <p className="text-xs text-on-surface-variant max-w-2xl">
              Real-time peer-to-peer equipment monitoring, verified ID audits, and instant LankaPay transaction settlement oversight.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={fetchAllBookings}
              className="px-3.5 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-bold font-headline flex items-center gap-1.5 border border-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
              Sync Realtime (12s)
            </button>
            <button
              onClick={() => alert("Audit ledger exported as signed PDF.")}
              className="px-3.5 py-2 rounded-xl bg-primary text-white hover:bg-primary-container text-xs font-bold font-headline flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Export Audit Ledger
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="p-3.5 rounded-2xl bg-primary-fixed/40 border border-primary-fixed text-on-primary-fixed text-xs font-bold flex items-center gap-2 animate-modal-enter">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{statusMessage}</span>
          </div>
        )}

        {/* 4 Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
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
                {metrics.totalBookingsCount.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-primary bg-primary-fixed/40 px-2 py-0.5 rounded-full">
                +18.4%
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant">This billing cycle</p>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl bg-white p-5 border border-surface-container shadow-card hover:shadow-card-elevated transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Pending Approvals
              </span>
              <div className="w-8 h-8 rounded-lg bg-error-container flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-[18px]">notification_important</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="font-headline text-2xl font-black text-error">
                {metrics.pendingCount}
              </span>
              <span className="text-[10px] font-bold text-error bg-error-container px-2 py-0.5 rounded-full">
                Urgent Action
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant">Host turnaround SLA: &lt; 2h</p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl bg-white p-5 border border-surface-container shadow-card hover:shadow-card-elevated transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Active Listings
              </span>
              <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="font-headline text-2xl font-black text-on-surface">
                {metrics.activeListingsCount.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-primary bg-primary-fixed/40 px-2 py-0.5 rounded-full">
                +95 new
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant">Western & Central Provinces</p>
          </div>

          {/* Card 4 */}
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
              <span className="font-headline text-xl font-black text-on-surface">
                {metrics.platformGmv.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant">+22% YoY LankaPay Secured</p>
          </div>
        </div>

        {/* 2-Column Split: Workflow Table on Left, Health & Distribution on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 8 COLS: Live Booking Workflow Table & Condition Moderation */}
          <div className="lg:col-span-8 space-y-6">
            {/* Live Booking Management Workflow */}
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
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Auto-Escrow Enabled
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-low text-on-surface-variant uppercase tracking-wider font-headline font-bold border-b border-surface-container">
                    <tr>
                      <th className="py-3 px-5">Asset & Reference</th>
                      <th className="py-3 px-5">Renter Details</th>
                      <th className="py-3 px-5">Period & Rate</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5 text-right">Workflow</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {/* Row 1: Sony FX6 */}
                    <tr className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-headline font-bold text-sm text-on-surface">
                          Sony FX6 Cinema Kit
                        </div>
                        <div className="text-[11px] text-primary font-mono font-semibold">
                          #RL-9082
                        </div>
                        <div className="text-[10px] text-on-surface-variant mt-0.5">
                          🛡️ Insured • Deposit: LKR 100,000
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-on-surface">Dr. Nuwan Silva</div>
                        <div className="text-[11px] text-slate-500 font-mono">+94 71 882 1100</div>
                        <div className="text-[10px] text-emerald-700 font-semibold">
                          Verified NIC
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-black text-on-surface">LKR 78,000</div>
                        <div className="text-[11px] text-on-surface-variant">Oct 14 – Oct 17 (3 Days)</div>
                        <div className="text-[10px] text-slate-500">LKR 26,000 / day</div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 animate-pulse">
                          Pending Approval
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => alert("Approved and locked calendar for Sony FX6 (#RL-9082)!")}
                            className="px-2.5 py-1.5 rounded-lg bg-primary text-white font-headline text-[11px] font-bold hover:bg-primary-container shadow-xs active:scale-95 transition-all"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => alert("Declined booking #RL-9082.")}
                            className="px-2.5 py-1.5 rounded-lg bg-error-container text-on-error-container font-headline text-[11px] font-bold hover:bg-error hover:text-white transition-all"
                          >
                            Decline
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Row 2: Toyota Land Cruiser Prado */}
                    <tr className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-headline font-bold text-sm text-on-surface">
                          Toyota Land Cruiser Prado
                        </div>
                        <div className="text-[11px] text-primary font-mono font-semibold">
                          #RL-9081
                        </div>
                        <div className="text-[10px] text-on-surface-variant mt-0.5">
                          🛡️ Comprehensive Cover
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-on-surface">Chaminda De Alwis</div>
                        <div className="text-[11px] text-slate-500 font-mono">+94 77 441 2980</div>
                        <div className="text-[10px] text-primary font-semibold">Tier 1 Host Trust</div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-black text-on-surface">LKR 140,000</div>
                        <div className="text-[11px] text-on-surface-variant">Oct 15 – Oct 20 (5 Days)</div>
                        <div className="text-[10px] text-slate-500">LKR 28,000 / day</div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary-fixed text-on-primary-fixed">
                          Confirmed & Inspected
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <span className="text-[11px] text-slate-500 font-semibold">Locked</span>
                      </td>
                    </tr>

                    {/* Row 3: JCB 3DX Backhoe */}
                    <tr className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-headline font-bold text-sm text-on-surface">
                          JCB 3DX Backhoe
                        </div>
                        <div className="text-[11px] text-primary font-mono font-semibold">
                          #RL-9079
                        </div>
                        <div className="text-[10px] text-on-surface-variant mt-0.5">
                          📡 Telematic Tracker
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-on-surface">Kandy Infra Pvt Ltd</div>
                        <div className="text-[11px] text-slate-500 font-mono">py-98129</div>
                        <div className="text-[10px] text-primary font-semibold">Corp Escrow Funded</div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-black text-on-surface">LKR 450,000</div>
                        <div className="text-[11px] text-on-surface-variant">Oct 12 – Oct 22 (10 Days)</div>
                        <div className="text-[10px] text-slate-500">LKR 45,000 / day</div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-secondary-container text-on-secondary-fixed">
                          Currently On Rent
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <span className="text-[11px] text-slate-500 font-semibold">In Field</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Listing Moderation & Condition Verification Card */}
            <div className="rounded-2xl bg-white border border-surface-container p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline text-base font-bold text-on-surface">
                    Listing Moderation & Condition Verification
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Review pending host submissions against safety & clarity guidelines
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary-fixed/40 text-on-primary-fixed">
                  Queue: 3 Pending Review
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
                    <span>•</span>
                    <span>Rate: LKR 42,000 / day</span>
                    <span>•</span>
                    <span>Deposit: LKR 150,000</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    {moderationStatus === "approved" ? (
                      <span className="text-xs font-bold text-emerald-600">
                        ✓ Verified & Published to Marketplace
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setModerationStatus("approved")}
                          className="px-3.5 py-1.5 rounded-lg bg-primary text-white font-headline text-xs font-bold hover:bg-primary-container shadow-xs"
                        >
                          Approve & Mark Verified
                        </button>
                        <button
                          type="button"
                          onClick={() => alert("Resubmission requested from host.")}
                          className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-headline text-xs font-bold hover:bg-surface-container-high"
                        >
                          Request Resubmission
                        </button>
                        <button
                          type="button"
                          onClick={() => setModerationStatus("delisted")}
                          className="px-3 py-1.5 rounded-lg text-error hover:bg-error-container/30 text-xs font-bold"
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
                    <div className="text-[11px] text-on-surface-variant">Digital Identity & Biometrics</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600">Operational</span>
                    <div className="text-[10px] text-slate-500 font-mono">0 backlogs</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-on-surface">Sri Lanka Telecom SMS Gateway</div>
                    <div className="text-[11px] text-on-surface-variant">OTP & Return Alerts</div>
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

            {/* LKR Escrow Settlement Distribution */}
            <div className="rounded-2xl bg-white border border-surface-container p-5 shadow-card space-y-3 text-xs">
              <h3 className="font-headline font-bold text-sm text-on-surface">
                LKR Escrow Settlement Distribution
              </h3>
              <p className="text-on-surface-variant text-[11px]">
                Security deposits currently locked in central trust holding.
              </p>

              {/* Multi-segment progress bar */}
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
                  <span className="font-bold text-on-surface">LKR 12,450,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Disputed Claims (30d):</span>
                  <span className="font-bold text-emerald-600">0.04% (Low)</span>
                </div>
              </div>
            </div>

            {/* Regional Distribution */}
            <div className="rounded-2xl bg-white border border-surface-container p-5 shadow-card space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-headline font-bold text-sm text-on-surface">
                  Regional Distribution
                </h3>
                <span className="text-[10px] text-slate-500 font-semibold">
                  Western • Central • Southern
                </span>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-center space-y-1">
                <span className="material-symbols-outlined text-[32px] text-primary">map</span>
                <p className="font-headline font-bold text-xs text-on-surface">
                  Colombo Port City & Central Metro
                </p>
                <p className="text-[10px] text-on-surface-variant">
                  High concentration of cinema packages and passenger Hiluxes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
