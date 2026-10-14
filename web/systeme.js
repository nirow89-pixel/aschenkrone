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
  if (typeof emitDelta === "function") emitDelta({ kind: "korr", key: "korr", delta: d, hidden: true });
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
const TALK_HOOKS_LATE = [];  // Optionen nach den übrigen Haken (Arbeit, Training, Einkehren)
const DAILY_ACTIONS = [
  // npcs: nur über diese NPCs (Gesprächsoption), nicht mehr im Ortsfenster (Korrekturliste Nico).
  { id: "work", label: "Arbeiten", locs: ["schmied", "markt", "gasthaus"], steps: 2, flag: "work", npcs: ["branna", "kraemerin", "jorun"] },
  // Training bei Harn (Burg) und Edrik (Platz) gegen Gold, wie Lernen bei Selene/Rorik.
  { id: "train_atk", label: "Trainieren: Angriff (14 Gold)", locs: ["burg", "platz"], steps: 2, flag: "train", gold: 14, npcs: ["burgvogt", "edrik"] },
  { id: "train_def", label: "Trainieren: Panzer (12 Gold)", locs: ["burg", "platz"], steps: 2, flag: "train", gold: 12, npcs: ["burgvogt", "edrik"] },
  { id: "pray", label: "Beten", locs: ["tempel"], steps: 1, flag: "pray" },
  { id: "confess", label: "Beichten", locs: ["tempel"], steps: 1, flag: "pray" },
  // Lernen nur noch bei Selene (Wille) und Rorik (Glück) in der Ratshalle, gegen Gold; Katakomben ohne Lernen (Ausbesserung 2).
  { id: "study_will", label: "Lernen: Wille (12 Gold)", locs: ["ratshalle"], steps: 2, flag: "study", gold: 12, npcs: ["selene"] },
  { id: "study_fortune", label: "Lernen: Glück (10 Gold)", locs: ["ratshalle"], steps: 2, flag: "study", gold: 10, npcs: ["rorik"] },
  { id: "tavern", label: "Einkehren und rasten (6 Gold)", locs: ["schenke", "gasthaus"], steps: 3, flag: "tavern", gold: 6, npcs: ["marktfrau", "jorun"] },
  { id: "redDoor", label: "Hinter die rote Tür (8 Gold)", locs: ["bordell"], steps: 1, flag: "redDoor", gold: 8 },
  { id: "stille", label: "Stille am Baum", locs: ["alter_baum"], steps: 1, flag: "pray" }
];
function dailyActionsHere() { return DAILY_ACTIONS.filter((a) => a.locs.includes(state.location) && !a.npcs); }
let dailyViaNpc = false;
function dailyBlocked(a) {
  if (state.narrator || (state.dialogue && !dailyViaNpc) || state.inCombat || state.trading) return "Gerade nicht.";
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
    state.hero.hp = maxHp(); onRest();  // Rasten gibt es nur noch beim Gastwirt
    line = "Ein Krug, ein Bett, ein warmer Platz. Ihr schlaft und kommt wieder zu Kräften.";
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
// Tagesaktionen über NPCs: Gesprächsoption „daily:<id>“; das Gespräch bleibt offen.
TALK_HOOKS_LATE.push((npc, c) => {
  DAILY_ACTIONS.filter((a) => a.npcs && a.npcs.includes(npc.id) && a.locs.includes(state.location)).forEach((a) => {
    dailyViaNpc = true; const why = dailyBlocked(a); dailyViaNpc = false;
    if (!why) c.push({ label: a.label, go: "daily:" + a.id });
  });
});
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
// Wochentag + Tagesablauf (Spec 14.10.): NPCs mit schedule sind dort, wo ihr Plan sie hinstellt (Wochentag vor default, je Phase); ohne Ort = nicht da.
function weekday(day) { return D.WEEKDAYS[((((day || 1) - 1) % 7) + 7) % 7]; }
function weekdayLabel(day) { const w = weekday(day); return w.name + ", Tag " + (day || 1) + (w.rest ? " (Ruhetag)" : ""); }
function npcLocationNow(n, day, phase) {
  if (!n) return null;
  if (!n.schedule) return n.location;
  const w = n.schedule[weekday(day).id];
  const t = w && phase in w ? w : n.schedule.default || {};
  return t[phase] || null;
}
function npcHere(n, loc, phase) { return !!n && (n.schedule ? npcLocationNow(n, state.day, phase || state.phase) === (loc || state.location) : n.location === (loc || state.location) && (!n.hours || n.hours.includes(phase || state.phase))); }
function npcAvailableNow(id) { const n = D.NPCs[id]; return npcHere(n) && !(state.npcEnd && state.npcEnd[id]); }
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
    "<div class='card' data-tip='' data-vtip='titel'><b>Titel</b> " + esc(titel()) + "<div class='tiny'>" + esc(KORR_TEXT[korrTier().id]) + "</div></div>" +
    "<div class='card' data-tip='' data-vtip='wille'><b>Wille</b> " + willTierName(we) + " <span class='vnum'>" + we + "</span>" + dbg(gw > 3 ? "Ausr. +" + gw + " wirksam +3" : "") + "</div>" +
    "<div class='card' data-tip='' data-vtip='wk'><b>Willenskraft</b> <span class='vnum'>" + v.wk + " / " + wm + "</span><div class='bar wk'><i style='width:" + pct + "%'></i></div></div>" +
    "<div class='card' data-tip='' data-vtip='korr'><b>Korruption</b> " + korrTier().name + " <span class='vnum'>" + v.korr + "</span><div class='tiny'>Höchststand " + v.korrPeak + " · Buße " + v.buss + "</div></div>" +
    "<div class='card' data-tip='' data-vtip='haltung'><b>Haltung</b> " + haltungTier().name + " <span class='vnum'>" + v.haltung + "</span></div>" +
    (typeof defenseHtml === "function" ? defenseHtml() : "");
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
function npcPresent(id, loc, phase) { const n = D.NPCs[npcId(id)]; if (!n || (state.npcEnd && state.npcEnd[n.id])) return false; return npcHere(n, loc, phase); }
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
  if (typeof emitDelta === "function") emitDelta({ kind: "bond", key: id, npc: id, delta: state.bonds[id] - cur, value: state.bonds[id], source: src, rang: bondLabel(cur) !== bondLabel(state.bonds[id]) ? bondLabel(state.bonds[id]) : undefined });
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
function sysTalkChoices(npc, choices) { TALK_HOOKS.concat(TALK_HOOKS_LATE).forEach((fn) => { try { fn(npc, choices); } catch (e) { console.error(e); } }); }
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
CHOOSE_HOOKS.daily = (go, npc) => {
  const id = go.split(":")[1], a = DAILY_ACTIONS.find((x) => x.id === id);
  if (!a || !a.npcs || !npc || !a.npcs.includes(npc.id)) return "";
  const n0 = state.log.length && state.log[0], d0 = state.daily[a.flag];
  dailyViaNpc = true; try { doDaily(id); } finally { dailyViaNpc = false; }
  return !d0 && state.daily[a.flag] ? state.log[0] : (n0 && "Heute nicht mehr.");
};
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
  if (typeof emitDelta === "function" && !opts.lean && (axis === "gunst" || axis === "zorn") && real) { const net = axisNet(id), was = net - (axis === "gunst" ? real : -real), rs = tierOf(RUF_STUFEN, net); emitDelta({ kind: "ruf", key: id, delta: net - was, source: opts.source, rang: tierOf(RUF_STUFEN, was) !== rs ? rs.name : undefined }); }
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

// =====================================================================
// Stufe d · Grad, Zeichen, Kampf, Gegner (grad-zeichen-kampf.md Rev. g/h)
// =====================================================================
const GROWTH_KEYS = ["atk", "def", "will", "fortune"];
function gradState() { if (!state.grad) state.grad = { statStart: {}, statPeak: {}, pending: null, nachhol: 0, pfad: {}, questGift: {}, declined: [] }; return state.grad; }
function wachstum() {
  const g = gradState(); let sum = 0;
  GROWTH_KEYS.forEach((k) => { const d = Math.max(0, (g.statPeak[k] || 0) - (g.statStart[k] || 0)); sum += k === "fortune" ? Math.floor(d / 2) : d; });
  return sum;
}
function gradFor(w) { let n = 1; D.GRAD_STUFEN.forEach((s) => { if (w >= s.min) n = s.grad; }); return n; }
function gradName(n) { return (D.GRAD_STUFEN.find((s) => s.grad === n) || D.GRAD_STUFEN[0]).name; }
function zeichenSlots() { const l = state.hero.level || 1; return l >= 5 ? 4 : l >= 3 ? 3 : 2; }
// Nach jedem Grundwert-Anstieg: Höchststand nachführen, Grad prüfen (+4 Leben, eine offene Wahl, nie zwei).
function trackPeak() {
  if (!state || !state.grad) return;
  const g = state.grad;
  GROWTH_KEYS.forEach((k) => { g.statPeak[k] = Math.max(g.statPeak[k] || 0, state.hero[k] || 0); });
  const target = gradFor(wachstum());
  while ((state.hero.level || 1) < target) {
    state.hero.level += 1; state.hero.hpMax += 4; state.hero.hp = Math.min(maxHp(), state.hero.hp + 4);
    if (state.hero.level === 4 || state.hero.level === 7) { state.hero.apMax = (state.hero.apMax || 2) + 1; }
    if (!g.pending) g.pending = { grad: state.hero.level, offers: gradOffers() };
    log("Grad steigt auf " + state.hero.level + " (" + gradName(state.hero.level) + ").");
  }
}
function gradOffers() { return typeof gradPerkOffers === "function" ? gradPerkOffers() : []; }
// Wahl: Richtung (Mal M1–M4, Stufe 1/2/3) oder Perk aus den Angeboten.
function chooseGradUp(kind, id) {
  const g = gradState(); if (!g.pending) return false;
  if (kind === "pfad") {
    const cur = g.pfad[id] || 0;
    if (!(id in D.PFAD_ZEICHEN) || cur >= 3) return false;
    if (cur === 2 && (state.hero.level < 4 || (state.act || 1) < 2)) return false;  // Stufe 3 erst ab Grad 4 und Act 2
    const distinct = Object.keys(g.pfad).filter((p) => g.pfad[p] > 0);
    if (!cur && distinct.length >= 2 && (state.act || 1) < 2) return false;     // Act 1: höchstens 2 Richtungen
    g.pfad[id] = cur + 1;
    const z = D.PFAD_ZEICHEN[id][cur]; if (z) learnZeichen(z);
    if (typeof grantPerk === "function") grantPerk("mal", "mal_des_" + { krieger: "kriegers", magier: "magiers", dieb: "diebes", diplomat: "diplomaten" }[id], { quelle: "grad", stufe: g.pfad[id] });
  } else if (kind === "perk") {
    if (!(g.pending.offers || []).includes(id) || typeof grantPerkById !== "function") return false;
    grantPerkById(id, { quelle: "grad" });
    (g.pending.offers || []).filter((x) => x !== id).forEach((x) => g.declined.push(x));
  } else return false;
  g.pending = null;
  if (g.nachhol > 0) { g.nachhol -= 1; g.pending = { grad: state.hero.level, offers: gradOffers(), nachhol: true }; }
  persist(); render(); if (sheet) paintSheet();
  return true;
}
function zState() { if (!state.zeichen) state.zeichen = { learned: {}, slots: [] }; return state.zeichen; }
function learnZeichen(id) {
  const z = zState(); if (!D.ZEICHEN[id] || z.learned[id]) return;
  z.learned[id] = { lvl: 1, xp: 0, day: 0, dayXp: 0 };
  if (z.slots.filter(Boolean).length < zeichenSlots()) z.slots.push(id);
  log("Neues Zeichen: " + D.ZEICHEN[id].name + ".");
}
function equipZeichen(id) {
  if (state.inCombat) return;
  const z = zState(); if (!z.learned[id]) return;
  if (z.slots.includes(id)) z.slots = z.slots.filter((x) => x !== id);
  else if (z.slots.length < zeichenSlots()) z.slots.push(id);
  persist(); paintSheet(); render();
}
const ZEICHEN_NEED = [0, 5, 8, 12, 17];
function zeichenXp(id) {
  const l = zState().learned[id]; if (!l || l.lvl >= 5) return;
  if (l.day !== state.day) { l.day = state.day; l.dayXp = 0; }
  if (l.dayXp >= 3) return;
  l.dayXp += 1; l.xp += 1;
  if (l.xp >= ZEICHEN_NEED[l.lvl]) { l.xp = 0; l.lvl += 1; log(D.ZEICHEN[id].name + " steigt auf Stufe " + l.lvl + "."); }
}
// ---- Kampfwerte ----
function weaponOf(slot) { const it = D.ITEMS[state.equipped && state.equipped[slot]]; return it && it.type === "waffe" ? it : null; }
function heroSpeed() {
  const a = weaponOf("waffeL"), b = weaponOf("schild");  // Nebenhand-Waffe zählt wie früher Waffe rechts
  if (a && b) return ((a.speed || 2.0) + (b.speed || 2.0)) / 2;
  return (a && a.speed) || (b && b.speed) || 2.0;
}
function gearAtkCombat() {
  const pfadK = (gradState().pfad.krieger || 0) >= 3 ? 0.75 : 0.5;
  let sum = 0;
  Object.keys(state.equipped || {}).forEach((sl) => { const it = D.ITEMS[state.equipped[sl]]; if (!it || !it.atk) return; sum += sl === "schild" && weaponOf("schild") && weaponOf("waffeL") ? Math.floor(it.atk * pfadK) : it.atk; });
  return sum;
}
function critChance(extra) {
  const w = weaponOf("waffeL");
  const cap = (gradState().pfad.dieb || 0) >= 3 ? 40 : 35;
  return Math.min(cap, (state.hero.crit || 0) + ((w && w.crit) || 0) + Math.floor(((state.hero.fortune || 0) + perkStat("fortune")) / 10) + perkStat("crit") + (extra || 0));
}
function perkFxNum(k, sub) { return typeof perkFx === "function" ? perkFx(k, sub) : 0; }
function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
// Schaden des Helden mit Mindestschaden 20 %; Krit ×1,5 (mind. +1). pct = Zeichen-Faktor.
function heroHit(c, pct, critBonus) {
  const tot = atkEff() + gearAtkCombat();
  const w = weaponOf("waffeL");
  const wurf = w && w.dmgMax ? rnd(0, w.dmgMax - w.dmgMin) : rnd(0, 2);
  const vs = gearFx("vsMonster", c.id) + (c.wild || (c.tags || []).includes("wild") ? perkFxNum("vsTag", "wild") : 0);
  let dmg = Math.max(Math.ceil(0.2 * tot), tot + vs - (c.def || 0) + wurf, 1);
  if (c.weaponHalf) dmg = Math.max(1, Math.floor(dmg / 2));
  if (c.armored && dmg < 3) dmg = 1;
  dmg = Math.max(1, Math.round(dmg * (pct || 1)));
  if (Math.random() * 100 < critChance(critBonus)) { dmg = Math.max(dmg + 1, Math.floor(dmg * 1.5)); c.lastCrit = true; } else c.lastCrit = false;
  return dmg;
}
function foeHit(c) {
  const armor = defEff() + gearBonus("def") + (c.eisenhaut && c.eisenhaut.left > 0 ? c.eisenhaut.amt : 0);
  let dmg = Math.max(Math.ceil(0.3 * c.atk), c.atk - armor + rnd(0, c.var === undefined ? 1 : c.var));
  if (Math.random() * 100 < (c.crit || 0)) dmg = Math.floor(dmg * 1.5);
  if (c.eisenhaut && c.eisenhaut.left > 0) c.eisenhaut.left -= 1;
  return Math.max(1, dmg);
}
function startCombatSys(id) {
  const proto = D.MONSTER[id];
  if (!proto) return false;
  if (proto.unique && state.flags["cleared_" + id]) return false;  // Unikate fail-closed
  if (proto.id === "russwolf" && (state.flags.wolf_dealt || state.flags.wolf_spared || state.flags.wolf_bargain)) return false;
  state.inCombat = true;
  state.combat = { ...proto, hp: proto.hp, hpMax: proto.hp, engaged: false, log: [], t: 0, nextHero: 0, nextFoe: proto.speed || 2.0, ticks: 0, lastFlee: -99,
    ap: state.hero.apMax || 2, cd: {}, used: {}, dots: [], stun: 0, slow: null, eisenhaut: null, foeHits: 0, heroHits: 0, seed: Math.floor(Math.random() * 1e9) };
  lastTalk = null;
  log(proto.name + " steht im Weg.");
  return true;
}
function addDot(c, kind, per, left) {
  const ex = c.dots.find((d) => d.kind === kind);
  if (ex) { ex.left = left; return; }
  if (c.dots.length >= 2) return;
  c.dots.push({ kind, per, left });
}
// Zeichen-Auswahl im Autobattle: Slot-Reihenfolge, bereit und genug Atem.
function pickZeichen(c) {
  const z = zState();
  for (const id of z.slots) {
    const Z = D.ZEICHEN[id]; if (!Z || !z.learned[id]) continue;
    let cost = Z.ap; if (Z.magic && (gradState().pfad.magier || 0) >= 3) cost = Math.max(1, cost - 1);
    if ((c.cd[id] || 0) > 0 || c.ap < cost) continue;
    if (id === "heilfunke" && state.hero.hp >= maxHp() / 2) continue;
    if (id === "eisenhaut" && c.eisenhaut && c.eisenhaut.left > 0) continue;
    if (id === "wundmal" && state.hero.hp <= 3) continue;
    return { id, cost };
  }
  return null;
}
function useZeichen(c, id, cost) {
  const l = zState().learned[id].lvl, we = willEff(), zp = 1 + perkFxNum("zauberPct") / 100;
  c.ap -= cost; c.cd[id] = D.ZEICHEN[id].cd; c.used[id] = true;
  const name = D.ZEICHEN[id].name;
  let dmg = 0, line = "";
  if (id === "schnellschlag") { const n = l >= 5 ? 3 : 2; for (let i = 0; i < n; i++) dmg += heroHit(c, 0.6 + 0.05 * (l - 1)); line = name + ": " + n + " schnelle Schläge"; }
  else if (id === "eisenhaut") { c.eisenhaut = { amt: l >= 3 ? 3 : 2, left: 4 + (l - 1) }; line = name + ": eure Haut wird hart"; }
  else if (id === "solarplexus") { dmg = heroHit(c, 0.8 + 0.1 * (l - 1)); c.stun = c.unique ? 1 : (l >= 5 ? 2 : 1); line = name; }
  else if (id === "feuerball") { dmg = Math.round((rnd(6, 10) + Math.floor(we / 3) + 2 * (l - 1)) * (zp + perkFxNum("zauberPct", "feuer") / 100)); if (l >= 5) addDot(c, "brand", 2, 2); line = name; }
  else if (id === "froststachel") { dmg = Math.round((rnd(4, 7) + Math.floor(we / 4) + (l - 1)) * zp); c.slow = { pct: l >= 5 ? 40 : 25, left: 3 + (l - 1) }; line = name; }
  else if (id === "heilfunke") { const h = Math.round((rnd(6, 10) + Math.floor(we / 3) + 2 * (l - 1)) * (1 + perkFxNum("heilPct") / 100) * (1 + perkFxNum("healInPct") / 100)); state.hero.hp = Math.min(maxHp(), state.hero.hp + h); line = name + ": +" + h + " Leben"; }
  else if (id === "giftklinge") { addDot(c, "gift", (l >= 5 ? 3 : 2) * (c.id === "thronassel" ? 2 : 1), 4 + (l - 1)); dmg = heroHit(c); line = name; }
  else if (id === "schattenhieb") { const sure = l >= 5 && c.hp < c.hpMax / 2; dmg = heroHit(c, 1.3 + 0.1 * (l - 1), sure ? 100 : 25); line = name; }
  else if (id === "blutung") { const tot = Math.max(4, 1 + Math.floor(c.hpMax * (0.10 + 0.02 * (l - 1)))); addDot(c, "blutung", Math.ceil(tot / 4), 4); line = name; }
  else if (id === "wundmal") { dmg = heroHit(c); const heal = Math.floor(dmg * (0.5 + 0.1 * (l - 1))); state.hero.hp = Math.min(maxHp(), state.hero.hp + heal - (l >= 5 ? 0 : 2)); line = name + ": +" + heal + " Leben"; }
  return { dmg, line };
}
function combatLine(c, line) { c.log.push(line); log(line); }
function heroSwing(c) {
  c.heroHits += 1;
  Object.keys(c.cd).forEach((k) => { if (c.cd[k] > 0) c.cd[k] -= 1; });
  let dmg = 0, line = "";
  const z = pickZeichen(c);
  c.fxHero = z ? (ZEICHEN_FX[z.id] || "schwert") : weaponFx();
  if (z) { const r = useZeichen(c, z.id, z.cost); dmg = r.dmg; line = r.line + (dmg ? " (" + dmg + ")" : "") + "."; c.lastMagic = !!D.ZEICHEN[z.id].magic; }
  else { dmg = heroHit(c); if (c.lastCrit) c.fxHero = "blitz"; line = "Ihr trefft " + c.name + " (" + dmg + ")" + (c.lastCrit ? ", ein harter Treffer" : "") + "."; c.lastMagic = false; }
  // Schaden über Zeit
  c.dots.forEach((d) => { dmg += d.per; d.left -= 1; });
  c.dots = c.dots.filter((d) => d.left > 0);
  c.hp -= dmg;
  const ls = perkFxNum("lifesteal");
  if (ls > 0 && dmg >= 4) state.hero.hp = Math.min(maxHp(), state.hero.hp + Math.max(1, Math.floor(dmg * ls / 100)));
  if (c.reflect && dmg > 0) state.hero.hp -= Math.min(3, Math.max(1, Math.floor(dmg * c.reflect / 100)));
  combatLine(c, line);
}
function foeSwing(c, free) {
  if (!free && c.stun > 0) { c.stun -= 1; combatLine(c, c.name + " ringt nach Luft."); return; }
  let dmg = foeHit(c);
  c.fxFoe = c.human || (c.tags || []).includes("mensch") ? "schwert" : (c.weaponHalf ? "fluch" : "klaue");
  const def = heroDefense(c);  // Ausweichen (0) / Parade (halb, min. 1) nach dem Mindestschaden
  if (def === "dodge") { c.heroDodges = (c.heroDodges || 0) + 1; c.fxFoe = "ausweichen"; combatLine(c, c.name + " schlägt zu, ihr weicht aus."); return; }
  if (def === "parry") { dmg = Math.max(1, Math.floor(dmg / 2)); c.heroParries = (c.heroParries || 0) + 1; }
  state.hero.hp -= dmg; c.foeHits += 1;
  const rf = perkFxNum("reflect");
  if (rf > 0) c.hp -= Math.min(3, Math.max(1, Math.floor(dmg * rf / 100)));
  combatLine(c, def === "parry" ? "Ihr pariert, " + c.name + " trifft nur halb (" + dmg + ")." : c.name + " trifft euch (" + dmg + ").");
  // Zweiter Atem (S9): einmal je Tag bei Leben ≤ 25 %
  const za = perkFxNum("zweiterAtem");
  if (za > 0 && state.hero.hp > 0 && state.hero.hp <= maxHp() / 4 && state.daily.zweiterAtem !== state.day) {
    state.daily.zweiterAtem = state.day; const h = Math.round(maxHp() * za / 100); state.hero.hp = Math.min(maxHp(), state.hero.hp + h); combatLine(c, "Zweiter Atem: +" + h + " Leben.");
  }
}
function foeSpeed(c) {
  let sp = (c.speed2 && c.hp < c.hpMax / 2) ? c.speed2 : (c.speed || 2.0);
  if (c.slow && c.slow.left > 0) { sp = sp / (1 - Math.min(40, c.slow.pct) / 100); c.slow.left -= 1; }
  return sp;
}
function sysTick() {
  const c = state.combat;
  if (!c || !c.engaged) return;
  c.ticks += 1; c.t = Math.round((c.t + 0.4) * 10) / 10;
  let guard = 0;
  while (guard++ < 8 && state.combat === c) {
    const heroDue = c.t >= c.nextHero, foeDue = c.t >= c.nextFoe;
    if (!heroDue && !foeDue) break;
    if (heroDue && (!foeDue || c.nextHero <= c.nextFoe)) {
      heroSwing(c); c.nextHero += heroSpeed();
      if (c.hp <= 0) return combatVictory(c);
    } else {
      foeSwing(c); c.nextFoe += foeSpeed(c);
      if (c.hp <= 0) return combatVictory(c);
      if (state.hero.hp <= 0) return combatDefeat(c);
    }
  }
  persist(); render();
}
function stopTimer() { if (battleTimer) { clearInterval(battleTimer); battleTimer = null; } }
function combatXp(key, n) {
  const room = Math.max(0, 8 - (state.daily.kampfXp || 0));
  const x = Math.min(room, n); if (x <= 0) return 0;
  state.daily.kampfXp = (state.daily.kampfXp || 0) + x; gain(key, x); return x;
}
function combatVictory(c) {
  stopTimer();
  const gold = c.gold[0] + Math.floor(Math.random() * (c.gold[1] - c.gold[0] + 1));
  state.hero.gold += gold;
  const loot = [];
  (c.loot || []).forEach((id) => { if (D.ITEMS[id]) { state.inventory.push(id); loot.push(D.ITEMS[id].name); } });
  Object.keys(c.lootChance || {}).forEach((id) => { if (D.ITEMS[id] && Math.random() * 100 < c.lootChance[id]) { state.inventory.push(id); loot.push(D.ITEMS[id].name); } });
  if (c.id === "russwolf") {  // nur der Quest-Wolf setzt Wolf-Flags
    state.flags.wolf_tot = true; state.flags.wolf_slain = true; state.flags.cleared_russwolf = true;
    if (!state.flags.wolf_dealt) { state.flags.wolf_dealt = true; state.flags.sim_bonds_wolf_settled = true; }
    state.pendingNarrator = { ...D.NARRATOR.wolf_tot };
    // Male sind besonders: nur ein künftiger legendärer Wolf (Flag wolf_legendaer, noch nicht im Spiel) gibt das Wolfstöter-Mal.
    if (wolfMalErlaubt(c) && typeof grantPerk === "function") grantPerk("mal", "mal_des_wolfstoeters", { quelle: "story" });
  }
  if (c.unique || c.quest) state.flags["cleared_" + c.id] = true;
  const xp = [];
  const a = combatXp("atk", 2); if (a) xp.push("Angriff +" + a);
  if (c.foeHits >= 3) { const d = combatXp("def", 2); if (d) xp.push("Panzer +" + d); }
  if (c.lastMagic && (gradState().pfad.magier || 0) > 0) { const w = combatXp("will", 1); if (w) xp.push("Wille +" + w); }
  Object.keys(c.used).forEach(zeichenXp);
  state.inCombat = false; state.combat = null;
  log(c.name + " fällt. +" + gold + " Gold.");
  const text = c.name + " fällt.\nGold: +" + gold + (loot.length ? "\nBeute: " + loot.join(", ") : "") + (xp.length ? "\nÜbung: " + xp.join(", ") : "") +
    (Object.keys(c.used).length ? "\nZeichen geübt: " + Object.keys(c.used).map((z) => D.ZEICHEN[z].name).join(", ") : "") + "\nDer Weg ist frei.";
  lastTalk = null;
  showFace({ id: c.id, name: c.name, title: "Besiegt", art: "monsters/" + (c.art ? c.art.split("/").pop().replace(".jpg", "") : c.id) + "_tot.jpg" });
  showLine(text, [{ label: "Weiter", go: "clear" }]);
  persist(); render();
  showFace({ id: c.id, name: c.name, title: "Besiegt", art: "monsters/" + (c.art ? c.art.split("/").pop().replace(".jpg", "") : c.id) + "_tot.jpg" });
  showLine(text, [{ label: "Weiter", go: "clear" }]);
}
function wolfMalErlaubt(c) { return !!(c && c.legendary && state.flags.wolf_legendaer); }
// Ausbesserung 2: kein Ergeben mehr. Ein besiegter Gegner ist tot; alte Aufrufe enden als Sieg.
function combatSurrender(c) { c.surrendered = false; c.hp = 0; return combatVictory(c); }
// Alt (bis v9): Ergebener Mensch. Jeder Ausgang zählt jetzt als Tötung (Sieg mit Beute), Wahl entfällt.
CHOOSE_HOOKS.ergeben = (go) => {
  const c = state.combat; if (!c || !c.surrendered) return false;
  combatSurrender(c); return true;
  const art = go.split(":")[1];
  let line = "";
  if (art === "laufen") line = "Ihr lasst ihn laufen. Er verschwindet zwischen den Büschen.";
  else if (art === "rauben") { const g = rnd(5, 10); state.hero.gold += g; applyChoiceEffects({ grad: "soft", richtung: "yield", origin: "player", tag: "ausgeraubt" }); line = "Ihr nehmt ihm den Beutel ab. +" + g + " Gold."; }
  else if (art === "gnade") { applyChoiceEffects({ grad: "medium", richtung: "yield", origin: "player", tag: "gnadenstoss", effects: { korr: 2, haltung: 2 } }); state.hero.gold += c.gold[0]; line = "Ihr beendet es. Es ist still danach."; }
  state.inCombat = false; state.combat = null; combatXp("atk", 2);
  lastTalk = null; persist(); render(); showFace(null); showLine(line, [{ label: "Weiter", go: "clear" }]);
  return true;
};
const SAFE_WAKE = { stadt: "platz", vorstadt: "dorfzentrum", unterorten: "dorfzentrum", duesterwald: "dorfzentrum" };
function combatDefeat(c) {
  if (c.id === "russwolf") { stopTimer(); wolfDefeat(); afterDefeat(c); return; }
  stopTimer();
  const blows = c.log.slice(-6).join("\n");
  state.hero.hp = Math.max(4, Math.floor(state.hero.hpMax / 3));
  state.inCombat = false; state.combat = null;
  let lost = 0;
  if (c.human) { lost = Math.min(30, Math.floor(state.hero.gold * 0.15)); state.hero.gold -= lost; }
  const reg = D.LOCATIONS[state.location] && D.LOCATIONS[state.location].region;
  state.location = SAFE_WAKE[reg] || "dorfzentrum";
  advance(2);
  afterDefeat(c);
  log("Ihr fallt und kommt in " + D.LOCATIONS[state.location].name + " wieder zu euch.");
  lastTalk = null;
  persist(); autosave(); render(); showFace(null);
  showLine("Ihr fallt.\nIhr kommt in " + D.LOCATIONS[state.location].name + " wieder zu euch." + (lost ? " Euer Beutel ist um " + lost + " Gold leichter." : "") + " Ihr seid angeschlagen.", [{ label: "Weiter", go: "clear" }]);
}
function afterDefeat(c) {
  state.buffs = (state.buffs || []).filter((b) => b.id !== "angeschlagen");
  state.buffs.push({ id: "angeschlagen", name: "Angeschlagen", mods: { atk: -1, def: -1 }, until: "rast" });
  if (state.values) bumpWk(-10);
  state.daily.zufall = 3;  // Spawn-Schutz bis Tageswechsel
  const w = state.world; w.defeats = (w.defeats || []).filter((d) => d >= state.day - 6).concat([state.day]);
}
function sysFlee() {
  const c = state.combat; if (!c || c.surrendered) return;
  if (c.engaged && c.ticks - c.lastFlee < 3) { c.note = "Noch keine Lücke."; render(); return; }
  c.lastFlee = c.ticks;
  const fleePct = clamp(gearFx("fleePct") + perkFxNum("fleePct"), -15, 15) / 100;
  const dieb = (gradState().pfad.dieb || 0) > 0 ? 0.05 : 0;
  const chance = clamp(0.45 + willEff() * 0.03 + fleePct + dieb - (c.unique ? 0.15 : 0), 0.1, 0.9);
  if (Math.random() < chance) {
    stopTimer(); state.inCombat = false; state.combat = null;
    if (c.id === "thronassel") state.daily.zufall = (state.daily.zufall || 0) + 1;
    log("Ihr entgleitet."); lastTalk = null; showFace(null); showLine("Ihr entgleitet. Der Schlag geht vorbei.", [{ label: "Weiter", go: "clear" }]);
  } else {
    c.note = "Der Weg bleibt versperrt.";
    foeSwing(c, true);  // Erstschlag des Gegners
    if (state.hero.hp <= 0) { combatDefeat(c); return; }
    c.engaged = true; if (!battleTimer) battleTimer = setInterval(tick, 400);
  }
  persist(); render();
}
// Zufallsbegegnungen (nur SPAWN_TABLES, nie in Stadt/Dorf), Tagesdeckel 3.
function rollSpawn(locId) {
  const t = D.SPAWN_TABLES[locId]; if (!t || state.inCombat) return null;
  if (t.after && !state.flags[t.after]) return null;
  if ((state.daily.zufall || 0) >= 3) return null;
  const pi = ["abend"].includes(state.phase) ? 1 : state.phase === "nacht" ? 2 : 0;
  const safe = Math.min(30, gearFx("travelSafePct") + perkFxNum("travelSafePct", D.LOCATIONS[locId].region) + perkFxNum("travelSafePct", locId));
  const chance = t.chance[pi] * (1 - safe / 100);
  if (Math.random() * 100 >= chance) return null;
  const pakt = state.flags.wolf_spared || state.flags.wolf_bargain;
  const rows = t.rows.filter((r) => !(r.wolf && pakt)).filter((r) => !(D.MONSTER[r.id].unique && state.flags["cleared_" + r.id]));
  const sum = rows.reduce((s, r) => s + r.w, 0); if (!sum) return null;
  let x = Math.random() * sum; const row = rows.find((r) => (x -= r.w) < 0) || rows[0];
  state.daily.zufall = (state.daily.zufall || 0) + 1;
  return row.id;
}
function nebelpfadBlocked() { return false; }  // jeder Wolf-Ausgang öffnet den Pfad (Rev. g); einzige Quelle
// Jagen: garantierte Begegnung an Wildorten, 1 Phase, zählt zum Deckel.
SCENE_EXTRAS.push(() => {
  const t = D.SPAWN_TABLES[state.location]; if (!t || (t.after && !state.flags[t.after])) return [];
  return [{ label: "Jagen", go: "jagen", why: (state.daily.zufall || 0) >= 3 ? "Für heute genug." : "" }];
});
SCENE_HANDLERS.jagen = () => {
  const t = D.SPAWN_TABLES[state.location]; if ((state.daily.zufall || 0) >= 3) return "";
  const pakt = state.flags.wolf_spared || state.flags.wolf_bargain;
  const rows = t.rows.filter((r) => !(r.wolf && pakt)); if (!rows.length) return "";
  state.daily.zufall = (state.daily.zufall || 0) + 1; advance(1);
  startCombatSys(rows[Math.floor(Math.random() * rows.length)].id); persist(); render(); return "";
};
// Migration v5 -> v6: Grad aus Wachstum, statStart (BASE + Herkunft + alte Fluch-mods), Nachhol-Wahlen, Atem.
function migV6(s) {
  const prev = state; state = s;
  try {
    const h = s.hero, g = gradState();
    if (!Object.keys(g.statStart).length) {
      const H = h.startMods ? { mods: h.startMods } : (D.HERKUENFTE[h.herkunftId] || {}), F = D.FLUECHE[h.fluchId] || {};
      GROWTH_KEYS.forEach((k) => { g.statStart[k] = (D.BASE_HERO[k] || 0) + ((H.mods || {})[k] || 0) + ((F.mods || {})[k] || 0); g.statPeak[k] = Math.max(g.statStart[k], h[k] || 0); });
      const old = h.level || 1, calc = gradFor(wachstum());
      h.level = Math.max(old, calc);
      if (h.level > 1 && !Object.keys(g.pfad).length) { g.pending = { grad: h.level, offers: [], nachhol: true }; g.nachhol = Math.max(0, h.level - 2); }
    }
    if (typeof h.apMax !== "number") h.apMax = 2;
    zState();
    if (s.combat) { const p = D.MONSTER[s.combat.id] || {}; s.combat = { ...p, ...s.combat, t: s.combat.t || 0, nextHero: s.combat.nextHero || 0, nextFoe: s.combat.nextFoe || p.speed || 2, ticks: s.combat.ticks || 0, lastFlee: -99, ap: s.combat.ap || h.apMax, cd: s.combat.cd || {}, used: s.combat.used || {}, dots: s.combat.dots || [], foeHits: s.combat.foeHits || 0, heroHits: s.combat.heroHits || 0 }; }
  } finally { state = prev; }
  return s;
}
function gradPanelHtml() {
  const g = gradState(), w = wachstum(), lvl = state.hero.level;
  const next = D.GRAD_STUFEN.find((s) => s.grad === lvl + 1);
  let html = "<h3>Grad</h3><div class='card'><b>Grad " + lvl + "</b> · " + gradName(lvl) + dbg("Wachstum " + w) +
    "<div class='tiny'>" + (next ? "Bis " + next.name + ": noch " + (next.min - w) + " Wachstum" + (lvl >= 7 ? ". Weiteres Wachstum nur noch über Glück." : "") : "Höchster Grad erreicht.") + "</div>" +
    "<div class='tiny'>" + GROWTH_KEYS.map((k) => ({ atk: "Angriff", def: "Panzer", will: "Wille", fortune: "Glück" }[k]) + " " + (state.hero[k] || 0) + (g.statPeak[k] > (state.hero[k] || 0) ? " (Höchststand " + g.statPeak[k] + ")" : "")).join(" · ") + "</div></div>";
  if (g.pending) {
    html += "<div class='card'><b>Grad steigt – eure Wahl</b><div class='tiny'>Die Wahl kann warten, aber es bleibt nur eine offen.</div><div class='choice-grid'>" +
      ["krieger", "magier", "dieb", "diplomat"].map((p) => "<button data-grad='pfad:" + p + "'>" + D.RICHTUNGEN[p].name + " · Stufe " + ((g.pfad[p] || 0) + 1) + "</button>").join("") +
      (g.pending.offers || []).map((id) => "<button data-grad='perk:" + id + "'>" + esc(typeof perkName === "function" ? perkName(id) : id) + "</button>").join("") + "</div></div>";
  }
  return html;
}
function zeichenSheetHtml() {
  const z = zState(), n = zeichenSlots();
  let html = "<h3>Angelegt (" + z.slots.length + "/" + n + ")</h3><div class='zeichen-row'>";
  for (let i = 0; i < 4; i++) {
    const id = z.slots[i];
    if (i >= n) html += "<div class='z-slot locked' title='ab Grad " + (i === 2 ? 3 : 5) + "'>Grad " + (i === 2 ? 3 : 5) + "</div>";
    else if (id) html += "<button class='z-slot' data-zeichen='" + id + "' style=\"background-image:url('" + art(D.ZEICHEN[id].art) + "')\">" + esc(D.ZEICHEN[id].name) + "</button>";
    else html += "<div class='z-slot leer'>frei</div>";
  }
  html += "</div><h3>Gelernt</h3>";
  const ids = Object.keys(z.learned);
  html += ids.length ? ids.map((id) => { const Z = D.ZEICHEN[id], l = z.learned[id]; return "<div class='card perk'><b>" + esc(Z.name) + "</b> · Stufe " + l.lvl + " · Atem " + Z.ap + "<div class='tiny'>" + esc(Z.text) + "</div><button data-zeichen='" + id + "'>" + (z.slots.includes(id) ? "Ablegen" : "Anlegen") + "</button></div>"; }).join("")
    : "<p class='tiny'>Noch keine Zeichen. Ein Grad-Aufstieg mit Richtung Eisenwacht, Glutweber oder Nebelhand öffnet das erste.</p>";
  return html;
}
function bagZeichenHtml() {
  const z = zState(), n = zeichenSlots(); let html = "<div class='zeichen-row' id='bag-zeichen'>";
  for (let i = 0; i < n; i++) { const id = z.slots[i]; html += id ? "<div class='z-slot' title='" + esc(D.ZEICHEN[id].name) + "' style=\"background-image:url('" + art(D.ZEICHEN[id].art) + "')\">" + esc(D.ZEICHEN[id].name) + "</div>" : "<div class='z-slot leer'>Zeichen</div>"; }
  return html + "</div>";
}
function wireSheet(body) {
  body.querySelectorAll("[data-zeichen]").forEach((b) => { b.onclick = () => equipZeichen(b.dataset.zeichen); });
  body.querySelectorAll("[data-grad]").forEach((b) => { b.onclick = () => { const [k, id] = b.dataset.grad.split(":"); chooseGradUp(k, id); }; });
}
STATS_MORE.unshift(gradPanelHtml);

// =====================================================================
// Stufe e · Male, Flüche, Segen (male-fluche-segen.md, fx gzk §12.4)
// =====================================================================
const PERK_GROUP = { mal: "male", fluch: "flueche", segen: "segen" };
function perkState() { if (!state.perks) state.perks = { male: [], flueche: [], segen: [], migrated: false }; return state.perks; }
function perkList(all) {
  if (!state || !state.perks) return [];
  const p = state.perks; return [].concat(p.male, p.flueche, p.segen).filter((e) => all || !e.ruht);
}
function perkEntry(id) { return perkList(true).find((e) => e.id === id) || null; }
function perkName(id) { return (D.PERKS[id] && D.PERKS[id].name) || id; }
// fx einer Stufe; migrierte (baked) Einträge liefern nur die laufende Wirkung (reflect, lifesteal).
function perkStageFx(e) {
  const P = D.PERKS[e.id]; if (!P) return {};
  if (e.baked) return P.migFx || {};
  return P.stufen[Math.min(P.stufen.length, e.stufe || 1) - 1] || {};
}
// Stapelregel: je fx-Art stärkster voll, zweiter halb (1 Nachkommastelle), nur innerhalb gleichen Vorzeichens; dann summieren.
function perkFx(key, sub) {
  const vals = [];
  perkList().forEach((e) => { const fx = perkStageFx(e); let v = fx[key]; if (v && typeof v === "object") v = sub !== undefined ? v[sub] : 0; if (typeof v === "number" && v) vals.push(v); });
  const side = (arr) => { arr.sort((a, b) => Math.abs(b) - Math.abs(a)); return (arr[0] || 0) + Math.round(((arr[1] || 0) / 2) * 10) / 10; };
  return side(vals.filter((v) => v > 0)) + side(vals.filter((v) => v < 0));
}
// Flache Werte (atk, def, will, hp, crit, fortune, …) stapeln normal; atk/def/will werden beim Lesen auf +3 gedeckelt.
function perkMod(key) {
  if (!state || !state.perks) return 0;
  if (["fleePct", "travelSafePct", "tradePct", "zauberPct", "heilPct", "reflect", "lifesteal", "regenPct", "healInPct"].includes(key)) return perkFx(key);
  return perkList().reduce((s, e) => { const v = perkStageFx(e)[key]; return s + (typeof v === "number" ? v : 0); }, 0);
}
function perkTradePct(npc) {
  if (!npc || !state.perks) return 0;
  const targets = ["alle"]; if (npc.faction) targets.push(npc.faction); if (npc.id) targets.push(npc.id);
  if (npc.location === "schmied") targets.push("schmied");
  return targets.reduce((s, t) => s + perkFx("tradePct", t), 0);
}
function syncPerkFlags() {
  const f = state.flags;
  Object.keys(D.PERKS).forEach((id) => {
    const e = perkEntry(id);
    if (f["perk_" + id] && !e) f["perk_" + id + "_gehabt"] = true;
    f["perk_" + id] = !!e && !e.ruht; f["perk_" + id + "_s2"] = !!e && (e.stufe || 1) >= 2; f["perk_" + id + "_s3"] = !!e && (e.stufe || 1) >= 3;
  });
}
function slotsUsed(group) { return perkState()[group].filter((e) => !e.migriert && !e.ruht).length; }
// Prüft, ob ein Perk erworben werden kann. Liefert "" oder den Grund.
function perkBlocked(id, opts) {
  const P = D.PERKS[id]; if (!P) return "Unbekannt.";
  opts = opts || {};
  const own = perkEntry(id);
  const ex = (P.exklusiv || []).concat(Object.keys(D.PERKS).filter((k) => (D.PERKS[k].exklusiv || []).includes(id)));
  const clash = ex.find((x) => { const e = perkEntry(x); return e && !(e.migriert && x === "fluch_stumme_glocke"); });
  if (clash && !own) return "Verträgt sich nicht mit " + perkName(clash) + ".";
  if (own) return "";  // Doppelerwerb hebt nur die Stufe
  if (P.art === "segen") {
    if (slotsUsed("segen") >= 3) return "Kein Platz mehr für einen Segen.";
    if (P.geber && !P.ortSegen && perkState().segen.some((e) => !e.ruht && D.PERKS[e.id] && D.PERKS[e.id].geber === P.geber)) return "Von dieser Seite tragt ihr schon einen Segen.";
  }
  if (P.art !== "mal" && slotsUsed("flueche") + slotsUsed("segen") >= 5 && P.art === "segen") return "Ihr tragt schon genug.";
  if (opts.npc && !canPlead(opts.npc)) return "Nicht unter Druck.";  // keine Perk-Vergabe bei Erpressung/Abhängigkeit
  return "";
}
// grantPerk: Doppelerwerb = höchste Stufe; volle Fluch-Slots -> der älteste nicht migrierte Fluch ruht.
const FLUCH_MAX = Infinity;  // früher 3 (Spec B 14.10.)
function grantPerkById(id, opts) {
  const P = D.PERKS[id]; if (!P) return false;
  opts = opts || {};
  if (perkBlocked(id, opts)) return false;
  const group = PERK_GROUP[P.art], ps = perkState();
  const max = P.stufen.length; const st = Math.min(max, opts.stufe || 1);
  const own = ps[group].find((e) => e.id === id);
  if (own) { if (st > (own.stufe || 1)) { own.stufe = st; perkLog(P.art, id, "stufe", opts.quelle); } }
  else {
    if (P.art === "fluch" && !opts.migriert && slotsUsed("flueche") >= FLUCH_MAX) {  // Spec B §9: Flüche ohne Maximum
      const old = ps.flueche.find((e) => !e.migriert && !e.ruht); if (old) { old.ruht = true; perkLog("fluch", old.id, "ruht", "slot"); log(perkName(old.id) + " ruht."); }
    }
    const e = { id, quelle: opts.quelle || "story", seit: state.day, stufe: st };
    if (P.sichtbar === "verborgen") e.verborgen = true;
    if (opts.geber) e.geber = opts.geber;
    if (opts.migriert) { e.baked = opts.baked === undefined ? true : opts.baked; e.migriert = true; }
    if (opts.herkunftTag) e.herkunftTag = opts.herkunftTag;
    ps[group].push(e);
    perkLog(P.art, id, "erhalten", opts.quelle);
    if (!opts.migriert) log((P.art === "mal" ? "Ein Mal: " : P.art === "fluch" ? "Ein Fluch: " : "Ein Segen: ") + (e.verborgen ? "etwas Unbekanntes" : P.name) + ".");
  }
  const cur = ps[group].find((e) => e.id === id);
  (P.oeffnetAb && P.oeffnetAb[cur.stufe] || []).forEach(learnZeichen);
  // M6/S3: Wolfstöter entzieht das Gastrecht
  if (id === "mal_des_wolfstoeters") removePerk("segen_waldgastrecht", "entzogen");
  syncPerkFlags(); state.hero.hp = Math.min(state.hero.hp, maxHp());
  return true;
}
function grantPerk(art, id, opts) { return grantPerkById(id, opts); }
function removePerk(id, why) {
  const ps = perkState(); let hit = false;
  Object.keys(ps).forEach((g) => { if (Array.isArray(ps[g])) { const n = ps[g].length; ps[g] = ps[g].filter((e) => e.id !== id || (g === "male")); if (ps[g].length !== n) hit = true; } });
  if (hit) { perkLog(D.PERKS[id].art, id, "verloren", why); log(perkName(id) + (why === "entzogen" ? " wurde entzogen." : " ist von euch genommen.")); syncPerkFlags(); state.hero.hp = Math.min(Math.max(1, state.hero.hp), maxHp()); }
  return hit;
}
function perkLog(art, id, aktion, grund) { if (!state.perkLog) state.perkLog = []; state.perkLog.push({ day: state.day, art, id, aktion, grund: grund || "" }); state.perkLog = state.perkLog.slice(-60); }
// Grad-Angebot: 2 Segen + 1 „guter“ Fluch aus der Grad-Liste, gefiltert; abgelehnte kommen nicht wieder.
function gradPerkOffers() {
  const g = gradState(), pool = Object.keys(D.PERKS).filter((id) => D.PERKS[id].grad && !perkEntry(id) && !(g.declined || []).includes(id) && !perkBlocked(id));
  const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
  return shuffle(pool.filter((id) => D.PERKS[id].art === "segen")).slice(0, 2).concat(shuffle(pool.filter((id) => D.PERKS[id].art === "fluch")).slice(0, 1));
}
// when-Keys für Nebenwege: perkAll, perkAny, perkNone (Hauptpfad darf sie nicht nutzen)
function sysWhenPerk(w) {
  if (w.perkAll && !w.perkAll.every((id) => state.flags["perk_" + id])) return false;
  if (w.perkAny && !w.perkAny.some((id) => state.flags["perk_" + id])) return false;
  if (w.perkNone && w.perkNone.some((id) => state.flags["perk_" + id])) return false;
  return true;
}
// ---- Erwerb im bestehenden Inhalt (Act 1, klein) ----
TALK_HOOKS.push((npc, c) => {
  // S7 „Tamsins Tisch“ nicht mehr erwerbbar: Tamsin ist Jägerin und Gast, die Schenke gehört Maera (Einkehr bleibt bei Maera). Altstände behalten den Segen.
  if (npc.id === "priester" && !perkEntry("segen_der_glocke") && rel("priester").trust >= 40 && state.values.korrPeak <= 39 && !perkBlocked("segen_der_glocke", { npc: "priester" }))
    c.push({ label: "Um den Segen der Glocke bitten", go: "perk:segen_der_glocke" });
  if (npc.id === "priester" && !perkEntry("segen_des_zuhoerens") && (state.values.rufBeichten || 0) >= 3 && !perkBlocked("segen_des_zuhoerens", { npc: "priester" }))
    c.push({ label: "Eld fragen, wie er zuhört", go: "perk:segen_des_zuhoerens" });
  if (npc.id === "enno" && (state.world.ratDienst || 0) >= 3 && !perkEntry("segen_brot_und_dach") && !perkBlocked("segen_brot_und_dach", { npc: "enno" }))
    c.push({ label: "Enno nach einem Platz im Dorf fragen", go: "perk:segen_brot_und_dach" });
  if (npc.id === "hella" && canPlead("hella")) {
    if (!perkEntry("fluch_nebelpreis")) c.push({ label: "Hella um Hilfe bitten (sie nennt einen Preis)", go: "perk:fluch_nebelpreis" });
    else if (state.day - perkEntry("fluch_nebelpreis").seit >= 14) c.push({ label: "Den genannten Preis zahlen (20 Gold)", go: "preis:hella" });
    ["fluch_glasherz", "fluch_blutmond"].forEach((f) => { if (perkEntry(f) && !perkEntry(f).migriert) c.push({ label: perkName(f) + " bei Hella abgeben (eine Erinnerung)", go: "abgeben:" + f }); });
  }
  if (npc.id === "priester") {
    perkState().flueche.filter((e) => e.id !== "fluch_gassenschuld" && e.id !== "fluch_nebelpreis").slice(0, 2).forEach((e) => c.push({ label: perkName(e.id) + " brechen lassen (Bußdienst)", go: "brechen:" + e.id }));
  }
});
const PERK_LINES = {
  segen_der_glocke: "Eld legt die Hand an die Glocke. Sie summt, ohne zu schlagen.",
  segen_des_zuhoerens: "„Hört nicht auf die Worte. Hört, wann sie kommen.“",
  segen_brot_und_dach: "Enno nickt. „Wer mit anpackt, hat hier ein Dach.“",
  fluch_nebelpreis: "Hella legt euch Kräuter auf und sagt einen Preis, leise. Eure Wunden schließen sich."
};
CHOOSE_HOOKS.perk = (go, npc) => {
  const id = go.split(":")[1];
  const why = perkBlocked(id, { npc: npc.id });
  if (why) return why;
  if (id === "fluch_nebelpreis") state.hero.hp = maxHp();
  grantPerkById(id, { quelle: "npc:" + npc.id, geber: npc.id });
  return PERK_LINES[id] || "";
};
CHOOSE_HOOKS.preis = () => { if (state.hero.gold < 20) return "Euer Gold reicht nicht. Hella wartet."; state.hero.gold -= 20; removePerk("fluch_nebelpreis", "geloest"); return "Hella nimmt das Gold und nickt. Der Preis ist bezahlt."; };
CHOOSE_HOOKS.abgeben = (go, npc) => { const id = go.split(":")[1]; removePerk(id, "abgegeben"); remember("hella", id.replace("fluch_", "") + "_preis", 2, true); return "Hella nimmt euch etwas ab, an das ihr euch nicht mehr ganz erinnert."; };
CHOOSE_HOOKS.brechen = (go) => { const id = go.split(":")[1]; const e = perkEntry(id); if (!e) return ""; advance(2); removePerk(id, "gebrochen"); return "Ihr haltet Totenwache und läutet bis die Arme schwer sind. Der Fluch löst sich."; };
// Segen der Esse: Arbeit an 5 verschiedenen Tagen in der Schmiede
const _doDaily = doDaily;
doDaily = function (id) {
  const at = state.location;
  _doDaily(id);
  if (id === "work" && at === "schmied") { const w = state.world; w.esseTage = Array.from(new Set((w.esseTage || []).concat([state.day]))); if (w.esseTage.length >= 5 && !perkEntry("segen_der_esse") && !perkBlocked("segen_der_esse")) grantPerkById("segen_der_esse", { quelle: "ereignis:esse" }); }
};
const _suehne = suehne;
suehne = function (f, art) { const r = _suehne(f, art); if (r && f === "rat" && art === "dienst") state.world.ratDienst = (state.world.ratDienst || 0) + 1; return r; };
const _confessionRuf = confessionRuf;
confessionRuf = function (who) { const r = _confessionRuf(who); if (r) state.values.rufBeichten = (state.values.rufBeichten || 0) + 1; return r; };
// Spiegelhunger: dritter Spiegeltrank in 7 Tagen
const _useItem = useItem;
useItem = function (id) {
  const had = state.inventory.includes(id);
  _useItem(id);
  if (had && id === "spiegeltrank") { const w = state.world; w.spiegel = (w.spiegel || []).filter((d) => d >= state.day - 6).concat([state.day]); if (w.spiegel.length >= 3) grantPerkById("fluch_spiegelhunger", { quelle: "ereignis:spiegeltrank" }); persist(); render(); }
};
// Wolf-Ausgänge verschont/verhandelt gibt es nicht mehr; Paktmal nur noch aus Altständen (Migration).
onNewDay((day) => {
  if (!state || !state.perks) return;
  // Spiegelhunger klingt ab: 7 Tage ohne Spiegeltrank -> Stufe −1
  const e = perkEntry("fluch_spiegelhunger"); const w = state.world;
  if (e && (w.spiegel || []).every((d) => d < day - 7)) { if ((e.stufe || 1) <= 1) removePerk(e.id, "verklungen"); else { e.stufe -= 1; w.spiegel = [day]; } }
  // Segen Stufe 2 nach 14 Tagen gehalten
  perkState().segen.forEach((s) => { if (!s.ruht && (s.stufe || 1) < D.PERKS[s.id].stufen.length && day - s.seit >= 14) s.stufe = 2; });
  syncPerkFlags();
});
// Migration v6 -> v7: alter Fluch (hero.fluchId) -> perks.flueche fluch_<alt>, Stufe 3, baked, migriert.
function migV7(s) {
  const prev = state; state = s;
  try {
    perkState();
    if (!s.perks.migrated) {
      const alt = s.hero.fluchId; const id = D.FLUCH_MIGRATION[alt];
      if (id) grantPerkById(id, { quelle: "migration", stufe: 3, migriert: true, baked: s.hero.fluch ? true : "unsicher" });
      s.perks.migrated = true;
    }
    if (false) { /* Wolfstöter-Mal nicht mehr für den gewöhnlichen Wolf (v9) */ }
    else if ((s.flags.wolf_spared || s.flags.wolf_bargain) && !perkEntry("mal_des_wolfspakts") && !perkEntry("mal_des_wolfstoeters")) grantPerkById("mal_des_wolfspakts", { quelle: "story", herkunftTag: s.flags.wolf_bargain ? "wolf_bargain" : "wolf_spared" });
    syncPerkFlags();
  } finally { state = prev; }
  return s;
}
// Migration v7 -> v8: Harn (Burgvogt) von Markt nach Burg. Quest-Status wolfspfad bleibt;
// Abgabe läuft über NPC-Id, daher weiterhin auf der Burg möglich.
function migV8(s) {
  if (!s.flags) s.flags = {};
  // Ort liegt in data.js; Save trägt nur Quest-Status. Nichts an quests.wolfspfad ändern.
  s.flags.sim_harn_burg = true;
  return s;
}
// Migration v8 -> v9 (Korrekturliste Nico)
function migV9(s) {
  const h = s.hero || (s.hero = {});
  if (h.gender !== "m" && h.gender !== "w") h.gender = ({ nebelwanderer: "w" })[h.portraitId] || "m";
  if (!D.AVATARE[h.portraitId] || D.AVATARE[h.portraitId].g !== h.gender) {
    const map = { ascheadel: "avatar_m1", gossenschatten: "avatar_m2", tempelkind: h.gender === "w" ? "avatar_w2" : "avatar_m3", nebelwanderer: "avatar_w1" };
    const id = map[h.portraitId]; h.portraitId = id && D.AVATARE[id].g === h.gender ? id : "avatar_" + h.gender + "1";
  }
  delete h.herkunftId; delete h.herkunft;  // Herkunft entfällt; Startwerte stehen in grad.statStart
  // Wolfstöter-Mal vom gewöhnlichen Wolf entfernen (Male bleiben sonst immer)
  if (s.perks && Array.isArray(s.perks.male) && !(s.flags && s.flags.wolf_legendaer)) {
    const n = s.perks.male.length;
    s.perks.male = s.perks.male.filter((e) => e.id !== "mal_des_wolfstoeters");
    if (s.perks.male.length !== n) {
      s.flags.perk_mal_des_wolfstoeters = false; s.flags.mal_wolfstoeter_entfernt_v9 = true;
      (s.perkLog = s.perkLog || []).push({ day: s.day || 1, art: "mal", id: "mal_des_wolfstoeters", aktion: "verloren", grund: "migration_v9" });
    }
  }
  if (s.location === "markt" && s.dialogue && /^stand_/.test(s.dialogue.npcId || "")) s.dialogue = null;
  return s;
}
const ROMAN = ["", "I", "II", "III"];
function perkRowHtml(e) {
  const P = D.PERKS[e.id];
  if (e.verborgen) return "<div class='card perk' title='Etwas an euch hat sich verändert. Jemand Kundiges könnte es benennen.'><b>Unbekanntes</b> · ?</div>";
  const herk = e.quelle === "migration" ? "Seit jeher" : e.quelle === "grad" ? "Grad" : /^npc:/.test(e.quelle) ? (D.NPCs[e.quelle.slice(4)] || {}).name || "Begegnung" : "Geschichte";
  const tip = P.text + " Wirkung: " + P.wirkung + "." + (P.bedingung ? " Bedingung: " + P.bedingung + "." : "") + (P.loesen ? " Lösen: " + P.loesen + "." : "");
  return "<div class='card perk" + (e.ruht ? " ruht" : "") + "' title='" + esc(tip).replace(/'/g, "&#39;") + "'><b>" + esc(P.name) + "</b> · " + ROMAN[e.stufe || 1] + " · " + esc(herk) + (e.ruht ? " · ruht" : "") +
    "<div class='tiny'>" + esc(P.wirkung) + (P.loesen ? " · " + esc(P.loesen) : "") + "</div>" + (DEBUG ? dbg(JSON.stringify(perkStageFx(e))) : "") +
    (P.art === "segen" ? "<button data-ablegen='" + e.id + "'>Ablegen</button>" : "") + "</div>";
}
function perksHtml() {
  const ps = perkState();
  return "<h3>Male</h3>" + (ps.male.length ? ps.male.map(perkRowHtml).join("") : "<p class='tiny'>Keine.</p>") +
    "<h3>Flüche</h3>" + (ps.flueche.length ? ps.flueche.map(perkRowHtml).join("") : "<p class='tiny'>Keine.</p>") +
    "<h3>Segen " + slotsUsed("segen") + "/3</h3>" + (ps.segen.length ? ps.segen.map(perkRowHtml).join("") : "<p class='tiny'>Keine.</p>");
}
STATS_MORE.splice(1, 0, perksHtml);
const _wireSheet = wireSheet;
wireSheet = function (body) {
  _wireSheet(body);
  body.querySelectorAll("[data-ablegen]").forEach((b) => { b.onclick = () => { if (window.confirm(perkName(b.dataset.ablegen) + " wirklich ablegen?")) { removePerk(b.dataset.ablegen, "abgelegt"); persist(); paintSheet(); render(); } }; });
};

// =====================================================================
// Korrekturliste Nico · Kampffenster über dem Ortsbild mit Lebensbalken und Effekten
// =====================================================================
const ZEICHEN_FX = { schnellschlag: "schwert", eisenhaut: "schild", solarplexus: "faust", feuerball: "feuerball", froststachel: "eis", heilfunke: "heilung", giftklinge: "gift", schattenhieb: "dolch", blutung: "dolch", wundmal: "fluch" };
const FX_GLYPH = { klaue: "⟋⟋⟋", schwert: "🗡", dolch: "🔪", faust: "✊", feuerball: "🔥", eis: "❄", blitz: "⚡", schild: "🛡", heilung: "✚", gift: "☠", fluch: "✠" };
function weaponFx() {
  const w = weaponOf("waffeL") || weaponOf("schild");
  if (!w) return "faust";
  return /dolch|nadel/i.test(w.id) ? "dolch" : "schwert";
}
let combatSeen = null;  // { id, foeHp, heroHp } für Treffer-Effekte zwischen zwei Renders
function hpPct(a, b) { return Math.max(0, Math.min(100, Math.round(a / Math.max(1, b) * 100))); }
function fxIcon(win, kind, target) {
  const bar = win.querySelector(target === "foe" ? ".cw-foe .cw-frame" : ".cw-hero .cw-frame");  // Effekte auf das Bild, nicht den Balken
  if (!bar) return;
  const ico = document.createElement("span");
  ico.className = "cw-fx " + (target === "foe" ? "to-foe" : "to-hero") + " fx-" + kind;
  ico.dataset.fx = kind;
  if (hasArt("fx/fx_" + kind + ".png")) { const img = document.createElement("img"); img.alt = ""; img.src = art("fx/fx_" + kind + ".png"); ico.appendChild(img); ico.classList.add("has-img"); }
  else ico.textContent = FX_GLYPH[kind] || "✦";
  bar.appendChild(ico);
  setTimeout(() => ico.remove(), 900);
  const panel = bar.closest(".cw-side");
  panel.classList.remove("hit"); void panel.offsetWidth; panel.classList.add("hit");
  if (kind === "heilung") { panel.classList.remove("heal"); void panel.offsetWidth; panel.classList.add("heal"); }
  bar.classList.remove("shake"); void bar.offsetWidth; bar.classList.add("shake");
}
function renderCombatWin() {
  const win = document.getElementById("combat-win");
  const shell = document.getElementById("shell");
  if (!win) return;
  const end = state && !state.inCombat && state.combatEnd;
  const c = (state && state.inCombat && state.combat) || end;
  shell.classList.toggle("fighting", !!c);
  win.classList.toggle("ended", !!end);
  if (!c) { win.hidden = true; combatSeen = null; return; }
  const loc = D.LOCATIONS[state.location] || {};
  if (win.hidden || win.dataset.loc !== state.location) {
    win.dataset.loc = state.location;
    if (hasArt("ui/kampf_bg.jpg")) { win.style.backgroundImage = "radial-gradient(ellipse at center,rgba(7,4,5,.15),rgba(7,4,5,.75)),url('" + art("ui/kampf_bg.jpg") + "')"; win.dataset.bg = "kampf_bg"; }
    else { win.style.backgroundImage = "linear-gradient(rgba(7,4,5,.72),rgba(7,4,5,.86)),url('" + art(loc.art) + "')"; win.dataset.bg = "ort"; }
  }
  win.hidden = false;
  if (!win.querySelector(".cw-foe")) {
    win.innerHTML = "<div class='cw-title'>Kampf</div><div class='cw-arena'>" +
      "<div class='cw-side cw-foe'><div class='cw-frame'><img class='cw-art' alt=''></div><div class='cw-name'></div><div class='cw-bar'><i></i><span class='cw-hp'></span></div></div>" +
      "<div class='cw-vs'>◆</div>" +
      "<div class='cw-side cw-hero'><div class='cw-frame'><img class='cw-art' alt=''></div><div class='cw-name'></div><div class='cw-bar'><i></i><span class='cw-hp'></span></div></div></div>" +
      "<div class='cw-log'></div><div class='cw-result' hidden></div><div class='cw-acts'><button class='cw-fight menu-btn'>Kämpfen</button><button class='cw-flee menu-btn'>Entgleiten</button></div>" +
      "<div class='cw-end' hidden><button class='cw-weiter menu-btn'>Weiter</button></div>";
    win.querySelector(".cw-fight").onclick = engage;
    win.querySelector(".cw-flee").onclick = flee;
    win.querySelector(".cw-weiter").onclick = () => choose("clear");
  }
  const hero = win.querySelector(".cw-hero"), foe = win.querySelector(".cw-foe");
  const pa = avatarOf(state.hero);
  if (hero.dataset.p !== state.hero.portraitId) { hero.dataset.p = state.hero.portraitId; onImg(hero.querySelector("img"), pa[0], pa.slice(1)); }
  if (foe.dataset.p !== c.id) { foe.dataset.p = c.id; onImg(foe.querySelector("img"), c.art, ["monsters/" + c.id + ".jpg"]); }
  hero.querySelector(".cw-name").textContent = state.hero.name;
  foe.querySelector(".cw-name").textContent = c.name;
  if (end) {  // Endfenster: bleibt offen bis „Weiter“
    foe.querySelector(".cw-bar i").style.width = hpPct(end.hp, end.hpMax) + "%";
    hero.querySelector(".cw-bar i").style.width = hpPct(state.hero.hp, maxHp()) + "%";
    foe.querySelector(".cw-hp").textContent = Math.max(0, end.hp) + " / " + end.hpMax;
    hero.querySelector(".cw-hp").textContent = Math.max(0, state.hero.hp) + " / " + maxHp();
    win.querySelector(".cw-log").innerHTML = (end.log || []).slice(-3).map((l) => "<div>" + esc(l) + "</div>").join("");
    const res = win.querySelector(".cw-result"); res.hidden = false; res.innerHTML = "<b>" + esc(end.title) + "</b>" + (end.gain ? "<div>" + esc(end.gain) + "</div>" : "");
    win.querySelector(".cw-acts").hidden = true; win.querySelector(".cw-end").hidden = false;
    foe.classList.toggle("dead", end.result === "sieg");
    combatSeen = null; return;
  }
  win.querySelector(".cw-result").hidden = true; win.querySelector(".cw-end").hidden = true; foe.classList.remove("dead");
  hero.querySelector(".cw-bar i").style.width = hpPct(state.hero.hp, maxHp()) + "%";
  foe.querySelector(".cw-bar i").style.width = hpPct(c.hp, c.hpMax) + "%";
  hero.querySelector(".cw-hp").textContent = Math.max(0, state.hero.hp) + " / " + maxHp();
  foe.querySelector(".cw-hp").textContent = Math.max(0, c.hp) + " / " + c.hpMax;
  const lines = c.log.slice(-3);
  win.querySelector(".cw-log").innerHTML = (lines.length ? lines : [c.note || c.text || ""]).map((l) => "<div>" + esc(l) + "</div>").join("");
  const acts = win.querySelector(".cw-acts");
  acts.hidden = !!(c.engaged || c.surrendered);
  // Effekte nur bei echter Änderung desselben Kampfes
  if (combatSeen && combatSeen.seed === c.seed) {
    if (c.hp < combatSeen.foeHp) fxIcon(win, c.fxHero || "schwert", "foe");
    if (state.hero.hp < combatSeen.heroHp) fxIcon(win, c.fxFoe || "klaue", "hero");
    else if (state.hero.hp > combatSeen.heroHp) fxIcon(win, "heilung", "hero");
    if (c.fxHero === "schild" && c.eisenhaut && c.eisenhaut.left > 0 && !combatSeen.schild) fxIcon(win, "schild", "hero");
  }
  combatSeen = { seed: c.seed, foeHp: c.hp, heroHp: state.hero.hp, schild: !!(c.eisenhaut && c.eisenhaut.left > 0) };
}

// =====================================================================
// Ausbesserung 2 (Nico) · Händler-Wirtschaft, Parade/Ausweichen, Kampf-Endfenster,
// Kampf-Charakterfenster, Werte-Tooltips, NPC-Schilder ohne Überlappung, Migration v10
// =====================================================================
// ---- Händler: eigene Kasse, Wochen-Sortiment aus eigenem Pool (state.merchants) ----
function weekOf(day) { return Math.floor(((day || 1) - 1) / 7); }
function daysToRestock() { return 7 - (((state.day || 1) - 1) % 7); }
function shuffled(a) { return a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]); }
function merchBaseCount(npc, id) { const it = D.ITEMS[id]; if (!stackable(it)) return 1; const b = (npc.stock || {})[id]; return typeof b === "number" ? b : rnd(2, 4); }
function merchRestock(npc, m, wk) {
  const E = D.MERCHANT_ECON[npc.id];
  m.week = wk; m.gold = E.gold; m.pool = E.pool.slice();
  m.stock = {};
  shuffled(m.pool.filter((id) => D.ITEMS[id])).slice(0, E.size).forEach((id) => { m.stock[id] = merchBaseCount(npc, id); });  // Verkauftes fällt hier heraus
}
function merchInit(npc, s, oldStock) {
  const E = D.MERCHANT_ECON[npc.id];
  const m = { gold: E.gold, week: weekOf(s.day), pool: E.pool.slice(), stock: {} };
  (npc.shop || []).forEach((id) => { const o = oldStock && oldStock[id]; m.stock[id] = typeof o === "number" ? o : merchBaseCount(npc, id); });
  return m;
}
function merchState(npc) {
  if (!state || !npc || npc.stall || !D.MERCHANT_ECON || !D.MERCHANT_ECON[npc.id]) return null;
  if (!state.merchants) state.merchants = {};
  let m = state.merchants[npc.id];
  if (!m) m = state.merchants[npc.id] = merchInit(npc, state);
  const wk = weekOf(state.day);
  if (m.week < wk) merchRestock(npc, m, wk);
  return m;
}
const _shopStock = shopStock;
shopStock = function (npc, id) { const m = merchState(npc); return m ? (m.stock[id] || 0) : _shopStock(npc, id); };
const _setShopStock = setShopStock;
setShopStock = function (npc, id, n) { const m = merchState(npc); if (m) { m.stock[id] = Math.max(0, n); if (!m.stock[id]) delete m.stock[id]; return; } _setShopStock(npc, id, n); };

