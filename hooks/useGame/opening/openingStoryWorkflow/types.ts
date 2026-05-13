// Shared types for openingStoryWorkflow subdirectory
export type 开场命令基态 = {
    角色: any;
    环境: any;
    社交: any[];
    世界: any;
    战斗: any;
    玩家门派: any;
    任务列表: any[];
    约定列表: any[];
    剧情: any;
    剧情规划: any;
    女主剧情规划?: any;
    同人剧情规划?: any;
    同人女主剧情规划?: any;
};

export type 自动存档快照结构 = {
    history?: any[];
    role?: any;
    env?: any;
    social?: any[];
    world?: any;
    battle?: any;
    sect?: any;
    tasks?: any[];
    agreements?: any[];
    story?: any;
    storyPlan?: any;
    heroinePlan?: any;
    fandomStoryPlan?: any;
    fandomHeroinePlan?: any;
    memory?: any;
    openingConfig?: any;
    force?: boolean;
};
