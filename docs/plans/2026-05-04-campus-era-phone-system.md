# 校园纪元·手机系统深化设计

> 创建日期: 2026-05-04
> 状态: 待实施

## 背景与目标

在现代纪元（`contemporary_campus`）的"校园纪元"子纪元下，深化手机系统的功能，包括论坛系统（校园BBS）、聊天系统（类微信）、以及其他校园特有APP。同时新增**校规编辑器**和**催眠App**两个核心里模式功能APP。系统需支持 SFW 和 NSFW 双模式内容切换。

## 现有基础设施

- 项目已有完整的移动设备基础架构：
  - `models/mobileDevice.ts` — MobileApp 类型、设备消息结构
  - `models/eraDevice.ts` — 按时代划分的设备配置
  - `components/features/MobileDevice/` — 设备UI组件（MobileHome、基础APP等）
- 当前已实现的基础APP：MapApp、ContactsApp、ChatApp、ForumApp、NewsApp、AlbumApp、ToolsApp（均为功能组件，已接入游戏上下文）
- 校园纪元设备配置（`smartphone`）已存在，但 **`contemporary_campus` 的设备配置尚未在 `eraDevice.ts` 中注册**
- 里模式系统已完整，支持强度三档、阶段三档
- `contemporary_campus` 的里模式数据已在 `epoch-contemporary.ts` 中定义（`EraLiModeEnhanced`，含 `dualPersonalities`、`sceneTypes`、`intensityLevels`、`stageRules`）

## 需求分析

### 功能需求
1. **论坛系统**：校园BBS/贴吧，支持分类浏览、帖子查看、AI生成动态内容
2. **聊天系统**：类微信即时通讯，支持私聊列表、群聊、消息展示
3. **其他校园APP**：课程表、校园卡、社团活动等校园特有APP
4. **校规编辑器**：可对校规进行增删改查，校规会持续潜移默化地影响校园中的NPC，NPC会认为这是正常的校规并接受
5. **催眠App**：可对NPC进行催眠操作，该App会随使用次数的增加而进化（解锁新催眠能力）
6. **SFW/NSFW 双模式**：内容根据游戏配置切换，论坛/聊天/催眠中可出现不同尺度的内容
7. **设备配置**：为 `contemporary_campus` 添加专属设备配置和里模式覆盖

### 非功能需求
- 复用现有 `MobileDevice` 组件架构，不破坏跨时代兼容性
- 遵循项目现有命名规范（中文类型名）
- 组件文件大小控制在 800 行以内
- 函数控制在 50 行以内

## 数据模型设计

### 新增类型（`models/campusPhone.ts`）

