import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from '../src/utils/axiosClient.js';

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/register', userData);
      
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log('✅ Token stored after registration');
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/login', credentials);
      
      console.log('📦 Login Response:', response.data);
      
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log('✅ Token stored after login:', response.data.token.substring(0, 20) + '...');
      } else {
        console.error('❌ No token in response!');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Login error:', error.response?.data);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      // Check if token exists first
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('⚠️ No token found in localStorage');
        return rejectWithValue({ message: 'No token found' });
      }

      const { data } = await axiosClient.get('/user/check');
      console.log('✅ Auth check successful');
      return data;
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('⚠️ Auth check failed - 401 Unauthorized');
        localStorage.removeItem('token');
        return rejectWithValue({ message: 'Not authenticated' });
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post('/user/logout');
      
      // Remove token from localStorage
      localStorage.removeItem('token');
      console.log('✅ Token removed after logout');
      
      return null;
    } catch (error) {
      // Even if logout fails, remove token locally
      localStorage.removeItem('token');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    checkingAuth: false // New state for initial auth check
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register User Cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Registration failed';
        state.isAuthenticated = false;
        state.user = null;
      })
  
      // Login User Cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
        state.isAuthenticated = false;
        state.user = null;
      })
  
      // Check Auth Cases
      .addCase(checkAuth.pending, (state) => {
        state.checkingAuth = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.checkingAuth = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.checkingAuth = false;
        state.isAuthenticated = false;
        state.user = null;
        // Don't set error for auth check failures (expected when not logged in)
        state.error = null;
      })
  
      // Logout User Cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        // Still clear user data even if logout request fails
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload?.message || 'Logout failed';
      });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;