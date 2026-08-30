# Phase B1 — T1 纯函数补齐实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 全项目覆盖率 14.78% → ≥ 25%（Day 17 末），T1 纯函数覆盖 12-15% → ≥ 50%。Day 22 末随 B2 完成达 ≥ 30%。

**Architecture:** 按 5 天 × 3 批划分，每批覆盖一类目标（utils / models 纯类型 / worldbook 子模块）。复用 v2.0 5 个测试样板（happy/error/loading/empty/retry）。严守 spec test 禁区（NSFW/useGame 顶层/prompts/runtime）。

**Tech Stack:** Vitest 3.x + jsdom + fake-indexeddb + msw（已就位，v2.0 验证）

---

**父 spec:** `docs/superpowers/specs/2026-06-09-project-optimization-roadmap-v2-1-design.md` §4
**工期:** Day 3-17（15 天）
**前置依赖:** Phase A（CI 升级 + threshold 10%）
**v2.0 基线:** 6 个 utils 测试（apiConfig/apiDiagnostics/jsonRepair/modelCategorizer/promptFeatureToggles/stateHelpers）；8 个 models/domain+planning+property+system 测试（v2.0 Day 48 写）；1 个 eraTheme/assembly 测试

---

## 涉及文件

### 新建测试文件

**Day 3-7（5d）utils/ 工具函数**：
- `utils/clothingHelpers.test.ts`
- `utils/conversationExport.test.ts`
- `utils/customNewGamePresets.test.ts`
- `utils/eraUIText.test.ts`
- `utils/gameSettings.test.ts`
- `utils/imageAssets.test.ts`
- `utils/imageManagerSettings.test.ts`
- `utils/imageSizeOptions.test.ts`
- `utils/musicMetadata.test.ts`
- `utils/openingConfig.test.ts`
- `utils/tavernPreset.test.ts`（如不存在）
- `utils/tokenEstimate.test.ts`

**Day 8-12（5d）models/ 纯类型与计算**：
- `models/system/game-config.test.ts`
- `models/system/visual-config.test.ts`
- `models/system/initialization.test.ts`（如不存在）
- `models/era-config/presets.test.ts`
- `models/era-config/types.test.ts`
- `models/eraDevice/presets.test.ts`
- `models/eraDevice/props.test.ts`
- `models/eraDevice/types.test.ts`

**Day 13-17（5d）worldbook 子模块**：
- `utils/worldbook/parser.test.ts`
- `utils/worldbook/matcher.test.ts`
- `utils/worldbook/serializer.test.ts`
- `utils/worldbook/types.test.ts`

**注意**：实际新建文件清单由 subagent 在 Day 3 第一步通过 `npx vitest run --coverage` 盘点 0% 覆盖文件后确定。

### 修改文件

| 文件 | 变更 |
|---|---|
| `vitest.config.ts` | Day 17 末提升 threshold 到 20% |
| `package.json` | 如缺脚本（`test:unit` 等）— v2.0 已就位，无需改 |

---

## 实施步骤

### Day 3-7（5d）utils/ 工具函数

#### Task 1：盘点 0% 覆盖的 utils/ 文件

- [ ] **Step 1：跑当前覆盖率，按 0% 排序**

```bash
cd /home/fz/project/MoRanJiangHu
npx vitest run --coverage --exclude="**/photographyNSFW/**" 2>&1 | grep -E "utils/[a-zA-Z_-]+\.ts" | grep " 0 \| 0\." | head -20
```

预期：列出 utils/ 下 0% 或近 0% 覆盖的文件清单。

- [ ] **Step 2：选 7-10 个高 ROI 文件作为本周目标**

策略：
- **优先**：纯函数（无副作用、纯计算、字符串处理）
- **避免**：含 IndexedDB / 网络调用 / 复杂异步的文件（属 Phase B2 services 范围）
- **避免**：spec test 禁区（NSFW 文件名含 `bdsm`/`nsfw`/`leak`/`photography` 等）

把选定文件清单写进 `docs/phase-decisions/2026-06-09-phase-b1-utils-targets.md`（如不存在创建）。

#### Task 2：写 utils/calculations 测试（如文件存在）

- [ ] **Step 1：查文件存在性**

```bash
cd /home/fz/project/MoRanJiangHu
ls utils/calculations.ts utils/calculations/index.ts 2>/dev/null
```

如不存在，跳到 Task 3。

- [ ] **Step 2：写失败测试**

```bash
cd /home/fz/project/MoRanJiangHu
# 读源文件了解 export
grep -E "^export " utils/calculations.ts | head -20
```

```ts
// utils/calculations.test.ts
import { describe, it, expect } from 'vitest';
import {
  calculateCombatPower,
  calculateQiyun,
  // ...其他 import
} from './calculations';

describe('calculateCombatPower', () => {
  it('returns 0 for empty stats', () => {
    expect(calculateCombatPower({ str: 0, dex: 0, int: 0 })).toBe(0);
  });

  it('sums stats correctly', () => {
    expect(calculateCombatPower({ str: 10, dex: 20, int: 30 })).toBe(60);
  });

  it('handles negative stats', () => {
    expect(calculateCombatPower({ str: -5, dex: 10, int: 10 })).toBe(15);
  });
});
```

