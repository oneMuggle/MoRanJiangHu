# NSFW 系统深度优化方案

**日期:** 2026-05-04
**状态:** 待审批

---

## 背景

前序会话（`2026-05-04-campus-era-talent-nsfw-optimization.md`）已完成：
- [x] 校园纪元天赋/气运/背景名称修正
- [x] 校园里模式字段扩写 + stageRules 新增
- [x] `nsfw.ts` 中现代情感叙事约束函数 + 自动选择逻辑

本次方案聚焦**遗留的系统性问题**，这些是前序方案未覆盖的。

---

## 一、遗留问题清单

### P0 - Bug：`nsfwCard.ts` 未使用时代感知约束

**文件:** `prompts/runtime/nsfwCard.ts:74`

前序方案在 `nsfw.ts` 中创建了 `自动选择叙事约束(eraId, nsfw场景类型)`，但 `nsfwCard.ts` 中 NPC 卡片的叙事约束仍然直接调用 `构建里象修行叙事约束(nsfw场景类型)`，忽略了时代参数。

**影响：** 校园/现代时代的 NPC 卡片在亲密度 >= 5 时仍会注入武侠/双修术语。

**注意：** `nsfwCard.ts:5` 已经导入了 `构建里象修行叙事约束`，需要改为导入并使用 `自动选择叙事约束`，同时给函数签名增加 `时代配置ID` 参数。

### P0 - Bug：`intimacy.ts` 亲密度约束缺少现代路径

**文件:** `prompts/runtime/intimacy.ts:44-63`

`构建亲密度动作约束` 中所有档位描述均使用武侠框架（双修/气机/经脉/玉茎/花径）。该函数在 `nsfwCard.ts:29` 中被调用，但没有时代参数。

**影响：** 校园/现代时代的亲密度动作约束仍然是武侠术语。

### P1 - 隐患：`worldLixiangSects.ts` 全时代注入双修门派

**文件:** `prompts/runtime/worldLixiangSects.ts`

`构建双修门派世界书` 生成合欢宗、血河宗、天魔宫等纯武侠/修仙门派设定，不检查时代类型。

**影响：** 在校园/现代/科幻等时代的世界书中会出现不合时宜的双修门派内容。

### P2 - 代码质量：`nsfw.ts` 中现代时代列表硬编码

**文件:** `prompts/runtime/nsfw.ts:114-117`

```typescript
const modernEras = ['contemporary_campus', 'contemporary_urban', ...];
```

新增时代需手动维护此列表。

### P2 - 代码质量：`GameSettings.tsx` 中多处 `as any`

**文件:** `components/features/Settings/GameSettings.tsx:495-498, 502-564`

`游戏设置结构` 接口未正式包含里模式相关字段，导致表单使用 `(form as any)`。

### P3 - 文生图 NSFW 负向提示词逻辑待确认

**文件:** `hooks/useGame/sceneImageWorkflow.ts:114`

NSFW 模式下负向提示词中包含 "nude, nsfw" 等词——需要确认这是有意为之（防止图片过于露骨）还是逻辑失误。

---

## 二、实施方案

### Phase 1: Bug 修复（核心功能正确性）

**复杂度: 低 | 预计: 1-2 小时**

#### 1.1 修复 `nsfwCard.ts` 时代感知

**文件变更:**
- `prompts/runtime/nsfwCard.ts` — 核心修改
- `hooks/useGame/systemPromptBuilder.ts` — 调用方传参

**具体改动:**
1. `构建NPC_NSWF卡片` 增加可选参数 `时代配置ID?: string`
2. `构建在场NPC_NSWF卡片组` 增加可选参数 `时代配置ID?: string` 并透传
3. `nsfwCard.ts:5` 导入 `自动选择叙事约束` 替代 `构建里象修行叙事约束`
4. `nsfwCard.ts:74` 替换为 `自动选择叙事约束(时代配置ID, nsfw场景类型)`
5. `systemPromptBuilder.ts` 中调用 `构建在场NPC_NSWF卡片组` 时传入当前时代 ID

#### 1.2 修复 `intimacy.ts` 亲密度约束时代感知

**文件变更:**
- `prompts/runtime/intimacy.ts` — 核心修改
- `prompts/runtime/nsfwCard.ts` — 调用方传参

**具体改动:**
1. `构建亲密度动作约束` 增加可选参数 `时代配置ID?: string`
2. 在函数内部根据时代选择武侠或现代情感约束描述
3. 现代情感约束参考 `nsfw.ts` 中已有的 `构建现代情感叙事约束` 风格
4. `nsfwCard.ts:29` 调用时透传 `时代配置ID`

#### 1.3 守卫 `worldLixiangSects.ts` 时代检查

**文件变更:**
- `prompts/runtime/worldLixiangSects.ts` — 核心修改
- 调用方检查

