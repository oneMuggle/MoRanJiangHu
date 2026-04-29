// 时代主题方案 — 三层树状结构
// Epoch (时代) → Era (纪元) → SubEra (子纪元)
// 顶层元数据定义基调，中层继承并扩展，叶子节点定义具体风格
//
// 继承规则：子节点无某元数据时，向上追溯最近的父节点定义

// ============================================================
// 接口定义
// ============================================================

export interface EraColors {
    'ink-black': string;      // RGB "x x x" 格式
    'ink-gray': string;
    primary: string;
    'primary-dark': string;
    secondary: string;
    accent: string;
    'paper-white': string;
}

export interface EraTypography {
    页面标题: string;
    正文: string;
    等宽: string;
}

export type UIDecoration =
    | 'scanline'      // CRT扫描线
    | 'grain'         // 胶片颗粒
    | 'ink-bleed'     // 水墨晕染
    | 'neon-flicker'  // 霓虹闪烁
    | 'holographic';  // 全息效果

export interface EraUIStyle {
    // 文案风格：古典/现代/科技/复古/科幻
    style: 'classical' | 'modern' | 'tech' | 'retro' | 'scifi';
    // 语气：正式/休闲/古风/军事/商业
    tone: 'formal' | 'casual' | 'archaic' | 'military' | 'commercial';
    // 装饰特效
    decorations: UIDecoration[];
}

/** 提示词变量 — 用于世界观生成、角色创建、故事写作等 AI 提示词注入 */
export interface EraPromptVars {
    /** 社会形态描述，用于世界观生成 */
    社会形态: string;
    /** 科技水平，决定可用技术/物品 */
    科技水平: string;
    /** 力量体系（内力/灵力/神格/义体/灵能等） */
    力量体系: string;
    /** 叙事视角偏好 */
    叙事视角: string;
    /** 描写重点 */
    描写重点: string;
    /** 对话占比建议 */
    对话占比: string;
    /** 时代禁忌（告诉 AI 不要写什么） */
    禁忌: string[];
}

/** 开局场景池 */
export interface EraOpeningScene {
    id: string;
    name: string;
    description: string;
    /** 对应场景图片的 asset ID */
    imageId?: string;
}

/** 角色原型模板 */
export interface EraCharacterArchetype {
    id: string;
    name: string;
    description: string;
    /** 典型穿着/外观 */
    appearance: string;
    /** 典型能力标签 */
    abilities: string[];
}

export type EpochDepth = 0 | 1 | 2;

/** UI文案（兼容旧接口） */
export interface 时代主题UI文案 {
    [key: string]: string;
}

/** 树状节点，叶子节点（depth=2）包含完整元数据 */
export interface EraNode {
    id: string;               // 全局唯一，如 "ancient_eastern_wuxia"
    name: string;             // 显示名称，如 "古代东方·武侠"
    depth: EpochDepth;        // 0=Epoch, 1=Era, 2=SubEra
    parent: string | null;    // 父节点ID，根节点为 null

    // 元数据（叶子节点必填，父节点定义全局基调）
    colors?: EraColors;
    typography?: EraTypography;
    uiStyle?: EraUIStyle;
    bgmTags?: string[];       // BGM风格标签，如 ["民乐", "武侠", "古风"]
    artStyle?: string;        // 美术风格参考，如 "水墨摄影", "赛博霓虹"
    description?: string;     // 描述

    // 界面文案（叶子节点专用，兼容旧接口）
    uiCopy?: 时代主题UI文案;

    // AI 提示词变量（全层可用，叶子节点可覆盖）
    promptVars?: EraPromptVars;

    // 开局场景池（仅 SubEra）
    openingScenes?: EraOpeningScene[];

    // 角色原型模板（仅 SubEra）
    characterArchetypes?: EraCharacterArchetype[];

    // 文风示例段落（仅 SubEra）
    writingSamples?: string[];

    // 核心冲突类型（仅 SubEra）
    conflictTypes?: string[];

    // 子节点（仅父节点有）
    children?: EraNode[];
}

/** 完整树根节点类型 */
export interface EraTree {
    name: string;
    children: EraNode[];
}

// ============================================================
// 辅助函数：构建树
// ============================================================

function makeNode(
    id: string,
    name: string,
    depth: EpochDepth,
    parent: string | null,
    extra: Partial<Pick<EraNode, 'colors' | 'typography' | 'uiStyle' | 'bgmTags' | 'artStyle' | 'description' | 'uiCopy' | 'promptVars' | 'openingScenes' | 'characterArchetypes' | 'writingSamples' | 'conflictTypes'>> = {},
    children: EraNode[] = []
): EraNode {
    return { id, name, depth, parent, ...extra, children: children.length > 0 ? children : undefined };
}

// ============================================================
// Epoch -1: 远古 (Primordial)
// ============================================================

const primordialEpoch: EraNode = makeNode(
    'primordial', '远古', 0, null,
    {
        description: '史前时期，部落文明，文字未诞生，巫术与信仰主导',
        colors: {
            'ink-black': '8 6 4',
            'ink-gray': '30 25 18',
            'primary': '180 120 60',
            'primary-dark': '110 70 30',
            'secondary': '100 80 50',
            'accent': '200 60 30',
            'paper-white': '210 195 170',
        },
        typography: {
            页面标题: "'SimSun', 'STSong', 'Noto Serif SC', serif",
            正文: "'SimSun', 'Noto Serif SC', serif",
            等宽: "'SimSun', monospace",
        },
        uiStyle: {
            style: 'classical',
            tone: 'archaic',
            decorations: ['grain'],
        },
    },
    [
        // ── Era 1: 全球原始文明 ──
        makeNode(
            'primordial_global', '全球原始文明', 1, 'primordial',
            {
                description: '全球各地的原始部落文明，巫术、图腾、祖先崇拜',
                colors: {
                    'ink-black': '8 6 4',
                    'ink-gray': '30 25 18',
                    'primary': '180 120 60',
                    'primary-dark': '110 70 30',
                    'secondary': '100 80 50',
                    'accent': '200 60 30',
                    'paper-white': '210 195 170',
                },
                typography: {
                    页面标题: "'SimSun', 'STSong', 'Noto Serif SC', serif",
                    正文: "'SimSun', 'Noto Serif SC', serif",
                    等宽: "'SimSun', monospace",
                },
                uiStyle: {
                    style: 'classical',
                    tone: 'archaic',
                    decorations: ['grain'],
                },
                bgmTags: ['鼓', '人声吟唱', '原始', '部落'],
                artStyle: '岩画与骨刻风格',
                promptVars: {
                    社会形态: '部落制，酋长与巫觋掌握权力，血缘关系是社会纽带',
                    科技水平: '石器、骨器、火的使用，文字未诞生',
                    力量体系: '巫术、图腾信仰、祖先灵魂力量、狩猎技巧',
                    叙事视角: '第三人称有限视角',
                    描写重点: '自然崇拜、生存狩猎、部落冲突、神话传说',
                    对话占比: '20%-30%',
                    禁忌: ['现代科技', '文字记载', '城市化'],
                },
            },
            [
                // SubEra: 非洲部落
                makeNode(
                    'primordial_african', '非洲部落', 2, 'primordial_global',
                    {
                        description: '部落战争、巫术、祖先崇拜',
                        colors: {
                            'ink-black': '10 8 4',
                            'ink-gray': '35 28 20',
                            'primary': '200 140 70',
                            'primary-dark': '130 85 35',
                            'secondary': '120 100 60',
                            'accent': '220 70 40',
                            'paper-white': '220 205 180',
                        },
                        typography: {
                            页面标题: "'SimSun', 'STSong', 'Noto Serif SC', serif",
                            正文: "'SimSun', 'Noto Serif SC', serif",
                            等宽: "'SimSun', monospace",
                        },
                        uiStyle: {
                            style: 'classical',
                            tone: 'archaic',
                            decorations: ['grain'],
                        },
                        bgmTags: ['鼓', '人声吟唱', '非洲', '部落'],
                        artStyle: '岩画·赭石色',
                        conflictTypes: ['部落战争', '巫术对抗', '祖先旨意', '生存竞争'],
                        promptVars: {
                            社会形态: '部落酋长制，长老会议，巫觋沟通神灵',
                            科技水平: '石器时代晚期，骨器制作，火的使用',
                            力量体系: '巫术咒语、图腾灵力、祖先庇护、狩猎技巧',
                            叙事视角: '第三人称有限视角',
                            描写重点: '部落祭祀、狩猎生存、部落冲突、巫术对决',
                            对话占比: '15%-25%',
                            禁忌: ['文字记载', '金属工具', '城市化'],
                        },
                        openingScenes: [
                                { id: 'pa_1', name: '部落篝火', description: '夜幕下的部落营地，篝火旁长老讲述祖先传说' },
                                { id: 'pa_2', name: '狩猎出征', description: '勇士们手持长矛，准备猎捕草原猛兽' },
                                { id: 'pa_3', name: '巫觋占卜', description: '部落巫觋以兽骨占卜，预视吉凶' }
                        ],
                    }
                ),
                // SubEra: 美洲原住民
                makeNode(
                    'primordial_americas', '美洲原住民', 2, 'primordial_global',
                    {
                        description: '玛雅/阿兹特克/印加文明前夕',
                        colors: {
                            'ink-black': '6 8 12',
                            'ink-gray': '28 30 40',
                            'primary': '180 80 60',
                            'primary-dark': '120 50 35',
                            'secondary': '60 140 100',
                            'accent': '230 170 40',
                            'paper-white': '215 210 195',
                        },
                        typography: {
                            页面标题: "'SimSun', 'STSong', 'Noto Serif SC', serif",
                            正文: "'SimSun', 'Noto Serif SC', serif",
                            等宽: "'SimSun', monospace",
                        },
                        uiStyle: {
                            style: 'classical',
                            tone: 'archaic',
                            decorations: ['grain'],
                        },
                        bgmTags: ['鼓', '排箫', '人声吟唱', '祭祀'],
                        artStyle: '金字塔壁画·矿物色',
                        conflictTypes: ['祭祀仪式', '领土争夺', '神谕指引', '文明冲突'],
                        promptVars: {
                            社会形态: '祭司阶层掌权，城邦林立，人祭仪式维系宇宙秩序',
                            科技水平: '石器时代，天文历法发达，阶梯农业',
                            力量体系: '祭司预言、神谕力量、血祭仪式、建筑技艺',
                            叙事视角: '第三人称有限视角',
                            描写重点: '祭祀仪式、天文观测、城邦竞争、神谕解读',
                            对话占比: '15%-25%',
                            禁忌: ['文字记载', '金属工具', '城市化'],
                        },
                        openingScenes: [
                                { id: 'pam_1', name: '羽蛇神殿', description: '雨林深处的古老神殿，羽蛇神的雕像威严矗立' },
                                { id: 'pam_2', name: '太阳祭典', description: '金字塔顶端，太阳祭典正在进行' },
                                { id: 'pam_3', name: '丛林猎场', description: '茂密的美洲丛林，猎人与野兽的对决' }
                        ],
                    }
                ),
                // SubEra: 北欧萨满
                makeNode(
                    'primordial_norse', '北欧萨满', 2, 'primordial_global',
                    {
                        description: '冰原生存、萨满仪式、图腾崇拜',
                        colors: {
                            'ink-black': '8 10 14',
                            'ink-gray': '25 28 38',
                            'primary': '140 170 200',
                            'primary-dark': '80 100 140',
                            'secondary': '180 60 50',
                            'accent': '220 200 100',
                            'paper-white': '200 210 225',
                        },
                        typography: {
                            页面标题: "'SimSun', 'STSong', 'Noto Serif SC', serif",
                            正文: "'SimSun', 'Noto Serif SC', serif",
                            等宽: "'SimSun', monospace",
                        },
                        uiStyle: {
                            style: 'classical',
                            tone: 'archaic',
                            decorations: ['grain'],
                        },
                        bgmTags: ['鼓', '人声吟唱', '北欧', '萨满'],
                        artStyle: '卢恩符文·冰原岩刻',
                        conflictTypes: ['严酷环境', '萨满仪式', '部落联盟', '图腾信仰'],
                        promptVars: {
                            社会形态: '冰原部落，萨满为精神领袖，血缘关系决定社会地位',
                            科技水平: '石器与骨器，火的使用，兽皮帐篷',
                            力量体系: '萨满通灵、卢恩符文、冰原生存、图腾守护',
                            叙事视角: '第三人称有限视角',
                            描写重点: '冰原生存、萨满仪式、图腾信仰、部落联盟',
                            对话占比: '15%-25%',
                            禁忌: ['文字记载', '金属工具', '城市化'],
                        },
                        openingScenes: [
                                { id: 'pn_1', name: '冰原行军', description: '北欧冰原上，部落队伍在风雪中艰难前行' },
                                { id: 'pn_2', name: '世界之树', description: '传说中世界之树的根部，神灵与凡人的交汇点' },
                                { id: 'pn_3', name: '符文石刻', description: '巨石上的符文记载着古老的北欧神话' }
                        ],
                    }
                ),
            ]
        ),
    ]
);

// ============================================================
// Epoch 0: 古代 (Ancient)
// ============================================================

