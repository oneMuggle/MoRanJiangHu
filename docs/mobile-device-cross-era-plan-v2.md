# 跨时代移动设备功能扩展设计方案 v2.0

> 项目：墨色江湖：无尽武林
> 版本：v2.0（增强版）
> 日期：2026-04-30
> 状态：设计方案，待实施
> 基于：v1.0 框架 + 22个SubEra完整数据模型

---

## 一、设计目标与范围

### 1.1 核心需求

| # | 需求 | 优先级 | 说明 |
|---|------|--------|------|
| 1 | 现代（都市）增加手机功能 | P0 | 地图、群聊、论坛、通讯录 |
| 2 | 其他时代类似功能，形态符合时代背景 | P0 | 核心功能统一，形态时代化 |
| 3 | 近未来明确定位为"数据终端" | P1 | 已有的赛博朋克SubEra |

### 1.2 设计原则

- **功能统一性**：地图/通讯录/群聊/论坛 四大核心模块在所有时代都存在
- **形态时代化**：设备名称、UI风格、交互方式符合时代科技/魔法背景
- **数据模型复用**：复用现有 `models/eraTheme.ts` 的 22 个 SubEra 体系
- **UI风格继承**：继承 `EraNode.uiStyle` 的 `style` + `tone` + `decorations`

### 1.3 时代体系回顾

基于 `models/eraTheme.ts` 的三层结构：

| Epoch | 名称 | SubEra 数量 | 代表 SubEra |
|-------|------|-------------|------------|
| primordial | 远古 | - | - |
| ancient | 古代 | 3 | 武侠、志怪、神话 |
| modern | 近代 | 3+ | 民国风云、 明治大正、晚清 |
| contemporary | 当代 | 3 | 都市、乡村、末日废土 |
| near-future | 近未来 | 3 | 赛博朋克、反乌托邦、太空殖民 |
| far-future | 未来 | 3+ | 星际科幻、赛博格、虚拟现实 |
| post-human | 后人类 | - | 纯能量生命 |

---

## 二、时代设备形态总表

### 2.1 设备形态与时代对应

| Epoch | Era | SubEra | 设备名称 | 设备形态 | 通讯方式 | UI风格 |
|-------|-----|--------|---------|---------|---------|--------|
| **远古 primordial** | - | - | 石板刻绘 | 刻痕石板/骨片 | 部落传递 | primitive |
| **古代 ancient_eastern** | 武侠 | ancient_eastern_wuxia | 传音玉简 | 玉石/铜镜 | 真气传音 | classical |
| **古代 ancient_eastern** | 志怪 | ancient_eastern_zhiguai | 通灵铜镜 | 青铜镜面 | 灵力感应 | classical |
| **古代 ancient_eastern** | 神话 | ancient_eastern_myth | 千里传音符 | 玉符/金简 | 仙气流转 | classical |
| **古代 ancient_western** | 希腊 | ancient_western_greek | 羊皮信卷 | 莎草纸 | 信使/神谕 | classical |
| **古代 ancient_western** | 罗马 | ancient_western_roman | 铜板公告 | 青铜板 | 信使网络 | classical |
| **古代 ancient_western** | 中世纪 | ancient_western_medieval | 封印书信 | 羊皮卷 | 驿站/信鸽 | classical |
| **近代 modern_eastern** | 民国 | modern_eastern_republic | 电报收发器 | 木壳机械 | 无线电波 | retro |
| **近代 modern_eastern** | 明治大正 | modern_eastern_meiji_taisho | 通讯怀表 | 黄铜机械 | 早期无线电 | retro |
| **近代 modern_eastern** | 晚清 | modern_eastern_late_qing | 八百里加急 | 驿传文书 | 快马/驿站 | retro |
| **近代 modern_western** | 维多利亚 | modern_western_victorian | 机械信使 | 黄铜装置 | 气压管道 | retro |
| **近代 modern_western** | 爵士时代 | modern_western_jazz_age | 无线电对讲 | 早期电台 | 无线电 | retro |
| **近代 modern_western** | 战后重建 | modern_western_postwar | 军用步话机 | 绿色铁盒 | 短波 | retro |
| **当代 contemporary_eastern** | 都市 | contemporary_urban | 智能手机 | 触屏设备 | 4G/5G/WiFi | modern |
| **当代 contemporary_eastern** | 乡村 | contemporary_rural | 老年手机 | 功能机 | 2G/3G | modern |
| **当代 contemporary_eastern** | 末日废土 | contemporary_post_apocalyptic | 对讲机 | 防摔工业 | 短波 | tech |
| **当代 contemporary_western** | 末日废土 | contemporary_post_apocalyptic | 收音机 | 太阳能设备 | FM/短波 | tech |
| **近未来 near-future_tech_dystopia** | 赛博朋克 | near-future_cyberpunk | 数据终端 | 柔性屏/植入 | 神经链接/量子 | tech |
| **近未来 near-future_tech_dystopia** | 反乌托邦 | near-future_dystopia | 监控终端 | 腕戴设备 | 神经直连 | tech |
| **近未来 near-future_space_expansion** | 太空殖民 | near-future_space_colonization | 星际通讯器 | 太空服集成 | 星际网络 | tech |
| **未来 far-future_interstellar** | 星际科幻 | far-future_space_opera | 全息投影器 | 悬浮光球 | 星际网络 | scifi |
| **未来 far-future_digital_transcendence** | 赛博格 | far-future_cyborg | 神经接口 | 脑干植入 | 意识直连 | scifi |
| **未来 far-future_digital_transcendence** | 虚拟现实 | far-future_virtual_reality | 意识终端 | 无实体 | 思维直连 | scifi |
| **后人类 post-human** | 意识宇宙 | post-human_energy | 意识界面 | 无物理形态 | 跨维度 | scifi |

### 2.2 设备名称术语表

| 时代 | 地图 | 通讯录 | 群聊 | 论坛 |
|------|------|--------|------|------|
| 远古 | 岩画标记 | 骨片谱系 | 篝火议事 | 岩壁公告 |
| 古代东方 | 真气感应图 | 玉简印记 | 传音阵 | 江湖告示榜 |
| 古代西方 | 羊皮舆图 | 公民名册 | 元老院议场 | 集市公告板 |
| 近代 | 军用地图 | 名片索引 | 无线电组 | 报纸公告 |
| 现代 | GPS导航 | 联系人 | 聊天群组 | 网络论坛 |
| 近未来 | AR全息地图 | 神经标记 | 意识群组 | 数据流 |
| 未来 | 星图 | 意识档案 | 思维链接 | 知识结晶 |
| 后人类 | 虚实叠加 | 灵魂共鸣 | 意识共鸣 | 宇宙意识 |

---

## 三、四大核心功能模块设计

### 3.1 地图模块 (Map)

