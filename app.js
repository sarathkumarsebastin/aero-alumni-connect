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
    "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";


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
