# 手机通讯工具深化计划

> 创建日期：2026-05-03
> 状态：待审核
> 关联文件：`mobile-device-li-mode-plan.md`（已完成的里模式计划）

---

## 1. 需求分析

### 1.1 现状

手机/通讯工具功能已在项目中完成基础实现，包含：

- **跨时代设备外壳**：37+ 时代配置（玉简、电报机、智能手机、数据终端等）
- **7 个内置应用**：地图、通讯录、群聊、论坛、资讯、相册、工具
- **正常/里模式**：应用名称和主题色随模式变化（里模式开关需从设备界面移至游戏设置）
- **AI 生成工作流**（`deviceAiWorkflow.ts`）：系统提示词构建、JSON 输出解析
- **`DeviceGameContext`**：从主游戏状态传递角色、社交、世界、剧情、历史记录的子集

### 1.2 核心问题

当前手机功能是一个"信息展示面板"——数据从已有游戏状态中单向推导，没有与游戏正文及变量系统产生双向联动。具体表现为：

| 维度 | 问题 |
|------|------|
| **入口** | `openDevice` 存在但无 UI 触发按钮，功能对用户不可见 |
| **里模式位置** | 里模式切换开关在通讯工具界面内，应移至游戏设置统一管理 |
| **正文联动** | 手机内容不是剧情生成的一部分，AI 不会在正文中提到手机/通讯 |
| **变量关联** | 无手机使用统计、通讯频率、关系变化等变量追踪 |
| **消息持久化** | 无 `DeviceMessage` 存储，消息不跨回合保留 |
| **AI 工作流** | `deviceAiWorkflow.ts` 已写好但未被任何 UI 组件调用 |
| **存档/加载** | 设备状态不在存档中，开关状态和模式不跨 session 保留 |
| **通知系统** | 无未读消息、来电提醒、推送通知等机制 |
| **单人通讯** | ChatApp 只有群聊，无 1v1 私聊/短信 |

### 1.3 优化目标

1. **里模式开关迁移**：从通讯工具界面移至游戏设置
2. **让手机可见可用**：添加 UI 入口
3. **让手机参与正文叙事**：AI 在生成剧情时引用手机通讯内容
4. **让手机记录变量**：追踪通讯行为，影响好感度、情报获取等游戏机制
5. **让消息持久化**：跨回合保存消息历史
6. **让 AI 工作流真正工作**：打通 AI → UI 管道

---

## 2. 架构设计

### 2.1 整体数据流

```
游戏回合结束 ──▶ 触发设备事件 ──▶ AI 生成消息 ──▶ 持久化到 IndexedDB
      ▲                                              │
      │                                              ▼
系统提示词注入 ◀── 手机通讯摘要 ◀── 读取最近消息 ──▶ 更新游戏变量
```

### 2.2 里模式派生规则

`DeviceState.mode` 不再由用户界面切换，改为从 `gameConfig.启用子纪元里模式[eraId]` 自动推导：

- `gameConfig.启用子纪元里模式[eraId] === true` → `mode = 'li'`
- `gameConfig.启用子纪元里模式[eraId] === false` → `mode = 'normal'`
- 未设置（undefined）→ 默认 `mode = 'normal'`

### 2.3 新增状态结构

在 `models/mobileDevice.ts` 中扩展：

```typescript
// 设备通讯统计
export interface DeviceStats {
    totalMessagesSent: number;
    totalMessagesReceived: number;
    lastUsedTimestamp: number;
    activeContacts: string[];
    missedNotifications: number;
}

interface DeviceState {
    isOpen: boolean;
    activeApp: MobileApp | null;
    mode: DeviceMode;               // 派生自 gameConfig.启用子纪元里模式[eraId]
    messages: DeviceMessage[];
    stats: DeviceStats;
    notifications: Notification[];
}

export interface Notification {
    id: string;
    type: 'incoming_message' | 'missed_call' | 'news_push' | 'forum_reply' | 'system_alert';
    title: string;
    body: string;
    timestamp: number;
    read: boolean;
    relatedMessageId?: string;
}
```

### 2.4 消息持久化方案

在 `services/dbService.ts` 中新增 `device_messages` 对象存储，支持消息的增删改查。

### 2.5 游戏变量关联

在 `models/domain/` 下新增 `deviceVariables.ts`，定义通讯行为到游戏变量的映射（好感度修正、情报获取、能源消耗等）。

---

## 3. 实施阶段

### Phase 1: 里模式开关迁移（从通讯工具移至游戏设置）

**复杂度：低 | 预估工时：1-2h**

#### Step 1.1: 从通讯工具界面移除里模式开关

