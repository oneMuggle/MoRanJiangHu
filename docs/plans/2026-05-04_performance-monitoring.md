# Performance Monitoring 性能监控

> **Status:** 实现中 | **最近更新:** 2026-05-04
> **Plan:** 实现游戏性能监控与 FPS 显示

---

## 背景与目标

当前游戏缺少统一的性能监控能力，开发者和高级用户无法了解游戏运行时的性能状况。

本功能目标：实现轻量级性能监控，覆盖 FPS、AI 响应时间、图片生成时间等关键指标，并通过设置面板展示。

---

## 功能设计

### 1. 性能指标采集

| 指标 | 说明 | 采集方式 |
|------|------|----------|
| FPS | 帧率 | `requestAnimationFrame` 循环 |
| AI 响应时间 | 主剧情发送耗时 | `performance.now()` 计时 |
| 图片生成时间 | 场景/NPC 生图耗时 | `performance.now()` 计时 |
| 内存使用 | 约略内存占用 | `performance.memory` (Chrome) |
| 状态更新延迟 | React 状态更新耗时 | `performance.now()` 计时 |

### 2. 监控数据输出

```typescript
export type 性能监控数据 = {
  fps: number;
  ai响应时间?: number;
  生图响应时间?: number;
  当前内存MB?: number;
  最后更新: number;
};
```

### 3. 展示方式

- **设置面板**: 添加「性能监控」开关
- **游戏内显示**: 可选的在角落显示 FPS 数值
- **调试日志**: 记录慢操作（AI响应 > 10s, 生图 > 30s）

---

## 实现方案

### 文件变更

| 文件 | 操作 | 说明 |
|------|------|------|
| `hooks/useGame/performanceMonitor.ts` | 新增 | 性能监控 hook |
| `hooks/useGameState.ts` | 修改 | 集成性能监控状态 |
| `utils/settingsSchema.ts` | 修改 | 添加性能监控设置项 |
| `components/features/Settings/` | 修改 | 添加性能监控 UI |

### 核心实现

#### 1. `performanceMonitor.ts`

```typescript
import { useEffect, useRef, useCallback } from 'react';

export interface 性能监控数据 {
  fps: number;
  ai响应时间?: number;
  生图响应时间?: number;
  当前内存MB?: number;
  最后更新: number;
}

export interface UsePerformanceMonitorDeps {
  onSlowOperation?: (op: string, duration: number) => void;
}

export const usePerformanceMonitor = (deps: UsePerformanceMonitorDeps) => {
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fps = useRef(0);
  const dataRef = useRef<性能监控数据>({ fps: 0, 最后更新: Date.now() });

  // FPS 计算使用 requestAnimationFrame
  useEffect(() => {
    let rafId: number;
    const 计算FPS = () => {
      frameCount.current++;
      const now = performance.now();
      const delta = now - lastTime.current;
      if (delta >= 1000) {
        fps.current = Math.round((frameCount.current * 1000) / delta);
        frameCount.current = 0;
        lastTime.current = now;
        dataRef.current = {
          ...dataRef.current,
          fps: fps.current,
          最后更新: Date.now(),
        };
      }
      rafId = requestAnimationFrame(计算FPS);
    };
    rafId = requestAnimationFrame(计算FPS);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // 记录 AI 响应时间
  const 记录AI响应 = useCallback((duration: number) => {
    dataRef.current = {
      ...dataRef.current,
      ai响应时间: duration,
      最后更新: Date.now(),
    };
    if (duration > 10000) {
      deps.onSlowOperation?.('AI响应', duration);
    }
  }, [deps]);

  // 记录生图响应时间
  const 记录生图响应 = useCallback((duration: number) => {
    dataRef.current = {
      ...dataRef.current,
      生图响应时间: duration,
      最后更新: Date.now(),
    };
    if (duration > 30000) {
      deps.onSlowOperation?.('图片生成', duration);
    }
  }, [deps]);

  return {
    数据: dataRef.current,
    记录AI响应,
    记录生图响应,
    获取当前数据: () => ({ ...dataRef.current }),
  };
};
```

#### 2. 集成到 useGameState

在 `useGameState` 中初始化性能监控状态，添加 `performanceConfig` 到游戏设置。

#### 3. 性能监控设置 UI

在设置面板添加：
- 性能监控开关
- FPS 显示开关
- 慢操作警告阈值设置

---

## 交互细节

1. **FPS 显示**: 角落显示纯数字，小字体，不影响游戏
2. **慢操作警告**: 超过阈值时在控制台输出警告
3. **内存监控**: 仅 Chrome 支持，使用约略值

---

## 优先级

- **P0**: `performanceMonitor.ts` 核心 hook
- **P1**: 集成到 useGameState
- **P2**: 设置面板 UI

---

## 依赖

- `hooks/useGameState.ts` - 状态集成
- `utils/settingsSchema.ts` - 设置定义
