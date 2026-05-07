// 引擎纯函数单元测试

import {
  评估泄露风险,
  计算尺度递进概率,
  判定是否尺度递进,
  下一尺度,
  判定越界行为,
  计算摄影师口碑评分,
  筛选摄影师,
  判定泄露事件,
  创建默认模特,
  创建默认摄影师,
  创建默认拍摄项目,
  创建默认泄露事件,
} from '../../hooks/useGame/photographyNSFWEngine';
import {
  createMockModel,
  createMockPhotographer,
  createMockShootProject,
} from '../setup/mockStateFactory';

describe('评估泄露风险', () => {
  test('E-01: 影棚 + G级 + 业界大佬 + 平台担保 => 低风险', () => {
    const 项目 = createMockShootProject({ 实际场所: '影棚', 实际尺度: 'G级', 交付方式: '平台担保' });
    const 摄影师 = createMockPhotographer({ 信誉: '业界大佬' });
    const result = 评估泄露风险(项目, 摄影师);
    expect(result).toBeLessThanOrEqual(20);
  });

  test('E-02: 个人住所 + XXX + 惯犯 + null交付 => 高风险', () => {
    const 项目 = createMockShootProject({ 实际场所: '个人住所', 实际尺度: 'XXX', 交付方式: null });
    const 摄影师 = createMockPhotographer({ 信誉: '惯犯' });
    const result = 评估泄露风险(项目, 摄影师);
    // null交付默认30: 80*0.20 + 95*0.30 + 95*0.25 + 30*0.25 = 76
    expect(result).toBeGreaterThanOrEqual(70);
  });

  test('E-03: 酒店 + R级 + 普通摄影师 + 直接交付 => 中风险', () => {
    const 项目 = createMockShootProject({ 实际场所: '酒店', 实际尺度: 'R级', 交付方式: '直接交付' });
    const 摄影师 = createMockPhotographer({ 信誉: '普通摄影师' });
    const result = 评估泄露风险(项目, 摄影师);
    expect(result).toBeGreaterThanOrEqual(30);
    expect(result).toBeLessThanOrEqual(70);
  });

  test('E-06: 返回值始终在 0-100 范围内', () => {
    const scenarios = [
      { 场所: '影棚' as const, 尺度: 'G级' as const, 信誉: '业界大佬' as const, 交付: '平台担保' as const },
      { 场所: '个人住所' as const, 尺度: 'XXX' as const, 信誉: '惯犯' as const, 交付: null as const },
      { 场所: '野外' as const, 尺度: 'NC-17' as const, 信誉: '名声较差' as const, 交付: '直接交付' as const },
    ];
    for (const s of scenarios) {
      const 项目 = createMockShootProject({ 实际场所: s.场所, 实际尺度: s.尺度, 交付方式: s.交付 });
      const 摄影师 = createMockPhotographer({ 信誉: s.信誉 });
      const result = 评估泄露风险(项目, 摄影师);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    }
  });

  test('E-07: 权重公式精确验证', () => {
    const 项目 = createMockShootProject({ 实际场所: '影棚', 实际尺度: 'G级', 交付方式: '平台担保' });
    const 摄影师 = createMockPhotographer({ 信誉: '普通摄影师' });
    const result = 评估泄露风险(项目, 摄影师);
    const expected = Math.round(10 * 0.20 + 10 * 0.30 + 30 * 0.25 + 5 * 0.25);
    expect(result).toBe(expected);
  });
});

describe('计算尺度递进概率', () => {
  test('E-08: 越界倾向=0 + 极度保护 + G级 => 低概率', () => {
    const result = 计算尺度递进概率(0, '极度保护', 'G级');
    // 0.30 * 1 * 0.5 = 0.15
    expect(result).toBeLessThanOrEqual(0.15);
  });

  test('E-09: 越界倾向=100 + 开放型 + G级 => 高概率', () => {
    const result = 计算尺度递进概率(100, '开放型', 'G级');
    expect(result).toBeGreaterThan(0.40);
  });

  test('E-10: XXX尺度的概率 <= G级尺度的概率', () => {
    const g级 = 计算尺度递进概率(50, '适度保护', 'G级');
    const xxx = 计算尺度递进概率(50, '适度保护', 'XXX');
    expect(xxx).toBeLessThanOrEqual(g级);
  });
});

describe('判定是否尺度递进', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('E-11: random < 概率 => true', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.3);
    expect(判定是否尺度递进(0.5)).toBe(true);
  });

  test('E-12: random >= 概率 => false', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.7);
    expect(判定是否尺度递进(0.5)).toBe(false);
  });
});

describe('下一尺度', () => {
  test('E-13: G级 -> PG-13', () => {
    expect(下一尺度('G级')).toBe('PG-13');
  });

  test('E-14: XXX 已达上限', () => {
    expect(下一尺度('XXX')).toBe('XXX');
  });

  test('E-15: 完整递进链', () => {
    expect(下一尺度('G级')).toBe('PG-13');
    expect(下一尺度('PG-13')).toBe('R级');
    expect(下一尺度('R级')).toBe('NC-17');
    expect(下一尺度('NC-17')).toBe('XXX');
    expect(下一尺度('XXX')).toBe('XXX');
  });
});

