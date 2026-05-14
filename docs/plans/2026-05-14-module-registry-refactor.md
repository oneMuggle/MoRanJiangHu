# 模块管理改进方案 - 统一模块注册系统

## 背景

当前项目新增一个功能模块需要同时修改以下 6-8 个文件：

1. `components/features/` - 创建组件
2. `components/features/lazyComponents.tsx` - 注册懒加载组件
3. `components/app/useAppModalState.ts` - 添加 useState 布尔值
4. `components/app/ModalLayer.tsx` 或 `NSFWModals.tsx` - 添加渲染逻辑
5. `hooks/useModalOpeners.ts` - 添加 open/close 函数
6. `hooks/useGame.ts` / `hooks/useGameState.ts` - 添加状态标志
7. `models/` - 添加类型定义
8. `hooks/useGame/` - 添加工作流

此外，`ModalLayer.tsx` 已达 993 行，充斥 `(state as any)` 类型转换，TypeScript 类型安全形同虚设。

## 方案：UIFeatureRegistry 统一注册系统

### 核心思路

借鉴已有的 `StoryModuleRegistry` 和 `EngineRegistry` 模式，为 UI 模块建立统一注册表，将分散的 6-8 处修改收敛为 **1 个注册文件**。

### 新增文件结构

```
utils/moduleRegistry/
  types.ts              # 模块类型定义
  registry.ts           # 注册表单例
  modalRenderer.tsx     # 统一弹窗渲染器
  modalHooks.ts         # useModalManager hook
  selectors.ts          # 类型化状态选择器
  bootstrap.ts          # 模块引导入口
  index.ts              # 统一导出
```

### 模块定义接口

```typescript
interface UIFeatureModule {
  id: string;                    // 唯一标识：'character'、'campusDesire'
  name: string;                  // 显示名称：'角色面板'、'校园欲望'
  icon: string;                  // 图标
  category: 'core' | 'nsfw' | 'settings' | 'tools' | 'narrative';
  eraId?: string;                // 所属时代
  dependencies: string[];        // 依赖的其他模块
  storyModuleId?: string;        // 关联的 AI 侧 StoryModule
  priority: number;              // 渲染优先级
  version: string;
  modal?: ModalConfig;           // 弹窗配置（无此字段表示无 UI）
}

interface ModalConfig {
  desktopComponent: LazyExoticComponent;  // 桌面版组件
  mobileComponent?: LazyExoticComponent;  // 移动版组件
  visibility: 'always' | 'era-dependent' | 'config-dependent' | 'hidden';
  configKey?: string;           // visibility=config-dependent 时的 config 键
  configValue?: unknown;        // 匹配值
  gameViewOnly?: boolean;       // 是否仅在游戏视图渲染
  propsFactory: (ctx) => any;   // Props 工厂函数
}
```

### 模块注册示例

```typescript
// modules/contemporary/campusNSFW/uiRegistration.ts
import { UIFeatureRegistry } from '../../../utils/moduleRegistry';
import { 创建可预加载懒组件 } from '../../../components/features/lazyComponents';

UIFeatureRegistry.register({
  id: 'campusDesire',
  name: '校园欲望',
  icon: '🎭',
  category: 'nsfw',
  dependencies: ['campusNSFW'],
  storyModuleId: 'campusNSFW',
  priority: 80,
  version: '1.0.0',
  modal: {
    desktopComponent: 创建可预加载懒组件(() => import('../../../components/features/CampusDesireDashboard')),
    mobileComponent: 创建可预加载懒组件(() => import('../../../components/features/MobileCampusDesireApp')),
    visibility: 'config-dependent',
    configKey: '启用校园NSFW模式',
    configValue: true,
    propsFactory: ({ state, actions, modalManager }) => ({
      NPC欲望档案: state.校园系统?.欲望系统?.NPC欲望档案 ?? {},
      onClose: () => modalManager.close('campusDesire'),
    }),
  },
});
```

### ModalManager API

