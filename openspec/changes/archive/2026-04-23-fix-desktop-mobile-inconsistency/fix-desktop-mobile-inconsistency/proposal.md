# 桌面端与移动端UI功能一致性修复

## Why

本项目的功能模块同时提供桌面端和移动端两套组件，但经过代码审查发现两者存在多处功能差异：
- 移动端组件缺少部分桌面端已有的功能
- 部分功能仅在桌面端实现，移动端未提供对应的交互入口
- 设备检测基于CSS媒体查询(`max-width: 767px`)动态切换，但两套组件的API不统一

这导致用户在不同设备上的体验不一致，影响使用满意度。

## What Changes

1. **补全移动端 Settings 缺失的功能**
   - `IntegratedModelSettings` 面板：桌面端有，移动端缺失
   - NpcManager 组件：桌面端可管理NPC，移动端缺失
   - 需要同步桌面端的设置面板到移动端

2. **补全移动端 ImageManager 缺失的功能**
   - 桌面端完整实现：Artist/Model Converter/Prompt Converter 预设管理
   - 移动端需要补充完整预设管理能力

3. **移除重复组件**
   - `MobileSaveLoadModal` 与 `SaveLoadModal` 代码重复，应复用同一组件

4. **统一设置面板 Props API**
   - 确保桌面端和移动端 Settings Modal 接收相同的 props
   - 保持功能一致性

## Capabilities

### New Capabilities

- `desktop-mobile-settings-unification`: 统一桌面端和移动端设置面板的功能和API
- `desktop-mobile-imagemanager-unification`: 统一图片管理组件的功能

### Modified Capabilities

- `settings-panel`: 补全移动端缺失的设置标签页
- `imagemanager`: 补全移动端缺失的预设管理功能

## Impact

- 修改 `components/features/Settings/mobile/MobileSettingsModal.tsx`
- 修改 `components/features/Social/mobile/MobileImageManagerModal.tsx`
- 可能需要重构部分组件以复用桌面端逻辑

## 非目标

- 不修改桌面端组件（仅补全移动端）
- 不改变现有业务逻辑
- 不修改设备检测机制

## 验收标准

- [ ] 移动端 Settings 包含与桌面端相同的所有设置标签页
- [ ] 移动端 ImageManager 包含完整的预设管理功能
- [ ] 两端组件接收相同的核心 props
- [ ] 代码编译无错误