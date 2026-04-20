# 代码命名规范

## 1. 概述

本文档定义项目中代码标识符的命名风格，旨在提升可读性、可维护性和跨开发者协作效率。

## 2. 命名语言选择

| 代码层级 | 允许语言 | 示例 |
|----------|----------|------|
| 变量名、函数名、接口名、类型名 | 英文 | `playerName`, `npcMemory`, `GameState` |
| 对象属性键 | 英文 | `{ name: '...', role: '...' }` |
| 注释 | 中英文均可 | `// 获取玩家信息` |
| 字符串常量（UI/域内容） | 中文 | `'请输入姓名'`, `'内功'` |
| Prompt 模板内容 | 中文 + 英文占位符 | `【玩家姓名】${playerName}` |

## 3. 命名风格

### 3.1 变量与函数

```typescript
// ✅ 推荐
const playerName = '...';
function getPlayerInfo() {}

// ❌ 避免
const 玩家名 = '...';
const player_name = '...';  // 不符合 camelCase
```

### 3.2 接口与类型

```typescript
// ✅ 推荐
interface PlayerInfo { name: string; role: string; }
type KungfuType = 'internal' | 'external' | 'lightness';

// ❌ 避免
interface 玩家信息 {}
type 功法类型 = '内功' | '外功';
```

### 3.3 枚举与常量

```typescript
// 常量应同时俱备类型与语义
enum RealmLevel { MORTAL = 1, WARRIOR = 2, MASTER = 3 }

// 或使用 const 断言的只读对象
const KungfuTypes = {
  INTERNAL: 'internal',
  EXTERNAL: 'external',
  LIGHTNESS: 'lightness',
} as const;
```

## 4. 中英文混用避坑指南

### 4.1 同一作用域禁止混用

```typescript
// ❌ 错误：变量名英文，属性键中文
const playerName = data.角色?.姓名;

// ✅ 正确：统一英文
const playerName = data.player?.name;
// 或者数据层保持中文，但代码层不混用
const playerName = data.player?.name;
```

### 4.2 数据结构层可保持中文

数据库、配置数据、保存档、API 返回可使用中文键名：

```typescript
// 数据层示例（可接受）
interface SaveData {
  角色: { 姓名: string; 境界: string };
  物品栏: string[];
}
```

但业务逻辑层应转换为英文：

```typescript
// 业务逻辑层需转换为英文
const player: PlayerInfo = {
  name: saveData.角色.姓名,
  realm: saveData.角色.境界,
};
```

## 5. 领域术语对照表

| 中文术语 | 英文标识 | 说明 |
|----------|----------|------|
| 角色/玩家 | player, user | 游戏主角 |
| 姓名 | name | 角色名称 |
| 境界 | realm | 武力等级 |
| 功法/技能 | skill, kungfu | 技能 |
| 物品/装备 | item, equipment | 道具 |
| NPC | npc | 非玩家角色 |
| 剧情/任务 | quest, story | 任务线 |
| 环境/场景 | environment, scene | 场景 |

## 6. 强制规则（ESLint）

本项目通过 ESLint 规则强制以下规范：

```json
{
  "rules": {
    "id-match": ["error", "^[a-z][a-zA-Z0-9]*$"],
    "no-restricted-syntax": ["error", {
      "selector": "Identifier",
      "filter": "/[\u4e00-\u9fa5]/"
    }]
  }
}
```

> **注意**：数据层文件（如 `data/*.ts` 保存档结构）和配置文件（如 `vite.config.ts`）可申请豁免。

## 7. 豁免申请

以下场景可申请豁免本规范：

- **保存档数据结构**：已上线且用户有历史数据的存档格式
- **外部 API**：第三方接口返回的字段名必须保持原样
- **配置文件**：Vite、Webpack 等工具配置

豁免方式：在文件顶部添加注释

```typescript
// eslint-disable-next-line @typescript-eslint/naming-convention
// 此文件豁免命名规范（保存档兼容）
export const saveData = { ... };
```

## 8. 检查命令

```bash
# 手动检查中文字符标识符
npm run lint:naming

# 或使用 ESLint 检查（需要先配置）
npm run lint
```

---

## 9. 更新历史

| 日期 | 修改人 | 变更内容 |
|------|--------|----------|
| 2025-04-20 | Sisyphus | 初始版本 |