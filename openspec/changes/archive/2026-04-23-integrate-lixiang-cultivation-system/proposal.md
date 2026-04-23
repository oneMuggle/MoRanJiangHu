## Why

当前项目的 NSFW 内容仅有简单的「启用/禁用」开关，缺少与武侠内功体系的深度整合。参考「里象修行」模式，将双修内容包装成武侠修炼体系的有机组成部分——既能提升叙事沉浸感，又能为玩家提供不同于传统打坐的**情缘修炼路径**。

## What Changes

### 新增功能

- **里象功法数据层**：定义双修类内功（ID/名称/门派/品级/收益/风险）
- **双修门派世界注入**：根据 NSFW 场景类型在世界生成时注入合欢宗/血河宗等门派
- **场景类型分层叙事**：按「点到为止/适度展开/完全展开」三个档位注入差异化描写约束
- **亲密度 × 里象联动**：亲密度等级 5 解锁双修，同时传入当前档位约束给 AI
- **双修数值奖励**：双修成功后触发属性增益（根骨/体质等），与既有成长体系联动

### 修改功能

- **prompts/runtime/nsfw.ts**：新增 `构建里象修行叙事约束()` 函数
- **prompts/runtime/worldSetup.ts**：新增双修门派世界书注入逻辑
- **prompts/intimacy/index.ts**：动态注入当前 NPC 亲密度对应的动作约束
- **prompts/core/cotPolish.ts**：按档位提供委婉词汇替换表
- **models/intimacy.ts**：新增双修收益计算与触发条件

## 非目标

- 不将 NSFW 内容作为游戏核心吸引力（默认仍为武侠叙事）
- 不引入色情化的角色设计（穿着暴露服务于功法学设定而非独立标签）
- 不破坏现有的 SFW 玩家体验（「无」档位完全屏蔽所有性相关内容）

## Capabilities

### New Capabilities

- **lixiang-cultivation**：里象修行核心系统——定义双修功法数据结构、世界观注入规则、叙事分层约束、数值奖励机制
- **nsfw-scene-tiering**：NSFW 场景档位分层——将「点到为止/适度展开/完全展开」三个档位与写作约束、元数据注入、动作解锁联动

## Impact

- `data/cultivation/lixiang.ts` — 新增里象功法数据文件
- `prompts/runtime/` — nsfw.ts / worldSetup.ts / intimacy/index.ts 修改
- `prompts/core/cotPolish.ts` — Body Polish 档位词汇规则
- `prompts/writing/style.ts` — 里象场景文风指导（可选）
- `models/intimacy.ts` — 双修触发条件与收益计算
- `models/system.ts` — NSFW场景描述映射扩展

## 验收标准

1. 启用 NSFW 模式 + 「完全展开」档位时，世界生成结果包含双修门派
2. 亲密度等级达到 5 的 NPC，双修动作可正常触发并获得属性奖励
3. 「点到为止」档位不出现任何敏感词汇，仅有委婉表达
4. 「适度展开」档位可描写亲密行为，但不出现明确性描写词汇
5. 双修收益与根骨/体质/力量等既有属性正确联动