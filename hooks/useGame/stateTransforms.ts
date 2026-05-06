// 状态转换引擎 — 向后兼容入口
// 所有功能已拆分为 transforms/ 子目录
// 原有 import 路径保持不变，此处统一 re-export

export { 规范化环境信息, 构建完整地点文本 } from './transforms/environmentNormalization';
export { 规范化角色物品容器映射 } from './transforms/itemContainerMapping';
export { 标准化单个NPC, 合并NPC对象, 合并同名NPC列表 } from './transforms/npcNormalization';
export { 规范化社交列表 } from './transforms/socialListNormalization';
