# 锚点管理入口

## ADDED Requirements

### Requirement: 图片管理中的锚点入口
系统 SHALL 在图片管理界面提供明确的角色锚点管理入口。

#### Scenario: 桌面端入口位置
- **WHEN** 用户打开图片管理界面
- **THEN** 系统 SHALL 在 Tab 导航中提供「角色锚点」标签页
- **OR** SHALL 在预设管理区域提供锚点管理链接

#### Scenario: 移动端入口位置
- **WHEN** 用户打开移动端图片管理界面
- **THEN** 系统 SHALL 在导航中提供「锚点」入口
- **AND** 入口 SHALL 使用清晰的图标和文字标识

### Requirement: 社交界面中的锚点入口
系统 SHALL 在社交界面的 NPC 详情中提供提取/管理锚点的快捷入口。

#### Scenario: NPC 详情页锚点入口
- **WHEN** 用户在社交界面查看某个 NPC 的详情
- **THEN** 系统 SHALL 显示该 NPC 当前的角色锚点状态
- **AND** SHALL 提供「提取锚点」或「管理锚点」按钮

### Requirement: 入口可用性状态
系统 SHALL 根据当前状态（是否有 NPC 选择、是否已有锚点等）正确控制入口的可用性。

#### Scenario: 未选择 NPC
- **WHEN** 用户未选择任何 NPC 时
- **THEN** 「提取锚点」按钮 SHALL 显示为禁用状态

#### Scenario: 已有锚点
- **WHEN** 当前 NPC 已有锚点时
- **THEN** 「管理锚点」按钮 SHALL 显示为可用
- **AND** 可以点击进入锚点管理界面查看/编辑