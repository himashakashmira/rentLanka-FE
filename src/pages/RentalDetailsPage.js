import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft, ArrowRight, ShieldCheck, BadgeCheck, CircleHelp,
    MapPin, Star, Check
} from 'lucide-react';

export default function RentalDetailsPage() {
    const { id } = useParams();

    // states for item details
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    // states for customer booking form
    const [renterName, setRenterName] = useState('');
    const [renterPhone, setRenterPhone] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    // fetch item details from backend
    useEffect(() => {
        // get all items first to make sure item is found
        fetch('https://rent-lanka-be.vercel.app/api/v1/items')
            .then((res) => res.json())
            .then((result) => {
                if (result.success && result.data) {
                    // find clicked item by id
                    const found = result.data.find((i) => i.id === id);
                    if (found) {
                        setItem(found);
                    }
                }
                setLoading(false);
            })
            .catch((err) => {
                console.log("error fetch item", err);
                setLoading(false);
            });
    }, [id]);

    // handle submit booking to backend
    const handleBooking = async (e) => {
        e.preventDefault();
        setBookingLoading(true);

        const bookingPayload = {
            item_id: item?.id,
            item_title: item?.title,
            renter_name: renterName,
            renter_phone: renterPhone,
            start_date: startDate,
            end_date: endDate,
            total_price: Number(item?.price_per_day || 5000) * 3 // estimate total
        };

        try {
            const res = await fetch('https://rent-lanka-be.vercel.app/api/v1/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingPayload)
            });
            const data = await res.json();
            if (data.success) {
                setBookingSuccess(true);
            }
        } catch (err) {
            console.log("error booking", err);
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '5rem', textAlign: 'center', fontSize: '18px' }}>
                Loading item details from database...
            </div>
        );
    }

    if (!item) {
        return (
            <div style={{ padding: '5rem', textAlign: 'center' }}>
                <h2>Item not found</h2>
                <p>Could not load the requested item.</p>
                <Link to="/" className="primary-button" style={{ display: 'inline-block', marginTop: '1rem' }}>
                    Back to Home
                </Link>
            </div>
        );
    }

    return (
        <section className="market-page detail-page">
            <div className="app-container">
                <Link className="back-link" to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '1.5rem', textDecoration: 'none', color: '#0f766e', fontWeight: '500' }}>
                    <ArrowLeft size={16} /> Back to explore
                </Link>

                <div className="detail-layout" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2.5rem' }}>

                    {/* Left Column: Item Photos & Specs */}
                    <div>
                        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '1.5rem', backgroundColor: '#f8fafc' }}>
                            <img
                                src={item.image_url}
                                alt={item.title}
                                style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', display: 'block' }}
                            />
                        </div>

                        <div className="detail-copy">
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}>
                                    {item.category}
                                </span>

                                {/* Live Availability Badge */}
                                <span style={{
                                    backgroundColor: item.is_available ? '#dcfce7' : '#fee2e2',
                                    color: item.is_available ? '#166534' : '#991b1b',
                                    padding: '4px 12px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: 'bold'
                                }}>
                                    {item.is_available ? 'Available Now' : 'Currently Booked'}
                                </span>

                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#475569' }}>
                                    <Star size={14} fill="#eab308" color="#eab308" /> 4.9 Verified Host
                                </span>
                            </div>

                            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#0f172a' }}>{item.title}</h1>

                            <p style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '15px' }}>
                                <MapPin size={16} color="#0f766e" /> {item.location} · Contact Host: <b>{item.contact_number || '0771234567'}</b>
                            </p>

                            <hr style={{ margin: '1.5rem 0', borderColor: '#f1f5f9' }} />

                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.6rem' }}>Item Condition & Description</h3>
                            <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#334155', whiteSpace: 'pre-line' }}>
                                {item.description || "The owner has verified this item in mint condition and ready for immediate rental pickup."}
                            </p>

                            <div className="trust-row" style={{ display: 'flex', gap: '20px', marginTop: '2rem', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '12px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#166534' }}><ShieldCheck size={18} /> Verified condition</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#166534' }}><BadgeCheck size={18} /> Quality checked</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#166534' }}><CircleHelp size={18} /> Support included</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Pricing & Booking Box */}
                    <aside>
                        <div style={{ border: '1px solid #cbd5e1', borderRadius: '16px', padding: '24px', backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a' }}>
                                    LKR {Number(item.price_per_day).toLocaleString()}
                                </span>
                                <span style={{ color: '#64748b' }}> / day</span>
                            </div>

                            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '1.5rem' }}>
                                Refundable Deposit: <b>LKR 10,000</b> (Returned upon return)
                            </p>

                            {item.is_available ? (
                                <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Your Name</label>
                                        <input
                                            type="text"
                                            value={renterName}
                                            onChange={(e) => setRenterName(e.target.value)}
                                            placeholder="e.g. Kasun Fernando"
                                            required
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Phone Number</label>
                                        <input
                                            type="text"
                                            value={renterPhone}
                                            onChange={(e) => setRenterPhone(e.target.value)}
                                            placeholder="e.g. 0771234567"
                                            required
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Pick-up</label>
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                required
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Return</label>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                required
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={bookingLoading}
                                        style={{ backgroundColor: '#0f766e', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '10px' }}
                                    >
                                        {bookingLoading ? 'Sending request...' : bookingSuccess ? 'Request Sent!' : 'Request to Book'} <ArrowRight size={16} />
                                    </button>
                                </form>
                            ) : (
                                <div style={{ padding: '1.5rem', backgroundColor: '#fee2e2', borderRadius: '8px', textAlign: 'center' }}>
                                    <strong style={{ color: '#991b1b' }}>Currently Rented Out</strong>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#7f1d1d' }}>
                                        This item has been booked by another customer.
                                    </p>
                                </div>
                            )}

                            {bookingSuccess && (
                                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', textAlign: 'center' }}>
                                    <p style={{ color: '#166534', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                        <Check size={16} /> Request sent to host!
                                    </p>
                                    <Link to="/admin" style={{ display: 'block', marginTop: '6px', fontSize: '13px', color: '#0f766e', fontWeight: 'bold' }}>
                                        Go to Admin Dashboard to confirm request →
                                    </Link>
                                </div>
                            )}

                            <hr style={{ margin: '1.5rem 0', borderColor: '#f1f5f9' }} />

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#0f766e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    RL
                                </div>
                                <div>
                                    <strong>RentLanka Verified Host</strong>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Response time: within 1 hour</p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
}