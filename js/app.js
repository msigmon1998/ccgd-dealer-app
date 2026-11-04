(function () {
  const C = window.CCGD;
  const STORE = window.CCGD_STORE;
  const PDF = window.CCGD_PDF;
  const STATUS = {
    not_ordered: "Not ordered",
    awaiting_customer: "Awaiting customer",
    warehouse_confirmed: "Warehouse confirmed"
  };

  const state = {
    tab: "quote",
    store: STORE.emptyStore(),
    activeId: null,
    search: "",
    saveStatus: "saved",
    saveError: "",
    storageError: "",
    blockSave: false,
    savedAt: 0,
    bookSeries: "400",
    bookWind: "none",
    bookQuery: "",
    bookSection: "doors",
    estimate: null,
    cal: { year: new Date().getFullYear(), month: new Date().getMonth() },
    openDoor: 0,
    pdfUrl: ""
  };
  let saveTimer = null;
  let doorTimer = null;
  let leafAnims = [];

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function active() {
    return state.store.quotes.find(function (q) { return q.id === state.activeId; }) || null;
  }

  function setPath(obj, path, value) {
    const parts = path.split(".");
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
    cur[parts[parts.length - 1]] = value;
  }

  function probeStorage() {
    try {
      const key = STORE.STORAGE_KEY + "-probe";
      localStorage.setItem(key, "1");
      localStorage.removeItem(key);
      return "";
    } catch (error) {
      return STORE.storageErrorMessage(error);
    }
  }

  function boot() {
    const probe = probeStorage();
    if (probe) {
      state.storageError = probe;
      state.blockSave = true;
    } else {
      const loaded = STORE.loadStore(localStorage);
      state.store = loaded.data;
      state.storageError = loaded.error || "";
      state.blockSave = !!loaded.preserve;
    }
    if (!state.estimate) state.estimate = freshEstimate();
    state.store.quotes.forEach(normalizeStoredQuote);
    if (state.store.quotes[0]) state.activeId = state.store.quotes[0].id;
    document.addEventListener("click", onClick);
    document.addEventListener("input", onField);
    document.addEventListener("change", onField);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeModal();
    });
    window.addEventListener("pagehide", saveNow);
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") saveNow();
    });
    const skip = /(?:^|[?&])skipintro=1(?:&|$)/.test(location.search);
    let reduceMotion = false;
    try { reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (error) { reduceMotion = false; }
    if (skip || reduceMotion) enterApp();
    else initIntro();
  }

  function initIntro() {
    const intro = document.getElementById("intro");
    intro.hidden = false;
    intro.classList.remove("is-open");
    buildLeaves();
    intro.onclick = function () { openDoor(); };
    intro.onkeydown = function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDoor();
      }
    };
  }

  function openDoor() {
    const intro = document.getElementById("intro");
    if (!intro || intro.hidden) return;
    if (intro.classList.contains("is-open")) {
      enterApp();
      return;
    }
    intro.classList.add("is-open");
    document.getElementById("app").hidden = false;
    if (!document.getElementById("view").childElementCount) render();
    if (doorTimer) clearTimeout(doorTimer);
    doorTimer = setTimeout(enterApp, 3800);
  }

  function enterApp() {
    if (doorTimer) {
      clearTimeout(doorTimer);
      doorTimer = null;
    }
    const intro = document.getElementById("intro");
    intro.hidden = true;
    intro.classList.remove("is-open");
    document.getElementById("app").hidden = false;
    if (!document.getElementById("view").childElementCount) render();
  }

  function buildLeaves() {
    const layer = document.getElementById("leaf-layer");
    if (!layer || layer.childElementCount) {
      startLeafMotion();
      return;
    }
    const colors = ["#e07b1f", "#c0392b", "#d4a017", "#7b1e2b", "#8a5a2b", "#f0a030", "#a8371c", "#e8c040", "#5e2a1a", "#d9622b"];
    const paths = [
      "M12 2C6 6 4 12 6 18c2 3 4 4 6 4s4-1 6-4c2-6 0-12-6-16z",
      "M12 1l2.5 5 4.5-2-1.5 5 5 1-4 3.5 2 4.5-5-1.5L13 21h-2l-2.5-4.5-5 1.5 2-4.5-4-3.5 5-1L5 4l4.5 2z",
      "M12 1l1.8 4.2 3.2-1.4-.8 4 4.3-.6-2.3 3.4 3.3 2-4.2 1 .9 3.2-3.6-1.6L13 19h-2l-.6-4.8-3.6 1.6.9-3.2-4.2-1 3.3-2-2.3-3.4 4.3.6-.8-4 3.2 1.4z"
    ];
    let seed = 20261103;
    const rnd = function () {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    let html = "";
    for (let i = 0; i < 54; i++) {
      const leaf = {
        x: Math.round(((i * 37) % 100) * 0.96 + rnd() * 4),
        size: Math.round(12 + rnd() * 26),
        delay: i % 3 === 0 ? 0 : Math.round(rnd() * 1800),
        dur: Math.round(3600 + rnd() * 3400),
        rot: Math.round(rnd() * 360 - 180),
        color: colors[i % colors.length],
        shape: i % 3
      };
      const path = leaf.shape === 1 ? paths[0] : leaf.shape === 2 ? paths[1] : paths[2];
      html += "<div class=\"leaf\" data-delay=\"" + leaf.delay + "\" data-dur=\"" + leaf.dur + "\" data-rot=\"" + leaf.rot + "\" style=\"left:" + leaf.x + "%;width:" + leaf.size + "px;height:" + leaf.size + "px\">"
        + "<svg viewBox=\"0 0 24 24\" width=\"100%\" height=\"100%\"><path d=\"" + path + "\" fill=\"" + leaf.color + "\"></path><path d=\"M12 6v17\" stroke=\"rgba(60,24,12,0.55)\" stroke-width=\"1\" fill=\"none\"></path></svg></div>";
    }
    layer.innerHTML = html;
    startLeafMotion();
  }

  function startLeafMotion() {
    leafAnims.forEach(function (anim) {
      try { anim.cancel(); } catch (error) { /* ignore */ }
    });
    leafAnims = [];
    const hint = document.getElementById("tap-hint");
    if (hint && typeof hint.animate === "function") {
      try {
        leafAnims.push(hint.animate(
          [{ transform: "scale(1)" }, { transform: "scale(1.035)" }, { transform: "scale(1)" }],
          { duration: 1600, iterations: Infinity, easing: "ease-in-out" }
        ));
      } catch (error) { /* ignore */ }
    }
    document.querySelectorAll("#leaf-layer .leaf").forEach(function (el, i) {
      if (typeof el.animate !== "function") return;
      const rot = Number(el.dataset.rot) || 0;
      const dir = i % 2 === 0 ? 1 : -1;
      const drift = dir * (30 + ((i * 13) % 60));
      const spin = dir * (300 + ((i * 47) % 420));
      const at = function (x, y, r, o, offset) {
        return { transform: "translate3d(" + x + "px, " + y + ", 0) rotate(" + r + "deg)", opacity: o, offset: offset };
      };
      try {
        leafAnims.push(el.animate([
          at(0, "-14vh", rot, 0, 0),
          at(drift * 0.3, "6vh", rot + spin * 0.1, 1, 0.1),
          at(drift, "50vh", rot + spin * 0.55, 1, 0.55),
          at(-drift / 2, "98vh", rot + spin * 0.9, 1, 0.9),
          at(-drift / 2, "112vh", rot + spin, 0, 1)
        ], {
          duration: Number(el.dataset.dur) || 4800,
          delay: Number(el.dataset.delay) || 0,
          easing: "linear",
          fill: "both",
          iterations: Infinity
        }));
      } catch (error) { /* ignore */ }
    });
  }

  function normalizeStoredQuote(quote) {
    quote.customer = Object.assign({ name: "", phone: "", email: "", address: "", city: "", notes: "" }, quote.customer || {});
    quote.doors = (quote.doors && quote.doors.length ? quote.doors : [C.blankDoor()]).map(function (door) { return C.normalizeDoor(door); });
    quote.adders = Array.isArray(quote.adders) ? quote.adders : [];
    quote.schedule = Object.assign({ status: "not_ordered", date: "", window: "", notes: "" }, quote.schedule || {});
    if (!STATUS[quote.schedule.status]) quote.schedule.status = "not_ordered";
    if (quote.installed == null) quote.installed = true;
    if (quote.gm == null) quote.gm = 42;
    if (quote.discount == null) quote.discount = 0;
    if (quote.laborPerDoor == null) quote.laborPerDoor = 285;
    if (quote.haulPerDoor == null) quote.haulPerDoor = 75;
  }

  function freshEstimate() {
    const rates = state.store.defaults || C.defaultRates();
    return {
      door: C.blankDoor(),
      gm: rates.gm,
      discount: rates.discount,
      laborPerDoor: rates.laborPerDoor,
      haulPerDoor: rates.haulPerDoor,
      installed: true
    };
  }

  function createQuote(seed) {
    const rates = (seed && seed.rates) || state.store.defaults || C.defaultRates();
    const quote = {
      id: C.uid("q"),
      number: STORE.nextQuoteNumber(state.store),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      customer: { name: "", phone: "", email: "", address: "", city: "", notes: "" },
      gm: Number(rates.gm),
      discount: Number(rates.discount),
      laborPerDoor: Number(rates.laborPerDoor),
      haulPerDoor: Number(rates.haulPerDoor),
      installed: seed && seed.installed != null ? !!seed.installed : true,
      adders: [],
      doors: [C.normalizeDoor((seed && seed.door) || C.blankDoor())],
      schedule: { status: "not_ordered", date: "", window: "", notes: "" },
      decision: "",
      decisionAt: null
    };
    state.store.quotes.unshift(quote);
    state.activeId = quote.id;
    state.openDoor = 0;
    saveNow();
    return quote;
  }

  function scheduleSave() {
    if (state.blockSave) {
      state.saveStatus = "error";
      state.saveError = state.storageError;
      paintSaveStatus();
      return;
    }
    state.saveStatus = "saving";
    paintSaveStatus();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 400);
  }

  function saveNow() {
    clearTimeout(saveTimer);
    saveTimer = null;
    if (state.blockSave) {
      state.saveStatus = "error";
      state.saveError = state.storageError || "Quotes cannot be saved in this browser.";
      paintSaveStatus();
      paintStorageBanner();
      return;
    }
    const result = STORE.saveStore(localStorage, state.store);
    if (!result.ok) {
      state.saveStatus = "error";
      state.saveError = result.error;
      state.storageError = result.error;
    } else {
      state.saveStatus = "saved";
      state.saveError = "";
      state.storageError = "";
      state.savedAt = Date.now();
    }
    paintSaveStatus();
    paintStorageBanner();
  }

  function paintSaveStatus() {
    const nodes = document.querySelectorAll("[data-save-status]");
    nodes.forEach(function (node) {
      node.classList.toggle("error", state.saveStatus === "error");
      if (state.saveStatus === "saving") node.textContent = "Saving…";
      else if (state.saveStatus === "error") node.textContent = state.saveError || "Not saved";
      else node.textContent = state.savedAt ? "Saved on this phone" : "Ready";
    });
  }

  function paintStorageBanner() {
    const banner = document.getElementById("storage-banner");
    if (!banner) return;
    if (!state.storageError) {
      banner.hidden = true;
      banner.innerHTML = "";
      return;
    }
    banner.hidden = false;
    banner.innerHTML = "<strong>Quotes are not staying on this phone.</strong> " + esc(state.storageError)
      + (state.blockSave ? " <button type=\"button\" class=\"btn btn-small\" data-action=\"reset-storage\">Overwrite the unreadable save</button>" : "");
  }

  function parkSheet() {
    const sheet = document.getElementById("quote-sheet");
    const modal = document.getElementById("modal");
    if (!sheet || !modal) return;
    if (sheet.parentElement !== document.body) document.body.insertBefore(sheet, modal);
    sheet.classList.remove("is-visible");
  }

  function render() {
    parkSheet();
    const view = document.getElementById("view");
    document.querySelectorAll(".tabs button").forEach(function (button) {
      button.setAttribute("aria-current", button.dataset.tab === state.tab ? "page" : "false");
    });
    if (state.tab === "quote") renderQuote(view);
    else if (state.tab === "book") renderBook(view);
    else if (state.tab === "estimate") renderEstimate(view);
    else if (state.tab === "schedule") renderSchedule(view);
    else renderSend(view);
    paintStorageBanner();
    paintSaveStatus();
    syncSheet();
  }

  function renderQuote(view) {
    view.innerHTML = ""
      + "<div class=\"stack\">"
      + "<label class=\"search field\"><span>Search saved quotes</span><input id=\"quote-search\" type=\"search\" placeholder=\"Quote #, customer name, or phone\" autocomplete=\"off\" value=\"" + esc(state.search) + "\"></label>"
      + "<div class=\"row\"><button type=\"button\" class=\"btn btn-primary\" data-action=\"new-quote\">New quote</button><span class=\"fine\" data-save-status></span></div>"
      + "<div id=\"quote-list\" class=\"list\"></div>"
      + "<div id=\"editor\"></div>"
      + "</div>";
    document.getElementById("quote-search").addEventListener("input", function (event) {
      state.search = event.target.value;
      renderQuoteList();
    });
    renderQuoteList();
    renderEditor();
  }

  function matches(quote, query) {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    const digits = needle.replace(/\D/g, "");
    const hay = [quote.number, quote.customer.name, quote.customer.phone, quote.customer.email, quote.customer.city].join(" ").toLowerCase();
    if (hay.includes(needle)) return true;
    const phone = (quote.customer.phone || "").replace(/\D/g, "");
    return !!(digits && phone.includes(digits));
  }

  function renderQuoteList() {
    const host = document.getElementById("quote-list");
    if (!host) return;
    const quotes = state.store.quotes.filter(function (quote) { return matches(quote, state.search); });
    if (!state.store.quotes.length) {
      host.innerHTML = "<p class=\"card lead\">No quotes on this phone yet. Start one and it stays here after you close the browser.</p>";
      return;
    }
    if (!quotes.length) {
      host.innerHTML = "<p class=\"card lead\">No quote matches that search.</p>";
      return;
    }
    host.innerHTML = quotes.map(function (quote) {
      const built = C.buildQuote(quote);
      const total = built.error || built.incomplete ? "Price needed" : C.money(built.sell);
      return "<button type=\"button\" class=\"quote-card st-" + esc(quote.schedule.status) + (quote.id === state.activeId ? " active" : "") + "\" data-action=\"open-quote\" data-id=\"" + esc(quote.id) + "\">"
        + "<strong>" + esc(quote.number) + "</strong>"
        + "<span>" + esc(quote.customer.name || "No customer yet") + (quote.customer.phone ? " · " + esc(quote.customer.phone) : "") + "</span>"
        + "<span class=\"fine\">" + esc(total) + " · " + esc(STATUS[quote.schedule.status] || "") + "</span>"
        + "</button>";
    }).join("");
  }

  function renderEditor() {
    const host = document.getElementById("editor");
    if (!host) return;
    const quote = active();
    if (!quote) {
      host.innerHTML = "<p class=\"card lead\">Tap New quote. It is saved on this phone immediately.</p>";
      return;
    }
    const doors = quote.doors.map(function (door, index) {
      return doorCard(C.normalizeDoor(door), index, quote.doors.length);
    }).join("");
    host.innerHTML = ""
      + "<section class=\"card stack\">"
      + "<div class=\"row\" style=\"justify-content:space-between\"><h1 style=\"font-size:22px\">" + esc(quote.number) + "</h1><span class=\"save-status\" data-save-status></span></div>"
      + "<div class=\"grid-2\">"
      + field("Customer", bindInput(quote, "quote.customer.name", "text", "Name", "name"))
      + field("Phone", bindInput(quote, "quote.customer.phone", "tel", "704-555-0100", "tel"))
      + field("Email", bindInput(quote, "quote.customer.email", "email", "name@email.com", "email"))
      + field("City", bindInput(quote, "quote.customer.city", "text", "Shelby, NC", "address-level2"))
      + "</div>"
      + field("Street", bindInput(quote, "quote.customer.address", "text", "Street address", "street-address"))
      + field("Note on the customer quote", "<textarea data-bind=\"quote.customer.notes\">" + esc(quote.customer.notes) + "</textarea>")
      + "<div class=\"grid-2\">"
      + field("Schedule", selectBind("quote.schedule.status", STATUS, quote.schedule.status))
      + field("Install date", "<input type=\"date\" data-bind=\"quote.schedule.date\" value=\"" + esc(quote.schedule.date) + "\">")
      + "</div>"
      + "</section>"
      + doors
      + "<button type=\"button\" class=\"btn btn-block\" data-action=\"add-door\">Add another door</button>"
      + ratesBlock(quote, "quote")
      + addersBlock(quote)
      + "<div id=\"money-panel\"></div>"
      + "<button type=\"button\" class=\"btn btn-primary btn-block\" data-action=\"manual-save\">Save quote</button>"
      + "<div class=\"row\">"
      + "<button type=\"button\" class=\"btn btn-small\" data-action=\"remember-rates\">Remember these rates</button>"
      + "<button type=\"button\" class=\"btn btn-small\" data-action=\"duplicate-quote\">Duplicate</button>"
      + "<button type=\"button\" class=\"btn btn-small\" data-action=\"delete-quote\">Delete</button>"
      + "</div>";
    refreshSummary();
  }

  function field(label, control) {
    return "<label class=\"field\"><span>" + label + "</span>" + control + "</label>";
  }

  function bindInput(quote, path, type, placeholder, auto) {
    const parts = path.split(".");
    let value = quote;
    parts.slice(1).forEach(function (part) { value = value[part]; });
    return "<input type=\"" + type + "\" data-bind=\"" + path + "\" placeholder=\"" + esc(placeholder) + "\" autocomplete=\"" + esc(auto || "off") + "\" value=\"" + esc(value || "") + "\">";
  }

  function selectBind(path, mapOrList, selected, extra) {
    const attrs = extra || "";
    let html = "<select data-bind=\"" + path + "\" " + attrs + ">";
    if (Array.isArray(mapOrList)) {
      mapOrList.forEach(function (item) {
        const value = typeof item === "string" ? item : item.id;
        const label = typeof item === "string" ? item : (item.label || item.name);
        html += "<option value=\"" + esc(value) + "\"" + (value === selected ? " selected" : "") + ">" + esc(label) + "</option>";
      });
    } else {
      Object.keys(mapOrList).forEach(function (key) {
        html += "<option value=\"" + esc(key) + "\"" + (key === selected ? " selected" : "") + ">" + esc(mapOrList[key]) + "</option>";
      });
    }
    return html + "</select>";
  }

  function doorCard(door, index, count) {
    const prefix = "quote.doors." + index;
    const series = C.seriesById(door.series);
    const net = C.lookupDoorNet(door);
    const netLabel = net == null ? "No book price" : "Book " + C.money(net);
    return "<details class=\"door\" " + (state.openDoor === index ? "open" : "") + ">"
      + "<summary>Door " + (index + 1) + " · " + esc(C.sizeLabel(door.size)) + " " + esc(door.model) + "<span>" + esc(netLabel) + "</span></summary>"
      + "<div class=\"stack\" style=\"margin-top:10px\">"
      + doorFields(door, prefix)
      + (count > 1 ? "<button type=\"button\" class=\"btn btn-small\" data-action=\"remove-door\" data-index=\"" + index + "\">Remove this door</button>" : "")
      + "</div></details>";
  }

  function doorFields(door, prefix) {
    const series = C.seriesById(door.series);
    const model = C.modelById(door.model);
    const models = C.modelsFor(series.id).map(function (item) { return { id: item.id, label: item.id }; });
    const sizes = C.sizesFor(series, door.wind).map(function (size) { return { id: size, label: C.sizeLabel(size) }; });
    const families = model.families.map(function (id) { return { id: id, label: C.FAMILY_LABEL[id] || id }; });
    const colors = ((series.colors && series.colors[door.family]) || ["White"]).map(function (name) { return { id: name, label: name }; });
    const winds = series.winds.map(function (id) { return { id: id, label: id === "90" ? "90 mph" : "No windload" }; });
    const tracks = C.trackChoices(door).map(function (item) {
      const price = item.call || item.cost == null ? "Call" : (item.cost ? C.money(item.cost) : "Included");
      return { id: item.id, label: item.label + " — " + price };
    });
    const openerOptions = [{ id: "", label: "No opener" }].concat(C.PRICES.openers.map(function (item) {
      return { id: item.id, label: item.name };
    }));
    const opener = C.openerById(door.opener);
    const rails = opener && opener.rails ? Object.keys(opener.rails).map(function (rail) {
      return { id: rail, label: rail + "' rail — " + C.money(opener.rails[rail]) };
    }) : [];
    const rerender = "data-rerender=\"1\"";
    let html = "<div class=\"grid-2\">"
      + field("Series", selectBind(prefix + ".series", C.PRICES.series.map(function (item) { return { id: item.id, label: item.name }; }), door.series, rerender))
      + field("Model", selectBind(prefix + ".model", models, door.model, rerender))
      + field("Size", selectBind(prefix + ".size", sizes, door.size, rerender))
      + field("Wind load", selectBind(prefix + ".wind", winds, door.wind, rerender))
      + field("Color group", selectBind(prefix + ".family", families, door.family, rerender))
      + field("Color", selectBind(prefix + ".color", colors, door.color))
      + field("Springs", selectBind(prefix + ".spring", { torsion: "Torsion", extension: "Extension (−$8 net)" }, door.spring))
      + field("Track", selectBind(prefix + ".track", tracks, door.track))
      + "</div>"
      + "<label class=\"check\"><input type=\"checkbox\" data-bind=\"" + prefix + ".roofPitch\"" + (door.roofPitch ? " checked" : "") + "> Roof pitch 4/12–12/12 (+$50). Track follows the pitch.</label>";
    if (series.commercial) {
      html += "<div class=\"grid-2\">"
        + field("Windows", "<input type=\"number\" min=\"0\" inputmode=\"numeric\" data-kind=\"number\" data-bind=\"" + prefix + ".windows\" value=\"" + esc(door.windows) + "\">")
        + field("Window type", selectBind(prefix + ".windowType", series.windows || [], door.windowType))
        + "</div>";
    } else {
      html += "<div class=\"grid-3\">"
        + field("Glass lites", "<input type=\"number\" min=\"0\" inputmode=\"numeric\" data-kind=\"number\" data-bind=\"" + prefix + ".lites\" value=\"" + esc(door.lites) + "\">")
        + field("Inserts", "<input type=\"number\" min=\"0\" inputmode=\"numeric\" data-kind=\"number\" data-bind=\"" + prefix + ".inserts\" value=\"" + esc(door.inserts) + "\">")
        + field("Odd window sections", "<input type=\"number\" min=\"0\" inputmode=\"numeric\" data-kind=\"number\" data-bind=\"" + prefix + ".specialSections\" value=\"" + esc(door.specialSections) + "\">")
        + "</div>"
        + "<label class=\"check\"><input type=\"checkbox\" data-bind=\"" + prefix + ".lock\"" + (door.lock ? " checked" : "") + "> Lock ($28 net)</label>"
        + "<div class=\"grid-3\">"
        + field("Hardware", selectBind(prefix + ".hingeStyle", { flat: "Flat cast", magnetic: "Magnetic" }, door.hingeStyle))
        + field("Hinges", "<input type=\"number\" min=\"0\" inputmode=\"numeric\" data-kind=\"number\" data-bind=\"" + prefix + ".hinges\" value=\"" + esc(door.hinges) + "\">")
        + field("Handles", "<input type=\"number\" min=\"0\" inputmode=\"numeric\" data-kind=\"number\" data-bind=\"" + prefix + ".handles\" value=\"" + esc(door.handles) + "\">")
        + "</div>";
    }
    html += field("Opener", selectBind(prefix + ".opener", openerOptions, door.opener, rerender));
    if (rails.length) {
      html += "<div class=\"grid-2\">"
        + field("Rail", selectBind(prefix + ".rail", rails, door.rail))
        + "<label class=\"check\"><input type=\"checkbox\" data-bind=\"" + prefix + ".headOnly\"" + (door.headOnly ? " checked" : "") + "> Head only, no rail (−$15)</label>"
        + "</div>";
    }
    if (series.bracket) html += "<p class=\"fine\">" + esc(C.PRICES.bracketNote) + "</p>";
    html += field("Net override", "<input type=\"number\" inputmode=\"decimal\" step=\"0.01\" data-bind=\"" + prefix + ".priceOverride\" placeholder=\"Blank uses the book\" value=\"" + esc(door.priceOverride) + "\">");
    html += field("Door note on the quote", "<input type=\"text\" data-bind=\"" + prefix + ".notes\" value=\"" + esc(door.notes) + "\" placeholder=\"Optional\">");
    return html;
  }

  function ratesBlock(quote, prefix) {
    return "<section class=\"card stack\"><h2>Margin, discount, labor</h2>"
      + "<p class=\"fine\">Sell = (your cost ÷ (1 − margin)) × (1 − discount). Default margin is about 42%. Labor and haul-away are your install rates, not the door sheet.</p>"
      + "<div class=\"grid-2\">"
      + field("Gross margin %", "<input type=\"number\" inputmode=\"decimal\" step=\"0.1\" data-kind=\"number\" data-bind=\"" + prefix + ".gm\" value=\"" + esc(quote.gm) + "\">")
      + field("Discount %", "<input type=\"number\" inputmode=\"decimal\" step=\"0.1\" data-kind=\"number\" data-bind=\"" + prefix + ".discount\" value=\"" + esc(quote.discount) + "\">")
      + field("Install labor per door", "<input type=\"number\" inputmode=\"decimal\" step=\"1\" data-kind=\"number\" data-bind=\"" + prefix + ".laborPerDoor\" value=\"" + esc(quote.laborPerDoor) + "\">")
      + field("Haul-away per door", "<input type=\"number\" inputmode=\"decimal\" step=\"1\" data-kind=\"number\" data-bind=\"" + prefix + ".haulPerDoor\" value=\"" + esc(quote.haulPerDoor) + "\">")
      + "</div>"
      + "<label class=\"check\"><input type=\"checkbox\" data-bind=\"" + prefix + ".installed\"" + (quote.installed !== false ? " checked" : "") + "> Complete installed job: install, haul-away, and 1-year warranty</label>"
      + "</section>";
  }

  function addersBlock(quote) {
    const rows = (quote.adders || []).map(function (adder, index) {
      return "<div class=\"grid-2\">"
        + "<input type=\"text\" data-bind=\"quote.adders." + index + ".label\" placeholder=\"Adder\" value=\"" + esc(adder.label) + "\">"
        + "<input type=\"number\" inputmode=\"decimal\" step=\"0.01\" data-kind=\"number\" data-bind=\"quote.adders." + index + ".cost\" value=\"" + esc(adder.cost) + "\">"
        + "</div>"
        + "<button type=\"button\" class=\"btn btn-small\" data-action=\"remove-adder\" data-index=\"" + index + "\">Remove adder</button>";
    }).join("");
    const presets = C.PRICES.adderPresets.map(function (preset, index) {
      return "<button type=\"button\" class=\"btn btn-small\" data-action=\"preset\" data-index=\"" + index + "\">" + esc(preset.label) + " " + esc(C.money(preset.cost)) + "</button>";
    }).join("");
    return "<section class=\"card stack\"><h2>Adders</h2><div class=\"seg\">" + presets + "</div>" + rows
      + "<button type=\"button\" class=\"btn\" data-action=\"add-adder\">Add a line</button></section>";
  }

  function refreshSummary() {
    const panel = document.getElementById("money-panel");
    const quote = active();
    if (panel && quote) {
      const built = C.buildQuote(quote);
      const problems = [].concat(built.error ? [built.error] : [], built.warnings);
      panel.innerHTML = "<div class=\"money-panel stack\">"
        + "<p class=\"fine\">Customer total</p>"
        + "<p class=\"hero\">" + (built.error || built.incomplete ? "—" : esc(C.money(built.sell))) + "</p>"
        + "<div class=\"split\"><span>Your cost</span><strong>" + esc(C.money(built.cost)) + "</strong></div>"
        + "<div class=\"split\"><span>Margin dollars</span><strong>" + (built.error || built.incomplete ? "—" : esc(C.money(built.sell - built.cost))) + "</strong></div>"
        + (Number(quote.discount) > 0 && !built.error && !built.incomplete ? "<div class=\"split\"><span>Discount</span><strong>−" + esc(C.money(built.discountAmt)) + "</strong></div>" : "")
        + "</div>"
        + (problems.length ? "<div class=\"warn\">" + problems.map(esc).join("<br>") + "</div>" : "");
    }
    if (state.tab === "quote") renderQuoteList();
    syncSheet();
    paintSaveStatus();
  }

  function onField(event) {
    const el = event.target;
    if (!el || !el.dataset || !el.dataset.bind) return;
    if (event.type === "input" && (el.type === "checkbox" || el.tagName === "SELECT")) return;
    const path = el.dataset.bind;
    let value = el.type === "checkbox" ? el.checked : el.value;
    if (el.dataset.kind === "number") {
      value = String(el.value).trim() === "" ? 0 : Number(el.value);
      if (!isFinite(value)) value = 0;
    }
    if (path.startsWith("estimate.")) {
      setPath(state.estimate, path.slice("estimate.".length), value);
      if (el.dataset.rerender === "1") {
        state.estimate.door = C.normalizeDoor(state.estimate.door);
        renderEstimate(document.getElementById("view"));
      } else refreshEstimate();
      return;
    }
    const quote = active();
    if (!quote || !path.startsWith("quote.")) return;
    setPath(quote, path.slice("quote.".length), value);
    quote.updatedAt = Date.now();
    if (el.dataset.rerender === "1" && path.indexOf("quote.doors.") === 0) {
      const index = Number(path.split(".")[2]);
      state.openDoor = index;
      quote.doors[index] = C.normalizeDoor(quote.doors[index]);
      renderEditor();
    } else if (state.tab === "send") {
      refreshSendLive();
    } else if (state.tab === "schedule" && el.dataset.rerender === "schedule") {
      render();
    } else {
      refreshSummary();
    }
    scheduleSave();
  }

  function onClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "tab") {
      state.tab = button.dataset.tab;
      render();
    } else if (action === "new-quote") {
      createQuote();
      state.tab = "quote";
      render();
    } else if (action === "open-quote") {
      state.activeId = button.dataset.id;
      state.tab = button.dataset.tab || state.tab;
      if (state.tab !== "quote" && state.tab !== "send" && state.tab !== "schedule") state.tab = "quote";
      render();
    } else if (action === "add-door") {
      const quote = active();
      if (!quote) return;
      quote.doors.push(C.blankDoor());
      state.openDoor = quote.doors.length - 1;
      quote.updatedAt = Date.now();
      renderEditor();
      scheduleSave();
    } else if (action === "remove-door") {
      const quote = active();
      quote.doors.splice(Number(button.dataset.index), 1);
      state.openDoor = 0;
      quote.updatedAt = Date.now();
      renderEditor();
      scheduleSave();
    } else if (action === "add-adder") {
      active().adders.push(C.blankAdder());
      active().updatedAt = Date.now();
      renderEditor();
      scheduleSave();
    } else if (action === "remove-adder") {
      active().adders.splice(Number(button.dataset.index), 1);
      renderEditor();
      scheduleSave();
    } else if (action === "preset") {
      const preset = C.PRICES.adderPresets[Number(button.dataset.index)];
      active().adders.push({ id: C.uid("add"), label: preset.label, cost: preset.cost });
      renderEditor();
      scheduleSave();
    } else if (action === "manual-save") {
      const quote = active();
      if (quote) quote.updatedAt = Date.now();
      saveNow();
      const node = document.querySelector("[data-save-status]");
      if (node && state.saveStatus === "saved") node.textContent = "Saved just now on this phone";
    } else if (action === "remember-rates") {
      const quote = active();
      state.store.defaults = {
        gm: Number(quote.gm),
        discount: Number(quote.discount),
        laborPerDoor: Number(quote.laborPerDoor),
        haulPerDoor: Number(quote.haulPerDoor)
      };
      saveNow();
    } else if (action === "duplicate-quote") {
      const quote = active();
      const copy = createQuote({
        door: Object.assign({}, quote.doors[0], { id: C.uid("door") }),
        rates: quote,
        installed: quote.installed
      });
      copy.customer = Object.assign({}, quote.customer);
      copy.doors = quote.doors.map(function (door) { return Object.assign({}, door, { id: C.uid("door") }); });
      copy.adders = quote.adders.map(function (adder) { return Object.assign({}, adder, { id: C.uid("add") }); });
      copy.gm = quote.gm;
      copy.discount = quote.discount;
      copy.laborPerDoor = quote.laborPerDoor;
      copy.haulPerDoor = quote.haulPerDoor;
      copy.schedule = Object.assign({}, quote.schedule);
      saveNow();
      render();
    } else if (action === "delete-quote") {
      if (!confirm("Delete this quote from this phone?")) return;
      state.store.quotes = state.store.quotes.filter(function (quote) { return quote.id !== state.activeId; });
      state.activeId = state.store.quotes[0] ? state.store.quotes[0].id : null;
      saveNow();
      render();
    } else if (action === "reset-storage") {
      if (!confirm("Replace the unreadable save with the quotes currently on screen?")) return;
      state.blockSave = false;
      state.storageError = "";
      saveNow();
      render();
    } else if (action === "save-estimate") {
      createQuote({
        door: state.estimate.door,
        rates: state.estimate,
        installed: state.estimate.installed
      });
      state.tab = "quote";
      render();
    } else if (action === "book-series") {
      state.bookSeries = button.dataset.id;
      const series = C.seriesById(state.bookSeries);
      if (series.winds.indexOf(state.bookWind) < 0) state.bookWind = series.winds[0];
      render();
    } else if (action === "book-wind") {
      state.bookWind = button.dataset.id;
      render();
    } else if (action === "book-section") {
      state.bookSection = button.dataset.id;
      render();
    } else if (action === "cal-move") {
      const delta = Number(button.dataset.delta);
      const next = new Date(state.cal.year, state.cal.month + delta, 1);
      state.cal.year = next.getFullYear();
      state.cal.month = next.getMonth();
      render();
    } else if (action === "decide") {
      setDecision(button.dataset.decision);
    } else if (action === "close-modal") {
      closeModal();
    } else if (action === "share") {
      shareQuote();
    } else if (action === "copy-quote") {
      copyQuoteText();
    } else if (action === "print-quote") {
      parkSheet();
      syncSheet();
      window.print();
      if (state.tab === "send") {
        const slot = document.getElementById("sheet-slot");
        const sheet = document.getElementById("quote-sheet");
        if (slot && sheet) {
          slot.appendChild(sheet);
          sheet.classList.add("is-visible");
        }
      }
    } else if (action === "replay") {
      if (doorTimer) {
        clearTimeout(doorTimer);
        doorTimer = null;
      }
      document.getElementById("app").hidden = true;
      initIntro();
    } else if (action === "gmail-click") {
      const quote = active();
      if (!quote) return;
      const url = C.gmailUrl(quote);
      if (url.length > 7500) {
        copyText(C.customerPlainText(quote)).then(function (ok) {
          setSendNotice(ok
            ? "This quote is long. The full text is copied. If Gmail cuts the draft short, paste it. Confirm, decline, and the deposit line are in the message."
            : "This quote is long. If Gmail cuts it short, use Copy quote text.");
        });
      }
    }
  }

  function renderBook(view) {
    const series = C.seriesById(state.bookSeries);
    const wind = series.winds.indexOf(state.bookWind) >= 0 ? state.bookWind : series.winds[0];
    view.innerHTML = "<div class=\"stack\">"
      + "<h1>Price book</h1>"
      + "<p class=\"fine\">Door nets " + esc(C.PRICES.sheetDate) + ". LiftMaster nets " + esc(C.PRICES.openerSheetDate) + ". Extension springs deduct $" + C.PRICES.extensionCredit.toFixed(0) + ". " + esc(C.PRICES.roofPitchNote) + "</p>"
      + "<div class=\"seg\">"
      + seg("doors", "Doors") + seg("openers", "Openers") + seg("extras", "Add-ons")
      + "</div>"
      + (state.bookSection === "doors" ? bookDoors(series, wind) : state.bookSection === "openers" ? bookOpeners() : bookExtras())
      + "</div>";
  }

  function seg(id, label) {
    return "<button type=\"button\" data-action=\"book-section\" data-id=\"" + id + "\" aria-pressed=\"" + (state.bookSection === id) + "\">" + label + "</button>";
  }

  function bookDoors(series, wind) {
    const chips = C.PRICES.series.map(function (item) {
      return "<button type=\"button\" data-action=\"book-series\" data-id=\"" + esc(item.id) + "\" aria-pressed=\"" + (item.id === series.id) + "\">" + esc(item.name.replace(" Series", "")) + "</button>";
    }).join("");
    const winds = series.winds.map(function (id) {
      return "<button type=\"button\" data-action=\"book-wind\" data-id=\"" + id + "\" aria-pressed=\"" + (id === wind) + "\">" + (id === "90" ? "90 mph" : "No windload") + "</button>";
    }).join("");
    const table = series.prices[wind] || {};
    const query = state.bookQuery.trim().toLowerCase();
    const sizes = Object.keys(table).filter(function (size) { return !query || size.indexOf(query.replace("×", "x")) >= 0; });
    const triple = typeof Object.values(table)[0] !== "number" && !Array.isArray(Object.values(table)[0]) ? false : Array.isArray(Object.values(table)[0]);
    const head = triple ? "<tr><th>Size</th><th>Standard</th><th>Black</th><th>Wood</th></tr>" : "<tr><th>Size</th><th>Net</th></tr>";
    const body = sizes.sort(function (a, b) {
      const pa = C.parseSize(a); const pb = C.parseSize(b);
      return pa.w - pb.w || pa.h - pb.h;
    }).map(function (size) {
      const cell = table[size];
      if (typeof cell === "number") return "<tr><td>" + esc(C.sizeLabel(size)) + "</td><td>" + esc(C.money(cell)) + "</td></tr>";
      return "<tr><td>" + esc(C.sizeLabel(size)) + "</td><td>" + esc(C.money(cell[0])) + "</td><td>" + esc(C.money(cell[1])) + "</td><td>" + esc(C.money(cell[2])) + "</td></tr>";
    }).join("");
    const glass = C.modelsFor(series.id).map(function (model) {
      const wood = model.woodGlass ? " · wood " + C.money(model.woodGlass) + " / insert " + C.money(model.woodInsert) : "";
      const insert = model.insertByWind ? "no wind " + C.money(model.insertByWind.none) + ", 90 mph " + C.money(model.insertByWind["90"]) : C.money(model.insert);
      return "<tr><td>" + esc(model.id) + "</td><td>" + esc(C.money(model.glass)) + "</td><td>" + esc(insert) + wood + "</td></tr>";
    }).join("");
    const tracks = C.trackChoices({ series: series.id, wind: wind, size: "16x7" }).map(function (item) {
      return "<tr><td>" + esc(item.label) + "</td><td>" + (item.cost == null ? "Call" : esc(C.money(item.cost))) + "</td></tr>";
    }).join("");
    return "<div class=\"seg\">" + chips + "</div><div class=\"seg\">" + winds + "</div>"
      + "<p>" + esc(series.detail) + "</p>"
      + (["400", "401", "3000"].indexOf(series.id) >= 0 ? "<p class=\"fine\">14' wide × 7' or 8' is not on this sheet. Tall sizes are listed where the sheet has them. 90 mph tall doors: enter a net override.</p>" : "")
      + "<label class=\"field\"><span>Find a size</span><input id=\"book-search\" placeholder=\"16x7\" value=\"" + esc(state.bookQuery) + "\"></label>"
      + "<div class=\"table-wrap\"><table>" + head + body + "</table></div>"
      + "<h2>Glass per lite</h2><div class=\"table-wrap\"><table><tr><th>Model</th><th>Glass</th><th>Insert</th></tr>" + glass + "</table></div>"
      + "<p class=\"fine\">Special window placement is $35 per section. Locks are $28.</p>"
      + "<h2>Track on a 16×7</h2><div class=\"table-wrap\"><table><tr><th>Option</th><th>Net</th></tr>" + tracks + "</table></div>"
      + "<p class=\"fine\">" + esc(C.PRICES.roofPitchNote) + " Taller doors use the angle-mount and hi-lift bands from the sheet. Vertical lift over 72\" is call for quote.</p>";
  }

  function bookOpeners() {
    const rows = C.PRICES.openers.map(function (opener) {
      if (opener.price != null) return "<tr><td>" + esc(opener.name) + "<div class=\"fine\">" + esc(opener.detail) + "</div></td><td colspan=\"4\">" + esc(C.money(opener.price)) + "</td></tr>";
      const cells = ["7", "8", "10", "12", "14"].map(function (rail) {
        return "<td>" + (opener.rails[rail] != null ? esc(C.money(opener.rails[rail])) : "") + "</td>";
      }).join("");
      return "<tr><td>" + esc(opener.name) + "<div class=\"fine\">" + esc(opener.detail) + "</div></td>" + cells + "</tr>";
    }).join("");
    const rails = C.PRICES.standaloneRails.map(function (rail) {
      return "<tr><td>" + esc(rail.label) + "</td><td>" + esc(C.money(rail.price)) + "</td></tr>";
    }).join("");
    return "<p class=\"fine\">Opener prices dated " + esc(C.PRICES.openerSheetDate) + " already include the rail in that column. Head only deducts $15. Standalone rails below are for parts orders.</p>"
      + "<div class=\"table-wrap\"><table><tr><th>Model</th><th>7'</th><th>8'</th><th>10'</th><th>12'</th><th>14'</th></tr>" + rows + "</table></div>"
      + "<h2>Rails alone</h2><div class=\"table-wrap\"><table>" + rails + "</table></div>"
      + "<p class=\"fine\">" + esc(C.PRICES.bracketNote) + "</p>";
  }

  function bookExtras() {
    const accessories = C.PRICES.accessories.map(function (item) {
      return "<tr><td>" + esc(item.label) + "</td><td>" + esc(C.money(item.price)) + "</td></tr>";
    }).join("");
    const presets = C.PRICES.adderPresets.map(function (item) {
      return "<tr><td>" + esc(item.label) + "</td><td>" + esc(C.money(item.cost)) + "</td></tr>";
    }).join("");
    const sizes = C.PRICES.windAdders.sizes.map(function (size, index) {
      return "<tr><td>" + esc(C.sizeLabel(size)) + "</td><td>" + esc(C.money(C.PRICES.windAdders.mph120["510"][index])) + "</td><td>" + esc(C.money(C.PRICES.windAdders.mph120["3610"][index])) + "</td><td>" + esc(C.money(C.PRICES.windAdders.mph130["510"][index])) + "</td></tr>";
    }).join("");
    return "<h2>Common accessories</h2><div class=\"table-wrap\"><table>" + accessories + "</table></div>"
      + "<h2>Sheet charges you can add on a quote</h2><div class=\"table-wrap\"><table>" + presets + "</table></div>"
      + "<h2>120 / 130 mph add-on</h2><p class=\"fine\">" + esc(C.PRICES.windAdders.note) + "</p>"
      + "<div class=\"table-wrap\"><table><tr><th>Size</th><th>120 on 510</th><th>120 on 3610</th><th>130 on 510 and 3610</th></tr>" + sizes + "</table></div>";
  }

  function renderEstimate(view) {
    if (!state.estimate) state.estimate = freshEstimate();
    const estimate = state.estimate;
    state.estimate.door = C.normalizeDoor(state.estimate.door);
    view.innerHTML = "<div class=\"stack\"><h1>Estimate</h1><p class=\"fine\">A fast installed price. It is not saved until you turn it into a quote.</p>"
      + "<section class=\"card stack\">" + doorFields(state.estimate.door, "estimate.door") + "</section>"
      + ratesBlock(estimate, "estimate")
      + "<div id=\"estimate-money\"></div>"
      + "<button type=\"button\" class=\"btn btn-primary btn-block\" data-action=\"save-estimate\">Save this estimate as a quote</button>"
      + "</div>";
    refreshEstimate();
  }

  function refreshEstimate() {
    const host = document.getElementById("estimate-money");
    if (!host) return;
    const fake = {
      gm: state.estimate.gm,
      discount: state.estimate.discount,
      laborPerDoor: state.estimate.laborPerDoor,
      haulPerDoor: state.estimate.haulPerDoor,
      installed: state.estimate.installed,
      adders: [],
      doors: [state.estimate.door]
    };
    const built = C.buildQuote(fake);
    host.innerHTML = "<div class=\"money-panel\"><p class=\"fine\">Customer total</p><p class=\"hero\">"
      + (built.error || built.incomplete ? "—" : esc(C.money(built.sell))) + "</p><div class=\"split\"><span>Your cost</span><strong>"
      + esc(C.money(built.cost)) + "</strong></div></div>"
      + (built.warnings.length ? "<div class=\"warn\">" + built.warnings.map(esc).join("<br>") + "</div>" : "");
  }

  function renderSchedule(view) {
    const groups = ["not_ordered", "awaiting_customer", "warehouse_confirmed"].map(function (status) {
      const jobs = state.store.quotes.filter(function (quote) { return quote.schedule.status === status; });
      const cards = jobs.length ? jobs.map(jobCard).join("") : "<p class=\"fine\">None</p>";
      return "<section><h2><span class=\"pill st-" + status + "\">" + esc(STATUS[status]) + "</span></h2>" + cards + "</section>";
    }).join("");
    view.innerHTML = "<div class=\"stack board\"><h1>Schedule</h1>"
      + "<p class=\"fine\">Red until ordered. Orange while you wait on the customer. Green when the warehouse confirms. Names show on the board and the calendar.</p>"
      + calendarHtml()
      + groups
      + "</div>";
  }

  function jobCard(quote) {
    return "<article class=\"job st-" + esc(quote.schedule.status) + "\">"
      + "<button type=\"button\" class=\"btn btn-small\" data-action=\"open-quote\" data-id=\"" + esc(quote.id) + "\" data-tab=\"quote\">" + esc(quote.customer.name || "No name") + "</button>"
      + "<span class=\"fine\">" + esc(quote.number) + (quote.customer.phone ? " · " + esc(quote.customer.phone) : "") + "</span>"
      + "<div class=\"grid-2\">"
      + "<select data-bind=\"quote.schedule.status\" data-rerender=\"schedule\" data-quote=\"" + esc(quote.id) + "\">"
      + Object.keys(STATUS).map(function (key) {
        return "<option value=\"" + key + "\"" + (quote.schedule.status === key ? " selected" : "") + ">" + esc(STATUS[key]) + "</option>";
      }).join("")
      + "</select>"
      + "<input type=\"date\" data-bind=\"quote.schedule.date\" data-rerender=\"schedule\" data-quote=\"" + esc(quote.id) + "\" value=\"" + esc(quote.schedule.date) + "\">"
      + "</div></article>";
  }

  function calendarHtml() {
    const monthName = new Date(state.cal.year, state.cal.month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const first = new Date(state.cal.year, state.cal.month, 1).getDay();
    const days = new Date(state.cal.year, state.cal.month + 1, 0).getDate();
    let cells = "Sun Mon Tue Wed Thu Fri Sat".split(" ").map(function (day) { return "<div class=\"dow\">" + day + "</div>"; }).join("");
    for (let i = 0; i < first; i++) cells += "<div class=\"day mute\"></div>";
    for (let day = 1; day <= days; day++) {
      const iso = state.cal.year + "-" + String(state.cal.month + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0");
      const jobs = state.store.quotes.filter(function (quote) { return quote.schedule.date === iso; });
      const names = jobs.map(function (quote) {
        const name = (quote.customer.name || "No name").trim();
        return "<button type=\"button\" class=\"st-" + esc(quote.schedule.status) + "\" data-action=\"open-quote\" data-id=\"" + esc(quote.id) + "\" data-tab=\"quote\">" + esc(name) + "</button>";
      }).join("");
      cells += "<div class=\"day\"><strong>" + day + "</strong>" + names + "</div>";
    }
    return "<section class=\"card stack\"><div class=\"row\" style=\"justify-content:space-between\"><button type=\"button\" class=\"btn btn-small\" data-action=\"cal-move\" data-delta=\"-1\">Prev</button><strong>" + esc(monthName) + "</strong><button type=\"button\" class=\"btn btn-small\" data-action=\"cal-move\" data-delta=\"1\">Next</button></div><div class=\"cal\">" + cells + "</div></section>";
  }

  function renderSend(view) {
    const quote = active();
    const options = state.store.quotes.map(function (item) {
      return "<option value=\"" + esc(item.id) + "\"" + (item.id === state.activeId ? " selected" : "") + ">" + esc(item.number + " — " + (item.customer.name || "No name")) + "</option>";
    }).join("");
    if (!quote) {
      view.innerHTML = "<div class=\"stack\"><h1>Send</h1><p class=\"lead\">Create a quote first. It saves on this phone, then you can email or text it from here.</p><button type=\"button\" class=\"btn btn-primary\" data-action=\"new-quote\">New quote</button></div>";
      return;
    }
    const missingEmail = !(quote.customer.email || "").trim();
    const missingPhone = !(quote.customer.phone || "").trim();
    view.innerHTML = "<div class=\"stack send-tools\">"
      + "<h1>Send</h1>"
      + "<label class=\"field\"><span>Quote</span><select id=\"send-pick\">" + options + "</select></label>"
      + "<div class=\"grid-2\">"
      + field("Email for Gmail", "<input type=\"email\" data-bind=\"quote.customer.email\" autocomplete=\"email\" placeholder=\"customer@email.com\" value=\"" + esc(quote.customer.email) + "\">")
      + field("Phone for text", "<input type=\"tel\" data-bind=\"quote.customer.phone\" autocomplete=\"tel\" placeholder=\"704-555-0100\" value=\"" + esc(quote.customer.phone) + "\">")
      + "</div>"
      + (missingEmail ? "<div class=\"warn\">Add the customer email so Gmail has a To address. You can still open Gmail and type it.</div>" : "")
      + (missingPhone ? "<p class=\"fine\">No phone yet. Text message will open Messages so you can pick the contact. The quote is already in the message.</p>" : "")
      + "<div class=\"action\"><a id=\"gmail-link\" class=\"btn btn-primary btn-block\" target=\"_blank\" rel=\"noopener noreferrer\" data-action=\"gmail-click\" href=\"" + esc(C.gmailUrl(quote)) + "\">Open in Gmail</a><p class=\"fine\">One tap opens Gmail with To, subject, the full quote, Confirm / Decline, and the deposit call to 704-472-9367.</p></div>"
      + "<div class=\"action\"><button type=\"button\" class=\"btn btn-dark btn-block\" data-action=\"share\">Share</button><p class=\"fine\">Opens the phone share sheet with the quote text and a PDF when this phone allows files.</p></div>"
      + "<div class=\"action\"><a id=\"sms-link\" class=\"btn btn-block\" href=\"" + esc(C.smsHref(quote)) + "\">Text message</a><p class=\"fine\">Opens Messages with the same quote, Confirm / Decline, and the deposit line.</p></div>"
      + "<div class=\"action\"><button type=\"button\" class=\"btn btn-block\" data-action=\"copy-quote\">Copy quote text</button><p class=\"fine\">Copies the full customer quote if share is not available.</p></div>"
      + "<textarea id=\"copy-box\" hidden></textarea>"
      + "<div id=\"share-fallback\" class=\"warn\" hidden>Use Text message or Copy quote text. This browser did not open a share sheet.</div>"
      + "<p id=\"send-notice\" class=\"fine\"></p>"
      + "<div class=\"action\"><button type=\"button\" class=\"btn btn-block\" data-action=\"print-quote\">Print / Save PDF</button><p class=\"fine\">On iPhone, tap Share in the print preview, then Save to Files.</p></div>"
      + "<a id=\"pdf-download\" class=\"btn btn-block\" download=\"" + esc(quote.number) + ".pdf\">Download PDF</a>"
      + "<p class=\"fine\">The sheet below is the customer quote. Your cost stays on the Quote tab.</p>"
      + "<div id=\"sheet-slot\"></div>"
      + "</div>";
    document.getElementById("send-pick").addEventListener("change", function (event) {
      state.activeId = event.target.value;
      render();
    });
    document.getElementById("quote-sheet").classList.add("is-visible");
    document.getElementById("sheet-slot").appendChild(document.getElementById("quote-sheet"));
    updatePdfLink(quote);
    syncSheet();
  }

  function refreshSendLive() {
    const quote = active();
    if (!quote) return;
    const gmail = document.getElementById("gmail-link");
    const sms = document.getElementById("sms-link");
    if (gmail) gmail.href = C.gmailUrl(quote);
    if (sms) sms.href = C.smsHref(quote);
    updatePdfLink(quote);
    syncSheet();
    scheduleSave();
  }

  function setSendNotice(text) {
    const node = document.getElementById("send-notice");
    if (node) node.textContent = text;
  }

  function updatePdfLink(quote) {
    const link = document.getElementById("pdf-download");
    if (!link || !quote) return;
    if (state.pdfUrl) URL.revokeObjectURL(state.pdfUrl);
    const blob = new Blob([PDF.pdfBytes(quote)], { type: "application/pdf" });
    state.pdfUrl = URL.createObjectURL(blob);
    link.href = state.pdfUrl;
    link.download = (quote.number || "quote") + ".pdf";
  }

  function sheetInner(quote) {
    const built = C.buildQuote(quote);
    const customer = quote.customer || {};
    const place = [customer.address, customer.city].filter(Boolean).join(", ");
    const rows = built.customerLines.map(function (line) {
      return "<tr><td>" + esc(line.label) + "</td><td>" + esc(line.display || "") + "</td></tr>";
    }).join("");
    let totals = "";
    if (built.error) totals = "<p class=\"warn\">" + esc(built.error) + "</p>";
    else if (built.incomplete) totals = "<p class=\"warn\">Total pending. A price is still missing. Call " + esc(C.OFFICE.phone) + ".</p>";
    else {
      totals = (Number(quote.discount) > 0
        ? "<div class=\"split\" style=\"display:flex;justify-content:space-between\"><span>Subtotal</span><span>" + esc(C.money(built.subtotal)) + "</span></div>"
          + "<div class=\"split\" style=\"display:flex;justify-content:space-between\"><span>Discount " + esc(quote.discount) + "%</span><span>−" + esc(C.money(built.discountAmt)) + "</span></div>"
        : "")
        + "<div class=\"total-line\"><span>Installed total</span><span>" + esc(C.money(built.sell)) + "</span></div>";
    }
    const decision = quote.decision === "confirmed"
      ? "<p class=\"pill st-warehouse_confirmed\">Confirmed. Call to make the deposit.</p>"
      : quote.decision === "declined"
        ? "<p class=\"pill st-not_ordered\">Declined</p>"
        : "";
    return "<header class=\"sheet-head\"><img src=\"assets/logo.png\" alt=\"Cleveland County Garage Doors\"><div><h2 style=\"margin:0\">" + esc(C.OFFICE.name) + "</h2><p class=\"tagline\" style=\"margin:4px 0\">" + esc(C.OFFICE.tagline) + "</p><p style=\"margin:0\"><a href=\"tel:" + C.OFFICE.phoneTel + "\">" + esc(C.OFFICE.phone) + "</a></p></div></header>"
      + "<h3 style=\"margin-top:14px\">Quote " + esc(quote.number) + "</h3>"
      + "<p class=\"fine\">" + esc(C.formatDate(quote.createdAt)) + "</p>"
      + decision
      + "<h3>Prepared for</h3><p style=\"margin:0\"><strong>" + esc(customer.name || "Customer") + "</strong><br>"
      + esc(customer.phone || "") + (customer.phone ? "<br>" : "")
      + esc(customer.email || "") + (customer.email ? "<br>" : "")
      + esc(place) + "</p>"
      + "<p>" + (built.installed ? "Complete installed job. Installation, haul-away, and a 1-year workmanship warranty are included." : "Parts quote. Installation is not included.") + "</p>"
      + "<div class=\"table-wrap\"><table><tr><th>Description</th><th>Amount</th></tr>" + rows + "</table></div>"
      + (customer.notes ? "<p><strong>Notes.</strong> " + esc(customer.notes) + "</p>" : "")
      + totals
      + "<div class=\"no-print row\" style=\"margin:12px 0\"><button type=\"button\" class=\"btn btn-primary\" data-action=\"decide\" data-decision=\"confirmed\">Confirm</button><button type=\"button\" class=\"btn\" data-action=\"decide\" data-decision=\"declined\">Decline</button></div>"
      + "<div class=\"sign-block\"><div class=\"sign-line\"><strong>CONFIRM</strong> — I accept this quote.<br>Signature _______________________ &nbsp; Date ____________</div>"
      + "<div class=\"sign-line\"><strong>DECLINE</strong> — I decline this quote.<br>Signature _______________________ &nbsp; Date ____________</div></div>"
      + "<p class=\"deposit\">Call " + esc(C.OFFICE.name) + " at <a href=\"tel:" + C.OFFICE.phoneTel + "\">" + esc(C.OFFICE.phone) + "</a> to make a deposit.</p>"
      + "<p class=\"team\">" + esc(C.OFFICE.team) + "</p>";
  }

  function syncSheet() {
    const sheet = document.getElementById("quote-sheet");
    if (!sheet) return;
    const quote = active();
    sheet.innerHTML = quote ? sheetInner(quote) : "<p>No quote selected.</p>";
    const onSend = state.tab === "send" && document.getElementById("sheet-slot");
    sheet.classList.toggle("is-visible", !!onSend);
    if (onSend) document.getElementById("sheet-slot").appendChild(sheet);
  }

  function setDecision(decision) {
    const quote = active();
    if (!quote) return;
    quote.decision = decision;
    quote.decisionAt = Date.now();
    quote.updatedAt = Date.now();
    saveNow();
    syncSheet();
    if (decision === "confirmed") {
      openModal(
        "Quote confirmed",
        "Call Cleveland County Garage Doors at 704-472-9367 to make a deposit.",
        "<a class=\"btn btn-primary btn-block\" href=\"tel:7044729367\">Call 704-472-9367</a><button type=\"button\" class=\"btn btn-block\" data-action=\"close-modal\">Close</button>"
      );
    } else {
      openModal(
        "Quote declined",
        "No deposit. Call Cleveland County Garage Doors at 704-472-9367 if they come back.",
        "<a class=\"btn btn-block\" href=\"tel:7044729367\">Call 704-472-9367</a><button type=\"button\" class=\"btn btn-block\" data-action=\"close-modal\">Close</button>"
      );
    }
  }

  function openModal(title, body, actions) {
    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-body").textContent = body;
    document.getElementById("modal-actions").innerHTML = actions;
    document.getElementById("modal").hidden = false;
  }

  function closeModal() {
    const modal = document.getElementById("modal");
    if (modal) modal.hidden = true;
  }

  async function shareQuote() {
    const quote = active();
    if (!quote) return;
    const text = C.customerPlainText(quote);
    const title = C.gmailSubject(quote);
    const file = new File([PDF.pdfBytes(quote)], (quote.number || "quote") + ".pdf", { type: "application/pdf" });
    if (navigator.share) {
      const attempts = [];
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          attempts.push({ files: [file], title: title, text: text });
          attempts.push({ files: [file], title: title });
        }
      } catch (error) { /* try text share next */ }
      attempts.push({ title: title, text: text });
      for (let i = 0; i < attempts.length; i++) {
        try {
          await navigator.share(attempts[i]);
          setSendNotice("Share sheet opened.");
          return;
        } catch (error) {
          if (error && error.name === "AbortError") return;
        }
      }
    }
    const copied = await copyText(text);
    const fallback = document.getElementById("share-fallback");
    if (fallback) fallback.hidden = false;
    const box = document.getElementById("copy-box");
    if (!copied && box) {
      box.hidden = false;
      box.value = text;
      box.focus();
      box.select();
    }
    setSendNotice(copied
      ? "This phone did not share the file. The quote is copied. Use Text message, or paste it."
      : "Use Text message, or press and hold the quote text and choose Copy.");
  }

  async function copyQuoteText() {
    const quote = active();
    if (!quote) return;
    const text = C.customerPlainText(quote);
    const ok = await copyText(text);
    const box = document.getElementById("copy-box");
    if (box) {
      box.hidden = ok;
      if (!ok) {
        box.value = text;
        box.focus();
        box.select();
      }
    }
    setSendNotice(ok ? "Quote copied." : "Press and hold the text, then choose Copy.");
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) { /* fall through */ }
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "0";
      area.style.top = "0";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.focus();
      area.select();
      area.setSelectionRange(0, text.length);
      const ok = document.execCommand("copy");
      area.remove();
      return !!ok;
    } catch (error) {
      return false;
    }
  }

  document.addEventListener("input", function (event) {
    if (event.target && event.target.id === "book-search") {
      state.bookQuery = event.target.value;
      const series = C.seriesById(state.bookSeries);
      const wind = series.winds.indexOf(state.bookWind) >= 0 ? state.bookWind : series.winds[0];
      const wrap = document.querySelector("#view .table-wrap table");
      if (!wrap) return;
      renderBook(document.getElementById("view"));
      const input = document.getElementById("book-search");
      if (input) {
        input.focus();
        const pos = input.value.length;
        input.setSelectionRange(pos, pos);
      }
    }
  });

  document.addEventListener("input", scheduleField, true);
  document.addEventListener("change", scheduleField, true);
  function scheduleField(event) {
    const el = event.target;
    if (!el || !el.dataset || !el.dataset.quote) return;
    const quote = state.store.quotes.find(function (item) { return item.id === el.dataset.quote; });
    if (!quote) return;
    state.activeId = quote.id;
  }

  boot();
})();