// ---- Parade und Ausweichen (Nachtrag Ausbesserung 2 in grad-zeichen-kampf.md) ----
function fortuneEff() { return (state.hero.fortune || 0) + perkStat("fortune"); }
function dodgeChance() {
  const p = gradState().pfad;
  return clamp(3 + Math.floor(fortuneEff() / 3) + 2 * (p.dieb || 0) + gearFx("dodgePct") + perkFxNum("dodgePct"), 0, 25);
}
function parryChance(c) {
  const armed = !!(weaponOf("waffeL") || (state.equipped && state.equipped.schild));
  if (!armed) return 0;
  const p = gradState().pfad, shield = state.equipped && state.equipped.schild ? 6 : 0;
  const eh = c && c.eisenhaut && c.eisenhaut.left > 0 ? 5 : 0;
  return clamp(3 + Math.floor(defEff() / 3) + shield + 2 * (p.krieger || 0) + eh + gearFx("parryPct") + perkFxNum("parryPct"), 0, 30);
}
function heroDefense(c) {
  if (Math.random() * 100 < dodgeChance()) return "dodge";
  if (Math.random() * 100 < parryChance(c)) return "parry";
  return "";
}
function foeDodge(c) { return typeof c.dodge === "number" ? c.dodge : (c.human ? 4 : /wolf/.test(c.id) ? 6 : 3); }
function foeParry(c) { return typeof c.parry === "number" ? c.parry : (c.human ? 8 : 0); }
const _heroHit = heroHit;
heroHit = function (c, pct, critBonus) {
  const d = _heroHit(c, pct, critBonus);
  if (Math.random() * 100 < foeDodge(c)) { c.defNote = c.name + " weicht aus"; c.lastCrit = false; return 0; }
  if (Math.random() * 100 < foeParry(c)) { c.defNote = c.name + " pariert"; return Math.max(1, Math.floor(d / 2)); }
  return d;
};
const _heroSwing = heroSwing;
heroSwing = function (c) {
  c.defNote = "";
  _heroSwing(c);
  if (c.defNote && c.log.length) c.log[c.log.length - 1] = c.log[c.log.length - 1].replace(/\.$/, "") + " – " + c.defNote + ".";
};
function defenseHtml() {
  return "<h3>Abwehr</h3><div class='card' data-tip='' data-vtip='ausweichen'><b>Ausweichen</b> <span class='vnum'>" + dodgeChance() + " %</span></div>" +
    "<div class='card' data-tip='' data-vtip='parade'><b>Parade</b> <span class='vnum'>" + parryChance(null) + " %</span>" + "</div>";  // Spruch entfällt (Spec B §6.4), Tooltip bleibt
}

