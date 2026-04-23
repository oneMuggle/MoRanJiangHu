## ADDED Requirements

### Requirement: NSFW 内容标记
系统 SHALL 为气运标记 NSFW 等级。

#### Scenario: 无 NSFW 标记
- **WHEN** 气运不涉及敏感内容
- **THEN** `nsfw等级` 为 `0` 或 `undefined`

#### Scenario: 轻度 NSFW 标记
- **WHEN** 气运涉及性暗示、软暴力等轻度内容
- **THEN** `nsfw等级` 为 `1`

#### Scenario: 重度 NSFW 标记
- **WHEN** 气运涉及明确性描写、极端暴力、伦理禁忌
- **THEN** `nsfw等级` 为 `2`

### Requirement: NSFW 过滤功能
系统 SHALL 支持按 NSFW 标记过滤气运。

#### Scenario: 排除 NSFW 气运
- **WHEN** 调用 `filterQiyun({ excludeNsfw: true })`
- **THEN** 不返回 `nsfw等级 > 0` 的气运

#### Scenario: 仅返回 NSFW 气运
- **WHEN** 调用 `filterQiyun({ nsfwOnly: true })`
- **THEN** 只返回 `nsfw等级 > 0` 的气运

#### Scenario: NSFW 等级过滤
- **WHEN** 调用 `filterQiyun({ excludeNsfw: true })`
- **THEN** 排除 `nsfw等级` 为 `1` 或 `2` 的气运

### Requirement: 默认过滤行为
系统 SHALL 在常规模式下默认排除 NSFW 内容。

#### Scenario: 常规模式排除
- **WHEN** 玩家在非成人模式选择气运
- **THEN** 使用 `excludeNsfw: true` 过滤

#### Scenario: 成人模式显示
- **WHEN** 玩家开启成人模式设置
- **THEN** 可选择显示 `nsfw等级` 为 `1` 或 `2` 的气运