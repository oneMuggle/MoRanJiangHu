# PNG 图像管线重构

> **Status:** 已实现 | **最近更新:** 2026-05-07

## 目标

重构 PNG 导入、生图装配、画师串预设消费逻辑，统一正向/负向提示词的装配模型。

- 本地剥离 `artist`，单独保存；剩余正面提示词交给 AI 清洗
- 负面提示词与 PNG 参数继续完整保留
- 内部统一为 `前置正向 / 主体正向 / 后置正向 / 负向` 抽象
- NovelAI 最终映射为单一正向 prompt + 独立 negative prompt

## PNG 导入流程

```
选择 PNG → 解析元数据 → 提取正负提示词与参数 → AI 提炼 → 生成 PNG 预设 → 编辑封面与字段 → 保存或导出
```

### 1. 元数据解析

- 解析 PNG tEXt / iTXt 元数据
- 优先识别 NovelAI / SD 参数串
- 提取：prompt、negative prompt、Model、LoRA、采样器、步数、CFG、clip skip、Hires、ADetailer

### 2. 本地 Artist 剥离

- 新增本地解析器，支持顶层逗号切分
- 保留 `::权重::`、`() [] {} <>`、转义字符与 token 原顺序
- 采用"规则 + 词库"识别 artist：显式模式优先，其次本地 UTF-8 artist 词库匹配
- 所有命中的 artist token 原样保存，不改写、不重排、不降权

### 3. AI 提炼

- 将"剥离后正面提示词"交给 AI 做风格清洗
- AI 仅处理非 artist 正面词，不接触负面词和参数
- AI 失败时回退为"剥离后正面提示词"
- 过滤原则：去除构图标签、角色标签，保留风格/画师串/质量串

## 数据结构

### PNG 画风预设结构

强制保存以下字段：
- `原始正面提示词`、`剥离后正面提示词`、`AI提炼正面提示词`
- `画师串`、`画师命中项`
- `负面提示词`、`参数`
- `封面DataUrl`（可选）、`原始元数据`

### 画师串预设结构

拆成两段：`画师串` + `正面提示词`（非 artist 风格正面词）

### 运行时装配结果

- `前置正向提示词` — 画师串 + 风格词
- `主体正向提示词` — 人物/场景主体
- `后置正向提示词` — 构图、比例、镜头、环境补强
- `最终正向提示词` = 前置 + 主体 + 后置
- `最终负向提示词` — 合并后的负面提示词

## 装配逻辑

### 非兼容模式

- `画师串 + 非 artist 正面提示词` 全部放入 `前置正向提示词`
- 主体词组只负责人物/场景主体

### 兼容模式

- 只把 `画师串` 放入 `前置正向提示词`
- `非 artist 正面提示词` 作为风格上下文交给 AI，吸收到 `主体正向提示词`
- 后处理阶段不再重复硬拼正面词

### NovelAI 最终映射

- `prompt = 前置 + 主体 + 后置`
- `negative_prompt = 合并后的负面提示词`
- `v4_prompt.caption.base_caption` 与最终正向 prompt 一致

## 提示词策略

不向 AI 暴露"兼容模式"术语，改为直接行为要求。

## 测试计划

- **本地 Artist 解析**: 普通 tag、权重 tag、混合 style/artist、重复、无 artist、转义逗号、LoRA 并存
- **PNG 导入**: NovelAI/SD/无元数据 PNG，AI 失败回退
- **装配验证**: NPC/场景/秘档三条链路，兼容/非兼容模式，NovelAI/OpenAI/SD 后端
- **提示词验证**: 不再出现"兼容模式"等实现描述

## 风险与回退

- 元数据缺失：直接用 AI 读图提炼
- AI 不可用：保留原始提示词
- 非 Nai/SD 模型：仅提示词生图
- 不保留旧存档兼容

## 实施清单

1. **类型与数据结构** — 新增 PNG 预设结构
2. **元数据解析** — 解析 PNG tEXt/iTXt
3. **本地 Artist 剥离** — 新增词库驱动的解析器
4. **AI 提炼服务** — 新增独立 API 配置与提示词模板
5. **装配逻辑** — 兼容/非兼容模式装配
6. **UI 入口与流程** — "导入 PNG 预设"按钮 + 草稿弹层
7. **生图拼接策略** — Nai/SD 映射详细参数，其他仅提示词
8. **导出/导入** — JSON 携带封面与来源元数据

## 实现状态

| 项目 | 状态 | 相关文件 |
|------|------|----------|
| 1. PNG画风预设结构 | ✅ 已完成 | `models/system.ts` |
| 2. 元数据解析 | ✅ 已完成 | `services/ai/image/pngParser.ts` |
| 3. 本地Artist剥离 | ✅ 已完成 | `services/ai/artistTagExtractor.ts`, `services/ai/artistTagDictionary.ts` |
| 4. AI提炼服务 | ✅ 已完成 | `services/ai/image/anchorExtractor.ts` |
| 5. 装配逻辑 | ✅ 已完成 | `services/ai/image/promptBuilder.ts`, `services/ai/image/backends.ts` |
| 6. UI入口与流程 | ✅ 已完成 | `components/features/Character/CharacterModal.tsx` |
| 7. 生图拼接策略 | ✅ 已完成 | `hooks/useGame/npcImageWorkflow.ts` |
| 8. 导出/导入 | ✅ 已完成 | `utils/apiConfigNormalization.ts` |

### 核心实现摘要

- **PNG解析** (`pngParser.ts`): 支持 NovelAI / SD WebUI 格式，提取所有参数
- **Artist剥离** (`artistTagExtractor.ts`): 规则+词库双模式，保留token顺序
- **AI提炼** (`anchorExtractor.ts`): 风格清洗，过滤构图/角色标签
- **提示词装配** (`promptBuilder.ts`): 前置/主体/后置分层，兼容模式独立处理
- **NovelAI v4** (`backends.ts`): 完整v4_prompt结构支持
- **预设消费** (`npcImageWorkflow.ts`): NPC/场景/秘档三条链路
