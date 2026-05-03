// 战斗数值计算模块
// 负责将装备属性、功法熟练度、角色六维属性综合为战斗可用数值

import { 角色数据结构 } from '../../models/domain/character';
import { 功法结构 } from '../../models/domain/kungfu';
import { 游戏物品, 武器, 防具 } from '../../models/domain/item';
import { 战斗敌方信息 } from '../../models/domain/battle';

// ---- 装备属性提取 ----

function 获取武器属性(物品: 游戏物品): 武器 | null {
    if (物品.类型 === '武器') return 物品 as 武器;
    return null;
}

function 获取防具属性(物品: 游戏物品): 防具 | null {
    if (物品.类型 === '防具') return 物品 as 防具;
    return null;
}

function 获取装备总攻击(角色: 角色数据结构): number {
    const 武器槽 = ['主武器', '副武器', '暗器'] as const;
    let 总攻击 = 0;
    for (const 槽位 of 武器槽) {
        const 装备引用 = 角色.装备[槽位];
        if (!装备引用) continue;
        const 物品 = 角色.物品列表.find(
            (item) => item.ID === 装备引用 || item.名称 === 装备引用
        );
        if (!物品) continue;
        const 武器 = 获取武器属性(物品);
        if (武器) {
            总攻击 += (武器.最小攻击 + 武器.最大攻击) / 2;
            for (const 词条 of 武器.词条列表) {
                if (词条.属性.includes('攻击')) {
                    总攻击 += 词条.类型 === '百分比'
                        ? (武器.最小攻击 + 武器.最大攻击) / 2 * 词条.数值 / 100
                        : 词条.数值;
                }
            }
        }
    }
    return Math.round(总攻击);
}

function 获取装备总防御(角色: 角色数据结构): number {
    const 防具槽 = ['头部', '胸部', '盔甲', '内衬', '腿部', '手部', '足部'] as const;
    let 总防御 = 0;
    for (const 槽位 of 防具槽) {
        const 装备引用 = 角色.装备[槽位];
        if (!装备引用) continue;
        const 物品 = 角色.物品列表.find(
            (item) => item.ID === 装备引用 || item.名称 === 装备引用
        );
        if (!物品) continue;
        const 防具 = 获取防具属性(物品);
        if (防具) {
            总防御 += 防具.物理防御 + 防具.内功防御;
            for (const 词条 of 防具.词条列表) {
                if (词条.属性.includes('防御')) {
                    总防御 += 词条.类型 === '百分比'
                        ? (防具.物理防御 + 防具.内功防御) * 词条.数值 / 100
                        : 词条.数值;
                }
            }
        }
    }
    return Math.round(总防御);
}

// ---- 功法熟练度加成 ----

function 获取功法熟练度加成(角色: 角色数据结构): { 伤害加成: number; 冷却缩减: number } {
    let 伤害加成 = 0;
    let 冷却缩减 = 0;
    for (const 功法 of 角色.功法列表) {
        if (功法.类型 === '被动') continue;
        const 熟练度比例 = 功法.当前熟练度 / Math.max(1, 功法.升级经验);
        伤害加成 += Math.min(0.3, 熟练度比例 * 0.3);
        冷却缩减 += Math.min(0.15, 熟练度比例 * 0.15);
    }
    return { 伤害加成: Math.round(伤害加成 * 100), 冷却缩减: Math.round(冷却缩减 * 100) };
}

// ---- 部位伤势影响 ----

function 获取部位伤势惩罚(角色: 角色数据结构): { 速度惩罚: number; 攻击惩罚: number; 防御惩罚: number } {
    let 速度惩罚 = 0;
    let 攻击惩罚 = 0;
    let 防御惩罚 = 0;

    const 总腿血 = (角色.左腿当前血量 || 0) + (角色.右腿当前血量 || 0);
    const 总腿最大 = (角色.左腿最大血量 || 0) + (角色.右腿最大血量 || 0);
    if (总腿最大 > 0) {
        const 腿伤比例 = 1 - 总腿血 / 总腿最大;
        速度惩罚 = Math.round(腿伤比例 * 30);
    }

    const 总臂血 = (角色.左手当前血量 || 0) + (角色.右手当前血量 || 0);
    const 总臂最大 = (角色.左手最大血量 || 0) + (角色.右手最大血量 || 0);
    if (总臂最大 > 0) {
        const 臂伤比例 = 1 - 总臂血 / 总臂最大;
        攻击惩罚 = Math.round(臂伤比例 * 25);
    }

    const 总躯干血 = (角色.头部当前血量 || 0) + (角色.胸部当前血量 || 0) + (角色.腹部当前血量 || 0);
    const 总躯干最大 = (角色.头部最大血量 || 0) + (角色.胸部最大血量 || 0) + (角色.腹部最大血量 || 0);
    if (总躯干最大 > 0) {
        const 躯干伤比例 = 1 - 总躯干血 / 总躯干最大;
        防御惩罚 = Math.round(躯干伤比例 * 20);
    }

    return { 速度惩罚, 攻击惩罚, 防御惩罚 };
}

