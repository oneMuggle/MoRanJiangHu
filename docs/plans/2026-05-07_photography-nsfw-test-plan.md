# 写真 NSFW 模块测试方案

## 概述

为写真 NSFW 模块建立完整的四级测试体系：单元测试（纯函数逻辑）、集成测试（模块注册/提示词构建/XML 解析）、E2E 测试（拍摄流程 UI 交互）、AI 响应测试（真实 API 端到端验证）。项目已有 Vitest + Playwright 基础设施，但尚未有任何写真模块测试用例。

## 测试端点

- **API 地址**: `https://gcli.ggchan.dev/`
- **API 密钥**: `gg-gcli-RALFsIs47kRn7m3HKh98dTj0R48ccM2ln8sIVDc3OSA`
- **环境变量**: `GCLI_API_KEY`（密钥应通过环境变量注入，不硬编码）

---

## Phase 1: 测试工厂函数（基础依赖）

### 1.1 测试用状态工厂 `__tests__/setup/mockStateFactory.ts`

创建一组可复用的工厂函数，用于快速生成测试所需的模特、摄影师、拍摄项目、泄露事件状态。

**核心工厂函数**：
- `createMockModel(overrides?)` — 模特核心状态
- `createMockPhotographer(overrides?)` — 摄影师核心状态
- `createMockShootProject(overrides?)` — 拍摄项目状态
- `createMockLeakEvent(overrides?)` — 泄露事件状态
- `createMockSettings(overrides?)` — 写真NSFW设置

**预设场景工厂**：
- `createSafeScenario()` — 低风险场景（影棚 + G级 + 业界大佬）
- `createRiskyScenario()` — 高风险场景（酒店 + R级 + 有争议）
- `createExtremeScenario()` — 极端风险场景（个人住所 + XXX + 惯犯）

### 1.2 XML 解析测试辅助 `__tests__/setup/xmlParserTestHelper.ts`

帮助函数构造各种格式的 `<写真系统状态>` XML 标签内容。

---

## Phase 2: 单元测试（Vitest）

### 2.1 规范化函数测试 `__tests__/photographyNSFW/normalization.test.ts`

| 用例 | 输入 | 期望 | 覆盖分支 |
|------|------|------|----------|
| N-01 | 空对象 `{}` | 返回全部默认值 | 默认回退路径 |
| N-02 | 完整合法设置 | 原样返回 | 正常路径 |
| N-03 | `启用写真NSFW系统: 'true'` (字符串) | 回退到默认 `false` | 类型校验 |
| N-04 | `NSFW内容强度: '过度'` | 回退到默认 `'微暗'` | 枚举校验 |
| N-05 | `次要玩法权重: 150` | 限制为 `100` | 范围限制(上界) |
| N-06 | `次要玩法权重: -10` | 限制为 `0` | 范围限制(下界) |
| N-07 | `主要玩法层: '经营管理'` | 正确保留 | 枚举合法值 |
| N-08 | `泄露事件频率: '超高'` | 回退到默认 `'低'` | 枚举校验 |
| N-09 | 部分字段 `null/undefined` | 对应字段使用默认值 | 缺失字段处理 |
| N-10 | `涉及BDSM模块: 1` (数字) | 回退到默认 `false` | 布尔类型校验 |

### 2.2 引擎纯函数测试 `__tests__/photographyNSFW/engine.test.ts`

**风险评估函数**：
| 用例 | 场景 | 期望 |
|------|------|------|
| E-01 | 影棚 + G级 + 业界大佬 + 平台担保 | 风险值 <= 20 |
| E-02 | 野外 + XXX + 惯犯 + 拒绝交付 | 风险值 >= 85 |
| E-03 | 酒店 + R级 + 普通摄影师 + 直接交付 | 风险值 30-70 区间 |
| E-06 | 所有场景 | 返回值始终 0-100 |
| E-07 | 权重公式验证 | 场所*0.20 + 尺度*0.30 + 信誉*0.25 + 交付*0.25 |

**尺度递进函数**：
| 用例 | 场景 | 期望 |
|------|------|------|
| E-08 | 越界倾向=0 + 极度保护 + G级 | 概率 < 0.15 |
| E-09 | 越界倾向=100 + 开放型 + G级 | 概率 > 0.40 |
| E-13 | `下一尺度('G级')` | 返回 `'PG-13'` |
| E-14 | `下一尺度('XXX')` | 返回 `'XXX'` (已达上限) |
| E-15 | 尺度递进顺序链 | G级 -> PG-13 -> R级 -> NC-17 -> XXX |

