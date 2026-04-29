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
                        characterArchetypes: [
                                { id: 'pa_spirit_healer', name: '部落巫医', description: '与神灵沟通的媒介，掌握古老治愈仪式', appearance: '身披兽皮，脸上绘有白色图腾纹路', abilities: ['巫术治愈', '祖先通灵', '毒草辨识'] },
                                { id: 'pa_hunter_chief', name: '狩猎首领', description: '部落最勇猛的战士，带领猎手们获取食物', appearance: '肌肉发达，手持石制长矛，腰间挂着兽牙项链', abilities: ['追踪术', '野兽搏斗', '战术指挥'] },
                                { id: 'pa_fire_keeper', name: '守火者', description: '守护部落圣火，是部落的生存象征', appearance: '年迈老者，眼睛在火光中闪烁着奇异光芒', abilities: ['火焰掌控', '火种保存', '仪式主持'] }
                        ],
                        writingSamples: [
                                { id: 'pa_ws_1', title: '篝火旁的传说', excerpt: '长老的声音在火光中低沉而有力："当第一颗星星落入大地，我们学会了用火驱散黑暗。祖先的魂魄在火焰中注视着我们。"' },
                                { id: 'pa_ws_2', title: '狩猎归来', excerpt: '长矛刺穿了羚羊的咽喉，鲜血染红了大地。勇士们齐声欢呼，这是部落今日最丰盛的猎物。' }
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
                        characterArchetypes: [
                                { id: 'pam_high_priest', name: '大祭司', description: '羽蛇神的代言人，掌握历法与天文知识', appearance: '头戴翡翠羽冠，身穿金线织成的祭祀袍', abilities: ['天象预言', '祭祀仪式', '历法计算'] },
                                { id: 'pam_jaguar_warrior', name: '美洲虎战士', description: '部落精英战士，以猎杀猛兽证明勇武', appearance: '身披美洲虎皮，手持黑曜石短剑', abilities: ['近身搏杀', '丛林潜行', '陷阱布置'] },
                                { id: 'pam_merchant', name: '远途商人', description: '跨越多个部落的贸易者，传递各方消息', appearance: '背着沉重的货物袋，脖子上挂着贝壳货币', abilities: ['多部落语言', '货物估价', '路线记忆'] }
                        ],
                        writingSamples: [
                                { id: 'pam_ws_1', title: '太阳祭典', excerpt: '金字塔的台阶上，祭司高举双手，迎接第一缕晨光。人群的吟唱声在山谷中回荡，仿佛与天地共鸣。' },
                                { id: 'pam_ws_2', title: '丛林猎场', excerpt: '猎豹的足迹消失在密林深处，年轻的猎手屏住呼吸，手指紧紧握住黑曜石长矛。' }
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
                        characterArchetypes: [
                                { id: 'pn_seer', name: '符文先知', description: '以卢恩符文预视未来，为部落指引方向', appearance: '独眼老者，手指上刻有符文印记', abilities: ['符文占卜', '命运预视', '古语吟唱'] },
                                { id: 'pn_berserker', name: '狂战士', description: '战斗中进入狂暴状态的战士，力大无穷', appearance: '身披熊皮，双眼血红，手持双斧', abilities: ['狂暴之力', '恐惧威慑', '双持战斗'] },
                                { id: 'pn_skald', name: '吟游诗人', description: '传承北欧神话与英雄史诗的记忆者', appearance: '长发披肩，怀抱鲁特琴，眼神灵动', abilities: ['史诗吟唱', '历史记忆', '士气鼓舞'] }
                        ],
                        writingSamples: [
                                { id: 'pn_ws_1', title: '符文启示', excerpt: '老先知在雪地上刻下卢恩符文，每个符号都在寒风中微微发光。"命运已经注定，"他说，"但我们仍有选择的自由。"' },
                                { id: 'pn_ws_2', title: '长船破浪', excerpt: '龙头船在波涛中起伏，勇士们齐声唱着出征之歌。海风带来盐的味道，前方是未知的土地。' }
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
                        characterArchetypes: [
                                { id: 'wuxia_wandering_swordsman', name: '流浪剑客', description: '江湖独行侠，剑术高超却不求名利', appearance: '一袭青衫，腰间佩剑，面容冷峻', abilities: ['快剑', '轻功', '酒量过人'] },
                                { id: 'wuxia_sect_leader', name: '掌门人', description: '名门正派的领袖，德高望重', appearance: '身着门派服饰，手持拂尘，仙风道骨', abilities: ['镇派绝学', '门派威望', '内力深厚'] },
                                { id: 'wuxia_poison_master', name: '毒医双修', description: '精通毒药与医术的神秘人物', appearance: '面色苍白，手指常年染着药草之色', abilities: ['毒术', '医术', '药物辨识'] }
                        ],
                        writingSamples: [
                                { id: 'wuxia_ws_1', title: '华山论剑', excerpt: '剑光如电，两道身影在半空中交错。青衫剑客的剑气在山风中划出一道弧线，对手退后三步，抱拳道："好剑法。"' },
                                { id: 'wuxia_ws_2', title: '客栈风波', excerpt: '酒保端上最后一壶浊酒，角落里戴斗笠的男子抬起头来。那一瞬间，整个客栈的空气仿佛凝固了。' }
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
                        characterArchetypes: [
                                { id: 'zhiguai_fox_spirit', name: '狐仙', description: '修行千年的狐仙，法力高深', appearance: '红衣女子，眼含秋水，举止妖娆', abilities: ['幻化人形', '魅惑术', '千年法力'] },
                                { id: 'zhiguai_taoist', name: '游方道士', description: '行走于阴阳两界的捉妖人', appearance: '道袍破旧，手持桃木剑，腰间挂满符咒', abilities: ['捉妖术', '符箓阵法', '阴阳眼'] },
                                { id: 'zhiguai_scholar', name: '落魄书生', description: '屡试不第的书生，却总能遇见奇缘', appearance: '衣衫褴褛但气质儒雅，手中总捧着一卷书', abilities: ['过目不忘', '诗赋成文', '奇缘体质'] }
                        ],
                        writingSamples: [
                                { id: 'zhiguai_ws_1', title: '荒村狐仙', excerpt: '月色下的老槐树旁，红衣女子缓缓走来。书生揉了揉眼睛，不知是梦是真。只听她轻声道："公子，我们三年前便见过了。"' },
                                { id: 'zhiguai_ws_2', title: '古井怨灵', excerpt: '十五的月光照在井上，水面泛起幽蓝的光。一声若有若无的哭泣从深处传来，连风都停了。' }
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
                        characterArchetypes: [
                                { id: 'myth_immortal', name: '昆仑仙人', description: '居住在昆仑仙山，修炼千年', appearance: '白衣飘飘，鹤发童颜，脚踏祥云', abilities: ['腾云驾雾', '炼丹术', '仙法神通'] },
                                { id: 'myth_dragon_princess', name: '龙宫公主', description: '东海龙王之女，掌管水下生灵', appearance: '身着水蓝色长裙，发间点缀明珠', abilities: ['御水术', '号令水族', '龙血之力'] },
                                { id: 'myth_demon_general', name: '镇妖将军', description: '天庭派驻人间的守护者，镇压群妖', appearance: '身披金甲，手持方天画戟，威风凛凛', abilities: ['天将神力', '降妖除魔', '战阵指挥'] }
                        ],
                        writingSamples: [
                                { id: 'myth_ws_1', title: '昆仑仙境', excerpt: '云雾缭绕间，一座白玉桥横跨天际。桥那头，白发老者盘膝而坐，周身仙气环绕，不似凡间中人。' },
                                { id: 'myth_ws_2', title: '龙宫探秘', excerpt: '碧波之下，水晶宫的光芒令人目眩。虾兵蟹将列队两旁，龙王端坐龙椅，声如洪钟："凡人所求何事？"' }
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
                        characterArchetypes: [
                                { id: 'intrigue_strategist', name: '幕后谋士', description: '不出朝堂却能左右局势的智者', appearance: '手持羽扇，面带微笑，眼神却深不可测', abilities: ['谋略布局', '人心洞察', '情报收集'] },
                                { id: 'intrigue_eunuch', name: '掌印太监', description: '皇帝身边的红人，掌握内廷大权', appearance: '面白无须，身穿蟒袍，声音尖细', abilities: ['皇帝信任', '内廷操控', '密探网络'] },
                                { id: 'intrigue_princess', name: '和亲公主', description: '以婚姻为棋子的皇室女性', appearance: '凤冠霞帔，容貌绝美，眼神坚韧', abilities: ['政治联姻', '后宫手腕', '暗中布局'] }
                        ],
                        writingSamples: [
                                { id: 'intrigue_ws_1', title: '金殿博弈', excerpt: '一封奏折在群臣手中传阅，字字如刀。宰相微微一笑："陛下，此事还需三思。"一句话，暗藏多少杀机。' },
                                { id: 'intrigue_ws_2', title: '暗巷密谋', excerpt: '烛火摇曳间，两人的影子在墙上交错。"此人必须除掉，"低声说，"但要做得天衣无缝。"' }
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
                        characterArchetypes: [
                                { id: 'cultivation_elder', name: '宗门长老', description: '修炼数百年的老怪物，深不可测', appearance: '白发苍苍，仙风道骨，周身灵气环绕', abilities: ['元婴期修为', '宗门绝学', '炼器炼丹'] },
                                { id: 'cultivation_genius', name: '天灵根弟子', description: '百年难遇的修炼天才', appearance: '年轻俊朗/秀美，眼中闪烁着灵气', abilities: ['天灵根', '功法顿悟', '越阶挑战'] },
                                { id: 'cultivation_demonic', name: '魔道散修', description: '修炼禁术的独行修士', appearance: '黑袍覆面，周身散发阴冷气息', abilities: ['魔功秘术', '邪道阵法', '夺舍重生'] }
                        ],
                        writingSamples: [
                                { id: 'cultivation_ws_1', title: '灵根觉醒', excerpt: '测灵石发出耀眼的光芒，少年的双手微微颤抖。长老们从座位上站起——百年难得一遇的天灵根！' },
                                { id: 'cultivation_ws_2', title: '洞府突破', excerpt: '灵气如潮水般涌入丹田，经脉传来撕裂般的疼痛。他咬牙运转功法，终于感受到那层壁垒出现了裂痕。' }
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
                    characterArchetypes: [
                            { id: 'greek_oracle', name: '德尔斐神谕者', description: '阿波罗神殿的女祭司，传达神意', appearance: '头戴月桂冠，双眼蒙着白纱', abilities: ['神谕预言', '神殿仪式', '神圣迷醉'] },
                            { id: 'greek_philosopher', name: '雅典哲人', description: '追求真理与智慧的学者', appearance: '白色长袍，胡须浓密，手持橄榄枝', abilities: ['辩证法', '演讲鼓动', '自然哲学'] },
                            { id: 'greek_hero', name: '半神英雄', description: '神与人结合所生的后裔', appearance: '身材魁梧，肌肉结实，手持神赐武器', abilities: ['神赐神力', '战斗天赋', '英雄命运'] }
                    ],
                    writingSamples: [
                            { id: 'greek_ws_1', title: '奥林匹斯山巅', excerpt: '众神之王端坐于云端，目光投向下方渺小的凡人世界。"命运三女神已经纺好了线，"他说，"一切都将如期而至。"' },
                            { id: 'greek_ws_2', title: '雅典辩论', excerpt: '广场上的民众屏息倾听。哲人的声音在石柱间回荡："未经审视的人生不值得过。"' }
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
                    characterArchetypes: [
                            { id: 'roman_senator', name: '元老院议员', description: '罗马政治的核心人物', appearance: '身穿白色托加袍，手指上戴着金戒', abilities: ['政治演说', '法律制定', '元老院投票'] },
                            { id: 'roman_centurion', name: '百夫长', description: '罗马军团的骨干指挥官', appearance: '身披锁子甲，头盔上有红色鬃毛', abilities: ['军团指挥', '短剑格斗', '盾墙战术'] },
                            { id: 'roman_gladiator', name: '角斗士', description: '在角斗场上为自由而战的奴隶', appearance: '满身伤疤，肌肉发达，手持角斗网和三叉戟', abilities: ['角斗技巧', '观众魅力', '生存本能'] }
                    ],
                    writingSamples: [
                            { id: 'roman_ws_1', title: '元老院', excerpt: '"罗马不是一天建成的，"议员站起身来，"但它可以在一天之内被毁掉。"大厅内一片死寂。' },
                            { id: 'roman_ws_2', title: '角斗士的誓言', excerpt: '他站在铁栏后面，望着外面震耳欲聋的观众席。"我们走向死亡的人，向你致敬。"' }
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
                    characterArchetypes: [
                            { id: 'medieval_knight', name: '十字军骑士', description: '为信仰而战的圣骑士', appearance: '全身板甲，盾上绘有十字架', abilities: ['骑枪冲锋', '圣光祝福', '骑士誓言'] },
                            { id: 'medieval_monk', name: '修道院学者', description: '守护古老知识的修士', appearance: '粗布僧袍，手指沾满墨水', abilities: ['古籍解读', '草药医术', '抄写术'] },
                            { id: 'medieval_bard', name: '吟游诗人', description: '游历各地的故事传唱者', appearance: '色彩斑斓的服装，手持六弦琴', abilities: ['歌曲鼓舞', '信息收集', '贵族礼仪'] }
                    ],
                    writingSamples: [
                            { id: 'medieval_ws_1', title: '城堡之夜', excerpt: '月光照在石墙上，守卫在城墙上巡逻。远处，敌军的篝火像地上的星星一样蔓延。今夜无眠。' },
                            { id: 'medieval_ws_2', title: '修道院密卷', excerpt: '老修士翻开羊皮纸，烛光照亮了古老的拉丁文字。"这本书如果被教廷知道，我们都要被烧死。"' }
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
                        characterArchetypes: [
                                { id: 'viking_jarl', name: '部落酋长', description: '维京部族的领导者', appearance: '金发编成辫子，身穿锁子甲，手持圆斧', abilities: ['掠夺指挥', '航海导航', '宴饮豪情'] },
                                { id: 'viking_shieldmaiden', name: '盾女', description: '与男子并肩作战的女战士', appearance: '红发飘扬，手持盾牌和长剑', abilities: ['盾墙战术', '双持战斗', '狂战士怒吼'] },
                                { id: 'viking_seidman', name: '萨满术士', description: '掌握北欧巫术的神秘人物', appearance: '脸上画着蓝色符文，身披狼皮', abilities: ['萨满巫术', '天气操控', '灵魂出窍'] }
                        ],
                        writingSamples: [
                                { id: 'viking_ws_1', title: '英灵殿', excerpt: '瓦尔哈拉大殿内，英灵们举杯豪饮。"诸神黄昏终将到来，"酋长高声说，"但在那之前，我们要让敌人知道什么是恐惧！"' },
                                { id: 'viking_ws_2', title: '雪夜占卜', excerpt: '萨满将符文石抛向空中，它们在雪地上落下。"北面的路是危险的，但荣耀也在北方等着我们。"' }
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
                        characterArchetypes: [
                                { id: 'celtic_druid', name: '德鲁伊', description: '凯尔特自然魔法的守护者', appearance: '白袍披身，手持橡木杖，头戴槲寄生花环', abilities: ['自然魔法', '变形术', '预言术'] },
                                { id: 'celtic_bard', name: '凯尔特吟游诗人', description: '口述历史的传承者', appearance: '绿色斗篷，手持竖琴', abilities: ['史诗吟唱', '魔法音乐', '记忆传承'] },
                                { id: 'celtic_champion', name: '部落勇士', description: '凯尔特部族的最强战士', appearance: '赤裸上身，皮肤上满是凯尔特纹身', abilities: ['狂战士之力', '战吼威慑', '投掷飞斧'] }
                        ],
                        writingSamples: [
                                { id: 'celtic_ws_1', title: '巨石阵', excerpt: '德鲁伊的手放在巨石上，古老的符文在他指尖发光。"大地在告诉我们，季节即将更替。"' },
                                { id: 'celtic_ws_2', title: '圆桌誓言', excerpt: '"我发誓，"年轻的骑士将剑指向天空，"守护弱小，忠于荣誉，至死不渝。"' }
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
                        characterArchetypes: [
                                { id: 'republic_warlord', name: '军阀', description: '掌控一方的军事强人', appearance: '军装笔挺，腰间佩枪，眼神凌厉', abilities: ['军事指挥', '地盘控制', '外交手腕'] },
                                { id: 'republic_journalist', name: '进步记者', description: '以笔为武器的知识分子', appearance: '西装革履，戴着圆框眼镜，手持钢笔', abilities: ['文章写作', '情报搜集', '舆论引导'] },
                                { id: 'republic_secret_agent', name: '地下特工', description: '潜伏在暗处的秘密工作者', appearance: '穿着普通，但眼神警惕', abilities: ['伪装术', '密码破译', '近身格斗'] }
                        ],
                        writingSamples: [
                                { id: 'republic_ws_1', title: '十里洋场', excerpt: '霓虹灯下，上海的街道比白昼还要明亮。西装与旗袍擦肩而过，黄包车夫在人群中穿梭。这是一个新旧交替的时代。' },
                                { id: 'republic_ws_2', title: '茶馆密议', excerpt: '"局势一天比一天糟，"他压低声音说，"军阀们又打起来了。"茶客们默默摇头。' }
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
                        characterArchetypes: [
                                { id: 'meiji_samurai', name: '末代武士', description: '坚守武士道的最后武士', appearance: '身着传统和服，腰插双刀', abilities: ['剑术', '武士道', '茶道'] },
                                { id: 'meiji_mobo', name: '摩登女郎', description: '接受新思潮的都市女性', appearance: '洋装发型，手持香烟', abilities: ['社交舞会', '西方语言', '时尚引领'] },
                                { id: 'meiji_intellectual', name: '启蒙学者', description: '传播西方文明的知识分子', appearance: '西装革履，手持文明杖', abilities: ['西方哲学', '政治改革', '演讲辩论'] }
                        ],
                        writingSamples: [
                                { id: 'meiji_ws_1', title: '银座大街', excerpt: '和洋建筑并存的街道，电灯初上的傍晚。穿洋装的摩登女郎和着和服的老者擦肩而过——文明开化的东京。' },
                                { id: 'meiji_ws_2', title: '末代武士', excerpt: '"刀可以放下，但武士道永远在心中。"最后的武士望着废刀令的公告，眼中闪过一丝不甘。' }
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
                        characterArchetypes: [
                                { id: 'late_qing_mandarin', name: '洋务官员', description: '推行西学的朝廷官员', appearance: '朝服外罩西式披风', abilities: ['官场规则', '洋务管理', '外交谈判'] },
                                { id: 'late_qing_boxer', name: '义和拳民', description: '自称刀枪不入的民间拳民', appearance: '红头巾，手持大刀', abilities: ['拳术', '民间信仰', '群体鼓动'] },
                                { id: 'late_qing_revolutionary', name: '革命党人', description: '推翻帝制的革命者', appearance: '剪去辫子，身穿中山装', abilities: ['地下组织', '炸弹制作', '革命演讲'] }
                        ],
                        writingSamples: [
                                { id: 'late_qing_ws_1', title: '虎门销烟', excerpt: '浓烟滚滚，鸦片在石灰中化为灰烬。林则徐站在岸边，目光坚定。"这是大清帝国的决心。"' },
                                { id: 'late_qing_ws_2', title: '义和拳', excerpt: '"刀枪不入！"拳民们齐声呐喊，符咒在风中燃烧。但他们面对的，是坚船利炮。' }
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
                    characterArchetypes: [
                            { id: 'victorian_detective', name: '私家侦探', description: '伦敦雾气中的案件调查者', appearance: '猎鹿帽，烟斗，深色风衣', abilities: ['推理分析', '伪装术', '线索追踪'] },
                            { id: 'victorian_inventor', name: '蒸汽发明家', description: '工业革命中的创新者', appearance: '工装围裙，手上沾满机油', abilities: ['机械设计', '蒸汽动力', '专利保护'] },
                            { id: 'victorian_lady', name: '维多利亚淑女', description: '上流社会的交际花', appearance: '华丽长裙，蕾丝手套，手持阳伞', abilities: ['社交手腕', '琴棋书画', '秘密情报'] }
                    ],
                    writingSamples: [
                            { id: 'victorian_ws_1', title: '雾都夜话', excerpt: '浓雾中，一盏煤气灯忽明忽暗。侦探的皮鞋踩在湿漉漉的石板路上，他知道，这又是一个不寻常的夜晚。' },
                            { id: 'victorian_ws_2', title: '工厂的轰鸣', excerpt: '蒸汽机的轰鸣声震耳欲聋，工人们在机器间穿梭。童工的小手在齿轮间忙碌，资本家的怀表滴答作响。' }
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
                    characterArchetypes: [
                            { id: 'jazz_musician', name: '爵士乐手', description: '哈莱姆区的灵魂音乐家', appearance: '西装革履，手持萨克斯风', abilities: ['即兴演奏', '音乐魅力', '夜场人脉'] },
                            { id: 'jazz_gangster', name: '黑帮头目', description: '禁酒令下的走私大王', appearance: '条纹西装，雪茄，金戒指', abilities: ['走私网络', '暴力威胁', '贿赂收买'] },
                            { id: 'jazz_flapper', name: '摩登女郎', description: '追求自由的新女性', appearance: '流苏短裙，珍珠项链，波波头', abilities: ['社交舞会', '汽车驾驶', '反叛精神'] }
                    ],
                    writingSamples: [
                            { id: 'jazz_ws_1', title: '盖茨比的夜晚', excerpt: '音乐彻夜不停，香槟的水晶杯在灯光下闪耀。"明天又是新的一天，"他举杯微笑，尽管眼底藏着深深的孤独。' },
                            { id: 'jazz_ws_2', title: '地下酒吧', excerpt: '推开暗门，爵士乐扑面而来。走私威士忌在吧台上流淌，禁酒令下的狂欢从未停止。' }
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
                    characterArchetypes: [
                            { id: 'postwar_spy', name: '冷战间谍', description: '铁幕背后的双面间谍', appearance: '灰色风衣，手提公文包', abilities: ['双面伪装', '密码通讯', '逃脱术'] },
                            { id: 'postwar_activist', name: '民权活动家', description: '为平等而奋斗的领导者', appearance: '西装整洁，手持演讲稿', abilities: ['群众演讲', '组织游行', '非暴力抵抗'] },
                            { id: 'postwar_scientist', name: '核物理学家', description: '参与曼哈顿计划的科学家', appearance: '白大褂，眼镜，头发蓬乱', abilities: ['核物理', '密码学', '伦理挣扎'] }
                    ],
                    writingSamples: [
                            { id: 'postwar_ws_1', title: '废墟上的花', excerpt: '在炸毁的建筑旁，一朵野花从碎石中探出头来。老人蹲下身，小心翼翼地浇了些水。生活总会找到出路。' },
                            { id: 'postwar_ws_2', title: '冷战线人', excerpt: '柏林的雨夜，两个身影在查理检查站附近擦肩而过。一张纸条悄然易手，上面写着："他们发现了。"' }
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
                        characterArchetypes: [
                                { id: 'urban_ceo', name: '科技新贵', description: '互联网公司的年轻CEO', appearance: '休闲西装，智能手表，永远在接电话', abilities: ['商业嗅觉', '人脉资源', '危机公关'] },
                                { id: 'urban_martial_artist', name: '地下拳王', description: '在地下拳场保持不败战绩的格斗家', appearance: '纹身，肌肉线条分明，身上满是伤疤', abilities: ['综合格斗', '抗击打', '地下人脉'] },
                                { id: 'urban_hacker', name: '白帽黑客', description: '在暗网中寻找真相的技术天才', appearance: '黑眼圈，连帽衫，永远带着笔记本电脑', abilities: ['网络渗透', '数据挖掘', '系统破解'] }
                        ],
                        writingSamples: [
                                { id: 'urban_ws_1', title: '午夜霓虹', excerpt: '写字楼的灯光一盏盏熄灭，最后一辆电梯下行。城市不眠，便利店的灯光在街角孤独地亮着。' },
                                { id: 'urban_ws_2', title: '地下拳场', excerpt: '铁笼里，两个男人拳拳到肉。观众们的呐喊声几乎要掀翻屋顶。汗水和血腥味混在一起。' }
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
                characterArchetypes: [
                        { id: 'rural_village_head', name: '村长', description: '掌管全村大小事务的权威人物', appearance: '深色夹克，叼着烟斗，手里拿着对讲机', abilities: ['村务管理', '宗族威望', '土政策'] },
                        { id: 'rural_outsider', name: '返乡青年', description: '在大城市打拼后回到家乡的大学生', appearance: '简约休闲装，手机不离手', abilities: ['电商运营', '城市见识', '新媒体'] },
                        { id: 'rural_mysterious_old_man', name: '神秘老人', description: '村里最年长的人，据说知道很多秘密', appearance: '满头白发，坐在老槐树下抽旱烟', abilities: ['村史记忆', '土药方', '人脉情报'] }
                ],
                writingSamples: [
                        { id: 'rural_ws_1', title: '祠堂议事', excerpt: '"祖上传下来的规矩，不能破。"最年长的长辈敲了敲拐杖，年轻人低头不语，心里却有一万个不情愿。' },
                        { id: 'rural_ws_2', title: '集市', excerpt: '乡间庙会，各色吆喝声此起彼伏。卖糖葫芦的老汉和耍猴的艺人抢着最佳位置，围观的人笑得合不拢嘴。' }
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
                characterArchetypes: [
                        { id: 'postapoc_survivor', name: '废土猎人', description: '在废墟中搜寻物资的独行侠', appearance: '破旧皮衣，防毒面具，背上背着步枪', abilities: ['废墟探索', '物资辨识', '生存技能'] },
                        { id: 'postapoc_mechanic', name: '废土技师', description: '能用废料组装机械的天才', appearance: '满身油污，工具腰带，自制义眼', abilities: ['机械组装', '能源修复', '武器改装'] },
                        { id: 'postapoc_warlord', name: '掠夺者首领', description: '统领废土帮派的残酷领袖', appearance: '拼凑的盔甲，脸上涂着战纹', abilities: ['帮派指挥', '恐惧威慑', '战术掠夺'] }
                ],
                writingSamples: [
                        { id: 'postapoc_ws_1', title: '废墟寻宝', excerpt: '倒塌的摩天大楼里，他用手电筒照着布满灰尘的货架。一罐未过期的牛肉罐头，在这里比黄金还珍贵。' },
                        { id: 'postapoc_ws_2', title: '驿站夜话', excerpt: '废土驿站的篝火旁，几个旅人交换着各自的消息。"东边的水源已经枯竭了，"老旅人低声说，"别往那边走。"' }
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
                        characterArchetypes: [
                                { id: 'noir_detective', name: '私家侦探', description: '在雨夜中追查真相的孤独侦探', appearance: '风衣，软呢帽，永远的烟和威士忌', abilities: ['案件推理', '审讯技巧', '城市暗道'] },
                                { id: 'noir_femme_fatale', name: '蛇蝎美人', description: '利用美貌周旋于各方势力的危险女人', appearance: '红色连衣裙，高跟鞋，涂着鲜红指甲', abilities: ['魅惑术', '谎言伪装', '危险感知'] },
                                { id: 'noir_corrupt_cop', name: '腐败警官', description: '黑白两道都有势力的警察', appearance: '制服皱巴巴，眼神疲惫但精明', abilities: ['警方人脉', '灰色规则', '枪术'] }
                        ],
                        writingSamples: [
                                { id: 'noir_ws_1', title: '雨夜委托', excerpt: '门被推开，一个浑身湿透的女人走了进来。"我需要你的帮助，"她说，雨水顺着她的发丝滴落。我知道，这又是一个麻烦的案子。' },
                                { id: 'noir_ws_2', title: '码头交易', excerpt: '月光下，两辆车在废弃码头相遇。没有寒暄，没有握手。一个手提箱换一袋白色粉末，然后各自消失在夜色中。' }
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
                        characterArchetypes: [
                                { id: 'hippie_musician', name: '民谣歌手', description: '背着吉他流浪的自由灵魂', appearance: '长发，花衬衫，牛仔裤', abilities: ['吉他弹唱', '感染力', '自由精神'] },
                                { id: 'hippie_communard', name: '公社领袖', description: '创建乌托邦社区的理想主义者', appearance: '手工编织衣物，赤脚', abilities: ['社区组织', '农业技能', '和平谈判'] },
                                { id: 'hippie_artist', name: '波普艺术家', description: '用色彩表达对世界看法的创作者', appearance: '颜料斑斑的双手，奇异服饰', abilities: ['艺术创作', '视觉冲击', '反叛表达'] }
                        ],
                        writingSamples: [
                                { id: 'hippie_ws_1', title: '伍德斯托克', excerpt: '吉他声从主舞台传来，五十万人坐在泥泞的草地上。"爱与和平！"人群齐声高呼，仿佛整个世界都在这一刻改变了。' },
                                { id: 'hippie_ws_2', title: '公路之歌', excerpt: '破旧的面包车在66号公路上颠簸。"我们要去一个没有战争的地方，"他说，车后是漫天的晚霞。' }
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
                        characterArchetypes: [
                                { id: 'zombie_medic', name: '战地医生', description: '在丧尸危机中抢救幸存者的医生', appearance: '白大褂沾满血迹，随身背着急救包', abilities: ['急救医术', '病毒研究', '冷静判断'] },
                                { id: 'zombie_soldier', name: '退伍军人', description: '军队溃散后保护平民的前军人', appearance: '迷彩服，战术背心，眼神坚毅', abilities: ['枪械精通', '战术指挥', '近身格斗'] },
                                { id: 'zombie_scientist', name: '病毒学家', description: '试图找到解药的顶尖科学家', appearance: '实验室白大褂，黑眼圈，手不离笔记本', abilities: ['病毒分析', '疫苗研究', '实验室操作'] }
                        ],
                        writingSamples: [
                                { id: 'zombie_ws_1', title: '第一天', excerpt: '新闻主播的声音在颤抖："请所有市民待在家中，不要外出。"窗外，尖叫声越来越近。世界在一夜之间改变了。' },
                                { id: 'zombie_ws_2', title: '安全区', excerpt: '铁丝网内，幸存者们排着队领取配给。一个小孩问母亲："我们什么时候能回家？"母亲没有回答。' }
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
                        characterArchetypes: [
                                { id: 'extreme_cold_engineer', name: '暖炉工程师', description: '维持营地供暖系统运行的关键人物', appearance: '厚重工装，满脸煤烟，手冻得通红', abilities: ['供暖系统', '机械维修', '能源管理'] },
                                { id: 'extreme_cold_scout', name: '极地侦察员', description: '在冰雪中探索新资源的勇敢者', appearance: '全套防寒装备，雪地靴，防风镜', abilities: ['雪地追踪', '极寒生存', '冰面导航'] },
                                { id: 'extreme_cold_leader', name: '营地领袖', description: '在极端环境中做出艰难抉择的领导者', appearance: '厚重的军大衣，面容坚毅', abilities: ['资源分配', '危机决策', '人心凝聚'] }
                        ],
                        writingSamples: [
                                { id: 'extreme_cold_ws_1', title: '冰封', excerpt: '温度计停在零下四十度。曾经繁华的街道被冰雪覆盖，汽车冻结在原地。人类在自然面前如此渺小。' },
                                { id: 'extreme_cold_ws_2', title: '暖炉', excerpt: '"今天只能再烧半天的煤，"他看着所剩无几的煤堆说。一家人围坐在暖炉旁，靠体温彼此取暖。' }
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
                        characterArchetypes: [
                                { id: 'biohazard_researcher', name: '首席研究员', description: '在实验室中与变异体赛跑的科学家', appearance: '防护服，护目镜，永远在记录数据', abilities: ['变异分析', '抗体提取', '危机预案'] },
                                { id: 'biohazard_containment', name: '隔离区守卫', description: '坚守隔离线不让人逃出的军人', appearance: '生化防护服，手持步枪，眼神疲惫', abilities: ['生化防护', '警戒射击', '感染辨识'] },
                                { id: 'biohazard_patient_zero', name: '零号病人', description: '首个被感染却存活下来的神秘人物', appearance: '皮肤上有异常纹路，但行为正常', abilities: ['病毒免疫', '变异感应', '抗体血液'] }
                        ],
                        writingSamples: [
                                { id: 'biohazard_ws_1', title: '泄漏', excerpt: '警报响起的那一刻，所有人都知道事情失控了。实验室的密封门缓缓落下，将里面的人永远留在了另一个世界。' },
                                { id: 'biohazard_ws_2', title: '隔离线', excerpt: '身穿防护服的人站在警戒线前。"里面的人，请不要靠近。"他的声音透过面罩传来，沉闷而遥远。' }
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
                        characterArchetypes: [
                                { id: 'nuclear_ranger', name: '辐射荒原游侠', description: '在辐射区中生存并探索的独行侠', appearance: '自制防护服，盖革计数器，改装车辆', abilities: ['辐射防护', '荒地导航', '废物利用'] },
                                { id: 'nuclear_bunker_leader', name: '掩体指挥官', description: '管理地下掩体资源分配的领导者', appearance: '军装整洁但略显陈旧', abilities: ['资源管控', '秩序维持', '外交谈判'] },
                                { id: 'nuclear_mutant', name: '变异人', description: '在辐射中变异但保持理智的存在', appearance: '身体有可见变异但功能正常', abilities: ['辐射适应', '变异能力', '辐射感应'] }
                        ],
                        writingSamples: [
                                { id: 'nuclear_ws_1', title: '蘑菇云', excerpt: '天空中升起巨大的蘑菇云，光芒照亮了整个城市。然后，一切都安静了。风停了，鸟不叫了，时间仿佛静止。' },
                                { id: 'nuclear_ws_2', title: '掩体', excerpt: '"我们已经在这里住了三年，"他指着墙壁上孩子们的涂鸦说。没有阳光，没有新鲜空气，但活着就是希望。' }
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
                        characterArchetypes: [
                                { id: 'cyber_netrunner', name: '网络黑客', description: '在赛博空间中穿梭的数字游侠', appearance: '脑后插管，义眼闪烁数据流', abilities: ['网络入侵', '数据窃取', 'ICE破解'] },
                                { id: 'cyber_street_doc', name: '黑市义体医生', description: '在暗巷里安装非法义体的地下医生', appearance: '手术手套，义体零件挂满墙壁', abilities: ['义体改装', '黑市人脉', '应急手术'] },
                                { id: 'cyber_corp_agent', name: '企业特工', description: '为巨型公司执行秘密任务的精英', appearance: '高级定制西装，植入武器，完美外表', abilities: ['企业资源', '间谍技巧', '公关操作'] }
                        ],
                        writingSamples: [
                                { id: 'cyber_ws_1', title: '霓虹雨', excerpt: '霓虹灯在雨中闪烁，义体改造人从巷口走过，左眼的LED灯发出蓝光。"数据就是力量，"他低声说，消失在数据流中。' },
                                { id: 'cyber_ws_2', title: '数据深渊', excerpt: '潜入网络空间的瞬间，现实消失了。他漂浮在由代码构成的虚空中，面前是企业的防火墙——一片燃烧的数字墙。' }
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
                        characterArchetypes: [
                                { id: 'dystopia_rebel', name: '反抗军战士', description: '试图推翻极权统治的自由斗士', appearance: '破旧军装，手臂上有反抗标志', abilities: ['游击战术', '地下通信', '武器改装'] },
                                { id: 'dystopia_thought_police', name: '思想警察', description: '监控并抓捕思想犯的特工', appearance: '黑色制服，面无表情的面孔', abilities: ['思想监控', '审讯技巧', '忠诚扫描'] },
                                { id: 'dystopia_propagandist', name: '宣传部长', description: '操控舆论的思想工程师', appearance: '笔挺西装，永远带着官方笑容', abilities: ['舆论操控', '信息封锁', '洗脑技术'] }
                        ],
                        writingSamples: [
                                { id: 'dystopia_ws_1', title: '监控之下', excerpt: '"公民编号4729，你的行为评分下降了0.3。"冰冷的电子音从街角的监控器传来。他低头快步走开，不敢有任何多余的动作。' },
                                { id: 'dystopia_ws_2', title: '地下印刷', excerpt: '在地下室里，油印机吱吱作响。一本没有许可的小册子正在被偷偷印刷。"真相是不被允许的，"印刷者说，"所以我们必须传播它。"' }
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
                        characterArchetypes: [
                                { id: 'spacecol_pilot', name: '星际领航员', description: '驾驶货船穿梭于星球之间的老手', appearance: '飞行夹克，脸上有微重力晒斑', abilities: ['飞船驾驶', '星际导航', '应急维修'] },
                                { id: 'spacecol_engineer', name: '基地工程师', description: '在火星基地维持生命系统运转的技术员', appearance: '工装沾满火星尘土，手持工具包', abilities: ['生命维持', '设备维修', '气压调节'] },
                                { id: 'spacecol_trader', name: '星际商人', description: '在各殖民地之间倒卖资源的商人', appearance: '太空服改装的夹克，随身携带信用芯片', abilities: ['跨星系贸易', '价格谈判', '走私路线'] }
                        ],
                        writingSamples: [
                                { id: 'spacecol_ws_1', title: '火星日出', excerpt: '红色的太阳从地平线升起，沙尘暴在天际翻滚。基地的穹顶在风中微微震动。"又一个火星日，"工程师对着记录仪说。' },
                                { id: 'spacecol_ws_2', title: '星际货船', excerpt: '飞船穿过小行星带，船体不时发出碰撞的声响。"别担心，这种程度的撞击我们承受得住，"船长说，但他握紧了操纵杆。' }
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
                        characterArchetypes: [
                                { id: 'spaceopera_admiral', name: '星际舰队指挥官', description: '指挥庞大舰队的军事将领', appearance: '笔挺的星际军装，胸前挂满勋章', abilities: ['舰队指挥', '战略部署', '外交斡旋'] },
                                { id: 'spaceopera_xeno', name: '外星考古学家', description: '研究远古外星文明遗迹的学者', appearance: '探险装备，手持扫描仪，满手外星泥土', abilities: ['外星文字解读', '遗迹激活', '文明分析'] },
                                { id: 'spaceopera_diplomat', name: '星系外交官', description: '在多文明间斡旋的和平使者', appearance: '融合多种文化元素的服饰', abilities: ['多语言', '跨文化理解', '和平谈判'] }
                        ],
                        writingSamples: [
                                { id: 'spaceopera_ws_1', title: '星系议会', excerpt: '来自七个文明的代表齐聚一堂。全息投影中，每个文明的旗帜在虚空中飘扬。"我们必须在战争之前找到和平的道路。"' },
                                { id: 'spaceopera_ws_2', title: '异星遗迹', excerpt: '远古文明的大门缓缓开启，尘封百万年的光芒倾泻而出。"他们留下的不是武器，而是知识，"考古学家惊叹道。' }
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
                        characterArchetypes: [
                                { id: 'cyborg_upload_pioneer', name: '意识上传先驱', description: '首批成功将意识上传到数字空间的人', appearance: '半机械身体，眼睛闪烁着数据光', abilities: ['数字分身', '意识备份', '数据感知'] },
                                { id: 'cyborg_purist', name: '纯人类守护者', description: '拒绝机械改造、捍卫人类纯粹性的战士', appearance: '没有任何义体，肌肉锻炼到极限', abilities: ['肉体极限', '免疫黑客', '人类团结'] },
                                { id: 'cyborg_synthesist', name: '机械生命工程师', description: '创造新机械生命形式的天才工程师', appearance: '全身精密机械构造，外表却似真人', abilities: ['机械设计', 'AI觉醒', '形态重构'] }
                        ],
                        writingSamples: [
                                { id: 'cyborg_ws_1', title: '意识上传', excerpt: '"准备好了吗？"医生的声音从远方传来。他点了点头。然后——一切都变了。他看到了自己的躯体，但思维却存在于另一个空间。' },
                                { id: 'cyborg_ws_2', title: '机械之城', excerpt: '没有人类的脚步声，机器人在街道上井然有序地运行。硅基生命的城市比任何人类城市都更高效、更安静、更完美。' }
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
                        characterArchetypes: [
                                { id: 'vr_architect', name: '虚拟世界架构师', description: '设计虚拟世界底层规则的程序员', appearance: '永远连接在虚拟世界中，现实身体消瘦', abilities: ['世界构建', '代码操控', '规则制定'] },
                                { id: 'vr_awakened', name: '觉醒者', description: '意识到虚拟世界本质并试图唤醒他人的存在', appearance: '在虚拟世界中显现特殊光芒', abilities: ['现实感知', '系统漏洞利用', '意识连接'] },
                                { id: 'vr_dweller', name: '深度沉浸者', description: '完全适应虚拟世界、忘记现实的居民', appearance: '虚拟形象完美，现实身体萎缩', abilities: ['虚拟操控', '数字生存', '沉浸适应'] }
                        ],
                        writingSamples: [
                                { id: 'vr_ws_1', title: '完美世界', excerpt: '在这个虚拟世界中，没有痛苦，没有饥饿，没有死亡。每个人都是完美的。但完美本身，就是一种不完美。' },
                                { id: 'vr_ws_2', title: '唤醒', excerpt: '"你看到的天空是假的，"他在虚拟广场上对人群说，"你感受到的阳光是代码。醒来吧，真实的世界在等你。"' }
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
                        characterArchetypes: [
                                { id: 'energy_cosmic_being', name: '纯能量体', description: '超越物质形态的纯能量生命', appearance: '一团变幻莫测的光芒，没有固定形态', abilities: ['能量操控', '物质转化', '维度感知'] },
                                { id: 'energy_observer', name: '宇宙观测者', description: '以旁观者姿态记录宇宙演化的存在', appearance: '不可见的意识场，偶尔显现为光晕', abilities: ['全时观测', '因果感知', '宇宙记忆'] },
                                { id: 'energy_resonator', name: '共鸣使者', description: '连接亿万个意识体的桥梁', appearance: '柔和的共鸣光环', abilities: ['意识连接', '群体共鸣', '信息融合'] }
                        ],
                        writingSamples: [
                                { id: 'energy_ws_1', title: '纯粹存在', excerpt: '没有身体，没有边界，只有纯粹的意识在宇宙中流淌。他——或者说它——感受着恒星的光芒和暗物质的流动。' },
                                { id: 'energy_ws_2', title: '观测', excerpt: '在无数个维度中，他同时观测着宇宙的过去、现在和未来。时间不是线性的，而是一幅巨大的画卷。' }
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
                        characterArchetypes: [
                                { id: 'dimension_traveler', name: '维度行者', description: '能够在不同维度间自由穿行的存在', appearance: '半透明，身影在不同维度间闪烁', abilities: ['维度穿越', '法则操控', '多元感知'] },
                                { id: 'dimension_anchor', name: '维度锚定者', description: '维持多维交汇处稳定的守护者', appearance: '由多重视角叠加而成的身影', abilities: ['维度锚定', '法则修复', '稳定场生成'] },
                                { id: 'dimension_archivist', name: '多维档案员', description: '记录所有维度信息的存在', appearance: '由无数光点组成的书卷形态', abilities: ['全维记录', '信息检索', '维度比对'] }
                        ],
                        writingSamples: [
                                { id: 'dimension_ws_1', title: '交汇', excerpt: '在多维交汇处，三个维度的物理法则同时生效。一个苹果同时下落、上升和静止。矛盾在这里不再是矛盾。' },
                                { id: 'dimension_ws_2', title: '门', excerpt: '"迈出这一步，你将不再是你，"维度之门前的守护者说。"但你会成为更完整的存在。"' }
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
                        characterArchetypes: [
                                { id: 'math_axiom_keeper', name: '公理守护者', description: '维护宇宙底层数学逻辑的存在', appearance: '由方程式组成的抽象形态', abilities: ['公理验证', '逻辑证明', '系统一致性'] },
                                { id: 'math_solver', name: '方程式求解者', description: '能在无穷解空间中寻找最优解的存在', appearance: '不断变换的几何形态', abilities: ['全维求解', '最优路径', '收敛控制'] },
                                { id: 'math_paradox', name: '悖论化身', description: '以矛盾为食、在逻辑裂缝中存在的异常', appearance: '自相矛盾的视觉形态', abilities: ['悖论生成', '逻辑崩塌', '反证法'] }
                        ],
                        writingSamples: [
                                { id: 'math_ws_1', title: '公理', excerpt: '在数学宇宙中，一切都是方程式的解。存在不是物质的，而是逻辑的。"我思故我在"变成了"我被证明故我在"。' },
                                { id: 'math_ws_2', title: '无限', excerpt: '在无穷集合的海洋中，两个意识体在讨论一个超越所有基数的问题。"即使是无穷，也有大小之分。"' }
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
