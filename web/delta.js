// +1-Anzeige (lehrer-stufen.md Rev. c §6): ein einheitliches emitDelta(), schreibt nie in den Spielstand.
// Ereignis: { kind: "stat"|"ruf"|"bond"|"korr", key, delta, source?, npc?, value?, rang? }
const DELTA_LISTENERS = [];
const DELTA_QUEUE = [];          // flüchtig, nur zur Prüfung/Fehlersuche
let deltaMute = 0;               // >0: passive Änderungen (Tageswechsel) nicht melden
function onDelta(fn) { DELTA_LISTENERS.push(fn); }
function emitDelta(ev) {
  if (!ev || !ev.delta || deltaMute > 0 || !DELTA_LISTENERS.length) return;
  const sh = document.getElementById("shell");
  if (!sh || !sh.classList.contains("on")) return;
  DELTA_QUEUE.push(ev); if (DELTA_QUEUE.length > 20) DELTA_QUEUE.shift();
  DELTA_LISTENERS.forEach((fn) => { try { fn(ev); } catch (e) { console.warn(e); } });
}
// Passiver Verfall beim Zeitvorrücken wird nicht angezeigt (nur eigene Handlungen).
if (typeof advance === "function") {
  const advanceOrig = advance;
  advance = function () { deltaMute++; try { return advanceOrig.apply(this, arguments); } finally { deltaMute--; } };
}
const KORR_HINT = { up: "Asche setzt sich in dir fest.", down: "Ein Rest Asche fällt von dir ab." };  // Platzhalter für Ext Text
const deltaDbg = typeof DEBUG !== "undefined" && DEBUG;
const deltaLive = {};            // kind:key -> { el, sum, t, timer }
function deltaText(ev, sum) {
  const sg = sum > 0 ? "+" : "−", n = Math.abs(Math.round(sum * 10) / 10);
  if (ev.kind === "korr") return deltaDbg ? "Korruption " + sg + n : (sum > 0 ? KORR_HINT.up : KORR_HINT.down);
  if (ev.kind === "stat") { const s = (D.STAT_KEYS.find((k) => k.id === ev.key) || {}).name || ev.key; return sg + n + " " + s; }
  if (ev.kind === "ruf") { const f = (D.FACTIONS[ev.key] || {}).name || ev.key; return (deltaDbg ? sg + n : sg) + " " + f + (ev.rang ? " – " + ev.rang : ""); }
  if (ev.kind === "wert") { const n = Math.round(Math.abs(ev.delta)); return (ev.delta > 0 ? "+" : "−") + n + " " + (ev.label || ev.key); }
  if (ev.kind === "bond") { const p = (D.NPCs[ev.key] || {}).name || ev.key; return p + " " + (deltaDbg ? sg + n : sg) + (ev.rang ? " – " + ev.rang : ""); }
  return sg + n;
}
function deltaStack() {
  let s = document.getElementById("delta-stack");
  if (!s) { s = document.createElement("div"); s.id = "delta-stack"; s.setAttribute("aria-live", "polite"); document.body.appendChild(s); }
  return s;
}
onDelta((ev) => {
  // Bindung erst ab „bekannt“ (≥ 8) zeigen, außer im Debug.
  if (ev.kind === "bond" && !deltaDbg && (ev.value || 0) < 8) return;
  const id = ev.kind + ":" + ev.key, now = Date.now();
  let m = deltaLive[id];
  if (m && now - m.t < 1500) { m.sum += ev.delta; if (ev.rang) m.rang = ev.rang; }
  else {
    const stack = deltaStack();
    while (stack.children.length >= 3) { const old = stack.firstChild; Object.keys(deltaLive).forEach((k) => { if (deltaLive[k].el === old) delete deltaLive[k]; }); old.remove(); }
    m = deltaLive[id] = { el: document.createElement("div"), sum: ev.delta, rang: ev.rang, t: now };
    stack.appendChild(m.el);
  }
  m.t = now;
  if (Math.abs(m.sum) < 0.05) { m.el.remove(); delete deltaLive[id]; return; }
  m.el.className = "delta " + (ev.kind === "korr" && !deltaDbg ? "delta--hint" : m.sum > 0 ? "delta--pos" : "delta--neg");
  m.el.textContent = deltaText(Object.assign({}, ev, { rang: m.rang }), m.sum);
  clearTimeout(m.timer);
  const el = m.el;
  m.timer = setTimeout(() => { el.classList.add("delta--out"); setTimeout(() => { el.remove(); if (deltaLive[id] && deltaLive[id].el === el) delete deltaLive[id]; }, 400); }, 2500);
});