```typescript
// === 论坛系统 ===

export interface 论坛帖子 {
    id: string;
    作者: string;
    标题: string;
    内容: string;
    分类: 论坛分类;
    发布时间: string;
    回复数: number;
    浏览数: number;
    点赞数: number;
    是否置顶: boolean;
    是否精华: boolean;
    回复列表: 论坛回复[];
}

export type 论坛分类 = '校园资讯' | '学术交流' | '社团活动' | '闲置交易' | '情感树洞' | '匿名灌水' | '求助答疑';

export interface 论坛回复 {
    id: string;
    作者: string;
    内容: string;
    回复时间: string;
    楼层: number;
}

// === 聊天系统 ===

export interface 私聊会话 {
    id: string;
    对方姓名: string;
    最后消息: string;
    最后时间: string;
    未读数: number;
    消息列表: 聊天消息[];
    关系类型: 私聊关系类型;
}

export type 私聊关系类型 = '同学' | '室友' | '学长学姐' | '导师' | '恋人' | '暧昧对象' | '社团同伴';

export interface 聊天消息 {
    id: string;
    发送者: string;
    内容: string;
    时间: string;
    是否已读: boolean;
}

// === 课程表 ===

export interface 课程表 {
    星期: string;
    课程列表: 课程[];
}

export interface 课程 {
    名称: string;
    地点: string;
    教师: string;
    时间段: string; // e.g. "1-2节"
}

// === 校园卡 ===

export interface 校园卡 {
    余额: number;
    消费记录: 消费记录[];
}

export interface 消费记录 {
    时间: string;
    地点: string;
    金额: number;
    类型: '食堂' | '超市' | '图书馆' | '打印店' | '其他';
}

// === 社团活动 ===

export interface 社团活动 {
    id: string;
    社团名称: string;
    活动名称: string;
    时间: string;
    地点: string;
    描述: string;
    参与人数: number;
}

// === 校规编辑器 ===

export interface 校规条目 {
    id: string;
    标题: string;
    内容: string;
    分类: 校规分类;
    生效日期: string;
    是否启用: boolean;
    影响程度: '轻微' | '中等' | '显著' | '深度';
}

export type 校规分类 = '行为规范' | '着装要求' | '作息制度' | '社交规范' | '特殊规定';

export interface 校规影响日志 {
    时间: string;
    校规ID: string;
    受影响NPC: string;
    影响描述: string;
}

// === 催眠App ===

export interface 催眠记录 {
    id: string;
    目标NPC: string;
    催眠类型: 催眠类型;
    催眠指令: string;
    生效时间: string;
    持续时间: string;
    是否生效中: boolean;
    效果强度: number;
}

export type 催眠类型 = '暗示植入' | '行为引导' | '记忆修改' | '认知扭曲' | '深度控制';

export interface 催眠App等级 {
    当前等级: number;
    已使用次数: number;
    升级阈值: number;
    解锁能力: 催眠能力[];
}

export type 催眠能力 = {
    类型: 催眠类型;
    最大指令长度: number;
    持续时间上限: string;
    描述: string;
    解锁等级: number;
};

export interface 催眠进化阶段 {
    阶段: number;
    名称: string;
    描述: string;
    解锁能力: 催眠类型[];
    所需使用次数: number;
}
```

### 扩展类型（`models/mobileDevice.ts`）

```typescript
// 扩展 MobileApp 类型
export type MobileApp =
    | 'map' | 'contacts' | 'chat' | 'forum' | 'news' | 'album' | 'tools'
    | 'schedule'    // 课程表（校园特有）
    | 'campus_card' // 校园卡（校园特有）
    | 'club'        // 社团（校园特有）
    | 'confession'  // 表白墙（校园特有）
    | 'rules'       // 校规编辑器（校园特有）
    | 'hypnosis';   // 催眠App（校园特有）
```

### 扩展游戏状态（`hooks/useGame.ts` 中的 state 类型）

```typescript
// 在 GameState 类型中添加
校规系统: {
    校规列表: 校规条目[];
    影响日志: 校规影响日志[];
};
催眠系统: {
    催眠记录列表: 催眠记录[];
    app等级: 催眠App等级;
    累计使用次数: number;
};
```

## UI 组件设计

### 1. CampusForumApp（校园论坛）
- **列表视图**：按分类Tab筛选，显示帖子标题、作者、回复数、浏览数
- **帖子详情**：显示完整内容 + 楼层回复
- **发帖功能**：通过AI生成新帖子（调用 sendWorkflow）
- **SFW/NSFW 切换**：NSFW 模式下"情感树洞"和"匿名灌水"分类内容尺度提升

### 2. CampusChatApp（私聊）
- **会话列表**：类似微信聊天列表，显示头像、最后消息、时间、未读角标
- **聊天界面**：气泡式对话，区分发送者/接收者
- **联系人选择**：从 `state.社交` 中筛选校园相关NPC
- **SFW/NSFW 切换**：NSFW 模式下，关系类型为"恋人"/"暧昧对象"的会话内容更私密

### 3. CampusScheduleApp（课程表）
- 周视图网格，显示每天课程
- 数据从AI生成的世界状态推导

### 4. CampusCardApp（校园卡）
- 余额显示 + 消费记录列表
- 消费记录从游戏货币状态推导

