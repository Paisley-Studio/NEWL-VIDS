// Builds the NEWL AFRICA training documentation (A4 PDF) from the lesson scripts and
// generated lesson data, styled in the application's own design language.
//
//   node scripts/production/build_pdf.mjs
// Output: out/NEWL-AFRICA-Training-Documentation.pdf (+ the source .html beside it)
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import * as fa from "@fortawesome/free-solid-svg-icons";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "out");
const HTML = path.join(OUT_DIR, "NEWL-AFRICA-Training-Documentation.html");
const PDF = path.join(OUT_DIR, "NEWL-AFRICA-Training-Documentation.pdf");
fs.mkdirSync(OUT_DIR, { recursive: true });

const url = (p) => pathToFileURL(path.join(ROOT, p)).href;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const icon = (name, size = 14, color = "currentColor") => {
  const [w, h, , , d] = fa[name].icon;
  return `<svg class="ic" viewBox="0 0 ${w} ${h}" style="height:${size}px;width:${(size * w) / h}px"><path fill="${color}" d="${d}"/></svg>`;
};
const mark = (size, bg = "#1e6b3a") =>
  `<span class="mark" style="width:${size}px;height:${size}px;border-radius:${size * 0.32}px;background:${bg}">${icon("faTowerCell", size * 0.5, "#fff")}</span>`;
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
const n2 = (n) => String(n).padStart(2, "0");

const data = JSON.parse(fs.readFileSync("data/lessons.json", "utf8")).lessons;
const scripts = Object.fromEntries(
  fs.readdirSync("scripts/narration").filter((f) => f.endsWith(".json")).map((f) => {
    const l = JSON.parse(fs.readFileSync(path.join("scripts/narration", f), "utf8"));
    return [l.id, l];
  }),
);
const total = data.reduce((s, l) => s + l.duration, 0);
const shot = (id, caption) => `<figure><img src="${url(`public/screenshots/${id}.png`)}" alt=""><figcaption>${esc(caption)}</figcaption></figure>`;
const callout = (title, body, kind = "info") =>
  `<div class="callout ${kind}">${icon(kind === "warn" ? "faTriangleExclamation" : "faCircleInfo", 15)}<div><b>${esc(title)}</b><p>${body}</p></div></div>`;
const ticks = (items) => `<ul class="ticks">${items.map((t) => `<li>${icon("faCheck", 10)}<span>${t}</span></li>`).join("")}</ul>`;

/* ------------------------------------------------------------------ sections */
const sections = [];
const section = (id, kicker, title, body) => sections.push({ id, kicker, title, body });

section("programme", "Programme overview", "About the training programme", `
<p class="lead">The NEWL AFRICA Digital System Training programme introduces the whole organisation to its project management platform: what it does, why it exists, how information moves through it, and what each person is responsible for. It is made up of six narrated lessons, about ${Math.round(total / 60)} minutes in total, supported by subtitles, written scripts and this document.</p>
<div class="grid3">
  <div class="card"><span class="k">Audience</span><b>Board members &amp; project owners</b><p>Understand the picture the platform provides and the questions to ask of it.</p></div>
  <div class="card"><span class="k">Audience</span><b>Administrators</b><p>Set up projects, manage team leaders, record expenditure and decide on requests.</p></div>
  <div class="card"><span class="k">Audience</span><b>Team leaders</b><p>Record casual workers, submit daily logs, request funds and complete projects.</p></div>
</div>
<h3>The six lessons</h3>
<table><thead><tr><th>#</th><th>Lesson</th><th>Primary audience</th><th>Runtime</th></tr></thead><tbody>
${data.map((l) => `<tr><td><span class="num" style="background:${l.accent}">${n2(l.number)}</span></td><td><b>${esc(l.title)}</b><br><span class="soft">${esc(l.theme)}</span></td><td>${esc(l.audience.slice(0, 3).join(", "))}</td><td class="nowrap">${mmss(l.duration)}</td></tr>`).join("")}
</tbody></table>
${callout("How to use this document", "Watch the lessons in order for the complete picture, or go straight to the lesson for your role. Sections 3–8 of this document are a written reference you can return to after watching; Appendix A contains the full narration of every lesson.")}
`);

