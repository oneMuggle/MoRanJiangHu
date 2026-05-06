import { normalizeCanonicalGameTime, 结构化时间转标准串 } from '../time/timeUtils';
import { 压缩图片资源字段 } from '../../../utils/imageAssets';

const 取首个非空文本 = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  }
  return undefined;
};

const 取字段文本 = (obj: any, key: string): string | undefined => {
  return typeof obj?.[key] === 'string' ? obj[key].trim() : undefined;
};

const 解析任意时间字段 = (raw: unknown): string | undefined => {
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    return normalizeCanonicalGameTime(trimmed) || trimmed;
  }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const structured = 结构化时间转标准串(raw);
    if (!structured) return undefined;
    return normalizeCanonicalGameTime(structured) || structured;
  }
  return undefined;
};

const 文本质量分 = (raw?: string): number => {
  if (!raw || raw.trim().length === 0) return 0;
  const text = raw.trim();
  if (/^(未知|暂无|无|未记录|未命名|\?+|n\/a)$/i.test(text)) return 1;
  return 2 + Math.min(text.length, 200) / 1000;
};

const 取更优文本 = (left?: string, right?: string): string | undefined => {
  const l = left?.trim();
  const r = right?.trim();
  const lScore = 文本质量分(l);
  const rScore = 文本质量分(r);
  if (rScore > lScore) return r;
  if (lScore > rScore) return l;
  if ((r?.length || 0) > (l?.length || 0)) return r;
  return l || r;
};

const 归一化键 = (raw: unknown): string => {
  if (typeof raw !== 'string') return '';
  return raw.trim().replace(/\s+/g, '').toLowerCase();
};

const 解析记忆时间排序值 = (raw?: string): number => {
  if (!raw) return Number.MAX_SAFE_INTEGER;
  const canonical = normalizeCanonicalGameTime(raw);
  if (!canonical) return Number.MAX_SAFE_INTEGER;
  const m = canonical.match(/^(\d{1,6}):(\d{2}):(\d{2}):(\d{2}):(\d{2})$/);
  if (!m) return Number.MAX_SAFE_INTEGER;
  const year = Number(m[1]); const month = Number(m[2]); const day = Number(m[3]);
  const hour = Number(m[4]); const minute = Number(m[5]);
  return (((year * 12 + month) * 31 + day) * 24 + hour) * 60 + minute;
};

const 标准化NPC记忆 = (memoryRaw: any): Array<{ 内容: string; 时间: string }> => {
  if (!Array.isArray(memoryRaw)) return [];
  const normalized = memoryRaw.map((m: any) => {
    const 内容 = typeof m?.内容 === 'string' ? m.内容.trim() : '';
    const 原始时间 = typeof m?.时间 === 'string' ? m.时间.trim() : (结构化时间转标准串(m?.时间) || '');
    const 时间 = 原始时间 ? (normalizeCanonicalGameTime(原始时间) || 原始时间) : '';
    return { 内容, 时间 };
  }).filter((m) => m.内容.length > 0 || m.时间.length > 0);

  const timeByContent = new Map<string, string>();
  const contentByTime = new Map<string, string>();
  normalized.forEach((m) => {
    if (m.内容 && m.时间 && !timeByContent.has(m.内容)) timeByContent.set(m.内容, m.时间);
    if (m.时间 && m.内容 && !contentByTime.has(m.时间)) contentByTime.set(m.时间, m.内容);
  });
  normalized.forEach((m) => {
    if (!m.时间 && m.内容 && timeByContent.has(m.内容)) m.时间 = timeByContent.get(m.内容)!;
    if (!m.内容 && m.时间 && contentByTime.has(m.时间)) m.内容 = contentByTime.get(m.时间)!;
  });

  const unique = new Map<string, { 内容: string; 时间: string }>();
  normalized.filter((m) => m.内容.length > 0).forEach((m) => {
    const key = `${m.时间}__${m.内容}`;
    if (!unique.has(key)) unique.set(key, { 内容: m.内容, 时间: m.时间 || '未知时间' });
  });
  return Array.from(unique.values()).sort((a, b) => 解析记忆时间排序值(a.时间) - 解析记忆时间排序值(b.时间));
};

