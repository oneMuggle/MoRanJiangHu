## ADDED Requirements

### Requirement: 气运按能力类型检索
系统 SHALL 提供按能力类型检索气运的功能。

#### Scenario: 按战斗类型检索
- **WHEN** 调用 `getQiyunByType('战斗')`
- **THEN** 返回所有 `能力类型` 为「战斗」的气运列表

#### Scenario: 按生存类型检索
- **WHEN** 调用 `getQiyunByType('生存')`
- **THEN** 返回所有 `能力类型` 为「生存」的气运列表

#### Scenario: 按特殊类型检索
- **WHEN** 调用 `getQiyunByType('特殊')`
- **THEN** 返回所有 `能力类型` 为「特殊」的气运列表

#### Scenario: 按辅助类型检索
- **WHEN** 调用 `getQiyunByType('辅助')`
- **THEN** 返回所有 `能力类型` 为「辅助」的气运列表

### Requirement: 能力类型分类准确性
气运的能力类型 SHALL 根据其效果描述判定。

#### Scenario: 战斗类判定规则
- **WHEN** 气运直接提升战斗能力（攻击/防御/爆发）
- **THEN** `能力类型` 为「战斗」

#### Scenario: 生存类判定规则
- **WHEN** 气运效果为保命/恢复/防御/复活
- **THEN** `能力类型` 为「生存」

#### Scenario: 辅助类判定规则
- **WHEN** 气运效果为修炼/效率/资源/成长
- **THEN** `能力类型` 为「辅助」

#### Scenario: 特殊类判定规则
- **WHEN** 气运效果为奇遇/运气/随机/特殊机制
- **THEN** `能力类型` 为「特殊」

#### Scenario: 谋略类判定规则
- **WHEN** 气运效果为情报/判断/预知/布局
- **THEN** `能力类型` 为「谋略」

#### Scenario: 社交类判定规则
- **WHEN** 气运效果为人脉/声望/威吓/谈判
- **THEN** `能力类型` 为「社交」

### Requirement: 分类完整性
系统 SHALL 确保所有气运都有且仅有一个能力类型。

#### Scenario: 分类完整性验证
- **WHEN** 遍历所有气运
- **THEN** 每个气运有且仅有一个 `能力类型`（6 类选一）

#### Scenario: 能力类型枚举验证
- **WHEN** `能力类型` 字段存在
- **THEN** 值为「战斗」或「生存」或「社交」或「谋略」或「特殊」或「辅助」之一