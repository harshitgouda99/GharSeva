import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchCustomerBookings = createAsyncThunk('bookings/fetchCustomer', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/bookings/customer');
    return response.data.bookings;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
  }
});

export const fetchProviderBookings = createAsyncThunk('bookings/fetchProvider', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/bookings/provider');
    return response.data.bookings;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
  }
});

export const createBookingThunk = createAsyncThunk('bookings/create', async (bookingData, { rejectWithValue }) => {
  try {
    const response = await api.post('/bookings', bookingData);
    return response.data.booking;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Booking failed');
  }
});

export const acceptBookingThunk = createAsyncThunk('bookings/accept', async (id, { rejectWithValue }) => {
  try {
    const response = await api.put(`/bookings/${id}/accept`);
    return response.data.booking;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Accept failed');
  }
});

export const rejectBookingThunk = createAsyncThunk('bookings/reject', async (id, { rejectWithValue }) => {
  try {
    const response = await api.put(`/bookings/${id}/reject`);
    return response.data.booking;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Reject failed');
  }
});

export const completeBookingThunk = createAsyncThunk('bookings/complete', async (id, { rejectWithValue }) => {
  try {
    const response = await api.put(`/bookings/${id}/complete`);
    return response.data.booking;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Completion failed');
  }
});

export const cancelBookingThunk = createAsyncThunk('bookings/cancel', async (id, { rejectWithValue }) => {
  try {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data.booking;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Cancellation failed');
  }
});

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: {
    bookings: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Customer
      .addCase(fetchCustomerBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchCustomerBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Provider
      .addCase(fetchProviderBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProviderBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchProviderBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createBookingThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBookingThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.unshift(action.payload);
      })
      .addCase(createBookingThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Accept
      .addCase(acceptBookingThunk.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.bookings[index].bookingStatus = 'accepted';
        }
      })
      // Reject
      .addCase(rejectBookingThunk.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.bookings[index].bookingStatus = 'rejected';
        }
      })
      // Complete
      .addCase(completeBookingThunk.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.bookings[index].bookingStatus = 'completed';
        }
      })
      // Cancel
      .addCase(cancelBookingThunk.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.bookings[index].bookingStatus = 'rejected';
        }
      });
  }
});

export default bookingsSlice.reducer;
