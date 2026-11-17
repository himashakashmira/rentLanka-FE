export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: "customer" | "host" | "admin";
  phone?: string;
  nic?: string;
  avatar?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface Item {
  _id: string;
  id?: string;
  title: string;
  category: string;
  description: string;
  price_per_day: number;
  security_deposit: number;
  location: string;
  image_url: string;
  images?: string[];
  contact_number: string;
  is_available: boolean;
  rating?: number;
  reviews_count?: number;
  owner_name?: string;
  owner_id?: string;
  specs?: Record<string, string>;
  inclusions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id?: string;
  name: string;
  icon: string;
  count: string;
  description: string;
  image_url?: string;
}

export interface Booking {
  _id: string;
  item_id: string | Item;
  item_title: string;
  item_image?: string;
  item_location?: string;
  renter_name: string;
  renter_email?: string;
  renter_phone: string;
  renter_nic: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  daily_rate: number;
  total_price: number;
  security_deposit: number;
  platform_fee: number;
  payment_method: string;
  booking_reference: string;
  status: "Pending" | "Confirmed" | "Rejected";
  createdAt: string;
  updatedAt?: string;
}

export interface BookingFilterState {
  search: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  sortBy: string;
  availableOnly: boolean;
  minPrice: number;
  maxPrice: number;
}

export interface BookingState {
  bookings: Booking[];
  activeBooking: Booking | null;
  loading: boolean;
  error: string | null;
  filters: BookingFilterState;
}

