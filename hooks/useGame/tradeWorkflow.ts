// NPC交易与经济系统
// 处理买卖物品、NPC商店、讨价还价

import { 角色金钱 } from '../../models/domain/character';
import { NPC结构 } from '../../models/domain/social';

// Use the item type that matches the character model (from types.ts re-export)
// We use a generic shape to avoid import conflict
interface 交易物品 {
    ID: string;
    名称: string;
    描述: string;
    价值: number;
    堆叠数量: number;
}

// ---- 货币换算 ----

const 银两铜钱 = 100;
const 金元宝银子 = 1000;

export function 铜钱转银子(铜钱: number): number {
    return 铜钱 / 银两铜钱;
}

export function 银子转铜钱(银子: number): number {
    return Math.round(银子 * 银两铜钱);
}

export function 计算总铜钱(金钱: 角色金钱): number {
    return 金钱.金元宝 * 金元宝银子 * 银两铜钱 + 金钱.银子 * 银两铜钱 + 金钱.铜钱;
}

// ---- 价格计算 ----

export interface 价格计算结果 {
    基础价格: number;
    最终价格: number;
    折扣率: number;
    说明: string;
}

export function 计算购买价格(
    物品: 交易物品,
    卖家NPC: NPC结构 | null,
    好感度修正: number = 0
): 价格计算结果 {
    const 基础价格 = 物品.价值;

    const 好感度修正系数 = 好感度修正 > 0 ? Math.min(好感度修正 / 100, 0.3) : Math.max(好感度修正 / 100, -0.5);
    const 折扣率 = 1 - 好感度修正系数;

    const NPC加价 = 卖家NPC ? 0.1 : 0;

    const 最终价格 = Math.max(1, Math.round(基础价格 * (折扣率 + NPC加价)));

    return {
        基础价格,
        最终价格,
        折扣率: Math.round((1 - 最终价格 / 基础价格) * 100) / 100,
        说明: 好感度修正 > 0 ? '好感度高，获得优惠' : 好感度修正 < 0 ? '好感度低，价格偏高' : '标准价格',
    };
}

export function 计算出售价格(
    物品: 交易物品,
    _买家NPC: NPC结构 | null
): 价格计算结果 {
    const 基础价格 = 物品.价值;
    const 折价率 = 0.5;
    const 最终价格 = Math.max(1, Math.round(基础价格 * 折价率));

    return {
        基础价格,
        最终价格,
        折扣率: Math.round((1 - 折价率) * 100) / 100,
        说明: '物品折旧出售',
    };
}

// ---- 交易执行 ----

export interface 购买结果 {
    成功: boolean;
    新金钱: 角色金钱;
    新物品列表: 交易物品[];
    错误?: string;
}

export function 执行购买(
    角色金钱: 角色金钱,
    角色物品列表: 交易物品[],
    物品: 交易物品,
    价格: 价格计算结果
): 购买结果 {
    const 总铜钱 = 计算总铜钱(角色金钱);
    if (总铜钱 < 价格.最终价格) {
        return { 成功: false, 新金钱: 角色金钱, 新物品列表: 角色物品列表, 错误: '铜钱不足' };
    }

    const 剩余铜钱 = 总铜钱 - 价格.最终价格;
    const 新金钱 = { ...角色金钱 };

    新金钱.金元宝 = Math.floor(剩余铜钱 / (金元宝银子 * 银两铜钱));
    let 余数 = 剩余铜钱 % (金元宝银子 * 银两铜钱);
    新金钱.银子 = Math.floor(余数 / 银两铜钱);
    新金钱.铜钱 = 余数 % 银两铜钱;

    const 新物品列表 = [...角色物品列表, { ...物品, 堆叠数量: 物品.堆叠数量 || 1 }];

    return { 成功: true, 新金钱, 新物品列表 };
}

export interface 出售结果 {
    成功: boolean;
    新金钱: 角色金钱;
    新物品列表: 交易物品[];
    错误?: string;
}

export function 执行出售(
    角色金钱: 角色金钱,
    角色物品列表: 交易物品[],
    物品ID: string,
    价格: 价格计算结果
): 出售结果 {
    const 物品索引 = 角色物品列表.findIndex(i => i.ID === 物品ID);
    if (物品索引 < 0) {
        return { 成功: false, 新金钱: 角色金钱, 新物品列表: 角色物品列表, 错误: '物品不存在' };
    }

    const 新物品列表 = [...角色物品列表];
    新物品列表.splice(物品索引, 1);

    const 新金钱 = { ...角色金钱 };
    新金钱.铜钱 += 价格.最终价格;

    return { 成功: true, 新金钱, 新物品列表 };
}

// ---- 工具函数 ----

export function 格式化货币(金钱: 角色金钱): string {
    const parts: string[] = [];
    if (金钱.金元宝 > 0) parts.push(`${金钱.金元宝}金`);
    if (金钱.银子 > 0) parts.push(`${金钱.银子}两`);
    if (金钱.铜钱 > 0) parts.push(`${金钱.铜钱}文`);
    return parts.length > 0 ? parts.join('') : '0文';
}
