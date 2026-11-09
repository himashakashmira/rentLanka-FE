import { Heart, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function RentalCard({ item }) {
  const [saved, setSaved] = useState(false);
  return <article className="market-card"><div className={`market-card-image ${item.image}`}><span className={item.available ? 'market-badge' : 'market-badge unavailable'}>{item.available ? 'Available now' : 'Currently booked'}</span><button className={saved ? 'market-save saved' : 'market-save'} type="button" onClick={() => setSaved(!saved)} aria-label={saved ? `Remove ${item.title} from saved` : `Save ${item.title}`}><Heart size={18} fill={saved ? 'currentColor' : 'none'} /></button></div><div className="market-card-body"><div className="market-card-meta"><span>{item.category}</span><span className="market-rating"><Star size={13} fill="currentColor" /> {item.rating} <small>({item.reviews})</small></span></div><h3>{item.title}</h3><p className="market-location"><MapPin size={14} /> {item.location}</p><div className="market-card-footer"><span><strong>LKR {item.price.toLocaleString()}</strong> / day</span><Link to={`/rentals/${item.id}`}>View details</Link></div></div></article>;
}
