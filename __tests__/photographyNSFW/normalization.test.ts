// 规范化函数单元测试

import { 规范化写真NSFW设置 } from '../../models/photographyNSFW/normalization';

describe('规范化写真NSFW设置', () => {
  test('N-01: 空对象返回全部默认值', () => {
    const result = 规范化写真NSFW设置({});
    expect(result.启用写真NSFW系统).toBe(false);
    expect(result.NSFW内容强度).toBe('微暗');
    expect(result.主要玩法层).toBe('灰色地带');
    expect(result.次要玩法权重).toBe(30);
    expect(result.启用道德选择).toBe(false);
    expect(result.启用尺度递进).toBe(false);
    expect(result.启用摄影师筛选).toBe(false);
    expect(result.启用越界识别).toBe(false);
    expect(result.启用安全词系统).toBe(false);
    expect(result.启用照片交付).toBe(false);
    expect(result.启用泄露事件).toBe(false);
    expect(result.泄露事件频率).toBe('低');
    expect(result.涉及BDSM模块).toBe(false);
  });

  test('N-02: 完整合法设置原样返回', () => {
    const input = {
      启用写真NSFW系统: true,
      NSFW内容强度: '暧昧',
      主要玩法层: '人际关系',
      次要玩法权重: 75,
      启用道德选择: true,
      启用尺度递进: true,
      启用摄影师筛选: true,
      启用越界识别: true,
      启用安全词系统: true,
      启用照片交付: true,
      启用泄露事件: true,
      泄露事件频率: '中',
      涉及BDSM模块: true,
    };
    const result = 规范化写真NSFW设置(input);
    expect(result).toEqual(input);
  });

  test('N-03: 布尔类型校验 — 字符串回退到默认', () => {
    const result = 规范化写真NSFW设置({ 启用写真NSFW系统: 'true' as unknown as boolean });
    expect(result.启用写真NSFW系统).toBe(false);
  });

  test('N-04: NSFW内容强度枚举校验 — 非法值回退到默认', () => {
    const result = 规范化写真NSFW设置({ NSFW内容强度: '过度' as unknown as '微暗' | '暧昧' | '露骨' });
    expect(result.NSFW内容强度).toBe('微暗');
  });

  test('N-05: 次要玩法权重上界限制', () => {
    const result = 规范化写真NSFW设置({ 次要玩法权重: 150 });
    expect(result.次要玩法权重).toBe(100);
  });

  test('N-06: 次要玩法权重下界限制', () => {
    const result = 规范化写真NSFW设置({ 次要玩法权重: -10 });
    expect(result.次要玩法权重).toBe(0);
  });

  test('N-07: 主要玩法层合法值正确保留', () => {
    const result = 规范化写真NSFW设置({ 主要玩法层: '经营管理' });
    expect(result.主要玩法层).toBe('经营管理');
  });

  test('N-08: 泄露事件频率枚举校验 — 非法值回退', () => {
    const result = 规范化写真NSFW设置({ 泄露事件频率: '超高' as unknown as '低' | '中' | '高' });
    expect(result.泄露事件频率).toBe('低');
  });

  test('N-09: 部分字段 null/undefined 使用默认值', () => {
    const result = 规范化写真NSFW设置({
      启用写真NSFW系统: true,
      NSFW内容强度: undefined,
      主要玩法层: null as unknown as undefined,
    });
    expect(result.启用写真NSFW系统).toBe(true);
    expect(result.NSFW内容强度).toBe('微暗');
    expect(result.主要玩法层).toBe('灰色地带');
  });

  test('N-10: 涉及BDSM模块数字类型回退到默认', () => {
    const result = 规范化写真NSFW设置({ 涉及BDSM模块: 1 as unknown as boolean });
    expect(result.涉及BDSM模块).toBe(false);
  });
});
