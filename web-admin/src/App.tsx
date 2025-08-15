import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Users from './pages/users/Users';
import UserDetail from './pages/users/UserDetail';
import Clinics from './pages/clinics/Clinics';
import ClinicDetail from './pages/clinics/ClinicDetail';
import Bookings from './pages/bookings/Bookings';
import BookingDetail from './pages/bookings/BookingDetail';
import Products from './pages/products/Products';
import ProductDetail from './pages/products/ProductDetail';
import Orders from './pages/orders/Orders';
import OrderDetail from './pages/orders/OrderDetail';
import Reports from './pages/reports/Reports';
import Settings from './pages/settings/Settings';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  // In a real application, we would check for authentication status here
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Simulate authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Mock authentication check, would be replaced with real API call
        const token = localStorage.getItem('adminToken');
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <div className="loading-spinner" />;
  }

  return (
    <>
      <Routes>
        {/* Auth routes - available when not authenticated */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" /> : <ForgotPassword />} />
          <Route path="/reset-password" element={isAuthenticated ? <Navigate to="/dashboard" /> : <ResetPassword />} />
        </Route>

        {/* Protected routes - require authentication */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/users" element={isAuthenticated ? <Users /> : <Navigate to="/login" />} />
          <Route path="/users/:id" element={isAuthenticated ? <UserDetail /> : <Navigate to="/login" />} />
          <Route path="/clinics" element={isAuthenticated ? <Clinics /> : <Navigate to="/login" />} />
          <Route path="/clinics/:id" element={isAuthenticated ? <ClinicDetail /> : <Navigate to="/login" />} />
          <Route path="/bookings" element={isAuthenticated ? <Bookings /> : <Navigate to="/login" />} />
          <Route path="/bookings/:id" element={isAuthenticated ? <BookingDetail /> : <Navigate to="/login" />} />
          <Route path="/products" element={isAuthenticated ? <Products /> : <Navigate to="/login" />} />
          <Route path="/products/:id" element={isAuthenticated ? <ProductDetail /> : <Navigate to="/login" />} />
          <Route path="/orders" element={isAuthenticated ? <Orders /> : <Navigate to="/login" />} />
          <Route path="/orders/:id" element={isAuthenticated ? <OrderDetail /> : <Navigate to="/login" />} />
          <Route path="/reports" element={isAuthenticated ? <Reports /> : <Navigate to="/login" />} />
          <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} />
        </Route>

        {/* 404 page */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default App;
