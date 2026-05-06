import type { 角色数据结构, 记忆系统结构, 战斗状态结构, 聊天记录结构, 女主剧情规划结构, 同人剧情规划结构, 同人女主剧情规划结构 } from '../../../types';
import type { WorldGenConfig } from '../../../types';
import {
  创建开场空白角色, 创建空门派状态, 创建占位门派状态,
  创建开场空白环境, 创建开场空白世界, 创建开场空白战斗,
  创建开场空白剧情, 创建空剧情规划
} from './factories';
import {
  创建空女主剧情规划, 创建空同人剧情规划, 创建空同人女主剧情规划
} from './planningNormalizers';

const 深拷贝 = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export interface 开场命令基态 {
  角色: 角色数据结构;
  环境: any;
  社交: any[];
  世界: any;
  战斗: 战斗状态结构;
  玩家门派: any;
  任务列表: any[];
  约定列表: any[];
  剧情: any;
  剧情规划: any;
  女主剧情规划?: 女主剧情规划结构;
  同人剧情规划?: 同人剧情规划结构;
  同人女主剧情规划?: 同人女主剧情规划结构;
}

export function 创建开场基础状态(charData: 角色数据结构, _worldConfig: WorldGenConfig) {
  return {
    角色: 深拷贝(charData),
    环境: 创建开场空白环境(),
    游戏初始时间: '',
    社交: [],
    世界: 创建开场空白世界(),
    战斗: 创建开场空白战斗(),
    玩家门派: 创建占位门派状态(charData),
    任务列表: [],
    约定列表: [],
    剧情: 创建开场空白剧情(),
    剧情规划: 创建空剧情规划(),
    女主剧情规划: undefined as 女主剧情规划结构 | undefined,
    同人剧情规划: undefined as 同人剧情规划结构 | undefined,
    同人女主剧情规划: undefined as 同人女主剧情规划结构 | undefined
  };
}

export function 创建开场命令基态(_roleBase?: 角色数据结构): 开场命令基态 {
  return {
    角色: 创建开场空白角色(), 环境: 创建开场空白环境(), 社交: [],
    世界: 创建开场空白世界(), 战斗: 创建开场空白战斗(), 玩家门派: 创建空门派状态(),
    任务列表: [], 约定列表: [], 剧情: 创建开场空白剧情(), 剧情规划: 创建空剧情规划(),
    女主剧情规划: undefined, 同人剧情规划: undefined, 同人女主剧情规划: undefined
  };
}

export function 构建前端清空开场状态(openingBase: ReturnType<typeof 创建开场基础状态>): ReturnType<typeof 创建开场基础状态> {
  return {
    ...openingBase, 角色: 创建开场空白角色(), 环境: 创建开场空白环境(), 社交: [],
    世界: 创建开场空白世界(), 战斗: 创建开场空白战斗(), 玩家门派: 创建空门派状态(),
    任务列表: [], 约定列表: [], 剧情: 创建开场空白剧情(), 剧情规划: 创建空剧情规划(),
    女主剧情规划: undefined, 同人剧情规划: undefined, 同人女主剧情规划: undefined
  };
}

export function 创建空记忆系统(): 记忆系统结构 {
  return { 回忆档案: [], 即时记忆: [], 短期记忆: [], 中期记忆: [], 长期记忆: [] };
}

export function 战斗结束自动清空(battleLike: any): 战斗状态结构 {
  const src = battleLike && typeof battleLike === 'object' ? battleLike : {};
  const 是否战斗中 = src?.是否战斗中 === true;
  const 敌方 = Array.isArray(src?.敌方) ? src.敌方 : [];
  const 存活敌方 = 敌方.filter((enemy: any) => {
    const hp = Number(enemy?.当前血量) || 0;
    const maxHp = Number(enemy?.最大血量) || 0;
    return hp > 0 || maxHp <= 0;
  });
  if (!是否战斗中 || 存活敌方.length <= 0) return 创建开场空白战斗();
  return { ...src, 是否战斗中, 敌方: 存活敌方 };
}

export function 按回合窗口裁剪历史(sourceHistory: 聊天记录结构[], roundLimit: number): 聊天记录结构[] {
  const history = Array.isArray(sourceHistory) ? sourceHistory : [];
  const normalizedLimit = Math.max(0, Math.floor(Number(roundLimit) || 0));
  if (normalizedLimit <= 0) return [];

  const turnAnchors = history
    .map((item, idx) => (item.role === 'assistant' && item.structuredResponse ? idx : -1))
    .filter((idx) => idx >= 0);

  if (turnAnchors.length <= normalizedLimit) return [...history];

  const firstVisibleTurnPos = turnAnchors.length - normalizedLimit;
  if (firstVisibleTurnPos <= 0) return [...history];

  const prevTurnAnchor = turnAnchors[firstVisibleTurnPos - 1];
  const sliceStart = Math.min(history.length, prevTurnAnchor + 1);
  return history.slice(sliceStart);
}
