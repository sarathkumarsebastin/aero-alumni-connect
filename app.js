/**
 * VIT Aero Alumni Connect
 * GitHub Pages frontend
 *
 * Public data:
 *   Google Sheets -> Apps Script -> GitHub data/*.json
 *
 * Registration:
 *   GitHub form -> Apps Script doPost -> Google Sheet
 */

const AAC_CONFIG = {
  portalName: 'VIT Aero Alumni Connect',
  apiUrl: 'https://script.google.com/macros/s/AKfycbznU6WN_BkUJthGkCgYGkyqjhjRvH3S-xD_JCaujFiBCHNqvwp_PZnilMeuc_im6nfM_g/exec',

  // Primary source: raw GitHub content. This avoids GitHub Pages deployment
  // caching and makes Sheet -> GitHub publication visible immediately.
  rawDataBase:
    'https://raw.githubusercontent.com/vitaeroalumni/aero-alumni-connect/main/data/',

  // Fallback source if raw GitHub is temporarily unavailable.
  pagesDataBase: './data/',

  // Apps Script HTMLService responses may originate from either host.
  backendMessageOrigins: [
    'https://script.google.com',
    'https://script.googleusercontent.com'
  ]
};

document.addEventListener('DOMContentLoaded', function() {
  setYear();
  initMobileNavigation();
  initRegistrationForm();
  initDirectoryPage();
  initContentPage();
});

function setYear() {
  document
    .querySelectorAll('[data-current-year]')
    .forEach(function(el) {
      el.textContent =
        new Date().getFullYear();
    });
}

function initMobileNavigation() {
  const toggle =
    document.querySelector('[data-menu-toggle]');

  const nav =
    document.querySelector('[data-mobile-nav]');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', function() {
    const open =
      nav.classList.toggle('is-open');

    toggle.setAttribute(
      'aria-expanded',
      open ? 'true' : 'false'
    );
  });

  nav.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      nav.classList.remove('is-open');
      toggle.setAttribute(
        'aria-expanded',
        'false'
      );
    });
  });
}

/* =====================================================================
   REGISTRATION
   ===================================================================== */

function initRegistrationForm() {
  const form =
    document.getElementById(
      'alumniRegistrationForm'
    );

  if (!form) return;

  const statusBox =
    document.getElementById(
      'registrationStatus'
    );

  const submitButton =
    document.getElementById(
      'submitRegistration'
    );

  const frame =
    document.getElementById(
      'registrationFrame'
    );

  const requestIdField =
    document.getElementById(
      'requestId'
    );

  let activeRequestId = '';
  let responseTimer = null;

  function createRequestId() {
    return (
      'REQ-' +
      Date.now().toString(36) +
      '-' +
      Math.random()
        .toString(36)
        .slice(2, 10)
    );
  }

  window.addEventListener(
    'message',
    function(event) {
      // The registration response comes from the hidden Apps Script iframe.
      // Apps Script HTML Service uses an iframe sandbox, and some browsers
      // can report a different/opaque origin for the sandboxed response.
      // The stronger check here is event.source === the exact iframe window.
      // We therefore do NOT reject the message solely because event.origin
      // differs from the expected Apps Script origins.
      if (
        frame &&
        event.source !== frame.contentWindow
      ) {
        return;
      }

      // The exact iframe window is the trust boundary. Apps Script may
      // redirect the response between script.google.com and
      // script.googleusercontent.com, and sandboxing can expose an opaque
      // origin. Do not reject a valid response because of that redirect.

      const data =
        event.data;

      if (
        !data ||
        data.type !==
          'VIT_AERO_ALUMNI_REGISTRATION'
      ) {
        return;
      }

      if (
        activeRequestId &&
        data.requestId &&
        data.requestId !== activeRequestId
      ) {
        return;
      }

      if (responseTimer) {
        clearTimeout(responseTimer);
        responseTimer = null;
      }

      setSubmitState(
        submitButton,
        false
      );

      if (data.success) {
        showStatus(
          statusBox,
          'success',
          (data.message ||
            'Registration submitted successfully.') +
            (
              data.alumniId
                ? ' Your Alumni ID is ' +
                  data.alumniId +
                  '.'
                : ''
            )
        );

        form.reset();

        if (requestIdField) {
          requestIdField.value = '';
        }

        activeRequestId = '';

      } else {
        showStatus(
          statusBox,
          'error',
          data.message ||
            'Registration could not be submitted.'
        );
      }
    }
  );

  form.addEventListener(
    'submit',
    function(event) {
      clearStatus(statusBox);

      if (!form.checkValidity()) {
        event.preventDefault();
        form.reportValidity();
        return;
      }

      activeRequestId =
        createRequestId();

      if (requestIdField) {
        requestIdField.value =
          activeRequestId;
      }

      setSubmitState(
        submitButton,
        true
      );

      responseTimer =
        setTimeout(function() {
          setSubmitState(
            submitButton,
            false
          );

          showStatus(
            statusBox,
            'error',
            'The registration server did not return a response. The form may have been saved already; please wait a moment before submitting again.'
          );

          responseTimer = null;
        }, 30000);
    }
  );
}

