"use strict";

// Simplified, not-to-scale schematics of the MGM Grand Conference Center, Levels 1 and 3.
// Room positions and partitions were measured from MGM's published conference center plans:
//   https://assets.contentstack.io/v3/assets/bltc6ce635bc4868eb2/blt502793a96bf24351/mgm-grand-meetings-conference-center-facilities-guide.pdf
// Coordinates keep the plan's point units so relative positions stay faithful. The artwork is original.
// On Level 1 the Marquee Ballroom and Grand Pool Complex are drawn shorter than they really are.
(() => {
  const groups = {
    grand: { name: "Grand Ballroom", roomName: "Grand Ballroom" },
    boulevard: { name: "Boulevard Ballroom", roomName: "Boulevard Ballroom" },
    terrace: { name: "Terrace Ballroom", roomName: "Terrace Ballroom" },
    premier: { name: "Premier Ballroom", roomName: "Premier Ballroom" },
    chairmans: { name: "Chairman's Ballroom", roomName: "Chairman's Ballroom" },
    rooms: { name: "Meeting rooms", roomName: "Room" }
  };

  // Build cells from column ranges, row edges and [numbers, column, row, columnSpan, rowSpan] specs.
  function grid(group, columns, rows, specs) {
    return specs.map(([numbers, column, row, columnSpan = 1, rowSpan = 1]) => {
      const x = columns[column][0];
      const right = columns[column + columnSpan - 1][1];
      return { id: numbers.join("-"), numbers, group, x, y: rows[row], w: right - x, h: rows[row + rowSpan] - rows[row] };
    });
  }
  // A vertical stack of equal rooms; the first number is drawn at the top.
  function stack(group, numbers, x, y, w, rowHeight) {
    return numbers.map((number, index) => ({ id: String(number), numbers: [number], group, x, y: y + index * rowHeight, w, h: rowHeight }));
  }
  // A horizontal run of equal rooms.
  function run(group, numbers, x, y, columnWidth, h) {
    return numbers.map((number, index) => ({ id: String(number), numbers: [number], group, x: x + index * columnWidth, y, w: columnWidth, h }));
  }

  const level1 = {
    id: "L1",
    label: "Level 1",
    title: "Grand, Boulevard & Terrace Ballrooms, Expo Hall",
    view: { x: 66, y: 164, w: 524, h: 338 },
    corridor: { x: 76.2, y: 182.2, w: 502.9, h: 223.6 },
    blocks: [
      { group: "grand", label: "GRAND BALLROOM", x: 135.6, y: 189.4, w: 198.9, h: 137.2, labelAt: [235, 182.5] },
      { group: "boulevard", label: "BOULEVARD BALLROOM", x: 431.7, y: 191.6, w: 133, h: 98, labelAt: [498.2, 185] },
      { group: "terrace", label: "TERRACE BALLROOM", x: 430.3, y: 317.3, w: 117.5, h: 51.5, labelAt: [489, 311] },
      { group: "rooms", label: "", x: 92.5, y: 209.2, w: 30, h: 98.3 },
      { group: "rooms", label: "", x: 348, y: 209.1, w: 32.6, h: 98.7 }
    ],
    cells: [
      ...grid("grand", [[135.6, 174], [188, 224], [237, 282], [296, 334.5]], [189.4, 228, 258, 288, 326.6], [
        [[111], 0, 0], [[112], 0, 1], [[113], 0, 2], [[114], 0, 3],
        [[117], 1, 0], [[116], 1, 1, 1, 2], [[115], 1, 3],
        [[118], 2, 0], [[119], 2, 1, 1, 2], [[120], 2, 3],
        [[124], 3, 0], [[123], 3, 1], [[122], 3, 2], [[121], 3, 3]
      ]),
      ...grid("boulevard", [[432, 459], [469, 498], [498, 528], [538, 565]], [192, 216, 240, 264, 289], [
        [[158], 0, 0], [[157], 0, 1], [[156], 0, 2], [[155], 0, 3],
        [[159], 1, 0], [[160], 1, 1], [[161], 1, 2], [[162], 1, 3],
        [[166], 2, 0], [[165], 2, 1], [[164], 2, 2], [[163], 2, 3],
        [[167], 3, 0], [[168], 3, 1], [[169], 3, 2], [[170], 3, 3]
      ]),
      ...run("terrace", [150, 151, 152, 153], 430.3, 317.3, 29.375, 51.5),
      ...stack("rooms", [110, 109, 108, 107, 106], 92.5, 209.2, 30, 19.66),
      ...stack("rooms", [105, 104, 103, 102, 101], 348, 209.1, 32.6, 19.74),
      { id: "154", numbers: [154], group: "rooms", x: 387.7, y: 207.4, w: 27.4, h: 18.7 }
    ],
    zones: [
      { id: "expo", name: "Expo Hall", sub: "Marquee Ballroom", kind: "key", interactive: true, x: 415.5, y: 402.1, w: 151.4, h: 84 },
      { id: "pool", name: "Grand Pool Complex", sub: "", kind: "context", interactive: false, x: 243.6, y: 420, w: 159.6, h: 66 },
      { id: "registration", name: "Registration", sub: "Grand Pre-Function", kind: "key", interactive: false, x: 150, y: 340, w: 170, h: 56 }
    ]
  };

  const level3 = {
    id: "L3",
    label: "Level 3",
    title: "Premier & Chairman's Ballrooms, Rooms 350-354",
    view: { x: 56, y: 270, w: 552, h: 242 },
    corridor: { x: 66.7, y: 289, w: 530.3, h: 212 },
    blocks: [
      { group: "premier", label: "PREMIER BALLROOM", x: 151, y: 292.3, w: 167.2, h: 147.7, labelAt: [234.6, 285.5] },
      { group: "chairmans", label: "CHAIRMAN'S BALLROOM", x: 399, y: 296, w: 182, h: 128, labelAt: [490, 289.5] },
      { group: "rooms", label: "", x: 100.9, y: 356.3, w: 35.1, h: 62.7 },
      { group: "rooms", label: "", x: 333.7, y: 315, w: 34.8, h: 104 },
      { group: "rooms", label: "", x: 440, y: 450, w: 102.1, h: 33.1 }
    ],
    cells: [
      ...grid("premier", [[151, 191.4], [208, 262], [278, 318.2]], [292.3, 334.5, 398.5, 440], [
        [[309], 0, 0], [[310], 0, 1], [[311], 0, 2],
        [[314, 315], 1, 0], [[313, 316], 1, 1], [[312, 317], 1, 2],
        [[320], 2, 0], [[319], 2, 1], [[318], 2, 2]
      ]),
      ...grid("chairmans", [[399, 437], [450, 490.5], [490.5, 530], [544, 581]], [296, 329, 360, 392, 424], [
        [[358], 0, 0], [[357], 0, 1], [[356], 0, 2], [[355], 0, 3],
        [[359], 1, 0], [[360], 1, 1], [[361], 1, 2], [[362], 1, 3],
        [[366], 2, 0], [[365], 2, 1], [[364], 2, 2], [[363], 2, 3],
        [[367], 3, 0], [[368], 3, 1], [[369], 3, 2], [[370], 3, 3]
      ]),
      ...stack("rooms", [308, 307, 306], 100.9, 356.3, 35.1, 20.9),
      ...stack("rooms", [305, 304, 303, 302, 301], 333.7, 315, 34.8, 20.8),
      ...run("rooms", [350, 351, 352, 353, 354], 440, 450, 20.42, 33.1)
    ],
    zones: [
      { id: "lounge", name: "Community Lounge", sub: "Premier Pre-function", kind: "key", interactive: false, x: 150, y: 452, w: 172, h: 40 }
    ]
  };

  const levels = [level1, level3];
  const byNumber = new Map();
  levels.forEach((level) => level.cells.forEach((cell) => {
    cell.level = level.id;
    cell.label = cell.numbers.join(" & ");
    cell.key = `${level.id}:${cell.id}`;
    cell.numbers.forEach((number) => {
      if (byNumber.has(number)) throw new Error(`Room ${number} is mapped twice`);
      byNumber.set(number, cell);
    });
  }));
  levels.forEach((level) => level.zones.forEach((zone) => { zone.level = level.id; zone.key = `${level.id}:${zone.id}`; }));
  const zones = new Map(levels.flatMap((level) => level.zones.map((zone) => [zone.id, zone])));

  const roomName = (cell, number) => `${groups[cell.group].roomName} ${number}`;

  // One descriptor per mappable place, keyed like "L3:313-316", "L1:expo" or "offplan:arena".
  const byKey = new Map();
  levels.forEach((level) => {
    level.cells.forEach((cell) => byKey.set(cell.key, { kind: "cell", key: cell.key, level: level.id, levelLabel: level.label, name: `${groups[cell.group].roomName} ${cell.label}`, cell }));
    level.zones.forEach((zone) => byKey.set(zone.key, { kind: "zone", key: zone.key, level: level.id, levelLabel: level.label, name: zone.sub ? `${zone.name} (${zone.sub})` : zone.name, zone }));
  });
  byKey.set("offplan:arena", { kind: "offplan", key: "offplan:arena", name: "MGM Grand Garden Arena", levelLabel: "Not on the Conference Center plans" });

  // Turn an official room string ("Premier BR 316", "Room 352", "MGM Grand Garden Arena") into a map target.
  function locate(text) {
    if (typeof text !== "string" || !text.trim()) return null;
    if (/garden arena|\barena\b/i.test(text)) return { kind: "offplan", key: "offplan:arena", name: "MGM Grand Garden Arena", levelLabel: "Not on the Conference Center plans" };
    if (/expo hall|marquee/i.test(text)) {
      const zone = zones.get("expo");
      return { kind: "zone", level: zone.level, key: zone.key, zone: zone.id, name: "Expo Hall (Marquee Ballroom)", levelLabel: "Level 1" };
    }
    const match = text.match(/\b(\d{3})\b/);
    const cell = match ? byNumber.get(Number(match[1])) : null;
    if (!cell) return null;
    const level = levels.find((item) => item.id === cell.level);
    return { kind: "cell", level: cell.level, key: cell.key, cell: cell.id, number: Number(match[1]), name: roomName(cell, Number(match[1])), levelLabel: level.label };
  }

  window.PPCC_MAPS = {
    levels,
    groups,
    locate,
    describe: (key) => byKey.get(key) || null,
    level: (id) => levels.find((level) => level.id === id) || null,
    sources: {
      facilitiesGuide: "https://assets.contentstack.io/v3/assets/bltc6ce635bc4868eb2/blt502793a96bf24351/mgm-grand-meetings-conference-center-facilities-guide.pdf",
      levelThree: "https://assets.contentstack.io/v3/assets/bltc6ce635bc4868eb2/bltcc16effc4fcd12fb/mgm-grand-meetings-meeting-map-diagram-conference-center-level-three.pdf"
    }
  };
})();
