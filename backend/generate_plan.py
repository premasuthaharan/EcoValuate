import dotenv
import os
from google import genai
import json
import math
from typing import Dict, Any, List, Optional
from calculator import estimate_carbon_footprint

try:
    from google import genai
except Exception:
    genai = None

dotenv.load_dotenv()  # loads variables from .env into environment

# Initialize client if genai is available; otherwise plan generation still works
client = genai.Client() if genai is not None else None

# Allowed renovation ideas (fixed list - do not extend)
ALLOWED_RENOVATIONS: List[str] = [
    "Air sealing",
    "Solar panels",
    "Heat-pump water heaters",
    "Space heating and cooling",
    "Electric heat-pump clothes dryer",
    "Induction stoves",
    "Battery storage",
    "Upgrade to modern, high-performance insulation",
    "Install high-performance windows",
    "Add sustainable flooring (eg bamboo, cork, reclaimed hardwood)",
    "Install low-flow toilets, shower heads, and faucets",
    "Replace lightbulbs with LED lights",
    "Install an energy-efficient roof (reflective coatings, tiles, shingles)",
    "Switch to energy-efficient appliances (especially fridge+laundry)",
    "Smart thermostat",
]

SUSTAINABILITY_EXTRAS = [
    'Low-flow fixtures (toilet, faucets, shower-heads)',
    'Non-toxic paints/finishes',
    'Compost bin',
    'Plant native plants that are drought-resistant',
    'Plant a well-placed tree that naturally provides shade'
]

# Baseline profiles (MVP defaults). Costs are approximate median USD; reductions in kgCO2e/year.
# These are deterministic defaults used by the planner; the LLM is only used for narrative.
ACTION_PROFILES: Dict[str, Dict[str, Any]] = {
    "Air sealing": {"cost": 1500, "annual_co2_reduction": 200, "payback_years": 3, "install_days": 1},
    "Solar panels": {"cost": 18000, "annual_co2_reduction": 3000, "payback_years": 8, "install_days": 10},
    "Heat-pump water heaters": {"cost": 6000, "annual_co2_reduction": 800, "payback_years": 5, "install_days": 2},
    "Space heating and cooling": {"cost": 12000, "annual_co2_reduction": 2500, "payback_years": 7, "install_days": 5},
    "Electric heat-pump clothes dryer": {"cost": 1200, "annual_co2_reduction": 150, "payback_years": 4, "install_days": 1},
    "Induction stoves": {"cost": 1200, "annual_co2_reduction": 50, "payback_years": 8, "install_days": 1},
    "Battery storage": {"cost": 8000, "annual_co2_reduction": 200, "payback_years": 20, "install_days": 2},
    "Upgrade to modern, high-performance insulation": {"cost": 8000, "annual_co2_reduction": 1800, "payback_years": 6, "install_days": 4},
    "Install high-performance windows": {"cost": 10000, "annual_co2_reduction": 900, "payback_years": 10, "install_days": 5},
    "Add sustainable flooring (eg bamboo, cork, reclaimed hardwood)": {"cost": 6000, "annual_co2_reduction": 10, "payback_years": 50, "install_days": 7},
    "Install low-flow toilets, shower heads, and faucets": {"cost": 800, "annual_co2_reduction": 20, "payback_years": 30, "install_days": 1},
    "Replace lightbulbs with LED lights": {"cost": 200, "annual_co2_reduction": 40, "payback_years": 1, "install_days": 1},
    "Install an energy-efficient roof (reflective coatings, tiles, shingles)": {"cost": 12000, "annual_co2_reduction": 300, "payback_years": 25, "install_days": 7},
    "Switch to energy-efficient appliances (especially fridge+laundry)": {"cost": 3000, "annual_co2_reduction": 400, "payback_years": 6, "install_days": 1},
    "Smart thermostat": {"cost": 300, "annual_co2_reduction": 60, "payback_years": 2, "install_days": 1},
}


