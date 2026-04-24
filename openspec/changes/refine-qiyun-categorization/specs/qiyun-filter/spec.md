## ADDED Requirements

### Requirement: NSFW 内容标记
气运 SHALL 明确标记是否为 NSFW 内容。

#### Scenario: 性相关气运标记
- **WHEN** 气运涉及性行为、性暗示内容
- **THEN** nsfw 标记为 true

#### Scenario: 极端暴力标记
- **WHEN** 气运描述包含极度血腥、酷刑内容
- **THEN** nsfw 标记为 true

#### Scenario: 伦理禁忌标记
- **WHEN** 气运涉及亲属乱伦等伦理禁忌
- **THEN** nsfw 标记为 true

### Requirement: NSFW 过滤功能
系统 SHALL 支持按 NSFW 标记过滤气运。

#### Scenario: 排除 NSFW
- **WHEN** 调用 `getQiyunList({ excludeNsfw: true })`
- **THEN** 不返回任何 nsfw 标记为 true 的气运

#### Scenario: 仅 NSFW
- **WHEN** 调用 `getQiyunList({ nsfwOnly: true })`
- **THEN** 只返回 nsfw 标记为 true 的气运

### Requirement: 默认过滤
系统 SHALL 在常规模式下默认排除 NSFW 内容。

#### Scenario: 常规模式过滤
- **WHEN** 玩家在非成人模式选择气运
- **THEN** 不显示 NSFW 气运

#### Scenario: 成人模式显示
- **WHEN** 玩家开启成人模式设置
- **THEN** 可选择显示 NSFW 气运