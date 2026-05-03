import React from 'react';
import type {
    NPC结构,
    接口设置结构,
    画师串预设结构,
    角色锚点结构,
    PNG画风预设结构
} from '../../../../../types';
import ToggleSwitch from '../../../../ui/ToggleSwitch';
import {
    获取图片资源文本地址,
} from '../../../../../utils/imageAssets';
import {
    预设输入拦截键盘事件,
    读取角色锚点特征摘要,
} from '../utils/imageManagerHelpers';
import {
    主按钮样式,
    次级按钮样式,
} from '../utils/imageManagerConstants';

interface PresetsTabProps {
    // Data
    autoNpcArtistPresets: 画师串预设结构[];
    autoSceneArtistPresets: 画师串预设结构[];
    pngStylePresets: PNG画风预设结构[];
    currentPngStylePresetId: string;
    characterAnchors: 角色锚点结构[];
    characterAnchorNpcOptions: { id: string; 姓名: string; 是否失效: boolean }[];
    editorScopedArtistPresets: 画师串预设结构[];
    editorSelectedArtistPreset: 画师串预设结构 | undefined;
    presetFeature?: {
        当前NPC画师串预设ID?: string;
        当前NPCPNG画风预设ID?: string;
        当前场景画师串预设ID?: string;
        当前场景PNG画风预设ID?: string;
    };

    // State & setters — character anchor
    characterAnchorEditorId: string;
    setCharacterAnchorEditorId: (id: string) => void;
    characterAnchorNpcId: string;
    setCharacterAnchorNpcId: (id: string) => void;
    characterAnchorDraft: 角色锚点结构 | null;
    setCharacterAnchorDraft: React.Dispatch<React.SetStateAction<角色锚点结构 | null>>;
    characterAnchorExtractStage: 'idle' | 'extracting' | 'done' | 'error';
    characterAnchorExtractRequirement: string;
    setCharacterAnchorExtractRequirement: (v: string) => void;
    characterAnchorExtractMessage: string;

    // State & setters — PNG preset
    pngPresetEditorId: string;
    setPngPresetEditorId: (id: string) => void;
    pngPresetDraft: PNG画风预设结构 | null;
    updatePngPresetDraft: (updater: (preset: PNG画风预设结构) => PNG画风预设结构) => void;
    pngPresetImportName: string;
    setPngPresetImportName: (v: string) => void;
    pngPresetImportRequirement: string;
    setPngPresetImportRequirement: (v: string) => void;
    pngImportStage: 'idle' | 'parsing' | 'done' | 'error';
    pngImportMessage: string;

    // State & setters — artist preset
    artistPresetScope: 'npc' | 'scene';
    setArtistPresetScope: (v: 'npc' | 'scene') => void;
    editorArtistPresetId: string;
    setEditorArtistPresetId: (id: string) => void;

    // State & setters — shared
    manualBackgroundMode: boolean;
    setManualBackgroundMode: (v: boolean) => void;
    busyActionKey: string;

    // Callbacks
    onSaveApiConfig?: (config: 接口设置结构) => Promise<void> | void;
    onExtractCharacterAnchor?: (npcId: string, options?: { 名称?: string; 额外要求?: string }) => Promise<角色锚点结构 | null> | 角色锚点结构 | null | void;
    onSaveCharacterAnchor?: (anchor: 角色锚点结构) => Promise<角色锚点结构 | null> | 角色锚点结构 | null | void;
    onDeleteCharacterAnchor?: (anchorId: string) => Promise<void> | void;
    onSetCurrentPngStylePreset?: (presetId: string) => Promise<void> | void;
    onSavePngStylePreset?: (preset: PNG画风预设结构) => Promise<PNG画风预设结构 | null | void> | PNG画风预设结构 | null | void;
    onDeletePngStylePreset?: (presetId: string) => Promise<void> | void;
    onExportPngStylePresets?: () => void;
    onImportPngStylePresets?: () => Promise<void> | void;

    // Handlers (from useImageManagerActions)
    handleSelectAutoArtistPreset: (scope: 'npc' | 'scene', presetId: string) => void;
    handleSelectAutoPngPreset: (scope: 'npc' | 'scene', presetId: string) => void;
    handleExtractCharacterAnchor: () => Promise<void>;
    handleSaveCharacterAnchor: () => Promise<void>;
    handleDeleteCharacterAnchor: () => Promise<void>;
    handleImportPngFile: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    handleSavePngPreset: () => Promise<void>;
    handleDeletePngPreset: () => Promise<void>;
    handleAddArtistPreset: () => void;
    handleDeleteArtistPreset: () => void;
    handleExportArtistPresets: () => void;
    handleImportPresetFile: (event: React.ChangeEvent<HTMLInputElement>, type: 'artist') => Promise<void>;
    handleSavePresetConfig: () => Promise<void>;
    updateArtistPreset: (presetId: string, updater: (preset: 画师串预设结构) => 画师串预设结构) => void;
}

