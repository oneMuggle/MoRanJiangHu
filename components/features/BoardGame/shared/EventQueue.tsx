import React, { useState } from 'react';
import type { 多人局事件, 多人局事件类型 } from '../../../../models/boardGameNSFW/core';

interface EventQueueProps {
  pending: 多人局事件[];
  executed: 多人局事件[];
  maxVisible?: number;
}

const 事件类型颜色: Record<多人局事件类型, string> = {
  '指令执行': 'text-blue-400 border-blue-500/30 bg-blue-500/5',
  '阵营对抗': 'text-red-400 border-red-500/30 bg-red-500/5',
  '私下结盟': 'text-purple-400 border-purple-500/30 bg-purple-500/5',
  '公开曝光': 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5',
  '集体NSFW': 'text-pink-400 border-pink-500/30 bg-pink-500/5',
};

const EventItem: React.FC<{ event: 多人局事件; executed: boolean }> = ({ event, executed }) => {
  const colorClass = 事件类型颜色[event.事件类型] || 'text-gray-400 border-gray-500/30 bg-gray-500/5';

  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-xs ${colorClass} ${executed ? 'opacity-60' : ''}`}>
      <span className="font-mono text-[10px] text-gray-500 shrink-0">R{event.当前回合}</span>
      <span className="font-semibold shrink-0 w-20">{event.事件类型}</span>
      <span className="flex-1 truncate text-gray-300">{event.事件描述}</span>
      <span className="text-[10px] text-gray-500 shrink-0">{event.发起者}</span>
    </div>
  );
};

const EventQueue: React.FC<EventQueueProps> = ({ pending, executed, maxVisible = 5 }) => {
  const [expanded, setExpanded] = useState(false);

  const visibleExecuted = expanded ? executed : executed.slice(0, maxVisible);
  const hasMore = executed.length > maxVisible;

  return (
    <div className="flex flex-col gap-2">
      {/* 待处理事件 */}
      {pending.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="text-xs text-wuxia-gold/70 font-serif">待处理事件 ({pending.length})</div>
          {pending.map((event) => (
            <EventItem key={event.id} event={event} executed={false} />
          ))}
        </div>
      )}

      {/* 已执行事件 */}
      {executed.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 font-serif">已执行事件 ({executed.length})</div>
            {hasMore && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="text-[10px] text-wuxia-gold/50 hover:text-wuxia-gold/80 transition-colors"
              >
                {expanded ? '收起' : '展开全部'}
              </button>
            )}
          </div>
          {visibleExecuted.map((event) => (
            <EventItem key={event.id} event={event} executed={true} />
          ))}
        </div>
      )}

      {pending.length === 0 && executed.length === 0 && (
        <div className="text-center text-xs text-gray-600 py-4">暂无事件</div>
      )}
    </div>
  );
};

export default EventQueue;
