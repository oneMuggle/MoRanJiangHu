/**
 * 设备变量绑定定义
 * 通讯行为到游戏变量的映射（精力消耗、好感度修正、情报获取等）
 */

import type { DeviceMessage } from '../mobileDevice';
import type { 角色数据结构 } from './character';

// 时代对应的精力消耗
const 时代精力消耗: Record<string, number> = {
    ancient: 1,       // 古代：玉简/飞鸽，消耗少量体力
    modern: 2,        // 现代：智能手机，消耗较少精力
    near_future: 3,    // 近未来：数据终端，消耗中等精力
    tech: 4,          // 未来科技，消耗较多精力
    holographic: 5,   // 全息投影，消耗较多精力
    consciousness: 3,  // 意识终端，消耗意识力
};

/**
 * 查看手机消息消耗的精力
 * @param eraCategory 时代类别
 * @returns 消耗的精力值
 */
export function 获取查看消息精力消耗(eraCategory: string): number {
    return 时代精力消耗[eraCategory] || 2;
}

/**
 * 通讯频率对 NPC 好感度的基础修正
 * @param 消息数量 最近消息数量
 * @returns 好感度修正值（正数表示提升）
 */
export function 获取通讯频率好感修正(消息数量: number): number {
    if (消息数量 >= 10) return 5;
    if (消息数量 >= 5) return 2;
    if (消息数量 >= 1) return 1;
    return 0;
}

/**
 * 判断消息是否为情报类内容
 * @param message 设备消息
 * @returns 是否为情报
 */
export function 是情报类消息(message: DeviceMessage): boolean {
    const 情报关键词 = ['情报', '秘密', '阴谋', '线索', '密报', '探子', '线人', '机密'];
    const content = (message.title + ' ' + message.content).toLowerCase();
    return 情报关键词.some(kw => content.includes(kw));
}

/**
 * 从设备消息中提取情报内容
 * @param messages 设备消息列表
 * @returns 情报列表
 */
export function 提取情报内容(messages: DeviceMessage[]): Array<{ 标题: string; 内容: string; 来源: string }> {
    return messages
        .filter(是情报类消息)
        .map(msg => ({
            标题: msg.title,
            内容: msg.content,
            来源: msg.sender || '未知来源',
        }));
}

/**
 * 计算设备使用对角色状态的影响
 * @param eraCategory 时代类别
 * @param 消息数量 查看的消息数量
 * @param 角色 角色数据
 * @returns 影响结果
 */
export function 计算设备使用影响(
    eraCategory: string,
    消息数量: number,
    角色: 角色数据结构 | null
): {
    精力消耗: number;
    好感修正: number;
    获得情报: Array<{ 标题: string; 内容: string; 来源: string }>;
} {
    const 精力消耗 = 获取查看消息精力消耗(eraCategory) * Math.min(消息数量, 5);
    const 好感修正 = 获取通讯频率好感修正(消息数量);

    return {
        精力消耗,
        好感修正,
        获得情报: [],
    };
}

/**
 * 特殊通讯场景类型
 */
export type 特殊通讯场景 = '战斗求援' | '深夜推送' | '跨时代延迟';

/**
 * 判断是否为紧急通讯场景
 * @param message 设备消息
 * @returns 是否紧急
 */
export function 是紧急通讯场景(message: DeviceMessage): boolean {
    const 紧急关键词 = ['求援', '紧急', '危急', '速来', '求教', 'SOS', '求救'];
    const content = (message.title + ' ' + message.content);
    return 紧急关键词.some(kw => content.includes(kw));
}

/**
 * 获取消息的时代差异延迟（毫秒）
 * @param eraCategory 时代类别
 * @returns 延迟时间
 */
export function 获取消息延迟(eraCategory: string): number {
    switch (eraCategory) {
        case 'ancient': return 3600000;     // 1小时（飞鸽传书）
        case 'modern': return 0;            // 即时
        case 'near_future': return 0;       // 即时
        case 'tech': return 0;               // 即时
        case 'holographic': return 0;       // 即时
        case 'consciousness': return 0;     // 即时
        default: return 0;
    }
}
