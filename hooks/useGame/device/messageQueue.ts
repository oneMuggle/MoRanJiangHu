/**
 * SLG + AI 混合架构 — 手机消息队列
 *
 * 按优先级调度的消息队列，支持定时推送、NPC 触发、紧急插队。
 */

export type MessagePriority = 'low' | 'normal' | 'urgent';

export interface ScheduledMessage {
  id: string;
  senderId: string;
  senderName: string;
  appId: string;
  content: string;
  scheduledTime: number;
  priority: MessagePriority;
  trigger: string;
  createdAt: number;
}

export interface DisplayMessage {
  id: string;
  senderId: string;
  senderName: string;
  appId: string;
  content: string;
  priority: MessagePriority;
  deliveredAt: number;
}

interface QueuedMessage {
  message: ScheduledMessage;
  position: number;
}

export class MessageQueue {
  private _queue: QueuedMessage[] = [];
  private _nextPosition = 0;

  enqueue(message: ScheduledMessage): void {
    const item: QueuedMessage = { message, position: this._nextPosition++ };
    this._queue.push(item);
    this._sort();
  }

  dequeue(count: number = 1): DisplayMessage[] {
    if (this._queue.length === 0) return [];

    const due = this._queue
      .filter((item) => item.message.scheduledTime <= Date.now())
      .sort((a, b) => this._priorityCompare(a.message.priority, b.message.priority) || a.position - b.position)
      .slice(0, count);

    const results: DisplayMessage[] = due.map((item) => ({
      id: item.message.id,
      senderId: item.message.senderId,
      senderName: item.message.senderName,
      appId: item.message.appId,
      content: item.message.content,
      priority: item.message.priority,
      deliveredAt: Date.now(),
    }));

    const dueIds = new Set(due.map((item) => item.message.id));
    this._queue = this._queue.filter((item) => !dueIds.has(item.message.id));

    return results;
  }

  peek(): ScheduledMessage | null {
    if (this._queue.length === 0) return null;
    return this._queue[0].message;
  }

  removeById(id: string): boolean {
    const before = this._queue.length;
    this._queue = this._queue.filter((item) => item.message.id !== id);
    return this._queue.length < before;
  }

  size(): number {
    return this._queue.length;
  }

  getDueCount(): number {
    return this._queue.filter((item) => item.message.scheduledTime <= Date.now()).length;
  }

  getAllScheduled(): ScheduledMessage[] {
    return this._queue.map((item) => item.message).sort((a, b) => a.scheduledTime - b.scheduledTime);
  }

  clear(): void {
    this._queue = [];
  }

  private _sort(): void {
    this._queue.sort((a, b) => {
      const priorityDiff = this._priorityCompare(a.message.priority, b.message.priority);
      if (priorityDiff !== 0) return priorityDiff;
      const timeDiff = a.message.scheduledTime - b.message.scheduledTime;
      if (timeDiff !== 0) return timeDiff;
      return a.position - b.position;
    });
  }

  private _priorityCompare(a: MessagePriority, b: MessagePriority): number {
    const rank: Record<MessagePriority, number> = { urgent: 0, normal: 1, low: 2 };
    return rank[a] - rank[b];
  }
}
