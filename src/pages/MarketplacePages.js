import { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, CalendarDays, Check, CircleHelp, FileText, Filter, ImagePlus, MapPin, Search, ShieldCheck, SlidersHorizontal, Sparkles, Star, UserRound, Users, Wrench, X } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { bookingRows, categoryItems, locations, rentalItems } from '../data/sampleData';
import PageIntro from '../components/ui/PageIntro';
import RentalCard from '../components/ui/RentalCard';

const field = (label, control) => <label className="form-field"><span>{label}</span>{control}</label>;

export function ExplorePage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All categories');
  const [location, setLocation] = useState('All locations');
  const [availability, setAvailability] = useState('Any availability');
  const [sort, setSort] = useState('Popular');
  const [liveItems, setLiveItems] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/v1/items')
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data && result.data.length > 0) {
          const formatted = result.data.map(item => ({
            id: item.id,
            title: item.title,
            category: item.category,
            location: item.location,
            price: Number(item.price_per_day),
            deposit: 15000,
            rating: 4.9,
            reviews: 12,
            available: item.is_available,
            popularity: 80,
            image: item.image_url || 'car',
            imageUrl: item.image_url
          }));
          setLiveItems(formatted);
        } else {
          setLiveItems(rentalItems);
        }
      })
      .catch((err) => {
        console.log("api error, use sample", err);
        setLiveItems(rentalItems);
      });
  }, []);

  const filtered = useMemo(() => {
    const list = liveItems.length > 0 ? liveItems : rentalItems;
    return list.filter((item) => (!query || item.title.toLowerCase().includes(query.toLowerCase())) && (category === 'All categories' || item.category === category) && (location === 'All locations' || item.location.includes(location)) && (availability === 'Any availability' || (availability === 'Available now' ? item.available : !item.available))).sort((a, b) => sort === 'Price: low to high' ? a.price - b.price : sort === 'Price: high to low' ? b.price - a.price : b.popularity - a.popularity);
  }, [liveItems, query, category, location, availability, sort]);

  return <section className="market-page"><div className="app-container"><PageIntro eyebrow="Explore the marketplace" title="Find your next rental" description="Quality gear, vehicles and everyday essentials from trusted local hosts." action={<Link className="primary-button" to="/categories">Browse categories <ArrowRight size={16} /></Link>} /><div className="explore-toolbar"><div className="market-search"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by item name" aria-label="Search by item name" /></div><div className="filter-trigger"><Filter size={16} /> Filters</div></div><div className="filter-row">{field('Category', <select value={category} onChange={(e) => setCategory(e.target.value)}><option>All categories</option>{categoryItems.map((item) => <option key={item.name}>{item.name}</option>)}</select>)}{field('Location', <select value={location} onChange={(e) => setLocation(e.target.value)}><option>All locations</option>{locations.map((item) => <option key={item}>{item}</option>)}</select>)}{field('Availability', <select value={availability} onChange={(e) => setAvailability(e.target.value)}><option>Any availability</option><option>Available now</option><option>Currently booked</option></select>)}{field('Sort by', <select value={sort} onChange={(e) => setSort(e.target.value)}><option>Popular</option><option>Price: low to high</option><option>Price: high to low</option></select>)}<button className="filter-reset" type="button" onClick={() => { setQuery(''); setCategory('All categories'); setLocation('All locations'); setAvailability('Any availability'); }}>Reset</button></div><div className="results-heading"><strong>{filtered.length} rentals</strong><span>Updated today · Trusted local hosts</span></div><div className="market-grid">{filtered.length ? filtered.map((item) => <RentalCard item={item} key={item.id} />) : <div className="empty-panel"><Search size={28} /><h2>No rentals found</h2><p>Try a broader search or reset your filters.</p></div>}</div></div></section>;
}

export function CategoriesPage() { return <section className="market-page"><div className="app-container"><PageIntro eyebrow="Find the right fit" title="Browse by category" description="From a weekend adventure to the tools for your next project, find it nearby." /><div className="category-market-grid">{categoryItems.map((item) => <Link to={`/explore?category=${encodeURIComponent(item.name)}`} className="category-market-card" key={item.name}><div className={`category-market-icon ${item.icon}`}>{item.icon === 'camera' ? <Sparkles /> : item.icon === 'tools' ? <Wrench /> : item.icon === 'outdoor' ? <Star /> : <SlidersHorizontal />}</div><div><span>{item.count}</span><h2>{item.name}</h2><p>{item.description}</p></div><ArrowRight /></Link>)}</div></div></section>; }

