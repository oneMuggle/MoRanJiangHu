import type { 游戏事件 } from '../../../models/eventTrigger';
import { 计算触发回合 } from './core';

export function 构建事件注入提示词(事件: 游戏事件): string {
  const 触发回合 = 计算触发回合(事件);
  const 触发回合描述 = 触发回合 !== null ? `（触发回合: ${触发回合}）` : '';
  const 基础描述 = `## ${事件.名称} 事件触发${触发回合描述}`;
  const 事件描述 = 事件.描述 ? `\n${事件.描述}` : '';
  const 事件数据块 = Object.keys(事件.事件数据).length > 0 ? `\n事件数据：\n${JSON.stringify(事件.事件数据, null, 2)}` : '';
  return `${基础描述}${事件描述}${事件数据块}

请在本次剧情中处理此事件的触发与展开。
事件结束后，请在回复末尾输出以下标签来更新事件状态：

<事件更新>
{"id": "${事件.id}", "新状态": "已触发"}
</事件更新>
`;
}

export function 解析事件更新信号(responseText: string): { 事件ID: string; 新状态: string; 额外数据?: Record<string, unknown> } | null {
  const match = responseText.match(/<事件更新>\s*([\s\S]*?)\s*<\/事件更新>/);
  if (!match) return null;
  try {
    const data = JSON.parse(match[1]);
    if (data.id) return { 事件ID: data.id, 新状态: data.新状态 || '已触发', 额外数据: data.额外数据 };
  } catch { /* ignore */ }
  return null;
}
