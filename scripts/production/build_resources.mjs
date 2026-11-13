// Converts resources/*.md and resources/scripts/*.md into styled HTML pages for the
// learning centre (Markdown is shown as plain text by static hosts such as GitHub Pages).
// Supports the Markdown subset used in this project: headings, paragraphs, lists,
// tables, bold/italic/code, links, blockquotes and horizontal rules.
import fs from "node:fs";
import path from "node:path";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (s) =>
  esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => `<a href="${u.replace(/\.md$/, ".html")}">${t}</a>`);

const cells = (line) => line.trim().replace(/^\||\|$/g, "").split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|"));

export const mdToHtml = (md) => {
  const lines = md.replace(/\r/g, "").split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) { out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); i++; continue; }
    if (/^---+\s*$/.test(line)) { out.push("<hr>"); i++; continue; }
    if (line.startsWith("|") && lines[i + 1] && /^\|?\s*:?-{3,}/.test(lines[i + 1])) {
      const head = cells(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(cells(lines[i++]));
      out.push(`<div class="table"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${rows
        .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
        .join("")}</tbody></table></div>`);
      continue;
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*([-*]|\d+\.)\s+/, ""));
      out.push(`<${ordered ? "ol" : "ul"}>${items.map((t) => `<li>${inline(t)}</li>`).join("")}</${ordered ? "ol" : "ul"}>`);
      continue;
    }
    if (line.startsWith(">")) {
      const q = [];
      while (i < lines.length && lines[i].startsWith(">")) q.push(lines[i++].replace(/^>\s?/, ""));
      out.push(`<blockquote>${inline(q.join(" "))}</blockquote>`);
      continue;
    }
    const p = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|\||\s*([-*]|\d+\.)\s|>|---)/.test(lines[i])) p.push(lines[i++].replace(/\s{2}$/, "<br>"));
    out.push(`<p>${inline(p.join(" ")).replace(/&lt;br&gt;/g, "<br>")}</p>`);
  }
  return out.join("\n");
};

const page = (title, body, depth) => {
  const up = "../".repeat(depth);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)} · NEWL AFRICA Training</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
<link rel="stylesheet" href="${up}assets/css/learning-centre.css">
<link rel="stylesheet" href="${up}assets/css/document.css">
</head>
<body>
<header class="topnav"><div class="wrap topnav-inner">
  <a class="brand" href="${up}index.html"><span class="mark"><i class="fas fa-tower-cell"></i></span><span><b>NEWL AFRICA</b><small>DIGITAL SYSTEM TRAINING CENTRE</small></span></a>
  <nav class="links"><a href="${up}index.html#lessons">Lessons</a><a href="${up}index.html#resources">Resources</a></nav>
</div></header>
<main class="wrap doc">
<a class="back" href="${up}index.html#resources"><i class="fas fa-arrow-left"></i> Back to the training centre</a>
<article>
${body}
</article>
</main>
<footer class="footer"><div class="wrap footer-inner">
  <div class="footer-newl"><span class="mark"><i class="fas fa-tower-cell"></i></span><div><b>NEWL AFRICA</b><small>Digital System Training Centre</small></div></div>
  <div class="footer-credit"><img src="${up}public/branding/keypole-technologies-logo.png" alt="KEYPOLE TECHNOLOGIES" width="240" height="160"><p>Training Experience Designed &amp; Developed by <b>KEYPOLE TECHNOLOGIES</b>.</p></div>
</div></footer>
</body>
</html>
`;
};

const convertDir = (dir, depth) => {
  if (!fs.existsSync(dir)) return 0;
  let n = 0;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".md")) continue;
    const md = fs.readFileSync(path.join(dir, f), "utf8");
    const title = (md.match(/^#\s+(.*)$/m) || [, f])[1];
    fs.writeFileSync(path.join(dir, f.replace(/\.md$/, ".html")), page(title, mdToHtml(md), depth));
    n++;
  }
  return n;
};

const n = convertDir("resources", 1) + convertDir("resources/scripts", 2);
console.log(`built ${n} resource pages`);
