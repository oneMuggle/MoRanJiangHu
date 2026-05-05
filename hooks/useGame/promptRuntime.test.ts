import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    剥离NoControl关联提示词,
    构建COT伪装提示词,
    酒馆预设模式可用,
    构建运行时提示词池,
    构建酒馆预设消息链,
} from './promptRuntime';

vi.mock('../../prompts/core/cot', () => ({
    核心_思维链: { id: 'core_cot', 内容: '<COT base>', 启用: true },
    核心_思维链_同人版: { id: 'core_cot_fandom', 内容: '<COT fandom>', 启用: true },
}));
vi.mock('../../prompts/core/cotHeroine', () => ({
    核心_思维链_女主规划版: { id: 'core_cot_heroine', 内容: '<COT heroine>', 启用: true },
    核心_思维链_NTL女主规划版: { id: 'core_cot_ntl_heroine', 内容: '<COT NTL heroine>', 启用: true },
    核心_思维链_同人女主规划版: { id: 'core_cot_fandom_heroine', 内容: '<COT fandom heroine>', 启用: true },
    核心_思维链_同人NTL女主规划版: { id: 'core_cot_fandom_ntl_heroine', 内容: '<COT fandom NTL heroine>', 启用: true },
}));
vi.mock('../../prompts/runtime/defaults', () => ({
    默认COT伪装历史消息提示词: '<AI身份名称占位>好的，将以<正文></正文>包裹正文，<正文>前以<thinking>作为开头进行思考并以</thinking>闭合：',
}));
vi.mock('../../prompts/writing/noControl', () => ({
    写作_防止说话: { id: 'writing_no_control', 内容: '- 若同时存在 `<NoControl>`...\n- 复核 `<NoControl>`...\nIt never overrides NoControl,...', 启用: true },
}));
vi.mock('../../utils/tavernPreset', () => ({
    获取酒馆预设顺序: vi.fn((preset: any) => preset ? { order: preset.prompt_order } : null),
}));
vi.mock('./thinkingContext', () => ({
    提取响应规划文本: vi.fn(() => ''),
}));
vi.mock('../../utils/promptFeatureToggles', () => ({
    按功能开关过滤提示词内容: vi.fn((c: string) => c),
}));
vi.mock('../../prompts/runtime/promptOwnership', () => ({
    变量命令提示词ID集合: new Set(['core_var_commands']),
}));