const ancientEpoch: EraNode = makeNode(
    'ancient', '古代', 0, null,
    {
        description: '古代时期，冷兵器时代，农耕与游牧并存',
        colors: {
            'ink-black': '14 13 11',
            'ink-gray': '40 35 28',
            'primary': '200 160 80',
            'primary-dark': '130 100 45',
            'secondary': '100 140 120',
            'accent': '160 40 30',
            'paper-white': '230 225 210',
        },
        typography: {
            页面标题: "'KaiTi', 'STKaiti', 'SimSun', 'Noto Serif SC', serif",
            正文: "'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif",
            等宽: "'KaiTi', 'STKaiti', monospace",
        },
        uiStyle: {
            style: 'classical',
            tone: 'archaic',
            decorations: ['ink-bleed'],
        },
    },
    [
        // ── Era 1: 东方古代 ──
        makeNode(
            'ancient_eastern', '东方古代', 1, 'ancient',
            {
                description: '中华文明圈为主的古代，冷兵器与江湖文化',
                colors: {
                    'ink-black': '14 13 11',
                    'ink-gray': '26 26 26',
                    'primary': '230 200 110',
                    'primary-dark': '138 114 54',
                    'secondary': '68 170 170',
                    'accent': '163 24 24',
                    'paper-white': '230 230 230',
                },
                typography: {
                    页面标题: "'KaiTi', 'STKaiti', 'SimSun', 'Noto Serif SC', serif",
                    正文: "'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif",
                    等宽: "'KaiTi', 'STKaiti', monospace",
                },
                uiStyle: {
                    style: 'classical',
                    tone: 'archaic',
                    decorations: ['ink-bleed'],
                },
                bgmTags: ['民乐', '古风', '武侠'],
                artStyle: '水墨写实',
            },
            [
                // SubEra: 武侠 ← 迁移自 era_ancient_wuxia
                makeNode(
                    'ancient_eastern_wuxia', '武侠', 2, 'ancient_eastern',
                    {
                        description: '江湖武林，快意恩仇，刀光剑影',
                        // 完整元数据（来自原 era_ancient_wuxia）
                        colors: {
                            'ink-black': '14 13 11',
                            'ink-gray': '26 26 26',
                            'primary': '230 200 110',
                            'primary-dark': '138 114 54',
                            'secondary': '68 170 170',
                            'accent': '163 24 24',
                            'paper-white': '230 230 230',
                        },
                        typography: {
                            页面标题: "'KaiTi', 'STKaiti', 'SimSun', 'Noto Serif SC', serif",
                            正文: "'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif",
                            等宽: "'KaiTi', 'STKaiti', monospace",
                        },
                        uiStyle: {
                            style: 'classical',
                            tone: 'archaic',
                            decorations: ['ink-bleed'],
                        },
                        bgmTags: ['民乐', '古筝', '笛子', '武侠'],
                        artStyle: '水墨写实摄影',
                        uiCopy: {
                            设置面板标题: '江湖设定',
                            存档标题: '铭刻时光',
                            加载存档标题: '时光回溯',
                            新建游戏按钮: '创建新角色',
                            返回主页按钮: '返回主页',
                            江湖设置按钮: '江湖设置',
                            保存进度按钮: '保存进度',
                            首页主标题: '墨色江湖',
                            首页副标题: '无尽武林',
                            开始游戏按钮: '踏入江湖',
                            继续游戏按钮: '重入江湖',
                            图片管理按钮: '图片管理',
                            世界书按钮: '世界书管理',
                            小说分解按钮: '小说分解',
                            设置按钮: '设置',
                            全屏按钮: '全屏',
                            精力标签: '精力',
                            内力标签: '内力',
                            饱腹标签: '饱腹',
                            水分标签: '水分',
                            经验标签: '经验',
                            钱财标签: '钱财',
                            元宝单位: '元宝',
                            银单位: '银',
                            铜单位: '铜',
                            身躯标题: '身躯',
                            行头标题: '行头',
                            上传头像文字: '上传头像',
                            无称号文字: '无称号',
                            天气标签: '天气',
                            环境标签: '环境',
                            节日标签: '节日',
                            历程标签: '历程',
                            天气卡片标题: '天象变更',
                            环境卡片标题: '周遭环境',
                            节日卡片标题: '今日时节',
                            未知地点: '未知地点',
                            右侧栏标题: '天机',
                            右侧栏副标题: 'System Menu',
                            手动存档tab: '手动存档',
                            自动存档tab: '自动存档',
                            手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                            导出按钮: '导出存档',
                            导入按钮: '导入存档',
                            无记录文字: '暂无记录',
                            读取中文字: '读取中...',
                            立即保存按钮: '立即保存',
                            输入框占位: '输入你的行动...',
                            等待中占位: '等待处理中...',
                            发送按钮: '发送',
                            更多按钮: '更多',
                            收起按钮: '收起',
                            全部功能标题: '全部功能',
                            项后缀: '项',
                            音乐标签: '音乐',
                            一键生成标题: '一键生成当前场景',
                        },
                        openingScenes: [
                                { id: 'wuxia_1', name: '破庙风雨', description: '山间破庙，风雨交加，江湖客避雨于此，暗藏杀机' },
                                { id: 'wuxia_2', name: '客栈风波', description: '荒野客栈，三教九流汇聚，一壶浊酒引出恩怨情仇' },
                                { id: 'wuxia_3', name: '华山论剑', description: '武林大会前夕，各路人马齐聚，剑拔弩张' }
                        ],
                    }
                ),
                // SubEra: 志怪
                makeNode(
                    'ancient_eastern_zhiguai', '志怪', 2, 'ancient_eastern',
                    {
                        description: '狐鬼花妖，志怪奇谈，幽冥人间交错',
                        colors: {
                            'ink-black': '10 12 10',
                            'ink-gray': '22 24 20',
                            'primary': '160 140 100',
                            'primary-dark': '100 85 55',
                            'secondary': '80 130 100',
                            'accent': '120 30 40',
                            'paper-white': '215 210 195',
                        },
                        typography: {
                            页面标题: "'KaiTi', 'STKaiti', 'SimSun', 'Noto Serif SC', serif",
                            正文: "'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif",
                            等宽: "'KaiTi', 'STKaiti', monospace",
                        },
                        uiStyle: {
                            style: 'classical',
                            tone: 'archaic',
                            decorations: ['ink-bleed'],
                        },
                        bgmTags: ['民乐', '古筝', '箫', '灵异', '志怪'],
                        artStyle: '水墨灵异·幽暗',
                        uiCopy: {
                            设置面板标题: '志怪设定',
                            存档标题: '幽冥录',
                            加载存档标题: '前世追忆',
                            新建游戏按钮: '开启奇缘',
                            返回主页按钮: '回归尘世',
                            江湖设置按钮: '志怪设定',
                            保存进度按钮: '封卷入录',
                            首页主标题: '聊斋志异',
                            首页副标题: '无尽奇谭',
                            开始游戏按钮: '踏入幽冥',
                            继续游戏按钮: '再续奇缘',
                            图片管理按钮: '画壁管理',
                            世界书按钮: '异闻录管理',
                            小说分解按钮: '小说分解',
                            设置按钮: '志怪设定',
                            全屏按钮: '全屏',
                            精力标签: '精气',
                            内力标签: '灵力',
                            饱腹标签: '饱腹',
                            水分标签: '水分',
                            经验标签: '道行',
                            钱财标签: '钱财',
                            元宝单位: '金铢',
                            银单位: '银钱',
                            铜单位: '铜文',
                            身躯标题: '躯壳',
                            行头标题: '法衣',
                            上传头像文字: '绘影留形',
                            无称号文字: '凡夫俗子',
                            天气标签: '天象',
                            环境标签: '环境',
                            节日标签: '时节',
                            历程标签: '异闻录',
                            天气卡片标题: '天象变更',
                            环境卡片标题: '周遭环境',
                            节日卡片标题: '今日时节',
                            未知地点: '未知所在',
                            右侧栏标题: '天机',
                            右侧栏副标题: '幽冥系统',
                            手动存档tab: '手动存档',
                            自动存档tab: '自动存档',
                            手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                            导出按钮: '导出异闻',
                            导入按钮: '导入异闻',
                            无记录文字: '暂无异闻',
                            读取中文字: '翻阅中...',
                            立即保存按钮: '立即封卷',
                            输入框占位: '书写你的行动...',
                            等待中占位: '等待回音中...',
                            发送按钮: '发送',
                            更多按钮: '更多',
                            收起按钮: '收起',
                            全部功能标题: '全部功能',
                            项后缀: '项',
                            音乐标签: '音乐',
                            一键生成标题: '一键生成当前场景',
                        },
                        openingScenes: [
                                { id: 'zhiguai_1', name: '荒村夜话', description: '荒废古村，老槐树下，狐仙夜访书生' },
                                { id: 'zhiguai_2', name: '古井怨灵', description: '深宅古井，每月十五传来女子哭声' },
                                { id: 'zhiguai_3', name: '狐仙报恩', description: '猎狐不杀之恩，三年后红妆女子叩门' }
                        ],
                    }
                ),
                // SubEra: 神话
                makeNode(
                    'ancient_eastern_myth', '神话', 2, 'ancient_eastern',
                    {
                        description: '中国上古神话，封神演义，山海经，仙神并起',
                        colors: {
                            'ink-black': '8 8 15',
                            'ink-gray': '25 22 40',
                            'primary': '220 190 60',
                            'primary-dark': '160 130 30',
                            'secondary': '100 170 200',
                            'accent': '200 80 40',
                            'paper-white': '225 220 210',
                        },
                        typography: {
                            页面标题: "'KaiTi', 'STKaiti', 'SimSun', 'Noto Serif SC', serif",
                            正文: "'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif",
                            等宽: "'KaiTi', 'STKaiti', monospace",
                        },
                        uiStyle: {
                            style: 'classical',
                            tone: 'archaic',
                            decorations: ['ink-bleed'],
                        },
                        bgmTags: ['民乐', '编钟', '埙', '史诗', '神话'],
                        artStyle: '古典壁画·金石气',
                        uiCopy: {
                            设置面板标题: '神话设定',
                            存档标题: '封神榜',
                            加载存档标题: '前世轮回',
                            新建游戏按钮: '开启神途',
                            返回主页按钮: '回归凡间',
                            江湖设置按钮: '神话设定',
                            保存进度按钮: '铭刻天书',
                            首页主标题: '封神演义',
                            首页副标题: '万仙阵',
                            开始游戏按钮: '踏入洪荒',
                            继续游戏按钮: '再续神话',
                            图片管理按钮: '壁画管理',
                            世界书按钮: '天书管理',
                            小说分解按钮: '小说分解',
                            设置按钮: '神话设定',
                            全屏按钮: '全屏',
                            精力标签: '神力',
                            内力标签: '法力',
                            饱腹标签: '辟谷',
                            水分标签: '甘露',
                            经验标签: '修为',
                            钱财标签: '灵石',
                            元宝单位: '极品灵石',
                            银单位: '上品灵石',
                            铜单位: '中品灵石',
                            身躯标题: '仙体',
                            行头标题: '法宝',
                            上传头像文字: '绘神像',
                            无称号文字: '凡人',
                            天气标签: '天象',
                            环境标签: '仙域',
                            节日标签: '天劫',
                            历程标签: '修行录',
                            天气卡片标题: '天象变更',
                            环境卡片标题: '周遭仙域',
                            节日卡片标题: '今日天劫',
                            未知地点: '未知仙境',
                            右侧栏标题: '天机',
                            右侧栏副标题: '天道系统',
                            手动存档tab: '手动存档',
                            自动存档tab: '自动存档',
                            手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                            导出按钮: '导出天书',
                            导入按钮: '导入天书',
                            无记录文字: '暂无记载',
                            读取中文字: '翻阅天书中...',
                            立即保存按钮: '立即铭刻',
                            输入框占位: '书写你的神通...',
                            等待中占位: '等待天道回应中...',
                            发送按钮: '施法',
                            更多按钮: '更多',
                            收起按钮: '收起',
                            全部功能标题: '全部功能',
                            项后缀: '项',
                            音乐标签: '音乐',
                            一键生成标题: '一键生成当前场景',
                        },
                        openingScenes: [
                                { id: 'myth_1', name: '昆仑仙境', description: '云雾缭绕的昆仑山巅，仙人居所，凡人难至' },
                                { id: 'myth_2', name: '东海龙宫', description: '碧波深处的水晶宫殿，龙王端坐，虾兵蟹将列队' },
                                { id: 'myth_3', name: '封神台上', description: '封神台上风云变，三百六十五路正神待封' }
                        ],
                    }
                ),
                // SubEra: 权谋
                makeNode(
                    'ancient_eastern_intrigue', '权谋', 2, 'ancient_eastern',
                    {
                        description: '宫廷斗争、朝堂博弈、权术谋略',
                        colors: {
                            'ink-black': '10 8 12',
                            'ink-gray': '22 20 28',
                            'primary': '200 170 80',
                            'primary-dark': '140 110 50',
                            'secondary': '80 100 120',
                            'accent': '160 40 50',
                            'paper-white': '220 215 205',
                        },
                        typography: {
                            页面标题: "'KaiTi', 'STKaiti', 'SimSun', 'Noto Serif SC', serif",
                            正文: "'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif",
                            等宽: "'KaiTi', 'STKaiti', monospace",
                        },
                        uiStyle: {
                            style: 'classical',
                            tone: 'military',
                            decorations: ['ink-bleed'],
                        },
                        bgmTags: ['民乐', '古筝', '低沉', '权谋'],
                        artStyle: '水墨暗纹·宫廷写实',
                        uiCopy: {
                            设置面板标题: '朝堂设定',
                            存档标题: '朝堂录',
                            加载存档标题: '前尘追忆',
                            新建游戏按钮: '开启仕途',
                            返回主页按钮: '回归朝堂',
                            江湖设置按钮: '朝堂设定',
                            保存进度按钮: '封卷入录',
                            首页主标题: '权谋天下',
                            首页副标题: '朝堂风云',
                            开始游戏按钮: '踏入朝堂',
                            继续游戏按钮: '再续仕途',
                            图片管理按钮: '画壁管理',
                            世界书按钮: '朝纲管理',
                            小说分解按钮: '小说分解',
                            设置按钮: '朝堂设定',
                            全屏按钮: '全屏',
                            精力标签: '精力',
                            内力标签: '权术',
                            饱腹标签: '饱腹',
                            水分标签: '水分',
                            经验标签: '官阶',
                            钱财标签: '俸禄',
                            元宝单位: '金锭',
                            银单位: '银两',
                            铜单位: '铜钱',
                            身躯标题: '身躯',
                            行头标题: '官服',
                            上传头像文字: '画像',
                            无称号文字: '布衣',
                            天气标签: '天象',
                            环境标签: '环境',
                            节日标签: '节庆',
                            历程标签: '仕途录',
                            天气卡片标题: '天象变更',
                            环境卡片标题: '周遭环境',
                            节日卡片标题: '今日时节',
                            未知地点: '未知所在',
                            右侧栏标题: '天机',
                            右侧栏副标题: '朝堂系统',
                            手动存档tab: '手动存档',
                            自动存档tab: '自动存档',
                            手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                            导出按钮: '导出朝纲',
                            导入按钮: '导入朝纲',
                            无记录文字: '暂无记载',
                            读取中文字: '翻阅中...',
                            立即保存按钮: '立即封卷',
                            输入框占位: '书写你的抉择...',
                            等待中占位: '等待回音中...',
                            发送按钮: '发送',
                            更多按钮: '更多',
                            收起按钮: '收起',
                            全部功能标题: '全部功能',
                            项后缀: '项',
                            音乐标签: '音乐',
                            一键生成标题: '一键生成当前场景',
                        },
                        conflictTypes: ['朝堂博弈', '党派之争', '权术算计', '皇权制衡'],
                        promptVars: {
                            社会形态: '皇权至上，官僚等级森严，科举选士，门阀与寒门对立',
                            科技水平: '冷兵器时代，造纸印刷发达，火药初现',
                            力量体系: '权谋智术、官场手段、兵法韬略、人情网络',
                            叙事视角: '第三人称有限视角，多线叙事',
                            描写重点: '朝堂博弈、人心算计、官场规则、权力更迭',
                            对话占比: '40%-50%',
                            禁忌: ['武侠打斗', '修仙法术', '现代科技'],
                        },
                        openingScenes: [
                                { id: 'intrigue_1', name: '金殿早朝', description: '紫禁城金銮殿，群臣列队，一封弹劾奏折掀起朝堂波澜' },
                                { id: 'intrigue_2', name: '暗巷密会', description: '深夜小巷，两位朝臣密谋，烛光摇曳间定下大计' },
                                { id: 'intrigue_3', name: '科举放榜', description: '贡院放榜之日，寒门学子与世家子弟的命运分界' }
                        ],
                    }
                ),
                // SubEra: 修仙
                makeNode(
                    'ancient_eastern_cultivation', '修仙', 2, 'ancient_eastern',
                    {
                        description: '修真问道、逆天改命、飞升成仙',
                        colors: {
                            'ink-black': '10 8 18',
                            'ink-gray': '20 18 35',
                            'primary': '180 120 255',
                            'primary-dark': '120 70 200',
                            'secondary': '100 200 180',
                            'accent': '255 180 60',
                            'paper-white': '220 215 230',
                        },
                        typography: {
                            页面标题: "'KaiTi', 'STKaiti', 'SimSun', 'Noto Serif SC', serif",
                            正文: "'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif",
                            等宽: "'KaiTi', 'STKaiti', monospace",
                        },
                        uiStyle: {
                            style: 'classical',
                            tone: 'archaic',
                            decorations: ['ink-bleed'],
                        },
                        bgmTags: ['民乐', '古筝', '箫', '仙音', '空灵'],
                        artStyle: '水墨仙气·流光溢彩',
                        uiCopy: {
                            设置面板标题: '修真设定',
                            存档标题: '修仙录',
                            加载存档标题: '前世追忆',
                            新建游戏按钮: '开启仙途',
                            返回主页按钮: '回归凡间',
                            江湖设置按钮: '修真设定',
                            保存进度按钮: '铭刻仙录',
                            首页主标题: '修仙问道',
                            首页副标题: '逆天改命',
                            开始游戏按钮: '踏入仙途',
                            继续游戏按钮: '再续仙缘',
                            图片管理按钮: '仙画管理',
                            世界书按钮: '天书管理',
                            小说分解按钮: '小说分解',
                            设置按钮: '修真设定',
                            全屏按钮: '全屏',
                            精力标签: '灵力',
                            内力标签: '法力',
                            饱腹标签: '辟谷',
                            水分标签: '甘露',
                            经验标签: '修为',
                            钱财标签: '灵石',
                            元宝单位: '极品灵石',
                            银单位: '上品灵石',
                            铜单位: '中品灵石',
                            身躯标题: '仙体',
                            行头标题: '法宝',
                            上传头像文字: '绘仙像',
                            无称号文字: '凡人',
                            天气标签: '天象',
                            环境标签: '仙域',
                            节日标签: '天劫',
                            历程标签: '修行录',
                            天气卡片标题: '天象变更',
                            环境卡片标题: '周遭仙域',
                            节日卡片标题: '今日天劫',
                            未知地点: '未知仙境',
                            右侧栏标题: '天机',
                            右侧栏副标题: '天道系统',
                            手动存档tab: '手动存档',
                            自动存档tab: '自动存档',
                            手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                            导出按钮: '导出天书',
                            导入按钮: '导入天书',
                            无记录文字: '暂无记载',
                            读取中文字: '翻阅仙录中...',
                            立即保存按钮: '立即铭刻',
                            输入框占位: '书写你的神通...',
                            等待中占位: '等待天道回应中...',
                            发送按钮: '施法',
                            更多按钮: '更多',
                            收起按钮: '收起',
                            全部功能标题: '全部功能',
                            项后缀: '项',
                            音乐标签: '音乐',
                            一键生成标题: '一键生成当前场景',
                        },
                        conflictTypes: ['天道压制', '宗门之争', '资源争夺', '心魔劫难'],
                        promptVars: {
                            社会形态: '宗门林立，修仙者凌驾凡人之，灵石为货币，灵根决定命运',
                            科技水平: '修仙文明，炼丹炼器，传送阵，灵宠驯养',
                            力量体系: '灵力修炼、法术神通、阵法符箓、灵根天赋',
                            叙事视角: '第三人称有限视角',
                            描写重点: '修行进阶、斗法论道、宗门恩怨、逆天改命',
                            对话占比: '30%-40%',
                            禁忌: ['现代科技', '纯权谋', '日常种田'],
                        },
                        openingScenes: [
                                { id: 'cultivation_1', name: '灵根测试', description: '宗门收徒大典，测灵石前，少年命运即将改变' },
                                { id: 'cultivation_2', name: '洞府闭关', description: '深山洞府，灵气汇聚，修士闭关突破瓶颈' },
                                { id: 'cultivation_3', name: '秘境开启', description: '万年秘境现世，各派弟子争相进入寻宝' }
                        ],
                    }
                ),
            ]
        ),
        // ── Era 1: 西方古代 ──
        makeNode(
            'ancient_western', '西方古代', 1, 'ancient',
            {
                description: '古希腊、古罗马、中世纪欧洲',
                colors: {
                    'ink-black': '20 18 15',
                    'ink-gray': '50 45 38',
                    'primary': '180 150 90',
                    'primary-dark': '120 90 50',
                    'secondary': '100 130 100',
                    'accent': '140 40 30',
                    'paper-white': '240 235 225',
                },
                typography: {
                    页面标题: "'Times New Roman', 'Georgia', serif",
                    正文: "'Georgia', 'Times New Roman', serif",
                    等宽: "'Courier New', monospace",
                },
                uiStyle: {
                    style: 'classical',
                    tone: 'formal',
                    decorations: ['grain'],
                },
                bgmTags: ['古典', '管弦', '圣咏'],
                artStyle: '古典油画',
            },
            [
                makeNode('ancient_western_greek', '古希腊', 2, 'ancient_western', {
                    description: '古希腊城邦，哲学与奥林匹克',
                    colors: {
                        'ink-black': '20 18 15',
                        'ink-gray': '50 45 38',
                        'primary': '200 170 90',
                        'primary-dark': '140 110 50',
                        'secondary': '60 120 130',
                        'accent': '180 60 30',
                        'paper-white': '245 240 225',
                    },
                    typography: {
                        页面标题: "'Times New Roman', 'Georgia', serif",
                        正文: "'Georgia', 'Times New Roman', serif",
                        等宽: "'Courier New', monospace",
                    },
                    uiStyle: {
                        style: 'classical',
                        tone: 'formal',
                        decorations: ['grain'],
                    },
                    bgmTags: ['古典', '里拉琴', '管弦', '地中海'],
                    artStyle: '希腊大理石雕塑风',
                    uiCopy: {
                        设置面板标题: '神殿设定',
                        存档标题: '英雄史诗',
                        加载存档标题: '记忆回溯',
                        新建游戏按钮: '启程前往奥林匹斯',
                        返回主页按钮: '回归城邦',
                        江湖设置按钮: '神殿设定',
                        保存进度按钮: '铭刻石板',
                        首页主标题: '希腊神话',
                        首页副标题: '奥林匹斯传说',
                        开始游戏按钮: '踏入爱琴海',
                        继续游戏按钮: '再续史诗',
                        图片管理按钮: '壁画管理',
                        世界书按钮: '神话录管理',
                            小说分解按钮: '小说分解',
                        设置按钮: '神殿设定',
                        全屏按钮: '全屏',
                        精力标签: '精力',
                        内力标签: '神力',
                        饱腹标签: '饱腹',
                        水分标签: '水分',
                        经验标签: '荣耀',
                        钱财标签: '财富',
                        元宝单位: '塔兰同',
                        银单位: '德拉克马',
                        铜单位: '奥波勒斯',
                        身躯标题: '躯壳',
                        行头标题: '铠甲',
                        上传头像文字: '雕刻肖像',
                        无称号文字: '无名者',
                        天气标签: '天象',
                        环境标签: '环境',
                        节日标签: '节庆',
                        历程标签: '英雄纪事',
                        天气卡片标题: '天象变更',
                        环境卡片标题: '周遭环境',
                        节日卡片标题: '今日时节',
                        未知地点: '未知所在',
                        右侧栏标题: '神谕',
                        右侧栏副标题: 'Oracle System',
                        手动存档tab: '手动存档',
                        自动存档tab: '自动存档',
                        手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                        导出按钮: '导出史诗',
                        导入按钮: '导入史诗',
                        无记录文字: '暂无记载',
                        读取中文字: '翻阅中...',
                        立即保存按钮: '立即铭刻',
                        输入框占位: '书写你的命运...',
                        等待中占位: '等待神谕中...',
                        发送按钮: '传达',
                        更多按钮: '更多',
                        收起按钮: '收起',
                        全部功能标题: '全部功能',
                        项后缀: '项',
                        音乐标签: '音乐',
                        一键生成标题: '一键生成当前场景',
                    },
                    openingScenes: [
                            { id: 'greek_1', name: '奥林匹斯山巅', description: '众神聚于奥林匹斯山巅，商讨凡人命运' },
                            { id: 'greek_2', name: '雅典学院', description: '雅典学院中，哲人辩论，真理与诡辩交锋' },
                            { id: 'greek_3', name: '特洛伊城外', description: '特洛伊城外，希腊联军列阵，英雄的抉择' }
                    ],
                }),
                makeNode('ancient_western_roman', '古罗马', 2, 'ancient_western', {
                    description: '罗马帝国，军团与元老院',
                    colors: {
                        'ink-black': '18 10 8',
                        'ink-gray': '48 38 30',
                        'primary': '190 160 80',
                        'primary-dark': '130 100 40',
                        'secondary': '100 80 70',
                        'accent': '170 30 20',
                        'paper-white': '242 232 220',
                    },
                    typography: {
                        页面标题: "'Times New Roman', 'Georgia', serif",
                        正文: "'Georgia', 'Times New Roman', serif",
                        等宽: "'Courier New', monospace",
                    },
                    uiStyle: {
                        style: 'classical',
                        tone: 'military',
                        decorations: ['grain'],
                    },
                    bgmTags: ['古典', '管弦', '军乐', '史诗'],
                    artStyle: '罗马浮雕与大理石',
                    uiCopy: {
                        设置面板标题: '帝国设定',
                        存档标题: '帝国纪事',
                        加载存档标题: '往事回溯',
                        新建游戏按钮: '建立新帝国',
                        返回主页按钮: '回归元老院',
                        江湖设置按钮: '帝国设定',
                        保存进度按钮: '铭刻法典',
                        首页主标题: '罗马帝国',
                        首页副标题: '永恒之城传说',
                        开始游戏按钮: '踏上征途',
                        继续游戏按钮: '重铸荣耀',
                        图片管理按钮: '浮雕管理',
                        世界书按钮: '法典管理',
                            小说分解按钮: '小说分解',
                        设置按钮: '帝国设定',
                        全屏按钮: '全屏',
                        精力标签: '精力',
                        内力标签: '威望',
                        饱腹标签: '饱腹',
                        水分标签: '水分',
                        经验标签: '功勋',
                        钱财标签: '财富',
                        元宝单位: '奥里斯',
                        银单位: '第纳尔',
                        铜单位: '塞斯特斯',
                        身躯标题: '躯壳',
                        行头标题: '甲胄',
                        上传头像文字: '雕刻肖像',
                        无称号文字: '平民',
                        天气标签: '天象',
                        环境标签: '环境',
                        节日标签: '节庆',
                        历程标签: '征战纪事',
                        天气卡片标题: '天象变更',
                        环境卡片标题: '周遭环境',
                        节日卡片标题: '今日时节',
                        未知地点: '未知所在',
                        右侧栏标题: '元老院',
                        右侧栏副标题: 'Senatus System',
                        手动存档tab: '手动存档',
                        自动存档tab: '自动存档',
                        手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                        导出按钮: '导出法典',
                        导入按钮: '导入法典',
                        无记录文字: '暂无记载',
                        读取中文字: '翻阅中...',
                        立即保存按钮: '立即铭刻',
                        输入框占位: '书写你的决策...',
                        等待中占位: '等待元老院决议中...',
                        发送按钮: '传达',
                        更多按钮: '更多',
                        收起按钮: '收起',
                        全部功能标题: '全部功能',
                        项后缀: '项',
                        音乐标签: '音乐',
                        一键生成标题: '一键生成当前场景',
                    },
                    openingScenes: [
                            { id: 'roman_1', name: '元老院辩论', description: '罗马元老院内，激烈的政治辩论决定着帝国走向' },
                            { id: 'roman_2', name: '角斗场血战', description: '大角斗场，万人欢呼，奴隶角斗士的生死搏杀' },
                            { id: 'roman_3', name: '军团出征', description: '罗马军团列阵出征，鹰旗飘扬，铁甲铿锵' }
                    ],
                }),
                makeNode('ancient_western_medieval', '中世纪欧洲', 2, 'ancient_western', {
                    description: '骑士、城堡、教会',
                    colors: {
                        'ink-black': '15 12 10',
                        'ink-gray': '38 30 22',
                        'primary': '170 140 60',
                        'primary-dark': '110 85 30',
                        'secondary': '70 110 80',
                        'accent': '140 35 35',
                        'paper-white': '225 215 195',
                    },
                    typography: {
                        页面标题: "'Times New Roman', 'Georgia', serif",
                        正文: "'Georgia', 'Times New Roman', serif",
                        等宽: "'Courier New', monospace",
                    },
                    uiStyle: {
                        style: 'classical',
                        tone: 'formal',
                        decorations: ['grain'],
                    },
                    bgmTags: ['古典', '圣咏', '鲁特琴', '骑士'],
                    artStyle: '中世纪手抄本彩绘',
                    uiCopy: {
                        设置面板标题: '王国设定',
                        存档标题: '骑士编年史',
                        加载存档标题: '往事追忆',
                        新建游戏按钮: '开启新传说',
                        返回主页按钮: '回归城堡',
                        江湖设置按钮: '王国设定',
                        保存进度按钮: '封存入卷',
                        首页主标题: '骑士时代',
                        首页副标题: '无尽传说',
                        开始游戏按钮: '踏上征途',
                        继续游戏按钮: '重续传说',
                        图片管理按钮: '挂毯管理',
                        世界书按钮: '编年史管理',
                            小说分解按钮: '小说分解',
                        设置按钮: '王国设定',
                        全屏按钮: '全屏',
                        精力标签: '精力',
                        内力标签: '信仰',
                        饱腹标签: '饱腹',
                        水分标签: '水分',
                        经验标签: '声望',
                        钱财标签: '财富',
                        元宝单位: '金镑',
                        银单位: '先令',
                        铜单位: '便士',
                        身躯标题: '躯壳',
                        行头标题: '铠甲',
                        上传头像文字: '绘制肖像',
                        无称号文字: '无名之辈',
                        天气标签: '天象',
                        环境标签: '环境',
                        节日标签: '节庆',
                        历程标签: '冒险纪事',
                        天气卡片标题: '天象变更',
                        环境卡片标题: '周遭环境',
                        节日卡片标题: '今日时节',
                        未知地点: '未知所在',
                        右侧栏标题: '城堡',
                        右侧栏副标题: 'Castle System',
                        手动存档tab: '手动存档',
                        自动存档tab: '自动存档',
                        手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                        导出按钮: '导出编年史',
                        导入按钮: '导入编年史',
                        无记录文字: '暂无记载',
                        读取中文字: '翻阅羊皮卷中...',
                        立即保存按钮: '立即封存',
                        输入框占位: '书写你的抉择...',
                        等待中占位: '等待命运回应中...',
                        发送按钮: '传达',
                        更多按钮: '更多',
                        收起按钮: '收起',
                        全部功能标题: '全部功能',
                        项后缀: '项',
                        音乐标签: '音乐',
                        一键生成标题: '一键生成当前场景',
                    },
                    openingScenes: [
                            { id: 'medieval_1', name: '城堡围困', description: '中世纪城堡被围，守军粮尽，骑士准备最后的冲锋' },
                            { id: 'medieval_2', name: '修道院密谋', description: '幽暗修道院中，修士们守护着足以颠覆教廷的秘密' },
                            { id: 'medieval_3', name: '骑士受封', description: '大教堂前，领主为年轻武士授剑，册封骑士' }
                    ],
                }),
                // SubEra: 维京
                makeNode(
                    'ancient_western_viking', '维京', 2, 'ancient_western',
                    {
                        description: '北欧海盗、航海掠夺、战士荣耀',
                        colors: {
                            'ink-black': '12 14 18',
                            'ink-gray': '30 32 40',
                            'primary': '58 124 165',
                            'primary-dark': '35 75 100',
                            'secondary': '100 80 60',
                            'accent': '200 60 40',
                            'paper-white': '230 225 215',
                        },
                        typography: {
                            页面标题: "'Times New Roman', 'Georgia', serif",
                            正文: "'Georgia', 'Times New Roman', serif",
                            等宽: "'Courier New', monospace",
                        },
                        uiStyle: {
                            style: 'classical',
                            tone: 'military',
                            decorations: ['grain', 'ink-bleed'],
                        },
                        bgmTags: ['北欧', '鼓', '人声吟唱', '海洋'],
                        artStyle: '冰原写实·海风质感',
                        uiCopy: {
                            设置面板标题: '长船设定',
                            存档标题: '萨迦录',
                            加载存档标题: '先祖记忆',
                            新建游戏按钮: '成为战士',
                            返回主页按钮: '回到长船',
                            江湖设置按钮: '长船设定',
                            保存进度按钮: '铭刻萨迦',
                            首页主标题: '维京传奇',
                            首页副标题: '无尽征途',
                            开始游戏按钮: '扬帆起航',
                            继续游戏按钮: '再续征途',
                            图片管理按钮: '壁画管理',
                            世界书按钮: '萨迦管理',
                            小说分解按钮: '小说分解',
                            设置按钮: '长船设定',
                            全屏按钮: '全屏',
                            精力标签: '体力',
                            内力标签: '战意',
                            饱腹标签: '饱腹',
                            水分标签: '水分',
                            经验标签: '战功',
                            钱财标签: '战利品',
                            元宝单位: '金币',
                            银单位: '银币',
                            铜单位: '铜币',
                            身躯标题: '身躯',
                            行头标题: '战甲',
                            上传头像文字: '肖像',
                            无称号文字: '平民',
                            天气标签: '天象',
                            环境标签: '海域',
                            节日标签: '节庆',
                            历程标签: '远征录',
                            天气卡片标题: '天象变更',
                            环境卡片标题: '周遭海域',
                            节日卡片标题: '今日时节',
                            未知地点: '未知海域',
                            右侧栏标题: '长船',
                            右侧栏副标题: 'Longship',
                            手动存档tab: '手动存档',
                            自动存档tab: '自动存档',
                            手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                            导出按钮: '导出萨迦',
                            导入按钮: '导入萨迦',
                            无记录文字: '暂无记载',
                            读取中文字: '翻阅中...',
                            立即保存按钮: '立即铭刻',
                            输入框占位: '书写你的抉择...',
                            等待中占位: '等待命运回应中...',
                            发送按钮: '传达',
                            更多按钮: '更多',
                            收起按钮: '收起',
                            全部功能标题: '全部功能',
                            项后缀: '项',
                            音乐标签: '音乐',
                            一键生成标题: '一键生成当前场景',
                        },
                        conflictTypes: ['海上掠夺', '部落荣誉', '诸神信仰', '生存挑战'],
                        promptVars: {
                            社会形态: '部落酋长制，战士阶层掌握权力，掠夺与贸易并存',
                            科技水平: '铁器时代，长船航海，符文刻记',
                            力量体系: '战士武技、萨满祈祷、卢恩符文、航海技艺',
                            叙事视角: '第三人称史诗视角',
                            描写重点: '海上远征、战士荣耀、诸神意志、部落纷争',
                            对话占比: '25%-35%',
                            禁忌: ['现代科技', '都市日常', '修仙法术'],
                        },
                        openingScenes: [
                                { id: 'viking_1', name: '长船登陆', description: '维京长船破浪而来，龙首船头，勇士们踏上异乡' },
                                { id: 'viking_2', name: '英灵殿盛宴', description: '瓦尔哈拉大殿，英灵们豪饮，准备诸神黄昏之战' },
                                { id: 'viking_3', name: '符文占卜', description: '风雪之夜，萨满以卢恩符文占卜，预视命运' }
                        ],
                    }
                ),
                // SubEra: 凯尔特
                makeNode(
                    'ancient_western_celtic', '凯尔特', 2, 'ancient_western',
                    {
                        description: '德鲁伊、精灵信仰、森林部落',
                        colors: {
                            'ink-black': '10 14 10',
                            'ink-gray': '25 30 22',
                            'primary': '60 160 100',
                            'primary-dark': '35 100 60',
                            'secondary': '180 140 80',
                            'accent': '200 60 30',
                            'paper-white': '225 220 200',
                        },
                        typography: {
                            页面标题: "'Times New Roman', 'Georgia', serif",
                            正文: "'Georgia', 'Times New Roman', serif",
                            等宽: "'Courier New', monospace",
                        },
                        uiStyle: {
                            style: 'classical',
                            tone: 'archaic',
                            decorations: ['grain', 'ink-bleed'],
                        },
                        bgmTags: ['风笛', '竖琴', '凯尔特', '自然'],
                        artStyle: '凯尔特结纹·森林写实',
                        uiCopy: {
                            设置面板标题: '部落设定',
                            存档标题: '德鲁伊录',
                            加载存档标题: '森林记忆',
                            新建游戏按钮: '加入部落',
                            返回主页按钮: '回到森林',
                            江湖设置按钮: '部落设定',
                            保存进度按钮: '铭刻林语',
                            首页主标题: '凯尔特传说',
                            首页副标题: '森林之歌',
                            开始游戏按钮: '踏入森林',
                            继续游戏按钮: '再续传说',
                            图片管理按钮: '壁画管理',
                            世界书按钮: '传说管理',
                            小说分解按钮: '小说分解',
                            设置按钮: '部落设定',
                            全屏按钮: '全屏',
                            精力标签: '生命力',
                            内力标签: '自然之力',
                            饱腹标签: '饱腹',
                            水分标签: '水分',
                            经验标签: '修行',
                            钱财标签: '物资',
                            元宝单位: '金环',
                            银单位: '银环',
                            铜单位: '铜环',
                            身躯标题: '身躯',
                            行头标题: '服饰',
                            上传头像文字: '肖像',
                            无称号文字: '无名者',
                            天气标签: '天象',
                            环境标签: '森林',
                            节日标签: '节庆',
                            历程标签: '传说录',
                            天气卡片标题: '天象变更',
                            环境卡片标题: '周遭森林',
                            节日卡片标题: '今日时节',
                            未知地点: '未知所在',
                            右侧栏标题: '林地',
                            右侧栏副标题: 'Sacred Grove',
                            手动存档tab: '手动存档',
                            自动存档tab: '自动存档',
                            手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                            导出按钮: '导出传说',
                            导入按钮: '导入传说',
                            无记录文字: '暂无记载',
                            读取中文字: '翻阅中...',
                            立即保存按钮: '立即铭刻',
                            输入框占位: '书写你的抉择...',
                            等待中占位: '等待自然回应中...',
                            发送按钮: '传达',
                            更多按钮: '更多',
                            收起按钮: '收起',
                            全部功能标题: '全部功能',
                            项后缀: '项',
                            音乐标签: '音乐',
                            一键生成标题: '一键生成当前场景',
                        },
                        conflictTypes: ['罗马入侵', '自然守护', '信仰传承', '部落生存'],
                        promptVars: {
                            社会形态: '德鲁伊领导的部落社会，自然崇拜，氏族血缘纽带',
                            科技水平: '铁器时代，石制建筑，口述传统',
                            力量体系: '德鲁伊法术、自然之力、精灵契约、预言术',
                            叙事视角: '第三人称有限视角',
                            描写重点: '森林神秘、自然魔法、信仰传承、外敌威胁',
                            对话占比: '25%-35%',
                            禁忌: ['现代科技', '都市日常', '修仙法术'],
                        },
                        openingScenes: [
                                { id: 'celtic_1', name: '巨石阵仪式', description: '迷雾中的巨石阵，德鲁伊举行古老仪式' },
                                { id: 'celtic_2', name: '圆桌骑士', description: '卡美洛城堡，圆桌旁骑士们立下神圣誓言' },
                                { id: 'celtic_3', name: '精灵森林', description: '幽深凯尔特森林，精灵出没，魔法与现实交织' }
                        ],
                    }
                ),
            ]
        ),
    ]
);

