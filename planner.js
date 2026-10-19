"use strict";

// On the Ground: floor maps, session picker, agenda list and exports.
// Sessions and evening events share one agenda store (window.PPCC.agenda); the map follows every change.
(() => {
  const P = window.PPCC;
  const M = window.PPCC_MAPS;
  if (!P || !M) throw new Error("planner.js needs app.js and maps.js to load first.");
  const { data, items, itemById, agenda, byId, node, timeText, compactRange, dayOf } = P;
  const SVG_NS = "http://www.w3.org/2000/svg";
  const days = data.days;

  const PALETTES = {
    dark: {
      font: "Montserrat, 'Segoe UI', system-ui, sans-serif", bg: null,
      corridorFill: "rgba(255,255,255,.045)", corridorStroke: "rgba(255,255,255,.10)",
      blockFill: "rgba(255,255,255,.03)", blockStroke: "rgba(255,255,255,.18)", groupText: "#8d95b0",
      cellFill: "rgba(255,255,255,.065)", cellStroke: "rgba(255,255,255,.17)", cellText: "#8189a8",
      recFill: "rgba(227,169,232,.24)", recStroke: "rgba(227,169,232,.85)", recText: "#f7e8f9",
      topFill: "rgba(47,255,224,.18)", topStroke: "#2fffe0", topText: "#e9fffb",
      pickFill: ["#c000c8", "#2f6df0"], pickStroke: "#ffffff", pickText: "#ffffff", selected: "#ffffff",
      badgeFill: "#ffffff", badgeText: "#090d1b", badgeStroke: "#c000c8",
      zoneFill: "rgba(47,255,224,.06)", zoneStroke: "rgba(47,255,224,.6)", zoneText: "#2fffe0", zoneSub: "#b6bad0",
      contextFill: "rgba(255,255,255,.025)", contextStroke: "rgba(255,255,255,.09)", contextText: "#6d7595"
    },
    light: {
      font: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif", bg: "#ffffff",
      corridorFill: "#f4f1e9", corridorStroke: "#ddd7c8",
      blockFill: "#fbfbfe", blockStroke: "#c3c9de", groupText: "#566083",
      cellFill: "#eceff8", cellStroke: "#bcc3dc", cellText: "#667090",
      recFill: "#f5dff7", recStroke: "#b45fbb", recText: "#4a1650",
      topFill: "#d3faf4", topStroke: "#0ca391", topText: "#064a42",
      pickFill: ["#b100b8", "#2f6df0"], pickStroke: "#1b1f4b", pickText: "#ffffff", selected: "#1b1f4b",
      badgeFill: "#090d1b", badgeText: "#ffffff", badgeStroke: "#ffffff",
      zoneFill: "#e6fbf8", zoneStroke: "#0ca391", zoneText: "#075e53", zoneSub: "#4b5578",
      contextFill: "#f4f5fa", contextStroke: "#d5d9e8", contextText: "#9aa1bb"
    }
  };

  const svgEl = (tag, attributes, text) => {
    const element = document.createElementNS(SVG_NS, tag);
    Object.entries(attributes || {}).forEach(([name, value]) => element.setAttribute(name, String(value)));
    if (text !== undefined && text !== null) element.textContent = text;
    return element;
  };
  const pushTo = (map, key, value) => { if (map.has(key)) map.get(key).push(value); else map.set(key, [value]); };

  const startOf = (item) => item.start || "99:99";
  const compare = (a, b) => a.date.localeCompare(b.date) || startOf(a).localeCompare(startOf(b)) || (a.end || "99:99").localeCompare(b.end || "99:99") || a.title.localeCompare(b.title);
  const overlaps = (a, b) => a.date === b.date && Boolean(a.start && a.end && b.start && b.end) && a.start < b.end && b.start < a.end;
  const itemsOn = (date) => items.filter((item) => item.date === date).sort(compare);
  const whenText = (item) => item.start ? (item.end ? compactRange(item.start, item.end) : timeText(item.start)) : "Time to be confirmed";
  const placeText = (item) => item.loc ? (item.loc.kind === "offplan" ? item.loc.name : `${item.loc.name} \u00b7 ${item.loc.levelLabel}`) : (item.room || "Location to be confirmed");

  // Picks for a day in time order, numbered 1..n. Overlapping picks are alternatives, never errors.
  function picksOn(date) {
    const chosen = itemsOn(date).filter((item) => agenda.has(item.id));
    const picks = chosen.map((item, index) => ({ item, n: index + 1, alt: [] }));
    picks.forEach((pick) => { pick.alt = picks.filter((other) => other !== pick && overlaps(pick.item, other.item)).map((other) => other.n); });
    return picks;
  }

  function bestLevel(date) {
    const tally = (list) => M.levels.map((level) => [level.id, list.filter((item) => item.loc?.level === level.id).length]).sort((a, b) => b[1] - a[1]);
    const picked = tally(picksOn(date).map((pick) => pick.item));
    if (picked[0][1]) return picked[0][0];
    const all = tally(itemsOn(date));
    return all[0][1] ? all[0][0] : M.levels[0].id;
  }
  function initialDay() {
    const first = items.filter((item) => agenda.has(item.id) && dayOf(item.date)).sort(compare)[0];
    if (first) return first.date;
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: data.conference.timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(Date.now());
    return days.some((day) => day.date === today) ? today : days[0].date;
  }

  const els = {
    planner: byId("planner"), days: byId("planner-days"), levels: byId("planner-levels"), mapWrap: byId("map-wrap"), mapCard: document.querySelector(".map-card"),
    legend: byId("map-legend"), details: byId("room-details"), offplan: byId("map-offplan"), picker: byId("picker"), agendaList: byId("agenda-list"),
    agendaCount: byId("agenda-count"), clear: byId("planner-clear"), recommended: byId("map-recommended"), dayLabel: byId("map-day-label"),
    exportPdf: byId("export-pdf"), exportPng: byId("export-png"), exportIcs: byId("export-ics"), exportHint: byId("export-hint"), agendaTitle: byId("agenda-card-title")
  };
  const live = node("div", "visually-hidden");
  live.setAttribute("role", "status");
  live.setAttribute("aria-live", "polite");
  els.planner.append(live);
  els.agendaTitle.tabIndex = -1;
  const announce = (message) => { live.textContent = ""; window.setTimeout(() => { live.textContent = message; }, 40); };

  const state = { day: initialDay(), level: null, showRecommended: true, selected: null, flash: null };
  state.level = bestLevel(state.day);
  let pendingFocus = null;

  // ---------- Floor map ----------
  const labelSize = (box, text) => Math.max(5.2, Math.min(10.5, (box.w - 5) / (text.length * 0.64), box.h * 0.5));

  // Builds one level as an SVG element. Interactive for the page; self-contained (no CSS) for image export.
  function buildMap(levelId, options) {
    const level = M.level(levelId);
    const pal = options.palette;
    const uid = options.uid;
    const { x, y, w, h } = level.view;
    const svg = svgEl("svg", { viewBox: `${x} ${y} ${w} ${h}`, "font-family": pal.font });
    if (options.size) { svg.setAttribute("width", options.size.width); svg.setAttribute("height", options.size.height); }
    else { svg.setAttribute("preserveAspectRatio", "xMidYMid meet"); svg.setAttribute("class", "floor-map"); }
    svg.setAttribute("role", options.interactive ? "group" : "img");
    svg.setAttribute("aria-label", `${level.label} floor map: ${level.title}`);
    const gradient = svgEl("linearGradient", { id: `${uid}-pick`, x1: 0, y1: 0, x2: 1, y2: 1 });
    gradient.append(svgEl("stop", { offset: 0, "stop-color": pal.pickFill[0] }), svgEl("stop", { offset: 1, "stop-color": pal.pickFill[1] }));
    const defs = svgEl("defs");
    defs.append(gradient);
    svg.append(defs);
    if (pal.bg) svg.append(svgEl("rect", { x, y, width: w, height: h, fill: pal.bg }));

    const recommendedBy = new Map();
    itemsOn(options.day).forEach((item) => { if (item.loc?.level === level.id) pushTo(recommendedBy, item.loc.key, item); });
    const pickedBy = new Map();
    options.picks.forEach((pick) => { if (pick.item.loc?.level === level.id) pushTo(pickedBy, pick.item.loc.key, pick); });

    const styleFor = (key) => {
      if (pickedBy.has(key)) return { kind: "pick", fill: `url(#${uid}-pick)`, stroke: pal.pickStroke, width: 1.4, text: pal.pickText };
      const recommended = options.showRecommended ? recommendedBy.get(key) : null;
      if (recommended?.length) {
        return recommended.some((item) => item.featured)
          ? { kind: "top", fill: pal.topFill, stroke: pal.topStroke, width: 1.3, text: pal.topText }
          : { kind: "rec", fill: pal.recFill, stroke: pal.recStroke, width: 1.1, text: pal.recText };
      }
      return { kind: "plain", fill: pal.cellFill, stroke: pal.cellStroke, width: 0.8, text: pal.cellText };
    };
    const isLive = (key) => options.interactive && (pickedBy.has(key) || (options.showRecommended && recommendedBy.has(key)));
    const describe = (key) => {
      const target = M.describe(key);
      const picked = pickedBy.get(key)?.length || 0;
      const recommended = recommendedBy.get(key)?.length || 0;
      return [`${target.name}, ${target.levelLabel}`, picked ? `${picked} in your agenda` : "", recommended ? `${recommended} ${recommended === 1 ? "recommendation" : "recommendations"} on ${dayOf(options.day)?.weekday || "this day"}` : ""].filter(Boolean).join(". ");
    };
    const interactiveGroup = (key) => {
      const style = styleFor(key);
      const selected = options.selectedKey === key;
      const active = isLive(key);
      const group = svgEl("g", { class: `map-cell kind-${style.kind}${active ? " is-live" : ""}${selected ? " is-selected" : ""}${options.flashKey === key ? " is-flash" : ""}`, "data-key": key });
      if (active) {
        group.setAttribute("tabindex", "0");
        group.setAttribute("role", "button");
        group.setAttribute("aria-pressed", String(selected));
        group.setAttribute("aria-label", `${describe(key)}. Select to list them.`);
        group.dataset.focus = `cell:${key}`;
        group.append(svgEl("title", {}, describe(key)));
      } else group.setAttribute("aria-hidden", "true");
      return { group, style, selected };
    };

    svg.append(svgEl("rect", { x: level.corridor.x, y: level.corridor.y, width: level.corridor.w, height: level.corridor.h, rx: 14, fill: pal.corridorFill, stroke: pal.corridorStroke, "stroke-width": 0.8 }));

    level.zones.filter((zone) => zone.kind === "context").forEach((zone) => {
      svg.append(svgEl("rect", { x: zone.x, y: zone.y, width: zone.w, height: zone.h, rx: 9, fill: pal.contextFill, stroke: pal.contextStroke, "stroke-width": 0.8 }));
      svg.append(svgEl("text", { x: zone.x + zone.w / 2, y: zone.y + zone.h / 2, dy: ".35em", "text-anchor": "middle", "font-size": 6.4, "font-weight": 700, "letter-spacing": 0.8, fill: pal.contextText }, zone.name.toUpperCase()));
    });
    level.blocks.forEach((block) => {
      svg.append(svgEl("rect", { x: block.x, y: block.y, width: block.w, height: block.h, rx: 5, fill: pal.blockFill, stroke: pal.blockStroke, "stroke-width": 0.8, "stroke-dasharray": "3 2" }));
      if (block.label) svg.append(svgEl("text", { x: block.labelAt[0], y: block.labelAt[1] - 5, "text-anchor": "middle", "font-size": 6.4, "font-weight": 700, "letter-spacing": 0.9, fill: pal.groupText }, block.label));
    });
    level.cells.forEach((cell) => {
      const { group, style, selected } = interactiveGroup(cell.key);
      group.append(svgEl("rect", { x: cell.x + 0.7, y: cell.y + 0.7, width: cell.w - 1.4, height: cell.h - 1.4, rx: 2.6, fill: style.fill, stroke: selected ? pal.selected : style.stroke, "stroke-width": selected ? 2.2 : style.width }));
      group.append(svgEl("text", { x: cell.x + cell.w / 2, y: cell.y + cell.h / 2, dy: ".35em", "text-anchor": "middle", "font-size": labelSize(cell, cell.label).toFixed(2), "font-weight": style.kind === "plain" ? 600 : 700, fill: style.text, "pointer-events": "none" }, cell.label));
      svg.append(group);
    });
    level.zones.filter((zone) => zone.kind === "key").forEach((zone) => {
      const { group, style, selected } = interactiveGroup(zone.key);
      const highlighted = style.kind !== "plain";
      group.append(svgEl("rect", { x: zone.x, y: zone.y, width: zone.w, height: zone.h, rx: 8, fill: highlighted ? style.fill : pal.zoneFill, stroke: selected ? pal.selected : (highlighted ? style.stroke : pal.zoneStroke), "stroke-width": selected ? 2.2 : (highlighted ? 1.4 : 1), "stroke-dasharray": highlighted ? "0" : "4 3" }));
      const big = zone.w * zone.h > 6000;
      const lines = zone.sub ? [[zone.name.toUpperCase(), big ? 10 : 7, 800, highlighted ? style.text : pal.zoneText], [zone.sub, big ? 7.6 : 5.8, 600, highlighted ? style.text : pal.zoneSub]] : [[zone.name.toUpperCase(), big ? 10 : 7, 800, highlighted ? style.text : pal.zoneText]];
      lines.forEach(([text, size, weight, fill], index) => group.append(svgEl("text", { x: zone.x + zone.w / 2, y: zone.y + zone.h / 2 + (index - (lines.length - 1) / 2) * (big ? 13 : 10), dy: ".35em", "text-anchor": "middle", "font-size": size, "font-weight": weight, "letter-spacing": index ? 0.2 : 0.7, fill, "pointer-events": "none" }, text)));
      svg.append(group);
    });

    const pins = svgEl("g", { class: "map-pins", "pointer-events": "none" });
    pickedBy.forEach((list, key) => {
      const target = M.describe(key);
      const box = target.kind === "cell" ? target.cell : target.zone;
      list.slice(0, 4).forEach((pick, index) => {
        const pin = svgEl("g", { class: "map-pin", transform: `translate(${(box.x + box.w / 2 + (index - (Math.min(list.length, 4) - 1) / 2) * 15).toFixed(2)} ${box.y.toFixed(2)})` });
        pin.append(svgEl("circle", { r: 7.2, fill: pal.badgeFill, stroke: pal.badgeStroke, "stroke-width": 1.5 }), svgEl("text", { dy: ".35em", "text-anchor": "middle", "font-size": pick.n > 9 ? 7 : 8.6, "font-weight": 800, fill: pal.badgeText }, String(pick.n)));
        pins.append(pin);
      });
    });
    svg.append(pins);
    return svg;
  }

  // Renders a day's map (light theme, picks only) to a canvas for PDF and PNG export.
  async function mapToCanvas(levelId, date, widthPx, scale = 2) {
    const level = M.level(levelId);
    const width = Math.round(widthPx * scale);
    const height = Math.round(widthPx * (level.view.h / level.view.w) * scale);
    const svg = buildMap(levelId, { palette: PALETTES.light, day: date, picks: picksOn(date), showRecommended: false, selectedKey: null, interactive: false, uid: "export", size: { width, height } });
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml;charset=utf-8" }));
    try {
      const image = new Image();
      await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = () => reject(new Error("The map image could not be drawn.")); image.src = url; });
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      context.fillStyle = PALETTES.light.bg;
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      return canvas;
    } finally { URL.revokeObjectURL(url); }
  }

  // ---------- Rendering ----------
  const focusToken = (element, token) => { element.dataset.focus = token; return element; };

  function renderDays() {
    els.days.replaceChildren();
    days.forEach((day) => {
      const picked = picksOn(day.date).length;
      const button = node("button", "day-tab");
      button.type = "button";
      button.setAttribute("aria-pressed", String(day.date === state.day));
      focusToken(button, `day:${day.date}`);
      button.append(node("span", "day-tab-name", `${day.weekday.slice(0, 3)} ${day.label}`), node("span", "day-tab-sub", picked ? `${picked} in your agenda` : `${itemsOn(day.date).length} options`));
      button.addEventListener("click", () => { state.day = day.date; state.selected = null; state.flash = null; state.level = bestLevel(day.date); renderAll(); });
      els.days.append(button);
    });
  }

  function renderLevels() {
    els.levels.replaceChildren();
    const picks = picksOn(state.day);
    M.levels.forEach((level) => {
      const count = picks.filter((pick) => pick.item.loc?.level === level.id).length;
      const button = node("button", "level-tab");
      button.type = "button";
      button.setAttribute("aria-pressed", String(level.id === state.level));
      focusToken(button, `level:${level.id}`);
      button.append(node("span", "", level.label));
      if (count) button.append(node("span", "level-count", String(count)));
      button.addEventListener("click", () => { state.level = level.id; state.selected = null; state.flash = null; renderAll(); });
      els.levels.append(button);
    });
  }

  function renderMap() {
    const picks = picksOn(state.day);
    const svg = buildMap(state.level, { palette: PALETTES.dark, day: state.day, picks, showRecommended: state.showRecommended, selectedKey: state.selected, flashKey: state.flash, interactive: true, uid: "live" });
    els.mapWrap.replaceChildren(svg);
    const day = dayOf(state.day);
    els.dayLabel.textContent = `${day.weekday}, ${day.label} \u00b7 ${M.level(state.level).title}`;
    svg.querySelectorAll(".is-live").forEach((target) => {
      target.addEventListener("click", () => selectKey(target.dataset.key));
      target.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectKey(target.dataset.key); }
      });
    });
    state.flash = null;
    // On narrow screens the map scrolls sideways: bring the selected (or first picked) room into view.
    window.requestAnimationFrame(() => {
      const wrap = els.mapWrap;
      if (wrap.scrollWidth <= wrap.clientWidth) return;
      const focusKey = state.selected || picks.find((pick) => pick.item.loc?.level === state.level)?.item.loc.key;
      const target = focusKey ? M.describe(focusKey) : null;
      const box = target && target.level === state.level ? (target.cell || target.zone) : null;
      if (!box) return;
      const view = M.level(state.level).view;
      wrap.scrollLeft = Math.max(0, 10 + (box.x + box.w / 2 - view.x) * (svg.getBoundingClientRect().width / view.w) - wrap.clientWidth / 2);
    });
  }

  function selectKey(key) {
    state.selected = state.selected === key ? null : key;
    renderAll();
  }

  function toggleButton(item, compactLabels) {
    const on = agenda.has(item.id);
    const button = node("button", `pick-add${on ? " is-on" : ""}`, on ? (compactLabels ? "\u2713 Added" : "\u2713 In your agenda") : (compactLabels ? "+ Add" : "+ Add to agenda"));
    button.type = "button";
    button.setAttribute("aria-pressed", String(on));
    button.setAttribute("aria-label", `${on ? "Remove from" : "Add to"} your agenda: ${item.title}`);
    focusToken(button, `pick:${item.id}`);
    button.addEventListener("click", () => agenda.toggle(item.id, "planner"));
    return button;
  }

  function detailRow(item) {
    const pick = picksOn(item.date).find((entry) => entry.item.id === item.id);
    const row = node("li", `details-row${pick ? " is-picked" : ""}`);
    const text = node("div", "details-row-body");
    text.append(node("span", "pick-time", whenText(item)), node("span", "details-row-title", item.title));
    row.append(text, toggleButton(item, true));
    return row;
  }

  function renderDetails() {
    const box = els.details;
    box.replaceChildren();
    const target = state.selected ? M.describe(state.selected) : null;
    if (!target) {
      box.append(node("p", "details-hint", "Select a highlighted room to list its sessions, or add sessions from the list. Your picks appear on the map in time order."));
      return;
    }
    const head = node("div", "details-head");
    const clear = node("button", "text-button", "Clear selection");
    clear.type = "button";
    clear.addEventListener("click", () => { state.selected = null; renderAll(); });
    head.append(node("div", "details-title", ""), clear);
    head.firstChild.append(node("h4", "", target.name), node("span", "details-level", target.levelLabel));
    box.append(head);
    const here = itemsOn(state.day).filter((item) => item.loc?.key === state.selected);
    if (here.length) {
      const list = node("ul", "details-list");
      here.forEach((item) => list.append(detailRow(item)));
      box.append(list);
    } else box.append(node("p", "details-hint", `No recommended sessions here on ${dayOf(state.day).weekday}.`));
    const elsewhere = days.filter((day) => day.date !== state.day).map((day) => [day, items.filter((item) => item.date === day.date && item.loc?.key === state.selected).length]).filter(([, count]) => count);
    if (elsewhere.length) {
      const line = node("p", "details-other", "Also used on ");
      elsewhere.forEach(([day, count], index) => {
        const button = node("button", "text-button", `${day.weekday.slice(0, 3)} (${count})`);
        button.type = "button";
        focusToken(button, `jump:${day.date}`);
        button.addEventListener("click", () => { state.day = day.date; state.level = target.level || state.level; renderAll(); });
        line.append(index ? ", " : "", button);
      });
      box.append(line);
    }
  }

  function renderOffplan() {
    const here = itemsOn(state.day).filter((item) => item.loc?.kind === "offplan");
    els.offplan.hidden = !here.length;
    els.offplan.replaceChildren();
    if (!here.length) return;
    const button = node("button", `offplan-button${state.selected === "offplan:arena" ? " is-selected" : ""}`);
    button.type = "button";
    focusToken(button, "offplan");
    button.append(node("b", "", "MGM Grand Garden Arena"), node("span", "", ` is not on the Conference Center plans. Today's pick: ${here.map((item) => `${item.title} (${timeText(item.start)})`).join("; ")}`));
    button.addEventListener("click", () => selectKey("offplan:arena"));
    els.offplan.append(button);
  }

  function renderLegend() {
    els.legend.replaceChildren();
    [["swatch-top", "Top pick"], ["swatch-rec", "Recommended"], ["swatch-pick", "Your picks (numbered)"], ["swatch-plain", "Other rooms"], ["swatch-key", "Key place"]].forEach(([className, label]) => {
      const entry = node("li");
      entry.append(node("span", `swatch ${className}`), label);
      els.legend.append(entry);
    });
  }

  function pickRow(item, pick) {
    const row = node("li", `pick-row${pick ? " is-picked" : ""}${item.featured && item.kind === "session" ? " is-top" : ""}${item.kind === "event" ? " is-event" : ""}`);
    const seq = node("span", "pick-seq", pick ? String(pick.n) : "");
    seq.setAttribute("aria-hidden", "true");
    const body = node("div", "pick-body");
    const top = node("div", "pick-top");
    top.append(node("span", "pick-time", whenText(item)));
    if (item.kind === "event") top.append(node("span", "chip chip-event", "Evening event"));
    else {
      if (item.type && item.type !== "60-minute Session") top.append(node("span", "chip", item.type));
      if (item.featured) top.append(node("span", "chip chip-top", "Top pick"));
    }
    const meta = node("div", "pick-meta");
    if (item.loc && item.loc.kind !== "offplan") {
      const room = node("button", "pick-room", placeText(item));
      room.type = "button";
      room.setAttribute("aria-label", `Show ${item.loc.name} on the ${item.loc.levelLabel} map`);
      focusToken(room, `room:${item.id}`);
      room.addEventListener("click", () => focusItem(item.id));
      meta.append(room);
    } else meta.append(node("span", "pick-room-static", placeText(item)));
    if (pick?.alt.length) meta.append(node("span", "pick-alt", `Same time as ${pick.alt.map((n) => `#${n}`).join(", ")}: an alternative, not a conflict`));
    body.append(top, node("p", "pick-title", item.title));
    if (item.tech.length) {
      const technology = node("p", "pick-tech");
      technology.append(node("b", "", "Technology: "), item.tech.join(" \u00b7 "));
      body.append(technology);
    }
    body.append(meta);
    row.append(seq, body, toggleButton(item, false));
    return row;
  }

  function renderPicker() {
    els.picker.replaceChildren();
    const list = itemsOn(state.day);
    const picks = new Map(picksOn(state.day).map((pick) => [pick.item.id, pick]));
    const slots = new Map();
    list.forEach((item) => pushTo(slots, item.start || "tbc", item));
    slots.forEach((group, start) => {
      const section = node("section", "picker-group");
      const head = node("h4", "picker-group-head");
      head.append(node("span", "", start === "tbc" ? "Time to be confirmed" : timeText(start)), node("small", "", group.length > 1 ? `${group.length} options start here` : "1 option"));
      const ul = node("ul", "picker-list");
      group.forEach((item) => ul.append(pickRow(item, picks.get(item.id))));
      section.append(head, ul);
      els.picker.append(section);
    });
  }

  function renderAgendaList() {
    els.agendaList.replaceChildren();
    const chosen = items.filter((item) => agenda.has(item.id));
    const sessionCount = chosen.filter((item) => item.kind === "session").length;
    const eventCount = chosen.length - sessionCount;
    els.agendaCount.textContent = chosen.length ? [sessionCount ? `${sessionCount} ${sessionCount === 1 ? "session" : "sessions"}` : "", eventCount ? `${eventCount} evening ${eventCount === 1 ? "event" : "events"}` : ""].filter(Boolean).join(" + ") : "Nothing added yet";
    els.clear.hidden = !chosen.length;
    if (!chosen.length) {
      els.agendaList.append(node("p", "agenda-empty", "Your agenda is empty. Add sessions from the list, or select a highlighted room on the map and add what is happening there."));
      return;
    }
    days.forEach((day) => {
      const picks = picksOn(day.date);
      if (!picks.length) return;
      const section = node("section", "agenda-day");
      const head = node("h4", "agenda-day-head");
      head.append(node("span", "", `${day.weekday} \u00b7 ${day.label}`), node("small", "", `${picks.length} ${picks.length === 1 ? "item" : "items"}`));
      const list = node("ul", "agenda-items");
      picks.forEach((pick) => {
        const row = node("li", "agenda-row");
        const seq = node("span", "pick-seq", String(pick.n));
        seq.setAttribute("aria-hidden", "true");
        const body = node("div", "agenda-row-body");
        const title = node("button", "agenda-row-title", pick.item.title);
        title.type = "button";
        title.setAttribute("aria-label", `${pick.n}. ${pick.item.title}. Show on the map.`);
        focusToken(title, `agenda-title:${pick.item.id}`);
        title.addEventListener("click", () => focusItem(pick.item.id));
        body.append(node("span", "pick-time", whenText(pick.item)), title, node("span", "agenda-row-meta", `${placeText(pick.item)}${pick.alt.length ? ` \u00b7 Alternative to ${pick.alt.map((n) => `#${n}`).join(", ")}` : ""}`));
        const remove = node("button", "agenda-remove", "\u00d7");
        remove.type = "button";
        remove.setAttribute("aria-label", `Remove from your agenda: ${pick.item.title}`);
        focusToken(remove, `agenda-remove:${pick.item.id}`);
        remove.addEventListener("click", () => agenda.set(pick.item.id, false, "planner"));
        row.append(seq, body, remove);
        list.append(row);
      });
      section.append(head, list);
      els.agendaList.append(section);
    });
  }

  function setHint(message, isError = false) {
    els.exportHint.textContent = message;
    els.exportHint.classList.toggle("is-error", isError);
  }
  function renderExportState() {
    const total = items.filter((item) => agenda.has(item.id)).length;
    const dayPicks = picksOn(state.day).length;
    const day = dayOf(state.day);
    els.exportPdf.disabled = !total;
    els.exportIcs.disabled = !total;
    els.exportPng.disabled = !dayPicks;
    els.exportPng.textContent = `${day.weekday.slice(0, 3)} map image (PNG)`;
    if (!els.exportHint.dataset.busy) setHint(total ? `Your PDF has ${total} ${total === 1 ? "item" : "items"} with numbered floor maps. The PNG covers ${day.weekday}.` : "Add at least one session to enable the exports.");
  }

  function renderAll() {
    const active = document.activeElement;
    const token = active && els.planner.contains(active) ? active.closest?.("[data-focus]")?.dataset.focus : null;
    renderDays();
    renderLevels();
    renderMap();
    renderOffplan();
    renderDetails();
    renderPicker();
    renderAgendaList();
    renderExportState();
    if (token) {
      const next = [...els.planner.querySelectorAll("[data-focus]")].find((element) => element.dataset.focus === token) || (token.startsWith("agenda-") ? els.agendaTitle : null);
      next?.focus({ preventScroll: true });
    }
  }

  // Jump to an item's day, level and room, and highlight it on the map.
  function focusItem(id, scroll = true) {
    const item = itemById.get(id);
    if (!item) return;
    state.day = item.date;
    if (item.loc?.level) state.level = item.loc.level;
    state.selected = item.loc ? item.loc.key : null;
    state.flash = item.loc ? item.loc.key : null;
    renderAll();
    if (scroll) els.mapCard.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  P.showOnMap = (id) => {
    if (!itemById.has(id)) return;
    pendingFocus = id;
    P.go("ground");
  };
  P.onActivate((section) => {
    if (section !== "ground" || !pendingFocus) return;
    const id = pendingFocus;
    pendingFocus = null;
    focusItem(id, false);
    window.requestAnimationFrame(() => els.planner.scrollIntoView({ block: "start" }));
  });

  const stacked = window.matchMedia("(max-width: 1100px)");
  let toastTimer = null;
  function showToast(message) {
    document.querySelector(".planner-toast")?.remove();
    const toast = node("div", "planner-toast");
    const view = node("button", "", "View map");
    view.type = "button";
    view.addEventListener("click", () => { toast.remove(); els.mapCard.scrollIntoView({ block: "start", behavior: "smooth" }); });
    toast.append(node("span", "", message), view);
    document.body.append(toast);
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.remove(), 6000);
  }

  agenda.subscribe((detail) => {
    const item = detail.id ? itemById.get(detail.id) : null;
    if (detail.type === "add" && item) {
      state.day = item.date;
      if (item.loc?.level) state.level = item.loc.level;
      state.selected = item.loc ? item.loc.key : state.selected;
      state.flash = item.loc ? item.loc.key : null;
      announce(`Added to your agenda: ${item.title}. ${item.loc ? `${item.loc.name}, ${item.loc.levelLabel}, is highlighted on the map.` : "Its location is still to be confirmed."}`);
      if (stacked.matches && detail.source === "planner" && P.current() === "ground" && item.loc) showToast(`Added: ${item.loc.name}${item.loc.kind === "offplan" ? "" : ` \u00b7 ${item.loc.levelLabel}`}`);
    } else if (detail.type === "remove" && item) announce(`Removed from your agenda: ${item.title}.`);
    else if (detail.type === "clear") announce("Your agenda is empty.");
    renderAll();
  });

  els.recommended.addEventListener("change", () => { state.showRecommended = els.recommended.checked; renderMap(); });
  els.clear.addEventListener("click", () => agenda.clear("planner"));

  // ---------- Export ----------
  function exportContext() {
    return {
      data, days, items, timeText, compactRange, placeText, whenText, dayOf,
      picksByDay: new Map(days.map((day) => [day.date, picksOn(day.date)])),
      mapCanvas: mapToCanvas,
      levelOf: (item) => item.loc?.level || null,
      levelLabel: (id) => M.level(id).label,
      levels: M.levels.map((level) => level.id)
    };
  }
  async function runExport(kind, button) {
    const exporter = window.PPCC_EXPORT;
    if (!exporter) { setHint("The export tools did not load. Reload the page and try again.", true); return; }
    els.exportHint.dataset.busy = "1";
    [els.exportPdf, els.exportPng, els.exportIcs].forEach((control) => { control.disabled = true; });
    button.setAttribute("aria-busy", "true");
    setHint(kind === "pdf" ? "Building your PDF with the floor maps..." : "Preparing your file...");
    let message;
    try {
      const context = exportContext();
      if (kind === "pdf") { exporter.download(await exporter.makePdf(context), "ppcc-2026-my-agenda.pdf"); message = "Downloaded ppcc-2026-my-agenda.pdf."; }
      else if (kind === "png") { const day = dayOf(state.day); const name = `ppcc-2026-map-${day.weekday.toLowerCase()}.png`; exporter.download(await exporter.makeDayPng(context, state.day), name); message = `Downloaded ${name}.`; }
      else { exporter.download(exporter.makeIcs(context), "ppcc-2026-my-agenda.ics"); message = "Downloaded ppcc-2026-my-agenda.ics. Open it to add the items to your calendar."; }
    } catch (error) {
      console.error("Export failed", error);
      message = null;
      setHint("Sorry, that export failed. Try again, or reload the page.", true);
    } finally {
      delete els.exportHint.dataset.busy;
      button.removeAttribute("aria-busy");
      renderExportState();
    }
    if (message) { setHint(message); announce(message); }
  }
  els.exportPdf.addEventListener("click", () => runExport("pdf", els.exportPdf));
  els.exportPng.addEventListener("click", () => runExport("png", els.exportPng));
  els.exportIcs.addEventListener("click", () => runExport("ics", els.exportIcs));

  renderLegend();
  renderAll();
})();
