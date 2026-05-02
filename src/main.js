const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const cardsEl = document.getElementById("cards");
const waveEl = document.getElementById("wave");
const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("best-score");
const enemyCountEl = document.getElementById("enemy-count");
const commandEl = document.getElementById("command");
const briefingEl = document.getElementById("briefing");
const formationEl = document.getElementById("formation");
const formationListEl = document.getElementById("formation-list");
const formationSlotsEl = document.getElementById("formation-slots");
const formationCountEl = document.getElementById("formation-count");
const formationStartEl = document.getElementById("formation-start");
const resultEl = document.getElementById("result");
const resultTitleEl = document.getElementById("result-title");
const resultCopyEl = document.getElementById("result-copy");
const rewardEl = document.getElementById("reward");
const rewardOptionsEl = document.getElementById("reward-options");
const intelEl = document.getElementById("intel");
const databaseListEl = document.getElementById("database-list");
const skillButtonsEl = document.getElementById("skill-buttons");

const W = 1280;
const H = 720;
const ALLIED_MIN_X = 72;
const ALLIED_MAX_X = W - 72;
const ALLIED_MIN_Y = 72;
const ALLIED_MAX_Y = H - 132;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const weaponDistance = (attacker, target) => Math.max(0, dist(attacker, target) - (target.faction === "Enemy" ? (target.radius || 0) * 0.72 : bodyRadius(target) * 0.35));
const now = () => performance.now() / 1000;
const battlefieldArt = "assets/battlefield-bg.png";
const labelFaction = (faction) => faction === "Allied" ? "友軍" : "敵軍";
let running = false;
let last = now();
let wave = 1;
let nextWaveAt = 0;
let pointer = null;
let selected = null;
let focusedUnit = null;
let messageTime = 0;
let score = 0;
let bestScore = Number(localStorage.getItem("cosmic-heart-best") || 0);
let rewardChoices = [];
let nextHudRefresh = 0;
const defaultSquadNames = ["Asterion", "Caliburn", "Seraphim", "Orion"];
let selectedSquadNames = [...defaultSquadNames];
let formationFocusName = "Asterion";
const squadSlots = [
  { x: 210, y: 165 },
  { x: 290, y: 290 },
  { x: 195, y: 415 },
  { x: 355, y: 450 }
];

const squadSeeds = [
  { name: "Asterion", faction: "Allied", role: "相轉移裝甲前衛", weapon: "對艦光束軍刀 / 盾牌衝撞", trait: "最高耐久。適合頂在前線，拖住近戰敵人。", tactic: "先把它拉進敵群吸火，讓遠程機在後方輸出。", color: "#4be4ff", x: 260, y: 250, maxHp: 175, range: 190, damage: 19, rate: 0.82, speed: 145, skill: "守護爆發", activeDesc: "短時間替附近友軍加上護盾。", ultimate: "重力嘲諷場", ultimateDesc: "吸引範圍內敵人轉為攻擊 Asterion。", activeIcon: "assets/skill-asterion-active.png", ultimateIcon: "assets/skill-asterion-ultimate.png", art: "assets/asterion-profile.png", sprite: "assets/sd-asterion.png" },
  { name: "Caliburn", faction: "Allied", role: "光束軍刀決鬥機", weapon: "雙軍刀突擊 / 近距離光束手槍", trait: "攻速最高，爆發強，但裝甲較薄。", tactic: "等 Asterion 拉住仇恨後，把它拉去斬落孤立目標或指揮機。", color: "#ff5b66", x: 310, y: 390, maxHp: 130, range: 210, damage: 31, rate: 0.7, speed: 172, skill: "SEED 突擊", activeDesc: "斬擊 Caliburn 附近所有敵人。", ultimate: "流星斬", ultimateDesc: "對最近多個目標造成重擊。", activeIcon: "assets/skill-caliburn-active.png", ultimateIcon: "assets/skill-caliburn-ultimate.png", art: "assets/caliburn-profile.png", sprite: "assets/sd-caliburn.png" },
  { name: "Seraphim", faction: "Allied", role: "修復與護盾支援機", weapon: "納米修復光束", trait: "不會攻擊。負責維修友軍，射程更遠且生存力提升。", tactic: "鎖定前線友軍後，Seraphim 會保持最大補血距離內跟隨。", color: "#62e6a7", x: 190, y: 500, maxHp: 145, range: 235, damage: -30, rate: 0.88, speed: 150, skill: "幻象修復", activeDesc: "大範圍修復附近友軍機體。", ultimate: "天使光環", ultimateDesc: "復活倒下友軍，並大幅回復全隊。", activeIcon: "assets/skill-seraphim-active.png", ultimateIcon: "assets/skill-seraphim-ultimate.png", art: "assets/seraphim-profile.png", sprite: "assets/sd-seraphim.png" },
  { name: "Orion", faction: "Allied", role: "龍騎兵炮擊機", weapon: "長距離光束炮 / 遙控炮莢", trait: "射程最長。移動慢且脆，但收割能力極高。", tactic: "放在安全側翼輸出。主動技可同時打多個目標。", color: "#ffd166", x: 180, y: 150, maxHp: 105, range: 240, damage: 23, rate: 1.45, speed: 115, skill: "全方位齊射", activeDesc: "遙控炮莢同時射擊多名敵人。", ultimate: "衛星全炮門", ultimateDesc: "向全場敵人發射大型光束爆發。", activeIcon: "assets/skill-orion-active.png", ultimateIcon: "assets/skill-orion-ultimate.png", art: "assets/orion-profile.png", sprite: "assets/sd-orion.png" },
  { name: "Valkyr", faction: "Allied", role: "重盾防線機", weapon: "大型抗光束盾 / 近距離散射炮", trait: "防禦力高，能保護隊友，但輸出和速度較低。", tactic: "放在前線邊緣承受火力，配合 Seraphim 可形成穩固防線。", color: "#8bd7ff", x: 230, y: 250, maxHp: 190, range: 185, damage: 16, rate: 1.02, speed: 120, skill: "屏障陣列", activeDesc: "替全隊展開短時間護盾，前線隊友效果更強。", ultimate: "零域壁壘", ultimateDesc: "大幅強化全隊護盾，並吸引附近敵軍火力。", activeIcon: "assets/upgrade-phase-armor.png", ultimateIcon: "assets/upgrade-guardian-reactor.png", art: "assets/player-valkyr-profile.png", sprite: "assets/player-valkyr-sd.png" },
  { name: "Lancer", faction: "Allied", role: "軌道狙擊機", weapon: "超長距離穿甲光束長槍", trait: "單發傷害極高，擅長處理重裝敵人和 Boss。", tactic: "留在後排鎖定高 HP 目標，避免被高速敵機近身。", color: "#4aa8ff", x: 170, y: 210, maxHp: 98, range: 285, damage: 34, rate: 1.82, speed: 112, skill: "穿甲狙擊", activeDesc: "立即狙擊當前最高 HP 敵人，造成破甲重擊。", ultimate: "軌道貫穿", ultimateDesc: "向最強敵人發射超遠距離貫穿炮。", activeIcon: "assets/upgrade-beam-capacitors.png", ultimateIcon: "assets/skill-orion-ultimate.png", art: "assets/player-lancer-profile.png", sprite: "assets/player-lancer-sd.png" },
  { name: "Nova", faction: "Allied", role: "高機動突擊機", weapon: "熱能刃 / 短距離爆發推進器", trait: "速度最快，可快速切入敵群，但耐久中等。", tactic: "用來追擊後排或清理密集小兵，避免單獨承受 Boss 火力。", color: "#ff9b38", x: 250, y: 430, maxHp: 128, range: 190, damage: 26, rate: 0.76, speed: 198, skill: "熱刃旋風", activeDesc: "對附近敵人造成範圍斬擊。", ultimate: "突擊超載", ultimateDesc: "短時間高速突入，重創周圍多名敵軍。", activeIcon: "assets/upgrade-seed-rush.png", ultimateIcon: "assets/skill-caliburn-ultimate.png", art: "assets/player-nova-profile.png", sprite: "assets/player-nova-sd.png" },
  { name: "Helix", faction: "Allied", role: "戰場維修航標機", weapon: "遠距離修復鏈 / 防護航標", trait: "第二款補機。治療較穩定，能給被鎖定友軍額外護盾。", tactic: "適合跟住主坦或近戰機，令前線更持久。", color: "#7cffc4", x: 200, y: 470, maxHp: 138, range: 225, damage: -22, rate: 0.72, speed: 158, skill: "修復航標", activeDesc: "標記最受傷友軍，立即補血並給予護盾。", ultimate: "再生節點", ultimateDesc: "回復全隊並復活一架倒下機體。", activeIcon: "assets/upgrade-repair-drones.png", ultimateIcon: "assets/skill-seraphim-ultimate.png", art: "assets/player-helix-profile.png", sprite: "assets/player-helix-sd.png" },
  { name: "Bastion", faction: "Allied", role: "中距離重炮機", weapon: "肩部重粒子炮 / 壓制榴彈", trait: "中距離火力穩定，擅長打厚血敵人和小範圍壓制。", tactic: "放在前線後一格，讓坦機吸火後持續炮擊。", color: "#f6c34f", x: 255, y: 340, maxHp: 158, range: 245, damage: 29, rate: 1.18, speed: 104, skill: "重炮壓制", activeDesc: "炮擊最高 HP 敵人，並波及附近敵機。", ultimate: "要塞齊射", ultimateDesc: "對全場多個敵人發射重炮轟擊。", activeIcon: "assets/upgrade-beam-capacitors.png", ultimateIcon: "assets/upgrade-overclocked-servos.png", art: "assets/player-bastion-profile.png", sprite: "assets/player-bastion-sd.png" },
  { name: "Mirage", faction: "Allied", role: "電子干擾中距離機", weapon: "幻象浮游炮 / 干擾脈衝", trait: "輸出中等，但可降低敵軍移速和火力，保護後排。", tactic: "放在隊伍中央，主動技可拖慢湧入敵群。", color: "#c37bff", x: 245, y: 230, maxHp: 120, range: 220, damage: 20, rate: 0.88, speed: 168, skill: "幻象干擾", activeDesc: "干擾附近敵人，短時間降低移速和傷害。", ultimate: "海市蜃樓域", ultimateDesc: "大範圍癱瘓敵軍火控並造成傷害。", activeIcon: "assets/upgrade-dragoon-pods.png", ultimateIcon: "assets/skill-orion-active.png", art: "assets/player-mirage-profile.png", sprite: "assets/player-mirage-sd.png" }
];

const enemyTypes = {
  drone: {
    name: "Vesper Drone",
    faction: "Enemy",
    role: "量產突擊機",
    weapon: "光束卡賓槍 / 推進翼",
    trait: "速度快，會成群攻擊最近友軍。",
    tactic: "裝甲薄。用 Asterion 聚怪，再由 Caliburn 或 Orion 清場。",
    color: "#b767ff",
    maxHpBase: 34,
    range: 92,
    damage: 6,
    speedBase: 46,
    rateBase: 1.65,
    radius: 22,
    points: 75,
    art: "assets/enemy-drone-profile.png",
    sprite: "assets/sd-drone.png"
  },
  raider: {
    name: "Helios Raider",
    faction: "Enemy",
    role: "高速軍刀伏擊機",
    weapon: "熱能軍刀 / 爆發推進器",
    trait: "高速但脆弱，會突入孤立機體。",
    tactic: "讓 Asterion 攔截，避免它貼近 Orion 或 Seraphim。",
    color: "#ff9b38",
    maxHpBase: 30,
    range: 76,
    damage: 8,
    speedBase: 78,
    rateBase: 1.25,
    radius: 21,
    points: 105,
    art: "assets/enemy-raider-profile.png",
    sprite: "assets/sd-raider.png"
  },
  sniper: {
    name: "Azure Lancer",
    faction: "Enemy",
    role: "長距離光束狙擊機",
    weapon: "軌道光束長槍",
    trait: "移動慢，但射程長；放著不理會很危險。",
    tactic: "派 Caliburn 近身斬落，或用 Orion 對射壓制。",
    color: "#4aa8ff",
    maxHpBase: 42,
    range: 230,
    damage: 9,
    speedBase: 34,
    rateBase: 2.05,
    radius: 24,
    points: 125,
    art: "assets/enemy-sniper-profile.png",
    sprite: "assets/sd-sniper.png"
  },
  guard: {
    name: "Obsidian Guard",
    faction: "Enemy",
    role: "重裝盾牌機",
    weapon: "盾牌衝撞 / 重型卡賓槍",
    trait: "高耐久、移動慢，會替敵方吸收傷害。",
    tactic: "除非卡住近戰機，否則可先清其他威脅。",
    color: "#9aa0aa",
    maxHpBase: 88,
    range: 105,
    damage: 7,
    speedBase: 30,
    rateBase: 1.9,
    radius: 31,
    points: 150,
    art: "assets/enemy-guard-profile.png",
    sprite: "assets/sd-guard.png"
  },
  commander: {
    name: "Crimson Marshal",
    faction: "Enemy",
    role: "指揮火力支援機",
    weapon: "重型光束步槍 / 肩部推進器",
    trait: "耐久與射程較高，會壓迫我方維修機。",
    tactic: "用 Caliburn 與 Orion 集火，別讓 Seraphim 漂到前面。",
    color: "#ff3f55",
    maxHpBase: 62,
    range: 150,
    damage: 10,
    speedBase: 42,
    rateBase: 1.55,
    radius: 27,
    points: 175,
    art: "assets/enemy-commander-profile.png",
    sprite: "assets/sd-commander.png"
  },
  boss: {
    name: "Dread Sovereign",
    faction: "Enemy",
    role: "王牌機動裝甲 Boss",
    weapon: "全方位光束陣列 / 翼炮",
    trait: "Boss 機。高耐久、高射程，每 3 回合出現。",
    tactic: "保持 Asterion 有護盾，全隊集火，技能一好就用。",
    color: "#f6c34f",
    maxHpBase: 230,
    range: 190,
    damage: 15,
    speedBase: 25,
    rateBase: 1.28,
    radius: 48,
    points: 700,
    boss: true,
    art: "assets/enemy-boss-profile.png",
    sprite: "assets/sd-boss.png"
  }
};

const upgradePool = [
  {
    id: "beam-capacitors",
    type: "武器",
    name: "高出力光束電容",
    icon: "assets/upgrade-beam-capacitors.png",
    text: "所有攻擊型機體武器傷害 +15%。",
    apply() {
      squad.forEach((u) => {
        if (u.damage > 0) u.damage = Math.round(u.damage * 1.15);
      });
    }
  },
  {
    id: "phase-armor",
    type: "裝甲",
    name: "相轉移裝甲改修",
    icon: "assets/upgrade-phase-armor.png",
    text: "全體友軍最大 HP +25，並立即修復 25 HP。",
    apply() {
      squad.forEach((u) => {
        u.maxHp += 25;
        u.hp = clamp(u.hp + 25, 1, u.maxHp);
      });
    }
  },
  {
    id: "guardian-reactor",
    unit: "Asterion",
    type: "Asterion 技能",
    name: "守護反應爐",
    icon: "assets/upgrade-guardian-reactor.png",
    text: "Asterion 最大 HP +45、傷害 +5，守護爆發持續更久。",
    apply() {
      const u = squad.find((unit) => unit.name === "Asterion");
      if (!u) return;
      u.maxHp += 45;
      u.hp = clamp(u.hp + 45, 1, u.maxHp);
      u.damage += 5;
      u.shieldDuration = (u.shieldDuration || 5) + 2;
    }
  },
  {
    id: "seed-rush",
    unit: "Caliburn",
    type: "Caliburn 武器",
    name: "SEED 突擊 OS",
    icon: "assets/upgrade-seed-rush.png",
    text: "Caliburn 傷害 +12、攻擊更快，突擊技能更強。",
    apply() {
      const u = squad.find((unit) => unit.name === "Caliburn");
      if (!u) return;
      u.damage += 12;
      u.rate = Math.max(0.38, u.rate * 0.86);
      u.rushDamage = (u.rushDamage || 46) + 18;
      u.rushRadius = (u.rushRadius || 170) + 25;
    }
  },
  {
    id: "repair-drones",
    unit: "Seraphim",
    type: "Seraphim 技能",
    name: "修復無人機群",
    icon: "assets/upgrade-repair-drones.png",
    text: "Seraphim 治療量提升、射程更遠，群體修復更強。",
    apply() {
      const u = squad.find((unit) => unit.name === "Seraphim");
      if (!u) return;
      u.damage -= 9;
      u.range += 28;
      u.burstHeal = (u.burstHeal || 56) + 22;
    }
  },
  {
    id: "dragoon-pods",
    unit: "Orion",
    type: "Orion 武器",
    name: "龍騎兵炮莢擴充",
    icon: "assets/upgrade-dragoon-pods.png",
    text: "Orion 傷害 +9、射程 +35，主動技發射更多炮莢。",
    apply() {
      const u = squad.find((unit) => unit.name === "Orion");
      if (!u) return;
      u.damage += 9;
      u.range += 35;
      u.volleyCount = (u.volleyCount || 7) + 3;
      u.volleyDamage = (u.volleyDamage || 34) + 8;
    }
  },
  {
    id: "valkyr-zero-core",
    unit: "Valkyr",
    type: "Valkyr 技能",
    name: "零域護盾核心",
    icon: "assets/upgrade-guardian-reactor.png",
    text: "Valkyr 最大 HP +55、射程 +25，屏障陣列和零域壁壘持續更久。",
    apply() {
      const u = squad.find((unit) => unit.name === "Valkyr");
      if (!u) return;
      u.maxHp += 55;
      u.hp = clamp(u.hp + 55, 1, u.maxHp);
      u.range += 25;
      u.shieldDuration = (u.shieldDuration || 6) + 2;
      u.tauntDurationBonus = (u.tauntDurationBonus || 0) + 1.5;
    }
  },
  {
    id: "lancer-rail-scope",
    unit: "Lancer",
    type: "Lancer 武器",
    name: "軌道照準器",
    icon: "assets/upgrade-beam-capacitors.png",
    text: "Lancer 傷害 +14、射程 +35，穿甲狙擊和軌道貫穿更痛。",
    apply() {
      const u = squad.find((unit) => unit.name === "Lancer");
      if (!u) return;
      u.damage += 14;
      u.range += 35;
      u.lancerBonus = (u.lancerBonus || 0) + 36;
    }
  },
  {
    id: "nova-assault-wing",
    unit: "Nova",
    type: "Nova 機動",
    name: "突擊推進翼",
    icon: "assets/upgrade-seed-rush.png",
    text: "Nova 傷害 +8、射程 +30、速度 +24，範圍斬擊更大。",
    apply() {
      const u = squad.find((unit) => unit.name === "Nova");
      if (!u) return;
      u.damage += 8;
      u.range += 30;
      u.speed += 24;
      u.rushRadius = (u.rushRadius || 190) + 35;
      u.rushDamage = (u.rushDamage || 54) + 16;
    }
  },
  {
    id: "helix-beacon-grid",
    unit: "Helix",
    type: "Helix 維修",
    name: "航標修復矩陣",
    icon: "assets/upgrade-repair-drones.png",
    text: "Helix 治療量提升、射程 +35，修復航標會給更厚護盾。",
    apply() {
      const u = squad.find((unit) => unit.name === "Helix");
      if (!u) return;
      u.damage -= 8;
      u.range += 35;
      u.maxHp += 25;
      u.hp = clamp(u.hp + 25, 1, u.maxHp);
      u.beaconHeal = (u.beaconHeal || 42) + 24;
      u.beaconShield = (u.beaconShield || 4) + 2;
    }
  },
  {
    id: "bastion-stabilizer",
    unit: "Bastion",
    type: "Bastion 重炮",
    name: "重炮穩定器",
    icon: "assets/upgrade-overclocked-servos.png",
    text: "Bastion 傷害 +10、射程 +30，重炮壓制範圍擴大。",
    apply() {
      const u = squad.find((unit) => unit.name === "Bastion");
      if (!u) return;
      u.damage += 10;
      u.range += 30;
      u.splashRadius = (u.splashRadius || 92) + 28;
      u.bastionBonus = (u.bastionBonus || 0) + 22;
    }
  },
  {
    id: "mirage-phantom-core",
    unit: "Mirage",
    type: "Mirage 干擾",
    name: "幻象干擾核心",
    icon: "assets/upgrade-dragoon-pods.png",
    text: "Mirage 傷害 +8、射程 +25，干擾持續時間和範圍提升。",
    apply() {
      const u = squad.find((unit) => unit.name === "Mirage");
      if (!u) return;
      u.damage += 8;
      u.range += 25;
      u.jamRadius = (u.jamRadius || 250) + 45;
      u.jamDuration = (u.jamDuration || 4.5) + 1.5;
    }
  },
  {
    id: "overclocked-servos",
    type: "機動",
    name: "超頻 AMBAC 伺服系統",
    icon: "assets/upgrade-overclocked-servos.png",
    text: "全體機體移動更快，攻擊間隔縮短 8%。",
    apply() {
      squad.forEach((u) => {
        u.speed += 18;
        u.rate = Math.max(0.36, u.rate * 0.92);
      });
    }
  },
  {
    id: "emergency-nanites",
    type: "生存",
    name: "緊急納米修復槽",
    icon: "assets/upgrade-emergency-nanites.png",
    text: "全體回復 40% HP；已擊破機體以 35% HP 回歸。",
    apply() {
      squad.forEach((u) => {
        const reviveHp = Math.ceil(u.maxHp * 0.35);
        const heal = Math.ceil(u.maxHp * 0.4);
        u.hp = u.hp <= 0 ? reviveHp : clamp(u.hp + heal, 1, u.maxHp);
      });
    }
  }
];

