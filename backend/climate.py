"""Climate utilities to compute HDD/CDD and simple climate summary.

This ports and improves the code in `test2.py` to be a reusable function.
"""
from datetime import datetime, timedelta
from typing import Dict, Any
#import logging

import requests
import pandas as pd

#logger = logging.getLogger(__name__)


def get_climate_metrics(lat: float, lon: float, years_back: int = 1) -> Dict[str, Any]:
    """Fetch historical daily mean temperature from open-meteo archive and
    compute annual Heating Degree Days (HDD) and Cooling Degree Days (CDD).

    Returns a dict with keys: annual_hdd, annual_cdd, avg_temp and optionally
    error.
    """
    if lat is None or lon is None:
        return {"error": "Missing coordinates"}

    end_date = datetime.now().date() - timedelta(days=2)  # API archive lag
    start_date = end_date - timedelta(days=365 * years_back)

    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date.strftime("%Y-%m-%d"),
        "end_date": end_date.strftime("%Y-%m-%d"),
        "daily": "temperature_2m_mean",
        "temperature_unit": "fahrenheit",
        "timezone": "auto",
    }

    try:
        resp = requests.get(url, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        # logger.exception("Weather API error")
        return {"error": f"Weather API error: {e}"}

    if "daily" not in data or "temperature_2m_mean" not in data.get("daily", {}):
        return {"error": "Unexpected weather response"}

    df = pd.DataFrame({
        "date": data["daily"]["time"],
        "temp": data["daily"]["temperature_2m_mean"],
    })

    base_temp = 65.0
    df["HDD"] = df["temp"].apply(lambda x: max(0, base_temp - x))
    df["CDD"] = df["temp"].apply(lambda x: max(0, x - base_temp))

    return {
        "annual_hdd": int(round(df["HDD"].sum())),
        "annual_cdd": int(round(df["CDD"].sum())),
        "avg_temp": round(df["temp"].mean(), 1),
    }
