# Lesson 05 — Notifications, Communication and Accountability

**Theme:** Keeping the organisation informed and maintaining an accountability trail.  
**Audience:** Administrators, Team leaders, Board members  
**Running time:** 6:51 · **Narration:** 891 words · **Voice:** mature American male (en-US-ChristopherNeural)

## Learning objectives

- Use the notification centre
- Identify which events notify whom, and through which channel
- Explain how an SMS travels from the platform to a phone
- Configure SMS settings, dry-run mode and per-event switches
- Distinguish a notification from an audit record

## Full narration script

### Welcome

Lesson five: notifications, communication and accountability. In this lesson, we'll see how the platform keeps people informed, how SMS messages are sent, and how the audit log keeps a lasting trail of actions.

### Two ways to keep people informed

The platform communicates in two ways. In-app notifications appear inside the platform, in the notification centre. Each one is addressed to a specific person, and it's stored in the database until it's read. SMS messages are sent to mobile phones, so people are informed even when they aren't signed in. Some events use both channels, and some use SMS only. Let's look at each.

### The notification centre

Open Notifications from the sidebar, or select the bell icon at the top of any page. When you have unread notifications, the bell shows a count. Each notification has a title, a short message, and when it arrived. Unread notifications are marked with a green bar along the left edge. Here, the administrator has received alerts for additional fund requests, and for submitted daily logs. Selecting a notification marks it as read and opens the related project. You can also mark all your notifications as read at once.

### Which events notify whom

Here's a map of the events that trigger communication. When a team leader is created, assigned to a project, or removed from one through the project's edit form, they receive an SMS. The welcome message includes their sign-in details. Direct messages from an administrator arrive both in the app and by SMS. When a casual worker is added or removed, the worker and the administrator are informed by SMS. When a team leader submits a daily log, requests funds, or marks a project complete, the administrator receives an in-app notification and an SMS. And when the administrator approves or declines funds, or approves or returns a project, the team leader is notified both ways.

### How SMS messages are delivered

When an event triggers an SMS, the platform prepares a short message, and converts the phone number to the international Kenyan format. It then sends the message to a Cloudflare Worker: a small, secure web service that sits between the platform and the SMS provider. The Worker passes the message to Mobilesasa, the SMS gateway, which delivers it to the recipient's phone using the configured sender ID. If the phone number is missing or invalid, or the service can't be reached, the message is marked as failed rather than silently ignored.

### SMS settings

Administrators configure SMS under Settings. The SMS Notifications panel shows whether the system is in Live mode, or in Dry-run mode. The Worker URL is the address of the Cloudflare Worker, and the Sender ID is the name that appears on recipients' phones. These are technical settings. We've hidden the address here, and they should only be changed on the advice of your technical team. Dry-run mode is a safe testing switch. When it's on, messages are recorded in the platform's SMS list, but they're not actually sent.

Under Auto-fire per event, each type of automatic SMS can be switched on or off individually — for example, notifying a team leader of a project assignment, or notifying the administrator of each daily log. These switches control SMS messages only. In-app notifications are still created. One important detail: these SMS preferences are saved in the web browser you're using. If an administrator signs in on another computer or browser, the settings there need to be checked separately. Below the switches, Save keeps your changes to the Worker URL and Sender ID, and Test SMS sends a test message to confirm that everything is working. The Recent SMS list then shows each message's recipient, content and status: sent, failed, or dry run. It covers messages sent from the current browser session only.

### The audit log

Now let's turn to accountability. The Audit Log, available to administrators, records the important actions taken in the system. Each entry shows when the action happened, who performed it, what the action was, and the details — such as an amount, a project, or a person. Here, we can see an expense being added, a project being created, funds being requested and approved, a daily log submitted, and a casual worker added. Entries are written automatically as people use the system. There's no option in the platform to edit or delete them, and the page shows the most recent one hundred entries. The dashboard's Recent Activity panel shows the latest six entries from the same log.

### Notifications versus audit records

It's worth being clear about the difference between a notification and an audit record. A notification is a message to a specific person. Its purpose is to prompt action: something needs your attention. Once it's read, its job is done. An audit record is a lasting entry in the system's history. Its purpose is accountability: it shows who did what, and when, so the record can be reviewed later. Together, they make sure that the right people are informed in the moment, and that the organisation can always reconstruct what happened afterwards.

### Summary

To recap: in-app notifications prompt action, SMS reaches people wherever they are, and the audit log keeps a lasting record. Administrators can control which automatic SMS messages are sent and test the service safely, and everyone should keep phone numbers accurate, so that messages reach the right people. In the final lesson, we'll bring everything together with system administration, the platform's architecture, and best practices.

