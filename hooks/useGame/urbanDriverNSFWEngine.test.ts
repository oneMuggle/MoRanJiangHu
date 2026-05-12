/**
 * urbanDriverNSFWEngine 测试
 *
 * 覆盖药物/醉酒状态衰减、欲望阶段升级、紧张度计算。
 */

import { describe, it, expect } from 'vitest';
import {
  创建乘客欲望档案,
  更新乘客欲望状态,
  检查欲望阶段升级,
  计算暴露风险,
  计算紧张度,
  更新醉酒状态,
  更新药物状态,
} from './urbanDriverNSFWEngine';

describe('创建乘客欲望档案', () => {
  it('应创建默认档案', () => {
    const profile = 创建乘客欲望档案();
    expect(profile.当前阶段).toBe('克制');
    expect(profile.阶段进度).toBe(0);
    expect(profile.关系轨道).toBe('暧昧');
    expect(profile.轨道进度).toBe(0);
    expect(profile.紧张度).toBe(0);
  });

  it('应支持自定义初始值', () => {
    const profile = 创建乘客欲望档案({
      初始欲望阶段: '试探',
      初始关系轨道: '肉体',
    });
    expect(profile.当前阶段).toBe('试探');
    expect(profile.关系轨道).toBe('肉体');
  });
});

const mockSettings = {
    启用都市网约车NSFW系统: true,
    NSFW内容强度: '中',
    启用醉酒乘客场景: true,
    醉酒场景强度: '低',
    药物效果启用: true,
    药物场景强度: '低',
    暴露风险启用: true,
    暴露强度: '低',
    后果事件启用: true,
    后果强度: '低',
    记录仪启用: false,
  } as any;

describe('更新乘客欲望状态', () => {
  it('应增加阶段进度', () => {
    const profile = 创建乘客欲望档案({ 初始欲望阶段: '试探' });
    const updated = 更新乘客欲望状态(profile, '肢体触碰', '酒吧街', mockSettings);
    expect(updated.阶段进度).toBeGreaterThan(0);
  });

  it('纯爱轨道应有较慢推进速度', () => {
    const profile = 创建乘客欲望档案();
    const updated = 更新乘客欲望状态(profile, '眼神接触', '城市主干道', mockSettings);
    expect(updated.阶段进度).toBeLessThanOrEqual(10);
  });
});

describe('检查欲望阶段升级', () => {
  it('进度 100 时应升级阶段', () => {
    const profile = 创建乘客欲望档案({ 初始欲望阶段: '克制' });
    profile.阶段进度 = 100;
    const result = 检查欲望阶段升级(profile);
    expect(result.升级).toBe(true);
    expect(result.新阶段).toBe('试探');
  });

  it('进度不足 100 时不应升级', () => {
    const profile = 创建乘客欲望档案({ 初始欲望阶段: '试探' });
    profile.阶段进度 = 50;
    const result = 检查欲望阶段升级(profile);
    expect(result.升级).toBe(false);
  });
});

describe('计算暴露风险', () => {
  it('深夜小巷应有更高风险', () => {
    const risk = 计算暴露风险(0, '深夜小巷', '试探');
    expect(risk).toBeGreaterThan(0);
  });

  it('CBD 写字楼应有较低风险', () => {
    const risk = 计算暴露风险(0, 'CBD写字楼', '试探');
    expect(risk).toBeLessThan(30);
  });
});

describe('计算紧张度', () => {
  it('应返回非负值', () => {
    const tension = 计算紧张度(50, '城市主干道', false);
    expect(tension).toBeGreaterThanOrEqual(0);
    expect(tension).toBeLessThanOrEqual(100);
  });

  it('启用记录仪应增加紧张度', () => {
    const tensionWithRecorder = 计算紧张度(50, '城市主干道', true);
    const tensionWithout = 计算紧张度(50, '城市主干道', false);
    expect(tensionWithRecorder).toBeGreaterThan(tensionWithout);
  });
});

describe('更新醉酒状态', () => {
  const 默认醉酒: import('../../models/urbanDriverNSFW/core').醉酒状态 = { 等级: '清醒', 判断力下降: false, 行为大胆度: 0, 记忆模糊度: 0 };

  it('清醒状态中量饮酒后应变为微醺', () => {
    // 中量 = +35 行为大胆度, >=20 微醺
    const state = 更新醉酒状态(默认醉酒, '中量');
    expect(state.等级).toBe('微醺');
  });

  it('大量饮酒应增加行为大胆度', () => {
    const state = 更新醉酒状态(默认醉酒, '大量');
    expect(state.行为大胆度).toBeGreaterThan(30);
  });
});

describe('更新药物状态', () => {
  it('药物应随时间衰减', () => {
    const state = {
      类型: '迷药' as const,
      生效阶段: '强烈' as const,
      意识清晰度: 20,
      身体控制度: 30,
    };
    const decayed = 更新药物状态(state, 30);
    expect(decayed.意识清晰度).toBeGreaterThan(20);
    expect(decayed.身体控制度).toBeGreaterThan(30);
  });

  it('长时间后药物应进入衰退阶段', () => {
    const state = {
      类型: '迷药' as const,
      生效阶段: '初期' as const,
      意识清晰度: 50,
      身体控制度: 50,
    };
    const decayed = 更新药物状态(state, 120);
    // 清晰度从 50 增加到 50+0.5*120=110→100, >=80 触发衰退
    expect(decayed.生效阶段).toBe('衰退');
  });
});
