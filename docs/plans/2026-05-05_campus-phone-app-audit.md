# 校园时代手机应用审计报告

## 背景与目标

校园时代（`contemporary_campus`）手机系统包含 14 个应用，涉及多个子系统（论坛、私聊、课程表、校园卡、社团、校规、催眠、BDSM深夜板块等）。本次分析旨在检查各应用是否能正常运行，并修复发现的问题。

## 涉及模块

| 模块 | 文件 | 作用 |
|------|------|------|
| 设备配置 | `models/eraDevice.ts` | 定义 14 个校园应用的注册、名称映射 |
| 设备状态 | `models/mobileDevice.ts` | DeviceState、DeviceGameContext 等核心类型 |
| 校园数据模型 | `models/campusPhone.ts` | 论坛、课程、校园卡、社团、催眠等类型定义 |
| 主界面 | `components/features/MobileDevice/MobileHome.tsx` | 应用网格渲染 + 路由分发 |
| 校园论坛 | `components/features/MobileDevice/apps/CampusForumApp.tsx` | 普通论坛 + BDSM 深夜板块 |
| 校园私聊 | `components/features/MobileDevice/apps/CampusChatApp.tsx` | NPC 1v1 聊天 |
| 课程表 | `components/features/MobileDevice/apps/CampusScheduleApp.tsx` | 周课表网格 |
| 校园卡 | `components/features/MobileDevice/apps/CampusCardApp.tsx` | 余额 + 消费记录 |
| 社团活动 | `components/features/MobileDevice/apps/CampusClubApp.tsx` | 活动列表 |
| 校规编辑器 | `components/features/MobileDevice/apps/CampusRulesApp.tsx` | CRUD 校规 |
| 催眠App | `components/features/MobileDevice/apps/CampusHypnosisApp.tsx` | 5阶段进化 + NPC 控制 |
| AI工作流 | `hooks/useGame/deviceAiWorkflow.ts` | AI 生成各应用内容 |
| 论坛刷新 | `hooks/useGame/campusForumWorkflow.ts` | AI 刷新论坛帖子 |
| 响应处理 | `hooks/useGame/responseCommandProcessor.ts` | AI 响应 → 校园系统状态更新 |
| 游戏状态 | `hooks/useGameState.ts` | 校园系统 state 初始化 |

## 14 个应用清单

| # | App ID | 正常模式 | 里模式 | 组件 | 状态 |
|---|--------|---------|--------|------|------|
| 1 | `map` | 地图 | 夜行地图 | MapApp（共享） | 正常 |
| 2 | `contacts` | 通讯录 | 关系网 | ContactsApp（共享） | 正常 |
| 3 | `chat` | 私聊 | 私密聊天 | CampusChatApp | 需修复 |
| 4 | `forum` | 校园论坛 | 深夜树洞 | CampusForumApp | 需修复 |
| 5 | `news` | 校园资讯 | 暗面推送 | NewsApp（共享） | 正常 |
| 6 | `album` | 相册 | 私密相册 | AlbumApp（共享） | 正常 |
| 7 | `tools` | 工具 | 暗面工具 | ToolsApp（共享） | 正常 |
| 8 | `schedule` | 课程表 | 秘密约会 | CampusScheduleApp | 需修复 |
| 9 | `campus_card` | 校园卡 | 校园钱包 | CampusCardApp | 需修复 |
| 10 | `club` | 社团活动 | 地下社团 | CampusClubApp | 需修复 |
| 11 | `confession` | 表白墙 | 匿名告白 | CampusForumApp（复用） | 需修复 |
| 12 | `rules` | 学生手册 | 暗影校规 | CampusRulesApp | 需修复 |
| 13 | `hypnosis` | 心理辅导 | 深度催眠 | CampusHypnosisApp | 需修复 |
| 14 | `bdsn` | 深夜板块 | 禁忌论坛 | CampusForumApp（复用） | 需修复 |

## 发现的问题

### 问题 1：校园应用数据源依赖链断裂

**严重级别：HIGH**

校园专属应用（chat、forum、schedule、campus_card、club、confession、rules、hypnosis、bdsn）的数据来自 `gameContext.校园系统`，但 `规范化校园系统` 的实现仅为 `(raw) => 深拷贝(raw || {})` —— **没有字段级的规范化校验**。

这意味着如果 AI 返回的校园数据结构缺失关键字段（如 `校园系统.课程表` 为 `undefined`），前端组件只会显示"暂无数据"，但不会报错崩溃。当前表现为**静默降级**，功能可用但体验差。

**修复方案：**
- 增加 `规范化校园系统` 函数的字段校验，确保返回的结构包含所有必需字段（`论坛帖子List:[]`、`私聊会话列表:[]`、`课程表:{}`、`校园卡:{余额:0,消费记录:[]}`、`社团活动列表:[]`）
- 在 `hooks/useGameState.ts` 的初始化中已经提供了默认值，问题在于 AI 响应更新时可能覆盖为不完整结构

### 问题 2：CampusChatApp 未使用校园系统的私聊数据

**严重级别：MEDIUM**

