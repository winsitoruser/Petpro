import { configureStore } from '@reduxjs/toolkit';
import promotionsReducer from './slices/promotionsSlice';
import productsReducer from './slices/productsSlice';
import analyticsReducer from './slices/analyticsSlice';
import settingsReducer from './slices/settingsSlice';
import { useDispatch } from 'react-redux';

const store = configureStore({
  reducer: {
    promotions: promotionsReducer,
    products: productsReducer,
    analytics: analyticsReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;
