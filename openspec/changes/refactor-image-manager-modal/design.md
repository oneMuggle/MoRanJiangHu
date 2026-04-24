# ImageManagerModal 重构技术设计

## Context

当前 `ImageManagerModal.tsx` 约 4916 行，已混合了多种关注点：
- **7 个页面标签** (manual/library/scene/queue/history/presets/rules)
- **40+ 个回调 props** 需要透传
- **30+ 个 useState** 状态分散
- **多个样式常量与 helper 函数** 混合

项目已启动部分重构：
- `ImageManager/utils/imageManagerConstants.ts` - 状态样式常量
- `ImageManager/utils/imageManagerHelpers.tsx` - 工具函数
- `ImageManager/tabs/ManualTab.tsx` - 手动 Tab (接受 props 注入)

**当前状态**：主文件仍是 monolithic，Tab 组件需要大量 props 传递。

## Goals / Non-Goals

**Goals:**
- 将 ImageManagerModal.tsx 拆分至 < 800 行入口文件
- 创建 `useImageManagerState` hook 集中管理状态
- 建立清晰的数据流：入口 → hook → 子组件
- 各 Tab 通过 hook 获取状态，减少 props 透传

**Non-Goals:**
- 不修改现有功能逻辑
- 不重构移动端 MobileImageManagerModal
- 不变更 API 接口
- 不调整样式主题

## Decisions

### 1. 模块结构

```
components/features/Social/ImageManager/
├── ImageManagerModal.tsx        # 入口，仅组装和回调
├── useImageManagerState.ts # 状态 hook
├── utils/
│   ├── imageManagerConstants.ts  # 已提取 ✓
│   └── imageManagerHelpers.tsx # 已提取 ✓
├── types/
│   └── index.ts       # 共享类型
└── tabs/
    ├── ManualTab.tsx    # 已提取部分
    ├── LibraryTab.tsx
    ├── SceneTab.tsx
    ├── QueueTab.tsx
    ├── HistoryTab.tsx
    └── RulesTab.tsx
```

### 2. Props 传递模式

**当前问题**: ManualTab 接收 40+ props

**方案 A - Props 注入**: 每个 Tab 接收所需 props
- 优点：明确依赖，显式数据流
- 缺点：props 数量仍多

**方案 B - Context**: 创建 ImageManagerContext
- 优点：减少 props 透传
- 缺点：需要 Context Provider

**选择**: **方案 B (Context)** - 与 useImageManagerState 结合

### 3. 状态管理分层

| 状态 | 位置 | 说明 |
|------|------|------|
| 筛选条件 | useImageManagerState | 被 Tab 共用 |
| 当前 Tab | ImageManagerModal | 视图切换 |
| 表单输入 | useImageManagerState | 局部状态 |
| 编辑状态 | useImageManagerState | 草稿数据 |

### 4. Tab 数据获取

**模式**: 每个 Tab 组件接收 `useImageManagerState` 返回的 state 和 actions

```tsx
// Tab 组件签名
const ManualTab = ({ state, actions }: ImageManagerTabProps) => { ... }

// 主文件组装
<ManualTab state={state} actions={actions} />
```

### 5. 样式常量 (已验证完整 ✓)

已有 `imageManagerConstants.ts` (86 行) **完整**包含：
- `状态样式`, `状态文案`
- `队列状态样式`, `队列状态文案`
- `来源文案`
- `标签按钮样式`, `次级按钮样式`, `主按钮样式`
- `卡片样式`, `小标题样式`, `摘要卡片样式`

**无需补充**

## Risks / Trade-offs

### 风险 1: props drilling 仍存在

**描述**: Context 可能在某些场景仍有 props 传递

**缓解**: 确保 Context 覆盖 90%+ props，剩余通过 action 传递

### 风险 2: 破坏现有功能

**描述**: 重构可能引入回归

**缓解**: 
- 保留旧文件作为备份
- 每步重构后验证功能
- 使用 TypeScript 严格检查

### 风险 3: Tab 组件签名变更

**描述**: 现有 Tab 已接受 props，新 hook 接口不同

**缓解**: 
- 渐进式迁移
- 保持旧接口兼容

## Migration Plan

### Phase 1: 提取类型定义

- 创建 `ImageManager/types/index.ts`
- 提取 Props 接口
- 提取内部类型

### Phase 2: 创建 Context + Hook

- ���建 `useImageManagerState.ts`
- 迁移状态 (useState + useMemo + useEffect)
- 导出 actions 对象
- 创建 Context Provider

### Phase 3: 重构主文件

- 简化 ImageManagerModal.tsx
- 使用 Context Provider 包裹 Tab
- 移除 props 透传

### Phase 4: 迁移 Tab 组件

- 更新各 Tab 使用 Context
- 简化 props

### Phase 5: 清理

- 移除未使用的代码
- 验证构建通过
- 删除旧代码

## Performance Impact

- Context slight overhead 可忽略
- 拆分后加载可按需导入 Tab

## Compatibility

- 现有 API (props) 保持不变 (可考虑 deprecated)
- 内部重构，外部无感知