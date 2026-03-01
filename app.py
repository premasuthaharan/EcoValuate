from flask import Flask, request, jsonify
from workflow import run_workflow # Your main entry point
import traceback

app = Flask(__name__)

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

if __name__ == '__main__':
    # Use threaded=True to handle multiple requests better
    app.run(debug=True, port=5000)