import type { 游戏事件 } from '../../../models/eventTrigger';

const 默认优先级 = 0;

export function 计算触发回合(事件: 游戏事件): number | null {
  switch (事件.触发条件.kind) {
    case '回合偏移': return (事件.创建回合 || 0) + 事件.触发条件.偏移量;
    case '回合绝对': return 事件.触发条件.目标回合;
    case '条件表达式': return null;
    default: return null;
  }
}

export function 检查到期事件(事件列表: 游戏事件[] | undefined, 当前回合: number): 游戏事件[] {
  if (!事件列表 || 事件列表.length === 0) return [];
  return 事件列表.filter(事件 => {
    if (事件.状态 !== '待触发') return false;
    if (事件.过期回合 !== undefined && 当前回合 > 事件.过期回合) return false;
    const 触发回合 = 计算触发回合(事件);
    if (触发回合 === null) return false;
    return 当前回合 >= 触发回合;
  }).sort((a, b) => (b.优先级 ?? 默认优先级) - (a.优先级 ?? 默认优先级));
}

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
