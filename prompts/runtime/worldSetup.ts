import { WorldGenConfig, 角色数据结构, 武力等级描述映射, NSFW场景描述映射, 能力类型描述映射, 超能力分类描述, 觉醒程度描述, 时代配置, 内置时代配置 } from '../../types';
import { 构建修炼体系附加块, 构建里武侠附加块 } from '../../utils/promptFeatureToggles';
import { 构建双修门派世界书 } from './worldLixiangSects';
import { 构建里武侠门派设定 } from './liWuxiaSects';

const 获取时代配置ByID = (configID?: string): 时代配置 => (
    内置时代配置.find(c => c.id === configID) || 内置时代配置[0]
);

export const 构建世界观锚点提示词 = (worldConfig: WorldGenConfig, charData: 角色数据结构): string => {
    const eraConfig = 获取时代配置ByID(worldConfig.时代配置ID);
    return `
【时代背景】
- 时代配置: ${eraConfig.名称} (${eraConfig.时代})
- 科技水平: ${eraConfig.科技水平描述}
- 社会结构: ${eraConfig.社会结构描述}
- 货币体系: ${eraConfig.货币模板.单位列表.join('、')}
- 品质等级: ${eraConfig.品质等级名称.join(' → ')}
- 文风参考: ${eraConfig.文风参考描述}

【当前存档世界锚点（World Bible Anchor）】
- 世界名称: ${worldConfig.worldName}
- 世界规模: ${worldConfig.worldSize}
- 武力等级: ${worldConfig.武力等级} - ${武力等级描述映射[worldConfig.武力等级] || 武力等级描述映射['中武']}
- NSFW场景: ${worldConfig.nsfw场景类型} - ${NSFW场景描述映射[worldConfig.nsfw场景类型] || NSFW场景描述映射['无']}
- 能力类型: ${worldConfig.能力类型} - ${能力类型描述映射[worldConfig.能力类型] || 能力类型描述映射['传统武侠']}
${worldConfig.能力类型 === '超能力线' ? `- 超能力分类: ${worldConfig.超能力分类} - ${超能力分类描述[worldConfig.超能力分类 as keyof typeof 超能力分类描述] || ''}
- 觉醒程度: ${worldConfig.觉醒程度} - ${觉醒程度描述[worldConfig.觉醒程度 as keyof typeof 觉醒程度描述] || ''}` : ''}
- 王朝格局: ${worldConfig.dynastySetting}
- 宗门密度: ${worldConfig.sectDensity}
- 天骄设定: ${worldConfig.tianjiaoSetting}
- 游戏难度: ${worldConfig.difficulty || 'normal'}
- 世界观额外要求: ${worldConfig.worldExtraRequirement?.trim() || '无'}

【世界母本硬边界】
- 本存档世界观必须兼容${eraConfig.时代 === '古代' ? '武侠' : '当前时代'}成长主轴。
- 世界应是长期母本，不是开场剧情、任务提纲或玩家专属设定。
- 高手、秘籍、名器、传承、危险区域必须有合理稀缺度与风险代价。
- 世界保持风险与回报匹配，不写成低风险高回报的福利场。
${构建修炼体系附加块('- 本存档世界观必须兼容”累计境界值”的成长主轴，并保持高境界强者的合理稀缺度与风险代价。')}

【主角建档锚点（仅用于避冲突，不反向定制世界）】
- 姓名/性别/年龄: ${charData.姓名}/${charData.性别}/${charData.年龄}
- 出生日期: ${charData.出生日期}
- 外貌: ${charData.外貌 || '未描述'}
- 性格: ${charData.性格 || '未描述'}
- 性格使用约束: 仅把主角性格作为行为风格、情绪阈值与关系边界参考；NPC 对主角的态度仍建立在自身动机与证据上
${构建修炼体系附加块(`- 初始境界: ${charData.境界}`)}
- 六维: 力量${charData.力量} 敏捷${charData.敏捷} 体质${charData.体质} 根骨${charData.根骨} 悟性${charData.悟性} 福源${charData.福源}
- 天赋: ${charData.天赋列表.map(t => t.名称).join('、') || '无'}
- 背景: ${charData.出身背景?.名称 || '未知'}（${charData.出身背景?.描述 || '无描述'}）
- 仅用于避免世界观与建档发生硬冲突，不据此生成玩家专属世界结构、玩家专属势力保护、玩家专属天命安排。
`.trim();
};

