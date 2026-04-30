import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 创建历史回合工作流 } from './historyTurnWorkflow';

vi.mock('../../services/novel-decomposition/novelDecompositionCalibration', () => ({
    同步剧情小说分解时间校准: vi.fn((p: any) => Promise.resolve(p.nextStory || {})),
}));

function makeDeepCopy<T>(value: T): T {
    if (value === undefined) return undefined as T;
    return JSON.parse(JSON.stringify(value));
}

function makeDeps(overrides: any = {}) {
    return {
        历史记录: [
            { role: 'user', content: '玩家输入', timestamp: 1, gameTime: '2026-04-30T00:00:00' },
            { role: 'assistant', content: 'AI回复', timestamp: 2, gameTime: '2026-04-30T00:01:00', structuredResponse: { logs: [], tavern_commands: [] } },
        ],
        记忆系统: { 即时记忆: [], 短期记忆: [], 中期记忆: [], 长期记忆: [], 回忆档案: [] },
        memoryConfig: { 即时消息上传条数N: 10, 短期记忆阈值: 5, 中期记忆阈值: 3 },
        gameConfig: { 启用修炼体系: true, 剧情风格: '一般' },
        prompts: [],
        内置提示词列表: [],
        世界书列表: [],
        loading: false,
        变量生成中: false,
        记忆总结阶段: 'idle' as const,
        社交: [],
        visualConfig: {},
        visualConfigRef: { current: {} },
        场景图片档案Ref: { current: {} },
        scrollRef: { current: { scrollTop: 0 } },
        获取最新快照: vi.fn(() => ({
            玩家输入: '玩家输入',
            游戏时间: '2026-04-30T00:00:00',
            回档前状态: {
                角色: { 姓名: '李四' },
                环境: { 年: 2026 },
                社交: [],
                世界: {},
                战斗: {},
                玩家门派: {},
                任务列表: [],
                约定列表: [],
                剧情: {},
                女主剧情规划: {},
                记忆系统: { 即时记忆: [], 短期记忆: [], 中期记忆: [], 长期记忆: [], 回忆档案: [] },
            },
            回档前历史: [],
        })),
        回档到快照: vi.fn(),
        弹出重Roll快照: vi.fn(() => null),
        删除最近自动存档并重置状态: vi.fn(() => Promise.resolve()),
        深拷贝: makeDeepCopy,
        环境时间转标准串: vi.fn(() => '2026-04-30T00:01:00'),
        获取开局配置: vi.fn(() => null),
        规范化记忆配置: vi.fn((c: any) => ({ 即时消息上传条数N: 10, 短期记忆阈值: 5, 中期记忆阈值: 3, ...c })),
        规范化记忆系统: vi.fn((m: any) => ({ 即时记忆: [], 短期记忆: [], 中期记忆: [], 长期记忆: [], 回忆档案: [], ...m })),
        规范化社交列表: vi.fn((s: any[]) => s || []),
        规范化视觉设置: vi.fn((v: any) => v || {}),
        规范化场景图片档案: vi.fn((a: any) => a || {}),
        normalizeCanonicalGameTime: vi.fn((t: string) => t || ''),
        构建即时记忆条目: vi.fn((gt: string, pi: string, ai: any, opts?: any) => ({ type: 'immediate', gameTime: gt })),
        构建短期记忆条目: vi.fn((gt: string, ai: any) => ({ type: 'short', gameTime: gt })),
        写入四段记忆: vi.fn((mem: any, imm: any, short: any, opts: any) => ({ ...mem, 即时记忆: [imm], 短期记忆: [short] })),
        估算AI输出Token: vi.fn(() => 100),
        提取解析失败原始信息: vi.fn((e: any) => e?.message || 'parse error'),
        提取原始报错详情: vi.fn((e: any) => e?.message || 'error detail'),
        构建标签解析选项: vi.fn(() => ({ enableTagRepair: false })),
        parseStoryRawText: vi.fn((raw: string) => ({ logs: [], tavern_commands: [], rawText: raw })),
        执行正文润色: vi.fn(() => Promise.resolve({ applied: true, response: { logs: [], tavern_commands: [] } })),
        规范化游戏设置: vi.fn((c: any) => ({ 启用修炼体系: true, 剧情风格: '一般', ...c })),
        processResponseCommands: vi.fn(() => ({
            角色: { 姓名: '李四' },
            环境: { 年: 2026 },
            社交: [],
            世界: {},
            战斗: {},
            玩家门派: {},
            任务列表: [],
            约定列表: [],
            剧情: {},
            女主剧情规划: {},
        })),
        按世界演变分流净化响应: vi.fn((r: any) => ({ response: r })),
        世界演变功能已开启: vi.fn(() => false),
        执行重解析变量生成: vi.fn((p: any) => Promise.resolve(p.parsedResponse)),
        应用并同步记忆系统: vi.fn(),
        performAutoSave: vi.fn(() => Promise.resolve()),
        设置剧情: vi.fn(),
        设置历史记录: vi.fn(),
        设置玩家门派: vi.fn(),
        设置任务列表: vi.fn(),
        设置约定列表: vi.fn(),
        设置社交: vi.fn(),
        记录变量生成上下文: vi.fn(),
        set聊天区自动滚动抑制令牌: vi.fn(),
        获取NPC唯一标识: vi.fn((n: any, i: number) => n?.姓名 || `npc_${i}`),
        合并NPC图片档案: vi.fn((a: any) => ({ ...a })),
        ...overrides,
    };
}

