# Lesson 06 — System Administration, Oversight and Best Practices

**Theme:** Managing the platform responsibly and understanding its underlying architecture.  
**Audience:** Administrators, Board members, Project owners, Team leaders  
**Running time:** 6:46 · **Narration:** 801 words · **Voice:** mature American male (en-US-ChristopherNeural)

## Learning objectives

- Describe the administrator's responsibilities
- Manage user access responsibly
- Explain the platform's architecture in plain terms
- Understand what security depends on
- Apply best practices for reliable records and effective oversight

## Full narration script

### Welcome

Lesson six: system administration, oversight and best practices. In this final lesson, we'll look at the administrator's responsibilities, how the platform is built, and the habits that keep its records reliable.

### The administrator's responsibilities

Administrators carry a special responsibility, because they control the platform's structure and its financial decisions. They set up projects accurately, with correct references and budgets, and they manage team leaders, their credentials, and their project assignments. They record expenditure with proper descriptions and references, and they review fund requests and completed projects promptly, documenting the reasons for their decisions. And they maintain the system's settings, review the audit log, and keep the Board and project owners informed.

### User access

Access is based on the two sign-in roles. Administrators see every area of the platform. Team leaders see only their own projects, their casual workers, their logs, their fund requests and their notifications. Every person should have their own account. Accounts should never be shared, because the audit log identifies people by the account they signed in with. When a team leader leaves the organisation, remove them from their projects, delete their profile, and ask your technical administrator to remove their sign-in account from Firebase, so that it can no longer be used.

### Profile and settings

The Settings page begins with My Profile, showing your name, username, phone number and role. We've hidden the phone number here. Next to it, the Firebase panel shows the platform's project name, your unique account identifier, and whether the connection to the database is active. Treat your account identifier as private. Team leaders see the same profile and connection panels. The SMS configuration is visible to administrators only.

### How the platform is built

Let's look, in simple terms, at how the platform is built. The application runs in a web browser, on a computer or a phone. There's nothing to install. When someone signs in, their identity is checked by Firebase Authentication: Google's secure sign-in service. The platform's information is stored in Firestore, a cloud database also provided by Google. Firestore holds seven main collections: users, projects, casuals, daily logs, budgets, notifications, and the audit log. For SMS, the application sends each message to a Cloudflare Worker, which forwards it to Mobilesasa for delivery to mobile phones. The application never contacts Mobilesasa directly; it always goes through the Worker.

### The main data areas

Each collection has a clear purpose. Users holds administrator and team leader profiles. Projects holds project details and assignments. And casuals holds worker records, linked to their projects. Daily logs holds field reports. Budgets holds each project's expenditure and additional fund requests. Notifications holds in-app alerts, and audit holds the history of actions.

### Security and configuration

Security is a shared responsibility. The platform's protection depends on several things working together. Correctly configured Firebase Authentication, so that only registered users can sign in. Firestore security rules, which decide who can read or change each type of record — not just what the screens choose to display. Careful validation of the information entered, and good habits from every user. No system is completely immune to attack. These controls reduce risk; they don't eliminate it. So the technical team should review the Firestore rules and the Worker's configuration regularly. And passwords, configuration values and keys must never be shared in messages, screenshots or documents.

### Best practices

Let's bring it together, with best practices for reliable records. Enter data accurately the first time. Check project references, budgets and phone numbers before saving. Report daily and honestly. A short, accurate log submitted on the day is worth far more than a detailed one written from memory a week later. Describe expenses consistently, and always include a receipt or reference. Give clear reasons for every fund request, and for every decision. And protect access: keep accounts personal, sign out on shared devices, and remove access promptly when someone leaves.

### What the Board should look for

For Board members and project owners, the platform offers a dependable basis for oversight, provided you ask the right questions. Are projects active and reporting regularly, or have their daily logs gone quiet? How much of each budget has been used, and how much remains? How often are additional funds requested, for what reasons, and how were those requests decided? And does the audit trail show the expected people taking the expected actions? Administrators can walk the Board through the dashboard, the financial overview and the audit log, to answer each of these questions.

### Summary

This brings the NEWL AFRICA Digital System Training programme to a close. You've seen how projects are created and assigned, how field activity is reported, how money is allocated, requested and approved, and how notifications and the audit log keep everyone informed and accountable. The platform is a powerful tool, but its value depends on the people who use it. Use it responsibly, keep it accurate, and keep it transparent. Thank you for completing this training.

