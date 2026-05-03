import React from 'react';
import type { 
    NPC结构,
    NPC生图任务记录,
    画师串预设结构,
    PNG画风预设结构
} from '../../../../../types';
import { 
    次级按钮样式,
    主按钮样式
} from '../utils/imageManagerConstants';
import { 
    格式化时间,
    获取NPC构图文案,
    统计卡,
    空状态
} from '../utils/imageManagerHelpers';

interface ManualTabProps {
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
    handleOpenConfirm?: () => void;
    handleSubmitSecretPart?: (part: string) => Promise<void>;
    onGenerateSecretPartImage?: boolean;
}

export const ManualTab: React.FC<ManualTabProps> = ({
    selectedNpcId,
    selectedNpc,
    npcOptions,
    manualComposition,
    manualCustomComposition,
    manualStyle,
    manualSizePreset,
    manualSizeScale,
    manualWidth,
    manualHeight,
    manualArtistPresetId,
    manualPngPresetId,
    manualExtraRequirement,
    manualBackgroundMode,
    manualError,
    manualStatusText,
    manualPresetSize,
    secretStyle,
    secretSizePreset,
    secretSizeScale,
    secretWidth,
    secretHeight,
    secretArtistPresetId,
    secretPngPresetId,
    secretExtraRequirement,
    secretStatusText,
    secretPresetSize,
    artistPresets,
    pngStylePresets,
    selectedArtistPreset,
    selectedManualPngPreset,
    selectedSecretArtistPreset,
    selectedSecretPngPreset,
    manualActiveTask,
    canSubmitManual,
    currentManualRoleAnchor,
    selectedNpcLatestRecord,
    selectedNpcPreviewImage,
    selectedNpcSummary,
    showRealm,
    busyActionKey,
    获取图片展示地址,
    打开图片查看器,
    setSelectedNpcId,
    setManualComposition,
    setManualCustomComposition,
    setManualStyle,
    setManualSizePreset,
    setManualSizeScale,
    setManualWidth,
    setManualHeight,
    setManualArtistPresetId,
    setManualPngPresetId,
    setManualExtraRequirement,
    setManualBackgroundMode,
    setManualError,
    setManualStatusText,
    setSecretStyle,
    setSecretSizePreset,
    setSecretSizeScale,
    setSecretWidth,
    setSecretHeight,
    setSecretArtistPresetId,
    setSecretPngPresetId,
    setSecretExtraRequirement,
    setActiveTab,
    handleOpenConfirm,
    handleSubmitSecretPart,
    onGenerateSecretPartImage
}) => {
    const 小标题样式 = 'text-[10px] md:text-xs text-wuxia-gold/70 tracking-widest uppercase font-serif drop-shadow-md';
    const isCustomComposition = manualComposition === '自定义';

    const manualSizeValue = React.useMemo(() => {
        if (manualSizePreset === 'none') return undefined;
        const width = manualWidth.trim();
        const height = manualHeight.trim();
        if (!width || !height) return undefined;
        if (!/^\d+$/.test(width) || !/^\d+$/.test(height)) return undefined;
        return `${width}x${height}`;
    }, [manualHeight, manualSizePreset, manualWidth]);

    const secretSizeValue = React.useMemo(() => {
        if (secretSizePreset === 'none') return undefined;
        const width = secretWidth.trim();
        const height = secretHeight.trim();
        if (!width || !height) return undefined;
        if (!/^\d+$/.test(width) || !/^\d+$/.test(height)) return undefined;
        return `${width}x${height}`;
    }, [secretHeight, secretSizePreset, secretWidth]);

    const 队列状态文案: Record<string, string> = {
        queued: '排队中',
        running: '生成中',
        success: '已完成',
        failed: '失败'
    };

    const secretPartRecords = [
        { part: '胸部', label: '胸部' },
        { part: '腰部', label: '腰部' },
        { part: '臀部', label: '臀部' },
        { part: '腿部', label: '腿部' }
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
            <div className="bg-[#0c0d0f]/90 border border-wuxia-gold/30 rounded shadow-[0_0_30px_rgba(212,175,55,0.05)] p-5 space-y-6 relative overflow-hidden flex flex-col">
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
                    currentManualRoleAnchor?.是否启用 !== false
                        ? 'border-emerald-900/40 bg-emerald-950/20 text-emerald-300'
                        : currentManualRoleAnchor
                            ? 'border-yellow-900/40 bg-yellow-950/20 text-yellow-300'
                            : 'border-wuxia-gold/15 bg-black/30 text-gray-400'
                }`}>
                    {!selectedNpcId
                        ? '未选择角色，无法检查角色锚点。'
                        : !currentManualRoleAnchor
                            ? '该角色未绑定角色锚点，手动生图将只使用常规提示词。'
                            : currentManualRoleAnchor.是否启用 === false
                                ? `该角色已绑定角色锚点，但当前处于停用状态：${currentManualRoleAnchor.名称 || '未命名锚点'}`
                                : `该角色锚点已启用，手动生图会自动附加：${currentManualRoleAnchor.名称 || '未命名锚点'}`}
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
                            {(['头像', '半身', '立绘', '自定义'] as const).map((comp) => (
                                <button
                                    key={comp}
                                    type="button"
                                    onClick={() => setManualComposition(comp)}
                                    className={`rounded border p-3 text-center transition-all duration-300 ${manualComposition === comp ? 'border-wuxia-gold bg-wuxia-gold/20 text-wuxia-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'border-wuxia-gold/20 bg-black/40 text-gray-400 hover:border-wuxia-gold/50'}`}
                                >
                                    <div className="text-sm font-serif">{comp}</div>
                                </button>
                            ))}
                        </div>
                        {isCustomComposition && (
                            <div className="space-y-2">
                                <input
                                    value={manualCustomComposition}
                                    onChange={(e) => {
                                        setManualCustomComposition(e.target.value);
                                        setManualError('');
                                    }}
                                    placeholder="例如：45度侧脸半身、古风战斗姿势"
                                    className="w-full rounded border border-wuxia-gold/20 bg-black/60 px-3 py-2 text-xs text-gray-200 outline-none focus:border-wuxia-gold/60"
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
                                    onClick={() => setManualStyle(style)}
                                    className={`rounded border px-3 py-2 text-xs font-serif transition-all duration-300 ${manualStyle === style ? 'border-wuxia-gold bg-wuxia-gold/20 text-wuxia-gold' : 'border-wuxia-gold/20 bg-black/40 text-gray-400 hover:border-wuxia-gold/50'}`}
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
                                onClick={() => isCustomComposition && setManualSizePreset('none')}
                                disabled={!isCustomComposition}
                                className={`rounded border px-2 py-2 text-center text-xs ${manualSizePreset === 'none' ? 'border-wuxia-gold bg-wuxia-gold/20 text-wuxia-gold' : 'border-wuxia-gold/20 bg-black/40 text-gray-400'} ${!isCustomComposition ? 'opacity-60' : ''}`}
                            >
                                无要求
                            </button>
                            {(['1:1', '3:4', '9:16', '16:9'] as const).map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => isCustomComposition && setManualSizePreset(preset)}
                                    disabled={!isCustomComposition}
                                    className={`rounded border px-2 py-2 text-center text-xs ${manualSizePreset === preset ? 'border-wuxia-gold bg-wuxia-gold/20 text-wuxia-gold' : 'border-wuxia-gold/20 bg-black/40 text-gray-400'} ${!isCustomComposition ? 'opacity-60' : ''}`}
                                >
                                    {preset}
                                </button>
                            ))}
                        </div>
                        <div className="text-[10px] text-gray-500">当前尺寸：{manualSizeValue || (manualSizePreset === 'none' ? '无要求' : '未填写')}</div>
                    </div>

                    <div className="space-y-2">
                        <label className={小标题样式}>画师串预设</label>
                        <select
                            value={manualArtistPresetId}
                            onChange={(e) => setManualArtistPresetId(e.target.value)}
                            className="w-full rounded border border-wuxia-gold/20 bg-black/60 px-4 py-3 text-sm text-gray-200"
                        >
                            {artistPresets.length <= 0 ? (
                                <option value="">未配置预设</option>
                            ) : (
                                artistPresets.map((preset) => (
                                    <option key={preset.id} value={preset.id}>{preset.名称}</option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className={小标题样式}>PNG画风预设</label>
                        <select
                            value={manualPngPresetId}
                            onChange={(e) => setManualPngPresetId(e.target.value)}
                            className="w-full rounded border border-wuxia-gold/20 bg-black/60 px-4 py-3 text-sm text-gray-200"
                        >
                            <option value="">不启用</option>
                            {pngStylePresets.map((preset) => (
                                <option key={preset.id} value={preset.id}>{preset.名称}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className={小标题样式}>额外要求</label>
                        <textarea
                            value={manualExtraRequirement}
                            onChange={(e) => setManualExtraRequirement(e.target.value)}
                            rows={3}
                            placeholder="如：白衣飘飘、御剑横空..."
                            className="w-full rounded border border-wuxia-gold/20 bg-black/60 px-4 py-3 text-sm text-gray-200"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                <div className="bg-[#0c0d0f]/90 border border-wuxia-gold/30 rounded shadow-[0_0_30px_rgba(212,175,55,0.05)] p-5 space-y-4 flex-1 flex flex-col">
                    <div className="border-b border-wuxia-gold/10 pb-3 mb-1">
                        <div className="text-lg font-serif text-wuxia-gold tracking-wider">任务设置</div>
                    </div>

                    <div className="rounded border border-wuxia-gold/10 bg-black/30 p-4 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-sm font-medium text-gray-200">后台处理</div>
                                <div className="text-xs text-gray-500">提交后任务会进入队列</div>
                            </div>
                            <input
                                type="checkbox"
                                checked={manualBackgroundMode}
                                onChange={(e) => setManualBackgroundMode(e.target.checked)}
                                className="w-5 h-5"
                            />
                        </div>
                    </div>

                    {manualError && (
                        <div className="rounded border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-300">{manualError}</div>
                    )}

                    {manualStatusText && (
                        <div className="rounded border border-wuxia-gold/40 bg-wuxia-gold/10 p-3 text-sm text-wuxia-gold">{manualStatusText}</div>
                    )}

                    <div className="mt-auto pt-4 flex gap-3">
                        <button type="button" onClick={handleOpenConfirm} disabled={!canSubmitManual} className={`flex-1 rounded border px-4 py-3 text-sm font-serif ${canSubmitManual ? 'border-wuxia-gold bg-wuxia-gold/20 text-wuxia-gold' : 'border-gray-800 text-gray-600'}`}>
                            {manualBackgroundMode ? '加入队列' : '立即生成'}
                        </button>
                        <button type="button" onClick={() => setActiveTab('queue')} className={次级按钮样式()}>
                            查看队列
                        </button>
                    </div>
                </div>

                {selectedNpc && selectedNpc.性别?.includes('女') && (
                    <div className="bg-[#0c0d0f]/90 border border-fuchsia-900/40 rounded shadow-[0_0_30px_rgba(192,38,211,0.05)] p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-fuchsia-900/20 pb-3">
                            <div>
                                <div className="text-fuchsia-400 font-serif text-lg">私密部位特写</div>
                                <div className="text-[10px] text-gray-500">为当前角色生成</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleSubmitSecretPart?.('全部')}
                                disabled={!!busyActionKey || !onGenerateSecretPartImage}
                                className="px-3 py-1.5 rounded border border-fuchsia-800/60 bg-fuchsia-950/30 text-xs text-fuchsia-300"
                            >
                                全部生成
                            </button>
                        </div>

                        {secretStatusText && (
                            <div className="rounded border border-fuchsia-900/30 bg-fuchsia-950/20 p-3 text-sm text-fuchsia-200">
                                {secretStatusText}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="lg:col-span-2 bg-[#0c0d0f]/90 border border-wuxia-gold/30 rounded grid grid-cols-1 md:grid-cols-2 overflow-hidden mt-6">
                <div className="border-b md:border-b-0 md:border-r border-wuxia-gold/10 flex flex-col">
                    <div className="p-4 border-b border-wuxia-gold/10 bg-black/20">
                        <div className="text-wuxia-gold font-serif text-lg">图片预览</div>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-4 min-h-[300px]">
                        {selectedNpcPreviewImage ? (
                            <button type="button" onClick={() => 打开图片查看器(selectedNpcPreviewImage, `${selectedNpc?.姓名}`)}>
                                <img src={selectedNpcPreviewImage} alt="preview" className="max-h-[400px]" />
                            </button>
                        ) : (
                            <div className="text-center text-gray-500">暂无可预览图片</div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col">
                    <div className="p-4 border-b border-wuxia-gold/10 bg-black/20">
                        <div className="text-wuxia-gold font-serif text-lg">角色资料</div>
                    </div>
                    <div className="flex-1 p-5 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className={小标题样式}>姓名</div>
                                <div className="text-sm text-gray-200 font-serif">{selectedNpc?.姓名 || '未知'}</div>
                            </div>
                            {showRealm && (
                                <div>
                                    <div className={小标题样式}>境界</div>
                                    <div className="text-sm text-gray-200">{selectedNpc?.境界 || '凡人'}</div>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 text-sm text-gray-300">{selectedNpcSummary || '未找到角色资料'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManualTab;