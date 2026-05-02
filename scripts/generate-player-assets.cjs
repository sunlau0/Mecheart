const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const outDir = path.join(process.cwd(), "assets");

const units = [
  {
    key: "valkyr",
    name: "Valkyr",
    role: "重盾防線機",
    weapon: "大型抗光束盾 / 近距離散射炮",
    active: "屏障陣列",
    ultimate: "零域壁壘",
    notes: ["重裝肩盾", "前線吸火", "全隊護盾"],
    colors: { main: "#eaf8ff", accent: "#72e8ff", dark: "#153d55", trim: "#ffc857", glow: "#72e8ff" },
    parts: "shield"
  },
  {
    key: "lancer",
    name: "Lancer",
    role: "軌道狙擊機",
    weapon: "超長距離穿甲光束長槍",
    active: "穿甲狙擊",
    ultimate: "軌道貫穿",
    notes: ["遠距鎖定", "Boss 破甲", "後排輸出"],
    colors: { main: "#dff2ff", accent: "#2f9cff", dark: "#0b2b62", trim: "#9fd9ff", glow: "#38a7ff" },
    parts: "lance"
  },
  {
    key: "nova",
    name: "Nova",
    role: "高機動突擊機",
    weapon: "熱能刃 / 短距離爆發推進器",
    active: "熱刃旋風",
    ultimate: "突擊超載",
    notes: ["雙翼推進", "高速切入", "範圍斬擊"],
    colors: { main: "#fff0dc", accent: "#ff8a30", dark: "#4b1f19", trim: "#ffdd66", glow: "#ff9838" },
    parts: "wings"
  },
  {
    key: "helix",
    name: "Helix",
    role: "戰場維修航標機",
    weapon: "遠距離修復鏈 / 防護航標",
    active: "修復航標",
    ultimate: "再生節點",
    notes: ["雙環航標", "跟隨補血", "復活支援"],
    colors: { main: "#f0fff8", accent: "#74ffc4", dark: "#123b36", trim: "#caffef", glow: "#76ffc8" },
    parts: "repair"
  },
  {
    key: "bastion",
    name: "Bastion",
    role: "中距離重炮機",
    weapon: "肩部重粒子炮 / 壓制榴彈",
    active: "重炮壓制",
    ultimate: "要塞齊射",
    notes: ["雙肩重炮", "中距火力", "群體轟擊"],
    colors: { main: "#fff2c2", accent: "#f6c34f", dark: "#34302b", trim: "#ffe78f", glow: "#ffd35a" },
    parts: "cannon"
  },
  {
    key: "mirage",
    name: "Mirage",
    role: "電子干擾中距離機",
    weapon: "幻象浮游炮 / 干擾脈衝",
    active: "幻象干擾",
    ultimate: "海市蜃樓域",
    notes: ["浮游干擾器", "降低敵火力", "保護後排"],
    colors: { main: "#f2eaff", accent: "#b56cff", dark: "#30194e", trim: "#9be7ff", glow: "#c37bff" },
    parts: "jammer"
  }
];

function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function svgFrame(width, height, body, options = {}) {
  const bg = options.transparent ? "" : `
    <rect width="${width}" height="${height}" fill="#050912"/>
    <radialGradient id="bgGlow" cx="50%" cy="38%" r="58%">
      <stop offset="0" stop-color="${options.glow || "#4be4ff"}" stop-opacity="0.34"/>
      <stop offset="0.45" stop-color="#132033" stop-opacity="0.82"/>
      <stop offset="1" stop-color="#03050a"/>
    </radialGradient>
    <rect width="${width}" height="${height}" fill="url(#bgGlow)"/>
    <path d="M0 ${height * 0.74} H${width}" stroke="rgba(122,242,255,.22)" stroke-width="2"/>
    <g stroke="rgba(122,242,255,.1)" stroke-width="1">
      ${Array.from({ length: 10 }, (_, i) => `<path d="M${i * width / 9} 0 L${i * width / 9 - width * 0.16} ${height}"/>`).join("")}
    </g>
  `;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#000000" flood-opacity=".65"/>
      </filter>
      <filter id="unitGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="${options.glow || "#4be4ff"}" flood-opacity=".75"/>
      </filter>
      <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset=".38" stop-color="#c7d8e8"/>
        <stop offset=".62" stop-color="#6d8093"/>
        <stop offset="1" stop-color="#f7fbff"/>
      </linearGradient>
    </defs>
    ${bg}
    ${body}
  </svg>`;
}

function poly(points, fill, stroke = "#07101b", width = 4, extra = "") {
  return `<polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round" ${extra}/>`;
}

