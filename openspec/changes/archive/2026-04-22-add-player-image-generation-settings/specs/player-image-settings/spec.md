# 主角生图设置

## ADDED Requirements

### Requirement: 主角生图独立后端开关
设置面板 SHALL 提供开关控制主角生图是否使用独立配置。

#### Scenario: 启用独立后端
- **WHEN** 用户开启「主角生图独立后端」开关
- **THEN** 系统显示主角专属的后端类型选择、模型选择等配置项

#### Scenario: 关闭独立后端
- **WHEN** 用户关闭「主角生图独立后端」开关
- **THEN** 主角生图复用 NPC 生图配置

---

### Requirement: 主角生图后端类型选择
当独立后端启用时，用户 SHALL 能够选择后端类型（openai/novelai/sd_webui/comfyui）。

#### Scenario: 选择 NovelAI 后端
- **WHEN** 用户选择 NovelAI 后端
- **THEN** 显示 NovelAI 相关配置项（API地址、模型等）

#### Scenario: 选择 OpenAI 后端
- **WHEN** 用户选择 OpenAI 后端
- **THEN** 显示 OpenAI 相关配置项

---

### Requirement: 主角生图模型选择
用户 SHALL 能够选择主角专属的生图模型。

#### Scenario: 模型列表获取
- **WHEN** 用户点击「获取列表」按钮
- **THEN** 系统从配置的 API 地址获取可用模型并显示下拉选项

#### Scenario: 自定义模型输入
- **WHEN** 用户在下拉列表中选择或输入模型名
- **THEN** 系统保存该模型作为主角生图使用的模型

---

### Requirement: 主角画师串预设选择
用户 SHALL 能够选择主角专属的画师串预设。

#### Scenario: 选择预设
- **WHEN** 用户从下拉列表选择画师串预设
- **THEN** 系统保存该预设 ID 为主角生图时的画师串来源

#### Scenario: 清除预设
- **WHEN** 用户不选择任何预设（留空）
- **THEN** 主角生图不使用额外画师串

---

### Requirement: 主角 PNG 画风预设选择
用户 SHALL 能够选择主角专属的 PNG 画风预设。

#### Scenario: 选择 PNG 预设
- **WHEN** 用户从下拉列表选择 PNG 画风预设
- **THEN** 系统保存该预设 ID 为主角生图时的画风来源

---

### Requirement: 主角词组转化器预设选择
用户 SHALL 能够选择主角专属的词组转化器预设。

#### Scenario: 选择词组预设
- **WHEN** 用户从下拉列表选择词组转化器预设
- **THEN** 系统保存该预设 ID 为主角生图时的词组转化器来源

---

### Requirement: 主角生图配置持久化
所有主角生图配置 SHALL 在用户点击「保存设置」时持久化到 IndexedDB。

#### Scenario: 保存配置
- **WHEN** 用户修改配置后点击保存
- **THEN** 系统将配置写入数据库，并在下次生图时使用

#### Scenario: 加载配置
- **WHEN** 用户重新打开设置面板
- **THEN** 系统显示上次保存的主角生图配置（如有）