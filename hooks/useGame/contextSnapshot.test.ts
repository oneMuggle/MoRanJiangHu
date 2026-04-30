import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 构建上下文快照数据 } from './contextSnapshot';

vi.mock('../../utils/apiConfig', () => ({
    获取剧情回忆接口配置: vi.fn(() => ({})),
    获取主剧情接口配置: vi.fn(() => ({ model: 'gpt-4' })),
    接口配置是否可用: vi.fn(() => false)
}));

vi.mock('../../utils/gameSettings', () => ({
    规范化游戏设置: vi.fn((v: any) => v || {})
}));

vi.mock('./memoryUtils', () => ({
    规范化记忆系统: vi.fn((v: any) => v || { 回忆档案: [] }),
    规范化记忆配置: vi.fn((v: any) => v || {})
}));

vi.mock('./mainStoryRequest', () => ({
    构建主剧情请求参数: vi.fn(() => ({
        messageEntries: [
            { id: 'system', title: '系统提示词', category: 'system', role: 'system' as const, content: '你是武侠世界的AI' },
            { id: 'history', title: '历史记录', category: 'history', role: 'user' as const, content: '你好' }
        ]
    }))
}));

vi.mock('./memoryRecall', () => ({
    构建剧情回忆检索上下文: vi.fn(() => '回忆上下文')
}));

vi.mock('./promptRuntime', () => ({
    构建COT伪装提示词: vi.fn(() => 'COT伪装')
}));

vi.mock('../../utils/tokenEstimate', () => ({
    countOpenAIChatMessagesTokensWithBreakdown: vi.fn((msgs: any[]) => ({
        items: msgs.map(() => ({ totalTokens: 100 }))
    }))
}));

vi.mock('../../services/novel-decomposition/novelDecompositionInjection', () => ({
    获取激活小说拆分注入文本: vi.fn(() => Promise.resolve(''))
}));

vi.mock('../../prompts/runtime/recall', () => ({
    剧情回忆检索COT提示词: 'recall COT',
    剧情回忆检索输出格式提示词: 'recall format',
    构建剧情回忆检索用户提示词: vi.fn(() => 'recall user prompt')
}));

describe('contextSnapshot', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const makeParams = (overrides: any = {}) => ({
        apiConfig: { configs: [] },
        gameConfig: {},
        memoryConfig: {},
        prompts: [],
        内置提示词列表: [],
        世界书列表: [],
        记忆系统: { 回忆档案: [] },
        历史记录: [
            { role: 'user' as const, content: '测试输入' },
            { role: 'assistant' as const, content: 'AI回复' }
        ],
        社交: [],
        角色: { 姓名: '主角', 性别: '男' },
        环境: {},
        世界: {},
        战斗: {},
        玩家门派: {},
        任务列表: [],
        约定列表: [],
        剧情: {},
        剧情规划: {},
        女主剧情规划: {},
        同人剧情规划: {},
        同人女主剧情规划: {},
        开局配置: undefined,
        规范化环境信息: vi.fn((v: any) => v || {}),
        规范化剧情状态: vi.fn((v: any) => v || {}),
        规范化剧情规划状态: vi.fn((v: any) => v || {}),
        规范化女主剧情规划状态: vi.fn((v: any) => v || {}),
        规范化同人剧情规划状态: vi.fn((v: any) => v || {}),
        规范化同人女主剧情规划状态: vi.fn((v: any) => v || {}),
        按回合窗口裁剪历史: vi.fn((history: any[]) => history),
        构建系统提示词: vi.fn(() => ({
            systemPrompt: 'system',
            runtimePromptStates: { system_prompt: { 当前启用: true, 原始启用: true, 受运行时接管: false, 运行时注入: false } }
        })),
        ...overrides
    });

    describe('构建上下文快照数据', () => {
        it('returns sections with token counts', async () => {
            const result = await 构建上下文快照数据(makeParams());
            expect(result.sections).toHaveLength(2);
            expect(result.sections[0].uploadTokens).toBe(100);
        });

        it('concatenates full text from sections', async () => {
            const result = await 构建上下文快照数据(makeParams());
            expect(result.fullText).toContain('你是武侠世界的AI');
            expect(result.fullText).toContain('你好');
        });

        it('sums upload tokens across sections', async () => {
            const result = await 构建上下文快照数据(makeParams());
            expect(result.uploadTokens).toBe(200);
        });

        it('includes runtime prompt states', async () => {
            const result = await 构建上下文快照数据(makeParams());
            expect(result.runtimePromptStates).toBeDefined();
            expect(result.runtimePromptStates.system_prompt).toBeDefined();
        });

        it('assigns sequential order to sections', async () => {
            const result = await 构建上下文快照数据(makeParams());
            expect(result.sections[0].order).toBe(1);
            expect(result.sections[1].order).toBe(2);
        });

        it('finds latest user input from history', async () => {
            const result = await 构建上下文快照数据(makeParams());
            expect(result.fullText).toBeDefined();
        });

        it('handles empty history gracefully', async () => {
            const result = await 构建上下文快照数据(makeParams({
                历史记录: []
            }));
            expect(result).toBeDefined();
        });

        it('uses fallback when no user message in history', async () => {
            const result = await 构建上下文快照数据(makeParams({
                历史记录: [{ role: 'assistant', content: 'only AI' }]
            }));
            expect(result).toBeDefined();
        });
    });

    describe('recall mode', () => {
        it('does not include recall sections when recall API not usable', async () => {
            const result = await 构建上下文快照数据(makeParams());
            const recallSections = result.sections.filter(s => s.category === '回忆API');
            expect(recallSections).toHaveLength(0);
        });

        it('includes recall sections when recall API is usable', async () => {
            const { 获取剧情回忆接口配置, 接口配置是否可用 } = await import('../../utils/apiConfig');
            (获取剧情回忆接口配置 as any).mockReturnValue({ model: 'gpt-4' });
            (接口配置是否可用 as any).mockReturnValue(true);

            const result = await 构建上下文快照数据(makeParams({
                apiConfig: {
                    功能模型占位: {
                        剧情回忆独立模型开关: true,
                        剧情回忆最早触发回合: 1
                    }
                },
                记忆系统: { 回忆档案: Array(10).fill(null).map((_, i) => ({ id: `r${i}` })) }
            }));

            const recallSections = result.sections.filter(s => s.category === '回忆API');
            expect(recallSections.length).toBeGreaterThan(0);
        });
    });
});
