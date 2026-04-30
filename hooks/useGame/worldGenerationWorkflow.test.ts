import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 执行世界生成工作流 } from './worldGenerationWorkflow';
import * as textAIService from '../../services/ai/text';
import * as dbService from '../../services/dbService';
import * as apiConfig from '../../utils/apiConfig';
import * as gameSettings from '../../utils/gameSettings';

vi.mock('../../services/ai/text', () => ({
    generateWorldData: vi.fn(),
    generateFandomRealmData: vi.fn(),
    解析世界观提示词内容: vi.fn((s: string) => s),
    解析境界体系提示词内容: vi.fn((s: string) => s),
}));
vi.mock('../../services/dbService', () => ({
    保存设置: vi.fn(),
}));
vi.mock('../../utils/apiConfig', () => ({
    获取主剧情接口配置: vi.fn(),
    接口配置是否可用: vi.fn(),
}));
vi.mock('../../utils/gameSettings', () => ({
    规范化游戏设置: vi.fn((c: any) => ({
        启用修炼体系: true,
        启用GPT模式: false,
        启用NSFW模式: false,
        剧情风格: '一般',
        启用COT伪装注入: true,
        启用标签检测完整性: false,
        启用标签修复: true,
        启用行动选项: true,
        额外提示词: '',
        ...c,
    })),
}));
vi.mock('../../prompts/runtime/worldSetup', () => ({
    构建世界观种子提示词: vi.fn(() => '<世界观种子>'),
    构建世界生成任务上下文提示词: vi.fn(() => '<世界生成上下文>'),
}));
vi.mock('../../prompts/runtime/worldGenerationCot', () => ({
    世界观生成COT提示词: '<世界COT>',
    世界观生成COT伪装历史消息提示词: '<世界COT伪装>',
}));
vi.mock('../../prompts/runtime/fandom', () => ({
    构建同人运行时提示词包: vi.fn(() => ({
        enabled: false,
        世界观创建补丁: '',
        境界母板补丁: '',
        开局任务补丁: '',
        开局COT补丁: '',
    })),
}));
vi.mock('../../prompts/core/realm', () => ({
    核心_境界体系: { id: 'core_realm', 内容: '【境界体系】' },
}));
vi.mock('../../utils/promptFeatureToggles', () => ({
    按功能开关过滤提示词内容: vi.fn((c: string) => c),
    构建修炼体系附加块: vi.fn(() => ''),
}));

const mock生成世界数据 = vi.mocked(textAIService.generateWorldData);
const mock生成同人境界数据 = vi.mocked(textAIService.generateFandomRealmData);
const mock获取主剧情接口配置 = vi.mocked(apiConfig.获取主剧情接口配置);
const mock接口配置是否可用 = vi.mocked(apiConfig.接口配置是否可用);
const mock规范化游戏设置 = vi.mocked(gameSettings.规范化游戏设置);
const mock保存设置 = vi.mocked(dbService.保存设置);

function makeDeps(overrides: any = {}) {
    return {
        apiConfig: { 主剧情API: { provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } },
        gameConfig: { 启用修炼体系: true, 剧情风格: '一般' },
        prompts: [{ id: 'core_world', 内容: 'world', 启用: true, 类型: '核心设定' }],
        view: 'new_game' as const,
        setView: vi.fn(),
        setPrompts: vi.fn(),
        setLoading: vi.fn(),
        setShowSettings: vi.fn(),
        设置历史记录: vi.fn(),
        设置开局配置: vi.fn(),
        设置最近开局配置: vi.fn(),
        清空重Roll快照: vi.fn(),
        重置自动存档状态: vi.fn(),
        创建开场基础状态: vi.fn(() => ({ 角色: { 姓名: '李四' }, 环境: {} })),
        构建前端清空开场状态: vi.fn((b: any) => ({ ...b, cleared: true })),
        应用开场基态: vi.fn(),
        创建开场命令基态: vi.fn(() => ({})),
        执行开场剧情生成: vi.fn(() => Promise.resolve()),
        追加系统消息: vi.fn(),
        替换流式草稿为失败提示: vi.fn((h: any[]) => h),
        ...overrides,
    };
}

