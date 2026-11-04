(function (root, factory) {
  const api = factory(root.CCGD_PRICES || (typeof require === "function" ? require("./prices.js") : null));
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CCGD = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (PRICES) {
  const OFFICE = {
    name: "Cleveland County Garage Doors",
    short: "CCGD",
    phone: "704-472-9367",
    phoneTel: "7044729367",
    tagline: "garage doors done right",
    team: "Cleveland County Garage Doors team",
    gmailAccount: "matthewsigmon1998@gmail.com"
  };

  const FAMILY_INDEX = { standard: 0, black: 1, wood: 2 };
  const FAMILY_LABEL = { standard: "Standard color", black: "Black / charcoal", wood: "Woodgrain" };

  function uid(prefix) {
    return (prefix || "id") + "-" + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  }

  function moneyRound(n) {
    const x = Number(n);
    if (!isFinite(x)) return 0;
    return Math.round((x + Number.EPSILON) * 100) / 100;
  }

  function money(n) {
    return moneyRound(n).toLocaleString("en-US", { style: "currency", currency: "USD" });
  }

  function seriesById(id) {
    return PRICES.series.find(function (s) { return s.id === id; }) || PRICES.series[0];
  }

  function modelsFor(seriesId) {
    return PRICES.models.filter(function (m) { return m.series === seriesId; });
  }

  function modelById(id) {
    return PRICES.models.find(function (m) { return m.id === id; }) || null;
  }

  function openerById(id) {
    return PRICES.openers.find(function (o) { return o.id === id; }) || null;
  }

  function parseSize(size) {
    const m = String(size || "").match(/^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)$/i);
    if (!m) return { w: 16, h: 7, ok: false };
    return { w: Number(m[1]), h: Number(m[2]), ok: true };
  }

  function sizeLabel(size) {
    const p = parseSize(size);
    if (!p.ok) return size || "Size";
    return p.w + "×" + p.h;
  }

  function sizesFor(series, wind) {
    const table = (series.prices && (series.prices[wind] || series.prices.none)) || {};
    return Object.keys(table).sort(function (a, b) {
      const pa = parseSize(a);
      const pb = parseSize(b);
      return pa.w - pb.w || pa.h - pb.h;
    });
  }

  function lookupDoorNet(door) {
    const series = seriesById(door.series);
    const wind = series.winds.indexOf(door.wind) >= 0 ? door.wind : series.winds[0];
    const table = series.prices[wind] || series.prices.none || {};
    const cell = table[door.size];
    if (cell == null) return null;
    if (typeof cell === "number") return cell;
    const model = modelById(door.model);
    let family = door.family || "standard";
    if (model && model.families.indexOf(family) < 0) family = model.families[0];
    const idx = FAMILY_INDEX[family] != null ? FAMILY_INDEX[family] : 0;
    const value = cell[idx];
    return value == null ? cell[0] : value;
  }

  function glassRates(door) {
    const model = modelById(door.model);
    if (!model) return { glass: 0, insert: 0 };
    if (door.family === "wood" && model.woodGlass) {
      return { glass: model.woodGlass, insert: model.woodInsert };
    }
    let insert = model.insert;
    if (model.insertByWind && model.insertByWind[door.wind] != null) insert = model.insertByWind[door.wind];
    return { glass: model.glass, insert: insert };
  }

  function heightBand(h) {
    if (h <= 10) return "10";
    if (h <= 12) return "12";
    return "14";
  }

  function trackChoices(door) {
    const series = seriesById(door.series);
    const size = parseSize(door.size);
    const wind = door.wind || "none";
    const tallSchedule = size.h > 8 || series.track === "commercial" || series.track === "commercial-sandwich";
    const highShort = series.track === "sandwich" || wind === "90";
    const choices = [{ id: "std", label: "Standard track (12\" or 15\" radius)", cost: 0 }];

    if (!tallSchedule) {
      const table = highShort ? PRICES.tracksHigh : PRICES.tracksLow;
      choices.push(
        { id: "low7", label: "Low headroom, 7' door", cost: table.low7 },
        { id: "low8", label: "Low headroom, 8' door", cost: table.low8 },
        { id: "radius", label: "20\" or 32\" radius", cost: table.radius },
        { id: "hl24", label: "Hi-lift 24\"", cost: table.hl24 },
        { id: "hl33", label: "Hi-lift 33\"", cost: table.hl33 },
        { id: "hl48", label: "Hi-lift 48\"", cost: table.hl48 },
        { id: "hl54", label: "Hi-lift 54\"", cost: table.hl54 },
        { id: "hl72", label: "Hi-lift 72\"", cost: table.hl72 }
      );
      return choices;
    }

    const band = heightBand(size.h);
    const wide = size.w >= 14;
    const hilift = (series.track === "sandwich" || series.track === "commercial-sandwich")
      ? PRICES.tallHiliftSandwich
      : PRICES.tallHiliftStandard;
    const side = wide ? hilift.wide : hilift.narrow;
    choices.push(
      { id: "angle", label: "Angle mount, " + (band === "10" ? "up to 10' tall" : band + "' tall"), cost: PRICES.tallAngle[band] },
      { id: "lhr", label: "Low headroom, " + (band === "10" ? "up to 10' tall" : band + "' tall"), cost: PRICES.tallLhr[band] },
      { id: "radius", label: "20\" or 32\" radius", cost: 185 },
      { id: "hl33", label: "Hi-lift 0–33\" (" + (wide ? "14–18' wide" : "8–12' wide") + ")", cost: side["33"] },
      { id: "hl54", label: "Hi-lift 34–54\" (" + (wide ? "14–18' wide" : "8–12' wide") + ")", cost: side["54"] },
      { id: "hl72", label: "Hi-lift 55–72\" (" + (wide ? "14–18' wide" : "8–12' wide") + ")", cost: side["72"] },
      { id: "hlcall", label: "Hi-lift 73–120\" or vertical lift — call", cost: null, call: true }
    );
    return choices;
  }

  function blankDoor() {
    return {
      id: uid("door"),
      series: "400",
      model: "420",
      size: "16x7",
      family: "standard",
      color: "White",
      wind: "none",
      spring: "torsion",
      track: "std",
      roofPitch: false,
      lites: 0,
      inserts: 0,
      specialSections: 0,
      lock: false,
      hingeStyle: "flat",
      hinges: 0,
      handles: 0,
      windows: 0,
      windowType: "",
      opener: "",
      rail: "7",
      headOnly: false,
      priceOverride: "",
      notes: ""
    };
  }

  function normalizeDoor(door) {
    const next = Object.assign(blankDoor(), door || {});
    const series = seriesById(next.series);
    next.series = series.id;
    const models = modelsFor(series.id);
    if (!models.some(function (m) { return m.id === next.model; })) next.model = models[0].id;
    const model = modelById(next.model);
    if (model.families.indexOf(next.family) < 0) next.family = model.families[0];
    const names = (series.colors && series.colors[next.family]) || series.colors.standard || ["White"];
    if (names.indexOf(next.color) < 0) next.color = names[0];
    if (series.winds.indexOf(next.wind) < 0) next.wind = series.winds[0];
    const sizes = sizesFor(series, next.wind);
    if (sizes.indexOf(next.size) < 0) next.size = sizes[0] || "16x7";
    const tracks = trackChoices(next);
    if (!tracks.some(function (t) { return t.id === next.track; })) next.track = "std";
    const opener = openerById(next.opener);
    if (next.opener && !opener) next.opener = "";
    if (opener && opener.rails) {
      if (opener.rails[next.rail] == null) next.rail = Object.keys(opener.rails)[0];
    }
    if (series.commercial) {
      const wins = series.windows || [];
      if (!wins.some(function (w) { return w.id === next.windowType; })) next.windowType = wins[0] ? wins[0].id : "";
    }
    next.lites = clampCount(next.lites);
    next.inserts = clampCount(next.inserts);
    next.specialSections = clampCount(next.specialSections);
    next.hinges = clampCount(next.hinges);
    next.handles = clampCount(next.handles);
    next.windows = clampCount(next.windows);
    next.roofPitch = !!next.roofPitch;
    next.lock = !!next.lock;
    next.headOnly = !!next.headOnly;
    return next;
  }

  function clampCount(n) {
    const x = Math.round(Number(n) || 0);
    if (x < 0) return 0;
    if (x > 80) return 80;
    return x;
  }

  function blankAdder() {
    return { id: uid("add"), label: "", cost: 0 };
  }

  function line(label, cost, extra) {
    return Object.assign({ label: label, cost: moneyRound(cost), missing: false, included: false, note: "" }, extra || {});
  }

  function buildCostLines(quote) {
    const lines = [];
    const warnings = [];
    const doors = (quote.doors || []).map(normalizeDoor);
    doors.forEach(function (door, index) {
      const series = seriesById(door.series);
      const n = index + 1;
      const head = "Door " + n + " — " + sizeLabel(door.size) + " " + series.name + " " + door.model + ", " + door.color;
      const windLabel = door.wind === "90" ? "90 mph windload" : "no windload";
      const springLabel = door.spring === "extension" ? "extension springs" : "torsion springs";
      let net = null;
      let missing = false;
      const overrideRaw = door.priceOverride;
      const hasOverride = overrideRaw !== "" && overrideRaw != null && isFinite(Number(overrideRaw));
      if (hasOverride) {
        net = Number(overrideRaw);
      } else {
        net = lookupDoorNet(door);
        if (net == null) missing = true;
      }
      if (missing) {
        warnings.push("Door " + n + " has no book price for this size and wind load. Enter a net or pick another size.");
        lines.push(line(head + " — price needed", 0, { missing: true, door: n }));
      } else {
        const note = hasOverride ? "Net override" : "Book net";
        lines.push(line(head + ", " + windLabel + ", " + springLabel, net, { note: note, door: n }));
      }
      if (door.spring === "extension") {
        lines.push(line("Extension springs — door " + n, -PRICES.extensionCredit, { note: "Deduct from torsion price", door: n }));
      }
      const choice = trackChoices(door).find(function (t) { return t.id === door.track; }) || trackChoices(door)[0];
      if (choice.call || choice.cost == null) {
        warnings.push("Door " + n + " track is call-for-quote. Enter it as an adder.");
        lines.push(line(choice.label + " — door " + n, 0, { missing: true, door: n }));
      } else if (choice.cost) {
        lines.push(line(choice.label + " — door " + n, choice.cost, { door: n }));
      }
      if (door.roofPitch) {
        lines.push(line("Roof pitch 4/12–12/12 — door " + n, PRICES.roofPitch, {
          note: PRICES.roofPitchNote,
          door: n
        }));
      }
      if (!series.commercial) {
        const rates = glassRates(door);
        if (door.lites > 0) {
          lines.push(line(door.lites + " glass lite" + (door.lites === 1 ? "" : "s") + " — door " + n, door.lites * rates.glass, { door: n }));
        }
        if (door.inserts > 0) {
          lines.push(line(door.inserts + " window insert" + (door.inserts === 1 ? "" : "s") + " — door " + n, door.inserts * rates.insert, { door: n }));
        }
        if (door.specialSections > 0) {
          lines.push(line("Special window placement, " + door.specialSections + " section" + (door.specialSections === 1 ? "" : "s") + " — door " + n, door.specialSections * PRICES.specialWindowSection, { door: n }));
        }
      } else if (door.windows > 0) {
        const win = (series.windows || []).find(function (w) { return w.id === door.windowType; });
        if (win) lines.push(line(door.windows + " × " + win.label + " — door " + n, door.windows * win.price, { door: n }));
      }
      if (door.lock) lines.push(line("Lock — door " + n, PRICES.lock, { door: n }));
      const hingePrice = door.hingeStyle === "magnetic" ? PRICES.hardware.magneticHinge : PRICES.hardware.flatHinge;
      const handlePrice = door.hingeStyle === "magnetic" ? PRICES.hardware.magneticHandle : PRICES.hardware.flatHandle;
      if (door.hinges > 0) {
        lines.push(line(door.hinges + " " + (door.hingeStyle === "magnetic" ? "magnetic" : "flat cast") + " hinge" + (door.hinges === 1 ? "" : "s") + " — door " + n, door.hinges * hingePrice, { door: n }));
      }
      if (door.handles > 0) {
        lines.push(line(door.handles + " decorative handle" + (door.handles === 1 ? "" : "s") + " — door " + n, door.handles * handlePrice, { door: n }));
      }
      if (door.opener) {
        const opener = openerById(door.opener);
        if (!opener) {
          warnings.push("Door " + n + " opener is not on the sheet.");
          lines.push(line("Opener — door " + n, 0, { missing: true, door: n }));
        } else if (opener.price != null) {
          lines.push(line(opener.name + " — " + opener.detail + " — door " + n, opener.price, { door: n }));
        } else {
          const railPrice = opener.rails[door.rail];
          if (railPrice == null) {
            warnings.push("Door " + n + " needs a rail length.");
            lines.push(line(opener.name + " — door " + n, 0, { missing: true, door: n }));
          } else {
            let cost = railPrice;
            let label = opener.name + " with " + door.rail + "' rail — door " + n;
            if (door.headOnly) {
              cost = moneyRound(cost - (opener.headOnlyDeduct || 15));
              label = opener.name + ", head only (no rail) — door " + n;
            }
            lines.push(line(label, cost, { note: opener.detail, door: n }));
          }
        }
        if (series.bracket) {
          lines.push(line("3000 series operator bracket — door " + n, PRICES.operatorBracket, {
            note: "Required with a motor. Strut the top section.",
            door: n
          }));
        }
      }
      if (door.notes) {
        lines.push(line(door.notes, 0, { textOnly: true, note: "Door note", door: n }));
      }
    });

    (quote.adders || []).forEach(function (adder) {
      const label = (adder.label || "").trim();
      if (!label) return;
      lines.push(line(label, Number(adder.cost) || 0, { note: "Adder" }));
    });

    const doorCount = doors.length || 0;
    if (quote.installed !== false && doorCount) {
      const labor = Number(quote.laborPerDoor);
      const haul = Number(quote.haulPerDoor);
      lines.push(line(doorCount > 1 ? "Installation — " + doorCount + " doors" : "Installation", (isFinite(labor) ? labor : 0) * doorCount, { note: "Labor" }));
      lines.push(line(doorCount > 1 ? "Haul-away — " + doorCount + " doors" : "Haul-away of existing door", (isFinite(haul) ? haul : 0) * doorCount, { note: "Haul-away" }));
      lines.push(line("1-year workmanship warranty", 0, { included: true, note: "Included on installed jobs" }));
    }

    return { lines: lines, warnings: warnings, doors: doors };
  }

  function quoteError(quote) {
    const gm = Number(quote.gm);
    const discount = Number(quote.discount);
    if (!isFinite(gm) || gm < 0 || gm >= 100) return "Margin must be from 0% up to, but not including, 100%.";
    if (!isFinite(discount) || discount < 0 || discount > 100) return "Discount must be from 0% to 100%.";
    return "";
  }

  function allocate(lines, subtotal) {
    const billable = lines.filter(function (l) {
      return !l.missing && !l.textOnly && !(l.included && l.cost === 0);
    });
    const base = billable.reduce(function (sum, l) { return sum + l.cost; }, 0);
    const sells = new Map();
    let running = 0;
    billable.forEach(function (l, i) {
      let sell;
      if (i === billable.length - 1) sell = moneyRound(subtotal - running);
      else {
        sell = base ? moneyRound(subtotal * (l.cost / base)) : 0;
        running = moneyRound(running + sell);
      }
      sells.set(l, sell);
    });
    return lines.map(function (l) {
      if (l.textOnly) return Object.assign({}, l, { sell: 0, display: "" });
      if (l.missing) return Object.assign({}, l, { sell: 0, display: "Needs price" });
      if (l.included && l.cost === 0) return Object.assign({}, l, { sell: 0, display: "Included" });
      const sell = sells.get(l) || 0;
      return Object.assign({}, l, { sell: sell, display: money(sell) });
    });
  }

  function buildQuote(quote) {
    const built = buildCostLines(quote || {});
    const error = quoteError(quote || {});
    const incomplete = built.lines.some(function (l) { return l.missing; });
    const cost = moneyRound(built.lines.reduce(function (sum, l) {
      return l.missing ? sum : sum + l.cost;
    }, 0));
    let subtotal = 0;
    let discountAmt = 0;
    let sell = 0;
    if (!error && !incomplete) {
      const gm = Number(quote.gm);
      const discount = Number(quote.discount);
      const marked = cost / (1 - gm / 100);
      subtotal = moneyRound(marked);
      sell = moneyRound(marked * (1 - discount / 100));
      discountAmt = moneyRound(subtotal - sell);
    }
    const customerLines = (!error && !incomplete) ? allocate(built.lines, subtotal) : built.lines.map(function (l) {
      let display = "—";
      if (l.textOnly) display = "";
      else if (l.missing) display = "Needs price";
      else if (l.included && l.cost === 0) display = "Included";
      return Object.assign({}, l, { sell: 0, display: display });
    });
    return {
      lines: built.lines,
      customerLines: customerLines,
      warnings: built.warnings,
      doors: built.doors,
      cost: cost,
      subtotal: subtotal,
      discountAmt: discountAmt,
      sell: sell,
      error: error,
      incomplete: incomplete,
      installed: quote.installed !== false
    };
  }

  function formatDate(ts) {
    const d = ts ? new Date(ts) : new Date();
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }

  function customerPlainText(quote) {
    const built = buildQuote(quote);
    const c = quote.customer || {};
    const rows = [];
    rows.push(OFFICE.name);
    rows.push(OFFICE.tagline);
    rows.push("Office: " + OFFICE.phone);
    rows.push("");
    rows.push("Quote: " + (quote.number || "Draft"));
    rows.push("Date: " + formatDate(quote.createdAt));
    rows.push("");
    rows.push("Prepared for:");
    rows.push(c.name || "Customer");
    if (c.phone) rows.push(c.phone);
    if (c.email) rows.push(c.email);
    const place = [c.address, c.city].filter(Boolean).join(", ");
    if (place) rows.push(place);
    rows.push("");
    rows.push(built.installed ? "Complete installed quote" : "Parts quote");
    rows.push("Installation, haul-away, and a 1-year workmanship warranty are included on complete installed jobs.");
    rows.push("");
    built.customerLines.forEach(function (l) {
      if (!l.display) {
        rows.push("• " + l.label);
        return;
      }
      rows.push("• " + l.label + " — " + l.display);
    });
    if (c.notes) {
      rows.push("");
      rows.push("Notes: " + c.notes);
    }
    rows.push("");
    if (built.error) {
      rows.push("Total: pending. " + built.error);
    } else if (built.incomplete) {
      rows.push("Total: pending — a price is still missing.");
    } else {
      if (Number(quote.discount) > 0) {
        rows.push("Subtotal: " + money(built.subtotal));
        rows.push("Discount (" + quote.discount + "%): −" + money(built.discountAmt));
      }
      rows.push("Installed total: " + money(built.sell));
    }
    rows.push("");
    rows.push("CONFIRM — Accept this quote, then call " + OFFICE.name + " at " + OFFICE.phone + " to make a deposit.");
    rows.push("DECLINE — Decline this quote. Call the office at " + OFFICE.phone + " with any questions.");
    rows.push("");
    rows.push("Call " + OFFICE.name + " at " + OFFICE.phone + " to make a deposit.");
    rows.push("");
    rows.push(OFFICE.team);
    if (quote.decision === "confirmed") {
      rows.push("");
      rows.push("Marked confirmed. Call " + OFFICE.phone + " to make a deposit.");
    } else if (quote.decision === "declined") {
      rows.push("");
      rows.push("Marked declined.");
    }
    return rows.join("\n");
  }

  function gmailSubject(quote) {
    const who = (quote.customer && quote.customer.name) ? quote.customer.name + " — " : "";
    return "Quote " + (quote.number || "CCGD") + " — " + who + OFFICE.name;
  }

  function gmailUrl(quote) {
    const to = ((quote.customer && quote.customer.email) || "").trim();
    const subject = gmailSubject(quote);
    const body = customerPlainText(quote);
    return "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(to)
      + "&su=" + encodeURIComponent(subject)
      + "&body=" + encodeURIComponent(body);
  }

  function smsHref(quote) {
    const phone = ((quote.customer && quote.customer.phone) || "").replace(/[^\d+]/g, "");
    const body = encodeURIComponent(customerPlainText(quote));
    const ios = typeof navigator !== "undefined" && /iPad|iPhone|iPod/i.test(navigator.userAgent || "");
    if (ios) return "sms:" + phone + "&body=" + body;
    return "sms:" + phone + "?body=" + body;
  }

  function defaultRates() {
    return { gm: 42, discount: 0, laborPerDoor: 285, haulPerDoor: 75 };
  }

  return {
    OFFICE: OFFICE,
    PRICES: PRICES,
    FAMILY_LABEL: FAMILY_LABEL,
    uid: uid,
    money: money,
    moneyRound: moneyRound,
    seriesById: seriesById,
    modelsFor: modelsFor,
    modelById: modelById,
    openerById: openerById,
    parseSize: parseSize,
    sizeLabel: sizeLabel,
    sizesFor: sizesFor,
    lookupDoorNet: lookupDoorNet,
    glassRates: glassRates,
    trackChoices: trackChoices,
    blankDoor: blankDoor,
    normalizeDoor: normalizeDoor,
    blankAdder: blankAdder,
    buildQuote: buildQuote,
    customerPlainText: customerPlainText,
    gmailSubject: gmailSubject,
    gmailUrl: gmailUrl,
    smsHref: smsHref,
    formatDate: formatDate,
    defaultRates: defaultRates
  };
});
