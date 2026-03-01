# EcoValuate

EcoValuate is a home sustainability assessment and renovation planning tool. Enter a US property address and EcoValuate scrapes real property data, computes a carbon footprint eco-score, and generates a personalized, budget-aware renovation roadmap.

---

## How It Works

```
Address → /api/load → InfoPage (review/edit)
       → /api/estimate → ScorePage (eco-score)
       → /api/plan → MapPage (renovation timeline)
       → GraphPage (projections)
```

1. **Address lookup** — scrapes property data (size, year built, materials, location) and fetches climate, solar, and grid emissions data
2. **Carbon estimate** — calculates annual CO₂ from heating/cooling, baseload, and transport; produces a 0–100 eco-score
3. **Plan generation** — greedily selects renovations within your budget using your chosen priority, then calls Google Gemini for a narrative rationale
4. **Visualization** — interactive year-by-year action cards and 15-year projection graphs

---

## Project Structure

```
EcoValuate/
├── backend/       Flask API (Python)
└── frontend/      React + Vite app
```

See [`frontend/README.md`](frontend/README.md) for frontend setup and [`backend/`](backend/) for backend details.

---

## Quickstart

### 1. Backend
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

### 2. Frontend
```bash
cd frontend
npm install
npm run dev     # Runs on http://localhost:5173
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/load` | Scrape + extract property, climate, and derived data |
| POST | `/api/estimate` | Compute carbon footprint and eco-score |
| POST | `/api/plan` | Generate budget-constrained renovation plan |

---

## Eco-Score

Scores are based on CO₂ intensity (kg/sqft/year):

| Score | Label |
|-------|-------|
| 80–100 | Excellent |
| 60–80 | Good |
| 40–60 | Fair |
| 20–40 | Poor |
| 0–20 | Critical |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Recharts |
| Backend | Python, Flask, Flask-CORS |
| AI | Google Gemini 2.5 Flash |

---

## External Data Sources

| Source | Used For |
|--------|----------|
| HomeHarvest | Property metadata scraping |
| Open-Meteo | Historical climate (HDD/CDD) |
| NREL PVWatts | Solar yield potential |
| eGRID (EPA) | Regional grid CO₂ intensity |
| Overpass / OSM | Transit access scoring |
| Google Gemini | Plan narrative generation |
