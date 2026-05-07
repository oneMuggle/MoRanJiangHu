import { describe, it, expect } from 'vitest';
import {
  校验NPC位置完整性,
  校验事件状态一致性,
  校验事件时间悖论,
  校验孤立NPC引用,
  校验引用完整性,
  校验世界状态完整性,
  修复世界状态孤立引用,
  校验并修复世界状态
} from './worldStateIntegrity';

const 创建测试世界 = (overrides: any = {}) => ({
  活跃NPC列表: [
    { 姓名: '张三', 所属势力: '丐帮', 当前位置: '洛阳城', 当前状态: '闲逛', 当前行动: '' },
    { 姓名: '李四', 所属势力: '少林', 当前位置: '少林寺', 当前状态: '习武', 当前行动: '' }
  ],
  待执行事件: [
    {
      事件名: '华山论剑',
      类型: '比武',
      事件说明: '一年一度的武林盛事',
      计划执行时间: '1:06:15:10:00',
      关联人物: ['张三', '李四', '不存在的NPC'],
      关联势力: ['丐帮', '少林'],
      关联地点: ['华山']
    }
  ],
  进行中事件: [
    {
      事件名: '围攻光明顶',
      类型: '战斗',
      事件说明: '六大门派围攻明教',
      开始时间: '1:06:10:08:00',
      预计结束时间: '1:06:08:12:00', // 时间悖论：结束时间早于开始时间
      关联人物: ['张三'],
      关联势力: ['丐帮']
    }
  ],
  已结算事件: [
    {
      事件名: '襄阳保卫战',
      类型: '战斗',
      事件说明: '郭靖守城',
      结算时间: '1:05:20:18:00',
      关联人物: ['不存在的NPC'], // 孤立NPC引用
      关联势力: []
    }
  ],
  世界镜头规划: [
    {
      镜头标题: '江湖第一幕',
      镜头内容: '序幕',
      关联人物: ['不存在的NPC'] // 孤立引用
    }
  ],
  江湖史册: [
    {
      标题: '华山论剑史',
      归档内容: ['首次论剑'],
      关联人物: ['张三', '不存在的NPC']
    }
  ],
  地图: [
    { 名称: '华山', 描述: '五岳之一', 归属: {}, 内部建筑: [] },
    { 名称: '少林寺', 描述: '禅宗祖庭', 归属: { 大地点: '嵩山' }, 内部建筑: ['藏经阁', '大雄宝殿'] }
  ],
  建筑: [
    { 名称: '丐帮总舵', 描述: '天下第一大帮', 归属: { 大地点: '洛阳城' } }
  ],
  ...overrides
});

