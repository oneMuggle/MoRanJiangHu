/**
 * useAppModalState.ts
 *
 * 提取 App 级别的弹窗状态管理，包括：
 * - 所有本地弹窗 useState 声明
 * - useConfirmSystem 集成
 * - useModalOpeners 调用
 *
 * 返回所有弹窗开/关状态、setters 和 openers，供 useAppEffects 和 App.tsx 使用。
 */

import * as React from 'react';
import { useModalOpeners, type ModalOpeners } from '../../hooks/useModalOpeners';

// ============================================================================
// 类型
// ============================================================================

export interface AppModalState {
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
    showPhotography: boolean;
    setShowPhotography: React.Dispatch<React.SetStateAction<boolean>>;
    showUrbanDriver: boolean;
    setShowUrbanDriver: React.Dispatch<React.SetStateAction<boolean>>;
    showNsfwCenter: boolean;
    setShowNsfwCenter: React.Dispatch<React.SetStateAction<boolean>>;
    showBoardGameDashboard: boolean;
    setShowBoardGameDashboard: React.Dispatch<React.SetStateAction<boolean>>;
    showBoardGameModal: boolean;
    setShowBoardGameModal: React.Dispatch<React.SetStateAction<boolean>>;
    showBDSMRelationship: { npcId: string; npcName: string } | null;
    setShowBDSMRelationship: React.Dispatch<React.SetStateAction<{ npcId: string; npcName: string } | null>>;
    showBDSMContract: { npcId: string; npcName: string } | null;
    setShowBDSMContract: React.Dispatch<React.SetStateAction<{ npcId: string; npcName: string } | null>>;
    showBDSMSafety: { npcId: string; npcName: string } | null;
    setShowBDSMSafety: React.Dispatch<React.SetStateAction<{ npcId: string; npcName: string } | null>>;
    chatContentHidden: boolean;
    setChatContentHidden: React.Dispatch<React.SetStateAction<boolean>>;
    sceneQuickGenHint: boolean;
    setSceneQuickGenHint: React.Dispatch<React.SetStateAction<boolean>>;
    sceneQuickGenToastVisible: boolean;
    setSceneQuickGenToastVisible: React.Dispatch<React.SetStateAction<boolean>>;
    contextSnapshot: Awaited<ReturnType<any>> | undefined;
    setContextSnapshot: React.Dispatch<React.SetStateAction<Awaited<ReturnType<any>> | undefined>>;
    galgameModeEnabled: boolean;
    toggleGalgameMode: () => void;
}

interface UseAppModalStateDeps {
    setters: any;
    actions: any;
    apiConfig: any;
    启用修炼体系: boolean;
    activeMobileWindow: string | null;
    requestConfirm: (options: any) => Promise<boolean>;
}

interface UseAppModalStateReturn extends AppModalState {
    requestConfirm: (options: any) => Promise<boolean>;
    modalOpeners: ModalOpeners;
}

// ============================================================================
// Hook
// ============================================================================

export function useAppModalState({
    setters,
    actions,
    apiConfig,
    启用修炼体系,
    activeMobileWindow,
    requestConfirm,
}: UseAppModalStateDeps): UseAppModalStateReturn {
    // --- 弹窗状态 ---
    const [showCharacter, setShowCharacter] = React.useState(false);
    const [showImageManager, setShowImageManager] = React.useState(false);
    const [showWorldbookManager, setShowWorldbookManager] = React.useState(false);
    const [showNovelDecompositionWorkbench, setShowNovelDecompositionWorkbench] = React.useState(false);
    const [showNovelWritingWorkbench, setShowNovelWritingWorkbench] = React.useState(false);
    const [showMobileMusic, setShowMobileMusic] = React.useState(false);
    const [showCampusDesire, setShowCampusDesire] = React.useState(false);
    const [showPhotography, setShowPhotography] = React.useState(false);
    const [showUrbanDriver, setShowUrbanDriver] = React.useState(false);
    const [showNsfwCenter, setShowNsfwCenter] = React.useState(false);
    const [showBoardGameDashboard, setShowBoardGameDashboard] = React.useState(false);
    const [showBoardGameModal, setShowBoardGameModal] = React.useState(false);
    const [showBDSMRelationship, setShowBDSMRelationship] = React.useState<{ npcId: string; npcName: string } | null>(null);
    const [showBDSMContract, setShowBDSMContract] = React.useState<{ npcId: string; npcName: string } | null>(null);
    const [showBDSMSafety, setShowBDSMSafety] = React.useState<{ npcId: string; npcName: string } | null>(null);
    const [chatContentHidden, setChatContentHidden] = React.useState(false);
    const [sceneQuickGenHint, setSceneQuickGenHint] = React.useState(false);
    const [sceneQuickGenToastVisible, setSceneQuickGenToastVisible] = React.useState(false);
    const [contextSnapshot, setContextSnapshot] = React.useState<Awaited<ReturnType<any>> | undefined>(undefined);
    const [galgameModeEnabled, setGalgameModeEnabled] = React.useState(false);
    const toggleGalgameMode = React.useCallback(() => {
        setGalgameModeEnabled(prev => !prev);
    }, []);

    // --- 弹窗开启器 ---
    const modalStates = {
        showCharacter, setShowCharacter,
        showImageManager, setShowImageManager,
        showWorldbookManager, setShowWorldbookManager,
        showNovelDecompositionWorkbench, setShowNovelDecompositionWorkbench,
        showNovelWritingWorkbench, setShowNovelWritingWorkbench,
        showMobileMusic, setShowMobileMusic,
        showCampusDesire, setShowCampusDesire,
        showPhotography, setShowPhotography,
        showUrbanDriver, setShowUrbanDriver,
        showBDSMRelationship, setShowBDSMRelationship,
        showBDSMContract, setShowBDSMContract,
        showBDSMSafety, setShowBDSMSafety,
    };
    const modalOpeners = useModalOpeners({
        setters,
        actions,
        states: modalStates,
        requestConfirm,
        启用修炼体系,
        activeMobileWindow,
        apiConfig,
    });

    return {
        showCharacter, setShowCharacter,
        showImageManager, setShowImageManager,
        showWorldbookManager, setShowWorldbookManager,
        showNovelDecompositionWorkbench, setShowNovelDecompositionWorkbench,
        showNovelWritingWorkbench, setShowNovelWritingWorkbench,
        showMobileMusic, setShowMobileMusic,
        showCampusDesire, setShowCampusDesire,
        showPhotography, setShowPhotography,
        showUrbanDriver, setShowUrbanDriver,
        showNsfwCenter, setShowNsfwCenter,
        showBoardGameDashboard, setShowBoardGameDashboard,
        showBoardGameModal, setShowBoardGameModal,
        showBDSMRelationship, setShowBDSMRelationship,
        showBDSMContract, setShowBDSMContract,
        showBDSMSafety, setShowBDSMSafety,
        chatContentHidden, setChatContentHidden,
        sceneQuickGenHint, setSceneQuickGenHint,
        sceneQuickGenToastVisible, setSceneQuickGenToastVisible,
        contextSnapshot, setContextSnapshot,
        galgameModeEnabled, toggleGalgameMode,
        requestConfirm,
        modalOpeners,
    };
}
