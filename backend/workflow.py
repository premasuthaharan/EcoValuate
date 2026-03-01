"""Top-level workflow tying scraping, extraction, climate and derived calculations.

Usage:
  python workflow.py "1176 Hanchett Ave, San Jose, CA 95126"

The module exports `run_workflow(address)` for programmatic use.
"""
from typing import Any, Dict

from homeharvest_client import scrape_address
from extractor import extract_basic_metadata
from climate import get_climate_metrics
from calculator import compute_derived_inputs
from calculator import get_neighborhood_stats
from calculator import get_grid_intensity
from calculator import get_solar_potential
from calculator import get_transit_score
from inferences import estimate_fuel_mix
from inferences import infer_attic_insulation
from inferences import infer_triple_pane_windows

def run_workflow(address: str) -> Dict[str, Any]:
    """Run the data-gathering and feature-prep workflow for a single address.

    Returns a dictionary with keys: metadata, climate, derived.
    """
    properties = scrape_address(address)
    house = properties[0]

    metadata = extract_basic_metadata(house)

    lat = metadata.get("latitude")
    lon = metadata.get("longitude")
    climate = get_climate_metrics(lat, lon)

    derived = compute_derived_inputs(metadata, climate)

    if derived["inferred_fuel"] is None:
        fuel_mix = estimate_fuel_mix(metadata["year_built"], metadata["state"])
        derived["inferred_fuel"] = max(fuel_mix, key = fuel_mix.get)
    
    if derived["stories"] is None: derived["stories"] = 1

    avgpps = get_neighborhood_stats(metadata["zip_code"])
    derived["insulation"] = infer_attic_insulation(metadata["year_built"], metadata["price_per_sqft"], avgpps, derived["annual_hdd"])
    derived["triple_windows"] = infer_triple_pane_windows(metadata["year_built"], metadata["price_per_sqft"], avgpps, derived["annual_hdd"])
    
    derived["grid_intensity"] = get_grid_intensity(metadata["zip_code"])
    derived["solar_yield_per_kw"] = get_solar_potential(metadata["latitude"], metadata["longitude"])
    derived["transit_multiplier"] = get_transit_score(metadata["latitude"], metadata["longitude"])
    
    return {"metadata": metadata, "climate": climate, "derived": derived}
