## ADDED Requirements

### Requirement: User Manual Generation

项目须生成一份详尽的 Markdown 格式用户手册，放置在 `docs/user-manual.md`，帮助用户快速理解和使用项目。

#### Scenario: Manual Structure

- **WHEN** 用户打开 `docs/user-manual.md`
- **THEN** 手册包含以下章节：
  1. 快速开始
  2. 核心玩法
  3. 功能面板指南
  4. 图像系统
  5. 存档与同步
  6. 设置与配置
  7. 常见问题

#### Scenario: Feature Coverage

- **WHEN** 手册完成后
- **THEN** 覆盖全部 22 个功能模块：Agreement、Auth、Battle、Character、Chat、Equipment、Inventory、Kungfu、Map、Memory、Music、NewGame、NovelDecomposition、SaveLoad、Sect、Settings、Social、Story、Task、Team、World、Worldbook

#### Scenario: Integration

- **WHEN** 手册完成后
- **THEN** `README.md` 包含指向 `docs/user-manual.md` 的链接

### Requirement: Manual Content Requirements

用户手册的内容须满足以下基本要求：

#### Scenario: Quick Start Section

- **WHEN** 用户阅读快速开始章节
- **THEN** 能在 5 分钟内完成首次游戏创建和初始交互

#### Scenario: Function Entry

- **WHEN** 用户想使用某个功能时
- **THEN** 手册明确指出该功能的入口位置（如「点击顶部栏角色按钮打开角色面板」）

#### Scenario: Common Scenarios

- **WHEN** 用户遇到常见游戏场景（如开局创建、战斗、升级）
- **THEN** 手册提供步骤指引

#### Scenario: Language and Format

- **WHEN** 用户阅读手册内容
- **THEN** 语言为简体中文，结构为分级标题（# ## ###），便于跳转