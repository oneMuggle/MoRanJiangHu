## 1. 数据层：里象功法定义

- [x] 1.1 创建 `data/cultivation/lixiang.ts`，定义 `里象功法` 接口和门派枚举（合欢宗/血河宗/天魔宫/自创）
- [x] 1.2 在 `data/cultivation/lixiang.ts` 中添加示例数据：合欢宗上品功法「血亲和鸣谱」（无风险，体质+2）、血河宗下品功法「摧花铁掌」（反噬风险，力量+3）
- [x] 1.3 导出 `里象功法[]` 数组和 `getLixiangById()` 查询函数
- [x] 1.4 验证：运行 `npx tsc data/cultivation/lixiang.ts --noEmit` 无类型错误

## 2. 提示词层：叙事约束与委婉词汇

- [x] 2.1 创建 `prompts/core/euphemisms.ts`，导出 `委婉词汇映射表`（肉棒→玉茎/阳物，小穴→花径/幽谷，精液→精华/阳精等）
- [x] 2.2 创建 `prompts/runtime/worldLixiangSects.ts`，导出 `构建双修门派世界书()` 函数，根据 nsfw场景类型 注入合欢宗/血河宗门派设定
- [x] 2.3 扩展 `prompts/runtime/nsfw.ts`，新增 `构建里象修行叙事约束()` 函数，按档位返回描写规则
- [x] 2.4 验证：创建 `prompts/runtime/intimacy.ts`（或扩展 existing prompts/intimacy/index.ts），导出根据亲密度等级动态注入动作约束的函数
- [x] 2.5 验证：调用 `构建双修门派世界书('无')` 返回空字符串，调用 `构建双修门派世界书('完全展开')` 返回门派设定

## 3. 世界生成集成

- [x] 3.1 修改 `prompts/runtime/worldSetup.ts`，在世界生成锚点提示词中调用 `构建双修门派世界书(nsfw场景类型)`
- [ ] 3.2 验证：世界生成后，检查生成的 world_prompt 中包含/不包含双修门派（取决于档位）

## 4. 运行时提示词集成

- [x] 4.1 修改 `prompts/runtime/nsfw.ts` 的 `构建运行时额外提示词()`，在 `启用NSFW模式=true` 时同时传入 `nsfw场景类型` 给 `构建里象修行叙事约束()`
- [x] 4.2 修改 `prompts/runtime/nsfw.ts` 的 `构建文生图运行时额外提示词()`，同步联动
- [ ] 4.3 验证：`构建运行时额外提示词('', {启用NSFW模式: true})` 输出包含里象修行叙事约束

## 5. 亲密度系统扩展

- [x] 5.1 扩展 `models/intimacy.ts` 的 `亲密互动类型` 枚举，增加双修相关动作
- [x] 5.2 在 `models/intimacy.ts` 中新增 `计算双修收益()` 函数，参数为里象功法 + NPC，返回属性奖励数组
- [x] 5.3 在 `hooks/useGame/intimacyUtils.ts` 中新增 `triggerLixiangCultivation()` 函数，调用双修奖励计算并更新角色属性
- [ ] 5.4 验证：亲密度等级 5 的 NPC 触发双修后，角色根骨/体质/力量等属性正确增加

## 6. Body Polish 档位集成

- [x] 6.1 修改 `prompts/core/cotPolish.ts` Step7，根据当前 `nsfw场景类型` 注入差异化词汇规则
- [ ] 6.2 验证：「适度展开」档位生成结果不包含肉棒/小穴等明确词汇；「完全展开」档位保留
- [ ] 6.3 验证：Body Polish 输出不引入新的性内容，仅在原文已含 NSFW 内容时按档位整理

## 7. 端到端验证

- [ ] 7.1 启用 NSFW 模式 + 「完全展开」档位 → 世界生成包含双修门派 + 剧情可触发双修 + 获得属性奖励
- [ ] 7.2 启用 NSFW 模式 + 「点到为止」档位 → 剧情描写仅用成语（春宵一度），无敏感词
- [ ] 7.3 启用 NSFW 模式 + 「适度展开」档位 → 剧情描写用委婉词汇，无明确词汇
- [ ] 7.4 关闭 NSFW 模式 → 所有档位表现与原来一致，无 NSFW 内容
- [x] 7.5 运行 `npm run build` 无错误