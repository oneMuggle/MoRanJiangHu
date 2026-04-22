## 1. 版本兼容范围实现

- [x] 1.1 在 `githubSync.ts` 添加版本范围常量

  ```typescript
  const 云同步ZIP版本 = 1;
  const 兼容的最小版本 = 1;
  const 兼容的最大版本 = 2;
  ```

  **完成标准**：常量已定义，编译通过

- [x] 1.2 修改 `restoreSyncData` 中的版本检查逻辑

  将 `githubSync.ts:646-648`:
  ```typescript
  if (manifest?.format !== 云同步ZIP格式标识 || Number(manifest?.version) !== 云同步ZIP版本) {
      throw new Error('云存档格式不受支持，请重新上传一次云存档。');
  }
  ```
  改为范围检查:
  ```typescript
  const version = Number(manifest?.version);
  if (manifest?.format !== 云同步ZIP格式标识) {
      throw new Error('云存档格式不受支持');
  }
  if (version < 兼容的最小版本 || version > 兼容的最大版本) {
      throw new Error(`云存档版本 ${version} 不在兼容范围内 (${兼容的最小版本}~${兼容的最大版本})，请重新上传一次云存档。`);
  }
  ```

  **完成标准**：版本在范围内可加载，超出范围提示明确错误信息

- [x] 1.3 添加迁移钩子函数（未来版本升级时使用）

  ```typescript
  const 执行版本迁移 = async (fromVersion: number, toVersion: number): Promise<void> => {
      console.log(`[云同步] 从版本 ${fromVersion} 迁移到 ${toVersion}...`);
      // 未来在这里添加迁移逻辑
  };
  ```

  **完成标准**：函数已定义，调用时输出日志

## 2. 备份功能实现

- [x] 2.1 在 `githubSync.ts` 添加本地数据备份函数

  ```typescript
  let 内存备份: { saves: 存档结构[]; settings: any[] } | null = null;

  const 备份当前数据 = async (): Promise<void> => {
      const saves = await dbService.读取存档列表();
      const settingsList = await dbService.获取设置管理清单();
      const settings: any[] = [];
      for (const item of settingsList) {
          if (!item.key || item.key === GITHUB_TOKEN_KEY || 是否提示词相关键(item.key)) continue;
          settings.push({ key: item.key, value: await dbService.读取设置(item.key) });
      }
      内存备份 = { saves, settings };
  };

  export const hasBackup = (): boolean => 内存备份 !== null;
  ```

  **完成标准**：备份函数可执行，`hasBackup()` 返回正确状态

- [x] 2.2 在 `restoreSyncData` 开始时调用备份函数

  **完成标准**：`restoreSyncData` 执行时先调用 `备份当前数据()`

## 3. 验证

- [x] 3.1 用当前版本云存档验证正常恢复

  **完成标准**：下载并恢复当前版本存档无错误

- [x] 3.2 手动构造旧版本 manifest 验证错误提示

  **完成标准**：版本超出范围时错误信息包含具体版本号和兼容范围

- [x] 3.3 运行 `npm run build` 确保无编译错误

  **完成标准**：构建成功，无 error