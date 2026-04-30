import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 执行主剧情发送工作流 } from './sendWorkflow';
import * as textAIService from '../../services/ai/text';
import * as apiConfig from '../../utils/apiConfig';
import * as gameSettings from '../../utils/gameSettings';

vi.mock('../../services/ai/text', () => ({
    generateStoryResponse: vi.fn(),
    StoryResponseParseError: class StoryResponseParseError extends Error { name = 'StoryResponseParseError'; },
}));
vi.mock('../../utils/apiConfig', () => ({
    获取主剧情接口配置: vi.fn(),
    获取世界演变接口配置: vi.fn(),
    接口配置是否可用: vi.fn(),
}));
vi.mock('../../utils/gameSettings', () => ({
    规范化游戏设置: vi.fn((c: any) => c || {}),
}));
vi.mock('../../utils/worldbook', () => ({
    构建世界书注入文本: vi.fn(() => ''),
}));
vi.mock('./memoryUtils', () => ({
    规范化记忆配置: vi.fn((c: any) => c || {}),
    规范化记忆系统: vi.fn((m: any) => m || { 回忆档案: [], 即时记忆: [], 短期记忆: [], 中期记忆: [], 长期记忆: [] }),
    构建即时记忆条目: vi.fn(() => ({ content: 'immediate' })),
    构建短期记忆条目: vi.fn(() => ({ content: 'short' })),
    写入四段记忆: vi.fn((mem: any) => mem),
}));
vi.mock('./memoryRecall', () => ({
    提取剧情回忆标签: vi.fn((input: string) => ({ cleanInput: input, recallTag: '' })),
}));
vi.mock('./recallWorkflow', () => ({
    执行剧情回忆检索: vi.fn(),
}));
vi.mock('./mainStoryRequest', () => ({
    构建主剧情请求参数: vi.fn(() => ({
        runtimeGameConfig: {},
        runtimeCotPseudoEnabled: false,
        lengthRequirementPrompt: '',
        disclaimerRequirementPrompt: '',
        outputProtocolPrompt: '',
        styleAssistantPrompt: '',
        realWorldModePrompt: '',
        cotPseudoPrompt: '',
        orderedMessages: [],
        extraPromptForService: '',
    })),
}));
vi.mock('./timeUtils', () => ({
    环境时间转标准串: vi.fn(() => '2026:04:30:14:00'),
}));
vi.mock('./promptRuntime', () => ({
    构建COT伪装提示词: vi.fn(() => ''),
}));
vi.mock('./worldEvolutionUtils', () => ({
    分析世界到期触发: vi.fn(() => null),
}));
vi.mock('./storyResponseGuards', () => ({
    按世界演变分流净化响应: vi.fn((r: any) => ({ response: r, removedWorldCommands: [], appendedDynamicHints: [] })),
}));
vi.mock('../../services/novel-decomposition/novelDecompositionInjection', () => ({
    获取激活小说拆分注入文本: vi.fn(() => Promise.resolve('')),
}));
vi.mock('../../services/novel-decomposition/novelDecompositionCalibration', () => ({
    同步剧情小说分解时间校准: vi.fn((p: any) => Promise.resolve(p.previousStory)),
}));

const mockGenerateStoryResponse = vi.mocked(textAIService.generateStoryResponse);
const mock获取主剧情接口配置 = vi.mocked(apiConfig.获取主剧情接口配置);
const mock获取世界演变接口配置 = vi.mocked(apiConfig.获取世界演变接口配置);
const mock接口配置是否可用 = vi.mocked(apiConfig.接口配置是否可用);
const mock规范化游戏设置 = vi.mocked(gameSettings.规范化游戏设置);

function makeState(overrides: any = {}) {
    return {
        历史记录: [],
        记忆系统: { 回忆档案: [], 即时记忆: [], 短期记忆: [], 中期记忆: [], 长期记忆: [] },
        角色: { 姓名: '李四', 气血: 100, 物品列表: [], 气运列表: [] },
        环境: { 时间: '2026:04:30:14:00', 大地点: '江南' },
        社交: [],
        世界: { 世界种子: 'seed' },
        战斗: { 状态: 'idle' },
        玩家门派: { 门派名称: '华山' },
        任务列表: [],
        约定列表: [],
        剧情: { 当前章节: null },
        剧情规划: {},
        女主剧情规划: undefined,
        同人剧情规划: undefined,
        同人女主剧情规划: undefined,
        开局配置: undefined,
        loading: false,
        gameConfig: { 启用NSFW模式: false },
        apiConfig: { 主剧情API: { provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } },
        memoryConfig: { 即时消息上传条数N: 10, 短期记忆阈值: 5 },
        visualConfig: {},
        sceneImageArchive: {},
        prompts: [],
        内置提示词列表: [],
        世界书列表: [],
        ...overrides,
    };
}

