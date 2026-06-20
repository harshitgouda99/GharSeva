import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchFavorites = createAsyncThunk('favorites/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/favorites');
    return response.data.favorites;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch favorites');
  }
});

export const toggleFavoriteThunk = createAsyncThunk('favorites/toggle', async (serviceId, { rejectWithValue }) => {
  try {
    const response = await api.post('/favorites/toggle', { serviceId });
    return { serviceId, isFavorited: response.data.isFavorited };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to toggle favorite');
  }
});

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    favorites: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleFavoriteThunk.fulfilled, (state, action) => {
        if (!action.payload.isFavorited) {
          state.favorites = state.favorites.filter(f => f.serviceId?._id !== action.payload.serviceId);
        }
      });
  }
});

export default favoritesSlice.reducer;
