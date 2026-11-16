import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Booking, BookingState, BookingFilterState } from "../../types";
import { bookingsApi } from "../../services/api";

const initialFilters: BookingFilterState = {
  search: "",
  category: "all",
  location: "all",
  startDate: "",
  endDate: "",
  sortBy: "newest",
  availableOnly: false,
  minPrice: 0,
  maxPrice: 150000,
};

const initialState: BookingState = {
  bookings: [],
  activeBooking: null,
  loading: false,
  error: null,
  filters: initialFilters,
};

export const fetchBookings = createAsyncThunk(
  "booking/fetchBookings",
  async (status: string | undefined, { rejectWithValue }) => {
    try {
      return await bookingsApi.getAll(status);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load bookings");
    }
  }
);

export const createNewBooking = createAsyncThunk(
  "booking/createNewBooking",
  async (bookingData: Partial<Booking>, { rejectWithValue }) => {
    try {
      return await bookingsApi.create(bookingData);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to submit booking");
    }
  }
);

export const updateBookingStatusAction = createAsyncThunk(
  "booking/updateStatus",
  async (
    {
      id,
      status,
      itemId,
    }: {
      id: string;
      status: "Pending" | "Confirmed" | "Rejected";
      itemId?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      return await bookingsApi.updateStatus(id, status, itemId);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update booking status");
    }
  }
);

export const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<BookingFilterState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialFilters;
    },
    setActiveBooking: (state, action: PayloadAction<Booking | null>) => {
      state.activeBooking = action.payload;
    },
    clearBookingError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch bookings
    builder.addCase(fetchBookings.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchBookings.fulfilled, (state, action) => {
      state.loading = false;
      state.bookings = action.payload;
    });
    builder.addCase(fetchBookings.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create booking
    builder.addCase(createNewBooking.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createNewBooking.fulfilled, (state, action) => {
      state.loading = false;
      state.bookings.unshift(action.payload);
      state.activeBooking = action.payload;
    });
    builder.addCase(createNewBooking.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update status
    builder.addCase(updateBookingStatusAction.fulfilled, (state, action) => {
      const idx = state.bookings.findIndex((b) => b._id === action.payload._id);
      if (idx !== -1) {
        state.bookings[idx] = action.payload;
      }
      if (state.activeBooking && state.activeBooking._id === action.payload._id) {
        state.activeBooking = action.payload;
      }
    });
  },
});

export const { setFilters, resetFilters, setActiveBooking, clearBookingError } =
  bookingSlice.actions;
export default bookingSlice.reducer;