// ============================================================
// Epoch 1: 近代 (Modern)
// ============================================================

const modernEpoch: EraNode = makeNode(
    'modern', '近代', 0, null,
    {
        description: '近代时期，工业革命至二战前，东西方大变革时代',
        colors: {
            'ink-black': '20 16 12',
            'ink-gray': '50 42 32',
            'primary': '180 150 100',
            'primary-dark': '110 85 55',
            'secondary': '140 110 70',
            'accent': '130 50 40',
            'paper-white': '235 225 205',
        },
        typography: {
            页面标题: "'STSong', 'SimSun', 'Noto Serif SC', serif",
            正文: "'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif",
            等宽: "'Courier New', monospace",
        },
        uiStyle: {
            style: 'retro',
            tone: 'formal',
            decorations: ['grain'],
        },
    },
    [
        // ── Era 1: 东方近代 ──
        makeNode(
            'modern_eastern', '东方近代', 1, 'modern',
            {
                description: '中华民国、日本明治·大正时期',
                colors: {
                    'ink-black': '20 16 12',
                    'ink-gray': '42 34 26',
                    'primary': '196 166 125',
                    'primary-dark': '120 96 62',
                    'secondary': '160 130 90',
                    'accent': '139 50 40',
                    'paper-white': '235 224 206',
                },
                typography: {
                    页面标题: "'STSong', 'SimSun', 'Noto Serif SC', serif",
                    正文: "'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif",
                    等宽: "'Courier New', monospace",
                },
                uiStyle: {
                    style: 'retro',
                    tone: 'formal',
                    decorations: ['grain'],
                },
                bgmTags: ['爵士', '民乐', '时代曲'],
                artStyle: '老照片质感',
            },
            [
                // SubEra: 民国风云 ← 迁移自 era_republic_modern
                makeNode(
                    'modern_eastern_republic', '民国风云', 2, 'modern_eastern',
                    {
                        description: '民国乱世，十里洋场，风云际会',
                        colors: {
                            'ink-black': '20 16 12',
                            'ink-gray': '42 34 26',
                            'primary': '196 166 125',
                            'primary-dark': '120 96 62',
                            'secondary': '160 130 90',
                            'accent': '139 50 40',
                            'paper-white': '235 224 206',
                        },
                        typography: {
                            页面标题: "'STSong', 'SimSun', 'Noto Serif SC', serif",
                            正文: "'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif",
                            等宽: "'Courier New', monospace",
                        },
                        uiStyle: {
                            style: 'retro',
                            tone: 'formal',
                            decorations: ['grain'],
                        },
                        bgmTags: ['爵士', '时代曲', '上海滩'],
                        artStyle: '老照片质感·暖褐',
                        uiCopy: {
                            设置面板标题: '商会设定',
                            存档标题: '旧档记录',
                            加载存档标题: '翻阅前尘',
                            新建游戏按钮: '开设新档',
                            返回主页按钮: '返回商会',
                            江湖设置按钮: '商会设定',
                            保存进度按钮: '存档入柜',
                            首页主标题: '民国风云',
                            首页副标题: '乱世浮沉',
                            开始游戏按钮: '闯荡江湖',
                            继续游戏按钮: '再续前缘',
                            图片管理按钮: '图册管理',
                            世界书按钮: '档案册管理',
                            小说分解按钮: '小说分解',
                            设置按钮: '商会设定',
                            全屏按钮: '全幅',
                            精力标签: '精神',
                            内力标签: '气劲',
                            饱腹标签: '饱食',
                            水分标签: '饮水',
                            经验标签: '阅历',
                            钱财标签: '资产',
                            元宝单位: '大洋',
                            银单位: '银元',
                            铜单位: '铜板',
                            身躯标题: '体魄',
                            行头标题: '衣装',
                            上传头像文字: '张贴相片',
                            无称号文字: '暂无头衔',
                            天气标签: '天时',
                            环境标签: '周遭',
                            节日标签: '节庆',
                            历程标签: '行迹',
                            天气卡片标题: '天象变更',
                            环境卡片标题: '周遭环境',
                            节日卡片标题: '今日时节',
                            未知地点: '未知所在',
                            右侧栏标题: '天机',
                            右侧栏副标题: 'System Menu',
                            手动存档tab: '手动存档',
                            自动存档tab: '自动存档',
                            手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                            导出按钮: '导出存档',
                            导入按钮: '导入存档',
                            无记录文字: '暂无记录',
                            读取中文字: '翻阅中...',
                            立即保存按钮: '立即存档',
                            输入框占位: '书写你的抉择...',
                            等待中占位: '等候回音中...',
                            发送按钮: '递出',
                            更多按钮: '更多',
                            收起按钮: '收起',
                            全部功能标题: '全部功能',
                            项后缀: '项',
                            音乐标签: '音乐',
                            一键生成标题: '一键生成当前场景',
                        },
                        openingScenes: [
                                { id: 'republic_1', name: '十里洋场', description: '上海滩十里洋场，霓虹闪烁，暗流涌动' },
                                { id: 'republic_2', name: '北平胡同', description: '北平老胡同，茶馆里各色人等议论时政' },
                                { id: 'republic_3', name: '军阀混战', description: '军阀混战，百姓流离失所，义士挺身而出' }
                        ],
                    }
                ),
                // SubEra: 明治·大正日本
                makeNode(
                    'modern_eastern_meiji_taisho', '明治·大正', 2, 'modern_eastern',
                    {
                        description: '日本明治·大正时期，西化改革，军国崛起',
                        colors: {
                            'ink-black': '15 12 10',
                            'ink-gray': '45 38 30',
                            'primary': '180 80 60',
                            'primary-dark': '130 50 35',
                            'secondary': '80 140 100',
                            'accent': '200 170 60',
                            'paper-white': '240 232 220',
                        },
                        typography: {
                            页面标题: "'YuMincho', 'Hiragino Mincho ProN', serif",
                            正文: "'Hiragino Kaku Gothic Pro', 'YuGothic', sans-serif",
                            等宽: "'Courier New', monospace",
                        },
                        uiStyle: {
                            style: 'retro',
                            tone: 'formal',
                            decorations: ['grain'],
                        },
                        bgmTags: ['和乐', '军乐', '洋乐', '时代曲'],
                        artStyle: '浮世绘与洋画风',
                        uiCopy: {
                            设置面板标题: '时代设定',
                            存档标题: '大正浪漫',
                            加载存档标题: '前尘追忆',
                            新建游戏按钮: '开启新物语',
                            返回主页按钮: '回归帝都',
                            江湖设置按钮: '时代设定',
                            保存进度按钮: '封印物語',
                            首页主标题: '大正浪漫',
                            首页副标题: '和洋折衷物語',
                            开始游戏按钮: '踏入时代',
                            继续游戏按钮: '再续物语',
                            图片管理按钮: '絵画管理',
                            世界书按钮: '物語帳管理',
                            小说分解按钮: '小说分解',
                            设置按钮: '时代设定',
                            全屏按钮: '全屏',
                            精力标签: '気力',
                            内力标签: '気合',
                            饱腹标签: '食欲',
                            水分标签: '渇き',
                            经验标签: '経験',
                            钱财标签: '資産',
                            元宝单位: '円',
                            银单位: '銭',
                            铜单位: '厘',
                            身躯标题: '身体',
                            行头标题: '装束',
                            上传头像文字: '写真撮影',
                            无称号文字: '無名',
                            天气标签: '天気',
                            环境标签: '環境',
                            节日标签: '行事',
                            历程标签: '歩み',
                            天气卡片标题: '天候変更',
                            环境卡片标题: '周囲の環境',
                            节日卡片标题: '今日の行事',
                            未知地点: '不明',
                            右侧栏标题: '天机',
                            右侧栏副标题: '時代系統',
                            手动存档tab: '手動存档',
                            自动存档tab: '自動存档',
                            手动存档说明: '手動と自動存档は共に内容を完全に保存します。出力時はZIPで画像、チャット記録、ゲームデータの3つに分割します。',
                            导出按钮: '存档輸出',
                            导入按钮: '存档読込',
                            无记录文字: 'まだ記録なし',
                            读取中文字: '読込中...',
                            立即保存按钮: '立即存档',
                            输入框占位: '行動を入力...',
                            等待中占位: '返答待機中...',
                            发送按钮: '送信',
                            更多按钮: 'その他',
                            收起按钮: '折り畳み',
                            全部功能标题: '全機能',
                            项后缀: '項',
                            音乐标签: '音楽',
                            一键生成标题: 'ワンクリックで現在のシーンを生成',
                        },
                        openingScenes: [
                                { id: 'meiji_1', name: '银座大街', description: '明治维新后银座大街，和洋并存，文明开化' },
                                { id: 'meiji_2', name: '武士末路', description: '废刀令下，末代武士的最后坚守' },
                                { id: 'meiji_3', name: '新浪潮', description: '大正浪漫，文学青年与摩登女郎的新思潮' }
                        ],
                    }
                ),
                // SubEra: 晚清
                makeNode(
                    'modern_eastern_late_qing', '晚清', 2, 'modern_eastern',
                    {
                        description: '清末洋务运动、维新变法、列强入侵',
                        colors: {
                            'ink-black': '18 14 10',
                            'ink-gray': '40 32 24',
                            'primary': '180 140 60',
                            'primary-dark': '110 80 30',
                            'secondary': '100 130 120',
                            'accent': '160 50 40',
                            'paper-white': '230 220 200',
                        },
                        typography: {
                            页面标题: "'STSong', 'SimSun', 'Noto Serif SC', serif",
                            正文: "'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif",
                            等宽: "'Courier New', monospace",
                        },
                        uiStyle: {
                            style: 'retro',
                            tone: 'formal',
                            decorations: ['grain'],
                        },
                        bgmTags: ['民乐', '军乐', '时代曲', '悲壮'],
                        artStyle: '清末老照片·斑驳质感',
                        uiCopy: {
                            设置面板标题: '洋务设定',
                            存档标题: '变法录',
                            加载存档标题: '前尘追忆',
                            新建游戏按钮: '开启新局',
                            返回主页按钮: '回到京师',
                            江湖设置按钮: '洋务设定',
                            保存进度按钮: '封存档案',
                            首页主标题: '晚清风云',
                            首页副标题: '变法图强',
                            开始游戏按钮: '踏入时局',
                            继续游戏按钮: '再续变法',
                            图片管理按钮: '图册管理',
                            世界书按钮: '档册管理',
                            小说分解按钮: '小说分解',
                            设置按钮: '洋务设定',
                            全屏按钮: '全屏',
                            精力标签: '精力',
                            内力标签: '气劲',
                            饱腹标签: '饱食',
                            水分标签: '饮水',
                            经验标签: '阅历',
                            钱财标签: '资产',
                            元宝单位: '两',
                            银单位: '钱',
                            铜单位: '文',
                            身躯标题: '体魄',
                            行头标题: '衣装',
                            上传头像文字: '张贴相片',
                            无称号文字: '布衣',
                            天气标签: '天时',
                            环境标签: '周遭',
                            节日标签: '节庆',
                            历程标签: '行迹',
                            天气卡片标题: '天象变更',
                            环境卡片标题: '周遭环境',
                            节日卡片标题: '今日时节',
                            未知地点: '未知所在',
                            右侧栏标题: '天机',
                            右侧栏副标题: '朝局系统',
                            手动存档tab: '手动存档',
                            自动存档tab: '自动存档',
                            手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                            导出按钮: '导出档册',
                            导入按钮: '导入档册',
                            无记录文字: '暂无记录',
                            读取中文字: '翻阅中...',
                            立即保存按钮: '立即封存',
                            输入框占位: '书写你的抉择...',
                            等待中占位: '等候回音中...',
                            发送按钮: '递出',
                            更多按钮: '更多',
                            收起按钮: '收起',
                            全部功能标题: '全部功能',
                            项后缀: '项',
                            音乐标签: '音乐',
                            一键生成标题: '一键生成当前场景',
                        },
                        conflictTypes: ['列强入侵', '变法维新', '洋务自强', '内忧外患'],
                        promptVars: {
                            社会形态: '皇权衰落，列强瓜分，维新派与保守派激烈斗争',
                            科技水平: '洋务运动兴起，西方技术传入，传统与近代并存',
                            力量体系: '武术、军事技能、洋务技术、维新思想',
                            叙事视角: '第三人称有限视角',
                            描写重点: '时代变革、新旧冲突、列强压迫、自强求存',
                            对话占比: '35%-45%',
                            禁忌: ['修仙法术', '现代科技', '纯武侠'],
                        },
                        openingScenes: [
                                { id: 'late_qing_1', name: '虎门销烟', description: '虎门海滩，浓烟滚滚，林则徐主持销烟' },
                                { id: 'late_qing_2', name: '戊戌变法', description: '紫禁城中，维新派试图力挽狂澜' },
                                { id: 'late_qing_3', name: '义和团起', description: '民间拳民聚义，声称刀枪不入' }
                        ],
                    }
                ),
            ]
        ),
        // ── Era 1: 西方近代 ──
        makeNode(
            'modern_western', '西方近代', 1, 'modern',
            {
                description: '维多利亚时代、爵士时代、战后重建',
                colors: {
                    'ink-black': '25 22 18',
                    'ink-gray': '55 48 40',
                    'primary': '160 130 90',
                    'primary-dark': '100 75 50',
                    'secondary': '120 100 80',
                    'accent': '160 60 50',
                    'paper-white': '245 238 225',
                },
                typography: {
                    页面标题: "'Georgia', 'Times New Roman', serif",
                    正文: "'Georgia', serif",
                    等宽: "'Courier New', monospace",
                },
                uiStyle: {
                    style: 'retro',
                    tone: 'formal',
                    decorations: ['grain'],
                },
                bgmTags: ['古典', '爵士', '铜管'],
                artStyle: '古典油画·暖调',
            },
            [
                makeNode('modern_western_victorian', '维多利亚时代', 2, 'modern_western', {
                    description: '英国维多利亚时代，工业革命，绅士淑女',
                    colors: {
                        'ink-black': '18 15 12',
                        'ink-gray': '42 36 28',
                        'primary': '180 140 60',
                        'primary-dark': '120 90 35',
                        'secondary': '60 100 70',
                        'accent': '140 40 40',
                        'paper-white': '238 232 218',
                    },
                    typography: {
                        页面标题: "'Georgia', 'Times New Roman', serif",
                        正文: "'Georgia', 'Times New Roman', serif",
                        等宽: "'Courier New', monospace",
                    },
                    uiStyle: {
                        style: 'retro',
                        tone: 'formal',
                        decorations: ['grain'],
                    },
                    bgmTags: ['古典', '管弦', '八音盒', '工业革命'],
                    artStyle: '蒸汽朋克机械·油画',
                    uiCopy: {
                        设置面板标题: '帝国设定',
                        存档标题: '岁月编年',
                        加载存档标题: '追忆往昔',
                        新建游戏按钮: '开启新人生',
                        返回主页按钮: '回到客厅',
                        江湖设置按钮: '帝国设定',
                        保存进度按钮: '封存档案',
                        首页主标题: '雾都孤儿',
                        首页副标题: '维多利亚传奇',
                        开始游戏按钮: '踏入伦敦',
                        继续游戏按钮: '重拾旧梦',
                        图片管理按钮: '肖像管理',
                        世界书按钮: '档案册管理',
                            小说分解按钮: '小说分解',
                        设置按钮: '帝国设定',
                        全屏按钮: '全屏',
                        精力标签: '精力',
                        内力标签: '威望',
                        饱腹标签: '饱腹',
                        水分标签: '饮水',
                        经验标签: '声望',
                        钱财标签: '资产',
                        元宝单位: '金镑',
                        银单位: '先令',
                        铜单位: '便士',
                        身躯标题: '体魄',
                        行头标题: '服饰',
                        上传头像文字: '绘制肖像',
                        无称号文字: '无名之辈',
                        天气标签: '天气',
                        环境标签: '环境',
                        节日标签: '节庆',
                        历程标签: '历程',
                        天气卡片标题: '天象变更',
                        环境卡片标题: '周遭环境',
                        节日卡片标题: '今日时节',
                        未知地点: '未知所在',
                        右侧栏标题: '会客厅',
                        右侧栏副标题: 'Drawing Room',
                        手动存档tab: '手动存档',
                        自动存档tab: '自动存档',
                        手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                        导出按钮: '导出档案',
                        导入按钮: '导入档案',
                        无记录文字: '暂无记载',
                        读取中文字: '翻阅中...',
                        立即保存按钮: '立即封存',
                        输入框占位: '书写你的抉择...',
                        等待中占位: '等候命运回应中...',
                        发送按钮: '传达',
                        更多按钮: '更多',
                        收起按钮: '收起',
                        全部功能标题: '全部功能',
                        项后缀: '项',
                        音乐标签: '音乐',
                        一键生成标题: '一键生成当前场景',
                    },
                    openingScenes: [
                            { id: 'victorian_1', name: '雾都伦敦', description: '浓雾笼罩的伦敦街头，侦探追踪神秘案件' },
                            { id: 'victorian_2', name: '工业革命', description: '工厂烟囱林立，蒸汽机轰鸣，工人运动兴起' },
                            { id: 'victorian_3', name: '贵族晚宴', description: '维多利亚式庄园晚宴，礼仪与阴谋并存' }
                    ],
                }),
                makeNode('modern_western_jazz_age', '爵士时代', 2, 'modern_western', {
                    description: '咆哮二十年代，美国禁酒令，Art Deco',
                    colors: {
                        'ink-black': '10 10 15',
                        'ink-gray': '30 25 30',
                        'primary': '210 180 70',
                        'primary-dark': '140 115 35',
                        'secondary': '30 140 130',
                        'accent': '220 50 60',
                        'paper-white': '240 235 220',
                    },
                    typography: {
                        页面标题: "'Futura', 'Impact', 'Arial Black', sans-serif",
                        正文: "'Georgia', 'Arial', sans-serif",
                        等宽: "'Courier New', monospace",
                    },
                    uiStyle: {
                        style: 'retro',
                        tone: 'commercial',
                        decorations: ['grain'],
                    },
                    bgmTags: ['爵士', '摇摆乐', '铜管', '禁酒令地下酒吧'],
                    artStyle: 'Art Deco装饰艺术·金黑',
                    uiCopy: {
                        设置面板标题: '夜店设定',
                        存档标题: '咆哮年代',
                        加载存档标题: '闪回记忆',
                        新建游戏按钮: '开创新传奇',
                        返回主页按钮: '回到酒吧',
                        江湖设置按钮: '夜店设定',
                        保存进度按钮: '封存回忆',
                        首页主标题: '了不起的盖茨比',
                        首页副标题: '禁酒风云',
                        开始游戏按钮: '踏入不夜城',
                        继续游戏按钮: '重温旧梦',
                        图片管理按钮: '照片管理',
                        世界书按钮: '故事簿管理',
                            小说分解按钮: '小说分解',
                        设置按钮: '夜店设定',
                        全屏按钮: '全屏',
                        精力标签: '精力',
                        内力标签: '魅力',
                        饱腹标签: '饱腹',
                        水分标签: '饮水',
                        经验标签: '阅历',
                        钱财标签: '资金',
                        元宝单位: '银元',
                        银单位: '角',
                        铜单位: '分',
                        身躯标题: '身体',
                        行头标题: '行头',
                        上传头像文字: '拍摄写真',
                        无称号文字: '无名小卒',
                        天气标签: '天气',
                        环境标签: '环境',
                        节日标签: '节庆',
                        历程标签: '足迹',
                        天气卡片标题: '天象变更',
                        环境卡片标题: '周遭环境',
                        节日卡片标题: '今日时节',
                        未知地点: '未知所在',
                        右侧栏标题: '酒吧',
                        右侧栏副标题: 'Speakeasy',
                        手动存档tab: '手动存档',
                        自动存档tab: '自动存档',
                        手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                        导出按钮: '导出故事',
                        导入按钮: '导入故事',
                        无记录文字: '暂无记载',
                        读取中文字: '翻阅中...',
                        立即保存按钮: '立即保存',
                        输入框占位: '书写你的行动...',
                        等待中占位: '等待回应中...',
                        发送按钮: '发送',
                        更多按钮: '更多',
                        收起按钮: '收起',
                        全部功能标题: '全部功能',
                        项后缀: '项',
                        音乐标签: '音乐',
                        一键生成标题: '一键生成当前场景',
                    },
                    openingScenes: [
                            { id: 'jazz_1', name: '盖茨比派对', description: '长岛豪宅，爵士乐彻夜不停，禁酒令下的狂欢' },
                            { id: 'jazz_2', name: '地下酒吧', description: '纽约地下酒吧，走私酒与黑帮势力暗涌' },
                            { id: 'jazz_3', name: '爵士俱乐部', description: '哈莱姆区爵士俱乐部，音乐与种族碰撞' }
                    ],
                }),
                makeNode('modern_western_postwar', '战后重建', 2, 'modern_western', {
                    description: '1940s-1950s，二战后的复兴与冷战序幕',
                    colors: {
                        'ink-black': '22 20 16',
                        'ink-gray': '48 44 36',
                        'primary': '60 120 160',
                        'primary-dark': '35 80 110',
                        'secondary': '140 100 50',
                        'accent': '180 50 40',
                        'paper-white': '240 235 220',
                    },
                    typography: {
                        页面标题: "'Helvetica Neue', 'Franklin Gothic', 'Arial', sans-serif",
                        正文: "'Helvetica Neue', 'Arial', sans-serif",
                        等宽: "'Courier New', monospace",
                    },
                    uiStyle: {
                        style: 'modern',
                        tone: 'casual',
                        decorations: ['grain'],
                    },
                    bgmTags: ['爵士', '大乐队', '早期摇滚', '蓝调', '战后复兴'],
                    artStyle: '彩色胶片摄影·Kodachrome暖调',
                    uiCopy: {
                        设置面板标题: '复兴设定',
                        存档标题: '家园日志',
                        加载存档标题: '往事重现',
                        新建游戏按钮: '开启新生活',
                        返回主页按钮: '回到街道',
                        江湖设置按钮: '复兴设定',
                        保存进度按钮: '封存日志',
                        首页主标题: '战后岁月',
                        首页副标题: '复兴之路',
                        开始游戏按钮: '踏上重建之路',
                        继续游戏按钮: '继续旅程',
                        图片管理按钮: '相册管理',
                        世界书按钮: '世界书管理',
                            小说分解按钮: '小说分解',
                        设置按钮: '设置',
                        全屏按钮: '全屏',
                        精力标签: '精力',
                        内力标签: '体能',
                        饱腹标签: '饱腹',
                        水分标签: '水分',
                        经验标签: '经验',
                        钱财标签: '资金',
                        元宝单位: '万',
                        银单位: '千',
                        铜单位: '法郎',
                        身躯标题: '身体',
                        行头标题: '装备',
                        上传头像文字: '上传头像',
                        无称号文字: '无称号',
                        天气标签: '天气',
                        环境标签: '环境',
                        节日标签: '节日',
                        历程标签: '历程',
                        天气卡片标题: '气象信息',
                        环境卡片标题: '周边环境',
                        节日卡片标题: '今日节日',
                        未知地点: '未知位置',
                        右侧栏标题: '系统菜单',
                        右侧栏副标题: 'System Menu',
                        手动存档tab: '手动存档',
                        自动存档tab: '自动存档',
                        手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                        导出按钮: '导出日志',
                        导入按钮: '导入日志',
                        无记录文字: '暂无记录',
                        读取中文字: '加载中...',
                        立即保存按钮: '立即保存',
                        输入框占位: '输入你的行动...',
                        等待中占位: '等待处理中...',
                        发送按钮: '发送',
                        更多按钮: '更多',
                        收起按钮: '收起',
                        全部功能标题: '全部功能',
                        项后缀: '项',
                        音乐标签: '音乐',
                        一键生成标题: '一键生成当前场景',
                    },
                    openingScenes: [
                            { id: 'postwar_1', name: '废墟重建', description: '战后废墟中，人们重建家园，旧秩序与新思想碰撞' },
                            { id: 'postwar_2', name: '冷战阴影', description: '冷战时期，间谍与反间谍的暗战' },
                            { id: 'postwar_3', name: '民权运动', description: '民权运动风起云涌，游行与抗争的时代' }
                    ],
                }),
            ]
        ),
    ]
);

