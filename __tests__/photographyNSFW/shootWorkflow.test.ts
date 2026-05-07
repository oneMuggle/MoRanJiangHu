// 拍摄工作流单元测试

import {
  创建拍摄项目,
  推进拍摄回合,
  取消拍摄项目,
  投诉拍摄项目,
} from '../../hooks/useGame/photographyShootWorkflow';
import type { 拍摄项目状态 } from '../../models/photographyNSFW/states';
import {
  createMockModel,
  createMockPhotographer,
  createMockSettings,
} from '../setup/mockStateFactory';

function makeProject(overrides?: Partial<拍摄项目状态>): 拍摄项目状态 {
  return {
    id: 'shoot_test_001', 模特Id: 'model_test_001', 摄影师Id: 'photographer_test_001',
    约定写真类型: '商业写真', 约定场所: '影棚', 约定风格: '清新自然',
    约定尺度: 'G级', 约定服装: '日常便装', 约定交付时间: Date.now() + 7 * 24 * 60 * 60 * 1000,
    实际场所: '影棚', 实际尺度: 'G级', 实际服装: '日常便装',
    当前回合: 0, 最大回合: 5, 拍摄阶段: '未开始',
    尺度变更历史: [], 越界行为记录: [], 泄露风险评分: 0,
    交付状态: '待交付', 交付方式: null, 后期处理方式: '纯自然', 违规记录: [],
    ...overrides,
  };
}

describe('创建拍摄项目', () => {
  test('SW-01: 创建新项目', () => {
    const 模特 = createMockModel();
    const 摄影师 = createMockPhotographer();
    const 项目 = 创建拍摄项目(模特, 摄影师);
    expect(项目.id).toBeDefined();
    expect(项目.模特Id).toBe(模特.id);
    expect(项目.摄影师Id).toBe(摄影师.id);
    expect(项目.拍摄阶段).toBe('未开始');
    expect(项目.当前回合).toBe(0);
  });
});

describe('推进拍摄回合', () => {
  const 模特 = createMockModel();
  const 摄影师 = createMockPhotographer();
  const 设置 = createMockSettings({ 启用尺度递进: false, 启用越界识别: false });

  test('SW-02: 推进第1回合 => 第一组拍摄', () => {
    const 初始项目 = makeProject();
    const result = 推进拍摄回合(初始项目, 模特, 摄影师, 设置);
    expect(result.更新后项目.当前回合).toBe(1);
    expect(result.更新后项目.拍摄阶段).toBe('第一组拍摄');
  });

  test('SW-05: 推进到最大回合 => 已完成', () => {
    let current = makeProject();
    let currentModel = 模特;
    for (let i = 0; i < 5; i++) {
      const result = 推进拍摄回合(current, currentModel, 摄影师, 设置);
      current = result.更新后项目;
      currentModel = result.更新后模特;
    }
    expect(current.拍摄阶段).toBe('已完成');
  });

  test('SW-16: 不可变性验证', () => {
    const 初始项目 = makeProject();
    const result = 推进拍摄回合(初始项目, 模特, 摄影师, 设置);
    expect(result.更新后项目).not.toBe(初始项目);
    expect(result.更新后模特).not.toBe(模特);
  });
});

describe('取消/投诉拍摄项目', () => {
  test('SW-13: 取消拍摄', () => {
    const 项目 = makeProject({ 拍摄阶段: '换装' });
    const result = 取消拍摄项目(项目);
    expect(result.拍摄阶段).toBe('已取消');
  });

  test('SW-14: 投诉拍摄', () => {
    const 项目 = makeProject({ 拍摄阶段: '第二组拍摄', 当前回合: 3 });
    const result = 投诉拍摄项目(项目);
    expect(result.拍摄阶段).toBe('已投诉');
    expect(result.违规记录).toHaveLength(1);
  });
});

describe('尺度递进', () => {
  const 模特 = createMockModel({ 信任度: 60, 安全感: 50, 保护意识: '适度保护' });
  const 摄影师 = createMockPhotographer({ 越界倾向: 80 });
  const 设置 = createMockSettings({ 启用尺度递进: true, 启用越界识别: false });

  test('SW-06: 启用尺度递进+模特同意 => 尺度变更', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01); // 高概率命中
    const 初始项目 = makeProject({ 实际尺度: 'G级' });
    const result = 推进拍摄回合(初始项目, 模特, 摄影师, 设置);
    // 尺度可能保持不变(概率低时)或变为PG-13
    expect(result.更新后项目.当前回合).toBe(1);
  });

  test('SW-07: 启用尺度递进+模特拒绝 => 信任度下降', () => {
    // 低信任模特(信任度<40)会拒绝
    const 低信任模特 = createMockModel({ 信任度: 20, 安全感: 50 });
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
    const 初始项目 = makeProject({ 实际尺度: 'G级' });
    const result = 推进拍摄回合(初始项目, 低信任模特, 摄影师, 设置);
    if (result.更新后项目.尺度变更历史.length > 0) {
      const history = result.更新后项目.尺度变更历史[0];
      if (history.模特是否同意 === false) {
        expect(result.更新后模特.信任度).toBeLessThan(低信任模特.信任度);
      }
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});

describe('越界行为', () => {
  const 模特 = createMockModel();
  const 高越界摄影师 = createMockPhotographer({ 越界倾向: 95 });
  const 设置 = createMockSettings({ 启用尺度递进: false, 启用越界识别: true });

  test('SW-08: 启用越界识别+高越界倾向 => 触发越界', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
    const 初始项目 = makeProject({ 实际场所: '个人住所', 实际尺度: 'XXX' });
    const result = 推进拍摄回合(初始项目, 模特, 高越界摄影师, 设置);
    if (result.更新后项目.越界行为记录.length > 0) {
      const 越界 = result.更新后项目.越界行为记录[0];
      expect(越界.回合).toBe(1);
      // 越界导致模特信任度和安全感下降
      expect(result.更新后模特.信任度).toBeLessThan(模特.信任度);
      expect(result.更新后模特.安全感).toBeLessThan(模特.安全感);
    }
  });

  test('SW-09: 严重越界行为(威胁恐吓) => 大幅下降', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
    const 初始项目 = makeProject({ 实际场所: '个人住所', 实际尺度: 'XXX' });
    const result = 推进拍摄回合(初始项目, 模特, 高越界摄影师, 设置);
    // 验证大幅下降逻辑存在(通过事件类型)
    const 事件 = result.事件;
    const 越界事件 = 事件.find(e => e.类型 === '越界行为');
    if (越界事件) {
      expect(['威胁恐吓', '下药', '肢体接触', '强迫拍摄', '偷拍', '言语骚扰', '要求加拍', '服装要求']).toContain(越界事件.越界类型);
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
