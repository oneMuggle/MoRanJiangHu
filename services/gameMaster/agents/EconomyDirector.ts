/**
 * Economy Director - 经济导演
 * 负责物品掉落、交易定价、资源流通
 */

import { BaseDirector } from './BaseDirector';
import type { DirectorContext, EconomyDecision } from '../types';
import { 经济导演_角色提示 } from '../prompts/directorCore';
import { 经济导演_提示词 } from '../prompts/rolePrompts';

/**
 * 稀有度类型
 */
type Rarity = 'common' | 'fine' | 'rare' | 'epic' | 'legendary';

/**
 * 物品类型
 */
type ItemCategory = 'weapon' | 'armor' | 'consumable' | 'material' | 'quest';

/**
 * 经济导演
 * 负责物品掉落、交易定价与资源管理
 */
export class EconomyDirector extends BaseDirector {
  /** 稀有度权重 */
  private rarityWeights: Record<Rarity, number> = {
    common: 0.60,
    fine: 0.25,
    rare: 0.10,
    epic: 0.04,
    legendary: 0.01,
  };

  /** 物品名称库 */
  private itemNames: Record<Rarity, Record<ItemCategory, string[]>> = {
    common: {
      weapon: ['铁剑', '木棍', '匕首', '短刀'],
      armor: ['布衣', '皮甲', '麻绳甲'],
      consumable: ['馒头', '清水', '草药', '跌打酒'],
      material: ['木材', '石材', '麻布', '铁锭'],
      quest: ['破旧地图', '无名信件', '旧铜钱'],
    },
    fine: {
      weapon: ['钢刀', '长枪', '铁胎弓', '峨眉刺'],
      armor: ['链甲', '皮甲', '钢镯'],
      consumable: ['金疮药', '回春丹', '续命散'],
      material: ['精钢', '丝绸', '玉石', '灵木'],
      quest: ['完整地图', '密信', '银两'],
    },
    rare: {
      weapon: ['青锋剑', '方天画戟', '君子剑', '越女剑'],
      armor: ['锁子甲', '皮甲', '护心镜'],
      consumable: ['九转还魂丹', '天山雪莲', '千年灵芝'],
      material: ['玄铁', '寒玉', '天蚕丝', '麒麟血'],
      quest: ['藏宝图', '令牌', '密函'],
    },
    epic: {
      weapon: ['倚天剑', '屠龙刀', '打狗棒', '血饮狂刀'],
      armor: ['软猬甲', '金丝甲', '玄铁甲'],
      consumable: ['蟠桃', '人参果', '九转金丹'],
      material: ['星辰铁', '混沌石', '凤凰羽'],
      quest: ['武功秘籍', '残页', '钥匙'],
    },
    legendary: {
      weapon: ['绝世好剑', '雪饮狂刀', '绝世神兵'],
      armor: ['护国神甲', '天魔战甲'],
      consumable: ['长生不老药', '混沌灵液'],
      material: ['创世神石', '天道碎片'],
      quest: ['上古遗物', '神兵图纸', '惊天秘密'],
    },
  };

  constructor() {
    super('economy', 经济导演_角色提示);
  }

  /**
   * 分析上下文并做出经济决策
   */
  async analyze(context: DirectorContext): Promise<EconomyDecision> {
    if (!this.validateContext(context)) {
      return this.createDefaultDecision();
    }

    const { gameState, characterState, currentScene } = context;

    // 获取经济请求类型
    const requestType = this.determineRequestType(gameState, currentScene);
    
    // 生成掉落/交易决策
    const decision = this.generateEconomyDecision(requestType, context);

    return {
      ...this.createBaseDecision(
        decision.核心决策,
        decision.事件列表,
        decision.变量更新,
        decision.置信度,
        decision.理由
      ),
      drops: decision.物品掉落,
      priceChanges: decision.价格浮动,
      resourceChanges: decision.资源变化,
    } as EconomyDecision;
  }

  /**
   * 确定请求类型
   */
  private determineRequestType(
    gameState: DirectorContext['gameState'],
    currentScene: DirectorContext['currentScene']
  ): 'drop' | 'trade' | 'loot' | 'reward' {
    const events = (gameState as any).当前事件 || [];
    
    if (events.includes('战斗胜利') || events.includes('击杀敌人')) {
      return 'loot';
    }
    if (events.includes('完成任务')) {
      return 'reward';
    }
    if (currentScene.场景类型?.includes('商店') || currentScene.场景名称?.includes('商铺')) {
      return 'trade';
    }
    return 'drop';
  }

  /**
   * 生成经济决策
   */
  private generateEconomyDecision(
    requestType: 'drop' | 'trade' | 'loot' | 'reward',
    context: DirectorContext
  ): {
    核心决策: string;
    事件列表: string[];
    变量更新: Record<string, unknown>;
    置信度: number;
    理由: string;
    物品掉落: EconomyDecision['drops'];
    价格浮动: EconomyDecision['priceChanges'];
    资源变化: Record<string, number>;
  } {
    let items: EconomyDecision['drops'] = [];
    let priceChanges: EconomyDecision['priceChanges'] = [];
    let resourceChanges: Record<string, number> = {};
    let coreDecision = '';

    switch (requestType) {
      case 'loot':
        const lootResult = this.generateLoot(context);
        items = lootResult.items;
        resourceChanges = lootResult.goldChange;
        coreDecision = `战利品：获得${items.map(i => i.itemId).join('、')}`;
        break;

      case 'drop':
        const dropResult = this.generateDrop(context);
        items = dropResult.items;
        resourceChanges = {};
        coreDecision = `随机掉落：获得${items.map(i => i.itemId).join('、')}`;
        break;

      case 'trade':
        const tradeResult = this.generateTrade(context);
        items = [];
        priceChanges = tradeResult.priceChanges;
        resourceChanges = {};
        coreDecision = `交易价格调整：${priceChanges.map(p => `${p.itemId}变化${p.priceChange > 0 ? '+' : ''}${p.priceChange}%`).join('、')}`;
        break;

      case 'reward':
        const rewardResult = this.generateReward(context);
        items = rewardResult.items;
        resourceChanges = rewardResult.goldChange;
        coreDecision = `任务奖励：${items.map(i => i.itemId).join('、')}及${resourceChanges.金币 || 0}金币`;
        break;
    }

    const events = items.length > 0 
      ? [`获得物品：${items.map(i => `${i.itemId}×${i.quantity}`).join(', ')}`]
      : [];

    return {
      核心决策: coreDecision,
      事件列表: events,
      变量更新: { items, priceChanges, resourceChanges },
      置信度: 0.85,
      理由: `基于${requestType}类型生成`,
      物品掉落: items,
      价格浮动: priceChanges,
      资源变化: resourceChanges,
    };
  }

