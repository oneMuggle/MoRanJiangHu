export type 小说写作来源类型 = 'novel' | 'txt' | 'json';

export type 小说写作任务状态类型 = 'idle' | 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

export type 小说写作章节状态类型 = 'outline' | 'draft' | 'revised' | 'final';

export type 小说写作角色定位类型 = 'protagonist' | 'supporting' | 'antagonist';

export interface 小说写作大纲结构 {
    世界观: string;
    主线剧情: string;
    支线剧情: string[];
    预计章节数: number;
    时代背景: string;
    核心冲突: string;
}

export interface 小说写作角色结构 {
    id: string;
    名称: string;
    定位: 小说写作角色定位类型;
    描述: string;
    性格: string;
    外貌: string;
    背景故事: string;
    人物关系: string[];
}

export interface 小说写作章节结构 {
    id: string;
    序号: number;
    标题: string;
    内容: string;
    大纲: string;
    状态: 小说写作章节状态类型;
    字数: number;
    createdAt: number;
    updatedAt: number;
}

export interface 小说写作数据集结构 {
    id: string;
    标题: string;
    作者: string;
    简介: string;
    schemaVersion: number;
    大纲: 小说写作大纲结构;
    角色列表: 小说写作角色结构[];
    章节列表: 小说写作章节结构[];
    文风配置: {
        时代: string;
        参考作品: string[];
    };
    createdAt: number;
    updatedAt: number;
}

export interface 小说写作任务进度结构 {
    总章节数: number;
    已完成章节数: number;
    失败章节数: number;
    当前章节索引: number;
    百分比: number;
}

export interface 小说写作任务结构 {
    id: string;
    数据集ID: string;
    名称: string;
    状态: 小说写作任务状态类型;
    当前阶段: 'idle' | 'outline' | 'characters' | 'writing' | 'revising' | 'completed' | 'failed';
    当前章节索引: number;
    已完成章节ID列表: string[];
    失败章节ID列表: string[];
    最近错误?: string;
    进度: 小说写作任务进度结构;
    createdAt: number;
    updatedAt: number;
    lastRunAt?: number;
    completedAt?: number;
}