#### 各时代地图形态

| SubEra | 地图名称 | 形态 | 核心功能 | 技术实现 |
|--------|---------|------|---------|---------|
| ancient_eastern_wuxia | 真气感应图 | 玉简投影 | 显示同道气场/位置 | 真气感应范围计算 |
| ancient_eastern_zhiguai | 灵视镜 | 铜镜显像 | 阴阳两界切换/鬼魂定位 | 灵力感应 + 阴阳规则 |
| ancient_eastern_myth | 九天舆图 | 金符悬浮 | 仙域/凡间/冥界全显示 | 仙气流转规则 |
| modern_eastern_republic | 租界地图 | 纸质折叠 | 势力范围标注 | 电报确认 |
| modern_eastern_meiji_taisho | 帝国舆图 | 绢本彩绘 | 城市布局/铁路 | 和洋折衷 |
| contemporary_urban | GPS地图 | 数字地图 | 实时定位/导航/地点标记 | GPS + 网络定位 |
| contemporary_rural | 手绘地图 | 布质挂图 | 村庄标注/赶集路线 | 人工更新 |
| contemporary_post_apocalyptic | 废土地图 | 拼凑图纸 | 危险区/资源点/营地 | 探索解锁 |
| near-future_cyberpunk | 全息导航 | 虚空投影 | 3D导航/敌我识别/数据分析 | AR + 神经链接 |
| near-future_dystopia | 监控地图 | 腕上投影 | 信用评分/监控覆盖 | 全域监控 |
| near-future_space_colonization | 星图 | 全息球 | 银河系导航/跃迁点 | 星际定位 |
| far-future_space_opera | 星际星图 | 舰桥投影 | 多星系导航/敌情分析 | 量子定位 |
| far-future_cyborg | 记忆地图 | 神经投影 | 记忆重建/热成像 | 意识读取 |
| far-future_virtual_reality | 虚拟地图 | 意识构建 | 任意空间创造 | 意识投射 |
| post-human_energy | 虚实叠加 | 思维呈现 | 物质-能量双重显示 | 维度感知 |

#### 地图数据结构

```typescript
// 地图地标
interface MapMarker {
  id: string;
  name: string;              // 地标名称（时代化）
  position: { x: number; y: number };
  type: 'location' | 'danger' | 'resource' | 'npc' | 'custom';
  description: string;
  unlocked: boolean;
  eraSpecific?: {
    // 古代
    qiRange?: number;        // 真气感应范围
    spiritualEnergy?: boolean; // 是否需要灵力
    // 现代
    gpsCoordinate?: { lat: number; lng: number };
    // 近未来
    neuralTag?: string;      // 神经标记
    threatLevel?: number;    // 威胁等级
  };
}

// 地图数据
interface EraMapData {
  markers: MapMarker[];
  currentPosition?: { x: number; y: number };
  navigationPath?: { x: number; y: number }[];
  eraStyle: {
    colorScheme: string[];
    iconStyle: 'brush' | 'technical' | 'holographic';
    displayMode: 'flat' | 'projection' | 'ar' | 'consciousness';
  };
}
```

### 3.2 通讯录模块 (Contacts)

#### 各时代通讯录形态

| SubEra | 通讯录名称 | 存储方式 | 特殊功能 |
|--------|-----------|---------|---------|
| ancient_eastern_wuxia | 玉简印记 | 真气烙印 | 气息感知距离/生死状态 |
| ancient_eastern_zhiguai | 灵签簿 | 灵力签名 | 妖气/鬼气检测 |
| ancient_eastern_myth | 仙籍册 | 仙气登录 | 修为等级/所属势力 |
| modern_eastern_republic | 名片盒 | 纸质名片 | 行业分类/势力标记 |
| modern_eastern_meiji_taisho | 通讯录 | 和纸卡片 | 按会社/身份分类 |
| contemporary_urban | 联系人 | 云端同步 | 头像/备注/标签/社交关系 |
| contemporary_rural | 通讯录 | 本地存储 | 村民分组/亲戚标记 |
| contemporary_post_apocalyptic | 幸存者名册 | 手写/刻印 | 信任等级/可用资源 |
| near-future_cyberpunk | 神经标记 | 脑波印记 | 情绪状态/意图感知/记忆读取 |
| near-future_dystopia | 监控档案 | 芯片存储 | 信用评分/行为记录 |
| near-future_space_colonization | 殖民者档案 | 星际网络 | 技能/职责/位置追踪 |
| far-future_space_opera | 船员名册 | 全息档案 | 舰队编制/军衔/专长 |
| far-future_cyborg | 意识档案 | 神经云 | 记忆备份/人格副本 |
| far-future_virtual_reality | 虚拟身份 | 意识编码 | 多重身份切换 |
| post-human_energy | 灵魂共鸣 | 意识网络 | 跨维度感知 |

#### 通讯录数据结构

```typescript
interface Contact {
  id: string;
  name: string;
  avatar?: string;
  relation: string;          // 关系（时代化：道友/部下/仇敌）
  description: string;
  lastContact?: number;      // timestamp
  location?: { x: number; y: number };
  eraSpecific?: {
    // 古代
    qiLevel?: number;        // 真气等级
    sect?: string;          // 所属门派
    // 现代
    phone?: string;
    socialMedia?: string;
    // 近未来
    neuralSignature?: string;
    emotionalState?: 'calm' | 'hostile' | 'friendly';
    threatLevel?: number;
  };
}

interface ContactsData {
  contacts: Contact[];
  groups: ContactGroup[];    // 分组（门派/公司/帮派等）
  recentContacts: string[];   // 最近联系人ID
}

interface ContactGroup {
  id: string;
  name: string;              // 时代化名称
  type: 'sect' | 'faction' | 'company' | 'tribe' | 'crew' | 'neural';
  memberIds: string[];
  iconStyle: string;
}
```

### 3.3 群聊模块 (Chat)

#### 各时代群聊形态

| SubEra | 群聊名称 | 形态 | 成员限制 | 特性 |
|--------|---------|------|---------|------|
| ancient_eastern_wuxia | 传音阵 | 真气网络 | 同门/盟友 | 距离限制/加密 |
| ancient_eastern_zhiguai | 灵犀阵 | 灵力网络 | 精怪/人类 | 跨种族沟通 |
| ancient_eastern_myth | 仙盟频道 | 仙气网络 | 仙友/弟子 | 境界限制 |
| modern_eastern_republic | 秘密电台 | 无线电 | 同派系 | 加密摩斯 |
| modern_eastern_meiji_taisho | 电报群组 | 有线电报 | 会社/部门 | 即时编码 |
| contemporary_urban | 聊天群组 | 即时消息 | 数百人 | @提及/表情 |
| contemporary_rural | 村民群组 | 简单群发 | 全村 | 广播通知 |
| contemporary_post_apocalyptic | 无线电组 | 对讲频道 | 营地成员 | 加密/监听风险 |
| near-future_cyberpunk | 神经群组 | 意识链接 | 链接数限制 | 思维共享/情感同步 |
| near-future_dystopia | 监控频道 | 神经内网 | 信用等级 | 发言审核/情绪监测 |
| near-future_space_colonization | 船员频道 | 全息会议 | 船只成员 | 战术协同 |
| far-future_space_opera | 舰队链接 | 全息会议 | 舰队/同盟 | 跨星系 |
| far-future_cyborg | 思维群组 | 意识网络 | 链接容量 | 记忆共享/技能传输 |
| far-future_virtual_reality | 虚拟会客厅 | 意识构建 | 无限 | 空间定制 |
| post-human_energy | 意识共鸣 | 灵魂网络 | 无限 | 完全意识共享 |

