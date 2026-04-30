import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 构建系统提示词 } from './systemPromptBuilder';

vi.mock('./memoryUtils', () => ({
    规范化记忆配置: vi.fn((c: any) => c || { 即时消息上传条数N: 10, 短期记忆阈值: 30, 中期记忆阈值: 10, 长期记忆阈值: 5 }),
    规范化记忆系统: vi.fn((m: any) => m),
    格式化短期记忆展示文本: vi.fn((item: any) => item?.content || 'short memory'),
}));
vi.mock('./npcContext', () => ({
    构建NPC上下文: vi.fn(() => ({ 在场数据块: '【在场NPC】\n无', 离场数据块: '【离场NPC】\n无' })),
}));
vi.mock('./timeUtils', () => ({
    normalizeCanonicalGameTime: vi.fn((t: string) => t),
    环境时间转标准串: vi.fn(() => '2026:04:30:14:00'),
    结构化时间转标准串: vi.fn(() => ''),
}));
vi.mock('../../utils/gameSettings', () => ({
    规范化游戏设置: vi.fn((c: any) => ({
        字数要求: 500,
        叙事人称: '第二人称',
        启用行动选项: true,
        启用NSFW模式: false,
        启用修炼体系: true,
        启用女主剧情规划: false,
        启用酒馆预设模式: false,
        启用防止说话: true,
        启用饱腹口渴系统: true,
        启用真实世界模式: false,
        启用里武侠模式: false,
        启用里志怪模式: false,
        古代体系选择: '武侠',
        剧情风格: '标准',
        ...c,
    })),
}));
vi.mock('../../utils/worldbook', () => ({
    构建世界书注入文本: vi.fn(() => ({ worldLoreText: '', systemRuleText: '', commandRuleText: '', outputRuleText: '' })),
    世界书本体槽位: {
        主剧情AI角色声明: 'main_ai_role',
        主剧情输出协议: 'main_output_protocol',
        主剧情女主规划_常规: 'main_heroine_plan',
        主剧情女主规划_NTL: 'main_heroine_plan_ntl',
        主剧情女主规划思考_常规: 'main_heroine_plan_cot',
        主剧情女主规划思考_NTL: 'main_heroine_plan_cot_ntl',
        主剧情COT_常规: 'main_cot',
        主剧情COT_女主规划: 'main_cot_heroine',
        主剧情COT_NTL女主规划: 'main_cot_heroine_ntl',
        写作文风: 'write_style',
        写作避免极端情绪: 'write_emotion_guard',
        写作NoControl: 'write_no_control',
    },
}));
vi.mock('../../utils/builtinPrompts', () => ({
    获取内置提示词槽位内容: vi.fn(({ fallback }: any) => fallback),
}));
vi.mock('./promptRuntime', () => ({
    构建运行时提示词池: vi.fn((pool: any[]) => ({ promptPool: pool, selectedCotPromptIds: ['core_cot'] })),
    剥离NoControl关联提示词: vi.fn((s: string) => s),
    规范化比较文本: vi.fn((s: string) => s),
}));
vi.mock('../../prompts/runtime/roleIdentity', () => ({
    构建AI角色声明提示词: vi.fn((name: string) => `你是AI助手，服务于${name}`),
}));
vi.mock('../../prompts/runtime/nsfwCard', () => ({
    构建在场NPC_NSWF卡片组: vi.fn(() => '【NSFW卡片】\n...'),
}));
vi.mock('../../prompts/runtime/protocolDirectives', () => ({
    构建字数要求提示词: vi.fn((n: number) => `<字数>必须达到${n}字以上</字数>`),
    构建免责声明输出要求提示词: vi.fn(() => '<免责声明>...</免责声明>'),
    获取输出协议提示词: vi.fn(() => '<输出协议>JSON格式</输出协议>'),
    获取行动选项提示词: vi.fn(() => '<行动选项>...</行动选项>'),
}));
vi.mock('./stateTransforms', () => ({
    规范化环境信息: vi.fn((e: any) => e || {}),
}));
vi.mock('./storyState', () => ({
    规范化剧情状态: vi.fn((s: any) => s || {}),
    规范化剧情规划状态: vi.fn((p: any) => p || {}),
    规范化女主剧情规划状态: vi.fn(() => undefined),
    规范化同人剧情规划状态: vi.fn(() => undefined),
    规范化同人女主剧情规划状态: vi.fn(() => undefined),
    规范化世界状态: vi.fn((w: any) => w || {}),
    规范化战斗状态: vi.fn((b: any) => b || {}),
}));
vi.mock('../../prompts/runtime/fandom', () => ({
    构建同人运行时提示词包: vi.fn(() => ({ enabled: false, 同人设定摘要: '' })),
    应用境界体系区块替换: vi.fn((c: string) => c),
}));
vi.mock('../../data/qiyun', () => ({
    计算气运属性修正: vi.fn((n: number) => n),
}));
vi.mock('../../prompts/core/heroinePlan', () => ({
    构建女主剧情规划协议: vi.fn(() => ''),
}));
vi.mock('../../prompts/core/heroinePlanCot', () => ({
    构建女主规划专项提示词: vi.fn(() => ''),
}));
vi.mock('../../prompts/core/realm', () => ({
    核心_境界体系: { 内容: '【境界体系】\n...' },
}));
vi.mock('../../prompts/runtime/liWuxiaWorld', () => ({
    构建里武侠世界提示词: vi.fn(() => '【里武侠】\n...'),
}));
vi.mock('../../prompts/runtime/liZhiguaiWorld', () => ({
    构建里志怪世界提示词: vi.fn(() => '【里志怪】\n...'),
}));
vi.mock('../../prompts/runtime/zhiguaiWorld', () => ({
    构建志怪世界提示词: vi.fn(() => '【志怪】\n...'),
}));
vi.mock('../../prompts/runtime/eraTheme', () => ({
    构建时代主题注入: vi.fn(() => ''),
    构建时代文风注入: vi.fn(() => ''),
}));
vi.mock('../../prompts/core/eraRealism', () => ({
    获取时代现实提示词ByEraId: vi.fn(() => ''),
}));
vi.mock('../../prompts/runtime/eraLiMode', () => ({
    构建子纪元里模式注入: vi.fn(() => ''),
}));
vi.mock('../../prompts/runtime/promptOwnership', () => ({
    构建主剧情难度摘要提示词: vi.fn(() => ''),
}));
vi.mock('./promptFeatureToggles', () => ({
    按功能开关过滤提示词内容: vi.fn((c: string) => c),
    裁剪修炼体系上下文数据: vi.fn((d: any) => d),
    裁剪里武侠上下文数据: vi.fn((d: any) => d),
    裁剪里志怪上下文数据: vi.fn((d: any) => d),
}));

