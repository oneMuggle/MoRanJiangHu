# API 配置助手体验优化

## 背景与目标

### 背景
当前 API 配置助手（`ApiConfigAssistant.tsx`）每次打开后，用户必须先配置助手的 LLM 后端（选择已有配置或手动输入 baseUrl/apiKey/model，然后点击"确认"），才能开始使用助手解析 API 配置。对于已有可用接口配置的用户来说，这增加了不必要的操作步骤。

此外，配置助手的 UI 在移动端和桌面端都存在超出页面边界的问题：
- 桌面端：`max-w-2xl` 容器 + 不包裹的输入行在小窗口下会溢出
- 移动端：固定高度弹窗 + 不包裹的表单控件在窄屏下超出可视区域

### 目标
1. **自动配置**：当用户已有可用的 API 配置时，打开助手即自动使用主配置作为助手后端，跳过手动确认步骤
2. **响应式修复**：确保 UI 在移动端和桌面端都不会超出页面边界

## 涉及文件

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `components/features/Settings/ApiConfigAssistant.tsx` | 修改 | 核心变更：自动配置 + 响应式修复 |
| `components/features/Settings/ApiSettings.tsx` | 无变更 | 仅作为参考，无需修改 |

## 技术方案

### 需求 1：自动配置助手后端

**现状分析**：
- `ApiConfigAssistant.tsx` 第 41-49 行已有 `useEffect` 自动填充 `assistantBaseUrl`/`assistantApiKey`/`assistantModel`
- 但填充后仍需要用户手动点击"确认"按钮才能关闭配置面板（`showConfigPanel` 保持 `true`）
- `configReady` 仍为 `false`，导致输入框被禁用

**方案**：
1. 当检测到 `currentSettings.activeConfigId` 对应的配置存在且 `baseUrl` 和 `apiKey` 均非空时：
   - 自动设置 `configReady = true`
   - 自动关闭配置面板（`showConfigPanel = false`）
   - 在消息区追加一条系统提示："已自动使用当前配置：{名称}"
2. 保留手动切换能力：用户仍可点击齿轮图标重新打开配置面板修改助手后端
3. 当没有可用配置时，维持现有行为（要求手动配置）

### 需求 2：响应式 UI 修复

**桌面端问题**：
- `AssistantConfigPanel` 中的三个输入框 + 按钮在同一行（flex），窄屏下溢出
- 消息区 `max-w-[85%]` 在大文本下可能过宽

**移动端问题**：
- 整个助手弹窗是 `fixed inset-0`，但 SettingsPanel 在移动端已经是 `fixed inset-0 z-[220]`
- 助手弹窗 `z-50` 低于 SettingsPanel 的 `z-[220]`，会被遮挡
- 输入行在窄屏下不换行

**方案**：
1. **z-index 修正**：助手弹窗的 `z-50` 改为 `z-[300]`，确保覆盖 SettingsPanel
2. **容器约束**：外层容器添加 `max-w-full mx-2` 防止贴边溢出
3. **配置面板响应式**：`AssistantConfigPanel` 中的输入行改为 `flex-wrap`，小屏下自动换行
4. **消息区约束**：保持 `max-w-[85%]` 但添加 `break-words` 防止超长文本溢出
5. **移动端全高**：移动端使用 `h-full max-h-full` 确保不超出屏幕

## 实施步骤

- [x] 步骤 1：修改 `ApiConfigAssistant.tsx` - 自动配置逻辑
  - 修改 `useEffect`（第 41-49 行），在自动填充后同步设置 `configReady=true`、`showConfigPanel=false`
  - 添加一条自动配置成功的系统消息
  - 处理无可用配置时的降级行为

- [x] 步骤 2：修改 `ApiConfigAssistant.tsx` - z-index 修正
  - 弹窗根元素 `className` 中 `z-50` → `z-[300]`

- [x] 步骤 3：修改 `ApiConfigAssistant.tsx` - 容器响应式
  - 外层容器添加 `max-w-full w-full mx-2 sm:mx-4`
  - 移动端使用 `h-[100dvh]` 而非 `max-h-[85vh]`
  - 桌面端保持 `max-h-[85vh]`

- [x] 步骤 4：修改 `ApiConfigAssistant.tsx` - 配置面板输入行响应式
  - `AssistantConfigPanel` 中输入行改为 `flex flex-wrap gap-2`
  - 输入框在小屏下 `w-full`，中屏以上恢复 `flex-1`
  - 确认按钮在小屏下 `w-full`

- [ ] 步骤 5：手动验证
  - 桌面端：打开助手 → 验证自动配置生效 → 验证 UI 不溢出
  - 移动端：打开助手 → 验证自动配置生效 → 验证 UI 不溢出
  - 无配置场景：新建用户首次打开 → 验证手动配置流程正常

## 风险评估

| 风险 | 等级 | 应对 |
|------|------|------|
| 自动使用的配置本身不可用（apiKey 过期等） | 中 | 用户发送配置文本后，如果助手调用失败，仍可点击齿轮重新配置后端 |
| z-index 与其他弹窗冲突 | 低 | z-[300] 高于 SettingsPanel 的 z-[220]，低于测试结果的 z-[260]，合理 |
| 响应式修改影响现有美观 | 低 | 仅添加 flex-wrap 和条件宽度，不改变配色和布局结构 |

## 预计复杂度：低

- 自动配置逻辑：~15 行变更
- 响应式修复：~10 行 className 变更
- 总变更集中在单一文件 `ApiConfigAssistant.tsx`