// Single item details page with working booking form & real database data
export function RentalDetailsPage() {
  const { id } = useParams();

  // item details state
  const [item, setItem] = useState(null);
  const [loadingItem, setLoadingItem] = useState(true);

  // booking form states
  const [renterName, setRenterName] = useState('');
  const [renterPhone, setRenterPhone] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // fetch single item details from backend
  useEffect(() => {
    fetch(`http://localhost:5000/api/v1/items/${id}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data) {
          setItem(result.data);
        }
        setLoadingItem(false);
      })
      .catch((err) => {
        console.log("error fetch item details", err);
        setLoadingItem(false);
      });
  }, [id]);

  // handle book request submit to backend
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const bookingData = {
      item_id: item?.id,
      item_title: item?.title,
      renter_name: renterName,
      renter_phone: renterPhone,
      start_date: startDate,
      end_date: endDate,
      total_price: Number(item?.price_per_day || 5000) * 3 // estimate for 3 days
    };

    try {
      const res = await fetch('http://localhost:5000/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      }
    } catch (err) {
      console.log('error sending booking', err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingItem) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading item details from database...</div>;
  }

  if (!item) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h2>Item not found</h2>
        <Link to="/" className="primary-button" style={{ display: 'inline-block', marginTop: '1rem' }}>Back to Home</Link>
      </div>
    );
  }

  return (
    <section className="market-page detail-page">
      <div className="app-container">
        <Link className="back-link" to="/"><ArrowLeft size={15} /> Back to explore</Link>

        <div className="detail-layout">
          <div>
            {/* Real item image */}
            <div style={{ marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <img
                src={item.image_url}
                alt={item.title}
                style={{ width: '100%', maxHeight: '420px', objectFit: 'cover' }}
              />
            </div>

            <div className="detail-copy">
              <div className="market-card-meta">
                <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold' }}>
                  {item.category}
                </span>

                {/* Availability status badge */}
                <span style={{
                  backgroundColor: item.is_available ? '#dcfce7' : '#fee2e2',
                  color: item.is_available ? '#166534' : '#991b1b',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontWeight: 'bold'
                }}>
                  {item.is_available ? 'Available Now' : 'Currently Booked'}
                </span>

                <span className="market-rating"><Star size={13} fill="currentColor" /> 4.9 (Verified)</span>
              </div>

              <h1 style={{ marginTop: '0.8rem' }}>{item.title}</h1>
              <p className="market-location"><MapPin size={15} /> {item.location} · Contact: <b>{item.contact_number || '0771234567'}</b></p>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Item Description & Condition</h3>
              <p className="detail-description" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                {item.description || "No specific description provided. Inspected and verified by owner."}
              </p>

              <div className="trust-row" style={{ marginTop: '1.5rem' }}>
                <span><ShieldCheck size={18} /> Verified item condition</span>
                <span><BadgeCheck size={18} /> Quality checked</span>
                <span><CircleHelp size={18} /> Support included</span>
              </div>
            </div>
          </div>

          <aside className="booking-card">
            <div className="booking-price">
              <strong>LKR {Number(item.price_per_day).toLocaleString()}</strong>
              <span>/ day</span>
            </div>
            <p className="booking-note">Security Deposit: LKR 10,000 (Refundable)</p>

            {item.is_available ? (
              <form onSubmit={handleBookingSubmit}>
                {field('Your Full Name', <input value={renterName} onChange={(e) => setRenterName(e.target.value)} placeholder="Kasun Perera" required />)}
                {field('Phone Number', <input value={renterPhone} onChange={(e) => setRenterPhone(e.target.value)} placeholder="0771234567" required />)}
                {field('Pick-up date', <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />)}
                {field('Return date', <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />)}

                <button className="primary-button full-button" type="submit" disabled={loading}>
                  {loading ? 'Sending request...' : submitted ? 'Request Sent!' : 'Request to Book'} <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <div style={{ padding: '1.5rem', backgroundColor: '#fee2e2', borderRadius: '8px', textAlign: 'center', marginTop: '1rem' }}>
                <strong style={{ color: '#991b1b' }}>Currently Rented Out</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#7f1d1d' }}>This item is booked by another customer. Please check back later.</p>
              </div>
            )}

            {submitted && (
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <p className="success-note" role="status"><Check size={15} /> Your booking request has been sent to the host!</p>
                <Link to="/admin" className="text-link" style={{ fontSize: '13px', display: 'block', marginTop: '8px', color: '#0f766e', fontWeight: 'bold' }}>
                  Go to Admin Panel to see & confirm this request →
                </Link>
              </div>
            )}

            <div className="owner-row">
              <span className="owner-avatar">LK</span>
              <div>
                <strong>RentLanka Host</strong>
                <span>Usually responds within an hour</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export function HowItWorksPage() { return <section className="market-page"><div className="app-container"><PageIntro eyebrow="Simple by design" title="Renting made easy" description="A safer, more personal way to get the things you need and earn from the things you own." /><div className="audience-grid"><div className="audience-card renter"><span className="audience-number">01</span><Users size={26} /><h2>For renters</h2><p>Find trusted items close to home, book with confidence and enjoy more without buying more.</p><ol><li><b>Search nearby</b><span>Explore quality items by category, dates or location.</span></li><li><b>Book securely</b><span>Send a request and agree on pick-up details with your host.</span></li><li><b>Enjoy the experience</b><span>Collect your item, make memories and return it on time.</span></li></ol><Link className="text-button" to="/explore">Explore rentals <ArrowRight size={15} /></Link></div><div className="audience-card host"><span className="audience-number">02</span><Sparkles size={26} /><h2>For item owners</h2><p>Turn underused belongings into income while meeting respectful people in your community.</p><ol><li><b>Create your listing</b><span>Add honest details, photos, pricing and availability.</span></li><li><b>Meet your renter</b><span>Review booking requests and coordinate a convenient handoff.</span></li><li><b>Earn with confidence</b><span>Keep control of your calendar and grow your reputation.</span></li></ol><Link className="text-button" to="/list-your-item">List your item <ArrowRight size={15} /></Link></div></div></div></section>; }

export function AuthPage({ mode = 'login' }) { const isLogin = mode === 'login'; return <section className="auth-page"><div className="auth-panel"><div className="auth-intro"><span className="auth-logo">R</span><p className="eyebrow">Welcome to RentLanka</p><h1>{isLogin ? 'Good to see you again.' : 'Make room for more.'}</h1><p>{isLogin ? 'Log in to manage bookings, saved rentals and your listings.' : 'Create an account and start renting smarter today.'}</p></div><form className="auth-form" onSubmit={(e) => e.preventDefault()}>{!isLogin && <div className="account-choice"><button type="button" className="selected"><UserRound size={17} /> I want to rent</button><button type="button"><Sparkles size={17} /> I want to list items</button></div>}{field('Email address', <input type="email" placeholder="you@example.com" required />)}{field('Password', <input type="password" placeholder="At least 8 characters" required />)}{!isLogin && field('Full name', <input placeholder="Your full name" required />)}<button className="primary-button full-button" type="submit">{isLogin ? 'Log in' : 'Create account'} <ArrowRight size={16} /></button><p className="auth-switch">{isLogin ? 'New to RentLanka?' : 'Already have an account?'} <Link to={isLogin ? '/register' : '/login'}>{isLogin ? 'Create an account' : 'Log in'}</Link></p></form></div></section>; }

// Form to add new rental item with computer file upload
export function ListItemPage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newItem = {
      title,
      category,
      location,
      description,
      price_per_day: Number(pricePerDay),
      image_url: imageUrl || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc',
      contact_number: contactNumber || '0771234567'
    };

    try {
      const response = await fetch('http://localhost:5000/api/v1/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
      }
    } catch (err) {
      console.log('error saving item', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="market-page form-page">
      <div className="app-container">
        <PageIntro eyebrow="Share what you own" title="List your item" description="Give your item a second life and earn from it when you are not using it." />
        <form className="listing-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-section-heading">
              <FileText />
              <div>
                <h2>Item details</h2>
                <p>Help renters understand exactly what they are booking.</p>
              </div>
            </div>
            {field('Item name', <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Honda Vezel 2019" required />)}
            <div className="two-fields">
              {field('Category', (
                <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                  <option value="">Select a category</option>
                  {categoryItems.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
                </select>
              ))}
              {field('Location', (
                <select value={location} onChange={(e) => setLocation(e.target.value)} required>
                  <option value="">Select a location</option>
                  {locations.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              ))}
            </div>
            {field('Contact Number', <input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="e.g. 0771234567" required />)}
            {field('Description', <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="4" placeholder="Describe your item condition, terms, and specs." required />)}
          </div>

          <div className="form-section">
            <div className="form-section-heading">
              <ImagePlus />
              <div>
                <h2>Photos and pricing</h2>
                <p>Upload a real photo from your computer and set price.</p>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="upload-box" style={{ cursor: 'pointer', display: 'block', border: '2px dashed #94a3b8', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                <ImagePlus size={30} style={{ margin: '0 auto 8px auto', color: '#0f766e' }} />
                <strong>{fileName ? `Selected: ${fileName}` : 'Click here to choose a photo from your computer'}</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>PNG, JPG or JPEG</p>
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>

              {imageUrl && (
                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '13px', marginBottom: '6px' }}>Photo Preview:</p>
                  <img src={imageUrl} alt="preview" style={{ width: '140px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              )}
            </div>

            <div className="two-fields">
              {field('Daily price (LKR)', <input type="number" min="1" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} placeholder="5000" required />)}
              {field('Refundable deposit (LKR)', <input type="number" min="0" placeholder="10000" />)}
            </div>
          </div>

          <div className="form-actions">
            <Link className="secondary-button" to="/">Cancel</Link>
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? 'Saving...' : submitted ? 'Listing Published!' : 'Publish listing'} <ArrowRight size={16} />
            </button>
          </div>

          {submitted && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <p className="success-note centered" role="status"><Check size={15} /> Your item with photo has been published to Supabase!</p>
              <Link className="primary-button" to="/" style={{ display: 'inline-block', marginTop: '10px' }}>Go to Homepage to see it</Link>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

export function MyBookingsPage() { const [rows, setRows] = useState(bookingRows); return <section className="market-page"><div className="app-container"><PageIntro eyebrow="Your account" title="My bookings" description="Keep track of upcoming pick-ups and your rental history." action={<Link className="secondary-button" to="/explore">Find another rental</Link>} /><div className="account-tabs"><span className="active">All bookings</span><span>Upcoming</span><span>Past</span></div><div className="booking-list">{rows.map((row) => <article className="booking-row" key={row.id}><div className={`booking-thumb ${row.image}`} /><div className="booking-row-main"><span>{row.id} · {row.dates}</span><h2>{row.item}</h2><p><CalendarDays size={14} /> Pick-up details shared after confirmation</p></div><div className="booking-row-side"><strong>{row.total}</strong><span className={`status ${row.status.toLowerCase()}`}>{row.status}</span>{row.status === 'Confirmed' && <button type="button" onClick={() => setRows(rows.map((item) => item.id === row.id ? { ...item, status: 'Cancelled' } : item))}>Cancel booking</button>}</div></article>)}</div></div></section>; }

export function MyListingsPage() { return <section className="market-page"><div className="app-container"><PageIntro eyebrow="Your host space" title="My listings" description="Manage availability and keep your listings looking their best." action={<Link className="primary-button" to="/list-your-item">Add new listing <ArrowRight size={16} /></Link>} /><div className="listing-summary"><div><strong>3</strong><span>Active listings</span></div><div><strong>LKR 42,600</strong><span>Earned this month</span></div><div><strong>4.9</strong><span>Average rating</span></div></div><div className="owner-list">{rentalItems.slice(0, 4).map((item) => <article className="owner-list-row" key={item.id}><div className={`booking-thumb ${item.image}`} /><div><span>{item.category}</span><h2>{item.title}</h2><p><MapPin size={14} /> {item.location} · LKR {item.price.toLocaleString()} / day</p></div><span className="status confirmed">Active</span><button type="button" className="icon-button" aria-label={`Edit ${item.title}`}><Wrench size={17} /></button></article>)}</div></div></section>; }

// Working Admin Dashboard with Confirm / Reject booking flow
export function AdminDashboardPage() {
  const [tab, setTab] = useState('Overview');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // load real bookings from backend
  const fetchBookings = () => {
    fetch('http://localhost:5000/api/v1/bookings')
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          setBookings(result.data);
        }
      })
      .catch(err => console.log("error fetch bookings", err));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // admin confirm or reject booking action
  const handleStatusChange = async (id, status, itemId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, item_id: itemId })
      });
      const data = await res.json();
      if (data.success) {
        // update local list
        fetchBookings();
      }
    } catch (err) {
      console.log("error updating status", err);
    }
  };

  return (
    <section className="market-page admin-page">
      <div className="app-container">
        <PageIntro eyebrow="Operations" title="Admin & Host Dashboard" description="Manage rental bookings, approve customer requests, and monitor marketplace status." />
        <div className="admin-tabs">
          {['Overview', 'Bookings', 'Listings'].map((item) => (
            <button className={tab === item ? 'active' : ''} type="button" key={item} onClick={() => setTab(item)}>
              {item}
            </button>
          ))}
        </div>

        {tab === 'Overview' || tab === 'Bookings' ? (
          <>
            <div className="admin-stats">
              <div><span>Total Bookings</span><strong>{bookings.length}</strong><small>Live records</small></div>
              <div><span>Pending Requests</span><strong>{bookings.filter(b => b.status === 'Pending').length}</strong><small>Needs approval</small></div>
              <div><span>Confirmed Bookings</span><strong>{bookings.filter(b => b.status === 'Confirmed').length}</strong><small>Ready for pickup</small></div>
              <div><span>Marketplace Health</span><strong>98%</strong><small>Verified hosts</small></div>
            </div>

            <div className="admin-panels">
              <div className="admin-panel" style={{ flex: 2 }}>
                <div className="panel-heading">
                  <h2>Rental Booking Requests (Approve / Reject)</h2>
                  <span>Live data</span>
                </div>

                {bookings.length === 0 ? (
                  <p style={{ padding: '1rem', color: '#64748b' }}>No booking requests yet. Customers can request from the item details page.</p>
                ) : (
                  bookings.map((row) => (
                    <div className="admin-row" key={row.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                      <div>
                        <strong>{row.item_title}</strong>
                        <p style={{ margin: '2px 0', fontSize: '13px', color: '#64748b' }}>
                          Renter: <b>{row.renter_name}</b> ({row.renter_phone})
                        </p>
                        <small style={{ color: '#0f766e' }}>{row.start_date} to {row.end_date} · Total: LKR {Number(row.total_price).toLocaleString()}</small>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: row.status === 'Confirmed' ? '#dcfce7' : row.status === 'Rejected' ? '#fee2e2' : '#fef9c3',
                          color: row.status === 'Confirmed' ? '#166534' : row.status === 'Rejected' ? '#991b1b' : '#854d0e'
                        }}>
                          {row.status}
                        </span>

                        {row.status === 'Pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(row.id, 'Confirmed', row.item_id)}
                              style={{ backgroundColor: '#0f766e', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(row.id, 'Rejected', row.item_id)}
                              style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="admin-panel" style={{ flex: 1 }}>
                <div className="panel-heading"><h2>System Condition Report</h2></div>
                <div className="health-meter"><span style={{ width: '92%' }} /></div>
                <strong className="health-score">92%</strong>
                <p>Inspection & safety score</p>
                <div className="health-list">
                  <span><Check size={15} /> All hosts phone-verified</span>
                  <span><Check size={15} /> Vehicle condition reports active</span>
                  <span><Check size={15} /> Refundable deposit policy applied</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-panel"><Users size={28} /><h2>Listings Management</h2><p>View all active listings and host verification status.</p></div>
        )}
      </div>
    </section>
  );
}