section("platform", "The platform at a glance", "What the NEWL AFRICA platform does", `
<p>The platform brings four kinds of information together in one secure place — its own tagline is <b>“Projects · Teams · Daily Logs · Financials — unified.”</b> It runs in a web browser; nothing is installed.</p>
${shot("02-admin-dashboard", "The administrator dashboard: summary, four headline figures, active projects and recent activity.")}
<h3>Who uses it</h3>
<table><thead><tr><th>Group</th><th>Access</th><th>Responsibilities in the system</th></tr></thead><tbody>
<tr><td><b>Administrator</b></td><td><span class="pill">Sign-in role</span></td><td>Creates projects and budgets, adds and assigns team leaders, records expenditure, decides on fund requests, approves completed projects, configures SMS, reviews the audit log.</td></tr>
<tr><td><b>Team leader</b></td><td><span class="pill">Sign-in role</span></td><td>Works on assigned projects only: adds casual workers, submits daily logs, requests additional funds, marks projects complete.</td></tr>
<tr><td><b>Casual workers</b></td><td><span class="pill grey">Recorded, no sign-in</span></td><td>Recorded by their team leader; can receive SMS when added to or removed from a project.</td></tr>
<tr><td><b>Board members &amp; project owners</b></td><td><span class="pill grey">No separate role</span></td><td>Oversight through the administrator's dashboard, financial reports and audit trail.</td></tr>
</tbody></table>
<h3>Navigation</h3>
<div class="grid2">
  <div class="card"><span class="k">Administrator — 9 areas</span><p>Home · Projects · Team Leaders · Financials · Daily Logs · All Casuals · Notifications · Audit Log · Settings</p></div>
  <div class="card"><span class="k">Team leader — 6 areas</span><p>My Projects · My Casuals · Daily Logs · Fund Requests · Notifications · Settings</p></div>
</div>
<h3>How information moves</h3>
<div class="flow">${[
  ["Administrator", "creates the project, sets the budget, assigns a team leader"],
  ["Team leader", "receives an SMS, records workers, submits daily logs"],
  ["Central database", "every record is stored in Firestore"],
  ["Oversight", "notifications, dashboard, financials, audit log"],
  ["Board & owners", "informed through the administrator"],
].map(([t, b], i) => `<div class="step"><span class="sn">${n2(i + 1)}</span><b>${t}</b><p>${b}</p></div>`).join(`<span class="arrow">→</span>`)}</div>
`);

section("signin", "Secure sign-in", "Signing in and staying secure", `
<div class="split">
${shot("01-admin-login", "Sign-in screen (username redacted). Choose the Admin or Team Leader tab.")}
<div>${ticks([
  "Choose the tab that matches your role. An administrator cannot sign in through the Team Leader tab, and vice versa.",
  "Usernames without “@” become <code>username@newl.africa</code>; a full e-mail address can also be typed.",
  "Credentials are checked by <b>Firebase Authentication</b>, then the account's role is checked against the tab.",
  "Keep your password private, never share sign-in details, and sign out on shared computers.",
])}</div></div>
`);

section("lessons", "Lesson guides", "Lesson-by-lesson guide", data.map((l) => {
  const s = scripts[l.id];
  const closing = s.scenes.find((x) => x.kind === "closing");
  return `<div class="lesson" style="--c:${l.accent}">
  <div class="lesson-head"><span class="big">${n2(l.number)}</span><div><span class="k">Lesson ${n2(l.number)} · ${mmss(l.duration)}</span><h3>${esc(l.title)}</h3><p class="soft">${esc(l.description)}</p></div></div>
  <div class="grid2 tight">
    <div><h4>Learning objectives</h4>${ticks(l.objectives.map(esc))}</div>
    <div><h4>Chapters</h4><ol class="chapters">${l.chapters.map((c) => `<li><span>${mmss(c.start)}</span>${esc(c.title)}</li>`).join("")}</ol></div>
  </div>
  ${closing ? `<div class="takeaways"><h4>Key takeaways</h4>${ticks(closing.takeaways.map(esc))}</div>` : ""}
</div>`;
}).join(""));

