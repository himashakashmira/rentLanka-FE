import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  Construction,
  Globe2,
  Heart,
  Laptop,
  MapPin,
  Menu,
  MessageCircle,
  Search,
  ShieldCheck,
  Star,
  Truck,
  Wrench,
  X,
} from 'lucide-react';
import './App.css';
import rentalCollage from './assets/rentlanka-rentals.png';
import heroImage from './assets/rentlanka-hero.png';

const categories = [
  { label: 'Vehicles', icon: Truck, count: '1,240 items' },
  { label: 'Motorcycles', icon: 'scooter', count: '860 items' },
  { label: 'Electronics', icon: Laptop, count: '2,180 items' },
  { label: 'Cameras', icon: Camera, count: '340 items' },
  { label: 'Construction', icon: Construction, count: '520 items' },
  { label: 'Tools & Machinery', icon: Wrench, count: '740 items' },
  { label: 'Furniture', icon: 'chair', count: '610 items' },
  { label: 'Events', icon: 'event', count: '290 items' },
];

const rentals = [
  { title: 'Toyota Corolla Cross', category: 'Vehicles', location: 'Colombo 03', price: '8,500', rating: '4.9', reviews: 28, image: 'car' },
  { title: 'Sony A7 IV Camera Kit', category: 'Cameras', location: 'Colombo 07', price: '4,000', rating: '5.0', reviews: 16, image: 'camera' },
  { title: 'Honda Dio 2024', category: 'Motorcycles', location: 'Negombo', price: '2,500', rating: '4.8', reviews: 42, image: 'scooter' },
  { title: 'Makita Power Tool Set', category: 'Tools & Machinery', location: 'Kandy', price: '3,200', rating: '4.9', reviews: 19, image: 'tools' },
];

const locations = [
  { name: 'Colombo', detail: '1,890 rentals', image: 'colombo' },
  { name: 'Kandy', detail: '620 rentals', image: 'kandy' },
  { name: 'Galle', detail: '540 rentals', image: 'galle' },
  { name: 'Negombo', detail: '410 rentals', image: 'negombo' },
];

function Logo() {
  return <a className="brand" href="#top" aria-label="RentLanka home"><span className="brand-mark">R</span><span>Rent<span className="brand-accent">Lanka</span></span></a>;
}

