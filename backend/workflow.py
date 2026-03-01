"""Top-level workflow tying scraping, extraction, climate and derived calculations.

Usage:
  python workflow.py "1176 Hanchett Ave, San Jose, CA 95126"

The module exports `run_workflow(address)` for programmatic use.
"""
import sys
import json
import traceback
from typing import Any, Dict

from homeharvest_client import scrape_address
from extractor import extract_basic_metadata
from extractor import get_user_input
from climate import get_climate_metrics
from calculator import compute_derived_inputs
from calculator import estimate_carbon_footprint
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
    #print(metadata)
    #update derived with inputs
    inputs = get_user_input()
    temp = derived["stories"]
    derived.update(inputs)
    if temp is not None:
        if derived["stories"] is None: derived["stories"] = temp
    else:
        if derived["stories"] is None: derived["stories"] = 1
    
    #update derived with inferences
    if (derived["inferred_fuel"] is None): 
        fuel_mix = estimate_fuel_mix(metadata["year_built"], metadata["state"])
        derived["inferred_fuel"] = max(fuel_mix, key = fuel_mix.get)
    avgpps = get_neighborhood_stats(metadata["zip_code"])
    if (derived["insulation"] is None): 
        derived["insulation"] = infer_attic_insulation(metadata["year_built"], metadata["price_per_sqft"], avgpps, derived["annual_hdd"])
    if (derived["triple_windows"] is None): 
        derived["triple_windows"] = infer_triple_pane_windows(metadata["year_built"], metadata["price_per_sqft"], avgpps, derived["annual_hdd"])
    
    derived["grid_intensity"] = get_grid_intensity(metadata["zip_code"])
    derived["solar_yield_per_kw"] = get_solar_potential(metadata["latitude"], metadata["longitude"])
    derived["transit_multiplier"] = get_transit_score(metadata["latitude"], metadata["longitude"])
    #output = {"metadata": metadata, "climate": climate, "derived": derived}
    #logger.info("Workflow completed for %s", address)
    #print("Workflow completed for %s" % address)
    
    score = estimate_carbon_footprint(metadata, climate, derived)
    return {"metadata": metadata, "climate": climate, "derived": derived}

'''
if __name__ == "__main__":
    # expect the address as the first argument
    
    #if len(sys.argv) < 2:
    #    print("Type: python workflow.py \"<ADDRESS>\"")
    #    sys.exit(1)

    #address = sys.argv[1]
    #address = "102 White Jasmine, Irvine CA 92618"
    address = "21040 Cory Ct, Cupertino CA 95014"  # for testing without needing to pass an argument every time
    try:
        result = run_workflow(address)
        #print(json.dumps(result, indent=2, default=str))
    except Exception as exc:
        # Print a short friendly message and the traceback for debugging.
        print(f"Error running workflow for {address}: {exc}")
        print("Address should be in the format: 1234 Main St, Hackville, CA 12345")
        traceback.print_exc()
        sys.exit(2)
'''