const 标准化NPC总结记忆 = (summaryRaw: any): Array<{ 内容: string; 时间: string; 开始时间: string; 结束时间: string; 开始索引: number; 结束索引: number; 条数: number }> => {
  if (!Array.isArray(summaryRaw)) return [];
  const normalized = summaryRaw.map((item: any) => {
    const 内容 = typeof item?.内容 === 'string' ? item.内容.trim() : '';
    const 开始时间原始 = typeof item?.开始时间 === 'string' ? item.开始时间.trim() : (结构化时间转标准串(item?.开始时间) || '');
    const 结束时间原始 = typeof item?.结束时间 === 'string' ? item.结束时间.trim() : (结构化时间转标准串(item?.结束时间) || '');
    const 开始时间 = 开始时间原始 ? (normalizeCanonicalGameTime(开始时间原始) || 开始时间原始) : '';
    const 结束时间 = 结束时间原始 ? (normalizeCanonicalGameTime(结束时间原始) || 结束时间原始) : '';
    const 开始索引 = Math.max(0, Math.trunc(Number(item?.开始索引) || 0));
    const 结束索引 = Math.max(开始索引, Math.trunc(Number(item?.结束索引) || 开始索引));
    const 条数 = Math.max(1, Math.trunc(Number(item?.条数) || (结束索引 - 开始索引 + 1)));
    const 时间 = typeof item?.时间 === 'string' && item.时间.trim().length > 0
      ? item.时间.trim()
      : (开始时间 && 结束时间 ? (开始时间 === 结束时间 ? `[${开始时间}]` : `[${开始时间}-${结束时间}]`) : '');
    if (!内容) return null;
    return { 内容, 时间, 开始时间: 开始时间 || '未知时间', 结束时间: 结束时间 || 开始时间 || '未知时间', 开始索引, 结束索引, 条数 };
  }).filter(Boolean) as Array<{ 内容: string; 时间: string; 开始时间: string; 结束时间: string; 开始索引: number; 结束索引: number; 条数: number }>;
  const unique = new Map<string, typeof normalized[number]>();
  normalized.forEach((item) => {
    const key = `${item.开始索引}_${item.结束索引}_${item.内容}`;
    if (!unique.has(key)) unique.set(key, item);
  });
  return Array.from(unique.values()).sort((a, b) => a.开始索引 - b.开始索引);
};

const 合并字符串数组 = (a: any, b: any): string[] | undefined => {
  const merged: string[] = [];
  const seen = new Set<string>();
  const push = (value: unknown) => {
    if (typeof value !== 'string') return;
    const text = value.trim(); if (!text) return; if (seen.has(text)) return;
    seen.add(text); merged.push(text);
  };
  if (Array.isArray(a)) a.forEach(push);
  if (Array.isArray(b)) b.forEach(push);
  return merged.length > 0 ? merged : undefined;
};

const 标准化关系网变量 = (raw: any): Array<{ 对象姓名: string; 关系: string; 备注?: string }> | undefined => {
  if (!Array.isArray(raw)) return undefined;
  const merged = new Map<string, { 对象姓名: string; 关系: string; 备注?: string }>();
  raw.forEach((item: any) => {
    if (!item || typeof item !== 'object') return;
    const 对象姓名 = 取首个非空文本(item?.对象姓名, item?.对象, item?.姓名) || '';
    const 关系 = 取首个非空文本(item?.关系, item?.关系类型) || '';
    const 备注 = typeof item?.备注 === 'string' ? item.备注.trim() : '';
    if (!对象姓名 || !关系) return;
    merged.set(`${对象姓名}__${关系}`, { 对象姓名, 关系, ...(备注 ? { 备注 } : {}) });
  });
  const out = Array.from(merged.values());
  return out.length > 0 ? out : undefined;
};

