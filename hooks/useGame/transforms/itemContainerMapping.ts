import { 角色数据结构, 装备槽位 } from '../../../types';
import { normalizeCanonicalGameTime } from '../time/timeUtils';
import { 压缩图片资源字段 } from '../../../utils/imageAssets';
import { 规范化文本 } from '../../../utils/stringNormalizers';

const 深拷贝 = <T,>(data: T): T => JSON.parse(JSON.stringify(data)) as T;

const 默认装备模板 = {
  头部: '无', 胸部: '无', 盔甲: '无', 内衬: '无', 腿部: '无',
  手部: '无', 足部: '无', 主武器: '无', 副武器: '无', 暗器: '无',
  背部: '无', 腰部: '无', 坐骑: '无'
};

const 默认金钱模板 = { 金元宝: 0, 银子: 0, 铜钱: 0 };

const 角色身体部位列表 = ['头部', '胸部', '腹部', '左手', '右手', '左腿', '右腿'] as const;

const 默认背景模板 = { 名称: '', 描述: '', 效果: '' };

const 规范化货币数值 = (value: unknown): number => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
};

const 规范化数值 = (value: unknown, fallback = 0): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const 规范化整数 = (value: unknown, fallback = 0): number => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
};

const 规范化角色身体部位字段 = (role: any) => {
  角色身体部位列表.forEach((part) => {
    const rawPart = role?.[part];
    const partObj = rawPart && typeof rawPart === 'object' && !Array.isArray(rawPart) ? rawPart : {};
    const 当前血量Key = `${part}当前血量`;
    const 最大血量Key = `${part}最大血量`;
    const 状态Key = `${part}状态`;
    const 当前血量 = Number.isFinite(Number(partObj?.当前血量))
      ? Number(partObj.当前血量)
      : 规范化数值(role?.[当前血量Key], 0);
    const 最大血量 = Number.isFinite(Number(partObj?.最大血量))
      ? Number(partObj.最大血量)
      : 规范化数值(role?.[最大血量Key], 0);
    const 状态 = typeof partObj?.状态 === 'string'
      ? partObj.状态.trim()
      : 规范化文本(role?.[状态Key]);
    role[当前血量Key] = 当前血量;
    role[最大血量Key] = 最大血量;
    role[状态Key] = 状态;
    if (partObj && Object.keys(partObj).length > 0) {
      delete role[part];
    }
  });
};

const 取区间整数 = (value: unknown, fallback: number, min: number, max: number): number => {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  const int = Math.trunc(n);
  if (int < min || int > max) return fallback;
  return int;
};

const 标准化角色图片记录 = (raw: any): any | undefined => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const normalizedAsset = 压缩图片资源字段(raw);
  const 图片URL = typeof normalizedAsset?.图片URL === 'string' ? normalizedAsset.图片URL.trim() : undefined;
  const 本地路径 = typeof normalizedAsset?.本地路径 === 'string' ? normalizedAsset.本地路径.trim() : undefined;
  const 生图词组 = typeof raw?.生图词组 === 'string' ? raw.生图词组.trim() : '';
  const 最终正向提示词 = typeof raw?.最终正向提示词 === 'string' ? raw.最终正向提示词.trim() : undefined;
  const 最终负向提示词 = typeof raw?.最终负向提示词 === 'string' ? raw.最终负向提示词.trim() : undefined;
  const 原始描述 = typeof raw?.原始描述 === 'string' ? raw.原始描述.trim() : '';
  const 使用模型 = typeof raw?.使用模型 === 'string' ? raw.使用模型.trim() : '';
  const 画师串 = typeof raw?.画师串 === 'string' ? raw.画师串.trim() : undefined;
  const 错误信息 = typeof raw?.错误信息 === 'string' ? raw.错误信息.trim() : undefined;
  const 状态 = raw?.状态 === 'success' || raw?.状态 === 'failed' || raw?.状态 === 'pending' ? raw.状态 : undefined;
  const 生成时间 = Number.isFinite(Number(raw?.生成时间)) ? Number(raw.生成时间) : 0;
  const id = typeof raw?.id === 'string' && raw.id.trim().length > 0 ? raw.id.trim() : '';
  if (!图片URL && !本地路径 && !生图词组 && !原始描述 && !错误信息) return undefined;
  return {
    ...normalizedAsset, id: id || undefined, 图片URL, 本地路径, 生图词组,
    最终正向提示词, 最终负向提示词, 原始描述, 使用模型, 生成时间,
    构图: typeof raw?.构图 === 'string' ? raw.构图 : undefined,
    画风: raw?.画风, 画师串, 尺寸: typeof raw?.尺寸 === 'string' ? raw.尺寸.trim() : undefined,
    状态, 错误信息
  };
};

