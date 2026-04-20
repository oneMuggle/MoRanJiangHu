import React from 'react';

export interface ImageManagerUIState {
    activeTab: string;
    selectedNpcId: string;
    libraryNpcId: string;
    sceneResolution: string;
    sceneOrientation: '横屏' | '竖屏';
    sceneCompositionRequirement: '纯场景' | '故事快照';
    sceneArchiveLimitDraft: string;
    sceneManualArtistPresetId: string;
    sceneManualPngPresetId: string;
    sceneExtraRequirement: string;
    manualComposition: '头像' | '半身' | '立绘' | '自定义';
    manualStyle: '无要求' | '通用' | '二次元' | '写实' | '国风';
    manualSizePreset: 'none' | '1:1' | '3:4' | '9:16' | '16:9' | 'custom';
    manualSizeScale: '1x' | '2x';
    manualWidth: string;
    manualHeight: string;
    manualArtistPresetId: string;
    manualPngPresetId: string;
    manualExtraRequirement: string;
    manualBackgroundMode: boolean;
    secretStyle: '无要求' | '通用' | '二次元' | '写实' | '国风';
    secretSizePreset: 'none' | '1:1' | '3:4' | '9:16' | '16:9' | 'custom';
    secretSizeScale: '1x' | '2x';
    secretWidth: string;
    secretHeight: string;
    secretArtistPresetId: string;
    secretPngPresetId: string;
    secretExtraRequirement: string;
    busyActionKey: string;
    imageViewer: { src: string; alt: string } | null;
    filters: {
        目标类型: string;
        角色姓名: string;
        状态: string;
    };
}

export interface ImageManagerUISetters {
    setActiveTab: (tab: string) => void;
    setSelectedNpcId: (id: string) => void;
    setLibraryNpcId: (id: string) => void;
    setSceneResolution: (value: string) => void;
    setSceneOrientation: (value: '横屏' | '竖屏') => void;
    setSceneCompositionRequirement: (value: '纯场景' | '故事快照') => void;
    setSceneArchiveLimitDraft: (value: string) => void;
    setSceneManualArtistPresetId: (value: string) => void;
    setSceneManualPngPresetId: (value: string) => void;
    setSceneExtraRequirement: (value: string) => void;
    setManualComposition: (value: '头像' | '半身' | '立绘' | '自定义') => void;
    setManualStyle: (value: '无要求' | '通用' | '二次元' | '写实' | '国风') => void;
    setManualSizePreset: (value: 'none' | '1:1' | '3:4' | '9:16' | '16:9' | 'custom') => void;
    setManualSizeScale: (value: '1x' | '2x') => void;
    setManualWidth: (value: string) => void;
    setManualHeight: (value: string) => void;
    setManualArtistPresetId: (value: string) => void;
    setManualPngPresetId: (value: string) => void;
    setManualExtraRequirement: (value: string) => void;
    setManualBackgroundMode: (value: boolean) => void;
    setSecretStyle: (value: '无要求' | '通用' | '二次元' | '写实' | '国风') => void;
    setSecretSizePreset: (value: 'none' | '1:1' | '3:4' | '9:16' | '16:9' | 'custom') => void;
    setSecretSizeScale: (value: '1x' | '2x') => void;
    setSecretWidth: (value: string) => void;
    setSecretHeight: (value: string) => void;
    setSecretArtistPresetId: (value: string) => void;
    setSecretPngPresetId: (value: string) => void;
    setSecretExtraRequirement: (value: string) => void;
    setBusyActionKey: (value: string) => void;
    setImageViewer: (value: { src: string; alt: string } | null) => void;
    setFilters: (value: { 目标类型: string; 角色姓名: string; 状态: string }) => void;
}