const 合并关系网变量 = (a: any, b: any): Array<{ 对象姓名: string; 关系: string; 备注?: string }> | undefined => {
  const merged = new Map<string, { 对象姓名: string; 关系: string; 备注?: string }>();
  const pushList = (raw: any) => {
    const normalized = 标准化关系网变量(raw);
    if (!normalized) return;
    normalized.forEach((item) => merged.set(`${item.对象姓名}__${item.关系}`, item));
  };
  pushList(a); pushList(b);
  const out = Array.from(merged.values());
  return out.length > 0 ? out : undefined;
};

const 合并内射记录 = (a: any, b: any): any[] | undefined => {
  const merged = new Map<string, any>();
  const process = (raw: any) => {
    if (!Array.isArray(raw)) return;
    raw.forEach((item) => {
      const 日期Raw = typeof item?.日期 === 'string' ? item.日期.trim() : (结构化时间转标准串(item?.日期) || '');
      const 日期 = 日期Raw ? (normalizeCanonicalGameTime(日期Raw) || 日期Raw) : '';
      const 描述 = typeof item?.描述 === 'string' ? item.描述.trim() : '';
      const 怀孕判定日Raw = typeof item?.怀孕判定日 === 'string' ? item.怀孕判定日.trim() : (结构化时间转标准串(item?.怀孕判定日) || '');
      const 怀孕判定日 = 怀孕判定日Raw ? (normalizeCanonicalGameTime(怀孕判定日Raw) || 怀孕判定日Raw) : '';
      if (!日期 && !描述 && !怀孕判定日) return;
      const key = `${日期}__${描述}`;
      const existing = merged.get(key);
      if (!existing) {
        merged.set(key, { 日期: 日期 || '未知时间', 描述, 怀孕判定日: 怀孕判定日 || '未知时间' });
        return;
      }
      merged.set(key, {
        日期: 取更优文本(existing.日期, 日期) || existing.日期 || '未知时间',
        描述: 取更优文本(existing.描述, 描述) || existing.描述 || '',
        怀孕判定日: 取更优文本(existing.怀孕判定日, 怀孕判定日) || existing.怀孕判定日 || '未知时间'
      });
    });
  };
  process(a); process(b);
  const out = Array.from(merged.values());
  return out.length > 0 ? out : undefined;
};

const 标准化子宫档案 = (raw: any): any | undefined => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const 状态 = 取字段文本(raw, '状态') || '未知';
  const 宫口状态 = 取字段文本(raw, '宫口状态') || '未知';
  const 内射记录 = 合并内射记录(raw?.内射记录, undefined);
  return { 状态, 宫口状态, ...(内射记录 ? { 内射记录 } : { 内射记录: [] }) };
};

const 标准化子宫档案对象 = (raw: any): any | undefined => {
  return 标准化子宫档案(raw);
};

const 合并子宫档案 = (a: any, b: any): any | undefined => {
  const left = 标准化子宫档案对象(a);
  const right = 标准化子宫档案对象(b);
  if (!left && !right) return undefined;
  const 内射记录 = 合并内射记录(left?.内射记录, right?.内射记录) || [];
  return {
    状态: 取更优文本(left?.状态, right?.状态) || '未知',
    宫口状态: 取更优文本(left?.宫口状态, right?.宫口状态) || '未知',
    内射记录
  };
};

const 标准化香闺秘档部位结果 = (raw: any, part: '胸部' | '小穴' | '屁穴'): any | undefined => {
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
  const 描述文本 = typeof raw?.描述文本 === 'string' ? raw.描述文本.trim() : undefined;
  const 错误信息 = typeof raw?.错误信息 === 'string' ? raw.错误信息.trim() : undefined;
  const 生成时间 = Number.isFinite(Number(raw?.生成时间)) ? Number(raw.生成时间) : Date.now();
  const 状态 = raw?.状态 === 'success' || raw?.状态 === 'failed' || raw?.状态 === 'pending' ? raw.状态 : undefined;
  const id = typeof raw?.id === 'string' && raw.id.trim().length > 0 ? raw.id.trim() : `npc_secret_${part}_${生成时间}`;
  if (!图片URL && !本地路径 && !生图词组 && !原始描述 && !错误信息) return undefined;
  return { id, 部位: part, 图片URL, 本地路径, 生图词组, 最终正向提示词, 最终负向提示词, 原始描述, 使用模型, 生成时间, 构图: '部位特写' as const, 画风: raw?.画风, 画师串, 状态, 错误信息, 描述文本 };
};

