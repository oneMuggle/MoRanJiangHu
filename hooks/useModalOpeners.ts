// hooks/useModalOpeners.ts
// 面板开关逻辑 — 使用 modalManager 事件系统

import * as React from 'react';
import type { ConfirmOptions } from '../components/ui/InAppConfirmModal';
import { 获取文生图接口配置, 获取生图词组转化器接口配置, 接口配置是否可用 } from '../utils/apiConfig';

function emitOpen(id: string, payload?: unknown) {
    window.dispatchEvent(new CustomEvent('modal:open', { detail: { id, payload } }));
}

function emitClose(id: string) {
    window.dispatchEvent(new CustomEvent('modal:close', { detail: { id } }));
}

function emitCloseAll() {
    window.dispatchEvent(new CustomEvent('modal:closeAll'));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface GameSetters {
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

interface GameActions {
    openDevice: () => void;
    handleReturnToHome: () => void;
    handleStartNewGameWizard: () => void;
}

interface LocalModalStates {
    showBDSMRelationship: { npcId: string; npcName: string } | null;
    setShowBDSMRelationship: React.Dispatch<React.SetStateAction<{ npcId: string; npcName: string } | null>>;
    showBDSMContract: { npcId: string; npcName: string } | null;
    setShowBDSMContract: React.Dispatch<React.SetStateAction<{ npcId: string; npcName: string } | null>>;
    showBDSMSafety: { npcId: string; npcName: string } | null;
    setShowBDSMSafety: React.Dispatch<React.SetStateAction<{ npcId: string; npcName: string } | null>>;
}

interface UseModalOpenersDeps {
    setters: GameSetters;
    actions: GameActions;
    states: LocalModalStates;
    requestConfirm: (options: ConfirmOptions) => Promise<boolean>;
    启用修炼体系: boolean;
    activeMobileWindow: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiConfig: any;
}

export interface ModalOpeners {
    closeAllPanels: () => void;
    openCharacter: () => void;
    openSettings: () => void;
    openInventory: () => void;
    openEquipment: () => void;
    openBattle: () => void;
    openTeam: () => void;
    openSocial: () => void;
    openKungfu: () => void;
    openWorld: () => void;
    openMap: () => void;
    openSect: () => void;
    openTask: () => void;
    openAgreement: () => void;
    openStory: () => void;
    openHeroinePlan: () => void;
    openMemory: () => void;
    openSave: () => void;
    openLoad: () => void;
    closeSettings: () => void;
    closeNovelDecompositionWorkbench: () => void;
    closeNovelWritingWorkbench: () => void;
    closeMobileMusic: () => void;
    openWorldbookManager: () => void;
    openNovelDecompositionWorkbench: () => Promise<void>;
    openImageManagerWithCheck: () => Promise<void>;
    openCGGallery: () => void;
    openMapExplorer: () => void;
    openNsfwCenter: () => void;
    openCampusDesire: () => void;
    openPhotography: () => void;
    openUrbanDriver: () => void;
    openBoardGameDashboard: () => void;
    openBoardGame: () => void;
    handleMobileMenuClick: (menu: string) => void;
    handleStartFromLanding: () => void;
    handleReturnToHomeFromSettings: () => Promise<void>;
}

export function useModalOpeners(deps: UseModalOpenersDeps): ModalOpeners {
    const { setters, actions, states: _states, requestConfirm, 启用修炼体系, activeMobileWindow, apiConfig } = deps;

    const closeAllPanels = React.useCallback(() => {
        emitCloseAll();
    }, []);

    const openCharacter = React.useCallback(() => emitOpen('character'), []);
    const openSettings = React.useCallback(() => emitOpen('settings'), []);
    const openInventory = React.useCallback(() => emitOpen('inventory'), []);
    const openEquipment = React.useCallback(() => emitOpen('equipment'), []);
    const openBattle = React.useCallback(() => emitOpen('battle'), []);
    const openTeam = React.useCallback(() => emitOpen('team'), []);
    const openSocial = React.useCallback(() => emitOpen('social'), []);
    const openKungfu = React.useCallback(() => {
        if (!启用修炼体系) return;
        emitOpen('kungfu');
    }, [启用修炼体系]);
    const openWorld = React.useCallback(() => emitOpen('world'), []);
    const openMap = React.useCallback(() => emitOpen('map'), []);
    const openSect = React.useCallback(() => emitOpen('sect'), []);
    const openTask = React.useCallback(() => emitOpen('task'), []);
    const openAgreement = React.useCallback(() => emitOpen('agreement'), []);
    const openStory = React.useCallback(() => emitOpen('story'), []);
    const openHeroinePlan = React.useCallback(() => emitOpen('heroinePlan'), []);
    const openMemory = React.useCallback(() => emitOpen('memory'), []);
    const openSave = React.useCallback(() => emitOpen('saveLoad', { mode: 'save' }), []);
    const openLoad = React.useCallback(() => emitOpen('saveLoad', { mode: 'load' }), []);
    const closeSettings = React.useCallback(() => emitClose('settings'), []);
    const closeNovelDecompositionWorkbench = React.useCallback(() => emitClose('novelDecompositionWorkbench'), []);
    const closeNovelWritingWorkbench = React.useCallback(() => emitClose('novelWritingWorkbench'), []);
    const closeMobileMusic = React.useCallback(() => emitClose('music'), []);
    const openWorldbookManager = React.useCallback(() => emitOpen('worldbookManager'), []);
    const openCGGallery = React.useCallback(() => emitOpen('cgGallery'), []);
    const openMapExplorer = React.useCallback(() => emitOpen('mapExplorer'), []);
    const openNsfwCenter = React.useCallback(() => emitOpen('nsfwCenter'), []);
    const openCampusDesire = React.useCallback(() => emitOpen('campusDesire'), []);
    const openPhotography = React.useCallback(() => emitOpen('photography'), []);
    const openUrbanDriver = React.useCallback(() => emitOpen('urbanDriver'), []);
    const openBoardGameDashboard = React.useCallback(() => emitOpen('boardGameDashboard'), []);
    const openBoardGame = React.useCallback(() => emitOpen('boardGame'), []);

    const openNovelDecompositionWorkbench = React.useCallback(async () => {
        const feature = apiConfig?.功能模型占位;
        const 独立接口已配置 = Boolean(
            feature?.小说拆分功能启用
            && feature?.小说拆分独立模型开关
            && (feature?.小说拆分使用模型 || '').trim()
            && (feature?.小说拆分API地址 || '').trim()
            && (feature?.小说拆分API密钥 || '').trim()
        );

        if (!独立接口已配置) {
            const accepted = await requestConfirm({
                title: '先配置小说分解独立 API',
                message: '小说分解现在从首页独立打开。\n\n使用前请先在"设置 -> 小说分解接口"中启用并填写独立模型、API 地址和密钥。\n\n是否现在前往设置？',
                confirmText: '前往设置',
                cancelText: '取消'
            });
            if (accepted) {
                closeAllPanels();
                setters.setActiveTab('novel_decomposition');
                emitOpen('settings');
            }
            return;
        }

        emitOpen('novelDecompositionWorkbench');
    }, [closeAllPanels, requestConfirm, setters, apiConfig]);

    const openImageManagerWithCheck = React.useCallback(async () => {
        const imageApi = 获取文生图接口配置(apiConfig);
        if (!接口配置是否可用(imageApi)) {
            const accepted = await requestConfirm({
                title: '未配置文生图接口',
                message: '图片管理依赖可用的文生图接口。是否立即跳转到"文生图"设置页？',
                confirmText: '前往设置',
                cancelText: '稍后再说'
            });
            if (accepted) {
                closeAllPanels();
                setters.setActiveTab('image_generation');
                emitOpen('settings');
            }
            return;
        }

        if (imageApi.图片后端类型 === 'novelai') {
            const promptApi = 获取生图词组转化器接口配置(apiConfig);
            if (!接口配置是否可用(promptApi)) {
                const accepted = await requestConfirm({
                    title: 'NovelAI 缺少词组转化器',
                    message: 'NovelAI 模式必须绑定可用的词组转化器接口。是否立即跳转到"文生图"设置页？',
                    confirmText: '前往设置',
                    cancelText: '稍后再说'
                });
                if (accepted) {
                    closeAllPanels();
                    setters.setActiveTab('image_generation');
                    emitOpen('settings');
                }
                return;
            }
        }

        emitOpen('imageManager');
    }, [closeAllPanels, requestConfirm, setters, apiConfig]);

    const handleMobileMenuClick = React.useCallback((menu: string) => {
        const isActive = activeMobileWindow === menu;
        closeAllPanels();
        if (isActive) return;

        switch (menu) {
            case '角色': emitOpen('character'); break;
            case '装备': emitOpen('equipment'); break;
            case '战斗': emitOpen('battle'); break;
            case '背包': emitOpen('inventory'); break;
            case '社交': emitOpen('social'); break;
            case '功法': if (启用修炼体系) emitOpen('kungfu'); break;
            case '世界': emitOpen('world'); break;
            case '地图': emitOpen('map'); break;
            case '队伍': emitOpen('team'); break;
            case '门派': emitOpen('sect'); break;
            case '任务': emitOpen('task'); break;
            case '约定': emitOpen('agreement'); break;
            case '剧情': emitOpen('story'); break;
            case '规划': emitOpen('heroinePlan'); break;
            case '记忆': emitOpen('memory'); break;
            case '图册': void openImageManagerWithCheck(); break;
            case '小说分解': void openNovelDecompositionWorkbench(); break;
            case '探索': emitOpen('mapExplorer'); break;
            case '保存': emitOpen('saveLoad', { mode: 'save' }); break;
            case '读取': emitOpen('saveLoad', { mode: 'load' }); break;
            case '设置': emitOpen('settings'); break;
            case '通讯': actions.openDevice(); break;
            case '图鉴': emitOpen('cgGallery'); break;
            case '音乐': emitOpen('music'); break;
            default: break;
        }
    }, [activeMobileWindow, closeAllPanels, openImageManagerWithCheck, openNovelDecompositionWorkbench, 启用修炼体系, actions]);

    const handleStartFromLanding = React.useCallback(() => actions.handleStartNewGameWizard(), [actions]);

    const handleReturnToHomeFromSettings = React.useCallback(async () => {
        const ok = await requestConfirm({
            title: '返回首页',
            message: '确定要返回首页吗？未保存的进度将会丢失。',
            confirmText: '返回',
            danger: true
        });
        if (!ok) return;
        actions.handleReturnToHome();
    }, [actions, requestConfirm]);

    return {
        closeAllPanels,
        openCharacter, openSettings, openInventory, openEquipment,
        openBattle, openTeam, openSocial, openKungfu,
        openWorld, openMap, openSect, openTask,
        openAgreement, openStory, openHeroinePlan, openMemory,
        openSave, openLoad,
        closeSettings, closeNovelDecompositionWorkbench, closeNovelWritingWorkbench,
        closeMobileMusic,
        openWorldbookManager, openNovelDecompositionWorkbench,
        openImageManagerWithCheck, openCGGallery, openMapExplorer, handleMobileMenuClick, handleStartFromLanding,
        openNsfwCenter, openCampusDesire, openPhotography, openUrbanDriver,
        openBoardGameDashboard, openBoardGame,
        handleReturnToHomeFromSettings,
    };
}
