import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
// Removido o import do StripeProvider para evitar travamento
import ScrollToTop from '@/components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
import HomePage from '@/pages/HomePage';
import MenuPage from '@/pages/MenuPage';
import CartPage from '@/pages/CartPage';
import CustomOrderPage from '@/pages/CustomOrderPage';
import PaymentPage from '@/pages/PaymentPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import OrderHistoryPage from '@/pages/OrderHistoryPage';
import ProfilePage from '@/pages/ProfilePage';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <CartProvider>
            {/* O StripeProvider foi removido daqui para destravar a renderização */}
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected Routes */}
              <Route
                path="/custom-order"
                element={
                  <ProtectedRoute>
                    <CustomOrderPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/payment" element={<PaymentPage />} />
              
              <Route
                path="/order-history"
                element={
                  <ProtectedRoute>
                    <OrderHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;