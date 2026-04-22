# 锚点提取操作

## ADDED Requirements

### Requirement: 从 NPC 资料提取锚点
系统 SHALL 支持从已有关联 NPC 的文本资料中提取角色锚点，调用 AI 服务生成稳定外观提示词。

#### Scenario: 提取前选择 NPC
- **WHEN** 用户在锚点管理界面点击「AI 提取锚点」按钮
- **THEN** 系统 SHALL 显示 NPC 选择器（如未选择）
- **OR** SHALL 使用当前已选中的 NPC

#### Scenario: 提取进行中
- **WHEN** 用户触发锚点提取且 AI 服务处理中
- **THEN** 系统 SHALL 显示「正在提取角色锚点...」的加载状态
- **AND** SHALL 禁用提取按钮防止重复提交

#### Scenario: 提取成功
- **WHEN** AI 服务成功返回锚点内容
- **THEN** 系统 SHALL 自动填充提取结果到编辑区
- **AND** SHALL 显示「角色锚点已更新」的提示
- **AND** 正面提示词 SHALL 包含 AI 提取的稳定外观描述

#### Scenario: 提取失败
- **WHEN** AI 服务返回错误或超时
- **THEN** 系统 SHALL 显示「角色锚点提取失败」的提示
- **AND** SHALL 保留用户的操作状态供重试

### Requirement: 重新提取已有锚点
系统 SHALL 支持对已有锚点重新调用 AI 提取，更新锚点内容。

#### Scenario: 重新提取
- **WHEN** 用户在编辑已有锚点时点击「AI 重新提取」
- **THEN** 系统 SHALL 调用 AI 服务基于原始 NPC 资料重新生成锚点
- **AND** 提取结果 SHALL 覆盖当前的正面/负面提示词

### Requirement: 提取时附加额外要求
系统 SHALL 支持在提取时用户可选择输入额外要求，影响 AI 生成结果。

#### Scenario: 带额外要求提取
- **WHEN** 用户在触发提取时提供了额外要求文本
- **THEN** 系统 SHALL 将额外要求作为补充上下文发送给 AI
- **AND** AI SHALL 考虑额外要求生成更符合用户期望的锚点