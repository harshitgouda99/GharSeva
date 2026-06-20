import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchServiceReviews = createAsyncThunk('reviews/fetchByService', async (serviceId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/reviews/service/${serviceId}`);
    return response.data.reviews;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
  }
});

export const fetchProviderReviews = createAsyncThunk('reviews/fetchByProvider', async (providerId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/reviews/provider/${providerId}`);
    return response.data.reviews;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch provider reviews');
  }
});

export const addReviewThunk = createAsyncThunk('reviews/add', async (reviewData, { rejectWithValue }) => {
  try {
    const response = await api.post('/reviews', reviewData);
    return response.data.review;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to add review');
  }
});

export const editReviewThunk = createAsyncThunk('reviews/edit', async ({ id, rating, reviewText }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/reviews/${id}`, { rating, reviewText });
    return response.data.review;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update review');
  }
});

export const deleteReviewThunk = createAsyncThunk('reviews/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/reviews/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
  }
});

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState: {
    reviews: [],
    loading: false,
    error: null,
    successMsg: null
  },
  reducers: {
    clearReviewMessages: (state) => {
      state.error = null;
      state.successMsg = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServiceReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchServiceReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProviderReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProviderReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchProviderReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addReviewThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addReviewThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.unshift(action.payload);
        state.successMsg = 'Review submitted successfully!';
      })
      .addCase(addReviewThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(editReviewThunk.fulfilled, (state, action) => {
        const index = state.reviews.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
        state.successMsg = 'Review updated!';
      })
      .addCase(deleteReviewThunk.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter(r => r._id !== action.payload);
        state.successMsg = 'Review deleted!';
      });
  }
});

export const { clearReviewMessages } = reviewsSlice.actions;
export default reviewsSlice.reducer;
