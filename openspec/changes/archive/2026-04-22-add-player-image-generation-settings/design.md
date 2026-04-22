# 主角生图设置优化设计

## Context

### 当前状态

当前 `ImageGenerationSettings.tsx` 设置面板包含以下页签：
- `basic`: 基础开关
- `provider`: 后端/API配置
- `transformer`: 词组转化器配置
- `presets`: 预设管理
- `automation`: 自动任务
- `retry`: 重试设置

预设页签中的**适用范围**仅支持：
- `npc`: NPC角色
- `scene`: 场景

**缺失**：没有主角的独立配置。

### 现有代码模式参考

参考场景生图独立配置（automation页签，第500-538行）：
```typescript
// 开关控制
const handleToggleSceneMode = (checked: boolean) => {
  setForm((prev) => ({
    ...prev,
    功能模型占位: {
      ...prev.功能模型占位,
      场景生图启用: checked,
      // ...
    }
  }));
};
```

参考画师串预设的作用域控制（第1242-1265行）：
```typescript
const 画师串适用页签 = 'npc' | 'scene';
// ...
<InlineSelect value={artistPresetScope} options={[npc, scene]} />
```

## Goals / Non-Goals

**Goals:**
1. 在设置面板添加「主角」页签，配置独立后端/模型
2. 支持主角专属的词组转化器、画师串、PNG画风预设
3. 提供主角角色锚点管理入口

**Non-Goals:**
- 不修改游戏内触发生图的业务流程
- 不添加主角自动生图触发器（仅配置层面的修改）

## 技术方案

### 1. 数据结构扩展

参考场景生图字段，在 `models/system.ts` 的 `功能模型占位配置结构` 中添加：

```typescript
// 功能模型占位配置结构（现有）
场景生图启用: boolean;
场景生图独立接口启用: boolean;
场景生图后端类型: 文生图后端类型;
场景生图模型使用模型: string;

// 主角生图字段（新增）
主角生图启用: boolean;
主角生图独立接口启用: boolean;
主角生图后端类型: 文生图后端类型;
主角生图模型使用模型: string;
```

### 2. 设置面板扩展

**方案A**: 新增独立「主角」页签（推荐）
- 新增 `player` 页签类型
- 包含与 NPC/场景一致的配置项

**方案B**: 复用现有 automation 页签
- 在 automation 中添加主角开关
- 缺点：配置项过多，页面拥挤

**推荐方案A**，理由：
- 与 NPC/场景页签结构一致，用户学习成本低
- 扩展性强（未来可添加主角特定选项）

### 3. 角色锚点管理扩展

现有锚点管理（第381-396行）：
```typescript
const 角色锚点含有效内容 = (anchor?) => { ... };
const 保存角色锚点 = async (anchor) => { ... };
```

在预设页签中扩展适用范围：
```typescript
// 现有
const 画师串适用页签 = 'npc' | 'scene';

// 扩展后
const 画师串适用页签 = 'npc' | 'scene' | 'player';
```

### 4. 锚点UI入口

在设置面板添加主角锚点操作按钮：
- 「提取主角锚点」：调用 `extractPlayerCharacterAnchor()`
- 「查看当前锚点」：调用 `getPlayerCharacterAnchor()`

## 数据结构

### 需扩展的字段（models/system.ts）

```typescript
// 功能模型占位配置结构
interface 功能模型占位配置结构 {
  // 现有场景生图配置
  场景生图启用: boolean;
  场景生图独立接口启用: boolean;
  场景生图后端类型: 文生图后端类型;
  场景生图模型使用模型: string;
  
  // 新增主角生图配置
  主角生图启用: boolean;
  主角生图独立接口启用: boolean;
  主角生图后端类型: 文生图后端类型;
  主角生图模型使用模型: string;
  
  // 现有画师串预设字段
  当前NPC画师串预设ID: string;
  当前场景画师串预设ID: string;
  
  // 扩展后画师串预设字段（新增）
  当前主角画师串预设ID: string;
}
```

## 影响评估

### 功能影响
- 正向：新增加主角生图设置入口，丰富配置选项
- 用户需要理解新的主角独立配置概念

### 兼容性
- 使用 `||` 回退到 NPC 配置确保向后兼容
- 旧存档中主角生图使用 NPC 配置作为默认值

### 性能
- 新增字段不影响现有渲染性能
- 锚点提取是异步操作，与现有NPC锚点一致

### 工作量估算
- 数据结构修改：1小时
- UI页签开发：3-4小时
- 测试与调试：1-2小时
- **总计：约5-7小时**