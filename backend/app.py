from flask import Flask, request, jsonify
from workflow import run_workflow
import traceback
from flask_cors import CORS
from generate_plan import generate_renovation_plan
from calculator import estimate_carbon_footprint

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "API is running"

@app.route('/api/load', methods=['POST'])
def get_metadata():
    """
    Endpoint to recieve a JSON body: {"address": "123 Main St, City, State"}
    Returns the metadata, climate, and derived data
    """
    address = request.get_json().get('address')
    try:
        result = run_workflow(address)
        return jsonify({
            "status": "success",
            "data": result
        }), 200
    except Exception as e:
        print(f"Workflow Error: {traceback.format_exc()}")
        return jsonify({
            "error": "An internal error occurred during workflow execution."
        }), 500

@app.route('/api/estimate', methods=['POST'])
def get_footprint():
    """
    Endpoint to receive a JSON body:
    Body: {
        "home_data": {metadata: {}, climate: {}, derived: {}}  # full output from workflow
    }
    """
    data = request.get_json()
    # print(data.keys())
    meta = data['home_data']['metadata']
    climate = data['home_data']['climate']
    derived = data['home_data']['derived']
    try:
        result = estimate_carbon_footprint(meta, climate, derived)
        return jsonify({
            "status": "success",
            "data": result
        }), 200

    except IndexError:
        return jsonify({"error": "Property not found. Try a more specific address."}), 404
    except Exception as e:
        print(f"Workflow Error: {traceback.format_exc()}")
        return jsonify({"error": "An internal error occurred during calculation."}), 500

@app.route('/api/plan', methods=['POST'])
def get_plan():
    """
    New Endpoint: Receives user constraints and home data to build a plan.
    Body: {
        "budget": 15000,
        "horizon": 5,
        "plan_type": "balanced",
        "home_data": {metadata: {}, climate: {}, derived: {}}  # full output from workflow
    }
    """
    data = request.get_json()
    
    try:
        full_house_data = data.get('home_data')
        metadata = full_house_data.get('metadata')
        climate = full_house_data.get('climate')
        derived = full_house_data.get('derived')

        plan = generate_renovation_plan(
            carbon_score=full_house_data['eco_score'],
            budget_usd=data.get('budget', 10000),
            time_horizon_years=data.get('horizon', 10),
            plan_type=data.get('plan_type', 'balanced'),
            size_sqft=metadata.get('size_sqft'),
            metadata=metadata,
            climate=climate,
            derived=derived
        )
        
        return jsonify({
            "status": "success",
            "plan": plan
        }), 200

    except Exception as e:
        print(f"Planner Error: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=2000)