function makeParams(overrides: any = {}) {
    return {
        promptPool: [
            { id: 'core_world', 内容: '【世界观】\n江湖世界', 启用: true, 类型: '核心设定' },
            { id: 'core_realm', 内容: '【境界体系】', 启用: true, 类型: '核心设定' },
            { id: 'core_cot', 内容: '<COT预思考协议>', 启用: true, 类型: '思考协议' },
            { id: 'core_format', 内容: '<输出协议>', 启用: true, 类型: '格式规范' },
            { id: 'write_req', 内容: '<字数>500字</字数>', 启用: true, 类型: '写作要求' },
            { id: 'core_action_options', 内容: '<行动选项>', 启用: true, 类型: '交互' },
            { id: 'write_perspective_first', 内容: '使用第一人称', 启用: false, 类型: '写作视角' },
            { id: 'write_perspective_second', 内容: '使用第二人称', 启用: true, 类型: '写作视角' },
            { id: 'write_perspective_third', 内容: '使用第三人称', 启用: false, 类型: '写作视角' },
        ],
        memoryData: {
            即时记忆: [],
            短期记忆: [{ content: 'short mem 1' }, { content: 'short mem 2' }],
            中期记忆: ['mid mem 1'],
            长期记忆: ['long mem 1'],
            回忆档案: [],
        },
        socialData: [{ 姓名: '张三', 好感度: 50 }],
        statePayload: {
            角色: { 姓名: '李四', 气血: 100, 物品列表: [] },
            环境: { 大地点: '江南', 中地点: '苏州', 小地点: '留园', 具体地点: '正门' },
            世界: { 活跃NPC列表: [], 待执行事件: [], 进行中事件: [], 已结算事件: [] },
            战斗: { 是否战斗中: false },
            玩家门派: { 名称: '华山', 任务列表: [], 兑换列表: [], 重要成员: [] },
            任务列表: [],
            约定列表: [],
            剧情: { 当前章节: { 标题: '第一章' } },
            剧情规划: { 当前章目标: [], 当前章任务: [] },
        },
        gameConfig: {} as any,
        memoryConfig: { 即时消息上传条数N: 10, 短期记忆阈值: 30, 中期记忆阈值: 10, 长期记忆阈值: 5 },
        worldEvolutionEnabled: false,
        ...overrides,
    };
}

