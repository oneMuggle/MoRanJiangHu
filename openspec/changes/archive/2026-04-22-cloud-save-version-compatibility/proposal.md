## Why

当前云同步功能使用严格版本检查，当 ZIP 格式版本升级后，旧版本云存档会被直接拒绝恢复，导致用户无法从云端拉取以前同步的存档。当前代码 `version !== 云同步ZIP版本` 时直接抛出错误，缺乏向前/向后兼容性处理。

## What Changes

### 修改
- **宽松版本匹配**：修改 `githubSync.ts` 中的 `restoreSyncData` 函数，允许加载兼容版本范围的云存档（当前版本 ±1 范围内）
- **版本迁移钩子**：在导入流程中添加迁移钩子函数，允许未来版本升级时执行数据迁移逻辑

### 新增
- **版本范围声明**：在云同步清单中声明兼容版本范围，而非单点版本号
- **导入前备份**：恢复云存档前自动备份当前本地数据到临时存储，失败时可回滚
- **迁移日志**：记录版本迁移过程到控制台，辅助排查兼容问题

### 非目标
- IndexedDB schema 版本管理（已有独立的 upgrade 流程）
- 本地 ZIP 导出/导入兼容处理（`saveArchiveService.ts` 独立处理）
- 大版本断裂式升级（如 v1 → v3 跨越两个版本）

## Capabilities

### New Capabilities
- **cloud-save-version-range**: 定义并验证云存档版本兼容性范围，支持向前向后兼容
- **cloud-save-import-backup**: 云存档恢复前自动备份本地数据，失败时可回滚

### Modified Capabilities
- `cloud-sync`: 修改云同步下载的版本验证逻辑，从单点匹配改为范围匹配

## Impact

### 受影响代码
- `services/githubSync.ts` - 修改版本检查逻辑（核心文件）
- 需要时可添加 `services/githubSync/migration.ts` 迁移模块

### 不受影响
- 本地 ZIP 导出 (`saveArchiveService.ts`)
- IndexedDB schema 升级 (`dbService.ts`)
- GitHub API 接口 (`functions/api/github/`)

## 验收标准

- [ ] 云同步下载时，版本号在兼容范围内可正常恢复
- [ ] 云同步下载时，版本号超出兼容范围给出明确错误提示（而非简单拒绝）
- [ ] 导入前自动备份本地数据，失败时可检测到备份
- [ ] 迁移过程有控制台日志输出