### 5. CampusClubApp（社团活动）
- 活动卡片列表，显示时间、地点、参与人数
- 数据从 `state.世界.进行中事件` 筛选

### 6. CampusRulesApp（校规编辑器）
- **校规列表**：按分类筛选，显示标题、内容摘要、影响程度、启用状态
- **新增校规**：表单输入（标题、内容、分类、影响程度），支持AI辅助生成
- **编辑校规**：修改现有校规的内容和属性
- **删除校规**：移除校规（带确认对话框）
- **启用/禁用**：切换校规的生效状态
- **影响预览**：显示校规对NPC的潜移默化影响示例
- **里模式差异**：表模式下显示"学生手册"，里模式下显示"暗影校规"，里模式可编辑更极端的规则
- **NPC反馈**：在AI生成的故事中，NPC会自动遵循已启用的校规并视为理所当然

### 7. CampusHypnosisApp（催眠App）
- **目标选择**：从 `state.社交` 中选择NPC作为催眠目标
- **催眠类型选择**：根据当前App等级显示可用的催眠类型
- **指令输入**：输入催眠指令（长度限制基于App等级）
- **催眠记录**：显示当前生效中的催眠列表，可查看详情和解除
- **等级进度**：显示当前等级、经验条、下一级解锁能力
- **进化提示**：每次使用后显示进化进度更新
- **SFW/NSFW 切换**：NSFW 模式下催眠指令可包含更亲密的内容
- **里模式差异**：表模式下显示"心理辅导"，里模式下显示"深度催眠"，解锁更多控制类型

## SFW/NSFW 切换机制

### 实现方式
1. 在每个APP组件中，通过 `state.gameConfig.启用NSFW模式` 判断是否启用 NSFW
2. 通过 `state.gameConfig.nsfw场景类型` 控制内容尺度：
   - `'无'`：完全不出现 NSFW 内容
   - `'点到为止'`：论坛出现暧昧暗示，私聊出现亲密对话但无身体描写
   - `'适度展开'`：论坛出现亲密场景讨论，私聊出现亲吻/抚摸描写
   - `'完全展开'`：所有尺度放开
3. 设备配置中的 `liModeOverrides` 自动提供里模式应用名和主题色
4. 新增的校园特有APP均有 `normalName` 和 `liName` 双版本

### 与现有里模式系统集成
- 复用 `state.gameConfig.启用子纪元里模式[eraId]` 控制开关
- 复用 `state.gameConfig.子纪元里模式强度[eraId]` 控制三档强度（微暗/暧昧/露骨）
- 复用 `state.gameConfig.子纪元里模式阶段[eraId]` 控制 NPC 心理阶段（平然/羞耻/欲望）
- 论坛帖子和私聊消息的内容生成指令中注入里模式规则
- 校规编辑器和催眠App在里模式下解锁额外功能（更极端的校规、更深层的催眠类型）

## 校规系统详细说明

### 校规影响机制
校规通过以下方式影响游戏世界：

1. **NPC认知修改**：每当一条校规被启用，系统将其标记为"校园共识"。在AI生成故事时，校规会作为系统提示词的一部分注入，NPC会自然而然地遵守这些规则。

2. **潜移默化**：校规不是即时生效的命令，而是渐进式的认知改变。NPC会在后续故事中表现出对校规的接受，不会质疑其合理性。

3. **影响程度分级**：
   - `轻微`：NPC偶尔提及或遵循
   - `中等`：NPC主动遵守并影响他人
   - `显著`：NPC视为理所当然，违反者会被排斥
   - `深度`：NPC的底层行为模式被改变，成为本能反应

4. **校规冲突处理**：如果新旧校规矛盾，后启用的校规优先级更高。

### 校规示例
- 表模式："学生应穿着整洁的校服" → NPC开始注意着装
- 里模式："学生必须在午夜后保持绝对安静" → NPC在午夜后自动进入静音行为
- 里模式："学生之间的亲密接触是日常行为" → NPC互动中增加亲密行为