### Credits

This training experience was produced by KEYPOLE TECHNOLOGIES.

## Scene plan

Timecodes are taken from the rendered timeline. Visual actions start ~0.25 s before the words they illustrate.

### Scene 1 · Welcome · 0:00–0:21

**Visual:** Cinematic opening — NEWL AFRICA identity, lesson number, title and topic chips over animated geometric backdrop.

| Time | Narration | Visual direction |
|---|---|---|
| 0:05 | Lesson six: system administration, oversight and best practices. | — |
| 0:11 | In this final lesson, we'll look at the administrator's responsibilities, how the platform is built, and the habits that keep its records reliable. | — |

### Scene 2 · The administrator's responsibilities · 0:20–0:58

**Visual:** Motion graphic (cards) — “What administrators are responsible for”.

| Time | Narration | Visual direction |
|---|---|---|
| 0:21 | Administrators carry a special responsibility, because they control the platform's structure and its financial decisions. | reveal 0 |
| 0:29 | They set up projects accurately, with correct references and budgets, and they manage team leaders, their credentials, and their project assignments. | reveal 2; focus item 2 |
| 0:39 | They record expenditure with proper descriptions and references, and they review fund requests and completed projects promptly, documenting the reasons for their decisions. | reveal 4; focus item 4 |
| 0:50 | And they maintain the system's settings, review the audit log, and keep the Board and project owners informed. | reveal 6; focus item 6 |

### Scene 3 · User access · 0:58–1:39

**Visual:** Motion graphic (compare) — “Access follows the two sign-in roles”.

| Time | Narration | Visual direction |
|---|---|---|
| 0:58 | Access is based on the two sign-in roles. | reveal 0 |
| 1:02 | Administrators see every area of the platform. | reveal 1; focus item 1 |
| 1:07 | Team leaders see only their own projects, their casual workers, their logs, their fund requests and their notifications. | reveal 2; focus item 2 |
| 1:16 | Every person should have their own account. Accounts should never be shared, because the audit log identifies people by the account they signed in with. | reveal 3 |
| 1:26 | When a team leader leaves the organisation, remove them from their projects, delete their profile, and ask your technical administrator to remove their sign-in account from Firebase, so that it can no longer be used. | callout “When someone leaves”; reveal 3 |

### Scene 4 · Profile and settings · 1:39–2:12

**Visual:** Application screenshot: Settings â€” profile, Firebase, SMS (16-settings-profile-sms.png).

| Time | Narration | Visual direction |
|---|---|---|
| 1:39 | The Settings page begins with My Profile, showing your name, username, phone number and role. We've hidden the phone number here. | camera → [350, 110, 1140, 500]; highlight “My Profile”; cursor clicks (183, 654) |
| 1:49 | Next to it, the Firebase panel shows the platform's project name, your unique account identifier, and whether the connection to the database is active. Treat your account identifier as private. | camera → [1120, 110, 1908, 500]; highlight “Firebase”, “Connected” |
| 2:02 | Team leaders see the same profile and connection panels. The SMS configuration is visible to administrators only. | full view |

### Scene 5 · How the platform is built · 2:12–3:08

**Visual:** Motion graphic (architecture) — “How the platform is built”.

| Time | Narration | Visual direction |
|---|---|---|
| 2:12 | Let's look, in simple terms, at how the platform is built. | reveal 0 |
| 2:18 | The application runs in a web browser, on a computer or a phone. There's nothing to install. | reveal 1 |
| 2:25 | When someone signs in, their identity is checked by Firebase Authentication: Google's secure sign-in service. | reveal 2; sfx: login |
| 2:34 | The platform's information is stored in Firestore, a cloud database also provided by Google. | reveal 3; sfx: data |
| 2:41 | Firestore holds seven main collections: users, projects, casuals, daily logs, budgets, notifications, and the audit log. | reveal 4 |
| 2:52 | For SMS, the application sends each message to a Cloudflare Worker, which forwards it to Mobilesasa for delivery to mobile phones. The application never contacts Mobilesasa directly; it always goes through the Worker. | reveal 5; sfx: sms |

### Scene 6 · The main data areas · 3:07–3:38

**Visual:** Motion graphic (cards) — “Firestore collections”.

