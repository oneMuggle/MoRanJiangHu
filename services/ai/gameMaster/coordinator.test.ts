/**
 * @module services/ai/gameMaster/coordinator.test
 * 游戏大师协调器测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 游戏大师协调器, 创建游戏大师协调器, 执行游戏大师流程 } from './coordinator';
import type { 游戏大师依赖接口, 游戏大师触发参数 } from './types';

// Mock dependencies
const createMockDeps = (overrides?: Partial<游戏大师依赖接口>): 游戏大师依赖接口 => ({
    apiSettings: {},
    gameConfig: {},
    角色: { 姓名: '测试角色' },
    环境: { 当前位置: '江湖镇', 时间: '清晨' },
    世界: { 活跃NPC列表: [], 待执行事件: [], 进行中事件: [] },
    剧情: { 当前章节: 1, 当前回合: 1 },
    记忆系统: { 短期记忆: [], 长期记忆: [] },
    历史记录: [],
    社交列表: [],
    规范化环境信息: (env) => env || {},
    规范化世界状态: (world) => world || {},
    规范化剧情状态: (story) => story || {},
    设置剧情: vi.fn(),
    设置世界: vi.fn(),
    设置记忆系统: vi.fn(),
    processResponseCommands: vi.fn().mockReturnValue({}),
    set世界演变更新中: vi.fn(),
    set世界演变状态文本: vi.fn(),
    set变量校准更新中: vi.fn(),
    set变量校准状态文本: vi.fn(),
    set规划更新中: vi.fn(),
    set规划状态文本: vi.fn(),
    世界演变进行中Ref: { current: false },
    世界演变去重签名Ref: { current: '' },
    set世界演变最近更新时间: vi.fn(),
    set世界演变最近摘要: vi.fn(),
    set世界演变最近原始消息: vi.fn(),
    追加系统消息: vi.fn(),
    已进入主剧情回合: () => true,
    按回合窗口裁剪历史: (history) => history,
    ...overrides,
});

describe('游戏大师协调器', () => {
    describe('创建', () => {
        it('应该正确创建协调器实例', () => {
            const deps = createMockDeps();
            const params: 游戏大师触发参数 = { 来源: 'user_input' };
            
            const coordinator = 创建游戏大师协调器(deps, params);
            
            expect(coordinator).toBeInstanceOf(游戏大师协调器);
        });

        it('应该使用默认参数', () => {
            const deps = createMockDeps();
            
            const coordinator = 创建游戏大师协调器(deps);
            
            expect(coordinator).toBeDefined();
        });
    });

    describe('execute', () => {
        it('应该执行完整流程', async () => {
            const deps = createMockDeps();
            const params: 游戏大师触发参数 = {
                启用世界演变: false,
                启用变量校准: false,
                启用规划更新: false,
                启用记忆召回: false,
                启用正文润色: false,
            };
            
            const coordinator = 创建游戏大师协调器(deps, params);
            const result = await coordinator.execute();
            
            expect(result.success).toBe(true);
            expect(result.phase).toBe('finalize');
            expect(result.agentResults).toBeDefined();
            expect(Array.isArray(result.agentResults)).toBe(true);
        });

        it('应该包含正确的智能体结果', async () => {
            const deps = createMockDeps();
            const params: 游戏大师触发参数 = {
                启用世界演变: false,
                启用变量校准: false,
                启用规划更新: false,
                启用记忆召回: false,
                启用正文润色: false,
            };
            
            const coordinator = 创建游戏大师协调器(deps, params);
            const result = await coordinator.execute();
            
            // Story agent 应该被包含
            const storyResult = result.agentResults.find(r => r.类型 === 'story');
            expect(storyResult).toBeDefined();
        });

        it('应该处理并行智能体执行', async () => {
            const deps = createMockDeps();
            const params: 游戏大师触发参数 = {
                启用世界演变: true,
                启用变量校准: true,
                启用规划更新: true,
                启用记忆召回: false,
                启用正文润色: false,
            };
            
            const coordinator = 创建游戏大师协调器(deps, params);
            const result = await coordinator.execute();
            
            expect(result.success).toBe(true);
            
            // 检查并行执行的智能体
            const worldResult = result.agentResults.find(r => r.类型 === 'world');
            const variableResult = result.agentResults.find(r => r.类型 === 'variable');
            
            // 这些可能因为缺少完整依赖而跳过
            expect(worldResult || variableResult).toBeDefined();
        });
    });

    describe('便捷函数', () => {
        it('执行游戏大师流程应该返回协调结果', async () => {
            const deps = createMockDeps();
            
            const result = await 执行游戏大师流程(deps);
            
            expect(result).toBeDefined();
            expect(typeof result.success).toBe('boolean');
            expect(result.agentResults).toBeDefined();
            expect(Array.isArray(result.agentResults)).toBe(true);
        });
    });
});

describe('游戏大师协调结果结构', () => {
    it('应该有正确的结构', async () => {
        const deps = createMockDeps();
        const coordinator = 创建游戏大师协调器(deps);
        const result = await coordinator.execute();
        
        // 检查顶层字段
        expect('success' in result).toBe(true);
        expect('phase' in result).toBe(true);
        expect('agentResults' in result).toBe(true);
        expect('commands' in result).toBe(true);
        expect('dynamicWorldHints' in result).toBe(true);
        expect('statusText' in result).toBe(true);
        expect('rawTexts' in result).toBe(true);
        
        // 检查类型
        expect(Array.isArray(result.agentResults)).toBe(true);
        expect(Array.isArray(result.commands)).toBe(true);
        expect(Array.isArray(result.dynamicWorldHints)).toBe(true);
        expect(typeof result.statusText).toBe('string');
        expect(typeof result.rawTexts).toBe('object');
    });
});