describe('判定越界行为', () => {
  test('E-16: 影棚 + G级 + 纯艺术(低越界倾向) => 大概率null', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const 摄影师 = createMockPhotographer({ 越界倾向: 5 });
    const result = 判定越界行为(摄影师, '影棚', 'G级');
    expect(result).toBeNull();
  });

  test('E-17: 个人住所 + XXX + 偷拍动机(高越界倾向) => 大概率非null', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
    const 摄影师 = createMockPhotographer({ 越界倾向: 90 });
    const result = 判定越界行为(摄影师, '个人住所', 'XXX');
    expect(result).not.toBeNull();
  });

  test('E-18: 返回类型合法', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
    const 摄影师 = createMockPhotographer({ 越界倾向: 90 });
    const result = 判定越界行为(摄影师, '个人住所', 'XXX');
    const 合法值 = ['言语骚扰', '要求加拍', '服装要求', '肢体接触', '强迫拍摄', '偷拍', '威胁恐吓', '下药'];
    if (result !== null) {
      expect(合法值).toContain(result);
    }
  });
});

describe('计算摄影师口碑评分', () => {
  test('E-21: 高水平 + 业界大佬 + 0投诉 + 10回头客 => 接近100', () => {
    const 摄影师 = createMockPhotographer({
      技术水平: 100, 沟通能力: 100, 信誉: '业界大佬',
      投诉累计: 0, 回头客数量: 10,
    });
    const result = 计算摄影师口碑评分(摄影师);
    expect(result).toBeGreaterThanOrEqual(90);
  });

  test('E-22: 低水平 + 惯犯 + 10投诉 + 0回头客 => 接近0', () => {
    const 摄影师 = createMockPhotographer({
      技术水平: 0, 沟通能力: 0, 信誉: '惯犯',
      投诉累计: 10, 回头客数量: 0,
    });
    const result = 计算摄影师口碑评分(摄影师);
    expect(result).toBeLessThanOrEqual(5);
  });

  test('E-23: 投诉惩罚精确验证', () => {
    const base = createMockPhotographer({ 技术水平: 50, 沟通能力: 50, 信誉: '普通摄影师', 投诉累计: 0 });
    const r1 = 计算摄影师口碑评分(base);
    const withComplaint = createMockPhotographer({ 技术水平: 50, 沟通能力: 50, 信誉: '普通摄影师', 投诉累计: 1 });
    const r2 = 计算摄影师口碑评分(withComplaint);
    expect(r1 - r2).toBe(5);
  });

  test('E-25: 返回值始终 0-100', () => {
    const cases = [
      { 技术: 100, 沟通: 100, 信誉: '业界大佬' as const, 投诉: 0, 回头客: 100 },
      { 技术: 0, 沟通: 0, 信誉: '惯犯' as const, 投诉: 100, 回头客: 0 },
    ];
    for (const c of cases) {
      const p = createMockPhotographer({ 技术水平: c.技术, 沟通能力: c.沟通, 信誉: c.信誉, 投诉累计: c.投诉, 回头客数量: c.回头客 });
      const r = 计算摄影师口碑评分(p);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(100);
    }
  });
});

describe('筛选摄影师', () => {
  test('E-26: 极度保护过滤口碑<50', () => {
    const list = [
      createMockPhotographer({ 口碑评分: 60 }),
      createMockPhotographer({ 口碑评分: 40 }),
    ];
    const result = 筛选摄影师(list, '极度保护');
    expect(result).toHaveLength(1);
    expect(result[0].口碑评分).toBe(60);
  });

  test('E-28: 开放型不过滤按口碑降序', () => {
    const list = [
      createMockPhotographer({ 口碑评分: 10 }),
      createMockPhotographer({ 口碑评分: 80 }),
    ];
    const result = 筛选摄影师(list, '开放型');
    expect(result).toHaveLength(2);
    expect(result[0].口碑评分).toBe(80);
    expect(result[1].口碑评分).toBe(10);
  });

  test('空列表返回空', () => {
    expect(筛选摄影师([], '适度保护')).toEqual([]);
  });
});

describe('判定泄露事件', () => {
  test('E-31: 风险值=10 + 频率=低 => 大概率不触发', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const result = 判定泄露事件(10, '低');
    expect(result.触发).toBe(false);
  });

  test('E-36: 频率系数验证', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const low = 判定泄露事件(50, '低');
    const mid = 判定泄露事件(50, '中');
    expect(low.触发).toBe(false);
    expect(mid.触发).toBe(true);
  });

  test('E-33: 不触发时返回固定值', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const result = 判定泄露事件(10, '低');
    expect(result).toEqual({ 触发: false, 类型: '意外泄露', 传播范围: '未传播' });
  });
});

describe('工厂函数', () => {
  test('E-37: 创建默认模特', () => {
    const m = 创建默认模特('m1', '张三');
    expect(m.id).toBe('m1');
    expect(m.姓名).toBe('张三');
    expect(m.当前底线).toBe('G级');
    expect(m.安全感).toBe(60);
  });

  test('E-38: 创建默认摄影师越界倾向', () => {
    const p = 创建默认摄影师('p1', '李四', '独立摄影师', '纯艺术');
    expect(p.越界倾向).toBe(5);
    expect(p.口碑评分).toBeGreaterThan(0);
  });

  test('E-39: 创建默认拍摄项目', () => {
    const s = 创建默认拍摄项目('s1', 'm1', 'p1');
    expect(s.id).toBe('s1');
    expect(s.模特Id).toBe('m1');
    expect(s.拍摄阶段).toBe('未开始');
    expect(s.约定交付时间).toBeGreaterThan(Date.now());
  });

  test('E-40: 创建默认泄露事件', () => {
    const e = 创建默认泄露事件('l1', 's1', 'm1');
    expect(e.id).toBe('l1');
    expect(e.状态).toBe('活跃');
    expect(e.传播回合).toBe(0);
  });

  test('E-41: 工厂函数返回新对象(不可变性)', () => {
    const m1 = 创建默认模特('m1', 'A');
    const m2 = 创建默认模特('m1', 'A');
    expect(m1).not.toBe(m2);
  });
});