const 标准化香闺秘档部位档案 = (raw: any): any | undefined => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const 胸部 = 标准化香闺秘档部位结果(raw?.胸部, '胸部');
  const 小穴 = 标准化香闺秘档部位结果(raw?.小穴, '小穴');
  const 屁穴 = 标准化香闺秘档部位结果(raw?.屁穴, '屁穴');
  if (!胸部 && !小穴 && !屁穴) return undefined;
  return { ...(胸部 ? { 胸部 } : {}), ...(小穴 ? { 小穴 } : {}), ...(屁穴 ? { 屁穴 } : {}) };
};

const 标准化NPC图片记录 = (raw: any): any | undefined => {
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
    部位: typeof raw?.部位 === 'string' ? raw.部位 : undefined,
    画风: raw?.画风, 画师串, 尺寸: typeof raw?.尺寸 === 'string' ? raw.尺寸.trim() : undefined,
    状态, 错误信息
  };
};

const 合并NPC图片历史记录 = (leftRaw: any[] | undefined, rightRaw: any[] | undefined): any[] => {
  const merged = new Map<string, any>();
  const fallback: any[] = [];
  [...(Array.isArray(rightRaw) ? rightRaw : []), ...(Array.isArray(leftRaw) ? leftRaw : [])].forEach((item) => {
    const normalized = 标准化NPC图片记录(item);
    if (!normalized) return;
    const key = typeof normalized.id === 'string' && normalized.id.trim()
      ? normalized.id.trim()
      : `${normalized.生成时间 || 0}|${normalized.构图 || ''}|${normalized.图片URL || normalized.本地路径 || normalized.原始描述 || ''}`;
    if (merged.has(key)) return;
    merged.set(key, normalized);
    fallback.push(normalized);
  });
  return fallback.sort((a, b) => (Number(b?.生成时间) || 0) - (Number(a?.生成时间) || 0));
};

const 合并NPC图片档案对象 = (leftRaw: any, rightRaw: any): any | undefined => {
  const leftSource = leftRaw && typeof leftRaw === 'object' && !Array.isArray(leftRaw) ? leftRaw : {};
  const rightSource = rightRaw && typeof rightRaw === 'object' && !Array.isArray(rightRaw) ? rightRaw : {};
  const leftRecent = 标准化NPC图片记录(leftSource?.最近生图结果);
  const rightRecent = 标准化NPC图片记录(rightSource?.最近生图结果);
  const mergedHistory = 合并NPC图片历史记录(
    Array.isArray(leftSource?.生图历史) ? leftSource.生图历史 : (leftRecent ? [leftRecent] : []),
    Array.isArray(rightSource?.生图历史) ? rightSource.生图历史 : (rightRecent ? [rightRecent] : [])
  );
  const recent = rightRecent || leftRecent || mergedHistory[0];
  const 已选头像图片ID = 取首个非空文本(rightSource?.已选头像图片ID, leftSource?.已选头像图片ID);
  const 已选立绘图片ID = 取首个非空文本(rightSource?.已选立绘图片ID, leftSource?.已选立绘图片ID);
  const 已选背景图片ID = 取首个非空文本(rightSource?.已选背景图片ID, leftSource?.已选背景图片ID);
  const 香闺秘档部位档案 = 标准化香闺秘档部位档案({
    ...(leftSource?.香闺秘档部位档案 && typeof leftSource.香闺秘档部位档案 === 'object' ? leftSource.香闺秘档部位档案 : {}),
    ...(rightSource?.香闺秘档部位档案 && typeof rightSource.香闺秘档部位档案 === 'object' ? rightSource.香闺秘档部位档案 : {})
  });
  if (!recent && mergedHistory.length <= 0 && !香闺秘档部位档案 && !已选头像图片ID && !已选立绘图片ID && !已选背景图片ID) return undefined;
  return {
    ...(recent ? { 最近生图结果: recent } : {}),
    ...(mergedHistory.length > 0 ? { 生图历史: mergedHistory } : {}),
    ...(已选头像图片ID ? { 已选头像图片ID } : {}),
    ...(已选立绘图片ID ? { 已选立绘图片ID } : {}),
    ...(已选背景图片ID ? { 已选背景图片ID } : {}),
    ...(香闺秘档部位档案 ? { 香闺秘档部位档案 } : {})
  };
};

