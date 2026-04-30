import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 执行世界演变更新工作流 } from './worldEvolutionWorkflow';
import * as textAIService from '../../services/ai/text';
import * as apiConfig from '../../utils/apiConfig';

vi.mock('../../services/ai/text', () => ({
    generateWorldEvolutionUpdate: vi.fn(),
}));
vi.mock('../../utils/apiConfig', () => ({
    获取世界演变接口配置: vi.fn(),
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
vi.mock('../../utils/worldbook', () => ({
    构建世界书注入文本: vi.fn(() => ({ combinedText: '' })),
}));
vi.mock('../../services/novel-decomposition/novelDecompositionInjection', () => ({
    获取激活小说拆分注入文本: vi.fn(() => Promise.resolve('')),
}));
vi.mock('../../utils/promptFeatureToggles', () => ({
    按功能开关过滤提示词内容: vi.fn((c: string) => c),
    裁剪修炼体系上下文数据: vi.fn((w: any) => w),
}));
vi.mock('../../prompts/runtime/fandom', () => ({
    构建同人运行时提示词包: vi.fn(() => ({
        enabled: false,
        世界观创建补丁: '',
        境界母板补丁: '',
        开局任务补丁: '',
        开局COT补丁: '',
        同人设定摘要: '',
        主剧情COT补丁: '',
        剧情规划补丁: '',
        女主规划补丁: '',
    })),
}));
vi.mock('../../prompts/runtime/worldEvolutionCot', () => ({
    构建世界演变COT提示词: vi.fn(() => '<世界演变COT>'),
    世界演变COT伪装历史消息提示词: '<世界演变COT伪装>',
}));
vi.mock('../../prompts/stats/world', () => ({
    数值_世界演化: { id: 'stat_world_evo', 内容: '【世界演化】' },
}));
vi.mock('./memoryUtils', () => ({
    规范化记忆系统: vi.fn((m: any) => m || { 短期记忆: [] }),
}));
vi.mock('./historyUtils', () => ({
    formatHistoryToScript: vi.fn(() => '暂无'),
}));
vi.mock('./timeUtils', () => ({
    环境时间转标准串: vi.fn(() => '2026-04-30T00:00:00'),
}));
vi.mock('./worldEvolutionUtils', () => ({
    构建世界演变上下文文本: vi.fn(() => '<世界演变上下文>'),
    规范化世界演变命令列表: vi.fn((cmds: any[]) => Array.isArray(cmds) ? cmds : []),
}));

const mock生成世界演变 = vi.mocked(textAIService.generateWorldEvolutionUpdate);
const mock获取世界演变接口配置 = vi.mocked(apiConfig.获取世界演变接口配置);
const mock接口配置是否可用 = vi.mocked(apiConfig.接口配置是否可用);

function makeDeps(overrides: any = {}) {
    return {
        apiSettings: { 世界演变API: { provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } },
        gameConfig: { 启用修炼体系: true, 剧情风格: '一般' },
        角色: { 姓名: '李四' },
        环境: { 年: 2026, 月: 4, 日: 30, 时: 0, 分: 0 },
        世界: { 事件: [], 状态: {} },
        剧情: { 主线任务: '', 女主规划: {} },
        记忆系统: { 短期记忆: ['记忆1', '记忆2'] },
        历史记录: [],
        prompts: [
            { id: 'core_world', 内容: '【世界观】', 启用: true, 类型: '核心设定' },
            { id: 'core_realm', 内容: '【境界体系】', 启用: true, 类型: '核心设定' },
        ],
        worldbooks: [],
        世界演变进行中Ref: { current: false },
        世界演变去重签名Ref: { current: '' },
        已进入主剧情回合: vi.fn(() => true),
        按回合窗口裁剪历史: vi.fn((h: any[]) => h),
        规范化环境信息: vi.fn((e: any) => e || {}),
        规范化世界状态: vi.fn((w: any) => w || {}),
        规范化剧情状态: vi.fn((p: any) => p || {}),
        processResponseCommands: vi.fn(() => ({ 环境: {}, 世界: {}, 剧情: {} })),
        setWorldEvents: vi.fn(),
        set世界演变更新中: vi.fn(),
        set世界演变状态文本: vi.fn(),
        set世界演变最近更新时间: vi.fn(),
        set世界演变最近摘要: vi.fn(),
        set世界演变最近原始消息: vi.fn(),
        追加系统消息: vi.fn(),
        ...overrides,
    };
}

function enableBasicMocks(evolutionResponse?: any) {
    mock获取世界演变接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
    mock接口配置是否可用.mockReturnValue(true);
    mock生成世界演变.mockResolvedValue(evolutionResponse || { commands: [], updates: ['世界更新1'], rawText: 'raw evolution text' });
}

describe('执行世界演变更新工作流', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('early returns', () => {
        it('returns skipped when API not configured', async () => {
            mock获取世界演变接口配置.mockReturnValue({ provider: 'openai', apiKey: '', baseUrl: '', model: '' } as any);
            mock接口配置是否可用.mockReturnValue(false);
            const deps = makeDeps();
            const result = await 执行世界演变更新工作流({ 来源: 'manual' }, deps);
            expect(result).toEqual({
                ok: false,
                phase: 'skipped',
                commands: [],
                updates: [],
                rawText: '',
                statusText: '世界演变模型未配置可用接口',
            });
        });

        it('sets status text when API not configured and force=true', async () => {
            mock获取世界演变接口配置.mockReturnValue({ provider: 'openai', apiKey: '', baseUrl: '', model: '' } as any);
            mock接口配置是否可用.mockReturnValue(false);
            const deps = makeDeps();
            await 执行世界演变更新工作流({ 来源: 'manual', force: true }, deps);
            expect(deps.set世界演变状态文本).toHaveBeenCalledWith('世界演变模型未配置可用接口');
        });

        it('returns skipped when already in progress', async () => {
            enableBasicMocks();
            const deps = makeDeps({ 世界演变进行中Ref: { current: true } });
            const result = await 执行世界演变更新工作流({ 来源: 'manual' }, deps);
            expect(result).toEqual({
                ok: false,
                phase: 'skipped',
                commands: [],
                updates: [],
                rawText: '',
                statusText: '世界演变更新中...',
            });
        });
    });

    describe('basic flow', () => {
        it('sets in-progress flags', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行世界演变更新工作流({ 来源: 'manual' }, deps);
            expect(deps.世界演变进行中Ref.current).toBe(false); // reset in finally
            expect(deps.set世界演变更新中).toHaveBeenCalledWith(true);
            expect(deps.set世界演变状态文本).toHaveBeenCalledWith('世界演变更新中...');
        });

        it('clears in-progress flag in finally block', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行世界演变更新工作流({ 来源: 'manual' }, deps);
            expect(deps.世界演变进行中Ref.current).toBe(false);
            expect(deps.set世界演变更新中).toHaveBeenLastCalledWith(false);
        });

        it('returns done phase with updates', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            const result = await 执行世界演变更新工作流({ 来源: 'manual' }, deps);
            expect(result.ok).toBe(true);
            expect(result.phase).toBe('done');
            expect(result.updates).toEqual(['世界更新1']);
            expect(result.rawText).toBe('raw evolution text');
        });
    });

    describe('deduplication', () => {
        it('skips when same signature matches ref', async () => {
            enableBasicMocks();
            // Use a known-empty signature: when currentTurnBody/Plan/Commands are all empty
            const deps = makeDeps({
                世界演变去重签名Ref: { current: 'SENTINEL_SKIP' },
                历史记录: [],
                环境: {},
            });
            // First run sets the signature, second run should skip
            const result1 = await 执行世界演变更新工作流({ 来源: 'manual' }, deps);
            expect(result1.ok).toBe(true);
            // Second run with same inputs should skip
            const result2 = await 执行世界演变更新工作流({ 来源: 'manual' }, deps);
            expect(result2.phase).toBe('skipped');
            expect(result2.statusText).toContain('已跳过');
            expect(mock生成世界演变).toHaveBeenCalledTimes(1);
        });

        it('allows override when force=true', async () => {
            enableBasicMocks();
            const deps = makeDeps({ 世界演变去重签名Ref: { current: 'manual::2026-04-30T00:00:00::|||' } });
            const result = await 执行世界演变更新工作流({ 来源: 'manual', force: true }, deps);
            expect(result.phase).toBe('done');
            expect(mock生成世界演变).toHaveBeenCalled();
        });

        it('updates signature ref after execution', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行世界演变更新工作流({ 来源: 'auto_due' }, deps);
            expect(deps.世界演变去重签名Ref.current).toContain('auto_due');
        });
    });

    describe('successful evolution with commands', () => {
        it('processes commands and reports count', async () => {
            mock获取世界演变接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            mock生成世界演变.mockResolvedValue({
                commands: [{ action: 'set', key: 'world.事件', value: ['新事件'] }],
                updates: [],
                rawText: 'command text',
            });
            const deps = makeDeps();
            const result = await 执行世界演变更新工作流({ 来源: 'manual' }, deps);
            expect(deps.processResponseCommands).toHaveBeenCalled();
            expect(result.phase).toBe('done');
            expect(result.statusText).toContain('1条命令');
        });

        it('appends system message after last turn for manual trigger', async () => {
            mock获取世界演变接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            mock生成世界演变.mockResolvedValue({
                commands: [{ action: 'set', key: 'world.事件', value: ['新事件'] }],
                updates: [],
                rawText: 'command text',
            });
            const deps = makeDeps();
            await 执行世界演变更新工作流({ 来源: 'manual' }, deps);
            expect(deps.追加系统消息).toHaveBeenCalled();
            const msgCall = deps.追加系统消息.mock.calls[0];
            expect(msgCall[0]).toContain('[世界演变]');
            expect(msgCall[1]).toEqual({ position: 'after_last_turn' });
        });

        it('records game time instead of real time', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行世界演变更新工作流({ 来源: 'manual' }, deps);
            expect(deps.set世界演变最近更新时间).toHaveBeenCalledWith('2026-04-30T00:00:00');
        });
    });

    describe('no-op evolution', () => {
        it('returns skipped phase when no commands and no updates', async () => {
            mock获取世界演变接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            mock生成世界演变.mockResolvedValue({ commands: [], updates: [], rawText: 'no changes' });
            const deps = makeDeps();
            const result = await 执行世界演变更新工作流({ 来源: 'manual' }, deps);
            expect(result.phase).toBe('skipped');
            expect(result.statusText).toContain('无需更新');
        });

        it('reports invalid command path when raw commands exist but normalize fails', async () => {
            mock获取世界演变接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            mock生成世界演变.mockResolvedValue({
                commands: [{ bad: true } as any],
                updates: [],
                rawText: 'bad commands',
            });
            vi.mocked(await import('./worldEvolutionUtils')).规范化世界演变命令列表.mockImplementationOnce(() => []);
            const deps = makeDeps();
            const result = await 执行世界演变更新工作流({ 来源: 'manual' }, deps);
            expect(result.statusText).toContain('命令路径无效');
        });
    });

    describe('error handling', () => {
        it('catches errors and returns error phase', async () => {
            mock获取世界演变接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            mock生成世界演变.mockRejectedValue(new Error('network timeout'));
            const deps = makeDeps();
            const result = await 执行世界演变更新工作流({ 来源: 'manual' }, deps);
            expect(result.ok).toBe(false);
            expect(result.phase).toBe('error');
            expect(result.statusText).toBe('network timeout');
        });

        it('clears in-progress flags on error', async () => {
            mock获取世界演变接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            mock生成世界演变.mockRejectedValue(new Error('fail'));
            const deps = makeDeps();
            await 执行世界演变更新工作流({ 来源: 'manual' }, deps);
            expect(deps.世界演变进行中Ref.current).toBe(false);
            expect(deps.set世界演变更新中).toHaveBeenLastCalledWith(false);
        });

        it('appends error message for manual trigger', async () => {
            mock获取世界演变接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            mock生成世界演变.mockRejectedValue(new Error('fail'));
            const deps = makeDeps();
            await 执行世界演变更新工作流({ 来源: 'manual' }, deps);
            expect(deps.追加系统消息).toHaveBeenCalled();
            const msgCall = deps.追加系统消息.mock.calls[0];
            expect(msgCall[0]).toContain('[世界演变失败]');
        });
    });

    describe('trigger sources', () => {
        it.each([
            'manual',
            'auto_due',
            'story_dynamic',
            'story_dynamic_and_due',
        ])('handles trigger source: %s', async (source) => {
            enableBasicMocks();
            const deps = makeDeps();
            const result = await 执行世界演变更新工作流({ 来源: source as any }, deps);
            expect(result.ok).toBe(true);
            const sig = deps.世界演变去重签名Ref.current;
            expect(sig).toContain(source);
        });
    });

    describe('command count reporting', () => {
        it('reports "已生成N条命令" when applyCommands=false', async () => {
            mock获取世界演变接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            mock生成世界演变.mockResolvedValue({
                commands: [{ action: 'set', key: '世界.活跃NPC列表', value: [1] }, { action: 'set', key: '环境.天气', value: 2 }],
                updates: [],
                rawText: 'cmd text',
            });
            const deps = makeDeps();
            const result = await 执行世界演变更新工作流({ 来源: 'manual', applyCommands: false }, deps);
            expect(result.statusText).toContain('已生成2条命令');
        });

        it('reports "已应用N条命令" when applyCommands=true (default)', async () => {
            mock获取世界演变接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            mock生成世界演变.mockResolvedValue({
                commands: [{ action: 'set', key: '世界.活跃NPC列表', value: 1 }],
                updates: [],
                rawText: 'cmd text',
            });
            const deps = makeDeps();
            const result = await 执行世界演变更新工作流({ 来源: 'manual' }, deps);
            expect(result.statusText).toContain('已应用1条命令');
        });

        it('does not append system message when applyCommands=false', async () => {
            mock获取世界演变接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            mock生成世界演变.mockResolvedValue({
                commands: [{ action: 'set', key: '世界.活跃NPC列表', value: 1 }],
                updates: [],
                rawText: 'cmd text',
            });
            const deps = makeDeps();
            await 执行世界演变更新工作流({ 来源: 'manual', applyCommands: false }, deps);
            expect(deps.追加系统消息).not.toHaveBeenCalled();
        });

        it('appends system message for auto_due trigger', async () => {
            mock获取世界演变接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            mock生成世界演变.mockResolvedValue({
                commands: [{ action: 'set', key: '世界.活跃NPC列表', value: 1 }],
                updates: [],
                rawText: 'cmd text',
            });
            const deps = makeDeps();
            await 执行世界演变更新工作流({ 来源: 'auto_due' }, deps);
            expect(deps.追加系统消息).toHaveBeenCalled();
            const msgCall = deps.追加系统消息.mock.calls[0];
            expect(msgCall[0]).toContain('[世界演变]');
        });
    });
});
