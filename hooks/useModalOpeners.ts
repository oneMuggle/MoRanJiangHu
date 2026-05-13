// hooks/useModalOpeners.ts
// 面板开关逻辑 — 从 App.tsx 提取

import * as React from 'react';
import type { ConfirmOptions } from '../components/ui/InAppConfirmModal';
import { 获取文生图接口配置, 获取生图词组转化器接口配置, 接口配置是否可用 } from '../utils/apiConfig';

// Minimal interfaces for the types we need from useGame
interface GameSetters {
    setShowBattle: React.Dispatch<React.SetStateAction<boolean>>;
    setShowInventory: React.Dispatch<React.SetStateAction<boolean>>;
    setShowEquipment: React.Dispatch<React.SetStateAction<boolean>>;
    setShowTeam: React.Dispatch<React.SetStateAction<boolean>>;
    setShowSocial: React.Dispatch<React.SetStateAction<boolean>>;
    setShowKungfu: React.Dispatch<React.SetStateAction<boolean>>;
    setShowWorld: React.Dispatch<React.SetStateAction<boolean>>;
    setShowMap: React.Dispatch<React.SetStateAction<boolean>>;
    setShowSect: React.Dispatch<React.SetStateAction<boolean>>;
    setShowTask: React.Dispatch<React.SetStateAction<boolean>>;
    setShowAgreement: React.Dispatch<React.SetStateAction<boolean>>;
    setShowStory: React.Dispatch<React.SetStateAction<boolean>>;
    setShowHeroinePlan: React.Dispatch<React.SetStateAction<boolean>>;
    setShowMemory: React.Dispatch<React.SetStateAction<boolean>>;
    setShowSaveLoad: React.Dispatch<React.SetStateAction<{ show: boolean; mode: 'save' | 'load' }>>;
    setShowRelationship: React.Dispatch<React.SetStateAction<{ show: boolean }>>;
    setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
    setShowCGGallery: React.Dispatch<React.SetStateAction<boolean>>;
    setShowMapExplorer: React.Dispatch<React.SetStateAction<boolean>>;
}

interface GameActions {
    openDevice: () => void;
    handleReturnToHome: () => void;
    handleStartNewGameWizard: () => void;
}

interface LocalModalStates {
    showCharacter: boolean;
    setShowCharacter: React.Dispatch<React.SetStateAction<boolean>>;
    showImageManager: boolean;
    setShowImageManager: React.Dispatch<React.SetStateAction<boolean>>;
    showWorldbookManager: boolean;
    setShowWorldbookManager: React.Dispatch<React.SetStateAction<boolean>>;
    showNovelDecompositionWorkbench: boolean;
    setShowNovelDecompositionWorkbench: React.Dispatch<React.SetStateAction<boolean>>;
    showNovelWritingWorkbench: boolean;
    setShowNovelWritingWorkbench: React.Dispatch<React.SetStateAction<boolean>>;
    showMobileMusic: boolean;
    setShowMobileMusic: React.Dispatch<React.SetStateAction<boolean>>;
    showCampusDesire: boolean;
    setShowCampusDesire: React.Dispatch<React.SetStateAction<boolean>>;
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
    openRelationship: () => void;
    closeRelationship: () => void;
    closeSettings: () => void;
    closeNovelDecompositionWorkbench: () => void;
    closeNovelWritingWorkbench: () => void;
    closeSaveLoad: () => void;
    closeMobileMusic: () => void;
    openWorldbookManager: () => void;
    openNovelDecompositionWorkbench: () => Promise<void>;
    openImageManagerWithCheck: () => Promise<void>;
    openCGGallery: () => void;
    openMapExplorer: () => void;
    handleMobileMenuClick: (menu: string) => void;
    handleStartFromLanding: () => void;
    handleReturnToHomeFromSettings: () => Promise<void>;
}

