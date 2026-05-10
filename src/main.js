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
const aceUnitListEl = document.getElementById("ace-unit-list");
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
const leaderboardEl = document.getElementById("leaderboard");
const leaderboardFormEl = document.getElementById("leaderboard-form");
const leaderboardListEl = document.getElementById("leaderboard-list");
const leaderboardMessageEl = document.getElementById("leaderboard-message");
const playerNameEl = document.getElementById("player-name");
const titleLeaderboardListEl = document.getElementById("title-leaderboard-list");
const titleLeaderboardMessageEl = document.getElementById("title-leaderboard-message");
const pauseToggleEl = document.getElementById("pause-toggle");
const pauseOverlayEl = document.getElementById("pause-overlay");
const pauseResumeEl = document.getElementById("pause-resume");
const pauseFormationEl = document.getElementById("pause-formation");
const loadingEl = document.getElementById("loading-overlay");
const loadingCopyEl = document.getElementById("loading-copy");

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
const battlefieldArt = "assets/battlefield-bg.webp";
const BACKDROP_VERSION = 21;
const UNIT_ART_VERSION = 42;
const REWARD_ICON_VERSION = 34;
const SKILL_ICON_VERSION = 43;
const IMAGE_LOAD_TIMEOUT_MS = 3000;
const REWARD_TIER_WEIGHTS = { common: 0.68, rare: 0.29, ultra: 0.03 };
const REWARD_ULTRA_PITY_LIMIT = 8;
const assetVersion = (path) => {
  if (path.includes("battlefield-bg")) return BACKDROP_VERSION;
  if (path.includes("skill-")) return SKILL_ICON_VERSION;
  if (path.includes("upgrade-")) return REWARD_ICON_VERSION;
  return UNIT_ART_VERSION;
};
const assetSrc = (path, version = assetVersion(path)) => `${path}?v=${version}`;
const labelFaction = (faction) => faction === "Allied" ? "友軍" : "敵軍";
const leaderboardDefaults = [
  { name: "Sun", score: 99230 },
  { name: "Candy", score: 86000 },
  { name: "Hayden", score: 85800 },
  { name: "Jeanis", score: 60080 }
];
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
let ultraRewardPity = 0;
let enemySpawnBonus = 0;
let genesisWaveActive = false;
let nextHudRefresh = 0;
let leaderboardScore = 0;
let leaderboardSubmitted = false;
let paused = false;
let pausedAt = 0;
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
  { name: "Asterion", faction: "Allied", role: "相轉移裝甲前衛", weapon: "對艦光束軍刀 / 重力制御核心", trait: "最高耐久。守護爆發可保護附近友軍，並令自身短時間持續回血。", tactic: "先把它拉進敵群吸火；大絕重力球可放在目標身後，把大範圍敵人拉成一團方便集火。", color: "#4be4ff", x: 260, y: 250, maxHp: 175, range: 190, damage: 19, rate: 0.82, speed: 145, skill: "守護爆發", activeDesc: "短時間替附近友軍加上護盾，並為 Asterion 自身少量持續回血。", ultimate: "重力球", ultimateDesc: "在目標身後生成重力球，持續將大範圍敵人拉向中心。", activeIcon: "assets/skill-asterion-guardian.webp", ultimateIcon: "assets/skill-asterion-gravity.webp", art: "assets/asterion-profile.webp", sprite: "assets/sd-asterion.webp" },
  { name: "Caliburn", faction: "Allied", role: "光束軍刀決鬥機", weapon: "雙軍刀突擊 / 近距離光束手槍", trait: "攻速最高，爆發強，但裝甲較薄。", tactic: "等 Asterion 拉住仇恨後，把它拉去斬落孤立目標或指揮機。", color: "#ff5b66", x: 310, y: 390, maxHp: 130, range: 210, damage: 31, rate: 0.7, speed: 172, skill: "SEED 突擊", activeDesc: "斬擊 Caliburn 附近所有敵人。", ultimate: "流星斬", ultimateDesc: "對最近多個目標造成重擊。", activeIcon: "assets/skill-caliburn-active.webp", ultimateIcon: "assets/skill-caliburn-ultimate.webp", art: "assets/caliburn-profile.webp", sprite: "assets/sd-caliburn.webp" },
  { name: "Seraphim", faction: "Allied", role: "修復與護盾支援機", weapon: "納米修復光束 / 守護護盾", trait: "大範圍即時修復，主動技能同時為友軍上護盾。", tactic: "鎖定前線友軍後，Seraphim 會保持最大補血距離內跟隨，適合救急和穩住全隊血線。", color: "#62e6a7", x: 190, y: 500, maxHp: 145, range: 235, damage: -30, rate: 0.88, speed: 150, skill: "幻象修復", activeDesc: "大範圍修復附近友軍，並為範圍內友軍加上護盾。", ultimate: "天使光環", ultimateDesc: "復活倒下友軍，並大幅回復全隊。", activeIcon: "assets/skill-seraphim-active.webp", ultimateIcon: "assets/skill-seraphim-ultimate.webp", art: "assets/seraphim-profile.webp", sprite: "assets/sd-seraphim.webp" },
  { name: "Orion", faction: "Allied", role: "龍騎兵清場炮擊機", weapon: "長距離光束炮 / 遙控炮莢", trait: "射程最長。單發較低但攻速快，擅長掃走大量低血敵機。", tactic: "放在安全側翼清小怪。主動技優先收割低血敵人，大絕適合清場但打 Boss 效率一般。", color: "#ffd166", x: 180, y: 150, maxHp: 96, range: 260, damage: 19, rate: 1.08, speed: 115, skill: "全方位齊射", activeDesc: "遙控炮莢優先射擊多名低血敵人。", ultimate: "衛星全炮門", ultimateDesc: "向全場敵人掃射，對小型敵機效果最佳。", activeIcon: "assets/skill-orion-active.webp", ultimateIcon: "assets/skill-orion-ultimate.webp", art: "assets/orion-profile.webp", sprite: "assets/sd-orion.webp" },
  { name: "Valkyr", faction: "Allied", role: "重盾嘲諷防線機", weapon: "大型抗光束盾 / GN 力場發生器", trait: "防禦力高，能主動吸引敵人火力；大絕可持續推開貼近敵機。", tactic: "放在前線邊緣承受火力，主動嘲諷把敵人拉住；GN 力場適合保護後排或阻止敵群壓入。", color: "#8bd7ff", x: 230, y: 250, maxHp: 190, range: 185, damage: 16, rate: 1.02, speed: 120, skill: "挑釁信標", activeDesc: "嘲諷範圍內敵人，強制它們攻擊 Valkyr。", ultimate: "GN 力場", ultimateDesc: "一段時間內生成小範圍力場，持續推開接近的敵機。", activeIcon: "assets/skill-valkyr-taunt.webp", ultimateIcon: "assets/skill-valkyr-gn-field.webp", art: "assets/player-valkyr-profile.webp", sprite: "assets/player-valkyr-sd.webp" },
  { name: "Lancer", faction: "Allied", role: "軌道狙擊機", weapon: "超長距離穿甲光束長槍", trait: "單發傷害極高，擅長處理重裝敵人和 Boss。", tactic: "留在後排鎖定高 HP 目標，避免被高速敵機近身。", color: "#4aa8ff", x: 170, y: 210, maxHp: 98, range: 500, damage: 34, rate: 1.82, speed: 112, skill: "穿甲狙擊", activeDesc: "立即狙擊當前最高 HP 敵人，造成破甲重擊。", ultimate: "軌道貫穿", ultimateDesc: "向最強敵人發射超遠距離貫穿炮。", activeIcon: "assets/skill-lancer-active-v1.webp", ultimateIcon: "assets/skill-lancer-ultimate-v1.webp", art: "assets/player-lancer-profile.webp", sprite: "assets/player-lancer-sd.webp" },
  { name: "Nova", faction: "Allied", role: "高機動突擊機", weapon: "量子刃 / 短距離相位推進器", trait: "速度最快，可穿插敵陣背刺，但耐久中等。", tactic: "用量子背刺切入敵方後排；量子化期間可穿透機體自由移動並爆發輸出。", color: "#ff9b38", x: 250, y: 430, maxHp: 128, range: 190, damage: 26, rate: 0.76, speed: 198, skill: "量子背刺", activeDesc: "高速移動到目標身後，並對附近敵人造成範圍斬擊。", ultimate: "量子化", ultimateDesc: "短時間穿透敵我機體自由移動，移速 +200%，普通攻擊變成範圍斬擊並提升攻擊力。", activeIcon: "assets/skill-nova-backstab-ai-v6.webp", ultimateIcon: "assets/skill-nova-phase-ai-v6.webp", art: "assets/player-nova-profile.webp", sprite: "assets/player-nova-sd.webp" },
  { name: "Helix", faction: "Allied", role: "範圍維修與隱形支援機", weapon: "再生力場 / 幻象粒子散布器", trait: "持續範圍回血，不負責爆發救急；大絕可隱形脫離敵人鎖定。", tactic: "放在隊伍中央或主坦身後，開主動技讓範圍內友軍持續回血；被狙擊或被敵群追擊時用幻象粒子脫身。", color: "#7cffc4", x: 200, y: 470, maxHp: 138, range: 245, damage: -22, rate: 0.72, speed: 158, skill: "再生力場", activeDesc: "範圍內友軍在一段時間內持續回血。", ultimate: "幻象粒子", ultimateDesc: "Helix 隱形一段時間，鎖定它的敵人會失去目標並改攻擊其他機。", activeIcon: "assets/skill-helix-active.webp", ultimateIcon: "assets/skill-helix-ultimate.webp", art: "assets/player-helix-profile.webp", sprite: "assets/player-helix-sd.webp" },
  { name: "Bastion", faction: "Allied", role: "重裝破甲炮擊機", weapon: "肩部重粒子炮 / 破甲榴彈", trait: "攻擊慢但單發極重，對 Boss 和厚血敵人特別有效。", tactic: "放在坦機後方專打高 HP 目標。主動技和大絕會轟炸目標周圍小範圍。", color: "#f6c34f", x: 255, y: 340, maxHp: 158, range: 265, damage: 64, rate: 2.7, speed: 52, skill: "重炮壓制", activeDesc: "炮擊最高 HP 敵人，對 Boss 額外傷害，並波及附近敵機。", ultimate: "要塞齊射", ultimateDesc: "集中轟炸最高威脅目標，對 Boss 造成巨額破甲傷害並小範圍濺射。", activeIcon: "assets/skill-bastion-suppression-green-v2.webp", ultimateIcon: "assets/skill-bastion-salvo-green-v2.webp", art: "assets/player-bastion-profile.webp", sprite: "assets/player-bastion-sd.webp" },
  { name: "Mirage", faction: "Allied", role: "電子干擾中距離機", weapon: "幻象浮游炮 / 干擾脈衝", trait: "輸出中等，但可降低敵軍移速和火力，保護後排。", tactic: "放在隊伍中央，主動技可拖慢湧入敵群。", color: "#c37bff", x: 245, y: 230, maxHp: 120, range: 220, damage: 20, rate: 0.88, speed: 168, skill: "持續干擾", activeDesc: "持續干擾附近敵人，短時間降低移速和傷害。", ultimate: "海市蜃樓域", ultimateDesc: "大範圍癱瘓敵軍火控，並於生效期間造成持續傷害。", activeIcon: "assets/skill-mirage-jammer-ai-v6.webp", ultimateIcon: "assets/skill-mirage-domain-ai-v6.webp", art: "assets/player-mirage-profile.webp", sprite: "assets/player-mirage-sd.webp" },
  { name: "MEGA(EK專用機)", ace: true, faction: "Allied", role: "皇牌機師專用坦機", weapon: "EK環刃 / 近身全方位斬擊", trait: "重裝近戰坦機，普攻會斬擊自身附近敵人；但會隨機迷路 3 秒並四圍衝。", tactic: "放在前線吸引敵軍。EK 光環是開關式光環，會持續拉住附近敵機；EK 定律可鎖定全場敵人，1 秒後爆炸並波及附近機體。", color: "#48a8ff", x: 225, y: 320, maxHp: 225, range: 150, damage: 24, rate: 1.05, speed: 108, skill: "EK光環", activeDesc: "啟動/停止 EK 光環；啟動期間持續吸引附近敵機，停止後冷卻 10 秒。", ultimate: "EK定律", ultimateDesc: "鎖定全場最高威脅敵人植入 EK 定律，1 秒後爆炸並波及附近機體。", activeIcon: "assets/skill-miles-fan-ek-aura.webp", ultimateIcon: "assets/skill-miles-fan-ek-law.webp", art: "assets/player-mega-ek-profile.webp", sprite: "assets/player-mega-ek-sd.webp" },
  { name: "Himawari (Candy專用機)", ace: true, faction: "Allied", role: "皇牌機師專用重裝支援機", weapon: "扇形激死你炮，連擊敵人會使敵人爆炸", trait: "略胖女性風重裝機，速度極慢。普攻會向前方扇形範圍攻擊；同一敵人連續被命中三次會引發小型爆炸。機體性能難以捉摸，經常不分敵我方，隨機師心情為友方機體上增益或減益。", tactic: "放在中後排用扇形 AOE 清線。持續鎖定同一敵人可觸發連擊爆炸；美女廚房適合毒殺厚血目標，發脾氣可震開身邊所有機體並全場雷射掃射。", color: "#ff7bd6", x: 225, y: 320, maxHp: 168, range: 255, damage: 22, rate: 1.35, speed: 42, spriteScale: 1.18, skill: "美女廚房", activeDesc: "向目標駕駛員投餵有毒食物，無視防禦，6 秒內按目標最大 HP 百分比造成持續傷害。對高血量敵機特別有效。", ultimate: "發脾氣", ultimateDesc: "震飛身邊所有機體，包括友方，並對全畫面敵機進行粗雷射掃射，造成大範圍爆發傷害。", passive: "我幫緊你", passiveDesc: "隨機時間對一名友方機體施加 3 秒狀態。可能是強化或干擾：攻擊力 +80%、防禦力 +80%、速度 -80%、攻擊力 -80%、防禦力 -80%。中狀態機體會有明顯標示。", activeIcon: "assets/skill-himawari-kitchen.webp", ultimateIcon: "assets/skill-himawari-tantrum.webp", art: "assets/player-himawari-profile.webp", sprite: "assets/player-himawari-sd.webp" }
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
    art: "assets/enemy-drone-profile.webp",
    sprite: "assets/sd-drone.webp"
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
    art: "assets/enemy-raider-profile.webp",
    sprite: "assets/sd-raider.webp"
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
    art: "assets/enemy-sniper-profile.webp",
    sprite: "assets/sd-sniper.webp"
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
    art: "assets/enemy-guard-profile.webp",
    sprite: "assets/sd-guard.webp"
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
    art: "assets/enemy-commander-profile.webp",
    sprite: "assets/sd-commander.webp"
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
    art: "assets/enemy-boss-profile.webp",
    sprite: "assets/sd-boss.webp"
  }
};

