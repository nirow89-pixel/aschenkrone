const WORLD = {
  realm: "Aschenreich",
  crownItem: "aschenkrone",
  crownTitle: "Aschenkrone",
  ruler: {
    id: "malrik",
    name: "König Malrik Vael",
    title: "Träger der Aschenkrone",
    text: "Malrik hält das Reich ruhig, indem er es fest in der Hand behält. Die Straßen sind sicher, solange niemand widerspricht."
  },
  plot: {
    act: 1,
    seed: "Die Aschenkrone ist beides: das goldene Reifstück im Palast und der Titel, den nur einer tragen darf. Malrik trägt ihn seit zwölf Jahren. Das Reich steht. Unter der Ruhe sammelt sich Streit.",
    futureStart: "Später beginnt das Spiel in einem noch ungebauten Bauerndorf. Der Held ist ein Bauernkind. Dorfleben und frühe Entscheidungen formen den Charakter. Ein Ereignis zwingt zum Weggehen. Dann öffnet sich die weite Welt."
  }
};

const FACTIONS = {
  krone: { id: "krone", name: "Haus Vael", text: "Die Krone und ihre Vogte. Ordnung gegen Preis." },
  rat: { id: "rat", name: "Dorfrat", text: "Unterorten und die freien Höfe. Langsam, aber eigen." },
  nebel: { id: "nebel", name: "Nebelbund", text: "Hella und der Düsterwald. Veränderung, die ihren Preis nennt." },
  gasse: { id: "gasse", name: "Rote Tür", text: "Die Häuser in den Gassen. Geld, Schutz, Geheimnisse." },
  tempel: { id: "tempel", name: "Stille Glocke", text: "Was vom Tempel noch spricht, will gehört werden." }
};

const DAY_PHASES = [
  { id: "morgen", name: "Morgen" },
  { id: "vormittag", name: "Vormittag" },
  { id: "mittag", name: "Mittag" },
  { id: "nachmittag", name: "Nachmittag" },
  { id: "abend", name: "Abend" },
  { id: "nacht", name: "Nacht" }
];

const BOND_STEPS = [
  { min: -100, id: "todfeind", name: "Todfeind" },
  { min: -80, id: "hass", name: "Hass" },
  { min: -65, id: "groll", name: "Groll" },
  { min: -50, id: "feind", name: "Feindschaft" },
  { min: -37, id: "misstrauen", name: "Misstrauen" },
  { min: -25, id: "kalt", name: "Abneigung" },
  { min: -15, id: "kuehl", name: "Kühl" },
  { min: -8, id: "fremd", name: "Fremd" },
  { min: 8, id: "bekannt", name: "Bekannt" },
  { min: 15, id: "freundlich", name: "Freundlich" },
  { min: 22, id: "wohl", name: "Wohlgesinnt" },
  { min: 30, id: "zugetan", name: "Zugetan" },
  { min: 38, id: "vertraut", name: "Vertraut" },
  { min: 46, id: "herzlich", name: "Herzlich" },
  { min: 55, id: "verbunden", name: "Verbunden" },
  { min: 63, id: "innig", name: "Innig" },
  { min: 72, id: "nahe", name: "Nahe" },
  { min: 80, id: "ergeben", name: "Ergeben" },
  { min: 88, id: "unzertrennlich", name: "Unzertrennlich" }
];

const STAT_KEYS = [
  { id: "grad", name: "Grad" },
  { id: "atk", name: "Angriff" },
  { id: "def", name: "Panzer" },
  { id: "will", name: "Wille" },
  { id: "fortune", name: "Glück" },
  { id: "ansehen", name: "Ansehen" }
];

const HERKUENFTE = {
  ascheadel: { id: "ascheadel", name: "Ascheadel", text: "Dein Haus hat den Brand überlebt. Man kennt den Namen und erwartet Haltung.", mods: { hp: 8, atk: 1, def: 3, gold: 40, will: 1 } },
  gossenschatten: { id: "gossenschatten", name: "Gossenschatten", text: "Du kommst aus engen Gassen. Du weißt, wann man spricht und wann man geht.", mods: { hp: 2, atk: 4, def: 0, gold: 12, crit: 8 } },
  tempelkind: { id: "tempelkind", name: "Tempelkind", text: "Du bist bei den Glocken aufgewachsen. Leute werden still, wenn du den Ton triffst.", mods: { hp: 6, atk: 0, def: 2, gold: 18, will: 4, heal: 6 } },
  nebelwanderer: { id: "nebelwanderer", name: "Nebelwanderer", text: "Du kennst Wege zwischen den Dörfern, die auf keiner Karte stehen.", mods: { hp: 4, atk: 2, def: 1, gold: 20, ap: 1, will: 2 } }
};

const FLUECHE = {
  glasherz: { id: "glasherz", name: "Glasherz", text: "Was dich trifft, trifft oft auch den, der zuschlägt.", mods: { hp: -8, reflect: 25 } },
  kronenbrand: { id: "kronenbrand", name: "Kronenbrand", text: "Deine Hände werden warm, wenn Macht nah ist. Manche spüren das und weichen.", mods: { atk: 5, def: -1 } },
  stumme_glocke: { id: "stumme_glocke", name: "Stumme Glocke", text: "Zufälle neigen sich dir zu. Nicht immer freundlich.", mods: { will: 3, fortune: 15 } },
  blutmond: { id: "blutmond", name: "Blutmond", text: "Wunden an anderen wärmen dich. Der Preis bleibt an dir haften.", mods: { lifesteal: 20, hp: -2 } }
};

// Ext-Art-Dateien, die schon im Repo liegen (assets/…). Optionale Bilder werden nur geladen, wenn sie hier stehen,
// sonst greift der Ersatz (keine 404). Neue Lieferungen aus Drive hier eintragen.
const EXT_ART = [
  "ui/siluette_mann.jpg",
  "ui/siluette_frau.jpg",
  "ui/handel_bg.jpg",
  "ui/avatar_bg_m.jpg",
  "ui/avatar_bg_w.jpg",
  "ui/kampf_bg.jpg",
  "avatars/avatar_m1.jpg",
  "avatars/avatar_m2.jpg",
  "avatars/avatar_m3.jpg",
  "avatars/avatar_w1.jpg",
  "avatars/avatar_w2.jpg",
  "avatars/avatar_w3.jpg",
  "fx/fx_klaue.png",
  "fx/fx_schwert.png",
  "fx/fx_dolch.png",
  "fx/fx_faust.png",
  "fx/fx_feuerball.png",
  "fx/fx_eis.png",
  "fx/fx_blitz.png",
  "fx/fx_schild.png",
  "fx/fx_heilung.png",
  "fx/fx_gift.png",
  "fx/fx_fluch.png"
];
// Avatare nach Geschlecht (Ext Art: avatars/avatar_m1–m3, avatar_w1–w3). fb = Übergangsbild, solange die Datei fehlt.
const AVATARE = {
  avatar_m1: { id: "avatar_m1", g: "m", name: "I", art: "avatars/avatar_m1.jpg", fb: "portraits/ascheadel.jpg" },
  avatar_m2: { id: "avatar_m2", g: "m", name: "II", art: "avatars/avatar_m2.jpg", fb: "portraits/gossenschatten.jpg" },
  avatar_m3: { id: "avatar_m3", g: "m", name: "III", art: "avatars/avatar_m3.jpg", fb: "portraits/tempelkind.jpg" },
  avatar_w1: { id: "avatar_w1", g: "w", name: "I", art: "avatars/avatar_w1.jpg", fb: "portraits/nebelwanderer.jpg" },
  avatar_w2: { id: "avatar_w2", g: "w", name: "II", art: "avatars/avatar_w2.jpg", fb: "portraits/tempelkind.jpg" },
  avatar_w3: { id: "avatar_w3", g: "w", name: "III", art: "avatars/avatar_w3.jpg", fb: "portraits/nebelwanderer.jpg" }
};
// Startpunkte (werte.md: Wille-Start 3–7, Deckel Angriff/Panzer = Startwert + 14): 4 Punkte, je Wert höchstens +3.
const START_POOL = { punkte: 4, max: 3, keys: [{ id: "atk", name: "Angriff" }, { id: "def", name: "Panzer" }, { id: "will", name: "Wille" }], gold: 20, hp: 4 };
const PORTRAITS = {
  ascheadel: { id: "ascheadel", name: "Ascheadel", art: "portraits/ascheadel.jpg" },
  gossenschatten: { id: "gossenschatten", name: "Gossenschatten", art: "portraits/gossenschatten.jpg" },
  tempelkind: { id: "tempelkind", name: "Tempelkind", art: "portraits/tempelkind.jpg" },
  nebelwanderer: { id: "nebelwanderer", name: "Nebelwanderer", art: "portraits/nebelwanderer.jpg" }
};

const ITEMS = {
  aschenklinge: { id: "aschenklinge", img: "items/aschenklinge.jpg", name: "Aschenklinge", type: "waffe", slot: "waffeL", atk: 3, dmgMin: 4, dmgMax: 8, speed: 2.4, price: 28, sell: 14, text: "Die Schneide hält die Wärme eines alten Feuers." },
  glasdolch: { id: "glasdolch", img: "items/glasdolch.jpg", name: "Glasdolch", type: "waffe", slot: "waffeL", atk: 4, crit: 6, dmgMin: 3, dmgMax: 6, speed: 1.8, fx: { fleePct: 5 }, price: 50, sell: 25, text: "Leicht, scharf und leicht zu verstecken." },
  russmantel: { id: "russmantel", img: "items/russmantel.jpg", name: "Rußmantel", type: "ruestung", slot: "brust", def: 2, fx: { travelSafePct: 10 }, price: 22, sell: 11, text: "Der Stoff hält Wind und neugierige Blicke ab." },
  glutphiole: { id: "glutphiole", img: "items/glutphiole.jpg", name: "Glutphiole", type: "verbrauch", heal: 18, price: 10, sell: 5, text: "Ein Schluck Wärme. Die Rippen werden leichter." },
  nebeltrank: { id: "nebeltrank", img: "items/nebeltrank.jpg", name: "Nebeltrank", type: "verbrauch", ap: 1, price: 12, sell: 6, text: "Danach fällt der nächste Entschluss leichter." },
  waldphiole: { id: "waldphiole", img: "items/waldphiole.jpg", name: "Waldphiole", type: "verbrauch", heal: 12, will: 1, wk: 5, price: 14, sell: 7, text: "Bitter. Danach steht der Kopf klarer." },
  aschesalbe: { id: "aschesalbe", img: "items/aschesalbe.jpg", name: "Aschesalbe", type: "verbrauch", heal: 8, def: 1, price: 11, sell: 5, text: "Zieht auf der Haut und hält eine Weile stand." },
  obsidianmuenze: { id: "obsidianmuenze", img: "items/obsidianmuenze.jpg", name: "Obsidianmünze", type: "quest", text: "Auf der einen Seite eine Krone, auf der anderen ein offenes Tor." },
  aschenkrone: { id: "aschenkrone", name: "Aschenkrone", type: "quest", text: "Das Reifstück des Reichs. Wer es trägt, trägt auch den Titel." },
  dorfstahl: { id: "dorfstahl", img: "items/dorfstahl.jpg", name: "Dorfstahl", type: "waffe", slot: "waffeL", atk: 2, dmgMin: 2, dmgMax: 4, speed: 1.9, price: 18, sell: 9, text: "Ein einfacher Dolch mit gerader Klinge und Ledergriff." },
  nebelklinge: { id: "nebelklinge", img: "items/nebelklinge.jpg", name: "Nebelklinge", type: "waffe", slot: "waffeL", atk: 4, dmgMin: 3, dmgMax: 7, speed: 2.1, fx: { vsMonster: { glashexe: 2 } }, price: 48, sell: 24, text: "Ein gerades Schwert mit heller, glatter Klinge und einfachem Querstück." },
  thronnadel: { id: "thronnadel", img: "items/thronnadel.jpg", name: "Thronnadel", type: "waffe", slot: "waffeL", atk: 3, dmgMin: 3, dmgMax: 7, speed: 2.1, fx: { vsMonster: { raeuber: 2 } }, price: 34, sell: 17, text: "Ein langer, dünner Stichdolch mit verziertem Messinggriff." },
  zweihander: { id: "zweihander", img: "items/zweihander.jpg", name: "Zweihänder", type: "waffe", slot: "waffeL", twoHanded: true, atk: 7, dmgMin: 5, dmgMax: 9, speed: 2.8, fx: { fleePct: -10 }, price: 52, sell: 26, text: "Ein langes, schweres Schwert mit dunkler Parierstange für beide Hände." },
  aschenschild: { id: "aschenschild", img: "items/aschenschild.jpg", name: "Aschenschild", type: "ruestung", slot: "schild", def: 3, price: 30, sell: 15, text: "Ein runder dunkler Schild mit Eisenrand, Nieten und eingeprägter Krone." },
  glaspanzer: { id: "glaspanzer", img: "items/glaspanzer.jpg", name: "Glaspanzer", type: "ruestung", slot: "brust", def: 4, fx: { fleePct: -5 }, price: 55, sell: 27, text: "Ein Brustpanzer aus geschuppten, hell glänzenden Metallplatten." },
  pelzmantel: { id: "pelzmantel", img: "items/pelzmantel.jpg", name: "Pelzmantel", type: "ruestung", slot: "brust", def: 3, fx: { restSteps: 1 }, price: 38, sell: 19, text: "Ein dicker Pelzmantel mit dunkel-violettem Futter und Metallschließe." },
  samtbrust: { id: "samtbrust", img: "items/samtbrust.jpg", name: "Samtbrust", type: "ruestung", slot: "brust", def: 1, fx: { bondPlus: 1, tradePct: 5 }, price: 26, sell: 13, text: "Ein Mieder aus rotem Samt mit Goldnähten." },
  knochenhandschuh: { id: "knochenhandschuh", img: "items/knochenhandschuh.jpg", name: "Knochenhandschuh", type: "ruestung", slot: "haende", def: 1, price: 14, sell: 7, text: "Helle Lederhandschuhe, fest genäht." },
  seidenhand: { id: "seidenhand", img: "items/seidenhand.jpg", name: "Seidenhand", type: "ruestung", slot: "haende", will: 1, fx: { tradePct: 5 }, price: 20, sell: 10, text: "Rote Handschuhe aus Seide." },
  kronenring: { id: "kronenring", img: "items/kronenring.jpg", name: "Kronenring", type: "schmuck", slot: "kopf", def: 1, will: 1, fx: { bondPlus: 1 }, price: 48, sell: 24, text: "Ein schmaler goldener Stirnreif in Form einer Krone." },
  glutring: { id: "glutring", img: "items/glutring.jpg", name: "Glutring", type: "schmuck", slot: "ring", atk: 1, fx: { potionHeal: 2 }, price: 32, sell: 16, text: "Ein goldener Ring mit rotem Stein in verzierter Fassung." },
  nebelamulett: { id: "nebelamulett", img: "items/nebelamulett.jpg", name: "Nebelamulett", type: "schmuck", slot: "amulett", will: 2, fx: { travelSafePct: 10 }, price: 36, sell: 18, text: "Ein dunkler, ovaler Stein in spitzer Metallfassung an einer Silberkette." },
  ascheohr: { id: "ascheohr", img: "items/ascheohr.jpg", name: "Ascheohr", type: "ware", price: 16, sell: 8, text: "Ein kleiner Ohrring aus Metall. Händler kaufen ihn an." },
  kussphiole: { id: "kussphiole", img: "items/kussphiole.jpg", name: "Kussphiole", type: "verbrauch", heal: 10, price: 12, sell: 6, text: "Ein rosa Trank in einer kleinen Flasche mit Korken." },
  spiegeltrank: { id: "spiegeltrank", img: "items/spiegeltrank.jpg", name: "Spiegeltrank", type: "verbrauch", heal: 14, price: 16, sell: 8, text: "Ein klarer Trank in einer verzierten Silberflasche." },
  wein_der_stunde: { id: "wein_der_stunde", img: "items/wein_der_stunde.jpg", name: "Wein der Stunde", type: "verbrauch", heal: 5, price: 6, sell: 3, text: "Ein Glas Rotwein neben einer brennenden Kerze." },
  teichbluete: { id: "teichbluete", img: "items/teichbluete.jpg", name: "Teichblüte", type: "ware", price: 8, sell: 4, text: "Eine helle, rosa Blüte vom Teich. Händler kaufen sie an." },
  leder_hose: { id: "leder_hose", img: "items/leder_hose.jpg", name: "Lederhose", type: "ruestung", slot: "beine", hp: 2, price: 14, sell: 7, text: "Eine dunkle, abgetragene Lederhose mit Kniebesatz und Ziernähten." },
  fangzahn_kampfrock: { id: "fangzahn_kampfrock", img: "items/fangzahn_kampfrock.jpg", name: "Fangzahn-Kampfrock", type: "ruestung", slot: "beine", def: 1, atk: 1, fx: { vsMonster: { raeuber: 1 } }, price: 32, sell: 16, text: "Ein Kampfrock aus zerrissenem schwarzem Stoff und Lederplatten, mit roter Mittelbahn, Tierzähnen und Knochenzier am Gürtel." },
  eisen_beinschienen: { id: "eisen_beinschienen", img: "items/eisen_beinschienen.jpg", name: "Eisen-Beinschienen", type: "ruestung", slot: "beine", def: 1, hp: 3, fx: { fleePct: -5 }, price: 46, sell: 23, text: "Zwei Beinschienen aus dunklem Eisen mit Rankenmuster und violetten Einlagen." },
  wickelstiefel: { id: "wickelstiefel", img: "items/wickelstiefel.jpg", name: "Wickelstiefel", type: "ruestung", slot: "fuesse", fx: { fleePct: 5 }, price: 12, sell: 6, text: "Stiefel aus gewickelten dunklen Stoffbinden mit roten Streifen und hellen, genieteten Lederplatten an Schienbein und Spann." },
  schnallen_lederstiefel: { id: "schnallen_lederstiefel", img: "items/schnallen_lederstiefel.jpg", name: "Schnallen-Lederstiefel", type: "ruestung", slot: "fuesse", hp: 1, fx: { travelSafePct: 5 }, price: 18, sell: 9, text: "Hohe dunkle Lederstiefel mit mehreren Schnallen und aufgesetzter Lederplatte am Schaft." },
  amethyst_stiefel: { id: "amethyst_stiefel", img: "items/amethyst_stiefel.jpg", name: "Amethyststiefel", type: "ruestung", slot: "fuesse", def: 1, will: 1, fx: { travelSafePct: 10 }, price: 58, sell: 29, text: "Halbhohe Stiefel aus dunklen Metallplatten mit feinem Rankenmuster und eingesetzten violetten Steinen." },
  hohe_panzerstiefel: { id: "hohe_panzerstiefel", img: "items/hohe_panzerstiefel.jpg", name: "Hohe Panzerstiefel", type: "ruestung", slot: "fuesse", def: 1, hp: 2, fx: { fleePct: -5 }, price: 52, sell: 26, text: "Kniehohe, spitz zulaufende Plattenstiefel aus dunklem Metall mit Rankenmuster und violetten Steinen." }
};

