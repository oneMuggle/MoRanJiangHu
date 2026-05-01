/**
 * Model categorizer and auto-assignment for API config assistant.
 * Classifies models by heuristic patterns and recommends assignments to functional areas.
 */

export type ModelTier = 'smart' | 'fast' | 'cheap' | 'image' | 'reasoning' | 'unknown';

export interface ModelCategory {
    tier: ModelTier;
    recommendation: string[];
}

interface FunctionalArea {
    label: string;
    modelField: string;
    configIdField: string;
    preferredTier: ModelTier;
    fallbackTier: ModelTier;
}

export interface ConfigWithModels {
    id: string;
    baseUrl: string;
    apiKey: string;
    provider: string;
    models: string[];
}

export interface AreaAssignment {
    areaLabel: string;
    modelField: string;
    configIdField: string;
    assignedModel: string | null;
    assignedConfigId: string | null;
    tier: ModelTier;
}

export interface AssignmentRecommendation {
    areas: AreaAssignment[];
    configs: ConfigWithModels[];
}

export const FUNCTIONAL_AREAS: FunctionalArea[] = [
    { label: '主剧情', modelField: '主剧情使用模型', configIdField: '', preferredTier: 'smart', fallbackTier: 'fast' },
    { label: '记忆总结', modelField: '记忆总结使用模型', configIdField: '记忆总结使用配置ID', preferredTier: 'smart', fallbackTier: 'fast' },
    { label: '文章优化', modelField: '文章优化使用模型', configIdField: '文章优化使用配置ID', preferredTier: 'smart', fallbackTier: 'fast' },
    { label: '规划分析', modelField: '规划分析使用模型', configIdField: '规划分析使用配置ID', preferredTier: 'reasoning', fallbackTier: 'smart' },
    { label: '女主规划', modelField: '女主规划使用模型', configIdField: '女主规划使用配置ID', preferredTier: 'reasoning', fallbackTier: 'smart' },
    { label: '变量计算', modelField: '变量计算使用模型', configIdField: '变量计算使用配置ID', preferredTier: 'fast', fallbackTier: 'cheap' },
    { label: '世界演变', modelField: '世界演变使用模型', configIdField: '世界演变使用配置ID', preferredTier: 'fast', fallbackTier: 'cheap' },
    { label: '剧情回忆', modelField: '剧情回忆使用模型', configIdField: '剧情回忆使用配置ID', preferredTier: 'cheap', fallbackTier: 'fast' },
    { label: '小说拆分', modelField: '小说拆分使用模型', configIdField: '', preferredTier: 'cheap', fallbackTier: 'fast' },
    { label: '词组转化器', modelField: '词组转化器使用模型', configIdField: '', preferredTier: 'fast', fallbackTier: 'cheap' },
    { label: 'PNG提炼', modelField: 'PNG提炼使用模型', configIdField: '', preferredTier: 'cheap', fallbackTier: 'fast' },
    { label: '文生图', modelField: '文生图模型使用模型', configIdField: '', preferredTier: 'image', fallbackTier: 'image' },
    { label: '场景生图', modelField: '场景生图模型使用模型', configIdField: '场景生图使用配置ID', preferredTier: 'image', fallbackTier: 'image' },
    { label: '剧情规划', modelField: '剧情规划使用模型', configIdField: '剧情规划使用配置ID', preferredTier: 'smart', fallbackTier: 'fast' },
];

export const TIER_RULES: { pattern: RegExp; tier: ModelTier; recommendation: string[] }[] = [
    { pattern: /gpt-4o(?!-mini)|claude-sonnet|gemini-.*-pro|gemini-2\.5|o3|gemini-exp/i, tier: 'smart', recommendation: ['主剧情', '记忆总结', '文章优化'] },
    { pattern: /reasoner|r1|o1|o3-mini|thinking|deepseek-reasoner/i, tier: 'reasoning', recommendation: ['规划分析', '女主规划'] },
    { pattern: /mini|turbo|flash|haiku|lite|fast|gpt-4o-mini/i, tier: 'fast', recommendation: ['变量计算', '世界演变', '词组转化器'] },
    { pattern: /dall|image|flux|stable.*diffusion|midjourney|cogview|sd-/i, tier: 'image', recommendation: ['文生图', '场景生图'] },
    { pattern: /gpt-3\.5|gemini-.*-flash|gemini-pro-vision|claude-instant/i, tier: 'cheap', recommendation: ['剧情回忆', '小说拆分', 'PNG提炼'] },
];

export function categorizeModel(modelId: string): ModelCategory {
    for (const rule of TIER_RULES) {
        if (rule.pattern.test(modelId)) {
            return { tier: rule.tier, recommendation: rule.recommendation };
        }
    }
    return { tier: 'unknown', recommendation: ['主剧情'] };
}

export function autoAssignModels(configs: ConfigWithModels[]): AssignmentRecommendation {
    // Build a map: tier -> list of { modelId, configId }
    const tierMap = new Map<ModelTier, Array<{ modelId: string; configId: string }>>();
    for (const cfg of configs) {
        for (const modelId of cfg.models) {
            const { tier } = categorizeModel(modelId);
            if (!tierMap.has(tier)) tierMap.set(tier, []);
            tierMap.get(tier)!.push({ modelId, configId: cfg.id });
        }
    }

    // For each functional area, pick the best available model
    const areas: AreaAssignment[] = FUNCTIONAL_AREAS.map((area) => {
        // For image tasks, ONLY consider image-tier models (never fall back to text models)
        if (area.preferredTier === 'image' && area.fallbackTier === 'image') {
            const imageModels = tierMap.get('image') || [];
            if (imageModels.length > 0) {
                const pick = imageModels[0];
                return {
                    areaLabel: area.label,
                    modelField: area.modelField,
                    configIdField: area.configIdField,
                    assignedModel: pick.modelId,
                    assignedConfigId: pick.configId,
                    tier: 'image',
                };
            }
            return {
                areaLabel: area.label,
                modelField: area.modelField,
                configIdField: area.configIdField,
                assignedModel: null,
                assignedConfigId: null,
                tier: 'unknown',
            };
        }

        // Try preferred tier first
        let candidates = tierMap.get(area.preferredTier) || [];
        if (candidates.length === 0 && area.fallbackTier !== area.preferredTier) {
            candidates = tierMap.get(area.fallbackTier) || [];
        }
        if (candidates.length === 0) {
            // Last resort: pick any non-unknown, non-image model
            for (const [tier, models] of tierMap) {
                if (tier !== 'unknown' && tier !== 'image') {
                    candidates = models;
                    break;
                }
            }
        }

        if (candidates.length > 0) {
            // Pick the first one in the preferred tier (highest priority within tier)
            const pick = candidates[0];
            return {
                areaLabel: area.label,
                modelField: area.modelField,
                configIdField: area.configIdField,
                assignedModel: pick.modelId,
                assignedConfigId: pick.configId,
                tier: categorizeModel(pick.modelId).tier,
            };
        }

        return {
            areaLabel: area.label,
            modelField: area.modelField,
            configIdField: area.configIdField,
            assignedModel: null,
            assignedConfigId: null,
            tier: 'unknown',
        };
    });

    return { areas, configs };
}