#### 群聊数据结构

```typescript
interface ChatMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  type: 'text' | 'voice' | 'location' | 'image' | 'system';
  eraSpecific?: {
    // 古代
    qiEncrypted?: boolean;  // 是否真气加密
    // 近未来
    emotionalTag?: string;  // 情绪标签
    neuralTimestamp?: number;
  };
}

interface ChatGroup {
  id: string;
  name: string;              // 时代化名称
  type: 'sect' | 'faction' | 'company' | 'crew' | 'neural';
  memberIds: string[];
  messages: ChatMessage[];
  unreadCount: number;
  eraStyle: {
    notificationSound: string; // 时代化提示音
    uiColor: string;
  };
}
```

### 3.4 论坛模块 (Forum)

#### 各时代论坛形态

| SubEra | 论坛名称 | 形态 | 信息传递 | 审核机制 |
|--------|---------|------|---------|---------|
| ancient_eastern_wuxia | 江湖告示榜 | 公告栏 | 悬赏/寻人/交易 | 门派审核 |
| ancient_eastern_zhiguai | 幽冥公告 | 鬼火显字 | 妖界动态/灵异 | 自然淘汰 |
| ancient_eastern_myth | 天机榜 | 金榜悬浮 | 仙界要闻/神谕 | 天庭审核 |
| modern_eastern_republic | 租界公告 | 报纸/告示 | 新闻/广告 | 租界审查 |
| modern_eastern_meiji_taisho | 帝国公告 | 报纸刊物 | 时事/文化 | 警视厅审查 |
| contemporary_urban | 网络论坛 | APP/网页 | 帖子/回复/点赞 | AI审核 |
| contemporary_rural | 村务公告栏 | 实体公告栏 | 通知/活动 | 村委会 |
| contemporary_post_apocalyptic | 废土公告 | 手写传单 | 物资/情报/警告 | 生存验证 |
| near-future_cyberpunk | 数据流 | 神经推送 | 信息流/热点 | 算法决定 |
| near-future_dystopia | 监控论坛 | 官方频道 | 宣传/指令 | 全域监控 |
| near-future_space_colonization | 殖民地公告 | 全息板 | 任务/资源/规则 | 殖民地管理 |
| far-future_space_opera | 星际议会 | 全息会议 | 星际政治/贸易 | 帝国审核 |
| far-future_cyborg | 知识库 | 神经存储 | 知识共享/下载 | 自我维护 |
| far-future_virtual_reality | 创意空间 | 意识构建 | 虚拟创造/共享 | 社区共治 |
| post-human_energy | 宇宙意识 | 集体意识 | 万物互联 | 自然演化 |

#### 论坛数据结构

```typescript
interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  timestamp: number;
  category: string;          // 时代化分类
  tags: string[];
  likes: number;
  replies: ForumReply[];
  eraSpecific?: {
    // 古代
    qiLevel?: number;       // 发帖门槛
    sectRequired?: string;
    // 近未来
    dataType?: 'text' | 'hologram' | 'neural';
    aiReviewed?: boolean;
  };
}

interface ForumReply {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  timestamp: number;
}

interface ForumData {
  categories: ForumCategory[];
  posts: ForumPost[];
  userReputation: number;    // 时代化声望
  eraStyle: {
    titlePlaceholder: string;
    contentPlaceholder: string;
    postButtonText: string;
  };
}

interface ForumCategory {
  id: string;
  name: string;              // 时代化名称
  icon: string;
  description: string;
  postCount: number;
}
```

---

## 四、UI 设计原则

### 4.1 UI风格映射表

基于 `EraNode.uiStyle` 的 `style` 和 `tone` 字段：

| uiStyle.style | uiStyle.tone | UI风格关键词 | 配色主调 | 字体 | 图标风格 |
|---------------|--------------|-------------|---------|------|---------|
| classical | archaic | 水墨古风 | 墨色/朱砂/金色 | 楷书/宋体 | 山水云纹 |
| retro | formal | 机械复古 | 琥珀/铜色/深棕 | 打字机 | 齿轮机械 |
| modern | casual | 扁平现代 | 品牌色/渐变 | 无衬线 | 标准图标 |
| tech | casual | 赛博科技 | 霓虹/深黑/青蓝 | 等宽 | 电路/全息 |
| scifi | formal | 星际科幻 | 星光/深空/能量 | 光纹体 | 星系/能量 |
| primitive | - | 原始粗犷 | 泥土/骨白/炭黑 | 手绘 | 岩画/刻痕 |

### 4.2 各时代UI配色

```typescript
// 基于 eraTheme.ts 的 colors 字段

const eraUIColors = {
  ancient: {
    primary: '230 200 110',    // 金色
    secondary: '68 170 170',   // 青绿
    accent: '163 24 24',      // 朱砂
    background: '14 13 11',   // 墨黑
    text: '230 225 210',      // 宣纸白
  },
  modern: {
    primary: '196 166 125',   // 琥珀
    secondary: '160 130 90',   // 铜色
    accent: '139 50 40',      // 暗红
    background: '20 16 12',   // 深棕
    text: '235 225 205',      // 米白
  },
  contemporary: {
    primary: '88 166 255',    // 科技蓝
    secondary: '63 185 80',    // 活力绿
    accent: '210 60 60',      // 警示红
    background: '13 17 23',   // 深蓝黑
    text: '235 242 250',      // 亮白
  },
  nearFuture: {
    primary: '200 100 255',   // 霓虹紫
    secondary: '0 255 230',    // 青色
    accent: '255 0 120',      // 霓虹粉
    background: '6 6 16',     // 深紫黑
    text: '220 225 240',      // 冷白
  },
  farFuture: {
    primary: '79 195 247',    // 星光蓝
    secondary: '0 230 118',    // 能量绿
    accent: '255 82 82',      // 警示红
    background: '5 13 20',    // 深空蓝
    text: '230 240 250',      // 冷白
  },
  postHuman: {
    primary: '255 255 255',   // 纯白
    secondary: '200 200 255',  // 淡紫
    accent: '180 255 200',    // 能量绿
    background: '0 0 0',      // 纯黑
    text: '250 250 255',      // 近白
  },
};
```

