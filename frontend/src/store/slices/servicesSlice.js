import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchCategories = createAsyncThunk('services/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/services/categories');
    return response.data.categories;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
  }
});

export const fetchServices = createAsyncThunk('services/fetchServices', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await api.get('/services', { params });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch services');
  }
});

export const fetchServiceById = createAsyncThunk('services/fetchServiceById', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/services/${id}`);
    return response.data.service;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch service details');
  }
});

export const fetchMyServices = createAsyncThunk('services/fetchMyServices', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/services/provider/my');
    return response.data.services;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch provider services');
  }
});

export const createServiceThunk = createAsyncThunk('services/createService', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post('/services', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.service;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create service');
  }
});

export const updateServiceThunk = createAsyncThunk('services/updateService', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/services/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.service;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update service');
  }
});

export const deleteServiceThunk = createAsyncThunk('services/deleteService', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/services/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete service');
  }
});

const initialState = {
  services: [],
  categories: [],
  currentService: null,
  providerServices: [],
  loading: false,
  error: null,
  pagination: { total: 0, page: 1, limit: 12, pages: 0 }
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    clearServiceDetails: (state) => {
      state.currentService = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // Services
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload.services;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Service details
      .addCase(fetchServiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentService = action.payload;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // My services (provider)
      .addCase(fetchMyServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyServices.fulfilled, (state, action) => {
        state.loading = false;
        state.providerServices = action.payload;
      })
      .addCase(fetchMyServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create service
      .addCase(createServiceThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createServiceThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.providerServices.unshift(action.payload);
      })
      .addCase(createServiceThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update service
      .addCase(updateServiceThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateServiceThunk.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.providerServices.findIndex(s => s._id === action.payload._id);
        if (index !== -1) {
          state.providerServices[index] = action.payload;
        }
      })
      .addCase(updateServiceThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete service
      .addCase(deleteServiceThunk.fulfilled, (state, action) => {
        state.providerServices = state.providerServices.filter(s => s._id !== action.payload);
      });
  }
});

export const { clearServiceDetails } = servicesSlice.actions;
export default servicesSlice.reducer;
