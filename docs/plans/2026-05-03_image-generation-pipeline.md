# 图片生成管线

> **Status:** 已实现 | **最近更新:** 2026-05-03

## 目标

重构 PNG 导入、生图装配、画师串预设消费逻辑，统一正向/负向提示词的装配模型。

## 实现概述

已在 `services/ai/image/` 目录下实现完整的图片生成管线：

### 核心模块

| 模块 | 文件 | 功能 |
|------|------|------|
| PNG 解析 | `pngParser.ts` | 解析 PNG tEXt/iTXt 元数据，支持 NovelAI/SD 格式 |
| 风格提取 | `anchorExtractor.ts` | AI 提炼风格标签，提取角色锚点 |
| 提示词装配 | `promptBuilder.ts` | 组装前置/主体/后置正向提示词 |
| 分词器 | `imageTokenizer.ts` | 提示词分词、去重、权重转换 |
| 后端执行 | `backends.ts` | 调用 NovelAI/OpenAI/SD 等后端生图 |
| 持久化 | `persistence.ts` | 图片资源本地存储 |

### 实现的功能

1. **PNG 元数据解析**
   - NovelAI 隐写 Alpha 通道提取
   - SD WebUI 参数文本解析
   - tEXt/zTXt/iTXt 块遍历
   - EXIF 元数据读取

2. **本地 Artist 剥离**
   - 规则 + 词库双模式识别
   - 保留权重语法 `::权重::`、`() [] {} <>`
   - 画师命中项独立保存

3. **AI 风格提炼**
   - 剥离后正面提示词交给 AI 清洗
   - 保守删除主体污染
   - 回退机制保底

4. **提示词装配**
   - 前置正向 = 画师串 + 风格词
   - 主体正向 = 人物/场景主体
   - 后置正向 = 构图、比例、镜头
   - 最终正向 = 前置 + 主体 + 后置
   - 最终负向 = 合并后的负面提示词

5. **NovelAI 映射**
   - `prompt = 前置 + 主体 + 后置`
   - `negative_prompt = 最终负向`
   - `v4_prompt.caption.base_caption` 与最终正向一致

## 数据结构

### PNG 画风预设结构

强制保存字段：
- `原始正面提示词`、`剥离后正面提示词`、`AI提炼正面提示词`
- `画师串`、`画师命中项`
- `负面提示词`、`参数`
- `封面DataUrl`（可选）

### 角色锚点结构

```typescript
{
  名称: string;
  正面提示词: string;
  负面提示词: string;
  结构化特征: {
    外貌标签: string[];
    身材标签: string[];
    胸部标签: string[];
    发型标签: string[];
    发色标签: string[];
    眼睛标签: string[];
    肤色标签: string[];
    年龄感标签: string[];
    服装基底标签: string[];
    特殊特征标签: string[];
  };
  说明: string;
}
```

## 调用入口

```typescript
import {
  解析PNG文件元数据,
  提炼PNG画风标签,
  提取角色锚点提示词,
  构建最终图片提示词,
  generateImageByPrompt
} from '../../services/ai/image';
```

## 状态

**已实现**，无需进一步工作。
