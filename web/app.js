const D = window.D;
const SAVE_KEY = "aschenkrone-slots";
let state = null;
let sheet = null;
let battleTimer = null;
let lastTalk = null;

// ---- Systeme: Zeit, Speicherstände, Ereignisse ----
const AUTO_SLOT = "auto";              // eigener Autosave-Slot (Schlüssel "auto" im selben localStorage-Objekt)
const HUBS = ["nebelpfad", "platz", "dorfzentrum", "alter_baum"];
const TIME_COST = { travel: 1, talk: 0, wait: 1, rest: 3 }; // Tageszeit-Schritte
const ON_NEW_DAY = [];                 // onNewDay-Hooks: fn(day)
// Nur für Tests: ?debug=1 in der URL gibt bei Neuem Spiel und bei jedem Laden +500 Gold. Ohne Parameter keine Wirkung.
const DEBUG = (() => { try { return new URLSearchParams(window.location.search).get("debug") === "1"; } catch { return false; } })();
let activeSlot = AUTO_SLOT;            // Slot für laufendes Speichern: "auto" bis der Spieler ausdrücklich in 1–3 speichert oder daraus lädt
const EQUIP_SLOTS = [
  { id: "kopf", name: "Kopf", x: 50, y: 10, ph: "items/slot_kopf.jpg" },
  { id: "amulett", name: "Amulett", x: 17, y: 18, ph: "items/slot_amulett.jpg" },
  { id: "ring", name: "Ring", x: 83, y: 18, ph: "items/slot_ring.jpg" },
  { id: "brust", name: "Rüstung", x: 50, y: 33, ph: "items/slot_brust.jpg" },
  { id: "haende", name: "Hände", x: 17, y: 42, ph: "items/slot_haende.jpg" },
  { id: "schild", name: "Schild", x: 83, y: 42, ph: "items/slot_schild.jpg" },
  { id: "waffeL", name: "Waffe links", x: 17, y: 66, ph: "items/slot_waffeL.jpg" },
  { id: "waffeR", name: "Waffe rechts", x: 83, y: 66, ph: "items/slot_waffeR.jpg" },
  { id: "beine", name: "Beine", x: 50, y: 61, ph: "items/slot_beine.jpg" },
  { id: "fuesse", name: "Füße", x: 50, y: 89, ph: "items/slot_fuesse.jpg" }
];

function art(rel) {
  if (!rel) return "";
  const base = String(rel).split("/").pop().replace(/\.[^.]+$/, "");
  return "../assets/" + rel.replace(/^assets\//, "");
}
function onImg(img, rel, fallbacks) {
  const list = [rel].concat(fallbacks || []).filter(Boolean);
  let i = 0;
  const next = () => {
    if (i >= list.length) { img.removeAttribute("src"); img.hidden = true; return; }
    img.hidden = false;
    img.src = art(list[i++]);
  };
  img.onerror = next;
  next();
}
function bg(node, rel) {
  if (!rel) { node.style.backgroundImage = "none"; return; }
  node.style.backgroundImage = 'url("' + art(rel) + '")';
}
function areaBg(node, rel, scrim) {
  if (!node) return;
  if (!rel) { node.style.backgroundImage = "none"; return; }
  node.style.backgroundImage = (scrim ? scrim + "," : "") + 'url("' + art(rel) + '")';
  node.style.backgroundSize = "cover";
  node.style.backgroundPosition = "center";
  node.style.backgroundRepeat = "no-repeat";
}
function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function phaseInfo(id) { return D.DAY_PHASES.find((p) => p.id === id) || D.DAY_PHASES[0]; }
function onNewDay(fn) { if (typeof fn === "function") ON_NEW_DAY.push(fn); }
// Einzige Stelle, an der Zeit vergeht: Tageszeit weiter, bei Umlauf neuer Tag + Hooks.
function advance(steps) {
  if (!state) return;
  const n = Math.max(0, Math.floor(steps || 0));
  for (let k = 0; k < n; k++) {
    const i = D.DAY_PHASES.findIndex((p) => p.id === state.phase);
    const next = (i + 1) % D.DAY_PHASES.length;
    state.phase = D.DAY_PHASES[next].id;
    if (next === 0) {
      state.day = (state.day || 1) + 1;
      ON_NEW_DAY.forEach((fn) => { try { fn(state.day); } catch (e) { console.error(e); } });
    }
  }
}
onNewDay((day) => log("Tag " + day + " beginnt."));
// Händler füllen nicht mehr täglich auf: Wochen-Sortiment und Wochen-Gold (systeme.js, merchState).
function bondLabel(v) {
  let name = D.BOND_STEPS[0].name;  // Skala unten geschlossen (Todfeind)
  for (const s of D.BOND_STEPS) if (v >= s.min) name = s.name;
  return name;
}
function slots() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY) || "{}"); } catch { return {}; }
}
function writeSlots(all) { localStorage.setItem(SAVE_KEY, JSON.stringify(all)); }
// Migrationen: MIGRATIONS[n] hebt einen Stand von v n auf v n+1. Stand ohne v = v0.
const MIGRATIONS = [
  function v0to1(s) {
    const B = D.BASE_HERO;
    s.hero = s.hero || {};
    const h = s.hero;
    if (typeof h.hpMax !== "number") h.hpMax = B.hpMax;
    if (typeof h.hp !== "number") h.hp = h.hpMax;
    Object.keys(B).forEach((k) => { if (typeof h[k] !== "number") h[k] = B[k]; });
    h.hp = clamp(h.hp, 0, h.hpMax);
    if (!h.name) h.name = "Namenlos";
    if (!D.HERKUENFTE[h.herkunftId]) h.herkunftId = "gossenschatten";
    if (!D.FLUECHE[h.fluchId]) h.fluchId = "kronenbrand";
    if (!h.herkunft) h.herkunft = D.HERKUENFTE[h.herkunftId].name;
    if (!h.fluch) h.fluch = D.FLUECHE[h.fluchId].name;
    if (!D.PORTRAITS[h.portraitId]) h.portraitId = D.PORTRAITS[h.herkunftId] ? h.herkunftId : "gossenschatten";
    if (!D.LOCATIONS[s.location]) s.location = "platz";
    if (!D.DAY_PHASES.some((p) => p.id === s.phase)) s.phase = "vormittag";
    if (!(s.day >= 1)) s.day = 1;
    ["flags", "quests", "bonds", "factions", "statXp"].forEach((k) => { if (!s[k] || typeof s[k] !== "object" || Array.isArray(s[k])) s[k] = {}; });
    if (!s.seenNarrator || typeof s.seenNarrator !== "object") s.seenNarrator = { intro: true, stadt: true };
    if (!Array.isArray(s.inventory)) s.inventory = [];
    if (!Array.isArray(s.log)) s.log = [];
    const eq = (s.equipped && typeof s.equipped === "object") ? s.equipped : {};
    s.equipped = {};
    Object.keys(eq).forEach((slot) => {
      const it = D.ITEMS[eq[slot]];
      if (it && EQUIP_SLOTS.some((x) => x.id === slot)) s.equipped[slot] = it.id;
      else if (eq[slot]) s.inventory.push(eq[slot]);
    });
    D.STAT_KEYS.forEach((k) => { if (!s.statXp[k.id]) s.statXp[k.id] = { xp: 0, need: k.id === "grad" ? 40 : 12 }; });
    if (s.dialogue === undefined) s.dialogue = null;
    s.trading = !!s.trading;
    s.inCombat = !!(s.inCombat && s.combat);
    if (!s.inCombat) s.combat = null;
    if (s.narrator === undefined) s.narrator = null;
    // Niederlage gegen den Wolf schon erlebt -> Tamsins einmalige Zeile gilt als gesehen.
    if (s.flags.wolf_niederlage) s.flags.ev_wolf_niederlage_tamsin = true;
    return s;
  },
  // v1 -> v2: Stapel. Beutel bleibt eine Liste von Ids (Stapel = gleiche Ids, nur gruppiert angezeigt);
  // neu ist der Händlerbestand state.stock { shopId: { itemId: Anzahl } }, leer = Grundbestand aus data.js.
  function v1to2(s) {
    if (!s.stock || typeof s.stock !== "object" || Array.isArray(s.stock)) s.stock = {};
    s.inventory = (s.inventory || []).filter((id) => typeof id === "string");
    return s;
  },
  // v2 -> v3: Werte (werte.md): state.values, state.daily, state.buffs, Flag-Spiegel.
  function v2to3(s) { return migV3(s); },
  // v3 -> v4: Beziehungen (relations, npcEnd, world.pendingBonds), wolf_tot -> wolf_slain gespiegelt.
  function v3to4(s) { return migV4(s); },
  // v4 -> v5: Fraktionen als Achsen (gunst = max(0,n), zorn = max(0,−n)); state.factions bleibt Spiegel.
  function v4to5(s) { return migV5(s); },
  // v5 -> v6: Grad aus Wachstum (statStart/statPeak), Nachhol-Wahlen, Zeichen, Kampfstand.
  function v5to6(s) { return migV6(s); },
  // v6 -> v7: Perks (Male/Flüche/Segen); alter Fluch -> perks.flueche fluch_<alt> (Stufe 3, baked, migriert).
  function v6to7(s) { return migV7(s); },
  // v7 -> v8: Harn (Burgvogt) steht auf der Burg statt auf dem Markt; Wolf-Quest bleibt per NPC-Id abgebbar.
  function v7to8(s) { return migV8(s); },
  // v8 -> v9: Korrekturliste Nico: Geschlecht (fehlt -> nach Bild, sonst m), Avatar, Herkunft entfällt, Wolfstöter-Mal nur vom legendären Wolf.
  function v8to9(s) { return migV9(s); },
  // v9 -> v10: Ausbesserung 2: Händler-Gold/Bestand/Pool im Save (state.merchants), keine Ergebung mehr, Kampf-Endfenster.
  function v9to10(s) { return migV10(s); },
  // v10 -> v11: Q-11: Altstände mit verschontem/verhandeltem Wolf schließen offene Wolf-Quests ohne Lohn (kein Ewig-offen).
  function v10to11(s) {
    const f = s.flags || {}, q = s.quests || {};
    if ((f.wolf_spared || f.wolf_bargain) && !f.wolf_slain && !f.wolf_tot) {
      ["wolfspfad", "tamsin_wolf"].forEach((id) => { if (q[id] === "active") q[id] = "done"; });
      f.wolf_dealt = true; f.cleared_russwolf = true; f.wolf_alt_geschlossen = true;
      if (s.inCombat && s.combat && s.combat.id === "russwolf") { s.inCombat = false; s.combat = null; }
    }
    return s;
  }
];
const SAVE_VERSION = MIGRATIONS.length;
function migrate(s) {
  if (!s || typeof s !== "object") return s;
  let v = typeof s.v === "number" ? s.v : 0;
  while (v < MIGRATIONS.length) { s = MIGRATIONS[v](s) || s; v += 1; s.v = v; }
  return s;
}
function slotLabel(s) {
  const loc = D.LOCATIONS[s.location];
  const gold = (s.hero && typeof s.hero.gold === "number") ? s.hero.gold : D.BASE_HERO.gold;
  return "Tag " + (s.day || 1) + " · " + phaseInfo(s.phase).name + " · " + (loc ? loc.name : "?") + " · " + gold + " Gold";
}
function save(n) {
  if (!state) return;
  state.v = SAVE_VERSION;
  state.savedAt = Date.now();  // für „Fortsetzen“: neuester Stand gewinnt
  const all = slots();
  all[n] = state;
  writeSlots(all);
}
function persist() { save(activeSlot); }
function autosave() { save(AUTO_SLOT); }
function load(n) {
  const raw = slots()[n];
  if (!raw || !raw.hero) return false;
  state = migrate(raw);
  // Ein laufender Kampf-Tick überlebt das Laden nicht: wieder vor die Wahl stellen.
  if (state.inCombat && state.combat) state.combat.engaged = false;
  // Offene Gespräche/Handel sind reiner UI-Zustand und lassen sich nach dem Laden nicht fortsetzen.
  state.dialogue = null; state.trading = false;
  fixTwoHanded();
  if (DEBUG) state.hero.gold += 500;
  activeSlot = n;
  return true;
}

