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
function bondLabel(v) {
  let name = "Fremd";
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
  activeSlot = n;
  return true;
}

function createHero(name, herkunftId, fluchId, portraitId) {
  const h = D.HERKUENFTE[herkunftId] || D.HERKUENFTE.gossenschatten;
  const f = D.FLUECHE[fluchId] || D.FLUECHE.kronenbrand;
  const portrait = D.PORTRAITS[portraitId] || D.PORTRAITS[herkunftId];
  const hero = { name: (name || "Namenlos").slice(0, 18), herkunftId: h.id, fluchId: f.id, portraitId: portrait.id, herkunft: h.name, fluch: f.name, ...D.BASE_HERO };
  const apply = (mods = {}) => {
    if (mods.hp) { hero.hp += mods.hp; hero.hpMax += mods.hp; }
    ["atk", "def", "will", "gold", "fortune", "crit"].forEach((k) => { if (mods[k]) hero[k] = (hero[k] || 0) + mods[k]; });
  };
  apply(h.mods); apply(f.mods);
  hero.hp = clamp(hero.hp, 8, 99);
  hero.hpMax = clamp(hero.hpMax, 8, 99);
  return hero;
}
function newGame(payload) {
  state = {
    hero: createHero(payload.name, payload.herkunftId, payload.fluchId, payload.portraitId),
    v: 0, location: "platz", phase: "vormittag", day: 1,
    inventory: ["glutphiole"], equipped: {}, flags: {}, log: [],
    quests: {}, bonds: {}, factions: {}, seenNarrator: { intro: true, stadt: true },
    dialogue: null, trading: false, inCombat: false, combat: null,
    narrator: { ...D.NARRATOR.intro }, statXp: {}
  };
  D.STAT_KEYS.forEach((k) => { state.statXp[k.id] = { xp: 0, need: k.id === "grad" ? 40 : 12 }; });
  state.v = SAVE_VERSION;
  activeSlot = AUTO_SLOT;  // Neues Spiel schreibt nur den Autosave, Slots 1–3 bleiben unberührt
  save(AUTO_SLOT);
  openPlay();
}
function log(line) {
  state.log.unshift(line);
  state.log = state.log.slice(0, 30);
}
function gain(key, amount) {
  const row = state.statXp[key] || { xp: 0, need: 12 };
  row.xp += amount;
  while (row.xp >= row.need) {
    row.xp -= row.need;
    row.need = Math.round(row.need * 1.25);
    if (key === "grad") { state.hero.level += 1; state.hero.hpMax += 4; state.hero.hp = Math.min(state.hero.hpMax, state.hero.hp + 4); log("Grad steigt auf " + state.hero.level + "."); }
    else { state.hero[key] = (state.hero[key] || 0) + 1; log((D.STAT_KEYS.find((s) => s.id === key) || {}).name + " steigt."); }
  }
  state.statXp[key] = row;
}
function bumpBond(id, d) {
  const cur = state.bonds[id] || 0;
  state.bonds[id] = clamp(cur + d, -100, 100);
}
function travel(toId) {
  if (!toId || !state) return;
  if (state.narrator || state.dialogue || state.inCombat || state.trading) return;
  const dest = D.LOCATIONS[toId];
  const here = D.LOCATIONS[state.location];
  if (!dest || !here) return;
  if (!(here.exits || []).some((ex) => ex.id === toId)) return;
  state.location = toId;
  advance(TIME_COST.travel);
  log("Ihr erreicht " + dest.name + ".");
  if (!state.seenNarrator[dest.region] && D.NARRATOR[dest.region]) {
    state.seenNarrator[dest.region] = true;
    state.narrator = { ...D.NARRATOR[dest.region] };
  }
  const ev = pickEvent(toId);
  if (ev) runEvent(ev, {});
  gain("grad", 2);
  persist();
  if (HUBS.includes(toId)) autosave();
  render();
}
// ---- Ereignisse je Ort (Daten: LOCATIONS[x].events) ----
const EVENT_HANDLERS = {
  // Begegnung starten; liegt gerade eine Erzähler-Rolle offen, beginnt sie nach dem Schließen.
  startEncounter(ev) {
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
  return true;
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
function startCombat(id) {
  const proto = D.MONSTER[id];
  if (!proto) return;
  state.inCombat = true;
  state.combat = { ...proto, hp: proto.hp, hpMax: proto.hp, engaged: false, log: [] };
  lastTalk = null;
  log(proto.name + " steht im Weg.");
}
function engage() {
  if (!state.combat || state.combat.engaged) return;
  state.combat.engaged = true;
  if (battleTimer) return;
  battleTimer = setInterval(tick, 400);
}
function tick() {
  const foe = state.combat;
  if (!foe || !foe.engaged) return;
  const dmgYou = Math.max(1, (state.hero.atk || 4) - (foe.def || 0) + Math.floor(Math.random() * 3));
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
    if (foe.id === "russwolf") { state.flags.wolf_tot = true; state.pendingNarrator = { ...D.NARRATOR.wolf_tot }; }
    gain("atk", 4); gain("grad", 8);
    log(foe.name + " fällt. +" + gold + " Gold.");
    const blows = foe.log.join("\n");
    clearInterval(battleTimer); battleTimer = null;
    state.inCombat = false; state.combat = null;
    showLine(blows + "\n" + foe.name + " fällt. +" + gold + " Gold." + (lootName ? " Beute: " + lootName + "." : "") + " Der Weg ist frei.", [{ label: "Weiter", go: "clear" }]);
    persist(); render(); return;
  }
  const dmgFoe = Math.max(1, (foe.atk || 4) - (state.hero.def || 0));
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
function flee() {
  if (!state.inCombat) return;
  if (Math.random() < 0.45 + (state.hero.will || 0) * 0.03) {
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
  if (ev) runEvent(ev, { blows });
  else {
    showFace(null);
    showLine((blows ? blows + "\n" : "") + D.WOLF_LINES.wolf_niederlage, [{ label: "Weiter", go: "clear" }]);
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
  if (!state.flags["met_" + id]) { state.flags["met_" + id] = true; bumpBond(id, 4); }
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
    if (npc.id === "burgvogt" && !state.quests.wolfspfad) choices.push({ label: "Nach dem Pfad fragen", go: "quest" });
    if (npc.id === "burgvogt" && state.quests.wolfspfad === "active" && state.flags.wolf_tot) choices.push({ label: "Den Wolf melden", go: "done" });
    if (npc.id === "tamsin" && !state.quests.tamsin_wolf) choices.push({ label: "Fragen, was das Dorf braucht", go: "quest" });
    if (npc.id === "tamsin" && state.quests.tamsin_wolf === "active" && state.flags.wolf_tot) choices.push({ label: "Sagen, der Pfad ist frei", go: "done" });
    if (npc.merchant) choices.push({ label: "Handeln", go: "shop" });
  }
  if (node === "shop") choices.push({ label: "Handel beenden", go: "endtrade" });
  choices.push({ label: "Gehen", go: "leave" });
  return choices;
}
function choose(go) {
  if (go === "spare" || go === "bargain") { resolveWolf(go === "spare" ? "wolf_spared" : "wolf_bargain"); return; }
  if (go === "clear" || go === "leave") {
    state.dialogue = null; state.trading = false; lastTalk = null; sheet = null;
    document.getElementById("scene-sheet").hidden = true;
    if (go === "clear" && state.pendingNarrator) {
      state.narrator = state.pendingNarrator;
      state.pendingNarrator = null;
    }
    showFace(null);
    showLine("", []);
    render(); return;
  }
  const npc = D.NPCs[state.dialogue.npcId];
  if (go === "quest") {
    if (npc.id === "burgvogt") state.quests.wolfspfad = "active";
    if (npc.id === "tamsin") state.quests.tamsin_wolf = "active";
    bumpBond(npc.id, 3);
  }
  if (go === "done") {
    if (npc.id === "burgvogt" && state.quests.wolfspfad === "active") {
      state.quests.wolfspfad = "done"; state.hero.gold += 18; bumpBond("burgvogt", 8); state.factions.krone = (state.factions.krone || 0) + 6; gain("ansehen", 6);
    }
    if (npc.id === "tamsin" && state.quests.tamsin_wolf === "active") {
      state.quests.tamsin_wolf = "done"; state.hero.gold += 8; bumpBond("tamsin", 10); state.factions.rat = (state.factions.rat || 0) + 5;
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
  document.getElementById("face-bond").textContent = "Nähe · " + bondLabel(state.bonds[p.id] || 0);
  document.getElementById("face-hint").textContent = p.merchant ? "Händler" : (p.text || "");
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
  document.getElementById("combat-acts").hidden = !(state.inCombat && state.combat && !state.combat.engaged);
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
  state.hero.hp = state.hero.hpMax;
  advance(TIME_COST.rest);
  log("Ihr ruht und kommt wieder zu Kräften.");
  persist(); render();
}
function buy(id) {
  const it = D.ITEMS[id];
  if (!it || state.hero.gold < it.price) return;
  state.hero.gold -= it.price;
  state.inventory.push(id);
  persist(); openTrade(); render();
}
function sell(id) {
  const it = D.ITEMS[id];
  const i = state.inventory.indexOf(id);
  if (i < 0 || !it || !it.sell || it.type === "quest") return;
  state.inventory.splice(i, 1);
  state.hero.gold += it.sell;
  persist(); openTrade(); render();
}
function layoutDoll(doll) {
  const layout = doll && doll.parentElement;
  if (!layout) return;
  const availH = layout.clientHeight;
  const availW = layout.clientWidth;
  if (!availH || !availW) return;
  const maxW = Math.max(96, Math.floor(availW * 0.5));
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
  let slot = it.slot;
  // Einfach: zweite Waffe geht in die rechte Hand, solange die frei ist.
  if (slot === "waffeL" && state.equipped.waffeL && !state.equipped.waffeR) slot = "waffeR";
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
  log((D.ITEMS[id] ? D.ITEMS[id].name : id) + " abgelegt.");
  persist(); paintSheet(); render();
}
function useItem(id) {
  const it = D.ITEMS[id];
  const i = state.inventory.indexOf(id);
  if (i < 0 || !it || it.type !== "verbrauch") return;
  if (it.heal) state.hero.hp = Math.min(state.hero.hpMax, state.hero.hp + it.heal);
  state.inventory.splice(i, 1);
  persist(); paintSheet(); render();
}
function openTrade() {
  sheet = "trade";
  document.getElementById("scene-sheet").hidden = false;
  document.getElementById("sheet-title").textContent = "Handel";
  const npc = lastTalk;
  const body = document.getElementById("sheet-body");
  const buyList = (npc.shop || []).map((id) => D.ITEMS[id]).filter(Boolean);
  const sellable = state.inventory.filter((id) => D.ITEMS[id] && D.ITEMS[id].sell && D.ITEMS[id].type !== "quest");
  body.innerHTML = '<div class="sheet-split"><div><h3>Kaufen</h3><div id="tr-buy"></div></div><div><h3>Verkaufen</h3><div id="tr-sell"></div></div></div>';
  const b = document.getElementById("tr-buy");
  buyList.forEach((it) => {
    const d = document.createElement("div");
    d.className = "card";
    d.innerHTML = "<b>" + it.name + "</b><div class='tiny'>" + it.price + " Gold</div>";
    d.onclick = () => buy(it.id);
    b.appendChild(d);
  });
  const s = document.getElementById("tr-sell");
  sellable.forEach((id) => {
    const it = D.ITEMS[id];
    const d = document.createElement("div");
    d.className = "card";
    d.innerHTML = "<b>" + it.name + "</b><div class='tiny'>" + it.sell + " Gold</div>";
    d.onclick = () => sell(id);
    s.appendChild(d);
  });
}
function paintSheet() {
  const body = document.getElementById("sheet-body");
  const titles = { inventory: "Beutel", quests: "Bitten", stats: "Werte" };
  document.getElementById("sheet-title").textContent = titles[sheet] || "";
  if (sheet === "inventory") {
    body.innerHTML = '<div class="bag-layout"><div class="paperdoll" id="paperdoll"><img class="doll-art" id="doll-art" alt=""></div><div id="bag-list"></div></div>';
    const doll = document.getElementById("paperdoll");
    const figure = art("ui/siluette.jpg");
    let dollArt = document.getElementById("doll-art");
    if (!dollArt && doll) {
      dollArt = document.createElement("img");
      dollArt.id = "doll-art";
      dollArt.className = "doll-art";
      dollArt.alt = "";
      doll.insertBefore(dollArt, doll.firstChild);
    }
    if (dollArt) dollArt.src = figure;
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
        const worn = state.equipped[s.id] && D.ITEMS[state.equipped[s.id]];
        b.dataset.slot = s.id;
        if (worn) {
          label.textContent = worn.name;
          b.classList.add("worn");
          b.title = worn.name + " ablegen";
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
      const items = state.inventory.map((id) => D.ITEMS[id]).filter((it) => it && !worn.has(it.id));
      if (!items.length) list.innerHTML = "<p>Der Beutel ist leer.</p>";
      items.forEach((it) => {
        const d = document.createElement("div");
        d.className = "card tile";
        d.dataset.item = it.id;
        const hint = it.type === "verbrauch" ? "Nutzen" : (it.slot ? "Anlegen" : "");
        d.title = it.text || "";
        d.innerHTML = '<span class="tile-art"><img alt=""></span><b>' + it.name + "</b>" + (hint ? "<div class='tiny'>" + hint + "</div>" : "");
        const ti = d.querySelector("img");
        if (it.img) onImg(ti, it.img); else ti.hidden = true;
        if (it.type === "verbrauch") d.onclick = () => useItem(it.id);
        else if (it.slot) d.onclick = () => equip(it.id);
        list.appendChild(d);
      });
    }
  } else if (sheet === "quests") {
    const qs = Object.keys(state.quests).map((id) => ({ ...D.QUESTS[id], status: state.quests[id] })).filter((q) => q.id);
    body.innerHTML = qs.length ? qs.map((q) => "<div class='card'><b>" + q.title + "</b><div><b>Wo:</b> " + q.where + "</div><div><b>Was:</b> " + q.goal + "</div><div class='tiny'>" + (q.status === "done" ? "erledigt" : "offen") + "</div></div>").join("") : "<p>Keine offene Bitte.</p>";
  } else if (sheet === "stats") {
    body.innerHTML = D.STAT_KEYS.map((k) => {
      const xp = state.statXp[k.id] || { xp: 0, need: 12 };
      const value = k.id === "grad" ? state.hero.level : (state.hero[k.id] || 0);
      const pct = Math.round((xp.xp / xp.need) * 100);
      return "<div class='card'><b>" + k.name + "</b> " + value + "<div class='bar'><i style='width:" + pct + "%'></i></div><div class='tiny'>" + xp.xp + " / " + xp.need + "</div></div>";
    }).join("") + "<h3>Nähe</h3>" + Object.keys(state.bonds).map((id) => "<div class='tiny'>" + (D.NPCs[id] ? D.NPCs[id].name : id) + ": " + bondLabel(state.bonds[id]) + " (" + state.bonds[id] + ")</div>").join("");
  }
}
function render() {
  if (!state) return;
  const loc = D.LOCATIONS[state.location];
  const region = D.REGIONS[loc.region];
  document.getElementById("hero-name").textContent = state.hero.name;
  document.getElementById("hero-meta").textContent = state.hero.herkunft + " · " + state.hero.fluch + " · Grad " + state.hero.level;
  document.getElementById("hp").textContent = state.hero.hp + "/" + state.hero.hpMax;
  document.getElementById("hpbar").innerHTML = "<div class='bar'><i style='width:" + Math.round(state.hero.hp / state.hero.hpMax * 100) + "%'></i></div>";
  document.getElementById("gold").textContent = state.hero.gold;
  document.getElementById("loc").textContent = loc.name;
  document.getElementById("phase").textContent = phaseInfo(state.phase).name;
  document.getElementById("day").textContent = state.day;
  const top = { "top-day": state.day, "top-phase": phaseInfo(state.phase).name, "top-gold": state.hero.gold, "top-hp": state.hero.hp + "/" + state.hero.hpMax };
  Object.keys(top).forEach((id) => { const n = document.getElementById(id); if (n) n.textContent = top[id]; });
  onImg(document.getElementById("portrait"), "portraits/" + state.hero.portraitId + ".jpg");
  const lines = state.log.length ? state.log : ["Noch keine Spuren."];
  document.getElementById("hero-log").innerHTML = lines.map((l) => "<div>" + esc(l) + "</div>").join("");
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
  areaBg(document.getElementById("pane-face"), loc.art, "linear-gradient(rgba(16,9,11,.28), rgba(16,9,11,.18))");
  areaBg(document.querySelector("#pane-face .pane-body"), loc.art, "linear-gradient(rgba(16,9,11,.28), rgba(16,9,11,.18))");
  areaBg(document.querySelector("#pane-talk .pane-body"), loc.art, "linear-gradient(rgba(7,4,5,.45), rgba(12,7,8,.55))");
  document.getElementById("place-name").textContent = loc.name;
  document.getElementById("place-blurb").textContent = loc.blurb || "";
  document.getElementById("btn-rest").hidden = !loc.rest;
  scene.querySelectorAll(".spot,.arch").forEach((n) => n.remove());
  (loc.exits || []).filter((ex) => ex.arch).forEach((ex) => {
    const b = document.createElement("button");
    b.className = "arch";
    b.style.left = ex.x + "%"; b.style.top = ex.y + "%";
    b.textContent = ex.label;
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
  const map = document.getElementById("map");
  map.querySelectorAll(".pin").forEach((n) => n.remove());
  document.getElementById("map-rail").textContent = region.name;
  const locked = !!(state.narrator || state.trading);
  bg(map, locked ? region.wait : region.map);
  if (!locked) {
    const open = new Set((loc.exits || []).map((ex) => ex.id));
    (region.pins || []).forEach((pin) => {
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
  if (acts) acts.hidden = !(state.inCombat && state.combat && !state.combat.engaged);
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
      const choices = foe.id === "russwolf"
        ? [{ label: "Gehen lassen", go: "spare" }, { label: "Verhandeln", go: "bargain" }]
        : [];
      showLine((foe.note ? foe.note + "\n" : "") + (foe.text || ""), choices);
    } else {
      showLine(foe.log.join("\n") || "Der Kampf beginnt.", []);
    }
    document.getElementById("talk-who").textContent = foe.name + " · Leben " + Math.max(0, foe.hp) + "/" + foe.hpMax;
  }
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
let herkunftId = "gossenschatten", fluchId = "kronenbrand", portraitId = "gossenschatten";
function paintNew() {
  cards(document.getElementById("herkunft-grid"), D.HERKUENFTE, herkunftId, (id) => { herkunftId = id; paintNew(); });
  cards(document.getElementById("fluch-grid"), D.FLUECHE, fluchId, (id) => { fluchId = id; paintNew(); });
  const faces = document.getElementById("portrait-grid");
  faces.innerHTML = "";
  Object.values(D.PORTRAITS).forEach((p) => {
    const d = document.createElement("div");
    d.className = "card" + (p.id === portraitId ? " active" : "");
    d.innerHTML = '<img alt=""><b>' + p.name + "</b>";
    onImg(d.querySelector("img"), p.art, ["portraits/" + p.id + ".jpg"]);
    d.onclick = () => { portraitId = p.id; paintNew(); };
    faces.appendChild(d);
  });
}
document.getElementById("btn-new").onclick = () => { paintNew(); document.getElementById("root-menu").hidden = true; document.getElementById("new-menu").hidden = false; };
document.getElementById("btn-back").onclick = () => { document.getElementById("new-menu").hidden = true; document.getElementById("root-menu").hidden = false; };
document.getElementById("btn-enter").onclick = () => newGame({ name: document.getElementById("new-hero-name").value.trim(), herkunftId, fluchId, portraitId });
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
      d.innerHTML = "<b>" + esc(name + " · " + s.hero.name) + "</b><div class='tiny'>" + esc(slotLabel(s)) + "</div>";
      d.onclick = () => { if (load(n)) openPlay(); };
    } else d.textContent = name + " leer";
    box.appendChild(d);
  });
  document.getElementById("root-menu").hidden = true;
  document.getElementById("load-menu").hidden = false;
};
document.getElementById("btn-back-load").onclick = () => { document.getElementById("load-menu").hidden = true; document.getElementById("root-menu").hidden = false; };
document.getElementById("narr-close").onclick = () => {
  state.narrator = null;
  if (state.pending) { const id = state.pending; state.pending = null; startCombat(id); }
  persist(); render();
};
document.getElementById("btn-fight").onclick = engage;
document.getElementById("btn-flee").onclick = flee;
document.getElementById("btn-rest").onclick = rest;
document.getElementById("sheet-close").onclick = () => { sheet = null; document.getElementById("scene-sheet").hidden = true; };
document.querySelectorAll("[data-sheet]").forEach((b) => b.onclick = () => {
  const kind = b.getAttribute("data-sheet");
  if (sheet === kind) { sheet = null; document.getElementById("scene-sheet").hidden = true; return; }
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
  body.innerHTML = '<div class="tiny">Speichern in</div><div id="save-slots"></div><button id="opt-menu">Zum Start</button>' + (note ? "<p>" + esc(note) + "</p>" : "");
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
