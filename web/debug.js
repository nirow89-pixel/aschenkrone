// Debug-Testoptionen (Optionen-Fenster). Gespeichert in localStorage „aschenkrone-debug“, NICHT im Spielstand.
// ?debug=1 bleibt unabhängig davon wirksam.
const DEBUG_KEY = "aschenkrone-debug";
const DEBUG_OPTS = [
  { id: "gold", label: "Gold: Knopf „+100 Gold“ (neues Spiel startet mit +500 wie ?debug=1)" },
  { id: "grad", label: "Grad-Aufstieg: Knopf „+1 Grad“ über dem Beutel" },
  { id: "tag", label: "Zeit: Knopf „+1 Tag“" },
  { id: "stufe", label: "Stufenaufstieg: Knopf „+1 Stufe“ (Grundwert steigt, Grad wie im Spiel)" },
  { id: "stadt", label: "Reise: Knopf „Nach Aschenstadt“ (Platz)" }
];
// +1 Stufe auf den niedrigsten Grundwert unter 20; Grad und Gradfenster entstehen wie im Spiel (trackPeak).
function debugStufe() {
  if (!state || !D.GRUNDWERTE) return false;
  const k = D.GRUNDWERTE.filter((x) => (state.hero[x] || 0) < D.STUFE_MAX).sort((a, b) => (state.hero[a] || 0) - (state.hero[b] || 0))[0];
  if (!k) return false;
  state.hero[k] = (state.hero[k] || 0) + 1;
  if (state.statXp && state.statXp[k] && typeof stufeNeed === "function") state.statXp[k] = { xp: 0, need: stufeNeed(state.hero[k] + 1) };
  log((D.STAT_KEYS.find((s) => s.id === k) || {}).name + " steigt auf Stufe " + state.hero[k] + ". (Debug)");
  trackPeak(); persist(); render();
  return true;
}
// Sprung zum Hauptort von Aschenstadt (REGIONS.stadt.hub), ohne Zeit und Ereignisse.
function debugStadt() {
  if (!state) return false;
  const hub = D.REGIONS.stadt && D.REGIONS.stadt.hub; if (!hub || !D.LOCATIONS[hub]) return false;
  state.dialogue = null; state.trading = false; state.narrator = null; lastTalk = null;
  if (typeof clearInteractionView === "function") clearInteractionView();
  state.location = hub; log("Ihr seid in " + D.LOCATIONS[hub].name + ". (Debug)");
  persist(); render();
  return true;
}
function debugOpts() { try { return JSON.parse(localStorage.getItem(DEBUG_KEY)) || {}; } catch { return {}; } }
function debugOpt(id) { return !!debugOpts()[id]; }
function setDebugOpt(id, on) { const o = debugOpts(); o[id] = !!on; localStorage.setItem(DEBUG_KEY, JSON.stringify(o)); paintDebugActs(); }
// Regulärer Grad-Aufstieg (wie trackPeak): +4 Leben, Wahl Richtung/Perk über g.pending.
function debugGradUp() {
  if (!state || !state.grad) return false;
  const max = D.GRAD_STUFEN[D.GRAD_STUFEN.length - 1].grad;
  if ((state.hero.level || 1) >= max) return false;
  const g = state.grad;
  state.hero.level = (state.hero.level || 1) + 1; state.hero.hpMax += 4; state.hero.hp = Math.min(maxHp(), state.hero.hp + 4);
  if (state.hero.level === 4 || state.hero.level === 7) state.hero.apMax = (state.hero.apMax || 2) + 1;
  if (!g.pending) g.pending = { grad: state.hero.level, offers: gradOffers() };
  else g.nachhol = (g.nachhol || 0) + 1;
  log("Grad steigt auf " + state.hero.level + " (" + gradName(state.hero.level) + ").");
  persist(); render();
  return true;
}
const DEBUG_ACTS = {
  gold: { label: "+100 Gold", run: () => { state.hero.gold += 100; persist(); render(); } },
  grad: { label: "+1 Grad", run: debugGradUp },
  tag: { label: "+1 Tag", run: () => { advance(D.DAY_PHASES.length); persist(); render(); } },
  stufe: { label: "+1 Stufe", run: debugStufe },
  stadt: { label: "Nach Aschenstadt", run: debugStadt }
};
function paintDebugActs() {
  const acts = document.querySelector("#pane-hero .hero-acts");
  if (!acts) return;
  let box = document.getElementById("dbg-acts");
  if (!box) { box = document.createElement("div"); box.id = "dbg-acts"; acts.parentNode.insertBefore(box, acts); }
  const on = Object.keys(DEBUG_ACTS).filter(debugOpt);
  box.hidden = !on.length;
  box.innerHTML = "";
  on.forEach((id) => {
    const b = document.createElement("button"); b.className = "dbg-act"; b.dataset.dbg = id; b.textContent = DEBUG_ACTS[id].label;
    b.onclick = () => { if (state && !state.inCombat) DEBUG_ACTS[id].run(); };
    box.appendChild(b);
  });
}
function debugSection() {
  const d = document.createElement("div");
  d.className = "dbg-sec";
  d.innerHTML = '<div class="opt-h">Debug</div><p class="tiny">Testoptionen, nur in diesem Browser gespeichert, nicht im Spielstand.</p>' +
    DEBUG_OPTS.map((o) => '<label class="dbg-opt"><input type="checkbox" data-opt="' + o.id + '"' + (debugOpt(o.id) ? " checked" : "") + "> " + o.label + "</label>").join("");
  d.querySelectorAll("input[data-opt]").forEach((c) => { c.onchange = () => setDebugOpt(c.dataset.opt, c.checked); });
  return d;
}
// Startbildschirm: Abschnitt im Optionen-Menü
(() => {
  const menu = document.getElementById("options-menu"), back = document.getElementById("btn-back-options");
  if (!menu || !back) return;
  const btn = document.getElementById("btn-options");
  const orig = btn.onclick;
  btn.onclick = () => { orig(); const old = menu.querySelector(".dbg-sec"); if (old) old.remove(); menu.insertBefore(debugSection(), back); };
})();
// Im Spiel (⚙): Eintrag „Optionen“ öffnet dasselbe Optionen-Fenster
if (typeof paintOptions === "function") {
  const paintOptionsOrig = paintOptions;
  paintOptions = function (note) {
    paintOptionsOrig(note);
    const foot = document.querySelector("#overlay-body .opt-foot");
    if (!foot || document.getElementById("opt-options")) return;
    const b = document.createElement("button"); b.id = "opt-options"; b.className = "menu-btn"; b.textContent = "Optionen";
    b.onclick = () => {
      const body = document.getElementById("overlay-body");
      body.innerHTML = '<p class="menu-note">Einstellungen folgen.</p>';
      body.appendChild(debugSection());
      const f = document.createElement("div"); f.className = "opt-foot"; f.innerHTML = '<button id="opt-back" class="menu-btn">Zurück</button>';
      body.appendChild(f); document.getElementById("opt-back").onclick = () => paintOptions();
    };
    foot.insertBefore(b, foot.firstChild);
  };
}
if (typeof render === "function") { const renderOrig = render; render = function () { const r = renderOrig.apply(this, arguments); paintDebugActs(); return r; }; }
paintDebugActs();