// Fluchwahl und Herkunft entfallen (Entscheid Nico): Geschlecht, Avatar und frei verteilte Startpunkte.
function cleanPoints(pts) {
  const P = D.START_POOL, out = {}; let left = P.punkte;
  P.keys.forEach((k) => { const n = Math.max(0, Math.min(P.max, Math.floor(Number((pts || {})[k.id]) || 0), left)); if (n) { out[k.id] = n; left -= n; } });
  return out;
}
function createHero(name, gender, portraitId, points) {
  gender = gender === "w" ? "w" : "m";
  const av = D.AVATARE[portraitId] && D.AVATARE[portraitId].g === gender ? D.AVATARE[portraitId] : D.AVATARE["avatar_" + gender + "1"];
  const pts = cleanPoints(points);
  const f = { id: null, name: "", mods: {} };
  const h = { mods: { ...pts, gold: D.START_POOL.gold - D.BASE_HERO.gold, hp: D.START_POOL.hp } };
  const hero = { name: (name || "Namenlos").slice(0, 18), gender, portraitId: av.id, startMods: pts, fluchId: null, fluch: "", ...D.BASE_HERO };
  const apply = (mods = {}) => {
    if (mods.hp) { hero.hp += mods.hp; hero.hpMax += mods.hp; }
    ["atk", "def", "will", "gold", "fortune", "crit"].forEach((k) => { if (mods[k]) hero[k] = (hero[k] || 0) + mods[k]; });
    if (mods.ap) { hero.ap += mods.ap; hero.apMax += mods.ap; }  // Atem: Nebelwanderer +1
  };
  apply(h.mods); apply(f.mods);
  hero.hp = clamp(hero.hp, 8, 99);
  hero.hpMax = clamp(hero.hpMax, 8, 99);
  return hero;
}
// Alle beginnen in Unterorten (Dorfzentrum); der erste Wolf wartet beim Verlassen auf dem Nebelpfad.
const START_LOCATION = "dorfzentrum";
function newGame(payload) {
  state = {
    hero: createHero(payload.name, payload.gender, payload.portraitId, payload.points),
    v: 0, location: START_LOCATION, phase: "vormittag", day: 1,
    inventory: ["glutphiole"], equipped: {}, flags: {}, log: [],
    quests: {}, bonds: {}, factions: {}, seenNarrator: { intro: true, unterorten: true },
    dialogue: null, trading: false, inCombat: false, combat: null,
    narrator: { ...D.NARRATOR.intro }, statXp: {}, stock: {}
  };
  D.STAT_KEYS.forEach((k) => { state.statXp[k.id] = { xp: 0, need: k.id === "grad" ? 40 : 12 }; });
  sysNewGame(state);  // neue Systeme (systeme.js) wie bei der Migration anlegen
  state.v = SAVE_VERSION;
  if (DEBUG) state.hero.gold += 500;
  activeSlot = AUTO_SLOT;  // Neues Spiel schreibt nur den Autosave, Slots 1–3 bleiben unberührt
  save(AUTO_SLOT);
  openPlay();
}
function log(line) {
  state.log.unshift(line);
  state.log = state.log.slice(0, 30);
}
function gain(key, amount) {
  if (key === "grad") return;  // Grad entsteht aus Wachstum, nicht aus XP (grad-zeichen-kampf §2.1)
  const row = state.statXp[key] || { xp: 0, need: 12 };
  if (amount > 0) noteTrain(key);
  row.xp += amount;
  // Grundwert-Deckel (werte §3.2): am Deckel kein Aufstieg, xp bleibt knapp darunter.
  if (key !== "grad" && statCapped(key) && row.xp >= row.need) row.xp = row.need - 1;
  while (row.xp >= row.need && (key === "grad" || !statCapped(key))) {
    row.xp -= row.need;
    row.need = Math.round(row.need * 1.25);
    if (key === "grad") { state.hero.level += 1; state.hero.hpMax += 4; state.hero.hp = Math.min(maxHp(), state.hero.hp + 4); log("Grad steigt auf " + state.hero.level + "."); }
    else { state.hero[key] = (state.hero[key] || 0) + 1; if (typeof emitDelta === "function") emitDelta({ kind: "stat", key, delta: 1 }); log((D.STAT_KEYS.find((s) => s.id === key) || {}).name + " steigt."); }
  }
  state.statXp[key] = row;
  trackPeak();
}
// Nähe: Kurve, Tagesdeckel, bondPlus nur bei Gespräch/Geschenk (beziehungen.md §2), Umsetzung in systeme.js.
function bumpBond(id, d, opts) { return bumpBondSys(id, d, opts); }
// Gesprächs-/Kampfansicht leeren (Person + Gespräch), z. B. nach Kampfende oder beim Reisen.
function clearInteractionView() {
  lastTalk = null;
  if (state) state.combatEnd = null;
  showFace(null);
  showLine("", []);
}
// Gebiet eines Ortes; Nebenorte ohne eigenes Gebiet erben es vom Elternort.
function regionOf(loc) {
  let l = loc, guard = 0;
  while (l && !(l.region && D.REGIONS[l.region]) && l.parent && guard++ < 8) l = D.LOCATIONS[l.parent];
  return (l && D.REGIONS[l.region]) || {};
}
function travel(toId) {
  if (!toId || !state) return;
  if (state.narrator || state.dialogue || state.inCombat || state.trading) return;
  const dest = D.LOCATIONS[toId];
  const here = D.LOCATIONS[state.location];
  if (!dest || !here) return;
  if (!(here.exits || []).some((ex) => ex.id === toId)) return;
  // Nebenorte: hinein nur vom Hauptort, hinaus nur zurück zum Hauptort.
  if (dest.parent && here.id !== dest.parent && here.parent !== toId) return;
  if (here.parent && toId !== here.parent && dest.parent !== here.id) return;  // tiefere Nebenorte (Kalte Halle → Spiegelkammer)
  state.location = toId;
  clearInteractionView();  // Reste von Kampf/Siegfenster nicht in den neuen Ort mitnehmen
  advance(TIME_COST.travel);
  log("Ihr erreicht " + dest.name + ".");
  if (!state.seenNarrator[dest.region] && D.NARRATOR[dest.region]) {
    state.seenNarrator[dest.region] = true;
    state.narrator = { ...D.NARRATOR[dest.region] };
  }
  const ev = pickEvent(toId);
  if (ev) runEvent(ev, {});
  else { const sp = rollSpawn(toId); if (sp) EVENT_HANDLERS.startEncounter({ arg: sp }); }
  gain("grad", 2);
  persist();
  if (HUBS.includes(toId)) autosave();
  render();
}
// ---- Ereignisse je Ort (Daten: LOCATIONS[x].events) ----
const EVENT_HANDLERS = {
  // Begegnung starten; liegt gerade eine Erzähler-Rolle offen, beginnt sie nach dem Schließen.
  startEncounter(ev) {
    const safe = Math.min(30, gearFx("travelSafePct"));
    if (safe > 0 && Math.random() * 100 < safe) { log("Ihr kommt ungesehen vorbei."); return; }
    if (state.narrator) state.pending = ev.arg;
    else startCombat(ev.arg);
  },
  // Einmalige Zeile von Tamsin nach der ersten Niederlage gegen den Wolf.
  wolfDefeatTamsin(ev, ctx) {
    lastTalk = D.NPCs.tamsin;
    showFace(D.NPCs.tamsin);
    showLine((ctx.blows ? ctx.blows + "\n" : "") + D.WOLF_LINES.wolf_niederlage, [{ label: "Weiter", go: "clear" }]);
  }
};
function eventMatches(ev) {
  if (!ev || !EVENT_HANDLERS[ev.run]) return false;
  if (ev.once && state.flags["ev_" + ev.id]) return false;
  const w = ev.when || {};
  if (w.phase) {
    const ph = Array.isArray(w.phase) ? w.phase : [w.phase];
    if (!ph.includes(state.phase)) return false;
  }
  if (w.flags) {
    for (const k of Object.keys(w.flags)) if (!!state.flags[k] !== !!w.flags[k]) return false;
  }
  if (w.quest) {
    for (const q of Object.keys(w.quest)) if ((state.quests[q] || null) !== w.quest[q]) return false;
  }
  return sysWhen(w);
}
function pickEvent(locId) {
  const loc = D.LOCATIONS[locId];
  const list = ((loc && loc.events) || []).filter(eventMatches);
  list.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  return list[0] || null;
}
function runEvent(ev, ctx) {
  if (ev.once) state.flags["ev_" + ev.id] = true;
  EVENT_HANDLERS[ev.run](ev, ctx || {});
}
function startCombat(id) { startCombatSys(id); }  // Kampfstand mit Tempo, Atem, Zeichen (systeme.js)
function engage() {
  if (!state.combat || state.combat.engaged) return;
  state.combat.engaged = true;
  if (battleTimer) return;
  battleTimer = setInterval(tick, 400);
}
function tick() { sysTick(); }  // Zeit-Akkumulator, Mindestschaden, Zeichen (systeme.js)
function tickAlt() {
  const foe = state.combat;
  if (!foe || !foe.engaged) return;
  const dmgYou = Math.max(1, (state.hero.atk || 4) + gearBonus("atk") + gearFx("vsMonster", foe.id) - (foe.def || 0) + Math.floor(Math.random() * 3));
  foe.hp -= dmgYou;
  const hitLine = "Ihr trefft " + foe.name + " (" + dmgYou + ").";
  foe.log.push(hitLine);
  log(hitLine);
  if (foe.hp <= 0) {
    const gold = foe.gold[0] + Math.floor(Math.random() * (foe.gold[1] - foe.gold[0] + 1));
    state.hero.gold += gold;
    let lootName = "";
    if (foe.loot && foe.loot[0] && !state.inventory.includes(foe.loot[0])) {
      state.inventory.push(foe.loot[0]);
      lootName = (D.ITEMS[foe.loot[0]] && D.ITEMS[foe.loot[0]].name) || "";
    }
    state.flags["cleared_" + foe.id] = true;
    if (foe.id === "russwolf") { state.flags.wolf_tot = true; state.flags.wolf_slain = true; state.flags.wolf_dealt = true; state.pendingNarrator = { ...D.NARRATOR.wolf_tot }; }
    gain("atk", 4); gain("grad", 8);
    log(foe.name + " fällt. +" + gold + " Gold.");
    const blows = foe.log.join("\n");
    clearInterval(battleTimer); battleTimer = null;
    state.inCombat = false; state.combat = null;
    showLine(blows + "\n" + foe.name + " fällt. +" + gold + " Gold." + (lootName ? " Beute: " + lootName + "." : "") + " Der Weg ist frei.", [{ label: "Weiter", go: "clear" }]);
    persist(); render(); return;
  }
  const dmgFoe = Math.max(1, (foe.atk || 4) - ((state.hero.def || 0) + gearBonus("def")));
  state.hero.hp -= dmgFoe;
  const foeLine = foe.name + " trifft euch (" + dmgFoe + ").";
  foe.log.push(foeLine);
  log(foeLine);
  if (state.hero.hp <= 0) {
    if (foe.id === "russwolf") { wolfDefeat(); return; }
    const blows = foe.log.join("\n");
    state.hero.hp = Math.max(4, Math.floor(state.hero.hpMax / 3));
    clearInterval(battleTimer); battleTimer = null;
    state.inCombat = false; state.combat = null;
    log("Ihr fallt und kommt schwer wieder auf.");
    showLine(blows + "\nIhr kommt wieder zu euch. Etwas bleibt.", [{ label: "Weiter", go: "clear" }]);
  }
  persist(); render();
}
function flee() { if (state.inCombat) sysFlee(); }  // ein Versuch je 3 Ticks, Fehlschlag = Erstschlag
function fleeAlt() {
  if (!state.inCombat) return;
  const fleeFx = clamp(gearFx("fleePct"), -15, 15) / 100;
  if (Math.random() < clamp(0.45 + willEff() * 0.03 + fleeFx, 0.1, 0.9)) {  // willEff: Gear-Wille höchstens +3
    clearInterval(battleTimer); battleTimer = null;
    state.inCombat = false; state.combat = null;
    log("Ihr entgleitet.");
    showFace(null);
    showLine("Ihr entgleitet. Der Schlag geht vorbei.", []);
  } else state.combat.note = "Der Weg bleibt versperrt.";
  render();
}
function resolveWolf(flag) {
  if (!state.inCombat || !state.combat || state.combat.id !== "russwolf" || state.combat.engaged) return;
  clearInterval(battleTimer); battleTimer = null;
  state.inCombat = false;
  state.combat = null;
  state.flags[flag] = true;
  state.flags.cleared_russwolf = true;
  if (!state.flags.wolf_dealt) { state.flags.wolf_dealt = true; parkWolfBonds(flag); }
  state.pending = null;
  log(flag === "wolf_spared" ? "Ihr lasst den Rußwolf gehen." : "Ihr einigt euch mit dem Rußwolf.");
  lastTalk = null;
  persist();
  render();
  showFace(null);
  showLine(D.WOLF_LINES[flag], [{ label: "Weiter", go: "clear" }]);
}
function wolfDefeat() {
  const blows = (state.combat && state.combat.log) ? state.combat.log.join("\n") : "";
  clearInterval(battleTimer); battleTimer = null;
  state.hero.hp = Math.max(4, Math.floor(state.hero.hpMax / 3));
  state.inCombat = false;
  state.combat = null;
  state.flags.wolf_niederlage = true;
  state.location = "dorfzentrum";
  state.dialogue = null;
  state.trading = false;
  state.pending = null;
  log("Der Wolf wirft euch nieder. Ihr wacht am Brunnen in Unterorten auf.");
  render();
  const ev = pickEvent("dorfzentrum");
  if (ev) runEvent(ev, { blows: "" });  // Kampfverlauf steht nur im Kampffenster
  else {
    showFace(null);
    showLine(D.WOLF_LINES.wolf_niederlage, [{ label: "Weiter", go: "clear" }]);
  }
  persist();
  autosave();
  render();
}
function talk(id) {
  if (state.narrator || state.inCombat) return;
  const npc = D.NPCs[id];
  if (!npc || npc.location !== state.location) return;
  if (npc.hours && !npc.hours.includes(state.phase)) return;
  state.dialogue = { npcId: id, node: "start" };
  if (!state.flags["met_" + id]) { state.flags["met_" + id] = true; rel(id); bumpBond(id, 4, { source: "first" }); }
  onTalk(id);
  lastTalk = npc;
  advance(TIME_COST.talk);
  renderTalk();
  render();
}
function talkChoices() {
  const npc = lastTalk;
  if (!npc || !state.dialogue) return [];
  const node = state.dialogue.node;
  const choices = [];
  if (node === "start") {
    if (npc.id === "burgvogt" && !state.quests.wolfspfad && !state.flags.wolf_alt_geschlossen) choices.push({ label: "Nach dem Pfad fragen", go: "quest" });
    if (npc.id === "burgvogt" && state.quests.wolfspfad === "active" && (state.flags.wolf_slain || state.flags.wolf_tot)) choices.push({ label: "Den Wolf melden", go: "done" });
    if (npc.id === "tamsin" && !state.quests.tamsin_wolf && !state.flags.wolf_alt_geschlossen) choices.push({ label: "Fragen, was das Dorf braucht", go: "quest" });
    if (npc.id === "tamsin" && state.quests.tamsin_wolf === "active" && (state.flags.wolf_slain || state.flags.wolf_tot)) choices.push({ label: "Sagen, der Pfad ist frei", go: "done" });
    sysTalkChoices(npc, choices);
    if (npc.merchant && !haendlerVerweigert(npc)) choices.push({ label: "Handeln", go: "shop" });
  }
  if (node === "shop") choices.push({ label: "Handel beenden", go: "endtrade" });
  choices.push({ label: "Gehen", go: "leave" });
  return choices;
}
function choose(go) {
  if (go === "spare" || go === "bargain") return;  // Wolf nur Kämpfen/Entgleiten (Q-04); resolveWolf bleibt unerreichbar
  if (go === "clear" || go === "leave") {
    state.dialogue = null; state.trading = false; lastTalk = null; sheet = null; state.combatEnd = null;
    document.getElementById("scene-sheet").hidden = true;
    if (go === "clear" && state.pendingNarrator) {
      state.narrator = state.pendingNarrator;
      state.pendingNarrator = null;
    }
    showFace(null);
    showLine("", []);
    render(); return;
  }
  if (sysChoose(go)) return;
  const npc = D.NPCs[state.dialogue.npcId];
  if (go === "quest") {
    if (npc.id === "burgvogt") state.quests.wolfspfad = "active";
    if (npc.id === "tamsin") state.quests.tamsin_wolf = "active";
    bumpBond(npc.id, 3, { source: "quest_story" });
  }
  if (go === "done") {
    if (npc.id === "burgvogt" && state.quests.wolfspfad === "active") {
      // Q-01 (a): wer zuerst abgibt, bekommt den vollen Lohn; die zweite Abgabe nur Dank (halbes Gold, halbe Bindung, keine Fraktion).
      const zweit = state.quests.tamsin_wolf === "done";
      state.quests.wolfspfad = "done";
      if (zweit) { state.hero.gold += 9; bumpBond("burgvogt", 4, { source: "quest_story" }); }
      else { state.hero.gold += 18; bumpBond("burgvogt", 8, { source: "quest_story" }); bumpTrust("burgvogt", 8); bumpFaction("krone", "gunst", 6); gain("ansehen", 6); }
    }
    if (npc.id === "tamsin" && state.quests.tamsin_wolf === "active") {
      const zweit = state.quests.wolfspfad === "done";
      state.quests.tamsin_wolf = "done";
      if (zweit) { state.hero.gold += 4; bumpBond("tamsin", 5, { source: "quest_story" }); }
      else { state.hero.gold += 8; bumpBond("tamsin", 10, { source: "quest_story" }); bumpTrust("tamsin", 8); bumpFaction("rat", "gunst", 5); }
    }
  }
  state.dialogue.node = go === "endtrade" ? "start" : go;
  state.trading = state.dialogue.node === "shop";
  if (state.trading) openTrade();
  else if (sheet === "trade") { sheet = null; document.getElementById("scene-sheet").hidden = true; }
  renderTalk();
  persist(); render();
}
function renderTalk() {
  const npc = lastTalk;
  const node = state.dialogue && state.dialogue.node;
  const spoken = (npc.talk && (npc.talk[node] || npc.talk.start)) || npc.text;
  showFace(npc);
  showLine(spoken, talkChoices());
}
function showFace(p) {
  const fill = document.getElementById("face-fill");
  const facePane = document.getElementById("pane-face");
  const talkPane = document.getElementById("pane-talk");
  if (!p) {
    fill.hidden = true;
    facePane.classList.remove("interacting");
    talkPane.classList.remove("interacting");
    return;
  }
  fill.hidden = false;
  facePane.classList.add("interacting");
  talkPane.classList.add("interacting");
  document.getElementById("face-title").textContent = p.title || "";
  document.getElementById("face-name").textContent = p.name || "";
  const isNpc = !!(p.id && D.NPCs[p.id]);  // Gegner haben keine Beziehung
  const bondEl = document.getElementById("face-bond");
  bondEl.textContent = isNpc ? "Nähe · " + bondLabel(state.bonds[p.id] || 0) : "";
  bondEl.hidden = !isNpc;
  document.getElementById("face-hint").textContent = p.merchant ? "Händler" : (p.text || "");
  facePane.classList.toggle("foe", !isNpc);
  onImg(document.getElementById("face-art"), p.art, p.id ? ["npcs/" + p.id + ".jpg", "monsters/" + p.id + ".jpg"] : []);
}
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function showLine(text, choices) {
  document.getElementById("talk-who").textContent = lastTalk ? (lastTalk.name + " · " + (lastTalk.title || "")) : (state.inCombat && state.combat ? state.combat.name : "");
  document.getElementById("talk-line").innerHTML = esc(text || "").replace(/\n/g, "<br>");
  const box = document.getElementById("talk-choices");
  box.innerHTML = "";
  (choices || []).forEach((c) => {
    const b = document.createElement("button");
    b.textContent = c.label;
    b.onclick = () => choose(c.go);
    box.appendChild(b);
  });
  document.getElementById("combat-acts").hidden = !(state.inCombat && state.combat && !state.combat.engaged && !state.combat.surrendered);
}
function waitFor(id) {
  const npc = D.NPCs[id];
  if (!npc) return;
  for (let i = 0; i < D.DAY_PHASES.length; i++) {
    advance(TIME_COST.wait);
    if (!npc.hours || npc.hours.includes(state.phase)) break;
  }
  log(npc.name + " ist " + phaseInfo(state.phase).name + " da.");
  persist(); render();
}
function rest() {
  const loc = D.LOCATIONS[state.location];
  if (!loc || !loc.rest) return;
  state.hero.hp = maxHp();
  onRest();
  advance(Math.max(1, TIME_COST.rest - gearFx("restSteps")));
  log("Ihr ruht und kommt wieder zu Kräften.");
  persist(); render();
}
// ---- Ausrüstungswerte & Handel (Erweiterung) ----
const STAT_NAMES = { atk: "Angriff", def: "Panzer", will: "Wille", hp: "Leben max", heal: "Heilt" };
function gearBonus(key) {
  if (!state || !state.equipped) return 0;
  return Object.values(state.equipped).reduce((sum, id) => sum + ((D.ITEMS[id] && D.ITEMS[id][key]) || 0), 0);
}
// Altstände (vor der Zweihand-Regel) bereinigen: Zweihänder + Schild/Waffe rechts -> Beutel.
function fixTwoHanded() {
  const w = state && state.equipped && D.ITEMS[state.equipped.waffeL];
  if (!w || !w.twoHanded) return;
  ["waffeR", "schild"].forEach((sl) => { if (state.equipped[sl]) { state.inventory.push(state.equipped[sl]); delete state.equipped[sl]; } });
}
// Effekte (Item-Feld fx, Werte laut docs/items-werte-2026-10-11.md), summiert wie gearBonus; sub z. B. Monster-ID bei vsMonster.
function gearFx(key, sub) {
  if (!state || !state.equipped) return 0;
  return Object.values(state.equipped).reduce((sum, id) => {
    const fx = D.ITEMS[id] && D.ITEMS[id].fx;
    const v = fx && fx[key];
    return sum + ((sub !== undefined ? (v && v[sub]) : v) || 0);
  }, 0);
}
function maxHp() { return Math.max(1, state.hero.hpMax + gearBonus("hp") + (typeof perkMod === "function" ? perkMod("hp") : 0)); }
function buyPrice(it) {
  const pct = Math.min(15, gearFx("tradePct") + (typeof perkTradePct === "function" ? perkTradePct(lastTalk) : 0));
  return Math.max(1, Math.round(it.price * (1 - pct / 100) * rufPreisFaktor(lastTalk)));
}
function sellPrice(it) { return it.price ? Math.floor(it.price / 2) : (it.sell || 0); }
function statText(it) {
  if (!it) return "";
  return (it.slot ? ["atk", "def", "will", "hp"] : ["heal"]).filter((k) => it[k]).map((k) => STAT_NAMES[k] + (k === "heal" ? " " : " +") + it[k]).join(", ");
}
function compareText(it) {
  if (!it || !it.slot) return "";
  const slots = it.slot === "waffeL" ? ["waffeL", "waffeR"] : [it.slot];
  const cur = slots.map((sl) => D.ITEMS[state.equipped[sl]]).filter(Boolean)[0];
  if (!cur) return "Slot frei – nichts angelegt.";
  const diff = ["atk", "def", "will", "hp"].filter((k) => (it[k] || 0) !== (cur[k] || 0))
    .map((k) => { const d = (it[k] || 0) - (cur[k] || 0); return STAT_NAMES[k] + " " + (d > 0 ? "+" : "") + d; });
  return "Angelegt: " + cur.name + (statText(cur) ? " (" + statText(cur) + ")" : "") + " → " + (diff.length ? diff.join(", ") : "gleichwertig");
}
function stallById(id) {
  for (const loc of Object.values(D.LOCATIONS)) for (const st of (loc.stalls || [])) if (st.id === id) return st;
  return null;
}
// Namenloser Marktstand: nutzt den bestehenden Handelsweg (lastTalk.shop, buy, sell, choose("leave")).
function openStall(id) {
  if (!state || state.narrator || state.inCombat || state.trading) return;
  const st = stallById(id);
  if (!st || !(D.LOCATIONS[state.location].stalls || []).includes(st)) return;
  lastTalk = { id: st.id, name: st.label, title: "Stand", shop: st.shop, stock: st.stock, merchant: true, buys: true, stall: true };
  state.dialogue = { npcId: st.id, node: "shop" };
  state.trading = true;
  showFace(null);
  showLine("Ein Stand mit dem Schild „" + st.label + "“.", [{ label: "Handel beenden", go: "leave" }]);
  openTrade();
  render();
}
// --- Stapel: verbrauch/ware/quest stapeln, Ausrüstung bleibt einzeln ---
const STACK_TYPES = ["verbrauch", "ware", "quest"];
function stackable(it) { return !!it && STACK_TYPES.includes(it.type); }
function invCount(id) { return state.inventory.filter((x) => x === id).length; }
// Gruppiert eine Id-Liste zu [{ it, n }]; Stapelbares einmal mit Anzahl, Ausrüstung je Stück.
function groupItems(ids) {
  const out = [], seen = {};
  ids.forEach((id) => {
    const it = D.ITEMS[id];
    if (!it) return;
    if (stackable(it)) { if (seen[id]) { seen[id].n += 1; return; } seen[id] = { it, n: 1 }; out.push(seen[id]); }
    else out.push({ it, n: 1 });
  });
  return out;
}
function stackName(it, n) { return it.name + (n > 1 ? " ×" + n : ""); }
// Händlerbestand: null = unbegrenzt (Ausrüstung ohne stock-Eintrag, wie bisher).
function shopStock(npc, id) {
  if (!npc) return null;
  const cur = state.stock && state.stock[npc.id];
  if (cur && typeof cur[id] === "number") return cur[id];
  const base = npc.stock || {};
  if (typeof base[id] === "number") return base[id];
  return stackable(D.ITEMS[id]) && (npc.shop || []).includes(id) ? 1 : (stackable(D.ITEMS[id]) ? 0 : null);
}
function setShopStock(npc, id, n) {
  if (!state.stock) state.stock = {};
  if (!state.stock[npc.id]) state.stock[npc.id] = {};
  state.stock[npc.id][id] = Math.max(0, n);
}
function buy(id) {
  const it = D.ITEMS[id];
  if (!it || state.hero.gold < buyPrice(it)) return;
  const left = shopStock(lastTalk, id);
  if (left !== null && left < 1) return;
  if (left !== null) setShopStock(lastTalk, id, left - 1);
  const mk = merchState(lastTalk); if (mk) mk.gold += buyPrice(it);
  state.hero.gold -= buyPrice(it);
  state.inventory.push(id);
  persist(); openTrade(); render();
}
function sell(id) {
  const it = D.ITEMS[id];
  const i = state.inventory.indexOf(id);
  if (i < 0 || !it || !it.sell || it.type === "quest") return;
  const mk = merchState(lastTalk);
  if (mk && mk.gold < sellPrice(it)) return;  // Händlerkasse leer: Verkauf gesperrt (Hinweis im Detailfeld)
  state.inventory.splice(i, 1);
  state.hero.gold += sellPrice(it);
  if (mk) { mk.gold -= sellPrice(it); mk.stock[id] = (mk.stock[id] || 0) + 1; }  // bleibt bis zum Wochen-Wechsel im Sortiment
  else if (stackable(it) && lastTalk) setShopStock(lastTalk, id, (shopStock(lastTalk, id) || 0) + 1);
  persist(); openTrade(); render();
}
function layoutDoll(doll) {
  const layout = doll && doll.parentElement;
  if (!layout) return;
  const z = layout.querySelector("#bag-zeichen");
  const bagL = layout.closest(".bag-layout");
  const availH = (bagL ? bagL.clientHeight : layout.clientHeight) - (z ? z.offsetHeight + 8 : 0);
  const availW = bagL ? Math.floor(bagL.clientWidth * 0.5) : layout.clientWidth;
  if (!availH || !availW) return;
  const maxW = Math.max(96, availW);
  let h = availH;
  let w = Math.floor(h * 604 / 900);
  if (w > maxW) { w = maxW; h = Math.floor(w * 900 / 604); }
  doll.style.width = w + "px";
  doll.style.height = h + "px";
  doll.style.flex = "0 0 auto";
  doll.style.maxHeight = "100%";
}
function equip(id) {
  const it = D.ITEMS[id];
  const i = state.inventory.indexOf(id);
  if (i < 0 || !it || !it.slot || it.type === "quest") return;
  if (!EQUIP_SLOTS.some((s) => s.id === it.slot)) return;
  const held = D.ITEMS[state.equipped.waffeL];
  if (held && held.twoHanded && !it.twoHanded && (it.slot === "waffeL" || it.slot === "schild")) {
    log(held.name + " braucht beide Hände. Erst ablegen.");
    persist(); render(); return;
  }
  if (it.twoHanded) {
    // Zweihänder: belegt beide Hände, Waffe rechts und Schild wandern in den Beutel.
    ["waffeR", "schild"].forEach((sl) => {
      if (state.equipped[sl]) { state.inventory.push(state.equipped[sl]); log((D.ITEMS[state.equipped[sl]] || {}).name + " in den Beutel gelegt."); delete state.equipped[sl]; }
    });
  }
  let slot = it.slot;
  // Einfach: zweite Waffe geht in die rechte Hand, solange die frei ist.
  if (slot === "waffeL" && !it.twoHanded && state.equipped.waffeL && !state.equipped.waffeR) slot = "waffeR";
  const prev = state.equipped[slot];
  state.inventory.splice(i, 1);
  if (prev) state.inventory.push(prev);
  state.equipped[slot] = id;
  log(it.name + " angelegt.");
  persist(); paintSheet(); render();
}
function unequip(slot) {
  const id = state.equipped[slot];
  if (!id) return;
  delete state.equipped[slot];
  state.inventory.push(id);
  state.hero.hp = Math.min(state.hero.hp, maxHp());
  log((D.ITEMS[id] ? D.ITEMS[id].name : id) + " abgelegt.");
  persist(); paintSheet(); render();
}
function useItem(id) {
  const it = D.ITEMS[id];
  const i = state.inventory.indexOf(id);
  if (i < 0 || !it || it.type !== "verbrauch") return;
  if (it.heal) state.hero.hp = Math.min(maxHp(), state.hero.hp + it.heal + gearFx("potionHeal"));
  if (it.wk) bumpWk(it.wk);  // Waldphiole: Willenskraft, nie Wille
  state.inventory.splice(i, 1);
  persist(); paintSheet(); render();
}
let tradePick = null;
function openTrade() {
  sheet = "trade";
  document.getElementById("scene-sheet").hidden = false;
  document.getElementById("scene-sheet").classList.add("trade");  // nur „Handel beenden“ schließt
  const npc = lastTalk;
  if (!npc) return;
  document.getElementById("sheet-title").textContent = "Handel · " + npc.name;
  const body = document.getElementById("sheet-body");
  const extra = Object.keys((state.stock || {})[npc.id] || {}).filter((id) => !(npc.shop || []).includes(id));
  const mk = merchState(npc);
  const buyList = (mk ? Object.keys(mk.stock).filter((id) => mk.stock[id] > 0) : (npc.shop || []).concat(extra)).map((id) => D.ITEMS[id]).filter(Boolean)
    .filter((it) => mk || shopStock(npc, it.id) !== 0 || (npc.shop || []).includes(it.id));
  const gold = state.hero.gold;
  body.classList.remove("scroll");
  const bgOn = hasArt("ui/handel_bg.jpg");
  document.getElementById("scene-sheet").classList.toggle("trade-bg", bgOn);
  if (bgOn) body.style.backgroundImage = "url('" + art("ui/handel_bg.jpg") + "')"; else body.style.backgroundImage = "";
  body.innerHTML = '<div class="trade-layout"><div class="trade-col trade-ware"><h3>Ware · ' + esc(npc.name) + '</h3>' +
    (mk ? '<div class="trade-gold trade-mgold">Kasse <b id="tr-mgold">' + mk.gold + '</b>' + (mk.gold < 5 ? ' <span class="tiny">· leer bis zur neuen Woche</span>' : '') + '</div>' : '') +
    '<div id="tr-buy" class="tile-grid"></div><div id="tr-detail" class="trade-detail"></div></div>' +
    '<div class="trade-sep"><span>◆</span></div>' +
    '<div class="trade-col trade-bag"><h3>Euer Beutel</h3><div class="trade-gold">Gold <b id="tr-gold">' + gold + '</b></div><div id="tr-sell" class="tile-grid"></div></div></div>';
  const tile = (it, priceTxt, cls, mode, n) => {
    const d = document.createElement("div");
    d.className = "card tile" + (cls ? " " + cls : "");
    d.dataset.item = it.id;
    d.dataset.mode = mode;
    d.dataset.tip = it.id; d.dataset.tipMode = mode;
    if (n > 1) d.dataset.tipCount = n;
    d.innerHTML = '<span class="tile-art"><img alt=""></span><b>' + esc(stackName(it, n)) + "</b><div class='tiny'>" + priceTxt + "</div>";
    const im = d.querySelector("img");
    if (it.img) onImg(im, it.img); else im.hidden = true;
    if (tradePick && tradePick.id === it.id && tradePick.mode === mode) d.classList.add("picked");
    const pick = () => {
      tradePick = { id: it.id, mode };
      document.querySelectorAll("#sheet-body .tile.picked").forEach((n) => n.classList.remove("picked"));
      d.classList.add("picked");
      paintTradeDetail();
    };
    d.onmouseenter = () => paintTradeDetail({ id: it.id, mode });
    d.onmouseleave = () => paintTradeDetail();
    d.onclick = pick;
    return d;
  };
  const b = document.getElementById("tr-buy");
  buyList.forEach((it) => {
    const n = shopStock(npc, it.id);
    if (n === 0) b.appendChild(tile(it, "ausverkauft", "locked", "none"));
    else b.appendChild(tile(it, buyPrice(it) + " Gold", gold < buyPrice(it) ? "poor" : "", "buy", n || 1));
  });
  const s = document.getElementById("tr-sell");
  groupItems(state.inventory).forEach(({ it, n }) => {
    const ok = it.sell && it.type !== "quest";
    s.appendChild(tile(it, ok ? sellPrice(it) + " Gold" : "unverkäuflich", ok ? "" : "locked", ok ? "sell" : "none", n));
  });
  Object.keys(state.equipped || {}).forEach((slot) => {
    const it = D.ITEMS[state.equipped[slot]];
    if (it) s.appendChild(tile(it, "angelegt", "locked worn", "worn"));
  });
  if (!s.children.length) s.innerHTML = "<p class='tiny'>Der Beutel ist leer.</p>";
  if (tradePick && !(tradePick.mode === "buy" ? buyList.some((it) => it.id === tradePick.id) && shopStock(npc, tradePick.id) !== 0 : state.inventory.includes(tradePick.id) || Object.values(state.equipped).includes(tradePick.id))) tradePick = null;
  paintTradeDetail();
}
function paintTradeDetail(hover) {
  const box = document.getElementById("tr-detail");
  if (!box) return;
  const pick = hover || tradePick;
  if (!pick) { box.innerHTML = "<span class='tiny'>Ware oder Beutel anklicken, um Werte und Vergleich zu sehen.</span>"; return; }
  const it = D.ITEMS[pick.id];
  if (!it) { box.innerHTML = ""; return; }
  let act = "";
  if (pick.mode === "buy") act = '<button id="tr-act" data-act="buy"' + (state.hero.gold < buyPrice(it) ? " disabled" : "") + ">Kaufen (" + buyPrice(it) + " Gold)</button>" + (state.hero.gold < buyPrice(it) ? " <span class='tiny'>Zu wenig Gold.</span>" : "");
  else if (pick.mode === "sell") { const mk = merchState(lastTalk); const broke = mk && mk.gold < sellPrice(it);
    act = '<button id="tr-act" data-act="sell"' + (broke ? " disabled" : "") + '>Verkaufen (' + sellPrice(it) + " Gold)</button>" + (broke ? " <span class='tiny trade-hint'>" + esc(lastTalk.name) + " hat nicht mehr genug Gold. Neues Gold in " + daysToRestock() + " Tagen.</span>" : ""); }
  else if (pick.mode === "worn") act = "<span class='tiny'>Angelegt. Erst im Beutel ablegen, dann verkaufen.</span>";
  else act = "<span class='tiny'>Nicht verkäuflich.</span>";
  const cnt = pick.mode === "buy" ? (shopStock(lastTalk, it.id) || 1) : (stackable(it) ? invCount(it.id) : 1);
  box.innerHTML = "<b>" + esc(stackName(it, cnt)) + "</b>" + (statText(it) ? " · " + statText(it) : "") + "<div class='tiny'>" + (it.text || "") + "</div>" +
    (compareText(it) ? "<div class='tiny'>" + compareText(it) + "</div>" : "") + "<div class='trade-act'>" + act + "</div>";
  const btn = document.getElementById("tr-act");
  if (btn && !hover) btn.onclick = () => (btn.dataset.act === "buy" ? buy(it.id) : sell(it.id));
  else if (btn) btn.onclick = () => { tradePick = pick; btn.dataset.act === "buy" ? buy(it.id) : sell(it.id); };
}
function heroGender() { return state && state.hero && state.hero.gender === "w" ? "w" : "m"; }
function hasArt(rel) { return (D.EXT_ART || []).includes(rel); }
function avatarOf(hero) { const a = D.AVATARE[hero && hero.portraitId]; return a ? (hasArt(a.art) ? [a.art, a.fb] : [a.fb]) : ["portraits/" + ((hero && hero.portraitId) || "gossenschatten") + ".jpg"]; }
function paintSheet() {
  const body = document.getElementById("sheet-body");
  document.getElementById("scene-sheet").classList.remove("trade");
  document.getElementById("scene-sheet").dataset.kind = sheet || "";
  const titles = { inventory: "Beutel", quests: "Bitten", stats: "Werte", zeichen: "Zeichen" };
  document.getElementById("sheet-title").textContent = titles[sheet] || "";
  body.classList.toggle("scroll", sheet === "stats" || sheet === "quests" || sheet === "zeichen");
  document.getElementById("scene-sheet").classList.remove("trade-bg");
  body.style.backgroundImage = "";
  if (typeof styleSheetKind === "function") styleSheetKind(body, sheet);
  if (sheet === "zeichen") { body.innerHTML = zeichenSheetHtml(); wireSheet(body); return; }
  if (sheet === "inventory") {
    body.innerHTML = '<div class="bag-layout"><div class="doll-col"><div class="paperdoll" id="paperdoll"><img class="doll-art" id="doll-art" alt=""></div>' + bagZeichenHtml() + '</div>' +
      '<div class="bag-side"><div class="bag-gold">Gold <b>' + state.hero.gold + '</b></div><div id="bag-list"></div></div></div>';
    const layoutEl = body.querySelector(".bag-layout");
    // Hintergrund nach Geschlecht (Ext Art ui/avatar_bg_m|w), sonst bleibt der bisherige.
    const bgRel = "ui/avatar_bg_" + heroGender() + ".jpg";
    if (hasArt(bgRel)) { layoutEl.style.backgroundImage = "linear-gradient(rgba(7,4,5,.35),rgba(7,4,5,.55)),url('" + art(bgRel) + "')"; layoutEl.classList.add("has-bg"); }
    const doll = document.getElementById("paperdoll");
    const figure = null;
    let dollArt = document.getElementById("doll-art");
    if (!dollArt && doll) {
      dollArt = document.createElement("img");
      dollArt.id = "doll-art";
      dollArt.className = "doll-art";
      dollArt.alt = "";
      doll.insertBefore(dollArt, doll.firstChild);
    }
    if (dollArt) { const sil = "ui/siluette_" + (heroGender() === "w" ? "frau" : "mann") + ".jpg"; onImg(dollArt, hasArt(sil) ? sil : "ui/siluette.jpg", ["ui/siluette.jpg"]); }
    if (doll) doll.style.backgroundImage = "none";
    if (doll) layoutDoll(doll);
    if (doll) {
      EQUIP_SLOTS.forEach((s) => {
        const b = document.createElement("button");
        b.className = "eq-slot";
        b.type = "button";
        b.style.left = s.x + "%";
        b.style.top = s.y + "%";
        const img = document.createElement("img");
        img.alt = "";
        const label = document.createElement("span");
        const twoH = s.id === "waffeR" && D.ITEMS[state.equipped.waffeL] && D.ITEMS[state.equipped.waffeL].twoHanded ? D.ITEMS[state.equipped.waffeL] : null;
        const worn = twoH || (state.equipped[s.id] && D.ITEMS[state.equipped[s.id]]);
        b.dataset.slot = s.id;
        if (twoH) {
          label.textContent = twoH.name;
          b.classList.add("worn", "twohand");
          b.dataset.tip = twoH.id; b.dataset.tipMode = "slot";
          onImg(img, twoH.img, [s.ph]);
          b.onclick = () => unequip("waffeL");
        } else if (worn) {
          label.textContent = worn.name;
          b.classList.add("worn");
          b.dataset.tip = worn.id; b.dataset.tipMode = "slot";
          onImg(img, worn.img, [s.ph]);
          b.onclick = () => unequip(s.id);
        } else {
          label.textContent = s.name;
          if (s.ph) onImg(img, s.ph);
          else img.hidden = true;
        }
        b.appendChild(img);
        b.appendChild(label);
        doll.appendChild(b);
      });
    }
    const list = document.getElementById("bag-list");
    if (list) {
      const worn = new Set(Object.values(state.equipped || {}));
      const items = groupItems(state.inventory.filter((id) => !worn.has(id)));
      if (!items.length) list.innerHTML = "<p>Der Beutel ist leer.</p>";
      items.forEach(({ it, n }) => {
        const d = document.createElement("div");
        d.className = "card tile";
        d.dataset.item = it.id;
        d.dataset.tip = it.id; d.dataset.tipMode = "bag";
        if (n > 1) d.dataset.tipCount = n;
        const hint = [it.type === "verbrauch" ? "Nutzen" : (it.slot ? "Anlegen" : ""), statText(it)].filter(Boolean).join(" · ");
        d.innerHTML = '<span class="tile-art"><img alt=""></span><b>' + esc(stackName(it, n)) + "</b>" + (hint ? "<div class='tiny'>" + hint + "</div>" : "");
        const ti = d.querySelector("img");
        if (it.img) onImg(ti, it.img); else ti.hidden = true;
        if (it.type === "verbrauch") d.onclick = () => useItem(it.id);
        else if (it.slot) d.onclick = () => equip(it.id);
        list.appendChild(d);
      });
    }
  } else if (sheet === "quests") {
    const qs = Object.keys(state.quests).map((id) => ({ ...D.QUESTS[id], status: state.quests[id] })).filter((q) => q.id);
    body.innerHTML = qs.length ? qs.map((q) => "<div class='card quest" + (q.status === "done" ? " done" : "") + "'><b>" + q.title + "</b><div><b>Wo:</b> " + q.where + "</div><div><b>Was:</b> " + q.goal + "</div><div class='tiny'>" + (q.status === "done" ? "erledigt" : "offen") + "</div></div>").join("") : "<p>Keine offene Bitte.</p>";
  } else if (sheet === "stats") {
    body.innerHTML = "<h3>Leben</h3><div class='card' data-tip='' data-vtip='hp'><b>Gesundheit</b> " + state.hero.hp + "/" + maxHp() + "<div class='bar hp'><i style='width:" + Math.round(state.hero.hp / maxHp() * 100) + "%'></i></div></div><h3>Grundwerte</h3>" + D.STAT_KEYS.map((k) => {
      const xp = state.statXp[k.id] || { xp: 0, need: 12 };
      const value = k.id === "grad" ? state.hero.level : (state.hero[k.id] || 0);
      const pct = Math.round((xp.xp / xp.need) * 100);
      return "<div class='card' data-tip='' data-vtip='" + k.id + "'><b>" + k.name + "</b> " + value + "<div class='bar'><i style='width:" + pct + "%'></i></div><div class='tiny'>" + xp.xp + " / " + xp.need + "</div></div>";
    }).join("") + valuesHtml() + relationsHtml() + (typeof sysStatsMore === "function" ? sysStatsMore() : "");
    wireSheet(body);
  }
}
function render() {
  if (!state) return;
  const loc = D.LOCATIONS[state.location];
  const region = regionOf(loc);
  document.getElementById("hero-name").textContent = state.hero.name;
  document.getElementById("hero-meta").textContent = "Grad " + state.hero.level + " · " + gradName(state.hero.level);
  document.getElementById("hp").textContent = state.hero.hp + "/" + maxHp();
  document.getElementById("hpbar").innerHTML = "<div class='bar'><i style='width:" + Math.round(state.hero.hp / maxHp() * 100) + "%'></i></div>";
  const setTxt = (id, t) => { const n = document.getElementById(id); if (n) n.textContent = t; };
  setTxt("gold", state.hero.gold);
  [["atk", "atk-val", 4], ["def", "def-val", 0], ["will", "will-val", 0]].forEach(([k, id, base]) => {
    const n = document.getElementById(id);
    const g = gearBonus(k);
    if (n) n.textContent = ((state.hero[k] || base) + g) + (g ? " (+" + g + ")" : "");
    if (n && k === "will" && g > 3) n.textContent = (state.hero.will || 0) + " (+" + g + " Ausr., wirksam +3)";
  });
  setTxt("loc", loc.name); setTxt("phase", phaseInfo(state.phase).name); setTxt("day", state.day);
  const top = { "top-day": state.day, "top-phase": phaseInfo(state.phase).name, "top-gold": state.hero.gold, "top-hp": state.hero.hp + "/" + maxHp() };
  Object.keys(top).forEach((id) => { const n = document.getElementById(id); if (n) n.textContent = top[id]; });
  const pa = avatarOf(state.hero); onImg(document.getElementById("portrait"), pa[0], pa.slice(1));
  const lines = state.log.length ? state.log : ["Noch keine Spuren."];
  const logEl = document.getElementById("hero-log");
  // Protokoll: älteste oben, neueste unten; danach an die neueste Zeile scrollen
  logEl.innerHTML = lines.slice().reverse().map((l) => "<div>" + esc(l) + "</div>").join("");
  logEl.scrollTop = logEl.scrollHeight;
  const scene = document.getElementById("scene");
  let sceneArt = document.getElementById("scene-art");
  if (!sceneArt && scene) {
    sceneArt = document.createElement("img");
    sceneArt.id = "scene-art";
    sceneArt.alt = "";
    scene.insertBefore(sceneArt, scene.firstChild);
  }
  if (sceneArt) sceneArt.src = art(loc.art);
  if (scene) scene.style.backgroundImage = "none";
  // Gebietsbilder: Person = idle_<gebiet>, Gespräch = wait_<gebiet> (Gebiet = LOCATIONS[x].region).
  areaBg(document.getElementById("pane-face"), region.idle || loc.art, "linear-gradient(rgba(16,9,11,.28), rgba(16,9,11,.18))");
  areaBg(document.querySelector("#pane-face .pane-body"), region.idle || loc.art, "linear-gradient(rgba(16,9,11,.28), rgba(16,9,11,.18))");
  areaBg(document.querySelector("#pane-talk .pane-body"), region.wait || loc.art, "linear-gradient(rgba(7,4,5,.45), rgba(12,7,8,.55))");
  document.getElementById("place-name").textContent = loc.name;
  document.getElementById("place-blurb").textContent = loc.blurb || "";
  document.getElementById("btn-rest").hidden = true;  // Rasten nur noch beim Gastwirt (Einkehren)
  renderDaily(scene);
  scene.querySelectorAll(".spot,.arch").forEach((n) => n.remove());
  // Rückweg zum Zentralort des Gebiets liegt im Kartenfenster, nicht auf dem Ortsbild.
  const hubLoc = !loc.parent && region.hub && region.hub !== loc.id ? D.LOCATIONS[region.hub] : null;
  (loc.exits || []).filter((ex) => ex.arch && !(hubLoc && ex.id === hubLoc.id)).forEach((ex) => {
    const b = document.createElement("button");
    const sub = D.LOCATIONS[ex.id];
    b.className = "arch" + (sub && sub.pass ? " pass-arch" : "");
    b.style.left = ex.x + "%"; b.style.top = ex.y + "%";
    b.textContent = ex.label;
    if (sub && sub.pass) {  // Torbogen zum Nebenort mit dessen pass-Bild
      b.dataset.sub = sub.id;
      b.innerHTML = '<span class="pass-img"></span><span class="tag">' + esc(ex.label) + "</span>";
      bg(b.querySelector(".pass-img"), sub.pass);
    }
    b.onclick = () => travel(ex.id);
    scene.appendChild(b);
  });
  Object.values(D.NPCs).filter((n) => n.location === state.location).forEach((p) => {
    const present = !p.hours || p.hours.includes(state.phase);
    const b = document.createElement("button");
    b.className = "spot" + (present ? "" : " away");
    b.style.left = (p.pin?.x || 50) + "%"; b.style.top = (p.pin?.y || 60) + "%";
    b.innerHTML = '<span class="shield"><img alt=""></span><span class="tag">' + p.name + "</span>";
    onImg(b.querySelector("img"), p.art, ["npcs/" + p.id + ".jpg"]);
    b.onclick = () => present ? talk(p.id) : waitFor(p.id);
    scene.appendChild(b);
  });
  (loc.stalls || []).forEach((st) => {
    const b = document.createElement("button");
    b.className = "arch stall";
    b.dataset.stall = st.id;
    b.style.left = st.x + "%"; b.style.top = st.y + "%";
    b.textContent = st.label;
    b.onclick = () => openStall(st.id);
    scene.appendChild(b);
  });
  const map = document.getElementById("map");
  map.querySelectorAll(".pin").forEach((n) => n.remove());
  // Kartentitel: Gebietsname, im Nebenort der Ortsname.
  document.getElementById("map-rail").textContent = loc.parent ? loc.name : region.name;
  const locked = !!(state.narrator || state.trading || state.dialogue);
  map.querySelectorAll(".pass-back").forEach((n) => n.remove());
  const parentLoc = loc.parent && D.LOCATIONS[loc.parent];
  // Nebenort: pass-Bild; sonstiger Nicht-Zentralort: Ortsbild des Zentralorts; Zentralort: Gebietskarte.
  const backLoc = parentLoc || hubLoc;
  bg(map, locked ? region.wait : (parentLoc ? (loc.pass || region.map) : (hubLoc ? hubLoc.art : region.map)));
  if (!locked && backLoc) {  // nur Rückweg, keine Schnellreise
    const b = document.createElement("button");
    b.className = "pin pass-back";
    b.style.left = "50%"; b.style.top = "92%";
    b.textContent = parentLoc ? (loc.back || "Zurück nach " + backLoc.name) : (region.back || "Zurück zum " + backLoc.name);
    b.disabled = !!state.inCombat;
    b.onclick = (ev) => { ev.stopPropagation(); travel(backLoc.id); };
    map.appendChild(b);
  } else if (!locked) {
    const open = new Set((loc.exits || []).map((ex) => ex.id));
    (region.pins || []).filter((pin) => !(D.LOCATIONS[pin.id] || {}).parent).forEach((pin) => {
      const b = document.createElement("button");
      const reachable = open.has(pin.id);
      b.className = "pin" + (pin.id === loc.id ? " here" : "");
      b.style.left = pin.x + "%"; b.style.top = pin.y + "%";
      b.textContent = pin.label;
      b.disabled = pin.id === loc.id || state.inCombat || !reachable;
      b.onclick = (ev) => { ev.stopPropagation(); if (reachable) travel(pin.id); };
      map.appendChild(b);
    });
  }
  const acts = document.getElementById("combat-acts");
  if (acts) acts.hidden = !(state.inCombat && state.combat && !state.combat.engaged && !state.combat.surrendered);
  const narr = document.getElementById("narrator");
  narr.hidden = !state.narrator;
  if (state.narrator) {
    document.getElementById("narr-title").textContent = state.narrator.title || "Erzähler";
    document.getElementById("narr-text").textContent = state.narrator.text || "";
    const img = document.getElementById("narr-art");
    if (state.narrator.art) { img.hidden = false; onImg(img, state.narrator.art); } else img.hidden = true;
    document.querySelector(".scroll").style.backgroundImage = 'url("' + art("ui/schriftrolle.jpg") + '")';
  }
  if (state.inCombat && state.combat) {
    const foe = state.combat;
    showFace(foe);
    if (!foe.engaged) {
      const choices = [];  // keine Ergebung mehr (Ausbesserung 2); Rußwolf ohne „Gehen lassen“/„Verhandeln“
      showLine((foe.note ? foe.note + "\n" : "") + (foe.text || ""), choices);
    } else {
      showLine("Der Kampf läuft. Den Verlauf seht ihr im Kampffenster.", []);  // kein Kampflog im Gesprächsfenster
    }
    document.getElementById("talk-who").textContent = foe.name + " · Leben " + Math.max(0, foe.hp) + "/" + foe.hpMax;
  }
  renderCombatWin();
  if (typeof renderFightHero === "function") renderFightHero();
  if (typeof spreadSpots === "function") spreadSpots(scene);
  if (sheet && sheet !== "trade") paintSheet();
}
function openPlay() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("shell").classList.add("on");
  render();
}
function cards(el, data, cur, fn) {
  el.innerHTML = "";
  Object.values(data).forEach((item) => {
    const d = document.createElement("div");
    d.className = "card" + (item.id === cur ? " active" : "");
    d.innerHTML = "<b>" + item.name + "</b><div class='tiny'>" + (item.text || "") + "</div>";
    d.onclick = () => fn(item.id);
    el.appendChild(d);
  });
}
let newGender = "m", portraitId = "avatar_m1", newPoints = {};
function pointsLeft() { return D.START_POOL.punkte - Object.values(newPoints).reduce((a, b) => a + b, 0); }
function paintNew() {
  document.querySelectorAll("#gender-pick button").forEach((b) => { b.classList.toggle("active", b.dataset.g === newGender); b.onclick = () => { newGender = b.dataset.g; portraitId = "avatar_" + newGender + "1"; paintNew(); }; });
  const faces = document.getElementById("portrait-grid");
  faces.innerHTML = "";
  Object.values(D.AVATARE).filter((p) => p.g === newGender).forEach((p) => {
    const d = document.createElement("div");
    d.className = "card face" + (p.id === portraitId ? " active" : "");
    d.dataset.avatar = p.id;
    d.innerHTML = '<img alt="">';
    onImg(d.querySelector("img"), hasArt(p.art) ? p.art : p.fb, [p.fb]);
    d.onclick = () => { portraitId = p.id; paintNew(); };
    faces.appendChild(d);
  });
  const box = document.getElementById("points-grid");
  box.innerHTML = "";
  D.START_POOL.keys.forEach((k) => {
    const n = newPoints[k.id] || 0, base = D.BASE_HERO[k.id] || 0;
    const row = document.createElement("div");
    row.className = "pt-row"; row.dataset.stat = k.id;
    row.innerHTML = "<span class='pt-name'>" + k.name + "</span><button class='pt-minus'" + (n <= 0 ? " disabled" : "") + ">−</button><b class='pt-val'>" + (base + n) + "</b><button class='pt-plus'" + (n >= D.START_POOL.max || pointsLeft() <= 0 ? " disabled" : "") + ">+</button>";
    row.querySelector(".pt-minus").onclick = () => { newPoints[k.id] = Math.max(0, n - 1); paintNew(); };
    row.querySelector(".pt-plus").onclick = () => { if (pointsLeft() > 0 && n < D.START_POOL.max) { newPoints[k.id] = n + 1; paintNew(); } };
    box.appendChild(row);
  });
  document.getElementById("points-left").textContent = pointsLeft();
}
function tryEnter() {
  const input = document.getElementById("new-hero-name");
  const name = input.value.trim();
  const hint = document.getElementById("name-hint");
  if (!name) { crPage(1); hint.hidden = false; input.classList.add("needed"); input.focus(); return false; }
  hint.hidden = true; input.classList.remove("needed");
  newGame({ name, gender: newGender, portraitId, points: newPoints });
  return true;
}
function crPage(n) { document.getElementById("cr-p1").hidden = n !== 1; document.getElementById("cr-p2").hidden = n !== 2; }
document.getElementById("btn-next").onclick = () => {
  const input = document.getElementById("new-hero-name");
  if (!input.value.trim()) { document.getElementById("name-hint").hidden = false; input.classList.add("needed"); input.focus(); return; }
  crPage(2);
};
document.getElementById("btn-back2").onclick = () => crPage(1);
document.getElementById("btn-new").onclick = () => { paintNew(); crPage(1); document.getElementById("root-menu").hidden = true; document.getElementById("new-menu").hidden = false; };
document.getElementById("btn-back").onclick = () => { document.getElementById("new-menu").hidden = true; document.getElementById("root-menu").hidden = false; };
document.getElementById("btn-enter").onclick = tryEnter;
document.getElementById("new-hero-name").oninput = () => { if (document.getElementById("new-hero-name").value.trim()) { document.getElementById("name-hint").hidden = true; document.getElementById("new-hero-name").classList.remove("needed"); } };
document.getElementById("btn-load").onclick = () => {
  const box = document.getElementById("slots");
  box.innerHTML = "";
  const all = slots();
  [AUTO_SLOT, 1, 2, 3].forEach((n) => {
    const s = all[n];
    const name = n === AUTO_SLOT ? "Autosave" : "Slot " + n;
    const d = document.createElement("div");
    d.className = "card slot-card";
    d.dataset.slot = n;
    if (s && s.hero) {
      d.innerHTML = "<b>" + esc(name) + "</b><span class='slot-hero'>" + esc(s.hero.name) + "</span><div class='tiny'>" + esc(slotLabel(s)) + "</div>";
      d.onclick = () => { if (load(n)) openPlay(); };
    } else { d.classList.add("empty"); d.innerHTML = "<b>" + esc(name) + "</b><div class='tiny'>leer</div>"; }
    box.appendChild(d);
  });
  document.getElementById("root-menu").hidden = true;
  document.getElementById("load-menu").hidden = false;
};
// Startfenster: Fortsetzen lädt den neuesten Stand (savedAt; bei Gleichstand/ohne Zeit der Autosave).
function latestSlot() {
  const all = slots();
  let best = null, bestT = -1;
  [AUTO_SLOT, 1, 2, 3].forEach((n) => {
    const s = all[n];
    if (!s || !s.hero) return;
    const t = typeof s.savedAt === "number" ? s.savedAt : 0;
    if (t > bestT) { best = n; bestT = t; }
  });
  return best;
}
function paintContinue() { document.getElementById("btn-continue").disabled = latestSlot() === null; }
document.getElementById("btn-continue").onclick = () => { const n = latestSlot(); if (n !== null && load(n)) openPlay(); };
document.getElementById("btn-options").onclick = () => { document.getElementById("root-menu").hidden = true; document.getElementById("options-menu").hidden = false; };
document.getElementById("btn-back-options").onclick = () => { document.getElementById("options-menu").hidden = true; document.getElementById("root-menu").hidden = false; };
paintContinue();
document.getElementById("btn-back-load").onclick = () => { document.getElementById("load-menu").hidden = true; document.getElementById("root-menu").hidden = false; };
document.getElementById("narr-close").onclick = () => {
  state.narrator = null;
  if (state.pending) { const id = state.pending; state.pending = null; startCombat(id); }
  persist(); render();
};
document.getElementById("btn-fight").onclick = engage;
document.getElementById("btn-flee").onclick = flee;
document.getElementById("btn-rest").onclick = rest;
// Schließen eines Blatts: im Handel zurück zum Handelsfenster (nur „Handel beenden“ beendet den Handel).
function closeSheet() {
  sheet = null;
  if (state && state.trading && lastTalk) { openTrade(); return; }
  document.getElementById("scene-sheet").hidden = true;
}
document.getElementById("sheet-close").onclick = closeSheet;
document.querySelectorAll("[data-sheet]").forEach((b) => b.onclick = () => {
  const kind = b.getAttribute("data-sheet");
  if (sheet === kind) { closeSheet(); return; }
  sheet = kind;
  document.getElementById("scene-sheet").hidden = false;
  paintSheet();
});
document.getElementById("btn-esc").onclick = () => {
  document.getElementById("overlay").hidden = false;
  paintOptions();
};
function paintOptions(note) {
  const body = document.getElementById("overlay-body");
  const all = slots();
  body.innerHTML = '<div class="opt-h">Speichern in</div><div id="save-slots"></div>' + (note ? "<p class='opt-note'>" + esc(note) + "</p>" : "") + '<div class="opt-foot"><button id="opt-menu" class="menu-btn">Zum Start</button></div>';
  const box = document.getElementById("save-slots");
  [1, 2, 3].forEach((n) => {
    const s = all[n];
    const d = document.createElement("div");
    d.className = "card slot-card";
    d.dataset.slot = n;
    d.innerHTML = "<b>Slot " + n + (n === activeSlot ? " (aktiv)" : "") + "</b><div class='tiny'>" + (s && s.hero ? esc(s.hero.name + " · " + slotLabel(s)) : "leer") + "</div>";
    d.onclick = () => { activeSlot = n; save(n); paintOptions("Gespeichert in Slot " + n + "."); };
    box.appendChild(d);
  });
  document.getElementById("opt-menu").onclick = () => location.reload();
}
document.getElementById("overlay-close").onclick = () => { document.getElementById("overlay").hidden = true; };