// ---- Kampf-Endfenster: bleibt bis „Weiter“, Gespräch zeigt nur Ergebnis und Gewinn ----
function endSnap(c, result, title, gain) {
  state.combatEnd = { id: c.id, name: c.name, art: c.art, hp: Math.max(0, result === "sieg" ? 0 : c.hp), hpMax: c.hpMax, log: c.log.slice(-3), result, title, gain: gain || "" };
}
const _combatVictory = combatVictory;
combatVictory = function (c) {
  const g0 = state.hero.gold, inv0 = state.inventory.length;
  _combatVictory(c);
  const loot = state.inventory.slice(inv0).map((id) => D.ITEMS[id] && D.ITEMS[id].name).filter(Boolean);
  endSnap(c, "sieg", c.name + " fällt", "Gold +" + (state.hero.gold - g0) + (loot.length ? " · Beute: " + loot.join(", ") : ""));
  renderCombatWin(); renderFightHero();
};
const _combatDefeat = combatDefeat;
combatDefeat = function (c) {
  _combatDefeat(c);
  endSnap(c, "niederlage", "Ihr fallt", "Ihr erwacht in " + D.LOCATIONS[state.location].name + ".");
  renderCombatWin(); renderFightHero();
};
const _sysFlee = sysFlee;
sysFlee = function () {
  const c = state.combat;
  _sysFlee();
  if (c && !state.inCombat && !state.combatEnd) { endSnap(c, "flucht", "Ihr entgleitet", ""); renderCombatWin(); renderFightHero(); }
};

