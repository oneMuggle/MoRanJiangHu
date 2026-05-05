import { resolveEraNode } from '../../models/eraTheme';

/** 从解析后的时代节点构建提示词注入文本 */
export const 构建时代主题注入 = (eraId: string | null | undefined): string => {
    if (!eraId) return '';

    const resolved = resolveEraNode(eraId);
    if (!resolved) return '';

    const { inherited, node } = resolved;
    const sections: string[] = [];

    // 时代身份声明
    sections.push(`<时代主题约束>
# 当前时代：${node.name}
# 时代标识：${node.id}
# 时代层级：${node.depth === 0 ? 'Epoch（大纪元）' : node.depth === 1 ? 'Era（纪元）' : 'SubEra（子纪元）'}`);

    // promptVars 注入
    const vars = inherited.promptVars;
    if (vars) {
        const varLines: string[] = [];
        if (vars.社会形态) varLines.push(`- 社会形态：${vars.社会形态}`);
        if (vars.科技水平) varLines.push(`- 科技水平：${vars.科技水平}`);
        if (vars.力量体系) varLines.push(`- 力量体系：${vars.力量体系}`);
        if (vars.叙事视角) varLines.push(`- 叙事视角：${vars.叙事视角}`);
        if (vars.描写重点) varLines.push(`- 描写重点：${vars.描写重点}`);
        if (vars.对话占比) varLines.push(`- 对话占比：${vars.对话占比}`);
        if (vars.禁忌 && vars.禁忌.length > 0) varLines.push(`- 时代禁忌：${vars.禁忌.join('；')}`);

        if (varLines.length > 0) {
            sections.push(`## 时代提示词变量\n${varLines.join('\n')}`);
        }
    }

    // 冲突类型注入
    if (inherited.conflictTypes && inherited.conflictTypes.length > 0) {
        sections.push(`## 核心冲突类型\n${inherited.conflictTypes.join('、')}`);
    }

    // 美术风格注入
    if (inherited.artStyle) {
        sections.push(`## 美术风格参考\n${inherited.artStyle}`);
    }

    // 境界/修炼体系注入
    if (inherited.realm) {
        const realm = inherited.realm;
        const realmSections: string[] = [];
        realmSections.push(`【境界体系：${realm.name}】`);
        realmSections.push(`力量体系：${realm.powerSystem}`);
        if (realm.mapping.length > 0) {
            realmSections.push(`【境界映射表】`);
            realmSections.push(realm.mapping.map((m) => `${m.level} => ${m.label}`).join('\n'));
        }
        if (realm.stages.length > 0) {
            realmSections.push(`【大境阶段】`);
            for (const stage of realm.stages) {
                realmSections.push(`- ${stage.name}（${stage.levels.join(' / ')}）${stage.abilityBoundary ? `：${stage.abilityBoundary}` : ''}`);
            }
        }
        if (realm.breakthroughs.length > 0) {
            realmSections.push(`【大境突破表】`);
            realmSections.push(realm.breakthroughs.map((b) => `${b.from} → ${b.to}`).join('\n'));
        }
        if (realm.gapCalibration) {
            realmSections.push(`【境界差距口径】\n${realm.gapCalibration}`);
        }
        if (realm.hardBoundary) {
            realmSections.push(`【武侠硬边界】\n${realm.hardBoundary}`);
        }
        sections.push(realmSections.join('\n'));
    }

    // BGM 标签注入
    if (inherited.bgmTags && inherited.bgmTags.length > 0) {
        sections.push(`## 背景音乐氛围\n${inherited.bgmTags.join('、')}`);
    }

    sections.push('</时代主题约束>');

    return sections.join('\n\n');
};

/** 从时代元数据中构建角色原型注入提示词 */
export const 构建时代角色原型注入 = (eraId: string | null | undefined): string => {
    if (!eraId) return '';

    const resolved = resolveEraNode(eraId);
    if (!resolved) return '';

    const archetypes = resolved.inherited.characterArchetypes;
    if (!archetypes || archetypes.length === 0) return '';

    const lines = archetypes.map((a, i) =>
        `[${i + 1}] ${a.name} — ${a.description} | 外观：${a.appearance} | 能力：${a.abilities.join('、')}`
    );

    return `【时代角色原型参考】
以下角色原型反映了当前时代的典型人物特征。初始化社交网络或生成 NPC 时可参考这些原型的气质、能力和外观风格：
${lines.join('\n')}`;
};

/** 从时代元数据中构建文风示例注入提示词 */
export const 构建时代文风注入 = (eraId: string | null | undefined): string => {
    if (!eraId) return '';

    const resolved = resolveEraNode(eraId);
    if (!resolved) return '';

    const samples = resolved.inherited.writingSamples;
    if (!samples || samples.length === 0) return '';

    const lines = samples.map((s) => `《${s.title}》：${s.excerpt}`);

    return `【时代文风示例】
以下段落展示了当前时代应有的叙事腔调、词汇选择和描写节奏。写作时应参考这些文风的语感：
${lines.join('\n')}`;
};
