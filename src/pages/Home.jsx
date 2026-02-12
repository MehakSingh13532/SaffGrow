import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, useUser, useClerk } from "@clerk/clerk-react";

export default function Home() {
  const { user, isLoaded, isSignedIn } = useUser();
  const clerk = useClerk();

  // Admin Whitelist
  const adminEmails = [
    "mehak0512@gmail.com", 
    "vanshaj0512@gmail.com"
  ];

  const isAdmin = isLoaded && isSignedIn && user && 
    adminEmails.includes(user.primaryEmailAddress?.emailAddress?.toLowerCase());

  // Check for dashboard logout and sign out from Clerk
  useEffect(() => {
    const dashboardLogout = localStorage.getItem('dashboardLogout');
    if (dashboardLogout === 'true' && isLoaded && isSignedIn) {
      // Clear the flag
      localStorage.removeItem('dashboardLogout');
      // Sign out from Clerk
      if (clerk) {
        clerk.signOut().then(() => {
          // Force a page reload to ensure clean state
          window.location.reload();
        });
      }
    }
  }, [isLoaded, isSignedIn, clerk]);

  useEffect(() => {
    // Wait for GSAP and ScrollTrigger to load
    const initAnimations = () => {
      if (!window.gsap) {
        setTimeout(initAnimations, 100);
        return;
      }

      const gsap = window.gsap;
      
      // Register ScrollTrigger if available
      if (window.ScrollTrigger && gsap.registerPlugin) {
        gsap.registerPlugin(window.ScrollTrigger);
      }

      // Hero Animations
      const heroTl = gsap.timeline();
      const heroText = document.querySelector(".hero-text");
      const heroMedia = document.querySelector(".hero-media");
      
      if (heroText && heroMedia) {
        heroTl.from(heroText, { opacity: 0, y: 30, duration: 1, ease: "power4.out" })
          .from(heroMedia, { opacity: 0, scale: 0.9, duration: 1, ease: "power4.out" }, "-=0.6");
      }

      // Enhanced Feature Card Scroll Animations
      const featureRows = document.querySelectorAll(".feature-row");
      
      if (featureRows.length > 0 && window.ScrollTrigger) {
        featureRows.forEach((row, i) => {
          const card = row.querySelector(".feature-card");
          const media = row.querySelector(".feature-media");
          
          if (!card || !media) return;

          const cardTitle = card.querySelector("h3");
          const cardText = card.querySelector("p");

          // 1. Create a SINGLE timeline for the whole row to ensure synchronization
          const rowTl = gsap.timeline({
            scrollTrigger: {
              trigger: row,
              start: "top 80%", // Trigger slightly earlier for smoothness
              toggleActions: "play none none none",
              once: true
            }
          });

          // 2. Determine Direction (Left or Right based on index)
          // Even index (0, 2): Card is Left, Media is Right
          // Odd index (1): Card is Right, Media is Left (due to CSS RTL)
          const isLeftAligned = i % 2 === 0;

          // 3. Animate Card and Media Simultaneously
          rowTl
            // Animate Card Container
            .from(card, {
              opacity: 0,
              x: isLeftAligned ? -50 : 50, // Reduced distance to prevent overlap
              y: 30,
              duration: 1,
              ease: "power3.out"
            })
            // Animate Media (Synced with Card)
            .from(media, {
              opacity: 0,
              x: isLeftAligned ? 50 : -50, // Move media slightly from opposite side
              scale: 0.9,
              duration: 1.2,
              ease: "power3.out"
            }, "<") // "<" runs this start at the same time as the previous tween
            
            // Stagger Internal Content (Title & Text)
            .from([cardTitle, cardText], {
              opacity: 0,
              y: 20,
              duration: 0.8,
              stagger: 0.1,
              ease: "power2.out"
            }, "-=0.8"); // Start overlapping with the main card animation

          // Add hover animation to cards (EventListeners remain the same)
          const handleMouseEnter = () => {
            gsap.to(card, {
              y: -10,
              scale: 1.02,
              duration: 0.3,
              ease: "power2.out"
            });
          };
          
          const handleMouseLeave = () => {
            gsap.to(card, {
              y: 0,
              scale: 1,
              duration: 0.3,
              ease: "power2.out"
            });
          };

          card.addEventListener('mouseenter', handleMouseEnter);
          card.addEventListener('mouseleave', handleMouseLeave);
        });
      }
    };

    // Initialize animations when Clerk is loaded
    if (isLoaded) {
      setTimeout(initAnimations, 100);
    }
  }, [isLoaded]);

  return (
    <div className="react-landing-container">
      <style>{`
        :root {
          --primary: #facc15;
          --dark: #020617;
          --navy: #0f172a;
          --overlay: rgba(2,6,23,0.65);
        }
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Poppins', sans-serif; }
        html { scroll-behavior: smooth; }
        body { background: #f8fafc; color: #334155; overflow-x: hidden; }

        /* NAVBAR */
        nav {
          position: fixed; width: 100%; top: 0; z-index: 100; padding: 18px 60px;
          display: flex; justify-content: space-between; align-items: center;
          background: rgba(2,6,23,.85); backdrop-filter: blur(10px);
        }
        nav h2 { color: var(--primary); font-weight: 800; letter-spacing: -1px; }
        .nav-links { display: flex; align-items: center; }
        nav a { color: #e5e7eb; margin-left: 24px; text-decoration: none; font-size: 15px; transition: 0.3s; }
        nav a:hover { color: var(--primary); }

        .nav-auth-group { display: flex; align-items: center; margin-left: 20px; gap: 12px; }
        
        .btn-login {
          color: white !important; border: 1px solid rgba(255,255,255,0.3);
          padding: 8px 20px; border-radius: 25px; font-weight: 500; transition: 0.3s;
        }
        .btn-login:hover { background: rgba(255,255,255,0.1); border-color: var(--primary); }

        .btn-signup {
          background: var(--primary); color: var(--dark) !important;
          padding: 9px 22px; border-radius: 25px; font-weight: 600; transition: 0.3s;
        }
        .btn-signup:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(250, 204, 21, 0.4); }

        .dashboard-access-btn {
          background: #10b981; color: white !important;
          padding: 10px 22px; border-radius: 25px; font-weight: 600;
          border: none; cursor: pointer; transition: 0.3s;
        }
        .dashboard-access-btn:hover { background: #059669; transform: scale(1.05); }

        /* HERO */
        .hero {
          min-height: 100vh; padding: 140px 80px 80px;
          display: grid; grid-template-columns: 1.2fr 1fr; gap: 80px;
          align-items: center; background: linear-gradient(135deg, #020617, #1e293b); color: white;
        }
        .hero h1 { font-size: 64px; color: var(--primary); line-height: 1.1; font-weight: 800; }
        .hero p { margin: 24px 0 36px; font-size: 19px; max-width: 520px; color: #cbd5e1; line-height: 1.6; }
        .hero-action-btn { 
          padding: 18px 45px; background: var(--primary); color: var(--dark); 
          border-radius: 35px; text-decoration: none; font-weight: 700; display: inline-block;
          transition: 0.3s;
        }
        .hero-action-btn:hover { transform: scale(1.05); background: white; }

        .hero-media img { width: 100%; border-radius: 24px; box-shadow: 0 40px 80px rgba(0,0,0,.5); border: 1px solid rgba(255,255,255,0.1); }

        /* FEATURES */
        .features {
          padding: 120px 80px;
          background: linear-gradient(rgba(2,6,23,0.85), rgba(2,6,23,0.85)), 
                      url("https://365dfarms.com/wp-content/uploads/2023/12/20231124024225_IMG_7169-scaled.jpg") center/cover no-repeat fixed;
          color: white;
        }
        .features h2 { text-align: center; font-size: 44px; margin-bottom: 80px; font-weight: 700; }
        .feature-row { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 80px; 
          align-items: center; 
          margin-bottom: 120px;
          min-height: 400px; /* Prevent overlap */
          position: relative;
        }
        .feature-row:nth-child(even) { direction: rtl; }
        .feature-row:nth-child(even) > * { direction: ltr; }
        
        /* Ensure cards don't overlap during animation */
        .feature-card, .feature-media {
          position: relative;
          z-index: 1;
        }

        .feature-card { 
          background: rgba(255,255,255,0.05); 
          padding: 50px; 
          border-radius: 30px; 
          backdrop-filter: blur(12px); 
          border: 1px solid rgba(255,255,255,0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          will-change: transform;
        }
        .feature-card:hover {
          box-shadow: 0 20px 60px rgba(250, 204, 21, 0.2);
        }
        .feature-card h3 { color: var(--primary); font-size: 28px; margin-bottom: 20px; }
        .feature-card p { color: #cbd5e1; line-height: 1.8; font-size: 17px; }
        .feature-media { 
          overflow: hidden; 
          border-radius: 24px;
          will-change: transform;
        }
        .feature-media img { 
          width: 100%; 
          border-radius: 24px; 
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          transition: transform 0.5s ease;
        }
        .feature-media:hover img {
          transform: scale(1.05);
        }

        /* CTA */
        .cta { padding: 120px 40px; background: linear-gradient(135deg, #facc15, #fbbf24); text-align: center; color: var(--dark); }
        .cta h2 { font-size: 48px; margin-bottom: 25px; font-weight: 800; }
        .cta p { font-size: 20px; margin-bottom: 40px; font-weight: 500; }
        .cta-btn { padding: 18px 50px; background: var(--dark); color: white; border-radius: 35px; text-decoration: none; font-weight: 700; display: inline-block; transition: 0.3s; }
        .cta-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,0.2); }

        /* FOOTER */
        footer { background: #010413; color: #64748b; padding: 80px 80px 40px; border-top: 1px solid #1e293b; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 60px; }
        footer h3 { color: white; margin-bottom: 25px; font-size: 20px; }
        footer a { color: #94a3b8; text-decoration: none; display: block; margin-bottom: 12px; transition: 0.2s; }
        footer a:hover { color: var(--primary); }

        @media (max-width: 992px) {
          .hero, .feature-row { grid-template-columns: 1fr; text-align: center; gap: 40px; }
          .hero-text p { margin: 24px auto; }
          nav { padding: 15px 30px; }
          .features { padding: 80px 30px; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav>
        <h2>SaffGrow</h2>
        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#features">Features</a>
          
          <div className="nav-auth-group">
            {!isLoaded ? (
              <span style={{ color: '#64748b' }}>•••</span>
            ) : (
              <>
                <SignedOut>
                  <Link to="/signin" className="btn-login">Login</Link>
                  <Link to="/signup" className="btn-signup">Sign Up</Link>
                </SignedOut>
                <SignedIn>
                  {(() => {
                    const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || '';
                    const hasPaid = localStorage.getItem(`paid_${userEmail}`) === 'true' || 
                                   localStorage.getItem('hasPaidSaffGrow') === 'true';
                    const isAdminUser = isAdmin || adminEmails.includes(userEmail);
                    
                    if (isAdminUser || hasPaid) {
                      return (
                        <button 
                          className="dashboard-access-btn"
                          onClick={() => {
                            if (isAdminUser) {
                              localStorage.setItem("isAdmin", "true");
                              localStorage.setItem("hasPaidSaffGrow", "true");
                              localStorage.setItem(`paid_${userEmail}`, "true");
                            }
                            window.location.href = "/saffron-dashboard/index.html";
                          }}
                        >
                          Open Dashboard
                        </button>
                      );
                    }
                    return null;
                  })()}
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-text">
          <h1>Smart Saffron Polyfarming</h1>
          <p>Grow premium saffron indoors using automation, AI-driven analytics, and precision climate control.</p>
          <Link to="/signup" className="hero-action-btn">Start Growing Now</Link>
        </div>
        <div className="hero-media">
          <img src="https://i0.wp.com/bosswallah.com/blog/wp-content/uploads/2025/06/saffron-farming-at-home.webp?fit=1280%2C720&ssl=1" alt="Saffron Farming" />
        </div>
      </section>

      {/* WHY CHOOSE SAFFGROW */}
      <section className="features" id="features">
        <h2>Advanced Indoor Solutions</h2>

        <div className="feature-row">
          <div className="feature-card">
            <h3>Climate Intelligence</h3>
            <p>Real-time monitoring of temperature, humidity, CO₂ and light levels optimized specifically for saffron crocuses. Our AI predicts the perfect blooming window.</p>
          </div>
          <div className="feature-media">
            <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop" alt="Climate Intelligence" />
          </div>
        </div>

        <div className="feature-row">
          <div className="feature-card">
            <h3>Automation Control</h3>
            <p>Fully automated irrigation, seasonal lighting shifts, and ventilation systems. Manage your entire saffron farm from your smartphone with zero manual effort.</p>
          </div>
          <div className="feature-media">
            <img src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=400&fit=crop" alt="Automation Control" />
          </div>
        </div>

        <div className="feature-row">
          <div className="feature-card">
            <h3>Yield Analytics</h3>
            <p>Advanced data visualization for crop health. Receive instant push notifications for watering needs, nutrient levels, and harvest readiness alerts.</p>
          </div>
          <div className="feature-media">
            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop" alt="Yield Analytics" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Ready to Scale Your Production?</h2>
        <p>Join the future of high-value sustainable agriculture today.</p>
        <Link to="/signup" className="cta-btn">Create Your Account</Link>
      </section>

      <footer>
        <div className="footer-grid">
          <div>
            <h3 style={{color: 'var(--primary)'}}>SaffGrow</h3>
            <p>The leading platform for indoor saffron technology. Combining IoT, automation and sustainable agriculture to empower growers globally.</p>
          </div>
          <div>
            <h3>Platform</h3>
            <a href="#">Features</a>
            <a href="#">Security</a>
            <a href="#">System Status</a>
          </div>
          <div>
            <h3>Company</h3>
            <a href="#">About Us</a>
            <a href="#">Contact</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>
        <div style={{ marginTop: '60px', textAlign: 'center', fontSize: '14px', opacity: 0.6 }}>
          © 2026 SaffGrow Technology Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}