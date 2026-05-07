// 写真 NSFW 测试用状态工厂

import type {
  模特核心状态, 摄影师核心状态, 拍摄项目状态, 泄露事件状态,
} from '../../models/photographyNSFW/states';
import type { 写真NSFW设置 } from '../../models/photographyNSFW';
import type {
  模特保护意识, 拍摄尺度, 拍摄场所, 摄影师信誉, 摄影师动机,
} from '../../models/photographyNSFW/types';
import { 默认写真NSFW设置 } from '../../models/photographyNSFW';

export function createMockModel(overrides?: Partial<模特核心状态>): 模特核心状态 {
  return {
    id: 'model_test_001',
    姓名: '测试模特',
    类型: '素人模特',
    职业状态: '新人',
    保护意识: '适度保护',
    信任度: 50,
    安全感: 60,
    自我认同: 70,
    羞耻度: 30,
    拍摄总次数: 0,
    正规拍摄次数: 0,
    擦边拍摄次数: 0,
    越界拍摄次数: 0,
    当前底线: 'G级',
    底线历史: [],
    被偷拍次数: 0,
    被泄露次数: 0,
    投诉次数: 0,
    累计收入: 0,
    单次报价: 500,
    拍摄经历: [],
    ...overrides,
  };
}

export function createMockPhotographer(overrides?: Partial<摄影师核心状态>): 摄影师核心状态 {
  return {
    id: 'photographer_test_001',
    姓名: '测试摄影师',
    类型: '独立摄影师',
    动机: '纯艺术',
    信誉: '普通摄影师',
    技术水平: 60,
    沟通能力: 50,
    越界倾向: 5,
    偷拍倾向: 10,
    传播倾向: 10,
    口碑评分: 50,
    投诉累计: 0,
    拍摄总次数: 0,
    回头客数量: 0,
    作品发布数量: 0,
    擅长写真类型: ['商业写真'],
    擅长拍摄风格: ['清新自然'],
    ...overrides,
  };
}

export function createMockShootProject(overrides?: Partial<拍摄项目状态>): 拍摄项目状态 {
  return {
    id: 'shoot_test_001',
    模特Id: 'model_test_001',
    摄影师Id: 'photographer_test_001',
    约定写真类型: '商业写真',
    约定场所: '影棚',
    约定风格: '清新自然',
    约定尺度: 'G级',
    约定服装: '日常便装',
    约定交付时间: Date.now() + 7 * 24 * 60 * 60 * 1000,
    实际场所: '影棚',
    实际尺度: 'G级',
    实际服装: '日常便装',
    当前回合: 0,
    最大回合: 5,
    拍摄阶段: '未开始',
    尺度变更历史: [],
    越界行为记录: [],
    泄露风险评分: 0,
    交付状态: '待交付',
    交付方式: null,
    后期处理方式: '纯自然',
    违规记录: [],
    ...overrides,
  };
}

export function createMockLeakEvent(overrides?: Partial<泄露事件状态>): 泄露事件状态 {
  return {
    id: 'leak_test_001',
    拍摄项目Id: 'shoot_test_001',
    模特Id: 'model_test_001',
    泄露者Id: null,
    泄露类型: '意外泄露',
    传播范围: '小范围',
    泄露内容描述: '',
    心理影响: 30,
    名誉影响: 20,
    职业影响: 15,
    生活影响: 25,
    传播路径: [],
    传播回合: 0,
    模特应对: '',
    应对效果: '有效',
    发现时间: Date.now(),
    状态: '活跃',
    ...overrides,
  };
}

export function createMockSettings(overrides?: Partial<写真NSFW设置>): 写真NSFW设置 {
  return { ...默认写真NSFW设置, ...overrides };
}

export function createSafeScenario() {
  const 模特 = createMockModel({ 保护意识: '极度保护' as 模特保护意识, 信任度: 80, 安全感: 85 });
  const 摄影师 = createMockPhotographer({
    信誉: '业界大佬' as 摄影师信誉,
    动机: '纯艺术' as 摄影师动机,
    技术水平: 95,
    沟通能力: 90,
  });
  const 项目 = createMockShootProject({ 实际场所: '影棚' as 拍摄场所, 实际尺度: 'G级' as 拍摄尺度, 交付方式: '平台担保' });
  return { 模特, 摄影师, 项目 };
}

export function createRiskyScenario() {
  const 模特 = createMockModel({ 保护意识: '适度保护' as 模特保护意识, 信任度: 40, 安全感: 35 });
  const 摄影师 = createMockPhotographer({
    信誉: '有争议' as 摄影师信誉,
    动机: '泡妞' as 摄影师动机,
    技术水平: 50,
    沟通能力: 40,
  });
  const 项目 = createMockShootProject({ 实际场所: '酒店' as 拍摄场所, 实际尺度: 'R级' as 拍摄尺度, 交付方式: '直接交付' });
  return { 模特, 摄影师, 项目 };
}

export function createExtremeScenario() {
  const 模特 = createMockModel({ 保护意识: '开放型' as 模特保护意识, 信任度: 15, 安全感: 10 });
  const 摄影师 = createMockPhotographer({
    信誉: '惯犯' as 摄影师信誉,
    动机: '偷拍' as 摄影师动机,
    技术水平: 10,
    沟通能力: 10,
  });
  const 项目 = createMockShootProject({ 实际场所: '个人住所' as 拍摄场所, 实际尺度: 'XXX' as 拍摄尺度, 交付方式: null });
  return { 模特, 摄影师, 项目 };
}
