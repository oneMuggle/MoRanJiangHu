## Context

references/气运.md 中「女性向」类别约60条，内容程度差异大。部分可作为一般向娱乐内容，部分需要额外解锁。

## Goals / Non-Goals

**Goals:**
- NSFW 标记从二元扩展为三级
- 一般向内容可直接显示
- 重口向内容需设置开启

**Non-Goals:**
- 不删除任何现有数据
- 不影响已有存档

## Technical Decisions

### 1. 数据结构扩展
```typescript
type Nsfw等级 = 0 | 1 | 2;  // 0=安全, 1=一般, 2=重口

interface 气运结构 {
    // ... 现有字段
    nsfw等级?: Nsfw等级;  // 默认0，可选1或2
}
```

### 2. 兼容性设计
- `nsfw: true` 等于 `nsfw等级: 1`（一般向）
- 新字段优先，旧字段兜底

### 3. 设置存储
- 使用项目现有设置系统（IndexedDB settings）
- 新增 `成人内容: boolean` 设置项
- 默认 false（重口锁定）

### 4. 过滤逻辑
```
if (content.nsfw等级 === 2 && !settings.成人内容) {
    // 不显示
}
```

## Implementation Plan

### Phase 1: 类型扩展
- types.ts 增加 Nsfw等级 类型
- 兼容旧 nsfw 字段

### Phase 2: 内容分级
- 解析「女性向」气运
- 标注每个的等级（1或2）

### Phase 3: 设置项
- 设置面板增加「成人内容」开关
- 保存到 IndexedDB

### Phase 4: 过滤更新
- 更新过滤函数支持分级
- UI 显示逻辑更新

## Impact Assessment

### 功能
- 设置增加开关选项
- 气运显示增加检查

### 兼容性
- 旧存档：nsfw=true 自动映射为等级1
- 已有设置不受影响