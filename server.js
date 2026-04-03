const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- In-Memory State (Database Mock) ---
let db = {
  user: null,
  weather: { temp: 30, rain: 0, aqi: 50, status: 'Normal' },
  claims: []
};

// --- Endpoints ---
app.post('/api/register', (req, res) => {
  const { name, location, phone } = req.body;
  if (!name || !location || !phone) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  db.user = { name, location, phone };
  res.json({ message: "User registered successfully", user: db.user });
});

app.get('/api/status', (req, res) => {
  // Calculate premium based on current weather logic
  let premium = 15;
  let riskLevel = 'Low';
  let coverage = '₹500 / day';

  const w = db.weather;
  if (w.temp > 40 || w.rain > 50 || w.aqi > 300) {
    premium = 35;
    riskLevel = 'High';
  } else if (w.rain > 20 || w.temp > 35 || w.aqi > 150) {
    premium = 25;
    riskLevel = 'Medium';
  }

  res.json({
    user: db.user,
    weather: db.weather,
    policy: { premium, riskLevel, coverage },
    claims: db.claims
  });
});

app.post('/api/simulate', (req, res) => {
  const { type } = req.body;
  
  if (type === 'rain') {
    db.weather = { temp: 28, rain: 60, aqi: 40, status: "Heavy Rain" };
  } else if (type === 'heat') {
    db.weather = { temp: 45, rain: 0, aqi: 60, status: "Extreme Heat" };
  } else if (type === 'aqi') {
    db.weather = { temp: 32, rain: 0, aqi: 350, status: "Severe Pollution" };
  } else if (type === 'normal') {
    db.weather = { temp: 30, rain: 0, aqi: 50, status: "Normal" };
  } else {
    return res.status(400).json({ error: "Invalid simulation type" });
  }

  // Check parametric triggers
  const w = db.weather;
  let triggered = false;
  let condition = "";

  if (w.temp > 42) {
    triggered = true;
    condition = "Extreme Heat";
  } else if (w.rain > 50) {
    triggered = true;
    condition = "Heavy Rain";
  } else if (w.aqi > 300) {
    triggered = true;
    condition = "Severe Pollution";
  }

  if (triggered) {
    const claim = {
      id: Date.now(),
      title: `Auto-Claim: ${condition}`,
      amount: 300,
      date: new Date().toLocaleString(),
      status: "Approved"
    };
    // Prepend
    db.claims.unshift(claim);
  }


  res.json({ message: "Simulation executed", weather: db.weather });
});

app.post('/api/logout', (req, res) => {
  db.user = null;
  db.weather = { temp: 30, rain: 0, aqi: 50, status: 'Normal' };
  db.claims = [];
  res.json({ message: "Session cleared" });
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Backend API running on http://127.0.0.1:${PORT}`);
});
