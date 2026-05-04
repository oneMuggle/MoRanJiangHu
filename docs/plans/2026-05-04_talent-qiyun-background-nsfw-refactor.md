# 2026-05-04 天赋气运背景NSFW系统整理优化

## 背景与目标

当前项目的天赋、气运、背景三大系统存在以下问题：

1. **数据混乱**：`data/presets.ts` (1034行) 混合了天赋+背景815条数据，`data/qiyun/index.ts` (1288行) 有947条气运数据，缺乏有效分类和筛选
2. **NSFW标记不统一**：天赋/背景用 `nsfw: boolean`，气运用 `nsfw等级: 0|1|2`，缺少统一的NSFW分级体系
3. **时代适配散乱**：`时代适配` 和 `子纪元适配` 并存但过滤逻辑耦合在UI层
4. **useNewGameWizardState.ts 过于臃肿** (1272行)：背景推荐映射、天赋/气运选择逻辑、自动填充全部耦合在一个文件中
5. **NSFW叙事约束分散**：`prompts/runtime/nsfw.ts` 中里象/现代两套叙事框架，与campusNSFW子系统交织
6. **气运类别过多**：947条气运分布在11个类别，其中"合欢秘辛"(207条)和"限制版气运"(167条)数量异常庞大

**优化目标**：
- 统一NSFW分级体系
- 分离数据层与UI层逻辑
- 清理冗余/重复的气运条目
- 优化背景推荐映射的可维护性
- 整理NSFW叙事约束模块

## 涉及文件

### 数据层
| 文件 | 当前行数 | 问题 |
|------|---------|------|
| `data/presets.ts` | 1034 | 天赋+背景混在一起，351条NSFW数据未分类 |
| `data/qiyun/index.ts` | 1288 | 947条气运，207条合欢秘辛+167条限制版过于臃肿 |
| `types.ts` | - | 天赋结构/背景结构/气运结构定义，NSFW标记不统一 |

### UI/状态层
| 文件 | 当前行数 | 问题 |
|------|---------|------|
| `components/features/NewGame/useNewGameWizardState.ts` | 1272 | 背景推荐映射(200+行)、选择逻辑、自动填充全部耦合 |
| `components/features/Character/CharacterProfileCard.tsx` | - | 天赋/气运展示组件 |

### 运行时/Prompt层
| 文件 | 问题 |
|------|------|
| `prompts/runtime/nsfw.ts` | 里象/现代叙事约束分散，与campusNSFW交织 |
| `prompts/runtime/qiyun.ts` | 气运提示词 |
| `prompts/runtime/nsfwCard.ts` | NSFW角色卡片构建 |
| `hooks/useGame/systemPromptBuilder.ts` | ~3000行，天赋/气运/背景注入逻辑 |

### 模型层
| 文件 | 问题 |
|------|------|
| `models/campusNSFW.ts` | 469行，v1.0-v1.4多层叠加 |
| `models/system.ts` | NSFW场景类型定义 |
| `models/social.ts` | NPC结构中的NSFW字段 |

## 技术方案

### 阶段一：统一NSFW分级体系

**目标**：将 `nsfw: boolean` 和 `nsfw等级: 0|1|2` 统一为 `nsfw等级: 0|1|2|3`

1. 在 `types.ts` 中新增统一类型：
   ```typescript
   export type NSFW等级 = 0 | 1 | 2 | 3;
   ```
   - `0` = 无NSFW内容
   - `1` = 轻度（暧昧/暗示）
   - `2` = 中度（委婉描写）
   - `3` = 重度（明确描写）

2. 更新 `天赋结构`、`背景结构` 接口：
   - 将 `nsfw?: boolean` 替换为 `nsfw等级?: NSFW等级`
   - 保持向后兼容：`nsfw: true` 映射为 `nsfw等级: 2`

3. 更新 `气运结构` 接口：
   - 统一 `nsfw等级` 字段含义

4. 批量迁移 `data/presets.ts` 中的数据：
   - `nsfw: true` → `nsfw等级: 2`
   - 无nsfw标记 → `nsfw等级: 0`

5. 更新所有引用处（UI过滤、prompt注入、自动填充）

### 阶段二：数据文件拆分与重组