function renderMech(unit, scale = 1, label = false) {
  const c = unit.colors;
  const glow = `filter="url(#unitGlow)"`;
  const common = `
    <g opacity=".38" filter="url(#unitGlow)">
      <ellipse cx="0" cy="80" rx="58" ry="16" fill="${c.glow}"/>
    </g>
    <g id="${unit.key}-back">
      ${backpack(unit)}
    </g>
    <g id="${unit.key}-legs">
      ${poly("-34,42 -14,46 -7,104 -34,112 -48,88", c.dark)}
      ${poly("34,42 14,46 7,104 34,112 48,88", c.dark)}
      ${poly("-28,56 -8,58 -4,108 -26,114 -38,92", c.main)}
      ${poly("28,56 8,58 4,108 26,114 38,92", c.main)}
      ${poly("-44,106 -4,104 -10,122 -50,124", c.accent)}
      ${poly("44,106 4,104 10,122 50,124", c.accent)}
    </g>
    <g id="${unit.key}-arms">
      ${poly("-62,-20 -40,-12 -42,42 -68,52 -82,22", c.dark)}
      ${poly("62,-20 40,-12 42,42 68,52 82,22", c.dark)}
      ${poly("-72,12 -48,16 -50,58 -78,62 -88,34", c.main)}
      ${poly("72,12 48,16 50,58 78,62 88,34", c.main)}
    </g>
    <g id="${unit.key}-body">
      ${poly("-42,-34 42,-34 56,42 24,68 -24,68 -56,42", c.dark)}
      ${poly("-30,-26 30,-26 42,32 18,54 -18,54 -42,32", c.main)}
      ${poly("-18,-14 18,-14 24,22 0,42 -24,22", c.accent, "#07101b", 3)}
      <rect x="-16" y="6" width="32" height="12" rx="4" fill="#07101b"/>
      <rect x="-10" y="10" width="20" height="4" rx="2" fill="${c.glow}" ${glow}/>
    </g>
    <g id="${unit.key}-head">
      ${poly("-34,-88 34,-88 44,-52 22,-28 -22,-28 -44,-52", c.main)}
      ${poly("-18,-76 18,-76 26,-52 0,-42 -26,-52", c.dark, "#07101b", 3)}
      <rect x="-20" y="-62" width="40" height="9" rx="4" fill="${c.glow}" ${glow}/>
      ${vFin(unit)}
      ${poly("-10,-36 10,-36 6,-22 -6,-22", c.trim, "#07101b", 2)}
    </g>
    ${weapon(unit)}
  `;
  const labelBits = label ? `
    <text x="0" y="164" text-anchor="middle" font-family="Arial Black, Microsoft JhengHei, sans-serif" font-size="24" fill="#ffffff" stroke="#06101c" stroke-width="5" paint-order="stroke">${esc(unit.name)}</text>
    <text x="0" y="190" text-anchor="middle" font-family="Microsoft JhengHei, sans-serif" font-size="15" fill="${c.glow}">${esc(unit.role)}</text>
  ` : "";
  return `<g transform="scale(${scale})" filter="url(#softShadow)">${common}${labelBits}</g>`;
}

function vFin(unit) {
  const c = unit.colors;
  if (unit.parts === "bastion") {
    return `${poly("-40,-80 -66,-106 -32,-90", c.trim, "#07101b", 3)}${poly("40,-80 66,-106 32,-90", c.trim, "#07101b", 3)}<rect x="-12" y="-104" width="24" height="24" rx="4" fill="${c.trim}" stroke="#07101b" stroke-width="3"/>`;
  }
  if (unit.parts === "mirage") {
    return `${poly("-32,-82 -72,-96 -38,-72", c.trim, "#07101b", 3)}${poly("32,-82 72,-96 38,-72", c.trim, "#07101b", 3)}${poly("0,-90 -14,-122 14,-122", c.accent, "#07101b", 3)}`;
  }
  return `${poly("-30,-78 -78,-114 -38,-68", c.trim, "#07101b", 3)}${poly("30,-78 78,-114 38,-68", c.trim, "#07101b", 3)}${poly("0,-88 -16,-126 16,-126", c.trim, "#07101b", 3)}`;
}

function backpack(unit) {
  const c = unit.colors;
  if (unit.parts === "shield") {
    return `${poly("-58,-34 -112,-72 -74,34", c.accent)}${poly("58,-34 112,-72 74,34", c.accent)}${poly("-86,-58 -130,14 -90,80 -54,20", c.dark)}${poly("86,-58 130,14 90,80 54,20", c.dark)}`;
  }
  if (unit.parts === "lance") {
    return `${poly("-56,-40 -98,-98 -70,48", c.accent)}${poly("56,-40 98,-98 70,48", c.accent)}${poly("-76,-34 -118,74 -68,28", c.dark)}${poly("76,-34 118,74 68,28", c.dark)}`;
  }
  if (unit.parts === "wings") {
    return `${poly("-46,-42 -130,-106 -82,50", c.accent)}${poly("46,-42 130,-106 82,50", c.accent)}${poly("-82,-20 -148,70 -70,34", c.trim)}${poly("82,-20 148,70 70,34", c.trim)}`;
  }
  if (unit.parts === "repair") {
    return `<circle cx="-86" cy="-28" r="26" fill="none" stroke="${c.glow}" stroke-width="7" ${`filter="url(#unitGlow)"`}/><circle cx="86" cy="-28" r="26" fill="none" stroke="${c.glow}" stroke-width="7" ${`filter="url(#unitGlow)"`}/>${poly("-58,-26 -100,-54 -76,38", c.dark)}${poly("58,-26 100,-54 76,38", c.dark)}`;
  }
  if (unit.parts === "cannon") {
    return `${poly("-50,-62 -92,-68 -94,36 -54,28", c.dark)}${poly("50,-62 92,-68 94,36 54,28", c.dark)}<rect x="-118" y="-92" width="38" height="116" rx="12" fill="${c.dark}" stroke="#07101b" stroke-width="5"/><rect x="80" y="-92" width="38" height="116" rx="12" fill="${c.dark}" stroke="#07101b" stroke-width="5"/><rect x="-112" y="-106" width="26" height="70" rx="8" fill="${c.accent}" stroke="#07101b" stroke-width="4"/><rect x="86" y="-106" width="26" height="70" rx="8" fill="${c.accent}" stroke="#07101b" stroke-width="4"/>`;
  }
  return `${poly("-48,-42 -112,-72 -84,56", c.dark)}${poly("48,-42 112,-72 84,56", c.dark)}<circle cx="-98" cy="-6" r="15" fill="${c.glow}" ${`filter="url(#unitGlow)"`}/><circle cx="98" cy="-6" r="15" fill="${c.glow}" ${`filter="url(#unitGlow)"`}/>`;
}

