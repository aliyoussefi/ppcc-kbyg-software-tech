"use strict";

(() => {
  const data = window.CONFERENCE_GUIDE;
  const sections = [
    { id: "start", label: "Start Here" },
    { id: "before", label: "Before You Go", description: "Your pre-trip essentials, all in one place." },
    { id: "ground", label: "On the Ground", description: "Floor maps, room finder and your agenda builder." },
    { id: "evenings", label: "Evening Events", description: "Pitbull live, the opening reception and the night market." },
    { id: "exec", label: "Executive Experience", description: "Leadership conversations and executive experiences." },
    { id: "days", label: "3 Perfect Days", description: "Scout, Cowork, FinOps and high-tech peer session picks." },
    { id: "faq", label: "FAQ & Links", description: "Quick answers and useful bookmarks." }
  ];
  const byId = (id) => document.getElementById(id);
  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined && text !== null) element.textContent = text;
    return element;
  };
  const safeLink = (value) => {
    if (typeof value !== "string" || !value.trim()) return null;
    if (/^#[a-z-]+$/.test(value)) return value;
    let url;
    try { url = new URL(value); }
    catch (error) { if (error instanceof TypeError) return null; throw error; }
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  };
  const link = (label, href, className = "text-link") => {
    const safe = safeLink(href);
    if (!safe) throw new TypeError(`Invalid destination for ${label}`);
    const element = node("a", className, label);
    element.href = safe;
    if (!safe.startsWith("#")) { element.target = "_blank"; element.rel = "noopener noreferrer"; }
    return element;
  };
  const isStorageError = (error) => error instanceof DOMException && ["SecurityError", "QuotaExceededError", "InvalidStateError"].includes(error.name);
  const storageKey = "ppcc-personal-guide-v1";
  function reportStorage(message, error) {
    console.warn(message, error);
    byId("storage-warning").textContent = message;
    byId("storage-warning").hidden = false;
  }
  function readState() {
    let raw;
    try { raw = window.localStorage.getItem(storageKey); }
    catch (error) {
      if (!isStorageError(error)) throw error;
      reportStorage("Browser storage is unavailable. Your selections will last only while this page is open.", error);
      return { checked: [], saved: [] };
    }
    if (!raw) return { checked: [], saved: [] };
    let value;
    try { value = JSON.parse(raw); }
    catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
      reportStorage("Saved selections could not be read. New selections will replace the damaged browser data.", error);
      return { checked: [], saved: [] };
    }
    if (!value || !Array.isArray(value.checked) || !Array.isArray(value.saved) || ![...value.checked, ...value.saved].every((item) => typeof item === "string")) {
      reportStorage("Saved selections have an unsupported format. New selections will replace them.");
      return { checked: [], saved: [] };
    }
    return value;
  }
  const stored = readState();
  const checked = new Set(stored.checked.filter((id) => data.checklist.some((item) => item.id === id)));
  const sessions = data.sessions;
  const evenings = data.evenings || [];
  const topicGroups = data.topicGroups || [];
  let activeTopic = "all";
  // "saved" is the agenda. The storage key and shape are unchanged so earlier picks carry over.
  const agendaIds = new Set([...sessions.map((session) => session.id), ...evenings.map((entry) => entry.id)]);
  const saved = new Set(stored.saved.filter((id) => agendaIds.has(id)));
  function persist() {
    try { window.localStorage.setItem(storageKey, JSON.stringify({ checked: [...checked], saved: [...saved] })); }
    catch (error) {
      if (!isStorageError(error)) throw error;
      reportStorage("Your changes could not be saved in this browser. They will last only while this page is open.", error);
    }
  }
  const agendaListeners = new Set();
  const agenda = {
    has: (id) => saved.has(id),
    size: () => saved.size,
    ids: () => [...saved],
    set(id, wanted, source) {
      if (!agendaIds.has(id)) throw new TypeError(`Unknown agenda item: ${id}`);
      if (saved.has(id) === wanted) return;
      wanted ? saved.add(id) : saved.delete(id);
      agenda.changed({ type: wanted ? "add" : "remove", id, source });
    },
    toggle(id, source) { agenda.set(id, !saved.has(id), source); },
    clear(source) { if (!saved.size) return; saved.clear(); agenda.changed({ type: "clear", source }); },
    changed(detail) { persist(); agendaListeners.forEach((listener) => listener(detail)); },
    subscribe(listener) { agendaListeners.add(listener); return () => agendaListeners.delete(listener); }
  };

  const tabList = byId("tabs");
  sections.forEach((section) => {
    const button = node("button", "tab", section.label);
    button.type = "button";
    button.id = `tab-${section.id}`;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", `panel-${section.id}`);
    button.addEventListener("click", () => {
      if (location.hash === `#${section.id}`) activate(section.id, true);
      else location.hash = section.id;
    });
    tabList.append(button);
  });
  const menu = byId("menu-toggle");
  const navigation = byId("navigation");
  function closeMenu() { menu.setAttribute("aria-expanded", "false"); navigation.classList.remove("is-open"); }
  menu.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    navigation.classList.toggle("is-open", open);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") { closeMenu(); menu.focus(); }
  });
  const smallScreen = window.matchMedia("(max-width: 1100px)");
  const orientTabs = () => tabList.setAttribute("aria-orientation", smallScreen.matches ? "vertical" : "horizontal");
  orientTabs();
  smallScreen.addEventListener("change", () => { orientTabs(); closeMenu(); });
  tabList.addEventListener("keydown", (event) => {
    const current = [...tabList.children].indexOf(document.activeElement);
    if (current < 0) return;
    let next;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = sections.length - 1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (current + 1) % sections.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (current - 1 + sections.length) % sections.length;
    if (next === undefined) return;
    event.preventDefault();
    tabList.children[next].focus();
    // Manual tab activation keeps the mobile menu open while moving through choices.
  });
  const activateHooks = [];
  let activeSection = "start";
  function activate(id, moveFocus = false) {
    const section = sections.find((item) => item.id === id) || sections[0];
    activeSection = section.id;
    sections.forEach((item) => {
      const selected = item.id === activeSection;
      const tab = byId(`tab-${item.id}`);
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      byId(`panel-${item.id}`).hidden = !selected;
    });
    byId("menu-label").textContent = section.label;
    document.title = `${section.id === "start" ? "Know Before You Go" : section.label} | PPCC 2026`;
    closeMenu();
    if (moveFocus) {
      byId(`panel-${section.id}`).focus({ preventScroll: true });
      byId("content-viewport").scrollTo({ top: 0, behavior: "instant" });
    }
    activateHooks.forEach((hook) => hook(section.id));
  }
  window.addEventListener("hashchange", () => {
    if (location.hash === "#main") {
      byId(`panel-${activeSection}`).focus();
      return;
    }
    const id = location.hash.slice(1);
    if (!sections.some((item) => item.id === id)) history.replaceState(null, "", "#start");
    activate(id, true);
  });
  const initial = location.hash.slice(1);
  if (!sections.some((item) => item.id === initial)) history.replaceState(null, "", "#start");
  activate(initial);

  document.querySelectorAll("[data-edition]").forEach((element) => { element.textContent = data.edition; });
  byId("intro").textContent = data.intro;
  byId("conference-dates").textContent = data.conference.dates;
  byId("conference-venue").textContent = data.conference.venue;
  function updateCountdown() {
    const now = Date.now();
    const start = new Date(data.conference.start).getTime();
    const end = new Date(data.conference.end).getTime();
    const calendarDate = new Intl.DateTimeFormat("en-CA", { timeZone: data.conference.timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
    const today = calendarDate.format(now);
    const opening = calendarDate.format(start);
    const days = Math.round((Date.parse(`${opening}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000);
    byId("countdown-label").textContent = now >= end ? "Status" : "Countdown";
    byId("countdown").textContent = now >= end ? "See you next time" : now >= start ? "Happening now" : days === 0 ? "Starts today" : `${days} ${days === 1 ? "day" : "days"} to go`;
  }
  updateCountdown();
  window.setInterval(updateCountdown, 60000);

  sections.slice(1).forEach((section, index) => {
    const row = link("", `#${section.id}`, "guide-row");
    const text = node("span");
    text.append(node("b", "", section.label), node("small", "", section.description));
    row.append(node("span", "guide-number", String(index + 1).padStart(2, "0")), text, node("span", "guide-arrow", "\u2192"));
    const item = node("li"); item.append(row); byId("guide-index").append(item);
  });

  function playVideo(seconds) {
    if (!/^[A-Za-z0-9_-]{11}$/.test(data.video.id)) throw new TypeError("Invalid video ID");
    const frame = node("iframe");
    frame.src = `https://www.youtube-nocookie.com/embed/${data.video.id}?autoplay=1&start=${Math.max(0, Math.floor(seconds))}&rel=0`;
    frame.title = "Power HUG: Know Before You Go";
    frame.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
    frame.allowFullscreen = true;
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    byId("video-frame").replaceChildren(frame);
    byId("video-frame").scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    document.querySelectorAll(".chapter").forEach((chapter) => chapter.setAttribute("aria-current", String(Number(chapter.dataset.video) === seconds)));
  }
  data.video.chapters.forEach((chapter) => {
    const button = node("button", "chapter"); button.type = "button"; button.dataset.video = String(chapter.seconds);
    const minutes = `${Math.floor(chapter.seconds / 60)}:${String(chapter.seconds % 60).padStart(2, "0")}`;
    const text = node("span"); text.append(node("b", "", chapter.title), node("small", "", chapter.detail));
    button.append(node("time", "", minutes), text); byId("chapters").append(button);
  });
  document.querySelectorAll("[data-video]").forEach((button) => button.addEventListener("click", () => playVideo(Number(button.dataset.video))));

  const groups = new Map();
  data.checklist.forEach((item) => {
    if (!groups.has(item.group)) {
      const section = node("section", "check-group"); section.append(node("h3", "", item.group));
      groups.set(item.group, section); byId("checklist").append(section);
    }
    const row = node("div", "check-item");
    const input = node("input"); input.type = "checkbox"; input.id = `check-${item.id}`; input.checked = checked.has(item.id);
    input.addEventListener("change", () => { input.checked ? checked.add(item.id) : checked.delete(item.id); persist(); updateProgress(); });
    const text = node("div"); const label = node("label", "", item.title); label.htmlFor = input.id;
    text.append(label, node("p", "", item.detail));
    if (item.link) text.append(link(`${item.linkLabel} \u2192`, item.link));
    row.append(input, text); groups.get(item.group).append(row);
  });
  function updateProgress() {
    byId("check-progress").max = Math.max(1, data.checklist.length);
    byId("check-progress").value = checked.size;
    byId("progress-text").textContent = `${checked.size} of ${data.checklist.length} done`;
  }
  byId("reset-checklist").addEventListener("click", () => { checked.clear(); persist(); document.querySelectorAll(".check-item input").forEach((input) => { input.checked = false; }); updateProgress(); });
  updateProgress();

  const timeText = (value) => {
    if (!value) return "Time to be confirmed";
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new TypeError(`Invalid session time: ${value}`);
    const [hours, minutes] = value.split(":").map(Number);
    return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
  };
  const sessionIds = new Set();
  sessions.forEach((session) => {
    if (typeof session.id !== "string" || !session.id || sessionIds.has(session.id) || typeof session.title !== "string" || !session.title || !safeLink(session.sourceUrl)) throw new TypeError("Every session needs a unique ID, a title and a valid source URL.");
    if (session.start) timeText(session.start);
    if (session.end) timeText(session.end);
    sessionIds.add(session.id);
  });
  evenings.forEach((entry) => {
    if (typeof entry.id !== "string" || !entry.id || sessionIds.has(entry.id) || typeof entry.title !== "string" || !entry.title || !safeLink(entry.sourceUrl) || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date || "")) throw new TypeError("Every evening event needs a unique ID, a title, an ISO date and a valid source URL.");
    if (entry.start) timeText(entry.start);
    if (entry.end) timeText(entry.end);
    sessionIds.add(entry.id);
  });

  // Sessions and evening events share one shape so the agenda, map and exports can treat them alike.
  const mapKit = window.PPCC_MAPS;
  const dayOf = (date) => data.days.find((day) => day.date === date) || null;
  const dayName = (date, style = "long") => {
    const day = dayOf(date);
    return day ? (style === "short" ? day.weekday.slice(0, 3) : day.weekday) : "Date to be confirmed";
  };
  const items = [
    ...sessions.map((session) => ({ id: session.id, kind: "session", title: session.title, date: session.date, start: session.start, end: session.end, room: session.room, speakers: session.speakers || [], type: session.type || "Session", level: session.level || null, featured: Boolean(session.featured), categories: session.categories || [], tech: session.tech || [], sourceUrl: session.sourceUrl, description: session.description || "" })),
    ...evenings.map((entry) => ({ id: entry.id, kind: "event", title: entry.title, date: entry.date, start: entry.start || null, end: entry.end || null, room: entry.location || null, speakers: [], type: "Evening event", level: null, featured: Boolean(entry.featured), categories: [], tech: [], sourceUrl: entry.sourceUrl, description: entry.description || "" }))
  ].map((item) => ({ ...item, loc: mapKit.locate(item.room) }));
  const itemById = new Map(items.map((item) => [item.id, item]));
  const timeRange = (item) => item.start ? `${timeText(item.start)}${item.end ? `-${timeText(item.end)}` : ""}` : "Time to be confirmed";

  const spotlight = sessions.find((session) => session.categories?.includes("hightech"));
  if (spotlight) {
    const card = byId("peer-spotlight");
    const actions = node("div", "actions");
    const findIt = link("Find it in your agenda \u2192", "#days", "button ghost small");
    findIt.dataset.topicTarget = "hightech";
    const onMap = node("button", "button ghost small", "Show the room \u2192");
    onMap.type = "button";
    onMap.dataset.showOnMap = spotlight.id;
    actions.append(findIt, onMap, link("Official session \u2197", spotlight.sourceUrl));
    const sameSlot = sessions.filter((session) => session !== spotlight && session.date === spotlight.date && session.start < spotlight.end && spotlight.start < session.end).map((session) => session.title.split(":")[0]);
    const where = itemById.get(spotlight.id).loc;
    card.append(node("p", "eyebrow", "For software & technology companies"), node("h2", "", "From Automation to Agentic AI"), node("p", "", "Officially: High-Tech Industry Customer Roundtable. BMC, Sage, Ivanti, Precisely and Trimble share how they are putting enterprise AI to work."), node("span", "pill", `${dayName(spotlight.date, "short")}, ${dayOf(spotlight.date)?.label || ""} \u00b7 ${timeRange(spotlight)} \u00b7 ${where ? `${where.name} \u00b7 ${where.levelLabel}` : spotlight.room}`), node("p", "spotlight-caution", sameSlot.length ? `Other recommended options in this time slot: ${sameSlot.join("; ")}. They are alternatives, not conflicts.` : "No other recommended sessions overlap this slot."), actions, node("small", "source-inline", `Source: linked official session \u00b7 Collected ${spotlight.collectedAt}`));
  }

  function chooseTopic(id) {
    if (id !== "all" && !topicGroups.some((group) => group.id === id)) throw new TypeError(`Unknown session focus: ${id}`);
    activeTopic = id;
    renderAgenda();
  }
  [{ id: "all", label: "All picks" }, ...topicGroups].forEach((group, index) => {
    const count = group.id === "all" ? sessions.length : sessions.filter((session) => session.categories?.includes(group.id)).length;
    const button = node("button", "topic-button");
    button.type = "button";
    button.dataset.topic = group.id;
    button.setAttribute("aria-pressed", String(group.id === activeTopic));
    button.append(node("span", "", `${index ? `${String(index).padStart(2, "0")} ` : ""}${group.label}`), node("span", "topic-count", String(count)));
    button.addEventListener("click", () => chooseTopic(group.id));
    byId("topic-filters").append(button);
  });
  document.querySelectorAll("[data-topic-target]").forEach((element) => element.addEventListener("click", () => chooseTopic(element.dataset.topicTarget)));

  function sessionCard(session) {
    const article = node("article", `session-card${session.featured ? " featured" : ""}`);
    const topics = node("div", "session-topics");
    (session.categories || []).forEach((id) => {
      const group = topicGroups.find((item) => item.id === id);
      if (group) topics.append(node("span", `session-topic topic-${id}`, group.label));
    });
    article.append(topics);
    if (session.featured) article.append(node("span", "editor-pick", "Highlighted pick \u00b7 editorial"));
    if (session.type) article.append(node("span", "session-type", session.type));
    article.append(node("span", "session-time", session.start ? `${timeText(session.start)}${session.end ? ` - ${timeText(session.end)}` : ""}` : "Time to be confirmed"), node("h4", "", session.title));
    article.append(node("p", "", session.speakers?.length ? session.speakers.join(" \u00b7 ") : "Speakers to be confirmed"));
    const where = itemById.get(session.id)?.loc;
    const place = node("p", "session-place", session.room || "Location to be confirmed");
    if (where && where.kind !== "offplan") place.append(` \u00b7 ${where.levelLabel}`);
    article.append(place);
    if (session.level) article.append(node("p", "session-level", session.level));
    if (session.tech?.length) {
      const label = session.type === "Roundtable" ? "Technology discussed" : "Technology showcased";
      const technology = node("div", "session-tech");
      const names = node("ul", "tech-chips");
      names.setAttribute("aria-label", label);
      session.tech.forEach((name) => names.append(node("li", "tech-chip", name)));
      technology.append(node("span", "tech-label", label), names);
      article.append(technology);
    }
    if (session.efficiency) {
      const efficiency = node("div", "efficiency-angle");
      efficiency.append(node("b", "", "Efficiency angle"), node("p", "", session.efficiency));
      article.append(efficiency);
    }
    if (session.matchNote) article.append(node("p", "match-note", session.matchNote));
    if (session.description) {
      const description = node("details", "session-description");
      description.append(node("summary", "", "Session details"), node("p", "", session.description));
      article.append(description);
    }
    const bottom = node("div", "session-bottom");
    bottom.append(link("Official session \u2197", session.sourceUrl));
    if (where && where.kind !== "offplan") {
      const show = node("button", "text-button map-link", "Show on map");
      show.type = "button";
      show.dataset.showOnMap = session.id;
      bottom.append(show);
    }
    const inAgenda = agenda.has(session.id);
    const save = node("button", "save-button", inAgenda ? "\u2713 In your agenda" : "+ Add to agenda");
    save.type = "button";
    save.setAttribute("aria-pressed", String(inAgenda));
    save.setAttribute("aria-label", `${inAgenda ? "Remove from" : "Add to"} your agenda: ${session.title}`);
    save.dataset.sessionId = session.id;
    save.addEventListener("click", () => {
      agenda.toggle(session.id, "card");
      const replacement = [...document.querySelectorAll(".save-button")].find((button) => button.dataset.sessionId === session.id);
      (replacement || byId("saved-only")).focus({ preventScroll: true });
    });
    bottom.append(save); article.append(bottom);
    article.append(node("p", "session-source", `Source: linked official session${session.collectedAt ? ` \u00b7 Collected ${session.collectedAt}` : " \u00b7 Collection date unconfirmed"}. ${session.tech?.length ? "Technology names come from the official title and abstract; summary" : "Summary"} and efficiency angle are editorial.`));
    return article;
  }
  function renderAgenda() {
    const query = byId("session-search").value.trim().toLocaleLowerCase();
    const onlySaved = byId("saved-only").checked;
    const visible = sessions.filter((session) => (activeTopic === "all" || session.categories?.includes(activeTopic)) && (!onlySaved || agenda.has(session.id)) && [session.title, session.description, session.efficiency, session.matchNote, session.room, ...(session.speakers || []), ...(session.tags || []), ...(session.tech || [])].filter(Boolean).join(" ").toLocaleLowerCase().includes(query));
    document.querySelectorAll(".topic-button").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.topic === activeTopic)));
    const group = topicGroups.find((item) => item.id === activeTopic);
    byId("category-explanation").textContent = group ? group.description : `Reviewed ${data.research?.publishedSessionsReviewed || sessions.length} published sessions. Includes all Scout/Autopilot and Cowork title/abstract mentions, the High-Tech peer roundtable for software and technology companies, cost and ROI sessions, and selected engineering and platform deep dives. This is a curated selection, not the full conference programme.`;
    byId("session-results").textContent = `Showing ${visible.length} of ${sessions.length} unique curated sessions${group ? ` \u00b7 ${group.label}` : ""}${onlySaved ? " \u00b7 my agenda only" : ""}. Source: official sessions index, collected ${data.research?.collectedNote || data.research?.collectedAt || "date unconfirmed"}.`;
    const grid = byId("days-grid"); grid.replaceChildren();
    const days = [...data.days];
    if (sessions.some((session) => !data.days.some((day) => day.date === session.date))) days.push({ date: null, weekday: "Date unconfirmed", label: "TBC", theme: "Needs a confirmed conference date" });
    days.forEach((day) => {
      const column = node("article", "day-column");
      const head = node("div", "day-head"); const heading = node("div"); heading.append(node("h3", "", day.weekday), node("p", "", day.theme));
      head.append(heading, node("span", "day-date", day.label)); column.append(head);
      const matchesDay = (session) => day.date === null ? !data.days.some((item) => item.date === session.date) : session.date === day.date;
      const matches = visible.filter(matchesDay).sort((a, b) => (a.start || "99:99").localeCompare(b.start || "99:99") || (a.priority || 99) - (b.priority || 99) || Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || a.title.localeCompare(b.title));
      if (!matches.length) {
        const filtered = query || onlySaved || activeTopic !== "all";
        const empty = node("div", "day-empty");
        empty.append(node("span", "empty-icon", "+"), node("h4", "", filtered ? "No matching sessions" : "No picks for this day"), node("p", "", filtered ? "Try another focus, clear your search or turn off My agenda only." : "There are no curated sessions in this day column."), node("span", "", filtered ? "Try another view" : "Check the official agenda"));
        column.append(empty);
      } else matches.forEach((session) => column.append(sessionCard(session)));
      grid.append(column);
    });
    const inAgenda = items.filter((item) => agenda.has(item.id));
    byId("saved-count").textContent = inAgenda.length ? `${inAgenda.length} in your agenda` : "Nothing in your agenda yet";
    const status = sessions.length ? `${sessions.length} unique curated sessions` : "Awaiting session links";
    ["agenda-status", "picks-status"].forEach((id) => { byId(id).textContent = status; byId(id).classList.toggle("pending", !sessions.length); });
    byId("session-notice").textContent = sessions.length ? "Pick your path. Sessions in the same time slot are alternatives, so add more than one and choose what suits you on the day. All options stay available in the guide." : "No session details imported yet.";
    const source = byId("sessions-source");
    source.replaceChildren(node("span", "", "Schedule facts: "), link("official PPCC sessions index", data.research?.sourceUrl || "https://powerplatformconf.com/sessions"), node("span", "", ` \u00b7 Collected ${data.research?.collectedNote || data.research?.collectedAt || "date unconfirmed"}. Official titles, times, rooms and listed speakers are retained. Summaries, focus labels, efficiency angles and highlights are editorial. Technology names come from each official title and abstract; a card with no technology line names no product there. Categories overlap; workshops and private events are outside this scan. Recheck the official agenda for changes.`));
    const selected = inAgenda.filter((item) => dayOf(item.date) && item.start && item.end);
    const hasAlternatives = selected.some((a, index) => selected.slice(index + 1).some((b) => a.date === b.date && a.start < b.end && b.start < a.end));
    byId("saved-alternatives").hidden = !hasAlternatives;
    byId("saved-alternatives").textContent = hasAlternatives ? "Your agenda includes same-time alternatives. Keep them and choose whichever fits best on the day." : "";
  }
  byId("session-search").addEventListener("input", renderAgenda);
  byId("saved-only").addEventListener("change", renderAgenda);
  byId("clear-saved").addEventListener("click", () => agenda.clear("days"));
  agenda.subscribe(renderAgenda);
  renderAgenda();

  const headline = evenings.find((entry) => entry.featured);
  function refreshSummaries() {
    const count = items.filter((item) => agenda.has(item.id)).length;
    byId("session-summary").textContent = sessions.length ? `${sessions.length} recommended sessions \u00b7 ${count ? `${count} in your agenda` : "start yours"}` : "Waiting for your session links";
    byId("evening-summary").textContent = headline ? "Pitbull live, opening reception & night market" : "Evening events & meetups";
  }
  agenda.subscribe(refreshSummaries);
  refreshSummaries();

  const monthDay = (date) => new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
  const compactRange = (start, end) => {
    const from = timeText(start);
    const to = timeText(end);
    return from.slice(-2) === to.slice(-2) ? `${from.slice(0, -3)}-${to}` : `${from}-${to}`;
  };
  function eventFacts(entry) {
    const facts = node("dl", "event-facts");
    const row = (label, value) => {
      if (!value) return;
      const wrap = node("div");
      wrap.append(node("dt", "", label), node("dd", "", value));
      facts.append(wrap);
    };
    const day = dayOf(entry.date);
    row("When", `${day ? day.weekday : "Date to be confirmed"}, ${monthDay(entry.date)}${entry.start ? ` \u00b7 ${entry.end ? compactRange(entry.start, entry.end) : timeText(entry.start)} Pacific` : " \u00b7 Time to be confirmed"}`);
    row("Where", entry.location || "Venue to be confirmed");
    row("Who", entry.eligibility);
    return facts;
  }

  function makeTicket(entry) {
    const day = dayOf(entry.date);
    const ticket = node("div", "pitbull-ticket");
    ticket.setAttribute("aria-hidden", "true");
    ticket.append(node("span", "ticket-weekday", (day ? day.weekday.slice(0, 3) : "").toUpperCase()), node("span", "ticket-day", String(Number(entry.date.slice(8)))), node("span", "ticket-month", new Date(`${entry.date}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase()), node("span", "ticket-time", entry.start ? timeText(entry.start).replace(":00", "") : "TBC"), node("span", "ticket-place", entry.location?.replace(/^MGM Grand /, "") || "Venue TBC"));
    return ticket;
  }

  if (headline) {
    const section = byId("pitbull-spotlight");
    const day = dayOf(headline.date);
    const weekday = day ? day.weekday.slice(0, 3) : "";
    const title = node("h2", "", "Pitbull ");
    title.id = "pitbull-title";
    title.append(node("em", "", "live"), " at PPCC 2026");
    const facts = node("ul", "pitbull-facts");
    [`${weekday}, ${day ? day.label : monthDay(headline.date)}`, headline.start && headline.end ? `${compactRange(headline.start, headline.end)} PT` : "Time to be confirmed", headline.location, headline.audience].filter(Boolean).forEach((text) => facts.append(node("li", "", text)));
    const add = node("button", "button primary");
    add.type = "button";
    add.dataset.agendaToggle = headline.id;
    const actions = node("div", "actions");
    const onMap = node("button", "button ghost", "Find the Arena");
    onMap.type = "button";
    onMap.dataset.showOnMap = headline.id;
    actions.append(add, link("Evening details \u2192", "#evenings", "button ghost"), onMap);
    const copy = node("div", "pitbull-copy");
    copy.append(node("p", "eyebrow", "This year's highlight"), title, node("p", "pitbull-lede", headline.description), facts, actions, node("small", "source-inline", `Source: ${headline.sourceLabel || "official PPCC site"} and the organizer's schedule \u00b7 Collected ${headline.collectedAt}. Confirm details in Whova.`));
    const banner = node("article", "pitbull-banner");
    banner.append(copy, makeTicket(headline));
    section.append(banner);
    section.hidden = false;
    const fact = byId("fact-evening");
    fact.querySelector("dt").textContent = `${weekday} night`;
    fact.hidden = false;
  }

  function renderExperiences(containerId, entries, title, description) {
    const container = byId(containerId);
    if (!entries.length) {
      const article = node("article", "feature purple-feature empty-feature");
      article.append(node("span", "pill pending", "Not populated yet"), node("h3", "", title), node("p", "", description));
      container.append(article);
      return;
    }
    entries.forEach((entry) => {
      if (entry.id) {
        const article = node("article", `feature event-card${entry.featured ? " teal-feature is-headline" : ""}`);
        article.id = entry.id;
        if (entry.featured) article.append(makeTicket(entry));
        const actions = node("div", "actions");
        const add = node("button", "button primary small");
        add.type = "button";
        add.dataset.agendaToggle = entry.id;
        const show = node("button", "button ghost small", "Show on the map");
        show.type = "button";
        show.dataset.showOnMap = entry.id;
        actions.append(add, show, link("Official site \u2197", entry.sourceUrl));
        if (entry.scheduleUrl) actions.append(link("Organizer's schedule (PDF) \u2197", entry.scheduleUrl));
        article.append(node("p", "eyebrow", entry.featured ? "Headline event" : "Evening event"), node("h3", "", entry.title), node("p", "", entry.description), eventFacts(entry));
        if (entry.timeNote) article.append(node("p", "event-note", entry.timeNote));
        article.append(actions);
        if (entry.collectedAt) article.append(node("p", "session-source", `Source: ${entry.sourceLabel || "linked host page"} \u00b7 Collected ${entry.collectedAt}`));
        container.append(article);
        return;
      }
      const article = node("article", "feature");
      article.append(node("h3", "", entry.title), node("p", "", entry.description));
      article.append(node("p", "", [entry.date, entry.time, entry.location].filter(Boolean).join(" \u00b7 ") || "Schedule and venue to be confirmed"));
      if (entry.eligibility) article.append(node("p", "", entry.eligibility));
      article.append(link("Details and registration \u2197", entry.sourceUrl));
      if (entry.collectedAt) article.append(node("p", "session-source", `Source: linked host page \u00b7 Collected ${entry.collectedAt}`));
      container.append(article);
    });
  }
  renderExperiences("evening-content", evenings, "A great evening starts with a plan.", "No evening events have been added yet.");
  renderExperiences("executive-content", data.executiveExperiences, "Choose the experiences that fit.", "Share the executive-session or experience links you want featured. This section will show the verified details, including eligibility and how to register. No invitation or access is implied by this preview.");

  // Buttons anywhere in the guide can toggle an agenda item or jump to its room on the map.
  function syncAgendaToggles() {
    document.querySelectorAll("[data-agenda-toggle]").forEach((button) => {
      const item = itemById.get(button.dataset.agendaToggle);
      if (!item) return;
      const on = agenda.has(item.id);
      button.setAttribute("aria-pressed", String(on));
      button.setAttribute("aria-label", `${on ? "Remove from" : "Add to"} your agenda: ${item.title}`);
      button.textContent = on ? "\u2713 In your agenda" : "+ Add to my agenda";
    });
  }
  agenda.subscribe(syncAgendaToggles);
  syncAgendaToggles();
  document.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-agenda-toggle]");
    if (toggle) { agenda.toggle(toggle.dataset.agendaToggle, "toggle"); return; }
    const show = event.target.closest("[data-show-on-map]");
    if (show) { event.preventDefault(); window.PPCC.showOnMap?.(show.dataset.showOnMap); }
  });

  function renderFaq() {
    const query = byId("faq-search").value.trim().toLocaleLowerCase();
    const matches = data.faqs.filter((item) => `${item.question} ${item.answer}`.toLocaleLowerCase().includes(query));
    byId("faq-list").replaceChildren();
    matches.forEach((item) => {
      const details = node("details", "faq-item"); details.append(node("summary", "", item.question), node("p", "", item.answer)); byId("faq-list").append(details);
    });
    byId("faq-empty").hidden = matches.length > 0;
  }
  byId("faq-search").addEventListener("input", renderFaq);
  renderFaq();

  // Shared surface for planner.js: one agenda store, normalized items and small helpers.
  window.PPCC = {
    data, items, itemById, agenda, headline,
    dayOf, dayName, monthDay, timeText, timeRange, compactRange,
    byId, node, link, safeLink,
    sections,
    onActivate: (hook) => { activateHooks.push(hook); },
    current: () => activeSection,
    go(id) { if (location.hash === `#${id}`) activate(id, true); else location.hash = id; },
    showOnMap: null
  };
})();
