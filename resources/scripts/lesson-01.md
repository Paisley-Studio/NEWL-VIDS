# Lesson 01 — Introducing the NEWL AFRICA Management System

**Theme:** Understanding the platform, its purpose and the organisational picture.  
**Audience:** Board members, Project owners, Administrators, Team leaders  
**Running time:** 8:14 · **Narration:** 1047 words · **Voice:** mature American male (en-US-ChristopherNeural)

## Learning objectives

- Explain the purpose of the NEWL AFRICA management platform
- Sign in securely using the correct role tab
- Read the administrator dashboard and its summary figures
- Navigate the main areas of the system
- Describe the responsibilities of administrators and team leaders

## Full narration script

### Welcome

Welcome to the NEWL AFRICA Digital System Training programme. In this first lesson, we'll look at the bigger picture: what the management platform is, why it exists, and how it supports everyone in the organisation.

### Why the platform exists

NEWL AFRICA delivers project work across many sites, with team leaders in the field and decision-makers in the office. Without a shared system, the important details — who is responsible for a project, which workers are on site, what was done today, and how much has been spent — end up scattered across phone calls, messages and spreadsheets. The NEWL AFRICA management platform brings that information together in one place. Its own tagline sums it up: projects, teams, daily logs and financials — unified.

For the Board and project owners, the platform provides visibility: a consolidated view of projects, budgets, spending and activity. For administrators, it provides control. Projects are created, team leaders are assigned, and additional fund requests are reviewed and then approved or declined. And for team leaders, it provides a clear, simple routine: record the casual workers on site, submit a daily log, and request additional funds when they are genuinely needed. Every one of these actions is recorded, which creates a dependable trail of accountability.

### Who uses the system

It's important to understand how the system is organised. The platform has two sign-in roles: the Administrator and the Team Leader. Administrators manage the whole platform. They create projects, set budgets, add and assign team leaders, record expenditure, review fund requests, approve completed projects and configure SMS notifications. Team leaders work on the projects assigned to them. They add casual workers, submit daily logs, request additional funds, and mark their projects as complete when the work is done. Casual workers do not sign in. They are recorded by their team leader, and they can receive an SMS when they are added to, or removed from, a project. Board members and project owners do not have a separate role in the current system. Their oversight comes through the administrator's dashboard, the financial reports and the audit trail, which administrators can present and walk through with them.

### Secure sign-in

Let's open the application. Everything begins at the sign-in screen. At the top, you'll see the NEWL AFRICA identity, followed by two tabs: Admin and Team Leader. Choose the tab that matches your role. Team leaders select the Team Leader tab. Administrators stay on the Admin tab. Enter your username and password. Team leader usernames are created by the administrator, and the system turns them into a sign-in address ending in @newl.africa. You can also type a full email address. When you select Sign In, the platform checks your credentials with Firebase Authentication — a secure sign-in service provided by Google. It then confirms that your account profile matches the tab you selected. An administrator can't sign in through the Team Leader tab, and a team leader can't sign in as an administrator. Keep your password private, and never share your sign-in details with anyone. If you're using a shared computer, always sign out when you've finished.

### The administrator dashboard

After signing in, administrators arrive on the Home dashboard — the platform's control centre. At the top, a short summary tells you how many projects are active, how many team leaders are registered, and how many casual workers are on duty. Below it, four summary cards give you the essential figures at a glance. Projects shows the total number of projects, and how many are active. Total Budget is the combined budget of every project, with the amount spent shown underneath. Remaining is what's left after all outflow — that is, recorded expenditure and approved additional funds. And Unread shows how many of your notifications you haven't opened yet. On the left, Active Projects lists projects that are in progress or awaiting approval, with their SMP reference, team leader, status, a progress bar and the remaining budget. On the right, Recent Activity shows the latest actions taken in the system: who did what, and when. And when something needs your decision — such as a pending fund request, or a project awaiting approval — a Needs your attention banner appears, with a Review button that takes you straight to it.

### Finding your way around

