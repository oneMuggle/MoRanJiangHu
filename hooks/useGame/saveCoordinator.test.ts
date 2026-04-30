import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as dbService from '../../services/dbService';
import { 创建存档数据, 执行手动存档, 执行自动存档, 执行读取存档 } from './saveCoordinator';

vi.mock('../../services/dbService', () => ({
    保存存档: vi.fn(),
    保存设置: vi.fn(),
}));
vi.mock('../../prompts/core/world', () => ({
    核心_世界观: { id: 'core_world', 内容: 'world view' },
}));
vi.mock('../../prompts/core/realm', () => ({
    核心_境界体系: { id: 'core_realm', 内容: 'realm system' },
}));
vi.mock('../../utils/settingsSchema', () => ({
    设置键: { 提示词池: 'prompt_pool' },
}));

const mock保存存档 = vi.mocked(dbService.保存存档);
const mock保存设置 = vi.mocked(dbService.保存设置);

function makeCurrentState(overrides: any = {}) {
    return {
        历史记录: [{ role: 'user' as const, content: 'hello' }],
        角色: { 姓名: '李四', 物品栏: [] } as any,
        环境: { 当前地点: '长安', 当前时辰: { 年: 2026, 月: 4, 日: 30 } } as any,
        社交: [],
        世界: { 世界种子: 'seed' } as any,
        战斗: {} as any,
        玩家门派: { 门派名称: '华山' } as any,
        任务列表: [],
        约定列表: [],
        剧情: { 当前章节: null } as any,
        剧情规划: {} as any,
        女主剧情规划: undefined,
        同人剧情规划: undefined,
        同人女主剧情规划: undefined,
        记忆系统: { 即时记忆: [], 短期记忆: [], 中期记忆: [], 长期记忆: [], 回忆档案: [] } as any,
        openingConfig: undefined,
        提示词池: [{ id: 'core_world', 内容: 'world view' }] as any[],
        游戏初始时间: '2026:04:30:10:00',
        gameConfig: { 剧情风格: '写实' } as any,
        memoryConfig: { 短期记忆阈值: 30 } as any,
        visualConfig: { 主题: 'light' } as any,
        sceneImageArchive: {} as any,
        角色锚点列表: [],
        当前角色锚点ID: '',
        ...overrides,
    };
}

function makeDeps(overrides: any = {}) {
    return {
        深拷贝: vi.fn(<T>(data: T) => data === undefined ? undefined : JSON.parse(JSON.stringify(data))),
        构建完整地点文本: vi.fn((env: any) => env?.当前地点 || '未知地点'),
        规范化环境信息: vi.fn((env: any) => env),
        规范化记忆系统: vi.fn((mem: any) => mem || { 即时记忆: [], 短期记忆: [], 中期记忆: [], 长期记忆: [], 回忆档案: [] }),
        规范化剧情状态: vi.fn((story: any) => story),
        规范化剧情规划状态: vi.fn((plan: any) => plan),
        规范化女主剧情规划状态: vi.fn((plan: any) => plan),
        规范化同人剧情规划状态: vi.fn((plan: any) => plan),
        规范化同人女主剧情规划状态: vi.fn((plan: any) => plan),
        规范化可选开局配置: vi.fn((config: any) => config),
        规范化视觉设置: vi.fn((v: any) => v),
        规范化场景图片档案: vi.fn((a: any) => a),
        规范化游戏设置: vi.fn((c: any) => c),
        规范化记忆配置: vi.fn((c: any) => c),
        规范化社交列表: vi.fn((list: any) => list),
        规范化世界状态: vi.fn((w: any) => w),
        规范化战斗状态: vi.fn((b: any) => b),
        规范化角色物品容器映射: vi.fn((r: any) => r),
        存档格式版本: 1,
        自动存档最小间隔毫秒: 5000,
        最近自动存档签名Ref: { current: '' },
        最近自动存档时间戳Ref: { current: 0 },
        setHasSave: vi.fn(),
        setView: vi.fn(),
        setShowSaveLoad: vi.fn(),
        清空重Roll快照: vi.fn(),
        重置自动存档状态: vi.fn(),
        设置最近开局配置: vi.fn(),
        设置角色: vi.fn(),
        设置环境: vi.fn(),
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
        设置开局配置: vi.fn(),
        获取当前提示词池: vi.fn(() => []),
        设置提示词池: vi.fn(),
        设置历史记录: vi.fn(),
        应用并同步记忆系统: vi.fn(),
        setGameConfig: vi.fn(),
        setMemoryConfig: vi.fn(),
        获取当前视觉设置: vi.fn(() => ({})),
        设置视觉设置: vi.fn(),
        设置场景图片档案: vi.fn(),
        设置游戏初始时间: vi.fn(),
        设置角色锚点列表: vi.fn(),
        设置当前角色锚点ID: vi.fn(),
        设置时代信息: vi.fn(),
        创建开场空白环境: vi.fn(() => ({})),
        创建开场空白世界: vi.fn(() => ({})),
        创建开场空白战斗: vi.fn(() => ({})),
        创建空门派状态: vi.fn(() => ({})),
        创建开场空白剧情: vi.fn(() => ({})),
        ...overrides,
    };
}