// ============================================================
// Epoch 2: 现代 (Contemporary)
// ============================================================

const contemporaryEpoch: EraNode = makeNode(
    'contemporary', '现代', 0, null,
    {
        description: '当代社会，信息时代，扁平化设计语言',
        colors: {
            'ink-black': '13 17 23',
            'ink-gray': '30 35 45',
            'primary': '80 160 250',
            'primary-dark': '30 100 200',
            'secondary': '60 180 80',
            'accent': '200 60 60',
            'paper-white': '235 242 250',
        },
        typography: {
            页面标题: "'PingFang SC', 'Helvetica Neue', 'Arial', sans-serif",
            正文: "'PingFang SC', 'Microsoft YaHei', sans-serif",
            等宽: "'SF Mono', 'Menlo', 'Consolas', monospace",
        },
        uiStyle: {
            style: 'modern',
            tone: 'casual',
            decorations: [],
        },
    },
    [
        // ── Era: 东方现代 ──
        makeNode(
            'contemporary_eastern', '东方现代', 1, 'contemporary',
            {
                description: '现代东方社会，都市化与传统文化并存',
                colors: {
                    'ink-black': '13 17 23',
                    'ink-gray': '22 27 34',
                    'primary': '88 166 255',
                    'primary-dark': '31 111 203',
                    'secondary': '63 185 80',
                    'accent': '210 60 60',
                    'paper-white': '235 240 246',
                },
                typography: {
                    页面标题: "'PingFang SC', 'Helvetica Neue', 'Arial', sans-serif",
                    正文: "'PingFang SC', 'Microsoft YaHei', sans-serif",
                    等宽: "'SF Mono', 'Menlo', 'Consolas', monospace",
                },
                uiStyle: {
                    style: 'modern',
                    tone: 'casual',
                    decorations: [],
                },
                bgmTags: ['电子', '流行', '城市生活'],
                artStyle: '现代写实',
            },
            [
                // SubEra: 都市 ← parent 从 contemporary 改为 contemporary_eastern
                makeNode(
                    'contemporary_urban', '都市', 2, 'contemporary_eastern',
                    {
                        description: '现代都市生活，CBD与高楼林立',
                        colors: {
                            'ink-black': '13 17 23',
                            'ink-gray': '22 27 34',
                            'primary': '88 166 255',
                            'primary-dark': '31 111 203',
                            'secondary': '63 185 80',
                            'accent': '210 60 60',
                            'paper-white': '235 240 246',
                        },
                        typography: {
                            页面标题: "'PingFang SC', 'Helvetica Neue', 'Arial', sans-serif",
                            正文: "'PingFang SC', 'Microsoft YaHei', sans-serif",
                            等宽: "'SF Mono', 'Menlo', 'Consolas', monospace",
                        },
                        uiStyle: {
                            style: 'modern',
                            tone: 'casual',
                            decorations: [],
                        },
                        bgmTags: ['电子', '流行', '城市生活'],
                        artStyle: '现代写实摄影·冷蓝',
                        uiCopy: {
                            设置面板标题: '个人设置',
                            存档标题: '保存进度',
                            加载存档标题: '加载存档',
                            新建游戏按钮: '创建新身份',
                            返回主页按钮: '返回主页',
                            江湖设置按钮: '游戏设置',
                            保存进度按钮: '保存进度',
                            首页主标题: '都市人生',
                            首页副标题: '无尽旅程',
                            开始游戏按钮: '开启人生',
                            继续游戏按钮: '继续生活',
                            图片管理按钮: '图片管理',
                            世界书按钮: '世界书管理',
                            小说分解按钮: '小说分解',
                            设置按钮: '设置',
                            全屏按钮: '全屏',
                            精力标签: '精力',
                            内力标签: '体能',
                            饱腹标签: '饱腹',
                            水分标签: '水分',
                            经验标签: '经验',
                            钱财标签: '资金',
                            元宝单位: '万',
                            银单位: '千',
                            铜单位: '百',
                            身躯标题: '身体',
                            行头标题: '装备',
                            上传头像文字: '上传头像',
                            无称号文字: '无称号',
                            天气标签: '气象',
                            环境标签: '环境',
                            节日标签: '节日',
                            历程标签: '历程',
                            天气卡片标题: '气象信息',
                            环境卡片标题: '周边环境',
                            节日卡片标题: '今日节日',
                            未知地点: '未知位置',
                            右侧栏标题: '系统菜单',
                            右侧栏副标题: 'System Menu',
                            手动存档tab: '手动存档',
                            自动存档tab: '自动存档',
                            手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                            导出按钮: '导出存档',
                            导入按钮: '导入存档',
                            无记录文字: '暂无记录',
                            读取中文字: '加载中...',
                            立即保存按钮: '立即保存',
                            输入框占位: '输入你的行动...',
                            等待中占位: '等待处理中...',
                            发送按钮: '发送',
                            更多按钮: '更多',
                            收起按钮: '收起',
                            全部功能标题: '全部功能',
                            项后缀: '项',
                            音乐标签: '音乐',
                            一键生成标题: '一键生成当前场景',
                        },
                        openingScenes: [
                                { id: 'urban_1', name: '都市霓虹', description: '现代都市霓虹闪烁，写字楼里暗藏玄机' },
                                { id: 'urban_2', name: '地下拳场', description: '城市边缘的地下拳场，格斗与赌资交易' },
                                { id: 'urban_3', name: '午夜街头', description: '午夜街头，两个陌生人的命运交汇' }
                        ],
                    }
                ),
                // SubEra: 乡村
                makeNode(
                    'contemporary_rural', '乡村', 2, 'contemporary_eastern',
            {
                description: '田园乡村，自然宁静，都市人的精神逃离',
                colors: {
                    'ink-black': '15 20 12',
                    'ink-gray': '35 42 30',
                    'primary': '100 160 80',
                    'primary-dark': '60 110 40',
                    'secondary': '180 160 100',
                    'accent': '220 120 50',
                    'paper-white': '245 250 235',
                },
                typography: {
                    页面标题: "'KaiTi', 'STKaiti', serif",
                    正文: "'PingFang SC', 'Microsoft YaHei', sans-serif",
                    等宽: "'Courier New', monospace",
                },
                uiStyle: {
                    style: 'modern',
                    tone: 'casual',
                    decorations: [],
                },
                bgmTags: ['民谣', '吉他', '自然声'],
                artStyle: '自然写实摄影·暖绿',
                uiCopy: {
                    设置面板标题: '农庄设置',
                    存档标题: '村志',
                    加载存档标题: '乡土记忆',
                    新建游戏按钮: '开启新农生',
                    返回主页按钮: '回归田园',
                    江湖设置按钮: '农庄设置',
                    保存进度按钮: '封存乡志',
                    首页主标题: '田园时光',
                    首页副标题: '宁静乡野',
                    开始游戏按钮: '回归田园',
                    继续游戏按钮: '重返农庄',
                    图片管理按钮: '相册管理',
                    世界书按钮: '乡志管理',
                            小说分解按钮: '小说分解',
                    设置按钮: '农庄设置',
                    全屏按钮: '全屏',
                    精力标签: '精力',
                    内力标签: '体力',
                    饱腹标签: '饱腹',
                    水分标签: '水分',
                    经验标签: '阅历',
                    钱财标签: '资金',
                    元宝单位: '块',
                    银单位: '毛',
                    铜单位: '分',
                    身躯标题: '身体',
                    行头标题: '衣装',
                    上传头像文字: '上传头像',
                    无称号文字: '庄稼人',
                    天气标签: '天气',
                    环境标签: '环境',
                    节日标签: '节日',
                    历程标签: '历程',
                    天气卡片标题: '气象信息',
                    环境卡片标题: '周边环境',
                    节日卡片标题: '今日节日',
                    未知地点: '未知位置',
                    右侧栏标题: '村委会',
                    右侧栏副标题: 'Village Center',
                    手动存档tab: '手动存档',
                    自动存档tab: '自动存档',
                    手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                    导出按钮: '导出乡志',
                    导入按钮: '导入乡志',
                    无记录文字: '暂无记录',
                    读取中文字: '翻阅中...',
                    立即保存按钮: '立即封存',
                    输入框占位: '输入你的行动...',
                    等待中占位: '等待处理中...',
                    发送按钮: '发送',
                    更多按钮: '更多',
                    收起按钮: '收起',
                    全部功能标题: '全部功能',
                    项后缀: '项',
                    音乐标签: '音乐',
                    一键生成标题: '一键生成当前场景',
                },
                openingScenes: [
                        { id: 'rural_1', name: '山村古井', description: '偏远山村，古井旁的闲聊暗含村里秘密' },
                        { id: 'rural_2', name: '庙会赶集', description: '乡间庙会，各色摊贩与江湖艺人汇聚' },
                        { id: 'rural_3', name: '祠堂议事', description: '宗族祠堂，长辈们商议要事，年轻一代不满' }
                ],
            }
        ),
        // SubEra: 末日废土
                makeNode(
                    'contemporary_post_apocalyptic', '末日废土', 2, 'contemporary_eastern',
            {
                description: '文明崩溃后的废土世界，生存与重建',
                colors: {
                    'ink-black': '10 10 8',
                    'ink-gray': '30 28 22',
                    'primary': '160 120 60',
                    'primary-dark': '100 70 30',
                    'secondary': '80 100 80',
                    'accent': '200 50 40',
                    'paper-white': '200 190 175',
                },
                typography: {
                    页面标题: "'Courier New', monospace",
                    正文: "'Courier New', monospace",
                    等宽: "'Courier New', monospace",
                },
                uiStyle: {
                    style: 'tech',
                    tone: 'casual',
                    decorations: ['grain'],
                },
                bgmTags: ['环境', '低频', '低沉', '荒漠'],
                artStyle: '废土写实摄影·沙黄',
                uiCopy: {
                    设置面板标题: '生存配置',
                    存档标题: '生存日志',
                    加载存档标题: '遗迹发掘',
                    新建游戏按钮: '成为幸存者',
                    返回主页按钮: '返回营地',
                    江湖设置按钮: '生存配置',
                    保存进度按钮: '封存日志',
                    首页主标题: '末日废土',
                    首页副标题: '无尽荒芜',
                    开始游戏按钮: '踏入废土',
                    继续游戏按钮: '重返荒原',
                    图片管理按钮: '残影管理',
                    世界书按钮: '遗迹图鉴管理',
                            小说分解按钮: '小说分解',
                    设置按钮: '生存配置',
                    全屏按钮: '全屏',
                    精力标签: '精力',
                    内力标签: '生存力',
                    饱腹标签: '饱腹',
                    水分标签: '水分',
                    经验标签: '生存经验',
                    钱财标签: '物资',
                    元宝单位: '瓶盖',
                    银单位: '弹药',
                    铜单位: '碎片',
                    身躯标题: '躯体',
                    行头标题: '护具',
                    上传头像文字: '留下印记',
                    无称号文字: '流浪者',
                    天气标签: '辐射指数',
                    环境标签: '环境状态',
                    节日标签: '营地事件',
                    历程标签: '求生日志',
                    天气卡片标题: '气象变更',
                    环境卡片标题: '周遭环境',
                    节日卡片标题: '今日事件',
                    未知地点: '未探索区域',
                    右侧栏标题: '营地',
                    右侧栏副标题: 'Survival Hub',
                    手动存档tab: '手动存档',
                    自动存档tab: '自动存档',
                    手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                    导出按钮: '导出日志',
                    导入按钮: '导入日志',
                    无记录文字: '暂无记录',
                    读取中文字: '翻阅中...',
                    立即保存按钮: '立即封存',
                    输入框占位: '输入你的行动...',
                    等待中占位: '等待回应中...',
                    发送按钮: '行动',
                    更多按钮: '更多',
                    收起按钮: '收起',
                    全部功能标题: '全部功能',
                    项后缀: '项',
                    音乐标签: '音乐',
                    一键生成标题: '一键生成当前场景',
                },
                openingScenes: [
                        { id: 'postapoc_1', name: '废墟幸存者', description: '核爆后的废墟城市，幸存者寻找物资' },
                        { id: 'postapoc_2', name: '地下避难所', description: '深埋地下的避难所，资源日益匮乏' },
                        { id: 'postapoc_3', name: '废土驿站', description: '废土上的补给站，各路旅人交换信息与物资' }
                ],
            }
        ),
            ]
        ),
        // ── Era: 西方现代 ──
        makeNode(
            'contemporary_western', '西方现代', 1, 'contemporary',
            {
                description: '现代西方社会，多元文化与个人主义',
                bgmTags: ['摇滚', '流行', '电子'],
                artStyle: '现代写实',
            },
            [
                // SubEra: 黑色犯罪
                makeNode(
                    'contemporary_noir', '黑色犯罪', 2, 'contemporary_western',
                    {
                        description: '冷硬派侦探、黑帮、都市犯罪叙事',
                        colors: {
                            'ink-black': '10 10 12',
                            'ink-gray': '30 28 32',
                            'primary': '140 140 140',
                            'primary-dark': '80 80 80',
                            'secondary': '60 60 70',
                            'accent': '183 28 28',
                            'paper-white': '220 220 225',
                        },
                        typography: {
                            页面标题: "'Georgia', 'Times New Roman', serif",
                            正文: "'Arial', sans-serif",
                            等宽: "'Courier New', monospace",
                        },
                        uiStyle: {
                            style: 'modern',
                            tone: 'formal',
                            decorations: [],
                        },
                        bgmTags: ['爵士', '低音萨克斯', '冷硬', '暗夜'],
                        artStyle: '冷硬派侦探·暗红',
                        uiCopy: {
                            设置面板标题: '案件配置',
                            存档标题: '案件档案',
                            加载存档标题: '旧案重查',
                            新建游戏按钮: '接受新委托',
                            返回主页按钮: '回到办公室',
                            江湖设置按钮: '案件配置',
                            保存进度按钮: '归档案件',
                            首页主标题: '黑色侦探',
                            首页副标题: '都市罪案',
                            开始游戏按钮: '踏入暗巷',
                            继续游戏按钮: '继续调查',
                            图片管理按钮: '证据管理',
                            世界书按钮: '案件簿管理',
                            小说分解按钮: '小说分解',
                            设置按钮: '案件设置',
                            全屏按钮: '全屏',
                            精力标签: '精力',
                            内力标签: '直觉',
                            饱腹标签: '饱腹',
                            水分标签: '水分',
                            经验标签: '破案经验',
                            钱财标签: '酬金',
                            元宝单位: '万',
                            银单位: '千',
                            铜单位: '元',
                            身躯标题: '身体',
                            行头标题: '装备',
                            上传头像文字: '上传肖像',
                            无称号文字: '无名侦探',
                            天气标签: '天气',
                            环境标签: '环境',
                            节日标签: '事件',
                            历程标签: '调查记录',
                            天气卡片标题: '天象变更',
                            环境卡片标题: '周边环境',
                            节日卡片标题: '今日事件',
                            未知地点: '未知位置',
                            右侧栏标题: '档案室',
                            右侧栏副标题: 'Case Files',
                            手动存档tab: '手动存档',
                            自动存档tab: '自动存档',
                            手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                            导出按钮: '导出档案',
                            导入按钮: '导入档案',
                            无记录文字: '暂无案件',
                            读取中文字: '翻阅中...',
                            立即保存按钮: '立即归档',
                            输入框占位: '输入你的调查...',
                            等待中占位: '等待线索中...',
                            发送按钮: '行动',
                            更多按钮: '更多',
                            收起按钮: '收起',
                            全部功能标题: '全部功能',
                            项后缀: '项',
                            音乐标签: '音乐',
                            一键生成标题: '一键生成当前场景',
                        },
                        openingScenes: [
                                { id: 'noir_1', name: '雨夜侦探', description: '暴雨之夜，私家侦探收到一封匿名委托信' },
                                { id: 'noir_2', name: '蛇蝎美人', description: '酒吧角落，美艳女子与黑帮大佬密谈' },
                                { id: 'noir_3', name: '码头交易', description: '深夜码头，一场见不得光的交易正在进行' }
                        ],
                    }
                ),
                // SubEra: 嬉皮士文化
                makeNode(
                    'contemporary_hippie', '嬉皮士文化', 2, 'contemporary_western',
                    {
                        description: '60-70年代反文化运动、摇滚、自由精神',
                        colors: {
                            'ink-black': '20 15 10',
                            'ink-gray': '45 38 25',
                            'primary': '255 111 0',
                            'primary-dark': '200 80 0',
                            'secondary': '100 180 60',
                            'accent': '255 60 120',
                            'paper-white': '250 245 230',
                        },
                        typography: {
                            页面标题: "'Georgia', serif",
                            正文: "'Arial', sans-serif",
                            等宽: "'Courier New', monospace",
                        },
                        uiStyle: {
                            style: 'retro',
                            tone: 'casual',
                            decorations: ['grain'],
                        },
                        bgmTags: ['迷幻摇滚', '风琴', '自由', '反文化'],
                        artStyle: '迷幻色彩·胶片颗粒',
                        uiCopy: {
                            设置面板标题: '公社设置',
                            存档标题: '自由日记',
                            加载存档标题: '回忆往昔',
                            新建游戏按钮: '开启新旅程',
                            返回主页按钮: '回到公社',
                            江湖设置按钮: '公社设置',
                            保存进度按钮: '封存日记',
                            首页主标题: '爱与和平',
                            首页副标题: '自由精神',
                            开始游戏按钮: '踏上自由之路',
                            继续游戏按钮: '继续旅程',
                            图片管理按钮: '照片管理',
                            世界书按钮: '日记管理',
                            小说分解按钮: '小说分解',
                            设置按钮: '公社设置',
                            全屏按钮: '全屏',
                            精力标签: '活力',
                            内力标签: '灵感',
                            饱腹标签: '饱腹',
                            水分标签: '水分',
                            经验标签: '阅历',
                            钱财标签: '资金',
                            元宝单位: '万',
                            银单位: '千',
                            铜单位: '元',
                            身躯标题: '身体',
                            行头标题: '行头',
                            上传头像文字: '上传头像',
                            无称号文字: '自由人',
                            天气标签: '天气',
                            环境标签: '环境',
                            节日标签: '节日',
                            历程标签: '足迹',
                            天气卡片标题: '天象变更',
                            环境卡片标题: '周边环境',
                            节日卡片标题: '今日节日',
                            未知地点: '未知位置',
                            右侧栏标题: '公社',
                            右侧栏副标题: 'Commune Hub',
                            手动存档tab: '手动存档',
                            自动存档tab: '自动存档',
                            手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                            导出按钮: '导出日记',
                            导入按钮: '导入日记',
                            无记录文字: '暂无记录',
                            读取中文字: '翻阅中...',
                            立即保存按钮: '立即封存',
                            输入框占位: '输入你的行动...',
                            等待中占位: '等待回应中...',
                            发送按钮: '发送',
                            更多按钮: '更多',
                            收起按钮: '收起',
                            全部功能标题: '全部功能',
                            项后缀: '项',
                            音乐标签: '音乐',
                            一键生成标题: '一键生成当前场景',
                        },
                        openingScenes: [
                                { id: 'hippie_1', name: '伍德斯托克', description: '音乐节现场，吉他声与欢呼声交织' },
                                { id: 'hippie_2', name: '公路旅行', description: '破旧面包车上的公路之旅，追寻自由与和平' },
                                { id: 'hippie_3', name: '公社生活', description: '嬉皮士公社，共享与反叛的乌托邦实验' }
                        ],
                    }
                ),
            ]
        ),
        // ── Era: 末日纪元 ──
        makeNode(
            'contemporary_apocalypse', '末日纪元', 1, 'contemporary',
            {
                description: '全球性灾难后的极端生存环境，人类在灭绝边缘的挣扎与重建',
                colors: {
                    'ink-black': '10 10 8',
                    'ink-gray': '30 28 22',
                    'primary': '160 120 60',
                    'primary-dark': '100 70 30',
                    'secondary': '80 100 80',
                    'accent': '200 50 40',
                    'paper-white': '200 190 175',
                },
                typography: {
                    页面标题: "'Courier New', monospace",
                    正文: "'Courier New', monospace",
                    等宽: "'Courier New', monospace",
                },
                uiStyle: {
                    style: 'tech',
                    tone: 'casual',
                    decorations: ['grain', 'scanline'],
                },
                bgmTags: ['末日', '生存', '紧张', '低频'],
                artStyle: '末日废土',
                promptVars: {
                    社会形态: '文明崩溃后的幸存者据点，资源极度匮乏，人性面临考验',
                    科技水平: '现代科技残存，部分设备仍可运作但缺乏维护',
                    力量体系: '生存技能、武器使用、医疗急救、据点建设',
                    叙事视角: '第三人称有限视角',
                    描写重点: '环境恶劣、资源争夺、人性考验、生存挣扎',
                    对话占比: '30%-40%',
                    禁忌: ['乌托邦', '完美世界', '轻松日常'],
                },
            },
            [
                // SubEra: 丧尸危机
                makeNode(
                    'contemporary_zombie', '丧尸危机', 2, 'contemporary_apocalypse',
                    {
                        description: '僵尸病毒爆发，幸存者据点防守，人性与感染恐惧',
                        colors: {
                            'ink-black': '8 10 8',
                            'ink-gray': '25 30 22',
                            'primary': '74 124 89',
                            'primary-dark': '40 80 50',
                            'secondary': '80 100 60',
                            'accent': '180 50 50',
                            'paper-white': '200 195 180',
                        },
                        typography: {
                            页面标题: "'Courier New', 'Arial Black', monospace",
                            正文: "'Courier New', monospace",
                            等宽: "'Courier New', monospace",
                        },
                        uiStyle: {
                            style: 'tech',
                            tone: 'casual',
                            decorations: ['grain'],
                        },
                        bgmTags: ['低沉鼓点', '尖叫', '恐怖', '紧张'],
                        artStyle: '腐肉绿·血渍质感·末日废墟',
                        uiCopy: {
                            设置面板标题: '生存配置',
                            存档标题: '生存日志',
                            加载存档标题: '遗迹发掘',
                            新建游戏按钮: '成为幸存者',
                            返回主页按钮: '返回营地',
                            江湖设置按钮: '生存配置',
                            保存进度按钮: '封存日志',
                            首页主标题: '丧尸危机',
                            首页副标题: '无尽感染',
                            开始游戏按钮: '踏入疫区',
                            继续游戏按钮: '重返营地',
                            图片管理按钮: '残影管理',
                            世界书按钮: '生存手册管理',
                            小说分解按钮: '小说分解',
                            设置按钮: '生存配置',
                            全屏按钮: '全屏',
                            精力标签: '精力',
                            内力标签: '生存力',
                            饱腹标签: '饱腹',
                            水分标签: '水分',
                            经验标签: '生存经验',
                            钱财标签: '物资',
                            元宝单位: '物资点',
                            银单位: '弹药',
                            铜单位: '碎片',
                            身躯标题: '躯体',
                            行头标题: '护具',
                            上传头像文字: '留下印记',
                            无称号文字: '幸存者',
                            天气标签: '感染指数',
                            环境标签: '环境状态',
                            节日标签: '营地事件',
                            历程标签: '求生日志',
                            天气卡片标题: '环境变更',
                            环境卡片标题: '周遭环境',
                            节日卡片标题: '今日事件',
                            未知地点: '未探索区域',
                            右侧栏标题: '营地',
                            右侧栏副标题: 'Survival Hub',
                            手动存档tab: '手动存档',
                            自动存档tab: '自动存档',
                            手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                            导出按钮: '导出日志',
                            导入按钮: '导入日志',
                            无记录文字: '暂无记录',
                            读取中文字: '翻阅中...',
                            立即保存按钮: '立即封存',
                            输入框占位: '输入你的行动...',
                            等待中占位: '等待回应中...',
                            发送按钮: '行动',
                            更多按钮: '更多',
                            收起按钮: '收起',
                            全部功能标题: '全部功能',
                            项后缀: '项',
                            音乐标签: '音乐',
                            一键生成标题: '一键生成当前场景',
                        },
                        conflictTypes: ['人尸对抗', '幸存者内斗', '资源争夺', '感染恐惧'],
                        openingScenes: [
                                { id: 'zombie_1', name: '末日初临', description: '第一波丧尸爆发，城市陷入混乱与恐慌' },
                                { id: 'zombie_2', name: '安全区堡垒', description: '军方建立的安全区，铁丝网外的丧尸嘶吼' },
                                { id: 'zombie_3', name: '废弃超市', description: '幸存者在废弃超市搜物资，危机四伏' }
                        ],
                    }
                ),
                // SubEra: 极寒末日
                makeNode(
                    'contemporary_extreme_cold', '极寒末日', 2, 'contemporary_apocalypse',
                    {
                        description: '全球冰河期，冰原生存，保暖与热量是核心资源',
                        colors: {
                            'ink-black': '8 12 18',
                            'ink-gray': '22 30 42',
                            'primary': '168 216 234',
                            'primary-dark': '100 160 200',
                            'secondary': '80 120 140',
                            'accent': '200 60 60',
                            'paper-white': '220 230 240',
                        },
                        typography: {
                            页面标题: "'Courier New', 'Arial', monospace",
                            正文: "'Courier New', monospace",
                            等宽: "'Courier New', monospace",
                        },
                        uiStyle: {
                            style: 'tech',
                            tone: 'casual',
                            decorations: ['scanline'],
                        },
                        bgmTags: ['风笛', '低频环境音', '风雪', '孤寂'],
                        artStyle: '冰蓝·风雪效果·冰封城市',
                        uiCopy: {
                            设置面板标题: '生存配置',
                            存档标题: '冰原日志',
                            加载存档标题: '遗迹发掘',
                            新建游戏按钮: '成为幸存者',
                            返回主页按钮: '返回避难所',
                            江湖设置按钮: '生存配置',
                            保存进度按钮: '封存日志',
                            首页主标题: '极寒末日',
                            首页副标题: '冰封世界',
                            开始游戏按钮: '踏入冰原',
                            继续游戏按钮: '重返避难所',
                            图片管理按钮: '冰影管理',
                            世界书按钮: '生存手册管理',
                            小说分解按钮: '小说分解',
                            设置按钮: '生存配置',
                            全屏按钮: '全屏',
                            精力标签: '体温',
                            内力标签: '生存力',
                            饱腹标签: '热量摄入',
                            水分标签: '融雪饮水',
                            经验标签: '生存经验',
                            钱财标签: '物资',
                            元宝单位: '燃料',
                            银单位: '物资点',
                            铜单位: '碎片',
                            身躯标题: '躯体',
                            行头标题: '防寒装备',
                            上传头像文字: '留下印记',
                            无称号文字: '流浪者',
                            天气标签: '温度指数',
                            环境标签: '冰原状态',
                            节日标签: '营地事件',
                            历程标签: '求生日志',
                            天气卡片标题: '气象变更',
                            环境卡片标题: '周遭环境',
                            节日卡片标题: '今日事件',
                            未知地点: '未探索区域',
                            右侧栏标题: '避难所',
                            右侧栏副标题: 'Shelter Hub',
                            手动存档tab: '手动存档',
                            自动存档tab: '自动存档',
                            手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                            导出按钮: '导出日志',
                            导入按钮: '导入日志',
                            无记录文字: '暂无记录',
                            读取中文字: '翻阅中...',
                            立即保存按钮: '立即封存',
                            输入框占位: '输入你的行动...',
                            等待中占位: '等待回应中...',
                            发送按钮: '行动',
                            更多按钮: '更多',
                            收起按钮: '收起',
                            全部功能标题: '全部功能',
                            项后缀: '项',
                            音乐标签: '音乐',
                            一键生成标题: '一键生成当前场景',
                        },
                        conflictTypes: ['极端天气', '资源短缺', '避难所争夺', '人性考验'],
                        openingScenes: [
                                { id: 'extreme_cold_1', name: '冰河世纪', description: '全球骤冷，城市被冰雪覆盖，幸存者艰难求生' },
                                { id: 'extreme_cold_2', name: '暖炉营地', description: '围绕巨大暖炉建立的临时营地，资源争夺不断' },
                                { id: 'extreme_cold_3', name: '冰封城市', description: '被冰雪封冻的摩天大楼，电梯井成为垂直通道' }
                        ],
                    }
                ),
                // SubEra: 生化危机
                makeNode(
                    'contemporary_biohazard', '生化危机', 2, 'contemporary_apocalypse',
                    {
                        description: '实验室泄漏，变异生物，防毒面具与隔离区',
                        colors: {
                            'ink-black': '8 10 5',
                            'ink-gray': '28 32 15',
                            'primary': '255 214 0',
                            'primary-dark': '180 150 0',
                            'secondary': '80 120 60',
                            'accent': '200 50 30',
                            'paper-white': '210 205 180',
                        },
                        typography: {
                            页面标题: "'Courier New', 'Arial Black', monospace",
                            正文: "'Courier New', monospace",
                            等宽: "'Courier New', monospace",
                        },
                        uiStyle: {
                            style: 'tech',
                            tone: 'casual',
                            decorations: ['holographic'],
                        },
                        bgmTags: ['电子警报', '环境低频', '紧张', '危机'],
                        artStyle: '生化黄·危险警示·隔离区',
                        uiCopy: {
                            设置面板标题: '生存配置',
                            存档标题: '隔离日志',
                            加载存档标题: '遗迹发掘',
                            新建游戏按钮: '成为幸存者',
                            返回主页按钮: '返回安全区',
                            江湖设置按钮: '生存配置',
                            保存进度按钮: '封存日志',
                            首页主标题: '生化危机',
                            首页副标题: '病毒扩散',
                            开始游戏按钮: '踏入疫区',
                            继续游戏按钮: '重返隔离',
                            图片管理按钮: '残影管理',
                            世界书按钮: '生存手册管理',
                            小说分解按钮: '小说分解',
                            设置按钮: '生存配置',
                            全屏按钮: '全屏',
                            精力标签: '健康值',
                            内力标签: '免疫力',
                            饱腹标签: '饱腹',
                            水分标签: '净水',
                            经验标签: '生存经验',
                            钱财标签: '物资',
                            元宝单位: '药品',
                            银单位: '物资点',
                            铜单位: '碎片',
                            身躯标题: '躯体',
                            行头标题: '防护服',
                            上传头像文字: '留下印记',
                            无称号文字: '幸存者',
                            天气标签: '污染指数',
                            环境标签: '生化状态',
                            节日标签: '隔离事件',
                            历程标签: '生存日志',
                            天气卡片标题: '环境变更',
                            环境卡片标题: '周遭环境',
                            节日卡片标题: '今日事件',
                            未知地点: '未探索区域',
                            右侧栏标题: '安全区',
                            右侧栏副标题: 'Biohazard Hub',
                            手动存档tab: '手动存档',
                            自动存档tab: '自动存档',
                            手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                            导出按钮: '导出日志',
                            导入按钮: '导入日志',
                            无记录文字: '暂无记录',
                            读取中文字: '翻阅中...',
                            立即保存按钮: '立即封存',
                            输入框占位: '输入你的行动...',
                            等待中占位: '等待回应中...',
                            发送按钮: '行动',
                            更多按钮: '更多',
                            收起按钮: '收起',
                            全部功能标题: '全部功能',
                            项后缀: '项',
                            音乐标签: '音乐',
                            一键生成标题: '一键生成当前场景',
                        },
                        conflictTypes: ['病毒扩散', '变异威胁', '实验室调查', '隔离区求生'],
                        openingScenes: [
                                { id: 'biohazard_1', name: '实验室泄漏', description: '生物实验室意外泄漏，变异体开始扩散' },
                                { id: 'biohazard_2', name: '隔离区', description: '被军方封锁的隔离区，幸存者在其中挣扎' },
                                { id: 'biohazard_3', name: '疫苗争夺', description: '最后一批疫苗引发各方势力争夺' }
                        ],
                    }
                ),
                // SubEra: 核冬天
                makeNode(
                    'contemporary_nuclear_winter', '核冬天', 2, 'contemporary_apocalypse',
                    {
                        description: '核战后废土，辐射变异，地下掩体与地表探索',
                        colors: {
                            'ink-black': '12 8 5',
                            'ink-gray': '35 25 18',
                            'primary': '255 140 0',
                            'primary-dark': '180 90 0',
                            'secondary': '100 80 50',
                            'accent': '220 60 40',
                            'paper-white': '195 185 170',
                        },
                        typography: {
                            页面标题: "'Courier New', 'Arial Black', monospace",
                            正文: "'Courier New', monospace",
                            等宽: "'Courier New', monospace",
                        },
                        uiStyle: {
                            style: 'tech',
                            tone: 'casual',
                            decorations: ['grain', 'scanline'],
                        },
                        bgmTags: ['盖革计数器声', '环境低频', '荒凉', '辐射'],
                        artStyle: '辐射橙·辐射尘·核战废土',
                        uiCopy: {
                            设置面板标题: '生存配置',
                            存档标题: '辐射日志',
                            加载存档标题: '遗迹发掘',
                            新建游戏按钮: '成为幸存者',
                            返回主页按钮: '返回掩体',
                            江湖设置按钮: '生存配置',
                            保存进度按钮: '封存日志',
                            首页主标题: '核冬天',
                            首页副标题: '核战余烬',
                            开始游戏按钮: '踏入废土',
                            继续游戏按钮: '重返掩体',
                            图片管理按钮: '残影管理',
                            世界书按钮: '遗迹图鉴管理',
                            小说分解按钮: '小说分解',
                            设置按钮: '生存配置',
                            全屏按钮: '全屏',
                            精力标签: '辐射剂量',
                            内力标签: '抗辐力',
                            饱腹标签: '饱腹',
                            水分标签: '净水',
                            经验标签: '生存经验',
                            钱财标签: '物资',
                            元宝单位: '抗辐宁',
                            银单位: '物资点',
                            铜单位: '碎片',
                            身躯标题: '躯体',
                            行头标题: '防辐装备',
                            上传头像文字: '留下印记',
                            无称号文字: '废土客',
                            天气标签: '辐射指数',
                            环境标签: '核污状态',
                            节日标签: '掩体事件',
                            历程标签: '求生日志',
                            天气卡片标题: '辐射变更',
                            环境卡片标题: '周遭环境',
                            节日卡片标题: '今日事件',
                            未知地点: '未探索区域',
                            右侧栏标题: '掩体',
                            右侧栏副标题: 'Bunker Hub',
                            手动存档tab: '手动存档',
                            自动存档tab: '自动存档',
                            手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                            导出按钮: '导出日志',
                            导入按钮: '导入日志',
                            无记录文字: '暂无记录',
                            读取中文字: '翻阅中...',
                            立即保存按钮: '立即封存',
                            输入框占位: '输入你的行动...',
                            等待中占位: '等待回应中...',
                            发送按钮: '行动',
                            更多按钮: '更多',
                            收起按钮: '收起',
                            全部功能标题: '全部功能',
                            项后缀: '项',
                            音乐标签: '音乐',
                            一键生成标题: '一键生成当前场景',
                        },
                        conflictTypes: ['辐射危害', '领地争夺', '遗迹探索', '重建文明'],
                        openingScenes: [
                                { id: 'nuclear_1', name: '蘑菇云后', description: '核爆之后，天空被灰暗笼罩，辐射尘弥漫' },
                                { id: 'nuclear_2', name: '地下堡垒', description: '政府地下堡垒中，权力博弈仍在继续' },
                                { id: 'nuclear_3', name: '辐射荒原', description: '辐射荒原上的流浪者，寻找未被污染的土地' }
                        ],
                    }
                ),
            ]
        ),
    ]
);

