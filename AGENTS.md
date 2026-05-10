# Mecha Heart Project Instructions

## Response Mode

- Keep replies concise and practical.
- Inspect only files directly relevant to the current task.
- Do not scan the whole repository unless explicitly asked.
- Do not use subagents unless explicitly asked.
- Use `.jpg` for preview screenshots shown to the user, but only create preview images when the user asks for them or visual QA is clearly necessary.

## New Mecha Production Checklist

When adding a new player mecha, produce the full asset and code set in one pass:

1. Profile concept art
   - Full-body real-machine design for formation card and tactical database.
   - Must match the current player mecha art direction, not placeholder SD art.
   - Check that the full body is visible and not cropped.

2. SD battlefield sprite
   - Chibi/SD battlefield version matching existing in-game proportions.
   - No visible square frame, no leftover background, no semi-transparent body parts.
   - Keep transparent background clean; preserve solid armor opacity.
   - Add cache version bump if replacing sprite assets.

3. Skill icons
   - Two icons per mecha: active skill and ultimate skill.
   - Use Mecha Skill Burst Icon style: dark 3D realistic sci-fi mechanical icon, high-detail metal device, neon glow, square frame, no text.
   - Icon subject must clearly match the skill behavior.

4. Exclusive reward icon
   - Exactly one exclusive reward per mecha.
   - Use the same Mecha Skill Burst Icon style.
   - If older mecha has more than one exclusive reward, merge into one balanced reward.

5. Game data and text
   - Add name, role, weapon, trait, tactic, active description, ultimate description, passive description if any.
   - Use Traditional Chinese for player-facing text, except title names where requested.
   - Update formation cards, tactical database, skill bar, reward pool, and any cache version needed.

6. Runtime behavior
   - Implement normal attack, active skill, ultimate, passive, targeting, cooldown, and reward effect.
   - Add distinct battlefield VFX for each skill; avoid reusing generic circles when the meaning differs.
   - Ensure hitboxes and body spacing work with existing collision rules.

7. Visual QA
   - Check formation page, tactical database, battle map, skill buttons, reward screen, and game over if affected.
   - Verify on desktop, iPad-like viewport, and phone landscape when layout is touched.
   - Confirm sprites keep correct aspect ratio and are not stretched.
   - Confirm no image loads as a frame, broken icon, wrong crop, or transparent armor.

## Asset Quality Rules

- Do not commit or package huge debug files such as `chrome-cdp-*`.
- Prefer optimized `.webp` for in-game assets and `.jpg` for temporary preview screenshots.
- After replacing assets, bump the relevant asset version constant or query string.
- For every upload-ready update, bump the title screen `(ver.N)` label to match the package version.
- After every update, create a clean unzipped GitHub upload-ready folder. Do not create a zip unless the user explicitly asks for one.
- Never leave placeholder line-art/simple geometry when an actual mecha image is expected.
- Reward and skill icons must use the Mecha Skill Burst Icon style: raster dark 3D realistic sci-fi mechanical equipment, high-detail metal device, strong neon glow, volumetric/bloom feel, square glowing frame, no text or watermark. Do not use flat/vector/line-art/simple geometric symbols as the main subject.
- Reward tier visuals must be instantly distinguishable: Common uses silver/white framing, Rare uses purple framing, Ultra Rare uses red/gold framing.
