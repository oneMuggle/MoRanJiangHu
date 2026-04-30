import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 创建主角图片工作流 } from './playerImageWorkflow';

vi.mock('../../services/ai/image', () => ({
    generateImageFromPrompt: vi.fn(() => Promise.resolve({ dataUrl: 'data:image/png;base64,xxx' }))
}));

describe('playerImageWorkflow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const makeDeps = (overrides: any = {}) => ({
        apiConfig: { 功能模型占位: {}, configs: [] },
        获取文生图接口配置: vi.fn(() => ({ id: 'img_api', 画风: 'anime', model: 'dall-e' })),
        获取生图词组转化器接口配置: vi.fn(() => null),
        获取生图画师串预设: vi.fn(() => null),
        获取当前PNG画风预设: vi.fn(() => null),
        获取玩家角色锚点: vi.fn(() => null),
        获取词组转化器预设提示词: vi.fn(() => ''),
        接口配置是否可用: vi.fn(() => true),
        读取文生图功能配置: vi.fn(() => ({ 总开关: true, 角色开关: true, 使用词组转化器: false })),
        提取主角生图基础数据: vi.fn(() => ({ 姓名: '主角', 性别: '男' })),
        设置角色: vi.fn(),
        获取角色: vi.fn(() => ({ 姓名: '主角', 性别: '男' })),
        创建玩家生图任务: vi.fn(() => ({ id: 'player_task_1', 状态: 'pending' })),
        追加NPC生图任务: vi.fn(),
        更新NPC生图任务: vi.fn(),
        玩家生图进行中集合: new Set<string>(),
        推送右下角提示: vi.fn(),
        加载NPC生图工作流: vi.fn(() => Promise.resolve({ 执行NPC生图工作流: vi.fn() })),
        ...overrides
    });

    it('returns workflow functions', () => {
        const deps = makeDeps();
        const workflow = 创建主角图片工作流(deps);
        expect(typeof workflow.updatePlayerAvatar).toBe('function');
        expect(typeof workflow.selectPlayerAvatarImage).toBe('function');
        expect(typeof workflow.generatePlayerImageManually).toBe('function');
    });

    describe('updatePlayerAvatar', () => {
        it('updates character with avatar URL', () => {
            const deps = makeDeps();
            const workflow = 创建主角图片工作流(deps);
            workflow.updatePlayerAvatar('data:image/png;base64,test');
            expect(deps.设置角色).toHaveBeenCalled();
        });
    });
});
