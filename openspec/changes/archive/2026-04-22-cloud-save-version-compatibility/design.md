## Context

当前云同步功能 (`services/githubSync.ts`) 使用严格版本检查。当用户从云端下载存档时，`restoreSyncData` 函数在 `githubSync.ts:646-648` 检查：

```typescript
if (manifest?.format !== 云同步ZIP格式标识 || Number(manifest?.version) !== 云同步ZIP版本) {
    throw new Error('云存档格式不受支持，请重新上传一次云存档。');
}
```

这意味着：
- 云同步 ZIP 版本号必须完全匹配当前代码中的 `云同步ZIP版本 = 1`
- 版本号不同则直接拒绝，无任何兼容性处理
- 存档内容本身无版本字段，游戏逻辑变化时无感知

### 约束
- 云同步为用户主要备份手段，需保证基本可用性
- 不引入额外的外部依赖
- 保持现有导出/上传流程不变

## Goals / Non-Goals

**Goals:**
- 允许兼容版本范围内的云存档正常恢复（向前兼容 + 向后兼容）
- 版本超出兼容范围时给出明确错误提示，而非简单拒绝
- 恢复前备份本地数据，失败时可回滚

**Non-Goals:**
- IndexedDB schema 版本管理（已有独立 upgrade 流程）
- 本地 ZIP 导入/导出兼容处理（`saveArchiveService.ts` 独立）
- 跨越大版本断裂式升级（v1 → v3+）

## Decisions

### 方案：版本范围匹配 vs 精确版本匹配

| 方案 | 优点 | 缺点 |
|------|------|------|
| 版本范围匹配 | 向前+向后兼容，用户体验好 | 需要定义兼容范围 |
| 每次发布递增版本 + 手动处理迁移 | 精确控制 | 需要维护迁移脚本，工作量大 |

**决策**：采用版本范围匹配。这是业界通用做法，实现成本低，用户体验好。

### 技术方案

1. **定义兼容版本范围常量**
   ```typescript
   const 云同步ZIP版本 = 1;              // 当前版本
   const 兼容的最小版本 = 1;              // 向后兼容：允许旧版本恢复
   const 兼容的最大版本 = 2;              // 向前兼容：新版本存档降级恢复
   ```

2. **修改版本检查逻辑** (`githubSync.ts:646-648`)
   ```typescript
   const version = Number(manifest?.version);
   if (manifest?.format !== 云同步ZIP格式标识) {
       throw new Error('云存档格式不受支持');
   }
   if (version < 兼容的最小版本 || version > 兼容的最大版本) {
       throw new Error(`云存档版本 ${version} 不在兼容范围内 (${兼容的最小版本}~${兼容的最大版本})，请重新上传一次云存档。`);
   }
   ```

3. **添加迁移钩子** (未来版本升级时使用)
   ```typescript
   const 执行版本迁移 = async (fromVersion: number, toVersion: number): Promise<void> => {
       console.log(`[云同步] 从版本 ${fromVersion} 迁移到 ${toVersion}...`);
       // 未来在这里添加迁移逻辑
   };
   ```

4. **导入前备份本地数据**
   ```typescript
   const 备份当前数据 = async (): Promise<{ saves: 存档结构[]; settings: any[] }> => {
       // 备份当前 saves 和 settings 到内存
   };
   ```

### 数据结构

**修改`云同步ZIP清单`类型**，添加范围字段（可选）：
```typescript
type 云同步ZIP清单 = {
    format: typeof 云同步ZIP格式标识;
    version: number;
    compatibleRange?: { min: number; max: number };  // 可选，未来使用
    exportedAt: string;
    // ... 现有字段
};
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| 旧版本存档加载后缺字段导致运行时错误 | 尽量避免必填字段变化，字段设为可选 |
| 未定义最大兼容版本导致未来兼容负担 | 每次发版评估是否需要调整范围 |
| 备份占用内存导致内存压力 | 备份仅在 restoreSyncData 执行期间存在 |

## Migration Plan

1. **部署步骤**
   - 修改 `githubSync.ts` 中的版本检查逻辑
   - 添加版本范围常量
   - 可选：添加迁移钩子空实现

2. **验证方式**
   - 用当前版本的云存档下载验证正常恢复
   - 手动构造旧版本 manifest 验证错误提示正确

3. **回滚**
   - 如有问题，恢复到修改前的 `githubSync.ts` 即可

## Open Questions

- **Q1**: 是否需要在 manifest 中声明 `compatibleRange` 以便未来灵活调整？
  - 建议：暂不添加，保持当前单点版本号，未来需要时再说
- **Q2**: 本地 ZIP 导出 (`saveArchiveService.ts`) 是否也需要类似处理？
  - 建议：独立处理，该文件已有 fallback 逻辑