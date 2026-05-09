/**
 * 会话生命周期域
 *
 * 聚合存读档工作流和会话生命周期工作流的创建调用。
 */

export interface SessionDomainInput {
    // 存读档依赖
    存档格式版本: number;
    自动存档最小间隔毫秒: number;
    深拷贝: any;
    历史记录: any;
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
    记忆系统: any;
    开局配置: any;
    prompts: any;
    游戏初始时间: any;
    gameConfig: any;
    memoryConfig: any;
    获取当前视觉设置快照: any;
    获取当前场景图片档案快照: any;
    获取角色锚点列表: any;
    获取当前角色锚点ID: any;
    获取当前时代信息: any;
    校规系统: any;
    催眠系统: any;
    校园系统: any;
    写真系统: any;
    都市网约车系统: any;
    构建完整地点文本: any;
    规范化环境信息: any;
    规范化世界状态: any;
    规范化战斗状态: any;
    规范化剧情状态: any;
    规范化剧情规划状态: any;
    规范化女主剧情规划状态: any;
    规范化同人剧情规划状态: any;
    规范化同人女主剧情规划状态: any;
    规范化记忆系统: any;
    规范化可选开局配置: any;
    规范化记忆配置: any;
    规范化游戏设置: any;
    规范化视觉设置: any;
    规范化场景图片档案: any;
    规范化角色物品容器映射: any;
    规范化社交列表安全: any;
    获取当前提示词池: any;
    创建开场空白环境: any;
    创建开场空白世界: any;
    创建开场空白战斗: any;
    创建空门派状态: any;
    创建开场空白剧情: any;
    应用并同步记忆系统: any;
    setHasSave: any;
    setGameConfig: any;
    setMemoryConfig: any;
    设置视觉设置: any;
    设置场景图片档案: any;
    设置游戏初始时间: any;
    设置角色锚点列表: any;
    设置当前角色锚点ID: any;
    设置时代信息: any;
    设置校规系统: any;
    设置催眠系统: any;
    设置校园系统: any;
    设置写真系统: any;
    设置都市网约车系统: any;
    setView: any;
    setShowSaveLoad: any;
    设置最近开局配置: any;
    设置角色: any;
    设置环境: any;
    设置社交: any;
    设置世界: any;
    设置战斗: any;
    设置玩家门派: any;
    设置任务列表: any;
    设置约定列表: any;
    设置剧情: any;
    设置剧情规划: any;
    设置女主剧情规划: any;
    设置同人剧情规划: any;
    设置同人女主剧情规划: any;
    设置开局配置: any;
    设置提示词池: any;
    设置历史记录: any;
    清空重Roll快照: any;
    重置自动存档状态: any;
    最近自动存档时间戳Ref: any;
    最近自动存档签名Ref: any;
    读档前重置瞬态状态: any;
    读档后重置上下文: any;
    读档后定位到最新回合: any;
    创建存读档工作流: any;
    // 会话生命周期依赖
    apiConfig: any;
    view: any;
    loading: any;
    最近开局配置: any;
    abortControllerRef: any;
    ensurePromptsLoaded: any;
    setLoading: any;
    setShowSettings: any;
    currentEra: any;
    setWorldEvents: any;
    清空变量生成上下文缓存: any;
    创建开场基础状态: any;
    构建前端清空开场状态: any;
    创建开场命令基态: any;
    创建空剧情规划: any;
    创建空记忆系统: any;
    应用开场基态: any;
    追加系统消息: any;
    替换流式草稿为失败提示: any;
    记录变量生成上下文: any;
    构建系统提示词: any;
    processResponseCommands: any;
    规范化门派状态: any;
    游戏设置启用自动重试: any;
    执行带自动重试的生成请求: any;
    更新流式草稿为自动重试提示: any;
    提取解析失败原始信息: any;
    获取原始AI消息: any;
    估算消息Token: any;
    估算AI输出Token: any;
    计算回复耗时秒: any;
    触发新增NPC自动生图: any;
    触发场景自动生图: any;
    提取新增NPC列表: any;
    设置开局变量生成进度: any;
    设置开局世界演变进度: any;
    设置开局规划进度: any;
    创建会话生命周期工作流: any;
    // 前向引用
    performAutoSaveRef: any;
    // 额外依赖
    内置提示词列表: any;
    世界书列表: any;
    推入重Roll快照: any;
}

