import { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './index.css';

function App() {
  const [view, setView] = useState('home'); // 'home' | 'register' | 'dashboard'
  
  // State populated from backend
  const [user, setUser] = useState(null);
  const [weather, setWeather] = useState({ temp: 30, rain: 0, aqi: 50, status: 'Normal' });
  const [claims, setClaims] = useState([]);
  const [policy, setPolicy] = useState({ premium: 15, riskLevel: 'Low', coverage: '₹500 / day' });
  const [loading, setLoading] = useState(false);

  // Registration Form State
  const [formData, setFormData] = useState({ name: '', location: '', phone: '' });

  // Fetch state from backend
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          if (view !== 'dashboard') setView('dashboard');
        }
        setWeather(data.weather);
        setPolicy(data.policy);
        setClaims(data.claims);
      }
    } catch (err) {
      console.error("Backend not running or error fetching status:", err);
    }
  }, [view]);

  // Initial poll for user existence
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        await fetchStatus();
      }
    } catch (err) {
      console.error("Failed to register:", err);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      setUser(null);
      setClaims([]);
      setWeather({ temp: 30, rain: 0, aqi: 50, status: 'Normal' });
      setView('home');
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  const simulateWeather = async (type) => {
    try {
      await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      // Refresh status after trigger
      await fetchStatus();
    } catch (err) {
      console.error("Failed to simulate weather:", err);
    }
  };

  if (view === 'home') {
    return (
      <div className="landing-container">
        <header className="landing-header">
          <h1 className="landing-title">ShieldGig</h1>
          <p className="landing-subtitle">The first AI-powered parametric insurance platform for gig economy workers.</p>
        </header>

        <div className="landing-hero glass-panel">
          <h2 style={{fontSize: '2rem', marginBottom: '1rem'}}>AI-Powered Income Protection</h2>
          <p style={{fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6'}}>
            Don't let extreme weather or severe pollution ruin your earnings. 
            ShieldGig dynamically monitors local conditions and automatically processes payouts when conditions make it unsafe for you to work.
            No claim filing. No paperwork. Just instant protection.
          </p>
          <div className="landing-features">
            <div className="feature-item">⛈️ Extreme Weather Coverage</div>
            <div className="feature-item">🌫️ Severe AQI Protection</div>
            <div className="feature-item">⚡ Automated Instant Payouts</div>
            <div className="feature-item">💳 AI Dynamic Premium Pricing</div>
          </div>
          
          <button 
            className="btn btn-primary pulse-btn" 
            style={{ fontSize: '1.25rem', padding: '1rem 3rem', marginTop: '2rem' }}
            onClick={() => setView('register')}
          >
            Get Started Now
          </button>
        </div>
      </div>
    );
  }

  if (view === 'register') {
    return (
      <div className="glass-panel slide-up" style={{ maxWidth: '400px', margin: '10vh auto' }}>
        <div className="app-header" style={{ marginBottom: '2rem' }}>
          <h1 className="app-title" style={{ fontSize: '2.5rem' }}>ShieldGig</h1>
          <p className="app-subtitle">Create your worker profile</p>
        </div>
        
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">City/Location</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Mumbai, MH"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input 
              type="tel" 
              className="form-input" 
              placeholder="e.g. +91 98765 43210"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-simulate" style={{ flex: 1 }} onClick={() => setView('home')}>
              Back
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
              {loading ? 'Registering...' : 'Complete Profile'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Dashboard View
  const isSevere = weather.status !== 'Normal';

  return (
    <div className="slide-up">
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
        <div>
          <h1 className="app-title" style={{ fontSize: '2.5rem', marginBottom: '0' }}>ShieldGig Dashboard</h1>
          <p className="app-subtitle" style={{ marginTop: '0.5rem' }}>Welcome back, {user?.name} • {user?.location}</p>
        </div>
        <button className="btn btn-simulate" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={handleLogout}>
          Reset Session
        </button>
      </header>

      <div className="dashboard-grid">
        {/* Policy Management Card */}
        <div className="glass-panel">
          <h2>Active Policy</h2>
          
          <div className="stat-row">
            <span className="stat-label">Coverage</span>
            <span className="stat-value">{policy.coverage}</span>
          </div>
          
          <div className="stat-row">
            <span className="stat-label">Risk Level</span>
            <span className={`badge badge-${policy.riskLevel === 'Low' ? 'success' : policy.riskLevel === 'Medium' ? 'warning' : 'danger'}`}>
              {policy.riskLevel}
            </span>
          </div>
          
          <div className="stat-row" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="stat-label" style={{ color: 'white' }}>Weekly Dynamic Premium</span>
            <span className="stat-value" style={{ color: 'var(--accent-color)', fontSize: '1.5rem' }}>
              ₹{policy.premium}
            </span>
          </div>

          <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Premium automatically adjusts based on real-time weather analytics mapped to your location.
          </div>
        </div>

        {/* Triggers Simulator Card */}
        <div className="glass-panel">
          <h2>Trigger Simulator (Backend API)</h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Current State: Temp {weather.temp}°C | Rain {weather.rain}mm | AQI {weather.aqi}
          </p>

          <div className="button-stack">
            <button className="btn btn-simulate" onClick={() => simulateWeather('normal')}>
              ☀️ Normal Weather
            </button>
            <button className="btn btn-simulate" onClick={() => simulateWeather('rain')}>
              🌧️ Simulate Heavy Rain ({'>'}50mm)
            </button>
            <button className="btn btn-simulate" onClick={() => simulateWeather('heat')}>
              🔥 Simulate Extreme Heat ({'>'}42°C)
            </button>
            <button className="btn btn-simulate" onClick={() => simulateWeather('aqi')}>
              🌫️ Simulate Severe AQI ({'>'}300)
            </button>
          </div>

          {isSevere && (
            <div className="weather-event-card animate-pulse">
              <strong>⚠️ Alert:</strong> {weather.status} detected in {user?.location}. Work conditions compromised.
            </div>
          )}
          {!isSevere && (
            <div className="weather-event-card weather-normal">
              <strong>✅ Clear:</strong> Optimal conditions in {user?.location}.
            </div>
          )}
        </div>

        {/* Claims Management Card */}
        <div className="glass-panel">
          <h2>Claims History</h2>
          
          {claims.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: '2rem 0' }}>
              No claims triggered yet.
            </p>
          ) : (
            <div style={{maxHeight: '400px', overflowY: 'auto'}}>
              {claims.map((claim) => (
                <div key={claim.id} className="claim-item approved">
                  <div className="claim-header">
                    <span className="claim-title">{claim.title}</span>
                    <span className="claim-amount">₹{claim.amount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="claim-date">{claim.date}</span>
                    <span className="badge badge-success">Approved</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Risk Graph */}
        <div className="glass-panel" style={{ gridColumn: '1 / -1' }}>
          <h2>Premium & Risk Trends (7-Day)</h2>
          <div style={{ width: '100%', height: 300, marginTop: '1rem' }}>
            <ResponsiveContainer>
              <AreaChart
                data={[
                  { day: 'Mon', premium: 15, temp: 32 },
                  { day: 'Tue', premium: 15, temp: 34 },
                  { day: 'Wed', premium: 25, temp: 38 },
                  { day: 'Thu', premium: 35, temp: 28 },
                  { day: 'Fri', premium: 15, temp: 31 },
                  { day: 'Sat', premium: 35, temp: 43 },
                  { day: 'Today', premium: policy.premium, temp: weather.temp }
                ]}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid var(--panel-border)', borderRadius: '8px', color: 'white' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Area type="monotone" dataKey="premium" stroke="var(--accent-color)" fillOpacity={1} fill="url(#colorPremium)" name="Premium (₹)" />
                <Area type="monotone" dataKey="temp" stroke="var(--warning-color)" fillOpacity={0} name="Temp (°C)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
