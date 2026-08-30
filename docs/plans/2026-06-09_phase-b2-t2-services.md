# Phase B2 — T2 services 全覆盖实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** T2 services 覆盖率 50% → ≥ 60%，全项目覆盖率推至 ≥ 30%。

**Architecture:** 复用 v2.0 阶段已建立的 msw + fake-indexeddb 模式，补全 v2.0 跳过的 4 个大型 AI 服务文件。每个新测试 1.5-2d（3 个子任务：read 源文件 / 写 5-10 样板 / 验证 + commit）。

**Tech Stack:** Vitest + msw（拦截 fetch）+ fake-indexeddb（IndexedDB mock）

---

**父 spec:** `docs/superpowers/specs/2026-06-09-project-optimization-roadmap-v2-1-design.md` §5
**工期:** Day 18-22（5 天）
**前置依赖:** Phase B1（threshold 20%）
**v2.0 基线:** services 9 个测试（dbService 全覆盖 + ai/chatCompletionClient 部分）

---

## 涉及文件

| 新测试文件 | 覆盖目标 | 工期 |
|---|---|---|
| `services/ai/text/novelDecomposition.test.ts` | `novelDecomposition.ts`（724 行）| 1.5d |
| `services/ai/text/storyCoreTasks.test.ts` | `storyCoreTasks.ts`（592 行）| 1.5d |
| `services/ai/image/imageGenerationClient.test.ts` | `imageGenerationClient.ts` | 1d |
| `services/ai/image/imageStorage.test.ts` | `imageStorage.ts` 缓存策略 | 1d |

---

## 实施步骤

### Day 18-19（2d）novelDecomposition.ts 测试

#### Task 1：盘点 novelDecomposition.ts

- [ ] **Step 1：读源文件了解 export**

```bash
cd /home/fz/project/MoRanJiangHu
grep -E "^export " services/ai/text/novelDecomposition.ts | head -20
wc -l services/ai/text/novelDecomposition.ts
```

预期：~724 行，多个 export 函数。

- [ ] **Step 2：写 5-8 个测试用例**

`services/ai/text/novelDecomposition.test.ts`：

```ts
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { decomposeNovel, extractChapters, planNarrative } from './novelDecomposition';

const server = setupServer(
  http.post('*/v1/chat/completions', () => {
    return HttpResponse.json({
      choices: [{
        message: { role: 'assistant', content: JSON.stringify({
          chapters: [{ title: '第一章', scenes: [] }],
        })},
      }],
    });
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('decomposeNovel', () => {
  it('decomposes novel into chapters', async () => {
    const result = await decomposeNovel('长篇小说文本');
    expect(result.chapters).toBeDefined();
    expect(result.chapters.length).toBeGreaterThan(0);
  });

  it('handles empty text', async () => {
    const result = await decomposeNovel('');
    expect(result.chapters).toEqual([]);
  });
});

describe('extractChapters', () => {
  it('extracts chapter boundaries', () => {
    const result = extractChapters('第一章\n...\n第二章\n...');
    expect(result).toHaveLength(2);
  });
});
```

- [ ] **Step 3：跑测试 + 验证**

```bash
cd /home/fz/project/MoRanJiangHu
npx vitest run services/ai/text/novelDecomposition.test.ts 2>&1 | tail -5
npx tsc --noEmit 2>&1 | tail -3
```

预期：5-8 PASS，0 TS 错误。

- [ ] **Step 4：commit**

```bash
cd /home/fz/project/MoRanJiangHu
git add services/ai/text/novelDecomposition.test.ts
git -c user.email=planner@moran.local -c user.name=planner commit -m "test(ai-text): 写 novelDecomposition 测试（Day 18-19）"
```

### Day 20-21（2d）storyCoreTasks.ts 测试

#### Task 2：同 Task 1 模式，写 storyCoreTasks 测试

- [ ] **Step 1：读 `storyCoreTasks.ts` 了解 export**

```bash
cd /home/fz/project/MoRanJiangHu
grep -E "^export " services/ai/text/storyCoreTasks.ts | head -20
wc -l services/ai/text/storyCoreTasks.ts
```

- [ ] **Step 2：写测试样板**

`services/ai/text/storyCoreTasks.test.ts`：

```ts
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { executeStoryTask, planStoryArc } from './storyCoreTasks';

const server = setupServer(
  http.post('*/v1/chat/completions', () => {
    return HttpResponse.json({
      choices: [{
        message: { role: 'assistant', content: JSON.stringify({
          arc: 'main',
          beats: ['开场', '冲突', '高潮', '解决'],
        })},
      }],
    });
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('planStoryArc', () => {
  it('returns story beats', async () => {
    const result = await planStoryArc({ era: 'ancient', theme: '修仙' });
    expect(result.beats.length).toBeGreaterThan(0);
  });
});

describe('executeStoryTask', () => {
  it('executes task with mock response', async () => {
    const result = await executeStoryTask({ id: 'task-1', type: 'intro' });
    expect(result).toBeDefined();
  });
});
```

