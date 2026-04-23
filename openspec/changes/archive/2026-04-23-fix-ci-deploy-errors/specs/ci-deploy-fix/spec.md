## ADDED Requirements

### Requirement: CI/CD 部署工作流正常运行
GitHub Actions 自动部署到 Cloudflare Pages 时 SHALL 确保部署流程无错误完成。

#### Scenario: 正常部署流程
- **WHEN** 代码推送到 main 分支
- **THEN** GitHub Actions 自动触发构建和部署
- **AND** wrangler pages deploy 命令执行成功
- **AND** 部署返回成功状态和 URL

### Requirement: wrangler.toml 配置正确生成
部署过程中 wrangler.toml 配置 SHALL 正确生成且无解析错误。

#### Scenario: 动态配置生成
- **WHEN** wrangler 读取配置
- **THEN** account_id 字段 SHALL 是有效的单行字符串
- **AND** 不包含换行符或特殊字符

### Requirement: Commit message 使用 UTF-8 编码
部署命令中的 commit message SHALL 是有效的 UTF-8 字符串。

#### Scenario: 使用固定 commit message
- **WHEN** 执行 wrangler pages deploy
- **THEN** commit message SHALL 仅包含 ASCII 字符
- **AND** 不包含 git diff 内容
- **AND** 长度不超过 1024 字符

### Requirement: 项目部署到已有项目
部署命令 SHALL 使用已有的 Cloudflare Pages 项目。

#### Scenario: 部署到已有项目
- **WHEN** wuxia-game 项目已存在于 Cloudflare Pages
- **THEN** 部署命令 SHALL 指定正确的项目名称
- **AND** 不尝试重复创建项目

### Requirement: 构建产物正确上传
部署过程 SHALL 正确上传 dist 目录下的所有文件。

#### Scenario: 文件上传
- **WHEN** wrangler 上传构建产物
- **THEN** dist 目录下的所有文件 SHALL 上传成功
- **AND** 上传进度显示正确
- **AND** 返回 "Success" 状态