import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

// Define types
export interface SalesData {
  period: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  sales: number;
  revenue: number;
  quantity: number;
}

export interface CustomerInsight {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  topCustomers: {
    customerId: string;
    customerName: string;
    totalSpent: number;
    orderCount: number;
  }[];
}

export interface InventoryStatus {
  productId: string;
  productName: string;
  stockLevel: number;
  reorderPoint: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

interface AnalyticsState {
  salesData: SalesData[];
  productPerformance: ProductPerformance[];
  customerInsights: CustomerInsight | null;
  inventoryStatus: InventoryStatus[];
  loading: boolean;
  error: string | null;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

const initialState: AnalyticsState = {
  salesData: [],
  productPerformance: [],
  customerInsights: null,
  inventoryStatus: [],
  loading: false,
  error: null,
  dateRange: {
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  },
};

// Async thunks
export const fetchSalesData = createAsyncThunk(
  'analytics/fetchSalesData',
  async (params: { startDate: string; endDate: string; interval?: 'day' | 'week' | 'month' }, { rejectWithValue }) => {
    try {
      const { startDate, endDate, interval = 'day' } = params;
      const response = await api.get(`/analytics/sales?startDate=${startDate}&endDate=${endDate}&interval=${interval}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sales data');
    }
  }
);

export const fetchProductPerformance = createAsyncThunk(
  'analytics/fetchProductPerformance',
  async (params: { startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const { startDate, endDate } = params;
      const response = await api.get(`/analytics/products?startDate=${startDate}&endDate=${endDate}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product performance');
    }
  }
);

export const fetchCustomerInsights = createAsyncThunk(
  'analytics/fetchCustomerInsights',
  async (params: { startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const { startDate, endDate } = params;
      const response = await api.get(`/analytics/customers?startDate=${startDate}&endDate=${endDate}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer insights');
    }
  }
);

export const fetchInventoryStatus = createAsyncThunk(
  'analytics/fetchInventoryStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics/inventory');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory status');
    }
  }
);

// Create slice
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setDateRange(state, action: PayloadAction<{ startDate: string; endDate: string }>) {
      state.dateRange = action.payload;
    },
    clearErrors(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch sales data
      .addCase(fetchSalesData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesData.fulfilled, (state, action: PayloadAction<SalesData[]>) => {
        state.loading = false;
        state.salesData = action.payload;
      })
      .addCase(fetchSalesData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch product performance
      .addCase(fetchProductPerformance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductPerformance.fulfilled, (state, action: PayloadAction<ProductPerformance[]>) => {
        state.loading = false;
        state.productPerformance = action.payload;
      })
      .addCase(fetchProductPerformance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch customer insights
      .addCase(fetchCustomerInsights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerInsights.fulfilled, (state, action: PayloadAction<CustomerInsight>) => {
        state.loading = false;
        state.customerInsights = action.payload;
      })
      .addCase(fetchCustomerInsights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch inventory status
      .addCase(fetchInventoryStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryStatus.fulfilled, (state, action: PayloadAction<InventoryStatus[]>) => {
        state.loading = false;
        state.inventoryStatus = action.payload;
      })
      .addCase(fetchInventoryStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setDateRange, clearErrors } = analyticsSlice.actions;

export default analyticsSlice.reducer;