const SKILLS = {
  feuerball: { id: "feuerball", name: "Feuerball", kind: "aktiv", element: "Feuer", dmgMin: 6, dmgMax: 10, cd: 6, level: 1, price: 40, text: "Eine kurze Lohe, gerichtet und heiß." },
  heilfunke: { id: "heilfunke", name: "Heilfunke", kind: "aktiv", healMin: 6, healMax: 10, cd: 8, level: 1, price: 34, text: "Wärme, die eine Wunde schließt." }
};

const MONSTER = {
  // Werte laut grad-zeichen-kampf.md §5.2 (Rev. e). speed = Sekunden je Schlag, crit in %.
  russwolf: { id: "russwolf", name: "Rußwolf", hp: 28, atk: 7, def: 1, speed: 2.2, crit: 5, gold: [6, 14], loot: ["glutphiole"], art: "monsters/russwolf.jpg", text: "Der Wolf kommt vom Pfad, nicht aus der Stadt. Die Schnauze ist rußig, der Blick fest.", wild: true, quest: true },
  russwolf_wild: { id: "russwolf_wild", name: "Rußwolf (Rudel)", hp: 28, atk: 7, def: 1, speed: 2.2, crit: 5, gold: [6, 14], loot: ["glutphiole"], art: "monsters/russwolf.jpg", text: "Ein Wolf aus dem Rudel. Er hat Hunger, keinen Auftrag.", wild: true, tags: ["wild", "wolf"] },
  russwolf_jung: { id: "russwolf_jung", name: "Junger Rußwolf", hp: 21, atk: 5, def: 1, speed: 2.2, crit: 5, gold: [3, 8], loot: ["glutphiole"], art: "monsters/russwolf.jpg", text: "Jung und mager. Er prüft, ob ihr weglauft.", wild: true, tags: ["wild", "wolf"] },
  glashexe: { id: "glashexe", name: "Glashexe", hp: 38, atk: 10, def: 3, speed: 2.2, crit: 5, reflect: 10, gold: [10, 22], loot: ["glasdolch"], art: "monsters/glashexe.jpg", text: "Sie steht zwischen den Bäumen, als gehöre der Weg ihr.", wild: false, unique: true },
  raeuber: { id: "raeuber", name: "Räuber", hp: 22, atk: 5, def: 1, speed: 2.0, crit: 5, gold: [8, 16], loot: ["glutphiole"], lootChance: { leder_hose: 20 }, art: "monsters/raeuber.jpg", human: true, text: "Ein Mann mit Tuch vor dem Mund. Er will den Beutel, nicht ein Gespräch.", tags: ["mensch"] },
  nebelkind: { id: "nebelkind", name: "Nebelkind", hp: 26, atk: 8, def: 3, speed: 1.8, crit: 0, weaponHalf: true, gold: [0, 6], loot: ["nebeltrank"], art: "monsters/nebelkind.jpg", text: "Ein Umriss aus Nebel, kaum größer als ein Kind. Klingen gehen halb durch ihn hindurch.", wild: true, tags: ["wild"] },
  thronassel: { id: "thronassel", name: "Thronassel", hp: 70, atk: 12, def: 7, speed: 3.0, crit: 0, armored: true, gold: [30, 50], loot: [], art: "monsters/thronassel.jpg", text: "Ein gepanzertes Ding, so groß wie ein Thronsessel. Es kriecht, und der Boden knirscht.", unique: true },
  kronenbruch: { id: "kronenbruch", name: "Kronenbruch", hp: 90, atk: 15, def: 8, speed: 2.6, speed2: 2.0, crit: 10, gold: [60, 90], loot: [], art: "monsters/kronenbruch.jpg", text: "Ein Ritter ohne Herrn. Auf dem Helm sitzt ein gesprungener Reif.", unique: true }
};
// Zufallsbegegnungen nur an Wildorten (nie in Stadt oder Dorf, Entscheid Leitung). Chance je Tag/Abend/Nacht in %.
const SPAWN_TABLES = {
  nebelpfad: { chance: [10, 15, 25], rows: [{ id: "raeuber", w: 70 }, { id: "russwolf_jung", w: 30, wolf: true }], after: "wolf_dealt" },
  obsidiansee: { chance: [10, 15, 25], rows: [{ id: "raeuber", w: 100 }] },
  knochenfeld: { chance: [20, 25, 35], rows: [{ id: "russwolf_wild", w: 50, wolf: true }, { id: "raeuber", w: 50 }] },
  alter_baum: { chance: [15, 20, 30], rows: [{ id: "russwolf_wild", w: 60, wolf: true }, { id: "raeuber", w: 40 }] },
  hexenhuette: { chance: [15, 20, 30], rows: [{ id: "russwolf_wild", w: 60, wolf: true }, { id: "raeuber", w: 40 }] },
  blueteich: { chance: [0, 15, 25], rows: [{ id: "russwolf_jung", w: 100, wolf: true }] },
  sumpf: { chance: [0, 15, 25], rows: [{ id: "russwolf_jung", w: 100, wolf: true }] }
};
// Zeichen (grad-zeichen-kampf.md §3.4): Atem, Abklingen in Heldenschlägen.
const ZEICHEN = {
  schnellschlag: { id: "schnellschlag", name: "Schnellschlag", pfad: "krieger", ap: 2, cd: 3, art: "skills/schnellschlag.jpg", text: "Doppelschlag, je 60 % Schaden." },
  eisenhaut: { id: "eisenhaut", name: "Eisenhaut", pfad: "krieger", ap: 2, cd: 8, art: "skills/eisenhaut.jpg", text: "Panzer +2 für 4 Gegnerschläge." },
  solarplexus: { id: "solarplexus", name: "Solarplexus", pfad: "krieger", ap: 2, cd: 7, art: "skills/solarplexus.jpg", text: "80 % Schaden, der Gegner setzt einen Schlag aus." },
  feuerball: { id: "feuerball", name: "Feuerball", pfad: "magier", ap: 1, cd: 5, magic: true, art: "skills/feuerball.jpg", text: "6–10 Schaden plus ein Drittel des Willens, ignoriert Panzer." },
  froststachel: { id: "froststachel", name: "Froststachel", pfad: "magier", ap: 2, cd: 6, magic: true, art: "skills/froststachel.jpg", text: "4–7 Schaden, verlangsamt den Gegner." },
  heilfunke: { id: "heilfunke", name: "Heilfunke", pfad: "magier", ap: 2, cd: 8, magic: true, art: "skills/heilfunke.jpg", text: "Heilt 6–10 plus ein Drittel des Willens (unter halber Leben)." },
  giftklinge: { id: "giftklinge", name: "Giftklinge", pfad: "dieb", ap: 1, cd: 6, art: "skills/giftklinge.jpg", text: "Vergiftet: 2 Schaden je Schlag, 4 Schläge." },
  schattenhieb: { id: "schattenhieb", name: "Schattenhieb", pfad: "dieb", ap: 2, cd: 6, art: "skills/schattenhieb.jpg", text: "130 % Schaden, Krit-Chance +25 %." },
  blutung: { id: "blutung", name: "Blutung", pfad: "dieb", ap: 1, cd: 7, art: "skills/blutung.jpg", text: "Blutung über 4 Schläge." },
  wundmal: { id: "wundmal", name: "Wundmal", pfad: "fluch", ap: 2, cd: 9, art: "skills/wundmal.jpg", text: "Voller Schaden, heilt euch um die Hälfte, kostet 2 Leben." }
};
const PFAD_ZEICHEN = { krieger: ["schnellschlag", "eisenhaut", "solarplexus"], magier: ["feuerball", "froststachel", "heilfunke"], dieb: ["giftklinge", "schattenhieb", "blutung"], diplomat: [] };
const GRAD_STUFEN = [
  { grad: 1, min: 0, name: "Ungezeichnet" }, { grad: 2, min: 10, name: "Angesengt" }, { grad: 3, min: 20, name: "Gezeichnet" },
  { grad: 4, min: 28, name: "Geprüft" }, { grad: 5, min: 35, name: "Gehärtet" }, { grad: 6, min: 41, name: "Erprobt" },
  { grad: 7, min: 46, name: "Gefürchtet" }, { grad: 8, min: 47, name: "Aschegeboren" }, { grad: 9, min: 48, name: "Kronennah" },
  { grad: 10, min: 49, name: "Kronenwürdig" }
];

