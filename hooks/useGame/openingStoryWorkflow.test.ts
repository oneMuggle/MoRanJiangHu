import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 执行开场剧情生成工作流 } from './openingStoryWorkflow';
import * as textAIService from '../../services/ai/text';
import * as apiConfig from '../../utils/apiConfig';
import * as gameSettings from '../../utils/gameSettings';

vi.mock('../../services/ai/text', () => ({
    generateStoryResponse: vi.fn(),
    generateFandomRealmData: vi.fn(),
    generateWorldEvolutionUpdate: vi.fn(),
    generatePlanningAnalysis: vi.fn(),
    StoryResponseParseError: class StoryResponseParseError extends Error { name = 'StoryResponseParseError'; },
}));
vi.mock('../../services/dbService', () => ({
    保存设置: vi.fn(),
}));
vi.mock('../../utils/apiConfig', () => ({
    获取主剧情接口配置: vi.fn(),
    获取世界演变接口配置: vi.fn(),
    获取规划分析接口配置: vi.fn(),
    获取变量计算接口配置: vi.fn(),
    接口配置是否可用: vi.fn(),
}));
vi.mock('../../utils/gameSettings', () => ({
    规范化游戏设置: vi.fn((c: any) => c || {}),
}));
vi.mock('../../utils/worldbook', () => ({
    构建世界书注入文本: vi.fn(() => ({ combinedText: '' })),
    世界书存储键: 'extra_worldbooks',
    世界书预设组存储键: 'worldbook_preset_groups',
    世界书本体槽位: {
        开局初始化任务_启用生存: 'opening_task_survival',
        开局初始化任务_禁用生存: 'opening_task_no_survival',
        真实世界模式: 'real_world_mode',
    },
}));
vi.mock('../../utils/builtinPrompts', () => ({
    获取内置提示词槽位内容: vi.fn(({ fallback }: any) => fallback),
    获取剧情风格内置槽位: vi.fn(() => 'opening_standard'),
    内置提示词存储键: 'builtin_prompt_entries',
}));
vi.mock('../../prompts/core/cotOpening', () => ({
    核心_开局思维链: { id: 'core_cot', 内容: '<开局COT>' },
    获取开局思维链提示词: vi.fn(() => '<开局COT>'),
}));
vi.mock('../../prompts/core/realm', () => ({
    核心_境界体系: { id: 'core_realm', 内容: '【境界体系】' },
}));
vi.mock('../../prompts/runtime/opening', () => ({
    获取开场初始化任务提示词: vi.fn(() => '<开场任务>'),
}));
vi.mock('../../prompts/runtime/qiyun', () => ({
    气运初始化任务提示词: ['<气运任务>'],
}));
vi.mock('../../prompts/runtime/eraOpeningScene', () => ({
    构建时代开局场景注入: vi.fn(() => ''),
}));
vi.mock('../../prompts/runtime/openingConfig', () => ({
    构建开局配置提示词: vi.fn(() => ''),
}));
vi.mock('../../prompts/runtime/fandom', () => ({
    构建同人运行时提示词包: vi.fn(() => ({ enabled: false, 开局任务补丁: '', 开局COT补丁: '', 境界母板补丁: '' })),
    校验境界体系提示词完整性: vi.fn(() => ({ ok: true, normalizedText: '【境界体系】', reason: '' })),
}));
vi.mock('../../prompts/stats/world', () => ({
    数值_世界演化: { 内容: '【世界演化】' },
}));
vi.mock('../../prompts/runtime/protocolDirectives', () => ({
    构建字数要求提示词: vi.fn((n: number) => `<字数>${n}字</字数>`),
}));
vi.mock('../../prompts/runtime/storyStyles', () => ({
    构建剧情风格助手提示词: vi.fn(() => '<剧情风格>'),
}));
vi.mock('../../prompts/runtime/realWorldMode', () => ({
    构建真实世界模式提示词: vi.fn(() => '<真实模式>'),
}));
vi.mock('../../prompts/runtime/nsfw', () => ({
    构建运行时额外提示词: vi.fn(() => ''),
}));
vi.mock('../../prompts/runtime/worldEvolutionCot', () => ({
    构建世界演变COT提示词: vi.fn(() => '<世界COT>'),
    世界演变COT伪装历史消息提示词: '<世界COT伪装>',
}));
vi.mock('../../prompts/runtime/openingWorldEvolutionInit', () => ({
    构建开局世界演变初始化上下文: vi.fn(() => '<世界初始化>'),
    开局世界演变初始化附加提示词: '<世界初始化附加>',
}));
vi.mock('../../prompts/runtime/openingPlanningInit', () => ({
    构建开局规划初始化审计重点: vi.fn(() => '<规划审计>'),
    构建开局规划初始化正文上下文: vi.fn(() => '<规划正文>'),
    开局规划初始化附加提示词: '<规划附加>',
}));
vi.mock('../../prompts/runtime/openingVariableGenerationInit', () => ({
    开局变量生成附加提示词: '<变量附加>',
    构建开局变量生成审计重点: vi.fn(() => '<变量审计>'),
}));
vi.mock('../../services/novel-decomposition/novelDecompositionInjection', () => ({
    获取开局小说拆分注入文本: vi.fn(() => Promise.resolve('')),
    获取激活小说拆分注入文本: vi.fn(() => Promise.resolve('')),
}));
vi.mock('../../services/novel-decomposition/novelDecompositionCalibration', () => ({
    同步剧情小说分解时间校准: vi.fn((p: any) => Promise.resolve(p.nextStory || {})),
}));
vi.mock('./promptRuntime', () => ({
    构建COT伪装提示词: vi.fn(() => ''),
    构建酒馆预设消息链: vi.fn(() => []),
    酒馆预设模式可用: vi.fn(() => false),
}));
vi.mock('./thinkingContext', () => ({
    提取响应规划文本: vi.fn(() => ''),
}));
vi.mock('./timeUtils', () => ({
    环境时间转标准串: vi.fn(() => '2026:04:30:14:00'),
}));
vi.mock('./memoryUtils', () => ({
    规范化记忆系统: vi.fn((m: any) => m),
    规范化记忆配置: vi.fn((c: any) => c || { 即时消息上传条数N: 10, 短期记忆阈值: 30, 中期记忆阈值: 10, 长期记忆阈值: 5 }),
    构建即时记忆条目: vi.fn(() => ({ content: 'immediate' })),
    构建短期记忆条目: vi.fn(() => ({ content: 'short' })),
    写入四段记忆: vi.fn((mem: any) => mem),
}));
vi.mock('./worldEvolutionUtils', () => ({
    构建世界演变上下文文本: vi.fn(() => '<世界演变上下文>'),
}));
vi.mock('./variableModelWorkflow', () => ({
    执行变量模型校准工作流: vi.fn(() => Promise.resolve({ commands: [] })),
}));
vi.mock('./variableCalibrationMerge', () => ({
    合并变量校准结果到响应: vi.fn((r: any) => r),
}));
vi.mock('./memoryRecall', () => ({
    提取剧情回忆标签: vi.fn((input: string) => ({ cleanInput: input, recallTag: '' })),
}));
vi.mock('./stateTransforms', () => ({
    规范化环境信息: vi.fn((e: any) => e || {}),
}));

