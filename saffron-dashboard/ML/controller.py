from flask import Flask, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
from datetime import datetime
import warnings
import os

# Initialize Web Server
app = Flask(__name__)
CORS(app)  # Allows your HTML dashboard to access this

# Load the Brain
warnings.filterwarnings("ignore")

# Check if model exists before loading
if os.path.exists('saffgrow_brain.pkl'):
    try:
        model = joblib.load('saffgrow_brain.pkl')
        encoder = joblib.load('stage_encoder.pkl')
        print("[INIT] SaffGrow Brain Loaded Successfully.")
    except Exception as e:
        print(f"[ERROR] Failed to load model: {e}")
else:
    print("[ERROR] 'saffgrow_brain.pkl' not found! Please run train_model.py first.")

# Physiological Thresholds
IDEAL_FLOWERING_TEMP = 16.0

def get_growth_stage(month):
    if month in [5, 6, 7]: return "Dormancy"
    if month == 8: return "Pre-Activation"
    if month == 9: return "Sprouting"
    if month == 10: return "Flowering"
    if month == 11: return "Harvest"
    return "Vegetative"

# --- NEW: Home Route to fix 404 Error ---
@app.route('/', methods=['GET'])
def home():
    return "SaffGrow AI Server is RUNNING! Go to /status to see data."

@app.route('/status', methods=['GET'])
def get_system_status():
    now = datetime.now()
    # Simulating October (Flowering) for the Demo
    sim_month = 10 
    growth_stage = get_growth_stage(sim_month)
    
    try:
        stage_code = encoder.transform([growth_stage])[0]
        
        # 1. Ask the Brain
        input_features = pd.DataFrame([[
            sim_month, now.day, now.hour, now.minute, stage_code
        ]], columns=['Month_Num', 'Day', 'Hour', 'Minute', 'Growth_Stage_Code'])
        
        prediction = model.predict(input_features)[0]
        pred_temp, pred_hum, pred_light, pred_ec, pred_ph = prediction

        # 2. Optimization Logic
        actuator_commands = {}
        status_msg = ""
        final_temp = pred_temp

        if growth_stage == "Flowering" and pred_temp > 17.0:
            target_temp = IDEAL_FLOWERING_TEMP
            status_msg = f"OPTIMIZING: Cooling by {(pred_temp - target_temp):.1f}°C"
            actuator_commands['Chiller'] = "ON"
            actuator_commands['Fan'] = "HIGH"
            final_temp = target_temp
        else:
            status_msg = "MONITORING: Natural Conditions Optimal"
            actuator_commands['Chiller'] = "OFF"
            actuator_commands['Fan'] = "LOW"
            final_temp = pred_temp

        # 3. Return JSON
        return jsonify({
            "timestamp": now.strftime("%H:%M:%S"),
            "cycle": growth_stage,
            "env_data": {
                "temp": round(final_temp, 1), # The Optimized Temp
                "natural_temp": round(pred_temp, 1), # The "Real" Temp
                "humidity": round(pred_hum, 1),
                "light": int(pred_light),
                "soil_ec": round(pred_ec, 2),
                "soil_ph": round(pred_ph, 2)
            },
            "actuators": actuator_commands,
            "system_msg": status_msg
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run the server on Port 5000
    print("SaffGrow Server Starting on http://localhost:5000")
    # '0.0.0.0' allows other devices (like ESP32) on the network to see this server
    app.run(host='0.0.0.0', port=5000)