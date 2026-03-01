# EcoValuate — Frontend

React + Vite single-page app for the EcoValuate home sustainability tool.

---

## Setup

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # Production build → dist/
npm run preview # Preview production build
```

Requires the backend running at `http://127.0.0.1:2000`. See the [root README](../README.md) for backend setup.

---

## Pages

| Page | Route (internal) | Description |
|------|-----------------|-------------|
| `StartPage` | `start` | Landing page with address search and animated clouds |
| `InfoPage` | `info` | Review and edit scraped property details before scoring |
| `ScorePage` | `score` | Displays animated eco-score with emoji, inputs for plan generation |
| `MapPage` | `map` | Year-by-year renovation action cards; click to remove actions and see live impact |
| `GraphPage` | `graph` | 15-year projections of eco-score and annual energy cost |

---

## Components

| Component | Description |
|-----------|-------------|
| `AddressSearch` | Text input with mock address autocomplete and clear button |
| `Field` | Form field wrapper with label and optional required marker |
| `ScoreSlider` | Animated horizontal progress bar (red → green) with adaptive end-label hiding |
| `PlanInputs` | Budget / years / plan-type form with validation errors and loading spinner |
| `Toggle` | On/off switch for pool and solar panel fields |

---

## State Management

All cross-page state lives in `App.jsx` and is passed down as props:

| State | Type | Description |
|-------|------|-------------|
| `page` | string | Current active page |
| `address` | string | User-entered address |
| `loadData` | object | Full response from `/api/load`, extended with `past` (estimate) and `future` (plan) |
| `formData` | object | User-edited form values from InfoPage |
| `planData` | object | Plan response from `/api/plan` |
| `loading` | boolean | True while `/api/load` is in flight |

`loadData` shape:
```js
{
  status: "success",
  data: {
    metadata: { address, latitude, longitude, size_sqft, year_built, stories, ... },
    climate:  { annual_hdd, annual_cdd, avg_temp },
    derived:  { inferred_fuel, grid_intensity, solar_yield_per_kw, ... },
    past:     { eco_score, estimated_annual_tons, breakdown, ... },
    future:   { selected_actions, cumulative_estimated_co2_reduction, equivalent_trees, ... }
  }
}
```

---

## Styling

- **Glassmorphism** — frosted glass cards with `backdropFilter: blur` and semi-transparent backgrounds
- **Accent colors** — brown `#593a2a`, dark green `#4a7c59` (defined in `constants.js`)
- **Backgrounds** — full-bleed images (`bg1.png`–`bg4.png` in `public/`) per page with a radial blur mask
- **Fonts** — `--font-brand` (headings), `--font-ui` (body), set in `index.css`
- All styles are inline React style objects — no CSS modules or external CSS framework

---

## Constants (`src/constants.js`)

| Export | Value |
|--------|-------|
| `ACCENT_COLOR` | `#593a2a` |
| `DARK_GREEN_COLOR` | `#4a7c59` |
| `BG_URL` – `BG_URL4` | Paths to background images |
| `inputStyle` | Shared base style object for form inputs |
