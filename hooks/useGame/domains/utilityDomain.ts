/**
 * 工具域
 *
 * 聚合设置操作、通知系统、设备系统、旅行交易、背景图监控、NSFW 初始化、追加系统消息。
 */

import type { GameStateAccess, GameStateSlice } from '../state/gameStateAccess';
import type { UseGameRefs } from '../state/refRegistry';
import type { ThemePreset } from '../../../models/theme-visual';
import type { 视觉设置结构 } from '../../../types';
import type { 游戏设置结构, 聊天记录结构 } from '../../../types';
import type { NPC生图任务记录, 场景生图任务记录 } from '../../../models/imageGeneration';
import type { NPC结构 } from '../../../models/social';
import type { 校园系统数据 } from '../../../models/campusPhone';
import type { 写真NSFW设置 } from '../../../models/photographyNSFW';
import type { 都市网约车NSFW设置 } from '../../../models/urbanDriverNSFW';
import { useSettingsActions } from '../useSettingsActions';
import { 创建通知系统, type 右下角提示结构 } from '../ui/notificationSystem';
import { useDevice } from '../useDevice';
import { useTravelAndTrade } from '../useTravelAndTrade';
import { useBackgroundImageMonitor } from '../quality/backgroundImageMonitor';
import { useNSFW系统初始化 } from '../nsfw/nsfwSystemInitialization';
import { 创建追加系统消息 } from '../time/timeInitialization';

export interface UtilityDomainInput {
    // useSettingsActions 依赖
    visualConfigRef: UseGameRefs['visualConfigRef'];
    setVisualConfig: GameStateAccess['setVisualConfig'];
    场景图片档案Ref: UseGameRefs['场景图片档案Ref'];
    set场景图片档案: GameStateAccess['set场景图片档案'];
    时代信息Ref: UseGameRefs['时代信息Ref'];
    set时代信息: GameStateAccess['set时代信息'];
    imageManagerConfigRef: UseGameRefs['imageManagerConfigRef'];
    setImageManagerConfig: GameStateAccess['setImageManagerConfig'];
    setCurrentEra: GameStateAccess['setCurrentEra'];
    setCurrentTheme: (theme: ThemePreset) => void;
    set右下角提示列表: GameStateAccess['set右下角提示列表'];
    useSettingsActions: typeof useSettingsActions;
    // 通知系统
    创建通知系统: typeof 创建通知系统;
    // useDevice 依赖
    gameConfig: 游戏设置结构 | null;
    currentEra: number;
    角色: GameStateAccess['角色'];
    社交: NPC结构[];
    世界: GameStateAccess['世界'];
    剧情: GameStateAccess['剧情'];
    历史记录: 聊天记录结构[];
    校规系统: GameStateSlice['校规系统'];
    催眠系统: GameStateSlice['催眠系统'];
    校园系统: 校园系统数据 | null;
    设置校园系统: GameStateAccess['设置校园系统'];
    apiConfig: GameStateAccess['apiConfig'];
    useDevice: typeof useDevice;
    // useTravelAndTrade 依赖
    环境: GameStateAccess['环境'];
    设置角色: GameStateAccess['设置角色'];
    设置环境: GameStateAccess['设置环境'];
    useTravelAndTrade: typeof useTravelAndTrade;
    // useBackgroundImageMonitor 依赖
    NPC生图任务队列: NPC生图任务记录[];
    场景生图任务队列: 场景生图任务记录[];
    useBackgroundImageMonitor: typeof useBackgroundImageMonitor;
    // useNSFW系统初始化 依赖
    都市网约车系统: 都市网约车NSFW设置 | null;
    写真系统: 写真NSFW设置 | null;
    设置都市网约车系统: GameStateAccess['设置都市网约车系统'];
    设置写真系统: GameStateAccess['设置写真系统'];
    useNSFW系统初始化: typeof useNSFW系统初始化;
    // 追加系统消息依赖
    创建追加系统消息: typeof 创建追加系统消息;
    设置历史记录: GameStateAccess['设置历史记录'];
    // set世界演变最近更新时间 依赖
    set世界演变最近更新时间State: GameStateAccess['set世界演变最近更新时间State'];
    世界演变最近现实更新时间戳Ref: UseGameRefs['世界演变最近现实更新时间戳Ref'];
}