- 从 `MobileHome.tsx` 中移除 `ModeToggle` 组件渲染
- 从 `MobileDeviceModal.tsx` 中移除 `onModeToggle` 回调和 `liModeGlobalEnabled` prop
- `DeviceState.mode` 不再由用户界面切换，改为从 `gameConfig.启用子纪元里模式[eraId]` 自动推导
- 删除 `actions.toggleDeviceMode`

#### Step 1.2: 在设置面板中添加里模式开关

- 在 `SettingsModal.tsx` 的世界/时代设置区域新增 **子纪元里模式** per-era 开关
- 与现有 `启用里武侠模式`、`启用里志怪模式` 风格统一
- 开关值写入 `gameConfig.启用子纪元里模式[eraId]`（已有数据结构，无需新增字段）
- 新游戏向导中已有此开关，保持不变

#### Step 1.3: 模式推导逻辑统一

- 设备打开时，mode 根据 `gameConfig.启用子纪元里模式[eraId]` 自动设定
- `DeviceState.mode` 改为只读派生状态
- `ModeToggle.tsx` 组件从设备界面中移除（文件可保留供设置面板复用）

涉及文件：
- `components/features/MobileDevice/MobileHome.tsx` — 移除 ModeToggle
- `components/features/MobileDevice/MobileDeviceModal.tsx` — 移除 mode toggle props
- `components/features/SettingsModal.tsx` — 新增 per-era 里模式开关 UI
- `hooks/useGame.ts` — 删除 toggleDeviceMode，mode 改为派生
- `hooks/useGameState.ts` — mode 派生逻辑
- `App.tsx` — 移除 onModeToggle 传递

---

### Phase 2: 基础设施（UI 入口 + 消息持久化）

**复杂度：中 | 预估工时：4-6h**

#### Step 2.1: 添加 UI 入口

- 在 `RightPanel.tsx` 桌面端的快捷操作栏添加手机图标按钮
- 在 `MobileQuickMenu.tsx` 底部导航栏添加手机图标按钮
- 点击调用 `actions.openDevice`
- 设备图标使用 era 适配的 icon

涉及文件：
- `components/layout/RightPanel.tsx`
- `components/layout/MobileQuickMenu.tsx`

#### Step 2.2: 消息持久化

- 在 `dbService.ts` 新增 `DeviceMessage` 的 IndexedDB 读写方法
- 在存档/加载流程中包含设备消息数据

涉及文件：
- `services/dbService.ts`
- `hooks/useGame/saveCoordinator.ts`

#### Step 2.3: DeviceState 扩展

- 新增 `DeviceStats` 和 `Notification` 类型
- 在存档中包含设备状态

涉及文件：
- `models/mobileDevice.ts`
- `hooks/useGame/mobileDeviceWorkflow.ts`
- `hooks/useGameState.ts`

---

### Phase 3: AI 工作流激活

**复杂度：中 | 预估工时：4-6h**

#### Step 3.1: 回合结束时自动生成设备消息

- 在 `sendWorkflow.ts` 回合处理末尾触发设备消息生成
- 调用 `deviceAiWorkflow.ts` 的 `生成设备消息`，传入当前游戏上下文
- 根据 era 决定生成哪些 app 的内容
- 消息持久化到 IndexedDB

#### Step 3.2: 消息通知系统

- 新生成的消息产生 `Notification` 对象
- 在 UI 中显示通知角标（手机图标上的红点数字）
- 点击通知跳转到对应 app 和消息

#### Step 3.3: 联系人/AI 生成打通

- `ContactsApp` 数据不足时调用 `生成设备联系人` 补充
- `ChatApp` 群聊为空时调用 `生成设备群组` 补充

涉及文件：
- `hooks/useGame/sendWorkflow.ts`
- `hooks/useGame/deviceAiWorkflow.ts`
- `components/features/MobileDevice/MobileHome.tsx`
- `components/features/MobileDevice/apps/ContactsApp.tsx`
- `components/features/MobileDevice/apps/ChatApp.tsx`

---

### Phase 4: 正文联动

**复杂度：高 | 预估工时：6-8h**

#### Step 4.1: 系统提示词注入设备通讯摘要

- 新增 `构建设备通讯摘要` 函数
- 回合内有未读/新消息时，将摘要注入系统提示词
- 让 AI 在正文中引用"收到飞鸽传书"、"数据终端推送消息"等内容

#### Step 4.2: 通讯行为影响游戏变量

- 查看手机消息消耗精力（不同时代消耗不同）
- 频繁通讯的 NPC 提升基础好感度
- 收到情报类消息可能提前解锁剧情线索

#### Step 4.3: 特殊通讯场景

- **紧急通讯**：战斗中收到求援消息
- **深夜推送**：里模式下收到匿名情报
- **跨时代差异**：古代设备消息延迟，现代即时