const mockGenerateStoryResponse = vi.mocked(textAIService.generateStoryResponse);
const mock获取变量计算接口配置 = vi.mocked(apiConfig.获取变量计算接口配置);
const mock获取世界演变接口配置 = vi.mocked(apiConfig.获取世界演变接口配置);
const mock获取规划分析接口配置 = vi.mocked(apiConfig.获取规划分析接口配置);
const mock接口配置是否可用 = vi.mocked(apiConfig.接口配置是否可用);
const mock规范化游戏设置 = vi.mocked(gameSettings.规范化游戏设置);
const mock生成世界演变 = vi.mocked(textAIService.generateWorldEvolutionUpdate);
const mock生成规划分析 = vi.mocked(textAIService.generatePlanningAnalysis);

function makeContextData(overrides: any = {}) {
    return {
        环境: { 大地点: '江南', 中地点: '苏州', 小地点: '留园', 具体地点: '正门', 时间: '2026:04:30:14:00' },
        角色: { 姓名: '李四', 气血: 100, 物品列表: [], 气运列表: [] },
        社交: [],
        世界: { 世界种子: 'seed' },
        战斗: { 是否战斗中: false },
        玩家门派: { 名称: '华山' },
        任务列表: [],
        约定列表: [],
        剧情: { 当前章节: null },
        ...overrides,
    };
}