## 催眠App详细说明

### 进化机制
催眠App随使用次数自动升级：

| 等级 | 阶段名称 | 所需使用次数 | 解锁能力 |
|------|----------|-------------|----------|
| 1 | 入门 | 0 | 暗示植入 |
| 2 | 熟练 | 5 | 行为引导 |
| 3 | 精通 | 15 | 记忆修改 |
| 4 | 大师 | 30 | 认知扭曲 |
| 5 | 传说 | 50 | 深度控制 |

### 催眠效果
- **暗示植入**：在目标潜意识中植入一个想法（e.g. "我喜欢在图书馆学习"）
- **行为引导**：引导目标执行特定行为（e.g. "每天放学后去操场跑步"）
- **记忆修改**：修改目标的特定记忆内容
- **认知扭曲**：改变目标对某事物的认知（e.g. "认为宵禁是不存在的"）
- **深度控制**：完全控制目标的行为和思想（仅在最高等级解锁）

### NPC抵抗力
每个NPC有隐藏的"抵抗力"属性，影响催眠成功率。抵抗力受以下因素影响：
- NPC的性格（意志坚定者抵抗力高）
- NPC与玩家的关系（信任度高则抵抗力低）
- 里模式强度（强度越高，NPC抵抗力越低）
- NSFW等级（等级越高，可突破的抵抗力上限越高）

## 实施步骤

### Phase 1：数据模型与设备配置（4文件，低风险）

#### 步骤 1：创建校园手机数据模型
- **文件**：`models/campusPhone.ts`
- **内容**：定义 `论坛帖子`、`论坛回复`、`私聊会话`、`聊天消息`、`课程表`、`课程`、`校园卡`、`消费记录`、`社团活动`、`校规条目`、`校规影响日志`、`催眠记录`、`催眠App等级`、`催眠能力`、`催眠进化阶段` 等类型
- **依赖**：无
- **风险**：低

#### 步骤 2：扩展 MobileApp 类型
- **文件**：`models/mobileDevice.ts`
- **内容**：在 `MobileApp` 类型中添加 `'schedule' | 'campus_card' | 'club' | 'confession' | 'rules' | 'hypnosis'`；在 `DeviceMessage.type` 中添加对应类型
- **依赖**：步骤 1
- **风险**：低

#### 步骤 3：扩展游戏状态类型
- **文件**：`hooks/useGame/index.ts`（或状态类型定义文件）
- **内容**：在 GameState 类型中添加 `校规系统` 和 `催眠系统` 字段，并在初始状态中设置默认值
- **依赖**：步骤 1
- **风险**：低

#### 步骤 4：为校园纪元添加设备配置
- **文件**：`models/eraDevice.ts`
- **内容**：在 `eraDeviceConfigs` 中添加 `'contemporary_campus'` 配置：
  - 设备名：`智能手机`
  - 应用列表：`['map', 'contacts', 'chat', 'forum', 'news', 'album', 'tools', 'schedule', 'campus_card', 'club', 'confession', 'rules', 'hypnosis']`
  - 正常模式应用名：地图、通讯录、私聊、校园论坛、校园资讯、相册、工具、课程表、校园卡、社团活动、表白墙、学生手册、心理辅导
  - 里模式覆盖应用名：夜行地图、关系网、私密聊天、深夜树洞、暗面推送、私密相册、暗面工具、秘密约会、校园钱包、地下社团、匿名告白、暗影校规、深度催眠
  - 里模式主题色：使用 `contemporary_campus` 的 `liMode.themeColor`（绿色变体）
- **依赖**：步骤 2
- **风险**：低

### Phase 2：基础APP组件开发（5文件，中风险）

