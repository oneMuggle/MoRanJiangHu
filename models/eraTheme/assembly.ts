import { EraNode, EraTree, EraColors, EraTypography, EraUIStyle, EraPromptVars, EraOpeningScene, EraCharacterArchetype, EraWritingSample, EraLiMode, EraLiModeEnhanced } from './types';
import { primordialEpoch } from './epoch-primordial';
import { ancientEpoch } from './epoch-ancient';
import { modernEpoch } from './epoch-modern';
import { contemporaryEpoch } from './epoch-contemporary';
import { nearFutureEpoch } from './epoch-near-future';
import { farFutureEpoch } from './epoch-far-future';
import { postHumanEpoch } from './epoch-post-human';

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

/** 现代/当代时代 ID 列表（用于 NSFW 叙事约束等场景选择现代情感框架） */
export const MODERN_ERA_IDS = [
    'contemporary_campus', 'contemporary_urban', 'contemporary_rural',
    'contemporary_noir', 'contemporary_hippie',
    'contemporary_zombie', 'contemporary_extreme_cold', 'contemporary_biohazard', 'contemporary_nuclear_winter',
    'contemporary_post_apocalyptic',
] as const;

// ============================================================
// 核心查找函数
// ============================================================

/** 按ID查找节点（支持旧格式兼容） */
export function getEraById(id: string): EraNode | undefined {
    const direct = allEraNodes.find((n) => n.id === id);
    if (direct) return direct;

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
        promptVars: EraPromptVars | undefined;
        openingScenes: EraOpeningScene[] | undefined;
        characterArchetypes: EraCharacterArchetype[] | undefined;
        writingSamples: EraWritingSample[] | undefined;
        conflictTypes: string[] | undefined;
        liMode: EraLiMode | EraLiModeEnhanced | undefined;
    };
    sources: string[];
} | null {
    const node = getEraById(id);
    if (!node) return null;

    const path = getEraPath(id);

    const getFirstDefined = <T>(getter: (n: EraNode) => T | undefined): { value: T; sourceId: string } | null => {
        // 从节点自身向根遍历（path 是 [root, ..., leaf]，需要反转）
        for (let i = path.length - 1; i >= 0; i--) {
            const n = path[i];
            const val = getter(n);
            if (val !== undefined) {
                return { value: val, sourceId: n.id };
            }
        }
        return null;
    };

    const getNodeOnly = <T>(getter: (n: EraNode) => T | undefined): T | undefined => {
        return getter(node);
    };

    const colorsDef = getFirstDefined((n) => n.colors);
    const typographyDef = getFirstDefined((n) => n.typography);
    const uiStyleDef = getFirstDefined((n) => n.uiStyle);
    const bgmTagsDef = getFirstDefined((n) => n.bgmTags);
    const artStyleDef = getFirstDefined((n) => n.artStyle);
    const promptVarsDef = getFirstDefined((n) => n.promptVars);
    const conflictTypesDef = getFirstDefined((n) => n.conflictTypes);
    const liModeDef = getFirstDefined((n) => n.liMode);

    const openingScenesDef = getNodeOnly((n) => n.openingScenes);
    const characterArchetypesDef = getNodeOnly((n) => n.characterArchetypes);
    const writingSamplesDef = getNodeOnly((n) => n.writingSamples);

    const rootEpoch = path[0];
    const defaultColors: EraColors = rootEpoch?.colors ?? ancientEpoch.colors!;
    const defaultTypography: EraTypography = rootEpoch?.typography ?? ancientEpoch.typography!;
    const defaultUIStyle: EraUIStyle = rootEpoch?.uiStyle ?? ancientEpoch.uiStyle!;

    return {
        node,
        inherited: {
            colors: colorsDef?.value ?? defaultColors,
            typography: typographyDef?.value ?? defaultTypography,
            uiStyle: uiStyleDef?.value ?? defaultUIStyle,
            bgmTags: bgmTagsDef?.value ?? [],
            artStyle: artStyleDef?.value,
            promptVars: promptVarsDef?.value,
            openingScenes: openingScenesDef,
            characterArchetypes: characterArchetypesDef,
            writingSamples: writingSamplesDef,
            conflictTypes: conflictTypesDef?.value,
            liMode: liModeDef?.value,
        },
        sources: [
            colorsDef?.sourceId,
            typographyDef?.sourceId,
            uiStyleDef?.sourceId,
            bgmTagsDef?.sourceId,
            artStyleDef?.sourceId,
            promptVarsDef?.sourceId,
            conflictTypesDef?.sourceId,
        ].filter(Boolean) as string[],
    };
}

// ============================================================
// 向后兼容：时代主题方案列表（旧接口）
// ============================================================

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

export const 时代主题方案列表: 时代主题方案[] = allEraNodes
    .filter((n) => n.depth === 2)
    .map((n) => toLegacyEra(n)!)
    .filter(Boolean);

export const 获取时代主题方案 = (eraId: string): 时代主题方案 | undefined => {
    return 时代主题方案列表.find((e) => e.id === eraId);
};
