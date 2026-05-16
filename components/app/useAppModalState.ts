/**
 * useAppModalState.ts
 *
 * App 级弹窗状态管理：
 * - useModalOpeners 调用（所有面板开/关函数）
 * - activeMobileWindow 追踪字段（showCharacter / showNovelDecompositionWorkbench / showMobileMusic）
 * - useAppEffects 所需的 UI 状态
 * - BDSM 弹窗本地状态（尚未迁移到 ModalRenderer）
 */

import * as React from 'react';
import { useModalOpeners, type ModalOpeners } from '../../hooks/useModalOpeners';

export interface AppModalState {
    showCharacter: boolean;
    showNovelDecompositionWorkbench: boolean;
    showMobileMusic: boolean;
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
    rpgModeEnabled: boolean;
    toggleRpgMode: () => void;
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

export function useAppModalState({
    setters,
    actions,
    apiConfig,
    启用修炼体系,
    activeMobileWindow,
    requestConfirm,
}: UseAppModalStateDeps): UseAppModalStateReturn {
    // --- activeMobileWindow 追踪字段（由 modalManager 事件同步） ---
    const [showCharacter, setShowCharacter] = React.useState(false);
    const [showNovelDecompositionWorkbench, setShowNovelDecompositionWorkbench] = React.useState(false);
    const [showMobileMusic, setShowMobileMusic] = React.useState(false);

    // 监听 modalManager 事件，同步 activeMobileWindow 追踪字段
    React.useEffect(() => {
        const handleOpen = (e: Event) => {
            const detail = (e as CustomEvent).detail as { id: string };
            if (detail.id === 'character') setShowCharacter(true);
            if (detail.id === 'novelDecompositionWorkbench') setShowNovelDecompositionWorkbench(true);
            if (detail.id === 'music') setShowMobileMusic(true);
        };
        const handleClose = (e: Event) => {
            const detail = (e as CustomEvent).detail as { id: string };
            if (detail.id === 'character') setShowCharacter(false);
            if (detail.id === 'novelDecompositionWorkbench') setShowNovelDecompositionWorkbench(false);
            if (detail.id === 'music') setShowMobileMusic(false);
        };
        const handleCloseAll = () => {
            setShowCharacter(false);
            setShowNovelDecompositionWorkbench(false);
            setShowMobileMusic(false);
        };
        window.addEventListener('modal:open', handleOpen);
        window.addEventListener('modal:close', handleClose);
        window.addEventListener('modal:closeAll', handleCloseAll);
        return () => {
            window.removeEventListener('modal:open', handleOpen);
            window.removeEventListener('modal:close', handleClose);
            window.removeEventListener('modal:closeAll', handleCloseAll);
        };
    }, []);

    // --- 本地 UI 状态（不由 ModalRenderer 管理） ---
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
    const [rpgModeEnabled, setRpgModeEnabled] = React.useState(false);
    const toggleRpgMode = React.useCallback(() => {
        setRpgModeEnabled(prev => !prev);
    }, []);

    // --- 弹窗开启器（通过 modalManager 事件系统） ---
    const modalStates = {
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
        showCharacter,
        showNovelDecompositionWorkbench,
        showMobileMusic,
        chatContentHidden, setChatContentHidden,
        sceneQuickGenHint, setSceneQuickGenHint,
        sceneQuickGenToastVisible, setSceneQuickGenToastVisible,
        contextSnapshot, setContextSnapshot,
        galgameModeEnabled, toggleGalgameMode,
        rpgModeEnabled, toggleRpgMode,
        requestConfirm,
        modalOpeners,
    };
}
