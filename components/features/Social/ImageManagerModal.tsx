import React from 'react';
import type {
    NPC结构,
    NPC图片记录,
    场景图片档案,
    场景生图任务记录,
    NPC生图任务记录,
    图片管理筛选条件,
    图片生成状态类型,
    接口设置结构,
    图片管理设置结构,
    香闺秘档部位类型,
    画师串预设结构,
    角色锚点结构,
    模型词组转化器预设结构,
    词组转化器提示词预设结构,
    PNG画风预设结构
} from '../../../types';
import { useImageAssetPrefetch } from '../../../hooks/useImageAssetPrefetch';
import { 获取图片展示地址, 是否存在本地图片副本, 格式化本地图片描述 } from '../../../utils/imageAssets';
import ToggleSwitch from '../../ui/ToggleSwitch';
import { 规范化接口设置 } from '../../../utils/apiConfig';
import { 自动场景横屏尺寸选项, 自动场景竖屏尺寸选项 } from '../../../utils/imageSizeOptions';
import { IconScroll } from '../../ui/Icons';

import { useImageManagerContext } from './ImageManager/context/ImageManagerContext';
import {
    状态样式,
    状态文案,
    队列状态样式,
    队列状态文案,
    来源文案,
    标签按钮样式,
    次级按钮样式,
    主按钮样式,
    卡片样式,
    小标题样式,
    摘要卡片样式
} from './ImageManager/utils/imageManagerConstants';
import {
    获取生图阶段中文,
    从任务状态推导阶段,
    获取NPC构图文案,
    格式化时间,
    任务标识匹配NPC,
    从任务标识提取NPCID,
    读取NPC展示摘要,
    角色锚点有可用内容,
    统计卡,
    空状态,
    生成预设ID,
    预设输入拦截键盘事件
} from './ImageManager/utils/imageManagerHelpers';
import { PresetsTab } from './ImageManager/tabs/PresetsTab';
import { QueueTab } from './ImageManager/tabs/QueueTab';
import { RulesTab } from './ImageManager/tabs/RulesTab';
import { ImageViewerOverlay, ManualConfirmOverlay, PromptDisplayOverlay } from './ImageManager/overlays';
import { ImageManagerShell } from './ImageManager/components';

interface Props {
    socialList: NPC结构[];
    cultivationSystemEnabled?: boolean;
    queue: NPC生图任务记录[];
    sceneArchive: 场景图片档案;
    sceneQueue: 场景生图任务记录[];
    apiConfig?: 接口设置结构;
    imageManagerConfig?: 图片管理设置结构;
    currentPersistentWallpaper?: string;
    onSaveApiConfig?: (config: 接口设置结构) => Promise<void> | void;
    onSaveImageManagerConfig?: (config: 图片管理设置结构) => Promise<void> | void;
    onGenerateImage?: (npcId: string, options?: { 构图?: '头像' | '半身' | '立绘'; 画风?: '通用' | '二次元' | '写实' | '国风'; 画师串?: string; 画师串预设ID?: string; PNG画风预设ID?: string; 额外要求?: string; 尺寸?: string; 后台处理?: boolean }) => Promise<void> | void;
    onGenerateSecretPartImage?: (npcId: string, part: 香闺秘档部位类型 | '全部', options?: { 画风?: '通用' | '二次元' | '写实' | '国风'; 画师串?: string; 画师串预设ID?: string; PNG画风预设ID?: string; 额外要求?: string; 尺寸?: string; 后台处理?: boolean }) => Promise<void> | void;
    onRetryImage?: (npcId: string, options?: { 重试模式?: '完全重试' | '复用提示词'; 保留提示词?: { 生图词组: string; 最终正向提示词: string; 最终负向提示词: string } }) => Promise<void> | void;
    onGenerateSceneImage?: (options?: { 画师串预设ID?: string; PNG画风预设ID?: string; 构图要求?: '纯场景' | '故事快照'; 尺寸?: string; 额外要求?: string; 后台处理?: boolean }) => Promise<void> | void;
    onSetPersistentWallpaper?: (imageUrl: string) => Promise<void> | void;
    onClearPersistentWallpaper?: () => Promise<void> | void;
    onSelectAvatarImage?: (npcId: string, imageId: string) => Promise<void> | void;
    onSelectPortraitImage?: (npcId: string, imageId: string) => Promise<void> | void;
    onSelectBackgroundImage?: (npcId: string, imageId: string) => Promise<void> | void;
    onClearAvatarImage?: (npcId: string) => Promise<void> | void;
    onClearPortraitImage?: (npcId: string) => Promise<void> | void;
    onClearBackgroundImage?: (npcId: string) => Promise<void> | void;
    onDeleteImageRecord?: (npcId: string, imageId: string) => Promise<void> | void;
    onClearImageHistory?: (npcId?: string) => Promise<void> | void;
    onDeleteQueueTask?: (taskId: string) => Promise<void> | void;
    onClearQueue?: (mode?: 'all' | 'completed') => Promise<void> | void;
    onSaveImageLocally?: (npcId: string, imageId: string) => Promise<void> | void;
    onApplySceneWallpaper?: (imageId: string) => Promise<void> | void;
    onClearSceneWallpaper?: () => Promise<void> | void;
    onDeleteSceneImage?: (imageId: string) => Promise<void> | void;
    onClearSceneHistory?: () => Promise<void> | void;
    onDeleteSceneQueueTask?: (taskId: string) => Promise<void> | void;
    onClearSceneQueue?: (mode?: 'all' | 'completed') => Promise<void> | void;
    onSaveSceneImageLocally?: (imageId: string) => Promise<void> | void;
    onSavePngStylePreset?: (preset: PNG画风预设结构) => Promise<PNG画风预设结构 | null | void> | PNG画风预设结构 | null | void;
    onDeletePngStylePreset?: (presetId: string) => Promise<void> | void;
    onParsePngStylePreset?: (file: File, options?: { 预设名称?: string; 额外要求?: string; 后台处理?: boolean }) => Promise<PNG画风预设结构 | null> | PNG画风预设结构 | null | void;
    onSetCurrentPngStylePreset?: (presetId: string) => Promise<void> | void;
    onExportPngStylePresets?: () => void;
    onImportPngStylePresets?: () => Promise<void> | void;
    onSaveCharacterAnchor?: (anchor: 角色锚点结构) => Promise<角色锚点结构 | null> | 角色锚点结构 | null | void;
    onDeleteCharacterAnchor?: (anchorId: string) => Promise<void> | void;
    onExtractCharacterAnchor?: (npcId: string, options?: { 名称?: string; 额外要求?: string }) => Promise<角色锚点结构 | null> | 角色锚点结构 | null | void;
    onClose: () => void;
}

type 手动流程阶段 = 'idle' | 'confirm' | 'submitting';
type 页面标签类型 = 'manual' | 'library' | 'scene' | 'queue' | 'history' | 'presets' | 'rules';

type NPC图库分组 = {
    npc: NPC结构;
    records: NPC图片记录[];
};

type 合并队列记录 = {
    类型: 'npc' | 'scene';
    id: string;
    创建时间: number;
    状态: NPC生图任务记录['状态'];
    task: NPC生图任务记录 | 场景生图任务记录;
};

type 合并历史记录 = {
    类型: 'npc' | 'scene';
    key: string;
    时间: number;
    状态: 图片生成状态类型;
    npcRecord?: NPC图片记录;
    sceneRecord?: 场景图片档案['最近生图结果'];
};

