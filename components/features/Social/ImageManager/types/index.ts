/**
 * ImageManager Types
 * Extracted type definitions from ImageManagerModal.tsx
 */

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
} from '../../../../../types';

// ============ Props Interface (from ImageManagerModal.tsx) ============

export interface Props {
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
    onGenerateImage?: (npcId: string, options?: {
        构图?: '头像' | '半身' | '立绘';
        画风?: '通用' | '二次元' | '写实' | '国风';
        画师串?: string;
        画师串预设ID?: string;
        PNG画风预设ID?: string;
        额外要求?: string;
        尺寸?: string;
        后台处理?: boolean;
    }) => Promise<void> | void;
    onGenerateSecretPartImage?: (npcId: string, part: 香闺秘档部位类型 | '全部', options?: {
        画风?: '通用' | '二次元' | '写实' | '国风';
        画师串?: string;
        画师串预设ID?: string;
        PNG画风预设ID?: string;
        额外要求?: string;
        尺寸?: string;
        后台处理?: boolean;
    }) => Promise<void> | void;
    onRetryImage?: (npcId: string, options?: {
        重试模式?: '完全重试' | '复用提示词';
        保留提示词?: { 生图词组: string; 最终正向提示词: string; 最终负向提示词: string };
    }) => Promise<void> | void;
    onGenerateSceneImage?: (options?: {
        画师串预设ID?: string;
        PNG画风预设ID?: string;
        构图要求?: '纯场景' | '故事快照';
        尺寸?: string;
        额外要求?: string;
        后台处理?: boolean;
    }) => Promise<void> | void;
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

// ============ Internal Types ============

export type 手动流程阶段 = 'idle' | 'confirm' | 'submitting';

export type 页面标签类型 = 'manual' | 'library' | 'scene' | 'queue' | 'history' | 'presets' | 'rules';

export type NPC图库分组 = {
    npc: NPC结构;
    records: NPC图片记录[];
};

export type 合并队列记录 = {
    类型: 'npc' | 'scene';
    id: string;
    创建时间: number;
    状态: NPC生图任务记录['状态'];
    task: NPC生图任务记录 | 场景生图任务记录;
};

export type 合并历史记录 = {
    类型: 'npc' | 'scene';
    key: string;
    时间: number;
    状态: 图片生成状态类型;
    npcRecord?: NPC图片记录;
    sceneRecord?: 场景图片档案['最近生图结果'];
};

// ============ Tab Props Types ============

export interface ManualTabProps {
    // State
    selectedNpcId: string;
    selectedNpc?: NPC结构 | null;
    npcOptions: { id: string; 姓名: string; 性别?: string; 是否主要角色?: boolean }[];
    manualComposition: '头像' | '半身' | '立绘' | '自定义';
    manualCustomComposition: string;
    manualStyle: '无要求' | '通用' | '二次元' | '写实' | '国风';
    manualSizePreset: 'none' | '1:1' | '3:4' | '9:16' | '16:9' | 'custom';
    manualSizeScale: '1x' | '2x';
    manualWidth: string;
    manualHeight: string;
    manualArtistPresetId: string;
    manualPngPresetId: string;
    manualExtraRequirement: string;
    manualBackgroundMode: boolean;
    manualError: string;
    manualStatusText: string;
    manualPresetSize?: { 宽: string; 高: string; 描述: string };
    secretStyle: '无要求' | '通用' | '二次元' | '写实' | '国风';
    secretSizePreset: 'none' | '1:1' | '3:4' | '9:16' | '16:9' | 'custom';
    secretSizeScale: '1x' | '2x';
    secretWidth: string;
    secretHeight: string;
    secretArtistPresetId: string;
    secretPngPresetId: string;
    secretExtraRequirement: string;
    secretStatusText: string;
    secretPresetSize?: { 宽: string; 高: string; 描述: string };
    artistPresets: 画师串预设结构[];
    pngStylePresets: PNG画风预设结构[];
    selectedArtistPreset?: { 正面提示词?: string; 负面提示词?: string };
    selectedManualPngPreset?: { 正面提示词?: string; 负面提示词?: string };
    selectedSecretArtistPreset?: { 正面提示词?: string; 负面提示词?: string };
    selectedSecretPngPreset?: { 正面提示词?: string; 负面提示词?: string };
    manualActiveTask?: NPC生图任务记录;
    canSubmitManual: boolean;
    currentManualRoleAnchor?: { 是否启用?: boolean; 名称?: string } | null;
    selectedNpcLatestRecord?: { 状态: string; 生图词组?: string } | null;
    selectedNpcPreviewImage?: string;
    selectedNpcSummary?: string;
    showRealm: boolean;
    busyActionKey: string;
    获取图片展示地址: (result: any) => string | undefined;
    打开图片查看器: (src: string, alt: string) => void;
    // Setters
    setSelectedNpcId: (id: string) => void;
    setManualComposition: (value: '头像' | '半身' | '立绘' | '自定义') => void;
    setManualCustomComposition: (value: string) => void;
    setManualStyle: (value: '无要求' | '通用' | '二次元' | '写实' | '国风') => void;
    setManualSizePreset: (value: 'none' | '1:1' | '3:4' | '9:16' | '16:9' | 'custom') => void;
    setManualSizeScale: (value: '1x' | '2x') => void;
    setManualWidth: (value: string) => void;
    setManualHeight: (value: string) => void;
    setManualArtistPresetId: (value: string) => void;
    setManualPngPresetId: (value: string) => void;
    setManualExtraRequirement: (value: string) => void;
    setManualBackgroundMode: (value: boolean) => void;
    setManualError: (value: string) => void;
    setManualStatusText: (value: string) => void;
    setSecretStyle: (value: '无要求' | '通用' | '二次元' | '写实' | '国风') => void;
    setSecretSizePreset: (value: 'none' | '1:1' | '3:4' | '9:16' | '16:9' | 'custom') => void;
    setSecretSizeScale: (value: '1x' | '2x') => void;
    setSecretWidth: (value: string) => void;
    setSecretHeight: (value: string) => void;
    setSecretArtistPresetId: (value: string) => void;
    setSecretPngPresetId: (value: string) => void;
    setSecretExtraRequirement: (value: string) => void;
    setActiveTab: (tab: string) => void;
    // Handlers
    handleOpenConfirm?: () => void;
    handleSubmitSecretPart?: (part: string) => Promise<void>;
    onGenerateSecretPartImage?: boolean;
}