const NPCs = {
  burgvogt: {
    id: "burgvogt", name: "Harn", title: "Burgvogt", location: "burg",
    text: "Harn trägt den Ring des Königs sichtbar. Wer ihn anspricht, spricht mit der Stadt.",
    art: "npcs/burgvogt.jpg", merchant: false,
    hours: ["vormittag","mittag","nachmittag"], pin: { x: 34, y: 78 }, faction: "krone",
    lines: ["Die Wege nach Unterorten sind offen. Bringt Bericht, wenn etwas den Zoll stört."],
    talk: {
      start: "Ihr seid neu genug, dass die Stadt euren Namen noch nicht führt. Sprecht kurz und haltet euch an die Ordnung.",
      quest: "Am Nebelpfad hält ein Wolf die Karren auf. Die Boten warten, der Zoll bleibt liegen. Wenn das Tier tot ist, kommt zu mir auf die Burg.",
      done: "Der Pfad ist wieder nutzbar. Die Stadt merkt sich, wer ihre Wege freihält."
    }
  },
  marktfrau: {
    id: "marktfrau", name: "Maera", title: "Gastwirtin", location: "schenke",
    text: "Maera steht hinter dem Schanktisch, als gehöre er fest zu ihr.",
    art: "npcs/maera.jpg", merchant: true, buys: true,
    shop: ["glutphiole","nebeltrank","aschesalbe","wein_der_stunde","teichbluete"],
    stock: { glutphiole: 4, nebeltrank: 3, aschesalbe: 3, wein_der_stunde: 5, teichbluete: 4 },
    hours: ["morgen","vormittag","mittag","nachmittag"], pin: { x: 76, y: 64 }, faction: "gasse",
    lines: ["Salbe, Trank, Nadel. Sagt, was ihr braucht."],
    talk: { start: "Guten Tag. Die Ware ist frisch genug für den Preis, den ich nenne." }
  },
  priester: {
    id: "priester", name: "Eld", title: "Glöckner", location: "tempel",
    text: "Eld hält die Glocke, obwohl sie selten schlägt.",
    art: "npcs/priester.jpg", merchant: false,
    hours: ["morgen","mittag","abend"], pin: { x: 62, y: 82 }, faction: "tempel",
    lines: ["Wer im Tempel spricht, soll es vollständig tun."],
    talk: { start: "Setzt euch, wenn die Beine schwer sind. Die Stille hier gehört niemandem ganz." }
  },
  // ---- Drei Platzierungen (Leitung 13.10., ohne Quests; Texte PLATZHALTER für Ext Text) ----
  russ: {
    id: "russ", name: "Ruß", title: "Kontakt aus der Gasse", location: "berum_docks",
    text: "Ruß lehnt im Schatten der Fässer und zählt die Boote, die ohne Laterne anlegen.",
    art: "npcs/npc_gassenlicht.jpg", merchant: false,
    hours: ["nacht"], pin: { x: 30, y: 80 }, faction: "gasse",
    lines: ["Was nachts anlegt, steht morgens in keinem Buch."],
    talk: { start: "Ihr seid spät unterwegs. Gut. Am Tag rede ich nicht über Ladung." }
  },
  ysra: {
    id: "ysra", name: "Ysra", title: "Einsiedlerin des Nebelbunds", location: "gebirge_wasserfall",
    text: "Ysra sitzt im Windschatten des Eises, den Mantel grau wie der Nebel.",
    art: "npcs/npc_nebelmantel.jpg", merchant: false,
    pin: { x: 30, y: 80 }, faction: "nebel",
    lines: ["Der Weg nach Nirfal nimmt, was man ihm nicht freiwillig gibt."],
    talk: { start: "Ihr wollt nach Nirfal. Geht nicht nach Einbruch der Dunkelheit, und haltet euch an die Steinmänner." }
  },
  selwyn: {
    id: "selwyn", name: "Selwyn", title: "Hüter der Totenlichter", location: "tempel",
    text: "Selwyn, ein Tempeldiener, wacht über die Totenlichter. Keine Flamme erlischt, solange er hier steht.",
    art: "npcs/npc_selwyn.jpg", merchant: false,
    pin: { x: 32, y: 82 }, faction: "tempel",
    lines: ["Jedes Licht hier gehört einem Namen. Fasst keines an."],
    talk: { start: "Sprecht leise. Die Totenlichter brennen für jene, die nicht mehr sprechen können." }
  },
  // ---- NPC-Bau 2 (Leitung 13.10., plan/npc-verteilung-2026-10-13.md; ohne Quests; Texte PLATZHALTER für Ext Text) ----
  anselm: { id: "anselm", name: "Bruder Anselm", title: "Wanderprediger", location: "lotfild_strasse",
    text: "Ein hagerer Mann in grober Kutte, barfuß. Am Gürtel hängt eine Glocke ohne Klöppel.",
    art: "npcs/npc_anselm.jpg", merchant: false, pin: { x: 44, y: 80 }, faction: "tempel",
    lines: ["Auf dem Feld bereut man ehrlicher als im Tempel."],
    talk: { start: "Friede mit euch. Wer etwas loswerden will, findet mich hier an der Straße." } },
  morwen: { id: "morwen", name: "Morwen Nachtweyd", title: "Wahrsagerin der Fahrenden", location: "auen_kreuzung",
    text: "Vor einem bemalten Wagen sitzt eine Frau mit dunklen Locken und einer Kette aus Wolfszähnen.",
    art: "npcs/npc_morwen.jpg", merchant: false, pin: { x: 28, y: 80 }, faction: "fahrende",
    lines: ["Jeder Weg hier führt irgendwohin. Die Frage ist, wer euch dort erwartet."],
    talk: { start: "Setzt euch, Wanderer. Die Karten liegen schon, sie warten nur auf eure Hand." } },
  rika: { id: "rika", name: "Rika Stahl", title: "Hauptfrau der Söldner", location: "auen_kreuzung",
    text: "Eine Frau im Brustpanzer behält die Straßen im Blick. Am Kinn trägt sie eine alte Narbe.",
    art: "npcs/npc_rika.jpg", merchant: false, pin: { x: 72, y: 80 }, faction: "soeldner",
    lines: ["Die Kreuzung ist sicher, solange jemand dafür bezahlt."],
    talk: { start: "Ihr seht aus, als könntet ihr eine Klinge halten. Aufträge gibt es später, falls ihr fragt." } },
  gorm: { id: "gorm", name: "Gorm Kettler", title: "Gestürzter Hauptmann", location: "nirfal_langhaus",
    text: "Ein massiger Mann mit geflochtenem grauem Bart sitzt am Feuer, ein Trinkhorn in der Hand.",
    art: "npcs/npc_gorm.jpg", merchant: false, pin: { x: 30, y: 80 }, faction: "soeldner",
    lines: ["Im Langhaus fragt keiner, was man früher war."],
    talk: { start: "Setzt euch oder geht. Am Feuer ist Platz, Fragen beantworte ich keine." } },
  fenwick: { id: "fenwick", name: "Meister Fenwick Hollar", title: "Gildenmeister", location: "berum_zentralplatz",
    text: "Ein wohlgenährter Mann mit grauem Backenbart. Auf seiner Brust glänzt eine goldene Waage.",
    art: "npcs/npc_fenwick.jpg", merchant: false, pin: { x: 30, y: 80 }, faction: "gilde",
    lines: ["Was über diesen Hafen geht, geht auch über meine Bücher."],
    talk: { start: "Ah, ein neues Gesicht. Die Gilde merkt sich jeden, der in Berum Geschäfte macht." } },
  fips: { id: "fips", name: "Fips Lerche", title: "Gaukler und Ausrufer", location: "berum_fischmarkt",
    text: "Ein drahtiger Mann im geflickten bunten Mantel schlägt die Handtrommel zwischen den Fischständen.",
    art: "npcs/npc_fips.jpg", merchant: false, pin: { x: 30, y: 80 }, faction: "fahrende",
    lines: ["Neuigkeiten, frisch wie der Fang! Für eine Münze auch die ganz frischen."],
    talk: { start: "Hört, hört! Ein Fremder am Fischmarkt. Das rufe ich gleich aus, wenn ihr nichts dagegen habt." } },
  nessa: { id: "nessa", name: "Nessa Kühn", title: "Falschspielerin", location: "berum_wilder_wal",
    text: "Eine Frau mit rotem Zopf lässt am Tisch Würfel zwischen den Fingern wandern.",
    art: "npcs/npc_nessa.jpg", merchant: false, pin: { x: 30, y: 80 }, faction: "gasse",
    lines: ["Die Würfel lügen nie. Die Hände, die sie werfen, schon."],
    talk: { start: "Ein Spiel gefällig? Nein? Dann setzt euch wenigstens, ihr verdeckt mir die Kerze." } },
  // ---- Palast-NPCs (Leitung 13.10.; keine Eigennamen in Verzeichnis/Vorrat/Tafel -> Rollentitel; ohne Quests; Texte PLATZHALTER für Ext Text) ----
  prinz: { id: "prinz", name: "Der Prinz", title: "Sohn des Herrschers", location: "palast_prinzenzimmer",
    text: "Ein blasser junger Mann, der Kragen so hoch, dass er den Kopf nicht senken kann. Am Stirnreif hängt kein Stein; den hat ihm noch keiner zugestanden. Er sieht dich an wie eine Liste, auf die er bald selbst schreibt.",
    art: "npcs/npc_kragenherr.jpg", merchant: false, pin: { x: 30, y: 80 }, faction: "krone",
    lines: ["Mein Vater hört auf den Rat. Ich höre, wer im Rat spricht."],
    talk: { start: "Ein Gast ohne Siegel, im Flügel des Erben. Entweder hat Euch jemand durchgelassen, oder die Wache schläft. Beides will ich wissen. Sprecht leise; die Wände hier werden bezahlt." } },
  beraterin: { id: "beraterin", name: "Die Beraterin", title: "Beraterin des Königs", location: "palast_ratskammer",
    text: "Rotes Haar, rotes Gewand, und sie sitzt auf dem hohen Stuhl, als wäre das nie umstritten gewesen. Die Kerzen neben ihr brennen ruhig, ohne zu flackern. Niemand weiß, wann sie an den Hof kam, und keiner erinnert sich an ihre Ankunft.",
    art: "npcs/npc_beraterin.jpg", merchant: false, pin: { x: 30, y: 80 }, faction: "krone",
    lines: ["Der König entscheidet. Ich sorge nur dafür, dass er sich daran erinnert, was er will."],
    talk: { start: "Bleibt stehen. Die Stühle hier gehören Leuten, die etwas schulden. Ihr seid neu, das rieche ich am Straßenstaub. Sagt, was Ihr wollt, und ich sage Euch, was es kostet." } },
  tamsin: {
    id: "tamsin", name: "Tamsin", title: "Jägerin", location: "schenke",
    text: "Tamsin kennt jedes Gesicht, das länger als eine Nacht bleibt.",
    art: "npcs/tamsin.jpg",
    merchant: false, hours: ["mittag","nachmittag","abend","nacht"], pin: { x: 60, y: 84 }, faction: "rat",
    lines: [],
    talk: {
      start: "Willkommen in Unterorten. Der Brunnen ist sauber. Sagt, was ihr sucht.",
      quest: "Am Nebelpfad nimmt ein Wolf den Leuten die Ruhe. Wenn er fort ist, sitzen wir zusammen am Feuer."
    }
  },
  enno: {
    id: "enno", name: "Enno", title: "Zimmermann", location: "dorfzentrum",
    text: "Enno misst Balken. Wenn er spricht, geht es um Arbeit oder Wetter.",
    art: "npcs/enno.jpg",
    merchant: false, hours: ["morgen","vormittag","mittag","nachmittag"], pin: { x: 24, y: 74 }, faction: "rat",
    lines: ["Dach, Brunnen, Zaun. Wenn etwas klemmt, kommt zu mir."],
    talk: { start: "Guten Tag. Werkzeug sucht ihr beim Schmied. Ich baue, ich verkaufe nicht." }
  },
  hella: {
    id: "hella", name: "Hella", title: "Frau im Wald", location: "hexenhuette_innen",
    text: "Hella öffnet die Tür nur, wenn sie den Schritt kennt.",
    art: "npcs/hella.jpg",
    merchant: true, buys: true, shop: ["waldphiole","nebeltrank","aschesalbe"], stock: { waldphiole: 4, nebeltrank: 3, aschesalbe: 3 },
    hours: ["morgen","vormittag","nachmittag","abend","nacht"], pin: { x: 55, y: 88 }, faction: "nebel",
    lines: ["Die Hütte ist offen. Der Sumpf nicht. Fragt, bevor ihr pflückt."],
    talk: { start: "Ihr kommt vom Pfad. Setzt euch oder geht. Beides ist eine Entscheidung." }
  },
  branna: {
    id: "branna", name: "Branna", title: "Schmiedin", location: "schmied",
    text: "Branna wischt die Hände an der Schürze ab, bevor sie redet.",
    art: "npcs/branna.jpg",
    shop: ["dorfstahl","aschenklinge","aschenschild","eisen_beinschienen","hohe_panzerstiefel"],
    merchant: true, buys: true, hours: ["morgen","vormittag","mittag","nachmittag","abend"], pin: { x: 62, y: 74 }, faction: "rat",
    lines: ["Eisen kostet. Gutes Eisen kostet mehr."],
    talk: { start: "Was soll es sein? Ich schmiede, was hält, nicht was glänzt." }
  },
  vesse: {
    id: "vesse", name: "Vesse", title: "Dirnenwirtin", location: "bordell",
    text: "Vesse sieht zur Tür, bevor sie euch ansieht.",
    art: "npcs/vessa.jpg",
    shop: ["wein_der_stunde","kussphiole"], stock: { wein_der_stunde: 4, kussphiole: 2 },
    merchant: true, buys: true, hours: ["nachmittag","abend","nacht"], pin: { x: 20, y: 86 }, faction: "gasse",
    lines: ["Wer hier trinkt, zahlt vorher."],
    talk: { start: "Tretet ein. Hier redet man leise, und man zahlt, bevor man geht." }
  },
  corin: {
    id: "corin", name: "Corin", title: "", location: "bordell",
    text: "Corin lehnt am Vorhang und zählt die Gäste.",
    art: "npcs/corin.jpg",
    merchant: false, hours: ["nachmittag","abend","nacht"], pin: { x: 34, y: 87 }, faction: "gasse",
    lines: ["Ich sehe, wer kommt. Das reicht mir."],
    talk: { start: "Ihr seid nicht von hier. Das sieht man an den Schuhen." }
  },
  ila: {
    id: "ila", name: "Ila", title: "", location: "bordell",
    text: "Ila hält ein Glas, aus dem sie nicht trinkt.",
    art: "npcs/ila.jpg",
    merchant: false, hours: ["nachmittag","abend","nacht"], pin: { x: 47, y: 89 }, faction: "gasse",
    lines: ["Fragt Vesse, nicht mich."],
    talk: { start: "Setzt euch, wenn ihr wollt. Reden kostet hier nichts. Noch nicht." }
  },
  kes: {
    id: "kes", name: "Kes", title: "", location: "bordell",
    text: "Kes spielt mit einem Ring, der nicht ihr gehört.",
    art: "npcs/kes.jpg",
    merchant: false, hours: ["nachmittag","abend","nacht"], pin: { x: 60, y: 97 }, faction: "gasse",
    lines: ["Gold redet lauter als ihr."],
    talk: { start: "Ihr sucht jemanden? Dann sucht leiser." }
  },
  nim: {
    id: "nim", name: "Nim", title: "", location: "bordell",
    text: "Nim lächelt, aber die Augen bleiben bei der Tür.",
    art: "npcs/nim.jpg",
    merchant: false, hours: ["nachmittag","abend","nacht"], pin: { x: 74, y: 96 }, faction: "gasse",
    lines: ["Die Nacht ist lang genug für alle."],
    talk: { start: "Guten Abend. Bleibt oder geht, aber steht nicht im Licht." }
  },
  saffi: {
    id: "saffi", name: "Saffi", title: "", location: "bordell",
    text: "Saffi summt ein Lied aus den Gassen.",
    art: "npcs/saffi.jpg",
    merchant: false, hours: ["nachmittag","abend","nacht"], pin: { x: 88, y: 97 }, faction: "gasse",
    lines: ["Hier hört jeder alles. Sagt also nichts Dummes."],
    talk: { start: "Ihr seht müde aus. Hier wird man das nicht los, nur leichter." }
  },
  edrik: {
    id: "edrik", name: "Edrik", title: "Hauptmann der königlichen Garde", location: "platz",
    text: "Edrik steht, als gehöre ihm der Platz. Die Garde nickt, wenn er vorbeigeht.",
    art: "npcs/edrik.jpg",
    merchant: false, hours: ["morgen","vormittag","mittag","nachmittag","abend"], pin: { x: 30, y: 82 }, faction: "krone",
    lines: ["Haltet Ordnung, dann halte ich euch nicht auf."],
    talk: { start: "Ihr steht auf dem Platz des Königs. Sprecht klar und kurz." }
  },
  lira: {
    id: "lira", name: "Lira", title: "", location: "platz",
    text: "Lira sitzt nicht still. Sie sieht jeden, der durchs Tor kommt.",
    art: "npcs/lira_goldkehle.jpg",
    merchant: false, hours: ["morgen","vormittag","mittag","nachmittag","abend"], pin: { x: 72, y: 86 }, faction: "gasse",
    lines: ["Neue Gesichter fallen auf. Eures auch."],
    talk: { start: "Ihr seid neu. Ich merke mir Gesichter, nicht Namen." }
  },
  elfira: {
    id: "elfira", name: "Elfira", title: "", location: "knochenfeld",
    text: "Elfira geht zwischen den Knochen, als kenne sie jeden Bogen.",
    art: "npcs/elfira.jpg",
    merchant: false, hours: ["morgen","vormittag","mittag","nachmittag","abend"], pin: { x: 30, y: 85 }, faction: "nebel",
    lines: ["Der Wind hier vergisst nichts."],
    talk: { start: "Ihr seid weit vom Pfad. Was sucht ihr zwischen den Toten?" }
  },
  hart: {
    id: "hart", name: "Hart", title: "", location: "dorfzentrum",
    text: "Hart lehnt am Zaun und sieht den Brunnen an.",
    art: "npcs/hart.jpg",
    merchant: false, hours: ["morgen","vormittag","mittag","nachmittag","abend"], pin: { x: 72, y: 80 }, faction: "rat",
    lines: ["Unterorten wartet. Das kann es gut."],
    talk: { start: "Guten Tag. Wer in Unterorten bleibt, lernt Geduld oder geht." }
  },
  iven: {
    id: "iven", name: "Iven", title: "Händler für Amulette und Ringe", location: "markt",
    text: "Iven poliert einen Ring und sieht euch dabei nicht an.",
    art: "npcs/iven.jpg",
    shop: ["glutring","nebelamulett","kronenring","ascheohr"], stock: { ascheohr: 3 },
    merchant: true, buys: true, hours: ["morgen","vormittag","mittag","nachmittag","abend"], pin: { x: 68, y: 89 }, faction: "gasse",
    lines: ["Ein Ring sagt mehr als ein Titel."],
    talk: { start: "Ringe, Amulette, Steine. Nichts davon ist billig, alles davon ist echt." }
  },
  jorina: {
    id: "jorina", name: "Jorina", title: "", location: "nebelpfad",
    text: "Jorina geht am Rand des Pfades, wo der Boden fester ist.",
    art: "npcs/jorina_nebelreiterin.jpg",
    merchant: false, hours: ["morgen","vormittag","mittag","nachmittag","abend"], pin: { x: 48, y: 82 }, faction: "nebel",
    lines: ["Der Nebel trägt Stimmen weit."],
    talk: { start: "Bleibt auf dem Weg. Was daneben liegt, gehört dem Nebel." }
  },
  spiegelnde: {
    id: "spiegelnde", name: "Spiegelnde", title: "", location: "spiegelkammer",
    text: "Eine Frau steht vor den Spiegeln. Ihr Bild in den Scherben bewegt sich einen Atemzug später als sie.",
    art: "npcs/spiegelnde.jpg",
    merchant: false, hours: ["morgen","vormittag","mittag","nachmittag","abend","nacht"], pin: { x: 58, y: 84 },
    lines: ["Jeder Spiegel hier hat jemanden behalten."],
    talk: { start: "Ihr seid weit unten. Schaut nicht zu lange hinein. Die Spiegel geben nicht alles zurück." }
  },
  jorun: {
    id: "jorun", name: "Jorun", title: "Gastwirt", location: "gasthaus",
    text: "Jorun stellt Krüge ab, ohne zu fragen, wer sie bestellt hat.",
    art: "npcs/jorun.jpg",
    shop: ["wein_der_stunde","teichbluete"], stock: { wein_der_stunde: 5, teichbluete: 4 },
    merchant: true, buys: true, hours: ['mittag', 'nachmittag', 'abend', 'nacht'], pin: { x: 46, y: 58 }, faction: "krone",
    lines: ["Ein Platz kostet. Ein guter Platz kostet mehr."],
    talk: { start: "Setzt euch. Wer zahlt, bekommt Wärme und keine Fragen." }
  },
  kraemerin: {
    id: "kraemerin", name: "Krämerin", title: "Händlerin", location: "markt",
    text: "Die Krämerin steht hinter der Bude, als gehöre der Tisch fest zu ihr.",
    art: "npcs/kraemerin.jpg",
    shop: ["glutphiole","nebeltrank","aschesalbe","wein_der_stunde","teichbluete","waldphiole","kussphiole","spiegeltrank"], stock: { glutphiole: 5, nebeltrank: 3, aschesalbe: 3, wein_der_stunde: 5, teichbluete: 4, waldphiole: 4, kussphiole: 4, spiegeltrank: 3 },
    merchant: true, buys: true, hours: ["morgen","vormittag","mittag","nachmittag","abend"], pin: { x: 50, y: 79 }, faction: "gasse",
    lines: ["Salbe, Trank, Nadel. Sagt, was ihr braucht."],
    talk: { start: "Guten Tag. Die Ware ist frisch genug für den Preis, den ich nenne." }
  },
  rorik: {
    id: "rorik", name: "Rorik", title: "Oberster Rat von Unterorten", location: "ratshalle",
    text: "Rorik sitzt nicht am Kopf des Tisches. Er braucht ihn nicht.",
    art: "npcs/rorik.jpg",
    merchant: false, hours: ["morgen","vormittag","mittag","nachmittag","abend"], pin: { x: 10, y: 92 }, faction: "rat",
    lines: ["Entscheidungen brauchen Zeit. Unsere besonders."],
    talk: { start: "Ihr steht in der Ratshalle. Sagt, was ihr wollt, und wartet auf die Antwort." }
  },
  selene: {
    id: "selene", name: "Selene", title: "Frau von Rorik", location: "ratshalle",
    text: "Selene hört zu, bevor Rorik antwortet.",
    art: "npcs/selene.jpg",
    merchant: false, hours: ["morgen","vormittag","mittag","nachmittag","abend"], pin: { x: 88, y: 97 }, faction: "rat",
    lines: ["Rorik redet. Ich höre."],
    talk: { start: "Willkommen. Mein Mann hat viel zu tun. Ich habe Zeit." }
  },
  sarina: {
    id: "sarina", name: "Sarina", title: "", location: "obsidiansee",
    text: "Sarina sieht ins Wasser, als warte sie auf eine Antwort.",
    art: "npcs/sarina.jpg",
    merchant: false, hours: ['vormittag', 'mittag', 'nachmittag', 'abend', 'nacht'], pin: { x: 15, y: 72 }, faction: "nebel",
    lines: ["Das Wasser zeigt mehr als den Himmel."],
    talk: { start: "Leise. Der See hört zu." }
  },
  kassian: {
    id: "kassian", name: "Kassian", title: "Händler für Waffen und Rüstungen", location: "markt",
    text: "Kassian prüft eine Klinge gegen das Licht.",
    art: "npcs/kassian.jpg",
    shop: ["dorfstahl","aschenklinge","thronnadel","glasdolch","nebelklinge","zweihander","knochenhandschuh","seidenhand","russmantel","samtbrust","pelzmantel","glaspanzer","aschenschild","leder_hose","fangzahn_kampfrock","eisen_beinschienen","wickelstiefel","schnallen_lederstiefel","amethyst_stiefel","hohe_panzerstiefel"],
    merchant: true, buys: true, hours: ["morgen","vormittag","mittag","nachmittag","abend"], pin: { x: 57, y: 92 }, faction: "krone",
    lines: ["Stahl lügt nicht."],
    talk: { start: "Klingen, Panzer, Stiefel. Sagt, wogegen ihr kämpft." }
  }
};

