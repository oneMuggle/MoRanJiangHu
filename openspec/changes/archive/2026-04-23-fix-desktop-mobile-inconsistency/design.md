## Context

**当前状态**：项目采用桌面端/移动端双组件模式，通过 `App.tsx` 中 `window.matchMedia('(max-width: 767px)')` 检测设备类型，动态加载 Desktop 或 Mobile 组件。

**现有覆盖**：22 个功能模块中，17 个已有完整的桌面端+移动端组件。

**缺失组件**：

| 功能模块 | 桌面端 | 移动端 | 缺失 |
|--------|--------|--------|------|
| SaveLoad | SaveLoadModal | ❌ | MobileSaveLoadModal |
| NovelDecomposition | NovelDecompositionWorkbenchModal | ❌ | MobileNovelDecompositionWorkbenchModal |
| Equipment | EquipmentModal | ❌ | MobileEquipmentModal |
| NewGame 气运卷宗 | NewGameWizard (有气运卷宗) | MobileNewGameWizard (缺) | 气运卷宗功能 |
| NewGame 01世界观 | NewGameWizard (有) | MobileNewGameWizard (缺) | NSFW场景类型、能力类型、武力等级、超能力分类、觉醒程度 |

## Goals / Non-Goals

**Goals:**
- 添加 SaveLoad 移动端组件 (MobileSaveLoadModal)
- 添加 NovelDecomposition 移动端组件 (MobileNovelDecompositionWorkbenchModal)
- 添加 Equipment 移动端组件 (MobileEquipmentModal)
- 在 MobileNewGameWizard 添加气运卷宗功能
- 在 MobileNewGameWizard 添加 01世界观世界法则设定 (NSFW/能力类型/武力等级/超能力/觉醒程度)
- 在 App.tsx 中注册新组件的懒加载
- 确保 MobileQuickMenu 显示这些功能入口

**Non-Goals:**
- 不修改现有桌面端组件的 UI 样式
- 不重构现有 Desktop/Mobile 组件的内部逻辑
- 不添加新功能，仅保持功能一致性
- 不修改后端服务或数据模型

## Decisions

**1. 组件复用策略**：移动端组件复用桌面端组件的 Props 接口和业务逻辑，仅调整布局和样式。

**2. 命名规范**：遵循现有 `MobileXxx.tsx` 命名模式。

**3. 文件位置**：
- SaveLoad: `components/features/SaveLoad/MobileSaveLoadModal.tsx`
- NovelDecomposition: `components/features/NovelDecomposition/MobileNovelDecompositionWorkbenchModal.tsx`
- Equipment: `components/features/Equipment/MobileEquipmentModal.tsx`

**4. 懒加载注册**：遵循 `App.tsx` 行 30-72 的模式，添加：
```typescript
const MobileSaveLoadModal = 创建可预加载懒组件(() => import('./components/features/SaveLoad/MobileSaveLoadModal'));
```

**5. MobileQuickMenu 菜单项**：检查并确认是否已在菜单中显示对应入口。

## Risks / Trade-offs

**[风险] 代码重复**：移动端组件可能与桌面端有重复代码。
→ **缓解**：组件提取公共逻辑，或使用 props 传递布局配置。

**[风险] 功能覆盖不完整**：遗漏某些功能特性。
→ **缓解**：对照桌面端组件功能逐一检查。

**[风险] 断点一致性**：`max-width: 767px` 需保持一致。
→ **缓解**：不修改断点配置。

## 影响评估

**功能影响**：移动用户可使用存档/保存、小说分解、装备查看功能。

**兼容性**：无 API 变更，向后兼容。

**性能**：懒加载模式，首次加载性能无影响。

## 技术方案

### 1. MobileSaveLoadModal

基于 `SaveLoadModal.tsx` 修改：
- 移除桌面端的三栏布局 (LeftPanel 角色 + 中间存档列表 + 右侧详情)
- 改为移动端单栏布局：顶部 Tab 切换 (自动存档/手动存档)，下方存档卡片列表
- 点击存档卡片弹出操作菜单 (读取/删除)
- 参考 `MobileInventoryModal.tsx` 的列表布局

### 2. MobileNovelDecompositionWorkbenchModal

基于 `NovelDecompositionWorkbenchModal.tsx` 修改：
- 移动端使用垂直单栏布局
- 输入表单、章节列表、按钮操作纵向排列
- 参考 `MobileSettingsModal.tsx` 的 tab 面板布局

### 3. MobileEquipmentModal

基于 `EquipmentModal.tsx` 修改：
- 简化为装备槽位网格布局 (2x4 或 3x3)
- 点击槽位显示装备详情
- 参考 `MobileInventoryModal.tsx` 的物品网格布局

