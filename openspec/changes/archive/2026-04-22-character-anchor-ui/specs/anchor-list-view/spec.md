# 锚点列表视图

## ADDED Requirements

### Requirement: 显示角色锚点列表
系统 SHALL 以卡片列表形式展示所有已保存的角色锚点，每个卡片 SHALL 显示以下信息：
- 锚点名称
- 关联 NPC 名称（如果有）
- 启用状态（启用/停用）
- 场景自动注入标签（如果有）
- 正面提示词预览（前 50-100 字符）

#### Scenario: 锚点列表为空时
- **WHEN** 用户打开锚点管理界面且无任何锚点时
- **THEN** 系统 SHALL 显示「暂无角色锚点」的提示文案

#### Scenario: 锚点列表有数据时
- **WHEN** 用户打开锚点管理界面且有 1+ 个锚点时
- **THEN** 系统 SHALL 显示所有锚点的卡片列表
- **AND** 每张卡片 SHALL 高亮当前选中的锚点

### Requirement: 锚点卡片交互
系统 SHALL 支持点击锚点卡片进行选中操作，选中后 SHALL 显示该锚点的详细信息编辑区。

#### Scenario: 点击选中锚点卡片
- **WHEN** 用户点击任意锚点卡片
- **THEN** 系统 SHALL 将该卡片标记为选中状态（视觉高亮）
- **AND** SHALL 在下方展开该锚点的详情编辑区

### Requirement: 筛选关联 NPC
系统 SHALL 支持通过 NPC 下拉选择器筛选锚点列表，仅显示指定 NPC 的锚点。

#### Scenario: 选择 NPC 筛选
- **WHEN** 用户从 NPC 下拉列表中选择某个 NPC
- **THEN** 系统 SHALL 仅显示该 NPC 关联的锚点
- **AND** 如该 NPC 无锚点，显示「该角色暂无锚点」

### Requirement: 桌面端与移动端适配
系统 SHALL 在桌面端和移动端均提供可用的锚点列表视图，但布局可以不同。

#### Scenario: 桌面端布局
- **WHEN** 用户在桌面端访问锚点管理界面
- **THEN** 系统 SHALL 使用卡片网格或列表布局，宽度适应窗口

#### Scenario: 移动端布局
- **WHEN** 用户在移动端访问锚点管理界面
- **THEN** 系统 SHALL 使用单列卡片布局，点击展开详情