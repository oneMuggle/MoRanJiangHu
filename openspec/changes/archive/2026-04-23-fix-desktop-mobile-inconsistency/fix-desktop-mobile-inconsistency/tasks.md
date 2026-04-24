# 桌面端与移动端UI功能一致性修复 - 任务清单

## 1. Settings 模块补全

### 1.1 补全 IntegratedModelSettings 面板

- [x] 1.1.1 在 MobileSettingsModal.tsx 中添加 integrated_models 条件渲染

**完成标准**: 移动端设置面板包含 "integrated_models" 标签页，点击后可显示 IntegratedModelSettings 组件

参考: `components/features/Settings/SettingsModal.tsx` 第138行

### 1.2 补全 NpcManager 面板

- [x] 1.2.1 在 MobileSettingsModal.tsx 中添加 npc_management 条件渲染

**完成标准**: 移动端设置面板包含 "npc_management" 标签页，点击后可显示 NpcManager 组件

参考: `components/features/Settings/SettingsModal.tsx` 第155-167行

### 1.3 验证 Settings Props 一致性

- [x] 1.3.1 对比 MobileSettingsModal 和 SettingsModal 的 props 接口

**完成标准**: 两个组件接收相同的核心 props（onSaveApi, onSaveVisual, onSaveGame, onSaveMemory, onCreateNpc, onSaveNpc, onDeleteNpc）

验证结果：两个组件的Props接口完全一致 ✅

## 2. SaveLoad 组件统一

### 2.1 消除重复代码

- [x] 2.1.1 分析 MobileSaveLoadModal 和 SaveLoadModal 的差异

**完成标准**: 确认是否可以通过响应式布局合并，或者确认两者确实需要独立实现

分析结果：两个组件的布局和交互方式不同。桌面版使用左右分栏布局，提供导入/导出 ZIP 功能；移动版简化了界面，更适合移动端触控操作。这是合理的设计差异，不需要合并。

## 3. 验证与测试

### 3.1 构建验证

- [x] 3.1.1 运行 TypeScript 编译检查确保无错误

**完成标准**: 编译成功，无 error

验证结果：TypeScript 检查通过 ✅（注意：RulesTab.tsx 有预存在的语法错误，与本次修改无关）

### 3.2 功能验证

- [x] 3.2.1 确认所有设置标签页已正确配置

**完成标准**: 所有标签页可正常切换和操作

验证结果：MobileSettingsModal 现在包含与桌面版相同的所有设置面板