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
  nebelwanderer: { id: "nebelwanderer", name: "Nebelwanderer", text: "Du kennst Wege zwischen den Dörfern, die auf keiner Karte stehen.", mods: { hp: 4, atk: 2, def: 1, gold: 20, ap: 2, will: 2 } }
};

const FLUECHE = {
  glasherz: { id: "glasherz", name: "Glasherz", text: "Was dich trifft, trifft oft auch den, der zuschlägt.", mods: { hp: -8, reflect: 25 } },
  kronenbrand: { id: "kronenbrand", name: "Kronenbrand", text: "Deine Hände werden warm, wenn Macht nah ist. Manche spüren das und weichen.", mods: { atk: 5, def: -1 } },
  stumme_glocke: { id: "stumme_glocke", name: "Stille Glocke", text: "Zufälle neigen sich dir zu. Nicht immer freundlich.", mods: { will: 3, fortune: 15 } },
  blutmond: { id: "blutmond", name: "Blutmond", text: "Wunden an anderen wärmen dich. Der Preis bleibt an dir haften.", mods: { lifesteal: 20, hp: -2 } }
};

const PORTRAITS = {
  ascheadel: { id: "ascheadel", name: "Ascheadel", art: "portraits/ascheadel.jpg" },
  gossenschatten: { id: "gossenschatten", name: "Gossenschatten", art: "portraits/gossenschatten.jpg" },
  tempelkind: { id: "tempelkind", name: "Tempelkind", art: "portraits/tempelkind.jpg" },
  nebelwanderer: { id: "nebelwanderer", name: "Nebelwanderer", art: "portraits/nebelwanderer.jpg" }
};

const ITEMS = {
  aschenklinge: { id: "aschenklinge", img: "items/aschenklinge.jpg", name: "Aschenklinge", type: "waffe", slot: "waffeL", atk: 3, dmgMin: 4, dmgMax: 8, speed: 2.4, price: 28, sell: 14, text: "Die Schneide hält die Wärme eines alten Feuers." },
  glasdolch: { id: "glasdolch", img: "items/glasdolch.jpg", name: "Glasdolch", type: "waffe", slot: "waffeL", atk: 5, crit: 6, dmgMin: 3, dmgMax: 6, speed: 1.8, fx: { fleePct: 5 }, price: 50, sell: 25, text: "Leicht, scharf und leicht zu verstecken." },
  russmantel: { id: "russmantel", img: "items/russmantel.jpg", name: "Rußmantel", type: "ruestung", slot: "brust", def: 2, fx: { travelSafePct: 10 }, price: 22, sell: 11, text: "Der Stoff hält Wind und neugierige Blicke ab." },
  glutphiole: { id: "glutphiole", img: "items/glutphiole.jpg", name: "Glutphiole", type: "verbrauch", heal: 18, price: 10, sell: 5, text: "Ein Schluck Wärme. Die Rippen werden leichter." },
  nebeltrank: { id: "nebeltrank", img: "items/nebeltrank.jpg", name: "Nebeltrank", type: "verbrauch", ap: 2, price: 12, sell: 6, text: "Danach fällt der nächste Entschluss leichter." },
  waldphiole: { id: "waldphiole", img: "items/waldphiole.jpg", name: "Waldphiole", type: "verbrauch", heal: 12, will: 1, wk: 5, price: 14, sell: 7, text: "Bitter. Danach steht der Kopf klarer." },
  aschesalbe: { id: "aschesalbe", img: "items/aschesalbe.jpg", name: "Aschesalbe", type: "verbrauch", heal: 8, def: 1, price: 11, sell: 5, text: "Zieht auf der Haut und hält eine Weile stand." },
  obsidianmuenze: { id: "obsidianmuenze", img: "items/obsidianmuenze.jpg", name: "Obsidianmünze", type: "quest", text: "Auf der einen Seite eine Krone, auf der anderen ein offenes Tor." },
  aschenkrone: { id: "aschenkrone", name: "Aschenkrone", type: "quest", text: "Das Reifstück des Reichs. Wer es trägt, trägt auch den Titel." },
  dorfstahl: { id: "dorfstahl", img: "items/dorfstahl.jpg", name: "Dorfstahl", type: "waffe", slot: "waffeL", atk: 2, price: 18, sell: 9, text: "Ein einfacher Dolch mit gerader Klinge und Ledergriff." },
  nebelklinge: { id: "nebelklinge", img: "items/nebelklinge.jpg", name: "Nebelklinge", type: "waffe", slot: "waffeL", atk: 4, fx: { vsMonster: { glashexe: 2 } }, price: 42, sell: 21, text: "Ein gerades Schwert mit heller, glatter Klinge und einfachem Querstück." },
  thronnadel: { id: "thronnadel", img: "items/thronnadel.jpg", name: "Thronnadel", type: "waffe", slot: "waffeL", atk: 3, fx: { vsMonster: { raeuber: 2 } }, price: 34, sell: 17, text: "Ein langer, dünner Stichdolch mit verziertem Messinggriff." },
  zweihander: { id: "zweihander", img: "items/zweihander.jpg", name: "Zweihänder", type: "waffe", slot: "waffeL", twoHanded: true, atk: 6, fx: { fleePct: -10 }, price: 60, sell: 30, text: "Ein langes, schweres Schwert mit dunkler Parierstange für beide Hände." },
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
  russwolf: { id: "russwolf", name: "Rußwolf", hp: 28, atk: 7, def: 1, gold: [6, 14], loot: ["glutphiole"], art: "monsters/russwolf.jpg", text: "Der Wolf kommt vom Pfad, nicht aus der Stadt. Die Schnauze ist rußig, der Blick fest.", wild: true },
  glashexe: { id: "glashexe", name: "Glashexe", hp: 28, atk: 7, def: 2, gold: [10, 22], loot: ["glasdolch"], art: "monsters/glashexe.jpg", text: "Sie steht zwischen den Bäumen, als gehöre der Weg ihr.", wild: true },
  raeuber: { id: "raeuber", name: "Räuber", hp: 20, atk: 5, def: 1, gold: [8, 16], loot: ["glutphiole"], art: "monsters/raeuber.jpg", human: true, text: "Ein Mann mit Tuch vor dem Mund. Er will den Beutel, nicht ein Gespräch." }
};

