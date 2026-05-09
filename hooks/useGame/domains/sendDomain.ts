/**
 * 核心发送域
 *
 * 聚合命令处理、世界演变更新、规划更新、上下文快照、主剧情发送、私聊发送工作流。
 */

export interface SendDomainInput {
    // 状态
    角色: any;
    环境: any;
    社交: any;
    世界: any;
    战斗: any;
    玩家门派: any;
    任务列表: any;
    约定列表: any;
    剧情: any;
    剧情规划: any;
    女主剧情规划: any;
    同人剧情规划: any;
    同人女主剧情规划: any;
    历史记录: any;
    记忆系统: any;
    开局配置: any;
    校规系统: any;
    催眠系统: any;
    校园系统: any;
    写真系统: any;
    都市网约车系统: any;
    currentEra: any;
    loading: any;
    gameConfig: any;
    apiConfig: any;
    memoryConfig: any;
    visualConfig: any;
    场景图片档案: any;
    prompts: any;
    内置提示词列表: any;
    世界书列表: any;
    设备状态Messages: any;
    设备状态Notifications: any;
    // 设置器
    设置角色: any;
    设置环境: any;
    设置社交: any;
    设置世界: any;
    设置战斗: any;
    设置玩家门派: any;
    设置任务列表: any;
    设置约定列表: any;
    设置剧情: any;
    设置历史记录: any;
    设置剧情规划: any;
    设置女主剧情规划: any;
    设置同人剧情规划: any;
    设置同人女主剧情规划: any;
    设置校园系统: any;
    设置写真系统: any;
    设置都市网约车系统: any;
    setLoading: any;
    setShowSettings: any;
    setWorldEvents: any;
    set世界演变更新中: any;
    set世界演变状态文本: any;
    set世界演变最近更新时间: any;
    set世界演变最近摘要: any;
    set世界演变最近原始消息: any;
    set开局变量生成进度: any;
    set开局世界演变进度: any;
    set开局规划进度: any;
    // Refs
    abortControllerRef: any;
    variableGenerationAbortControllerRef: any;
    世界演变进行中Ref: any;
    世界演变去重签名Ref: any;
    世界演变最近现实更新时间戳Ref: any;
    上下文快照缓存Ref: any;
    performAutoSaveRef: any;
    // 工具函数
    规范化环境信息: any;
    规范化社交列表安全: any;
    规范化世界状态: any;
    规范化战斗状态: any;
    规范化门派状态: any;
    规范化剧情状态: any;
    规范化剧情规划状态: any;
    规范化女主剧情规划状态: any;
    规范化同人剧情规划状态: any;
    规范化同人女主剧情规划状态: any;
    规范化角色物品容器映射: any;
    深拷贝: any;
    按回合窗口裁剪历史: any;
    战斗结束自动清空: any;
    构建系统提示词: any;
    应用并同步记忆系统: any;
    执行正文润色: any;
    执行变量自动校准: any;
    变量生成功能已启用: any;
    执行世界演变更新工作流: any;
    已进入主剧情回合: any;
    追加系统消息: any;
    收集最近完整正文回合: any;
    构建最近完整正文上下文: any;
    去重文本数组: any;
    收集女主规划时间触发原因: any;
    收集女主正文命中原因: any;
    收集剧情规划时间触发原因: any;
    收集剧情正文命中原因: any;
    提取响应完整正文文本: any;
    游戏设置启用自动重试: any;
    执行带自动重试的生成请求: any;
    更新流式草稿为自动重试提示: any;
    提取解析失败原始信息: any;
    提取原始报错详情: any;
    格式化错误详情: any;
    获取原始AI消息: any;
    估算消息Token: any;
    估算AI输出Token: any;
    计算回复耗时秒: any;
    触发新增NPC自动生图: any;
    触发场景自动生图: any;
    应用常驻壁纸为背景: any;
    提取新增NPC列表: any;
    推入重Roll快照: any;
    弹出重Roll快照: any;
    回档到快照: any;
    执行变量生成并合并响应: any;
    派生设备模式: any;
    构建BDSM状态更新回调: any;
    构建BDSM见面预约更新回调: any;
    ensurePromptsLoaded: any;
    // 外部传入（已在 创建历史回合工作流 之前创建）
    processResponseCommands: any;
    // 工作流工厂
    创建规划更新工作流: any;
    创建上下文快照工作流: any;
    创建主剧情发送工作流: any;
    创建私聊发送工作流: any;
}

