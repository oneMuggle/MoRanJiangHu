## ADDED Requirements

### Requirement: 气运境界适配
每个气运 SHALL 标注其适用的境界层级范围。

#### Scenario: 查询适合筑基的气运
- **WHEN** 调用 `getQiyunByRealm(10, 19)` 查询筑基期气运
- **THEN** 返回适用境界包含筑基期的气运列表

#### Scenario: 凡人适配
- **WHEN** 气运适用于凡人（境界层级0）
- **THEN** 适用境界表示为 [0, 0] 或 [0, 任意]

#### Scenario: 全境界适配
- **WHEN** 气运适用于所有境界
- **THEN** 适用境界表示为 [0, 99]

### Requirement: 境界层级正确性
气运的适用境界 SHALL 与其效果描述匹配。

#### Scenario: 低境界强力气运
- **WHEN** 气运效果为「新手起步优势」
- **THEN** 适用境界包含凡人~炼气

#### Scenario: 高境界限定气运
- **WHEN** 气运需高修为才能发挥作用
- **THEN** 适用境界起始值 ≥ 10

### Requirement: 境界计算正确性
气运属性修正 SHALL 与境界层级计算正确。

#### Scenario: 境界层级边界
- **WHEN** 角色境界为10（筑基初期）
- **THEN** 适用境界包含10的气运对该角色生效