### 4.3 时代化文案示例

基于 `EraNode.uiCopy` 的时代化文案：

```typescript
const eraUICopy = {
  // 现代都市
  contemporary_urban: {
    mapTitle: '地图',
    mapSearchPlaceholder: '搜索地点...',
    contactsTitle: '通讯录',
    contactsAddButton: '添加联系人',
    chatTitle: '群聊',
    chatCreateButton: '创建群聊',
    forumTitle: '论坛',
    forumPostButton: '发帖',
  },
  // 古代武侠
  ancient_eastern_wuxia: {
    mapTitle: '江湖舆图',
    mapSearchPlaceholder: '探查何处...',
    contactsTitle: '玉简簿',
    contactsAddButton: '录入同道',
    chatTitle: '传音阵',
    chatCreateButton: '布阵',
    forumTitle: '江湖告示榜',
    forumPostButton: '张榜',
  },
  // 近代民国
  modern_eastern_republic: {
    mapTitle: '租界全图',
    mapSearchPlaceholder: '打探位置...',
    contactsTitle: '名片盒',
    contactsAddButton: '收录名片',
    chatTitle: '秘密电台',
    chatCreateButton: '组建电台',
    forumTitle: '公告报',
    forumPostButton: '刊稿',
  },
  // 近未来赛博朋克
  near-future_cyberpunk: {
    mapTitle: '全息导航',
    mapSearchPlaceholder: 'QUERY://',
    contactsTitle: '神经档案',
    contactsAddButton: '注册NeuralID',
    chatTitle: '意识链路',
    chatCreateButton: '建立链接',
    forumTitle: '数据流',
    forumPostButton: '上传数据',
  },
  // 远未来星际科幻
  far-future_space_opera: {
    mapTitle: '星际星图',
    mapSearchPlaceholder: '导航坐标...',
    contactsTitle: '船员名册',
    contactsAddButton: '登记船员',
    chatTitle: '舰队频道',
    chatCreateButton: '开通频道',
    forumTitle: '星际议会',
    forumPostButton: '提议',
  },
};
```

### 4.4 装饰效果

基于 `EraNode.uiStyle.decorations`：

```typescript
const eraDecorations = {
  ink_bleed: {
    css: 'ink-bleed-effect',
    description: '水墨晕染边缘',
   适用于: ['classical', 'archaic'],
  },
  grain: {
    css: 'film-grain-overlay',
    description: '胶片颗粒质感',
    适用于: ['retro'],
  },
  scanline: {
    css: 'crt-scanline-overlay',
    description: 'CRT扫描线',
    适用于: ['tech'],
  },
  neon_flicker: {
    css: 'neon-flicker-animation',
    description: '霓虹闪烁',
    适用于: ['tech'],
  },
  holographic: {
    css: 'holographic-rainbow',
    description: '全息彩虹折射',
    适用于: ['scifi', 'holographic'],
  },
};
```

---

## 五、技术架构

### 5.1 目录结构

```
components/features/
├── MobileDevice/                    # 移动设备主模块
│   ├── MobileDevice.tsx            # 主容器组件
│   ├── MobileDeviceModal.tsx       # 弹窗模式
│   ├── MobileHome.tsx              # 设备主屏（桌面端）
│   ├── MobilePanel.tsx             # 设备面板（移动端）
│   │
│   ├── apps/                       # 应用程序
│   │   ├── MapApp.tsx              # 地图应用
│   │   ├── ContactsApp.tsx         # 通讯录应用
│   │   ├── ChatApp.tsx             # 群聊应用
│   │   └── ForumApp.tsx            # 论坛应用
│   │
│   ├── components/                 # 子组件
│   │   ├── AppGrid.tsx             # 应用图标网格
│   │   ├── AppLauncher.tsx         # 应用启动器
│   │   ├── StatusBar.tsx           # 状态栏
│   │   ├── NotificationPanel.tsx   # 通知面板
│   │   │
│   │   ├── map/                    # 地图子组件
│   │   │   ├── MapView.tsx         # 地图视图
│   │   │   ├── MapMarker.tsx       # 地标
│   │   │   └── MapNavigation.tsx   # 导航
│   │   │
│   │   ├── contacts/               # 通讯录子组件
│   │   │   ├── ContactList.tsx     # 联系人列表
│   │   │   ├── ContactCard.tsx     # 联系人卡片
│   │   │   └── ContactDetail.tsx   # 联系人详情
│   │   │
│   │   ├── chat/                   # 群聊子组件
│   │   │   ├── ChatList.tsx        # 群聊列表
│   │   │   ├── ChatRoom.tsx        # 聊天室
│   │   │   └── ChatMessage.tsx     # 消息气泡
│   │   │
│   │   └── forum/                  # 论坛子组件
│   │       ├── ForumList.tsx       # 帖子列表
│   │       ├── ForumPost.tsx       # 帖子详情
│   │       └── ForumEditor.tsx     # 发帖编辑器
│   │
│   ├── eraStyles/                  # 时代样式
│   │   ├── ancientStyles.ts        # 古代样式
│   │   ├── modernStyles.ts         # 近代样式
│   │   ├── contemporaryStyles.ts   # 现代样式
│   │   ├── nearFutureStyles.ts     # 近未来样式
│   │   ├── farFutureStyles.ts      # 未来样式
│   │   └── postHumanStyles.ts      # 后人类样式
│   │
│   └── hooks/                      # Hooks
│       ├── useMobileDevice.ts      # 设备状态
│       ├── useEraDevice.ts         # 时代设备映射
│       ├── useEraDevice.ts         # 时代设备配置
│       └── useMapData.ts           # 地图数据

hooks/useGame/
├── mobileDeviceWorkflow.ts         # 移动设备工作流
└── eraDeviceWorkflow.ts            # 时代设备工作流

models/
├── mobileDevice.ts                 # 移动设备类型定义
└── eraDevice.ts                    # 时代设备配置

services/
└── mobileDeviceService.ts          # 移动设备数据服务

prompts/runtime/
├── eraDevicePrompts.ts             # 时代设备提示词
└── mobileDevicePrompts.ts         # 移动设备运行时提示词

styles/
└── mobileDevice/
    ├── mobileDevice.css            # 主样式
    ├── eraStyles.css               # 时代样式变体
    └── animations.css              # 动画效果
```

### 5.2 核心类型定义

