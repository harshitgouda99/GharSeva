import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    }
    return rejectWithValue(response.data.message);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register', userData);
    if (response.data.success) {
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    }
    return rejectWithValue(response.data.message);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
});

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/auth/profile');
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data.user;
    }
    return rejectWithValue(response.data.message);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
  }
});

export const updateProfileUser = createAsyncThunk('auth/updateProfile', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.put('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data.user;
    }
    return rejectWithValue(response.data.message);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Profile update failed');
  }
});

export const changePasswordUser = createAsyncThunk('auth/changePassword', async (passwords, { rejectWithValue }) => {
  try {
    const response = await api.put('/auth/change-password', passwords);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to change password');
  }
});

export const applyAsProvider = createAsyncThunk('auth/applyProvider', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post('/providers/apply', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Provider application failed');
  }
});

export const getMyApplicationStatus = createAsyncThunk('auth/getMyApplicationStatus', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/providers/application');
    return response.data.application;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to get application status');
  }
});

const initialState = {
  token: localStorage.getItem('token') || null,
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  providerApp: null,
  loading: false,
  error: null,
  successMsg: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.token = null;
      state.user = null;
      state.providerApp = null;
      state.error = null;
      state.successMsg = null;
    },
    clearAuthError: (state) => {
      state.error = null;
      state.successMsg = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Profile
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      // Update Profile
      .addCase(updateProfileUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.successMsg = 'Profile updated successfully!';
      })
      .addCase(updateProfileUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Change Password
      .addCase(changePasswordUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePasswordUser.fulfilled, (state) => {
        state.loading = false;
        state.successMsg = 'Password changed successfully!';
      })
      .addCase(changePasswordUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Apply Provider
      .addCase(applyAsProvider.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyAsProvider.fulfilled, (state, action) => {
        state.loading = false;
        state.providerApp = action.payload.application;
        state.successMsg = 'Application submitted successfully!';
      })
      .addCase(applyAsProvider.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Application Status
      .addCase(getMyApplicationStatus.fulfilled, (state, action) => {
        state.providerApp = action.payload;
      });
  }
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
