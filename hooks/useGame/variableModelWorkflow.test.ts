import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as textAIService from '../../services/ai/text';
import * as apiConfig from '../../utils/apiConfig';
import * as gameSettings from '../../utils/gameSettings';
import { 执行变量模型校准工作流 } from './variableModelWorkflow';

vi.mock('../../services/ai/text', () => ({
    generateVariableCalibrationUpdate: vi.fn(),
}));
vi.mock('../../utils/apiConfig', () => ({
    获取变量计算接口配置: vi.fn(),
    接口配置是否可用: vi.fn(),
    变量校准功能已启用: vi.fn(),
}));
vi.mock('../../utils/gameSettings', () => ({
    规范化游戏设置: vi.fn(),
}));
vi.mock('../../utils/stateHelpers', () => ({
    normalizeStateCommandKey: vi.fn((key: string) => key),
}));
vi.mock('../../utils/worldbook', () => ({
    构建世界书注入文本: vi.fn(() => ({ combinedText: '' })),
}));
vi.mock('../../prompts/runtime/nsfw', () => ({
    构建运行时额外提示词: vi.fn((text: string) => text),
}));
vi.mock('../../prompts/runtime/variableCalibrationReference', () => ({
    构建变量相关规则提示词: vi.fn(() => ''),
}));
vi.mock('../../prompts/runtime/fandom', () => ({
    构建同人运行时提示词包: vi.fn(() => ({ 同人设定摘要: '', 变量校准补丁: '', 境界母板补丁: '' })),
}));
vi.mock('../../utils/promptFeatureToggles', () => ({
    按功能开关过滤提示词内容: vi.fn((text: string) => text),
    裁剪修炼体系上下文数据: vi.fn((data: any) => data),
}));

const mockGenerateVariableCalibrationUpdate = vi.mocked(textAIService.generateVariableCalibrationUpdate);
const mock获取变量计算接口配置 = vi.mocked(apiConfig.获取变量计算接口配置);
const mock接口配置是否可用 = vi.mocked(apiConfig.接口配置是否可用);
const mock变量校准功能已启用 = vi.mocked(apiConfig.变量校准功能已启用);
const mock规范化游戏设置 = vi.mocked(gameSettings.规范化游戏设置);

function makeParams(overrides: any = {}) {
    return {
        playerInput: '玩家输入',
        parsedResponse: { tavern_commands: [] } as any,
        baseState: {
            角色: { 姓名: '李四' } as any,
            环境: { 当前地点: '长安' } as any,
            社交: [] as any[],
            战斗: {} as any,
            玩家门派: null as any,
            任务列表: [] as any[],
            约定列表: [] as any[],
        },
        promptPool: [],
        worldEvolutionEnabled: true,
        ...overrides,
    };
}

function makeDeps(overrides: any = {}) {
    return {
        apiConfig: {} as any,
        gameConfig: { 剧情风格: '写实' } as any,
        ...overrides,
    };
}

beforeEach(() => {
    vi.resetAllMocks();
    mock变量校准功能已启用.mockReturnValue(true);
    mock获取变量计算接口配置.mockReturnValue({ model: 'gpt-4o', apiKey: 'key', baseUrl: 'url' } as any);
    mock接口配置是否可用.mockReturnValue(true);
    mock规范化游戏设置.mockReturnValue({ 剧情风格: '写实' } as any);
});

