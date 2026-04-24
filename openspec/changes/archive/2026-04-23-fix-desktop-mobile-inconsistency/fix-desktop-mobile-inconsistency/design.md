# 桌面端与移动端UI功能一致性修复 - 设计文档

## Context

### 当前状态

项目采用桌面端/移动端双组件架构：
- 设备检测基于CSS媒体查询 `max-width: 767px` 动态切换
- 桌面端组件：`XxxModal.tsx`（如 `SettingsModal.tsx`）
- 移动端组件：`MobileXxx.tsx` 或 `mobile/MobileXxxModal.tsx`

### 代码结构分析

通过代码审查和grep分析发现以下不一致：

**Settings 模块：**

| 功能 | 桌面端 | 移动端 | 状态 |
|------|-------|-------|-------|
| IntegratedModelSettings | ✅ | ❌ | 缺失 |
| NpcManager | ✅ | ❌ | 缺失 |
| ApiSettings | ✅ | ✅ | 完整 |
| ImageGenerationSettings | ✅ | ✅ | 完整 |
| NovelDecompositionSettings | ✅ | ✅ | 完整 |
| GameSettings | ✅ | ✅ | 完整 |
| VisualSettings | ✅ | ✅ | 完整 |
| PromptManager | ✅ | ✅ | 完整 |
| WorldSettings | ✅ | ✅ | 完整 |

**ImageManager 模块：**

| 功能 | 桌面端 | 移动端 | 状态 |
|------|-------|-------|-------|
| Artist Preset | ✅ | ✅ | 完整 |
| Model Converter Preset | ✅ | ✅ | 完整 |
| Prompt Converter Preset | ✅ | ✅ | 完整 |
| PNG Style Preset | ✅ | ✅ | 完整 |
| Character Anchor | ✅ | ✅ | 完整 |
| Scene Image | ✅ | ✅ | 完整 |

**其他模块：** 

- `SaveLoadModal.tsx` 和 `MobileSaveLoadModal.tsx` 代码重复
- 大部分功能模块（Social、Memory、World等）的桌面端和移动端功能基本一致

## Goals / Non-Goals

**Goals:**
- 补全移动端 Settings 缺失的 IntegratedModelSettings 和 NpcManager
- 统一桌面端/移动端 Settings 的 props API
- 消除重复的 SaveLoadModal 组件

**Non-Goals:**
- 不修改桌面端现有功能
- 不改变设备检测机制
- 不修改业务逻辑

## 技术方案

### 1. Settings 模块补全

在 `MobileSettingsModal.tsx` 中添加缺失的面板：

```typescript
// 当前 mobile/MobileSettingsModal.tsx 条件渲染
if (activeTab === 'integrated_models') return <IntegratedModelSettings settings={apiConfig} onSave={onSaveApi} />;
if (activeTab === 'npc') return <NpcManager ... />;
```

参考 `components/features/Settings/SettingsModal.tsx` 的实现：
- 第136-140行：IntegratedModelSettings 面板
- 第161-167行：NpcManager props 传递

### 2. 统一 Props API

桌面端 `SettingsModal.tsx` 接收的 props：
```typescript
onSaveApi, onSaveVisual, onSaveGame, onSaveMemory, 
onCreateNpc, onSaveNpc, onDeleteNpc, 
onStartNpcMemorySummary, onUploadNpcImage,
onReplaceVariableSection, onApplyVariableCommand,
onUpdatePrompts, onUpdateFestivals, onThemeChange
```

移动端 `MobileSettingsModal.tsx` 接收的 props 需要完全匹配。

### 3. 消除重复组件

`MobileSaveLoadModal.tsx` 直接复用 `SaveLoadModal.tsx`，通过CSS媒体查询控制布局差异，而非维护两份独立代码。

## 数据结构

参考现有类型定义：
- `接口设置结构` - `models/设置结构.ts`
- `游戏设置结构` - `models/设置结构.ts`
- `记忆配置结构` - `models/记忆结构.ts`

## 影响评估

- **功能影响**：补全后移动端功能与桌面端对齐
- **兼容性**：无破坏性变更
- **性能**：新增组件为懒加载，无额外性能负担

## Risks / Trade-offs

- [Risk] 移动端屏幕空间有限，部分复杂面板（如IntegratedModelSettings）可能需要简化布局 → **Mitigation**: 使用移动端优化的紧凑布局
- [Risk] 部分桌面端组件可能依赖仅桌面端可用的API → **Mitigation**: 检查props传递的完整性

## Open Questions

- IntegratedModelSettings 在移动端是否需要简化？
- NpcManager 在移动端是否使用相同的编辑体验？