const upgradePool = [
  {
    id: "beam-capacitors",
    type: "武器",
    name: "高出力光束電容",
    icon: "assets/upgrade-beam-capacitors.webp",
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
    icon: "assets/upgrade-phase-armor.webp",
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
    icon: "assets/upgrade-asterion-gravity-core.webp",
    text: "Asterion 最大 HP +45、傷害 +5，守護爆發自我修復更久，重力球範圍更大。",
    apply() {
      const u = squad.find((unit) => unit.name === "Asterion");
      if (!u) return;
      u.maxHp += 45;
      u.hp = clamp(u.hp + 45, 1, u.maxHp);
      u.damage += 5;
      u.shieldDuration = (u.shieldDuration || 5) + 2;
      u.guardianRegenDuration = (u.guardianRegenDuration || 5) + 2;
      u.guardianRegenRate = (u.guardianRegenRate || 5) + 2;
      u.gravityRadius = (u.gravityRadius || 187) + 22;
      u.gravityPull = (u.gravityPull || 170) + 36;
    }
  },
  {
    id: "seed-rush",
    unit: "Caliburn",
    type: "Caliburn 武器",
    name: "SEED 突擊 OS",
    icon: "assets/upgrade-seed-rush.webp",
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
    icon: "assets/upgrade-repair-drones.webp",
    text: "Seraphim 治療量提升、射程更遠，幻象修復會加上更厚護盾。",
    apply() {
      const u = squad.find((unit) => unit.name === "Seraphim");
      if (!u) return;
      u.damage -= 9;
      u.range += 28;
      u.burstHeal = (u.burstHeal || 56) + 22;
      u.seraphimShield = (u.seraphimShield || 4.5) + 2;
    }
  },
  {
    id: "dragoon-pods",
    unit: "Orion",
    type: "Orion 武器",
    name: "龍騎兵炮莢擴充",
    icon: "assets/upgrade-dragoon-pods.webp",
    text: "Orion 攻速更快、射程 +35，主動技發射更多清場炮莢。",
    apply() {
      const u = squad.find((unit) => unit.name === "Orion");
      if (!u) return;
      u.damage += 5;
      u.rate = Math.max(0.78, u.rate - 0.08);
      u.range += 35;
      u.volleyCount = (u.volleyCount || 7) + 3;
      u.volleyDamage = (u.volleyDamage || 34) + 8;
    }
  },
  {
    id: "valkyr-zero-core",
    unit: "Valkyr",
    type: "Valkyr 技能",
    name: "GN 防線核心",
    icon: "assets/upgrade-valkyr-gn-core.webp",
    text: "Valkyr 最大 HP +55、防禦力 +12%，挑釁信標持續更久，GN 力場範圍和推力提升。",
    apply() {
      const u = squad.find((unit) => unit.name === "Valkyr");
      if (!u) return;
      u.maxHp += 55;
      u.hp = clamp(u.hp + 55, 1, u.maxHp);
      u.damageReduction = (u.damageReduction || 0) + 0.12;
      u.valkyrTauntDuration = (u.valkyrTauntDuration || 6) + 2;
      u.gnFieldDuration = (u.gnFieldDuration || 5.5) + 2;
      u.gnFieldRadius = (u.gnFieldRadius || 170) + 32;
      u.gnPush = (u.gnPush || 210) + 42;
    }
  },
  {
    id: "lancer-rail-scope",
    unit: "Lancer",
    type: "Lancer 武器",
    name: "軌道照準器",
    icon: "assets/upgrade-lancer-rail-scope-v1.webp",
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
    type: "Nova 量子",
    name: "量子相位核心",
    icon: "assets/upgrade-nova-quantum-ai-v6.webp",
    text: "Nova 傷害 +8、射程 +30、速度 +24、量子背刺範圍更大。",
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
    name: "再生幻象矩陣",
    icon: "assets/upgrade-helix-beacon-grid.webp",
    text: "Helix 治療量、射程和生存力提升；再生力場更持久，幻象粒子隱形和解鎖定範圍增加。",
    apply() {
      const u = squad.find((unit) => unit.name === "Helix");
      if (!u) return;
      u.damage -= 8;
      u.range += 35;
      u.maxHp += 38;
      u.hp = clamp(u.hp + 38, 1, u.maxHp);
      u.regenRate = (u.regenRate || 13) + 5;
      u.regenDuration = (u.regenDuration || 6) + 2;
      u.regenRadius = (u.regenRadius || 260) + 35;
      u.stealthDuration = (u.stealthDuration || 5.5) + 1.4;
      u.mirageDisruptRadius = (u.mirageDisruptRadius || 390) + 45;
    }
  },
  {
    id: "bastion-stabilizer",
    unit: "Bastion",
    type: "Bastion 重炮",
    name: "重炮穩定器",
    icon: "assets/upgrade-bastion-stabilizer-green-v2.webp",
    text: "Bastion 傷害 +16、射程 +30，重炮壓制範圍擴大。",
    apply() {
      const u = squad.find((unit) => unit.name === "Bastion");
      if (!u) return;
      u.damage += 16;
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
    icon: "assets/upgrade-mirage-core-ai-v6.webp",
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
    id: "miles-ek-aura-core",
    unit: "MEGA(EK專用機)",
    type: "MEGA 技能",
    name: "EK 光環定律核心",
    icon: "assets/upgrade-miles-ek-aura.webp",
    text: "MEGA 最大 HP +45、防禦力 +10%；EK 定律爆炸傷害和波及範圍提升。",
    apply() {
      const u = squad.find((unit) => unit.name === "MEGA(EK專用機)");
      if (!u) return;
      u.maxHp += 45;
      u.hp = clamp(u.hp + 45, 1, u.maxHp);
      u.damageReduction = (u.damageReduction || 0) + 0.1;
      u.ekLawDamage = (u.ekLawDamage || 136) + 26;
      u.ekLawRadius = (u.ekLawRadius || 145) + 16;
      u.ekLawSplashDamage = (u.ekLawSplashDamage || 64) + 12;
    }
  },
  {
    id: "himawari-helping-core",
    unit: "Himawari (Candy專用機)",
    type: "Himawari 支援",
    name: "我幫緊你增幅核心",
    icon: "assets/upgrade-himawari-helping.webp",
    text: "Himawari 最大 HP +35；美女廚房毒素更強，被動觸發更頻密，發脾氣雷射傷害提升。",
    apply() {
      const u = squad.find((unit) => unit.name === "Himawari (Candy專用機)");
      if (!u) return;
      u.maxHp += 35;
      u.hp = clamp(u.hp + 35, 1, u.maxHp);
      u.himawariPoisonRate = (u.himawariPoisonRate || 0.04) + 0.008;
      u.himawariPassiveMin = Math.max(4.5, (u.himawariPassiveMin || 7) - 1.2);
      u.himawariLaserDamage = (u.himawariLaserDamage || 72) + 24;
    }
  },
  {
    id: "overclocked-servos",
    type: "機動",
    name: "超頻 AMBAC 伺服系統",
    icon: "assets/upgrade-overclocked-servos.webp",
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
    icon: "assets/upgrade-emergency-nanites.webp",
    text: "全體回復 40% HP；已擊破機體以 35% HP 回歸。",
    apply() {
      squad.forEach((u) => {
        const reviveHp = Math.ceil(u.maxHp * 0.35);
        const heal = Math.ceil(u.maxHp * 0.4);
        u.hp = u.hp <= 0 ? reviveHp : clamp(u.hp + heal, 1, u.maxHp);
      });
    }
  },
  {
    id: "spare-thruster-fuel",
    tier: "common",
    type: "機動",
    name: "備用推進燃料",
    icon: "assets/upgrade-spare-thruster-fuel.webp",
    text: "全體移動速度 +10%。",
    apply() {
      squad.forEach((u) => { u.speed = Math.round(u.speed * 1.1); });
    }
  },
  {
    id: "beam-cooling-lines",
    tier: "common",
    type: "武器",
    name: "光束冷卻管線",
    icon: "assets/upgrade-beam-cooling-lines.webp",
    text: "全體攻擊間隔縮短 5%。",
    apply() {
      squad.forEach((u) => { u.rate = Math.max(0.34, u.rate * 0.95); });
    }
  },
  {
    id: "assist-aim-chip",
    tier: "common",
    type: "武器",
    name: "輔助瞄準晶片",
    icon: "assets/upgrade-assist-aim-chip.webp",
    text: "所有攻擊型機體射程 +18。",
    apply() {
      squad.forEach((u) => { if (u.damage > 0) u.range += 18; });
    }
  },
  {
    id: "lightweight-armor-plates",
    tier: "common",
    type: "裝甲",
    name: "輕量化裝甲板",
    icon: "assets/upgrade-lightweight-armor-plates.webp",
    text: "全體最大 HP +18，移動速度 +4%。",
    apply() {
      squad.forEach((u) => {
        u.maxHp += 18;
        u.hp = clamp(u.hp + 18, 1, u.maxHp);
        u.speed = Math.round(u.speed * 1.04);
      });
    }
  },
  {
    id: "field-repair-kit",
    tier: "common",
    type: "生存",
    name: "戰場維修包",
    icon: "assets/upgrade-field-repair-kit.webp",
    text: "每回合開始時，全體回復 12% HP。",
    apply() {
      squad.forEach((u) => { u.roundHealPercent = (u.roundHealPercent || 0) + 0.12; });
    }
  },
  {
    id: "squad-sync-link",
    tier: "common",
    type: "技能",
    name: "小隊同步鏈路",
    icon: "assets/upgrade-squad-sync-link.webp",
    text: "全體主動技能冷卻時間 -1 秒。",
    apply() {
      squad.forEach((u) => { u.skillCooldownFlat = (u.skillCooldownFlat || 0) + 1; });
    }
  },
  {
    id: "thruster-stabilizer",
    tier: "common",
    type: "機動",
    name: "推進器穩定器",
    icon: "assets/upgrade-thruster-stabilizer.webp",
    text: "被敵人推撞或擠壓時，位移影響降低 20%。",
    apply() {
      squad.forEach((u) => { u.pushResistance = clamp((u.pushResistance || 0) + 0.2, 0, 0.6); });
    }
  },
  {
    id: "trajectory-data",
    tier: "common",
    type: "武器",
    name: "彈道校正資料",
    icon: "assets/upgrade-trajectory-data.webp",
    text: "攻擊型機體普通武器傷害 +8%。",
    apply() {
      squad.forEach((u) => { if (u.damage > 0) u.damage = Math.round(u.damage * 1.08); });
    }
  },
  {
    id: "tactical-fire-control-core",
    tier: "rare",
    type: "火控",
    name: "戰術火控核心",
    icon: "assets/upgrade-tactical-fire-control-core.webp",
    text: "攻擊型機體傷害 +12%，射程 +25。",
    apply() {
      squad.forEach((u) => {
        if (u.damage <= 0) return;
        u.damage = Math.round(u.damage * 1.12);
        u.range += 25;
      });
    }
  },
  {
    id: "dense-defense-coating",
    tier: "rare",
    type: "裝甲",
    name: "高密度防護塗層",
    icon: "assets/upgrade-dense-defense-coating.webp",
    text: "全體防禦力 +8%，最大 HP +20。",
    apply() {
      squad.forEach((u) => {
        u.damageReduction = (u.damageReduction || 0) + 0.08;
        u.maxHp += 20;
        u.hp = clamp(u.hp + 20, 1, u.maxHp);
      });
    }
  },
  {
    id: "support-sync-protocol",
    tier: "rare",
    type: "支援",
    name: "支援機同步協議",
    icon: "assets/upgrade-support-sync-protocol.webp",
    text: "補機治療量 +18%，補血射程 +30。",
    apply() {
      squad.forEach((u) => {
        if (u.damage >= 0) return;
        u.damage = Math.round(u.damage * 1.18);
        u.range += 30;
      });
    }
  },
  {
    id: "frontline-suppression-order",
    tier: "rare",
    type: "指令",
    name: "前線壓制指令",
    icon: "assets/upgrade-frontline-suppression-order.webp",
    text: "坦機受到攻擊時，附近敵人攻擊力 -15%。",
    apply() {
      squad.forEach((u) => {
        if (u.name === "Asterion" || u.name === "Valkyr" || u.name === "MEGA(EK專用機)") u.frontlineSuppression = true;
      });
    }
  },
  {
    id: "skill-circuit-overload",
    tier: "rare",
    type: "技能",
    name: "技能迴路超載",
    icon: "assets/upgrade-skill-circuit-overload.webp",
    text: "全體主動技能冷卻 -2 秒，但最大 HP -10。",
    apply() {
      squad.forEach((u) => {
        u.skillCooldownFlat = (u.skillCooldownFlat || 0) + 2;
        u.maxHp = Math.max(40, u.maxHp - 10);
        u.hp = clamp(u.hp, 1, u.maxHp);
      });
    }
  },
  {
    id: "seed-awakening-protocol",
    tier: "ultra",
    type: "Ultra Rare",
    name: "SEED 覺醒協議",
    icon: "assets/upgrade-seed-awakening-protocol.webp",
    text: "全體機體首次低於 35% HP 時覺醒：攻擊力 +35%、移速 +35%，持續 5 秒。",
    apply() {
      squad.forEach((u) => {
        u.seedProtocol = true;
        addSkillEffect("seed-awaken", u, { radius: bodyRadius(u) + 72, color: "#ff3d54", life: 0.9, follow: true });
      });
    }
  },
  {
    id: "meteor-equipment-deploy",
    tier: "ultra",
    type: "Ultra Rare",
    name: "流星裝備展開",
    icon: "assets/upgrade-meteor-equipment-deploy.webp",
    text: "攻擊型機體普通攻擊有 35% 機率追加小型範圍光束轟炸。",
    apply() {
      squad.forEach((u) => { if (u.damage > 0) u.meteorSupport = true; });
    }
  },
  {
    id: "genesis-jamming-wave",
    tier: "ultra",
    type: "Ultra Rare",
    name: "陽電子炮",
    icon: "assets/upgrade-genesis-jamming-wave.webp",
    text: "全體機體每次 HP 低於 35% 時觸發一次，對全場敵人掃射陽電子炮。",
    apply() {
      squad.forEach((u) => {
        u.positronProtocol = true;
        addSkillEffect("positron-cannon", u, { radius: bodyRadius(u) + 86, color: "#ffd166", life: 0.9, follow: true });
      });
    }
  },
  {
    id: "zero-range-breakthrough",
    tier: "ultra",
    type: "Ultra Rare",
    name: "零距離突破命令",
    icon: "assets/upgrade-zero-range-breakthrough.webp",
    text: "近戰/中距離機體被敵人推撞或擠壓時，位移影響降低 50%；移速 +45%、攻擊力 +25%，但受到傷害 +15%。",
    apply() {
      squad.forEach((u) => {
        if (u.damage <= 0 || u.range > 265) return;
        u.zeroBreak = true;
        u.zeroBreakPushReduction = 0.5;
        u.speed = Math.round(u.speed * 1.45);
        addSkillEffect("zero-break", u, { radius: bodyRadius(u) + 64, color: "#4be4ff", life: 0.9, follow: true });
      });
    }
  },
  {
    id: "infinite-energy-core",
    tier: "ultra",
    type: "Ultra Rare",
    name: "無限能源爐心",
    icon: "assets/upgrade-infinite-energy-core.webp",
    text: "全體技能冷卻 -35%，必殺充能 +35%；但敵人每回合生成數量 +15%。",
    apply() {
      enemySpawnBonus += 0.15;
      squad.forEach((u) => {
        u.skillCooldownMultiplier = (u.skillCooldownMultiplier || 1) * 0.65;
        u.ultChargeMultiplier = (u.ultChargeMultiplier || 1) * 1.35;
        addSkillEffect("energy-core", u, { radius: bodyRadius(u) + 70, color: "#62f6b0", life: 0.9, follow: true });
      });
    }
  }
];

let squad = [];
let enemies = [];
let shots = [];
let sparks = [];
let gravityFields = [];
let skillEffects = [];
let stars = [];
const art = new Map();
const artLoadPromises = new Map();
let hudCardsSignature = "";
let skillBarSignature = "";

function selectedSquadSeeds() {
  const selectedSeeds = selectedSquadNames
    .map((name) => squadSeeds.find((unit) => unit.name === name))
    .filter(Boolean);
  return selectedSeeds.length === 4
    ? selectedSeeds
    : defaultSquadNames.map((name) => squadSeeds.find((unit) => unit.name === name));
}

function reset() {
  paused = false;
  pausedAt = 0;
  updatePauseControls();
  setPauseButtonVisible(false);
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
    ultMax: 100,
    regenAuraTime: 0,
    stealthTime: 0,
    regenGlow: 0,
    guardianRegenTime: 0,
    gnFieldTime: 0,
    ekAuraActive: false,
    lostTime: 0,
    lostCooldown: u.name === "MEGA(EK專用機)" ? 6 + Math.random() * 8 : 0,
    lostPoint: null,
    lostRetarget: 0,
    himawariPassiveCooldown: u.name === "Himawari (Candy專用機)" ? 5 + Math.random() * 6 : 0,
    himawariStatus: null
    });
  });
  enemies = [];
  shots = [];
  sparks = [];
  gravityFields = [];
  skillEffects = [];
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
  ultraRewardPity = 0;
  enemySpawnBonus = 0;
  genesisWaveActive = false;
  nextHudRefresh = 0;
  hudCardsSignature = "";
  skillBarSignature = "";
  spawnWave();
  renderIntel(squad[0]);
  updateHud();
}

