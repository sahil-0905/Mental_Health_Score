import os
import joblib
import pandas as pd

from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Literal
from fastapi.middleware.cors import CORSMiddleware


# =========================================================
# Load Model
# =========================================================

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "Mental_Health_Model.pkl"
)

model = joblib.load(MODEL_PATH)

print("Model loaded from:")
print(MODEL_PATH)

print("\nModel expected columns:")
print(model.feature_names_in_)


# =========================================================
# FastAPI App
# =========================================================

app = FastAPI(
    title="Mental Health Prediction API",
    description="Predict student's mental health score",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# =========================================================
# Input Model
# =========================================================

class StudentData(BaseModel):

    age: int = Field(
        ...,
        ge=10,
        le=100,
        description="Age of the student"
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
# Top Countries
# =========================================================

top_countries = [
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
# Home Route
# =========================================================

@app.get("/")
def home():

    return {
        "message": "Mental Health Prediction API is running"
    }


# =========================================================
# Prediction Route
# =========================================================

@app.post(
    "/predict",
    response_model=PredictionResponse
)
def predict(data: StudentData):

    # -----------------------------------------------------
    # Group Country
    # -----------------------------------------------------

    if data.country in top_countries:
        country_group = data.country
    else:
        country_group = "Other"


    # -----------------------------------------------------
    # Create Input DataFrame
    #
    # IMPORTANT:
    # These column names MUST match training columns.
    # -----------------------------------------------------

    input_row = pd.DataFrame([{

        "Study_Hours": data.study_hours,

        "Age": data.age,

        "Avg_Daily_Usage_Hours": data.avg_daily_usage_hours,

        "Daily_Unlocks": data.daily_unlocks,

        "Physical_Activity_Hours": data.physical_activity_hours,

        "Sleep_Hours_Per_Night": data.sleep_hours_per_night,

        "Stress_Level": data.stress_level,

        "Gender": data.gender,

        "Academic_Level": data.academic_level,

        "Most_Used_Platform": data.most_used_platform,

        "Purpose_Of_Use": data.purpose_of_use,

        "Grouped_country": country_group

    }])


    # -----------------------------------------------------
    # Debugging
    # -----------------------------------------------------

    print("\nAPI Input Columns:")
    print(input_row.columns.tolist())

    print("\nModel Expected Columns:")
    print(model.feature_names_in_.tolist())


    # -----------------------------------------------------
    # Prediction
    # -----------------------------------------------------

    prediction = model.predict(input_row)[0]


    # -----------------------------------------------------
    # Response
    # -----------------------------------------------------

    return PredictionResponse(
        predicted_mental_health_score=round(
            float(prediction),
            2
        )
    )