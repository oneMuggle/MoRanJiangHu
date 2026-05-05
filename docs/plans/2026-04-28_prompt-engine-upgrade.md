# Prompt Engine Upgrade 提示词引擎升级

> **Status:** 设计中 | **最近更新:** 2026-04-28
> **Plan:** 升级提示词引擎结构，增强模块化与可维护性

---

## 背景与目标

当前 `prompts/` 系统包含 ~160 文件，分为 core/runtime/writing/stats/difficulty/shared 六层。
为提升提示词系统的模块化程度、可读性与可维护性，需要进行结构性升级。

---

## 升级内容

### 1. 提示词分层重构

#### 现状分析
```
prompts/
├── core/       # 核心规则与思维链 (19 文件)
├── runtime/    # 运行时链路 (38 文件)
├── writing/    # 写作风格约束 (5 文件)
├── stats/      # 数值系统规则 (13 文件)
├── difficulty/ # 难度判定规则
├── shared/     # 跨链路共享
└── index.ts    # 导出 默认提示词 数组
```

#### 目标结构
```
prompts/
├── core/           # 核心规则与思维链
│   ├── rules.ts    # 核心游戏规则
│   ├── format.ts   # 输出格式定义
│   ├── cot.ts      # 主流程思维链
│   ├── cotCombat.ts # 战斗思维链
│   ├── cotJudge.ts  # 判定思维链
│   └── ...         # 其他核心提示词
├── runtime/        # 运行时链路
│   ├── worldGeneration.ts
│   ├── opening.ts
│   ├── variableGeneration.ts
│   └── ...
├── writing/        # 写作风格约束
├── stats/          # 数值系统规则
├── difficulty/     # 难度判定规则
├── shared/         # 跨链路共享
└── index.ts
```

### 2. 提示词结构标准化

所有提示词文件采用统一导出格式：

```typescript
import { 提示词结构 } from '../../types';

export const 核心_XXX: 提示词结构 = {
  id: 'core_xxx',
  name: 'XXX',
  description: 'XXX描述',
  content: `...`
};
```

### 3. COT 片段复用增强

在 `prompts/shared/` 中增加通用思维链片段：

```typescript
// prompts/shared/cotFragments.ts
export const 共享_判定逻辑 = `
- 先清点判定条件是否满足
- 计算基础值与修正
- 结算结果并更新状态
`;

export const 共享_资源校验 = `
- 检查资源是否充足
- 资源不足时给出明确提示
- 扣除资源并记录变化
`;
```

### 4. 提示词版本控制

为关键提示词添加版本标记：

```typescript
export const 核心_输出格式: 提示词结构 = {
  id: 'core_format',
  name: '输出格式',
  version: '1.2.0',
  lastUpdated: '2026-04-28',
  description: '定义AI输出的标准格式',
  content: `...`
};
```

---

## 实现方案

### 文件变更

| 文件 | 操作 | 说明 |
|------|------|------|
| `prompts/shared/cotFragments.ts` | 新增 | 共享COT片段库 |
| `prompts/core/format.ts` | 修改 | 统一导出格式，添加版本 |
| `prompts/core/rules.ts` | 修改 | 统一导出格式，添加版本 |
| `prompts/index.ts` | 修改 | 添加新的导出项 |

### 核心实现

#### 1. 创建共享COT片段库

```typescript
// prompts/shared/cotFragments.ts
export const 共享_判定逻辑 = `
判断优先级：
1. 检查前置条件是否满足
2. 计算判定基础值（属性+境界修正+随机因子）
3. 与难度等级比对
4. 结算结果并更新状态
`;

export const 共享_资源校验 = `
资源处理流程：
1. 验证资源充足性
2. 计算消耗/获得量
3. 执行状态变更
4. 记录审计日志
`;

export const 共享_NPC行为 = `
NPC行为准则：
1. 保持人设一致性
2. 根据关系亲密度调整态度
3. 遵守世界观基本逻辑
4. 不泄露未公开信息
`;
```

#### 2. 统一提示词导出格式

修改各提示词文件，采用标准化导出：

```typescript
import { 提示词结构 } from '../../types';

export const 核心_输出格式: 提示词结构 = {
  id: 'core_format',
  name: '输出格式',
  version: '1.0.0',
  lastUpdated: '2026-04-28',
  description: '定义AI输出的标准格式',
  content: `【输出格式】
正文：...
变量：...
...`
};
```

---

## 优先级

- **P0**: 创建 `prompts/shared/cotFragments.ts` 共享片段库
- **P1**: 统一 `prompts/core/` 下文件的导出格式
- **P2**: 更新 `prompts/index.ts` 导出
- **P3**: 文档更新

---

## 依赖

- `types/index.ts` - `提示词结构` 类型定义
- `prompts/index.ts` - 主导出文件

---

## 验收标准

1. `prompts/shared/cotFragments.ts` 包含至少 5 个共享COT片段
2. 所有 `prompts/core/` 文件使用统一导出格式
3. `prompts/index.ts` 正确导出所有提示词
4. 压力测试 `npm run stress:test` 通过
