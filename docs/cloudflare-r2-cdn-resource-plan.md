# 墨染江湖 Cloudflare R2 + CDN 资源管理方案

## 1. 概述

### 1.1 背景
墨染江湖项目预计会生成大量图片、音频、TTS 等资源（未来可能达到数GB），直接放在 GitHub 仓库会导致：
- 仓库体积过大，clone 缓慢
- Git LFS 免费额度有限（1GB）
- GitHub 带宽限制

### 1.2 目标
- 资源与代码分离存储
- 支持大文件存储（10GB+）
- 全球 CDN 加速访问
- 运行时动态加载
- 本地缓存减少重复请求

---

## 2. 架构设计

### 2.1 存储分层

```
┌─────────────────────────────────────────────────────────────┐
│                      用户浏览器                              │
├─────────────────────────────────────────────────────────────┤
│                    Cloudflare CDN                           │
│              (全球加速，自动缓存，无流量费)                   │
├─────────────────────────────────────────────────────────────┤
│                    Cloudflare R2                            │
│              (源存储，10GB 免费额度)                         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  images/   │  │   audio/   │  │    tts/    │         │
│  │  (图片)    │  │   (音乐)   │  │   (语音)   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                    GitHub 仓库                              │
│              (代码 + 小型静态资源 < 100KB)                   │
├─────────────────────────────────────────────────────────────┤
│                    IndexedDB                                │
│              (浏览器本地缓存)                                │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 资源分类策略

| 资源类型 | 存储位置 | 大小阈值 | 说明 |
|----------|----------|----------|------|
| 小型图标/UI素材 | GitHub /public | < 100KB | 直接打包 |
| 角色立绘 | R2 CDN | 任意 | 按需加载 |
| 场景图片 | R2 CDN | 任意 | 按需加载 |
| BGM 音乐 | R2 CDN | 任意 | 延迟加载 |
| 音效 SFX | R2 CDN | 任意 | 按需加载 |
| TTS 语音 | R2 CDN | 任意 | 按需生成 |

---

## 3. Cloudflare R2 配置

### 3.1 R2 Bucket 结构

```
wuxia-game-assets/
├── images/
│   ├── characters/          # 角色立绘
│   │   ├── player_001.webp
│   │   └── npc_zhang_wu.webp
│   ├── buildings/           # 建筑场景
│   │   ├── qingfeng_town.webp
│   │   └── xiangeyang_city.webp
│   ├── items/              # 物品图标
│   ├── skills/             # 技能特效
│   ├── ui/                 # UI 素材
│   └── weather/            # 天气效果
├── audio/
│   ├── bgm/                # BGM 音乐
│   │   ├── battle_normal.mp3
│   │   └── village_peace.mp3
│   ├── sfx/                # 音效
│   │   ├── ui_click.mp3
│   │   └── level_up.mp3
│   └── tts/                # TTS 语音
│       ├── npc_male_common.mp3
│       └── npc_female_common.mp3
└── manifest.json           # 资源清单（版本控制用）
```

### 3.2 CDN 域名绑定

| 环境 | 域名 | 说明 |
|------|------|------|
| 开发环境 | `https://dev-assets.wuxia-game.workers.dev` | Cloudflare Workers |
| 生产环境 | `https://assets.wuxia-game.com` | 自定义域名 |

### 3.3 R2 访问策略

```json
// R2 bucket 配置
{
  "bucket_name": "wuxia-game-assets",
  "cors": {
    "allowed_origins": ["*"],
    "allowed_methods": ["GET"],
    "max_age_seconds": 86400
  }
}
```

---

## 4. 资源生成流程（更新版）

### 4.1 定时任务流程

```
22:00 MiniMax资源生成调度
    │
    ├─ 1. 分析资源需求
    │     ├─ 检查 resources/ 目录
    │     └─ 读取 PLAN_WuXiaAIWorld_v2.md
    │
    ├─ 2. 生成资源生成方案
    │     └─ 输出《MiniMax 资源生成方案》文档
    │
    ├─ 3. 执行生成
    │     ├─ MiniMax API 生成图片/音频
    │     └─ 实时上传到 R2（不经过 GitHub）
    │
    └─ 4. 提交 manifest.json 到 GitHub
          └─ 更新版本号
```

