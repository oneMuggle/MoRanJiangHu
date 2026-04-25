# Implementation Plan: Search Filters in New Game Wizard

## Requirements Restatement
Add search/filter functionality to the New Game Wizard's three selection areas:
1. **Backgrounds (背景)** — 60+ items, single-select
2. **Talents (天赋)** — 55+ items, multi-select (max 3)
3. **Fortunes (气运)** — 250 items, multi-select (max 3)

Currently users must scroll through all items in collapsed sections with no filtering beyond gender and NSFW toggles. The goal is to reduce cognitive load and improve discoverability.

## Current State
- All three sections use `SectionCollapse` wrapper with internal scroll (max-height: 70vh)
- Grid layouts: backgrounds 2-col, talents 3-col, fortunes 3-col
- Gender and NSFW filtering already exists in `useNewGameWizardState.ts` via computed `全部*选项` arrays
- Fortunes have rich metadata (类别, 稀有度, 能力类型) that is NOT currently filterable in UI
- Key files:
  - `components/features/NewGame/NewGameWizardContent.tsx` (1270 lines) — UI rendering
  - `components/features/NewGame/useNewGameWizardState.ts` (853 lines) — state management
  - `components/ui/SectionCollapse.tsx` — collapsible section primitive

## Design Approach

### Shared Pattern: Search + Filter Bar
Each section gets a consistent filter bar rendered **inside** the collapsed section body, **above** the grid:
1. **Text search input** — debounced 200ms, filters by name + description
2. **Category/rarity chips** — pill-style toggle buttons (category-specific)

### Backgrounds (Step 2)
- Text search only (name + description matching)
- 60 items is manageable with search alone; no category metadata exists
- UI: Single search input above the 2-col grid

### Talents (Step 2)
- Text search only (name + description matching)
- 55 items similar to backgrounds
- UI: Single search input above the 3-col grid

### Fortunes (Step 2)
- Text search (name + description matching)
- **Category filter chips** — 11 categories from `气运数据类别列表`: 真·气运, 限制版气运, 因果律, 天道规则, 绝对无敌, 脑洞破防, 法则扭曲, 白嫖躺赢, 怠惰降维, 精神暴击, 合欢秘辛
- **Rarity filter chips** — 传说, 稀有, 普通
- UI: Search input + category chips + rarity chips above the 3-col grid

## Implementation Steps

### Step 1: Add search/filter state to `useNewGameWizardState.ts`

Add new state variables:
- `背景搜索词` (string, default '')
- `天赋搜索词` (string, default '')
- `气运搜索词` (string, default '')
- `气运类别过滤` (string | null, default null)
- `气运稀有度过滤` (string | null, default null)

Add new computed arrays via `useMemo`:
- `过滤后背景选项` — filters `全部背景选项` by `背景搜索词`
- `过滤后天赋选项` — filters `全部天赋选项` by `天赋搜索词`
- `过滤后气运选项` — filters `全部气运选项` by `气运搜索词` + `气运类别过滤` + `气运稀有度过滤`

These should extend the existing `全部*选项` memo chains — the new memos depend on existing ones and add text/category filtering.

### Step 2: Create `FilterBar` shared component

Create `components/ui/FilterBar.tsx`:
- `SearchInput` — debounced text input with clear button
  - Props: `value`, `onChange`, `placeholder`
  - Uses `useEffect` + `setTimeout` for 200ms debounce
- `ChipGroup` — pill toggle buttons for category/rarity
  - Props: `chips: { label, value }[]`, `selected`, `onChange`, `multi?`
- Compact, Tailwind-styled, matches existing project UI patterns

### Step 3: Wire filter bars into `NewGameWizardContent.tsx`

**Backgrounds section** (Step 2, ~line 612-701):
- Add `<SearchInput>` above the grid
- Replace `全部背景选项` → `过滤后背景选项` in render
- Show "无匹配结果" empty state when filtered list is empty

**Talents section** (Step 2, ~line 704-815):
- Add `<SearchInput>` above the grid
- Replace `全部天赋选项` → `过滤后天赋选项` in render
- Show "无匹配结果" empty state when filtered list is empty

**Fortunes section** (Step 2, ~line 817-889):
- Add `<SearchInput>` + `<ChipGroup>` for categories + `<ChipGroup>` for rarity
- Replace `全部气运选项` → `过滤后气运选项` in render
- Show "无匹配结果" empty state when filtered list is empty
- Category chips should derive from `气运数据类别列表`
- Rarity chips: `[{ label: '传说', value: '传说' }, { label: '稀有', value: '稀有' }, { label: '普通', value: '普通' }]`

## Dependencies
- No new npm dependencies
- Step 1 must be done before Step 3
- Step 2 is independent of Step 1

## Risks
- **LOW**: Filter logic could be slow with 250 fortunes — mitigated by using `useMemo`
- **LOW**: Section collapse height (70vh) may need adjustment when filter bars are added — ensure scroll area accounts for fixed filter bar
- **LOW**: Search debounce timing — 200ms is standard but should feel responsive

## File Changes Summary

| File | Change |
|------|--------|
| `components/features/NewGame/useNewGameWizardState.ts` | Add 5 state vars + 3 computed arrays |
| `components/ui/FilterBar.tsx` | **New file** — SearchInput + ChipGroup components |
| `components/features/NewGame/NewGameWizardContent.tsx` | Wire filter bars into 3 sections, swap filtered arrays |

## Estimated Complexity: **LOW-MEDIUM**
- ~2-3 hours total
- Mostly additive changes, no breaking behavior changes
- Existing selections remain valid when filters change
