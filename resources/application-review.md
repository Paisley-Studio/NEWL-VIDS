# How the training was verified

The NEWL AFRICA application source (a single-page HTML/CSS/JavaScript application using Firebase Authentication, Firestore and a Cloudflare Worker for SMS) was reviewed in full before any script was written. Every statement in the six lessons is based on behaviour confirmed in that source. Where something could not be confirmed, the training does not present it as a capability.

## Roles and access

| Confirmed in the source | How the training presents it |
|---|---|
| Two sign-in roles only: `admin` and `team_leader` (`handleLogin` checks the profile role against the selected tab). | Lesson 01 explains the two roles. Board members and project owners are described as having **no separate role**; their oversight comes through administrators. |
| Usernames without “@” are converted to `username@newl.africa`. | Lesson 01 and 02. |
| Team leaders see only their assigned projects, casuals, logs, fund requests, notifications and settings. | Lessons 01 and 06 describe what each role **sees in the interface**. |
| Casual workers have no account. | Lessons 01 and 03. |

## Features confirmed and taught

- Admin dashboard: summary line, four metric cards, Active Projects, Recent Activity (latest 6 audit entries), “Needs your attention” banner for pending fund requests / approvals.
- Projects: New Project form (Name and SMP required; PO, module package, region, location, client, budget, optional dates, team leader, description, status), status filter chips, search by name/SMP/PO/module package, global top-bar search (projects only).
- Progress bar: `logs × 8 + 10` while active, capped at 90%, 100% only when completed. Taught as an **activity indicator**, not physical completion.
- Team Leaders: auto-generated password, admin password confirmation, re-sign-in after account creation, credentials panel, Assign Projects, Message (in-app + SMS), Reset Password, Send Credentials, delete (Auth account must be removed separately).
- Casuals: name and phone required, role, optional daily rate, project restricted to the team leader's projects, SMS to worker and admin on add/remove, password confirmation on removal.
- Daily logs: project, date (defaults to today), hours (defaults to 8), work done (required), materials, casuals present. `sites_touched` is filled **automatically** from sites linked to the project. Logs have no edit function.
- Financials: Remaining = budget − expenditure − **approved additional funds**; pending requests shown separately and not deducted. Six charts (monthly trend for six months, categories by first word of item, budget vs outflow, cumulative, top spending, fund request status). Per-project breakdown with orange above 80% and red above 100%.
- Expenditure is recorded by administrators (item, amount, date, receipt).
- Fund requests: amount > 0 and reason required; admin approves (amount pre-filled, adjustable) or declines (optional reason). Notifications and SMS to the team leader; “release confirmed” SMS to the admin on approval.
- Project completion: team leader Mark Complete → Pending Approval → admin Approve (Completed) or Send Back (Active, with reason).
- Notifications: per-recipient, unread marker, open-to-mark-read, mark all read.
- SMS: Cloudflare Worker → Mobilesasa; number normalised to 254…; dry-run mode; per-event toggles that affect SMS only; Test SMS; Recent SMS list.
- Audit log: time, user, action, details; latest 100 shown; no edit/delete in the interface.

## Details the training is careful about

- **Sites:** projects store a `sites` list, but the interface has no screen to link sites. The training therefore only says sites are recorded with a log “where sites have been linked to a project”.
- **SMS settings are stored in the browser** (`localStorage`), not in Firestore. Lesson 05 states that settings must be checked on each computer/browser.
- **Recent SMS list** is held in memory and clears when the page reloads. Lesson 05 says it covers the current browser session.
- **Charts summarise recorded data** and do not verify spending; **daily logs record what is entered** and do not verify site work (Lessons 03 and 04).

## Observations for the technical team

These are outside the scope of the training videos but were noticed during the review. They do not change what the training teaches; they are recorded here so they can be assessed.

1. **Reset Password updates Firestore only.** `resetTLPassword` writes the new value to `users/{id}.initial_password` but does not change the Firebase Authentication password, so the team leader's actual sign-in password is unchanged. Lesson 02 advises confirming with the technical team before sharing a reset password.
2. **Initial passwords are stored in plain text** in the `users` collection and displayed on the Team Leaders page. Consider removing the stored copy after first sign-in and using Firebase password-reset emails instead.
3. **All collections are loaded for every signed-in user** (`loadAllData` reads users, projects, casuals, daily_logs, budgets, notifications and audit). Role separation is enforced by the interface only, so **Firestore security rules must enforce it**. Lesson 06 emphasises rules without describing their current configuration (which was not supplied).
4. **Password confirmations re-authenticate the current user.** For team leaders, `requireAdminPassword` (used when removing a casual) checks the team leader's own password, not an administrator's.
5. **Deleting a team leader leaves the Firebase Auth account active** (the app says so in its toast). Lessons 02 and 06 instruct administrators to have it removed.
6. The admin “release confirmed” SMS shares the `fundApproved` toggle with the team leader's approval SMS.
7. The Firebase web configuration is embedded in the page, which is normal for Firebase web apps; it is not shown in the training. The Worker URL, Auth UID, phone numbers, e-mail addresses and team-leader passwords visible in the supplied screenshots were **redacted** before use.