const 读取胸部描述 = (obj: any): string | undefined => 取字段文本(obj, '胸部描述');
const 读取小穴描述 = (obj: any): string | undefined => 取字段文本(obj, '小穴描述');
const 读取屁穴描述 = (obj: any): string | undefined => 取字段文本(obj, '屁穴描述');
const 读取性癖 = (obj: any): string | undefined => 取字段文本(obj, '性癖');
const 读取敏感点 = (obj: any): string | undefined => 取字段文本(obj, '敏感点');

export function 标准化单个NPC(rawNpc: any, fallbackIndex: number): any {
  const npc = rawNpc && typeof rawNpc === 'object' ? rawNpc : {};
  const npc其他字段 = { ...npc };
  const 外貌描写 = 取首个非空文本(npc?.外貌描写, npc?.外貌, npc?.档案?.外貌要点, npc?.档案?.外貌描写);
  const 身材描写 = 取首个非空文本(npc?.身材描写, npc?.身材, npc?.档案?.身材要点, npc?.档案?.身材描写);
  const 衣着风格 = 取首个非空文本(npc?.衣着风格, npc?.衣着, npc?.档案?.衣着风格, npc?.档案?.衣着要点);
  const 记忆 = 标准化NPC记忆(npc?.记忆);
  const 总结记忆 = 标准化NPC总结记忆(npc?.总结记忆);
  const 核心性格特征 = 取首个非空文本(npc?.核心性格特征);
  const 好感度突破条件 = 取首个非空文本(npc?.好感度突破条件);
  const 关系突破条件 = 取首个非空文本(npc?.关系突破条件);
  const 关系网变量 = 标准化关系网变量(npc?.关系网变量);
  const 生日 = 取首个非空文本(npc?.生日);
  const 对主角称呼 = 取首个非空文本(npc?.对主角称呼);
  const 胸部描述 = 读取胸部描述(npc);
  const 小穴描述 = 读取小穴描述(npc);
  const 屁穴描述 = 读取屁穴描述(npc);
  const 性癖 = 读取性癖(npc);
  const 敏感点 = 读取敏感点(npc);
  const 子宫 = 标准化子宫档案对象(npc?.子宫);
  const 上次更新时间 = 解析任意时间字段(npc?.上次更新时间 ?? npc?.最后更新时间 ?? npc?.更新时间);
  const 图片档案 = (() => {
    const source = npc?.图片档案 && typeof npc.图片档案 === 'object' && !Array.isArray(npc.图片档案) ? npc.图片档案 : null;
    return 合并NPC图片档案对象(
      npc?.最近生图结果 && typeof npc.最近生图结果 === 'object' ? { 最近生图结果: npc.最近生图结果 } : undefined,
      source
    );
  })();

  return {
    ...npc其他字段,
    id: 取首个非空文本(npc?.id, `npc_${fallbackIndex}`) || `npc_${fallbackIndex}`,
    姓名: 取首个非空文本(npc?.姓名, `角色${fallbackIndex}`) || `角色${fallbackIndex}`,
    性别: typeof npc?.性别 === 'string' ? npc.性别 : '未知',
    年龄: Number.isFinite(Number(npc?.年龄)) ? Number(npc.年龄) : undefined,
    ...(生日 ? { 生日 } : {}),
    境界: typeof npc?.境界 === 'string' ? npc.境界 : '未知境界',
    身份: typeof npc?.身份 === 'string' ? npc.身份 : '未知身份',
    是否在场: typeof npc?.是否在场 === 'boolean' ? npc.是否在场 : true,
    是否队友: typeof npc?.是否队友 === 'boolean' ? npc.是否队友 : false,
    是否主要角色: typeof npc?.是否主要角色 === 'boolean' ? npc.是否主要角色 : false,
    好感度: Number.isFinite(Number(npc?.好感度)) ? Number(npc.好感度) : 0,
    关系状态: typeof npc?.关系状态 === 'string' ? npc.关系状态 : '未知',
    ...(对主角称呼 ? { 对主角称呼 } : {}),
    简介: typeof npc?.简介 === 'string' ? npc.简介 : '暂无简介',
    攻击力: Number.isFinite(Number(npc?.攻击力)) ? Number(npc.攻击力) : undefined,
    防御力: Number.isFinite(Number(npc?.防御力)) ? Number(npc.防御力) : undefined,
    当前血量: Number.isFinite(Number(npc?.当前血量)) ? Number(npc.当前血量) : undefined,
    最大血量: Number.isFinite(Number(npc?.最大血量)) ? Number(npc.最大血量) : undefined,
    当前精力: Number.isFinite(Number(npc?.当前精力)) ? Number(npc.当前精力) : undefined,
    最大精力: Number.isFinite(Number(npc?.最大精力)) ? Number(npc.最大精力) : undefined,
    当前内力: Number.isFinite(Number(npc?.当前内力)) ? Number(npc.当前内力) : undefined,
    最大内力: Number.isFinite(Number(npc?.最大内力)) ? Number(npc.最大内力) : undefined,
    记忆,
    ...(总结记忆.length > 0 ? { 总结记忆 } : {}),
    ...(核心性格特征 ? { 核心性格特征 } : {}),
    ...(好感度突破条件 ? { 好感度突破条件 } : {}),
    ...(关系突破条件 ? { 关系突破条件 } : {}),
    ...(Array.isArray(关系网变量) && 关系网变量.length > 0 ? { 关系网变量 } : {}),
    ...(外貌描写 ? { 外貌描写 } : {}),
    ...(身材描写 ? { 身材描写 } : {}),
    ...(衣着风格 ? { 衣着风格 } : {}),
    ...(胸部描述 ? { 胸部描述 } : {}),
    ...(小穴描述 ? { 小穴描述 } : {}),
    ...(屁穴描述 ? { 屁穴描述 } : {}),
    ...(性癖 ? { 性癖 } : {}),
    ...(敏感点 ? { 敏感点 } : {}),
    ...(子宫 ? { 子宫 } : {}),
    ...(上次更新时间 ? { 上次更新时间 } : {}),
    ...(图片档案 ? { 图片档案, 最近生图结果: 图片档案.最近生图结果 } : {})
  };
}