// ---- 综合战斗属性 ----

export interface 玩家战斗属性 {
    攻击力: number;
    防御力: number;
    速度: number;
    暴击率: number;
    闪避率: number;
    伤害加成百分比: number;
    冷却缩减百分比: number;
    最大血量: number;
    当前血量: number;
    最大内力: number;
    当前内力: number;
    最大精力: number;
    当前精力: number;
}

export function 计算玩家战斗属性(角色: 角色数据结构): 玩家战斗属性 {
    const 装备攻击 = 获取装备总攻击(角色);
    const 装备防御 = 获取装备总防御(角色);
    const { 伤害加成, 冷却缩减 } = 获取功法熟练度加成(角色);
    const { 速度惩罚, 攻击惩罚, 防御惩罚 } = 获取部位伤势惩罚(角色);

    const 基础攻击 = 角色.力量 * 2;
    const 基础防御 = 角色.体质 + 角色.根骨;
    const 基础速度 = 角色.敏捷 * 1.5;
    const 基础血量 = 角色.体质 * 10 + 角色.根骨 * 5;
    const 基础内力 = 角色.根骨 * 8;
    const 基础暴击 = 角色.福源 * 0.5;
    const 基础闪避 = 角色.敏捷 * 0.3;

    const 最终攻击 = Math.max(1, Math.round((基础攻击 + 装备攻击) * (1 - 攻击惩罚 / 100)));
    const 最终防御 = Math.max(1, Math.round((基础防御 + 装备防御) * (1 - 防御惩罚 / 100)));
    const 最终速度 = Math.max(1, Math.round(基础速度 * (1 - 速度惩罚 / 100)));
    const 最终血量 = Math.max(1, Math.round(基础血量));
    const 最终内力 = Math.max(0, Math.round(基础内力));
    const 最终暴击 = Math.min(50, Math.max(0, Math.round(基础暴击 * 10) / 10));
    const 最终闪避 = Math.min(40, Math.max(0, Math.round(基础闪避 * 10) / 10));

    return {
        攻击力: 最终攻击,
        防御力: 最终防御,
        速度: 最终速度,
        暴击率: 最终暴击,
        闪避率: 最终闪避,
        伤害加成百分比: 伤害加成,
        冷却缩减百分比: 冷却缩减,
        最大血量: 最终血量,
        当前血量: 角色.当前精力,
        最大内力: 最终内力,
        当前内力: 角色.当前内力,
        最大精力: 角色.最大精力,
        当前精力: 角色.当前精力,
    };
}

// ---- 伤害计算 ----

export interface 伤害结果 {
    最终伤害: number;
    是否暴击: boolean;
    是否闪避: boolean;
    描述: string;
}

export function 计算伤害(
    攻击力: number,
    防御力: number,
    暴击率: number,
    闪避率: number,
    伤害加成百分比: number,
    技能基础伤害: number = 0
): 伤害结果 {
    const 闪避随机 = Math.random() * 100;
    const 是否闪避 = 闪避随机 < 闪避率;
    if (是否闪避) {
        return { 最终伤害: 0, 是否暴击: false, 是否闪避: true, 描述: '对方闪避了攻击！' };
    }

    const 暴击随机 = Math.random() * 100;
    const 是否暴击 = 暴击随机 < 暴击率;
    const 暴击倍率 = 是否暴击 ? 1.5 : 1.0;

    const 基础伤害 = Math.max(1, 攻击力 - 防御力 * 0.5);
    const 技能伤害 = 技能基础伤害 > 0 ? 技能基础伤害 + 基础伤害 * 0.3 : 基础伤害;
    const 加成后伤害 = 技能伤害 * (1 + 伤害加成百分比 / 100) * 暴击倍率;
    const 浮动系数 = 0.85 + Math.random() * 0.3;
    const 最终伤害 = Math.max(1, Math.round(加成后伤害 * 浮动系数));

    let 描述 = `造成 ${最终伤害} 点伤害`;
    if (是否暴击) 描述 = `暴击！${描述}`;

    return { 最终伤害, 是否暴击, 是否闪避: false, 描述 };
}

