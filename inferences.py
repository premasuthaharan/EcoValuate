""" Infers the field values that are still None even after scraping and user input"""

def estimate_fuel_mix(year_built, state):

    # Base probabilities by era (national average baseline)
    if year_built < 1960:
        base = {"gas": 0.50, "electric": 0.20, "oil": 0.30}
    elif year_built < 1978:
        base = {"gas": 0.55, "electric": 0.25, "oil": 0.20}
    elif year_built < 2000:
        base = {"gas": 0.60, "electric": 0.30, "oil": 0.10}
    elif year_built < 2010:
        base = {"gas": 0.58, "electric": 0.37, "oil": 0.05}
    elif year_built < 2019:
        base = {"gas": 0.52, "electric": 0.45, "oil": 0.03}
    else:
        base = {"gas": 0.40, "electric": 0.58, "oil": 0.02}
    
    # Regional adjustments
    NORTHEAST = ["NY","NJ","MA","PA","CT","RI","VT","NH","ME"]
    MIDWEST   = ["IL","OH","MI","MN","WI","IN","MO","IA","KS","NE","ND","SD"]
    SOUTH     = ["TX","FL","GA","NC","SC","AL","MS","TN","KY","LA","AR","OK","VA","WV"]
    WEST      = ["CA","WA","OR","NV","AZ","CO","UT","NM","ID","MT","WY"]
    
    adjustment = {"gas": 0, "electric": 0, "oil": 0}
    
    if state in NORTHEAST:
        adjustment = {"gas": +0.05, "electric": -0.05, "oil": +0.05}
    elif state in MIDWEST:
        adjustment = {"gas": +0.10, "electric": -0.08, "oil": -0.02}
    elif state in SOUTH:
        adjustment = {"gas": -0.10, "electric": +0.10, "oil": 0}
    elif state in WEST:
        adjustment = {"gas": -0.05, "electric": +0.08, "oil": -0.03}
    
    # Apply adjustments
    fuel_mix = {
        k: max(min(base[k] + adjustment[k], 1), 0)
        for k in base
    }
    
    # Normalize to ensure total = 1
    total = sum(fuel_mix.values())
    fuel_mix = {k: v/total for k, v in fuel_mix.items()}
    
    return fuel_mix