function setSubmitState(button, busy) {
  if (!button) return;

  if (!button.dataset.originalText) {
    button.dataset.originalText =
      button.textContent;
  }

  button.disabled =
    Boolean(busy);

  button.textContent =
    busy
      ? 'Submitting...'
      : button.dataset.originalText;
}

function showStatus(
  box,
  type,
  message
) {
  if (!box) return;

  box.hidden = false;
  box.className =
    'alert alert-' + type;
  box.textContent =
    message;
}

function clearStatus(box) {
  if (!box) return;

  box.hidden = true;
  box.className = 'alert';
  box.textContent = '';
}

/* =====================================================================
   DIRECTORY
   ===================================================================== */

function initDirectoryPage() {
  const page =
    document.querySelector(
      '[data-page="directory"]'
    );

  if (!page) return;

  const grid =
    document.getElementById(
      'directoryGrid'
    );

  const empty =
    document.getElementById(
      'directoryEmpty'
    );

  const loading =
    document.getElementById(
      'directoryLoading'
    );

  const errorBox =
    document.getElementById(
      'directoryError'
    );

  const search =
    document.getElementById(
      'directorySearch'
    );

  const year =
    document.getElementById(
      'directoryYear'
    );

  loadData('alumni.json')
    .then(function(payload) {
      const alumni =
        Array.isArray(payload.items)
          ? payload.items
          : [];

      if (loading) {
        loading.hidden = true;
      }

      populateYearFilter(
        year,
        alumni
      );

      renderDirectory(
        alumni,
        grid,
        empty,
        search,
        year
      );

      if (search) {
        search.addEventListener(
          'input',
          function() {
            renderDirectory(
              alumni,
              grid,
              empty,
              search,
              year
            );
          }
        );
      }

      if (year) {
        year.addEventListener(
          'change',
          function() {
            renderDirectory(
              alumni,
              grid,
              empty,
              search,
              year
            );
          }
        );
      }
    })
    .catch(function(error) {
      if (loading) {
        loading.hidden = true;
      }

      if (errorBox) {
        errorBox.hidden = false;
        errorBox.textContent =
          'The alumni directory could not be loaded. Please try again shortly.';
      }

      console.error(
        'Directory error:',
        error
      );
    });
}

function populateYearFilter(
  select,
  records
) {
  if (!select) return;

  const years =
    Array.from(
      new Set(
        records
          .map(function(item) {
            return String(
              pick(
                item,
                'Graduation_Year',
                'graduationYear'
              ) || ''
            ).trim();
          })
          .filter(Boolean)
      )
    ).sort(function(a, b) {
      return Number(b) - Number(a);
    });

  years.forEach(function(value) {
    const option =
      document.createElement('option');

    option.value = value;
    option.textContent = value;

    select.appendChild(option);
  });
}