// ---- 可用战斗行动生成 ----

export interface 战斗行动选项 {
    id: string;
    名称: string;
    类型: '攻击' | '技能' | '道具' | '防御' | '撤退';
    描述: string;
    消耗内力?: number;
    消耗精力?: number;
    目标类型?: '单体' | '全体' | '自身';
}

export function 生成可用战斗行动(
    角色: 角色数据结构,
    敌方列表: 战斗敌方信息[]
): 战斗行动选项[] {
    const 行动: 战斗行动选项[] = [];

    行动.push({
        id: 'basic_attack',
        名称: '普通攻击',
        类型: '攻击',
        描述: '使用当前武器进行基础攻击',
        目标类型: '单体',
    });

    for (const 功法 of 角色.功法列表) {
        if (功法.类型 === '被动') continue;
        if (功法.当前重数 < 1) continue;
        if (角色.当前内力 < (功法.消耗数值 || 0)) continue;
        行动.push({
            id: `skill_${功法.ID}`,
            名称: 功法.名称,
            类型: '技能',
            描述: 功法.描述.substring(0, 30),
            消耗内力: 功法.消耗数值,
            目标类型: 功法.目标类型 === '自身' ? '自身' : '单体',
        });
    }

    const 消耗品 = 角色.物品列表.filter((item) => item.类型 === '消耗品' && (item.堆叠数量 || 1) > 0);
    for (const 道具 of 消耗品.slice(0, 3)) {
        行动.push({
            id: `item_${道具.ID}`,
            名称: `使用${道具.名称}`,
            类型: '道具',
            描述: 道具.描述.substring(0, 30),
        });
    }

    行动.push({
        id: 'defend',
        名称: '防御',
        类型: '防御',
        描述: '采取守势，本回合受到的伤害减半',
    });

    const 存活敌人 = 敌方列表.filter((e) => (e.当前血量 || 0) > 0);
    if (存活敌人.length > 0) {
        行动.push({
            id: 'retreat',
            名称: '撤退',
            类型: '撤退',
            描述: '尝试脱离战斗',
        });
    }

    return 行动;
}

// ---- 战斗行动执行结果 ----

export interface 战斗行动结果 {
    成功: boolean;
    伤害?: 伤害结果;
    状态变化: string[];
    描述: string;
}

export function 执行战斗行动(
    行动: 战斗行动选项,
    角色属性: 玩家战斗属性,
    目标: 战斗敌方信息 | null
): 战斗行动结果 {
    const 状态变化: string[] = [];

    switch (行动.类型) {
        case '攻击': {
            if (!目标) return { 成功: false, 状态变化: [], 描述: '没有可攻击的目标' };
            const 伤害 = 计算伤害(
                角色属性.攻击力,
                目标.防御力,
                角色属性.暴击率,
                0,
                角色属性.伤害加成百分比
            );
            状态变化.push(`敌方${目标.名字}血量 -${伤害.最终伤害}`);
            return { 成功: true, 伤害, 状态变化, 描述: 伤害.描述 };
        }

        case '技能': {
            if (!目标) return { 成功: false, 状态变化: [], 描述: '没有可释放技能的目标' };
            const 技能基础伤害 = 0;
            const 伤害 = 计算伤害(
                角色属性.攻击力,
                目标.防御力,
                角色属性.暴击率,
                0,
                角色属性.伤害加成百分比,
                技能基础伤害
            );
            状态变化.push(`内力 -${行动.消耗内力 || 0}`);
            状态变化.push(`敌方${目标?.名字 || '目标'}血量 -${伤害.最终伤害}`);
            return { 成功: true, 伤害, 状态变化, 描述: `施展${行动.名称}，${伤害.描述}` };
        }

        case '道具': {
            状态变化.push('使用道具');
            return { 成功: true, 状态变化, 描述: `使用了${行动.名称}` };
        }

        case '防御': {
            状态变化.push('进入防御姿态，本回合受到的伤害减半');
            return { 成功: true, 状态变化, 描述: '你采取守势，准备抵御下一波攻击' };
        }

        case '撤退': {
            const 撤退成功 = Math.random() < 0.5;
            if (撤退成功) {
                状态变化.push('成功脱离战斗');
                return { 成功: true, 状态变化, 描述: '你抓住破绽，成功脱离了战斗' };
            } else {
                状态变化.push('撤退失败，继续缠斗');
                return { 成功: false, 状态变化, 描述: '敌人封锁了退路，撤退失败！' };
            }
        }

        default:
            return { 成功: false, 状态变化: [], 描述: '未知的行动类型' };
    }
}
