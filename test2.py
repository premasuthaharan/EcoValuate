import requests
import pandas as pd
from datetime import datetime, timedelta

def get_climate_metrics(lat, lon, years_back=1):
    """
    Fetches historical weather and calculates annual HDD and CDD.
    Base temperature: 65°F (18.3°C)
    """
    end_date = datetime.now().date() - timedelta(days=2) # Archive has a 2-day lag
    start_date = end_date - timedelta(days=365 * years_back)
    
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date.strftime("%Y-%m-%d"),
        "end_date": end_date.strftime("%Y-%m-%d"),
        "daily": "temperature_2m_mean",
        "temperature_unit": "fahrenheit",
        "timezone": "auto"
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if "daily" not in data:
        return {"error": "Could not fetch weather data"}

    df = pd.DataFrame({
        "date": data["daily"]["time"],
        "temp": data["daily"]["temperature_2m_mean"]
    })

    # Standard residential base temperature is 65°F
    base_temp = 65.0
    
    # Calculate Degree Days
    # HDD: Degrees BELOW 65 (Heating needed)
    # CDD: Degrees ABOVE 65 (Cooling needed)
    df['HDD'] = df['temp'].apply(lambda x: max(0, base_temp - x))
    df['CDD'] = df['temp'].apply(lambda x: max(0, x - base_temp))
    
    return {
        "annual_hdd": round(df['HDD'].sum()),
        "annual_cdd": round(df['CDD'].sum()),
        "avg_temp": round(df['temp'].mean(), 1)
    }

# Example integration with your HomeHarvest metadata
# carbon_data = extract_carbon_metadata(house)
# climate = get_climate_metrics(carbon_data['lat_long'][0], carbon_data['lat_long'][1])
# print(f"Climate Profile: {climate['annual_hdd']} HDD / {climate['annual_cdd']} CDD")