function spawnWave() {
  const isBossRound = wave % 3 === 0;
  const difficulty = getDifficulty();
  const baseCount = 2 + Math.floor(wave * 0.82) + (isBossRound ? 0 : 0);
  const count = Math.min(18, Math.ceil(baseCount * (1 + enemySpawnBonus)));
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
      slowTime: 0,
      fireControlTime: 0
    });
    if (genesisWaveActive) applyGenesisWave(enemies[enemies.length - 1]);
  }
  if (genesisWaveActive) addSkillEffect("genesis-wave", null, { x: W * 0.5, y: H * 0.5, radius: W * 0.72, color: "#ff3d54", life: 1.0, follow: false });
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

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[char]);
}

function sanitizePlayerName(value) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 16) || "Pilot";
}

function formatScore(value) {
  return String(Math.max(0, Math.floor(Number(value) || 0)));
}

function normalizeLeaderboard(rankings) {
  return (Array.isArray(rankings) ? rankings : []).map((entry, index) => ({
    id: typeof entry?.id === "string" ? entry.id : "",
    name: sanitizePlayerName(entry?.name),
    score: Math.max(0, Math.floor(Number(entry?.score) || 0)),
    submittedAt: typeof entry?.submittedAt === "string" ? entry.submittedAt : "",
    order: index
  }))
    .sort((a, b) => b.score - a.score || a.submittedAt.localeCompare(b.submittedAt) || a.name.localeCompare(b.name) || a.order - b.order)
    .slice(0, 10);
}

function renderLeaderboardList(listEl, rankings, highlightScore = null) {
  const normalized = normalizeLeaderboard(rankings || leaderboardDefaults);
  listEl.innerHTML = normalized.map((entry, index) => `
    <li class="${highlightScore !== null && entry.score === highlightScore ? "current-score" : ""}">
      <span class="rank-number">${index + 1}</span>
      <strong>${escapeHtml(entry.name)}</strong>
      <em>${formatScore(entry.score)}</em>
    </li>
  `).join("");
  return normalized;
}

function renderResultLeaderboard(rankings, message = "") {
  renderLeaderboardList(leaderboardListEl, rankings, leaderboardScore);
  leaderboardMessageEl.textContent = message || "輸入姓名後可提交今局分數。";
}

function renderTitleLeaderboard(rankings, message = "") {
  renderLeaderboardList(titleLeaderboardListEl, rankings);
  titleLeaderboardMessageEl.textContent = message || "挑戰最高分數，打入王牌榜。";
}

function renderLeaderboards(rankings, resultMessage = "", titleMessage = "") {
  renderResultLeaderboard(rankings, resultMessage);
  renderTitleLeaderboard(rankings, titleMessage);
}

function updatePauseControls() {
  pauseOverlayEl.hidden = !paused;
  pauseToggleEl.setAttribute("aria-pressed", paused ? "true" : "false");
  pauseToggleEl.setAttribute("aria-label", paused ? "繼續遊戲" : "暫停遊戲");
  pauseToggleEl.querySelector(".pause-label").textContent = paused ? "繼續" : "暫停";
  document.body.classList.toggle("paused-mode", paused);
}

function setPauseButtonVisible(visible) {
  pauseToggleEl.hidden = !visible;
  if (!visible && paused) {
    paused = false;
    pausedAt = 0;
    updatePauseControls();
  }
}

function setPaused(value) {
  const shouldPause = Boolean(value);
  if (shouldPause && !running) return;
  if (paused === shouldPause) return;
  paused = shouldPause;
  updatePauseControls();
  if (paused) {
    pausedAt = now();
    selected = null;
    pointer = null;
    commandEl.textContent = "暫停中";
    return;
  }
  if (pausedAt) {
    const pauseDuration = now() - pausedAt;
    nextWaveAt += pauseDuration;
    if (messageTime) messageTime += pauseDuration;
    pausedAt = 0;
  }
  last = now();
  setMessage("繼續作戰");
}

function togglePause() {
  if (pauseToggleEl.hidden || rewardEl.hidden === false || resultEl.hidden === false || formationEl.hidden === false || briefingEl.hidden === false) return;
  setPaused(!paused);
}

async function loadLeaderboard() {
  renderLeaderboards(leaderboardDefaults, "讀取排行榜中...", "讀取排行榜中...");
  try {
    const response = await fetch("/api/leaderboard", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const fallbackMessage = data.writable === false ? "已載入預設排名；Cloudflare KV 尚未綁定。" : "輸入姓名後可提交今局分數。";
    renderLeaderboards(data.rankings, fallbackMessage, data.writable === false ? "預設排行榜" : "即時排行榜");
  } catch {
    renderLeaderboards(leaderboardDefaults, "暫時未能連線排行榜，先顯示預設排名。", "暫時顯示預設排行榜");
  }
}

async function submitLeaderboard(event) {
  event.preventDefault();
  if (leaderboardSubmitted) {
    leaderboardMessageEl.textContent = "今局分數已提交。";
    return;
  }

  const name = sanitizePlayerName(playerNameEl.value);
  playerNameEl.value = name;
  localStorage.setItem("mecha-heart-player-name", name);
  leaderboardMessageEl.textContent = "提交分數中...";
  const submitButton = leaderboardFormEl.querySelector("button");
  submitButton.disabled = true;

  try {
    const response = await fetch("/api/leaderboard", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, score: leaderboardScore })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);
    leaderboardSubmitted = true;
    renderLeaderboards(data.rankings, data.message || "分數已提交。", "即時排行榜已更新");
  } catch (error) {
    submitButton.disabled = false;
    const localRankings = normalizeLeaderboard([
      ...leaderboardDefaults,
      { name, score: leaderboardScore }
    ]);
    renderLeaderboards(localRankings, `${error.message || "提交失敗"} 本機先預覽排名，Cloudflare KV 設定後會同步。`, "本機預覽排行榜");
  }
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

function addSkillEffect(type, source, options = {}) {
  const life = options.life || 0.9;
  skillEffects.push({
    type,
    sourceId: source?.id || null,
    x: options.x ?? source?.x ?? 0,
    y: options.y ?? source?.y ?? 0,
    tx: options.tx,
    ty: options.ty,
    radius: options.radius || 100,
    color: options.color || source?.color || "#ffffff",
    life,
    maxLife: life,
    rotation: options.rotation ?? Math.random() * Math.PI * 2,
    follow: options.follow ?? (options.x === undefined && options.y === undefined),
    label: options.label,
    buff: options.buff
  });
}

function activateSkill(unit) {
  if (!unit || unit.hp <= 0) return;
  if (unit.name === "MEGA(EK專用機)" && unit.ekAuraActive) {
    unit.ekAuraActive = false;
    unit.skillCooldown = 10;
    unit.buttonPulse = 0.35;
    burst(unit.x, unit.y, "#48a8ff", 26);
    addSkillEffect("ek-aura", unit, { radius: unit.ekAuraRange || 235, color: "#48a8ff", life: 0.55 });
    setMessage("MEGA: EK光環停止");
    return;
  }
  if (unit.skillCooldown > 0) {
    setMessage(`${unit.skill}: 冷卻 ${Math.ceil(unit.skillCooldown)} 秒`);
    unit.buttonPulse = 0.25;
    return;
  }
  const baseSkillCooldown = unit.name === "MEGA(EK專用機)" ? 0 : 10;
  unit.skillCooldown = baseSkillCooldown <= 0 ? 0 : Math.max(3.5, baseSkillCooldown * (unit.skillCooldownMultiplier || 1) - (unit.skillCooldownFlat || 0));
  unit.buttonPulse = 0.35;
  unit.attackPulse = 0.26;
  if (unit.name === "Asterion") {
    squad.forEach((ally) => {
      if (ally.hp > 0 && dist(unit, ally) < 230) ally.shield = unit.shieldDuration || 5;
    });
    unit.guardianRegenTime = unit.guardianRegenDuration || 5;
    burst(unit.x, unit.y, "#4be4ff", 38);
    addSkillEffect("guardian", unit, { radius: 230, color: "#4be4ff", life: 1.1 });
    setMessage("守護爆發已展開");
  } else if (unit.name === "Caliburn") {
    enemies.filter((e) => dist(unit, e) < (unit.rushRadius || 220)).forEach((e) => hit(e, unit.rushDamage || 52, "#ff5b66", unit.id));
    burst(unit.x, unit.y, "#ff5b66", 30);
    addSkillEffect("slash", unit, { radius: unit.rushRadius || 220, color: "#ff5b66", life: 0.7 });
    setMessage("SEED 突擊發動");
  } else if (unit.name === "Seraphim") {
    const radius = Math.max(300, unit.range + 80);
    const shieldValue = unit.seraphimShield || 4.5;
    squad.forEach((ally) => {
      if (ally.hp > 0 && dist(unit, ally) < radius) {
        const hpBefore = ally.hp;
        ally.hp = clamp(ally.hp + (unit.burstHeal || 56), 0, ally.maxHp);
        ally.shield = Math.max(ally.shield || 0, shieldValue);
        chargeUltimateByHealing(unit, ally.hp - hpBefore);
      }
    });
    burst(unit.x, unit.y, "#62e6a7", 34);
    addSkillEffect("repair-shield", unit, { radius, color: "#62e6a7", life: 1.2 });
    setMessage("幻象修復與護盾已部署");
  } else if (unit.name === "Orion") {
    enemies
      .filter((e) => e.hp > 0)
      .sort((a, b) => a.hp - b.hp)
      .slice(0, unit.volleyCount || 8)
      .forEach((e) => {
        const damage = e.boss ? 18 + unit.damage * 0.45 : unit.volleyDamage || 30;
        shots.push({ x: unit.x, y: unit.y, tx: e.x, ty: e.y, color: "#ffd166", life: 0.28, maxLife: 0.28, damage, target: e.id, source: unit.id });
    });
    setMessage("全方位齊射");
    addSkillEffect("volley", unit, { radius: 170, color: "#ffd166", life: 0.72 });
  } else if (unit.name === "Valkyr") {
    const tauntRange = unit.valkyrTauntRange || 315;
    const tauntDuration = unit.valkyrTauntDuration || 6;
    unit.shield = Math.max(unit.shield || 0, 5.5);
    enemies.filter((enemy) => enemy.hp > 0 && dist(unit, enemy) < tauntRange).forEach((enemy) => {
      enemy.tauntTarget = unit.id;
      enemy.tauntTime = tauntDuration;
      enemy.aim = { x: unit.x, y: unit.y };
    });
    burst(unit.x, unit.y, "#8bd7ff", 48);
    addSkillEffect("taunt", unit, { radius: tauntRange, color: "#8bd7ff", life: 1.0 });
    setMessage("挑釁信標展開");
  } else if (unit.name === "MEGA(EK專用機)") {
    const tauntRange = unit.ekAuraRange || 235;
    unit.ekAuraActive = true;
    unit.shield = Math.max(unit.shield || 0, unit.ekAuraShield || 4.5);
    applyEkAura(unit, 0.2);
    burst(unit.x, unit.y, "#48a8ff", 54);
    addSkillEffect("ek-aura", unit, { radius: tauntRange, color: "#48a8ff", life: 1.0 });
    setMessage("MEGA: EK光環啟動");
  } else if (unit.name === "Lancer") {
    const target = enemies.filter((e) => e.hp > 0).sort((a, b) => b.hp - a.hp)[0];
    if (target) {
      shots.push({ x: unit.x, y: unit.y, tx: target.x, ty: target.y, color: "#4aa8ff", life: 0.2, maxLife: 0.2, damage: 84 + unit.damage + (unit.lancerBonus || 0), target: target.id, source: unit.id });
      burst(unit.x, unit.y, "#4aa8ff", 24);
      addSkillEffect("rail", unit, { tx: target.x, ty: target.y, color: "#4aa8ff", life: 0.55 });
      setMessage("穿甲狙擊");
    }
  } else if (unit.name === "Nova") {
    const target = enemies
      .filter((e) => e.hp > 0)
      .sort((a, b) => (unit.target === a.id ? -1 : unit.target === b.id ? 1 : dist(unit, a) - dist(unit, b)))[0];
    if (target) {
      const radius = unit.rushRadius || 210;
      const behindX = clamp(target.x + bodyRadius(target) + 42, ALLIED_MIN_X, ALLIED_MAX_X);
      const offsetY = target.y > H * 0.5 ? -28 : 28;
      const from = { x: unit.x, y: unit.y };
      unit.x = behindX;
      unit.y = clamp(target.y + offsetY, ALLIED_MIN_Y, ALLIED_MAX_Y);
      unit.target = target.id;
      enemies
        .filter((e) => e.hp > 0 && dist(unit, e) < radius)
        .forEach((e) => hit(e, unit.rushDamage || 72, "#ff9b38", unit.id));
      burst(unit.x, unit.y, "#ff9b38", 56);
      addSkillEffect("quantum-backstab", unit, { x: unit.x, y: unit.y, fromX: from.x, fromY: from.y, radius, color: "#ff9b38", life: 0.9, follow: false });
      setMessage("量子背刺");
      return;
    }
    setMessage("熱刃旋風");
  } else if (unit.name === "Himawari (Candy專用機)") {
    const target = enemies
      .filter((enemy) => enemy.hp > 0)
      .sort((a, b) => (unit.target === a.id ? -1 : unit.target === b.id ? 1 : b.maxHp - a.maxHp || b.hp - a.hp))[0];
    if (!target) {
      setMessage("美女廚房: 沒有目標");
      unit.skillCooldown = 0;
      return;
    }
    const duration = unit.himawariPoisonDuration || 6;
    const percentPerSecond = unit.himawariPoisonRate || 0.04;
    skillEffects.push({
      type: "himawari-poison",
      sourceId: unit.id,
      source: unit.id,
      targetId: target.id,
      x: target.x,
      y: target.y,
      radius: bodyRadius(target) + 42,
      color: "#ff62d6",
      life: duration,
      maxLife: duration,
      percentPerSecond,
      follow: false,
      rotation: Math.random() * Math.PI * 2
    });
    burst(target.x, target.y, "#ff62d6", 34);
    addSkillEffect("himawari-kitchen", null, { x: target.x, y: target.y, radius: bodyRadius(target) + 90, color: "#ff62d6", life: 1.1, follow: false });
    setMessage("美女廚房: 有毒食物投餵");
  } else if (unit.name === "Helix") {
    unit.regenAuraTime = unit.regenDuration || 6;
    unit.regenPulse = 0.45;
    squad.forEach((ally) => {
      if (ally.hp > 0 && dist(unit, ally) < (unit.regenRadius || 260)) {
        ally.regenGlow = Math.max(ally.regenGlow || 0, 0.5);
      }
    });
    burst(unit.x, unit.y, "#7cffc4", 46);
    addSkillEffect("regen-rain", unit, { radius: unit.regenRadius || 260, color: "#7cffc4", life: 1.25 });
    setMessage("再生力場展開");
  } else if (unit.name === "Bastion") {
    const target = enemies.filter((e) => e.hp > 0).sort((a, b) => b.hp - a.hp)[0];
    if (target) {
      const radius = unit.splashRadius || 92;
      const bossBonus = target.boss ? 1.65 : 1;
      hit(target, (92 + unit.damage + (unit.bastionBonus || 0)) * bossBonus, "#f6c34f", unit.id);
      enemies.filter((e) => e.hp > 0 && e.id !== target.id && dist(e, target) < radius).forEach((e) => hit(e, 30 + Math.floor(unit.damage * 0.5), "#f6c34f", unit.id));
      burst(target.x, target.y, "#f6c34f", 56);
      addSkillEffect("impact-grid", unit, { x: target.x, y: target.y, radius, color: "#f6c34f", life: 0.95 });
    }
    holdPositionAfterCast(unit);
    setMessage("重炮壓制");
  } else if (unit.name === "Mirage") {
    const radius = unit.jamRadius || 270;
    const duration = unit.jamDuration || 5.2;
    unit.mirageAuraTime = Math.max(unit.mirageAuraTime || 0, duration);
    applyMirageAura(unit, 0.18);
    burst(unit.x, unit.y, "#c37bff", 52);
    addSkillEffect("jam-aura", unit, { radius, color: "#c37bff", life: duration });
    holdPositionAfterCast(unit);
    setMessage("持續干擾");
  }
}

