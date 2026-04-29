import { makeNode, EraNode } from './types';

export const primordialEpoch: EraNode = makeNode(
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
                        liMode: {
                            name: '里图腾',
                            description: '巫术仪式、祖先血脉、原始繁衍',
                            rules: `【里图腾世界规则（Li African World Rules）】

本世界开启"里图腾模式"，所有叙事必须体现原始部落的巫术、血脉与繁衍主题。

## 巫术仪式原理
巫术是部落与神灵沟通的桥梁：
- 祭祀仪式：以舞蹈、鼓声、药物进入通灵状态
- 巫医治愈：通过仪式性的身体接触驱散病魔
- 祈雨祈丰：部落以集体仪式祈求丰收与繁衍
- 巫术对抗：敌对部落的巫觋以法力对决

## 祖先血脉系统
祖先血脉是部落力量的源泉：
- 血脉觉醒：通过仪式唤醒祖先留下的力量
- 图腾守护：每个部落有其守护图腾动物
- 血脉传承：最强壮的战士拥有最纯粹的血脉
- 部落联姻：通过联姻融合不同部落的血脉

## 角色表里人格
部落成员皆有两面：
- 表性格：淳朴野性、敬畏神灵、忠于部落
- 里性格：欲望原始而强烈、渴望征服与被征服
- 巫觋在通灵状态下会展现最真实的欲望

## 衣着描写规则
部落服饰须体现原始与性感：
- 兽皮短裙、珠链装饰、身体彩绘
- 描写须细致到肌肉线条、肌肤质感、原始的身体吸引力
- 仪式中的半裸状态是常态

## 行为模式规则
- 部落仪式中自然展现身体吸引力
- 战士以勇武赢得女性的青睐
- 巫医的治疗仪式包含亲密的身体接触
- 繁衍是部落生存的核心任务

## AI 指令
当里图腾模式开启时：
1. 所有角色必须具有表里双面性格
2. 巫术仪式是核心文化元素
3. 祖先血脉是力量体系的核心
4. 服装描写须体现原始部落风格
5. 繁衍是部落叙事的天然主题
6. 巫术对抗是推动剧情的重要冲突`,
                            configKey: 'liAfricanMode',
                            themeColor: '160 100 50',
                        },
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
                        liMode: {
                            name: '里血祭',
                            description: '献祭仪式、神灵交合、血月狂欢',
                            rules: `【里美洲世界规则（Li Americas World Rules）】

本世界开启"里血祭模式"，所有叙事必须体现中美洲文明的献祭、神灵与血月主题。

## 献祭仪式原理
献祭是维系宇宙秩序的神圣行为：
- 血祭神灵：以鲜血喂养神灵，维持日月运行
- 献祭方式：战俘献祭、自愿献祭、选美献祭
- 祭司主导：大祭司是神灵与凡人的中介
- 献祭后的狂欢：仪式结束后进入纵欲状态

## 神灵交合系统
神灵与凡人的交合是神话的核心：
- 神选之人：被神灵选中者可体验神凡交合
- 血月之夜：每月血月是神灵最活跃的时刻
- 羽蛇神传说：羽蛇神与凡间女子的禁忌之恋
- 交合后的赐福：获得预言能力或超凡力量

## 角色表里人格
中美洲文明的角色皆有两面：
- 表性格：敬畏神灵、严守仪式、忠于城邦
- 里性格：在仪式中释放最原始的欲望
- 祭司在通灵状态下展现最真实的一面

## 衣着描写规则
中美洲服饰须体现神秘与性感：
- 翡翠羽冠、金线织锦、玉石装饰
- 描写须细致到身体彩绘、肌肤质感、仪式中的暴露状态
- 祭祀时的装扮既庄严又极具吸引力

## 行为模式规则
- 献祭仪式是展示身体与欲望的场合
- 勇士以战功赢得美人的青睐
- 祭司以神谕为名进行神圣的交合仪式
- 血月之夜是欲望最盛的时刻

## AI 指令
当里血祭模式开启时：
1. 献祭仪式是核心文化元素
2. 神灵交合是神圣而非淫乱的行为
3. 血月之夜是剧情高潮的重要时机
4. 服装描写须体现中美洲文明风格
5. 祭司是连接神灵与凡人的关键角色
6. 城邦竞争与宗教仪式互为表里`,
                            configKey: 'liAmericasMode',
                            themeColor: '180 80 60',
                        },
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
                        liMode: {
                            name: '里萨满',
                            description: '通灵狂舞、先祖血脉、凛冬秘仪',
                            rules: `【里北欧世界规则（Li Norse World Rules）】

本世界开启"里萨满模式"，所有叙事必须体现北欧冰原的通灵、血脉与凛冬主题。

## 通灵仪式原理
萨满是连接凡人与神灵的桥梁：
- 通灵狂舞：通过舞蹈、鼓声、药物进入通灵状态
- 卢恩符文：刻写符文可召唤神力、预言未来
- 先祖召唤：在仪式中召唤先祖之灵获取力量
- 凛冬秘仪：冬至时节的特殊仪式，神灵最为活跃

## 先祖血脉系统
北欧血脉是力量的象征：
- 血脉觉醒：通过战斗或仪式唤醒先祖之力
- 狂战士之力：最强的战士拥有最纯粹的血脉
- 符文天赋：部分人天生能感知卢恩符文的力量
- 神裔传说：奥丁、索尔等神灵的后裔隐藏于凡人中

## 角色表里人格
北欧部落成员皆有两面：
- 表性格：勇猛刚毅、敬畏神灵、忠于部落
- 里性格：在通灵状态下释放被压抑的欲望
- 萨满在通灵时展现最真实的一面——狂野而放纵

## 衣着描写规则
北欧服饰须体现冰原野性与性感：
- 兽皮披风、毛皮短裙、金属饰品
- 描写须细致到肌肉线条、肌肤的寒冷反应、战斗中的衣衫破损
- 仪式中的半裸状态是展现勇气的方式

## 行为模式规则
- 通灵仪式中自然展现身体的原始吸引力
- 勇士以战斗勇武赢得女性的青睐
- 萨满的治疗仪式包含亲密的身体接触
- 凛冬长夜是部落繁衍的最佳时机

## AI 指令
当里萨满模式开启时：
1. 所有角色必须具有表里双面性格
2. 通灵仪式是核心文化元素
3. 先祖血脉是力量体系的核心
4. 服装描写须体现北欧冰原风格
5. 萨满是连接神灵与凡人的关键角色
6. 凛冬长夜推动亲密剧情的发展`,
                            configKey: 'liNorseMode',
                            themeColor: '120 140 180',
                        },
                    }
                ),
            ]
        ),
    ]
);

