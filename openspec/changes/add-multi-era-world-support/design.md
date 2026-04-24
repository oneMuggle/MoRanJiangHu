## Context

当前项目世界观硬编码为古代中国(古代武侠背景)，由 `prompts/core/ancientRealism.ts` 定义的"古代现实基本逻辑"约束。无时代选择配置，用户无法选择其他时代背景进行游戏。

## Goals / Non-Goals

**Goals:**
- 添加时代选择配置项(古代/现代/未来)
- 时代特定提示词模块动态加载
- 新建游戏时可选择时代
- 各时代对应预设数据分离管理

**Non-Goals:**
- 不修改核心战斗/社交/修炼等游戏机制
- 不实现过于科幻的未来武器系统
- 不修改现有存档的数据结构(向后兼容)

## 技术方案

### 1. 时代类型定义

```typescript
// models/system.ts 新增
export type 时代类型 = '古代' | '现代' | '未来';

// 游戏设置结构扩展
export interface 游戏设置结构 {
  // ... 现有字段
  时代?: 时代类型;  // 默认 '古代'
}
```

### 2. 时代特定提示词模块结构

```
prompts/core/
  ├── ancientRealism.ts      → 重命名为 eraLogic.ts 并添加时代变体
  ├── eraLogic/
  │   ├── ancient.ts         // 古代现实逻辑 (原 ancientRealism)
  │   ├── modern.ts          // 现代社会逻辑 
  │   └── future.ts          // 未来赛博/科技逻辑
  └── index.ts               // 导出时代逻辑选择函数
```

**提示词模块设计要点:**
- 古代: 保留现有礼制、江湖组织形态、武侠修炼体系
- 现代: 法律秩序、公司/帮派、金融/信息传播、枪械/组织
- 未来: 赛博朋克/科技树、人工智能、星际/义体、虚拟经济

### 3. 时代预设数据文件

```
data/presets/
  ├── era/
  │   ├── ancient.ts         // 古代背景、天赋 (现有 presets.ts)
  │   ├── modern.ts          // 现代背景、天赋
  │   └── future.ts         // 未来背景、天赋
  └── index.ts              // 导出时代预设选择器
```

### 4. 世界生成动态提示词构建

```typescript
// prompts/runtime/worldGeneration.ts 修改
import { 获取时代逻辑提示词 } from '../core/eraLogic';

export const 获取世界观生成系统提示词 = (config?: Partial<游戏设置结构> | null): string => {
  const 时代 = config?.时代 || '古代';
  const 时代逻辑 = 获取时代逻辑提示词(时代);  // 动态加载
  
  return [
    时代逻辑,  // 注入时代特定逻辑
    世界观生成基础提示词,
  ].join('\n\n');
};
```

### 5. 新建游戏时代选择UI

建议在 `components/features/NewGame/` 添加:
- `EraSelector.tsx` - 时代选择器组件
- 在开局流程中添加时代选择步骤

## 数据结构

### 扩展游戏设置结构

```typescript
// models/system.ts
export interface 游戏设置结构 {
  // ... 现有字段 (567-603 行)
  时代?: '古代' | '现代' | '未来';  // 新增，默认 '古代'
}
```

### 时代逻辑提示词接口

```typescript
// prompts/core/eraLogic/index.ts
export type 时代类型 = '古代' | '现代' | '未来';

export const 获取时代逻辑提示词 = (时代: 时代类型): string => {
  const 模块 = await import(`./eraLogic/${时代}.ts`);
  return 模块.时代逻辑提示词;
};
```

## 影响评估

### 功能影响
- ✅ 新增时代选择配置项
- ✅ 世界生成动态加载时代逻辑
- ✅ 各时代预设数据独立管理

### 向后兼容性
- ✅ 默认时代为 '古代'，现有存档行为不变
- ⚠️ 旧存档无 `时代` 字段，默认使用古代
- ⚠️ 世界生成提示词结构变化，需要验证现有功能

### 性能影响
- ⚠️ 世界生成时动态加载提示词模块，轻微增加首次加载延迟
- ✅ 提���词模块可缓存，无重复加载

## 跨模块依赖

| 模块 | 修改内容 | 依赖 |
|------|----------|------|
| models/system.ts | 扩展游戏设置 | 无 |
| prompts/core/ | 新增时代逻辑 | 无 |
| prompts/runtime/worldGeneration.ts | 时代感知加载 | prompts/core/eraLogic |
| data/presets/ | 新增时代预设 | 无 |
| components/features/NewGame/ | 时代选择UI | models/system.ts |
| hooks/useGame/openingWorkflow.ts | 感知时代配置 | 游戏设置、prompts |

## 开放问题

1. **现代/未来世界观详细程度**: 需要进一步确认现代和未来世界的具体设定深度
2. **节日系统**: 是否需要为现代/未来添加新的节日定义？
3. **图片生成**: 不同时代的场景图片描述词是否需要不同处理？