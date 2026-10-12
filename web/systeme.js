// Aschenkrone · Systeme aus den Konzepten (werte, beziehungen, fraktionen-ruf, grad-zeichen-kampf, male-fluche-segen).
// Wächst neben app.js: app.js ruft hier nur an wenigen Haken (Migration, gain, Tageswechsel, Gespräch, Kampf, Werte-Fenster).
// Rohzahlen erscheinen in der Oberfläche nur mit ?debug=1 (Entscheid Leitung).

// =====================================================================
// Stufe a · Werte: Wille, Willenskraft, Korruption, Haltung, Tagesaktionen (werte.md Rev. 9)
// =====================================================================
const KORR_TIERS = [
  { min: 0, id: "k0", name: "Unberührt" }, { min: 5, id: "k1", name: "Angekratzt" }, { min: 12, id: "k2", name: "Nachgiebig" },
  { min: 20, id: "k3", name: "Berechnend" }, { min: 30, id: "k4", name: "Verstrickt" }, { min: 40, id: "k5", name: "Abgebrüht" },
  { min: 52, id: "k6", name: "Skrupellos" }, { min: 64, id: "k7", name: "Verdorben" }, { min: 76, id: "k8", name: "Zerfressen" },
  { min: 88, id: "k9", name: "Ascheherz" }
];
const KORR_TEXT = {
  k0: "Nichts an euch hat sich gebogen.", k1: "Ein Kratzer, den nur ihr kennt.", k2: "Ihr gebt nach, wenn es sich lohnt.",
  k3: "Ihr rechnet, bevor ihr helft.", k4: "Eure Wege kreuzen sich mit fremden Schulden.", k5: "Was andere erschreckt, lässt euch kalt.",
  k6: "Ihr nehmt, was ihr braucht. Die Glocke schweigt euch gegenüber.", k7: "Etwas in euch ist faul geworden.",
  k8: "Die Asche frisst sich durch.", k9: "Wo ein Herz war, liegt Asche."
};
const HALT_TIERS = [
  { min: -50, id: "h_unterwuerfig", name: "Unterwürfig" }, { min: -35, id: "h_dienend", name: "Dienend" },
  { min: -15, id: "h_nachgebend", name: "Nachgebend" }, { min: -5, id: "h_ausgeglichen", name: "Ausgeglichen" },
  { min: 6, id: "h_bestimmt", name: "Bestimmt" }, { min: 16, id: "h_gebietend", name: "Gebietend" }, { min: 36, id: "h_herrisch", name: "Herrisch" }
];
const WILL_TIERS = [
  [1, "Brüchig"], [3, "Schwankend"], [5, "Gefasst"], [7, "Standhaft"], [9, "Beharrlich"], [11, "Gefestigt"],
  [13, "Unbeugsam"], [15, "Eisern"], [17, "Unerschütterlich"], [19, "Aschefest"]
];
const STAT_CAP_WILL = 18;
const KORR_RATE = { soft: 1, medium: 2, hard: 4 };

