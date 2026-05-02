# 22 子纪元时代主题树结构重构

> **Commit:** `96ce35c` | **Status:** ✅ 已完成 | **Date:** 2026-04-28

## 概述

将扁平的时代主题配置重构为三级树形结构：Epoch → Era → SubEra，引入了 22 个详细的子纪元主题。

## 已完成内容

### 架构变更

用分层树形结构替换旧的扁平时代配置：

```
Epoch (顶层时代: 深度 0)
  └── Era (纪元: 深度 1)
        └── SubEra (子纪元: 深度 2) — 叶子节点，含完整 UI 元数据
```

**继承规则:** 当子节点缺少元数据（颜色、字体、装饰）时，从最近的祖先节点继承。

### 22 个子纪元主题

涵盖了以下范围：

| Epoch | Eras | 示例 Sub-Eras |
|-------|------|--------------|
| 古代 | 东方神话, 古希腊, 武侠 | 神话时代, 奥林匹斯, 江湖武侠 |
| 近代 | 维多利亚, 民国共和 | 维多利亚时代, 民国风云 |
| 现代 | 现代都市, 末日废土 | 现代都市, 废土求生 |
| 近未来 | 赛博朋克, 反乌托邦 | 霓虹都市, 极权统治 |
| 未来 | 科幻星际, 后启示录 | 星际殖民, 末世重生 |

### 实现细节

- **`models/eraTheme.ts`**: 核心树结构，包含 `SubEra节点`、`Epoch节点` 接口
- **`models/system.ts`**: 新增 402 行 — 从树自动生成 `全部时代配置`
- **向后兼容**: 旧时代 ID → 新时代 ID 映射
- **动态主题映射**: UI 样式表从树自动生成，替换硬编码映射
- **UI 集成**: `NewGameWizardContent`、`GameSettings` 更新为使用树结构
- **写作风格集成**: `prompts/writing/style.ts` 更新为时代感知散文

**状态:** ✅ 已完成

## 变更文件

- `models/eraTheme.ts` (+87, -41 行)
- `models/system.ts` (+402 行)
- `App.tsx`（4 行变更）
- `hooks/useGameState.ts`（4 行变更）
- `components/features/NewGame/NewGameWizardContent.tsx`（8 行变更）
- `components/features/Settings/GameSettings.tsx`（8 行变更）
- `prompts/writing/style.ts`（8 行变更）

## 待办事项

- [ ] 时代选择器 UI 美化：P1 commit `10f1ad1` 添加了三级 Epoch→Era→SubEra 选择器
- [ ] 时代资源服务：P2 commit `4d61bcd` 添加了时代资源服务骨架
- [ ] 素材生成管道：P3 commits 添加了生成脚本和 MiniMax 集成 — 仍处于实验阶段
- [ ] 测试覆盖：没有针对时代树继承逻辑的测试

## 备注

- 树形结构方法显著提高了可扩展性 — 添加新子纪元时无需修改 UI 代码。