function renderDirectory(
  records,
  grid,
  empty,
  search,
  year
) {
  if (!grid) return;

  const q =
    search
      ? search.value
          .trim()
          .toLowerCase()
      : '';

  const selectedYear =
    year ? year.value : '';

  const filtered =
    records.filter(function(item) {
      const haystack = [
        pick(item, 'Full_Name', 'fullName'),
        pick(item, 'Degree', 'degree'),
        pick(item, 'Organization', 'organization'),
        pick(item, 'Designation', 'designation'),
        pick(item, 'Industry_Sector', 'industrySector'),
        pick(item, 'Technical_Expertise', 'technicalExpertise'),
        pick(item, 'Current_City', 'currentCity'),
        pick(item, 'Current_Country', 'currentCountry')
      ]
        .join(' ')
        .toLowerCase();

      return (
        (!q ||
          haystack.indexOf(q) >= 0) &&
        (
          !selectedYear ||
          String(
            pick(
              item,
              'Graduation_Year',
              'graduationYear'
            )
          ) === selectedYear
        )
      );
    });

  grid.innerHTML = '';

  filtered.forEach(function(item) {
    grid.appendChild(
      alumniCard(item)
    );
  });

  if (empty) {
    empty.hidden =
      filtered.length !== 0;
  }
}

function alumniCard(item) {
  const card =
    document.createElement('article');

  card.className =
    'profile-card';

  const name =
    document.createElement('h3');

  name.textContent =
    pick(
      item,
      'Full_Name',
      'fullName'
    ) ||
    'Alumni';

  const meta =
    document.createElement('p');

  meta.className =
    'profile-meta';

  const degree =
    pick(item, 'Degree', 'degree');

  const year =
    pick(
      item,
      'Graduation_Year',
      'graduationYear'
    );

  meta.textContent =
    [degree, year
      ? 'Class of ' + year
      : '']
      .filter(Boolean)
      .join(' · ');

  const role =
    document.createElement('p');

  role.textContent =
    [
      pick(item, 'Designation', 'designation'),
      pick(item, 'Organization', 'organization')
    ]
      .filter(Boolean)
      .join(' · ') ||
    'Professional profile';

  const location =
    document.createElement('p');

  location.className =
    'muted';

  location.textContent =
    [
      pick(item, 'Current_City', 'currentCity'),
      pick(item, 'Current_Country', 'currentCountry')
    ]
      .filter(Boolean)
      .join(', ');

  card.appendChild(name);
  card.appendChild(meta);
  card.appendChild(role);

  if (location.textContent) {
    card.appendChild(location);
  }

  const sector =
    pick(
      item,
      'Industry_Sector',
      'industrySector'
    );

  const expertise =
    pick(
      item,
      'Technical_Expertise',
      'technicalExpertise'
    );

  if (sector || expertise) {
    const tags =
      document.createElement('div');

    tags.className =
      'tag-list';

    [sector, expertise]
      .filter(Boolean)
      .forEach(function(text) {
        const tag =
          document.createElement('span');

        tag.className =
          'tag';

        tag.textContent =
          text;

        tags.appendChild(tag);
      });

    card.appendChild(tags);
  }

  const actions =
    document.createElement('div');

  actions.className =
    'card-actions';

  if (
    String(
      pick(
        item,
        'Interested_Mentoring',
        'interestedMentoring'
      )
    ).toLowerCase() === 'yes'
  ) {
    const badge =
      document.createElement('span');

    badge.className =
      'badge';

    badge.textContent =
      'Mentor';

    actions.appendChild(badge);
  }

  const linkedin =
    pick(
      item,
      'LinkedIn_URL',
      'linkedinUrl'
    );

  if (linkedin) {
    const link =
      document.createElement('a');

    link.className =
      'text-link';

    link.href =
      safeUrl(linkedin);

    link.target =
      '_blank';

    link.rel =
      'noopener noreferrer';

    link.textContent =
      'LinkedIn';

    if (link.href) {
      actions.appendChild(link);
    }
  }

  if (actions.children.length) {
    card.appendChild(actions);
  }

  return card;
}

/* =====================================================================
   CONTENT PAGES
   ===================================================================== */