let squad = [];
let enemies = [];
let shots = [];
let sparks = [];
let stars = [];
const art = new Map();

function selectedSquadSeeds() {
  const selectedSeeds = selectedSquadNames
    .map((name) => squadSeeds.find((unit) => unit.name === name))
    .filter(Boolean);
  return selectedSeeds.length === 4
    ? selectedSeeds
    : defaultSquadNames.map((name) => squadSeeds.find((unit) => unit.name === name));
}

function reset() {
  squad = selectedSquadSeeds().map((u, i) => {
    const slot = squadSlots[i] || { x: 220 + i * 42, y: 220 + i * 88 };
    return ({
    ...u,
    id: `u${i}`,
    x: slot.x,
    y: slot.y,
    hp: u.maxHp,
    target: null,
    move: { x: slot.x, y: slot.y },
    cooldown: 0,
    skillCooldown: 0,
    shield: 0,
    attackPulse: 0,
    aim: null,
    command: "idle",
    assistId: null,
    ultCharge: 0,
    ultMax: 100
    });
  });
  enemies = [];
  shots = [];
  sparks = [];
  wave = 1;
  score = 0;
  nextWaveAt = 0;
  selected = null;
  focusedUnit = squad[0];
  pointer = null;
  commandEl.textContent = "待命";
  resultEl.hidden = true;
  resultEl.classList.remove("lost", "won");
  rewardEl.hidden = true;
  rewardChoices = [];
  nextHudRefresh = 0;
  spawnWave();
  renderIntel(squad[0]);
  updateSkillBar();
}

function spawnWave() {
  const isBossRound = wave % 3 === 0;
  const difficulty = getDifficulty();
  const count = Math.min(15, 2 + Math.floor(wave * 0.82) + (isBossRound ? 0 : 0));
  for (let i = 0; i < count; i++) {
    const typeKey = chooseEnemyType(i, count, isBossRound);
    const type = enemyTypes[typeKey];
    const maxHp = Math.round((type.maxHpBase + wave * (type.boss ? 34 : 5.5)) * difficulty.hp);
    const damage = Math.round(type.damage * difficulty.damage * 10) / 10;
    enemies.push({
      id: `e${wave}-${i}-${Math.random()}`,
      type: typeKey,
      name: type.name,
      faction: type.faction,
      role: type.role,
      weapon: type.weapon,
      trait: type.trait,
      tactic: type.tactic,
      art: type.art,
      sprite: type.sprite,
      x: W + 70 + Math.random() * 260,
      y: 90 + Math.random() * (H - 180),
      maxHp,
      hp: maxHp,
      color: type.color,
      range: type.range,
      damage,
      speed: type.speedBase + Math.min(30, wave * 1.7),
      rate: Math.max(0.58, type.rateBase - Math.min(0.52, wave * 0.024)),
      cooldown: 0.45 + Math.random() * 0.9,
      radius: type.radius,
      points: type.points,
      boss: Boolean(type.boss),
      attackPulse: 0,
      aim: null,
      tauntTarget: null,
      tauntTime: 0,
      jamTime: 0,
      slowTime: 0
    });
  }
  setMessage(isBossRound ? `Boss 回合 ${wave}` : `第 ${wave} 回合`);
}

function getDifficulty() {
  const early = Math.max(0, wave - 3);
  const late = Math.max(0, wave - 9);
  return {
    hp: 1 + early * 0.075 + late * 0.055,
    damage: 1 + early * 0.055 + late * 0.045
  };
}

function chooseEnemyType(index, count, isBossRound) {
  if (isBossRound && index === count - 1) return "boss";
  if (wave < 2) return "drone";
  const pool = ["drone", "drone"];
  if (wave >= 2) pool.push("raider");
  if (wave >= 5) pool.push("sniper");
  if (wave >= 6) pool.push("guard");
  if (wave >= 8) pool.push("raider", "sniper");
  if (wave >= 11) pool.push("guard", "commander");
  if (wave >= 4 && index === count - 2) pool.push("commander");
  return pool[(index + wave + Math.floor(Math.random() * pool.length)) % pool.length];
}

function setMessage(text) {
  commandEl.textContent = text;
  messageTime = now() + 1.8;
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const scale = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width = Math.round(rect.width * scale);
  canvas.height = Math.round(rect.height * scale);
  ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * W,
    y: ((event.clientY - rect.top) / rect.height) * H
  };
}

function unitAt(point) {
  const alive = squad.filter((u) => u.hp > 0);
  return alive.find((u) => dist(u, point) < bodyRadius(u));
}

function enemyAt(point) {
  return enemies.find((e) => e.hp > 0 && dist(e, point) < e.radius + 18);
}

function issueCommand(unit, point) {
  const enemy = enemyAt(point);
  const ally = unitAt(point);

  if (enemy && unit.damage > 0) {
    unit.target = enemy.id;
    unit.move = null;
    unit.command = "attack";
    unit.assistId = null;
    renderIntel(enemy);
    setMessage(`${unit.name}: 攻擊 ${enemy.name}`);
    return;
  }

  if (ally && ally.id !== unit.id && unit.damage < 0) {
    unit.target = ally.id;
    unit.move = null;
    unit.command = "support";
    unit.assistId = null;
    renderIntel(ally);
    setMessage(`${unit.name}: 修復 ${ally.name}`);
    return;
  }

  if (ally && ally.id !== unit.id && unit.damage > 0) {
    const allyTarget = enemies.find((e) => e.id === ally.target && e.hp > 0);
    unit.target = allyTarget?.id || null;
    unit.assistId = ally.id;
    unit.move = null;
    unit.command = "assist";
    renderIntel(ally);
    setMessage(`${unit.name}: 協助 ${ally.name}`);
    return;
  }

  unit.target = null;
  unit.move = {
    x: clamp(point.x, ALLIED_MIN_X, ALLIED_MAX_X),
    y: clamp(point.y, ALLIED_MIN_Y, ALLIED_MAX_Y)
  };
  unit.command = "move";
  unit.assistId = null;
  setMessage(`${unit.name}: 移動`);
}

