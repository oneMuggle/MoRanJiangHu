import { 环境信息结构 } from '../../../types';
import { normalizeCanonicalGameTime, 结构化时间转标准串 } from '../time/timeUtils';
import { 规范化文本 } from '../../../utils/stringNormalizers';

const 取地点片段 = (raw: unknown): string => (typeof raw === 'string' ? raw.trim() : '');

const 去除具体地点冗余 = (specificRaw: string, smallRaw: string): string => {
  const specific = 取地点片段(specificRaw);
  const small = 取地点片段(smallRaw);
  if (!specific || !small) return specific;
  if (!specific.startsWith(small)) return specific;
  const stripped = specific.slice(small.length).replace(/^[\s\-—>·/|，,、。:：]+/, '').trim();
  return stripped || specific;
};

const 规范化环境时间文本 = (rawEnv?: any): string => {
  const source = rawEnv && typeof rawEnv === 'object' ? rawEnv : {};
  if (typeof source?.时间 === 'string') {
    const canonical = normalizeCanonicalGameTime(source.时间);
    if (canonical) return canonical;
  }
  const structured = 结构化时间转标准串(source);
  if (structured) {
    const canonical = normalizeCanonicalGameTime(structured);
    if (canonical) return canonical;
  }
  return '1:01:01:00:00';
};

const 标准化环境变量条目 = (raw: any) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const 名称 = typeof raw?.名称 === 'string' ? raw.名称.trim() : '';
  const 描述 = typeof raw?.描述 === 'string' ? raw.描述.trim() : '';
  const 效果 = typeof raw?.效果 === 'string' ? raw.效果.trim() : '';
  if (!名称 && !描述 && !效果) return null;
  return { 名称, 描述, 效果 };
};

export function 规范化环境信息(rawEnv?: any): 环境信息结构 {
  const source = rawEnv && typeof rawEnv === 'object' ? rawEnv : {};
  const 时间 = 规范化环境时间文本(source);
  const 大地点 = 取地点片段(source?.大地点);
  const 中地点 = 取地点片段(source?.中地点);
  const 小地点 = 取地点片段(source?.小地点);
  const 原始具体地点 = 取地点片段(source?.具体地点);
  const 具体地点 = 去除具体地点冗余(原始具体地点, 小地点);
  const rawFestival = source?.节日 && typeof source.节日 === 'object' ? source.节日 : null;
  const rawFestivalName = typeof source?.节日 === 'string' ? source.节日.trim() : '';
  const festivalSource = rawFestival;
  const 节日 = festivalSource
    ? {
        名称: typeof festivalSource?.名称 === 'string' ? festivalSource.名称.trim() : rawFestivalName,
        简介: typeof festivalSource?.简介 === 'string' ? festivalSource.简介.trim() : '',
        效果: typeof festivalSource?.效果 === 'string' ? festivalSource.效果.trim() : ''
      }
    : (rawFestivalName ? { 名称: rawFestivalName, 简介: '', 效果: '' } : null);
  const rawWeather = source?.天气 && typeof source.天气 === 'object' ? source.天气 : {};
  const 天气结束日期 = (() => {
    if (typeof rawWeather?.结束日期 === 'string') {
      const canonical = normalizeCanonicalGameTime(rawWeather.结束日期);
      if (canonical) return canonical;
    }
    const structured = 结构化时间转标准串(rawWeather?.结束日期);
    if (structured) {
      const canonical = normalizeCanonicalGameTime(structured);
      return canonical || structured;
    }
    return 时间;
  })();
  const 天气 = {
    天气: typeof rawWeather?.天气 === 'string' ? rawWeather.天气.trim() : '',
    结束日期: 天气结束日期
  };
  const rawEnvVar = source?.环境变量;
  const 环境变量源 = Array.isArray(rawEnvVar)
    ? rawEnvVar
    : (rawEnvVar && typeof rawEnvVar === 'object' ? [rawEnvVar] : []);
  const 环境变量 = 环境变量源
    .map((item: any) => 标准化环境变量条目(item))
    .filter((item): item is { 名称: string; 描述: string; 效果: string } => Boolean(item))
    .slice(-2);
  return { 时间, 大地点, 中地点, 小地点, 具体地点, 节日, 天气, 环境变量 };
}

export function 构建完整地点文本(env: any): string {
  const normalized = 规范化环境信息(env);
  const parts = [normalized.大地点, normalized.中地点, normalized.小地点, normalized.具体地点]
    .map((part) => part.trim())
    .filter(Boolean);
  const unique = parts.filter((part, idx) => parts.indexOf(part) === idx);
  return unique.length > 0 ? unique.join(' > ') : '未知地点';
}