// ---- Charakterfenster im Kampf: Name, Grad, Verbrauchsgüter als Kacheln ----
function useCombatItem(id) {
  const c = state.inCombat && state.combat, it = D.ITEMS[id];
  if (!c || !it || it.type !== "verbrauch" || !state.inventory.includes(id)) return;
  useItem(id);
  if (it.ap) c.ap = (c.ap || 0) + it.ap;
  combatLine(c, "Ihr nutzt " + it.name + (it.heal ? " (+" + it.heal + " Leben)" : "") + ".");
  if (c.engaged) c.nextHero += heroSpeed();  // kostet den nächsten Schlag
  persist(); render();
}
function renderFightHero() {
  const pane = document.getElementById("pane-hero"), box = document.getElementById("fight-items");
  if (!pane || !box) return;
  const on = !!(state && (state.inCombat || state.combatEnd));
  pane.classList.toggle("fight", on); box.hidden = !on;
  if (!on) { box.innerHTML = ""; return; }
  const items = groupItems(state.inventory).filter(({ it }) => it.type === "verbrauch");
  const key = items.map(({ it, n }) => it.id + n).join() + "|" + !!state.inCombat;
  if (box.dataset.key === key) return;
  box.dataset.key = key;
  box.innerHTML = "<div class='fi-h'>Verbrauch</div>" + (items.length ? "" : "<p class='tiny'>Nichts zur Hand.</p>");
  const grid = document.createElement("div"); grid.className = "fi-grid"; box.appendChild(grid);
  items.forEach(({ it, n }) => {
    const d = document.createElement("button");
    d.className = "fi-tile"; d.dataset.item = it.id; d.dataset.tip = it.id; d.dataset.tipMode = "bag"; d.disabled = !state.inCombat;
    d.innerHTML = "<span class='tile-art'><img alt=''></span><b>" + esc(stackName(it, n)) + "</b>";
    const im = d.querySelector("img"); if (it.img) onImg(im, it.img); else im.hidden = true;
    d.onclick = () => useCombatItem(it.id);
    grid.appendChild(d);
  });
}

