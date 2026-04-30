import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    创建开场空白角色,
    创建空门派状态,
    创建占位门派状态,
    规范化门派状态,
    创建开场空白环境,
    创建开场空白世界,
    规范化世界状态,
    创建开场空白战斗,
    规范化战斗状态,
    创建开场空白剧情,
    规范化剧情状态,
    创建空剧情规划,
    规范化剧情规划状态,
    创建空女主剧情规划,
    规范化女主剧情规划状态,
    创建空同人剧情规划,
    规范化同人剧情规划状态,
    创建空同人女主剧情规划,
    规范化同人女主剧情规划状态,
    创建开场基础状态,
    创建开场命令基态,
    构建前端清空开场状态,
    创建空记忆系统,
    战斗结束自动清空,
    按回合窗口裁剪历史
} from './storyState';

describe('storyState', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('创建开场空白角色', () => {
        it('returns default character structure', () => {
            const char = 创建开场空白角色();
            expect(char.姓名).toBe('');
            expect(char.性别).toBe('男');
            expect(char.年龄).toBe(16);
            expect(char.所属门派ID).toBe('none');
            expect(char.金钱).toEqual({ 金元宝: 0, 银子: 0, 铜钱: 0 });
            expect(char.装备.主武器).toBe('无');
        });
    });

    describe('创建空门派状态', () => {
        it('returns empty sect state', () => {
            const sect = 创建空门派状态();
            expect(sect.ID).toBe('none');
            expect(sect.名称).toBe('无门无派');
            expect(sect.玩家职位).toBe('无');
        });
    });

    describe('创建占位门派状态', () => {
        it('returns empty sect when no门派', () => {
            const char = 创建开场空白角色();
            const sect = 创建占位门派状态(char);
            expect(sect.ID).toBe('none');
        });

        it('returns sect with char data when has门派', () => {
            const char = { ...创建开场空白角色(), 所属门派ID: 'sect_1', 门派职位: '长老', 门派贡献: 500 };
            const sect = 创建占位门派状态(char);
            expect(sect.ID).toBe('sect_1');
            expect(sect.玩家职位).toBe('长老');
            expect(sect.玩家贡献).toBe(500);
        });
    });

    describe('规范化门派状态', () => {
        it('returns empty sect for undefined input', () => {
            const sect = 规范化门派状态(undefined);
            expect(sect.ID).toBe('none');
        });

        it('normalizes partial data', () => {
            const sect = 规范化门派状态({ ID: 'sect_1', 名称: '华山派', 门派资金: '1000' });
            expect(sect.ID).toBe('sect_1');
            expect(sect.名称).toBe('华山派');
            expect(sect.门派资金).toBe(1000);
        });
    });

    describe('创建开场空白环境', () => {
        it('returns default environment', () => {
            const env = 创建开场空白环境();
            expect(env.时间).toBe('1:01:01:00:00');
            expect(env.大地点).toBe('');
            expect(env.天气).toEqual({ 天气: '', 结束日期: '1:01:01:00:00' });
        });
    });

    describe('创建开场空白世界', () => {
        it('returns empty world', () => {
            const world = 创建开场空白世界();
            expect(world.活跃NPC列表).toEqual([]);
            expect(world.待执行事件).toEqual([]);
        });
    });

    describe('规范化世界状态', () => {
        it('returns empty world for undefined', () => {
            const world = 规范化世界状态(undefined);
            expect(world.活跃NPC列表).toEqual([]);
        });

        it('normalizes NPC list', () => {
            const world = 规范化世界状态({
                活跃NPC列表: [{ 姓名: '张三', 当前状态: '行走中' }]
            });
            expect(world.活跃NPC列表).toHaveLength(1);
            expect(world.活跃NPC列表[0].姓名).toBe('张三');
        });

        it('filters empty events', () => {
            const world = 规范化世界状态({
                待执行事件: [{}, { 事件名: 'valid_event' }]
            });
            expect(world.待执行事件).toHaveLength(1);
        });
    });

    describe('创建开场空白战斗', () => {
        it('returns default battle state', () => {
            const battle = 创建开场空白战斗();
            expect(battle.是否战斗中).toBe(false);
            expect(battle.敌方).toEqual([]);
        });
    });

    describe('规范化战斗状态', () => {
        it('returns empty battle for undefined', () => {
            const battle = 规范化战斗状态(undefined);
            expect(battle.是否战斗中).toBe(false);
        });

        it('normalizes enemy entries', () => {
            const battle = 规范化战斗状态({
                是否战斗中: true,
                敌方: [{ 名字: '敌人', 当前血量: 50, 最大血量: 100 }]
            });
            expect(battle.是否战斗中).toBe(true);
            expect(battle.敌方).toHaveLength(1);
            expect(battle.敌方[0].名字).toBe('敌人');
        });
    });

    describe('创建开场空白剧情', () => {
        it('returns empty story', () => {
            const story = 创建开场空白剧情();
            expect(story.当前章节.标题).toBe('');
            expect(story.当前章节.当前分解组).toBe(1);
        });
    });

    describe('规范化剧情状态', () => {
        it('returns empty story for undefined', () => {
            const story = 规范化剧情状态(undefined);
            expect(story.当前章节.标题).toBe('');
        });

        it('normalizes chapter state', () => {
            const story = 规范化剧情状态({
                当前章节: { 标题: '第一章', 当前分解组: 3, 原著推进状态: '推进中' }
            });
            expect(story.当前章节.标题).toBe('第一章');
            expect(story.当前章节.当前分解组).toBe(3);
            expect(story.当前章节.原著推进状态).toBe('推进中');
        });

        it('clamps decomposition group to minimum 1', () => {
            const story = 规范化剧情状态({
                当前章节: { 当前分解组: -5 }
            });
            expect(story.当前章节.当前分解组).toBe(1);
        });
    });

    describe('创建空剧情规划', () => {
        it('returns empty plan', () => {
            const plan = 创建空剧情规划();
            expect(plan.当前章目标).toEqual([]);
            expect(plan.换章规则.本章完成判定).toEqual([]);
        });
    });

    describe('规范化剧情规划状态', () => {
        it('returns empty plan for undefined', () => {
            const plan = 规范化剧情规划状态(undefined);
            expect(plan.当前章目标).toEqual([]);
        });

        it('normalizes task entries', () => {
            const plan = 规范化剧情规划状态({
                当前章任务: [{ 标题: '任务1', 任务说明: '说明' }]
            });
            expect(plan.当前章任务).toHaveLength(1);
        });
    });

    describe('创建空女主剧情规划', () => {
        it('returns empty heroine plan', () => {
            const plan = 创建空女主剧情规划();
            expect(plan.阶段推进).toEqual([]);
        });
    });

    describe('规范化女主剧情规划状态', () => {
        it('returns undefined for non-object', () => {
            expect(规范化女主剧情规划状态(undefined)).toBeUndefined();
            expect(规范化女主剧情规划状态([])).toBeUndefined();
        });

        it('normalizes heroine entries', () => {
            const plan = 规范化女主剧情规划状态({
                女主条目: [{ 女主姓名: '小龙女', 类型: '正宫' }]
            });
            expect(plan?.女主条目).toHaveLength(1);
        });
    });

    describe('创建空同人剧情规划', () => {
        it('returns empty fanfic plan', () => {
            const plan = 创建空同人剧情规划();
            expect(plan.当前对齐信息.当前分解组).toBe(1);
        });
    });

    describe('规范化同人剧情规划状态', () => {
        it('returns undefined for non-object', () => {
            expect(规范化同人剧情规划状态(undefined)).toBeUndefined();
        });

        it('normalizes fanfic plan', () => {
            const plan = 规范化同人剧情规划状态({
                当前章目标: ['目标1', '目标2']
            });
            expect(plan?.当前章目标).toEqual(['目标1', '目标2']);
        });
    });

    describe('创建空同人女主剧情规划', () => {
        it('returns empty fanfic heroine plan', () => {
            const plan = 创建空同人女主剧情规划();
            expect(plan.阶段推进).toEqual([]);
        });
    });

    describe('规范化同人女主剧情规划状态', () => {
        it('returns undefined for non-object', () => {
            expect(规范化同人女主剧情规划状态(null)).toBeUndefined();
        });

        it('normalizes entries', () => {
            const plan = 规范化同人女主剧情规划状态({
                女主条目: [{ 女主姓名: '黄蓉' }]
            });
            expect(plan?.女主条目).toHaveLength(1);
        });
    });

    describe('创建开场基础状态', () => {
        it('returns base opening state', () => {
            const char = 创建开场空白角色();
            const state = 创建开场基础状态(char, {} as any);
            expect(state.角色).toEqual(char);
            expect(state.社交).toEqual([]);
            expect(state.任务列表).toEqual([]);
        });
    });

    describe('创建开场命令基态', () => {
        it('returns opening base state', () => {
            const base = 创建开场命令基态();
            expect(base.角色.姓名).toBe('');
            expect(base.世界.活跃NPC列表).toEqual([]);
        });
    });

    describe('构建前端清空开场状态', () => {
        it('resets all fields to blank', () => {
            const char = 创建开场空白角色();
            const state = 创建开场基础状态(char, {} as any);
            const reset = 构建前端清空开场状态(state);
            expect(reset.角色.姓名).toBe('');
            expect(reset.社交).toEqual([]);
            expect(reset.剧情规划).toEqual(创建空剧情规划());
        });
    });

    describe('创建空记忆系统', () => {
        it('returns empty memory system', () => {
            const memory = 创建空记忆系统();
            expect(memory.回忆档案).toEqual([]);
            expect(memory.即时记忆).toEqual([]);
            expect(memory.短期记忆).toEqual([]);
        });
    });

    describe('战斗结束自动清空', () => {
        it('returns blank battle when not in combat', () => {
            const result = 战斗结束自动清空({ 是否战斗中: false, 敌方: [] });
            expect(result.是否战斗中).toBe(false);
        });

        it('returns blank battle when no alive enemies', () => {
            const result = 战斗结束自动清空({
                是否战斗中: true,
                敌方: [{ 名字: 'dead', 当前血量: 0, 最大血量: 100 }]
            });
            expect(result.是否战斗中).toBe(false);
        });

        it('keeps alive enemies', () => {
            const result = 战斗结束自动清空({
                是否战斗中: true,
                敌方: [
                    { 名字: 'alive', 当前血量: 50, 最大血量: 100 },
                    { 名字: 'dead', 当前血量: 0, 最大血量: 100 }
                ]
            });
            expect(result.敌方).toHaveLength(1);
            expect(result.敌方[0].名字).toBe('alive');
        });
    });

    describe('按回合窗口裁剪历史', () => {
        it('returns empty for zero limit', () => {
            expect(按回合窗口裁剪历史([], 0)).toEqual([]);
        });

        it('returns full history when within limit', () => {
            const history = [
                { role: 'user', content: 'hello' },
                { role: 'assistant', content: 'hi', structuredResponse: true }
            ];
            expect(按回合窗口裁剪历史(history as any, 5)).toHaveLength(2);
        });

        it('trims to last N assistant turns', () => {
            const history = [
                { role: 'user', content: '1' },
                { role: 'assistant', content: 'a', structuredResponse: true },
                { role: 'user', content: '2' },
                { role: 'assistant', content: 'b', structuredResponse: true },
                { role: 'user', content: '3' },
                { role: 'assistant', content: 'c', structuredResponse: true },
            ];
            const result = 按回合窗口裁剪历史(history as any, 2);
            expect(result.length).toBeLessThan(history.length);
        });

        it('handles non-array input', () => {
            expect(按回合窗口裁剪历史(null as any, 5)).toEqual([]);
        });
    });
});
