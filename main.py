from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import time

app = FastAPI(title="ShieldGig API")

# --- In-Memory State (Database Mock) --- #
class State:
    def __init__(self):
        self.user = None
        self.weather = {"temp": 30, "rain": 0, "aqi": 50, "status": "Normal"}
        self.claims = []

db = State()

# --- Models --- #
class User(BaseModel):
    name: str
    location: str
    phone: str

class SimulateRequest(BaseModel):
    type: str  # 'rain', 'heat', 'aqi', 'normal'

# --- Endpoints --- #

@app.post("/api/register")
def register(user: User):
    db.user = user.dict()
    return {"message": "User registered successfully", "user": db.user}

@app.get("/api/status")
def get_status():
    # Calculate premium based on current weather logic
    premium = 15
    risk_level = 'Low'
    coverage = '₹500 / day'

    w = db.weather
    if w['temp'] > 40 or w['rain'] > 50 or w['aqi'] > 300:
        premium = 35
        risk_level = 'High'
    elif w['rain'] > 20 or w['temp'] > 35 or w['aqi'] > 150:
        premium = 25
        risk_level = 'Medium'

    return {
        "user": db.user,
        "weather": db.weather,
        "policy": {
            "premium": premium,
            "riskLevel": risk_level,
            "coverage": coverage
        },
        "claims": db.claims
    }

@app.post("/api/simulate")
def simulate(req: SimulateRequest):
    if req.type == 'rain':
        db.weather = {"temp": 28, "rain": 60, "aqi": 40, "status": "Heavy Rain"}
    elif req.type == 'heat':
        db.weather = {"temp": 45, "rain": 0, "aqi": 60, "status": "Extreme Heat"}
    elif req.type == 'aqi':
        db.weather = {"temp": 32, "rain": 0, "aqi": 350, "status": "Severe Pollution"}
    elif req.type == 'normal':
        db.weather = {"temp": 30, "rain": 0, "aqi": 50, "status": "Normal"}
    else:
        raise HTTPException(status_code=400, detail="Invalid simulation type")

    # Check for parametric triggers
    w = db.weather
    triggered = False
    condition = ""

    if w['temp'] > 42:
        triggered = True
        condition = "Extreme Heat"
    elif w['rain'] > 50:
        triggered = True
        condition = "Heavy Rain"
    elif w['aqi'] > 300:
        triggered = True
        condition = "Severe Pollution"

    if triggered:
        # Check if we already triggered this exact claim recently (avoid dupes for same condition in a row if wanted, but simpler to just append)
        # Create claim
        claim = {
            "id": int(time.time() * 1000),
            "title": f"Auto-Claim: {condition}",
            "amount": 300,
            "date": time.strftime('%m/%d/%Y, %I:%M:%S %p'),
            "status": "Approved"
        }
        # Prepend to list
        db.claims.insert(0, claim)

    return {"message": "Simulation executed", "weather": db.weather}
