export const 亲密提示词模板 = {
  表层: `当 NPC 亲密度等级为 1 时，允许调情（言语调情、轻微身体接触、眼神交流）。等级为 2 时，允许拥抱亲吻。` as const,
  亲密: `当 NPC 亲密度等级为 3 时，允许抚摸。等级为 4 时，允许深度亲密。等级为 5 时，允许双修并触发属性奖励。` as const,
};

export const 是否加载亲密提示词 = (nsfwEnabled: boolean): boolean => {
  return nsfwEnabled === true;
};