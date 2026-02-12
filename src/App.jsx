import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import AuthCallback from './pages/AuthCallback';
import PaymentPage from './pages/PaymentPage';

function App() {
  return (
    <div style={{ minHeight: '100vh' }}> 
      <Routes>
        {/* Home Landing Page */}
        <Route path="/" element={<Home />} />
        
        {/* Login & Signup Routes */}
        <Route path="/signin/*" element={<SignInPage />} />
        <Route path="/signup/*" element={<SignUpPage />} />
        
        {/* Payment Page - only for non-admin users */}
        <Route path="/payment" element={<PaymentPage />} />
        
        {/* Auth Callback - handles routing after authentication */}
        <Route path="/auth-callback" element={<AuthCallback />} />
      </Routes>
    </div>
  );
}

export default App;