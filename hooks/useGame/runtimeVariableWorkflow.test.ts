import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 创建运行时变量工作流 } from './runtimeVariableWorkflow';
import * as stateHelpers from '../../utils/stateHelpers';

vi.mock('../../utils/stateHelpers', () => ({
    normalizeStateCommandKey: vi.fn((k: string) => k),
    applyStateCommand: vi.fn((char: any, env: any, social: any, world: any, battle: any, story: any, storyPlan: any, heroinePlan: any, fandomStoryPlan: any, fandomHeroinePlan: any, sect: any, tasks: any, agreements: any) => ({
        char: char || {}, env: env || {}, social: social || [], world: world || {},
        battle: battle || {}, story: story || {}, storyPlan: storyPlan || {},
        heroinePlan: heroinePlan || {}, fandomStoryPlan: fandomStoryPlan || {},
        fandomHeroinePlan: fandomHeroinePlan || {}, sect: sect || {},
        tasks: tasks || [], agreements: agreements || [],
    })),
}));
vi.mock('../../services/novel-decomposition/novelDecompositionCalibration', () => ({
    同步剧情小说分解时间校准: vi.fn((p: any) => Promise.resolve(p.nextStory || {})),
}));

const mockNormalizeStateCommandKey = vi.mocked(stateHelpers.normalizeStateCommandKey);
const mockApplyStateCommand = vi.mocked(stateHelpers.applyStateCommand);

function makeDeps(overrides: any = {}) {
    return {
        获取历史记录: vi.fn(() => [{ role: 'user', content: 'input', timestamp: 1 }]),
        深拷贝: <T>(v: T): T => (v === undefined ? undefined as T : JSON.parse(JSON.stringify(v))),
        获取当前状态: vi.fn(() => ({
            角色: { 姓名: '李四' },
            环境: { 年: 2026, 月: 4, 日: 30 },
            社交: [],
            世界: { 事件: [] },
            战斗: {},
            剧情: {},
            剧情规划: {},
            女主剧情规划: {},
            同人剧情规划: {},
            同人女主剧情规划: {},
            玩家门派: {},
            任务列表: [],
            约定列表: [],
            记忆系统: { 即时记忆: [], 短期记忆: [], 中期记忆: [], 长期记忆: [], 回忆档案: [] },
        })),
        规范化角色物品容器映射: vi.fn((v: any) => v || {}),
        规范化环境信息: vi.fn((v: any) => v || {}),
        规范化社交列表: vi.fn((v: any[]) => v || []),
        规范化世界状态: vi.fn((v: any) => v || {}),
        规范化战斗状态: vi.fn((v: any) => v || {}),
        规范化剧情状态: vi.fn((v: any) => v || {}),
        规范化剧情规划状态: vi.fn((v: any) => v || {}),
        规范化女主剧情规划状态: vi.fn((v: any) => v || {}),
        规范化同人剧情规划状态: vi.fn((v: any) => v || {}),
        规范化同人女主剧情规划状态: vi.fn((v: any) => v || {}),
        规范化门派状态: vi.fn((v: any) => v || {}),
        规范化记忆系统: vi.fn((v: any) => ({ 即时记忆: [], 短期记忆: [], 中期记忆: [], 长期记忆: [], 回忆档案: [], ...v })),
        环境时间转标准串: vi.fn(() => '2026-04-30T00:00:00'),
        获取开局配置: vi.fn(() => null),
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
        应用并同步记忆系统: vi.fn(),
        performAutoSave: vi.fn(() => Promise.resolve()),
        ...overrides,
    };
}

