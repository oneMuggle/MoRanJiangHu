import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 构建主剧情请求参数 } from './mainStoryRequest';
import * as gameSettings from '../../utils/gameSettings';
import * as promptRuntime from './promptRuntime';
import * as historyUtils from './historyUtils';

vi.mock('../../utils/gameSettings', () => ({
    规范化游戏设置: vi.fn((c: any) => ({
        启用修炼体系: true,
        启用GPT模式: false,
        启用NSFW模式: false,
        启用COT伪装注入: true,
        启用标签检测完整性: false,
        启用标签修复: true,
        启用行动选项: true,
        额外提示词: '',
        剧情风格: '一般',
        启用酒馆预设模式: false,
        启用真实世界模式: false,
        ...c,
    })),
}));
vi.mock('./promptRuntime', () => ({
    构建COT伪装提示词: vi.fn(() => '<COT伪装>'),
    构建酒馆预设消息链: vi.fn(() => [
        { role: 'system', content: 'tavern system msg' },
        { role: 'user', content: 'tavern user msg' },
    ]),
    酒馆预设模式可用: vi.fn(() => false),
}));
vi.mock('../../prompts/runtime/storyStyles', () => ({
    构建剧情风格助手提示词: vi.fn(() => '<剧情风格>'),
}));
vi.mock('../../prompts/runtime/realWorldMode', () => ({
    构建真实世界模式提示词: vi.fn(() => '<真实世界>'),
}));
vi.mock('../../prompts/runtime/nsfw', () => ({
    构建运行时额外提示词: vi.fn((s: string) => s),
}));
vi.mock('../../utils/worldbook', () => ({
    世界书本体槽位: { 真实世界模式: 'real_world_mode' },
}));
vi.mock('../../utils/builtinPrompts', () => ({
    获取剧情风格内置槽位: vi.fn(() => 'style_slot'),
    获取内置提示词槽位内容: vi.fn(({ fallback }: any) => fallback),
}));
vi.mock('../../utils/promptFeatureToggles', () => ({
    按功能开关过滤提示词内容: vi.fn((c: string) => c),
}));
vi.mock('./historyUtils', () => ({
    formatHistoryToScript: vi.fn(() => '<剧本>'),
}));

const mock规范化游戏设置 = vi.mocked(gameSettings.规范化游戏设置);
const mock酒馆预设模式可用 = vi.mocked(promptRuntime.酒馆预设模式可用);
const mock构建酒馆预设消息链 = vi.mocked(promptRuntime.构建酒馆预设消息链);
const mock格式化历史 = vi.mocked(historyUtils.formatHistoryToScript);