export function createUtilityDomain(input: UtilityDomainInput) {
    const {
        visualConfigRef, setVisualConfig,
        场景图片档案Ref, set场景图片档案,
        时代信息Ref, set时代信息,
        imageManagerConfigRef, setImageManagerConfig,
        setCurrentEra, setCurrentTheme,
        set右下角提示列表,
        useSettingsActions: _useSettingsActions,
        创建通知系统: _创建通知系统,
        gameConfig, currentEra, 角色, 社交, 世界, 剧情,
        历史记录, 校规系统, 催眠系统, 校园系统,
        设置校园系统, apiConfig, useDevice: _useDevice,
        环境, 设置角色, 设置环境, useTravelAndTrade: _useTravelAndTrade,
        NPC生图任务队列, 场景生图任务队列,
        useBackgroundImageMonitor: _useBackgroundImageMonitor,
        都市网约车系统, 写真系统,
        设置都市网约车系统, 设置写真系统,
        useNSFW系统初始化: _useNSFW系统初始化,
        创建追加系统消息: _创建追加系统消息, 设置历史记录,
        set世界演变最近更新时间State,
        世界演变最近现实更新时间戳Ref,
    } = input;

    // --- useSettingsActions ---
    const settingsActions = _useSettingsActions({
        visualConfigRef: visualConfigRef as React.MutableRefObject<视觉设置结构>,
        setVisualConfig,
        场景图片档案Ref,
        set场景图片档案,
        时代信息Ref,
        set时代信息,
        imageManagerConfigRef,
        setImageManagerConfig,
        setCurrentEra,
        setCurrentTheme,
        set右下角提示列表,
    });
    const { 深拷贝, 应用视觉设置到状态, 应用场景图片档案到状态, 应用时代信息到状态, 处理时代变更, 应用图片管理设置到状态, 关闭右下角提示 } = settingsActions;

    // --- 通知系统 ---
    const 通知系统 = _创建通知系统(set右下角提示列表);
    const 推送右下角提示 = 通知系统.推送右下角提示;

    // --- useDevice ---
    const device = _useDevice({
        gameConfig,
        currentEra: String(currentEra),
        角色,
        社交,
        世界,
        剧情,
        历史记录,
        校规系统,
        催眠系统,
        校园系统,
        设置校园系统,
        apiConfig,
        推送右下角提示: (toast: Omit<右下角提示结构, 'id'>) => 推送右下角提示(toast),
    });
    const {
        设备状态,
        设备关闭,
        设备返回主页,
        设备打开应用,
        设备打开,
        派生设备模式,
    } = device;

    // --- useTravelAndTrade ---
    const travelAndTrade = _useTravelAndTrade({
        角色,
        环境,
        设置角色,
        设置环境,
        gameConfig,
        currentEra,
        设置历史记录,
    });
    const {
        handleTravel,
        handleExplore,
        handleBuyItem,
        handleSellItem,
        handleForgeItem,
        getForgeRecipes,
        checkForgeMaterials,
        getForgeSuccessRate,
    } = travelAndTrade;

    // --- useBackgroundImageMonitor ---
    _useBackgroundImageMonitor({
        推送右下角提示,
        NPC生图任务队列,
        场景生图任务队列
    });

    // --- useNSFW系统初始化 ---
    _useNSFW系统初始化({
        gameConfig,
        校园系统,
        都市网约车系统,
        写真系统,
        角色,
        社交,
        设置校园系统,
        设置都市网约车系统,
        设置写真系统,
    });

    // --- 追加系统消息 ---
    const 追加系统消息 = _创建追加系统消息(设置历史记录);

    // --- set世界演变最近更新时间 封装 ---
    const set世界演变最近更新时间 = (value: string | null) => {
        set世界演变最近更新时间State(value);
        世界演变最近现实更新时间戳Ref.current = Date.now();
    };

    return {
        深拷贝, 应用视觉设置到状态, 应用场景图片档案到状态,
        应用时代信息到状态, 处理时代变更, 应用图片管理设置到状态,
        关闭右下角提示,
        推送右下角提示,
        设备状态,
        设备关闭, 设备返回主页, 设备打开应用, 设备打开, 派生设备模式,
        handleTravel, handleExplore, handleBuyItem, handleSellItem,
        handleForgeItem, getForgeRecipes, checkForgeMaterials, getForgeSuccessRate,
        追加系统消息,
        set世界演变最近更新时间,
    };
}