section("admin", "Role reference", "Administrator quick reference", `
<table><thead><tr><th>Task</th><th>Where</th><th>What to know</th></tr></thead><tbody>
<tr><td><b>Create a project</b></td><td>Home or Projects → New Project</td><td>Project Name and SMP are required. PO, module package, region, location, client, budget, optional dates, team leader, description and status. Budget becomes the allocated budget.</td></tr>
<tr><td><b>Add a team leader</b></td><td>Team Leaders → Add Team Leader</td><td>Full name, phone, e-mail, username. A password is generated and sent by SMS. You confirm your password, then sign back in once.</td></tr>
<tr><td><b>Assign projects</b></td><td>Team leader card → Assign Projects, or project Edit</td><td>One team leader per project; reassigning replaces the previous one. New assignments trigger an SMS.</td></tr>
<tr><td><b>Record expenditure</b></td><td>Project → Financials tab → Add</td><td>Item description, amount, date, receipt/reference. Reduces the remaining balance immediately.</td></tr>
<tr><td><b>Decide a fund request</b></td><td>Financials → Pending Fund Requests</td><td>Approve (amount pre-filled, adjustable) or Decline (optional reason). Team leader notified in-app and by SMS.</td></tr>
<tr><td><b>Approve completion</b></td><td>Project in Pending Approval</td><td>Approve → Completed. Send Back → Active, with a reason.</td></tr>
<tr><td><b>Remove a team leader</b></td><td>Team leader card → delete</td><td>Projects become unassigned. The Firebase sign-in account must be removed separately by the technical administrator.</td></tr>
</tbody></table>
${shot("08-team-leaders", "Team Leaders page (contact details and credentials redacted). Treat the credentials panel as confidential.")}
${callout("Reset Password", "In the current version Reset Password updates the password stored on the profile. Confirm with your technical team that the sign-in account was also updated before sharing it.", "warn")}
`);

section("tl", "Role reference", "Team leader quick reference", `
<div class="split">
${shot("19-team-leader-home", "The team leader's workspace: assigned projects, casual workers, logs and notifications.")}
<div>
<table><thead><tr><th>Task</th><th>What to know</th></tr></thead><tbody>
<tr><td><b>Add a casual</b></td><td>Name and phone required; role and daily rate optional. Worker and administrator receive an SMS.</td></tr>
<tr><td><b>Daily log</b></td><td>Project, date (defaults to today), hours (defaults to 8), work done (required), materials, casuals present. Linked sites are recorded automatically. Logs cannot be edited — check before submitting.</td></tr>
<tr><td><b>Request funds</b></td><td>Amount and a specific reason, both required.</td></tr>
<tr><td><b>Complete a project</b></td><td>Mark Complete → Pending Approval → administrator decides.</td></tr>
</tbody></table></div></div>
${callout("Records, not verification", "The platform stores what authorised users enter. It does not independently verify physical work on site — the value of every report depends on the accuracy and honesty of the person submitting it.")}
`);

section("finance", "Financial management", "How the financial figures work", `
<div class="formula">
  <div><span>Allocated budget</span><b>KES 500,000</b></div>
  <div class="neg"><span>− Direct expenditure</span><b>KES 70,000</b></div>
  <div class="neg"><span>− Approved additional funds</span><b>KES 50,000</b></div>
  <div class="res"><span>= Remaining</span><b>KES 380,000</b></div>
</div>
<p class="soft center">Worked example from the KISUMU_NITA project after a KES 50,000 request was approved (24% of budget used).</p>
${ticks([
  "<b>Approved additional funds count as outflow</b>, alongside recorded expenditure.",
  "<b>Pending requests</b> are shown separately and are not deducted until approved.",
  "<b>Used %</b> appears orange above 80% and red above 100%.",
  "<b>Expense categories</b> group spending by the first word of each item description — describe expenses consistently.",
  "<b>Monthly Spend Trend</b> covers the last six months; <b>Cumulative Spend</b> rises with each recorded expense.",
])}
${shot("24-financials-pending-request", "Financials with a pending request: Approve or Decline.")}
${callout("Interpreting the charts", "Charts and figures summarise recorded budgets, expenses and decisions. They do not independently verify that money was spent as described.")}
`);

