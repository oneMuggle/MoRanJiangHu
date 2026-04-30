import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    提取NPC生图基础数据附带私密描述,
    创建图片预设工作流,
    主角角色锚点标识
} from './imagePresetWorkflow';

vi.mock('./npcContext', () => ({
    提取NPC生图基础数据: vi.fn((npc: any) => ({
        姓名: npc.姓名,
        性别: npc.性别,
        境界: npc.境界,
        身份: npc.身份,
        核心性格特征: npc.核心性格特征
    })),
    提取主角生图基础数据: vi.fn((char: any) => ({
        姓名: char.姓名 || '主角',
        性别: char.性别
    }))
}));

vi.mock('../../utils/apiConfig', () => ({
    获取主剧情接口配置: vi.fn((config: any) => config?.configs?.[0] || {}),
    获取生图词组转化器接口配置: vi.fn(() => null),
    接口配置是否可用: vi.fn(() => true),
    规范化接口设置: vi.fn((config: any) => ({
        ...config,
        功能模型占位: {
            PNG画风预设列表: [],
            角色锚点列表: [],
            画师串预设列表: [],
            当前PNG画风预设ID: '',
            当前NPCPNG画风预设ID: '',
            当前场景PNG画风预设ID: '',
            ...config?.功能模型占位
        }
    }))
}));