**越界行为判定**：
| 用例 | 场景 | 期望 |
|------|------|------|
| E-16 | 影棚 + G级 + 纯艺术动机(低越界倾向) | 大概率返回 `null` |
| E-17 | 个人住所 + XXX + 偷拍动机(高越界倾向) | 大概率返回非 null |
| E-18 | 越界行为返回类型 | 必须是 `越界行为类型` 之一 |

**摄影师口碑评分**：
| 用例 | 场景 | 期望 |
|------|------|------|
| E-21 | 技术水平=100 + 业界大佬 + 0投诉 + 10回头客 | 评分接近 100 |
| E-22 | 技术水平=0 + 惯犯 + 10投诉 + 0回头客 | 评分接近 0 |
| E-23 | 投诉惩罚 | 每增加 1 投诉，评分 -5 |
| E-25 | 返回值范围 | 始终 0-100 |

**摄影师筛选**：
| 用例 | 场景 | 期望 |
|------|------|------|
| E-26 | 极度保护 + [口碑60, 口碑40] | 过滤后只剩口碑60 |
| E-28 | 开放型 + [口碑10, 口碑80] | 不过滤，按口碑降序排列 |

**泄露事件判定**：
| 用例 | 场景 | 期望 |
|------|------|------|
| E-31 | 风险值=10 + 频率=低 | 大概率不触发 |
| E-32 | 风险值=90 + 频率=高 | 较高概率触发 |
| E-36 | 频率系数验证 | 低=0.3, 中=0.6, 高=1.0 |

### 2.3 拍摄工作流单元测试 `__tests__/photographyNSFW/shootWorkflow.test.ts`

| 用例 | 场景 | 期望 |
|------|------|------|
| SW-01 | 创建新项目 | id 以 `shoot_` 开头，阶段='未开始' |
| SW-02~05 | 推进第 1~最大回合 | 阶段正确递进 |
| SW-05 | 推进到最大回合(5) | 阶段变为 `'已完成'`，触发 `拍摄完成` 事件 |
| SW-07 | 尺度递进开启 + 模特同意 | 实际尺度+1，记录变更历史 |
| SW-08 | 尺度递进开启 + 模特拒绝 | 信任度-5，记录 `尺度递进被拒` 事件 |
| SW-09 | 越界行为触发 | 记录越界行为，信任度和安全感下降 |
| SW-10 | 越界行为=威胁恐吓 | 信任度-30，安全感-20 |
| SW-13 | 取消拍摄 | 阶段变为 `'已取消'` |
| SW-14 | 投诉拍摄 | 阶段变为 `'已投诉'`，违规记录增加 |
| SW-16 | 不可变性验证 | 原始对象不被修改 |

### 2.4 泄露工作流单元测试 `__tests__/photographyNSFW/leakWorkflow.test.ts`

| 用例 | 场景 | 期望 |
|------|------|------|
| LW-01 | 泄露事件关闭 | 返回 `null` |
| LW-04 | 推进泄露传播 1 回合 | 传播回合+1，各项影响增加 |
| LW-06 | 传播范围升级：小范围 -> 论坛传播 (回合>3) | 传播范围正确升级 |
| LW-07 | 传播范围升级：论坛传播 -> 社交媒体 (回合>5) | 传播范围正确升级 |
| LW-08 | 传播范围升级：社交媒体 -> 全网扩散 (回合>7, 主动泄露) | 传播范围正确升级 |
| LW-09 | 泄露影响<20 | 事件状态变为 `'已平息'` |
| LW-10 | 心理影响>=80 | 事件状态变为 `'已发酵'` |
| LW-11 | 应对策略=法律维权 | 应对效果='有效' |
| LW-12~16 | 不同应对策略组合 | 应对效果正确判定 |
| LW-17 | 不可变性 | 原始事件和模特对象不被修改 |

---

## Phase 3: 集成测试（Vitest）

### 3.1 提示词构建函数测试 `__tests__/photographyNSFW/promptBuilders.test.ts`

