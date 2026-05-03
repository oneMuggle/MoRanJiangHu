/** 按时代区分的累计境界速查提示词 */

export const 武侠境界速查 = '开脉境一重~十重=1~10；聚息/归元/御劲/化罡前中后期=11~22；通玄/神照/返真/天人=24/27/33/43。';
export const 校园境界速查 = '大一=1~4；大二=5~8；大三=9~12；大四=13~16；研究生初/中/毕业=17/20/24；博士/博士后/学者=27/33/43。';
export const 都市境界速查 = '实习生/初级/中级=1~8；高级/主管/经理=9~16；总监/VP/合伙人=17/20/24；CEO/行业领袖/传奇=27/33/43。';
export const 废土境界速查 = '幸存者/拾荒者/猎手=1~8；营地领袖/技师/医师=9~16；军阀/传奇英雄/重建者=17/20/24；救世主/新文明奠基=27/33/43。';
export const 通用境界速查 = '初学者/入门/熟练=1~8；精通/专家/大师=9~16；宗师/传奇/传说=17/20/24；巅峰/至高/不朽=27/33/43。';

/** 根据时代配置ID选择对应的境界速查提示词 */
export const 获取境界速查提示词 = (eraId: string): string => {
    if (eraId.startsWith('contemporary_campus')) return 校园境界速查;
    if (eraId.startsWith('contemporary_post_apocalyptic') || eraId.startsWith('contemporary_zombie') || eraId.startsWith('contemporary_extreme') || eraId.startsWith('contemporary_biohazard') || eraId.startsWith('contemporary_nuclear')) return 废土境界速查;
    if (eraId.startsWith('contemporary')) return 都市境界速查;
    if (eraId.startsWith('near-future')) return 通用境界速查;
    if (eraId.startsWith('far-future')) return 通用境界速查;
    if (eraId.startsWith('post-human')) return 通用境界速查;
    return 武侠境界速查;
};

/** 兼容旧接口：默认返回武侠版本 */
export const 默认累计境界速查提示词 = 武侠境界速查;
