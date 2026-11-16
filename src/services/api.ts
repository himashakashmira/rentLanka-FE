import { Item, Booking, Category, User } from "../types";

export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1";

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("rentlanka_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// ============ AUTH API ============
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to log in");
    return data;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
    nic?: string;
  }) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to register");
    return data;
  },

  getMe: async (): Promise<User> => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Unauthorized");
    return data.user;
  },
};

// ============ ITEMS API ============
export const itemsApi = {
  getAll: async (params?: {
    category?: string;
    search?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    available?: boolean;
    sortBy?: string;
  }): Promise<Item[]> => {
    const query = new URLSearchParams();
    if (params?.category && params.category !== "all" && params.category !== "All") {
      query.append("category", params.category);
    }
    if (params?.search) query.append("search", params.search);
    if (params?.location && params.location !== "all" && params.location !== "All") {
      query.append("location", params.location);
    }
    if (params?.minPrice) query.append("minPrice", String(params.minPrice));
    if (params?.maxPrice) query.append("maxPrice", String(params.maxPrice));
    if (params?.available !== undefined) query.append("available", String(params.available));
    if (params?.sortBy) query.append("sortBy", params.sortBy);

    const url = `${API_BASE_URL}/items${query.toString() ? `?${query.toString()}` : ""}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load listings");
    return data.data;
  },

  getById: async (id: string): Promise<Item> => {
    const res = await fetch(`${API_BASE_URL}/items/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Item not found");
    return data.data;
  },

  create: async (itemData: Partial<Item>): Promise<Item> => {
    const res = await fetch(`${API_BASE_URL}/items`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to list item");
    return data.data;
  },

  update: async (id: string, itemData: Partial<Item>): Promise<Item> => {
    const res = await fetch(`${API_BASE_URL}/items/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update item");
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/items/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete item");
  },
};

// ============ BOOKINGS API ============
export const bookingsApi = {
  getAll: async (status?: string): Promise<Booking[]> => {
    const url = status && status !== "All"
      ? `${API_BASE_URL}/bookings?status=${status}`
      : `${API_BASE_URL}/bookings`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load bookings");
    return data.data;
  },

  getById: async (id: string): Promise<Booking> => {
    const res = await fetch(`${API_BASE_URL}/bookings/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Booking voucher not found");
    return data.data;
  },

  create: async (bookingData: Partial<Booking>): Promise<Booking> => {
    const res = await fetch(`${API_BASE_URL}/bookings`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(bookingData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to process booking");
    return data.data;
  },

  updateStatus: async (
    id: string,
    status: "Pending" | "Confirmed" | "Rejected",
    itemId?: string
  ): Promise<Booking> => {
    const res = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, item_id: itemId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update status");
    return data.data;
  },
};

// ============ CATEGORIES API ============
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const res = await fetch(`${API_BASE_URL}/categories`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load categories");
    return data.data;
  },
};

// ============ AI API ============
export const aiApi = {
  generateDescription: async (payload: {
    title: string;
    category: string;
    location?: string;
    specs?: any;
  }): Promise<{ description: string; source?: string }> => {
    const res = await fetch(`${API_BASE_URL}/ai/generate-description`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "AI generation failed");
    return { description: data.description, source: data.source };
  },
};