// ---- Bitten/Werte/Zeichen im Beutel-Stil (Beutel selbst unverändert) ----
function styleSheetKind(body, kind) {
  const fancy = kind === "stats" || kind === "quests" || kind === "zeichen";
  body.classList.toggle("fancy", fancy);
  if (!fancy) return;
  const bgRel = "ui/avatar_bg_" + heroGender() + ".jpg";
  if (hasArt(bgRel)) body.style.backgroundImage = "linear-gradient(rgba(7,4,5,.78),rgba(7,4,5,.88)),url('" + art(bgRel) + "')";
}
const VALUE_TIPS = {
  hp: "Leben. Fällt es auf 0, verliert ihr den Kampf. Rast beim Gastwirt füllt es auf.",
  grad: "Grad. Steigt mit dem Wachstum aller Grundwerte und öffnet Wahl, Zeichen-Plätze und Atem.",
  atk: "Angriff. Mehr Schaden je Schlag (Angriff − Panzer des Gegners, mindestens 20 %).",
  def: "Panzer. Weniger Schaden je gegnerischem Treffer und bessere Parade (+1 % je 3 Panzer).",
  will: "Wille. Stärkt Zauber-Zeichen und Willenskraft, hilft bei Proben und bei der Flucht.",
  fortune: "Glück. Mehr harte Treffer (+1 % je 10) und Ausweichen (+1 % je 3).",
  ansehen: "Ansehen. Wie man in der Stadt über euch spricht; wächst durch Arbeit und Bitten.",
  titel: "Titel. Ergibt sich aus Haltung und Korruption.",
  wille: "Wille (wirksam). Grundwert plus Segen und Ausrüstung, höchstens 18 aus dem Grundwert.",
  wk: "Willenskraft. Wird durch Arbeit und Training verbraucht, durch Beten, Ruhe und Einkehr aufgefüllt. Wenig Willenskraft schwächt euch.",
  korr: "Korruption. Wächst durch harte Entscheidungen. Höhere Stufen senken die Willenskraft und verändern, wie man euch begegnet.",
  haltung: "Haltung. Ob ihr nachgebt oder standhaltet; färbt euren Titel.",
  ausweichen: "Ausweichen. Chance, einem gegnerischen Treffer ganz zu entgehen: 3 % + Glück/3 + 2 je Dieb-Stufe, höchstens 25 %.",
  parade: "Parade. Chance, einen Treffer zu halbieren (mindestens 1): 3 % + Panzer/3 + 6 mit Schild + 2 je Krieger-Stufe + 5 unter Eisenhaut, höchstens 30 %. Braucht Waffe oder Schild."
};
function valueTip(k) { return "<div class='tip-fx'>" + esc(VALUE_TIPS[k] || "") + "</div>"; }

