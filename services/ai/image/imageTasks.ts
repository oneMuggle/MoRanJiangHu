// Thin facade — all logic lives in focused modules under services/ai/image/.
// This file re-exports all public APIs for backward compatibility.

// ==================== Types ====================

export interface 图片生成结果 {
    图片URL?: string;
    本地路径?: string;
    原始响应?: string;
    最终正向提示词?: string;
    最终负向提示词?: string;
}

export type 图片提示词装配结果 = {
    前置正向提示词: string;
    主体正向提示词: string;
    后置正向提示词: string;
    最终正向提示词: string;
    最终负向提示词: string;
    带内联负面提示词的正向提示词: string;
    尺寸: string;
    宽度: number;
    高度: number;
};

export type {
    图片连接测试结果,
    PNG元数据解析结果,
    PNG画风提炼结果,
    角色锚点提取结果,
    场景角色锚点输入,
    NPC提示词选项 as NPC提示词选项类型,
    NPC秘档部位提示词选项 as NPC秘档部位提示词选项类型
} from './imageTasksTypes';

// ==================== PNG Parsing ====================

export { 解析PNG字节元数据, 解析PNG文件元数据 } from './pngParser';

// ==================== PNG Style/Anchor Extraction ====================

export { 净化PNG复刻参数, 提炼PNG画风标签, 提取角色锚点提示词 } from './anchorExtractor';

// ==================== Prompt Building ====================

export {
    buildNpcDirectImagePrompt,
    buildNpcSecretPartDirectImagePrompt,
    generateNpcSecretPartImagePrompt,
    generateNpcImagePrompt,
    generateSceneImagePrompt,
    构建最终图片提示词,
    type NPC提示词选项,
    type NPC秘档部位提示词选项
} from './promptBuilder';

// ==================== Backend Execution ====================

export { generateImageByPrompt } from './backends';

// ==================== Connection Testing ====================

export { testImageConnection } from './connectionTests';

// ==================== Persistence ====================

export { persistImageAssetLocally } from './persistence';

// ==================== Tokenizer / Serializer ====================

export {
    清理生图词组输出,
    按逗号拆分提示词,
    去重提示词片段,
    合并正向提示词片段,
    规范化Artist标签大小写,
    转换NAI括号权重语法,
    清洗NAI脏权重语法,
    清洗最终主体提示词,
    保守补全NAI权重语法,
    构建角色锚点注入提示词,
    构建角色锚点稳定外观提示词,
    构建NAI基础人数标签,
    序列化词组转化器输出,
    归一化单段词组转化器输出,
    解析场景词组响应,
    解析可能是JSON字符串,
    提取图片生成结果
} from './imageTokenizer';