// ============================================================
// Epoch 3: 近未来 (Near Future)
// ============================================================

const nearFutureEpoch: EraNode = makeNode(
    'near-future', '近未来', 0, null,
    {
        description: '近未来科技，AI与生物技术革命的前夜',
        colors: {
            'ink-black': '6 6 16',
            'ink-gray': '18 12 36',
            'primary': '180 80 240',
            'primary-dark': '110 40 180',
            'secondary': '0 240 220',
            'accent': '250 0 110',
            'paper-white': '220 225 240',
        },
        typography: {
            页面标题: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            正文: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            等宽: "'JetBrains Mono', 'Fira Code', monospace",
        },
        uiStyle: {
            style: 'tech',
            tone: 'casual',
            decorations: ['neon-flicker', 'scanline'],
        },
    },
    [
        // ── Era 1: 技术反乌托邦 ──
        makeNode(
            'near-future_tech_dystopia', '技术反乌托邦', 1, 'near-future',
            {
                description: '科技失控、监控社会、数字极权',
                colors: {
                    'ink-black': '6 6 16',
                    'ink-gray': '18 12 36',
                    'primary': '180 80 240',
                    'primary-dark': '110 40 180',
                    'secondary': '0 240 220',
                    'accent': '250 0 110',
                    'paper-white': '220 225 240',
                },
                typography: {
                    页面标题: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                    正文: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                    等宽: "'JetBrains Mono', 'Fira Code', monospace",
                },
                uiStyle: {
                    style: 'tech',
                    tone: 'casual',
                    decorations: ['neon-flicker', 'scanline'],
                },
                bgmTags: ['电子', '合成器', '赛博'],
                artStyle: '赛博朋克写实',
                promptVars: {
                    社会形态: '科技巨头与政府深度绑定，数据监控无处不在，社会高度数字化但贫富差距悬殊',
                    科技水平: 'AI普及，义体改造流行，网络空间与现实界限模糊',
                    力量体系: '黑客技术、义体能力、情报网络、企业资源',
                    叙事视角: '第三人称有限视角或第一人称',
                    描写重点: '科技异化、身份认同、反抗与妥协、霓虹都市的黑暗面',
                    对话占比: '35%-45%',
                    禁忌: ['田园牧歌', '纯古典'],
                },
            },
            [
                // SubEra: 赛博朋克
                makeNode(
                    'near-future_cyberpunk', '赛博朋克', 2, 'near-future_tech_dystopia',
                    {
                        description: '霓虹都市，企业帝国，数据与肉体的边界模糊',
                        colors: {
                            'ink-black': '6 6 16',
                            'ink-gray': '18 12 36',
                            'primary': '200 100 255',
                            'primary-dark': '120 50 180',
                            'secondary': '0 255 230',
                            'accent': '255 0 120',
                            'paper-white': '220 225 240',
                        },
                        typography: {
                            页面标题: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', monospace",
                            正文: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                            等宽: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                        },
                        uiStyle: {
                            style: 'tech',
                            tone: 'casual',
                            decorations: ['neon-flicker', 'scanline'],
                        },
                        bgmTags: ['电子', '合成器', '赛博', '霓虹'],
                        artStyle: '赛博霓虹写实',
                        uiCopy: {
                            设置面板标题: '终端配置',
                            存档标题: '数据上传',
                            加载存档标题: '系统恢复',
                            新建游戏按钮: '接入新节点',
                            返回主页按钮: '断开连接',
                            江湖设置按钮: '终端配置',
                            保存进度按钮: '上传数据',
                            首页主标题: '赛博朋克',
                            首页副标题: '无尽网络',
                            开始游戏按钮: '登录系统',
                            继续游戏按钮: '重新连接',
                            图片管理按钮: '图像管理',
                            世界书按钮: '数据手册',
                            小说分解按钮: '小说分解',
                            设置按钮: '配置',
                            全屏按钮: '全屏',
                            精力标签: '能量',
                            内力标签: '神经电位',
                            饱腹标签: '能量摄入',
                            水分标签: '水分补充',
                            经验标签: '经验值',
                            钱财标签: '信用点',
                            元宝单位: '万点',
                            银单位: '千点',
                            铜单位: '点',
                            身躯标题: '躯体',
                            行头标题: '义体',
                            上传头像文字: '上传头像',
                            无称号文字: '无ID',
                            天气标签: '气候指数',
                            环境标签: '环境参数',
                            节日标签: '系统事件',
                            历程标签: '运行时长',
                            天气卡片标题: '天象变更',
                            环境卡片标题: '周遭环境',
                            节日卡片标题: '今日时节',
                            未知地点: '未定位',
                            右侧栏标题: '终端',
                            右侧栏副标题: 'System Menu',
                            手动存档tab: '手动存档',
                            自动存档tab: '自动存档',
                            手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                            导出按钮: '导出数据',
                            导入按钮: '导入数据',
                            无记录文字: '暂无记录',
                            读取中文字: '恢复中...',
                            立即保存按钮: '立即上传',
                            输入框占位: '输入指令...',
                            等待中占位: '处理中...',
                            发送按钮: '执行',
                            更多按钮: '更多',
                            收起按钮: '收起',
                            全部功能标题: '全部模块',
                            项后缀: '项',
                            音乐标签: '音频',
                            一键生成标题: '一键生成当前场景',
                        },
                        openingScenes: [
                                { id: 'cyber_1', name: '霓虹雨夜', description: '霓虹灯下的雨夜街头，义体改造人与黑客擦肩而过' },
                                { id: 'cyber_2', name: '数据深渊', description: '潜入网络空间的深处，数据深渊中藏着企业秘密' },
                                { id: 'cyber_3', name: '公司大厦', description: '企业巨头的摩天大楼，顶层是权力中心，底层是蝼蚁' }
                        ],
                    }
                ),
                // SubEra: 反乌托邦
                makeNode(
                    'near-future_dystopia', '反乌托邦', 2, 'near-future_tech_dystopia',
                    {
                        description: '极权与压迫，监控社会，个人自由的抗争',
                        colors: {
                            'ink-black': '8 8 10',
                            'ink-gray': '25 22 28',
                            'primary': '140 60 60',
                            'primary-dark': '90 35 35',
                            'secondary': '80 80 100',
                            'accent': '220 180 60',
                            'paper-white': '200 195 205',
                        },
                        typography: {
                            页面标题: "'JetBrains Mono', 'Consolas', monospace",
                            正文: "'JetBrains Mono', 'Consolas', monospace",
                            等宽: "'JetBrains Mono', 'Consolas', monospace",
                        },
                        uiStyle: {
                            style: 'tech',
                            tone: 'formal',
                            decorations: ['scanline'],
                        },
                        bgmTags: ['电子', '低沉', '压抑', '氛围'],
                        artStyle: '灰暗写实·压抑',
                        uiCopy: {
                            设置面板标题: '系统管控',
                            存档标题: '公民档案',
                            加载存档标题: '档案调阅',
                            新建游戏按钮: '注册新公民',
                            返回主页按钮: '返回管控中心',
                            江湖设置按钮: '系统管控',
                            保存进度按钮: '归档记录',
                            首页主标题: '美丽新世界',
                            首页副标题: '秩序之下',
                            开始游戏按钮: '服从指令',
                            继续游戏按钮: '继续监控',
                            图片管理按钮: '影像管理',
                            世界书按钮: '管控条例管理',
                            小说分解按钮: '小说分解',
                            设置按钮: '管控设置',
                            全屏按钮: '全屏',
                            精力标签: '体能指数',
                            内力标签: '服从度',
                            饱腹标签: '配给摄入',
                            水分标签: '水分配给',
                            经验标签: '信用评级',
                            钱财标签: '配给点',
                            元宝单位: '万点',
                            银单位: '千点',
                            铜单位: '点',
                            身躯标题: '躯体',
                            行头标题: '制服',
                            上传头像文字: '身份采集',
                            无称号文字: '无编号',
                            天气标签: '环境指数',
                            环境标签: '监控区域',
                            节日标签: '统一定日',
                            历程标签: '监控记录',
                            天气卡片标题: '环境变更',
                            环境卡片标题: '周遭环境',
                            节日卡片标题: '今日节日',
                            未知地点: '未登记区域',
                            右侧栏标题: '监控终端',
                            右侧栏副标题: 'Surveillance System',
                            手动存档tab: '手动存档',
                            自动存档tab: '自动存档',
                            手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                            导出按钮: '导出档案',
                            导入按钮: '导入档案',
                            无记录文字: '暂无记录',
                            读取中文字: '检索中...',
                            立即保存按钮: '立即归档',
                            输入框占位: '输入你的行为...',
                            等待中占位: '审核处理中...',
                            发送按钮: '提交',
                            更多按钮: '更多',
                            收起按钮: '收起',
                            全部功能标题: '全部模块',
                            项后缀: '项',
                            音乐标签: '音频',
                            一键生成标题: '一键生成当前场景',
                        },
                        openingScenes: [
                                { id: 'dystopia_1', name: '监控之下', description: '无处不在的监控摄像头，公民的每个行为都被记录' },
                                { id: 'dystopia_2', name: '思想审查', description: '思想警察突袭可疑分子，言论自由已成历史' },
                                { id: 'dystopia_3', name: '反抗之火', description: '地下反抗组织据点，策划着颠覆极权的行动' }
                        ],
                    }
                ),
            ]
        ),
        // ── Era 2: 太空扩张 ──
        makeNode(
            'near-future_space_expansion', '太空扩张', 1, 'near-future',
            {
                description: '人类向太阳系扩张，前哨基地与星际贸易',
                colors: {
                    'ink-black': '5 10 20',
                    'ink-gray': '15 25 40',
                    'primary': '60 150 220',
                    'primary-dark': '30 90 160',
                    'secondary': '0 200 150',
                    'accent': '255 120 50',
                    'paper-white': '225 235 250',
                },
                typography: {
                    页面标题: "'Orbitron', 'Rajdhani', sans-serif",
                    正文: "'PingFang SC', 'Microsoft YaHei', sans-serif",
                    等宽: "'Share Tech Mono', 'Consolas', monospace",
                },
                uiStyle: {
                    style: 'tech',
                    tone: 'formal',
                    decorations: ['holographic'],
                },
                bgmTags: ['电子', '管弦', '太空'],
                artStyle: '科幻写实·深空蓝',
                promptVars: {
                    社会形态: '人类开始太阳系殖民，前哨基地分散各星球，贸易网络发达但生活艰苦',
                    科技水平: '太空旅行成熟，生命维持系统先进，但设备维护依赖地球补给',
                    力量体系: '宇航技术、资源管理、外星生存、机械维修',
                    叙事视角: '第三人称有限视角',
                    描写重点: '深空孤独、基地建设、资源管理、未知探索',
                    对话占比: '25%-35%',
                    禁忌: ['地球日常', '纯古典'],
                },
            },
            [
                // SubEra: 太空殖民
                makeNode(
                    'near-future_space_colonization', '太空殖民', 2, 'near-future_space_expansion',
                    {
                        description: '人类向太阳系扩张，前哨基地与星际贸易',
                        colors: {
                            'ink-black': '5 10 20',
                            'ink-gray': '15 25 40',
                            'primary': '60 150 220',
                            'primary-dark': '30 90 160',
                            'secondary': '0 200 150',
                            'accent': '255 120 50',
                            'paper-white': '225 235 250',
                        },
                        typography: {
                            页面标题: "'Orbitron', 'Rajdhani', sans-serif",
                            正文: "'PingFang SC', 'Microsoft YaHei', sans-serif",
                            等宽: "'Share Tech Mono', 'Consolas', monospace",
                        },
                        uiStyle: {
                            style: 'tech',
                            tone: 'formal',
                            decorations: ['holographic'],
                        },
                        bgmTags: ['电子', '管弦', '太空', '悬疑'],
                        artStyle: '科幻写实·深空蓝',
                        uiCopy: {
                            设置面板标题: '前哨配置',
                            存档标题: '航行日志',
                            加载存档标题: '日志恢复',
                            新建游戏按钮: '注册新殖民者',
                            返回主页按钮: '返回星港',
                            江湖设置按钮: '前哨配置',
                            保存进度按钮: '同步日志',
                            首页主标题: '星际拓荒',
                            首页副标题: '无尽深空',
                            开始游戏按钮: '启动远征',
                            继续游戏按钮: '恢复任务',
                            图片管理按钮: '影像管理',
                            世界书按钮: '星图管理',
                            小说分解按钮: '小说分解',
                            设置按钮: '配置',
                            全屏按钮: '全屏',
                            精力标签: '能量',
                            内力标签: '神经同步',
                            饱腹标签: '营养摄入',
                            水分标签: '水循环',
                            经验标签: '任务经验',
                            钱财标签: '信用点',
                            元宝单位: '万点',
                            银单位: '千点',
                            铜单位: '点',
                            身躯标题: '宇航服',
                            行头标题: '装备',
                            上传头像文字: '上传头像',
                            无称号文字: '无识别码',
                            天气标签: '舱外环境',
                            环境标签: '空间站状态',
                            节日标签: '星历事件',
                            历程标签: '任务日志',
                            天气卡片标题: '环境变更',
                            环境卡片标题: '周遭环境',
                            节日卡片标题: '今日星历',
                            未知地点: '坐标未知',
                            右侧栏标题: '控制台',
                            右侧栏副标题: 'Mission Control',
                            手动存档tab: '手动存档',
                            自动存档tab: '自动存档',
                            手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                            导出按钮: '导出日志',
                            导入按钮: '导入日志',
                            无记录文字: '暂无记录',
                            读取中文字: '检索中...',
                            立即保存按钮: '立即同步',
                            输入框占位: '输入行动指令...',
                            等待中占位: '处理中...',
                            发送按钮: '执行',
                            更多按钮: '更多',
                            收起按钮: '收起',
                            全部功能标题: '全部模块',
                            项后缀: '项',
                            音乐标签: '音频',
                            一键生成标题: '一键生成当前场景',
                        },
                        openingScenes: [
                                { id: 'spacecol_1', name: '火星基地', description: '火星表面的前哨基地，红色沙尘暴正在逼近' },
                                { id: 'spacecol_2', name: '星际货船', description: '穿越小行星带的货运飞船，船员各怀心事' },
                                { id: 'spacecol_3', name: '太空电梯', description: '从赤道延伸至太空站的电梯，人类文明的奇迹' }
                        ],
                    }
                ),
            ]
        ),
    ]
);
// ============================================================
// Epoch 4: 未来 (Far Future)
// ============================================================

