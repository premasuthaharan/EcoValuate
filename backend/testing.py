import requests
import json

BASE_URL = "http://127.0.0.1:2000"

TEST_ADDRESS = "22 Modesto, Irvine, CA 92602"


def test_load():
    print("\n--- Testing /api/load ---")
    
    response = requests.post(
        f"{BASE_URL}/api/load",
        json={"address": TEST_ADDRESS}
    )
    
    print("Status:", response.status_code)
    print("Response:", response.json())
    
    if response.status_code != 200:
        raise Exception("Load endpoint failed")
    
    return response.json()["data"]


def test_estimate(home_data):
    print("\n--- Testing /api/estimate ---")
    
    response = requests.post(
        f"{BASE_URL}/api/estimate",
        json={"home_data": home_data}
    )
    
    print("Status:", response.status_code)
    print("Response:", response.json())
    
    if response.status_code != 200:
        raise Exception("Estimate endpoint failed")
    
    return response.json()["data"]


def test_plan(home_data):
    print("\n--- Testing /api/plan ---")
    
    response = requests.post(
        f"{BASE_URL}/api/plan",
        json={
            "budget": 15000,
            "horizon": 5,
            "plan_type": "balanced",
            "home_data": home_data
        }
    )
    
    print("Status:", response.status_code)
    print("Response:", response.json())
    
    if response.status_code != 200:
        raise Exception("Plan endpoint failed")
    
    return response.json()["plan"]


if __name__ == "__main__":
    try:
        # Step 1: Load property data
        home_data = test_load()

        # Step 2: Estimate carbon footprint
        estimate_data = test_estimate(home_data)

        # Optionally merge eco_score into home_data if required
        if "eco_score" in estimate_data:
            home_data["eco_score"] = estimate_data["eco_score"]

        # Step 3: Generate renovation plan
        plan = test_plan(home_data)

        print("\n✅ All endpoints working correctly!")

    except Exception as e:
        print("\n❌ Test failed:", str(e))