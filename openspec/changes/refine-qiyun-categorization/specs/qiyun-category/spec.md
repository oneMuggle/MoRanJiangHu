## ADDED Requirements

### Requirement: 气运能力类型分类
所有气运 SHALL 标注其所属的能力类型。

#### Scenario: 查询战斗类气运
- **WHEN** 调用 `getQiyunByType('战斗')`
- **THEN** 返回所有能力类型为「战斗」的气运列表

#### Scenario: 分类完整性验证
- **WHEN** 统计所有气运
- **THEN** 每个气运有且仅有一个能力类型

### Requirement: 分类准确性
气运的能力类型 SHALL 根据其效果描述判定。

#### Scenario: 战斗类判定规则
- **WHEN** 气运直接提升战斗能力（攻击/防御/爆发）
- **THEN** 分类为「战斗」

#### Scenario: 生存类判定规则
- **WHEN** 气运效果为保命/恢复/防御/复活
- **THEN** 分类为「生存」

#### Scenario: 社交类判定规则
- **WHEN** 气运效果为人脉/声望/威吓/谈判
- **THEN** 分类为「社交」

#### Scenario: 谋略类判定规则
- **WHEN** 气运效果为情报/判断/预知/布局
- **THEN** 分类为「谋略」

#### Scenario: 特殊类判定规则
- **WHEN** 气运效果为奇遇/运气/随机/特殊机制
- **THEN** 分类为「特殊」

#### Scenario: 辅助类判定规则
- **WHEN** 气运效果为修炼/效率/资源/成长
- **THEN** 分类为「辅助」