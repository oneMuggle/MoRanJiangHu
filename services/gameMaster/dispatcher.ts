/**
 * Director Dispatcher - 任务调度器
 * 负责将请求并行分发到相关智能体
 */

import {
  DirectorRole,
  DirectorContext,
  DirectorDecision,
  GameMasterRequest,
  GameMasterRequestType,
  IDirector,
  DispatcherConfig,
  DEFAULT_DISPATCHER_CONFIG,
} from './types';

/**
 * 导演调度器
 * 负责将游戏主持人请求分发到正确的导演
 */
export class DirectorDispatcher {
  /** 导演映射 */
  private directors: Map<DirectorRole, IDirector>;
  /** 配置 */
  private config: DispatcherConfig;
  /** 缓存 */
  private cache: Map<string, DirectorDecision>;

  constructor(directors: IDirector[], config: Partial<DispatcherConfig> = {}) {
    this.directors = new Map();
    this.cache = new Map();
    this.config = { ...DEFAULT_DISPATCHER_CONFIG, ...config };

    for (const director of directors) {
      this.directors.set(director.getRole(), director);
    }
  }

  /**
   * 调度请求到相关导演
   */
  async dispatch(request: GameMasterRequest): Promise<DirectorDecision[]> {
    const relevantRoles = this.getRelevantRoles(request.type);
    const context = this.buildContext(request.context, request.type);

    // 构建缓存键
    const cacheKey = this.buildCacheKey(request);
    if (this.config.enableCache && this.cache.has(cacheKey)) {
      return [this.cache.get(cacheKey)!];
    }

    let decisions: DirectorDecision[];

    if (request.parallel !== false) {
      // 并行分发
      decisions = await this.dispatchParallel(relevantRoles, context);
    } else {
      // 串行分发
      decisions = await this.dispatchSequential(relevantRoles, context);
    }

    // 缓存结果
    if (this.config.enableCache && decisions.length > 0) {
      this.cache.set(cacheKey, decisions[0]);
    }

    return decisions;
  }

  /**
   * 并行分发到多个导演
   */
  private async dispatchParallel(
    roles: DirectorRole[],
    context: DirectorContext
  ): Promise<DirectorDecision[]> {
    const promises = roles.map(role => this.dispatchToDirector(role, context));
    return Promise.all(promises);
  }

  /**
   * 串行分发到多个导演
   */
  private async dispatchSequential(
    roles: DirectorRole[],
    context: DirectorContext
  ): Promise<DirectorDecision[]> {
    const decisions: DirectorDecision[] = [];

    for (const role of roles) {
      const decision = await this.dispatchToDirector(role, context);
      decisions.push(decision);
    }

    return decisions;
  }

  /**
   * 分发到单个导演
   */
  private async dispatchToDirector(
    role: DirectorRole,
    context: DirectorContext
  ): Promise<DirectorDecision> {
    const director = this.directors.get(role);

    if (!director) {
      return this.createNullDecision(role);
    }

    try {
      const contextWithRole: DirectorContext = { ...context, role };
      return await director.analyze(contextWithRole);
    } catch (error) {
      console.error(`[Dispatcher] Error dispatching to ${role}:`, error);
      return this.createErrorDecision(role, error);
    }
  }

  /**
   * 根据请求类型获取相关导演角色
   */
  private getRelevantRoles(type: GameMasterRequestType): DirectorRole[] {
    switch (type) {
      case 'full':
        return ['narrative', 'combat', 'judge', 'atmosphere', 'economy'];
      case 'narrative':
        return ['narrative', 'atmosphere'];
      case 'combat':
        return ['combat', 'atmosphere'];
      case 'judge':
        return ['judge', 'atmosphere'];
      case 'atmosphere':
        return ['atmosphere'];
      case 'economy':
        return ['economy'];
      default:
        return [type as DirectorRole];
    }
  }

  /**
   * 构建完整上下文
   */
  private buildContext(
    baseContext: Omit<DirectorContext, 'role'>,
    type: GameMasterRequestType
  ): DirectorContext {
    // 为不同请求类型添加特定上下文
    const extraContext: Record<GameMasterRequestType, Partial<DirectorContext>> = {
      narrative: {},
      combat: {},
      judge: {},
      atmosphere: {},
      economy: {},
      full: {},
    };

    return {
      ...baseContext,
      ...extraContext[type],
      role: 'narrative', // 默认角色
    } as DirectorContext;
  }

  /**
   * 构建缓存键
   */
  private buildCacheKey(request: GameMasterRequest): string {
    const { type, context } = request;
    const stateHash = JSON.stringify(context.gameState).slice(0, 50);
    return `${type}:${stateHash}`;
  }

  /**
   * 创建空决策
   */
  private createNullDecision(role: DirectorRole): DirectorDecision {
    return {
      role,
      decision: 'No director available',
      events: [],
      variables: {},
      confidence: 0,
      reasoning: 'No director registered for this role',
    };
  }

  /**
   * 创建错误决策
   */
  private createErrorDecision(role: DirectorRole, error: unknown): DirectorDecision {
    return {
      role,
      decision: 'Error in decision',
      events: [],
      variables: {},
      confidence: 0,
      reasoning: `Error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  /**
   * 添加导演
   */
  addDirector(director: IDirector): void {
    this.directors.set(director.getRole(), director);
  }

  /**
   * 移除导演
   */
  removeDirector(role: DirectorRole): void {
    this.directors.delete(role);
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 获取调度统计
   */
  getStats(): { directorCount: number; cacheSize: number } {
    return {
      directorCount: this.directors.size,
      cacheSize: this.cache.size,
    };
  }
}