| 用例 | 函数 | 场景 | 期望 |
|------|------|------|------|
| PB-01 | `构建玩法层约束` | 灰色地带 + 露骨 | 输出包含"灰色地带"和"露骨" |
| PB-03 | `构建拍摄场景约束` | 酒店 + 私房暧昧 | 输出包含场所风险描述 |
| PB-04 | `构建模特心理约束` | 信任度=90 | 输出包含"高度信任" |
| PB-07 | `构建尺度递进约束` | 微暗 + G级 | 可用尺度只包含 G级和PG-13 |
| PB-08 | `构建尺度递进约束` | 露骨 + G级 | 可用尺度包含全部5级 |
| PB-14 | `构建BDSM联动约束` | 关系阶段=深入 + 2个把柄 | 输出包含"权力动态"和把柄数量 |
| PB-15 | `构建写真NSFW完整叙事约束` | 全参数 | 输出包含所有子组件，用 `\n\n` 分隔 |
| PB-16 | `构建写真NSFW完整叙事约束` | 空参数 | 只输出状态输出要求（最小输出） |

### 3.2 模块注册和参数提取集成测试 `__tests__/photographyNSFW/integration.test.ts`

| 用例 | 测试目标 | 场景 | 期望 |
|------|----------|------|------|
| INT-01 | 模块注册完整性 | 验证模块对象 | 包含 id, name, version, priority, masterToggleKey, defaultSettings 等 |
| INT-02 | 参数提取 | gameState 不含写真系统 | 返回 `null` |
| INT-03 | 参数提取 | 有写真系统但档案全空 | 返回 `null` |
| INT-07 | 参数提取 - BDSM | 项目涉及BDSM=true | 返回包含BDSM关系阶段和把柄 |
| INT-08 | 参数提取 - 多BDSM | 多个项目不同阶段 | 返回最深入的阶段 |
| INT-09 | XML 解析 - 正常 | 合法 JSON | 正确解析 |
| INT-11 | XML 解析 - 无效 | 非法 JSON | 不抛异常，静默失败 |
| INT-12 | XML 解析 - 缺失 | 无标签 | 不做任何修改 |
| INT-16 | 规范化设置集成 | 模块 normalizeSettings | 委托给 `规范化写真NSFW设置` |

---

## Phase 4: E2E 测试（Playwright）

### 4.1 仪表盘 E2E `e2e/photographyNSFW/dashboard.spec.ts`

| 用例 | 场景 | 期望 |
|------|------|------|
| E2E-01 | 桌面端仪表盘渲染 | 显示模特档案区域、拍摄项目追踪、泄露事件区域 |
| E2E-02 | 移动端仪表盘渲染 | 移动视口下显示优化布局 |
| E2E-03 | 空状态显示 | 显示"暂无数据"或空状态提示 |
| E2E-04 | 模特卡片展开 | 点击后展开显示详细信息 |
| E2E-05 | 拍摄项目进度条 | 显示进度条和彩色尺度指示器 |
| E2E-06 | 泄露事件着色 | 根据严重程度显示不同颜色 |

### 4.2 设置面板 E2E `e2e/photographyNSFW/settings.spec.ts`

| 用例 | 场景 | 期望 |
|------|------|------|
| E2E-S01 | 设置面板渲染 | 显示 master toggle 和内容强度选择器 |
| E2E-S02 | Master Toggle 联动 | 关闭后子选项变灰/禁用 |
| E2E-S03 | 开关状态持久化 | 刷新页面后设置保持 |
| E2E-S04 | 玩法层选择→灰色地带 | 道德选择开关变为可用 |
| E2E-S05 | 玩法层选择→经营管理 | 道德选择开关变为禁用 |

---

## Phase 5: AI 响应测试

### 5.1 AI 响应验证 `e2e/photographyNSFW/aiResponse.spec.ts`

使用 `https://gcli.ggchan.dev/` API 端点发送写真上下文提示词，验证 AI 响应。

**API 调用封装**：
```typescript
const API_ENDPOINT = 'https://gcli.ggchan.dev/';
const API_KEY = process.env.GCLI_API_KEY || 'gg-gcli-RALFsIs47kRn7m3HKh98dTj0R48ccM2ln8sIVDc3OSA';

async function callAI(prompt: string): Promise<string> {
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
            model: 'default',
            messages: [{ role: 'user', content: prompt }],
        }),
    });
    const data = await response.json();
    return data.choices[0].message.content;
}

function hasValidPhotographyStatusTag(response: string): boolean {
    const match = response.match(/<写真系统状态>\s*([\s\S]*?)\s*<\/写真系统状态>/);
    if (!match) return false;
    try { JSON.parse(match[1]); return true; } catch { return false; }
}
```