### 4.2 R2 上传脚本

```python
# r2_uploader.py

import boto3
import os
from pathlib import Path

class R2Uploader:
    def __init__(self):
        self.account_id = os.environ['CF_ACCOUNT_ID']
        self.access_key_id = os.environ['R2_ACCESS_KEY_ID']
        self.access_key_secret = os.environ['R2_ACCESS_KEY_SECRET']
        self.bucket_name = 'wuxia-game-assets'
        
        # S3 兼容 API
        self.client = boto3.client(
            's3',
            endpoint_url=f'https://{self.account_id}.r2.cloudflarestorage.com',
            aws_access_key_id=self.access_key_id,
            aws_secret_access_key=self.access_key_secret,
            region_name='auto'
        )
    
    def upload_file(self, local_path: str, r2_key: str):
        """上传文件到 R2"""
        self.client.upload_file(local_path, self.bucket_name, r2_key)
        cdn_url = f'https://assets.wuxia-game.com/{r2_key}'
        return cdn_url
    
    def upload_bytes(self, data: bytes, r2_key: str, content_type: str):
        """上传字节数据到 R2"""
        self.client.put_object(
            Bucket=self.bucket_name,
            Key=r2_key,
            Body=data,
            ContentType=content_type
        )
        return f'https://assets.wuxia-game.com/{r2_key}'
```

### 4.3 manifest.json 结构

```json
{
  "version": "1.0.0",
  "updated_at": "2026-04-28T22:00:00Z",
  "base_url": "https://assets.wuxia-game.com",
  "resources": {
    "images": {
      "characters": [
        {
          "id": "player_001",
          "cdn_url": "https://assets.wuxia-game.com/images/characters/player_001.webp",
          "local_path": "resources/images/characters/player_001.webp",
          "size": 45000,
          "hash": "sha256:abc123..."
        }
      ]
    },
    "audio": {
      "bgm": [...],
      "sfx": [...],
      "tts": [...]
    }
  }
}
```

---

## 5. 前端资源加载策略

### 5.1 资源加载器设计

```typescript
// services/resourceLoader.ts

type 资源类型 = 'image' | 'audio' | 'tts';

interface 资源信息 {
  id: string;
  cdnUrl: string;
  localPath: string;  // IndexedDB 缓存路径
  size: number;
  hash: string;
}

class 资源加载器 {
  private manifest: 资源信息[] | null = null;
  private loadingCache = new Map<string, Promise<string>>();
  
  // 从 manifest 加载资源映射
  async 加载清单(): Promise<void> {
    const response = await fetch('/manifest.json');
    this.manifest = await response.json();
  }
  
  // 获取资源 URL（优先本地缓存，其次 CDN）
  async 获取资源Url(resourceId: string): Promise<string> {
    // 1. 检查内存缓存
    const cached = 图片资源缓存.get(`wuxia-asset://${resourceId}`);
    if (cached) return cached;
    
    // 2. 检查 IndexedDB
    const localData = await this.从IndexedDB读取(resourceId);
    if (localData) {
      注册图片资源缓存(resourceId, localData);
      return localData;
    }
    
    // 3. 从 CDN 下载
    const resource = this.manifest?.resources.find(r => r.id === resourceId);
    if (!resource) throw new Error(`资源不存在: ${resourceId}`);
    
    const dataUrl = await this.下载到缓存(resource.cdnUrl);
    注册图片资源缓存(resourceId, dataUrl);
    return dataUrl;
  }
  
  // 预加载关键资源
  async 预加载资源(resourceIds: string[]): Promise<void> {
    await Promise.all(resourceIds.map(id => this.获取资源Url(id)));
  }
  
  // 后台更新缓存
  async 后台更新缓存(): Promise<void> {
    if (!this.manifest) return;
    
    for (const resource of this.manifest.resources) {
      const localExists = await this.IndexedDB中是否存在(resource.id);
      if (!localExists) {
        this.获取资源Url(resource.id).catch(console.error);
      }
    }
  }
}
```

### 5.2 IndexedDB 缓存策略

```typescript
// 使用图片缓存的场景

