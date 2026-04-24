# ImageManagerModal.tsx 重构提案

## Why

`components/features/Social/ImageManagerModal.tsx` 当前约 4916 行，超出单个文件合理维护范围。该文件混合了 7 个页面标签视图、40+ 个回调 props、状态管理、样式常量、数据转换等多个关注点，导致：
- 维护困难：任何修改都需要理解整个文件
- 难以测试：无法对单个功能进行单元测试
- 协作冲突：团队成员容易冲突
- 代码复用：helper 函数难以在 Tab 间共享

项目已在 `ImageManager/tabs/` 目录下拆分了部分 Tab 组件，但主文件仍是 monolithic，需要彻底重构为模块化架构。

## What Changes

1. **拆分主组件**：将 ImageManagerModal.tsx 拆分为入口 + 子模块
2. **提取状态管理**：创建自定义 hook `useImageManagerState` 集中管理状态
3. **提取常量**：将样式常量移至独立文件
4. **提取 helper**：将工具函数移至 utils 子目录
5. **重构 Tab 结构**：统一各 Tab 的数据获取模式
6. **创建类型定义**：提取共享类型到 ImageManager/types.ts

## Capabilities

### New Capabilities

- `image-manager-modal-refactor`: ImageManagerModal 模块化重构
  - 拆分主文件为入口 + 子模块
  - 状态管理集中到 hook
  - 常量与样式独立文件
  - 统一 Tab 间数据流

### Modified Capabilities

- 无（现有功能需求不变，仅实施重构）

## Scope

### In Scope

- 主组件拆分与重构
- 状态 hook 提取
- 样式常量独立
- Helper 函数整理
- Tab 组件结构统一

### Out of Scope

- 移动端 MobileImageManagerModal 重构
- 功能逻辑变更
- API 变更
- 样式主题调整

## Impact

- 涉及文件：
  - `components/features/Social/ImageManagerModal.tsx` (主文件)
  - `components/features/Social/ImageManager/tabs/*.tsx` (6 个 Tab)
  - 新增 `ImageManager/` 子目录结构

## 验收标准

- [ ] ImageManagerModal.tsx 行数 < 800 行
- [ ] 状态管理提取至 useImageManagerState hook
- [ ] 样式常量提取至独立文件
- [ ] Helper 函数提取至 utils
- [ ] 功能行为保持不变
- [ ] 无 TypeScript 错误