def _estimate_for_action(action: str, size_sqft: Optional[float]) -> Dict[str, Any]:
    """Return an estimate for cost, annual CO2 reduction and payback.

    Scaling: for a few actions (insulation, windows, solar) scale cost by house size.
    """
    profile = ACTION_PROFILES.get(action)
    if not profile:
        raise ValueError(f"Action not recognized: {action}")

    base_cost = profile["cost"]
    base_co2 = profile["annual_co2_reduction"]
    payback = profile["payback_years"]

    # Scale certain items roughly by sqft
    if size_sqft and action in {
        "Upgrade to modern, high-performance insulation",
        "Install high-performance windows",
        "Solar panels",
        "Install an energy-efficient roof (reflective coatings, tiles, shingles)",
    }:
        # normalization factor: assume 2000 sqft baseline
        factor = float(size_sqft) / 2000.0
        cost = int(round(base_cost * factor))
        annual_co2 = int(round(base_co2 * factor))
    else:
        cost = int(base_cost)
        annual_co2 = int(base_co2)

    # Estimate install duration (days). Some actions scale with house size.
    base_install_days = float(profile.get("install_days", 0.0))
    if size_sqft and action in {
        "Upgrade to modern, high-performance insulation",
        "Install high-performance windows",
        "Solar panels",
        "Install an energy-efficient roof (reflective coatings, tiles, shingles)",
    }:
        est_days = base_install_days * factor
    else:
        est_days = base_install_days

    # Ensure integer days, minimum 1 day
    estimated_install_days = int(max(1, math.ceil(est_days)))

    return {
        "action": action,
        "estimated_cost": cost,
        "annual_co2_reduction": annual_co2,
        "payback_years": payback,
        "estimated_install_days": estimated_install_days,
    }


def _score_action_for_plan(action_est: Dict[str, Any], plan_type: str) -> float:
    """Return a numeric score used to rank actions depending on plan_type.

    - fastest_payback: prioritize shorter payback and lower absolute cost
    - max_co2_reduction: prioritize high annual_co2_reduction per dollar
    - balanced: a weighted combination
    """
    cost = action_est["estimated_cost"]
    co2 = action_est["annual_co2_reduction"]
    payback = action_est["payback_years"]

    if plan_type == "fastest payback":
        # lower payback better, also lower cost favored
        return - (payback * 1.0 + cost / 10000.0)
    if plan_type == "max co2 reduction":
        # maximize CO2 per dollar
        return (co2 / max(1, cost))
    # balanced
    return (co2 / max(1, cost)) - (payback / 10.0)


def update_carbon_score(
    carbon_score: float,
    total_annual_co2_reduction: float,
    score_type: str = "kg",
    baseline_annual_co2: Optional[float] = None,
) -> Dict[str, Any]:
    """Update a carbon score after applying annual CO2 reductions.

    Parameters
    - carbon_score: the original carbon score. Interpretation depends on score_type.
    - total_annual_co2_reduction: kg CO2e/year reduced by the plan.
    - score_type: 'kg' (default) means carbon_score is in kg CO2e/year. If 'index',
      carbon_score is a 0-100 index and baseline_annual_co2 (kg/yr) must be provided
      to map index -> kg and back.

    Returns a dict with updated_score, percent_reduction, and (when relevant)
    updated_annual_kg.
    """
    if score_type == "kg":
        current_kg = float(carbon_score)
        new_kg = max(0.0, current_kg - float(total_annual_co2_reduction))
        percent = (float(total_annual_co2_reduction) / current_kg * 100.0) if current_kg > 0 else None
        return {
            "updated_score": round(new_kg, 1),
            "score_type": "kg",
            "updated_annual_kg": round(new_kg, 1),
            "percent_reduction": round(percent, 1) if percent is not None else None,
        }
    elif score_type == "index":
        if baseline_annual_co2 is None:
            raise ValueError("baseline_annual_co2 is required when score_type='index'")
        # Map index (0-100) -> kg using baseline, subtract reductions, map back
        current_kg = (float(carbon_score) / 100.0) * float(baseline_annual_co2)
        new_kg = max(0.0, current_kg - float(total_annual_co2_reduction))
        new_index = (new_kg / float(baseline_annual_co2)) * 100.0 if baseline_annual_co2 > 0 else None
        percent = ((current_kg - new_kg) / current_kg * 100.0) if current_kg > 0 else None
        return {
            "updated_score": round(new_index, 1) if new_index is not None else None,
            "score_type": "index",
            "updated_annual_kg": round(new_kg, 1),
            "percent_reduction": round(percent, 1) if percent is not None else None,
        }
    else:
        raise ValueError("score_type must be 'kg' or 'index'")