const farFutureEpoch: EraNode = makeNode(
    'far-future', '未来', 0, null,
    {
        description: '遥远未来，星际文明与未知宇宙',
        colors: {
            'ink-black': '5 13 20',
            'ink-gray': '10 25 40',
            'primary': '75 190 245',
            'primary-dark': '0 130 205',
            'secondary': '0 225 115',
            'accent': '255 80 80',
            'paper-white': '230 240 250',
        },
        typography: {
            页面标题: "'Orbitron', 'Rajdhani', 'PingFang SC', sans-serif",
            正文: "'PingFang SC', 'Microsoft YaHei', sans-serif",
            等宽: "'Share Tech Mono', 'Consolas', monospace",
        },
        uiStyle: {
            style: 'scifi',
            tone: 'formal',
            decorations: ['holographic'],
        },
    },
    [
        // ── Era 1: 星际文明 ──
        makeNode(
            'far-future_interstellar', '星际文明', 1, 'far-future',
            {
                description: '星际帝国、舰队战争、多星系文明',
                colors: {
                    'ink-black': '5 13 20',
                    'ink-gray': '10 25 40',
                    'primary': '75 190 245',
                    'primary-dark': '0 130 205',
                    'secondary': '0 225 115',
                    'accent': '255 80 80',
                    'paper-white': '230 240 250',
                },
                typography: {
                    页面标题: "'Orbitron', 'Rajdhani', 'PingFang SC', sans-serif",
                    正文: "'PingFang SC', 'Microsoft YaHei', sans-serif",
                    等宽: "'Share Tech Mono', 'Consolas', monospace",
                },
                uiStyle: {
                    style: 'scifi',
                    tone: 'formal',
                    decorations: ['holographic'],
                },
                bgmTags: ['管弦', '史诗', '星际'],
                artStyle: '深空科幻写实',
                promptVars: {
                    社会形态: '多星系帝国并存，星际贸易发达，舰队力量决定政治话语权',
                    科技水平: '超光速旅行、行星改造、能量武器普及',
                    力量体系: '灵能、舰队指挥、星际外交、基因改造',
                    叙事视角: '第三人称多视角或有限视角',
                    描写重点: '星际政治、舰队战斗、文明碰撞、宇宙探索',
                    对话占比: '25%-35%',
                    禁忌: ['田园牧歌', '纯古典'],
                },
            },
            [
                // SubEra: 星际科幻
                makeNode(
                    'far-future_space_opera', '星际科幻', 2, 'far-future_interstellar',
                    {
                        description: '星际帝国，舰队战争，多星系文明',
                        colors: {
                            'ink-black': '5 13 20',
                            'ink-gray': '10 25 40',
                            'primary': '79 195 247',
                            'primary-dark': '2 136 209',
                            'secondary': '0 230 118',
                            'accent': '255 82 82',
                            'paper-white': '230 240 250',
                        },
                        typography: {
                            页面标题: "'Orbitron', 'Rajdhani', 'PingFang SC', sans-serif",
                            正文: "'PingFang SC', 'Microsoft YaHei', sans-serif",
                            等宽: "'Share Tech Mono', 'Consolas', monospace",
                        },
                        uiStyle: {
                            style: 'scifi',
                            tone: 'formal',
                            decorations: ['holographic'],
                        },
                        bgmTags: ['管弦', '史诗', '星际', '壮阔'],
                        artStyle: '深空科幻写实',
                        uiCopy: {
                            设置面板标题: '系统参数',
                            存档标题: '星际日志',
                            加载存档标题: '历史检索',
                            新建游戏按钮: '注册新身份',
                            返回主页按钮: '返回星港',
                            江湖设置按钮: '系统参数',
                            保存进度按钮: '同步日志',
                            首页主标题: '星际迷航',
                            首页副标题: '无尽深空',
                            开始游戏按钮: '启动模拟',
                            继续游戏按钮: '恢复模拟',
                            图片管理按钮: '图像管理',
                            世界书按钮: '星图管理',
                            小说分解按钮: '小说分解',
                            设置按钮: '设置',
                            全屏按钮: '全屏',
                            精力标签: '能源',
                            内力标签: '灵能',
                            饱腹标签: '营养',
                            水分标签: '水合',
                            经验标签: '经验',
                            钱财标签: '资源',
                            元宝单位: '兆',
                            银单位: '千',
                            铜单位: '基',
                            身躯标题: '机体',
                            行头标题: '装备',
                            上传头像文字: '上传头像',
                            无称号文字: '无识别码',
                            天气标签: '大气状态',
                            环境标签: '环境参数',
                            节日标签: '星历事件',
                            历程标签: '运行日志',
                            天气卡片标题: '天象变更',
                            环境卡片标题: '周遭环境',
                            节日卡片标题: '今日时节',
                            未知地点: '坐标未知',
                            右侧栏标题: '星港',
                            右侧栏副标题: 'System Menu',
                            手动存档tab: '手动存档',
                            自动存档tab: '自动存档',
                            手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                            导出按钮: '导出日志',
                            导入按钮: '导入日志',
                            无记录文字: '暂无记录',
                            读取中文字: '检索中...',
                            立即保存按钮: '立即同步',
                            输入框占位: '输入行为参数...',
                            等待中占位: '计算中...',
                            发送按钮: '提交',
                            更多按钮: '更多',
                            收起按钮: '收起',
                            全部功能标题: '全部模块',
                            项后缀: '项',
                            音乐标签: '音乐',
                            一键生成标题: '一键生成当前场景',
                        },
                        openingScenes: [
                                { id: 'spaceopera_1', name: '星系议会', description: '多星系文明的代表齐聚星际议会，暗藏阴谋' },
                                { id: 'spaceopera_2', name: '星际舰队', description: '庞大舰队在星系间航行，准备迎接未知战争' },
                                { id: 'spaceopera_3', name: '异星遗迹', description: '远古文明遗留的异星遗迹，蕴藏着超越时代的科技' }
                        ],
                    }
                ),
            ]
        ),
        // ── Era 2: 数字超越 ──
        makeNode(
            'far-future_digital_transcendence', '数字超越', 1, 'far-future',
            {
                description: '意识数字化，人机融合，虚拟与现实边界消失',
                colors: {
                    'ink-black': '0 0 5',
                    'ink-gray': '10 10 25',
                    'primary': '200 180 255',
                    'primary-dark': '140 120 220',
                    'secondary': '150 255 250',
                    'accent': '255 150 255',
                    'paper-white': '240 240 255',
                },
                typography: {
                    页面标题: "'Orbitron', 'Rajdhani', monospace",
                    正文: "'Share Tech Mono', 'Consolas', monospace",
                    等宽: "'Share Tech Mono', 'Consolas', monospace",
                },
                uiStyle: {
                    style: 'scifi',
                    tone: 'casual',
                    decorations: ['holographic'],
                },
                bgmTags: ['电子', '环境', '数字'],
                artStyle: '数字写实·霓虹几何',
                promptVars: {
                    社会形态: '意识可以上传到数字空间，物理与虚拟世界并存，身份不再固定于单一躯体',
                    科技水平: '意识上传技术成熟，义体/机械躯体可选，虚拟现实无缝切换',
                    力量体系: '数字能力、意识控制、虚拟构建、网络攻防',
                    叙事视角: '第三人称有限视角或第一人称',
                    描写重点: '身份认同、现实边界、意识本质、虚拟情感',
                    对话占比: '30%-40%',
                    禁忌: ['纯肉体冒险', '原始社会'],
                },
            },
            [
                // SubEra: 赛博格
                makeNode(
                    'far-future_cyborg', '赛博格', 2, 'far-future_digital_transcendence',
                    {
                        description: '人类与机器的界限消失，意识上传与机械躯体',
                        colors: {
                            'ink-black': '0 5 10',
                            'ink-gray': '8 20 30',
                            'primary': '0 200 255',
                            'primary-dark': '0 130 200',
                            'secondary': '100 255 200',
                            'accent': '255 100 200',
                            'paper-white': '220 245 250',
                        },
                        typography: {
                            页面标题: "'Orbitron', 'Rajdhani', monospace",
                            正文: "'Share Tech Mono', 'Consolas', monospace",
                            等宽: "'Share Tech Mono', 'Consolas', monospace",
                        },
                        uiStyle: {
                            style: 'scifi',
                            tone: 'casual',
                            decorations: ['holographic', 'scanline'],
                        },
                        bgmTags: ['电子', '氛围', '赛博格', '空灵'],
                        artStyle: '未来写实·青白',
                        uiCopy: {
                            设置面板标题: '神经配置',
                            存档标题: '意识云',
                            加载存档标题: '意识下载',
                            新建游戏按钮: '初始化新意识',
                            返回主页按钮: '断开连接',
                            江湖设置按钮: '神经配置',
                            保存进度按钮: '上传意识',
                            首页主标题: '赛博格',
                            首页副标题: '人机共生',
                            开始游戏按钮: '接入系统',
                            继续游戏按钮: '恢复意识',
                            图片管理按钮: '影像管理',
                            世界书按钮: '协议管理',
                            小说分解按钮: '小说分解',
                            设置按钮: '配置',
                            全屏按钮: '全屏',
                            精力标签: '能量',
                            内力标签: '算力',
                            饱腹标签: '能量补充',
                            水分标签: '冷却液',
                            经验标签: '升级经验',
                            钱财标签: '信用点',
                            元宝单位: '兆点',
                            银单位: '千点',
                            铜单位: '点',
                            身躯标题: '躯体',
                            行头标题: '义体',
                            上传头像文字: '上传头像',
                            无称号文字: '无识别码',
                            天气标签: '环境参数',
                            环境标签: '系统状态',
                            节日标签: '网络事件',
                            历程标签: '运行日志',
                            天气卡片标题: '环境变更',
                            环境卡片标题: '周遭环境',
                            节日卡片标题: '今日事件',
                            未知地点: '坐标未知',
                            右侧栏标题: '终端',
                            右侧栏副标题: 'System Menu',
                            手动存档tab: '手动存档',
                            自动存档tab: '自动存档',
                            手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                            导出按钮: '导出数据',
                            导入按钮: '导入数据',
                            无记录文字: '暂无记录',
                            读取中文字: '下载中...',
                            立即保存按钮: '立即上传',
                            输入框占位: '输入指令...',
                            等待中占位: '同步中...',
                            发送按钮: '执行',
                            更多按钮: '更多',
                            收起按钮: '收起',
                            全部功能标题: '全部模块',
                            项后缀: '项',
                            音乐标签: '音频',
                            一键生成标题: '一键生成当前场景',
                        },
                        openingScenes: [
                                { id: 'cyborg_1', name: '意识上传', description: '意识上传中心，人类正跨越肉体与数字的边界' },
                                { id: 'cyborg_2', name: '机械之城', description: '完全由机械体运营的城市，硅基生命的繁荣' },
                                { id: 'cyborg_3', name: '人机边界', description: '人类与机械生命的边界线，紧张局势一触即发' }
                        ],
                    }
                ),
                // SubEra: 虚拟现实
                makeNode(
                    'far-future_virtual_reality', '虚拟现实', 2, 'far-future_digital_transcendence',
                    {
                        description: '意识完全进入虚拟世界，物理与数字的界限消失',
                        colors: {
                            'ink-black': '0 0 5',
                            'ink-gray': '10 10 25',
                            'primary': '200 180 255',
                            'primary-dark': '140 120 220',
                            'secondary': '150 255 250',
                            'accent': '255 150 255',
                            'paper-white': '240 240 255',
                        },
                        typography: {
                            页面标题: "'Orbitron', 'Rajdhani', monospace",
                            正文: "'Share Tech Mono', 'Consolas', monospace",
                            等宽: "'Share Tech Mono', 'Consolas', monospace",
                        },
                        uiStyle: {
                            style: 'scifi',
                            tone: 'casual',
                            decorations: ['holographic'],
                        },
                        bgmTags: ['电子', '环境', '数字', '空灵'],
                        artStyle: '数字写实·霓虹几何',
                        uiCopy: {
                            设置面板标题: '世界参数',
                            存档标题: '记忆碎片',
                            加载存档标题: '世界载入',
                            新建游戏按钮: '创建新化身',
                            返回主页按钮: '登出系统',
                            江湖设置按钮: '世界参数',
                            保存进度按钮: '保存世界线',
                            首页主标题: '虚拟现实',
                            首页副标题: '无尽次元',
                            开始游戏按钮: '进入虚拟',
                            继续游戏按钮: '重返虚拟',
                            图片管理按钮: '截图管理',
                            世界书按钮: '世界设定',
                            小说分解按钮: '小说分解',
                            设置按钮: '设置',
                            全屏按钮: '全屏',
                            精力标签: '连接稳定度',
                            内力标签: '创造力',
                            饱腹标签: '现实补给',
                            水分标签: '水分补充',
                            经验标签: '经验值',
                            钱财标签: '虚拟币',
                            元宝单位: '兆币',
                            银单位: '千币',
                            铜单位: '币',
                            身躯标题: '化身',
                            行头标题: '皮肤',
                            上传头像文字: '上传头像',
                            无称号文字: '匿名用户',
                            天气标签: '渲染环境',
                            环境标签: '场景参数',
                            节日标签: '系统事件',
                            历程标签: '在线时长',
                            天气卡片标题: '环境变更',
                            环境卡片标题: '周遭环境',
                            节日卡片标题: '今日事件',
                            未知地点: '未加载区域',
                            右侧栏标题: '控制台',
                            右侧栏副标题: 'System Menu',
                            手动存档tab: '手动存档',
                            自动存档tab: '自动存档',
                            手动存档说明: '手动与自动存档都会完整保存全部内容。导出时会按 ZIP 拆分为图片、聊天记录、游戏数据三个目录。',
                            导出按钮: '导出世界',
                            导入按钮: '导入世界',
                            无记录文字: '暂无记录',
                            读取中文字: '加载中...',
                            立即保存按钮: '立即保存',
                            输入框占位: '输入你的行动...',
                            等待中占位: '渲染中...',
                            发送按钮: '提交',
                            更多按钮: '更多',
                            收起按钮: '收起',
                            全部功能标题: '全部模块',
                            项后缀: '项',
                            音乐标签: '音频',
                            一键生成标题: '一键生成当前场景',
                        },
                        openingScenes: [
                                { id: 'vr_1', name: '虚拟乌托邦', description: '完美的虚拟世界中，居民忘记了真实的存在' },
                                { id: 'vr_2', name: '现实锚点', description: '少数人保留着对现实的记忆，试图唤醒沉睡者' },
                                { id: 'vr_3', name: '数字深渊', description: '虚拟世界的底层，被遗弃的代码和迷失的意识' }
                        ],
                    }
                ),
            ]
        ),
    ]
);

