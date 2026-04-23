## ADDED Requirements

### Requirement: NPC气运分配
系统 SHALL 在NPC生成时随机分配气运。

#### Scenario: 生成NPC时分配气运
- **WHEN** 调用 NPC 生成接口
- **THEN** NPC 自动获得1-2个随机气运

#### Scenario: 指定气运生成
- **WHEN** 调用 NPC 生成接口并指定气运
- **THEN** NPC 使用指定气运，不随机分配

### Requirement: 气运稀有度分布
系统 SHALL 控制气运稀有度的分布比例。

#### Scenario: 普通NPC稀有度分布
- **WHEN** 普通NPC随机分配气运
- **THEN** 稀有度分布：普通80%、稀有15%、传说5%

#### Scenario: 重要NPC稀有度分布
- **WHEN** 精英/首领NPC随机分配气运
- **THEN** 稀有度分布：普通50%、稀有35%、传说15%

### Requirement: 世界生成时气运分布
系统 SHALL 在世界生成时考虑气运分布。

#### Scenario: 世界气运池
- **WHEN** 世界生成完成
- **THEN** 记录世界中各类气运的分布统计