## Why

气运系统（`data/qiyun/index.ts`）的基础框架已实现，但核心分类筛选功能缺失：能力类型检索、境界适配标注与检索、NSFW 标记等关键功能尚未完成。根据 `refine-qiyun-categorization` 的 tasks.md，仍有 5/6 模块未完成实现。

## What Changes

1. **补充气运数据标注**：为限制版气运（约 120 个）添加 `能力类型` 字段
2. **实现境界适配**：为所有气运添加 `适用境界` 字段 `[min, max]`
3. **新增检索函数**：实现 `getQiyunByType()`、`getQiyunByRealm()` 等筛选函数
4. **完善 NSFW 标记**：为所有气运填充 `nsfw等级` 字段
5. **扩展 filterQiyun**：支持多维度组合筛选

## Capabilities

### New Capabilities
- `qiyun-type-filter`: 按能力类型检索气运
- `qiyun-realm-filter`: 按境界层级检索气运
- `qiyun-nsfw-mark`: NSFW 内容标记与过滤
- `qiyun-level-tag`: 气运适用境界范围标注

### Modified Capabilities
- `qiyun-data`: 扩展气运数据结构，新增检索函数

## Scope

### 变更范围
- `data/qiyun/index.ts`：补充数据标注 + 新增检索函数
- `types.ts`：确认类型定义完整（已完善）

### 非目标
- 不修改气运原有效果设定
- 不做气运数量调整
- 不做平衡性调整
- 不修改已有通过 `filterQiyun`、`randomQiyun` 的调用方

## Impact

**影响文件**：
- `data/qiyun/index.ts`：核心气运数据文件
- `types.ts`：类型定义（已完善）

**API 变更**：
- 新增 `getQiyunByType()` 函数
- 新增 `getQiyunByRealm()` 函数
- 扩展 `filterQiyun()` 支持新参数

## Acceptance Criteria

1. ✅ 所有气运有且仅有一个 `能力类型`（6 类选一）
2. ✅ 所有气运有有效 `适用境界` 范围
3. ✅ `getQiyunByType('战斗')` 正确返回战斗类气运
4. ✅ `getQiyunByRealm(10)` 正确返回适合筑基期气运
5. ✅ `filterQiyun({ excludeNsfw: true })` 过滤 NSFW 气运
6. ✅ 所有 spec.md 场景验证通过