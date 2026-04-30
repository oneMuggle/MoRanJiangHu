import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    提取NPC生图基础数据,
    提取主角生图基础数据,
    提取NPC香闺秘档部位生图数据,
    构建NPC上下文
} from './npcContext';

// Mock dependencies
vi.mock('./memoryUtils', () => ({
    规范化记忆配置: vi.fn(() => ({ 重要角色关键记忆条数N: 5 }))
}));

vi.mock('./npcMemorySummary', () => ({
    构建NPC记忆展示结果: vi.fn(() => ({ 总结记忆: [], 记忆: [] }))
}));

vi.mock('./timeUtils', () => ({
    normalizeCanonicalGameTime: vi.fn((t: string) => t),
    结构化时间转标准串: vi.fn(() => '')
}));

vi.mock('../../prompts/runtime/fandom', () => ({
    解析境界映射值: vi.fn(() => undefined)
}));

vi.mock('../../models/intimacy', () => ({
    计算亲密度等级: vi.fn((score: number) => Math.min(10, Math.floor(score / 10)))
}));

describe('npcContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('提取NPC生图基础数据', () => {
        it('extracts basic NPC data from standard fields', () => {
            const npc = {
                姓名: '张三',
                性别: '男',
                年龄: 25,
                身份: '侠客',
                境界: '先天',
                简介: '江湖游侠',
                核心性格特征: '豪爽',
                关系状态: '单身',
                外貌描写: '剑眉星目',
                身材描写: '高大威猛',
                衣着风格: '青衫'
            };
            const result = 提取NPC生图基础数据(npc);
            expect(result.姓名).toBe('张三');
            expect(result.性别).toBe('男');
            expect(result.境界).toBe('先天');
            expect(result.外貌).toBe('剑眉星目');
        });

        it('falls back to alternate field names', () => {
            const npc = {
                姓名: '李四',
                性格: '内向',
                外貌: '清秀'
            };
            const result = 提取NPC生图基础数据(npc);
            expect(result.核心性格特征).toBe('内向');
            expect(result.性格).toBe('内向');
        });

        it('respects cultivationSystemEnabled option', () => {
            const npc = { 姓名: '王五', 境界: '宗师' };
            const result = 提取NPC生图基础数据(npc, { cultivationSystemEnabled: false });
            expect(result).not.toHaveProperty('境界');
        });

        it('filters empty fields', () => {
            const npc = { 姓名: '  ', 性别: '' };
            const result = 提取NPC生图基础数据(npc);
            expect(result).not.toHaveProperty('姓名');
            expect(result).not.toHaveProperty('性别');
        });

        it('reads from 档案 object fallback', () => {
            const npc = {
                姓名: '赵六',
                档案: { 外貌: '档案中的外貌', 性格: '档案性格' }
            };
            const result = 提取NPC生图基础数据(npc);
            expect(result.外貌).toBe('档案中的外貌');
        });
    });

    describe('提取主角生图基础数据', () => {
        it('extracts player character data', () => {
            const char = {
                姓名: '主角',
                性别: '女',
                年龄: 20,
                称号: '剑仙',
                出身背景: { 名称: '蜀山弟子', 描述: '蜀山派传人' },
                境界: '元婴',
                性格: '冷静',
                外貌: '仙姿玉貌',
                装备: { 头部: '玉冠', 盔甲: '青云道袍', 主武器: '无' }
            };
            const result = 提取主角生图基础数据(char);
            expect(result.姓名).toBe('主角');
            expect(result.身份).toContain('剑仙');
            expect(result.简介).toBe('蜀山派传人');
            expect(result.衣着).toContain('玉冠');
            expect(result.衣着).toContain('青云道袍');
        });

        it('defaults name to 主角 when missing', () => {
            const result = 提取主角生图基础数据({});
            expect(result.姓名).toBe('主角');
        });

        it('filters empty equipment', () => {
            const char = {
                姓名: '测试',
                装备: { 头部: '无', 主武器: '  ' }
            };
            const result = 提取主角生图基础数据(char);
            expect(result).not.toHaveProperty('衣着');
        });
    });

    describe('提取NPC香闺秘档部位生图数据', () => {
        it('includes part-specific description', () => {
            const npc = {
                姓名: '小龙女',
                胸部描述: '丰满挺拔',
                外貌描写: '清丽脱俗'
            };
            const result = 提取NPC香闺秘档部位生图数据(npc, '胸部');
            expect(result.胸部描述).toBe('丰满挺拔');
            expect(result.目标部位).toBe('胸部');
        });

        it('excludes unrelated part descriptions', () => {
            const npc = { 姓名: '小龙女', 胸部描述: '描述' };
            const result = 提取NPC香闺秘档部位生图数据(npc, '小穴');
            expect(result.小穴描述).toBeUndefined();
            expect(result.胸部描述).toBeUndefined();
        });

        it('includes base data', () => {
            const npc = { 姓名: 'NPC', 性别: '女', 年龄: 22 };
            const result = 提取NPC香闺秘档部位生图数据(npc, '胸部');
            expect(result.姓名).toBe('NPC');
        });
    });

    describe('构建NPC上下文', () => {
        const makeNpc = (overrides: any = {}) => ({
            姓名: '测试NPC',
            性别: '男',
            境界: '炼气',
            身份: '散修',
            是否在场: true,
            是否队友: false,
            是否主要角色: false,
            好感度: 50,
            关系状态: '陌生',
            简介: '测试简介',
            核心性格特征: '谨慎',
            ...overrides
        });

        it('returns present and absent data blocks', () => {
            const result = 构建NPC上下文([makeNpc()], {} as any);
            expect(result).toHaveProperty('在场数据块');
            expect(result).toHaveProperty('离场数据块');
        });

        it('categorizes NPCs by 是否在场', () => {
            const presentNpc = makeNpc({ 姓名: '在场', 是否在场: true });
            const absentNpc = makeNpc({ 姓名: '离场', 是否在场: false });
            const result = 构建NPC上下文([presentNpc, absentNpc], {} as any);
            expect(result.在场数据块).toContain('在场');
            expect(result.离场数据块).toContain('离场');
        });

        it('uses full data for main characters', () => {
            const mainNpc = makeNpc({ 姓名: '主角', 是否主要角色: true });
            const result = 构建NPC上下文([mainNpc], {} as any);
            expect(result.在场数据块).toContain('主角');
        });

        it('handles empty NPC list', () => {
            const result = 构建NPC上下文([], {} as any);
            expect(result.在场数据块).toContain('无');
            expect(result.离场数据块).toContain('无');
        });

        it('includes combat state for present teammates', () => {
            const teammate = makeNpc({
                姓名: '队友',
                是否在场: true,
                是否队友: true,
                攻击力: 100,
                防御力: 50,
                当前血量: 80,
                最大血量: 100
            });
            const result = 构建NPC上下文([teammate], {} as any);
            expect(result.在场数据块).toContain('队友');
        });

        it('includes offline refresh anchor for absent NPCs', () => {
            const absentNpc = makeNpc({
                姓名: '离场NPC',
                是否在场: false,
                记忆: [{ 时间: '2024-01-01', 内容: '最后一条记忆' }],
                最后互动时间: '2024-01-01'
            });
            const result = 构建NPC上下文([absentNpc], {} as any);
            expect(result.离场数据块).toContain('离场NPC');
        });
    });
});
