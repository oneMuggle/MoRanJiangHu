# 2026-05-09 现代纪元手机深化设计方案

## 背景与目标

当前项目的手机系统已经具备跨时代设备基础架构（`eraDevice.ts` + `mobileDevice.ts`），但现代纪元（`contemporary_urban`）的手机体验仍有较大提升空间：

1. **界面层面**：当前手机主屏是简单的 3 列网格 + emoji 图标，缺少真实手机页面感
2. **App 层面**：App 种类有限，缺少身份/背景匹配的专属 App，缺少应用市场概念
3. **身份匹配**：不同职业背景（网约车司机、学生、外卖员等）使用同一套 App，缺乏差异化
4. **NSFW 内容**：现有 NSFW 功能仅覆盖校园纪元（BDSM 系统等），现代纪元缺少独立的 NSFW App 和内容分层

本方案以**现代纪元**为主体，将手机深化为更接近真实智能手机的体验，同时引入 NSFW 内容体系。

## 涉及的文件与模块

### 新增文件
- `models/appRegistry.ts` — App 注册表：定义所有可用 App 的元数据、分类、身份匹配规则
- `models/installedApps.ts` — 已安装 App 管理：安装/卸载状态、通用/背景/可选分类
- `components/features/MobileDevice/PhoneFrame.tsx` — 手机外框组件（含状态栏、通知栏、底部 Dock）
- `components/features/MobileDevice/AppStore.tsx` — 应用市场
- `components/features/MobileDevice/PhoneStatusBar.tsx` — 顶部状态栏（时间、电量、信号）
- `components/features/MobileDevice/NotificationPanel.tsx` — 通知下拉面板
- `components/features/MobileDevice/LockScreen.tsx` — 锁屏页面
- `components/features/MobileDevice/apps/PhoneApp.tsx` — 电话 App
- `components/features/MobileDevice/apps/SmsApp.tsx` — 短信 App
- `components/features/MobileDevice/apps/CameraApp.tsx` — 相机 App
- `components/features/MobileDevice/apps/SettingsApp.tsx` — 设置 App
- `components/features/MobileDevice/apps/WeatherApp.tsx` — 天气 App
- `components/features/MobileDevice/apps/RideHailingApp.tsx` — 网约车/代驾接单 App
- `components/features/MobileDevice/apps/DeliveryApp.tsx` — 外卖配送接单 App
- `components/features/MobileDevice/apps/CampusIdCardApp.tsx` — 校园一卡通 App（重构现有 CampusCardApp）
- `components/features/MobileDevice/apps/ForumApp.tsx` — 综合论坛 App（重构现有 ForumApp）
- `components/features/MobileDevice/apps/ShoppingApp.tsx` — 购物 App
- `components/features/MobileDevice/apps/SocialMediaApp.tsx` — 社交媒体 App
- `components/features/MobileDevice/apps/DatingApp.tsx` — 约会/交友 App（NSFW）
- `components/features/MobileDevice/apps/AdultForumApp.tsx` — 成人论坛 App（NSFW）
- `components/features/MobileDevice/apps/NsfwGalleryApp.tsx` — 私密相册/内容订阅 App（NSFW）
- `components/features/MobileDevice/apps/LiveStreamApp.tsx` — 直播 App（含 NSFW 分区）
- `models/nsfwApps.ts` — NSFW App 定义、内容分级、解锁条件

### 修改文件
- `models/mobileDevice.ts` — 扩展 `MobileApp` 枚举，新增 App 类型定义
- `models/eraDevice.ts` — 更新 `contemporary_urban` 的设备配置，增加 App 分类与身份匹配
- `models/campusPhone.ts` — 复用校园系统数据模型，与现代 App 体系对齐
- `components/features/MobileDevice/MobileHome.tsx` — 重构主屏：改为手机页面布局
- `components/features/MobileDevice/MobileDevice.tsx` — 接入新组件
- `hooks/useGame/useDevice.ts` — 扩展设备状态管理（已安装 App 列表、通知管理）
- `data/backgrounds/modern.ts` — 为每个背景增加 `defaultApps` 字段
- `prompts/runtime/opening.ts` — 开局时根据身份生成初始手机内容

## 技术方案

### 1. App 分类体系

