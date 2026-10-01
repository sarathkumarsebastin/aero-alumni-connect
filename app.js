/* =========================================================
   VIT AERO ALUMNI CONNECT
   GitHub Pages frontend
   Google Apps Script backend

   IMPORTANT:
   Public directory/content pages read LOCAL JSON files stored
   in this GitHub repository. Apps Script synchronises those
   files from Google Sheets whenever public data changes.
   ========================================================= */

const AAC_CONFIG = {
  portalName: 'VIT Aero Alumni Connect',
  university: 'VIT Bhopal University',
  school: 'School of Mechanical Engineering (SMEC)',
  department: 'Department of Aerospace Engineering',
  apiUrl: 'https://script.google.com/macros/s/AKfycbznZGMhrKljT33DuwKFADn_caJxnQXC0DgMuGA9q63g-jn9gzm1AALZbN7fzaqUwgjyCA/exec',
  githubOrigin: 'https://sarathkumarsebastin.github.io',
  dataBase: './data/'
};

document.addEventListener('DOMContentLoaded', function () {
  setYear();
  initMobileNavigation();
  initRegistrationForm();
  initDirectoryPage();
  initContentPage();
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

function initRegistrationForm() {
  const form = document.getElementById('alumniRegistrationForm');
  if (!form) return;

  const statusBox = document.getElementById('registrationStatus');
  const submitButton = form.querySelector('button[type="submit"]');

  window.addEventListener('message', function (event) {
    if (event.origin !== AAC_CONFIG.githubOrigin) return;
    const data = event.data;
    if (!data || data.type !== 'VIT_AERO_ALUMNI_REGISTRATION') return;

    setSubmitState(submitButton, false);

    if (data.success) {
      showStatus(
        statusBox,
        'success',
        (data.message || 'Registration submitted successfully.') +
        (data.alumniId ? ' Your Alumni ID is ' + data.alumniId + '.' : '')
      );
      form.reset();
    } else {
      showStatus(statusBox, 'error', data.message || 'Registration could not be submitted.');
    }
  });

  form.addEventListener('submit', function () {
    clearStatus(statusBox);
    setSubmitState(submitButton, true);
  });
}

function setSubmitState(button, busy) {
  if (!button) return;
  button.disabled = busy;
  button.dataset.originalText = button.dataset.originalText || button.textContent;
  button.textContent = busy ? 'Submitting...' : button.dataset.originalText;
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

function initDirectoryPage() {
  const page = document.querySelector('[data-page="directory"]');
  if (!page) return;

  const grid = document.getElementById('directoryGrid');
  const empty = document.getElementById('directoryEmpty');
  const loading = document.getElementById('directoryLoading');
  const search = document.getElementById('directorySearch');
  const year = document.getElementById('directoryYear');

  loadData('alumni.json')
    .then(function (payload) {
      const alumni = Array.isArray(payload.items) ? payload.items : [];
      if (loading) loading.hidden = true;
      populateYearFilter(year, alumni);
      renderDirectory(alumni, grid, empty, search, year);

      if (search) search.addEventListener('input', function () {
        renderDirectory(alumni, grid, empty, search, year);
      });
      if (year) year.addEventListener('change', function () {
        renderDirectory(alumni, grid, empty, search, year);
      });
    })
    .catch(function (error) {
      if (loading) {
        loading.hidden = false;
        loading.textContent = 'The alumni directory could not be loaded at this time.';
      }
      console.error(error);
    });
}

function populateYearFilter(select, records) {
  if (!select) return;
  const years = Array.from(new Set(records.map(function (item) {
    return String(item.Graduation_Year || '').trim();
  }).filter(Boolean))).sort(function (a, b) { return Number(b) - Number(a); });

  years.forEach(function (value) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function renderDirectory(records, grid, empty, search, year) {
  if (!grid) return;

  const q = search ? search.value.trim().toLowerCase() : '';
  const selectedYear = year ? year.value : '';

  const filtered = records.filter(function (item) {
    const haystack = [
      item.Full_Name,
      item.Degree,
      item.Organization,
      item.Designation,
      item.Industry_Sector,
      item.Technical_Expertise,
      item.Current_City,
      item.Current_Country
    ].join(' ').toLowerCase();

    return (!q || haystack.indexOf(q) >= 0) &&
      (!selectedYear || String(item.Graduation_Year) === selectedYear);
  });

  grid.innerHTML = '';
  filtered.forEach(function (item) {
    grid.appendChild(alumniCard(item));
  });

  if (empty) empty.hidden = filtered.length !== 0;
}

function alumniCard(item) {
  const card = document.createElement('article');
  card.className = 'profile-card';

  const name = document.createElement('h3');
  name.textContent = item.Full_Name || 'Alumni';

  const meta = document.createElement('p');
  meta.className = 'profile-meta';
  meta.textContent = [
    item.Degree,
    item.Graduation_Year ? 'Class of ' + item.Graduation_Year : ''
  ].filter(Boolean).join(' · ');

  const role = document.createElement('p');
  role.textContent = [item.Designation, item.Organization].filter(Boolean).join(' · ') || 'Professional profile';

  const location = document.createElement('p');
  location.className = 'muted';
  location.textContent = [item.Current_City, item.Current_Country].filter(Boolean).join(', ');

  card.appendChild(name);
  card.appendChild(meta);
  card.appendChild(role);
  if (location.textContent) card.appendChild(location);

  if (item.Industry_Sector || item.Technical_Expertise) {
    const tags = document.createElement('div');
    tags.className = 'tag-list';
    [item.Industry_Sector, item.Technical_Expertise].filter(Boolean).forEach(function (text) {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = text;
      tags.appendChild(tag);
    });
    card.appendChild(tags);
  }

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  if (String(item.Interested_Mentoring).toLowerCase() === 'yes') {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = 'Mentor';
    actions.appendChild(badge);
  }

  if (item.LinkedIn_URL) {
    const link = document.createElement('a');
    link.className = 'text-link';
    link.href = safeUrl(item.LinkedIn_URL);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'LinkedIn';
    actions.appendChild(link);
  }

  if (actions.children.length) card.appendChild(actions);
  return card;
}

function initContentPage() {
  const page = document.querySelector('[data-content-page]');
  if (!page) return;

  const type = page.getAttribute('data-content-page');
  const config = {
    opportunities: { file: 'opportunities.json', renderer: renderOpportunity },
    achievements: { file: 'achievements.json', renderer: renderAchievement },
    activities: { file: 'activities.json', renderer: renderActivity },
    mentorship: { file: 'mentorship.json', renderer: renderMentorship }
  }[type];

  if (!config) return;

  const grid = document.getElementById('contentGrid');
  const empty = document.getElementById('contentEmpty');
  const loading = document.getElementById('contentLoading');

  loadData(config.file)
    .then(function (payload) {
      const items = Array.isArray(payload.items) ? payload.items : [];
      if (loading) loading.hidden = true;
      grid.innerHTML = '';
      items.forEach(function (item) {
        grid.appendChild(config.renderer(item));
      });
      if (empty) empty.hidden = items.length !== 0;
    })
    .catch(function (error) {
      if (loading) loading.textContent = 'This section could not be loaded at this time.';
      console.error(error);
    });
}

async function loadData(fileName) {
  const url = AAC_CONFIG.dataBase + fileName + '?v=' + Date.now();
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error('Data request failed: ' + response.status);
  return response.json();
}

function renderOpportunity(item) {
  const card = baseContentCard(item.Title, item.Type || 'Opportunity');
  addLine(card, item.Organization);
  addLine(card, item.Location);
  addDescription(card, item.Description);
  addLabelValue(card, 'Eligibility', item.Eligibility);
  addLabelValue(card, 'Deadline', item.Deadline);
  if (item.Application_URL) addButton(card, item.Application_URL, 'View Opportunity');
  return card;
}

function renderAchievement(item) {
  const card = baseContentCard(item.Title, item.Category || 'Achievement');
  addLine(card, item.Alumni_Name ? item.Alumni_Name + (item.Graduation_Year ? ' · Class of ' + item.Graduation_Year : '') : 'Alumni Achievement');
  addDescription(card, item.Description);
  addLabelValue(card, 'Achievement Date', item.Achievement_Date);
  if (String(item.Featured).toLowerCase() === 'yes') addBadge(card, 'Featured');
  if (item.External_URL) addButton(card, item.External_URL, 'Read More');
  return card;
}

function renderActivity(item) {
  const card = baseContentCard(item.Title, item.Type || 'Department Activity');
  addLine(card, item.Activity_Date);
  addLine(card, item.Venue);
  addDescription(card, item.Description);
  if (item.Registration_URL) addButton(card, item.Registration_URL, 'Registration / Details');
  return card;
}

function renderMentorship(item) {
  const card = baseContentCard(item.Mentor_Name || 'Alumni Mentor', item.Expertise || 'Mentorship');
  addLine(card, [item.Industry, item.Mentoring_Mode].filter(Boolean).join(' · '));
  addLabelValue(card, 'Availability', item.Availability);
  addDescription(card, item.Description);
  if (item.Contact_URL) addButton(card, item.Contact_URL, 'Connect');
  return card;
}

function baseContentCard(title, kicker) {
  const card = document.createElement('article');
  card.className = 'content-card';
  const small = document.createElement('p');
  small.className = 'card-kicker';
  small.textContent = kicker || '';
  const h3 = document.createElement('h3');
  h3.textContent = title || 'Untitled';
  card.appendChild(small);
  card.appendChild(h3);
  return card;
}

function addLine(card, text) {
  if (!text) return;
  const p = document.createElement('p');
  p.className = 'content-line';
  p.textContent = text;
  card.appendChild(p);
}

function addDescription(card, text) {
  if (!text) return;
  const p = document.createElement('p');
  p.className = 'content-description';
  p.textContent = text;
  card.appendChild(p);
}

function addLabelValue(card, label, value) {
  if (!value) return;
  const p = document.createElement('p');
  p.className = 'label-value';
  const strong = document.createElement('strong');
  strong.textContent = label + ': ';
  p.appendChild(strong);
  p.appendChild(document.createTextNode(value));
  card.appendChild(p);
}

function addBadge(card, text) {
  const span = document.createElement('span');
  span.className = 'badge';
  span.textContent = text;
  card.appendChild(span);
}

function addButton(card, url, label) {
  const safe = safeUrl(url);
  if (!safe) return;
  const wrap = document.createElement('div');
  wrap.className = 'card-actions';
  const link = document.createElement('a');
  link.className = 'button button-small button-solid';
  link.href = safe;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = label;
  wrap.appendChild(link);
  card.appendChild(wrap);
}

function safeUrl(value) {
  try {
    const url = new URL(String(value), window.location.href);
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.href;
  } catch (e) {}
  return '';
}