function activateSkill(unit) {
  if (!unit || unit.hp <= 0) return;
  if (unit.skillCooldown > 0) {
    setMessage(`${unit.skill}: 冷卻 ${Math.ceil(unit.skillCooldown)} 秒`);
    unit.buttonPulse = 0.25;
    return;
  }
  unit.skillCooldown = 10;
  unit.buttonPulse = 0.35;
  unit.attackPulse = 0.26;
  if (unit.name === "Asterion") {
    squad.forEach((ally) => {
      if (ally.hp > 0 && dist(unit, ally) < 230) ally.shield = unit.shieldDuration || 5;
    });
    burst(unit.x, unit.y, "#4be4ff", 38);
    setMessage("守護爆發已展開");
  } else if (unit.name === "Caliburn") {
    enemies.filter((e) => dist(unit, e) < (unit.rushRadius || 220)).forEach((e) => hit(e, unit.rushDamage || 52, "#ff5b66", unit.id));
    burst(unit.x, unit.y, "#ff5b66", 30);
    setMessage("SEED 突擊發動");
  } else if (unit.name === "Seraphim") {
    squad.forEach((ally) => {
      if (dist(unit, ally) < Math.max(300, unit.range + 80)) {
        const hpBefore = ally.hp;
        ally.hp = clamp(ally.hp + (unit.burstHeal || 56), 0, ally.maxHp);
        chargeUltimateByHealing(unit, ally.hp - hpBefore);
      }
    });
    burst(unit.x, unit.y, "#62e6a7", 34);
    setMessage("幻象修復已部署");
  } else if (unit.name === "Orion") {
    enemies.slice(0, unit.volleyCount || 7).forEach((e) => {
      shots.push({ x: unit.x, y: unit.y, tx: e.x, ty: e.y, color: "#ffd166", life: 0.28, maxLife: 0.28, damage: unit.volleyDamage || 34, target: e.id, source: unit.id });
    });
    setMessage("全方位齊射");
  } else if (unit.name === "Valkyr") {
    squad.forEach((ally) => {
      if (ally.hp > 0) ally.shield = dist(unit, ally) < 260 ? 6 : 3.5;
    });
    burst(unit.x, unit.y, "#8bd7ff", 42);
    setMessage("屏障陣列展開");
  } else if (unit.name === "Lancer") {
    const target = enemies.filter((e) => e.hp > 0).sort((a, b) => b.hp - a.hp)[0];
    if (target) {
      unit.target = target.id;
      shots.push({ x: unit.x, y: unit.y, tx: target.x, ty: target.y, color: "#4aa8ff", life: 0.2, maxLife: 0.2, damage: 84 + unit.damage + (unit.lancerBonus || 0), target: target.id, source: unit.id });
      burst(unit.x, unit.y, "#4aa8ff", 24);
      setMessage("穿甲狙擊");
    }
  } else if (unit.name === "Nova") {
    enemies.filter((e) => e.hp > 0 && dist(unit, e) < (unit.rushRadius || 205)).forEach((e) => hit(e, unit.rushDamage || 58, "#ff9b38", unit.id));
    unit.speedBoost = 4;
    burst(unit.x, unit.y, "#ff9b38", 46);
    setMessage("熱刃旋風");
  } else if (unit.name === "Helix") {
    const target = squad
      .filter((ally) => ally.hp > 0)
      .sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];
    if (target) {
      const hpBefore = target.hp;
      target.hp = clamp(target.hp + (unit.beaconHeal || 42), 1, target.maxHp);
      target.shield = Math.max(target.shield || 0, unit.beaconShield || 4);
      chargeUltimateByHealing(unit, target.hp - hpBefore);
      unit.target = target.id;
      unit.command = "support";
      burst(target.x, target.y, "#7cffc4", 34);
    }
    setMessage("修復航標");
  } else if (unit.name === "Bastion") {
    const target = enemies.filter((e) => e.hp > 0).sort((a, b) => b.hp - a.hp)[0];
    if (target) {
      const radius = unit.splashRadius || 92;
      hit(target, 70 + unit.damage + (unit.bastionBonus || 0), "#f6c34f", unit.id);
      enemies.filter((e) => e.hp > 0 && e.id !== target.id && dist(e, target) < radius).forEach((e) => hit(e, 32 + Math.floor(unit.damage * 0.45), "#f6c34f", unit.id));
      burst(target.x, target.y, "#f6c34f", 56);
    }
    setMessage("重炮壓制");
  } else if (unit.name === "Mirage") {
    const radius = unit.jamRadius || 250;
    const duration = unit.jamDuration || 4.5;
    enemies.filter((e) => e.hp > 0 && dist(unit, e) < radius).forEach((e) => {
      e.jamTime = Math.max(e.jamTime || 0, duration);
      e.slowTime = Math.max(e.slowTime || 0, duration);
      hit(e, 18 + Math.floor(unit.damage * 0.5), "#c37bff", unit.id);
    });
    burst(unit.x, unit.y, "#c37bff", 52);
    setMessage("幻象干擾");
  }
}

function useUltimate(unit) {
  if (!unit || unit.hp <= 0) return;
  const charge = Math.floor(((unit.ultCharge || 0) / (unit.ultMax || 100)) * 100);
  if (charge < 100) {
    setMessage(`${unit.ultimate}: 能量 ${charge}%`);
    unit.buttonPulse = 0.25;
    return;
  }
  unit.ultCharge = 0;
  unit.buttonPulse = 0.45;
  unit.attackPulse = 0.32;

  if (unit.name === "Asterion") {
    const tauntDuration = 7 + (unit.tauntDurationBonus || 0);
    const tauntRange = 310;
    squad.forEach((ally) => {
      if (ally.hp > 0 && dist(unit, ally) < 260) ally.shield = 5;
    });
    enemies.filter((e) => e.hp > 0 && dist(unit, e) < tauntRange).forEach((e) => {
      e.tauntTarget = unit.id;
      e.tauntTime = tauntDuration;
      e.aim = { x: unit.x, y: unit.y };
    });
    burst(unit.x, unit.y, "#4be4ff", 70);
    setMessage("重力嘲諷場");
    return;
  }

  if (unit.name === "Caliburn") {
    enemies
      .filter((e) => e.hp > 0)
      .sort((a, b) => dist(unit, a) - dist(unit, b))
      .slice(0, 6)
      .forEach((e) => hit(e, 120 + unit.damage, "#ff5b66", unit.id));
    burst(unit.x, unit.y, "#ff5b66", 65);
    setMessage("流星斬");
    return;
  }

  if (unit.name === "Seraphim") {
    squad.forEach((ally) => {
      ally.hp = ally.hp <= 0 ? Math.ceil(ally.maxHp * 0.45) : clamp(ally.hp + Math.ceil(ally.maxHp * 0.7), 1, ally.maxHp);
      ally.shield = 5;
    });
    burst(unit.x, unit.y, "#62e6a7", 75);
    setMessage("天使光環");
    return;
  }

  if (unit.name === "Orion") {
    enemies.forEach((e) => {
      shots.push({ x: unit.x, y: unit.y, tx: e.x, ty: e.y, color: "#ffd166", life: 0.38, maxLife: 0.38, damage: 105 + unit.damage, target: e.id, source: unit.id });
    });
    burst(unit.x, unit.y, "#ffd166", 72);
    setMessage("衛星全炮門");
    return;
  }

  if (unit.name === "Valkyr") {
    squad.forEach((ally) => {
      if (ally.hp > 0) ally.shield = 8 + Math.floor((unit.shieldDuration || 6) * 0.35);
    });
    enemies.filter((e) => e.hp > 0 && dist(unit, e) < 340).forEach((e) => {
      e.tauntTarget = unit.id;
      e.tauntTime = 6 + (unit.tauntDurationBonus || 0);
      e.aim = { x: unit.x, y: unit.y };
    });
    burst(unit.x, unit.y, "#8bd7ff", 82);
    setMessage("零域壁壘");
    return;
  }

  if (unit.name === "Lancer") {
    const target = enemies.filter((e) => e.hp > 0).sort((a, b) => b.maxHp - a.maxHp || b.hp - a.hp)[0];
    if (target) {
      unit.target = target.id;
      shots.push({ x: unit.x, y: unit.y, tx: target.x, ty: target.y, color: "#4aa8ff", life: 0.42, maxLife: 0.42, damage: 185 + unit.damage + (unit.lancerBonus || 0), target: target.id, source: unit.id });
      burst(target.x, target.y, "#4aa8ff", 72);
    }
    setMessage("軌道貫穿");
    return;
  }

  if (unit.name === "Nova") {
    const targets = enemies
      .filter((e) => e.hp > 0)
      .sort((a, b) => dist(unit, a) - dist(unit, b))
      .slice(0, 8);
    targets.forEach((e) => hit(e, 92 + Math.floor(unit.damage * 0.5), "#ff9b38", unit.id));
    unit.speedBoost = 5;
    burst(unit.x, unit.y, "#ff9b38", 88);
    setMessage("突擊超載");
    return;
  }

  if (unit.name === "Helix") {
    let revived = false;
    squad.forEach((ally) => {
      if (ally.hp <= 0 && !revived) {
        ally.hp = Math.ceil(ally.maxHp * 0.38);
        revived = true;
      } else if (ally.hp > 0) {
        const hpBefore = ally.hp;
        ally.hp = clamp(ally.hp + Math.ceil(ally.maxHp * 0.55), 1, ally.maxHp);
        chargeUltimateByHealing(unit, ally.hp - hpBefore);
      }
      ally.shield = Math.max(ally.shield || 0, 4.5);
    });
    burst(unit.x, unit.y, "#7cffc4", 76);
    setMessage("再生節點");
    return;
  }

  if (unit.name === "Bastion") {
    enemies
      .filter((e) => e.hp > 0)
      .sort((a, b) => b.hp - a.hp)
      .slice(0, 8)
      .forEach((e) => {
        hit(e, 90 + unit.damage + (unit.bastionBonus || 0), "#f6c34f", unit.id);
        burst(e.x, e.y, "#f6c34f", 24);
      });
    burst(unit.x, unit.y, "#f6c34f", 82);
    setMessage("要塞齊射");
    return;
  }

  if (unit.name === "Mirage") {
    const duration = (unit.jamDuration || 4.5) + 2.5;
    enemies.filter((e) => e.hp > 0).forEach((e) => {
      e.jamTime = Math.max(e.jamTime || 0, duration);
      e.slowTime = Math.max(e.slowTime || 0, duration);
      hit(e, 42 + unit.damage, "#c37bff", unit.id);
    });
    burst(unit.x, unit.y, "#c37bff", 84);
    setMessage("海市蜃樓域");
    return;
  }

  enemies.forEach((e) => {
    shots.push({ x: unit.x, y: unit.y, tx: e.x, ty: e.y, color: "#ffd166", life: 0.38, maxLife: 0.38, damage: 105 + unit.damage, target: e.id, source: unit.id });
  });
  burst(unit.x, unit.y, "#ffd166", 72);
  setMessage("衛星全炮門");
}