describe('创建运行时变量工作流', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('updateRuntimeVariableSection', () => {
        it('updates character section', async () => {
            const deps = makeDeps();
            const { updateRuntimeVariableSection } = 创建运行时变量工作流(deps);
            await updateRuntimeVariableSection('角色', { 姓名: '张三' });
            expect(deps.设置角色).toHaveBeenCalled();
            expect(deps.performAutoSave).toHaveBeenCalled();
        });

        it('updates environment section', async () => {
            const deps = makeDeps();
            const { updateRuntimeVariableSection } = 创建运行时变量工作流(deps);
            await updateRuntimeVariableSection('环境', { 年: 2027 });
            expect(deps.设置环境).toHaveBeenCalled();
        });

        it('updates social section', async () => {
            const deps = makeDeps();
            const { updateRuntimeVariableSection } = 创建运行时变量工作流(deps);
            await updateRuntimeVariableSection('社交', [{ 姓名: 'NPC1' }]);
            expect(deps.设置社交).toHaveBeenCalled();
        });

        it('updates world section', async () => {
            const deps = makeDeps();
            const { updateRuntimeVariableSection } = 创建运行时变量工作流(deps);
            await updateRuntimeVariableSection('世界', { 事件: ['新事件'] });
            expect(deps.设置世界).toHaveBeenCalled();
        });

        it('updates battle section', async () => {
            const deps = makeDeps();
            const { updateRuntimeVariableSection } = 创建运行时变量工作流(deps);
            await updateRuntimeVariableSection('战斗', { 进行中: true });
            expect(deps.设置战斗).toHaveBeenCalled();
        });

        it('updates story section with time calibration', async () => {
            const deps = makeDeps();
            const { updateRuntimeVariableSection } = 创建运行时变量工作流(deps);
            await updateRuntimeVariableSection('剧情', { 主线任务: '新任务' });
            expect(deps.设置剧情).toHaveBeenCalled();
        });

        it('updates story plan section', async () => {
            const deps = makeDeps();
            const { updateRuntimeVariableSection } = 创建运行时变量工作流(deps);
            await updateRuntimeVariableSection('剧情规划', { 规划: '新规划' });
            expect(deps.设置剧情规划).toHaveBeenCalled();
        });

        it('updates heroine plan section', async () => {
            const deps = makeDeps();
            const { updateRuntimeVariableSection } = 创建运行时变量工作流(deps);
            await updateRuntimeVariableSection('女主剧情规划', { 规划: '女主规划' });
            expect(deps.设置女主剧情规划).toHaveBeenCalled();
        });

        it('updates fandom story plan section', async () => {
            const deps = makeDeps();
            const { updateRuntimeVariableSection } = 创建运行时变量工作流(deps);
            await updateRuntimeVariableSection('同人剧情规划', { 规划: '同人规划' });
            expect(deps.设置同人剧情规划).toHaveBeenCalled();
        });

        it('updates fandom heroine plan section', async () => {
            const deps = makeDeps();
            const { updateRuntimeVariableSection } = 创建运行时变量工作流(deps);
            await updateRuntimeVariableSection('同人女主剧情规划', { 规划: '同人女主规划' });
            expect(deps.设置同人女主剧情规划).toHaveBeenCalled();
        });

        it('updates sect section', async () => {
            const deps = makeDeps();
            const { updateRuntimeVariableSection } = 创建运行时变量工作流(deps);
            await updateRuntimeVariableSection('玩家门派', { 名称: '少林' });
            expect(deps.设置玩家门派).toHaveBeenCalled();
        });

        it('updates tasks section', async () => {
            const deps = makeDeps();
            const { updateRuntimeVariableSection } = 创建运行时变量工作流(deps);
            await updateRuntimeVariableSection('任务列表', [{ 名称: '新任务' }]);
            expect(deps.设置任务列表).toHaveBeenCalled();
        });

        it('updates agreements section', async () => {
            const deps = makeDeps();
            const { updateRuntimeVariableSection } = 创建运行时变量工作流(deps);
            await updateRuntimeVariableSection('约定列表', [{ 内容: '新约定' }]);
            expect(deps.设置约定列表).toHaveBeenCalled();
        });

        it('updates memory system section', async () => {
            const deps = makeDeps();
            const { updateRuntimeVariableSection } = 创建运行时变量工作流(deps);
            await updateRuntimeVariableSection('记忆系统', { 短期记忆: ['新记忆'] });
            expect(deps.应用并同步记忆系统).toHaveBeenCalled();
        });

        it('uses default empty value when section value is null', async () => {
            const deps = makeDeps();
            const { updateRuntimeVariableSection } = 创建运行时变量工作流(deps);
            await updateRuntimeVariableSection('角色', null);
            expect(deps.设置角色).toHaveBeenCalled();
        });
    });

    describe('applyRuntimeVariableCommand', () => {
        it('handles memory system command', async () => {
            const deps = makeDeps();
            mockNormalizeStateCommandKey.mockReturnValue('记忆系统.短期记忆');
            const { applyRuntimeVariableCommand } = 创建运行时变量工作流(deps);
            await applyRuntimeVariableCommand({ action: 'set', key: '记忆系统.短期记忆', value: ['新记忆'] });
            expect(deps.应用并同步记忆系统).toHaveBeenCalled();
        });

        it('handles memory command with gameState prefix', async () => {
            const deps = makeDeps();
            mockNormalizeStateCommandKey.mockReturnValue('记忆系统.即时记忆');
            const { applyRuntimeVariableCommand } = 创建运行时变量工作流(deps);
            await applyRuntimeVariableCommand({ action: 'set', key: 'gameState.记忆系统.即时记忆', value: ['即时'] });
            expect(deps.应用并同步记忆系统).toHaveBeenCalled();
        });

        it('handles non-memory command via applyStateCommand', async () => {
            const deps = makeDeps();
            mockNormalizeStateCommandKey.mockReturnValue('世界.事件');
            const { applyRuntimeVariableCommand } = 创建运行时变量工作流(deps);
            await applyRuntimeVariableCommand({ action: 'set', key: '世界.事件', value: ['事件1'] });
            expect(mockApplyStateCommand).toHaveBeenCalled();
            expect(deps.设置世界).toHaveBeenCalled();
        });
    });

    describe('removeTask', () => {
        it('does nothing for negative index', () => {
            const deps = makeDeps();
            const { removeTask } = 创建运行时变量工作流(deps);
            removeTask(-1);
            expect(deps.设置任务列表).not.toHaveBeenCalled();
        });

        it('does nothing for non-integer index', () => {
            const deps = makeDeps();
            const { removeTask } = 创建运行时变量工作流(deps);
            removeTask(1.5);
            expect(deps.设置任务列表).not.toHaveBeenCalled();
        });

        it('removes task at valid index', () => {
            const deps = makeDeps({
                设置任务列表: vi.fn((fn: any) => {
                    const prev = [{ 名称: '任务1' }, { 名称: '任务2' }];
                    const result = fn(prev);
                    expect(result.length).toBe(1);
                }),
            });
            const { removeTask } = 创建运行时变量工作流(deps);
            removeTask(0);
        });
    });

    describe('removeAgreement', () => {
        it('does nothing for negative index', () => {
            const deps = makeDeps();
            const { removeAgreement } = 创建运行时变量工作流(deps);
            removeAgreement(-1);
            expect(deps.设置约定列表).not.toHaveBeenCalled();
        });

        it('removes agreement at valid index', () => {
            const deps = makeDeps({
                设置约定列表: vi.fn((fn: any) => {
                    const prev = [{ 内容: '约定1' }, { 内容: '约定2' }];
                    const result = fn(prev);
                    expect(result.length).toBe(1);
                }),
            });
            const { removeAgreement } = 创建运行时变量工作流(deps);
            removeAgreement(1);
        });
    });

    describe('嵌套路径操作', () => {
        it('handles nested path with push action', async () => {
            const deps = makeDeps();
            mockNormalizeStateCommandKey.mockReturnValue('记忆系统.短期记忆');
            const { applyRuntimeVariableCommand } = 创建运行时变量工作流(deps);
            await applyRuntimeVariableCommand({ action: 'push', key: '记忆系统.短期记忆', value: '新条目' });
            expect(deps.应用并同步记忆系统).toHaveBeenCalled();
        });

        it('handles nested path with add action on number', async () => {
            const deps = makeDeps();
            mockNormalizeStateCommandKey.mockReturnValue('记忆系统.计数');
            const { applyRuntimeVariableCommand } = 创建运行时变量工作流(deps);
            await applyRuntimeVariableCommand({ action: 'add', key: '记忆系统.计数', value: 5 });
            expect(deps.应用并同步记忆系统).toHaveBeenCalled();
        });

        it('handles delete action on nested path', async () => {
            const deps = makeDeps();
            mockNormalizeStateCommandKey.mockReturnValue('记忆系统.即时记忆');
            const { applyRuntimeVariableCommand } = 创建运行时变量工作流(deps);
            await applyRuntimeVariableCommand({ action: 'delete', key: '记忆系统.即时记忆', value: null });
            expect(deps.应用并同步记忆系统).toHaveBeenCalled();
        });
    });
});
