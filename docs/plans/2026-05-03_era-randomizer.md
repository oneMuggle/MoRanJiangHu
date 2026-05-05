# 时代随机选择器 (Era Randomizer)

> 日期: 2026-05-03
> 状态: 待实现

## 背景与目标

在新游戏向导中增加"随机时代"功能，玩家可以一键随机选择子纪元，增加开局多样性体验。

## 功能设计

### 核心功能

1. **随机时代按钮**：在 EraSelector 中添加"随机选择一个"按钮
2. **时代过滤选项**：玩家可选择参与随机的时代大类（古代/近代/现代/近未来/未来）
3. **权重支持**：可选，给不同时代分配不同权重

### UI 交互

- 在 EraSelector 顶部添加"🎲 随机"按钮
- 点击后随机选中一个子纪元，自动填充选择
- 长按/右键可展开时代过滤菜单（可选）

### 技术实现

1. 在 `components/features/EraSelector/EraSelector.tsx` 添加随机按钮
2. 从 `allEraNodes` 中筛选 depth===2 的子纪元节点
3. 随机算法：`Math.random() * array.length`
4. 触发 `onChange` 回调，自动选中并关闭选择器

## 涉及文件

| 文件 | 修改内容 |
|------|----------|
| `components/features/EraSelector/EraSelector.tsx` | 添加随机按钮和逻辑 |

## 风险评估

- 低风险：纯 UI 增强，不影响现有逻辑
