import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error
import joblib

# 1. Load the High-Resolution Dataset
# Ensure the CSV file is in the same folder as this script
filename = 'Saffron_Kashmir_Natural_High_Res_Dataset.csv'
print(f"Loading dataset: {filename}...")
df = pd.read_csv(filename)

# 2. Preprocessing & Feature Engineering
print("Preprocessing data...")

# Convert Timestamp to Datetime object
df['Timestamp'] = pd.to_datetime(df['Timestamp'])

# Create Input Features (X) - The "Context"
# The model needs to know "When" it is to decide the weather
df['Month_Num'] = df['Timestamp'].dt.month
df['Day'] = df['Timestamp'].dt.day
df['Hour'] = df['Timestamp'].dt.hour
df['Minute'] = df['Timestamp'].dt.minute

# Encode 'Growth_Stage' (Text) into Numbers
# Example: Vegetative=0, Flowering=1, etc.
le_stage = LabelEncoder()
df['Growth_Stage_Code'] = le_stage.fit_transform(df['Growth_Stage'])

# Define Inputs (X) and Targets (y)
# Inputs: Time and Stage
X = df[['Month_Num', 'Day', 'Hour', 'Minute', 'Growth_Stage_Code']]

# Targets: The Environmental Setpoints we want to mimic
y = df[['Temperature_C', 'Humidity_Percent', 'Light_Intensity_umol', 'Soil_EC', 'Soil_pH']]

# 3. Split Data (Train vs Test)
# We use 20% of data to test if the model is accurate
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Initialize and Train Random Forest Model
# n_estimators=50 is a good balance for speed/accuracy on this large dataset
print("Training Random Forest Model (This may take a minute)...")
rf_model = RandomForestRegressor(n_estimators=50, n_jobs=-1, random_state=42)
rf_model.fit(X_train, y_train)

# 5. Evaluate Accuracy
print("Evaluating model...")
predictions = rf_model.predict(X_test)
mae = mean_absolute_error(y_test, predictions)
print(f"Model Training Complete!")
print(f"Average Error (MAE): {mae:.4f}") 
# Low MAE means the model follows the dataset very closely

# 6. Save the Model and Encoder
# We need these files to run the prototype later
joblib.dump(rf_model, 'saffgrow_brain.pkl')
joblib.dump(le_stage, 'stage_encoder.pkl')
print("Model saved as 'saffgrow_brain.pkl'")

# --- DEMONSTRATION: PREDICTING A SCENARIO ---
print("\n--- TEST PREDICTION ---")
# Scenario: October 15th (Flowering), 2:30 PM
test_month = 10
test_day = 15
test_hour = 14
test_minute = 30
test_stage = "Flowering"

# Encode the stage using our saved encoder
stage_code = le_stage.transform([test_stage])[0]

# Create input array
input_data = [[test_month, test_day, test_hour, test_minute, stage_code]]

# Ask the model
predicted_env = rf_model.predict(input_data)

print(f"Scenario: {test_stage} on Month {test_month}, Day {test_day} at {test_hour}:{test_minute}")
print(f"Predicted Optimal Setpoints:")
print(f"  Temperature: {predicted_env[0][0]:.2f}°C (Target: ~16-17°C)")
print(f"  Humidity:    {predicted_env[0][1]:.1f}%")
print(f"  Light:       {predicted_env[0][2]:.0f} µmol")
print(f"  Soil EC:     {predicted_env[0][3]:.2f} mS/cm")
print(f"  Soil pH:     {predicted_env[0][4]:.2f}")