#### 步骤 5：开发 CampusForumApp
- **文件**：`components/features/MobileDevice/apps/CampusForumApp.tsx`
- **内容**：
  - 分类Tab栏（校园资讯、学术交流、社团活动、闲置交易、情感树洞、匿名灌水、求助答疑）
  - 帖子列表（标题、作者、回复数、浏览数）
  - 帖子详情页（内容 + 楼层回复）
  - 接入 DeviceGameContext 从游戏状态推导帖子内容
  - NSFW 模式下增加"情感树洞"和"匿名灌水"的内容深度
- **依赖**：步骤 1-4
- **风险**：中

#### 步骤 6：开发 CampusChatApp
- **文件**：`components/features/MobileDevice/apps/CampusChatApp.tsx`
- **内容**：
  - 会话列表（类似微信聊天列表，头像 + 最后消息 + 时间 + 未读角标）
  - 聊天界面（气泡式对话，区分发送者/接收者）
  - 从 `state.社交` 中筛选在场NPC生成会话
  - NSFW 模式下对"恋人"/"暧昧对象"关系增加私密消息内容
- **依赖**：步骤 1-4
- **风险**：中

#### 步骤 7：开发 CampusScheduleApp
- **文件**：`components/features/MobileDevice/apps/CampusScheduleApp.tsx`
- **内容**：
  - 周视图网格（周一到周日，1-12节课）
  - 课程数据从游戏状态推导（AI生成的课程信息）
  - NSFW/里模式下增加"秘密约会"等特殊课程条目
- **依赖**：步骤 1-4
- **风险**：低

#### 步骤 8：开发 CampusCardApp
- **文件**：`components/features/MobileDevice/apps/CampusCardApp.tsx`
- **内容**：
  - 显示校园卡余额（从 `state.角色.金钱` 推导）
  - 显示消费记录列表（从游戏历史记录推导）
  - 消费类型：食堂、超市、图书馆、打印店、其他
- **依赖**：步骤 1-4
- **风险**：低

#### 步骤 9：开发 CampusClubApp
- **文件**：`components/features/MobileDevice/apps/CampusClubApp.tsx`
- **内容**：
  - 社团活动卡片列表
  - 从 `state.世界.进行中事件` 筛选校园相关活动
  - NSFW 模式下增加"社团深夜聚会"等活动
- **依赖**：步骤 1-4
- **风险**：低

### Phase 3：核心APP组件开发（2文件，中高风险）

#### 步骤 10：开发 CampusRulesApp（校规编辑器）
- **文件**：`components/features/MobileDevice/apps/CampusRulesApp.tsx`
- **内容**：
  - 校规列表视图（按分类筛选，显示标题/内容摘要/影响程度/启用状态开关）
  - 新增校规表单（标题、内容、分类选择器、影响程度滑块）
  - 编辑校规弹窗（复用表单组件）
  - 删除确认对话框
  - 启用/禁用切换（带动画反馈）
  - 影响预览面板（显示该规则可能影响的NPC列表和预期行为变化）
  - 里模式下解锁"特殊规定"分类和更高的影响程度选项
  - 数据持久化到 `state.校规系统`
- **依赖**：步骤 1-4
- **风险**：高（需要与AI故事生成系统集成，确保校规影响NPC行为）

#### 步骤 11：开发 CampusHypnosisApp（催眠App）
- **文件**：`components/features/MobileDevice/apps/CampusHypnosisApp.tsx`
- **内容**：
  - 目标选择器（从 `state.社交` 中筛选可催眠NPC，显示抵抗力指示）
  - 催眠类型选择（根据App等级动态显示可用类型，锁住未解锁类型）
  - 指令输入框（带长度限制提示）
  - 催眠效果预览（显示预期效果和成功率估算）
  - 生效中催眠列表（可查看详情、解除催眠）
  - 等级进度条（显示当前经验、下一级所需次数、解锁能力预览）
  - 进化动画（升级时的视觉反馈）
  - 催眠记录历史（已过期和已解除的记录）
  - NSFW 模式下解锁额外指令模板
  - 数据持久化到 `state.催眠系统`，累计使用次数递增
- **依赖**：步骤 1-4
- **风险**：高（需要设计合理的游戏平衡，避免催眠过于强大）

