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
from climate import get_climate_metrics
from calculator import compute_derived_inputs

'''
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
'''

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

    output = {"metadata": metadata, "climate": climate, "derived": derived}
    #logger.info("Workflow completed for %s", address)
    print("Workflow completed for %s" % address)
    return output


if __name__ == "__main__":
    # expect the address as the first argument
    '''
    if len(sys.argv) < 2:
        print("Type: python workflow.py \"<ADDRESS>\"")
        sys.exit(1)
    '''
    #address = sys.argv[1]
    address = "21040 Cory Ct, Cupertino CA 95014"  # for testing without needing to pass an argument every time
    try:
        result = run_workflow(address)
        print(json.dumps(result, indent=2, default=str))
    except Exception as exc:
        # Print a short friendly message and the traceback for debugging.
        print(f"Error running workflow for {address}: {exc}")
        print("Address should be in the format: 1234 Main St, Hackville, CA 12345")
        traceback.print_exc()
        sys.exit(2)
