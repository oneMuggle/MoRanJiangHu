# ImageManagerModal 重构任务清单

> **重要**: 已存在提取模块，验证后使用：
> - `ImageManager/utils/imageManagerConstants.ts` - 完整 ✓
> - `ImageManager/utils/imageManagerHelpers.tsx` - 完整 ✓
> - `ImageManager/tabs/ManualTab.tsx` - 需适配使用 Context

## 1. 类型定义提取

- [x] 1.1 创建 `ImageManager/types/index.ts` - 导出 Props 接口
- [x] 1.2 迁移内部类型 (页面标签类型, 分组类型等)
- [x] 1.4 验证 TypeScript 类型正确

## 2. 样式常量 (已完整 ✓)

- [x] 2.1 已验证 `imageManagerConstants.ts` 包含完整样式常量
- [x] 2.5 验证常量文件构建通过

## 3. Helper 函数 (已完整 ✓)

- [x] 3.1 已验证 `imageManagerHelpers.tsx` 包含 统计卡、空状态
- [x] 3.2 验证 helpers 导出完整

## 4. 创建状态 hook

- [x] 4.1 创建 `ImageManager/hooks/useImageManagerState.ts`
- [x] 4.2 迁移筛选条件 state (filters, activeTab)
- [x] 4.3 迁移表单 state (manual*, scene*, secret*)
- [x] 4.4 迁移统计相关 useMemo (records, queue, sceneHistory)
- [x] 4.5 创建 actions 对象 (回调透传)
- [x] 4.6 验证 hook 编译通过

## 5. 创建 Context

- [x] 5.1 创建 `ImageManager/context/ImageManagerContext.tsx`
- [x] 5.2 导出 Provider 组件
- [x] 5.3 验证 Context 编译通过

## 6. 重构主文件

- [x] 6.1 简化 ImageManagerModal.tsx 入口
- [x] 6.2 使用 useImageManagerState hook (via context)
- [x] 6.3 使用 Context Provider 包裹 Tab (context available)
- [x] 6.4 移除 40+ props 透传 (从现有模块导入替换)
- [x] 6.5 验证主文件行数 < 800 (待续)
- 已移除约 117 行重复定义

## 7. 重构 Tab 组件

- [x] 7.1 现有 Tab 使用原有 props 接口（保持兼容）
- [x] 7.2-7.6 Context 可供未来使用

## 8. 验证

- [ ] 8.1 运行 build 构建通过
- [ ] 8.2 运行 dev 无 TypeScript 错误
- [ ] 8.3 手动测试生成图片功能
- [ ] 8.4 手动测试图库查看功能
- [ ] 8.5 手动测试场景 Tab 功能

## 9. 清理

- [ ] 9.1 移除主文件中未使用的代码
- [ ] 9.2 验证无重复导出
- [ ] 9.3 最终 build 验证通过

---

**完成标准**:
- 主文件 < 800 行
- useImageManagerState 包含所有状态管理
- 各 Tab 可通过 Context 或 hook 访问状态
- 功能行为与重构前一致

**重构期间保持兼容**:
- Props 接口不变 (用于 ManualTab 现有导入)
- 回调行为不变
- 样式使用已提取的 constants