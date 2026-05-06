// 状态转换引擎 — 子模块统一导出
// 从原 stateTransforms.ts 拆分

export { 规范化环境信息, 构建完整地点文本 } from './environmentNormalization';
export { 规范化角色物品容器映射 } from './itemContainerMapping';
export { 标准化单个NPC, 合并NPC对象, 合并同名NPC列表 } from './npcNormalization';
export { 规范化社交列表 } from './socialListNormalization';