function hit(target, amount, color, sourceId = null) {
  const wasAlive = target.hp > 0;
  target.hp -= amount;
  burst(target.x, target.y, color, 10);
  if (wasAlive && target.hp <= 0) {
    chargeUltimate(sourceId, target.boss ? 55 : 28);
    score += target.points || 50;
    if (target.boss) score += wave * 100;
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem("cosmic-heart-best", String(bestScore));
    }
  }
}

function chargeUltimate(sourceId, amount) {
  const unit = squad.find((u) => u.id === sourceId && u.hp > 0);
  if (!unit) return;
  unit.ultCharge = clamp((unit.ultCharge || 0) + amount, 0, unit.ultMax || 100);
}

function chargeUltimateByHealing(unit, amount) {
  if (!unit || unit.hp <= 0 || amount <= 0) return;
  chargeUltimate(unit.id, Math.max(1, amount * 0.42));
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    sparks.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 260,
      vy: (Math.random() - 0.5) * 260,
      color,
      life: 0.35 + Math.random() * 0.25
    });
  }
}

function acquireTarget(unit, allowOutOfRange = false) {
  if (unit.damage < 0) {
    return squad
      .filter((ally) => ally.hp > 0 && ally.hp < ally.maxHp && (ally.id !== unit.id || ally.hp / ally.maxHp < 0.78) && (allowOutOfRange || dist(unit, ally) <= unit.range))
      .sort((a, b) => {
        const selfBiasA = a.id === unit.id ? -0.16 : 0;
        const selfBiasB = b.id === unit.id ? -0.16 : 0;
        return (a.hp / a.maxHp + selfBiasA) - (b.hp / b.maxHp + selfBiasB);
      })[0] || null;
  }
  return enemies
    .filter((enemy) => enemy.hp > 0 && enemy.x <= W - 30 && (allowOutOfRange || weaponDistance(unit, enemy) <= unit.range))
    .sort((a, b) => weaponDistance(unit, a) - weaponDistance(unit, b))[0] || null;
}

function syncAssistTarget(unit) {
  if (unit.command !== "assist" || unit.damage < 0 || !unit.assistId) return null;
  const assisted = squad.find((ally) => ally.id === unit.assistId && ally.hp > 0);
  if (!assisted) {
    unit.command = "attack";
    unit.assistId = null;
    return acquireTarget(unit, true);
  }

  const assistedTarget = enemies.find((enemy) => enemy.id === assisted.target && enemy.hp > 0);
  if (assistedTarget) {
    unit.target = assistedTarget.id;
    return assistedTarget;
  }

  if (dist(unit, assisted) > 86) {
    unit.target = null;
    unit.move = { x: assisted.x - 42, y: assisted.y + 28 };
  }
  return null;
}

function stepUnit(unit, dt) {
  if (unit.hp <= 0) return;
  unit.cooldown = Math.max(0, unit.cooldown - dt);
  unit.skillCooldown = Math.max(0, unit.skillCooldown - dt);
  unit.shield = Math.max(0, unit.shield - dt);
  unit.attackPulse = Math.max(0, (unit.attackPulse || 0) - dt);
  unit.buttonPulse = Math.max(0, (unit.buttonPulse || 0) - dt);
  unit.speedBoost = Math.max(0, (unit.speedBoost || 0) - dt);
  if (unit.damage < 0 && unit.hp < unit.maxHp * 0.58 && unit.shield <= 0) unit.shield = 1.6;
  const moveSpeed = unit.speed * (unit.speedBoost > 0 ? 1.34 : 1);

  let target = syncAssistTarget(unit) || (unit.damage < 0
    ? squad.find((u) => u.id === unit.target && u.hp > 0)
    : enemies.find((e) => e.id === unit.target && e.hp > 0));

  if (unit.damage < 0 && target && target.hp >= target.maxHp && unit.command !== "support") {
    target = null;
    unit.target = null;
  }

  const manualMoveActive = unit.command === "move" && unit.move && dist(unit, unit.move) > 6;
  if (manualMoveActive) {
    unit.target = null;
    moveToward(unit, unit.move, moveSpeed * dt);
    return;
  }

  if (unit.command === "move" && unit.move) {
    unit.move = null;
    unit.command = "idle";
  }

  if (!target) {
    target = acquireTarget(unit, unit.command === "attack" || unit.command === "support");
    if (target) {
      unit.target = target.id;
      unit.move = null;
    }
  }

  if (target) {
    if (unit.damage < 0) {
      const d = dist(unit, target);
      const preferredHealDistance = Math.max(118, unit.range * 0.86);
      const followHealDistance = unit.range * 0.99;
      if (target.id !== unit.id) {
        if (d > followHealDistance) moveToward(unit, target, moveSpeed * dt);
        else if (d < preferredHealDistance) moveAwayFrom(unit, target, moveSpeed * dt * 0.72);
      }

      if (target.hp < target.maxHp && d <= unit.range && unit.cooldown <= 0) {
        unit.cooldown = unit.rate;
        unit.attackPulse = 0.22;
        unit.aim = { x: target.x, y: target.y };
        const hpBefore = target.hp;
        target.hp = clamp(target.hp - unit.damage, 0, target.maxHp);
        chargeUltimateByHealing(unit, target.hp - hpBefore);
        shots.push({ x: unit.x, y: unit.y, tx: target.x, ty: target.y, color: unit.color, life: 0.42, maxLife: 0.42, heal: true, source: unit.id });
      }
      return;
    }

    const d = weaponDistance(unit, target);
    if (d > unit.range) moveToward(unit, target, moveSpeed * dt, unit.damage > 0);
    if (d <= unit.range && unit.cooldown <= 0) {
      unit.cooldown = unit.rate;
      unit.attackPulse = 0.22;
      unit.aim = { x: target.x, y: target.y };
      shots.push({ x: unit.x, y: unit.y, tx: target.x, ty: target.y, color: unit.color, life: 0.24, maxLife: 0.24, damage: unit.damage, target: target.id, source: unit.id });
    }
    return;
  }

  if (unit.move && dist(unit, unit.move) > 6) {
    moveToward(unit, unit.move, moveSpeed * dt);
    const opportunisticTarget = acquireTarget(unit);
    if (opportunisticTarget) {
      unit.target = opportunisticTarget.id;
      unit.move = null;
    }
  }
}

function moveToward(actor, target, amount, limitAutoChase = false) {
  const dx = target.x - actor.x;
  const dy = target.y - actor.y;
  const d = Math.hypot(dx, dy) || 1;
  actor.x += (dx / d) * Math.min(amount, d);
  actor.y += (dy / d) * Math.min(amount, d);
  if (actor.faction === "Allied") clampToBattlefield(actor, limitAutoChase);
}

function moveAwayFrom(actor, target, amount) {
  const dx = actor.x - target.x;
  const dy = actor.y - target.y;
  const d = Math.hypot(dx, dy) || 1;
  actor.x += (dx / d) * amount;
  actor.y += (dy / d) * amount;
  if (actor.faction === "Allied") clampToBattlefield(actor, false);
}

function clampToBattlefield(actor, limitAutoChase = false) {
  actor.x = clamp(actor.x, ALLIED_MIN_X, limitAutoChase ? W * 0.75 : ALLIED_MAX_X);
  actor.y = clamp(actor.y, ALLIED_MIN_Y, ALLIED_MAX_Y);
}

function bodyRadius(actor) {
  if (actor.bodyRadius) return actor.bodyRadius;
  if (actor.radius) return actor.radius + (actor.boss ? 20 : 13);
  if (actor.name === "Asterion" || actor.name === "Orion") return 44;
  if (actor.name === "Valkyr") return 47;
  if (actor.name === "Lancer") return 38;
  if (actor.name === "Helix") return 37;
  if (actor.name === "Bastion") return 52;
  if (actor.name === "Mirage") return 41;
  if (actor.name === "Seraphim") return 39;
  return 41;
}

function clampUnitAfterSeparation(unit) {
  if (unit.faction === "Allied") {
    clampToBattlefield(unit, false);
    return;
  }
  unit.x = clamp(unit.x, 48, W + 170);
  unit.y = clamp(unit.y, 60, H - 80);
}