function makeDeps(overrides: any = {}) {
    return {
        abortControllerRef: { current: null as AbortController | null },
        setLoading: vi.fn(),
        setShowSettings: vi.fn(),
        设置剧情: vi.fn(),
        设置历史记录: vi.fn(),
        应用并同步记忆系统: vi.fn(),
        构建系统提示词: vi.fn(() => ({ contextPieces: { AI角色声明: 'AI' }, runtimePromptStates: {} })),
        processResponseCommands: vi.fn(() => ({
            角色: { 姓名: '李四' },
            环境: {},
            社交: [],
            世界: {},
            战斗: {},
            玩家门派: {},
            任务列表: [],
            约定列表: [],
            剧情: {},
            剧情规划: {},
        })),
        performAutoSave: vi.fn(),
        执行正文润色: vi.fn(),
        执行世界演变更新: vi.fn(),
        触发新增NPC自动生图: vi.fn(),
        触发场景自动生图: vi.fn(),
        应用常驻壁纸为背景: vi.fn(),
        提取新增NPC列表: vi.fn(() => []),
        推入重Roll快照: vi.fn(),
        弹出重Roll快照: vi.fn(),
        回档到快照: vi.fn(),
        深拷贝: vi.fn(<T>(v: T) => v === undefined ? undefined : JSON.parse(JSON.stringify(v))),
        按回合窗口裁剪历史: vi.fn((h: any[]) => h),
        规范化环境信息: vi.fn((e: any) => e || {}),
        规范化剧情状态: vi.fn((s: any) => s || {}),
        规范化剧情规划状态: vi.fn((p: any) => p || {}),
        规范化女主剧情规划状态: vi.fn(() => undefined),
        规范化同人剧情规划状态: vi.fn(() => undefined),
        规范化同人女主剧情规划状态: vi.fn(() => undefined),
        规范化世界状态: vi.fn((w: any) => w || {}),
        游戏设置启用自动重试: vi.fn(() => false),
        执行带自动重试的生成请求: vi.fn(async ({ action }: { action: () => Promise<any> }) => action()),
        更新流式草稿为自动重试提示: vi.fn((h: any[]) => h),
        提取解析失败原始信息: vi.fn((e: any) => e?.message || 'parse error'),
        提取原始报错详情: vi.fn((e: any) => e?.message || ''),
        格式化错误详情: vi.fn((e: any) => e?.message || 'unknown'),
        获取原始AI消息: vi.fn((t: string) => t),
        估算消息Token: vi.fn(() => 100),
        估算AI输出Token: vi.fn(() => 50),
        计算回复耗时秒: vi.fn(() => 2.5),
        文章优化功能已开启: vi.fn(() => false),
        后台执行统一规划分析: vi.fn(),
        后台执行变量生成: vi.fn(),
        执行变量生成并合并响应: vi.fn(),
        ...overrides,
    };
}

function mockAIResponse(overrides: any = {}) {
    return {
        response: {
            logs: [{ sender: '旁白', text: 'story text' }],
            tavern_commands: [],
            ...overrides,
        },
        rawText: '<正文><旁白>story text</旁白></正文>',
    };
}

function enableApiMocks(aiResponseOverride?: any) {
    mock获取主剧情接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
    mock接口配置是否可用.mockReturnValue(true);
    mock获取世界演变接口配置.mockReturnValue(undefined);
    mockGenerateStoryResponse.mockResolvedValue(aiResponseOverride || mockAIResponse());
}

