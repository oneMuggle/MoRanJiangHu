// 泄露工作流单元测试

import {
  检查泄露事件,
  推进泄露传播,
  应对泄露事件,
} from '../../hooks/useGame/photographyLeakWorkflow';
import { 创建默认摄影师 } from '../../hooks/useGame/photographyNSFWEngine';
import {
  createMockShootProject,
  createMockLeakEvent,
  createMockModel,
  createMockSettings,
} from '../setup/mockStateFactory';

describe('检查泄露事件', () => {
  test('LW-01: 泄露事件关闭返回null', () => {
    const 项目 = createMockShootProject();
    const 摄影师 = 创建默认摄影师('p1', 'test');
    const 设置 = createMockSettings({ 启用泄露事件: false });
    const result = 检查泄露事件(项目, 摄影师, 设置);
    expect(result).toBeNull();
  });

  test('LW-02: 风险低+频率低大概率不触发', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const 项目 = createMockShootProject({ 实际场所: '影棚', 实际尺度: 'G级', 交付方式: '平台担保' });
    const 摄影师 = 创建默认摄影师('p1', 'test', '独立摄影师', '纯艺术');
    const 设置 = createMockSettings({ 启用泄露事件: true, 泄露事件频率: '低' });
    const result = 检查泄露事件(项目, 摄影师, 设置);
    expect(result).toBeNull();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});

describe('推进泄露传播', () => {
  test('LW-04: 推进1回合传播回合+1', () => {
    const 事件 = createMockLeakEvent();
    const 模特 = createMockModel();
    const result = 推进泄露传播(事件, 模特);
    expect(result.更新后事件.传播回合).toBe(1);
  });

  test('LW-05: 传播影响封顶100', () => {
    const 事件 = createMockLeakEvent({ 心理影响: 95, 名誉影响: 96, 职业影响: 97, 生活影响: 98 });
    const 模特 = createMockModel();
    const result = 推进泄露传播(事件, 模特);
    expect(result.更新后事件.心理影响).toBeLessThanOrEqual(100);
    expect(result.更新后事件.名誉影响).toBeLessThanOrEqual(100);
    expect(result.更新后事件.职业影响).toBeLessThanOrEqual(100);
    expect(result.更新后事件.生活影响).toBeLessThanOrEqual(100);
  });

  test('LW-06: 传播回合>3小范围升级到论坛传播', () => {
    const 事件 = createMockLeakEvent({ 传播回合: 3, 传播范围: '小范围' });
    const 模特 = createMockModel();
    const result = 推进泄露传播(事件, 模特);
    expect(result.更新后事件.传播回合).toBe(4);
    expect(result.更新后事件.传播范围).toBe('论坛传播');
  });

  test('LW-09: 影响<20事件平息', () => {
    const 事件 = createMockLeakEvent({ 心理影响: 5, 名誉影响: 5 });
    const 模特 = createMockModel();
    const result = 推进泄露传播(事件, 模特);
    expect(result.更新后事件.状态).toBe('已平息');
  });

  test('LW-10: 心理影响>=80事件发酵', () => {
    const 事件 = createMockLeakEvent({ 心理影响: 90, 名誉影响: 0 });
    const 模特 = createMockModel();
    const result = 推进泄露传播(事件, 模特);
    // 初始90 + 传播增长(至少5) = 95 >= 80 => 发酵
    expect(result.更新后事件.状态).toBe('已发酵');
  });

  test('LW-17: 不可变性', () => {
    const 事件 = createMockLeakEvent();
    const 模特 = createMockModel();
    const result = 推进泄露传播(事件, 模特);
    expect(result.更新后事件).not.toBe(事件);
    expect(result.更新后模特).not.toBe(模特);
  });
});

describe('应对泄露事件', () => {
  test('LW-11: 法律维权 => 有效', () => {
    const 事件 = createMockLeakEvent();
    const result = 应对泄露事件(事件, '法律维权');
    expect(result.应对效果).toBe('有效');
  });

  test('LW-12: 公开澄清 + 名誉影响<50 => 有效', () => {
    const 事件 = createMockLeakEvent({ 名誉影响: 30 });
    const result = 应对泄露事件(事件, '公开澄清');
    expect(result.应对效果).toBe('有效');
  });

  test('LW-13: 公开澄清 + 名誉影响>=50 => 部分有效', () => {
    const 事件 = createMockLeakEvent({ 名誉影响: 60 });
    const result = 应对泄露事件(事件, '公开澄清');
    expect(result.应对效果).toBe('部分有效');
  });

  test('LW-14: 沉默忍受 + 小范围 => 部分有效', () => {
    const 事件 = createMockLeakEvent({ 传播范围: '小范围' });
    const result = 应对泄露事件(事件, '沉默忍受');
    expect(result.应对效果).toBe('部分有效');
  });

  test('LW-15: 沉默忍受 + 全网扩散 => 无效', () => {
    const 事件 = createMockLeakEvent({ 传播范围: '全网扩散' });
    const result = 应对泄露事件(事件, '沉默忍受');
    expect(result.应对效果).toBe('无效');
  });

  test('LW-16: 主动承认 + 心理影响<60 => 有效', () => {
    const 事件 = createMockLeakEvent({ 心理影响: 40 });
    const result = 应对泄露事件(事件, '主动承认');
    expect(result.应对效果).toBe('有效');
  });
});
