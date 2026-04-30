import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 创建会话生命周期工作流 } from './sessionLifecycleWorkflow';
import * as dbService from '../../services/dbService';
import * as apiConfig from '../../utils/apiConfig';

vi.mock('../../services/dbService', () => ({
    保存设置: vi.fn(),
    读取设置: vi.fn(),
}));
vi.mock('../../utils/apiConfig', () => ({
    获取主剧情接口配置: vi.fn(),
    接口配置是否可用: vi.fn(),
}));
vi.mock('./openingStoryWorkflow', () => ({
    执行开场剧情生成工作流: vi.fn(),
}));
vi.mock('./worldGenerationWorkflow', () => ({
    执行世界生成工作流: vi.fn(),
}));

const mock获取主剧情接口配置 = vi.mocked(apiConfig.获取主剧情接口配置);
const mock接口配置是否可用 = vi.mocked(apiConfig.接口配置是否可用);
const mock读取设置 = vi.mocked(dbService.读取设置);

function makeDeps(overrides: any = {}) {
    return {
        apiConfig: { 主剧情API: { provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } },
        gameConfig: { 启用修炼体系: true, 剧情风格: '一般' },
        memoryConfig: { 即时消息上传条数N: 10, 短期记忆阈值: 30 },
        view: 'home' as const,
        prompts: [{ id: 'core_world', 内容: 'world', 启用: true, 类型: '核心设定' }],
        历史记录: [],
        记忆系统: { 回忆档案: [], 即时记忆: [], 短期记忆: [], 中期记忆: [], 长期记忆: [] },
        社交: [],
        环境: {},
        角色: { 姓名: '李四', 气血: 100, 物品列表: [], 气运列表: [] },
        世界: {},
        战斗: {},
        玩家门派: {},
        任务列表: [],
        约定列表: [],
        剧情: {},
        剧情规划: { 当前章目标: [], 当前章任务: [] },
        女主剧情规划: undefined,
        同人剧情规划: undefined,
        同人女主剧情规划: undefined,
        开局配置: undefined,
        内置提示词列表: [],
        世界书列表: [],
        loading: false,
        最近开局配置: null,
        currentEra: null,
        abortControllerRef: { current: null as AbortController | null },
        ensurePromptsLoaded: vi.fn(() => Promise.resolve([])),
        setView: vi.fn(),
        setPrompts: vi.fn(),
        setLoading: vi.fn(),
        setShowSettings: vi.fn(),
        setGameConfig: vi.fn(),
        设置历史记录: vi.fn(),
        设置最近开局配置: vi.fn(),
        设置开局配置: vi.fn(),
        设置角色: vi.fn(),
        设置环境: vi.fn(),
        设置游戏初始时间: vi.fn(),
        设置社交: vi.fn(),
        设置世界: vi.fn(),
        设置战斗: vi.fn(),
        设置玩家门派: vi.fn(),
        设置任务列表: vi.fn(),
        设置约定列表: vi.fn(),
        设置剧情: vi.fn(),
        设置剧情规划: vi.fn(),
        设置女主剧情规划: vi.fn(),
        设置同人剧情规划: vi.fn(),
        设置同人女主剧情规划: vi.fn(),
        设置时代信息: vi.fn(),
        设置开局变量生成进度: vi.fn(),
        设置开局世界演变进度: vi.fn(),
        设置开局规划进度: vi.fn(),
        setWorldEvents: vi.fn(),
        清空重Roll快照: vi.fn(),
        推入重Roll快照: vi.fn(),
        重置自动存档状态: vi.fn(),
        应用并同步记忆系统: vi.fn(),
        清空变量生成上下文缓存: vi.fn(),
        创建开场基础状态: vi.fn(() => ({ 角色: { 姓名: '李四' } })),
        构建前端清空开场状态: vi.fn((b: any) => ({ ...b, cleared: true })),
        创建开场命令基态: vi.fn(() => ({})),
        创建开场空白环境: vi.fn(() => ({})),
        创建开场空白世界: vi.fn(() => ({})),
        创建开场空白战斗: vi.fn(() => ({})),
        创建空门派状态: vi.fn(() => ({})),
        创建开场空白剧情: vi.fn(() => ({})),
        创建空剧情规划: vi.fn(() => ({})),
        创建空记忆系统: vi.fn(() => ({ 回忆档案: [], 即时记忆: [], 短期记忆: [], 中期记忆: [], 长期记忆: [] })),
        应用开场基态: vi.fn(),
        追加系统消息: vi.fn(),
        替换流式草稿为失败提示: vi.fn((h: any[]) => h),
        记录变量生成上下文: vi.fn(),
        performAutoSave: vi.fn(),
        构建系统提示词: vi.fn(() => ({ contextPieces: {} })),
        深拷贝: <T>(v: T): T => v === undefined ? undefined as T : JSON.parse(JSON.stringify(v)),
        processResponseCommands: vi.fn(),
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
        提取解析失败原始信息: vi.fn((e: any) => e?.message || ''),
        获取原始AI消息: vi.fn((t: string) => t),
        估算消息Token: vi.fn(() => 100),
        估算AI输出Token: vi.fn(() => 50),
        计算回复耗时秒: vi.fn(() => 2.5),
        触发新增NPC自动生图: vi.fn(),
        触发场景自动生图: vi.fn(),
        提取新增NPC列表: vi.fn(() => []),
        获取当前视觉设置快照: vi.fn(() => ({})),
        获取当前场景图片档案快照: vi.fn(() => ({})),
        ...overrides,
    };
}

