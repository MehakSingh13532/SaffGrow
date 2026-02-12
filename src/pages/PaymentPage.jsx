import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  
  // State to control the view
  const [loading, setLoading] = useState(true); // Default: TRUE (Hide everything while checking)

  // ✅ YOUR RAZORPAY TEST KEY ID
  const KEY_ID = 'rzp_test_S5P0ZwzNXUT7yn'; 

  // ✅ ADMIN WHITELIST
  const adminEmails = [
    "mehak0512@gmail.com", 
    "vanshaj0512@gmail.com"
  ];

  useEffect(() => {
    const userEmail = searchParams.get('email') || localStorage.getItem('currentUserEmail');
    
    // 1. Safety Check: If no email, go to Sign In
    if (!userEmail) { 
      navigate('/signin'); 
      return; 
    }

    const normalizedEmail = userEmail.toLowerCase();
    setEmail(normalizedEmail);

    // 2. ADMIN BYPASS (Immediate Redirect)
    if (adminEmails.includes(normalizedEmail)) {
      grantAccess(normalizedEmail);
      return; 
    }

    // 3. CHECK PAYMENT STATUS (The Fix)
    // We ask the server if they are already paid.
    const checkStatus = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/check-status?email=${normalizedEmail}`);
        const data = await res.json();

        if (data.status === 'paid') {
          // ✅ ALREADY PAID: Redirect immediately
          grantAccess(normalizedEmail);
        } else {
          // ❌ NOT PAID: Show the Payment Button
          setLoading(false); 
          loadRazorpayScript();
        }
      } catch (error) {
        console.error("Server offline, showing payment page by default.");
        setLoading(false);
        loadRazorpayScript();
      }
    };

    checkStatus();

  }, [navigate, searchParams]);

  // Helper: Loads the Razorpay logic only for UNPAID users
  const loadRazorpayScript = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  // Helper: Grants access and redirects
  const grantAccess = (userEmail) => {
    localStorage.setItem('hasPaidSaffGrow', 'true');
    localStorage.setItem(`paid_${userEmail}`, 'true');
    // Redirect
    window.location.href = "/saffron-dashboard/index.html";
  };

  // --- RAZORPAY PAYMENT HANDLER ---
  const handlePayment = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/create-order', { method: 'POST' });
      const order = await res.json();

      const options = {
        key: KEY_ID, 
        amount: order.amount, 
        currency: "INR",
        name: "SaffGrow Technologies",
        description: "Dashboard Activation",
        order_id: order.id, 
        handler: async function (response) {
          const verifyRes = await fetch('http://localhost:5000/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              email: email
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
             alert("Payment Successful! Welcome.");
             grantAccess(email);
          } else {
            alert("Verification Failed.");
          }
        },
        prefill: { email: email, contact: "9999999999" },
        theme: { color: "#FACC15" }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();

    } catch (error) {
      alert("Error starting payment. Is Backend running?");
    }
  };

  // --- VIEW LOGIC ---

  // 1. Loading Screen (Shows while checking status)
  if (loading) {
    return (
      <div style={{ height: '100vh', background: '#020617', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{width: '40px', height: '40px', border: '4px solid #333', borderTop: '4px solid #facc15', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
        <p style={{ marginTop: '20px', color: '#94a3b8' }}>Verifying Account Status...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // 2. Payment Screen (Only shows if NOT paid)
  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#0f172a', padding: '40px', borderRadius: '24px', border: '1px solid #1e293b', textAlign: 'center', maxWidth: '400px', width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
        <h2 style={{ color: '#facc15', marginBottom: '10px' }}>Complete Payment</h2>
        <p style={{ color: '#94a3b8', marginBottom: '30px' }}>One-time activation fee</p>
        <div style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '10px', color: 'white' }}>₹ 1.00</div>
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '30px' }}>Secured by Razorpay</div>
        <button 
          onClick={handlePayment}
          style={{ width: '100%', padding: '16px', background: '#facc15', color: 'black', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Pay Now
        </button>
      </div>
    </div>
  );
}