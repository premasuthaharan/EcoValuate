"""Compute derived inputs and normalized features required for downstream formulas.

This module does NOT implement a final carbon formula; it prepares the
important inputs: normalized per-square-foot quantities, age buckets, and
simple flags used in many residential energy/carbon models.
"""
from typing import Dict, Any


def compute_derived_inputs(metadata: Dict[str, Any], climate: Dict[str, Any]) -> Dict[str, Any]:
    """Return a dict of derived inputs.

    Derived fields include:
      - hdd_per_sqft, cdd_per_sqft
      - age_bucket (new/mid/old)
      - has_pool, has_solar, inferred_fuel (passed through)
      - coords and original numeric fields for traceability
    """
    sqft = metadata.get("size_sqft") or None
    hdd = climate.get("annual_hdd")
    cdd = climate.get("annual_cdd")

    hdd_per_sqft = None
    cdd_per_sqft = None
    if sqft and sqft > 0:
        if isinstance(hdd, (int, float)):
            hdd_per_sqft = round(hdd / sqft, 4)
        if isinstance(cdd, (int, float)):
            cdd_per_sqft = round(cdd / sqft, 4)

    year_built = metadata.get("year_built")
    age = metadata.get("age_years")
    if age is None and year_built:
        try:
            from datetime import date

            age = date.today().year - int(year_built)
        except Exception:
            age = None

    age_bucket = None
    if age is not None:
        if age <= 20:
            age_bucket = "new"
        elif age <= 50:
            age_bucket = "mid"
        else:
            age_bucket = "old"

    derived = {
        "address": metadata.get("address"),
        "latitude": metadata.get("latitude"),
        "longitude": metadata.get("longitude"),
        "size_sqft": sqft,
        "year_built": year_built,
        "age_years": age,
        "age_bucket": age_bucket,
        "stories": metadata.get("stories"),
        "inferred_fuel": metadata.get("inferred_fuel"),
        "has_pool": metadata.get("has_pool"),
        "has_solar": metadata.get("has_solar"),
        "tax_assessment": metadata.get("tax_assessment"),
        "annual_hdd": hdd,
        "annual_cdd": cdd,
        "avg_temp": climate.get("avg_temp"),
        "hdd_per_sqft": hdd_per_sqft,
        "cdd_per_sqft": cdd_per_sqft,
    }

    return derived