def generate_renovation_plan(
    carbon_score: float,
    budget_usd: float,
    time_horizon_years: int,
    plan_type: str,
    size_sqft: Optional[float] = None,
    carbon_score_type: str = "kg",
    baseline_annual_co2: Optional[float] = None,
    metadata: Optional[Dict[str, Any]] = None,
    climate: Optional[Dict[str, Any]] = None,
    derived: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Generate a renovation plan (JSON) constrained to the allowed actions.

    The planner uses deterministic local heuristics (ACTION_PROFILES).
    The LLM may be used only to produce a friendly rationale; numeric
    estimates are computed locally so the model cannot invent actions or
    numbers.

    plan_type must be one of: 'fastest payback', 'max co2 reduction', 'balanced'
    """
    plan_type = plan_type.lower()
    if plan_type not in {"fastest payback", "max co2 reduction", "balanced"}:
        raise ValueError("plan_type must be one of: 'fastest payback', 'max co2 reduction', 'balanced'")

    # Build estimates for all allowed actions
    candidates: List[Dict[str, Any]] = []
    for action in ALLOWED_RENOVATIONS:
        est = _estimate_for_action(action, size_sqft)
        est["score"] = _score_action_for_plan(est, plan_type)
        est["cost_effectiveness"] = round(est["annual_co2_reduction"] / max(1, est["estimated_cost"]), 6)
        candidates.append(est)

    # Sort candidates by plan-specific score descending
    candidates.sort(key=lambda x: x["score"], reverse=True)

    selected: List[Dict[str, Any]] = []
    remaining_budget = float(budget_usd)

    # Greedy selection until budget exhausted or no positive-scoring actions
    for c in candidates:
        if c["estimated_cost"] <= remaining_budget and c["annual_co2_reduction"] > 0:
            selected.append({
                "action": c["action"],
                "estimated_cost": c["estimated_cost"],
                "annual_co2_reduction": c["annual_co2_reduction"],
                "payback_years": c["payback_years"],
                "cost_effectiveness": c["cost_effectiveness"],
                "estimated_install_days": c.get("estimated_install_days", 0.0),
                "install_days": c.get("install_days", 0.0)
            })
            remaining_budget -= c["estimated_cost"]

    total_cost = sum(x["estimated_cost"] for x in selected)
    total_annual_co2 = sum(x["annual_co2_reduction"] for x in selected)
    total_install_days = int(sum(x.get("estimated_install_days", 0) for x in selected))
    # Compute cumulative CO2 mitigation over the user's time horizon and a trees planted equivalent.
    TREE_SEQUESTRATION_KG_PER_YEAR = 22.0
    cumulative_co2 = total_annual_co2 * float(time_horizon_years)
    # Trees planted over the horizon = cumulative_co2 / (kg_per_tree * years)
    equivalent_trees = round(cumulative_co2 / (TREE_SEQUESTRATION_KG_PER_YEAR * float(time_horizon_years)), 1) if cumulative_co2 > 0 else 0.0

    plan: Dict[str, Any] = {
        "carbon_score": carbon_score,
        "budget_usd": budget_usd,
        "time_horizon_years": time_horizon_years,
        "plan_type": plan_type,
        "size_sqft": size_sqft,
        "selected_actions": selected,
        "total_estimated_cost": total_cost,
        "total_estimated_annual_co2_reduction": total_annual_co2,
        "total_estimated_install_days": total_install_days,
        "cumulative_estimated_co2_reduction": cumulative_co2,
        "equivalent_trees": equivalent_trees,
        "tree_sequestration_kg_per_year": TREE_SEQUESTRATION_KG_PER_YEAR,
        "remaining_budget": remaining_budget,
    }
    # Update carbon score according to supplied type or using estimate_carbon_footprint
    try:
        if metadata is not None and climate is not None and derived is not None:
            # Use calculator.estimate_carbon_footprint to compute baseline and then
            # reduce the baseline by the deterministic annual CO2 reductions.
            baseline_fp = estimate_carbon_footprint(metadata, climate, derived)
            baseline_annual_tons = float(baseline_fp.get("estimated_annual_tons", 0.0))
            baseline_total_kg = baseline_annual_tons * 1000.0

            new_total_kg = max(0.0, baseline_total_kg - float(total_annual_co2))
            new_annual_tons = new_total_kg / 1000.0

            # Scale intensity proportionally to total emissions (simple but consistent)
            baseline_intensity = float(baseline_fp.get("carbon_intensity", 0.0))
            new_intensity = baseline_intensity
            if baseline_total_kg > 0:
                new_intensity = baseline_intensity * (new_total_kg / baseline_total_kg)

            # Same scoring formula as calculator.estimate_carbon_footprint
            score = 100 * (15.0 - new_intensity) / (15.0 - 1.5)
            new_score = max(0, min(100, round(score)))

            plan["carbon_score_update"] = {
                "baseline_estimated_annual_tons": round(baseline_annual_tons, 3),
                "baseline_eco_score": baseline_fp.get("eco_score"),
                "updated_estimated_annual_tons": round(new_annual_tons, 3),
                "updated_eco_score": new_score,
                "total_annual_co2_reduction": total_annual_co2,
                "percent_reduction": round(((baseline_total_kg - new_total_kg) / baseline_total_kg * 100.0), 2) if baseline_total_kg > 0 else None,
            }
        else:
            # Fallback: use the simpler update_carbon_score arithmetic
            score_update = update_carbon_score(
                carbon_score,
                total_annual_co2,
                score_type=carbon_score_type,
                baseline_annual_co2=baseline_annual_co2,
            )
            plan["carbon_score_update"] = score_update
    except Exception as e:
        plan["carbon_score_update_error"] = str(e)

    # Call the LLM to produce a short rationale, but DO NOT let it
    # invent new renovation actions or numbers. We provide the selected actions
    # and their deterministic estimates for the LLM to summarize, suggest next steps, 
    # and edit based on user's feedback.
    if client is not None:
        try:
            prompt = (
                "You are given a renovation plan (JSON). "
                "Do NOT add or invent renovation options; only use the provided list. "
                "Turn the list into into a plan across the time horizon that the user inputted, and organize the renovations in a logical order (eg cheaper/quick ones first, but use your judgement). "
                "Estimate the plan based on the number of days each action takes to install, which is already provided. Space out the renovations so that they are not back to back."
                "Produce a short friendly rationale (2-4 sentences) explaining why these actions were selected for the user, and a bullet of suggested next steps. "
                "Include one action from the 'Sustainability Extras' list that would complement the selected renovations and further enhance the home's sustainability, even if it doesn't directly reduce CO2."
                "Can you format the plan into 3 sections: Plan Summary, Next Steps, and Sustainability Extra? You don't need a separate rationale section. "
                "Also provide the CO2 reduced over the user's time horizon, as well as an equivalent number of trees planted and growing over that time (use the already calculated values). Do this in the plan summary section."
                "Input JSON:\n" + json.dumps(plan, indent=2)
            )
            resp = client.models.generate_content(model=os.environ.get("GEMINI_MODEL", "gemini-2.5-flash"), contents=prompt)
            # genai client may return different shapes; prefer text attribute
            rationale = getattr(resp, "text", None) or (resp.get("candidates", [{}])[0].get("output") if isinstance(resp, dict) else None)
            plan["rationale"] = rationale
        except Exception as e:
            plan["rationale_error"] = str(e)

    return plan

'''
if __name__ == "__main__":
    # Simple demo
    demo = generate_renovation_plan(
        carbon_score=90.0,
        budget_usd=10000,
        time_horizon_years=5,
        plan_type="max co2 reduction",
        size_sqft=2000,
    )
    print(json.dumps(demo, indent=2))
'''