function weapon(unit) {
  const c = unit.colors;
  if (unit.parts === "shield") {
    return `<g transform="translate(-104,20) rotate(-13)">${poly("-28,-66 28,-50 30,40 0,74 -34,42", c.main)}${poly("-12,-42 14,-32 14,28 -4,48 -20,24", c.accent, "#07101b", 3)}</g><rect x="74" y="-16" width="18" height="90" rx="8" fill="${c.accent}" stroke="#07101b" stroke-width="4"/>`;
  }
  if (unit.parts === "lance") {
    return `<g transform="translate(104,-8) rotate(16)"><rect x="-8" y="-104" width="16" height="190" rx="7" fill="${c.dark}" stroke="#07101b" stroke-width="4"/><polygon points="0,-146 24,-96 0,-112 -24,-96" fill="${c.accent}" stroke="#07101b" stroke-width="4"/><rect x="-14" y="-14" width="28" height="30" rx="6" fill="${c.glow}" ${`filter="url(#unitGlow)"`}/></g>`;
  }
  if (unit.parts === "wings") {
    return `<g transform="translate(-98,20) rotate(-32)"><rect x="-8" y="-80" width="16" height="130" rx="7" fill="${c.accent}" stroke="#07101b" stroke-width="4"/></g><g transform="translate(98,20) rotate(32)"><rect x="-8" y="-80" width="16" height="130" rx="7" fill="${c.accent}" stroke="#07101b" stroke-width="4"/></g>`;
  }
  if (unit.parts === "repair") {
    return `<g stroke="${c.glow}" stroke-width="6" fill="none" ${`filter="url(#unitGlow)"`}><path d="M-114 38 C-70 0 -34 12 -8 42"/><path d="M114 38 C70 0 34 12 8 42"/></g><circle cx="0" cy="-2" r="18" fill="${c.glow}" opacity=".7" ${`filter="url(#unitGlow)"`}/>`;
  }
  if (unit.parts === "cannon") {
    return `<g transform="translate(0,-116)"><rect x="-58" y="-20" width="116" height="34" rx="10" fill="${c.dark}" stroke="#07101b" stroke-width="5"/><rect x="-84" y="-28" width="44" height="20" rx="8" fill="${c.accent}" stroke="#07101b" stroke-width="4"/><rect x="40" y="-28" width="44" height="20" rx="8" fill="${c.accent}" stroke="#07101b" stroke-width="4"/></g>`;
  }
  return `<g opacity=".8">${Array.from({ length: 4 }, (_, i) => {
    const angle = i * Math.PI / 2 + Math.PI / 4;
    const x = Math.cos(angle) * 118;
    const y = Math.sin(angle) * 84;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="12" fill="${c.glow}" ${`filter="url(#unitGlow)"`}/><path d="M${(x * .78).toFixed(1)} ${(y * .78).toFixed(1)} L${x.toFixed(1)} ${y.toFixed(1)}" stroke="${c.glow}" stroke-width="5" ${`filter="url(#unitGlow)"`}/>`;
  }).join("")}</g>`;
}

function spriteSvg(unit) {
  return svgFrame(512, 512, `<g transform="translate(256 250)">${renderMech(unit, 1.45)}</g>`, { transparent: true, glow: unit.colors.glow });
}

function profileSvg(unit) {
  const c = unit.colors;
  const noteRows = unit.notes.map((note, index) => `
    <g transform="translate(0 ${index * 54})">
      <circle cx="0" cy="0" r="13" fill="${c.glow}" filter="url(#unitGlow)"/>
      <text x="28" y="7" font-family="Microsoft JhengHei, sans-serif" font-size="21" font-weight="900" fill="#eaf4ff">${esc(note)}</text>
    </g>
  `).join("");
  const linesFor = (value) => String(value)
    .split(" / ")
    .flatMap((part) => part.length > 11 ? [part.slice(0, 11), part.slice(11)] : [part])
    .filter(Boolean)
    .slice(0, 2);
  const specRow = (y, label, value, color = "#dce9ff") => `
    <text x="0" y="${y}" font-family="Microsoft JhengHei, sans-serif" font-size="17" font-weight="900" fill="${c.glow}">${esc(label)}</text>
    ${linesFor(value).map((line, index) => `<text x="0" y="${y + 26 + index * 24}" font-family="Microsoft JhengHei, sans-serif" font-size="19" font-weight="900" fill="${color}">${esc(line)}</text>`).join("")}
  `;
  return svgFrame(768, 768, `
    <text x="46" y="64" font-family="Arial Black, Microsoft JhengHei, sans-serif" font-size="42" fill="#ffffff" stroke="#06101c" stroke-width="5" paint-order="stroke">${esc(unit.name)}</text>
    <text x="48" y="100" font-family="Microsoft JhengHei, sans-serif" font-size="22" font-weight="900" fill="${c.glow}">${esc(unit.role)}</text>
    <rect x="38" y="124" width="420" height="538" rx="18" fill="rgba(3,8,15,.6)" stroke="${c.glow}" stroke-opacity=".42"/>
    <g transform="translate(248 404)">${renderMech(unit, 1.78)}</g>

    <rect x="486" y="130" width="236" height="510" rx="18" fill="rgba(3,8,15,.74)" stroke="${c.glow}" stroke-opacity=".48"/>
    <text x="512" y="174" font-family="Arial Black, Microsoft JhengHei, sans-serif" font-size="24" fill="#ffffff" stroke="#06101c" stroke-width="3" paint-order="stroke">機設資料</text>
    <g transform="translate(512 214)">
      ${specRow(0, "主武裝", unit.weapon)}
      ${specRow(96, "主動技", unit.active, "#ffffff")}
      ${specRow(174, "必殺技", unit.ultimate, "#ffffff")}
    </g>
    <text x="512" y="462" font-family="Microsoft JhengHei, sans-serif" font-size="18" font-weight="900" fill="${c.glow}">機設重點</text>
    <g transform="translate(526 500)">${noteRows}</g>

    <rect x="46" y="676" width="676" height="46" rx="12" fill="rgba(3,7,13,.72)" stroke="${c.glow}" stroke-opacity=".55"/>
    <text x="384" y="706" text-anchor="middle" font-family="Microsoft JhengHei, sans-serif" font-size="21" font-weight="900" fill="#eaf4ff">PLAYER MOBILE SUIT DESIGN SHEET</text>
  `, { glow: c.glow });
}

function lineupSvg() {
  const cells = units.map((unit, i) => {
    const x = 210 + (i % 3) * 390;
    const y = 248 + Math.floor(i / 3) * 304;
    return `
      <g transform="translate(${x} ${y})">
        <rect x="-150" y="-174" width="300" height="292" rx="18" fill="rgba(5,10,18,.66)" stroke="${unit.colors.glow}" stroke-opacity=".55"/>
        <g transform="translate(0 -24)">${renderMech(unit, 0.82, true)}</g>
      </g>`;
  }).join("");
  return svgFrame(1200, 760, `
    <text x="54" y="70" font-family="Arial Black, Microsoft JhengHei, sans-serif" font-size="42" fill="#ffffff" stroke="#06101c" stroke-width="5" paint-order="stroke">玩家新機體設計</text>
    <text x="56" y="108" font-family="Microsoft JhengHei, sans-serif" font-size="20" fill="#9eefff">六款新機已獨立於敵機美術，全部以玩家機體配色和輪廓重新設計。</text>
    ${cells}
  `, { glow: "#72e8ff" });
}

function tutorialSvg() {
  const detail = (line1, line2 = "") => `
    <text x="160" y="320" text-anchor="middle" font-family="Microsoft JhengHei, sans-serif" font-size="17" font-weight="800" fill="#cfe8ff">${esc(line1)}</text>
    ${line2 ? `<text x="160" y="346" text-anchor="middle" font-family="Microsoft JhengHei, sans-serif" font-size="17" font-weight="800" fill="#cfe8ff">${esc(line2)}</text>` : ""}`;
  const panel = (x, title, text, icon) => `
    <g transform="translate(${x} 0)">
      <rect x="0" y="0" width="320" height="390" rx="18" fill="rgba(5,10,18,.78)" stroke="rgba(122,242,255,.55)" stroke-width="2"/>
      ${icon}
      <text x="160" y="282" text-anchor="middle" font-family="Microsoft JhengHei, sans-serif" font-size="24" font-weight="900" fill="#ffffff">${esc(title)}</text>
      ${text}
    </g>`;
  const cardIcon = `
    <rect x="78" y="62" width="164" height="132" rx="12" fill="#101924" stroke="#ffd166" stroke-width="4"/>
    <g transform="translate(160 132) scale(.58)">${renderMech(units[0], 1)}</g>
    <circle cx="222" cy="194" r="22" fill="#4be4ff"/>
    <text x="222" y="203" text-anchor="middle" font-family="Arial Black" font-size="24" fill="#031018">1</text>`;
  const dragIcon = `
    <circle cx="92" cy="164" r="36" fill="#102033" stroke="#4be4ff" stroke-width="4"/>
    <g transform="translate(92 164) scale(.34)">${renderMech(units[2], 1)}</g>
    <path d="M132 164 C178 126 206 104 242 82" fill="none" stroke="#4be4ff" stroke-width="7" stroke-linecap="round" stroke-dasharray="14 10"/>
    <path d="M238 80 l-18 -4 l10 16 z" fill="#4be4ff"/>
    <text x="238" y="62" text-anchor="middle" font-family="Microsoft JhengHei" font-size="18" font-weight="900" fill="#ffffff">目的地</text>`;
  const targetIcon = `
    <g transform="translate(92 152) scale(.36)">${renderMech(units[1], 1)}</g>
    <path d="M138 150 C166 130 190 130 222 150" fill="none" stroke="#ff5b66" stroke-width="7" stroke-linecap="round"/>
    <circle cx="236" cy="150" r="38" fill="#220a13" stroke="#ff5b66" stroke-width="5"/>
    <text x="236" y="158" text-anchor="middle" font-family="Arial Black" font-size="28" fill="#ff5b66">敵</text>
    <circle cx="236" cy="220" r="26" fill="#0b251d" stroke="#62e6a7" stroke-width="4"/>
    <text x="236" y="228" text-anchor="middle" font-family="Arial Black" font-size="20" fill="#62e6a7">友</text>`;
  const skillIcon = `
    <rect x="50" y="84" width="220" height="116" rx="14" fill="#070b11" stroke="#4be4ff" stroke-width="3"/>
    <rect x="70" y="104" width="82" height="76" rx="10" fill="#102438" stroke="#4be4ff" stroke-width="3"/>
    <rect x="168" y="104" width="82" height="76" rx="10" fill="#2a2410" stroke="#ffd166" stroke-width="3"/>
    <circle cx="111" cy="132" r="20" fill="#4be4ff"/>
    <path d="M192 156 h34" stroke="#ffd166" stroke-width="8" stroke-linecap="round"/>
    <text x="111" y="220" text-anchor="middle" font-family="Microsoft JhengHei" font-size="18" font-weight="900" fill="#ffffff">主動技</text>
    <text x="209" y="220" text-anchor="middle" font-family="Microsoft JhengHei" font-size="18" font-weight="900" fill="#ffffff">必殺</text>`;
  return svgFrame(1440, 520, `
    <text x="56" y="74" font-family="Arial Black, Microsoft JhengHei, sans-serif" font-size="44" fill="#ffffff" stroke="#06101c" stroke-width="5" paint-order="stroke">新手操作教學</text>
    <text x="58" y="108" font-family="Microsoft JhengHei, sans-serif" font-size="20" fill="#9eefff">Battleheart 式拖線指揮：先揀機，再拉去地點、敵人或友軍。</text>
    <g transform="translate(42 124)">
      ${panel(0, "1. 揀 4 架出擊", detail("點擊機體卡查看定位", "再按加入或移除"), cardIcon)}
      ${panel(348, "2. 拖線移動", detail("按住我方機體", "拖去想去的位置"), dragIcon)}
      ${panel(696, "3. 指向目標", detail("拉到敵人會攻擊", "拉到友軍會補血或集火"), targetIcon)}
      ${panel(1044, "4. 放技能", detail("每架機有主動技和必殺", "能量滿即可使用"), skillIcon)}
    </g>
  `, { glow: "#4be4ff" });
}

async function renderPng(svg, filename, size = null) {
  let pipeline = sharp(Buffer.from(svg));
  if (size) pipeline = pipeline.resize(size.width, size.height, { fit: "contain" });
  await pipeline.png().toFile(path.join(outDir, filename));
}

const detailedSources = {
  valkyr: { source: "sd-asterion.png", modulate: { saturation: 1.12, brightness: 1.03 }, size: 438 },
  lancer: { source: "sd-orion.png", modulate: { hue: 206, saturation: 1.18, brightness: 1.02 }, size: 430 },
  nova: { source: "sd-caliburn.png", modulate: { hue: 20, saturation: 1.12, brightness: 1.04 }, size: 426 },
  helix: { source: "sd-seraphim.png", modulate: { hue: 140, saturation: 1.18, brightness: 1.05 }, size: 424 },
  bastion: { source: "sd-orion.png", modulate: { hue: 38, saturation: 0.95, brightness: 1.04 }, size: 440 },
  mirage: { source: "sd-orion.png", modulate: { hue: 278, saturation: 1.2, brightness: 1.0 }, size: 428 }
};

function fxSvg(unit, layer = "front") {
  const c = unit.colors;
  const commonDefs = `
    <defs>
      <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="7" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="hardShadow" x="-80%" y="-80%" width="260%" height="260%">
        <feDropShadow dx="0" dy="10" stdDeviation="7" flood-color="#000000" flood-opacity=".58"/>
      </filter>
      <linearGradient id="accentMetal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0" stop-color="${c.main}"/>
        <stop offset=".34" stop-color="${c.accent}"/>
        <stop offset=".68" stop-color="${c.dark}"/>
        <stop offset="1" stop-color="${c.trim}"/>
      </linearGradient>
      <linearGradient id="darkMetal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0" stop-color="#1a2734"/>
        <stop offset=".45" stop-color="${c.dark}"/>
        <stop offset="1" stop-color="#050912"/>
      </linearGradient>
      <radialGradient id="coreGlow" cx="50%" cy="35%" r="65%">
        <stop offset="0" stop-color="${c.glow}" stop-opacity=".95"/>
        <stop offset=".42" stop-color="${c.glow}" stop-opacity=".22"/>
        <stop offset="1" stop-color="${c.glow}" stop-opacity="0"/>
      </radialGradient>
    </defs>`;
  const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">${commonDefs}${body}</svg>`;
  const bolts = (points, r = 5) => points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.glow}" opacity=".8" filter="url(#glow)"/><circle cx="${x}" cy="${y}" r="${Math.max(2, r - 3)}" fill="#eaf8ff" opacity=".82"/>`).join("");
  const seam = (d, color = c.glow, width = 4) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" opacity=".72"/>`;
  const plate = (d, fill = "url(#accentMetal)", opacity = 1) => `<path d="${d}" fill="${fill}" stroke="#06101c" stroke-width="8" stroke-linejoin="round" opacity="${opacity}" filter="url(#hardShadow)"/>`;

  if (unit.key === "valkyr") {
    if (layer === "back") return svg(`
      <ellipse cx="256" cy="388" rx="142" ry="30" fill="url(#coreGlow)" opacity=".55" filter="url(#glow)"/>
      <g opacity=".98">
        ${plate("M170 118 L96 154 L70 292 L126 338 L194 224 Z", "url(#darkMetal)")}
        ${plate("M342 118 L416 154 L442 292 L386 338 L318 224 Z", "url(#darkMetal)")}
        ${plate("M118 162 L46 242 L72 370 L146 344 L176 220 Z", "url(#accentMetal)", .96)}
        ${plate("M394 162 L466 242 L440 370 L366 344 L336 220 Z", "url(#accentMetal)", .96)}
        ${plate("M132 196 L78 258 L96 330 L140 314 L160 230 Z", c.main, .96)}
        ${plate("M380 196 L434 258 L416 330 L372 314 L352 230 Z", c.main, .96)}
        ${seam("M104 214 L144 236 L126 318")}
        ${seam("M408 214 L368 236 L386 318")}
        ${seam("M178 130 L154 214 L190 246", c.trim, 4)}
        ${seam("M334 130 L358 214 L322 246", c.trim, 4)}
        ${bolts([[166, 166], [346, 166], [108, 258], [404, 258]], 6)}
      </g>`);
    return svg(`
      <g opacity=".98">
        ${plate("M96 202 L50 266 L74 384 L148 348 L164 238 Z", c.main)}
        ${plate("M416 202 L462 266 L438 384 L364 348 L348 238 Z", c.main)}
        ${plate("M112 238 L82 278 L96 344 L134 326 L144 262 Z", c.accent, .94)}
        ${plate("M400 238 L430 278 L416 344 L378 326 L368 262 Z", c.accent, .94)}
        ${seam("M84 282 L132 304")}
        ${seam("M428 282 L380 304")}
        <circle cx="96" cy="206" r="17" fill="${c.glow}" opacity=".58" filter="url(#glow)"/>
        <circle cx="416" cy="206" r="17" fill="${c.glow}" opacity=".58" filter="url(#glow)"/>
      </g>`);
  }
  if (unit.key === "lancer") {
    if (layer === "back") return svg(`
      <g opacity=".98">
        ${plate("M344 90 L414 58 L402 238 L334 224 Z", "url(#darkMetal)")}
        ${plate("M358 116 L394 98 L388 204 L352 196 Z", "url(#accentMetal)", .86)}
        ${plate("M146 128 L92 96 L104 284 L164 246 Z", "url(#darkMetal)")}
        ${plate("M152 160 L122 142 L130 238 L164 220 Z", c.accent, .78)}
        <g transform="translate(320 180) rotate(16)" filter="url(#hardShadow)">
          <rect x="-18" y="-142" width="36" height="282" rx="12" fill="url(#darkMetal)" stroke="#06101c" stroke-width="8"/>
          <rect x="-9" y="-118" width="18" height="226" rx="7" fill="${c.accent}" opacity=".74"/>
          <rect x="-28" y="-78" width="56" height="18" rx="8" fill="${c.main}" stroke="#06101c" stroke-width="6"/>
          <rect x="-28" y="8" width="56" height="18" rx="8" fill="${c.main}" stroke="#06101c" stroke-width="6"/>
          <path d="M0 -190 L14 -150 L0 -164 L-14 -150 Z" fill="${c.trim}" stroke="#06101c" stroke-width="7" stroke-linejoin="round"/>
          <circle cx="0" cy="-42" r="15" fill="${c.glow}" opacity=".52" filter="url(#glow)"/>
        </g>
        ${seam("M366 130 L354 206")}
        ${seam("M132 162 L142 238")}
        ${bolts([[358, 126], [128, 166], [318, 236]], 5)}
      </g>`);
    return svg(`
      <g transform="translate(384 226) rotate(20)" filter="url(#hardShadow)">
        <rect x="-12" y="-184" width="24" height="318" rx="8" fill="url(#darkMetal)" stroke="#06101c" stroke-width="8"/>
        <rect x="-5" y="-144" width="10" height="236" rx="5" fill="${c.glow}" opacity=".62" filter="url(#glow)"/>
        <path d="M0 -244 L18 -176 L0 -196 L-18 -176 Z" fill="${c.accent}" stroke="#06101c" stroke-width="8" stroke-linejoin="round"/>
        <rect x="-26" y="-82" width="52" height="18" rx="8" fill="${c.main}" stroke="#06101c" stroke-width="6"/>
        <rect x="-26" y="8" width="52" height="18" rx="8" fill="${c.main}" stroke="#06101c" stroke-width="6"/>
        <rect x="-25" y="-26" width="50" height="54" rx="12" fill="${c.glow}" opacity=".72" filter="url(#glow)"/>
        <path d="M-32 36 H32" stroke="${c.trim}" stroke-width="6" stroke-linecap="round"/>
      </g>`);
  }
  if (unit.key === "nova") {
    if (layer === "back") return svg(`
      <g opacity=".98">
        ${plate("M154 108 L82 166 L116 242 L190 186 Z", "url(#darkMetal)")}
        ${plate("M358 108 L430 166 L396 242 L322 186 Z", "url(#darkMetal)")}
        ${plate("M136 136 L94 176 L124 218 L168 180 Z", "url(#accentMetal)", .88)}
        ${plate("M376 136 L418 176 L388 218 L344 180 Z", "url(#accentMetal)", .88)}
        ${plate("M112 286 L66 360 L154 338 L178 286 Z", "url(#darkMetal)", .9)}
        ${plate("M400 286 L446 360 L358 338 L334 286 Z", "url(#darkMetal)", .9)}
        ${plate("M88 326 L52 398 L136 362 Z", c.trim, .78)}
        ${plate("M424 326 L460 398 L376 362 Z", c.trim, .78)}
        ${seam("M86 190 L138 204 L168 178", c.trim, 4)}
        ${seam("M426 190 L374 204 L344 178", c.trim, 4)}
        ${seam("M92 338 L144 350", c.glow, 4)}
        ${seam("M420 338 L368 350", c.glow, 4)}
        <circle cx="126" cy="354" r="28" fill="${c.glow}" opacity=".34" filter="url(#glow)"/>
        <circle cx="386" cy="354" r="28" fill="${c.glow}" opacity=".34" filter="url(#glow)"/>
        ${bolts([[154, 158], [358, 158], [134, 316], [378, 316]], 5)}
      </g>`);
    return svg(`
      <g stroke="${c.glow}" stroke-width="10" stroke-linecap="round" opacity=".85" filter="url(#glow)">
        <path d="M124 346 L66 430"/>
        <path d="M388 346 L446 430"/>
      </g>
      <g stroke="${c.trim}" stroke-width="5" stroke-linecap="round" opacity=".78">
        <path d="M112 300 L152 340"/>
        <path d="M400 300 L360 340"/>
      </g>`);
  }
  if (unit.key === "helix") {
    if (layer === "back") return svg(`
      <circle cx="124" cy="228" r="74" fill="none" stroke="${c.glow}" stroke-width="16" opacity=".82" filter="url(#glow)"/>
      <circle cx="388" cy="228" r="74" fill="none" stroke="${c.glow}" stroke-width="16" opacity=".82" filter="url(#glow)"/>
      ${plate("M104 178 L72 226 L100 282 L148 262 L158 204 Z", "url(#darkMetal)", .86)}
      ${plate("M408 178 L440 226 L412 282 L364 262 L354 204 Z", "url(#darkMetal)", .86)}
      <path d="M84 360 C150 296 212 300 256 350 C300 300 362 296 428 360" fill="none" stroke="${c.glow}" stroke-width="11" opacity=".75" filter="url(#glow)"/>
    `);
    return svg(`<circle cx="256" cy="246" r="24" fill="${c.glow}" opacity=".55" filter="url(#glow)"/>`);
  }
  if (unit.key === "bastion") {
    if (layer === "back") return svg(`
      <g opacity=".98">
        ${plate("M112 86 L160 116 L146 318 L88 292 Z", "url(#darkMetal)")}
        ${plate("M400 86 L352 116 L366 318 L424 292 Z", "url(#darkMetal)")}
        <g filter="url(#hardShadow)">
          <g transform="translate(98 160) rotate(-9)">
            <rect x="-26" y="-122" width="52" height="238" rx="18" fill="url(#darkMetal)" stroke="#06101c" stroke-width="10"/>
            <rect x="-12" y="-142" width="24" height="116" rx="10" fill="${c.dark}" stroke="#06101c" stroke-width="7"/>
            <rect x="-8" y="-134" width="16" height="74" rx="7" fill="${c.accent}" opacity=".72"/>
            <circle cx="0" cy="-126" r="8" fill="#050912"/>
            <rect x="-17" y="-20" width="34" height="16" rx="7" fill="${c.glow}" opacity=".45" filter="url(#glow)"/>
            <rect x="-18" y="44" width="36" height="12" rx="6" fill="${c.main}" opacity=".66"/>
          </g>
          <g transform="translate(414 160) rotate(9)">
            <rect x="-26" y="-122" width="52" height="238" rx="18" fill="url(#darkMetal)" stroke="#06101c" stroke-width="10"/>
            <rect x="-12" y="-142" width="24" height="116" rx="10" fill="${c.dark}" stroke="#06101c" stroke-width="7"/>
            <rect x="-8" y="-134" width="16" height="74" rx="7" fill="${c.accent}" opacity=".72"/>
            <circle cx="0" cy="-126" r="8" fill="#050912"/>
            <rect x="-17" y="-20" width="34" height="16" rx="7" fill="${c.glow}" opacity=".45" filter="url(#glow)"/>
            <rect x="-18" y="44" width="36" height="12" rx="6" fill="${c.main}" opacity=".66"/>
          </g>
        </g>
        ${seam("M104 92 V246")}
        ${seam("M408 92 V246")}
        ${bolts([[142, 124], [370, 124], [130, 262], [382, 262]], 5)}
      </g>`);
    return svg(`
      <ellipse cx="256" cy="384" rx="118" ry="26" fill="${c.glow}" opacity=".22" filter="url(#glow)"/>
      <g filter="url(#hardShadow)">
        <rect x="194" y="76" width="124" height="38" rx="14" fill="url(#darkMetal)" stroke="#06101c" stroke-width="8"/>
        <rect x="166" y="52" width="58" height="26" rx="10" fill="${c.accent}" stroke="#06101c" stroke-width="6"/>
        <rect x="288" y="52" width="58" height="26" rx="10" fill="${c.accent}" stroke="#06101c" stroke-width="6"/>
        <path d="M202 94 H310" stroke="${c.glow}" stroke-width="5" stroke-linecap="round" opacity=".55" filter="url(#glow)"/>
        <circle cx="184" cy="65" r="5" fill="#050912"/>
        <circle cx="328" cy="65" r="5" fill="#050912"/>
      </g>`);
  }
  if (unit.key === "mirage") {
    const pod = (x, y, r = 24) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.accent}" opacity=".95" filter="url(#glow)"/><path d="M${x - 12} ${y + 10} L${x - 44} ${y + 30}" stroke="${c.glow}" stroke-width="9" opacity=".7"/>`;
    if (layer === "back") return svg(`
      ${plate("M138 154 L94 224 L128 300 L178 250 Z", "url(#darkMetal)", .82)}
      ${plate("M374 154 L418 224 L384 300 L334 250 Z", "url(#darkMetal)", .82)}
      ${pod(92, 236, 30)}${pod(420, 236, 30)}${pod(126, 354, 24)}${pod(386, 354, 24)}
    `);
    return svg(`
      <g stroke="${c.glow}" stroke-width="5" opacity=".45" filter="url(#glow)">
        <path d="M92 236 C158 194 206 210 256 250 C306 210 354 194 420 236"/>
        <path d="M126 354 C178 334 220 348 256 386 C292 348 334 334 386 354"/>
      </g>
    `);
  }
  return svg("");
}

