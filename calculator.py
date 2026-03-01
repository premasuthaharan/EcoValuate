"""Compute derived inputs and normalized features required for downstream formulas.

This module does NOT implement a final carbon formula; it prepares the
important inputs: normalized per-square-foot quantities, age buckets, and
simple flags used in many residential energy/carbon models.
"""

import requests
import pandas as pd
import os

from typing import Dict, Any
from homeharvest_client import scrape_property

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



def get_neighborhood_stats(zip_code):
    """
    Scrapes 'sold' properties in the same zip to find the average price per sqft.
    """
    comps = scrape_property(location=zip_code, listing_type="sold", past_days=365)
    
    # Filter out outliers (e.g., land or extreme luxury)
    valid_pps = comps[comps['price_per_sqft'] > 0]['price_per_sqft']
    
    return valid_pps.median()


def get_grid_intensity(zip_code: str) -> float:
    """
    Looks up the CO2 emission factor for a given ZIP code using eGRID data.
    """
    csv_path = "egrid.csv"
    
    # 1. Load the Emission Factor Data
    try:
        ef_df = pd.read_csv(csv_path)
        # Filter for CO2 air emissions
        co2_df = ef_df[(ef_df["FlowName"] == "CO2") & (ef_df["Context"] == "air")].copy()
        
        # Convert Value (typically lb/MWh or g/kWh) to kg/kWh
        # Note: Check your CSV units. If 'Value' is in lbs/MWh, divide by 2204.6
        # If 'Value' is in g/kWh, divide by 1000.
        co2_df["kgCO2_per_kWh"] = co2_df["Value"] / 1000 
    except Exception as e:
        print(f"Error loading eGRID CSV: {e}")
        return 0.371 # US Average Fallback

    # 2. Get Subregion from ZIP
    # In a full US-wide build, you'd load 'zip_to_egrid.csv' here.
    # For now, we use a logic-based mapper for major regions.
    subregion = lookup_subregion_by_zip(zip_code)
    
    if subregion:
        # Match against the 'Subregion' column in your eGRID CSV
        row = co2_df[co2_df["Subregion"] == subregion]
        if not row.empty:
            return float(row["kgCO2_per_kWh"].iloc[0])
            
    # 3. Fallback to US Average (eGRID 'US' or 'ENT' total)
    avg_row = co2_df[co2_df["Subregion"].isin(["US", "UUSA", "USA"])]
    if not avg_row.empty:
        return float(avg_row["kgCO2_per_kWh"].iloc[0])
        
    return 0.371 

def lookup_subregion_by_zip(zip_code: str) -> str:
    """
    A logic-based helper to map ZIP prefixes to eGRID subregions.
    This covers major US areas for 70-80% accuracy without a 40k-row table.
    """
    z = str(zip_code)[:3]
    
    # California (CAMX)
    if z.startswith(('90', '91', '92', '93', '94', '95')): return "CAMX"
    # New York City/Westchester (NYCW)
    if z in ['100', '101', '102', '104', '111', '112']: return "NYCW"
    # NYC Upstate (NYUP)
    if z.startswith(('12', '13', '14')): return "NYUP"
    # Texas (ERCT)
    if z.startswith(('75', '76', '77', '78', '79')): return "ERCT"
    # New England (NEWE)
    if z.startswith(('01', '02', '03', '04', '05')): return "NEWE"
    # Midwest / Chicago (RFCE)
    if z.startswith(('60', '61', '46')): return "RFCE"
    # Northwest (NWPP)
    if z.startswith(('97', '98', '99', '83')): return "NWPP"
    
    return None

def get_solar_potential(lat: float, lon: float) -> float:
    """
    Queries NREL PVWatts V8 to get annual kWh per kW installed.
    """
    
    api_key = "gODUxpC1JN1V6IFOJgTphT3Z84GKfa7lcpEaK05G" 
    url = f"https://developer.nrel.gov/api/pvwatts/v8.json?api_key={api_key}&lat={lat}&lon={lon}&system_capacity=1&azimuth=180&tilt=20&array_type=1&module_type=0&losses=14"
    
    try:
        response = requests.get(url, timeout=5)
        data = response.json()
        return data['outputs']['ac_annual']
    except:
        if lat < 35: return 1600.0
        return 1200.0