function holdPositionAfterCast(unit, duration = 0.85) {
  unit.target = null;
  unit.move = null;
  unit.command = "idle";
  unit.postCastHold = Math.max(unit.postCastHold || 0, duration);
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
    const target = enemies.find((enemy) => enemy.id === unit.target && enemy.hp > 0) || acquireTarget(unit, true) || enemies.filter((enemy) => enemy.hp > 0).sort((a, b) => dist(unit, a) - dist(unit, b))[0];
    if (!target) {
      setMessage("重力球: 沒有目標");
      unit.ultCharge = unit.ultMax || 100;
      return;
    }
    const dx = target.x - unit.x;
    const dy = target.y - unit.y;
    const d = Math.hypot(dx, dy) || 1;
    gravityFields.push({
      x: clamp(target.x + (dx / d) * 74, 70, W - 70),
      y: clamp(target.y + (dy / d) * 74, 70, H - 100),
      radius: unit.gravityRadius || 187,
      pull: unit.gravityPull || 170,
      life: unit.gravityDuration || 5.2,
      maxLife: unit.gravityDuration || 5.2,
      color: "#4be4ff",
      source: unit.id
    });
    burst(target.x, target.y, "#4be4ff", 84);
    addSkillEffect("gravity-cast", unit, { x: target.x, y: target.y, radius: unit.gravityRadius || 187, color: "#4be4ff", life: 0.9 });
    setMessage("重力球生成");
    return;
  }

  if (unit.name === "Caliburn") {
    enemies
      .filter((e) => e.hp > 0)
      .sort((a, b) => dist(unit, a) - dist(unit, b))
      .slice(0, 6)
      .forEach((e) => hit(e, 120 + unit.damage, "#ff5b66", unit.id));
    burst(unit.x, unit.y, "#ff5b66", 65);
    addSkillEffect("blade-storm", unit, { radius: 245, color: "#ff5b66", life: 1.0 });
    setMessage("流星斬");
    return;
  }

  if (unit.name === "Seraphim") {
    squad.forEach((ally) => {
      ally.hp = ally.hp <= 0 ? Math.ceil(ally.maxHp * 0.45) : clamp(ally.hp + Math.ceil(ally.maxHp * 0.7), 1, ally.maxHp);
      ally.shield = 5;
    });
    burst(unit.x, unit.y, "#62e6a7", 75);
    addSkillEffect("revive", unit, { radius: 300, color: "#62e6a7", life: 1.25 });
    setMessage("天使光環");
    return;
  }

  if (unit.name === "Orion") {
    enemies.forEach((e) => {
      const damage = e.boss ? 38 + unit.damage : 86 + unit.damage;
      shots.push({ x: unit.x, y: unit.y, tx: e.x, ty: e.y, color: "#ffd166", life: 0.38, maxLife: 0.38, damage, target: e.id, source: unit.id });
    });
    burst(unit.x, unit.y, "#ffd166", 72);
    addSkillEffect("orbital", unit, { radius: 260, color: "#ffd166", life: 1.0 });
    setMessage("衛星全炮門");
    return;
  }

  if (unit.name === "Valkyr") {
    unit.gnFieldTime = unit.gnFieldDuration || 5.5;
    unit.shield = Math.max(unit.shield || 0, 6);
    burst(unit.x, unit.y, "#8bd7ff", 82);
    addSkillEffect("gn-cast", unit, { radius: unit.gnFieldRadius || 170, color: "#8bd7ff", life: 0.9 });
    setMessage("GN 力場展開");
    return;
  }

  if (unit.name === "MEGA(EK專用機)") {
    const target = enemies
      .filter((enemy) => enemy.hp > 0)
      .sort((a, b) => (b.boss ? 1 : 0) - (a.boss ? 1 : 0) || b.hp - a.hp || dist(unit, a) - dist(unit, b))[0];
    if (!target) {
      setMessage("EK定律: 沒有目標");
      unit.ultCharge = unit.ultMax || 100;
      return;
    }
    const radius = unit.ekLawRadius || 145;
    unit.target = target.id;
    shots.push({ x: unit.x, y: unit.y, tx: target.x, ty: target.y, color: "#48a8ff", life: 1, maxLife: 1, damage: unit.ekLawDamage || (112 + unit.damage), target: target.id, source: unit.id, splashRadius: radius, splashDamage: unit.ekLawSplashDamage || (46 + unit.damage * 0.75) });
    burst(target.x, target.y, "#48a8ff", 58);
    addSkillEffect("ek-law", unit, { x: target.x, y: target.y, radius, color: "#48a8ff", life: 1, follow: false });
    setMessage("MEGA: EK定律成立");
    return;
  }

  if (unit.name === "Lancer") {
    const target = enemies.filter((e) => e.hp > 0).sort((a, b) => b.maxHp - a.maxHp || b.hp - a.hp)[0];
    if (target) {
      shots.push({ x: unit.x, y: unit.y, tx: target.x, ty: target.y, color: "#4aa8ff", life: 0.42, maxLife: 0.42, damage: 185 + unit.damage + (unit.lancerBonus || 0), target: target.id, source: unit.id });
      burst(target.x, target.y, "#4aa8ff", 72);
      addSkillEffect("rail", unit, { tx: target.x, ty: target.y, color: "#4aa8ff", life: 0.72 });
    }
    setMessage("軌道貫穿");
    return;
  }

  if (unit.name === "Nova") {
    const duration = unit.quantumDuration || 6;
    unit.quantumTime = Math.max(unit.quantumTime || 0, duration);
    unit.speedBoost = 0;
    unit.shield = Math.max(unit.shield || 0, 2.5);
    burst(unit.x, unit.y, "#ff9b38", 88);
    addSkillEffect("quantum-phase", unit, { radius: 150, color: "#ff9b38", life: duration, follow: true });
    setMessage("量子化");
    return;
  }

  if (unit.name === "Himawari (Candy專用機)") {
    const knockRadius = unit.himawariTantrumRadius || 205;
    [...squad, ...enemies].filter((actor) => actor.hp > 0 && actor.id !== unit.id && dist(unit, actor) < knockRadius).forEach((actor) => {
      moveAwayFrom(actor, unit, 180);
      if (actor.faction === "Enemy") hit(actor, 28 + unit.damage * 0.5, "#ff62d6", unit.id);
    });
    const damage = unit.himawariLaserDamage || 72;
    enemies.filter((enemy) => enemy.hp > 0).forEach((enemy) => {
      shots.push({ x: unit.x, y: unit.y, tx: enemy.x, ty: enemy.y, color: "#ff62d6", life: 0.42, maxLife: 0.42, damage: enemy.boss ? damage * 0.72 : damage, target: enemy.id, source: unit.id });
    });
    burst(unit.x, unit.y, "#ff62d6", 90);
    addSkillEffect("himawari-tantrum", unit, { radius: knockRadius, color: "#ff62d6", life: 1.15, follow: true });
    setMessage("發脾氣: 全場粗雷射掃射");
    return;
  }

  if (unit.name === "Helix") {
    const liveBefore = squad.filter((ally) => ally.hp > 0);
    const duration = unit.stealthDuration || 5.5;
    const disruptRadius = unit.mirageDisruptRadius || 390;
    unit.stealthTime = Math.max(unit.stealthTime || 0, duration);
    unit.shield = Math.max(unit.shield || 0, 4);
    enemies.filter((enemy) => enemy.hp > 0).forEach((enemy) => {
      const targetBefore = chooseEnemyTarget(enemy, liveBefore);
      if (enemy.tauntTarget === unit.id) {
        enemy.tauntTarget = null;
        enemy.tauntTime = 0;
      }
      if (targetBefore?.id === unit.id || dist(enemy, unit) < disruptRadius) {
        enemy.aim = null;
        enemy.cooldown = Math.max(enemy.cooldown || 0, 0.45);
        enemy.jamTime = Math.max(enemy.jamTime || 0, 0.9);
        burst(enemy.x, enemy.y, "#7cffc4", 7);
      }
    });
    burst(unit.x, unit.y, "#7cffc4", 88);
    addSkillEffect("cloak", unit, { radius: disruptRadius, color: "#7cffc4", life: 1.1 });
    setMessage("幻象粒子散布");
    return;
  }

  if (unit.name === "Bastion") {
    const target = enemies.filter((e) => e.hp > 0).sort((a, b) => (b.boss ? 1 : 0) - (a.boss ? 1 : 0) || b.hp - a.hp)[0];
    if (target) {
      const radius = unit.ultimateSplashRadius || 118;
      const bossBonus = target.boss ? 1.85 : 1;
      hit(target, (185 + unit.damage * 1.8 + (unit.bastionBonus || 0)) * bossBonus, "#f6c34f", unit.id);
      enemies.filter((e) => e.hp > 0 && e.id !== target.id && dist(e, target) < radius).forEach((e) => hit(e, 72 + unit.damage * 0.75, "#f6c34f", unit.id));
      burst(target.x, target.y, "#f6c34f", 96);
      addSkillEffect("artillery", unit, { x: target.x, y: target.y, radius, color: "#f6c34f", life: 1.15, follow: false });
    }
    holdPositionAfterCast(unit);
    setMessage("要塞齊射");
    return;
  }

  if (unit.name === "Mirage") {
    const duration = unit.mirageDomainDuration || 4;
    const radius = unit.mirageDomainRadius || 294;
    skillEffects.push({
      type: "mirage-domain",
      x: unit.x,
      y: unit.y,
      radius,
      color: "#c37bff",
      life: duration,
      maxLife: duration,
      source: unit.id,
      damagePerSecond: unit.mirageDomainDamage || (18 + unit.damage * 0.55) * 0.5,
      rotation: Math.random() * Math.PI * 2,
      follow: false,
      tick: 0
    });
    enemies.filter((e) => e.hp > 0 && dist(unit, e) < radius).forEach((e) => {
      e.jamTime = Math.max(e.jamTime || 0, duration);
      e.slowTime = Math.max(e.slowTime || 0, duration);
      e.fireControlTime = Math.max(e.fireControlTime || 0, duration);
    });
    burst(unit.x, unit.y, "#c37bff", 84);
    holdPositionAfterCast(unit);
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
  const source = squad.find((u) => u.id === sourceId && u.hp > 0);
  target.hp -= amount * sourceDamageFactor(source);
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
  unit.ultCharge = clamp((unit.ultCharge || 0) + amount * (unit.ultChargeMultiplier || 1), 0, unit.ultMax || 100);
}

function chargeUltimateByHealing(unit, amount) {
  if (!unit || unit.hp <= 0 || amount <= 0) return;
  chargeUltimate(unit.id, Math.max(1, amount * 0.42));
}

function himawariAttackFactor(unit) {
  const status = unit?.himawariStatus;
  if (!status || status.life <= 0) return 1;
  if (status.kind === "atk-up") return 1.8;
  if (status.kind === "atk-down") return 0.2;
  return 1;
}

function sourceDamageFactor(unit) {
  let factor = himawariAttackFactor(unit);
  if (unit?.seedAwakenTime > 0) factor *= 1.35;
  if (unit?.zeroBreak) factor *= 1.25;
  return factor;
}

function himawariDefenseFactor(unit) {
  const status = unit?.himawariStatus;
  if (!status || status.life <= 0) return 1;
  if (status.kind === "def-up") return 0.2;
  if (status.kind === "def-down") return 1.8;
  return 1;
}

function unitDefenseFactor(unit) {
  let factor = 1 - clamp(unit?.damageReduction || 0, 0, 0.45);
  if (unit?.zeroBreak) factor *= 1.15;
  return factor;
}

function himawariSpeedFactor(unit) {
  const status = unit?.himawariStatus;
  return status?.kind === "speed-down" && status.life > 0 ? 0.2 : 1;
}

function applyHimawariPassive(unit) {
  const allies = squad.filter((ally) => ally.hp > 0 && ally.id !== unit.id);
  if (!allies.length) return;
  const target = allies[Math.floor(Math.random() * allies.length)];
  const options = [
    { kind: "atk-up", label: "攻擊 +80%", shortLabel: "攻+", buff: true, color: "#ff8be8" },
    { kind: "def-up", label: "防禦 +80%", shortLabel: "防+", buff: true, color: "#ff8be8" },
    { kind: "speed-down", label: "速度 -80%", shortLabel: "速-", buff: false, color: "#6b3dff" },
    { kind: "atk-down", label: "攻擊 -80%", shortLabel: "攻-", buff: false, color: "#7a2cff" },
    { kind: "def-down", label: "防禦 -80%", shortLabel: "防-", buff: false, color: "#4d2a9f" }
  ];
  const status = options[Math.floor(Math.random() * options.length)];
  target.himawariStatus = { ...status, life: 5, maxLife: 5 };
  target.buttonPulse = 0.25;
  burst(target.x, target.y, status.color, 18);
  addSkillEffect("himawari-status", target, { radius: 76, color: status.color, life: 5, follow: true, buff: status.buff, label: status.shortLabel });
  setMessage(`我幫緊你: ${target.name} ${status.label}`);
}

function performHimawariFanAttack(unit, target) {
  const range = unit.range + 35;
  const cone = unit.himawariCone || 0.82;
  const base = Math.atan2(target.y - unit.y, target.x - unit.x);
  const targets = enemies.filter((enemy) => {
    if (enemy.hp <= 0 || dist(unit, enemy) > range + bodyRadius(enemy) * 0.4) return false;
    let diff = Math.atan2(enemy.y - unit.y, enemy.x - unit.x) - base;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    return Math.abs(diff) <= cone;
  });
  targets.forEach((enemy) => {
    hit(enemy, unit.damage * 0.92, "#ff7bd6", unit.id);
    triggerHimawariCombo(unit, enemy);
  });
  burst(unit.x, unit.y, "#ff7bd6", 18);
  addSkillEffect("himawari-fan", unit, { tx: target.x, ty: target.y, radius: range, color: "#ff7bd6", life: 0.46 });
}

function triggerHimawariCombo(unit, target) {
  if (!target || target.hp <= 0) return;
  unit.himawariComboHitsByTarget ||= {};
  const hits = (unit.himawariComboHitsByTarget[target.id] || 0) + 1;
  unit.himawariComboHitsByTarget[target.id] = hits;
  if (hits < 3) {
    burst(target.x, target.y, "#ff9ee8", 6);
    return;
  }

  unit.himawariComboHitsByTarget[target.id] = 0;
  const radius = unit.himawariComboRadius || 78;
  const damage = unit.himawariComboDamage || Math.max(18, unit.damage * 1.25);
  enemies
    .filter((enemy) => enemy.hp > 0 && dist(enemy, target) <= radius + bodyRadius(enemy) * 0.35)
    .forEach((enemy) => hit(enemy, damage, "#ff62d6", unit.id));
  burst(target.x, target.y, "#ff62d6", 34);
  addSkillEffect("himawari-kitchen", null, { x: target.x, y: target.y, radius, color: "#ff62d6", life: 0.72, follow: false });
}

function updateHimawariPoison(dt) {
  skillEffects
    .filter((effect) => effect.type === "himawari-poison")
    .forEach((effect) => {
      const target = enemies.find((enemy) => enemy.id === effect.targetId && enemy.hp > 0);
      if (!target) {
        effect.life = 0;
        return;
      }
      effect.x = target.x;
      effect.y = target.y;
      effect.tick = (effect.tick || 0) + dt;
      if (effect.tick >= 0.25) {
        const damage = target.maxHp * effect.percentPerSecond * effect.tick;
        hit(target, damage, effect.color, effect.source);
        effect.tick = 0;
        burst(target.x, target.y, effect.color, 2);
      }
    });
}

function attackMultiplier(unit) {
  return unit?.name === "Nova" && unit.quantumTime > 0 ? 3 : 1;
}

