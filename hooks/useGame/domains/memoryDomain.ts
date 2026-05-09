/**
 * 记忆与变量域
 *
 * 聚合记忆总结处理器、变量生成进度系统、变量生成队列调度器、
 * 变量校准协调器的创建调用。
 */

export interface MemoryDomainInput {
    // 记忆总结状态
    待处理记忆总结任务: any;
    set待处理记忆总结任务: any;
    记忆总结阶段: any;
    set记忆总结阶段: any;
    记忆总结草稿: any;
    set记忆总结草稿: any;
    记忆总结错误: any;
    set记忆总结错误: any;
    待处理NPC记忆总结队列: any;
    set待处理NPC记忆总结队列: any;
    NPC记忆总结阶段: any;
    setNPC记忆总结阶段: any;
    NPC记忆总结草稿: any;
    setNPC记忆总结草稿: any;
    NPC记忆总结错误: any;
    setNPC记忆总结错误: any;
    // 变量生成状态
    变量生成中: any;
    set变量生成中: any;
    开局变量生成进度: any;
    set开局变量生成进度: any;
    世界演变进行中Ref: any;
    variableGenerationAbortControllerRef: any;
    // 游戏状态
    社交: any;
    设置社交: any;
    记忆系统: any;
    设置记忆系统: any;
    记忆配置: any;
    api配置: any;
    历史记录: any;
    gameConfig: any;
    prompts: any;
    开局配置: any;
    内置提示词列表: any;
    世界书列表: any;
    // Refs
    最近变量生成上下文Ref: any;
    // 工具函数
    深拷贝: any;
    规范化社交列表: any;
    创建记忆总结处理器: any;
    创建变量生成进度系统: any;
    创建变量生成队列调度器: any;
    创建变量校准协调器: any;
    执行变量模型校准工作流: any;
    合并变量校准结果到响应: any;
    世界演变功能已开启: any;
    变量生成功能已启用: any;
    获取变量计算接口配置: any;
    接口配置是否可用: any;
    获取变量生成并发配置: any;
    performAutoSave: any;
    使用快照重建解析回合: any;
}

