# NSFW 亲密互动系统技术设计

## Context

项目现有亲密相关数据结构在 `models/social.ts` 中已部分定义，包括：

- **NPC结构**: 好感度(0-100)、关系状态、亲密描写字段(胸部描述、小穴描述、屁穴描述、性癖、敏感点等)
- **子宫档案**: 内射记录、妊娠状态
- **初夜系统**: 初夜夺取者、时间、描述+ 现有设置中已有 `启用NSFW模式` (gameSettings.ts line 126)

**技术债分析结论**：
- 好感度仅作为单一数值存在，缺乏分级机制 → **需新增纯函数计算**
- 缺乏主动触发亲密互动的UI → **可复用现有SocialModal扩展**
- 缺乏不同亲密深度的提示词模板 → **需新增分层模板**
- 设置开关已存在 → **直接复用，无需新增**

## Goals / Non-Goals

**Goals:**
- 扩展亲密度系统，支持 0-100 分级（每20点一级，共5级）
- 实现亲密度驱动的互动解锁机制
- 新增亲密互动选择UI面板
- 实现 SFW/NSFW 模式开关
- 亲密互动触发属性/功法奖励
- 与现有NPC数据结构集成

**Non-Goals:**
- 不做具体NSFW内容生成（由AI模型决定输出）
- 不做复杂的物理模拟或动画
- 不做强制触发机制（始终基于玩家主动选择 + NPC自愿）
- 不做服务器端存储（纯本地存储）

## Decisions

### 1. 数据模型设计
采用**新增文件**方式（非侵入式）：
```typescript
// models/intimacy.ts ← 新增文件，不修改现有NPC结构

interface 亲密互动记录 {
  时间: string;
  类型: '调情' | '拥抱' | '亲吻' | '抚摸' | '亲密' | '双修';
  描述: string;
  获得奖励?: { 属性类型: string; 数值: number };
}

// 纯函数（无副作用）
function 计算亲密度等级(好感度: number): number {
  return Math.floor(好感度 / 20) + 1; // 0-100 → 1-5
}
```

### 2. 触发机制设计
三种触发条件（可组合）：
- **地点触发**: 特定地点自动出现互动选项
- **事件触发**: 剧情事件、节日、NPC状态变化
- **主动触发**: 玩家选择特定动作

### 3. 提示词模板设计
采用分层模板：
- Lv1 (0-20): 调情、轻触
- Lv2 (20-40): 拥抱、亲吻
- Lv3 (40-60): 抚摸、亲密接触
- Lv4 (60-80): 亲密互动
- Lv5 (80-100): 深度亲密（双修判定）

### 4. UI面板设计
- 新建 `IntimacyPanel.tsx`（独立组件）
- 复用现有 `SocialModal.tsx` 结构
- 使用 Tailwind CSS 主题（wuxia-gold, wuxia-cyan）

### 5. 设置开关（复用现有）
```typescript
// utils/gameSettings.ts 已存在：
启用NSFW模式: false,  // line 126

// 直接复用，无需新增配置项
```

## Risks / Trade-offs

| 风险 | 缓解方案 |
|------|----------|
| 亲密内容被不当使用 | 结合设置中的NSFW开关，由用户控制显示范围 |
| 多平台兼容性问题 | 桌面端完整功能，移动端简化交互 |
| 数据存储膨胀 | 亲密互动历史限制条数（最近20条） |

## Implementation Plan

### Phase 1: 数据模型扩展
- 新增 `models/intimacy.ts` 类型定义（不修改social.ts）
- 新增亲密度计算纯函数

### Phase 2: 状态管理
- 新增 `hooks/useGame/intimacyUtils.ts` 工具函数
- 实现亲密度读写逻辑

### Phase 3: 提示词集成
- 新增 `prompts/intimacy/` 目录和分层模板
- 实现条件加载（检查`启用NSFW模式`）

### Phase 4: UI组件
- 新增 `IntimacyPanel.tsx` 独立组件
- 在 `SocialModal` 添加Tab（非侵入式扩展）

### Phase 5: 设置开关（复用现有）
- 复用 `gameSettings.ts` 中的 `启用NSFW模式`
- 创建 `useContentMode()` hook

### Phase 6: 触发与奖励
- 实现三种触发条件检查
- 实现属性奖励发放逻辑