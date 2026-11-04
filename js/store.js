(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CCGD_STORE = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const STORAGE_KEY = "ccgd-dealer-quotes-v2";

  function emptyStore() {
    return {
      quotes: [],
      seq: {},
      defaults: { gm: 42, discount: 0, laborPerDoor: 285, haulPerDoor: 75 }
    };
  }

  function storageErrorMessage(error) {
    const name = error && error.name;
    if (name === "SecurityError") {
      return "This page blocked local storage (SecurityError). Open the site directly in Safari at the GitHub Pages address, not inside another app or frame, then add it to your Home Screen.";
    }
    if (name === "QuotaExceededError") {
      return "This phone is out of storage space, so the quote could not be saved.";
    }
    const message = error && error.message ? error.message : "unknown error";
    return "Could not save quotes on this phone: " + message;
  }

  function loadStore(storage) {
    let raw = null;
    try {
      raw = storage.getItem(STORAGE_KEY);
    } catch (error) {
      return { ok: false, error: storageErrorMessage(error), data: emptyStore(), preserve: true };
    }
    if (!raw) return { ok: true, error: "", data: emptyStore(), preserve: false };
    try {
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.quotes)) throw new Error("saved quotes were not in the expected format");
      data.seq = data.seq && typeof data.seq === "object" ? data.seq : {};
      data.defaults = Object.assign({ gm: 42, discount: 0, laborPerDoor: 285, haulPerDoor: 75 }, data.defaults || {});
      return { ok: true, error: "", data: data, preserve: false };
    } catch (error) {
      return {
        ok: false,
        error: "Saved quotes are on this phone but could not be read (" + error.message + "). Nothing was erased.",
        data: emptyStore(),
        preserve: true
      };
    }
  }

  function saveStore(storage, data) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(data));
      return { ok: true, error: "" };
    } catch (error) {
      return { ok: false, error: storageErrorMessage(error) };
    }
  }

  function nextQuoteNumber(data, now) {
    const d = now || new Date();
    const ymd = String(d.getFullYear())
      + String(d.getMonth() + 1).padStart(2, "0")
      + String(d.getDate()).padStart(2, "0");
    data.seq = data.seq || {};
    data.seq[ymd] = (Number(data.seq[ymd]) || 0) + 1;
    return "CCGD-" + ymd + "-" + String(data.seq[ymd]).padStart(4, "0");
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    emptyStore: emptyStore,
    storageErrorMessage: storageErrorMessage,
    loadStore: loadStore,
    saveStore: saveStore,
    nextQuoteNumber: nextQuoteNumber
  };
});
