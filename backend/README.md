## POST /api/load
Get home metadata from an address

#### Request Body

{
    "address": "123 Main St, Irvine, CA"
}

#### Response (200):

{
    "status": "success",
    "data": {
       "home_data": {"metadata": {}, "climate": {}, "derived": {}}
    }
}

#### Error Responses:

400: Missing address parameter
404: Property not found
500: Internal calculation error

## POST /api/estimate  
Estimate home sustainability metrics from home metadata.

#### Request Body:

{
  "home_data": {"metadata": {}, "climate": {}, "derived": {}}  # full output from workflow
}

#### Response (200):

{
  "status": "success",
  "data": {
    /* eco_score, climate, derived, etc. */
  }
}

#### Error Responses:

400: Missing parameter  
404: Property not found  
500: Internal calculation error  


## POST /api/plan  
Generate a renovation plan based on budget, time horizon, and home data.

#### Request Body:

{
  "budget": 15000,
  "horizon": 5,
  "plan_type": "balanced"
  "home_data": {"metadata": {}, "climate": {}, "derived": {}}  # full output from workflow
}

#### Response (200):

{
  "status": "success",
  "plan": {
    /* recommended upgrades, projected savings, eco score improvements, etc. */
  }
}

#### Error Responses:

500: Planner generation error