describe('构建系统提示词', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    describe('basic output', () => {
        it('returns expected structure', () => {
            const result = 构建系统提示词(makeParams());
            expect(typeof result.systemPrompt).toBe('string');
            expect(typeof result.shortMemoryContext).toBe('string');
            expect(typeof result.runtimePromptStates).toBe('object');
            expect(typeof result.contextPieces).toBe('object');
        });

        it('systemPrompt contains environment state', () => {
            const result = 构建系统提示词(makeParams());
            expect(result.systemPrompt).toContain('当前环境');
        });

        it('systemPrompt contains role state', () => {
            const result = 构建系统提示词(makeParams());
            expect(result.systemPrompt).toContain('用户角色数据');
        });

        it('systemPrompt contains world state', () => {
            const result = 构建系统提示词(makeParams());
            expect(result.systemPrompt).toContain('世界');
        });

        it('systemPrompt contains battle state', () => {
            const result = 构建系统提示词(makeParams());
            expect(result.systemPrompt).toContain('战斗');
        });

        it('systemPrompt contains sect state', () => {
            const result = 构建系统提示词(makeParams());
            expect(result.systemPrompt).toContain('玩家门派');
        });

        it('systemPrompt contains task state', () => {
            const result = 构建系统提示词(makeParams());
            expect(result.systemPrompt).toContain('任务列表');
        });

        it('systemPrompt contains agreement state', () => {
            const result = 构建系统提示词(makeParams());
            expect(result.systemPrompt).toContain('约定列表');
        });

        it('systemPrompt contains story arrangement', () => {
            const result = 构建系统提示词(makeParams());
            expect(result.systemPrompt).toContain('剧情安排');
        });

        it('systemPrompt contains NPC context', () => {
            const result = 构建系统提示词(makeParams());
            expect(result.systemPrompt).toContain('在场NPC');
        });

        it('runtimePromptStates tracks prompt activation', () => {
            const result = 构建系统提示词(makeParams());
            expect(result.runtimePromptStates['core_world']).toBeDefined();
            expect(result.runtimePromptStates['core_world'].当前启用).toBe(true);
        });
    });

    describe('memory handling', () => {
        it('includes short memory when not disabled', () => {
            const result = 构建系统提示词(makeParams());
            expect(result.shortMemoryContext).toContain('短期记忆');
        });

        it('excludes short memory when disabled', () => {
            const result = 构建系统提示词(makeParams({
                options: { 禁用短期记忆: true },
            }));
            expect(result.shortMemoryContext).toBe('');
        });

        it('excludes mid/long term memory when disabled', () => {
            const result = 构建系统提示词(makeParams({
                options: { 禁用中期长期记忆: true },
            }));
            expect(result.systemPrompt).not.toContain('长期记忆');
            expect(result.systemPrompt).not.toContain('中期记忆');
        });

        it('includes mid/long term memory by default', () => {
            const result = 构建系统提示词(makeParams());
            expect(result.contextPieces.长期记忆).toContain('长期记忆');
            expect(result.contextPieces.中期记忆).toContain('中期记忆');
        });
    });

    describe('NSFW mode', () => {
        it('includes NSFW card block when enabled', () => {
            const result = 构建系统提示词(makeParams({
                gameConfig: { 启用NSFW模式: true },
            }));
            expect(result.contextPieces.NSFW角色卡片).toBeTruthy();
            expect(result.systemPrompt).toContain('NSFW');
        });

        it('excludes NSFW card block when disabled', () => {
            const result = 构建系统提示词(makeParams());
            expect(result.contextPieces.NSFW角色卡片).toBe('');
        });
    });

    describe('protocol directives', () => {
        it('includes word count requirement', () => {
            const result = 构建系统提示词(makeParams());
            expect(result.contextPieces.字数要求提示词).toContain('500');
        });

        it('includes disclaimer when enabled', () => {
            const result = 构建系统提示词(makeParams({
                gameConfig: { 启用免责声明输出: true },
            }));
            expect(result.contextPieces.免责声明输出提示词).toBeTruthy();
        });

        it('excludes disclaimer when disabled', () => {
            const result = 构建系统提示词(makeParams());
            expect(result.contextPieces.免责声明输出提示词).toBe('');
        });

        it('includes action options when not disabled', () => {
            const result = 构建系统提示词(makeParams());
            expect(result.systemPrompt).toContain('行动选项');
        });

        it('excludes action options when disabled via options', () => {
            const result = 构建系统提示词(makeParams({
                options: { 禁用行动选项提示词: true },
            }));
            expect(result.systemPrompt).not.toContain('行动选项');
        });
    });

    describe('context pieces', () => {
        it('includes AI role declaration with player name', () => {
            const result = 构建系统提示词(makeParams());
            expect(result.contextPieces.AI角色声明).toContain('李四');
        });

        it('includes COT prompt when enabled', () => {
            const result = 构建系统提示词(makeParams());
            expect(result.contextPieces.COT提示词).toBeTruthy();
        });

        it('includes output protocol', () => {
            const result = 构建系统提示词(makeParams());
            expect(result.contextPieces.输出协议提示词).toBeTruthy();
        });
    });

    describe('perspective handling', () => {
        it('uses second person by default', () => {
            const result = 构建系统提示词(makeParams());
            expect(result.contextPieces.叙事人称提示词).toContain('第二人称');
        });

        it('uses first person when configured', () => {
            const result = 构建系统提示词(makeParams({
                gameConfig: { 叙事人称: '第一人称' },
            }));
            expect(result.contextPieces.叙事人称提示词).toContain('第一人称');
        });
    });

    describe('player name substitution', () => {
        it('substitutes playerName from statePayload', () => {
            const result = 构建系统提示词(makeParams());
            expect(result.contextPieces.AI角色声明).toContain('李四');
        });

        it('uses fallbackPlayerName when role name missing', () => {
            const result = 构建系统提示词(makeParams({
                statePayload: { 角色: {}, 环境: {}, 世界: {}, 战斗: {}, 玩家门派: {}, 任务列表: [], 约定列表: [] },
                fallbackPlayerName: 'FallbackName',
            }));
            expect(result.contextPieces.AI角色声明).toContain('FallbackName');
        });
    });

    describe('empty state handling', () => {
        it('handles empty social data', () => {
            const result = 构建系统提示词(makeParams({ socialData: [] }));
            expect(result.systemPrompt).toBeDefined();
        });

        it('handles empty memory arrays', () => {
            const result = 构建系统提示词(makeParams({
                memoryData: { 即时记忆: [], 短期记忆: [], 中期记忆: [], 长期记忆: [], 回忆档案: [] },
            }));
            expect(result.systemPrompt).toContain('暂无');
        });

        it('handles missing statePayload fields gracefully', () => {
            const result = 构建系统提示词(makeParams({
                statePayload: {},
            }));
            expect(result.systemPrompt).toBeDefined();
        });
    });

    describe('map and building state', () => {
        it('includes map and building section', () => {
            const result = 构建系统提示词(makeParams({
                statePayload: {
                    角色: { 姓名: '李四' },
                    环境: { 具体地点: '城门' },
                    世界: { 地图: [], 建筑: [] },
                    战斗: {},
                    玩家门派: {},
                    任务列表: [],
                    约定列表: [],
                    剧情: {},
                    剧情规划: {},
                },
            }));
            expect(result.contextPieces.地图建筑状态).toContain('地图与建筑');
        });

        it('shows no map data when maps empty', () => {
            const result = 构建系统提示词(makeParams({
                statePayload: {
                    角色: { 姓名: '李四' },
                    环境: { 具体地点: '城门' },
                    世界: { 地图: [], 建筑: [] },
                    战斗: {},
                    玩家门派: {},
                    任务列表: [],
                    约定列表: [],
                    剧情: {},
                    剧情规划: {},
                },
            }));
            expect(result.contextPieces.地图建筑状态).toContain('暂无地图数据');
        });
    });

    describe('li-mode and zhiguai', () => {
        it('includes li-wuxia prompt when enabled', () => {
            const result = 构建系统提示词(makeParams({
                gameConfig: { 启用里武侠模式: true },
            }));
            expect(result.contextPieces.otherPrompts).toContain('里武侠');
        });

        it('includes li-zhiguai prompt when enabled', () => {
            const result = 构建系统提示词(makeParams({
                gameConfig: { 启用里志怪模式: true },
            }));
            expect(result.contextPieces.otherPrompts).toContain('里志怪');
        });

        it('includes surface zhiguai when ancient system is zhiguai', () => {
            const result = 构建系统提示词(makeParams({
                gameConfig: { 古代体系选择: '志怪' },
            }));
            expect(result.contextPieces.otherPrompts).toContain('志怪');
        });

        it('skips surface zhiguai when li-zhiguai already enabled', () => {
            const result = 构建系统提示词(makeParams({
                gameConfig: { 古代体系选择: '志怪', 启用里志怪模式: true },
            }));
            const zhiguaiCount = (result.contextPieces.otherPrompts.match(/志怪/g) || []).length;
            expect(zhiguaiCount).toBeLessThanOrEqual(1);
        });
    });

    describe('heroine plan', () => {
        it('excludes heroine plan when disabled', () => {
            const result = 构建系统提示词(makeParams({
                gameConfig: { 启用女主剧情规划: false },
            }));
            expect(result.contextPieces.女主剧情规划状态).toBe('');
        });
    });

    describe('real world mode', () => {
        it('strips real mode audit from COT when real world mode disabled', () => {
            const result = 构建系统提示词(makeParams({
                gameConfig: { 启用真实世界模式: false },
            }));
            expect(result.contextPieces.COT提示词).not.toContain('真实模式');
        });
    });
});
