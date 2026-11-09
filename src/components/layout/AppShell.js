import { Link, NavLink, Outlet } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function AppShell({ children }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return <div className="app-shell">
    <header className="app-header"><div className="app-container app-nav">
      <Link className="brand" to="/"><span className="brand-mark">R</span><span>Rent<span className="brand-accent">Lanka</span></span></Link>
      <nav className={open ? 'app-nav-links is-open' : 'app-nav-links'} aria-label="Primary navigation">
        <NavLink to="/explore" onClick={close}>Explore Rentals</NavLink><NavLink to="/categories" onClick={close}>Categories</NavLink><NavLink to="/how-it-works" onClick={close}>How It Works</NavLink>
      </nav>
      <div className="app-nav-actions"><Link to="/login" className="app-login">Log in</Link><Link to="/register" className="app-register">Register</Link><Link to="/list-your-item" className="app-list-button">List your item <ArrowRight size={15} /></Link></div>
      <button className="app-menu-toggle" type="button" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'}>{open ? <X /> : <Menu />}</button>
    </div></header>
    <main><Outlet /></main>
    <footer className="app-footer"><div className="app-container app-footer-grid"><div><Link className="brand footer-brand" to="/"><span className="brand-mark">R</span><span>Rent<span className="brand-accent">Lanka</span></span></Link><p>Rent better. Live more.<br />The trusted rental marketplace for Sri Lanka.</p></div><div><h3>Discover</h3><Link to="/explore">Explore rentals</Link><Link to="/categories">Categories</Link><Link to="/how-it-works">How it works</Link></div><div><h3>For hosts</h3><Link to="/list-your-item">List your item</Link><Link to="/my-listings">My listings</Link><Link to="/admin">Admin dashboard</Link></div><div><h3>Your account</h3><Link to="/my-bookings">My bookings</Link><Link to="/login">Log in</Link><Link to="/register">Create account</Link></div></div><div className="app-container app-footer-bottom"><span>© 2024 RentLanka. Made for Sri Lanka.</span><span>Privacy · Terms · Help centre</span></div></footer>
  </div>;
}