**目标**：将 `data/presets.ts` 和 `data/qiyun/index.ts` 拆分为按类别组织的模块化文件

1. **拆分 `data/presets.ts`**：
   ```
   data/
   ├── talents/
   │   ├── index.ts           # 导出合并
   │   ├── wuxia.ts           # 武侠天赋
   │   ├── zhiguai.ts         # 志怪天赋
   │   ├── myth.ts            # 神话天赋
   │   ├── western.ts         # 西方古代天赋
   │   ├── nsfw.ts            # NSFW天赋（按等级细分）
   │   ├── modern.ts          # 现代天赋
   │   └── common.ts          # 通用天赋（全时代）
   ├── backgrounds/
   │   ├── index.ts           # 导出合并
   │   ├── wuxia.ts           # 武侠背景
   │   ├── zhiguai.ts         # 志怪背景
   │   ├── myth.ts            # 神话背景
   │   ├── western.ts         # 西方古代背景
   │   ├── nsfw.ts            # NSFW背景
   │   ├── modern.ts          # 现代背景
   │   └── common.ts          # 通用背景
   └── presets.ts             # 保留向后兼容的 re-export
   ```

2. **拆分 `data/qiyun/index.ts`**：
   ```
   data/qiyun/
   ├── index.ts               # 导出合并 + 过滤工具函数
   ├── true-fortune.ts        # 真·气运 (387条 → 精选保留)
   ├── limited.ts             # 限制版气运 (167条 → 精简)
   ├── causality.ts           # 因果律 (53条)
   ├── heavenly-rules.ts      # 天道规则 (41条)
   ├── brain-hole.ts          # 脑洞破防 (30条)
   ├── white-free.ts          # 白嫖躺赢 (17条)
   ├── mental-crit.ts         # 精神暴击 (17条)
   ├── law-twist.ts           # 法则扭曲 (12条)
   ├── absolute-inv.ts        # 绝对无敌 (10条)
   ├── lazy-dim.ts            # 怠惰降维 (6条)
   ├── hehuan-secrets.ts      # 合欢秘辛 (207条 → 大幅精简)
   └── modern.ts              # 现代/未来气运（从上面分类中提取）
   ```

3. **气运精简策略**：
   - "合欢秘辛" 207条中大量重复/相似条目合并为30-50条精品
   - "限制版气运" 167条中明显冗余的合并
   - 重复条目检测（名称相似+效果相似）
   - 确保每个类别保留最具代表性的条目

### 阶段三：重构 useNewGameWizardState

**目标**：将1272行的单文件拆分为职责清晰的模块

1. **提取背景推荐映射**到独立文件：
   ```
   data/recommendations.ts
   ```
   - 当前200+行的 `背景推荐映射` 对象
   - 使用类型安全的key-value结构
   - 支持按nsfw等级过滤推荐

2. **提取天赋/气运选择逻辑**到独立hook：
   ```
   hooks/useGame/useTalentQiyunSelection.ts
   ```
   - `toggleTalent` / `toggleQiyun`
   - `自动填充天赋气运`
   - 选择上限校验

3. **简化后的 useNewGameWizardState** 只保留：
   - 向导步骤状态管理
   - 各子hook的组合
   - 最终角色构建

### 阶段四：NSFW叙事约束整理

**目标**：统一NSFW叙事约束模块，消除散落的耦合

1. **重构 `prompts/runtime/nsfw.ts`**：
   - 提取时代叙事约束到独立文件
   - 统一里象/现代/校园三种叙事框架的接口

2. **整理 campusNSFW 子系统**：
   - `models/campusNSFW.ts` (469行) 拆分为：
     - `models/campusNSFW/core.ts` - v1.0 核心类型
     - `models/campusNSFW/exposure.ts` - v1.1 露出系统
     - `models/campusNSFW/sm.ts` - v1.2 SM系统
     - `models/campusNSFW/party-games.ts` - v1.3 桌游
     - `models/campusNSFW/festival.ts` - v1.4 校园祭

3. **统一 NSFW 卡片构建**：
   - `prompts/runtime/nsfwCard.ts` 重构为按等级注入

### 阶段五：UI筛选与搜索优化

**目标**：改善新游戏向导中的天赋/气运/背景选择体验

