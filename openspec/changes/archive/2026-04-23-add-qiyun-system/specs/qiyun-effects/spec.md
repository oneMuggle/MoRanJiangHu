## ADDED Requirements

### Requirement: 气运属性修正
系统 SHALL 根据气运效果对角色属性进行修正。

#### Scenario: 气运属性加成
- **WHEN** 角色拥有「真·天命反派」(+50%福源)
- **THEN** 角色福源属性 = 基础福源 × 1.5

#### Scenario: 多个气运叠加
- **WHEN** 角色拥有多个同属性修正的气运
- **THEN** 修正值累乘或累加（按设计文档规则）

#### Scenario: 气运效果展示
- **WHEN** 查看角色详情
- **THEN** 显示所有气运及其效果描述

### Requirement: 属性计算时机
系统 SHALL 在特定时机计算气运属性修正。

#### Scenario: 创建角色时计算
- **WHEN** 角色创建完成
- **THEN** 气运属性修正已应用到六维属性

#### Scenario: 加载存档时计算
- **WHEN** 加载包含气运的存档
- **THEN** 气运属性修正重新应用到当前属性

### Requirement: 限制版气运代价
系统 SHALL 对限制版气运实现负面效果。

#### Scenario: 限制版气运负面效果
- **WHEN** 角色拥有「非酋附体」(气运-50%)
- **THEN** 角色气运相关掉落率额外降低