import React, { useState, useEffect } from 'react';
import { getDeviceConfig, getAppName, getLiModeThemeColor } from '../../../models/eraDevice';
import { DeviceState, MobileApp, DeviceConfig, DeviceGameContext } from '../../../models/mobileDevice';
import { resolveEraNode } from '../../../models/eraTheme';
import ChatApp from './apps/ChatApp';
import MapApp from './apps/MapApp';
import ContactsApp from './apps/ContactsApp';
import ForumApp from './apps/ForumApp';
import NewsApp from './apps/NewsApp';
import AlbumApp from './apps/AlbumApp';
import ToolsApp from './apps/ToolsApp';
import CampusForumApp from './apps/CampusForumApp';
import CampusChatApp from './apps/CampusChatApp';
import CampusScheduleApp from './apps/CampusScheduleApp';
import CampusCardApp from './apps/CampusCardApp';
import CampusClubApp from './apps/CampusClubApp';
import CampusRulesApp from './apps/CampusRulesApp';
import CampusHypnosisApp from './apps/CampusHypnosisApp';

import type { 校规条目, 校规影响日志, 催眠记录, 催眠App等级 } from '../../../types';
import type { NPC结构 } from '../../../models/domain/social';

interface AppProps {
    eraId: string;
    mode: DeviceState['mode'];
    appId: MobileApp;
    onBack: () => void;
    gameContext?: DeviceGameContext;
    // 校园系统回调（可选）
    onRulesChange?: (updater: (prev: { 校规列表: 校规条目[]; 影响日志: 校规影响日志[] }) => { 校规列表: 校规条目[]; 影响日志: 校规影响日志[] }) => void;
    onHypnosisChange?: (updater: (prev: { 催眠记录列表: 催眠记录[]; app等级: 催眠App等级; 累计使用次数: number }) => { 催眠记录列表: 催眠记录[]; app等级: 催眠App等级; 累计使用次数: number }) => void;
    onRefresh?: () => void;
    onSendMessage?: (npcId: string, npcName: string, content: string) => void;
    onUnlockNPC?: (npc: NPC结构) => void;
}

interface MobileHomeProps {
    eraId: string;
    deviceState: DeviceState;
    onAppClick: (app: MobileApp) => void;
    onReturnHome: () => void;
    onClose: () => void;
    gameContext?: DeviceGameContext;
    // 校园系统回调
    onRulesChange?: (updater: (prev: { 校规列表: 校规条目[]; 影响日志: 校规影响日志[] }) => { 校规列表: 校规条目[]; 影响日志: 校规影响日志[] }) => void;
    onHypnosisChange?: (updater: (prev: { 催眠记录列表: 催眠记录[]; app等级: 催眠App等级; 累计使用次数: number }) => { 催眠记录列表: 催眠记录[]; app等级: 催眠App等级; 累计使用次数: number }) => void;
    onRefresh?: () => void;
    onSendMessage?: (npcId: string, npcName: string, content: string) => void;
    onUnlockNPC?: (npc: NPC结构) => void;
}

const appIcons: Record<MobileApp, string> = {
    map: '🗺️',
    contacts: '👥',
    chat: '💬',
    forum: '📋',
    news: '📰',
    album: '🖼️',
    tools: '🔧',
    schedule: '📅',
    campus_card: '💳',
    club: '🎯',
    confession: '💌',
    rules: '📜',
    hypnosis: '🌀',
    bdsn: '🌙',
};

