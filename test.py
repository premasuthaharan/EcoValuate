from homeharvest import scrape_property
import pandas as pd

# 1. Target the specific address
# 2. Set extra_property_data=True to get the 'Tax Information' and 'Building Details'
# 3. Use return_type="pydantic" for easier data extraction from nested fields
properties = scrape_property(
    location="1176 Hanchett Ave, San Jose, CA 95126",
    extra_property_data=True, 
    return_type="pydantic" 
)

# Grab the first match (the specific house)
house = properties[0]

def extract_carbon_metadata(property_obj):
    # description is a separate nested model in HomeHarvest
    desc = property_obj.description
    
    # Keyword search for fuel types
    raw_text = desc.text.lower() if desc.text else ""
    fuel_type = "unknown"
    if "gas" in raw_text: fuel_type = "natural_gas"
    if "heat pump" in raw_text or "electric" in raw_text: fuel_type = "electric"
    
    return {
        "address": property_obj.address.formatted_address,
        # FIX: Access latitude and longitude directly from property_obj
        "lat_long": (property_obj.latitude, property_obj.longitude),
        "size_sqft": desc.sqft,
        "age_years": 2026 - desc.year_built if desc.year_built else None, # Updated to 2026
        "stories": desc.stories,
        "inferred_fuel": fuel_type,
        "has_pool": "pool" in raw_text,
        "has_solar": "solar" in raw_text,
        # Ensure tax_history exists before accessing
        "tax_assessment": property_obj.tax_history[0].tax_value if property_obj.tax_history else None
    }

# Usage
carbon_data = extract_carbon_metadata(house)

print(carbon_data)


