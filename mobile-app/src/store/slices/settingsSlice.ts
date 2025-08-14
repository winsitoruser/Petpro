import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

// Define types
export interface VendorProfile {
  id: string;
  businessName: string;
  email: string;
  phone: string;
  logo?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  website?: string;
  description?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  verified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
}

export interface BusinessHours {
  monday: { open: string; close: string; isOpen: boolean };
  tuesday: { open: string; close: string; isOpen: boolean };
  wednesday: { open: string; close: string; isOpen: boolean };
  thursday: { open: string; close: string; isOpen: boolean };
  friday: { open: string; close: string; isOpen: boolean };
  saturday: { open: string; close: string; isOpen: boolean };
  sunday: { open: string; close: string; isOpen: boolean };
}

export interface PaymentSettings {
  bankAccount?: {
    accountName: string;
    accountNumber: string;
    routingNumber: string;
    bankName: string;
  };
  paymentMethods: {
    creditCard: boolean;
    debit: boolean;
    paypal: boolean;
    applePay: boolean;
    googlePay: boolean;
  };
  autoWithdrawal: boolean;
  withdrawalThreshold?: number;
  withdrawalDay?: number;
}

export interface TaxSettings {
  taxId: string;
  taxEnabled: boolean;
  taxRate: number;
  taxIncludedInPrice: boolean;
  taxAppliedTo: 'all' | 'specific';
  specificProductCategories?: string[];
  taxExemptionEnabled: boolean;
}

export interface ShippingSettings {
  shippingEnabled: boolean;
  shippingOptions: {
    id: string;
    name: string;
    price: number;
    estimatedDays: string;
    isDefault: boolean;
  }[];
  freeShippingThreshold?: number;
  localPickupEnabled: boolean;
  localPickupAddress?: string;
  localPickupInstructions?: string;
}

export interface NotificationSettings {
  email: {
    newOrder: boolean;
    orderCancelled: boolean;
    lowInventory: boolean;
    promotionEnding: boolean;
    weeklyReport: boolean;
  };
  push: {
    newOrder: boolean;
    orderCancelled: boolean;
    lowInventory: boolean;
    promotionEnding: boolean;
    weeklyReport: boolean;
  };
  sms: {
    newOrder: boolean;
    orderCancelled: boolean;
    lowInventory: boolean;
    promotionEnding: boolean;
    weeklyReport: boolean;
  };
  phone?: string;
}

export interface ApiIntegration {
  id: string;
  name: string;
  apiKey: string;
  endpoint?: string;
  status: 'active' | 'inactive';
  lastSync?: string;
}

export interface Subscription {
  id: string;
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  price: number;
  billingCycle: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  status: 'active' | 'cancelled' | 'expired';
  features: string[];
}

interface SettingsState {
  vendorProfile: VendorProfile | null;
  businessHours: BusinessHours | null;
  paymentSettings: PaymentSettings | null;
  taxSettings: TaxSettings | null;
  shippingSettings: ShippingSettings | null;
  notificationSettings: NotificationSettings | null;
  apiIntegrations: ApiIntegration[];
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  vendorProfile: null,
  businessHours: null,
  paymentSettings: null,
  taxSettings: null,
  shippingSettings: null,
  notificationSettings: null,
  apiIntegrations: [],
  subscription: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchVendorProfile = createAsyncThunk(
  'settings/fetchVendorProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/vendors/profile');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vendor profile');
    }
  }
);

export const updateVendorProfile = createAsyncThunk(
  'settings/updateVendorProfile',
  async (profileData: Partial<VendorProfile>, { rejectWithValue }) => {
    try {
      const response = await api.put('/vendors/profile', profileData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update vendor profile');
    }
  }
);

export const fetchBusinessHours = createAsyncThunk(
  'settings/fetchBusinessHours',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/vendors/business-hours');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch business hours');
    }
  }
);

export const updateBusinessHours = createAsyncThunk(
  'settings/updateBusinessHours',
  async (hoursData: BusinessHours, { rejectWithValue }) => {
    try {
      const response = await api.put('/vendors/business-hours', hoursData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update business hours');
    }
  }
);

export const fetchPaymentSettings = createAsyncThunk(
  'settings/fetchPaymentSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/vendors/payment-settings');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment settings');
    }
  }
);

export const updatePaymentSettings = createAsyncThunk(
  'settings/updatePaymentSettings',
  async (paymentData: Partial<PaymentSettings>, { rejectWithValue }) => {
    try {
      const response = await api.put('/vendors/payment-settings', paymentData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update payment settings');
    }
  }
);

export const fetchTaxSettings = createAsyncThunk(
  'settings/fetchTaxSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/vendors/tax-settings');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tax settings');
    }
  }
);

export const updateTaxSettings = createAsyncThunk(
  'settings/updateTaxSettings',
  async (taxData: Partial<TaxSettings>, { rejectWithValue }) => {
    try {
      const response = await api.put('/vendors/tax-settings', taxData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update tax settings');
    }
  }
);

export const fetchShippingSettings = createAsyncThunk(
  'settings/fetchShippingSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/vendors/shipping-settings');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch shipping settings');
    }
  }
);