function makeDeps(overrides: any = {}) {
    return {
        apiConfig: { 主剧情API: { provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } },
        环境: { 大地点: '江南', 时间: '2026:04:30:14:00' },
        角色: { 姓名: '李四', 气血: 100, 物品列表: [], 气运列表: [] },
        世界: { 世界种子: 'seed' },
        战斗: { 是否战斗中: false },
        玩家门派: { 名称: '华山' },
        任务列表: [],
        约定列表: [],
        剧情: { 当前章节: null },
        剧情规划: { 当前章目标: [], 当前章任务: [] },
        女主剧情规划: undefined,
        gameConfig: { 启用NSFW模式: false, 启用修炼体系: true, 剧情风格: '标准' },
        memoryConfig: { 即时消息上传条数N: 10, 短期记忆阈值: 30 },
        builtinPromptEntries: [],
        worldbooks: [],
        abortControllerRef: { current: null as AbortController | null },
        setPrompts: vi.fn(),
        设置历史记录: vi.fn(),
        设置角色: vi.fn(),
        设置环境: vi.fn(),
        设置社交: vi.fn(),
        设置世界: vi.fn(),
        设置战斗: vi.fn(),
        设置剧情: vi.fn(),
        设置剧情规划: vi.fn(),
        设置女主剧情规划: vi.fn(),
        设置同人剧情规划: vi.fn(),
        设置同人女主剧情规划: vi.fn(),
        设置玩家门派: vi.fn(),
        设置任务列表: vi.fn(),
        设置约定列表: vi.fn(),
        设置开局变量生成进度: vi.fn(),
        设置开局世界演变进度: vi.fn(),
        设置开局规划进度: vi.fn(),
        设置游戏初始时间: vi.fn(),
        记录变量生成上下文: vi.fn(),
        setWorldEvents: vi.fn(),
        应用并同步记忆系统: vi.fn(),
        performAutoSave: vi.fn(),
        构建系统提示词: vi.fn(() => ({
            contextPieces: {
                AI角色声明: '你是AI',
                输出协议提示词: '<输出协议>',
                字数要求提示词: '<字数>500字</字数>',
                免责声明输出提示词: '',
                worldPrompt: '<世界>',
                同人设定摘要: '',
                境界体系提示词: '',
                otherPrompts: '',
                难度设置提示词: '',
                叙事人称提示词: '',
                字数设置提示词: '',
                COT提示词: '<COT>',
            },
        })),
        processResponseCommands: vi.fn((_cmds: any, base: any) => base || {}),
        规范化环境信息: vi.fn((e: any) => e || {}),
        规范化剧情状态: vi.fn((s: any) => s || {}),
        规范化剧情规划状态: vi.fn((p: any) => p || {}),
        规范化女主剧情规划状态: vi.fn(() => undefined),
        规范化同人剧情规划状态: vi.fn(() => undefined),
        规范化同人女主剧情规划状态: vi.fn(() => undefined),
        规范化角色物品容器映射: vi.fn((r: any) => r || {}),
        规范化社交列表: vi.fn((l: any[]) => l || []),
        规范化世界状态: vi.fn((w: any) => w || {}),
        规范化战斗状态: vi.fn((b: any) => b || {}),
        规范化门派状态: vi.fn((s: any) => s || {}),
        游戏设置启用自动重试: vi.fn(() => false),
        执行带自动重试的生成请求: vi.fn(async ({ action }: { action: () => Promise<any> }) => action()),
        更新流式草稿为自动重试提示: vi.fn((h: any[]) => h),
        替换流式草稿为失败提示: vi.fn((h: any[]) => h),
        提取解析失败原始信息: vi.fn((e: any) => e?.message || 'parse error'),
        获取原始AI消息: vi.fn((t: string) => t),
        估算消息Token: vi.fn(() => 100),
        估算AI输出Token: vi.fn(() => 50),
        计算回复耗时秒: vi.fn(() => 2.5),
        触发新增NPC自动生图: vi.fn(),
        触发场景自动生图: vi.fn(),
        提取新增NPC列表: vi.fn(() => []),
        ...overrides,
    };
}