const ImageManagerModal: React.FC<Props> = ({
    socialList,
    cultivationSystemEnabled = true,
    queue,
    sceneArchive,
    sceneQueue,
    apiConfig,
    imageManagerConfig,
    onSaveApiConfig,
    onSaveImageManagerConfig,
    onGenerateImage,
    onGenerateSecretPartImage,
    onRetryImage,
    onGenerateSceneImage,
    currentPersistentWallpaper,
    onSetPersistentWallpaper,
    onClearPersistentWallpaper,
    onSelectAvatarImage,
    onSelectPortraitImage,
    onSelectBackgroundImage,
    onClearAvatarImage,
    onClearPortraitImage,
    onClearBackgroundImage,
    onDeleteImageRecord,
    onClearImageHistory,
    onDeleteQueueTask,
    onClearQueue,
    onSaveImageLocally,
    onApplySceneWallpaper,
    onClearSceneWallpaper,
    onDeleteSceneImage,
    onClearSceneHistory,
    onDeleteSceneQueueTask,
    onClearSceneQueue,
    onSaveSceneImageLocally,
    onSavePngStylePreset,
    onDeletePngStylePreset,
    onSetCurrentPngStylePreset,
    onParsePngStylePreset,
    onExportPngStylePresets,
    onImportPngStylePresets,
    onSaveCharacterAnchor,
    onDeleteCharacterAnchor,
    onExtractCharacterAnchor,
    onClose
}) => {
    useImageAssetPrefetch(socialList, sceneArchive, currentPersistentWallpaper, apiConfig);
    const 显示境界 = cultivationSystemEnabled !== false;
    const [filters, setFilters] = React.useState<图片管理筛选条件>({
        目标类型: '全部',
        角色姓名: '',
        状态: '全部'
    });
    const [activeTab, setActiveTab] = React.useState<页面标签类型>('manual');
    const [modelRulePanelOpen, setModelRulePanelOpen] = React.useState(false);
    const [activeRuleSection, setActiveRuleSection] = React.useState<'npc' | 'scene' | 'scene_judge'>('npc');
    const [selectedNpcId, setSelectedNpcId] = React.useState<string>('');
    const [manualComposition, setManualComposition] = React.useState<'头像' | '半身' | '立绘' | '自定义'>('头像');
    const [sceneManualArtistPresetId, setSceneManualArtistPresetId] = React.useState('');
    const [sceneManualPngPresetId, setSceneManualPngPresetId] = React.useState('');
    const [sceneCompositionRequirement, setSceneCompositionRequirement] = React.useState<'纯场景' | '故事快照'>('纯场景');
    const [sceneOrientation, setSceneOrientation] = React.useState<'横屏' | '竖屏'>('横屏');
    const [sceneResolution, setSceneResolution] = React.useState('1024x576');
    const [sceneExtraRequirement, setSceneExtraRequirement] = React.useState('');
    const [sceneArchiveLimitDraft, setSceneArchiveLimitDraft] = React.useState(String(imageManagerConfig?.场景图历史上限 || 10));
    const [manualCustomComposition, setManualCustomComposition] = React.useState('');
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
    const [manualFlowStage, setManualFlowStage] = React.useState<手动流程阶段>('idle');
    const [manualSubmitAt, setManualSubmitAt] = React.useState<number>(0);

    const 手动尺寸基准: Record<'1:1' | '3:4' | '9:16' | '16:9', { 宽: number; 高: number; 描述: string }> = {
        '1:1': { 宽: 1024, 高: 1024, 描述: '1:1 正方' },
        '3:4': { 宽: 768, 高: 1024, 描述: '3:4 半身' },
        '9:16': { 宽: 576, 高: 1024, 描述: '9:16 竖构图' },
        '16:9': { 宽: 1024, 高: 576, 描述: '16:9 横构图' }
    };

    const 获取手动尺寸预设 = React.useCallback((preset: '1:1' | '3:4' | '9:16' | '16:9', scale: '1x' | '2x') => {
        const base = 手动尺寸基准[preset];
        const factor = scale === '2x' ? 2 : 1;
        return {
            宽: String(base.宽 * factor),
            高: String(base.高 * factor),
            描述: base.描述
        };
    }, []);

    const manualPresetSize = React.useMemo(() => {
        if (manualSizePreset === 'custom' || manualSizePreset === 'none') return null;
        return 获取手动尺寸预设(manualSizePreset, manualSizeScale);
    }, [获取手动尺寸预设, manualSizePreset, manualSizeScale]);

    const secretPresetSize = React.useMemo(() => {
        if (secretSizePreset === 'custom' || secretSizePreset === 'none') return null;
        return 获取手动尺寸预设(secretSizePreset, secretSizeScale);
    }, [获取手动尺寸预设, secretSizePreset, secretSizeScale]);

    React.useEffect(() => {
        if (manualSizePreset === 'custom' || manualSizePreset === 'none') return;
        const preset = 获取手动尺寸预设(manualSizePreset, manualSizeScale);
        if (!preset) return;
        setManualWidth(preset.宽);
        setManualHeight(preset.高);
    }, [manualSizePreset, manualSizeScale, 获取手动尺寸预设]);

    React.useEffect(() => {
        if (secretSizePreset === 'custom' || secretSizePreset === 'none') return;
        const preset = 获取手动尺寸预设(secretSizePreset, secretSizeScale);
        if (!preset) return;
        setSecretWidth(preset.宽);
        setSecretHeight(preset.高);
    }, [secretSizePreset, secretSizeScale, 获取手动尺寸预设]);

    React.useEffect(() => {
        if (manualComposition === '自定义') return;
        if (manualSizePreset !== 'none') {
            setManualSizePreset('none');
        }
    }, [manualComposition, manualSizePreset]);

    const isCustomComposition = manualComposition === '自定义';

    const manualSizeValue = React.useMemo(() => {
        if (!isCustomComposition) return undefined;
        if (manualSizePreset === 'none') return undefined;
        const width = manualWidth.trim();
        const height = manualHeight.trim();
        if (!width || !height) return undefined;
        if (!/^\d+$/.test(width) || !/^\d+$/.test(height)) return undefined;
        return `${width}x${height}`;
    }, [isCustomComposition, manualHeight, manualSizePreset, manualWidth]);

    const secretSizeValue = React.useMemo(() => {
        if (secretSizePreset === 'none') return undefined;
        const width = secretWidth.trim();
        const height = secretHeight.trim();
        if (!width || !height) return undefined;
        if (!/^\d+$/.test(width) || !/^\d+$/.test(height)) return undefined;
        return `${width}x${height}`;
    }, [secretHeight, secretSizePreset, secretWidth]);

    const sceneResolutionOptions = React.useMemo(
        () => (sceneOrientation === '竖屏' ? 自动场景竖屏尺寸选项 : 自动场景横屏尺寸选项),
        [sceneOrientation]
    );

    React.useEffect(() => {
        if (sceneResolutionOptions.some((item) => item.value === sceneResolution)) return;
        setSceneResolution(sceneResolutionOptions[0]?.value || '');
    }, [sceneResolution, sceneResolutionOptions]);

    const [manualError, setManualError] = React.useState('');
    const [manualStatusText, setManualStatusText] = React.useState('');
    const [secretSubmitAt, setSecretSubmitAt] = React.useState<number>(0);
    const [secretStatusText, setSecretStatusText] = React.useState('');
    const [sceneStatusText, setSceneStatusText] = React.useState('');
    const [actionError, setActionError] = React.useState('');
    const [busyActionKey, setBusyActionKey] = React.useState('');
    const [imageViewer, setImageViewer] = React.useState<{ src: string; alt: string } | null>(null);
    const [libraryNpcId, setLibraryNpcId] = React.useState('');
    const [presetConfig, setPresetConfig] = React.useState<接口设置结构>(() => 规范化接口设置(apiConfig));
    const [artistPresetScope, setArtistPresetScope] = React.useState<'npc' | 'scene'>('npc');
    const [editorArtistPresetId, setEditorArtistPresetId] = React.useState('');
    const [modelTransformerPresetEditorId, setModelTransformerPresetEditorId] = React.useState('');
    const [npcTransformerPresetEditorId, setNpcTransformerPresetEditorId] = React.useState('');
    const [sceneTransformerPresetEditorId, setSceneTransformerPresetEditorId] = React.useState('');
    const [sceneJudgePresetEditorId, setSceneJudgePresetEditorId] = React.useState('');
    const [characterAnchorEditorId, setCharacterAnchorEditorId] = React.useState('');
    const [characterAnchorDraft, setCharacterAnchorDraft] = React.useState<角色锚点结构 | null>(null);
    const [characterAnchorNpcId, setCharacterAnchorNpcId] = React.useState('');
    const [characterAnchorExtractRequirement, setCharacterAnchorExtractRequirement] = React.useState('');
    const [characterAnchorExtractStage, setCharacterAnchorExtractStage] = React.useState<'idle' | 'extracting' | 'done' | 'error'>('idle');
    const [characterAnchorExtractMessage, setCharacterAnchorExtractMessage] = React.useState('');
    const [pngPresetEditorId, setPngPresetEditorId] = React.useState('');
    const [pngPresetDraft, setPngPresetDraft] = React.useState<PNG画风预设结构 | null>(null);
    const [pngPresetImportName, setPngPresetImportName] = React.useState('');
    const [pngPresetImportRequirement, setPngPresetImportRequirement] = React.useState('');
    const [pngImportStage, setPngImportStage] = React.useState<'idle' | 'parsing' | 'done' | 'error'>('idle');
    const [pngImportMessage, setPngImportMessage] = React.useState('');
    const [promptDisplayModal, setPromptDisplayModal] = React.useState<{
        打开: boolean;
        生图词组?: string;
        最终正向提示词?: string;
        最终负向提示词?: string;
        错误信息?: string;
    }>({ 打开: false });

    React.useEffect(() => {
        setPresetConfig(规范化接口设置(apiConfig));
    }, [apiConfig]);

    const pngStylePresets = React.useMemo<PNG画风预设结构[]>(() => {
        const feature = 规范化接口设置(apiConfig).功能模型占位;
        return Array.isArray(feature.PNG画风预设列表) ? feature.PNG画风预设列表 : [];
    }, [apiConfig]);
    const currentPngStylePresetId = React.useMemo(() => {
        const feature = 规范化接口设置(apiConfig).功能模型占位;
        return (feature.当前PNG画风预设ID || '').trim();
    }, [apiConfig]);

    React.useEffect(() => {
        if (pngPresetEditorId && pngStylePresets.some((item) => item.id === pngPresetEditorId)) return;
        setPngPresetEditorId(pngStylePresets[0]?.id || '');
    }, [pngPresetEditorId, pngStylePresets]);

    React.useEffect(() => {
        const selected = pngStylePresets.find((item) => item.id === pngPresetEditorId) || null;
        setPngPresetDraft(selected ? { ...selected } : null);
    }, [pngPresetEditorId, pngStylePresets]);

    const records = React.useMemo<NPC图片记录[]>(() => {
        return (Array.isArray(socialList) ? socialList : [])
            .flatMap((npc) => {
                const hasExplicitHistory = Array.isArray(npc?.图片档案?.生图历史);
                const history = hasExplicitHistory ? npc.图片档案?.生图历史 : [];
                const fallbackRecent = !hasExplicitHistory && npc?.最近生图结果 ? [npc.最近生图结果] : [];
                const safeHistory = Array.isArray(history) ? history : [];
                const resultList = (safeHistory.length > 0 ? safeHistory : fallbackRecent)
                    .filter((item) => item && typeof item === 'object');
                return resultList.map((result) => ({
                    目标类型: 'npc' as const,
                    NPC标识: npc.id,
                    NPC姓名: npc.姓名,
                    NPC性别: npc.性别,
                    是否主要角色: npc.是否主要角色,
                    结果: result
                }));
            })
            .sort((a, b) => (b.结果?.生成时间 || 0) - (a.结果?.生成时间 || 0));
    }, [socialList]);

    const npcOptions = React.useMemo(() => {
        return (Array.isArray(socialList) ? socialList : [])
            .filter((npc) => npc && typeof npc.id === 'string' && npc.id.trim())
            .slice()
            .sort((a, b) => {
                if (a.是否主要角色 !== b.是否主要角色) {
                    return a.是否主要角色 ? -1 : 1;
                }
                return (a.姓名 || '').localeCompare(b.姓名 || '', 'zh-CN');
            });
    }, [socialList]);

    React.useEffect(() => {
        if (!selectedNpcId && npcOptions.length > 0) {
            setSelectedNpcId(npcOptions[0].id);
        }
    }, [npcOptions, selectedNpcId]);

    React.useEffect(() => {
        setSecretSubmitAt(0);
        setSecretStatusText('');
    }, [selectedNpcId]);

    const selectedNpc = React.useMemo(() => {
        return npcOptions.find((npc) => npc.id === selectedNpcId) || null;
    }, [npcOptions, selectedNpcId]);

    const presetFeature = presetConfig?.功能模型占位;
    const selectedNpcSummary = React.useMemo(
        () => 读取NPC展示摘要(selectedNpc, { cultivationSystemEnabled }),
        [cultivationSystemEnabled, selectedNpc]
    );
    const selectedNpcSecretPartRecords = React.useMemo(() => {
        const archive = selectedNpc?.图片档案?.香闺秘档部位档案;
        return [
            { part: '胸部' as const, label: '胸部特写', description: selectedNpc?.胸部描述 || '暂无记录', result: archive?.胸部 },
            { part: '小穴' as const, label: '小穴特写', description: selectedNpc?.小穴描述 || '暂无记录', result: archive?.小穴 },
            { part: '屁穴' as const, label: '屁穴特写', description: selectedNpc?.屁穴描述 || '暂无记录', result: archive?.屁穴 }
        ];
    }, [selectedNpc]);
    const artistPresets = React.useMemo<画师串预设结构[]>(() => {
        const list = Array.isArray(presetFeature?.画师串预设列表) ? presetFeature.画师串预设列表 : [];
        return list.filter((item) => item && !String(item.id || '').startsWith('png_artist_') && (item.适用范围 === 'npc' || item.适用范围 === 'all'));
    }, [presetFeature?.画师串预设列表]);
    const sceneArtistPresets = React.useMemo<画师串预设结构[]>(() => {
        const list = Array.isArray(presetFeature?.画师串预设列表) ? presetFeature.画师串预设列表 : [];
        return list.filter((item) => item && !String(item.id || '').startsWith('png_artist_') && (item.适用范围 === 'scene' || item.适用范围 === 'all'));
    }, [presetFeature?.画师串预设列表]);
    const defaultArtistPresetId = React.useMemo(() => {
        const candidate = typeof presetFeature?.当前NPC画师串预设ID === 'string'
            ? presetFeature.当前NPC画师串预设ID.trim()
            : '';
        if (candidate && artistPresets.some((item) => item.id === candidate)) return candidate;
        return artistPresets[0]?.id || '';
    }, [artistPresets, presetFeature?.当前NPC画师串预设ID]);
    const defaultSceneArtistPresetId = React.useMemo(() => {
        const candidate = typeof presetFeature?.当前场景画师串预设ID === 'string'
            ? presetFeature.当前场景画师串预设ID.trim()
            : '';
        if (candidate && sceneArtistPresets.some((item) => item.id === candidate)) return candidate;
        return sceneArtistPresets[0]?.id || '';
    }, [presetFeature?.当前场景画师串预设ID, sceneArtistPresets]);
    const defaultPngPresetId = React.useMemo(() => {
        const candidate = typeof presetFeature?.当前PNG画风预设ID === 'string'
            ? presetFeature.当前PNG画风预设ID.trim()
            : '';
        if (candidate && pngStylePresets.some((item) => item.id === candidate)) return candidate;
        return pngStylePresets[0]?.id || '';
    }, [pngStylePresets, presetFeature?.当前PNG画风预设ID]);

    React.useEffect(() => {
        if (manualArtistPresetId && artistPresets.some((item) => item.id === manualArtistPresetId)) {
            return;
        }
        setManualArtistPresetId(defaultArtistPresetId || '');
    }, [artistPresets, defaultArtistPresetId, manualArtistPresetId]);
    React.useEffect(() => {
        if (manualPngPresetId && pngStylePresets.some((item) => item.id === manualPngPresetId)) {
            return;
        }
        setManualPngPresetId(defaultPngPresetId || '');
    }, [defaultPngPresetId, manualPngPresetId, pngStylePresets]);

    React.useEffect(() => {
        if (secretArtistPresetId && artistPresets.some((item) => item.id === secretArtistPresetId)) {
            return;
        }
        setSecretArtistPresetId(defaultArtistPresetId || '');
    }, [artistPresets, defaultArtistPresetId, secretArtistPresetId]);
    React.useEffect(() => {
        if (secretPngPresetId && pngStylePresets.some((item) => item.id === secretPngPresetId)) {
            return;
        }
        setSecretPngPresetId(defaultPngPresetId || '');
    }, [defaultPngPresetId, pngStylePresets, secretPngPresetId]);

    React.useEffect(() => {
        if (sceneManualArtistPresetId && sceneArtistPresets.some((item) => item.id === sceneManualArtistPresetId)) {
            return;
        }
        setSceneManualArtistPresetId(defaultSceneArtistPresetId || '');
    }, [defaultSceneArtistPresetId, sceneArtistPresets, sceneManualArtistPresetId]);
    React.useEffect(() => {
        if (sceneManualPngPresetId && pngStylePresets.some((item) => item.id === sceneManualPngPresetId)) {
            return;
        }
        setSceneManualPngPresetId(defaultPngPresetId || '');
    }, [defaultPngPresetId, pngStylePresets, sceneManualPngPresetId]);

    const selectedArtistPreset = React.useMemo(() => {
        return artistPresets.find((item) => item.id === manualArtistPresetId) || null;
    }, [artistPresets, manualArtistPresetId]);
    const selectedManualPngPreset = React.useMemo(() => {
        return pngStylePresets.find((item) => item.id === manualPngPresetId) || null;
    }, [manualPngPresetId, pngStylePresets]);
    const selectedSecretArtistPreset = React.useMemo(() => {
        return artistPresets.find((item) => item.id === secretArtistPresetId) || null;
    }, [artistPresets, secretArtistPresetId]);
    const selectedSecretPngPreset = React.useMemo(() => {
        return pngStylePresets.find((item) => item.id === secretPngPresetId) || null;
    }, [pngStylePresets, secretPngPresetId]);
    const selectedSceneArtistPreset = React.useMemo(() => {
        return sceneArtistPresets.find((item) => item.id === sceneManualArtistPresetId) || null;
    }, [sceneArtistPresets, sceneManualArtistPresetId]);
    const selectedScenePngPreset = React.useMemo(() => {
        return pngStylePresets.find((item) => item.id === sceneManualPngPresetId) || null;
    }, [pngStylePresets, sceneManualPngPresetId]);
    const editorArtistPresets = React.useMemo(
        () => (Array.isArray(presetFeature?.画师串预设列表) ? presetFeature.画师串预设列表 : [])
            .filter((item) => item && !String(item.id || '').startsWith('png_artist_')),
        [presetFeature?.画师串预设列表]
    );
    const characterAnchors = React.useMemo(
        () => (Array.isArray(presetFeature?.角色锚点列表) ? presetFeature.角色锚点列表 : []),
        [presetFeature?.角色锚点列表]
    );
    const characterAnchorNpcOptions = React.useMemo(() => {
        const optionMap = new Map<string, { id: string; 姓名: string; 是否失效: boolean }>();
        npcOptions.forEach((npc) => {
            const npcId = typeof npc?.id === 'string' ? npc.id.trim() : '';
            if (!npcId) return;
            optionMap.set(npcId, {
                id: npcId,
                姓名: typeof npc?.姓名 === 'string' && npc.姓名.trim() ? npc.姓名.trim() : npcId,
                是否失效: false
            });
        });
        characterAnchors.forEach((anchor) => {
            const npcId = typeof anchor?.npcId === 'string' ? anchor.npcId.trim() : '';
            if (!npcId || optionMap.has(npcId)) return;
            const fallbackName = (anchor?.名称 || '').trim() || npcId;
            optionMap.set(npcId, {
                id: npcId,
                姓名: `${fallbackName} · 已失效`,
                是否失效: true
            });
        });
        return Array.from(optionMap.values());
    }, [characterAnchors, npcOptions]);
    const autoNpcArtistPresets = React.useMemo(
        () => editorArtistPresets.filter((item) => item.适用范围 === 'npc' || item.适用范围 === 'all'),
        [editorArtistPresets]
    );
    const autoSceneArtistPresets = React.useMemo(
        () => editorArtistPresets.filter((item) => item.适用范围 === 'scene' || item.适用范围 === 'all'),
        [editorArtistPresets]
    );
    const 当前手动角色锚点 = React.useMemo(() => {
        if (!selectedNpcId) return null;
        return characterAnchors.find((item) => item.npcId === selectedNpcId) || null;
    }, [characterAnchors, selectedNpcId]);
    const editorScopedArtistPresets = React.useMemo(
        () => editorArtistPresets.filter((item) => item.适用范围 === artistPresetScope || item.适用范围 === 'all'),
        [artistPresetScope, editorArtistPresets]
    );
    const editorSelectedArtistPreset = React.useMemo(
        () => editorScopedArtistPresets.find((item) => item.id === editorArtistPresetId) || null,
        [editorArtistPresetId, editorScopedArtistPresets]
    );
    const editorTransformerPresets = React.useMemo(
        () => (Array.isArray(presetFeature?.词组转化器提示词预设列表) ? presetFeature.词组转化器提示词预设列表 : []),
        [presetFeature?.词组转化器提示词预设列表]
    );
    const editorModelTransformerPresets = React.useMemo(
        () => (Array.isArray(presetFeature?.模型词组转化器预设列表) ? presetFeature.模型词组转化器预设列表 : []),
        [presetFeature?.模型词组转化器预设列表]
    );
    const npcTransformerPresets = React.useMemo(
        () => editorTransformerPresets.filter((item) => item.类型 === 'npc'),
        [editorTransformerPresets]
    );
    const sceneTransformerPresets = React.useMemo(
        () => editorTransformerPresets.filter((item) => item.类型 === 'scene'),
        [editorTransformerPresets]
    );
    const sceneJudgePresets = React.useMemo(
        () => editorTransformerPresets.filter((item) => item.类型 === 'scene_judge'),
        [editorTransformerPresets]
    );
    const editorSelectedModelTransformerPreset = React.useMemo(
        () => editorModelTransformerPresets.find((item) => item.id === modelTransformerPresetEditorId) || null,
        [editorModelTransformerPresets, modelTransformerPresetEditorId]
    );
    const activeModelTransformerPreset = React.useMemo(
        () => editorModelTransformerPresets.find((item) => item.是否启用 === true) || null,
        [editorModelTransformerPresets]
    );
    const 当前生效NPC预设ID = activeModelTransformerPreset?.NPC词组转化器提示词预设ID || presetFeature?.当前NPC词组转化器提示词预设ID || '';
    const 当前生效场景预设ID = activeModelTransformerPreset?.场景词组转化器提示词预设ID || presetFeature?.当前场景词组转化器提示词预设ID || '';
    const 当前生效场景判定预设ID = activeModelTransformerPreset?.场景判定提示词预设ID || presetFeature?.当前场景判定提示词预设ID || '';
    const editorSelectedNpcTransformerPreset = React.useMemo(
        () => npcTransformerPresets.find((item) => item.id === npcTransformerPresetEditorId) || null,
        [npcTransformerPresets, npcTransformerPresetEditorId]
    );
    const editorSelectedSceneTransformerPreset = React.useMemo(
        () => sceneTransformerPresets.find((item) => item.id === sceneTransformerPresetEditorId) || null,
        [sceneTransformerPresets, sceneTransformerPresetEditorId]
    );
    const editorSelectedSceneJudgePreset = React.useMemo(
        () => sceneJudgePresets.find((item) => item.id === sceneJudgePresetEditorId) || null,
        [sceneJudgePresets, sceneJudgePresetEditorId]
    );

    React.useEffect(() => {
        if (editorArtistPresetId && editorScopedArtistPresets.some((item) => item.id === editorArtistPresetId)) {
            return;
        }
        const fallbackId = editorScopedArtistPresets[0]?.id
            || (artistPresetScope === 'scene' ? (presetFeature?.当前场景画师串预设ID || '') : (presetFeature?.当前NPC画师串预设ID || ''))
            || '';
        setEditorArtistPresetId(fallbackId);
    }, [artistPresetScope, editorArtistPresetId, editorScopedArtistPresets, presetFeature?.当前NPC画师串预设ID, presetFeature?.当前场景画师串预设ID]);

    React.useEffect(() => {
        if (modelTransformerPresetEditorId && editorModelTransformerPresets.some((item) => item.id === modelTransformerPresetEditorId)) {
            return;
        }
        setModelTransformerPresetEditorId(editorModelTransformerPresets[0]?.id || '');
    }, [editorModelTransformerPresets, modelTransformerPresetEditorId]);

    React.useEffect(() => {
        if (npcTransformerPresetEditorId && npcTransformerPresets.some((item) => item.id === npcTransformerPresetEditorId)) {
            return;
        }
        setNpcTransformerPresetEditorId(presetFeature?.当前NPC词组转化器提示词预设ID || npcTransformerPresets[0]?.id || '');
    }, [npcTransformerPresetEditorId, npcTransformerPresets, presetFeature?.当前NPC词组转化器提示词预设ID]);

    React.useEffect(() => {
        if (sceneTransformerPresetEditorId && sceneTransformerPresets.some((item) => item.id === sceneTransformerPresetEditorId)) {
            return;
        }
        setSceneTransformerPresetEditorId(presetFeature?.当前场景词组转化器提示词预设ID || sceneTransformerPresets[0]?.id || '');
    }, [sceneTransformerPresetEditorId, sceneTransformerPresets, presetFeature?.当前场景词组转化器提示词预设ID]);

    React.useEffect(() => {
        if (sceneJudgePresetEditorId && sceneJudgePresets.some((item) => item.id === sceneJudgePresetEditorId)) {
            return;
        }
        setSceneJudgePresetEditorId(presetFeature?.当前场景判定提示词预设ID || sceneJudgePresets[0]?.id || '');
    }, [sceneJudgePresetEditorId, sceneJudgePresets, presetFeature?.当前场景判定提示词预设ID]);

    React.useEffect(() => {
        if (characterAnchorNpcId) return;
        if (selectedNpc?.id) {
            setCharacterAnchorNpcId(selectedNpc.id);
            return;
        }
        if (characterAnchors[0]?.npcId) {
            setCharacterAnchorNpcId(characterAnchors[0].npcId);
        }
    }, [characterAnchorNpcId, characterAnchors, selectedNpc?.id]);

    React.useEffect(() => {
        const selected = (
            (characterAnchorEditorId
                ? characterAnchors.find((item) => item.id === characterAnchorEditorId)
                : null)
            || (characterAnchorNpcId
                ? characterAnchors.find((item) => item.npcId === characterAnchorNpcId)
                : null)
            || null
        );
        if (!selected) {
            if (characterAnchorEditorId) {
                setCharacterAnchorEditorId('');
            }
            setCharacterAnchorDraft(null);
            return;
        }
        if (selected.id !== characterAnchorEditorId) {
            setCharacterAnchorEditorId(selected.id);
        }
        if (selected.npcId && selected.npcId !== characterAnchorNpcId) {
            setCharacterAnchorNpcId(selected.npcId);
        }
        setCharacterAnchorDraft({ ...selected });
    }, [characterAnchorEditorId, characterAnchorNpcId, characterAnchors]);

    const filteredRecords = React.useMemo(() => {
        const keyword = (filters.角色姓名 || '').trim().toLowerCase();
        return records.filter((record) => {
            if (filters.目标类型 && filters.目标类型 !== '全部' && record.目标类型 !== filters.目标类型) {
                return false;
            }
            if (filters.角色标识 && record.NPC标识 !== filters.角色标识) {
                return false;
            }
            if (keyword && !record.NPC姓名.toLowerCase().includes(keyword)) {
                return false;
            }
            if (filters.状态 && filters.状态 !== '全部' && (record.结果?.状态 || 'success') !== filters.状态) {
                return false;
            }
            return true;
        });
    }, [records, filters]);

    const queueList = React.useMemo(() => {
        return (Array.isArray(queue) ? queue : []).slice().sort((a, b) => (b.创建时间 || 0) - (a.创建时间 || 0));
    }, [queue]);

    const filteredQueue = React.useMemo(() => {
        const keyword = (filters.角色姓名 || '').trim().toLowerCase();
        return queueList.filter((task) => {
            if (filters.角色标识 && !任务标识匹配NPC(task.NPC标识, filters.角色标识)) {
                return false;
            }
            if (keyword && !task.NPC姓名.toLowerCase().includes(keyword)) {
                return false;
            }
            if (filters.状态 && filters.状态 !== '全部') {
                if (filters.状态 === 'pending') {
                    return task.状态 === 'queued' || task.状态 === 'running';
                }
                return task.状态 === filters.状态;
            }
            return true;
        });
    }, [filters, queueList]);

    const combinedQueue = React.useMemo<合并队列记录[]>(() => {
        const sceneRecords = (Array.isArray(sceneQueue) ? sceneQueue : []).map((task) => ({
            类型: 'scene' as const,
            id: task.id,
            创建时间: task.创建时间 || 0,
            状态: task.状态,
            task
        }));
        const npcRecords = queueList.map((task) => ({
            类型: 'npc' as const,
            id: task.id,
            创建时间: task.创建时间 || 0,
            状态: task.状态,
            task
        }));
        return [...npcRecords, ...sceneRecords].sort((a, b) => b.创建时间 - a.创建时间);
    }, [queueList, sceneQueue]);

    const filteredCombinedQueue = React.useMemo(() => {
        const keyword = (filters.角色姓名 || '').trim().toLowerCase();
        return combinedQueue.filter((entry) => {
            if (filters.目标类型 && filters.目标类型 !== '全部' && entry.类型 !== filters.目标类型) {
                return false;
            }
            if (filters.状态 && filters.状态 !== '全部') {
                if (filters.状态 === 'pending') {
                    if (!(entry.状态 === 'queued' || entry.状态 === 'running')) return false;
                } else if (entry.状态 !== filters.状态) {
                    return false;
                }
            }
            if (!keyword) return true;
            if (entry.类型 === 'npc') {
                const task = entry.task as NPC生图任务记录;
                return (task.NPC姓名 || '').toLowerCase().includes(keyword);
            }
            const task = entry.task as 场景生图任务记录;
            const text = [task.摘要, task.场景类型, task.进度文本, '场景']
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return text.includes(keyword);
        });
    }, [combinedQueue, filters]);

    const 图片统计 = React.useMemo(() => ({
        total: records.length + ((Array.isArray(sceneArchive?.生图历史) ? sceneArchive.生图历史 : []).length),
        success: records.filter((item) => (item.结果?.状态 || 'success') === 'success').length + (Array.isArray(sceneArchive?.生图历史) ? sceneArchive.生图历史 : []).filter((item) => (item?.状态 || 'success') === 'success').length,
        failed: records.filter((item) => item.结果?.状态 === 'failed').length + (Array.isArray(sceneArchive?.生图历史) ? sceneArchive.生图历史 : []).filter((item) => item?.状态 === 'failed').length,
        pending: records.filter((item) => item.结果?.状态 === 'pending').length + (Array.isArray(sceneArchive?.生图历史) ? sceneArchive.生图历史 : []).filter((item) => item?.状态 === 'pending').length
    }), [records, sceneArchive]);

    const 队列统计 = React.useMemo(() => ({
        total: combinedQueue.length,
        queued: combinedQueue.filter((item) => item.状态 === 'queued').length,
        running: combinedQueue.filter((item) => item.状态 === 'running').length,
        success: combinedQueue.filter((item) => item.状态 === 'success').length,
        failed: combinedQueue.filter((item) => item.状态 === 'failed').length
    }), [combinedQueue]);

    const sceneHistory = React.useMemo(() => {
        return (Array.isArray(sceneArchive?.生图历史) ? sceneArchive.生图历史 : [])
            .slice()
            .sort((a, b) => (b?.生成时间 || 0) - (a?.生成时间 || 0));
    }, [sceneArchive]);

    const sceneQueueList = React.useMemo(() => {
        return (Array.isArray(sceneQueue) ? sceneQueue : []).slice().sort((a, b) => (b.创建时间 || 0) - (a.创建时间 || 0));
    }, [sceneQueue]);

    const sceneStats = React.useMemo(() => ({
        total: sceneHistory.length,
        success: sceneHistory.filter((item) => (item?.状态 || 'success') === 'success').length,
        failed: sceneHistory.filter((item) => item?.状态 === 'failed').length,
        pending: sceneHistory.filter((item) => item?.状态 === 'pending').length,
        queueTotal: sceneQueueList.length,
        queueRunning: sceneQueueList.filter((item) => item?.状态 === 'running').length
    }), [sceneHistory, sceneQueueList]);

    const sceneArchiveLimit = Math.max(1, Number(imageManagerConfig?.场景图历史上限) || 10);
    const 当前场景壁纸ID = sceneArchive?.当前壁纸图片ID || '';
    const 当前壁纸记录 = React.useMemo(() => {
        return sceneHistory.find((item) => item?.id === 当前场景壁纸ID)
            || (sceneArchive?.最近生图结果?.id === 当前场景壁纸ID ? sceneArchive.最近生图结果 : null);
    }, [sceneArchive, sceneHistory, 当前场景壁纸ID]);
    React.useEffect(() => {
        setSceneArchiveLimitDraft(String(sceneArchiveLimit));
    }, [sceneArchiveLimit]);
    const handleSaveSceneArchiveLimit = async () => {
        if (!onSaveImageManagerConfig) return;
        const nextLimit = Math.max(1, Math.min(100, Number(sceneArchiveLimitDraft) || sceneArchiveLimit));
        await onSaveImageManagerConfig({ 场景图历史上限: nextLimit });
        setSceneArchiveLimitDraft(String(nextLimit));
    };

    const npcLibraryGroups = React.useMemo<NPC图库分组[]>(() => {
        const recordMap = new Map<string, NPC图片记录[]>();
        filteredRecords.forEach((record) => {
            const key = record.NPC标识 || '';
            if (!key) return;
            const current = recordMap.get(key) || [];
            current.push(record);
            recordMap.set(key, current);
        });
        return npcOptions
            .map((npc) => ({
                npc,
                records: recordMap.get(npc.id) || []
            }))
            .filter((group) => group.records.length > 0);
    }, [filteredRecords, npcOptions]);

    React.useEffect(() => {
        if (activeTab !== 'library') return;
        if (!npcLibraryGroups.length) {
            setLibraryNpcId('');
            return;
        }
        const exists = npcLibraryGroups.some((group) => group.npc.id === libraryNpcId);
        if (!libraryNpcId || !exists) {
            setLibraryNpcId(npcLibraryGroups[0].npc.id);
        }
    }, [activeTab, npcLibraryGroups, libraryNpcId]);

    const currentLibraryGroup = React.useMemo(() => {
        return npcLibraryGroups.find((group) => group.npc.id === libraryNpcId) || null;
    }, [npcLibraryGroups, libraryNpcId]);

    const historyRecords = React.useMemo(() => filteredRecords.slice(), [filteredRecords]);
    const combinedHistoryRecords = React.useMemo<合并历史记录[]>(() => {
        const npcItems: 合并历史记录[] = filteredRecords.map((record) => ({
            类型: 'npc',
            key: `${record.NPC标识}_${record.结果?.id || record.结果?.生成时间 || Math.random()}`,
            时间: record.结果?.生成时间 || 0,
            状态: record.结果?.状态 || 'success',
            npcRecord: record
        }));
        const sceneItems: 合并历史记录[] = sceneHistory
            .filter((result) => {
                if (filters.目标类型 && filters.目标类型 !== '全部' && filters.目标类型 !== 'scene') return false;
                if (filters.状态 && filters.状态 !== '全部' && (result?.状态 || 'success') !== filters.状态) return false;
                const keyword = (filters.角色姓名 || '').trim().toLowerCase();
                if (!keyword) return true;
                const text = [result?.摘要, result?.场景类型, result?.画风, result?.画师串, result?.使用模型, '场景']
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                return text.includes(keyword);
            })
            .map((result) => ({
                类型: 'scene' as const,
                key: `scene_${result?.id || result?.生成时间 || Math.random()}`,
                时间: result?.生成时间 || 0,
                状态: result?.状态 || 'success',
                sceneRecord: result
            }));
        return [...npcItems, ...sceneItems].sort((a, b) => b.时间 - a.时间);
    }, [filteredRecords, filters, sceneHistory]);

    const recentQueueTask = React.useMemo(() => {
        if (!selectedNpcId) return null;
        return queueList.find((task) => 任务标识匹配NPC(task.NPC标识, selectedNpcId)) || null;
    }, [queueList, selectedNpcId]);

    const recentManualQueueTask = React.useMemo(() => {
        if (!selectedNpcId || !manualSubmitAt) return null;
        return queueList.find((task) => 任务标识匹配NPC(task.NPC标识, selectedNpcId) && (task.创建时间 || 0) >= manualSubmitAt) || null;
    }, [queueList, selectedNpcId, manualSubmitAt]);
    const recentSecretQueueTask = React.useMemo(() => {
        if (!selectedNpcId || !secretSubmitAt) return null;
        return queueList.find((task) => (
            任务标识匹配NPC(task.NPC标识, selectedNpcId)
            && task.构图 === '部位特写'
            && (task.创建时间 || 0) >= secretSubmitAt
        )) || null;
    }, [queueList, secretSubmitAt, selectedNpcId]);

    const manualActiveTask = recentManualQueueTask || recentQueueTask;
    const selectedNpcLatestRecord = React.useMemo(() => {
        if (!selectedNpcId) return null;
        return records.find((record) => record.NPC标识 === selectedNpcId && record.结果?.构图 !== '部位特写')
            || (selectedNpc?.最近生图结果 ? {
                目标类型: 'npc' as const,
                NPC标识: selectedNpc.id,
                NPC姓名: selectedNpc.姓名,
                NPC性别: selectedNpc.性别,
                是否主要角色: selectedNpc.是否主要角色,
                结果: selectedNpc.最近生图结果
            } : null);
    }, [records, selectedNpc, selectedNpcId]);
    const selectedNpcPreviewImage = selectedNpcLatestRecord ? 获取图片展示地址(selectedNpcLatestRecord.结果) : '';
    const 打开图片查看器 = React.useCallback((src?: string, alt?: string) => {
        const normalizedSrc = typeof src === 'string' ? src.trim() : '';
        if (!normalizedSrc) return;
        setImageViewer({ src: normalizedSrc, alt: (alt || '图片预览').trim() || '图片预览' });
    }, []);

    const canSubmitManual = Boolean(onGenerateImage && selectedNpcId && manualFlowStage !== 'submitting');

    const withBusyAction = async (key: string, runner: () => Promise<void> | void) => {
        if (busyActionKey) return;
        setBusyActionKey(key);
        setActionError('');
        try {
            await runner();
        } catch (error: any) {
            const message = typeof error?.message === 'string' && error.message.trim()
                ? error.message.trim()
                : '操作失败';
            setActionError(message);
        } finally {
            setBusyActionKey('');
        }
    };
    const handleSubmitSecretPart = async (part: 香闺秘档部位类型 | '全部') => {
        if (!onGenerateSecretPartImage || !selectedNpcId) return;
        const resolvedStyle = secretStyle === '二次元' || secretStyle === '写实' || secretStyle === '国风'
            ? secretStyle
            : undefined;
        const resolvedSize = secretSizeValue;
        const resolvedExtraRequirement = secretExtraRequirement.trim();
        setSecretSubmitAt(Date.now());
        setSecretStatusText(part === '全部'
            ? '三处特写已提交，正在加入图片队列。'
            : `${part}特写已提交，正在加入图片队列。`);
        setActionError('');
        await withBusyAction(`secret_part_${selectedNpcId}_${part}`, async () => {
            try {
                await onGenerateSecretPartImage(selectedNpcId, part, {
                    画风: resolvedStyle,
                    画师串预设ID: secretArtistPresetId || undefined,
                    PNG画风预设ID: secretPngPresetId || undefined,
                    额外要求: resolvedExtraRequirement || undefined,
                    尺寸: resolvedSize,
                    后台处理: manualBackgroundMode
                });
                setSecretStatusText(part === '全部'
                    ? (manualBackgroundMode ? '三处特写已转入后台，可在图片队列查看进度。' : '三处特写生成完成，历史记录已更新。')
                    : (manualBackgroundMode ? `${part}特写已转入后台，可在图片队列查看进度。` : `${part}特写生成完成，历史记录已更新。`));
            } catch (error) {
                setSecretStatusText(part === '全部'
                    ? '三处特写提交后出现失败，请查看下方状态或队列。'
                    : `${part}特写提交后出现失败，请查看下方状态或队列。`);
                throw error;
            }
        });
    };

    const 打开手动生图页 = (npcId?: string, composition?: '头像' | '半身' | '立绘') => {
        if (npcId) {
            setSelectedNpcId(npcId);
        }
        if (composition) {
            setManualComposition(composition);
        }
        setManualError('');
        setManualStatusText('');
        setActionError('');
        setActiveTab('manual');
    };

    const handleOpenConfirm = () => {
        if (!selectedNpcId) {
            setManualError('请先选择需要手动生图的角色。');
            return;
        }
        if (manualComposition === '自定义' && !manualCustomComposition.trim()) {
            setManualError('请先填写自定义构图描述。');
            return;
        }
        setManualError('');
        setManualStatusText('');
        setActionError('');
        if (manualBackgroundMode) {
            void handleSubmitManual();
            return;
        }
        setManualFlowStage('confirm');
    };

    const handleCancelConfirm = () => {
        if (manualFlowStage === 'submitting') return;
        setManualFlowStage('idle');
    };

    const handleCancelSubmitting = () => {
        if (manualFlowStage !== 'submitting') return;
        setManualFlowStage('idle');
        setManualStatusText('已取消当前提交弹层等待；后台任务仍可能继续执行，可在队列中查看状态。');
    };

    const handleSubmitManual = async () => {
        if (!onGenerateImage || !selectedNpcId) return;
        if (manualComposition === '自定义' && !manualCustomComposition.trim()) {
            setManualError('请先填写自定义构图描述。');
            return;
        }
        const customCompositionText = manualComposition === '自定义'
            ? manualCustomComposition.trim()
            : '';
        const mergedExtraRequirement = [
            customCompositionText ? `构图要求：${customCompositionText}` : '',
            manualExtraRequirement.trim()
        ].filter(Boolean).join('。');
        const resolvedComposition: '头像' | '半身' | '立绘' = manualComposition === '自定义'
            ? '立绘'
            : manualComposition;
        const resolvedStyle = manualStyle === '二次元' || manualStyle === '写实' || manualStyle === '国风'
            ? manualStyle
            : undefined;
        const resolvedSize = isCustomComposition
            ? manualSizeValue
            : undefined;
        setManualFlowStage('submitting');
        setManualSubmitAt(Date.now());
        setManualError('');
        setManualStatusText(manualBackgroundMode ? '任务正在转入后台处理，可直接返回主界面。' : '正在提交任务并写入真实队列状态...');
        try {
            await onGenerateImage(selectedNpcId, {
                构图: resolvedComposition,
                画风: resolvedStyle,
                尺寸: resolvedSize,
                画师串预设ID: manualArtistPresetId || undefined,
                PNG画风预设ID: manualPngPresetId || undefined,
                额外要求: mergedExtraRequirement || undefined,
                后台处理: manualBackgroundMode
            });
            setManualStatusText(manualBackgroundMode ? '后台任务已提交，可关闭当前页面。' : '任务已提交。');
            if (manualBackgroundMode) {
                setManualFlowStage('idle');
            }
        } catch (error: any) {
            const message = typeof error?.message === 'string' && error.message.trim()
                ? error.message.trim()
                : '手动生图提交失败';
            setManualError(message);
            setManualFlowStage('confirm');
            setManualStatusText('');
        }
    };

    React.useEffect(() => {
        if (manualFlowStage !== 'submitting') return;
        if (manualBackgroundMode) return;
        const activeTask = recentManualQueueTask || recentQueueTask;
        if (!activeTask) return;
        if (activeTask.状态 === 'success') {
            const timer = window.setTimeout(() => {
                setManualFlowStage('idle');
                setManualStatusText('任务已完成，已自动关闭提交层。');
            }, 450);
            return () => window.clearTimeout(timer);
        }
    }, [manualBackgroundMode, manualFlowStage, recentManualQueueTask, recentQueueTask]);

    const handleDeleteImageRecord = async (npcId: string, imageId?: string) => {
        if (!onDeleteImageRecord || !npcId || !imageId) return;
        await withBusyAction(`delete_image_${imageId}`, async () => {
            await onDeleteImageRecord(npcId, imageId);
        });
    };

    const handleClearNpcHistory = async (npcId: string) => {
        if (!onClearImageHistory || !npcId) return;
        await withBusyAction(`clear_npc_history_${npcId}`, async () => {
            await onClearImageHistory(npcId);
        });
    };

    const handleClearAllHistory = async () => {
        if (!onClearImageHistory) return;
        await withBusyAction('clear_all_history', async () => {
            await onClearImageHistory();
        });
    };

    const handleDeleteQueueTask = async (taskId: string) => {
        if (!onDeleteQueueTask || !taskId) return;
        await withBusyAction(`delete_queue_${taskId}`, async () => {
            await onDeleteQueueTask(taskId);
        });
    };

    const handleClearQueue = async (mode: 'all' | 'completed') => {
        if (!onClearQueue) return;
        await withBusyAction(`clear_queue_${mode}`, async () => {
            await onClearQueue(mode);
        });
    };

    const handleSelectAvatarImage = async (npcId: string, imageId?: string) => {
        if (!onSelectAvatarImage || !npcId || !imageId) return;
        await withBusyAction(`select_avatar_${imageId}`, async () => {
            await onSelectAvatarImage(npcId, imageId);
        });
    };

    const handleClearAvatarImage = async (npcId: string) => {
        if (!onClearAvatarImage || !npcId) return;
        await withBusyAction(`clear_avatar_${npcId}`, async () => {
            await onClearAvatarImage(npcId);
        });
    };

    const handleSelectPortraitImage = async (npcId: string, imageId?: string) => {
        if (!onSelectPortraitImage || !npcId || !imageId) return;
        await withBusyAction(`select_portrait_${imageId}`, async () => {
            await onSelectPortraitImage(npcId, imageId);
        });
    };

    const handleClearPortraitImage = async (npcId: string) => {
        if (!onClearPortraitImage || !npcId) return;
        await withBusyAction(`clear_portrait_${npcId}`, async () => {
            await onClearPortraitImage(npcId);
        });
    };

    const handleSelectBackgroundImage = async (npcId: string, imageId?: string) => {
        if (!onSelectBackgroundImage || !npcId || !imageId) return;
        await withBusyAction(`select_background_${imageId}`, async () => {
            await onSelectBackgroundImage(npcId, imageId);
        });
    };

    const handleClearBackgroundImage = async (npcId: string) => {
        if (!onClearBackgroundImage || !npcId) return;
        await withBusyAction(`clear_background_${npcId}`, async () => {
            await onClearBackgroundImage(npcId);
        });
    };

    const handleSaveNpcImageLocally = async (npcId: string, imageId?: string) => {
        if (!onSaveImageLocally || !npcId || !imageId) return;
        await withBusyAction(`local_npc_${imageId}`, async () => {
            await onSaveImageLocally(npcId, imageId);
        });
    };

    const handleGenerateSceneImage = async () => {
        if (!onGenerateSceneImage) return;
        const resolvedExtraRequirement = sceneExtraRequirement.trim();
        setSceneStatusText(manualBackgroundMode ? '场景任务正在转入后台处理，可直接继续其他操作。' : '正在提交场景生成任务...');
        await withBusyAction('generate_scene_image', async () => {
            await onGenerateSceneImage({
                画师串预设ID: sceneManualArtistPresetId || undefined,
                PNG画风预设ID: sceneManualPngPresetId || undefined,
                构图要求: sceneCompositionRequirement,
                尺寸: sceneResolution || undefined,
                额外要求: resolvedExtraRequirement || undefined,
                后台处理: manualBackgroundMode
            });
            setSceneStatusText(manualBackgroundMode ? '场景任务已转入后台，可在场景队列查看进度。' : '场景任务已提交，请等待队列状态更新。');
        });
    };

    const handleApplySceneWallpaper = async (imageId?: string) => {
        if (!onApplySceneWallpaper || !imageId) return;
        await withBusyAction(`apply_scene_${imageId}`, async () => {
            await onApplySceneWallpaper(imageId);
        });
    };

    const handleClearSceneWallpaper = async () => {
        if (!onClearSceneWallpaper) return;
        await withBusyAction('clear_scene_wallpaper', async () => {
            await onClearSceneWallpaper();
        });
    };

    const handleDeleteSceneImage = async (imageId?: string) => {
        if (!onDeleteSceneImage || !imageId) return;
        await withBusyAction(`delete_scene_${imageId}`, async () => {
            await onDeleteSceneImage(imageId);
        });
    };

    const handleClearSceneHistory = async () => {
        if (!onClearSceneHistory) return;
        await withBusyAction('clear_scene_history', async () => {
            await onClearSceneHistory();
        });
    };

    const handleDeleteSceneQueueTask = async (taskId: string) => {
        if (!onDeleteSceneQueueTask || !taskId) return;
        await withBusyAction(`delete_scene_queue_${taskId}`, async () => {
            await onDeleteSceneQueueTask(taskId);
        });
    };

    const handleClearSceneQueue = async (mode: 'all' | 'completed') => {
        if (!onClearSceneQueue) return;
        await withBusyAction(`clear_scene_queue_${mode}`, async () => {
            await onClearSceneQueue(mode);
        });
    };

    const handleSaveSceneImageLocally = async (imageId?: string) => {
        if (!onSaveSceneImageLocally || !imageId) return;
        await withBusyAction(`local_scene_${imageId}`, async () => {
            await onSaveSceneImageLocally(imageId);
        });
    };

    const handleSetPersistentWallpaper = async (imageUrl?: string) => {
        if (!onSetPersistentWallpaper || !imageUrl) return;
        await withBusyAction(`set_persistent_wallpaper_${imageUrl}`, async () => {
            await onSetPersistentWallpaper(imageUrl);
        });
    };

    const handleClearPersistentWallpaper = async () => {
        if (!onClearPersistentWallpaper) return;
        await withBusyAction('clear_persistent_wallpaper', async () => {
            await onClearPersistentWallpaper();
        });
    };

    const updatePresetFeature = (updater: (feature: 接口设置结构['功能模型占位']) => 接口设置结构['功能模型占位']) => {
        setPresetConfig((prev) => {
            return {
                ...prev,
                功能模型占位: updater(prev.功能模型占位)
            };
        });
    };

    const updatePngPresetDraft = (updater: (preset: PNG画风预设结构) => PNG画风预设结构) => {
        setPngPresetDraft((prev) => {
            if (!prev) return prev;
            return updater(prev);
        });
    };

    const handleImportPngFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setPngImportStage('parsing');
        setPngImportMessage(`正在解析与提炼：${file.name}`);
        await withBusyAction(`import_png_${file.name}`, async () => {
            if (!onParsePngStylePreset) return;
            try {
                const preset = await onParsePngStylePreset(file, {
                    预设名称: pngPresetImportName.trim() || undefined,
                    额外要求: pngPresetImportRequirement.trim() || undefined,
                    后台处理: manualBackgroundMode
                });
                if (manualBackgroundMode) {
                    setPngImportStage('done');
                    setPngImportMessage('PNG 已转入后台解析，可继续其他操作。');
                    setPngPresetImportName('');
                    setPngPresetImportRequirement('');
                    return;
                }
                if (preset && preset.id) {
                    setPngPresetEditorId(preset.id);
                    setActiveTab('presets');
                    setPngImportStage('done');
                    setPngImportMessage('PNG 已解析完成，画风预设已更新。');
                } else {
                    setPngImportStage('error');
                    setPngImportMessage('PNG 解析失败：未返回预设数据。');
                }
                setPngPresetImportName('');
                setPngPresetImportRequirement('');
            } catch (error: any) {
                const message = typeof error?.message === 'string' && error.message.trim()
                    ? error.message.trim()
                    : 'PNG 解析失败。';
                setPngImportStage('error');
                setPngImportMessage(message);
                throw error;
            }
        });
        event.target.value = '';
    };

    const handleSavePngPreset = async () => {
        if (!onSavePngStylePreset || !pngPresetDraft) return;
        await withBusyAction(`save_png_preset_${pngPresetDraft.id}`, async () => {
            await onSavePngStylePreset({
                ...pngPresetDraft,
                名称: (pngPresetDraft.名称 || '').trim() || 'PNG画风预设',
                原始正面提示词: (pngPresetDraft.原始正面提示词 || '').trim(),
                剥离后正面提示词: (pngPresetDraft.剥离后正面提示词 || '').trim(),
                AI提炼正面提示词: (pngPresetDraft.AI提炼正面提示词 || '').trim(),
                正面提示词: (pngPresetDraft.正面提示词 || '').trim(),
                负面提示词: (pngPresetDraft.负面提示词 || '').trim(),
                画师串: (pngPresetDraft.画师串 || '').trim(),
                画师命中项: Array.isArray(pngPresetDraft.画师命中项) ? pngPresetDraft.画师命中项.map((item) => String(item).trim()).filter(Boolean) : [],
                updatedAt: Date.now()
            });
        });
    };

    const handleDeletePngPreset = async () => {
        if (!onDeletePngStylePreset || !pngPresetDraft?.id) return;
        await withBusyAction(`delete_png_preset_${pngPresetDraft.id}`, async () => {
            await onDeletePngStylePreset(pngPresetDraft.id);
            setPngPresetEditorId(pngStylePresets[0]?.id || '');
        });
    };

    const updateArtistPreset = (presetId: string, updater: (preset: 画师串预设结构) => 画师串预设结构) => {
        updatePresetFeature((feature) => ({
            ...feature,
            画师串预设列表: (Array.isArray(feature.画师串预设列表) ? feature.画师串预设列表 : []).map((preset) => (
                preset.id === presetId ? updater(preset) : preset
            ))
        }));
    };

    const updateTransformerPreset = (presetId: string, updater: (preset: 词组转化器提示词预设结构) => 词组转化器提示词预设结构) => {
        updatePresetFeature((feature) => ({
            ...feature,
            词组转化器提示词预设列表: (Array.isArray(feature.词组转化器提示词预设列表) ? feature.词组转化器提示词预设列表 : []).map((preset) => (
                preset.id === presetId ? updater(preset) : preset
            ))
        }));
    };

    const updateModelTransformerPreset = (presetId: string, updater: (preset: 模型词组转化器预设结构) => 模型词组转化器预设结构) => {
        updatePresetFeature((feature) => ({
            ...feature,
            模型词组转化器预设列表: (Array.isArray(feature.模型词组转化器预设列表) ? feature.模型词组转化器预设列表 : []).map((preset) => (
                preset.id === presetId ? updater(preset) : preset
            ))
        }));
    };

    const handleToggleModelTransformerPreset = (presetId: string, enabled: boolean) => {
        updatePresetFeature((feature) => ({
            ...feature,
            模型词组转化器预设列表: (Array.isArray(feature.模型词组转化器预设列表) ? feature.模型词组转化器预设列表 : []).map((preset) => {
                if (preset.id === presetId) {
                    return { ...preset, 是否启用: enabled, updatedAt: Date.now() };
                }
                return enabled ? { ...preset, 是否启用: false, updatedAt: Date.now() } : preset;
            })
        }));
    };

    const handleSelectAutoArtistPreset = (scope: 'npc' | 'scene', presetId: string) => {
        updatePresetFeature((feature) => ({
            ...feature,
            当前NPC画师串预设ID: scope === 'npc' ? presetId : feature.当前NPC画师串预设ID,
            当前场景画师串预设ID: scope === 'scene' ? presetId : feature.当前场景画师串预设ID
        }));
    };

    const handleSelectAutoPngPreset = (scope: 'npc' | 'scene', presetId: string) => {
        updatePresetFeature((feature) => ({
            ...feature,
            当前NPCPNG画风预设ID: scope === 'npc' ? presetId : feature.当前NPCPNG画风预设ID,
            当前场景PNG画风预设ID: scope === 'scene' ? presetId : feature.当前场景PNG画风预设ID
        }));
    };

    const handleSelectDefaultNpcTransformerPreset = (presetId: string) => {
        updatePresetFeature((feature) => ({
            ...feature,
            当前NPC词组转化器提示词预设ID: presetId
        }));
    };

    const handleSelectDefaultSceneTransformerPreset = (presetId: string) => {
        updatePresetFeature((feature) => ({
            ...feature,
            当前场景词组转化器提示词预设ID: presetId
        }));
    };

    const handleSelectDefaultSceneJudgePreset = (presetId: string) => {
        updatePresetFeature((feature) => ({
            ...feature,
            当前场景判定提示词预设ID: presetId
        }));
    };

    const handleAddArtistPreset = () => {
        const now = Date.now();
        const nextPreset: 画师串预设结构 = {
            id: 生成预设ID('artist_preset'),
            名称: artistPresetScope === 'scene' ? '新建场景画师串' : '新建NPC画师串',
            适用范围: artistPresetScope,
            画师串: '',
            正面提示词: '',
            负面提示词: '',
            createdAt: now,
            updatedAt: now
        };
        updatePresetFeature((feature) => ({
            ...feature,
            画师串预设列表: [...(Array.isArray(feature.画师串预设列表) ? feature.画师串预设列表 : []), nextPreset],
            当前NPC画师串预设ID: artistPresetScope === 'npc' ? nextPreset.id : feature.当前NPC画师串预设ID,
            当前场景画师串预设ID: artistPresetScope === 'scene' ? nextPreset.id : feature.当前场景画师串预设ID
        }));
        setEditorArtistPresetId(nextPreset.id);
    };

    const handleDeleteArtistPreset = () => {
        if (!editorSelectedArtistPreset) return;
        updatePresetFeature((feature) => {
            const remaining = (Array.isArray(feature.画师串预设列表) ? feature.画师串预设列表 : []).filter((item) => item.id !== editorSelectedArtistPreset.id);
            return {
                ...feature,
                画师串预设列表: remaining,
                当前NPC画师串预设ID: feature.当前NPC画师串预设ID === editorSelectedArtistPreset.id
                    ? ''
                    : feature.当前NPC画师串预设ID,
                当前场景画师串预设ID: feature.当前场景画师串预设ID === editorSelectedArtistPreset.id
                    ? ''
                    : feature.当前场景画师串预设ID
            };
        });
    };

    const handleAddModelTransformerPreset = () => {
        const now = Date.now();
        const nextPreset: 模型词组转化器预设结构 = {
            id: 生成预设ID('transformer_model'),
            名称: '新建模型预设',
            是否启用: true,
            模型专属提示词: '',
            锚定模式模型提示词: '',
            NPC词组转化器提示词预设ID: presetFeature?.当前NPC词组转化器提示词预设ID || npcTransformerPresets[0]?.id || '',
            场景词组转化器提示词预设ID: presetFeature?.当前场景词组转化器提示词预设ID || sceneTransformerPresets[0]?.id || '',
            场景判定提示词预设ID: presetFeature?.当前场景判定提示词预设ID || sceneJudgePresets[0]?.id || '',
            createdAt: now,
            updatedAt: now
        };
        updatePresetFeature((feature) => ({
            ...feature,
            模型词组转化器预设列表: [
                ...(Array.isArray(feature.模型词组转化器预设列表) ? feature.模型词组转化器预设列表 : []).map((preset) => ({
                    ...preset,
                    是否启用: false
                })),
                nextPreset
            ]
        }));
        setModelTransformerPresetEditorId(nextPreset.id);
    };

    const handleAddNpcTransformerPreset = () => {
        const now = Date.now();
        const nextPreset: 词组转化器提示词预设结构 = {
            id: 生成预设ID('transformer_preset'),
            名称: '新建NPC预设',
            类型: 'npc',
            提示词: '',
            角色锚定模式提示词: '',
            无锚点回退提示词: '',
            输出格式提示词: '',
            createdAt: now,
            updatedAt: now
        };
        updatePresetFeature((feature) => ({
            ...feature,
            词组转化器提示词预设列表: [...(Array.isArray(feature.词组转化器提示词预设列表) ? feature.词组转化器提示词预设列表 : []), nextPreset],
            当前NPC词组转化器提示词预设ID: nextPreset.id
        }));
        setNpcTransformerPresetEditorId(nextPreset.id);
    };

    const handleAddSceneTransformerPreset = () => {
        const now = Date.now();
        const nextPreset: 词组转化器提示词预设结构 = {
            id: 生成预设ID('transformer_preset'),
            名称: '新建场景预设',
            类型: 'scene',
            提示词: '',
            场景角色锚定模式提示词: '',
            无锚点回退提示词: '',
            输出格式提示词: '',
            createdAt: now,
            updatedAt: now
        };
        updatePresetFeature((feature) => ({
            ...feature,
            词组转化器提示词预设列表: [...(Array.isArray(feature.词组转化器提示词预设列表) ? feature.词组转化器提示词预设列表 : []), nextPreset],
            当前场景词组转化器提示词预设ID: nextPreset.id
        }));
        setSceneTransformerPresetEditorId(nextPreset.id);
    };

    const handleAddSceneJudgePreset = () => {
        const now = Date.now();
        const nextPreset: 词组转化器提示词预设结构 = {
            id: 生成预设ID('transformer_preset'),
            名称: '新建场景判定预设',
            类型: 'scene_judge',
            提示词: '',
            输出格式提示词: '',
            createdAt: now,
            updatedAt: now
        };
        updatePresetFeature((feature) => ({
            ...feature,
            词组转化器提示词预设列表: [...(Array.isArray(feature.词组转化器提示词预设列表) ? feature.词组转化器提示词预设列表 : []), nextPreset],
            当前场景判定提示词预设ID: nextPreset.id
        }));
        setSceneJudgePresetEditorId(nextPreset.id);
    };

    const handleDeleteModelTransformerPreset = () => {
        if (!editorSelectedModelTransformerPreset) return;
        const remaining = editorModelTransformerPresets.filter((item) => item.id !== editorSelectedModelTransformerPreset.id);
        updatePresetFeature((feature) => ({
            ...feature,
            模型词组转化器预设列表: (Array.isArray(feature.模型词组转化器预设列表) ? feature.模型词组转化器预设列表 : []).filter((item) => item.id !== editorSelectedModelTransformerPreset.id)
        }));
        setModelTransformerPresetEditorId(remaining[0]?.id || '');
    };

    const handleDeleteNpcTransformerPreset = () => {
        if (!editorSelectedNpcTransformerPreset) return;
        const removedId = editorSelectedNpcTransformerPreset.id;
        const remaining = npcTransformerPresets.filter((item) => item.id !== removedId);
        updatePresetFeature((feature) => ({
            ...feature,
            词组转化器提示词预设列表: (Array.isArray(feature.词组转化器提示词预设列表) ? feature.词组转化器提示词预设列表 : []).filter((item) => item.id !== removedId),
            当前NPC词组转化器提示词预设ID: feature.当前NPC词组转化器提示词预设ID === removedId ? '' : feature.当前NPC词组转化器提示词预设ID,
            模型词组转化器预设列表: (Array.isArray(feature.模型词组转化器预设列表) ? feature.模型词组转化器预设列表 : []).map((preset) => ({
                ...preset,
                NPC词组转化器提示词预设ID: preset.NPC词组转化器提示词预设ID === removedId ? '' : preset.NPC词组转化器提示词预设ID
            }))
        }));
        setNpcTransformerPresetEditorId(remaining[0]?.id || '');
    };

    const handleDeleteSceneTransformerPreset = () => {
        if (!editorSelectedSceneTransformerPreset) return;
        const removedId = editorSelectedSceneTransformerPreset.id;
        const remaining = sceneTransformerPresets.filter((item) => item.id !== removedId);
        updatePresetFeature((feature) => ({
            ...feature,
            词组转化器提示词预设列表: (Array.isArray(feature.词组转化器提示词预设列表) ? feature.词组转化器提示词预设列表 : []).filter((item) => item.id !== removedId),
            当前场景词组转化器提示词预设ID: feature.当前场景词组转化器提示词预设ID === removedId ? '' : feature.当前场景词组转化器提示词预设ID,
            模型词组转化器预设列表: (Array.isArray(feature.模型词组转化器预设列表) ? feature.模型词组转化器预设列表 : []).map((preset) => ({
                ...preset,
                场景词组转化器提示词预设ID: preset.场景词组转化器提示词预设ID === removedId ? '' : preset.场景词组转化器提示词预设ID
            }))
        }));
        setSceneTransformerPresetEditorId(remaining[0]?.id || '');
    };

    const handleDeleteSceneJudgePreset = () => {
        if (!editorSelectedSceneJudgePreset) return;
        const removedId = editorSelectedSceneJudgePreset.id;
        const remaining = sceneJudgePresets.filter((item) => item.id !== removedId);
        updatePresetFeature((feature) => ({
            ...feature,
            词组转化器提示词预设列表: (Array.isArray(feature.词组转化器提示词预设列表) ? feature.词组转化器提示词预设列表 : []).filter((item) => item.id !== removedId),
            当前场景判定提示词预设ID: feature.当前场景判定提示词预设ID === removedId ? '' : feature.当前场景判定提示词预设ID,
            模型词组转化器预设列表: (Array.isArray(feature.模型词组转化器预设列表) ? feature.模型词组转化器预设列表 : []).map((preset) => ({
                ...preset,
                场景判定提示词预设ID: preset.场景判定提示词预设ID === removedId ? '' : preset.场景判定提示词预设ID
            }))
        }));
        setSceneJudgePresetEditorId(remaining[0]?.id || '');
    };

    const 导出JSON文件 = (filename: string, payload: unknown) => {
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
        URL.revokeObjectURL(url);
    };

    const handleExportArtistPresets = () => {
        导出JSON文件('artist-presets.json', {
            version: 1,
            presets: editorArtistPresets
        });
    };

    const handleExportModelTransformerPresets = () => {
        导出JSON文件('transformer-model-presets.json', {
            version: 1,
            presets: editorModelTransformerPresets
        });
    };

    const handleExportNpcTransformerPresets = () => {
        导出JSON文件('transformer-npc-presets.json', {
            version: 1,
            presets: npcTransformerPresets
        });
    };

    const handleExportSceneTransformerPresets = () => {
        导出JSON文件('transformer-scene-presets.json', {
            version: 1,
            presets: sceneTransformerPresets
        });
    };

    const handleExportSceneJudgePresets = () => {
        导出JSON文件('transformer-scene-judge-presets.json', {
            version: 1,
            presets: sceneJudgePresets
        });
    };

    const handleImportPresetFile = async (event: React.ChangeEvent<HTMLInputElement>, type: 'artist') => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const parsed = JSON.parse(await file.text());
            const presets = Array.isArray(parsed?.presets) ? parsed.presets : [];
            updatePresetFeature((feature) => ({
                ...feature,
                画师串预设列表: type === 'artist' ? presets : feature.画师串预设列表
            }));
        } catch (error: any) {
            setActionError(`导入预设失败：${error?.message || '文件格式错误'}`);
        } finally {
            event.target.value = '';
        }
    };

    const handleImportModelTransformerPresets = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const parsed = JSON.parse(await file.text());
            const presets = Array.isArray(parsed?.presets) ? parsed.presets : [];
            updatePresetFeature((feature) => ({
                ...feature,
                模型词组转化器预设列表: presets
            }));
        } catch (error: any) {
            setActionError(`导入预设失败：${error?.message || '文件格式错误'}`);
        } finally {
            event.target.value = '';
        }
    };

    const handleExtractCharacterAnchor = async () => {
        const targetNpcId = characterAnchorNpcId || characterAnchorDraft?.npcId || selectedNpc?.id || '';
        if (!targetNpcId || !onExtractCharacterAnchor) return;
        const targetNpc = npcOptions.find((item) => item.id === targetNpcId) || null;
        setCharacterAnchorExtractStage('extracting');
        setCharacterAnchorExtractMessage(`正在提取角色锚点：${targetNpc?.姓名 || '未命名角色'}`);
        await withBusyAction(`extract_character_anchor_${targetNpcId}`, async () => {
            try {
                const extracted = await onExtractCharacterAnchor(targetNpcId, {
                    名称: characterAnchorDraft?.名称 || (targetNpc?.姓名 ? `${targetNpc.姓名} 角色锚点` : '角色锚点'),
                    额外要求: characterAnchorExtractRequirement.trim() || undefined
                });
                if (extracted && typeof extracted === 'object' && 'id' in extracted && extracted.id && 角色锚点有可用内容(extracted)) {
                    setCharacterAnchorNpcId(targetNpcId);
                    setCharacterAnchorEditorId(extracted.id);
                    setCharacterAnchorDraft({ ...extracted });
                    setCharacterAnchorExtractStage('done');
                    setCharacterAnchorExtractMessage(`角色锚点已更新：${targetNpc?.姓名 || extracted.名称 || '未命名角色'}`);
                } else {
                    setCharacterAnchorExtractStage('error');
                    setCharacterAnchorExtractMessage('角色锚点提取失败：未返回有效内容。');
                }
            } catch (error: any) {
                const message = typeof error?.message === 'string' && error.message.trim()
                    ? error.message.trim()
                    : '角色锚点提取失败。';
                setCharacterAnchorExtractStage('error');
                setCharacterAnchorExtractMessage(message);
                throw error;
            }
        });
    };

    const handleSaveCharacterAnchor = async () => {
        const targetNpcId = characterAnchorDraft?.npcId || characterAnchorNpcId || '';
        if (!characterAnchorDraft || !targetNpcId || !onSaveCharacterAnchor) return;
        await withBusyAction(`save_character_anchor_${characterAnchorDraft.id || targetNpcId}`, async () => {
            const saved = await onSaveCharacterAnchor({
                ...characterAnchorDraft,
                npcId: targetNpcId,
                名称: (characterAnchorDraft.名称 || '').trim() || '角色锚点',
                正面提示词: (characterAnchorDraft.正面提示词 || '').trim(),
                负面提示词: (characterAnchorDraft.负面提示词 || '').trim(),
                updatedAt: Date.now()
            });
            if (saved && typeof saved === 'object' && 'id' in saved && saved.id) {
                setCharacterAnchorEditorId(saved.id);
                setCharacterAnchorDraft({ ...saved });
            }
        });
    };

    const handleDeleteCharacterAnchor = async () => {
        const anchorId = characterAnchorDraft?.id || characterAnchorEditorId;
        if (!anchorId || !onDeleteCharacterAnchor) return;
        await withBusyAction(`delete_character_anchor_${anchorId}`, async () => {
            await onDeleteCharacterAnchor(anchorId);
            setCharacterAnchorEditorId('');
            setCharacterAnchorNpcId('');
            setCharacterAnchorDraft(null);
        });
    };

    const handleImportTransformerPromptPresets = async (event: React.ChangeEvent<HTMLInputElement>, scope: 'npc' | 'scene' | 'scene_judge') => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const parsed = JSON.parse(await file.text());
            const presets = Array.isArray(parsed?.presets) ? parsed.presets : [];
            updatePresetFeature((feature) => {
                const preserved = (Array.isArray(feature.词组转化器提示词预设列表) ? feature.词组转化器提示词预设列表 : []).filter((item) => item.类型 !== scope);
                return {
                    ...feature,
                    词组转化器提示词预设列表: [...preserved, ...presets]
                };
            });
        } catch (error: any) {
            setActionError(`导入预设失败：${error?.message || '文件格式错误'}`);
        } finally {
            event.target.value = '';
        }
    };

    const handleSavePresetConfig = async () => {
        if (!onSaveApiConfig) return;
        await withBusyAction('save_preset_config', async () => {
            const normalized = 规范化接口设置(presetConfig);
            await onSaveApiConfig(normalized);
            setPresetConfig(normalized);
        });
    };