beforeEach(() => {
    vi.resetAllMocks();
});

describe('创建存档数据', () => {
    it('creates manual save with correct type', () => {
        const state = makeCurrentState();
        const deps = makeDeps();
        const save = 创建存档数据('manual', state, deps);
        expect(save.类型).toBe('manual');
        expect(save.元数据.历史记录条数).toBe(1);
        expect(save.元数据.自动存档签名).toBeUndefined();
    });

    it('creates auto save with signature', () => {
        const state = makeCurrentState();
        const deps = makeDeps();
        const save = 创建存档数据('auto', state, deps, 'sig_123');
        expect(save.类型).toBe('auto');
        expect(save.元数据.自动存档签名).toBe('sig_123');
    });

    it('includes core prompt snapshot when available', () => {
        const state = makeCurrentState({
            提示词池: [
                { id: 'core_world', 内容: 'world content' },
                { id: 'core_realm', 内容: 'realm content' },
            ],
        });
        const deps = makeDeps();
        const save = 创建存档数据('manual', state, deps);
        expect(save.核心提示词快照).toBeDefined();
        expect(save.核心提示词快照?.世界观母本).toBe('world content');
        expect(save.核心提示词快照?.境界体系).toBe('realm content');
    });

    it('excludes core prompt snapshot when prompts empty', () => {
        const state = makeCurrentState({ 提示词池: [] });
        const deps = makeDeps();
        const save = 创建存档数据('manual', state, deps);
        expect(save.核心提示词快照).toBeUndefined();
    });

    it('uses snapshot data when provided', () => {
        const state = makeCurrentState();
        const deps = makeDeps();
        const snapshot: import('./saveCoordinator').自动存档快照结构 = {
            role: { 姓名: 'Snapshot Character', 物品栏: [] } as any,
            env: { 当前地点: 'Snapshot Location', 当前时辰: { 年: 2026 } } as any,
        };
        const save = 创建存档数据('manual', state, deps, undefined, snapshot);
        // Snapshot role should have been deep copied
        expect(save.角色数据.姓名).toBe('Snapshot Character');
    });

    it('records history count correctly', () => {
        const state = makeCurrentState({
            历史记录: [{ role: 'user' as const, content: 'a' }, { role: 'assistant' as const, content: 'b' }],
        });
        const deps = makeDeps();
        const save = 创建存档数据('manual', state, deps);
        expect(save.元数据.历史记录条数).toBe(2);
    });
});

describe('执行手动存档', () => {
    it('saves to db and sets hasSave', async () => {
        const state = makeCurrentState();
        const deps = makeDeps();
        await 执行手动存档(state, deps);
        expect(mock保存存档).toHaveBeenCalledTimes(1);
        expect(mock保存存档.mock.calls[0][0].类型).toBe('manual');
        expect(deps.setHasSave).toHaveBeenCalledWith(true);
    });
});

describe('执行自动存档', () => {
    it('saves when history exists', async () => {
        const state = makeCurrentState();
        const deps = makeDeps();
        await 执行自动存档(state, deps);
        expect(mock保存存档).toHaveBeenCalledTimes(1);
        expect(deps.setHasSave).toHaveBeenCalledWith(true);
    });

    it('skips when no history', async () => {
        const state = makeCurrentState({ 历史记录: [] });
        const deps = makeDeps();
        await 执行自动存档(state, deps);
        expect(mock保存存档).not.toHaveBeenCalled();
    });

    it('force saves even with empty history', async () => {
        const state = makeCurrentState({ 历史记录: [] });
        const deps = makeDeps();
        await 执行自动存档(state, deps, { force: true });
        expect(mock保存存档).toHaveBeenCalledTimes(1);
    });

    it('respects minimum interval', async () => {
        const state = makeCurrentState();
        const deps = makeDeps({
            最近自动存档时间戳Ref: { current: Date.now() },
        });
        await 执行自动存档(state, deps);
        expect(mock保存存档).not.toHaveBeenCalled();
    });

    it('catches and logs errors', async () => {
        mock保存存档.mockRejectedValueOnce(new Error('db error'));
        const state = makeCurrentState();
        const deps = makeDeps();
        await expect(执行自动存档(state, deps)).resolves.not.toThrow();
    });
});