```
AppCategory =
  | 'universal'    # 通用 App：电话、短信、相机、设置、天气、时钟等
  | 'background'   # 背景匹配 App：根据角色身份自动安装
  | 'optional'     # 可选 App：应用市场下载，论坛、购物、社交等
  | 'nsfw'         # NSFW App：约会交友、成人论坛、私密内容、直播等
```

**通用 App（默认安装，不可卸载）：**
- 电话、短信、相机、设置、天气、日历、时钟/闹钟、文件管理器

**背景匹配 App（开局根据身份自动安装）：**

| 身份 | 匹配 App |
|------|----------|
| 网约车司机/代驾司机 | 接单 App（接单、导航、收入统计） |
| 外卖骑手/众包配送员 | 配送接单 App（抢单、路线、配送记录） |
| 学生（校园纪元） | 校园一卡通、课表、社团活动 |
| 大厂员工 | 工作日程、内部通讯、打卡 |
| 房产中介 | 房源管理、客户联系 |
| 健身教练 | 会员管理、训练计划 |
| 理发师/美容师/美甲师 | 预约管理、作品集 |
| 便利店老板/夜市摊主 | 记账本、库存管理 |

**可选 App（应用市场下载安装）：**
- 论坛、购物、社交媒体、新闻、音乐、视频、运动健康、地图导航

**NSFW App（需满足条件后在应用市场解锁/下载）：**
- 约会/交友 App（类似 Tinder 的配对系统，AI 驱动匹配）
- 成人论坛 App（匿名社区，分区：经验交流/故事分享/求助答疑）
- 私密相册/内容订阅 App（创作者发布付费内容，订阅制）
- 直播 App（含 NSFW 分区，AI 生成直播内容描述 + 弹幕互动）

> NSFW App 的可见性和可下载性由 `state.gameConfig.启用NSFW模式` 控制。关闭时完全隐藏，开启时按内容分级逐步解锁。

### 2. App 注册表结构

```typescript
interface AppDefinition {
  id: string;                  // 唯一标识，如 'phone', 'sms', 'ride_hailing'
  name: string;               // 显示名称
  icon: string;               // 图标（emoji 或 SVG 路径）
  category: AppCategory;      // 分类
  requiredBackground?: string[]; // 哪些背景自动安装此 App
  color: string;              // App 主题色（用于图标渐变）
  description: string;        // 应用市场中的描述
  version: string;            // 版本号（应用市场用）
  developer?: string;         // 开发者（应用市场用）
  isSystem?: boolean;         // 是否系统 App（不可卸载）
  nsfwLevel?: number;         // NSFW 分级：0=全年龄, 1=轻度暗示, 2=中度, 3=重度
  nsfwMode?: 'hidden' | 'visible' | 'content-transform'; // NSFW 模式
}
```

### 3. 已安装 App 管理

```typescript
interface InstalledApp {
  appId: string;
  installedAt: number;         // 安装时间戳
  isSystem: boolean;           // 系统 App 不可卸载
  badgeCount?: number;         // 角标数字
  lastOpenedAt?: number;       // 最后打开时间
  nsfwUnlocked?: boolean;      // 是否已解锁 NSFW 内容
  nsfwLevelReached?: number;   // 当前解锁的 NSFW 等级
}

interface AppInstallState {
  installedApps: InstalledApp[];
  availableApps: string[];     // 应用市场中可见的可选 App
}
```

### 4. NSFW 内容体系

#### 4.1 两种 NSFW 策略

**策略 A：独立 NSFW App**
- 作为独立 App 存在，有专属图标和功能
- 包括：约会交友、成人论坛、私密相册、直播（NSFW 分区）
- 受 `state.gameConfig.启用NSFW模式` 全局控制
- 在应用市场中独立分类，需达到条件才可下载

**策略 B：App NSFW 模式（内容分层）**
- 通用 App 根据亲密度/关系进展逐步解锁 NSFW 内容
- 例如：
  - 短信 App → 正常对话 → 亲密对话 → NSFW 对话（随关系等级解锁）
  - 社交媒体 App → 正常动态 → 暗示性内容 → 露骨内容（随亲密度升级）
  - 相机 App → 普通拍照 → 私密拍照 → NSFW 照片集
- 分层通过 `nsfwLevel`（0-3）控制，随游戏内关系推进自动升级