describe('创建历史回合工作流', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('updateHistoryItem', () => {
        it('returns error when target index out of range', async () => {
            const deps = makeDeps();
            const { updateHistoryItem } = 创建历史回合工作流(deps);
            const result = await updateHistoryItem(-1, 'new text');
            expect(result).toContain('目标历史记录不存在');
        });

        it('returns error when target is not assistant', async () => {
            const deps = makeDeps({
                历史记录: [{ role: 'user', content: 'hello', timestamp: 1 }],
            });
            const { updateHistoryItem } = 创建历史回合工作流(deps);
            const result = await updateHistoryItem(0, 'new text');
            expect(result).toContain('仅支持编辑 AI');
        });

        it('returns error when not latest assistant turn', async () => {
            const deps = makeDeps({
                历史记录: [
                    { role: 'assistant', content: 'old', timestamp: 1, structuredResponse: { logs: [], tavern_commands: [] } },
                    { role: 'user', content: 'input', timestamp: 2 },
                    { role: 'assistant', content: 'new', timestamp: 3, structuredResponse: { logs: [], tavern_commands: [] } },
                ],
            });
            const { updateHistoryItem } = 创建历史回合工作流(deps);
            const result = await updateHistoryItem(0, 'new text');
            expect(result).toContain('仅最新回合支持编辑');
        });

        it('returns error when variable generation in progress', async () => {
            const deps = makeDeps({
                变量生成中: true,
                获取最新快照: vi.fn(() => null),
            });
            const { updateHistoryItem } = 创建历史回合工作流(deps);
            const result = await updateHistoryItem(1, 'new text');
            expect(result).toContain('变量生成进行中');
        });

        it('returns error when no snapshot available', async () => {
            const deps = makeDeps({
                获取最新快照: vi.fn(() => null),
            });
            const { updateHistoryItem } = 创建历史回合工作流(deps);
            const result = await updateHistoryItem(1, 'new text');
            expect(result).toContain('缺少上一轮快照');
        });

        it('proceeds for opening turn when both player inputs are empty', async () => {
            const deps = makeDeps({
                历史记录: [
                    { role: 'assistant', content: 'AI', timestamp: 1, structuredResponse: { logs: [], tavern_commands: [] } },
                ],
                获取最新快照: vi.fn(() => ({
                    玩家输入: '',
                    游戏时间: '2026-04-30T00:00:00',
                    回档前状态: {
                        角色: {}, 环境: {}, 社交: [], 世界: {}, 战斗: {},
                        玩家门派: {}, 任务列表: [], 约定列表: [], 剧情: {},
                        女主剧情规划: {},
                        记忆系统: { 即时记忆: [], 短期记忆: [], 中期记忆: [], 长期记忆: [], 回忆档案: [] },
                    },
                    回档前历史: [],
                })),
                parseStoryRawText: vi.fn(() => ({ logs: [], tavern_commands: [] })),
            });
            const { updateHistoryItem } = 创建历史回合工作流(deps);
            const result = await updateHistoryItem(0, 'new text');
            // Opening turn: both inputs empty => isOpeningTurn=true => proceeds
            expect(result).toBeNull();
        });

        it('returns error when snapshot player input differs from history', async () => {
            const deps = makeDeps({
                历史记录: [
                    { role: 'user', content: '历史输入', timestamp: 0 },
                    { role: 'assistant', content: 'AI', timestamp: 1, structuredResponse: { logs: [], tavern_commands: [] } },
                ],
                获取最新快照: vi.fn(() => ({
                    玩家输入: '快照输入',
                    游戏时间: '2026-04-30T00:00:00',
                    回档前状态: {
                        角色: {}, 环境: {}, 社交: [], 世界: {}, 战斗: {},
                        玩家门派: {}, 任务列表: [], 约定列表: [], 剧情: {},
                        女主剧情规划: {},
                        记忆系统: { 即时记忆: [], 短期记忆: [], 中期记忆: [], 长期记忆: [], 回忆档案: [] },
                    },
                    回档前历史: [],
                })),
            });
            const { updateHistoryItem } = 创建历史回合工作流(deps);
            const result = await updateHistoryItem(1, 'new text');
            expect(result).toContain('不匹配');
        });

        it('returns error when parse fails', async () => {
            const deps = makeDeps({
                parseStoryRawText: vi.fn(() => { throw new Error('parse failed'); }),
            });
            const { updateHistoryItem } = 创建历史回合工作流(deps);
            const result = await updateHistoryItem(1, 'bad text');
            expect(result).toContain('parse failed');
        });

        it('succeeds and sets history', async () => {
            const deps = makeDeps();
            const { updateHistoryItem } = 创建历史回合工作流(deps);
            const result = await updateHistoryItem(1, 'new text');
            expect(result).toBeNull();
            expect(deps.设置历史记录).toHaveBeenCalled();
        });
    });

    describe('handleRegenerate', () => {
        it('returns null when loading', async () => {
            const deps = makeDeps({ loading: true });
            const { handleRegenerate } = 创建历史回合工作流(deps);
            const result = await handleRegenerate();
            expect(result).toBeNull();
        });

        it('returns null when no snapshot available', async () => {
            const deps = makeDeps({ 弹出重Roll快照: vi.fn(() => null) });
            const { handleRegenerate } = 创建历史回合工作流(deps);
            const result = await handleRegenerate();
            expect(result).toBeNull();
        });

        it('returns player input on success', async () => {
            const deps = makeDeps({
                弹出重Roll快照: vi.fn(() => ({ 玩家输入: 'regenerate input', 游戏时间: '2026-04-30', 回档前状态: {} as any, 回档前历史: [] })),
            });
            const { handleRegenerate } = 创建历史回合工作流(deps);
            const result = await handleRegenerate();
            expect(result).toBe('regenerate input');
            expect(deps.回档到快照).toHaveBeenCalled();
            expect(deps.删除最近自动存档并重置状态).toHaveBeenCalled();
        });
    });

    describe('handleRecoverFromParseErrorRaw', () => {
        it('returns error when loading', async () => {
            const deps = makeDeps({ loading: true });
            const { handleRecoverFromParseErrorRaw } = 创建历史回合工作流(deps);
            const result = await handleRecoverFromParseErrorRaw('raw');
            expect(result).toContain('当前仍在处理中');
        });

        it('returns error when no snapshot', async () => {
            const deps = makeDeps({ 获取最新快照: vi.fn(() => null) });
            const { handleRecoverFromParseErrorRaw } = 创建历史回合工作流(deps);
            const result = await handleRecoverFromParseErrorRaw('raw');
            expect(result).toContain('没有可恢复');
        });

        it('returns parse error on failure', async () => {
            const deps = makeDeps({
                parseStoryRawText: vi.fn(() => { throw new Error('parse error'); }),
            });
            const { handleRecoverFromParseErrorRaw } = 创建历史回合工作流(deps);
            const result = await handleRecoverFromParseErrorRaw('raw');
            expect(result).toContain('parse error');
        });

        it('succeeds with force repair', async () => {
            const deps = makeDeps();
            const { handleRecoverFromParseErrorRaw } = 创建历史回合工作流(deps);
            const result = await handleRecoverFromParseErrorRaw('raw', true);
            expect(result).toBeNull();
        });
    });

    describe('handlePolishTurn', () => {
        it('returns error when target does not exist', async () => {
            const deps = makeDeps();
            const { handlePolishTurn } = 创建历史回合工作流(deps);
            const result = await handlePolishTurn(99);
            expect(result).toContain('目标回合不存在');
        });

        it('returns error when target is not assistant with structuredResponse', async () => {
            const deps = makeDeps({
                历史记录: [{ role: 'user', content: 'hello', timestamp: 1 }],
            });
            const { handlePolishTurn } = 创建历史回合工作流(deps);
            const result = await handlePolishTurn(0);
            expect(result).toContain('仅支持优化 AI 正文');
        });

        it('returns polish error when execution fails', async () => {
            const deps = makeDeps({
                执行正文润色: vi.fn(() => Promise.reject(new Error('polish failed'))),
            });
            const { handlePolishTurn } = 创建历史回合工作流(deps);
            const result = await handlePolishTurn(1);
            expect(result).toContain('polish failed');
        });

        it('succeeds and updates history', async () => {
            const deps = makeDeps();
            const { handlePolishTurn } = 创建历史回合工作流(deps);
            const result = await handlePolishTurn(1);
            expect(result).toBeNull();
            expect(deps.设置历史记录).toHaveBeenCalled();
            expect(deps.应用并同步记忆系统).toHaveBeenCalled();
            expect(deps.performAutoSave).toHaveBeenCalled();
        });
    });
});
