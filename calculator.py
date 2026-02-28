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

    derived = {
        "address": metadata.get("address"),
        "latitude": metadata.get("latitude"),
        "longitude": metadata.get("longitude"),
        "size_sqft": sqft,
        "year_built": year_built,
        "age_years": age,
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

def estimate_carbon_footprint(metadata, climate):
    """
    metadata: dict from extract_carbon_metadata (sqft, stories, age, etc.)
    climate: dict from get_climate_metrics (annual_hdd, annual_cdd)
    """
    # 1. Base Energy Intensity (BTU per sqft per Degree Day)
    # Older homes (pre-1980) have higher intensity due to poor insulation
    age_multiplier = 1.3 if (metadata['age_years'] and metadata['age_years'] > 45) else 1.0
    
    # Surface-to-Volume Adjustment (Stories)
    # More stories = more efficient 'cube' shape
    story_multiplier = 1.0
    if metadata['stories']:
        if metadata['stories'] == 1: story_multiplier = 1.15 # Less efficient
        if metadata['stories'] >= 2: story_multiplier = 0.90 # More efficient
    
    # 2. Estimate Energy Consumption
    # Heating Load (Approx 15-20 BTU per sqft per HDD)
    heat_btu = metadata['size_sqft'] * climate['annual_hdd'] * 18 * age_multiplier * story_multiplier
    
    # Cooling Load (Approx 10-15 BTU per sqft per CDD)
    cool_btu = metadata['size_sqft'] * climate['annual_cdd'] * 12 * age_multiplier * story_multiplier
    
    # 3. Convert to Carbon (Metric Tons CO2e)
    # EPA Factors: 
    # Natural Gas: 0.053 kg CO2 per cubic foot (approx 1000 BTU)
    # Electricity: ~0.4 kg CO2 per kWh (US Average)
    
    total_tons = 0
    
    if metadata['inferred_fuel'] == "natural_gas":
        # Heating via Gas
        total_tons += (heat_btu / 1000) * 0.000053 
        # Cooling via Electricity (Convert BTU to kWh: 3412 BTU = 1 kWh)
        total_tons += (cool_btu / 3412) * 0.0004
    else:
        # Assume All-Electric (Heat Pump)
        # Heat pumps are ~300% efficient, so we divide thermal load by 3
        total_tons += ((heat_btu + cool_btu) / (3412 * 3)) * 0.0004
        
    # 4. Add Baseload (Appliances/Lighting/Water)
    # Average US home baseload is ~4-6 tons CO2/year
    total_tons += 5.0 
    
    return {
        "estimated_annual_tons": round(total_tons, 2),
        "confidence_score": "Medium (Inferred Fuel)" if metadata['inferred_fuel'] == "unknown" else "High",
        "primary_driver": "Heating" if climate['annual_hdd'] > climate['annual_cdd'] else "Cooling"
    }

# Usage:
# footprint = estimate_carbon_footprint(carbon_data, climate)
# print(f"This house emits approximately {footprint['estimated_annual_tons']} metric tons of CO2 per year.")


def calculate_size_adjusted_score(total_tons, sqft):
    """
    Calculates an Eco-Score based on Carbon Intensity (kg CO2 per sqft).
    Normalizes performance regardless of whether the house is a mansion or a studio.
    """
    if not sqft or sqft == 0:
        return 0
        
    # Convert metric tons to kg
    total_kg = total_tons * 1000
    kg_per_sqft = total_kg / sqft
    
    # Benchmarks (kg CO2 / sqft / year)
    target_intensity = 1.5   # High-efficiency/Solar goal
    floor_intensity = 15.0   # Extremely inefficient baseline
    
    if kg_per_sqft <= target_intensity:
        return 100
    if kg_per_sqft >= floor_intensity:
        return 0
        
    # Scoring calculation (Lower intensity = Higher score)
    score = 100 * (floor_intensity - kg_per_sqft) / (floor_intensity - target_intensity)
    
    return {
        "eco_score": round(score),
        "intensity": round(kg_per_sqft, 2), # kg CO2/sqft
        "label": get_efficiency_label(score)
    }

def get_efficiency_label(score):
    if score >= 90: return "Ultra-Efficient"
    if score >= 70: return "Modern Standard"
    if score >= 40: return "Standard Efficiency"
    return "High Intensity"