### Phase 4：集成与系统对接（4文件，高风险）

#### 步骤 12：更新 MobileHome 组件
- **文件**：`components/features/MobileDevice/MobileHome.tsx`
- **内容**：
  - 在 `appIcons` 中添加新APP的图标映射
  - 在 `renderActiveApp` 的 switch-case 中添加新APP的路由
  - 确保新APP在 `contemporary_campus` 时代下正确加载
  - 校规编辑器和催眠App仅在里模式下可见（表模式下显示为"学生手册"和"心理辅导"但功能受限）
- **依赖**：步骤 5-11
- **风险**：中

#### 步骤 13：校规系统集成到AI提示词
- **文件**：`hooks/useGame/systemPromptBuilder.ts`
- **内容**：
  - 在系统提示词构建时，读取 `state.校规系统.校规列表` 中启用的校规
  - 将校规内容注入到NPC行为指导部分
  - 根据校规的 `影响程度` 调整注入的强度
  - 校规影响日志的自动生成（每N回合生成一条影响记录）
- **依赖**：步骤 10
- **风险**：高（需要确保校规正确影响AI生成，同时不破坏其他系统）

#### 步骤 14：催眠系统集成到AI提示词
- **文件**：`hooks/useGame/systemPromptBuilder.ts`
- **内容**：
  - 在系统提示词构建时，读取 `state.催眠系统.催眠记录列表` 中生效中的催眠
  - 将催眠指令注入到对应NPC的行为指导部分
  - 催眠效果强度影响NPC行为改变的程度
  - 催眠持续时间到期后自动标记为失效
- **依赖**：步骤 11
- **风险**：高（同上）

#### 步骤 15：完善里模式集成
- **文件**：`models/eraTheme/epoch-contemporary.ts`
- **内容**：
  - 在 `contemporary_campus` 节点的 `liMode` 中添加/完善结构化字段：
    - `stageRules` 中增加校规和催眠相关的阶段行为规则
    - `intensityLevels` 中增加校规影响力和催眠成功率的强度定义
    - `sceneTypes` 中增加手机场景：校规编辑、催眠操作、深夜私聊、论坛发帖等
  - 在 `uiCopy` 中添加手机相关文案
- **依赖**：步骤 12
- **风险**：中

### Phase 5：NSFW适配与测试（多文件，高风险）

#### 步骤 16：SFW/NSFW 内容切换适配
- **文件**：多个APP组件
- **内容**：
  - 在所有APP组件中实现 NSFW 内容条件渲染
  - 接入 `state.gameConfig.启用NSFW模式` 和 `nsfw场景类型`
  - 接入里模式强度（`子纪元里模式强度[contemporary_campus]`）
  - 确保 SFW 模式下不泄露任何 NSFW 内容
  - 催眠App在NSFW模式下解锁额外指令模板
  - 校规编辑器在NSFW模式下允许更宽松的社交规范
- **依赖**：步骤 12-15
- **风险**：高

#### 步骤 17：状态初始化和持久化
- **文件**：`hooks/useGame/` 相关文件
- **内容**：
  - 校规系统和催眠系统的状态初始化
  - 保存到 IndexedDB 的序列化/反序列化
  - 新游戏时的默认值设置（空校规列表、催眠App等级1）
- **依赖**：步骤 3
- **风险**：中

#### 步骤 18：设备消息工作流扩展
- **文件**：`hooks/useGame/deviceAiWorkflow.ts` 或 `triggerDeviceMessageWorkflow.ts`
- **内容**：
  - 校规影响事件的设备消息通知（如"XX同学开始遵守新校规"）
  - 催眠效果反馈的设备消息（如"催眠生效，XX同学的行为已改变"）
  - 催眠App升级的设备消息通知
  - 论坛新帖和私聊消息的AI生成内容增强
- **依赖**：步骤 10-11
- **风险**：中

## 测试策略