// ============================================================
// Epoch 5: 后人类 (Post-Human)
// ============================================================

const postHumanEpoch: EraNode = makeNode(
    'post-human', '后人类', 0, null,
    {
        description: '超越肉体与物理法则的时代，意识宇宙、维度旅行、纯能量生命',
        colors: {
            'ink-black': '0 0 0',
            'ink-gray': '15 15 15',
            'primary': '255 255 255',
            'primary-dark': '200 200 200',
            'secondary': '200 200 255',
            'accent': '180 255 200',
            'paper-white': '250 250 255',
        },
        typography: {
            页面标题: "'Orbitron', 'Rajdhani', 'Share Tech Mono', sans-serif",
            正文: "'Share Tech Mono', monospace",
            等宽: "'Share Tech Mono', monospace",
        },
        uiStyle: {
            style: 'scifi',
            tone: 'formal',
            decorations: ['holographic'],
        },
    },
    [
        // ── Era 1: 意识宇宙 ──
        makeNode(
            'post-human_consciousness', '意识宇宙', 1, 'post-human',
            {
                description: '脱离物质形态，意识即存在，维度旅行，数学实在',
                colors: {
                    'ink-black': '0 0 0',
                    'ink-gray': '15 15 15',
                    'primary': '255 255 255',
                    'primary-dark': '200 200 200',
                    'secondary': '200 200 255',
                    'accent': '180 255 200',
                    'paper-white': '250 250 255',
                },
                typography: {
                    页面标题: "'Orbitron', 'Rajdhani', 'Share Tech Mono', sans-serif",
                    正文: "'Share Tech Mono', monospace",
                    等宽: "'Share Tech Mono', monospace",
                },
                uiStyle: {
                    style: 'scifi',
                    tone: 'formal',
                    decorations: ['holographic'],
                },
                bgmTags: ['氛围', '极简', '数学', '超越'],
                artStyle: '抽象几何+数学美学',
                promptVars: {
                    社会形态: '超越传统社会结构，存在形式多样化，意识网络取代物理联系',
                    科技水平: '意识上传完成，维度操作可行，物理法则可局部改写',
                    力量体系: '意识控制、维度操控、数学规律应用、纯能量操控',
                    叙事视角: '非线性或多重视角',
                    描写重点: '存在本质、维度感知、意识交融、超越性体验',
                    对话占比: '15%-25%',
                    禁忌: ['肉体冒险', '原始社会', '日常琐事'],
                },
            },
            [
                // SubEra: 纯能量生命
                makeNode(
                    'post-human_energy', '纯能量生命', 2, 'post-human_consciousness',
                    {
                        description: '脱离物质形态，意识即存在',
                        colors: {
                            'ink-black': '0 0 0',
                            'ink-gray': '10 10 10',
                            'primary': '255 255 255',
                            'primary-dark': '220 220 220',
                            'secondary': '200 255 200',
                            'accent': '255 255 200',
                            'paper-white': '250 250 255',
                        },
                        typography: {
                            页面标题: "'Orbitron', 'Rajdhani', 'Share Tech Mono', sans-serif",
                            正文: "'Share Tech Mono', monospace",
                            等宽: "'Share Tech Mono', monospace",
                        },
                        uiStyle: {
                            style: 'scifi',
                            tone: 'formal',
                            decorations: ['holographic'],
                        },
                        bgmTags: ['氛围', '空灵', '纯能量', '极简'],
                        artStyle: '纯光抽象·虚空',
                        conflictTypes: ['存在危机', '能量衰减', '意识分裂', '维度崩塌'],
                        promptVars: {
                            社会形态: '超越传统社会结构，意识网络互联，个体可融合与分离',
                            科技水平: '纯能量形态，物理法则可局部改写，时空操控',
                            力量体系: '能量操控、意识融合、法则改写、维度感知',
                            叙事视角: '非线性、多重视角、全知视角',
                            描写重点: '存在本质、能量感知、意识交融、超越性体验',
                            对话占比: '10%-20%',
                            禁忌: ['肉体冒险', '原始社会', '日常琐事', '物理战斗'],
                        },
                        openingScenes: [
                                { id: 'energy_1', name: '纯粹光芒', description: '纯能量生命体在宇宙中遨游，超越物质形态' },
                                { id: 'energy_2', name: '维度裂缝', description: '高维度生命体观测着低维度宇宙的生灭' },
                                { id: 'energy_3', name: '意识共鸣', description: '亿万个意识体的思想交汇，形成新的宇宙秩序' }
                        ],
                    }
                ),
                // SubEra: 维度旅行
                makeNode(
                    'post-human_dimension', '维度旅行', 2, 'post-human_consciousness',
                    {
                        description: '跨越维度边界的多维叙事',
                        colors: {
                            'ink-black': '2 2 8',
                            'ink-gray': '15 12 30',
                            'primary': '180 140 255',
                            'primary-dark': '120 80 200',
                            'secondary': '100 255 200',
                            'accent': '255 100 255',
                            'paper-white': '245 240 255',
                        },
                        typography: {
                            页面标题: "'Orbitron', 'Rajdhani', 'Share Tech Mono', sans-serif",
                            正文: "'Share Tech Mono', monospace",
                            等宽: "'Share Tech Mono', monospace",
                        },
                        uiStyle: {
                            style: 'scifi',
                            tone: 'formal',
                            decorations: ['holographic'],
                        },
                        bgmTags: ['氛围', '数学', '多维', '悬疑'],
                        artStyle: '分形几何·多维投影',
                        conflictTypes: ['维度冲突', '现实崩塌', '认知极限', '时间悖论'],
                        promptVars: {
                            社会形态: '多维并存，跨维度文明交流，维度壁垒形成社会隔离',
                            科技水平: '维度旅行成熟，高维感知能力，时空操控技术',
                            力量体系: '维度操控、时空穿越、高维感知、现实重构',
                            叙事视角: '非线性、多维度切换',
                            描写重点: '维度感知、时空扭曲、现实崩塌、认知边界',
                            对话占比: '10%-20%',
                            禁忌: ['肉体冒险', '原始社会', '日常琐事'],
                        },
                        openingScenes: [
                                { id: 'dimension_1', name: '多维交汇处', description: '不同维度的现实在此交汇，物理法则失效' },
                                { id: 'dimension_2', name: '时间旅行者', description: '超越时间限制的存在，同时存在于过去与未来' },
                                { id: 'dimension_3', name: '虚空之门', description: '通往未知维度的门扉，迈出即永恒' }
                        ],
                    }
                ),
                // SubEra: 数学实在论
                makeNode(
                    'post-human_math', '数学实在论', 2, 'post-human_consciousness',
                    {
                        description: '宇宙是数学结构的终极揭示',
                        colors: {
                            'ink-black': '0 0 5',
                            'ink-gray': '12 12 20',
                            'primary': '220 220 255',
                            'primary-dark': '160 160 200',
                            'secondary': '180 255 220',
                            'accent': '255 200 100',
                            'paper-white': '248 248 255',
                        },
                        typography: {
                            页面标题: "'Orbitron', 'Rajdhani', 'Share Tech Mono', sans-serif",
                            正文: "'Share Tech Mono', monospace",
                            等宽: "'Share Tech Mono', monospace",
                        },
                        uiStyle: {
                            style: 'scifi',
                            tone: 'formal',
                            decorations: ['holographic'],
                        },
                        bgmTags: ['氛围', '极简', '数学', '和谐'],
                        artStyle: '数学美学·黄金比例',
                        conflictTypes: ['真理探索', '认知边界', '逻辑悖论', '无限困境'],
                        promptVars: {
                            社会形态: '数学结构即现实，逻辑规律成为社会力量，公理系统决定存在',
                            科技水平: '数学实在揭示，无限运算，几何构造',
                            力量体系: '数学操控、逻辑推演、模式识别、公式构建',
                            叙事视角: '抽象视角、数学隐喻',
                            描写重点: '数学之美、逻辑推演、认知突破、无限与有限',
                            对话占比: '10%-20%',
                            禁忌: ['肉体冒险', '原始社会', '日常琐事', '情感叙事'],
                        },
                        openingScenes: [
                                { id: 'math_1', name: '数学宇宙', description: '一切皆为数学结构，存在即方程式的解' },
                                { id: 'math_2', name: '无限集合', description: '在无穷集合的海洋中，意识以逻辑形式存在' },
                                { id: 'math_3', name: '公理之争', description: '不同公理体系的碰撞，决定着宇宙的底层逻辑' }
                        ],
                    }
                ),
            ]
        ),
    ]
);

