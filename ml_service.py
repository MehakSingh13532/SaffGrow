import json
import time
import joblib
import numpy as np

# Load the model we just trained
model = joblib.load('saffron_model.pkl')

def predict_yield():
    while True:
        try:
            with open('chamber_data.json', 'r+') as f:
                data = json.load(f)
                
                # Get current values from the JSON
                temp = data['environmental_data']['temperature']['current']
                hum = data['environmental_data']['humidity']['current']
                
                # Use ML Model to predict
                prediction = model.predict(np.array([[temp, hum]]))[0]
                prediction = max(0, prediction) # No negative yield
                
                # Update the Yield and Logs
                data['plant_growth_data']['estimated_yield'] = f"{round(prediction, 3)}g"
                timestamp = time.strftime('%H:%M:%S')
                data['system_logs'].insert(0, f"{timestamp} - ML Insight: Predicted yield adjusted to {round(prediction, 3)}g")
                
                # Save back to JSON
                f.seek(0)
                json.dump(data, f, indent=4)
                f.truncate()
                
                print(f"[{timestamp}] Dashboard Updated. Predicted Yield: {round(prediction, 3)}g")
        except Exception as e:
            print(f"Error: {e}")
        
        time.sleep(10) # Run every 10 seconds

if __name__ == "__main__":
    predict_yield()