VIT Aero Alumni Connect — Final Architecture
Portal: VIT Aero Alumni Connect  
Department of Aerospace Engineering  
School of Mechanical Engineering (SMEC)  
VIT Bhopal University
What changed
The public website is now completely controlled by GitHub Pages.
`index.html` = GitHub landing page
`directory.html` = GitHub alumni directory
`opportunities.html` = GitHub opportunities page
`achievements.html` = GitHub achievements page
`activities.html` = GitHub activities page
`mentorship.html` = GitHub mentorship page
`register.html` = GitHub registration page
`style.css` + `app.js` = GitHub frontend
`data/*.json` = public data consumed by GitHub Pages
Google Apps Script = backend/database synchronisation only
Google Sheets = source of truth
The public pages do not redirect to Apps Script for directory/content pages.
Why this design
GitHub Pages is a static hosting service. It cannot directly read a private Google Sheet. The backend therefore publishes only approved/public information into JSON files inside the GitHub repository. GitHub Pages then reads those local JSON files with normal browser `fetch()` calls.
This avoids the previous cross-origin JSONP / Apps Script Content Service redirect dependency.
Google Apps Script files
Copy these into the Apps Script project bound to the existing Google Sheet:
`Code.gs`
`appsscript.json`
GitHub Pages files
Copy all files under `GitHub-Pages/` into the GitHub repository root, including the `data/` folder.
One-time GitHub token setup
The Apps Script needs permission to update the public JSON files in the GitHub repository.
Open the GitHub repository.
Create a fine-grained Personal Access Token for the repository `sarathkumarsebastin/aero-alumni-connect`.
Give it repository Contents: Read and write permission.
In Apps Script open Project Settings → Script properties.
Add:
Property: `GITHUB_TOKEN`
Value: your GitHub token
Never put the token in `Code.gs`, GitHub, HTML, CSS, JavaScript, or Google Sheets.
One-time Apps Script setup
Paste the new `Code.gs`.
Paste the new `appsscript.json` if your project supports manifest editing.
Save.
Add the `GITHUB_TOKEN` script property.
Run `setupPortal()` once and authorise it.
Run `syncAllPublicData()` once and authorise it if prompted.
Run `installSyncTrigger()` once if `setupPortal()` did not install it.
The installable spreadsheet edit trigger will then synchronise the changed public data family when an administrator edits a public sheet.
Important trigger behaviour
When an administrator manually changes a row in Google Sheets:
`Alumni_Master` → updates `data/alumni.json`
`Opportunities` → updates `data/opportunities.json`
`Achievements` → updates `data/achievements.json`
`Activities` → updates `data/activities.json`
`Mentorship` → updates `data/mentorship.json`
When an alumni registers through the GitHub registration page, Apps Script writes the new row as `Pending` + `Profile_Public=No` and explicitly refreshes the alumni JSON. The new person therefore remains private until approved.
Publishing rules
Alumni
A profile appears publicly only when:
`Profile_Public = Yes`
`Status = Approved`
The following are deliberately excluded from the public JSON:
Personal_Email
Mobile_Number
WhatsApp_Number
Registration_No
Registration_Date
Last_Updated
Status
Opportunities / Achievements / Activities / Mentorship
Only rows with:
`Status = Published`
are written into the public JSON files.
Current Apps Script web app
`https://script.google.com/macros/s/AKfycbznZGMhrKljT33DuwKFADn_caJxnQXC0DgMuGA9q63g-jn9gzm1AALZbN7fzaqUwgjyCA/exec`
Final verification
After deployment:
Open the GitHub Pages home page.
Click each menu item.
Confirm the browser remains on GitHub Pages.
Add/change an opportunity in Google Sheets and set `Status` to `Published`.
Confirm `data/opportunities.json` receives a GitHub commit.
Refresh `opportunities.html`.
Repeat for Achievements, Activities and Mentorship.
Approve an alumni row with `Profile_Public=Yes` and `Status=Approved`.
Confirm it appears in `directory.html`.
If GitHub Pages is temporarily serving an older file because of deployment/cache delay, use a hard refresh and allow a short period for the GitHub Pages deployment to complete.
