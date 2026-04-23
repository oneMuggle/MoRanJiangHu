/**
 * ImageManager Module Re-exports
 * Main entry point for ImageManager components
 */

// Tab Components
export { ManualTab } from './tabs/ManualTab';
export { LibraryTab } from './tabs/LibraryTab';
export { SceneTab } from './tabs/SceneTab';
export { QueueTab } from './tabs/QueueTab';
export { HistoryTab } from './tabs/HistoryTab';
export { RulesTab } from './tabs/RulesTab';

// Hooks
export { useImageManagerUI, type ImageManagerUIState, type ImageManagerUISetters } from './hooks/useImageManagerUI';

// Utils - Constants
export {
    状态样式,
    状态文案,
    队列状态样式,
    队列状态文案,
    来源文案,
    生图阶段中文映射,
    标签按钮样式,
    次级按钮样式,
    主按钮样式,
    卡片样式,
    小标题样式,
    摘要卡片样式
} from './utils/imageManagerConstants';

// Utils - Helpers
export {
    获取生图阶段中文,
    从任务状态推导阶段,
    获取NPC构图文案,
    格式化时间,
    任务标识匹配NPC,
    从任务标识提取NPCID,
    读取NPC展示摘要,
    读取角色锚点特征摘要,
    角色锚点有可用内容,
    生成预设ID,
    手动尺寸基准,
    获取手动尺寸预设,
    预设输入拦截键盘事件,
    统计卡,
    空状态
} from './utils/imageManagerHelpers';

// Default exports for backward compatibility
export { default as ImageManagerModal } from '../ImageManagerModal';