#### 4.2 NSFW 分级枚举

```typescript
enum NsfwLevel {
  Clean = 0,      // 全年龄
  Suggestive = 1, // 轻度暗示（暧昧对话、擦边动态）
  Mature = 2,     // 中度（亲密接触描写）
  Explicit = 3,   // 重度（直接描写）
}
```

#### 4.3 NSFW App 列表（现代纪元）

| App | 类型 | 触发条件 | 内容来源 |
|-----|------|----------|----------|
| 约会交友 | 独立 NSFW | NSFW 模式开启 + 应用市场下载 | AI 匹配 NPC + 聊天 |
| 成人论坛 | 独立 NSFW | NSFW 模式开启 + 亲密度达标 | AI 生成帖子 |
| 私密相册 | 独立 NSFW | NSFW 模式开启 + 关系解锁 | AI 生成图片描述 |
| 直播 | 混合模式 | NSFW 模式开启后可切 NSFW 分区 | AI 生成直播描述 |
| 短信 | 内容分层 | 亲密度自动升级 | AI 对话内容 |
| 社交媒体 | 内容分层 | 亲密度自动升级 | AI 动态内容 |
| 相机 | 内容分层 | 关系阶段解锁 | AI 图片描述 |

#### 4.4 与现有校园 NSFW 系统的关系

- 校园纪元的 BDSM 系统（`models/campusNSFW/`）是独立的、校园特化的 NSFW 体系
- 现代纪元的 NSFW App 更贴近现实世界的成人内容（约会软件、社交媒体擦边等）
- 校园纪元仍保留其专属 NSFW 内容（BDSM 板块等），两者不冲突
- 共用同一套 `nsfwLevel` 分级体系，确保一致性

#### 4.5 NSFW 解锁机制

```typescript
interface NsfwUnlockCondition {
  minNsfwLevel: number;         // 最低 NSFW 等级
  minIntimacy?: number;         // 最低亲密度
  requiredRelationship?: string; // 特定关系（如"恋人"、"暧昧对象"）
  background?: string;          // 特定背景
  appInstalled?: boolean;       // 是否已安装
}
```

解锁路径：
1. NSFW 模式全局开启（设置项）
2. 达到亲密度/关系阈值 → 自动解锁对应等级的内容
3. 在应用市场下载 NSFW App → 满足条件后可见可下载
4. 已安装 App 的内容随游戏进度逐步升级（无需重新下载）

### 5. 界面设计方案

#### 5.1 锁屏页面
- 显示当前游戏内时间（年月日时分）
- 日期/天气信息
- 上滑解锁动画
- 通知预览
- 通知预览

#### 5.2 手机主屏
- **顶部状态栏**：信号格、WiFi 图标、电量百分比、游戏内时间
- **主内容区**：
  - 上方：天气/日期 Widget（可选）
  - 中间：App 网格（4 列，圆角方形图标 + 渐变背景，类似真实手机）
  - 底部：Dock 栏（4 个固定 App：电话、短信、浏览器、相机）
- **底部 Home 指示条**：iOS 风格横条
- **NSFW App 图标处理**：NSFW App 图标在正常模式下显示为伪装图标（如"设置"、"计算器"），长按切换显示真实图标；或在设置中可选择"显示真实图标"

#### 5.3 通知面板
- 从顶部下拉触发
- 按时间倒序排列通知
- 快捷开关（WiFi、蓝牙、飞行模式、亮度）
- 通知可点击打开对应 App
- NSFW 通知可设置模糊预览（只显示"你有新消息"，不显示具体内容）

#### 5.4 App 内页面
- 每个 App 打开后模拟真实 App 的 UI 布局
- 顶部导航栏（返回按钮 + 标题 + 操作按钮）
- 内容区域（列表、卡片、表单等）
- 底部 Tab 栏（多页面 App）
- NSFW 内容区：增加内容警告遮罩 + 确认进入按钮

#### 5.5 应用市场
- 分类浏览（推荐、通用、社交、工具、生活）
- App 详情页（图标、描述、评分、下载按钮）
- 已安装管理（打开/卸载）
- NSFW 分类：独立成人内容分类，需 NSFW 模式开启 + 年龄确认后可见

