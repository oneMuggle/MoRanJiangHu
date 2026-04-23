## ADDED Requirements

### Requirement: 气运数据结构
系统 SHALL 提供结构化的气运数据存储，按类别和稀有度可检索。

#### Scenario: 按类别查询气运
- **WHEN** 调用 `getQiyunByCategory('真·气运')`
- **THEN** 返回所有类别为「真·气运」的气运列表

#### Scenario: 按稀有度筛选气运
- **WHEN** 调用 `getQiyunByRarity('传说')`
- **THEN** 返回稀有度为「传说」的气运列表

#### Scenario: 获取气运详情
- **WHEN** 调用 `getQiyunDetail('真·天命反派')`
- **THEN** 返回该气运的完整信息（名称、类别、描述、效果）

### Requirement: 气运数据过滤
系统 SHALL 过滤不适配内容，确保数据安全。

#### Scenario: 排除女性向内容
- **WHEN** 查询气运列表时
- **THEN** 不返回任何「女性向」类别的气运

#### Scenario: NSFW标识过滤
- **WHEN** 调用时传入 `excludeNsfw: true`
- **THEN** 不返回 nsfw 标记为 true 的气运

### Requirement: 随机气运抽取
系统 SHALL 支持按条件随机抽取气运。

#### Scenario: 随机抽取N个气运
- **WHEN** 调用 `randomQiyun(3)` 抽取3个气运
- **THEN** 返回3个不重复的随机气运，可指定稀有度权重