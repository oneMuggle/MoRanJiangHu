## ADDED Requirements

### Requirement: 导入前自动备份本地数据
云存档恢复前，系统 SHALL 自动备份当前本地数据到内存，失败时可检测。

#### Scenario: 备份执行时机
- **WHEN** `restoreSyncData` 函数开始执行
- **THEN** 当前本地存档和设置数据已备份到内存

#### Scenario: 备份内容
- **WHEN** 备份执行
- **THEN** 备份包含：
  - 所有存档（从 IndexedDB saves store 读取）
  - 所有非敏感设置（排除 token 和提示词相关设置）

### Requirement: 备份可检测性
系统 SHALL 提供方法检测上次是否存在备份。

#### Scenario: 检测备份存在
- **WHEN** 调用 `hasBackup()` 方法
- **THEN** 返回 boolean 表示是否存在可用备份