// @todo-replace: useImageManager/tabs/ManualTab
    const renderManualTab = () => (
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
            {/* 左侧：手动生成控制区 */}
            <div className="bg-[#0c0d0f]/90 border border-wuxia-gold/30 rounded shadow-[0_0_30px_rgba(212,175,55,0.05)] p-5 space-y-6 relative overflow-hidden flex flex-col">
                {/* 装饰性背景 */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[radial-gradient(circle,rgba(212,175,55,0.15)_0%,transparent_70%)] rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex items-center justify-between relative z-10 border-b border-wuxia-gold/10 pb-4">
                    <div>
                        <div className="text-wuxia-gold font-serif text-2xl tracking-widest text-shadow-glow">手动生成</div>
                        <div className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Manual Creation Array</div>
                    </div>
                    <div className="rounded border border-wuxia-gold/20 bg-black/40 px-3 py-1.5 text-right shrink-0">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">处理模式</div>
                        <div className="text-xs text-wuxia-gold mt-0.5">{manualBackgroundMode ? '后台队列' : '前台等待'}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <统计卡 label="当前角色" value={selectedNpc?.姓名 || '未选择'} tone="info" />
                    <统计卡 label="最近状态" value={manualActiveTask ? 队列状态文案[manualActiveTask.状态] : '暂无任务'} tone={manualActiveTask?.状态 === 'failed' ? 'danger' : manualActiveTask?.状态 === 'success' ? 'success' : manualActiveTask?.状态 === 'running' ? 'info' : 'default'} />
                </div>

                <div className={`rounded border px-4 py-3 text-xs relative z-10 ${
                    当前手动角色锚点?.是否启用 !== false
                        ? 'border-emerald-900/40 bg-emerald-950/20 text-emerald-300'
                        : 当前手动角色锚点
                            ? 'border-yellow-900/40 bg-yellow-950/20 text-yellow-300'
                            : 'border-wuxia-gold/15 bg-black/30 text-gray-400'
                }`}>
                    {!selectedNpcId
                        ? '未选择角色，无法检查角色锚点。'
                        : !当前手动角色锚点
                            ? '该角色未绑定角色锚点，手动生图将只使用常规提示词。'
                            : 当前手动角色锚点.是否启用 === false
                                ? `该角色已绑定角色锚点，但当前处于停用状态：${当前手动角色锚点.名称 || '未命名锚点'}`
                                : `该角色锚点已启用，手动生图会自动附加：${当前手动角色锚点.名称 || '未命名锚点'}`}
                </div>

                <div className="space-y-4 relative z-10">
                    <div className="space-y-2">
                        <label className={小标题样式}>选择角色</label>
                        <select
                            value={selectedNpcId}
                            onChange={(e) => {
                                setSelectedNpcId(e.target.value);
                                setManualError('');
                                setManualStatusText('');
                            }}
                            className="w-full rounded border border-wuxia-gold/20 bg-black/60 px-4 py-3 text-sm text-gray-200 outline-none focus:border-wuxia-gold/60 focus:bg-wuxia-gold/5 transition-all appearance-none"
                        >
                            {npcOptions.length <= 0 ? (
                                <option value="">暂无可选角色</option>
                            ) : (
                                npcOptions.map((npc) => (
                                    <option key={npc.id} value={npc.id} className="bg-gray-900">
                                        {npc.姓名}{npc.性别 ? ` · ${npc.性别}` : ''}{npc.是否主要角色 ? ' · 主要角色' : ''}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className={小标题样式}>构图预设</label>
                        <div className="grid grid-cols-4 gap-3">
                            <button type="button" onClick={() => setManualComposition('头像')} className={`rounded border p-3 text-center transition-all duration-300 ${manualComposition === '头像' ? 'border-wuxia-gold bg-wuxia-gold/20 text-wuxia-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'border-wuxia-gold/20 bg-black/40 text-gray-400 hover:border-wuxia-gold/50'}`}>
                                <div className="text-sm font-serif">头像</div>
                                <div className="text-[10px] mt-1 opacity-60">1:1 特写</div>
                            </button>
                            <button type="button" onClick={() => setManualComposition('半身')} className={`rounded border p-3 text-center transition-all duration-300 ${manualComposition === '半身' ? 'border-wuxia-gold bg-wuxia-gold/20 text-wuxia-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'border-wuxia-gold/20 bg-black/40 text-gray-400 hover:border-wuxia-gold/50'}`}>
                                <div className="text-sm font-serif">半身像</div>
                                <div className="text-[10px] mt-1 opacity-60">3:4 半身</div>
                            </button>
                            <button type="button" onClick={() => setManualComposition('立绘')} className={`rounded border p-3 text-center transition-all duration-300 ${manualComposition === '立绘' ? 'border-wuxia-gold bg-wuxia-gold/20 text-wuxia-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'border-wuxia-gold/20 bg-black/40 text-gray-400 hover:border-wuxia-gold/50'}`}>
                                <div className="text-sm font-serif">立绘</div>
                                <div className="text-[10px] mt-1 opacity-60">全身立绘</div>
                            </button>
                            <button type="button" onClick={() => setManualComposition('自定义')} className={`rounded border p-3 text-center transition-all duration-300 ${manualComposition === '自定义' ? 'border-wuxia-gold bg-wuxia-gold/20 text-wuxia-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'border-wuxia-gold/20 bg-black/40 text-gray-400 hover:border-wuxia-gold/50'}`}>
                                <div className="text-sm font-serif">自定义</div>
                                <div className="text-[10px] mt-1 opacity-60">构图描述</div>
                            </button>
                        </div>
                        {isCustomComposition && (
                            <div className="space-y-2">
                                <div className="text-[10px] text-gray-500">自定义构图说明</div>
                                <input
                                    value={manualCustomComposition}
                                    onChange={(e) => {
                                        setManualCustomComposition(e.target.value);
                                        setManualError('');
                                    }}
                                    placeholder="例如：45度侧脸半身、古风战斗姿势、低机位仰拍"
                                    className="w-full rounded border border-wuxia-gold/20 bg-black/60 px-3 py-2 text-xs text-gray-200 outline-none focus:border-wuxia-gold/60 focus:bg-wuxia-gold/5 transition-all"
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className={小标题样式}>画风选择</label>
                        <div className="grid grid-cols-5 gap-3">
                            {(['无要求', '通用', '二次元', '写实', '国风'] as const).map((style) => (
                                <button
                                    key={style}
                                    type="button"
                                    onClick={() => {
                                        setManualStyle(style);
                                    }}
                                    className={`rounded border px-3 py-2 text-xs font-serif transition-all duration-300 ${manualStyle === style ? 'border-wuxia-gold bg-wuxia-gold/20 text-wuxia-gold shadow-[0_0_12px_rgba(212,175,55,0.2)]' : 'border-wuxia-gold/20 bg-black/40 text-gray-400 hover:border-wuxia-gold/50'}`}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className={小标题样式}>分辨率 / 比例</label>
                        <div className="grid grid-cols-6 gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    if (!isCustomComposition) return;
                                    setManualSizePreset('none');
                                }}
                                disabled={!isCustomComposition}
                                className={`rounded border px-2 py-2 text-center text-xs transition-all duration-300 ${manualSizePreset === 'none' ? 'border-wuxia-gold bg-wuxia-gold/20 text-wuxia-gold shadow-[0_0_10px_rgba(212,175,55,0.2)]' : 'border-wuxia-gold/20 bg-black/40 text-gray-400 hover:border-wuxia-gold/50'} ${!isCustomComposition ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                无要求
                            </button>
                            {(['1:1', '3:4', '9:16', '16:9'] as const).map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => {
                                        if (!isCustomComposition) return;
                                        setManualSizePreset(preset);
                                    }}
                                    disabled={!isCustomComposition}
                                    className={`rounded border px-2 py-2 text-center text-xs transition-all duration-300 ${manualSizePreset === preset ? 'border-wuxia-gold bg-wuxia-gold/20 text-wuxia-gold shadow-[0_0_10px_rgba(212,175,55,0.2)]' : 'border-wuxia-gold/20 bg-black/40 text-gray-400 hover:border-wuxia-gold/50'} ${!isCustomComposition ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                    {preset}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    if (!isCustomComposition) return;
                                    setManualSizePreset('custom');
                                }}
                                disabled={!isCustomComposition}
                                className={`rounded border px-2 py-2 text-center text-xs transition-all duration-300 ${manualSizePreset === 'custom' ? 'border-wuxia-gold bg-wuxia-gold/20 text-wuxia-gold shadow-[0_0_10px_rgba(212,175,55,0.2)]' : 'border-wuxia-gold/20 bg-black/40 text-gray-400 hover:border-wuxia-gold/50'} ${!isCustomComposition ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                自定义
                            </button>
                        </div>
                        {isCustomComposition && manualSizePreset !== 'custom' && manualSizePreset !== 'none' && (
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-500">倍率</span>
                                {(['1x', '2x'] as const).map((scale) => (
                                    <button
                                        key={scale}
                                        type="button"
                                        onClick={() => setManualSizeScale(scale)}
                                        className={`rounded border px-2 py-1 text-[10px] transition-all duration-300 ${manualSizeScale === scale ? 'border-wuxia-gold bg-wuxia-gold/20 text-wuxia-gold' : 'border-wuxia-gold/20 bg-black/40 text-gray-400 hover:border-wuxia-gold/50'}`}
                                    >
                                        {scale.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <div className="text-[10px] text-gray-500">宽 (px)</div>
                                <input
                                    value={manualWidth}
                                    onChange={(e) => {
                                        setManualWidth(e.target.value);
                                        setManualSizePreset('custom');
                                    }}
                                    disabled={!isCustomComposition || manualSizePreset !== 'custom'}
                                    placeholder={manualPresetSize?.宽 || '1024'}
                                    className={`w-full rounded border border-wuxia-gold/20 bg-black/60 px-3 py-2 text-xs text-gray-200 outline-none transition-all ${!isCustomComposition || manualSizePreset !== 'custom' ? 'opacity-60 cursor-not-allowed' : 'focus:border-wuxia-gold/60 focus:bg-wuxia-gold/5'}`}
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="text-[10px] text-gray-500">高 (px)</div>
                                <input
                                    value={manualHeight}
                                    onChange={(e) => {
                                        setManualHeight(e.target.value);
                                        setManualSizePreset('custom');
                                    }}
                                    disabled={!isCustomComposition || manualSizePreset !== 'custom'}
                                    placeholder={manualPresetSize?.高 || '1024'}
                                    className={`w-full rounded border border-wuxia-gold/20 bg-black/60 px-3 py-2 text-xs text-gray-200 outline-none transition-all ${!isCustomComposition || manualSizePreset !== 'custom' ? 'opacity-60 cursor-not-allowed' : 'focus:border-wuxia-gold/60 focus:bg-wuxia-gold/5'}`}
                                />
                            </div>
                        </div>
                        <div className="text-[10px] text-gray-500">
                            当前尺寸：{manualSizeValue || (manualSizePreset === 'none' || !isCustomComposition ? '无要求' : '未填写')}
                        </div>
                        {!isCustomComposition && (
                            <div className="text-[10px] text-gray-500">内置构图已包含推荐尺寸，选择自定义构图后可启用。</div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className={小标题样式}>画师串预设</label>
                        <select
                            value={manualArtistPresetId}
                            onChange={(e) => setManualArtistPresetId(e.target.value)}
                            className="w-full rounded border border-wuxia-gold/20 bg-black/60 px-4 py-3 text-sm text-gray-200 outline-none focus:border-wuxia-gold/60 focus:bg-wuxia-gold/5 transition-all appearance-none"
                        >
                            {artistPresets.length <= 0 ? (
                                <option value="">未配置预设</option>
                            ) : (
                                artistPresets.map((preset) => (
                                    <option key={preset.id} value={preset.id} className="bg-gray-900">
                                        {preset.名称}
                                    </option>
                                ))
                            )}
                        </select>
                        <div className="rounded border border-wuxia-gold/10 bg-black/30 p-3 text-xs text-gray-400 space-y-1.5 shadow-inner">
                            <div className="line-clamp-2"><span className="text-wuxia-gold/60">正向提示词：</span>{selectedArtistPreset?.正面提示词?.trim() || '无'}</div>
                            <div className="line-clamp-1"><span className="text-wuxia-gold/60">负向提示词：</span>{selectedArtistPreset?.负面提示词?.trim() || '无'}</div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className={小标题样式}>PNG画风预设</label>
                        <select
                            value={manualPngPresetId}
                            onChange={(e) => setManualPngPresetId(e.target.value)}
                            className="w-full rounded border border-wuxia-gold/20 bg-black/60 px-4 py-3 text-sm text-gray-200 outline-none focus:border-wuxia-gold/60 focus:bg-wuxia-gold/5 transition-all appearance-none"
                        >
                            <option value="">不启用</option>
                            {pngStylePresets.map((preset) => (
                                <option key={preset.id} value={preset.id} className="bg-gray-900">
                                    {preset.名称}
                                </option>
                            ))}
                        </select>
                        <div className="rounded border border-wuxia-gold/10 bg-black/30 p-3 text-xs text-gray-400 space-y-1.5 shadow-inner">
                            <div className="line-clamp-2"><span className="text-wuxia-gold/60">PNG正向：</span>{selectedManualPngPreset?.正面提示词?.trim() || '无'}</div>
                            <div className="line-clamp-1"><span className="text-wuxia-gold/60">PNG负向：</span>{selectedManualPngPreset?.负面提示词?.trim() || '无'}</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className={小标题样式}>额外要求</label>
                        <textarea
                            value={manualExtraRequirement}
                            onChange={(e) => setManualExtraRequirement(e.target.value)}
                            rows={3}
                            placeholder="如：白衣飘飘、御剑横空、雷电环绕..."
                            className="w-full rounded border border-wuxia-gold/20 bg-black/60 px-4 py-3 text-sm text-gray-200 outline-none resize-y focus:border-wuxia-gold/60 focus:bg-wuxia-gold/5 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* 右侧：状态与控制 和 天魔秘引 */}
            <div className="flex flex-col gap-6">
                <div className="bg-[#0c0d0f]/90 border border-wuxia-gold/30 rounded shadow-[0_0_30px_rgba(212,175,55,0.05)] p-5 space-y-4 flex-1 flex flex-col">
                    <div className="border-b border-wuxia-gold/10 pb-3 mb-1">
                        <div className="text-lg font-serif text-wuxia-gold tracking-wider">任务设置</div>
                    </div>

                    <div className="rounded border border-wuxia-gold/10 bg-black/30 p-4 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-sm font-medium text-gray-200">后台处理</div>
                                <div className="text-xs text-gray-500 mt-1">提交后任务会进入队列，你可以继续进行其他操作。</div>
                            </div>
                            <ToggleSwitch
                                checked={manualBackgroundMode}
                                onChange={setManualBackgroundMode}
                                ariaLabel="切换后台队列模式"
                            />
                        </div>

                        {manualActiveTask && (
                            <div className="rounded border border-wuxia-gold/20 bg-wuxia-gold/5 p-3 text-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded border ${队列状态样式[manualActiveTask.状态]}`}>{队列状态文案[manualActiveTask.状态]}</span>
                                    <span className="text-gray-400 text-xs">{格式化时间(manualActiveTask.创建时间)}</span>
                                </div>
                                <div className="text-gray-200">{manualActiveTask.进度文本 || '任务正在处理中...'}</div>
                            </div>
                        )}
                    </div>

                    {manualError && (
                        <div className="rounded border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-300 whitespace-pre-wrap">{manualError}</div>
                    )}

                    {manualStatusText && (
                        <div className="rounded border border-wuxia-gold/40 bg-wuxia-gold/10 p-3 text-sm text-wuxia-gold whitespace-pre-wrap shadow-[0_0_15px_rgba(212,175,55,0.1)]">{manualStatusText}</div>
                    )}

                    <div className="mt-auto pt-4 flex gap-3">
                        <button type="button" onClick={handleOpenConfirm} disabled={!canSubmitManual} className={`flex-1 rounded border px-4 py-3 text-sm font-serif tracking-widest transition-all duration-300 ${canSubmitManual ? 'border-wuxia-gold bg-wuxia-gold/20 text-wuxia-gold hover:bg-wuxia-gold/30 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'border-gray-800 bg-black/40 text-gray-600 cursor-not-allowed'}`}>
                            {manualBackgroundMode ? '加入队列' : '立即生成'}
                        </button>
                        <button type="button" onClick={() => setActiveTab('queue')} className={次级按钮样式()}>
                            查看队列
                        </button>
                    </div>
                </div>

                {selectedNpc && !Boolean(selectedNpc?.性别 && selectedNpc.性别.includes('男')) && (
                    <div className="bg-[#0c0d0f]/90 border border-fuchsia-900/40 rounded shadow-[0_0_30px_rgba(192,38,211,0.05)] p-5 space-y-4 lg:col-span-2">
                        <div className="flex items-center justify-between border-b border-fuchsia-900/20 pb-3">
                            <div>
                                <div className="text-fuchsia-400 font-serif text-lg tracking-wider">私密部位特写</div>
                                <div className="text-[10px] text-gray-500 mt-1">为当前角色生成私密部位特写图片。</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => { void handleSubmitSecretPart('全部'); }}
                                disabled={!!busyActionKey || !onGenerateSecretPartImage}
                                className="px-3 py-1.5 rounded border border-fuchsia-800/60 bg-fuchsia-950/30 text-xs text-fuchsia-300 hover:bg-fuchsia-900/40 transition-colors"
                            >
                                {busyActionKey === `secret_part_${selectedNpcId}_全部` ? '生成中...' : '全部生成'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <label className={小标题样式}>画风选择</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {(['无要求', '通用', '二次元', '写实', '国风'] as const).map((style) => (
                                        <button
                                            key={style}
                                            type="button"
                                            onClick={() => setSecretStyle(style)}
                                            className={`rounded border px-2 py-2 text-xs font-serif transition-all duration-300 ${secretStyle === style ? 'border-fuchsia-400 bg-fuchsia-900/30 text-fuchsia-200 shadow-[0_0_12px_rgba(192,38,211,0.2)]' : 'border-fuchsia-900/30 bg-black/40 text-gray-400 hover:border-fuchsia-700/50'}`}
                                        >
                                            {style}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className={小标题样式}>分辨率 / 比例</label>
                                <div className="grid grid-cols-6 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSecretSizePreset('none')}
                                        className={`rounded border px-2 py-2 text-center text-xs transition-all duration-300 ${secretSizePreset === 'none' ? 'border-fuchsia-400 bg-fuchsia-900/30 text-fuchsia-200 shadow-[0_0_10px_rgba(192,38,211,0.2)]' : 'border-fuchsia-900/30 bg-black/40 text-gray-400 hover:border-fuchsia-700/50'}`}
                                    >
                                        无要求
                                    </button>
                                    {(['1:1', '3:4', '9:16', '16:9'] as const).map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => setSecretSizePreset(preset)}
                                            className={`rounded border px-2 py-2 text-center text-xs transition-all duration-300 ${secretSizePreset === preset ? 'border-fuchsia-400 bg-fuchsia-900/30 text-fuchsia-200 shadow-[0_0_10px_rgba(192,38,211,0.2)]' : 'border-fuchsia-900/30 bg-black/40 text-gray-400 hover:border-fuchsia-700/50'}`}
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setSecretSizePreset('custom')}
                                        className={`rounded border px-2 py-2 text-center text-xs transition-all duration-300 ${secretSizePreset === 'custom' ? 'border-fuchsia-400 bg-fuchsia-900/30 text-fuchsia-200 shadow-[0_0_10px_rgba(192,38,211,0.2)]' : 'border-fuchsia-900/30 bg-black/40 text-gray-400 hover:border-fuchsia-700/50'}`}
                                    >
                                        自定义
                                    </button>
                                </div>
                                {secretSizePreset !== 'custom' && secretSizePreset !== 'none' && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-gray-500">倍率</span>
                                        {(['1x', '2x'] as const).map((scale) => (
                                            <button
                                                key={scale}
                                                type="button"
                                                onClick={() => setSecretSizeScale(scale)}
                                                className={`rounded border px-2 py-1 text-[10px] transition-all duration-300 ${secretSizeScale === scale ? 'border-fuchsia-400 bg-fuchsia-900/30 text-fuchsia-200' : 'border-fuchsia-900/30 bg-black/40 text-gray-400 hover:border-fuchsia-700/50'}`}
                                            >
                                                {scale.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <div className="text-[10px] text-gray-500">宽 (px)</div>
                                        <input
                                            value={secretWidth}
                                            onChange={(e) => {
                                                setSecretWidth(e.target.value);
                                                setSecretSizePreset('custom');
                                            }}
                                            disabled={secretSizePreset !== 'custom'}
                                            placeholder={secretPresetSize?.宽 || '1024'}
                                            className={`w-full rounded border border-fuchsia-900/30 bg-black/60 px-3 py-2 text-xs text-gray-200 outline-none transition-all ${secretSizePreset !== 'custom' ? 'opacity-60 cursor-not-allowed' : 'focus:border-fuchsia-400 focus:bg-fuchsia-900/10'}`}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] text-gray-500">高 (px)</div>
                                        <input
                                            value={secretHeight}
                                            onChange={(e) => {
                                                setSecretHeight(e.target.value);
                                                setSecretSizePreset('custom');
                                            }}
                                            disabled={secretSizePreset !== 'custom'}
                                            placeholder={secretPresetSize?.高 || '1024'}
                                            className={`w-full rounded border border-fuchsia-900/30 bg-black/60 px-3 py-2 text-xs text-gray-200 outline-none transition-all ${secretSizePreset !== 'custom' ? 'opacity-60 cursor-not-allowed' : 'focus:border-fuchsia-400 focus:bg-fuchsia-900/10'}`}
                                        />
                                    </div>
                                </div>
                                <div className="text-[10px] text-gray-500">
                                    当前尺寸：{secretSizeValue || (secretSizePreset === 'none' ? '无要求' : '未填写')}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className={小标题样式}>画师串预设</label>
                                <select
                                    value={secretArtistPresetId}
                                    onChange={(e) => setSecretArtistPresetId(e.target.value)}
                                    className="w-full rounded border border-fuchsia-900/30 bg-black/60 px-4 py-3 text-sm text-gray-200 outline-none focus:border-fuchsia-400 focus:bg-fuchsia-900/10 transition-all appearance-none"
                                >
                                    {artistPresets.length <= 0 ? (
                                        <option value="">未配置预设</option>
                                    ) : (
                                        artistPresets.map((preset) => (
                                            <option key={preset.id} value={preset.id} className="bg-gray-900">
                                                {preset.名称}
                                            </option>
                                        ))
                                    )}
                                </select>
                                <div className="rounded border border-fuchsia-900/20 bg-black/30 p-3 text-xs text-gray-400 space-y-1.5 shadow-inner">
                                    <div className="line-clamp-2"><span className="text-fuchsia-400/70">正向提示词：</span>{selectedSecretArtistPreset?.正面提示词?.trim() || '无'}</div>
                                    <div className="line-clamp-1"><span className="text-fuchsia-400/70">负向提示词：</span>{selectedSecretArtistPreset?.负面提示词?.trim() || '无'}</div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className={小标题样式}>PNG画风预设</label>
                                <select
                                    value={secretPngPresetId}
                                    onChange={(e) => setSecretPngPresetId(e.target.value)}
                                    className="w-full rounded border border-fuchsia-900/30 bg-black/60 px-4 py-3 text-sm text-gray-200 outline-none focus:border-fuchsia-400 focus:bg-fuchsia-900/10 transition-all appearance-none"
                                >
                                    <option value="">不启用</option>
                                    {pngStylePresets.map((preset) => (
                                        <option key={preset.id} value={preset.id} className="bg-gray-900">
                                            {preset.名称}
                                        </option>
                                    ))}
                                </select>
                                <div className="rounded border border-fuchsia-900/20 bg-black/30 p-3 text-xs text-gray-400 space-y-1.5 shadow-inner">
                                    <div className="line-clamp-2"><span className="text-fuchsia-400/70">PNG正向：</span>{selectedSecretPngPreset?.正面提示词?.trim() || '无'}</div>
                                    <div className="line-clamp-1"><span className="text-fuchsia-400/70">PNG负向：</span>{selectedSecretPngPreset?.负面提示词?.trim() || '无'}</div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className={小标题样式}>额外要求</label>
                                <textarea
                                    value={secretExtraRequirement}
                                    onChange={(e) => setSecretExtraRequirement(e.target.value)}
                                    rows={3}
                                    placeholder="如：近景柔光、细节清晰、细腻写实..."
                                    className="w-full rounded border border-fuchsia-900/30 bg-black/60 px-4 py-3 text-sm text-gray-200 outline-none resize-y focus:border-fuchsia-400 focus:bg-fuchsia-900/10 transition-all"
                                />
                            </div>
                        </div>
                        
                        {(secretStatusText || recentSecretQueueTask) && (
                            <div className="rounded border border-fuchsia-900/30 bg-fuchsia-950/20 p-3 text-sm">
                                {secretStatusText && <div className="text-fuchsia-200">{secretStatusText}</div>}
                                {recentSecretQueueTask && (
                                    <div className="mt-1 text-xs text-fuchsia-300/80">
                                        当前任务：{获取NPC构图文案(recentSecretQueueTask.构图, recentSecretQueueTask.部位)} / {队列状态文案[recentSecretQueueTask.状态]}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {selectedNpcSecretPartRecords.map((item) => {
                                const imageSrc = 获取图片展示地址(item.result);
                                return (
                                    <div key={item.part} className="rounded border border-fuchsia-900/20 bg-black/40 p-3 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-serif text-fuchsia-300">{item.label}</div>
                                            <button
                                                type="button"
                                                onClick={() => { void handleSubmitSecretPart(item.part); }}
                                                disabled={!!busyActionKey || !onGenerateSecretPartImage}
                                                className="text-[10px] px-2 py-1 rounded border border-fuchsia-800/40 bg-black text-fuchsia-400 hover:bg-fuchsia-950/50 transition-colors shrink-0"
                                            >
                                                {busyActionKey === `secret_part_${selectedNpcId}_${item.part}` ? '生成中...' : (imageSrc ? '重新生成' : '生成')}
                                            </button>
                                        </div>
                                        {imageSrc ? (
                                            <img src={imageSrc} alt={`${selectedNpc.姓名}${item.label}`} className="w-full flex-1 aspect-square object-cover rounded border border-fuchsia-900/30" />
                                        ) : (
                                            <div className="w-full flex-1 aspect-square rounded border border-dashed border-fuchsia-900/30 bg-black/20 flex items-center justify-center text-xs text-gray-600 font-serif">
                                                暂无图片
                                            </div>
                                        )}
                                        {item.result?.状态 === 'failed' && (
                                            <div className="text-[10px] text-red-400 mt-1 truncate">{item.result?.错误信息 || '生成失败'}</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* 预览面板 */}
            <div className="lg:col-span-2 bg-[#0c0d0f]/90 border border-wuxia-gold/30 rounded shadow-[0_0_30px_rgba(212,175,55,0.05)] grid grid-cols-1 md:grid-cols-2 overflow-hidden mt-6">
                <div className="border-b md:border-b-0 md:border-r border-wuxia-gold/10 flex flex-col">
                    <div className="p-4 border-b border-wuxia-gold/10 bg-black/20 flex items-center justify-between">
                        <div className="text-wuxia-gold font-serif text-lg tracking-wider">图片预览</div>
                        {selectedNpcLatestRecord && (
                            <button type="button" onClick={() => setActiveTab('library')} className="text-xs text-wuxia-gold/70 hover:text-wuxia-gold underline underline-offset-4 decoration-wuxia-gold/30 transition-colors">
                                查看图库
                            </button>
                        )}
                    </div>
                    <div className="flex-1 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08),transparent_70%)] flex items-center justify-center p-4 min-h-[300px]">
                        {selectedNpcPreviewImage ? (
                            <button
                                type="button"
                                className="block"
                                onClick={() => 打开图片查看器(selectedNpcPreviewImage, `${selectedNpc?.姓名 || '角色'} 预览图`)}
                            >
                                <img src={selectedNpcPreviewImage} alt={selectedNpc?.姓名 || '头像'} className="max-h-[400px] max-w-full object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.2)]" />
                            </button>
                        ) : (
                            <div className="text-center">
                                <div className="text-wuxia-gold/40 text-4xl mb-3">☯</div>
                                <div className="text-gray-500 font-serif">暂无可预览图片</div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col border-wuxia-gold/10">
                   <div className="p-4 border-b border-wuxia-gold/10 bg-black/20">
                       <div className="text-wuxia-gold font-serif text-lg tracking-wider">角色资料</div>
                   </div>
                    <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <div className={小标题样式}>姓名</div>
                                <div className="text-sm text-gray-200 mt-1 font-serif">{selectedNpc?.姓名 || '未知'}</div>
                            </div>
                            {显示境界 && (
                                <div>
                                    <div className={小标题样式}>境界</div>
                                    <div className="text-sm text-gray-200 mt-1 font-serif">{selectedNpc?.境界 || '凡人'}</div>
                                </div>
                            )}
                            <div>
                                <div className={小标题样式}>身份</div>
                                <div className="text-sm text-gray-200 mt-1 font-serif">{selectedNpc?.身份 || '散修'}</div>
                            </div>
                            <div>
                                <div className={小标题样式}>性别</div>
                                <div className="text-sm text-gray-200 mt-1 font-serif">{selectedNpc?.性别 || '未知'}</div>
                            </div>
                        </div>
                        <div className="space-y-2 border-t border-wuxia-gold/10 pt-4">
                            <div className={小标题样式}>角色设定</div>
                            <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-serif opacity-80">
                                {selectedNpcSummary || '未找到角色资料'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
    // @todo-replace: useImageManager/tabs/LibraryTab
    const renderLibraryTab = () => (
        <div className="grid grid-cols-1 md:grid-cols-[160px_minmax(0,1fr)] lg:grid-cols-[184px_minmax(0,1fr)] gap-6">
            <div className="bg-[#0c0d0f]/90 border border-wuxia-gold/30 rounded shadow-[0_0_30px_rgba(212,175,55,0.05)] p-5 flex flex-col">
                <div className="flex items-center justify-between border-b border-wuxia-gold/10 pb-4 mb-4 shrink-0">
                    <div>
                        <div className="text-wuxia-gold font-serif text-xl tracking-wider text-shadow-glow">角色图库</div>
                        <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Character Archive</div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                    {npcLibraryGroups.map((group) => {
                        const isSelected = libraryNpcId === group.npc.id;
                        return (
                            <button
                                key={group.npc.id}
                                type="button"
                                onClick={() => setLibraryNpcId(group.npc.id)}
                                className={`w-full flex items-center justify-between p-3 rounded border transition-all duration-300 ${
                                    isSelected
                                        ? 'border-wuxia-gold/80 bg-wuxia-gold/15 shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                                        : 'border-wuxia-gold/10 bg-black/40 hover:border-wuxia-gold/40 hover:bg-white/5'
                                }`}
                            >
                                <div className="text-left">
                                    <div className={`font-serif ${isSelected ? 'text-wuxia-gold' : 'text-gray-300'}`}>{group.npc.姓名}</div>
                                </div>
                                <div className={`text-xs px-2 py-0.5 rounded ${isSelected ? 'bg-wuxia-gold/20 text-wuxia-gold border border-wuxia-gold/30' : 'bg-black/60 text-gray-400 border border-gray-800'}`}>
                                    {group.records.length}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="bg-[#0c0d0f]/90 border border-wuxia-gold/30 rounded shadow-[0_0_30px_rgba(212,175,55,0.05)] p-5 flex flex-col relative min-w-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_100%)] pointer-events-none"></div>
                
                {!currentLibraryGroup ? (
                    <空状态 title="未找到匹配图片" desc="未找到符合筛选条件的记录，请调整筛选条件或先生成图片。" />
                ) : (
                    <div className="flex flex-col h-full relative z-10 space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-wuxia-gold/10 pb-4 shrink-0">
                            <div>
                                <div className="text-wuxia-gold font-serif text-2xl tracking-wider text-shadow-glow flex items-center gap-3">
                                    {currentLibraryGroup.npc.姓名}
                                </div>
                                <div className="text-[11px] text-gray-400 mt-2 space-x-3 flex items-center">
                                    <span className="px-2 py-0.5 rounded border border-wuxia-gold/20 bg-wuxia-gold/5">{currentLibraryGroup.npc.性别 || '未知性别'}</span>
                                    <span className="px-2 py-0.5 rounded border border-wuxia-gold/20 bg-wuxia-gold/5">{currentLibraryGroup.npc.是否主要角色 ? '主要角色' : '普通角色'}</span>
                                    <span className="px-2 py-0.5 rounded border border-wuxia-gold/20 bg-wuxia-gold/5 text-wuxia-gold/80">共 {currentLibraryGroup.records.length} 张图片</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={() => 打开手动生图页(currentLibraryGroup.npc.id)} className={次级按钮样式()}>
                                    去生成图片
                                </button>
                                {onClearImageHistory && (
                                    <button
                                        type="button"
                                        onClick={() => { void handleClearNpcHistory(currentLibraryGroup.npc.id); }}
                                        disabled={busyActionKey === `clear_npc_history_${currentLibraryGroup.npc.id}`}
                                        className={次级按钮样式(true)}
                                    >
                                        清空记录
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
                                {currentLibraryGroup.records.map((record) => {
                                    const result = record.结果;
                                    const status = result.状态 || 'success';
                                    const imageId = typeof result.id === 'string' ? result.id : '';
                                    const imageSrc = 获取图片展示地址(result);
                                    const selectedAvatarId = currentLibraryGroup.npc?.图片档案?.已选头像图片ID || '';
                                    const selectedPortraitId = currentLibraryGroup.npc?.图片档案?.已选立绘图片ID || '';
                                    const selectedBackgroundId = currentLibraryGroup.npc?.图片档案?.已选背景图片ID || '';
                                    const isSelectedAvatar = Boolean(imageId) && imageId === selectedAvatarId;
                                    const isSelectedPortrait = Boolean(imageId) && imageId === selectedPortraitId;
                                    const isSelectedBackground = Boolean(imageId) && imageId === selectedBackgroundId;
                                    const canSelectAvatar = Boolean(onSelectAvatarImage && imageId && status === 'success' && imageSrc && result.构图 === '头像');
                                    const canSelectPortrait = Boolean(onSelectPortraitImage && imageId && status === 'success' && imageSrc && (result.构图 === '半身' || result.构图 === '立绘'));
                                    const canSelectBackground = Boolean(onSelectBackgroundImage && imageId && status === 'success' && imageSrc);
                                    const hasLocalCopy = 是否存在本地图片副本(result);
                                    const normalizedPersistentWallpaper = typeof currentPersistentWallpaper === 'string' ? currentPersistentWallpaper.trim() : '';
                                    const isPersistentWallpaper = Boolean(imageSrc && normalizedPersistentWallpaper && imageSrc === normalizedPersistentWallpaper);
                                    const 当前用途标签 = [
                                        isSelectedAvatar ? '已设头像' : '',
                                        isSelectedPortrait ? '已设立绘' : '',
                                        isSelectedBackground ? '已设背景' : '',
                                        isPersistentWallpaper ? '常驻壁纸' : ''
                                    ].filter(Boolean);
                                    
                                    return (
                                        <div key={`${record.NPC标识}_${imageId || result.生成时间}`} className="rounded border border-wuxia-gold/20 bg-black/40 overflow-hidden flex flex-col hover:border-wuxia-gold/50 hover:shadow-[0_4px_20px_rgba(212,175,55,0.15)] transition-all duration-300 group">
                                            <div className="aspect-[3/4] bg-[radial-gradient(circle_at_center,#1a1a1c,black)] border-b border-wuxia-gold/10 flex items-center justify-center relative overflow-hidden">
                                                {imageSrc ? (
                                                    <button
                                                        type="button"
                                                        className="block w-full h-full"
                                                        onClick={() => 打开图片查看器(imageSrc, `${record.NPC姓名} ${获取NPC构图文案(result.构图, result.部位)}`)}
                                                    >
                                                        <img src={imageSrc} alt={`${record.NPC姓名} 图片`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                                                    </button>
                                                ) : (
                                                    <div className="text-xs text-gray-500 font-serif">图片不可用</div>
                                                )}
                                                
                                                <div className="absolute top-2 left-2 flex flex-col gap-1.5 opacity-90 transition-opacity group-hover:opacity-100">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded border inline-block w-fit backdrop-blur bg-black/60 shadow-md ${状态样式[status]}`}>
                                                        {状态文案[status]}
                                                    </span>
                                                    {当前用途标签.map((label) => (
                                                        <span
                                                            key={`${imageId}_${label}`}
                                                            className="rounded border border-wuxia-gold/60 bg-wuxia-gold/20 backdrop-blur-sm px-2 py-0.5 text-[10px] text-wuxia-gold shadow-[0_0_10px_rgba(212,175,55,0.3)] w-fit"
                                                        >
                                                            {label}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="p-4 flex flex-col flex-1 bg-gradient-to-b from-transparent to-black/30">
                                                <div className="flex items-start justify-between gap-3 border-b border-wuxia-gold/10 pb-2 mb-3">
                                                    <div className="text-sm font-serif text-wuxia-gold/90">{获取NPC构图文案(result.构图, result.部位)}</div>
                                                    <div className="text-[10px] text-gray-500 font-mono tracking-wider">{格式化时间(result.生成时间)}</div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 text-[11px] mb-3">
                                                    <div className="rounded border border-wuxia-gold/10 bg-black/40 p-2 text-center text-gray-300 hover:text-gray-100 transition-colors cursor-help group/tooltip" title={result.使用模型 || '未记录'}>
                                                        <div className="text-wuxia-gold/50 mb-1">使用模型</div>
                                                        <div className="truncate">{result.使用模型 || '未记录'}</div>
                                                    </div>
                                                    <div className="rounded border border-wuxia-gold/10 bg-black/40 p-2 text-center text-gray-300 hover:text-gray-100 transition-colors cursor-help group/tooltip" title={result.画风 || '未记录'}>
                                                        <div className="text-wuxia-gold/50 mb-1">画风</div>
                                                        <div className="truncate">{result.画风 || '未记录'}</div>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] text-gray-600 mb-4 h-4 truncate" title={格式化本地图片描述(result.本地路径)}>
                                                    本地路径：{格式化本地图片描述(result.本地路径)}
                                                </div>
                                                <div className="mt-auto pt-2 flex flex-col gap-2 border-t border-wuxia-gold/10">
                                                    <div className="flex flex-wrap justify-end gap-2">
                                                        {canSelectAvatar && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (isSelectedAvatar) {
                                                                        void handleClearAvatarImage(record.NPC标识);
                                                                        return;
                                                                    }
                                                                    void handleSelectAvatarImage(record.NPC标识, imageId);
                                                                }}
                                                                disabled={isSelectedAvatar ? busyActionKey === `clear_avatar_${record.NPC标识}` : busyActionKey === `select_avatar_${imageId}`}
                                                                className={次级按钮样式()}
                                                            >
                                                                {isSelectedAvatar ? '取消设置头像' : '设为头像'}
                                                            </button>
                                                        )}
                                                        {canSelectPortrait && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (isSelectedPortrait) {
                                                                        void handleClearPortraitImage(record.NPC标识);
                                                                        return;
                                                                    }
                                                                    void handleSelectPortraitImage(record.NPC标识, imageId);
                                                                }}
                                                                disabled={isSelectedPortrait ? busyActionKey === `clear_portrait_${record.NPC标识}` : busyActionKey === `select_portrait_${imageId}`}
                                                                className={次级按钮样式()}
                                                            >
                                                                {isSelectedPortrait ? '取消设置立绘' : '设为立绘'}
                                                            </button>
                                                        )}
                                                        {canSelectBackground && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (isSelectedBackground) {
                                                                        void handleClearBackgroundImage(record.NPC标识);
                                                                        return;
                                                                    }
                                                                    void handleSelectBackgroundImage(record.NPC标识, imageId);
                                                                }}
                                                                disabled={isSelectedBackground ? busyActionKey === `clear_background_${record.NPC标识}` : busyActionKey === `select_background_${imageId}`}
                                                                className={次级按钮样式()}
                                                            >
                                                                {isSelectedBackground ? '取消设置背景' : '设为背景'}
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap justify-end gap-2">
                                                        {onSetPersistentWallpaper && imageSrc && status === 'success' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (isPersistentWallpaper) {
                                                                        void handleClearPersistentWallpaper();
                                                                        return;
                                                                    }
                                                                    void handleSetPersistentWallpaper(imageSrc);
                                                                }}
                                                                disabled={isPersistentWallpaper ? busyActionKey === 'clear_persistent_wallpaper' : busyActionKey === `set_persistent_wallpaper_${imageSrc}`}
                                                                className={次级按钮样式()}
                                                            >
                                                                {isPersistentWallpaper ? '取消常驻壁纸' : '设为常驻壁纸'}
                                                            </button>
                                                        )}
                                                        {onSaveImageLocally && imageId && !hasLocalCopy && (
                                                            <button
                                                                type="button"
                                                                onClick={() => { void handleSaveNpcImageLocally(record.NPC标识, imageId); }}
                                                                disabled={busyActionKey === `local_npc_${imageId}`}
                                                                className={次级按钮样式()}
                                                            >
                                                                保存到本地
                                                            </button>
                                                        )}
                                                        {onDeleteImageRecord && imageId && (
                                                            <button
                                                                type="button"
                                                                onClick={() => { void handleDeleteImageRecord(record.NPC标识, imageId); }}
                                                                disabled={busyActionKey === `delete_image_${imageId}`}
                                                                className={次级按钮样式(true)}
                                                            >
                                                                删除图片
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );


    // @todo-replace: useImageManager/tabs/SceneTab
    const renderSceneTab = () => (
        <div className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-6 h-full">
            {/* 左侧：当前场景与生成记录 */}
            <div className="flex flex-col gap-6">
                <div className="bg-[#0c0d0f]/90 border border-wuxia-gold/30 rounded shadow-[0_0_30px_rgba(212,175,55,0.05)] p-5 relative overflow-hidden flex flex-col min-h-[460px]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_100%)] pointer-events-none"></div>
                    
                    <div className="flex items-center justify-between border-b border-wuxia-gold/10 pb-4 mb-4 relative z-10">
                        <div>
                            <div className="text-wuxia-gold font-serif text-xl tracking-wider text-shadow-glow">当前场景壁纸</div>
                            <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Current Wallpaper</div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col relative z-10">
                        {获取图片展示地址(当前壁纸记录) ? (
                            <button
                                type="button"
                                className="flex-1 rounded border border-wuxia-gold/20 bg-black/40 overflow-hidden flex flex-col group hover:border-wuxia-gold/40 transition-colors text-left"
                                onClick={() => 打开图片查看器(获取图片展示地址(当前壁纸记录), 当前壁纸记录?.摘要 || '当前场景壁纸')}
                                title="点击查看图片大图"
                            >
                                <div className="flex-1 bg-[radial-gradient(circle_at_center,#1a1a1c,black)] flex items-center justify-center relative overflow-hidden">
                                     <img src={获取图片展示地址(当前壁纸记录)} alt="当前壁纸" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                                     <div className="absolute top-2 right-2 px-2 py-0.5 rounded border border-wuxia-gold/40 bg-wuxia-gold/20 backdrop-blur-sm text-[10px] text-wuxia-gold shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                                         当前使用中
                                     </div>
                                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                                         <div className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full border border-wuxia-gold/40 bg-black/55 p-3 backdrop-blur-sm">
                                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-wuxia-gold">
                                                 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                                             </svg>
                                         </div>
                                     </div>
                                </div>
                                <div className="p-3 border-t border-wuxia-gold/10 bg-gradient-to-b from-transparent to-black/50">
                                    <div className="text-sm font-serif text-wuxia-gold/90 mb-1">{当前壁纸记录?.摘要 || '未命名场景'}</div>
                                    <div className="text-[10px] text-gray-500 flex justify-between">
                                        <span>模型: {当前壁纸记录?.使用模型 || '未记录'}</span>
                                        <span>回合: {当前壁纸记录?.来源回合 || '无'}</span>
                                    </div>
                                    <div className="text-[10px] text-gray-600 mt-1 truncate" title={格式化本地图片描述(当前壁纸记录?.本地路径)}>
                                        本地路径: {格式化本地图片描述(当前壁纸记录?.本地路径)}
                                    </div>
                                </div>
                            </button>
                        ) : (
                            <div className="flex-1 rounded border border-dashed border-wuxia-gold/20 bg-black/20 flex flex-col items-center justify-center text-center p-6">
                                <div className="text-wuxia-gold/30 text-5xl mb-4">⛰️</div>
                                <div className="text-gray-400 font-serif mb-2">暂无场景壁纸</div>
                                <div className="text-xs text-gray-600">当前尚未指定任何场景壁纸</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-[#0c0d0f]/90 border border-wuxia-gold/30 rounded p-5 relative">
                    <div className="text-wuxia-gold font-serif text-lg tracking-wider border-b border-wuxia-gold/10 pb-3 mb-4">场景生成统计</div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        <统计卡 label="图片总数" value={sceneStats.total} />
                        <统计卡 label="成功" value={sceneStats.success} tone="success" />
                        <统计卡 label="失败" value={sceneStats.failed} tone="danger" />
                        <统计卡 label="生成中" value={sceneStats.pending} tone="warning" />
                        <统计卡 label="队列总数" value={sceneStats.queueTotal} tone="info" />
                        <统计卡 label="运行中" value={sceneStats.queueRunning} tone="info" />
                    </div>
                    <div className="mt-4 rounded border border-wuxia-gold/20 bg-black/30 p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <div className="text-sm font-serif text-wuxia-gold/90">场景历史数量限制</div>
                                <div className="mt-1 text-[11px] text-gray-500">当前 {sceneStats.total} / {sceneArchiveLimit}，超限时会自动删除最旧场景图。</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={sceneArchiveLimitDraft}
                                    onChange={(e) => setSceneArchiveLimitDraft(e.target.value)}
                                    className="w-24 rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-sm text-wuxia-gold/90 outline-none focus:border-wuxia-gold/50"
                                />
                                <button type="button" onClick={() => { void handleSaveSceneArchiveLimit(); }} className={次级按钮样式()}>
                                    应用上限
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 pt-4 border-t border-wuxia-gold/10 flex flex-col gap-3">
                        <div className="space-y-2">
                            <label className={小标题样式}>场景构图要求</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['纯场景', '故事快照'] as const).map((mode) => (
                                    <button
                                        key={mode}
                                        type="button"
                                        onClick={() => setSceneCompositionRequirement(mode)}
                                        className={`rounded border px-3 py-2 text-xs font-serif transition-all duration-300 ${sceneCompositionRequirement === mode ? 'border-wuxia-gold bg-wuxia-gold/20 text-wuxia-gold shadow-[0_0_12px_rgba(212,175,55,0.2)]' : 'border-wuxia-gold/20 bg-black/40 text-gray-400 hover:border-wuxia-gold/50'}`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                            <div className="text-[10px] text-gray-500">选择场景画面是纯景观还是带人物互动的故事快照。</div>
                        </div>
                        <div className="space-y-2">
                            <label className={小标题样式}>画面方向</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['横屏', '竖屏'] as const).map((orientation) => (
                                    <button
                                        key={orientation}
                                        type="button"
                                        onClick={() => setSceneOrientation(orientation)}
                                        className={`rounded border px-3 py-2 text-xs font-serif transition-all duration-300 ${sceneOrientation === orientation ? 'border-wuxia-gold bg-wuxia-gold/20 text-wuxia-gold shadow-[0_0_12px_rgba(212,175,55,0.2)]' : 'border-wuxia-gold/20 bg-black/40 text-gray-400 hover:border-wuxia-gold/50'}`}
                                    >
                                        {orientation}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className={小标题样式}>分辨率 / 比例</label>
                            <div className="grid grid-cols-1 gap-2">
                                <select
                                    value={sceneResolution}
                                    onChange={(e) => setSceneResolution(e.target.value)}
                                    className="w-full rounded border border-wuxia-gold/20 bg-black/60 px-3 py-2 text-sm text-gray-200 outline-none focus:border-wuxia-gold/60 focus:bg-wuxia-gold/5 transition-all appearance-none"
                                >
                                    {sceneResolutionOptions.map((option) => (
                                        <option key={option.value} value={option.value} className="bg-gray-900">
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    value={sceneResolution}
                                    onChange={(e) => setSceneResolution(e.target.value)}
                                    placeholder="自定义分辨率，如 1280x720"
                                    className="w-full rounded border border-wuxia-gold/20 bg-black/60 px-3 py-2 text-xs text-gray-200 outline-none focus:border-wuxia-gold/60 focus:bg-wuxia-gold/5 transition-all"
                                />
                                <div className="text-[10px] text-gray-500">当前分辨率：{sceneResolution || '未选择'}</div>
                                <div className="text-[10px] text-amber-400/80">提示：NAI 等后端可能只支持固定分辨率，填写不支持的尺寸会导致生成失败。</div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className={小标题样式}>额外要求</label>
                            <textarea
                                value={sceneExtraRequirement}
                                onChange={(e) => setSceneExtraRequirement(e.target.value)}
                                rows={3}
                                placeholder="如：夜雨江湖、远景俯瞰、人物剪影..."
                                className="w-full rounded border border-wuxia-gold/20 bg-black/60 px-3 py-2 text-sm text-gray-200 outline-none resize-y focus:border-wuxia-gold/60 focus:bg-wuxia-gold/5 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className={小标题样式}>场景画师串预设</label>
                            <select
                                value={sceneManualArtistPresetId}
                                onChange={(e) => setSceneManualArtistPresetId(e.target.value)}
                                className="w-full rounded border border-wuxia-gold/20 bg-black/60 px-3 py-2 text-sm text-gray-200 outline-none focus:border-wuxia-gold/60 focus:bg-wuxia-gold/5 transition-all appearance-none"
                            >
                                {sceneArtistPresets.length <= 0 ? (
                                    <option value="">未配置预设</option>
                                ) : (
                                    sceneArtistPresets.map((preset) => (
                                        <option key={preset.id} value={preset.id} className="bg-gray-900">
                                            {preset.名称}
                                        </option>
                                    ))
                                )}
                            </select>
                            <div className="rounded border border-wuxia-gold/10 bg-black/30 p-3 text-xs text-gray-400 space-y-1.5 shadow-inner">
                                <div className="line-clamp-2"><span className="text-wuxia-gold/60">正向提示词：</span>{selectedSceneArtistPreset?.正面提示词?.trim() || '无'}</div>
                                <div className="line-clamp-1"><span className="text-wuxia-gold/60">负向提示词：</span>{selectedSceneArtistPreset?.负面提示词?.trim() || '无'}</div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className={小标题样式}>场景PNG画风预设</label>
                            <select
                                value={sceneManualPngPresetId}
                                onChange={(e) => setSceneManualPngPresetId(e.target.value)}
                                className="w-full rounded border border-wuxia-gold/20 bg-black/60 px-3 py-2 text-sm text-gray-200 outline-none focus:border-wuxia-gold/60 focus:bg-wuxia-gold/5 transition-all appearance-none"
                            >
                                <option value="">不启用</option>
                                {pngStylePresets.map((preset) => (
                                    <option key={preset.id} value={preset.id} className="bg-gray-900">
                                        {preset.名称}
                                    </option>
                                ))}
                            </select>
                            <div className="rounded border border-wuxia-gold/10 bg-black/30 p-3 text-xs text-gray-400 space-y-1.5 shadow-inner">
                                <div className="line-clamp-2"><span className="text-wuxia-gold/60">PNG正向提示词：</span>{selectedScenePngPreset?.正面提示词?.trim() || '无'}</div>
                                <div className="line-clamp-1"><span className="text-wuxia-gold/60">PNG负向提示词：</span>{selectedScenePngPreset?.负面提示词?.trim() || '无'}</div>
                            </div>
                        </div>
                        <div className="rounded border border-wuxia-gold/20 bg-black/40 px-4 py-3 flex items-center justify-between gap-4">
                            <div>
                                <div className="text-sm font-medium text-gray-200">后台处理</div>
                                <div className="text-[11px] text-gray-500 mt-1">开启后，场景生成会直接进入后台队列，不阻塞当前页面。</div>
                            </div>
                            <ToggleSwitch
                                checked={manualBackgroundMode}
                                onChange={setManualBackgroundMode}
                                ariaLabel="切换场景后台处理模式"
                            />
                        </div>
                        {sceneStatusText && (
                            <div className="rounded border border-wuxia-gold/40 bg-wuxia-gold/10 p-3 text-sm text-wuxia-gold whitespace-pre-wrap shadow-[0_0_15px_rgba(212,175,55,0.1)]">{sceneStatusText}</div>
                        )}
                        <div className="flex flex-wrap gap-2 justify-end">
                            {onGenerateSceneImage && (
                                <button
                                    type="button"
                                    onClick={() => { void handleGenerateSceneImage(); }}
                                    disabled={busyActionKey === 'generate_scene_image'}
                                    className={次级按钮样式()}
                                >
                                    按当前正文生成
                                </button>
                            )}
                            {onClearSceneHistory && (
                                <button
                                    type="button"
                                    onClick={() => { void handleClearSceneHistory(); }}
                                    disabled={busyActionKey === 'clear_scene_history'}
                                    className={次级按钮样式(true)}
                                >
                                    清空历史
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 右侧：场景生成与历史 */}
            <div className="bg-[#0c0d0f]/90 border border-wuxia-gold/30 rounded shadow-[0_0_30px_rgba(212,175,55,0.05)] p-5 flex flex-col relative min-h-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_100%)] pointer-events-none"></div>
                
                <div className="flex flex-col h-full relative z-10 space-y-6">
                    {/* 场景队列 */}
                    {(sceneQueueList.length > 0 || onClearSceneQueue) && (
                        <div className="flex flex-col shrink-0 max-h-[30%] min-h-[120px]">
                            <div className="flex items-center justify-between border-b border-wuxia-gold/10 pb-3 mb-3 shrink-0">
                                <div className="text-wuxia-gold font-serif text-lg tracking-wider text-shadow-glow">场景队列</div>
                                <div className="flex gap-2">
                                    {onClearSceneQueue && (
                                        <>
                                            <button type="button" onClick={() => { void handleClearSceneQueue('completed'); }} disabled={busyActionKey === 'clear_scene_queue_completed'} className={次级按钮样式(true)}>
                                                清空已完成
                                            </button>
                                            <button type="button" onClick={() => { void handleClearSceneQueue('all'); }} disabled={busyActionKey === 'clear_scene_queue_all'} className={次级按钮样式(true)}>
                                                清空全部
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                                {sceneQueueList.length > 0 ? (
                                    sceneQueueList.map((task) => (
                                        <div key={task.id} className="rounded border border-wuxia-gold/20 bg-black/40 p-3 hover:border-wuxia-gold/40 transition-colors">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-wuxia-gold/90 font-serif">{task.摘要 || '场景生成'}</div>
                                                    <div className="text-[10px] text-gray-500 mt-1">回合：{task.来源回合 || '未知'} · {格式化时间(task.创建时间)}</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded border ${队列状态样式[task.状态]}`}>{队列状态文案[task.状态]}</span>
                                                    {onDeleteSceneQueueTask && (
                                                        <button type="button" onClick={() => { void handleDeleteSceneQueueTask(task.id); }} disabled={busyActionKey === `delete_scene_queue_${task.id}`} className={次级按钮样式(true)}>
                                                            删除
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-[11px] text-gray-400 mt-2">{task.进度文本 || '正在生成场景图片...'}</div>
                                            {(task.场景类型 || task.场景判定说明) && (
                                                <div className="mt-2 text-[10px] text-gray-500 border-t border-wuxia-gold/10 pt-2 flex items-center gap-2">
                                                    <span className="px-1.5 py-0.5 rounded border border-wuxia-gold/20 bg-wuxia-gold/5">{task.场景类型 || '未分类'}</span>
                                                    {task.场景判定说明 && <span className="truncate">{task.场景判定说明}</span>}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-sm text-gray-600 py-4 font-serif">场景队列为空</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 场景历史 */}
                    <div className="flex flex-col flex-1 min-h-0">
                        <div className="flex items-center justify-between border-b border-wuxia-gold/10 pb-3 mb-4 shrink-0">
                            <div className="text-wuxia-gold font-serif text-lg tracking-wider text-shadow-glow">场景历史</div>
                            <div className="text-[10px] text-gray-500">{sceneHistory.length} 条记录</div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                            {sceneHistory.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                                    {sceneHistory.map((result) => {
                                        const imageId = typeof result?.id === 'string' ? result.id : '';
                                        const imageSrc = 获取图片展示地址(result);
                                        const isCurrentWallpaper = Boolean(imageId) && imageId === 当前场景壁纸ID;
                                        const normalizedPersistentWallpaper = (currentPersistentWallpaper || '').trim();
                                        const isPersistentWallpaper = Boolean(imageSrc && normalizedPersistentWallpaper && imageSrc === normalizedPersistentWallpaper);
                                        const hasLocalCopy = 是否存在本地图片副本(result);
                                        const status = result?.状态 || 'success';
                                        const canUseSceneImage = Boolean(imageId && imageSrc && status === 'success');
                                        
                                        return (
                                            <div key={imageId || result.生成时间} className="rounded border border-wuxia-gold/20 bg-black/40 overflow-hidden flex flex-col hover:border-wuxia-gold/50 hover:shadow-[0_4px_20px_rgba(212,175,55,0.15)] transition-all duration-300 group">
                                                <div className="aspect-[16/9] bg-[radial-gradient(circle_at_center,#1a1a1c,black)] border-b border-wuxia-gold/10 flex items-center justify-center relative overflow-hidden">
                                                    {imageSrc ? (
                                                        <img src={imageSrc} alt={result?.摘要 || '场景'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                                                    ) : (
                                                        <div className="text-xs text-gray-500 font-serif">图片不可用</div>
                                                    )}
                                                    
                                                    <div className="absolute top-2 left-2 flex flex-col gap-1.5 opacity-90 transition-opacity group-hover:opacity-100">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded border inline-block w-fit backdrop-blur bg-black/60 shadow-md ${状态样式[status]}`}>
                                                            {状态文案[status]}
                                                        </span>
                                                        {isCurrentWallpaper && (
                                                            <span className="rounded border border-wuxia-gold/60 bg-wuxia-gold/20 backdrop-blur-sm px-2 py-0.5 text-[10px] text-wuxia-gold shadow-[0_0_10px_rgba(212,175,55,0.3)] w-fit">
                                                                当前壁纸
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="p-3 flex flex-col flex-1 bg-gradient-to-b from-transparent to-black/30">
                                                    <div className="flex items-start justify-between gap-2 border-b border-wuxia-gold/10 pb-2 mb-2">
                                                        <div className="min-w-0">
                                                            <div className="text-sm font-serif text-wuxia-gold/90 truncate">{result?.摘要 || '未命名场景'}</div>
                                                            <div className="text-[10px] text-gray-500 mt-0.5">回合：{result?.来源回合 || '?'} · {格式化时间(result?.生成时间)}</div>
                                                        </div>
                                                    </div>
                                                    
                                                    {(result?.场景类型 || result?.场景判定说明) && (
                                                        <div className="text-[10px] text-gray-400 mb-2 bg-black/30 p-1.5 rounded border border-wuxia-gold/5 flex flex-wrap gap-1.5 items-center">
                                                            <span className="text-wuxia-gold/70">[{result?.场景类型 || '未知'}]</span>
                                                            <span className="truncate flex-1" title={result?.场景判定说明}>{result?.场景判定说明}</span>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="mt-auto pt-2 flex flex-wrap justify-end gap-1.5">
                                                        {onApplySceneWallpaper && canUseSceneImage && (
                                                            <button
                                                                type="button"
                                                                onClick={() => { void (isCurrentWallpaper ? handleClearSceneWallpaper() : handleApplySceneWallpaper(imageId)); }}
                                                                disabled={busyActionKey === `apply_scene_${imageId}` || busyActionKey === 'clear_scene_wallpaper'}
                                                                className={次级按钮样式()}
                                                            >
                                                                {isCurrentWallpaper ? '取消设置壁纸' : '设为壁纸'}
                                                            </button>
                                                        )}
                                                        {onSetPersistentWallpaper && canUseSceneImage && imageSrc && (
                                                            <button
                                                                type="button"
                                                                onClick={() => { void (isPersistentWallpaper ? handleClearPersistentWallpaper() : handleSetPersistentWallpaper(imageSrc)); }}
                                                                disabled={busyActionKey === `set_persistent_wallpaper_${imageSrc}` || busyActionKey === 'clear_persistent_wallpaper'}
                                                                className={次级按钮样式()}
                                                            >
                                                                {isPersistentWallpaper ? '取消常驻壁纸' : '设为常驻壁纸'}
                                                            </button>
                                                        )}
                                                        {onSaveSceneImageLocally && canUseSceneImage && !hasLocalCopy && (
                                                            <button
                                                                type="button"
                                                                onClick={() => { void handleSaveSceneImageLocally(imageId); }}
                                                                disabled={busyActionKey === `local_scene_${imageId}`}
                                                                className={次级按钮样式()}
                                                            >
                                                                保存到本地
                                                            </button>
                                                        )}
                                                        {onDeleteSceneImage && imageId && (
                                                            <button
                                                                type="button"
                                                                onClick={() => { void handleDeleteSceneImage(imageId); }}
                                                                disabled={busyActionKey === `delete_scene_${imageId}`}
                                                                className={次级按钮样式(true)}
                                                            >
                                                                删除图片
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    <details className="mt-3 group/details">
                                                        <summary className={`text-[11px] text-gray-400 cursor-pointer select-none hover:text-wuxia-gold transition-colors outline-none flex items-center gap-1 before:content-['▶'] before:text-[8px] before:transition-transform group-open/details:before:rotate-90`}>
                                                            最终正向提示词
                                                        </summary>
                                                        <div className="mt-2 text-[10px] text-gray-300/80 bg-black/50 p-2 rounded border border-wuxia-gold/10 whitespace-pre-wrap break-words max-h-24 overflow-y-auto custom-scrollbar font-mono leading-relaxed">
                                                            {result?.最终正向提示词 || result?.生图词组 || '未记录提示词'}
                                                        </div>
                                                    </details>
                                                    {!!result?.最终负向提示词 && (
                                                        <details className="mt-2 group/details">
                                                            <summary className={`text-[11px] text-gray-400 cursor-pointer select-none hover:text-wuxia-gold transition-colors outline-none flex items-center gap-1 before:content-['▶'] before:text-[8px] before:transition-transform group-open/details:before:rotate-90`}>
                                                                最终负面提示词
                                                            </summary>
                                                            <div className="mt-2 text-[10px] text-gray-300/80 bg-black/50 p-2 rounded border border-wuxia-gold/10 whitespace-pre-wrap break-words max-h-24 overflow-y-auto custom-scrollbar font-mono leading-relaxed">
                                                                {result.最终负向提示词}
                                                            </div>
                                                        </details>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <空状态 title="暂无场景历史记录" desc="请先生成场景图片。" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // @todo-replace: useImageManager/tabs/HistoryTab
    const renderHistoryTab = () => (
        <div className="flex flex-col h-full bg-[#0c0d0f]/90 border border-wuxia-gold/30 rounded shadow-[0_0_30px_rgba(212,175,55,0.05)] p-5 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_100%)] pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex flex-wrap items-center justify-between border-b border-wuxia-gold/10 pb-4 mb-4 shrink-0 gap-4">
                    <div>
                        <div className="text-wuxia-gold font-serif text-xl tracking-wider text-shadow-glow">全部生成历史</div>
                        <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Chronicles of the Past</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {onClearImageHistory && (
                            <button
                                type="button"
                                onClick={() => { void handleClearAllHistory(); }}
                                disabled={busyActionKey === 'clear_all_history'}
                                className={次级按钮样式(true)}
                            >
                                清空 NPC 历史
                            </button>
                        )}
                        {onClearSceneHistory && (
                            <button
                                type="button"
                                onClick={() => { void handleClearSceneHistory(); }}
                                disabled={busyActionKey === 'clear_scene_history'}
                                className={次级按钮样式(true)}
                            >
                                清空场景历史
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-5">
                    {combinedHistoryRecords.length > 0 ? (
                        <div className="grid grid-cols-1 gap-5 pb-4">
                            {combinedHistoryRecords.map((entry) => {
                                if (entry.类型 === 'scene' && entry.sceneRecord) {
                                    const result = entry.sceneRecord;
                                    const imageId = typeof result?.id === 'string' ? result.id : '';
                                    const imageSrc = 获取图片展示地址(result);
                                    const isCurrentWallpaper = Boolean(imageId) && imageId === 当前场景壁纸ID;
                                    const normalizedPersistentWallpaper = (currentPersistentWallpaper || '').trim();
                                    const isPersistentWallpaper = Boolean(imageSrc && normalizedPersistentWallpaper && imageSrc === normalizedPersistentWallpaper);
                                    const hasLocalCopy = 是否存在本地图片副本(result);
                                    const status = result?.状态 || 'success';
                                    
                                    return (
                                        <div key={entry.key} className="rounded border border-wuxia-gold/20 bg-black/40 overflow-hidden flex flex-col xl:flex-row group hover:border-wuxia-gold/50 hover:shadow-[0_4px_20px_rgba(212,175,55,0.15)] transition-all duration-300">
                                            <div className="xl:w-1/3 aspect-[16/9] xl:aspect-auto xl:min-h-[240px] bg-[radial-gradient(circle_at_center,#1a1a1c,black)] border-b xl:border-b-0 xl:border-r border-wuxia-gold/10 flex items-center justify-center relative overflow-hidden">
                                                {imageSrc ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => 打开图片查看器(imageSrc, result?.摘要 || '场景')}
                                                        className="w-full h-full block text-left"
                                                        title="查看大图"
                                                    >
                                                        <img src={imageSrc} alt={result?.摘要 || '场景'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                                                    </button>
                                                ) : (
                                                    <div className="text-xs text-gray-500 font-serif">图片不可用</div>
                                                )}
                                                <div className="absolute top-2 left-2 flex flex-col gap-1.5 opacity-90 transition-opacity group-hover:opacity-100">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded border inline-block w-fit backdrop-blur bg-black/60 shadow-md ${状态样式[status]}`}>
                                                        {状态文案[status]}
                                                    </span>
                                                    <span className="rounded border border-wuxia-gold/40 bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] text-wuxia-gold/80 shadow-md w-fit">
                                                        场景
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="p-4 flex flex-col flex-1 bg-gradient-to-b xl:bg-gradient-to-r from-transparent to-black/30">
                                                <div className="flex items-start justify-between gap-3 border-b border-wuxia-gold/10 pb-3 mb-4">
                                                    <div>
                                                        <div className="text-lg font-serif text-wuxia-gold/90">{result?.摘要 || '未命名场景'}</div>
                                                        <div className="text-[10px] text-gray-500 mt-1 flex gap-2 items-center">
                                                            <span className="px-1.5 py-0.5 rounded border border-wuxia-gold/20 bg-wuxia-gold/5 text-wuxia-gold/70">{result?.场景类型 || '未分类'}</span>
                                                            <span className="font-mono">{格式化时间(result?.生成时间)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {onDeleteSceneImage && imageId && (
                                                            <button type="button" onClick={() => { void handleDeleteSceneImage(imageId); }} disabled={busyActionKey === `delete_scene_${imageId}`} className={次级按钮样式(true)}>
                                                                删除图片
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 flex-1">
                                                    <div className="rounded border border-wuxia-gold/10 bg-black/50 p-3">
                                                        <div className="text-wuxia-gold/50 text-[10px] mb-1">使用模型</div>
                                                        <div className="text-gray-300 text-xs font-mono break-words">{result.使用模型 || '未记录'}</div>
                                                    </div>
                                                    <div className="rounded border border-wuxia-gold/10 bg-black/50 p-3">
                                                        <div className="text-wuxia-gold/50 text-[10px] mb-1">画风偏好 / 附加预设</div>
                                                        <div className="text-gray-300 text-xs font-mono break-words">{[result.画风, result.画师串].filter(Boolean).join(' / ') || '无'}</div>
                                                    </div>
                                                    <div className="rounded border border-wuxia-gold/10 bg-black/50 p-3 md:col-span-2">
                                                        <div className="text-wuxia-gold/50 text-[10px] mb-1">本地路径</div>
                                                        <div className="text-gray-300 text-[10px] font-mono break-all">{格式化本地图片描述(result.本地路径)}</div>
                                                    </div>
                                                    {result.错误信息 && (
                                                        <div className="rounded border border-red-900/40 bg-red-950/20 p-3 md:col-span-2 text-red-200 text-xs font-mono break-words">
                                                            错误：{result.错误信息}
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="flex flex-col gap-2">
                                                    <details className="group/details">
                                                        <summary className={`text-[11px] text-gray-400 cursor-pointer select-none hover:text-wuxia-gold transition-colors outline-none flex items-center gap-1 before:content-['▶'] before:text-[8px] before:transition-transform group-open/details:before:rotate-90`}>
                                                            最终正向提示词
                                                        </summary>
                                                        <div className="mt-2 text-[10px] text-gray-400/80 bg-black/80 p-3 rounded border border-wuxia-gold/10 whitespace-pre-wrap break-words max-h-32 overflow-y-auto custom-scrollbar font-mono leading-relaxed">
                                                            {result.最终正向提示词 || result.生图词组 || '未记录提示词'}
                                                        </div>
                                                    </details>
                                                    {!!result.最终负向提示词 && (
                                                        <details className="group/details">
                                                            <summary className={`text-[11px] text-gray-400 cursor-pointer select-none hover:text-wuxia-gold transition-colors outline-none flex items-center gap-1 before:content-['▶'] before:text-[8px] before:transition-transform group-open/details:before:rotate-90`}>
                                                                最终负面提示词
                                                            </summary>
                                                            <div className="mt-2 text-[10px] text-gray-400/80 bg-black/80 p-3 rounded border border-wuxia-gold/10 whitespace-pre-wrap break-words max-h-32 overflow-y-auto custom-scrollbar font-mono leading-relaxed">
                                                                {result.最终负向提示词}
                                                            </div>
                                                        </details>
                                                    )}
                                                </div>
                                                
                                                <div className="mt-4 pt-3 flex flex-wrap justify-end gap-2 border-t border-wuxia-gold/10">
                                                    {imageSrc && (
                                                        <button
                                                            type="button"
                                                            onClick={() => 打开图片查看器(imageSrc, result?.摘要 || '场景')}
                                                            className={次级按钮样式()}
                                                        >
                                                            查看大图
                                                        </button>
                                                    )}
                                                    {onApplySceneWallpaper && imageId && imageSrc && status === 'success' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => { void (isCurrentWallpaper ? handleClearSceneWallpaper() : handleApplySceneWallpaper(imageId)); }}
                                                            disabled={busyActionKey === `apply_scene_${imageId}` || busyActionKey === 'clear_scene_wallpaper'}
                                                            className={次级按钮样式()}
                                                        >
                                                            {isCurrentWallpaper ? '取消设置壁纸' : '设为壁纸'}
                                                        </button>
                                                    )}
                                                    {onSetPersistentWallpaper && imageSrc && status === 'success' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => { void (isPersistentWallpaper ? handleClearPersistentWallpaper() : handleSetPersistentWallpaper(imageSrc)); }}
                                                            disabled={busyActionKey === `set_persistent_wallpaper_${imageSrc}` || busyActionKey === 'clear_persistent_wallpaper'}
                                                            className={次级按钮样式()}
                                                        >
                                                            {isPersistentWallpaper ? '取消常驻壁纸' : '设为常驻壁纸'}
                                                        </button>
                                                    )}
                                                    {onSaveSceneImageLocally && imageId && !hasLocalCopy && (
                                                        <button type="button" onClick={() => { void handleSaveSceneImageLocally(imageId); }} disabled={busyActionKey === `local_scene_${imageId}`} className={次级按钮样式()}>
                                                            保存到本地
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                const record = entry.npcRecord!;
                                const result = record.结果;
                                const status = result.状态 || 'success';
                                const imageId = typeof result.id === 'string' ? result.id : '';
                                const imageSrc = 获取图片展示地址(result);
                                const normalizedPersistentWallpaper = (currentPersistentWallpaper || '').trim();
                                const isPersistentWallpaper = Boolean(imageSrc && normalizedPersistentWallpaper && imageSrc === normalizedPersistentWallpaper);
                                const hasLocalCopy = 是否存在本地图片副本(result);
                                
                                return (
                                    <div key={entry.key} className="rounded border border-wuxia-gold/20 bg-black/40 overflow-hidden flex flex-col xl:flex-row group hover:border-wuxia-gold/50 hover:shadow-[0_4px_20px_rgba(212,175,55,0.15)] transition-all duration-300">
                                        <div className="xl:w-1/3 aspect-[3/4] xl:aspect-auto xl:min-h-[300px] bg-[radial-gradient(circle_at_center,#1a1a1c,black)] border-b xl:border-b-0 xl:border-r border-wuxia-gold/10 flex items-center justify-center relative overflow-hidden">
                                            {imageSrc ? (
                                                <button
                                                    type="button"
                                                    onClick={() => 打开图片查看器(imageSrc, `${record.NPC姓名} 图片`)}
                                                    className="w-full h-full block text-left"
                                                    title="查看大图"
                                                >
                                                    <img src={imageSrc} alt={`${record.NPC姓名} 图片`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                                                </button>
                                            ) : (
                                                    <div className="text-xs text-gray-500 font-serif">图片不可用</div>
                                            )}
                                            <div className="absolute top-2 left-2 flex flex-col gap-1.5 opacity-90 transition-opacity group-hover:opacity-100">
                                                <span className={`text-[10px] px-2 py-0.5 rounded border inline-block w-fit backdrop-blur bg-black/60 shadow-md ${状态样式[status]}`}>
                                                    {状态文案[status]}
                                                </span>
                                                <span className="rounded border border-wuxia-gold/40 bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] text-wuxia-gold/80 shadow-md w-fit">
                                                    角色
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="p-4 flex flex-col flex-1 bg-gradient-to-b xl:bg-gradient-to-r from-transparent to-black/30">
                                            <div className="flex items-start justify-between gap-3 border-b border-wuxia-gold/10 pb-3 mb-4">
                                                <div>
                                                    <div className="text-lg font-serif text-wuxia-gold/90">{record.NPC姓名}</div>
                                                    <div className="text-[10px] text-gray-500 mt-1 flex gap-2 items-center">
                                                        <span>{record.NPC性别 || '未知'}</span>
                                                        <span className="px-1.5 py-0.5 rounded border border-wuxia-gold/20 bg-wuxia-gold/5 text-wuxia-gold/70">{获取NPC构图文案(result.构图, result.部位)}</span>
                                                        <span className="font-mono">{格式化时间(result.生成时间)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {onDeleteImageRecord && imageId && (
                                                        <button type="button" onClick={() => { void handleDeleteImageRecord(record.NPC标识, imageId); }} disabled={busyActionKey === `delete_image_${imageId}`} className={次级按钮样式(true)}>
                                                            删除图片
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 flex-1">
                                                <div className="rounded border border-wuxia-gold/10 bg-black/50 p-3">
                                                    <div className="text-wuxia-gold/50 text-[10px] mb-1">使用模型</div>
                                                    <div className="text-gray-300 text-xs font-mono break-words">{result.使用模型 || '未记录'}</div>
                                                </div>
                                                <div className="rounded border border-wuxia-gold/10 bg-black/50 p-3">
                                                    <div className="text-wuxia-gold/50 text-[10px] mb-1">画风偏好 / 附加预设</div>
                                                    <div className="text-gray-300 text-xs font-mono break-words">{[result.画风, result.画师串].filter(Boolean).join(' / ') || '无'}</div>
                                                </div>
                                                <div className="rounded border border-wuxia-gold/10 bg-black/50 p-3 md:col-span-2">
                                                    <div className="text-wuxia-gold/50 text-[10px] mb-1">本地路径</div>
                                                    <div className="text-gray-300 text-[10px] font-mono break-all">{格式化本地图片描述(result.本地路径)}</div>
                                                </div>
                                                {result.错误信息 && (
                                                    <div className="rounded border border-red-900/40 bg-red-950/20 p-3 md:col-span-2 text-red-200 text-xs font-mono break-words">
                                                        错误：{result.错误信息}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex flex-col gap-2">
                                                <details className="group/details">
                                                    <summary className={`text-[11px] text-gray-400 cursor-pointer select-none hover:text-wuxia-gold transition-colors outline-none flex items-center gap-1 before:content-['▶'] before:text-[8px] before:transition-transform group-open/details:before:rotate-90`}>
                                                        最终正向提示词
                                                    </summary>
                                                    <div className="mt-2 text-[10px] text-gray-400/80 bg-black/80 p-3 rounded border border-wuxia-gold/10 whitespace-pre-wrap break-words max-h-32 overflow-y-auto custom-scrollbar font-mono leading-relaxed">
                                                        {result.最终正向提示词 || result.生图词组 || '未记录提示词'}
                                                    </div>
                                                </details>
                                                {!!result.最终负向提示词 && (
                                                    <details className="group/details">
                                                        <summary className={`text-[11px] text-gray-400 cursor-pointer select-none hover:text-wuxia-gold transition-colors outline-none flex items-center gap-1 before:content-['▶'] before:text-[8px] before:transition-transform group-open/details:before:rotate-90`}>
                                                            最终负面提示词
                                                        </summary>
                                                        <div className="mt-2 text-[10px] text-gray-400/80 bg-black/80 p-3 rounded border border-wuxia-gold/10 whitespace-pre-wrap break-words max-h-32 overflow-y-auto custom-scrollbar font-mono leading-relaxed">
                                                            {result.最终负向提示词}
                                                        </div>
                                                    </details>
                                                )}
                                                <details className="group/details">
                                                    <summary className={`text-[11px] text-gray-400 cursor-pointer select-none hover:text-wuxia-gold transition-colors outline-none flex items-center gap-1 before:content-['▶'] before:text-[8px] before:transition-transform group-open/details:before:rotate-90`}>
                                                        原始描述
                                                    </summary>
                                                    <div className="mt-2 text-[10px] text-gray-400/80 bg-black/80 p-3 rounded border border-wuxia-gold/10 whitespace-pre-wrap break-words max-h-32 overflow-y-auto custom-scrollbar font-mono leading-relaxed">
                                                        {result.原始描述 || '未记录描述'}
                                                    </div>
                                                </details>
                                            </div>
                                            
                                            <div className="mt-4 pt-3 flex flex-wrap justify-end gap-2 border-t border-wuxia-gold/10">
                                                {imageSrc && (
                                                    <button
                                                        type="button"
                                                        onClick={() => 打开图片查看器(imageSrc, `${record.NPC姓名} 图片`)}
                                                        className={次级按钮样式()}
                                                    >
                                                        查看大图
                                                    </button>
                                                )}
                                                {onSetPersistentWallpaper && imageSrc && status === 'success' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => { void (isPersistentWallpaper ? handleClearPersistentWallpaper() : handleSetPersistentWallpaper(imageSrc)); }}
                                                        disabled={busyActionKey === `set_persistent_wallpaper_${imageSrc}` || busyActionKey === 'clear_persistent_wallpaper'}
                                                        className={次级按钮样式()}
                                                    >
                                                        {isPersistentWallpaper ? '取消常驻壁纸' : '设为常驻壁纸'}
                                                    </button>
                                                )}
                                                {onSaveImageLocally && imageId && !hasLocalCopy && (
                                                    <button type="button" onClick={() => { void handleSaveNpcImageLocally(record.NPC标识, imageId); }} disabled={busyActionKey === `local_npc_${imageId}`} className={次级按钮样式()}>
                                                        保存到本地
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 min-h-[400px]">
                            <div className="text-wuxia-gold/20 text-6xl mb-4 font-serif"><IconScroll size={64} /></div>
                            <div className="text-wuxia-gold/60 font-serif text-lg mb-2">暂无历史记录</div>
                            <div className="text-gray-500 text-xs">成功、失败与处理中记录都会在这里留档，目前尚无记录。</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );



    return (
        <div className="fixed inset-0 z-[230] bg-black/90 backdrop-blur-md flex items-center justify-center p-0 md:p-4 animate-fadeIn overflow-hidden">
            <ImageManagerShell
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onClose={onClose}
                filters={filters}
                setFilters={setFilters}
                图片统计={图片统计}
                队列统计={队列统计}
                npcLibraryGroups={npcLibraryGroups}
                filteredCombinedQueue={filteredCombinedQueue}
                combinedHistoryRecords={combinedHistoryRecords}
                actionError={actionError}
                标签按钮样式={标签按钮样式}
            >
                {activeTab === 'manual' && renderManualTab()}
                {activeTab === 'library' && renderLibraryTab()}
                {activeTab === 'scene' && renderSceneTab()}
                {activeTab === 'queue' && (
                    <QueueTab
                        filteredCombinedQueue={filteredCombinedQueue}
                        busyActionKey={busyActionKey}
                        onDeleteQueueTask={handleDeleteQueueTask}
                        onClearQueue={handleClearQueue}
                        onDeleteSceneQueueTask={handleDeleteSceneQueueTask}
                        onClearSceneQueue={handleClearSceneQueue}
                        onRetryImage={onRetryImage}
                        打开手动生图页={打开手动生图页}
                    />
                )}
                {activeTab === 'history' && renderHistoryTab()}
                {activeTab === 'presets' && (
                <PresetsTab
                    autoNpcArtistPresets={autoNpcArtistPresets}
                    autoSceneArtistPresets={autoSceneArtistPresets}
                    pngStylePresets={pngStylePresets}
                    currentPngStylePresetId={currentPngStylePresetId}
                    characterAnchors={characterAnchors}
                    characterAnchorNpcOptions={characterAnchorNpcOptions}
                    editorScopedArtistPresets={editorScopedArtistPresets}
                    editorSelectedArtistPreset={editorSelectedArtistPreset}
                    presetFeature={presetFeature}
                    characterAnchorEditorId={characterAnchorEditorId}
                    setCharacterAnchorEditorId={setCharacterAnchorEditorId}
                    characterAnchorNpcId={characterAnchorNpcId}
                    setCharacterAnchorNpcId={setCharacterAnchorNpcId}
                    characterAnchorDraft={characterAnchorDraft}
                    setCharacterAnchorDraft={setCharacterAnchorDraft}
                    characterAnchorExtractStage={characterAnchorExtractStage}
                    characterAnchorExtractRequirement={characterAnchorExtractRequirement}
                    setCharacterAnchorExtractRequirement={setCharacterAnchorExtractRequirement}
                    characterAnchorExtractMessage={characterAnchorExtractMessage}
                    pngPresetEditorId={pngPresetEditorId}
                    setPngPresetEditorId={setPngPresetEditorId}
                    pngPresetDraft={pngPresetDraft}
                    updatePngPresetDraft={updatePngPresetDraft}
                    pngPresetImportName={pngPresetImportName}
                    setPngPresetImportName={setPngPresetImportName}
                    pngPresetImportRequirement={pngPresetImportRequirement}
                    setPngPresetImportRequirement={setPngPresetImportRequirement}
                    pngImportStage={pngImportStage}
                    pngImportMessage={pngImportMessage}
                    artistPresetScope={artistPresetScope}
                    setArtistPresetScope={setArtistPresetScope}
                    editorArtistPresetId={editorArtistPresetId}
                    setEditorArtistPresetId={setEditorArtistPresetId}
                    manualBackgroundMode={manualBackgroundMode}
                    setManualBackgroundMode={setManualBackgroundMode}
                    busyActionKey={busyActionKey}
                    onSaveApiConfig={onSaveApiConfig}
                    onExtractCharacterAnchor={onExtractCharacterAnchor}
                    onSaveCharacterAnchor={onSaveCharacterAnchor}
                    onDeleteCharacterAnchor={onDeleteCharacterAnchor}
                    onSetCurrentPngStylePreset={onSetCurrentPngStylePreset}
                    onSavePngStylePreset={onSavePngStylePreset}
                    onDeletePngStylePreset={onDeletePngStylePreset}
                    onExportPngStylePresets={onExportPngStylePresets}
                    onImportPngStylePresets={onImportPngStylePresets}
                    handleSelectAutoArtistPreset={handleSelectAutoArtistPreset}
                    handleSelectAutoPngPreset={handleSelectAutoPngPreset}
                    handleExtractCharacterAnchor={handleExtractCharacterAnchor}
                    handleSaveCharacterAnchor={handleSaveCharacterAnchor}
                    handleDeleteCharacterAnchor={handleDeleteCharacterAnchor}
                    handleImportPngFile={handleImportPngFile}
                    handleSavePngPreset={handleSavePngPreset}
                    handleDeletePngPreset={handleDeletePngPreset}
                    handleAddArtistPreset={handleAddArtistPreset}
                    handleDeleteArtistPreset={handleDeleteArtistPreset}
                    handleExportArtistPresets={handleExportArtistPresets}
                    handleImportPresetFile={handleImportPresetFile}
                    handleSavePresetConfig={handleSavePresetConfig}
                    updateArtistPreset={updateArtistPreset}
                />
            )}
            {activeTab === 'rules' && (
                <RulesTab
                    activeRuleSection={activeRuleSection}
                    modelRulePanelOpen={modelRulePanelOpen}
                    busyActionKey={busyActionKey}
                    presetFeature={presetFeature}
                    editorModelTransformerPresets={editorModelTransformerPresets}
                    npcTransformerPresets={npcTransformerPresets}
                    sceneTransformerPresets={sceneTransformerPresets}
                    sceneJudgePresets={sceneJudgePresets}
                    modelTransformerPresetEditorId={modelTransformerPresetEditorId}
                    npcTransformerPresetEditorId={npcTransformerPresetEditorId}
                    sceneTransformerPresetEditorId={sceneTransformerPresetEditorId}
                    sceneJudgePresetEditorId={sceneJudgePresetEditorId}
                    当前生效NPC预设ID={当前生效NPC预设ID}
                    当前生效场景预设ID={当前生效场景预设ID}
                    当前生效场景判定预设ID={当前生效场景判定预设ID}
                    editorSelectedModelTransformerPreset={editorSelectedModelTransformerPreset}
                    editorSelectedNpcTransformerPreset={editorSelectedNpcTransformerPreset}
                    editorSelectedSceneTransformerPreset={editorSelectedSceneTransformerPreset}
                    editorSelectedSceneJudgePreset={editorSelectedSceneJudgePreset}
                    activeModelTransformerPreset={activeModelTransformerPreset}
                    setModelRulePanelOpen={setModelRulePanelOpen}
                    setActiveRuleSection={setActiveRuleSection}
                    setModelTransformerPresetEditorId={setModelTransformerPresetEditorId}
                    setNpcTransformerPresetEditorId={setNpcTransformerPresetEditorId}
                    setSceneTransformerPresetEditorId={setSceneTransformerPresetEditorId}
                    setSceneJudgePresetEditorId={setSceneJudgePresetEditorId}
                    handleSavePresetConfig={handleSavePresetConfig}
                    handleSelectDefaultNpcTransformerPreset={handleSelectDefaultNpcTransformerPreset}
                    handleSelectDefaultSceneTransformerPreset={handleSelectDefaultSceneTransformerPreset}
                    handleSelectDefaultSceneJudgePreset={handleSelectDefaultSceneJudgePreset}
                    handleAddModelTransformerPreset={handleAddModelTransformerPreset}
                    handleDeleteModelTransformerPreset={handleDeleteModelTransformerPreset}
                    handleExportModelTransformerPresets={handleExportModelTransformerPresets}
                    handleImportModelTransformerPresets={handleImportModelTransformerPresets}
                    handleToggleModelTransformerPreset={handleToggleModelTransformerPreset}
                    handleAddNpcTransformerPreset={handleAddNpcTransformerPreset}
                    handleDeleteNpcTransformerPreset={handleDeleteNpcTransformerPreset}
                    handleAddSceneTransformerPreset={handleAddSceneTransformerPreset}
                    handleDeleteSceneTransformerPreset={handleDeleteSceneTransformerPreset}
                    handleAddSceneJudgePreset={handleAddSceneJudgePreset}
                    handleDeleteSceneJudgePreset={handleDeleteSceneJudgePreset}
                    updateModelTransformerPreset={updateModelTransformerPreset}
                    updateTransformerPreset={updateTransformerPreset}
                    updatePresetFeature={updatePresetFeature}
                    onSaveApiConfig={onSaveApiConfig}
                />
            )}
        </ImageManagerShell>

        {imageViewer && (
            <ImageViewerOverlay
                src={imageViewer.src}
                alt={imageViewer.alt}
                onClose={() => setImageViewer(null)}
            />
        )}

        {manualFlowStage !== 'idle' && (
            <ManualConfirmOverlay
                flowStage={manualFlowStage}
                selectedNpcName={selectedNpc?.姓名}
                composition={manualComposition}
                customComposition={manualCustomComposition}
                backgroundMode={manualBackgroundMode}
                extraRequirement={manualExtraRequirement}
                npcSummary={selectedNpcSummary || '暂无资料'}
                statusText={manualStatusText}
                recentTask={recentManualQueueTask}
                fallbackTask={recentQueueTask}
                获取生图阶段中文={获取生图阶段中文}
                从任务状态推导阶段={从任务状态推导阶段}
                主按钮样式={主按钮样式}
                次级按钮样式={次级按钮样式}
                onCancelConfirm={handleCancelConfirm}
                onCancelSubmitting={handleCancelSubmitting}
                onSubmitManual={handleSubmitManual}
                canSubmit={canSubmitManual}
            />
        )}

        {promptDisplayModal.打开 && (
            <PromptDisplayOverlay
                打开={promptDisplayModal.打开}
                生图词组={promptDisplayModal.生图词组}
                最终正向提示词={promptDisplayModal.最终正向提示词}
                最终负向提示词={promptDisplayModal.最终负向提示词}
                错误信息={promptDisplayModal.错误信息}
                onClose={() => setPromptDisplayModal({ 打开: false })}
            />
        )}
    </div>
    );
};

export default ImageManagerModal;
