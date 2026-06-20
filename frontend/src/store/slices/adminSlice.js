import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchDashboardStats = createAsyncThunk('admin/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
  }
});

export const fetchAllUsers = createAsyncThunk('admin/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/users');
    return response.data.users;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
  }
});

export const toggleUserStatus = createAsyncThunk('admin/toggleUserStatus', async (id, { rejectWithValue }) => {
  try {
    const response = await api.put(`/admin/users/${id}/toggle-status`);
    return response.data.user;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to toggle user status');
  }
});

export const fetchProviderApplications = createAsyncThunk('admin/fetchApplications', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/providers/pending');
    return response.data.providers;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch applications');
  }
});

export const approveApplication = createAsyncThunk('admin/approveApp', async (id, { rejectWithValue }) => {
  try {
    const response = await api.put(`/admin/providers/${id}/approve`);
    return { id, application: response.data.provider };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to approve');
  }
});

export const rejectApplication = createAsyncThunk('admin/rejectApp', async (id, { rejectWithValue }) => {
  try {
    const response = await api.put(`/admin/providers/${id}/reject`);
    return { id, application: response.data.provider };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to reject');
  }
});

export const fetchActivityLogs = createAsyncThunk('admin/fetchLogs', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/logs');
    return response.data.logs;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch logs');
  }
});

export const broadcastNotification = createAsyncThunk('admin/broadcast', async ({ title, message }, { rejectWithValue }) => {
  try {
    const response = await api.post('/admin/broadcast', { title, message });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to broadcast');
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: null,
    analytics: null,
    users: [],
    applications: [],
    logs: [],
    loading: false,
    error: null,
    successMsg: null
  },
  reducers: {
    clearAdminMessages: (state) => {
      state.error = null;
      state.successMsg = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.analytics = action.payload.analytics;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle user
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.successMsg = `User ${action.payload.isActive ? 'activated' : 'suspended'} successfully`;
      })
      // Applications
      .addCase(fetchProviderApplications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProviderApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
      })
      .addCase(fetchProviderApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Approve
      .addCase(approveApplication.fulfilled, (state, action) => {
        const index = state.applications.findIndex(a => a._id === action.payload.id);
        if (index !== -1) {
          state.applications[index].status = 'approved';
        }
        state.successMsg = 'Application approved!';
      })
      // Reject
      .addCase(rejectApplication.fulfilled, (state, action) => {
        const index = state.applications.findIndex(a => a._id === action.payload.id);
        if (index !== -1) {
          state.applications[index].status = 'rejected';
        }
        state.successMsg = 'Application rejected.';
      })
      // Logs
      .addCase(fetchActivityLogs.fulfilled, (state, action) => {
        state.logs = action.payload;
      })
      // Broadcast
      .addCase(broadcastNotification.pending, (state) => {
        state.loading = true;
      })
      .addCase(broadcastNotification.fulfilled, (state) => {
        state.loading = false;
        state.successMsg = 'Notification broadcasted to all users!';
      })
      .addCase(broadcastNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearAdminMessages } = adminSlice.actions;
export default adminSlice.reducer;
