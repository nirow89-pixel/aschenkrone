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
// Block 4 (21.10., Nico Antwort 6): jedes Plus/Minus sichtbar mit Zahl (außer Gegenstände), auch ohne Debug.
// Eine Anzeige für alle Arten: stat (Stufe), uebung (Übungspunkte), ruf, bond (Beziehung „Name +1“), korr, gold, wert (frei beschriftet).
const DELTA_MAX = 6;             // gleichzeitig sichtbare Einblendungen (vorher 3)
function deltaZahl(sum) { const n = Math.abs(Math.round(sum * 10) / 10); return (sum > 0 ? "+" : "−") + String(n).replace(".", ","); }
function deltaText(ev, sum) {
  const z = deltaZahl(sum);
  const statName = (k) => (D.STAT_KEYS.find((x) => x.id === k) || {}).name || k;
  if (ev.kind === "korr") return z + " Korruption";
  if (ev.kind === "stat") return z + " " + statName(ev.key);
  if (ev.kind === "uebung") return z + " Übung " + statName(ev.key);
  if (ev.kind === "gold") return z + " Gold";
  if (ev.kind === "ruf") { const f = (D.FACTIONS[ev.key] || {}).name || ev.key; return z + " " + f + (ev.rang ? " – " + ev.rang : ""); }
  if (ev.kind === "wert") return z + " " + (ev.label || ev.key);
  if (ev.kind === "bond") { const p = (D.NPCs[ev.key] || {}).name || ev.key; return p + " " + z + (ev.rang ? " – " + ev.rang : ""); }
  return z;
}
function deltaStack() {
  let s = document.getElementById("delta-stack");
  if (!s) { s = document.createElement("div"); s.id = "delta-stack"; s.setAttribute("aria-live", "polite"); document.body.appendChild(s); }
  return s;
}
onDelta((ev) => {
  // Block 4: Beziehung immer zeigen (Name und Zahl), nicht erst ab „bekannt“.
  const id = ev.kind + ":" + ev.key, now = Date.now();
  let m = deltaLive[id];
  if (m && now - m.t < 1500) { m.sum += ev.delta; if (ev.rang) m.rang = ev.rang; }
  else {
    const stack = deltaStack();
    while (stack.children.length >= DELTA_MAX) { const old = stack.firstChild; Object.keys(deltaLive).forEach((k) => { if (deltaLive[k].el === old) delete deltaLive[k]; }); old.remove(); }
    m = deltaLive[id] = { el: document.createElement("div"), sum: ev.delta, rang: ev.rang, t: now };
    stack.appendChild(m.el);
  }
  m.t = now;
  if (Math.abs(m.sum) < 0.05) { m.el.remove(); delete deltaLive[id]; return; }
  m.el.className = "delta delta--" + ev.kind + " " + (m.sum > 0 ? "delta--pos" : "delta--neg");
  m.el.textContent = deltaText(Object.assign({}, ev, { rang: m.rang }), m.sum);
  clearTimeout(m.timer);
  const el = m.el;
  m.timer = setTimeout(() => { el.classList.add("delta--out"); setTimeout(() => { el.remove(); if (deltaLive[id] && deltaLive[id].el === el) delete deltaLive[id]; }, 400); }, 2500);
});
