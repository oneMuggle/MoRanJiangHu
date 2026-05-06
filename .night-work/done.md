# 夜间工作记录 (Night Work Log)

## 2026-05-07 执行记录

---

### 墨染江湖架构分析与重构方案

**计划文件**: `docs/plans/2026-05-06_architecture-analysis.md`  
**执行时间**: 2026-05-07 01:30 AM  
**状态**: ✅ 分析完成

---

#### 一、架构分析验证结果

##### 1.1 项目规模确认

| 指标 | 计划数值 | 实际数值 |
|------|----------|----------|
| hooks/useGame/ 文件数 | ~150 | **154** (含子目录) |
| systemPromptBuilder.ts | 1,733行 | **1,733行** ✅ |
| models/system.ts | 1,780行 | **1,783行** |
| App.tsx | 2,115行 | **2,115行** ✅ |

##### 1.2 已实现的部分（P0推荐项）

| 项目 | 状态 | 位置 |
|------|------|------|
| **Context Providers** | ✅ 已实现 | `contexts/GameStateContext.tsx` (427行) |
| **useGameSelectors** | ✅ 已实现 | `hooks/useGameSelectors.ts` (526行) |
| **stateTransforms.ts 拆分** | ✅ 已完成 | `hooks/useGame/transforms/` (5个文件) |
| **state/ 目录** | ✅ 已创建 | `hooks/useGame/state/` (4个文件) |

##### 1.3 待处理问题确认

| 问题 | 验证结果 | 建议动作 |
|------|----------|----------|
| **prompts/index.ts 导出遗漏** | ✅ 确认：intimacy/ 和 runtime/gameMaster/ 未导入 | P3 - 修复 |
| **两个 GameMaster 系统** | ✅ 确认：services/gameMaster/ 与 services/ai/gameMaster/ 并存 | P2 - 合并 |
| **models/ 重复文件** | ✅ 确认：item.ts、kungfu.ts 有差异；worldbook.ts 完全相同 | P2 - 清理 |
| **hooks/useGame/ 扁平化** | ✅ 确认：仅4个子目录，142文件散落顶层 | P1 - 按功能域分组 |
| **巨型文件未拆分** | ⚠️ 部分拆分：systemPromptBuilder.ts 仍为1,733行 | P0 - 继续拆分 |

---

#### 二、P0 优先级项分析

##### 2.1 systemPromptBuilder.ts (1,733行)

**现状**: 单文件包含完整系统提示词构建逻辑  
**建议拆分**:
```
hooks/useGame/systemPrompt/
├── core/           # 核心构建逻辑
├── era/            # 时代主题相关
├── runtime/        # 运行时组装
└── index.ts        # 统一导出
```

##### 2.2 activeMobileWindow 提取

**现状**: App.tsx 内计算逻辑散落  
**建议**: 提取为 `useWindowRouter` hook

##### 2.3 closeAllPanels 提取

**现状**: App.tsx:497 定义，~10处调用  
**建议**: 移至 useGame setters 或独立 hook

---

#### 三、P1 优先级项分析

##### 3.1 hooks/useGame/ 目录重组

**当前结构**:
```
hooks/useGame/
├── config/        (2文件)
├── image/         (11文件)
├── saveLoad/       (2文件)
├── campusNSFW/    (2文件)
├── [142个扁平文件]
```

**建议结构**:
```
hooks/useGame/
├── _workflows/      # 核心工作流
├── _state/           # 状态管理 (已有)
├── _context/         # 上下文构建
├── _memory/          # 记忆系统 (5文件)
├── _bdsm/            # BDSM功能 (7文件)
├── _nsfw/            # NSFW功能 (3文件)
├── _variable/        # 变量系统 (11文件)
├── _world/           # 世界系统
└── _shared/         # 共享工具
```

##### 3.2 models/system.ts 拆分

**当前大小**: 1,783行  
**建议拆分**:
- `models/ai-config.ts` - API配置
- `models/image-config.ts` - 图片生成配置
- `models/game-settings.ts` - 游戏设置
- `models/era-config.ts` - 时代配置（统一 eraTheme/）

---

#### 四、P2/P3 优先级项

| 优先级 | 项目 | 说明 |
|--------|------|------|
| P2 | 删除 models/ 重复文件 | worldbook.ts 完全相同；item.ts、kungfu.ts 有部分差异 |
| P2 | 合并两个 GameMaster | services/gameMaster/ + services/ai/gameMaster/ |
| P3 | 修复 prompts/index.ts | 添加 intimacy/ 和 runtime/gameMaster/ 导出 |

---

#### 五、不建议现在做的（已确认）

| 项目 | 原因 |
|------|------|
| 引入 Redux | boilerplate太多，当前不需要 |
| 微前端拆分 | 项目规模未到收益点 |
| 彻底重写 | 风险极高，架构虽有缺陷但可运行 |

---

#### 六、结论

**最大问题**: 所有状态和逻辑堆在一个 ~3000行的 useGame hook 和 150+文件的扁平目录中

**已有改善**: Context Providers + Selectors 阶段一已完成，渲染性能已有提升

**重构路径**: 目录重组 → models拆分 → Zustand迁移(可选) → Feature Module

**建议立即行动**:
1. P0: 继续拆分 systemPromptBuilder.ts
2. P1: hooks/useGame/ 按功能域分组
3. P1: models/system.ts 拆分为 ai-config + image-config + game-settings

---

**涉及文件**:
- `docs/plans/2026-05-06_architecture-analysis.md` - 原始分析文档
- `contexts/GameStateContext.tsx` - 已实现的Context层
- `hooks/useGameSelectors.ts` - 已实现的选择器层
- `hooks/useGame/transforms/` - 已完成的拆分
- `hooks/useGame/state/` - 已创建的状态目录
- `prompts/index.ts` - 存在导出遗漏
- `models/system.ts` - 1783行待拆分
- `services/gameMaster/` + `services/ai/gameMaster/` - 重复系统

---