function enableBasicMocks(worldResponse?: string) {
    mock获取主剧情接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
    mock接口配置是否可用.mockReturnValue(true);
    mock生成世界数据.mockResolvedValue(worldResponse || '<生成的世界观>');
}

describe('执行世界生成工作流', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
    });
    afterEach(() => { vi.useRealTimers(); });

    describe('early returns', () => {
        it('shows settings and returns when API not configured', async () => {
            mock获取主剧情接口配置.mockReturnValue({ provider: 'openai', apiKey: '', baseUrl: '', model: '' } as any);
            mock接口配置是否可用.mockReturnValue(false);
            const deps = makeDeps();
            await 执行世界生成工作流(
                { worldSeed: 'test' } as any,
                { 姓名: '李四' } as any,
                undefined,
                'all',
                true,
                '',
                undefined,
                deps
            );
            expect(deps.追加系统消息).toHaveBeenCalled();
            expect(deps.setShowSettings).toHaveBeenCalled();
            expect(deps.setLoading).toHaveBeenCalledWith(false);
        });
    });

    describe('basic flow', () => {
        it('sets view to game', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行世界生成工作流(
                { worldSeed: 'test' } as any,
                { 姓名: '李四' } as any,
                undefined,
                'all',
                true,
                '',
                undefined,
                deps
            );
            expect(deps.setView).toHaveBeenCalledWith('game');
        });

        it('saves recent opening config', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行世界生成工作流(
                { worldSeed: 'test' } as any,
                { 姓名: '李四' } as any,
                { enabled: true } as any,
                'all',
                true,
                '',
                undefined,
                deps
            );
            expect(deps.设置最近开局配置).toHaveBeenCalled();
            const saved = deps.设置最近开局配置.mock.calls[0][0];
            expect(saved.worldConfig.worldSeed).toBe('test');
            expect(saved.openingConfig).toEqual({ enabled: true });
        });

        it('clears roll snapshots and resets auto-save', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行世界生成工作流(
                { worldSeed: 'test' } as any,
                { 姓名: '李四' } as any,
                undefined,
                'all',
                true,
                '',
                undefined,
                deps
            );
            expect(deps.清空重Roll快照).toHaveBeenCalled();
            expect(deps.重置自动存档状态).toHaveBeenCalled();
        });

        it('sets loading to true', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行世界生成工作流(
                { worldSeed: 'test' } as any,
                { 姓名: '李四' } as any,
                undefined,
                'all',
                true,
                '',
                undefined,
                deps
            );
            expect(deps.setLoading).toHaveBeenCalledWith(true);
        });
    });

    describe('world data generation', () => {
        it('calls generateWorldData when no manual world prompt', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行世界生成工作流(
                { worldSeed: 'test' } as any,
                { 姓名: '李四' } as any,
                undefined,
                'all',
                true,
                '',
                undefined,
                deps
            );
            expect(mock生成世界数据).toHaveBeenCalled();
        });

        it('uses manual world prompt when provided', async () => {
            enableBasicMocks();
            const { 解析世界观提示词内容 } = textAIService;
            const deps = makeDeps();
            await 执行世界生成工作流(
                { worldSeed: 'test', manualWorldPrompt: 'custom world' } as any,
                { 姓名: '李四' } as any,
                undefined,
                'all',
                true,
                '',
                undefined,
                deps
            );
            expect(mock生成世界数据).not.toHaveBeenCalled();
            expect(解析世界观提示词内容).toHaveBeenCalledWith('custom world');
        });
    });

    describe('realm system generation', () => {
        it('generates fandom realm data when fandom enabled and cultivation enabled', async () => {
            enableBasicMocks();
            const { 构建同人运行时提示词包 } = await import('../../prompts/runtime/fandom');
            vi.mocked(构建同人运行时提示词包).mockImplementation(() => ({
                enabled: true,
                世界观创建补丁: '',
                境界母板补丁: '【同人境界】',
                开局任务补丁: '',
                开局COT补丁: '',
                同人设定摘要: '',
                主剧情COT补丁: '',
                剧情规划补丁: '',
                女主规划补丁: '',
            }) as any);
            mock生成同人境界数据.mockResolvedValue('<同人境界体系>');

            const deps = makeDeps();
            await 执行世界生成工作流(
                { worldSeed: 'test' } as any,
                { 姓名: '李四' } as any,
                { enabled: true } as any,
                'all',
                true,
                '',
                undefined,
                deps
            );
            expect(mock生成同人境界数据).toHaveBeenCalled();
        });

        it('uses manual realm prompt when provided', async () => {
            enableBasicMocks();
            const { 解析境界体系提示词内容 } = textAIService;
            const deps = makeDeps();
            await 执行世界生成工作流(
                { worldSeed: 'test', manualRealmPrompt: 'custom realm' } as any,
                { 姓名: '李四' } as any,
                undefined,
                'all',
                true,
                '',
                undefined,
                deps
            );
            expect(mock生成同人境界数据).not.toHaveBeenCalled();
            expect(解析境界体系提示词内容).toHaveBeenCalledWith('custom realm');
        });

        it('excludes realm prompts when cultivation system disabled', async () => {
            enableBasicMocks();
            mock规范化游戏设置.mockReturnValue({
                启用修炼体系: false,
                启用GPT模式: false,
                启用NSFW模式: false,
                剧情风格: '一般',
            } as any);
            const deps = makeDeps();
            await 执行世界生成工作流(
                { worldSeed: 'test' } as any,
                { 姓名: '李四' } as any,
                undefined,
                'all',
                true,
                '',
                undefined,
                deps
            );
            const finalCall = mock保存设置.mock.calls[mock保存设置.mock.calls.length - 1];
            const finalPrompts = finalCall[1];
            expect(finalPrompts.every((p: any) => p.id !== 'core_realm')).toBe(true);
        });
    });

    describe('prompt updates', () => {
        it('saves prompts to IndexedDB', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行世界生成工作流(
                { worldSeed: 'test' } as any,
                { 姓名: '李四' } as any,
                undefined,
                'all',
                true,
                '',
                undefined,
                deps
            );
            expect(mock保存设置).toHaveBeenCalled();
        });

        it('enables difficulty prompts matching current difficulty', async () => {
            enableBasicMocks();
            const deps = makeDeps({
                prompts: [
                    { id: 'diff_easy', 内容: 'easy', 启用: true, 类型: '难度设定', 标题: '简单' },
                    { id: 'diff_normal', 内容: 'normal', 启用: true, 类型: '难度设定', 标题: '普通' },
                    { id: 'diff_hard', 内容: 'hard', 启用: true, 类型: '难度设定', 标题: '困难' },
                ],
            });
            await 执行世界生成工作流(
                { worldSeed: 'test', difficulty: 'hard' } as any,
                { 姓名: '李四' } as any,
                undefined,
                'all',
                true,
                '',
                undefined,
                deps
            );
            expect(deps.setPrompts).toHaveBeenCalled();
        });
    });

    describe('mode = step', () => {
        it('applies frontend base state and returns', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行世界生成工作流(
                { worldSeed: 'test' } as any,
                { 姓名: '李四' } as any,
                undefined,
                'step',
                true,
                '',
                { 清空前端变量: true },
                deps
            );
            expect(deps.应用开场基态).toHaveBeenCalled();
            expect(deps.setView).toHaveBeenCalledWith('game');
            expect(deps.setLoading).toHaveBeenCalledWith(false);
            expect(deps.追加系统消息).toHaveBeenCalled();
        });

        it('does not call opening story generation', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行世界生成工作流(
                { worldSeed: 'test' } as any,
                { 姓名: '李四' } as any,
                undefined,
                'step',
                true,
                '',
                { 清空前端变量: true },
                deps
            );
            expect(deps.执行开场剧情生成).not.toHaveBeenCalled();
        });
    });

    describe('mode = all', () => {
        it('calls opening story generation after world data', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行世界生成工作流(
                { worldSeed: 'test' } as any,
                { 姓名: '李四' } as any,
                undefined,
                'all',
                true,
                '',
                undefined,
                deps
            );
            expect(deps.执行开场剧情生成).toHaveBeenCalled();
        });

        it('sets loading to false after completion', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行世界生成工作流(
                { worldSeed: 'test' } as any,
                { 姓名: '李四' } as any,
                undefined,
                'all',
                true,
                '',
                undefined,
                deps
            );
            expect(deps.setLoading).toHaveBeenLastCalledWith(false);
        });
    });

    describe('streaming mode', () => {
        it('sets up streaming history with loading message', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行世界生成工作流(
                { worldSeed: 'test' } as any,
                { 姓名: '李四' } as any,
                undefined,
                'all',
                true,
                '',
                undefined,
                deps
            );
            expect(deps.设置历史记录).toHaveBeenCalled();
            const historyCall = deps.设置历史记录.mock.calls[0][0];
            expect(Array.isArray(historyCall)).toBe(true);
            expect(historyCall[0].content).toContain('正在生成数据');
        });

        it('updates streaming status during realm generation', async () => {
            enableBasicMocks();
            const { 构建同人运行时提示词包 } = await import('../../prompts/runtime/fandom');
            vi.mocked(构建同人运行时提示词包).mockImplementation(() => ({
                enabled: true,
                世界观创建补丁: '',
                境界母板补丁: '【同人境界】',
                开局任务补丁: '',
                开局COT补丁: '',
                同人设定摘要: '',
                主剧情COT补丁: '',
                剧情规划补丁: '',
                女主规划补丁: '',
            }) as any);
            mock生成同人境界数据.mockResolvedValue('<同人境界体系>');

            const deps = makeDeps();
            vi.useFakeTimers();
            await 执行世界生成工作流(
                { worldSeed: 'test' } as any,
                { 姓名: '李四' } as any,
                { enabled: true } as any,
                'all',
                true,
                '',
                undefined,
                deps
            );
            vi.advanceTimersByTime(500);
            expect(deps.设置历史记录).toHaveBeenCalled();
        });
    });

    describe('error handling', () => {
        it('shows failure message on generation error', async () => {
            mock获取主剧情接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            mock生成世界数据.mockRejectedValue(new Error('world gen failed'));

            const deps = makeDeps();
            await 执行世界生成工作流(
                { worldSeed: 'test' } as any,
                { 姓名: '李四' } as any,
                undefined,
                'all',
                true,
                '',
                undefined,
                deps
            );
            expect(deps.setLoading).toHaveBeenLastCalledWith(false);
            expect(deps.设置历史记录).toHaveBeenCalled();
        });
    });

    describe('clear frontend variables', () => {
        it('applies cleared state when 清空前端变量 is true', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行世界生成工作流(
                { worldSeed: 'test' } as any,
                { 姓名: '李四' } as any,
                undefined,
                'all',
                true,
                '',
                { 清空前端变量: true },
                deps
            );
            expect(deps.构建前端清空开场状态).toHaveBeenCalled();
            expect(deps.应用开场基态).toHaveBeenCalled();
        });

        it('does not clear state when 清空前端变量 is false', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行世界生成工作流(
                { worldSeed: 'test' } as any,
                { 姓名: '李四' } as any,
                undefined,
                'all',
                true,
                '',
                { 清空前端变量: false },
                deps
            );
            expect(deps.构建前端清空开场状态).not.toHaveBeenCalled();
        });
    });
});