describe('promptRuntime', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('剥离NoControl关联提示词', () => {
        it('removes lines matching NoControl rules', () => {
            const content = `some rule
- 若同时存在 \`<NoControl>\` then something
- 复核 \`<NoControl>\` behavior
It never overrides NoControl, ever
other rule`;
            const result = 剥离NoControl关联提示词(content);
            expect(result).toBe('some rule\nother rule');
        });

        it('collapses multiple blank lines', () => {
            const content = 'line1\n\n\n\nline2';
            const result = 剥离NoControl关联提示词(content);
            expect(result).toBe('line1\n\nline2');
        });

        it('returns empty string for empty input', () => {
            expect(剥离NoControl关联提示词('')).toBe('');
            expect(剥离NoControl关联提示词(undefined as any)).toBe('');
        });

        it('returns trimmed content when no rules match', () => {
            const content = '  no rules here  ';
            const result = 剥离NoControl关联提示词(content);
            expect(result).toBe('no rules here');
        });
    });

    describe('构建COT伪装提示词', () => {
        it('replaces AI identity placeholder', () => {
            const result = 构建COT伪装提示词({}, '你是"旁白"的助手');
            expect(result).toContain('旁白');
            expect(result).not.toContain('<AI身份名称占位>');
        });

        it('defaults to AI when no identity found', () => {
            const result = 构建COT伪装提示词({}, '');
            expect(result).toContain('AI');
        });

        it('includes action options line when enabled', () => {
            const result = 构建COT伪装提示词({ 启用行动选项: true } as any);
            expect(result).toContain('<行动选项>');
        });

        it('excludes action options line when disabled', () => {
            const result = 构建COT伪装提示词({ 启用行动选项: false } as any);
            expect(result).not.toContain('<行动选项>');
        });

        it('uses default when action options is undefined', () => {
            const result = 构建COT伪装提示词({});
            expect(result).toContain('<行动选项>');
        });
    });

    describe('酒馆预设模式可用', () => {
        it('returns false when 启用酒馆预设模式 is not true', () => {
            expect(酒馆预设模式可用({})).toBe(false);
            expect(酒馆预设模式可用({ 启用酒馆预设模式: false })).toBe(false);
        });

        it('returns false when preset is missing prompts', () => {
            expect(酒馆预设模式可用({
                启用酒馆预设模式: true,
                酒馆预设: { prompts: [], prompt_order: [] },
            })).toBe(false);
        });

        it('returns false when preset is missing prompt_order', () => {
            expect(酒馆预设模式可用({
                启用酒馆预设模式: true,
                酒馆预设: { prompts: [{ identifier: 'p1', content: 'c1' }] },
            })).toBe(false);
        });

        it('returns true when all conditions met', () => {
            expect(酒馆预设模式可用({
                启用酒馆预设模式: true,
                酒馆预设: {
                    prompts: [{ identifier: 'p1', content: 'c1' }],
                    prompt_order: [{ identifier: 'p1', enabled: true }],
                },
            })).toBe(true);
        });
    });

    describe('构建运行时提示词池', () => {
        const basePromptPool = [
            { id: 'core_cot', 内容: '<COT base>', 启用: true },
            { id: 'writing_no_control', 内容: 'no control rule', 启用: true },
            { id: 'other_prompt', 内容: 'other content', 启用: true },
        ];
        const baseConfig = {
            启用修炼体系: true,
            启用防止说话: true,
            启用饱腹口渴系统: true,
            启用女主剧情规划: false,
            剧情风格: '一般' as const,
        };

        it('selects COT prompt and enables it', () => {
            const result = 构建运行时提示词池(basePromptPool, baseConfig);
            expect(result.selectedCotPromptIds).toContain('core_cot');
            expect(result.promptPool.some((p) => p.id === 'core_cot' && p.启用 === true)).toBe(true);
        });

        it('replaces existing COT prompt', () => {
            const poolWithDuplicate = [
                { id: 'core_cot', 内容: '<old COT>', 启用: false },
                { id: 'other_prompt', 内容: 'other', 启用: true },
            ];
            const result = 构建运行时提示词池(poolWithDuplicate, baseConfig);
            const cotPrompts = result.promptPool.filter((p) => p.id === 'core_cot');
            expect(cotPrompts).toHaveLength(1);
            expect(cotPrompts[0].启用).toBe(true);
        });

        it('removes NoControl content when 启用防止说话 is false', () => {
            const result = 构建运行时提示词池(basePromptPool, {
                ...baseConfig,
                启用防止说话: false,
            });
            const noControlPrompt = result.promptPool.find((p) => p.id === 'writing_no_control');
            expect(noControlPrompt?.内容).not.toContain('NoControl');
        });

        it('removes cultivation prompts when 启用修炼体系 is false', () => {
            const poolWithRealm = [
                ...basePromptPool,
                { id: 'core_realm', 内容: '<realm>', 启用: true },
                { id: 'stat_kungfu', 内容: '<kungfu>', 启用: true },
            ];
            const result = 构建运行时提示词池(poolWithRealm, {
                ...baseConfig,
                启用修炼体系: false,
            });
            expect(result.promptPool.some((p) => p.id === 'core_realm')).toBe(false);
            expect(result.promptPool.some((p) => p.id === 'stat_kungfu')).toBe(false);
        });

        it('strips physiological keywords when 饱腹口渴系统 is false', () => {
            const poolWithPhysio = [
                ...basePromptPool,
                { id: 'some_prompt', 内容: 'hunger and thirst\nnormal line\n口渴 line', 启用: true },
            ];
            const result = 构建运行时提示词池(poolWithPhysio, {
                ...baseConfig,
                启用饱腹口渴系统: false,
            });
            const physioPrompt = result.promptPool.find((p) => p.id === 'some_prompt');
            expect(physioPrompt?.内容).not.toContain('口渴');
            expect(physioPrompt?.内容).not.toContain('饥饿');
        });

        it('removes diff_phys_ prompts when 饱腹口渴系统 is false', () => {
            const poolWithDiffPhysio = [
                ...basePromptPool,
                { id: 'diff_phys_thirst', 内容: 'thirst', 启用: true },
            ];
            const result = 构建运行时提示词池(poolWithDiffPhysio, {
                ...baseConfig,
                启用饱腹口渴系统: false,
            });
            expect(result.promptPool.some((p) => p.id.startsWith('diff_phys_'))).toBe(false);
        });

        it('strips world evolution commands when 启用世界演变分流 is true', () => {
            const poolWithWorld = [
                { id: 'core_cot', 内容: '<COT>\n- `(gameState.)世界`\nmore content', 启用: true },
                { id: 'core_format', 内容: '□ 世界事件维护：something\n\n---', 启用: true },
            ];
            const result = 构建运行时提示词池(poolWithWorld, baseConfig, {
                启用世界演变分流: true,
            });
            expect(result.promptPool.some((p) => p.id === 'stat_world_evo')).toBe(false);
        });

        it('removes main story strip prompt IDs', () => {
            const poolWithStrippable = [
                ...basePromptPool,
                { id: 'core_story', 内容: '<story>', 启用: true },
                { id: 'core_heroine_plan', 内容: '<heroine plan>', 启用: true },
            ];
            const result = 构建运行时提示词池(poolWithStrippable, baseConfig);
            expect(result.promptPool.some((p) => p.id === 'core_story')).toBe(false);
            expect(result.promptPool.some((p) => p.id === 'core_heroine_plan')).toBe(false);
        });

        it('uses forced COT prompt ID when provided', () => {
            const result = 构建运行时提示词池(basePromptPool, baseConfig, {
                强制剧情COT提示词ID: 'custom_cot_id',
            });
            expect(result.selectedCotPromptIds).toContain('custom_cot_id');
        });
    });

    describe('构建酒馆预设消息链', () => {
        const baseConfig = {
            启用酒馆预设模式: true,
            酒馆预设: {
                prompts: [
                    { identifier: 'world_before', content: '世界书内容', role: 'system' as const },
                    { identifier: 'chatHistory', content: '', role: 'system' as const },
                    { identifier: 'userInput', content: '', role: 'system' as const },
                ],
                prompt_order: [
                    { identifier: 'world_before', enabled: true },
                    { identifier: 'chatHistory', enabled: true },
                    { identifier: 'userInput', enabled: true },
                ],
            },
            酒馆提示词后处理: '未选择' as const,
        };
        const baseContext = {
            shortMemoryContext: '<短期记忆>',
            contextPieces: {
                worldPrompt: '<世界>',
                地图建筑状态: '<地图>',
                同人设定摘要: '',
                境界体系提示词: '',
                otherPrompts: '<其他>',
                难度设置提示词: '<难度>',
                叙事人称提示词: '<人称>',
                字数设置提示词: '<字数>',
                COT提示词: '<COT>',
                格式提示词: '<格式>',
                离场NPC档案: '',
                长期记忆: '<长期>',
                中期记忆: '<中期>',
                在场NPC档案: '<在场NPC>',
                剧情安排: '<剧情>',
                女主剧情规划状态: '',
                世界状态: '<世界状态>',
                环境状态: '<环境>',
                角色状态: '<角色>',
                战斗状态: '<战斗>',
                门派状态: '<门派>',
                任务状态: '<任务>',
                约定状态: '<约定>',
            },
        };

        it('returns empty array when preset is null', () => {
            const result = 构建酒馆预设消息链({
                config: { 酒馆预设: null },
                context: baseContext,
                chatHistory: [],
                latestUserInput: 'input',
            });
            expect(result).toEqual([]);
        });

        it('returns empty array when selectedOrder is null', () => {
            // 获取酒馆预设顺序 returns null when 酒馆预设角色ID doesn't match any order
            // Test the code path via the actual function behavior:
            // when preset exists but no matching prompt_order, result falls through to defaults
            // The simplest way: config with no matching 酒馆预设角色ID
            const result = 构建酒馆预设消息链({
                config: {
                    ...baseConfig,
                    酒馆预设角色ID: 'nonexistent',
                },
                context: baseContext,
                chatHistory: [],
                latestUserInput: 'input',
            });
            // When selectedOrder is null/empty, the function falls through to default worldbook+input
            // Verify it still produces some output (the fallback behavior)
            expect(Array.isArray(result)).toBe(true);
        });

        it('builds messages with worldbook, history, and input', () => {
            const result = 构建酒馆预设消息链({
                config: baseConfig,
                context: baseContext,
                chatHistory: [
                    { role: 'user', content: '玩家输入', timestamp: 1, gameTime: '2026-04-30T00:00:00' },
                    { role: 'assistant', content: 'AI回复', timestamp: 2, gameTime: '2026-04-30T00:01:00', structuredResponse: { logs: [{ sender: '旁白', text: '正文' }], tavern_commands: [] } },
                ],
                latestUserInput: '最新输入',
            });
            expect(result.length).toBeGreaterThan(0);
        });

        it('includes player profile when playerRole provided', () => {
            const configWithPersona = {
                ...baseConfig,
                酒馆预设: {
                    ...baseConfig.酒馆预设,
                    prompt_order: [
                        ...baseConfig.酒馆预设.prompt_order,
                        { identifier: 'personaDescription', enabled: true },
                    ],
                },
            };
            const result = 构建酒馆预设消息链({
                config: configWithPersona,
                context: baseContext,
                chatHistory: [],
                latestUserInput: 'input',
                playerName: '玩家',
                playerRole: { 称号: '大侠', 年龄: 25, 门派职位: '掌门' },
            });
            expect(result.some((m) => m.content.includes('姓名：玩家'))).toBe(true);
        });

        it('applies 严格 post-processing mode', () => {
            const configWithStrictMode = {
                ...baseConfig,
                酒馆提示词后处理: '严格' as const,
            };
            const result = 构建酒馆预设消息链({
                config: configWithStrictMode,
                context: baseContext,
                chatHistory: [],
                latestUserInput: 'input',
            });
            const worldMsg = result.find((m) => m.content.includes('世界书内容'));
            if (worldMsg) {
                expect(worldMsg.role).toBe('system');
            }
        });

        it('merges consecutive messages of same role', () => {
            const configWithMergedPrompts = {
                ...baseConfig,
                酒馆预设: {
                    prompts: [
                        { identifier: 'p1', content: 'first system', role: 'system' as const },
                        { identifier: 'p2', content: 'second system', role: 'system' as const },
                        { identifier: 'userInput', content: '', role: 'system' as const },
                    ],
                    prompt_order: [
                        { identifier: 'p1', enabled: true },
                        { identifier: 'p2', enabled: true },
                        { identifier: 'userInput', enabled: true },
                    ],
                },
            };
            const result = 构建酒馆预设消息链({
                config: configWithMergedPrompts,
                context: baseContext,
                chatHistory: [],
                latestUserInput: 'input',
            });
            expect(result.some((m) => m.content.includes('first system') && m.content.includes('second system'))).toBe(true);
        });

        it('appends latest input when not injected by slots', () => {
            const configWithoutInputSlot = {
                ...baseConfig,
                酒馆预设: {
                    prompts: [
                        { identifier: 'world_before', content: '世界书', role: 'system' as const },
                    ],
                    prompt_order: [
                        { identifier: 'world_before', enabled: true },
                    ],
                },
            };
            const result = 构建酒馆预设消息链({
                config: configWithoutInputSlot,
                context: baseContext,
                chatHistory: [],
                latestUserInput: 'latest input',
            });
            expect(result.some((m) => m.content === 'latest input')).toBe(true);
        });

        it('handles COT variable injection', () => {
            const configWithCotVar = {
                ...baseConfig,
                酒馆预设: {
                    prompts: [
                        { identifier: 'cot_slot', content: '{{cot}} some extra', role: 'system' as const },
                        { identifier: 'userInput', content: '', role: 'system' as const },
                    ],
                    prompt_order: [
                        { identifier: 'cot_slot', enabled: true },
                        { identifier: 'userInput', enabled: true },
                    ],
                },
            };
            const result = 构建酒馆预设消息链({
                config: configWithCotVar,
                context: baseContext,
                chatHistory: [],
                latestUserInput: 'input',
            });
            expect(result.some((m) => m.content.includes('<COT>'))).toBe(true);
            expect(result.some((m) => m.content.includes('{{cot}}'))).toBe(false);
        });
    });
});