export function createSendDomain(input: SendDomainInput) {
    const {
        角色, 环境, 社交, 世界, 战斗, 玩家门派, 任务列表, 约定列表,
        剧情, 剧情规划, 女主剧情规划, 同人剧情规划, 同人女主剧情规划,
        历史记录, 记忆系统, 开局配置, 校规系统, 催眠系统, 校园系统,
        写真系统, 都市网约车系统, currentEra, loading, gameConfig, apiConfig,
        memoryConfig, visualConfig, 场景图片档案, prompts, 内置提示词列表, 世界书列表,
        设备状态Messages, 设备状态Notifications,
        设置角色, 设置环境, 设置社交, 设置世界, 设置战斗, 设置玩家门派,
        设置任务列表, 设置约定列表, 设置剧情, 设置历史记录, 设置剧情规划, 设置女主剧情规划,
        设置同人剧情规划, 设置同人女主剧情规划, 设置校园系统, 设置写真系统,
        设置都市网约车系统, setLoading, setShowSettings, setWorldEvents,
        set世界演变更新中, set世界演变状态文本, set世界演变最近更新时间,
        set世界演变最近摘要, set世界演变最近原始消息,
        set开局变量生成进度, set开局世界演变进度, set开局规划进度,
        abortControllerRef, variableGenerationAbortControllerRef,
        世界演变进行中Ref, 世界演变去重签名Ref, 世界演变最近现实更新时间戳Ref,
        上下文快照缓存Ref, performAutoSaveRef,
        规范化环境信息, 规范化社交列表安全, 规范化世界状态, 规范化战斗状态,
        规范化门派状态, 规范化剧情状态, 规范化剧情规划状态, 规范化女主剧情规划状态,
        规范化同人剧情规划状态, 规范化同人女主剧情规划状态, 规范化角色物品容器映射,
        深拷贝, 按回合窗口裁剪历史, 战斗结束自动清空,
        构建系统提示词, 应用并同步记忆系统, 执行正文润色,
        执行变量自动校准, 变量生成功能已启用, 执行世界演变更新工作流,
        已进入主剧情回合, 追加系统消息,
        收集最近完整正文回合, 构建最近完整正文上下文, 去重文本数组,
        收集女主规划时间触发原因, 收集女主正文命中原因,
        收集剧情规划时间触发原因, 收集剧情正文命中原因,
        提取响应完整正文文本,
        游戏设置启用自动重试, 执行带自动重试的生成请求,
        更新流式草稿为自动重试提示, 提取解析失败原始信息,
        提取原始报错详情, 格式化错误详情, 获取原始AI消息,
        估算消息Token, 估算AI输出Token, 计算回复耗时秒,
        触发新增NPC自动生图, 触发场景自动生图, 应用常驻壁纸为背景,
        提取新增NPC列表, 推入重Roll快照, 弹出重Roll快照, 回档到快照,
        执行变量生成并合并响应, 派生设备模式,
        构建BDSM状态更新回调, 构建BDSM见面预约更新回调,
        ensurePromptsLoaded,
        processResponseCommands,
        创建规划更新工作流, 创建上下文快照工作流,
        创建主剧情发送工作流, 创建私聊发送工作流,
    } = input;

    // --- 世界演变更新 ---
    const 执行世界演变更新 = async (params?: {
        来源?: 'manual' | 'auto_due' | 'story_dynamic' | 'story_dynamic_and_due';
        动态世界线索?: string[];
        到期摘要?: string[];
        force?: boolean;
        currentResponse?: any;
        stateBase?: any;
    }) => 执行世界演变更新工作流(
        params,
        {
            apiSettings: apiConfig,
            gameConfig,
            角色, 环境, 世界, 剧情, 记忆系统, 历史记录,
            prompts,
            开局配置,
            worldbooks: 世界书列表,
            世界演变进行中Ref,
            世界演变去重签名Ref,
            已进入主剧情回合,
            按回合窗口裁剪历史,
            规范化环境信息,
            规范化世界状态,
            规范化剧情状态,
            processResponseCommands,
            setWorldEvents,
            set世界演变更新中,
            set世界演变状态文本,
            set世界演变最近更新时间,
            set世界演变最近摘要,
            set世界演变最近原始消息,
            追加系统消息
        }
    );

    // --- 规划更新工作流 ---
    const { 后台执行统一规划分析 } = 创建规划更新工作流({
        apiConfig, gameConfig,
        角色, 环境, 世界, 战斗, 玩家门派, 任务列表, 约定列表, 历史记录,
        开局配置, prompts,
        worldbooks: 世界书列表,
        规范化环境信息,
        规范化社交列表: 规范化社交列表安全,
        规范化世界状态, 规范化战斗状态, 规范化门派状态,
        规范化剧情状态, 规范化剧情规划状态, 规范化女主剧情规划状态,
        规范化同人剧情规划状态, 规范化同人女主剧情规划状态,
        深拷贝,
        收集最近完整正文回合, 构建最近完整正文上下文,
        去重文本数组,
        收集女主规划时间触发原因, 收集女主正文命中原因,
        收集剧情规划时间触发原因, 收集剧情正文命中原因,
        提取响应完整正文文本,
        设置剧情, 设置剧情规划, 设置女主剧情规划,
        设置同人剧情规划, 设置同人女主剧情规划,
        performAutoSave: (...args: any[]) => performAutoSaveRef.current?.(...args)
    });

    // --- 上下文快照 ---
    const { buildContextSnapshot } = 创建上下文快照工作流({
        apiConfig, gameConfig, memoryConfig,
        prompts, 内置提示词列表, 世界书列表,
        记忆系统, 历史记录, 社交, 角色, 环境, 世界, 战斗,
        玩家门派, 任务列表, 约定列表, 剧情, 剧情规划,
        女主剧情规划, 同人剧情规划, 同人女主剧情规划,
        开局配置, 校规系统, 催眠系统, 校园系统,
        currentEra,
        上下文快照缓存Ref,
        构建系统提示词,
        规范化环境信息,
        规范化剧情状态, 规范化剧情规划状态, 规范化女主剧情规划状态,
        规范化同人剧情规划状态, 规范化同人女主剧情规划状态,
        按回合窗口裁剪历史
    });

    // --- 主剧情发送工作流 ---
    const { handleSend } = 创建主剧情发送工作流({
        历史记录, 记忆系统, 角色, 环境, 社交, 世界, 战斗,
        玩家门派, 任务列表, 约定列表, 剧情, 剧情规划,
        女主剧情规划, 同人剧情规划, 同人女主剧情规划,
        开局配置, 校规系统, 催眠系统, 校园系统,
        currentEra, loading, gameConfig, apiConfig, memoryConfig,
        visualConfig, 场景图片档案, prompts,
        内置提示词列表, 世界书列表,
        设备状态Messages, 设备状态Notifications,
        abortControllerRef, variableGenerationAbortControllerRef,
        setLoading, setShowSettings,
        设置剧情, 设置历史记录,
        应用并同步记忆系统,
        构建系统提示词,
        processResponseCommands,
        performAutoSave: (...args: any[]) => performAutoSaveRef.current?.(...args),
        执行正文润色, 执行世界演变更新,
        触发新增NPC自动生图, 触发场景自动生图,
        应用常驻壁纸为背景, 提取新增NPC列表,
        推入重Roll快照,
        弹出重Roll快照: () => 弹出重Roll快照() || undefined,
        回档到快照, 深拷贝, 按回合窗口裁剪历史,
        规范化环境信息, 规范化剧情状态, 规范化剧情规划状态,
        规范化女主剧情规划状态, 规范化同人剧情规划状态,
        规范化同人女主剧情规划状态, 规范化世界状态,
        游戏设置启用自动重试, 执行带自动重试的生成请求,
        更新流式草稿为自动重试提示, 提取解析失败原始信息,
        提取原始报错详情, 格式化错误详情, 获取原始AI消息,
        估算消息Token, 估算AI输出Token, 计算回复耗时秒,
        文章优化功能已开启: 游戏设置启用自动重试,
        后台执行统一规划分析, 执行变量生成并合并响应,
        派生设备模式,
        onBDSM状态更新: 构建BDSM状态更新回调(gameConfig?.校园NSFW设置),
        onBDSM见面预约更新: 构建BDSM见面预约更新回调(),
        set开局变量生成进度, set开局世界演变进度, set开局规划进度,
        ensurePromptsLoaded,
    });

    // --- 私聊发送工作流 ---
    const { handlePrivateChatSend } = 创建私聊发送工作流({
        apiConfig, 校园系统, 角色, 设置校园系统
    });

    return {
        执行世界演变更新,
        后台执行统一规划分析,
        buildContextSnapshot,
        handleSend,
        handlePrivateChatSend,
    };
}