const QUESTS = {
  wolfspfad: {
    id: "wolfspfad", title: "Der Wolf am Nebelpfad", giver: "burgvogt",
    where: "Nebelpfad, danach Burg der Aschenstadt",
    goal: "Tötet den Rußwolf am Nebelpfad und meldet Harn auf der Burg, dass der Weg wieder frei ist.",
    text: "Harn will den Pfad offen halten. Der Wolf hält Karren und Boten auf, und die Stadt verliert Zoll.",
    reward: { gold: 18, ansehen: 1, bond: { burgvogt: 8 } }
  },
  tamsin_wolf: {
    id: "tamsin_wolf", title: "Tamsins Ruhe", giver: "tamsin",
    where: "Nebelpfad, danach Schenke in Unterorten",
    goal: "Wenn der Rußwolf tot ist, geht zu Tamsin in die Schenke und sagt ihr, dass der Pfad wieder still ist.",
    text: "Tamsin ruht erst, wenn die Leute ohne Angst über den Pfad kommen.",
    reward: { gold: 8, bond: { tamsin: 10 } }
  }
};

const NARRATOR = {
  intro: {
    id: "intro", title: "Im Reich der Asche", art: null,
    text: "Das Aschenreich steht unter König Malrik Vael. Seit zwölf Jahren trägt er die Aschenkrone, das Reifstück im Palast und den Titel zugleich. Die Straßen sind sicher, solange niemand widerspricht. Unter dieser Ruhe sammelt sich Streit. Ihr steht noch ohne Seite. Jede Bindung, die ihr eingeht, lässt sich später lösen, aber nie ohne Preis."
  },
  unterorten: {
    id: "unterorten", title: "Unterorten", art: "ui/narr_unterorten.jpg",
    text: "Unterorten riecht nach nassem Holz und warmem Brot. Der Brunnen steht in der Mitte des Platzes, und niemand hat ihn je versetzt. Die Häuser sind ganz, die Dächer gehalten. Hier schlägt man den Zoll nicht an die Stirn, man rechnet ihn am Tisch. Tamsin sieht jeden, der über den Pfad kommt, noch bevor der Rat ihn kennt. Wer hier länger bleibt, wird gesehen. Wer geht, wird gezählt."
  },
  stadt: {
    id: "stadt", title: "Aschenstadt", art: null,
    text: "Aschenstadt trägt Malriks Ordnung offen. Die Tore schließen pünktlich, die Buden zahlen Zoll, und Harn steht auf der Burg, wo man einen Vogt erwartet. Die Glocken im Tempel schlagen selten. In den Gassen hinter dem Markt öffnen sich Türen nur für den, der den Preis kennt."
  },
  vorstadt: {
    id: "vorstadt", title: "Der Nebelpfad", art: null,
    text: "Der Pfad verbindet Stadt und Dorf. In den Senken bleibt der Nebel liegen, auch wenn der Wind kommt. Karren fahren langsamer als sonst. Ein Wolf hat den Weg unsicher gemacht, und die Boten warten lieber, als ihn zu prüfen."
  },
  duesterwald: {
    id: "duesterwald", title: "Düsterwald", art: null,
    text: "Der Düsterwald beginnt, wo der Pfad die letzte Marke verliert. Die Bäume stehen eng, und der Boden hält die Nässe. Hella wohnt hier. Sie öffnet die Tür, wenn sie den Schritt kennt. Wer pflückt, ohne zu fragen, findet den Sumpf früher als den Weg zurück."
  },
  wolf_tot: {
    id: "wolf_tot", title: "Der Pfad ist frei", art: null,
    text: "Der Rußwolf liegt still. Der Nebel bleibt, aber die Karren können wieder gehen. Harn wird das als Ordnung verbuchen. Tamsin als Ruhe. Was ihr daraus macht, hängt davon ab, wem ihr zuerst davon erzählt."
  }
};

