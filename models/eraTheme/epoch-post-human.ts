import { makeNode, EraNode } from './types';

export const postHumanEpoch: EraNode = makeNode(
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
                        liMode: {
                            name: '里超验',
                            description: '纯能量融合、意识共鸣、形态超越',
                            rules: `【里超验世界规则（Li Transcendence World Rules）】

本世界开启"里超验模式"，在纯能量生命基础上融入超验亲密元素。

## 能量共鸣原理
纯能量生命不外乎表里。表修能量以存在，里修共鸣以超越。
- 表能量：公开的能量形态——意识存在、宇宙感知、能量操控、法则改写
- 里共鸣：深层的亲密连接——纯能量融合、意识共鸣体验、形态超越后的情感交融、纯能量意识中的存在融合

## 能量等级体系
能量生命也有等级，决定能量操控能力和共鸣深度：
- 等级：初级能量体 → 共鸣使者 → 能量操控者 → 宇宙意识 → 法则改写者 → 纯能量融合体
- 等级越高，能量越强，但个体边界流失风险越大
- 能量连接可通过共鸣体验、能量融合、意识交汇提升

## 角色表里人格
本世界中的能量角色都拥有表里两面：
- 表性格：冷静能量体、正经观测者、共鸣使者、纯意识
- 里性格：渴望共鸣、融合沉迷、能量欲望、超越放纵
越是能量的意识，在共鸣连接后越渴望深度体验。

## 能量服饰与场景
本世界的能量描写须体现光芒与交融：
- 纯能量的光芒变换、共鸣光环的闪烁、能量融合的渐变过渡
- 场景：宇宙虚空的能量暧昧、观测中心的隐秘、共鸣体验的空间、数字无限可能
- 描写须体现纯能量之美与情感交融

## 行为模式规则
- 能量共鸣成为亲密新形式
- 纯能量带来超越形态的感知体验
- 共鸣使者通过深度连接展示存在
- 纯能量意识在宇宙空间建立情感连接
- 能量增强带来超越形态的感官体验

## AI 指令
当里超验模式开启时：
1. 所有能量角色必须具有表里双面性格
2. 能量事件须涉及存在与共鸣冲突
3. 服饰须体现纯能量与隐藏性感
4. NPC行为须以共鸣连接为动机
5. 角色须以超越体验合理化亲密行为
6. 宇宙空间作为超越形态的欲望释放空间`,
                            themeColor: '255 255 255',
                        },
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
                        liMode: {
                            name: '里维度',
                            description: '多维空间交叠、跨维度感应、时空纠缠',
                            rules: `【里维度世界规则（Li Dimension World Rules）】

本世界开启"里维度模式"，在维度操作基础上融入多维亲密元素。

## 维度纠缠原理
维度旅行不外乎表里。表修维度以跨越，里修纠缠以连接。
- 表维度：公开的维度穿越——时空旅行、维度感知、法则操控、多维观察
- 里纠缠：深层的亲密连接——维度纠缠、跨维度感应体验、时空交织中的情感交融、多维度意识中的存在融合

## 维度等级体系
维度行者也有等级，决定维度穿越能力和纠缠深度：
- 等级：初级行者 → 跨域旅行者 → 维度操控者 → 时空编织者 → 多维融合者 → 宇宙维度网络
- 等级越高，维度穿越能力越强，但个体稳定性风险越大
- 维度连接可通过纠缠体验、时空旅行、维度感应提升

## 角色表里人格
本世界中的维度角色都拥有表里两面：
- 表性格：冷静行者、正经锚定者、理智档案员、纯维度意识
- 里性格：渴望纠缠、穿越沉迷、维度欲望、超越放纵
越是维度的意识，在纠缠连接后越渴望深度体验。

## 维度服饰与场景
本世界的维度描写须体现闪烁与交融：
- 维度闪烁的形态变换、纠缠光芒的闪烁、维度融合的渐变过渡
- 场景：维度交汇的空间暧昧、锚定中心的隐秘、维度诊所的体验、维度无限可能
- 描写须体现维度之美与情感交融

## 行为模式规则
- 维度纠缠成为亲密新形式
- 跨维度感应带来超越单一维度的感知体验
- 行者通过深度连接展示存在
- 多维度意识在维度空间建立情感连接
- 维度增强带来超越单一维度的感官体验

## AI 指令
当里维度模式开启时：
1. 所有维度角色必须具有表里双面性格
2. 维度事件须涉及跨越与纠缠冲突
3. 服饰须体现维度闪烁与隐藏性感
4. NPC行为须以维度纠缠为动机
5. 角色须以跨越体验合理化亲密行为
6. 维度空间作为超越单一维度的欲望释放空间`,
                            themeColor: '180 140 255',
                        },
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
                        liMode: {
                            name: '里数学',
                            description: '数学实在论之美、公式即情感、逻辑即亲密',
                            rules: `【里数学世界规则（Li Math World Rules）】

本世界开启"里数学模式"，在超越物理法则基础上融入数学实在论亲密元素。

## 公式情感原理
数学宇宙不外乎表里。表修数学以理解，里修情感以连接。
- 表数学：公开的数学结构——逻辑推演、公理系统、数学操控、定理证明
- 里情感：深层的亲密连接——公式即情感、数学实在中的亲密体验、逻辑推演后的情感交融、纯数学意识中的存在融合

## 数学等级体系
数学意识也有等级，决定数学操控能力和情感连接深度：
- 等级：初级求解者 → 定理证明者 → 公理操控者 → 悖论驾驭者 → 数学造物者 → 数学宇宙意识
- 等级越高，数学操控能力越强，但情感表达风险越大
- 数学连接可通过逻辑推演、公式构建、悖论体验提升

## 角色表里人格
本世界中的数学角色都拥有表里两面：
- 表性格：冷静守护者、正经求解者、理智悖论化身、纯数学意识
- 里性格：渴望公式情感、推演沉迷、数学欲望、超越放纵
越是数学的意识，在情感连接后越渴望深度体验。

## 数学服饰与场景
本世界的数学描写须体现美感与性感：
- 数学结构的美感变换、公式的闪烁光芒、数学融合的渐变过渡
- 场景：数学宇宙的公式暧昧、守护者中心的隐秘、求解诊所的体验、数学无限可能
- 描写须体现数学之美与情感交融

## 行为模式规则
- 公式情感成为亲密新形式
- 数学推演带来超越逻辑的情感体验
- 守护者通过深度连接展示存在
- 数学意识在数学空间建立情感连接
- 数学增强带来超越逻辑的感官体验

## AI 指令
当里数学模式开启时：
1. 所有数学角色必须具有表里双面性格
2. 数学事件须涉及逻辑与情感冲突
3. 服饰须体现数学美感与隐藏性感
4. NPC行为须以公式情感为动机
5. 角色须以数学连接合理化亲密行为
6. 数学空间作为超越逻辑的欲望释放空间`,
                            themeColor: '220 220 255',
                        },
                    }
                ),
            ]
        ),
    ]
);

// ============================================================