export const 构建世界观种子提示词 = (worldConfig: WorldGenConfig, charData: 角色数据结构): string => {
    const anchor = 构建世界观锚点提示词(worldConfig, charData);
    const eraConfig = 获取时代配置ByID(worldConfig.时代配置ID);
    const lixiangSectsWorldBook = 构建双修门派世界书(worldConfig.nsfw场景类型);
    const liWuxiaSects = 构建里武侠门派设定();
    const isAncient = eraConfig.时代 === '古代';

    return `
【世界观设定（存档绑定）】
此字段是当前存档唯一世界观母本，必须长期一致；后续叙事、判定、事件演化均以此为依据。

1. 世界一致性
   - 势力、资源稀缺度、社会秩序必须与本母本一致。
${构建修炼体系附加块('   - 境界边界必须与本母本一致。')}
   - 同一存档内的世界底层法则保持因果一致。
   - 世界观必须能长期支撑主剧情、战斗、掉落、世界演化，而非只服务一次开场。
${构建修炼体系附加块('   - 世界观必须能长期支撑修炼系统，而非只服务一次开场。')}

2. 成长体系一致性
   - 本存档世界必须兼容当前项目的${isAncient ? '武侠' : '时代'}成长体系。
   - 高手应稀缺，高阶传承应稀缺，高收益应对应高风险、高代价或高势力门槛。
   - 设定与现有数值哲学保持一致，例如低风险地区不泛滥神功神装、宗师密度受控、越境碾压伴随代价。
${构建修炼体系附加块([
'   - 本存档世界必须兼容当前项目"累计境界值"成长体系。',
'   - 境界部分只需交代整体境界分配与不同年龄段的大致境界划分，不展开详细境界设定。',
'   - 世界母本中的境界内容只保留概述级信息，不写完整境界母板、逐层映射、阶段推进表或大境突破表。',
'   - 高境界强者应稀缺。'
].join('\n'))}

3. 主角一致性
   - 主角身份、出身、六维、初始处境必须与建档锚点一致。
   - 前期物资、关系网符合"初入社会"的因果，不空降神装。
   - 世界观只能避开与主角硬冲突，不能反过来围绕主角量身定做。
${构建修炼体系附加块('- 前期功法同样符合"初入社会"的因果，不空降神功。')}

4. 叙事边界
   - 世界观用于约束，不直接替玩家决策。
   - 重大世界事件需通过 \`世界\` 与 \`剧情\` 可追溯落地。
   - 此阶段保持在世界母本层，不输出玩家专属任务线、玩家初始关系网、玩家专属机缘。

5. 时间与地点
   - 时间推进与地点变化需与 \`环境\` 同步。
   - 同时空冲突（同角色同刻多地）视为非法叙事。
   - 世界中的地理、势力、风险分布要支持长期移动、探索、遭遇与世界事件生成。

${anchor}

${isAncient ? lixiangSectsWorldBook : ''}

${构建里武侠附加块(`
【里武侠世界门派】
${liWuxiaSects}
`)}
    `.trim();
};

export const 构建世界生成任务上下文提示词 = (
    worldPromptSeed: string,
    difficulty: string,
    enabledDifficultyPrompts: string,
    worldExtraRequirement: string = ''
): string => `
${worldPromptSeed}

【世界生成配置】
- 模式: 新建世界
- 难度: ${difficulty}
- 生成目标: 仅生成 world_prompt（世界观提示词文本）
- 当前阶段定位: 世界母本生成，不是开场初始化，不是剧情正文生成，不是变量落地阶段

【启用难度规则】
${enabledDifficultyPrompts || '未提供'}
- 难度规则在此阶段只用于约束“世界风险生态、资源稀缺度、社会压力、成长难度背景”。
- 不要在此阶段直接输出数值变量、命令或初始化结果。

【世界观额外要求（仅约束 world_prompt）】
${worldExtraRequirement.trim() || '无'}
- 额外要求只影响世界母本风格与边界，不把结果改写成玩家专属设定或一次性剧情脚本。
`.trim();