const 合并角色图片档案对象 = (leftRaw: any, rightRaw: any): any | undefined => {
  const leftSource = leftRaw && typeof leftRaw === 'object' && !Array.isArray(leftRaw) ? leftRaw : {};
  const rightSource = rightRaw && typeof rightRaw === 'object' && !Array.isArray(rightRaw) ? rightRaw : {};
  const 取首个非空文本值 = (...values: unknown[]): string | undefined => {
    for (const value of values) {
      if (typeof value === 'string' && value.trim().length > 0) return value.trim();
    }
    return undefined;
  };
  const leftRecent = 标准化角色图片记录(leftSource?.最近生图结果);
  const rightRecent = 标准化角色图片记录(rightSource?.最近生图结果);
  const mergedMap = new Map<string, any>();
  [...(Array.isArray(rightSource?.生图历史) ? rightSource.生图历史 : []), ...(Array.isArray(leftSource?.生图历史) ? leftSource.生图历史 : [])]
    .forEach((item) => {
      const normalized = 标准化角色图片记录(item);
      if (!normalized) return;
      const key = typeof normalized.id === 'string' && normalized.id.trim()
        ? normalized.id.trim()
        : `${normalized.生成时间 || 0}|${normalized.构图 || ''}|${normalized.图片URL || normalized.本地路径 || normalized.原始描述 || ''}`;
      if (mergedMap.has(key)) return;
      mergedMap.set(key, normalized);
    });
  const mergedHistory = Array.from(mergedMap.values()).sort((a, b) => (Number(b?.生成时间) || 0) - (Number(a?.生成时间) || 0));
  const recent = rightRecent || leftRecent || mergedHistory[0];
  const 已选头像图片ID = 取首个非空文本值(rightSource?.已选头像图片ID, leftSource?.已选头像图片ID);
  const 已选立绘图片ID = 取首个非空文本值(rightSource?.已选立绘图片ID, leftSource?.已选立绘图片ID);
  const 已选背景图片ID = 取首个非空文本值(rightSource?.已选背景图片ID, leftSource?.已选背景图片ID);
  if (!recent && mergedHistory.length <= 0 && !已选头像图片ID && !已选立绘图片ID && !已选背景图片ID) return undefined;
  return {
    ...(recent ? { 最近生图结果: recent } : {}),
    ...(mergedHistory.length > 0 ? { 生图历史: mergedHistory } : {}),
    ...(已选头像图片ID ? { 已选头像图片ID } : {}),
    ...(已选立绘图片ID ? { 已选立绘图片ID } : {}),
    ...(已选背景图片ID ? { 已选背景图片ID } : {})
  };
};