// 1. 启动时加载 manifest
const resourceLoader = new 资源加载器();
await resourceLoader.加载清单();

// 2. 首次加载时从 CDN 获取
const imageUrl = await resourceLoader.获取资源Url('player_001');

// 3. 后续直接使用缓存
// （图片资源缓存已在内部处理）

// 4. 后台静默更新
resourceLoader.后台更新缓存();
```

---

## 6. 环境变量配置

### 6.1 需要配置的环境变量

```env
# MiniMax API（资源生成用）
MINIMAX_API_KEY=xxx

# Cloudflare R2（资源上传用）
CF_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_ACCESS_KEY_SECRET=xxx

# CDN 域名
CDN_BASE_URL=https://assets.wuxia-game.com
```

### 6.2 Cloudflare 凭证获取

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 R2 → Manage R2 API Tokens
3. 创建 Token，权限选择 "Edit"
4. 保存 Account ID 和 Token 凭证

---

## 7. 定时任务更新

### 7.1 MiniMax 资源生成任务（更新版）

```
每天 22:00 执行：

1. 分析资源需求
   - 检查 resources/ 目录现状
   - 查看 PLAN_WuXiaAIWorld_v2.md

2. 生成资源生成方案

3. 执行资源生成
   - MiniMax API 生成资源
   - 上传到 R2（新增）
   - 更新 manifest.json（新增）

4. 提交更新
   - git add manifest.json
   - git commit & push
   - 注意：资源文件不上传到 GitHub
```

### 7.2 manifest.json 版本控制

只有 manifest.json 需要提交到 GitHub，记录：
- 资源列表
- CDN URL
- 版本信息

实际资源文件存储在 R2，通过 CDN 访问。

---

## 8. 实施步骤

### 8.1 阶段一：Cloudflare 配置

1. 注册 Cloudflare 账号
2. 开通 R2 服务
3. 创建 Bucket：`wuxia-game-assets`
4. 配置 R2 API Token
5. （可选）绑定自定义域名

### 8.2 阶段二：更新生成脚本

1. 安装 boto3：`pip install boto3`
2. 更新 minimax_resource_generator.py
3. 添加 R2 上传功能
4. 添加 manifest.json 生成功能

### 8.3 阶段三：更新前端代码

1. 更新 imageAssets.ts
2. 添加资源加载器
3. 实现 IndexedDB 缓存
4. 添加 manifest 加载逻辑

### 8.4 阶段四：测试

1. 本地测试 R2 上传
2. 测试 CDN 访问
3. 测试缓存机制
4. 测试离线场景

---

## 9. 费用预估

| 项目 | 免费额度 | 超出费用 |
|------|----------|----------|
| R2 存储 | 10 GB/月 | $0.015/GB |
| R2 请求 | 833K/月 | $0.36/million |
| CDN 带宽 | 无限制 | 免费 |
| Cloudflare Workers | 100K/天 | $0.50/million |

### 预估场景

| 资源量 | 存储费用 | 带宽费用 | 总计 |
|--------|----------|----------|------|
| 5 GB | 免费 | 免费 | 免费 |
| 20 GB | $0.15/月 | 免费 | $0.15/月 |
| 100 GB | $1.35/月 | 免费 | $1.35/月 |

---

## 10. 未来扩展

### 10.1 资源版本管理
- 保留历史版本 manifest
- 支持回滚到旧版本资源

### 10.2 增量更新
- 只下载新增/变更的资源
- 节省用户带宽

### 10.3 P2P 共享
- 用户可分享本地缓存资源
- 减轻 CDN 压力
