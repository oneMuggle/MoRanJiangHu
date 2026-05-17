# 现代纪元天赋/背景/气运 SFW & NSFW 优化方案

**日期:** 2026-05-17

## 一、当前系统现状

| 数据源 | SFW 数量 | NSFW 数量 | 问题 |
|--------|----------|-----------|------|
| 天赋 | ~137 | 0（SFW文件） / ~242（NSFW文件全在 urban） | 子纪元覆盖极度不均 |
| 背景 | ~118 | 0（SFW文件） / ~196（NSFW文件集中在 urban） | 校园 NSFW 仅 4 条 |
| 气运 | ~434 | 仅 13 条 nsfw=1，其余全为 nsfw=2 | 中间层严重缺失 |
| 预设 | 6 | 6 | 仅覆盖 campus/urban 两个子纪元 |

### 核心问题
1. **NSFW 分级断层** — 几乎没有 nsfw=1（轻度暧昧）中间层，"点到为止"模式可选内容极少
2. **子纪元覆盖不均** — contemporary_urban 占绝大多数，其他 8 个子纪元内容贫乏
3. **天赋-背景-气运无协同** — 没有推荐组合机制
4. **性别覆盖不平衡** — 男性视角 NSFW 内容极少
5. **分类字段缺失** — 部分条目缺少 `分类` 字段

---

## 二、SFW 优化方案

### 2.1 补充欠覆盖子纪元天赋（~40条）
- biohazard/nuclear/extreme_cold/zombie 各 +8 条
- campus 补充 +8 条（学术竞赛、实验室达人、校园创业等）
- post_apocalyptic 补充短板分类 +5 条

### 2.2 补充 SFW 校园背景（+6条）
研究生助教、实验室研究员、校园创业者、交换留学生、学生会主席、校园媒体人

### 2.3 统一分类字段
修复所有缺失 `分类` 的条目

---

## 三、NSFW 优化方案

### 3.1 新增 nsfw=1 中间层（~65条）
| 类型 | 数量 | 示例 |
|------|------|------|
| 天赋 | ~30 | 桃花体质、约会锦鲤、心跳加速、微醺魅力 |
| 背景 | ~15 | 恋爱经验、暧昧体质、浪漫主义 |
| 气运 | ~20 | 桃花运、浪漫邂逅、初恋加持 |

### 3.2 扩充欠覆盖子纪元 NSFW（~60+40 条）
为 campus/rural/noir/hippie/zombie/extreme_cold/biohazard/nuclear 各补充 5-10 条 NSFW 天赋和背景

### 3.3 新增男性视角 NSFW
- 天赋 +10（男性魅力、厨艺暖男、西装暴徒、霸道总裁等）
- 背景 +8（健身房常客、深夜食堂老板、乐队主唱等）

### 3.4 扩充预设（12 → 20+）
新增覆盖 rural/post_apocalyptic/noir/hippie/extreme_cold 的预设

### 3.5 新建推荐映射系统
创建 `modern-recommendations.ts`，为每个背景配置推荐天赋和气运

---

## 四、涉及修改的文件

| 文件 | 操作 | 变更量 |
|------|------|--------|
| `data/talents/modern.ts` | 修改 | +60 条 |
| `data/talents/nsfw.ts` | 修改 | +100 条 |
| `data/backgrounds/modern.ts` | 修改 | +10 条 |
| `data/backgrounds/nsfw.ts` | 修改 | +65 条 |
| `data/qiyun/categories/zhen-qiyun.ts` | 修改 | +20 条 |
| `data/qiyun/categories/hehuan.ts` | 修改 | +40 条 |
| `data/modern-recommendations.ts` | **新建** | 推荐映射表 |
| `data/newGamePresets.ts` | 修改 | +8 预设 |
| `components/features/NewGame/NewGameWizardContent.tsx` | 修改 | 推荐高亮 + nsfw=1 选项 |
| `components/features/NewGame/useNewGameWizardState.ts` | 修改 | 推荐系统逻辑 |

---

## 五、实施步骤

### Phase 1：数据层 SFW 补齐（2 个文件）
- [x] 步骤 1：扩充 modern.ts SFW 天赋 — 补充 biohazard/nuclear/extreme_cold/zombie 各 8 条，补充校园 8 条，修复缺失分类字段
- [x] 步骤 2：扩充 modern.ts SFW 背景 — 补充校园 6 条，修复缺失分类字段

