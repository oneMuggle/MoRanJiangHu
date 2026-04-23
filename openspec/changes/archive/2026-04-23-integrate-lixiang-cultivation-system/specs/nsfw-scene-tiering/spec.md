# nsfw-scene-tiering

NSFW 场景档位分层——将「点到为止/适度展开/完全展开」三个档位与写作约束、元数据注入、动作解锁联动，同时修复现有 `启用NSFW模式` × `nsfw场景类型` 断链问题。

## ADDED Requirements

### Requirement: 启用NSFW模式 × nsfw场景类型联动

`启用NSFW模式` 布尔值与 `nsfw场景类型` 档位 SHALL 联动生效，而非独立运作。

#### Scenario: NSFW 关闭时
- **WHEN** 启用NSFW模式 为 false
- **THEN** nsfw场景类型 强制为 '无'，无任何 NSFW 提示词注入

#### Scenario: NSFW 开启时按档位生效
- **WHEN** 启用NSFW模式 为 true 且 nsfw场景类型 为 '适度展开'
- **THEN** 仅注入适度展开档位的叙事约束，不注入完全展开档位的敏感词权限

### Requirement: 委婉词汇映射表

系统 SHALL 提供委婉词汇映射表，供 Body Polish 和叙事生成使用。

#### Scenario: 适度展开档位词汇替换
- **WHEN** nsfw场景类型 为 '适度展开' 且需要描写双修
- **THEN** 使用委婉词汇：肉棒→玉茎/阳物，小穴→花径/幽谷，精液→精华/阳精

#### Scenario: 点到为止档位成语替代
- **WHEN** nsfw场景类型 为 '点到为止' 且需要描写双修
- **THEN** 使用成语：春宵一度、巫山云雨、鱼水之欢、阴阳交泰

### Requirement: 动态亲密度动作约束注入

系统 SHALL 根据当前 NPC 的亲密度等级动态注入对应的动作约束。

#### Scenario: 亲密度 Lv1 约束
- **WHEN** NPC 亲密度等级为 1
- **THEN** 仅允许言语调情、轻微身体接触、眼神交流

#### Scenario: 亲密度 Lv2 约束
- **WHEN** NPC 亲密度等级为 2
- **THEN** 允许调情和拥抱亲吻

#### Scenario: 亲密度 Lv5 约束
- **WHEN** NPC 亲密度等级为 5
- **THEN** 允许调情、拥抱亲吻、抚摸、深度亲密、双修，并注入对应档位的描写约束

### Requirement: Body Polish 按档位词汇规则

cotPolish.ts Step7 的 NSFW 词汇整理 SHALL 按 nsfw场景类型 档位差异化执行。

#### Scenario: 完全展开档位保留明确词汇
- **WHEN** 原文已进入 NSFW 场景且 nsfw场景类型 为 '完全展开'
- **THEN** 保留肉棒、小穴、阴蒂、乳头、蜜液、精液等明确词汇，不做委婉化替换

#### Scenario: 适度展开档位委婉化
- **WHEN** 原文已进入 NSFW 场景且 nsfw场景类型 为 '适度展开'
- **THEN** 将明确词汇替换为委婉词汇映射表中的替代表达

#### Scenario: 点到为止档位仅保留氛围
- **WHEN** 原文已进入 NSFW 场景且 nsfw场景类型 为 '点到为止'
- **THEN** 将所有性描写替换为情感氛围描写，使用"春宵一度"等成语收束

### Requirement: 世界生成锚点包含场景档位描述

世界生成时，系统 SHALL 在锚点提示词中注入 nsfw场景类型 对应的档位描述。

#### Scenario: 锚点包含档位描述
- **WHEN** 生成世界时 nsfw场景类型 为 '完全展开'
- **THEN** 锚点提示词包含：NSFW场景: 完全展开 - 可进行完全展开的性描写，使用敏感词：肉棒、龟头、阴茎、小穴、阴蒂、乳头、蜜液、精液等