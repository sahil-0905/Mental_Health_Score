import joblib
import pandas as pd

from fastapi import FastAPI
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Literal


# =========================================================
# Load ML Model
# =========================================================

model = joblib.load("Mental_Health_Model.pkl")


# =========================================================
# FastAPI App
# =========================================================

app = FastAPI(
    title="Mental Health Score Predictor",
    description="AI powered student mental health score prediction API"
)


# =========================================================
# Pydantic Input Model
# =========================================================

class StudentData(BaseModel):

    age: int = Field(
        ...,
        ge=10,
        le=100
    )

    gender: Literal[
        "Male",
        "Female"
    ]

    country: str

    academic_level: Literal[
        "undergraduate",
        "Graduate",
        "High School"
    ]

    most_used_platform: Literal[
        "Facebook",
        "LinkedIn",
        "Instagram",
        "Snapchat",
        "Twitter",
        "Youtube",
        "TikTok",
        "LINE",
        "KakaoTalk",
        "VKontakte",
        "WeChat",
        "Whatsapp"
    ]

    purpose_of_use: Literal[
        "Networking",
        "Entertainment",
        "Education",
        "News"
    ]

    avg_daily_usage_hours: float = Field(
        ...,
        ge=0,
        le=24
    )

    daily_unlocks: int = Field(
        ...,
        ge=0
    )

    study_hours: float = Field(
        ...,
        ge=0,
        le=24
    )

    physical_activity_hours: float = Field(
        ...,
        ge=0,
        le=24
    )

    sleep_hours_per_night: float = Field(
        ...,
        ge=0,
        le=24
    )

    stress_level: Literal[
        "Low",
        "Medium",
        "High",
        "Very High"
    ]


# =========================================================
# Response Model
# =========================================================

class PredictionResponse(BaseModel):

    predicted_mental_health_score: float


# =========================================================
# Home Page
# =========================================================

@app.get("/")
def home():
    return FileResponse("index.html")


# =========================================================
# CSS
# =========================================================

@app.get("/style.css")
def css():
    return FileResponse("style.css")


# =========================================================
# JavaScript
# =========================================================

@app.get("/script.js")
def javascript():
    return FileResponse("script.js")


# =========================================================
# Top Countries
# =========================================================

top_countries = [
    "Other",
    "India",
    "USA",
    "Canada",
    "Australia",
    "UK",
    "Germany",
    "Turkey",
    "Mexico",
    "France"
]


# =========================================================
# Prediction API
# =========================================================

@app.post(
    "/predict",
    response_model=PredictionResponse
)
def predict(data: StudentData):

    # -----------------------------------------
    # Group Country
    # -----------------------------------------

    country_group = (
        data.country
        if data.country in top_countries
        else "Other"
    )

    # -----------------------------------------
    # Create DataFrame
    # IMPORTANT:
    # These column names must match training
    # -----------------------------------------

    input_row = pd.DataFrame([{

        "Study_Hours":
            data.study_hours,

        "Age":
            data.age,

        "Avg_Daily_Usage_Hours":
            data.avg_daily_usage_hours,

        "Daily_Unlocks":
            data.daily_unlocks,

        "Physical_Activity_Hours":
            data.physical_activity_hours,

        "Sleep_Hours_Per_Night":
            data.sleep_hours_per_night,

        "Stress_Level":
            data.stress_level,

        "Gender":
            data.gender,

        "Academic_Level":
            data.academic_level,

        "Most_Used_Platform":
            data.most_used_platform,

        "Purpose_Of_Use":
            data.purpose_of_use,

        "Grouped_country":
            country_group

    }])

    # -----------------------------------------
    # Prediction
    # -----------------------------------------

    prediction = model.predict(input_row)[0]

    # -----------------------------------------
    # Response
    # -----------------------------------------

    return {
        "predicted_mental_health_score":
            round(float(prediction), 2)
    }


# =========================================================
# Health Check
# =========================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "model_loaded": True
    }