function resolveBodyOverlaps() {
  const bodies = [
    ...squad.filter((unit) => unit.hp > 0),
    ...enemies.filter((enemy) => enemy.hp > 0 && enemy.x > -80 && enemy.x < W + 180)
  ];

  for (let pass = 0; pass < 3; pass++) {
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i];
        const b = bodies[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d = Math.hypot(dx, dy);
        const minD = bodyRadius(a) + bodyRadius(b);
        if (d >= minD) continue;
        if (d < 0.01) {
          const angle = (i * 2.399 + j * 1.731 + pass * 0.917) % (Math.PI * 2);
          dx = Math.cos(angle);
          dy = Math.sin(angle);
          d = 1;
        }

        const push = (minD - d) * 0.5;
        const nx = dx / d;
        const ny = dy / d;
        a.x -= nx * push;
        a.y -= ny * push;
        b.x += nx * push;
        b.y += ny * push;
        clampUnitAfterSeparation(a);
        clampUnitAfterSeparation(b);
      }
    }
  }
}

function stepEnemy(enemy, dt) {
  const living = squad.filter((u) => u.hp > 0);
  if (!living.length) return;
  enemy.cooldown = Math.max(0, enemy.cooldown - dt);
  enemy.attackPulse = Math.max(0, (enemy.attackPulse || 0) - dt);
  enemy.tauntTime = Math.max(0, (enemy.tauntTime || 0) - dt);
  enemy.jamTime = Math.max(0, (enemy.jamTime || 0) - dt);
  enemy.slowTime = Math.max(0, (enemy.slowTime || 0) - dt);
  const target = chooseEnemyTarget(enemy, living);
  const d = dist(enemy, target);
  const speedFactor = enemy.slowTime > 0 ? 0.54 : 1;
  if (d > enemy.range) moveToward(enemy, target, enemy.speed * speedFactor * dt);
  if (d <= enemy.range && enemy.cooldown <= 0) {
    const jamFactor = enemy.jamTime > 0 ? 1.38 : 1;
    enemy.cooldown = enemy.rate * jamFactor + Math.random() * 0.22;
    enemy.attackPulse = 0.2;
    enemy.aim = { x: target.x, y: target.y };
    const baseDamage = enemy.damage * (enemy.jamTime > 0 ? 0.68 : 1);
    const damage = target.shield > 0 ? baseDamage * 0.45 : baseDamage;
    target.hp = clamp(target.hp - damage, 0, target.maxHp);
    shots.push({ x: enemy.x, y: enemy.y, tx: target.x, ty: target.y, color: enemy.color, life: 0.26, maxLife: 0.26 });
    burst(target.x, target.y, enemy.color, 5);
  }
}

function chooseEnemyTarget(enemy, living) {
  if (enemy.tauntTime > 0 && enemy.tauntTarget) {
    const taunted = living.find((unit) => unit.id === enemy.tauntTarget);
    if (taunted) return taunted;
  }

  const byDistance = [...living].sort((a, b) => dist(enemy, a) - dist(enemy, b));
  const vulnerable = living.filter((u) => u.name !== "Asterion" && u.name !== "Valkyr").sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
  const support = living.find((u) => u.name === "Seraphim" || u.name === "Helix");
  const artillery = living.find((u) => u.name === "Orion" || u.name === "Lancer" || u.name === "Bastion");

  if (enemy.type === "raider") return vulnerable[0] || byDistance[0];
  if (enemy.type === "sniper") return support || artillery || vulnerable[0] || byDistance[0];
  if (enemy.type === "commander" && wave >= 5) return support || byDistance[0];
  if (enemy.boss) return vulnerable[0] || support || byDistance[0];
  return byDistance[0];
}

function update(dt) {
  if (!running) return;
  squad.forEach((u) => stepUnit(u, dt));
  enemies.forEach((e) => stepEnemy(e, dt));
  resolveBodyOverlaps();

  shots.forEach((shot) => {
    shot.life -= dt;
    if (shot.life <= 0 && shot.damage) {
      const target = enemies.find((e) => e.id === shot.target);
      if (target) hit(target, shot.damage, shot.color, shot.source);
    }
  });
  shots = shots.filter((s) => s.life > -0.02);

  sparks.forEach((s) => {
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.life -= dt;
  });
  sparks = sparks.filter((s) => s.life > 0);
  enemies = enemies.filter((e) => e.hp > 0);

  if (!enemies.length && now() > nextWaveAt) {
    completeRound();
  }

  if (!squad.some((u) => u.hp > 0)) endMission(false);
  if (messageTime && now() > messageTime) {
    commandEl.textContent = "待命";
    messageTime = 0;
  }
  if (now() >= nextHudRefresh) {
    updateHud();
    nextHudRefresh = now() + 0.12;
  }
}

function completeRound() {
  score += 250 + wave * 35;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("cosmic-heart-best", String(bestScore));
  }
  if (wave % 3 === 0) {
    showReward();
    return;
  }
  advanceRound();
}

function advanceRound() {
  wave += 1;
  nextWaveAt = now() + 1.35;
  spawnWave();
}

function showReward() {
  running = false;
  rewardChoices = pickRewards();
  rewardOptionsEl.innerHTML = rewardChoices.map((reward, index) => `
    <button class="reward-card" data-reward-index="${index}">
      <img src="${reward.icon}?v=12" alt="${reward.name} icon" />
      <div class="reward-copy">
        <div class="reward-type">${reward.type}</div>
        <h3>${reward.name}</h3>
        <p>${reward.text}</p>
      </div>
    </button>
  `).join("");
  rewardEl.hidden = false;
  setMessage("選擇一項強化");
}

function pickRewards() {
  const activeNames = new Set(squad.map((unit) => unit.name));
  const pool = upgradePool.filter((reward) => !reward.unit || activeNames.has(reward.unit));
  const picks = [];
  while (picks.length < 3 && pool.length) {
    const index = Math.floor(Math.random() * pool.length);
    picks.push(pool.splice(index, 1)[0]);
  }
  return picks;
}

function chooseReward(index) {
  const reward = rewardChoices[index];
  if (!reward) return;
  reward.apply();
  score += 500;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("cosmic-heart-best", String(bestScore));
  }
  rewardEl.hidden = true;
  rewardChoices = [];
  renderIntel(squad.find((u) => u.hp > 0) || squad[0]);
  advanceRound();
  running = true;
}

function endMission(won) {
  running = false;
  document.body.classList.add("setup-mode");
  resizeCanvas();
  resultEl.classList.toggle("lost", !won);
  resultEl.classList.toggle("won", won);
  resultTitleEl.textContent = won ? "作戰完成" : "作戰失敗";
  resultCopyEl.innerHTML = `
    <div class="result-score">
      <span>最終分數</span>
      <strong>${score}</strong>
    </div>
    <div class="result-lines">
      <span>最高記錄 ${bestScore}</span>
      <span>抵達第 ${wave} 回合</span>
      <span>${won ? "艦隊防線仍然健在。" : "機體已撤退，重新整備後再出擊。"}</span>
    </div>
  `;
  resultEl.hidden = false;
}

function updateHud() {
  waveEl.textContent = wave % 3 === 0 ? `${wave} BOSS` : String(wave);
  scoreEl.textContent = String(score);
  bestScoreEl.textContent = String(bestScore);
  enemyCountEl.textContent = String(enemies.length);
  cardsEl.innerHTML = squad.map((u) => {
    const hp = Math.max(0, (u.hp / u.maxHp) * 100);
    const cool = 100 - Math.min(100, (u.skillCooldown / 10) * 100);
    return `
      <article class="unit-card" data-unit-id="${u.id}">
        <img src="${u.sprite || u.art}?v=31" alt="${u.name} artwork" />
        <div class="unit-info">
          <h3>${u.name}</h3>
          <div class="role">${u.role}</div>
          <div class="bar hp"><span style="width:${hp}%"></span></div>
          <div class="bar cool"><span style="width:${cool}%"></span></div>
        </div>
      </article>
    `;
  }).join("");
  updateSkillBar();
}

function updateSkillBar() {
  skillButtonsEl.innerHTML = squad.map((unit) => {
    const charge = Math.floor(((unit.ultCharge || 0) / (unit.ultMax || 100)) * 100);
    const dead = unit.hp <= 0;
    const activeCooling = unit.skillCooldown > 0;
    const ultCharging = charge < 100;
    const pulse = unit.buttonPulse > 0 ? "pulse" : "";
    return `
      <div class="skill-pair ${focusedUnit?.id === unit.id ? "focused" : ""}">
        <button class="skill-button active ${activeCooling ? "not-ready" : ""} ${pulse}" data-unit-id="${unit.id}" data-skill-kind="active" ${dead ? "disabled" : ""} title="${unit.name}: ${unit.skill} - ${unit.activeDesc}">
          <img src="${unit.activeIcon}?v=31" alt="${unit.skill}" />
          <span>${unit.skill}</span>
          <small>${activeCooling ? Math.ceil(unit.skillCooldown) + "秒" : unit.name}</small>
          <em>${unit.activeDesc}</em>
        </button>
        <button class="skill-button ultimate ${ultCharging ? "not-ready" : ""} ${pulse}" data-unit-id="${unit.id}" data-skill-kind="ultimate" style="--charge:${charge}%;" ${dead ? "disabled" : ""} title="${unit.name}: ${unit.ultimate} - ${unit.ultimateDesc}">
          <img src="${unit.ultimateIcon}?v=31" alt="${unit.ultimate}" />
          <span>${unit.ultimate}</span>
          <small>${charge}%</small>
          <em>${unit.ultimateDesc}</em>
        </button>
      </div>
    `;
  }).join("");
}

