import React, { Suspense } from 'react';
import { SignUp } from "@clerk/clerk-react";
import { Link } from 'react-router-dom';

export default function SignUpPage() {
  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', justifyContent: 'center', 
      alignItems: 'center', minHeight: '100vh', background: '#020617', padding: '20px'
    }}>
      <style>{`
        .cl-card, .cl-signIn-start, .cl-signUp-start, .cl-rootBox {
          background-color: #ffffff !important;
          color: #0f172a !important;
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5) !important;
          border: 1px solid #e2e8f0 !important;
        }
        .cl-headerTitle, .cl-headerSubtitle { color: #0f172a !important; }
        .cl-formFieldInput {
          background-color: #f8fafc !important;
          border: 1px solid #cbd5e1 !important;
          color: #0f172a !important;
        }
        .cl-socialButtonsBlockButton {
          background-color: #ffffff !important;
          border: 1px solid #cbd5e1 !important;
          color: #334155 !important;
        }
        .cl-footerActionLink { color: #ca8a04 !important; }
      `}</style>

      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Link to="/" style={{ color: '#facc15', textDecoration: 'none', fontWeight: 'bold' }}>← Back</Link>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', opacity: 0.8 }}>Home</Link>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: 'white', fontSize: '28px', fontWeight: '800' }}>Create SaffGrow Account</h2>
        <p style={{ color: '#94a3b8', marginTop: '10px' }}>Join the future of saffron polyfarming</p>
      </div>

      <Suspense fallback={<div style={{color:'white'}}>Loading...</div>}>
        <SignUp 
          routing="path" 
          path="/signup" 
          signInUrl="/signin" 
          // ✅ CRITICAL CHANGE: Redirect to logic handler
          forceRedirectUrl="/auth-callback"
          fallbackRedirectUrl="/auth-callback"
          appearance={{
            layout: { socialButtonsPlacement: 'bottom' },
            variables: { 
              colorPrimary: '#facc15',
              colorBackground: '#ffffff',
              colorText: '#0f172a',
              colorInputBackground: '#f8fafc',
              colorInputText: '#0f172a',
              borderRadius: '12px'
            },
            elements: { card: { boxShadow: 'none' } }
          }}
        />
      </Suspense>
    </div>
  );
}