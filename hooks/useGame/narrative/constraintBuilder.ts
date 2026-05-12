/**
 * constraintBuilder.ts
 *
 * 统一叙事约束构建器 — 将 SLG + RPG + AVG 全状态合并为 XML 约束，
 * 注入 AI prompt 以指导叙事生成。
 *
 * 设计要点：
 * - 分层注册：每个引擎/子系统注册一个 ConstraintLayer
 * - 优先级注入：critical（必注入）> important（多数注入）> optional（按需注入）
 * - 大小控制：目标 < 2KB，超出时裁剪 optional 层
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GameStore = Record<string, any>;

export type ConstraintPriority = 'critical' | 'important' | 'optional';

export interface ConstraintLayer {
  /** 优先级：critical 必注入，important 多数注入，optional 可裁剪 */
  priority: ConstraintPriority;
  /** 构建该层的 XML 片段，返回 null 表示该层当前无内容 */
  build(state: GameStore): string | null;
}

/** 约束构建器默认目标大小（字节） */
const TARGET_SIZE = 2048;

export class ConstraintBuilder {
  private _layers: Map<string, ConstraintLayer> = new Map();

  /**
   * 注册约束层 — 同名覆盖
   */
  registerLayer(name: string, layer: ConstraintLayer): void {
    this._layers.set(name, layer);
  }

  /**
   * 注销约束层
   */
  unregisterLayer(name: string): void {
    this._layers.delete(name);
  }

  /**
   * 获取所有已注册的层名
   */
  getLayerNames(): string[] {
    return Array.from(this._layers.keys());
  }

  /**
   * 构建完整约束 XML
   *
   * 构建策略：
   * 1. 按优先级分组：critical → important → optional
   * 2. 先构建 critical 层，再构建 important 层
   * 3. 构建 optional 层时检查总大小，若超过 TARGET_SIZE 则跳过
   */
  build(state: GameStore): string {
    const layers = Array.from(this._layers.entries());
    const pieces: { name: string; xml: string; priority: ConstraintPriority }[] = [];

    // 按优先级排序
    const priorityOrder: ConstraintPriority[] = ['critical', 'important', 'optional'];
    layers.sort((a, b) => priorityOrder.indexOf(a[1].priority) - priorityOrder.indexOf(b[1].priority));

    let totalSize = 0;

    for (const [name, layer] of layers) {
      const xml = layer.build(state);
      if (xml === null) continue;

      const xmlSize = new Blob([xml]).size;

      // optional 层如果会导致超限则跳过
      if (layer.priority === 'optional') {
        if (totalSize + xmlSize > TARGET_SIZE) {
          continue;
        }
      }

      totalSize += xmlSize;
      pieces.push({ name, xml, priority: layer.priority });
    }

    return this._wrapXml(pieces.map((p) => p.xml).join('\n'));
  }

  /**
   * 获取当前约束大小（字节）
   */
  getSize(state: GameStore): number {
    return new Blob([this.build(state)]).size;
  }

  /**
   * 获取各层大小信息（调试用）
   */
  getLayerSizes(state: GameStore): { name: string; size: number; priority: ConstraintPriority }[] {
    const results: { name: string; size: number; priority: ConstraintPriority }[] = [];
    for (const [name, layer] of this._layers) {
      const xml = layer.build(state);
      if (xml === null) continue;
      results.push({
        name,
        size: new Blob([xml]).size,
        priority: layer.priority,
      });
    }
    return results;
  }

  private _wrapXml(inner: string): string {
    return `<游戏叙事约束>\n${inner}\n</游戏叙事约束>`;
  }
}

export function createConstraintBuilder(): ConstraintBuilder {
  return new ConstraintBuilder();
}