The sidebar on the left is how you move around the platform. Administrators see nine areas. Home is the dashboard you've just seen, and Projects holds the full project portfolio. Team Leaders is where field leaders are added, assigned and supported. Financials brings together budgets, expenditure and fund requests. Daily Logs shows every field report, and All Casuals lists the casual workers recorded on each project. Notifications holds your in-app alerts, the Audit Log keeps a history of actions, and Settings contains your profile and the SMS configuration. At the top of every page, the search bar lets you quickly find projects by name, SMP, PO number or module package. The bell icon opens your notifications. Your name and role appear at the bottom of the sidebar, next to the sign-out button.

### The team leader's view

Team leaders see a simpler, focused workspace. Their sidebar contains six areas: My Projects, My Casuals, Daily Logs, Fund Requests, Notifications and Settings. Their home page shows only the projects assigned to them, along with the casual workers on their sites, the logs they've submitted, and their unread notifications. Team leaders don't see other team leaders' projects, the organisation-wide financial overview, or the audit log. Those views are reserved for administrators.

### How information moves

Here's how information moves through the platform. An administrator creates a project, sets its budget and assigns a team leader. The team leader receives an SMS, signs in, records the casual workers on site, and submits daily logs. Every submission is stored centrally in a Firestore database. Administrators receive notifications, and the records become available on the dashboard, in the financial reports and in the audit log. The Board and project owners can then receive accurate, up-to-date information through the administrator, without chasing updates from the field.

### Summary

Let's recap. The NEWL AFRICA platform brings projects, teams, daily logs and financials together in one secure place. There are two sign-in roles, Administrator and Team Leader, and every important action leaves a record. In the next lesson, we'll create a project, add a team leader and assign responsibility. Thank you for watching.

### Credits

This training experience was produced by KEYPOLE TECHNOLOGIES.

## Scene plan

Timecodes are taken from the rendered timeline. Visual actions start ~0.25 s before the words they illustrate.

### Scene 1 · Welcome · 0:00–0:20

**Visual:** Cinematic opening — NEWL AFRICA identity, lesson number, title and topic chips over animated geometric backdrop.

| Time | Narration | Visual direction |
|---|---|---|
| 0:05 | Welcome to the NEWL AFRICA Digital System Training programme. | — |
| 0:10 | In this first lesson, we'll look at the bigger picture: what the management platform is, why it exists, and how it supports everyone in the organisation. | — |

### Scene 2 · Why the platform exists · 0:20–0:58

**Visual:** Motion graphic (cards) — “One shared source of project information”.

| Time | Narration | Visual direction |
|---|---|---|
| 0:21 | NEWL AFRICA delivers project work across many sites, with team leaders in the field and decision-makers in the office. | reveal 0 |
| 0:29 | Without a shared system, the important details — who is responsible for a project, which workers are on site, what was done today, and how much has been spent — end up scattered across phone calls, messages and spreadsheets. | reveal 4 |
| 0:44 | The NEWL AFRICA management platform brings that information together in one place. Its own tagline sums it up: projects, teams, daily logs and financials — unified. | reveal 4; footer line; sfx: pop |

### Scene 3 · Why the platform exists · 0:58–1:39

**Visual:** Motion graphic (cards) — “What the platform gives each group”.

| Time | Narration | Visual direction |
|---|---|---|
| 0:58 | For the Board and project owners, the platform provides visibility: a consolidated view of projects, budgets, spending and activity. | reveal 1; focus item 1 |
| 1:08 | For administrators, it provides control. Projects are created, team leaders are assigned, and additional fund requests are reviewed and then approved or declined. | reveal 2; focus item 2 |
| 1:20 | And for team leaders, it provides a clear, simple routine: record the casual workers on site, submit a daily log, and request additional funds when they are genuinely needed. | reveal 3; focus item 3 |
| 1:33 | Every one of these actions is recorded, which creates a dependable trail of accountability. | reveal 3; footer line |

### Scene 4 · Who uses the system · 1:39–2:45

**Visual:** Motion graphic (tiers) — “How responsibility is organised”.

