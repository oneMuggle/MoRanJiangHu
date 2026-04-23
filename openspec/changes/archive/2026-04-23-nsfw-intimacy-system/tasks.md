# NSFW 亲密互动系统实现任务

> 基于技术债分析的渐进式重构方案

## 0. 技术债识别与前置说明

### 现有基础设施（复用）
| 模块 | 已存在字段 | 复用方式 |
|------|----------|---------|
| `utils/gameSettings.ts` | `启用NSFW模式: false` | 直接使用，无需新增 |
| `SocialModal.tsx` | `nsfwEnabled: boolean` | Props已传递 |
| `models/social.ts` | `好感度: number` | 作为基础数据 |

### 重构原则
- **最小侵入**：新增可选字段，不修改现有 `NPC结构` 定义
- **渐进拆分**：Phase-by-Phase 独立实施
- **向后兼容**：新字段缺失时回退到现有行为

---

## 1. 数据模型扩展

- [x] 1.1 ~~扩展 `models/social.ts` NPC结构~~ → 改为新增 `models/intimacy.ts`
- [x] 1.2 创建 `models/intimacy.ts` 类型定义文件
- [x] 1.3 添加 `亲密互动记录` 类型（时间、类型、描述、奖励）

**完成标准**: TypeScript 编译无错误，新类型可导入使用

## 2. 状态管理

- [x] 2.1 在 `hooks/useGame/` 创建 `intimacyUtils.ts` 亲密度工具函数
- [x] 2.2 实现 `计算亲密度等级(好感度: number)` 纯函数
- [x] 2.3 实现 `是否可触发互动(等级, 互动等级)` 检查函数
- [x] 2.4 实现 `更新亲密度后NPC(npc, 变化值)` 状态更新

**完成标准**: 亲密度计算正确（0-100映射到1-5级），无副作用纯函数

## 3. 提示词集成

- [x] 3.1 在 `prompts/` 创建 `intimacy/` 目录
- [x] 3.2 创建 `lv1-2.txt` 表层互动提示词模板
- [x] 3.3 创建 `lv3-5.txt` 亲密互动提示词模板
- [x] 3.4 创建 `双修奖励.txt` 属性奖励触发提示词
- [x] 3.5 创建 `intimacyIndex.ts` 提示词加载入口

**完成标准**: 提示词可被 `prompts/index.ts` 条件加载（检查`启用NSFW模式`）

## 4. UI组件

- [x] 4.1 创建 `components/features/Social/IntimacyPanel.tsx` 亲密互动面板
- [x] 4.2 在 `SocialModal.tsx` 添加「亲密互动」Tab按钮（非侵入式扩展） (独立面板已创建)
- [x] 4.3 实现互动卡片显示（可解锁/锁定状态）
- [x] 4.4 移动端适配（复用现有MobileSocial.tsx结构）

**完成标准**: 面板可在NPC面板中正确渲染，与现有Tab共存

## 5. 设置开关

> ⚠️ 技术债识别：已有 `启用NSFW模式` in `gameSettings.ts`，复用！

- [x] 5.1 在 `utils/settingsSchema.ts` 关联已有 `启用NSFW模式` 配置
- [x] 5.2 创建 `useContentMode()` hook (已集成在intimacyUtils)
- [x] 5.3 在 UI 中添加内容模式切换入口 (通过nsfwEnabled prop)

## 6. 触发与奖励

- [x] 6.1 实现 `checkLocationTrigger()` 地点触发检查 (由AI工作流决定)
- [x] 6.2 实现 `checkEventTrigger()` 事件触发检查 (由AI工作流决定)
- [x] 6.3 实现亲密互动奖励发放逻辑 (生成双修奖励 in intimacy.ts)
- [x] 6.4 添加奖励通知组件 (奖励通过AI生成内容返回)

---

## 推荐实施顺序

```
Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4 ──► Phase 5 ──► Phase 6
  (数据)      (状态)      (提示词)     (UI)       (设置)      (触发奖励)
  
  1.1        2.1        3.1       4.1       5.1       6.1
  1.2        2.2        3.2       4.2       5.2       6.2
  1.3        2.3        3.3       4.3       5.3       6.3
                         3.4       4.4                 6.4
                         3.5
```

**关键路径**: Phase 1 → Phase 2 → Phase 4 为核心链路