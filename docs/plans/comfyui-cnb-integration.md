# ComfyUI CNB 云端环境集成方案

> **Status:** 方案已保存，待实施 | **更新日期:** 2026-05-03

## 需求重述

将腾讯 CNB 中启动的 ComfyUI 云端环境接入项目，用于 NPC 生图和场景生图。

## 关键发现

**CNB 环境无需认证 + 核心代码已完整 = 配置即用**

### 已有基础设施（无需新增代码）

| 模块 | 文件 | 状态 |
|------|------|------|
| ComfyUI 生图执行（提交/轮询/下载） | `services/ai/image/backends.ts` | 已实现 |
| 工作流占位注入 | `services/ai/image/backends.ts` | 已实现 |
| CNB 地址配置字段 | `models/system.ts` | 已实现 |
| CNB 地址模式切换 | `ImageGenerationSettings.tsx` | 已实现 |
| 从 CNB 加载工作流 | `ImageGenerationSettings.tsx` | 已实现（`/api/comfyui-workflows`） |
| 场景独立 CNB 地址 | `models/system.ts` | 已实现 |
| 连接测试 | `services/ai/image/connectionTests.ts` | 已实现 |
| NPC/场景生图工作流 | `npcImageWorkflow.ts` / `sceneImageWorkflow.ts` | 已实现 |

### ComfyUI API 交互流程

1. **提交任务**: `POST {baseUrl}/prompt` → 返回 `prompt_id`
2. **轮询结果**: `GET {baseUrl}/history/{prompt_id}` → 每秒轮询直到完成
3. **获取图片**: 从 history 中提取 `/view?...` URL
4. **下载图片**: `GET {baseUrl}/view?...` → 转 DataURL 存储

### 已有工作流占位符

| 占位符 | 说明 | 默认值 |
|--------|------|--------|
| `__PROMPT__` / `{{prompt}}` | 正向提示词 | - |
| `__NEGATIVE_PROMPT__` | 负向提示词 | - |
| `__WIDTH__` / `{{width}}` | 图片宽度 | 1024 |
| `__HEIGHT__` / `{{height}}` | 图片高度 | 1024 |
| `__STEPS__` / `{{steps}}` | 采样步数 | 28 |
| `__CFG__` / `{{cfg}}` | CFG 强度 | 7 |
| `__SAMPLER__` / `{{sampler}}` | 采样器 | euler |
| `__SCHEDULER__` / `{{scheduler}}` | 噪声计划 | normal |
| `__SEED__` / `{{seed}}` | 随机种子 | 0 |

## 使用方法

### 配置步骤

1. 进入游戏 → 设置 → 图片生图
2. **后端类型** → 选择 `ComfyUI`
3. **地址模式** → 选择 `使用 CNB ComfyUI 地址`
4. **CNB ComfyUI 地址** → 填入 CNB 地址（如 `https://xxxx-8188.cnb.run`）
5. **ComfyUI Workflow JSON** → 粘贴 API workflow JSON，或点击"从 CNB 加载"
6. 点击"测试连接"验证

### 场景生图独立配置

- 在图片生图设置的"场景配置"区域
- 可选择独立的场景 CNB 地址
- 留空则复用上方主地址

## 风险与缓解

| 风险 | 严重度 | 缓解 |
|------|--------|------|
| CNB ComfyUI 不支持 CORS | 高 | 先测试直接访问；不可行时部署 Cloudflare 代理 |
| CNB 实例休眠/空闲关闭 | 高 | 连接测试前提示检查实例状态 |
| 工作流 JSON 格式不兼容 | 中 | 提供基础模板；从 CNB 导出 API 格式 |
| 轮询超时（云端延迟） | 中 | 现有轮询已支持 AbortSignal |

## 如需认证（未来扩展）

如果后续 CNB 环境需要认证，已有框架可扩展：
- `功能模型占位配置结构` 中预留了认证字段位置
- `utils/apiConfig.ts` 中可注入 `CNB认证头`
- `backends.ts` 中 `构建生图请求头` 可扩展认证逻辑
