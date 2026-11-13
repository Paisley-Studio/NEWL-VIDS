/* NEWL AFRICA Digital System Training Centre — player, navigation and progress.
   No accounts: progress lives in this browser's localStorage only. */
(function () {
  "use strict";
  var CFG = window.NEWL_TRAINING_CONFIG || {};
  var STORE_KEY = "newl-training-progress-v1";
  var $ = function (id) { return document.getElementById(id); };

  /* ------------------------------------------------------------ storage */
  var store = { lessons: {}, last: null, captions: true };
  try {
    var raw = localStorage.getItem(STORE_KEY);
    if (raw) store = Object.assign(store, JSON.parse(raw));
  } catch (e) { /* private mode or blocked storage: progress is simply not kept */ }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* ignore */ }
  }
  function rec(id) {
    if (!store.lessons[id]) store.lessons[id] = { pos: 0, max: 0, done: false };
    return store.lessons[id];
  }

  /* ------------------------------------------------------------ helpers */
  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(s).padStart(2, "0");
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function mediaUrl(lesson, kind) {
    var override = kind === "video" ? (CFG.videos || {})[lesson.id] : (CFG.posters || {})[lesson.id];
    if (override) return override;
    var rel = kind === "video" ? lesson.video : lesson.poster;
    if (CFG.flatVideoPaths) rel = rel.split("/").pop();
    return (CFG.videoBaseUrl || "") + rel;
  }
  var toastTimer;
  function toast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }

  /* ------------------------------------------------------------ state */
  var lessons = [];
  var current = null;
  var video = $("video");
  var box = $("playerBox");
  var pendingResume = 0;

  function lessonById(id) { return lessons.filter(function (l) { return l.id === id; })[0]; }
  function indexOf(l) { return lessons.indexOf(l); }
  function durationOf(l) { return (current === l && isFinite(video.duration) && video.duration) || l.duration; }

  /* ------------------------------------------------------------ rendering */
  function renderGrid() {
    $("lessonGrid").innerHTML = lessons.map(function (l) {
      var r = rec(l.id);
      var pct = Math.round(Math.min(1, r.max / l.duration) * 100);
      var n = String(l.number).padStart(2, "0");
      return '<button class="lesson-card' + (r.done ? " is-done" : "") + (current === l ? " current" : "") + '" style="--c:' + l.accent + '" data-id="' + l.id + '" aria-label="Lesson ' + n + ': ' + esc(l.title) + '">' +
        '<div class="thumb"><div class="fallback"><span>LESSON</span><b>' + n + '</b></div>' +
        '<img src="' + esc(mediaUrl(l, "poster")) + '" alt="" loading="lazy" onerror="this.remove()">' +
        '<span class="done"><i class="fas fa-check"></i> Completed</span><span class="dur">' + fmt(l.duration) + '</span>' +
        '<div class="bar"><i style="width:' + (r.done ? 100 : pct) + '%"></i></div></div>' +
        '<div class="lc-body"><span class="lc-num">Lesson ' + n + '</span><span class="lc-title">' + esc(l.title) + '</span>' +
        '<span class="lc-desc">' + esc(l.description) + '</span>' +
        '<span class="lc-aud">' + l.audience.map(function (a) { return "<span>" + esc(a) + "</span>"; }).join("") + "</span></div></button>";
    }).join("");
    Array.prototype.forEach.call(document.querySelectorAll(".lesson-card"), function (el) {
      el.addEventListener("click", function () {
        select(el.getAttribute("data-id"), true);
        $("player").scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  function renderOverall() {
    var done = lessons.filter(function (l) { return rec(l.id).done; }).length;
    $("overallDone").textContent = done;
    $("overallFill").style.width = (lessons.length ? (done / lessons.length) * 100 : 0) + "%";
    var next = lessons.filter(function (l) { return !rec(l.id).done; })[0] || lessons[0];
    var startLabel = done === 0 ? "Start Lesson 01" : done === lessons.length ? "Watch again" : "Continue with Lesson " + String(next.number).padStart(2, "0");
    $("heroStart").querySelector("span").textContent = startLabel;
    $("heroStart").onclick = function () { select(next.id, false); };
  }

  function renderResources() {
    $("scriptLinks").innerHTML = lessons.map(function (l) {
      return '<a href="' + esc(l.script.replace(/\.md$/, ".html")) + '">Lesson ' + String(l.number).padStart(2, "0") + "</a>";
    }).join("");
    $("subtitleLinks").innerHTML = lessons.map(function (l) {
      var n = String(l.number).padStart(2, "0");
      return '<a href="' + esc(l.subtitles.srt) + '" download>' + n + " SRT</a>" + '<a href="' + esc(l.subtitles.vtt) + '" download>' + n + " VTT</a>";
    }).join("");
  }

  function renderMarkers(l) {
    var d = durationOf(l);
    $("scrubMarkers").innerHTML = l.chapters.slice(1).map(function (c) {
      return '<span style="left:' + (c.start / d) * 100 + '%"></span>';
    }).join("");
  }

  function renderChapters(l) {
    $("chapters").innerHTML = l.chapters.map(function (c, i) {
      return '<li><button data-t="' + c.start + '" data-i="' + i + '"><span class="t">' + fmt(c.start) + "</span><span>" + esc(c.title) + "</span></button></li>";
    }).join("");
    Array.prototype.forEach.call($("chapters").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () { seek(Number(b.getAttribute("data-t")), true); });
    });
    $("objectives").innerHTML = l.objectives.map(function (o) { return "<li>" + esc(o) + "</li>"; }).join("");
  }

  function chapterAt(l, t) {
    var idx = 0;
    l.chapters.forEach(function (c, i) { if (t >= c.start - 0.25) idx = i; });
    return idx;
  }

  function updateMeta() {
    var l = current;
    var r = rec(l.id);
    var md = $("markDone");
    md.classList.toggle("done", r.done);
    md.querySelector("span").textContent = r.done ? "Completed" : "Mark complete";
    $("metaStatus").textContent = r.done ? "✓ Lesson completed" : r.max > 5 ? Math.round(Math.min(1, r.max / l.duration) * 100) + "% watched" : "";
    $("prevLesson").disabled = indexOf(l) === 0;
    $("nextLesson").disabled = indexOf(l) === lessons.length - 1;
  }

  /* ------------------------------------------------------------ lesson selection */
  function select(id, autoplay) {
    var l = lessonById(id) || lessons[0];
    if (current && current !== l) persistPosition();
    current = l;
    store.last = l.id;
    save();
    document.documentElement.style.setProperty("--lesson", l.accent);
    var n = String(l.number).padStart(2, "0");
    $("nowHash").textContent = "# Lesson " + n + " of " + String(lessons.length).padStart(2, "0");
    $("nowTitle").textContent = l.title;
    $("nowTheme").textContent = l.theme;
    $("lessonBadge").textContent = "Lesson " + n;
    $("metaDuration").textContent = fmt(l.duration);
    $("scriptLink").href = l.script.replace(/\.md$/, ".html");
    $("srtLink").href = l.subtitles.srt;
    $("playerState").hidden = true;
    $("resumeBox").hidden = true;
    box.classList.remove("playing");

    // (re)build the media element sources
    video.pause();
    while (video.firstChild) video.removeChild(video.firstChild);
    video.removeAttribute("src");
    video.poster = mediaUrl(l, "poster");
    var track = document.createElement("track");
    track.kind = "captions";
    track.label = "English";
    track.srclang = "en";
    track.src = l.subtitles.vtt;
    track.default = store.captions !== false;
    video.appendChild(track);
    video.src = mediaUrl(l, "video");
    video.load();
    applyCaptions();

    renderChapters(l);
    renderMarkers(l);
    renderGrid();
    updateMeta();
    updateTime();
    if (location.hash !== "#" + l.id) history.replaceState(null, "", "#" + l.id);

    var r = rec(l.id);
    pendingResume = r.pos > 15 && r.pos < l.duration - 20 && !r.done ? r.pos : 0;
    if (pendingResume) {
      $("resumeAt").textContent = fmt(pendingResume);
      $("resumeBox").hidden = false;
    }
    if (autoplay && !pendingResume) play();
  }

  /* ------------------------------------------------------------ playback */
  function play() {
    $("resumeBox").hidden = true;
    var p = video.play();
    if (p && p.catch) p.catch(function () { /* autoplay blocked: user can press play */ });
  }
  function toggle() { if (video.paused || video.ended) play(); else video.pause(); }
  function seek(t, andPlay) {
    if (!isFinite(t)) return;
    pendingResume = 0;
    $("resumeBox").hidden = true;
    try { video.currentTime = Math.max(0, Math.min(t, (video.duration || current.duration) - 0.2)); } catch (e) { /* not seekable yet */ }
    if (andPlay) play();
  }
  function applyCaptions() {
    var on = store.captions !== false;
    $("ccBtn").setAttribute("aria-pressed", String(on));
    for (var i = 0; i < video.textTracks.length; i++) video.textTracks[i].mode = on ? "showing" : "hidden";
  }
  function persistPosition() {
    if (!current || !isFinite(video.currentTime)) return;
    var r = rec(current.id);
    r.pos = video.currentTime;
    save();
  }
  function markDone(id, done) {
    var r = rec(id);
    if (r.done === done) return;
    r.done = done;
    if (done) r.max = Math.max(r.max, lessonById(id).duration);
    save();
    renderGrid();
    renderOverall();
    updateMeta();
    if (done) toast("Lesson " + String(lessonById(id).number).padStart(2, "0") + " marked as complete");
  }

  var lastSave = 0;
  function updateTime() {
    if (!current) return;
    var d = durationOf(current);
    var t = video.currentTime || 0;
    $("tNow").textContent = fmt(t);
    $("tDur").textContent = fmt(d);
    var pct = d ? (t / d) * 100 : 0;
    $("scrubFill").style.width = pct + "%";
    $("lessonFill").style.width = pct + "%";
    $("scrub").setAttribute("aria-valuenow", String(Math.round(pct)));
    if (video.buffered && video.buffered.length) $("scrubBuffer").style.width = (video.buffered.end(video.buffered.length - 1) / d) * 100 + "%";
    var ci = chapterAt(current, t);
    $("chapterNow").textContent = "· " + current.chapters[ci].title;
    Array.prototype.forEach.call($("chapters").querySelectorAll("button"), function (b, i) { b.classList.toggle("active", i === ci); });
    var r = rec(current.id);
    if (t > r.max) r.max = t;
    if (!r.done && d && t / d >= 0.92) markDone(current.id, true);
    if (Date.now() - lastSave > 4000) {
      lastSave = Date.now();
      r.pos = t;
      save();
      updateMeta();
    }
  }

  function showMissing() {
    var l = current;
    $("stateTitle").textContent = "Video not yet published";
    $("stateText").textContent = "Lesson " + String(l.number).padStart(2, "0") + " has not been rendered or uploaded to the configured hosting location yet. Its full narration script and subtitles are already available.";
    $("stateActions").innerHTML = '<a class="btn btn-sm" href="' + esc(l.script.replace(/\.md$/, ".html")) + '"><i class="fas fa-file-lines"></i> Read the script</a>' +
      '<a class="btn btn-sm" href="' + esc(l.subtitles.srt) + '" download><i class="fas fa-closed-captioning"></i> Subtitles</a>';
    $("playerState").hidden = false;
    $("resumeBox").hidden = true;
  }

  /* ------------------------------------------------------------ events */
  video.addEventListener("play", function () { box.classList.add("playing"); $("playBtn").innerHTML = '<i class="fas fa-pause"></i>'; $("playBtn").setAttribute("aria-label", "Pause"); });
  video.addEventListener("pause", function () { box.classList.remove("playing"); $("playBtn").innerHTML = '<i class="fas fa-play"></i>'; $("playBtn").setAttribute("aria-label", "Play"); persistPosition(); });
  video.addEventListener("timeupdate", updateTime);
  video.addEventListener("progress", updateTime);
  video.addEventListener("loadedmetadata", function () { renderMarkers(current); updateTime(); applyCaptions(); });
  video.addEventListener("ended", function () {
    markDone(current.id, true);
    rec(current.id).pos = 0;
    save();
    var nxt = lessons[indexOf(current) + 1];
    if (nxt) toast("Up next: Lesson " + String(nxt.number).padStart(2, "0") + " — " + nxt.shortTitle);
  });
  video.addEventListener("error", function () { if (video.error && current) showMissing(); });
  video.addEventListener("click", toggle);

  $("bigPlay").addEventListener("click", function () { if (pendingResume) { seek(pendingResume, true); } else play(); });
  $("playBtn").addEventListener("click", toggle);
  $("back10").addEventListener("click", function () { seek(video.currentTime - 10); });
  $("fwd10").addEventListener("click", function () { seek(video.currentTime + 10); });
  $("resumeYes").addEventListener("click", function () { seek(pendingResume, true); });
  $("resumeNo").addEventListener("click", function () { seek(0, true); });
  $("muteBtn").addEventListener("click", function () {
    video.muted = !video.muted;
    $("muteBtn").innerHTML = video.muted ? '<i class="fas fa-volume-xmark"></i>' : '<i class="fas fa-volume-high"></i>';
  });
  $("volume").addEventListener("input", function (e) { video.volume = Number(e.target.value); video.muted = video.volume === 0; });
  $("speed").addEventListener("change", function (e) { video.playbackRate = Number(e.target.value); });
  $("ccBtn").addEventListener("click", function () { store.captions = store.captions === false; save(); applyCaptions(); });
  $("fsBtn").addEventListener("click", function () {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (box.requestFullscreen) box.requestFullscreen();
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
  });
  document.addEventListener("fullscreenchange", function () {
    $("fsBtn").innerHTML = document.fullscreenElement ? '<i class="fas fa-compress"></i>' : '<i class="fas fa-expand"></i>';
  });
  $("prevLesson").addEventListener("click", function () { var p = lessons[indexOf(current) - 1]; if (p) select(p.id, false); });
  $("nextLesson").addEventListener("click", function () { var n = lessons[indexOf(current) + 1]; if (n) select(n.id, false); });
  $("markDone").addEventListener("click", function () { markDone(current.id, !rec(current.id).done); });
  $("resetProgress").addEventListener("click", function () {
    if (!confirm("Reset your training progress in this browser?")) return;
    store = { lessons: {}, last: null, captions: store.captions };
    save();
    renderGrid();
    renderOverall();
    updateMeta();
    toast("Progress reset");
  });

  // scrubbing with chapter tooltip
  var scrub = $("scrub");
  function scrubTime(e) {
    var r = scrub.getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    return Math.max(0, Math.min(1, x / r.width)) * durationOf(current);
  }
  var dragging = false;
  scrub.addEventListener("pointerdown", function (e) { dragging = true; scrub.setPointerCapture(e.pointerId); seek(scrubTime(e)); });
  scrub.addEventListener("pointermove", function (e) {
    var t = scrubTime(e);
    var tip = $("scrubTip");
    tip.hidden = false;
    tip.textContent = fmt(t) + " · " + current.chapters[chapterAt(current, t)].title;
    tip.style.left = (t / durationOf(current)) * 100 + "%";
    if (dragging) seek(t);
  });
  scrub.addEventListener("pointerup", function () { dragging = false; });
  scrub.addEventListener("pointerleave", function () { $("scrubTip").hidden = true; });
  scrub.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { seek(video.currentTime + 5); e.preventDefault(); }
    if (e.key === "ArrowLeft") { seek(video.currentTime - 5); e.preventDefault(); }
  });

  // auto-hide controls while playing
  var idleTimer;
  function wake() {
    box.classList.remove("idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () { box.classList.add("idle"); }, 2600);
  }
  box.addEventListener("mousemove", wake);
  box.addEventListener("touchstart", wake, { passive: true });

  // keyboard shortcuts (ignored while typing in form controls)
  document.addEventListener("keydown", function (e) {
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "select" || tag === "textarea" || e.metaKey || e.ctrlKey || e.altKey || !current) return;
    var inPlayer = box.contains(document.activeElement) || document.activeElement === document.body;
    if (!inPlayer) return;
    switch (e.key) {
      case " ": case "k": toggle(); e.preventDefault(); break;
      case "ArrowRight": seek(video.currentTime + 5); e.preventDefault(); break;
      case "ArrowLeft": seek(video.currentTime - 5); e.preventDefault(); break;
      case "f": $("fsBtn").click(); break;
      case "c": $("ccBtn").click(); break;
      case "m": $("muteBtn").click(); break;
    }
  });
  window.addEventListener("beforeunload", persistPosition);
  window.addEventListener("hashchange", function () {
    var id = location.hash.slice(1);
    if (lessonById(id) && (!current || current.id !== id)) select(id, false);
  });

  /* ------------------------------------------------------------ boot */
  fetch(CFG.dataUrl || "data/lessons.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function (data) {
      lessons = data.lessons;
      var total = lessons.reduce(function (s, l) { return s + l.duration; }, 0);
      $("totalMinutes").textContent = Math.round(total / 60);
      renderResources();
      var fromHash = location.hash.slice(1);
      select(lessonById(fromHash) ? fromHash : store.last && lessonById(store.last) ? store.last : lessons[0].id, false);
      renderOverall();
    })
    .catch(function (err) {
      $("nowTitle").textContent = "The lesson catalogue could not be loaded";
      $("nowTheme").textContent = "Open the training centre through a web server (for example `npm run serve`), not directly from the file system. (" + err.message + ")";
    });
})();