function CategoryIcon({ icon: Icon }) {
  if (typeof Icon === 'string') {
    return <span className={`category-glyph ${Icon}`} aria-hidden="true" />;
  }
  return <Icon size={23} strokeWidth={1.8} aria-hidden="true" />;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All categories');
  const [location, setLocation] = useState('Anywhere in Sri Lanka');
  const [date, setDate] = useState('Any dates');
  const [searchMessage, setSearchMessage] = useState('');
  const [saved, setSaved] = useState([]);

  const visibleRentals = useMemo(() => {
    if (activeCategory === 'All categories') return rentals;
    return rentals.filter((rental) => rental.category === activeCategory || (activeCategory === 'Construction' && rental.category === 'Tools & Machinery'));
  }, [activeCategory]);

  const handleSearch = (event) => {
    event.preventDefault();
    setSearchMessage(`Showing ${activeCategory.toLowerCase()} near ${location.toLowerCase()} for ${date.toLowerCase()}.`);
    document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleSaved = (title) => {
    setSaved((current) => current.includes(title) ? current.filter((item) => item !== title) : [...current, title]);
  };

  return (
    <div className="site-shell" id="top">
      <header className="site-header">
        <div className="container nav-wrap">
          <Logo />
          <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Primary navigation">
            <a className="active" href="#top" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="#featured" onClick={() => setMenuOpen(false)}>Explore Rentals</a>
            <a href="#categories" onClick={() => setMenuOpen(false)}>Categories</a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</a>
          </nav>
          <div className="nav-actions">
            <a className="login-link" href="#footer">Log in</a>
            <a className="register-link" href="#partner">Register</a>
            <a className="button button-small button-dark" href="#partner">List your item <ArrowRight size={15} /></a>
          </div>
          <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-glow" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow"><span className="eyebrow-dot" /> The smarter way to rent</p>
              <h1>Rent anything.<br /><span>Anywhere in Sri Lanka.</span></h1>
              <p className="hero-description">From weekend escapes to everyday essentials, find quality items from trusted people near you.</p>
              <div className="hero-proof">
                <div className="avatar-stack" aria-label="RentLanka community"><span>SP</span><span>ND</span><span>KA</span><span>+</span></div>
                <div><strong>12,000+ happy renters</strong><span>Join the growing RentLanka community</span></div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-image-wrap"><img src={heroImage} alt="A couple beside a rental car on the Sri Lankan coast" /></div>
              <div className="hero-float-card rating-card"><div className="rating-icon"><Star size={16} fill="currentColor" /></div><div><strong>4.9/5</strong><span>Average rating</span></div></div>
              <div className="hero-float-card trust-card"><ShieldCheck size={20} /><div><strong>Verified hosts</strong><span>Rent with confidence</span></div></div>
            </div>
          </div>
          <div className="container search-container">
            <form className="search-panel" onSubmit={handleSearch}>
              <div className="search-field"><MapPin size={20} /><label htmlFor="location">Location</label><select id="location" value={location} onChange={(event) => setLocation(event.target.value)}><option>Anywhere in Sri Lanka</option><option>Colombo</option><option>Kandy</option><option>Galle</option><option>Negombo</option></select><ChevronDown size={16} /></div>
              <div className="search-divider" />
              <div className="search-field"><span className="search-field-icon"><Search size={19} /></span><label htmlFor="category">What are you looking for?</label><select id="category" value={activeCategory} onChange={(event) => setActiveCategory(event.target.value)}><option>All categories</option>{categories.map((category) => <option key={category.label}>{category.label}</option>)}</select><ChevronDown size={16} /></div>
              <div className="search-divider" />
              <div className="search-field"><CalendarDays size={19} /><label htmlFor="date">When?</label><select id="date" value={date} onChange={(event) => setDate(event.target.value)}><option>Any dates</option><option>This weekend</option><option>Next week</option><option>Custom dates</option></select><ChevronDown size={16} /></div>
              <button className="button search-button" type="submit"><Search size={19} /> Search</button>
            </form>
            {searchMessage && <p className="search-message" role="status">{searchMessage}</p>}
          </div>
        </section>

        <section className="section categories-section" id="categories">
          <div className="container">
            <div className="section-heading"><div><p className="eyebrow">Find your fit</p><h2>Browse by category</h2></div><a className="text-link" href="#featured">View all categories <ArrowRight size={16} /></a></div>
            <div className="category-grid">{categories.map((category) => <button className="category-card" key={category.label} type="button" onClick={() => { setActiveCategory(category.label); document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' }); }}><span className="category-icon"><CategoryIcon icon={category.icon} /></span><span className="category-label">{category.label}</span><span className="category-count">{category.count}</span></button>)}</div>
          </div>
        </section>

        <section className="section featured-section" id="featured">
          <div className="container"><div className="section-heading"><div><p className="eyebrow">Curated for you</p><h2>Featured rentals</h2></div><a className="text-link" href="#featured">Explore all rentals <ArrowRight size={16} /></a></div>
            <div className="rental-grid">{visibleRentals.length ? visibleRentals.map((rental) => <article className="rental-card" key={rental.title}><div className={`rental-image ${rental.image}`} style={{ backgroundImage: `url(${rentalCollage})` }} role="img" aria-label={rental.title}><span className="availability">Available now</span><button className={saved.includes(rental.title) ? 'save-button saved' : 'save-button'} type="button" aria-label={saved.includes(rental.title) ? `Remove ${rental.title} from saved rentals` : `Save ${rental.title}`} onClick={() => toggleSaved(rental.title)}><Heart size={18} fill={saved.includes(rental.title) ? 'currentColor' : 'none'} /></button></div><div className="rental-info"><div className="rental-title-row"><div><p className="rental-category">{rental.category}</p><h3>{rental.title}</h3></div><span className="rental-rating"><Star size={14} fill="currentColor" /> {rental.rating}</span></div><p className="rental-location"><MapPin size={14} /> {rental.location}</p><div className="rental-footer"><p><strong>LKR {rental.price}</strong> <span>/ day</span></p><span className="review-count">({rental.reviews} reviews)</span><button type="button" className="details-link" onClick={() => setSearchMessage(`${rental.title} is available to view in ${rental.location}.`)}>View details <ChevronRight size={14} /></button></div></div></article>) : <p className="empty-state">No featured rentals match this category yet. Try All categories.</p>}</div>
          </div>
        </section>

        <section className="section locations-section"><div className="container"><div className="section-heading"><div><p className="eyebrow">Explore nearby</p><h2>Popular locations</h2></div><a className="text-link" href="#featured">Explore locations <ArrowRight size={16} /></a></div><div className="location-grid">{locations.map((locationItem) => <a className={`location-card ${locationItem.image}`} style={{ backgroundImage: `linear-gradient(180deg, rgba(20, 36, 58, .05), rgba(20, 36, 58, .85)), url(${heroImage})` }} href="#featured" key={locationItem.name}><div className="location-overlay" /><div className="location-copy"><h3>{locationItem.name}</h3><p>{locationItem.detail}</p></div><ArrowRight className="location-arrow" size={18} /></a>)}</div></div></section>

        <section className="section process-section" id="how-it-works"><div className="container"><div className="process-heading"><p className="eyebrow">Simple by design</p><h2>Renting made easy</h2><p>Everything you need to make renting simple, safe, and genuinely enjoyable.</p></div><div className="process-grid"><div className="process-step"><span className="step-number">01</span><span className="process-icon"><Search size={24} /></span><h3>Find what you need</h3><p>Search thousands of quality items from trusted hosts in your neighbourhood.</p></div><div className="process-step"><span className="step-number">02</span><span className="process-icon"><CalendarDays size={24} /></span><h3>Book with confidence</h3><p>Choose your dates, connect with the owner, and reserve in just a few clicks.</p></div><div className="process-step"><span className="step-number">03</span><span className="process-icon"><Check size={24} /></span><h3>Enjoy the experience</h3><p>Pick up your item, make memories, and return it when you are done.</p></div></div></div></section>

        <section className="partner-section" id="partner"><div className="container partner-inner"><div><p className="eyebrow">Turn unused into useful</p><h2>Have something to share?</h2><p>Turn the things you love into an extra income stream. List your item and meet your next great renter.</p><a className="button button-light" href="#footer">Start earning with RentLanka <ArrowRight size={17} /></a></div><div className="partner-stats"><div><strong>3,500+</strong><span>local hosts</span></div><div><strong>4.9/5</strong><span>host rating</span></div><div><strong>24/7</strong><span>support</span></div></div></div></section>

        <section className="section testimonials-section"><div className="container"><div className="section-heading"><div><p className="eyebrow">Loved locally</p><h2>What our community says</h2></div><div className="testimonial-nav"><button type="button" aria-label="Previous testimonial"><ArrowRight size={17} className="flip-arrow" /></button><button type="button" aria-label="Next testimonial"><ArrowRight size={17} /></button></div></div><div className="testimonial-grid"><blockquote><div className="quote-stars">★★★★★</div><p>“RentLanka made our south coast road trip effortless. The car was spotless, the host was lovely, and the whole experience felt so personal.”</p><footer><span className="testimonial-avatar teal">AM</span><span><strong>Amaya Mendis</strong><small>Colombo · Rented a car</small></span></footer></blockquote><blockquote><div className="quote-stars">★★★★★</div><p>“I listed my camera gear on a whim and it has become a wonderful little side income. The RentLanka team makes everything feel secure.”</p><footer><span className="testimonial-avatar gold">DK</span><span><strong>Dilan Karunaratne</strong><small>Kandy · Listed camera gear</small></span></footer></blockquote><blockquote><div className="quote-stars">★★★★★</div><p>“Found the exact tools I needed for my home project in less than five minutes. It is so much better than buying something I will rarely use.”</p><footer><span className="testimonial-avatar navy">SP</span><span><strong>Sahan Perera</strong><small>Galle · Rented tools</small></span></footer></blockquote></div></div></section>
      </main>

      <footer className="site-footer" id="footer"><div className="container footer-top"><div className="footer-brand"><Logo /><p>Rent better. Live more.<br />The trusted rental marketplace for Sri Lanka.</p><div className="social-links"><a href="#footer" aria-label="Community"><MessageCircle size={17} /></a><a href="#footer" aria-label="Website"><Globe2 size={17} /></a><a href="#footer" aria-label="Updates"><MessageCircle size={17} /></a></div></div><div className="footer-column"><h3>Discover</h3><a href="#featured">Explore rentals</a><a href="#categories">Categories</a><a href="#locations">Popular locations</a><a href="#how-it-works">How it works</a></div><div className="footer-column"><h3>For hosts</h3><a href="#partner">List your item</a><a href="#partner">Host resources</a><a href="#partner">Partner with us</a><a href="#footer">Safety for hosts</a></div><div className="footer-column"><h3>Company</h3><a href="#footer">About RentLanka</a><a href="#footer">Trust & safety</a><a href="#footer">Help centre</a><a href="#footer">Contact us</a></div><div className="footer-column newsletter"><h3>Stay in the loop</h3><p>Get the best rentals and local stories in your inbox.</p><form onSubmit={(event) => { event.preventDefault(); setSearchMessage('Thanks for subscribing to RentLanka updates.'); }}><input type="email" aria-label="Email address" placeholder="Your email address" required /><button type="submit" aria-label="Subscribe"><ArrowRight size={17} /></button></form></div></div><div className="container footer-bottom"><span>© 2024 RentLanka. Made for Sri Lanka.</span><div><a href="#footer">Privacy</a><a href="#footer">Terms</a><a href="#footer">Sitemap</a></div><span className="footer-country"><MapPin size={14} /> Sri Lanka</span></div></footer>
    </div>
  );
}

export default App;