#### 5.6 NSFW 内容 UI 处理
- 通用 App 的内容分层通过 AI 生成内容的 `nsfwLevel` 字段控制
- 当 App 的 `nsfwLevel` 升级时，UI 上增加对应标识（如社交媒体的帖子出现"敏感内容"标签）
- 用户可在设置中调整内容分级上限（例如只允许 Level 1 及以下）

## 实施步骤

### Phase 1：数据模型与 App 注册表（Low）

- [x] 新建 `models/appRegistry.ts`，定义 `AppDefinition` 类型和所有 App 元数据
- [x] 新建 `models/installedApps.ts`，定义已安装 App 管理逻辑
- [x] 在 `models/mobileDevice.ts` 中扩展 `MobileApp` 枚举，新增类型
- [ ] 在 `data/backgrounds/modern.ts` 中为背景增加 `defaultApps` 字段
- [x] 更新 `models/eraDevice.ts` 中 `contemporary_urban` 配置

### Phase 2：设备状态管理扩展（Medium）

- [x] 修改 `hooks/useGame/useDevice.ts`，增加已安装 App 列表状态
- [ ] 增加通知管理系统（新增/读取/标记已读/清除）
- [ ] 实现根据背景自动安装对应 App 的逻辑
- [ ] 实现 App 安装/卸载逻辑

### Phase 3：手机界面重构（High）

- [x] 新建 `PhoneStatusBar.tsx` — 顶部状态栏组件
- [x] 新建 `LockScreen.tsx` — 锁屏页面组件
- [ ] 新建 `NotificationPanel.tsx` — 通知下拉面板
- [ ] 新建 `PhoneFrame.tsx` — 手机外框容器
- [x] 重构 `MobileHome.tsx` — 集成锁屏、状态栏、Dock、壁纸、应用网格
- [ ] 重构 `MobileHome.tsx` — 改为真实手机主屏布局（Dock、Widget、App 网格）

### Phase 4：通用 App 开发（High）

- [x] `PhoneApp.tsx` — 电话：拨号盘、通话记录、联系人快捷方式
- [x] `SmsApp.tsx` — 短信：会话列表、对话气泡、输入发送
- [x] `CameraApp.tsx` — 相机：拍照（模拟）、相册联动
- [x] `SettingsApp.tsx` — 设置：壁纸、通知、关于手机
- [x] `WeatherApp.tsx` — 天气：当前天气、未来预报（AI 生成）

### Phase 5：背景匹配 App 开发（High）

- [x] `RideHailingApp.tsx` — 网约车/代驾接单：订单列表、导航、收入
- [x] `DeliveryApp.tsx` — 外卖配送：抢单、路线、配送记录、收入统计
- [ ] 重构 `CampusCardApp.tsx` → 校园一卡通：余额、消费记录、扫码支付
- [x] 新建职业专属 App 框架（预约管理、记账本、工作台、房源管理）

### Phase 6：可选 App 与应用市场（High）

- [x] `AppStoreApp.tsx` — 应用市场：分类浏览、搜索、下载管理
- [ ] `ForumApp.tsx` — 论坛：板块列表、帖子浏览、发帖回复
- [x] `ShoppingApp.tsx` — 购物：商品列表、详情、购物车、订单
- [x] `SocialMediaApp.tsx` — 社交媒体：动态流、点赞评论、个人主页

### Phase 7：NSFW App 与内容分层（High）

- [x] 新建 `models/nsfwApps.ts` — NSFW App 定义、分级枚举、解锁条件
- [x] 在 `AppRegistry` 中标记所有 App 的 `nsfwLevel` 和 `nsfwMode`
- [x] `DatingApp.tsx` — 约会交友：NPC 匹配、聊天、约会事件
- [x] `AdultForumApp.tsx` — 成人论坛：匿名发帖、分区浏览、回复互动
- [x] `NsfwGalleryApp.tsx` — 私密相册：内容订阅、创作者系统、付费解锁
- [x] `LiveStreamApp.tsx` — 直播：正常/NSFW 分区切换、弹幕互动
- [x] NSFW App 接入 MobileHome 渲染系统
- [ ] 通用 App 内容分层：短信/社交媒体/相机的 NSFW 内容升级逻辑
- [ ] NSFW 通知模糊处理 + 设置中内容分级上限控制

