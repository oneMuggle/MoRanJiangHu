/**
 * 域分组导出
 *
 * 所有功能域的入口文件。
 */

export { createImageDomain, type ImageDomainInput } from './imageDomain';

// memoryDomain 已创建但因循环依赖暂未集成到 useGame.ts
// 依赖关系：useFeatureFlags 需要 应用并同步记忆系统 / 清空变量生成上下文缓存
// 而 memoryDomain 需要 世界演变功能已开启（来自 useFeatureFlags）
// 解决方案：可考虑将记忆处理器提前创建，或将 memoryDomain 拆分为两个子域
export { createMemoryDomain, type MemoryDomainInput } from './memoryDomain';
