import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 创建规划更新工作流 } from './planningUpdateWorkflow';
import * as textAIService from '../../services/ai/text';
import * as apiConfig from '../../utils/apiConfig';

vi.mock('../../services/ai/text', () => ({
    generatePlanningAnalysis: vi.fn(),
}));
vi.mock('../../utils/apiConfig', () => ({
    获取规划分析接口配置: vi.fn(),
    接口配置是否可用: vi.fn(),
}));
vi.mock('../../utils/gameSettings', () => ({
    规范化游戏设置: vi.fn((c: any) => ({
        启用修炼体系: true,
        启用女主剧情规划: false,
        剧情风格: '一般',
        独立APIGPT模式: {},
        ...c,
    })),
}));
vi.mock('../../utils/worldbook', () => ({
    构建世界书注入文本: vi.fn(() => ({ combinedText: '' })),
}));
vi.mock('../../services/novel-decomposition/novelDecompositionCalibration', () => ({
    同步剧情小说分解时间校准: vi.fn((p: any) => Promise.resolve(p.nextStory || {})),
}));
vi.mock('../../services/novel-decomposition/novelDecompositionInjection', () => ({
    获取激活小说拆分注入文本: vi.fn(() => Promise.resolve('')),
}));
vi.mock('../../prompts/runtime/fandom', () => ({
    构建同人运行时提示词包: vi.fn(() => ({ enabled: false, 同人设定摘要: '', 境界母板补丁: '' })),
}));
vi.mock('./thinkingContext', () => ({
    提取响应规划文本: vi.fn(() => ''),
}));
vi.mock('../../utils/promptFeatureToggles', () => ({
    按功能开关过滤提示词内容: vi.fn((c: string) => c),
    裁剪修炼体系上下文数据: vi.fn((v: any) => v),
}));

const mockGeneratePlanningAnalysis = vi.mocked(textAIService.generatePlanningAnalysis);
const mock获取规划分析接口配置 = vi.mocked(apiConfig.获取规划分析接口配置);
const mock接口配置是否可用 = vi.mocked(apiConfig.接口配置是否可用);

