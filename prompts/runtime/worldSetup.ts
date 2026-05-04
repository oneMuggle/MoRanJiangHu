import { WorldGenConfig, 角色数据结构, 武力等级描述映射, NSFW场景描述映射, 能力类型描述映射, 超能力分类描述, 觉醒程度描述, 时代配置, 时代背景, 全部时代配置 } from '../../types';
import { 构建修炼体系附加块, 构建里武侠附加块, 构建里志怪附加块 } from '../../utils/promptFeatureToggles';
import { 构建双修门派世界书 } from './worldLixiangSects';
import { 构建里武侠门派设定 } from './liWuxiaSects';
import { 构建志怪世界提示词 } from './zhiguaiWorld';

const 获取时代配置ByID = (configID?: string): 时代配置 => (
    全部时代配置.find(c => c.id === configID) || 全部时代配置[0]
);

/** 按时代返回成长主轴描述 */
const 获取成长主轴描述 = (时代: 时代背景): string => {
    switch (时代) {
        case '古代':
            return '武侠成长';
        case '近代':
            return '时代变革与个人奋斗';
        case '现代':
            return '都市发展与信息/技术能力成长';
        case '近未来':
            return '义体改造与网络技术成长';
        case '未来':
            return '星际探索与科技/AI能力成长';
        default:
            return '世界观核心成长';
    }
};

/** 按时代返回成长体系一致性提示 */
const 获取成长体系提示 = (时代: 时代背景): string => {
    switch (时代) {
        case '古代':
            return '本存档世界必须兼容当前项目的武侠成长体系。高阶武功、内功心法、神兵利器应稀缺，宗师密度受控，越境碾压伴随代价。';
        case '近代':
            return '本存档世界必须兼容当前项目的时代变革成长体系。新式知识、人脉资源、军火/商会渠道应稀缺，高层势力密度受控，阶级跨越伴随风险与代价。';
        case '现代':
            return '本存档世界必须兼容当前项目的都市/技术成长体系。核心技术能力、商业资源、高端人脉应稀缺，顶层精英密度受控，阶层跃升伴随竞争与风险。';
        case '近未来':
            return '本存档世界必须兼容当前项目的义体/赛博成长体系。高端义体、黑客工具、企业权限应稀缺，顶级改造者密度受控，越级对抗伴随硬件风险与法律代价。';
        case '未来':
            return '本存档世界必须兼容当前项目的星际/科技成长体系。曲率技术、基因优化、AI共生权限应稀缺，高阶文明密度受控，跨星系对抗伴随资源与政治代价。';
        default:
            return '本存档世界必须兼容当前项目的核心成长体系。强力资源、高阶角色、顶级装备应稀缺，高收益必须对应高风险与高代价。';
    }
};

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
- 本存档世界观必须兼容${获取成长主轴描述(eraConfig.时代)}主轴。
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
    const lixiangSectsWorldBook = 构建双修门派世界书(worldConfig.nsfw场景类型, { 时代配置ID: worldConfig.时代配置ID });
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
   ${获取成长体系提示(eraConfig.时代)}
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

${构建里志怪附加块(`
【里志怪世界设定】
志怪模式已开启。志怪生物、阴阳相克、道法体系、因果系统已融入本世界。
志怪事件应自然融入武侠叙事，不喧宾夺主；凡人江湖中志怪属于"异闻"。
具体规则由系统运行时注入，此处仅声明本存档启用里志怪世界观。
`)}

${isAncient && (worldConfig.古代体系选择 === '志怪' || worldConfig.古代体系选择 === '双修') ? 构建志怪世界提示词() : ''}
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
