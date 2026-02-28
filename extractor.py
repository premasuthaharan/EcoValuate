"""Extracts normalized metadata from HomeHarvest property objects.
If some values are None, asks for user input.

The goal is to produce a small dictionary of predictable inputs for
downstream climate/estimation code.
"""
from typing import Any, Dict, Optional
#import logging

#logger = logging.getLogger(__name__)


def _safe_get(obj: Any, *attrs, default=None):
    """
    If any lookup raises an exception (any Exception), 
    the function swallows the exception and returns the supplied default value 
    (or None if none provided).
    """
    try:
        cur = obj
        for a in attrs:
            cur = getattr(cur, a)
        return cur
    except Exception:
        return default


def extract_basic_metadata(prop: Any) -> Dict[str, Optional[object]]:
    """Return a normalized dict of property metadata.

    Fields returned (examples):
      - address (str)
      - latitude (float), longitude (float)
      - size_sqft (int or None)
      - year_built (int or None)
      - age_years (int or None)
      - stories (int or None)
      - inferred_fuel (str)
      - has_pool (bool)
      - has_solar (bool)
      - tax_assessment (float or None)
      - description_text (str)

    The extractor tolerates missing fields and returns None where appropriate.
    """

    
    desc = _safe_get(prop, "description", default=None)
    #print("DESC", desc)
    raw_text = (getattr(desc, "text", None) or "").lower()

    # infer fuel
    fuel = "unknown"
    if "gas" in raw_text:
        fuel = "natural_gas"
    if "heat pump" in raw_text or "electric" in raw_text:
        fuel = "electric"

    # coordinates
    lat = _safe_get(prop, "latitude", default=None)
    lon = _safe_get(prop, "longitude", default=None)

    # size and age
    sqft = _safe_get(desc, "sqft", default=None)
    year_built = _safe_get(desc, "year_built", default=None)
    age = None
    if year_built:
        from datetime import date

        age = date.today().year - int(year_built)

    # Prefer explicit stories if available, otherwise infer from text.
    stories = _safe_get(desc, "stories", default=None)
    if stories:
        try:
            stories = int(stories)
        except Exception:
            stories = None
    
    tax = None
    tax_history = _safe_get(prop, "tax_history", default=None)
    if tax_history and len(tax_history) > 0:
        tax = _safe_get(tax_history[0], "tax_value", default=None)

    # Infer primary construction material from the description text using
    # simple keyword heuristics. This is best-effort and should be
    # treated as a hint rather than authoritative data.
    primary_material = "unknown"
    if "concrete" in raw_text:
        primary_material = "concrete"
    elif "brick" in raw_text or "masonry" in raw_text:
        primary_material = "brick"
    elif "stucco" in raw_text:
        # stucco is often applied over masonry or wood framing; mark as masonry
        primary_material = "masonry"
    elif "stone" in raw_text:
        primary_material = "stone"
    elif "steel" in raw_text or "metal" in raw_text:
        primary_material = "steel"
    elif "adobe" in raw_text:
        primary_material = "adobe"
    else:
        primary_material = "wood"  # default to wood if no other material is detected, as it's the most common

    metadata = {
        "address": _safe_get(prop, "address", "formatted_address", default=None) or _safe_get(prop, "address", default=None),
        "latitude": lat,
        "longitude": lon,
        "size_sqft": sqft,
        "year_built": year_built,
        "age_years": age,
        "stories": stories,
        "inferred_fuel": fuel,
        "has_pool": "pool" in raw_text,
        "has_solar": "solar" in raw_text,
        "tax_assessment": tax,
        "description_text": raw_text,
        "primary_material": primary_material,
    }

    #logger.debug("Extracted metadata: %s", metadata)
    print(f"Extracted metadata: {metadata}")
    return metadata