function makeDeps(overrides: any = {}) {
    return {
        apiConfig: { provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' },
        gameConfig: { 启用修炼体系: true, 剧情风格: '一般' },
        角色: { 姓名: '李四' },
        环境: { 年: 2026, 月: 4, 日: 30 },
        世界: { 事件: [] },
        战斗: {},
        玩家门派: {},
        任务列表: [],
        约定列表: [],
        历史记录: [
            { role: 'user', content: 'input', timestamp: 1, gameTime: '2026-04-30T00:00:00' },
            { role: 'assistant', content: 'AI response', timestamp: 2, gameTime: '2026-04-30T00:01:00', structuredResponse: { logs: [{ sender: '旁白', text: '正文内容' }], tavern_commands: [] } },
        ],
        prompts: [],
        worldbooks: [],
        规范化环境信息: vi.fn((v: any) => v || {}),
        规范化社交列表: vi.fn((v: any[]) => v || []),
        规范化世界状态: vi.fn((v: any) => v || {}),
        规范化战斗状态: vi.fn((v: any) => v || {}),
        规范化门派状态: vi.fn((v: any) => v || {}),
        规范化剧情状态: vi.fn((v: any) => v || {}),
        规范化剧情规划状态: vi.fn((v: any) => v || {}),
        规范化女主剧情规划状态: vi.fn((v: any) => v || undefined),
        规范化同人剧情规划状态: vi.fn((v: any) => v || undefined),
        规范化同人女主剧情规划状态: vi.fn((v: any) => v || undefined),
        深拷贝: <T>(v: T): T => (v === undefined ? undefined as T : JSON.parse(JSON.stringify(v))),
        收集最近完整正文回合: vi.fn(() => [{ bodyText: '正文内容' }]),
        构建最近完整正文上下文: vi.fn(() => '正文内容'),
        去重文本数组: vi.fn((arr: string[]) => [...new Set(arr)]),
        收集女主规划时间触发原因: vi.fn(() => []),
        收集女主正文命中原因: vi.fn(() => []),
        收集剧情规划时间触发原因: vi.fn(() => []),
        收集剧情正文命中原因: vi.fn(() => []),
        提取响应完整正文文本: vi.fn(() => '正文内容'),
        设置剧情: vi.fn(),
        设置剧情规划: vi.fn(),
        设置女主剧情规划: vi.fn(),
        设置同人剧情规划: vi.fn(),
        设置同人女主剧情规划: vi.fn(),
        performAutoSave: vi.fn(() => Promise.resolve()),
        ...overrides,
    };
}

function makeState(overrides: any = {}) {
    return {
        环境: { 年: 2026, 月: 4, 日: 30 },
        社交: [],
        世界: { 事件: [] },
        剧情: {},
        剧情规划: {},
        女主剧情规划: undefined,
        同人剧情规划: undefined,
        同人女主剧情规划: undefined,
        ...overrides,
    };
}

describe('创建规划更新工作流', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('后台执行统一规划分析', () => {
        it('returns early when planning API not configured', async () => {
            mock获取规划分析接口配置.mockReturnValue(null);
            mock接口配置是否可用.mockReturnValue(false);
            const deps = makeDeps();
            const { 后台执行统一规划分析 } = 创建规划更新工作流(deps);
            const result = await 后台执行统一规划分析({
                state: makeState(),
                playerInput: 'input',
                gameTime: '2026-04-30T00:01:00',
                response: { logs: [], tavern_commands: [] },
            });
            expect(result.updated).toBe(false);
            expect(result.message).toContain('规划分析独立模型未配置');
        });

        it('returns early when no body text collected', async () => {
            mock获取规划分析接口配置.mockReturnValue({ 供应商: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            const deps = makeDeps({
                构建最近完整正文上下文: vi.fn(() => ''),
            });
            const { 后台执行统一规划分析 } = 创建规划更新工作流(deps);
            const result = await 后台执行统一规划分析({
                state: makeState(),
                playerInput: 'input',
                gameTime: '2026-04-30T00:01:00',
                response: { logs: [], tavern_commands: [] },
            });
            expect(result.updated).toBe(false);
            expect(result.message).toContain('未收集到可用于规划分析');
        });

        it('calls generatePlanningAnalysis with correct params', async () => {
            mock获取规划分析接口配置.mockReturnValue({ 供应商: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            mockGeneratePlanningAnalysis.mockResolvedValue({
                shouldUpdate: false,
                reason: '无需更新',
                commands: [],
                notes: [],
                rawText: 'analysis result',
            });
            const deps = makeDeps();
            const { 后台执行统一规划分析 } = 创建规划更新工作流(deps);
            await 后台执行统一规划分析({
                state: makeState(),
                playerInput: '玩家输入',
                gameTime: '2026-04-30T00:01:00',
                response: { logs: [], tavern_commands: [] },
            });
            expect(mockGeneratePlanningAnalysis).toHaveBeenCalledWith(
                expect.objectContaining({
                    playerName: '李四',
                    heroineEnabled: false,
                    fandomEnabled: false,
                }),
                expect.any(Object)
            );
        });

        it('returns skip when shouldUpdate is false', async () => {
            mock获取规划分析接口配置.mockReturnValue({ 供应商: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            mockGeneratePlanningAnalysis.mockResolvedValue({
                shouldUpdate: false,
                reason: '无需更新',
                commands: [
                    { action: 'set', key: '剧情', value: {} },
                ],
                notes: [],
                rawText: 'analysis result',
            });
            const deps = makeDeps();
            const { 后台执行统一规划分析 } = 创建规划更新工作流(deps);
            const result = await 后台执行统一规划分析({
                state: makeState(),
                playerInput: 'input',
                gameTime: '2026-04-30T00:01:00',
                response: { logs: [], tavern_commands: [] },
            });
            expect(result.updated).toBe(false);
            expect(result.message).toContain('无需更新');
            expect(result.commands).toEqual([]);
        });

        it('returns skip when no valid commands produced', async () => {
            mock获取规划分析接口配置.mockReturnValue({ 供应商: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            mockGeneratePlanningAnalysis.mockResolvedValue({
                shouldUpdate: true,
                reason: '有更新',
                commands: [
                    { action: 'set', key: '无关字段', value: 'x' },
                ],
                notes: [],
                rawText: 'result',
            });
            const deps = makeDeps();
            const { 后台执行统一规划分析 } = 创建规划更新工作流(deps);
            const result = await 后台执行统一规划分析({
                state: makeState(),
                playerInput: 'input',
                gameTime: '2026-04-30T00:01:00',
                response: { logs: [], tavern_commands: [] },
            });
            expect(result.updated).toBe(false);
            expect(result.message).toContain('有更新');
        });

        it('applies patches and sets state on success', async () => {
            mock获取规划分析接口配置.mockReturnValue({ 供应商: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            mockGeneratePlanningAnalysis.mockResolvedValue({
                shouldUpdate: true,
                reason: '剧情需要更新',
                commands: [
                    { action: 'set', key: '剧情', value: { 主线任务: '新任务' } },
                ],
                notes: [],
                rawText: 'analysis result',
            });
            const deps = makeDeps();
            const { 后台执行统一规划分析 } = 创建规划更新工作流(deps);
            const result = await 后台执行统一规划分析({
                state: makeState(),
                playerInput: 'input',
                gameTime: '2026-04-30T00:01:00',
                response: { logs: [], tavern_commands: [] },
            });
            expect(result.updated).toBe(true);
            expect(result.message).toContain('剧情需要更新');
            expect(result.storyCommands.length).toBeGreaterThan(0);
            expect(deps.设置剧情).toHaveBeenCalled();
            expect(deps.performAutoSave).toHaveBeenCalled();
        });

        it('handles heroine planning commands when heroine enabled', async () => {
            mock获取规划分析接口配置.mockReturnValue({ 供应商: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            mockGeneratePlanningAnalysis.mockResolvedValue({
                shouldUpdate: true,
                reason: 'heroine update',
                commands: [
                    { action: 'set', key: '女主剧情规划', value: { 规划: '女主规划' } },
                ],
                notes: [],
                rawText: 'heroine result',
            });
            const deps = makeDeps({
                gameConfig: { 启用女主剧情规划: true },
            });
            const { 后台执行统一规划分析 } = 创建规划更新工作流(deps);
            const result = await 后台执行统一规划分析({
                state: makeState({ 女主剧情规划: {} }),
                playerInput: 'input',
                gameTime: '2026-04-30T00:01:00',
                response: { logs: [], tavern_commands: [] },
            });
            expect(result.updated).toBe(true);
            expect(result.heroinePlanCommands.length).toBeGreaterThan(0);
            expect(deps.设置女主剧情规划).toHaveBeenCalled();
        });

        it('filters commands correctly for story targets', async () => {
            mock获取规划分析接口配置.mockReturnValue({ 供应商: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            mockGeneratePlanningAnalysis.mockResolvedValue({
                shouldUpdate: true,
                reason: 'mixed commands',
                commands: [
                    { action: 'set', key: '剧情', value: { 主线: '新主线' } },
                    { action: 'set', key: '剧情规划', value: { 规划: '新规划' } },
                    { action: 'set', key: '角色', value: { 姓名: '张三' } },
                ],
                notes: [],
                rawText: 'mixed result',
            });
            const deps = makeDeps();
            const { 后台执行统一规划分析 } = 创建规划更新工作流(deps);
            const result = await 后台执行统一规划分析({
                state: makeState(),
                playerInput: 'input',
                gameTime: '2026-04-30T00:01:00',
                response: { logs: [], tavern_commands: [] },
            });
            expect(result.commands.every((cmd) => cmd.key.startsWith('剧情'))).toBe(true);
        });

        it('includes worldbook and novel decomposition prompts', async () => {
            mock获取规划分析接口配置.mockReturnValue({ 供应商: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            mockGeneratePlanningAnalysis.mockResolvedValue({
                shouldUpdate: false,
                reason: 'no update needed',
                commands: [],
                notes: [],
                rawText: '',
            });
            const deps = makeDeps({
                worldbooks: [{ id: 'wb1', name: '世界书' }],
                prompts: [
                    { id: 'core_world', 内容: '<world prompt>' },
                    { id: 'core_realm', 内容: '<realm prompt>' },
                ],
            });
            const { 后台执行统一规划分析 } = 创建规划更新工作流(deps);
            await 后台执行统一规划分析({
                state: makeState(),
                playerInput: 'input',
                gameTime: '2026-04-30T00:01:00',
                response: { logs: [], tavern_commands: [] },
            });
            expect(mockGeneratePlanningAnalysis).toHaveBeenCalled();
        });

        it('uses default reason when result reason is empty', async () => {
            mock获取规划分析接口配置.mockReturnValue({ 供应商: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            mockGeneratePlanningAnalysis.mockResolvedValue({
                shouldUpdate: false,
                reason: '',
                commands: [],
                notes: [],
                rawText: 'empty reason',
            });
            const deps = makeDeps();
            const { 后台执行统一规划分析 } = 创建规划更新工作流(deps);
            const result = await 后台执行统一规划分析({
                state: makeState(),
                playerInput: 'input',
                gameTime: '2026-04-30T00:01:00',
                response: { logs: [], tavern_commands: [] },
            });
            expect(result.message).toContain('规划分析未产生有效补丁');
        });
    });
});