describe('imagePresetWorkflow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('提取NPC生图基础数据附带私密描述', () => {
        it('includes private descriptions for female main characters', () => {
            const npc = {
                姓名: '小龙女',
                性别: '女',
                是否主要角色: true,
                胸部描述: '丰满',
                小穴描述: '湿润',
                屁穴描述: '紧致'
            };
            const result = 提取NPC生图基础数据附带私密描述(npc);
            expect(result.胸部描述).toBe('丰满');
            expect(result.小穴描述).toBe('湿润');
        });

        it('excludes private descriptions for male characters', () => {
            const npc = {
                姓名: '杨过',
                性别: '男',
                是否主要角色: true,
                胸部描述: 'test'
            };
            const result = 提取NPC生图基础数据附带私密描述(npc);
            expect(result).not.toHaveProperty('胸部描述');
        });

        it('excludes private descriptions for non-main characters', () => {
            const npc = {
                姓名: '路人',
                性别: '女',
                是否主要角色: false,
                胸部描述: 'test'
            };
            const result = 提取NPC生图基础数据附带私密描述(npc);
            expect(result).not.toHaveProperty('胸部描述');
        });
    });

    describe('创建图片预设工作流', () => {
        const makeDeps = (overrides: any = {}) => ({
            获取接口配置: vi.fn(() => ({
                功能模型占位: {
                    PNG画风预设列表: [],
                    角色锚点列表: [],
                    画师串预设列表: [],
                    当前PNG画风预设ID: '',
                    当前NPCPNG画风预设ID: '',
                    当前场景PNG画风预设ID: ''
                }
            })),
            更新接口配置: vi.fn((fn) => {
                const current = deps.获取接口配置();
                const updated = fn(current);
                deps.获取接口配置.mockReturnValue(updated);
                return updated;
            }),
            加载图片AI服务: vi.fn(() => Promise.resolve({
                净化PNG复刻参数: vi.fn((p: any) => p),
                解析PNG文件元数据: vi.fn(() => Promise.resolve({ 正面提示词: '', 负面提示词: '', 元数据标签: {}, 来源: 'file', 参数: {} })),
                提炼PNG画风标签: vi.fn(() => Promise.resolve({ 正面提示词: 'positive', 负面提示词: 'negative', 画师串: 'artist', 画师命中项: [] })),
                提取角色锚点提示词: vi.fn(() => Promise.resolve({ 正面提示词: 'anchor', 结构化特征: {} }))
            })),
            推送右下角提示: vi.fn(),
            保存图片资源: vi.fn((dataUrl: string) => Promise.resolve(dataUrl)),
            获取社交列表: vi.fn(() => []),
            获取角色: vi.fn(() => null),
            isCultivationSystemEnabled: vi.fn(() => true),
            ...overrides
        });
        const deps = makeDeps();

        it('returns workflow functions', () => {
            const workflow = 创建图片预设工作流(deps);
            expect(typeof workflow.savePngStylePreset).toBe('function');
            expect(typeof workflow.deletePngStylePreset).toBe('function');
            expect(typeof workflow.getPngStylePreset).toBe('function');
            expect(typeof workflow.saveCharacterAnchor).toBe('function');
        });

        it('主角角色锚点标识 is defined', () => {
            expect(主角角色锚点标识).toBe('__player__');
        });

        describe('PNG画风预设', () => {
            it('returns null when no presets exist', () => {
                const workflow = 创建图片预设工作流(makeDeps());
                expect(workflow.getPngStylePreset()).toBeNull();
            });

            it('finds preset by id', () => {
                const preset = { id: 'preset_1', 名称: 'Test', 来源: 'manual', 正面提示词: 'test' };
                const deps = makeDeps({
                    获取接口配置: vi.fn(() => ({
                        功能模型占位: { PNG画风预设列表: [preset], 角色锚点列表: [], 画师串预设列表: [] }
                    }))
                });
                const workflow = 创建图片预设工作流(deps);
                const result = workflow.getPngStylePreset('preset_1');
                expect(result).toEqual(preset);
            });

            it('returns first preset when no id given', () => {
                const presets = [
                    { id: 'p1', 名称: 'First', 来源: 'manual' },
                    { id: 'p2', 名称: 'Second', 来源: 'manual' }
                ];
                const deps = makeDeps({
                    获取接口配置: vi.fn(() => ({
                        功能模型占位: { PNG画风预设列表: presets, 角色锚点列表: [], 画师串预设列表: [] }
                    }))
                });
                const workflow = 创建图片预设工作流(deps);
                const result = workflow.getPngStylePreset();
                expect(result).toEqual(presets[0]);
            });

            it('saves new preset with generated id', async () => {
                const workflow = 创建图片预设工作流(deps);
                const result = await workflow.savePngStylePreset({
                    id: '',
                    名称: 'New Preset',
                    来源: 'manual',
                    正面提示词: 'positive prompt'
                } as any);
                expect(result).not.toBeNull();
                expect(result?.名称).toBe('New Preset');
            });

            it('deletes preset and clears current reference', async () => {
                const preset = { id: 'to_delete', 名称: 'Delete Me', 来源: 'manual' };
                const deps = makeDeps({
                    获取接口配置: vi.fn(() => ({
                        功能模型占位: {
                            PNG画风预设列表: [preset],
                            角色锚点列表: [],
                            画师串预设列表: [],
                            当前PNG画风预设ID: 'to_delete'
                        }
                    }))
                });
                const workflow = 创建图片预设工作流(deps);
                await workflow.deletePngStylePreset('to_delete');
                expect(deps.更新接口配置).toHaveBeenCalled();
            });

            it('returns null summary when no preset', () => {
                const workflow = 创建图片预设工作流(makeDeps());
                expect(workflow.getCurrentPngStylePreset()).toBeNull();
            });
        });

        describe('角色锚点', () => {
            it('returns null when no anchors exist', () => {
                const workflow = 创建图片预设工作流(makeDeps());
                expect(workflow.getCharacterAnchor()).toBeNull();
            });

            it('returns player character anchor by special id', () => {
                const anchor = {
                    id: 'player_anchor',
                    npcId: 主角角色锚点标识,
                    名称: '主角锚点',
                    是否启用: true,
                    正面提示词: '',
                    负面提示词: ''
                };
                const deps = makeDeps({
                    获取接口配置: vi.fn(() => ({
                        功能模型占位: {
                            PNG画风预设列表: [],
                            角色锚点列表: [anchor],
                            画师串预设列表: [],
                            当前角色锚点ID: ''
                        }
                    }))
                });
                const workflow = 创建图片预设工作流(deps);
                const result = workflow.getPlayerCharacterAnchor();
                expect(result).toEqual(anchor);
            });

            it('finds anchor by npcId', () => {
                const anchor = {
                    id: 'npc_anchor',
                    npcId: 'npc_1',
                    名称: 'NPC锚点',
                    是否启用: true,
                    正面提示词: '',
                    负面提示词: ''
                };
                const deps = makeDeps({
                    获取接口配置: vi.fn(() => ({
                        功能模型占位: {
                            PNG画风预设列表: [],
                            角色锚点列表: [anchor],
                            画师串预设列表: [],
                            当前角色锚点ID: ''
                        }
                    }))
                });
                const workflow = 创建图片预设工作流(deps);
                const result = workflow.getCharacterAnchorByNpcId('npc_1');
                expect(result).toEqual(anchor);
            });

            it('returns null for disabled anchor', () => {
                const anchor = {
                    id: 'disabled',
                    npcId: 'npc_2',
                    是否启用: false,
                    正面提示词: '',
                    负面提示词: ''
                };
                const deps = makeDeps({
                    获取接口配置: vi.fn(() => ({
                        功能模型占位: {
                            PNG画风预设列表: [],
                            角色锚点列表: [anchor],
                            画师串预设列表: [],
                            当前角色锚点ID: ''
                        }
                    }))
                });
                const workflow = 创建图片预设工作流(deps);
                expect(workflow.getCharacterAnchorByNpcId('npc_2')).toBeNull();
            });

            it('returns null when saving anchor without npcId', async () => {
                const workflow = 创建图片预设工作流(makeDeps());
                const result = await workflow.saveCharacterAnchor({
                    id: '',
                    npcId: '',
                    名称: 'test',
                    正面提示词: '',
                    负面提示词: ''
                } as any);
                expect(result).toBeNull();
            });

            it('extracts scene anchors with auto-inject enabled', () => {
                const anchor = {
                    id: 'auto_inject',
                    npcId: 'npc_1',
                    名称: '自动注入',
                    是否启用: true,
                    场景生图自动注入: true,
                    正面提示词: 'positive',
                    负面提示词: 'negative',
                    结构化特征: {}
                };
                const deps = makeDeps({
                    获取接口配置: vi.fn(() => ({
                        功能模型占位: {
                            PNG画风预设列表: [],
                            角色锚点列表: [anchor],
                            画师串预设列表: [],
                            当前角色锚点ID: ''
                        }
                    }))
                });
                const workflow = 创建图片预设工作流(deps);
                const sceneContext = {
                    人物快照: {
                        场景人物总览: [{ id: 'npc_1' }]
                    }
                };
                const result = workflow.getSceneCharacterAnchors(sceneContext);
                expect(result).toHaveLength(1);
            });
        });
    });
});