function initContentPage() {
  const page =
    document.querySelector(
      '[data-content-page]'
    );

  if (!page) return;

  const type =
    page.getAttribute(
      'data-content-page'
    );

  const config = {
    opportunities: {
      file: 'opportunities.json',
      renderer: renderOpportunity
    },
    achievements: {
      file: 'achievements.json',
      renderer: renderAchievement
    },
    activities: {
      file: 'activities.json',
      renderer: renderActivity
    },
    mentorship: {
      file: 'mentorship.json',
      renderer: renderMentorship
    }
  }[type];

  if (!config) return;

  const grid =
    document.getElementById(
      'contentGrid'
    );

  const empty =
    document.getElementById(
      'contentEmpty'
    );

  const loading =
    document.getElementById(
      'contentLoading'
    );

  const errorBox =
    document.getElementById(
      'contentError'
    );

  loadData(config.file)
    .then(function(payload) {
      const items =
        Array.isArray(payload.items)
          ? payload.items
          : [];

      if (loading) {
        loading.hidden = true;
      }

      grid.innerHTML = '';

      items.forEach(function(item) {
        grid.appendChild(
          config.renderer(item)
        );
      });

      if (empty) {
        empty.hidden =
          items.length !== 0;
      }
    })
    .catch(function(error) {
      if (loading) {
        loading.hidden = true;
      }

      if (errorBox) {
        errorBox.hidden = false;
        errorBox.textContent =
          'This section could not be loaded at this time. Please try again shortly.';
      }

      console.error(
        'Content page error:',
        error
      );
    });
}

/**
 * Primary source is raw.githubusercontent.com.
 * Fallback is the GitHub Pages /data directory.
 */
async function loadData(fileName) {
  const stamp =
    Date.now();

  const sources = [
    AAC_CONFIG.rawDataBase +
      fileName +
      '?v=' +
      stamp,

    AAC_CONFIG.pagesDataBase +
      fileName +
      '?v=' +
      stamp
  ];

  let lastError =
    null;

  for (const url of sources) {
    try {
      const response =
        await fetch(
          url,
          {
            cache: 'no-store'
          }
        );

      if (!response.ok) {
        throw new Error(
          'HTTP ' +
          response.status +
          ' for ' +
          url
        );
      }

      const payload =
        await response.json();

      if (
        !payload ||
        !Array.isArray(payload.items)
      ) {
        throw new Error(
          'Invalid public data format.'
        );
      }

      return payload;

    } catch (error) {
      lastError =
        error;
    }
  }

  throw lastError ||
    new Error(
      'No public data source was available.'
    );
}

function renderOpportunity(item) {
  const card =
    baseContentCard(
      pick(item, 'Title', 'title') ||
        'Opportunity',
      pick(item, 'Type', 'type') ||
        'Opportunity'
    );

  addLine(
    card,
    pick(item, 'Organization', 'organization')
  );

  addLine(
    card,
    pick(item, 'Location', 'location')
  );

  addDescription(
    card,
    pick(item, 'Description', 'description')
  );

  addLabelValue(
    card,
    'Eligibility',
    pick(item, 'Eligibility', 'eligibility')
  );

  addLabelValue(
    card,
    'Deadline',
    pick(item, 'Deadline', 'deadline')
  );

  const url =
    pick(
      item,
      'Application_URL',
      'applicationUrl'
    );

  if (url) {
    addButton(
      card,
      url,
      'View Opportunity'
    );
  }

  return card;
}

function renderAchievement(item) {
  const card =
    baseContentCard(
      pick(item, 'Title', 'title') ||
        'Achievement',
      pick(item, 'Category', 'category') ||
        'Achievement'
    );

  const alumni =
    pick(
      item,
      'Alumni_Name',
      'alumniName'
    );

  const year =
    pick(
      item,
      'Graduation_Year',
      'graduationYear'
    );

  addLine(
    card,
    alumni
      ? alumni +
        (
          year
            ? ' · Class of ' +
              year
            : ''
        )
      : 'Alumni Achievement'
  );

  addDescription(
    card,
    pick(
      item,
      'Description',
      'description'
    )
  );

  addLabelValue(
    card,
    'Achievement Date',
    pick(
      item,
      'Achievement_Date',
      'achievementDate'
    )
  );

  if (
    String(
      pick(
        item,
        'Featured',
        'featured'
      )
    ).toLowerCase() === 'yes'
  ) {
    addBadge(
      card,
      'Featured'
    );
  }

  const url =
    pick(
      item,
      'External_URL',
      'externalUrl'
    );

  if (url) {
    addButton(
      card,
      url,
      'Read More'
    );
  }

  return card;
}

