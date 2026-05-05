/**
 * Atmosphere Director - 氛围导演
 * 负责控制叙事风格、情感节奏、场景描写
 */

import { BaseDirector } from './BaseDirector';
import type { DirectorContext, AtmosphereDecision } from '../types';
import { 氛围导演_角色提示 } from '../prompts/directorCore';
import { 氛围导演_提示词 } from '../prompts/rolePrompts';

/**
 * 氛围类型
 */
type AtmosphereType = 'tense' | 'peaceful' | 'mysterious' | 'exciting' | 'romantic' | 'tragic';

/**
 * 场景类型
 */
type SceneType = 'indoor' | 'outdoor' | 'special';

/**
 * 氛围导演
 * 负责控制叙事风格与情感节奏
 */
export class AtmosphereDirector extends BaseDirector {
  /** 氛围类型权重 */
  private atmosphereWeights: Record<AtmosphereType, number> = {
    tense: 0.2,
    peaceful: 0.2,
    mysterious: 0.15,
    exciting: 0.2,
    romantic: 0.15,
    tragic: 0.1,
  };

  constructor() {
    super('atmosphere', 氛围导演_角色提示);
  }

  /**
   * 分析上下文并做出氛围决策
   */
  async analyze(context: DirectorContext): Promise<AtmosphereDecision> {
    if (!this.validateContext(context)) {
      return this.createDefaultDecision();
    }

    const { gameState, currentScene } = context;

    // 确定场景类型
    const sceneType = this.determineSceneType(currentScene);
    
    // 选择氛围类型
    const atmosphereType = this.selectAtmosphereType(gameState, currentScene);
    
    // 生成氛围描写
    const atmosphereDescription = this.generateAtmosphereDescription(
      atmosphereType,
      sceneType,
      currentScene
    );
    
    // 生成决策
    const decision = this.generateAtmosphereDecision(
      atmosphereType,
      atmosphereDescription
    );

    return {
      ...this.createBaseDecision(
        decision.核心决策,
        decision.事件列表,
        decision.变量更新,
        decision.置信度,
        decision.理由
      ),
      atmosphereTags: decision.氛围标签,
      emotionalTone: decision.情感基调,
      sceneEnhancement: decision.场景描写增强,
    } as AtmosphereDecision;
  }

  /**
   * 确定场景类型
   */
  private determineSceneType(currentScene: DirectorContext['currentScene']): SceneType {
    const sceneName = currentScene.场景名称 || '';
    const sceneTypeStr = currentScene.场景类型 || '';

    if (sceneTypeStr.includes('室内') || ['书斋', '客栈', '酒楼', '寺庙', '宫殿'].some(s => sceneName.includes(s))) {
      return 'indoor';
    }
    if (sceneTypeStr.includes('特殊') || ['秘境', '遗迹', '梦境'].some(s => sceneName.includes(s))) {
      return 'special';
    }
    return 'outdoor';
  }

  /**
   * 选择氛围类型
   */
  private selectAtmosphereType(
    gameState: DirectorContext['gameState'],
    currentScene: DirectorContext['currentScene']
  ): AtmosphereType {
    // 基于游戏状态中的事件类型调整权重
    const events = (gameState as any).当前事件 || [];
    
    // 检查是否有战斗
    const hasCombat = events.includes('战斗') || (currentScene as any).战斗中;
    if (hasCombat) {
      return 'tense';
    }

    // 检查是否是特殊场景
    const sceneType = this.determineSceneType(currentScene);
    if (sceneType === 'special') {
      return 'mysterious';
    }

    // 检查剧情阶段
    const chapter = parseInt((gameState.游戏时间 || '第1章').match(/第(\d+)章/)?.[1] || '1');
    if (chapter >= 4) {
      return 'tragic';
    }
    if (chapter <= 1) {
      return 'peaceful';
    }

    // 基于随机权重选择
    const roll = Math.random();
    let cumulative = 0;
    
    for (const [type, weight] of Object.entries(this.atmosphereWeights)) {
      cumulative += weight;
      if (roll <= cumulative) {
        return type as AtmosphereType;
      }
    }

    return 'peaceful';
  }

