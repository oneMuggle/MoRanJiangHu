import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 创建手动NPC工作流 } from './manualNpcWorkflow';

vi.mock('./npcImageStateWorkflow', () => ({
    生成NPC生图记录ID: vi.fn(() => 'img_record_123'),
}));

function makeDeps(overrides: any = {}) {
    return {
        获取环境: vi.fn(() => ({ 年: 2026, 月: 4, 日: 30, 时间: '2026-04-30T00:00:00' })),
        环境时间转标准串: vi.fn(() => '2026-04-30T00:00:00'),
        规范化社交列表: vi.fn((list: any[]) => list || []),
        设置社交: vi.fn((updater: any) => {}),
        执行社交自动存档: vi.fn(),
        保存图片资源: vi.fn(() => Promise.resolve('/assets/img_123.png')),
        ...overrides,
    };
}

describe('创建手动NPC工作流', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createNpcManually', () => {
        it('creates NPC with default values', () => {
            const deps = makeDeps();
            const { createNpcManually } = 创建手动NPC工作流(deps);
            const npc = createNpcManually();
            expect(npc.姓名).toBe('未命名NPC');
            expect(npc.性别).toBe('女');
            expect(npc.年龄).toBe(18);
            expect(npc.好感度).toBe(0);
            expect(npc.关系状态).toBe('陌生');
        });

        it('creates NPC with seed values', () => {
            const deps = makeDeps();
            const { createNpcManually } = 创建手动NPC工作流(deps);
            const npc = createNpcManually({
                姓名: '张三',
                性别: '男',
                年龄: 25,
                是否在场: true,
                是否队友: true,
            });
            expect(npc.姓名).toBe('张三');
            expect(npc.性别).toBe('男');
            expect(npc.年龄).toBe(25);
            expect(npc.是否在场).toBe(true);
            expect(npc.是否队友).toBe(true);
        });

        it('triggers social auto-save after creation', () => {
            const deps = makeDeps({
                设置社交: vi.fn((updater: any) => {
                    const prev: any[] = [];
                    const next = updater(prev);
                    // This triggers the snapshot capture in the workflow
                }),
            });
            const { createNpcManually } = 创建手动NPC工作流(deps);
            createNpcManually({ 姓名: '张三' });
            expect(deps.执行社交自动存档).toHaveBeenCalled();
        });
    });

    describe('updateNpcManually', () => {
        it('does nothing for empty npcId', () => {
            const deps = makeDeps();
            const { updateNpcManually } = 创建手动NPC工作流(deps);
            updateNpcManually('', { 姓名: '张三' } as any);
            expect(deps.设置社交).not.toHaveBeenCalled();
        });

        it('updates NPC with new values', () => {
            const existingNpc = { id: 'npc_1', 姓名: '李四', 性别: '女', 年龄: 20 };
            const deps = makeDeps({
                设置社交: vi.fn((updater: any) => {
                    const prev = [existingNpc];
                    const next = updater(prev);
                    expect(next[0].姓名).toBe('王五');
                }),
            });
            const { updateNpcManually } = 创建手动NPC工作流(deps);
            updateNpcManually('npc_1', { id: 'npc_1', 姓名: '王五' } as any);
            expect(deps.设置社交).toHaveBeenCalled();
        });

        it('preserves NPC id during update', () => {
            const deps = makeDeps({
                规范化社交列表: vi.fn((list) => list),
                设置社交: vi.fn((updater: any) => {
                    const prev = [{ id: 'npc_1' }];
                    const next = updater(prev);
                    expect(next[0].id).toBe('npc_1');
                }),
            });
            const { updateNpcManually } = 创建手动NPC工作流(deps);
            updateNpcManually('npc_1', { id: 'wrong_id', 姓名: '新名字' } as any);
        });
    });

    describe('deleteNpcManually', () => {
        it('does nothing for empty npcId', () => {
            const deps = makeDeps();
            const { deleteNpcManually } = 创建手动NPC工作流(deps);
            deleteNpcManually('');
            expect(deps.设置社交).not.toHaveBeenCalled();
        });

        it('removes NPC by id', () => {
            const npc1 = { id: 'npc_1', 姓名: '张三' };
            const npc2 = { id: 'npc_2', 姓名: '李四' };
            const deps = makeDeps({
                设置社交: vi.fn((updater: any) => {
                    const prev = [npc1, npc2];
                    const next = updater(prev);
                    expect(next).toHaveLength(1);
                    expect(next[0].id).toBe('npc_2');
                }),
            });
            const { deleteNpcManually } = 创建手动NPC工作流(deps);
            deleteNpcManually('npc_1');
            expect(deps.设置社交).toHaveBeenCalled();
        });
    });

    describe('updateNpcMajorRole', () => {
        it('does nothing for empty npcId', () => {
            const deps = makeDeps();
            const { updateNpcMajorRole } = 创建手动NPC工作流(deps);
            updateNpcMajorRole('', true);
            expect(deps.设置社交).not.toHaveBeenCalled();
        });

        it('sets 是否主要角色 to true', () => {
            const deps = makeDeps({
                设置社交: vi.fn((updater: any) => {
                    const prev = [{ id: 'npc_1', 姓名: '张三' }];
                    const next = updater(prev);
                    expect(next[0].是否主要角色).toBe(true);
                }),
            });
            const { updateNpcMajorRole } = 创建手动NPC工作流(deps);
            updateNpcMajorRole('npc_1', true);
        });

        it('sets 是否主要角色 to false', () => {
            const deps = makeDeps({
                设置社交: vi.fn((updater: any) => {
                    const prev = [{ id: 'npc_1', 姓名: '张三', 是否主要角色: true }];
                    const next = updater(prev);
                    expect(next[0].是否主要角色).toBe(false);
                }),
            });
            const { updateNpcMajorRole } = 创建手动NPC工作流(deps);
            updateNpcMajorRole('npc_1', false);
        });
    });

    describe('updateNpcPresence', () => {
        it('does nothing for empty npcId', () => {
            const deps = makeDeps();
            const { updateNpcPresence } = 创建手动NPC工作流(deps);
            updateNpcPresence('', true);
            expect(deps.设置社交).not.toHaveBeenCalled();
        });

        it('sets 是否在场 to true', () => {
            const deps = makeDeps({
                设置社交: vi.fn((updater: any) => {
                    const prev = [{ id: 'npc_1', 姓名: '张三' }];
                    const next = updater(prev);
                    expect(next[0].是否在场).toBe(true);
                }),
            });
            const { updateNpcPresence } = 创建手动NPC工作流(deps);
            updateNpcPresence('npc_1', true);
        });

        it('sets 是否在场 to false', () => {
            const deps = makeDeps({
                设置社交: vi.fn((updater: any) => {
                    const prev = [{ id: 'npc_1', 姓名: '张三', 是否在场: true }];
                    const next = updater(prev);
                    expect(next[0].是否在场).toBe(false);
                }),
            });
            const { updateNpcPresence } = 创建手动NPC工作流(deps);
            updateNpcPresence('npc_1', false);
        });
    });

    describe('removeNpc', () => {
        it('does nothing for empty npcId', () => {
            const deps = makeDeps();
            const { removeNpc } = 创建手动NPC工作流(deps);
            removeNpc('');
            expect(deps.设置社交).not.toHaveBeenCalled();
        });

        it('removes NPC by id', () => {
            const deps = makeDeps({
                设置社交: vi.fn((updater: any) => {
                    const prev = [{ id: 'npc_1' }, { id: 'npc_2' }];
                    const next = updater(prev);
                    expect(next).toHaveLength(1);
                    expect(next[0].id).toBe('npc_2');
                }),
            });
            const { removeNpc } = 创建手动NPC工作流(deps);
            removeNpc('npc_1');
        });
    });

    describe('uploadNpcImageToSlot', () => {
        it('returns null for empty npcId', async () => {
            const deps = makeDeps();
            const { uploadNpcImageToSlot } = 创建手动NPC工作流(deps);
            const result = await uploadNpcImageToSlot('', '头像', { dataUrl: 'data:image/png;base64,abc' });
            expect(result).toBeNull();
        });

        it('returns null for empty dataUrl', async () => {
            const deps = makeDeps();
            const { uploadNpcImageToSlot } = 创建手动NPC工作流(deps);
            const result = await uploadNpcImageToSlot('npc_1', '头像', { dataUrl: '' });
            expect(result).toBeNull();
        });

        it('uploads head portrait and updates image archive', async () => {
            const deps = makeDeps({
                设置社交: vi.fn((updater: any) => {
                    const prev = [{ id: 'npc_1', 姓名: '张三', 图片档案: {} }];
                    const next = updater(prev);
                    expect(next[0].图片档案.已选头像图片ID).toBe('img_record_123');
                }),
            });
            const { uploadNpcImageToSlot } = 创建手动NPC工作流(deps);
            const result = await uploadNpcImageToSlot('npc_1', '头像', { dataUrl: 'data:image/png;base64,abc' });
            expect(result).toBe('/assets/img_123.png');
            expect(deps.保存图片资源).toHaveBeenCalledWith('data:image/png;base64,abc');
            expect(deps.设置社交).toHaveBeenCalled();
        });

        it('uploads standing portrait and updates image archive', async () => {
            const deps = makeDeps({
                设置社交: vi.fn((updater: any) => {
                    const prev = [{ id: 'npc_1', 姓名: '张三', 图片档案: {} }];
                    const next = updater(prev);
                    expect(next[0].图片档案.已选立绘图片ID).toBe('img_record_123');
                }),
            });
            const { uploadNpcImageToSlot } = 创建手动NPC工作流(deps);
            await uploadNpcImageToSlot('npc_1', '立绘', { dataUrl: 'data:image/png;base64,abc' });
            expect(deps.设置社交).toHaveBeenCalled();
        });

        it('uploads background and updates image archive', async () => {
            const deps = makeDeps({
                设置社交: vi.fn((updater: any) => {
                    const prev = [{ id: 'npc_1', 姓名: '张三', 图片档案: {} }];
                    const next = updater(prev);
                    expect(next[0].图片档案.已选背景图片ID).toBe('img_record_123');
                }),
            });
            const { uploadNpcImageToSlot } = 创建手动NPC工作流(deps);
            await uploadNpcImageToSlot('npc_1', '背景', { dataUrl: 'data:image/png;base64,abc' });
            expect(deps.设置社交).toHaveBeenCalled();
        });

        it('uploads 香闺秘档 body part image', async () => {
            const deps = makeDeps({
                设置社交: vi.fn((updater: any) => {
                    const prev = [{ id: 'npc_1', 姓名: '张三', 图片档案: {} }];
                    const next = updater(prev);
                    expect(next[0].图片档案.香闺秘档部位档案).toBeDefined();
                    expect(next[0].图片档案.香闺秘档部位档案['胸部']).toBeDefined();
                }),
            });
            const { uploadNpcImageToSlot } = 创建手动NPC工作流(deps);
            await uploadNpcImageToSlot('npc_1', '胸部', { dataUrl: 'data:image/png;base64,abc' });
            expect(deps.设置社交).toHaveBeenCalled();
        });

        it('trims dataUrl before processing', async () => {
            const deps = makeDeps();
            const { uploadNpcImageToSlot } = 创建手动NPC工作流(deps);
            await uploadNpcImageToSlot('npc_1', '头像', { dataUrl: '  data:image/png;base64,abc  ' });
            expect(deps.保存图片资源).toHaveBeenCalledWith('data:image/png;base64,abc');
        });

        it('handles NPC without existing image archive', async () => {
            const deps = makeDeps({
                设置社交: vi.fn((updater: any) => {
                    const prev = [{ id: 'npc_1', 姓名: '张三' }];
                    const next = updater(prev);
                    expect(next[0].图片档案).toBeDefined();
                }),
            });
            const { uploadNpcImageToSlot } = 创建手动NPC工作流(deps);
            await uploadNpcImageToSlot('npc_1', '头像', { dataUrl: 'data:image/png;base64,abc' });
        });
    });
});
