# Screen sequence

The supplied archive contained 26 captures of the live application, several of them different stages of the same workflow. They were inspected individually and arranged into the order a user actually meets them, rather than archive or alphabetical order. The source of truth is `scripts/production/screenshots.json`; `scripts/production/sanitize_screenshots.py` produces the published copies in `public/screenshots/`.

**Redaction.** Five captures contained personal or sensitive data (sign-in usernames, team-leader passwords, phone numbers, e-mail addresses, a Firebase Auth UID and the SMS Worker URL). These regions are pixelated and blurred in the published copies. The original captures are kept locally in `Images/` and are excluded from Git.

**Alignment.** Before/after captures of the same screen were aligned to the pixel (`shift` in the inventory) so that the training can cross-fade between them, for example the Financials page before and after a fund request is approved.

## Logical journey

| # | Published file | Original capture | Screen | Used in |
|---|---|---|---|---|
| 1 | 01-admin-login | 232520 | Login — Admin tab (username redacted) | L01 |
| 2 | 02-admin-dashboard | 232712 | Administrator dashboard | L01, L02, L05 |
| 3 | 03-new-project-form-top | 232937 | New Project — upper fields | L02 |
| 4 | 04-new-project-form-bottom | 233024 | New Project — team leader, description, status | L02 |
| 5 | 05-new-team-leader-form | 233046 | New Team Leader | L02 |
| 6 | 06-projects-list | 233331 | Projects portfolio | L02 |
| 7 | 07-projects-search | 233144 | Projects — global search “KIS” | L02 |
| 8 | 08-team-leaders | 233345 | Team Leaders (credentials, phones, e-mails redacted) | L02 |
| 9 | 09-financials-overview | 233418 | Financials — before any request | L04 |
| 10 | 10-financials-charts | 233431 | Financial analytics | L04 |
| 11 | 11-financials-breakdown | 233446 | Per-project breakdown (14% used) | L04 |
| 12 | 12-daily-logs-admin | 233456 | Daily Logs — administrator (empty) | reference |
| 13 | 13-all-casuals-admin | 233819 | All Casuals — administrator | L03 |
| 14 | 14-notifications | 233832 | Notification centre | L05 |
| 15 | 15-audit-log | 233913 | Audit Log | L05 |
| 16 | 16-settings-profile-sms | 233926 | Settings — profile, Firebase, SMS (phone, UID, Worker URL redacted) | L05, L06 |
| 17 | 17-settings-sms-events | 233943 | SMS auto-fire per event | L05 |
| 18 | 18-team-leader-login | 234750 | Login — Team Leader tab (username redacted) | L01, L03 |
| 19 | 19-team-leader-home | 234514 | Team leader workspace | L01, L03, L04 |
| 20 | 20-add-casual-form | 234533 | Add Casual | L03 |
| 21 | 21-fund-request-form-empty | 234557 | Request Additional Funds — empty | L04 |
| 22 | 22-fund-request-form-filled | 234624 | Request Additional Funds — completed | L04 |
| 23 | 23-admin-dashboard-attention | 234851 | Dashboard — “Needs your attention” | L01, L02, L04 |
| 24 | 24-financials-pending-request | 235139 | Financials — pending request with Approve / Decline | L04 |
| 25 | 25-financials-after-approval | 235224 | Financials — after approval | L04 |
| 26 | 26-financials-charts-after-approval | 235301 | Charts — after approval | L04 |
| 27 | 27-financials-breakdown-after-approval | 235313 | Breakdown — after approval (24% used) | L04 |

Original capture names are `Screenshot 2026-11-12 HHMMSS.png`.

## Views without a supplied screenshot

The following views are needed to teach the workflows but were not in the archive. They are rendered in the videos from the application's own markup and CSS (transcribed from `renderProjectDetail`, `openDailyLogModal`, `openExpenseModal`, `openCompleteProjectModal` and `renderLogs`), at the same 1.35× zoom as the captures, and are labelled on screen “Interface rendered from the application's source · illustrative data”:

- Project detail page (administrator and team leader variants; Overview, Casuals, Logs and Financials tabs)
- Submit Daily Log form
- Add Expenditure form
- Mark Project Complete form
- Team leader Daily Logs page after submission

Illustrative values are consistent with the captures (project KISUMU_NITA, SMP-WO-1851398, team leader Tesh, budget KES 500,000, Mast Mounting KES 70,000). The example worker “John Otieno” and phone number +254712345678 are the application's own form placeholders.
