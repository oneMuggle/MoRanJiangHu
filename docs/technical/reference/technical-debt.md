# 技术债追踪文档

> 关联文档: `docs/big-file-optimization.md`  
> 更新日期: 2026-04-21  
> 状态: 🔧 标记中

---

## 📋 技术债清单

根据 `big-file-optimization.md` 中的渐进式处理原则，以下为待替换的内联实现。**每次修改相关模块时，顺便替换技术债位置**。

---

### 🔴 ImageManagerModal.tsx - Tab 函数替换

**文件**: `components/features/Social/ImageManagerModal.tsx`  
**总行数**: 4805 行  
**目标**: 替换 6 个内联 Tab 函数为独立组件

| # | Tab函数 | 行号范围 | 当前实现 | 目标组件 | 替换优先级 |
|---|--------|----------|----------|----------|------------|
| 1 | `renderManualTab` | ~1897-2130 | 内联 JSX | `tabs/ManualTab.tsx` | P1 |
| 2 | `renderLibraryTab` | ~2131-2480 | 内联 JSX | `tabs/LibraryTab.tsx` | P1 |
| 3 | `renderQueueTab` | ~2481-2725 | 内联 JSX | `tabs/QueueTab.tsx` | P1 |
| 4 | `renderSceneTab` | ~2726-2883 | 内联 JSX | `tabs/SceneTab.tsx` | P1 |
| 5 | `renderHistoryTab` | ~2884-3304 | 内联 JSX | `tabs/HistoryTab.tsx` | P1 |
| 6 | `renderRulesTab` | ~3305-4220 | 内联 JSX | `tabs/RulesTab.tsx` | P1 |

**替换触发**: 当修改任何 Tab 的 UI/交互逻辑时，替换为对应组件并更新调用方式

**替换示例**:
```tsx
// 当前 (ImageManagerModal.tsx)
const renderQueueTab = () => (
  // ... 500+ 行内联代码
);

// 替换后
import { QueueTab } from './ImageManager/tabs/QueueTab';

// 在渲染函数中
{activeTab === 'queue' && <QueueTab {...props} />}
```

**Props 传递**: 需要传递 ~40 个 props，包括：
- 状态: `images`, `queue`, `library`, `presets`, `rules`, `scenes` 等
- setters: `setImages`, `setQueue`, `setLibrary` 等
- handlers: `handleGenerate`, `handleDelete`, `handleEdit`, `handleSave` 等

---

### 🔴 imageTasks.ts - 多重职责拆分

**文件**: `services/ai/image/imageTasks.ts`  
**总行数**: 3590 行  
**目标**: 拆分为独立模块

| # | 功能模块 | 行号范围 | 当前实现 | 目标文件 | 替换优先级 |
|---|----------|----------|----------|----------|------------|
| 1 | 常量定义 | ~1-200 | 内联常量 | `constants.ts` | P2 |
| 2 | 词组转换 | ~200-800 | 字符/场景/秘事分词器 | `tokenizer/*.ts` | P2 |
| 3 | PNG解析 | ~800-1300 | png解码 + 数据提取 | `parser/pngParser.ts` | P2 |
| 4 | 锚点提取 | ~1300-1700 | 角色锚点解析 | `parser/anchorExtractor.ts` | P2 |
| 5 | 后端适配 | ~1700-2500 | 多后端混合 | `backends/*.ts` | P2 |
| 6 | 本地存储 | ~2500-2900 | IndexedDB操作 | `persistence.ts` | P2 |
| 7 | 工具函数 | ~2900-3590 | 杂项工具 | `utils/*.ts` | P3 |

**替换触发**: 当修改任何 AI 后端配置或新增后端时，按模块拆分

---

### 🟠 NovelDecompositionSettings.tsx - 面板区域拆分

**文件**: `components/features/Settings/NovelDecompositionSettings.tsx`  
**总行数**: 3037 行  
**目标**: 拆分为独立面板

| # | 面板区域 | 行号范围 | 目标组件 | 替换优先级 |
|---|----------|----------|----------|------------|
| 1 | API 配置区 | ~200-600 | `panels/ApiConfigPanel.tsx` | P2 |
| 2 | 注入设置区 | ~600-1100 | `panels/InjectionPanel.tsx` | P2 |
| 3 | 预览区 | ~1100-1400 | `panels/PreviewPanel.tsx` | P2 |
| 4 | 导入导出区 | ~1400-1600 | `panels/ImportExportPanel.tsx` | P2 |
| 5 | 调度配置区 | ~1600-1900 | `panels/SchedulerPanel.tsx` | P2 |
| 6 | 分卷设置区 | ~1900-2200 | `panels/SplitPanel.tsx` | P2 |

