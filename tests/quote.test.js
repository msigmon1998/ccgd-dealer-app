const assert = require("assert");
const PRICES = require("../js/prices.js");
const CCGD = require("../js/calc.js");
const PDF = require("../js/pdf.js");
const STORE = require("../js/store.js");

function quote(overrides) {
  const door = Object.assign(CCGD.blankDoor(), {
    series: "400",
    model: "420",
    size: "16x7",
    family: "black",
    color: "Black",
    wind: "none",
    spring: "torsion",
    track: "std",
    roofPitch: false,
    opener: ""
  });
  return Object.assign({
    number: "CCGD-20261104-0001",
    createdAt: Date.UTC(2026, 10, 4),
    customer: { name: "Jane Doe", phone: "704-555-0199", email: "jane@example.com", address: "10 Main", city: "Shelby, NC", notes: "" },
    gm: 42,
    discount: 0,
    laborPerDoor: 0,
    haulPerDoor: 0,
    installed: false,
    adders: [],
    doors: [door],
    decision: ""
  }, overrides);
}

assert.strictEqual(CCGD.lookupDoorNet({ series: "400", model: "420", size: "16x7", family: "black", wind: "none" }), 736);
assert.strictEqual(CCGD.lookupDoorNet({ series: "400", model: "420", size: "16x7", family: "standard", wind: "none" }), 705);
assert.strictEqual(CCGD.lookupDoorNet({ series: "400", model: "420", size: "16x7", family: "wood", wind: "none" }), 962);
assert.strictEqual(CCGD.lookupDoorNet({ series: "500", model: "510", size: "16x7", family: "standard", wind: "none" }), 681);
assert.strictEqual(CCGD.lookupDoorNet({ series: "3000", model: "3620", size: "16x7", family: "standard", wind: "none" }), 1174);
assert.strictEqual(CCGD.lookupDoorNet({ series: "400", model: "420", size: "16x8", family: "wood", wind: "90" }), 1004);

const low = CCGD.trackChoices({ series: "400", wind: "none", size: "16x7" });
assert.strictEqual(low.find((t) => t.id === "low7").cost, 95);
assert.strictEqual(low.find((t) => t.id === "low8").cost, 125);
assert.strictEqual(low.find((t) => t.id === "radius").cost, 185);
assert.strictEqual(low.find((t) => t.id === "hl24").cost, 100);
assert.strictEqual(low.find((t) => t.id === "hl72").cost, 215);
const high = CCGD.trackChoices({ series: "400", wind: "90", size: "16x7" });
assert.strictEqual(high.find((t) => t.id === "hl24").cost, 125);
const sandwich = CCGD.trackChoices({ series: "3000", wind: "none", size: "16x7" });
assert.strictEqual(sandwich.find((t) => t.id === "hl24").cost, 125);

const rates = CCGD.glassRates({ model: "420", family: "standard", wind: "none" });
assert.strictEqual(rates.glass, 40);
assert.strictEqual(rates.insert, 16);
assert.strictEqual(CCGD.glassRates({ model: "410", family: "standard", wind: "none" }).glass, 21);
assert.strictEqual(CCGD.glassRates({ model: "420", family: "wood", wind: "none" }).glass, 60);
assert.strictEqual(CCGD.glassRates({ model: "431", family: "standard", wind: "none" }).insert, 20);
assert.strictEqual(CCGD.glassRates({ model: "431", family: "standard", wind: "90" }).insert, 16);

const base = quote();
let built = CCGD.buildQuote(base);
assert.strictEqual(built.cost, 736);
assert.strictEqual(built.sell, CCGD.moneyRound(736 / 0.58));

const ext = quote();
ext.doors[0].spring = "extension";
ext.doors[0].track = "low7";
ext.doors[0].roofPitch = true;
built = CCGD.buildQuote(ext);
assert.strictEqual(built.cost, CCGD.moneyRound(736 - 8 + 95 + 50));

const glassDoor = quote();
glassDoor.doors[0].family = "standard";
glassDoor.doors[0].lites = 4;
glassDoor.doors[0].inserts = 2;
built = CCGD.buildQuote(glassDoor);
assert.strictEqual(built.cost, 705 + 4 * 40 + 2 * 16);

const motor = quote();
motor.doors[0].series = "3000";
motor.doors[0].model = "3620";
motor.doors[0].family = "standard";
motor.doors[0].color = "White";
motor.doors[0].opener = "2220L";
motor.doors[0].rail = "7";
built = CCGD.buildQuote(motor);
assert.strictEqual(built.cost, 1174 + 308 + 15);
motor.doors[0].headOnly = true;
built = CCGD.buildQuote(motor);
assert.strictEqual(built.cost, 1174 + 293 + 15);