const NPCs = {
  burgvogt: {
    id: "burgvogt", name: "Harn", title: "Burgvogt", location: "markt",
    text: "Harn trägt den Ring des Königs sichtbar. Wer ihn anspricht, spricht mit der Stadt.",
    art: "npcs/burgvogt.jpg", merchant: false,
    hours: ["vormittag","mittag","nachmittag"], pin: { x: 58, y: 68 }, faction: "krone",
    lines: ["Die Wege nach Unterorten sind offen. Bringt Bericht, wenn etwas den Zoll stört."],
    talk: {
      start: "Ihr seid neu genug, dass die Stadt euren Namen noch nicht führt. Sprecht kurz und haltet euch an die Ordnung.",
      quest: "Am Nebelpfad hält ein Wolf die Karren auf. Die Boten warten, der Zoll bleibt liegen. Wenn das Tier tot ist, kommt zu mir auf den Markt.",
      done: "Der Pfad ist wieder nutzbar. Die Stadt merkt sich, wer ihre Wege freihält."
    }
  },
  marktfrau: {
    id: "marktfrau", name: "Maera", title: "Gastwirtin", location: "schenke",
    text: "Maera steht hinter der Bude, als gehöre der Tisch fest zu ihr.",
    art: "npcs/marktfrau.jpg", merchant: true, buys: true,
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
  tamsin: {
    id: "tamsin", name: "Tamsin", title: "Jägerin", location: "schenke",
    text: "Tamsin kennt jedes Gesicht, das länger als eine Nacht bleibt.",
    art: "npcs/tamsin.jpg",
    merchant: false, hours: ["mittag","nachmittag","abend","nacht"], pin: { x: 60, y: 84 }, faction: "rat", rest: true,
    lines: ["Brot und Lager gibt es, wenn ihr zahlt und keinen Streit anfangt."],
    talk: {
      start: "Willkommen in Unterorten. Der Brunnen ist sauber. Sagt, was ihr sucht.",
      quest: "Am Nebelpfad nimmt ein Wolf den Leuten die Ruhe. Wenn er fort ist, trinke ich mit euch."
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
    art: "ui/siluette.jpg",  // Platzhalter, eigenes Bild fehlt noch
    shop: ["dorfstahl","aschenklinge","aschenschild","eisen_beinschienen","hohe_panzerstiefel"],
    merchant: true, buys: true, hours: ["morgen","vormittag","mittag","nachmittag","abend"], pin: { x: 62, y: 74 }, faction: "rat",
    lines: ["Eisen kostet. Gutes Eisen kostet mehr."],
    talk: { start: "Was soll es sein? Ich schmiede, was hält, nicht was glänzt." }
  },
  vesse: {
    id: "vesse", name: "Vesse", title: "Dirnenwirtin", location: "bordell",
    text: "Vesse sieht zur Tür, bevor sie euch ansieht.",
    art: "ui/siluette.jpg",  // Platzhalter, eigenes Bild fehlt noch
    shop: ["wein_der_stunde","kussphiole"], stock: { wein_der_stunde: 4, kussphiole: 2 },
    merchant: true, buys: true, hours: ["nachmittag","abend","nacht"], pin: { x: 20, y: 86 }, faction: "gasse",
    lines: ["Wer hier trinkt, zahlt vorher."],
    talk: { start: "Tretet ein. Hier redet man leise, und man zahlt, bevor man geht." }
  },
  corin: {
    id: "corin", name: "Corin", title: "", location: "bordell",
    text: "Corin lehnt am Vorhang und zählt die Gäste.",
    art: "ui/siluette.jpg",  // Platzhalter, eigenes Bild fehlt noch
    merchant: false, hours: ["nachmittag","abend","nacht"], pin: { x: 34, y: 87 }, faction: "gasse",
    lines: ["Ich sehe, wer kommt. Das reicht mir."],
    talk: { start: "Ihr seid nicht von hier. Das sieht man an den Schuhen." }
  },
  ila: {
    id: "ila", name: "Ila", title: "", location: "bordell",
    text: "Ila hält ein Glas, aus dem sie nicht trinkt.",
    art: "ui/siluette.jpg",  // Platzhalter, eigenes Bild fehlt noch
    merchant: false, hours: ["nachmittag","abend","nacht"], pin: { x: 47, y: 89 }, faction: "gasse",
    lines: ["Fragt Vesse, nicht mich."],
    talk: { start: "Setzt euch, wenn ihr wollt. Reden kostet hier nichts. Noch nicht." }
  },
  kes: {
    id: "kes", name: "Kes", title: "", location: "bordell",
    text: "Kes spielt mit einem Ring, der nicht ihr gehört.",
    art: "ui/siluette.jpg",  // Platzhalter, eigenes Bild fehlt noch
    merchant: false, hours: ["nachmittag","abend","nacht"], pin: { x: 60, y: 97 }, faction: "gasse",
    lines: ["Gold redet lauter als ihr."],
    talk: { start: "Ihr sucht jemanden? Dann sucht leiser." }
  },
  nim: {
    id: "nim", name: "Nim", title: "", location: "bordell",
    text: "Nim lächelt, aber die Augen bleiben bei der Tür.",
    art: "ui/siluette.jpg",  // Platzhalter, eigenes Bild fehlt noch
    merchant: false, hours: ["nachmittag","abend","nacht"], pin: { x: 74, y: 96 }, faction: "gasse",
    lines: ["Die Nacht ist lang genug für alle."],
    talk: { start: "Guten Abend. Bleibt oder geht, aber steht nicht im Licht." }
  },
  saffi: {
    id: "saffi", name: "Saffi", title: "", location: "bordell",
    text: "Saffi summt ein Lied aus den Gassen.",
    art: "ui/siluette.jpg",  // Platzhalter, eigenes Bild fehlt noch
    merchant: false, hours: ["nachmittag","abend","nacht"], pin: { x: 88, y: 97 }, faction: "gasse",
    lines: ["Hier hört jeder alles. Sagt also nichts Dummes."],
    talk: { start: "Ihr seht müde aus. Hier wird man das nicht los, nur leichter." }
  },
  edrik: {
    id: "edrik", name: "Edrik", title: "Hauptmann der königlichen Garde", location: "platz",
    text: "Edrik steht, als gehöre ihm der Platz. Die Garde nickt, wenn er vorbeigeht.",
    art: "ui/siluette.jpg",  // Platzhalter, eigenes Bild fehlt noch
    merchant: false, hours: ["morgen","vormittag","mittag","nachmittag","abend"], pin: { x: 30, y: 82 }, faction: "krone",
    lines: ["Haltet Ordnung, dann halte ich euch nicht auf."],
    talk: { start: "Ihr steht auf dem Platz des Königs. Sprecht klar und kurz." }
  },
  lira: {
    id: "lira", name: "Lira", title: "", location: "platz",
    text: "Lira sitzt nicht still. Sie sieht jeden, der durchs Tor kommt.",
    art: "ui/siluette.jpg",  // Platzhalter, eigenes Bild fehlt noch
    merchant: false, hours: ["morgen","vormittag","mittag","nachmittag","abend"], pin: { x: 72, y: 86 }, faction: "gasse",
    lines: ["Neue Gesichter fallen auf. Eures auch."],
    talk: { start: "Ihr seid neu. Ich merke mir Gesichter, nicht Namen." }
  },
  elfira: {
    id: "elfira", name: "Elfira", title: "", location: "knochenfeld",
    text: "Elfira geht zwischen den Knochen, als kenne sie jeden Bogen.",
    art: "ui/siluette.jpg",  // Platzhalter, eigenes Bild fehlt noch
    merchant: false, hours: ["morgen","vormittag","mittag","nachmittag","abend"], pin: { x: 30, y: 85 }, faction: "nebel",
    lines: ["Der Wind hier vergisst nichts."],
    talk: { start: "Ihr seid weit vom Pfad. Was sucht ihr zwischen den Toten?" }
  },
  hart: {
    id: "hart", name: "Hart", title: "", location: "dorfzentrum",
    text: "Hart lehnt am Zaun und sieht den Brunnen an.",
    art: "ui/siluette.jpg",  // Platzhalter, eigenes Bild fehlt noch
    merchant: false, hours: ["morgen","vormittag","mittag","nachmittag","abend"], pin: { x: 72, y: 80 }, faction: "rat",
    lines: ["Unterorten wartet. Das kann es gut."],
    talk: { start: "Guten Tag. Wer in Unterorten bleibt, lernt Geduld oder geht." }
  },
  iven: {
    id: "iven", name: "Iven", title: "Händler für Amulette und Ringe", location: "markt",
    text: "Iven poliert einen Ring und sieht euch dabei nicht an.",
    art: "ui/siluette.jpg",  // Platzhalter, eigenes Bild fehlt noch
    shop: ["glutring","nebelamulett","kronenring","ascheohr"], stock: { ascheohr: 3 },
    merchant: true, buys: true, hours: ["morgen","vormittag","mittag","nachmittag","abend"], pin: { x: 68, y: 89 }, faction: "gasse",
    lines: ["Ein Ring sagt mehr als ein Titel."],
    talk: { start: "Ringe, Amulette, Steine. Nichts davon ist billig, alles davon ist echt." }
  },
  jorina: {
    id: "jorina", name: "Jorina", title: "", location: "nebelpfad",
    text: "Jorina geht am Rand des Pfades, wo der Boden fester ist.",
    art: "ui/siluette.jpg",  // Platzhalter, eigenes Bild fehlt noch
    merchant: false, hours: ["morgen","vormittag","mittag","nachmittag","abend"], pin: { x: 48, y: 82 }, faction: "nebel",
    lines: ["Der Nebel trägt Stimmen weit."],
    talk: { start: "Bleibt auf dem Weg. Was daneben liegt, gehört dem Nebel." }
  },
  jorun: {
    id: "jorun", name: "Jorun", title: "Gastwirt", location: "gasthaus",
    text: "Jorun stellt Krüge ab, ohne zu fragen, wer sie bestellt hat.",
    art: "ui/siluette.jpg",  // Platzhalter, eigenes Bild fehlt noch
    shop: ["wein_der_stunde","teichbluete"], stock: { wein_der_stunde: 5, teichbluete: 4 },
    merchant: true, buys: true, hours: ['mittag', 'nachmittag', 'abend', 'nacht'], pin: { x: 42, y: 72 }, faction: "krone",
    lines: ["Ein Platz kostet. Ein guter Platz kostet mehr."],
    talk: { start: "Setzt euch. Wer zahlt, bekommt Wärme und keine Fragen." }
  },
  kraemerin: {
    id: "kraemerin", name: "Krämerin", title: "Händlerin", location: "markt",
    text: "Die Krämerin steht hinter der Bude, als gehöre der Tisch fest zu ihr.",
    art: "ui/siluette.jpg",  // Platzhalter, eigenes Bild fehlt noch
    shop: ["glutphiole","nebeltrank","aschesalbe","wein_der_stunde","teichbluete"], stock: { glutphiole: 4, nebeltrank: 3, aschesalbe: 3, wein_der_stunde: 5, teichbluete: 4 },
    merchant: true, buys: true, hours: ["morgen","vormittag","mittag","nachmittag","abend"], pin: { x: 50, y: 79 }, faction: "gasse",
    lines: ["Salbe, Trank, Nadel. Sagt, was ihr braucht."],
    talk: { start: "Guten Tag. Die Ware ist frisch genug für den Preis, den ich nenne." }
  },
  rorik: {
    id: "rorik", name: "Rorik", title: "Oberster Rat von Unterorten", location: "ratshalle",
    text: "Rorik sitzt nicht am Kopf des Tisches. Er braucht ihn nicht.",
    art: "ui/siluette.jpg",  // Platzhalter, eigenes Bild fehlt noch
    merchant: false, hours: ["morgen","vormittag","mittag","nachmittag","abend"], pin: { x: 10, y: 92 }, faction: "rat",
    lines: ["Entscheidungen brauchen Zeit. Unsere besonders."],
    talk: { start: "Ihr steht in der Ratshalle. Sagt, was ihr wollt, und wartet auf die Antwort." }
  },
  selene: {
    id: "selene", name: "Selene", title: "Frau von Rorik", location: "ratshalle",
    text: "Selene hört zu, bevor Rorik antwortet.",
    art: "ui/siluette.jpg",  // Platzhalter, eigenes Bild fehlt noch
    merchant: false, hours: ["morgen","vormittag","mittag","nachmittag","abend"], pin: { x: 88, y: 97 }, faction: "rat",
    lines: ["Rorik redet. Ich höre."],
    talk: { start: "Willkommen. Mein Mann hat viel zu tun. Ich habe Zeit." }
  },
  sarina: {
    id: "sarina", name: "Sarina", title: "", location: "obsidiansee",
    text: "Sarina sieht ins Wasser, als warte sie auf eine Antwort.",
    art: "ui/siluette.jpg",  // Platzhalter, eigenes Bild fehlt noch
    merchant: false, hours: ['vormittag', 'mittag', 'nachmittag', 'abend', 'nacht'], pin: { x: 15, y: 72 }, faction: "nebel",
    lines: ["Das Wasser zeigt mehr als den Himmel."],
    talk: { start: "Leise. Der See hört zu." }
  },
  kassian: {
    id: "kassian", name: "Kassian", title: "Händler für Waffen und Rüstungen", location: "markt",
    text: "Kassian prüft eine Klinge gegen das Licht.",
    art: "ui/siluette.jpg",  // Platzhalter, eigenes Bild fehlt noch
    shop: ["dorfstahl","aschenklinge","thronnadel","glasdolch","nebelklinge","zweihander","knochenhandschuh","seidenhand","russmantel","samtbrust","pelzmantel","glaspanzer","aschenschild","leder_hose","fangzahn_kampfrock","eisen_beinschienen","wickelstiefel","schnallen_lederstiefel","amethyst_stiefel","hohe_panzerstiefel"],
    merchant: true, buys: true, hours: ["morgen","vormittag","mittag","nachmittag","abend"], pin: { x: 57, y: 92 }, faction: "krone",
    lines: ["Stahl lügt nicht."],
    talk: { start: "Klingen, Panzer, Stiefel. Sagt, wogegen ihr kämpft." }
  }
};

const QUESTS = {
  wolfspfad: {
    id: "wolfspfad", title: "Der Wolf am Nebelpfad", giver: "burgvogt",
    where: "Nebelpfad, danach Markt der Aschenstadt",
    goal: "Tötet den Rußwolf am Nebelpfad und meldet Harn auf dem Markt, dass der Weg wieder frei ist.",
    text: "Harn will den Pfad offen halten. Der Wolf hält Karren und Boten auf, und die Stadt verliert Zoll.",
    reward: { gold: 18, ansehen: 1, bond: { burgvogt: 8 } }
  },
  tamsin_wolf: {
    id: "tamsin_wolf", title: "Tamsins Ruhe", giver: "tamsin",
    where: "Nebelpfad, danach Schenke in Unterorten",
    goal: "Wenn der Rußwolf tot ist, geht zu Tamsin in die Schenke und sagt ihr, dass der Pfad wieder still ist.",
    text: "Tamsin schenkt erst ein, wenn die Leute ohne Angst über den Pfad kommen.",
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
    text: "Aschenstadt trägt Malriks Ordnung offen. Die Tore schließen pünktlich, die Buden zahlen Zoll, und Harn steht dort, wo man einen Vogt erwartet. Die Glocken im Tempel schlagen selten. In den Gassen hinter dem Markt öffnen sich Türen nur für den, der den Preis kennt."
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

const REGIONS = {
  vorstadt: { id: "vorstadt", name: "Vor den Toren", hub: "nebelpfad", map: "maps/vorstadt.jpg", wait: "ui/wait_vorstadt.jpg", idle: "ui/idle_vorstadt.jpg", pins: [
    { id: "nebelpfad", label: "Nebelpfad", x: 50, y: 48 },
    { id: "obsidiansee", label: "Obsidiansee", x: 16, y: 36 },
    { id: "knochenfeld", label: "Knochenfeld", x: 20, y: 74 },
    { id: "platz", label: "Aschenstadt", x: 50, y: 88 },
    { id: "dorfzentrum", label: "Unterorten", x: 80, y: 22 },
    { id: "alter_baum", label: "Düsterwald", x: 84, y: 60 }
  ]},
  stadt: { id: "stadt", name: "Aschenstadt", hub: "platz", map: "maps/stadt.jpg", wait: "ui/wait_stadt.jpg", idle: "ui/idle_stadt.jpg", pins: [
    { id: "platz", label: "Platz", x: 50, y: 48 },
    { id: "burg", label: "Burg", x: 50, y: 14 },
    { id: "tempel", label: "Tempel", x: 80, y: 26 },
    { id: "markt", label: "Markt", x: 42, y: 68 },
    { id: "gassen", label: "Gassen", x: 16, y: 46 },
    { id: "gasthaus", label: "Gasthaus", x: 82, y: 58 },
    { id: "nebelpfad", label: "Vor den Toren", x: 50, y: 90 }
  ]},
  unterorten: { id: "unterorten", name: "Unterorten", hub: "dorfzentrum", map: "maps/unterorten.jpg", wait: "ui/wait_unterorten.jpg", idle: "ui/idle_unterorten.jpg", pins: [
    { id: "dorfzentrum", label: "Dorfzentrum", x: 50, y: 50 },
    { id: "schmied", label: "Schmiede", x: 18, y: 44 },
    { id: "ratshalle", label: "Ratshalle", x: 50, y: 18 },
    { id: "schenke", label: "Schenke", x: 80, y: 56 },
    { id: "nebelpfad", label: "Nebelpfad", x: 50, y: 90 }
  ]},
  duesterwald: { id: "duesterwald", name: "Düsterwald", hub: "alter_baum", back: "Zurück zum Alten Baum", map: "maps/duesterwald.jpg", wait: "ui/wait_duesterwald.jpg", idle: "ui/idle_duesterwald.jpg", pins: [
    { id: "alter_baum", label: "Alter Baum", x: 50, y: 46 },
    { id: "hexenhuette", label: "Hexenhütte", x: 18, y: 32 },
    { id: "blueteich", label: "Blütenteich", x: 80, y: 28 },
    { id: "sumpf", label: "Sumpf", x: 74, y: 70 },
    { id: "nebelpfad", label: "Nebelpfad", x: 50, y: 90 }
  ]}
};

const LOCATIONS = {
  platz: { id: "platz", name: "Platz", region: "stadt", blurb: "Der Brunnen steht in der Mitte. Wer durchs Tor kommt, steht zuerst hier, nicht zwischen den Buden.", art: "locations/aschenstadt.jpg",
    exits: [
      { id: "burg", label: "Burg" },
      { id: "tempel", label: "Tempel" },
      { id: "markt", label: "Markt" },
      { id: "gassen", label: "Gassen" },
      { id: "gasthaus", label: "Gasthaus" },
      { id: "nebelpfad", label: "Vor den Toren" }
    ] },
  burg: { id: "burg", name: "Burg", region: "stadt", blurb: "Mauern über dem Platz. Von hier sieht man die Dächer, und die Dächer sehen einen nicht zurück.", art: "locations/burg.jpg",
    exits: [ { id: "platz", label: "Zum Platz", x: 50, y: 88, arch: true } ] },
  markt: { id: "markt", name: "Markt", region: "stadt", blurb: "Buden stehen in Reihen. Der Zoll hängt an jeder Plane, und Harn sieht, wer bleibt.", art: "locations/markt.jpg",
    stalls: [
      { id: "stand_waffen", label: "Waffen", x: 16, y: 40, shop: ["dorfstahl","aschenklinge","thronnadel","glasdolch","nebelklinge","zweihander"] },
      { id: "stand_ruestung", label: "Rüstung", x: 34, y: 40, shop: ["knochenhandschuh","seidenhand","russmantel","samtbrust","pelzmantel","glaspanzer","aschenschild","leder_hose","fangzahn_kampfrock","eisen_beinschienen","wickelstiefel","schnallen_lederstiefel","amethyst_stiefel","hohe_panzerstiefel"] },
      { id: "stand_traenke", label: "Tränke", x: 64, y: 30, shop: ["glutphiole","waldphiole","kussphiole","spiegeltrank","nebeltrank"], stock: { glutphiole: 5, waldphiole: 4, kussphiole: 4, spiegeltrank: 3, nebeltrank: 3 } },
      { id: "stand_schmuck", label: "Ringe und Amulette", x: 86, y: 30, shop: ["glutring","nebelamulett","kronenring","ascheohr"], stock: { ascheohr: 3 } }
    ],
    exits: [ { id: "platz", label: "Zum Platz", x: 50, y: 88, arch: true } ] },
  tempel: { id: "tempel", name: "Tempel", region: "stadt", blurb: "Die Glocke hängt schwer. Sie schlägt selten, und wenn sie schlägt, wird der Platz still.", art: "locations/tempel.jpg",
    exits: [ { id: "katakomben", label: "Katakomben", x: 17, y: 96, arch: true },  // Torbogen zwischen den vorderen linken Säulen
      { id: "platz", label: "Zum Platz", x: 50, y: 90, arch: true } ] },
  katakomben: { id: "katakomben", name: "Katakomben", region: "stadt", blurb: "Eine Treppe führt unter den Tempel. Hinter dem Gitter liegen Gänge mit Grabnischen und Kerzen.", art: "locations/katakomben.jpg",
    parent: "tempel", pass: "ui/pass_kata.jpg",
    exits: [ { id: "tempel", label: "Zurück zum Tempel" } ] },
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
    exits: [ { id: "platz", label: "Zum Platz", x: 50, y: 88, arch: true } ] },
  nebelpfad: { id: "nebelpfad", name: "Nebelpfad", region: "vorstadt", blurb: "Der Boden ist nass, die Sicht kurz. Der Weg trägt Stadt und Dorf, solange niemand ihn sperrt.", art: "locations/nebelpfad.jpg", wild: true,
    events: [
      { id: "russwolf", when: { flags: { cleared_russwolf: false } }, once: false, priority: 10, run: "startEncounter", arg: "russwolf" }
    ],
    exits: [
      { id: "obsidiansee", label: "Obsidiansee" },
      { id: "knochenfeld", label: "Knochenfeld" },
      { id: "platz", label: "Aschenstadt" },
      { id: "dorfzentrum", label: "Unterorten" },
      { id: "alter_baum", label: "Düsterwald" }
    ] },
  obsidiansee: { id: "obsidiansee", name: "Obsidiansee", region: "vorstadt", blurb: "Das Wasser ist dunkel und still. Der Pfad bleibt hinter dem Schilf.", art: "locations/obsidiansee.jpg",
    exits: [ { id: "nebelpfad", label: "Nebelpfad", x: 50, y: 90, arch: true } ] },
  knochenfeld: { id: "knochenfeld", name: "Knochenfeld", region: "vorstadt", blurb: "Weiße Stücke im Gras. Der Wind kommt vom Pfad und nimmt nichts mit.", art: "locations/knochenfeld.jpg",
    exits: [ { id: "nebelpfad", label: "Nebelpfad", x: 50, y: 90, arch: true } ] },
  dorfzentrum: { id: "dorfzentrum", name: "Dorfzentrum", region: "unterorten", blurb: "Der Brunnen steht in der Mitte. An Tamsins Tür riecht es nach Brot und nassem Holz.", art: "locations/dorfzentrum.jpg", rest: true,
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
  blueteich: { id: "blueteich", name: "Blütenteich", region: "duesterwald", blurb: "Blüten liegen auf dem Wasser. Der Baum bleibt der Weg zurück.", art: "locations/blueteich.jpg",
    exits: [ { id: "alter_baum", label: "Alter Baum", x: 50, y: 90, arch: true } ] },
  sumpf: { id: "sumpf", name: "Sumpf", region: "duesterwald", blurb: "Der Boden gibt nach. Wer weiter will, kehrt besser zum Baum um.", art: "locations/sumpf.jpg",
    exits: [ { id: "alter_baum", label: "Alter Baum", x: 50, y: 90, arch: true } ] }
};

const BASE_HERO = { level: 1, hp: 28, hpMax: 28, atk: 4, def: 2, will: 3, fortune: 4, ansehen: 0, gold: 16, ap: 2, apMax: 2, crit: 4 };

const WOLF_LINES = {
  wolf_spared: "Ihr senkt die Hände und gebt den Pfad frei. Der Wolf weicht in den Nebel zurück und bleibt am Leben.",
  wolf_bargain: "Ihr bietet dem Wolf einen Anteil und wartet. Er schnuppert, nimmt an und räumt die Mitte des Weges.",
  wolf_niederlage: "Ihr liegt am Brunnen, nicht auf dem Pfad. Der Wolf hat euch umgeworfen und ist geblieben. Trinkt, dann entscheidet, ob ihr noch einmal hingeht."
};

window.D = {
  WORLD, FACTIONS, DAY_PHASES, BOND_STEPS, STAT_KEYS,
  HERKUENFTE, FLUECHE, PORTRAITS, ITEMS, SKILLS, MONSTER, NPCs, QUESTS,
  NARRATOR, REGIONS, LOCATIONS, BASE_HERO, WOLF_LINES
};
