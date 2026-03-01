# EcoValuate — Backend

Flask API that powers property data fetching, carbon footprint estimation, and renovation plan generation.

---

## Setup

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:
```
GEMINI_API_KEY=your_google_gemini_key
NREL_API_KEY=your_nrel_key
```

```bash
python app.py   # Runs on http://127.0.0.1:2000
```

---

## Modules

| File | Description |
|------|-------------|
| `app.py` | Flask app entry point; defines all 3 API routes |
| `workflow.py` | Orchestrates scraping → extraction → climate → derived calculations |
| `calculator.py` | Computes carbon footprint, eco-score (0–100), and derived inputs |
| `generate_plan.py` | Greedy renovation selector + Google Gemini narrative generation |
| `climate.py` | Fetches historical temperature data and computes HDD/CDD via Open-Meteo |
| `extractor.py` | Parses HomeHarvest property objects into normalized metadata dicts |
| `homeharvest_client.py` | Wrapper around HomeHarvest for property scraping |
| `inferences.py` | Heuristics for inferring fuel type, insulation, and window quality |
| `egrid.csv` | EPA eGRID regional grid CO₂ intensity data |

---

## API Endpoints

### POST `/api/load`
Scrape property data and compute climate and derived inputs from an address.

**Request Body:**
```json
{ "address": "123 Main St, Irvine, CA" }
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "metadata": {
      "address": "...",
      "latitude": 33.6,
      "longitude": -117.8,
      "size_sqft": 1800,
      "year_built": 1998,
      "age_years": 27,
      "stories": 2,
      "inferred_fuel": "natural_gas",
      "has_pool": false,
      "has_solar": false,
      "state": "CA",
      "zip_code": "92602"
    },
    "climate": {
      "annual_hdd": 1200,
      "annual_cdd": 900,
      "avg_temp": 63.5
    },
    "derived": {
      "inferred_fuel": "natural_gas",
      "grid_intensity": 0.248,
      "solar_yield_per_kw": 1620.0,
      "transit_multiplier": 0.92,
      "insulation": true,
      "triple_windows": false
    }
  }
}
```

**Error Responses:**
- `400` — Missing address parameter
- `404` — Property not found
- `500` — Internal error

---

### POST `/api/estimate`
Compute carbon footprint and eco-score from home data.

**Request Body:**
```json
{
  "home_data": {
    "metadata": {},
    "climate": {},
    "derived": {}
  }
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "address": "...",
    "eco_score": 61,
    "estimated_annual_tons": 7.4,
    "carbon_intensity": 4.1,
    "breakdown": {
      "thermal_emissions_tons": 4.2,
      "transport_emissions_tons": 1.8,
      "grid_cleanliness_kg_kwh": 0.248
    },
    "solar_preview": {
      "potential_kwh_year": 8100,
      "offset_percentage": 42
    }
  }
}
```

**Error Responses:**
- `404` — Property not found
- `500` — Internal calculation error

---

### POST `/api/plan`
Generate a budget-constrained renovation plan with LLM narrative.

**Request Body:**
```json
{
  "budget": 15000,
  "horizon": 5,
  "plan_type": "balanced",
  "home_data": {
    "metadata": {},
    "climate": {},
    "derived": {},
    "past": {}
  }
}
```

`plan_type` must be one of: `"balanced"`, `"fastest payback"`, `"max co2 reduction"`

**Response (200):**
```json
{
  "status": "success",
  "plan": {
    "budget_usd": 15000,
    "time_horizon_years": 5,
    "plan_type": "balanced",
    "selected_actions": [
      {
        "action": "Install smart thermostat",
        "estimated_cost": 300,
        "annual_co2_reduction": 60,
        "payback_years": 2.1,
        "estimated_install_days": 1,
        "cost_effectiveness": 0.2
      }
    ],
    "total_estimated_cost": 14800,
    "cumulative_estimated_co2_reduction": 1500,
    "equivalent_trees": 68.2,
    "remaining_budget": 200,
    "carbon_score_update": {
      "baseline_eco_score": 61,
      "updated_eco_score": 74,
      "percent_reduction": 18.4
    },
    "rationale": "..."
  }
}
```

**Error Responses:**
- `500` — Planner generation error

---

## External Data Sources

| Source | Used For |
|--------|----------|
| HomeHarvest | Property metadata scraping |
| Open-Meteo | Historical climate (HDD/CDD) |
| NREL PVWatts | Solar yield potential |
| eGRID (EPA) | Regional grid CO₂ intensity |
| Overpass / OSM | Transit access scoring |
| Google Gemini 2.5 Flash | Plan narrative generation |
