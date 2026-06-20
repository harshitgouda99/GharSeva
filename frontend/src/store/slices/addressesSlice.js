import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchAddresses = createAsyncThunk('addresses/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/addresses');
    return response.data.addresses;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch addresses');
  }
});

export const createAddressThunk = createAsyncThunk('addresses/create', async (addressData, { rejectWithValue }) => {
  try {
    const response = await api.post('/addresses', addressData);
    return response.data.address;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to add address');
  }
});

export const updateAddressThunk = createAsyncThunk('addresses/update', async ({ id, addressData }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/addresses/${id}`, addressData);
    return response.data.address;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update address');
  }
});

export const deleteAddressThunk = createAsyncThunk('addresses/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/addresses/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete address');
  }
});

const addressesSlice = createSlice({
  name: 'addresses',
  initialState: {
    addresses: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAddressThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAddressThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.isDefault) {
          state.addresses.forEach(a => { a.isDefault = false; });
        }
        state.addresses.push(action.payload);
      })
      .addCase(createAddressThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAddressThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAddressThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.isDefault) {
          state.addresses.forEach(a => { a.isDefault = false; });
        }
        const index = state.addresses.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.addresses[index] = action.payload;
        }
      })
      .addCase(updateAddressThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteAddressThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAddressThunk.fulfilled, (state, action) => {
        state.loading = false;
        const deletedIndex = state.addresses.findIndex(a => a._id === action.payload);
        if (deletedIndex !== -1) {
          const wasDefault = state.addresses[deletedIndex].isDefault;
          state.addresses = state.addresses.filter(a => a._id !== action.payload);
          if (wasDefault && state.addresses.length > 0) {
            state.addresses[0].isDefault = true;
          }
        }
      })
      .addCase(deleteAddressThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default addressesSlice.reducer;
