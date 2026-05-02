# 墨色江湖 - LLM回复标签系统

本文档整理项目中LLM回复的标签要求、渲染逻辑和替换机制。

---

## 一、标签分类

### 1. XML结构标签（顶层）

| 标签 | 必填 | 说明 |
|------|------|------|
| `<正文>` | ✅ | 主剧情内容，三类合法行：旁白、台词、判定 |
| `<短期记忆>` | ✅ | 本回合事实摘要，100字内 |
| `<thinking>` | 可选 | 思考过程，可包含变量规划和剧情规划 |
| `<变量规划>` | 可选 | 本回合变量变化说明 |
| `<剧情规划>` | 可选 | 后续承接摘要 |
| `<disclaimer>` | 可选 | 免责声明 |
| `<行动选项>` | 可选 | 玩家可选行动 |
| `<judge>` | 可选 | 判定子结构，仅存在于`<正文>`内部 |

### 2. 正文内行格式

```
【旁白】文本内容
【角色名】台词内容
【判定】[类型]行动名｜触发对象 玩家:角色名 或 NPC:角色名｜判定值 X/难度 Y｜基础 B(说明)｜环境 E(说明)｜状态 S(说明)｜幸运 L｜装备 Q(说明)｜结果=成功/失败
```

**判定类型**：
- `[通用]` - 通用行动判定
- `[对抗]` - 双人/多方博弈
- `[洞察]` - 识破、发现、侦查
- `[先机] / [瞄准] / [接战] / [防御] / [伤害] / [态势]` - 战斗六阶段
- `[反击]` - 反制特殊动作
- `[反馈] / [消耗] / [衰退]` - 生理反馈与资源代价

### 3. 特殊占位符

| 占位符 | 替换位置 | 说明 |
|--------|--------|------|
| `<AI身份名称占位>` | chatCompletionClient.ts | 发送给AI前替换为实际身份名 |

---

## 二、标签解析逻辑

### 核心文件

- `services/ai/storyResponseParser.ts` - 标签解析入口
- `prompts/core/format.ts` - 输出格式定义
- `services/ai/chatCompletionClient.ts` - 占位符替换

### 解析流程

```
AI回复原始文本
    ↓
修复思考区后半段标签协议文本 (enableTagRepair)
    ↓
检测标签完整性 (validateTagCompleteness)
    ↓
解析为 GameResponse 结构
    ↓
归一化为统一格式
```

### 关键函数

```typescript
// storyResponseParser.ts

// 1. 提取思考区段
提取首尾思考区段(text: string)

// 2. 提取标签内容
提取首个标签内容(text: string, tag: string)

// 3. 解析正文日志
解析正文日志(body: string)

// 4. 解析命令块
解析命令块(commandBlock: string)
```

### 解析输出结构 (GameResponse)

```typescript
interface GameResponse {
    thinking_pre?: string;        // 前置思考
    thinking_native?: string;   // 模型原生思维链
    t_plan?: string;       // 剧情规划
    t_var_plan?: string;   // 变量规划
    logs: Array<{          // 正文日志
        sender: string;   // 发送者：旁白、角色名、【判定】
        text: string;    // 内容
    }>;
    tavern_commands?: Array<{ // 命令
        action: 'add' | 'set' | 'push' | 'delete';
        key: string;
        value: any;
    }>;
    shortTerm?: string;     // 短期记忆
    action_options?: string[]; // 行动选项
    dynamic_world?: string[]; // 动态世界事件
    judge_blocks?: Array<{   // 判定块
        raw: string;
        text: string;
        attachedTo: string;
        isNsfw: boolean;
    }>;
}
```

---

## 三、占位符替换

### 1. 身份占位符替换

**文件**: `services/ai/chatCompletionClient.ts`

```typescript
export const 替换COT伪装身份占位 = (
    cotPrompt: string,
    aiRoleDeclaration: string
): string => {
    const source = typeof cotPrompt === 'string' ? cotPrompt : '';
    if (!source.includes('<AI身份名称占位>')) return source;
    const aiIdentity = 提取AI身份名称(aiRoleDeclaration) || 'AI';
    return source.replace(/<AI身份名称占位>/g, aiIdentity);
};
```

**调用链**:
```
sendWorkflow.ts
    → storyTasks.ts (generateStoryResponse)
    → chatCompletionClient.ts (替换COT伪装身份占位)
    → 发送给模型
```

### 2. 标签修复

**文件**: `services/ai/storyResponseParser.ts`

```typescript
const 修复标签协议文本 = (content: string): string => {
    // 1. 归一化括号符号：＜／＞ → < />
    // 2. 解析标签，建立栈结构
    // 3. 修复未闭合标签
    // 4. 补全缺失区块
};

const 补全协议缺失区块 = (content: string): string => {
    // 确保 <正文> 和 <短期记忆> 存在
};
```

**配置开关** (`hooks/useGame.ts`):
```typescript
const 构建标签解析选项 = (config: 游戏设置结构) => ({
    validateTagCompleteness: config?.启用标签检测完整性 === true,
    enableTagRepair: config?.启用标签修复 !== false,
    requireActionOptionsTag: config?.启用行动选项 !== false
});
```

---

## 四、渲染逻辑

### 渲染文件

- `components/features/Chat/MessageRenderers.tsx` - 消息渲染组件
- `components/features/Chat/TurnItem.tsx` - 回合渲染
- `components/features/Chat/ChatList.tsx` - 聊天列表

### 渲染组件