function renderActivity(item) {
  const card =
    baseContentCard(
      pick(item, 'Title', 'title') ||
        'Department Activity',
      pick(item, 'Type', 'type') ||
        'Department Activity'
    );

  addLine(
    card,
    pick(
      item,
      'Activity_Date',
      'activityDate'
    )
  );

  addLine(
    card,
    pick(item, 'Venue', 'venue')
  );

  addDescription(
    card,
    pick(
      item,
      'Description',
      'description'
    )
  );

  const url =
    pick(
      item,
      'Registration_URL',
      'registrationUrl'
    );

  if (url) {
    addButton(
      card,
      url,
      'Registration / Details'
    );
  }

  return card;
}

function renderMentorship(item) {
  const card =
    baseContentCard(
      pick(
        item,
        'Mentor_Name',
        'mentorName'
      ) ||
        'Alumni Mentor',
      pick(
        item,
        'Expertise',
        'expertise'
      ) ||
        'Mentorship'
    );

  addLine(
    card,
    [
      pick(
        item,
        'Industry',
        'industry'
      ),
      pick(
        item,
        'Mentoring_Mode',
        'mentoringMode'
      )
    ]
      .filter(Boolean)
      .join(' · ')
  );

  addLabelValue(
    card,
    'Availability',
    pick(
      item,
      'Availability',
      'availability'
    )
  );

  addDescription(
    card,
    pick(
      item,
      'Description',
      'description'
    )
  );

  const url =
    pick(
      item,
      'Contact_URL',
      'contactUrl'
    );

  if (url) {
    addButton(
      card,
      url,
      'Connect'
    );
  }

  return card;
}

/* =====================================================================
   DOM HELPERS
   ===================================================================== */

function pick(item, primary, secondary) {
  if (!item) return '';

  if (
    item[primary] !== undefined &&
    item[primary] !== null
  ) {
    return item[primary];
  }

  return secondary &&
    item[secondary] !== undefined &&
    item[secondary] !== null
      ? item[secondary]
      : '';
}

function baseContentCard(
  title,
  kicker
) {
  const card =
    document.createElement('article');

  card.className =
    'content-card';

  const small =
    document.createElement('p');

  small.className =
    'card-kicker';

  small.textContent =
    kicker || '';

  const h3 =
    document.createElement('h3');

  h3.textContent =
    title || 'Untitled';

  card.appendChild(small);
  card.appendChild(h3);

  return card;
}

function addLine(card, text) {
  if (!text) return;

  const p =
    document.createElement('p');

  p.className =
    'content-line';

  p.textContent =
    text;

  card.appendChild(p);
}

function addDescription(
  card,
  text
) {
  if (!text) return;

  const p =
    document.createElement('p');

  p.className =
    'content-description';

  p.textContent =
    text;

  card.appendChild(p);
}

function addLabelValue(
  card,
  label,
  value
) {
  if (!value) return;

  const p =
    document.createElement('p');

  p.className =
    'label-value';

  const strong =
    document.createElement('strong');

  strong.textContent =
    label + ': ';

  p.appendChild(strong);
  p.appendChild(
    document.createTextNode(
      value
    )
  );

  card.appendChild(p);
}

function addBadge(
  card,
  text
) {
  const span =
    document.createElement('span');

  span.className =
    'badge';

  span.textContent =
    text;

  card.appendChild(span);
}

function addButton(
  card,
  url,
  label
) {
  const safe =
    safeUrl(url);

  if (!safe) return;

  const wrap =
    document.createElement('div');

  wrap.className =
    'card-actions';

  const link =
    document.createElement('a');

  link.className =
    'button button-small button-solid';

  link.href =
    safe;

  link.target =
    '_blank';

  link.rel =
    'noopener noreferrer';

  link.textContent =
    label;

  wrap.appendChild(link);
  card.appendChild(wrap);
}

function safeUrl(value) {
  try {
    const url =
      new URL(
        String(value),
        window.location.href
      );

    if (
      url.protocol === 'https:' ||
      url.protocol === 'http:'
    ) {
      return url.href;
    }
  } catch (error) {
    return '';
  }

  return '';
}
