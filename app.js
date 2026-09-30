/* =====================================================
   AERO ALUMNI CONNECT
   Frontend JavaScript
   ===================================================== */


/*
 * Mobile navigation
 */

const menuButton =
    document.getElementById("menuButton");

const navigation =
    document.querySelector(".main-navigation");


if (menuButton && navigation) {

    menuButton.addEventListener(
        "click",
        function () {

            navigation.classList.toggle("active");

        }
    );

}


/*
 * Close mobile menu after clicking a link
 */

const navigationLinks =
    document.querySelectorAll(
        ".main-navigation a"
    );


navigationLinks.forEach(function (link) {

    link.addEventListener(
        "click",
        function () {

            if (navigation) {

                navigation.classList.remove("active");

            }

        }
    );

});


/*
 * Current year in footer
 */

const yearElement =
    document.getElementById("currentYear");


if (yearElement) {

    yearElement.textContent =
        new Date().getFullYear();

}
