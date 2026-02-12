from fastapi import FastAPI
from pydantic import BaseModel
import pickle

app = FastAPI()

# Load model
with open("rf_model.pkl", "rb") as f:
    model = pickle.load(f)

# Request schema
class InputData(BaseModel):
    features: list

@app.post("/predict")
def predict(data: InputData):
    prediction = model.predict([data.features])
    return {"prediction": int(prediction[0])}
