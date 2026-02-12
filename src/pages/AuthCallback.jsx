import React, { useEffect } from 'react';
import { useUser } from "@clerk/clerk-react";

export default function AuthCallback() {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    // Wait until Clerk is fully loaded
    if (isLoaded && isSignedIn && user) {
      // Get email from multiple possible sources (handle different Clerk configurations)
      const rawEmail = user.primaryEmailAddress?.emailAddress || 
                       user.emailAddresses?.[0]?.emailAddress || 
                       user.primaryEmailAddress?.emailAddress || 
                       '';
      
      // Normalize email (case-insensitive, trim whitespace)
      const email = rawEmail.toLowerCase().trim().replace(/\s+/g, '');
      
      // Admin email list (case-insensitive check) - only the two specified admins
      const adminEmails = [
        "mehak0512@gmail.com", 
        "vanshaj0512@gmail.com"
      ].map(e => e.toLowerCase().trim().replace(/\s+/g, ''));

      console.log("🔐 AuthCallback - Raw email:", rawEmail);
      console.log("🔐 AuthCallback - Normalized email:", email);
      console.log("🔐 AuthCallback - Admin emails:", adminEmails);
      console.log("🔐 AuthCallback - Is admin?", adminEmails.includes(email));

      // Check if email matches any admin email (case-insensitive)
      const isAdmin = adminEmails.some(adminEmail => 
        email === adminEmail || 
        email.replace(/[._]/g, '') === adminEmail.replace(/[._]/g, '')
      );

      if (isAdmin) {
        // --- ADMIN BYPASS: Admins go directly to dashboard ---
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("hasPaidSaffGrow", "true");
        localStorage.setItem(`paid_${email}`, "true");
        window.location.href = "/saffron-dashboard/index.html";
      } else {
        // --- REGULAR USER: Check if they have paid ---
        localStorage.removeItem("isAdmin");
        const hasPaid = localStorage.getItem(`paid_${email}`);
        const hasPaidGeneral = localStorage.getItem("hasPaidSaffGrow") === "true";

        if (hasPaid === "true" || hasPaidGeneral) {
          // User has already paid, go to dashboard
          localStorage.setItem("hasPaidSaffGrow", "true");
          localStorage.setItem(`paid_${email}`, "true");
          localStorage.setItem("currentUserEmail", email);
          localStorage.setItem("currentUserName", user.fullName || "");
          window.location.href = "/saffron-dashboard/index.html";
        } else {
          // New user or unpaid user - send to payment page
          // Store user info for payment page
          localStorage.setItem("currentUserEmail", email);
          localStorage.setItem("currentUserName", user.fullName || "");
          window.location.href = `/payment?email=${encodeURIComponent(email)}&name=${encodeURIComponent(user.fullName || "")}`;
        }
      }
    }
  }, [isLoaded, isSignedIn, user]);

  // Show loading state if Clerk is still loading
  if (!isLoaded) {
    return (
      <div style={{ height: '100vh', background: '#020617', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
        <div className="loader" style={{ border: '4px solid #facc15', borderTop: '4px solid transparent', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite', marginBottom: '15px' }}></div>
        <p>Loading authentication...</p>
        <style>{` @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } `}</style>
      </div>
    );
  }

  // If not signed in, redirect to signin
  if (isLoaded && !isSignedIn) {
    window.location.href = '/signin';
    return null;
  }

  return (
    <div style={{ height: '100vh', background: '#020617', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
      <div className="loader" style={{ border: '4px solid #facc15', borderTop: '4px solid transparent', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite', marginBottom: '15px' }}></div>
      <p>Verifying Account Status...</p>
      <style>{` @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } `}</style>
    </div>
  );
}