section("notify", "Communication & accountability", "Notifications, SMS and the audit log", `
<table><thead><tr><th>Event</th><th>Who is informed</th><th>In-app</th><th>SMS</th></tr></thead><tbody>
${[
  ["Team leader created (with sign-in details)", "Team leader", 0, 1],
  ["Project assigned", "Team leader", 0, 1],
  ["Removed from a project (project edit)", "Previous team leader", 0, 1],
  ["Direct message from administrator", "Team leader", 1, 1],
  ["Casual worker added / removed", "Worker and administrator", 0, 1],
  ["Daily log submitted", "Administrator", 1, 1],
  ["Additional funds requested", "Administrator", 1, 1],
  ["Project marked complete", "Administrator", 1, 1],
  ["Funds approved or declined", "Team leader (+ admin release SMS)", 1, 1],
  ["Project approved or sent back", "Team leader", 1, 1],
].map(([e, w, a, s]) => `<tr><td>${e}</td><td>${w}</td><td class="c">${a ? icon("faCheck", 11, "#1e6b3a") : "–"}</td><td class="c">${s ? icon("faCheck", 11, "#8a5fd6") : "–"}</td></tr>`).join("")}
</tbody></table>
<h3>How an SMS is delivered</h3>
<div class="flow small">${["Platform event", "Message prepared (+254 format)", "Cloudflare Worker", "Mobilesasa gateway", "Recipient's phone"].map((t, i) => `<div class="step"><span class="sn">${n2(i + 1)}</span><b>${t}</b></div>`).join(`<span class="arrow">→</span>`)}</div>
${ticks([
  "<b>Dry-run mode</b> records messages without sending them — use it for testing.",
  "<b>Per-event switches</b> control SMS only; in-app notifications are still created.",
  "SMS settings are <b>saved in the browser</b> where they were changed; check them on each computer.",
  "The <b>Recent SMS</b> list shows sent / failed / dry-run messages for the current browser session.",
])}
<div class="grid2">
  <div class="card"><span class="k">Notification</span><b>Prompts action</b><p>A message to a specific person. Once read, its job is done.</p></div>
  <div class="card"><span class="k">Audit record</span><b>Provides accountability</b><p>A lasting entry: who did what, and when. No edit or delete in the platform; latest 100 shown.</p></div>
</div>
`);

section("admin-arch", "Administration", "Architecture, security and best practice", `
<div class="grid3">
  <div class="card"><span class="k">Sign-in</span><b>Firebase Authentication</b><p>Google's secure sign-in service.</p></div>
  <div class="card"><span class="k">Data</span><b>Firestore</b><p>users · projects · casuals · daily_logs · budgets · notifications · audit</p></div>
  <div class="card"><span class="k">SMS</span><b>Cloudflare Worker → Mobilesasa</b><p>The app never contacts Mobilesasa directly.</p></div>
</div>
<h3>What security depends on</h3>
${ticks([
  "Correctly configured Firebase Authentication, so only registered users sign in.",
  "<b>Firestore security rules</b> that decide who can read or change each record — not just what screens display.",
  "Careful validation of the information entered, and good habits from every user.",
  "No system is completely immune to attack: controls reduce risk; they do not eliminate it.",
])}
<h3>Best practices for reliable records</h3>
<ol class="numbered">
<li><b>Enter data accurately the first time</b> — references, budgets and phone numbers.</li>
<li><b>Report daily and honestly</b> — a short log on the day beats a detailed one from memory.</li>
<li><b>Describe expenses consistently</b>, always with a receipt or reference.</li>
<li><b>Give clear reasons</b> for every fund request and every decision.</li>
<li><b>Protect access</b> — personal accounts, sign out on shared devices, remove leavers promptly.</li>
</ol>
<h3>Questions for Board oversight</h3>
<div class="grid2">${[
  ["Activity", "Are projects reporting regularly, or have their logs gone quiet?"],
  ["Budget use", "How much of each budget is used, and how much remains?"],
  ["Fund requests", "How often, for what reasons, and how were they decided?"],
  ["Audit trail", "Are the expected people taking the expected actions?"],
].map(([t, b]) => `<div class="card"><span class="k">${t}</span><p>${b}</p></div>`).join("")}</div>
`);

