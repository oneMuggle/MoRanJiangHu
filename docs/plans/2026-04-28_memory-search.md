# Memory Search 记忆检索功能

> **Status:** 设计中 | **最近更新:** 2026-04-28
> **Plan:** 实现记忆系统的全文检索功能

---

## 背景与目标

当前记忆系统（`记忆系统结构`）包含四层记忆：
- 即时记忆（浮光掠影）
- 短期记忆（浅层识海）
- 中期记忆（深层识海）
- 长期记忆（神魂烙印）

现有 `recallWorkflow` 仅支持剧情回忆检索（根据玩家输入 AI 辅助检索），但缺少**用户主动检索**功能。

本功能目标：允许用户在记忆面板中**输入关键词搜索**四层记忆内容。

---

## 功能设计

### 1. 搜索入口
- 在 `MemoryModal` 和 `MobileMemory` 顶部添加搜索栏
- 搜索图标 + 输入框 + 清除按钮
- 支持随时展开/收起搜索状态

### 2. 搜索算法
利用 `hooks/useGame/memoryRecall.ts` 中的 `提取检索词` 函数进行中文分词和关键词匹配：

```typescript
const 提取检索词 = (raw: string): string[] => {
    // 中英文混合支持
    // 中文支持2-4字连续词提取
    // 英文支持单词匹配
    // 返回长度>=2的关键词
}
```

### 3. 搜索匹配
- 对四层记忆的所有内容进行正则匹配
- 匹配字段：`名称`、`概括`、`原文`（回忆档案）
- 搜索结果显示：**记忆层 + 时间戳 + 匹配内容预览**
- 高亮搜索关键词

### 4. 搜索结果展示
- 新增 `搜索结果` 标签页
- 按相关度排序（命中次数 + 位置权重）
- 显示记忆所属层级（短期/中期/长期）
- 点击跳转到对应记忆条目

---

## 实现方案

### 文件变更

| 文件 | 操作 | 说明 |
|------|------|------|
| `components/features/Memory/MemoryModal.tsx` | 修改 | 添加搜索栏和搜索结果标签页 |
| `components/features/Memory/MobileMemory.tsx` | 修改 | 移动端适配搜索功能 |
| `hooks/useGame/memoryRecall.ts` | 扩展 | 新增 `搜索记忆条目` 导出函数 |

### 核心实现

#### 1. 扩展 `memoryRecall.ts`
```typescript
export type 记忆搜索结果 = {
    id: string;
    层: '即时' | '短期' | '中期' | '长期';
    记忆原文: string;
    概括: string;
    时间戳: string;
    回合: number;
    匹配度: number;
    匹配片段: string;
};

export const 搜索记忆条目 = (
    query: string,
    mem: 记忆系统结构,
    options?: { limit?: number }
): 记忆搜索结果[] => {
    // 实现搜索逻辑
};
```

#### 2. MemoryModal 搜索栏
```tsx
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState<记忆搜索结果[]>([]);

const handleSearch = () => {
    if (!searchQuery.trim()) return setSearchResults([]);
    const results = 搜索记忆条目(searchQuery, memorySystem);
    setSearchResults(results);
};
```

---

## 标签页设计

| 标签 | 说明 |
|------|------|
| `context` | 浮光掠影（即时记忆） |
| `short` | 浅层识海（短期记忆） |
| `medium` | 深层识海（中期记忆） |
| `long` | 神魂烙印（长期记忆） |
| `search` | 检索结果（搜索结果） |

---

## 交互细节

1. **搜索触发**：输入框回车或点击搜索图标
2. **实时搜索**：输入后 300ms 防抖自动搜索
3. **结果限制**：默认最多返回 20 条结果
4. **空结果**：显示"灵台澄空，未寻得相关神念"
5. **清除搜索**：清除按钮重置搜索状态并切回原标签页

---

## 优先级

- **P0**: 核心搜索逻辑（`搜索记忆条目` 函数）
- **P1**: 桌面端 MemoryModal 搜索 UI
- **P2**: 移动端 MobileMemory 搜索 UI

---

## 依赖

- `hooks/useGame/memoryRecall.ts` - 现有 `提取检索词` 函数
- `hooks/useGame/memoryUtils.ts` - 记忆规范化函数
- `components/features/Memory/MemoryModal.tsx` - 现有组件
- `components/features/Memory/MobileMemory.tsx` - 现有组件
