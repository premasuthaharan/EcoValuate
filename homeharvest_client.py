"""Wrapper around HomeHarvest scraping functionality.

Provides a small, testable function to scrape a property by address and
return the pydantic model objects (or raise a clear exception).
"""
from typing import List, Any
#import logging

try:
    from homeharvest import scrape_property
except Exception:  # pragma: no cover - optional dependency in some environments
    scrape_property = None

#logger = logging.getLogger(__name__)


def scrape_address(address: str, extra_property_data: bool = True, return_type: str = "pydantic") -> List[Any]:
    """Scrape a property using HomeHarvest.

    Returns a list of property models (pydantic objects) on success.
    Raises RuntimeError with a helpful message if scraping fails or HomeHarvest
    isn't installed.
    """
    if scrape_property is None:
        raise RuntimeError("homeharvest is not installed or could not be imported")

    #logger.info("Scraping address: %s", address)
    print(f"Scraping address: {address}")
    props = scrape_property(location=address, extra_property_data=extra_property_data, return_type=return_type)

    if not props:
        raise RuntimeError(f"No properties returned for address: {address}")

    return props