1. 实现按分类/时代/NSFW等级的多维筛选
2. 搜索功能（按名称/关键词）
3. 推荐系统增强（基于已选背景的协同推荐）
4. 移动端适配优化

## 实施步骤

- [x] 步骤 1：在 `types.ts` 中定义统一 `NSFW等级` 类型，更新接口
- [x] 步骤 2：批量迁移 `data/presets.ts` 中的NSFW标记
- [x] 步骤 3：创建 `data/talents/` 目录结构，按类别拆分天赋数据
- [x] 步骤 4：创建 `data/backgrounds/` 目录结构，按类别拆分背景数据
- [x] 步骤 5：拆分 `data/qiyun/index.ts` 为类别文件
- [ ] 步骤 6：气运数据去重和精简（合欢秘辛207→50，限制版167→80）
- [x] 步骤 7：更新 `data/presets.ts` 为 re-export 兼容入口
- [x] 步骤 8：提取背景推荐映射到 `data/recommendations.ts`
- [x] 步骤 9：提取天赋/气运选择逻辑到 `hooks/useGame/useTalentQiyunSelection.ts` — **跳过**：toggleTalent/toggleQiyun 仅 8 行，自动填充逻辑依赖向导内部状态，提取后 API 更复杂
- [x] 步骤 10：简化 `useNewGameWizardState.ts`（移除179行内联推荐映射）
- [x] 步骤 11：重构 `prompts/runtime/nsfw.ts` 为模块化 — **跳过**：文件仅 160 行，函数边界已清晰，拆分需更新 5 个引用文件的 import 路径，收益不足
- [x] 步骤 12：拆分 `models/campusNSFW.ts` 为子模块（core/exposure/sm/party-games/festival）
- [x] 步骤 13：更新所有 import 路径，确保构建通过
- [ ] 步骤 14：增强UI筛选和搜索功能 — 当前已有搜索+分类过滤，可后续按需增强
- [x] 步骤 15：运行 `npm run build` 验证构建 — **已通过**
- [ ] 步骤 16：端到端测试新游戏创建流程 — 手动测试验证

## 风险评估与依赖

| 风险 | 等级 | 缓解措施 |
|------|------|---------|
| 数据迁移时nsfw标记丢失 | 中 | 写迁移脚本+验证测试 |
| 气运精简时误删重要条目 | 中 | 保留原始数据备份，逐条审查 |
| import路径更新遗漏 | 低 | TypeScript编译检查 |
| 背景推荐映射破坏现有逻辑 | 低 | 保持API签名不变 |
| NSFW叙事约束重构影响prompt输出 | 中 | 对比重构前后prompt文本 |

## 完成状态总览

### 已完成
| 步骤 | 内容 | 状态 |
|------|------|------|
| 步骤 1 | 统一 NSFW等级 类型 | 已完成 |
| 步骤 2 | 批量迁移 NSFW 标记 | 已完成 |
| 步骤 3 | 创建 data/talents/ 目录结构 | 已完成 |
| 步骤 4 | 创建 data/backgrounds/ 目录结构 | 已完成 |
| 步骤 5 | 拆分 data/qiyun/index.ts 为类别文件 | 已完成 |
| 步骤 7 | 更新 data/presets.ts 为 re-export | 已完成 |
| 步骤 8 | 提取背景推荐映射 | 已完成 |
| 步骤 10 | 简化 useNewGameWizardState.ts (1272→1094行) | 已完成 |
| 步骤 12 | 拆分 campusNSFW.ts (469→6子模块) | 已完成 |
| 步骤 13 | 更新 import 路径，构建通过 | 已完成 |
| 步骤 15 | npm run build 验证 | 已通过 |

### 跳过（低收益）
| 步骤 | 原因 |
|------|------|
| 步骤 9 | toggle 仅 8 行，提取 API 更复杂 |
| 步骤 11 | nsfw.ts 仅 160 行，函数边界已清晰 |

### 待执行（手动/可选）
| 步骤 | 内容 |
|------|------|
| 步骤 6 | 气运数据去重精简（需人工逐条审查） |
| 步骤 14 | UI筛选增强（当前已有基础功能） |
| 步骤 16 | 端到端手动测试 |