`CampusChatApp` 直接从 `gameContext.社交` 和 `gameContext.历史记录` 生成会话列表，**完全忽略了 `gameContext.校园系统.私聊会话列表`**。这意味着校园专属的私聊系统（包含关系类型映射、AI生成的私聊消息）没有被使用。

**修复方案：**
- 优先读取 `gameContext.校园系统.私聊会话列表`
- 如果为空，回退到当前基于 `gameContext.社交` 的行为（保持兼容）

### 问题 3：课程表数据结构不一致

**严重级别：MEDIUM**

`models/campusPhone.ts` 定义了两种课程相关类型：
- `课程表` 接口：`{ 星期: string; 课程列表: 课程[] }` —— 未被使用
- `校园系统数据.课程表`：`Record<string, 课程[]>` —— 实际使用的格式

`CampusScheduleApp` 读取的是 `Record<string, 课程[]>` 格式，但 `解析AI课程表` 返回的也是 `Record<string, 课程[]>`。虽然当前能工作，但 `课程表` 接口是死代码。

**修复方案：**
- 删除未使用的 `课程表` 接口定义，或统一使用它

### 问题 4：表白墙（confession）与论坛（forum）共用组件但未区分

**严重级别：LOW**

`confession` 和 `forum` 都渲染 `CampusForumApp`，但 `CampusForumApp` 没有根据 `appId` 区分数据源。表白墙应该显示表白墙专属内容，而不是校园论坛帖子。

**修复方案：**
- `CampusForumApp` 根据 `appId` 切换数据源：
  - `forum` → 读取 `校园系统.论坛帖子列表`
  - `confession` → 读取 `校园系统.表白墙帖子列表`（需要在模型中新增此字段）
  - `bdsn` → 读取 `校园系统.BDSM帖子列表`

### 问题 5：校规系统独立于校园系统

**严重级别：LOW**

`校规系统` 和 `催眠系统` 是独立的游戏状态（`hooks/useGameState.ts` 中的 `useState`），不属于 `校园系统` 对象。但 `DeviceGameContext` 中它们作为独立字段传递。这种设计本身没问题，但导致 `校园系统数据` 模型中缺少校规和催眠字段，数据模型不够内聚。

**修复方案：** 暂不修改，当前架构可工作。

### 问题 6：设备消息生成未写入校园系统

**严重级别：HIGH**

`campusForumWorkflow.ts` 中的 `刷新校园论坛` 函数生成了论坛帖子和BDSM帖子，但**返回的是简化信息（id、标题、分类）**，没有将完整帖子数据写回 `校园系统`。这意味着 AI 刷新后，数据不会持久化到校园系统中。

**修复方案：**
- `刷新校园论坛` 应返回完整的帖子数据结构
- 在调用方（useGame.ts 中的刷新处理）将完整数据写入 `校园系统`

### 问题 7：CampusForumApp 的论坛分类列表不完整

**严重级别：LOW**

`CampusForumApp` 第 20 行定义了 `论坛分类 = ['全部', '校园资讯', '学术交流', '社团活动', '情感树洞', '匿名灌水', '求助答疑']`，但 `models/campusPhone.ts` 中的 `论坛分类` 类型包含 `'BDSM'` 等更多分类。筛选列表与类型定义不一致。

**修复方案：**
- 将 `论坛分类` 数组与类型定义对齐，或使用类型推导

### 问题 8：HypnosisApp 类型导入路径问题

**严重级别：MEDIUM**

`CampusHypnosisApp.tsx` 第 4 行导入了 `催眠进化阶段表` 从 `models/campusPhone.ts`，但第 5 行又从 `types` 导入了 `催眠记录`、`催眠App等级`、`催眠类型`。这两个文件都定义了部分催眠相关类型，存在重复定义风险。

**修复方案：**
- 统一催眠类型到一个文件（建议 `models/campusPhone.ts`），`types` 中的旧定义标记为 deprecated

## 实施步骤

### Phase 1：修复数据源规范（HIGH 优先级）
- [ ] 增强 `规范化校园系统` 函数，确保返回完整默认结构
- [ ] 修复 `刷新校园论坛`，返回完整帖子数据并写入校园系统

### Phase 2：修复私聊数据源（MEDIUM 优先级）
- [ ] `CampusChatApp` 优先使用 `校园系统.私聊会话列表`

### Phase 3：清理类型定义（MEDIUM 优先级）
- [ ] 统一课程表类型定义
- [ ] 统一催眠类型定义来源

### Phase 4：功能增强（LOW 优先级）
- [ ] `CampusForumApp` 区分 forum/confession/bdsn 数据源
- [ ] `CampusForumApp` 论坛分类列表与类型对齐

## 风险评估

- **LOW**：所有修复都是前端数据流和类型层面的，不涉及架构变更
- **依赖**：需要确保修改后的数据结构与 AI 提示词输出格式一致
- **回退方案**：每个修复都保持向后兼容（优先读取新字段，缺失时回退旧行为）

## 估计工作量

- Phase 1：30 分钟
- Phase 2：15 分钟
- Phase 3：20 分钟
- Phase 4：30 分钟
- 总计：约 1.5 小时