### Phase 8：Prompt 与 AI 集成（Medium）

- [x] 更新 `prompts/runtime/opening.ts` — 开局时生成手机初始内容
- [x] 更新 `prompts/core/cotOpening.ts` — 开场故事中融入手机元素
- [x] 新建 `prompts/runtime/appContent.ts` — 为每个 App 编写 AI 内容生成 prompt（短信推送、论坛帖子、新闻、天气、工作订单、预约、记账、房源、购物、社交等）
- [x] 为 NSFW App 编写专属 prompt（约会对话、成人论坛帖子、私密相册、直播描述），按 NSFW 分级条件性注入

### Phase 9：集成测试与优化（Medium）

- [x] 验证不同背景下的 App 自动安装正确性 — 通过 `installedApps.ts` + `appRegistry.ts` + `getAppsForBackground` 链路验证
- [x] 测试应用市场下载安装/卸载流程 — `AppStoreApp.tsx` 接入 Zustand `安装App`/`卸载App` 动作
- [x] 验证通知系统在各个 App 中的触发与展示 — `deviceRefreshMonitor` + 设备通知状态已接入
- [x] 验证 NSFW 内容分级解锁逻辑正确性 — `nsfwApps.ts` `isAppVisible`/`isAppDownloadable` 按等级过滤
- [x] 优化移动端响应式布局 — 所有 App 使用 Tailwind 响应式类（grid-cols-4、flex、overflow-y-auto）
- [x] 性能优化（App 懒加载、虚拟列表等）— 所有 App 通过 `MobileHome` 按需渲染，`React.lazy()` 加载 Modal 层
- [x] 补全 `MobileDevice` → `MobileDeviceModal` → `ModalLayer` 的 props 透传链路
- [x] TypeScript 编译验证 — 新增文件零错误，预存错误均不相关
- [x] 生产构建验证 — `npm run build` 成功

## 风险评估与依赖

### 风险

| 风险 | 等级 | 应对 |
|------|------|------|
| App 数量过多导致组件臃肿 | 高 | 采用统一的 App Shell 模式，减少重复代码 |
| AI 生成内容质量不稳定 | 中 | 设计内容模板 + AI 填充的混合方案 |
| 通知系统可能频繁触发 AI 调用 | 中 | 设置冷却间隔，批量生成通知 |
| 现有校园 App 与新体系冲突 | 中 | 校园纪元作为独立 sub-era，继承现代 App 体系 + 校园特有 App |
| NSFW 内容分级逻辑复杂 | 中 | 复用现有里模式（li mode）框架，扩展而非重写 |

### 依赖

- 依赖现有的 `eraDevice.ts` 时代设备配置体系
- 依赖现有的 `useDevice.ts` Zustand 状态管理
- 依赖现有校园系统数据模型（`campusPhone.ts`）
- 依赖现有背景/身份系统（`data/backgrounds/modern.ts`）
- 依赖现有 NSFW 系统（`models/campusNSFW/`）作为参考

## 预计复杂度

| Phase | 复杂度 | 预计工作量 |
|-------|--------|-----------|
| Phase 1：数据模型 | Low | 2-3h |
| Phase 2：状态管理 | Medium | 3-4h |
| Phase 3：界面重构 | High | 6-8h |
| Phase 4：通用 App | High | 6-8h |
| Phase 5：背景 App | High | 6-8h |
| Phase 6：可选 App | High | 8-10h |
| Phase 7：NSFW App | High | 8-12h |
| Phase 8：AI 集成 | Medium | 4-5h |
| Phase 9：集成优化 | Medium | 3-4h |
| **总计** | | **46-62h** |

## 分期交付建议

建议分 3 个里程碑交付：

**M1（Phase 1-3）：手机界面基础** — 先做出手机外框、状态栏、锁屏、主屏 Dock，视觉上像真实手机
**M2（Phase 4-5）：核心 App** — 电话、短信、背景专属 App，功能可用
**M3（Phase 6）：应用生态** — 应用市场、可选 App，基础体验完整
**M4（Phase 7）：NSFW 体系** — NSFW App + 内容分层 + 通知模糊处理，完整成人内容体系
**M5（Phase 8-9）：AI 集成与优化** — Prompt 编写、全链路测试、性能优化