/**
 * 规则预设 Tab — 灵蕴附加、角色锚点、PNG画风预设、画师串管理
 */
export function PresetsTab({
    autoNpcArtistPresets,
    autoSceneArtistPresets,
    pngStylePresets,
    currentPngStylePresetId,
    characterAnchors,
    characterAnchorNpcOptions,
    editorScopedArtistPresets,
    editorSelectedArtistPreset,
    presetFeature,
    characterAnchorEditorId,
    setCharacterAnchorEditorId,
    characterAnchorNpcId,
    setCharacterAnchorNpcId,
    characterAnchorDraft,
    setCharacterAnchorDraft,
    characterAnchorExtractStage,
    characterAnchorExtractRequirement,
    setCharacterAnchorExtractRequirement,
    characterAnchorExtractMessage,
    pngPresetEditorId,
    setPngPresetEditorId,
    pngPresetDraft,
    updatePngPresetDraft,
    pngPresetImportName,
    setPngPresetImportName,
    pngPresetImportRequirement,
    setPngPresetImportRequirement,
    pngImportStage,
    pngImportMessage,
    artistPresetScope,
    setArtistPresetScope,
    editorArtistPresetId,
    setEditorArtistPresetId,
    manualBackgroundMode,
    setManualBackgroundMode,
    busyActionKey,
    onSaveApiConfig,
    onExtractCharacterAnchor,
    onSaveCharacterAnchor,
    onDeleteCharacterAnchor,
    onSetCurrentPngStylePreset,
    onSavePngStylePreset,
    onDeletePngStylePreset,
    onExportPngStylePresets,
    onImportPngStylePresets,
    handleSelectAutoArtistPreset,
    handleSelectAutoPngPreset,
    handleExtractCharacterAnchor,
    handleSaveCharacterAnchor,
    handleDeleteCharacterAnchor,
    handleImportPngFile,
    handleSavePngPreset,
    handleDeletePngPreset,
    handleAddArtistPreset,
    handleDeleteArtistPreset,
    handleExportArtistPresets,
    handleImportPresetFile,
    handleSavePresetConfig,
    updateArtistPreset,
}: PresetsTabProps) {
    return (
        <div className="flex flex-col h-full bg-[#0c0d0f]/90 border border-wuxia-gold/30 rounded shadow-[0_0_30px_rgba(212,175,55,0.05)] p-5 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_100%)] pointer-events-none"></div>

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex flex-wrap items-center justify-between border-b border-wuxia-gold/10 pb-4 mb-4 shrink-0 gap-4">
                    <div>
                        <div className="text-wuxia-gold font-serif text-xl tracking-wider text-shadow-glow">规则预设</div>
                        <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Formation Matrices</div>
                    </div>
                    <button
                        type="button"
                        onClick={() => { void handleSavePresetConfig(); }}
                        disabled={!onSaveApiConfig || busyActionKey === 'save_preset_config'}
                        className={主按钮样式(!onSaveApiConfig || busyActionKey === 'save_preset_config')}
                    >
                        保存配置
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                    {/* 灵蕴附加 */}
                    <div className="rounded border border-wuxia-gold/20 bg-black/40 p-5 relative group hover:border-wuxia-gold/40 transition-colors">
                        <div className="absolute top-0 right-0 px-2 py-0.5 bg-wuxia-gold/10 border-b border-l border-wuxia-gold/20 text-[10px] text-wuxia-gold/80 font-serif rounded-bl">
                            灵蕴附加
                        </div>
                        <div className="mb-4">
                            <div className="text-sm font-serif text-wuxia-gold/90">自动画师串预设</div>
                            <div className="text-[10px] text-gray-500 mt-1">自动生图时默认附加的画师串预设。</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">生灵附加 (NPC)</label>
                                <select value={presetFeature?.当前NPC画师串预设ID || ''} onChange={(e) => handleSelectAutoArtistPreset('npc', e.target.value)} className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-sm text-gray-300 outline-none focus:border-wuxia-gold/50 focus:ring-1 focus:ring-wuxia-gold/20 transition-all font-serif">
                                    <option value="">不启用</option>
                                    {autoNpcArtistPresets.map((preset) => (
                                        <option key={preset.id} value={preset.id}>{preset.名称}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">NPC PNG预设</label>
                                <select value={presetFeature?.当前NPCPNG画风预设ID || ''} onChange={(e) => handleSelectAutoPngPreset('npc', e.target.value)} className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-sm text-gray-300 outline-none focus:border-wuxia-gold/50 focus:ring-1 focus:ring-wuxia-gold/20 transition-all font-serif">
                                    <option value="">不启用</option>
                                    {pngStylePresets.map((preset) => (
                                        <option key={preset.id} value={preset.id}>{preset.名称}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">场景预设</label>
                                <select value={presetFeature?.当前场景画师串预设ID || ''} onChange={(e) => handleSelectAutoArtistPreset('scene', e.target.value)} className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-sm text-gray-300 outline-none focus:border-wuxia-gold/50 focus:ring-1 focus:ring-wuxia-gold/20 transition-all font-serif">
                                    <option value="">不启用</option>
                                    {autoSceneArtistPresets.map((preset) => (
                                        <option key={preset.id} value={preset.id}>{preset.名称}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">场景 PNG预设</label>
                                <select value={presetFeature?.当前场景PNG画风预设ID || ''} onChange={(e) => handleSelectAutoPngPreset('scene', e.target.value)} className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-sm text-gray-300 outline-none focus:border-wuxia-gold/50 focus:ring-1 focus:ring-wuxia-gold/20 transition-all font-serif">
                                    <option value="">不启用</option>
                                    {pngStylePresets.map((preset) => (
                                        <option key={preset.id} value={preset.id}>{preset.名称}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 角色锚点 */}
                    <div className="rounded border border-wuxia-gold/20 bg-black/40 p-5 relative group hover:border-wuxia-gold/40 transition-colors">
                        <div className="absolute top-0 right-0 px-2 py-0.5 bg-wuxia-gold/10 border-b border-l border-wuxia-gold/20 text-[10px] text-wuxia-gold/80 font-serif rounded-bl">
                            角色锚点
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-wuxia-gold/10 pb-3">
                            <div>
                                <div className="text-sm font-serif text-wuxia-gold/90">角色锚定管理</div>
                                <div className="text-[10px] text-gray-500 mt-1">角色锚点严格跟随 NPC，每个角色只保留一个锚点。后续生图会直接附加锚点，词组转化器只生成镜头、动作、构图与环境。</div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => { void handleExtractCharacterAnchor(); }}
                                    disabled={!onExtractCharacterAnchor || !(characterAnchorNpcId || characterAnchorDraft?.npcId || characterAnchorNpcOptions[0]?.id) || characterAnchorExtractStage === 'extracting'}
                                    className={次级按钮样式()}
                                >
                                    {characterAnchorExtractStage === 'extracting' ? '提取中...' : 'AI提取锚点'}
                                </button>
                                <button type="button" onClick={() => { void handleSaveCharacterAnchor(); }} disabled={!onSaveCharacterAnchor || !characterAnchorDraft || characterAnchorExtractStage === 'extracting'} className={次级按钮样式()}>保存锚点</button>
                                <button type="button" onClick={() => { void handleDeleteCharacterAnchor(); }} disabled={!onDeleteCharacterAnchor || !characterAnchorDraft?.id || characterAnchorExtractStage === 'extracting'} className={次级按钮样式(true)}>删除锚点</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] gap-4">
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">锚点列表</label>
                                    <div className="space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
                                        {characterAnchors.length <= 0 ? (
                                            <div className="rounded border border-dashed border-wuxia-gold/20 bg-black/20 p-4 text-xs text-gray-500 text-center">
                                                暂无角色锚点
                                            </div>
                                        ) : (
                                            characterAnchors.map((anchor) => {
                                                const isSelected = anchor.id === characterAnchorEditorId;
                                                const npcName = characterAnchorNpcOptions.find((item) => item.id === anchor.npcId)?.姓名 || anchor.名称;
                                                return (
                                                    <button
                                                        key={anchor.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setCharacterAnchorEditorId(anchor.id);
                                                            setCharacterAnchorNpcId(anchor.npcId);
                                                        }}
                                                        className={`w-full rounded border p-3 text-left transition-all duration-300 ${isSelected ? 'border-wuxia-gold/80 bg-wuxia-gold/10 shadow-[0_0_16px_rgba(212,175,55,0.25)]' : 'border-wuxia-gold/10 bg-black/40 hover:border-wuxia-gold/40 hover:bg-white/5'}`}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="min-w-0">
                                                                <div className={`text-sm font-serif truncate ${isSelected ? 'text-wuxia-gold' : 'text-gray-300'}`}>{anchor.名称 || '未命名锚点'}</div>
                                                                <div className="text-[10px] text-gray-500 mt-1 truncate">{npcName || '未绑定角色'}</div>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                                <span className={`text-[10px] px-2 py-0.5 rounded border ${anchor.是否启用 ? 'border-emerald-700/50 text-emerald-300 bg-emerald-950/20' : 'border-gray-700 text-gray-400 bg-black/30'}`}>{anchor.是否启用 ? '启用' : '停用'}</span>
                                                                {anchor.场景生图自动注入 && <span className="text-[10px] text-wuxia-gold/60">场景联动</span>}
                                                            </div>
                                                        </div>
                                                        <div className="text-[10px] text-gray-500 mt-2 line-clamp-3">{anchor.正面提示词 || '未填写稳定提示词'}</div>
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">绑定 NPC</label>
                                        <select
                                            value={characterAnchorDraft?.npcId || characterAnchorNpcId}
                                            onChange={(e) => {
                                                const nextNpcId = e.target.value;
                                                setCharacterAnchorEditorId('');
                                                setCharacterAnchorNpcId(nextNpcId);
                                            }}
                                            disabled={characterAnchorExtractStage === 'extracting'}
                                            className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-sm text-gray-300 outline-none focus:border-wuxia-gold/50 transition-all font-serif"
                                        >
                                            <option value="">请选择角色</option>
                                            {characterAnchorNpcOptions.map((npc) => (
                                                <option key={npc.id} value={npc.id}>{npc.姓名}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">提取附加要求</label>
                                        <input
                                            type="text"
                                            value={characterAnchorExtractRequirement}
                                            onChange={(e) => setCharacterAnchorExtractRequirement(e.target.value)}
                                            onKeyDown={预设输入拦截键盘事件}
                                            placeholder="例如：更重视脸部、发色、胸型和常驻衣着"
                                            disabled={characterAnchorExtractStage === 'extracting'}
                                            className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-xs text-gray-300 outline-none focus:border-wuxia-gold/50 transition-all"
                                        />
                                    </div>
                                </div>

                                {characterAnchorExtractMessage && (
                                    <div className={`rounded border px-3 py-2 text-xs ${
                                        characterAnchorExtractStage === 'error'
                                            ? 'border-red-900/40 bg-red-950/20 text-red-300'
                                            : characterAnchorExtractStage === 'done'
                                                ? 'border-emerald-900/40 bg-emerald-950/20 text-emerald-300'
                                                : 'border-wuxia-gold/20 bg-black/30 text-wuxia-gold/80'
                                    }`}>
                                        {characterAnchorExtractMessage}
                                    </div>
                                )}

                                {characterAnchorDraft ? (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">锚点名称</label>
                                            <input
                                                type="text"
                                                value={characterAnchorDraft.名称}
                                                onChange={(e) => setCharacterAnchorDraft((prev) => prev ? { ...prev, 名称: e.target.value } : prev)}
                                                onKeyDown={预设输入拦截键盘事件}
                                                className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-sm text-wuxia-gold/90 outline-none focus:border-wuxia-gold/50 transition-all font-serif"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div className="rounded border border-wuxia-gold/10 bg-black/30 p-3 flex items-center justify-between gap-3">
                                                <div>
                                                    <div className="text-[11px] text-wuxia-gold/70 uppercase tracking-wider">启用锚点</div>
                                                    <div className="text-[10px] text-gray-500 mt-1">关闭后不参与生图</div>
                                                </div>
                                                <ToggleSwitch checked={characterAnchorDraft.是否启用 !== false} onChange={(next) => setCharacterAnchorDraft((prev) => prev ? { ...prev, 是否启用: next } : prev)} ariaLabel="切换角色锚点启用" />
                                            </div>
                                            <div className="rounded border border-wuxia-gold/10 bg-black/30 p-3 flex items-center justify-between gap-3">
                                                <div>
                                                    <div className="text-[11px] text-wuxia-gold/70 uppercase tracking-wider">默认附加</div>
                                                    <div className="text-[10px] text-gray-500 mt-1">NPC 单图自动带入</div>
                                                </div>
                                                <ToggleSwitch checked={characterAnchorDraft.生成时默认附加 === true} onChange={(next) => setCharacterAnchorDraft((prev) => prev ? { ...prev, 生成时默认附加: next } : prev)} ariaLabel="切换默认附加" />
                                            </div>
                                            <div className="rounded border border-wuxia-gold/10 bg-black/30 p-3 flex items-center justify-between gap-3">
                                                <div>
                                                    <div className="text-[11px] text-wuxia-gold/70 uppercase tracking-wider">场景联动</div>
                                                    <div className="text-[10px] text-gray-500 mt-1">场景图自动注入</div>
                                                </div>
                                                <ToggleSwitch checked={characterAnchorDraft.场景生图自动注入 === true} onChange={(next) => setCharacterAnchorDraft((prev) => prev ? { ...prev, 场景生图自动注入: next } : prev)} ariaLabel="切换场景联动" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">正面提示词</label>
                                            <textarea
                                                value={characterAnchorDraft.正面提示词}
                                                onChange={(e) => setCharacterAnchorDraft((prev) => prev ? { ...prev, 正面提示词: e.target.value } : prev)}
                                                onKeyDown={预设输入拦截键盘事件}
                                                rows={6}
                                                className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-xs text-gray-300 outline-none focus:border-wuxia-gold/50 transition-all custom-scrollbar resize-y font-mono"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">负面提示词</label>
                                            <textarea
                                                value={characterAnchorDraft.负面提示词}
                                                onChange={(e) => setCharacterAnchorDraft((prev) => prev ? { ...prev, 负面提示词: e.target.value } : prev)}
                                                onKeyDown={预设输入拦截键盘事件}
                                                rows={3}
                                                className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-xs text-gray-300 outline-none focus:border-wuxia-gold/50 transition-all custom-scrollbar resize-y font-mono"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-3">
                                            <div className="rounded border border-wuxia-gold/10 bg-black/30 p-3">
                                                <div className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider mb-2">结构化特征</div>
                                                <div className="text-[11px] text-gray-400 whitespace-pre-wrap break-words font-mono leading-relaxed">
                                                    {读取角色锚点特征摘要(characterAnchorDraft)}
                                                </div>
                                            </div>
                                            <div className="rounded border border-wuxia-gold/10 bg-black/30 p-3 space-y-2">
                                                <div className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider">当前状态</div>
                                                <div className="text-[11px] text-gray-400">来源：{characterAnchorDraft.来源}</div>
                                                <div className="text-[11px] text-gray-400">模型：{characterAnchorDraft.提取模型信息 || '未记录'}</div>
                                                <div className="text-[11px] text-gray-400">绑定角色：{characterAnchorNpcOptions.find((item) => item.id === characterAnchorDraft.npcId)?.姓名 || '未绑定'}</div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="rounded border border-dashed border-wuxia-gold/20 bg-black/20 p-6 text-sm text-wuxia-gold/40 text-center font-serif">
                                        请选择一个 NPC，再直接 AI 提取该角色的唯一锚点。
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* PNG画风预设 */}
                    <div className="rounded border border-wuxia-gold/20 bg-black/40 p-5 relative group hover:border-wuxia-gold/40 transition-colors">
                        <div className="absolute top-0 right-0 px-2 py-0.5 bg-wuxia-gold/10 border-b border-l border-wuxia-gold/20 text-[10px] text-wuxia-gold/80 font-serif rounded-bl">
                            PNG画风预设
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-wuxia-gold/10 pb-3">
                            <div>
                                <div className="text-sm font-serif text-wuxia-gold/90">PNG 解析与画风复用</div>
                                <div className="text-[10px] text-gray-500 mt-1">导入 PNG 后自动解析并提炼画风，可保存为预设并作为封面。</div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => { if (onExportPngStylePresets) onExportPngStylePresets(); }}
                                    disabled={!onExportPngStylePresets}
                                    className={次级按钮样式()}
                                >
                                    导出预设
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { if (onImportPngStylePresets) void onImportPngStylePresets(); }}
                                    disabled={!onImportPngStylePresets}
                                    className={次级按钮样式()}
                                >
                                    导入预设
                                </button>
                                <label className={次级按钮样式()}>
                                    导入 PNG
                                    <input type="file" accept="image/png" className="hidden" onChange={(e) => { void handleImportPngFile(e); }} />
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-4">
                            <div className="space-y-3">
                                <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">预设列表</label>
                                <div className="space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
                                    {pngStylePresets.length <= 0 ? (
                                        <div className="rounded border border-dashed border-wuxia-gold/20 bg-black/20 p-4 text-xs text-gray-500 text-center">
                                            暂无 PNG 画风预设
                                        </div>
                                    ) : (
                                        pngStylePresets.map((preset) => {
                                            const isSelected = preset.id === pngPresetEditorId;
                                            const coverSrc = preset.封面 ? 获取图片资源文本地址(preset.封面) : '';
                                            return (
                                                <button
                                                    key={preset.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setPngPresetEditorId(preset.id);
                                                        if (onSetCurrentPngStylePreset) {
                                                            void onSetCurrentPngStylePreset(preset.id);
                                                        }
                                                    }}
                                                    className={`w-full rounded border p-3 text-left transition-all duration-300 ${isSelected ? 'border-wuxia-gold/80 bg-wuxia-gold/10 shadow-[0_0_16px_rgba(212,175,55,0.25)]' : 'border-wuxia-gold/10 bg-black/40 hover:border-wuxia-gold/40 hover:bg-white/5'}`}
                                                >
                                                    <div className="flex gap-3 items-center">
                                                        <div className={`w-20 h-14 rounded border overflow-hidden bg-black/60 flex items-center justify-center ${isSelected ? 'border-wuxia-gold/60' : 'border-wuxia-gold/20'}`}>
                                                            {coverSrc ? (
                                                                <img src={coverSrc} alt={preset.名称} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="text-[10px] text-gray-500">无封面</div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className={`text-sm font-serif truncate ${isSelected ? 'text-wuxia-gold' : 'text-gray-300'}`}>{preset.名称 || '未命名预设'}{preset.id === currentPngStylePresetId ? ' · 当前' : ''}</div>
                                                            <div className="text-[10px] text-gray-500 mt-1 line-clamp-2">
                                                                {preset.正面提示词 || '未提炼画风内容'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {pngPresetDraft ? (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-[120px_minmax(0,1fr)] gap-3 items-start">
                                            <div className="space-y-2">
                                                <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">封面</label>
                                                <div className="rounded border border-wuxia-gold/20 bg-black/40 aspect-[4/3] overflow-hidden flex items-center justify-center">
                                                    {pngPresetDraft.封面 ? (
                                                        <img src={获取图片资源文本地址(pngPresetDraft.封面)} alt={pngPresetDraft.名称} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="text-[10px] text-gray-500">未设置封面</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="space-y-2">
                                                    <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">预设名称</label>
                                                    <input
                                                        type="text"
                                                        value={pngPresetDraft.名称}
                                                        onChange={(e) => updatePngPresetDraft((preset) => ({ ...preset, 名称: e.target.value }))}
                                                        onKeyDown={预设输入拦截键盘事件}
                                                        className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-sm text-wuxia-gold/90 outline-none focus:border-wuxia-gold/50 transition-all font-serif"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 text-[11px]">
                                                    <div className="rounded border border-wuxia-gold/10 bg-black/40 p-2">
                                                        <div className="text-wuxia-gold/50 mb-1">来源</div>
                                                        <div className="text-gray-300">{pngPresetDraft.来源}</div>
                                                    </div>
                                                    <div className="rounded border border-wuxia-gold/10 bg-black/40 p-2">
                                                        <div className="text-wuxia-gold/50 mb-1">LoRA 数量</div>
                                                        <div className="text-gray-300">{pngPresetDraft.参数?.LoRA列表?.length || 0}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">画师串</label>
                                            <textarea
                                                value={pngPresetDraft.画师串}
                                                onChange={(e) => updatePngPresetDraft((preset) => ({ ...preset, 画师串: e.target.value }))}
                                                onKeyDown={预设输入拦截键盘事件}
                                                rows={3}
                                                className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-xs text-gray-300 outline-none focus:border-wuxia-gold/50 transition-all custom-scrollbar resize-y font-mono"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">正面提示词</label>
                                            <textarea
                                                value={pngPresetDraft.正面提示词}
                                                onChange={(e) => updatePngPresetDraft((preset) => ({ ...preset, 正面提示词: e.target.value }))}
                                                onKeyDown={预设输入拦截键盘事件}
                                                rows={5}
                                                className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-xs text-gray-300 outline-none focus:border-wuxia-gold/50 transition-all custom-scrollbar resize-y font-mono"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">负面提示词</label>
                                            <textarea
                                                value={pngPresetDraft.负面提示词}
                                                onChange={(e) => updatePngPresetDraft((preset) => ({ ...preset, 负面提示词: e.target.value }))}
                                                onKeyDown={预设输入拦截键盘事件}
                                                rows={3}
                                                className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-xs text-gray-300 outline-none focus:border-wuxia-gold/50 transition-all custom-scrollbar resize-y font-mono"
                                            />
                                        </div>

                                        <div className="rounded border border-wuxia-gold/10 bg-black/30 px-3 py-3">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <div className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider">优先复刻原参数</div>
                                                    <div className="text-[10px] text-gray-500 mt-1">开启后，当前 PNG 预设会把解析出的步数、采样器、CFG、SMEA 等参数一并下发到生图后端；分辨率与 Seed 会自动剔除。</div>
                                                </div>
                                                <ToggleSwitch
                                                    checked={pngPresetDraft.优先复刻原参数 === true}
                                                    onChange={(next) => updatePngPresetDraft((preset) => ({ ...preset, 优先复刻原参数: next }))}
                                                    ariaLabel="切换优先复刻原参数"
                                                />
                                            </div>
                                        </div>

                                        <details className="group/details">
                                            <summary className={`text-[11px] text-gray-400 cursor-pointer select-none hover:text-wuxia-gold transition-colors outline-none flex items-center gap-1 before:content-['▶'] before:text-[8px] before:transition-transform group-open/details:before:rotate-90`}>
                                                解析参数与元数据
                                            </summary>
                                            <div className="mt-2 grid grid-cols-1 gap-3 text-[10px] text-gray-400/80">
                                                <div className="rounded border border-wuxia-gold/10 bg-black/60 p-3 whitespace-pre-wrap break-words font-mono">
                                                    <div className="text-wuxia-gold/70 mb-2">原始正面提示词</div>
                                                    {pngPresetDraft.原始正面提示词 || '未记录'}
                                                </div>
                                                <div className="rounded border border-wuxia-gold/10 bg-black/60 p-3 whitespace-pre-wrap break-words font-mono">
                                                    <div className="text-wuxia-gold/70 mb-2">剥离后正面提示词</div>
                                                    {pngPresetDraft.剥离后正面提示词 || '未记录'}
                                                </div>
                                                <div className="rounded border border-wuxia-gold/10 bg-black/60 p-3 whitespace-pre-wrap break-words font-mono">
                                                    <div className="text-wuxia-gold/70 mb-2">AI提炼正面提示词</div>
                                                    {pngPresetDraft.AI提炼正面提示词 || '未记录'}
                                                </div>
                                            </div>
                                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] text-gray-400/80">
                                                <div className="rounded border border-wuxia-gold/10 bg-black/60 p-3 whitespace-pre-wrap break-words font-mono">
                                                    {pngPresetDraft.参数 ? JSON.stringify(pngPresetDraft.参数, null, 2) : '未解析参数'}
                                                </div>
                                                <div className="rounded border border-wuxia-gold/10 bg-black/60 p-3 whitespace-pre-wrap break-words font-mono">
                                                    {pngPresetDraft.原始元数据 || '未记录原始元数据'}
                                                </div>
                                            </div>
                                        </details>
                                    </>
                                ) : (
                                    <div className="rounded border border-dashed border-wuxia-gold/20 bg-black/20 p-6 text-sm text-wuxia-gold/40 text-center font-serif">
                                        尚未选择 PNG 画风预设。请导入 PNG 或从列表选择预设。
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-wuxia-gold/10 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">导入时预设名称</label>
                                <input
                                    type="text"
                                    value={pngPresetImportName}
                                    onChange={(e) => setPngPresetImportName(e.target.value)}
                                    onKeyDown={预设输入拦截键盘事件}
                                    placeholder="可选，默认使用 PNG 文件名"
                                    className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-xs text-gray-300 outline-none focus:border-wuxia-gold/50 transition-all"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">额外提炼要求</label>
                                <input
                                    type="text"
                                    value={pngPresetImportRequirement}
                                    onChange={(e) => setPngPresetImportRequirement(e.target.value)}
                                    onKeyDown={预设输入拦截键盘事件}
                                    placeholder="例如：偏重画风、光影、材质与线条风格"
                                    className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-xs text-gray-300 outline-none focus:border-wuxia-gold/50 transition-all"
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs">
                                {pngImportStage === 'parsing' && (
                                    <>
                                        <span className="w-4 h-4 rounded-full border-2 border-wuxia-gold border-t-transparent animate-spin" />
                                        <span className="text-wuxia-gold/80">{pngImportMessage || '正在解析 PNG...'}</span>
                                    </>
                                )}
                                {pngImportStage === 'done' && (
                                    <span className="text-emerald-400">{pngImportMessage || 'PNG 解析完成。'}</span>
                                )}
                                {pngImportStage === 'error' && (
                                    <span className="text-red-400">{pngImportMessage || 'PNG 解析失败。'}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 rounded border border-wuxia-gold/20 bg-black/30 px-3 py-2">
                                <div className="text-right">
                                    <div className="text-xs text-gray-200">后台处理</div>
                                    <div className="text-[10px] text-gray-500">{manualBackgroundMode ? '提交后台' : '前台等待'}</div>
                                </div>
                                <ToggleSwitch
                                    checked={manualBackgroundMode}
                                    onChange={setManualBackgroundMode}
                                    ariaLabel="切换PNG解析后台处理模式"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 justify-end">
                                <button
                                    type="button"
                                    onClick={() => { void handleSavePngPreset(); }}
                                    disabled={!pngPresetDraft || !onSavePngStylePreset}
                                    className={次级按钮样式()}
                                >
                                    保存修改
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { void handleDeletePngPreset(); }}
                                    disabled={!pngPresetDraft || !onDeletePngStylePreset}
                                    className={次级按钮样式(true)}
                                >
                                    删除预设
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 画师串管理 */}
                    <div className="rounded border border-wuxia-gold/20 bg-black/40 p-5 relative group hover:border-wuxia-gold/40 transition-colors">
                        <div className="absolute top-0 right-0 px-2 py-0.5 bg-wuxia-gold/10 border-b border-l border-wuxia-gold/20 text-[10px] text-wuxia-gold/80 font-serif rounded-bl">
                            画师串管理
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-wuxia-gold/10 pb-3">
                            <div className="text-sm font-serif text-wuxia-gold/90">画师串预设管理</div>
                            <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={handleAddArtistPreset} className={次级按钮样式()}>新增预设</button>
                                <button type="button" onClick={handleDeleteArtistPreset} disabled={!editorSelectedArtistPreset} className={次级按钮样式(true)}>删除</button>
                                <button type="button" onClick={handleExportArtistPresets} className={次级按钮样式()}>导出预设</button>
                                <label className={次级按钮样式()}>
                                    导入预设
                                    <input type="file" accept="application/json" className="hidden" onChange={(e) => { void handleImportPresetFile(e, 'artist'); }} />
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)] gap-4 mb-4">
                            <div className="space-y-2">
                                <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">适用范围</label>
                                <select value={artistPresetScope} onChange={(e) => setArtistPresetScope(e.target.value as 'npc' | 'scene')} className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-sm text-gray-300 outline-none focus:border-wuxia-gold/50 transition-all font-serif">
                                    <option value="npc">NPC</option>
                                    <option value="scene">场景</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">当前编辑</label>
                                <select value={editorArtistPresetId} onChange={(e) => setEditorArtistPresetId(e.target.value)} className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-sm text-gray-300 outline-none focus:border-wuxia-gold/50 transition-all font-serif">
                                    <option value="">未选择预设</option>
                                    {editorScopedArtistPresets.map((preset) => (
                                        <option key={preset.id} value={preset.id}>{preset.名称}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {editorSelectedArtistPreset ? (
                            <div className="space-y-4 pt-4 border-t border-wuxia-gold/10">
                                <div className="space-y-2">
                                    <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">预设名称</label>
                                    <input type="text" value={editorSelectedArtistPreset.名称} onChange={(e) => updateArtistPreset(editorSelectedArtistPreset.id, (preset) => ({ ...preset, 名称: e.target.value, updatedAt: Date.now() }))} onKeyDown={预设输入拦截键盘事件} className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-sm text-wuxia-gold/90 outline-none focus:border-wuxia-gold/50 transition-all font-serif" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">画师串</label>
                                    <textarea value={editorSelectedArtistPreset.画师串} onChange={(e) => updateArtistPreset(editorSelectedArtistPreset.id, (preset) => ({ ...preset, 画师串: e.target.value, updatedAt: Date.now() }))} onKeyDown={预设输入拦截键盘事件} rows={3} className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-sm text-gray-300 outline-none focus:border-wuxia-gold/50 transition-all custom-scrollbar resize-y font-mono leading-relaxed" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">正面提示词</label>
                                    <textarea value={editorSelectedArtistPreset.正面提示词} onChange={(e) => updateArtistPreset(editorSelectedArtistPreset.id, (preset) => ({ ...preset, 正面提示词: e.target.value, updatedAt: Date.now() }))} onKeyDown={预设输入拦截键盘事件} rows={5} className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-sm text-gray-300 outline-none focus:border-wuxia-gold/50 transition-all custom-scrollbar resize-y font-mono leading-relaxed" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">负向提示词</label>
                                    <textarea value={editorSelectedArtistPreset.负面提示词} onChange={(e) => updateArtistPreset(editorSelectedArtistPreset.id, (preset) => ({ ...preset, 负面提示词: e.target.value, updatedAt: Date.now() }))} onKeyDown={预设输入拦截键盘事件} rows={3} className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-sm text-gray-400 outline-none focus:border-wuxia-gold/50 transition-all custom-scrollbar resize-y font-mono leading-relaxed" />
                                </div>
                            </div>
                        ) : (
                            <div className="rounded border border-dashed border-wuxia-gold/20 bg-black/20 p-6 text-sm text-wuxia-gold/40 text-center font-serif">
                                请先选择或新增预设。
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