```typescript
// models/mobileDevice.ts

import type { DeviceForm, MobileApp, EraUIForm } from '@/models/eraDevice';

// 设备实例
export interface MobileDeviceInstance {
  id: string;
  deviceForm: DeviceForm;
  eraId: string;
  subEraId: string;
  apps: MobileApp[];
  settings: DeviceSettings;
  data: DeviceData;
}

// 设备设置
export interface DeviceSettings {
  notificationEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  eraSpecific?: Record<string, unknown>;
}

// 设备数据
export interface DeviceData {
  map: MapData;
  contacts: ContactsData;
  chat: ChatData;
  forum: ForumData;
}

// 地图数据
export interface MapData {
  markers: MapMarker[];
  currentPosition?: { x: number; y: number };
  navigationPath?: { x: number; y: number }[];
  unlockedRegions: string[];
}

// 地图地标
export interface MapMarker {
  id: string;
  name: string;
  position: { x: number; y: number };
  type: 'location' | 'danger' | 'resource' | 'npc' | 'custom';
  description: string;
  unlocked: boolean;
  eraSpecificData?: Record<string, unknown>;
}

// 通讯录数据
export interface ContactsData {
  contacts: Contact[];
  groups: ContactGroup[];
  recentContacts: string[];
}

// 联系人
export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  relation: string;
  description: string;
  lastContact?: number;
  location?: { x: number; y: number };
  eraSpecificData?: Record<string, unknown>;
}

// 联系人分组
export interface ContactGroup {
  id: string;
  name: string;
  type: 'sect' | 'faction' | 'company' | 'tribe' | 'crew' | 'neural';
  memberIds: string[];
}

// 群聊数据
export interface ChatData {
  groups: ChatGroup[];
  unreadTotal: number;
}

// 群组
export interface ChatGroup {
  id: string;
  name: string;
  type: 'sect' | 'faction' | 'company' | 'crew' | 'neural';
  memberIds: string[];
  messages: ChatMessage[];
  unreadCount: number;
}

// 消息
export interface ChatMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  type: 'text' | 'voice' | 'location' | 'image' | 'system';
  eraSpecificData?: Record<string, unknown>;
}

// 论坛数据
export interface ForumData {
  categories: ForumCategory[];
  posts: ForumPost[];
  userReputation: number;
}

// 论坛分类
export interface ForumCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  postCount: number;
}

// 论坛帖子
export interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  timestamp: number;
  category: string;
  tags: string[];
  likes: number;
  replies: ForumReply[];
  eraSpecificData?: Record<string, unknown>;
}

// 论坛回复
export interface ForumReply {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  timestamp: number;
}
```

```typescript
// models/eraDevice.ts

// 设备形态枚举
export type DeviceForm =
  | 'stone_tablet'           // 远古：石板刻绘
  | 'jade_token'             // 古代东方：传音玉简
  | 'spirit_mirror'           // 古代东方志怪：通灵铜镜
  | 'divine_token'            // 古代东方神话：传音符
  | 'scroll'                  // 古代西方：羊皮信卷
  | 'bronze_tablet'           // 古代西方罗马：铜板公告
  | 'sealed_letter'           // 中世纪：封印书信
  | 'telegraph'              // 近代民国：电报机
  | 'pocket_watch'           // 近代明治大正：通讯怀表
  | 'relay_station'          // 近代晚清：驿站
  | 'mechanical_messenger'   // 维多利亚：机械信使
  | 'radio'                  // 爵士时代/战后：无线电
  | 'smartphone'             // 现代都市：智能手机
  | 'feature_phone'          // 现代乡村：功能机
  | 'walkie_talkie'          // 废土：对讲机
  | 'data_terminal'          // 近未来赛博朋克：数据终端
  | 'surveillance_terminal'  // 近未来反乌托邦：监控终端
  | 'space_comm'             // 太空殖民：星际通讯器
  | 'hologram'               // 星际科幻：全息投影器
  | 'neural_interface'       // 赛博格：神经接口
  | 'consciousness_terminal' // 虚拟现实/后人类：意识终端
  | 'no_form';               // 后人类：无形态

// 应用程序枚举
export type MobileApp = 'map' | 'contacts' | 'chat' | 'forum';

// UI形式
export type EraUIForm = 'primitive' | 'classical' | 'retro' | 'modern' | 'tech' | 'scifi';

// 时代设备配置
export interface EraDeviceConfig {
  deviceForm: DeviceForm;
  deviceName: string;          // 设备名称（时代化）
  apps: MobileApp[];
  uiForm: EraUIForm;
  uiColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  uiDecorations: string[];
  capabilities: DeviceCapabilities;
}

// 设备能力
export interface DeviceCapabilities {
  hasGPS: boolean;
  hasVocalInput: boolean;
  hasTextInput: boolean;
  hasProjection: boolean;
  hasNeuralLink: boolean;
  hasAR: boolean;
  communicationRange: string;
  energyType: 'physical' | 'qi' | 'electricity' | 'solar' | 'quantum' | 'consciousness';
}
```

### 5.3 时代设备配置数据