export function 规范化角色物品容器映射(rawRole?: any): 角色数据结构 {
  const 装备槽位列表: 装备槽位[] = ['头部', '胸部', '盔甲', '内衬', '腿部', '手部', '足部', '主武器', '副武器', '暗器', '背部', '腰部', '坐骑'];
  const 槽位ID片段映射: Record<装备槽位, string> = {
    头部: 'head', 胸部: 'chest', 盔甲: 'armor', 内衬: 'inner', 腿部: 'legs',
    手部: 'hands', 足部: 'feet', 主武器: 'main_weapon', 副武器: 'off_weapon',
    暗器: 'hidden_weapon', 背部: 'back', 腰部: 'waist', 坐骑: 'mount'
  };
  const 槽位类型映射: Record<装备槽位, '武器' | '防具' | '杂物'> = {
    头部: '防具', 胸部: '防具', 盔甲: '防具', 内衬: '防具', 腿部: '防具',
    手部: '防具', 足部: '防具', 主武器: '武器', 副武器: '武器', 暗器: '武器',
    背部: '防具', 腰部: '防具', 坐骑: '杂物'
  };

  const role = 深拷贝(rawRole && typeof rawRole === 'object' ? rawRole : {}) as any;
  (role as any).姓名 = 规范化文本((role as any).姓名);
  (role as any).性别 = 规范化文本((role as any).性别, '男');
  (role as any).年龄 = 取区间整数((role as any).年龄, 16, 0, 9999);
  (role as any).出生日期 = 规范化文本((role as any).出生日期);
  (role as any).称号 = 规范化文本((role as any).称号);
  (role as any).境界 = 规范化文本((role as any).境界);
  (role as any).境界层级 = Math.max(0, 规范化整数((role as any).境界层级, 1));
  (role as any).所属门派ID = 规范化文本((role as any).所属门派ID, 'none');
  (role as any).门派职位 = 规范化文本((role as any).门派职位, '无');
  (role as any).门派贡献 = Math.max(0, 规范化整数((role as any).门派贡献, 0));
  (role as any).当前精力 = Math.max(0, 规范化数值((role as any).当前精力, 0));
  (role as any).最大精力 = Math.max(0, 规范化数值((role as any).最大精力, 0));
  (role as any).当前内力 = Math.max(0, 规范化数值((role as any).当前内力, 0));
  (role as any).最大内力 = Math.max(0, 规范化数值((role as any).最大内力, 0));
  (role as any).当前饱腹 = Math.max(0, 规范化数值((role as any).当前饱腹, 0));
  (role as any).最大饱腹 = Math.max(0, 规范化数值((role as any).最大饱腹, 0));
  (role as any).当前口渴 = Math.max(0, 规范化数值((role as any).当前口渴, 0));
  (role as any).最大口渴 = Math.max(0, 规范化数值((role as any).最大口渴, 0));
  (role as any).当前负重 = Math.max(0, 规范化数值((role as any).当前负重, 0));
  (role as any).最大负重 = Math.max(0, 规范化数值((role as any).最大负重, 0));
  (role as any).力量 = 规范化数值((role as any).力量, 0);
  (role as any).敏捷 = 规范化数值((role as any).敏捷, 0);
  (role as any).体质 = 规范化数值((role as any).体质, 0);
  (role as any).根骨 = 规范化数值((role as any).根骨, 0);
  (role as any).悟性 = 规范化数值((role as any).悟性, 0);
  (role as any).福源 = 规范化数值((role as any).福源, 0);
  (role as any).当前经验 = Math.max(0, 规范化数值((role as any).当前经验, 0));
  (role as any).升级经验 = Math.max(0, 规范化数值((role as any).升级经验, 0));
  (role as any).当前坐标X = 规范化数值((role as any).当前坐标X, 0);
  (role as any).当前坐标Y = 规范化数值((role as any).当前坐标Y, 0);
  (role as any).天赋列表 = Array.isArray((role as any).天赋列表)
    ? (role as any).天赋列表.map((item: any) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
        const 名称 = 规范化文本(item?.名称);
        const 描述 = 规范化文本(item?.描述);
        const 效果 = 规范化文本(item?.效果);
        if (!名称 && !描述 && !效果) return null;
        return { 名称, 描述, 效果 };
      }).filter(Boolean)
    : [];
  const rawBackground = (role as any).出身背景 && typeof (role as any).出身背景 === 'object' && !Array.isArray((role as any).出身背景)
    ? (role as any).出身背景 : {};
  (role as any).出身背景 = {
    名称: 规范化文本(rawBackground?.名称, 默认背景模板.名称),
    描述: 规范化文本(rawBackground?.描述, 默认背景模板.描述),
    效果: 规范化文本(rawBackground?.效果, 默认背景模板.效果)
  };
  规范化角色身体部位字段(role);
  if (typeof (role as any).外貌 !== 'string' || !(role as any).外貌.trim()) {
    (role as any).外貌 = '相貌平常，衣着朴素。';
  }
  if (typeof (role as any).性格 !== 'string' || !(role as any).性格.trim()) {
    (role as any).性格 = '谨慎沉稳。';
  }
  const rawMoney = (role as any).金钱 && typeof (role as any).金钱 === 'object' ? (role as any).金钱 : {};
  (role as any).金钱 = {
    金元宝: 规范化货币数值(rawMoney?.金元宝 ?? 默认金钱模板.金元宝),
    银子: 规范化货币数值(rawMoney?.银子 ?? 默认金钱模板.银子),
    铜钱: 规范化货币数值(rawMoney?.铜钱 ?? 默认金钱模板.铜钱)
  };
  const rawPlayerBuffs = Array.isArray((role as any).玩家BUFF) ? (role as any).玩家BUFF : [];
  (role as any).玩家BUFF = rawPlayerBuffs.map((item: any, idx: number) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const 名称 = typeof item?.名称 === 'string' ? item.名称.trim() : '';
    const 描述 = typeof item?.描述 === 'string' ? item.描述.trim() : '';
    const 效果 = typeof item?.效果 === 'string' ? item.效果.trim() : '';
    const 结束时间 = typeof item?.结束时间 === 'string'
      ? (normalizeCanonicalGameTime(item.结束时间) || item.结束时间.trim()) : '';
    if (!名称 && !描述 && !效果 && !结束时间) return null;
    return { 索引: idx, 名称, 描述, 效果, 结束时间 };
  }).filter(Boolean).slice(-2).map((item: any, idx: number) => ({ ...item, 索引: idx }));
  const rawBreakthroughs = Array.isArray((role as any).突破条件) ? (role as any).突破条件 : [];
  (role as any).突破条件 = rawBreakthroughs.map((item: any, idx: number) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const 名称 = 规范化文本(item?.名称);
    const 描述 = 规范化文本(item?.描述);
    const 要求 = 规范化文本(item?.要求);
    const 当前进度 = 规范化文本(item?.当前进度);
    if (!名称 && !描述 && !要求 && !当前进度) return null;
    return { 索引: idx, 名称, 描述, 要求, 当前进度 };
  }).filter(Boolean).map((item: any, idx: number) => ({ ...item, 索引: idx }));
  (role as any).功法列表 = Array.isArray((role as any).功法列表) ? (role as any).功法列表 : [];

  const rawEquip = role?.装备 && typeof role.装备 === 'object' ? role.装备 : ({} as any);
  role.装备 = { ...默认装备模板, ...(rawEquip as any) };

  const sourceList = Array.isArray(role?.物品列表) ? role.物品列表 : [];
  const deduped: any[] = [];
  const seenIds = new Set<string>();
  sourceList.forEach((item: any, idx: number) => {
    const id = typeof item?.ID === 'string' && item.ID.trim().length > 0 ? item.ID.trim() : `itm_auto_${idx}`;
    if (seenIds.has(id)) return;
    seenIds.add(id);
    deduped.push({ ...item, ID: id });
  });

  const itemById = new Map<string, any>(deduped.map((item) => [item.ID, item]));
  const findItemByRef = (idOrName: string): any | undefined => {
    return itemById.get(idOrName) || deduped.find((item) => item?.名称 === idOrName);
  };
  const createFallbackEquippedItem = (slot: 装备槽位, itemName: string): any => {
    let baseId = `itm_auto_equip_${槽位ID片段映射[slot]}`;
    let candidate = baseId;
    let suffix = 1;
    while (seenIds.has(candidate)) { candidate = `${baseId}_${suffix++}`; }
    seenIds.add(candidate);
    const type = { 头部: '防具', 胸部: '防具', 盔甲: '防具', 内衬: '防具', 腿部: '防具', 手部: '防具', 足部: '防具', 主武器: '武器', 副武器: '武器', 暗器: '武器', 背部: '防具', 腰部: '防具', 坐骑: '杂物' }[slot];
    const generated: any = {
      ID: candidate, 名称: itemName, 描述: `由装备栏位自动补全的${slot}装备。`, 类型: type,
      品质: '凡品', 重量: slot === '坐骑' ? 30 : 1, 堆叠数量: 1, 是否可堆叠: false,
      价值: 0, 当前耐久: 100, 最大耐久: 100, 词条列表: [], 当前装备部位: slot
    };
    if (type === '武器') {
      generated.武器子类 = slot === '暗器' ? '暗器' : '剑';
      generated.最小攻击 = 1; generated.最大攻击 = 3; generated.攻速修正 = 1; generated.格挡率 = 0;
    }
    if (type === '防具') {
      const 防具位置映射: Record<string, '头部' | '胸部' | '腿部' | '手部' | '足部'> = {
        头部: '头部', 胸部: '胸部', 盔甲: '胸部', 内衬: '胸部', 腿部: '腿部', 手部: '手部', 足部: '足部'
      };
      generated.装备位置 = 防具位置映射[slot] || '胸部';
      generated.覆盖部位 = slot === '头部' ? ['头部']
        : slot === '胸部' || slot === '盔甲' || slot === '内衬' ? ['胸部', '腹部']
        : slot === '腿部' ? ['左腿', '右腿']
        : slot === '手部' ? ['左臂', '右臂', '手掌'] : ['足部'];
      generated.物理防御 = 1; generated.内功防御 = 1;
    }
    deduped.push(generated);
    itemById.set(candidate, generated);
    return generated;
  };

  const equippedByItemId = new Map<string, 装备槽位>();
  装备槽位列表.forEach((slot) => {
    const rawRef = (role.装备 as any)[slot];
    const normalizedRef = typeof rawRef === 'string' ? rawRef.trim() : '';
    if (!normalizedRef || normalizedRef === '无') { (role.装备 as any)[slot] = '无'; return; }
    (role.装备 as any)[slot] = normalizedRef;
    const matched = findItemByRef(normalizedRef) || createFallbackEquippedItem(slot, normalizedRef);
    const existedSlot = equippedByItemId.get(matched.ID);
    if (existedSlot && existedSlot !== slot) { (role.装备 as any)[slot] = '无'; return; }
    equippedByItemId.set(matched.ID, slot);
  });

  deduped.forEach((item) => {
    const equipSlot = equippedByItemId.get(item.ID);
    if (equipSlot) { item.当前装备部位 = equipSlot; } else { delete item.当前装备部位; }
    delete item.当前容器ID; delete item.容器属性; delete item.占用空间;
  });

  const totalWeight = deduped.reduce((sum, item) => {
    const weight = Number(item.重量) || 0;
    const count = Number(item.堆叠数量) || 1;
    return sum + (weight * count);
  }, 0);
  role.当前负重 = Math.round(totalWeight * 10) / 10;

  const 图片档案 = (() => {
    const source = role?.图片档案 && typeof role.图片档案 === 'object' && !Array.isArray(role.图片档案) ? role.图片档案 : null;
    return 合并角色图片档案对象(
      role?.最近生图结果 && typeof role.最近生图结果 === 'object' ? { 最近生图结果: role.最近生图结果 } : undefined,
      source
    );
  })();

  if (图片档案) {
    (role as any).图片档案 = 图片档案;
    (role as any).最近生图结果 = 图片档案.最近生图结果;
  } else {
    delete (role as any).图片档案;
    delete (role as any).最近生图结果;
  }

  role.物品列表 = deduped;
  return role;
}