function tierOf(list, v) { let t = list[0]; for (const x of list) if (v >= x.min) t = x; return t; }
function korrTier(v) { return tierOf(KORR_TIERS, v === undefined ? state.values.korr : v); }
function korrTierIdx(v) { return KORR_TIERS.indexOf(korrTier(v)); }
function haltungTier(v) { return tierOf(HALT_TIERS, v === undefined ? state.values.haltung : v); }
function willTierName(v) { let n = WILL_TIERS[0][1]; for (const [m, name] of WILL_TIERS) if (v >= m) n = name; return n; }
function titel() { const h = haltungTier(), k = korrTier(); return (h.id === "h_ausgeglichen" ? "" : h.name + " · ") + k.name; }
// Perk-Anteile (Stufe e liefert perkMod); vorher 0.
function perkStat(k) { return typeof perkMod === "function" ? perkMod(k) : 0; }
function buffStat(k) { return (state && Array.isArray(state.buffs) ? state.buffs : []).reduce((s, b) => s + ((b.mods && b.mods[k]) || 0), 0); }
function willEff() {
  if (!state) return 0;
  return Math.min(STAT_CAP_WILL, (state.hero.will || 0) + Math.min(3, perkStat("will"))) + Math.min(3, gearBonus("will"));
}
function statStart(k) { return (state.grad && state.grad.statStart && typeof state.grad.statStart[k] === "number") ? state.grad.statStart[k] : (state.hero[k] || 0); }
function statCap(k) { if (k === "will") return STAT_CAP_WILL; if (k === "atk" || k === "def") return statStart(k) + 14; return Infinity; }
function atkEff() { return Math.min(statCap("atk"), state.hero.atk || 0) + Math.min(3, perkStat("atk")) + buffStat("atk"); }
function defEff() { return Math.min(statCap("def"), state.hero.def || 0) + Math.min(3, perkStat("def")) + buffStat("def"); }
function korrMalus() { const i = korrTierIdx(); return i <= 2 ? 0 : (i - 2) * 2; }
function wkMax() { return clamp(40 + 3 * willEff() - korrMalus(), 30, 100); }
function wkRegenPct() {
  const f9 = typeof perkMod === "function" ? perkMod("regenPct") : 0;  // negativ (Aschefieber)
  return Math.min(30 + f9, korrTierIdx() >= 6 ? 25 : 30);
}
function bumpWk(d) { const v = state.values; v.wk = clamp((v.wk || 0) + d, 0, wkMax()); syncValueFlags(); }
function freshValues(day) {
  return { korr: 0, korrPeak: 0, haltung: 0, wk: 0, buss: 0, bussHeute: 0, korrHeute: 0, haltHeute: 0, lastHaltDelta: day,
    confessions: [], lastConfession: null, lastRufConfession: null, tempelRuheBis: 0, lastTrain: { atk: day, def: day, will: day }, resist: {} };
}
function freshDaily(day) { return { day, work: false, train: false, pray: false, study: false, tavern: false, redDoor: false, rest: false }; }
function initValues(s) {
  if (!s.values || typeof s.values !== "object") s.values = freshValues(s.day || 1);
  const f = freshValues(s.day || 1);
  Object.keys(f).forEach((k) => { if (s.values[k] === undefined) s.values[k] = f[k]; });
  if (!s.daily || typeof s.daily !== "object") s.daily = freshDaily(s.day || 1);
  if (!Array.isArray(s.buffs)) s.buffs = [];
}
// Korruption buchen. opts.grad = soft|medium|hard (Deckel +6, Hard bis +8), opts.tag = Choice-Tag (für Tempel-Wissen).
function bumpKorr(d, opts) {
  const v = state.values; opts = opts || {};
  if (!d) return 0;
  if (d > 0) {
    const cap = (opts.grad === "hard" ? 8 : 6) - (v.korrHeute || 0);
    d = Math.max(0, Math.min(d, cap));
    if (!d) return 0;
    v.korr = clamp(v.korr + d, 0, 100); v.korrHeute = (v.korrHeute || 0) + d; v.bussHeute = (v.bussHeute || 0) + d;
    v.korrPeak = Math.max(v.korrPeak || 0, v.korr);
    if (opts.tag && typeof tempelZeuge === "function") tempelZeuge(opts.tag);
  } else {
    const floor = Math.max(0, (v.korrPeak || 0) - 20);
    const before = v.korr; v.korr = Math.max(floor, v.korr + d); d = v.korr - before;
  }
  syncValueFlags();
  return d;
}
function bumpHaltung(d) {
  const v = state.values;
  if (!d) return 0;
  const used = v.haltHeute || 0;  // Tagesdeckel ±5 (Summe in eine Richtung)
  const room = d > 0 ? 5 - Math.max(0, used) : -5 - Math.min(0, used);
  d = d > 0 ? Math.min(d, Math.max(0, room)) : Math.max(d, Math.min(0, room));
  if (!d) return 0;
  v.haltung = clamp(v.haltung + d, -50, 50); v.haltHeute = used + d; v.lastHaltDelta = state.day;
  syncValueFlags();
  return d;
}
// Choice-Effekt-Shape aus werte §8.3: { korr, haltung, wkCost, willXp } + grad, richtung, origin, temptKey
function applyChoiceEffects(e) {
  if (!e) return;
  const fx = e.effects || {};
  if (e.richtung === "resist") {
    const cost = fx.wkCost !== undefined ? fx.wkCost : ({ soft: 3, medium: 6, hard: 12 }[e.grad] || 0);
    const v = state.values;
    const tired = v.wk < cost;
    if (tired && e.grad !== "soft") return false;  // Medium/Hard bei Erschöpfung nicht widerstehbar
    v.wk = Math.max(0, v.wk - cost);
    if (!tired && (e.origin === "npc" || e.origin === "event")) {
      const base = fx.willXp !== undefined ? fx.willXp : ({ soft: 1, medium: 2, hard: 4 }[e.grad] || 0);
      const key = e.temptKey || "x"; const hist = (v.resist[key] || []).filter((d) => d >= state.day - 6);
      const factor = hist.length === 0 ? 1 : hist.length === 1 ? 0.5 : 0;
      hist.push(state.day); v.resist[key] = hist;
      const room = Math.max(0, 4 - (state.daily.resistXp || 0));
      const xp = Math.min(room, Math.floor(base * factor));
      if (xp > 0) { state.daily.resistXp = (state.daily.resistXp || 0) + xp; gain("will", xp); }
    }
  } else {
    let k = fx.korr !== undefined ? fx.korr : (KORR_RATE[e.grad] || 0);
    const tired = state.values.wk < ({ soft: 3, medium: 6, hard: 12 }[e.grad] || 0);
    if (tired && (e.origin === "npc" || e.origin === "event") && k > 0) k = { soft: 1, medium: 1, hard: 3 }[e.grad] || k;  // überrumpelt: immer mind. +1
    if (k) bumpKorr(k, { grad: e.grad, tag: e.tag });
    if (fx.haltung) bumpHaltung(fx.haltung);
  }
  syncValueFlags();
  return true;
}
function syncValueFlags() {
  if (!state || !state.values) return;
  const f = state.flags, v = state.values, ki = korrTierIdx();
  for (let i = 1; i <= 9; i++) f["korr_ab_k" + i] = ki >= i;
  f.korr_peak_ueber_k4 = (v.korrPeak || 0) >= 40;
  const ht = haltungTier().id; HALT_TIERS.forEach((t) => { f["haltung_" + t.id] = t.id === ht; });
  const we = willEff(); for (let n = 4; n <= 18; n += 2) f["wille_ab_" + n] = we >= n;
  f.wk_erschoepft = (v.wk || 0) <= 0;
}
// Beichte: wer hört sie? Eld, sonst Ilwe (vorläufige Stellvertretung), sonst niemand.
function npcGone(id) { return !!(state.npcEnd && state.npcEnd[id]) || !!(state.relations && state.relations[id] && (state.relations[id].betrayed || (state.relations[id].status || []).includes("erpresst"))); }
function confessor() {
  if (!npcGone("priester")) return "eld";
  const endTag = state.npcEnd && state.npcEnd.priester && state.npcEndDay && state.npcEndDay.priester;
  if (endTag && state.day - endTag < 5) return null;  // Lücke bis die Stellvertretung nachrückt
  if (!npcGone("ilwe")) return "ilwe";
  return null;
}
function confessionPreview() {
  const v = state.values, who = confessor();
  const max = who === "ilwe" ? 1 : 2;
  const base = Math.min(max, Math.floor((v.buss || 0) / 2));
  const recent = (v.confessions || []).filter((d) => d >= state.day - 6).length;
  const faktor = recent === 0 ? 1 : recent === 1 ? 0.5 : 0.25;
  const floor = Math.max(0, (v.korrPeak || 0) - 20);
  const room = Math.max(0, v.korr - floor);
  const abbau = Math.min(room, Math.floor(base * faktor));
  let reason = "";
  if (room <= 0 && v.korr > 0) reason = "Die Asche bleibt.";
  else if (!who) reason = "Die Glocke schweigt.";
  else if (v.lastConfession !== null && state.day - v.lastConfession < 2) reason = "Die Glocke hat euch erst vorgestern gehört.";
  else if (base > 0 && abbau <= 0) reason = "Zu oft in kurzer Zeit.";
  else if (abbau <= 0) reason = "Nichts Frisches zu bekennen.";
  return { who, abbau: reason ? 0 : abbau, reason };
}
// Wille-Proben: Stufen und Schwelle
function willCheck(n) { return willEff() >= n; }

