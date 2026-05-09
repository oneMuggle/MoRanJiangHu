// 故事状态工厂 — 子模块统一导出

export { createGameStateAccess, type GameStateAccess, type GameStateSlice, type GameStoreSlice, type 世界演变时间管理器 } from './gameStateAccess';
export { createRefRegistry, useSyncRef, type UseGameRefs } from './refRegistry';

export type { 开场命令基态 } from './historyUtils';

export {
    创建开场空白角色,
    创建空门派状态,
    创建占位门派状态,
    规范化门派状态,
    创建开场空白环境,
    创建开场空白世界,
    规范化世界状态,
    创建开场空白战斗,
    规范化战斗状态,
    创建开场空白剧情,
    规范化剧情状态,
    创建空剧情规划,
    规范化剧情规划状态
} from './factories';

export {
    创建空女主剧情规划,
    规范化女主剧情规划状态,
    创建空同人剧情规划,
    规范化同人剧情规划状态,
    创建空同人女主剧情规划,
    规范化同人女主剧情规划状态
} from './planningNormalizers';

export {
    创建开场基础状态,
    创建开场命令基态,
    构建前端清空开场状态,
    创建空记忆系统,
    战斗结束自动清空,
    按回合窗口裁剪历史
} from './historyUtils';