// ============================================================
// 完整树
// ============================================================

export const eraTree: EraTree = {
    name: '墨色江湖·时代体系',
    children: [
        primordialEpoch,
        ancientEpoch,
        modernEpoch,
        contemporaryEpoch,
        nearFutureEpoch,
        farFutureEpoch,
        postHumanEpoch,
    ],
};

// ============================================================
// 扁平节点列表（便于按ID查找）
// ============================================================

function flatMapNodes(node: EraNode): EraNode[] {
    const result: EraNode[] = [node];
    if (node.children) {
        for (const child of node.children) {
            result.push(...flatMapNodes(child));
        }
    }
    return result;
}

export const allEraNodes: EraNode[] = eraTree.children.flatMap(flatMapNodes);

// ============================================================
// 核心查找函数
// ============================================================

/** 按ID查找节点（支持旧格式兼容） */
export function getEraById(id: string): EraNode | undefined {
    // 1. 直接查找（新版格式）
    const direct = allEraNodes.find((n) => n.id === id);
    if (direct) return direct;

    // 2. 旧格式兼容（era_ancient_wuxia → ancient_eastern_wuxia）
    const legacyMap: Record<string, string> = {
        era_ancient_wuxia: 'ancient_eastern_wuxia',
        era_republic_modern: 'modern_eastern_republic',
        era_modern_urban: 'contemporary_urban',
        era_cyberpunk_nearfuture: 'near-future_cyberpunk',
        era_scifi_future: 'far-future_space_opera',
    };
    const mapped = legacyMap[id];
    if (mapped) {
        return allEraNodes.find((n) => n.id === mapped);
    }

    return undefined;
}

/** 获取某节点到根的路径 */
export function getEraPath(id: string): EraNode[] {
    const node = getEraById(id);
    if (!node) return [];

    const path: EraNode[] = [node];
    let current = node;
    while (current.parent) {
        const parent = allEraNodes.find((n) => n.id === current.parent);
        if (parent) {
            path.unshift(parent);
            current = parent;
        } else {
            break;
        }
    }
    return path;
}

/** 继承解析：向上追溯父节点，合并元数据 */
export function resolveEraNode(id: string): {
    node: EraNode;
    inherited: {
        colors: EraColors;
        typography: EraTypography;
        uiStyle: EraUIStyle;
        bgmTags: string[];
        artStyle: string | undefined;
    };
    sources: string[];
} | null {
    const node = getEraById(id);
    if (!node) return null;

    const path = getEraPath(id);

    // 从根到本节点，第一个定义了某元数据的节点作为该维度的来源
    const getFirstDefined = <T>(getter: (n: EraNode) => T | undefined): { value: T; sourceId: string } | null => {
        for (const n of path) {
            const val = getter(n);
            if (val !== undefined) {
                return { value: val, sourceId: n.id };
            }
        }
        return null;
    };

    const colorsDef = getFirstDefined((n) => n.colors);
    const typographyDef = getFirstDefined((n) => n.typography);
    const uiStyleDef = getFirstDefined((n) => n.uiStyle);
    const bgmTagsDef = getFirstDefined((n) => n.bgmTags);
    const artStyleDef = getFirstDefined((n) => n.artStyle);

    // Epoch层的默认值兜底（确保永远有值）
    const defaultColors: EraColors = ancientEpoch.colors!;
    const defaultTypography: EraTypography = ancientEpoch.typography!;
    const defaultUIStyle: EraUIStyle = ancientEpoch.uiStyle!;

    return {
        node,
        inherited: {
            colors: colorsDef?.value ?? defaultColors,
            typography: typographyDef?.value ?? defaultTypography,
            uiStyle: uiStyleDef?.value ?? defaultUIStyle,
            bgmTags: bgmTagsDef?.value ?? [],
            artStyle: artStyleDef?.value,
        },
        sources: [
            colorsDef?.sourceId,
            typographyDef?.sourceId,
            uiStyleDef?.sourceId,
            bgmTagsDef?.sourceId,
            artStyleDef?.sourceId,
        ].filter(Boolean) as string[],
    };
}

// ============================================================
// 向后兼容：时代主题方案列表（旧接口）
// ============================================================

// 旧接口保留，向后兼容
export interface 时代主题配色 {
    'ink-black': string;
    'ink-gray': string;
    primary: string;
    'primary-dark': string;
    secondary: string;
    accent: string;
    'paper-white': string;
}

export interface 时代主题字体 {
    页面标题: string;
    正文: string;
    等宽: string;
}

export interface 时代主题方案 {
    id: string;
    名称: string;
    描述: string;
    配色: 时代主题配色;
    字体: 时代主题字体;
    界面文案?: Record<string, string>;
    背景装饰?: {
        扫描线?: boolean;
        颗粒感?: boolean;
    };
}

/** 将新节点转换为旧格式（兼容旧代码） */
function toLegacyEra(node: EraNode): 时代主题方案 | null {
    const resolved = resolveEraNode(node.id);
    if (!resolved) return null;
    return {
        id: node.id,
        名称: node.name,
        描述: node.description ?? '',
        配色: resolved.inherited.colors as 时代主题配色,
        字体: resolved.inherited.typography as 时代主题字体,
        界面文案: node.uiCopy,
    };
}

// 导出叶子节点作为旧列表（仅SubEra层）
export const 时代主题方案列表: 时代主题方案[] = allEraNodes
    .filter((n) => n.depth === 2)
    .map((n) => toLegacyEra(n)!)
    .filter(Boolean);

/** 旧接口兼容函数 */
export const 获取时代主题方案 = (eraId: string): 时代主题方案 | undefined => {
    return 时代主题方案列表.find((e) => e.id === eraId);
};

// ============================================================
// 便捷导出
// ============================================================

// Re-export for convenience (no-op, already exported above)