### Credits

This training experience was produced by KEYPOLE TECHNOLOGIES.

## Scene plan

Timecodes are taken from the rendered timeline. Visual actions start ~0.25 s before the words they illustrate.

### Scene 1 · Welcome · 0:00–0:22

**Visual:** Cinematic opening — NEWL AFRICA identity, lesson number, title and topic chips over animated geometric backdrop.

| Time | Narration | Visual direction |
|---|---|---|
| 0:05 | Lesson five: notifications, communication and accountability. | — |
| 0:10 | In this lesson, we'll see how the platform keeps people informed, how SMS messages are sent, and how the audit log keeps a lasting trail of actions. | — |

### Scene 2 · Two ways to keep people informed · 0:21–0:53

**Visual:** Motion graphic (compare) — “Two communication channels”.

| Time | Narration | Visual direction |
|---|---|---|
| 0:22 | The platform communicates in two ways. | reveal 0 |
| 0:26 | In-app notifications appear inside the platform, in the notification centre. Each one is addressed to a specific person, and it's stored in the database until it's read. | reveal 1; focus item 1; sfx: chime |
| 0:38 | SMS messages are sent to mobile phones, so people are informed even when they aren't signed in. | reveal 2; focus item 2; sfx: sms |
| 0:45 | Some events use both channels, and some use SMS only. Let's look at each. | reveal 3 |

### Scene 3 · The notification centre · 0:52–1:32

**Visual:** Application screenshot: Notifications centre (14-notifications.png).

| Time | Narration | Visual direction |
|---|---|---|
| 0:53 | Open Notifications from the sidebar, or select the bell icon at the top of any page. When you have unread notifications, the bell shows a count. | full view; highlight “Notifications”, “Bell” |
| 1:04 | Each notification has a title, a short message, and when it arrived. Unread notifications are marked with a green bar along the left edge. | camera → [350, 120, 1914, 460]; highlight region |
| 1:14 | Here, the administrator has received alerts for additional fund requests, and for submitted daily logs. | camera → [350, 200, 1914, 871]; highlight “Fund request”, “Daily log” |
| 1:22 | Selecting a notification marks it as read and opens the related project. You can also mark all your notifications as read at once. | camera → [350, 200, 1914, 871]; cursor clicks (900, 286) |

### Scene 4 · Which events notify whom · 1:31–2:23

**Visual:** Motion graphic (matrix) — “Events that trigger communication”.

| Time | Narration | Visual direction |
|---|---|---|
| 1:32 | Here's a map of the events that trigger communication. | reveal 0 |
| 1:36 | When a team leader is created, assigned to a project, or removed from one through the project's edit form, they receive an SMS. The welcome message includes their sign-in details. | reveal 3 |
| 1:49 | Direct messages from an administrator arrive both in the app and by SMS. | reveal 4 |
| 1:55 | When a casual worker is added or removed, the worker and the administrator are informed by SMS. | reveal 6 |
| 2:02 | When a team leader submits a daily log, requests funds, or marks a project complete, the administrator receives an in-app notification and an SMS. | reveal 9 |
| 2:13 | And when the administrator approves or declines funds, or approves or returns a project, the team leader is notified both ways. | reveal 11 |

### Scene 5 · How SMS messages are delivered · 2:22–3:01

**Visual:** Motion graphic (flow) — “How an SMS reaches a phone”.

| Time | Narration | Visual direction |
|---|---|---|
| 2:23 | When an event triggers an SMS, the platform prepares a short message, and converts the phone number to the international Kenyan format. | reveal 2; focus item 2 |
| 2:32 | It then sends the message to a Cloudflare Worker: a small, secure web service that sits between the platform and the SMS provider. | reveal 3; focus item 3; sfx: data |
| 2:42 | The Worker passes the message to Mobilesasa, the SMS gateway, which delivers it to the recipient's phone using the configured sender ID. | reveal 5; focus item 5; sfx: sms |
| 2:52 | If the phone number is missing or invalid, or the service can't be reached, the message is marked as failed rather than silently ignored. | callout “Failures are visible”; reveal 5 |

### Scene 6 · SMS settings · 3:00–3:39

**Visual:** Application screenshot: Settings â€” profile, Firebase, SMS (16-settings-profile-sms.png).