| Time | Narration | Visual direction |
|---|---|---|
| 3:08 | Each collection has a clear purpose. Users holds administrator and team leader profiles. Projects holds project details and assignments. And casuals holds worker records, linked to their projects. | reveal 3 |
| 3:24 | Daily logs holds field reports. Budgets holds each project's expenditure and additional fund requests. Notifications holds in-app alerts, and audit holds the history of actions. | reveal 7 |

### Scene 7 · Security and configuration · 3:38–4:32

**Visual:** Motion graphic (cards) — “What the platform's security depends on”.

| Time | Narration | Visual direction |
|---|---|---|
| 3:39 | Security is a shared responsibility. The platform's protection depends on several things working together. | reveal 0 |
| 3:47 | Correctly configured Firebase Authentication, so that only registered users can sign in. | reveal 1; focus item 1 |
| 3:53 | Firestore security rules, which decide who can read or change each type of record — not just what the screens choose to display. | reveal 2; focus item 2 |
| 4:03 | Careful validation of the information entered, and good habits from every user. | reveal 4; focus item 4 |
| 4:08 | No system is completely immune to attack. These controls reduce risk; they don't eliminate it. So the technical team should review the Firestore rules and the Worker's configuration regularly. | reveal 4 |
| 4:23 | And passwords, configuration values and keys must never be shared in messages, screenshots or documents. | reveal 4; footer line |

### Scene 8 · Best practices · 4:31–5:17

**Visual:** Motion graphic (checklist) — “Best practices for reliable records”.

| Time | Narration | Visual direction |
|---|---|---|
| 4:32 | Let's bring it together, with best practices for reliable records. | reveal 0 |
| 4:37 | Enter data accurately the first time. Check project references, budgets and phone numbers before saving. | reveal 1; focus item 1 |
| 4:46 | Report daily and honestly. A short, accurate log submitted on the day is worth far more than a detailed one written from memory a week later. | reveal 2; focus item 2 |
| 4:56 | Describe expenses consistently, and always include a receipt or reference. | reveal 3; focus item 3 |
| 5:02 | Give clear reasons for every fund request, and for every decision. | reveal 4; focus item 4 |
| 5:08 | And protect access: keep accounts personal, sign out on shared devices, and remove access promptly when someone leaves. | reveal 5; focus item 5 |

### Scene 9 · What the Board should look for · 5:17–6:00

**Visual:** Motion graphic (cards) — “Questions for effective oversight”.

| Time | Narration | Visual direction |
|---|---|---|
| 5:17 | For Board members and project owners, the platform offers a dependable basis for oversight, provided you ask the right questions. | reveal 0 |
| 5:26 | Are projects active and reporting regularly, or have their daily logs gone quiet? | reveal 1; focus item 1 |
| 5:32 | How much of each budget has been used, and how much remains? | reveal 2; focus item 2 |
| 5:38 | How often are additional funds requested, for what reasons, and how were those requests decided? | reveal 3; focus item 3 |
| 5:45 | And does the audit trail show the expected people taking the expected actions? | reveal 4; focus item 4 |
| 5:50 | Administrators can walk the Board through the dashboard, the financial overview and the audit log, to answer each of these questions. | reveal 4; footer line |

### Scene 10 · Summary · 5:59–6:35

**Visual:** NEWL AFRICA lesson summary — key takeaways revealed one by one, followed by the next-lesson card.

| Time | Narration | Visual direction |
|---|---|---|
| 6:00 | This brings the NEWL AFRICA Digital System Training programme to a close. | reveal 0 |
| 6:06 | You've seen how projects are created and assigned, how field activity is reported, how money is allocated, requested and approved, and how notifications and the audit log keep everyone informed and accountable. | reveal 4 |
| 6:20 | The platform is a powerful tool, but its value depends on the people who use it. Use it responsibly, keep it accurate, and keep it transparent. | reveal 4 |
| 6:31 | Thank you for completing this training. | reveal 4 |

### Scene 11 · Credits · 6:34–6:46

**Visual:** Production credit — the KEYPOLE TECHNOLOGIES logo with light sweep and the line “Technology. Creativity. Excellence.” on black.

| Time | Narration | Visual direction |
|---|---|---|
| 6:36 | This training experience was produced by KEYPOLE TECHNOLOGIES. | — |