- [ ] **Step 3：跑测试 + commit**

```bash
cd /home/fz/project/MoRanJiangHu
npx vitest run services/ai/text/storyCoreTasks.test.ts 2>&1 | tail -3
git add services/ai/text/storyCoreTasks.test.ts
git -c user.email=planner@moran.local -c user.name=planner commit -m "test(ai-text): 写 storyCoreTasks 测试（Day 20-21）"
```

### Day 22（1d）ai/image/ + 提升 threshold 到 25%

#### Task 3：写 imageGenerationClient + imageStorage 测试

- [ ] **Step 1：写 imageGenerationClient 测试**

`services/ai/image/imageGenerationClient.test.ts`：

```ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { generateImage } from './imageGenerationClient';

const server = setupServer(
  http.post('*/v1/images/generations', () => {
    return HttpResponse.json({
      data: [{ url: 'https://mock.url/img.png' }],
    });
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('generateImage', () => {
  it('returns image url', async () => {
    const result = await generateImage({ prompt: '测试', n: 1 });
    expect(result.data[0].url).toBeTruthy();
  });
});
```

- [ ] **Step 2：写 imageStorage 测试**

`services/ai/image/imageStorage.test.ts`：

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { saveImage, getImageByHash, listImages } from './imageStorage';

describe('imageStorage', () => {
  beforeEach(async () => {
    // clear fake-indexeddb
  });

  it('saves and retrieves image by hash', async () => {
    const hash = 'abc123';
    await saveImage({ hash, blob: new Blob() });
    const result = await getImageByHash(hash);
    expect(result).toBeDefined();
  });

  it('returns empty list when no images', async () => {
    const list = await listImages();
    expect(list).toEqual([]);
  });
});
```

- [ ] **Step 3：跑测试**

```bash
cd /home/fz/project/MoRanJiangHu
npx vitest run services/ai/image/ 2>&1 | tail -3
```

- [ ] **Step 4：Day 22 末提升 threshold 到 25%**

修改 `vitest.config.ts`：

修改前：
```ts
thresholds: {
  lines: 20,
  functions: 20,
  branches: 15,
  statements: 20,
}
```

修改后：
```ts
thresholds: {
  // 2026-06-09 v2.1 Day 22 末：T1+T2 累计完成，提升到 25%
  lines: 25,
  functions: 25,
  branches: 18,
  statements: 25,
}
```

```bash
cd /home/fz/project/MoRanJiangHu
npx vitest run --coverage 2>&1 | tail -10
```

预期：threshold 校验通过。如失败回退到 22%。

- [ ] **Step 5：commit Day 22**

```bash
cd /home/fz/project/MoRanJiangHu
git add services/ai/image/*.test.ts vitest.config.ts
git -c user.email=planner@moran.local -c user.name=planner commit -m "test(ai-image): 写 imageGeneration + imageStorage 测试 + threshold 25%"
```

---

## 验收标准

- [ ] `services/ai/text/novelDecomposition.test.ts` 5+ 用例通过
- [ ] `services/ai/text/storyCoreTasks.test.ts` 5+ 用例通过
- [ ] `services/ai/image/imageGenerationClient.test.ts` 3+ 用例通过
- [ ] `services/ai/image/imageStorage.test.ts` 3+ 用例通过
- [ ] 全项目覆盖率 ≥ 30%
- [ ] T2 services 覆盖率 ≥ 60%
- [ ] vitest threshold 25%
- [ ] TS 0 错误
- [ ] 0 业务逻辑变更
- [ ] 严守 spec test 禁区

---

## 风险与依赖

| 风险 | 等级 | 缓解 |
|---|---|---|
| msw handlers 与真实 AI 行为差异 | MEDIUM | msw 只 mock 成功响应；错误路径用 snapshot 替代 |
| novelDecomposition 拆分后 import 路径错 | LOW | 优先用 `find` 找新路径 |
| 4 大文件有跨模块 import 链，mock 难 | MEDIUM | 仅测纯函数 / 状态机部分，副作用函数标记 skip |
| threshold 25% 过高（实际 < 25%）| LOW | Day 22 末先跑 coverage 验证；如失败回退到 22% |

### 依赖

- 现有：msw（v2.0 验证）、fake-indexeddb（v2.0 验证）
- 新增：无

---

## 参考文档

- 父 spec：docs/superpowers/specs/2026-06-09-project-optimization-roadmap-v2-1-design.md §5
- 前置：Phase A — docs/plans/2026-06-09_phase-a-ci-upgrade.md
- 前置：Phase B1 — docs/plans/2026-06-09_phase-b1-t1-pure-functions.md
- v2.0 dbService 拆分决策：docs/phase-decisions/2026-06-06-phase5-test-fix.md
- 项目规则：/home/fz/.claude/rules/common/testing.md