function getEnemyScale(enemy) {
  if (enemy.boss) return 1.55;
  if (enemy.type === "guard") return 1.18;
  if (enemy.type === "raider") return 0.92;
  return 1;
}

function renderIntel(unit) {
  if (!unit || !intelEl) return;
  const hp = unit.maxHp ? `${Math.ceil(Math.max(0, unit.hp ?? unit.maxHp))} / ${unit.maxHp}` : "不明";
  intelEl.innerHTML = `
    <p class="kicker">戰術情報</p>
    <div class="intel-layout">
      <img src="${unit.art || unit.sprite}?v=31" alt="${unit.name} profile" />
      <div>
        <h3>${unit.name}</h3>
        <div class="role">${labelFaction(unit.faction)} / ${unit.role}</div>
        <div class="spec-grid">
          <div><span>HP</span><strong>${hp}</strong></div>
          <div><span>武器</span><strong>${unit.weapon}</strong></div>
          <div><span>主動技</span><strong>${unit.skill ? `${unit.skill}: ${unit.activeDesc || "由下方技能列使用。"}` : "沒有"}</strong></div>
          ${unit.ultimate ? `<div><span>必殺技</span><strong>${unit.ultimate}: ${unit.ultimateDesc}</strong></div>` : ""}
          <div><span>特性</span><strong>${unit.trait}</strong></div>
          <div><span>用法</span><strong>${unit.tactic}</strong></div>
        </div>
      </div>
    </div>
  `;
}

function renderFormation() {
  if (!formationEl || !formationListEl || !formationSlotsEl) return;
  const focused = squadSeeds.find((unit) => unit.name === formationFocusName) || squadSeeds[0];
  formationFocusName = focused.name;
  formationCountEl.textContent = `已選 ${selectedSquadNames.length}/4`;
  formationStartEl.disabled = selectedSquadNames.length !== 4;

  formationSlotsEl.innerHTML = Array.from({ length: 4 }, (_, index) => {
    const unit = squadSeeds.find((seed) => seed.name === selectedSquadNames[index]);
    if (!unit) {
      return `<article class="formation-slot empty"><span>${index + 1}</span><strong>待選機體</strong></article>`;
    }
    return `
      <article class="formation-slot" data-unit-name="${unit.name}">
        <span>${index + 1}</span>
        <img src="${unit.sprite || unit.art}?v=31" alt="${unit.name} SD sprite" />
        <div>
          <strong>${unit.name}</strong>
          <small>${unit.role}</small>
        </div>
      </article>
    `;
  }).join("");

  formationListEl.innerHTML = squadSeeds.map((unit) => {
    const selectedForBattle = selectedSquadNames.includes(unit.name);
    const focusedClass = unit.name === focused.name ? "focused" : "";
    return `
      <article class="formation-card ${selectedForBattle ? "selected" : ""} ${focusedClass}" data-unit-name="${unit.name}">
        <img src="${unit.sprite || unit.art}?v=31" alt="${unit.name} SD sprite" />
        <div class="formation-card-copy">
          <div class="formation-card-title">
            <h3>${unit.name}</h3>
            <span>${unit.role}</span>
          </div>
          <p>${unit.trait}</p>
          <dl>
            <div><dt>射程</dt><dd>${unit.range}</dd></div>
            <div><dt>耐久</dt><dd>${unit.maxHp}</dd></div>
            <div><dt>主動</dt><dd>${unit.skill}</dd></div>
            <div><dt>必殺</dt><dd>${unit.ultimate}</dd></div>
          </dl>
        </div>
        <button class="formation-toggle" data-unit-name="${unit.name}" type="button">${selectedForBattle ? "移除" : "加入"}</button>
      </article>
    `;
  }).join("");
  renderIntel(focused);
}

function toggleFormationUnit(name) {
  formationFocusName = name;
  if (selectedSquadNames.includes(name)) {
    selectedSquadNames = selectedSquadNames.filter((unitName) => unitName !== name);
  } else if (selectedSquadNames.length < 4) {
    selectedSquadNames = [...selectedSquadNames, name];
  } else {
    setMessage("最多只能派出 4 架機體，請先移除一架。");
  }
  renderFormation();
}

function showFormation() {
  running = false;
  document.body.classList.add("setup-mode");
  briefingEl.hidden = true;
  rewardEl.hidden = true;
  resultEl.hidden = true;
  resultEl.classList.remove("lost", "won");
  formationEl.hidden = false;
  if (selectedSquadNames.length !== 4) selectedSquadNames = [...defaultSquadNames];
  formationFocusName = selectedSquadNames[0] || defaultSquadNames[0];
  resizeCanvas();
  renderFormation();
}

function startBattleFromFormation() {
  if (selectedSquadNames.length !== 4) {
    setMessage("請選擇 4 架機體出擊。");
    renderFormation();
    return;
  }
  formationEl.hidden = true;
  document.body.classList.remove("setup-mode");
  resizeCanvas();
  reset();
  running = true;
}

function renderDatabase() {
  const renderRows = (entries, className) => entries.map((unit) => `
    <article class="db-row ${className}">
      <img src="${unit.art || unit.sprite}?v=31" alt="${unit.name} design" />
      <div>
        <h3>${unit.name}</h3>
        <p>${labelFaction(unit.faction)} / ${unit.role}</p>
        <p>${unit.trait}</p>
      </div>
    </article>
  `).join("");
  databaseListEl.innerHTML = `
    <h3 class="db-heading player">玩家機體</h3>
    ${renderRows(squadSeeds, "player")}
    <h3 class="db-heading enemy">敵方機體</h3>
    ${renderRows(Object.values(enemyTypes), "enemy")}
  `;
}

function drawBackground() {
  const bg = art.get(battlefieldArt);
  if (bg?.complete && bg.naturalWidth > 0) {
    ctx.drawImage(bg, 0, 0, bg.naturalWidth, bg.naturalHeight, 0, 0, W, H);
    ctx.fillStyle = "rgba(2,5,10,0.24)";
    ctx.fillRect(0, 0, W, H);
  } else {
    ctx.fillStyle = "#05070b";
    ctx.fillRect(0, 0, W, H);
  }
  ctx.strokeStyle = "rgba(75,228,255,0.08)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - 140, H);
    ctx.stroke();
  }
  stars.forEach((s) => {
    ctx.fillStyle = s.color;
    ctx.globalAlpha = s.alpha;
    ctx.fillRect(s.x, s.y, s.size, s.size);
    ctx.globalAlpha = 1;
  });
  drawEnergyBoundary();
  ctx.fillStyle = "rgba(75,228,255,0.08)";
  ctx.fillRect(0, H - 72, W, 72);
}