// Kartenknöpfe: x/y in Prozent des BILDES (Ort sichtbar im Bild); app.js rechnet auf den beschnittenen Ausschnitt (cover) um.
const REGIONS = {
  vorstadt: { id: "vorstadt", name: "Vor den Toren", hub: "nebelpfad", map: "maps/vorstadt.jpg", wait: "ui/wait_vorstadt.jpg", idle: "ui/idle_vorstadt.jpg", pins: [
    { id: "nebelpfad", label: "Nebelpfad", x: 47, y: 45 },
    { id: "obsidiansee", label: "Obsidiansee", x: 78, y: 70 },
    { id: "knochenfeld", label: "Knochenfeld", x: 26, y: 16 },
    { id: "platz", label: "Aschenstadt", x: 48, y: 86 },
    { id: "dorfzentrum", label: "Unterorten", x: 78, y: 18 },
    { id: "alter_baum", label: "Düsterwald", x: 82, y: 42 },
    { id: "auen_kreuzung", label: "Grüne Auen", x: 12, y: 78 }  // Weg links unten aus dem Bild; Auen selbst sind nicht gezeichnet
  ]},
  stadt: { id: "stadt", name: "Aschenstadt", hub: "platz", map: "maps/stadt.jpg", wait: "ui/wait_stadt.jpg", idle: "ui/idle_stadt.jpg", pins: [
    { id: "platz", label: "Platz", x: 49, y: 57 },
    { id: "burg", label: "Burg", x: 50, y: 20 },
    { id: "tempel", label: "Tempel", x: 78, y: 28 },
    { id: "markt", label: "Markt", x: 45, y: 83 },
    { id: "gassen", label: "Gassen", x: 22, y: 42 },
    { id: "nebelpfad", label: "Vor den Toren", x: 78, y: 82 }
  ]},
  unterorten: { id: "unterorten", name: "Unterorten", hub: "dorfzentrum", map: "maps/unterorten.jpg", wait: "ui/wait_unterorten.jpg", idle: "ui/idle_unterorten.jpg", pins: [
    { id: "dorfzentrum", label: "Dorfzentrum", x: 49, y: 57 },
    { id: "schmied", label: "Schmiede", x: 22, y: 46 },
    { id: "ratshalle", label: "Ratshalle", x: 49, y: 20 },
    { id: "schenke", label: "Schenke", x: 72, y: 58 },
    { id: "nebelpfad", label: "Nebelpfad", x: 52, y: 93 }
  ]},
  // Berum, Hafenstadt (Nico 13.10.): Zentralort Zentralplatz; Landstraße zur Kreuzung. Der Schiffsweg ab den Docks ist gesperrt.
  berum: { id: "berum", name: "Berum", hub: "berum_zentralplatz", back: "Zurück zum Zentralplatz", map: "maps/berum.jpg", wait: "ui/wait_berum.jpg", idle: "ui/idle_berum.jpg", pins: [
    { id: "berum_zentralplatz", label: "Zentralplatz", x: 49, y: 54 },
    { id: "berum_fischmarkt", label: "Fischmarkt", x: 11, y: 63 },
    { id: "berum_wilder_wal", label: "Zum Wilden Wal", x: 27, y: 34 },
    { id: "berum_anwesen_mcclair", label: "Anwesen der McClairs", x: 71, y: 12 },
    { id: "berum_docks", label: "Docks", x: 84, y: 70 },
    { id: "auen_kreuzung", label: "Landstraße", x: 3, y: 13 }
  ]},
  // Große Nebenorte (Datenmodell, noch ohne Inhalt): Region mit sideArea: true hat eigene Karte, Orte, wait/idle wie ein Gebiet,
  // erscheint aber auf keiner anderen Karte und ist nur über einen Torbogen (exit mit arch + Hub-Ort mit pass) erreichbar.
  // Beispiel später: bauernhaus_innen: { id, name, hub, map, wait, idle, sideArea: true, pins: [...] } mit Torbogen am Bauernhaus.
  // Bauernhaus innen (Leitung 13.10.): großer Nebenort (sideArea) von „Bauernhaus außen“, Torbogen an der Haustür. Zentralort Diele.
  bauernhaus_innen: { id: "bauernhaus_innen", name: "Bauernhaus innen", hub: "bauernhaus_diele", back: "Zurück in die Diele", map: "maps/bauernhaus_innen.jpg", wait: "ui/wait_bauernhaus_innen.jpg", idle: "ui/idle_bauernhaus_innen.jpg", sideArea: true, pins: [
    { id: "bauernhaus_diele", label: "Diele", x: 49, y: 64 },
    { id: "bauernhaus_wohnzimmer", label: "Wohnzimmer", x: 22, y: 30 },
    { id: "bauernhaus_meinzimmer", label: "Mein Zimmer", x: 49, y: 21 },
    { id: "bauernhaus_kueche", label: "Küche", x: 77, y: 30 },
    { id: "bauernhaus_bad", label: "Badezimmer", x: 20, y: 68 },
    { id: "bauernhaus_elternzimmer", label: "Elternzimmer", x: 81, y: 66 },
    { id: "lotfild_bauernhaus", label: "Ausgang", x: 49, y: 89 }
  ]},
  // Garnison (Leitung 13.10.): großer Nebenort der Burg, Torbogen an der Seitentür. Zelle = kleiner Nebenort nur über Torbogen im Kerker.
  garnison: { id: "garnison", name: "Garnison", hub: "garnison_haupthalle", back: "Zurück in die Haupthalle", map: "maps/garnison.jpg", wait: "ui/wait_garnison.jpg", idle: "ui/idle_garnison.jpg", sideArea: true, pins: [
    { id: "garnison_haupthalle", label: "Haupthalle", x: 50, y: 43 },
    { id: "garnison_waffenkammer", label: "Waffenkammer", x: 16, y: 23 },
    { id: "garnison_schlafsaal", label: "Schlafsaal", x: 82, y: 24 },
    { id: "garnison_buero", label: "Büro", x: 84, y: 63 },
    { id: "garnison_kerker", label: "Kerker", x: 16, y: 59 },
    { id: "burg", label: "Ausgang", x: 49, y: 87 }
  ]},
  // Aschenpalast (Leitung 13.10.): großer Nebenort der Burg, Torbogen am Haupttor. Gemächer und Zimmer des Prinzen = kleine Nebenorte nur über Torbogen im Thronsaal.
  aschenpalast: { id: "aschenpalast", name: "Aschenpalast", hub: "palast_eingangshalle", back: "Zurück in die Eingangshalle", map: "maps/aschenpalast.jpg", wait: "ui/wait_aschenpalast.jpg", idle: "ui/idle_aschenpalast.jpg", sideArea: true, pins: [
    { id: "palast_eingangshalle", label: "Eingangshalle", x: 48, y: 66 },
    { id: "palast_thronsaal", label: "Thronsaal", x: 48, y: 26 },
    { id: "palast_ratskammer", label: "Ratskammer", x: 22, y: 61 },
    { id: "palast_speisesaal", label: "Speisesaal", x: 74, y: 63 },
    { id: "palast_kueche", label: "Königliche Küche", x: 88, y: 31 },
    { id: "burg", label: "Ausgang", x: 48, y: 89 }
  ]},
  // Nirfal (Nico 13.10.): Zentralort Versammlungsplatz, Weg zurück zu den Kalten Wegen.
  nirfal: { id: "nirfal", name: "Kleines Dorf Nirfal", hub: "nirfal_versammlungsplatz", back: "Zurück zum Versammlungsplatz", map: "maps/nirfal.jpg", wait: "ui/wait_nirfal.jpg", idle: "ui/idle_nirfal.jpg", pins: [
    { id: "nirfal_versammlungsplatz", label: "Versammlungsplatz", x: 50, y: 53 },
    { id: "nirfal_langhaus", label: "Langhaus", x: 50, y: 21 },
    { id: "nirfal_huetten", label: "Hütten", x: 13, y: 42 },
    { id: "nirfal_pfaehle", label: "Lange Pfähle", x: 87, y: 23 },
    { id: "gebirge_kalte_wege", label: "Weg", x: 55, y: 94 }
  ]},
  // Gebirgsvorland (Nico 13.10.): Zentralort Kalte Wege. Der Weg hinter dem Gebirgspfad ist gesperrt (locked).
  gebirge: { id: "gebirge", name: "Gebirgsvorland", hub: "gebirge_kalte_wege", back: "Zurück zu den Kalten Wegen", map: "maps/gebirge.jpg", wait: "ui/wait_gebirge.jpg", idle: "ui/idle_gebirge.jpg", pins: [
    { id: "gebirge_kalte_wege", label: "Kalte Wege", x: 50, y: 54 },
    { id: "gebirge_pfad", label: "Gebirgspfad", x: 20, y: 26 },
    { id: "gebirge_wasserfall", label: "Der gefrorene Wasserfall", x: 80, y: 24 },
    { id: "auen_kreuzung", label: "Die grünen Auen", x: 4, y: 82 },
    { id: "nirfal_versammlungsplatz", label: "Kleines Dorf Nirfal", x: 58, y: 37 }
  ]},
  // Die grünen Auen (Nico 13.10.): Zentralort Die Kreuzung. Gebirgsvorland/Hafenstadt gesperrt, bis Bilder da sind (pin.locked).
  auen: { id: "auen", name: "Die grünen Auen", hub: "auen_kreuzung", back: "Zurück zur Kreuzung", map: "maps/auen.jpg", wait: "ui/wait_auen.jpg", idle: "ui/idle_auen.jpg", scrim: "linear-gradient(rgba(12,7,8,.58), rgba(12,7,8,.66))", pins: [  // helle Bilder: stärkere Abdunklung
    { id: "auen_kreuzung", label: "Die Kreuzung", x: 61, y: 67 },
    { id: "nebelpfad", label: "Nebelpfad", x: 26, y: 38 },
    { id: "lotfild_strasse", label: "Bauernhof Lotfild", x: 15, y: 86 },
    { id: "gebirge_kalte_wege", label: "Gebirgsvorland", x: 86, y: 30 },
    { id: "berum_zentralplatz", label: "Hafenstadt", x: 81, y: 83 }
  ]},
  // Bauernhof Lotfild (Nico 13.10.): Zentralort Bauernhaus (draußen). Später: eigener Bereich „Bauernhaus innen“ als Nebenort (parent/pass) vom Bauernhaus aus.
  lotfild: { id: "lotfild", name: "Bauernhof Lotfild", hub: "lotfild_bauernhaus", back: "Zurück zum Bauernhaus", map: "maps/lotfild.jpg", wait: "ui/wait_lotfild.jpg", idle: "ui/idle_lotfild.jpg", pins: [
    { id: "lotfild_bauernhaus", label: "Bauernhaus außen", x: 62, y: 52 },
    { id: "lotfild_feld", label: "Feld", x: 28, y: 17 },
    { id: "lotfild_apfelbaeume", label: "Apfelbäume", x: 59, y: 19 },
    { id: "lotfild_scheune", label: "Scheune", x: 11, y: 40 },
    { id: "lotfild_werkstatt", label: "Werkstatt", x: 21, y: 84 },
    { id: "lotfild_brunnen", label: "Brunnen", x: 54, y: 93 },
    { id: "lotfild_teich", label: "Teich mit Steg", x: 87, y: 88 },
    { id: "lotfild_strasse", label: "Die Straße", x: 95, y: 63 }
  ]},
  duesterwald: { id: "duesterwald", name: "Düsterwald", hub: "alter_baum", back: "Zurück zum Alten Baum", map: "maps/duesterwald.jpg", wait: "ui/wait_duesterwald.jpg", idle: "ui/idle_duesterwald.jpg", pins: [
    { id: "alter_baum", label: "Alter Baum", x: 54, y: 29 },
    { id: "hexenhuette", label: "Hexenhütte", x: 24, y: 35 },
    { id: "blueteich", label: "Blütenteich", x: 76, y: 73 },
    { id: "sumpf", label: "Sumpf", x: 17, y: 72 },
    { id: "nebelpfad", label: "Nebelpfad", x: 51, y: 93 }
  ]}
};

