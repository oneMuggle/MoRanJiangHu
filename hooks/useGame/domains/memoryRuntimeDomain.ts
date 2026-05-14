/**
 * 记忆与变量运行时域
 *
 * 聚合变量生成队列调度器、变量生成进度系统、记忆总结处理器的创建调用。
 */

export interface MemoryRuntimeDomainInput {
    // 变量生成队列依赖
    执行变量模型校准工作流: any;
    apiConfig: any;
    gameConfig: any;
    创建变量生成队列调度器: any;
    // 变量生成进度依赖
    最近变量生成上下文Ref: any;
    变量生成中: any;
    set变量生成中: any;
    开局变量生成进度: any;
    set开局变量生成进度: any;
    世界演变进行中Ref: any;
    variableGenerationAbortControllerRef: any;
    深拷贝: any;
    创建变量生成进度系统: any;
    // 记忆总结依赖
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
    社交: any;
    设置社交: any;
    记忆系统: any;
    设置记忆系统: any;
    memoryConfig: any;
    历史记录: any;
    performAutoSaveRef: any;
    创建记忆总结处理器: any;
    规范化社交列表: any;
    onAutoQueueComplete?: (result: { 成功: string[]; 失败: { 名称: string; 原因: string }[] }) => void;
}

export function createMemoryRuntimeDomain(input: MemoryRuntimeDomainInput) {
    const {
        执行变量模型校准工作流, apiConfig, gameConfig,
        创建变量生成队列调度器,
        最近变量生成上下文Ref, 变量生成中, set变量生成中,
        开局变量生成进度, set开局变量生成进度,
        世界演变进行中Ref, variableGenerationAbortControllerRef,
        深拷贝, 创建变量生成进度系统,
        待处理记忆总结任务, set待处理记忆总结任务,
        记忆总结阶段, set记忆总结阶段,
        记忆总结草稿, set记忆总结草稿,
        记忆总结错误, set记忆总结错误,
        待处理NPC记忆总结队列, set待处理NPC记忆总结队列,
        NPC记忆总结阶段, setNPC记忆总结阶段,
        NPC记忆总结草稿, setNPC记忆总结草稿,
        NPC记忆总结错误, setNPC记忆总结错误,
        社交, 设置社交, 记忆系统, 设置记忆系统,
        memoryConfig, 历史记录, performAutoSaveRef,
        创建记忆总结处理器, 规范化社交列表,
    } = input;

    // --- 变量生成队列调度器 ---
    const 变量生成队列调度器 = 创建变量生成队列调度器({
        执行变量模型校准工作流,
        apiConfig,
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

    const { 序列化变量校准命令, 清空变量生成上下文缓存, 记录变量生成上下文, 收集最近变量生成上下文, 等待世界演变空闲, handleCancelVariableGeneration } = 变量生成进度系统;

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
        memoryConfig,
        apiConfig,
        历史记录,
        performAutoSave: (...args: any[]) => performAutoSaveRef.current?.(...args),
        规范化社交列表,
        onAutoQueueComplete: input.onAutoQueueComplete,
    });

    const { handleStartMemorySummary, handleCancelMemorySummary, handleBackToMemorySummaryRemind, handleUpdateMemorySummaryDraft, handleStartManualMemorySummary, handleApplyMemorySummary, 刷新NPC记忆总结队列, 应用并同步记忆系统, handleStartNpcMemorySummary, handleCancelNpcMemorySummary, handleBackToNpcMemorySummaryRemind, handleUpdateNpcMemorySummaryDraft, handleQueueManualNpcMemorySummary, handleApplyNpcMemorySummary, 自动处理NPC记忆队列 } = 记忆总结处理器;

    return {
        序列化变量校准命令, 清空变量生成上下文缓存, 记录变量生成上下文,
        收集最近变量生成上下文, 等待世界演变空闲, handleCancelVariableGeneration,
        handleStartMemorySummary, handleCancelMemorySummary,
        handleBackToMemorySummaryRemind, handleUpdateMemorySummaryDraft,
        handleStartManualMemorySummary, handleApplyMemorySummary,
        刷新NPC记忆总结队列, 应用并同步记忆系统,
        handleStartNpcMemorySummary, handleCancelNpcMemorySummary,
        handleBackToNpcMemorySummaryRemind, handleUpdateNpcMemorySummaryDraft,
        handleQueueManualNpcMemorySummary, handleApplyNpcMemorySummary,
        自动处理NPC记忆队列,
    };
}