涉及文件：
- `hooks/useGame/systemPromptBuilder.ts`
- `hooks/useGame/sendWorkflow.ts`
- `hooks/useGame/deviceAiWorkflow.ts`
- `hooks/useGame.ts`
- `models/domain/deviceVariables.ts`（新建）

---

### Phase 5: 深化功能（1v1 私聊 + 相册连接）

**复杂度：中 | 预估工时：4-5h**

#### Step 5.1: 1v1 私聊

- 从 `ContactsApp` 可发起私聊
- 私聊消息独立于群聊持久化
- AI 生成私聊回复

#### Step 5.2: 相册连接图片资产系统

- `AlbumApp` 改为读取 `state.历史记录` 中的 AI 生图结果
- 按时间/场景分类展示

涉及文件：
- `models/mobileDevice.ts`
- `components/features/MobileDevice/apps/PrivateChatApp.tsx`（新建）
- `components/features/MobileDevice/apps/ContactsApp.tsx`
- `components/features/MobileDevice/apps/AlbumApp.tsx`
- `hooks/useGame/deviceAiWorkflow.ts`

---

### Phase 6: 测试与验收

**复杂度：低 | 预估工时：2-3h**

- 验证各 era 设备入口正确显示
- 验证里模式开关在游戏设置中生效，设备界面不再显示切换
- 验证消息生成和持久化
- 验证系统提示词注入效果
- 验证存档/加载数据一致性
- 验证通知角标行为

---

## 4. 风险评估

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| AI 生成消息质量不稳定 | 高 | JSON 输出约束 + 里模式规则注入 |
| IndexedDB 读写性能 | 低 | 消息数据量小 |
| 系统提示词过长 | 中 | 摘要限制在最近 5 条消息 |
| 与现有存档兼容性 | 中 | 新字段有默认值，向后兼容 |
| 1v1 私聊状态管理复杂度 | 中 | 独立消息存储，复用 ChatApp 模式 |

---

## 5. 验收标准

1. **里模式位置正确**：开关在游戏设置中，设备界面无切换按钮
2. **可见性**：桌面端和移动端均可从快捷入口打开手机
3. **持久化**：消息跨回合保存，存档/加载不丢失
4. **AI 生成**：回合结束自动生成符合时代的设备内容
5. **正文联动**：系统提示词包含通讯摘要，AI 在正文中引用
6. **通知**：新消息产生角标提醒，点击可达
7. **变量关联**：通讯行为影响精力和 NPC 好感度
8. **向后兼容**：旧存档加载后设备功能正常工作

---

## 6. 文件变更清单

### 新建文件

| 文件 | 说明 |
|------|------|
| `models/domain/deviceVariables.ts` | 设备变量绑定定义 |
| `components/features/MobileDevice/apps/PrivateChatApp.tsx` | 私聊组件（Phase 5） |
| `hooks/useGame/deviceNotificationWorkflow.ts` | 通知生成工作流 |

### 修改文件

| 文件 | 变更说明 |
|------|----------|
| `components/features/MobileDevice/MobileHome.tsx` | 移除 ModeToggle + 通知角标 |
| `components/features/MobileDevice/MobileDeviceModal.tsx` | 移除 mode toggle props |
| `components/features/SettingsModal.tsx` | 新增 per-era 里模式开关 |
| `components/layout/RightPanel.tsx` | 手机入口按钮 |
| `components/layout/MobileQuickMenu.tsx` | 手机入口按钮 |
| `components/features/MobileDevice/apps/ContactsApp.tsx` | AI 联系人补充 + 私聊入口 |
| `components/features/MobileDevice/apps/ChatApp.tsx` | AI 群组补充 |
| `components/features/MobileDevice/apps/AlbumApp.tsx` | 连接图片资产 |
| `models/mobileDevice.ts` | 类型扩展：DeviceStats, Notification |
| `hooks/useGame.ts` | 删除 toggleDeviceMode，mode 改为派生 |
| `hooks/useGameState.ts` | 设备状态扩展 + mode 派生 |
| `hooks/useGame/mobileDeviceWorkflow.ts` | 初始状态 + 提示词扩展 |
| `hooks/useGame/deviceAiWorkflow.ts` | 摘要构建函数 |
| `hooks/useGame/sendWorkflow.ts` | 回合末尾触发设备消息生成 |
| `hooks/useGame/systemPromptBuilder.ts` | 设备通讯摘要注入 |
| `hooks/useGame/saveCoordinator.ts` | 设备消息存档支持 |
| `services/dbService.ts` | IndexedDB 设备消息存储 |
| `App.tsx` | 移除 onModeToggle 传递，通知数据传递 |