export function 合并NPC对象(leftRaw: any, rightRaw: any, fallbackIndex: number): any {
  const left = 标准化单个NPC(leftRaw, fallbackIndex);
  const right = 标准化单个NPC(rightRaw, fallbackIndex);
  const mergedMemory = 标准化NPC记忆([...(left.记忆 || []), ...(right.记忆 || [])]);
  const mergedSummaryMemory = 标准化NPC总结记忆([...(left.总结记忆 || []), ...(right.总结记忆 || [])]);
  const mergedWomb = 合并子宫档案(left?.子宫, right?.子宫);

  const mergedEquip = (() => {
    const leftEquip = left?.当前装备 && typeof left.当前装备 === 'object' ? left.当前装备 : undefined;
    const rightEquip = right?.当前装备 && typeof right.当前装备 === 'object' ? right.当前装备 : undefined;
    if (!leftEquip && !rightEquip) return undefined;
    const keys = ['主武器', '副武器', '服装', '饰品', '内衣', '内裤', '袜饰', '鞋履'];
    const out: Record<string, string> = {};
    keys.forEach((k) => {
      const text = 取更优文本(取字段文本(leftEquip, k), 取字段文本(rightEquip, k));
      if (text) out[k] = text;
    });
    return Object.keys(out).length > 0 ? out : undefined;
  })();
  const mergedRelationNet = 合并关系网变量(left?.关系网变量, right?.关系网变量);
  const mergedImageArchive = 合并NPC图片档案对象(left?.图片档案, right?.图片档案);

  return {
    ...left, ...right,
    id: 取首个非空文本(right.id, left.id, `npc_${fallbackIndex}`) || `npc_${fallbackIndex}`,
    姓名: 取首个非空文本(right.姓名, left.姓名, `角色${fallbackIndex}`) || `角色${fallbackIndex}`,
    性别: 取更优文本(取字段文本(left, '性别'), 取字段文本(right, '性别')) || '未知',
    年龄: Number.isFinite(Number(right?.年龄)) ? Number(right.年龄) : (Number.isFinite(Number(left?.年龄)) ? Number(left.年龄) : undefined),
    生日: 取更优文本(取字段文本(left, '生日'), 取字段文本(right, '生日')),
    境界: 取更优文本(取字段文本(left, '境界'), 取字段文本(right, '境界')) || '未知境界',
    身份: 取更优文本(取字段文本(left, '身份'), 取字段文本(right, '身份')) || '未知身份',
    是否在场: typeof right?.是否在场 === 'boolean' ? right.是否在场 : (typeof left?.是否在场 === 'boolean' ? left.是否在场 : true),
    是否队友: typeof right?.是否队友 === 'boolean' ? right.是否队友 : (typeof left?.是否队友 === 'boolean' ? left.是否队友 : false),
    是否主要角色: Boolean(left?.是否主要角色) || Boolean(right?.是否主要角色),
    好感度: Number.isFinite(Number(right?.好感度)) ? Number(right.好感度) : (Number.isFinite(Number(left?.好感度)) ? Number(left.好感度) : 0),
    关系状态: 取更优文本(取字段文本(left, '关系状态'), 取字段文本(right, '关系状态')) || '未知',
    对主角称呼: 取更优文本(取字段文本(left, '对主角称呼'), 取字段文本(right, '对主角称呼')),
    简介: 取更优文本(取字段文本(left, '简介'), 取字段文本(right, '简介')) || '暂无简介',
    核心性格特征: 取更优文本(取字段文本(left, '核心性格特征'), 取字段文本(right, '核心性格特征')),
    好感度突破条件: 取更优文本(取字段文本(left, '好感度突破条件'), 取字段文本(right, '好感度突破条件')),
    关系突破条件: 取更优文本(取字段文本(left, '关系突破条件'), 取字段文本(right, '关系突破条件')),
    关系网变量: mergedRelationNet,
    外貌描写: 取更优文本(取字段文本(left, '外貌描写'), 取字段文本(right, '外貌描写')),
    身材描写: 取更优文本(取字段文本(left, '身材描写'), 取字段文本(right, '身材描写')),
    衣着风格: 取更优文本(取字段文本(left, '衣着风格'), 取字段文本(right, '衣着风格')),
    胸部描述: 取更优文本(读取胸部描述(left), 读取胸部描述(right)),
    小穴描述: 取更优文本(读取小穴描述(left), 读取小穴描述(right)),
    屁穴描述: 取更优文本(读取屁穴描述(left), 读取屁穴描述(right)),
    性癖: 取更优文本(读取性癖(left), 读取性癖(right)),
    敏感点: 取更优文本(读取敏感点(left), 读取敏感点(right)),
    子宫: mergedWomb,
    是否处女: typeof right?.是否处女 === 'boolean' ? right.是否处女 : (typeof left?.是否处女 === 'boolean' ? left.是否处女 : undefined),
    初夜夺取者: 取更优文本(取字段文本(left, '初夜夺取者'), 取字段文本(right, '初夜夺取者')),
    初夜时间: (() => {
      const leftTime = 取字段文本(left, '初夜时间');
      const rightTime = 取字段文本(right, '初夜时间');
      const l = leftTime ? (normalizeCanonicalGameTime(leftTime) || leftTime) : undefined;
      const r = rightTime ? (normalizeCanonicalGameTime(rightTime) || rightTime) : undefined;
      return 取更优文本(l, r);
    })(),
    初夜描述: 取更优文本(取字段文本(left, '初夜描述'), 取字段文本(right, '初夜描述')),
    攻击力: Number.isFinite(Number(right?.攻击力)) ? Number(right.攻击力) : (Number.isFinite(Number(left?.攻击力)) ? Number(left.攻击力) : undefined),
    防御力: Number.isFinite(Number(right?.防御力)) ? Number(right.防御力) : (Number.isFinite(Number(left?.防御力)) ? Number(left.防御力) : undefined),
    上次更新时间: (() => {
      const l = 解析任意时间字段(left?.上次更新时间 ?? left?.最后更新时间 ?? left?.更新时间);
      const r = 解析任意时间字段(right?.上次更新时间 ?? right?.最后更新时间 ?? right?.更新时间);
      return 取更优文本(l, r);
    })(),
    当前血量: Number.isFinite(Number(right?.当前血量)) ? Number(right.当前血量) : (Number.isFinite(Number(left?.当前血量)) ? Number(left.当前血量) : undefined),
    最大血量: Number.isFinite(Number(right?.最大血量)) ? Number(right.最大血量) : (Number.isFinite(Number(left?.最大血量)) ? Number(left.最大血量) : undefined),
    当前精力: Number.isFinite(Number(right?.当前精力)) ? Number(right.当前精力) : (Number.isFinite(Number(left?.当前精力)) ? Number(left.当前精力) : undefined),
    最大精力: Number.isFinite(Number(right?.最大精力)) ? Number(right.最大精力) : (Number.isFinite(Number(left?.最大精力)) ? Number(left.最大精力) : undefined),
    当前内力: Number.isFinite(Number(right?.当前内力)) ? Number(right.当前内力) : (Number.isFinite(Number(left?.当前内力)) ? Number(left.当前内力) : undefined),
    最大内力: Number.isFinite(Number(right?.最大内力)) ? Number(right.最大内力) : (Number.isFinite(Number(left?.最大内力)) ? Number(left.最大内力) : undefined),
    当前装备: mergedEquip,
    背包: 合并字符串数组(left?.背包, right?.背包),
    记忆: mergedMemory,
    ...(mergedSummaryMemory.length > 0 ? { 总结记忆: mergedSummaryMemory } : {}),
    ...(mergedImageArchive ? { 图片档案: mergedImageArchive, 最近生图结果: mergedImageArchive.最近生图结果 } : {})
  };
}

export function 合并同名NPC列表(list: any[]): any[] {
  if (!Array.isArray(list)) return [];
  const merged: any[] = [];
  const nameIndexMap = new Map<string, number>();

  list.forEach((rawNpc, index) => {
    const normalized = 标准化单个NPC(rawNpc, index);
    const nameKey = 归一化键(normalized?.姓名);
    const nameMatchedIndex = nameKey ? nameIndexMap.get(nameKey) : undefined;
    const targetIndex = typeof nameMatchedIndex === 'number' ? nameMatchedIndex : -1;

    if (targetIndex < 0) {
      const pushIndex = merged.length;
      merged.push(normalized);
      const newNameKey = 归一化键(normalized?.姓名);
      if (newNameKey) nameIndexMap.set(newNameKey, pushIndex);
      return;
    }

    merged[targetIndex] = 合并NPC对象(merged[targetIndex], normalized, targetIndex);
    const mergedNameKey = 归一化键(merged[targetIndex]?.姓名);
    if (mergedNameKey) nameIndexMap.set(mergedNameKey, targetIndex);
  });

  return merged;
}
