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
    extra: Partial<Pick<EraNode, 'colors' | 'typography' | 'uiStyle' | 'bgmTags' | 'artStyle' | 'description' | 'uiCopy'>> = {},
    children: EraNode[] = []
): EraNode {
    return { id, name, depth, parent, ...extra, children: children.length > 0 ? children : undefined };
}

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
                }),
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
        // SubEra: 都市 ← 迁移自 era_modern_urban
        makeNode(
            'contemporary_urban', '都市', 2, 'contemporary',
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
                    }
                ),
                // SubEra: 乡村
                makeNode(
                    'contemporary_rural', '乡村', 2, 'contemporary',
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
            }
        ),
        // SubEra: 末日/废土
        makeNode(
            'contemporary_post_apocalyptic', '末日废土', 2, 'contemporary',
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
            }
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
        // SubEra: 赛博朋克 ← 迁移自 era_cyberpunk_nearfuture
        makeNode(
            'near-future_cyberpunk', '赛博朋克', 2, 'near-future',
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
                    }
                ),
                // SubEra: 反乌托邦
                makeNode(
                    'near-future_dystopia', '反乌托邦', 2, 'near-future',
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
            }
        ),
        // SubEra: 太空殖民
        makeNode(
            'near-future_space_colonization', '太空殖民', 2, 'near-future',
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
            }
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
        // SubEra: 星际科幻 ← 迁移自 era_scifi_future
        makeNode(
            'far-future_space_opera', '星际科幻', 2, 'far-future',
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
                    }
                ),
                // SubEra: 赛博格
                makeNode(
                    'far-future_cyborg', '赛博格', 2, 'far-future',
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
            }
        ),
        // SubEra: 虚拟现实/元宇宙
        makeNode(
            'far-future_virtual_reality', '虚拟现实', 2, 'far-future',
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
            }
        ),
    ]
);

// ============================================================
// 完整树
// ============================================================

export const eraTree: EraTree = {
    name: '墨色江湖·时代体系',
    children: [
        ancientEpoch,
        modernEpoch,
        contemporaryEpoch,
        nearFutureEpoch,
        farFutureEpoch,
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

export type { EraNode, EraColors, EraTypography, EraUIStyle, UIDecoration };
