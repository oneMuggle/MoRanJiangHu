# NPC NSFW 角色卡片结构化

## 实施步骤

- [x] Step 1: 新增类型定义 → `models/social.ts`
  - 新增 `服装状态值`、`服装状态结构`、`里象心法结构`、`NSFW行为特征结构`
  - 在 `NPC结构` 中追加 4 个可选字段
- [x] Step 2: 亲密度等级支持 Level 0 → `models/intimacy.ts`
  - `计算亲密度等级` 中 `好感度 < 0` → `好感度 <= 0` 返回 0
  - 更新注释 `1-5` → `0-5`
- [x] Step 3: 更新亲密度动作约束 → `prompts/runtime/intimacy.ts`
  - 增加 Level 0 早期返回（禁止任何接触）
- [x] Step 4: 新建 NSFW 角色卡片构建器 → `prompts/runtime/nsfwCard.ts`
  - `构建NPC_NSWF卡片` 和 `构建在场NPC_NSWF卡片组`
- [x] Step 5: NPC 上下文序列化 → `hooks/useGame/npcContext.ts`
  - 在 `提取基础数据` 中追加 `亲密度等级` 派生计算
  - 在 `提取完整基础数据` 中追加新字段
- [x] Step 6: 系统集成 → `hooks/useGame/systemPromptBuilder.ts`
  - 新增 `NSFW角色卡片` 到 `系统提示词上下文片段`
  - 在 `systemPrompt` 组装中插入 `nsfwCardBlock`
- [ ] Step 7: 前端 UI 支持（后续）
  - 设置面板中编辑 NPC 的里象心法、服装状态、NSFW行为特征
  - 社交面板中显示亲密度等级和服装状态
- [ ] Step 8: 存档迁移与测试
  - 验证旧存档加载时 `亲密度等级` 从 `好感度` 正确派生
  - 手动构造测试 NPC 验证卡片输出