const MobileHome: React.FC<MobileHomeProps> = ({
    eraId,
    deviceState,
    onAppClick,
    onReturnHome,
    onClose,
    gameContext,
    onRulesChange,
    onHypnosisChange,
    onRefresh,
    onSendMessage,
    onUnlockNPC,
}) => {
    const [config, setConfig] = useState<DeviceConfig | null>(null);
    const [liModeName, setLiModeName] = useState<string | undefined>();

    useEffect(() => {
        const resolved = resolveEraNode(eraId);
        if (resolved?.inherited.liMode) {
            setLiModeName(resolved.inherited.liMode.name);
        }
        const deviceConfig = getDeviceConfig(eraId);
        setConfig(deviceConfig);
    }, [eraId]);

    if (!config) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400">
                <p>未找到对应时代的设备</p>
            </div>
        );
    }

    const isLiMode = deviceState.mode === 'li';
    const themeColor = isLiMode ? getLiModeThemeColor(config, '#6B2D8B') : undefined;
    const liModeEnabled = !!liModeName;

    const renderActiveApp = () => {
        const appProps: AppProps = {
            eraId,
            mode: deviceState.mode,
            appId: deviceState.activeApp!,
            onBack: onReturnHome,
            gameContext,
            onRulesChange,
            onHypnosisChange,
            onRefresh,
            onSendMessage,
            onUnlockNPC,
        };
        switch (deviceState.activeApp) {
            case 'chat': return <CampusChatApp {...appProps} />;
            case 'map': return <MapApp {...appProps} />;
            case 'contacts': return <ContactsApp {...appProps} />;
            case 'forum': return <CampusForumApp {...appProps} />;
            case 'news': return <NewsApp {...appProps} />;
            case 'album': return <AlbumApp {...appProps} />;
            case 'tools': return <ToolsApp {...appProps} />;
            case 'schedule': return <CampusScheduleApp {...appProps} />;
            case 'campus_card': return <CampusCardApp {...appProps} />;
            case 'club': return <CampusClubApp {...appProps} />;
            case 'confession': return <CampusForumApp {...appProps} />;
            case 'rules': return <CampusRulesApp {...appProps} />;
            case 'hypnosis': return <CampusHypnosisApp {...appProps} />;
            case 'bdsn': return <CampusForumApp {...appProps} />;
            default: return null;
        }
    };

    return (
        <div
            className="flex flex-col h-full transition-colors duration-300"
            data-device-mode={deviceState.mode}
            style={
                isLiMode
                    ? {
                          ['--li-theme-color' as string]: themeColor,
                      }
                    : undefined
            }
        >
            {/* 顶部状态栏 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
                <div className="flex items-center gap-3">
                    <h2
                        className="text-lg font-bold"
                        style={isLiMode ? { color: themeColor } : {}}
                    >
                        {config.deviceName}
                    </h2>
                    {liModeEnabled && liModeName && (
                        <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                                backgroundColor: `${themeColor}33`,
                                color: themeColor,
                                border: `1px solid ${themeColor}66`,
                            }}
                        >
                            {liModeName}
                        </span>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="关闭设备"
                >
                    ✕
                </button>
            </div>

            {/* Active App or Home Grid */}
            {deviceState.activeApp ? renderActiveApp() : (
                <>
                    {/* 应用网格 */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                            {config.apps.map((app) => {
                                const appName = getAppName(config, app, deviceState.mode);
                                const icon = appIcons[app];
                                return (
                                    <button
                                        key={app}
                                        onClick={() => onAppClick(app)}
                                        className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/10 transition-all duration-200 group"
                                    >
                                        <span
                                            className="text-3xl transition-transform group-hover:scale-110"
                                            style={
                                                isLiMode
                                                    ? {
                                                          filter: `drop-shadow(0 0 4px ${themeColor})`,
                                                      }
                                                    : undefined
                                            }
                                        >
                                            {icon}
                                        </span>
                                        <span
                                            className="text-xs text-center transition-colors"
                                            style={isLiMode ? { color: themeColor } : {}}
                                        >
                                            {appName}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 底部状态栏 */}
                    <div className="px-4 py-2 border-t border-gray-700/50 text-xs text-gray-500">
                        <div className="flex justify-between">
                            <span>通讯范围: {config.capabilities.通讯范围}</span>
                            <span>能源: {config.capabilities.能源类型}</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MobileHome;