export const updateShippingSettings = createAsyncThunk(
  'settings/updateShippingSettings',
  async (shippingData: Partial<ShippingSettings>, { rejectWithValue }) => {
    try {
      const response = await api.put('/vendors/shipping-settings', shippingData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update shipping settings');
    }
  }
);

export const fetchNotificationSettings = createAsyncThunk(
  'settings/fetchNotificationSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/vendors/notification-settings');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notification settings');
    }
  }
);

export const updateNotificationSettings = createAsyncThunk(
  'settings/updateNotificationSettings',
  async (notificationData: Partial<NotificationSettings>, { rejectWithValue }) => {
    try {
      const response = await api.put('/vendors/notification-settings', notificationData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update notification settings');
    }
  }
);

export const fetchApiIntegrations = createAsyncThunk(
  'settings/fetchApiIntegrations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/vendors/api-integrations');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch API integrations');
    }
  }
);

export const updateApiIntegration = createAsyncThunk(
  'settings/updateApiIntegration',
  async ({ id, integrationData }: { id: string; integrationData: Partial<ApiIntegration> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/vendors/api-integrations/${id}`, integrationData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update API integration');
    }
  }
);

export const fetchSubscription = createAsyncThunk(
  'settings/fetchSubscription',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/vendors/subscription');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscription');
    }
  }
);

export const updateSubscription = createAsyncThunk(
  'settings/updateSubscription',
  async (subscriptionData: { plan: string; billingCycle: 'monthly' | 'yearly' }, { rejectWithValue }) => {
    try {
      const response = await api.put('/vendors/subscription', subscriptionData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update subscription');
    }
  }
);

// Create slice
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearErrors(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Vendor Profile
      .addCase(fetchVendorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorProfile.fulfilled, (state, action: PayloadAction<VendorProfile>) => {
        state.loading = false;
        state.vendorProfile = action.payload;
      })
      .addCase(fetchVendorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(updateVendorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVendorProfile.fulfilled, (state, action: PayloadAction<VendorProfile>) => {
        state.loading = false;
        state.vendorProfile = action.payload;
      })
      .addCase(updateVendorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Business Hours
      .addCase(fetchBusinessHours.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusinessHours.fulfilled, (state, action: PayloadAction<BusinessHours>) => {
        state.loading = false;
        state.businessHours = action.payload;
      })
      .addCase(fetchBusinessHours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(updateBusinessHours.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBusinessHours.fulfilled, (state, action: PayloadAction<BusinessHours>) => {
        state.loading = false;
        state.businessHours = action.payload;
      })
      .addCase(updateBusinessHours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Payment Settings
      .addCase(fetchPaymentSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentSettings.fulfilled, (state, action: PayloadAction<PaymentSettings>) => {
        state.loading = false;
        state.paymentSettings = action.payload;
      })
      .addCase(fetchPaymentSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(updatePaymentSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentSettings.fulfilled, (state, action: PayloadAction<PaymentSettings>) => {
        state.loading = false;
        state.paymentSettings = action.payload;
      })
      .addCase(updatePaymentSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Tax Settings
      .addCase(fetchTaxSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaxSettings.fulfilled, (state, action: PayloadAction<TaxSettings>) => {
        state.loading = false;
        state.taxSettings = action.payload;
      })
      .addCase(fetchTaxSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(updateTaxSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaxSettings.fulfilled, (state, action: PayloadAction<TaxSettings>) => {
        state.loading = false;
        state.taxSettings = action.payload;
      })
      .addCase(updateTaxSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Shipping Settings
      .addCase(fetchShippingSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShippingSettings.fulfilled, (state, action: PayloadAction<ShippingSettings>) => {
        state.loading = false;
        state.shippingSettings = action.payload;
      })
      .addCase(fetchShippingSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(updateShippingSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateShippingSettings.fulfilled, (state, action: PayloadAction<ShippingSettings>) => {
        state.loading = false;
        state.shippingSettings = action.payload;
      })
      .addCase(updateShippingSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Notification Settings
      .addCase(fetchNotificationSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotificationSettings.fulfilled, (state, action: PayloadAction<NotificationSettings>) => {
        state.loading = false;
        state.notificationSettings = action.payload;
      })
      .addCase(fetchNotificationSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(updateNotificationSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNotificationSettings.fulfilled, (state, action: PayloadAction<NotificationSettings>) => {
        state.loading = false;
        state.notificationSettings = action.payload;
      })
      .addCase(updateNotificationSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // API Integrations
      .addCase(fetchApiIntegrations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApiIntegrations.fulfilled, (state, action: PayloadAction<ApiIntegration[]>) => {
        state.loading = false;
        state.apiIntegrations = action.payload;
      })
      .addCase(fetchApiIntegrations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(updateApiIntegration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateApiIntegration.fulfilled, (state, action: PayloadAction<ApiIntegration>) => {
        state.loading = false;
        state.apiIntegrations = state.apiIntegrations.map(integration =>
          integration.id === action.payload.id ? action.payload : integration
        );
      })
      .addCase(updateApiIntegration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Subscription
      .addCase(fetchSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscription.fulfilled, (state, action: PayloadAction<Subscription>) => {
        state.loading = false;
        state.subscription = action.payload;
      })
      .addCase(fetchSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(updateSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubscription.fulfilled, (state, action: PayloadAction<Subscription>) => {
        state.loading = false;
        state.subscription = action.payload;
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearErrors } = settingsSlice.actions;

export default settingsSlice.reducer;
