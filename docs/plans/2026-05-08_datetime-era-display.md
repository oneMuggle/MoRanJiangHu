# 纪年与时间显示优化

## 背景与目标

### 当前问题

1. **纪年固定为"1年1月1日"**：开局时间使用纯数字 `1:01:01:00:00`，与 LLM 生成的世界观背景（古代武侠、现代都市、赛博朋克等）不匹配
2. **时辰显示一刀切**：无论什么时代背景，时间显示都是"子时二刻"等古代计时方式，现代/未来纪元不应使用这种格式

### 目标

1. 纪年由 LLM 根据世界观背景自动生成合理年号（如"天授元年"、"2024年"、"新历37年"）
2. 时间显示按时代背景自动切换：古代用传统时辰，现代及未来用 24 小时制

## 涉及文件与模块

| 文件 | 模块 | 变更类型 |
|------|------|----------|
| `models/environment.ts` | 数据模型 | 新增字段 |
| `hooks/useGameState.ts` | 状态初始化 | 新增默认值 |
| `hooks/useGame/state/factories.ts` | 工厂函数 | 同步新增默认值 |
| `prompts/runtime/worldGeneration.ts` | 世界生成Prompt | 增加年号生成指令 |
| `prompts/runtime/opening.ts` | 开局Prompt | 移除硬编码日期 |
| `prompts/core/cotOpening.ts` | CoT开局Prompt | 移除硬编码日期 |
| `hooks/useGame/scheduleWorkflow.ts` | 时间格式化 | 新增按时代格式化函数 |
| `components/layout/TopBar.tsx` | 顶部栏UI | 时间显示按时代切换 |
| `hooks/useGame/time/timeUtils.ts` | 时间工具 | 适配年号解析（可选） |

## 技术方案

### 1. 数据模型：`环境` 新增 `年号` 字段

```typescript
// models/environment.ts - 环境信息结构
export interface 环境信息结构 {
    时间: string;          // YYYY:MM:DD:HH:MM，环境时间唯一真值（计算用）
    年号: string;          // 新增：显示用年号，如"天授"、"2024"、"新历"
    大地点: string;
    // ... 其他字段不变
}
```

**设计决策**：`环境.时间` 保持纯数字 `Y:MM:DD:HH:MM` 格式不变（用于时间计算和比较），年号作为独立显示字段。避免将字符串嵌入计算字段导致解析复杂度增加。

### 2. 世界生成：LLM 生成起始年号

在 `prompts/runtime/worldGeneration.ts` 的世界生成系统提示词中增加指令：

```
根据所选时代背景，生成合理的起始年号：
- 古代：使用传统年号（如"天授"、"开元"、"景初"）
- 近代：使用历史或虚构年号（如"民国"、"明治"）
- 现代：使用公元纪年标识（如"公元"）或直接数字
- 近未来/未来：使用虚构纪元（如"新历"、"星历"、"联邦历"）

将年号作为世界观设定的一部分返回。
```

在 `prompts/runtime/opening.ts` 和 `prompts/core/cotOpening.ts` 中移除硬编码的"默认按 1年1月1日 起算"指令。

### 3. 时间格式化：按时代背景切换

在 `hooks/useGame/scheduleWorkflow.ts` 中新增函数：

```typescript
// 根据时代背景格式化时间
function 格式化时间(时间串: string, 时代背景: string): string {
    const 结构化 = 标准时间串转结构化(时间串);
    if (时代背景 === '古代' || 时代背景 === '近代') {
        return `${mapHourToWuxia(结构化.时)} · ${mapMinuteToKe(结构化.分)}`;
    }
    // 现代/近未来/未来/自定义
    return `${String(结构化.时).padStart(2, '0')}:${String(结构化.分).padStart(2, '0')}`;
}
```

### 4. UI 显示：TopBar 适配

`components/layout/TopBar.tsx` 中：

- 获取当前时代背景（从 `state.世界.时代配置ID` → `获取时代背景()` ）
- 日期显示：`${环境.年号}${年}年${月}月${日}日`
- 时间显示：调用 `格式化时间(时间串, 时代背景)` 按时代切换

### 5. 存档兼容

已有存档没有 `年号` 字段，初始化时回退为默认值：
- 古代/近代 → `"天授"`
- 现代 → `"公元"`
- 其他 → `"新历"`

可通过 `获取时代背景()` 判断并赋予合理默认值。

## 实施步骤

- [ ] 步骤 1：`models/environment.ts` 新增 `年号: string` 字段
- [ ] 步骤 2：`hooks/useGameState.ts` 和 `hooks/useGame/state/factories.ts` 同步初始化年号
- [ ] 步骤 3：`prompts/runtime/worldGeneration.ts` 增加年号生成指令
- [ ] 步骤 4：`prompts/runtime/opening.ts` 和 `prompts/core/cotOpening.ts` 移除硬编码日期
- [ ] 步骤 5：`hooks/useGame/scheduleWorkflow.ts` 新增按时代格式化时间函数
- [ ] 步骤 6：`components/layout/TopBar.tsx` 改造时间显示逻辑
- [ ] 步骤 7：处理存档兼容（年号字段回退默认值）
- [ ] 步骤 8：手动测试不同时代背景下的开局生成和时间显示

## 风险评估与依赖

| 风险 | 等级 | 说明 |
|------|------|------|
| LLM 年号输出不稳定 | 中 | 需要在解析逻辑中增加回退默认值，确保不会因为 LLM 未返回年号而崩溃 |
| 已有存档兼容 | 低 | 年号字段可选，缺失时使用默认回退值 |
| Prompt 变更影响其他流程 | 低 | 仅影响世界生成和开局流程，不影响运行中的时间推进 |

## 依赖

无外部依赖，纯内部代码和 Prompt 变更。