const priced = quote({ gm: 42, discount: 10, laborPerDoor: 100, haulPerDoor: 0, installed: true });
built = CCGD.buildQuote(priced);
const marked = 836 / 0.58;
assert.strictEqual(built.subtotal, CCGD.moneyRound(marked));
assert.strictEqual(built.sell, CCGD.moneyRound(marked * 0.9));
const lineSum = built.customerLines.reduce((sum, line) => sum + line.sell, 0);
assert.strictEqual(CCGD.moneyRound(lineSum), built.subtotal);
assert.ok(built.customerLines.some((line) => /warranty/i.test(line.label) && line.display === "Included"));

const bad = quote({ gm: 100 });
assert.ok(CCGD.buildQuote(bad).error);

const text = CCGD.customerPlainText(priced);
assert.ok(text.includes("CONFIRM"));
assert.ok(text.includes("DECLINE"));
assert.ok(text.includes("704-472-9367"));
assert.ok(/deposit/i.test(text));
assert.ok(text.includes("Cleveland County Garage Doors team"));
assert.ok(!/Matthew Sigmon/i.test(text));
assert.ok(text.includes("jane@example.com"));
assert.ok(text.includes(CCGD.money(CCGD.buildQuote(priced).sell)));

const url = CCGD.gmailUrl(priced);
assert.ok(url.startsWith("https://mail.google.com/mail/?view=cm&fs=1&to="));
assert.ok(url.includes("&su="));
assert.ok(url.includes("&body="));
const body = decodeURIComponent(url.split("&body=")[1]);
assert.strictEqual(body, text);
assert.ok(url.includes(encodeURIComponent("jane@example.com")));

const sms = CCGD.smsHref(priced);
assert.ok(sms.startsWith("sms:"));
assert.ok(sms.includes("body="));

const pdf = PDF.buildPdfString(priced);
assert.ok(pdf.startsWith("%PDF-1.4"));
assert.ok(pdf.includes("704-472-9367"));
assert.ok(pdf.includes("CONFIRM"));
assert.ok(pdf.includes("DECLINE"));
assert.ok(pdf.includes("Cleveland County Garage Doors team"));
assert.ok(!pdf.includes("Matthew"));
const xrefAt = pdf.indexOf("\nxref\n");
const start = Number(pdf.match(/startxref\n(\d+)/)[1]);
assert.strictEqual(start, xrefAt + 1);

const memory = {
  map: new Map(),
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null; },
  setItem(k, v) { this.map.set(k, String(v)); }
};
assert.strictEqual(STORE.STORAGE_KEY, "ccgd-dealer-quotes-v2");
const loadedEmpty = STORE.loadStore(memory);
const number = STORE.nextQuoteNumber(loadedEmpty.data, new Date(2026, 10, 4));
assert.strictEqual(number, "CCGD-20261104-0001");
assert.strictEqual(STORE.nextQuoteNumber(loadedEmpty.data, new Date(2026, 10, 4)), "CCGD-20261104-0002");
loadedEmpty.data.quotes.push({ id: "1", number });
assert.strictEqual(STORE.saveStore(memory, loadedEmpty.data).ok, true);
const again = STORE.loadStore(memory);
assert.strictEqual(again.data.quotes[0].number, "CCGD-20261104-0001");
memory.setItem(STORE.STORAGE_KEY, "{");
const broken = STORE.loadStore(memory);
assert.strictEqual(broken.ok, false);
assert.strictEqual(broken.preserve, true);
const denied = {
  getItem() { const e = new Error("blocked"); e.name = "SecurityError"; throw e; },
  setItem() { const e = new Error("blocked"); e.name = "SecurityError"; throw e; }
};
assert.ok(/SecurityError/.test(STORE.loadStore(denied).error));
assert.ok(/SecurityError/.test(STORE.saveStore(denied, STORE.emptyStore()).error));

assert.strictEqual(PRICES.extensionCredit, 8);
assert.strictEqual(PRICES.operatorBracket, 15);
assert.strictEqual(PRICES.roofPitch, 50);
assert.strictEqual(PRICES.openers.find((o) => o.id === "2420L").rails["8"], 415);
assert.strictEqual(PRICES.openers.find((o) => o.id === "ATSW").rails["14"], 739);
assert.strictEqual(PRICES.openers.find((o) => o.id === "98032").price, 863);

console.log("quote tests passed");
