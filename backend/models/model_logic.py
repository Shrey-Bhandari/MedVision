# backend/models/model_logic.py

import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image
import io
import joblib
import json
import os
from models.gradcam_utils import apply_gradcam

# Load CNN models (on startup)
models = {
    "pneumonia": load_model("backend/models/pneumonia_model.h5"),
    "brain": load_model("backend/models/brain_model.h5"),
    "skin": load_model("backend/models/skin_model.h5"),
}

# Load Diabetes model and feature map
diabetes_model = joblib.load("backend/models/diabetes_xgb_model.pkl")

with open("backend/models/diabetes_feature_map.json", "r") as f:
    diabetes_features = json.load(f)

def predict_image(file_bytes: bytes, diagnosis_type: str):
    try:
        image = Image.open(io.BytesIO(file_bytes)).resize((224, 224)).convert("RGB")
        img_array = np.array(image) / 255.0
        img_array = img_array.reshape(1, 224, 224, 3)

        model = models.get(diagnosis_type)
        if not model:
            return "Invalid Model", ""

        prediction = model.predict(img_array)[0][0]

        # Generate Grad-CAM
        filename = f"gradcam_{diagnosis_type}_{np.random.randint(10000)}.jpg"
        gradcam_path = f"backend/static/gradcams/{filename}"
        apply_gradcam(model, file_bytes, gradcam_path)

        return ("Positive" if prediction > 0.5 else "Negative"), f"static/gradcams/{filename}"
    except Exception as e:
        print(f"[ERROR] Image prediction failed: {e}")
        return "Prediction Error", ""

def predict_diabetes(data: dict) -> str:
    try:
        input_data = [data[feature] for feature in diabetes_features]
        input_array = np.array(input_data).reshape(1, -1)

        prediction = diabetes_model.predict(input_array)[0]
        return "Diabetic" if prediction == 1 else "Non-Diabetic"
    except Exception as e:
        print(f"[ERROR] Diabetes prediction failed: {e}")
        return "Prediction Error"