  /**
   * 生成战利品
   */
  private generateLoot(context: DirectorContext): {
    items: EconomyDecision['drops'];
    goldChange: Record<string, number>;
  } {
    // 基于敌人等级和环境生成掉落
    const enemyLevel = 1; // 默认
    const items: EconomyDecision['drops'] = [];
    
    // 基础掉落：1-3个物品
    const itemCount = 1 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < itemCount; i++) {
      const { rarity, category, name } = this.rollItem();
      const quantity = rarity === 'common' ? Math.floor(Math.random() * 3) + 1 : 1;
      
      items.push({
        itemId: name,
        quantity,
        rarity,
      });
    }

    // 金币掉落
    const goldRange = rarity === 'legendary' ? [100, 500] :
                      rarity === 'epic' ? [50, 200] :
                      rarity === 'rare' ? [20, 80] :
                      rarity === 'fine' ? [5, 30] : [1, 10];
    const gold = goldRange[0] + Math.floor(Math.random() * (goldRange[1] - goldRange[0]));
    const goldChange = { 金币: gold };

    return { items, goldChange };
  }

  /**
   * 生成随机掉落
   */
  private generateDrop(context: DirectorContext): {
    items: EconomyDecision['drops'];
  } {
    const { rarity, category, name } = this.rollItem();
    const quantity = rarity === 'common' ? Math.floor(Math.random() * 5) + 1 : 1;

    return {
      items: [{
        itemId: name,
        quantity,
        rarity,
      }],
    };
  }

  /**
   * 生成交易价格
   */
  private generateTrade(context: DirectorContext): {
    priceChanges: EconomyDecision['priceChanges'];
  } {
    const changes: EconomyDecision['priceChanges'] = [];
    const itemTypes = ['药品', '装备', '材料'];
    const changeRate = 0.8 + Math.random() * 0.4; // 80%-120%

    // 随机选择1-2种物品价格浮动
    const changeCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < changeCount; i++) {
      const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
      changes.push({
        itemId: `${itemType}_${i}`,
        priceChange: Math.round((changeRate - 1) * 100),
      });
    }

    return { priceChanges: changes };
  }

  /**
   * 生成任务奖励
   */
  private generateReward(context: DirectorContext): {
    items: EconomyDecision['drops'];
    goldChange: Record<string, number>;
  } {
    // 任务奖励通常更好
    const items: EconomyDecision['drops'] = [];
    
    // 1-2个装备/材料
    for (let i = 0; i < 1 + Math.floor(Math.random() * 2); i++) {
      const { rarity, category, name } = this.rollItemBetter();
      items.push({
        itemId: name,
        quantity: 1,
        rarity,
      });
    }

    // 金币奖励
    const gold = 50 + Math.floor(Math.random() * 150);
    const goldChange = { 金币: gold };

    return { items, goldChange };
  }

  /**
   * roll物品（普通难度）
   */
  private rollItem(): { rarity: Rarity; category: ItemCategory; name: string } {
    const roll = Math.random();
    let cumulative = 0;
    let rarity: Rarity = 'common';

    for (const [r, weight] of Object.entries(this.rarityWeights)) {
      cumulative += weight;
      if (roll <= cumulative) {
        rarity = r as Rarity;
        break;
      }
    }

    const categories: ItemCategory[] = ['weapon', 'armor', 'consumable', 'material', 'quest'];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const names = this.itemNames[rarity][category];
    const name = names[Math.floor(Math.random() * names.length)];

    return { rarity, category, name };
  }

  /**
   * roll物品（更好难度 - 用于奖励）
   */
  private rollItemBetter(): { rarity: Rarity; category: ItemCategory; name: string } {
    const roll = Math.random();
    let rarity: Rarity = 'common';

    // 奖励时稀有度权重提高
    if (roll < 0.05) rarity = 'legendary';
    else if (roll < 0.15) rarity = 'epic';
    else if (roll < 0.30) rarity = 'rare';
    else if (roll < 0.55) rarity = 'fine';

    const categories: ItemCategory[] = ['weapon', 'armor', 'consumable', 'material'];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const names = this.itemNames[rarity][category];
    const name = names[Math.floor(Math.random() * names.length)];

    return { rarity, category, name };
  }

  /**
   * 创建默认决策
   */
  private createDefaultDecision(): EconomyDecision {
    return {
      role: 'economy',
      decision: '经济稳定',
      events: [],
      variables: {},
      confidence: 0.5,
      reasoning: '默认决策',
      drops: [],
      priceChanges: [],
      resourceChanges: {},
    };
  }
}
