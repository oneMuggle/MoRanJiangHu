## Why

当前项目桌面端与移动端 UI 存在功能不一致：部分功能模块仅在桌面端或移动端可用，另一端缺失。这导致用户在移动设备上无法使用完整功能，影响跨设备体验一致性。

## What Changes

为缺失桌面端/移动端组件的功能模块添加对应的另一端实现：

1. **SaveLoad 桌面端组件**：添加 `MobileSaveLoadModal` 移动端组件
2. **NovelDecomposition 组件**：添加 `MobileNovelDecompositionWorkbenchModal` 移动端组件
3. **Equipment 组件**：添加 `MobileEquipmentModal` 移动端组件
4. **NewGame 气运卷宗**：移动端开局生成缺少「气运卷宗」功能，需添加
5. **NewGame 01世界观**：移动端缺少 NSFW 场景类型、的能力类型/武力等级、超能力分类/觉醒程度 等世界法则设定
6. **Worldbook 组件**：检查并补充必要的移动端适配（如需要）

## Capabilities

### New Capabilities

- `mobile-save-load`: 移动端存档管理弹窗组件
- `mobile-novel-decomposition`: 移动端小说分解工作台组件  
- `mobile-equipment`: 移动端装备面板组件
- `mobile-new-game-qiyun`: 移动端开局生成气运卷宗功能
- `mobile-new-game-world-config`: 移动端 01世界观缺少的 NSFW 场景、的能力类型/武力等级、超能力分类/觉醒程度
- `check-worldbook-mobile`: 评估世界书管理器是否需要移动端适配

### Modified Capabilities

- 无（纯功能补充，非需求变更）

## Impact

### 变更范围

- `components/features/SaveLoad/` - 添加移动端组件
- `components/features/NovelDecomposition/` - 添加移动端组件
- `components/features/Equipment/` - 添加移动端组件
- `components/features/NewGame/mobile/MobileNewGameWizard.tsx` - 添加气运卷宗 + 世界法则设定 (NSFW/能力类型/武力等级/超能力/觉醒程度)
- `App.tsx` - 注册新组件的懒加载

### 非目标

- 不修改现有桌面端/移动端组件的 UI 样式
- 不添加新功能，仅补齐缺失的组件
- 不重构现有组件的内部逻辑

## 验收标准

1. 移动端可正常打开存档/保存界面
2. 移动端可正常使用小说分解工作台
3. 移动端可正常查看装备面板
4. 移动端开局生成可选择气运卷宗
5. 移动端 01世界观可设置 NSFW 场景类型、的能力类型/武力等级、超能力分类/觉醒程度
6. 新组件遵循项目现有的 Mobile 组件代码风格
7. 构建无错误，Diagnostics 无新增警告