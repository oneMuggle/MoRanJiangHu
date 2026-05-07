// 写真约拍 NSFW 模块 — 桶导出 + 设置 + 默认值

export type {
  写真类型, 拍摄场所, 拍摄风格,
  模特类型, 模特职业状态, 模特保护意识, 拍摄经历类型,
  摄影师类型, 摄影师动机, 摄影师信誉,
  服装类型, 拍摄尺度, 后期处理,
  越界行为类型, 泄露类型, 传播范围,
  玩法层类型, 写真玩法配置,
} from './types';

export { 默认写真玩法配置 } from './types';

export type {
  模特核心状态, 摄影师核心状态,
  拍摄项目状态, 泄露事件状态,
} from './states';

// ==================== 设置接口 ====================

export interface 写真NSFW设置 {
  启用写真NSFW系统: boolean;
  NSFW内容强度: '微暗' | '暧昧' | '露骨';
  主要玩法层: '经营管理' | '人际关系' | '灰色地带';
  次要玩法权重: number;
  启用道德选择: boolean;
  启用尺度递进: boolean;
  启用摄影师筛选: boolean;
  启用越界识别: boolean;
  启用安全词系统: boolean;
  启用照片交付: boolean;
  启用泄露事件: boolean;
  泄露事件频率: '低' | '中' | '高';
  涉及BDSM模块: boolean;
}

export const 默认写真NSFW设置: 写真NSFW设置 = {
  启用写真NSFW系统: false,
  NSFW内容强度: '微暗',
  主要玩法层: '灰色地带',
  次要玩法权重: 30,
  启用道德选择: false,
  启用尺度递进: false,
  启用摄影师筛选: false,
  启用越界识别: false,
  启用安全词系统: false,
  启用照片交付: false,
  启用泄露事件: false,
  泄露事件频率: '低',
  涉及BDSM模块: false,
};

// ==================== 系统扩展接口（state mount） ====================

export interface 写真系统扩展 {
  模特档案?: Record<string, import('./states').模特核心状态>;
  摄影师档案?: Record<string, import('./states').摄影师核心状态>;
  进行中的拍摄项目?: import('./states').拍摄项目状态[];
  历史拍摄记录?: import('./states').拍摄项目状态[];
  泄露事件列表?: import('./states').泄露事件状态[];
}