export function createSessionDomain(input: SessionDomainInput) {
    const {
        apiConfig,
        存档格式版本,
        自动存档最小间隔毫秒,
        深拷贝,
        历史记录,
        角色,
        环境,
        社交,
        世界,
        战斗,
        玩家门派,
        任务列表,
        约定列表,
        剧情,
        剧情规划,
        女主剧情规划,
        同人剧情规划,
        同人女主剧情规划,
        记忆系统,
        开局配置,
        prompts,
        游戏初始时间,
        gameConfig,
        memoryConfig,
        获取当前视觉设置快照,
        获取当前场景图片档案快照,
        获取角色锚点列表,
        获取当前角色锚点ID,
        获取当前时代信息,
        校规系统,
        催眠系统,
        校园系统,
        写真系统,
        都市网约车系统,
        构建完整地点文本,
        规范化环境信息,
        规范化世界状态,
        规范化战斗状态,
        规范化剧情状态,
        规范化剧情规划状态,
        规范化女主剧情规划状态,
        规范化同人剧情规划状态,
        规范化同人女主剧情规划状态,
        规范化记忆系统,
        规范化可选开局配置,
        规范化记忆配置,
        规范化游戏设置,
        规范化视觉设置,
        规范化场景图片档案,
        规范化角色物品容器映射,
        规范化社交列表安全,
        获取当前提示词池,
        创建开场空白环境,
        创建开场空白世界,
        创建开场空白战斗,
        创建空门派状态,
        创建开场空白剧情,
        应用并同步记忆系统,
        setHasSave,
        setGameConfig,
        setMemoryConfig,
        设置视觉设置,
        设置场景图片档案,
        设置游戏初始时间,
        设置角色锚点列表,
        设置当前角色锚点ID,
        设置时代信息,
        设置校规系统,
        设置催眠系统,
        设置校园系统,
        设置写真系统,
        设置都市网约车系统,
        setView,
        setShowSaveLoad,
        设置最近开局配置,
        设置角色,
        设置环境,
        设置社交,
        设置世界,
        设置战斗,
        设置玩家门派,
        设置任务列表,
        设置约定列表,
        设置剧情,
        设置剧情规划,
        设置女主剧情规划,
        设置同人剧情规划,
        设置同人女主剧情规划,
        设置开局配置,
        设置提示词池,
        设置历史记录,
        清空重Roll快照,
        重置自动存档状态,
        最近自动存档时间戳Ref,
        最近自动存档签名Ref,
        读档前重置瞬态状态,
        读档后重置上下文,
        读档后定位到最新回合,
        创建存读档工作流,
        view,
        loading,
        最近开局配置,
        abortControllerRef,
        ensurePromptsLoaded,
        setLoading,
        setShowSettings,
        currentEra,
        setWorldEvents,
        清空变量生成上下文缓存,
        创建开场基础状态,
        构建前端清空开场状态,
        创建开场命令基态,
        创建空剧情规划,
        创建空记忆系统,
        应用开场基态,
        追加系统消息,
        替换流式草稿为失败提示,
        记录变量生成上下文,
        构建系统提示词,
        processResponseCommands,
        规范化门派状态,
        游戏设置启用自动重试,
        执行带自动重试的生成请求,
        更新流式草稿为自动重试提示,
        提取解析失败原始信息,
        获取原始AI消息,
        估算消息Token,
        估算AI输出Token,
        计算回复耗时秒,
        触发新增NPC自动生图,
        触发场景自动生图,
        提取新增NPC列表,
        设置开局变量生成进度,
        设置开局世界演变进度,
        设置开局规划进度,
        创建会话生命周期工作流,
        performAutoSaveRef,
        内置提示词列表,
        世界书列表,
        推入重Roll快照,
    } = input;

    // --- 存读档工作流 ---
    const saveLoad = 创建存读档工作流({
        存档格式版本,
        自动存档最小间隔毫秒,
        深拷贝,
        历史记录,
        角色,
        环境,
        社交,
        世界,
        战斗,
        玩家门派,
        任务列表,
        约定列表,
        剧情,
        剧情规划,
        女主剧情规划,
        同人剧情规划,
        同人女主剧情规划,
        记忆系统,
        openingConfig: 开局配置,
        提示词池: prompts,
        游戏初始时间,
        gameConfig,
        memoryConfig,
        获取当前视觉设置快照,
        获取当前场景图片档案快照,
        获取角色锚点列表,
        获取当前角色锚点ID,
        获取当前时代信息,
        校规系统,
        催眠系统,
        校园系统,
        写真系统,
        都市网约车系统,
        构建完整地点文本,
        规范化环境信息,
        规范化世界状态,
        规范化战斗状态,
        规范化剧情状态,
        规范化剧情规划状态,
        规范化女主剧情规划状态,
        规范化同人剧情规划状态,
        规范化同人女主剧情规划状态,
        规范化记忆系统,
        规范化可选开局配置,
        规范化记忆配置,
        规范化游戏设置,
        规范化视觉设置,
        规范化场景图片档案,
        规范化角色物品容器映射,
        规范化社交列表: 规范化社交列表安全,
        获取当前提示词池,
        创建开场空白环境,
        创建开场空白世界,
        创建开场空白战斗,
        创建空门派状态,
        创建开场空白剧情,
        应用并同步记忆系统,
        setHasSave,
        setGameConfig,
        setMemoryConfig,
        设置视觉设置,
        设置场景图片档案,
        设置游戏初始时间,
        设置角色锚点列表,
        设置当前角色锚点ID,
        设置时代信息,
        设置校规系统,
        设置催眠系统,
        设置校园系统,
        设置写真系统,
        设置都市网约车系统,
        setView,
        setShowSaveLoad,
        设置最近开局配置,
        设置角色,
        设置环境,
        设置社交,
        设置世界,
        设置战斗,
        设置玩家门派,
        设置任务列表,
        设置约定列表,
        设置剧情,
        设置剧情规划,
        设置女主剧情规划,
        设置同人剧情规划,
        设置同人女主剧情规划,
        设置开局配置,
        设置提示词池,
        设置历史记录,
        清空重Roll快照,
        重置自动存档状态,
        最近自动存档时间戳Ref,
        最近自动存档签名Ref,
        读档前重置瞬态状态,
        读档后重置上下文,
        读档后定位到最新回合
    });

    const { handleSaveGame, performAutoSave, handleLoadGame } = saveLoad;

    // 填充前向引用
    performAutoSaveRef.current = performAutoSave;

    // --- 会话生命周期工作流 ---
    const sessionLifecycle = 创建会话生命周期工作流({
        apiConfig,
        gameConfig,
        memoryConfig,
        view,
        prompts,
        历史记录,
        记忆系统,
        社交,
        环境,
        角色,
        世界,
        战斗,
        玩家门派,
        任务列表,
        约定列表,
        剧情,
        剧情规划,
        女主剧情规划,
        同人剧情规划,
        同人女主剧情规划,
        开局配置,
        内置提示词列表,
        世界书列表,
        loading,
        最近开局配置,
        abortControllerRef,
        ensurePromptsLoaded,
        setView,
        setPrompts: 设置提示词池,
        setLoading,
        setShowSettings,
        设置历史记录,
        设置最近开局配置,
        清空重Roll快照,
        推入重Roll快照,
        重置自动存档状态,
        设置角色,
        设置环境,
        设置游戏初始时间,
        设置社交,
        设置世界,
        设置战斗,
        设置玩家门派,
        设置任务列表,
        设置约定列表,
        设置剧情,
        设置剧情规划,
        设置女主剧情规划,
        设置同人剧情规划,
        设置同人女主剧情规划,
        设置开局配置,
        设置时代信息,
        currentEra,
        setGameConfig,
        设置开局变量生成进度,
        设置开局世界演变进度,
        设置开局规划进度,
        setWorldEvents,
        应用并同步记忆系统,
        清空变量生成上下文缓存,
        创建开场基础状态,
        构建前端清空开场状态,
        创建开场命令基态,
        创建开场空白环境,
        创建开场空白世界,
        创建开场空白战斗,
        创建空门派状态,
        创建开场空白剧情,
        创建空剧情规划,
        创建空记忆系统,
        应用开场基态,
        追加系统消息,
        替换流式草稿为失败提示,
        记录变量生成上下文,
        深拷贝,
        performAutoSave,
        构建系统提示词,
        processResponseCommands,
        规范化环境信息,
        规范化剧情状态,
        规范化剧情规划状态,
        规范化女主剧情规划状态,
        规范化同人剧情规划状态,
        规范化同人女主剧情规划状态,
        规范化角色物品容器映射,
        规范化社交列表: 规范化社交列表安全,
        规范化世界状态,
        规范化战斗状态,
        规范化门派状态,
        游戏设置启用自动重试,
        执行带自动重试的生成请求,
        更新流式草稿为自动重试提示,
        提取解析失败原始信息,
        获取原始AI消息,
        估算消息Token,
        估算AI输出Token,
        计算回复耗时秒,
        触发新增NPC自动生图,
        触发场景自动生图,
        提取新增NPC列表,
        获取当前视觉设置快照,
        获取当前场景图片档案快照
    });

    const {
        handleStartNewGameWizard,
        handleGenerateWorld,
        handleReturnToHome,
        handleQuickRestart
    } = sessionLifecycle;

    return {
        handleSaveGame,
        performAutoSave,
        handleLoadGame,
        handleStartNewGameWizard,
        handleGenerateWorld,
        handleReturnToHome,
        handleQuickRestart,
    };
}
