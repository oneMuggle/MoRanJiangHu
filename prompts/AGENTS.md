# prompts/ - AI 提示词系统

## 概述
武侠游戏 AI 提示词工程 (~160 文件，6 层目录结构)

## 结构

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

## 层级说明

### core/ - 核心规则
| 文件 | 用途 |
|------|------|
| `rules.ts` | 核心游戏规则 |
| `format.ts` | 输出格式定义 |
| `cot.ts` | 主流程思维链 |
| `cotCombat.ts` | 战斗思维链 |
| `cotJudge.ts` | 判定思维链 |
| `memory.ts` | 记忆法则 |
| `realm.ts` | 境界体系 |
| `world.ts` | 世界观基础 |

### runtime/ - 运行时链路
| 文件 | 用途 |
|------|------|
| `worldGeneration.ts` | 世界生成 |
| `worldEvolution.ts` | 世界演变 |
| `opening.ts` | 开局生成 |
| `variableGeneration.ts` | 变量生成 |
| `planningAnalysis.ts` | 规划分析 |
| `storyStyles/` | 剧情风格变体 |

### stats/ - 数值规则
- `character.ts` - 角色属性
- `combat.ts` - 战斗数值
- `experience.ts` - 经验成长
- `kungfu.ts` - 功法体系
- `drop.ts` - 掉落资源
- `world.ts` - 世界数值

## 使用方式

```typescript
// prompts/index.ts
import { 默认提示词 } from './prompts';

// 默认提示词 = 核心 + 数值 + 难度 + 写作
```

## 添加新提示词

1. 在对应子目录创建 `.ts` 文件
2. 导出命名前缀对应目录：
   - `核心_*` → core/
   - `数值_*` → stats/
   - `写作_*` → writing/
3. 在 `prompts/index.ts` 添加导出

## 开发注意

- 提示词是 TypeScript 常量
- 支持 `import` 其他提示词模块
- COT 文件提供 Chain-of-Thought 推理片段