// ---- Tagesaktionen (werte §6) ----
function perkWkBonus(aktion) {
  // Perk-Zuschläge je Aktion: von positiven nur der höchste (S7/S8 gemeinsam: der höhere zählt), negative addiert.
  if (typeof perkList !== "function") return 0;
  let pos = 0, neg = 0;
  perkList().forEach((p) => {
    const fx = perkStageFx(p); const w = fx.wkAktion && fx.wkAktion[aktion];
    if (!w) return;
    if (fx.wkAktionOrt && fx.wkAktionOrt !== state.location) return;
    if (w > 0) pos = Math.max(pos, w); else neg += w;
  });
  return pos + neg;
}
const DAILY_ACTIONS = [
  { id: "work", label: "Arbeiten", locs: ["schmied", "markt", "gasthaus"], steps: 2, flag: "work" },
  { id: "train_atk", label: "Trainieren: Angriff", locs: ["burg", "platz"], steps: 2, flag: "train" },
  { id: "train_def", label: "Trainieren: Panzer", locs: ["burg", "platz"], steps: 2, flag: "train" },
  { id: "pray", label: "Beten", locs: ["tempel"], steps: 1, flag: "pray" },
  { id: "confess", label: "Beichten", locs: ["tempel"], steps: 1, flag: "pray" },
  { id: "study_will", label: "Lernen: Wille", locs: ["ratshalle", "katakomben"], steps: 2, flag: "study" },
  { id: "study_fortune", label: "Lernen: Glück", locs: ["ratshalle", "katakomben"], steps: 2, flag: "study" },
  { id: "tavern", label: "Einkehren (2 Gold)", locs: ["schenke", "gasthaus"], steps: 1, flag: "tavern", gold: 2 },
  { id: "redDoor", label: "Hinter die rote Tür (8 Gold)", locs: ["bordell"], steps: 1, flag: "redDoor", gold: 8 },
  { id: "stille", label: "Stille am Baum", locs: ["alter_baum"], steps: 1, flag: "pray" }
];
function dailyActionsHere() { return DAILY_ACTIONS.filter((a) => a.locs.includes(state.location)); }
function dailyBlocked(a) {
  if (state.narrator || state.dialogue || state.inCombat || state.trading) return "Gerade nicht.";
  if (state.daily[a.flag]) return "Heute erledigt.";
  if (a.gold && state.hero.gold < a.gold) return "Zu wenig Gold.";
  if (a.id === "confess") { const p = confessionPreview(); if (p.reason) return p.reason; }
  return "";
}
function doDaily(id) {
  const a = DAILY_ACTIONS.find((x) => x.id === id);
  if (!a || !a.locs.includes(state.location) || dailyBlocked(a)) return;
  state.daily[a.flag] = true;
  if (a.gold) state.hero.gold -= a.gold;
  let line = "";
  if (id === "work") {
    const extra = state.location === "schmied" && typeof perkMod === "function" ? Math.floor(perkMod("workGold")) : 0;
    const g = 6 + Math.floor(Math.random() * 5) + extra; state.hero.gold += g;
    gain(state.location === "schmied" ? "atk" : "ansehen", 1); bumpWk(-3);
    line = "Ihr arbeitet zwei Stunden lang. +" + g + " Gold.";
  } else if (id === "train_atk" || id === "train_def") {
    gain(id === "train_atk" ? "atk" : "def", 2); bumpWk(-2);
    line = "Ihr übt, bis die Arme schwer sind.";
  } else if (id === "pray" || id === "confess") {
    const who = confessor();
    let wk = (who === "ilwe" ? 3 : 5) + perkWkBonus("beten");
    bumpWk(Math.max(0, wk)); gain("will", 1);
    line = "Ihr sitzt in der Stille. Der Kopf wird klarer.";
    if (id === "confess") line = confess() || line;
    else if (who === "eld" && typeof setTempelKennt === "function" && npcAvailableNow("priester")) setTempelKennt("gespraech");
  } else if (id === "study_will" || id === "study_fortune") {
    gain(id === "study_will" ? "will" : "fortune", id === "study_will" ? 2 : 1);
    line = "Ihr lest und hört zu. Etwas bleibt hängen.";
  } else if (id === "tavern") {
    bumpWk(5 + (state.location === "schenke" ? perkWkBonus("schenke") : 0));
    line = "Ein Krug, ein warmer Platz. Ihr kommt wieder zu euch.";
  } else if (id === "redDoor") {
    bumpWk(6);
    if (typeof factionLean === "function") factionLean("gasse", 1);
    line = "Hinter der roten Tür ist es warm und leise. Was dort geschieht, bleibt dort. Ihr geht ruhiger hinaus.";
  } else if (id === "stille") {
    bumpWk(4); gain("will", 1);
    line = "Unter dem alten Baum hört ihr nur den Wind.";
  }
  advance(a.steps);
  log(line);
  persist(); render();
  showFace(null); showLine(line, [{ label: "Weiter", go: "clear" }]);
}
function confess() {
  const v = state.values, p = confessionPreview();
  if (typeof setTempelKennt === "function") setTempelKennt("beichte");
  let txt = "";
  if (p.abbau > 0) {
    bumpKorr(-p.abbau); v.buss = 0; v.confessions = (v.confessions || []).filter((d) => d >= state.day - 6).concat([state.day]);
    v.lastConfession = state.day; v.tempelRuheBis = state.day + 7;
    txt = (p.who === "ilwe" ? "Schwester Ilwe" : "Eld") + " hört euch bis zum Ende zu. Etwas Asche fällt ab.";
  } else txt = "Ihr sprecht. " + (p.reason || "") + "";
  // Ruf-Teil: eigener Cooldown (Stufe c bucht tempel vertrauen)
  if (typeof confessionRuf === "function" && (v.lastRufConfession === null || state.day - v.lastRufConfession >= 2)) { if (confessionRuf(p.who)) v.lastRufConfession = state.day; }
  return txt;
}
function npcAvailableNow(id) { const n = D.NPCs[id]; return !!n && n.location === state.location && (!n.hours || n.hours.includes(state.phase)) && !(state.npcEnd && state.npcEnd[id]); }
// Rast (app.js rest): wk +6 einmal je Tag, Angeschlagen endet.
function onRest() {
  if (!state.daily.rest) {
    state.daily.rest = true;
    bumpWk(6 + (state.location === "dorfzentrum" ? perkWkBonus("ruhe") : 0));
  }
  state.buffs = (state.buffs || []).filter((b) => b.until !== "rast");
}
// Tageswechsel: Bußkonto, Regeneration, Rückdrift, Vernachlässigung, Tagesaktionen zurück.
onNewDay((day) => {
  if (!state || !state.values) return;
  const v = state.values;
  v.buss = (v.buss || 0) + (v.bussHeute || 0); v.bussHeute = 0; v.korrHeute = 0; v.haltHeute = 0;
  v.wk = Math.min(wkMax(), (v.wk || 0) + Math.round(wkMax() * wkRegenPct() / 100));
  if (Math.abs(v.haltung) > 15 && day - (v.lastHaltDelta || day) >= 3 && (day - v.lastHaltDelta) % 3 === 0) v.haltung += v.haltung > 0 ? -1 : 1;
  ["atk", "def", "will"].forEach((k) => {
    if (k === "will" && (state.hero.will || 0) >= STAT_CAP_WILL) return;
    const last = (v.lastTrain && v.lastTrain[k]) || day;
    if (day - last > 5 && state.statXp[k] && state.statXp[k].xp > 0) state.statXp[k].xp -= 1;
  });
  state.daily = freshDaily(day);
  syncValueFlags();
});
// gain()-Erweiterung: Deckel (Grundwert) und Trainingsstempel.
function statCapped(key) { return (state.hero[key] || 0) >= statCap(key); }
function noteTrain(key) { if (state.values && state.values.lastTrain && ["atk", "def", "will"].includes(key)) state.values.lastTrain[key] = state.day; }
// when-Keys (Engine): willMin, korrMin, korrMax, korrPeakMax, haltungMin, haltungMax
function sysWhen(w) {
  if (!state.values) return true;
  const v = state.values;
  if (w.willMin !== undefined && willEff() < w.willMin) return false;
  if (w.korrMin !== undefined && v.korr < w.korrMin) return false;
  if (w.korrMax !== undefined && v.korr > w.korrMax) return false;
  if (w.korrPeakMax !== undefined && v.korrPeak > w.korrPeakMax) return false;
  if (w.haltungMin !== undefined && v.haltung < w.haltungMin) return false;
  if (w.haltungMax !== undefined && v.haltung > w.haltungMax) return false;
  if (typeof sysWhenMore === "function" && !sysWhenMore(w)) return false;
  return true;
}
function migV3(s) {
  initValues(s);
  const prev = state; state = s;
  try { if (!(s.values.wk > 0)) s.values.wk = wkMax(); syncValueFlags(); } finally { state = prev; }
  return s;
}
function sysNewGame(s) {
  const prev = state; state = s;
  try { MIGRATIONS.slice(2).forEach((m) => m(s)); s.values.wk = wkMax(); } finally { state = prev; }
}
// ---- Anzeige ----
function dbg(n) { return DEBUG ? " <span class='dbg'>(" + n + ")</span>" : ""; }
function valuesHtml() {
  const v = state.values, we = willEff(), wm = wkMax();
  const pct = Math.round((v.wk / wm) * 100);
  const gw = gearBonus("will");
  return "<h3>Wille und Haltung</h3>" +
    "<div class='card'><b>Titel</b> " + esc(titel()) + "<div class='tiny'>" + esc(KORR_TEXT[korrTier().id]) + "</div></div>" +
    "<div class='card'><b>Wille</b> " + willTierName(we) + dbg("willEff " + we + (gw > 3 ? ", Ausr. +" + gw + " wirksam +3" : "")) +
    "<div class='tiny'>Willenskraft</div><div class='bar wk'><i style='width:" + pct + "%'></i></div>" + dbg(v.wk + "/" + wm) + "</div>" +
    "<div class='card'><b>Korruption</b> " + korrTier().name + dbg(v.korr + ", Höchststand " + v.korrPeak + ", Buße " + v.buss) + "</div>" +
    "<div class='card'><b>Haltung</b> " + haltungTier().name + dbg(v.haltung) + "</div>";
}
const SCENE_EXTRAS = [];  // fn() -> [{ label, go, why }]
function dailyButtonsHtml() {
  const list = dailyActionsHere();
  const extra = [].concat(...SCENE_EXTRAS.map((fn) => { try { return fn() || []; } catch (e) { console.error(e); return []; } }));
  const ex = extra.map((x) => "<button class='daily-act' data-extra='" + esc(x.go) + "'" + (x.why ? " disabled title='" + esc(x.why) + "'" : "") + ">" + esc(x.label) + "</button>").join("");
  if (!list.length) return ex;
  return list.map((a) => { const why = dailyBlocked(a); return "<button class='daily-act' data-daily='" + a.id + "'" + (why ? " disabled title='" + esc(why) + "'" : "") + ">" + esc(a.label) + (why && why !== "Gerade nicht." ? " <small>· " + esc(why) + "</small>" : "") + "</button>"; }).join("") + ex;
}
function renderDaily(scene) {
  let box = document.getElementById("daily-acts");
  if (!box) { box = document.createElement("div"); box.id = "daily-acts"; scene.parentElement.appendChild(box); }
  box.innerHTML = dailyButtonsHtml();
  box.hidden = !box.innerHTML;
  box.querySelectorAll("[data-daily]").forEach((b) => { b.onclick = () => doDaily(b.dataset.daily); });
  box.querySelectorAll("[data-extra]").forEach((b) => { b.onclick = () => sceneExtra(b.dataset.extra); });
}

