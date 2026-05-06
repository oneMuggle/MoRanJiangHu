// 事件触发器 — 向后兼容入口
// 已拆分为 eventTrigger/ 子目录
export { 计算触发回合, 检查到期事件, 构建事件注入提示词 } from './eventTrigger/core';
export { 解析事件更新信号 } from './eventTrigger/promptAndParse';
export { 计算事件新状态, 批量更新事件状态 } from './eventTrigger/stateManagement';
export { 创建回合偏移事件, 创建绝对回合事件, 创建条件事件 } from './eventTrigger/factories';
export { 求值增强条件, 检查周期性触发, 获取下一触发回合, 查找链式触发事件, 清理已过期事件, 处理事件组互斥, 获取分组待触发事件, 更新周期触发计数, 检查事件过期 } from './eventTrigger/v2Enhanced';
export { 获取事件描述 } from './eventTrigger/utilities';