function makeParams(overrides: any = {}) {
    return {
        gameConfig: { 启用修炼体系: true, 剧情风格: '一般' },
        apiConfig: { provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' },
        builtContext: {
            shortMemoryContext: '<短期记忆>',
            contextPieces: {
                AI角色声明: '<AI角色>',
                worldPrompt: '<世界观>',
                地图建筑状态: '<地图>',
                同人设定摘要: '',
                境界体系提示词: '<境界>',
                离场NPC档案: '',
                otherPrompts: '<其他>',
                难度设置提示词: '<难度>',
                叙事人称提示词: '<人称>',
                字数设置提示词: '<字数>',
                长期记忆: '<长期记忆>',
                中期记忆: '<中期记忆>',
                在场NPC档案: '<在场NPC>',
                剧情安排: '<剧情安排>',
                女主剧情规划状态: '',
                世界状态: '<世界>',
                环境状态: '<环境>',
                角色状态: '<角色>',
                战斗状态: '<战斗>',
                门派状态: '<门派>',
                任务状态: '<任务>',
                约定状态: '<约定>',
                COT提示词: '<COT>',
                格式提示词: '<格式>',
                字数要求提示词: '<字数要求>',
                免责声明输出提示词: '',
                输出协议提示词: '<输出协议>',
            },
        },
        updatedContextHistory: [
            { role: 'user' as const, content: '你好', timestamp: 1 },
            { role: 'assistant' as const, content: '你好呀', timestamp: 2 },
        ],
        updatedMemSys: { 短期记忆: [], 即时记忆: [] },
        sendInput: '玩家输入',
        builtinPromptEntries: [],
        worldbooks: [],
        ...overrides,
    };
}

describe('构建主剧情请求参数', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('basic flow', () => {
        it('returns runtimeGameConfig', () => {
            const result = 构建主剧情请求参数(makeParams());
            expect(result.runtimeGameConfig).toBeDefined();
            expect(mock规范化游戏设置).toHaveBeenCalled();
        });

        it('returns messageEntries in non-tavern mode', () => {
            mock酒馆预设模式可用.mockReturnValue(false);
            const result = 构建主剧情请求参数(makeParams());
            expect(result.messageEntries.length).toBeGreaterThan(0);
            expect(result.messageEntries.some((e) => e.id === 'ai_role')).toBe(true);
            expect(result.messageEntries.some((e) => e.id === 'world_prompt')).toBe(true);
        });

        it('returns orderedMessages matching messageEntries', () => {
            mock酒馆预设模式可用.mockReturnValue(false);
            const result = 构建主剧情请求参数(makeParams());
            expect(result.orderedMessages.length).toBe(result.messageEntries.length);
            result.orderedMessages.forEach((msg, i) => {
                expect(msg.role).toBe(result.messageEntries[i].role);
                expect(msg.content).toBe(result.messageEntries[i].content);
            });
        });

        it('includes player input in non-GPT mode', () => {
            mock酒馆预设模式可用.mockReturnValue(false);
            const result = 构建主剧情请求参数(makeParams({ gameConfig: { 启用GPT模式: false } }));
            expect(result.messageEntries.some((e) => e.id === 'player_input_as_model')).toBe(true);
        });

        it('includes user input as start_task in non-GPT mode', () => {
            mock酒馆预设模式可用.mockReturnValue(false);
            const result = 构建主剧情请求参数(makeParams());
            const startTask = result.messageEntries.find((e) => e.id === 'start_task');
            expect(startTask).toBeDefined();
            expect(startTask?.content).toBe('开始任务');
        });

        it('includes user input as content in GPT mode', () => {
            mock酒馆预设模式可用.mockReturnValue(false);
            const result = 构建主剧情请求参数(makeParams({ gameConfig: { 启用GPT模式: true } }));
            const startTask = result.messageEntries.find((e) => e.id === 'start_task');
            expect(startTask?.content).toBe('玩家输入');
        });
    });

    describe('tavern preset mode', () => {
        it('uses tavern messages when enabled', () => {
            mock酒馆预设模式可用.mockReturnValue(true);
            const result = 构建主剧情请求参数(makeParams());
            expect(result.tavernPresetModeEnabled).toBe(true);
            expect(mock构建酒馆预设消息链).toHaveBeenCalled();
            expect(result.messageEntries.every((e) => e.id.startsWith('tavern_message'))).toBe(true);
        });

        it('sets extraPromptForService to empty in tavern mode', () => {
            mock酒馆预设模式可用.mockReturnValue(true);
            const result = 构建主剧情请求参数(makeParams());
            expect(result.extraPromptForService).toBe('');
        });
    });

    describe('COT pseudo', () => {
        it('includes COT pseudo history when enabled', () => {
            mock酒馆预设模式可用.mockReturnValue(false);
            const result = 构建主剧情请求参数(makeParams({ gameConfig: { 启用COT伪装注入: true } }));
            expect(result.messageEntries.some((e) => e.id === 'cot_fake_history')).toBe(true);
        });

        it('excludes COT pseudo history when disabled', () => {
            mock酒馆预设模式可用.mockReturnValue(false);
            const result = 构建主剧情请求参数(makeParams({ gameConfig: { 启用COT伪装注入: false } }));
            expect(result.messageEntries.some((e) => e.id === 'cot_fake_history')).toBe(false);
        });
    });

    describe('recall tag', () => {
        it('appends recall tag to history script', () => {
            mock酒馆预设模式可用.mockReturnValue(false);
            const result = 构建主剧情请求参数(makeParams({ recallTag: '<回忆内容>' }));
            expect(mock格式化历史).toHaveBeenCalled();
            expect(result.orderedMessages.some((m) => m.content.includes('【剧情回忆】'))).toBe(true);
        });

        it('includes recall in tavern input when recallTag present', () => {
            mock酒馆预设模式可用.mockReturnValue(true);
            构建主剧情请求参数(makeParams({ recallTag: '<回忆内容>' }));
            const call = mock构建酒馆预设消息链.mock.calls[0][0];
            expect(call.latestUserInput).toContain('回忆内容');
        });
    });

    describe('style and real world mode', () => {
        it('includes style assistant prompt', () => {
            mock酒馆预设模式可用.mockReturnValue(false);
            const result = 构建主剧情请求参数(makeParams());
            expect(result.styleAssistantPrompt).toBe('<剧情风格>');
        });

        it('does not include real world mode when disabled', () => {
            mock酒馆预设模式可用.mockReturnValue(false);
            const result = 构建主剧情请求参数(makeParams());
            expect(result.realWorldModePrompt).toBe('');
        });

        it('includes real world mode when enabled', () => {
            mock酒馆预设模式可用.mockReturnValue(false);
            const result = 构建主剧情请求参数(makeParams({
                gameConfig: { 启用真实世界模式: true },
                builtinPromptEntries: [],
            }));
            expect(result.realWorldModePrompt).toBeDefined();
        });
    });

    describe('novel decomposition', () => {
        it('includes novel decomposition prompt when provided', () => {
            mock酒馆预设模式可用.mockReturnValue(false);
            const result = 构建主剧情请求参数(makeParams({ novelDecompositionPrompt: '小说分解内容' }));
            expect(result.messageEntries.some((e) => e.id === 'novel_decomposition')).toBe(true);
            expect(result.messageEntries.find((e) => e.id === 'novel_decomposition')?.content).toBe('小说分解内容');
        });

        it('excludes novel decomposition when empty', () => {
            mock酒馆预设模式可用.mockReturnValue(false);
            const result = 构建主剧情请求参数(makeParams());
            expect(result.messageEntries.some((e) => e.id === 'novel_decomposition')).toBe(false);
        });
    });

    describe('disclaimer', () => {
        it('includes disclaimer when context has it', () => {
            mock酒馆预设模式可用.mockReturnValue(false);
            const ctx = makeParams();
            ctx.builtContext.contextPieces.免责声明输出提示词 = '【免责声明】';
            const result = 构建主剧情请求参数(ctx);
            expect(result.disclaimerRequirementPrompt).toBe('【免责声明】');
        });

        it('disclaimer is undefined when not in context', () => {
            mock酒馆预设模式可用.mockReturnValue(false);
            const result = 构建主剧情请求参数(makeParams());
            expect(result.disclaimerRequirementPrompt).toBeUndefined();
        });
    });
});
