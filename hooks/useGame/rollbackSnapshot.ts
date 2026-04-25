/** 回档快照系统 */

import type {
    角色数据结构,
    环境信息结构,
    世界数据结构,
    战斗状态结构,
    详细门派结构,
    剧情系统结构,
    剧情规划结构,
    女主剧情规划结构,
    同人剧情规划结构,
    同人女主剧情规划结构,
    记忆系统结构,
    视觉设置结构,
    场景图片档案,
    NPC结构
} from '../../types';
import * as dbService from '../../services/dbService';

export type 回合快照结构 = {
    玩家输入: string;
    游戏时间: string;
    回档前状态: {
        角色: 角色数据结构;
        环境: 环境信息结构;
        社交: NPC结构[];
        世界: 世界数据结构;
        战斗: 战斗状态结构;
        玩家门派: 详细门派结构;
        任务列表: any[];
        约定列表: any[];
        剧情: 剧情系统结构;
        剧情规划: 剧情规划结构;
        女主剧情规划?: 女主剧情规划结构;
        同人剧情规划?: 同人剧情规划结构;
        同人女主剧情规划?: 同人女主剧情规划结构;
        记忆系统: 记忆系统结构;
    };
    回档前持久态: {
        视觉设置: 视觉设置结构;
        场景图片档案: 场景图片档案;
    };
    回档前历史: any[];
};

type DeepClone = <T,>(data: T) => T;

export const 创建回档快照系统 = (deps: {
    回合快照栈Ref: React.RefObject<回合快照结构[]>;
    可重Roll计数: number;
    set可重Roll计数: (v: number) => void;
    最近自动存档时间戳Ref: React.RefObject<number>;
    最近自动存档签名Ref: React.RefObject<string>;
    深拷贝: DeepClone;
    规范化角色物品容器映射: (data: any) => any;
    规范化环境信息: (data: any) => any;
    规范化社交列表: (data: any[]) => any[];
    规范化世界状态: (data: any) => any;
    规范化剧情状态: (data: any) => any;
    规范化剧情规划状态: (data: any) => any;
    规范化女主剧情规划状态: (data?: any) => any;
    规范化同人剧情规划状态: (data?: any) => any;
    规范化同人女主剧情规划状态: (data?: any) => any;
    应用并同步记忆系统: (memory: 记忆系统结构) => 记忆系统结构;
    设置历史记录: (v: any[]) => void;
    应用视觉设置到状态: (v: Partial<视觉设置结构> | null | undefined) => void;
    应用场景图片档案到状态: (v: 场景图片档案 | null | undefined) => void;
}) => {
    const 同步重Roll计数 = () => {
        deps.set可重Roll计数(deps.回合快照栈Ref.current.length);
    };

    const 清空重Roll快照 = () => {
        deps.回合快照栈Ref.current = [];
        同步重Roll计数();
    };

    const 推入重Roll快照 = (snapshot: 回合快照结构) => {
        deps.回合快照栈Ref.current.push(snapshot);
        同步重Roll计数();
    };

    const 弹出重Roll快照 = (): 回合快照结构 | null => {
        const snapshot = deps.回合快照栈Ref.current.pop() || null;
        同步重Roll计数();
        return snapshot;
    };

    const 回档到快照 = (
        snapshot: 回合快照结构,
        options?: { 保留图片状态?: boolean }
    ) => {
        deps.设置历史记录(deps.深拷贝(snapshot.回档前历史));
        deps.应用并同步记忆系统(deps.深拷贝(snapshot.回档前状态.记忆系统));
        if (options?.保留图片状态 !== true) {
            deps.应用视觉设置到状态(deps.深拷贝(snapshot.回档前持久态?.视觉设置 || {}));
            deps.应用场景图片档案到状态(deps.深拷贝(snapshot.回档前持久态?.场景图片档案 || {}));
        }
    };

    const 重置自动存档状态 = () => {
        deps.最近自动存档时间戳Ref.current = 0;
        deps.最近自动存档签名Ref.current = '';
    };

    const 删除最近自动存档并重置状态 = async (): Promise<void> => {
        try {
            await dbService.删除最近自动存档();
        } catch (error) {
            console.error('删除最近自动存档失败', error);
        } finally {
            重置自动存档状态();
        }
    };

    return {
        同步重Roll计数,
        清空重Roll快照,
        推入重Roll快照,
        弹出重Roll快照,
        回档到快照,
        重置自动存档状态,
        删除最近自动存档并重置状态
    };
};