```tsx
// MessageRenderers.tsx

// 1. 旁白渲染
export const NarratorRenderer: React.FC<{
    text: string;
    visualConfig?: 视觉设置结构;
}> = ({ text, visualConfig }) => (
    <div className="bg-white/5 ...">
        <p>{text}</p>
    </div>
);

// 2. 角色对话渲染
export const CharacterRenderer: React.FC<{
    sender: string;
    text: string;
    visualConfig?: 视觉设置结构;
    socialList?: NPC结构[];
    playerProfile?: 玩家资料;
}> = ({ sender, text, ... }) => (
    <div className="flex ...">
        {/* 头像 */}
        <div className="...">{sender[0]}</div>
        {/* 对话气泡 */}
        <div className="...">{text}</div>
    </div>
);

// 3. 判定渲染
export const JudgmentRenderer: React.FC<{
    text: string;
    thoughtBlock?: JudgmentThoughtBlock;
    isNsfw?: boolean;
    visualConfig?: 视觉设置结构;
    prefix?: string;
}> = ({ text, ... }) => {
    // 解析判定文本
    const parsed = parseJudgmentText(text);

    // 根据判定类型返回不同主题
    const theme = getTheme(); // 战斗/洞察/反馈/NSFW等

    return <div className="...">{parsed.result}</div>;
};
```

### 解析发送者

```typescript
const 规范化日志发送者 = (senderRaw: string): string => {
    const sender = (senderRaw || '').trim();
    if (!sender) return '旁白';
    if (sender === '判定' || sender === '【判定】') return '【判定】';
    if (sender === 'NSFW判定' || sender === '【NSFW判定】') return '【NSFW判定】';
    return sender;
};
```

**渲染映射**:
- `【旁白】` → `<NarratorRenderer />`
- `【角色名】` → `<CharacterRenderer />`
- `【判定】` → `<JudgmentRenderer />`

---

## 五、正文优化标签处理

### 优化流程

```
AI原始回复
    ↓
执行正文润色 (bodyPolish.ts)
    ↓
生成优化版本
    ↓
返回两个版本：body_original_logs / logs
    ↓
渲染时可切换原文/优化视图
```

### 优化标识

```typescript
// GameResponse 中
body_optimized?: boolean;      // 是否已优化
body_optimized_model?: string; // 优化使用的模型
body_optimized_manual?: boolean; // 是否手动优化

// TurnItem.tsx 中显示
已优化正文 ? '已手动优化' : '已自动优化'
```

---

## 六、完整数据流

```
┌────────────────────────────────────────────────────────���─��──┐
│                      用户输入                              │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                   sendWorkflow.ts                          │
│  1. 构建系统提示词 (systemPromptBuilder.ts)              │
│  2. 占位符替换 (<AI身份名称占位>)                       │
│  3. 发送给AI模型                                       │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                   AI模型回复                              │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│              storyResponseParser.ts                       │
│  1. 修复标签协议文本                                    │
│  2. 提取首尾思考区段                                  │
│  3. 提取各标签内容                                   │
│  4. 解析正文日志                                     │
│  5. 解析命令块                                      │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│              GameResponse                                │
│  - thinking_pre / thinking_native                     │
│  - t_plan / t_var_plan                               │
│  - logs (sender + text)                            │
│  - tavern_commands                                │
│  - shortTerm                                    │
│  - action_options                              │
│  - judge_blocks                                │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│            bodyPolish.ts (可选)                         │
│  - 生成优化版本                                        │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│            TurnItem.tsx / MessageRenderers.tsx         │
│  - NarratorRenderer (旁白)                           │
│  - CharacterRenderer (角色对话)                      │
│  - JudgmentRenderer (判定)                          │
└─────────────────────────────────────────────────────┘
```

---

## 七、相关文件索引

### 核心解析
| 文件 | 职责 |
|------|------|
| `services/ai/storyResponseParser.ts` | 标签解析入口 |
| `services/ai/chatCompletionClient.ts` | 占位符替换 |
| `prompts/core/format.ts` | 输出格式定义 |

### 渲染
| 文件 | 职责 |
|------|------|
| `components/features/Chat/MessageRenderers.tsx` | 消息渲染 |
| `components/features/Chat/TurnItem.tsx` | 回合渲染 |
| `components/features/Chat/ChatList.tsx` | 聊天列表 |

### 工作流
| 文件 | 职责 |
|------|------|
| `hooks/useGame/sendWorkflow.ts` | 主剧情发送 |
| `hooks/useGame/bodyPolish.ts` | 正文润色 |
| `hooks/useGame/mainStoryRequest.ts` | 主剧情请求构建 |

### 配置
| 文件 | 职责 |
|------|------|
| `hooks/useGame.ts` | 构建标签解析选项 |
| `utils/gameSettings.ts` | 游戏设置 |

---

## 八、使用示例

### AI回复示例

```xml
<thinking>
本回合需要处理：
1. 玩家要求查看背包 - 直接返回背包状态
2. 可能触发剧情线索 - 预留在变量规划中
</thinking>
<正文>
【旁白】你打开背包，里面装有：
- 银两 50 两
- 疗伤药 3 颗
【小二】"客观还需要点什么？"
</正文>
<短期记忆>玩家查看背包，获得银两和疗伤药信息</短期记忆>
<变量规划>本回合：背包状态已展示，无变量变化</变量规划>
<行动选项>
- 继续对话
- 离开客栈
- 整理背包
</行动选项>
```

### 解析后结构

```javascript
{
    thinking_pre: "本回合需要处理：...",
    logs: [
        { sender: '旁白', text: '你打开背包...' },
        { sender: '小二', text: '"客观还需要点什么？"' }
    ],
    shortTerm: '玩家查看背包...',
    t_var_plan: '本回合：背包状态已展示...',
    action_options: ['继续对话', '离开客栈', '整理背包']
}
```

---

*本文档最后更新于 2026年4月*