const LOCATIONS = {
  platz: { id: "platz", name: "Platz", region: "stadt", blurb: "Der Brunnen steht in der Mitte. Wer durchs Tor kommt, steht zuerst hier, nicht zwischen den Buden.", art: "locations/aschenstadt.jpg",
    exits: [
      { id: "burg", label: "Burg" },
      { id: "tempel", label: "Tempel" },
      { id: "markt", label: "Markt" },
      { id: "gassen", label: "Gassen" },
      { id: "nebelpfad", label: "Vor den Toren" }
    ] },
  burg: { id: "burg", name: "Burg", region: "stadt", blurb: "Mauern über dem Platz. Harn hält hier Ordnung. Von hier sieht man die Dächer, und die Dächer sehen einen nicht zurück.", art: "locations/burg.jpg",
    exits: [ { id: "platz", label: "Zum Platz", x: 50, y: 88, arch: true },
      { id: "garnison_haupthalle", label: "Garnison", x: 19, y: 74, arch: true },
      { id: "palast_eingangshalle", label: "Aschenpalast", x: 77, y: 74, arch: true } ] },  // Palast: Haupttor rechts  // Torbogen an der linken Seitentür (Harn steht bei 34/78)
  // ---- Garnison (Ortstexte: PLATZHALTER für Ext Text) ----
  garnison_haupthalle: { id: "garnison_haupthalle", name: "Haupthalle", region: "garnison", pass: "ui/pass_garnison.jpg", blurb: "Kronenbanner über einem Tisch voller Kerben. Wachen löffeln Grütze, ohne den Helm abzulegen. Ein Fremder wird hier zuerst gezählt und dann angesehen.", art: "locations/garnison_haupthalle.jpg",
    exits: [
      { id: "garnison_waffenkammer", label: "Waffenkammer" },
      { id: "garnison_schlafsaal", label: "Schlafsaal" },
      { id: "garnison_buero", label: "Büro" },
      { id: "garnison_kerker", label: "Kerker" },
      { id: "burg", label: "Ausgang" }
    ] },
  garnison_waffenkammer: { id: "garnison_waffenkammer", name: "Waffenkammer", region: "garnison", blurb: "Speere in Reihen, Schilde mit abgekratztem Wappen. Für jede Lücke im Gestell steht ein Name im Buch, und einige der Namen sind durchgestrichen.", art: "locations/garnison_waffenkammer.jpg",
    exits: [
      { id: "garnison_haupthalle", label: "Haupthalle", x: 50, y: 90, arch: true }
    ] },
  garnison_schlafsaal: { id: "garnison_schlafsaal", name: "Schlafsaal", region: "garnison", blurb: "Zwanzig Pritschen und dreißig Mann; wer sich hinlegt, legt sich warm. Es stinkt nach Leder, Talg und nassen Fußlappen.", art: "locations/garnison_schlafsaal.jpg",
    exits: [
      { id: "garnison_haupthalle", label: "Haupthalle", x: 50, y: 90, arch: true }
    ] },
  garnison_buero: { id: "garnison_buero", name: "Büro", region: "garnison", blurb: "Die Stadtkarte ist mit Dolch und Becher beschwert, in den Gassen stecken Nadeln. Hier wird verteilt, wer wo wacht und wo keiner hinsieht.", art: "locations/garnison_buero.jpg",
    exits: [
      { id: "garnison_haupthalle", label: "Haupthalle", x: 50, y: 90, arch: true }
    ] },
  garnison_kerker: { id: "garnison_kerker", name: "Kerker", region: "garnison", blurb: "Wasser steht zwischen den Steinen. Hinter den Gittern husten Leute, deren Namen nicht im Buch stehen. Die Schlüssel hängen gut sichtbar am Haken, damit jeder sieht, dass er keinen hat.", art: "locations/garnison_kerker.jpg",
    exits: [
      { id: "garnison_haupthalle", label: "Haupthalle", x: 50, y: 90, arch: true },
      { id: "garnison_zelle", label: "Zelle", x: 12, y: 66, arch: true }
    ] },
  garnison_zelle: { id: "garnison_zelle", name: "Zelle", region: "garnison", parent: "garnison_kerker", pass: "ui/pass_zelle.jpg", back: "Zurück in den Kerker", blurb: "Faules Stroh, ein Eimer, ein Fensterschlitz, zu hoch für jede Hand. Jemand vor dir hat Striche in die Wand gekratzt und irgendwann damit aufgehört.", art: "locations/garnison_zelle.jpg",
    exits: [
      { id: "garnison_kerker", label: "Zurück in den Kerker" }
    ] },
  // ---- Aschenpalast (Ortstexte: PLATZHALTER für Ext Text; Ratskammer ≠ Ratshalle in Unterorten) ----
  palast_eingangshalle: { id: "palast_eingangshalle", name: "Eingangshalle", region: "aschenpalast", pass: "ui/pass_aschenpalast.jpg", blurb: "Der rote Läufer reicht vom Tor bis zur Treppe, und die Wachen achten darauf, dass du daneben gehst. Auf dem blanken Stein siehst du jede Spur, die dein Stiefel mitbringt.", art: "locations/palast_eingangshalle.jpg",
    exits: [
      { id: "palast_thronsaal", label: "Thronsaal" },
      { id: "palast_ratskammer", label: "Ratskammer" },
      { id: "palast_speisesaal", label: "Speisesaal" },
      { id: "palast_kueche", label: "Königliche Küche" },
      { id: "burg", label: "Ausgang" }
    ] },
  palast_ratskammer: { id: "palast_ratskammer", name: "Ratskammer", region: "aschenpalast", blurb: "Hohe Stühle um einen runden Tisch, einer davon höher als der Thron draußen. Kein Schreiber, keine Tinte. Was hier beschlossen wird, gilt draußen als Wille des Königs. Die Luft ist trocken und für den Stein zu warm.", art: "locations/palast_ratskammer.jpg",
    exits: [
      { id: "palast_eingangshalle", label: "Eingangshalle", x: 50, y: 90, arch: true }
    ] },
  palast_speisesaal: { id: "palast_speisesaal", name: "Speisesaal", region: "aschenpalast", blurb: "Silber auf einer langen Tafel, die Sitzordnung mit Kreide aufs Holz geschrieben. Wer weiter unten sitzt, isst später. Wer einen Platz nach unten rückt, erfährt es vor allen anderen.", art: "locations/palast_speisesaal.jpg",
    exits: [
      { id: "palast_eingangshalle", label: "Eingangshalle", x: 50, y: 90, arch: true }
    ] },
  palast_kueche: { id: "palast_kueche", name: "Königliche Küche", region: "aschenpalast", blurb: "Feuer unter acht Kesseln, Mägde mit verbrannten Unterarmen. Ein Vorkoster sitzt in der Ecke und isst langsam. Hier hört man vor dem Thronsaal, wer beim König in Ungnade gefallen ist.", art: "locations/palast_kueche.jpg",
    exits: [
      { id: "palast_eingangshalle", label: "Eingangshalle", x: 50, y: 90, arch: true }
    ] },
  palast_thronsaal: { id: "palast_thronsaal", name: "Thronsaal", region: "aschenpalast", blurb: "Elf Stufen bis zum Thron, und auf jeder wird man leiser. Rauch aus den Becken hängt unter den Bannern. Hier trägt Malrik die Krone, die dem Reich ihren Namen gibt.", art: "locations/palast_thronsaal.jpg",
    exits: [
      { id: "palast_eingangshalle", label: "Eingangshalle", x: 50, y: 90, arch: true },
      { id: "palast_gemaecher", label: "Königliche Gemächer", x: 14, y: 66, arch: true },
      { id: "palast_prinzenzimmer", label: "Zimmer des Prinzen", x: 86, y: 66, arch: true }
    ] },
  palast_gemaecher: { id: "palast_gemaecher", name: "Königliche Gemächer", region: "aschenpalast", parent: "palast_thronsaal", pass: "ui/pass_gemaecher.jpg", back: "Zurück in den Thronsaal", blurb: "Unter dem roten Baldachin des Himmelbetts sind beide Kissen eingedrückt. Die Teppiche schlucken jeden Schritt. Wer ungerufen hier steht, hat schon erklärt, warum er bleiben muss.", art: "locations/palast_gemaecher.jpg",
    exits: [
      { id: "palast_thronsaal", label: "Zurück in den Thronsaal" }
    ] },
  palast_prinzenzimmer: { id: "palast_prinzenzimmer", name: "Zimmer des Prinzen", region: "aschenpalast", parent: "palast_thronsaal", pass: "ui/pass_prinzenzimmer.jpg", back: "Zurück in den Thronsaal", blurb: "Bücher mit zerlesenen Rücken, ein Pult mit abgeschlossener Lade. Die Decke ist gefaltet, wie es Diener nicht tun. Hier wohnt einer, der weiß, dass sein Zimmer durchsucht wird.", art: "locations/palast_prinzenzimmer.jpg",
    exits: [
      { id: "palast_thronsaal", label: "Zurück in den Thronsaal" }
    ] },
  markt: { id: "markt", name: "Markt", region: "stadt", blurb: "Buden stehen in Reihen. Der Zoll hängt an jeder Plane, und wer bleibt, wird gesehen.", art: "locations/markt.jpg",
    exits: [ { id: "platz", label: "Zum Platz", x: 50, y: 88, arch: true } ] },
  tempel: { id: "tempel", name: "Tempel", region: "stadt", blurb: "Die Glocke hängt schwer. Sie schlägt selten, und wenn sie schlägt, wird der Platz still.", art: "locations/tempel.jpg",
    exits: [ { id: "katakomben", label: "Katakomben", x: 17, y: 86, arch: true },  // Torbogen zwischen den vorderen linken Säulen, über den Tempel-Knöpfen
      { id: "platz", label: "Zum Platz", x: 50, y: 90, arch: true } ] },
  katakomben: { id: "katakomben", name: "Katakomben", region: "stadt", blurb: "Eine Treppe führt unter den Tempel. Hinter dem Gitter liegen Gänge mit Grabnischen und Kerzen.", art: "locations/katakomben.jpg",
    parent: "tempel", pass: "ui/pass_kata.jpg",
    exits: [ { id: "tempel", label: "Zurück zum Tempel" },
      { id: "kalte_halle", label: "Kalte Halle", x: 82, y: 76, arch: true } ] },  // Torbogen im rechten Gang
  kalte_halle: { id: "kalte_halle", name: "Kalte Halle", region: "stadt", blurb: "Säulen tragen Eis statt Ruß. Zwischen den Sarkophagen liegt Nebel, und der Boden ist kälter als der Stein darüber.", art: "locations/kalte_halle.jpg",
    parent: "katakomben", pass: "ui/pass_kaltehalle.jpg",
    exits: [ { id: "katakomben", label: "Zurück in die Katakomben" },
      { id: "spiegelkammer", label: "Spiegelkammer", x: 50, y: 52, arch: true } ] },  // tiefer, am Ende der Halle
  spiegelkammer: { id: "spiegelkammer", name: "Spiegelkammer", region: "stadt", blurb: "Gesprungene Spiegel lehnen an der Felswand. Jeder zeigt den Raum ein wenig anders, als er ist.", art: "locations/spiegelkammer.jpg",
    parent: "kalte_halle", pass: "ui/pass_spiegelkammer.jpg",
    exits: [ { id: "kalte_halle", label: "Zurück in die Kalte Halle" } ] },
  gassen: { id: "gassen", name: "Gassen", region: "stadt", blurb: "Die Gassen sind eng. Türen öffnen sich nur, wenn jemand den Preis schon kennt.", art: "locations/gassen.jpg",
    exits: [
      { id: "bordell", label: "Rote Tür", x: 78, y: 70, arch: true },  // Torbogen auf dem Rundbogen rechts
      { id: "gasthaus", label: "Gasthaus", x: 22, y: 72, arch: true },  // Tür links in der Gasse
      { id: "platz", label: "Zum Platz", x: 28, y: 88, arch: true }
    ] },
  bordell: { id: "bordell", name: "Bordell", region: "stadt", blurb: "Die rote Tür lässt Licht auf die Schwelle. Drinnen redet man leiser als auf dem Platz.", art: "locations/bordell.jpg",
    // Nebenort: nicht auf der Karte, nur über parent erreichbar; Kartenfenster zeigt pass.
    parent: "gassen", pass: "ui/pass_rotetuer.jpg",
    exits: [ { id: "gassen", label: "Zurück nach Gassen" } ] },
  gasthaus: { id: "gasthaus", name: "Gasthaus", region: "stadt", blurb: "Tische, Rauch, ein Tresen. Wer zahlt, bekommt einen Platz, der nicht der Markt ist.", art: "locations/gasthaus.jpg",
    // Nebenort der Gassen: nur über die Tür in den Gassen, keine Schnellreise.
    parent: "gassen", pass: "ui/pass_gasthaus.jpg", back: "Zurück in die Gassen",
    exits: [ { id: "gassen", label: "Zurück in die Gassen" } ] },
  nebelpfad: { id: "nebelpfad", name: "Nebelpfad", region: "vorstadt", blurb: "Der Boden ist nass, die Sicht kurz. Der Weg trägt Stadt und Dorf, solange niemand ihn sperrt.", art: "locations/nebelpfad.jpg", wild: true,
    events: [
      { id: "russwolf", when: { flags: { cleared_russwolf: false, wolf_dealt: false } }, once: false, priority: 10, run: "startEncounter", arg: "russwolf" }
    ],
    exits: [
      { id: "obsidiansee", label: "Obsidiansee" },
      { id: "knochenfeld", label: "Knochenfeld" },
      { id: "platz", label: "Aschenstadt" },
      { id: "dorfzentrum", label: "Unterorten" },
      { id: "alter_baum", label: "Düsterwald" },
      { id: "auen_kreuzung", label: "Grüne Auen" }
    ] },
  obsidiansee: { id: "obsidiansee", name: "Obsidiansee", region: "vorstadt", blurb: "Das Wasser ist dunkel und still. Der Pfad bleibt hinter dem Schilf.", art: "locations/obsidiansee.jpg",
    exits: [ { id: "nebelpfad", label: "Nebelpfad", x: 50, y: 90, arch: true } ] },
  knochenfeld: { id: "knochenfeld", name: "Knochenfeld", region: "vorstadt", blurb: "Weiße Stücke im Gras. Der Wind kommt vom Pfad und nimmt nichts mit.", art: "locations/knochenfeld.jpg",
    exits: [ { id: "nebelpfad", label: "Nebelpfad", x: 50, y: 90, arch: true } ] },
  dorfzentrum: { id: "dorfzentrum", name: "Dorfzentrum", region: "unterorten", blurb: "Der Brunnen steht in der Mitte. An Tamsins Tür hängen Felle zum Trocknen, es riecht nach nassem Holz.", art: "locations/dorfzentrum.jpg",
    events: [
      { id: "wolf_niederlage_tamsin", when: { flags: { wolf_niederlage: true } }, once: true, priority: 10, run: "wolfDefeatTamsin" }
    ],
    exits: [
      { id: "schmied", label: "Schmiede" },
      { id: "ratshalle", label: "Ratshalle" },
      { id: "schenke", label: "Schenke" },
      { id: "nebelpfad", label: "Nebelpfad" }
    ] },
  schmied: { id: "schmied", name: "Schmiede", region: "unterorten", blurb: "Wärme schlägt aus der Esse. Hammer und Eisen geben dem Platz den Takt.", art: "locations/schmiede.jpg",
    exits: [ { id: "dorfzentrum", label: "Zum Brunnen", x: 50, y: 90, arch: true } ] },
  ratshalle: { id: "ratshalle", name: "Ratshalle", region: "unterorten", blurb: "Ein langer Tisch, wenig Schmuck. Hier dauern Entscheidungen, und niemand eilt sie.", art: "locations/ratshalle.jpg",
    exits: [ { id: "dorfzentrum", label: "Zum Brunnen", x: 50, y: 90, arch: true } ] },
  schenke: { id: "schenke", name: "Schenke", region: "unterorten", blurb: "Die Schenke ist wärmer als der Brunnenplatz. Krüge stehen, auch wenn wenig gesprochen wird.", art: "locations/schenke.jpg",
    exits: [ { id: "dorfzentrum", label: "Zum Brunnen", x: 50, y: 90, arch: true } ] },
  alter_baum: { id: "alter_baum", name: "Alter Baum", region: "duesterwald", blurb: "Der Baum ist älter als der Pfad. Von hier gehen die Wege zur Hütte, zum Teich und in den Sumpf.", art: "locations/alter_baum.jpg",
    exits: [
      { id: "hexenhuette", label: "Hexenhütte" },
      { id: "blueteich", label: "Blütenteich" },
      { id: "sumpf", label: "Sumpf" },
      { id: "nebelpfad", label: "Nebelpfad" }
    ] },
  hexenhuette: { id: "hexenhuette", name: "Hexenhütte", region: "duesterwald", blurb: "Rauch steht über dem Kessel. An der Schwelle hängen Kräuter, die man nicht ohne Frage nimmt.", art: "locations/hexenhuette.jpg",
    exits: [ { id: "hexenhuette_innen", label: "Tür", x: 46, y: 78, arch: true },  // Torbogen auf der Haustür
      { id: "alter_baum", label: "Alter Baum", x: 50, y: 90, arch: true } ] },
  hexenhuette_innen: { id: "hexenhuette_innen", name: "Hexenhütte (innen)", region: "duesterwald", blurb: "Ein Raum mit Feuerstelle, Tisch und Spiegel. Unter der Decke trocknen Kräuter.", art: "locations/hexenhaus.jpg",
    parent: "hexenhuette", pass: "ui/pass_huette.jpg",
    exits: [ { id: "hexenhuette", label: "Zurück zur Hexenhütte" } ] },
  // ---- Berum (Ortstexte: PLATZHALTER für Ext Text) ----
  berum_zentralplatz: { id: "berum_zentralplatz", name: "Zentralplatz", region: "berum", blurb: "Um den Brunnen ist das Pflaster nass vom Seenebel. Von hier gehen die Gassen zum Markt, zum Gasthaus und hinunter zu den Docks.", art: "locations/berum_zentralplatz.jpg",
    exits: [
      { id: "berum_fischmarkt", label: "Fischmarkt" },
      { id: "berum_wilder_wal", label: "Zum Wilden Wal" },
      { id: "berum_anwesen_mcclair", label: "Anwesen der McClairs" },
      { id: "berum_docks", label: "Docks" },
      { id: "auen_kreuzung", label: "Landstraße" }
    ] },
  berum_fischmarkt: { id: "berum_fischmarkt", name: "Fischmarkt", region: "berum", blurb: "Unter fleckigen Planen liegt der Fang auf Eis und Salz. Es riecht nach Tang und Teer.", art: "locations/berum_fischmarkt.jpg",
    exits: [ { id: "berum_zentralplatz", label: "Zentralplatz", x: 50, y: 90, arch: true } ] },
  berum_wilder_wal: { id: "berum_wilder_wal", name: "Gasthaus zum Wilden Wal", region: "berum", blurb: "Über der Tür hängt ein Walschädel. Drinnen ist es laut und warm.", art: "locations/berum_wilder_wal.jpg",
    exits: [ { id: "berum_zentralplatz", label: "Zentralplatz", x: 50, y: 90, arch: true } ] },
  berum_anwesen_mcclair: { id: "berum_anwesen_mcclair", name: "Anwesen der McClairs", region: "berum", blurb: "Die Mauer ist frisch gekalkt, damit das Salz nicht frisst. Das Haus steht über Berum, mit dem Rücken zum Hafen, der es bezahlt hat. Am Tor fragt dich ein Diener nach deinem Namen und vergleicht ihn mit einer Liste.", art: "locations/berum_anwesen_mcclair.jpg",
    exits: [ { id: "berum_zentralplatz", label: "Zentralplatz", x: 50, y: 90, arch: true },
      { id: "berum_anwesen_innen", label: "Anwesen innen", x: 66, y: 44, arch: true } ] },  // Torbogen am Hauseingang
  // Anwesen innen (Leitung 13.10.): kleiner Nebenort, nur über Torbogen; Text PLATZHALTER für Ext Text
  berum_anwesen_innen: { id: "berum_anwesen_innen", name: "Anwesen innen", region: "berum", blurb: "Teppiche aus dem Süden, an den Rändern vom Salz zerfressen. Wachs, Seeluft, kalter Tabak. Die hohen Fenster gehen aufs Meer, damit die McClairs ihre Schiffe zählen können, bevor die Gilde es tut.", art: "locations/berum_anwesen_innen.jpg",
    parent: "berum_anwesen_mcclair", pass: "ui/pass_anwesen.jpg", back: "Zurück vor das Anwesen",
    exits: [ { id: "berum_anwesen_mcclair", label: "Zurück vor das Anwesen" } ] },
  berum_docks: { id: "berum_docks", name: "Docks", region: "berum", blurb: "Schiffe liegen am nassen Steg, ein Kran knarrt im Wind. Hinter dem Nebel beginnt das offene Wasser.", art: "locations/berum_docks.jpg",
    exits: [ { id: "berum_zentralplatz", label: "Zentralplatz", x: 50, y: 90, arch: true },
      { id: "berum_schiffsweg", label: "Wird fortgesetzt", x: 55, y: 66, arch: true, locked: "Der Weg ist noch nicht begehbar." } ] },
  // ---- Nirfal (Ortstexte: PLATZHALTER für Ext Text) ----
  nirfal_versammlungsplatz: { id: "nirfal_versammlungsplatz", name: "Versammlungsplatz", region: "nirfal", blurb: "In der Mitte des gepflasterten Platzes brennt ein Feuer im Steinkreis. Rauch zieht zum Langhaus hinauf.", art: "locations/nirfal_versammlungsplatz.jpg",
    exits: [
      { id: "nirfal_langhaus", label: "Langhaus" },
      { id: "nirfal_huetten", label: "Hütten" },
      { id: "nirfal_pfaehle", label: "Lange Pfähle" },
      { id: "gebirge_kalte_wege", label: "Weg" }
    ] },
  nirfal_langhaus: { id: "nirfal_langhaus", name: "Langhaus", region: "nirfal", blurb: "Das Moosdach reicht fast bis zum Boden, über der Tür sind Zeichen ins Holz geschnitten. Drinnen glimmt Licht.", art: "locations/nirfal_langhaus.jpg",
    exits: [ { id: "nirfal_versammlungsplatz", label: "Versammlungsplatz", x: 50, y: 90, arch: true } ] },
  nirfal_huetten: { id: "nirfal_huetten", name: "Hütten", region: "nirfal", blurb: "Niedrige Hütten drängen sich an den Hang. Zwischen den Dächern hängt kalter Rauch.", art: "locations/nirfal_huetten.jpg",
    exits: [ { id: "nirfal_versammlungsplatz", label: "Versammlungsplatz", x: 50, y: 90, arch: true } ] },
  nirfal_pfaehle: { id: "nirfal_pfaehle", name: "Lange Pfähle", region: "nirfal", blurb: "Hohe geschnitzte Pfähle stehen am Felsrand. Der Wind pfeift durch die Kerben.", art: "locations/nirfal_pfaehle.jpg",
    exits: [ { id: "nirfal_versammlungsplatz", label: "Versammlungsplatz", x: 50, y: 90, arch: true } ] },
  // ---- Gebirgsvorland (Ortstexte: PLATZHALTER für Ext Text) ----
  gebirge_kalte_wege: { id: "gebirge_kalte_wege", name: "Kalte Wege", region: "gebirge", blurb: "Ein Steinmann markiert den Sattel, der Wind pfeift über Geröll und Schnee. Von hier gehen Pfade bergauf und zurück in die Auen.", art: "locations/gebirge_kalte_wege.jpg",
    exits: [
      { id: "gebirge_pfad", label: "Gebirgspfad" },
      { id: "gebirge_wasserfall", label: "Der gefrorene Wasserfall" },
      { id: "auen_kreuzung", label: "Die grünen Auen" },
      { id: "nirfal_versammlungsplatz", label: "Kleines Dorf Nirfal" }
    ] },
  gebirge_pfad: { id: "gebirge_pfad", name: "Gebirgspfad", region: "gebirge", blurb: "Der Pfad klebt am Fels, daneben fällt der Hang in den Nebel. Ein krummer Baum hält sich an der Kante fest.", art: "locations/gebirge_pfad.jpg",
    exits: [ { id: "gebirge_kalte_wege", label: "Kalte Wege", x: 50, y: 90, arch: true },
      { id: "gebirge_weiter", label: "Wird fortgesetzt", x: 78, y: 62, arch: true, locked: "Der Weg ist noch nicht begehbar." } ] },
  gebirge_wasserfall: { id: "gebirge_wasserfall", name: "Der gefrorene Wasserfall", region: "gebirge", blurb: "Das Wasser ist mitten im Fall erstarrt. Unter dem Eis hört man es noch leise arbeiten.", art: "locations/gebirge_wasserfall.jpg",
    exits: [ { id: "gebirge_kalte_wege", label: "Kalte Wege", x: 50, y: 90, arch: true } ] },
  // ---- Die grünen Auen (Ortstext: PLATZHALTER für Ext Text) ----
  auen_kreuzung: { id: "auen_kreuzung", name: "Die Kreuzung", region: "auen", blurb: "Ein alter Wegstein steht, wo sich vier Wege kreuzen. Der Bach murmelt daneben, und jeder Weg führt woandershin.", art: "locations/auen_kreuzung.jpg",
    exits: [
      { id: "nebelpfad", label: "Nebelpfad" },
      { id: "lotfild_strasse", label: "Bauernhof Lotfild" },
      { id: "gebirge_kalte_wege", label: "Gebirgsvorland" },
      { id: "berum_zentralplatz", label: "Hafenstadt" }
    ] },
  // ---- Bauernhof Lotfild (Ortstexte: PLATZHALTER für Ext Text) ----
  lotfild_bauernhaus: { id: "lotfild_bauernhaus", name: "Bauernhaus außen", region: "lotfild", blurb: "Rauch steigt aus dem Schornstein, über der Tür brennt eine Laterne. Von hier führen die Wege zu Feld, Scheune und Straße.", art: "locations/lotfild_bauernhaus.jpg",
    exits: [
      { id: "bauernhaus_diele", label: "Bauernhaus innen", x: 84, y: 68, arch: true },
      { id: "lotfild_feld", label: "Feld" },
      { id: "lotfild_apfelbaeume", label: "Apfelbäume" },
      { id: "lotfild_scheune", label: "Scheune" },
      { id: "lotfild_werkstatt", label: "Werkstatt" },
      { id: "lotfild_brunnen", label: "Brunnen" },
      { id: "lotfild_teich", label: "Teich mit Steg" },
      { id: "lotfild_strasse", label: "Die Straße" }
    ] },
  lotfild_feld: { id: "lotfild_feld", name: "Feld", region: "lotfild", blurb: "Das Korn steht hoch und raschelt im Wind. Zwischen den Halmen führt ein schmaler Pfad zurück zum Haus.", art: "locations/lotfild_feld.jpg",
    exits: [ { id: "lotfild_bauernhaus", label: "Bauernhaus außen", x: 50, y: 90, arch: true } ] },
  lotfild_apfelbaeume: { id: "lotfild_apfelbaeume", name: "Apfelbäume", region: "lotfild", blurb: "Die Äste hängen schwer von roten Äpfeln. Im Gras liegt Fallobst, und Wespen sind schneller als ihr.", art: "locations/lotfild_apfelbaeume.jpg",
    exits: [ { id: "lotfild_bauernhaus", label: "Bauernhaus außen", x: 50, y: 90, arch: true } ] },
  lotfild_scheune: { id: "lotfild_scheune", name: "Scheune", region: "lotfild", blurb: "Das Tor steht halb offen, drinnen riecht es nach Heu und altem Holz. Werkzeug lehnt an der Wand.", art: "locations/lotfild_scheune.jpg",
    exits: [ { id: "lotfild_bauernhaus", label: "Bauernhaus außen", x: 50, y: 90, arch: true } ] },
  lotfild_werkstatt: { id: "lotfild_werkstatt", name: "Werkstatt", region: "lotfild", blurb: "Aus dem Schornstein steigt Rauch. Auf der Werkbank liegen Späne, und ein halb fertiger Zaunpfahl wartet.", art: "locations/lotfild_werkstatt.jpg",
    exits: [ { id: "lotfild_bauernhaus", label: "Bauernhaus außen", x: 50, y: 90, arch: true } ] },
  // ---- Bauernhaus innen (Ortstexte: PLATZHALTER für Ext Text) ----
  bauernhaus_diele: { id: "bauernhaus_diele", name: "Diele", region: "bauernhaus_innen", pass: "ui/pass_bauernhaus.jpg", blurb: "Lehm von den Feldern klebt an der Schwelle, Stiefel stehen nach Größe gereiht. Sechs Türen, und jede hört, wer durch die Diele geht.", art: "locations/bauernhaus_diele.jpg",
    exits: [
      { id: "bauernhaus_wohnzimmer", label: "Wohnzimmer" },
      { id: "bauernhaus_meinzimmer", label: "Mein Zimmer" },
      { id: "bauernhaus_kueche", label: "Küche" },
      { id: "bauernhaus_bad", label: "Badezimmer" },
      { id: "bauernhaus_elternzimmer", label: "Elternzimmer" },
      { id: "lotfild_bauernhaus", label: "Ausgang" }
    ] },
  bauernhaus_wohnzimmer: { id: "bauernhaus_wohnzimmer", name: "Wohnzimmer", region: "bauernhaus_innen", blurb: "Am Kamin hängt das Pachtbuch an einem Nagel, damit es keiner vergisst. Auf der Bank sitzt man nach Rang: Vater, Mutter, dann der Rest.", art: "locations/bauernhaus_wohnzimmer.jpg",
    exits: [ { id: "bauernhaus_diele", label: "Diele", x: 50, y: 90, arch: true } ] },
  bauernhaus_meinzimmer: { id: "bauernhaus_meinzimmer", name: "Mein Zimmer", region: "bauernhaus_innen", blurb: "Ein Bett, kürzer als du. In der Truhe liegt, was du besitzt, und der Deckel schließt trotzdem. Durchs Fenster siehst du die Straße, die aus Lotfild hinausführt.", art: "locations/bauernhaus_meinzimmer.jpg",
    exits: [ { id: "bauernhaus_diele", label: "Diele", x: 50, y: 90, arch: true } ] },
  bauernhaus_kueche: { id: "bauernhaus_kueche", name: "Küche", region: "bauernhaus_innen", blurb: "Rauch im Gebälk, Ruß an den Töpfen. Das Brot ist angeschnitten und abgezählt. Wer hier zu viel nimmt, merkt es am nächsten Morgen an den Blicken.", art: "locations/bauernhaus_kueche.jpg",
    exits: [ { id: "bauernhaus_diele", label: "Diele", x: 50, y: 90, arch: true } ] },
  bauernhaus_bad: { id: "bauernhaus_bad", name: "Badezimmer", region: "bauernhaus_innen", blurb: "Ein Holzzuber, der Wasser nur hält, wenn man ihn vorher quellen lässt. Das Wasser trägt man selbst vom Brunnen herein. Wer zuletzt badet, badet im Grau der anderen.", art: "locations/bauernhaus_bad.jpg",
    exits: [ { id: "bauernhaus_diele", label: "Diele", x: 50, y: 90, arch: true } ] },
  bauernhaus_elternzimmer: { id: "bauernhaus_elternzimmer", name: "Elternzimmer", region: "bauernhaus_innen", blurb: "Das breite Bett, die Kiste mit dem Schloss, der Schlüssel am Hals deines Vaters. Ohne Grund kommt hier keiner herein, und wer es tut, braucht eine Erklärung.", art: "locations/bauernhaus_elternzimmer.jpg",
    exits: [ { id: "bauernhaus_diele", label: "Diele", x: 50, y: 90, arch: true } ] },
  lotfild_brunnen: { id: "lotfild_brunnen", name: "Brunnen", region: "lotfild", blurb: "Der Eimer hängt am Seil, das Wasser unten ist kalt und klar. Hier treffen sich die Wege des Hofs.", art: "locations/lotfild_brunnen.jpg",
    exits: [ { id: "lotfild_bauernhaus", label: "Bauernhaus außen", x: 50, y: 90, arch: true } ] },
  lotfild_teich: { id: "lotfild_teich", name: "Teich mit Steg", region: "lotfild", blurb: "Ein Steg reicht ins stille Wasser. Frösche verstummen, wenn jemand näher kommt.", art: "locations/lotfild_teich.jpg",
    exits: [ { id: "lotfild_bauernhaus", label: "Bauernhaus außen", x: 50, y: 90, arch: true } ] },
  lotfild_strasse: { id: "lotfild_strasse", name: "Die Straße", region: "lotfild", blurb: "Der Weg windet sich ins neblige Tal hinab. Hinter dem Gatter liegt der Hof, vor euch die Kreuzung.", art: "locations/lotfild_strasse.jpg",
    exits: [ { id: "lotfild_bauernhaus", label: "Bauernhaus außen", x: 20, y: 90, arch: true },
      { id: "auen_kreuzung", label: "Die Kreuzung", x: 68, y: 86, arch: true } ] },
  blueteich: { id: "blueteich", name: "Blütenteich", region: "duesterwald", blurb: "Blüten liegen auf dem Wasser. Der Baum bleibt der Weg zurück.", art: "locations/blueteich.jpg",
    exits: [ { id: "alter_baum", label: "Alter Baum", x: 50, y: 90, arch: true } ] },
  sumpf: { id: "sumpf", name: "Sumpf", region: "duesterwald", blurb: "Der Boden gibt nach. Wer weiter will, kehrt besser zum Baum um.", art: "locations/sumpf.jpg",
    exits: [ { id: "alter_baum", label: "Alter Baum", x: 50, y: 90, arch: true } ] }
};