| 用例 | 场景 | 期望 |
|------|------|------|
| AI-01 | 基本拍摄场景 | 响应包含合法的 `<写真系统状态>` 标签 |
| AI-02 | 尺度递进场景 | 响应包含尺度变更的状态更新 |
| AI-03 | 越界行为场景 | 响应包含越界行为记录和模特状态变化 |
| AI-04 | 泄露事件场景 | 响应包含泄露事件状态更新 |
| AI-05 | 标签 JSON 格式 | JSON 可正常解析 |
| AI-06 | 无状态变化场景 | 响应可能不包含标签（符合规则） |
| AI-07 | 多模块联动 | 写真 + BDSM 联动约束，响应包含跨模块状态更新 |

---

## Phase 6: 覆盖率验证

### 覆盖率目标

| 模块文件 | 目标行覆盖率 | 目标分支覆盖率 |
|----------|-------------|---------------|
| `models/photographyNSFW/normalization.ts` | 100% | 100% |
| `hooks/useGame/photographyNSFWEngine.ts` | 90%+ | 85%+ |
| `hooks/useGame/photographyShootWorkflow.ts` | 85%+ | 80%+ |
| `hooks/useGame/photographyLeakWorkflow.ts` | 85%+ | 80%+ |
| `prompts/runtime/photographyNSFW.ts` | 80%+ | 75%+ |
| `modules/contemporary/photographyNSFW/registration.ts` | 75%+ | 70%+ |
| **模块整体** | **>= 80%** | **>= 75%** |

---

## 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 概率函数测试不稳定 | 单元测试 flaky | 使用 `vi.spyOn(globalThis, 'random').mockReturnValue()` 固定随机种子 |
| E2E 测试依赖完整游戏启动 | 执行缓慢 | `test.beforeAll` 一次性初始化，多个测试共享状态 |
| AI 响应测试受网络波动影响 | flaky | 超时 30 秒，`test.retry(2)` 自动重试 |
| XML 解析逻辑嵌入 responseCommandProcessor | 难以独立测试 | 将解析提取为独立纯函数 |
| 提示词输出很长，断言脆弱 | 测试不稳定 | 使用 `toContain` 断言关键子串，不精确匹配全文 |
| E2E 前置条件复杂 | 难以编写 | 创建 `setupPhotographyGame()` 辅助函数封装完整流程 |

---

## 文件清单

| 阶段 | 文件路径 | 类型 | 估计行数 |
|------|----------|------|----------|
| P1 | `__tests__/setup/mockStateFactory.ts` | 新增 | ~150 |
| P1 | `__tests__/setup/xmlParserTestHelper.ts` | 新增 | ~50 |
| P2 | `__tests__/photographyNSFW/normalization.test.ts` | 新增 | ~120 |
| P2 | `__tests__/photographyNSFW/engine.test.ts` | 新增 | ~350 |
| P2 | `__tests__/photographyNSFW/shootWorkflow.test.ts` | 新增 | ~200 |
| P2 | `__tests__/photographyNSFW/leakWorkflow.test.ts` | 新增 | ~180 |
| P3 | `__tests__/photographyNSFW/promptBuilders.test.ts` | 新增 | ~180 |
| P3 | `__tests__/photographyNSFW/integration.test.ts` | 新增 | ~250 |
| P4 | `e2e/photographyNSFW/dashboard.spec.ts` | 新增 | ~150 |
| P4 | `e2e/photographyNSFW/settings.spec.ts` | 新增 | ~120 |
| P5 | `e2e/photographyNSFW/aiResponse.spec.ts` | 新增 | ~150 |
| - | `vitest.config.ts` | 修改 | +5 |

**总计：11 个新文件，1 个修改文件，约 1,900 行测试代码。**

---

## 实施顺序

1. **Phase 1** — 工厂函数（所有后续阶段的基础）
2. **Phase 2** — normalization + engine（纯函数，零依赖）→ workflows（依赖 engine）
3. **Phase 3** — prompt builders（独立）→ integration（依赖前面的测试工厂）
4. **Phase 4** — E2E（需要项目可运行）
5. **Phase 5** — AI 响应（依赖 API 端点）
6. **Phase 6** — 覆盖率验证（最后验证）

## 成功标准

- [ ] 所有单元测试通过
- [ ] 所有集成测试通过
- [ ] E2E 测试在本地开发服务器上通过
- [ ] AI 响应测试通过（API 端点可达时）
- [ ] 模块整体行覆盖率 >= 80%
- [ ] 所有测试遵循项目约定（中文命名、AAA 模式、描述性测试名）
- [ ] 无 `console.log` 残留在测试代码中