| Time | Narration | Visual direction |
|---|---|---|
| 1:40 | It's important to understand how the system is organised. The platform has two sign-in roles: the Administrator and the Team Leader. | reveal [1,2] |
| 1:49 | Administrators manage the whole platform. They create projects, set budgets, add and assign team leaders, record expenditure, review fund requests, approve completed projects and configure SMS notifications. | reveal [1,2]; focus item 2 |
| 2:05 | Team leaders work on the projects assigned to them. They add casual workers, submit daily logs, request additional funds, and mark their projects as complete when the work is done. | reveal [1,2]; focus item 3 |
| 2:18 | Casual workers do not sign in. They are recorded by their team leader, and they can receive an SMS when they are added to, or removed from, a project. | reveal [1,2,3]; focus item 4 |
| 2:30 | Board members and project owners do not have a separate role in the current system. Their oversight comes through the administrator's dashboard, the financial reports and the audit trail, which administrators can present and walk through with them. | reveal [0,1,2,3]; focus item 1 |

### Scene 5 · Secure sign-in · 2:44–3:56

**Visual:** Application screenshot: Login screen â€” Admin tab (01-admin-login.png).

| Time | Narration | Visual direction |
|---|---|---|
| 2:45 | Let's open the application. Everything begins at the sign-in screen. | full view |
| 2:51 | At the top, you'll see the NEWL AFRICA identity, followed by two tabs: Admin and Team Leader. Choose the tab that matches your role. | camera → [560, 120, 1350, 760]; highlight “Choose your role” |
| 3:02 | Team leaders select the Team Leader tab. Administrators stay on the Admin tab. | switch to 18-team-leader-login; camera → [560, 120, 1350, 760]; highlight “Team Leader tab”; cursor clicks (1078, 349) |
| 3:08 | Enter your username and password. Team leader usernames are created by the administrator, and the system turns them into a sign-in address ending in @newl.africa. You can also type a full email address. | switch to 01-admin-login; camera → [560, 120, 1350, 760]; highlight “Username and password”; cursor moves to (960, 470) |
| 3:23 | When you select Sign In, the platform checks your credentials with Firebase Authentication — a secure sign-in service provided by Google. | camera → [560, 120, 1350, 760]; highlight “Sign In”; cursor clicks (956, 660); sfx: login |
| 3:33 | It then confirms that your account profile matches the tab you selected. An administrator can't sign in through the Team Leader tab, and a team leader can't sign in as an administrator. | camera → [560, 120, 1350, 760]; callout “Role check” |
| 3:45 | Keep your password private, and never share your sign-in details with anyone. If you're using a shared computer, always sign out when you've finished. | full view |

### Scene 6 · The administrator dashboard · 3:55–5:14

**Visual:** Application screenshot: Administrator dashboard (Home) (02-admin-dashboard.png).

| Time | Narration | Visual direction |
|---|---|---|
| 3:56 | After signing in, administrators arrive on the Home dashboard — the platform's control centre. | full view; sfx: whoosh-soft |
| 4:03 | At the top, a short summary tells you how many projects are active, how many team leaders are registered, and how many casual workers are on duty. | camera → [340, 100, 1300, 400]; highlight “Summary” |
| 4:13 | Below it, four summary cards give you the essential figures at a glance. Projects shows the total number of projects, and how many are active. | camera → [340, 200, 1910, 420]; highlight “Projects” |
| 4:23 | Total Budget is the combined budget of every project, with the amount spent shown underneath. | camera → [340, 200, 1910, 420]; highlight “Total Budget” |
| 4:30 | Remaining is what's left after all outflow — that is, recorded expenditure and approved additional funds. And Unread shows how many of your notifications you haven't opened yet. | camera → [340, 200, 1910, 420]; highlight “Remaining”, “Unread” |
| 4:42 | On the left, Active Projects lists projects that are in progress or awaiting approval, with their SMP reference, team leader, status, a progress bar and the remaining budget. | camera → [350, 380, 1130, 861]; highlight “Active project” |
| 4:54 | On the right, Recent Activity shows the latest actions taken in the system: who did what, and when. | camera → [1120, 380, 1903, 861]; highlight “Recent Activity” |
| 5:02 | And when something needs your decision — such as a pending fund request, or a project awaiting approval — a Needs your attention banner appears, with a Review button that takes you straight to it. | switch to 23-admin-dashboard-attention; camera → [340, 100, 1911, 520]; highlight “Needs your attention”; cursor moves to (1817, 285); sfx: chime |

