/* =====================================================
   AERO ALUMNI CONNECT
   FRONTEND JAVASCRIPT

   Department of Aerospace Engineering
   School of Mechanical Engineering (SMEC)
   VIT Bhopal University
   ===================================================== */


/* =====================================================
   GOOGLE APPS SCRIPT BACKEND
   ===================================================== */

/*
 * IMPORTANT:
 * Replace the URL below with your ORIGINAL Google Apps
 * Script Web App URL ending in /exec.
 *
 * Example:
 * https://script.google.com/macros/s/XXXXXXXXXXXX/exec
 */

const API_URL =
    "https://script.google.com/macros/s/AKfycbzeZv2jXsJOExSQOEg3EQbxRs91FfZIfG8o6nqHL_Z3F63wylZTm6TX75Y-04zG52WctA/exec";


/* =====================================================
   MOBILE NAVIGATION
   ===================================================== */

const menuButton =
    document.getElementById("menuButton");

const navigation =
    document.getElementById("mainNavigation");


if (menuButton && navigation) {

    menuButton.addEventListener(
        "click",
        function () {

            const isActive =
                navigation.classList.toggle("active");

            menuButton.setAttribute(
                "aria-expanded",
                isActive ? "true" : "false"
            );

        }
    );

}


/* =====================================================
   CLOSE MOBILE MENU AFTER CLICKING A LINK
   ===================================================== */

const navigationLinks =
    document.querySelectorAll(
        ".main-navigation a"
    );


navigationLinks.forEach(
    function (link) {

        link.addEventListener(
            "click",
            function () {

                if (navigation) {

                    navigation.classList.remove(
                        "active"
                    );

                }

                if (menuButton) {

                    menuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            }
        );

    }
);


/* =====================================================
   CURRENT YEAR
   ===================================================== */

const yearElement =
    document.getElementById("currentYear");


if (yearElement) {

    yearElement.textContent =
        new Date().getFullYear();

}


/* =====================================================
   TEST GOOGLE APPS SCRIPT BACKEND
   ===================================================== */

async function testBackendConnection() {

    if (
        !API_URL ||
        API_URL ===
        "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE"
    ) {

        console.error(
            "Google Apps Script Web App URL has not been configured."
        );

        return {

            success: false,

            message:
                "Backend URL is not configured."

        };

    }


    try {

        const response =
            await fetch(
                API_URL +
                "?action=health",
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP error: " +
                response.status
            );

        }


        const data =
            await response.json();


        console.log(
            "Aero Alumni Connect Backend Response:",
            data
        );


        if (data.success) {

            console.log(
                "✓ Aero Alumni Connect backend connection successful."
            );

        } else {

            console.warn(
                "Backend responded, but reported an error.",
                data
            );

        }


        return data;


    } catch (error) {

        console.error(
            "Aero Alumni Connect backend connection failed:",
            error
        );


        return {

            success: false,

            message:
                error.message

        };

    }

}


/* =====================================================
   START BACKEND CONNECTION TEST
   ===================================================== */

testBackendConnection();

/* =====================================================
   ALUMNI REGISTRATION
   ===================================================== */

const alumniRegistrationForm =
    document.getElementById(
        "alumniRegistrationForm"
    );


if (alumniRegistrationForm) {

    alumniRegistrationForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const messageElement =
                document.getElementById(
                    "registrationMessage"
                );


            const submitButton =
                document.getElementById(
                    "registrationSubmit"
                );


            function showMessage(
                message,
                type
            ) {

                if (!messageElement) {
                    return;
                }

                messageElement.textContent =
                    message;

                messageElement.className =
                    "form-message " +
                    type;

            }


            /* -----------------------------------------
               BASIC FRONTEND VALIDATION
               ----------------------------------------- */

            if (
                !alumniRegistrationForm.checkValidity()
            ) {

                alumniRegistrationForm.reportValidity();

                return;

            }


            /* -----------------------------------------
               DISABLE BUTTON
               ----------------------------------------- */

            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Submitting...";

            }


            showMessage(
                "Submitting your registration. Please wait...",
                "success"
            );


            try {

                const formData =
                    new FormData(
                        alumniRegistrationForm
                    );


                formData.append(
                    "action",
                    "registerAlumni"
                );


                /*
                 * Convert FormData to URL encoded data.
                 *
                 * This keeps the request simple and avoids
                 * unnecessary browser CORS preflight requests.
                 */

                const body =
                    new URLSearchParams();


                formData.forEach(
                    function (
                        value,
                        key
                    ) {

                        body.append(
                            key,
                            value
                        );

                    }
                );


                const response =
                    await fetch(
                        API_URL,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/x-www-form-urlencoded;charset=UTF-8"

                            },

                            body:
                                body.toString(),

                            cache: "no-store"

                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "HTTP error: " +
                        response.status
                    );

                }


                const result =
                    await response.json();


                console.log(
                    "Alumni Registration Response:",
                    result
                );


                /* -------------------------------------
                   SUCCESS
                   ------------------------------------- */

                if (result.success) {

                    showMessage(
                        "Registration successful. Your Alumni ID is " +
                        result.alumniId +
                        ". Your registration is currently pending department approval.",
                        "success"
                    );


                    alumniRegistrationForm.reset();


                    /*
                     * Restore default country after reset.
                     */

                    const countryField =
                        document.getElementById(
                            "currentCountry"
                        );


                    if (countryField) {

                        countryField.value =
                            "India";

                    }


                    /*
                     * Scroll to confirmation message.
                     */

                    if (messageElement) {

                        messageElement.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });

                    }


                } else {

                    showMessage(
                        result.message ||
                        "Registration could not be completed.",
                        "error"
                    );

                }


            } catch (error) {

                console.error(
                    "Alumni registration failed:",
                    error
                );


                showMessage(
                    "Unable to submit the registration right now. Please try again later.",
                    "error"
                );


            } finally {

                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.textContent =
                        "Submit Alumni Registration";

                }

            }

        }
    );

}