// ---- NPC-Schilder: dürfen sich nicht überdecken (Standhöhe/y bleibt, nur seitlich verschoben, notfalls kleiner) ----
function spreadSpots(scene) {
  if (!scene) return;
  const W = scene.clientWidth; if (!W) return;
  const spots = Array.from(scene.querySelectorAll(".spot"));
  spots.forEach((b) => { b.style.removeProperty("--spot-scale"); b.classList.remove("crowded"); });
  if (spots.length < 2) return;
  const base = 152, gap = 8;
  const scale = Math.min(1, (W * 0.96) / (spots.length * (base + gap)));
  const w = base * scale + gap;
  if (scale < 1) spots.forEach((b) => { b.style.setProperty("--spot-scale", scale.toFixed(3)); b.classList.add("crowded"); });
  const xs = spots.map((b) => ({ b, x: parseFloat(b.style.left) / 100 * W })).sort((p, q) => p.x - q.x);
  for (let i = 1; i < xs.length; i++) if (xs[i].x - xs[i - 1].x < w) xs[i].x = xs[i - 1].x + w;
  const over = xs[xs.length - 1].x - (W - w / 2); if (over > 0) xs.forEach((p) => { p.x -= over; });
  for (let i = xs.length - 2; i >= 0; i--) if (xs[i + 1].x - xs[i].x < w) xs[i].x = xs[i + 1].x - w;
  const under = w / 2 - xs[0].x; if (under > 0) xs.forEach((p) => { p.x += under; });
  xs.forEach((p) => { p.b.style.left = (p.x / W * 100).toFixed(2) + "%"; });
}

// ---- Migration v9 -> v10 ----
function migV10(s) {
  if (!s.merchants || typeof s.merchants !== "object") {
    s.merchants = {};
    Object.keys(D.MERCHANT_ECON || {}).forEach((id) => { const npc = D.NPCs[id]; if (npc) s.merchants[id] = merchInit(npc, s, s.stock && s.stock[id]); });
  }
  if (s.stock) Object.keys(D.MERCHANT_ECON || {}).forEach((id) => { delete s.stock[id]; });
  if (s.combat && s.combat.surrendered) { s.combat.surrendered = false; s.combat.engaged = false; s.combat.note = "Der Gegner rafft sich noch einmal auf."; }
  s.combatEnd = null;
  return s;
}

