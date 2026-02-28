
EcoValuate - HomeHarvest workflow
=================================

This small project demonstrates a modular workflow to:

- scrape a property using the HomeHarvest library,
- extract normalized metadata (size, year built, fuel, etc.),
- fetch historical climate (HDD/CDD) from Open-Meteo archive,
- compute derived inputs useful for energy/carbon formulas.

Files added:

- `homeharvest_client.py` — wrapper to call HomeHarvest safely
- `extractor.py` — normalize HomeHarvest property model to a dict
- `climate.py` — fetch temperatures and compute HDD/CDD
- `calculator.py` — compute derived and normalized inputs
- `workflow.py` — top-level runner that connects everything
- `requirements.txt` — minimal dependencies

Quick start
-----------

1. Create a virtualenv and install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Run the workflow for an address:

```bash
python workflow.py "1176 Hanchett Ave, San Jose, CA 95126"
```

Notes
-----

- The modules intentionally return structured dictionaries (metadata, climate, derived)
	so you can plug `derived` into whatever final formula you need.
- The code assumes `homeharvest` package is available and network access is allowed.
- Climate requests hit the free Open-Meteo archive API; respect rate limits.

