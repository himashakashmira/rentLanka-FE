import React, { useState } from "react";
import { Item, Booking } from "../../types";
import { bookingsApi } from "../../services/api";
import { useAppSelector } from "../../app/store";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item;
  rentalData: {
    startDate: string;
    endDate: string;
    durationDays: number;
    dailyPrice: number;
    subtotal: number;
    deposit: number;
    platformFee: number;
    totalPayable: number;
    renterName: string;
    renterPhone: string;
    renterNic: string;
    renterEmail?: string;
  };
  onBookingSuccess: (booking: Booking) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  item,
  rentalData,
  onBookingSuccess,
}) => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState<"card" | "lankaqr">("card");
  const [processingState, setProcessingState] = useState<
    "idle" | "connecting" | "locking_escrow" | "success"
  >("idle");
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pre-filled test credit card details matching Image 5
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("•••");

  if (!isOpen) return null;

  const handlePayAndConfirm = async () => {
    setErrorMessage(null);
    setProcessingState("connecting");

    setTimeout(() => {
      setProcessingState("locking_escrow");
    }, 1100);

    setTimeout(async () => {
      try {
        const payload: Partial<Booking> = {
          item_id: item._id || item.id,
          item_title: item.title,
          item_image: item.image_url,
          item_location: item.location,
          renter_name: rentalData.renterName,
          renter_email: rentalData.renterEmail || currentUser?.email || "customer@rentlanka.lk",
          renter_phone: rentalData.renterPhone,
          renter_nic: rentalData.renterNic,
          start_date: rentalData.startDate,
          end_date: rentalData.endDate,
          duration_days: rentalData.durationDays,
          daily_rate: rentalData.dailyPrice,
          total_price: rentalData.totalPayable,
          security_deposit: rentalData.deposit,
          platform_fee: rentalData.platformFee,
          payment_method: activeTab === "card" ? "LankaPay / Visa / Master" : "Pay on Pickup (Cash / QR)",
          status: "Pending",
        };

        const created = await bookingsApi.create(payload);
        setConfirmedBooking(created);
        setProcessingState("success");
        onBookingSuccess(created);
      } catch (err: any) {
        setProcessingState("idle");
        setErrorMessage(err.message || "Escrow authorization failed. Please try again.");
      }
    }, 2400);
  };

  const handleDownloadVoucher = () => {
    if (!confirmedBooking) return;

    const voucherWindow = window.open("", "_blank");
    if (!voucherWindow) {
      alert("Please allow pop-ups to download or print your signed rental voucher.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>RentLanka_Voucher_${confirmedBooking.booking_reference}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #0b1c30; background: #fff; }
          .voucher-card { max-width: 800px; margin: 0 auto; border: 2px solid #006948; border-radius: 16px; padding: 36px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px dashed #cbdbf5; padding-bottom: 24px; margin-bottom: 24px; }
          .brand { font-size: 28px; font-weight: 800; color: #006948; }
          .brand span { color: #0b1c30; }
          .badge { background: #85f8c4; color: #002114; padding: 6px 14px; border-radius: 999px; font-weight: 700; font-size: 13px; text-transform: uppercase; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
          .item-box { background: #eff4ff; border-radius: 12px; padding: 20px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
          .row.bold { font-weight: bold; font-size: 16px; border-top: 1px solid #cbdbf5; padding-top: 8px; margin-top: 8px; }
          .security-seal { border: 1px solid #006948; background: #f5fff7; border-radius: 10px; padding: 16px; margin-top: 24px; font-size: 12px; color: #005137; }
          .signatures { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5eeff; }
          .signature-box { text-align: center; font-size: 13px; color: #565e74; }
          .line { width: 180px; height: 1px; background: #6d7a72; margin: 0 auto 8px auto; }
          @media print { body { margin: 0; } .voucher-card { border: none; box-shadow: none; padding: 0; } button { display: none; } }
        </style>
      </head>
      <body>
        <div class="voucher-card">
          <div class="header">
            <div>
              <div class="brand">Rent<span>Lanka</span></div>
              <div style="font-size: 12px; color: #565e74; margin-top: 4px;">OFFICIAL ESCROW RENTAL AGREEMENT & VOUCHER</div>
            </div>
            <div style="text-align: right;">
              <span class="badge">CONFIRMED & SECURED</span>
              <div style="font-size: 14px; font-weight: bold; margin-top: 6px; color: #006948;">Ref: ${confirmedBooking.booking_reference}</div>
              <div style="font-size: 11px; color: #565e74;">Date: ${new Date().toLocaleDateString("en-GB")}</div>
            </div>
          </div>

          <div class="grid">
            <div class="item-box">
              <h3 style="margin-top: 0; color: #006948; font-size: 16px;">Rental Asset Information</h3>
              <div class="row"><span>Item:</span> <strong>${confirmedBooking.item_title}</strong></div>
              <div class="row"><span>Hub / Location:</span> <strong>${confirmedBooking.item_location || item.location}</strong></div>
              <div class="row"><span>Owner / Host:</span> <strong>${item.owner_name || "Verified Host"}</strong></div>
              <div class="row"><span>Host Hotline:</span> <strong>${item.contact_number || "+94 77 123 4567"}</strong></div>
            </div>

            <div class="item-box">
              <h3 style="margin-top: 0; color: #006948; font-size: 16px;">Renter Details</h3>
              <div class="row"><span>Name:</span> <strong>${confirmedBooking.renter_name}</strong></div>
              <div class="row"><span>Phone / WhatsApp:</span> <strong>${confirmedBooking.renter_phone}</strong></div>
              <div class="row"><span>NIC Number:</span> <strong>${confirmedBooking.renter_nic}</strong></div>
              <div class="row"><span>Payment Channel:</span> <strong>${confirmedBooking.payment_method}</strong></div>
            </div>
          </div>

          <div class="item-box" style="margin-bottom: 24px;">
            <h3 style="margin-top: 0; color: #006948; font-size: 16px;">Escrow Financial Breakdown</h3>
            <div class="row"><span>Rental Period:</span> <strong>${confirmedBooking.start_date} to ${confirmedBooking.end_date} (${confirmedBooking.duration_days} Days)</strong></div>
            <div class="row"><span>Daily Rate:</span> <span>LKR ${confirmedBooking.daily_rate.toLocaleString()} / day</span></div>
            <div class="row"><span>Rental Duration Fee:</span> <span>LKR ${(confirmedBooking.daily_rate * confirmedBooking.duration_days).toLocaleString()}</span></div>
            <div class="row"><span>Refundable Security Deposit (Escrow Hold):</span> <span>LKR ${confirmedBooking.security_deposit.toLocaleString()}</span></div>
            <div class="row"><span>LankaPay Switch Processing Fee:</span> <span>LKR ${confirmedBooking.platform_fee.toLocaleString()}</span></div>
            <div class="row bold"><span>Total Escrow Authorization:</span> <span style="color: #006948;">LKR ${confirmedBooking.total_price.toLocaleString()}</span></div>
          </div>

          <div class="security-seal">
            <strong>🔒 RentLanka Shield™ Escrow Guarantee (#LK-VERIFIED)</strong><br/>
            The refundable security deposit of LKR ${confirmedBooking.security_deposit.toLocaleString()} is held safely in escrow until the equipment is inspected and returned to the host. Fully insured against unauthorized damages up to LKR 500,000 under Sri Lanka electronic commerce standards.
          </div>

          <div class="signatures">
            <div class="signature-box">
              <div class="line"></div>
              <div>Authorized LankaPay Escrow Officer</div>
              <div style="font-size: 10px; color: #85f8c4; background: #006948; padding: 2px 8px; border-radius: 4px; display: inline-block; margin-top: 4px;">DIGITALLY SIGNED</div>
            </div>
            <div class="signature-box">
              <div class="line"></div>
              <div>Renter Signature (Handover Acceptance)</div>
              <div style="font-size: 11px; color: #0b1c30; font-weight: bold;">NIC: ${confirmedBooking.renter_nic}</div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 32px;">
            <button onclick="window.print()" style="background: #006948; color: #fff; padding: 12px 28px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px;">Print / Save as PDF</button>
          </div>
        </div>
      </body>
      </html>
    `;

    voucherWindow.document.write(htmlContent);
    voucherWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-modal-enter">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-surface-container overflow-hidden">
        {/* Modal Top Header with 3 Step indicator */}
        <div className="p-5 pb-3 border-b border-surface-container">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <div>
                <h3 className="font-headline text-base font-bold text-on-surface">
                  Checkout &amp; Confirmation
                </h3>
                <p className="text-[10px] text-on-surface-variant">
                  Step 3 of 3: Escrow Payment Authorization
                </p>
              </div>
            </div>

            {processingState === "idle" && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* 3 Step Progress Bar */}
          <div className="flex items-center gap-1">
            <div className="flex-1 py-1 rounded bg-primary-fixed text-on-primary-fixed text-[10px] font-bold text-center">
              ✓ 1. Dates &amp; Gear
            </div>
            <div className="flex-1 py-1 rounded bg-primary-fixed text-on-primary-fixed text-[10px] font-bold text-center">
              ✓ 2. Verified NIC
            </div>
            <div className="flex-1 py-1 rounded bg-primary text-white text-[10px] font-bold text-center shadow-xs">
              3. Escrow Deposit
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5">
          {/* SUCCESS SCREEN */}
          {processingState === "success" && confirmedBooking ? (
            <div className="text-center py-6 space-y-4 animate-modal-enter">
              <div className="w-16 h-16 rounded-full bg-primary-fixed text-on-primary-fixed mx-auto flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[36px]">check_circle</span>
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold font-headline bg-primary text-white uppercase tracking-wider">
                  Escrow Authorized &amp; Locked
                </span>
                <h4 className="font-headline text-2xl font-black text-on-surface mt-2">
                  Booking Confirmed!
                </h4>
                <p className="text-xs text-on-surface-variant mt-1">
                  Reference:{" "}
                  <span className="font-mono font-bold text-primary text-sm">
                    {confirmedBooking.booking_reference}
                  </span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low text-left space-y-1.5 text-xs border border-surface-container">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Asset:</span>
                  <span className="font-bold text-on-surface">{item.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Dates:</span>
                  <span className="font-bold text-on-surface">
                    {rentalData.startDate} → {rentalData.endDate} ({rentalData.durationDays} Days)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Renter:</span>
                  <span className="font-bold text-on-surface">{rentalData.renterName}</span>
                </div>
                <div className="flex justify-between border-t border-surface-container pt-1.5 text-sm">
                  <span className="font-bold text-on-surface">Total Authorized:</span>
                  <span className="font-bold text-primary font-headline">
                    LKR {rentalData.totalPayable.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Automated Email Notification Note */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-left flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
                  mark_email_read
                </span>
                <div>
                  <p className="text-xs text-emerald-950 font-bold">
                    ✓ Confirmation email and digital rental voucher have been dispatched to your email address ({rentalData.renterEmail || currentUser?.email || "your email"}).
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Please check your inbox or spam folder for your official receipt and LankaPay escrow voucher.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadVoucher}
                  className="flex-1 py-3 px-4 rounded-xl bg-primary text-white hover:bg-primary-container font-headline font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Download Signed Voucher (PDF)
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-headline font-bold text-xs transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          ) : processingState !== "idle" ? (
            /* PROCESSING ESCROW ANIMATION */
            <div className="text-center py-8 space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-primary-fixed opacity-40"></div>
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[28px]">lock</span>
                </div>
              </div>

              <div>
                <h4 className="font-headline text-base font-bold text-on-surface">
                  {processingState === "connecting"
                    ? "Connecting LankaPay Switch..."
                    : "Securing Escrow Deposit (LKR 20,000)..."}
                </h4>
                <p className="text-xs text-on-surface-variant mt-1">
                  {processingState === "connecting"
                    ? "Establishing 256-bit TLS handshake with National Central Bank Gateway..."
                    : `Locking LKR ${rentalData.deposit.toLocaleString()} refundable deposit with RentLanka Shield™.`}
                </p>
              </div>
            </div>
          ) : (
            /* CHECKOUT FORM MATCHING IMAGE 5 */
            <div className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs">
                  {errorMessage}
                </div>
              )}

              {/* Order Summary Strip */}
              <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-surface-container shrink-0">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-headline text-xs font-bold text-on-surface line-clamp-1">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-on-surface-variant">
                      {rentalData.startDate} – {rentalData.endDate} ({rentalData.durationDays} Days) • Colombo 03 Pickup
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-headline text-sm font-black text-on-surface">
                    LKR {rentalData.totalPayable.toLocaleString()}
                  </div>
                  <span className="text-[9px] text-emerald-600 font-semibold block">
                    All taxes included
                  </span>
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-on-surface-variant tracking-wider mb-1.5">
                  Select Payment Method:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("card")}
                    className={`py-2 px-3 rounded-xl text-xs font-headline font-bold flex items-center justify-center gap-1.5 border transition-all ${activeTab === "card"
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "bg-surface-container-low border-surface-container text-on-surface-variant hover:bg-surface-container"
                      }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">credit_card</span>
                    LankaPay / Visa / Master
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("lankaqr")}
                    className={`py-2 px-3 rounded-xl text-xs font-headline font-bold flex items-center justify-center gap-1.5 border transition-all ${activeTab === "lankaqr"
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "bg-surface-container-low border-surface-container text-on-surface-variant hover:bg-surface-container"
                      }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                    Pay on Pickup (Cash / QR)
                  </button>
                </div>
              </div>

              {/* Pre-filled Test Card form */}
              {activeTab === "card" && (
                <div className="p-4 rounded-2xl bg-surface-container-low/70 border border-surface-container space-y-3 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                    <span className="font-bold text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">tune</span>
                      Test Card Demo Auto-Filled
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-500">
                      <span className="material-symbols-outlined text-[12px]">lock</span>
                      256-Bit SSL Encrypted
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-on-surface mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-surface-container font-mono text-xs font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-surface-container font-mono text-xs font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface mb-1">
                        CVC / CVV
                      </label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-surface-container font-mono text-xs font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* LankaQR tab */}
              {activeTab === "lankaqr" && (
                <div className="text-center py-3 space-y-2 bg-surface-container-low/70 p-4 rounded-2xl border border-surface-container">
                  <div className="w-28 h-28 mx-auto bg-white p-2 rounded-xl border-2 border-primary flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-[72px] text-on-surface leading-none">
                      qr_code_2
                    </span>
                    <span className="text-[9px] font-black uppercase text-primary -mt-2">
                      LANKA QR
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    Scan with any Sri Lankan bank app (Commercial Bank, BOC, Sampath, FriMi) to authorize on pickup.
                  </p>
                </div>
              )}

              {/* Disclaimer */}
              <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1">
                <span className="flex items-center gap-1 text-primary font-semibold">
                  <span className="material-symbols-outlined text-[14px]">shield</span>
                  Escrow Security Protected: LKR {rentalData.deposit.toLocaleString()} auto-refund guarantee
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-on-surface-variant hover:text-on-surface font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                onClick={handlePayAndConfirm}
                className="w-full py-3.5 rounded-xl bg-primary text-white hover:bg-primary-container font-headline font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,105,72,0.35)] transition-all active:scale-[0.98] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">lock</span>
                Pay LKR {rentalData.totalPayable.toLocaleString()} &amp; Confirm Booking
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