async function detailedBaseBuffer(unit) {
  const config = detailedSources[unit.key];
  let image = sharp(path.join(outDir, config.source)).ensureAlpha().resize(config.size, config.size, { fit: "contain" });
  if (config.modulate) image = image.modulate(config.modulate);
  return image.png().toBuffer();
}

async function makeDetailedSprite(unit) {
  const config = detailedSources[unit.key];
  const size = config.size;
  const offset = Math.round((512 - size) / 2);
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([
      { input: Buffer.from(fxSvg(unit, "back")), left: 0, top: 0 },
      { input: await detailedBaseBuffer(unit), left: offset, top: offset },
      { input: Buffer.from(fxSvg(unit, "front")), left: 0, top: 0 }
    ])
    .png()
    .toFile(path.join(outDir, `player-${unit.key}-sd.png`));
}

function detailedProfileBackground(unit) {
  const c = unit.colors;
  const linesFor = (value) => String(value)
    .split(" / ")
    .flatMap((part) => part.length > 11 ? [part.slice(0, 11), part.slice(11)] : [part])
    .filter(Boolean)
    .slice(0, 2);
  const specRow = (y, label, value, color = "#dce9ff") => `
    <text x="0" y="${y}" font-family="Microsoft JhengHei, sans-serif" font-size="17" font-weight="900" fill="${c.glow}">${esc(label)}</text>
    ${linesFor(value).map((line, index) => `<text x="0" y="${y + 26 + index * 24}" font-family="Microsoft JhengHei, sans-serif" font-size="19" font-weight="900" fill="${color}">${esc(line)}</text>`).join("")}`;
  const noteRows = unit.notes.map((note, index) => `
    <g transform="translate(0 ${index * 54})">
      <circle cx="0" cy="0" r="13" fill="${c.glow}" filter="url(#unitGlow)"/>
      <text x="28" y="7" font-family="Microsoft JhengHei, sans-serif" font-size="21" font-weight="900" fill="#eaf4ff">${esc(note)}</text>
    </g>
  `).join("");
  return svgFrame(768, 768, `
    <text x="46" y="64" font-family="Arial Black, Microsoft JhengHei, sans-serif" font-size="42" fill="#ffffff" stroke="#06101c" stroke-width="5" paint-order="stroke">${esc(unit.name)}</text>
    <text x="48" y="100" font-family="Microsoft JhengHei, sans-serif" font-size="22" font-weight="900" fill="${c.glow}">${esc(unit.role)}</text>
    <rect x="38" y="124" width="420" height="538" rx="18" fill="rgba(3,8,15,.6)" stroke="${c.glow}" stroke-opacity=".42"/>
    <rect x="486" y="130" width="236" height="510" rx="18" fill="rgba(3,8,15,.74)" stroke="${c.glow}" stroke-opacity=".48"/>
    <text x="512" y="174" font-family="Arial Black, Microsoft JhengHei, sans-serif" font-size="24" fill="#ffffff" stroke="#06101c" stroke-width="3" paint-order="stroke">機設資料</text>
    <g transform="translate(512 214)">
      ${specRow(0, "主武裝", unit.weapon)}
      ${specRow(96, "主動技", unit.active, "#ffffff")}
      ${specRow(174, "必殺技", unit.ultimate, "#ffffff")}
    </g>
    <text x="512" y="462" font-family="Microsoft JhengHei, sans-serif" font-size="18" font-weight="900" fill="${c.glow}">機設重點</text>
    <g transform="translate(526 500)">${noteRows}</g>
    <rect x="46" y="676" width="676" height="46" rx="12" fill="rgba(3,7,13,.72)" stroke="${c.glow}" stroke-opacity=".55"/>
    <text x="384" y="706" text-anchor="middle" font-family="Microsoft JhengHei, sans-serif" font-size="21" font-weight="900" fill="#eaf4ff">PLAYER MOBILE SUIT DESIGN SHEET</text>
  `, { glow: c.glow });
}