**具体改动:**
1. `构建双修门派世界书` 函数签名增加 `时代配置ID?: string` 参数
2. 在函数入口判断时代类型：
   - 武侠/修仙/志怪时代（通过 `eraTheme` 的 `systemType` 或里模式名称判断）→ 正常执行
   - 其他时代 → 返回空字符串或空数组
3. 更新所有调用方传入时代 ID

---

### Phase 2: 校园纪元 NSFW 内容深化

**复杂度: 中 | 预计: 2-3 小时**

前序方案已修复框架问题，但校园纪元的 **预设内容量** 仍严重不足。需要增加实际可用的 NSFW 标签天赋/背景/气运。

#### 2.1 增加校园 NSFW 天赋（5-8 个）

**文件变更:** `data/presets.ts` 或 `data/subEraDefaultPresets.ts`

基于校园里模式的 6 个场景类型和 6 组双人格，设计贴合校园场景的天赋：

| 天赋名称 | 关联场景 | 简要描述 |
|---------|---------|---------|
| 深夜自习室常客 | 图书馆独处 | 喜欢在闭馆前留在图书馆，享受独处时光 |
| 实验室搭档 | 深夜实验室 | 科研狂人，经常在实验室待到深夜 |
| 社团部室钥匙持有者 | 社团活动室 | 社团核心成员，拥有部室钥匙 |
| 宿舍夜猫子 | 宿舍夜访 | 深夜不眠型，喜欢在寝室聊天 |
| 天台观景者 | 校园天台 | 喜欢到天台独处和思考 |
| 校医务室VIP | 医务室独处 | 经常去医务室的体质虚弱者 |
| 泳池晨练者 | 校园泳池 | 每天清晨第一个到泳池的人 |

每个天赋需要：`名称`、`描述`、`tags: ['NSFW']`、`era: 'contemporary_campus'`。

#### 2.2 增加校园 NSFW 背景（3-5 个）

**文件变更:** `data/presets.ts`

| 背景名称 | 简要描述 |
|---------|---------|
| 校园风云人物 | 在学校中备受关注，一举一动都引人注目 |
| 秘密社团成员 | 加入了不为人知的地下社团 |
| 宿舍楼传说 | 在宿舍楼中有着特殊的传闻 |
| 跨系交流生 | 从其他院系来的交换生，带来不同文化 |

每个背景需要：`名称`、`描述`、`tags: ['NSFW']`、绑定 `contemporary_campus`。

#### 2.3 增加校园 NSFW 气运（5-8 个）

**文件变更:** `data/qiyun/index.ts`

| 气运名称 | 简要描述 |
|---------|---------|
| 青梅竹马缘 | 与青梅竹马的缘分牵引 |
| 月考锦鲤 | 考试运极佳，常在关键时刻被关注 |
| 社团招福 | 在社团活动中容易获得特殊关注 |
| 天台邂逅运 | 常在天台偶遇重要之人 |
| 校园祭主角 | 校园祭中总被推为核心角色 |

每个气运需要：`名称`、`描述`、`时代: ['contemporary_campus']`、`标签: ['NSFW']`。

---

### Phase 3: 架构改进（可选但建议）

**复杂度: 低 | 预计: 1 小时**

#### 3.1 动态派生现代时代列表

**文件变更:**
- `models/eraTheme/` 中新增或修改导出
- `prompts/runtime/nsfw.ts`

**具体改动:**
1. 在 `models/eraTheme/` 的公共导出中定义 `MODERN_ERA_IDS` 常量
2. `nsfw.ts` 导入该常量替代本地硬编码
3. 新增时代时只需在一个位置更新

#### 3.2 消除 `as any` 类型转换

**文件变更:**
- `models/system.ts`
- `components/features/Settings/GameSettings.tsx`

**具体改动:**
1. 检查 `游戏设置结构` 接口是否已包含所有里模式字段（`启用子纪元里模式`、`子纪元里模式强度`、`子纪元里模式阶段`）
2. 如缺失则补充类型定义
3. 消除 `GameSettings.tsx` 中所有 `(form as any)` 转换

---

## 三、实施顺序

```
Phase 1 (Bug 修复) → Phase 2 (内容深化) → Phase 3 (架构改进, 可选)
```

Phase 1 和 Phase 2 可并行（不同文件），Phase 3 可独立完成。

## 四、风险评估

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| `nsfwCard.ts` 签名变更影响调用方 | 低 | 参数为可选，向后兼容 |
| `intimacy.ts` 变更影响所有时代 | 中 | 参数可选，默认回退到现有武侠行为 |
| 校园 NSFW 预设内容尺度 | 中 | 与现有 `构建现代情感叙事约束` 保持一致 |
| `worldLixiangSects.ts` 守卫影响武侠时代 | 低 | 仅对非武侠时代跳过，原有逻辑不变 |

## 五、成功标准

