import React, { useState, Suspense } from 'react';
import { SignIn } from "@clerk/clerk-react";
import { Link } from 'react-router-dom';

export default function SignInPage() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  // Admin credentials
  const ADMIN_EMAILS = ['mehak0512@gmail.com', 'vanshaj0512@gmail.com'];
  const ADMIN_PASSWORD = 'makeithappen@22';

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setAdminError('');

    const normalizedEmail = adminEmail.toLowerCase().trim();
    
    if (!ADMIN_EMAILS.includes(normalizedEmail)) {
      setAdminError('Invalid admin email. Access denied.');
      return;
    }

    if (adminPassword !== ADMIN_PASSWORD) {
      setAdminError('Incorrect password. Please try again.');
      return;
    }

    // Admin login successful - BYPASS PAYMENT LOGIC
    // We set these flags so the dashboard knows they are authorized/paid
    localStorage.setItem('isAdmin', 'true');
    localStorage.setItem('hasPaidSaffGrow', 'true'); // This prevents payment popup
    localStorage.setItem(`paid_${normalizedEmail}`, 'true');
    localStorage.setItem('currentUserEmail', normalizedEmail);
    localStorage.setItem('currentUserName', normalizedEmail.split('@')[0]);
    
    // Direct redirect to Dashboard (Skipping Auth Callback/Payment)
    window.location.href = '/saffron-dashboard/index.html';
  };

  return (
    <div style={{ 
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      minHeight: '100vh', background: '#020617', padding: '20px', flexDirection: 'column' 
    }}>
      {/* FORCE OVERRIDE: Ensure Clerk User Login is White */}
      <style>{`
        /* Force White Background on the Clerk Card */
        .cl-card, .cl-signIn-start, .cl-rootBox {
          background-color: #ffffff !important;
          color: #0f172a !important;
          box-shadow: none !important;
          border: none !important;
        }
        .cl-headerTitle, .cl-headerSubtitle { color: #0f172a !important; }
        .cl-formFieldLabel { color: #475569 !important; }
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

      <div style={{ width: '100%', maxWidth: '400px', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Link to="/" style={{ color: '#facc15', textDecoration: 'none', fontWeight: 'bold' }}>← Back</Link>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', opacity: 0.7 }}>Home</Link>
      </div>

      <div style={{ 
        background: '#ffffff', 
        padding: '30px', 
        borderRadius: '24px', 
        width: '100%', 
        maxWidth: '450px', 
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 60px -15px rgba(0,0,0,0.5)'
      }}>
        
        <h2 style={{ color: '#0f172a', textAlign: 'center', marginBottom: '20px', fontWeight: '800' }}>
          {isAdminMode ? "Admin Login" : "User Login"}
        </h2>
        
        {/* Toggle Switch */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '5px', borderRadius: '12px', marginBottom: '25px' }}>
          <button 
            onClick={() => setIsAdminMode(false)} 
            style={{ 
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', 
              background: !isAdminMode ? '#ffffff' : 'transparent', 
              color: !isAdminMode ? '#0f172a' : '#64748b', 
              fontWeight: 'bold',
              boxShadow: !isAdminMode ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s'
            }}>
            User
          </button>
          <button 
            onClick={() => setIsAdminMode(true)} 
            style={{ 
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', 
              background: isAdminMode ? '#ffffff' : 'transparent', 
              color: isAdminMode ? '#0f172a' : '#64748b', 
              fontWeight: 'bold',
              boxShadow: isAdminMode ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s'
            }}>
            Admin
          </button>
        </div>

        {isAdminMode ? (
          /* ADMIN CUSTOM FORM */
          <>
            <div style={{ 
              background: '#fffbeb', 
              border: '1px solid #fcd34d', 
              borderRadius: '8px', 
              padding: '12px', 
              marginBottom: '20px',
              fontSize: '13px',
              color: '#92400e'
            }}>
              <strong>Admin Access:</strong> Use your authorized credentials to access the dashboard directly.
            </div>

            <form onSubmit={handleAdminLogin} style={{ marginBottom: '10px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#475569', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Admin Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#0f172a',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#facc15';
                    e.target.style.background = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.background = '#f8fafc';
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#475569', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#0f172a',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#facc15';
                    e.target.style.background = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.background = '#f8fafc';
                  }}
                />
              </div>

              {adminError && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '10px',
                  marginBottom: '15px',
                  color: '#dc2626',
                  fontSize: '13px'
                }}>
                  {adminError}
                </div>
              )}

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#facc15',
                  color: '#020617',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 6px -1px rgba(250, 204, 21, 0.3)'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Sign In as Admin
              </button>
            </form>
          </>
        ) : (
          /* CLERK USER FORM */
          <Suspense fallback={<div style={{color:'#64748b', textAlign:'center'}}>Loading...</div>}>
            <SignIn 
              routing="path" 
              path="/signin" 
              forceRedirectUrl="/auth-callback"
              fallbackRedirectUrl="/auth-callback"
              signUpUrl="/signup"
              appearance={{
                variables: {
                  colorPrimary: '#facc15',
                  colorBackground: '#ffffff',
                  colorText: '#0f172a',
                  colorInputBackground: '#f8fafc',
                  colorInputText: '#0f172a',
                  borderRadius: '12px'
                },
                elements: {
                  card: { boxShadow: 'none', padding: 0 }, 
                  socialButtonsBlockButton: { 
                    backgroundColor: 'white', 
                    borderColor: '#cbd5e1',
                    color: '#334155'
                  },
                  formButtonPrimary: {
                    backgroundColor: '#facc15',
                    color: '#020617',
                    fontWeight: 'bold'
                  },
                  footerActionLink: { color: '#ca8a04' }
                }
              }}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}