import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchComplaints = createAsyncThunk('complaints/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/complaints');
    return response.data.complaints;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch complaints');
  }
});

export const createComplaintThunk = createAsyncThunk('complaints/create', async (complaintData, { rejectWithValue }) => {
  try {
    const response = await api.post('/complaints', complaintData);
    return response.data.complaint;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to file complaint');
  }
});

export const resolveComplaintThunk = createAsyncThunk('complaints/resolve', async (id, { rejectWithValue }) => {
  try {
    const response = await api.put(`/complaints/${id}/resolve`);
    return response.data.complaint;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to resolve complaint');
  }
});

const complaintsSlice = createSlice({
  name: 'complaints',
  initialState: {
    complaints: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaints.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.complaints = action.payload;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createComplaintThunk.fulfilled, (state, action) => {
        state.complaints.unshift(action.payload);
      })
      .addCase(resolveComplaintThunk.fulfilled, (state, action) => {
        const index = state.complaints.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.complaints[index].status = 'resolved';
        }
      });
  }
});

export default complaintsSlice.reducer;
