import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

// Define types
export interface Promotion {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  isActive: boolean;
  productIds: string[];
  image?: string;
  termsAndConditions?: string;
  createdAt: string;
  updatedAt: string;
}

interface PromotionsState {
  promotions: Promotion[];
  currentPromotion: Promotion | null;
  loading: boolean;
  error: string | null;
}

const initialState: PromotionsState = {
  promotions: [],
  currentPromotion: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchPromotions = createAsyncThunk(
  'promotions/fetchPromotions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/promotions');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch promotions');
    }
  }
);

export const fetchPromotionById = createAsyncThunk(
  'promotions/fetchPromotionById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/promotions/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch promotion');
    }
  }
);

export const createPromotion = createAsyncThunk(
  'promotions/createPromotion',
  async (promotionData: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/promotions', promotionData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create promotion');
    }
  }
);

export const updatePromotion = createAsyncThunk(
  'promotions/updatePromotion',
  async ({ id, promotionData }: { id: string; promotionData: Partial<Promotion> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/promotions/${id}`, promotionData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update promotion');
    }
  }
);

export const deletePromotion = createAsyncThunk(
  'promotions/deletePromotion',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/promotions/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete promotion');
    }
  }
);

// Create slice
const promotionsSlice = createSlice({
  name: 'promotions',
  initialState,
  reducers: {
    clearCurrentPromotion(state) {
      state.currentPromotion = null;
    },
    clearErrors(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch promotions
      .addCase(fetchPromotions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromotions.fulfilled, (state, action: PayloadAction<Promotion[]>) => {
        state.loading = false;
        state.promotions = action.payload;
      })
      .addCase(fetchPromotions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch promotion by ID
      .addCase(fetchPromotionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromotionById.fulfilled, (state, action: PayloadAction<Promotion>) => {
        state.loading = false;
        state.currentPromotion = action.payload;
      })
      .addCase(fetchPromotionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create promotion
      .addCase(createPromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPromotion.fulfilled, (state, action: PayloadAction<Promotion>) => {
        state.loading = false;
        state.promotions.push(action.payload);
        state.currentPromotion = action.payload;
      })
      .addCase(createPromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update promotion
      .addCase(updatePromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePromotion.fulfilled, (state, action: PayloadAction<Promotion>) => {
        state.loading = false;
        state.promotions = state.promotions.map(promo =>
          promo.id === action.payload.id ? action.payload : promo
        );
        state.currentPromotion = action.payload;
      })
      .addCase(updatePromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete promotion
      .addCase(deletePromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePromotion.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.promotions = state.promotions.filter(promo => promo.id !== action.payload);
        if (state.currentPromotion && state.currentPromotion.id === action.payload) {
          state.currentPromotion = null;
        }
      })
      .addCase(deletePromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentPromotion, clearErrors } = promotionsSlice.actions;

export default promotionsSlice.reducer;