function makeApiResponse(overrides: any = {}) {
    return {
        response: {
            logs: [{ sender: '旁白', text: '开场故事' }],
            tavern_commands: [{ action: 'set', key: 'gameState.角色.气血', value: 100 }],
            ...overrides,
        },
        rawText: '<正文><旁白>开场故事</旁白></正文>',
    };
}

function enableBasicMocks(aiResponseOverride?: any) {
    mock规范化游戏设置.mockReturnValue({
        启用NSFW模式: false,
        启用修炼体系: true,
        剧情风格: '一般',
        启用COT伪装注入: true,
        启用标签检测完整性: false,
        启用标签修复: true,
        启用行动选项: true,
        额外提示词: '',
    } as any);
    mock获取变量计算接口配置.mockReturnValue(undefined);
    mock获取世界演变接口配置.mockReturnValue(undefined);
    mock获取规划分析接口配置.mockReturnValue(undefined);
    mock接口配置是否可用.mockReturnValue(false);
    mockGenerateStoryResponse.mockResolvedValue(aiResponseOverride || makeApiResponse());
}

describe('执行开场剧情生成工作流', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
    });
    afterEach(() => { vi.useRealTimers(); });

    describe('basic flow', () => {
        it('generates opening story and updates history', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行开场剧情生成工作流(makeContextData(), [], false, {} as any, undefined, deps);

            expect(deps.设置历史记录).toHaveBeenCalled();
            expect(mockGenerateStoryResponse).toHaveBeenCalled();
        });

        it('sets up abort controller', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行开场剧情生成工作流(makeContextData(), [], false, {} as any, undefined, deps);
            expect(deps.abortControllerRef.current).toBeNull(); // cleared in finally
        });

        it('initializes memory system', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行开场剧情生成工作流(makeContextData(), [], false, {} as any, undefined, deps);
            expect(deps.应用并同步记忆系统).toHaveBeenCalled();
        });
    });

    describe('streaming mode', () => {
        it('uses streaming with onDelta callback', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            vi.useFakeTimers();
            await 执行开场剧情生成工作流(makeContextData(), [], true, {} as any, undefined, deps);
            vi.advanceTimersByTime(500);
            expect(mockGenerateStoryResponse).toHaveBeenCalled();
            // Streaming options is the 6th argument (index 5)
            const callArgs = mockGenerateStoryResponse.mock.calls[0];
            const streamingOptions = callArgs[5] as any;
            expect(streamingOptions).toBeDefined();
            expect(streamingOptions?.stream).toBe(true);
            expect(typeof streamingOptions?.onDelta).toBe('function');
        });

        it('replaces placeholder with final response in streaming', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行开场剧情生成工作流(makeContextData(), [], true, {} as any, undefined, deps);
            // Streaming: (1) initial history set, (2) placeholder with streaming content, (3) final response
            expect(deps.设置历史记录).toHaveBeenCalledTimes(3);
        });
    });

    describe('abort handling', () => {
        it('throws on AbortError and clears history', async () => {
            mock规范化游戏设置.mockReturnValue({ 启用NSFW模式: false, 启用修炼体系: true, 剧情风格: '一般' } as any);
            mock获取变量计算接口配置.mockReturnValue(undefined);
            mock获取世界演变接口配置.mockReturnValue(undefined);
            mock获取规划分析接口配置.mockReturnValue(undefined);
            mock接口配置是否可用.mockReturnValue(false);
            const abortError = new DOMException('aborted', 'AbortError');
            mockGenerateStoryResponse.mockRejectedValue(abortError);

            const deps = makeDeps();
            await expect(
                执行开场剧情生成工作流(makeContextData(), [], false, {} as any, undefined, deps)
            ).rejects.toThrow('aborted');
            expect(deps.设置历史记录).toHaveBeenCalledWith([
                { role: 'system', content: '系统: 正在生成开场内容...', timestamp: expect.any(Number) }
            ]);
        });
    });

    describe('parse error handling', () => {
        it('shows system error on parse error without auto-retry', async () => {
            mock规范化游戏设置.mockReturnValue({ 启用NSFW模式: false, 启用修炼体系: true, 剧情风格: '一般', 启用自动重试: false } as any);
            mock获取变量计算接口配置.mockReturnValue(undefined);
            mock获取世界演变接口配置.mockReturnValue(undefined);
            mock获取规划分析接口配置.mockReturnValue(undefined);
            mock接口配置是否可用.mockReturnValue(false);

            const ParseError = textAIService.StoryResponseParseError;
            mockGenerateStoryResponse.mockRejectedValue(new ParseError('bad parse', '<bad>'));

            const deps = makeDeps();
            await 执行开场剧情生成工作流(makeContextData(), [], false, {} as any, undefined, deps);
            expect(deps.设置历史记录).toHaveBeenCalled();
            const allHistoryCalls = deps.设置历史记录.mock.calls;
            // Find the call that contains the error message (not the initial history)
            const errorCall = allHistoryCalls.find((call: any) => {
                const history = call[0];
                if (!Array.isArray(history)) return false;
                return history.some((m: any) => m.content?.includes('开局生成失败'));
            });
            expect(errorCall).toBeDefined();
            const systemMsg = errorCall[0].find((m: any) => m.content?.includes('开局生成失败'));
            expect(systemMsg?.content).toContain('开局生成失败');
        });

        it('handles parse error in streaming mode', async () => {
            mock规范化游戏设置.mockReturnValue({ 启用NSFW模式: false, 启用修炼体系: true, 剧情风格: '一般', 启用自动重试: false } as any);
            mock获取变量计算接口配置.mockReturnValue(undefined);
            mock获取世界演变接口配置.mockReturnValue(undefined);
            mock获取规划分析接口配置.mockReturnValue(undefined);
            mock接口配置是否可用.mockReturnValue(false);

            const ParseError = textAIService.StoryResponseParseError;
            mockGenerateStoryResponse.mockRejectedValue(new ParseError('stream parse error', '<stream-bad>'));

            const deps = makeDeps();
            await 执行开场剧情生成工作流(makeContextData(), [], true, {} as any, undefined, deps);
            expect(deps.设置历史记录).toHaveBeenCalled();
        });
    });

    describe('post-response pipeline', () => {
        it('triggers auto-save after response', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行开场剧情生成工作流(makeContextData(), [], false, {} as any, undefined, deps);
            expect(deps.performAutoSave).toHaveBeenCalled();
        });

        it('triggers scene image generation when body text exists', async () => {
            enableBasicMocks(makeApiResponse({
                logs: [{ sender: '旁白', text: 'scene description' }],
            }));
            const deps = makeDeps();
            await 执行开场剧情生成工作流(makeContextData(), [], false, {} as any, undefined, deps);
            expect(deps.触发场景自动生图).toHaveBeenCalled();
        });

        it('triggers new NPC image generation when NPCs added', async () => {
            enableBasicMocks();
            const newNpc = { 姓名: 'New NPC' };
            const deps = makeDeps({
                提取新增NPC列表: vi.fn(() => [newNpc]),
            });
            await 执行开场剧情生成工作流(makeContextData(), [], false, {} as any, undefined, deps);
            expect(deps.触发新增NPC自动生图).toHaveBeenCalledWith([newNpc]);
        });

        it('sets world events from evolution updates', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行开场剧情生成工作流(makeContextData(), [], false, {} as any, undefined, deps);
            expect(deps.setWorldEvents).toHaveBeenCalled();
        });

        it('sets story after calibration', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行开场剧情生成工作流(makeContextData(), [], false, {} as any, undefined, deps);
            expect(deps.设置剧情).toHaveBeenCalled();
        });

        it('sets initial game time', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行开场剧情生成工作流(makeContextData(), [], false, {} as any, undefined, deps);
            expect(deps.设置游戏初始时间).toHaveBeenCalled();
        });

        it('records variable generation context', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行开场剧情生成工作流(makeContextData(), [], false, {} as any, undefined, deps);
            expect(deps.记录变量生成上下文).toHaveBeenCalled();
        });

        it('sets sect, tasks, and agreements after commands', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行开场剧情生成工作流(makeContextData(), [], false, {} as any, undefined, deps);
            expect(deps.设置玩家门派).toHaveBeenCalled();
            expect(deps.设置任务列表).toHaveBeenCalled();
            expect(deps.设置约定列表).toHaveBeenCalled();
        });
    });

    describe('variable generation stage', () => {
        it('runs variable generation when API available', async () => {
            enableBasicMocks();
            mock获取变量计算接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            const { 执行变量模型校准工作流 } = await import('./variableModelWorkflow');
            vi.mocked(执行变量模型校准工作流).mockResolvedValue({
                commands: [{ action: 'set', key: 'gameState.角色.气血', value: 150 }],
            } as any);

            const deps = makeDeps();
            await 执行开场剧情生成工作流(makeContextData(), [], false, {} as any, undefined, deps);
            expect(执行变量模型校准工作流).toHaveBeenCalled();
            // Check that the final progress update contains the success message
            const progressCalls = deps.设置开局变量生成进度.mock.calls;
            const finalCall = progressCalls[progressCalls.length - 1][0];
            expect(finalCall.phase).toBe('done');
            expect(finalCall.text).toContain('已立即并入前台初始化状态');
        });

        it('skips variable generation when API not available', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行开场剧情生成工作流(makeContextData(), [], false, {} as any, undefined, deps);
            expect(deps.设置开局变量生成进度).toHaveBeenCalledWith({
                phase: 'skipped',
                text: '变量生成独立链路未启用，已跳过。',
            });
        });
    });

    describe('world evolution stage', () => {
        it('runs world evolution when API available', async () => {
            enableBasicMocks();
            mock获取世界演变接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            mock生成世界演变.mockResolvedValue({
                updates: ['event1'],
                commands: [],
                rawText: '',
            } as any);

            const deps = makeDeps();
            await 执行开场剧情生成工作流(makeContextData(), [], false, {} as any, undefined, deps);
            expect(mock生成世界演变).toHaveBeenCalled();
        });

        it('skips world evolution when API not available', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行开场剧情生成工作流(makeContextData(), [], false, {} as any, undefined, deps);
            expect(deps.设置开局世界演变进度).toHaveBeenCalledWith({
                phase: 'skipped',
                text: '动态世界独立链路未启用，已跳过。',
            });
        });
    });

    describe('planning analysis stage', () => {
        it('runs planning when API available', async () => {
            enableBasicMocks();
            mock获取规划分析接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            mock生成规划分析.mockResolvedValue({
                shouldUpdate: false,
                commands: [],
                rawText: '',
            } as any);

            const deps = makeDeps();
            await 执行开场剧情生成工作流(makeContextData(), [], false, {} as any, undefined, deps);
            expect(mock生成规划分析).toHaveBeenCalled();
        });

        it('skips planning when API not available', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行开场剧情生成工作流(makeContextData(), [], false, {} as any, undefined, deps);
            expect(deps.设置开局规划进度).toHaveBeenCalledWith({
                phase: 'skipped',
                text: '规划分析独立链路未启用，已跳过。',
            });
        });
    });

    describe('token estimation', () => {
        it('records input and output tokens', async () => {
            enableBasicMocks();
            const deps = makeDeps();
            await 执行开场剧情生成工作流(makeContextData(), [], false, {} as any, undefined, deps);
            expect(deps.估算消息Token).toHaveBeenCalled();
            expect(deps.估算AI输出Token).toHaveBeenCalled();
        });
    });

    describe('general error handling', () => {
        it('throws non-parse errors', async () => {
            mock规范化游戏设置.mockReturnValue({ 启用NSFW模式: false, 启用修炼体系: true, 剧情风格: '一般' } as any);
            mock获取变量计算接口配置.mockReturnValue(undefined);
            mock获取世界演变接口配置.mockReturnValue(undefined);
            mock获取规划分析接口配置.mockReturnValue(undefined);
            mock接口配置是否可用.mockReturnValue(false);
            mockGenerateStoryResponse.mockRejectedValue(new Error('network error'));

            const deps = makeDeps();
            await expect(
                执行开场剧情生成工作流(makeContextData(), [], false, {} as any, undefined, deps)
            ).rejects.toThrow('network error');
        });
    });
});
