# Extract Duplicate Nested Functions in storyResponseParser

> **Commit:** `4d8c78a` | **Status:** ✅ Completed | **Date:** 2026-04-28

## Overview

Extracted three duplicate nested functions from `storyResponseParser.ts` to module-level functions, reducing code by 168 lines (-72%).

## What Was Done

### Extracted Functions

The following three functions were duplicated across 3 nested locations in the story response parser. Each was extracted to module level:

1. **`清理命令尾部分隔符`** — Removes trailing separators from command values
2. **`计算括号平衡`** — Calculates bracket nesting balance for parsing
3. **`收集多行命令值`** — Collects multi-line command values during parsing

### Before vs After

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| File size | 233 lines | 65 lines | -72% |
| Duplicated functions | 3 copies x 3 locations | 1 copy each | Eliminated |
| Nesting depth | 4+ levels | Reduced | Improved readability |

**Status:** ✅ Done

## Files Changed

- `services/ai/text/storyResponseParser.ts` (-168 lines, +65 lines)

## Remaining / Not Started

- [ ] Add unit tests for the three extracted functions (good candidates now that they're module-level)
- [ ] Review other large files in `services/ai/text/` for similar duplication patterns

## Dependencies

- None — standalone refactoring.

## Notes

- This refactoring makes the parser functions much easier to test, as they're now at module scope rather than nested inside other functions.