// ---- Item-Tooltip (Beutel-Kachel, Slot auf der Silhouette, Händler-Kachel) ----
const FX_TEXT = {
  fleePct: (v) => "Fluchtchance " + (v > 0 ? "+" : "−") + Math.abs(v) + " Prozentpunkte",
  tradePct: (v) => "Kauft " + v + " % billiger",
  travelSafePct: (v) => v + " % Chance, einer Begegnung beim Betreten auszuweichen",
  restSteps: (v) => "Rast kostet " + v + " Tageszeit weniger",
  potionHeal: (v) => "Tränke heilen +" + v + " Leben",
  bondPlus: (v) => "+" + v + " Nähe bei jedem Nähe-Gewinn"
};
function fxLines(it) {
  const fx = it.fx || {};
  return Object.keys(fx).map((k) => {
    if (k === "vsMonster") return Object.keys(fx[k]).map((m) => "+" + fx[k][m] + " Schaden gegen " + ((D.MONSTER[m] && D.MONSTER[m].name) || m)).join(", ");
    return FX_TEXT[k] ? FX_TEXT[k](fx[k]) : "";
  }).filter(Boolean);
}
function slotWord(it) {
  if (it.slot) {
    if (it.type === "waffe") return it.twoHanded ? "Waffe (beide Hände)" : "Waffe (eine Hand)";
    const s = EQUIP_SLOTS.find((x) => x.id === it.slot);
    return s ? s.name : it.slot;
  }
  return { verbrauch: "Verbrauch", ware: "Handelsware", quest: "Auftrag" }[it.type] || "";
}
function tipCompare(it) {
  if (!it.slot) return "";
  let target = it.slot;
  const held = D.ITEMS[state.equipped.waffeL];
  if (it.slot === "waffeL" && !it.twoHanded && held && !(held.twoHanded) && !state.equipped.waffeR) return "<div class='tip-cmp'>Rechte Hand frei – kommt dazu.</div>";
  const cur = D.ITEMS[state.equipped[target]];
  if (!cur) return "<div class='tip-cmp'>Slot frei.</div>";
  const rows = ["atk", "def", "will", "hp"].map((k) => {
    const d = (it[k] || 0) - (cur[k] || 0);
    return d ? "<span class='" + (d > 0 ? "tip-up" : "tip-down") + "'>" + STAT_NAMES[k] + " " + (d > 0 ? "+" : "") + d + "</span>" : "";
  }).filter(Boolean);
  return "<div class='tip-cmp'>Gegen " + esc(cur.name) + ": " + (rows.length ? rows.join(", ") : "gleichwertig") + "</div>";
}
function tipHtml(it, mode, count) {
  if (mode === "buy" || mode === "sell" || mode === "worn" || mode === "none") {  // Handel: nur Name und Wirkung
    const eff = [statText(it)].concat(fxLines(it)).filter(Boolean);
    return "<b>" + esc(it.name) + "</b>" + (eff.length ? eff.map((l) => "<div class='tip-fx'>" + l + "</div>").join("") : (it.text ? "<div class='tiny'>" + esc(it.text) + "</div>" : ""));
  }
  const worn = Object.values(state.equipped || {}).includes(it.id) && (mode === "slot" || mode === "worn");
  const lines = [];
  lines.push("<b>" + esc(it.name) + "</b>" + (count > 1 ? " ×" + count : "") + (slotWord(it) ? " <span class='tiny'>· " + slotWord(it) + "</span>" : ""));
  if (statText(it)) lines.push("<div>" + statText(it) + "</div>");
  fxLines(it).forEach((l) => lines.push("<div class='tip-fx'>" + l + "</div>"));
  if (mode === "buy") lines.push("<div>Preis: " + buyPrice(it) + " Gold" + (buyPrice(it) !== it.price ? " <span class='tiny'>(statt " + it.price + ")</span>" : "") + "</div>");
  else if (it.price && it.sell && it.type !== "quest") lines.push("<div>Verkauf: " + sellPrice(it) + " Gold" + (worn ? " <span class='tiny'>(erst ablegen)</span>" : "") + "</div>");
  else lines.push("<div class='tiny'>Unverkäuflich</div>");
  if (count > 1) lines.push("<div class='tiny'>" + (mode === "buy" ? "Vorrat: " : "Im Beutel: ") + count + " Stück</div>");
  if (!worn) lines.push(tipCompare(it));
  return lines.join("");
}
let tipEl = null;
let tipTimer = null;
function showTip(node) {
  if (node.dataset.vtip && typeof valueTip === "function") {
    if (!tipEl) { tipEl = document.createElement("div"); tipEl.id = "item-tip"; document.body.appendChild(tipEl); }
    tipEl.innerHTML = valueTip(node.dataset.vtip); tipEl.hidden = false;
    const r = node.getBoundingClientRect(), w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    tipEl.style.left = clamp(r.left + r.width / 2 - w / 2, 4, window.innerWidth - w - 4) + "px";
    tipEl.style.top = clamp(r.top - h - 8 < 4 ? r.bottom + 8 : r.top - h - 8, 4, window.innerHeight - h - 4) + "px";
    return;
  }
  const it = D.ITEMS[node.dataset.tip];
  if (!it || !state) return hideTip();
  if (!tipEl) { tipEl = document.createElement("div"); tipEl.id = "item-tip"; document.body.appendChild(tipEl); }
  tipEl.innerHTML = tipHtml(it, node.dataset.tipMode, Number(node.dataset.tipCount) || 1);
  tipEl.hidden = false;
  const r = node.getBoundingClientRect();
  const w = tipEl.offsetWidth, h = tipEl.offsetHeight;
  let top = r.top - h - 8;
  if (top < 4) top = r.bottom + 8;
  tipEl.style.left = clamp(r.left + r.width / 2 - w / 2, 4, window.innerWidth - w - 4) + "px";
  tipEl.style.top = clamp(top, 4, window.innerHeight - h - 4) + "px";
}
function hideTip() { if (tipEl) tipEl.hidden = true; }
document.addEventListener("mouseover", (e) => {
  const n = e.target.closest && e.target.closest("[data-tip]");
  if (n) showTip(n); else hideTip();
});
document.addEventListener("pointerdown", (e) => {
  if (e.pointerType !== "touch") return;
  const n = e.target.closest && e.target.closest("[data-tip]");
  if (!n) return hideTip();
  showTip(n);
  clearTimeout(tipTimer); tipTimer = setTimeout(hideTip, 3500);
});