describe('创建会话生命周期工作流', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    describe('handleStartNewGameWizard', () => {
        it('clears roll snapshots and resets auto-save', () => {
            const deps = makeDeps();
            const { handleStartNewGameWizard } = 创建会话生命周期工作流(deps);
            handleStartNewGameWizard();
            expect(deps.清空重Roll快照).toHaveBeenCalled();
            expect(deps.重置自动存档状态).toHaveBeenCalled();
        });

        it('clears recent opening config', () => {
            const deps = makeDeps();
            const { handleStartNewGameWizard } = 创建会话生命周期工作流(deps);
            handleStartNewGameWizard();
            expect(deps.设置最近开局配置).toHaveBeenCalledWith(null);
        });

        it('sets loading to false', () => {
            const deps = makeDeps();
            const { handleStartNewGameWizard } = 创建会话生命周期工作流(deps);
            handleStartNewGameWizard();
            expect(deps.setLoading).toHaveBeenCalledWith(false);
        });

        it('resets all game state to blank', () => {
            const deps = makeDeps();
            const { handleStartNewGameWizard } = 创建会话生命周期工作流(deps);
            handleStartNewGameWizard();
            expect(deps.设置环境).toHaveBeenCalled();
            expect(deps.设置世界).toHaveBeenCalled();
            expect(deps.设置战斗).toHaveBeenCalled();
            expect(deps.设置玩家门派).toHaveBeenCalled();
            expect(deps.设置任务列表).toHaveBeenCalledWith([]);
            expect(deps.设置约定列表).toHaveBeenCalledWith([]);
            expect(deps.设置剧情).toHaveBeenCalled();
            expect(deps.设置剧情规划).toHaveBeenCalled();
            expect(deps.设置社交).toHaveBeenCalledWith([]);
        });

        it('resets fandom planning to undefined', () => {
            const deps = makeDeps();
            const { handleStartNewGameWizard } = 创建会话生命周期工作流(deps);
            handleStartNewGameWizard();
            expect(deps.设置同人剧情规划).toHaveBeenCalledWith(undefined);
            expect(deps.设置同人女主剧情规划).toHaveBeenCalledWith(undefined);
        });

        it('resets opening config and progress', () => {
            const deps = makeDeps();
            const { handleStartNewGameWizard } = 创建会话生命周期工作流(deps);
            handleStartNewGameWizard();
            expect(deps.设置开局配置).toHaveBeenCalledWith(undefined);
            expect(deps.设置开局变量生成进度).toHaveBeenCalledWith(null);
            expect(deps.设置开局世界演变进度).toHaveBeenCalledWith(null);
            expect(deps.设置开局规划进度).toHaveBeenCalledWith(null);
        });

        it('clears memory and history', () => {
            const deps = makeDeps();
            const { handleStartNewGameWizard } = 创建会话生命周期工作流(deps);
            handleStartNewGameWizard();
            expect(deps.应用并同步记忆系统).toHaveBeenCalled();
            expect(deps.设置历史记录).toHaveBeenCalledWith([]);
        });

        it('clears variable generation context cache', () => {
            const deps = makeDeps();
            const { handleStartNewGameWizard } = 创建会话生命周期工作流(deps);
            handleStartNewGameWizard();
            expect(deps.清空变量生成上下文缓存).toHaveBeenCalled();
        });

        it('clears world events', () => {
            const deps = makeDeps();
            const { handleStartNewGameWizard } = 创建会话生命周期工作流(deps);
            handleStartNewGameWizard();
            expect(deps.setWorldEvents).toHaveBeenCalledWith([]);
        });

        it('navigates to new_game view', () => {
            const deps = makeDeps();
            const { handleStartNewGameWizard } = 创建会话生命周期工作流(deps);
            handleStartNewGameWizard();
            expect(deps.setView).toHaveBeenCalledWith('new_game');
        });
    });

    describe('handleReturnToHome', () => {
        it('resets auto-save state', () => {
            const deps = makeDeps();
            const { handleReturnToHome } = 创建会话生命周期工作流(deps);
            handleReturnToHome();
            expect(deps.重置自动存档状态).toHaveBeenCalled();
        });

        it('clears recent opening config', () => {
            const deps = makeDeps();
            const { handleReturnToHome } = 创建会话生命周期工作流(deps);
            handleReturnToHome();
            expect(deps.设置最近开局配置).toHaveBeenCalledWith(null);
        });

        it('clears opening config', () => {
            const deps = makeDeps();
            const { handleReturnToHome } = 创建会话生命周期工作流(deps);
            handleReturnToHome();
            expect(deps.设置开局配置).toHaveBeenCalledWith(undefined);
        });

        it('navigates to home view', () => {
            const deps = makeDeps();
            const { handleReturnToHome } = 创建会话生命周期工作流(deps);
            handleReturnToHome();
            expect(deps.setView).toHaveBeenCalledWith('home');
        });

        it('returns true', () => {
            const deps = makeDeps();
            const { handleReturnToHome } = 创建会话生命周期工作流(deps);
            const result = handleReturnToHome();
            expect(result).toBe(true);
        });
    });

    describe('handleQuickRestart', () => {
        function makeRecentConfig(overrides: any = {}) {
            return {
                worldConfig: { worldSeed: 'test-seed', ...overrides.worldConfig },
                charData: { 姓名: '李四', 气血: 100, 物品列表: [], 气运列表: [] },
                openingConfig: overrides.openingConfig,
                openingStreaming: true,
                openingExtraPrompt: '',
            };
        }

        it('returns early when loading', async () => {
            const deps = makeDeps({
                loading: true,
                最近开局配置: makeRecentConfig(),
            });
            const { handleQuickRestart } = 创建会话生命周期工作流(deps);
            await handleQuickRestart('all');
            expect(deps.清空重Roll快照).not.toHaveBeenCalled();
        });

        it('returns early when no recent config', async () => {
            const deps = makeDeps({ 最近开局配置: null });
            const { handleQuickRestart } = 创建会话生命周期工作流(deps);
            await handleQuickRestart('all');
            expect(deps.清空重Roll快照).not.toHaveBeenCalled();
        });

        it('clears roll snapshots and resets auto-save', async () => {
            const deps = makeDeps({ 最近开局配置: makeRecentConfig() });
            const { handleQuickRestart } = 创建会话生命周期工作流(deps);
            await handleQuickRestart('all');
            expect(deps.清空重Roll快照).toHaveBeenCalled();
            expect(deps.重置自动存档状态).toHaveBeenCalled();
        });

        it('shows settings when API not configured', async () => {
            mock获取主剧情接口配置.mockReturnValue({ provider: 'openai', apiKey: '', baseUrl: '', model: '' } as any);
            mock接口配置是否可用.mockReturnValue(false);
            const deps = makeDeps({ 最近开局配置: makeRecentConfig() });
            const { handleQuickRestart } = 创建会话生命周期工作流(deps);
            await handleQuickRestart('all');
            expect(deps.setShowSettings).toHaveBeenCalled();
            expect(deps.追加系统消息).toHaveBeenCalled();
        });

        it('world_only mode calls handleGenerateWorld with step mode', async () => {
            mock获取主剧情接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            const { 执行世界生成工作流 } = await import('./worldGenerationWorkflow');
            vi.mocked(执行世界生成工作流).mockResolvedValue();

            const deps = makeDeps({ 最近开局配置: makeRecentConfig() });
            const { handleQuickRestart } = 创建会话生命周期工作流(deps);
            await handleQuickRestart('world_only');
            expect(执行世界生成工作流).toHaveBeenCalled();
            const call = vi.mocked(执行世界生成工作流).mock.calls[0];
            expect(call[3]).toBe('step');
            expect(call[6]).toEqual(expect.objectContaining({ 清空前端变量: true }));
        });

        it('opening_only mode calls generateOpeningStory directly', async () => {
            mock获取主剧情接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            const { 执行开场剧情生成工作流 } = await import('./openingStoryWorkflow');
            vi.mocked(执行开场剧情生成工作流).mockResolvedValue();

            const deps = makeDeps({ 最近开局配置: makeRecentConfig() });
            const { handleQuickRestart } = 创建会话生命周期工作流(deps);
            await handleQuickRestart('opening_only');
            expect(执行开场剧情生成工作流).toHaveBeenCalled();
            expect(deps.setLoading).toHaveBeenCalledWith(true);
            expect(deps.setLoading).toHaveBeenLastCalledWith(false);
        });

        it('all mode calls handleGenerateWorld with all mode', async () => {
            mock获取主剧情接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            const { 执行世界生成工作流 } = await import('./worldGenerationWorkflow');
            vi.mocked(执行世界生成工作流).mockResolvedValue();

            const deps = makeDeps({ 最近开局配置: makeRecentConfig() });
            const { handleQuickRestart } = 创建会话生命周期工作流(deps);
            await handleQuickRestart('all');
            expect(执行世界生成工作流).toHaveBeenCalled();
            const call = vi.mocked(执行世界生成工作流).mock.calls[0];
            expect(call[3]).toBe('all');
            expect(call[6]).toEqual(expect.objectContaining({ 清空前端变量: true }));
        });

        it('opening_only handles error and shows failure message', async () => {
            mock获取主剧情接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
            mock接口配置是否可用.mockReturnValue(true);
            const { 执行开场剧情生成工作流 } = await import('./openingStoryWorkflow');
            vi.mocked(执行开场剧情生成工作流).mockRejectedValue(new Error('opening failed'));

            const deps = makeDeps({
                最近开局配置: makeRecentConfig(),
                历史记录: [],
                替换流式草稿为失败提示: vi.fn((h: any[]) => h),
            });
            const { handleQuickRestart } = 创建会话生命周期工作流(deps);
            await handleQuickRestart('opening_only');
            expect(deps.设置历史记录).toHaveBeenCalled();
            expect(deps.setLoading).toHaveBeenLastCalledWith(false);
        });
    });

    describe('handleGenerateWorld', () => {
        it('merges li-wuxia/li-zhiguai settings from saved settings', async () => {
            mock读取设置.mockResolvedValue({ 启用里武侠模式: true, 启用里志怪模式: false });
            const { 执行世界生成工作流 } = await import('./worldGenerationWorkflow');
            vi.mocked(执行世界生成工作流).mockResolvedValue();

            const deps = makeDeps({ gameConfig: { 启用修炼体系: true } });
            const { handleGenerateWorld } = 创建会话生命周期工作流(deps);
            await handleGenerateWorld(
                { worldSeed: 'test' } as any,
                { 姓名: '李四' } as any,
                undefined,
                'all'
            );
            expect(deps.setGameConfig).toHaveBeenCalledWith(
                expect.objectContaining({ 启用里武侠模式: true, 启用里志怪模式: false })
            );
        });

        it('syncs nsfw scene type from worldConfig', async () => {
            mock读取设置.mockResolvedValue(null);
            const { 执行世界生成工作流 } = await import('./worldGenerationWorkflow');
            vi.mocked(执行世界生成工作流).mockResolvedValue();

            const deps = makeDeps();
            const { handleGenerateWorld } = 创建会话生命周期工作流(deps);
            await handleGenerateWorld(
                { worldSeed: 'test', nsfw场景类型: 'explicit' } as any,
                { 姓名: '李四' } as any,
                undefined,
                'all'
            );
            expect(deps.setGameConfig).toHaveBeenCalledWith(
                expect.objectContaining({ nsfw场景类型: 'explicit' })
            );
        });

        it('loads prompts if not available', async () => {
            mock读取设置.mockResolvedValue(null);
            const { 执行世界生成工作流 } = await import('./worldGenerationWorkflow');
            vi.mocked(执行世界生成工作流).mockResolvedValue();

            const deps = makeDeps({ prompts: [] });
            const { handleGenerateWorld } = 创建会话生命周期工作流(deps);
            await handleGenerateWorld(
                { worldSeed: 'test' } as any,
                { 姓名: '李四' } as any,
                undefined,
                'all'
            );
            expect(deps.ensurePromptsLoaded).toHaveBeenCalled();
        });

        it('clears opening progress states', async () => {
            mock读取设置.mockResolvedValue(null);
            const { 执行世界生成工作流 } = await import('./worldGenerationWorkflow');
            vi.mocked(执行世界生成工作流).mockResolvedValue();

            const deps = makeDeps();
            const { handleGenerateWorld } = 创建会话生命周期工作流(deps);
            await handleGenerateWorld(
                { worldSeed: 'test' } as any,
                { 姓名: '李四' } as any,
                undefined,
                'all'
            );
            expect(deps.设置开局变量生成进度).toHaveBeenCalledWith(null);
            expect(deps.设置开局世界演变进度).toHaveBeenCalledWith(null);
            expect(deps.设置开局规划进度).toHaveBeenCalledWith(null);
        });

        it('calls world generation workflow with correct params', async () => {
            mock读取设置.mockResolvedValue(null);
            const { 执行世界生成工作流 } = await import('./worldGenerationWorkflow');
            vi.mocked(执行世界生成工作流).mockResolvedValue();

            const deps = makeDeps();
            const { handleGenerateWorld } = 创建会话生命周期工作流(deps);
            await handleGenerateWorld(
                { worldSeed: 'test' } as any,
                { 姓名: '李四' } as any,
                { enabled: true } as any,
                'all'
            );
            expect(执行世界生成工作流).toHaveBeenCalled();
        });
    });

    describe('generateOpeningStory', () => {
        it('clears opening progress states', async () => {
            const { 执行开场剧情生成工作流 } = await import('./openingStoryWorkflow');
            vi.mocked(执行开场剧情生成工作流).mockResolvedValue();

            const deps = makeDeps();
            const { generateOpeningStory } = 创建会话生命周期工作流(deps);
            await generateOpeningStory({}, [], false, {} as any, undefined);
            expect(deps.设置开局变量生成进度).toHaveBeenCalledWith(null);
            expect(deps.设置开局世界演变进度).toHaveBeenCalledWith(null);
            expect(deps.设置开局规划进度).toHaveBeenCalledWith(null);
        });

        it('loads prompts if promptSnapshot is empty', async () => {
            const { 执行开场剧情生成工作流 } = await import('./openingStoryWorkflow');
            vi.mocked(执行开场剧情生成工作流).mockResolvedValue();

            const deps = makeDeps();
            const { generateOpeningStory } = 创建会话生命周期工作流(deps);
            await generateOpeningStory({}, [], false, {} as any, undefined);
            expect(deps.ensurePromptsLoaded).toHaveBeenCalled();
        });

        it('uses provided prompts if available', async () => {
            const { 执行开场剧情生成工作流 } = await import('./openingStoryWorkflow');
            vi.mocked(执行开场剧情生成工作流).mockResolvedValue();

            const deps = makeDeps();
            const { generateOpeningStory } = 创建会话生命周期工作流(deps);
            const prompts = [{ id: 'test', 内容: 'content', 启用: true, 类型: '核心设定', 标题: '测试' }] as any;
            await generateOpeningStory({}, prompts, false, {} as any, undefined);
            expect(deps.ensurePromptsLoaded).not.toHaveBeenCalled();
        });

        it('pushes a rollback snapshot before generating', async () => {
            const { 执行开场剧情生成工作流 } = await import('./openingStoryWorkflow');
            vi.mocked(执行开场剧情生成工作流).mockResolvedValue();

            const deps = makeDeps();
            const { generateOpeningStory } = 创建会话生命周期工作流(deps);
            await generateOpeningStory({}, [], false, {} as any, undefined);
            expect(deps.推入重Roll快照).toHaveBeenCalled();
        });
    });
});
