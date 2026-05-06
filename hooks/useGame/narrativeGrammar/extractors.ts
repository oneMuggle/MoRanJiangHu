import type { 旁白行, 角色台词行, 判定行 } from '../../../models/narrativeGrammar';
import { 解析叙事块 } from './parsers';

export function 提取旁白行(文本: string): 旁白行[] {
  return 解析叙事块(文本).正文.filter((行): 行 is 旁白行 => 行.类型 === '旁白');
}

export function 提取角色台词(文本: string): 角色台词行[] {
  return 解析叙事块(文本).正文.filter((行): 行 is 角色台词行 => 行.类型 === '角色台词');
}

export function 提取判定行(文本: string): 判定行[] {
  return 解析叙事块(文本).正文.filter((行): 行 is 判定行 => 行.类型 === '判定');
}

export function 提取Judge内容(文本: string): string[] {
  const 正则 = /<judge>([\s\S]*?)<\/judge>/g;
  const 结果: string[] = [];
  let match;
  while ((match = 正则.exec(文本)) !== null) { 结果.push(match[1].trim()); }
  return 结果;
}
