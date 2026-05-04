import type { OpeningConfig, WorldGenConfig } from '../types';

export type 属性分配 = {
    力量: number;
    敏捷: number;
    体质: number;
    根骨: number;
    悟性: number;
    福源: number;
};

export type 开局预设方案结构 = {
    id: string;
    名称: string;
    简介: string;
    worldConfig: Partial<WorldGenConfig>;
    character: {
        姓名: string;
        性别: string;
        年龄: number;
        出生月: number;
        出生日: number;
        外貌: string;
        性格: string;
        属性: 属性分配;
        背景名称: string;
        天赋名称列表: string[];
        气运列表?: any[];
    };
    openingConfig?: OpeningConfig;
    openingStreaming?: boolean;
    openingExtraRequirement?: string;
};

export const 开局预设方案列表: 开局预设方案结构[] = [
    {
        id: 'campus_freshman',
        名称: '大一新生',
        简介: '刚踏入校园的你，带着对大学生活的无限憧憬，一切从零开始',
        worldConfig: { 时代配置ID: 'contemporary_campus' },
        character: {
            姓名: '',
            性别: '男',
            年龄: 18,
            出生月: 9,
            出生日: 1,
            外貌: '青涩中带着朝气，眼神里满是好奇',
            性格: '开朗活泼，对未来充满期待，偶尔有些迷茫',
            属性: { 力量: 5, 敏捷: 6, 体质: 6, 根骨: 5, 悟性: 8, 福源: 7 },
            背景名称: '学生会干事',
            天赋名称列表: ['过目不忘', '人情练达'],
            气运列表: [{ 名称: '校园风云人物' }],
        },
    },
    {
        id: 'campus_transfer',
        名称: '转学生',
        简介: '因家庭变故转入这所学校，陌生的环境里隐藏着意想不到的邂逅',
        worldConfig: { 时代配置ID: 'contemporary_campus' },
        character: {
            姓名: '',
            性别: '男',
            年龄: 19,
            出生月: 3,
            出生日: 15,
            外貌: '略显沉稳的外表下藏着一丝忧郁，引人注目',
            性格: '内敛低调，不善言辞但内心细腻，对新环境保持警惕',
            属性: { 力量: 6, 敏捷: 5, 体质: 5, 根骨: 6, 悟性: 7, 福源: 8 },
            背景名称: '转学生',
            天赋名称列表: ['过目不忘', '稳扎稳打'],
            气运列表: [{ 名称: '命运邂逅' }],
        },
    },
    {
        id: 'campus_grad',
        名称: '研究生',
        简介: '科研与生活的双重压力之下，实验室里的故事才刚刚开始',
        worldConfig: { 时代配置ID: 'contemporary_campus' },
        character: {
            姓名: '',
            性别: '男',
            年龄: 23,
            出生月: 6,
            出生日: 20,
            外貌: '戴着黑框眼镜，气质斯文，有着学者特有的书卷气',
            性格: '专注执着，对科研充满热情，生活上有些笨拙',
            属性: { 力量: 4, 敏捷: 4, 体质: 5, 根骨: 6, 悟性: 9, 福源: 6 },
            背景名称: '实验室研究生',
            天赋名称列表: ['过目不忘', '静心观微'],
            气运列表: [{ 名称: '学术机缘' }],
        },
    },
];
