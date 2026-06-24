import React, { useState } from 'react';
import { 
  Sparkles, BarChart3, Brain,
  MapPin, ArrowRight, HelpCircle, 
  MessageSquare, Compass, 
  Activity, Landmark, Laptop, Award,
  Linkedin, Globe
} from 'lucide-react';

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLoginButton } from '../components/GoogleLoginButton';

interface LandingPageProps {
  onPublicReport: () => void;
}

type PageState = 'landing' | 'login' | 'signup';

export const LandingPage: React.FC<LandingPageProps> = ({ onPublicReport }) => {
  const { user, loginAsDemoUser, loading } = useAuth();
  const location = useLocation();

  if (user) {
    const from = (location.state as any)?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }
  const [viewState, setViewState] = useState<PageState>('landing');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);



  // Sign Up Form States
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpCity, setSignUpCity] = useState('');
  const [signUpState, setSignUpState] = useState('');

  // Form errors
  const [authError, setAuthError] = useState<string | null>(null);

  // Random Indian Name & Email Placeholders on component load / refresh
  const [indianPlaceholders] = useState(() => {
    const names = [
      "Aarav Sharma", "Aditya Patel", "Rohan Mehta", "Vikram Singh", "Arjun Gupta",
      "Sai Raghavan", "Ananya Iyer", "Diya Chatterjee", "Riya Sen", "Kavya Nair",
      "Vivaan Kapoor", "Ishaan Gupta", "Devendra Kumar", "Priya Sharma", "Sneha Reddy",
      "Karan Malhotra", "Amit Trivedi", "Neha Deshmukh", "Pooja Hegde", "Siddharth Joshi"
    ];
    const domains = ["gmail.com", "yahoo.co.in", "outlook.com", "example.in", "civicpulse.in"];
    
    const randomName = names[Math.floor(Math.random() * names.length)];
    const emailBase = randomName.toLowerCase().replace(/\s+/g, '.');
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    return {
      name: randomName,
      email: `${emailBase}@${randomDomain}`
    };
  });

  // Contact Us Form States
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSendingContact, setIsSendingContact] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingContact(true);
    try {
      const response = await fetch('http://localhost:8080/api/contact/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: contactName || indianPlaceholders.name,
          email: contactEmail || indianPlaceholders.email,
          message: contactMessage
        })
      });

      const messageText = await response.text();

      if (response.ok) {
        alert(messageText);
        setContactName('');
        setContactEmail('');
        setContactMessage('');
      } else if (response.status === 429) {
        alert(messageText);
      } else {
        alert("Error: " + messageText);
      }
    } catch (err: any) {
      console.error(err);
      alert('Failed to connect to backend server. Make sure the Spring Boot service is running.');
    } finally {
      setIsSendingContact(false);
    }
  };



  const handleLocalSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName || !signUpEmail || !signUpPassword || !signUpConfirmPassword || !signUpCity || !signUpState) {
      setAuthError('Please fill in all required fields.');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }
    setAuthError(null);
    try {
      // Auto login as citizen on signup for quick hackathon review
      await loginAsDemoUser('citizen');
    } catch (err: any) {
      setAuthError(err.message || 'Registration login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F5F5F7] flex flex-col selection:bg-[#D6C3A5] selection:text-[#0B0B0C] font-inter">
      {/* Top Navigation Header */}
      <header className="max-w-6xl w-full mx-auto px-6 py-6 flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setViewState('landing')}>
          <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center">
            <span className="text-[#D6C3A5] text-sm">🛡️</span>
          </div>
          <span className="font-semibold tracking-tight text-base text-[#F5F5F7]">CivicPulse</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-[rgba(255,255,255,0.06)] text-[#8B8175] font-mono tracking-wider">ENTERPRISE</span>
        </div>
        
        {viewState === 'landing' ? (
          <div className="flex gap-3">
            <button
              onClick={onPublicReport}
              className="px-3.5 py-1.5 border border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] text-[#A1A1AA] hover:text-[#F5F5F7] font-semibold text-xs rounded-md transition-all cursor-pointer"
            >
              Report Issue
            </button>
            <button
              onClick={() => setViewState('login')}
              className="px-3.5 py-1.5 bg-[#D6C3A5] text-[#0B0B0C] font-semibold text-xs rounded-md transition-all hover:bg-[#E5D7BF] cursor-pointer"
            >
              Access Platform
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setViewState('landing');
              setAuthError(null);
            }}
            className="px-3.5 py-1.5 border border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] text-[#A1A1AA] hover:text-[#F5F5F7] font-semibold text-xs rounded-md transition-all cursor-pointer"
          >
            Back to Homepage
          </button>
        )}
      </header>

      {/* RENDER LOGIN VIEW */}
      {viewState === 'login' && (
        <main className="flex-grow max-w-md w-full mx-auto px-6 py-12 flex flex-col justify-center animate-fade-in-up">
          <div className="bg-[#141416] border border-[rgba(255,255,255,0.04)] rounded-2xl p-8 backdrop-blur-xl shadow-premium relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D6C3A5]/20 to-transparent" />
            
            <div className="text-center space-y-1.5 mb-6">
              <h2 className="text-lg font-semibold text-[#F5F5F7]">Sign In to CivicPulse</h2>
              <p className="text-xs text-[#A1A1AA]">Authenticate securely via Google or use Demo Access below.</p>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-red-950/30 border border-red-500/20 text-[#A86666] text-xs rounded-lg text-center font-mono">
                {authError}
              </div>
            )}

            <div className="space-y-4">
              {/* Primary Google Sign-In */}
              <div className="space-y-2">
                <GoogleLoginButton />
              </div>

              {/* Separator */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-[rgba(255,255,255,0.03)]"></div>
                <span className="flex-shrink mx-3 text-[9px] font-mono text-[#8B8175] uppercase">HACKATHON DEMO ACCESS</span>
                <div className="flex-grow border-t border-[rgba(255,255,255,0.03)]"></div>
              </div>

              {/* Demo Roles for instant testing */}
              <div className="space-y-2.5">
                <p className="text-[9px] text-center text-[#8B8175] font-mono uppercase tracking-wide">Select an authorized role to log in instantly</p>
                <div className="grid grid-cols-1 gap-2 text-left">
                  <button
                    type="button"
                    onClick={() => loginAsDemoUser('citizen')}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-[#1A1A1D] hover:bg-[rgba(255,255,255,0.01)] border border-[rgba(214,195,165,0.1)] hover:border-[#D6C3A5]/40 rounded-xl text-xs transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm">👥</span>
                      <div>
                        <div className="font-semibold text-[#F5F5F7]">Citizen View</div>
                        <div className="text-[9px] text-[#8B8175] font-mono">Simulate a local citizen profile</div>
                      </div>
                    </div>
                    <span className="text-[8px] bg-[rgba(214,195,165,0.1)] text-[#D6C3A5] font-mono px-2 py-0.5 rounded border border-[rgba(214,195,165,0.2)]">CITIZEN</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => loginAsDemoUser('authority')}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-[#1A1A1D] hover:bg-[rgba(255,255,255,0.01)] border border-[rgba(123,92,255,0.1)] hover:border-[#7b5cff]/40 rounded-xl text-xs transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm">👮</span>
                      <div>
                        <div className="font-semibold text-[#F5F5F7]">City Official View</div>
                        <div className="text-[9px] text-[#8B8175] font-mono">Simulate municipal authority access</div>
                      </div>
                    </div>
                    <span className="text-[8px] bg-[rgba(123,92,255,0.1)] text-[#7b5cff] font-mono px-2 py-0.5 rounded border border-[rgba(123,92,255,0.2)]">AUTHORITY</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => loginAsDemoUser('admin')}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-[#1A1A1D] hover:bg-[rgba(255,255,255,0.01)] border border-[rgba(220,38,38,0.1)] hover:border-[#dc2626]/40 rounded-xl text-xs transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm">🛡️</span>
                      <div>
                        <div className="font-semibold text-[#F5F5F7]">System Admin</div>
                        <div className="text-[9px] text-[#8B8175] font-mono">Full control over operations center</div>
                      </div>
                    </div>
                    <span className="text-[8px] bg-[rgba(220,38,38,0.1)] text-[#dc2626] font-mono px-2 py-0.5 rounded border border-[rgba(220,38,38,0.2)]">ADMIN</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.03)] text-center text-xs text-[#8B8175]">
              <span>Need access? </span>
              <button onClick={() => { setViewState('signup'); setAuthError(null); }} className="text-[#D6C3A5] font-semibold hover:underline bg-transparent border-none cursor-pointer">Create Account</button>
            </div>
          </div>
        </main>
      )}

      {/* RENDER SIGNUP VIEW */}
      {viewState === 'signup' && (
        <main className="flex-grow max-w-md w-full mx-auto px-6 py-10 flex flex-col justify-center animate-fade-in-up">
          <div className="bg-[#141416] border border-[rgba(255,255,255,0.04)] rounded-2xl p-8 backdrop-blur-xl shadow-premium relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D6C3A5]/20 to-transparent" />
            
            <div className="text-center space-y-1.5 mb-5">
              <h2 className="text-lg font-semibold text-[#F5F5F7]">Create Civic Identity</h2>
              <p className="text-xs text-[#A1A1AA]">Register to file reports, check resolutions, and earn trust index points.</p>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-red-950/30 border border-red-500/20 text-[#A86666] text-xs rounded-lg text-center font-mono">
                {authError}
              </div>
            )}

            <form onSubmit={handleLocalSignUpSubmit} className="space-y-3.5 text-left">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase tracking-wider text-[#8B8175]">Full Name</label>
                <input 
                  type="text" 
                  value={signUpName}
                  onChange={e => setSignUpName(e.target.value)}
                  placeholder="First and last name"
                  className="w-full glass-input py-1.5 text-xs"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase tracking-wider text-[#8B8175]">Email Address</label>
                <input 
                  type="email" 
                  value={signUpEmail}
                  onChange={e => setSignUpEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full glass-input py-1.5 text-xs"
                  required
                />
              </div>

              {/* Password row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase tracking-wider text-[#8B8175]">Password</label>
                  <input 
                    type="password" 
                    value={signUpPassword}
                    onChange={e => setSignUpPassword(e.target.value)}
                    placeholder="Min 8 chars"
                    className="w-full glass-input py-1.5 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase tracking-wider text-[#8B8175]">Confirm</label>
                  <input 
                    type="password" 
                    value={signUpConfirmPassword}
                    onChange={e => setSignUpConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full glass-input py-1.5 text-xs"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase tracking-wider text-[#8B8175]">Phone Number</label>
                <input 
                  type="tel" 
                  value={signUpPhone}
                  onChange={e => setSignUpPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full glass-input py-1.5 text-xs"
                />
              </div>

              {/* Location: City / State */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase tracking-wider text-[#8B8175]">City</label>
                  <input 
                    type="text" 
                    value={signUpCity}
                    onChange={e => setSignUpCity(e.target.value)}
                    placeholder="e.g. San Francisco"
                    className="w-full glass-input py-1.5 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase tracking-wider text-[#8B8175]">State</label>
                  <input 
                    type="text" 
                    value={signUpState}
                    onChange={e => setSignUpState(e.target.value)}
                    placeholder="e.g. CA"
                    className="w-full glass-input py-1.5 text-xs"
                    required
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center py-2 bg-[#D6C3A5] text-[#0B0B0C] font-semibold text-xs rounded-lg transition-all hover:bg-[#E5D7BF] active:scale-[0.99] cursor-pointer"
                >
                  Create Account
                </button>
                <div className="pt-1">
                  <GoogleLoginButton />
                </div>
              </div>
            </form>

            <div className="mt-5 pt-3 border-t border-[rgba(255,255,255,0.03)] text-center text-xs text-[#8B8175]">
              <span>Already registered? </span>
              <button onClick={() => { setViewState('login'); setAuthError(null); }} className="text-[#D6C3A5] font-semibold hover:underline bg-transparent border-none cursor-pointer">Login here</button>
            </div>
          </div>
        </main>
      )}

      {/* RENDER LANDING VIEW (8 SECTIONS) */}
      {viewState === 'landing' && (
        <div className="flex-grow">
          {/* Section 1: Hero */}
          <section className="max-w-6xl w-full mx-auto px-6 pt-16 pb-20 flex flex-col lg:flex-row items-center gap-12 justify-center">
            <div className="space-y-6 max-w-xl text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] text-[9.5px] uppercase font-mono tracking-widest text-[#8B8175]">
                <Sparkles className="h-3.5 w-3.5 text-[#D6C3A5]" />
                <span>Next-Generation Government Technology</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.02] text-[#F5F5F7] font-inter">
                CivicPulse
              </h1>
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-[#D6C3A5] leading-snug">
                The Civic Intelligence Platform for Modern Communities
              </h2>

              <p className="text-[#A1A1AA] text-sm leading-relaxed font-light max-w-lg">
                Report issues, monitor city health, collaborate with local authorities, and leverage AI-powered civic intelligence. A secure unified environment built for citizen panels and municipal planning responders.
              </p>

              {/* CTA Buttons */}
              <div className="pt-2.5 flex flex-wrap gap-3">
                <button
                  onClick={() => setViewState('login')}
                  className="px-5 py-2.5 bg-[#D6C3A5] text-[#0B0B0C] font-semibold text-xs rounded-lg transition-all hover:bg-[#E5D7BF] active:scale-[0.98] cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <span>Access Platform</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={onPublicReport}
                  className="px-5 py-2.5 border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.03)] text-[#F5F5F7] font-semibold text-xs rounded-lg transition-all active:scale-[0.98] cursor-pointer"
                >
                  Report an Issue
                </button>
                <button
                  onClick={() => setViewState('login')}
                  className="px-5 py-2.5 bg-[#1A1A1D] border border-[rgba(255,255,255,0.03)] text-xs text-[#FAFAFA] font-medium rounded-lg transition-all hover:bg-[rgba(255,255,255,0.01)] cursor-pointer"
                >
                  Continue with Google
                </button>
              </div>
            </div>

            {/* Hero Visual Block */}
            <div className="w-full max-w-lg bg-[#141416] border border-[rgba(255,255,255,0.04)] rounded-2xl p-5 shadow-premium space-y-4">
              <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-3">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-[#D6C3A5]" />
                  <span className="font-mono text-[9px] text-[#8B8175] uppercase">Live Telemetry Preview</span>
                </div>
                <span className="flex items-center gap-1 text-[8px] bg-[rgba(124,154,122,0.05)] text-[#7C9A7A] border border-[#7C9A7A]/30 px-2 py-0.5 rounded font-mono font-medium animate-pulse">
                  📡 ACTIVE SYS SYNC
                </span>
              </div>

              {/* Graphic Mock of Spatial Twin Dashboard */}
              <div className="h-[180px] bg-[#0B0B0C] border border-[rgba(255,255,255,0.03)] rounded-xl relative overflow-hidden flex items-center justify-center">
                <svg width="100%" height="100%" className="opacity-15">
                  <line x1="20%" y1="0" x2="20%" y2="100%" stroke="#FAFAFA" strokeWidth="1" />
                  <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#FAFAFA" strokeWidth="1" />
                  <line x1="80%" y1="0" x2="80%" y2="100%" stroke="#FAFAFA" strokeWidth="1" />
                  <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#FAFAFA" strokeWidth="1" />
                  <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#FAFAFA" strokeWidth="1" />
                </svg>
                {/* Simulated markers */}
                <div className="absolute top-[40%] left-[25%] flex items-center gap-1.5 bg-[#141416]/90 border border-[rgba(255,255,255,0.06)] rounded-full px-2 py-0.5 text-[8px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A86666] animate-ping" />
                  <span>Road Damage &bull; Critical</span>
                </div>
                <div className="absolute top-[65%] left-[55%] flex items-center gap-1.5 bg-[#141416]/90 border border-[rgba(255,255,255,0.06)] rounded-full px-2 py-0.5 text-[8px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C9A7A]" />
                  <span>Utility Repaired</span>
                </div>
              </div>

              {/* Live monitoring numbers */}
              <div className="grid grid-cols-3 gap-3 text-center font-mono">
                <div className="bg-[#1A1A1D] p-2.5 rounded-lg border border-[rgba(255,255,255,0.03)]">
                  <span className="text-[8px] text-[#8B8175] block uppercase">Triage Queue</span>
                  <span className="text-[#D6C3A5] text-xs font-semibold">0 Active Delay</span>
                </div>
                <div className="bg-[#1A1A1D] p-2.5 rounded-lg border border-[rgba(255,255,255,0.03)]">
                  <span className="text-[8px] text-[#8B8175] block uppercase">Index Core</span>
                  <span className="text-[#7C9A7A] text-xs font-semibold">92.4% Health</span>
                </div>
                <div className="bg-[#1A1A1D] p-2.5 rounded-lg border border-[rgba(255,255,255,0.03)]">
                  <span className="text-[8px] text-[#8B8175] block uppercase">AI Confidence</span>
                  <span className="text-[#D6C3A5] text-xs font-semibold">99.8% Precision</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Features Section */}
          <section className="max-w-6xl w-full mx-auto px-6 py-20 border-t border-[rgba(255,255,255,0.03)]">
            <div className="text-center space-y-3 mb-16">
              <span className="text-[10px] font-mono text-[#D6C3A5] tracking-widest uppercase">CAPABILITY MATRIX</span>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#F5F5F7]">Comprehensive Government Technology</h2>
              <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
                Features engineered for national-level innovation standards and secure municipal dispatch integration.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Smart Issue Reporting', icon: MapPin, desc: 'Capture coordinate pins, upload imagery, and use speech-to-text voice reporting.' },
                { title: 'AI Civic Intelligence', icon: Brain, desc: 'Dedicated Gemini models triaging taxonomy, parsing duplicates, and writing resolution windows.' },
                { title: 'Real-Time Issue Tracking', icon: Activity, desc: 'Firestore websocket collection streams keeping status transitions updated live.' },
                { title: 'Community Engagement', icon: MessageSquare, desc: 'Public discussions, community verifications, and reputation incrementing systems.' },
                { title: 'Geospatial Analytics', icon: BarChart3, desc: 'Dynamic indicators outlining city telemetry categories and dispatch loads.' },
                { title: 'Government Dashboard', icon: Landmark, desc: 'Restricted portals displaying resource allocations and officer assignees.' },
                { title: 'Digital Twin Mapping', icon: Laptop, desc: 'Obsidian Styled Apple Maps centerpiece integrating heatmaps and emergency layers.' },
                { title: 'Leaderboard & Reputation', icon: Award, desc: 'Citizen identity scoring tracking levels, verified checks, and community guardian statuses.' }
              ].map((f, idx) => {
                const Icon = f.icon;
                return (
                  <div 
                    key={idx} 
                    className="p-6 bg-[#141416] border border-[rgba(255,255,255,0.03)] hover:border-[#D6C3A5]/20 rounded-xl space-y-3 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[rgba(214,195,165,0.04)] border border-[rgba(214,195,165,0.1)] flex items-center justify-center text-[#D6C3A5]">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="font-semibold text-xs text-[#F5F5F7] uppercase tracking-wide">{f.title}</h3>
                    <p className="text-xs text-[#A1A1AA] leading-relaxed font-light">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 3: How It Works */}
          <section className="max-w-6xl w-full mx-auto px-6 py-20 border-t border-[rgba(255,255,255,0.03)]">
            <div className="text-center space-y-3 mb-16">
              <span className="text-[10px] font-mono text-[#D6C3A5] tracking-widest uppercase">STEPS TO RESOLUTION</span>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#F5F5F7]">Unified Civic Lifecycle</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 font-inter">
              {[
                { num: '01', title: 'Report Issue', desc: 'Advocates capture telemetry, upload images, or voice record reports.' },
                { num: '02', title: 'AI Classifies & Triage', desc: 'Gemini models enrich descriptions, filter duplicates, and calculate priority.' },
                { num: '03', title: 'Authority Verification', desc: 'Responders cross-reference and verify incidents to deploy maintenance crews.' },
                { num: '04', title: 'Resolution Tracking', desc: 'Real-time database triggers update ticket updates synchronously.' },
                { num: '05', title: 'Citizen Feedback', desc: 'Users review completed repairs, incrementing their local reputation score.' }
              ].map((step, idx) => (
                <div 
                  key={idx} 
                  className="p-5 bg-[#141416] border border-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.06)] rounded-xl space-y-3 text-left transition-all duration-300"
                >
                  <span className="text-2xl font-semibold text-[#D6C3A5]/25 font-mono">{step.num}</span>
                  <h3 className="font-semibold text-xs text-[#F5F5F7] tracking-tight">{step.title}</h3>
                  <p className="text-[11px] text-[#A1A1AA] leading-relaxed font-light">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Contact Us & Developer Info */}
          <section className="max-w-6xl w-full mx-auto px-6 py-20 border-t border-[rgba(255,255,255,0.03)]">
            <div className="text-center space-y-3 mb-12">
              <span className="text-[10px] font-mono text-[#D6C3A5] tracking-widest uppercase">GET IN TOUCH</span>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#F5F5F7]">Contact Us</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start text-left">
              {/* Left Panel: Profile Links */}
              <div className="p-6 bg-[#141416] border border-[rgba(255,255,255,0.03)] rounded-2xl space-y-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-[#F5F5F7] uppercase tracking-wider">Connect with Nishant Kumar</h3>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed font-light">
                    Thank you for reviewing CivicPulse! I am a passionate developer focused on building smart city technologies, scalable web apps, and machine intelligence integrations. Let's collaborate.
                  </p>
                </div>

                <div className="space-y-3.5 pt-2">
                  {/* LinkedIn */}
                  <a 
                    href="https://www.linkedin.com/in/nishant-kumar-a166a3305/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-[#0B0B0C] border border-[rgba(255,255,255,0.03)] hover:border-[#D6C3A5]/40 rounded-xl transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[rgba(214,195,165,0.04)] border border-[rgba(214,195,165,0.1)] flex items-center justify-center text-[#D6C3A5]">
                      <Linkedin className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#F5F5F7] block group-hover:text-[#D6C3A5] transition-colors">LinkedIn Profile</span>
                      <span className="text-[9px] font-mono text-[#8B8175]">linkedin.com/in/nishant-kumar-a166a3305</span>
                    </div>
                  </a>

                  {/* Portfolio */}
                  <a 
                    href="https://my-portfolio-nishant.vercel.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-[#0B0B0C] border border-[rgba(255,255,255,0.03)] hover:border-[#D6C3A5]/40 rounded-xl transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[rgba(214,195,165,0.04)] border border-[rgba(214,195,165,0.1)] flex items-center justify-center text-[#D6C3A5]">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#F5F5F7] block group-hover:text-[#D6C3A5] transition-colors">Personal Portfolio</span>
                      <span className="text-[9px] font-mono text-[#8B8175]">my-portfolio-nishant.vercel.app</span>
                    </div>
                  </a>
                </div>
              </div>

              {/* Right Panel: Send Message Form */}
              <form 
                onSubmit={handleContactSubmit}
                className="p-6 bg-[#141416] border border-[rgba(255,255,255,0.03)] rounded-2xl space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase tracking-wider text-[#8B8175]">Your Name</label>
                  <input 
                    type="text" 
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    placeholder={`e.g. ${indianPlaceholders.name}`}
                    className="w-full glass-input"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase tracking-wider text-[#8B8175]">Your Email</label>
                  <input 
                    type="email" 
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    placeholder={`e.g. ${indianPlaceholders.email}`}
                    className="w-full glass-input"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase tracking-wider text-[#8B8175]">Message</label>
                  <textarea 
                    rows={3}
                    value={contactMessage}
                    onChange={e => setContactMessage(e.target.value)}
                    placeholder="Write your query or message..."
                    className="w-full glass-input py-2 h-20 resize-none"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSendingContact}
                  className="w-full py-2 bg-[#D6C3A5] text-[#0B0B0C] font-semibold text-xs rounded-lg transition-all hover:bg-[#E5D7BF] disabled:opacity-50 cursor-pointer"
                >
                  {isSendingContact ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            </div>
          </section>

          {/* Section 5: FAQs */}
          <section className="max-w-4xl w-full mx-auto px-6 py-20 border-t border-[rgba(255,255,255,0.03)]">
            <div className="text-center space-y-3 mb-16">
              <span className="text-[10px] font-mono text-[#D6C3A5] tracking-widest uppercase">FAQ</span>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#F5F5F7]">Platform FAQ</h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "Does CivicPulse support offline mockups?",
                  a: "Yes. In the absence of an active Google Maps API key or backend Spring Boot endpoints, the UI automatically engages mock vectors and fallback maps so testing remains operational."
                },
                {
                  q: "How does the AI Priority Engine generate scores?",
                  a: "The engine scans for proximity to schools, active hospitals, and congested streets using coordinates, parsing safety risks into an explainable 0-100 score list."
                },
                {
                  q: "Who is authorized to resolve municipal issues?",
                  a: "Municipal Officers and Administrators can change status configurations (Assigned, In Progress, Resolved) which immediately streams push updates to local citizen nodes."
                }
              ].map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div 
                    key={idx}
                    className="bg-[#141416] border border-[rgba(255,255,255,0.03)] rounded-xl p-5 cursor-pointer text-left transition-all duration-200"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-xs text-[#FAFAFA]">{faq.q}</h3>
                      <HelpCircle className={`h-4.5 w-4.5 text-[#D6C3A5] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                    {isOpen && (
                      <p className="mt-3 text-[11px] text-[#A1A1AA] leading-relaxed font-light border-t border-[rgba(255,255,255,0.03)] pt-3 animate-fade-in-up">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 6: Call To Action */}
          <section className="max-w-4xl w-full mx-auto px-6 py-20 border-t border-[rgba(255,255,255,0.03)] text-center space-y-6">
            <h2 className="text-3xl font-semibold text-[#F5F5F7]">Help Build Better Communities</h2>
            <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto leading-relaxed font-light">
              Create your account now to log incidents, verify local road repairs, and boost your citizen reputation score.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setViewState('login')}
                className="px-5 py-2.5 bg-[#D6C3A5] text-[#0B0B0C] font-semibold text-xs rounded-lg transition-all hover:bg-[#E5D7BF] cursor-pointer"
              >
                Access CivicPulse
              </button>
              <button
                onClick={onPublicReport}
                className="px-5 py-2.5 border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.02)] text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                Report an Issue
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Section 7: Footer */}
      <footer className="max-w-6xl w-full mx-auto px-6 py-12 border-t border-[rgba(255,255,255,0.03)] flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-[#8B8175] font-mono uppercase">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-tight text-xs text-[#FAFAFA]">CivicPulse Core</span>
        </div>
        <span>&copy; {new Date().getFullYear()} CIVICPULSE INC. ENTERPRISE URBAN MANAGEMENT.</span>
      </footer>
    </div>
  );
};
