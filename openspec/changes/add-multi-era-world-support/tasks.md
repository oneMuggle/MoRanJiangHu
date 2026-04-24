## 1. 类型定义与配置

- [ ] 1.1 在 `models/system.ts` 添加 `时代类型` 类型定义 (`'古代' | '现代' | '未来'`)
- [ ] 1.2 在 `游戏设置结构` 接口中添加 `时代?: 时代类型` 字段，默认 `'古代'`
- [ ] 1.3 验证游戏设置结构的向后兼容性

## 2. 时代逻辑提示词模块

- [ ] 2.1 创建 `prompts/core/eraLogic/` 目录结构
- [ ] 2.2 将 `prompts/core/ancientRealism.ts` 重命名为 `eraLogic/ancient.ts` 并导出
- [ ] 2.3 创建 `eraLogic/modern.ts` - 现代社会逻辑提示词
- [ ] 2.4 创建 `eraLogic/future.ts` - 未来科技逻辑提示词
- [ ] 2.5 创建 `eraLogic/index.ts` - 导出 `获取时代逻辑提示词(时代)` 函数

## 3. 时代预设数据

- [ ] 3.1 创建 `data/presets/era/` 目录结构
- [ ] 3.2 创建 `era/ancient.ts` - 复用现有 presets.ts 中的天赋和背景
- [ ] 3.3 创建 `era/modern.ts` - 现代天赋和背景预设
- [ ] 3.4 创建 `era/future.ts` - 未来天赋和背景预设
- [ ] 3.5 创建 `era/index.ts` - 导出 `获取时代预设(时代)` 函数

## 4. 世界生成系统修改

- [ ] 4.1 修改 `prompts/runtime/worldGeneration.ts` - 导入时代逻辑函数
- [ ] 4.2 修改 `获取世界观生成系统提示词` - 根据 config.时代 注入对应逻辑
- [ ] 4.3 验证古代时代使用现有逻辑的兼容性

## 5. UI时代选择器 (可选，后续实现)

- [ ] 5.1 在 `components/features/NewGame/` 创建 `EraSelector.tsx` 组件
- [ ] 5.2 在开局流程中添加时代选择步骤
- [ ] 5.3 测试时代选择UI与游戏设置的联动

## 6. 验证与测试

- [ ] 6.1 验证古代存档可正常加载(向后兼容)
- [ ] 6.2 验证新时代存档的世界生成使用对应提示词
- [ ] 6.3 运行 `npm run build` 确保无构建错误
- [ ] 6.4 检查类型错误 (`lsp_diagnostics`)