function performNovaQuantumSlash(unit) {
  const radius = unit.quantumSlashRadius || 132;
  const damage = unit.damage * attackMultiplier(unit);
  enemies
    .filter((enemy) => enemy.hp > 0 && dist(enemy, unit) < radius)
    .forEach((enemy) => hit(enemy, damage, "#ff9b38", unit.id));
  burst(unit.x, unit.y, "#ff9b38", 18);
  addSkillEffect("quantum-slash", unit, { radius, color: "#ff9b38", life: 0.46, follow: true });
}

function triggerMeteorSupport(unit, target) {
  if (!unit.meteorSupport || unit.damage <= 0 || !target || target.hp <= 0 || Math.random() >= 0.35) return;
  const radius = 74;
  const damage = Math.max(12, unit.damage * 0.72);
  enemies
    .filter((enemy) => enemy.hp > 0 && dist(enemy, target) <= radius + bodyRadius(enemy) * 0.35)
    .forEach((enemy) => hit(enemy, damage, "#ffd166", unit.id));
  burst(target.x, target.y, "#ffd166", 26);
  addSkillEffect("meteor-strike", null, { x: target.x, y: target.y, radius, color: "#ffd166", life: 0.62, follow: false });
}

function applyHelixRegen(unit, dt) {
  const radius = unit.regenRadius || 260;
  const healPerSecond = unit.regenRate || 13;
  squad.forEach((ally) => {
    if (ally.hp <= 0 || dist(unit, ally) > radius) return;
    const hpBefore = ally.hp;
    ally.hp = clamp(ally.hp + healPerSecond * dt, 1, ally.maxHp);
    ally.regenGlow = Math.max(ally.regenGlow || 0, 0.25);
    chargeUltimateByHealing(unit, ally.hp - hpBefore);
  });
  if (Math.random() < dt * 18) {
    const angle = Math.random() * Math.PI * 2;
    const spread = Math.random() * radius;
    burst(unit.x + Math.cos(angle) * spread, unit.y + Math.sin(angle) * spread, "#7cffc4", 1);
  }
}

function applyMirageAura(unit, dt) {
  const radius = unit.jamRadius || 270;
  enemies
    .filter((enemy) => enemy.hp > 0 && dist(unit, enemy) < radius)
    .forEach((enemy) => {
      enemy.jamTime = Math.max(enemy.jamTime || 0, 0.35);
      enemy.slowTime = Math.max(enemy.slowTime || 0, 0.35);
      if (Math.random() < dt * 10) burst(enemy.x, enemy.y, "#c37bff", 1);
    });
}

function applyEkAura(unit, dt) {
  const radius = unit.ekAuraRange || 235;
  enemies
    .filter((enemy) => enemy.hp > 0 && dist(unit, enemy) < radius)
    .forEach((enemy) => {
      enemy.tauntTarget = unit.id;
      enemy.tauntTime = Math.max(enemy.tauntTime || 0, 0.48);
      enemy.aim = { x: unit.x, y: unit.y };
      if (Math.random() < dt * 8) burst(enemy.x, enemy.y, "#48a8ff", 1);
    });
}

function updateMirageDomains(dt) {
  skillEffects
    .filter((effect) => effect.type === "mirage-domain")
    .forEach((effect) => {
      effect.tick = (effect.tick || 0) + dt;
      enemies
        .filter((enemy) => enemy.hp > 0 && dist(enemy, effect) < effect.radius)
        .forEach((enemy) => {
          enemy.jamTime = Math.max(enemy.jamTime || 0, 0.45);
          enemy.slowTime = Math.max(enemy.slowTime || 0, 0.45);
          enemy.fireControlTime = Math.max(enemy.fireControlTime || 0, 0.45);
          if (effect.tick >= 0.24) hit(enemy, effect.damagePerSecond * effect.tick, effect.color, effect.source);
        });
      if (effect.tick >= 0.24) effect.tick = 0;
    });
}

function applyGuardianRegen(unit, dt) {
  if (unit.hp <= 0 || unit.hp >= unit.maxHp) return;
  const hpBefore = unit.hp;
  unit.hp = clamp(unit.hp + (unit.guardianRegenRate || 5) * dt, 1, unit.maxHp);
  if (unit.hp > hpBefore) unit.regenGlow = Math.max(unit.regenGlow || 0, 0.3);
}

function applyGnField(unit, dt) {
  const radius = unit.gnFieldRadius || 170;
  const push = unit.gnPush || 210;
  enemies
    .filter((enemy) => enemy.hp > 0 && dist(unit, enemy) < radius)
    .forEach((enemy) => {
      moveAwayFrom(enemy, unit, push * dt);
      enemy.slowTime = Math.max(enemy.slowTime || 0, 0.22);
      enemy.aim = { x: unit.x, y: unit.y };
      clampUnitAfterSeparation(enemy);
      if (Math.random() < dt * 14) burst(enemy.x, enemy.y, "#8bd7ff", 1);
    });
}

function updateGravityFields(dt) {
  gravityFields.forEach((field) => {
    field.life -= dt;
    enemies
      .filter((enemy) => enemy.hp > 0 && dist(enemy, field) < field.radius)
      .forEach((enemy) => {
        moveToward(enemy, field, field.pull * dt);
        enemy.slowTime = Math.max(enemy.slowTime || 0, 0.28);
        clampUnitAfterSeparation(enemy);
        if (Math.random() < dt * 16) burst(enemy.x, enemy.y, field.color, 1);
      });
  });
  gravityFields = gravityFields.filter((field) => field.life > 0);
}

function applyGenesisWave(enemy) {
  enemy.genesisTime = Math.max(enemy.genesisTime || 0, 8);
  enemy.jamTime = Math.max(enemy.jamTime || 0, enemy.boss ? 2.5 : 4);
  enemy.slowTime = Math.max(enemy.slowTime || 0, enemy.boss ? 2.5 : 4);
  if (Math.random() < 0.55) burst(enemy.x, enemy.y, "#ff3d54", 3);
}

function firePositronCannon(unit) {
  const damage = 90 + Math.max(0, unit.damage) * 2;
  enemies.filter((enemy) => enemy.hp > 0).forEach((enemy) => {
    const finalDamage = enemy.boss ? damage * 0.55 : damage;
    shots.push({ x: unit.x, y: unit.y, tx: enemy.x, ty: enemy.y, color: "#ffd166", life: 0.45, maxLife: 0.45, damage: finalDamage, target: enemy.id, source: unit.id });
  });
  burst(unit.x, unit.y, "#ffd166", 64);
  addSkillEffect("positron-cannon", unit, { radius: W * 0.7, color: "#ffd166", life: 1.1, follow: false });
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
  unit.postCastHold = Math.max(0, (unit.postCastHold || 0) - dt);
  unit.shield = Math.max(0, unit.shield - dt);
  unit.attackPulse = Math.max(0, (unit.attackPulse || 0) - dt);
  unit.buttonPulse = Math.max(0, (unit.buttonPulse || 0) - dt);
  unit.speedBoost = Math.max(0, (unit.speedBoost || 0) - dt);
  unit.stealthTime = Math.max(0, (unit.stealthTime || 0) - dt);
  unit.regenAuraTime = Math.max(0, (unit.regenAuraTime || 0) - dt);
  unit.regenGlow = Math.max(0, (unit.regenGlow || 0) - dt);
  unit.guardianRegenTime = Math.max(0, (unit.guardianRegenTime || 0) - dt);
  unit.gnFieldTime = Math.max(0, (unit.gnFieldTime || 0) - dt);
  unit.mirageAuraTime = Math.max(0, (unit.mirageAuraTime || 0) - dt);
  unit.quantumTime = Math.max(0, (unit.quantumTime || 0) - dt);
  unit.seedAwakenTime = Math.max(0, (unit.seedAwakenTime || 0) - dt);
  if (unit.seedProtocol && !unit.seedAwakened && unit.hp <= unit.maxHp * 0.35) {
    unit.seedAwakened = true;
    unit.seedAwakenTime = 5;
    unit.buttonPulse = 0.5;
    burst(unit.x, unit.y, "#ff3d54", 38);
    addSkillEffect("seed-awaken", unit, { radius: bodyRadius(unit) + 78, color: "#ff3d54", life: 1.2, follow: true });
  }
  if (unit.positronProtocol && !unit.positronFired && unit.hp <= unit.maxHp * 0.35) {
    unit.positronFired = true;
    firePositronCannon(unit);
  }
  if (unit.himawariStatus) {
    unit.himawariStatus.life = Math.max(0, unit.himawariStatus.life - dt);
    if (unit.himawariStatus.life <= 0) unit.himawariStatus = null;
  }
  if (unit.name === "Himawari (Candy專用機)") {
    unit.himawariPassiveCooldown = Math.max(0, (unit.himawariPassiveCooldown || 0) - dt);
    if (unit.himawariPassiveCooldown <= 0) {
      applyHimawariPassive(unit);
      unit.himawariPassiveCooldown = (unit.himawariPassiveMin || 7) + Math.random() * 7;
    }
  }
  if (unit.name === "Asterion" && unit.guardianRegenTime > 0) applyGuardianRegen(unit, dt);
  if (unit.name === "Valkyr" && unit.gnFieldTime > 0) applyGnField(unit, dt);
  if (unit.name === "Helix" && unit.regenAuraTime > 0) applyHelixRegen(unit, dt);
  if (unit.name === "Mirage" && unit.mirageAuraTime > 0) applyMirageAura(unit, dt);
  if (unit.postCastHold > 0) {
    unit.target = null;
    unit.move = null;
    return;
  }
  if (unit.name === "MEGA(EK專用機)" && unit.ekAuraActive) applyEkAura(unit, dt);
  if (unit.damage < 0 && unit.hp < unit.maxHp * 0.58 && unit.shield <= 0) unit.shield = 1.6;
  const quantumMoveBoost = unit.name === "Nova" && unit.quantumTime > 0 ? 3 : 1;
  const seedMoveBoost = unit.seedAwakenTime > 0 ? 1.35 : 1;
  const moveSpeed = unit.speed * (unit.speedBoost > 0 ? 1.34 : 1) * quantumMoveBoost * seedMoveBoost * himawariSpeedFactor(unit);

  if (unit.name === "MEGA(EK專用機)") {
    unit.lostTime = Math.max(0, (unit.lostTime || 0) - dt);
    unit.lostCooldown = Math.max(0, (unit.lostCooldown || 0) - dt);
    unit.lostRetarget = Math.max(0, (unit.lostRetarget || 0) - dt);
    if (unit.lostTime <= 0 && unit.lostCooldown <= 0) {
      unit.lostTime = 3;
      unit.lostCooldown = 10 + Math.random() * 12;
      unit.lostRetarget = 0;
      unit.target = null;
      unit.move = null;
      unit.command = "idle";
      addSkillEffect("lost", unit, { radius: 94, color: "#48a8ff", life: 3, follow: true });
      setMessage("MEGA: 迷路中");
    }
    if (unit.lostTime > 0) {
      if (!unit.lostPoint || unit.lostRetarget <= 0 || dist(unit, unit.lostPoint) < 12) {
        unit.lostPoint = {
          x: clamp(unit.x + (Math.random() - 0.5) * 520, ALLIED_MIN_X, ALLIED_MAX_X),
          y: clamp(unit.y + (Math.random() - 0.5) * 420, ALLIED_MIN_Y, ALLIED_MAX_Y)
        };
        unit.lostRetarget = 0.45 + Math.random() * 0.45;
      }
      moveToward(unit, unit.lostPoint, moveSpeed * 1.45 * dt);
      return;
    }
  }

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
      const followHealDistance = unit.range * 0.99;
      if (target.id !== unit.id) {
        if (d > followHealDistance) moveToward(unit, target, moveSpeed * dt);
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
      if (unit.name === "Nova" && unit.quantumTime > 0) {
        performNovaQuantumSlash(unit);
      } else {
        if (unit.name === "Himawari (Candy專用機)") {
          performHimawariFanAttack(unit, target);
        } else if (unit.name === "MEGA(EK專用機)") {
          const radius = unit.omniSlashRadius || 132;
          const targets = enemies.filter((enemy) => enemy.hp > 0 && dist(unit, enemy) < radius + bodyRadius(enemy) * 0.45);
          const damage = unit.damage * (targets.length > 1 ? 0.92 : 1.15);
          targets.forEach((enemy) => hit(enemy, damage, "#48a8ff", unit.id));
          burst(unit.x, unit.y, "#48a8ff", 34);
          addSkillEffect("omni-slash", unit, { radius, color: "#48a8ff", life: 0.42 });
        } else if (unit.name === "Orion") {
          shots.push({ x: unit.x, y: unit.y, tx: target.x, ty: target.y, color: unit.color, life: 0.22, maxLife: 0.22, damage: target.boss ? unit.damage * 0.65 : unit.damage, target: target.id, source: unit.id });
          const extra = enemies
            .filter((e) => e.hp > 0 && e.id !== target.id && dist(unit, e) <= unit.range + 70)
            .sort((a, b) => a.hp - b.hp)[0];
          if (extra && Math.random() < (unit.dragoonSplitChance || 0.42)) {
            shots.push({ x: unit.x, y: unit.y, tx: extra.x, ty: extra.y, color: unit.color, life: 0.26, maxLife: 0.26, damage: Math.max(8, unit.damage * 0.62), target: extra.id, source: unit.id });
          }
        } else if (unit.name === "Bastion") {
          const damage = (unit.damage + (unit.bastionBonus || 0) * 0.35) * (target.boss ? 1.7 : 1.1);
          const splashRadius = Math.max(unit.bastionBasicSplashRadius || 93, (unit.splashRadius || 92) * 0.85);
          shots.push({ x: unit.x, y: unit.y, tx: target.x, ty: target.y, color: unit.color, life: 0.34, maxLife: 0.34, damage, target: target.id, source: unit.id, splashRadius, splashDamage: unit.damage * 0.32 });
        } else {
          shots.push({ x: unit.x, y: unit.y, tx: target.x, ty: target.y, color: unit.color, life: 0.24, maxLife: 0.24, damage: unit.damage, target: target.id, source: unit.id });
        }
        triggerMeteorSupport(unit, target);
      }
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
  if (actor.pushResistance) amount *= 1 - clamp(actor.pushResistance, 0, 0.6);
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
        if ((a.name === "Nova" && a.quantumTime > 0) || (b.name === "Nova" && b.quantumTime > 0)) continue;
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

        const aResist = (a.pushResistance ? 1 - clamp(a.pushResistance, 0, 0.6) : 1) * (a.zeroBreak ? 1 - (a.zeroBreakPushReduction || 0.5) : 1);
        const bResist = (b.pushResistance ? 1 - clamp(b.pushResistance, 0, 0.6) : 1) * (b.zeroBreak ? 1 - (b.zeroBreakPushReduction || 0.5) : 1);
        const push = (minD - d) * 0.5;
        const nx = dx / d;
        const ny = dy / d;
        a.x -= nx * push * aResist;
        a.y -= ny * push * aResist;
        b.x += nx * push * bResist;
        b.y += ny * push * bResist;
        clampUnitAfterSeparation(a);
        clampUnitAfterSeparation(b);
      }
    }
  }
}

