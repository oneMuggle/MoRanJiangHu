# 时代继承系统 (Era Inheritance System)

## 状态：已完成实现

## 目标

建立 Epoch（时代）→ Era（纪元）→ SubEra（子纪元）三层树状层级结构，实现元数据的向上继承解析。

## 已实现组件

### 数据模型 (`models/eraTheme/`)

- **`types.ts`** - 定义 `EraNode`、`EraColors`、`EraTypography`、`EraUIStyle`、`EraPromptVars`、`EraRealmConfig` 等核心类型
- **`assembly.ts`** - 核心继承解析函数 `resolveEraNode(id)`：
  - 从节点自身向根节点遍历（path 是 `[root, ..., leaf]`）
  - `getFirstDefined(getter)` 从叶向根查找第一个定义的字段值
  - `getNodeOnly(getter)` 仅返回节点自身定义的字段（用于 openingScenes、characterArchetypes、writingSamples 等叶子专属数据）
  - `sources[]` 数组记录每个继承字段的来源节点 ID
- **7 个 Epoch 文件** - `epoch-primordial`、`epoch-ancient`、`epoch-modern`、`epoch-contemporary`、`epoch-near-future`、`epoch-far-future`、`epoch-post-human`
- **`assembly.test.ts`** - 39 个测试用例覆盖：
  - 树形关系完整性（parent 引用校验、3 层路径校验）
  - SubEra 必填字段校验（colors、typography、uiStyle、promptVars）
  - 颜色值有效性（hex 或 RGB 字符串格式）
  - 继承覆盖完整性（sources 数组、节点自身覆盖优先、liMode 继承）
  - UI Copy 一致性

### 继承字段分类

| 字段 | 继承方式 | 说明 |
|------|---------|------|
| `colors` | 最近覆盖 | Epoch → Era → SubEra，最近的定义胜出 |
| `typography` | 最近覆盖 | 同上 |
| `uiStyle` | 最近覆盖 | 同上 |
| `bgmTags` | 最近覆盖 | 同上 |
| `artStyle` | 最近覆盖 | 同上 |
| `promptVars` | 最近覆盖 | 同上 |
| `conflictTypes` | 最近覆盖 | 同上 |
| `liMode` | 最近覆盖 | 同上 |
| `realm` | 最近覆盖 | 同上 |
| `openingScenes` | 仅自身 | 不继承，只使用节点自身定义 |
| `characterArchetypes` | 仅自身 | 同上 |
| `writingSamples` | 仅自身 | 同上 |
| `uiCopy` | 仅自身 | 同上 |

### 消费者（已集成）

- `prompts/runtime/eraTheme.ts` - `构建时代主题注入`、`构建时代角色原型注入`、`构建时代文风注入`
- `prompts/runtime/eraLiMode.ts` - 使用 `resolveEraNode` 获取里模式配置
- `prompts/runtime/eraOpeningScene.ts` - 使用 `resolveEraNode` 获取开局场景
- `components/features/NewGame/useNewGameWizardState.ts` - 新建游戏向导使用 `resolveEraNode` 解析时代配置
- `utils/gameSettings.ts` - 游戏设置使用 `resolveEraNode` 解析里模式名称

### 向后兼容

- `getEraById()` 包含 legacy ID 映射表（`era_ancient_wuxia` → `ancient_eastern_wuxia` 等）
- `时代主题方案列表` 和 `获取时代主题方案()` 旧接口仍然可用

## 测试验证

```bash
npx vitest run models/eraTheme/assembly.test.ts
# ✓ 39 tests passed
```

## 构建验证

```bash
npm run build
# ✓ built in ~9.6s
```
