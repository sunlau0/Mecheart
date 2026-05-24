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
const formationHomeEl = document.getElementById("formation-home");
const resultEl = document.getElementById("result");
const resultTitleEl = document.getElementById("result-title");
const resultCopyEl = document.getElementById("result-copy");
const arenaResultEl = document.getElementById("arena-result");
const arenaResultTitleEl = document.getElementById("arena-result-title");
const arenaResultCopyEl = document.getElementById("arena-result-copy");
const arenaResultRematchEl = document.getElementById("arena-result-rematch");
const arenaResultBackEl = document.getElementById("arena-result-back");
const arenaResultHomeEl = document.getElementById("arena-result-home");
const rewardEl = document.getElementById("reward");
const rewardOptionsEl = document.getElementById("reward-options");
const rewardHomeEl = document.getElementById("reward-home");
const intelEl = document.getElementById("intel");
const databaseListEl = document.getElementById("database-list");
const skillButtonsEl = document.getElementById("skill-buttons");
const autoBattleToggleEl = document.getElementById("auto-battle-toggle");
const battleControlsEl = document.getElementById("battle-controls");
const leaderboardEl = document.getElementById("leaderboard");
const leaderboardFormEl = document.getElementById("leaderboard-form");
const leaderboardListEl = document.getElementById("leaderboard-list");
const leaderboardMessageEl = document.getElementById("leaderboard-message");
const playerNameEl = document.getElementById("player-name");
const titleLeaderboardListEl = document.getElementById("title-leaderboard-list");
const titleLeaderboardMessageEl = document.getElementById("title-leaderboard-message");
const titleMasterLeaderboardListEl = document.getElementById("title-master-leaderboard-list");
const arenaMasterLeaderboardListEl = document.getElementById("arena-master-leaderboard-list");
const arenaMasterLeaderboardMessageEl = document.getElementById("arena-master-leaderboard-message");
const pauseToggleEl = document.getElementById("pause-toggle");
const pauseOverlayEl = document.getElementById("pause-overlay");
const pauseCopyEl = document.querySelector("[data-i18n='pauseCopy']");
const pauseResumeEl = document.getElementById("pause-resume");
const pauseHomeEl = document.getElementById("pause-home");
const pauseFormationEl = document.getElementById("pause-formation");
const loadingEl = document.getElementById("loading-overlay");
const loadingCopyEl = document.getElementById("loading-copy");
const languageToggleEl = document.getElementById("language-toggle");
const arenaBtnEl = document.getElementById("arena-btn");
const arenaNameModalEl = document.getElementById("arena-name-modal");
const arenaNameInputEl = document.getElementById("arena-name-input");
const arenaNameConfirmEl = document.getElementById("arena-name-confirm");
const arenaNameCancelEl = document.getElementById("arena-name-cancel");
const arenaEl = document.getElementById("arena");
const arenaBackEl = document.getElementById("arena-back");
const arenaSaveEl = document.getElementById("arena-save");
const arenaRefreshEl = document.getElementById("arena-refresh");
const arenaCostEl = document.getElementById("arena-cost");
const arenaCoreListEl = document.getElementById("arena-core-list");
const arenaUnitListEl = document.getElementById("arena-unit-list");
const arenaPositionGridEl = document.getElementById("arena-position-grid");
const arenaOpponentListEl = document.getElementById("arena-opponent-list");
const pilotNameLabelEl = document.getElementById("pilot-name-label");
const pilotNameInputEl = document.getElementById("pilot-name-input");
const pilotSaveNameEl = document.getElementById("pilot-save-name");
const pilotRecoverEl = document.getElementById("pilot-recover");
const pilotSyncMessageEl = document.getElementById("pilot-sync-message");
const pilotCodeDisplayEl = document.getElementById("pilot-code-display");