### Scene 7 · Finding your way around · 5:13–6:16

**Visual:** Application screenshot: Administrator dashboard (Home) (02-admin-dashboard.png).

| Time | Narration | Visual direction |
|---|---|---|
| 5:14 | The sidebar on the left is how you move around the platform. Administrators see nine areas. | camera → [0, 0, 760, 800]; highlight “Main navigation” |
| 5:22 | Home is the dashboard you've just seen, and Projects holds the full project portfolio. | camera → [0, 0, 760, 800]; highlight region, region |
| 5:28 | Team Leaders is where field leaders are added, assigned and supported. Financials brings together budgets, expenditure and fund requests. | camera → [0, 0, 760, 800]; highlight region, region |
| 5:39 | Daily Logs shows every field report, and All Casuals lists the casual workers recorded on each project. | camera → [0, 0, 760, 800]; highlight region, region |
| 5:47 | Notifications holds your in-app alerts, the Audit Log keeps a history of actions, and Settings contains your profile and the SMS configuration. | camera → [0, 0, 760, 800]; highlight region, region, region |
| 5:57 | At the top of every page, the search bar lets you quickly find projects by name, SMP, PO number or module package. The bell icon opens your notifications. | camera → [300, 0, 1903, 230]; highlight “Search projects”, “Notifications” |
| 6:10 | Your name and role appear at the bottom of the sidebar, next to the sign-out button. | camera → [0, 420, 760, 861]; highlight “Your account and sign-out” |

### Scene 8 · The team leader's view · 6:15–6:53

**Visual:** Application screenshot: Team Leader workspace (My Projects) (19-team-leader-home.png).

| Time | Narration | Visual direction |
|---|---|---|
| 6:16 | Team leaders see a simpler, focused workspace. | full view |
| 6:21 | Their sidebar contains six areas: My Projects, My Casuals, Daily Logs, Fund Requests, Notifications and Settings. | camera → [0, 0, 760, 700]; highlight “Team leader navigation” |
| 6:31 | Their home page shows only the projects assigned to them, along with the casual workers on their sites, the logs they've submitted, and their unread notifications. | camera → [350, 120, 1909, 660]; highlight region, “Assigned project” |
| 6:41 | Team leaders don't see other team leaders' projects, the organisation-wide financial overview, or the audit log. Those views are reserved for administrators. | full view; callout “Administrator-only views” |

### Scene 9 · How information moves · 6:53–7:35

**Visual:** Motion graphic (flow) — “How information moves through the platform”.

| Time | Narration | Visual direction |
|---|---|---|
| 6:53 | Here's how information moves through the platform. | reveal 0 |
| 6:57 | An administrator creates a project, sets its budget and assigns a team leader. | reveal 1; focus item 1 |
| 7:03 | The team leader receives an SMS, signs in, records the casual workers on site, and submits daily logs. | reveal 2; focus item 2; sfx: sms |
| 7:12 | Every submission is stored centrally in a Firestore database. Administrators receive notifications, and the records become available on the dashboard, in the financial reports and in the audit log. | reveal 4; focus item 4; sfx: data |
| 7:26 | The Board and project owners can then receive accurate, up-to-date information through the administrator, without chasing updates from the field. | reveal 5; focus item 5 |

### Scene 10 · Summary · 7:35–8:03

**Visual:** NEWL AFRICA lesson summary — key takeaways revealed one by one, followed by the next-lesson card.

| Time | Narration | Visual direction |
|---|---|---|
| 7:35 | Let's recap. The NEWL AFRICA platform brings projects, teams, daily logs and financials together in one secure place. | reveal 1 |
| 7:46 | There are two sign-in roles, Administrator and Team Leader, and every important action leaves a record. | reveal 3 |
| 7:53 | In the next lesson, we'll create a project, add a team leader and assign responsibility. Thank you for watching. | reveal 3 |

### Scene 11 · Credits · 8:02–8:14

**Visual:** Production credit — the KEYPOLE TECHNOLOGIES logo with light sweep and the line “Technology. Creativity. Excellence.” on black.

| Time | Narration | Visual direction |
|---|---|---|
| 8:04 | This training experience was produced by KEYPOLE TECHNOLOGIES. | — |
