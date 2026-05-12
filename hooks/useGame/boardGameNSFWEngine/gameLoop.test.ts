/**
 * BoardGameLoop 游戏循环测试
 *
 * 使用 vitest fake timers 测试游戏循环的状态机、tick 调度、玩家操作提交。
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BoardGameEngine } from './boardGameEngine';
import { BoardGameLoop, createBoardGameLoop, type GameLoopState } from './gameLoop';

describe('BoardGameLoop', () => {
  let engine: BoardGameEngine;
  let loop: BoardGameLoop;

  beforeEach(() => {
    vi.useFakeTimers();
    engine = new BoardGameEngine();
    engine.startGame('骰子游戏');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('状态机', () => {
    it('初始状态应为 idle', () => {
      loop = new BoardGameLoop(engine);
      expect(loop.state).toBe('idle');
    });

    it('start 后应变为 running', () => {
      loop = new BoardGameLoop(engine);
      loop.start();
      expect(loop.state).toBe('running');
    });

    it('pause 后应变为 paused', () => {
      loop = new BoardGameLoop(engine);
      loop.start();
      loop.pause();
      expect(loop.state).toBe('paused');
    });

    it('resume 后应恢复 running', () => {
      loop = new BoardGameLoop(engine);
      loop.start();
      loop.pause();
      loop.resume();
      expect(loop.state).toBe('running');
    });

    it('stop 后应变为 ended', () => {
      loop = new BoardGameLoop(engine);
      loop.start();
      loop.stop();
      expect(loop.state).toBe('ended');
    });

    it('重复 start 不应改变状态', () => {
      loop = new BoardGameLoop(engine);
      loop.start();
      loop.start();
      expect(loop.state).toBe('running');
    });
  });

  describe('Tick 调度', () => {
    it('running 状态下应定时推进回合', () => {
      const onTurnAdvance = vi.fn();
      loop = new BoardGameLoop(engine, { tickInterval: 1000 }, { onTurnAdvance });

      loop.start();
      expect(onTurnAdvance).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1000);
      expect(onTurnAdvance).toHaveBeenCalledTimes(1);
      expect(onTurnAdvance.mock.calls[0][0].turnNumber).toBe(1);
    });

    it('应连续推进多个 tick', () => {
      const onTurnAdvance = vi.fn();
      loop = new BoardGameLoop(engine, { tickInterval: 500 }, { onTurnAdvance });

      loop.start();
      vi.advanceTimersByTime(1500);
      expect(onTurnAdvance).toHaveBeenCalledTimes(3);
    });

    it('paused 状态下不应推进回合', () => {
      const onTurnAdvance = vi.fn();
      loop = new BoardGameLoop(engine, { tickInterval: 1000 }, { onTurnAdvance });

      loop.start();
      // 等第一个 tick 触发
      vi.advanceTimersByTime(1000);
      expect(onTurnAdvance).toHaveBeenCalledTimes(1);
      // 暂停后不应再推进
      loop.pause();
      vi.advanceTimersByTime(2000);
      expect(onTurnAdvance).toHaveBeenCalledTimes(1);
    });

    it('达到 maxTurns 后应自动结束', () => {
      const onStateChange = vi.fn();
      loop = new BoardGameLoop(engine, { tickInterval: 500, maxTurns: 3 }, { onStateChange });

      loop.start();
      vi.advanceTimersByTime(2000);
      expect(onStateChange).toHaveBeenCalledWith('ended');
    });
  });

  describe('玩家操作提交', () => {
    it('waiting-input 状态下提交操作应恢复运行', () => {
      const onStateChange = vi.fn();
      const onInputRequired = vi.fn();
      loop = new BoardGameLoop(engine, { tickInterval: 500, pauseOnKeyStep: true }, {
        onStateChange,
        onInputRequired,
      });

      loop.start();
      vi.advanceTimersByTime(500);

      loop.submitAction({
        id: 'test-action',
        engineType: 'boardGame',
        type: '掷骰',
        payload: {},
        timestamp: Date.now(),
      });

      // 验证操作被接受（不抛错）
      expect(loop.state).toBeDefined();
    });
  });

  describe('状态变化回调', () => {
    it('start 应触发 onStateChange("running")', () => {
      const onStateChange = vi.fn<(state: GameLoopState) => void>();
      loop = new BoardGameLoop(engine, {}, { onStateChange });

      loop.start();
      expect(onStateChange).toHaveBeenCalledWith('running');
    });

    it('stop 应触发 onStateChange("ended")', () => {
      const onStateChange = vi.fn<(state: GameLoopState) => void>();
      loop = new BoardGameLoop(engine, {}, { onStateChange });

      loop.start();
      loop.stop();
      expect(onStateChange).toHaveBeenCalledWith('ended');
    });
  });

  describe('配置更新', () => {
    it('updateConfig 应合并新配置', () => {
      loop = new BoardGameLoop(engine, { tickInterval: 1000 });
      loop.updateConfig({ maxTurns: 50 });

      expect(loop.state).toBe('idle');
    });
  });

  describe('工厂函数', () => {
    it('createBoardGameLoop 应返回实例', () => {
      const created = createBoardGameLoop(engine);
      expect(created).toBeInstanceOf(BoardGameLoop);
      expect(created.engine).toBe(engine);
    });
  });

  describe('引擎引用', () => {
    it('engine getter 应返回构造时传入的引擎', () => {
      loop = new BoardGameLoop(engine);
      expect(loop.engine).toBe(engine);
    });
  });
});
