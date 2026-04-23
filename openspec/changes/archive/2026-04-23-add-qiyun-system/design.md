## Context

references/气运.md 包含约300个气运设定，分为多个类别。现有项目已具备天赋(天赋结构)和背景(背景结构)系统，位于 types.ts。气运系统将复用现有结构，并在角色创建、开局生成、NPC生成中提供气运选择。

当前状态：
- types.ts 已定义 天赋结构（名称、描述、效果、适用性别、nsfw）
- data/presets.ts 已有 预设天赋 和 预设背景
- models/domain/character.ts 角色数据包含 天赋列表 和 出身背景
- prompts/ 角色创建相关提示词使用模板生成

## Goals / Non-Goals

**Goals:**
- 将气运数据以与天赋兼容的结构存储
- 在角色创建流程中增加气运选择阶段
- 气运对角色六维属性产生可量化修正
- NPC 生成时随机分配气运
- UI 支持气运展示

**Non-Goals:**
- 不实现完整的气运技能系统（仅基础属性修正）
- 不实现「女性向」气运
- 不做气运更换/获取的gameplay
- 不做气运稀有度平衡微调

## Technical Decisions

### 1. 数据存储方案
利用现有 types.ts 中的 天赋结构复用电竞定义，与天赋列表共存。

**方案A：** 新增气运数据到 data/presets.ts（与预设天赋共存）
- 优点：复用现有加载逻辑，不需要新文件
- 缺点：文件变大，约500行

**方案B：** 新建 data/qiyun/index.ts
- 优点：独立模块，便于维护
- 缺点：需新增加载逻辑

**决策：** 方案B，新建 data/qiyun/index.ts，按类别分组导出

### 2. 气运效果实现
气运效果分为「属性修正」和「描述效果」两类。

属性修正（结构化）：
```typescript
interface 气运效果 {
    类型: '属性修正';
    属性: '力量' | '敏捷' | '体质' | '根骨' | '悟性' | '福源';
    修正值: number; // 百分比，如 1.5 = +50%
}
```

描述效果（非数值）：
```typescript
interface 气运效果 {
    类型: '描述效果';
    描述: string;
}
```

### 3. 角色创建整合
修改 prompts/runtime/ 中的开局生成提示词，增加气运选择步骤。

参考现有实现：
- prompts/runtime/initCharacter.ts 角色初始化
- prompts/runtime/worldGeneration.ts 中的NPC生成

## Data Structures

### 气运数据结构
```typescript
export interface 气运结构 {
    名称: string;
    类别: '真·气运' | '限制版气运' | '因果律' | '天道规则' | ...;
    描述: string;
    效果: 气运效果[];
    稀有度: '传说' | '稀有' | '普通';
    代价?: string; // 限制版气运的负面效果描述
}
```

### 角色数据结构扩展
```typescript
// 在角色数据结构中增加
interface 角色数据结构 {
    // ... 现有字段
    气运列表:气运结构[];
}
```

## Implementation Plan

### Phase 1: 数据层
- 新建 data/qiyun/index.ts，包含所有气运数据
- 解析 references/气运.md，按类别结构化
- 排除「女性向」内容

### Phase 2: 类型层
- types.ts 增加气运效果类型定义
- models/domain/character.ts 增加气运列表字段

### Phase 3: 提示词层
- 扩展 prompts/runtime/initCharacter.ts 增加气运选择
- 扩展 prompts/runtime/npcGeneration.ts 随机气运

### Phase 4: UI层
- 组件增加气运展示区域

## Impact Assessment

### 功能影响
- 角色创建流程增加气运选择步骤（约5分钟额外对话）
- 存档结构字段增加，需处理向后兼容

### 兼容性
- 旧存档无气运列表字段，默认空数组
- 提示词修改需更新现有模板

### 性能
- 约300个气运数据，内存占用 < 100KB
- 随机选择时��遍历开销，可缓存

## Risks / Trade-offs

**[风险]** 气运效果描述模糊，数值难量化
→ **缓解：** 按属性修正/描述效果分类，仅属性修正参与计算

**[风险]** 300个气运选择过多，玩家决策困难
→ **缓解：** 初期仅开放部分气运，按稀有度筛选

**[风险]** 提示词过长导致生成质量下降
→ **缓解：** 气运效果简化为属性修正列表，而非完整描述