export function useModalOpeners(deps: UseModalOpenersDeps): ModalOpeners {
    const { setters, actions, states, requestConfirm, 启用修炼体系, activeMobileWindow, apiConfig } = deps;

    const closeAllPanels = React.useCallback(() => {
        states.setShowCharacter(false);
        setters.setShowBattle(false);
        setters.setShowInventory(false);
        setters.setShowEquipment(false);
        setters.setShowTeam(false);
        setters.setShowSocial(false);
        setters.setShowKungfu(false);
        setters.setShowWorld(false);
        setters.setShowMap(false);
        setters.setShowSect(false);
        setters.setShowTask(false);
        setters.setShowAgreement(false);
        setters.setShowStory(false);
        setters.setShowHeroinePlan(false);
        setters.setShowMemory(false);
        states.setShowImageManager(false);
        states.setShowNovelDecompositionWorkbench(false);
        setters.setShowSaveLoad({ show: false, mode: 'save' });
        setters.setShowRelationship({ show: false });
        setters.setShowSettings(false);
        states.setShowMobileMusic(false);
        setters.setShowMapExplorer(false);
    }, [setters, states]);

    const openCharacter = React.useCallback(() => states.setShowCharacter(true), [states]);
    const openSettings = React.useCallback(() => setters.setShowSettings(true), [setters]);
    const openInventory = React.useCallback(() => setters.setShowInventory(true), [setters]);
    const openEquipment = React.useCallback(() => setters.setShowEquipment(true), [setters]);
    const openBattle = React.useCallback(() => setters.setShowBattle(true), [setters]);
    const openTeam = React.useCallback(() => setters.setShowTeam(true), [setters]);
    const openSocial = React.useCallback(() => setters.setShowSocial(true), [setters]);
    const openKungfu = React.useCallback(() => {
        if (!启用修炼体系) return;
        setters.setShowKungfu(true);
    }, [setters, 启用修炼体系]);
    const openWorld = React.useCallback(() => setters.setShowWorld(true), [setters]);
    const openMap = React.useCallback(() => setters.setShowMap(true), [setters]);
    const openSect = React.useCallback(() => setters.setShowSect(true), [setters]);
    const openTask = React.useCallback(() => setters.setShowTask(true), [setters]);
    const openAgreement = React.useCallback(() => setters.setShowAgreement(true), [setters]);
    const openStory = React.useCallback(() => setters.setShowStory(true), [setters]);
    const openHeroinePlan = React.useCallback(() => setters.setShowHeroinePlan(true), [setters]);
    const openMemory = React.useCallback(() => setters.setShowMemory(true), [setters]);
    const openSave = React.useCallback(() => setters.setShowSaveLoad({ show: true, mode: 'save' }), [setters]);
    const openLoad = React.useCallback(() => setters.setShowSaveLoad({ show: true, mode: 'load' }), [setters]);
    const openRelationship = React.useCallback(() => setters.setShowRelationship({ show: true }), [setters]);
    const closeRelationship = React.useCallback(() => setters.setShowRelationship({ show: false }), [setters]);
    const closeSettings = React.useCallback(() => setters.setShowSettings(false), [setters]);
    const closeNovelDecompositionWorkbench = React.useCallback(() => states.setShowNovelDecompositionWorkbench(false), [states]);
    const closeNovelWritingWorkbench = React.useCallback(() => states.setShowNovelWritingWorkbench(false), [states]);
    const closeSaveLoad = React.useCallback(() => setters.setShowSaveLoad({ show: false, mode: 'save' }), [setters]);
    const closeMobileMusic = React.useCallback(() => states.setShowMobileMusic(false), [states]);
    const openWorldbookManager = React.useCallback(() => states.setShowWorldbookManager(true), [states]);

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
                setters.setShowSettings(true);
            }
            return;
        }

        states.setShowNovelDecompositionWorkbench(true);
    }, [closeAllPanels, requestConfirm, setters, states, apiConfig]);

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
                setters.setShowSettings(true);
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
                    setters.setShowSettings(true);
                }
                return;
            }
        }

        states.setShowImageManager(true);
    }, [closeAllPanels, requestConfirm, setters, states, apiConfig]);

    const openMapExplorer = React.useCallback(() => setters.setShowMapExplorer(true), [setters]);
    const openCGGallery = React.useCallback(() => setters.setShowCGGallery(true), [setters]);

    const handleMobileMenuClick = React.useCallback((menu: string) => {
        const isActive = activeMobileWindow === menu;
        closeAllPanels();
        if (isActive) return;

        switch (menu) {
            case '角色':
                states.setShowCharacter(true);
                break;
            case '装备':
                setters.setShowEquipment(true);
                break;
            case '战斗':
                setters.setShowBattle(true);
                break;
            case '背包':
                setters.setShowInventory(true);
                break;
            case '社交':
                setters.setShowSocial(true);
                break;
            case '关系':
                setters.setShowRelationship({ show: true });
                break;
            case '功法':
                if (启用修炼体系) {
                    setters.setShowKungfu(true);
                }
                break;
            case '世界':
                setters.setShowWorld(true);
                break;
            case '地图':
                setters.setShowMap(true);
                break;
            case '队伍':
                setters.setShowTeam(true);
                break;
            case '门派':
                setters.setShowSect(true);
                break;
            case '任务':
                setters.setShowTask(true);
                break;
            case '约定':
                setters.setShowAgreement(true);
                break;
            case '剧情':
                setters.setShowStory(true);
                break;
            case '规划':
                setters.setShowHeroinePlan(true);
                break;
            case '记忆':
                setters.setShowMemory(true);
                break;
            case '图册':
                void openImageManagerWithCheck();
                break;
            case '小说分解':
                void openNovelDecompositionWorkbench();
                break;
            case '探索':
                setters.setShowMapExplorer(true);
                break;
            case '保存':
                setters.setShowSaveLoad({ show: true, mode: 'save' });
                break;
            case '读取':
                setters.setShowSaveLoad({ show: true, mode: 'load' });
                break;
            case '设置':
                setters.setShowSettings(true);
                break;
            case '通讯':
                actions.openDevice();
                break;
            case '图鉴':
                setters.setShowCGGallery(true);
                break;
            case '音乐':
                states.setShowMobileMusic(true);
                break;
            default:
                break;
        }
    }, [activeMobileWindow, closeAllPanels, openImageManagerWithCheck, openNovelDecompositionWorkbench, setters, 启用修炼体系, actions, states]);

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
        setters.setShowSettings(false);
    }, [actions, requestConfirm, setters]);

    return {
        closeAllPanels,
        openCharacter, openSettings, openInventory, openEquipment,
        openBattle, openTeam, openSocial, openKungfu,
        openWorld, openMap, openSect, openTask,
        openAgreement, openStory, openHeroinePlan, openMemory,
        openSave, openLoad, openRelationship, closeRelationship,
        closeSettings, closeNovelDecompositionWorkbench, closeNovelWritingWorkbench,
        closeSaveLoad, closeMobileMusic,
        openWorldbookManager, openNovelDecompositionWorkbench,
        openImageManagerWithCheck, openCGGallery, openMapExplorer, handleMobileMenuClick, handleStartFromLanding,
        handleReturnToHomeFromSettings,
    };
}