const W = 1280;
const H = 720;
const ALLIED_MIN_X = 72;
const ALLIED_MAX_X = W - 72;
const ALLIED_MIN_Y = 72;
const ALLIED_MAX_Y = H - 132;
const AUTO_CHASE_MAX_X = W * 0.75;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const weaponDistance = (attacker, target) => Math.max(0, dist(attacker, target) - (target.faction === "Enemy" ? (target.radius || 0) * 0.72 : bodyRadius(target) * 0.35));
const now = () => performance.now() / 1000;
const battlefieldArt = "assets/battlefield-bg.webp";
const arenaBattlefieldArt = "assets/arena-bg.webp";
const BACKDROP_VERSION = 27;
const UNIT_ART_VERSION = 48;
const REWARD_ICON_VERSION = 39;
const SKILL_ICON_VERSION = 48;
const ARENA_ICON_VERSION = 1;
const IMAGE_LOAD_TIMEOUT_MS = 3000;
const REWARD_TIER_WEIGHTS = { common: 0.68, rare: 0.29, ultra: 0.03 };
const REWARD_ULTRA_PITY_LIMIT = 8;
const assetVersion = (path) => {
  if (path.includes("battlefield-bg")) return BACKDROP_VERSION;
  if (path.includes("arena-bg")) return BACKDROP_VERSION;
  if (path.includes("arena-icon-")) return ARENA_ICON_VERSION;
  if (path.includes("skill-")) return SKILL_ICON_VERSION;
  if (path.includes("upgrade-")) return REWARD_ICON_VERSION;
  return UNIT_ART_VERSION;
};
const assetSrc = (path, version = assetVersion(path)) => `${path}?v=${version}`;
const LOCALE_KEY = "mecha-heart-language";
const AUTO_BATTLE_KEY = "mecha-heart-auto-battle";
const PILOT_PROFILE_KEY = "mecha-heart-pilot-profile";
const MASTER_LEAGUE_RANKINGS_KEY = "mecha-heart-master-league-rankings";
const MASTER_LEAGUE_CHAMPIONS_KEY = "mecha-heart-master-league-champions";
const ARENA_TOTAL_COST = 1000;
const ARENA_CORE_COST = 300;
const ARENA_TIME_LIMIT = 90;
const uiText = {
  zh: {
    canvasLabel: "宇宙心戰隊戰場",
    pauseKicker: "Tactical Pause",
    pauseTitle: "遊戲已暫停",
    pauseCopy: "戰場時間已停止。可以繼續作戰，或者返回編隊重新整備。",
    arenaPauseCopy: "戰場時間已停止。可以繼續作戰。",
    pauseResume: "繼續作戰",
    pauseFormation: "回編隊",
    backMain: "回主畫面",
    titleKicker: "機動兵器戰線指揮",
    titleSubtitle: "軌道戰場 Roguelike 小隊指揮",
    startBattle: "挑戰模式",
    masterLeague: "大師聯盟",
    aceRanking: "王牌排行榜",
    formationKicker: "出擊前整備",
    formationTitle: "隊伍編成",
    formationCopy: "選擇 4 架機體出戰。點擊機體可查看武裝、定位、主動技和必殺技。",
    launchMission: "開始地圖",
    tutorialAlt: "新手操作教學：揀機、拖線移動、指向目標、放技能",
    tutorialTitle: "新手教學",
    tutorialCopy1: "先編成 4 架機體。入場後拖拉機體落地圖下令，拖到敵人會攻擊，拖到友軍會補血或協助集火。",
    tutorialCopy2: "下方每架機都有主動技和必殺；必殺能量滿後按右邊技能制發動。",
    aceCustomTitle: "皇牌機師專機",
    aceCustomCopy: "預留俾日後加入嘅個人化專用機。呢類機體會有獨立定位、專屬技能同更鮮明嘅機師風格。",
    databaseTitle: "機體設計資料庫",
    playerDesigns: "玩家機體設計",
    enemyDesigns: "敵方機體設計",
    bossDefeated: "Boss 擊破",
    chooseUpgrade: "選擇一項強化",
    ranking: "排行榜",
    enterName: "輸入姓名",
    submitScore: "提交分數",
    redeploy: "再次出擊",
    hudKicker: "戰術艦橋介面",
    hudTitle: "小隊狀態",
    wave: "回合",
    score: "分數",
    bestScore: "最高記錄",
    hostiles: "敵機",
    command: "指令",
    idle: "待命",
    allied: "友軍",
    enemy: "敵軍",
    selected: "已選",
    emptySlot: "待選機體",
    range: "射程",
    durability: "耐久",
    active: "主動",
    ultimate: "必殺",
    weapon: "武器",
    activeSkill: "主動技",
    ultimateSkill: "必殺技",
    trait: "特性",
    tactic: "用法",
    noSkill: "沒有",
    useSkillBar: "由下方技能列使用。",
    tacticalIntel: "戰術情報",
    playerUnits: "玩家機體",
    enemyUnits: "敵方機體",
    unknown: "不明",
    remove: "移除",
    add: "加入",
    seconds: "秒",
    activeOn: "啟動中",
    finalScore: "最終分數",
    reachedWave: "抵達第 {wave} 回合",
    missionClear: "作戰完成",
    missionEnd: "作戰結束",
    fleetSafe: "艦隊防線仍然健在。",
    retreat: "機體已撤退，重新整備後再出擊。",
    boundary: "自動追擊邊界"
  },
  en: {
    canvasLabel: "Mecha Heart battlefield",
    pauseKicker: "Tactical Pause",
    pauseTitle: "Game Paused",
    pauseCopy: "Battle time is frozen. Resume the mission or return to loadout for a quick rebuild.",
    arenaPauseCopy: "Battle time is frozen. Resume the mission when ready.",
    pauseResume: "Resume Mission",
    pauseFormation: "Back to Loadout",
    backMain: "Main Menu",
    titleKicker: "Mobile Weapon Frontline Command",
    titleSubtitle: "Orbital roguelike squad command",
    startBattle: "Challenge Mode",
    masterLeague: "Master League",
    aceRanking: "Ace Leaderboard",
    formationKicker: "Pre-Launch Prep",
    formationTitle: "Squad Loadout",
    formationCopy: "Choose 4 mecha for deployment. Tap a unit to inspect weapons, role, active skill and ultimate.",
    launchMission: "Launch Mission",
    tutorialAlt: "Controls tutorial: pick mecha, drag to move, target enemies, trigger skills",
    tutorialTitle: "Quick Training",
    tutorialCopy1: "Build a 4-mecha squad first. In battle, drag a unit onto the map to command it. Drag onto hostiles to attack, or onto allies to heal or focus fire.",
    tutorialCopy2: "Each unit has an active skill and an ultimate below. When ultimate charge is full, hit the right-hand skill button.",
    aceCustomTitle: "Ace Pilot Customs",
    aceCustomCopy: "Reserved for future personalised ace machines. These units get their own role, exclusive skills and much louder pilot energy.",
    databaseTitle: "Mecha Design Archive",
    playerDesigns: "Player Mecha Designs",
    enemyDesigns: "Hostile Mecha Designs",
    bossDefeated: "Boss Down",
    chooseUpgrade: "Choose an Upgrade",
    ranking: "Leaderboard",
    enterName: "Enter Name",
    submitScore: "Submit Score",
    redeploy: "Redeploy",
    hudKicker: "Tactical Bridge Interface",
    hudTitle: "Squad Status",
    wave: "Wave",
    score: "Score",
    bestScore: "Best Score",
    hostiles: "Hostiles",
    command: "Command",
    idle: "Standby",
    allied: "Allied",
    enemy: "Hostile",
    selected: "Selected",
    emptySlot: "Empty Slot",
    range: "Range",
    durability: "Armour",
    active: "Active",
    ultimate: "Ultimate",
    weapon: "Weapon",
    activeSkill: "Active",
    ultimateSkill: "Ultimate",
    trait: "Trait",
    tactic: "Tactic",
    noSkill: "None",
    useSkillBar: "Use it from the skill bar below.",
    tacticalIntel: "Tactical Intel",
    playerUnits: "Player Mecha",
    enemyUnits: "Hostile Mecha",
    unknown: "Unknown",
    remove: "Remove",
    add: "Add",
    seconds: "s",
    activeOn: "Online",
    finalScore: "Final Score",
    reachedWave: "Reached Wave {wave}",
    missionClear: "Mission Clear",
    missionEnd: "Mission Over",
    fleetSafe: "The fleet line is still standing.",
    retreat: "Units have withdrawn. Rebuild, reload, redeploy.",
    boundary: "Auto-Chase Boundary"
  }
};
let currentLanguage = localStorage.getItem(LOCALE_KEY) === "en" ? "en" : "zh";
const t = (key, replacements = {}) => {
  const value = uiText[currentLanguage]?.[key] ?? uiText.zh[key] ?? key;
  return Object.entries(replacements).reduce((text, [name, replacement]) => text.replace(`{${name}}`, replacement), value);
};
const labelFaction = (faction) => faction === "Allied" ? t("allied") : t("enemy");
const leaderboardDefaults = [
  { name: "Sun", score: 99230 },
  { name: "Candy", score: 86000 },
  { name: "Hayden", score: 85800 },
  { name: "Jeanis", score: 60080 }
];
const masterLeagueDefaults = [
  { name: "Sun2", score: 0, bandId: "bronze", team: ["Asterion", "Caliburn", "Seraphim", "Orion"] },
  { name: "Candy", score: 0, bandId: "bronze", team: ["Nova", "Caliburn", "Mirage", "Helix"] },
  { name: "Hayden", score: 0, bandId: "bronze", team: ["Valkyr", "Asterion", "Seraphim", "Lancer"] }
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
let autoBattleEnabled = false;
let autoRewardTimer = 0;
const defaultSquadNames = ["Asterion", "Caliburn", "Seraphim", "Orion"];
let selectedSquadNames = [...defaultSquadNames];
let formationFocusName = "Asterion";
let battleMode = "campaign";
let arenaTimeLeft = ARENA_TIME_LIMIT;
let arenaOpponent = null;
let arenaOpponents = [];
let arenaMasterChampions = loadLocalMasterChampions();
let masterLeagueRankings = [...masterLeagueDefaults];
let arenaSelectedOpponent = null;
let arenaDifficulty = "normal";
let arenaSelectedCore = "iron-wall";
let arenaSelectedUnitName = defaultSquadNames[0];
let arenaDefenseNames = [...defaultSquadNames];
let arenaModules = {};
let arenaAi = {};
let arenaPositions = {};
let arenaSyncing = false;
let pilotProfile = loadPilotProfile();
let pilotRecoveryCode = "";
let pilotCloudReady = false;
let masterLeagueRun = null;
let masterLeagueSearching = false;
let masterLeagueSearchTimer = 0;
let arenaBattleStartHp = 1;
let lastDefeatedChampionBandId = "";
const squadSlots = [
  { x: 210, y: 165 },
  { x: 290, y: 290 },
  { x: 195, y: 415 },
  { x: 355, y: 450 }
];
const arenaPositionSlots = [
  { col: 0, row: 0, x: W - 255, y: 170 },
  { col: 1, row: 0, x: W - 170, y: 170 },
  { col: 2, row: 0, x: W - 85, y: 170 },
  { col: 0, row: 1, x: W - 255, y: 300 },
  { col: 1, row: 1, x: W - 170, y: 300 },
  { col: 2, row: 1, x: W - 85, y: 300 },
  { col: 0, row: 2, x: W - 255, y: 430 },
  { col: 1, row: 2, x: W - 170, y: 430 },
  { col: 2, row: 2, x: W - 85, y: 430 }
];
const arenaDefaultPositions = {
  Asterion: 3,
  Caliburn: 4,
  Seraphim: 7,
  Orion: 1
};
const arenaCoreOptions = [
  { id: "iron-wall", name: "鐵壁核心", cost: ARENA_CORE_COST, text: "全隊 HP +10%，移速 -6%。", apply: (unit) => { unit.maxHp = Math.round(unit.maxHp * 1.1); unit.hp = unit.maxHp; unit.speed *= 0.94; } },
  { id: "rush-core", name: "速攻核心", cost: ARENA_CORE_COST, text: "開場 15 秒傷害 +18%，之後傷害 -6%。", apply: (unit) => { unit.arenaRushTime = 15; unit.arenaLateDamagePenalty = 0.94; } },
  { id: "ewar-core", name: "電戰核心", cost: ARENA_CORE_COST, text: "開戰即釋放干擾波：敵方全隊主動技冷卻 +3 秒，移速 -20% 持續 3 秒。", apply: (unit) => { unit.arenaOpeningEwar = true; } },
  { id: "repair-core", name: "維修核心", cost: ARENA_CORE_COST, text: "每架機低血自動回復一次，但傷害 -6%。", apply: (unit) => { unit.arenaEmergencyRepair = true; unit.damage *= unit.damage > 0 ? 0.94 : 1.08; } },
  { id: "sniper-core", name: "狙擊核心", cost: ARENA_CORE_COST, text: "遠程機傷害 +15%，近戰機防禦稍弱。", apply: (unit) => { if (unit.range >= 260) unit.damage *= 1.15; else unit.arenaDefenseTaken = 1.08; } }
];
const arenaModuleOptions = [
  { id: "opening-shield", tier: "C", cost: 80, name: "開場護盾", text: "開場獲得 5 秒護盾。", apply: (unit) => { unit.shield = Math.max(unit.shield || 0, 5); } },
  { id: "range-tune", tier: "C", cost: 80, name: "射控微調", text: "普攻射程 +8%。", apply: (unit) => { unit.range *= 1.08; } },
  { id: "cooldown-tune", tier: "UC", cost: 120, name: "冷卻調律", text: "主動技冷卻 -12%。", apply: (unit) => { unit.skillCooldownMultiplier = (unit.skillCooldownMultiplier || 1) * 0.88; } },
  { id: "armor-weave", tier: "UC", cost: 120, name: "複合裝甲", text: "受到傷害 -8%，移速 -4%。", apply: (unit) => { unit.arenaDefenseTaken = (unit.arenaDefenseTaken || 1) * 0.92; unit.speed *= 0.96; } },
  { id: "focus-lens", tier: "R", cost: 180, name: "集火透鏡", text: "攻擊同一目標時傷害逐步提高。", apply: (unit) => { unit.arenaFocusLens = true; } },
  { id: "first-ult", tier: "R", cost: 180, name: "預充能核心", text: "開場大絕充能 +35%。", apply: (unit) => { unit.ultCharge = Math.max(unit.ultCharge || 0, 35); } },
  { id: "duel-reactor", tier: "UR", cost: 260, name: "決鬥反應爐", text: "傷害 +22%，最大 HP -10%。", apply: (unit) => { unit.damage *= unit.damage > 0 ? 1.22 : 1; unit.maxHp = Math.round(unit.maxHp * 0.9); unit.hp = Math.min(unit.hp, unit.maxHp); } },
  { id: "guardian-loop", tier: "UR", cost: 260, name: "守護循環", text: "首次瀕死時保留 1 HP 並獲得護盾。", apply: (unit) => { unit.arenaLastStand = true; } }
];
const arenaAiOptions = [
  { id: "frontline", name: "前壓", text: "主動搶前，吸引距離最近的敵機並壓迫中線。" },
  { id: "protect", name: "保後排", text: "優先處理接近後排和支援機的敵人，站位較保守。" },
  { id: "focus", name: "集火", text: "跟隨隊友目標，優先擊破低血或被鎖定敵機。" },
  { id: "anti-assault", name: "反刺客", text: "優先攻擊高速突入機，保護狙擊和維修單位。" },
  { id: "survive", name: "保命", text: "低血時後撤，等待支援或冷卻回復。" }
];
const masterLeagueAiOptions = [
  { id: "focus-tank", name: "集火坦克", text: "優先攻擊高耐久前排，盡快拆走坦線。", enName: "Focus Tanks", enText: "Prioritise durable frontline units and break the enemy tank line first." },
  { id: "focus-attacker", name: "集火攻手", text: "優先攻擊輸出機，降低對方火力。", enName: "Focus Attackers", enText: "Prioritise damage dealers to reduce incoming firepower." },
  { id: "focus-healer", name: "集火補師", text: "優先攻擊修復與支援機，切斷續航。", enName: "Focus Healers", enText: "Prioritise repair and support units to cut off sustain." },
  { id: "guard-healer", name: "保補", text: "靠近補師，優先攔截威脅補師的敵機。", enName: "Guard Healers", enText: "Stay near healers and intercept enemies threatening support units." },
  { id: "guard-attacker", name: "保攻手", text: "靠近主要輸出，優先處理壓近攻手的敵機。", enName: "Guard Attackers", enText: "Cover main damage dealers and punish enemies pushing into them." },
  { id: "guard-tank", name: "保坦", text: "靠近坦機，幫前排分擔壓力。", enName: "Guard Tanks", enText: "Stay close to tanks and help the frontline absorb pressure." },
  { id: "frontline", name: "前壓", text: "主動推前，優先咬住最近敵機。", enName: "Press Forward", enText: "Push forward aggressively and engage the nearest enemy first." },
  { id: "skirmish", name: "遊擊", text: "保持距離打低血目標，避免長時間貼身硬拼。", enName: "Skirmish", enText: "Keep distance, pick off low-HP targets, and avoid extended close combat." }
];
const arenaAiAliases = {
  focus: "focus-attacker",
  protect: "guard-healer",
  "anti-assault": "focus-attacker",
  survive: "skirmish"
};
const arenaCoreIcons = {
  "iron-wall": "assets/arena-icon-iron-wall.webp",
  "rush-core": "assets/arena-icon-rush-core.webp",
  "ewar-core": "assets/arena-icon-ewar-core.webp",
  "repair-core": "assets/arena-icon-repair-core.webp",
  "sniper-core": "assets/arena-icon-sniper-core.webp"
};
const arenaModuleIcons = {
  "": "assets/arena-icon-no-module.webp",
  "opening-shield": "assets/arena-icon-opening-shield.webp",
  "range-tune": "assets/arena-icon-range-tune.webp",
  "cooldown-tune": "assets/arena-icon-cooldown-reactor.webp",
  "armor-weave": "assets/arena-icon-composite-armor.webp",
  "focus-lens": "assets/arena-icon-focus-lens.webp",
  "first-ult": "assets/arena-icon-cooldown-reactor.webp",
  "duel-reactor": "assets/arena-icon-rush-core.webp",
  "guardian-loop": "assets/arena-icon-guard-tank.webp"
};
const masterLeagueAiIcons = {
  "focus-tank": "assets/arena-icon-guard-tank.webp",
  "focus-attacker": "assets/arena-icon-focus-lens.webp",
  "focus-healer": "assets/arena-icon-guard-healer.webp",
  "guard-healer": "assets/arena-icon-guard-healer.webp",
  "guard-attacker": "assets/arena-icon-guard-attacker.webp",
  "guard-tank": "assets/arena-icon-guard-tank.webp",
  frontline: "assets/arena-icon-ai-frontline.webp",
  skirmish: "assets/arena-icon-ai-skirmish.webp"
};

const arenaPresetOpponents = [
  {
    playerId: "preset-wall",
    name: "Iron Wall Test Team",
    rating: 980,
    defense: {
      squad: ["Valkyr", "Asterion", "Seraphim", "Lancer"],
      positions: { Valkyr: 3, Asterion: 4, Seraphim: 7, Lancer: 1 },
      modules: { Valkyr: "opening-shield", Asterion: "armor-weave", Seraphim: "cooldown-tune", Lancer: "range-tune" },
      ai: { Valkyr: "frontline", Asterion: "guard-healer", Seraphim: "guard-tank", Lancer: "focus-attacker" },
      core: "iron-wall",
      cost: 700
    }
  },
  {
    playerId: "preset-rush",
    name: "Quantum Rush Team",
    rating: 1030,
    defense: {
      squad: ["Nova", "Caliburn", "Mirage", "Helix"],
      positions: { Nova: 3, Caliburn: 4, Mirage: 1, Helix: 7 },
      modules: { Nova: "duel-reactor", Caliburn: "focus-lens", Mirage: "cooldown-tune", Helix: "opening-shield" },
      ai: { Nova: "focus-healer", Caliburn: "frontline", Mirage: "guard-attacker", Helix: "guard-tank" },
      core: "rush-core",
      cost: 940
    }
  },
  {
    playerId: "preset-sniper",
    name: "Rail Scope Nest",
    rating: 1060,
    defense: {
      squad: ["Lancer", "Orion", "Accipio", "Valkyr"],
      positions: { Lancer: 1, Orion: 2, Accipio: 7, Valkyr: 3 },
      modules: { Lancer: "first-ult", Orion: "range-tune", Accipio: "cooldown-tune", Valkyr: "armor-weave" },
      ai: { Lancer: "focus-tank", Orion: "focus-attacker", Accipio: "guard-attacker", Valkyr: "frontline" },
      core: "sniper-core",
      cost: 800
    }
  },
  {
    playerId: "preset-ewar",
    name: "Mirage Jam Cell",
    rating: 1100,
    defense: {
      squad: ["Mirage", "Eumist (Eunice專用機)", "Bastion", "Asterion"],
      positions: { Mirage: 4, "Eumist (Eunice專用機)": 7, Bastion: 1, Asterion: 3 },
      modules: { Mirage: "first-ult", "Eumist (Eunice專用機)": "guardian-loop", Bastion: "focus-lens", Asterion: "opening-shield" },
      ai: { Mirage: "guard-attacker", "Eumist (Eunice專用機)": "guard-tank", Bastion: "focus-tank", Asterion: "guard-healer" },
      core: "ewar-core",
      cost: 920
    }
  },
  {
    playerId: "preset-sustain",
    name: "Repair Loop Guard",
    rating: 1140,
    defense: {
      squad: ["Helix", "Seraphim", "MEGA(EK專用機)", "Himawari (Candy專用機)"],
      positions: { Helix: 7, Seraphim: 8, "MEGA(EK專用機)": 3, "Himawari (Candy專用機)": 4 },
      modules: { Helix: "cooldown-tune", Seraphim: "guardian-loop", "MEGA(EK專用機)": "armor-weave", "Himawari (Candy專用機)": "focus-lens" },
      ai: { Helix: "guard-tank", Seraphim: "guard-tank", "MEGA(EK專用機)": "frontline", "Himawari (Candy專用機)": "skirmish" },
      core: "repair-core",
      cost: 980
    }
  }
];
const masterLeagueDifficulties = [
  { id: "easy", label: "Easy", base: 260, multiplier: 0.85, hp: 0.9, damage: 0.88, ratingOffset: -140 },
  { id: "normal", label: "Normal", base: 380, multiplier: 1.0, hp: 1.0, damage: 1.0, ratingOffset: 0 },
  { id: "hard", label: "Hard", base: 540, multiplier: 1.25, hp: 1.12, damage: 1.12, ratingOffset: 160 }
];
const masterLeagueBands = [
  { id: "bronze", name: "青銅", title: "青銅盟主", min: 0 },
  { id: "silver", name: "白銀", title: "白銀盟主", min: 2500 },
  { id: "gold", name: "黃金", title: "黃金盟主", min: 6500 },
  { id: "platinum", name: "白金", title: "白金盟主", min: 12000 },
  { id: "diamond", name: "鑽石", title: "鑽石盟主", min: 20000 },
  { id: "master", name: "大師", title: "大師盟主", min: 32000 }
];
const masterLeagueScoring = {
  costPar: 900,
  costBonusMax: 120,
  hpBonusMax: 260,
  timeBonusMax: 220,
  streakStep: 70,
  deathPenalty: 160,
  championBonus: 520
};

const squadSeeds = [
{ name: "Asterion", faction: "Allied", role: "相轉移裝甲前衛", weapon: "對艦光束軍刀 / 重力制御核心", trait: "最高耐久。守護爆發可保護附近友軍，並令自身短時間持續回血。", tactic: "先把它拉進敵群吸火；大絕重力球可放在目標身後，把大範圍敵人拉成一團方便集火。", color: "#4be4ff", x: 260, y: 250, maxHp: 175, range: 190, damage: 19, rate: 0.82, speed: 145, skill: "守護爆發", activeDesc: "短時間替附近友軍加上護盾，並為 Asterion 自身少量持續回血。", ultimate: "重力球", ultimateDesc: "在目標身後生成重力球，持續將大範圍敵人拉向中心。", activeIcon: "assets/skill-asterion-guardian.webp", ultimateIcon: "assets/skill-asterion-gravity.webp", art: "assets/asterion-profile.webp", sprite: "assets/sd-asterion.webp", spriteFacing: "left" },
{ name: "Caliburn", faction: "Allied", role: "光束軍刀決鬥機", weapon: "雙軍刀突擊 / 近距離光束手槍", trait: "攻速最高，爆發強，但裝甲較薄。", tactic: "等 Asterion 拉住仇恨後，把它拉去斬落孤立目標或指揮機。", color: "#ff5b66", x: 310, y: 390, maxHp: 130, range: 210, damage: 31, rate: 0.7, speed: 172, skill: "SEED 突擊", activeDesc: "斬擊 Caliburn 附近所有敵人。", ultimate: "流星斬", ultimateDesc: "對最近多個目標造成重擊。", activeIcon: "assets/skill-caliburn-active.webp", ultimateIcon: "assets/skill-caliburn-ultimate.webp", art: "assets/caliburn-profile.webp", sprite: "assets/sd-caliburn.webp", spriteFacing: "left" },
{ name: "Seraphim", faction: "Allied", role: "修復與護盾支援機", weapon: "納米修復光束 / 守護護盾", trait: "大範圍即時修復，主動技能同時為友軍上護盾。", tactic: "鎖定前線友軍後，Seraphim 會保持最大補血距離內跟隨，適合救急和穩住全隊血線。", color: "#62e6a7", x: 190, y: 500, maxHp: 145, range: 235, damage: -30, rate: 0.88, speed: 150, skill: "幻象修復", activeDesc: "大範圍修復附近友軍，並為範圍內友軍加上護盾。", ultimate: "天使光環", ultimateDesc: "復活倒下友軍，並大幅回復全隊。", activeIcon: "assets/skill-seraphim-active.webp", ultimateIcon: "assets/skill-seraphim-ultimate.webp", art: "assets/seraphim-profile.webp", sprite: "assets/sd-seraphim.webp", spriteFacing: "left" },
  { name: "Orion", faction: "Allied", role: "龍騎兵清場炮擊機", weapon: "多重鎖定光束炮 / 遙控炮莢", trait: "普通攻擊會同時射擊射程內所有敵機，擅長掃走整批低血目標。", tactic: "放在安全側翼覆蓋戰場。普攻可持續壓制射程內所有敵人；主動技優先收割低血敵人，大絕適合清場但打 Boss 效率一般。", color: "#ffd166", x: 180, y: 150, maxHp: 96, range: 260, damage: 19, rate: 1.08, speed: 115, skill: "全方位齊射", activeDesc: "遙控炮莢優先射擊多名低血敵人。", ultimate: "衛星全炮門", ultimateDesc: "向全場敵人掃射，對小型敵機效果最佳。", activeIcon: "assets/skill-orion-active.webp", ultimateIcon: "assets/skill-orion-ultimate.webp", art: "assets/orion-profile.webp", sprite: "assets/sd-orion.webp", spriteFacing: "right" },
  { name: "Valkyr", faction: "Allied", role: "重盾嘲諷防線機", weapon: "大型抗光束盾 / GN 力場發生器", trait: "防禦力高，能主動吸引敵人火力；大絕可持續推開貼近敵機。", tactic: "放在前線邊緣承受火力，主動嘲諷把敵人拉住；GN 力場適合保護後排或阻止敵群壓入。", color: "#8bd7ff", x: 230, y: 250, maxHp: 190, range: 185, damage: 16, rate: 1.02, speed: 120, skill: "挑釁信標", activeDesc: "嘲諷範圍內敵人，強制它們攻擊 Valkyr。", ultimate: "GN 力場", ultimateDesc: "一段時間內生成小範圍力場，持續推開接近的敵機。", activeIcon: "assets/skill-valkyr-taunt.webp", ultimateIcon: "assets/skill-valkyr-gn-field.webp", art: "assets/player-valkyr-profile.webp", sprite: "assets/player-valkyr-sd.webp", spriteFacing: "right" },
  { name: "Lancer", faction: "Allied", role: "軌道狙擊機", weapon: "超長距離穿甲光束長槍", trait: "單發傷害極高，擅長處理重裝敵人和 Boss。", tactic: "留在後排鎖定高 HP 目標，避免被高速敵機近身。", color: "#4aa8ff", x: 170, y: 210, maxHp: 98, range: 500, damage: 34, rate: 1.82, speed: 112, skill: "穿甲狙擊", activeDesc: "立即狙擊當前最高 HP 敵人，造成破甲重擊。", ultimate: "軌道貫穿", ultimateDesc: "向最強敵人發射超遠距離貫穿炮。", activeIcon: "assets/skill-lancer-active-v1.webp", ultimateIcon: "assets/skill-lancer-ultimate-v1.webp", art: "assets/player-lancer-profile.webp", sprite: "assets/player-lancer-sd.webp", spriteFacing: "right" },
  { name: "Nova", faction: "Allied", role: "高機動突擊機", weapon: "量子刃 / 短距離相位推進器", trait: "速度最快，可穿插敵陣背刺，但耐久中等。", tactic: "用量子背刺切入敵方後排；量子化期間可穿透機體自由移動並爆發輸出。", color: "#ff9b38", x: 250, y: 430, maxHp: 128, range: 190, damage: 34, rate: 0.76, speed: 198, skill: "量子背刺", activeDesc: "高速移動到目標身後，並對附近敵人造成範圍斬擊。", ultimate: "量子化", ultimateDesc: "短時間穿透敵我機體自由移動，移速 +200%，普通攻擊變成範圍斬擊並提升攻擊力。", activeIcon: "assets/skill-nova-backstab-ai-v6.webp", ultimateIcon: "assets/skill-nova-phase-ai-v6.webp", art: "assets/player-nova-profile.webp", sprite: "assets/player-nova-sd.webp", spriteFacing: "right" },
  { name: "Helix", faction: "Allied", role: "範圍維修與隱形支援機", weapon: "再生力場 / 幻象粒子散布器", trait: "持續範圍回血，不負責爆發救急；大絕可隱形脫離敵人鎖定。", tactic: "放在隊伍中央或主坦身後，開主動技讓範圍內友軍持續回血；被狙擊或被敵群追擊時用幻象粒子脫身。", color: "#7cffc4", x: 200, y: 470, maxHp: 138, range: 245, damage: -22, rate: 0.72, speed: 158, skill: "再生力場", activeDesc: "範圍內友軍在一段時間內持續回血。", ultimate: "幻象粒子", ultimateDesc: "Helix 隱形一段時間，鎖定它的敵人會失去目標並改攻擊其他機。", activeIcon: "assets/skill-helix-active.webp", ultimateIcon: "assets/skill-helix-ultimate.webp", art: "assets/player-helix-profile.webp", sprite: "assets/player-helix-sd.webp", spriteFacing: "left" },
  { name: "Bastion", faction: "Allied", role: "重裝破甲炮擊機", weapon: "肩部重粒子炮 / 破甲榴彈", trait: "攻擊慢但單發極重，對 Boss 和厚血敵人特別有效。", tactic: "放在坦機後方專打高 HP 目標。主動技和大絕會轟炸目標周圍小範圍。", color: "#f6c34f", x: 255, y: 340, maxHp: 158, range: 300, damage: 64, rate: 2.7, speed: 52, skill: "重炮壓制", activeDesc: "炮擊最高 HP 敵人，對 Boss 額外傷害，並波及附近敵機。", ultimate: "要塞齊射", ultimateDesc: "集中轟炸最高威脅目標，對 Boss 造成巨額破甲傷害並小範圍濺射。", activeIcon: "assets/skill-bastion-suppression-green-v2.webp", ultimateIcon: "assets/skill-bastion-salvo-green-v2.webp", art: "assets/player-bastion-profile.webp", sprite: "assets/player-bastion-sd.webp", spriteFacing: "right" },
  { name: "Mirage", faction: "Allied", role: "電子干擾中距離機", weapon: "幻象浮游炮 / 干擾脈衝", trait: "輸出中等，但可降低敵軍移速和火力，保護後排。", tactic: "放在隊伍中央，主動技可拖慢湧入敵群。", color: "#c37bff", x: 245, y: 230, maxHp: 120, range: 220, damage: 20, rate: 0.88, speed: 168, skill: "持續干擾", activeDesc: "持續干擾附近敵人，短時間降低移速和傷害。", ultimate: "海市蜃樓域", ultimateDesc: "大範圍癱瘓敵軍火控，並於生效期間造成持續傷害。", activeIcon: "assets/skill-mirage-jammer-ai-v6.webp", ultimateIcon: "assets/skill-mirage-domain-ai-v6.webp", art: "assets/player-mirage-profile.webp", sprite: "assets/player-mirage-sd.webp", spriteFacing: "left" },
  { name: "Eumist (Eunice專用機)", ace: true, faction: "Allied", role: "霧刃循環支援機", weapon: "霞霧光刃 / 霧痕治癒核心", trait: "邊輸出邊補血。每次造成傷害會疊加霧痕，疊滿後消耗霧痕為全隊小補；但會隨時被阿媽捉去溫書補習，原地停止 3 秒。", tactic: "放在中前排持續斬擊同一批敵人，讓霧痕爆開形成穩定續航。八重霞適合敵群壓入時回血，朧可清場並為全隊提供短暫減傷。", color: "#66f2e4", x: 245, y: 315, maxHp: 126, range: 215, damage: 24, rate: 0.82, speed: 172, skill: "八重霞", activeDesc: "向四周發出連續霧刃斬擊，部分總傷害轉化為全隊治療，最低血友方額外回復。", ultimate: "朧", ultimateDesc: "展開大範圍霧域，高速斬擊敵方全體，將部分傷害轉化為治療，並令全隊短時間減傷。", passive: "霧痕循環", passiveDesc: "每次本機造成傷害時疊加 1 層霧痕；每層令本機對該敵人傷害 +4%。疊滿 5 層時消耗霧痕，治療全隊並額外治療最低血友方。", activeIcon: "assets/skill-eumist-yaegasumi.webp", ultimateIcon: "assets/skill-eumist-oboro.webp", art: "assets/player-eumist-profile.webp", sprite: "assets/player-eumist-sd.webp", spriteFacing: "left" },
  { name: "MEGA(EK專用機)", ace: true, faction: "Allied", role: "皇牌機師專用坦機", weapon: "EK環刃 / 近身全方位斬擊", trait: "重裝近戰坦機，普攻會斬擊自身附近敵人；但會隨機迷路 3 秒並四圍衝。", tactic: "放在前線吸引敵軍。每次啟動 EK 光環會獲得 15 秒防禦力 +100%；EK 定律會植入場上最大威脅敵人，1 秒後以擴大範圍爆炸並波及附近機體，MEGA 自身獲得 3 秒無敵。", color: "#48a8ff", x: 225, y: 320, maxHp: 225, range: 150, damage: 24, rate: 1.05, speed: 108, skill: "EK光環", activeDesc: "啟動/停止 EK 光環；每次啟動獲得防禦力 +100% 15 秒，啟動期間持續吸引附近敵機，停止後冷卻 10 秒。", ultimate: "EK定律", ultimateDesc: "為場上最大威脅敵人植入 EK 定律，1 秒後以擴大 50% 範圍爆炸並波及附近機體；MEGA 自身獲得無敵 3 秒。", activeIcon: "assets/skill-miles-fan-ek-aura.webp", ultimateIcon: "assets/skill-miles-fan-ek-law.webp", art: "assets/player-mega-ek-profile.webp", sprite: "assets/player-mega-ek-sd.webp", spriteFacing: "left" },
  { name: "Himawari (Candy專用機)", ace: true, faction: "Allied", role: "皇牌機師專用重裝支援機", weapon: "扇形激死你炮，連擊敵人會使敵人爆炸", trait: "略胖女性風重裝機，速度極慢。普攻會向前方扇形範圍攻擊；同一敵人連續被命中三次會引發小型爆炸。機體性能難以捉摸，經常不分敵我方，隨機師心情為友方機體上增益或減益。", tactic: "放在中後排用扇形 AOE 清線。持續鎖定同一敵人可觸發連擊爆炸；美女廚房適合毒殺厚血目標，發脾氣可震開身邊所有機體並全場雷射掃射。", color: "#ff7bd6", x: 225, y: 320, maxHp: 168, range: 255, damage: 22, rate: 1.35, speed: 42, spriteScale: 1.18, skill: "美女廚房", activeDesc: "向目標駕駛員投餵有毒食物，無視防禦，6 秒內按目標最大 HP 百分比造成持續傷害。對高血量敵機特別有效。", ultimate: "發脾氣", ultimateDesc: "震飛身邊所有機體，包括友方，並對全畫面敵機進行粗雷射掃射，造成大範圍爆發傷害。", passive: "我幫緊你", passiveDesc: "隨機時間對一名友方機體施加 3 秒狀態。可能是強化或干擾：攻擊力 +80%、防禦力 +80%、速度 -80%、攻擊力 -80%、防禦力 -80%。中狀態機體會有明顯標示。", activeIcon: "assets/skill-himawari-kitchen.webp", ultimateIcon: "assets/skill-himawari-tantrum.webp", art: "assets/player-himawari-profile.webp", sprite: "assets/player-himawari-sd.webp", spriteFacing: "left" },
  { name: "Accipio", ace: true, faction: "Allied", role: "後方支援 / 多重鎖定補助機", weapon: "Solace 光束步槍 / IT 支援無人機 / XDR 防護核心", trait: "以多重鎖定標記敵人，令敵人成為全隊回血節點；危急時可復活隊友，無人陣亡時則展開平鏡止牛凍結戰場。", tactic: "Accipio 為開發者 Sun 的專用機。放在隊伍後方，以 400 射程鎖定最多 5 名敵機並打上治療標記。先用普攻鋪 recovery point，再用 IT Remote Support 將標記轉成全隊護盾。", color: "#62f6b0", x: 185, y: 470, maxHp: 158, range: 400, damage: 20, rate: 1.05, speed: 138, spriteScale: 1.18, skill: "IT Remote Support", activeDesc: "全隊即時回血並獲得 HOT；若場上有治療標記，會消耗全部標記並按層數轉化成全隊護盾。", ultimate: "XDR Cyber Protection", ultimateDesc: "有隊友陣亡時復活 1 名友方；否則施放平鏡止牛，為全隊加大型護盾、減傷並停止範圍敵機。", passive: "Sun 支援協定・傷膝版", passiveDesc: "身處全隊後方時，治療標記回血提升。隨機觸發後方戰術指揮強化全隊，或膝患復發令 Accipio 暫時不能移動、普攻及新增標記。", activeIcon: "assets/skill-accipio-remote-support.webp", ultimateIcon: "assets/skill-accipio-xdr-protection.webp", art: "assets/player-accipio-profile.webp", sprite: "assets/player-accipio-sd.webp", spriteFacing: "left" }
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
    range: 125,
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
    range: 105,
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
    range: 285,
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
    range: 140,
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
    range: 205,
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
    range: 320,
    damage: 22,
    speedBase: 42,
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
    text: "Nova 傷害 +12、射程 +30、速度 +24、量子背刺傷害更高，範圍更大。",
    apply() {
      const u = squad.find((unit) => unit.name === "Nova");
      if (!u) return;
      u.damage += 12;
      u.range += 30;
      u.speed += 24;
      u.rushRadius = (u.rushRadius || 190) + 35;
      u.rushDamage = (u.rushDamage || 72) + 24;
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
    id: "eumist-mist-cycle-core",
    unit: "Eumist (Eunice專用機)",
    type: "Eumist 霧痕",
    name: "補習筆記核心",
    tier: "rare",
    icon: "assets/upgrade-eumist-mist-cycle.webp",
    text: "Eumist 傷害 +7；霧痕爆開治療提升，補習中觸發間隔延長。",
    apply() {
      const u = squad.find((unit) => unit.name === "Eumist (Eunice專用機)");
      if (!u) return;
      u.damage += 7;
      u.eumistBurstHealMultiplier = (u.eumistBurstHealMultiplier || 1) * 1.25;
      u.eumistTutoringMin = (u.eumistTutoringMin || 7) + 6;
      u.eumistTutoringRange = (u.eumistTutoringRange || 23) + 4;
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
    id: "accipio-remote-protection-budget",
    unit: "Accipio",
    type: "Accipio XDR",
    name: "Remote Protection Budget",
    icon: "assets/upgrade-accipio-remote-budget.webp",
    text: "Accipio HOT 時間 +2 秒、治療量 +18%、標記轉盾效率 +20%、XDR 充能 +12%，平鏡止牛範圍和停止時間提升。",
    apply() {
      const u = squad.find((unit) => unit.name === "Accipio");
      if (!u) return;
      u.accipioHealBoost = (u.accipioHealBoost || 1) * 1.18;
      u.accipioHotDuration = (u.accipioHotDuration || 6) + 2;
      u.accipioShieldScale = (u.accipioShieldScale || 1) * 1.2;
      u.accipioXdrGain = (u.accipioXdrGain || 1) * 1.12;
      u.accipioMirrorRadius = (u.accipioMirrorRadius || 364) + 66;
      u.accipioMirrorStopDuration = (u.accipioMirrorStopDuration || 3.2) + 0.8;
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
    text: "全體機體每次低於 40% HP 時覺醒：攻擊力、防禦力、補血量、移速 +35%，抗敵機推撞能力 +300%，持續 10 秒。",
    apply() {
      squad.forEach((u) => {
        u.seedProtocol = true;
        u.seedAwakenArmed = true;
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

const unitEnglish = {
  Asterion: {
    role: "Phase-Armour Vanguard",
    weapon: "Anti-Ship Beam Sabre / Gravity Control Core",
    trait: "Highest durability. Guardian Burst shields nearby allies and restores Asterion over time.",
    tactic: "Drag it into the pack to draw fire. Drop Gravity Core behind priority targets to bunch hostiles up for focused fire.",
    skill: "Guardian Burst",
    activeDesc: "Throws shields over nearby allies and restores Asterion over time.",
    ultimate: "Gravity Core",
    ultimateDesc: "Drops a gravity core behind the target, dragging hostiles into the kill zone."
  },
  Caliburn: {
    role: "Beam-Sabre Duelist",
    weapon: "Twin Sabre Rush / Close-Range Beam Pistol",
    trait: "Fastest attack speed with fierce burst damage, but its armour is thin.",
    tactic: "Once Asterion has enemy attention, send Caliburn to cut down isolated targets or commanders.",
    skill: "SEED Rush",
    activeDesc: "Slashes all hostiles near Caliburn.",
    ultimate: "Meteor Slash",
    ultimateDesc: "Strikes several nearby targets with heavy blade damage."
  },
  Seraphim: {
    role: "Repair and Shield Support",
    weapon: "Nanite Repair Beam / Guardian Shield",
    trait: "Wide-area emergency repair. Its active skill also shields allies.",
    tactic: "Lock onto a frontline ally and Seraphim will keep healing from maximum safe range.",
    skill: "Phantom Repair",
    activeDesc: "Repairs nearby allies in a wide area and adds shields.",
    ultimate: "Angel Halo",
    ultimateDesc: "Revives fallen allies and restores the whole squad."
  },
  Orion: {
    role: "Dragoon Sweeper Artillery",
    weapon: "Multi-Lock Beam Cannon / Remote Gun Pods",
    trait: "Basic attacks fire at every hostile in range, making Orion excellent at sweeping weak swarms.",
    tactic: "Keep it on a safe flank to cover the field. Basic attacks suppress all hostiles in range; its active harvests low-HP targets and the ultimate clears crowds but is weaker into bosses.",
    skill: "Omni Volley",
    activeDesc: "Remote pods prioritise several low-HP hostiles.",
    ultimate: "Satellite Barrage",
    ultimateDesc: "Sweeps the whole field, best against light enemy units."
  },
  Valkyr: {
    role: "Heavy-Shield Taunt Defender",
    weapon: "Anti-Beam Tower Shield / GN Field Generator",
    trait: "High defence and reliable aggro control. Its ultimate keeps pushing nearby hostiles back.",
    tactic: "Hold the frontline edge, taunt incoming threats, then use GN Field to protect the backline.",
    skill: "Taunt Beacon",
    activeDesc: "Taunts hostiles in range, forcing them to attack Valkyr.",
    ultimate: "GN Field",
    ultimateDesc: "Creates a short-lived field that pushes nearby hostiles away."
  },
  Lancer: {
    role: "Orbital Sniper",
    weapon: "Ultra-Long-Range Armour-Piercing Beam Lance",
    trait: "Huge single-shot damage, built for heavy units and bosses.",
    tactic: "Keep it in the rear and lock high-HP targets before fast attackers close in.",
    skill: "Piercing Snipe",
    activeDesc: "Immediately snipes the highest-HP hostile with armour-piercing damage.",
    ultimate: "Orbital Pierce",
    ultimateDesc: "Fires an extreme-range piercing beam at the strongest target."
  },
  Nova: {
    role: "High-Mobility Assault",
    weapon: "Quantum Blade / Short-Range Phase Thruster",
    trait: "Fastest movement. It can cut through the backline, but its durability is only moderate.",
    tactic: "Use Quantum Backstab to dive enemy supports. During Phase Shift, Nova can pass through units and burst hard.",
    skill: "Quantum Backstab",
    activeDesc: "Dashes behind the target and slashes nearby hostiles.",
    ultimate: "Phase Shift",
    ultimateDesc: "Briefly phases through all units, gains +200% movement speed, and turns basic attacks into stronger area slashes."
  },
  Helix: {
    role: "Area Repair and Stealth Support",
    weapon: "Regeneration Field / Mirage Particle Disperser",
    trait: "Steady area healing rather than panic burst. Its ultimate cloaks Helix and breaks enemy lock-on.",
    tactic: "Place it behind the tank or centre squad. Trigger the field for steady healing, then cloak out of danger when focused.",
    skill: "Regeneration Field",
    activeDesc: "Restores allies inside the area over time.",
    ultimate: "Mirage Particles",
    ultimateDesc: "Cloaks Helix; enemies targeting it lose lock and switch targets."
  },
  Bastion: {
    role: "Heavy Armour-Break Artillery",
    weapon: "Shoulder Heavy Particle Cannon / Armour-Break Grenades",
    trait: "Slow, massive shots. Especially strong against bosses and bulky hostiles.",
    tactic: "Park behind a tank and delete high-HP targets. Both skills bombard a small area around the target.",
    skill: "Cannon Suppression",
    activeDesc: "Shells the highest-HP target, dealing bonus boss damage and splash.",
    ultimate: "Fortress Salvo",
    ultimateDesc: "Concentrates fire on the highest-threat target, dealing huge armour-break damage and splash."
  },
  Mirage: {
    role: "Electronic Warfare Mid-Ranger",
    weapon: "Phantom Funnels / Jamming Pulse",
    trait: "Moderate damage, but it cuts hostile speed and firepower to protect the backline.",
    tactic: "Keep it central. Its active slows incoming packs before they reach your supports.",
    skill: "Sustained Jammer",
    activeDesc: "Jams nearby hostiles, briefly reducing speed and damage.",
    ultimate: "Mirage Domain",
    ultimateDesc: "Disables enemy fire control over a wide area and deals damage over time."
  },
  "Eumist (Eunice專用機)": {
    name: "Eumist (Eunice Custom)",
    role: "Mist-Blade Loop Support",
    weapon: "Haze Beam Blade / Mistmark Heal Core",
    trait: "Deals damage while healing. Hits stack Mistmarks, then cash them in for squad healing. May be dragged off by Mum for revision at any moment, freezing in place for 3 seconds.",
    tactic: "Keep it mid-front and slicing the same pack. Yaegasumi heals when enemies flood in; Oboro clears the screen and gives the squad brief damage reduction.",
    skill: "Yaegasumi",
    activeDesc: "Fires repeated mist-blade slashes around itself. Part of the damage becomes squad healing, with extra help for the lowest-HP ally.",
    ultimate: "Oboro",
    ultimateDesc: "Unleashes a wide mist domain, rapidly slashing all hostiles, converting part of the damage into healing and brief squad damage reduction.",
    passive: "Mistmark Loop",
    passiveDesc: "Each hit adds 1 Mistmark. Each mark makes Eumist deal +4% damage to that enemy. At 5 marks, Eumist consumes them to heal the squad and extra-heal the lowest-HP ally."
  },
  "MEGA(EK專用機)": {
    name: "MEGA (EK Custom)",
    role: "Ace Custom Tank",
    weapon: "EK Ring Blade / Close-Range All-Angle Slash",
    trait: "Heavy melee tank. Basic attacks slash nearby hostiles, but it sometimes gets completely lost for 3 seconds and charges about in the wrong direction.",
    tactic: "Drop it on the frontline to grab attention. Each EK Aura activation grants +100% defence for 15 seconds; EK Law marks the highest-threat hostile, detonates after 1 second with a 50% larger blast, and makes MEGA invulnerable for 3 seconds.",
    skill: "EK Aura",
    activeDesc: "Toggles EK Aura. Each activation grants +100% defence for 15 seconds. While active, it keeps pulling nearby hostiles. When switched off, it enters a 10-second cooldown.",
    ultimate: "EK Law",
    ultimateDesc: "Implants EK Law into the highest-threat hostile, detonating after 1 second with 50% larger splash damage. MEGA becomes invulnerable for 3 seconds."
  },
  "Himawari (Candy專用機)": {
    name: "Himawari (Candy Custom)",
    role: "Ace Custom Heavy Support",
    weapon: "Fan-Shaped Death-Glare Cannon / Combo Detonation",
    trait: "Chunky stylish heavy unit, extremely slow. Basic attacks hit a frontal cone; three hits on the same enemy cause a small explosion. Performance is wildly unpredictable and often forgets which side is which, blessing or ruining allies depending on the pilot's mood.",
    tactic: "Use it mid-rear for cone AOE wave clear. Lock the same enemy to trigger combo explosions; Beauty Kitchen Disaster poisons bulky targets, while Full Tantrum Mode blasts everything away with rude lasers.",
    skill: "Beauty Kitchen Disaster",
    activeDesc: "Force-feeds the target pilot suspicious food, ignoring defence and dealing max-HP poison damage for 6 seconds. Very nasty against bulky enemies.",
    ultimate: "Full Tantrum Mode",
    ultimateDesc: "Knocks away every nearby unit, including allies, then sweeps the whole screen with rough laser fire.",
    passive: "I'm Helping, Honest",
    passiveDesc: "Randomly applies a 3-second state to an allied unit. It might help or sabotage: attack +80%, defence +80%, speed -80%, attack -80%, or defence -80%. Affected units are clearly marked."
  },
  Accipio: {
    role: "Rear Support / Multi-Lock Recovery Unit",
    weapon: "Solace Beam Rifle / IT Support Drones / XDR Protection Core",
    trait: "Marks hostiles as recovery points. Allies attacking marked hostiles restore themselves; the ultimate either restores a fallen unit or freezes the field with Mirror Stillness.",
    tactic: "Accipio is developer Sun's custom unit. Keep it behind the squad. Its 400 range marks up to 5 hostiles inside the lock zone, then IT Remote Support converts those marks into squad shields.",
    skill: "IT Remote Support",
    activeDesc: "Instantly heals the squad and applies HOT. Existing Healing Marks are consumed and converted into squad shields.",
    ultimate: "XDR Cyber Protection",
    ultimateDesc: "Revives one fallen ally if possible; otherwise shields the squad, grants damage reduction, and stops nearby hostiles.",
    passive: "Sun Support Protocol: Knee Edition",
    passiveDesc: "Healing Marks recover more while Accipio is behind the team. Randomly triggers rear command buffs, or a knee flare-up that roots Accipio and clears marks."
  },
  "Vesper Drone": {
    role: "Mass-Production Assault Unit",
    weapon: "Beam Carbine / Boost Wings",
    trait: "Fast and attacks the nearest ally in packs.",
    tactic: "Thin armour. Let Asterion bunch them up, then clear with Caliburn or Orion."
  },
  "Helios Raider": {
    role: "High-Speed Sabre Ambusher",
    weapon: "Thermal Sabre / Burst Thruster",
    trait: "Fast but fragile. It dives isolated units.",
    tactic: "Let Asterion intercept it before it reaches Orion or Seraphim."
  },
  "Azure Lancer": {
    role: "Long-Range Beam Sniper",
    weapon: "Orbital Beam Lance",
    trait: "Slow movement, long range, dangerous if ignored.",
    tactic: "Send Caliburn in close or let Orion suppress it at range."
  },
  "Obsidian Guard": {
    role: "Heavy Shield Unit",
    weapon: "Shield Ram / Heavy Carbine",
    trait: "High durability, slow movement, absorbs damage for enemies.",
    tactic: "Unless it blocks melee units, clear other threats first."
  },
  "Crimson Marshal": {
    role: "Command Fire Support",
    weapon: "Heavy Beam Rifle / Shoulder Thrusters",
    trait: "Higher durability and range; pressures your repair units.",
    tactic: "Focus it with Caliburn and Orion. Do not let Seraphim drift forward."
  },
  "Dread Sovereign": {
    role: "Ace Mobile Armour Boss",
    weapon: "All-Range Beam Array / Wing Cannons",
    trait: "Boss unit. High durability, high range, appears every 3 waves.",
    tactic: "Keep Asterion shielded, focus fire, and spend skills as soon as they are ready."
  }
};

const rewardEnglish = {
  "beam-capacitors": ["Weapons", "High-Output Beam Capacitors", "Weapon damage for all attack units +15%."],
  "phase-armor": ["Armour", "Phase-Armour Retrofit", "All allied units gain +25 max HP and instantly repair 25 HP."],
  "guardian-reactor": ["Asterion Skill", "Guardian Reactor", "Asterion gains +45 max HP and +5 damage. Guardian Burst self-repairs longer; Gravity Core gets a wider pull."],
  "seed-rush": ["Caliburn Weapon", "SEED Rush OS", "Caliburn gains +12 damage, attacks faster, and hits harder with its rush skill."],
  "repair-drones": ["Seraphim Skill", "Repair Drone Swarm", "Seraphim heals more, reaches further, and Phantom Repair adds thicker shields."],
  "dragoon-pods": ["Orion Weapon", "Dragoon Pod Expansion", "Orion fires faster, gains +35 range, and launches more clearing pods with its active."],
  "valkyr-zero-core": ["Valkyr Skill", "GN Defence Core", "Valkyr gains +55 max HP and +12% defence. Taunt Beacon lasts longer; GN Field gets wider and stronger."],
  "lancer-rail-scope": ["Lancer Weapon", "Orbital Targeting Scope", "Lancer gains +14 damage and +35 range. Piercing Snipe and Orbital Pierce hit harder."],
  "nova-assault-wing": ["Nova Quantum", "Quantum Phase Core", "Nova gains +12 damage, +30 range and +24 speed. Quantum Backstab hits harder and gets a wider strike area."],
  "helix-beacon-grid": ["Helix Repair", "Regeneration Mirage Matrix", "Helix gains stronger healing, better range and survival. Regeneration Field lasts longer; Mirage Particles cloak wider."],
  "bastion-stabilizer": ["Bastion Artillery", "Heavy Cannon Stabiliser", "Bastion gains +16 damage and +30 range. Cannon Suppression gets a wider blast."],
  "mirage-phantom-core": ["Mirage Jammer", "Phantom Jammer Core", "Mirage gains +8 damage and +25 range. Jamming duration and area increase."],
  "eumist-mist-cycle-core": ["Eumist Mistmarks", "Revision Notes Core", "Eumist gains +7 damage. Mistmark burst healing improves, and Mum takes longer to drag it off for revision."],
  "miles-ek-aura-core": ["MEGA Skill", "EK Aura-Law Core", "MEGA gains +45 max HP and +10% defence. EK Law explosion damage and splash radius improve."],
  "himawari-helping-core": ["Himawari Support", "I'm Helping, Honest Core", "Himawari gains +35 max HP. Beauty Kitchen poison gets worse, the passive triggers more often, and tantrum lasers hit harder."],
  "accipio-remote-protection-budget": ["Accipio XDR", "Remote Protection Budget", "Accipio HOT lasts longer, healing improves, Mark-to-shield conversion gets stronger, XDR charges faster, and Mirror Stillness grows wider and longer."],
  "overclocked-servos": ["Mobility", "Overclocked AMBAC Servos", "All units move faster and attack intervals shorten by 8%."],
  "emergency-nanites": ["Survival", "Emergency Nanite Bay", "All units recover 40% HP. Downed units return with 35% HP."],
  "spare-thruster-fuel": ["Mobility", "Spare Thruster Fuel", "All unit movement speed +10%."],
  "beam-cooling-lines": ["Weapons", "Beam Cooling Lines", "All attack intervals shorten by 5%."],
  "assist-aim-chip": ["Weapons", "Assist-Aim Chip", "All attack units gain +18 range."],
  "lightweight-armor-plates": ["Armour", "Lightweight Armour Plates", "All units gain +18 max HP and +4% movement speed."],
  "field-repair-kit": ["Survival", "Field Repair Kit", "At the start of each wave, all units recover 12% HP."],
  "squad-sync-link": ["Skills", "Squad Sync Link", "All active skill cooldowns -1 second."],
  "thruster-stabilizer": ["Mobility", "Thruster Stabiliser", "Enemy shoves and crush movement affect units 20% less."],
  "trajectory-data": ["Weapons", "Trajectory Correction Data", "Attack unit basic weapon damage +8%."],
  "tactical-fire-control-core": ["Fire Control", "Tactical Fire-Control Core", "Attack units gain +12% damage and +25 range."],
  "dense-defense-coating": ["Armour", "Dense Defence Coating", "All units gain +8% defence and +20 max HP."],
  "support-sync-protocol": ["Support", "Support Unit Sync Protocol", "Repair unit healing +18%, healing range +30."],
  "frontline-suppression-order": ["Command", "Frontline Suppression Order", "When tanks are attacked, nearby hostiles deal 15% less damage."],
  "skill-circuit-overload": ["Skills", "Skill Circuit Overload", "All active skill cooldowns -2 seconds, but max HP -10."],
  "seed-awakening-protocol": ["Ultra Rare", "SEED Awakening Protocol", "Each time a unit drops below 40% HP, it awakens for 10 seconds: +35% attack, defence, healing and speed, plus +300% resistance to hostile collision push."],
  "meteor-equipment-deploy": ["Ultra Rare", "Meteor Equipment Deploy", "Attack units have a 35% chance for basic attacks to call a small area beam bombardment."],
  "genesis-jamming-wave": ["Ultra Rare", "Positron Cannon", "Each unit fires a field-wide positron sweep once whenever its HP drops below 35%."],
  "zero-range-breakthrough": ["Ultra Rare", "Zero-Range Breakthrough Order", "Melee and mid-range units resist shoves 50% more, gain +45% speed and +25 damage, but take +15% damage."],
  "infinite-energy-core": ["Ultra Rare", "Infinite Energy Core", "All skill cooldowns -35% and ultimate charge +35%, but enemy spawns increase by 15% each wave."]
};

function localizeUnit(unit) {
  if (currentLanguage !== "en" || !unit) return unit;
  return { ...unit, ...(unitEnglish[unit.name] || {}) };
}

function localizeReward(reward) {
  if (currentLanguage !== "en" || !reward) return reward;
  const values = rewardEnglish[reward.id];
  if (!values) return reward;
  return { ...reward, type: values[0], name: values[1], text: values[2] };
}

function localizeStatus(status) {
  if (currentLanguage !== "en") return status;
  const labels = {
    "atk-up": ["Attack +80%", "ATK+"],
    "def-up": ["Defence +80%", "DEF+"],
    "speed-down": ["Speed -80%", "SPD-"],
    "atk-down": ["Attack -80%", "ATK-"],
    "def-down": ["Defence -80%", "DEF-"]
  };
  const value = labels[status.kind];
  return value ? { ...status, label: value[0], shortLabel: value[1] } : status;
}

function localizeArenaAiOption(option) {
  if (currentLanguage !== "en" || !option) return option;
  return {
    ...option,
    name: option.enName || option.name,
    text: option.enText || option.text
  };
}

const arenaCoreEnglish = {
  "iron-wall": ["Iron Wall Core", "All units gain HP +10%, but movement speed -6%."],
  "rush-core": ["Rush Core", "Opening 15 seconds damage +18%, then damage -6%."],
  "ewar-core": ["E-War Core", "Opening interference wave: enemy active skill cooldown +3s and movement speed -20% for 3 seconds."],
  "repair-core": ["Repair Core", "Each unit auto-repairs once at low HP, but damage -6%."],
  "sniper-core": ["Sniper Core", "Long-range units gain damage +15%; shorter-range units take +8% damage."]
};

const arenaModuleEnglish = {
  "opening-shield": ["Opening Shield", "Start battle with 5 shield."],
  "range-tune": ["Range Tuning", "Basic attack range +8%."],
  "cooldown-tune": ["Cooldown Governor", "Active skill cooldown -12%."],
  "armor-weave": ["Armour Weave", "Damage taken -8%, movement speed -4%."],
  "focus-lens": ["Focus Lens", "Basic attacks deal more damage to the current focused target."],
  "first-ult": ["First Strike Capacitor", "Start battle with ultimate charge +35%."],
  "duel-reactor": ["Duel Reactor", "Damage +22%, but max HP -10%."],
  "guardian-loop": ["Guardian Loop", "Survive one lethal hit at 1 HP and gain a short shield."]
};

const masterBandEnglish = {
  bronze: ["Bronze", "Bronze Champion"],
  silver: ["Silver", "Silver Champion"],
  gold: ["Gold", "Gold Champion"],
  platinum: ["Platinum", "Platinum Champion"],
  diamond: ["Diamond", "Diamond Champion"],
  master: ["Master", "Master Champion"]
};

function localizeArenaCoreOption(option) {
  if (currentLanguage !== "en" || !option) return option;
  const values = arenaCoreEnglish[option.id];
  return values ? { ...option, name: values[0], text: values[1] } : option;
}

function localizeArenaModuleOption(option) {
  if (currentLanguage !== "en" || !option) return option;
  const values = arenaModuleEnglish[option.id];
  return values ? { ...option, name: values[0], text: values[1] } : option;
}

function masterBandName(band) {
  if (currentLanguage !== "en") return band?.name || "";
  return masterBandEnglish[band?.id]?.[0] || band?.name || "";
}

function masterBandTitle(band) {
  if (currentLanguage !== "en") return band?.title || "";
  return masterBandEnglish[band?.id]?.[1] || band?.title || "";
}

function loadPilotProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(PILOT_PROFILE_KEY) || "{}");
    if (saved?.playerId && saved?.secret) return saved;
  } catch {
    // Ignore damaged local cache and create a fresh profile below.
  }
  const profile = {
    playerId: makeLocalToken(8),
    secret: makeLocalToken(12),
    name: localStorage.getItem("mecha-heart-player-name") || "Pilot",
    ownedModules: [],
    ownedCores: [],
    pvpDefense: null,
    pvpStats: { rating: 1000, wins: 0, losses: 0 }
  };
  localStorage.setItem(PILOT_PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

function makeLocalToken(length) {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function savePilotProfileLocal(profile) {
  pilotProfile = { ...(pilotProfile || {}), ...profile };
  localStorage.setItem(PILOT_PROFILE_KEY, JSON.stringify(pilotProfile));
}

function loadLocalMasterChampions() {
  try {
    const saved = JSON.parse(localStorage.getItem(MASTER_LEAGUE_CHAMPIONS_KEY) || "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

function championTimestamp(record) {
  const time = Date.parse(record?.updatedAt || "");
  return Number.isFinite(time) ? time : 0;
}

function mergeChampionMaps(...maps) {
  return maps.reduce((merged, map) => {
    Object.entries(map || {}).forEach(([bandId, record]) => {
      if (!record) return;
      if (!merged[bandId] || championTimestamp(record) >= championTimestamp(merged[bandId])) merged[bandId] = record;
    });
    return merged;
  }, {});
}

function saveLocalMasterChampions(champions = arenaMasterChampions) {
  arenaMasterChampions = mergeChampionMaps(arenaMasterChampions, champions);
  localStorage.setItem(MASTER_LEAGUE_CHAMPIONS_KEY, JSON.stringify(arenaMasterChampions));
  return arenaMasterChampions;
}

function makeLocalRecoveryCode() {
  const id = String(pilotProfile?.playerId || "").toUpperCase();
  const secret = String(pilotProfile?.secret || "").toUpperCase();
  if (pilotRecoveryCode) return pilotRecoveryCode;
  if (id.length < 8 || secret.length < 12) return "MH-....";
  return `MH-${id.slice(0, 4)}-${id.slice(4, 8)}-${secret.slice(0, 4)}-${secret.slice(4, 8)}-${secret.slice(8, 12)}`;
}

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

function createBattleUnit(source, id, slot, options = {}) {
  return {
    ...source,
    id,
    x: slot.x,
    y: slot.y,
    hp: source.maxHp,
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
    ekDefenseTime: 0,
    invulnerableTime: 0,
    lostTime: 0,
    lostCooldown: source.name === "MEGA(EK專用機)" ? 6 + Math.random() * 8 : 0,
    lostPoint: null,
    lostRetarget: 0,
    himawariPassiveCooldown: source.name === "Himawari (Candy專用機)" ? 5 + Math.random() * 6 : 0,
    eumistTutoringCooldown: source.name === "Eumist (Eunice專用機)" ? 5 + Math.random() * 9 : 0,
    eumistTutoringTime: 0,
    accipioPassiveCooldown: source.name === "Accipio" ? 5 + Math.random() * 7 : 0,
    accipioKneeTime: 0,
    accipioCommandTime: 0,
    accipioHotTime: 0,
    accipioHotSource: null,
    accipioShieldTime: 0,
    accipioProtectionTime: 0,
    himawariStatus: null,
    battleStats: makeBattleStats(),
    ...options
  };
}

function makeBattleStats() {
  return {
    damage: 0,
    healing: 0,
    taken: 0,
    kills: 0,
    assists: 0,
    skillUses: 0,
    ultUses: 0
  };
}

function ensureBattleStats(unit) {
  if (!unit) return null;
  if (!unit.battleStats) unit.battleStats = makeBattleStats();
  return unit.battleStats;
}

function recordBattleDamage(source, target, amount) {
  if (!target || amount <= 0) return;
  ensureBattleStats(target).taken += amount;
  if (!source) return;
  ensureBattleStats(source).damage += amount;
  target.damageLedger = target.damageLedger || {};
  target.damageLedger[source.id] = { amount: (target.damageLedger[source.id]?.amount || 0) + amount, time: now() };
}

function recordBattleKill(source, target) {
  if (!source || !target) return;
  ensureBattleStats(source).kills += 1;
  const cutoff = now() - 14;
  const helperPool = battleAlliesFor(source);
  Object.entries(target.damageLedger || {}).forEach(([sourceId, entry]) => {
    if (sourceId === source.id || (entry.time || 0) < cutoff) return;
    const helper = helperPool.find((unit) => unit.id === sourceId && unit.hp > 0);
    if (helper) ensureBattleStats(helper).assists += 1;
  });
}

function recordBattleHealing(source, amount) {
  if (!source || amount <= 0) return;
  ensureBattleStats(source).healing += amount;
}

function reset() {
  paused = false;
  pausedAt = 0;
  autoBattleEnabled = false;
  localStorage.setItem(AUTO_BATTLE_KEY, "0");
  clearAutoRewardTimer();
  updatePauseControls();
  updateAutoBattleControl();
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
    ekDefenseTime: 0,
    invulnerableTime: 0,
    lostTime: 0,
    lostCooldown: u.name === "MEGA(EK專用機)" ? 6 + Math.random() * 8 : 0,
    lostPoint: null,
    lostRetarget: 0,
    himawariPassiveCooldown: u.name === "Himawari (Candy專用機)" ? 5 + Math.random() * 6 : 0,
    eumistTutoringCooldown: u.name === "Eumist (Eunice專用機)" ? 5 + Math.random() * 9 : 0,
    eumistTutoringTime: 0,
    accipioPassiveCooldown: u.name === "Accipio" ? 5 + Math.random() * 7 : 0,
    accipioKneeTime: 0,
    accipioCommandTime: 0,
    accipioHotTime: 0,
    accipioHotSource: null,
    accipioShieldTime: 0,
    accipioProtectionTime: 0,
    himawariStatus: null,
    battleStats: makeBattleStats()
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
  commandEl.textContent = t("idle");
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

function applyStaticLanguage() {
  document.documentElement.lang = currentLanguage === "en" ? "en-GB" : "zh-Hant";
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
    element.setAttribute("alt", t(element.dataset.i18nAlt));
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });
  if (languageToggleEl) languageToggleEl.textContent = "English / 繁中";
  updateTutorialImage();
  updatePauseControls();
}

function updateTutorialImage() {
  const image = document.getElementById("tutorial-controls-image");
  if (!image) return;
  const src = currentLanguage === "en"
    ? "assets/tutorial-controls-en.webp?v=6"
    : "assets/tutorial-controls-zh.webp?v=6";
  image.dataset.src = src;
  if (image.getAttribute("src")) image.src = src;
}

function refreshLanguageSensitiveViews() {
  hudCardsSignature = "";
  skillBarSignature = "";
  applyStaticLanguage();
  if (!formationEl.hidden) {
    renderDatabase();
    renderFormation();
  }
  if (!arenaEl.hidden) renderArena();
  if (!arenaResultEl.hidden) renderMasterLeaderboards(masterLeagueRankings);
  if (squad.length) {
    renderIntel(focusedUnit || squad[0]);
    updateHud();
  } else {
    commandEl.textContent = t("idle");
  }
  if (!rewardEl.hidden && rewardChoices.length) renderRewardChoices();
  if (!resultEl.hidden) renderResultCopy(resultEl.classList.contains("won"));
  loadLeaderboard();
}

function toggleLanguage() {
  currentLanguage = currentLanguage === "en" ? "zh" : "en";
  localStorage.setItem(LOCALE_KEY, currentLanguage);
  refreshLanguageSensitiveViews();
}

function translateMessage(text) {
  if (currentLanguage !== "en") return text;
  const exact = {
    "待命": "Standby",
    "暫停中": "Paused",
    "繼續作戰": "Mission Resumed",
    "讀取排行榜中...": "Loading leaderboard...",
    "輸入姓名後可提交今局分數。": "Enter your name to submit this run.",
    "挑戰最高分數，打入王牌榜。": "Push the score and break into the ace board.",
    "已載入預設排名；Cloudflare KV 尚未綁定。": "Default ranks loaded; Cloudflare KV is not linked yet.",
    "預設排行榜": "Default Leaderboard",
    "即時排行榜": "Live Leaderboard",
    "暫時未能連線排行榜，先顯示預設排名。": "Leaderboard is offline for now, showing default ranks.",
    "暫時顯示預設排行榜": "Showing default leaderboard for now",
    "今局分數已提交。": "This run has already been submitted.",
    "提交分數中...": "Submitting score...",
    "分數已提交。": "Score submitted.",
    "即時排行榜已更新": "Live leaderboard updated",
    "本機預覽排行榜": "Local leaderboard preview",
    "本機 Master League 排行榜已更新": "Local Master League ranking updated",
    "讀取 Master League 排行榜中...": "Loading Master League ranking...",
    "即時 Master League 排行榜": "Live Master League ranking",
    "本機 Master League 排行榜": "Local Master League ranking",
    "即時 Master League 排行榜已更新": "Live Master League ranking updated",
    "最多只能派出 4 架機體，請先移除一架。": "You can only deploy 4 mecha. Remove one first.",
    "請選擇 4 架機體出擊。": "Choose 4 mecha before deployment.",
    "載入機體圖像...": "Loading mecha images...",
    "載入獎勵圖像...": "Loading upgrade icons...",
    "載入編隊機體...": "Loading loadout mecha...",
    "載入戰鬥機體...": "Loading battle mecha...",
    "選擇一項強化": "Choose an Upgrade",
    "Eumist: 補習中": "Eumist: Stuck in Revision",
    "MEGA: EK光環停止": "MEGA: EK Aura Offline",
    "守護爆發已展開": "Guardian Burst Online",
    "SEED 突擊發動": "SEED Rush Engaged",
    "幻象修復與護盾已部署": "Phantom Repair and Shields Deployed",
    "全方位齊射": "Omni Volley",
    "挑釁信標展開": "Taunt Beacon Online",
    "MEGA: EK光環啟動": "MEGA: EK Aura Online",
    "穿甲狙擊": "Piercing Snipe",
    "量子背刺": "Quantum Backstab",
    "熱刃旋風": "Thermal Blade Cyclone",
    "美女廚房: 沒有目標": "Beauty Kitchen Disaster: No Target",
    "美女廚房: 有毒食物投餵": "Beauty Kitchen Disaster: Suspicious Food Delivered",
    "再生力場展開": "Regeneration Field Online",
    "重炮壓制": "Cannon Suppression",
    "持續干擾": "Sustained Jammer",
    "重力球: 沒有目標": "Gravity Core: No Target",
    "重力球生成": "Gravity Core Deployed",
    "流星斬": "Meteor Slash",
    "天使光環": "Angel Halo",
    "衛星全炮門": "Satellite Barrage",
    "GN 力場展開": "GN Field Online",
    "EK定律: 沒有目標": "EK Law: No Target",
    "MEGA: EK定律成立": "MEGA: EK Law Confirmed",
    "軌道貫穿": "Orbital Pierce",
    "量子化": "Phase Shift",
    "發脾氣: 全場粗雷射掃射": "Full Tantrum Mode: Rude Laser Sweep",
    "幻象粒子散布": "Mirage Particles Deployed",
    "要塞齊射": "Fortress Salvo",
    "海市蜃樓域": "Mirage Domain",
    "八重霞": "Yaegasumi",
    "朧": "Oboro",
    "MEGA: 迷路中": "MEGA: Completely Lost"
  };
  if (exact[text]) return exact[text];
  let match = text.match(/^Boss 回合 (\d+)$/);
  if (match) return `Boss Wave ${match[1]}`;
  match = text.match(/^第 (\d+) 回合$/);
  if (match) return `Wave ${match[1]}`;
  match = text.match(/^(.+): 攻擊 (.+)$/);
  if (match) return `${localizeName(match[1])}: Attack ${localizeName(match[2])}`;
  match = text.match(/^(.+): 修復 (.+)$/);
  if (match) return `${localizeName(match[1])}: Repair ${localizeName(match[2])}`;
  match = text.match(/^(.+): 協助 (.+)$/);
  if (match) return `${localizeName(match[1])}: Assist ${localizeName(match[2])}`;
  match = text.match(/^(.+): 移動$/);
  if (match) return `${localizeName(match[1])}: Move`;
  match = text.match(/^(.+): 冷卻 (\d+) 秒$/);
  if (match) return `${localizeSkillName(match[1])}: Recharging ${match[2]}s`;
  match = text.match(/^(.+): 能量 (\d+)%$/);
  if (match) return `${localizeSkillName(match[1])}: Charge ${match[2]}%`;
  match = text.match(/^我幫緊你: (.+) (.+)$/);
  if (match) return `I'm Helping, Honest: ${localizeName(match[1])} ${match[2]}`;
  return text;
}

function localizeName(name) {
  return unitEnglish[name]?.name || name;
}

function localizeSkillName(name) {
  const unit = squadSeeds.find((seed) => seed.skill === name || seed.ultimate === name || seed.passive === name);
  if (!unit) return name;
  const localized = localizeUnit(unit);
  if (unit.skill === name) return localized.skill;
  if (unit.ultimate === name) return localized.ultimate;
  return localized.passive || name;
}

function setMessage(text) {
  commandEl.textContent = translateMessage(text);
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
  if (!listEl) return [];
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

function normalizeMasterLeaderboard(rankings = []) {
  const bestByRun = new Map();
  const bestLegacyDuplicate = new Map();
  const entries = rankings
    .filter((entry) => entry && Number.isFinite(Number(entry.score)))
    .map((entry, index) => ({
      runId: typeof entry.runId === "string" ? entry.runId : "",
      playerId: typeof entry.playerId === "string" ? entry.playerId : "",
      name: sanitizePlayerName(entry.name || "Pilot"),
      score: Math.max(0, Math.floor(Number(entry.score) || 0)),
      bandId: entry.bandId || masterBandForScore(Number(entry.score) || 0).id,
      team: Array.isArray(entry.team) ? entry.team.slice(0, 4) : Array.isArray(entry.defense?.squad) ? entry.defense.squad.slice(0, 4) : [],
      submittedAt: typeof entry.submittedAt === "string" ? entry.submittedAt : "",
      order: index
    }));
  entries.forEach((entry) => {
    const key = entry.runId || `${entry.name.toLocaleLowerCase()}|${entry.score}|${entry.bandId}|${entry.team.join("/")}`;
    const bucket = entry.runId ? bestByRun : bestLegacyDuplicate;
    const current = bucket.get(key);
    if (!current || entry.score > current.score || (entry.score === current.score && entry.submittedAt > current.submittedAt)) {
      bucket.set(key, entry);
    }
  });
  return entries
    .filter((entry) => {
      const key = entry.runId || `${entry.name.toLocaleLowerCase()}|${entry.score}|${entry.bandId}|${entry.team.join("/")}`;
      return (entry.runId ? bestByRun : bestLegacyDuplicate).get(key) === entry;
    })
    .sort((a, b) => b.score - a.score || a.submittedAt.localeCompare(b.submittedAt) || a.order - b.order)
    .slice(0, 10);
}

function loadLocalMasterLeaderboard() {
  try {
    const saved = JSON.parse(localStorage.getItem(MASTER_LEAGUE_RANKINGS_KEY) || "[]");
    const merged = normalizeMasterLeaderboard([...saved, ...masterLeagueDefaults]);
    masterLeagueRankings = merged;
    return merged;
  } catch {
    masterLeagueRankings = normalizeMasterLeaderboard(masterLeagueDefaults);
    return masterLeagueRankings;
  }
}

function saveLocalMasterLeaderboard(entry) {
  const next = normalizeMasterLeaderboard([entry, ...masterLeagueRankings, ...loadLocalMasterLeaderboard()]);
  masterLeagueRankings = next;
  localStorage.setItem(MASTER_LEAGUE_RANKINGS_KEY, JSON.stringify(next));
  renderMasterLeaderboards(next, "本機 Master League 排行榜已更新");
  return next;
}

function renderMasterLeaderboardList(listEl, rankings = masterLeagueRankings, highlightScore = null) {
  if (!listEl) return [];
  const normalized = normalizeMasterLeaderboard(rankings.length ? rankings : masterLeagueDefaults);
  listEl.innerHTML = normalized.map((entry, index) => {
    const band = masterLeagueBands.find((item) => item.id === entry.bandId) || masterBandForScore(entry.score);
    return `
      <li class="${highlightScore !== null && entry.score === highlightScore ? "current-score" : ""}">
        <span class="rank-number">${index + 1}</span>
        <strong>${escapeHtml(entry.name)}<small>${masterBandName(band)} / ${escapeHtml(entry.team.join(" / ") || "-")}</small></strong>
        <em>${formatScore(entry.score)}</em>
      </li>
    `;
  }).join("");
  return normalized;
}

function renderMasterLeaderboards(rankings = masterLeagueRankings, message = "") {
  const normalized = normalizeMasterLeaderboard(rankings.length ? rankings : masterLeagueDefaults);
  masterLeagueRankings = normalized;
  renderMasterLeaderboardList(titleMasterLeaderboardListEl, normalized);
  renderMasterLeaderboardList(arenaMasterLeaderboardListEl, normalized, masterLeagueRun?.score ?? null);
  const arenaBoardHead = arenaMasterLeaderboardListEl?.closest(".arena-master-board")?.querySelector(".leaderboard-head h3");
  if (arenaBoardHead) arenaBoardHead.textContent = currentLanguage === "en" ? "Ranking" : "排行榜";
  if (arenaMasterLeaderboardMessageEl) {
    arenaMasterLeaderboardMessageEl.textContent = currentLanguage === "en"
      ? (message ? translateMessage(message) : "Master League Top 10")
      : (message || "Master League Top 10");
  }
}

function setTitleLeaderboardTab(tabName) {
  const isMaster = tabName === "master";
  document.querySelectorAll("[data-title-board]").forEach((button) => {
    const active = button.dataset.titleBoard === tabName;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
  });
  if (titleLeaderboardListEl) titleLeaderboardListEl.hidden = isMaster;
  if (titleMasterLeaderboardListEl) titleMasterLeaderboardListEl.hidden = !isMaster;
  const heading = document.querySelector("#title-leaderboard .leaderboard-head h3");
  if (heading) heading.textContent = isMaster ? (currentLanguage === "en" ? "Master League Ranking" : "Master League Ranking") : t("aceRanking");
  if (titleLeaderboardMessageEl) titleLeaderboardMessageEl.textContent = isMaster
    ? (currentLanguage === "en" ? "Top 10 Arena players, scores and squads." : "Top 10 Arena players, scores and squads.")
    : (currentLanguage === "en" ? "Live leaderboard" : "Live leaderboard");
}

function renderResultLeaderboard(rankings, message = "") {
  renderLeaderboardList(leaderboardListEl, rankings, leaderboardScore);
  leaderboardMessageEl.textContent = translateMessage(message || "輸入姓名後可提交今局分數。");
}

function renderTitleLeaderboard(rankings, message = "") {
  renderLeaderboardList(titleLeaderboardListEl, rankings);
  renderMasterLeaderboards(masterLeagueRankings);
  titleLeaderboardMessageEl.textContent = translateMessage(message || "挑戰最高分數，打入王牌榜。");
}

function renderLeaderboards(rankings, resultMessage = "", titleMessage = "") {
  renderResultLeaderboard(rankings, resultMessage);
  renderTitleLeaderboard(rankings, titleMessage);
}

function updatePauseControls() {
  const arenaPause = battleMode === "arena";
  pauseOverlayEl.hidden = !paused;
  pauseToggleEl.setAttribute("aria-pressed", paused ? "true" : "false");
  pauseToggleEl.setAttribute("aria-label", paused ? (currentLanguage === "en" ? "Resume game" : "繼續遊戲") : (currentLanguage === "en" ? "Pause game" : "暫停遊戲"));
  pauseToggleEl.querySelector(".pause-label").textContent = paused ? (currentLanguage === "en" ? "Resume" : "繼續") : (currentLanguage === "en" ? "Pause" : "暫停");
  if (pauseCopyEl) pauseCopyEl.textContent = arenaPause ? t("arenaPauseCopy") : t("pauseCopy");
  if (pauseFormationEl) pauseFormationEl.hidden = arenaPause;
  pauseOverlayEl?.classList.toggle("arena-pause", arenaPause);
  document.body.classList.toggle("paused-mode", paused);
}

function setPauseButtonVisible(visible) {
  if (battleControlsEl) battleControlsEl.hidden = !visible;
  pauseToggleEl.hidden = !visible;
  if (!visible) {
    paused = false;
    pausedAt = 0;
  }
  updatePauseControls();
  updateAutoBattleControl();
}

function updateAutoBattleControl() {
  if (!autoBattleToggleEl) return;
  autoBattleToggleEl.hidden = battleMode === "arena";
  autoBattleToggleEl.setAttribute("aria-pressed", autoBattleEnabled ? "true" : "false");
  autoBattleToggleEl.querySelector("strong").textContent = autoBattleEnabled ? "ON" : "OFF";
}

function setAutoBattleEnabled(value) {
  autoBattleEnabled = Boolean(value);
  localStorage.setItem(AUTO_BATTLE_KEY, autoBattleEnabled ? "1" : "0");
  updateAutoBattleControl();
  setMessage(autoBattleEnabled ? "Auto Battle ON" : "Auto Battle OFF");
  if (autoBattleEnabled && rewardEl.hidden === false) scheduleAutoRewardPick();
}

function toggleAutoBattle() {
  if (battleMode === "arena") return;
  setAutoBattleEnabled(!autoBattleEnabled);
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
    commandEl.textContent = translateMessage("暫停中");
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
  loadLocalMasterLeaderboard();
  renderMasterLeaderboards(masterLeagueRankings, "讀取 Master League 排行榜中...");
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
  try {
    const response = await fetch(`/api/arena?playerId=${encodeURIComponent(pilotProfile?.playerId || "")}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.rankings) renderMasterLeaderboards(data.rankings, "即時 Master League 排行榜");
  } catch {
    renderMasterLeaderboards(masterLeagueRankings, "本機 Master League 排行榜");
  }
}

async function submitLeaderboard(event) {
  event.preventDefault();
  if (leaderboardSubmitted) {
    leaderboardMessageEl.textContent = translateMessage("今局分數已提交。");
    return;
  }

  const name = sanitizePlayerName(playerNameEl.value);
  playerNameEl.value = name;
  localStorage.setItem("mecha-heart-player-name", name);
  leaderboardMessageEl.textContent = translateMessage("提交分數中...");
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
  if (unit.eumistTutoringTime > 0) {
    setMessage("Eumist: 補習中");
    unit.buttonPulse = 0.25;
    return;
  }
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
  const baseSkillCooldown = unit.name === "MEGA(EK專用機)" ? 0 : (unit.name === "Accipio" ? 12 : 10);
  unit.skillCooldown = baseSkillCooldown <= 0 ? 0 : Math.max(3.5, baseSkillCooldown * (unit.skillCooldownMultiplier || 1) - (unit.skillCooldownFlat || 0));
  ensureBattleStats(unit).skillUses += 1;
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
        ally.hp = clamp(ally.hp + (unit.burstHeal || 56) * healingOutputFactor(unit), 0, ally.maxHp);
        ally.shield = Math.max(ally.shield || 0, shieldValue);
        chargeUltimateByHealing(unit, ally.hp - hpBefore);
      }
    });
    burst(unit.x, unit.y, "#62e6a7", 34);
    addSkillEffect("repair-shield", unit, { radius, color: "#62e6a7", life: 1.2 });
    setMessage("幻象修復與護盾已部署");
  } else if (unit.name === "Accipio") {
    const marks = clearAccipioMarks(unit);
    const healBoost = unit.accipioHealBoost || 1;
    const hotDuration = unit.accipioHotDuration || 6;
    const shieldDuration = unit.accipioShieldDuration || 7;
    squad.forEach((ally) => {
      if (ally.hp <= 0) return;
      const burstHeal = (ally.maxHp * 0.18 + unit.damage * 1.6) * healBoost;
      healAlly(unit, ally, burstHeal, "#62f6b0");
      chargeAccipioXdr(unit, 0.9);
      setAccipioHot(ally, unit, hotDuration);
      if (marks > 0) {
        const shieldBonus = Math.min(8.5, marks * 0.32 * (unit.accipioShieldScale || 1));
        grantAccipioShield(ally, shieldDuration + shieldBonus * 0.12, 0, 0.7);
      }
    });
    if (marks > 0) chargeAccipioXdr(unit, marks * 2.2);
    burst(unit.x, unit.y, "#62f6b0", 58);
    addSkillEffect("accipio-remote", unit, { radius: 168, color: "#62f6b0", life: 0.75 });
    setMessage(marks > 0 ? `IT Remote Support: ${marks} 層標記轉盾` : "IT Remote Support: 全隊修復");
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
    unit.ekDefenseTime = Math.max(unit.ekDefenseTime || 0, 15);
    unit.shield = Math.max(unit.shield || 0, unit.ekAuraShield || 4.5);
    applyEkAura(unit, 0.2);
    burst(unit.x, unit.y, "#48a8ff", 54);
    addSkillEffect("ek-aura", unit, { radius: tauntRange, color: "#48a8ff", life: 1.0 });
    addSkillEffect("ek-defense", unit, { radius: bodyRadius(unit) + 78, color: "#7fe9ff", life: 15, follow: true });
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
      const behindLimit = battleMode === "arena" ? ALLIED_MAX_X : (autoBattleEnabled ? AUTO_CHASE_MAX_X : ALLIED_MAX_X);
      const backstabSide = unit.faction === "Enemy" ? -1 : 1;
      const behindX = clamp(target.x + backstabSide * (bodyRadius(target) + 42), ALLIED_MIN_X, behindLimit);
      const offsetY = target.y > H * 0.5 ? -28 : 28;
      const from = { x: unit.x, y: unit.y };
      unit.x = behindX;
      unit.y = clamp(target.y + offsetY, ALLIED_MIN_Y, ALLIED_MAX_Y);
      unit.target = target.id;
      unit.move = null;
      unit.assistId = null;
      unit.command = "attack";
      unit.postCastHold = 0;
      unit.aim = { x: target.x, y: target.y };
      enemies
        .filter((e) => e.hp > 0 && dist(unit, e) < radius)
        .forEach((e) => hit(e, unit.rushDamage || 96, "#ff9b38", unit.id));
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
      const radius = unit.splashRadius || 138;
      const bossBonus = target.boss ? 1.65 : 1;
      hit(target, (112 + unit.damage + (unit.bastionBonus || 0)) * bossBonus, "#f6c34f", unit.id);
      enemies.filter((e) => e.hp > 0 && e.id !== target.id && dist(e, target) < radius).forEach((e) => hit(e, 46 + Math.floor(unit.damage * 0.65) + Math.floor((unit.bastionBonus || 0) * 0.35), "#f6c34f", unit.id));
      burst(target.x, target.y, "#f6c34f", 56);
      addSkillEffect("impact-grid", unit, { x: target.x, y: target.y, radius, color: "#f6c34f", life: 0.95 });
    }
    holdPositionAfterCast(unit);
    setMessage("重炮壓制");
  } else if (unit.name === "Eumist (Eunice專用機)") {
    activateEumistSkill(unit);
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
  if (unit.eumistTutoringTime > 0) {
    setMessage("Eumist: 補習中");
    unit.buttonPulse = 0.25;
    return;
  }
  const charge = Math.floor(((unit.ultCharge || 0) / (unit.ultMax || 100)) * 100);
  if (charge < 100) {
    setMessage(`${unit.ultimate}: 能量 ${charge}%`);
    unit.buttonPulse = 0.25;
    return;
  }
  unit.ultCharge = 0;
  ensureBattleStats(unit).ultUses += 1;
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

  if (unit.name === "Accipio") {
    const fallen = squad.filter((ally) => ally.id !== unit.id && ally.hp <= 0).sort((a, b) => a.maxHp - b.maxHp)[0];
    if (fallen) {
      fallen.hp = Math.ceil(fallen.maxHp * 0.45);
      grantAccipioShield(fallen, 8, 0);
      setAccipioHot(fallen, unit, 6);
      fallen.regenGlow = Math.max(fallen.regenGlow || 0, 0.85);
      burst(fallen.x, fallen.y, "#62f6b0", 96);
      addSkillEffect("accipio-restore", fallen, { radius: 210, color: "#62f6b0", life: 1.55, follow: true });
      setMessage(`XDR Restore: ${fallen.name} 已還原`);
      return;
    }

    const radius = unit.accipioMirrorRadius || 364;
    const stopDuration = unit.accipioMirrorStopDuration || 3.2;
    squad.forEach((ally) => {
      if (ally.hp <= 0) return;
      grantAccipioShield(ally, 8, 8);
      ally.regenGlow = Math.max(ally.regenGlow || 0, 0.5);
    });
    enemies.filter((enemy) => enemy.hp > 0 && dist(unit, enemy) < radius).forEach((enemy) => {
      if (enemy.boss) {
        enemy.slowTime = Math.max(enemy.slowTime || 0, stopDuration);
        enemy.jamTime = Math.max(enemy.jamTime || 0, stopDuration);
        enemy.fireControlTime = Math.max(enemy.fireControlTime || 0, stopDuration * 0.6);
      } else {
        enemy.accipioStopTime = Math.max(enemy.accipioStopTime || 0, stopDuration);
        enemy.fireControlTime = Math.max(enemy.fireControlTime || 0, stopDuration);
      }
    });
    burst(unit.x, unit.y, "#62f6b0", 104);
    addSkillEffect("accipio-mirror-field", unit, { radius, color: "#62f6b0", life: stopDuration, follow: true });
    setMessage("平鏡止牛: 戰場停止");
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
    const radius = (unit.ekLawRadius || 145) * 1.5;
    unit.invulnerableTime = Math.max(unit.invulnerableTime || 0, 3);
    unit.target = target.id;
    shots.push({ x: unit.x, y: unit.y, tx: target.x, ty: target.y, color: "#48a8ff", life: 1, maxLife: 1, damage: unit.ekLawDamage || (112 + unit.damage), target: target.id, source: unit.id, splashRadius: radius, splashDamage: unit.ekLawSplashDamage || (46 + unit.damage * 0.75) });
    burst(target.x, target.y, "#48a8ff", 58);
    addSkillEffect("ek-law", unit, { x: target.x, y: target.y, radius, color: "#48a8ff", life: 1, follow: false });
    addSkillEffect("ek-invulnerable", unit, { radius: bodyRadius(unit) + 92, color: "#d9fbff", life: 3, follow: true });
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
      if (isBattleOpponent(unit, actor)) hit(actor, 28 + unit.damage * 0.5, "#ff62d6", unit.id);
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
      const radius = unit.ultimateSplashRadius || 177;
      const bossBonus = target.boss ? 1.85 : 1;
      hit(target, (200 + unit.damage * 1.9 + (unit.bastionBonus || 0)) * bossBonus, "#f6c34f", unit.id);
      enemies.filter((e) => e.hp > 0 && e.id !== target.id && dist(e, target) < radius).forEach((e) => hit(e, 88 + unit.damage * 0.85 + (unit.bastionBonus || 0) * 0.35, "#f6c34f", unit.id));
      burst(target.x, target.y, "#f6c34f", 96);
      addSkillEffect("artillery", unit, { x: target.x, y: target.y, radius, color: "#f6c34f", life: 1.15, follow: false });
    }
    holdPositionAfterCast(unit);
    setMessage("要塞齊射");
    return;
  }

  if (unit.name === "Eumist (Eunice專用機)") {
    activateEumistUltimate(unit);
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
  const source = battleActorById(sourceId);
  const hpBefore = target.hp;
  let finalAmount = amount * sourceDamageFactor(source);
  const targetIsOpponent = isBattleOpponent(source, target);
  const sourceIsPlayerSide = source ? battleAlliesFor(source).some((unit) => !unit.arenaDefender && unit.faction === "Allied") : false;
  if (source?.name?.startsWith("Eumist") && targetIsOpponent) {
    finalAmount *= 1 + getEumistMistMarks(target, source) * 0.04;
  }
  target.hp = Math.max(0, target.hp - finalAmount);
  const dealt = hpBefore - target.hp;
  recordBattleDamage(source, target, dealt);
  if (dealt > 0 && source?.name?.startsWith("Eumist") && targetIsOpponent) {
    applyEumistMistMark(source, target);
  }
  if (dealt > 0 && targetIsOpponent && (target.accipioMarks || 0) > 0) {
    triggerAccipioMarkHeal(target, source);
  }
  burst(target.x, target.y, color, 10);
  if (wasAlive && target.hp <= 0) {
    recordBattleKill(source, target);
    if (source?.name !== "Accipio") chargeUltimate(sourceId, target.boss ? 55 : 28);
    if (sourceIsPlayerSide && target.faction === "Enemy") {
      score += target.points || 50;
      if (target.boss) score += wave * 100;
      if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("cosmic-heart-best", String(bestScore));
      }
    }
  }
  return dealt;
}

function chargeUltimateUnit(unit, amount) {
  if (!unit) return;
  unit.ultCharge = clamp((unit.ultCharge || 0) + amount * (unit.ultChargeMultiplier || 1), 0, unit.ultMax || 100);
}

function chargeUltimate(sourceId, amount) {
  const unit = battleActorById(sourceId);
  chargeUltimateUnit(unit, amount);
}

function chargeUltimateByHealing(unit, amount) {
  if (!unit || unit.hp <= 0 || amount <= 0) return;
  chargeUltimateUnit(unit, Math.max(1, amount * 0.42));
}

function chargeUltimateByDamageTaken(unit, amount) {
  if (!unit || (unit.faction !== "Allied" && !unit.arenaDefender) || unit.hp <= 0 || amount <= 0 || unit.name === "Accipio") return;
  const windowNow = now();
  if (!unit.damageUltWindowStart || windowNow - unit.damageUltWindowStart >= 1) {
    unit.damageUltWindowStart = windowNow;
    unit.damageUltWindowCharge = 0;
  }
  const tankRole = /(前衛|重盾|坦機)/.test(unit.role || "");
  const maxPerSecond = tankRole ? 5.6 : 3.8;
  const room = maxPerSecond - (unit.damageUltWindowCharge || 0);
  if (room <= 0) return;
  const pressureBonus = tankRole ? 1.22 : 1;
  const charge = clamp((amount / unit.maxHp) * 36 * pressureBonus, 0.35, 3.4);
  const applied = Math.min(room, charge);
  unit.damageUltWindowCharge = (unit.damageUltWindowCharge || 0) + applied;
  chargeUltimateUnit(unit, applied);
}

function chargeAccipioXdr(unit, amount) {
  if (!unit || unit.name !== "Accipio" || unit.hp <= 0 || amount <= 0) return;
  chargeUltimate(unit.id, amount * 0.85 * (unit.accipioXdrGain || 1));
}

function activeAccipio() {
  return squad.find((unit) => unit.name === "Accipio" && unit.hp > 0) || null;
}

function teamForActor(actor) {
  if (!actor) return [];
  if (squad.some((unit) => unit.id === actor.id)) return squad;
  if (enemies.some((unit) => unit.id === actor.id)) return enemies;
  return actor.faction === "Enemy" ? enemies : squad;
}

function activeAccipioForActor(actor) {
  return teamForActor(actor).find((unit) => unit.name === "Accipio" && unit.hp > 0) || null;
}

function isAccipioRearSupportActive(unit, team = squad) {
  if (!unit || unit.name !== "Accipio" || unit.hp <= 0) return false;
  const enemySide = unit.faction === "Enemy" || unit.arenaDefender;
  return team
    .filter((ally) => ally.hp > 0 && ally.id !== unit.id)
    .every((ally) => enemySide ? unit.x >= ally.x - 8 : unit.x <= ally.x + 8);
}

function addAccipioMark(unit, enemy) {
  if (!unit || !enemy || enemy.hp <= 0 || unit.accipioKneeTime > 0) return;
  enemy.accipioMarks = clamp((enemy.accipioMarks || 0) + 1, 0, 5);
  enemy.accipioMarkTime = 8;
  chargeAccipioXdr(unit, 1.2);
  addSkillEffect("accipio-lock", unit, { tx: enemy.x, ty: enemy.y, radius: bodyRadius(enemy) + 44, color: "#62f6b0", life: 0.48 });
}

function clearAccipioMarks(unit = null) {
  let total = 0;
  const targets = unit ? battleOpponentsFor(unit) : enemies;
  targets.forEach((enemy) => {
    total += enemy.accipioMarks || 0;
    enemy.accipioMarks = 0;
    enemy.accipioMarkTime = 0;
    enemy.accipioMarkHealCooldown = 0;
    enemy.accipioMarkHealCooldowns = {};
  });
  return total;
}

function triggerAccipioMarkHeal(enemy, attacker) {
  const unit = activeAccipioForActor(attacker);
  if (!unit || !enemy || (enemy.accipioMarks || 0) <= 0) return;
  if (!attacker || attacker.hp <= 0) return;
  const attackerTeam = teamForActor(attacker);
  const targetTeam = teamForActor(enemy);
  if (!attackerTeam.length || !targetTeam.length || attackerTeam === targetTeam) return;
  const stamp = now();
  enemy.accipioMarkHealCooldowns = enemy.accipioMarkHealCooldowns || {};
  if ((enemy.accipioMarkHealCooldowns[attacker.id] || 0) > stamp) return;
  enemy.accipioMarkHealCooldowns[attacker.id] = stamp + 0.35;
  const rearBonus = isAccipioRearSupportActive(unit, attackerTeam) ? 1.3 : 1;
  const amount = ((unit.damage * 0.32) + attacker.maxHp * 0.014 * enemy.accipioMarks) * rearBonus * (unit.accipioHealBoost || 1);
  healAlly(unit, attacker, amount, "#62f6b0");
  chargeAccipioXdr(unit, 1.8);
  addSkillEffect("accipio-mark-heal", attacker, { radius: bodyRadius(attacker) + 38, color: "#62f6b0", life: 0.52, follow: true });
}

function setAccipioHot(ally, unit, duration = unit?.accipioHotDuration || 6) {
  if (!ally || ally.hp <= 0 || !unit) return;
  ally.accipioHotTime = Math.max(ally.accipioHotTime || 0, duration);
  ally.accipioHotMax = duration;
  ally.accipioHotSource = unit.id;
  ally.regenGlow = Math.max(ally.regenGlow || 0, 0.45);
}

function grantAccipioShield(ally, duration, protection = 0, radiusScale = 0.82) {
  if (!ally || ally.hp <= 0) return;
  ally.shield = Math.max(ally.shield || 0, duration);
  ally.accipioShieldTime = Math.max(ally.accipioShieldTime || 0, duration);
  ally.accipioProtectionTime = Math.max(ally.accipioProtectionTime || 0, protection);
  ally.accipioShieldRadiusScale = radiusScale;
}

function updateAccipioMarks(dt) {
  [squad, enemies].forEach((group) => {
    group.forEach((unit) => {
      unit.accipioMarkTime = Math.max(0, (unit.accipioMarkTime || 0) - dt);
      if (unit.accipioMarkTime <= 0) unit.accipioMarks = 0;
    });
  });
}

function updateAccipioHot(dt) {
  [squad, enemies].forEach((group) => {
    group.forEach((ally) => {
      ally.accipioHotTime = Math.max(0, (ally.accipioHotTime || 0) - dt);
      ally.accipioShieldTime = Math.max(0, (ally.accipioShieldTime || 0) - dt);
      ally.accipioProtectionTime = Math.max(0, (ally.accipioProtectionTime || 0) - dt);
      if (ally.accipioShieldTime <= 0 && ally.accipioProtectionTime <= 0) ally.accipioShieldRadiusScale = 1;
      if (ally.hp <= 0 || ally.accipioHotTime <= 0) return;
      const unit = group.find((source) => source.id === ally.accipioHotSource && source.hp > 0);
      if (!unit) return;
      const lowHpBoost = ally.hp / ally.maxHp < 0.45 ? 1.6 : 1;
      const amount = (ally.maxHp * 0.032 + unit.damage * 0.35) * lowHpBoost * (unit.accipioHealBoost || 1) * dt;
      const healed = healAlly(unit, ally, amount, "#62f6b0");
      if (healed > 0) chargeAccipioXdr(unit, 0.45 * dt);
    });
  });
}

function updateAccipioPassive(unit, dt) {
  if (!unit || unit.name !== "Accipio" || unit.hp <= 0) return;
  unit.accipioKneeTime = Math.max(0, (unit.accipioKneeTime || 0) - dt);
  if (unit.accipioKneeTime > 0) return;
  unit.accipioPassiveCooldown = Math.max(0, (unit.accipioPassiveCooldown || 0) - dt);
  if (unit.accipioPassiveCooldown > 0) return;
  unit.accipioPassiveCooldown = 12 + Math.random() * 6;
  if (Math.random() < 0.5) {
    squad.forEach((ally) => {
      if (ally.hp <= 0) return;
      ally.accipioCommandTime = 5;
      ally.shield = Math.max(ally.shield || 0, 3);
      ally.regenGlow = Math.max(ally.regenGlow || 0, 0.3);
    });
    burst(unit.x, unit.y, "#62f6b0", 34);
    addSkillEffect("accipio-command", unit, { radius: 260, color: "#62f6b0", life: 1.1 });
    setMessage("Accipio: 後方戰術指揮");
    return;
  }
  unit.accipioKneeTime = 5;
  unit.cooldown = Math.max(unit.cooldown || 0, 5);
  clearAccipioMarks(unit);
  burst(unit.x, unit.y, "#ff5b66", 18);
  addSkillEffect("accipio-knee", unit, { radius: bodyRadius(unit) + 52, color: "#ff5b66", life: 5, follow: true });
  setMessage("Accipio: 膝患復發");
}

function lowestHpAlly() {
  return squad
    .filter((ally) => ally.hp > 0 && ally.hp < ally.maxHp)
    .sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0] || null;
}

function healAlly(source, ally, amount, color = "#66f2e4") {
  if (!source || !ally || ally.hp <= 0 || amount <= 0) return 0;
  const finalAmount = amount * healingOutputFactor(source);
  const hpBefore = ally.hp;
  ally.hp = clamp(ally.hp + finalAmount, 0, ally.maxHp);
  const healed = ally.hp - hpBefore;
  if (healed > 0) {
    recordBattleHealing(source, healed);
    ally.regenGlow = Math.max(ally.regenGlow || 0, 0.45);
    if (source.name !== "Accipio") chargeUltimateByHealing(source, healed);
    addSkillEffect(source.name === "Accipio" ? "accipio-heal" : "mist-heal", ally, { radius: bodyRadius(ally) + (source.name === "Accipio" ? 14 : 34), color, life: source.name === "Accipio" ? 0.36 : 0.55, follow: true });
  }
  return healed;
}

function healSquad(source, amount, color = "#66f2e4") {
  if (!source || amount <= 0) return 0;
  return squad.reduce((total, ally) => total + healAlly(source, ally, amount, color), 0);
}

function getEumistMistMarks(target, source) {
  return Math.max(0, target?.eumistMistMarks?.[source?.id] || 0);
}

function applyEumistMistMark(source, target) {
  target.eumistMistMarks = target.eumistMistMarks || {};
  const next = getEumistMistMarks(target, source) + 1;
  if (next < 5) {
    target.eumistMistMarks[source.id] = next;
    return;
  }
  target.eumistMistMarks[source.id] = 0;
  const heal = source.damage * 0.6 * (source.eumistBurstHealMultiplier || 1);
  healSquad(source, heal, "#66f2e4");
  healAlly(source, lowestHpAlly(), heal, "#dffcff");
  burst(target.x, target.y, "#66f2e4", 22);
  addSkillEffect("mist-bloom", null, { x: target.x, y: target.y, radius: bodyRadius(target) + 72, color: "#66f2e4", life: 0.82, follow: false });
}

function performEumistBasicHeal(unit) {
  const ally = lowestHpAlly();
  if (!ally) return;
  const lowHpBonus = ally.hp / ally.maxHp < 0.4 ? 1.3 : 1;
  healAlly(unit, ally, unit.damage * 0.3 * lowHpBonus);
}

function activateEumistSkill(unit) {
  const radius = unit.eumistSkillRadius || 218;
  const targets = enemies.filter((enemy) => enemy.hp > 0 && dist(unit, enemy) < radius + bodyRadius(enemy) * 0.45);
  let totalDamage = 0;
  targets.forEach((enemy) => { totalDamage += hit(enemy, unit.damage * 1.65, "#66f2e4", unit.id) || 0; });
  const teamHeal = Math.min(totalDamage * 0.18, unit.damage * 1.75) * (unit.eumistBurstHealMultiplier || 1);
  healSquad(unit, teamHeal);
  healAlly(unit, lowestHpAlly(), unit.damage * 0.8 * (unit.eumistBurstHealMultiplier || 1), "#dffcff");
  burst(unit.x, unit.y, "#66f2e4", 48);
  addSkillEffect("eumist-blades", unit, { radius, color: "#66f2e4", life: 1.0, follow: true });
  holdPositionAfterCast(unit);
  setMessage("八重霞");
}

function activateEumistUltimate(unit) {
  let totalDamage = 0;
  enemies.filter((enemy) => enemy.hp > 0).forEach((enemy) => {
    totalDamage += hit(enemy, unit.damage * 3.2, "#66f2e4", unit.id) || 0;
  });
  const teamHeal = Math.min(totalDamage * 0.22, unit.damage * 3.0) * (unit.eumistBurstHealMultiplier || 1);
  healSquad(unit, teamHeal);
  healAlly(unit, lowestHpAlly(), unit.damage * 1.8 * (unit.eumistBurstHealMultiplier || 1), "#dffcff");
  squad.forEach((ally) => {
    if (ally.hp <= 0) return;
    ally.eumistVeilTime = Math.max(ally.eumistVeilTime || 0, 6);
    ally.eumistVeilReduction = Math.max(ally.eumistVeilReduction || 0, 0.12);
  });
  burst(unit.x, unit.y, "#66f2e4", 92);
  addSkillEffect("eumist-oboro", unit, { x: W * 0.5, y: H * 0.5, radius: W * 0.55, color: "#66f2e4", life: 1.25, follow: false });
  setMessage("朧");
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
  if (unit?.accipioCommandTime > 0) factor *= 1.18;
  return factor;
}

function healingOutputFactor(unit) {
  return unit?.seedAwakenTime > 0 ? 1.35 : 1;
}

function himawariDefenseFactor(unit) {
  const status = unit?.himawariStatus;
  if (!status || status.life <= 0) return 1;
  if (status.kind === "def-up") return 0.2;
  if (status.kind === "def-down") return 1.8;
  return 1;
}

function unitDefenseFactor(unit) {
  if (unit?.invulnerableTime > 0) return 0;
  let factor = 1 - clamp(unit?.damageReduction || 0, 0, 0.45);
  if (unit?.ekDefenseTime > 0) factor *= 0.5;
  if (unit?.eumistVeilTime > 0) factor *= 1 - clamp(unit.eumistVeilReduction || 0.12, 0, 0.3);
  if (unit?.seedAwakenTime > 0) factor *= 0.65;
  if (unit?.accipioCommandTime > 0) factor *= 0.82;
  if (unit?.accipioProtectionTime > 0) factor *= 0.65;
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
  const displayStatus = localizeStatus(status);
  target.buttonPulse = 0.25;
  burst(target.x, target.y, status.color, 18);
  addSkillEffect("himawari-status", target, { radius: 76, color: status.color, life: 5, follow: true, buff: status.buff, label: displayStatus.shortLabel });
  setMessage(`我幫緊你: ${target.name} ${displayStatus.label}`);
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
      const source = battleActorById(effect.source);
      if (effect.source && (!source || source.hp <= 0)) {
        effect.life = 0;
        return;
      }
      const target = battleOpponentsFor(source).find((enemy) => enemy.id === effect.targetId && enemy.hp > 0);
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
  return unit?.name === "Nova" && unit.quantumTime > 0 ? 3.6 : 1;
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
  addSkillEffect("meteor-deploy", unit, { radius: bodyRadius(unit) + 86, color: "#ffd166", life: 0.72, follow: true });
  addSkillEffect("meteor-strike", null, { x: target.x, y: target.y, radius, color: "#ffd166", life: 0.82, follow: false, rotation: Math.atan2(target.y - unit.y, target.x - unit.x) });
}

function applyHelixRegen(unit, dt) {
  const radius = unit.regenRadius || 260;
  const healPerSecond = unit.regenRate || 13;
  squad.forEach((ally) => {
    if (ally.hp <= 0 || dist(unit, ally) > radius) return;
    const hpBefore = ally.hp;
    ally.hp = clamp(ally.hp + healPerSecond * healingOutputFactor(unit) * dt, 1, ally.maxHp);
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
      const source = battleActorById(effect.source);
      if (effect.source && (!source || source.hp <= 0)) {
        effect.life = 0;
        return;
      }
      effect.tick = (effect.tick || 0) + dt;
      battleOpponentsFor(source)
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
  unit.hp = clamp(unit.hp + (unit.guardianRegenRate || 5) * healingOutputFactor(unit) * dt, 1, unit.maxHp);
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

function battleActorAlive(sourceId) {
  return !sourceId || [...squad, ...enemies].some((actor) => actor.id === sourceId && actor.hp > 0);
}

function battleActorById(sourceId) {
  return [...squad, ...enemies].find((actor) => actor.id === sourceId) || null;
}

function battleAlliesFor(actor) {
  if (!actor) return squad;
  if (squad.includes(actor)) return squad;
  if (enemies.includes(actor)) return enemies;
  return actor.arenaDefender ? enemies : squad;
}

function battleOpponentsFor(actor) {
  return battleAlliesFor(actor) === squad ? enemies : squad;
}

function isBattleOpponent(source, target) {
  if (!source || !target) return false;
  return battleOpponentsFor(source).some((unit) => unit.id === target.id);
}

function updateGravityFields(dt) {
  gravityFields.forEach((field) => {
    const source = battleActorById(field.source);
    if (field.source && (!source || source.hp <= 0)) {
      field.life = 0;
      return;
    }
    field.life -= dt;
    battleOpponentsFor(source)
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

function livingAutoTargets() {
  return enemies.filter((enemy) => enemy.hp > 0 && (enemy.boss || enemy.x <= W + bodyRadius(enemy)));
}

function arenaUnitRole(unit) {
  const roleText = `${unit?.role || ""} ${unit?.name || ""}`;
  if ((unit?.damage || 0) < 0 || /修復|治癒|補|Accipio|Eumist|repair|heal|recovery/i.test(roleText)) return "healer";
  if ((unit?.maxHp || 0) >= 165 || /坦|前衛|重盾|重裝|防線|tank|shield|front/i.test(roleText)) return "tank";
  return "attacker";
}

function arenaUnitsByRole(units, role) {
  return units.filter((unit) => unit.hp > 0 && arenaUnitRole(unit) === role);
}

function arenaFocusTarget(unit, living, role) {
  const candidates = arenaUnitsByRole(living, role);
  const pool = candidates.length ? candidates : living;
  return [...pool].sort((a, b) => {
    if (role === "tank") return b.maxHp - a.maxHp || weaponDistance(unit, a) - weaponDistance(unit, b);
    if (role === "healer") return (a.hp / a.maxHp) - (b.hp / b.maxHp) || weaponDistance(unit, a) - weaponDistance(unit, b);
    return Math.max(1, b.damage || 0) - Math.max(1, a.damage || 0) || (a.hp / a.maxHp) - (b.hp / b.maxHp) || weaponDistance(unit, a) - weaponDistance(unit, b);
  })[0] || null;
}

function arenaProtectedAllies(unit, role = "healer") {
  const roleAllies = arenaUnitsByRole(squad, role).filter((ally) => ally.id !== unit.id);
  const pool = roleAllies.length ? roleAllies : squad.filter((ally) => ally.hp > 0 && ally.id !== unit.id);
  return squad
    .filter((ally) => pool.includes(ally))
    .sort((a, b) => {
      const hurtA = a.hp / a.maxHp;
      const hurtB = b.hp / b.maxHp;
      const pressureA = enemyPressureOn(a) ? -0.4 : 0;
      const pressureB = enemyPressureOn(b) ? -0.4 : 0;
      return hurtA + pressureA - (hurtB + pressureB);
    });
}

function arenaPressureScore(unit, enemy, protectedAllies) {
  const crossedLine = unit.faction === "Enemy" ? enemy.x > W * 0.42 : enemy.x < W * 0.58;
  const anchor = protectedAllies[0] || unit;
  const anchorDistance = dist(enemy, anchor);
  const alliedPressure = protectedAllies.some((ally) => dist(enemy, ally) < enemy.range + bodyRadius(ally) + 86);
  return (crossedLine ? -520 : 0) + (alliedPressure ? -360 : 0) + anchorDistance + weaponDistance(unit, enemy) * 0.28;
}

function chooseArenaAiTarget(unit) {
  if (unit.damage < 0) return acquireTarget(unit, true);
  const living = livingAutoTargets();
  if (!living.length) return null;
  const ai = normalizeArenaAiId(unit.arenaAi);
  if (ai === "focus-tank") return arenaFocusTarget(unit, living, "tank");
  if (ai === "focus-attacker") return arenaFocusTarget(unit, living, "attacker");
  if (ai === "focus-healer") return arenaFocusTarget(unit, living, "healer");
  if (ai.startsWith("guard-")) {
    const protectedAllies = arenaProtectedAllies(unit, ai.replace("guard-", ""));
    return [...living].sort((a, b) => arenaPressureScore(unit, a, protectedAllies) - arenaPressureScore(unit, b, protectedAllies))[0];
  }
  if (ai === "frontline") {
    return [...living].sort((a, b) => weaponDistance(unit, a) - weaponDistance(unit, b) || b.hp - a.hp)[0];
  }
  if (ai === "skirmish") {
    return [...living].sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp) || weaponDistance(unit, b) - weaponDistance(unit, a))[0];
  }
  const leader = squad.find((ally) => ally.hp > 0 && ally.id !== unit.id && ally.target);
  const shared = leader ? living.find((enemy) => enemy.id === leader.target) : null;
  return shared || [...living].sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp) || weaponDistance(unit, a) - weaponDistance(unit, b))[0];
}

function chooseAutoTarget(unit) {
  if (battleMode === "arena" && unit.arenaAi) return chooseArenaAiTarget(unit);
  if (unit.damage < 0) return acquireTarget(unit, true);
  return livingAutoTargets()
    .sort((a, b) => (b.boss ? 1 : 0) - (a.boss ? 1 : 0) || weaponDistance(unit, a) - weaponDistance(unit, b) || a.hp - b.hp)[0] || null;
}

function arenaAiAnchor(unit, target) {
  if (battleMode !== "arena" || !target || unit.damage <= 0) return null;
  const ai = normalizeArenaAiId(unit.arenaAi);
  const enemySide = unit.faction === "Enemy";
  const safeX = enemySide ? W - 105 : 105;
  const forwardX = enemySide ? W * 0.62 : W * 0.38;
  if (ai === "skirmish" && (unit.hp / unit.maxHp < 0.72 || weaponDistance(unit, target) < unit.range * 0.58)) {
    return {
      x: clamp(safeX, ALLIED_MIN_X, ALLIED_MAX_X),
      y: clamp(unit.y + (unit.y >= target.y ? 62 : -62), ALLIED_MIN_Y, ALLIED_MAX_Y)
    };
  }
  if (ai.startsWith("guard-")) {
    const anchor = arenaProtectedAllies(unit, ai.replace("guard-", ""))[0];
    if (anchor && dist(unit, anchor) > Math.max(82, unit.range * 0.42)) {
      const threatDistance = dist(target, anchor);
      const threatReach = (target.range || 0) + bodyRadius(anchor) + 140;
      const crossedLine = unit.faction === "Enemy" ? target.x > W * 0.42 : target.x < W * 0.58;
      const targetInRange = weaponDistance(unit, target) <= unit.range * 0.96;
      const activeThreat = threatDistance <= threatReach || crossedLine || enemyPressureOn(anchor);
      if (!activeThreat || targetInRange) return null;
      return {
        x: clamp(anchor.x + (enemySide ? -52 : 52), ALLIED_MIN_X, ALLIED_MAX_X),
        y: clamp(anchor.y + (unit.y >= anchor.y ? 38 : -38), ALLIED_MIN_Y, ALLIED_MAX_Y)
      };
    }
  }
  if (ai === "frontline" && weaponDistance(unit, target) > Math.max(18, Math.min(unit.range * 0.46, 82))) {
    const approach = bodyRadius(target) + bodyRadius(unit) + (unit.name === "MEGA(EK專用機)" ? 16 : Math.max(28, unit.range * 0.32));
    return {
      x: clamp(enemySide ? Math.min(target.x + approach, forwardX) : Math.max(target.x - approach, forwardX), ALLIED_MIN_X, ALLIED_MAX_X),
      y: clamp(target.y, ALLIED_MIN_Y, ALLIED_MAX_Y)
    };
  }
  return null;
}

function supportSkillRadius(unit) {
  if (!unit || unit.hp <= 0) return 0;
  if (unit.name === "Asterion") return 230;
  if (unit.name === "Seraphim") return Math.max(300, unit.range + 80);
  if (unit.name === "Helix") return unit.regenRadius || 260;
  if (unit.name === "Valkyr") return unit.gnFieldRadius || 170;
  return 0;
}

function enemyPressureOn(unit) {
  return enemies
    .filter((enemy) => enemy.hp > 0)
    .sort((a, b) => dist(unit, a) - dist(unit, b))
    .find((enemy) => dist(unit, enemy) <= enemy.range + bodyRadius(unit) * 0.35) || null;
}

function autoSupportAnchor(unit) {
  const radius = supportSkillRadius(unit);
  if (!radius || unit.skillCooldown > 0) return null;
  const needsHelp = squad.filter((ally) => ally.hp > 0 && (
    ally.hp / ally.maxHp < 0.82 ||
    enemyPressureOn(ally) ||
    ally.id === unit.id
  ));
  if (needsHelp.length < 2) return null;
  const center = needsHelp.reduce((point, ally) => {
    point.x += ally.x;
    point.y += ally.y;
    return point;
  }, { x: 0, y: 0 });
  center.x /= needsHelp.length;
  center.y /= needsHelp.length;
  const anchor = {
    x: clamp(center.x, ALLIED_MIN_X, battleMode === "arena" ? ALLIED_MAX_X : AUTO_CHASE_MAX_X),
    y: clamp(center.y, ALLIED_MIN_Y, ALLIED_MAX_Y)
  };
  const covered = needsHelp.filter((ally) => dist(anchor, ally) <= radius * 0.92).length;
  if (covered < Math.min(2, needsHelp.length)) return null;
  return dist(unit, anchor) > Math.max(20, radius * 0.18) ? anchor : null;
}

function autoAllySkillAnchor(unit) {
  if (unit.hp / unit.maxHp > 0.62 && !enemyPressureOn(unit)) return null;
  const providers = squad
    .filter((ally) => ally.hp > 0 && ally.id !== unit.id && supportSkillRadius(ally) > 0 && (ally.skillCooldown <= 1.2 || ally.regenAuraTime > 0 || ally.guardianRegenTime > 0 || ally.gnFieldTime > 0))
    .sort((a, b) => {
      const aReady = a.skillCooldown <= 0 ? -80 : 0;
      const bReady = b.skillCooldown <= 0 ? -80 : 0;
      return dist(unit, a) + aReady - (dist(unit, b) + bReady);
    });
  const provider = providers[0];
  if (!provider) return null;
  const radius = supportSkillRadius(provider) * 0.78;
  if (dist(unit, provider) <= radius) return null;
  const sideOffset = battleMode === "arena" && unit.faction === "Enemy" ? 28 : -28;
  return {
    x: clamp(provider.x + sideOffset, ALLIED_MIN_X, battleMode === "arena" ? ALLIED_MAX_X : AUTO_CHASE_MAX_X),
    y: clamp(provider.y + (unit.y >= provider.y ? 34 : -34), ALLIED_MIN_Y, ALLIED_MAX_Y)
  };
}

function autoLureAnchor(unit, target) {
  if (!target || unit.damage <= 0) return null;
  if (battleMode === "arena") return null;
  const targetOutsideBoundary = target.x > AUTO_CHASE_MAX_X - bodyRadius(target) * 0.25;
  if (!targetOutsideBoundary) return null;
  const desiredX = clamp(target.x - target.range - bodyRadius(unit) - 36, ALLIED_MIN_X, AUTO_CHASE_MAX_X - 18);
  const desiredY = clamp(target.y + (unit.y > target.y ? 42 : -42), ALLIED_MIN_Y, ALLIED_MAX_Y);
  if (Math.abs(unit.x - desiredX) < 10 && Math.abs(unit.y - desiredY) < 10) return null;
  return { x: desiredX, y: desiredY };
}

function offensiveSkillRadius(unit) {
  if (!unit || unit.skillCooldown > 0) return 0;
  if (unit.name === "Caliburn") return unit.rushRadius || 220;
  if (unit.name.startsWith("Eumist")) return unit.eumistSkillRadius || 218;
  if (unit.name.startsWith("MEGA")) return unit.ekAuraRange || 235;
  if (unit.name === "Valkyr") return unit.valkyrTauntRange || 315;
  if (unit.name === "Mirage") return unit.jamRadius || 270;
  return 0;
}

function ultimateSkillRadius(unit) {
  if (!unit || (unit.ultCharge || 0) < (unit.ultMax || 100)) return 0;
  if (unit.name === "Valkyr") return unit.gnFieldRadius || 170;
  if (unit.name === "Mirage") return unit.mirageDomainRadius || 294;
  if (unit.name.startsWith("Himawari")) return unit.himawariTantrumRadius || 205;
  if (unit.name === "Caliburn") return 245;
  return 0;
}

function targetsInRadius(point, radius) {
  return enemies.filter((enemy) => enemy.hp > 0 && dist(point, enemy) <= radius + bodyRadius(enemy) * 0.45);
}

function bestOffensiveSkillAnchor(unit) {
  const radius = offensiveSkillRadius(unit);
  if (!radius) return null;
  const liveTargets = enemies.filter((enemy) => enemy.hp > 0);
  if (!liveTargets.length) return null;
  const currentHits = targetsInRadius(unit, radius).length;
  let best = { point: null, hits: currentHits };
  liveTargets.forEach((target) => {
    const cluster = liveTargets.filter((enemy) => dist(target, enemy) <= radius * 0.86 + bodyRadius(enemy) * 0.35);
    const center = cluster.reduce((point, enemy) => {
      point.x += enemy.x;
      point.y += enemy.y;
      return point;
    }, { x: 0, y: 0 });
    center.x /= cluster.length;
    center.y /= cluster.length;
    const point = {
      x: clamp(center.x, ALLIED_MIN_X, ALLIED_MAX_X),
      y: clamp(center.y, ALLIED_MIN_Y, ALLIED_MAX_Y)
    };
    if (cluster.length > best.hits || (cluster.length === best.hits && best.point && dist(unit, point) < dist(unit, best.point))) {
      best = { point, hits: cluster.length };
    }
  });
  const desiredHits = Math.max(1, best.hits);
  if (!best.point || currentHits >= desiredHits) return null;
  return dist(unit, best.point) > Math.max(18, radius * 0.16) ? best.point : null;
}

function bestUltimateSkillAnchor(unit) {
  const radius = ultimateSkillRadius(unit);
  if (!radius) return null;
  const liveTargets = enemies.filter((enemy) => enemy.hp > 0);
  if (liveTargets.length < 2) return null;
  const currentHits = targetsInRadius(unit, radius).length;
  let best = { point: null, hits: currentHits };
  liveTargets.forEach((target) => {
    const cluster = liveTargets.filter((enemy) => dist(target, enemy) <= radius * 0.9 + bodyRadius(enemy) * 0.35);
    const center = cluster.reduce((point, enemy) => {
      point.x += enemy.x;
      point.y += enemy.y;
      return point;
    }, { x: 0, y: 0 });
    center.x /= cluster.length;
    center.y /= cluster.length;
    const point = {
      x: clamp(center.x, ALLIED_MIN_X, ALLIED_MAX_X),
      y: clamp(center.y, ALLIED_MIN_Y, ALLIED_MAX_Y)
    };
    if (cluster.length > best.hits || (cluster.length === best.hits && best.point && dist(unit, point) < dist(unit, best.point))) {
      best = { point, hits: cluster.length };
    }
  });
  if (!best.point || currentHits >= best.hits) return null;
  return dist(unit, best.point) > Math.max(18, radius * 0.16) ? best.point : null;
}

function shouldAutoUseActive(unit) {
  if (!unit || unit.hp <= 0 || unit.skillCooldown > 0 || !enemies.some((enemy) => enemy.hp > 0)) return false;
  if (unit.ekAuraActive) return false;
  if (unit.damage < 0 || unit.name === "Seraphim" || unit.name === "Helix" || unit.name === "Accipio") {
    return squad.some((ally) => ally.hp > 0 && ally.hp / ally.maxHp < 0.82);
  }
  const radius = offensiveSkillRadius(unit);
  if (radius) return targetsInRadius(unit, radius).length > 0;
  if (unit.name === "Nova") return Boolean(chooseAutoTarget(unit));
  return true;
}

function shouldAutoUseUltimate(unit) {
  if (!unit || unit.hp <= 0 || (unit.ultCharge || 0) < (unit.ultMax || 100)) return false;
  const liveEnemies = enemies.filter((enemy) => enemy.hp > 0);
  if (!liveEnemies.length) return false;
  const bossAlive = liveEnemies.some((enemy) => enemy.boss);
  const enemyClustered = liveEnemies.length >= 6;
  const squadInDanger = squad.some((ally) => ally.hp > 0 && ally.hp / ally.maxHp <= 0.38);
  if (battleMode === "arena") return liveEnemies.length >= 2 || squadInDanger || Boolean(chooseAutoTarget(unit));
  return bossAlive || enemyClustered || squadInDanger;
}

function updateAutoBattle() {
  if (!autoBattleEnabled || rewardEl.hidden === false || resultEl.hidden === false || arenaResultEl.hidden === false) return;
  squad.forEach((unit) => {
    if (unit.hp <= 0) return;
    const target = chooseAutoTarget(unit);
    const ai = battleMode === "arena" ? normalizeArenaAiId(unit.arenaAi) : "";
    if (target && ai === "frontline") {
      const arenaAnchor = arenaAiAnchor(unit, target);
      const skillAnchor = arenaAnchor ? null : (bestOffensiveSkillAnchor(unit) || bestUltimateSkillAnchor(unit));
      unit.target = target.id;
      unit.move = arenaAnchor || skillAnchor || null;
      unit.assistId = null;
      unit.command = (arenaAnchor || skillAnchor) ? "move" : (unit.damage < 0 ? "support" : "attack");
      if (skillAnchor) return;
      if (shouldAutoUseActive(unit)) activateSkill(unit);
      if (shouldAutoUseUltimate(unit)) useUltimate(unit);
      return;
    }
    const allySkillAnchor = autoAllySkillAnchor(unit);
    if (allySkillAnchor) {
      unit.target = null;
      unit.move = allySkillAnchor;
      unit.assistId = null;
      unit.command = "move";
      return;
    }
    const ownSupportAnchor = autoSupportAnchor(unit);
    if (ownSupportAnchor) {
      unit.target = null;
      unit.move = ownSupportAnchor;
      unit.assistId = null;
      unit.command = "move";
      return;
    }
    if (target) {
      const arenaAnchor = arenaAiAnchor(unit, target);
      if (arenaAnchor) {
        unit.target = target.id;
        unit.move = arenaAnchor;
        unit.assistId = null;
        unit.command = "move";
        return;
      }
      const skillAnchor = bestOffensiveSkillAnchor(unit) || bestUltimateSkillAnchor(unit);
      if (skillAnchor) {
        unit.target = target.id;
        unit.move = skillAnchor;
        unit.assistId = null;
        unit.command = "move";
        return;
      }
      const lureAnchor = autoLureAnchor(unit, target);
      if (lureAnchor) {
        unit.target = null;
        unit.move = lureAnchor;
        unit.assistId = null;
        unit.command = "move";
        return;
      }
      unit.target = target.id;
      unit.move = null;
      unit.assistId = null;
      unit.command = unit.damage < 0 ? "support" : "attack";
    }
    if (shouldAutoUseActive(unit)) activateSkill(unit);
    if (shouldAutoUseUltimate(unit)) useUltimate(unit);
  });
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
  unit.ewarSlowTime = Math.max(0, (unit.ewarSlowTime || 0) - dt);
  unit.stealthTime = Math.max(0, (unit.stealthTime || 0) - dt);
  unit.regenAuraTime = Math.max(0, (unit.regenAuraTime || 0) - dt);
  unit.regenGlow = Math.max(0, (unit.regenGlow || 0) - dt);
  unit.guardianRegenTime = Math.max(0, (unit.guardianRegenTime || 0) - dt);
  unit.gnFieldTime = Math.max(0, (unit.gnFieldTime || 0) - dt);
  unit.ekDefenseTime = Math.max(0, (unit.ekDefenseTime || 0) - dt);
  unit.invulnerableTime = Math.max(0, (unit.invulnerableTime || 0) - dt);
  unit.eumistVeilTime = Math.max(0, (unit.eumistVeilTime || 0) - dt);
  unit.mirageAuraTime = Math.max(0, (unit.mirageAuraTime || 0) - dt);
  unit.quantumTime = Math.max(0, (unit.quantumTime || 0) - dt);
  unit.accipioCommandTime = Math.max(0, (unit.accipioCommandTime || 0) - dt);
  unit.seedAwakenTime = Math.max(0, (unit.seedAwakenTime || 0) - dt);
  if (unit.seedProtocol) {
    if (unit.hp > unit.maxHp * 0.4) unit.seedAwakenArmed = true;
    if (unit.seedAwakenArmed !== false && unit.hp <= unit.maxHp * 0.4) {
      unit.seedAwakenArmed = false;
      unit.seedAwakenTime = 10;
      unit.buttonPulse = 0.5;
      burst(unit.x, unit.y, "#ff3d54", 38);
      addSkillEffect("seed-awaken", unit, { radius: bodyRadius(unit) + 78, color: "#ff3d54", life: 1.2, follow: true });
    }
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
  if (unit.name === "Eumist (Eunice專用機)") {
    unit.eumistTutoringTime = Math.max(0, (unit.eumistTutoringTime || 0) - dt);
    if (unit.eumistTutoringTime > 0) {
      unit.target = null;
      unit.move = null;
      unit.aim = null;
      return;
    }
    unit.eumistTutoringCooldown = Math.max(0, (unit.eumistTutoringCooldown || 0) - dt);
    if (unit.eumistTutoringCooldown <= 0) {
      unit.eumistTutoringTime = 3;
      unit.eumistTutoringCooldown = (unit.eumistTutoringMin || 7) + Math.random() * (unit.eumistTutoringRange || 23);
      unit.cooldown = Math.max(unit.cooldown || 0, 3);
      unit.buttonPulse = 0.35;
      burst(unit.x, unit.y, "#66f2e4", 16);
      addSkillEffect("tutoring", unit, { radius: bodyRadius(unit) + 42, color: "#66f2e4", life: 3.0, follow: true });
      setMessage("Eumist: 補習中");
      return;
    }
  }
  if (unit.name === "Accipio") {
    updateAccipioPassive(unit, dt);
    if (unit.accipioKneeTime > 0) {
      unit.target = null;
      unit.move = null;
      unit.aim = null;
      return;
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
  const ewarSlowFactor = unit.ewarSlowTime > 0 ? 0.8 : 1;
  const moveSpeed = unit.speed * (unit.speedBoost > 0 ? 1.34 : 1) * quantumMoveBoost * seedMoveBoost * ewarSlowFactor * himawariSpeedFactor(unit);

  if (unit.name === "MEGA(EK專用機)") {
    unit.lostTime = Math.max(0, (unit.lostTime || 0) - dt);
    unit.lostCooldown = Math.max(0, (unit.lostCooldown || 0) - dt);
    unit.lostRetarget = Math.max(0, (unit.lostRetarget || 0) - dt);
    if (unit.lostTime <= 0 && unit.lostCooldown <= 0 && !(battleMode === "arena" && normalizeArenaAiId(unit.arenaAi) === "frontline")) {
      unit.lostTime = 3;
      unit.lostCooldown = 10 + Math.random() * 12;
      unit.lostRetarget = 0;
      unit.target = null;
      unit.move = null;
      unit.command = "idle";
      addSkillEffect("lost", unit, { radius: 94, color: "#ff3d54", life: 3, follow: true });
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
        target.hp = clamp(target.hp + (-unit.damage * healingOutputFactor(unit)), 0, target.maxHp);
        const healed = target.hp - hpBefore;
        recordBattleHealing(unit, healed);
        chargeUltimateByHealing(unit, healed);
        shots.push({ x: unit.x, y: unit.y, tx: target.x, ty: target.y, color: unit.color, life: 0.42, maxLife: 0.42, heal: true, source: unit.id });
      }
      return;
    }

    const d = weaponDistance(unit, target);
    const limitAutoChase = battleMode !== "arena" && unit.damage > 0;
    const waitingAtAutoBoundary = autoBattleEnabled && limitAutoChase && unit.x >= AUTO_CHASE_MAX_X - 6 && target.x > unit.x;
    if (d > unit.range && !waitingAtAutoBoundary) moveToward(unit, target, moveSpeed * dt, limitAutoChase);
    if (d <= unit.range && unit.cooldown <= 0) {
      unit.cooldown = unit.rate;
      unit.attackPulse = 0.22;
      unit.aim = { x: target.x, y: target.y };
      if (unit.name === "Nova" && unit.quantumTime > 0) {
        performNovaQuantumSlash(unit);
      } else {
        if (unit.name === "Himawari (Candy專用機)") {
          performHimawariFanAttack(unit, target);
        } else if (unit.name === "Accipio") {
          const targets = enemies
            .filter((enemy) => enemy.hp > 0 && weaponDistance(unit, enemy) <= unit.range)
            .sort((a, b) => (unit.target === a.id ? -1 : unit.target === b.id ? 1 : weaponDistance(unit, a) - weaponDistance(unit, b)))
            .slice(0, 5);
          targets.forEach((enemy) => {
            shots.push({ x: unit.x, y: unit.y, tx: enemy.x, ty: enemy.y, color: unit.color, life: 0.22, maxLife: 0.22, damage: unit.damage * 0.75, target: enemy.id, source: unit.id, accipioMark: true });
          });
        } else if (unit.name === "MEGA(EK專用機)") {
          const radius = unit.omniSlashRadius || 132;
          const targets = enemies.filter((enemy) => enemy.hp > 0 && dist(unit, enemy) < radius + bodyRadius(enemy) * 0.45);
          const damage = unit.damage * (targets.length > 1 ? 0.92 : 1.15);
          targets.forEach((enemy) => hit(enemy, damage, "#48a8ff", unit.id));
          burst(unit.x, unit.y, "#48a8ff", 34);
          addSkillEffect("omni-slash", unit, { radius, color: "#48a8ff", life: 0.42 });
        } else if (unit.name === "Orion") {
          enemies
            .filter((enemy) => enemy.hp > 0 && weaponDistance(unit, enemy) <= unit.range)
            .forEach((enemy) => {
              shots.push({ x: unit.x, y: unit.y, tx: enemy.x, ty: enemy.y, color: unit.color, life: 0.22, maxLife: 0.22, damage: enemy.boss ? unit.damage * 0.65 : unit.damage, target: enemy.id, source: unit.id });
            });
        } else if (unit.name === "Bastion") {
          const damage = (unit.damage + (unit.bastionBonus || 0) * 0.35) * (target.boss ? 1.7 : 1.1);
          const splashRadius = Math.max(unit.bastionBasicSplashRadius || 93, (unit.splashRadius || 138) * 0.85);
          shots.push({ x: unit.x, y: unit.y, tx: target.x, ty: target.y, color: unit.color, life: 0.34, maxLife: 0.34, damage, target: target.id, source: unit.id, splashRadius, splashDamage: unit.damage * 0.32 });
        } else if (unit.name === "Eumist (Eunice專用機)") {
          shots.push({ x: unit.x, y: unit.y, tx: target.x, ty: target.y, color: unit.color, life: 0.24, maxLife: 0.24, damage: unit.damage * 0.9, target: target.id, source: unit.id });
          performEumistBasicHeal(unit);
          addSkillEffect("eumist-slash", unit, { tx: target.x, ty: target.y, radius: unit.range, color: "#66f2e4", life: 0.36 });
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
  if (actor.faction === "Allied" || actor.arenaDefender) clampToBattlefield(actor, limitAutoChase);
}

function moveAwayFrom(actor, target, amount) {
  amount *= pushDisplacementFactor(actor);
  const dx = actor.x - target.x;
  const dy = actor.y - target.y;
  const d = Math.hypot(dx, dy) || 1;
  actor.x += (dx / d) * amount;
  actor.y += (dy / d) * amount;
  if (actor.faction === "Allied" || actor.arenaDefender) clampToBattlefield(actor, false);
}

function pushDisplacementFactor(actor) {
  let factor = actor?.pushResistance ? 1 - clamp(actor.pushResistance, 0, 0.6) : 1;
  if (actor?.seedAwakenTime > 0 && actor.faction === "Allied") factor *= 0.25;
  if (actor?.zeroBreak) factor *= 1 - (actor.zeroBreakPushReduction || 0.5);
  return factor;
}

function clampToBattlefield(actor, limitAutoChase = false) {
  actor.x = clamp(actor.x, ALLIED_MIN_X, limitAutoChase ? AUTO_CHASE_MAX_X : ALLIED_MAX_X);
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
  if (actor.name === "Eumist (Eunice專用機)") return 42;
  if (actor.name === "Accipio") return 46;
  if (actor.name === "Seraphim") return 39;
  return 41;
}

function clampUnitAfterSeparation(unit) {
  if (unit.faction === "Allied" || unit.arenaDefender) {
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

        const aResist = pushDisplacementFactor(a);
        const bResist = pushDisplacementFactor(b);
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
  enemy.accipioStopTime = Math.max(0, (enemy.accipioStopTime || 0) - dt);
  enemy.genesisTime = Math.max(0, (enemy.genesisTime || 0) - dt);
  enemy.frontlineSuppressionTime = Math.max(0, (enemy.frontlineSuppressionTime || 0) - dt);
  const target = chooseEnemyTarget(enemy, living);
  const d = dist(enemy, target);
  const genesisFactor = enemy.genesisTime > 0 ? (enemy.boss ? 0.875 : 0.75) : 1;
  const speedFactor = (enemy.accipioStopTime > 0 ? 0 : (enemy.slowTime > 0 ? 0.54 : 1)) * genesisFactor;
  if (d > enemy.range) moveToward(enemy, target, enemy.speed * speedFactor * dt);
  if (d <= enemy.range && enemy.cooldown <= 0 && (enemy.fireControlTime || 0) <= 0) {
    const jamFactor = enemy.jamTime > 0 ? 1.38 : 1;
    enemy.cooldown = enemy.rate * jamFactor + Math.random() * 0.22;
    enemy.attackPulse = 0.2;
    enemy.aim = { x: target.x, y: target.y };
    const frontlineFactor = enemy.frontlineSuppressionTime > 0 ? 0.85 : 1;
    const baseDamage = enemy.damage * (enemy.jamTime > 0 ? 0.68 : 1) * genesisFactor * frontlineFactor;
    if (target.shield > 0 && target.accipioShieldTime > 0) {
      const absorbed = baseDamage * 0.55;
      const source = activeAccipio();
      if (source) chargeAccipioXdr(source, 1.5 * (absorbed / Math.max(1, target.maxHp * 0.05)));
    }
    const damage = (target.shield > 0 ? baseDamage * 0.45 : baseDamage) * himawariDefenseFactor(target) * unitDefenseFactor(target);
    const hpBefore = target.hp;
    target.hp = clamp(target.hp - damage, 0, target.maxHp);
    chargeUltimateByDamageTaken(target, hpBefore - target.hp);
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

  const priority = enemy.boss || enemy.type !== "sniper"
    ? ["attacker", "repair", "tank"]
    : ["repair", "attacker", "tank"];

  for (const role of priority) {
    const target = nearestUnitByRole(enemy, living, role);
    if (target) return target;
  }
  return [...living].sort((a, b) => dist(enemy, a) - dist(enemy, b))[0];
}

function nearestUnitByRole(enemy, units, role) {
  return units
    .filter((unit) => unitCombatRole(unit) === role)
    .sort((a, b) => dist(enemy, a) - dist(enemy, b) || (a.hp / a.maxHp) - (b.hp / b.maxHp))[0] || null;
}

function unitCombatRole(unit) {
  if (unit.name === "Asterion" || unit.name === "Valkyr" || unit.name === "MEGA(EK專用機)") return "tank";
  if (unit.damage < 0 || unit.name === "Seraphim" || unit.name === "Helix" || unit.name === "Accipio") return "repair";
  return "attacker";
}

function update(dt) {
  if (!running || paused) return;
  if (battleMode === "arena") {
    arenaTimeLeft = Math.max(0, arenaTimeLeft - dt);
    autoBattleEnabled = true;
  }
  updateAutoBattle();
  squad.forEach((u) => stepUnit(u, dt));
  enemies.forEach((e) => battleMode === "arena" ? updateArenaDefender(e, dt) : stepEnemy(e, dt));
  updateAccipioMarks(dt);
  updateAccipioHot(dt);
  updateGravityFields(dt);
  updateMirageDomains(dt);
  updateHimawariPoison(dt);
  resolveBodyOverlaps();

  shots.forEach((shot) => {
    shot.life -= dt;
    if (shot.life <= 0 && shot.arenaDamage && !shot.resolved) {
      shot.resolved = true;
      if (!battleActorAlive(shot.source)) return;
      const source = enemies.find((e) => e.id === shot.source);
      const target = squad.find((u) => u.id === shot.arenaTarget);
      damageArenaAttacker(target, shot.arenaDamage, shot.color, source);
      if (shot.accipioMark && source && target) addAccipioMark(source, target);
      if (target && shot.splashRadius) {
        squad
          .filter((unit) => unit.hp > 0 && unit.id !== target.id && dist(unit, target) < shot.splashRadius)
          .forEach((unit) => damageArenaAttacker(unit, shot.splashDamage || shot.arenaDamage * 0.35, shot.color, source));
        addSkillEffect("impact-grid", null, { x: target.x, y: target.y, radius: shot.splashRadius, color: shot.color, life: 0.45, follow: false });
      }
    }
    if (shot.life <= 0 && shot.damage && !shot.resolved) {
      shot.resolved = true;
      if (!battleActorAlive(shot.source)) return;
      const source = battleActorById(shot.source);
      const target = enemies.find((e) => e.id === shot.target);
      if (target) {
        hit(target, shot.damage, shot.color, shot.source);
        if (shot.accipioMark && source) addAccipioMark(source, target);
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
  if (battleMode !== "arena") enemies = enemies.filter((e) => e.hp > 0);

  if (battleMode === "arena") {
    if (!enemies.some((e) => e.hp > 0)) endArena(true);
    else if (!squad.some((u) => u.hp > 0) || arenaTimeLeft <= 0) endArena(false);
  }

  if (battleMode !== "arena" && !enemies.length && now() > nextWaveAt) {
    completeRound();
  }

  if (battleMode !== "arena" && !squad.some((u) => u.hp > 0)) endMission(false);
  if (messageTime && now() > messageTime) {
    commandEl.textContent = t("idle");
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
  renderRewardChoices();
  hideLoading();
  rewardEl.hidden = false;
  if (autoBattleEnabled) scheduleAutoRewardPick();
  setMessage("選擇一項強化");
}

function renderRewardChoices() {
  rewardOptionsEl.innerHTML = rewardChoices.map((sourceReward, index) => {
    const reward = localizeReward(sourceReward);
    return `
    <button class="reward-card tier-${rewardTier(reward)}" data-reward-index="${index}">
      <img src="${assetSrc(reward.icon)}" alt="${reward.name} icon" />
      <div class="reward-copy">
        <div class="reward-type">${rewardTierLabel(reward)} / ${reward.type}</div>
        <h3>${reward.name}</h3>
        <p>${reward.text}</p>
      </div>
    </button>
  `;
  }).join("");
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

function rewardTierRank(reward) {
  const tier = rewardTier(reward);
  if (tier === "ultra") return 3;
  if (tier === "rare") return 2;
  return 1;
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

function clearAutoRewardTimer() {
  if (!autoRewardTimer) return;
  window.clearTimeout(autoRewardTimer);
  autoRewardTimer = 0;
}

function scheduleAutoRewardPick() {
  clearAutoRewardTimer();
  autoRewardTimer = window.setTimeout(() => {
    autoRewardTimer = 0;
    if (!autoBattleEnabled || rewardEl.hidden || !rewardChoices.length) return;
    chooseReward(chooseAutoRewardIndex());
  }, 850);
}

function chooseAutoRewardIndex() {
  const bestRank = Math.max(...rewardChoices.map(rewardTierRank));
  const bestIndexes = rewardChoices
    .map((reward, index) => ({ reward, index }))
    .filter((entry) => rewardTierRank(entry.reward) === bestRank)
    .map((entry) => entry.index);
  return bestIndexes[Math.floor(Math.random() * bestIndexes.length)] || 0;
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
  renderResultCopy(won);
  resultEl.hidden = false;
  leaderboardEl.hidden = battleMode === "arena";
  if (battleMode !== "arena") loadLeaderboard();
}

function renderResultCopy(won) {
  resultTitleEl.textContent = won ? t("missionClear") : t("missionEnd");
  if (battleMode === "arena") {
    const survivors = squad.filter((unit) => unit.hp > 0).length;
    resultCopyEl.innerHTML = `
      <div class="result-score">
        <span>Arena Score</span>
        <strong>${score}</strong>
      </div>
      <div class="result-lines">
        <span>${won ? `擊破 ${arenaOpponent?.name || "opponent"} 的防守隊` : "防守隊守住了戰線"}</span>
        <span>剩餘時間 ${Math.ceil(arenaTimeLeft)} 秒 / 存活 ${survivors} 機</span>
      </div>
    `;
    return;
  }
  resultCopyEl.innerHTML = `
    <div class="result-score">
      <span>${t("finalScore")}</span>
      <strong>${score}</strong>
    </div>
    <div class="result-lines">
      <span>${t("reachedWave", { wave })}</span>
      <span>${won ? t("fleetSafe") : t("retreat")}</span>
    </div>
  `;
}

function renderHudCardsShell() {
  const signature = squad.map((u) => {
    const unit = localizeUnit(u);
    return `${currentLanguage}:${u.id}:${unit.name}:${unit.role}:${u.sprite || u.art}`;
  }).join("|");
  if (signature === hudCardsSignature) return;
  hudCardsSignature = signature;
  cardsEl.innerHTML = squad.map((sourceUnit) => {
    const u = localizeUnit(sourceUnit);
    return `
    <article class="unit-card" data-unit-id="${u.id}">
      <img src="${assetSrc(u.sprite || u.art)}" alt="${u.name} artwork" draggable="false" decoding="async" loading="eager" />
      <div class="unit-info">
        <h3>${u.name}</h3>
        <div class="role">${u.role}</div>
        <div class="bar hp"><span data-card-hp></span></div>
        <div class="bar cool"><span data-card-cool></span></div>
      </div>
    </article>
  `;
  }).join("");
}

function updateHud() {
  waveEl.textContent = battleMode === "arena" ? `Arena ${Math.ceil(arenaTimeLeft)}s` : (wave % 3 === 0 ? `${wave} BOSS` : String(wave));
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
    currentLanguage,
    unit.id,
    localizeUnit(unit).name,
    localizeUnit(unit).skill,
    localizeUnit(unit).ultimate,
    unit.activeIcon,
    unit.ultimateIcon,
    localizeUnit(unit).activeDesc,
    localizeUnit(unit).ultimateDesc
  ].join(":")).join("|");
  if (signature === skillBarSignature) return;
  skillBarSignature = signature;
  skillButtonsEl.innerHTML = squad.map((sourceUnit) => {
    const unit = localizeUnit(sourceUnit);
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
    activeButton.querySelector("[data-skill-status]").textContent = activeCooling ? `${Math.ceil(unit.skillCooldown)}${t("seconds")}` : (unit.name === "MEGA(EK專用機)" && unit.ekAuraActive ? t("activeOn") : localizeUnit(unit).name);

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
  const sourceUnit = unit;
  unit = localizeUnit(unit);
  const hp = sourceUnit.maxHp ? `${Math.ceil(Math.max(0, sourceUnit.hp ?? sourceUnit.maxHp))} / ${sourceUnit.maxHp}` : t("unknown");
  intelEl.innerHTML = `
    <p class="kicker">${t("tacticalIntel")}</p>
    <div class="intel-layout">
      <img src="${assetSrc(unit.art || unit.sprite)}" alt="${unit.name} profile" />
      <div>
        <h3>${unit.name}</h3>
        <div class="role">${labelFaction(unit.faction)} / ${unit.role}</div>
        <div class="spec-grid">
          <div><span>HP</span><strong>${hp}</strong></div>
          <div><span>${t("weapon")}</span><strong>${unit.weapon}</strong></div>
          <div><span>${t("activeSkill")}</span><strong>${unit.skill ? `${unit.skill}: ${unit.activeDesc || t("useSkillBar")}` : t("noSkill")}</strong></div>
          ${unit.ultimate ? `<div><span>${t("ultimateSkill")}</span><strong>${unit.ultimate}: ${unit.ultimateDesc}</strong></div>` : ""}
          <div><span>${t("trait")}</span><strong>${unit.trait}</strong></div>
          <div><span>${t("tactic")}</span><strong>${unit.tactic}</strong></div>
        </div>
      </div>
    </div>
  `;
}

function renderFormation() {
  if (!formationEl || !formationListEl || !formationSlotsEl) return;
  const focused = squadSeeds.find((unit) => unit.name === formationFocusName) || squadSeeds[0];
  formationFocusName = focused.name;
  formationCountEl.textContent = `${t("selected")} ${selectedSquadNames.length}/4`;
  formationStartEl.disabled = selectedSquadNames.length !== 4;

  formationSlotsEl.innerHTML = Array.from({ length: 4 }, (_, index) => {
    const sourceUnit = squadSeeds.find((seed) => seed.name === selectedSquadNames[index]);
    if (!sourceUnit) {
      return `<article class="formation-slot empty"><span>${index + 1}</span><strong>${t("emptySlot")}</strong></article>`;
    }
    const unit = localizeUnit(sourceUnit);
    return `
      <article class="formation-slot" data-unit-name="${sourceUnit.name}">
        <span>${index + 1}</span>
        <img src="${assetSrc(unit.sprite || unit.art)}" alt="${unit.name} SD sprite" />
        <div>
          <strong>${unit.name}</strong>
          <small>${unit.role}</small>
        </div>
      </article>
    `;
  }).join("");

  const renderFormationCard = (sourceUnit) => {
    const unit = localizeUnit(sourceUnit);
    const selectedForBattle = selectedSquadNames.includes(sourceUnit.name);
    const focusedClass = sourceUnit.name === focused.name ? "focused" : "";
    return `
      <article class="formation-card ${selectedForBattle ? "selected" : ""} ${focusedClass}" data-unit-name="${sourceUnit.name}">
        <img src="${assetSrc(unit.sprite || unit.art)}" alt="${unit.name} SD sprite" />
        <div class="formation-card-copy">
          <div class="formation-card-title">
            <h3>${unit.name}</h3>
            <span>${unit.role}</span>
          </div>
          <p>${unit.trait}</p>
          <dl>
            <div><dt>${t("range")}</dt><dd>${sourceUnit.range}</dd></div>
            <div><dt>${t("durability")}</dt><dd>${sourceUnit.maxHp}</dd></div>
            <div><dt>${t("active")}</dt><dd>${unit.skill}</dd></div>
            <div><dt>${t("ultimate")}</dt><dd>${unit.ultimate}</dd></div>
          </dl>
        </div>
        <button class="formation-toggle" data-unit-name="${sourceUnit.name}" type="button">${selectedForBattle ? t("remove") : t("add")}</button>
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

function arenaCoreById(id) {
  return localizeArenaCoreOption(arenaCoreOptions.find((core) => core.id === id) || arenaCoreOptions[0]);
}

function arenaModuleById(id) {
  return localizeArenaModuleOption(arenaModuleOptions.find((module) => module.id === id) || null);
}

function normalizeArenaAiId(id) {
  return arenaAiAliases[id] || id || "focus-attacker";
}

function arenaAiById(id) {
  const normalized = normalizeArenaAiId(id);
  return localizeArenaAiOption(masterLeagueAiOptions.find((ai) => ai.id === normalized) || masterLeagueAiOptions[0]);
}

function normalizeArenaBuild() {
  if (arenaDefenseNames.length !== 4) arenaDefenseNames = [...selectedSquadNames].slice(0, 4);
  if (arenaDefenseNames.length !== 4) arenaDefenseNames = [...defaultSquadNames];
  arenaDefenseNames.forEach((name, index) => {
    if (!arenaPositions[name] && arenaPositions[name] !== 0) arenaPositions[name] = arenaDefaultPositions[name] ?? index;
    arenaAi[name] = arenaAi[name] ? normalizeArenaAiId(arenaAi[name]) : (index === 0 ? "frontline" : index === 2 ? "guard-healer" : "focus-attacker");
  });
  if (!arenaCoreById(arenaSelectedCore)) arenaSelectedCore = arenaCoreOptions[0].id;
  arenaSelectedUnitName = arenaDefenseNames.includes(arenaSelectedUnitName) ? arenaSelectedUnitName : arenaDefenseNames[0];
}

function arenaBuildCost() {
  return ARENA_CORE_COST + arenaDefenseNames.reduce((total, name) => total + (arenaModuleById(arenaModules[name])?.cost || 0), 0);
}

function arenaBuildPayload() {
  normalizeArenaBuild();
  return {
    squad: [...arenaDefenseNames],
    positions: { ...arenaPositions },
    modules: { ...arenaModules },
    ai: { ...arenaAi },
    core: arenaSelectedCore,
    cost: arenaBuildCost()
  };
}

function masterBandForScore(score) {
  return [...masterLeagueBands].reverse().find((band) => score >= band.min) || masterLeagueBands[0];
}

function nextMasterBand(score) {
  return masterLeagueBands.find((band) => band.min > score) || null;
}

function masterBandById(id) {
  return masterLeagueBands.find((band) => band.id === id) || masterLeagueBands[0];
}

function nextMasterBandForRun() {
  const currentIndex = Math.max(0, masterLeagueBands.findIndex((band) => band.id === (masterLeagueRun?.bandId || "bronze")));
  return masterLeagueBands[currentIndex + 1] || null;
}

function cloneDefense(defense) {
  return JSON.parse(JSON.stringify(defense || {}));
}

function makeMasterRunId() {
  return `${pilotProfile?.playerId || "local"}-${Date.now().toString(36)}-${makeLocalToken(6)}`;
}

function startMasterLeagueRun() {
  if (arenaBuildCost() > ARENA_TOTAL_COST) {
    renderPilotPanel("Cost 超出上限，不能參賽。");
    return;
  }
  masterLeagueRun = {
    runId: makeMasterRunId(),
    active: true,
    score: 0,
    streak: 0,
    round: 1,
    bandId: "bronze",
    lockedBuild: cloneDefense(arenaBuildPayload()),
    pendingChampionBand: null,
    lastScoreDetail: null
  };
  arenaSelectedOpponent = null;
  generateMasterOpponentChoices();
  renderArena();
}

function queueMasterOpponentSearch() {
  if (masterLeagueSearchTimer) window.clearTimeout(masterLeagueSearchTimer);
  if (masterLeagueRun?.pendingChampionBand) {
    masterLeagueSearching = false;
    const band = masterBandById(masterLeagueRun.pendingChampionBand);
    arenaSelectedOpponent = makeChampionOpponent(band);
    masterLeagueRun.choices = [arenaSelectedOpponent];
    renderArena();
    return;
  }
  masterLeagueSearching = true;
  if (masterLeagueRun) masterLeagueRun.choices = [];
  arenaSelectedOpponent = null;
  renderArena();
  masterLeagueSearchTimer = window.setTimeout(() => {
    if (!masterLeagueRun?.active) return;
    generateMasterOpponentChoices();
    masterLeagueSearching = false;
    renderArena();
  }, 2000);
}

function confirmMasterLeagueEntry() {
  if (arenaBuildCost() > ARENA_TOTAL_COST) {
    renderPilotPanel("Cost 超出上限，請先調整核心或模組。");
    return;
  }
  masterLeagueRun = {
    runId: makeMasterRunId(),
    active: true,
    score: 0,
    streak: 0,
    round: 1,
    bandId: "bronze",
    lockedBuild: cloneDefense(arenaBuildPayload()),
    pendingChampionBand: null,
    lastScoreDetail: null,
    choices: []
  };
  queueMasterOpponentSearch();
}

function requestMasterLeagueTeamName() {
  const currentName = sanitizePlayerName(pilotProfile?.name || localStorage.getItem("mecha-heart-player-name") || "Pilot");
  if (!arenaNameModalEl || !arenaNameInputEl) {
    localStorage.setItem("mecha-heart-player-name", currentName);
    savePilotProfileLocal({ ...pilotProfile, name: currentName });
    return Promise.resolve(true);
  }
  const title = arenaNameModalEl.querySelector("#arena-name-title");
  const copy = arenaNameModalEl.querySelector(".arena-name-panel > p:not(.kicker)");
  const label = arenaNameModalEl.querySelector("label span");
  if (currentLanguage === "en") {
    if (title) title.textContent = "Choose Your Challenge Squad Name";
    if (copy) copy.textContent = "This name is recorded for the current Master League run. If you defeat a champion, it will be shown to the next challenger.";
    if (label) label.textContent = "Squad Name";
    if (arenaNameInputEl) arenaNameInputEl.placeholder = "Enter squad name";
    if (arenaNameConfirmEl) arenaNameConfirmEl.textContent = "Start Formation";
    if (arenaNameCancelEl) arenaNameCancelEl.textContent = "Back";
  } else {
    if (title) title.textContent = "請決定挑戰隊伍名稱";
    if (copy) copy.textContent = "呢個名字會記錄喺今次 Master League Run，同成功挑戰盟主後顯示俾下一位玩家。";
    if (label) label.textContent = "戰隊名";
    if (arenaNameInputEl) arenaNameInputEl.placeholder = "輸入戰隊名";
    if (arenaNameConfirmEl) arenaNameConfirmEl.textContent = "開始編隊";
    if (arenaNameCancelEl) arenaNameCancelEl.textContent = "返回";
  }
  arenaNameInputEl.value = currentName;
  arenaNameModalEl.hidden = false;
  arenaNameInputEl.focus();
  arenaNameInputEl.select();
  return new Promise((resolve) => {
    const close = (accepted) => {
      arenaNameModalEl.hidden = true;
      arenaNameCancelEl?.removeEventListener("click", cancel);
      arenaNameModalEl.removeEventListener("submit", submit);
      arenaNameModalEl.removeEventListener("keydown", keydown);
      resolve(accepted);
    };
    const accept = () => {
      const name = sanitizePlayerName(arenaNameInputEl.value);
      localStorage.setItem("mecha-heart-player-name", name);
      savePilotProfileLocal({ ...pilotProfile, name });
      close(true);
    };
    const cancel = () => close(false);
    const submit = (event) => {
      event.preventDefault();
      accept();
    };
    const keydown = (event) => {
      if (event.key === "Escape") cancel();
    };
    arenaNameCancelEl?.addEventListener("click", cancel);
    arenaNameModalEl.addEventListener("submit", submit);
    arenaNameModalEl.addEventListener("keydown", keydown);
  });
}

function masterSeedNumber(text) {
  let hash = 2166136261;
  String(text).split("").forEach((char) => {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  });
  return hash >>> 0;
}

function seededPick(list, seed, offset = 0) {
  const index = ((seed + offset * 2654435761) >>> 0) % list.length;
  return list[index] || list[0];
}

function rotateArray(list, count) {
  const offset = ((count % list.length) + list.length) % list.length;
  return [...list.slice(offset), ...list.slice(0, offset)];
}

function generatedMasterDefense(seed, targetRating, difficulty) {
  const available = squadSeeds.filter((unit) => !unit.ace);
  const rotated = rotateArray(available, seed % available.length);
  const squadNames = rotated
    .sort((a, b) => ((masterSeedNumber(`${seed}:${a.name}`) % 1000) - (masterSeedNumber(`${seed}:${b.name}`) % 1000)))
    .slice(0, 4)
    .map((unit) => unit.name);
  const core = arenaCoreOptions[(seed + Math.floor(targetRating / 500)) % arenaCoreOptions.length];
  const positions = {};
  const modules = {};
  const ai = {};
  const slotOrder = [3, 4, 5, 0, 1, 2, 6, 7, 8];
  const moduleBudget = difficulty.id === "hard" ? 4 : difficulty.id === "normal" ? 3 : 2;
  squadNames.forEach((name, index) => {
    positions[name] = slotOrder[(index + seed) % slotOrder.length];
    ai[name] = masterLeagueAiOptions[(seed + index + Math.floor(targetRating / 750)) % masterLeagueAiOptions.length].id;
    const candidate = arenaModuleOptions[(seed + index * 3 + Math.floor(targetRating / 420)) % arenaModuleOptions.length];
    if (index < moduleBudget && !Object.values(modules).includes(candidate.id)) modules[name] = candidate.id;
  });
  const cost = ARENA_CORE_COST + Object.values(modules).reduce((sum, moduleId) => sum + (arenaModuleById(moduleId)?.cost || 0), 0);
  return { squad: squadNames, positions, modules, ai, core: core.id, cost };
}

function makeGeneratedMasterOpponent(difficulty, index, band) {
  const runScore = masterLeagueRun?.score || 0;
  const round = masterLeagueRun?.round || 1;
  const seed = masterSeedNumber(`${pilotProfile?.playerId || "local"}:${runScore}:${round}:${difficulty.id}:${index}:${Date.now()}:${Math.random()}`);
  const targetRating = Math.max(820, 900 + Math.floor(runScore / 7) + round * 42 + difficulty.ratingOffset);
  const callsigns = ["Iron", "Quantum", "Rail", "Nova", "Mirage", "Helix", "Bastion", "Orion", "Valkyr"];
  const forms = ["Aegis", "Rush", "Scope", "Pulse", "Anchor", "Vector", "Array", "Crown", "Lance"];
  const suffix = ["Cell", "Team", "Nest", "Guard", "Wing", "Frame", "Node", "Line", "Wall"];
  const name = `${seededPick(callsigns, seed, 1)} ${seededPick(forms, seed, 2)} ${seededPick(suffix, seed, 3)}`;
  return {
    playerId: `ghost-${band.id}-${round}-${difficulty.id}-${seed.toString(36)}`,
    name: `${difficulty.label} / ${name}`,
    rating: targetRating,
    difficulty,
    band,
    defense: generatedMasterDefense(seed, targetRating, difficulty)
  };
}

function generateMasterOpponentChoices() {
  if (masterLeagueRun?.pendingChampionBand) {
    const band = masterBandById(masterLeagueRun.pendingChampionBand);
    arenaSelectedOpponent = makeChampionOpponent(band);
    masterLeagueRun.choices = [arenaSelectedOpponent];
    return;
  }
  const band = masterBandById(masterLeagueRun?.bandId || "bronze");
  const choices = masterLeagueDifficulties.map((difficulty, index) => {
    const targetRating = 900 + Math.floor((masterLeagueRun?.score || 0) / 7) + (masterLeagueRun?.round || 1) * 42 + difficulty.ratingOffset;
    const pool = (arenaOpponents.length ? arenaOpponents : arenaPresetOpponents)
      .filter((opponent) => Math.abs((opponent.rating || 1000) - targetRating) < 650)
      .sort((a, b) => Math.abs((a.rating || 1000) - targetRating) - Math.abs((b.rating || 1000) - targetRating));
    if (!pool.length || index > 0) return makeGeneratedMasterOpponent(difficulty, index, band);
    const source = pool[(index + (masterLeagueRun?.round || 1) - 1 + Math.floor((masterLeagueRun?.score || 0) / 1000)) % pool.length] || arenaPresetOpponents[index];
    const opponent = {
      ...source,
      name: `${difficulty.label} / ${source.name}`,
      rating: Math.max(100, (source.rating || 1000) + difficulty.ratingOffset + (masterLeagueRun?.round || 1) * 18),
      difficulty,
      band,
      defense: cloneDefense(source.defense)
    };
    return opponent;
  });
  masterLeagueRun.choices = choices;
}

function makeChampionOpponent(targetBand) {
  const champion = arenaMasterChampions?.[targetBand.id];
  const source = champion || arenaOpponents.find((opponent) => masterBandForScore(opponent.masterScore || opponent.rating || 0).id === targetBand.id) || arenaPresetOpponents[Math.min(masterLeagueBands.indexOf(targetBand), arenaPresetOpponents.length - 1)];
  return {
    ...source,
    name: `${targetBand.title} / ${source.name}`,
    championName: source.name || "Pilot",
    championTeamName: source.teamName || source.name || "Pilot",
    rating: Math.max(source.rating || source.masterScore || 1000, targetBand.min + 260),
    difficulty: championDifficultyForBand(targetBand),
    championBand: targetBand,
    defense: cloneDefense(source.defense)
  };
}

function promotionOpponentForRun() {
  if (!masterLeagueRun?.pendingChampionBand) return null;
  const targetBand = masterBandById(masterLeagueRun.pendingChampionBand);
  if (!arenaSelectedOpponent?.championBand || arenaSelectedOpponent.championBand.id !== targetBand.id) {
    arenaSelectedOpponent = makeChampionOpponent(targetBand);
  }
  masterLeagueRun.choices = [arenaSelectedOpponent];
  return arenaSelectedOpponent;
}

function promotionTeamText(opponent) {
  return opponent?.defense?.squad?.join(" / ") || "Unknown squad";
}

function promotionChampionLabel(opponent) {
  return opponent?.championTeamName || opponent?.championName || opponent?.name?.replace(`${opponent?.championBand?.title || ""} / `, "") || "Pilot";
}

const championBandPowerScale = {
  silver: { hp: 0.78, damage: 0.76, multiplier: 1.1 },
  gold: { hp: 0.9, damage: 0.88, multiplier: 1.18 },
  platinum: { hp: 1, damage: 1, multiplier: 1.26 },
  diamond: { hp: 1.1, damage: 1.08, multiplier: 1.34 },
  master: { hp: 1.2, damage: 1.16, multiplier: 1.44 }
};

function championDifficultyForBand(targetBand) {
  const scale = championBandPowerScale[targetBand?.id] || championBandPowerScale.silver;
  return {
    ...masterLeagueDifficulties[2],
    id: "champion",
    label: "盟主戰",
    multiplier: scale.multiplier,
    hp: scale.hp,
    damage: scale.damage,
    powerLabel: `HP x${scale.hp.toFixed(2)} / DMG x${scale.damage.toFixed(2)}`
  };
}

function fallbackChampionForBand(band) {
  const preset = arenaPresetOpponents[Math.min(Math.max(0, masterLeagueBands.indexOf(band)), arenaPresetOpponents.length - 1)] || arenaPresetOpponents[0];
  return {
    name: preset.name,
    teamName: preset.name,
    defense: preset.defense,
    masterScore: band.min,
    updatedAt: ""
  };
}

function renderChampionBoard() {
  const visibleBands = masterLeagueBands.filter((band) => band.id !== "bronze");
  const runScore = masterLeagueRun?.score || pilotProfile?.masterLeague?.score || 0;
  const currentBand = masterLeagueRun?.active ? masterBandById(masterLeagueRun.bandId) : masterBandForScore(runScore);
  const currentIndex = Math.max(0, visibleBands.findIndex((band) => band.id === currentBand.id));
  const progressPercent = visibleBands.length > 1 ? (currentIndex / (visibleBands.length - 1)) * 100 : 0;
  const playerLabel = currentLanguage === "en" ? "Your position" : "目前位置";
  return `
    <div class="champion-ladder" style="--player-step:${progressPercent.toFixed(2)}%;">
      <div class="champion-progress" aria-hidden="true">
        <span></span>
        <i>${playerLabel}: ${masterBandName(currentBand)}</i>
      </div>
      <div class="champion-board">
      ${visibleBands.map((band) => {
        const champion = arenaMasterChampions?.[band.id] || fallbackChampionForBand(band);
        const squadText = champion.defense?.squad?.join(" / ") || "-";
        const bandIndex = visibleBands.findIndex((item) => item.id === band.id);
        const rowClass = [
          "champion-row",
          `champion-${band.id}`,
          band.id === currentBand.id ? "current-player-band" : "",
          bandIndex < currentIndex ? "passed-band" : "",
          bandIndex > currentIndex ? "future-band" : ""
        ].filter(Boolean).join(" ");
        return `
          <article class="${rowClass}">
            <span>${masterBandName(band)}</span>
            <strong>${champion.teamName || champion.name || "Pilot"}</strong>
            ${band.id === currentBand.id ? `<b class="champion-player-label">${currentLanguage === "en" ? "YOU" : "目前"}</b>` : ""}
            ${renderChampionIconStrip(champion.defense)}
            <small>${squadText}</small>
          </article>
        `;
      }).join("")}
      </div>
    </div>
  `;
}

function renderMechaIconStrip(defense, className) {
  return `
    <div class="${className}">
      ${(defense?.squad || []).slice(0, 4).map((name) => {
        const unit = squadSeeds.find((seed) => seed.name === name);
        return unit ? `<span><img src="${assetSrc(unit.sprite || unit.art)}" alt="${unit.name}" /><em>${unit.name}</em></span>` : "";
      }).join("")}
    </div>
  `;
}

function renderOpponentIconStrip(defense) {
  return renderMechaIconStrip(defense, "opponent-icon-strip");
}

function renderChampionIconStrip(defense) {
  return renderMechaIconStrip(defense, "champion-icon-strip");
}

function rememberLocalChampion(targetBand, runScore) {
  if (!targetBand || !pilotProfile || !masterLeagueRun?.lockedBuild) return;
  const record = {
    playerId: pilotProfile.playerId,
    name: pilotProfile.name || "Pilot",
    teamName: pilotProfile.name || "Pilot",
    rating: pilotProfile.pvpStats?.rating || 1000,
    masterScore: runScore,
    defense: cloneDefense(currentLeagueTacticalBuild()),
    bandId: targetBand.id,
    updatedAt: new Date().toISOString()
  };
  arenaMasterChampions = {
    ...arenaMasterChampions,
    [targetBand.id]: record,
    overall: !arenaMasterChampions.overall || runScore > (arenaMasterChampions.overall.masterScore || 0)
      ? record
      : arenaMasterChampions.overall
  };
  saveLocalMasterChampions(arenaMasterChampions);
}

function selectMasterOpponent(opponent) {
  arenaSelectedOpponent = opponent;
  renderArena();
}

function activeLeagueBuild() {
  return masterLeagueRun?.lockedBuild || arenaBuildPayload();
}

function syncEditableFromLockedBuild() {
  if (!masterLeagueRun?.lockedBuild) return;
  const locked = masterLeagueRun.lockedBuild;
  arenaDefenseNames = [...locked.squad];
  arenaModules = { ...(locked.modules || {}) };
  arenaSelectedCore = locked.core || arenaSelectedCore;
  Object.keys(arenaAi).forEach((name) => { if (!arenaDefenseNames.includes(name)) delete arenaAi[name]; });
  Object.keys(arenaPositions).forEach((name) => { if (!arenaDefenseNames.includes(name)) delete arenaPositions[name]; });
  arenaDefenseNames.forEach((name) => {
    arenaAi[name] = normalizeArenaAiId(arenaAi[name] || locked.ai?.[name] || "focus-attacker");
    arenaPositions[name] = arenaPositions[name] ?? locked.positions?.[name] ?? arenaDefaultPositions[name] ?? 0;
  });
  arenaSelectedUnitName = arenaDefenseNames.includes(arenaSelectedUnitName) ? arenaSelectedUnitName : arenaDefenseNames[0];
}

function currentLeagueTacticalBuild() {
  const locked = activeLeagueBuild();
  return {
    ...cloneDefense(locked),
    ai: { ...arenaAi },
    positions: { ...arenaPositions },
    cost: locked.cost
  };
}

function calculateMasterBattleScore(won) {
  const difficulty = arenaOpponent?.difficulty || masterLeagueDifficulties[1];
  const survivors = squad.filter((unit) => unit.hp > 0);
  const remainingHp = squad.reduce((sum, unit) => sum + Math.max(0, unit.hp), 0);
  const hpRatio = clamp(remainingHp / Math.max(1, arenaBattleStartHp), 0, 1);
  const base = Math.round(difficulty.base * difficulty.multiplier);
  const hpBonus = Math.round(hpRatio * masterLeagueScoring.hpBonusMax);
  const timeBonus = Math.round((arenaTimeLeft / ARENA_TIME_LIMIT) * masterLeagueScoring.timeBonusMax);
  const cost = activeLeagueBuild().cost || ARENA_TOTAL_COST;
  const costBonus = Math.round(clamp((masterLeagueScoring.costPar - cost) / 2.4, 0, masterLeagueScoring.costBonusMax));
  const streakBonus = (masterLeagueRun?.streak || 0) * masterLeagueScoring.streakStep;
  const deathPenalty = (4 - survivors.length) * masterLeagueScoring.deathPenalty;
  const championBonus = arenaOpponent?.championBand ? masterLeagueScoring.championBonus : 0;
  const total = won ? Math.max(0, base + hpBonus + timeBonus + costBonus + streakBonus + championBonus - deathPenalty) : 0;
  return { total, base, hpBonus, timeBonus, costBonus, streakBonus, deathPenalty, championBonus, difficulty: difficulty.label, survivors: survivors.length };
}

function applyProfileDefense() {
  const defense = pilotProfile?.pvpDefense;
  if (!defense?.squad?.length) return;
  arenaDefenseNames = defense.squad.filter((name) => squadSeeds.some((unit) => unit.name === name)).slice(0, 4);
  arenaModules = { ...(defense.modules || {}) };
  arenaAi = { ...(defense.ai || {}) };
  arenaPositions = { ...(defense.positions || {}) };
  arenaSelectedCore = defense.core || arenaSelectedCore;
  normalizeArenaBuild();
}

function renderPilotPanel(message = "") {
  if (!pilotNameLabelEl) return;
  const panel = pilotNameLabelEl.closest(".pilot-panel");
  const nameLocked = Boolean(masterLeagueRun?.active);
  panel?.classList.toggle("champion-panel", nameLocked);
  const pilotKicker = pilotNameLabelEl.closest(".pilot-panel")?.querySelector(".kicker");
  if (pilotKicker) pilotKicker.textContent = "戰隊名";
  if (pilotKicker) pilotKicker.textContent = nameLocked ? "League Champions" : "戰隊名";
  pilotNameLabelEl.textContent = nameLocked ? "各階盟主" : (pilotProfile?.name || "Pilot");
  pilotNameInputEl.value = pilotProfile?.name || "Pilot";
  pilotNameInputEl.disabled = nameLocked;
  pilotSaveNameEl.disabled = nameLocked;
  pilotRecoverEl.disabled = nameLocked;
  pilotCodeDisplayEl.textContent = "";
  if (pilotKicker) pilotKicker.textContent = nameLocked ? (currentLanguage === "en" ? "League Champions" : "各階盟主") : (currentLanguage === "en" ? "Squad Name" : "戰隊名");
  pilotNameLabelEl.textContent = nameLocked ? (currentLanguage === "en" ? "League Champions" : "各階盟主") : (pilotProfile?.name || "Pilot");
  if (!nameLocked && currentLanguage === "en") {
    pilotSyncMessageEl.textContent = message || "Each Master League run uses a locked squad name. Enter a team name before joining.";
    return;
  }
  if (nameLocked) {
    pilotSyncMessageEl.innerHTML = renderChampionBoard();
    return;
  }
  pilotSyncMessageEl.textContent = message || "每次 Master League 都係獨立 Run；輸入戰隊名後即可參賽。";
  return;
  pilotSyncMessageEl.textContent = message || "每次 Master League 都係獨立 Run；輸入名字後即可參賽。";
}

function renderArena() {
  if (!arenaEl) return;
  if (masterLeagueRun?.active) syncEditableFromLockedBuild();
  normalizeArenaBuild();
  arenaEl.classList.toggle("arena-run-mode", Boolean(masterLeagueRun?.active));
  arenaEl.classList.toggle("arena-build-mode", !masterLeagueRun?.active);
  arenaEl.classList.toggle("arena-searching-mode", Boolean(masterLeagueSearching));
  const arenaTitle = arenaEl.querySelector(".arena-head h2");
  const arenaCopy = arenaEl.querySelector(".arena-head h2 + p");
  const panelTitles = arenaEl.querySelectorAll(".arena-panel h3");
  if (panelTitles[1]) panelTitles[1].textContent = masterLeagueRun?.active ? "出戰機體" : "編成機體";
  if (panelTitles[2]) panelTitles[2].textContent = masterLeagueRun?.active ? "出戰陣型" : "編成陣型";
  if (arenaTitle) arenaTitle.textContent = masterLeagueRun?.active ? "Master League Arena" : "競技場編隊";
  if (arenaCopy) arenaCopy.textContent = masterLeagueRun?.active
    ? "隊伍已鎖定。偵察對手後，可以調整 AI 方針同站位，再開始自動對戰。"
    : "用 1000 Cost 組出參賽隊伍。確認後會鎖定機體、核心同模組。";
  if (arenaTitle) arenaTitle.textContent = masterLeagueRun?.active ? "Master League Arena" : "Master League";
  if (arenaCopy) arenaCopy.textContent = masterLeagueRun?.active
    ? "隊伍已鎖定。調整 AI 方針同站位後，直接選擇對手開戰。"
    : "用 1000 Cost 組出參賽戰隊。模組係主要差異點，確認後會鎖定機體、核心同模組。";
  renderPilotPanel();
  if (currentLanguage === "en") {
    if (panelTitles[0]) panelTitles[0].textContent = "Tactical Core";
    if (panelTitles[1]) panelTitles[1].textContent = masterLeagueRun?.active ? "Deployment Mecha" : "Mecha Roster";
    if (panelTitles[2]) panelTitles[2].textContent = masterLeagueRun?.active ? "Deployment Formation" : "Formation";
    if (panelTitles[3]) panelTitles[3].textContent = "Challenge Opponents";
    if (arenaTitle) arenaTitle.textContent = masterLeagueRun?.active ? "Master League Arena" : "Master League";
    if (arenaCopy) arenaCopy.textContent = masterLeagueRun?.active
      ? "Squad locked. Adjust AI tactics and formation, then choose an opponent to fight."
      : "Build a challenge squad within 1000 Cost. Core modules define the main tactical style; individual modules tune each mecha.";
  } else if (panelTitles[3]) {
    panelTitles[3].textContent = "挑戰對手";
  }
  const cost = arenaBuildCost();
  const currentBand = masterLeagueRun?.active ? masterBandById(masterLeagueRun.bandId) : masterBandForScore(masterLeagueRun?.score || 0);
  arenaCostEl.textContent = masterLeagueRun?.active ? `${masterBandName(currentBand)} ${masterLeagueRun.score} pts` : `Cost ${cost} / ${ARENA_TOTAL_COST}`;
  arenaCostEl.classList.toggle("over", cost > ARENA_TOTAL_COST);
  arenaSaveEl.hidden = Boolean(masterLeagueRun?.active);
  arenaSaveEl.disabled = cost > ARENA_TOTAL_COST || arenaSyncing || Boolean(masterLeagueRun?.active);
  const arenaActionText = masterLeagueRun?.active ? ["隊伍已鎖定", "結束挑戰"] : ["確定參賽", "刷新資料"];
  arenaSaveEl.textContent = masterLeagueRun?.active ? "隊伍已鎖定" : "同步防守隊";
  arenaRefreshEl.textContent = masterLeagueRun?.active ? "結束挑戰" : "刷新對手";

  arenaSaveEl.textContent = arenaActionText[0];
  arenaRefreshEl.textContent = arenaActionText[1];

  const costPercent = clamp((cost / ARENA_TOTAL_COST) * 100, 0, 100);
  const nextBandForCost = masterLeagueRun?.active ? nextMasterBandForRun() : nextMasterBand(masterLeagueRun?.score || 0);
  arenaCostEl.innerHTML = masterLeagueRun?.active
    ? `<span>Band</span><strong>${masterBandName(currentBand)} ${masterLeagueRun.score} pts</strong><i><em style="width:${clamp(((masterLeagueRun.score || 0) / Math.max(1, nextBandForCost?.min || masterLeagueRun.score || 1)) * 100, 0, 100)}%"></em></i>`
    : `<span>Total Cost</span><strong>${cost} / ${ARENA_TOTAL_COST}</strong><i><em style="width:${costPercent}%"></em></i>`;
  arenaSaveEl.textContent = masterLeagueRun?.active ? "隊伍已鎖定" : "確定參賽";
  arenaRefreshEl.textContent = masterLeagueRun?.active ? "結束挑戰" : "刷新資料";

  if (currentLanguage === "en") {
    arenaSaveEl.textContent = masterLeagueRun?.active ? "Squad Locked" : "Confirm Entry";
    arenaRefreshEl.textContent = masterLeagueRun?.active ? "End Challenge" : "Refresh Data";
  }

  arenaCoreListEl.innerHTML = arenaCoreOptions.map((rawCore) => {
    const core = localizeArenaCoreOption(rawCore);
    return `
    <button class="arena-option ${core.id === arenaSelectedCore ? "selected" : ""}" data-core-id="${core.id}" type="button" ${masterLeagueRun?.active ? "disabled" : ""}>
      <img class="arena-card-icon" src="${assetSrc(arenaCoreIcons[core.id] || arenaCoreIcons["iron-wall"])}" alt="" aria-hidden="true" />
      <span class="arena-card-copy">
        <strong>${core.name}</strong>
        <span>${core.cost} Cost</span>
        <small>${core.text}</small>
      </span>
    </button>
  `;
  }).join("");

  const unitCards = arenaDefenseNames.map((name) => {
    const unit = squadSeeds.find((seed) => seed.name === name);
    const module = arenaModuleById(arenaModules[name]);
    const ai = arenaAiById(arenaAi[name]);
    const displayUnit = unit ? localizeUnit(unit) : null;
    return `
      <article class="arena-unit ${name === arenaSelectedUnitName ? "selected" : ""}" data-unit-name="${name}">
        <img src="${assetSrc(unit.art || unit.sprite)}" alt="${unit.name}" />
        <div>
          <h4>${unit.name}</h4>
          <p>${displayUnit?.role || ""}</p>
          <p>${module ? `${module.tier} / ${module.name} / ${module.cost} Cost` : "No module / 0 Cost"}</p>
          <p>AI: ${ai.name}</p>
        </div>
        <button class="arena-unit-focus" data-unit-name="${name}" type="button">${currentLanguage === "en" ? "Set" : "設定"}</button>
      </article>
    `;
  }).join("");
  const roster = squadSeeds.map((unit) => `
    <button class="arena-roster-unit ${arenaDefenseNames.includes(unit.name) ? "selected" : ""}" data-arena-pick="${unit.name}" type="button">
      <img src="${assetSrc(unit.sprite || unit.art)}" alt="${unit.name}" />
      <span>${unit.name}</span>
    </button>
  `).join("");
  const selectedModule = arenaModuleById(arenaModules[arenaSelectedUnitName]);
  const selectedAi = arenaAiById(arenaAi[arenaSelectedUnitName]);
  const selectedUnit = squadSeeds.find((seed) => seed.name === arenaSelectedUnitName) || squadSeeds[0];
  const displaySelectedUnit = localizeUnit(selectedUnit);
  const selectedPosition = arenaPositions[arenaSelectedUnitName];
  const selectedPositionLabel = Number.isFinite(Number(selectedPosition)) ? `Grid ${Number(selectedPosition) + 1}` : "Unset";
  const selectedUnitDetail = selectedUnit ? `
    <section class="arena-mecha-brief">
      <img src="${assetSrc(selectedUnit.art || selectedUnit.sprite)}" alt="${selectedUnit.name}" />
      <div>
        <p class="kicker">Mecha Intel</p>
        <h4>${displaySelectedUnit.name}</h4>
        <dl>
          <div><dt>${currentLanguage === "en" ? "Role" : "定位"}</dt><dd>${displaySelectedUnit.role || "-"}</dd></div>
          <div><dt>${currentLanguage === "en" ? "Weapon" : "武裝"}</dt><dd>${displaySelectedUnit.weapon || "-"}</dd></div>
        </dl>
        <p>${displaySelectedUnit.trait || ""}</p>
        <small>${displaySelectedUnit.tactic || ""}</small>
      </div>
    </section>
  ` : "";
  const selectedHeroDetail = selectedUnit ? `
    <section class="arena-mecha-brief arena-mecha-hero">
      <div class="arena-mecha-stage">
        <img src="${assetSrc(selectedUnit.art || selectedUnit.sprite)}" alt="${selectedUnit.name}" />
      </div>
      <div class="arena-mecha-copy">
        <p class="kicker">Selected Unit</p>
        <h4>${displaySelectedUnit.name}</h4>
        <dl>
          <div><dt>${currentLanguage === "en" ? "Role" : "定位"}</dt><dd>${displaySelectedUnit.role || "-"}</dd></div>
          <div><dt>${currentLanguage === "en" ? "Weapon" : "武器"}</dt><dd>${displaySelectedUnit.weapon || "-"}</dd></div>
          <div><dt>AI</dt><dd>${selectedAi.name}</dd></div>
          <div><dt>${currentLanguage === "en" ? "Position" : "站位"}</dt><dd>${selectedPositionLabel}</dd></div>
        </dl>
        <p>${displaySelectedUnit.trait || ""}</p>
        <small>${displaySelectedUnit.tactic || ""}</small>
      </div>
    </section>
  ` : "";
  const moduleCards = `
    <section class="arena-module-library">
      <div class="arena-module-head">
        <strong>${arenaSelectedUnitName} ${currentLanguage === "en" ? "Modules" : "模組"}</strong>
        <span>${selectedModule ? `${selectedModule.tier} / ${selectedModule.name} / ${selectedModule.cost} Cost` : `${currentLanguage === "en" ? "Unequipped" : "未裝備"} / 0 Cost`}</span>
      </div>
      <div class="arena-module-grid">
        <button class="arena-module-card ${!selectedModule ? "selected" : ""}" data-module-id="" type="button" ${masterLeagueRun?.active ? "disabled" : ""}>
          <img class="arena-card-icon" src="${assetSrc(arenaModuleIcons[""])}" alt="" aria-hidden="true" />
          <strong>No Module</strong>
          <span>0 Cost</span>
          <small>${currentLanguage === "en" ? "Costs nothing and keeps the unit at baseline performance." : "不消耗 Cost，保持基礎性能。"}</small>
        </button>
        ${arenaModuleOptions.map((rawOption) => {
          const option = localizeArenaModuleOption(rawOption);
          const duplicate = Object.entries(arenaModules).some(([unitName, moduleId]) => unitName !== arenaSelectedUnitName && moduleId === option.id);
          const selected = option.id === arenaModules[arenaSelectedUnitName];
          return `
            <button class="arena-module-card tier-${option.tier.toLowerCase()} ${selected ? "selected" : ""}" data-module-id="${option.id}" type="button" ${duplicate || masterLeagueRun?.active ? "disabled" : ""}>
              <img class="arena-card-icon" src="${assetSrc(arenaModuleIcons[option.id] || arenaModuleIcons[""])}" alt="" aria-hidden="true" />
              <strong>${option.tier} / ${option.name}</strong>
              <span>${option.cost} Cost${duplicate ? ` / ${currentLanguage === "en" ? "Already used" : "已被其他機體裝備"}` : ""}</span>
              <small>${option.text}</small>
            </button>
          `;
        }).join("")}
      </div>
    </section>
  `;
  const tacticCards = `
    <section class="arena-tactic-library">
      <div class="arena-module-head">
        <strong>${arenaSelectedUnitName} AI ${currentLanguage === "en" ? "Tactic" : "方針"}</strong>
        <span>${selectedAi.name}</span>
      </div>
      <div class="arena-tactic-grid">
        ${masterLeagueAiOptions.map((rawOption) => {
          const option = localizeArenaAiOption(rawOption);
          return `
          <button class="arena-tactic-card ${option.id === normalizeArenaAiId(arenaAi[arenaSelectedUnitName]) ? "selected" : ""}" data-ai-id="${option.id}" type="button">
            <img class="arena-card-icon" src="${assetSrc(masterLeagueAiIcons[option.id] || masterLeagueAiIcons.frontline)}" alt="" aria-hidden="true" />
            <strong>${option.name}</strong>
            <small>${option.text}</small>
          </button>
        `;
        }).join("")}
      </div>
    </section>
  `;
  const buildLayout = `
    <div class="arena-hangar-layout">
      <section class="arena-hangar-panel arena-formation-hangar">
        <div class="arena-section-head">
          <p class="kicker">Formation Hangar</p>
          <h4>${currentLanguage === "en" ? "Battle Line" : "出擊編隊"}</h4>
        </div>
        <div class="arena-formation-line">${unitCards}</div>
      </section>
      <section class="arena-hangar-panel arena-selected-loadout">
        ${selectedHeroDetail}
        ${moduleCards}
        ${tacticCards}
      </section>
      <section class="arena-roster-panel">
        <div class="arena-section-head">
          <p class="kicker">Mecha Roster</p>
          <h4>${currentLanguage === "en" ? "Reserve Units" : "機體庫"}</h4>
        </div>
        <div class="arena-roster">${roster}</div>
      </section>
    </div>
  `;
  arenaUnitListEl.innerHTML = masterLeagueRun?.active
    ? `${unitCards}${moduleCards}${tacticCards}`
    : buildLayout;

  arenaPositionGridEl.innerHTML = arenaPositionSlots.map((slot, index) => {
    const occupant = arenaDefenseNames.find((name) => Number(arenaPositions[name]) === index);
    const unit = occupant ? squadSeeds.find((seed) => seed.name === occupant) : null;
    return `
      <button class="arena-cell ${occupant ? "filled" : ""} ${occupant === arenaSelectedUnitName ? "selected" : ""}" data-position-index="${index}" type="button">
        ${unit ? `<img src="${assetSrc(unit.sprite || unit.art)}" alt="${unit.name}" /><span>${unit.name}</span>` : "<span>Empty</span>"}
      </button>
    `;
  }).join("");

  arenaOpponentListEl.innerHTML = renderMasterOpponentPanelV3();
  return;
  arenaOpponentListEl.innerHTML = arenaOpponents.length ? arenaOpponents.map((opponent, index) => `
    <article class="arena-opponent">
      <div>
        <strong>${opponent.name}</strong>
        <span>Rating ${opponent.rating || 1000}</span>
        <small>${opponent.defense?.squad?.join(" / ") || "Unknown squad"}</small>
      </div>
      <button data-opponent-index="${index}" type="button">挑戰</button>
    </article>
  `).join("") : `<p class="arena-empty">暫時未有其他防守隊。先同步你的隊伍，或者稍後刷新。</p>`;
}

function renderMasterOpponentPanel() {
  if (!masterLeagueRun?.active) {
    return `
      <article class="arena-opponent master-start-card">
        <div>
          <strong>Master League</strong>
          <span>鎖定目前隊伍開始短 Run</span>
          <small>每關 Easy / Normal / Hard 三選一，輸一次即結束。</small>
        </div>
        <button data-master-start type="button">開始</button>
      </article>
      ${arenaOpponents.slice(0, 5).map((opponent) => `
        <article class="arena-opponent preview-only">
          <div>
            <strong>${opponent.name}</strong>
            <span>Rating ${opponent.rating || 1000}</span>
            <small>${opponent.defense?.squad?.join(" / ") || "Unknown squad"}</small>
          </div>
        </article>
      `).join("")}
    `;
  }

  const currentBand = masterBandById(masterLeagueRun.bandId);
  const nextBand = nextMasterBandForRun();
  const runHead = `
    <article class="arena-opponent master-run-status">
      <div>
        <strong>Round ${masterLeagueRun.round} / ${currentBand.title}</strong>
        <span>Score ${masterLeagueRun.score}${nextBand ? ` / 升 ${nextBand.name}: ${nextBand.min}` : " / 最高 Band"}</span>
        <small>Streak ${masterLeagueRun.streak}，偵察後可改 AI 方針同站位。</small>
      </div>
    </article>
  `;

  if (arenaSelectedOpponent) {
    const opponent = arenaSelectedOpponent;
    return `${runHead}
      <article class="arena-opponent selected-opponent">
        <div>
          <strong>${opponent.name}</strong>
          <span>${opponent.difficulty?.label || "Normal"} / Rating ${opponent.rating || 1000}</span>
          <small>${opponent.defense?.squad?.join(" / ") || "Unknown squad"}</small>
        </div>
        <button data-master-fight type="button">開戰</button>
      </article>
      ${(opponent.defense?.squad || []).map((name) => {
        const unit = squadSeeds.find((seed) => seed.name === name);
        const module = arenaModuleById(opponent.defense?.modules?.[name]);
        const ai = arenaAiById(opponent.defense?.ai?.[name]);
        return `
          <article class="arena-opponent scout-row">
            <div>
              <strong>${name}</strong>
              <span>${unit?.role || "Unknown"}</span>
              <small>${module ? `${module.tier} ${module.name}` : "No module"} / AI: ${ai.name}</small>
            </div>
          </article>
        `;
      }).join("")}
      <article class="arena-opponent">
        <div>
          <strong>重新選擇</strong>
          <span>返回三個難度對手。</span>
        </div>
        <button data-master-cancel-opponent type="button">返回</button>
      </article>
    `;
  }

  const choices = masterLeagueRun.choices || [];
  return `${runHead}${choices.map((opponent, index) => `
    <article class="arena-opponent">
      <div>
        <strong>${opponent.difficulty.label}</strong>
        <span>${opponent.name.replace(`${opponent.difficulty.label} / `, "")}</span>
        <small>${opponent.defense?.squad?.join(" / ") || "Unknown squad"}</small>
      </div>
      <button data-master-choice="${index}" type="button">偵察</button>
    </article>
  `).join("")}`;
}

function renderMasterOpponentPanelV2() {
  if (!masterLeagueRun?.active) {
    return `
      <article class="arena-opponent master-start-card">
        <div>
          <strong>Master League</strong>
          <span>先確定參賽隊伍，再進入對手搜尋。</span>
          <small>隊伍鎖定後，每關仍可調整 AI 方針同站位。</small>
        </div>
        <button data-master-start type="button">確定參賽</button>
      </article>
    `;
  }

  const currentBand = masterBandById(masterLeagueRun.bandId);
  const nextBand = nextMasterBandForRun();
  const runHead = `
    <article class="arena-opponent master-run-status">
      <div>
        <strong>Round ${masterLeagueRun.round} / ${currentBand.title}</strong>
        <span>Score ${masterLeagueRun.score}${nextBand ? ` / 下一階 ${nextBand.name}: ${nextBand.min}` : " / 最高 Band"}</span>
        <small>偵察後可以調整 AI 方針同站位，然後按「對戰開始」。</small>
      </div>
    </article>
  `;

  const promotionOpponent = promotionOpponentForRun();
  if (promotionOpponent) {
    const squadText = promotionTeamText(promotionOpponent);
    const moduleCount = Object.values(promotionOpponent.defense?.modules || {}).filter(Boolean).length;
    return `${runHead}
      <div class="master-choice-list">
        <button class="arena-opponent master-choice-card difficulty-champion promotion-card" data-master-choice="0" type="button">
          ${renderOpponentIconStrip(promotionOpponent.defense)}
          <div>
            <strong>升階戰：${promotionOpponent.championBand.title}</strong>
            <span>${promotionOpponent.name} / Rating ${promotionOpponent.rating || 1000}</span>
            <small>現任盟主戰隊名：${promotionChampionLabel(promotionOpponent)}</small>
            <small>現任該階級盟主隊：${squadText}</small>
            <small>${promotionOpponent.difficulty?.powerLabel || ""} / 打贏先升上 ${promotionOpponent.championBand.name}</small>
          </div>
        </button>
      </div>`;
  }

  if (masterLeagueSearching) {
    return `${runHead}
      <article class="arena-opponent arena-search-card">
        <div class="arena-search-spinner" aria-hidden="true"></div>
        <div>
          <strong>正在尋找對手...</strong>
          <span>Master League matching signal</span>
          <small>系統會提供 Easy / Normal / Hard 三個 Ghost Team。</small>
        </div>
      </article>
    `;
  }

  if (arenaSelectedOpponent) {
    const opponent = arenaSelectedOpponent;
    return `${runHead}
      <article class="arena-opponent selected-opponent">
        <div>
          <strong>${opponent.name}</strong>
          <span>${opponent.difficulty?.label || "Normal"} / Rating ${opponent.rating || 1000}</span>
          <small>${opponent.defense?.squad?.join(" / ") || "Unknown squad"}</small>
        </div>
        <button data-master-fight type="button">對戰開始</button>
      </article>
      ${(opponent.defense?.squad || []).map((name) => {
        const unit = squadSeeds.find((seed) => seed.name === name);
        const module = arenaModuleById(opponent.defense?.modules?.[name]);
        const ai = arenaAiById(opponent.defense?.ai?.[name]);
        return `
          <article class="arena-opponent scout-row">
            <div>
              <strong>${name}</strong>
              <span>${unit?.role || "Unknown"}</span>
              <small>${module ? `${module.tier} ${module.name}` : "No module"} / AI: ${ai.name}</small>
            </div>
          </article>
        `;
      }).join("")}
      <article class="arena-opponent">
        <div>
          <strong>重新選擇對手</strong>
          <span>返回三選一列表，再揀 Easy / Normal / Hard。</span>
        </div>
        <button data-master-cancel-opponent type="button">返回</button>
      </article>
    `;
  }

  const choices = masterLeagueRun.choices || [];
  return `${runHead}${choices.map((opponent, index) => `
    <article class="arena-opponent">
      <div>
        <strong>${opponent.difficulty.label}</strong>
        <span>${opponent.name.replace(`${opponent.difficulty.label} / `, "")}</span>
        <small>${opponent.defense?.squad?.join(" / ") || "Unknown squad"}</small>
      </div>
      <button data-master-choice="${index}" type="button">偵察</button>
    </article>
  `).join("")}`;
}

function renderMasterOpponentPanelV3() {
  if (!masterLeagueRun?.active) {
    return `
      <article class="arena-opponent master-start-card">
        <div>
          <strong>Master League Arena</strong>
          <span>${currentLanguage === "en" ? "Build a 1000 Cost challenge squad before entering the arena." : "用 1000 Cost 組出參賽戰隊，確認後會鎖定機體同核心同模組。"}</span>
          <small>${currentLanguage === "en" ? "You can tune AI tactics and formation before each match." : "每場前可調整 AI 方針同站位，再選擇對手開戰。"}</small>
        </div>
        <button data-master-start type="button">${currentLanguage === "en" ? "Start Formation" : "開始編隊"}</button>
      </article>
    `;
  }

  const currentBandV3 = masterBandById(masterLeagueRun.bandId);
  const nextBand = nextMasterBandForRun();
  const runHead = `
    <article class="arena-opponent master-run-status">
      <div>
        <strong>Round ${masterLeagueRun.round} / ${masterBandTitle(currentBandV3)}</strong>
        <span>Score ${masterLeagueRun.score}${nextBand ? ` / ${currentLanguage === "en" ? "Next Band" : "下一階"} ${masterBandName(nextBand)}: ${nextBand.min}` : ` / ${currentLanguage === "en" ? "Top Band" : "最高 Band"}`}</span>
        <small>${currentLanguage === "en" ? "Adjust AI tactics and positions first, then pick one Easy / Normal / Hard opponent." : "先調整 AI 方針同站位；揀 Easy / Normal / Hard 其中一隊就即刻開戰。"}</small>
      </div>
    </article>
  `;

  const promotionOpponent = promotionOpponentForRun();
  if (promotionOpponent) {
    const squadText = promotionTeamText(promotionOpponent);
    const moduleCount = Object.values(promotionOpponent.defense?.modules || {}).filter(Boolean).length;
    return `${runHead}
      <div class="master-choice-list">
        <button class="arena-opponent master-choice-card difficulty-champion promotion-card" data-master-choice="0" type="button">
          ${renderOpponentIconStrip(promotionOpponent.defense)}
          <div>
            <strong>${currentLanguage === "en" ? "Promotion Match" : "升階戰"}: ${masterBandTitle(promotionOpponent.championBand)}</strong>
            <span>${promotionOpponent.name} / Rating ${promotionOpponent.rating || 1000}</span>
            <small>${currentLanguage === "en" ? "Current champion" : "現任盟主"}: ${promotionChampionLabel(promotionOpponent)}</small>
            <small>${currentLanguage === "en" ? "Champion squad" : "盟主戰隊組合"}: ${squadText}</small>
            <small>${promotionOpponent.difficulty?.powerLabel || ""} / ${currentLanguage === "en" ? "Win to enter" : "打贏先升上"} ${masterBandName(promotionOpponent.championBand)}</small>
          </div>
        </button>
      </div>`;
  }

  if (masterLeagueSearching) {
    return `${runHead}
      <article class="arena-opponent arena-search-card">
        <div class="arena-search-spinner" aria-hidden="true"></div>
        <div>
          <strong>${currentLanguage === "en" ? "Searching opponents..." : "正在尋找對手..."}</strong>
          <span>Master League matching signal</span>
          <small>${currentLanguage === "en" ? "System is generating three Ghost Teams." : "系統正在配對三隊 Ghost Team。"}</small>
        </div>
      </article>
    `;
  }

  const choices = masterLeagueRun.choices || [];
  return `${runHead}<div class="master-choice-list">${choices.map((opponent, index) => {
    const squadText = opponent.defense?.squad?.join(" / ") || "Unknown squad";
    const moduleCount = Object.values(opponent.defense?.modules || {}).filter(Boolean).length;
    return `
      <button class="arena-opponent master-choice-card difficulty-${opponent.difficulty.id}" data-master-choice="${index}" type="button">
        ${renderOpponentIconStrip(opponent.defense)}
        <div>
          <strong>${opponent.difficulty.label}</strong>
          <span>${opponent.name.replace(`${opponent.difficulty.label} / `, "")} / Rating ${opponent.rating || 1000}</span>
          <small>${squadText}</small>
          <small>${moduleCount} Modules / ${opponent.defense?.core || "core"} / ${currentLanguage === "en" ? "Pick to fight" : "揀選即開戰"}</small>
        </div>
      </button>
    `;
  }).join("")}</div>`;
}

async function syncPilotProfile(message = "Pilot profile synced.") {
  renderPilotPanel("同步玩家檔案中...");
  try {
    const response = await fetch("/api/player", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        playerId: pilotProfile.playerId,
        secret: pilotProfile.secret,
        profile: {
          ...pilotProfile,
          name: pilotNameInputEl?.value || pilotProfile.name,
          pvpDefense: arenaBuildPayload()
        }
      })
    });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.message || "Sync failed.");
    pilotRecoveryCode = data.recoveryCode || "";
    savePilotProfileLocal(data.profile);
    pilotCloudReady = true;
    renderPilotPanel(message);
  } catch (error) {
    pilotCloudReady = false;
    renderPilotPanel(`本機已保存；雲端同步失敗：${error.message}`);
  }
}

async function recoverPilotProfile() {
  const code = window.prompt("輸入 Pilot Code");
  if (!code) return;
  renderPilotPanel("讀取 Pilot Code 中...");
  try {
    const response = await fetch("/api/player", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "recover", code })
    });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.message || "Recover failed.");
    pilotRecoveryCode = data.recoveryCode || "";
    savePilotProfileLocal(data.profile);
    pilotCloudReady = true;
    applyProfileDefense();
    renderArena();
    renderPilotPanel("Pilot Code 已還原。");
  } catch (error) {
    renderPilotPanel(`還原失敗：${error.message}`);
  }
}

async function saveArenaDefense() {
  if (arenaBuildCost() > ARENA_TOTAL_COST) {
    renderPilotPanel("Cost 超出上限，請調整模組。");
    return;
  }
  arenaSyncing = true;
  renderArena();
  try {
    await syncPilotProfile("玩家檔案已同步。");
    const response = await fetch("/api/arena", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        playerId: pilotProfile.playerId,
        secret: pilotProfile.secret,
        name: pilotProfile.name,
        defense: arenaBuildPayload()
      })
    });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.message || "Arena save failed.");
    savePilotProfileLocal({ ...pilotProfile, pvpDefense: data.defense, pvpStats: data.pvpStats || pilotProfile.pvpStats });
    renderPilotPanel("Arena build synced.");
    await loadArenaOpponents();
  } catch (error) {
    renderPilotPanel(`Arena 同步失敗：${error.message}`);
  } finally {
    arenaSyncing = false;
    renderArena();
  }
}

async function loadArenaOpponents() {
  try {
    const response = await fetch(`/api/arena?playerId=${encodeURIComponent(pilotProfile.playerId)}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.message || "Load opponents failed.");
    saveLocalMasterChampions(data.champions || {});
    if (data.rankings) renderMasterLeaderboards(data.rankings, "即時 Master League 排行榜");
    const liveOpponents = data.opponents || [];
    const seen = new Set(liveOpponents.map((opponent) => opponent.playerId));
    arenaOpponents = [
      ...liveOpponents,
      ...arenaPresetOpponents.filter((opponent) => opponent.playerId !== pilotProfile.playerId && !seen.has(opponent.playerId))
    ].slice(0, 12);
  } catch {
    arenaOpponents = [...arenaPresetOpponents];
    arenaMasterChampions = loadLocalMasterChampions();
  }
  renderArena();
}

async function showArena() {
  running = false;
  setPauseButtonVisible(false);
  showLoading("Loading Arena...");
  if (masterLeagueRun?.active) syncEditableFromLockedBuild();
  else applyProfileDefense();
  await loadFormationArt();
  document.body.classList.add("setup-mode");
  briefingEl.hidden = true;
  arenaResultEl.hidden = true;
  formationEl.hidden = true;
  rewardEl.hidden = true;
  resultEl.hidden = true;
  arenaEl.hidden = false;
  renderArena();
  hideLoading();
  loadArenaOpponents();
  loadBattleArt();
}

function showBriefing() {
  resetMasterLeagueSession();
  running = false;
  paused = false;
  pausedAt = 0;
  setPauseButtonVisible(false);
  document.body.classList.add("setup-mode");
  arenaEl.hidden = true;
  arenaResultEl.hidden = true;
  formationEl.hidden = true;
  rewardEl.hidden = true;
  resultEl.hidden = true;
  briefingEl.hidden = false;
  resizeCanvas();
}

function applyArenaBuildToUnit(unit, defense, isDefender = false) {
  const core = arenaCoreById(defense.core);
  core?.apply?.(unit);
  const module = arenaModuleById(defense.modules?.[unit.name]);
  module?.apply?.(unit);
  unit.hp = unit.maxHp;
  unit.arenaCore = core?.id || "";
  unit.arenaModule = module?.id || "";
  unit.arenaAi = normalizeArenaAiId(defense.ai?.[unit.name] || "focus-attacker");
  unit.arenaDefender = isDefender;
  unit.faction = isDefender ? "Enemy" : "Allied";
  if (isDefender) {
    unit.radius = bodyRadius(unit) * 0.72;
    unit.points = 420;
    unit.pvpSprite = true;
    unit.type = "arena";
    unit.boss = false;
  }
}

function makeArenaDefenders(opponent) {
  const defense = opponent?.defense || arenaBuildPayload();
  const difficulty = opponent?.difficulty || masterLeagueDifficulties[1];
  return defense.squad.map((name, index) => {
    const seed = squadSeeds.find((unit) => unit.name === name) || squadSeeds[index] || squadSeeds[0];
    const slot = arenaPositionSlots[Number(defense.positions?.[name])] || arenaPositionSlots[index] || { x: W - 170, y: 190 + index * 90 };
    const unit = createBattleUnit(seed, `pvp-e${index}`, slot, { faction: "Enemy", move: { x: slot.x, y: slot.y }, command: "defend" });
    applyArenaBuildToUnit(unit, defense, true);
    unit.maxHp = Math.round(unit.maxHp * (difficulty.hp || 1));
    unit.hp = unit.maxHp;
    if (unit.damage > 0) unit.damage = Math.round(unit.damage * (difficulty.damage || 1) * 10) / 10;
    return unit;
  });
}

function prepareArenaAttackSquad() {
  const defense = masterLeagueRun?.active ? currentLeagueTacticalBuild() : arenaBuildPayload();
  return defense.squad.map((name, index) => {
    const seed = squadSeeds.find((unit) => unit.name === name) || squadSeeds[index] || squadSeeds[0];
    const defenseSlot = arenaPositionSlots[Number(defense.positions?.[name])] || arenaPositionSlots[index] || { x: W - 170, y: 190 + index * 90 };
    const attackX = 95 + (defenseSlot.col ?? index % 3) * 80;
    const slot = {
      x: clamp(attackX, ALLIED_MIN_X, ALLIED_MAX_X),
      y: defenseSlot.y
    };
    const unit = createBattleUnit(seed, `u${index}`, slot);
    applyArenaBuildToUnit(unit, defense, false);
    unit.move = { x: slot.x, y: slot.y };
    return unit;
  });
}

function applyOpeningEwarPulse(sourceTeam, targetTeam) {
  if (!sourceTeam.some((unit) => unit.hp > 0 && unit.arenaOpeningEwar)) return;
  targetTeam
    .filter((unit) => unit.hp > 0)
    .forEach((unit) => {
      unit.skillCooldown = Math.max(unit.skillCooldown || 0, 3);
      unit.ewarSlowTime = Math.max(unit.ewarSlowTime || 0, 3);
      unit.slowTime = Math.max(unit.slowTime || 0, 3);
      unit.jamTime = Math.max(unit.jamTime || 0, 3);
    });
  const center = targetTeam
    .filter((unit) => unit.hp > 0)
    .reduce((point, unit, index, list) => ({
      x: point.x + unit.x / list.length,
      y: point.y + unit.y / list.length
    }), { x: 0, y: 0 });
  burst(center.x || W * 0.5, center.y || H * 0.5, "#c37bff", 72);
  addSkillEffect("jam-aura", null, { x: center.x || W * 0.5, y: center.y || H * 0.5, radius: 360, color: "#c37bff", life: 1.35, follow: false });
}

async function startArenaChallenge(opponent) {
  if (!opponent?.defense?.squad?.length) return;
  showLoading("Loading Arena battle...");
  await syncPilotProfile("Pilot profile synced.");
  await loadBattleArt();
  battleMode = "arena";
  arenaOpponent = opponent;
  arenaTimeLeft = ARENA_TIME_LIMIT;
  paused = false;
  autoBattleEnabled = true;
  localStorage.setItem(AUTO_BATTLE_KEY, "1");
  clearAutoRewardTimer();
  arenaEl.hidden = true;
  arenaResultEl.hidden = true;
  document.body.classList.remove("setup-mode");
  resizeCanvas();
  squad = prepareArenaAttackSquad();
  arenaBattleStartHp = squad.reduce((sum, unit) => sum + unit.maxHp, 0);
  enemies = makeArenaDefenders(opponent);
  shots = [];
  sparks = [];
  gravityFields = [];
  skillEffects = [];
  applyOpeningEwarPulse(squad, enemies);
  applyOpeningEwarPulse(enemies, squad);
  wave = 1;
  score = 0;
  nextWaveAt = Number.POSITIVE_INFINITY;
  focusedUnit = squad[0];
  selected = null;
  pointer = null;
  hudCardsSignature = "";
  skillBarSignature = "";
  renderIntel(focusedUnit);
  updateHud();
  running = true;
  setPauseButtonVisible(true);
  updateAutoBattleControl();
  setMessage(`Arena: VS ${opponent.name}`);
  last = now();
  hideLoading();
}

function arenaTargetFor(defender, living) {
  const originalEnemies = enemies;
  enemies = living;
  try {
    return chooseArenaAiTarget(defender);
  } finally {
    enemies = originalEnemies;
  }
}

function arenaDefenderDamage(defender, target) {
  let damage = Math.max(1, defender.damage);
  if (defender.arenaRushTime > 0) damage *= 1.18;
  else if (defender.arenaLateDamagePenalty) damage *= defender.arenaLateDamagePenalty;
  if (defender.arenaFocusLens) {
    defender.focusLensTarget = target.id;
    defender.focusLensStacks = Math.min(5, (defender.focusLensStacks || 0) + 1);
    damage *= 1 + (defender.focusLensStacks || 0) * 0.045;
  }
  return damage;
}

function damageArenaAttacker(target, amount, color, source) {
  if (!target || target.hp <= 0) return;
  let finalAmount = amount * sourceDamageFactor(source);
  const targetIsOpponent = isBattleOpponent(source, target);
  if (source?.name?.startsWith("Eumist") && targetIsOpponent) {
    finalAmount *= 1 + getEumistMistMarks(target, source) * 0.04;
  }
  finalAmount *= unitDefenseFactor(target) * himawariDefenseFactor(target);
  const hpBefore = target.hp;
  target.hp = clamp(target.hp - finalAmount, 0, target.maxHp);
  const dealt = hpBefore - target.hp;
  recordBattleDamage(source, target, dealt);
  if (dealt > 0 && source?.name?.startsWith("Eumist") && targetIsOpponent) applyEumistMistMark(source, target);
  if (dealt > 0 && (target.accipioMarks || 0) > 0) triggerAccipioMarkHeal(target, source);
  if (hpBefore > 0 && target.hp <= 0) {
    recordBattleKill(source, target);
    if (source?.name !== "Accipio") chargeUltimateUnit(source, target.boss ? 55 : 28);
  }
  chargeUltimateByDamageTaken(target, dealt);
  burst(target.x, target.y, color, 8);
}

function healArenaDefender(source, ally, amount) {
  if (!ally || ally.hp <= 0) return;
  const hpBefore = ally.hp;
  ally.hp = clamp(ally.hp + amount, 0, ally.maxHp);
  recordBattleHealing(source, ally.hp - hpBefore);
  ally.regenGlow = Math.max(ally.regenGlow || 0, 0.3);
  shots.push({ x: source.x, y: source.y, tx: ally.x, ty: ally.y, color: source.color, life: 0.28, maxLife: 0.28, heal: true, source: source.id });
}

function withArenaDefenderContext(callback) {
  const playerSquad = squad;
  const defenderSquad = enemies;
  squad = defenderSquad;
  enemies = playerSquad;
  try {
    callback();
  } finally {
    squad = playerSquad;
    enemies = defenderSquad;
  }
}

function convertArenaDefenderShots(startIndex, defender) {
  const attackerIds = new Set(squad.map((unit) => unit.id));
  for (let index = startIndex; index < shots.length; index += 1) {
    const shot = shots[index];
    if (shot.source !== defender.id || !shot.damage || !attackerIds.has(shot.target)) continue;
    shot.arenaDamage = shot.damage;
    shot.arenaTarget = shot.target;
    delete shot.damage;
    delete shot.target;
  }
}

function updateArenaDefenderUpkeep(defender, dt) {
  defender.arenaRushTime = Math.max(0, (defender.arenaRushTime || 0) - dt);
  if (defender.arenaEmergencyRepair && defender.hp / defender.maxHp < 0.32) {
    defender.arenaEmergencyRepair = false;
    defender.hp = clamp(defender.hp + defender.maxHp * 0.24, 1, defender.maxHp);
    defender.shield = Math.max(defender.shield || 0, 3.5);
    addSkillEffect("repair-shield", defender, { radius: 120, color: "#62e6a7", life: 0.75 });
  }
  if (defender.arenaLastStand && defender.hp <= defender.maxHp * 0.1) {
    defender.arenaLastStand = false;
    defender.hp = Math.max(defender.hp, 1);
    defender.shield = Math.max(defender.shield || 0, 5);
    addSkillEffect("guardian", defender, { radius: 128, color: "#ffd166", life: 0.8 });
  }
}

function shouldArenaDefenderUseActive(defender) {
  if (!defender || defender.hp <= 0 || defender.skillCooldown > 0 || !enemies.some((unit) => unit.hp > 0)) return false;
  if (defender.ekAuraActive) return false;
  const teamUnderPressure = squad.some((ally) => ally.hp > 0 && (ally.hp / ally.maxHp < 0.92 || enemyPressureOn(ally)));
  if (defender.damage < 0 || defender.name === "Seraphim" || defender.name === "Helix" || defender.name === "Accipio") {
    return teamUnderPressure;
  }
  const target = chooseArenaAiTarget(defender);
  if (!target) return false;
  if (defender.name === "Caliburn") return dist(defender, target) <= (defender.rushRadius || 220) * 1.05;
  if (defender.name === "Valkyr") return dist(defender, target) <= (defender.valkyrTauntRange || 315);
  if (defender.name === "Nova") return weaponDistance(defender, target) <= Math.max(defender.range * 1.6, defender.rushRadius || 210);
  if (normalizeArenaAiId(defender.arenaAi).startsWith("guard-")) {
    return teamUnderPressure || weaponDistance(defender, target) <= defender.range * 1.08;
  }
  return true;
}

function shouldArenaDefenderUseUltimate(defender) {
  if (!defender || defender.hp <= 0 || (defender.ultCharge || 0) < (defender.ultMax || 100)) return false;
  const liveAttackers = enemies.filter((unit) => unit.hp > 0);
  if (!liveAttackers.length) return false;
  const teamInDanger = squad.some((ally) => ally.hp > 0 && ally.hp / ally.maxHp <= 0.72);
  if (defender.damage < 0 || defender.name === "Seraphim" || defender.name === "Helix" || defender.name === "Accipio") {
    return teamInDanger || squad.some((ally) => ally.hp <= 0);
  }
  const target = chooseArenaAiTarget(defender);
  return liveAttackers.length >= 3 || teamInDanger || (target && weaponDistance(defender, target) <= Math.max(defender.range * 1.12, 270));
}

function shouldArenaDefenderRetreat(defender, target) {
  if (!defender || !target || defender.damage <= 0 || defender.range <= 130) return false;
  const ai = normalizeArenaAiId(defender.arenaAi);
  if (arenaUnitRole(defender) === "tank" || ai === "frontline" || ai.startsWith("guard-")) return false;
  if (defender.name === "Caliburn" || defender.name === "Nova" || defender.name.startsWith("Eumist") || defender.name.startsWith("MEGA")) return false;
  return weaponDistance(defender, target) < defender.range * 0.34;
}

function castArenaDefenderSkills(defender) {
  if (shouldArenaDefenderUseActive(defender)) activateSkill(defender);
  if (shouldArenaDefenderUseUltimate(defender)) useUltimate(defender);
}

function updateArenaDefenderSmart(defender, dt) {
  if (defender.hp <= 0) return;
  updateArenaDefenderUpkeep(defender, dt);
  const shotStart = shots.length;
  withArenaDefenderContext(() => {
    const frontlineTarget = chooseAutoTarget(defender);
    if (frontlineTarget && normalizeArenaAiId(defender.arenaAi) === "frontline") {
      defender.target = frontlineTarget.id;
      defender.assistId = null;
      defender.command = defender.damage < 0 ? "support" : "attack";
      const arenaAnchor = arenaAiAnchor(defender, frontlineTarget);
      const skillAnchor = arenaAnchor ? null : (bestOffensiveSkillAnchor(defender) || bestUltimateSkillAnchor(defender));
      defender.move = arenaAnchor || skillAnchor || null;
      if (arenaAnchor || skillAnchor) defender.command = "move";
      if (skillAnchor) {
        stepUnit(defender, dt);
        convertArenaDefenderShots(shotStart, defender);
        return;
      }
      castArenaDefenderSkills(defender);
      stepUnit(defender, dt);
      convertArenaDefenderShots(shotStart, defender);
      return;
    }
    const allySkillAnchor = autoAllySkillAnchor(defender);
    const ownSupportAnchor = allySkillAnchor ? null : autoSupportAnchor(defender);
    const anchor = allySkillAnchor || ownSupportAnchor;
    if (anchor) {
      defender.target = null;
      defender.move = {
        x: clamp(anchor.x, ALLIED_MIN_X, ALLIED_MAX_X),
        y: clamp(anchor.y, ALLIED_MIN_Y, ALLIED_MAX_Y)
      };
      defender.assistId = null;
      defender.command = "move";
    } else {
      const target = chooseAutoTarget(defender);
      if (target) {
        defender.target = target.id;
        defender.assistId = null;
        defender.command = defender.damage < 0 ? "support" : "attack";
        const arenaAnchor = arenaAiAnchor(defender, target);
        if (arenaAnchor) {
          defender.target = target.id;
          defender.move = arenaAnchor;
          defender.command = "move";
        } else {
          const skillAnchor = bestOffensiveSkillAnchor(defender) || bestUltimateSkillAnchor(defender);
          if (skillAnchor) {
            defender.move = skillAnchor;
            defender.command = "move";
          } else if (shouldArenaDefenderRetreat(defender, target)) {
            defender.move = {
              x: clamp(defender.x + Math.sign(defender.x - target.x || 1) * 78, ALLIED_MIN_X, ALLIED_MAX_X),
              y: clamp(defender.y + (defender.y >= target.y ? 52 : -52), ALLIED_MIN_Y, ALLIED_MAX_Y)
            };
            defender.command = "move";
          } else {
            defender.move = null;
          }
        }
      }
    }
    castArenaDefenderSkills(defender);
    stepUnit(defender, dt);
  });
  convertArenaDefenderShots(shotStart, defender);
}

function updateArenaDefender(defender, dt) {
  return updateArenaDefenderSmart(defender, dt);
  if (defender.hp <= 0) return;
  defender.cooldown = Math.max(0, defender.cooldown - dt);
  defender.skillCooldown = Math.max(0, (defender.skillCooldown || 0) - dt);
  defender.attackPulse = Math.max(0, (defender.attackPulse || 0) - dt);
  defender.arenaRushTime = Math.max(0, (defender.arenaRushTime || 0) - dt);
  if (defender.arenaEmergencyRepair && defender.hp / defender.maxHp < 0.32) {
    defender.arenaEmergencyRepair = false;
    defender.hp = clamp(defender.hp + defender.maxHp * 0.24, 1, defender.maxHp);
    defender.shield = Math.max(defender.shield || 0, 3.5);
    addSkillEffect("repair-shield", defender, { radius: 120, color: "#62e6a7", life: 0.75 });
  }
  if (defender.arenaLastStand && defender.hp <= defender.maxHp * 0.1) {
    defender.arenaLastStand = false;
    defender.hp = Math.max(defender.hp, 1);
    defender.shield = Math.max(defender.shield || 0, 5);
    addSkillEffect("guardian", defender, { radius: 128, color: "#ffd166", life: 0.8 });
  }
  const livingAttackers = squad.filter((unit) => unit.hp > 0 && (unit.stealthTime || 0) <= 0);
  if (!livingAttackers.length) return;
  if (defender.damage < 0) {
    const ally = enemies.filter((unit) => unit.hp > 0 && unit.hp < unit.maxHp).sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];
    if (ally && dist(defender, ally) > defender.range * 0.92) moveToward(defender, ally, defender.speed * dt);
    if (ally && dist(defender, ally) <= defender.range && defender.cooldown <= 0) {
      defender.cooldown = defender.rate;
      healArenaDefender(defender, ally, Math.abs(defender.damage) * 0.9);
    }
    return;
  }
  const target = arenaTargetFor(defender, livingAttackers);
  if (!target) return;
  defender.target = target.id;
  const d = weaponDistance(defender, target);
  if (d > defender.range) moveToward(defender, target, defender.speed * dt);
  if (d <= defender.range && defender.cooldown <= 0) {
    defender.cooldown = defender.rate + Math.random() * 0.16;
    defender.attackPulse = 0.2;
    defender.aim = { x: target.x, y: target.y };
    const damage = arenaDefenderDamage(defender, target);
    shots.push({ x: defender.x, y: defender.y, tx: target.x, ty: target.y, color: defender.color, life: 0.24, maxLife: 0.24, arenaDamage: damage, arenaTarget: target.id, source: defender.id });
  }
}

async function submitArenaResult(won) {
  try {
    if (!pilotCloudReady) await syncPilotProfile("提交結果前同步玩家檔案...");
    if (!pilotCloudReady) throw new Error("Pilot profile is not synced.");
    const defeatedChampionBandId = lastDefeatedChampionBandId;
    const masterLeague = masterLeagueRun ? {
      runId: masterLeagueRun.runId || "",
      score: masterLeagueRun.score || 0,
      bandId: masterLeagueRun.bandId || masterBandForScore(masterLeagueRun.score || 0).id,
      championBandId: defeatedChampionBandId || arenaOpponent?.championBand?.id || "",
      defense: currentLeagueTacticalBuild(),
      active: Boolean(masterLeagueRun.active)
    } : null;
    const response = await fetch("/api/arena", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "result", playerId: pilotProfile.playerId, secret: pilotProfile.secret, opponentId: arenaOpponent?.playerId, won, score, masterLeague })
    });
    const data = await response.json();
    if (response.ok && data.ok) {
      if (data.champions) saveLocalMasterChampions(data.champions);
      if (data.rankings) renderMasterLeaderboards(data.rankings, "即時 Master League 排行榜已更新");
      savePilotProfileLocal({ ...pilotProfile, pvpStats: data.pvpStats, masterLeague: data.masterLeague || pilotProfile.masterLeague });
    }
  } catch (error) {
    renderPilotPanel(`Arena 結果提交失敗：${error.message}`);
  } finally {
    lastDefeatedChampionBandId = "";
  }
}

async function endArena(won) {
  if (!running) return;
  running = false;
  const scoreDetail = calculateMasterBattleScore(won);
  score = scoreDetail.total;
  if (masterLeagueRun?.active) {
    masterLeagueRun.lastScoreDetail = scoreDetail;
    if (won) {
      masterLeagueRun.score += scoreDetail.total;
      masterLeagueRun.streak += 1;
      if (arenaOpponent?.championBand) {
        lastDefeatedChampionBandId = arenaOpponent.championBand.id;
        rememberLocalChampion(arenaOpponent.championBand, masterLeagueRun.score);
        masterLeagueRun.bandId = arenaOpponent.championBand.id;
        masterLeagueRun.pendingChampionBand = null;
        masterLeagueRun.round += 1;
        queueMasterOpponentSearch();
      } else {
        const nextBand = nextMasterBandForRun();
        if (nextBand && masterLeagueRun.score >= nextBand.min) {
          masterLeagueRun.pendingChampionBand = nextBand.id;
          arenaSelectedOpponent = makeChampionOpponent(nextBand);
          masterLeagueRun.choices = [arenaSelectedOpponent];
          masterLeagueSearching = false;
        } else {
          masterLeagueRun.round += 1;
          queueMasterOpponentSearch();
        }
      }
    } else {
      if (masterLeagueSearchTimer) window.clearTimeout(masterLeagueSearchTimer);
      masterLeagueSearching = false;
      masterLeagueRun.pendingChampionBand = null;
      arenaSelectedOpponent = null;
      masterLeagueRun.active = false;
    }
  }
  if (masterLeagueRun?.score > 0) {
    saveLocalMasterLeaderboard({
      runId: masterLeagueRun.runId || "",
      playerId: pilotProfile?.playerId || "",
      name: pilotProfile?.name || "Pilot",
      score: masterLeagueRun.score,
      bandId: masterLeagueRun.bandId || masterBandForScore(masterLeagueRun.score).id,
      team: currentLeagueTacticalBuild().squad,
      submittedAt: new Date().toISOString()
    });
  }
  await submitArenaResult(won);
  showArenaResult(won);
}

function showArenaResultLegacy(won) {
  running = false;
  setPauseButtonVisible(false);
  document.body.classList.add("setup-mode");
  resizeCanvas();
  const survivors = squad.filter((unit) => unit.hp > 0);
  const defenderSurvivors = enemies.filter((unit) => unit.hp > 0);
  arenaResultTitleEl.textContent = won ? "Arena Victory" : "Arena Defeat";
  arenaResultCopyEl.innerHTML = `
    <div>
      <span class="kicker">Arena Score</span>
      <div class="arena-result-score">${score}</div>
    </div>
    <div class="arena-result-lines">
      <span>${won ? `擊破 ${arenaOpponent?.name || "opponent"} 的防守隊。` : `${arenaOpponent?.name || "Opponent"} 守住了戰線。`}</span>
      <span>剩餘時間 ${Math.ceil(arenaTimeLeft)} 秒 / 攻方存活 ${survivors.length} 機 / 守方存活 ${defenderSurvivors.length} 機</span>
    </div>
    <div class="arena-result-build">
      <span>對手核心：${arenaCoreById(arenaOpponent?.defense?.core)?.name || "Unknown"}</span>
      <span>對手隊伍：${arenaOpponent?.defense?.squad?.join(" / ") || "Unknown"}</span>
      <span>你的 Arena rating：${pilotProfile?.pvpStats?.rating || 1000}</span>
    </div>
  `;
  resultEl.hidden = true;
  rewardEl.hidden = true;
  formationEl.hidden = true;
  arenaEl.hidden = true;
  briefingEl.hidden = true;
  arenaResultEl.hidden = false;
}

function arenaBattleDuration() {
  return Math.max(1, ARENA_TIME_LIMIT - arenaTimeLeft);
}

function arenaReportRows() {
  const duration = arenaBattleDuration();
  return squad.map((unit) => {
    const stats = ensureBattleStats(unit);
    const efficiency = stats.damage + stats.healing * 0.82 + stats.kills * 180 + stats.assists * 90 - stats.taken * 0.22;
    return {
      unit,
      stats,
      dps: stats.damage / duration,
      hps: stats.healing / duration,
      efficiency
    };
  }).sort((a, b) => b.efficiency - a.efficiency);
}

function arenaRoleTitle(row) {
  const { unit, stats } = row;
  if (stats.healing >= stats.damage * 0.8 && stats.healing > 20) return "LIFELINE";
  if (stats.taken >= 120 && unit.maxHp >= 150) return "ANCHOR";
  if (stats.kills >= 2) return "EXECUTOR";
  if (row.dps >= 18) return "DAMAGE CORE";
  if (stats.assists >= 2) return "FIRE CONTROL";
  return unit.damage < 0 ? "SUPPORT" : "LINE UNIT";
}

function arenaTacticalAnalysis(won, rows) {
  const top = rows[0];
  const damageLead = [...rows].sort((a, b) => b.stats.damage - a.stats.damage)[0];
  const healLead = [...rows].sort((a, b) => b.stats.healing - a.stats.healing)[0];
  const tankLead = [...rows].sort((a, b) => b.stats.taken - a.stats.taken)[0];
  const totalDamage = rows.reduce((sum, row) => sum + row.stats.damage, 0);
  const totalHealing = rows.reduce((sum, row) => sum + row.stats.healing, 0);
  const totalKills = rows.reduce((sum, row) => sum + row.stats.kills, 0);
  if (currentLanguage === "en") {
    const tone = won
      ? `${top.unit.name} was the MVP with the strongest ${arenaRoleTitle(top)} contribution.`
      : `${top.unit.name} still led the tactical contribution, but the squad could not break through.`;
    const pressure = tankLead?.stats.taken > totalDamage * 0.32
      ? `${tankLead.unit.name} absorbed heavy pressure; consider wider backline spacing or a guard tactic next run.`
      : "Incoming pressure was fairly even, with no single unit carrying all the damage.";
    const sustain = totalHealing > 0
      ? `${healLead.unit.name} provided ${Math.round(healLead.stats.healing)} healing and added real sustain.`
      : "The squad had almost no healing output; survival will depend on shields, spacing, or guard tactics.";
    const killNote = totalKills >= 4
      ? `${damageLead.unit.name} drove the finishing rhythm with clean kill conversion.`
      : `${damageLead.unit.name} led damage, but kill conversion can still improve.`;
    return [tone, killNote, sustain, pressure];
  }
  const tone = won
    ? `${top.unit.name} 係今場 MVP，${arenaRoleTitle(top)} 指標最高。`
    : `${top.unit.name} 仍然打出最高戰術貢獻，但隊伍未能完成突破。`;
  const pressure = tankLead?.stats.taken > totalDamage * 0.32
    ? `${tankLead.unit.name} 承受火力偏高，下場可考慮拉開後排或改保命方針。`
    : "承傷分佈平均，陣型未有明顯崩口。";
  const sustain = totalHealing > 0
    ? `${healLead.unit.name} 提供 ${Math.round(healLead.stats.healing)} 修復量，續航有實際貢獻。`
    : "隊伍幾乎無修復來源，勝負會更依賴首波爆發。";
  const killNote = totalKills >= 4
    ? `${damageLead.unit.name} 主導收割，輸出節奏乾淨。`
    : `${damageLead.unit.name} 輸出最高，但擊殺轉化仍可再提高。`;
  return [tone, killNote, sustain, pressure];
}

function renderArenaBattleReport(won) {
  const rows = arenaReportRows();
  const duration = arenaBattleDuration();
  const totalDamage = rows.reduce((sum, row) => sum + row.stats.damage, 0);
  const totalHealing = rows.reduce((sum, row) => sum + row.stats.healing, 0);
  const totalTaken = rows.reduce((sum, row) => sum + row.stats.taken, 0);
  const totalKills = rows.reduce((sum, row) => sum + row.stats.kills, 0);
  const mvp = rows[0];
  return `
    <section class="arena-report">
      <div class="arena-report-head">
        <div>
          <span class="kicker">Tactical Report</span>
          <h3>${currentLanguage === "en" ? (won ? "Tactical Breakthrough" : "Defence Line Held") : (won ? "戰術突破成功" : "防線未能突破")}</h3>
          <p>${arenaOpponent?.name || "Opponent"} / Combat time ${Math.round(duration)}s</p>
        </div>
        <div class="arena-mvp">
          <span>MVP</span>
          <strong>${mvp?.unit.name || "-"}</strong>
          <small>${mvp ? arenaRoleTitle(mvp) : "NO DATA"}</small>
        </div>
      </div>
      <div class="arena-report-metrics">
        <div><span>Total DMG</span><strong>${Math.round(totalDamage)}</strong></div>
        <div><span>Total Heal</span><strong>${Math.round(totalHealing)}</strong></div>
        <div><span>Kills</span><strong>${totalKills}</strong></div>
        <div><span>Damage Taken</span><strong>${Math.round(totalTaken)}</strong></div>
      </div>
      <div class="arena-analysis">
        ${arenaTacticalAnalysis(won, rows).map((line) => `<p>${line}</p>`).join("")}
      </div>
      <div class="arena-stat-table" role="table" aria-label="Arena battle statistics">
        <div class="arena-stat-row head" role="row">
          <span>Unit</span><span>DPS</span><span>Kill</span><span>Assist</span><span>Heal</span><span>Taken</span><span>Skill</span>
        </div>
        ${rows.map((row) => `
          <div class="arena-stat-row" role="row">
            <span><strong>${row.unit.name}</strong><small>${arenaRoleTitle(row)}</small></span>
            <span>${row.dps.toFixed(1)}</span>
            <span>${row.stats.kills}</span>
            <span>${row.stats.assists}</span>
            <span>${Math.round(row.stats.healing)}</span>
            <span>${Math.round(row.stats.taken)}</span>
            <span>${row.stats.skillUses}/${row.stats.ultUses}</span>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function showArenaResult(won) {
  running = false;
  setPauseButtonVisible(false);
  document.body.classList.add("setup-mode");
  resizeCanvas();
  const survivors = squad.filter((unit) => unit.hp > 0);
  const defenderSurvivors = enemies.filter((unit) => unit.hp > 0);
  const detail = masterLeagueRun?.lastScoreDetail || calculateMasterBattleScore(won);
  const runScore = masterLeagueRun?.score || score;
  const band = masterLeagueRun?.active ? masterBandById(masterLeagueRun.bandId) : masterBandForScore(runScore);
  const nextBand = masterLeagueRun?.active ? nextMasterBandForRun() : nextMasterBand(runScore);
  const championPending = Boolean(won && masterLeagueRun?.pendingChampionBand && arenaSelectedOpponent?.championBand);
  const isEn = currentLanguage === "en";
  const promotionChampionLine = championPending
    ? (isEn
      ? `Next match is a promotion battle: ${masterBandTitle(arenaSelectedOpponent.championBand)}; current champion squad: ${promotionTeamText(arenaSelectedOpponent)}`
      : `下一場係升階戰：${arenaSelectedOpponent.championBand.title}；現任該階級盟主隊：${promotionTeamText(arenaSelectedOpponent)}`)
    : "";
  const promotionLine = championPending
    ? (isEn
      ? `Defeat this champion to enter ${masterBandName(arenaSelectedOpponent.championBand)}.`
      : `打贏現任盟主先可以升上 ${arenaSelectedOpponent.championBand.name}`)
    : "";
  arenaResultTitleEl.textContent = won ? "Master League Victory" : "Master League End";
  arenaResultCopyEl.innerHTML = `
    <div class="arena-score-summary">
      <div>
        <span class="kicker">${isEn ? "Battle Score" : "本場分數"}</span>
        <div class="arena-result-score">${detail.total}</div>
      </div>
      <div class="arena-total-score">
        <span class="kicker">${isEn ? "Total Run Score" : "累計總分"}</span>
        <strong>${formatScore(runScore)}</strong>
        <small>${masterBandName(band)}${nextBand ? ` / ${isEn ? "Next" : "下一階"} ${formatScore(nextBand.min)}` : ` / ${isEn ? "Top Band" : "最高階級"}`}</small>
      </div>
    </div>
    <div class="arena-result-lines">
      <span>${won ? (isEn ? `Defeated ${arenaOpponent?.name || "opponent"}.` : `擊破 ${arenaOpponent?.name || "opponent"}。`) : (isEn ? `${arenaOpponent?.name || "Opponent"} held the line. Run ended.` : `${arenaOpponent?.name || "Opponent"} 守住戰線，Run 結束。`)}</span>
      <span>${isEn ? "Current Band" : "目前階級"} ${masterBandName(band)}${nextBand ? ` / ${isEn ? "Next threshold" : "下一門檻"} ${formatScore(nextBand.min)}` : ` / ${isEn ? "Top Band" : "最高 Band"}`}</span>
      <span>${isEn ? "Time Left" : "剩餘"} ${Math.ceil(arenaTimeLeft)}s / ${isEn ? "Attackers Alive" : "攻方存活"} ${survivors.length} / ${isEn ? "Defenders Alive" : "守方存活"} ${defenderSurvivors.length}</span>
    </div>
    <div class="arena-result-build">
      <span>Base ${detail.base} / HP +${detail.hpBonus} / Time +${detail.timeBonus} / Cost +${detail.costBonus}</span>
      <span>Streak +${detail.streakBonus} / Death -${detail.deathPenalty} / Champion +${detail.championBonus}</span>
      ${promotionChampionLine ? `<span>${promotionChampionLine}</span>` : ""}
      ${promotionLine ? `<span>${promotionLine}</span>` : ""}
      <span>${championPending ? (isEn ? "Promotion battle unlocked. Win the next match to rank up." : "下一場將會係升階戰，打贏先可以升 Band。") : won ? (isEn ? "Victory. You may continue to the next match." : "勝利，可繼續下一關。") : (isEn ? "Defeat. Run ended and current score is recorded." : "失敗，Run 結束並結算目前分數。")}</span>
    </div>
    ${renderArenaBattleReport(won)}
  `;
  arenaResultRematchEl.textContent = championPending ? (isEn ? "Enter Promotion" : "進入升階戰") : won && masterLeagueRun?.active ? (isEn ? "Continue Run" : "繼續挑戰") : (isEn ? "New Run" : "再開一局");
  arenaResultBackEl.textContent = isEn ? "Back to Arena" : "返回 Arena";
  resultEl.hidden = true;
  rewardEl.hidden = true;
  formationEl.hidden = true;
  arenaEl.hidden = true;
  briefingEl.hidden = true;
  arenaResultEl.hidden = false;
}

function resetMasterLeagueSession() {
  if (masterLeagueSearchTimer) window.clearTimeout(masterLeagueSearchTimer);
  masterLeagueSearchTimer = 0;
  masterLeagueSearching = false;
  masterLeagueRun = null;
  arenaSelectedOpponent = null;
  arenaOpponent = null;
  battleMode = "normal";
  applyProfileDefense();
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
  arenaEl.hidden = true;
  arenaResultEl.hidden = true;
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
  battleMode = "campaign";
  formationEl.hidden = true;
  arenaResultEl.hidden = true;
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
  const renderRows = (entries, className) => entries.map((sourceUnit) => {
    const unit = localizeUnit(sourceUnit);
    return `
    <article class="db-row ${className}">
      <img src="${assetSrc(unit.art || unit.sprite)}" alt="${unit.name} design" />
      <div>
        <h3>${unit.name}</h3>
        <p>${labelFaction(unit.faction)} / ${unit.role}</p>
        <p>${unit.trait}</p>
      </div>
    </article>
  `;
  }).join("");
  databaseListEl.innerHTML = `
    <h3 class="db-heading player">${t("playerUnits")}</h3>
    ${renderRows(squadSeeds, "player")}
    <h3 class="db-heading enemy">${t("enemyUnits")}</h3>
    ${renderRows(Object.values(enemyTypes), "enemy")}
  `;
}

function drawBackground() {
  const bg = art.get(battleMode === "arena" ? arenaBattlefieldArt : battlefieldArt);
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
  if (battleMode !== "arena") drawEnergyBoundary();
  ctx.fillStyle = "rgba(75,228,255,0.08)";
  ctx.fillRect(0, H - 72, W, 72);
}

function drawEnergyBoundary() {
  const x = W * 0.75;
  const time = now();
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
    const wave = Math.sin(time * 2.6 + i * 1.7) * 10;
    ctx.strokeStyle = i % 2 ? "rgba(255,255,255,0.48)" : "rgba(75,228,255,0.72)";
    ctx.lineWidth = i === 2 ? 3 : 1.5;
    ctx.beginPath();
    for (let y = -20; y <= H + 20; y += 24) {
      const px = x + Math.sin(y * 0.035 + time * 3.2 + i) * (10 + i * 2) + wave;
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
  ctx.fillText(t("boundary"), x, 34);
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

function spriteFacingScale(actor) {
  const desired = actor?.faction === "Enemy" ? "left" : "right";
  const original = actor?.spriteFacing || "right";
  return original === desired ? 1 : -1;
}

function drawSheetSprite(unit, width, height, yOffset = 0) {
  const img = art.get(unit.sprite || unit.sheet);
  if (!img?.complete || img.naturalWidth <= 0) return false;
  ctx.shadowColor = unit.color;
  ctx.shadowBlur = selected?.id === unit.id || focusedUnit?.id === unit.id ? 28 : 14;
  const facing = spriteFacingScale(unit);
  if (facing < 0) ctx.scale(-1, 1);
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

function drawShieldBubble(cx, cy, radius, subtle = false) {
  const pulse = Math.sin(now() * 8) * 2.5;
  ctx.save();
  ctx.shadowColor = "#4be4ff";
  ctx.shadowBlur = subtle ? 8 : 14;
  ctx.strokeStyle = subtle ? "rgba(220,255,255,0.46)" : "rgba(220,255,255,0.78)";
  ctx.lineWidth = subtle ? 2 : 3.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + pulse, 0, Math.PI * 2);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.globalAlpha = subtle ? 0.055 : 0.16;
  const gradient = ctx.createRadialGradient(cx - radius * 0.25, cy - radius * 0.32, radius * 0.2, cx, cy, radius);
  gradient.addColorStop(0, "rgba(255,255,255,0.5)");
  gradient.addColorStop(0.42, "rgba(75,228,255,0.2)");
  gradient.addColorStop(1, "rgba(75,228,255,0.02)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = subtle ? 0.32 : 0.62;
  ctx.strokeStyle = subtle ? "rgba(98,246,176,0.48)" : "rgba(75,228,255,0.78)";
  ctx.lineWidth = subtle ? 1.25 : 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.78 + pulse * 0.4, -0.28 * Math.PI, 0.18 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.78 + pulse * 0.4, 0.72 * Math.PI, 1.18 * Math.PI);
  ctx.stroke();

  ctx.globalAlpha = subtle ? 0.22 : 0.48;
  ctx.lineWidth = subtle ? 1 : 1.4;
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
      drawShieldBubble(unit.x, unit.y - 8, 50, false);
    }
    drawAccipioEnemyMarks(unit);
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
    drawShieldBubble(0, 0, 44, false);
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
  drawAccipioEnemyMarks(unit);
  drawBar(unit.x - 34, unit.y + 42, 68, unit.hp / unit.maxHp, "#62e6a7");
}

function drawEnemy(enemy) {
  if (enemy.hp <= 0) return;
  const offset = attackOffset(enemy);
  ctx.save();
  ctx.translate(enemy.x + offset.x, enemy.y + offset.y);
  ctx.rotate(Math.sin(now() * 5 + enemy.y) * 0.08);
  if (enemy.pvpSprite) {
    const size = 100 * (enemy.spriteScale || 1);
    if (drawSheetSprite(enemy, size, size, -4)) {
      ctx.restore();
      drawAccipioEnemyMarks(enemy);
      drawBar(enemy.x - 32, enemy.y + 48, 64, enemy.hp / enemy.maxHp, "#ff5b66");
      return;
    }
  }
  const size = (enemy.type === "commander" ? 94 : 82) * getEnemyScale(enemy);
  if (drawSheetSprite(enemy, size, size, -2)) {
    ctx.restore();
    drawAccipioEnemyMarks(enemy);
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
  drawAccipioEnemyMarks(enemy);
  drawBar(enemy.x - 28, enemy.y + enemy.radius + 10, 56, enemy.hp / enemy.maxHp, "#ff5b66");
}

function drawAccipioEnemyMarks(enemy) {
  const marks = enemy.accipioMarks || 0;
  if (marks <= 0 || enemy.hp <= 0) return;
  ctx.save();
  ctx.globalAlpha = clamp((enemy.accipioMarkTime || 0) / 8, 0.28, 0.92);
  ctx.shadowColor = "#62f6b0";
  ctx.shadowBlur = 16;
  ctx.strokeStyle = "#62f6b0";
  ctx.fillStyle = "rgba(98,246,176,0.22)";
  ctx.lineWidth = 2;
  const startX = enemy.x - (marks - 1) * 8;
  for (let i = 0; i < marks; i++) {
    const x = startX + i * 16;
    const y = enemy.y - bodyRadius(enemy) - 18 - Math.sin(now() * 5 + i) * 2;
    ctx.beginPath();
    ctx.moveTo(x, y - 8);
    ctx.lineTo(x + 7, y);
    ctx.lineTo(x, y + 8);
    ctx.lineTo(x - 7, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
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
    } else if (effect.type === "eumist-slash") {
      const tx = effect.tx ?? point.x + radius;
      const ty = effect.ty ?? point.y;
      const base = Math.atan2(ty - point.y, tx - point.x);
      const reach = Math.min(radius, Math.hypot(tx - point.x, ty - point.y));
      const px = Math.cos(base);
      const py = Math.sin(base);
      const cx = point.x + px * reach * (0.62 + age * 0.26);
      const cy = point.y - 10 + py * reach * (0.62 + age * 0.26);
      const arcRadius = 26 + age * 10;
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(223,252,255,0.92)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx, cy, arcRadius, base - 0.95, base + 0.95);
      ctx.stroke();
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 3;
      for (let i = -1; i <= 1; i++) {
        const offset = i * 0.18;
        ctx.beginPath();
        ctx.arc(cx - px * i * 5, cy - py * i * 5, arcRadius * (0.72 + i * 0.08), base - 0.8 + offset, base + 0.8 + offset);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(102,242,228,0.22)";
      for (let i = 0; i < 4; i++) {
        const t = 0.48 + i * 0.09 + age * 0.12;
        ctx.beginPath();
        ctx.arc(point.x + px * reach * t - py * (i - 1.5) * 5, point.y - 10 + py * reach * t + px * (i - 1.5) * 5, 3 + i % 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (effect.type === "eumist-blades") {
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 5;
      for (let i = 0; i < 8; i++) {
        const angle = effect.rotation + i * Math.PI / 4 + age * 2.6;
        ctx.beginPath();
        ctx.arc(point.x, point.y - 6, radius * (0.22 + age * 0.48 + (i % 3) * 0.04), angle - 0.55, angle + 0.55);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(102,242,228,0.16)";
      ctx.beginPath();
      ctx.arc(point.x, point.y - 6, radius * (0.3 + age * 0.34), 0, Math.PI * 2);
      ctx.fill();
    } else if (effect.type === "accipio-heal") {
      const marks = 4;
      ctx.globalAlpha = alpha * 0.58;
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(point.x, point.y - 18, radius * (0.36 + age * 0.34), 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < marks; i++) {
        const angle = effect.rotation + i * 1.7 + age * 0.7;
        const spread = radius * (0.28 + i * 0.1);
        drawPlusMark(point.x + Math.cos(angle) * spread, point.y - 42 + Math.sin(angle) * spread - age * 12, 4, i % 2 ? "#dffcff" : effect.color);
      }
    } else if (effect.type === "mist-heal" || effect.type === "mist-bloom") {
      const marks = effect.type === "mist-bloom" ? 10 : 5;
      for (let i = 0; i < marks; i++) {
        const angle = effect.rotation + i * 2.399 + age * 0.8;
        const spread = radius * (0.16 + (i / marks) * 0.72);
        drawPlusMark(point.x + Math.cos(angle) * spread, point.y - 8 + Math.sin(angle) * spread - age * 18, 5, i % 3 === 0 ? "#dffcff" : effect.color);
      }
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(point.x, point.y - 8, radius * (0.55 + age * 0.35), 0, Math.PI * 2);
      ctx.stroke();
    } else if (effect.type === "eumist-oboro") {
      ctx.fillStyle = "rgba(102,242,228,0.12)";
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius * (0.55 + age * 0.34), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const angle = effect.rotation + i * 0.72 + age * 3.5;
        const inner = radius * (0.1 + (i % 4) * 0.08);
        const outer = radius * (0.62 + (i % 3) * 0.08);
        ctx.beginPath();
        ctx.moveTo(point.x + Math.cos(angle) * inner, point.y + Math.sin(angle) * inner);
        ctx.lineTo(point.x + Math.cos(angle + 0.18) * outer, point.y + Math.sin(angle + 0.18) * outer);
        ctx.stroke();
      }
      for (let i = 0; i < 8; i++) drawPlusMark(point.x - 70 + i * 20, point.y - 90 + Math.sin(now() * 4 + i) * 7, 5, "#dffcff");
    } else if (effect.type === "tutoring") {
      const bob = Math.sin(now() * 9) * 3;
      const bookW = 74;
      const bookH = 54;
      const x = point.x - bookW * 0.5;
      const y = point.y - 36 + bob;
      ctx.shadowBlur = 28;
      ctx.fillStyle = "rgba(6, 18, 28, 0.88)";
      ctx.strokeStyle = "#dffcff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(x, y, bookW, bookH, 8);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(point.x, y + 7);
      ctx.lineTo(point.x, y + bookH - 7);
      ctx.stroke();
      ctx.strokeStyle = "rgba(223,252,255,0.72)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const lineY = y + 15 + i * 9;
        ctx.beginPath();
        ctx.moveTo(x + 10, lineY);
        ctx.lineTo(point.x - 8, lineY + Math.sin(now() * 4 + i) * 1.5);
        ctx.moveTo(point.x + 8, lineY);
        ctx.lineTo(x + bookW - 10, lineY + Math.cos(now() * 4 + i) * 1.5);
        ctx.stroke();
      }
      const signR = 18 + Math.sin(now() * 10) * 1.8;
      ctx.strokeStyle = "#ff5b66";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(point.x, y + bookH * 0.52, signR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(point.x - signR * 0.72, y + bookH * 0.52 + signR * 0.72);
      ctx.lineTo(point.x + signR * 0.72, y + bookH * 0.52 - signR * 0.72);
      ctx.stroke();
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 7]);
      ctx.beginPath();
      ctx.arc(point.x, point.y - 8, radius * (0.92 + age * 0.18), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (effect.type === "accipio-lock" || effect.type === "accipio-lock-sweep") {
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = effect.type === "accipio-lock-sweep" ? 2 : 3;
      ctx.setLineDash([8, 7]);
      ctx.beginPath();
      ctx.arc(point.x, point.y - 8, radius * (0.7 + age * 0.3), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      if (effect.tx !== undefined && effect.ty !== undefined) {
        ctx.beginPath();
        ctx.moveTo(point.x, point.y - 12);
        ctx.lineTo(effect.tx, effect.ty);
        ctx.stroke();
        tracePolygon(effect.tx, effect.ty, 24 + age * 18, 4, Math.PI / 4 + effect.rotation);
        ctx.stroke();
      } else {
        for (let i = 0; i < 7; i++) {
          const angle = effect.rotation + i * 0.9 + age * 1.2;
          ctx.beginPath();
          ctx.moveTo(point.x, point.y - 8);
          ctx.lineTo(point.x + Math.cos(angle) * radius, point.y - 8 + Math.sin(angle) * radius);
          ctx.stroke();
        }
      }
    } else if (effect.type === "accipio-remote") {
      ctx.strokeStyle = effect.color;
      ctx.fillStyle = "rgba(98,246,176,0.015)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(point.x, point.y - 18, radius * (0.26 + age * 0.28), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = alpha * 0.38;
      squad.filter((ally) => ally.hp > 0).forEach((ally, i) => {
        ctx.beginPath();
        ctx.moveTo(point.x, point.y - 8);
        ctx.lineTo(ally.x, ally.y - 18);
        ctx.stroke();
        drawPlusMark(ally.x + Math.sin(now() * 5 + i) * 10, ally.y - 66, 6, "#dffcff");
      });
    } else if (effect.type === "accipio-restore") {
      ctx.strokeStyle = "#dffcff";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(point.x, point.y - radius * 0.74);
      ctx.lineTo(point.x, point.y + radius * 0.42);
      ctx.stroke();
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 4;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(point.x, point.y - 8, radius * (0.18 + i * 0.12 + age * 0.12), 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let i = 0; i < 12; i++) drawPlusMark(point.x + Math.cos(i * 2.1 + effect.rotation) * radius * 0.46, point.y - 8 + Math.sin(i * 2.1 + effect.rotation) * radius * 0.46 - age * 28, 5, effect.color);
    } else if (effect.type === "accipio-mirror-field") {
      ctx.strokeStyle = effect.color;
      ctx.fillStyle = "rgba(98,246,176,0.1)";
      ctx.lineWidth = 5;
      tracePolygon(point.x, point.y - 8, radius * (0.96 + Math.sin(now() * 5) * 0.015), 8, effect.rotation);
      ctx.fill();
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(223,252,255,0.72)";
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(point.x - radius * 0.78, point.y + i * 34 - age * 16);
        ctx.lineTo(point.x + radius * 0.78, point.y + i * 34 + age * 16);
        ctx.stroke();
      }
      enemies.filter((enemy) => enemy.hp > 0 && dist(enemy, point) < radius).forEach((enemy) => {
        tracePolygon(enemy.x, enemy.y, bodyRadius(enemy) + 12, 4, Math.PI / 4);
        ctx.stroke();
      });
    } else if (effect.type === "accipio-knee") {
      const cx = point.x;
      const cy = point.y - 54 + Math.sin(now() * 9) * 2;
      const iconR = 34;
      ctx.shadowColor = "#ff5b66";
      ctx.shadowBlur = 18;
      ctx.strokeStyle = "#ff5b66";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx, cy, iconR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - iconR * 0.68, cy + iconR * 0.68);
      ctx.lineTo(cx + iconR * 0.68, cy - iconR * 0.68);
      ctx.stroke();

      ctx.shadowBlur = 8;
      ctx.strokeStyle = "rgba(245,252,255,0.94)";
      ctx.fillStyle = "rgba(24,34,44,0.92)";
      ctx.lineWidth = 3;

      ctx.save();
      ctx.translate(cx - 2, cy + 1);
      ctx.rotate(-0.14);
      ctx.beginPath();
      ctx.roundRect(-8, -32, 16, 27, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ff5b66";
      ctx.beginPath();
      ctx.arc(0, -2, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(24,34,44,0.92)";
      ctx.beginPath();
      ctx.roundRect(-7, 3, 15, 31, 6);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(-9, 27, 30, 12, 6);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(98,246,176,0.7)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.lineTo(0, -10);
      ctx.moveTo(1, 8);
      ctx.lineTo(1, 28);
      ctx.stroke();
      ctx.restore();

      ctx.globalAlpha = alpha * 0.42;
      ctx.strokeStyle = "#ff5b66";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.arc(point.x, point.y - 8, radius * (0.62 + age * 0.22), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (effect.type === "accipio-command" || effect.type === "accipio-mark-heal") {
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(point.x, point.y - 8, radius * (0.72 + age * 0.28), 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 6; i++) drawPlusMark(point.x - 45 + i * 18, point.y - 70 + Math.sin(now() * 5 + i) * 5, 5, effect.color);
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
    } else if (effect.type === "ek-aura" || effect.type === "ek-defense" || effect.type === "ek-invulnerable") {
      const defensive = effect.type !== "ek-aura";
      const invulnerable = effect.type === "ek-invulnerable";
      ctx.strokeStyle = effect.color;
      ctx.fillStyle = invulnerable ? "rgba(230,248,255,0.18)" : "rgba(72,168,255,0.1)";
      ctx.lineWidth = defensive ? 5 : 4;
      ctx.beginPath();
      ctx.arc(point.x, point.y - 8, defensive ? radius * (0.84 + age * 0.16) : radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash(defensive ? [6, 8] : [12, 10]);
      ctx.beginPath();
      ctx.arc(point.x, point.y - 8, radius * (0.68 + Math.sin(now() * 4) * 0.04), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      const beams = defensive ? 12 : 8;
      for (let i = 0; i < beams; i++) {
        const angle = effect.rotation + i * Math.PI * 2 / beams + age * (defensive ? 2.6 : 1.2);
        const outer = defensive ? 0.98 : 0.92;
        const inner = defensive ? 0.68 : 0.55;
        ctx.beginPath();
        ctx.moveTo(point.x + Math.cos(angle) * radius * outer, point.y - 8 + Math.sin(angle) * radius * outer);
        ctx.lineTo(point.x + Math.cos(angle) * radius * inner, point.y - 8 + Math.sin(angle) * radius * inner);
        ctx.stroke();
      }
      if (defensive) {
        ctx.strokeStyle = invulnerable ? "rgba(255,255,255,0.95)" : "rgba(127,233,255,0.86)";
        ctx.lineWidth = invulnerable ? 3 : 2;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(point.x, point.y - 8, radius * (0.38 + i * 0.18), effect.rotation + age * 4 + i, effect.rotation + age * 4 + i + Math.PI * 0.84);
          ctx.stroke();
        }
      }
    } else if (effect.type === "ek-law" || effect.type === "ek-law-field") {
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = effect.type === "ek-law-field" ? 6 : 4 + age * 4;
      ctx.setLineDash(effect.type === "ek-law-field" ? [18, 10] : [8, 8]);
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius * (effect.type === "ek-law-field" ? 0.55 + age * 0.45 : 0.35 + age * 0.65), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(230,248,255,0.92)";
      tracePolygon(point.x, point.y, radius * (effect.type === "ek-law-field" ? 0.18 + age * 0.12 : 0.22 + age * 0.18), 6, effect.rotation + age * 2);
      ctx.stroke();
      if (effect.type === "ek-law-field") {
        ctx.lineWidth = 2;
        for (let i = 0; i < 10; i++) {
          const angle = effect.rotation + i * Math.PI / 5 - age * 3;
          ctx.beginPath();
          ctx.moveTo(point.x + Math.cos(angle) * radius * 0.25, point.y + Math.sin(angle) * radius * 0.25);
          ctx.lineTo(point.x + Math.cos(angle) * radius * 0.9, point.y + Math.sin(angle) * radius * 0.9);
          ctx.stroke();
        }
      }
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
    } else if (effect.type === "meteor-deploy") {
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 4;
      ctx.globalAlpha = alpha * 0.78;
      ctx.setLineDash([16, 10]);
      ctx.beginPath();
      ctx.arc(point.x, point.y - 8, radius * (0.82 + age * 0.12), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      for (let i = 0; i < 6; i++) {
        const angle = effect.rotation + i * Math.PI * 2 / 6 + age * 1.6;
        const px = point.x + Math.cos(angle) * radius * 0.68;
        const py = point.y - 8 + Math.sin(angle) * radius * 0.38;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(angle + Math.PI * 0.5);
        ctx.fillStyle = "rgba(255,209,102,0.88)";
        ctx.strokeStyle = "#fff3b0";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(8, 10);
        ctx.lineTo(0, 18);
        ctx.lineTo(-8, 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    } else if (effect.type === "meteor-strike") {
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 6;
      ctx.globalAlpha = alpha * 0.9;
      for (let i = 0; i < 7; i++) {
        const offset = (i - 3) * radius * 0.22;
        const x = point.x + offset;
        const topY = point.y - radius * (2.2 + age * 0.9) - Math.abs(i - 3) * 7;
        ctx.beginPath();
        ctx.moveTo(x - 54, topY);
        ctx.lineTo(x + 12, point.y + radius * 0.48);
        ctx.stroke();
        ctx.globalAlpha = alpha * 0.36;
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(x - 54, topY);
        ctx.lineTo(x + 12, point.y + radius * 0.48);
        ctx.stroke();
        ctx.globalAlpha = alpha * 0.9;
        ctx.lineWidth = 6;
      }
      ctx.strokeStyle = "#fff3b0";
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius * (0.9 + age * 0.35), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = alpha * 0.24;
      ctx.fillStyle = effect.color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius * (0.92 + age * 0.34), 0, Math.PI * 2);
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
      const status = localizeStatus(unit.himawariStatus);
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

    if (unit.accipioHotTime > 0 || unit.accipioProtectionTime > 0 || unit.accipioCommandTime > 0) {
      const alpha = unit.accipioProtectionTime > 0 ? 0.38 : 0.34;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = "#62f6b0";
      ctx.shadowBlur = 10;
      ctx.strokeStyle = unit.accipioProtectionTime > 0 ? "rgba(223,252,255,0.58)" : "rgba(98,246,176,0.62)";
      ctx.lineWidth = unit.accipioProtectionTime > 0 ? 2.2 : 2;
      tracePolygon(unit.x, unit.y - 14, 44 + Math.sin(now() * 7) * 2.5, unit.accipioProtectionTime > 0 ? 6 : 4, Math.PI / 4 + now() * 0.35);
      ctx.stroke();
      if (unit.accipioHotTime > 0) {
        for (let i = 0; i < 4; i++) drawPlusMark(unit.x - 28 + i * 18, unit.y - 70 + Math.sin(now() * 4 + i) * 4, 5, "#62f6b0");
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
  if (loadingCopyEl && message) loadingCopyEl.textContent = translateMessage(message);
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
  const paths = new Set([battlefieldArt, arenaBattlefieldArt]);
  selectedSquadSeeds().forEach((unit) => {
    if (unit.sprite) paths.add(unit.sprite);
    if (unit.sheet) paths.add(unit.sheet);
    if (unit.activeIcon) paths.add(unit.activeIcon);
    if (unit.ultimateIcon) paths.add(unit.ultimateIcon);
  });
  arenaDefenseNames.forEach((name) => {
    const unit = squadSeeds.find((seed) => seed.name === name);
    if (unit?.sprite) paths.add(unit.sprite);
    if (unit?.sheet) paths.add(unit.sheet);
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
  if (!running || paused || battleMode === "arena") return;
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
  if (!running || paused || battleMode === "arena" || !selected) return;
  pointer = canvasPoint(event);
});

canvas.addEventListener("pointerup", (event) => {
  if (!running || paused || battleMode === "arena" || !selected) return;
  issueCommand(selected, canvasPoint(event));
  selected = null;
  pointer = null;
});

canvas.addEventListener("dblclick", (event) => {
  if (!running || paused || battleMode === "arena") return;
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
  if (!running || paused || battleMode === "arena") return;
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
  clearAutoRewardTimer();
  chooseReward(Number(card.dataset.rewardIndex));
});

leaderboardFormEl.addEventListener("submit", submitLeaderboard);

pauseToggleEl.addEventListener("click", togglePause);

autoBattleToggleEl?.addEventListener("click", toggleAutoBattle);

pauseResumeEl.addEventListener("click", () => {
  setPaused(false);
});

pauseHomeEl?.addEventListener("click", showBriefing);

pauseFormationEl.addEventListener("click", () => {
  if (battleMode === "arena") return;
  showFormation();
});

languageToggleEl?.addEventListener("click", toggleLanguage);

document.querySelectorAll("[data-title-board]").forEach((button) => {
  button.addEventListener("click", () => setTitleLeaderboardTab(button.dataset.titleBoard));
});

document.getElementById("start-btn").addEventListener("click", () => {
  showFormation();
});

arenaBtnEl?.addEventListener("click", async () => {
  if (!masterLeagueRun?.active && !(await requestMasterLeagueTeamName())) return;
  showArena();
});

arenaBackEl?.addEventListener("click", showBriefing);

arenaResultBackEl?.addEventListener("click", showArena);

arenaResultHomeEl?.addEventListener("click", showBriefing);

arenaResultRematchEl?.addEventListener("click", () => {
  if (masterLeagueRun?.active) showArena();
  else {
    masterLeagueRun = null;
    arenaSelectedOpponent = null;
    showArena();
  }
});

arenaSaveEl?.addEventListener("click", () => {
  if (!masterLeagueRun?.active) confirmMasterLeagueEntry();
});

arenaRefreshEl?.addEventListener("click", () => {
  if (masterLeagueRun?.active) {
    if (masterLeagueSearchTimer) window.clearTimeout(masterLeagueSearchTimer);
    masterLeagueSearching = false;
    masterLeagueRun = null;
    arenaSelectedOpponent = null;
    applyProfileDefense();
    renderArena();
    return;
  }
  loadArenaOpponents();
});

pilotSaveNameEl?.addEventListener("click", () => {
  if (masterLeagueRun?.active) {
    renderPilotPanel("Run 已開始，戰隊名已鎖定。");
    return;
  }
  const name = (pilotNameInputEl.value || "Pilot").replace(/\s+/g, " ").trim().slice(0, 16) || "Pilot";
  localStorage.setItem("mecha-heart-player-name", name);
  savePilotProfileLocal({ ...pilotProfile, name });
  renderPilotPanel("戰隊名已更新，今次 Run 會用呢個名字。");
  renderArena();
});

pilotRecoverEl?.addEventListener("click", recoverPilotProfile);

arenaCoreListEl?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-core-id]");
  if (!button) return;
  arenaSelectedCore = button.dataset.coreId;
  renderArena();
});

arenaUnitListEl?.addEventListener("click", (event) => {
  const moduleCard = event.target.closest("[data-module-id]");
  if (moduleCard) {
    if (moduleCard.disabled) return;
    arenaModules[arenaSelectedUnitName] = moduleCard.dataset.moduleId;
    renderArena();
    return;
  }
  const tacticCard = event.target.closest("[data-ai-id]");
  if (tacticCard) {
    arenaAi[arenaSelectedUnitName] = normalizeArenaAiId(tacticCard.dataset.aiId);
    renderArena();
    return;
  }
  const pick = event.target.closest("[data-arena-pick]");
  if (pick) {
    const name = pick.dataset.arenaPick;
    if (arenaDefenseNames.includes(name)) {
      arenaSelectedUnitName = name;
    } else if (arenaDefenseNames.length < 4) {
      arenaDefenseNames = [...arenaDefenseNames, name];
      arenaSelectedUnitName = name;
    } else {
      const replaceIndex = Math.max(0, arenaDefenseNames.indexOf(arenaSelectedUnitName));
      const removed = arenaDefenseNames[replaceIndex];
      delete arenaModules[removed];
      delete arenaAi[removed];
      delete arenaPositions[removed];
      arenaDefenseNames[replaceIndex] = name;
      arenaSelectedUnitName = name;
    }
    normalizeArenaBuild();
    renderArena();
    return;
  }
  const unitEl = event.target.closest("[data-unit-name]");
  if (!unitEl) return;
  arenaSelectedUnitName = unitEl.dataset.unitName;
  renderArena();
});

arenaPositionGridEl?.addEventListener("click", (event) => {
  const cell = event.target.closest("[data-position-index]");
  if (!cell || !arenaSelectedUnitName) return;
  const index = Number(cell.dataset.positionIndex);
  const occupant = arenaDefenseNames.find((name) => Number(arenaPositions[name]) === index);
  if (occupant && occupant !== arenaSelectedUnitName) arenaPositions[occupant] = arenaPositions[arenaSelectedUnitName];
  arenaPositions[arenaSelectedUnitName] = index;
  renderArena();
});

arenaOpponentListEl?.addEventListener("click", (event) => {
  if (event.target.closest("[data-master-start]")) {
    confirmMasterLeagueEntry();
    return;
  }
  const choice = event.target.closest("[data-master-choice]");
  if (choice) {
    const opponent = masterLeagueRun?.choices?.[Number(choice.dataset.masterChoice)];
    if (opponent) {
      arenaSelectedOpponent = opponent;
      startArenaChallenge(opponent);
    }
    return;
  }
  if (event.target.closest("[data-master-cancel-opponent]")) {
    arenaSelectedOpponent = null;
    renderArena();
    return;
  }
  if (event.target.closest("[data-master-fight]")) {
    if (arenaSelectedOpponent) startArenaChallenge(arenaSelectedOpponent);
    return;
  }
  const button = event.target.closest("[data-opponent-index]");
  if (!button) return;
  selectMasterOpponent(arenaOpponents[Number(button.dataset.opponentIndex)]);
});

formationStartEl.addEventListener("click", () => {
  startBattleFromFormation();
});

formationHomeEl?.addEventListener("click", showBriefing);
rewardHomeEl?.addEventListener("click", showBriefing);
document.getElementById("result-home")?.addEventListener("click", showBriefing);

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
applyStaticLanguage();
updateAutoBattleControl();
commandEl.textContent = t("idle");
initStars();
resizeCanvas();
setTitleLeaderboardTab("ace");
loadLeaderboard();
render();
frame();