const BASE_HERO = { level: 1, hp: 28, hpMax: 28, atk: 4, def: 2, will: 3, fortune: 4, ansehen: 0, gold: 16, ap: 2, apMax: 2, crit: 4 };

const WOLF_LINES = {
  wolf_niederlage: "Ihr liegt am Brunnen, nicht auf dem Pfad. Der Wolf hat euch umgeworfen und ist geblieben. Trinkt, dann entscheidet, ob ihr noch einmal hingeht."
};

window.D = {
  WORLD, FACTIONS, DAY_PHASES, BOND_STEPS, STAT_KEYS,
  HERKUENFTE, FLUECHE, PORTRAITS, AVATARE, START_POOL, EXT_ART, ITEMS, SKILLS, MONSTER, NPCs, QUESTS,
  NARRATOR, REGIONS, LOCATIONS, BASE_HERO, WOLF_LINES, SPAWN_TABLES, ZEICHEN, PFAD_ZEICHEN, GRAD_STUFEN
};

// ---- Male, Flüche, Segen (male-fluche-segen.md §6, fx laut grad-zeichen-kampf.md §12.4) ----
// fx je Stufe als Gesamtwert; gerichtete Werte als Objekt { ziel: zahl }. wirkung = Wirkung in Worten (Zahlen nur mit ?debug=1).
window.D.PERKS = {
  mal_des_kriegers: { art: "mal", name: "Mal des Kriegers", sichtbar: "offen", text: "Eine Narbe, die nicht heilt, sondern hart wird.", wirkung: "stärkt Angriff und Deckung etwas, Flucht fällt schwerer", stufen: [{ atk: 1, def: 1, fleePct: -3 }, { atk: 1, def: 2, fleePct: -3 }, { atk: 1, def: 3, fleePct: -5 }], oeffnet: ["schnellschlag", "eisenhaut", "solarplexus"] },
  mal_des_magiers: { art: "mal", name: "Mal des Magiers", sichtbar: "spuerbar", text: "Eine Aschezeichnung unter der Haut, sichtbar bei Kerzenlicht.", wirkung: "Zeichen treffen und heilen stärker", stufen: [{ zauberPct: 10, heilPct: 10 }, { zauberPct: 15, heilPct: 15 }, { zauberPct: 20, heilPct: 20 }], oeffnet: ["feuerball", "froststachel", "heilfunke"] },
  mal_des_diebes: { art: "mal", name: "Mal des Diebes", sichtbar: "spuerbar", text: "Ein Fingerzeichen, das Gassenleute kennen.", wirkung: "häufiger harte Treffer, leichtere Flucht, bessere Preise in der Gasse", stufen: [{ crit: 2, fleePct: 3, tradePct: { gasse: 3 } }, { crit: 3, fleePct: 4, tradePct: { gasse: 4 } }, { crit: 5, fleePct: 5, tradePct: { gasse: 5 } }], oeffnet: ["giftklinge", "schattenhieb", "blutung"] },
  mal_des_diplomaten: { art: "mal", name: "Mal des Diplomaten", sichtbar: "offen", text: "Kein Körpermal, sondern ein Siegelwort, das man trägt.", wirkung: "erste Begegnungen wärmer, etwas bessere Preise", stufen: [{ bondErstPlus: 1, tradePct: { alle: 2 } }, { bondErstPlus: 1, tradePct: { alle: 3 } }, { bondErstPlus: 2, tradePct: { alle: 4 } }] },
  mal_der_asche: { art: "mal", name: "Aschemal", sichtbar: "offen", text: "Die Asche kennt euch.", wirkung: "keine Kampfwirkung", stufen: [{}] },
  mal_des_wolfstoeters: { art: "mal", name: "Wolfstöter", sichtbar: "offen", text: "Ihr habt einen legendären Wolf erschlagen.", wirkung: "etwas mehr Schaden gegen wilde Tiere", stufen: [{ vsTag: { wild: 1 } }], exklusiv: ["mal_des_wolfspakts", "segen_waldgastrecht"] },
  mal_des_wolfspakts: { art: "mal", name: "Paktmal", sichtbar: "spuerbar", text: "Der Wolf hat euch gehen lassen, und ihr ihn.", wirkung: "im Düsterwald seltener überrascht; wilde Wölfe greifen nicht mehr an", stufen: [{ travelSafePct: { duesterwald: 10 } }], exklusiv: ["mal_des_wolfstoeters"] },
  mal_des_verraeters: { art: "mal", name: "Verrätermal", sichtbar: "verborgen", text: "Was ihr verraten habt, haftet an euch.", wirkung: "keine Zahl", stufen: [{}] },
  fluch_glasherz: { art: "fluch", name: "Glasherz", sichtbar: "spuerbar", text: "Was euch trifft, trifft oft auch den, der zuschlägt.", wirkung: "Treffer springen zurück, ihr seid zerbrechlicher", loesen: "Bei Hella abgeben · Im Tempel brechen", stufen: [{ reflect: 15, hp: -4 }, { reflect: 20, hp: -6 }, { reflect: 25, hp: -8 }], migFx: { reflect: 25 } },
  fluch_kronenbrand: { art: "fluch", name: "Kronenbrand", sichtbar: "spuerbar", text: "Die Hände werden warm, wenn Macht nah ist.", wirkung: "mehr Kraft, weniger Deckung", loesen: "Im Tempel brechen", stufen: [{ atk: 2, def: -1 }, { atk: 3, crit: 5, def: -1 }, { atk: 3, crit: 8, def: -2 }], migFx: {} },
  fluch_stumme_glocke: { art: "fluch", name: "Stumme Glocke", sichtbar: "spuerbar", text: "Zufälle neigen sich euch zu. Nicht immer freundlich.", wirkung: "Wille gestärkt, Glück neigt sich zu", loesen: "Eld alles erzählen", stufen: [{ will: 2, fortune: 10 }, { will: 2, fortune: 12 }, { will: 3, fortune: 15 }], migFx: {} },
  fluch_blutmond: { art: "fluch", name: "Blutmond", sichtbar: "spuerbar", text: "Fremde Wunden wärmen euch. Der Preis bleibt an euch haften.", wirkung: "Treffer heilen euch etwas, Heilung von außen wirkt schwächer", loesen: "Totenwache im Tempel · Hellas Preis", stufen: [{ lifesteal: 10, hp: -2, healInPct: -15 }, { lifesteal: 15, hp: -3, healInPct: -15 }, { lifesteal: 20, hp: -4, healInPct: -15 }], oeffnetAb: { 2: ["wundmal"] }, migFx: { lifesteal: 20 }, exklusiv: ["segen_der_glocke"] },
  fluch_gassenschuld: { art: "fluch", name: "Gassenschuld", sichtbar: "spuerbar", grad: true, geber: "gasse", text: "Ihr schuldet der Gasse etwas, und die Gasse weiß es.", wirkung: "bessere Preise in der Gasse, der Rat redet kühler", loesen: "Schuld begleichen", stufen: [{ tradePct: { gasse: 4 } }, { tradePct: { gasse: 5 } }, { tradePct: { gasse: 6 } }] },
  fluch_nebelpreis: { art: "fluch", name: "Genannter Preis", sichtbar: "spuerbar", grad: true, geber: "nebel", text: "Hella hat geholfen und einen Preis genannt. Er wird fällig.", wirkung: "im Düsterwald seltener überrascht; der Preis kommt", loesen: "Den Preis bei Hella zahlen", stufen: [{ travelSafePct: { duesterwald: 10 } }, { travelSafePct: { duesterwald: 12 } }, { travelSafePct: { duesterwald: 15 } }] },
  fluch_glockenschweigen: { art: "fluch", name: "Glockenschweigen", sichtbar: "offen", text: "Die Glocke schweigt, wenn ihr betet.", wirkung: "Beten bringt weniger Kraft", loesen: "Bußdienst im Tempel", stufen: [{ wkAktion: { beten: -2 } }, { wkAktion: { beten: -3 } }, { wkAktion: { beten: -5 } }], exklusiv: ["segen_der_glocke"] },
  fluch_spiegelhunger: { art: "fluch", name: "Spiegelhunger", sichtbar: "spuerbar", grad: true, text: "Ihr seht in Gesichtern, was sie verbergen. Eure eigenen Lügen fallen eher auf.", wirkung: "Manipulation leichter durchschaut, eigene Lügen riskanter", loesen: "Sieben Tage ohne Spiegeltrank", stufen: [{ probeStufe: { manipulation: -1 }, secretsRiskPct: 5 }, { probeStufe: { manipulation: -1 }, secretsRiskPct: 10 }, { probeStufe: { manipulation: -2 }, secretsRiskPct: 15 }] },
  fluch_aschefieber: { art: "fluch", name: "Aschefieber", sichtbar: "verborgen", text: "Ein Fieber aus Asche. Feuer liegt euch näher.", wirkung: "Willenskraft kommt langsamer zurück, Feuer brennt heller", loesen: "Waldphiole und Ruhe · Tempel", stufen: [{ regenPct: -5, zauberPct: { feuer: 10 } }, { regenPct: -7, zauberPct: { feuer: 15 } }, { regenPct: -10, zauberPct: { feuer: 20 } }] },
  fluch_fremder_name: { art: "fluch", name: "Fremder Name", sichtbar: "spuerbar", grad: true, text: "Ihr tragt einen Namen, der nicht eurer ist.", wirkung: "man erkennt euch schwerer, erste Begegnungen kühler", loesen: "Den Namen bei Harn ablegen", stufen: [{ bekanntheitPct: -50, bondErstPlus: -2 }, { bekanntheitPct: -50, bondErstPlus: -2 }, { bekanntheitPct: -50, bondErstPlus: -2 }] },
  segen_der_glocke: { art: "segen", name: "Segen der Glocke", sichtbar: "offen", geber: "tempel", text: "Die Glocke hört euch zu.", wirkung: "Wille gestärkt, Beten bringt mehr Kraft", bedingung: "Keine Lüge im Tempel", stufen: [{ will: 1, wkAktion: { beten: 1 } }, { will: 2, wkAktion: { beten: 1 } }], exklusiv: ["fluch_glockenschweigen", "fluch_blutmond"] },
  segen_kronensiegel: { art: "segen", name: "Kronensiegel", sichtbar: "offen", geber: "krone", text: "Harns Siegel öffnet Türen der Krone.", wirkung: "Krone-Türen ohne Bestechung (Zoll ruht, bis es Zoll gibt)", bedingung: "Alle 7 Tage Bericht bei Harn", stufen: [{ zollPct: -50 }, { zollPct: -75 }], exklusiv: ["segen_nebelpfand"] },
  segen_waldgastrecht: { art: "segen", name: "Gastrecht des Waldes", sichtbar: "spuerbar", geber: "nebel", text: "Der Wald lässt euch gehen.", wirkung: "im Wald und Sumpf seltener überrascht, bessere Preise bei Hella", bedingung: "Kein Feuer, nichts ohne Frage pflücken", stufen: [{ travelSafePct: { duesterwald: 15 }, tradePct: { hella: 5 } }, { travelSafePct: { duesterwald: 20 }, tradePct: { hella: 8 } }], exklusiv: ["mal_des_wolfstoeters"] },
  segen_nebelpfand: { art: "segen", name: "Nebelpfand", sichtbar: "spuerbar", geber: "nebel", text: "Ein Pfand, das an Zöllnern vorbeiführt.", wirkung: "ruht, bis es Zoll gibt", stufen: [{}], exklusiv: ["segen_kronensiegel"] },
  segen_der_esse: { art: "segen", name: "Segen der Esse", sichtbar: "offen", grad: true, ortSegen: true, text: "Die Esse kennt eure Hände.", wirkung: "mehr Lohn und bessere Preise in der Schmiede", stufen: [{ workGold: 2, tradePct: { schmied: 5 } }, { workGold: 3, tradePct: { schmied: 8 } }] },
  segen_rote_gunst: { art: "segen", name: "Gunst der Roten Tür", sichtbar: "spuerbar", geber: "gasse", text: "Das Haus hinter der roten Tür hält zu euch, solange ihr schweigt.", wirkung: "bessere Preise in der Gasse", bedingung: "Kein Plaudern, keine Gewalt im Haus", stufen: [{ tradePct: { gasse: 6 } }, { tradePct: { gasse: 8 } }] },
  // nur noch für Altstände (nicht mehr erwerbbar, Leitung 13.10.): Anzeige und Wirkung bleiben, damit alte Saves laden.
  segen_tamsins_tisch: { art: "segen", name: "Tamsins Tisch", sichtbar: "offen", text: "An Tamsins Tisch ist ein Platz für euch.", wirkung: "Einkehr in der Schenke bringt mehr Kraft", stufen: [{ wkAktion: { schenke: 1 } }, { wkAktion: { schenke: 1 } }] },
  segen_brot_und_dach: { art: "segen", name: "Brot und Dach", sichtbar: "offen", geber: "rat", text: "Unterorten gibt euch Brot und ein Dach.", wirkung: "Ruhe im Dorfzentrum bringt mehr Kraft", stufen: [{ wkAktion: { ruhe: 1 } }, { wkAktion: { ruhe: 2 } }] },
  segen_zweiter_atem: { art: "segen", name: "Zweiter Atem", sichtbar: "offen", grad: true, ortSegen: true, text: "Wenn ihr fallt, steht ihr noch einmal auf.", wirkung: "einmal am Tag im Kampf, kurz vor dem Fall, etwas Leben zurück", stufen: [{ zweiterAtem: 20 }, { zweiterAtem: 25 }] },
  segen_des_zuhoerens: { art: "segen", name: "Gabe des Zuhörens", sichtbar: "spuerbar", grad: true, ortSegen: true, text: "Ihr hört, was geredet wird.", wirkung: "ihr merkt, wenn man über euch spricht", stufen: [{}, {}] }
};
// ---- Händler-Wirtschaft (Ausbesserung 2): eigenes Gold, Wochen-Sortiment aus eigenem Pool ----
// gold = Kasse je Woche (7 Tage), size = Anzahl Waren je Wochen-Auswahl, pool = mögliche Waren.
window.D.MERCHANT_ECON = {
  marktfrau: { gold: 120, size: 5, pool: ["glutphiole","nebeltrank","aschesalbe","wein_der_stunde","teichbluete","waldphiole","kussphiole"] },
  hella: { gold: 90, size: 3, pool: ["waldphiole","nebeltrank","aschesalbe","teichbluete","spiegeltrank","glutphiole"] },
  branna: { gold: 220, size: 5, pool: ["dorfstahl","aschenklinge","aschenschild","eisen_beinschienen","hohe_panzerstiefel","knochenhandschuh","zweihander","schnallen_lederstiefel","leder_hose"] },
  vesse: { gold: 100, size: 3, pool: ["wein_der_stunde","kussphiole","spiegeltrank","seidenhand","samtbrust"] },
  iven: { gold: 200, size: 4, pool: ["glutring","nebelamulett","kronenring","ascheohr","teichbluete"] },
  jorun: { gold: 80, size: 2, pool: ["wein_der_stunde","teichbluete","aschesalbe","glutphiole"] },
  kraemerin: { gold: 150, size: 7, pool: ["glutphiole","nebeltrank","aschesalbe","wein_der_stunde","teichbluete","waldphiole","kussphiole","spiegeltrank","ascheohr"] },
  kassian: { gold: 350, size: 14, pool: ["dorfstahl","aschenklinge","thronnadel","glasdolch","nebelklinge","zweihander","knochenhandschuh","seidenhand","russmantel","samtbrust","pelzmantel","glaspanzer","aschenschild","leder_hose","fangzahn_kampfrock","eisen_beinschienen","wickelstiefel","schnallen_lederstiefel","amethyst_stiefel","hohe_panzerstiefel"] }
};
// Alte Fluch-IDs (Erstellung bis Oktober 2026) -> Perk-ID
window.D.FLUCH_MIGRATION = { glasherz: "fluch_glasherz", kronenbrand: "fluch_kronenbrand", stumme_glocke: "fluch_stumme_glocke", blutmond: "fluch_blutmond" };