// =====================================================================
// Stufe b · Beziehungen: Nähe-Kurve, Tagesdeckel, Vertrauen, Status, Gedächtnis, Verblassen, pendingBonds (beziehungen.md)
// =====================================================================
const NPC_ALIAS = { burgvogt: "harn", priester: "eld", marktfrau: "maera" };
const NPC_ALIAS_BACK = Object.fromEntries(Object.entries(NPC_ALIAS).map(([a, b]) => [b, a]));
function npcId(id) { return NPC_ALIAS_BACK[id] || id; }  // Konzept-ID (harn) -> data.js-ID (burgvogt)
const STATUS_EXCLUDES = {
  rivale: ["partner", "verbuendet"], verbuendet: ["rivale", "erpresst"], abhaengig_npc: ["begehren", "affaere"],
  erpresst: ["freundschaft", "partner", "verbuendet", "begehren", "affaere"], begehren: ["erpresst", "abhaengig_npc", "ex"],
  affaere: ["erpresst", "abhaengig_npc", "ex"], partner: ["rivale", "erpresst"], ex: ["begehren", "affaere", "partner"]
};
function freshRelation(day) { return { trust: 20, status: ["bekanntschaft"], memory: [], memoryCore: [], secrets: [], betrayed: false, dailyGain: { day: 0, sum: 0, trust: 0 }, lastContact: day, talkDay: 0, gifts: {} }; }
function rel(id) {
  id = npcId(id);
  if (!state.relations) state.relations = {};
  if (!state.relations[id]) state.relations[id] = freshRelation(state.day);
  return state.relations[id];
}
function hasStatus(id, st) { const r = state.relations && state.relations[npcId(id)]; return !!r && r.status.includes(st); }
function addStatus(id, st) {
  const r = rel(id);
  if ((STATUS_EXCLUDES[st] || []).some((x) => r.status.includes(x)) && st !== "erpresst") return false;
  if (st === "partner" && Object.keys(state.relations).some((k) => state.relations[k].status.includes("partner"))) return false;
  if (st === "erpresst") {  // Erpressung beendet Freundschaft, Pakt, Begehren, Partnerschaft; Affäre wird ex
    r.status = r.status.filter((x) => !["freundschaft", "verbuendet", "begehren", "partner"].includes(x));
    if (r.status.includes("affaere")) { r.status = r.status.filter((x) => x !== "affaere"); r.status.push("ex"); r.exUntil = state.day + 14; }
    if (!r.status.includes("bekanntschaft")) r.status.push("bekanntschaft");
    remember(id, "erpresst_von_spieler", 3, true);
  }
  if (st === "freundschaft") r.status = r.status.filter((x) => x !== "bekanntschaft");
  if (!r.status.includes(st)) r.status.push(st);
  return true;
}
function dropStatus(id, st) { const r = rel(id); r.status = r.status.filter((x) => x !== st); if (st === "freundschaft" && !r.status.includes("bekanntschaft")) r.status.push("bekanntschaft"); }
// Verführung (nur angedeutet) ist gesperrt, solange Erpressung oder Abhängigkeit besteht – in beide Richtungen (Leitung).
function canSeduce(id) { const r = state.relations && state.relations[npcId(id)]; if (!r) return false; return !["erpresst", "abhaengig_npc", "abhaengig_spieler"].some((s) => r.status.includes(s)) && !r.betrayed && !(state.npcEnd && state.npcEnd[npcId(id)]); }
// Erpressung kann nie ein Flehen/Bitten erzwingen: Erpresste NPCs bieten keine Fürsprache und keine Perks.
function canPlead(id) { return canSeduce(id) || (!hasStatus(id, "erpresst") && !hasStatus(id, "abhaengig_npc")); }
function remember(id, tag, weight, core) {
  const r = rel(id); const e = { tag, weight: weight || 1, day: state.day };
  if (core) {
    r.memoryCore.push(e);
    if (r.memoryCore.length > 12) {  // Überlauf: zusammenfassen, nie löschen (werte §8.5)
      const old = r.memoryCore.shift(); let sum = r.memoryCore.find((x) => x.tag === "vieles_erlebt");
      if (!sum) { sum = { tag: "vieles_erlebt", tags: [], weight: 0, day: old.day }; r.memoryCore.unshift(sum); }
      sum.tags.push(old.tag); sum.weight = Math.max(sum.weight, old.weight);
    }
  } else { r.memory.push(e); r.memory = r.memory.slice(-20); }
}
function npcMemoryHas(id, tag) { const r = state.relations && state.relations[npcId(id)]; if (!r) return false; return r.memory.concat(r.memoryCore).some((m) => m.tag === tag || (m.tags || []).includes(tag)); }
function npcPresent(id, loc, phase) { const n = D.NPCs[npcId(id)]; if (!n || (state.npcEnd && state.npcEnd[n.id])) return false; return n.location === (loc || state.location) && (!n.hours || n.hours.includes(phase || state.phase)); }
function isWitness(id, loc, phase) { return npcPresent(id, loc, phase); }
// Gewinnkurve stückweise: bis 55 ×1, 55–80 ×½, über 80 ×⅓. raw = Rohpunkte; liefert echten Zuwachs.
function bondCurve(cur, raw) {
  let v = cur, left = raw;
  while (left > 1e-9 && v < 100) {
    const f = v < 55 ? 1 : v < 80 ? 0.5 : 1 / 3; const edge = v < 55 ? 55 : v < 80 ? 80 : 100;
    const room = (edge - v) / f; const use = Math.min(left, room);
    v += use * f; left -= use;
  }
  return v - cur;
}
function bondDayCap(cur) { return cur < 38 ? 6 : cur < 55 ? 4 : cur < 80 ? 3 : 2; }
function round1(n) { return Math.round(n * 10) / 10; }
// bumpBond(id, d, { source }) – source: talk | gift | first | quest | quest_story | hard | manip
function bumpBondSys(id, d, opts) {
  opts = opts || {};
  id = npcId(id);
  const src = opts.source || "quest";
  const cur = state.bonds[id] || 0;
  const r = rel(id);
  if (d > 0) {
    if ((src === "talk" || src === "gift") && typeof gearFx === "function") d += Math.min(2, gearFx("bondPlus"));
    if (src === "first" && typeof perkMod === "function") d = Math.max(1, d + perkMod("bondErstPlus"));
    if (r.betrayed) return 0;
    let gainV = bondCurve(cur, d);
    if (src !== "quest_story" && src !== "hard") {
      if (r.dailyGain.day !== state.day) r.dailyGain = { day: state.day, sum: 0, trust: 0 };
      const room = Math.max(0, bondDayCap(cur) - r.dailyGain.sum);
      gainV = Math.min(gainV, room);
      r.dailyGain.sum += gainV;
    }
    state.bonds[id] = round1(clamp(cur + gainV, -100, 100));
  } else state.bonds[id] = round1(clamp(cur + d, -100, 100));
  if (["talk", "gift", "quest", "quest_story"].includes(src)) r.lastContact = state.day;
  return state.bonds[id] - cur;
}
function bumpTrust(id, d, opts) {
  const r = rel(id); opts = opts || {};
  if (r.betrayed) { r.trust = 0; return; }
  if (d > 0) {
    if (r.trust >= 70 && !opts.risk) return;
    if (r.dailyGain.day !== state.day) r.dailyGain = { day: state.day, sum: 0, trust: 0 };
    const cap = r.trust < 40 ? 10 : 5;
    d = Math.min(d, Math.max(0, cap - r.dailyGain.trust)); r.dailyGain.trust += d;
  }
  r.trust = clamp(r.trust + d, 0, 100);
}
function betray(id) { const r = rel(id); r.betrayed = true; r.trust = 0; r.status = r.status.filter((s) => s === "bekanntschaft"); remember(id, "verraten", 3, true); }
function trustWord(t) { return t < 15 ? "glaubt nichts" : t < 40 ? "vorsichtig" : t < 70 ? "verlässt sich auf euch" : "würde für euch lügen"; }
const STATUS_NAMES = { bekanntschaft: "Bekanntschaft", freundschaft: "Freundschaft", rivale: "Rivale", verbuendet: "Verbündet", schuldner: "Ihr schuldet", glaeubiger: "Schuldet euch", abhaengig_npc: "Abhängig von euch", abhaengig_spieler: "Ihr seid abhängig", erpresst: "Erpresst", begehren: "Anziehung", affaere: "Heimlich", partner: "Partner", ex: "Getrennt" };
// Gespräch: erstes Treffen +4 (Vertrauen 20), danach einmal je Tag +1 (mit bondPlus, unter Deckel).
function onTalk(id) {
  const r = rel(id);
  if (r.talkDay !== state.day) { r.talkDay = state.day; if (state.flags["met_" + id + "_tag"]) bumpBondSys(id, 1, { source: "talk" }); }
  state.flags["met_" + id + "_tag"] = true;
  bookPendingByReport(id);
}
// Wolf-Bindungen parken (werte §8.4): Bericht beim NPC bucht voll, Gerücht nach 2 Tagen 60 %.
function parkWolfBonds(outcome) {
  if (state.flags.sim_bonds_wolf_settled) return;
  state.flags.sim_bonds_wolf_settled = true;
  if (!state.world) state.world = {};
  if (!Array.isArray(state.world.pendingBonds)) state.world.pendingBonds = [];
  const D_ = { wolf_spared: { burgvogt: -2, tamsin: 4 }, wolf_bargain: { burgvogt: -3, tamsin: 2 } }[outcome];
  if (!D_) return;  // Erschlagen: die Quest-Abgabe ist der Bericht (keine Doppelbuchung)
  Object.keys(D_).forEach((npc) => state.world.pendingBonds.push({ npc, delta: D_[npc], origTag: outcome, day: state.day }));
}
function bookPendingByReport(id) { /* Bericht nur über ausdrückliche Option (talkChoices "Vom Pfad erzählen") */ }
function hasPendingBond(id) { return ((state.world && state.world.pendingBonds) || []).some((p) => p.npc === id); }
function reportPending(id, factor) {
  const list = (state.world && state.world.pendingBonds) || [];
  list.filter((p) => p.npc === id).forEach((p) => { if (!(state.npcEnd && state.npcEnd[id])) bumpBondSys(id, round1(p.delta * (factor || 1)), { source: "quest_story" }); });
  state.world.pendingBonds = list.filter((p) => p.npc !== id);
}
onNewDay((day) => {
  if (!state || !state.relations) return;
  const pb = (state.world && state.world.pendingBonds) || [];
  pb.filter((p) => day - p.day >= 2).forEach((p) => reportPending(p.npc, 0.6));  // Gerücht kommt an
  Object.keys(state.relations).forEach((id) => {
    const r = state.relations[id]; const b = state.bonds[id] || 0;
    if (r.exUntil && day >= r.exUntil) { dropStatus(id, "ex"); r.exUntil = 0; remember(id, "ex_" + id, 1); }
    if ((state.npcEnd && state.npcEnd[id]) || r.betrayed) return;
    const idle = day - (r.lastContact || day);
    if (idle < 8) return;
    if (b > 55) state.bonds[id] = Math.max(55, b - 1);
    else if (b > 38 && (idle - 8) % 3 === 0) state.bonds[id] = Math.max(38, b - 1);
  });
});
function migV4(s) {
  if (!s.relations || typeof s.relations !== "object") s.relations = {};
  if (!s.npcEnd || typeof s.npcEnd !== "object") s.npcEnd = {};
  if (!s.world || typeof s.world !== "object") s.world = {};
  if (!Array.isArray(s.world.pendingBonds)) s.world.pendingBonds = [];
  Object.keys(s.flags || {}).forEach((k) => {
    const m = /^met_(.+)$/.exec(k); if (!m || !D.NPCs[m[1]] || s.relations[m[1]]) return;
    s.relations[m[1]] = freshRelation(s.day || 1); s.flags[k + "_tag"] = true;
  });
  // Alt-Bonds sind gültig, nur genauer angezeigt. Kanonisches Wolf-Flag lesen: wolf_slain || wolf_tot.
  if (s.flags.wolf_tot && !s.flags.wolf_slain) s.flags.wolf_slain = true;
  if (s.flags.wolf_slain || s.flags.wolf_spared || s.flags.wolf_bargain) { s.flags.wolf_dealt = true; s.flags.sim_bonds_wolf_settled = true; }
  return s;
}
function relationsHtml() {
  const ids = Object.keys(state.bonds);
  if (!ids.length) return "<h3>Nähe</h3><p class='tiny'>Noch niemand kennt euch.</p>";
  return "<h3>Nähe</h3>" + ids.map((id) => {
    const r = state.relations && state.relations[id];
    const st = r ? r.status.map((s) => STATUS_NAMES[s] || s).join(", ") : "";
    return "<div class='tiny'><b>" + esc(D.NPCs[id] ? D.NPCs[id].name : id) + "</b>: " + bondLabel(state.bonds[id]) + (r ? " · " + trustWord(r.trust) : "") + (st ? " · " + esc(st) : "") +
      dbg("Nähe " + state.bonds[id] + (r ? ", Vertrauen " + r.trust : "")) + "</div>";
  }).join("");
}
// ---- Gesprächs-Haken: weitere Stufen hängen sich hier an ----
const TALK_HOOKS = [];   // fn(npc, choices) fügt Optionen an (nur im Knoten "start")
const CHOOSE_HOOKS = {}; // go-Präfix -> fn(go, npc) ; true = erledigt
function sysTalkChoices(npc, choices) { TALK_HOOKS.forEach((fn) => { try { fn(npc, choices); } catch (e) { console.error(e); } }); }
function sysChoose(go) {
  const key = Object.keys(CHOOSE_HOOKS).find((k) => go === k || go.startsWith(k + ":"));
  if (!key) return false;
  const npc = state.dialogue && (D.NPCs[state.dialogue.npcId] || lastTalk);
  const line = CHOOSE_HOOKS[key](go, npc);
  if (line === false) return false;
  persist(); render();
  showFace(lastTalk); showLine(typeof line === "string" ? line : "", talkChoices());
  return true;
}
TALK_HOOKS.push((npc, c) => { if (hasPendingBond(npc.id)) c.push({ label: "Vom Pfad erzählen", go: "report_wolf" }); });
CHOOSE_HOOKS.report_wolf = (go, npc) => { reportPending(npc.id, 1); remember(npc.id, "wolf_bericht", 1); return "Ihr erzählt, was am Pfad geschah. " + npc.name + " hört zu und merkt es sich."; };