| Time | Narration | Visual direction |
|---|---|---|
| 3:01 | Administrators configure SMS under Settings. The SMS Notifications panel shows whether the system is in Live mode, or in Dry-run mode. | camera → [350, 470, 1908, 868]; highlight “SMS Notifications”, “Live mode” |
| 3:12 | The Worker URL is the address of the Cloudflare Worker, and the Sender ID is the name that appears on recipients' phones. These are technical settings. We've hidden the address here, and they should only be changed on the advice of your technical team. | camera → [350, 470, 1908, 868]; highlight “Worker URL”, “Sender ID” |
| 3:29 | Dry-run mode is a safe testing switch. When it's on, messages are recorded in the platform's SMS list, but they're not actually sent. | camera → [350, 470, 1908, 868]; highlight “Dry-run mode” |

### Scene 7 · SMS settings · 3:39–4:40

**Visual:** Application screenshot: Settings â€” SMS auto-fire per event (17-settings-sms-events.png).

| Time | Narration | Visual direction |
|---|---|---|
| 3:40 | Under Auto-fire per event, each type of automatic SMS can be switched on or off individually — for example, notifying a team leader of a project assignment, or notifying the administrator of each daily log. | camera → [350, 80, 1912, 874]; highlight “Project assignment”, “Daily log” |
| 3:54 | These switches control SMS messages only. In-app notifications are still created. | camera → [350, 80, 1912, 874]; highlight “SMS on / off” |
| 4:01 | One important detail: these SMS preferences are saved in the web browser you're using. If an administrator signs in on another computer or browser, the settings there need to be checked separately. | full view; callout “Saved per browser” |
| 4:15 | Below the switches, Save keeps your changes to the Worker URL and Sender ID, and Test SMS sends a test message to confirm that everything is working. | full view |
| 4:26 | The Recent SMS list then shows each message's recipient, content and status: sent, failed, or dry run. It covers messages sent from the current browser session only. | full view; callout “Recent SMS” |

### Scene 8 · The audit log · 4:39–5:29

**Visual:** Application screenshot: Audit Log (15-audit-log.png).

| Time | Narration | Visual direction |
|---|---|---|
| 4:40 | Now let's turn to accountability. The Audit Log, available to administrators, records the important actions taken in the system. | full view; highlight “Audit Log” |
| 4:49 | Each entry shows when the action happened, who performed it, what the action was, and the details — such as an amount, a project, or a person. | camera → [350, 120, 1909, 560]; highlight “Time · User · Action · Details” |
| 5:00 | Here, we can see an expense being added, a project being created, funds being requested and approved, a daily log submitted, and a casual worker added. | camera → [350, 200, 1909, 853]; highlight region |
| 5:11 | Entries are written automatically as people use the system. There's no option in the platform to edit or delete them, and the page shows the most recent one hundred entries. | camera → [350, 200, 1909, 853]; callout “Written automatically” |
| 5:22 | The dashboard's Recent Activity panel shows the latest six entries from the same log. | switch to 02-admin-dashboard; camera → [1120, 380, 1903, 861]; highlight “Recent Activity” |

### Scene 9 · Notifications versus audit records · 5:28–6:08

**Visual:** Motion graphic (compare) — “Notification or audit record?”.

| Time | Narration | Visual direction |
|---|---|---|
| 5:29 | It's worth being clear about the difference between a notification and an audit record. | reveal 0 |
| 5:35 | A notification is a message to a specific person. Its purpose is to prompt action: something needs your attention. Once it's read, its job is done. | reveal 1; focus item 1 |
| 5:47 | An audit record is a lasting entry in the system's history. Its purpose is accountability: it shows who did what, and when, so the record can be reviewed later. | reveal 2; focus item 2 |
| 5:59 | Together, they make sure that the right people are informed in the moment, and that the organisation can always reconstruct what happened afterwards. | reveal 3 |

### Scene 10 · Summary · 6:08–6:40

**Visual:** NEWL AFRICA lesson summary — key takeaways revealed one by one, followed by the next-lesson card.

| Time | Narration | Visual direction |
|---|---|---|
| 6:09 | To recap: in-app notifications prompt action, SMS reaches people wherever they are, and the audit log keeps a lasting record. | reveal 3 |
| 6:18 | Administrators can control which automatic SMS messages are sent and test the service safely, and everyone should keep phone numbers accurate, so that messages reach the right people. | reveal 3 |
| 6:30 | In the final lesson, we'll bring everything together with system administration, the platform's architecture, and best practices. | reveal 3 |

### Scene 11 · Credits · 6:39–6:51

**Visual:** Production credit — the KEYPOLE TECHNOLOGIES logo with light sweep and the line “Technology. Creativity. Excellence.” on black.

| Time | Narration | Visual direction |
|---|---|---|
| 6:41 | This training experience was produced by KEYPOLE TECHNOLOGIES. | — |