function stepEnemy(enemy, dt) {
  const living = squad.filter((u) => u.hp > 0 && (u.stealthTime || 0) <= 0);
  if (!living.length) return;
  enemy.cooldown = Math.max(0, enemy.cooldown - dt);
  enemy.attackPulse = Math.max(0, (enemy.attackPulse || 0) - dt);
  enemy.tauntTime = Math.max(0, (enemy.tauntTime || 0) - dt);
  enemy.jamTime = Math.max(0, (enemy.jamTime || 0) - dt);
  enemy.slowTime = Math.max(0, (enemy.slowTime || 0) - dt);
  enemy.fireControlTime = Math.max(0, (enemy.fireControlTime || 0) - dt);
  enemy.genesisTime = Math.max(0, (enemy.genesisTime || 0) - dt);
  enemy.frontlineSuppressionTime = Math.max(0, (enemy.frontlineSuppressionTime || 0) - dt);
  const target = chooseEnemyTarget(enemy, living);
  const d = dist(enemy, target);
  const genesisFactor = enemy.genesisTime > 0 ? (enemy.boss ? 0.875 : 0.75) : 1;
  const speedFactor = (enemy.slowTime > 0 ? 0.54 : 1) * genesisFactor;
  if (d > enemy.range) moveToward(enemy, target, enemy.speed * speedFactor * dt);
  if (d <= enemy.range && enemy.cooldown <= 0 && (enemy.fireControlTime || 0) <= 0) {
    const jamFactor = enemy.jamTime > 0 ? 1.38 : 1;
    enemy.cooldown = enemy.rate * jamFactor + Math.random() * 0.22;
    enemy.attackPulse = 0.2;
    enemy.aim = { x: target.x, y: target.y };
    const frontlineFactor = enemy.frontlineSuppressionTime > 0 ? 0.85 : 1;
    const baseDamage = enemy.damage * (enemy.jamTime > 0 ? 0.68 : 1) * genesisFactor * frontlineFactor;
    const damage = (target.shield > 0 ? baseDamage * 0.45 : baseDamage) * himawariDefenseFactor(target) * unitDefenseFactor(target);
    target.hp = clamp(target.hp - damage, 0, target.maxHp);
    if (target.frontlineSuppression) {
      enemies
        .filter((other) => other.hp > 0 && dist(other, target) < 170)
        .forEach((other) => { other.frontlineSuppressionTime = Math.max(other.frontlineSuppressionTime || 0, 1.8); });
    }
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
  if (!running || paused) return;
  squad.forEach((u) => stepUnit(u, dt));
  enemies.forEach((e) => stepEnemy(e, dt));
  updateGravityFields(dt);
  updateMirageDomains(dt);
  updateHimawariPoison(dt);
  resolveBodyOverlaps();

  shots.forEach((shot) => {
    shot.life -= dt;
    if (shot.life <= 0 && shot.damage) {
      const target = enemies.find((e) => e.id === shot.target);
      if (target) {
        hit(target, shot.damage, shot.color, shot.source);
        if (shot.splashRadius) {
          enemies
            .filter((e) => e.hp > 0 && e.id !== target.id && dist(e, target) < shot.splashRadius)
            .forEach((e) => hit(e, shot.splashDamage || shot.damage * 0.35, shot.color, shot.source));
          addSkillEffect("impact-grid", null, { x: target.x, y: target.y, radius: shot.splashRadius, color: shot.color, life: 0.45, follow: false });
        }
      }
    }
  });
  shots = shots.filter((s) => s.life > -0.02);

  sparks.forEach((s) => {
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.life -= dt;
  });
  sparks = sparks.filter((s) => s.life > 0);
  skillEffects.forEach((effect) => {
    effect.life -= dt;
  });
  skillEffects = skillEffects.filter((effect) => effect.life > 0);
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
  applyRoundStartRewards();
  spawnWave();
}

function applyRoundStartRewards() {
  squad.forEach((unit) => {
    if (unit.hp <= 0 || !unit.roundHealPercent) return;
    unit.hp = clamp(unit.hp + Math.ceil(unit.maxHp * unit.roundHealPercent), 1, unit.maxHp);
    unit.regenGlow = Math.max(unit.regenGlow || 0, 0.35);
  });
}

async function showReward() {
  running = false;
  setPauseButtonVisible(false);
  rewardChoices = pickRewards();
  if (rewardChoices.some((reward) => rewardTier(reward) === "ultra")) ultraRewardPity = 0;
  else ultraRewardPity += 1;
  showLoading("載入獎勵圖像...");
  await loadRewardArt(rewardChoices);
  rewardOptionsEl.innerHTML = rewardChoices.map((reward, index) => `
    <button class="reward-card tier-${rewardTier(reward)}" data-reward-index="${index}">
      <img src="${assetSrc(reward.icon)}" alt="${reward.name} icon" />
      <div class="reward-copy">
        <div class="reward-type">${rewardTierLabel(reward)} / ${reward.type}</div>
        <h3>${reward.name}</h3>
        <p>${reward.text}</p>
      </div>
    </button>
  `).join("");
  hideLoading();
  rewardEl.hidden = false;
  setMessage("選擇一項強化");
}

function pickRewards() {
  const activeNames = new Set(squad.map((unit) => unit.name));
  const generalRewards = upgradePool.filter((reward) => !reward.unit);
  const groupedByUnit = new Map();
  upgradePool
    .filter((reward) => reward.unit && activeNames.has(reward.unit))
    .forEach((reward) => {
      if (!groupedByUnit.has(reward.unit)) groupedByUnit.set(reward.unit, []);
      groupedByUnit.get(reward.unit).push(reward);
    });

  const unitCandidates = [...activeNames]
    .map((name) => {
      const rewards = groupedByUnit.get(name) || [];
      return rewards.length ? rewards[Math.floor(Math.random() * rewards.length)] : null;
    })
    .filter(Boolean);

  const pool = [...generalRewards, ...unitCandidates];
  const picks = [];
  const forceUltra = ultraRewardPity >= REWARD_ULTRA_PITY_LIMIT;
  if (forceUltra) drawRewardByTier(pool, picks, "ultra");
  while (picks.length < 3 && pool.length) {
    const tier = drawRewardTier();
    if (!drawRewardByTier(pool, picks, tier)) {
      const index = Math.floor(Math.random() * pool.length);
      picks.push(pool.splice(index, 1)[0]);
    }
  }
  return picks;
}

function rewardTier(reward) {
  return reward.tier || (reward.unit ? "rare" : "common");
}

function rewardTierLabel(reward) {
  const tier = rewardTier(reward);
  if (tier === "ultra") return "Ultra Rare";
  if (tier === "rare") return "Rare";
  return "Common";
}

function drawRewardTier() {
  const roll = Math.random();
  if (roll < REWARD_TIER_WEIGHTS.ultra) return "ultra";
  if (roll < REWARD_TIER_WEIGHTS.ultra + REWARD_TIER_WEIGHTS.rare) return "rare";
  return "common";
}

function drawRewardByTier(pool, picks, tier) {
  const candidates = pool
    .map((reward, index) => ({ reward, index }))
    .filter((entry) => rewardTier(entry.reward) === tier);
  if (!candidates.length) return false;
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  picks.push(chosen.reward);
  pool.splice(chosen.index, 1);
  return true;
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
  setPauseButtonVisible(true);
}

function endMission(won) {
  running = false;
  setPauseButtonVisible(false);
  document.body.classList.add("setup-mode");
  resizeCanvas();
  leaderboardScore = score;
  leaderboardSubmitted = false;
  playerNameEl.value = localStorage.getItem("mecha-heart-player-name") || "";
  leaderboardFormEl.querySelector("button").disabled = false;
  resultEl.classList.toggle("lost", !won);
  resultEl.classList.toggle("won", won);
  resultTitleEl.textContent = won ? "作戰完成" : "作戰結束";
  resultCopyEl.innerHTML = `
    <div class="result-score">
      <span>最終分數</span>
      <strong>${score}</strong>
    </div>
    <div class="result-lines">
      <span>抵達第 ${wave} 回合</span>
      <span>${won ? "艦隊防線仍然健在。" : "機體已撤退，重新整備後再出擊。"}</span>
    </div>
  `;
  resultEl.hidden = false;
  loadLeaderboard();
}

function renderHudCardsShell() {
  const signature = squad.map((u) => `${u.id}:${u.name}:${u.role}:${u.sprite || u.art}`).join("|");
  if (signature === hudCardsSignature) return;
  hudCardsSignature = signature;
  cardsEl.innerHTML = squad.map((u) => `
    <article class="unit-card" data-unit-id="${u.id}">
      <img src="${assetSrc(u.sprite || u.art)}" alt="${u.name} artwork" draggable="false" decoding="async" loading="eager" />
      <div class="unit-info">
        <h3>${u.name}</h3>
        <div class="role">${u.role}</div>
        <div class="bar hp"><span data-card-hp></span></div>
        <div class="bar cool"><span data-card-cool></span></div>
      </div>
    </article>
  `).join("");
}

function updateHud() {
  waveEl.textContent = wave % 3 === 0 ? `${wave} BOSS` : String(wave);
  scoreEl.textContent = String(score);
  bestScoreEl.textContent = String(bestScore);
  enemyCountEl.textContent = String(enemies.length);
  renderHudCardsShell();
  squad.forEach((u) => {
    const hp = Math.max(0, (u.hp / u.maxHp) * 100);
    const cool = 100 - Math.min(100, (u.skillCooldown / 10) * 100);
    const card = cardsEl.querySelector(`.unit-card[data-unit-id="${u.id}"]`);
    if (!card) return;
    card.classList.toggle("down", u.hp <= 0);
    card.querySelector("[data-card-hp]").style.width = `${hp}%`;
    card.querySelector("[data-card-cool]").style.width = `${cool}%`;
  });
  updateSkillBar();
}

function renderSkillBarShell() {
  const signature = squad.map((unit) => [
    unit.id,
    unit.name,
    unit.skill,
    unit.ultimate,
    unit.activeIcon,
    unit.ultimateIcon,
    unit.activeDesc,
    unit.ultimateDesc
  ].join(":")).join("|");
  if (signature === skillBarSignature) return;
  skillBarSignature = signature;
  skillButtonsEl.innerHTML = squad.map((unit) => {
    return `
      <div class="skill-pair" data-unit-id="${unit.id}">
        <button class="skill-button active" data-unit-id="${unit.id}" data-skill-kind="active" title="${unit.name}: ${unit.skill} - ${unit.activeDesc}">
          <img src="${assetSrc(unit.activeIcon)}" alt="${unit.skill}" draggable="false" decoding="async" loading="eager" />
          <span>${unit.skill}</span>
          <small data-skill-status>${unit.name}</small>
          <em>${unit.activeDesc}</em>
        </button>
        <button class="skill-button ultimate" data-unit-id="${unit.id}" data-skill-kind="ultimate" title="${unit.name}: ${unit.ultimate} - ${unit.ultimateDesc}">
          <img src="${assetSrc(unit.ultimateIcon)}" alt="${unit.ultimate}" draggable="false" decoding="async" loading="eager" />
          <span>${unit.ultimate}</span>
          <small data-ultimate-charge>0%</small>
          <em>${unit.ultimateDesc}</em>
        </button>
      </div>
    `;
  }).join("");
}

function updateSkillBar() {
  renderSkillBarShell();
  squad.forEach((unit) => {
    const charge = Math.floor(((unit.ultCharge || 0) / (unit.ultMax || 100)) * 100);
    const dead = unit.hp <= 0;
    const activeCooling = unit.skillCooldown > 0;
    const ultCharging = charge < 100;
    const pulse = unit.buttonPulse > 0;
    const pair = skillButtonsEl.querySelector(`.skill-pair[data-unit-id="${unit.id}"]`);
    if (!pair) return;
    pair.classList.toggle("focused", focusedUnit?.id === unit.id);

    const activeButton = pair.querySelector('.skill-button[data-skill-kind="active"]');
    activeButton.classList.toggle("not-ready", activeCooling);
    activeButton.classList.toggle("pulse", pulse || (unit.name === "MEGA(EK專用機)" && unit.ekAuraActive));
    activeButton.disabled = dead;
    activeButton.querySelector("[data-skill-status]").textContent = activeCooling ? `${Math.ceil(unit.skillCooldown)}秒` : (unit.name === "MEGA(EK專用機)" && unit.ekAuraActive ? "啟動中" : unit.name);

    const ultimateButton = pair.querySelector('.skill-button[data-skill-kind="ultimate"]');
    ultimateButton.classList.toggle("not-ready", ultCharging);
    ultimateButton.classList.toggle("pulse", pulse);
    ultimateButton.disabled = dead;
    ultimateButton.style.setProperty("--charge", `${charge}%`);
    ultimateButton.querySelector("[data-ultimate-charge]").textContent = `${charge}%`;
  });
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
      <img src="${assetSrc(unit.art || unit.sprite)}" alt="${unit.name} profile" />
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
        <img src="${assetSrc(unit.sprite || unit.art)}" alt="${unit.name} SD sprite" />
        <div>
          <strong>${unit.name}</strong>
          <small>${unit.role}</small>
        </div>
      </article>
    `;
  }).join("");

  const renderFormationCard = (unit) => {
    const selectedForBattle = selectedSquadNames.includes(unit.name);
    const focusedClass = unit.name === focused.name ? "focused" : "";
    return `
      <article class="formation-card ${selectedForBattle ? "selected" : ""} ${focusedClass}" data-unit-name="${unit.name}">
        <img src="${assetSrc(unit.sprite || unit.art)}" alt="${unit.name} SD sprite" />
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
  };
  formationListEl.innerHTML = squadSeeds.filter((unit) => !unit.ace).map(renderFormationCard).join("");
  if (aceUnitListEl) aceUnitListEl.innerHTML = squadSeeds.filter((unit) => unit.ace).map(renderFormationCard).join("");
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

async function showFormation() {
  running = false;
  setPauseButtonVisible(false);
  showLoading("載入編隊機體...");
  if (selectedSquadNames.length !== 4) selectedSquadNames = [...defaultSquadNames];
  formationFocusName = selectedSquadNames[0] || defaultSquadNames[0];
  await loadFormationArt();
  document.body.classList.add("setup-mode");
  briefingEl.hidden = true;
  rewardEl.hidden = true;
  resultEl.hidden = true;
  resultEl.classList.remove("lost", "won");
  formationEl.hidden = false;
  renderDatabase();
  resizeCanvas();
  renderFormation();
  await hydrateDeferredImages(formationEl);
  hideLoading();
  loadBattleArt();
}

async function startBattleFromFormation() {
  if (selectedSquadNames.length !== 4) {
    setMessage("請選擇 4 架機體出擊。");
    renderFormation();
    return;
  }
  showLoading("載入戰鬥機體...");
  await loadBattleArt();
  formationEl.hidden = true;
  document.body.classList.remove("setup-mode");
  resizeCanvas();
  reset();
  running = true;
  setPauseButtonVisible(true);
  last = now();
  hideLoading();
  loadAllRewardArt();
}

function renderDatabase() {
  const renderRows = (entries, className) => entries.map((unit) => `
    <article class="db-row ${className}">
      <img src="${assetSrc(unit.art || unit.sprite)}" alt="${unit.name} design" />
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

function tracePolygon(cx, cy, radius, sides, rotation = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = rotation + (i / sides) * Math.PI * 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawShieldBubble(cx, cy, radius) {
  const pulse = Math.sin(now() * 8) * 2.5;
  ctx.save();
  ctx.shadowColor = "#4be4ff";
  ctx.shadowBlur = 14;
  ctx.strokeStyle = "rgba(220,255,255,0.78)";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + pulse, 0, Math.PI * 2);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.16;
  const gradient = ctx.createRadialGradient(cx - radius * 0.25, cy - radius * 0.32, radius * 0.2, cx, cy, radius);
  gradient.addColorStop(0, "rgba(255,255,255,0.5)");
  gradient.addColorStop(0.42, "rgba(75,228,255,0.2)");
  gradient.addColorStop(1, "rgba(75,228,255,0.02)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.62;
  ctx.strokeStyle = "rgba(75,228,255,0.78)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.78 + pulse * 0.4, -0.28 * Math.PI, 0.18 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.78 + pulse * 0.4, 0.72 * Math.PI, 1.18 * Math.PI);
  ctx.stroke();

  ctx.globalAlpha = 0.48;
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 4; i++) {
    const angle = -Math.PI / 2 + (i / 4) * Math.PI * 2 + pulse * 0.01;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * (radius * 0.64), cy + Math.sin(angle) * (radius * 0.64));
    ctx.lineTo(cx + Math.cos(angle) * (radius + 6), cy + Math.sin(angle) * (radius + 6));
    ctx.stroke();
  }
  ctx.restore();
}

function drawMech(unit) {
  const alive = unit.hp > 0;
  const offset = attackOffset(unit);
  ctx.save();
  ctx.translate(unit.x + offset.x, unit.y + offset.y);
  ctx.globalAlpha = alive ? (unit.stealthTime > 0 ? 0.34 : (unit.name === "Nova" && unit.quantumTime > 0 ? 0.62 + Math.sin(now() * 16) * 0.16 : 1)) : 0.18;
  const bob = Math.sin(now() * 3 + unit.x * 0.02) * 3;
  const spriteScale = unit.spriteScale || 1;
  if (drawSheetSprite(unit, 108 * spriteScale, 108 * spriteScale, bob - 4)) {
    ctx.restore();
    if (!alive) return;
    if (unit.regenGlow > 0) {
      ctx.strokeStyle = "rgba(124,255,196,0.48)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(unit.x, unit.y - 6, 44 + unit.regenGlow * 18, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (unit.shield > 0) {
      drawShieldBubble(unit.x, unit.y - 8, 50);
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
    drawShieldBubble(0, 0, 44);
  }
  ctx.restore();
  if (!alive) return;
  if (unit.regenGlow > 0) {
    ctx.strokeStyle = "rgba(124,255,196,0.48)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(unit.x, unit.y - 6, 44 + unit.regenGlow * 18, 0, Math.PI * 2);
    ctx.stroke();
  }
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
    const healColor = s.heal ? "#62f6b0" : s.color;
    ctx.shadowColor = healColor;
    ctx.shadowBlur = s.heal ? 24 : 14;
    ctx.strokeStyle = healColor;
    ctx.lineWidth = s.heal ? 10 : 5;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    if (s.heal) {
      const dx = ex - sx;
      const dy = ey - sy;
      const length = Math.hypot(dx, dy) || 1;
      const nx = -dy / length;
      const ny = dx / length;
      ctx.shadowBlur = 18;
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(220,255,235,0.95)";
      for (let lane = -1; lane <= 1; lane += 2) {
        ctx.beginPath();
        for (let i = 0; i <= 12; i++) {
          const t = i / 12;
          const wave = Math.sin(t * Math.PI * 4 + age * Math.PI * 5) * 8 * lane;
          const x = sx + dx * t + nx * wave;
          const y = sy + dy * t + ny * wave;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }

    ctx.shadowBlur = 0;
    ctx.strokeStyle = s.heal ? "rgba(220,255,235,0.9)" : "rgba(255,255,255,0.92)";
    ctx.lineWidth = s.heal ? 4 : 1.5;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    if (s.heal) {
      ctx.strokeStyle = healColor;
      ctx.lineWidth = 4;
      ctx.globalAlpha = alpha * 0.86;
      ctx.beginPath();
      ctx.arc(s.tx, s.ty - 12, 22 + age * 42, 0, Math.PI * 2);
      ctx.stroke();
      drawPlusMark(s.tx, s.ty - 54 - age * 18, 8, healColor);
      drawPlusMark(s.tx + 24, s.ty - 34 - age * 12, 6, "rgba(220,255,235,0.95)");
      drawPlusMark(s.tx - 24, s.ty - 28 - age * 14, 6, "rgba(220,255,235,0.95)");
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

function effectPosition(effect) {
  const actor = effect.follow ? [...squad, ...enemies].find((item) => item.id === effect.sourceId && item.hp > 0) : null;
  return actor ? { x: actor.x, y: actor.y } : { x: effect.x, y: effect.y };
}

function drawPlusMark(x, y, size, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.18);
  ctx.beginPath();
  ctx.moveTo(x - size, y);
  ctx.lineTo(x + size, y);
  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y + size);
  ctx.stroke();
}

function drawSkillEffects() {
  skillEffects.forEach((effect) => {
    const point = effectPosition(effect);
    const alpha = clamp(effect.life / effect.maxLife, 0, 1);
    const age = 1 - alpha;
    const radius = effect.radius;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = effect.color;
    ctx.shadowBlur = 18;

    if (effect.type === "guardian") {
      ctx.strokeStyle = effect.color;
      ctx.fillStyle = "rgba(75,228,255,0.16)";
      ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.translate(point.x, point.y - 8);
        ctx.rotate(effect.rotation + i * Math.PI / 2 + age * 0.5);
        ctx.fillRect(radius * 0.28, -18, 48, 36);
        ctx.strokeRect(radius * 0.28, -18, 48, 36);
        ctx.restore();
      }
      for (let i = 0; i < 5; i++) drawPlusMark(point.x - 36 + i * 18, point.y - 64 + Math.sin(now() * 5 + i) * 5, 5, "#7cffc4");
    } else if (effect.type === "slash" || effect.type === "blade-storm") {
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = effect.type === "blade-storm" ? 7 : 5;
      for (let i = 0; i < (effect.type === "blade-storm" ? 6 : 3); i++) {
        const angle = effect.rotation + i * 0.72 + age * 2.4;
        const px = Math.cos(angle);
        const py = Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(point.x - px * radius * 0.18 - py * 24, point.y - py * radius * 0.18 + px * 24);
        ctx.lineTo(point.x + px * radius * (0.72 + age * 0.2), point.y + py * radius * (0.72 + age * 0.2));
        ctx.stroke();
      }
    } else if (effect.type === "repair-shield" || effect.type === "revive") {
      const marks = effect.type === "revive" ? 14 : 9;
      for (let i = 0; i < marks; i++) {
        const angle = i * 2.399 + effect.rotation;
        const spread = (radius * 0.18) + (i / marks) * radius * 0.65;
        drawPlusMark(point.x + Math.cos(angle) * spread, point.y + Math.sin(angle) * spread - age * 22, 6, effect.color);
      }
      if (effect.type === "revive") {
        ctx.strokeStyle = "rgba(220,255,235,0.9)";
        ctx.lineWidth = 5;
        squad.filter((unit) => unit.hp > 0).forEach((unit) => {
          ctx.beginPath();
          ctx.moveTo(unit.x, unit.y - 92);
          ctx.lineTo(unit.x, unit.y + 42);
          ctx.stroke();
        });
      }
    } else if (effect.type === "volley" || effect.type === "orbital") {
      const rays = effect.type === "orbital" ? 12 : 7;
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = effect.type === "orbital" ? 4 : 3;
      for (let i = 0; i < rays; i++) {
        const angle = -0.95 + (i / Math.max(1, rays - 1)) * 1.9;
        ctx.beginPath();
        ctx.moveTo(point.x + 18, point.y - 10);
        ctx.lineTo(point.x + Math.cos(angle) * radius * (1 + age * 0.4), point.y + Math.sin(angle) * radius * (1 + age * 0.4));
        ctx.stroke();
      }
    } else if (effect.type === "taunt") {
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 4;
      tracePolygon(point.x, point.y - 8, 52 + age * 34, 4, Math.PI / 4);
      ctx.stroke();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      tracePolygon(point.x, point.y - 8, 32 + age * 18, 4, Math.PI / 4);
      ctx.stroke();
      ctx.fillStyle = "rgba(139,215,255,0.22)";
      ctx.fillRect(point.x - 9, point.y - 86, 18, 44);
    } else if (effect.type === "ek-aura") {
      ctx.strokeStyle = effect.color;
      ctx.fillStyle = "rgba(72,168,255,0.1)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(point.x, point.y - 8, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      ctx.arc(point.x, point.y - 8, radius * (0.68 + Math.sin(now() * 4) * 0.04), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      for (let i = 0; i < 8; i++) {
        const angle = effect.rotation + i * Math.PI / 4 + age * 1.2;
        ctx.beginPath();
        ctx.moveTo(point.x + Math.cos(angle) * radius * 0.92, point.y - 8 + Math.sin(angle) * radius * 0.92);
        ctx.lineTo(point.x + Math.cos(angle) * radius * 0.55, point.y - 8 + Math.sin(angle) * radius * 0.55);
        ctx.stroke();
      }
    } else if (effect.type === "ek-law") {
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 4 + age * 4;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius * (0.35 + age * 0.65), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(230,248,255,0.92)";
      tracePolygon(point.x, point.y, radius * (0.22 + age * 0.18), 6, effect.rotation + age * 2);
      ctx.stroke();
    } else if (effect.type === "omni-slash") {
      ctx.strokeStyle = "#e7f7ff";
      ctx.lineWidth = 6;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(point.x, point.y - 4, radius * (0.32 + i * 0.13 + age * 0.12), effect.rotation + i * 0.7, effect.rotation + i * 0.7 + Math.PI * 1.2);
        ctx.stroke();
      }
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(point.x, point.y - 4, radius * (0.9 + age * 0.08), 0, Math.PI * 2);
      ctx.stroke();
    } else if (effect.type === "lost") {
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 10]);
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(point.x, point.y - 52, 18 + i * 10 + Math.sin(now() * 8 + i) * 3, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    } else if (effect.type === "himawari-fan") {
      const tx = effect.tx ?? point.x + radius;
      const ty = effect.ty ?? point.y;
      const base = Math.atan2(ty - point.y, tx - point.x);
      ctx.fillStyle = "rgba(255,98,214,0.16)";
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.arc(point.x, point.y, radius * (0.45 + age * 0.55), base - 0.82, base + 0.82);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      for (let i = -2; i <= 2; i++) {
        const angle = base + i * 0.32;
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(point.x + Math.cos(angle) * radius, point.y + Math.sin(angle) * radius);
        ctx.stroke();
      }
    } else if (effect.type === "himawari-kitchen" || effect.type === "himawari-poison") {
      ctx.strokeStyle = effect.color;
      ctx.fillStyle = "rgba(255,98,214,0.14)";
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.arc(point.x, point.y - 8, radius * (0.72 + Math.sin(now() * 8) * 0.05), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      for (let i = 0; i < 7; i++) {
        const angle = effect.rotation + i * 0.9 + age * 1.6;
        ctx.beginPath();
        ctx.arc(point.x + Math.cos(angle) * radius * 0.42, point.y - 8 + Math.sin(angle) * radius * 0.34, 5 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (effect.type === "himawari-status") {
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = effect.buff ? 5 : 3;
      ctx.setLineDash(effect.buff ? [] : [7, 8]);
      ctx.beginPath();
      ctx.arc(point.x, point.y - 8, radius * (0.86 + age * 0.14), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = effect.color;
      ctx.font = "900 28px Impact, 'Microsoft JhengHei', sans-serif";
      ctx.textAlign = "center";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(5,8,14,0.84)";
      ctx.strokeText(effect.label || (effect.buff ? "+" : "-"), point.x, point.y - 84);
      ctx.fillText(effect.label || (effect.buff ? "+" : "-"), point.x, point.y - 84);
    } else if (effect.type === "himawari-tantrum") {
      ctx.strokeStyle = effect.color;
      ctx.fillStyle = "rgba(255,98,214,0.12)";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius * (0.55 + age * 0.7), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.lineWidth = 10;
      for (let i = 0; i < 5; i++) {
        const y = point.y - 180 + i * 82;
        ctx.beginPath();
        ctx.moveTo(0, y + Math.sin(now() * 10 + i) * 8);
        ctx.lineTo(W, y + Math.cos(now() * 8 + i) * 10);
        ctx.stroke();
      }
    } else if (effect.type === "rail") {
      const tx = effect.tx ?? point.x + 220;
      const ty = effect.ty ?? point.y;
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(point.x, point.y - 10);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(230,248,255,0.92)";
      ctx.lineWidth = 2;
      ctx.strokeRect(tx - 22 - age * 16, ty - 22 - age * 16, 44 + age * 32, 44 + age * 32);
    } else if (effect.type === "quantum-slash") {
      const pulse = 0.8 + Math.sin(now() * 18 + effect.rotation) * 0.14;
      ctx.globalAlpha = alpha * pulse;
      ctx.strokeStyle = "#fff1be";
      ctx.lineWidth = 7;
      for (let i = 0; i < 3; i++) {
        const start = effect.rotation + i * 2.1 - 0.75;
        const end = start + 1.55;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius * (0.38 + i * 0.16 + age * 0.16), start, end);
        ctx.stroke();
      }
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius * (0.82 + age * 0.08), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (effect.type === "quantum-backstab") {
      const fromX = effect.fromX ?? point.x;
      const fromY = effect.fromY ?? point.y;
      const flicker = 0.72 + Math.sin(now() * 28) * 0.2;
      ctx.globalAlpha = alpha * flicker;
      ctx.strokeStyle = "#ffe6a3";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius * (0.32 + age * 0.2), -0.9, Math.PI + 0.9);
      ctx.stroke();
      for (let i = 0; i < 5; i++) {
        const angle = effect.rotation + i * 1.26;
        ctx.beginPath();
        ctx.moveTo(point.x + Math.cos(angle) * 24, point.y + Math.sin(angle) * 24);
        ctx.lineTo(point.x + Math.cos(angle + 0.22) * radius * 0.72, point.y + Math.sin(angle + 0.22) * radius * 0.72);
        ctx.stroke();
      }
    } else if (effect.type === "quantum-phase") {
      const pulse = 0.68 + Math.sin(now() * 8.5) * 0.18;
      ctx.globalAlpha = pulse * 0.65;
      ctx.strokeStyle = "#ffcf5f";
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius * (0.7 + Math.sin(now() * 4) * 0.04), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = pulse * 0.16;
      ctx.fillStyle = "#ff9b38";
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius * 0.74, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = "#fff1be";
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const y = point.y - radius * 0.45 + i * radius * 0.18;
        ctx.beginPath();
        ctx.moveTo(point.x - radius * 0.48, y);
        ctx.lineTo(point.x + radius * 0.48, y + Math.sin(now() * 5 + i) * 8);
        ctx.stroke();
      }
    } else if (effect.type === "dash") {
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 5;
      ctx.globalAlpha = alpha * 0.9;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius * (0.28 + age * 0.32), 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = alpha * 0.2;
      ctx.fillStyle = effect.color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius * (0.48 + age * 0.18), 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "#fff0bd";
      ctx.lineWidth = 7;
      for (let i = 0; i < 6; i++) {
        const angle = effect.rotation + i * Math.PI / 3 + age * 0.8;
        const inner = radius * 0.18;
        const outer = radius * (0.62 + age * 0.18);
        ctx.beginPath();
        ctx.moveTo(point.x + Math.cos(angle - 0.16) * inner, point.y + Math.sin(angle - 0.16) * inner);
        ctx.lineTo(point.x + Math.cos(angle) * outer, point.y + Math.sin(angle) * outer);
        ctx.stroke();
      }

      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 4;
      for (let i = 0; i < 4; i++) {
        const angle = effect.rotation + Math.PI / 4 + i * Math.PI / 2;
        const tx = point.x + Math.cos(angle) * radius * 0.72;
        const ty = point.y + Math.sin(angle) * radius * 0.72;
        ctx.beginPath();
        ctx.moveTo(point.x + Math.cos(angle) * 36, point.y + Math.sin(angle) * 36);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(tx, ty, 10 + age * 10, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (effect.type === "regen-rain") {
      ctx.strokeStyle = "rgba(124,255,196,0.92)";
      ctx.lineWidth = 4;
      ctx.setLineDash([22, 14]);
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius * (0.96 + age * 0.08), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = alpha * 0.14;
      ctx.fillStyle = "#7cffc4";
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = alpha;
      for (let i = 0; i < 16; i++) {
        const angle = i * 2.1 + effect.rotation;
        const spread = (i % 4) * radius * 0.18 + radius * 0.22;
        drawPlusMark(point.x + Math.cos(angle) * spread, point.y + Math.sin(angle) * spread + age * 26, 5, effect.color);
      }
    } else if (effect.type === "impact-grid" || effect.type === "artillery") {
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 3;
      const size = radius * (0.48 + age * 0.28);
      ctx.globalAlpha = alpha * 0.2;
      ctx.fillStyle = effect.color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius * (0.86 + age * 0.1), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = alpha;
      ctx.setLineDash([14, 8]);
      ctx.lineWidth = effect.type === "artillery" ? 5 : 4;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius * (0.92 + age * 0.12), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.lineWidth = 3;
      ctx.strokeRect(point.x - size / 2, point.y - size / 2, size, size);
      ctx.beginPath();
      ctx.moveTo(point.x - size * 0.68, point.y);
      ctx.lineTo(point.x + size * 0.68, point.y);
      ctx.moveTo(point.x, point.y - size * 0.68);
      ctx.lineTo(point.x, point.y + size * 0.68);
      ctx.stroke();
      if (effect.type === "artillery") {
        for (let i = 0; i < 4; i++) ctx.strokeRect(point.x - size * (0.25 + i * 0.18), point.y - size * (0.25 + i * 0.18), size * (0.5 + i * 0.36), size * (0.5 + i * 0.36));
      }
    } else if (effect.type === "meteor-strike") {
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 5;
      for (let i = 0; i < 5; i++) {
        const x = point.x - radius * 0.55 + i * radius * 0.28;
        ctx.beginPath();
        ctx.moveTo(x - 38, point.y - radius * (1.4 + age));
        ctx.lineTo(x + 8, point.y + radius * 0.35);
        ctx.stroke();
      }
      ctx.globalAlpha = alpha * 0.22;
      ctx.fillStyle = effect.color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius * (0.65 + age * 0.3), 0, Math.PI * 2);
      ctx.fill();
    } else if (effect.type === "seed-awaken" || effect.type === "zero-break" || effect.type === "energy-core") {
      const spokes = effect.type === "seed-awaken" ? 8 : 6;
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = effect.type === "energy-core" ? 4 : 5;
      ctx.beginPath();
      ctx.arc(point.x, point.y - 6, radius * (0.78 + age * 0.12), 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < spokes; i++) {
        const angle = effect.rotation + i * Math.PI * 2 / spokes + age * 1.2;
        ctx.beginPath();
        ctx.moveTo(point.x + Math.cos(angle) * radius * 0.28, point.y - 6 + Math.sin(angle) * radius * 0.28);
        ctx.lineTo(point.x + Math.cos(angle) * radius * 0.82, point.y - 6 + Math.sin(angle) * radius * 0.82);
        ctx.stroke();
      }
    } else if (effect.type === "genesis-wave" || effect.type === "positron-cannon") {
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = effect.type === "positron-cannon" ? 11 : 8;
      ctx.globalAlpha = alpha * 0.76;
      const beams = effect.type === "positron-cannon" ? 7 : 5;
      for (let i = 0; i < beams; i++) {
        const y = H * (i / (beams - 1)) + Math.sin(now() * 4 + i) * 12;
        ctx.beginPath();
        ctx.moveTo(-80, y - age * 80);
        ctx.lineTo(W + 80, y + age * 40);
        ctx.stroke();
      }
      ctx.globalAlpha = alpha * 0.1;
      ctx.fillStyle = effect.color;
      ctx.fillRect(0, 0, W, H);
    } else if (effect.type === "jam" || effect.type === "cloak" || effect.type === "jam-aura" || effect.type === "mirage-domain") {
      const persistent = effect.type === "jam-aura" || effect.type === "mirage-domain";
      const pulse = 0.72 + Math.sin(now() * 5.6 + effect.rotation) * 0.18;
      ctx.globalAlpha = persistent ? pulse : alpha;
      ctx.strokeStyle = effect.type === "cloak" ? "#7cffc4" : effect.color;
      ctx.lineWidth = effect.type === "mirage-domain" ? 5 : 3;
      ctx.setLineDash(effect.type === "mirage-domain" ? [18, 12] : [10, 8]);
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius * (0.96 + Math.sin(now() * 3.2) * 0.02), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = persistent ? 0.12 : alpha * 0.14;
      ctx.fillStyle = effect.color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = effect.color;
      for (let i = 0; i < 12; i++) {
        const angle = i * 1.73 + effect.rotation;
        const spread = radius * (0.18 + (i % 5) * 0.12);
        const w = 14 + (i % 3) * 10;
        const h = 4 + (i % 4) * 3;
        ctx.globalAlpha = (persistent ? pulse : alpha) * (effect.type === "cloak" ? 0.34 : 0.58);
        ctx.fillRect(point.x + Math.cos(angle) * spread, point.y + Math.sin(angle) * spread, w, h);
      }
    } else if (effect.type === "gn-cast") {
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 4;
      for (let i = 0; i < 6; i++) {
        const angle = effect.rotation + i * Math.PI / 3;
        ctx.save();
        ctx.translate(point.x + Math.cos(angle) * radius * 0.42, point.y + Math.sin(angle) * radius * 0.42);
        ctx.rotate(angle + Math.PI / 6);
        tracePolygon(0, 0, 28 + age * 12, 6);
        ctx.stroke();
        ctx.restore();
      }
    } else if (effect.type === "gravity-cast") {
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 4;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        for (let j = 0; j < 36; j++) {
          const t = j / 35;
          const angle = effect.rotation + i * 2.1 + t * 5.4 + age * 2.8;
          const r = 18 + t * radius * 0.45;
          const x = point.x + Math.cos(angle) * r;
          const y = point.y + Math.sin(angle) * r;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
    ctx.restore();
  });
}

function drawSupportAuras() {
  gravityFields.forEach((field) => {
    const alpha = clamp(field.life / field.maxLife, 0, 1);
    ctx.save();
    ctx.globalAlpha = 0.18 + alpha * 0.26;
    ctx.shadowColor = field.color;
    ctx.shadowBlur = 28;
    ctx.globalAlpha = 0.08 + alpha * 0.12;
    ctx.fillStyle = field.color;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      for (let j = 0; j < 44; j++) {
        const t = j / 43;
        const angle = i * 1.257 + t * 6.2 + now() * 1.9;
        const r = 14 + t * field.radius;
        const x = field.x + Math.cos(angle) * r;
        const y = field.y + Math.sin(angle) * r;
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(field.x, field.y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 0.55 + alpha * 0.25;
    ctx.strokeStyle = "rgba(220,255,255,0.86)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      for (let j = 0; j < 38; j++) {
        const t = j / 37;
        const angle = field.life * 2.4 + i * 2.1 + t * 5.6;
        const r = 18 + t * field.radius * 0.62;
        const x = field.x + Math.cos(angle) * r;
        const y = field.y + Math.sin(angle) * r;
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  });

  squad.forEach((unit) => {
    if (unit.hp <= 0) return;
    if (unit.himawariStatus) {
      const status = unit.himawariStatus;
      const alpha = clamp(status.life / status.maxLife, 0.22, 0.82);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = status.color;
      ctx.shadowBlur = 18;
      ctx.strokeStyle = status.color;
      ctx.lineWidth = status.buff ? 4 : 3;
      ctx.setLineDash(status.buff ? [] : [8, 7]);
      ctx.beginPath();
      ctx.arc(unit.x, unit.y - 12, 70 + Math.sin(now() * 9) * 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = status.color;
      ctx.font = "900 24px Impact, 'Microsoft JhengHei', sans-serif";
      ctx.textAlign = "center";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(5,8,14,0.82)";
      ctx.strokeText(status.shortLabel || (status.buff ? "+" : "-"), unit.x, unit.y - 88);
      ctx.fillText(status.shortLabel || (status.buff ? "+" : "-"), unit.x, unit.y - 88);
      ctx.restore();
    }
    if (unit.name === "Asterion" && unit.guardianRegenTime > 0) {
      const alpha = clamp(unit.guardianRegenTime / (unit.guardianRegenDuration || 5), 0.24, 0.68);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "rgba(124,255,196,0.82)";
      ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.translate(unit.x, unit.y - 8);
        ctx.rotate(i * Math.PI / 2 + now() * 0.8);
        ctx.strokeRect(48, -12, 26, 24);
        ctx.restore();
      }
      for (let i = 0; i < 4; i++) drawPlusMark(unit.x - 27 + i * 18, unit.y - 70 + Math.sin(now() * 4 + i) * 4, 4, "#7cffc4");
      ctx.restore();
    }

    if (unit.name === "MEGA(EK專用機)" && unit.ekAuraActive) {
      const radius = unit.ekAuraRange || 235;
      ctx.save();
      ctx.globalAlpha = 0.58 + Math.sin(now() * 5) * 0.08;
      ctx.shadowColor = "#48a8ff";
      ctx.shadowBlur = 22;
      ctx.strokeStyle = "rgba(72,168,255,0.9)";
      ctx.lineWidth = 4;
      ctx.setLineDash([18, 12]);
      ctx.beginPath();
      ctx.arc(unit.x, unit.y, radius + Math.sin(now() * 7) * 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = "#48a8ff";
      ctx.beginPath();
      ctx.arc(unit.x, unit.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.78;
      ctx.lineWidth = 2;
      for (let i = 0; i < 10; i++) {
        const angle = now() * 0.8 + i * Math.PI * 0.2;
        ctx.beginPath();
        ctx.moveTo(unit.x + Math.cos(angle) * radius * 0.92, unit.y + Math.sin(angle) * radius * 0.92);
        ctx.lineTo(unit.x + Math.cos(angle) * radius * 0.62, unit.y + Math.sin(angle) * radius * 0.62);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (unit.name === "Valkyr" && unit.gnFieldTime > 0) {
      const radius = unit.gnFieldRadius || 170;
      const alpha = clamp(unit.gnFieldTime / (unit.gnFieldDuration || 5.5), 0.24, 0.74);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = "#8bd7ff";
      ctx.shadowBlur = 24;
      ctx.strokeStyle = "rgba(139,215,255,0.9)";
      ctx.lineWidth = 5;
      tracePolygon(unit.x, unit.y, radius + Math.sin(now() * 10) * 6, 6);
      ctx.stroke();
      ctx.globalAlpha = alpha * 0.16;
      ctx.fillStyle = "#8bd7ff";
      tracePolygon(unit.x, unit.y, radius, 6);
      ctx.fill();
      ctx.globalAlpha = alpha * 0.82;
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const angle = -Math.PI / 2 + i * Math.PI / 3;
        ctx.beginPath();
        ctx.moveTo(unit.x + Math.cos(angle) * 56, unit.y + Math.sin(angle) * 56);
        ctx.lineTo(unit.x + Math.cos(angle) * radius, unit.y + Math.sin(angle) * radius);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (unit.name === "Helix" && unit.regenAuraTime > 0) {
      const radius = unit.regenRadius || 260;
      const alpha = clamp(unit.regenAuraTime / (unit.regenDuration || 6), 0.22, 0.72);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = "#7cffc4";
      ctx.shadowBlur = 16;
      ctx.strokeStyle = "rgba(124,255,196,0.9)";
      ctx.lineWidth = 4;
      ctx.setLineDash([26, 14]);
      ctx.beginPath();
      ctx.arc(unit.x, unit.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = alpha * 0.18;
      ctx.fillStyle = "#7cffc4";
      ctx.beginPath();
      ctx.arc(unit.x, unit.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = alpha * 0.74;
      ctx.strokeStyle = "rgba(220,255,235,0.62)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(unit.x, unit.y, radius * 0.64 + Math.sin(now() * 3.4) * 7, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const angle = i * 2.1 + now() * 0.35;
        const spread = radius * (0.2 + (i % 5) * 0.13);
        drawPlusMark(unit.x + Math.cos(angle) * spread, unit.y + Math.sin(angle) * spread, 5 + (i % 3), "#7cffc4");
      }
      ctx.globalAlpha = alpha * 0.1;
      ctx.fillStyle = "#7cffc4";
      for (let i = 0; i < 5; i++) {
        const y = unit.y - radius * 0.45 + i * radius * 0.22 + Math.sin(now() * 2 + i) * 7;
        ctx.fillRect(unit.x - radius * 0.58, y, radius * 1.16, 8);
      }
      ctx.restore();
    }

    if (unit.stealthTime > 0) {
      ctx.save();
      ctx.globalAlpha = 0.48 + Math.sin(now() * 10) * 0.12;
      ctx.strokeStyle = "rgba(124,255,196,0.9)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 7; i++) {
        const x = unit.x - 48 + i * 16 + Math.sin(now() * 6 + i) * 5;
        ctx.beginPath();
        ctx.moveTo(x, unit.y - 62);
        ctx.lineTo(x + Math.sin(now() * 4 + i) * 8, unit.y + 42);
        ctx.stroke();
      }
      ctx.restore();
    }
  });
}

function render() {
  drawBackground();
  drawSupportAuras();
  enemies.forEach(drawEnemy);
  squad.filter((unit) => unit.hp <= 0).forEach(drawMech);
  squad.filter((unit) => unit.hp > 0).forEach(drawMech);
  drawSkillEffects();
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

function showLoading(message) {
  if (loadingCopyEl && message) loadingCopyEl.textContent = message;
  if (loadingEl) loadingEl.hidden = false;
}

function hideLoading() {
  if (loadingEl) loadingEl.hidden = true;
}

function loadImageAsset(path) {
  if (!path) return Promise.resolve(null);
  const src = assetSrc(path);
  let img = art.get(path);
  if (img?.complete && img.naturalWidth > 0 && img.src.endsWith(src)) return Promise.resolve(img);
  if (artLoadPromises.has(path)) return artLoadPromises.get(path);

  if (!img) {
    img = new Image();
    img.decoding = "async";
    art.set(path, img);
  }

  const promise = new Promise((resolve) => {
    let settled = false;
    const finish = async () => {
      if (settled) return;
      settled = true;
      try {
        if (img.decode) {
          await Promise.race([
            img.decode(),
            new Promise((decodeResolve) => setTimeout(decodeResolve, 1200))
          ]);
        }
      } catch {
        // Decoding failure should not trap the player on the loading overlay.
      }
      resolve(img);
    };
    img.onload = finish;
    img.onerror = finish;
    img.src = src;
    if (img.complete) finish();
    setTimeout(finish, IMAGE_LOAD_TIMEOUT_MS);
  });
  artLoadPromises.set(path, promise);
  return promise;
}

function preloadArt(paths) {
  return Promise.all([...paths].map(loadImageAsset));
}

function loadFormationArt() {
  const paths = new Set();
  paths.add(battlefieldArt);
  squadSeeds.forEach((unit) => {
    paths.add(unit.art);
    if (unit.sprite) paths.add(unit.sprite);
  });
  Object.values(enemyTypes).forEach((unit) => paths.add(unit.art));
  return preloadArt(paths);
}

function loadBattleArt() {
  const paths = new Set([battlefieldArt]);
  selectedSquadSeeds().forEach((unit) => {
    if (unit.sprite) paths.add(unit.sprite);
    if (unit.sheet) paths.add(unit.sheet);
    if (unit.activeIcon) paths.add(unit.activeIcon);
    if (unit.ultimateIcon) paths.add(unit.ultimateIcon);
  });
  Object.values(enemyTypes).forEach((unit) => {
    if (unit.sprite) paths.add(unit.sprite);
    if (unit.sheet) paths.add(unit.sheet);
  });
  return preloadArt(paths);
}

function loadRewardArt(rewards) {
  return preloadArt(new Set(rewards.map((reward) => reward.icon)));
}

function loadAllRewardArt() {
  return preloadArt(new Set(upgradePool.map((reward) => reward.icon)));
}

function warmGameArt() {
  loadFormationArt()
    .then(() => loadBattleArt())
    .then(() => loadAllRewardArt());
}

function hydrateDeferredImages(root = document) {
  const images = [...root.querySelectorAll("img[data-src]")];
  return Promise.all(images.map((img) => new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve(img);
    };
    if (img.getAttribute("src") && img.complete) {
      finish();
      return;
    }
    img.onload = finish;
    img.onerror = finish;
    img.src = img.dataset.src;
    if (img.complete) finish();
    setTimeout(finish, IMAGE_LOAD_TIMEOUT_MS);
  })));
}

canvas.addEventListener("pointerdown", (event) => {
  if (!running || paused) return;
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
  if (!running || paused || !selected) return;
  pointer = canvasPoint(event);
});

canvas.addEventListener("pointerup", (event) => {
  if (!running || paused || !selected) return;
  issueCommand(selected, canvasPoint(event));
  selected = null;
  pointer = null;
});

canvas.addEventListener("dblclick", (event) => {
  if (!running || paused) return;
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
  if (!running || paused) return;
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

aceUnitListEl?.addEventListener("click", (event) => {
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

leaderboardFormEl.addEventListener("submit", submitLeaderboard);

pauseToggleEl.addEventListener("click", togglePause);

pauseResumeEl.addEventListener("click", () => {
  setPaused(false);
});

pauseFormationEl.addEventListener("click", () => {
  showFormation();
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

window.addEventListener("keydown", (event) => {
  const tag = event.target?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || event.isComposing) return;
  if (event.key === "Escape" || event.key.toLocaleLowerCase() === "p") {
    event.preventDefault();
    togglePause();
  }
});

window.addEventListener("resize", resizeCanvas);
window.addEventListener("load", () => {
  setTimeout(() => {
    warmGameArt();
  }, 500);
}, { once: true });
initStars();
resizeCanvas();
loadLeaderboard();
render();
frame();