section("tech", "For the technical team", "Observations from the application review", `
<p>The training was written against the application source. These points were noticed during that review; they do not change what the training teaches.</p>
<ol class="numbered">
<li><b>Reset Password updates Firestore only</b> — the Firebase Authentication password is unchanged.</li>
<li><b>Initial passwords are stored in plain text</b> in the users collection and displayed on the Team Leaders page.</li>
<li><b>All collections load for every signed-in user</b>; role separation is enforced by the interface, so Firestore rules must enforce it.</li>
<li>Password confirmations re-authenticate the <b>current</b> user (for team leaders, their own password).</li>
<li>Deleting a team leader leaves the <b>Firebase Auth account active</b>.</li>
<li>The administrator's “release confirmed” SMS shares the <code>fundApproved</code> toggle.</li>
<li>SMS settings live in <code>localStorage</code>; the Recent SMS list is in memory only.</li>
</ol>
${callout("Data protection in this programme", "Passwords, phone numbers, e-mail addresses, the Auth UID and the SMS Worker URL visible in the original screenshots were redacted before use in the videos, the learning centre and this document.")}
`);

section("production", "Production", "Production and publishing", `
<table><tbody>
<tr><td><b>Videos</b></td><td>1920×1080, 30 fps, H.264/AAC, rendered with Remotion from the lesson scripts; narration timing drives the picture.</td></tr>
<tr><td><b>Narration</b></td><td>Mature American male neural voice (en-US-ChristopherNeural).</td></tr>
<tr><td><b>Subtitles</b></td><td>SRT and WebVTT for every lesson, timed to the spoken words.</td></tr>
<tr><td><b>Music &amp; sound</b></td><td>Original, synthesised for this production — no third-party audio.</td></tr>
<tr><td><b>Rendering</b></td><td>GitHub Actions workflow “Render training videos” renders lessons in parallel and validates every file.</td></tr>
<tr><td><b>Hosting</b></td><td>Persistent storage in the <code>training-videos</code> GitHub Release; the learning centre is deployed to GitHub Pages.</td></tr>
<tr><td><b>Learning centre</b></td><td>Lesson player with chapters, subtitles, speed control, resume and completion tracking (stored in the viewer's browser).</td></tr>
</tbody></table>
`);

/* ------------------------------------------------------------------ appendix: narration */
const appendix = data.map((l) => {
  const s = scripts[l.id];
  let chapter = "";
  const body = s.scenes.map((sc) => {
    const head = sc.chapter !== chapter ? ((chapter = sc.chapter), `<h4>${esc(sc.chapter)}</h4>`) : "";
    return head + `<p>${esc(sc.beats.map((b) => b.text).join(" "))}</p>`;
  }).join("");
  return `<div class="script" style="--c:${l.accent}"><div class="script-head"><span class="num" style="background:${l.accent}">${n2(l.number)}</span><h3>${esc(l.title)}</h3></div>${body}</div>`;
}).join("");

/* ------------------------------------------------------------------ document */
const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const toc = [...sections.map((s, i) => [`${i + 1}`, s.title]), ["A", "Appendix A — Full narration scripts"]];