describe('执行读取存档', () => {
    function makeSave(overrides: any = {}) {
        return {
            id: 'save_001',
            类型: 'manual' as const,
            时间戳: Date.now(),
            元数据: { schemaVersion: 1, 历史记录条数: 0, 历史记录是否裁剪: false },
            角色数据: { 姓名: 'Reader', 物品栏: [] } as any,
            环境信息: { 当前地点: 'Reading Room', 当前时辰: { 年: 2026 } } as any,
            历史记录: [],
            社交: [],
            世界: { 世界种子: 'read' } as any,
            战斗: {} as any,
            玩家门派: { 门派名称: 'Reading Sect' } as any,
            任务列表: [],
            约定列表: [],
            剧情: { 当前章节: null } as any,
            记忆系统: { 即时记忆: [], 短期记忆: [], 中期记忆: [], 长期记忆: [], 回忆档案: [] } as any,
            游戏设置: { 剧情风格: '写实' } as any,
            记忆配置: { 短期记忆阈值: 30 } as any,
            视觉设置: { 主题: 'dark' } as any,
            场景图片档案: {} as any,
            游戏初始时间: '2026:04:30:10:00',
            角色锚点列表: [],
            当前角色锚点ID: 'anchor_001',
            核心提示词快照: undefined,
            ...overrides,
        };
    }

    it('calls all set functions to restore state', async () => {
        const save = makeSave();
        const deps = makeDeps();
        await 执行读取存档(save, deps);
        expect(deps.清空重Roll快照).toHaveBeenCalled();
        expect(deps.重置自动存档状态).toHaveBeenCalled();
        expect(deps.设置角色).toHaveBeenCalled();
        expect(deps.设置环境).toHaveBeenCalled();
        expect(deps.设置社交).toHaveBeenCalled();
        expect(deps.设置世界).toHaveBeenCalled();
        expect(deps.设置战斗).toHaveBeenCalled();
        expect(deps.设置玩家门派).toHaveBeenCalled();
        expect(deps.设置任务列表).toHaveBeenCalled();
        expect(deps.设置约定列表).toHaveBeenCalled();
        expect(deps.设置剧情).toHaveBeenCalled();
        expect(deps.设置历史记录).toHaveBeenCalled();
        expect(deps.应用并同步记忆系统).toHaveBeenCalled();
    });

    it('sets view to game and closes save/load modal', async () => {
        const save = makeSave();
        const deps = makeDeps();
        await 执行读取存档(save, deps);
        expect(deps.setView).toHaveBeenCalledWith('game');
        expect(deps.setShowSaveLoad).toHaveBeenCalledWith({ show: false, mode: 'load' });
    });

    it('sets hasSave flag', async () => {
        const save = makeSave();
        const deps = makeDeps();
        await 执行读取存档(save, deps);
        expect(deps.setHasSave).toHaveBeenCalledWith(true);
    });

    it('restores core prompts from snapshot', async () => {
        const save = makeSave({
            核心提示词快照: {
                世界观母本: 'restored world',
                境界体系: 'restored realm',
            },
        });
        const deps = makeDeps({
            获取当前提示词池: vi.fn(() => []),
        });
        await 执行读取存档(save, deps);
        expect(deps.设置提示词池).toHaveBeenCalled();
        expect(mock保存设置).toHaveBeenCalled();
    });

    it('handles missing optional fields', async () => {
        const save = makeSave({
            视觉设置: undefined,
            场景图片档案: undefined,
            时代信息: undefined,
            女主剧情规划: undefined,
        });
        const deps = makeDeps();
        await expect(执行读取存档(save, deps)).resolves.not.toThrow();
    });

    it('restores 时代信息 when present', async () => {
        const save = makeSave({
            时代信息: { 当前纪元: 'test era' } as any,
        });
        const deps = makeDeps();
        await 执行读取存档(save, deps);
        expect(deps.设置时代信息).toHaveBeenCalled();
    });

    it('uses defaults for null environment', async () => {
        const save = makeSave({ 环境信息: null });
        const deps = makeDeps();
        await 执行读取存档(save, deps);
        expect(deps.创建开场空白环境).toHaveBeenCalled();
    });

    it('uses defaults for null world', async () => {
        const save = makeSave({ 世界: null });
        const deps = makeDeps();
        await 执行读取存档(save, deps);
        expect(deps.创建开场空白世界).toHaveBeenCalled();
    });
});
