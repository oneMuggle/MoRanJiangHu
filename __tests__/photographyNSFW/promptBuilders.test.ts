// 提示词构建函数单元测试

import {
  构建玩法层约束,
  构建拍摄场景约束,
  构建模特心理约束,
  构建摄影师行为约束,
  构建尺度递进约束,
  构建越界识别约束,
  构建照片交付约束,
  构建泄露事件约束,
  构建状态输出要求,
  构建BDSM联动约束,
  构建写真NSFW完整叙事约束,
} from '../../prompts/runtime/photographyNSFW';

describe('构建玩法层约束', () => {
  test('PB-01: 灰色地带 + 露骨', () => {
    const result = 构建玩法层约束('灰色地带', '露骨');
    expect(result).toContain('灰色地带');
    expect(result).toContain('露骨');
    expect(result).toContain('可使用明确');
  });

  test('PB-02: 经营管理 + 微暗', () => {
    const result = 构建玩法层约束('经营管理', '微暗');
    expect(result).toContain('经营');
    expect(result).toContain('微暗');
    expect(result).toContain('氛围和情感为主');
  });
});

describe('构建拍摄场景约束', () => {
  test('PB-03: 酒店 + 私房暧昧', () => {
    const result = 构建拍摄场景约束('私房照', '酒店', '私房暧昧', 'R级', '性感内衣', '第一组拍摄');
    expect(result).toContain('酒店');
    expect(result).toContain('私房暧昧');
    expect(result).toContain('私密');
  });
});

describe('构建模特心理约束', () => {
  test('PB-04: 信任度=90 => 高度信任', () => {
    const result = 构建模特心理约束('张三', '适度保护', 90, 85, 'G级');
    expect(result).toContain('高度信任');
  });

  test('PB-05: 信任度=10 => 极度不信任', () => {
    const result = 构建模特心理约束('李四', '适度保护', 10, 20, 'G级');
    expect(result).toContain('极度不信任');
  });
});

describe('构建摄影师行为约束', () => {
  test('PB-06: 越界倾向=90 => 越界倾向极高', () => {
    const result = 构建摄影师行为约束('王五', '普通摄影师', 90);
    expect(result).toContain('越界倾向极高');
  });
});

describe('构建尺度递进约束', () => {
  test('PB-07: 微暗 + G级 => 可用尺度G级和PG-13', () => {
    const result = 构建尺度递进约束('微暗', 'G级');
    expect(result).toContain('G级');
    expect(result).toContain('PG-13');
    expect(result).not.toContain('R级');
  });

  test('PB-08: 露骨 + G级 => 可用尺度包含全部5级', () => {
    const result = 构建尺度递进约束('露骨', 'G级');
    expect(result).toContain('G级');
    expect(result).toContain('PG-13');
    expect(result).toContain('R级');
    expect(result).toContain('NC-17');
    expect(result).toContain('XXX');
  });
});

describe('构建越界识别约束', () => {
  test('PB-09: 启用安全词=true => 包含安全词系统', () => {
    const result = 构建越界识别约束(true, false);
    expect(result).toContain('安全词系统');
  });

  test('PB-10: 启用道德选择=true => 包含道德选择系统', () => {
    const result = 构建越界识别约束(false, true);
    expect(result).toContain('道德选择系统');
  });
});

describe('构建照片交付约束', () => {
  test('PB-11: 输出包含所有5种交付方式', () => {
    const result = 构建照片交付约束();
    expect(result).toContain('平台担保');
    expect(result).toContain('直接交付');
    expect(result).toContain('分期交付');
    expect(result).toContain('拖延交付');
    expect(result).toContain('拒绝交付');
  });
});

describe('构建泄露事件约束', () => {
  test('PB-12: 频率=高 => 包含盗取传播', () => {
    const result = 构建泄露事件约束('高');
    expect(result).toContain('高');
    expect(result).toContain('盗取传播');
  });
});

describe('构建状态输出要求', () => {
  test('PB-13: 输出包含写真系统状态格式', () => {
    const result = 构建状态输出要求();
    expect(result).toContain('<写真系统状态>');
    expect(result).toContain('更新模特档案');
  });
});

describe('构建BDSM联动约束', () => {
  test('PB-14: 关系阶段=深入 + 2个把柄', () => {
    const result = 构建BDSM联动约束('深入', ['photo1', 'photo2']);
    expect(result).toContain('权力动态');
    expect(result).toContain('2');
  });
});

describe('构建写真NSFW完整叙事约束', () => {
  test('PB-15: 全参数输出包含所有子组件', () => {
    const result = 构建写真NSFW完整叙事约束({
      写真类型: '私房照',
      拍摄场所: '酒店',
      拍摄风格: '私房暧昧',
      当前尺度: 'R级',
      模特姓名: '张三',
      模特保护意识: '适度保护',
      模特信任度: 70,
      模特安全感: 65,
      摄影师姓名: '李四',
      摄影师信誉: '普通摄影师',
      摄影师越界倾向: 40,
      内容强度: '暧昧',
      主要玩法层: '灰色地带',
      启用尺度递进: true,
      启用越界识别: true,
      启用安全词系统: true,
      启用照片交付: true,
      启用泄露事件: true,
      泄露事件频率: '中',
      启用道德选择: true,
      涉及BDSM: true,
      BDSM关系阶段: '深入',
      照片把柄: ['p1'],
    });
    expect(result).toContain('写真类型');
    expect(result).toContain('模特心理');
    expect(result).toContain('摄影师');
    expect(result).toContain('尺度递进');
    expect(result).toContain('越界识别');
    expect(result).toContain('照片交付');
    expect(result).toContain('泄露事件');
    expect(result).toContain('BDSM');
  });

  test('PB-16: 空参数只输出状态输出要求', () => {
    const result = 构建写真NSFW完整叙事约束({});
    expect(result).toContain('状态输出要求');
    expect(result).not.toContain('玩法层');
  });
});
