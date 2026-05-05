// 时代主题 — 类型定义与节点构造函数
// 三层树结构：Epoch (时代) → Era (纪元) → SubEra (子纪元)

export interface EraColors {
    'ink-black': string;
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
    | 'scanline'
    | 'grain'
    | 'ink-bleed'
    | 'neon-flicker'
    | 'holographic';

export interface EraUIStyle {
    style: 'classical' | 'modern' | 'tech' | 'retro' | 'scifi';
    tone: 'formal' | 'casual' | 'archaic' | 'military' | 'commercial';
    decorations: UIDecoration[];
}

export interface EraPromptVars {
    社会形态: string;
    科技水平: string;
    力量体系: string;
    叙事视角: string;
    描写重点: string;
    对话占比: string;
    禁忌: string[];
}

export interface EraOpeningScene {
    id: string;
    name: string;
    description: string;
    imageId?: string;
}

export interface EraCharacterArchetype {
    id: string;
    name: string;
    description: string;
    appearance: string;
    abilities: string[];
    /** 对外展现的性格 */
    表人格?: string;
    /** 隐藏的真实性格 */
    里人格?: string;
}

export interface EraWritingSample {
    id: string;
    title: string;
    excerpt: string;
}

export interface EraLiMode {
    name: string;
    description: string;
    rules: string;
    configKey?: string;
    themeColor?: string;
}

/** 里模式阶段类型 — 控制 NPC 对 NSFW 行为的心理态度与行为倾向 */
export type LiModeStage = '平然' | '羞耻' | '欲望';

/** 强化版里模式定义 — 结构化字段，与 rules 向后兼容 */
export interface EraLiModeEnhanced {
    name: string;
    description: string;
    /** 保留：向后兼容的完整规则文本。当结构化字段为空时使用。 */
    rules?: string;
    /** 核心原理（如"表里双修"、"欲望权力"） */
    corePrinciple?: string;
    /** 权力/等级系统描述 */
    powerSystem?: string;
    /** 角色表里人格列表 */
    dualPersonalities?: string[];
    /** 亲密场景类型列表 */
    sceneTypes?: string[];
    /** 欲望动机列表 */
    desireMotives?: string[];
    /** 禁忌与边界列表 */
    taboos?: string[];
    /** AI 指令列表 */
    aiDirectives?: string[];
    /** 三级强度定义 */
    intensityLevels?: {
        微暗: string;
        暧昧: string;
        露骨: string;
    };
    /** 阶段行为规则 — 引导 AI 在不同阶段下 NPC 的心理与行为模式 */
    stageRules?: {
        平然: string;
        羞耻: string;
        欲望: string;
    };
    configKey?: string;
    themeColor?: string;
}

export type EpochDepth = 0 | 1 | 2;

export interface 时代主题UI文案 {
    [key: string]: string;
}

export interface EraRealmMappingItem {
    level: number;
    label: string;
}

export interface EraRealmStage {
    name: string;
    levels: number[];
    abilityBoundary?: string;
}

export interface EraRealmBreakthrough {
    from: number;
    to: number;
}

export interface EraRealmConfig {
    /** 境界体系名称 */
    name: string;
    /** 力量体系描述 */
    powerSystem: string;
    /** 境界映射表：累计值 → 文案 */
    mapping: EraRealmMappingItem[];
    /** 大境阶段列表（用于展示） */
    stages: EraRealmStage[];
    /** 大境突破跳转表 */
    breakthroughs: EraRealmBreakthrough[];
    /** 境界差距口径说明 */
    gapCalibration?: string;
    /** 武侠硬边界说明 */
    hardBoundary?: string;
}

export interface EraNode {
    id: string;
    name: string;
    depth: EpochDepth;
    parent: string | null;

    colors?: EraColors;
    typography?: EraTypography;
    uiStyle?: EraUIStyle;
    bgmTags?: string[];
    artStyle?: string;
    description?: string;

    uiCopy?: 时代主题UI文案;

    promptVars?: EraPromptVars;

    openingScenes?: EraOpeningScene[];

    characterArchetypes?: EraCharacterArchetype[];

    writingSamples?: EraWritingSample[];

    conflictTypes?: string[];

    liMode?: EraLiMode | EraLiModeEnhanced;

    /** 境界/修炼体系配置（per era） */
    realm?: EraRealmConfig;

    children?: EraNode[];
}

export interface EraTree {
    name: string;
    children: EraNode[];
}

export function makeNode(
    id: string,
    name: string,
    depth: EpochDepth,
    parent: string | null,
    extra: Partial<Pick<EraNode, 'colors' | 'typography' | 'uiStyle' | 'bgmTags' | 'artStyle' | 'description' | 'uiCopy' | 'promptVars' | 'openingScenes' | 'characterArchetypes' | 'writingSamples' | 'conflictTypes' | 'liMode' | 'realm'>> = {},
    children: EraNode[] = []
): EraNode {
    return { id, name, depth, parent, ...extra, children: children.length > 0 ? children : undefined };
}