**替换触发**: 当修改任何设置面板时，按区域拆分

---

### 🟠 移动端代码重复

**文件 A**: `components/features/Social/ImageManagerModal.tsx` (4805行)  
**文件 B**: `components/features/Social/mobile/MobileImageManagerModal.tsx` (3096行)  
**重复率**: ~60%

| # | 共享模块 | 桌面端实现 | 移动端实现 | 目标文件 | 替换优先级 |
|---|----------|------------|------------|----------|------------|
| 1 | 状态管理 | 内联 useState | 内联 useState | `shared/useSharedImageLogic.ts` | P2 |
| 2 | 过滤逻辑 | 内联函数 | 内联函数 | `shared/imageFilters.ts` | P2 |
| 3 | Tab渲染 | 内联组件 | 内联组件 | `shared/ImageManagerBase.tsx` | P2 |

**替换前提**: ImageManagerModal.tsx Tab 函数替换完成后

**替换触发**: 当修改桌面端 Tab UI 时，同步更新移动端

---

### 🟡 设置面板模式重复

**文件列表**:
- `NovelDecompositionSettings.tsx` (3037行)
- `ImageGenerationSettings.tsx` (1627行)
- `IntegratedModelSettings.tsx` (959行)
- `ApiSettings.tsx` (728行)
- `VisualSettings.tsx` (699行)

**目标**: 通用 `SettingsPanel.tsx` 框架

**替换优先级**: P3 (可选)

---

## 🔧 替换触发器清单

当以下事件发生时，检查技术债：

| 事件 | 检查技术债 | 目标文件 |
|------|----------|----------|
| 修改 QueueTab UI | ImageManagerModal Tab替换 | `ImageManager/tabs/QueueTab.tsx` |
| 修改 HistoryTab UI | ImageManagerModal Tab替换 | `ImageManager/tabs/HistoryTab.tsx` |
| 修改 LibraryTab UI | ImageManagerModal Tab替换 | `ImageManager/tabs/LibraryTab.tsx` |
| 修改 RulesTab UI | ImageManagerModal Tab替换 | `ImageManager/tabs/RulesTab.tsx` |
| 修改 SceneTab UI | ImageManagerModal Tab替换 | `ImageManager/tabs/SceneTab.tsx` |
| 修改 ManualTab UI | ImageManagerModal Tab替换 | `ImageManager/tabs/ManualTab.tsx` |
| 新增 AI 后端支持 | imageTasks 拆分 | `services/ai/image/backends/` |
| 修改 NovelAI 配置 | imageTasks 拆分 | `services/ai/image/backends/novelaiAdapter.ts` |
| 修改 API 设置 | NovelDecompositionSettings 拆分 | `panels/ApiConfigPanel.tsx` |
| 修改导入导出 | NovelDecompositionSettings 拆分 | `panels/ImportExportPanel.tsx` |
| 修改移动端图片管理 | 移动端代码重复 | `shared/` |

---

## 📝 替换检查清单

每次提交前检查：

- [ ] 本次修改是否涉及技术债位置？
- [ ] 是的话，是否顺便完成替换？
- [ ] 替换后是否运行构建验证？
- [ ] 是否更新了调用方代码？

---

## 🔄 替换工作流

```
用户/开发者修改模块
    ↓
触发检查 (发现技术债位置)
    ↓
决定: 是否顺便替换？
    ├── 是 → 执行替换 → 构建验证 → 提交
    └── 否 → 记录待办 → 稍后处理
```

---

## 📊 状态追踪

| 技术债 | 状态 | 替换进度 |
|--------|------|----------|
| ImageManagerModal Tab替换 | 🔧 标记中 | 0/6 |
| imageTasks 多重职责 | 🔧 待开始 | 0/7 |
| NovelDecompositionSettings 拆分 | 🔧 待开始 | 0/6 |
| 移动端代码重复 | 🔧 待开始 | 0/3 |
| 设置面板模式重复 | 🔧 待开始 | 0/5 |

---

## 📅 替换日志

| 日期 | 技术债 | 替换内容 | 操作者 |
|------|--------|----------|--------|
| 2026-04-21 | 创建文档 | 初始技术债追踪 | Sisyphus |

---

*本文档由 Sisyphus 生成*