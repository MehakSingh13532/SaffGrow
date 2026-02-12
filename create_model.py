import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib
import numpy as np

# Synthetic Saffron Data: Based on research (Yield peaks at ~20°C, 60% Humidity)
data = {
    'temp': [10, 15, 20, 25, 30, 35],
    'humidity': [30, 45, 60, 70, 80, 90],
    'yield': [0.05, 0.3, 0.6, 0.4, 0.1, 0.01] 
}

df = pd.DataFrame(data)
X = df[['temp', 'humidity']]
y = df['yield']

# Train and Save
model = LinearRegression()
model.fit(X, y)
joblib.dump(model, 'saffron_model.pkl')

print("✅ SUCCESS: 'saffron_model.pkl' has been generated!")
print("You can now run 'python ml_service.py'")