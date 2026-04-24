## ADDED Requirements

### Requirement: 成人内容设置
系统 SHALL 提供「成人内容」开关设置。

#### Scenario: 设置开关
- **WHEN** 玩家进入设置页面
- **THEN** 显示「成人内容」开关（默认关闭）

#### Scenario: 开启成人内容
- **WHEN** 玩家开启「成人内容」开关并保存
- **THEN** 设置保存到 IndexedDB，重口味气运可显示

#### Scenario: 关闭成人内容
- **WHEN** 玩家关闭「成人内容」开关
- **THEN** 重口味气运不再显示

### Requirement: 重口内容解锁
系统 SHALL 在成人内容开启后显示重口向气运。

#### Scenario: 解锁后显示
- **WHEN** 设置.成人内容 = true
- **AND** 查询气运列表
- **THEN** 包含等级2的气运

#### Scenario: 锁定时隐藏
- **WHEN** 设置.成人内容 = false
- **AND** 查询气运列表
- **THEN** 不包含等级2的气运

### Requirement: 默认过滤行为
系统 SHALL 默认隐藏重口向内容。

#### Scenario: 新玩家默认
- **WHEN** 玩家首次使用（无设置记录）
- **THEN** 成人内容默认为 false，不显示重口向