// =========================================
// API URL
// =========================================

const API_URL = "http://127.0.0.1:8000/predict";


// =========================================
// GET ELEMENTS
// =========================================

const form =
    document.getElementById("predictionForm");

const predictBtn =
    document.getElementById("predictBtn");

const buttonText =
    document.getElementById("buttonText");

const loader =
    document.getElementById("loader");

const predictionScore =
    document.getElementById("predictionScore");

const predictionStatus =
    document.getElementById("predictionStatus");

const errorBox =
    document.getElementById("error");

const errorMessage =
    document.getElementById("errorMessage");

const scoreCircle =
    document.querySelector(".score-circle");


// =========================================
// RANGE ELEMENTS
// =========================================

const usage =
    document.getElementById("usage");

const usageValue =
    document.getElementById("usageValue");


const unlocks =
    document.getElementById("unlocks");

const unlockValue =
    document.getElementById("unlockValue");


const study =
    document.getElementById("study");

const studyValue =
    document.getElementById("studyValue");


const activity =
    document.getElementById("activity");

const activityValue =
    document.getElementById("activityValue");


const sleep =
    document.getElementById("sleep");

const sleepValue =
    document.getElementById("sleepValue");


// =========================================
// RANGE VALUE UPDATE
// =========================================

usage.addEventListener("input", function () {

    usageValue.textContent =
        `${this.value} hrs`;

});


unlocks.addEventListener("input", function () {

    unlockValue.textContent =
        this.value;

});


study.addEventListener("input", function () {

    studyValue.textContent =
        `${this.value} hrs`;

});


activity.addEventListener("input", function () {

    activityValue.textContent =
        `${this.value} hrs`;

});


sleep.addEventListener("input", function () {

    sleepValue.textContent =
        `${this.value} hrs`;

});


// =========================================
// FORM SUBMIT
// =========================================

form.addEventListener("submit", async function (event) {

    event.preventDefault();


    // -----------------------------------------
    // Reset previous states
    // -----------------------------------------

    errorBox.classList.add("hidden");

    predictionStatus.classList.remove("success");


    // -----------------------------------------
    // Collect input
    // -----------------------------------------

    const data = {

        age:
            Number(
                document.getElementById("age").value
            ),

        gender:
            document.getElementById("gender").value,

        country:
            document.getElementById("country").value.trim(),

        academic_level:
            document.getElementById("academic_level").value,

        most_used_platform:
            document.getElementById("platform").value,

        purpose_of_use:
            document.getElementById("purpose").value,

        avg_daily_usage_hours:
            Number(usage.value),

        daily_unlocks:
            Number(unlocks.value),

        study_hours:
            Number(study.value),

        physical_activity_hours:
            Number(activity.value),

        sleep_hours_per_night:
            Number(sleep.value),

        stress_level:
            document.getElementById("stress").value

    };


    console.log(
        "Sending data:",
        data
    );


    // -----------------------------------------
    // Loading
    // -----------------------------------------

    predictBtn.disabled = true;

    buttonText.textContent =
        "Predicting...";

    loader.classList.remove("hidden");


    try {

        // =====================================
        // API REQUEST
        // =====================================

        const response = await fetch(
            API_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },

                body: JSON.stringify(data)
            }
        );


        // =====================================
        // HANDLE ERROR
        // =====================================

        if (!response.ok) {

            let errorData = null;

            try {

                errorData =
                    await response.json();

            } catch (jsonError) {

                console.log(
                    "Could not parse error JSON"
                );

            }


            let message =
                `Server returned ${response.status}`;


            if (errorData?.detail) {

                if (
                    Array.isArray(
                        errorData.detail
                    )
                ) {

                    message =
                        errorData.detail
                            .map(
                                item =>
                                    item.msg
                            )
                            .join(", ");

                } else {

                    message =
                        errorData.detail;

                }

            }


            throw new Error(message);

        }


        // =====================================
        // GET RESPONSE
        // =====================================

        const prediction =
            await response.json();


        console.log(
            "API response:",
            prediction
        );


        // =====================================
        // DISPLAY SCORE
        // =====================================

        const score =
            Number(
                prediction.predicted_mental_health_score
            );


        if (Number.isNaN(score)) {

            throw new Error(
                "Invalid prediction received from API."
            );

        }


        predictionScore.textContent =
            score.toFixed(2);


        // =====================================
        // SCORE ANIMATION
        // =====================================

        scoreCircle.classList.remove(
            "updated"
        );


        void scoreCircle.offsetWidth;


        scoreCircle.classList.add(
            "updated"
        );


        // =====================================
        // SUCCESS STATUS
        // =====================================

        predictionStatus.innerHTML =
            `
            Prediction generated successfully.
            <br>
            <strong>Model score: ${score.toFixed(2)}</strong>
            `;


        predictionStatus.classList.add(
            "success"
        );


    }

    catch (error) {

        console.error(
            "Prediction error:",
            error
        );


        errorMessage.textContent =
            error.message;


        errorBox.classList.remove(
            "hidden"
        );


        predictionStatus.textContent =
            "Prediction could not be generated.";

    }


    finally {

        // =====================================
        // RESET BUTTON
        // =====================================

        predictBtn.disabled = false;

        buttonText.textContent =
            "Predict Mental Health Score";

        loader.classList.add(
            "hidden"
        );

    }

});