describe('执行变量模型校准工作流', () => {
    it('returns null when calibration feature disabled', async () => {
        mock变量校准功能已启用.mockReturnValue(false);
        const result = await 执行变量模型校准工作流(makeParams(), makeDeps());
        expect(result).toBeNull();
    });

    it('returns null when API config unavailable', async () => {
        mock获取变量计算接口配置.mockReturnValue(undefined as any);
        mock接口配置是否可用.mockReturnValue(false);
        const result = await 执行变量模型校准工作流(makeParams(), makeDeps());
        expect(result).toBeNull();
    });

    it('returns calibration result with commands', async () => {
        mockGenerateVariableCalibrationUpdate.mockResolvedValue({
            commands: [
                { action: 'set', key: 'gameState.角色.气血', value: 100 },
                { action: 'push', key: 'gameState.社交', value: { 姓名: '王五' } },
            ],
            reports: ['角色气血已更新'],
            rawText: 'calibration raw text',
        } as any);
        const result = await 执行变量模型校准工作流(makeParams(), makeDeps());
        expect(result).not.toBeNull();
        expect(result!.commands).toHaveLength(2);
        expect(result!.commands[0].action).toBe('set');
        expect(result!.reports).toHaveLength(1);
        expect(result!.model).toBe('gpt-4o');
    });

    it('returns null when no commands and no reports', async () => {
        mockGenerateVariableCalibrationUpdate.mockResolvedValue({
            commands: [],
            reports: [],
            rawText: '',
        } as any);
        const result = await 执行变量模型校准工作流(makeParams(), makeDeps());
        expect(result).toBeNull();
    });

    it('deduplicates commands against existing tavern_commands', async () => {
        mockGenerateVariableCalibrationUpdate.mockResolvedValue({
            commands: [{ action: 'set', key: 'gameState.角色.气血', value: 100 }],
            reports: [],
            rawText: '',
        } as any);
        const params = makeParams({
            parsedResponse: {
                tavern_commands: [
                    { action: 'set', key: 'gameState.角色.气血', value: 100 },
                ],
            },
        });
        const result = await 执行变量模型校准工作流(params, makeDeps());
        // All deduped, no reports → returns null
        expect(result).toBeNull();
    });

    it('keeps non-duplicate commands', async () => {
        mockGenerateVariableCalibrationUpdate.mockResolvedValue({
            commands: [
                { action: 'set', key: 'gameState.角色.气血', value: 100 },
                { action: 'set', key: 'gameState.角色.内力', value: 50 },
            ],
            reports: [],
            rawText: '',
        } as any);
        const params = makeParams({
            parsedResponse: {
                tavern_commands: [
                    { action: 'set', key: 'gameState.角色.气血', value: 100 },
                ],
            },
        });
        const result = await 执行变量模型校准工作流(params, makeDeps());
        expect(result!.commands).toHaveLength(1);
        expect(result!.commands[0].key).toBe('gameState.角色.内力');
    });

    it('filters out commands with invalid keys', async () => {
        mockGenerateVariableCalibrationUpdate.mockResolvedValue({
            commands: [
                { action: 'set', key: 'invalid.key', value: 100 },
                { action: 'set', key: 'gameState.角色.姓名', value: '张三' },
            ],
            reports: [],
            rawText: '',
        } as any);
        const result = await 执行变量模型校准工作流(makeParams(), makeDeps());
        expect(result!.commands).toHaveLength(1);
        expect(result!.commands[0].key).toBe('gameState.角色.姓名');
    });

    it('filters out commands with illegal pseudo-indexes', async () => {
        mockGenerateVariableCalibrationUpdate.mockResolvedValue({
            commands: [
                { action: 'set', key: 'gameState.社交[-1]', value: {} },
                { action: 'set', key: 'gameState.社交[last]', value: {} },
                { action: 'set', key: 'gameState.角色.姓名', value: '张三' },
            ],
            reports: [],
            rawText: '',
        } as any);
        const result = await 执行变量模型校准工作流(makeParams(), makeDeps());
        expect(result!.commands).toHaveLength(1);
        expect(result!.commands[0].key).toBe('gameState.角色.姓名');
    });

    it('includes reports only when commands are empty', async () => {
        mockGenerateVariableCalibrationUpdate.mockResolvedValue({
            commands: [],
            reports: ['NPC档案需要更新'],
            rawText: '',
        } as any);
        const result = await 执行变量模型校准工作流(makeParams(), makeDeps());
        expect(result).not.toBeNull();
        expect(result!.commands).toHaveLength(0);
        expect(result!.reports).toHaveLength(1);
        expect(result!.reports[0]).toBe('NPC档案需要更新');
    });

    it('strips empty reports', async () => {
        mockGenerateVariableCalibrationUpdate.mockResolvedValue({
            commands: [],
            reports: ['', '  valid report  ', '   '],
            rawText: '',
        } as any);
        const result = await 执行变量模型校准工作流(makeParams(), makeDeps());
        expect(result!.reports).toEqual(['valid report']);
    });

    it('serializes state for calibration API', async () => {
        mockGenerateVariableCalibrationUpdate.mockResolvedValue({
            commands: [],
            reports: ['test'],
            rawText: '',
        } as any);
        await 执行变量模型校准工作流(makeParams(), makeDeps());
        const [calibrationParams] = mockGenerateVariableCalibrationUpdate.mock.calls[0];
        expect(calibrationParams.stateJson).toContain('"角色"');
        expect(calibrationParams.stateJson).toContain('"李四"');
    });
});
