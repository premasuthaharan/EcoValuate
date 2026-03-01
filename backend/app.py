from flask import Flask, request, jsonify
from workflow import run_workflow
import traceback
from flask_cors import CORS
from generate_plan import generate_renovation_plan 

app = Flask(__name__)
CORS(app)

@app.route('/api/estimate', methods=['POST'])
def get_estimate():
    """
    Endpoint to receive a JSON body: {"address": "123 Main St, City, State"}
    """
    data = request.get_json()
    
    if not data or 'address' not in data:
        return jsonify({"error": "Missing address parameter"}), 400

    address = data['address']

    try:
        # Run the full pipeline
        # result contains the dictionary returned by estimate_carbon_footprint
        result = run_workflow(address)
        
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
        "address": "..." (or you can pass the metadata directly if already fetched)
    }
    """
    data = request.get_json()
    
    try:
        # Step 1: We usually need the home's baseline data to make a smart plan
        # If the frontend already has 'derived' and 'metadata', it should pass them.
        # Otherwise, we run the workflow once to get the baseline.
        address = data.get('address')
        full_house_data = run_workflow(address) # This now includes derived, metadata, etc.
        
        # Step 2: Extract variables needed for the planner
        metadata = full_house_data.get('metadata')
        climate = full_house_data.get('climate')
        derived = full_house_data.get('derived')
        
        # Step 3: Run the Renovation Planner
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
    app.run(debug=True, port=5000)