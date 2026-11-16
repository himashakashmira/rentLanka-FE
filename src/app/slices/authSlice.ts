import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, User } from "../../types";
import { authApi } from "../../services/api";

const storedToken = localStorage.getItem("rentlanka_token");
const storedUser = localStorage.getItem("rentlanka_user");

let initialUser: User | null = null;
if (storedUser) {
  try {
    initialUser = JSON.parse(storedUser);
  } catch (e) {
    initialUser = null;
  }
}

const initialState: AuthState = {
  user: initialUser,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
  loading: false,
  error: null,
};

// Async thunk for logging in
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await authApi.login(email, password);
      localStorage.setItem("rentlanka_token", data.token);
      localStorage.setItem("rentlanka_user", JSON.stringify(data.user));
      return { user: data.user, token: data.token };
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to log in");
    }
  }
);

// Async thunk for registering
export const register = createAsyncThunk(
  "auth/register",
  async (
    userData: { name: string; email: string; password: string; role?: string; phone?: string; nic?: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await authApi.register(userData);
      localStorage.setItem("rentlanka_token", data.token);
      localStorage.setItem("rentlanka_user", JSON.stringify(data.user));
      return { user: data.user, token: data.token };
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to register");
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("rentlanka_token");
      localStorage.removeItem("rentlanka_user");
    },
    clearError: (state) => {
      state.error = null;
    },
    setMockUser: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem("rentlanka_token", action.payload.token);
      localStorage.setItem("rentlanka_user", JSON.stringify(action.payload.user));
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "Invalid credentials";
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "Registration failed";
    });
  },
});

export const { logout, clearError, setMockUser } = authSlice.actions;
export default authSlice.reducer;