// ==== Stufe f · Bitten-Schema (Spec A 14.10.): Start-Folge, Erzähl-Gespräch, Besorgungsbitten, runde Knöpfe, Einblendungen ====
function textVars(s, anredeKey) {
  const a = (D.ANREDE[anredeKey || "eltern"] || {})[heroGender()] || "";
  return String(s || "").replace(/\{anrede\}/g, a).replace(/\{name\}/g, (state.hero && state.hero.name) || "");
}
function bittenState() { return state.bitten || (state.bitten = {}); }
function hatItem(id) { return (state.inventory || []).includes(id); }
function nimmItem(id) { const i = state.inventory.indexOf(id); if (i >= 0) state.inventory.splice(i, 1); return i >= 0; }
function bitteToast(text) {
  const pane = document.getElementById("pane-scene"); if (!pane) return;
  const t = document.createElement("div"); t.className = "bitte-toast"; t.textContent = text;
  (pane.querySelector(".pane-body") || pane).appendChild(t);
  setTimeout(() => t.classList.add("aus"), 1600); setTimeout(() => t.remove(), 2000);
}
function bitteBlink() {
  const b = document.querySelector('[data-sheet="quests"]'); if (!b) return;
  b.classList.remove("blink"); void b.offsetWidth; b.classList.add("blink"); setTimeout(() => b.classList.remove("blink"), 2000);
}
function giveBitte(id) {
  const bs = bittenState(); if (!D.BITTEN[id] || bs[id]) return false;
  bs[id] = { status: "aktiv", schritt: 0, tag: state.day };
  log("Neue Bitte: " + D.BITTEN[id].title + ".");
  bitteToast("Neue Bitte erhalten"); bitteBlink(); persist();
  return true;
}
function bitteSchritt(id) { const b = bittenState()[id]; return b ? b.schritt : -1; }
function bitteAktiv(id) { const b = bittenState()[id]; return !!b && b.status === "aktiv"; }
function finishBitte(id, ok) {
  const b = bittenState()[id], q = D.BITTEN[id]; if (!b || !q) return;
  b.status = ok === false ? "fehlgeschlagen" : "abgeschlossen"; b.ende = state.day;
  if (ok !== false) Object.entries((q.lohn && q.lohn.bond) || {}).forEach(([npc, n]) => bumpBond(npc, n, { source: "bitte" }));
  log((ok === false ? "Bitte fehlgeschlagen: " : "Bitte abgeschlossen: ") + q.title + ".");
  bitteToast(ok === false ? "Bitte fehlgeschlagen" : "Bitte abgeschlossen");
}
function failBitte(id) { finishBitte(id, false); }
// Knöpfe am aktuellen Ort: aufheben (Schritt offen, Gegenstand fehlt), umwandeln (von im Beutel).
function bitteKnoepfeHier() {
  const out = [];
  Object.keys(D.BITTEN).filter(bitteAktiv).forEach((id) => D.BITTEN[id].schritte.forEach((st, i) => {
    if (st.ort !== state.location) return;
    if (st.art === "aufheben" && (st.mehrfach || bitteSchritt(id) === i) && !hatItem(st.item)) out.push({ id, i, st });
    if (st.art === "umwandeln" && hatItem(st.von)) out.push({ id, i, st });
  }));
  return out;
}
function bitteKnopf(id, i) {
  const st = D.BITTEN[id].schritte[i], b = bittenState()[id];
  if (st.art === "aufheben") state.inventory.push(st.item);
  if (st.art === "umwandeln") { nimmItem(st.von); state.inventory.push(st.zu); }
  b.schritt = Math.max(b.schritt, i + 1);
  log(st.label + ".");
  persist(); render();
}
// Zwang: NPC steht am zwang.ort, solange die Bitte aktiv ist und das Schritt-Item im Beutel liegt (auch nachts).
function bitteZwang(npcId) {
  for (const id of Object.keys(D.BITTEN)) {
    if (!bitteAktiv(id)) continue;
    const st = D.BITTEN[id].schritte.find((x) => x.npc === npcId && x.zwang && (!x.item || hatItem(x.item)));
    if (st) return st.zwang.ort;
  }
  return null;
}
const _npcLocationNowBasis = npcLocationNow;
npcLocationNow = function (n, day, phase) { const z = n && state && state.bitten ? bitteZwang(n.id) : null; return z || _npcLocationNowBasis(n, day, phase); };
const SCENE_ROUND_HOOKS = [];
SCENE_ROUND_HOOKS.push((scene) => bitteKnoepfeHier().forEach(({ id, i, st }) => {
  const b = document.createElement("button");
  b.className = "act-round"; b.dataset.bitte = id; b.dataset.schritt = i; b.title = st.label;
  b.style.left = (st.x || 50) + "%"; b.style.top = (st.y || 62) + "%";
  b.innerHTML = '<span class="ring"><img alt=""></span><span class="tag">' + esc(st.label) + "</span>";
  onImg(b.querySelector("img"), st.bild);
  b.onclick = () => bitteKnopf(id, i);
  scene.appendChild(b);
}));
// Abgabe beim NPC als Gesprächsoption.
TALK_HOOKS.push((npc, c) => Object.keys(D.BITTEN).filter(bitteAktiv).forEach((id) => D.BITTEN[id].schritte.forEach((st, i) => {
  if (st.art === "abgeben" && st.npc === npc.id && hatItem(st.item)) c.push({ label: st.label, go: "bitte_abgeben:" + id + ":" + i });
})));
CHOOSE_HOOKS.bitte_abgeben = (go) => {
  const [, id, i] = go.split(":"); const st = D.BITTEN[id] && D.BITTEN[id].schritte[+i];
  if (!st || !bitteAktiv(id) || !nimmItem(st.item)) return "";
  bittenState()[id].schritt = +i + 1;
  finishBitte(id, true);
  return st.text || "";
};
// Erzähl-Gespräch mit Porträt, ohne Nähe-Zeile, ohne Zeit; „Weiter“ vergibt ggf. die Bitte.
function openStory(st) {
  if (!st) return;
  const npc = D.NPCs[st.npc];
  state.dialogue = { npcId: st.npc, node: "story", story: st.id };
  lastTalk = npc; render();
  showFace(npc); document.getElementById("face-bond").hidden = true;
  showLine(textVars(st.text, st.anrede), [{ label: "Weiter", go: "story_weiter:" + st.id }]);
}
CHOOSE_HOOKS.story_weiter = (go) => {
  const st = D.STORY[go.split(":")[1]];
  if (st && st.id === "vater_start") state.startFolge = null;
  choose("leave");
  if (st && st.bitte) giveBitte(st.bitte);
  return "";
};
function startFolgeOffen() { return state && state.startFolge === "vater" && !state.narrator && !state.dialogue && !state.inCombat; }
(() => {
  const btn = document.getElementById("narr-close"), basis = btn.onclick;
  btn.onclick = () => {
    const warIntro = !!(state && state.narrator && state.narrator.id === "intro");
    basis();
    if (warIntro && state.startFolge === "vater") setTimeout(() => { if (startFolgeOffen()) openStory(D.STORY.vater_start); }, 1000);
  };
})();
const _openPlayBasis = openPlay;
openPlay = function () { _openPlayBasis(); if (startFolgeOffen()) openStory(D.STORY.vater_start); };
// Alte Wolf-Bitten: gleiche Einblendungen wie das Bitten-Schema.
const _chooseBasis = choose;
choose = function (go) {
  const vor = state && JSON.stringify(state.quests || {});
  _chooseBasis(go);
  if (!state || (go !== "quest" && go !== "done") || JSON.stringify(state.quests || {}) === vor) return;
  if (go === "quest") { bitteToast("Neue Bitte erhalten"); bitteBlink(); } else bitteToast("Bitte abgeschlossen");
};
// Bitten-Blatt mit Abschnitten; Auf-/Zuklappen nur im Browser (localStorage „aschenkrone-ui“), nicht im Spielstand.
function uiPrefs() { try { return JSON.parse(localStorage.getItem("aschenkrone-ui") || "{}"); } catch { return {}; } }
function bittenSheetHtml() {
  const card = (q, st) => "<div class='card quest" + (st !== "offen" ? " done" : "") + "'><b>" + esc(q.title) + "</b><div><b>Wo:</b> " + esc(q.where) + "</div><div><b>Was:</b> " + esc(q.goal) + "</div><div class='tiny'>" + st + "</div></div>";
  const offen = [], fertig = [], fehl = [];
  Object.keys(state.quests || {}).forEach((id) => { const q = D.QUESTS[id]; if (!q) return; (state.quests[id] === "done" ? fertig : offen).push(card(q, state.quests[id] === "done" ? "erledigt" : "offen")); });
  Object.entries(state.bitten || {}).forEach(([id, b]) => { const q = D.BITTEN[id]; if (!q) return;
    if (b.status === "aktiv") offen.push(card(q, "offen")); else if (b.status === "abgeschlossen") fertig.push(card(q, "abgeschlossen")); else fehl.push(card(q, "fehlgeschlagen")); });
  const p = uiPrefs(), sec = (key, name, list) => "<details class='bitten-abschnitt' data-ui='" + key + "'" + (p["bitten_" + key] === false ? "" : " open") + "><summary>" + name + " (" + list.length + ")</summary>" + (list.join("") || "<p class='tiny'>Keine.</p>") + "</details>";
  return "<h3>Offen</h3>" + (offen.join("") || "<p>Keine offene Bitte.</p>") + sec("abgeschlossen", "Abgeschlossen", fertig) + sec("fehlgeschlagen", "Fehlgeschlagen", fehl);
}
function wireBittenSheet(body) {
  body.querySelectorAll("details.bitten-abschnitt").forEach((d) => d.addEventListener("toggle", () => {
    const p = uiPrefs(); p["bitten_" + d.dataset.ui] = d.open; try { localStorage.setItem("aschenkrone-ui", JSON.stringify(p)); } catch {}
  }));
}

