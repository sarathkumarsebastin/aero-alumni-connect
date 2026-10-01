/* =========================================================
   AERO ALUMNI CONNECT - SHARED FRONTEND JAVASCRIPT
   GitHub Pages frontend
   ========================================================= */

const AERO_CONFIG = {
  apiUrl: 'https://script.google.com/macros/s/AKfycbx-qLt5rX69dOtG3u3u--lDVOsiOVQikvCJDTOS3pNAK3_uOm-BlNDXhCFDY-OdDsln_Q/exec',
  directoryUrl: 'https://script.google.com/macros/s/AKfycbx-qLt5rX69dOtG3u3u--lDVOsiOVQikvCJDTOS3pNAK3_uOm-BlNDXhCFDY-OdDsln_Q/exec?action=directoryPage'
};

(function () {
  'use strict';

  function byId(id) {
    return document.getElementById(id);
  }

  function setCurrentYear() {
    document.querySelectorAll('[data-current-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  function setupMobileNav() {
    var button = byId('mobileMenuButton');
    var nav = byId('siteNav');
    if (!button || !nav) return;

    button.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        button.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function setupDirectoryLinks() {
    document.querySelectorAll('[data-directory-link]').forEach(function (link) {
      link.href = AERO_CONFIG.directoryUrl;
    });
  }

  function setupSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return;
        var target = document.querySelector(targetId);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', targetId);
      });
    });
  }

  function showRegistrationStatus(type, message) {
    var box = byId('registrationStatus');
    if (!box) return;
    box.className = 'form-status ' + type;
    box.textContent = message;
    box.hidden = false;
  }

  function setupRegistrationForm() {
    var form = byId('registrationForm');
    var iframe = byId('registrationResponseFrame');
    if (!form || !iframe) return;

    var submitted = false;
    var submitButton = form.querySelector('button[type="submit"]');
    var originalButtonText = submitButton ? submitButton.textContent : 'Submit Registration';

    window.addEventListener('message', function (event) {
      var data = event.data;
      if (!data || data.type !== 'aeroAlumniRegistration') return;
      if (!submitted) return;

      var payload = data.payload || {};
      submitted = false;
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }

      if (payload.success) {
        showRegistrationStatus(
          'success',
          'Registration submitted successfully. Your Alumni ID is ' +
          (payload.alumniId || 'pending') +
          '. Your profile will remain private until it is reviewed and approved.'
        );
        form.reset();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        showRegistrationStatus(
          'error',
          payload.message || 'Registration could not be submitted. Please check the form and try again.'
        );
      }
    });

    form.addEventListener('submit', function () {
      submitted = true;
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
      }
      showRegistrationStatus('loading', 'Submitting your registration securely...');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setCurrentYear();
    setupMobileNav();
    setupDirectoryLinks();
    setupSmoothAnchors();
    setupRegistrationForm();
  });
})();
