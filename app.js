/* De-label — penicillin allergy de-labelling prototype.
   Static app: hash routing, data kept in localStorage. */
(() => {
  "use strict";

  const STORE_KEY = "delabel.v1";
  const ME = "Dr V. Redenbaugh";
  const ME_ROLE = "Consultant Immunologist";
  const OBS_MIN = 60;
  const DAY = 86400000;
  const MIN = 60000;

  const DRUGS = {
    amox: { name: "Amoxicillin", dose: "500 mg PO" },
    fluclox: { name: "Flucloxacillin", dose: "500 mg PO" },
  };
  const STOP_REASONS = {
    anaphylaxis: "Anaphylaxis history",
    type4: "Type 4 features",
    uncertain: "Uncertain history",
  };

  /* ---------- icons ---------- */
  const P = {
    pill: '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    hand: '<path d="M18 11V6a2 2 0 0 0-4 0"/><path d="M14 10V4a2 2 0 0 0-4 0v2"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
    query: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M9.2 9a2 2 0 1 1 2.6 1.9c-.5.2-.8.6-.8 1.1"/><path d="M11 14.5h.01"/>',
    clipboard: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    upright: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    pencil: '<path d="M21.17 6.81a1 1 0 0 0-3.99-3.98L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/><path d="m15 5 4 4"/>',
    bell: '<path d="M10.27 21a2 2 0 0 0 3.46 0"/><path d="M3.26 15.33A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.67C19.41 13.96 18 12.5 18 8A6 6 0 0 0 6 8c0 4.5-1.41 5.96-2.74 7.33"/>',
    flask: '<path d="M10 2v7.53a2 2 0 0 1-.21.9L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.07-10.13A2 2 0 0 1 14 9.53V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
    square: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/>',
  };
  const ic = (n) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;
  const logo = '<span class="logo" aria-hidden="true"><span></span><span></span><span></span><span></span></span>';

  /* ---------- helpers ---------- */
  const $app = document.getElementById("app");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const hm = (t) => { const d = new Date(t); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayLabel = (t) => { const d = new Date(t); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; };
  const isToday = (t) => new Date(t).toDateString() === new Date().toDateString();
  const fmtMrn = (s) => { const d = String(s).replace(/\D/g, ""); return d.length > 4 ? `${d.slice(0, 4)} ${d.slice(4, 8)}` : d; };
  const ordinal = (n) => { const s = ["th", "st", "nd", "rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
  const uid = () => Math.random().toString(36).slice(2, 10);

  /* ---------- data ---------- */
  function rng(seed) { return () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }; }

  function seed() {
    const r = rng(20261105);
    const now = Date.now();
    const pick = (a) => a[Math.floor(r() * a.length)];
    const mrn = () => String(2000 + Math.floor(r() * 2999)) + String(1000 + Math.floor(r() * 8999));
    const ward = () => pick(["2A", "3C", "4B", "5A", "6B", "7A", "8C", "SAU", "AMU"]);
    const at = (daysAgo, h, m) => { const d = new Date(now - daysAgo * DAY); d.setHours(h, m, 0, 0); return d.getTime(); };
    const randAt = (lo, hi) => at(lo + Math.floor(r() * (hi - lo)), 8 + Math.floor(r() * 8), Math.floor(r() * 12) * 5);
    const recs = [];
    const add = (o) => recs.push({ id: uid(), checks: { 15: true, 60: true }, drug: r() < 0.8 ? "amox" : "fluclox", ward: ward(), mrn: mrn(), ...o });

    // Rows from the design
    add({ mrn: "44172093", ward: "4B", drug: "amox", givenAt: now - 20 * MIN, doctor: "Dr A. Byrne", status: "observing", checks: { 15: true, 60: false } });
    add({ mrn: "39021176", ward: "7A", drug: "amox", givenAt: at(1, 14, 10), doctor: "Dr S. Kelly", status: "negative" });
    add({ mrn: "41208854", ward: "3C", drug: "fluclox", givenAt: at(1, 11, 25), doctor: "Dr M. Okafor", status: "positive", reaction: "mild rash" });
    add({ mrn: "28710349", ward: "4B", drug: "amox", givenAt: at(2, 9, 15), doctor: "Dr A. Byrne", status: "negative" });
    add({ mrn: "40065521", ward: "6B", drug: "amox", givenAt: at(3, 15, 5), doctor: "Dr L. Walsh", status: "negative" });
    add({ mrn: "37559902", ward: "2A", drug: "fluclox", givenAt: at(6, 10, 30), doctor: "Dr S. Kelly", status: "negative" });

    // Rest of the last 30 days (negatives per doctor, minus the rows above)
    const neg30 = { "Dr S. Kelly": 7, [ME]: 5, "Dr M. Okafor": 5, "Dr L. Walsh": 3, "Dr A. Byrne": 2,
      "Dr R. Nolan": 3, "Dr C. Doyle": 3, "Dr J. Murphy": 3, "Dr E. Quinn": 2, "Dr H. Ahmed": 2, "Dr T. Lynch": 2 };
    for (const [doc, n] of Object.entries(neg30)) for (let i = 0; i < n; i++) add({ givenAt: randAt(7, 29), doctor: doc, status: "negative" });
    const docs = Object.keys(neg30);
    add({ givenAt: randAt(7, 29), doctor: pick(docs), status: "positive", reaction: "mild rash" });
    add({ givenAt: randAt(7, 29), doctor: pick(docs), status: "positive", reaction: "mild rash" });
    add({ givenAt: randAt(7, 29), doctor: "Dr J. Murphy", status: "positive", reaction: "anaphylaxis" });
    add({ givenAt: at(2, 13, 20), doctor: "Dr C. Doyle", status: "uncertain" });
    add({ givenAt: at(4, 10, 5), doctor: "Dr R. Nolan", status: "uncertain" });
    const stops = [["anaphylaxis", 5], ["type4", 4], ["uncertain", 3]];
    for (const [reason, n] of stops) for (let i = 0; i < n; i++) add({ givenAt: randAt(1, 29), doctor: pick(docs), status: "stopped", stopReason: reason, drug: null });

    // Older history: past year, and before that
    const older = (lo, hi, n) => {
      for (let i = 0; i < n; i++) {
        const x = r();
        const base = { givenAt: randAt(lo, hi), doctor: pick(docs) };
        if (x < 0.2) add({ ...base, status: "stopped", stopReason: pick(["anaphylaxis", "anaphylaxis", "type4", "uncertain"]), drug: null });
        else if (x < 0.27) add({ ...base, status: "positive", reaction: r() < 0.85 ? "mild rash" : "anaphylaxis" });
        else add({ ...base, status: "negative" });
      }
    };
    older(31, 365, 160);
    older(366, 900, 90);
    return recs;
  }

  const db = {
    load() {
      try { const s = JSON.parse(localStorage.getItem(STORE_KEY)); if (Array.isArray(s?.records)) return s; } catch (e) {}
      return { records: seed() };
    },
    save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {} },
  };
  let state = db.load();
  db.save();

  const ui = { period: "month", recView: "recent", resTab: "protocol", open: new Set(["s1"]), draft: null };

  const byId = (id) => state.records.find((r) => r.id === id);
  const inPeriod = (p) => {
    const now = Date.now();
    const span = p === "month" ? 30 * DAY : p === "year" ? 365 * DAY : Infinity;
    return state.records.filter((r) => now - r.givenAt <= span);
  };
  const sortDesc = (a) => a.slice().sort((x, y) => y.givenAt - x.givenAt);

  function stats(recs) {
    const c = { negative: 0, positive: 0, observing: 0, uncertain: 0, stopped: 0, mild: 0, ana: 0, stop: { anaphylaxis: 0, type4: 0, uncertain: 0 } };
    for (const r of recs) {
      c[r.status]++;
      if (r.status === "positive") r.reaction === "anaphylaxis" ? c.ana++ : c.mild++;
      if (r.status === "stopped") c.stop[r.stopReason]++;
    }
    c.run = c.negative + c.positive + c.observing + c.uncertain;
    c.pct = c.run ? Math.round((c.negative / c.run) * 100) : 0;
    return c;
  }

  function leaderboard() {
    const counts = {};
    for (const r of inPeriod("month")) if (r.status === "negative") counts[r.doctor] = (counts[r.doctor] || 0) + 1;
    counts[ME] = counts[ME] || 0;
    const rows = Object.entries(counts).sort((a, b) => b[1] - a[1] || (a[0] === ME ? -1 : b[0] === ME ? 1 : a[0].localeCompare(b[0])));
    const myRank = rows.findIndex(([d]) => d === ME) + 1;
    let top = rows.slice(0, 5).map((row, i) => [i + 1, ...row]);
    if (myRank > 5) top = [...top.slice(0, 4), [myRank, ME, counts[ME]]];
    return { top, myRank, mine: counts[ME] };
  }

  const opcOpen = () => { const d = new Date(), day = d.getDay(), h = d.getHours(); return day >= 1 && day <= 5 && h >= 8 && h < 16; };

  /* ---------- result pills ---------- */
  function pill(r, short) {
    switch (r.status) {
      case "observing": return `<span class="pill obs">${short ? "Observing" : "In observation"}</span>`;
      case "negative": return `<span class="pill neg">${short ? "Negative" : "Negative · de-labelled"}</span>`;
      case "positive": {
        const rx = r.reaction === "anaphylaxis" ? "anaphylaxis" : "mild rash";
        return `<span class="pill pos">${short ? rx[0].toUpperCase() + rx.slice(1) : "Positive · " + rx}</span>`;
      }
      case "uncertain": return `<span class="pill unc">${short ? "Review" : "Uncertain · review"}</span>`;
      default: return `<span class="pill stop">Stopped</span>`;
    }
  }
  const drugName = (r) => (r.drug ? DRUGS[r.drug].name : "—");

  /* ---------- sheet + toast ---------- */
  function sheet(html, onMount) {
    closeSheet();
    const el = document.createElement("div");
    el.className = "sheet-backdrop";
    el.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
    el.addEventListener("click", (e) => { if (e.target === el || e.target.closest("[data-close]")) closeSheet(); });
    document.body.appendChild(el);
    document.body.style.overflow = "hidden";
    onMount && onMount(el);
    return el;
  }
  function closeSheet() {
    document.querySelectorAll(".sheet-backdrop").forEach((n) => n.remove());
    document.body.style.overflow = "";
  }
  let toastT;
  function toast(msg) {
    document.querySelectorAll(".toast").forEach((n) => n.remove());
    const t = document.createElement("div");
    t.className = "toast"; t.textContent = msg; t.setAttribute("role", "status");
    document.body.appendChild(t);
    clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 2600);
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(); });

  /* ---------- screens ---------- */
  function Home() {
    const h = new Date().getHours();
    const greet = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
    const open = opcOpen();
    return `<div class="screen">
      <header class="topbar">
        <a class="brand" href="#/">${logo}De-label</a>
        <a class="circle-btn" href="#/dashboard" aria-label="Your overview">${ic("user")}</a>
      </header>
      <p class="eyebrow">${greet}</p>
      <h1 class="display">Penicillin allergy de-labelling</h1>
      <div class="status-pill"><span class="dot ${open ? "" : "off"}"></span>OPC window ${open ? "open" : "closed"} · Mon–Fri 8am–4pm</div>
      <a class="tile t1" href="#/register"><span class="ico">${ic("pill")}</span><span class="arrow">${ic("upright")}</span><span class="label">Register challenge</span></a>
      <a class="tile t2" href="#/dashboard"><span class="ico">${ic("activity")}</span><span class="arrow">${ic("upright")}</span><span class="label">Track de-labelling</span></a>
      <a class="tile t3" href="#/resources"><span class="ico">${ic("file")}</span><span class="arrow">${ic("upright")}</span><span class="label">Resources</span></a>
      <div class="spacer"></div>
      <div class="footer-line"><span class="muted">${ME_ROLE}</span><b>${ME}</b></div>
    </div>`;
  }

  /* --- register --- */
  const EXCLUSIONS = [
    "Oral antihistamines in past 72 hours, unless held",
    "Acutely unwell or clinically unstable (EWS ≥ 2)",
    "Pregnancy",
    "ACE inhibitor or beta blocker, unless held for 24 hours",
    "Taking omalizumab",
    "Severe uncontrolled or acute exacerbation of asthma/COPD",
    "Unable to give consent",
  ];
  const STOPS = [
    ["anaphylaxis", "History suggests anaphylaxis"],
    ["type4", "Features of type 4 hypersensitivity"],
    ["uncertain", "History is uncertain"],
  ];

  function newDraft() {
    const n = new Date();
    return { mrn: String(40000000 + Math.floor(Math.random() * 9999999)), ward: "4B", drug: "amox", time: `${pad(n.getHours())}:${pad(n.getMinutes())}`, excl: new Set(), stop: null };
  }

  function eligibility(d) {
    if (d.stop) return { ok: false, title: "Stop — refer to immunology", sub: STOP_REASONS[d.stop] };
    if (d.excl.size) return { ok: false, title: "Not eligible today", sub: `${d.excl.size} exclusion criteri${d.excl.size > 1 ? "a apply" : "on applies"}` };
    return { ok: true, title: "Eligible for challenge", sub: "No exclusions or high-risk history" };
  }

  function Register() {
    const d = ui.draft || (ui.draft = newDraft());
    const el = eligibility(d);
    const cta = d.stop
      ? `<button class="btn dark" data-act="record-stop">Record stop &amp; refer ${ic("arrow")}</button>`
      : `<button class="btn primary" data-act="start" ${el.ok ? "" : "disabled style=\"opacity:.45;cursor:not-allowed\""}>Start challenge ${ic("arrow")}</button>`;
    return `<div class="screen">
      <div class="back-row"><a class="circle-btn" href="#/" aria-label="Back">${ic("left")}</a></div>
      <h1 class="display">Register challenge</h1>
      <p class="muted" style="margin:8px 0 24px">Pre-filled from the patient record.</p>
      <div class="field-scroll">
        <label class="field"><span>MRN</span><input id="f-mrn" inputmode="numeric" autocomplete="off" maxlength="9" value="${esc(fmtMrn(d.mrn))}"></label>
        <label class="field small"><span>Ward</span><input id="f-ward" autocomplete="off" maxlength="6" value="${esc(d.ward)}"></label>
      </div>
      <button class="elig ${el.ok ? "" : "bad"}" data-act="eligibility">
        <span class="badge">${ic(el.ok ? "shield" : "ban")}</span>
        <span class="t"><b>${el.title}</b><small>${el.sub}</small></span>
        <span class="view">${el.ok ? "View" : "Edit"}</span>
      </button>
      <p class="section-label">Drug</p>
      <div class="drug-grid">
        ${Object.entries(DRUGS).map(([k, v]) => `<button class="drug" data-act="drug" data-v="${k}" aria-pressed="${d.drug === k}"><b>${v.name}</b><small>${v.dose}</small></button>`).join("")}
      </div>
      <label class="time-row"><span>Time given</span><input id="f-time" type="time" value="${d.time}"></label>
      <div class="spacer"></div>
      ${cta}
    </div>`;
  }

  function openEligibility() {
    const d = ui.draft;
    const row = (key, label, on) => `<button class="toggle-row" data-k="${key}" aria-pressed="${on}"><span>${label}</span><span class="switch"></span></button>`;
    sheet(`<h2>Screening</h2>
      <p class="sub">Exclusion criteria — do not proceed if any apply.</p>
      <div class="card" style="padding:0 16px">${EXCLUSIONS.map((x, i) => row("e" + i, x, d.excl.has(i))).join("")}</div>
      <p class="section-label">High-risk history — stop and refer if yes</p>
      <div class="card" style="padding:0 16px">${STOPS.map(([k, l]) => row("s-" + k, l, d.stop === k)).join("")}</div>
      <div style="height:16px"></div>
      <button class="btn primary" data-close>Done</button>`, (el) => {
      el.addEventListener("click", (e) => {
        const b = e.target.closest(".toggle-row"); if (!b) return;
        const k = b.dataset.k;
        if (k[0] === "e") { const i = +k.slice(1); d.excl.has(i) ? d.excl.delete(i) : d.excl.add(i); b.setAttribute("aria-pressed", d.excl.has(i)); }
        else {
          const s = k.slice(2); d.stop = d.stop === s ? null : s;
          el.querySelectorAll('[data-k^="s-"]').forEach((n) => n.setAttribute("aria-pressed", n.dataset.k === "s-" + d.stop));
        }
        render();
      });
    });
  }

  function readDraftInputs() {
    const d = ui.draft; if (!d) return;
    const m = document.getElementById("f-mrn"), w = document.getElementById("f-ward"), t = document.getElementById("f-time");
    if (m) d.mrn = m.value.replace(/\D/g, "");
    if (w) d.ward = w.value.trim().toUpperCase();
    if (t && t.value) d.time = t.value;
  }

  function validDraft(d) {
    if (d.mrn.length !== 8) { toast("MRN should be 8 digits"); return false; }
    if (!d.ward) { toast("Add the ward"); return false; }
    return true;
  }
  function draftTime(d) {
    const [h, m] = d.time.split(":").map(Number);
    const t = new Date(); t.setHours(h, m, 0, 0);
    return t.getTime();
  }

  /* --- challenge (registered / record view) --- */
  function Challenge(id) {
    const r = byId(id);
    if (!r) return NotFound();
    const ends = r.givenAt + OBS_MIN * MIN;
    const isObs = r.status === "observing";
    const title = { observing: "Challenge registered", negative: "Negative — label removed", positive: "Reaction recorded", uncertain: "Flagged for review", stopped: "Stopped at screening" }[r.status];
    const checks = r.drug ? `<p class="section-label">Checks</p>
      <div class="kv">
        ${[15, 60].map((m) => `<button class="check-item" data-act="check" data-m="${m}" data-due="${r.givenAt + m * MIN}" aria-pressed="${!!r.checks?.[m]}" ${isObs ? "" : "disabled"}>
          <span class="k"><span class="tick">${ic("check")}</span>EWS at ${m} min</span><span class="v">${hm(r.givenAt + m * MIN)}</span></button>`).join("")}
      </div>` : "";
    const head = r.status === "stopped"
      ? `<div class="obs done" style="background:#f1eaea"><div><small>Reason</small><div style="font-size:24px">${STOP_REASONS[r.stopReason]}</div></div></div>`
      : `<div class="obs ${isObs ? "" : "done"}" ${r.status === "positive" ? 'style="background:var(--pink-pale)"' : ""}>
          <div><small>Observation ${isObs ? "ends" : "ended"}</small><div class="big">${hm(ends)}</div></div>
          <span data-left="${ends}">${isObs ? "" : pill(r, false)}</span></div>`;
    let actions = "";
    if (isObs) actions = `<div class="btn-pair"><button class="btn primary" data-act="negative">Negative</button><button class="btn secondary" data-act="reaction">Reaction</button></div>`;
    else if (r.status === "uncertain") actions = `<p class="muted" style="font-size:14px;margin:0 8px 10px">Consultant review: confirm the outcome.</p><div class="btn-pair"><button class="btn primary" data-act="resolve-neg">Confirm negative</button><button class="btn secondary" data-act="resolve-pos">Confirm reaction</button></div>`;
    else actions = `<a class="btn secondary" href="#/dashboard">Back to overview</a>`;
    return `<div class="screen">
      <div class="back-row"><a class="circle-btn" href="${isObs ? "#/" : "#/dashboard"}" aria-label="Close">${ic(isObs ? "x" : "left")}</a></div>
      <div class="check-badge">${ic(r.status === "positive" || r.status === "stopped" ? "alert" : r.status === "uncertain" ? "query" : "check")}</div>
      <h1 class="display">${title}</h1>
      ${head}
      <div class="kv">
        <div><span class="k">MRN</span><span class="v">${esc(fmtMrn(r.mrn))}</span></div>
        <div><span class="k">Ward</span><span class="v">${esc(r.ward)}</span></div>
        ${r.drug ? `<div><span class="k">Drug</span><span class="v">${DRUGS[r.drug].name} ${DRUGS[r.drug].dose}</span></div>
        <div><span class="k">Given at</span><span class="v">${isToday(r.givenAt) ? "" : dayLabel(r.givenAt) + ", "}${hm(r.givenAt)}</span></div>` : `<div><span class="k">Date</span><span class="v">${dayLabel(r.givenAt)}</span></div>`}
        <div><span class="k">Doctor</span><span class="v">${r.doctor === ME ? "You" : esc(r.doctor)}</span></div>
      </div>
      ${checks}
      ${isObs ? `<div class="warn">${ic("alert")}<span>Hypotension or breathing difficulty: treat as anaphylaxis and call 2222. Isolated rash: give an antihistamine.</span></div>` : ""}
      <div class="spacer"></div>
      ${actions}
    </div>`;
  }

  function tick() {
    const now = Date.now();
    document.querySelectorAll("[data-left]").forEach((el) => {
      if (el.querySelector(".pill")) return;
      const left = Math.ceil((+el.dataset.left - now) / MIN);
      el.textContent = left > 0 ? `${left} min left` : "Observation complete";
    });
    document.querySelectorAll(".check-item[data-due]").forEach((el) => {
      el.classList.toggle("due", el.getAttribute("aria-pressed") !== "true" && now >= +el.dataset.due);
    });
  }

  function reactionSheet(r) {
    sheet(`<h2>Record reaction</h2>
      <p class="sub">MRN ${esc(fmtMrn(r.mrn))} · ${drugName(r)}</p>
      <button class="option" data-rx="mild rash"><span class="ico">${ic("hand")}</span><span><b>Mild rash</b><small>Isolated rash — give an antihistamine</small></span></button>
      <button class="option" data-rx="anaphylaxis"><span class="ico">${ic("alert")}</span><span><b>Anaphylaxis</b><small>Hypotension or breathing difficulty — call 2222</small></span></button>
      <button class="option" data-rx="uncertain"><span class="ico">${ic("query")}</span><span><b>Uncertain</b><small>Flag for consultant review</small></span></button>
      <button class="btn secondary" data-close style="margin-top:8px">Cancel</button>`, (el) => {
      el.addEventListener("click", (e) => {
        const b = e.target.closest("[data-rx]"); if (!b) return;
        const rx = b.dataset.rx;
        if (rx === "uncertain") { r.status = "uncertain"; }
        else { r.status = "positive"; r.reaction = rx; }
        db.save(); closeSheet();
        toast(rx === "uncertain" ? "Flagged for consultant review" : "Reaction recorded — label stays, refer to immunology");
        render();
      });
    });
  }

  function markNegative(r) {
    r.status = "negative"; delete r.reaction; db.save();
    location.hash = `#/removed/${r.id}`;
  }

  /* --- label removed --- */
  function Removed(id) {
    const r = byId(id);
    const lb = leaderboard();
    const mine = r && r.doctor !== ME ? null : lb.mine;
    const colors = ["#c8263a", "#ef8a96", "#ffffff", "#8e1b2d"];
    const confetti = Array.from({ length: 12 }, (_, i) => {
      const w = i % 3 === 0 ? 22 : 14, h = i % 3 === 0 ? 8 : 14;
      return `<span class="confetti" style="left:${5 + ((i * 37) % 90)}%;top:${8 + ((i * 53) % 70)}%;width:${w}px;height:${h}px;background:${colors[i % 4]};transform:rotate(${i * 33}deg);animation-delay:${(i % 5) * 0.3}s"></span>`;
    }).join("");
    const scissors = `<svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">
      <path d="M40 30c14-10 30 4 46-6l10 12c-16 10-32-4-46 6z" fill="#e5302a" stroke="#1a0b0d" stroke-width="3" stroke-linejoin="round"/>
      <path d="M78 34l-6 50 9-6 7 10 2-52z" fill="#e5302a" stroke="#1a0b0d" stroke-width="3" stroke-linejoin="round"/>
      <path d="M44 74 98 46" stroke="#1a0b0d" stroke-width="7" stroke-linecap="round"/><path d="M44 74 98 46" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M50 88 92 34" stroke="#1a0b0d" stroke-width="7" stroke-linecap="round"/><path d="M50 88 92 34" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="34" cy="80" r="11" fill="#fff" stroke="#1a0b0d" stroke-width="3.5"/><circle cx="34" cy="80" r="5" fill="none" stroke="#1a0b0d" stroke-width="2.5"/>
      <circle cx="46" cy="98" r="11" fill="#fff" stroke="#1a0b0d" stroke-width="3.5"/><circle cx="46" cy="98" r="5" fill="none" stroke="#1a0b0d" stroke-width="2.5"/>
      <circle cx="66" cy="66" r="2.5" fill="#1a0b0d"/></svg>`;
    const sub = mine ? `Nice work. That's your ${ordinal(mine)} in the last 30 days.` : "Nice work. The allergy label can come off the chart.";
    return `<div class="screen">
      <section class="celebrate">
        ${confetti}
        <a class="circle-btn close" href="#/" aria-label="Close">${ic("x")}</a>
        <div class="medal">${scissors}</div>
        <h1 class="display">Label removed</h1>
        <p>${sub}</p>
      </section>
      <div class="stat-pair">
        <div><small>Your rank</small><div class="big">#${lb.myRank}</div></div>
        <div><small class="muted">De-labelled</small><div class="big">${lb.mine}</div></div>
      </div>
      <div class="row between" style="margin:24px 8px 10px"><b style="font-weight:500;font-size:17px">Leaderboard</b><span class="muted" style="font-size:14px">Last 30 days</span></div>
      <div class="board">
        ${lb.top.map(([rank, doc, n]) => `<div class="board-row ${doc === ME ? "me" : ""}"><span class="rank ${rank <= 3 ? "r" + rank : ""}">${rank}</span><span class="n">${doc === ME ? "You" : esc(doc)}</span><span>${n}</span></div>`).join("")}
      </div>
      <div class="study"><span class="ico">${ic("flask")}</span><div><b>You're part of the research study</b><p>Every challenge you log feeds the Mater de-labelling study. NCHDs taking part will be added as researchers.</p></div></div>
      <div style="height:16px"></div>
      <a class="btn primary" href="#/">Done</a>
    </div>`;
  }

  /* --- resources --- */
  const PROTOCOL = [
    { id: "s1", icon: "ban", title: "1. Exclusion criteria", lead: "Do not proceed if any apply.", list: EXCLUSIONS },
    { id: "s2", icon: "alert", title: "2. Anaphylaxis history", stop: true, body: ["History suggesting an immediate severe reaction to a penicillin: hypotension, collapse, breathing difficulty, wheeze or angioedema within hours of a dose.", "Do not challenge. Refer to immunology."] },
    { id: "s3", icon: "hand", title: "3. Type 4 hypersensitivity", stop: true, body: ["Severe delayed reaction: SJS/TEN, DRESS, AGEP, blistering or mucosal involvement, or organ involvement such as hepatitis or nephritis.", "Do not challenge. Refer to immunology."] },
    { id: "s4", icon: "query", title: "4. Uncertain history", stop: true, body: ["The history cannot be clarified from the patient, family, GP or records, or does not fit a low-risk pattern.", "Do not challenge. Refer to immunology for assessment."] },
    { id: "s5", icon: "pill", title: "5. OPC procedure", list: [
      "Confirm low-risk history and no exclusion criteria",
      "Obtain consent and give the patient information leaflet",
      "Run during the OPC window (Mon–Fri 8am–4pm) with medical cover on site",
      "Check anaphylaxis kit is available at the bedside",
      "Record baseline EWS",
      "Give a single oral dose: amoxicillin 500 mg PO or flucloxacillin 500 mg PO",
      "Register the challenge in De-label",
    ] },
    { id: "s6", icon: "activity", title: "6. Nursing monitoring", list: [
      "Observe the patient for 60 minutes after the dose",
      "EWS at 15 minutes and at 60 minutes",
      "Watch for rash, urticaria, swelling of lips or tongue, wheeze, breathlessness or dizziness",
      "Escalate any change to the doctor immediately",
    ] },
    { id: "s7", icon: "clipboard", title: "7. Interpreting results", list: [
      "Negative: no reaction at 60 minutes. Remove the allergy label from the chart and records. Give the PIL and send the GP letter (negative).",
      "Isolated rash: give an antihistamine. Record as positive, keep the label, send the GP letter (positive) and refer to immunology.",
      "Hypotension or breathing difficulty: treat as anaphylaxis and call 2222.",
      "Uncertain result: flag for consultant review in De-label.",
    ] },
  ];
  const DOCS = [
    { tab: "leaflets", icon: "file", title: "Patient information leaflet", meta: "PDF" },
    { tab: "leaflets", icon: "pencil", title: "Consent form", meta: "PDF" },
    { tab: "letters", icon: "mail", title: "PIL and GP letter: negative result", meta: "2 files", pale: true },
    { tab: "letters", icon: "mail", title: "PIL and GP letter: positive result", meta: "2 files", pale: true },
  ];

  function Resources() {
    const tab = ui.resTab;
    const acc = PROTOCOL.map((s, i) => {
      const open = ui.open.has(s.id);
      const body = s.list ? `${s.lead ? `<p class="lead">${s.lead}</p>` : ""}<ul>${s.list.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : s.body.map((p) => `<p>${esc(p)}</p>`).join("");
      return `<div class="acc-item ${open ? "open" : ""}">
        <button class="acc-head" data-act="acc" data-id="${s.id}" aria-expanded="${open}">
          <span class="ico">${ic(s.icon)}</span><span class="title">${s.title}</span>
          ${s.stop ? `<span class="stop-tag">Yes → stop</span>` : `<span class="chev">${ic("down")}</span>`}
        </button>
        <div class="acc-body">${body}</div></div>${i === 0 ? '</div><div class="acc">' : ""}`;
    }).join("");
    const docs = DOCS.filter((d) => tab === "protocol" || d.tab === tab);
    return `<div class="screen">
      <div class="back-row"><a class="circle-btn" href="#/" aria-label="Back">${ic("left")}</a><span class="version">Version 1 · review Jan 2029</span></div>
      <h1 class="display">Resources</h1>
      <p class="intro">MMUH penicillin allergy de-labelling guideline for in-patients, adapted from the SAPG guidelines 2021.</p>
      <div class="chips" role="tablist">
        ${[["protocol", "Protocol"], ["leaflets", "Leaflets"], ["letters", "Letters"]].map(([k, l]) => `<button class="chip" role="tab" data-act="tab" data-v="${k}" aria-selected="${tab === k}">${l}</button>`).join("")}
      </div>
      ${tab === "protocol" ? `<div class="acc">${acc}</div>` : ""}
      <p class="section-label">Documents</p>
      <div class="docs">
        ${docs.map((d) => `<button class="doc ${d.pale ? "pale" : ""}" data-act="doc"><span class="ico">${ic(d.icon)}</span><span><b>${d.title}</b><small>${d.meta}</small></span></button>`).join("")}
      </div>
      <button class="ana" data-act="anaphylaxis"><span class="ico">${ic("alert")}</span><span class="t">Recognition of anaphylaxis in adults</span>${ic("upright")}</button>
      <p class="fine">Drafted by the Penicillin Allergy De-labelling Working Group, chaired by Dr P. McGettrick. Approved by the Drugs and Therapeutics Committee. Effective from Jan 2026.</p>
    </div>`;
  }

  function anaphylaxisSheet() {
    sheet(`<h2>Recognition of anaphylaxis</h2>
      <p class="sub">Sudden onset and rapid progression of symptoms.</p>
      <div class="kv">
        <div><span class="k">Airway</span><span class="v">Swelling, hoarse voice, stridor</span></div>
        <div><span class="k">Breathing</span><span class="v">Breathless, wheeze, SpO₂ &lt; 92%</span></div>
        <div><span class="k">Circulation</span><span class="v">Pale, clammy, hypotension, collapse</span></div>
        <div><span class="k">Skin</span><span class="v">Urticaria, flushing — may be absent</span></div>
      </div>
      <div class="warn">${ic("alert")}<span><b>Call 2222.</b> Give IM adrenaline 500 micrograms (0.5 mL of 1 mg/mL) into the anterolateral thigh. Repeat after 5 minutes if no improvement.</span></div>
      <div style="height:12px"></div>
      <button class="btn primary" data-close>Close</button>`);
  }

  /* --- dashboard --- */
  function Dashboard() {
    const recs = inPeriod(ui.period);
    const s = stats(recs);
    const challenges = sortDesc(recs.filter((r) => r.status !== "stopped"));
    const queue = sortDesc(state.records.filter((r) => r.status === "uncertain"));
    const view = ui.recView;
    const rows = view === "queue" ? queue : view === "all" ? challenges : challenges.slice(0, 6);
    const title = view === "queue" ? "Review queue" : view === "all" ? "All challenges" : "Recent challenges";
    const toggle = view === "recent" ? `<button class="link" data-act="view" data-v="all">View all</button>` : `<button class="link" data-act="view" data-v="recent">Show recent</button>`;
    const seg = (n, cls) => (n ? `<div class="${cls}" style="flex-grow:${n}" title="${n}"></div>` : "");
    const when = (r) => (isToday(r.givenAt) ? hm(r.givenAt) : dayLabel(r.givenAt));
    return `<div class="screen wide">
      <div class="dash-brand"><a class="brand" href="#/">${logo}De-label</a><span class="who">· ${ME}, ${ME_ROLE}</span>
        <a class="circle-btn" href="#/" aria-label="Home" style="margin-left:auto">${ic("left")}</a></div>
      <div class="dash-head">
        <h1 class="display" style="font-size:clamp(36px,5vw,60px)">Challenges overview</h1>
        <div class="chips">${[["month", "Month"], ["year", "Year"], ["all", "All time"]].map(([k, l]) => `<button class="chip" data-act="period" data-v="${k}" aria-pressed="${ui.period === k}">${l}</button>`).join("")}</div>
      </div>
      <div class="kpis">
        <div class="kpi pink hero"><div class="head"><span class="ico">${ic("square")}</span>De-labelled</div><div class="big">${s.pct}%</div><small>${s.negative} of ${s.run} <span class="long">challenges </span>negative</small></div>
        <div class="kpi"><div class="head"><span class="ico">${ic("pill")}</span><span class="long">Challenges run</span><span class="short">Run</span></div><div class="big">${s.run}</div><small class="long">${s.observing} in observation now</small></div>
        <div class="kpi red"><div class="head"><span class="ico">${ic("alert")}</span>Reactions${s.ana ? `<span class="tag">${s.ana} severe</span>` : ""}</div><div class="big">${s.positive}</div><small class="long">${s.mild} mild rash · ${s.ana} anaphylaxis</small></div>
        <div class="kpi"><div class="head"><span class="ico">${ic("ban")}</span><span class="long">Stopped at screening</span><span class="short">Stopped</span></div><div class="big">${s.stopped}</div><small class="long">Referred to immunology</small></div>
      </div>
      <div class="panel outcomes">
        <div class="row between" style="flex-wrap:wrap"><h3>Outcomes</h3>
          <div class="legend"><span><i class="c-neg"></i>Negative ${s.negative}</span><span><i class="c-pos"></i>Positive ${s.positive}</span>${s.uncertain ? `<span><i class="c-unc"></i>Uncertain ${s.uncertain}</span>` : ""}<span><i class="c-obs"></i>Observing ${s.observing}</span></div></div>
        <div class="bar">${seg(s.negative, "c-neg")}${seg(s.positive, "c-pos")}${seg(s.uncertain, "c-unc")}${seg(s.observing, "c-obs")}</div>
      </div>
      ${queue.length ? `<button class="review-row" data-act="view" data-v="queue"><span class="ico">${ic("bell")}</span><span class="t"><b>Needs your review</b><small>${queue.length} uncertain result${queue.length > 1 ? "s" : ""}</small></span>${ic("right")}</button>` : ""}
      <div class="dash-grid">
        <div class="panel">
          <div class="row between"><h3>${title}</h3>${toggle}</div>
          ${rows.length ? `<table class="rec"><thead><tr><th>MRN</th><th>Ward</th><th>Drug</th><th>Date</th><th>Doctor</th><th>Result</th></tr></thead><tbody>
            ${rows.map((r) => `<tr data-href="#/challenge/${r.id}" tabindex="0"><td>${esc(fmtMrn(r.mrn))}</td><td>${esc(r.ward)}</td><td>${drugName(r)}</td><td>${dayLabel(r.givenAt)}, ${hm(r.givenAt)}</td><td>${r.doctor === ME ? "You" : esc(r.doctor)}</td><td>${pill(r, false)}</td></tr>`).join("")}
          </tbody></table>
          <div class="rec-list">${rows.map((r) => `<a class="item" href="#/challenge/${r.id}"><span>${esc(fmtMrn(r.mrn))}<small>${esc(r.ward)} · ${drugName(r)} · ${when(r)}</small></span>${pill(r, true)}</a>`).join("")}</div>`
          : `<p class="muted" style="margin:16px 0 0">${view === "queue" ? "Nothing waiting for review." : "No challenges in this period."}</p>`}
        </div>
        <div class="side">
          <div class="panel"><h3 style="margin-bottom:14px">Stop reasons</h3>
            <div class="stop-list">${Object.entries(STOP_REASONS).map(([k, l]) => `<div><span>${l}</span><span class="n">${s.stop[k]}</span></div>`).join("")}</div></div>
          ${queue.length ? `<div class="review"><div class="row"><span class="ico">${ic("bell")}</span><h3>Needs your review</h3></div>
            <p>${queue.length} uncertain result${queue.length > 1 ? "s" : ""} flagged by ward teams.</p>
            <button class="go" data-act="view" data-v="queue">Open queue</button></div>` : ""}
        </div>
      </div>
      <p class="fine" style="margin-top:24px">Sample data for illustration. No patient names are stored; records are keyed by MRN and kept only in this browser.
        <button class="link" data-act="reset" style="font-size:12px">Reset sample data</button></p>
    </div>`;
  }

  function NotFound() {
    return `<div class="screen"><div class="back-row"><a class="circle-btn" href="#/" aria-label="Back">${ic("left")}</a></div>
      <h1 class="display">Not found</h1><p class="muted">That record isn't in this browser.</p></div>`;
  }

  /* ---------- router ---------- */
  function route() {
    const parts = (location.hash.replace(/^#\/?/, "") || "").split("/");
    switch (parts[0]) {
      case "": return Home();
      case "register": return Register();
      case "challenge": return Challenge(parts[1]);
      case "removed": return Removed(parts[1]);
      case "resources": return Resources();
      case "dashboard": return Dashboard();
      default: return NotFound();
    }
  }
  function render() { $app.innerHTML = route(); tick(); }

  let lastPath = location.hash;
  window.addEventListener("hashchange", () => {
    closeSheet();
    if (!location.hash.startsWith("#/register")) ui.draft = null;
    if (!location.hash.startsWith("#/dashboard")) ui.recView = "recent";
    render();
    if (location.hash !== lastPath) window.scrollTo(0, 0);
    lastPath = location.hash;
  });

  /* ---------- events ---------- */
  $app.addEventListener("input", (e) => {
    if (e.target.id === "f-mrn") {
      const pos = e.target.value.length;
      e.target.value = fmtMrn(e.target.value);
      if (pos === e.target.value.length) e.target.setSelectionRange(pos, pos);
    }
    readDraftInputs();
  });

  $app.addEventListener("keydown", (e) => {
    const tr = e.target.closest("tr[data-href]");
    if (tr && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); location.hash = tr.dataset.href; }
  });

  $app.addEventListener("click", (e) => {
    const tr = e.target.closest("tr[data-href]");
    if (tr) { location.hash = tr.dataset.href; return; }
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const act = b.dataset.act;
    const id = location.hash.split("/")[2];
    const r = id && byId(id);

    switch (act) {
      case "drug": readDraftInputs(); ui.draft.drug = b.dataset.v; render(); break;
      case "eligibility": readDraftInputs(); openEligibility(); break;
      case "start": {
        readDraftInputs();
        const d = ui.draft;
        if (!eligibility(d).ok || !validDraft(d)) break;
        const givenAt = draftTime(d);
        if (givenAt > Date.now() + 5 * MIN) { toast("Time given can't be in the future"); break; }
        const rec = { id: uid(), mrn: d.mrn, ward: d.ward, drug: d.drug, givenAt, doctor: ME, status: "observing", checks: { 15: false, 60: false } };
        state.records.push(rec); db.save();
        location.hash = `#/challenge/${rec.id}`;
        break;
      }
      case "record-stop": {
        readDraftInputs();
        const d = ui.draft;
        if (!validDraft(d)) break;
        state.records.push({ id: uid(), mrn: d.mrn, ward: d.ward, drug: null, givenAt: Date.now(), doctor: ME, status: "stopped", stopReason: d.stop });
        db.save(); toast("Stop recorded — refer to immunology");
        location.hash = "#/";
        break;
      }
      case "check":
        r.checks = r.checks || {};
        r.checks[b.dataset.m] = !r.checks[b.dataset.m];
        db.save(); b.setAttribute("aria-pressed", !!r.checks[b.dataset.m]); tick();
        break;
      case "negative": {
        const left = Math.ceil((r.givenAt + OBS_MIN * MIN - Date.now()) / MIN);
        if (left > 0 || !r.checks?.[60]) {
          sheet(`<h2>Record negative?</h2>
            <p class="sub">${left > 0 ? `Observation has ${left} min left.` : "The 60 min EWS isn't ticked yet."} Only record a negative once the patient has completed 60 minutes without a reaction.</p>
            <button class="btn primary" id="confirm-neg">Record negative anyway</button><div style="height:8px"></div>
            <button class="btn secondary" data-close>Keep observing</button>`, (el) => el.querySelector("#confirm-neg").addEventListener("click", () => { closeSheet(); markNegative(r); }));
        } else markNegative(r);
        break;
      }
      case "reaction": reactionSheet(r); break;
      case "resolve-neg": markNegative(r); break;
      case "resolve-pos": reactionSheet(r); break;
      case "tab": ui.resTab = b.dataset.v; render(); break;
      case "acc": { const k = b.dataset.id; ui.open.has(k) ? ui.open.delete(k) : ui.open.add(k); render(); break; }
      case "doc": toast("Document not attached in this prototype"); break;
      case "anaphylaxis": anaphylaxisSheet(); break;
      case "period": ui.period = b.dataset.v; render(); break;
      case "view": ui.recView = b.dataset.v; render(); if (b.dataset.v === "queue") document.querySelector(".dash-grid")?.scrollIntoView({ behavior: "smooth", block: "start" }); break;
      case "reset": state = { records: seed() }; db.save(); toast("Sample data reset"); render(); break;
    }
  });

  setInterval(tick, 10000);
  render();
})();
