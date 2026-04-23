## Context

当前项目的 NSFW 系统仅有 `启用NSFW模式` 布尔开关和 `nsfw场景类型`（无/点到为止/适度展开/完全展开）两个独立配置位。两者未联动，且缺少与武侠内功体系的叙事整合。

现有问题：
1. `启用NSFW模式=true` 会注入完整的露骨描写提示词，但不考虑用户选择的场景档位
2. `nsfw场景类型` 仅在世界生成锚点中出现，不影响运行时提示词构建
3. 亲密度系统（models/intimacy.ts）已支持 Lv1-5 分级，但双修(Lv5)无专属叙事约束
4. 缺少"里象修行"类功法的数据结构和世界观注入机制

参考「大渊习武录」将双修包装为武侠内功体系的做法，本设计将里象修行作为武侠成长的**可选路径**融入项目。

## Goals / Non-Goals

**Goals:**
- 将双修（里象修行）作为武侠内功体系的有机组成���非外挂色情内容
- 实现 `启用NSFW模式` × `nsfw场景类型` 的联动控制
- 按「点到为止/适度展开/完全展开」三档注入差异化叙事约束
- 双修奖励与根骨/体质/悟性等既有属性正确联动
- 世界生成时根据档位注入合欢宗/血河宗等双修门派

**Non-Goals:**
- 不引入色情化的角色设计语言（穿着暴露服务于功法学设定）
- 不破坏 SFW 玩家的体验（「无」档位完全屏蔽性内容）
- 不做游戏化 UI（如 v0.4.0 的 SLG 界面），纯叙事整合

## Decisions

### Decision 1: 里象功法数据独立为 `data/cultivation/lixiang.ts`

**选择理由：** 与现有的气运/出身系统（data/qiyun/index.ts, data/presets.ts）保持一致的独立数据文件结构，便于后续扩展双修相关功法和门派。

**替代方案：** 将里象功法混入现有的 gameplay 数据文件（如 data/stats/）。但独立文件更清晰，且与 qiyun 的 `nsfw等级` 过滤机制互补。

### Decision 2: 叙事层按场景档位分层，不做硬编码词汇黑名单

**选择理由：** 参考 prompts/writing/style.ts 的文风约束模式——用「允许/禁止」的语义约束替代词表黑名单，更灵活且对 AI 更友好。

**替代方案：** 黑名单词汇表（简单但容易被绕过的替代词汇绕过）。

### Decision 3: 双修门派以 World Book 注入方式存在，不修改世界生成流程主干

**选择理由：** 避免修改 worldGenerationWorkflow 的核心逻辑，仅在世界生成提示词组装阶段（worldSetup.ts）注入可选的世界书片段。

**替代方案：** 在 worldGenerationWorkflow 中新增条件分支。但 worldSetup.ts 已有 `世界书额外要求` 字段，可直接复用。

### Decision 4: 亲密度 → 双修触发使用现有的亲密互动系统扩展

**选择理由：** models/intimacy.ts 已完整支持 Lv1-5 等级和动作列表。只需扩展 `亲密互动类型` 枚举和收益计算，不引入新的状态结构。

## 数据结构

### 里象功法 (data/cultivation/lixiang.ts)

```typescript
export interface 里象功法 {
  id: string;
  名称: string;
  门派: '合欢宗' | '血河宗' | '天魔宫' | '自创';
  品级: '下品' | '中品' | '上品' | '极品';
  效果描述: string;
  修炼要求: {
    亲密度等级: number; // 5 = 双修解锁
    最低境界?: string;
  };
  收益: {
    属性类型: '根骨' | '体质' | '力量' | '敏捷';
    数值: number; // 1-3
  };
  风险: {
    类型: '心魔' | '反噬' | '正道追杀' | '无';
    描述: string;
  };
}
```

### 双修门派世界书 (prompts/runtime/worldLixiangSects.ts)

```typescript
export const 构建双修门派世界书 = (nsfw场景类型: NSFW场景类型): string => {
  // nsfw场景类型 === '无' → 返回空字符串
  // 否则注入合欢宗/血河宗等门派设定
};
```

### 叙事约束 (prompts/runtime/nsfw.ts 扩展)

```typescript
export const 构建里象修行叙事约束 = (
  nsfw场景类型: NSFW场景类型
): string => {
  const rules = {
    '无': '...',
    '点到为止': '...',
    '适度展开': '...',
    '完全展开': '...',
  };
  return rules[nsfw场景类型];
};
```

### 委婉词汇映射 (prompts/core/euphemisms.ts)

```typescript
export const 委婉词汇映射: Record<string, string[]> = {
  '肉棒': ['玉茎', '挺立', '阳物'],
  '小穴': ['花径', '幽谷', '秘处'],
  // ...
};
```

## 技术方案

### 修改文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `data/cultivation/lixiang.ts` | 新增 | 里象功法数据结构 + 门派数据 |
| `prompts/runtime/worldLixiangSects.ts` | 新增 | 双修门派世界书注入函数 |
| `prompts/core/euphemisms.ts` | 新增 | 委婉词汇映射表 |
| `prompts/runtime/nsfw.ts` | 修改 | 新增 `构建里象修行叙事约束()` |
| `prompts/runtime/worldSetup.ts` | 修改 | 调用 `构建双修门派世界书()` |
| `prompts/runtime/intimacy.ts` | 新增 | 动态亲密度动作约束注入 |
| `prompts/core/cotPolish.ts` | 修改 | Step7 按档位注入词汇约束 |
| `models/intimacy.ts` | 修改 | 新增双修触发条件与收益计算 |

### 调用链

```
世界生成时:
  worldSetup.ts → 构建双修门派世界书(nsfw场景类型) → 注入 worldPrompt

剧情生成时:
  prompts/index.ts → 构建运行时额外提示词(启用NSFW模式, nsfw场景类型)
    → 默认NSFW模式提示词（当启用=true时）
    → 构建里象修行叙事约束(nsfw场景类型)
  
正文润色时:
  cotPolish.ts Step7 → 委婉词汇映射表 → 按档位替换
  
双修触发时:
  intimacyUtils.ts → 计算双修奖励(里象功法, npc) → 更新属性
```

## 影响评估

### 功能影响
- 启用 NSFW 模式 + 非「无」档位 → 新增双修门派世界书注入
- 双修动作触发 → 新增属性奖励计算
- 所有剧情生成 → 新的叙事约束生效

### 兼容性
- 完全向后兼容：新增数据文件，不修改现有数据结构
- `启用NSFW模式=false` → 行为与原来完全一致
- `nsfw场景类型='无'` → 没有任何变化

### 性能
- 新增数据文件约 200 行 TypeScript
- 提示词字符串增加约 500 字符
- 无额外计算/网络开销

## Risks / Trade-offs

- **[风险]** 双修叙事可能与既有武侠基调冲突 → **缓解**：通过「武侠内功体系」叙事框架包装，用气机/经脉/阴阳等术语替代直接性描写
- **[风险]** 不同档位描写深度差异可能影响叙事一致性 → **缓解**：委婉词汇映射表确保「适度展开」档位有足够替代词可用
- **[权衡]** 双修作为可选路线，不会强制所有 NSFW 玩家使用 → **设计选择**：符合项目「武侠成长为主轴」的定位

## Open Questions

1. 双修门派是否需要独立的 NPC 立绘/形象？暂不考虑，基于现有 NPC 系统扩展
2. 「适度展开」档位的委婉词汇表是否完整？需在上线后根据实际生成结果补充
3. 双修次数是否有限制（如每日/每周）？当前设计无限制，可按需扩展