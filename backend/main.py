from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from models.model_logic import predict_image, predict_diabetes

import os

app = FastAPI()

# Enable frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict")
async def predict(file: UploadFile = None, type: str = Form(...),
                  pregnancies: int = Form(None), glucose: int = Form(None),
                  bp: int = Form(None), insulin: int = Form(None),
                  bmi: float = Form(None), age: int = Form(None)):

    # --- CNN image-based models ---
    # --- CNN image-based models ---
    if type in ["pneumonia", "brain", "skin"]:
        contents = await file.read()

        pred, gradcam_path = predict_image(contents, type)

        return {
            "prediction": pred,
            "gradcam_path": gradcam_path,
            "report_id": f"{type}_report_001"
        }


    # --- XGBoost numerical model ---
    elif type == "diabetes":
        input_data = {
            "pregnancies": pregnancies,
            "glucose": glucose,
            "bp": bp,
            "insulin": insulin,
            "bmi": bmi,
            "age": age
        }

        pred = predict_diabetes(input_data)

        return {
            "prediction": pred,
            "report_id": "diabetes_report_001"
        }

    return JSONResponse(status_code=400, content={"error": "Invalid diagnosis type"})
