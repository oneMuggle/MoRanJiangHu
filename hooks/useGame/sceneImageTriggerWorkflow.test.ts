import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 创建场景生图触发工作流 } from './sceneImageTriggerWorkflow';

describe('sceneImageTriggerWorkflow', () => {
    const makeDeps = (overrides: any = {}) => ({
        获取环境: vi.fn(() => ({ 大地点: '江湖', 中地点: '华山', 时间: '1:01:01:00:00' })),
        获取角色: vi.fn(() => ({ 姓名: '主角', 性别: '男' })),
        获取社交列表: vi.fn(() => []),
        获取历史记录: vi.fn(() => [
            { role: 'user', content: '往前走' },
            { role: 'assistant', structuredResponse: { logs: [{ sender: '旁白', text: '你来到了华山脚下' }] } }
        ]),
        获取接口配置: vi.fn(() => ({})),
        规范化环境信息: vi.fn((env) => env),
        深拷贝: vi.fn((v) => JSON.parse(JSON.stringify(v))),
        环境时间转标准串: vi.fn(() => '1:01:01:00:00'),
        构建完整地点文本: vi.fn(() => '华山'),
        修炼体系已启用: vi.fn(() => true),
        提取NPC生图基础数据: vi.fn(() => ({})),
        读取文生图功能配置: vi.fn(() => ({ 场景构图要求: '纯场景', 场景尺寸: '1024x1024' })),
        场景模式已开启: vi.fn(() => true),
        构建文生图额外要求: vi.fn((extra) => extra || ''),
        加载场景生图工作流: vi.fn(() => Promise.resolve({})),
        获取场景文生图接口配置: vi.fn(() => null),
        获取生图词组转化器接口配置: vi.fn(() => null),
        获取生图画师串预设: vi.fn(() => null),
        获取当前PNG画风预设: vi.fn(() => null),
        获取场景角色锚点: vi.fn(() => []),
        获取词组转化器预设提示词: vi.fn(() => ''),
        接口配置是否可用: vi.fn(() => true),
        创建场景生图任务: vi.fn(() => ({ id: 'scene_task_1' })),
        生成场景生图记录ID: vi.fn(() => 'scene_task_1'),
        追加场景生图任务: vi.fn(),
        更新场景生图任务: vi.fn(),
        更新场景图片档案: vi.fn(),
        应用场景图片为壁纸: vi.fn(),
        获取当前自动应用任务ID: vi.fn(() => ''),
        设置当前自动应用任务ID: vi.fn(),
        记录后台场景监控: vi.fn(),
        推送右下角提示: vi.fn(),
        ...overrides
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns workflow functions', () => {
        const deps = makeDeps();
        const workflow = 创建场景生图触发工作流(deps);
        expect(typeof workflow.触发场景自动生图).toBe('function');
        expect(typeof workflow.生成场景壁纸).toBe('function');
        expect(typeof workflow.生成场景摘要).toBe('function');
        expect(typeof workflow.构建场景人物快照).toBe('function');
    });

    describe('触发场景自动生图', () => {
        it('skips when scene mode is off', () => {
            const deps = makeDeps({ 场景模式已开启: vi.fn(() => false) });
            const workflow = 创建场景生图触发工作流(deps);
            workflow.触发场景自动生图({ response: { content: 'test' } });
            expect(deps.创建场景生图任务).not.toHaveBeenCalled();
        });

        it('skips when no response content', () => {
            const deps = makeDeps();
            const workflow = 创建场景生图触发工作流(deps);
            workflow.触发场景自动生图({ response: { content: '' } });
            expect(deps.创建场景生图任务).not.toHaveBeenCalled();
        });
    });

    describe('生成场景壁纸', () => {
        it('skips when no assistant response in history', async () => {
            const deps = makeDeps({
                获取历史记录: vi.fn(() => [])
            });
            const workflow = 创建场景生图触发工作流(deps);
            await workflow.生成场景壁纸({ 后台处理: false });
            expect(deps.创建场景生图任务).not.toHaveBeenCalled();
        });
    });
});
