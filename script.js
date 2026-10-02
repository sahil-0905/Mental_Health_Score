// =========================================================
// Helper
// =========================================================

const $ = (id) => document.getElementById(id);


// =========================================================
// Slider Values
// =========================================================

const usageSlider = $("avg_daily_usage_hours");
const usageValue = $("usageValue");

const unlockSlider = $("daily_unlocks");
const unlockValue = $("unlockValue");

const studySlider = $("study_hours");
const studyValue = $("studyValue");

const activitySlider = $("physical_activity_hours");
const activityValue = $("activityValue");

const sleepSlider = $("sleep_hours_per_night");
const sleepValue = $("sleepValue");


// Daily Usage
usageSlider.addEventListener("input", () => {

    usageValue.textContent =
        `${usageSlider.value} hrs`;

});


// Daily Unlocks
unlockSlider.addEventListener("input", () => {

    unlockValue.textContent =
        unlockSlider.value;

});


// Study Hours
studySlider.addEventListener("input", () => {

    studyValue.textContent =
        `${studySlider.value} hrs`;

});


// Physical Activity
activitySlider.addEventListener("input", () => {

    activityValue.textContent =
        `${activitySlider.value} hrs`;

});


// Sleep
sleepSlider.addEventListener("input", () => {

    sleepValue.textContent =
        `${sleepSlider.value} hrs`;

});


// =========================================================
// Elements
// =========================================================

const predictBtn = $("predictBtn");

const btnText = $("btnText");

const loader = $("loader");

const resultOverlay = $("resultOverlay");

const resultScore = $("resultScore");

const resultMessage = $("resultMessage");

const closeResult = $("closeResult");

const againBtn = $("againBtn");

const errorToast = $("errorToast");


// =========================================================
// Error Function
// =========================================================

function showError(message) {

    errorToast.textContent = message;

    errorToast.classList.remove("hidden");

    setTimeout(() => {

        errorToast.classList.add("hidden");

    }, 5000);

}


// =========================================================
// Loading State
// =========================================================

function setLoading(isLoading) {

    if (isLoading) {

        predictBtn.disabled = true;

        btnText.textContent =
            "Predicting...";

        loader.classList.remove("hidden");

    } else {

        predictBtn.disabled = false;

        btnText.textContent =
            "Predict Mental Health Score";

        loader.classList.add("hidden");

    }

}


// =========================================================
// Prediction
// =========================================================

predictBtn.addEventListener("click", async () => {

    try {

        setLoading(true);


        // ---------------------------------------------
        // Collect Input
        // ---------------------------------------------

        const requestData = {

            age: Number(
                $("age").value
            ),

            gender:
                $("gender").value,

            country:
                $("country").value.trim(),

            academic_level:
                $("academic_level").value,

            most_used_platform:
                $("most_used_platform").value,

            purpose_of_use:
                $("purpose_of_use").value,

            avg_daily_usage_hours:
                Number(
                    $("avg_daily_usage_hours").value
                ),

            daily_unlocks:
                Number(
                    $("daily_unlocks").value
                ),

            study_hours:
                Number(
                    $("study_hours").value
                ),

            physical_activity_hours:
                Number(
                    $("physical_activity_hours").value
                ),

            sleep_hours_per_night:
                Number(
                    $("sleep_hours_per_night").value
                ),

            stress_level:
                $("stress_level").value

        };


        // ---------------------------------------------
        // Basic Validation
        // ---------------------------------------------

        if (!requestData.country) {

            showError(
                "Please enter your country."
            );

            setLoading(false);

            return;

        }


        // ---------------------------------------------
        // Send Request
        //
        // IMPORTANT:
        // Same Render server
        // ---------------------------------------------

        const response = await fetch(
            "/predict",
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(requestData)

            }
        );


        // ---------------------------------------------
        // Handle HTTP Error
        // ---------------------------------------------

        if (!response.ok) {

            let errorMessage =
                `Server Error: ${response.status}`;

            try {

                const errorData =
                    await response.json();

                if (errorData.detail) {

                    errorMessage =
                        Array.isArray(
                            errorData.detail
                        )
                            ? errorData.detail
                                .map(
                                    item =>
                                        item.msg
                                )
                                .join(", ")
                            : errorData.detail;

                }

            } catch (error) {

                // Ignore JSON parsing error

            }

            throw new Error(errorMessage);

        }


        // ---------------------------------------------
        // Get Result
        // ---------------------------------------------

        const result =
            await response.json();


        console.log(
            "Prediction result:",
            result
        );


        // ---------------------------------------------
        // Show Score
        // ---------------------------------------------

        const score =
            Number(
                result.predicted_mental_health_score
            );


        resultScore.textContent =
            score.toFixed(2);


        // ---------------------------------------------
        // Message
        // ---------------------------------------------

        if (score < 4) {

            resultMessage.textContent =
                "The predicted score is relatively low based on the information provided.";

        } else if (score < 7) {

            resultMessage.textContent =
                "The predicted score is in the moderate range based on the information provided.";

        } else {

            resultMessage.textContent =
                "The predicted score is relatively high based on the information provided.";

        }


        // ---------------------------------------------
        // Open Result
        // ---------------------------------------------

        resultOverlay.classList.remove(
            "hidden"
        );


    } catch (error) {

        console.error(
            "Prediction error:",
            error
        );

        showError(
            error.message ||
            "Something went wrong while predicting."
        );


    } finally {

        setLoading(false);

    }

});


// =========================================================
// Close Result
// =========================================================

closeResult.addEventListener(
    "click",
    () => {

        resultOverlay.classList.add(
            "hidden"
        );

    }
);


// =========================================================
// Check Again
// =========================================================

againBtn.addEventListener(
    "click",
    () => {

        resultOverlay.classList.add(
            "hidden"
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


// =========================================================
// Close When Clicking Outside
// =========================================================

resultOverlay.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            resultOverlay
        ) {

            resultOverlay.classList.add(
                "hidden"
            );

        }

    }
);