export const useImageManagerUI = (initialConfig?: { 场景图历史上限?: number }) => {
    const [activeTab, setActiveTab] = React.useState('manual');
    const [selectedNpcId, setSelectedNpcId] = React.useState('');
    const [libraryNpcId, setLibraryNpcId] = React.useState('');
    const [sceneResolution, setSceneResolution] = React.useState('1024x576');
    const [sceneOrientation, setSceneOrientation] = React.useState<'横屏' | '竖屏'>('横屏');
    const [sceneCompositionRequirement, setSceneCompositionRequirement] = React.useState<'纯场景' | '故事快照'>('纯场景');
    const [sceneArchiveLimitDraft, setSceneArchiveLimitDraft] = React.useState(String(initialConfig?.场景图历史上限 || 10));
    const [sceneManualArtistPresetId, setSceneManualArtistPresetId] = React.useState('');
    const [sceneManualPngPresetId, setSceneManualPngPresetId] = React.useState('');
    const [sceneExtraRequirement, setSceneExtraRequirement] = React.useState('');
    const [manualComposition, setManualComposition] = React.useState<'头像' | '半身' | '立绘' | '自定义'>('头像');
    const [manualStyle, setManualStyle] = React.useState<'无要求' | '通用' | '二次元' | '写实' | '国风'>('无要求');
    const [manualSizePreset, setManualSizePreset] = React.useState<'none' | '1:1' | '3:4' | '9:16' | '16:9' | 'custom'>('none');
    const [manualSizeScale, setManualSizeScale] = React.useState<'1x' | '2x'>('2x');
    const [manualWidth, setManualWidth] = React.useState('1024');
    const [manualHeight, setManualHeight] = React.useState('1024');
    const [manualArtistPresetId, setManualArtistPresetId] = React.useState('');
    const [manualPngPresetId, setManualPngPresetId] = React.useState('');
    const [manualExtraRequirement, setManualExtraRequirement] = React.useState('');
    const [manualBackgroundMode, setManualBackgroundMode] = React.useState(true);
    const [secretStyle, setSecretStyle] = React.useState<'无要求' | '通用' | '二次元' | '写实' | '国风'>('无要求');
    const [secretSizePreset, setSecretSizePreset] = React.useState<'none' | '1:1' | '3:4' | '9:16' | '16:9' | 'custom'>('1:1');
    const [secretSizeScale, setSecretSizeScale] = React.useState<'1x' | '2x'>('1x');
    const [secretWidth, setSecretWidth] = React.useState('1024');
    const [secretHeight, setSecretHeight] = React.useState('1024');
    const [secretArtistPresetId, setSecretArtistPresetId] = React.useState('');
    const [secretPngPresetId, setSecretPngPresetId] = React.useState('');
    const [secretExtraRequirement, setSecretExtraRequirement] = React.useState('');
    const [busyActionKey, setBusyActionKey] = React.useState('');
    const [imageViewer, setImageViewer] = React.useState<{ src: string; alt: string } | null>(null);
    const [filters, setFilters] = React.useState({ 目标类型: '全部', 角色姓名: '', 状态: '全部' });

    const state: ImageManagerUIState = {
        activeTab,
        selectedNpcId,
        libraryNpcId,
        sceneResolution,
        sceneOrientation,
        sceneCompositionRequirement,
        sceneArchiveLimitDraft,
        sceneManualArtistPresetId,
        sceneManualPngPresetId,
        sceneExtraRequirement,
        manualComposition,
        manualStyle,
        manualSizePreset,
        manualSizeScale,
        manualWidth,
        manualHeight,
        manualArtistPresetId,
        manualPngPresetId,
        manualExtraRequirement,
        manualBackgroundMode,
        secretStyle,
        secretSizePreset,
        secretSizeScale,
        secretWidth,
        secretHeight,
        secretArtistPresetId,
        secretPngPresetId,
        secretExtraRequirement,
        busyActionKey,
        imageViewer,
        filters
    };

    const setters: ImageManagerUISetters = {
        setActiveTab,
        setSelectedNpcId,
        setLibraryNpcId,
        setSceneResolution,
        setSceneOrientation,
        setSceneCompositionRequirement,
        setSceneArchiveLimitDraft,
        setSceneManualArtistPresetId,
        setSceneManualPngPresetId,
        setSceneExtraRequirement,
        setManualComposition,
        setManualStyle,
        setManualSizePreset,
        setManualSizeScale,
        setManualWidth,
        setManualHeight,
        setManualArtistPresetId,
        setManualPngPresetId,
        setManualExtraRequirement,
        setManualBackgroundMode,
        setSecretStyle,
        setSecretSizePreset,
        setSecretSizeScale,
        setSecretWidth,
        setSecretHeight,
        setSecretArtistPresetId,
        setSecretPngPresetId,
        setSecretExtraRequirement,
        setBusyActionKey,
        setImageViewer,
        setFilters
    };

    return { state, setters };
};