- [x] `nsfwCard.ts` 中 NPC 卡片根据时代自动选择武侠/现代约束
- [x] `intimacy.ts` 中亲密度动作约束根据时代自动选择描述框架
- [x] `worldLixiangSects.ts` 仅对武侠/修仙时代注入双修门派
- [x] 校园纪元拥有 5+ 个 NSFW 天赋、3+ 个 NSFW 背景、5+ 个 NSFW 气运
- [x] `nsfw.ts` 中现代时代列表从时代树派生（非硬编码）
- [x] `GameSettings.tsx` 中无 `as any` 类型转换
- [x] TypeScript 编译无新增错误
- [x] SFW 模式下不泄露任何 NSFW 内容

## 六、进度标记

- [x] Phase 1: Bug 修复 — 2026-05-04 实施完成
  - [x] 1.1 `nsfwCard.ts` 时代感知：`自动选择叙事约束` 导出并替换 `构建里象修行叙事约束`
  - [x] 1.2 `intimacy.ts` 时代感知：增加 `时代配置ID` 参数，现代时代使用情感叙事约束
  - [x] 1.3 `worldLixiangSects.ts` 时代守卫：增加 `WUXIA_ERA_IDS` 检查，非武侠时代返回空
- [x] Phase 2: 校园 NSFW 内容深化 — 2026-05-04 实施完成
  - [x] 2.1 增加 8 个校园 NSFW 天赋（`data/presets.ts` 预设天赋数组）
  - [x] 2.2 增加 4 个校园 NSFW 背景（`data/presets.ts` 预设背景数组）
  - [x] 2.3 增加 7 个校园 NSFW 气运（`data/qiyun/index.ts`）
- [x] Phase 3: 架构改进（可选，待实施）
  - [x] 3.1 动态派生现代时代列表：`MODERN_ERA_IDS` 集中到 `models/eraTheme/assembly.ts`
  - [x] 3.2 消除 `as any` 类型转换：`GameSettings.tsx` 中 14 处 `as any` 全部移除

## 七、Phase 1 实施记录

### 文件变更清单

| 文件 | 变更内容 |
|------|---------|
| `prompts/runtime/nsfw.ts` | `自动选择叙事约束` 从 `const` 改为 `export const` |
| `prompts/runtime/nsfwCard.ts` | 导入改为 `自动选择叙事约束`；两个函数增加 `options?: { 时代配置ID?: string }` 参数；叙事约束调用替换 |
| `prompts/runtime/intimacy.ts` | 增加 `是现代时代()` 辅助函数；`构建亲密度动作约束` 增加 `options` 参数；Level 5 约束分武侠/现代两条路径 |
| `prompts/runtime/worldLixiangSects.ts` | 增加 `WUXIA_ERA_IDS` 常量；函数增加 `options` 参数；非武侠时代返回空字符串 |
| `prompts/runtime/worldSetup.ts` | 调用 `构建双修门派世界书` 时传入 `{ 时代配置ID }` |
| `hooks/useGame/systemPromptBuilder.ts` | 调用 `构建在场NPC_NSWF卡片组` 时传入 `{ 时代配置ID }` |

### Phase 2 实施记录

#### 2.1 校园 NSFW 天赋（8个）— `data/presets.ts` 预设天赋数组

| 天赋名称 | 性别限制 | 关联场景 |
|---------|---------|---------|
| 深夜实验室常驻者 | 无 | 深夜实验室 |
| 深夜自习室常客 | 女 | 图书馆独处 |
| 社团部室钥匙持有者 | 无 | 社团活动室 |
| 天台观景者 | 女 | 校园天台 |
| 校医务室VIP | 女 | 医务室独处 |
| 泳池晨练者 | 女 | 校园泳池 |
| 宿舍夜猫子 | 无 | 宿舍夜访 |
| 家教兼职达人 | 女 | 校外独处 |
| 校园祭策划 | 无 | 校园祭活动 |

#### 2.2 校园 NSFW 背景（4个）— `data/presets.ts` 预设背景数组

| 背景名称 | 性别限制 | 说明 |
|---------|---------|------|
| 校园风云人物 | 女 | 高关注度，私生活易曝光 |
| 秘密社团成员 | 无 | 隐秘人脉，特殊活动 |
| 宿舍楼传说 | 女 | 话题度高，传闻缠身 |
| 跨院系交流生 | 无 | 跨圈人脉，身份切换 |

#### 2.3 校园 NSFW 气运（7个）— `data/qiyun/index.ts`

| 气运名称 | 类别 | 效果方向 |
|---------|------|---------|
| 青梅竹马缘 | 合欢秘辛 | 旧识亲密事件 |
| 月考锦鲤 | 合欢秘辛 | 补习邀约事件 |
| 社团招福 | 合欢秘辛 | 社团特殊邂逅 |
| 天台邂逅运 | 合欢秘辛 | 天台独处事件 |
| 校园祭主角 | 合欢秘辛 | 校园祭特殊事件 |
| 图书馆偶遇 | 合欢秘辛 | 图书馆偶遇事件 |
| 合宿缘分 | 合欢秘辛 | 合宿特殊事件 |