def get_transit_score(lat: float, lon: float) -> float:
    """
    Uses Overpass API (OpenStreetMap) to check for transit proximity.
    Returns a multiplier (0.85 to 1.0) to reduce transport emissions.
    """
    overpass_url = "http://overpass-api.de/api/interpreter"
    
    query = f"""
    [out:json];
    (
      node["highway"="bus_stop"](around:800,{lat},{lon});
      node["railway"="station"](around:800,{lat},{lon});
    );
    out count;
    """
    try:
        response = requests.post(overpass_url, data={'data': query}, timeout=5)
        count = int(response.json()['elements'][0]['tags']['total'])
        if count > 5: return 0.85 # Highly walkable/transit-rich
        if count > 0: return 0.95 # Moderate access
        return 1.0 # Car dependent
    except:
        return 1.0


def estimate_carbon_footprint(metadata: Dict[str, Any], climate: Dict[str, Any], derived: Dict[str, Any]):
    """
    Consolidates metadata, climate, and derived metrics into a final 
    CO2 tonnage and a normalized Eco-Score (0-100).
    """
    # 1. Physical Efficiency Multipliers
    age_mult = 1.3 if (metadata.get('age_years') and metadata['age_years'] > 45) else 1.0
    story_mult = 1.15 if derived.get('stories') == 1 else 0.90
    
    # Apply Retrofit Credits (derived from inferences or user input)
    # Insulation reduces heating demand by ~15%, Triple Pane by ~10%
    insulation_credit = 0.85 if derived.get("insulation") and derived["insulation"] > 0.6 else 1.0
    window_credit = 0.90 if derived.get("triple_windows") and derived["triple_windows"] > 0.5 else 1.0

    # 2. Thermal Energy Demand (BTUs)
    # Formula uses sqft, HDD/CDD, and the structural multipliers
    base_sqft = metadata.get('size_sqft', 2000) # Default to 2k if missing
    heat_btu = base_sqft * climate['annual_hdd'] * 18 * age_mult * story_mult * insulation_credit * window_credit
    cool_btu = base_sqft * climate['annual_cdd'] * 12 * age_mult * story_mult * window_credit

    # 3. Emissions Conversion
    # Use the local grid intensity fetched earlier (kg CO2 / kWh)
    grid_factor = derived.get("grid_intensity", 0.371) 
    total_kg = 0

    if derived.get("inferred_fuel") == "natural_gas":
        total_kg += (heat_btu / 1000) * 0.053 # Gas heating
        total_kg += (cool_btu / 3412) * grid_factor # Electric cooling
    else:
        # All-Electric (Assume Heat Pump COP of 3.0)
        total_kg += ((heat_btu + cool_btu) / (3412 * 3.0)) * grid_factor

    # 4. Lifestyle Layers (Baseload + Transport)
    # Average US household baseload (appliances/lights) ~ 3000 kg
    # Average US transport ~ 4500 kg (adjusted by our OSM Transit Multiplier)
    baseload_kg = 3000 
    transport_kg = 4500 * derived.get("transit_multiplier", 1.0)
    
    total_annual_tons = (total_kg + baseload_kg + transport_kg) / 1000

    # 5. Scoring Logic (Intensity Based)
    # We score based on kg CO2 per sqft to be fair to different house sizes
    intensity = (total_kg + baseload_kg) / base_sqft
    
    # Benchmarks for Score (kg/sqft)
    # 1.5 = Elite (Solar + Heat Pump), 15.0 = Poor (Old + Oil/Gas + Dirty Grid)
    score = 100 * (15.0 - intensity) / (15.0 - 1.5)
    final_score = max(0, min(100, round(score)))

    return {
        "address": metadata.get("address"),
        "eco_score": final_score,
        "estimated_annual_tons": round(total_annual_tons, 2),
        "carbon_intensity": round(intensity, 2), # kg/sqft
        "breakdown": {
            "thermal_emissions_tons": round(total_kg / 1000, 2),
            "transport_emissions_tons": round(transport_kg / 1000, 2),
            "grid_cleanliness_kg_kwh": grid_factor
        },
        "solar_preview": {
            "potential_kwh_year": round(derived.get("solar_yield_per_kw", 1200) * 5),
            "offset_percentage": round(((derived.get("solar_yield_per_kw", 1200) * 5) / ((total_kg / grid_factor) + (baseload_kg / grid_factor))) * 100)
        }
    }