```typescript
// 基于 eraTheme.ts 的 SubEra 映射

import type { EraDeviceConfig } from './eraDevice';

export const eraDeviceConfigs: Record<string, EraDeviceConfig> = {
  // ===== 古代东方 =====
  ancient_eastern_wuxia: {
    deviceForm: 'jade_token',
    deviceName: '传音玉简',
    apps: ['map', 'contacts', 'chat', 'forum'],
    uiForm: 'classical',
    uiColors: {
      primary: '230 200 110',
      secondary: '68 170 170',
      accent: '163 24 24',
      background: '14 13 11',
      text: '230 225 210',
    },
    uiDecorations: ['ink_bleed'],
    capabilities: {
      hasGPS: false,
      hasVocalInput: true,
      hasTextInput: true,
      hasProjection: false,
      hasNeuralLink: false,
      hasAR: false,
      communicationRange: '同城',
      energyType: 'qi',
    },
  },
  ancient_eastern_zhiguai: {
    deviceForm: 'spirit_mirror',
    deviceName: '通灵铜镜',
    apps: ['map', 'contacts', 'chat', 'forum'],
    uiForm: 'classical',
    uiColors: {
      primary: '160 140 100',
      secondary: '80 130 100',
      accent: '120 30 40',
      background: '10 12 10',
      text: '215 210 195',
    },
    uiDecorations: ['ink_bleed'],
    capabilities: {
      hasGPS: false,
      hasVocalInput: true,
      hasTextInput: true,
      hasProjection: true,
      hasNeuralLink: false,
      hasAR: false,
      communicationRange: '跨城',
      energyType: 'qi',
    },
  },
  ancient_eastern_myth: {
    deviceForm: 'divine_token',
    deviceName: '千里传音符',
    apps: ['map', 'contacts', 'chat', 'forum'],
    uiForm: 'classical',
    uiColors: {
      primary: '220 190 60',
      secondary: '100 170 200',
      accent: '200 80 40',
      background: '8 8 15',
      text: '225 220 210',
    },
    uiDecorations: ['ink_bleed'],
    capabilities: {
      hasGPS: false,
      hasVocalInput: true,
      hasTextInput: true,
      hasProjection: true,
      hasNeuralLink: false,
      hasAR: false,
      communicationRange: '三界',
      energyType: 'qi',
    },
  },

  // ===== 近代 =====
  modern_eastern_republic: {
    deviceForm: 'telegraph',
    deviceName: '电报收发器',
    apps: ['map', 'contacts', 'chat', 'forum'],
    uiForm: 'retro',
    uiColors: {
      primary: '196 166 125',
      secondary: '160 130 90',
      accent: '139 50 40',
      background: '20 16 12',
      text: '235 224 206',
    },
    uiDecorations: ['grain'],
    capabilities: {
      hasGPS: false,
      hasVocalInput: false,
      hasTextInput: true,
      hasProjection: false,
      hasNeuralLink: false,
      hasAR: false,
      communicationRange: '城市间',
      energyType: 'electricity',
    },
  },
  modern_eastern_meiji_taisho: {
    deviceForm: 'pocket_watch',
    deviceName: '通讯怀表',
    apps: ['map', 'contacts', 'chat', 'forum'],
    uiForm: 'retro',
    uiColors: {
      primary: '180 80 60',
      secondary: '80 140 100',
      accent: '200 170 60',
      background: '15 12 10',
      text: '240 232 220',
    },
    uiDecorations: ['grain'],
    capabilities: {
      hasGPS: false,
      hasVocalInput: false,
      hasTextInput: true,
      hasProjection: false,
      hasNeuralLink: false,
      hasAR: false,
      communicationRange: '数百米',
      energyType: 'electricity',
    },
  },
  contemporary_urban: {
    deviceForm: 'smartphone',
    deviceName: '智能手机',
    apps: ['map', 'contacts', 'chat', 'forum'],
    uiForm: 'modern',
    uiColors: {
      primary: '88 166 255',
      secondary: '63 185 80',
      accent: '210 60 60',
      background: '13 17 23',
      text: '235 240 246',
    },
    uiDecorations: [],
    capabilities: {
      hasGPS: true,
      hasVocalInput: true,
      hasTextInput: true,
      hasProjection: false,
      hasNeuralLink: false,
      hasAR: false,
      communicationRange: '全球',
      energyType: 'electricity',
    },
  },
  contemporary_rural: {
    deviceForm: 'feature_phone',
    deviceName: '老年手机',
    apps: ['map', 'contacts', 'chat', 'forum'],
    uiForm: 'modern',
    uiColors: {
      primary: '100 160 80',
      secondary: '180 160 100',
      accent: '220 120 50',
      background: '15 20 12',
      text: '245 250 235',
    },
    uiDecorations: [],
    capabilities: {
      hasGPS: true,
      hasVocalInput: true,
      hasTextInput: true,
      hasProjection: false,
      hasNeuralLink: false,
      hasAR: false,
      communicationRange: '区域',
      energyType: 'electricity',
    },
  },
  contemporary_post_apocalyptic: {
    deviceForm: 'walkie_talkie',
    deviceName: '对讲机',
    apps: ['map', 'contacts', 'chat', 'forum'],
    uiForm: 'tech',
    uiColors: {
      primary: '160 120 60',
      secondary: '80 100 80',
      accent: '200 50 40',
      background: '10 10 8',
      text: '200 190 175',
    },
    uiDecorations: ['grain'],
    capabilities: {
      hasGPS: false,
      hasVocalInput: true,
      hasTextInput: false,
      hasProjection: false,
      hasNeuralLink: false,
      hasAR: false,
      communicationRange: '数公里',
      energyType: 'solar',
    },
  },

  // ===== 近未来 =====
  near-future_cyberpunk: {
    deviceForm: 'data_terminal',
    deviceName: '数据终端',
    apps: ['map', 'contacts', 'chat', 'forum'],
    uiForm: 'tech',
    uiColors: {
      primary: '200 100 255',
      secondary: '0 255 230',
      accent: '255 0 120',
      background: '6 6 16',
      text: '220 225 240',
    },
    uiDecorations: ['neon_flicker', 'scanline'],
    capabilities: {
      hasGPS: true,
      hasVocalInput: true,
      hasTextInput: true,
      hasProjection: true,
      hasNeuralLink: true,
      hasAR: true,
      communicationRange: '全球+神经',
      energyType: 'quantum',
    },
  },
  near-future_dystopia: {
    deviceForm: 'surveillance_terminal',
    deviceName: '监控终端',
    apps: ['map', 'contacts', 'chat', 'forum'],
    uiForm: 'tech',
    uiColors: {
      primary: '140 60 60',
      secondary: '80 80 100',
      accent: '220 180 60',
      background: '8 8 10',
      text: '200 195 205',
    },
    uiDecorations: ['scanline'],
    capabilities: {
      hasGPS: true,
      hasVocalInput: true,
      hasTextInput: true,
      hasProjection: true,
      hasNeuralLink: true,
      hasAR: true,
      communicationRange: '全域监控',
      energyType: 'quantum',
    },
  },
  near-future_space_colonization: {
    deviceForm: 'space_comm',
    deviceName: '星际通讯器',
    apps: ['map', 'contacts', 'chat', 'forum'],
    uiForm: 'tech',
    uiColors: {
      primary: '60 150 220',
      secondary: '0 200 150',
      accent: '255 120 50',
      background: '5 10 20',
      text: '225 235 250',
    },
    uiDecorations: ['holographic'],
    capabilities: {
      hasGPS: true,
      hasVocalInput: true,
      hasTextInput: true,
      hasProjection: true,
      hasNeuralLink: false,
      hasAR: false,
      communicationRange: '太阳系',
      energyType: 'quantum',
    },
  },

  // ===== 远未来 =====
  far-future_space_opera: {
    deviceForm: 'hologram',
    deviceName: '全息投影器',
    apps: ['map', 'contacts', 'chat', 'forum'],
    uiForm: 'scifi',
    uiColors: {
      primary: '79 195 247',
      secondary: '0 230 118',
      accent: '255 82 82',
      background: '5 13 20',
      text: '230 240 250',
    },
    uiDecorations: ['holographic'],
    capabilities: {
      hasGPS: true,
      hasVocalInput: true,
      hasTextInput: true,
      hasProjection: true,
      hasNeuralLink: false,
      hasAR: true,
      communicationRange: '银河系',
      energyType: 'quantum',
    },
  },
  far-future_cyborg: {
    deviceForm: 'neural_interface',
    deviceName: '神经接口',
    apps: ['map', 'contacts', 'chat', 'forum'],
    uiForm: 'scifi',
    uiColors: {
      primary: '0 200 255',
      secondary: '100 255 200',
      accent: '255 100 200',
      background: '0 5 10',
      text: '220 245 250',
    },
    uiDecorations: ['holographic', 'scanline'],
    capabilities: {
      hasGPS: true,
      hasVocalInput: true,
      hasTextInput: true,
      hasProjection: true,
      hasNeuralLink: true,
      hasAR: true,
      communicationRange: '意识网络',
      energyType: 'consciousness',
    },
  },
  far-future_virtual_reality: {
    deviceForm: 'consciousness_terminal',
    deviceName: '意识终端',
    apps: ['map', 'contacts', 'chat', 'forum'],
    uiForm: 'scifi',
    uiColors: {
      primary: '200 180 255',
      secondary: '150 255 250',
      accent: '255 150 255',
      background: '0 0 5',
      text: '240 240 255',
    },
    uiDecorations: ['holographic'],
    capabilities: {
      hasGPS: true,
      hasVocalInput: true,
      hasTextInput: true,
      hasProjection: true,
      hasNeuralLink: true,
      hasAR: true,
      communicationRange: '虚拟空间',
      energyType: 'consciousness',
    },
  },

  // ===== 后人类 =====
  post-human_energy: {
    deviceForm: 'no_form',
    deviceName: '意识界面',
    apps: ['map', 'contacts', 'chat', 'forum'],
    uiForm: 'scifi',
    uiColors: {
      primary: '255 255 255',
      secondary: '200 200 255',
      accent: '180 255 200',
      background: '0 0 0',
      text: '250 250 255',
    },
    uiDecorations: ['holographic'],
    capabilities: {
      hasGPS: true,
      hasVocalInput: true,
      hasTextInput: true,
      hasProjection: true,
      hasNeuralLink: true,
      hasAR: true,
      communicationRange: '跨维度',
      energyType: 'consciousness',
    },
  },
};
```