async function makeDetailedProfile(unit) {
  const sprite = await sharp(path.join(outDir, `player-${unit.key}-sd.png`))
    .resize(430, 430, { fit: "contain" })
    .png()
    .toBuffer();
  await sharp(Buffer.from(detailedProfileBackground(unit)))
    .composite([{ input: sprite, left: 38, top: 202 }])
    .png()
    .toFile(path.join(outDir, `player-${unit.key}-profile.png`));
}

async function makeDetailedLineup() {
  const bg = svgFrame(1200, 760, `
    <text x="54" y="70" font-family="Arial Black, Microsoft JhengHei, sans-serif" font-size="42" fill="#ffffff" stroke="#06101c" stroke-width="5" paint-order="stroke">玩家新機體設計</text>
    <text x="56" y="108" font-family="Microsoft JhengHei, sans-serif" font-size="20" fill="#9eefff">六款新機已獨立於敵機美術，全部以玩家機體配色和輪廓重新設計。</text>
    ${units.map((unit, i) => {
      const x = 210 + (i % 3) * 390;
      const y = 248 + Math.floor(i / 3) * 304;
      return `<g transform="translate(${x} ${y})">
        <rect x="-150" y="-174" width="300" height="292" rx="18" fill="rgba(5,10,18,.66)" stroke="${unit.colors.glow}" stroke-opacity=".55"/>
        <text x="0" y="118" text-anchor="middle" font-family="Arial Black, Microsoft JhengHei, sans-serif" font-size="24" fill="#ffffff" stroke="#06101c" stroke-width="5" paint-order="stroke">${esc(unit.name)}</text>
        <text x="0" y="144" text-anchor="middle" font-family="Microsoft JhengHei, sans-serif" font-size="15" font-weight="900" fill="${unit.colors.glow}">${esc(unit.role)}</text>
      </g>`;
    }).join("")}
  `, { glow: "#72e8ff" });
  const composites = [];
  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const x = 210 + (i % 3) * 390;
    const y = 248 + Math.floor(i / 3) * 304;
    composites.push({
      input: await sharp(path.join(outDir, `player-${unit.key}-sd.png`)).resize(226, 226, { fit: "contain" }).png().toBuffer(),
      left: x - 113,
      top: y - 150
    });
  }
  await sharp(Buffer.from(bg)).composite(composites).png().toFile(path.join(outDir, "player-new-lineup.png"));
}

async function generateDetailedAssets() {
  for (const unit of units) await makeDetailedSprite(unit);
  for (const unit of units) await makeDetailedProfile(unit);
  await makeDetailedLineup();
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  for (const unit of units) {
    await renderPng(spriteSvg(unit), `player-${unit.key}-sd.png`);
    await renderPng(profileSvg(unit), `player-${unit.key}-profile.png`);
  }
  await renderPng(lineupSvg(), "player-new-lineup.png");
  await renderPng(tutorialSvg(), "tutorial-controls.png");
  await generateDetailedAssets();
  console.log(`Generated ${units.length * 2 + 2} player/tutor assets in ${outDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