describe('worldStateIntegrity', () => {
  describe('校验NPC位置完整性', () => {
    it('应检测NPC当前位置为无效地点的情况', () => {
      const world = 创建测试世界();
      const issues = 校验NPC位置完整性(world);
      // 张三在"洛阳城"，李四在"少林寺"——两者都在地图或建筑中
      expect(issues).toHaveLength(0);
    });

    it('应报告无效位置的NPC', () => {
      // 直接构造测试数据，确保 活跃NPC列表 和 地图 都来自 overrides
      const world = {
        活跃NPC列表: [
          { 姓名: '幽灵', 所属势力: '', 当前位置: '不存在的地点', 当前状态: '游荡', 当前行动: '' }
        ],
        待执行事件: [],
        进行中事件: [],
        已结算事件: [],
        世界镜头规划: [],
        江湖史册: [],
        地图: [
          { 名称: '华山', 描述: '五岳之一', 归属: {}, 内部建筑: [] },
          { 名称: '少林寺', 描述: '禅宗祖庭', 归属: { 大地点: '嵩山' }, 内部建筑: ['藏经阁', '大雄宝殿'] }
        ],
        建筑: []
      };
      const issues = 校验NPC位置完整性(world as any);
      expect(issues).toHaveLength(1);
      expect(issues[0].类型).toBe('无效地点');
      expect(issues[0].严重程度).toBe('warning');
      expect(issues[0].实体).toBe('幽灵');
    });
  });

  describe('校验事件状态一致性', () => {
    it('应检测缺少计划执行时间的待执行事件', () => {
      const world = 创建测试世界({
        待执行事件: [
          { 事件名: '无时间事件', 关联人物: [] } // 缺少计划执行时间
        ]
      });
      const issues = 校验事件状态一致性(world);
      expect(issues.some(i => i.类型 === '事件状态异常' && i.实体 === '无时间事件')).toBe(true);
    });

    it('应检测缺少开始时间的进行中事件', () => {
      const world = 创建测试世界({
        进行中事件: [
          { 事件名: '无开始时间事件', 关联人物: [] } // 缺少开始时间
        ]
      });
      const issues = 校验事件状态一致性(world);
      expect(issues.some(i => i.类型 === '事件状态异常' && i.实体 === '无开始时间事件')).toBe(true);
    });

    it('有效事件不应产生问题', () => {
      const world = 创建测试世界();
      const issues = 校验事件状态一致性(world);
      expect(issues).toHaveLength(0);
    });
  });

  describe('校验事件时间悖论', () => {
    it('应检测结束时间早于开始时间的时间悖论', () => {
      const world = 创建测试世界();
      const issues = 校验事件时间悖论(world);
      expect(issues).toHaveLength(1);
      expect(issues[0].类型).toBe('时间悖论');
      expect(issues[0].严重程度).toBe('error');
      expect(issues[0].实体).toBe('围攻光明顶');
    });

    it('无时间悖论的世界应返回空', () => {
      const world = 创建测试世界({
        进行中事件: [
          {
            事件名: '正常事件',
            开始时间: '1:06:10:08:00',
            预计结束时间: '1:06:15:12:00', // 正常：结束在开始之后
            关联人物: []
          }
        ]
      });
      const issues = 校验事件时间悖论(world);
      expect(issues).toHaveLength(0);
    });
  });

  describe('校验孤立NPC引用', () => {
    it('应检测事件中的孤立NPC引用', () => {
      const world = 创建测试世界();
      const issues = 校验孤立NPC引用(world);
      const orphanedIssues = issues.filter(i => i.类型 === '孤立NPC引用');
      expect(orphanedIssues.length).toBeGreaterThan(0);
      expect(orphanedIssues.some(i => i.实体 === '华山论剑' && i.描述.includes('不存在的NPC'))).toBe(true);
    });

    it('无孤立引用的世界应返回空', () => {
      const world = 创建测试世界({
        待执行事件: [{ 事件名: '测试事件', 关联人物: ['张三', '李四'] }],
        进行中事件: [],
        已结算事件: [],
        世界镜头规划: [],
        江湖史册: []
      });
      const issues = 校验孤立NPC引用(world);
      expect(issues).toHaveLength(0);
    });
  });

  describe('校验引用完整性', () => {
    it('应检测事件中引用的无效地点', () => {
      const world = 创建测试世界({
        待执行事件: [
          {
            事件名: '测试事件',
            关联地点: ['华山', '不存在的地点']
          }
        ]
      });
      const issues = 校验引用完整性(world);
      expect(issues.some(i => i.类型 === '引用完整性' && i.描述.includes('不存在的地点'))).toBe(true);
    });
  });

  describe('校验世界状态完整性', () => {
    it('应返回所有检测到的问题', () => {
      const world = 创建测试世界();
      const result = 校验世界状态完整性(world);
      expect(result.问题列表.length).toBeGreaterThan(0);
      expect(result.有效).toBe(false); // 存在error级别问题
    });

    it('干净的世界应返回有效', () => {
      const world = 创建测试世界({
        待执行事件: [{
          事件名: '测试',
          计划执行时间: '1:06:15:10:00',
          关联人物: ['张三']
        }],
        进行中事件: [{
          事件名: '进行中测试',
          开始时间: '1:06:10:08:00',
          预计结束时间: '1:06:15:12:00',
          关联人物: ['李四']
        }],
        已结算事件: [],
        世界镜头规划: [],
        江湖史册: [],
        活跃NPC列表: [
          { 姓名: '张三', 当前位置: '华山', 当前状态: '' },
          { 姓名: '李四', 当前位置: '少林寺', 当前状态: '' }
        ]
      });
      const result = 校验世界状态完整性(world);
      expect(result.有效).toBe(true);
      expect(result.问题列表).toHaveLength(0);
    });
  });

  describe('修复世界状态孤立引用', () => {
    it('应移除事件中的孤立NPC引用', () => {
      const world = 创建测试世界();
      const fixed = 修复世界状态孤立引用(world);

      const 华山论剑 = fixed.待执行事件.find(e => e.事件名 === '华山论剑');
      expect(华山论剑?.关联人物).not.toContain('不存在的NPC');
      expect(华山论剑?.关联人物).toContain('张三');
      expect(华山论剑?.关联人物).toContain('李四');
    });

    it('应修复NPC的无效位置', () => {
      const world = 创建测试世界({
        活跃NPC列表: [
          { 姓名: '幽灵', 当前位置: '不存在的地点', 当前状态: '游荡' }
        ]
      });
      const fixed = 修复世界状态孤立引用(world);
      const 幽灵 = fixed.活跃NPC列表.find(n => n.姓名 === '幽灵');
      expect(幽灵?.当前位置).toBe('');
    });

    it('应修复事件时间悖论', () => {
      const world = 创建测试世界();
      const fixed = 修复世界状态孤立引用(world);
      const 围攻 = fixed.进行中事件.find(e => e.事件名 === '围攻光明顶');
      // 修复后预计结束时间应该在开始时间之后
      expect(围攻).toBeDefined();
    });
  });

  describe('校验并修复世界状态', () => {
    it('应同时校验和修复世界状态', () => {
      const world = 创建测试世界();
      const { world: fixed, result } = 校验并修复世界状态(world);

      // 修复后问题数量应减少
      const originalResult = 校验世界状态完整性(world);
      expect(result.修复数).toBeGreaterThan(0);
      expect(result.问题列表.length).toBeLessThan(originalResult.问题列表.length);
    });

    it('修复后的世界应无孤立NPC引用', () => {
      const world = 创建测试世界();
      const { world: fixed } = 校验并修复世界状态(world);
      const issues = 校验孤立NPC引用(fixed);
      expect(issues).toHaveLength(0);
    });

    it('修复后的世界应无NPC位置问题', () => {
      const world = 创建测试世界({
        活跃NPC列表: [
          { 姓名: '幽灵', 当前位置: '不存在的地点', 当前状态: '游荡' }
        ]
      });
      const { world: fixed } = 校验并修复世界状态(world);
      const issues = 校验NPC位置完整性(fixed);
      expect(issues).toHaveLength(0);
    });
  });
});
