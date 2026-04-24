# ImageManagerModal 重构规范

## ADDED Requirements

### Requirement: ImageManagerModal 采用模块化架构

ImageManagerModal.tsx  SHALL be拆分为主入口、状态 hook、工具模块和 Tab 组件。主入口应只负责组装和回调，不包含业务状态逻辑。

#### Scenario: 模块正确拆分

- **WHEN** 开发者打开 ImageManagerModal.tsx 源文件
- **THEN** 主文件行数 < 800 行
- **AND THEN** 状态管理在 useImageManagerState hook 中
- **AND THEN** 样式常量在独立文件中
- **AND THEN** 工具函数在 utils 目录中

#### Scenario: Tab 正确使用状态

- **WHEN** 任何 Tab 组件需要访问状态
- **THEN** 通过 useImageManagerState hook 获取
- **AND THEN** 不需要手动传递 40+ props

### Requirement: useImageManagerState 提供状态管理

useImageManagerState hook SHALL provide所有 ImageManager 相关的状态管理和 Actions，包括筛选条件、表单状态、统计数据等。

#### Scenario: 创建状态 hook

- **WHEN** 组件调用 useImageManagerState()
- **THEN** 返回 state 对象包含：filters、activeTab、queue、sceneQueue、records 等
- **AND THEN** 返回 actions 对象包含：setFilters、setActiveTab、submitGenerate 等

#### Scenario: 过滤条件在 hook 中

- **WHEN** 用户更改筛选条件
- **THEN** useImageManagerState 内部 useMemo 计算 filteredRecords
- **AND THEN** 返回已过滤的记录列表

### Requirement: ImageManager Context 提供 Provider

ImageManager SHALL provide a Context for components that need access to state without hook.

#### Scenario: Context 可用

- **WHEN** Tab 组件需要多个状态值
- **THEN** 可以使用 ImageManagerContext
- **AND THEN** 不需要逐个接受 props

### Requirement: 样式常量独立存储

ImageManagerModal.tsx 中的样式常量 SHALL be extracted to dedicated constants file.

#### Scenario: 样式常量已迁移

- **WHEN** 开发者需要修改按钮样式
- **THEN** 在 imageManagerConstants.ts 中找到 次级按钮样式、主按钮样式
- **AND THEN** 不需要在主文件中搜索

### Requirement: 功能行为保持不变

Refactoring SHALL NOT change any functional behavior.

#### Scenario: 生成图片功能相同

- **WHEN** 用户提交生成图片请求
- **THEN** 行为与重构前完全一致
- **AND THEN** 回调 same props 被调用

#### Scenario: 查看图库功能相同

- **WHEN** 用户切换到 library Tab 并选择 NPC
- **THEN** 显示该 NPC 的图片记录
- **AND THEN** 与重构前行为一致