## ADDED Requirements

### Requirement: NSFW 三级划分
所有气运 SHALL 标注其 NSFW 等级。

#### Scenario: 安全内容（等级0）
- **WHEN** 内容无任何敏感内容
- **THEN** nsfw等级为 0 或 undefined

#### Scenario: 一般向（等级1）
- **WHEN** 内容为轻微暧昧、性暗示
- **THEN** nsfw等级为 1

#### Scenario: 重口向（等级2）
- **WHEN** 内容包含明显性描写、轮奸、调教等
- **THEN** nsfw等级为 2

### Requirement: 等级准确性
气运的 NSFW 等级 SHALL 与其内容程度匹配。

#### Scenario: 一般向判定
- **WHEN** 气运涉及风月场合但不露骨
- **THEN** 判定为等级1

#### Scenario: 重口向判定
- **WHEN** 气运涉及轮奸、调教、明显性行为
- **AND** 包含失去人格的描写
- **THEN** 判定为等级2

### Requirement: 兼容性
系统 SHALL 兼容旧的 nsfw 布尔标记。

#### Scenario: 旧标记兼容
- **WHEN** 气运有 nsfw: true 但无 nsfw等级
- **THEN** 自动映射为等级1（一般向）