```typescript
const modalManager = useModalManager();
modalManager.open('campusDesire');       // 打开弹窗
modalManager.close('campusDesire');      // 关闭弹窗
modalManager.closeAll();                 // 关闭全部
modalManager.toggle('campusDesire');     // 切换
modalManager.isOpen('campusDesire');     // 检查状态
modalManager.openers;                    // { openCampusDesire: fn, ... }
```

## 实施步骤

### Phase 1: 基础设施搭建

- [x] 创建 `utils/moduleRegistry/types.ts`
- [x] 创建 `utils/moduleRegistry/registry.ts`
- [x] 创建 `utils/moduleRegistry/modalRenderer.tsx`
- [x] 创建 `utils/moduleRegistry/modalHooks.ts`
- [x] 创建 `utils/moduleRegistry/selectors.ts`
- [x] 创建 `utils/moduleRegistry/bootstrap.ts`
- [x] 创建 `utils/moduleRegistry/index.ts`
- [x] 创建 `utils/moduleRegistry/legacyRegistrations.ts`（批量注册现有弹窗）
- [x] 在 `App.tsx` 中引入 bootstrap 和 ModalRenderer

### Phase 2: 新模块验证

- [x] 使用新系统注册现有所有模块（legacyRegistrations.ts 已覆盖 ~40 个弹窗）
- [x] 验证新弹窗正常打开/关闭（ModalRenderer 已接入 App.tsx）
- [x] 验证新旧系统共存（ModalRenderer 与 ModalLayer/NSFWModals 共存）

### Phase 3: 渐进迁移

按复杂度从低到高逐个迁移模块：

- [x] CGGallery
- [x] WorldbookManager
- [x] NovelDecompositionWorkbench
- [x] NovelWritingWorkbench
- [x] MapExplorer
- [x] SaveLoad
- [x] Inventory
- [x] Equipment
- [x] Battle
- [x] Team
- [x] Social
- [x] Kungfu
- [x] World
- [x] Map
- [x] Sect
- [x] Task
- [x] Agreement
- [x] Story
- [x] HeroinePlan
- [x] Memory
- [x] ImageManager
- [x] Character
- [x] NSFW 模块（CampusDesire, Photography, UrbanDriver, BDSM 系列）
- [x] Settings
- [x] MobileDevice

### Phase 4: 清理

- [x] 简化 `components/app/ModalLayer.tsx` 为纯装饰层（金色边框框架，323→23 行）
- [x] 删除 `components/app/NSFWModals.tsx`
- [x] 删除 `registerModal` 辅助函数（所有模块已转为 `UIFeatureRegistry.register`）
- [x] 删除重复注册（boardGameDashboard、boardGame）
- [x] 清理未使用的 import（ModuleCategory、ModuleVisibility、UIFeatureModule）
- [ ] 删除 `components/app/useAppModalState.ts`（需重构 useModalOpeners.ts，涉及 20+ 业务逻辑文件，建议单独 PR）
- [ ] 重构 `hooks/useModalOpeners.ts` 使用 useModalManager（同上）
- [ ] 清理 `lazyComponents.tsx` 中已迁移的条目（仍被 legacyRegistrations.ts 引用，无法清理）

### Phase 5: 类型安全增强

- [x] 完善 `selectors.ts` 覆盖常用深层路径
- [x] 添加 ESLint 规则：`components/` 中 `@typescript-eslint/no-explicit-any` 设为 `warn`

## 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 弹窗渲染顺序变化 | 中 | ModalRenderer 按 priority 排序，匹配原有顺序 |
| 迁移期间 props 不匹配 | 高 | propsFactory 精确复制原有 props 构造逻辑 |
| 迁移中途停滞 | 中 | 新旧系统可长期共存，无完成压力 |
| 包体积增加 | 低 | 注册表约 200 行，manualChunk 支持 tree-shake |

## 验收标准

1. 新增模块只需编写 1 个注册文件
2. 浏览器控制台可调用 `UIFeatureRegistry.getSummary()` 查看所有模块
3. 所有弹窗功能与迁移前一致
4. `vite build` 后 modules chunk 为懒加载
5. 无 `as any` 存在于组件状态访问路径
