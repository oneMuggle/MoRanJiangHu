## 1. MobileSaveLoadModal

- [x] 1.1 分析 `SaveLoadModal.tsx` 组件结构，提取核心 Props 和业务逻辑
- [x] 1.2 创建 `components/features/SaveLoad/MobileSaveLoadModal.tsx` 移动端组件
- [x] 1.3 适配移动端布局：单栏列表模式，Tab 切换 (自动/手动)
- [x] 1.4 在 App.tsx 添加懒加载

## 2. MobileNovelDecompositionWorkbenchModal

- [x] 2.1 分析 `NovelDecompositionWorkbenchModal.tsx` 组件结构
- [x] 2.2 创建 `components/features/NovelDecomposition/MobileNovelDecompositionWorkbenchModal.tsx`
- [x] 2.3 适配移动端布局：垂直单栏，输入框和按钮纵向排列
- [x] 2.4 在 App.tsx 添加懒加载

## 3. MobileEquipmentModal

- [x] 3.1 分析 `EquipmentModal.tsx` 组件结构，提取装备槽位定义
- [x] 3.2 创建 `components/features/Equipment/MobileEquipmentModal.tsx`
- [x] 3.3 适配移动端布局：网格槽位 (2x4)，点击查看详情
- [x] 3.4 在 App.tsx 添加懒加载

## 4. MobileNewGameWizard 气运卷宗

- [x] 4.1 分析 `NewGameWizard.tsx` 气运卷宗实现 (行 1770-1852)
- [x] 4.2 在 `MobileNewGameWizard.tsx` 添加气运卷宗 UI
- [x] 4.3 适配移动端布局：单栏列表，选中状态展示
- [x] 4.4 验证气运选择逻辑正常工作

## 5. MobileNewGameWizard 世界法则设定

- [x] 5.1 添加 `NSFW场景类型` 选择 ('无'/'点到为止'/'完全展开')
- [x] 5.2 添加「能力类型」选择 ('传统武侠'/'修仙体系'/'混合世界'/'超能力线')
- [x] 5.3 联动添加「武力等级」筛选 ('低武'/'中武'/'高武'/'修仙')
- [x] 5.4 添加「超能力分类」选择 (仅当能力类型含超能力线)
- [x] 5.5 添加「觉醒程度」选择 (仅当超能力分类非未觉醒)
- [x] 5.6 同步 worldConfig 初始化默认值 (参考桌面端行 199-214)
- [x] 5.7 导入所需的类型

## 6. 集成验证

- [x] 6.1 App.tsx 已支持 Desktop/Mobile 切换 (isMobile)
- [x] 6.2 App.tsx 中 activeMobileWindow 已有相关逻辑
- [x] 6.3 运行 `npm run build` 验证构建无错误
- [x] 6.4 构建成功

## 7. 完成标准

- [x] 7.1 移动端可打开存档/保存界面 (MobileSaveLoadModal)
- [x] 7.2 移动端可使用小说分解工作台 (MobileNovelDecompositionWorkbenchModal)
- [x] 7.3 移动端可查看装备面板 (MobileEquipmentModal)
- [x] 7.4 移动端开局生成可选择气运卷宗
- [x] 7.5 移动端 01世界观可设置 NSFW/能力类型/武力等级/超能力/觉醒程度
- [x] 7.6 新组件遵循项目现有 Mobile 组件风格
- [x] 7.7 构建成功，Diagnostics 无新增错误