### 5.4 时代设备 Hook

```typescript
// hooks/useGame/eraDeviceWorkflow.ts

import { useMemo } from 'react';
import { resolveEraNode } from '@/models/eraTheme';
import { eraDeviceConfigs } from '@/models/eraDevice';
import type { EraDeviceConfig, MobileApp } from '@/models/eraDevice';

/**
 * 获取当前时代的设备配置
 */
export function useEraDevice(subEraId: string): EraDeviceConfig {
  return useMemo(() => {
    const config = eraDeviceConfigs[subEraId];
    if (config) return config;

    // 回退到 Era 层配置
    const resolved = resolveEraNode(subEraId);
    if (resolved) {
      const eraId = resolved.node.parent || subEraId;
      return eraDeviceConfigs[eraId] || eraDeviceConfigs.contemporary_urban;
    }

    return eraDeviceConfigs.contemporary_urban;
  }, [subEraId]);
}

/**
 * 获取时代化的 UI 文案
 */
export function useEraUICopy(subEraId: string): Record<string, string> {
  const eraDevice = useEraDevice(subEraId);

  return useMemo(() => {
    const baseCopy: Record<string, string> = {
      mapTitle: '地图',
      mapSearchPlaceholder: '搜索地点...',
      contactsTitle: '通讯录',
      contactsAddButton: '添加联系人',
      chatTitle: '群聊',
      chatCreateButton: '创建群聊',
      forumTitle: '论坛',
      forumPostButton: '发帖',
    };

    // 根据时代覆盖
    switch (eraDevice.deviceForm) {
      case 'jade_token':
      case 'spirit_mirror':
      case 'divine_token':
        return {
          mapTitle: '江湖舆图',
          mapSearchPlaceholder: '探查何处...',
          contactsTitle: '玉简簿',
          contactsAddButton: '录入同道',
          chatTitle: '传音阵',
          chatCreateButton: '布阵',
          forumTitle: '江湖告示榜',
          forumPostButton: '张榜',
        };
      case 'telegraph':
      case 'pocket_watch':
        return {
          mapTitle: '租界全图',
          mapSearchPlaceholder: '打探位置...',
          contactsTitle: '名片盒',
          contactsAddButton: '收录名片',
          chatTitle: '秘密电台',
          chatCreateButton: '组建电台',
          forumTitle: '公告报',
          forumPostButton: '刊稿',
        };
      case 'smartphone':
      case 'feature_phone':
        return baseCopy;
      case 'data_terminal':
      case 'surveillance_terminal':
        return {
          mapTitle: '全息导航',
          mapSearchPlaceholder: 'QUERY://',
          contactsTitle: '神经档案',
          contactsAddButton: '注册NeuralID',
          chatTitle: '意识链路',
          chatCreateButton: '建立链接',
          forumTitle: '数据流',
          forumPostButton: '上传数据',
        };
      case 'hologram':
      case 'neural_interface':
        return {
          mapTitle: '星际星图',
          mapSearchPlaceholder: '导航坐标...',
          contactsTitle: '船员名册',
          contactsAddButton: '登记船员',
          chatTitle: '舰队频道',
          chatCreateButton: '开通频道',
          forumTitle: '星际议会',
          forumPostButton: '提议',
        };
      case 'consciousness_terminal':
      case 'no_form':
        return {
          mapTitle: '虚实叠加',
          mapSearchPlaceholder: '意图定位...',
          contactsTitle: '灵魂共鸣',
          contactsAddButton: '建立共鸣',
          chatTitle: '意识共鸣',
          chatCreateButton: '发起共鸣',
          forumTitle: '宇宙意识',
          forumPostButton: '传递',
        };
      default:
        return baseCopy;
    }
  }, [eraDevice.deviceForm]);
}

/**
 * 获取可用的应用程序列表
 */
export function useAvailableApps(subEraId: string): MobileApp[] {
  const eraDevice = useEraDevice(subEraId);
  return eraDevice.apps;
}
```

---

## 六、实施阶段

### 6.1 阶段划分

| 阶段 | 名称 | 工期 | 目标 |
|------|------|------|------|
| Phase 1 | 基础架构 | 2-3天 | 类型定义、目录结构、基础组件 |
| Phase 2 | 现代都市 | 3-4天 | 智能手机完整实现（P0需求） |
| Phase 3 | 古代时代 | 3-4天 | 传音玉简等古代变体 |
| Phase 4 | 近代时代 | 2-3天 | 电报/无线电变体 |
| Phase 5 | 未来时代 | 3-4天 | 赛博/星际/意识终端 |
| Phase 6 | 后人类 | 1-2天 | 无形态意识界面 |

### 6.2 Phase 1: 基础架构

**文件变更：**

