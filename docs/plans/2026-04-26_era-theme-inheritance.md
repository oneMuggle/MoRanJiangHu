# Era Theme Inheritance — Implementation Plan

> **Date**: 2026-04-26
> **Status**: ✅ Implemented
> **Commit**: `0ee177b` (night: era-inheritance-system)

---

## Overview

Implemented the Era Theme Inheritance system for the three-layer epoch hierarchy (Epoch → Era → SubEra), enabling metadata inheritance from ancestor nodes.

---

## Implemented Components

### Data Model (`models/eraTheme/`)

- **`types.ts`** — Core type definitions: `EraNode`, `EraColors`, `EraTypography`, `EraUIStyle`, `EraPromptVars`, `EraRealmConfig`, etc.
- **`assembly.ts`** — Core inheritance resolution function `resolveEraNode(id)`:
  - Traverses from node toward root (path is `[root, ..., leaf]`)
  - `getFirstDefined(getter)` finds first defined field value from leaf to root
  - `getNodeOnly(getter)` returns only node's own defined fields
  - `sources[]` array records the source node ID for each inherited field
- **7 Epoch files** — `epoch-primordial`, `epoch-ancient`, `epoch-modern`, `epoch-contemporary`, `epoch-near-future`, `epoch-far-future`, `epoch-post-human`
- **`assembly.test.ts`** — 39 test cases covering:
  - Tree relationship integrity (parent reference validation, 3-layer path validation)
  - SubEra required field validation (colors, typography, uiStyle, promptVars)
  - Color value validity (hex or RGB string format)
  - Inheritance override integrity (sources array, node-own override priority, liMode inheritance)
  - UI Copy consistency

### Inheritance Field Classification

| Field | Inheritance Mode | Description |
|-------|-----------------|-------------|
| `colors` | Nearest override | Epoch → Era → SubEra, nearest definition wins |
| `typography` | Nearest override | Same as above |
| `uiStyle` | Nearest override | Same as above |
| `bgmTags` | Nearest override | Same as above |
| `artStyle` | Nearest override | Same as above |
| `promptVars` | Nearest override | Same as above |
| `conflictTypes` | Nearest override | Same as above |
| `liMode` | Nearest override | Same as above |
| `realm` | Nearest override | Same as above |
| `openingScenes` | Self only | Does not inherit, uses only node's own definition |
| `characterArchetypes` | Self only | Same as above |
| `writingSamples` | Self only | Same as above |
| `uiCopy` | Self only | Same as above |

### Consumers (Integrated)

- `prompts/runtime/eraTheme.ts` — `构建时代主题注入`, `构建时代角色原型注入`, `构建时代文风注入`
- `prompts/runtime/eraLiMode.ts` — Uses `resolveEraNode` to get li mode config
- `prompts/runtime/eraOpeningScene.ts` — Uses `resolveEraNode` to get opening scenes
- `components/features/NewGame/useNewGameWizardState.ts` — New game wizard uses `resolveEraNode` for era config
- `utils/gameSettings.ts` — Game settings use `resolveEraNode` for li mode names

### Backward Compatibility

- `getEraById()` contains legacy ID mapping table (`era_ancient_wuxia` → `ancient_eastern_wuxia`, etc.)
- `时代主题方案列表` and `获取时代主题方案()` old interfaces still work

---

## Verification

```bash
npx vitest run models/eraTheme/assembly.test.ts
# ✓ 39 tests passed
```

---

## Files Changed

- `models/eraTheme/types.ts`
- `models/eraTheme/assembly.ts`
- `models/eraTheme/assembly.test.ts`
- `models/eraTheme/index.ts`
- 7 epoch files (epoch-ancient.ts, epoch-modern.ts, etc.)
- `prompts/runtime/eraTheme.ts` (new)
- `prompts/runtime/eraLiMode.ts` (new)
- `prompts/runtime/eraOpeningScene.ts` (new)
- `components/features/NewGame/useNewGameWizardState.ts`
- `utils/gameSettings.ts`
