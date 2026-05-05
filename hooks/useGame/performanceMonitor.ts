/**
 * 性能监控系统
 * 采集 FPS、AI 响应时间、图片生成时间等关键性能指标
 */

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

export interface UsePerformanceMonitorReturn {
  数据: 性能监控数据;
  记录AI响应: (duration: number) => void;
  记录生图响应: (duration: number) => void;
  获取当前数据: () => 性能监控数据;
}

/**
 * 性能监控 Hook
 * - FPS 计算使用 requestAnimationFrame
 * - 支持记录 AI 响应时间和生图响应时间
 * - 慢操作自动回调警告
 */
export const usePerformanceMonitor = (deps: UsePerformanceMonitorDeps): UsePerformanceMonitorReturn => {
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsValue = useRef(0);
  const dataRef = useRef<性能监控数据>({ fps: 0, 最后更新: Date.now() });

  // FPS 计算使用 requestAnimationFrame 循环
  useEffect(() => {
    let rafId: number;
    const 计算FPS = () => {
      frameCount.current++;
      const now = performance.now();
      const delta = now - lastTime.current;
      if (delta >= 1000) {
        fpsValue.current = Math.round((frameCount.current * 1000) / delta);
        frameCount.current = 0;
        lastTime.current = now;
        dataRef.current = {
          ...dataRef.current,
          fps: fpsValue.current,
          最后更新: Date.now(),
        };
      }
      rafId = requestAnimationFrame(计算FPS);
    };
    rafId = requestAnimationFrame(计算FPS);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // 尝试获取内存信息（仅 Chrome 支持）
  const 获取内存信息 = useCallback((): number | undefined => {
    try {
      // @ts-expect-error performance.memory 是 Chrome 特有 API
      const memory = performance.memory;
      if (memory) {
        return Math.round(memory.usedJSHeapSize / (1024 * 1024));
      }
    } catch {
      // 非 Chrome 环境忽略
    }
    return undefined;
  }, []);

  // 记录 AI 响应时间
  const 记录AI响应 = useCallback((duration: number) => {
    const memoryMB = 获取内存信息();
    dataRef.current = {
      ...dataRef.current,
      ai响应时间: Math.round(duration),
      当前内存MB: memoryMB,
      最后更新: Date.now(),
    };
    // 慢操作警告：AI 响应超过 10 秒
    if (duration > 10000) {
      deps.onSlowOperation?.('AI响应', duration);
    }
  }, [deps, 获取内存信息]);

  // 记录生图响应时间
  const 记录生图响应 = useCallback((duration: number) => {
    const memoryMB = 获取内存信息();
    dataRef.current = {
      ...dataRef.current,
      生图响应时间: Math.round(duration),
      当前内存MB: memoryMB,
      最后更新: Date.now(),
    };
    // 慢操作警告：图片生成超过 30 秒
    if (duration > 30000) {
      deps.onSlowOperation?.('图片生成', duration);
    }
  }, [deps, 获取内存信息]);

  const 获取当前数据 = useCallback((): 性能监控数据 => {
    return { ...dataRef.current };
  }, []);

  return {
    数据: dataRef.current,
    记录AI响应,
    记录生图响应,
    获取当前数据,
  };
};

/**
 * 性能监控 Provider Hook
 * 用于在 useGame 中管理全局性能监控状态
 */
export const usePerformanceTracker = () => {
  const 慢操作记录Ref = useRef<Array<{ 操作: string; 耗时: number; 时间戳: number }>>([]);

  const 处理慢操作 = useCallback((op: string, duration: number) => {
    const 记录 = {
      操作: op,
      耗时: duration,
      时间戳: Date.now(),
    };
    慢操作记录Ref.current.push(记录);
    // 保留最近 20 条记录
    if (慢操作记录Ref.current.length > 20) {
      慢操作记录Ref.current.shift();
    }
    // 输出到控制台
    console.warn(`[性能警告] ${op} 耗时 ${Math.round(duration / 1000)}s`, {
      duration,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const 获取慢操作记录 = useCallback(() => {
    return [...慢操作记录Ref.current];
  }, []);

  const 清除慢操作记录 = useCallback(() => {
    慢操作记录Ref.current = [];
  }, []);

  return {
    处理慢操作,
    获取慢操作记录,
    清除慢操作记录,
  };
};