const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<title>NEWL AFRICA — Digital System Training Documentation</title>
<style>
${[300, 400, 500, 600, 700].map((w) => `@font-face{font-family:Quicksand;font-weight:${w};src:url(${url(`public/fonts/quicksand-latin-${w}-normal.woff2`)}) format('woff2')}`).join("\n")}
:root{--primary:#1e6b3a;--dark:#15502a;--bg:#f6faf8;--soft-bg:#e6f4ec;--border:#e8f0ec;--text:#1a2a24;--soft:#4d5f57;--light:#8a9f95;--ink:#04100a}
@page{size:A4;margin:20mm 17mm 20mm 17mm;
  @bottom-left{content:"NEWL AFRICA · Digital System Training";font:600 7.5pt Quicksand;color:#8a9f95}
  @bottom-right{content:counter(page);font:700 8pt Quicksand;color:#1e6b3a}}
@page cover{margin:0;@bottom-left{content:none}@bottom-right{content:none}}
@page back{margin:0;@bottom-left{content:none}@bottom-right{content:none}}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Quicksand,sans-serif;font-weight:500;color:var(--text);font-size:9.6pt;line-height:1.55;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.ic{display:inline-block;vertical-align:-2px;flex-shrink:0}
.mark{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
code{font-family:Consolas,monospace;font-size:.88em;background:var(--bg);border:1px solid var(--border);border-radius:4px;padding:0 4px}
b{font-weight:700}.soft{color:var(--soft)}.center{text-align:center}.nowrap{white-space:nowrap}
/* cover */
.cover{page:cover;height:297mm;width:210mm;position:relative;overflow:hidden;color:#fff;
  background:radial-gradient(ellipse at 78% 22%,rgba(42,138,74,.55),transparent 55%),linear-gradient(150deg,#0b2a17,#04100a 70%);padding:26mm 22mm;display:flex;flex-direction:column}
.cover::after{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(127,211,155,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(127,211,155,.07) 1px,transparent 1px);background-size:11mm 11mm;-webkit-mask-image:linear-gradient(200deg,#000,transparent 60%)}
.cover>*{position:relative;z-index:1}
.cover .k{color:#9be3b2;font-size:8pt;font-weight:700;letter-spacing:.2em}
.cover h1{font-size:44pt;font-weight:800;letter-spacing:-.03em;line-height:1;margin-top:16mm}
.cover .sub{font-size:10pt;font-weight:700;letter-spacing:.32em;color:#9be3b2;margin-top:5mm}
.cover h2{font-size:22pt;font-weight:700;letter-spacing:-.015em;margin-top:22mm;max-width:150mm;line-height:1.2}
.cover .desc{font-size:11pt;color:rgba(255,255,255,.75);margin-top:6mm;max-width:145mm}
.cover .meta{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid rgba(255,255,255,.18);padding-top:7mm;font-size:8.5pt;color:rgba(255,255,255,.65)}
.cover .meta b{color:#fff;display:block;font-size:10pt}
.chips{display:flex;gap:3mm;flex-wrap:wrap;margin-top:9mm}.chips span{border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);border-radius:99px;padding:2mm 4.5mm;font-size:8.5pt;font-weight:600}
/* contents */
.toc{break-after:page}
.toc h2,.sec h2{font-size:20pt;font-weight:800;letter-spacing:-.025em;line-height:1.15;margin:1mm 0 5mm}
.hash{color:var(--primary);font-weight:700;font-size:7.5pt;letter-spacing:.16em;text-transform:uppercase}
.toc ol{list-style:none;margin-top:4mm}.toc li{display:flex;gap:5mm;align-items:baseline;padding:3.2mm 0;border-bottom:1px solid var(--border);font-size:11pt;font-weight:600}
.toc li span{color:var(--primary);font-weight:800;width:8mm}
.sec{break-before:page}
h3{font-size:12.5pt;font-weight:800;letter-spacing:-.01em;margin:6mm 0 2.5mm;color:var(--text)}
h4{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--soft);margin:3mm 0 1.5mm}
p{margin:1.6mm 0}.lead{font-size:11pt;line-height:1.6;color:var(--text)}
.card{background:#fff;border:1px solid var(--border);border-radius:4mm;padding:3.6mm 4mm;break-inside:avoid}
.card .k,.k{display:block;font-size:7pt;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--primary);margin-bottom:1mm}
.card b{display:block;font-size:10pt}.card p{font-size:8.8pt;color:var(--soft);margin:1mm 0 0}
.grid2,.grid3{display:grid;gap:3.5mm;margin:3mm 0}.grid2{grid-template-columns:1fr 1fr}.grid3{grid-template-columns:repeat(3,1fr)}
.grid2.tight{gap:6mm}
.split{display:grid;grid-template-columns:1.15fr 1fr;gap:6mm;align-items:start;margin:3mm 0}
table{width:100%;border-collapse:separate;border-spacing:0;border:1px solid var(--border);border-radius:3.5mm;overflow:hidden;margin:3mm 0;font-size:8.7pt;break-inside:auto}
th{background:var(--bg);text-align:left;font-size:6.8pt;letter-spacing:.08em;text-transform:uppercase;color:var(--soft);padding:2.4mm 3mm;border-bottom:1px solid var(--border)}
td{padding:2.4mm 3mm;border-bottom:1px solid var(--border);vertical-align:top}tr:last-child td{border-bottom:none}tr{break-inside:avoid}
td.c{text-align:center}
.num{display:inline-flex;width:7mm;height:7mm;border-radius:2mm;color:#fff;font-weight:800;font-size:8.5pt;align-items:center;justify-content:center}
.pill{display:inline-block;font-size:6.8pt;font-weight:700;letter-spacing:.06em;text-transform:uppercase;background:var(--primary);color:#fff;border-radius:99px;padding:.8mm 2.6mm;white-space:nowrap}.pill.grey{background:var(--bg);color:var(--soft);border:1px solid var(--border)}
figure{margin:3mm 0;break-inside:avoid}figure img{width:100%;border-radius:3mm;border:1px solid var(--border);box-shadow:0 2mm 6mm rgba(21,80,42,.08)}
figcaption{font-size:7.8pt;color:var(--light);margin-top:1.5mm}
.ticks{list-style:none;margin:2mm 0}.ticks li{display:flex;gap:2.6mm;margin:1.8mm 0;align-items:flex-start}
.ticks li .ic{margin-top:1.2mm;padding:1mm;width:4.4mm!important;height:4.4mm!important;border-radius:50%;background:var(--soft-bg);color:var(--primary);fill:var(--primary)}
.ticks li .ic path{fill:var(--primary)}
.numbered{margin:2mm 0 2mm 5mm}.numbered li{margin:1.6mm 0;padding-left:1mm}
.callout{display:flex;gap:3mm;border-radius:3.5mm;padding:3.4mm 4mm;margin:4mm 0;background:var(--soft-bg);border-left:1.3mm solid var(--primary);break-inside:avoid}
.callout .ic path{fill:var(--primary)}.callout b{font-size:9.5pt}.callout p{margin:.8mm 0 0;font-size:8.8pt;color:var(--text)}
.callout.warn{background:#fff3e0;border-left-color:#e67e22}.callout.warn .ic path{fill:#e67e22}
.flow{display:flex;align-items:stretch;gap:1.5mm;margin:3mm 0;break-inside:avoid}
.flow .step{flex:1;background:#fff;border:1px solid var(--border);border-radius:3mm;padding:3mm 2.6mm;position:relative}
.flow .step b{display:block;font-size:8.6pt;margin-top:1.2mm}.flow .step p{font-size:7.6pt;color:var(--soft);margin:.8mm 0 0;line-height:1.4}
.flow .sn{font-size:6.8pt;font-weight:800;color:#fff;background:var(--primary);border-radius:99px;padding:.4mm 2mm}
.flow .arrow{align-self:center;color:var(--primary);font-weight:800}
.flow.small .step{padding:2.4mm}
.formula{max-width:120mm;margin:4mm auto 2mm;border:1px solid var(--border);border-radius:4mm;padding:2mm 6mm;break-inside:avoid}
.formula div{display:flex;justify-content:space-between;padding:2.4mm 0;border-bottom:1px solid var(--border);font-size:10.5pt}
.formula b{font-size:12pt;color:var(--primary)}.formula .neg b{color:#dc3545}
.formula .res{border-bottom:none;border-top:1mm solid var(--primary);margin-top:1mm;font-weight:800}.formula .res b{font-size:16pt}
.lesson{break-inside:avoid;border:1px solid var(--border);border-top:1.4mm solid var(--c);border-radius:4mm;padding:4.5mm 5mm;margin:0 0 5mm}
.lesson-head{display:flex;gap:4.5mm;align-items:flex-start}
.lesson-head .big{font-size:24pt;font-weight:800;color:var(--c);line-height:1}
.lesson-head h3{margin:.5mm 0 1mm}.lesson-head .k{color:var(--c)}.lesson-head p{font-size:8.8pt}
.lesson .ticks li .ic{background:color-mix(in srgb,var(--c) 14%,white)}.lesson .ticks li .ic path{fill:var(--c)}
.chapters{list-style:none}.chapters li{display:flex;gap:3mm;font-size:8.5pt;padding:.7mm 0}.chapters span{color:var(--light);width:9mm;font-variant-numeric:tabular-nums}
.takeaways{border-top:1px solid var(--border);margin-top:2mm;padding-top:1mm}
.script{margin-bottom:6mm}.script-head{display:flex;gap:3mm;align-items:center;border-bottom:.6mm solid var(--c);padding-bottom:2mm;margin:4mm 0 2mm;break-after:avoid}
.script-head h3{margin:0}.script h4{color:var(--c);break-after:avoid}.script p{font-size:9pt;text-align:justify}
/* back cover */
.back{page:back;break-before:page;height:297mm;width:210mm;background:#000;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.back img{width:150mm}.back .motto{letter-spacing:.14em;font-size:12pt;margin-top:2mm}.back .credit{margin-top:14mm;font-size:9pt;color:rgba(255,255,255,.7)}
.back .small{font-size:7.5pt;color:rgba(255,255,255,.4);margin-top:5mm;letter-spacing:.08em}
</style></head><body>

<section class="cover">
  <div style="display:flex;align-items:center;gap:4mm">${mark(48, "#2a8a4a")}<span class="k">OFFICIAL TRAINING PROGRAMME</span></div>
  <h1>NEWL AFRICA</h1>
  <div class="sub">DIGITAL SYSTEM TRAINING CENTRE</div>
  <h2>Training Programme Documentation</h2>
  <p class="desc">A written companion to the six-lesson training series on the NEWL AFRICA project management platform — for Board members, project owners, administrators and team leaders.</p>
  <div class="chips"><span>6 narrated lessons</span><span>${Math.round(total / 60)} minutes</span><span>English subtitles</span><span>Role quick references</span></div>
  <div class="meta"><div><b>Projects · Teams · Daily Logs · Financials — unified</b>Version 1.0 · ${today}</div><div style="text-align:right"><b>KEYPOLE TECHNOLOGIES</b>Training experience design &amp; production</div></div>
</section>

<section class="toc">
  <span class="hash"># Contents</span><h2>In this document</h2>
  <ol>${toc.map(([n, t]) => `<li><span>${n}</span>${esc(t)}</li>`).join("")}</ol>
  ${callout("Confidentiality", "Screens in this document come from the live NEWL AFRICA application. Personal data and credentials have been redacted. Do not add sign-in details or configuration values to copies of this document.")}
</section>

${sections.map((s, i) => `<section class="sec" id="${s.id}"><span class="hash"># ${i + 1} · ${esc(s.kicker)}</span><h2>${esc(s.title)}</h2>${s.body}</section>`).join("\n")}

<section class="sec"><span class="hash"># Appendix A</span><h2>Full narration scripts</h2>
<p class="soft">The complete narration of each lesson, word for word, grouped by chapter.</p>${appendix}</section>

<section class="back">
  <img src="${url("public/branding/keypole-technologies-logo.png")}" alt="KEYPOLE TECHNOLOGIES">
  <div class="motto">Technology. Creativity. Excellence.</div>
  <div class="credit">Training Experience Designed &amp; Developed by <b>KEYPOLE TECHNOLOGIES</b>.</div>
  <div class="small">NEWL AFRICA · DIGITAL SYSTEM TRAINING CENTRE</div>
</section>
</body></html>`;

fs.writeFileSync(HTML, html);

// Print with Remotion's headless Chrome through the DevTools protocol
const { openBrowser } = await import("@remotion/renderer");
const browser = await openBrowser("chrome", { chromiumOptions: {} });
const page = await browser.newPage({ context: () => null, logLevel: "error", indent: false, pageIndex: 0, onBrowserLog: () => {}, onLog: () => {} });
await page.goto({ url: pathToFileURL(HTML).href, timeout: 60000, options: { waitUntil: "load" } });
await page.evaluate(() => document.fonts.ready.then(() => true));
const cdp = page._client();
const res = await cdp.send("Page.printToPDF", { printBackground: true, preferCSSPageSize: true, displayHeaderFooter: false, transferMode: "ReturnAsBase64" });
fs.writeFileSync(PDF, Buffer.from((res.value ?? res).data, "base64"));
await browser.close({ silent: true });
console.log(`PDF written: ${path.relative(ROOT, PDF)} (${(fs.statSync(PDF).size / 1e6).toFixed(1)} MB)`);