  /**
   * 生成氛围描写
   */
  private generateAtmosphereDescription(
    atmosphereType: AtmosphereType,
    sceneType: SceneType,
    currentScene: DirectorContext['currentScene']
  ): string {
    const sceneName = currentScene.场景名称 || '未知场景';
    const descriptions: Record<AtmosphereType, Record<SceneType, string[]>> = {
      tense: {
        indoor: [
          '室内烛火摇曳，气氛凝重，众人屏息凝神',
          '房间内暗流涌动，一股无形的压力笼罩着每个人',
        ],
        outdoor: [
          '山风呼啸，卷起漫天落叶，一股肃杀之气弥漫开来',
          '天色骤变，乌云压顶，仿佛预示着即将到来的风暴',
        ],
        special: [
          '秘境之中灵光闪烁，危险的气息让人不寒而栗',
          '遗迹深处传来诡异声响，空气中弥漫着死亡的气息',
        ],
      },
      peaceful: {
        indoor: [
          '阳光透过窗棂洒落，室内一片温暖祥和',
          '茶香袅袅，琴声悠扬，一派岁月静好之景',
        ],
        outdoor: [
          '春风拂面，杨柳依依，河水静静流淌',
          '青山绿水间，鸟语花香，让人忘却尘世烦恼',
        ],
        special: [
          '秘境中桃花盛开，落英缤纷，宛如仙境',
          '遗迹周围瑞气环绕，祥和安宁',
        ],
      },
      mysterious: {
        indoor: [
          '室内光线昏暗，某些角落似乎隐藏着不为人知的秘密',
          '古旧的书斋中，尘埃在光柱中飞舞，透着诡异',
        ],
        outdoor: [
          '林中雾气缭绕，仿佛有无数双眼睛在暗中窥视',
          '古道蜿蜒消失在迷雾之中，引人无限遐想',
        ],
        special: [
          '秘境入口云雾缭绕，看不清内里景象',
          '遗迹石碑上符文若隐若现，神秘莫测',
        ],
      },
      exciting: {
        indoor: [
          '室内人声鼎沸，热闹非凡，欢笑声此起彼伏',
          '酒过三巡，菜过五味，众人兴致正浓',
        ],
        outdoor: [
          '校场之上，刀光剑影，喝彩声不绝于耳',
          '集市人来人往，熙熙攘攘，一派繁华景象',
        ],
        special: [
          '秘宝出世之日，各路英豪齐聚，争夺在即',
          '遗迹开启之时，一股磅礴气势冲天而起',
        ],
      },
      romantic: {
        indoor: [
          '月色如水，洒落在窗前，映照出伊人的剪影',
          '烛光摇曳中，四目相对，情意绵绵',
        ],
        outdoor: [
          '花前月下，两人并肩而行，倾诉衷肠',
          '湖畔杨柳岸，微风拂面，柔情似水',
        ],
        special: [
          '秘境花海中，漫天飞舞的花瓣如同梦境',
          '遗迹之巅，云海翻涌，宛如天上人间',
        ],
      },
      tragic: {
        indoor: [
          '灵堂之中，白幡飘动，哀思绵绵',
          '残破的屋内，回忆涌上心头，潸然泪下',
        ],
        outdoor: [
          '荒郊野岭，孤坟一座，荒草萋萋',
          '战场遗迹，残垣断壁诉说着往日的惨烈',
        ],
        special: [
          '秘境崩塌之际，美好瞬间化为泡影',
          '遗迹之中，往事浮现，令人扼腕叹息',
        ],
      },
    };

    const options = descriptions[atmosphereType][sceneType];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * 生成氛围决策
   */
  private generateAtmosphereDecision(
    atmosphereType: AtmosphereType,
    sceneEnhancement: string
  ): {
    核心决策: string;
    事件列表: string[];
    变量更新: Record<string, unknown>;
    置信度: number;
    理由: string;
    氛围标签: string[];
    情感基调: AtmosphereDecision['emotionalTone'];
    场景描写增强: string;
  } {
    const tags: Record<AtmosphereType, string[]> = {
      tense: ['紧张', '危机', '悬念', '压迫感'],
      peaceful: ['平和', '宁静', '温馨', '悠闲'],
      mysterious: ['神秘', '未知', '诡异', '探索'],
      exciting: ['热血', '激烈', '欢快', '热闹'],
      romantic: ['浪漫', '柔情', '温馨', '甜蜜'],
      tragic: ['悲壮', '哀伤', '沉重', '苍凉'],
    };

    const emotionalTones: Record<AtmosphereType, AtmosphereDecision['emotionalTone']> = {
      tense: 'tense',
      peaceful: 'peaceful',
      mysterious: 'mysterious',
      exciting: 'exciting',
      romantic: 'romantic',
      tragic: 'tense', // tragic uses tense as closest match
    };

    return {
      核心决策: `当前氛围：${atmosphereType}`,
      事件列表: [],
      变量更新: {
        氛围类型: atmosphereType,
        场景描写增强: sceneEnhancement,
      },
      置信度: 0.85,
      理由: `基于场景类型和剧情发展确定`,
      氛围标签: tags[atmosphereType],
      情感基调: emotionalTones[atmosphereType],
      场景描写增强: sceneEnhancement,
    };
  }

  /**
   * 创建默认决策
   */
  private createDefaultDecision(): AtmosphereDecision {
    return {
      role: 'atmosphere',
      decision: '平和氛围',
      events: [],
      variables: {},
      confidence: 0.5,
      reasoning: '默认决策',
      atmosphereTags: ['平和', '宁静'],
      emotionalTone: 'peaceful',
      sceneEnhancement: '阳光明媚，一切如常',
    };
  }
}