- [ ] **Step 3：跑测试验证通过**

```bash
cd /home/fz/project/MoRanJiangHu
npx vitest run utils/calculations.test.ts 2>&1 | tail -5
```

预期：3/3 PASS。

#### Task 3-9：写其他 utils/ 测试（每文件 1 个 Task）

对每个选定的 utils 文件，按 Task 2 模式：
- 读源文件了解 export
- 写 happy 样板（最简）
- 加 error 样板（如有 throw 路径）
- 加 empty 样板（如有 []/null 边界）
- 跑测试验证
- 单文件 commit

**样板 1（happy）**：
```ts
import { describe, it, expect } from 'vitest';
import { formatDate } from './format';

describe('formatDate', () => {
  it('formats ISO date correctly', () => {
    expect(formatDate('2026-06-09')).toBe('2026/06/09');
  });
  it('handles empty', () => {
    expect(formatDate('')).toBe('');
  });
});
```

**样板 2（error）**：
```ts
import { describe, it, expect } from 'vitest';
import { validateEraId } from './validators';

describe('validateEraId', () => {
  it('accepts valid era', () => {
    expect(() => validateEraId('ancient')).not.toThrow();
  });
  it('rejects unknown era', () => {
    expect(() => validateEraId('foo')).toThrow();
  });
});
```

**样板 3（empty）**：
```ts
import { describe, it, expect } from 'vitest';
import { getClothingOptions } from './clothingHelpers';

describe('getClothingOptions', () => {
  it('returns empty for no options', () => {
    expect(getClothingOptions([])).toEqual([]);
  });
});
```

**注**：测试 mock 数据用 `as` cast 匹配严格类型（避免 `as any`）：

```ts
const input = { 姓名: '测试' } as 完整类型;
```

#### Task 10：Day 7 末测量 + 提交

- [ ] **Step 1：跑覆盖率**

```bash
cd /home/fz/project/MoRanJiangHu
npx vitest run --coverage --exclude="**/photographyNSFW/**" 2>&1 | grep -E "All files|Statements" | tail -3
```

预期：utils/ 覆盖率从 15% 提升到 40-60%。

- [ ] **Step 2：跑 tsc + build**

```bash
cd /home/fz/project/MoRanJiangHu
npx tsc --noEmit 2>&1 | tail -3
npm run build 2>&1 | tail -3
```

预期：0 错误，build 成功。

- [ ] **Step 3：commit Day 3-7 工作**

```bash
cd /home/fz/project/MoRanJiangHu
git add utils/*.test.ts docs/phase-decisions/2026-06-09-phase-b1-utils-targets.md
git -c user.email=planner@moran.local -c user.name=planner commit -m "test(utils): Day 3-7 T1 纯函数补齐（utils/ 覆盖率 15% → XX%）

- 新增 utils/*.test.ts 10+ 文件
- 复用 v2.0 5 个样板（happy/error/loading/empty/retry）
- 不改业务逻辑"
```

### Day 8-12（5d）models/ 纯类型与计算

#### Task 11：盘点 0% 覆盖的 models 子模块

- [ ] **Step 1：跑 models/ 覆盖率**

```bash
cd /home/fz/project/MoRanJiangHu
npx vitest run --coverage --coverage.include="models/**/*.ts" 2>&1 | grep -E "models/[a-zA-Z0-9_-]+" | head -30
```

预期：列出 models 各子目录覆盖率。

- [ ] **Step 2：选 7-10 个目标**

策略：
- 优先 `models/system/{api-config,ui-settings,game-config,memory-config,visual-config}.ts`（Phase 3 拆分后子文件）
- 优先 `models/era-config/` 子模块（presets/types）
- 优先 `models/eraDevice/` 子模块（presets/props/types）
- 避免 NSFW / 跨 import 重的子目录

#### Task 12-18：写 models/ 测试

按 Task 3-9 模式，对每个选定的 models/ 文件：
- 读源文件
- 写 happy/error 样板
- 用 `as 完整类型` cast 匹配严格类型
- 跑测试 + 提交

**models/system/game-config.test.ts 样板**：
```ts
import { describe, it, expect } from 'vitest';
import { getDefaultGameConfig, validateGameConfig } from './game-config';

describe('getDefaultGameConfig', () => {
  it('returns valid default', () => {
    const dflt = getDefaultGameConfig();
    expect(dflt.启用NSFW模式).toBe(false);
    expect(dflt.难度等级).toBeTruthy();
  });
});

describe('validateGameConfig', () => {
  it('accepts valid config', () => {
    const dflt = getDefaultGameConfig();
    expect(() => validateGameConfig(dflt)).not.toThrow();
  });
});
```

#### Task 19：Day 12 末测量 + 提交