| # | 文件 | 操作 | 说明 |
|---|------|------|------|
| 1 | `models/mobileDevice.ts` | 新建 | 移动设备核心类型 |
| 2 | `models/eraDevice.ts` | 新建 | 时代设备配置类型 |
| 3 | `components/features/MobileDevice/` | 新建 | 目录结构 |
| 4 | `components/features/MobileDevice/MobileDevice.tsx` | 新建 | 主容器 |
| 5 | `components/features/MobileDevice/apps/` | 新建 | 应用目录 |
| 6 | `components/features/MobileDevice/eraStyles/` | 新建 | 时代样式 |
| 7 | `components/features/MobileDevice/hooks/` | 新建 | Hooks |
| 8 | `hooks/useGame/eraDeviceWorkflow.ts` | 新建 | 时代设备工作流 |
| 9 | `styles/mobileDevice/` | 新建 | 样式目录 |

**验收标准：**
- [ ] 目录结构创建完成
- [ ] 类型定义无编译错误
- [ ] MobileDevice 组件可渲染

### 6.3 Phase 2: 现代都市（核心）

**功能实现：**

| # | 功能 | 优先级 | 说明 |
|---|------|--------|------|
| 1 | 智能手机 UI | P0 | 触屏风格的地图/通讯录/群聊/论坛 |
| 2 | GPS 定位集成 | P0 | 获取当前位置 |
| 3 | 联系人 CRUD | P0 | 添加/编辑/删除联系人 |
| 4 | 群聊消息收发 | P0 | 即时消息 |
| 5 | 论坛帖子发布 | P0 | 发帖/回复/点赞 |
| 6 | 状态栏/通知 | P1 | 通知推送 |

**验收标准：**
- [ ] 四大应用可正常打开
- [ ] 地图可显示当前位置
- [ ] 可添加联系人
- [ ] 可创建群聊并发送消息
- [ ] 可在论坛发帖

### 6.4 Phase 3-6: 其他时代变体

**实现策略：**
- 复用 Phase 2 的功能逻辑
- 仅更换 UI 样式和时代化文案
- 通过 `useEraDevice` hook 获取配置

---

## 七、关键文件清单

### 7.1 新建文件

```
models/
├── mobileDevice.ts              # 移动设备核心类型
└── eraDevice.ts                # 时代设备配置

components/features/MobileDevice/
├── MobileDevice.tsx            # 主容器
├── MobileDeviceModal.tsx       # 弹窗
├── MobileHome.tsx             # 主屏
├── MobilePanel.tsx             # 面板
├── AppGrid.tsx                # 应用网格
├── StatusBar.tsx              # 状态栏
├── apps/
│   ├── MapApp.tsx             # 地图
│   ├── ContactsApp.tsx        # 通讯录
│   ├── ChatApp.tsx            # 群聊
│   └── ForumApp.tsx           # 论坛
├── components/
│   ├── map/
│   ├── contacts/
│   ├── chat/
│   └── forum/
├── eraStyles/                  # 时代样式
│   ├── ancientStyles.ts
│   ├── modernStyles.ts
│   ├── contemporaryStyles.ts
│   ├── nearFutureStyles.ts
│   ├── farFutureStyles.ts
│   └── postHumanStyles.ts
└── hooks/
    ├── useMobileDevice.ts
    └── useEraDevice.ts

hooks/useGame/
├── mobileDeviceWorkflow.ts     # 移动设备工作流
└── eraDeviceWorkflow.ts        # 时代设备工作流

services/
└── mobileDeviceService.ts     # 数据服务

prompts/runtime/
├── eraDevicePrompts.ts         # 时代设备提示词
└── mobileDevicePrompts.ts      # 移动设备提示词

styles/mobileDevice/
├── mobileDevice.css
├── eraStyles.css
└── animations.css
```

### 7.2 需修改文件

| 文件 | 修改内容 |
|------|---------|
| `components/features/index.ts` | 导出 MobileDevice |
| `hooks/useGame/index.ts` | 导出 mobileDeviceWorkflow |
| `models/eraTheme.ts` | 无变更（复用现有结构）|

---

## 八、UI设计示意

### 8.1 现代都市 - 智能手机

```
┌─────────────────────────────┐
│ ●●●●  现代都市  ●●●●  4G │ ← 状态栏
├─────────────────────────────┤
│  ┌─────┐ ┌─────┐          │
│  │ 🗺️  │ │ 👥  │          │
│  │ 地图 │ │ 通讯 │          │ ← 应用网格
│  └─────┘ └─────┘          │
│  ┌─────┐ ┌─────┐          │
│  │ 💬  │ │ 📰  │          │
│  │ 群聊 │ │ 论坛 │          │
│  └─────┘ └─────┘          │
├─────────────────────────────┤
│    墨色江湖 · 都市人生      │ ← 底部
└─────────────────────────────┘
```

### 8.2 古代武侠 - 传音玉简

```
┌─────────────────────────────┐
│  ～～～  传音玉简  ～～～   │ ← 状态栏（真气）
├─────────────────────────────┤
│  ┌─────┐ ┌─────┐          │
│  │ 🗺️  │ │ 👥  │          │
│  │ 舆图 │ │ 玉簿 │          │ ← 应用网格（古典）
│  └─────┘ └─────┘          │
│  ┌─────┐ ┌─────┐          │
│  │ 💬  │ │ 📜  │          │
│  │ 传音 │ │ 告示 │          │
│  └─────┘ └─────┘          │
├─────────────────────────────┤
│      墨色江湖 · 江湖舆图     │ ← 底部（古典）
└─────────────────────────────┘
```

### 8.3 近未来赛博朋克 - 数据终端

```
┌─────────────────────────────┐
│ ◉ NEURAL LINK v2.7  ▮▮▮▮  │ ← 状态栏（神经）
├─────────────────────────────┤
│  ┌─────┐ ┌─────┐          │
│  │ 🗺️  │ │ 👤  │          │
│  │ 全息 │ │ 神经 │          │ ← 应用网格（霓虹）
│  └─────┘ └─────┘          │
│  ┌─────┐ ┌─────┐          │
│  │ 💭  │ │ 📊  │          │
│  │ 链路 │ │ 数据 │          │
│  └─────┘ └─────┘          │
├─────────────────────────────┤
│ ▸ CYBERPUNK // TERMINAL     │ ← 底部（扫描线）
└─────────────────────────────┘
```

---

## 九、总结

本方案在 v1.0 基础上进行了以下增强：

1. **完整的 SubEra 映射**：覆盖 22 个 SubEra 的设备形态
2. **详细的四大模块设计**：地图/通讯录/群聊/论坛在各时代的数据结构
3. **UI 设计原则**：基于 `EraNode.uiStyle` 的 style/tone/decorations
4. **技术架构**：完整的文件结构和类型定义
5. **实施阶段**：明确的 6 阶段实施计划

下一步行动：
1. **Phase 1**：创建基础架构和目录结构
2. **Phase 2**：实现现代都市智能手机功能
3. **Phase 3-6**：逐步扩展其他时代变体