export function createMemoryDomain(input: MemoryDomainInput) {
    const {
        待处理记忆总结任务, set待处理记忆总结任务,
        记忆总结阶段, set记忆总结阶段, 记忆总结草稿, set记忆总结草稿,
        记忆总结错误, set记忆总结错误,
        待处理NPC记忆总结队列, set待处理NPC记忆总结队列,
        NPC记忆总结阶段, setNPC记忆总结阶段,
        NPC记忆总结草稿, setNPC记忆总结草稿,
        NPC记忆总结错误, setNPC记忆总结错误,
        变量生成中, set变量生成中,
        开局变量生成进度, set开局变量生成进度,
        世界演变进行中Ref, variableGenerationAbortControllerRef,
        社交, 设置社交, 记忆系统, 设置记忆系统,
        记忆配置, api配置, 历史记录, gameConfig, prompts,
        开局配置, 内置提示词列表, 世界书列表,
        最近变量生成上下文Ref,
        深拷贝, 规范化社交列表,
        创建记忆总结处理器, 创建变量生成进度系统,
        创建变量生成队列调度器, 创建变量校准协调器,
        执行变量模型校准工作流, 合并变量校准结果到响应,
        世界演变功能已开启, 变量生成功能已启用,
        获取变量计算接口配置, 接口配置是否可用,
        获取变量生成并发配置, performAutoSave,
        使用快照重建解析回合,
    } = input;

    // --- 变量生成队列调度器 ---
    const 变量生成队列调度器 = 创建变量生成队列调度器({
        执行变量模型校准工作流,
        apiConfig: api配置,
        gameConfig
    });

    // --- 变量生成进度系统 ---
    const 变量生成进度系统 = 创建变量生成进度系统({
        最近变量生成上下文Ref,
        变量生成中,
        set变量生成中,
        开局变量生成进度,
        set开局变量生成进度,
        世界演变进行中Ref,
        variableGenerationAbortControllerRef,
        深拷贝,
        队列调度器: 变量生成队列调度器
    });

    const {
        序列化变量校准命令: 变量序列化命令,
        清空变量生成上下文缓存,
        记录变量生成上下文,
        收集最近变量生成上下文: 变量收集上下文,
        等待世界演变空闲: 变量等待空闲,
        handleCancelVariableGeneration
    } = 变量生成进度系统;

    // --- 记忆总结处理器 ---
    const 记忆总结处理器 = 创建记忆总结处理器({
        待处理记忆总结任务,
        set待处理记忆总结任务,
        记忆总结阶段,
        set记忆总结阶段,
        记忆总结草稿,
        set记忆总结草稿,
        记忆总结错误,
        set记忆总结错误,
        待处理NPC记忆总结队列,
        set待处理NPC记忆总结队列,
        NPC记忆总结阶段,
        setNPC记忆总结阶段,
        NPC记忆总结草稿,
        setNPC记忆总结草稿,
        NPC记忆总结错误,
        setNPC记忆总结错误,
        社交,
        设置社交,
        记忆系统,
        设置记忆系统,
        memoryConfig: 记忆配置,
        apiConfig: api配置,
        历史记录,
        performAutoSave: (...args: any[]) => performAutoSave(...args),
        规范化社交列表
    });

    const {
        handleStartMemorySummary, handleCancelMemorySummary,
        handleBackToMemorySummaryRemind, handleUpdateMemorySummaryDraft,
        handleStartManualMemorySummary, handleApplyMemorySummary,
        刷新NPC记忆总结队列, 应用并同步记忆系统,
        handleStartNpcMemorySummary, handleCancelNpcMemorySummary,
        handleBackToNpcMemorySummaryRemind, handleUpdateNpcMemorySummaryDraft,
        handleQueueManualNpcMemorySummary, handleApplyNpcMemorySummary
    } = 记忆总结处理器;

    // --- 变量校准协调器 ---
    const 变量校准协调器 = 创建变量校准协调器({
        apiConfig: api配置,
        gameConfig,
        prompts,
        开局配置,
        内置提示词列表,
        世界书列表,
        世界演变进行中Ref,
        variableGenerationAbortControllerRef,
        set变量生成中,
        深拷贝,
        世界演变功能已开启,
        等待世界演变空闲: 变量等待空闲,
        收集最近变量生成上下文: 变量收集上下文,
        执行变量模型校准工作流,
        合并变量生成结果到响应: 合并变量校准结果到响应,
        变量生成功能已启用,
        获取变量计算接口配置,
        接口配置是否可用,
        序列化变量生成命令: 变量序列化命令,
        使用快照重建解析回合
    }, 获取变量生成并发配置(gameConfig));

    const {
        执行变量校准并合并响应: 执行变量生成并合并响应,
        执行重解析变量校准: 执行重解析变量生成
    } = 变量校准协调器;

    return {
        记忆总结处理器: {
            handleStartMemorySummary, handleCancelMemorySummary,
            handleBackToMemorySummaryRemind, handleUpdateMemorySummaryDraft,
            handleStartManualMemorySummary, handleApplyMemorySummary,
            刷新NPC记忆总结队列, 应用并同步记忆系统,
            handleStartNpcMemorySummary, handleCancelNpcMemorySummary,
            handleBackToNpcMemorySummaryRemind, handleUpdateNpcMemorySummaryDraft,
            handleQueueManualNpcMemorySummary, handleApplyNpcMemorySummary
        },
        变量生成进度系统: {
            序列化变量校准命令: 变量序列化命令,
            清空变量生成上下文缓存,
            记录变量生成上下文,
            收集最近变量生成上下文: 变量收集上下文,
            等待世界演变空闲: 变量等待空闲,
            handleCancelVariableGeneration
        },
        变量校准协调器: {
            执行变量生成并合并响应,
            执行重解析变量生成
        }
    };
}