- [ ] **Step 1：跑覆盖率 + tsc + build**

```bash
cd /home/fz/project/MoRanJiangHu
npx vitest run --coverage --exclude="**/photographyNSFW/**" 2>&1 | grep -E "All files" | head -3
npx tsc --noEmit 2>&1 | tail -3
npm run build 2>&1 | tail -3
```

预期：models 覆盖率从 12% 提升到 40%+，全项目 ≥ 22%。

- [ ] **Step 2：commit Day 8-12**

```bash
cd /home/fz/project/MoRanJiangHu
git add models/system/*.test.ts models/era-config/*.test.ts models/eraDevice/*.test.ts
git -c user.email=planner@moran.local -c user.name=planner commit -m "test(models): Day 8-12 T1 纯类型与计算补齐（models 覆盖率 12% → XX%）"
```

### Day 13-17（5d）worldbook 子模块 + 提升 threshold 到 20%

#### Task 20-23：写 utils/worldbook/ 子模块测试

按 Task 3-9 模式，对 `utils/worldbook/{parser,matcher,serializer,types}.ts`：
- 读源文件
- 写 happy 样板（输入/输出断言）
- 用 `as 完整类型` cast
- 跑测试 + 单文件 commit

**utils/worldbook/parser.test.ts 样板**：
```ts
import { describe, it, expect } from 'vitest';
import { parseWorldbookUpdate, extractEntriesFromText } from './parser';

describe('parseWorldbookUpdate', () => {
  it('parses valid JSON entries', () => {
    const result = parseWorldbookUpdate('[{"name":"测试","content":"内容"}]');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('测试');
  });

  it('returns empty for invalid JSON', () => {
    expect(parseWorldbookUpdate('invalid')).toEqual([]);
  });
});
```

#### Task 24：Day 17 末提升 threshold 到 20%

- [ ] **Step 1：修改 `vitest.config.ts`**

修改前：
```ts
thresholds: {
  lines: 10,
  functions: 10,
  branches: 8,
  statements: 10,
}
```

修改后：
```ts
thresholds: {
  // 2026-06-09 v2.1 Day 17 中段：t1 累计完成，提升到 20%
  lines: 20,
  functions: 20,
  branches: 15,
  statements: 20,
}
```

- [ ] **Step 2：本地验证 threshold 通过**

```bash
cd /home/fz/project/MoRanJiangHu
npx vitest run --coverage 2>&1 | tail -10
```

预期：threshold 校验通过。如失败回退到 18%。

- [ ] **Step 3：commit Day 13-17**

```bash
cd /home/fz/project/MoRanJiangHu
git add utils/worldbook/*.test.ts vitest.config.ts
git -c user.email=planner@moran.local -c user.name=planner commit -m "test(utils+vitest): Day 13-17 worldbook 子模块测试 + threshold 20%"
```

---

## 验收标准（P2 完成）

- [ ] 全项目覆盖率 ≥ 25%（Day 17 末）/ ≥ 30%（Day 22 末含 B2）
- [ ] T1 纯函数覆盖率 ≥ 50%
- [ ] `utils/` 多个子模块从 0% 提升到 40%+
- [ ] `models/` 多个子目录从 0% 提升到 40%+
- [ ] `utils/worldbook/{parser,matcher,serializer,types}.ts` 全部有测试
- [ ] vitest threshold 20%（Day 17 末） / 25%（Day 42 末）
- [ ] TS 0 错误
- [ ] 0 业务逻辑变更
- [ ] `as any` cast 累计 < 5 per layer
- [ ] 严守 spec test 禁区（NSFW/useGame 顶层/prompts/runtime）

---

## 风险与依赖

| 风险 | 等级 | 缓解 |
|---|---|---|
| 写测试时发现业务函数有 bug | MEDIUM | 仅写测试不修业务代码；记录 bug 到下轮处理 |
| mock 用 `as any` 逃逸类型 | LOW | 优先 `as 完整类型`；< 5 cast 限额 |
| 测试写在 NSFW 禁区 | MEDIUM | Day 3 第一步排除；grep 验证文件名不含禁区关键词 |
| worldbook 子模块拆分后 import 路径错 | LOW | 拆分后 barrel `worldbook/index.ts` 已就位（Phase 3 commit `e8926e8`）|
| threshold 提升 CI 红 | LOW | 渐进（+5-10% 每次）；如失败回退 1-2% |

### 依赖

- 现有：vitest + 5 个测试样板（v2.0 验证）
- 新增：无

---

## 参考文档

- 父 spec：docs/superpowers/specs/2026-06-09-project-optimization-roadmap-v2-1-design.md §4
- 前置：Phase A — docs/plans/2026-06-09_phase-a-ci-upgrade.md
- v2.0 spec：docs/superpowers/specs/2026-06-06-project-optimization-roadmap-v2-design.md
- v2.0 Day 48 models 测试决策：docs/phase-decisions/2026-06-06-phase5-test-fix.md
- 项目规则：/home/fz/.claude/rules/common/testing.md
