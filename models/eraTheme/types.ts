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

export type EpochDepth = 0 | 1 | 2;

export interface 时代主题UI文案 {
    [key: string]: string;
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

    liMode?: EraLiMode;

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
    extra: Partial<Pick<EraNode, 'colors' | 'typography' | 'uiStyle' | 'bgmTags' | 'artStyle' | 'description' | 'uiCopy' | 'promptVars' | 'openingScenes' | 'characterArchetypes' | 'writingSamples' | 'conflictTypes' | 'liMode'>> = {},
    children: EraNode[] = []
): EraNode {
    return { id, name, depth, parent, ...extra, children: children.length > 0 ? children : undefined };
}