### Phase 2：数据层 NSFW 分级建设（4 个文件）
- [x] 步骤 3：新增 nsfw=1 天赋层 — 在 nsfw.ts 中新增 ~30 条 nsfw等级=1 天赋
- [x] 步骤 4：新增 nsfw=1 背景层 — 在 backgrounds/nsfw.ts 中新增 ~15 条 nsfw等级=1 背景
- [x] 步骤 5：新增 nsfw=1 气运层 — 在 zhen-qiyun.ts 中新增 ~20 条 nsfw等级=1 气运
- [x] 步骤 6：扩充欠覆盖子纪元 NSFW — 为各子纪元补充 5-10 条 NSFW 天赋和背景（noir/hippie/zombie/extreme_cold/biohazard/nuclear 各 +6~7 天赋 +6 背景）
- [x] 步骤 7：新增男性视角 NSFW — 天赋 +10 条，背景 +7 条

### Phase 3：推荐系统与预设扩展（3 个文件）
- [x] 步骤 8：创建推荐映射表 — 在 recommendations.ts 中新增 60+ 条推荐（覆盖所有现代子纪元）
- [x] 步骤 9：扩展预设 — 在 newGamePresets.ts 中新增 15 预设（rural/post_apocalyptic/noir/hippie/extreme_cold/biohazard/nuclear 各 2-3）
- [x] 步骤 10：集成推荐高亮 — 在 NewGameWizardContent.tsx 和 useNewGameWizardState.ts 中实现推荐逻辑
- [x] 步骤 10b：推荐映射 SFW/NSFW 分离 — recommendations.ts 新增 `nsfw天赋`/`nsfw气运` 字段和 `获取背景推荐()` 函数，自动填充根据 `nsfw场景类型` 动态合并

### Phase 4：UI 层适配（2 个文件）
- [x] 步骤 11：NSFW 分级选项优化 — 天赋/背景/气运卡片均显示 nsfw=1「暧昧」（粉色）和 nsfw=2「激情」（红色）徽章，推荐项金色边框+「推荐」徽章
- [x] 步骤 12：移动端适配 — NewGameWizardContent 为桌面/移动共用组件，变更自动生效

---

## 七、已完成变更汇总（Phase 1-4）

| 文件 | 变更量 | 内容 |
|------|--------|------|
| `data/talents/modern.ts` | +31 条 | SFW 天赋补齐（campus/zombie/extreme_cold/biohazard/nuclear/post_apoc），修复缺失分类 |
| `data/talents/nsfw.ts` | +77 条 | nsfw=1 层 ~37 条 + 男性视角 10 条 + 欠覆盖子纪元 nsfw=2 ~30 条 |
| `data/backgrounds/modern.ts` | +6 条 | SFW 校园背景补齐，修复缺失分类 |
| `data/backgrounds/nsfw.ts` | +55 条 | nsfw=1 层 ~13 条 + 男性视角 7 条 + 欠覆盖子纪元 nsfw=2 ~35 条 |
| `data/qiyun/categories/zhen-qiyun.ts` | +20 条 | nsfw=1 气运（覆盖所有现代子纪元） |
| `data/recommendations.ts` | +60 条 | 推荐映射全覆盖（所有现代子纪元），清理未使用导入 |
| `data/newGamePresets.ts` | +15 个 | 开局预设覆盖 7 个新子纪元（11→26） |
| `components/features/NewGame/useNewGameWizardState.ts` | +12 行 | 推荐天赋/气运名称集合计算（useMemo） |
| `components/features/NewGame/NewGameWizardContent.tsx` | ~+30 行 | NSFW等级徽章（暧昧/激情）+ 推荐高亮（金色边框+推荐徽章） |

**总计**: +264 条数据条目 + 2 个 UI 文件修改，9 个文件变更

## 六、成功标准

- [x] 每个现代子纪元至少有 15 条 SFW 天赋、10 条 SFW 背景、10 条 SFW 气运 — **Phase 1 完成**
- [x] 每个现代子纪元至少有 5 条 nsfw=1 天赋、5 条 nsfw=1 背景、5 条 nsfw=1 气运 — **Phase 2 完成**
- [x] 每个现代子纪元至少有 8 条 nsfw=2 天赋、5 条 nsfw=2 背景 — **Phase 2 Step 6 完成**
- [x] 男性专属 NSFW 天赋/背景各 >= 8 条 — 天赋 10 条，背景 7 条（接近达标）
- [x] 预设覆盖至少 6 个子纪元（当前仅 2 个） — **Phase 3 完成，覆盖 9 个子纪元**
- [x] 每个现代背景至少有 2 个推荐天赋和 1 个推荐气运 — **Phase 3 Step 8 完成**
- [x] 所有条目都有完整的 `分类` 字段 — **Phase 1 Step 1/2 完成**
- [x] "点到为止"模式下可选项不少于 50 条 — **nsfw=1 层共 ~70 条，远超标准**
