/**
 * constraintBuilder.test.ts
 *
 * ConstraintBuilder 单元测试：分层注册、XML 生成、大小监控
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConstraintBuilder, createConstraintBuilder } from './constraintBuilder';
import type { ConstraintLayer, GameStore } from './constraintBuilder';

describe('ConstraintBuilder', () => {
  let builder: ConstraintBuilder;

  beforeEach(() => {
    builder = createConstraintBuilder();
  });

  const mockState: GameStore = {
    globalTurn: 23,
    currentPhase: 'narrative',
    activeEngines: ['boardGame', 'phoneSim'],
    角色: { name: '主角' },
    桌游系统: { 桌游类型: '真心话大冒险', 紧张度: 5 },
  };

  describe('register / unregister', () => {
    it('registers a layer', () => {
      const layer: ConstraintLayer = {
        priority: 'critical',
        build: () => '<test/>',
      };
      builder.registerLayer('test', layer);
      expect(builder.getLayerNames()).toContain('test');
    });

    it('overwrites existing layer with same name', () => {
      builder.registerLayer('test', { priority: 'critical', build: () => '<old/>' });
      builder.registerLayer('test', { priority: 'optional', build: () => '<new/>' });
      expect(builder.build(mockState)).toContain('<new/>');
    });

    it('unregisters a layer', () => {
      builder.registerLayer('test', { priority: 'critical', build: () => '<test/>' });
      builder.unregisterLayer('test');
      expect(builder.getLayerNames()).not.toContain('test');
    });
  });

  describe('build', () => {
    it('wraps layers in XML', () => {
      builder.registerLayer('slg', {
        priority: 'critical',
        build: () => '<SLG层><回合>23</回合></SLG层>',
      });
      const xml = builder.build(mockState);
      expect(xml).toContain('<游戏叙事约束>');
      expect(xml).toContain('</游戏叙事约束>');
      expect(xml).toContain('<SLG层>');
    });

    it('includes multiple layers', () => {
      builder.registerLayer('slg', {
        priority: 'critical',
        build: () => '<SLG层/>',
      });
      builder.registerLayer('scene', {
        priority: 'important',
        build: () => '<场景层/>',
      });
      const xml = builder.build(mockState);
      expect(xml).toContain('<SLG层/>');
      expect(xml).toContain('<场景层/>');
    });

    it('skips layers that return null', () => {
      builder.registerLayer('empty', {
        priority: 'critical',
        build: () => null,
      });
      const xml = builder.build(mockState);
      expect(xml).toBe('<游戏叙事约束>\n\n</游戏叙事约束>');
    });

    it('respects priority ordering', () => {
      const order: string[] = [];
      builder.registerLayer('optional', {
        priority: 'optional',
        build: () => { order.push('optional'); return '<O/>'; },
      });
      builder.registerLayer('critical', {
        priority: 'critical',
        build: () => { order.push('critical'); return '<C/>'; },
      });
      builder.registerLayer('important', {
        priority: 'important',
        build: () => { order.push('important'); return '<I/>'; },
      });
      builder.build(mockState);
      expect(order).toEqual(['critical', 'important', 'optional']);
    });

    it('skips optional layers that exceed size limit', () => {
      builder.registerLayer('big-critical', {
        priority: 'critical',
        build: () => '<B>'.repeat(600),
      });
      builder.registerLayer('big-optional', {
        priority: 'optional',
        build: () => '<O>'.repeat(600),
      });
      const xml = builder.build(mockState);
      expect(xml).toContain('<B>');
      expect(xml).not.toContain('<O>');
    });

    it('produces valid empty XML when no layers', () => {
      const xml = builder.build(mockState);
      expect(xml).toBe('<游戏叙事约束>\n\n</游戏叙事约束>');
    });
  });

  describe('getSize', () => {
    it('returns byte size', () => {
      builder.registerLayer('test', {
        priority: 'critical',
        build: () => '<test/>',
      });
      const size = builder.getSize(mockState);
      expect(size).toBeGreaterThan(0);
    });
  });

  describe('getLayerSizes', () => {
    it('returns per-layer size info', () => {
      builder.registerLayer('a', {
        priority: 'critical',
        build: () => '<a/>',
      });
      builder.registerLayer('b', {
        priority: 'important',
        build: () => '<bb/>',
      });
      const sizes = builder.getLayerSizes(mockState);
      expect(sizes).toHaveLength(2);
      expect(sizes.find((s) => s.name === 'a')).toBeTruthy();
      expect(sizes.find((s) => s.name === 'b')).toBeTruthy();
    });
  });

  describe('factory', () => {
    it('createConstraintBuilder returns new instance', () => {
      const a = createConstraintBuilder();
      const b = createConstraintBuilder();
      expect(a).not.toBe(b);
    });
  });
});