describe('执行主剧情发送工作流', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mock规范化游戏设置.mockImplementation((c: any) => c || {});
    });
    afterEach(() => { vi.useRealTimers(); });

    describe('early returns', () => {
        it('returns empty for empty content', async () => {
            const result = await 执行主剧情发送工作流('', false, makeState(), makeDeps());
            expect(result).toEqual({});
        });

        it('returns empty for whitespace-only content', async () => {
            const result = await 执行主剧情发送工作流('   ', false, makeState(), makeDeps());
            expect(result).toEqual({});
        });

        it('returns cancelled when API not configured', async () => {
            mock获取主剧情接口配置.mockReturnValue({ provider: 'openai', apiKey: '', baseUrl: '', model: '' } as any);
            mock接口配置是否可用.mockReturnValue(false);
            const deps = makeDeps();
            const result = await 执行主剧情发送工作流('hello', false, makeState(), deps);
            expect(result.cancelled).toBe(true);
            expect(deps.setShowSettings).toHaveBeenCalled();
        });

        it('returns empty when already loading', async () => {
            const result = await 执行主剧情发送工作流('hello', false, makeState({ loading: true }), makeDeps());
            expect(result).toEqual({});
        });
    });

    describe('system error message cleanup', () => {
        it('trims trailing system error + user pair from history before send', async () => {
            enableApiMocks();
            const history = [
                { role: 'user', content: 'first input' },
                { role: 'assistant', content: 'Structured Response', structuredResponse: { logs: [] } },
                { role: 'system', content: '[系统错误]: something failed' },
                { role: 'user', content: 'retry input' },
            ];
            const deps = makeDeps();
            await 执行主剧情发送工作流('new input', false, makeState({ 历史记录: history }), deps);
            expect(deps.设置历史记录).toHaveBeenCalled();
        });
    });

    describe('rollback snapshot', () => {
        it('pushes a snapshot before sending', async () => {
            enableApiMocks();
            const deps = makeDeps();
            await 执行主剧情发送工作流('player action', false, makeState(), deps);
            expect(deps.推入重Roll快照).toHaveBeenCalled();
        });
    });

    describe('history update', () => {
        it('adds user message and AI response to history', async () => {
            enableApiMocks();
            const deps = makeDeps();
            await 执行主剧情发送工作流('player action', false, makeState(), deps);

            expect(deps.setLoading).toHaveBeenCalledWith(true);
            expect(deps.设置历史记录).toHaveBeenCalled();
            expect(deps.setLoading).toHaveBeenLastCalledWith(false);
        });

        it('uses streaming mode when isStreaming=true', async () => {
            enableApiMocks();
            const deps = makeDeps();
            await 执行主剧情发送工作流('player action', true, makeState(), deps);

            // Streaming: user msg added, placeholder set, then replaced with final response
            expect(deps.设置历史记录).toHaveBeenCalledTimes(3);
        });
    });

    describe('abort handling', () => {
        it('returns cancelled and restores from snapshot on AbortError', async () => {
            mock获取主剧情接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            mock获取世界演变接口配置.mockReturnValue(undefined);

            const abortError = new DOMException('aborted', 'AbortError');
            mockGenerateStoryResponse.mockRejectedValue(abortError);

            const snapshot = { 玩家输入: 'test', 游戏时间: 'now', 回档前状态: {} as any, 回档前持久态: {} as any, 回档前历史: [] };
            const deps = makeDeps({
                弹出重Roll快照: vi.fn(() => snapshot),
                回档到快照: vi.fn(),
            });
            const result = await 执行主剧情发送工作流('player action', false, makeState(), deps);
            expect(result.cancelled).toBe(true);
            expect(deps.弹出重Roll快照).toHaveBeenCalled();
            expect(deps.回档到快照).toHaveBeenCalledWith(snapshot);
        });

        it('falls back to restore history + memory when no snapshot available', async () => {
            mock获取主剧情接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            mock获取世界演变接口配置.mockReturnValue(undefined);

            const abortError = new DOMException('aborted', 'AbortError');
            mockGenerateStoryResponse.mockRejectedValue(abortError);

            const deps = makeDeps({
                弹出重Roll快照: vi.fn(() => undefined),
                设置历史记录: vi.fn(),
                应用并同步记忆系统: vi.fn(),
            });
            await 执行主剧情发送工作流('player action', false, makeState(), deps);
            expect(deps.应用并同步记忆系统).toHaveBeenCalled();
        });
    });

    describe('parse error handling', () => {
        it('returns needRerollConfirm when auto-retry disabled', async () => {
            mock获取主剧情接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            mock获取世界演变接口配置.mockReturnValue(undefined);
            mock规范化游戏设置.mockReturnValue({});

            const ParseError = textAIService.StoryResponseParseError;
            mockGenerateStoryResponse.mockRejectedValue(new ParseError('bad parse'));

            const deps = makeDeps({
                游戏设置启用自动重试: vi.fn(() => false),
            });
            const result = await 执行主剧情发送工作流('player action', false, makeState(), deps);
            expect(result.cancelled).toBe(true);
            expect(result.needRerollConfirm).toBe(true);
            expect(result.parseErrorMessage).toContain('bad parse');
        });

        it('shows system error message when auto-retry enabled', async () => {
            mock获取主剧情接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            mock获取世界演变接口配置.mockReturnValue(undefined);
            mock规范化游戏设置.mockReturnValue({ 启用自动重试: true });

            const ParseError = textAIService.StoryResponseParseError;
            mockGenerateStoryResponse.mockRejectedValue(new ParseError('bad parse'));

            const deps = makeDeps({
                游戏设置启用自动重试: vi.fn(() => true),
            });
            const result = await 执行主剧情发送工作流('player action', false, makeState(), deps);
            expect(result.cancelled).toBe(true);
            expect(result.needRerollConfirm).toBeUndefined();
            expect(deps.设置历史记录).toHaveBeenCalled();
        });
    });

    describe('general error handling', () => {
        it('returns errorDetail on non-parse errors', async () => {
            mock获取主剧情接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            mock获取世界演变接口配置.mockReturnValue(undefined);
            mockGenerateStoryResponse.mockRejectedValue(new Error('network error'));

            const deps = makeDeps();
            const result = await 执行主剧情发送工作流('player action', false, makeState(), deps);
            expect(result.cancelled).toBe(true);
            expect(result.errorDetail).toContain('network error');
            expect(result.errorTitle).toBe('请求失败');
        });
    });

    describe('post-response pipeline', () => {
        it('triggers auto-save after response', async () => {
            enableApiMocks();
            const deps = makeDeps();
            await 执行主剧情发送工作流('player action', false, makeState(), deps);
            expect(deps.performAutoSave).toHaveBeenCalled();
        });

        it('triggers scene image generation when body text exists', async () => {
            enableApiMocks();
            const deps = makeDeps();
            await 执行主剧情发送工作流('player action', false, makeState(), deps);
            expect(deps.触发场景自动生图).toHaveBeenCalled();
        });

        it('skips scene image generation when no body text', async () => {
            enableApiMocks({
                response: { logs: [], tavern_commands: [] },
                rawText: '',
            });

            const deps = makeDeps();
            await 执行主剧情发送工作流('player action', false, makeState(), deps);
            expect(deps.触发场景自动生图).not.toHaveBeenCalled();
        });

        it('triggers new NPC image generation when NPCs added', async () => {
            enableApiMocks();
            const newNpc = { 姓名: 'New NPC' };
            const deps = makeDeps({
                提取新增NPC列表: vi.fn(() => [newNpc]),
            });
            await 执行主剧情发送工作流('player action', false, makeState(), deps);
            expect(deps.触发新增NPC自动生图).toHaveBeenCalledWith([newNpc]);
        });

        it('applies wallpaper before scene image generation', async () => {
            enableApiMocks();
            const deps = makeDeps();
            await 执行主剧情发送工作流('player action', false, makeState(), deps);
            expect(deps.应用常驻壁纸为背景).toHaveBeenCalled();
        });
    });

    describe('memory operations', () => {
        it('writes to memory system after response', async () => {
            enableApiMocks();
            const deps = makeDeps();
            await 执行主剧情发送工作流('player action', false, makeState(), deps);
            expect(deps.应用并同步记忆系统).toHaveBeenCalled();
        });
    });

    describe('story calibration', () => {
        it('calls 同步剧情小说分解时间校准 with correct params', async () => {
            enableApiMocks();
            const { 同步剧情小说分解时间校准 } = await import('../../services/novel-decomposition/novelDecompositionCalibration');
            const deps = makeDeps();
            await 执行主剧情发送工作流('player action', false, makeState(), deps);
            expect(同步剧情小说分解时间校准).toHaveBeenCalled();
        });

        it('sets story when calibration returns different result', async () => {
            enableApiMocks();
            const { 同步剧情小说分解时间校准 } = await import('../../services/novel-decomposition/novelDecompositionCalibration');
            vi.mocked(同步剧情小说分解时间校准).mockResolvedValue({ 当前章节: { 名称: 'new chapter' } } as any);

            const deps = makeDeps();
            await 执行主剧情发送工作流('player action', false, makeState(), deps);
            expect(deps.设置剧情).toHaveBeenCalled();
        });
    });

    describe('token estimation', () => {
        it('records input and output tokens on AI message', async () => {
            enableApiMocks();
            const deps = makeDeps();
            await 执行主剧情发送工作流('player action', false, makeState(), deps);
            expect(deps.估算消息Token).toHaveBeenCalled();
            expect(deps.估算AI输出Token).toHaveBeenCalled();
        });
    });

    describe('independent stage retry flow', () => {
        it('continues when polish stage is skipped', async () => {
            enableApiMocks({
                response: { logs: [{ sender: '旁白', text: 'story' }], tavern_commands: [] },
                rawText: '<正文><旁白>story</旁白></正文>',
            });
            const deps = makeDeps({
                文章优化功能已开启: vi.fn(() => true),
                执行正文润色: vi.fn().mockRejectedValue(new Error('polish failed')),
            });
            // With auto-retry disabled and no decision callback, confirm() returns skip
            await 执行主剧情发送工作流('player action', false, makeState(), deps);
            // Should still reach auto-save despite polish failure
            expect(deps.performAutoSave).toHaveBeenCalled();
        });
    });
});
