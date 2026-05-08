/**
 * 设备子系统 Hook
 * 管理移动设备状态、刷新任务队列、设备打开/关闭/应用导航
 */
import { useCallback } from 'react';
import type { DeviceState } from '../../models/mobileDevice';
import type { 当前可用接口结构 } from '../../utils/apiConfig';
import type { 校园系统数据 } from '../../models/campusPhone';
import type { 校园NSFW设置 } from '../../models/campusNSFW';
import type { 角色数据结构 } from '../../models/character';
import type { NPC结构 } from '../../models/social';
import type { 世界数据结构 } from '../../models/world';
import type { 剧情系统结构 } from '../../models/story';
import type { 聊天记录结构 } from '../../types';
import { useDeviceRefreshMonitor, type 设备刷新任务 } from './device/deviceRefreshMonitor';
import { useDeviceFromStore } from './subsystems/zustandStore';

interface UseDeviceDeps {
    gameConfig: any;
    currentEra: string;
    角色: 角色数据结构 | null;
    社交: NPC结构[];
    世界: 世界数据结构 | null;
    剧情: 剧情系统结构 | null;
    历史记录: 聊天记录结构[];
    校规系统: any;
    催眠系统: any;
    校园系统: 校园系统数据 | null;
    设置校园系统: (updater: (prev: 校园系统数据) => 校园系统数据) => void;
    apiConfig: any;
    推送右下角提示: (toast: { title: string; message: string; tone?: 'info' | 'success' | 'error' }) => void;
}

export function useDevice(deps: UseDeviceDeps) {
    const {
        gameConfig, currentEra,
        角色, 社交, 世界, 剧情, 历史记录,
        校规系统, 催眠系统, 校园系统,
        设置校园系统, apiConfig, 推送右下角提示,
    } = deps;

    // --- Zustand Device Slice ---
    const deviceStore = useDeviceFromStore();
    const 设备状态 = deviceStore.state.设备状态;
    const set设备状态 = deviceStore.actions.set设备状态;
    const 设备刷新任务队列 = deviceStore.state.设备刷新任务队列;
    const set设备刷新任务队列 = deviceStore.actions.set设备刷新任务队列;

    /** 根据 gameConfig 推导设备模式 */
    const 派生设备模式 = useCallback((): 'normal' | 'li' => {
        const perEra = gameConfig?.启用子纪元里模式;
        if (perEra && currentEra in perEra) {
            return perEra[currentEra] ? 'li' : 'normal';
        }
        return 'normal';
    }, [gameConfig, currentEra]);

    // 设备打开：打开时同步设置当前时代的里模式状态
    const 设备打开 = useCallback(() => {
        const mode = 派生设备模式();
        set设备状态((prev) => ({ ...prev, isOpen: true, mode }));
    }, [派生设备模式]);

    // 设备关闭
    const 设备关闭 = useCallback(() => {
        set设备状态((prev) => ({ ...prev, isOpen: false, activeApp: null }));
    }, []);

    // 设备返回主页
    const 设备返回主页 = useCallback(() => {
        set设备状态((prev) => ({ ...prev, activeApp: null }));
    }, []);

    // 设备打开应用
    const 设备打开应用 = useCallback((app: string) => {
        set设备状态((prev) => ({ ...prev, isOpen: true, activeApp: app as any }));
    }, []);

    // 设置设备状态（通用 setter 委托）
    const 设置设备状态委托 = useCallback((updater: (prev: DeviceState) => DeviceState) => {
        set设备状态(updater);
    }, []);

    // 后台设备刷新监控
    const nsfw设置 = gameConfig?.校园NSFW设置 || { 启用BDSM论坛: true, BDSM内容强度: '轻度' };
    const 设备消息接口配置 = (): 当前可用接口结构 | null => {
        const { 获取设备消息接口配置 } = require('../../utils/apiConfig');
        return 获取设备消息接口配置(apiConfig);
    };
    const 设备消息接口 = 设备消息接口配置();
    const 设备刷新GameContext = {
        角色: 角色 || null,
        社交: 社交 || [],
        世界: 世界 || null,
        剧情: 剧情 || null,
        历史记录: 历史记录 || [],
        校规系统,
        催眠系统,
        校园系统: 校园系统 || undefined,
    };

    useDeviceRefreshMonitor({
        设备刷新任务队列,
        set设备刷新任务队列,
        set校园系统: 设置校园系统,
        eraId: currentEra,
        mode: 派生设备模式(),
        apiConfig: 设备消息接口!,
        apiSettings: 设备消息接口!,
        gameContext: 设备刷新GameContext,
        nsfw设置,
        推送右下角提示,
    });

    return {
        设备状态,
        设置设备状态: 设置设备状态委托,
        设备刷新任务队列,
        set设备刷新任务队列,
        设备关闭,
        设备返回主页,
        设备打开应用,
        设备打开,
        派生设备模式,
    };
}
