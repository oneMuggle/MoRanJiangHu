import type { 当前可用接口结构 } from '../../../utils/apiConfig';
import type { PNG解析参数结构, 角色锚点结构, 图片词组序列化策略类型, 文生图后端类型 } from '../../../models/system';

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

export type PNG元数据解析结果 = {
    来源: 'novelai' | 'sd_webui' | 'unknown';
    正面提示词: string;
    负面提示词: string;
    参数?: PNG解析参数结构;
    原始元数据: string;
    元数据标签?: Record<string, string>;
};

export type PNG画风提炼结果 = {
    画师串: string;
    原始正面提示词: string;
    剥离后正面提示词: string;
    AI提炼正面提示词: string;
    正面提示词: string;
    负面提示词: string;
    画师命中项: string[];
    说明?: string;
};

export type 角色锚点提取结果 = {
    名称: string;
    正面提示词: string;
    负面提示词: string;
    结构化特征?: 角色锚点结构['结构化特征'];
    说明?: string;
};

export interface 图片连接测试结果 {
    ok: boolean;
    detail: string;
    backendType: 文生图后端类型;
}

export type NPC提示词选项 = {
    构图?: '头像' | '半身' | '立绘';
    画风?: 当前可用接口结构['画风'];
    额外要求?: string;
    后端类型?: 当前可用接口结构['图片后端类型'];
    启用画师串预设?: boolean;
    兼容模式?: boolean;
    风格提示词输入?: string;
    角色锚点?: {
        名称?: string;
        正面提示词: string;
        负面提示词?: string;
        结构化特征?: 角色锚点结构['结构化特征'];
    };
};

export type NPC秘档部位提示词选项 = {
    部位: import('../../../models/imageGeneration').香闺秘档部位类型;
    画风?: 当前可用接口结构['画风'];
    额外要求?: string;
    后端类型?: 当前可用接口结构['图片后端类型'];
    启用画师串预设?: boolean;
    兼容模式?: boolean;
    风格提示词输入?: string;
    角色锚点?: {
        名称?: string;
        正面提示词: string;
        负面提示词?: string;
        结构化特征?: 角色锚点结构['结构化特征'];
    };
};

export type 分词器任务类型 = '角色' | '场景' | '部位特写';

export type 场景生成类型 = '场景快照' | '风景场景';

export type 场景角色锚点输入 = {
    名称: string;
    正面提示词: string;
    负面提示词?: string;
    结构化特征?: 角色锚点结构['结构化特征'];
};
