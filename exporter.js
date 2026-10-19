"use strict";

// Exports for the agenda builder: a PDF with numbered floor maps, a PNG of a day's map, and an .ics calendar file.
// No libraries: the PDF is written directly (Helvetica base-14 fonts, WinAnsi text, JPEG map images).
(() => {
  // Advance widths (1/1000 em) for WinAnsi codes 32..255, taken from the Helvetica and Helvetica-Bold font metrics.
  const WIDTHS = {
    regular: [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584,0,556,0,222,556,333,1000,556,556,333,1000,667,333,1000,0,611,0,0,222,222,333,333,350,556,1000,333,1000,500,333,944,0,500,667,278,333,556,556,556,556,260,556,333,737,370,556,584,333,737,333,400,584,333,333,333,556,537,278,333,333,365,556,834,834,834,611,667,667,667,667,667,667,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,500,556,556,556,556,278,278,278,278,556,556,556,556,556,556,556,584,611,556,556,556,556,500,556,500],
    bold: [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584,0,556,0,278,556,500,1000,556,556,333,1000,667,333,1000,0,611,0,0,278,278,500,500,350,556,1000,333,1000,556,333,944,0,500,667,278,333,556,556,556,556,280,556,333,737,370,556,584,333,737,333,400,584,333,333,333,611,556,278,333,333,365,556,834,834,834,611,722,722,722,722,722,722,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,556,556,556,556,556,278,278,278,278,611,611,611,611,611,611,611,584,611,611,611,611,611,556,611,556]
  };
  const WIN_ANSI = new Map([[0x20ac, 128], [0x201a, 130], [0x0192, 131], [0x201e, 132], [0x2026, 133], [0x2020, 134], [0x2021, 135], [0x02c6, 136], [0x2030, 137], [0x0160, 138], [0x2039, 139], [0x0152, 140], [0x017d, 142], [0x2018, 145], [0x2019, 146], [0x201c, 147], [0x201d, 148], [0x2022, 149], [0x2013, 150], [0x2014, 151], [0x02dc, 152], [0x2122, 153], [0x0161, 154], [0x203a, 155], [0x0153, 156], [0x017e, 158], [0x0178, 159]]);

  // Text to WinAnsi bytes. Characters the base fonts cannot show become "?" (or "->" for arrows) rather than breaking the file.
  function encode(text) {
    const bytes = [];
    for (const character of String(text ?? "").normalize("NFC")) {
      const code = character.codePointAt(0);
      if (code === 0x200b || code === 0xfeff || code === 0xad) continue;
      if (code === 9 || code === 10 || code === 13) bytes.push(32);
      else if ((code >= 32 && code <= 126) || (code >= 160 && code <= 255)) bytes.push(code);
      else if (WIN_ANSI.has(code)) bytes.push(WIN_ANSI.get(code));
      else if (code === 0x2192) bytes.push(45, 62);
      else bytes.push(63);
    }
    return bytes;
  }
  const latin1 = (text) => encode(text).map((byte) => String.fromCharCode(byte)).join("");
  const pdfString = (binary) => `(${binary.replace(/[\\()]/g, "\\$&")})`;
  const toBytes = (chunk) => {
    if (chunk instanceof Uint8Array) return chunk;
    const bytes = new Uint8Array(chunk.length);
    for (let index = 0; index < chunk.length; index += 1) bytes[index] = chunk.charCodeAt(index) & 255;
    return bytes;
  };
  const measure = (text, size, weight = "regular") => {
    const table = weight === "bold" ? WIDTHS.bold : WIDTHS.regular;
    return encode(text).reduce((total, byte) => total + (table[byte - 32] || 556), 0) * size / 1000;
  };
  function wrap(text, size, weight, maxWidth) {
    const lines = [];
    let line = "";
    String(text ?? "").split(/\s+/).filter(Boolean).forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (measure(candidate, size, weight) <= maxWidth) { line = candidate; return; }
      if (line) lines.push(line);
      line = "";
      if (measure(word, size, weight) <= maxWidth) { line = word; return; }
      let chunk = "";
      for (const character of word) {
        if (measure(chunk + character, size, weight) > maxWidth && chunk) { lines.push(chunk); chunk = character; } else chunk += character;
      }
      line = chunk;
    });
    if (line) lines.push(line);
    return lines.length ? lines : [""];
  }

  const COLORS = { ink: [9, 13, 27], muted: [91, 100, 131], soft: [138, 146, 172], line: [221, 225, 238], magenta: [177, 0, 184], blue: [47, 109, 240], teal: [12, 163, 145], panel: [243, 244, 250], white: [255, 255, 255], mint: [47, 255, 224] };
  const mix = (a, b, t) => a.map((value, index) => Math.round(value + (b[index] - value) * t));
  const fixed = (value) => String(Math.round(value * 100) / 100);
  const rgb = (color) => color.map((value) => fixed(value / 255)).join(" ");

  function createPdf(info) {
    const W = 612;
    const H = 792;
    const objects = [];
    const alloc = () => objects.push(null);
    const set = (id, ...chunks) => { objects[id - 1] = chunks; };
    const catalogId = alloc();
    const pagesId = alloc();
    const fontIds = { F1: alloc(), F2: alloc(), F3: alloc() };
    set(fontIds.F1, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
    set(fontIds.F2, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
    set(fontIds.F3, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>");
    const infoId = alloc();
    const images = [];
    const pages = [];

    function addImage(jpeg, width, height) {
      const id = alloc();
      const name = `Im${images.length + 1}`;
      set(id, `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`, jpeg, "\nendstream");
      images.push({ id, name });
      return name;
    }

    function addPage() {
      const ops = [];
      const links = [];
      const used = new Set();
      pages.push({ ops, links, used });
      const paint = (path, fill, stroke, width) => {
        ops.push(`${fill ? `${rgb(fill)} rg ` : ""}${stroke ? `${rgb(stroke)} RG ${fixed(width || 0.75)} w ` : ""}${path} ${fill && stroke ? "B" : fill ? "f" : "S"}`);
      };
      return {
        text(value, x, y, options = {}) {
          const font = options.weight === "bold" ? "F2" : options.weight === "italic" ? "F3" : "F1";
          ops.push(`BT /${font} ${fixed(options.size || 10)} Tf ${rgb(options.color || COLORS.ink)} rg ${fixed(options.spacing || 0)} Tc ${fixed(x)} ${fixed(H - y)} Td ${pdfString(latin1(value))} Tj ET`);
        },
        rect(x, y, w, h, fill, stroke, width) { paint(`${fixed(x)} ${fixed(H - y - h)} ${fixed(w)} ${fixed(h)} re`, fill, stroke, width); },
        roundRect(x, y, w, h, r, fill, stroke, width) {
          const k = 0.5523 * r;
          const left = x;
          const bottom = H - y - h;
          const right = x + w;
          const top = H - y;
          paint([
            `${fixed(left + r)} ${fixed(bottom)} m`, `${fixed(right - r)} ${fixed(bottom)} l`,
            `${fixed(right - r + k)} ${fixed(bottom)} ${fixed(right)} ${fixed(bottom + r - k)} ${fixed(right)} ${fixed(bottom + r)} c`, `${fixed(right)} ${fixed(top - r)} l`,
            `${fixed(right)} ${fixed(top - r + k)} ${fixed(right - r + k)} ${fixed(top)} ${fixed(right - r)} ${fixed(top)} c`, `${fixed(left + r)} ${fixed(top)} l`,
            `${fixed(left + r - k)} ${fixed(top)} ${fixed(left)} ${fixed(top - r + k)} ${fixed(left)} ${fixed(top - r)} c`, `${fixed(left)} ${fixed(bottom + r)} l`,
            `${fixed(left)} ${fixed(bottom + r - k)} ${fixed(left + r - k)} ${fixed(bottom)} ${fixed(left + r)} ${fixed(bottom)} c h`
          ].join(" "), fill, stroke, width);
        },
        circle(cx, cy, r, fill, stroke, width) {
          const k = 0.5523 * r;
          const X = cx;
          const Y = H - cy;
          paint([
            `${fixed(X + r)} ${fixed(Y)} m`,
            `${fixed(X + r)} ${fixed(Y + k)} ${fixed(X + k)} ${fixed(Y + r)} ${fixed(X)} ${fixed(Y + r)} c`,
            `${fixed(X - k)} ${fixed(Y + r)} ${fixed(X - r)} ${fixed(Y + k)} ${fixed(X - r)} ${fixed(Y)} c`,
            `${fixed(X - r)} ${fixed(Y - k)} ${fixed(X - k)} ${fixed(Y - r)} ${fixed(X)} ${fixed(Y - r)} c`,
            `${fixed(X + k)} ${fixed(Y - r)} ${fixed(X + r)} ${fixed(Y - k)} ${fixed(X + r)} ${fixed(Y)} c h`
          ].join(" "), fill, stroke, width);
        },
        line(x1, y1, x2, y2, color, width) { ops.push(`${rgb(color)} RG ${fixed(width || 0.75)} w ${fixed(x1)} ${fixed(H - y1)} m ${fixed(x2)} ${fixed(H - y2)} l S`); },
        image(name, x, y, w, h) { used.add(name); ops.push(`q ${fixed(w)} 0 0 ${fixed(h)} ${fixed(x)} ${fixed(H - y - h)} cm /${name} Do Q`); },
        link(x, y, w, h, url) { links.push({ rect: [x, H - y - h, x + w, H - y], url }); }
      };
    }

    function finish() {
      const pageIds = pages.map((page) => {
        const content = page.ops.join("\n");
        const contentId = alloc();
        set(contentId, `<< /Length ${content.length} >>\nstream\n`, content, "\nendstream");
        const annotIds = page.links.map((entry) => {
          const id = alloc();
          set(id, `<< /Type /Annot /Subtype /Link /Rect [${entry.rect.map(fixed).join(" ")}] /Border [0 0 0] /A << /S /URI /URI ${pdfString(latin1(entry.url))} >> >>`);
          return id;
        });
        const xobjects = [...page.used].map((name) => `/${name} ${images.find((image) => image.name === name).id} 0 R`).join(" ");
        const pageId = alloc();
        set(pageId, `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 ${fontIds.F1} 0 R /F2 ${fontIds.F2} 0 R /F3 ${fontIds.F3} 0 R >>${xobjects ? ` /XObject << ${xobjects} >>` : ""} >> /Contents ${contentId} 0 R${annotIds.length ? ` /Annots [${annotIds.map((id) => `${id} 0 R`).join(" ")}]` : ""} >>`);
        return pageId;
      });
      set(pagesId, `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`);
      set(catalogId, `<< /Type /Catalog /Pages ${pagesId} 0 R /PageMode /UseNone >>`);
      const stamp = new Date().toISOString().replace(/[-:T]/g, "").replace(/\.\d+Z$/, "Z");
      set(infoId, `<< /Title ${pdfString(latin1(info.title))} /Subject ${pdfString(latin1(info.subject))} /Author ${pdfString(latin1(info.author))} /Creator ${pdfString(latin1("PPCC Know Before You Go"))} /Producer ${pdfString(latin1("PPCC Know Before You Go (local)"))} /CreationDate (D:${stamp}) >>`);
      const parts = [];
      let offset = 0;
      const offsets = [];
      const push = (chunk) => { const bytes = toBytes(chunk); parts.push(bytes); offset += bytes.length; };
      push("%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n");
      objects.forEach((chunks, index) => {
        offsets[index] = offset;
        push(`${index + 1} 0 obj\n`);
        chunks.forEach(push);
        push("\nendobj\n");
      });
      const startXref = offset;
      push(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((value) => `${String(value).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R /Info ${infoId} 0 R >>\nstartxref\n${startXref}\n%%EOF\n`);
      return new Blob(parts, { type: "application/pdf" });
    }
    return { W, H, addImage, addPage, finish };
  }

  const canvasToJpeg = (canvas, quality = 0.9) => new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) { reject(new Error("The map could not be encoded for the PDF.")); return; }
      resolve(new Uint8Array(await blob.arrayBuffer()));
    }, "image/jpeg", quality);
  });

  const metaText = (item, context) => {
    const parts = [context.placeText(item)];
    if (item.kind === "event") parts.push("Evening event");
    else {
      if (item.type && item.type !== "60-minute Session") parts.push(item.type);
      if (item.level) parts.push(item.level);
    }
    return parts.join("  \u00b7  ");
  };
  const altText = (pick) => pick.alt.length ? `Same time as ${pick.alt.map((n) => `#${n}`).join(", ")}: an alternative, not a conflict.` : "";

  async function makePdf(context) {
    const { data, days, picksByDay } = context;
    const maps = window.PPCC_MAPS;
    const pdf = createPdf({ title: "My PPCC 2026 agenda", subject: `${data.edition} agenda for the Power Platform Community Conference, ${data.conference.dates}`, author: "PPCC Know Before You Go (unofficial companion)" });
    const { W, H } = pdf;
    const MARGIN = 44;
    const CW = W - MARGIN * 2;
    const BOTTOM = H - 60;
    const TEXT_X = MARGIN + 32;
    const TEXT_W = CW - 32;
    const pages = [];
    let page;
    let y = 0;

    const totalPicks = [...picksByDay.values()].reduce((sum, list) => sum + list.length, 0);
    const sessionPicks = [...picksByDay.values()].flat().filter((pick) => pick.item.kind === "session").length;
    const eventPicks = totalPicks - sessionPicks;
    const activeDays = days.filter((day) => (picksByDay.get(day.date) || []).length);

    function startPage() {
      page = pdf.addPage();
      pages.push(page);
      if (pages.length === 1) {
        page.rect(0, 0, W, 112, COLORS.ink);
        for (let slice = 0; slice < 64; slice += 1) page.rect(slice * (W / 64), 112, W / 64 + 0.6, 5, mix(COLORS.magenta, COLORS.blue, slice / 63));
        page.text("POWER PLATFORM COMMUNITY CONFERENCE 2026", MARGIN, 38, { size: 8, weight: "bold", color: COLORS.mint, spacing: 1.2 });
        page.text("My conference agenda", MARGIN, 71, { size: 26, weight: "bold", color: COLORS.white });
        page.text(`${data.edition}  \u00b7  ${data.conference.dates}  \u00b7  ${data.conference.venue}`, MARGIN, 93, { size: 10, color: [205, 210, 230] });
        y = 146;
      } else {
        page.text("My PPCC 2026 agenda", MARGIN, 38, { size: 9, weight: "bold", color: COLORS.muted });
        page.line(MARGIN, 46, W - MARGIN, 46, COLORS.line);
        y = 68;
      }
    }
    const ensure = (height, continuation) => {
      if (y + height <= BOTTOM) return;
      startPage();
      if (continuation) {
        page.text(`${continuation} (continued)`, MARGIN, y, { size: 10, weight: "bold", color: COLORS.magenta });
        y += 18;
      }
    };

    startPage();
    page.text(`${totalPicks} ${totalPicks === 1 ? "item" : "items"} across ${activeDays.length} ${activeDays.length === 1 ? "day" : "days"}`, MARGIN, y, { size: 13, weight: "bold" });
    page.text(`${sessionPicks} ${sessionPicks === 1 ? "session" : "sessions"}${eventPicks ? `  \u00b7  ${eventPicks} evening ${eventPicks === 1 ? "event" : "events"}` : ""}`, W - MARGIN - measure(`${sessionPicks} ${sessionPicks === 1 ? "session" : "sessions"}${eventPicks ? `  \u00b7  ${eventPicks} evening ${eventPicks === 1 ? "event" : "events"}` : ""}`, 9.5), y, { size: 9.5, color: COLORS.muted });
    y += 17;
    wrap("Times are Pacific (Las Vegas). Numbers match the pins on each floor map. Items at the same time are alternatives, not conflicts: keep them and choose on the day. Rooms and times can change, so confirm them in Whova and the official agenda.", 8.8, "regular", CW).forEach((line) => { page.text(line, MARGIN, y, { size: 8.8, color: COLORS.muted }); y += 11.5; });
    y += 12;

    for (const day of activeDays) {
      const picks = picksByDay.get(day.date);
      const heading = `${day.weekday}  \u00b7  ${day.label}`;
      ensure(70, null);
      page.roundRect(MARGIN, y, CW, 26, 6, COLORS.panel);
      page.rect(MARGIN, y, 4, 26, COLORS.magenta);
      page.text(heading, MARGIN + 14, y + 17.5, { size: 12.5, weight: "bold" });
      const theme = `${day.theme}  \u00b7  ${picks.length} ${picks.length === 1 ? "item" : "items"}`;
      page.text(theme, W - MARGIN - 10 - measure(theme, 8.5), y + 16.5, { size: 8.5, color: COLORS.muted });
      y += 36;

      for (const pick of picks) {
        const item = pick.item;
        const titleLines = wrap(item.title, 10, "bold", TEXT_W);
        const metaLines = wrap(metaText(item, context), 8.6, "regular", TEXT_W);
        const techLines = item.tech.length ? wrap(`Technology: ${item.tech.join(", ")}`, 8.4, "bold", TEXT_W) : [];
        const speakerLines = item.speakers.length ? wrap(`Speakers: ${item.speakers.slice(0, 4).join(", ")}${item.speakers.length > 4 ? ` +${item.speakers.length - 4} more` : ""}`, 8.2, "regular", TEXT_W) : [];
        const alt = altText(pick);
        const height = 6 + 13 + titleLines.length * 12.6 + metaLines.length * 11 + techLines.length * 10.8 + speakerLines.length * 10.4 + (alt ? 11.5 : 0) + 9;
        ensure(height, heading);
        page.circle(MARGIN + 11, y + 14, 9.5, COLORS.ink);
        const number = String(pick.n);
        page.text(number, MARGIN + 11 - measure(number, 9, "bold") / 2, y + 17.2, { size: 9, weight: "bold", color: COLORS.white });
        let cursor = y + 11;
        page.text(context.whenText(item), TEXT_X, cursor, { size: 9, weight: "bold", color: COLORS.magenta });
        cursor += 13;
        const titleTop = cursor - 10;
        titleLines.forEach((line) => { page.text(line, TEXT_X, cursor, { size: 10, weight: "bold" }); cursor += 12.6; });
        page.link(TEXT_X, titleTop, Math.max(...titleLines.map((line) => measure(line, 10, "bold"))), titleLines.length * 12.6, item.sourceUrl);
        cursor -= 12.6 - 11;
        metaLines.forEach((line) => { page.text(line, TEXT_X, cursor, { size: 8.6, color: COLORS.muted }); cursor += 11; });
        techLines.forEach((line) => { page.text(line, TEXT_X, cursor, { size: 8.4, weight: "bold", color: COLORS.blue }); cursor += 10.8; });
        speakerLines.forEach((line) => { page.text(line, TEXT_X, cursor - 0.4, { size: 8.2, color: COLORS.soft }); cursor += 10.4; });
        if (alt) { page.text(alt, TEXT_X, cursor, { size: 8.2, weight: "italic", color: COLORS.teal }); cursor += 11.5; }
        page.line(MARGIN, y + height - 3, W - MARGIN, y + height - 3, COLORS.line, 0.5);
        y += height;
      }

      const mapLevels = context.levels.filter((levelId) => picks.some((pick) => context.levelOf(pick.item) === levelId));
      for (const levelId of mapLevels) {
        const pinned = picks.filter((pick) => context.levelOf(pick.item) === levelId).map((pick) => pick.n);
        const canvas = await context.mapCanvas(levelId, day.date, 640, 2.5);
        const imageWidth = Math.min(CW, levelId === "L3" ? 500 : 430);
        const imageHeight = imageWidth * canvas.height / canvas.width;
        ensure(imageHeight + 40, heading);
        y += 6;
        page.text(`${context.levelLabel(levelId)} map  \u00b7  ${day.weekday}  \u00b7  pins ${pinned.join(", ")}`, MARGIN, y + 8, { size: 9.5, weight: "bold", color: COLORS.ink });
        y += 15;
        const name = pdf.addImage(await canvasToJpeg(canvas, 0.9), canvas.width, canvas.height);
        page.roundRect(MARGIN, y, imageWidth + 8, imageHeight + 8, 6, COLORS.white, COLORS.line, 0.75);
        page.image(name, MARGIN + 4, y + 4, imageWidth, imageHeight);
        y += imageHeight + 18;
      }
      const offPlan = picks.filter((pick) => pick.item.loc?.kind === "offplan");
      if (offPlan.length) {
        const note = `MGM Grand Garden Arena (not on the Conference Center plans): ${offPlan.map((pick) => `#${pick.n} ${pick.item.title}, ${context.whenText(pick.item)}`).join("; ")}. Follow venue signage and check Whova.`;
        const lines = wrap(note, 8.6, "regular", CW);
        ensure(lines.length * 11 + 14, heading);
        lines.forEach((line) => { page.text(line, MARGIN, y + 8, { size: 8.6, color: COLORS.muted }); y += 11; });
        y += 6;
      }
      y += 10;
    }

    const research = data.research || {};
    const sources = [
      [`Session rooms and times: official PPCC sessions index, collected ${research.collectedAt || "October 19, 2026"}`, research.sourceUrl || "https://powerplatformconf.com/sessions"],
      ["Evening events and key places: official PPCC site and the organizer's October 15 schedule (PDF)", research.schedulePdf || "https://devintxcontent.blob.core.windows.net/showcontent/Schedule/PPCC-Schedule-2026-10-15.pdf"],
      ["Floor maps: simplified, not-to-scale schematics redrawn from the MGM Grand Conference Center plans", maps.sources.facilitiesGuide]
    ];
    ensure(24 + sources.length * 34, null);
    page.text("Sources and notes", MARGIN, y + 8, { size: 10, weight: "bold" });
    y += 22;
    sources.forEach(([label, url]) => {
      wrap(label, 8.4, "regular", CW).forEach((line) => { page.text(line, MARGIN, y, { size: 8.4, color: COLORS.muted }); y += 11; });
      wrap(url.replace(/^https?:\/\//, ""), 7.6, "regular", CW).forEach((line) => { page.text(line, MARGIN, y, { size: 7.6, color: COLORS.teal }); page.link(MARGIN, y - 8, Math.min(CW, measure(line, 7.6)), 10.5, url); y += 10; });
      y += 6;
    });

    pages.forEach((entry, index) => {
      entry.line(MARGIN, H - 44, W - MARGIN, H - 44, COLORS.line);
      entry.text("Unofficial planning companion for PPCC 2026. Confirm rooms and times in Whova and the official agenda.", MARGIN, H - 30, { size: 7.5, color: COLORS.soft });
      const label = `Page ${index + 1} of ${pages.length}`;
      entry.text(label, W - MARGIN - measure(label, 7.5), H - 30, { size: 7.5, color: COLORS.soft });
    });
    return pdf.finish();
  }

  // ---------- PNG of one day's maps with a numbered key ----------
  function canvasFont(weight, size) {
    const montserrat = document.fonts && [...document.fonts].some((face) => face.family.replace(/["']/g, "") === "Montserrat" && face.status === "loaded");
    return `${weight} ${size}px ${montserrat ? "Montserrat, " : ""}'Segoe UI', 'Helvetica Neue', Arial, sans-serif`;
  }
  function wrapCanvas(context, text, font, maxWidth) {
    context.font = font;
    const lines = [];
    let line = "";
    String(text).split(/\s+/).filter(Boolean).forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (context.measureText(candidate).width <= maxWidth || !line) line = candidate;
      else { lines.push(line); line = word; }
    });
    if (line) lines.push(line);
    return lines.length ? lines : [""];
  }
  const css = (color) => `rgb(${color.join(",")})`;

  async function makeDayPng(context, date) {
    const picks = context.picksByDay.get(date) || [];
    if (!picks.length) throw new Error("Add something to this day before exporting its map.");
    if (document.fonts?.ready) await document.fonts.ready;
    const day = context.dayOf(date);
    const scale = 2;
    const W = 1200;
    const PAD = 44;
    const scratch = document.createElement("canvas").getContext("2d");
    const levels = context.levels.filter((levelId) => picks.some((pick) => context.levelOf(pick.item) === levelId));
    const maps = [];
    for (const levelId of levels) {
      const canvas = await context.mapCanvas(levelId, date, 1120, 2);
      const aspect = canvas.height / canvas.width;
      const width = Math.min(W - PAD * 2, 540 / aspect);
      maps.push({ levelId, canvas, width, height: width * aspect });
    }
    const keyWidth = W - PAD * 2 - 50;
    const rows = picks.map((pick) => ({ pick, title: wrapCanvas(scratch, pick.item.title, canvasFont(700, 16), keyWidth), meta: wrapCanvas(scratch, `${metaText(pick.item, context)}${altText(pick) ? `  \u00b7  ${altText(pick)}` : ""}`, canvasFont(500, 13), keyWidth), tech: pick.item.tech.length ? wrapCanvas(scratch, `Technology: ${pick.item.tech.join(", ")}`, canvasFont(700, 13), keyWidth) : [] }));
    const rowHeight = (row) => 14 + 20 + row.title.length * 21 + row.meta.length * 17 + row.tech.length * 17 + 8;
    let height = 128 + 28;
    maps.forEach((entry) => { height += 34 + entry.height + 26; });
    height += 40 + rows.reduce((sum, row) => sum + rowHeight(row), 0) + 62;

    const canvas = document.createElement("canvas");
    canvas.width = W * scale;
    canvas.height = Math.ceil(height * scale);
    const g = canvas.getContext("2d");
    g.scale(scale, scale);
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, W, height);
    g.fillStyle = css(COLORS.ink);
    g.fillRect(0, 0, W, 112);
    const bar = g.createLinearGradient(0, 0, W, 0);
    bar.addColorStop(0, css(COLORS.magenta));
    bar.addColorStop(1, css(COLORS.blue));
    g.fillStyle = bar;
    g.fillRect(0, 112, W, 6);
    g.textBaseline = "alphabetic";
    g.fillStyle = css(COLORS.mint);
    g.font = canvasFont(800, 12);
    if ("letterSpacing" in g) g.letterSpacing = "2px";
    g.fillText("POWER PLATFORM COMMUNITY CONFERENCE 2026", PAD, 38);
    if ("letterSpacing" in g) g.letterSpacing = "0px";
    g.fillStyle = "#ffffff";
    g.font = canvasFont(800, 32);
    g.fillText(`My agenda: ${day.weekday}, ${day.label}`, PAD, 78);
    g.fillStyle = "rgb(205,210,230)";
    g.font = canvasFont(500, 14);
    g.fillText(`${context.data.edition}  \u00b7  ${context.data.conference.venue}  \u00b7  Times are Pacific`, PAD, 100);

    let y = 148;
    for (const entry of maps) {
      const pinned = picks.filter((pick) => context.levelOf(pick.item) === entry.levelId).map((pick) => pick.n);
      g.fillStyle = css(COLORS.ink);
      g.font = canvasFont(800, 16);
      g.fillText(`${context.levelLabel(entry.levelId)} \u00b7 pins ${pinned.join(", ")}`, PAD, y + 8);
      y += 22;
      const x = (W - entry.width) / 2;
      g.strokeStyle = css(COLORS.line);
      g.lineWidth = 1;
      g.strokeRect(x - 6, y - 6, entry.width + 12, entry.height + 12);
      g.drawImage(entry.canvas, x, y, entry.width, entry.height);
      y += entry.height + 36;
    }
    g.fillStyle = css(COLORS.ink);
    g.font = canvasFont(800, 18);
    g.fillText("Your day, in order", PAD, y + 4);
    y += 26;
    rows.forEach((row) => {
      g.fillStyle = css(COLORS.line);
      g.fillRect(PAD, y, W - PAD * 2, 1);
      y += 14;
      g.fillStyle = css(COLORS.ink);
      g.beginPath();
      g.arc(PAD + 15, y + 12, 14, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#ffffff";
      g.font = canvasFont(800, 13);
      g.textAlign = "center";
      g.fillText(String(row.pick.n), PAD + 15, y + 17);
      g.textAlign = "left";
      let line = y + 12;
      g.fillStyle = css(COLORS.magenta);
      g.font = canvasFont(800, 13);
      g.fillText(context.whenText(row.pick.item), PAD + 50, line);
      line += 22;
      g.fillStyle = css(COLORS.ink);
      g.font = canvasFont(700, 16);
      row.title.forEach((text) => { g.fillText(text, PAD + 50, line); line += 21; });
      line -= 4;
      g.fillStyle = css(COLORS.muted);
      g.font = canvasFont(500, 13);
      row.meta.forEach((text) => { g.fillText(text, PAD + 50, line); line += 17; });
      g.fillStyle = css(COLORS.blue);
      g.font = canvasFont(700, 13);
      row.tech.forEach((text) => { g.fillText(text, PAD + 50, line); line += 17; });
      y += rowHeight(row) - 14;
    });
    g.fillStyle = css(COLORS.soft);
    g.font = canvasFont(500, 12);
    g.fillText("Unofficial planning companion for PPCC 2026. Floor maps are simplified and not to scale. Confirm rooms and times in Whova and the official agenda.", PAD, height - 26);
    return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("The map image could not be saved."))), "image/png"));
  }

  // ---------- Calendar file ----------
  const icsEscape = (text) => String(text ?? "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
  function icsFold(line) {
    const encoder = new TextEncoder();
    const parts = [];
    let current = "";
    for (const character of line) {
      if (encoder.encode(current + character).length > (parts.length ? 74 : 75)) { parts.push(current); current = character; } else current += character;
    }
    parts.push(current);
    return parts.map((part, index) => (index ? ` ${part}` : part)).join("\r\n");
  }
  function icsText(context) {
    const offset = /([+-]\d\d:\d\d)$/.exec(context.data.conference.start)?.[1] || "-07:00";
    const toUtc = (date, time) => new Date(`${date}T${time}:00${offset}`).toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//PPCC Know Before You Go//Agenda//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:My PPCC 2026 agenda"];
    [...context.picksByDay.values()].flat().forEach((pick) => {
      const item = pick.item;
      if (!item.start) return;
      const end = item.end || item.start;
      const notes = [item.kind === "event" ? "Evening event" : item.type, item.kind === "event" ? item.description : "", item.tech.length ? `Technology: ${item.tech.join(", ")}` : "", item.speakers.length ? `Speakers: ${item.speakers.join(", ")}` : "", altText(pick), `Details: ${item.sourceUrl}`, "Times are Pacific. Confirm rooms and times in Whova and the official agenda."].filter(Boolean).join("\n");
      lines.push("BEGIN:VEVENT", `UID:${item.id}@ppcc-know-before-you-go.local`, `DTSTAMP:${stamp}`, `DTSTART:${toUtc(item.date, item.start)}`, `DTEND:${toUtc(item.date, end)}`, `SUMMARY:${icsEscape(item.title)}`, `LOCATION:${icsEscape(context.placeText(item))}`, `DESCRIPTION:${icsEscape(notes)}`, `URL:${item.sourceUrl}`, "END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    return `${lines.map(icsFold).join("\r\n")}\r\n`;
  }

  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = "noopener";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 15000);
  }

  window.PPCC_EXPORT = {
    makePdf,
    makeDayPng,
    makeIcs: (context) => new Blob([icsText(context)], { type: "text/calendar;charset=utf-8" }),
    icsText,
    download
  };
})();