// =====================================================================
// Stufe g · Werte 2 (Spec B 14.10.): fünf Grundwerte Stufe 1–20, Grad aus Stufenaufstiegen, Gradaufstieg-Fenster, Werte-Fenster neu, Ruf-Kontakt
// =====================================================================
/** @deprecated STAT_CAP_WILL / GRAD_STUFEN.min werden nicht mehr gelesen (Deckel 20, GRAD_AUFSTIEGE). */
function stufeNeed(ziel) { return (D.STUFEN_KOSTEN.find((b) => ziel <= b.bis) || D.STUFEN_KOSTEN[D.STUFEN_KOSTEN.length - 1]).punkte; }
const _statCapBasis = statCap;
statCap = function (k) { return D.GRUNDWERTE.includes(k) ? D.STUFE_MAX : _statCapBasis(k); };
willEff = function () {
  if (!state) return 0;
  return Math.min(D.STUFE_MAX, (state.hero.will || 0) + Math.min(3, perkStat("will"))) + Math.min(3, gearBonus("will"));
};
const _gainBasis = gain;
gain = function (key, amount) {
  if (!D.GRUNDWERTE.includes(key)) return _gainBasis(key, amount);
  const row = state.statXp[key] || { xp: 0 };
  if (amount > 0) noteTrain(key);
  row.need = stufeNeed((state.hero[key] || 0) + 1);
  row.xp += amount;
  if (statCapped(key) && row.xp >= row.need) row.xp = row.need - 1;
  while (row.xp >= row.need && !statCapped(key)) {
    row.xp -= row.need;
    state.hero[key] = (state.hero[key] || 0) + 1;
    if (typeof emitDelta === "function") emitDelta({ kind: "stat", key, delta: 1 });
    log((D.STAT_KEYS.find((s) => s.id === key) || {}).name + " steigt auf Stufe " + state.hero[key] + ".");
    row.need = stufeNeed(state.hero[key] + 1);
    if (statCapped(key) && row.xp >= row.need) row.xp = row.need - 1;
  }
  state.statXp[key] = row;
  trackPeak();
};
if (!GROWTH_KEYS.includes("rede")) GROWTH_KEYS.push("rede");  // Höchststand auch für Redegewandtheit
function aufstiege() {
  const g = gradState(); let sum = 0;
  D.GRUNDWERTE.forEach((k) => { sum += Math.max(0, (g.statPeak[k] || 0) - (g.statStart[k] || 0)); });  // Glück zählt voll
  return sum;
}
wachstum = aufstiege;
function gradSchwelle(n) { let cum = 0; for (let g = 2; g <= n; g++) { const x = D.GRAD_AUFSTIEGE[g]; if (x == null) return null; cum += x; } return cum; }
gradFor = function (w) { let n = 1; for (let g = 2; g <= 10; g++) { const t = gradSchwelle(g); if (t == null || w < t) break; n = g; } return n; };
function gradMaxErreichbar() { let n = 1; for (let g = 2; g <= 10 && gradSchwelle(g) != null; g++) n = g; return n; }
gradOffers = function () { return []; };  // alte Segen/Fluch-Angebote je Grad entfallen vorerst (Leitung 14.10.)
// Gradaufstieg-Fenster: modal, solange grad.pending (nach einem Kampf erst nach dem Kampf-Endfenster).
function gradSperre() { return !!(state && state.grad && state.grad.pending && !state.inCombat && !state.combatEnd); }
let gradWahl = null;
function gradEntscheiden(kind, id) {
  const g = gradState(); if (!g.pending) return false;
  if (kind === "richtung") {
    if (g.richtung || !D.RICHTUNGEN[id]) return false;
    g.richtung = id; g.pfad[id] = Math.max(1, g.pfad[id] || 0);
    const z = (D.PFAD_ZEICHEN[id] || [])[0];
    if (z) learnZeichen(z); else { g.zeichenOffen = true; log("Euer erstes Zeichen folgt."); }
    if (typeof grantPerk === "function") grantPerk("mal", "mal_des_" + { krieger: "kriegers", magier: "magiers", dieb: "diebes", diplomat: "diplomaten" }[id], { quelle: "grad", stufe: 1 });
    log("Richtung gewählt: " + D.RICHTUNGEN[id].name + ".");
  } else if (kind !== "annehmen") return false;
  g.pending = null; gradWahl = null;
  if (g.nachhol > 0) { g.nachhol -= 1; g.pending = { grad: state.hero.level, offers: [], nachhol: true }; }
  persist(); render(); if (sheet) paintSheet();
  return true;
}
chooseGradUp = function (kind, id) { return gradEntscheiden(kind === "pfad" ? (gradState().richtung ? "annehmen" : "richtung") : "annehmen", id); };
function gradFensterHtml() {
  const g = gradState(), n = g.pending.grad || state.hero.level;
  const richtung = !g.richtung;
  let html = "<div class='grad-titel'>Gratulation zum nächsten Grad</div><div class='grad-sub'>Grad " + n + " · " + esc(gradName(n)) + "</div>";
  if (richtung) {
    html += "<p>Wählt eure Richtung. Die Wahl gilt für immer.</p><div class='grad-wahl'>" + Object.entries(D.RICHTUNGEN).map(([id, r]) =>
      "<button data-richtung='" + id + "' class='" + (gradWahl === id ? "picked" : "") + "'><b>" + esc(r.name) + "</b><span class='tiny'>" + esc(r.text) + "</span></button>").join("") + "</div>" +
      "<button class='grad-ok' data-gradok='richtung'" + (gradWahl ? "" : " disabled") + ">Entscheiden</button>";
  } else {
    const bel = D.GRAD_BELOHNUNG[n];
    html += "<p>" + (bel && bel.inhalt ? esc(bel.inhalt) : "Was dieser Grad bringt, wird noch entschieden.") + "</p><button class='grad-ok' data-gradok='annehmen'>Annehmen</button>";
  }
  return html;
}
function openGradFenster() {
  const body = document.querySelector("#pane-scene .pane-body"); if (!body) return;
  let w = document.getElementById("grad-win");
  if (!w) { w = document.createElement("div"); w.id = "grad-win"; body.appendChild(w); }
  w.hidden = false; w.innerHTML = gradFensterHtml();
  w.querySelectorAll("[data-richtung]").forEach((b) => { b.onclick = () => { gradWahl = b.dataset.richtung; openGradFenster(); }; });
  const ok = w.querySelector("[data-gradok]");
  if (ok) ok.onclick = () => { if (ok.dataset.gradok === "richtung") { if (gradWahl) gradEntscheiden("richtung", gradWahl); } else gradEntscheiden("annehmen"); };
}
function charWkHtml() {
  const v = state.values || { wk: 0 }, wm = wkMax();
  return "<div class='statline' data-tip='' data-vtip='wk'><em>Willenskraft</em><span>" + v.wk + "/" + wm + "</span></div><div class='bar wk'><i style='width:" + Math.round(v.wk / wm * 100) + "%'></i></div>";
}
const _renderBasis = render;
render = function () {
  _renderBasis();
  if (!state) return;
  // Charakterfenster: Willenskraft unter dem Leben
  const hp = document.getElementById("hpbar");
  if (hp) { let wk = document.getElementById("wkbar"); if (!wk) { wk = document.createElement("div"); wk.id = "wkbar"; hp.after(wk); } wk.innerHTML = charWkHtml(); }
  const w = document.getElementById("grad-win");
  if (!gradSperre()) { if (w) w.hidden = true; return; }
  openGradFenster();
  // Karte: Gebietshintergrund ohne Knöpfe
  const map = document.getElementById("map"), region = regionOf(D.LOCATIONS[state.location]);
  if (map && region) { map.querySelectorAll(".pin,button").forEach((b) => b.remove()); bg(map, region.map); }
  document.querySelectorAll("#scene .spot, #scene .arch, #scene .act-round, #scene .daily-act").forEach((b) => { b.disabled = true; });
};
// Sperren während des Fensters (Bögen, Karte, Gespräch, Tagesaktion, Rast, Kampfstart, Ortsaktion)
[["travel"], ["talk"], ["doDaily"], ["engage"], ["rest"], ["sceneExtra"], ["waitFor"]].forEach(([fn]) => {
  const basis = window[fn]; if (typeof basis !== "function") return;
  window[fn] = function (...a) { if (gradSperre()) return; return basis.apply(this, a); };
});
// Debug „+1 Grad“: nicht über den höchsten festgelegten Grad.
if (typeof debugGradUp === "function") { const _dbg = debugGradUp; debugGradUp = function () { if ((state.hero.level || 1) >= gradMaxErreichbar()) return false; return _dbg(); }; }
// Ruf: nur Fraktionen mit Kontakt (gesetzt beim ersten Ruf-Ereignis).
function factionSeen() { const w = state.world || (state.world = {}); return w.factionSeen || (w.factionSeen = {}); }
const _bumpFactionBasis = bumpFaction;
bumpFaction = function (id, axis, d, opts) { if (D.FACTIONS[id] && d) factionSeen()[id] = true; return _bumpFactionBasis(id, axis, d, opts); };
factionsHtml = function () {
  const ids = Object.keys(D.FACTIONS).filter((id) => factionSeen()[id]);
  if (!ids.length) return "<h3>Ruf</h3><p class='tiny'>Noch keine Fraktion kennt euch.</p>";
  return "<h3>Ruf</h3>" + ids.map((id) => {
    const net = clamp(axisNet(id), -100, 100), a = axes(id), e = state.world.axesExt[id];
    return "<div class='card ruf' data-faction='" + id + "'><b>" + esc(D.FACTIONS[id].name) + "</b> · " + esc(rufStufe(id).name) +
      (suehneOffen(id) ? "<div class='tiny'>Sühne möglich bei " + esc(D.NPCs[FACTION_MEDIATOR[id]].name) + "</div>" : "") +
      "<div class='bar ruf-bar'><i style='left:" + (net < 0 ? 50 + net / 2 : 50) + "%;width:" + Math.abs(net) / 2 + "%'></i></div>" +
      dbg("gunst " + a.gunst + ", zorn " + a.zorn + ", vertrauen " + e.vertrauen + ", furcht " + e.furcht) + "</div>";
  }).join("");
};
const STAT_NAMEN_G = { atk: "Angriff", def: "Panzer", will: "Wille", fortune: "Glück", rede: "Wortgewicht" };
Object.defineProperty(VALUE_TIPS, "will_werte", { enumerable: true, get() { const v = state && state.values; return VALUE_TIPS.will + " " + VALUE_TIPS.wille + (v ? " Willenskraft " + v.wk + " / " + wkMax() + "." : ""); } });
VALUE_TIPS.grad = "Grad. Steigt mit Stufenaufstiegen der Grundwerte.";
VALUE_TIPS.wille = "Wille (wirksam). Grundwert plus Segen und Ausrüstung, höchstens 20 aus dem Grundwert.";
VALUE_TIPS.rede = "Wortgewicht. Woher Punkte dafür kommen, wird noch festgelegt.";
function statsSheetHtml() {
  const lvl = state.hero.level || 1, w = aufstiege(), nx = gradSchwelle(lvl + 1);
  let html = "<div class='card grad-karte' data-tip='' data-vtip='grad'><b>Grad " + lvl + "</b> · " + esc(gradName(lvl)) + dbg("Aufstiege " + w) +
    "<div class='tiny'>" + (nx == null || lvl >= 10 ? "Weitere Grade folgen." : "noch " + Math.max(0, nx - w) + " Stufenaufstiege bis Grad " + (lvl + 1)) + "</div></div>";
  html += "<h3>Grundwerte</h3>" + D.GRUNDWERTE.map((k) => {
    const xp = state.statXp[k] || { xp: 0, need: stufeNeed((state.hero[k] || 0) + 1) }, st = state.hero[k] || 0, am = st >= D.STUFE_MAX;
    const name = STAT_NAMEN_G[k] + (k === "will" ? " " + st + " · " + willTierName(willEff()) : "");
    return "<div class='card' data-tip='' data-vtip='" + (k === "will" ? "will_werte" : k) + "' data-stat='" + k + "'><b>" + esc(name) + "</b> · Stufe " + st +
      "<div class='bar'><i style='width:" + (am ? 100 : Math.round(xp.xp / xp.need * 100)) + "%'></i></div><div class='tiny'>" + (am ? "Höchste Stufe" : xp.xp + " / " + xp.need) + "</div></div>";
  }).join("");
  const v = state.values, ax = state.statXp.ansehen || { xp: 0, need: 12 }, kt = korrTierIdx();
  html += "<h3>Haltung</h3>" +
    "<div class='card' data-tip='' data-vtip='titel'><b>Titel</b> " + esc(titel()) + "<div class='tiny'>" + esc(KORR_TEXT[korrTier().id]) + "</div></div>" +
    "<div class='card' data-tip='' data-vtip='korr'><b>Korruption</b> " + korrTier().name + " <span class='vnum'>" + v.korr + "</span><div class='bar korr k" + kt + "'><i style='width:" + clamp(v.korr, 0, 100) + "%'></i></div><div class='tiny'>Höchststand " + v.korrPeak + " · Buße " + v.buss + "</div></div>" +
    "<div class='card' data-tip='' data-vtip='haltung'><b>Haltung</b> " + haltungTier().name + " <span class='vnum'>" + v.haltung + "</span></div>" +
    "<div class='card' data-tip='' data-vtip='ansehen'><b>Ansehen</b> " + (state.hero.ansehen || 0) + "<div class='bar'><i style='width:" + Math.round(ax.xp / ax.need * 100) + "%'></i></div><div class='tiny'>" + ax.xp + " / " + ax.need + "</div></div>";
  html += atemHtml() + defenseHtml() + relationsHtml() + perksHtml() + factionsHtml();
  html += STATS_MORE.filter((fn) => fn !== gradPanelHtml && fn !== perksHtml && fn !== factionsHtml && fn !== factionsHtmlAlt).map((fn) => fn()).join("");
  return html;
}
const factionsHtmlAlt = STATS_MORE.find((fn) => fn.toString().includes("<h3>Ruf</h3>") && fn !== factionsHtml);
// Migration v12 -> v13
function migV13(s) {
  if (!s || !s.hero) return s;  // Teilstände (z. B. Tests) ohne Held: nichts zu tun
  const prev = state; state = s;
  try {
    const h = s.hero, g = gradState(); s.statXp = s.statXp || {};
    D.GRUNDWERTE.forEach((k) => { if ((h[k] || 0) > D.STUFE_MAX) { log(STAT_NAMEN_G[k] + " auf Stufe " + D.STUFE_MAX + " begrenzt."); h[k] = D.STUFE_MAX; } });
    if (typeof h.rede !== "number") h.rede = D.BASE_HERO.rede;
    if (typeof g.statStart.rede !== "number") g.statStart.rede = h.rede;
    g.statPeak.rede = Math.max(g.statPeak.rede || 0, h.rede);
    D.GRUNDWERTE.forEach((k) => { const r = s.statXp[k] || { xp: 0 }; r.need = stufeNeed((h[k] || 0) + 1); r.xp = Math.max(0, Math.min(r.xp || 0, r.need - 1)); s.statXp[k] = r; });
    const alt = h.level || 1, calc = gradFor(aufstiege());
    if (calc > alt) for (let n = alt + 1; n <= calc; n++) { h.level = n; h.hpMax += 4; h.hp = Math.min(h.hpMax, (h.hp || 0) + 4); if (n === 4 || n === 7) h.apMax = (h.apMax || 2) + 1; }
    h.level = Math.max(alt, calc);
    const soll = gradSchwelle(alt); if (soll != null && aufstiege() < soll) g.bonusAufstiege = soll - aufstiege();
    if (!g.richtung) { const best = Object.keys(g.pfad || {}).filter((p) => g.pfad[p] > 0).sort((a, b) => g.pfad[b] - g.pfad[a])[0]; if (best) g.richtung = best; }
    g.nachhol = 0;
    g.pending = h.level >= 2 && !g.richtung ? { grad: 2, art: "richtung", offers: [] } : null;
    if (s.perks) (s.perks.flueche || []).forEach((e) => { if (e.ruht) { delete e.ruht; perkLog("fluch", e.id, "aktiv", "migration"); } });
    if (s.world) { const seen = s.world.factionSeen || (s.world.factionSeen = {});
      Object.keys(D.FACTIONS).forEach((id) => { const a = (s.world.axes || {})[id], e = (s.world.axesExt || {})[id];
        if ((a && (a.gunst || a.zorn)) || (e && (e.furcht || (e.vertrauen !== undefined && e.vertrauen !== 20)))) seen[id] = true; }); }
  } finally { state = prev; }
  return s;
}
// Mehrere Grade auf einmal: je Grad ein Fenster (Nachhol-Zähler), nichts geht verloren.
const _trackPeakBasis = trackPeak;
trackPeak = function () {
  if (!state || !state.grad) return _trackPeakBasis();
  const vor = state.hero.level || 1, hatte = !!state.grad.pending;
  _trackPeakBasis();
  const neu = (state.hero.level || 1) - vor;
  if (neu > 0) state.grad.nachhol = (state.grad.nachhol || 0) + neu - (hatte ? 0 : 1);
};

// Addendum Spec B (Nico 14.10.): Atem im Werteblatt und im Kampf (aktuell/max + Verbrauch durch Zeichen).
VALUE_TIPS.atem = "Atem. Zeichen kosten im Kampf Atem; jeder Kampf beginnt mit vollem Atem. Mehr Atem bringen Grad 4 und Grad 7.";
function atemHtml() { return "<div class='card' data-tip='' data-vtip='atem' data-stat='atem'><b>Atem</b> " + (state.hero.apMax || 2) + "</div>"; }
const _useZeichenBasis = useZeichen;
useZeichen = function (c, id, cost) { const r = _useZeichenBasis(c, id, cost); c.atemLetzt = { name: D.ZEICHEN[id].name, cost }; return r; };
const _renderCombatWinBasis = renderCombatWin;
renderCombatWin = function () {
  _renderCombatWinBasis();
  const win = document.getElementById("combat-win"); if (!win || win.hidden) return;
  const hero = win.querySelector(".cw-hero"); if (!hero) return;
  let a = hero.querySelector(".cw-atem");
  if (!a) { a = document.createElement("div"); a.className = "cw-atem"; a.dataset.tip = ""; a.dataset.vtip = "atem"; hero.appendChild(a); }
  const c = state.inCombat && state.combat, max = state.hero.apMax || 2, cur = c ? Math.max(0, c.ap) : max;
  a.innerHTML = "<span class='cw-atem-wert'>Atem " + cur + " / " + max + "</span>" + "<span class='cw-atem-pips'>" + Array.from({ length: Math.max(max, cur) }, (_, i) => "<i class='" + (i < cur ? "voll" : "") + "'></i>").join("") + "</span>" +
    (c && c.atemLetzt ? "<span class='cw-atem-verbrauch'>−" + c.atemLetzt.cost + " " + esc(c.atemLetzt.name) + "</span>" : "");
};