function drawEnergyBoundary() {
  const x = W * 0.75;
  const t = now();
  const gradient = ctx.createLinearGradient(x - 46, 0, x + 36, 0);
  gradient.addColorStop(0, "rgba(75,228,255,0)");
  gradient.addColorStop(0.42, "rgba(75,228,255,0.18)");
  gradient.addColorStop(0.52, "rgba(220,255,255,0.46)");
  gradient.addColorStop(0.62, "rgba(75,228,255,0.2)");
  gradient.addColorStop(1, "rgba(75,228,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(x - 46, 0, 82, H);

  ctx.save();
  ctx.shadowColor = "#4be4ff";
  ctx.shadowBlur = 18;
  for (let i = 0; i < 5; i++) {
    const wave = Math.sin(t * 2.6 + i * 1.7) * 10;
    ctx.strokeStyle = i % 2 ? "rgba(255,255,255,0.48)" : "rgba(75,228,255,0.72)";
    ctx.lineWidth = i === 2 ? 3 : 1.5;
    ctx.beginPath();
    for (let y = -20; y <= H + 20; y += 24) {
      const px = x + Math.sin(y * 0.035 + t * 3.2 + i) * (10 + i * 2) + wave;
      if (y === -20) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    ctx.stroke();
  }

  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(4,8,14,0.28)";
  ctx.fillRect(x + 10, 0, W - x - 10, H);
  ctx.fillStyle = "rgba(75,228,255,0.85)";
  ctx.font = "800 16px 'Microsoft JhengHei', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("自動追擊邊界", x, 34);
  ctx.restore();
}

function attackOffset(actor) {
  if (!actor.aim || !actor.attackPulse) return { x: 0, y: 0 };
  const dx = actor.aim.x - actor.x;
  const dy = actor.aim.y - actor.y;
  const length = Math.hypot(dx, dy) || 1;
  const duration = actor.faction === "Enemy" ? 0.2 : 0.22;
  const force = Math.sin((1 - actor.attackPulse / duration) * Math.PI);
  const amount = actor.damage < 0 ? 5 : actor.faction === "Enemy" ? 7 : 10;
  return {
    x: (dx / length) * amount * force,
    y: (dy / length) * amount * force
  };
}

function drawSheetSprite(unit, width, height, yOffset = 0) {
  const img = art.get(unit.sprite || unit.sheet);
  if (!img?.complete || img.naturalWidth <= 0) return false;
  ctx.shadowColor = unit.color;
  ctx.shadowBlur = selected?.id === unit.id || focusedUnit?.id === unit.id ? 28 : 14;
  if (unit.sprite) {
    ctx.drawImage(img, -width / 2, -height / 2 + yOffset, width, height);
  } else if (unit.crop) {
    ctx.drawImage(
      img,
      unit.crop.x,
      unit.crop.y,
      unit.crop.w,
      unit.crop.h,
      -width / 2,
      -height / 2 + yOffset,
      width,
      height
    );
  } else {
    ctx.shadowBlur = 0;
    return false;
  }
  ctx.shadowBlur = 0;
  return true;
}

function drawMech(unit) {
  const alive = unit.hp > 0;
  const offset = attackOffset(unit);
  ctx.save();
  ctx.translate(unit.x + offset.x, unit.y + offset.y);
  ctx.globalAlpha = alive ? 1 : 0.18;
  const bob = Math.sin(now() * 3 + unit.x * 0.02) * 3;
  if (drawSheetSprite(unit, 108, 108, bob - 4)) {
    ctx.restore();
    if (!alive) return;
    if (unit.shield > 0) {
      ctx.strokeStyle = "rgba(75,228,255,0.55)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(unit.x, unit.y - 8, 50, 0, Math.PI * 2);
      ctx.stroke();
    }
    drawBar(unit.x - 34, unit.y + 44, 68, unit.hp / unit.maxHp, "#62e6a7");
    return;
  }
  ctx.strokeStyle = unit.color;
  ctx.fillStyle = "#101721";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, -28);
  ctx.lineTo(25, -4);
  ctx.lineTo(15, 28);
  ctx.lineTo(-15, 28);
  ctx.lineTo(-25, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = unit.color;
  ctx.fillRect(-7, -12, 14, 18);
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.moveTo(-22, -3);
  ctx.lineTo(-46, 18);
  ctx.moveTo(22, -3);
  ctx.lineTo(46, 18);
  ctx.stroke();
  if (unit.shield > 0) {
    ctx.strokeStyle = "rgba(75,228,255,0.55)";
    ctx.beginPath();
    ctx.arc(0, 0, 44, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
  if (!alive) return;
  drawBar(unit.x - 34, unit.y + 42, 68, unit.hp / unit.maxHp, "#62e6a7");
}

function drawEnemy(enemy) {
  const offset = attackOffset(enemy);
  ctx.save();
  ctx.translate(enemy.x + offset.x, enemy.y + offset.y);
  ctx.rotate(Math.sin(now() * 5 + enemy.y) * 0.08);
  const size = (enemy.type === "commander" ? 94 : 82) * getEnemyScale(enemy);
  if (drawSheetSprite(enemy, size, size, -2)) {
    ctx.restore();
    drawBar(enemy.x - 28, enemy.y + enemy.radius + 14, 56, enemy.hp / enemy.maxHp, "#ff5b66");
    return;
  }
  ctx.strokeStyle = enemy.color;
  ctx.fillStyle = enemy.name === "Red Commander" ? "#2a1118" : "#1b101b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -enemy.radius);
  ctx.lineTo(enemy.radius, 0);
  ctx.lineTo(0, enemy.radius);
  ctx.lineTo(-enemy.radius, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-enemy.radius - 10, -6);
  ctx.lineTo(-enemy.radius - 34, 11);
  ctx.lineTo(-enemy.radius - 5, 17);
  ctx.moveTo(enemy.radius + 10, -6);
  ctx.lineTo(enemy.radius + 34, 11);
  ctx.lineTo(enemy.radius + 5, 17);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.moveTo(-8, -enemy.radius - 8);
  ctx.lineTo(8, -enemy.radius - 8);
  ctx.stroke();
  ctx.fillStyle = enemy.color;
  ctx.fillRect(-5, -5, 10, 10);
  ctx.restore();
  drawBar(enemy.x - 28, enemy.y + enemy.radius + 10, 56, enemy.hp / enemy.maxHp, "#ff5b66");
}

function drawBar(x, y, width, percent, color) {
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(x, y, width, 6);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width * clamp(percent, 0, 1), 6);
}

function drawShots() {
  shots.forEach((s) => {
    const maxLife = s.maxLife || 0.24;
    const age = 1 - clamp(s.life / maxLife, 0, 1);
    const alpha = clamp(s.life / maxLife, 0, 1);
    const sx = s.x + (s.tx - s.x) * Math.min(age * 0.22, 0.18);
    const sy = s.y + (s.ty - s.y) * Math.min(age * 0.22, 0.18);
    const ex = s.tx - (s.tx - s.x) * Math.min((1 - age) * 0.08, 0.08);
    const ey = s.ty - (s.ty - s.y) * Math.min((1 - age) * 0.08, 0.08);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = s.color;
    ctx.shadowBlur = s.heal ? 18 : 14;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.heal ? 7 : 5;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = s.heal ? "rgba(220,255,235,0.9)" : "rgba(255,255,255,0.92)";
    ctx.lineWidth = s.heal ? 2 : 1.5;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    if (s.heal) {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = alpha * 0.8;
      ctx.beginPath();
      ctx.arc(s.tx, s.ty - 12, 18 + age * 36, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(s.x, s.y - 8, 10 + age * 22, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = s.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 6 + age * 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.86)";
      ctx.beginPath();
      ctx.arc(s.tx, s.ty, 4 + age * 12, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
}

function drawSparks() {
  sparks.forEach((s) => {
    ctx.fillStyle = s.color;
    ctx.globalAlpha = clamp(s.life * 2.5, 0, 1);
    ctx.fillRect(s.x, s.y, 4, 4);
    ctx.globalAlpha = 1;
  });
}

function drawPointer() {
  if (!pointer || !selected) return;
  ctx.strokeStyle = selected.damage < 0 ? "#62e6a7" : "#4be4ff";
  ctx.lineWidth = 4;
  ctx.setLineDash([12, 10]);
  ctx.beginPath();
  ctx.moveTo(selected.x, selected.y);
  ctx.lineTo(pointer.x, pointer.y);
  ctx.stroke();
  ctx.setLineDash([]);
}

function render() {
  drawBackground();
  enemies.forEach(drawEnemy);
  squad.filter((unit) => unit.hp <= 0).forEach(drawMech);
  squad.filter((unit) => unit.hp > 0).forEach(drawMech);
  drawShots();
  drawSparks();
  drawPointer();
}

function frame() {
  const t = now();
  const dt = Math.min(0.033, t - last);
  last = t;
  update(dt);
  render();
  requestAnimationFrame(frame);
}

function initStars() {
  stars = Array.from({ length: 170 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    size: 1 + Math.random() * 2,
    alpha: 0.25 + Math.random() * 0.7,
    color: Math.random() > 0.85 ? "#4be4ff" : "#ffffff"
  }));
}

function loadArt() {
  const paths = new Set([battlefieldArt]);
  [...squadSeeds, ...Object.values(enemyTypes)].forEach((unit) => {
    paths.add(unit.art);
    if (unit.sprite) paths.add(unit.sprite);
    if (unit.sheet) paths.add(unit.sheet);
  });
  paths.forEach((path) => {
    const img = new Image();
    img.src = path;
    art.set(path, img);
  });
}

canvas.addEventListener("pointerdown", (event) => {
  if (!running) return;
  const point = canvasPoint(event);
  selected = unitAt(point);
  if (selected) {
    focusedUnit = selected;
    pointer = point;
    renderIntel(selected);
    updateSkillBar();
    canvas.setPointerCapture(event.pointerId);
    return;
  }
  const enemy = enemyAt(point);
  if (enemy) renderIntel(enemy);
});

canvas.addEventListener("pointermove", (event) => {
  if (!running || !selected) return;
  pointer = canvasPoint(event);
});

canvas.addEventListener("pointerup", (event) => {
  if (!running || !selected) return;
  issueCommand(selected, canvasPoint(event));
  selected = null;
  pointer = null;
});

canvas.addEventListener("dblclick", (event) => {
  const unit = unitAt(canvasPoint(event));
  if (unit) activateSkill(unit);
});

cardsEl.addEventListener("click", (event) => {
  const card = event.target.closest(".unit-card");
  if (!card) return;
  const unit = squad.find((u) => u.id === card.dataset.unitId);
  if (unit) {
    focusedUnit = unit;
    renderIntel(unit);
    updateSkillBar();
  }
});

skillButtonsEl.addEventListener("pointerdown", (event) => {
  const button = event.target.closest(".skill-button");
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  const unit = squad.find((u) => u.id === button.dataset.unitId);
  if (!unit) return;
  focusedUnit = unit;
  renderIntel(unit);
  if (button.dataset.skillKind === "active") activateSkill(unit);
  else useUltimate(unit);
  updateSkillBar();
});

formationListEl.addEventListener("click", (event) => {
  const toggle = event.target.closest(".formation-toggle");
  const card = event.target.closest(".formation-card");
  const name = toggle?.dataset.unitName || card?.dataset.unitName;
  if (!name) return;
  formationFocusName = name;
  if (toggle) toggleFormationUnit(name);
  else renderFormation();
});

formationSlotsEl.addEventListener("click", (event) => {
  const slot = event.target.closest(".formation-slot[data-unit-name]");
  if (!slot) return;
  formationFocusName = slot.dataset.unitName;
  renderFormation();
});

rewardOptionsEl.addEventListener("click", (event) => {
  const card = event.target.closest(".reward-card");
  if (!card) return;
  chooseReward(Number(card.dataset.rewardIndex));
});

document.getElementById("start-btn").addEventListener("click", () => {
  showFormation();
});

formationStartEl.addEventListener("click", () => {
  startBattleFromFormation();
});

document.getElementById("restart-btn").addEventListener("click", () => {
  showFormation();
});

window.addEventListener("resize", resizeCanvas);
initStars();
loadArt();
renderDatabase();
renderFormation();
resizeCanvas();
reset();
render();
frame();