// =====================================================================
// Stufe c · Fraktionen und Ruf: Achsen gunst/zorn/vertrauen/furcht, Kurve, Deckel, Verfall, Sühne, Neigung (fraktionen-ruf.md)
// =====================================================================
const RUF_STUFEN = [
  { min: -Infinity, id: "geaechtet", name: "Geächtet" }, { min: -69, id: "gejagt", name: "Gejagt" }, { min: -54, id: "verhasst", name: "Verhasst" },
  { min: -39, id: "beargwoehnt", name: "Beargwöhnt" }, { min: -26, id: "ungern_gesehen", name: "Ungern gesehen" }, { min: -14, id: "kuehl", name: "Kühl" },
  { min: -4, id: "unbeschrieben", name: "Unbeschrieben" }, { min: 5, id: "geduldet", name: "Geduldet" }, { min: 15, id: "gelitten", name: "Gelitten" },
  { min: 27, id: "geschaetzt", name: "Geschätzt" }, { min: 40, id: "angesehen", name: "Angesehen" }, { min: 55, id: "vertrauter_der_sache", name: "Vertrauter der Sache" },
  { min: 70, id: "eingeschworen", name: "Eingeschworen" }
];
// Vermittler je Fraktion (Sühne/Dienst). Fällt er aus, bleibt der Brief im Gasthaus.
const FACTION_MEDIATOR = { krone: "burgvogt", rat: "enno", nebel: "hella", gasse: "marktfrau", tempel: "priester" };
const SUEHNE_DIENST = { krone: "Als Wegbote laufen", rat: "Am Brunnen ausbessern", nebel: "Pflanzen statt pflücken", gasse: "Eine Gefälligkeit erledigen", tempel: "Totenwache halten" };
function axes(id) {
  const w = state.world; if (!w.axes) w.axes = {}; if (!w.axesExt) w.axesExt = {};
  if (!w.axes[id]) w.axes[id] = { gunst: 0, zorn: 0, zornPeak: 0, gunstPeak: 0, lastCare: 0, lastZornDrop: state.day, suehneBis: 0, heute: { day: 0 } };
  if (!w.axesExt[id]) w.axesExt[id] = { vertrauen: 20, furcht: 0 };
  return w.axes[id];
}
function axisNet(id) { const a = axes(id); return a.gunst - a.zorn; }
function axisTier(id) { const n = axisNet(id); return n <= -40 ? "hostile" : n <= -15 ? "wary" : n < 15 ? "neutral" : n < 40 ? "warm" : "allied"; }
function rufStufe(id) { return tierOf(RUF_STUFEN, axisNet(id)); }
function syncFactionMirror() { Object.keys(D.FACTIONS).forEach((id) => { const a = axes(id); state.factions[id] = a.gunst - a.zorn; }); }
// Buchung einer Achse: positive gunst/vertrauen mit Kurve Δ×(1−v/130), Tagesdeckel +15 (gunst/vertrauen) bzw. +25 (zorn/furcht).
function bumpFaction(id, axis, d, opts) {
  if (!D.FACTIONS[id] || !d) return 0;
  opts = opts || {};
  const a = axes(id), ext = state.world.axesExt[id];
  if (a.heute.day !== state.day) a.heute = { day: state.day, gunst: 0, vertrauen: 0, zorn: 0, furcht: 0 };
  const isExt = axis === "vertrauen" || axis === "furcht";
  const cur = isExt ? ext[axis] : a[axis];
  if (d > 0) {
    if (axis === "gunst" || axis === "vertrauen") d = Math.max(1, Math.round(d * (1 - cur / 130)));
    if (axis === "gunst") {  // Summen-Druck
      const sum = Object.keys(D.FACTIONS).reduce((s, f) => s + axes(f).gunst, 0);
      if (sum > 52 * Object.keys(D.FACTIONS).length) d -= 1;
    }
    const cap = (axis === "zorn" || axis === "furcht") ? 25 : 15;
    d = Math.max(0, Math.min(d, cap - a.heute[axis]));
    a.heute[axis] += d;
    if (axis === "furcht" && ext.vertrauen > 50) ext.vertrauen = 50;
  }
  let nv = clamp(cur + d, 0, 100);
  if (axis === "zorn" && d < 0) nv = Math.max(nv, Math.ceil((a.zornPeak || 0) * 0.25));
  if (axis === "gunst" && d < 0 && a.gunstPeak >= 40) nv = Math.max(nv, Math.min(cur, 30));
  if (axis === "vertrauen" && ext.furcht >= 50) nv = Math.min(nv, 50);
  const real = nv - cur;
  if (isExt) ext[axis] = nv; else a[axis] = nv;
  if (axis === "zorn") { a.zornPeak = Math.max(a.zornPeak || 0, a.zorn); if (real > 0 && !opts.lean) a.lastZornDrop = state.day; }
  if (axis === "gunst") { a.gunstPeak = Math.max(a.gunstPeak || 0, a.gunst); if (real > 0) a.lastCare = state.day; }
  syncFactionMirror();
  return real;
}
// Neigung (Korruption/Haltung/Perks/Rote Tür): höchstens ±1 je Fraktion und Tag, negativ = zorn +1 (nur solange zorn < 30).
function factionLean(id, sign) {
  if (!D.FACTIONS[id]) return 0;
  const w = state.world; if (!w.lean) w.lean = {};
  if (w.lean[id] === state.day) return 0;
  w.lean[id] = state.day;
  if (sign > 0) return bumpFaction(id, "gunst", 1, { lean: true });
  if (axes(id).zorn >= 30) return 0;
  return bumpFaction(id, "zorn", 1, { lean: true });
}
function zornBoden(id) { return Math.ceil((axes(id).zornPeak || 0) * 0.25); }
function suehneOffen(id) { const a = axes(id); return a.zorn > zornBoden(id) && axisNet(id) < 0 && (state.world.suehneTag !== state.day); }
function suehne(id, art) {
  if (!suehneOffen(id)) return "";
  const a = axes(id), before = a.zorn;
  const stufe = Math.min(5, Math.max(1, Math.ceil(a.zorn / 20)));
  if (art === "busse") {
    const cost = 10 * stufe; if (state.hero.gold < cost) return "Dafür reicht euer Gold nicht.";
    state.hero.gold -= cost; bumpFaction(id, "zorn", -6);
  } else { advance(2); bumpFaction(id, "zorn", -10); bumpFaction(id, "gunst", 3); }
  const done = before - a.zorn; a.zornPeak = Math.max(a.zorn, a.zornPeak - done);
  a.suehneBis = state.day + 3; state.world.suehneTag = state.day;
  syncFactionMirror();
  return art === "busse" ? "Ihr zahlt die Buße. Man nimmt sie, ohne zu lächeln." : "Ihr leistet den Dienst. Man hat es gesehen.";
}
function suehneKosten(id) { return 10 * Math.min(5, Math.max(1, Math.ceil(axes(id).zorn / 20))); }
TALK_HOOKS.push((npc, c) => {
  const f = Object.keys(FACTION_MEDIATOR).find((k) => FACTION_MEDIATOR[k] === npc.id);
  if (!f || !suehneOffen(f) || !canPlead(npc.id)) return;
  c.push({ label: "Buße zahlen (" + suehneKosten(f) + " Gold)", go: "suehne:" + f + ":busse" });
  c.push({ label: SUEHNE_DIENST[f] + " (Dienst)", go: "suehne:" + f + ":dienst" });
});
CHOOSE_HOOKS.suehne = (go) => { const [, f, art] = go.split(":"); return suehne(f, art) || "Heute nicht mehr."; };
// Brief im Gasthaus: Sühne, wenn ein Vermittler ausgefallen ist (kein feindlicher Softlock).
function briefSuehneFaktionen() { return Object.keys(FACTION_MEDIATOR).filter((f) => state.npcEnd[FACTION_MEDIATOR[f]] && suehneOffen(f)); }
// Fürsprache (freiwillig): Nähe ≥ vertraut, nicht erpresst/abhängig/verraten; 1/Tag gesamt, je NPC 1/7 Tage, je Fraktion 7 Tage.
function canIntercede(npc, f) {
  const w = state.world; w.fuersprache = w.fuersprache || { tag: 0, npc: {}, fraktion: {} };
  if (!npc || npc.faction !== f && !D.FACTIONS[f]) return false;
  if (w.fuersprache.tag === state.day) return false;
  if (state.day - (w.fuersprache.npc[npc.id] || -99) < 7 || state.day - (w.fuersprache.fraktion[f] || -99) < 7) return false;
  const a = axes(f); if (!(a.zorn > zornBoden(f) && axisNet(f) < 0)) return false;
  return (state.bonds[npc.id] || 0) >= 38 && canPlead(npc.id) && !rel(npc.id).betrayed && npcPresent(npc.id);
}
TALK_HOOKS.push((npc, c) => { Object.keys(D.FACTIONS).filter((f) => f !== npc.faction && canIntercede(npc, f)).slice(0, 1).forEach((f) => c.push({ label: "Um Fürsprache bei " + D.FACTIONS[f].name + " bitten", go: "fuersprache:" + f })); });
CHOOSE_HOOKS.fuersprache = (go, npc) => {
  const f = go.split(":")[1]; if (!canIntercede(npc, f)) return "Nicht jetzt.";
  const a = axes(f), b = a.zorn; bumpFaction(f, "zorn", -8); a.zornPeak = Math.max(a.zorn, a.zornPeak - (b - a.zorn));
  const w = state.world.fuersprache; w.tag = state.day; w.npc[npc.id] = state.day; w.fraktion[f] = state.day;
  return npc.name + " verspricht, ein Wort einzulegen.";
};
// Beichte: Ruf-Teil (tempel vertrauen +2, bei Ilwe +1), eigener Cooldown in confess().
function confessionRuf(who) { if (!who) return false; bumpFaction("tempel", "vertrauen", who === "ilwe" ? 1 : 2); return true; }
// Tempel-Wissen über Korruption (werte §8.6): vier Quellen, Flag mit Stufe überschrieben.
function setTempelKennt() { state.flags.tempel_kennt_korr = korrTier().id; }
function tempelZeuge(tag) { if (Object.values(D.NPCs).some((n) => n.faction === "tempel" && isWitness(n.id))) setTempelKennt(); }
const TEMPEL_GERUECHT_TAGS = [];  // (d) Gerücht mit passendem origTag – Gerüchtewandern ist in Act 1 noch nicht gebaut
TALK_HOOKS.push((npc) => { if (npc.faction === "tempel" && npc.location === "tempel" && state.flags["met_" + npc.id]) setTempelKennt(); });
onNewDay((day) => {
  if (!state || !state.world || !state.world.axes) return;
  Object.keys(D.FACTIONS).forEach((id) => {
    const a = axes(id), ext = state.world.axesExt[id];
    if (day - (a.lastCare || 0) > 7 && day % 3 === 0 && a.gunst > 0) a.gunst = Math.max(a.gunstPeak >= 40 ? Math.min(a.gunst, 30) : 0, a.gunst - 1);
    const zEvery = a.suehneBis >= day ? 1 : 5;
    if (a.zorn > zornBoden(id) && (day - (a.lastZornDrop || 0)) % zEvery === 0) a.zorn = Math.max(zornBoden(id), a.zorn - 1);
    if (ext.vertrauen > 40 && day % 14 === 0) ext.vertrauen -= 1;
    if (ext.furcht > 0) ext.furcht -= 1;
  });
  // Tempel-Neigung: nur mit Wissen, ab k5, zorn < 30, nicht in der Ruhe nach einer Beichte mit Abbau
  const kf = state.flags.tempel_kennt_korr;
  if (kf && state.values) {
    const known = Math.min(Number(String(kf).slice(1)), korrTierIdx());
    if (known >= 5 && day >= (state.values.tempelRuheBis || 0)) factionLean("tempel", -1);
  }
  syncFactionMirror();
});
// when-Keys für Ruf: rufMin { fraktion: netto }, rufMax, tierIs { fraktion: tier }
function sysWhenMore(w) {
  if (w.rufMin) for (const f of Object.keys(w.rufMin)) if (!D.FACTIONS[f] || axisNet(f) < w.rufMin[f]) return false;
  if (w.rufMax) for (const f of Object.keys(w.rufMax)) if (!D.FACTIONS[f] || axisNet(f) > w.rufMax[f]) return false;
  if (typeof sysWhenPerk === "function" && !sysWhenPerk(w)) return false;
  return true;
}
// Händlerpreis nach Ruf: preis × (1 − netto/400 − furcht/500), 0,75…1,30. Feindliche Fraktionshändler verweigern; Stände bleiben.
function rufPreisFaktor(npc) {
  if (!npc || !npc.faction || !D.FACTIONS[npc.faction] || !state.world || !state.world.axes) return 1;
  return clamp(1 - axisNet(npc.faction) / 400 - state.world.axesExt[npc.faction].furcht / 500, 0.75, 1.3);
}
function haendlerVerweigert(npc) { return !!(npc && npc.faction && !npc.stall && state.world && state.world.axes && axisTier(npc.faction) === "hostile"); }
function migV5(s) {
  const prev = state; state = s;
  try {
    if (!s.world) s.world = {};
    if (!s.flags.sim_axes_migrated) {
      Object.keys(D.FACTIONS).forEach((id) => { const n = Number(s.factions[id]) || 0; const a = axes(id); a.gunst = Math.max(0, n); a.zorn = Math.max(0, -n); a.zornPeak = a.zorn; a.gunstPeak = a.gunst; a.lastCare = s.day || 1; a.lastZornDrop = s.day || 1; });
      s.flags.sim_axes_migrated = true;
    }
    Object.keys(D.FACTIONS).forEach((id) => axes(id));
    syncFactionMirror();
  } finally { state = prev; }
  return s;
}
function factionsHtml() {
  return "<h3>Ruf</h3>" + Object.keys(D.FACTIONS).map((id) => {
    const a = axes(id), e = state.world.axesExt[id];
    return "<div class='tiny'><b>" + esc(D.FACTIONS[id].name) + "</b>: " + rufStufe(id).name + (suehneOffen(id) ? " · Sühne möglich bei " + esc(D.NPCs[FACTION_MEDIATOR[id]].name) : "") +
      dbg("gunst " + a.gunst + ", zorn " + a.zorn + ", vertrauen " + e.vertrauen + ", furcht " + e.furcht) + "</div>";
  }).join("");
}

const SCENE_HANDLERS = {};
function sceneExtra(go) {
  if (state.narrator || state.dialogue || state.inCombat || state.trading) return;
  const k = go.split(":")[0]; const line = SCENE_HANDLERS[k] && SCENE_HANDLERS[k](go);
  if (!line) return;
  log(line); persist(); render(); showFace(null); showLine(line, [{ label: "Weiter", go: "clear" }]);
}
SCENE_EXTRAS.push(() => state.location === "gasthaus" ? briefSuehneFaktionen().map((f) => ({ label: "Brief an " + D.FACTIONS[f].name + " (Buße " + suehneKosten(f) + " Gold)", go: "brief:" + f })) : []);
SCENE_HANDLERS.brief = (go) => suehne(go.split(":")[1], "busse");
const STATS_MORE = [];  // fn() -> html
function sysStatsMore() { return STATS_MORE.map((fn) => fn()).join(""); }
STATS_MORE.push(factionsHtml);
