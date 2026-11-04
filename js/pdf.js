(function (root, factory) {
  const calc = root.CCGD || (typeof require === "function" ? require("./calc.js") : null);
  const api = factory(calc);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CCGD_PDF = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (CCGD) {
  function escapePdf(text) {
    return String(text == null ? "" : text)
      .replace(/[^\x20-\x7E]/g, " ")
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
  }

  function wrap(text, width) {
    const words = String(text || "").split(/\s+/).filter(Boolean);
    if (!words.length) return [""];
    const lines = [];
    let current = "";
    words.forEach(function (word) {
      const next = current ? current + " " + word : word;
      if (next.length > width && current) {
        lines.push(current);
        current = word;
      } else {
        current = next;
      }
    });
    if (current) lines.push(current);
    return lines;
  }

  function quotePdfItems(quote) {
    const built = CCGD.buildQuote(quote);
    const c = quote.customer || {};
    const items = [];
    function add(text, size, bold, gap) {
      const width = size >= 16 ? 42 : size >= 12 ? 68 : 86;
      const lines = wrap(text, width);
      lines.forEach(function (line, i) {
        items.push({
          text: line,
          size: i === 0 ? size : Math.min(size, 11),
          bold: bold && i === 0,
          gap: i === lines.length - 1 ? (gap || 4) : 2
        });
      });
    }
    add(CCGD.OFFICE.name, 18, true, 4);
    add(CCGD.OFFICE.tagline, 11, false, 3);
    add("Office " + CCGD.OFFICE.phone, 11, true, 12);
    add("QUOTE " + (quote.number || ""), 14, true, 3);
    add(CCGD.formatDate(quote.createdAt), 10, false, 10);
    add("Prepared for", 9, true, 2);
    add(c.name || "Customer", 12, true, 2);
    if (c.phone) add(c.phone, 10, false, 2);
    if (c.email) add(c.email, 10, false, 2);
    const place = [c.address, c.city].filter(Boolean).join(", ");
    if (place) add(place, 10, false, 8);
    add(built.installed ? "Complete installed job: installation, haul-away, and a 1-year workmanship warranty." : "Parts quote. Installation is not included.", 10, false, 10);
    add("Description", 9, true, 4);
    built.customerLines.forEach(function (line) {
      const amount = line.display || "";
      add(line.label + "    " + amount, 10, false, 3);
    });
    add(" ", 8, false, 4);
    if (built.error) add(built.error, 11, true, 4);
    else if (built.incomplete) add("Total pending — a price is still missing. Call " + CCGD.OFFICE.phone + ".", 11, true, 4);
    else {
      if (Number(quote.discount) > 0) {
        add("Subtotal " + CCGD.money(built.subtotal), 11, false, 2);
        add("Discount " + quote.discount + "%  -" + CCGD.money(built.discountAmt), 11, false, 2);
      }
      add("INSTALLED TOTAL " + CCGD.money(built.sell), 14, true, 12);
    }
    if (c.notes) add("Notes: " + c.notes, 10, false, 8);
    add("CONFIRM — I accept this quote.", 11, true, 2);
    add("Signature _______________________    Date ____________", 10, false, 8);
    add("DECLINE — I decline this quote.", 11, true, 2);
    add("Signature _______________________    Date ____________", 10, false, 10);
    add("Call " + CCGD.OFFICE.name + " at " + CCGD.OFFICE.phone + " to make a deposit.", 11, true, 10);
    add(CCGD.OFFICE.team, 11, true, 4);
    add("Wholesale cost is not shown on this customer quote.", 8, false, 2);
    return items;
  }

  function buildPdfString(quote) {
    const items = quotePdfItems(quote);
    const pageWidth = 612;
    const pageHeight = 792;
    const margin = 54;
    const pages = [];
    let ops = [];
    let y = pageHeight - margin;

    function newPage() {
      if (ops.length) pages.push(ops);
      ops = [];
      y = pageHeight - margin;
      ops.push("0.88 0.02 0.02 rg");
      ops.push("0 " + (pageHeight - 36) + " " + pageWidth + " 36 re f");
      ops.push("1 1 1 rg");
      ops.push("BT /F2 11 Tf 54 " + (pageHeight - 24) + " Td (" + escapePdf(CCGD.OFFICE.short + "  ·  " + CCGD.OFFICE.phone) + ") Tj ET");
      ops.push("0 0 0 rg");
      y = pageHeight - 64;
    }

    newPage();
    items.forEach(function (item) {
      const size = item.size || 11;
      const drop = size + (item.gap || 4);
      if (y - drop < margin) newPage();
      const font = item.bold ? "F2" : "F1";
      ops.push("BT /" + font + " " + size + " Tf 1 0 0 1 " + margin + " " + y.toFixed(2) + " Tm (" + escapePdf(item.text) + ") Tj ET");
      y -= drop;
    });
    if (ops.length) pages.push(ops);

    const objects = new Array(2);
    objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";
    function add(body) {
      objects.push(body);
      return objects.length;
    }
    const font1 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    const font2 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
    const pageIds = [];
    const contentIds = [];
    pages.forEach(function (pageOps) {
      const stream = pageOps.join("\n");
      contentIds.push(add("<< /Length " + stream.length + " >>\nstream\n" + stream + "\nendstream"));
    });
    pages.forEach(function (_, i) {
      pageIds.push(add(
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + pageWidth + " " + pageHeight + "] /Contents " + contentIds[i] + " 0 R /Resources << /Font << /F1 " + font1 + " 0 R /F2 " + font2 + " 0 R >> >> >>"
      ));
    });
    objects[1] = "<< /Type /Pages /Kids [" + pageIds.map(function (id) { return id + " 0 R"; }).join(" ") + "] /Count " + pageIds.length + " >>";

    let out = "%PDF-1.4\n";
    const offsets = [0];
    objects.forEach(function (body, i) {
      offsets.push(out.length);
      out += (i + 1) + " 0 obj\n" + body + "\nendobj\n";
    });
    const xref = out.length;
    out += "xref\n0 " + (objects.length + 1) + "\n";
    out += "0000000000 65535 f \n";
    for (let i = 1; i < offsets.length; i++) {
      out += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
    }
    out += "trailer << /Size " + (objects.length + 1) + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF";
    return out;
  }

  function pdfBytes(quote) {
    const text = buildPdfString(quote);
    const bytes = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i) & 0xff;
    return bytes;
  }

  return {
    buildPdfString: buildPdfString,
    pdfBytes: pdfBytes
  };
});