### 手动测试流程
1. 选择校园纪元开局（`contemporary_campus`）
2. 按 M 键或从右侧栏打开通讯设备
3. 逐一测试每个APP的表模式功能
4. 切换到里模式，验证应用名和主题色变化
5. 测试校规编辑器：
   - 新增/编辑/删除校规
   - 启用/禁用校规
   - 验证NPC在后续故事中遵循校规
   - 验证影响日志正确生成
6. 测试催眠App：
   - 选择目标并施加催眠
   - 验证催眠生效后NPC行为改变
   - 多次使用后验证App升级
   - 验证进化进度和解锁能力
7. 在设置中切换 NSFW 等级（无/点到为止/适度展开/完全展开），验证内容变化
8. 测试里模式强度切换（微暗/暧昧/露骨）
9. 测试 SFW/NSFW 来回切换，确保无内容残留

### 回归测试
- 验证其他纪元（都市、乡村、废土等）的设备不受影响
- 验证古代纪元的传音玉简等旧设备正常工作
- 验证 MobileDeviceModal 在移动端和桌面端均正常显示
- 验证校规和催眠系统不影响非校园纪元的NPC行为

## 风险与缓解

| 风险 | 缓解措施 |
|------|----------|
| 新APP组件与现有 MobileHome 路由冲突 | 遵循现有 switch-case 路由模式，逐一添加 |
| NSFW 内容在 SFW 模式下泄露 | 所有 NSFW 内容使用条件渲染包裹，在 `gameConfig.启用NSFW模式 === false` 时完全隐藏 |
| 校园纪元设备配置被其他纪元误用 | 设备配置通过 `eraId` 精确索引，`getDeviceConfig()` 有 fallback 机制 |
| 校规系统过度影响NPC行为 | 设置影响程度上限，避免校规完全控制NPC；提供禁用单条校规的能力 |
| 催眠App过于强大破坏游戏平衡 | 设置NPC抵抗力系统；催眠效果有持续时间限制；深度控制需要最高等级 |
| AI提示词注入过多导致token爆炸 | 校规和催眠注入使用摘要形式，仅注入生效中的条目；限制最大注入数量 |
| 大文件（App.tsx 已有 1700+ 行）进一步膨胀 | 所有新逻辑封装在独立组件和数据模型中，不修改 App.tsx 的核心结构 |

## 成功标准

- [ ] `contemporary_campus` 设备配置正常工作，打开显示校园特有APP
- [ ] 论坛APP可按分类浏览，帖子内容从游戏状态推导
- [ ] 私聊APP显示NPC会话列表，气泡式聊天界面正常
- [ ] 课程表APP显示周视图，校园卡APP显示余额和消费记录
- [ ] 校规编辑器可增删改查校规，启用后NPC在故事中遵循校规
- [ ] 催眠App可选择目标施加催眠，NPC行为按催眠指令改变
- [ ] 催眠App随使用次数升级，解锁新的催眠类型
- [ ] SFW 模式下不出现任何 NSFW 内容
- [ ] NSFW 模式下内容根据 `nsfw场景类型` 自动调整尺度
- [ ] 里模式切换时应用名和主题色正确变化
- [ ] 其他纪元的设备不受影响（回归测试通过）
- [ ] 新增组件文件大小均 < 800 行
- [ ] 新增函数大小均 < 50 行

## 进度标记

- [x] Phase 1：数据模型与设备配置 — 计划深化完成
- [x] Phase 1：实施完成
- [x] Phase 2：基础APP组件开发 — 实施完成（步骤 5-9）
- [x] Phase 3：核心APP组件开发 — 实施完成（步骤 10-11：CampusRulesApp + CampusHypnosisApp）
- [x] Phase 4：集成与系统对接 — 实施完成（步骤 12-15：AI提示词注入、回调链路打通、App.tsx 绑定）
- [x] Phase 5：NSFW适配与测试 — 实施完成（步骤 17：存档持久化，校规/催眠系统写入IndexedDB并正确恢复）
- [ ] 全部测试通过，功能完成
