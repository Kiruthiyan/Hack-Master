# ===================================================================
# SECTION 1: IMPORTS
# We import only the libraries needed for the AI prediction server.
# ===================================================================
import joblib # Library to load our saved AI model
from flask import Flask, jsonify, request # Flask for the web server
from flask_cors import CORS
import numpy as np # For creating the numerical array for the model

# ===================================================================
# SECTION 2: INITIALIZATION AND MODEL LOADING
# ===================================================================
# Initialize the Flask web server application
app = Flask(__name__)

# Configure CORS to allow your React app to communicate with this server
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# --- Load the trained AI model and encoders when the server starts ---
# This is a global block of code that runs only once.
try:
    model = joblib.load('startup_success_model.pkl')
    le_industry = joblib.load('industry_encoder.pkl')
    le_country = joblib.load('country_encoder.pkl')
    print("✅ Successfully loaded AI model and encoders.")
    print("🤖 AI Prediction service is ready.")
except FileNotFoundError:
    print("❌ FATAL ERROR: AI model files not found!")
    print("Please make sure you have run the 'train_model.py' script first.")
    model, le_industry, le_country = None, None, None

# ===================================================================
# SECTION 3: THE AI PREDICTION API ENDPOINT
# This is the only endpoint in our service.
# ===================================================================
# This function handles POST requests to the URL: /api/predict-success
@app.route('/api/predict-success', methods=['POST'])
def predict_startup_success():
    print("\nRequest received at /api/predict-success")

    # Safety check: If the model failed to load, return an error.
    if not model or not le_industry or not le_country:
        return jsonify({"error": "AI model is not loaded on the server."}), 500

    try:
        # 1. Get the new startup data sent from the React form in JSON format
        data = request.get_json()
        print(f"   - Received data for prediction: {data}")

        # 2. Prepare the data for the model
        # Use the saved encoders to transform the text input (e.g., "IT")
        # into the number that the AI model was trained on.
        industry_encoded = le_industry.transform([data['industry']])[0]
        country_encoded = le_country.transform([data['country']])[0]
        
        # 3. Create the feature array in the exact same order as the training script
        # The model expects a 2D array, which is why we have double brackets [[...]].
        features = np.array([[
            int(data['founded_year']),
            int(data['funding_usd']),
            industry_encoded,
            country_encoded
        ]])

        # 4. Use the loaded AI model to predict the probabilities
        prediction_proba = model.predict_proba(features)
        
        # The model returns probabilities for [class_0 (Fail), class_1 (Succeed)]
        # We want the probability of success, which is the second value ([0][1]).
        success_probability = prediction_proba[0][1]
        
        print(f"   - AI Prediction (Success Probability): {success_probability:.2f}")

        # 5. Return the final result to the frontend
        return jsonify({'success_probability': success_probability})

    except Exception as e:
        # This catch block will handle errors if the input is bad,
        # for example, if the React app sends an 'industry' that the model
        # was never trained on (e.g., "Space").
        print(f"   - ❌ ERROR during prediction: {e}")
        return jsonify({"error": "Invalid input data for prediction. Please check the values."}), 400

# This part allows you to run the server by typing `flask run`
if __name__ == '__main__':
    app.run(debug=True, port=5000)