### 4. MobileNewGameWizard 气运卷宗

基于 `NewGameWizard.tsx` 行 1770-1852 修改：
- 复制气运卷宗 UI 代码到 MobileNewGameWizard
- 适配移动端布局：单栏列表，卡片式展示
- 保留气运选择逻辑 (toggleQiyun, generateRandomQiyun)
- 需要导入 `气运数据`, `气运数据列表`, `randomQiyun` from `data/qiyun`

### 5. MobileNewGameWizard 01世界观 (世界法则设定)

基于 `NewGameWizard.tsx` 行 1113-1230 修改：

**需添加的世界配置项：**

1. **NSFW 场景类型** (`nsfw场景类型`)
   - 选项: '无', '点到为止', '完全展开'
   - 默认: '无'
   - 需导入: `NSFW场景类型`, `NSFW场景描述映射` from `types`

2. **能力类型** (`能力类型`)
   - 选项: '传统武侠', '修仙体系', '混合世界', '超能力线'
   - 默认: '传统武侠'
   - 需导入: `能力类型`, `能力类型描述映射` from `types`
   - 联动：切换时同步更新武力等级选项

3. **武力等级** (`武力等级`)
   - 选项: 根据能力类型动态过滤
   - 低武/中武/高武 (传统武侠)，修仙 (修仙体系)
   - 默认: '中武'
   - 需导入: `武力等级`, `武力等级描述映射` from `types`

4. **超能力分类** (`超能力分类`)
   - 选项: '未觉醒' + 其他超能力分类
   - 仅当 `能力类型` 包含 '超能力线' 时显示
   - 需导入: `超能力分类`, `超能力分类描述` from `types`

5. **觉醒程度** (`觉醒程度`)
   - 选项: '未觉醒' + 觉醒程度列表
   - 仅当 `超能力分类` 非 '未觉醒' 时显示
   - 需导入: `觉醒程度`, `觉醒程度描述` from `types`

**State 初始化补充** (参考桌面端行 199-214):
```typescript
const [worldConfig, setWorldConfig] = useState<WorldGenConfig>({
    worldName: '太古界',
    worldSize: '九州宏大',
    dynastySetting: '群雄逐鹿，王朝末年',
    sectDensity: '林立',
    tianjiaoSetting: '大争之世，天骄并起',
    武力等级: '中武',
    nsfw场景类型: '无',           // 需补充
    能力类型: '传统武侠',           // 需补充
    超能力分类: '未觉醒',          // 需补充
    觉醒程度: '未觉醒',            // 需补充
    worldExtraRequirement: '',
    manualWorldPrompt: '',
    manualRealmPrompt: '',
    difficulty: 'normal' as 游戏难度
});
```
- 参考桌面端的气运组件结构

## 数据结构

```typescript
// Props 接口保持兼容
interface Props {
    // SaveLoad
    onClose: () => void;
    onLoadGame: (save: 存档结构) => void | Promise<void>;
    onSaveGame?: () => void | Promise<void>;
    mode: 'save' | 'load';
    requestConfirm?: (options) => Promise<boolean>;
    
    // Equipment
    character: 角色数据结构;
    onClose: () => void;
}
```

## 迁移计划

1. 创建 `MobileSaveLoadModal.tsx` (参考 SaveLoadModal)
2. 创建 `MobileNovelDecompositionWorkbenchModal.tsx`
3. 创建 `MobileEquipmentModal.tsx`
4. 在 `MobileNewGameWizard.tsx` 添加气运卷宗功能
5. 在 `MobileNewGameWizard.tsx` 添加 01世界观世界法则设定
   - 补充 worldConfig state 初始化字段 (武力等级/nsfw场景类型/能力类型/超能力分类/觉醒程度)
   - 添加 NSFW 场景类型选择 UI
   - 添加能力类型选择 UI (联动武力等级)
   - 添加超能力分类选择 UI (条件显示)
   - 添加觉醒程度选择 UI (条件显示)
   - 导入所需类型 from `types`
6. 在 `App.tsx` 中注册懒加载
7. 检查 `MobileQuickMenu` 菜单项
8. 构建验证 + Diagnostics 检查

## Open Questions

**Q1**: 是否需要为 Worldbook 添加移动端组件？
**A1**: 初步检查 WorldbookManagerModal 为较简单的表格管理界面，可暂时不添加。如后续需要，再补充。

**Q2**: Chat (ChatList + InputArea) 是否需要移动端专用组件？
**A2**: Chat 是核心交互区，目前在移动端使用默认布局 (MiddlePanel + RightPanel)，功能完整。如有 UI 问题，后续单独处理。