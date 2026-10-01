/* =========================================================
   VIT AERO ALUMNI CONNECT
   Shared GitHub Pages JavaScript
   ========================================================= */

const AAC_CONFIG = {
  portalName: 'VIT Aero Alumni Connect',
  apiUrl:
    'https://script.google.com/macros/s/AKfycbznZGMhrKljT33DuwKFADn_caJxnQXC0DgMuGA9q63g-jn9gzm1AALZbN7fzaqUwgjyCA/exec',
  githubBase:
    'https://sarathkumarsebastin.github.io/aero-alumni-connect/'
};

document.addEventListener('DOMContentLoaded', function () {
  setYear();
  initMobileNavigation();
  initRegistrationForm();
  initDirectoryLink();
});


function setYear() {
  document.querySelectorAll('[data-current-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
}


function initMobileNavigation() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-mobile-nav]');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}


function initDirectoryLink() {
  document.querySelectorAll('[data-directory-link]').forEach(function (link) {
    link.href = AAC_CONFIG.apiUrl + '?action=directoryPage';
  });
}


function initRegistrationForm() {
  const form = document.getElementById('alumniRegistrationForm');
  if (!form) return;

  const statusBox = document.getElementById('registrationStatus');
  const submitButton = form.querySelector('button[type="submit"]');
  const frame = document.getElementById('registrationFrame');

  window.addEventListener('message', function (event) {
    if (event.origin !== 'https://sarathkumarsebastin.github.io') return;

    const data = event.data;
    if (!data || typeof data !== 'object') return;

    if (data.success) {
      showStatus(
        statusBox,
        'success',
        (data.message || 'Registration submitted successfully.') +
          (data.alumniId ? ' Your Alumni ID is ' + data.alumniId + '.' : '')
      );

      form.reset();
      setSubmitState(submitButton, false);
    } else {
      showStatus(
        statusBox,
        'error',
        data.message || 'Registration could not be submitted.'
      );
      setSubmitState(submitButton, false);
    }
  });

  form.addEventListener('submit', function () {
    clearStatus(statusBox);
    setSubmitState(submitButton, true);
  });

  if (frame) {
    frame.addEventListener('load', function () {
      // The actual result arrives through postMessage.
      // This listener intentionally does not display an error.
    });
  }
}


function setSubmitState(button, busy) {
  if (!button) return;

  button.disabled = busy;
  button.dataset.originalText =
    button.dataset.originalText || button.textContent;

  button.textContent = busy
    ? 'Submitting...'
    : button.dataset.originalText;
}


function showStatus(box, type, message) {
  if (!box) return;

  box.hidden = false;
  box.className = 'alert alert-' + type;
  box.textContent = message;
}


function clearStatus(box) {
  if (!box) return;

  box.hidden = true;
  box.className = 'alert';
  box.textContent = '';
}
