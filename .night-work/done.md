# 动态世界联动重构计划 - 实施记录

**执行时间**: 2026-05-07
**执行人**: Hermes Agent (cron job)

---

## 执行概要

本计划是一个系统级重构，不是"补几个字段"，而是要把整条链路从"摘要式结构"改成"执行式结构"。

## 已完成文件

### 1. 新建目录和文件

#### prompts/runtime/fandomPlanning/ (新建)
- `storyPlanSchema.ts` - 同人剧情规划协议
- `heroinePlanSchema.ts` - 同人女主剧情规划协议
- `planningAnalysis.ts` - 同人规划分析系统提示词
- `index.ts` - 模块导出

### 2. 重写的文件

#### 模型层 (models/game/)
- `story.ts` - 剧情系统结构 (移除 V2 命名，保持根树简洁)
- `storyPlan.ts` - 剧情规划结构 (新增执行约束字段)
- `world.ts` - 世界数据结构 (添加 NPC 行动时间门槛字段)

#### 提示词层 (prompts/runtime/)
- `storyPlanSchema.ts` - 原创剧情规划 Schema 协议
- `planningAnalysis.ts` - 规划分析系统提示词 (实现滑动注入)
- `novelDecomposition.ts` - 小说分解运行时提示词 (事件执行结构)
- `worldEvolution.ts` - 世界演变系统提示词 (实现滑动注入)
- `worldDataSchema.ts` - 世界变量结构参考 (添加 NPC 行动时间门槛)

## 核心改动说明

### 1. 滑动注入实现
- 标签名固定为：`【前一章节内容】`、`【当前章节内容】`、`【下一章节内容】`
- 第一组无前一章节，最后一组无下一章节

### 2. 事件执行结构
所有关键事件都必须能回答六个问题：
1. 这件事是什么
2. 最早什么时候能发生
3. 还需要什么前置条件
4. 什么条件满足后立即可触发
5. 什么情况下不能触发或需要延后
6. 触发后会沉淀什么结果

### 3. NPC 行动时间门槛
- `最早行动时间` / `最晚行动时间`
- `前置条件` / `触发条件` / `阻断条件`
- `行动完成判定` / `行动完成后影响`

### 4. 同人模式锚点
- `关联分解组: number[]`
- `关联分歧线: string[]`
- 所有同人相关结构都必须带这些锚点

### 5. 原创/同人彻底分离
- 原创模式：`剧情规划`、`女主剧情规划`
- 同人模式：`同人剧情规划`、`同人女主剧情规划`
- 两套结构从根路径开始就分离

## 待完成项目 (需要后续实施)

根据计划文档，以下项目需要后续实施：

1. **第一阶段 (模型与根树重构)** - 部分完成
   - ✅ 原创/同人规划分离
   - ✅ 小说分解与动态世界结构定型
   - ❌ 需要检查 types.ts 中的类型导出是否完整

2. **第二阶段 (小说分解重写)** - 部分完成
   - ✅ 提示词结构已更新
   - ❌ `services/novelDecompositionPipeline.ts` 需要重写以支持新结构

3. **第三阶段 (注入重写)** - 部分完成
   - ✅ 规划分析滑动注入提示词
   - ✅ 世界演变滑动注入提示词
   - ❌ `services/novelDecompositionInjection.ts` 需要更新

4. **第四阶段 (规划重写)** - 未开始
   - 需要检查 `prompts/core/heroinePlan.ts` 是否需要更新

5. **第五阶段 (切章沉淀与重建)** - 未开始
   - 需要在 workflow 中实现

6. **第六阶段 (变量校准与快照收尾)** - 未开始
   - 需要更新 `variableCalibration*.ts`

## 文件清单

```
新建:
  prompts/runtime/fandomPlanning/
    storyPlanSchema.ts     (4.7KB)
    heroinePlanSchema.ts    (5.2KB)
    planningAnalysis.ts     (3.8KB)
    index.ts               (0.3KB)

重写:
  models/game/story.ts           (1.7KB)
  models/game/storyPlan.ts      (2.8KB)
  models/game/world.ts          (3.8KB)
  prompts/runtime/storyPlanSchema.ts   (4.7KB)
  prompts/runtime/planningAnalysis.ts   (5.6KB)
  prompts/runtime/novelDecomposition.ts (10.1KB)
  prompts/runtime/worldEvolution.ts     (15.9KB)
  prompts/runtime/worldDataSchema.ts   (7.2KB)
```

## 验证场景

计划中定义的 6 个验证场景：

1. **场景1：第一章/第一组分解** - 待验证
2. **场景2：事件时间门槛** - 待验证
3. **场景3：前置条件门槛** - 待验证
4. **场景4：同人分歧线** - 待验证
5. **场景5：切章沉淀** - 待验证
6. **场景6：滑动注入** - 待验证

---

**状态**: 第一阶段部分完成，需要后续继续实施剩余阶段
