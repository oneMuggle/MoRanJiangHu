import React from 'react';
import type { 
    接口设置结构,
    画师串预设结构,
    模型词组转化器预设结构,
    词组转化器提示词预设结构,
    PNG画风预设结构
} from '../../../../../types';
import { 
    主按钮样式,
    次级按钮样式
} from '../utils/imageManagerConstants';

interface RulesTabProps {
    activeRuleSection: 'npc' | 'scene' | 'scene_judge';
    modelRulePanelOpen: boolean;
    busyActionKey: string;
    presetFeature?: {
        当前NPC画师串预设ID?: string;
        当前NPCPNG画风预设ID?: string;
        当前场景画师串预设ID?: string;
        当前场景PNG画风预设ID?: string;
        词组转化兼容模式?: boolean;
    };
    editorModelTransformerPresets: 模型词组转化器预设结构[];
    npcTransformerPresets: 词组转化器提示词预设结构[];
    sceneTransformerPresets: 词组转化器提示词预设结构[];
    sceneJudgePresets: 词组转化器提示词预设结构[];
    modelTransformerPresetEditorId: string;
    npcTransformerPresetEditorId: string;
    sceneTransformerPresetEditorId: string;
    sceneJudgePresetEditorId: string;
    当前生效NPC预设ID: string;
    当前生效场景预设ID: string;
    当前生效场景判定预设ID: string;
    editorSelectedModelTransformerPreset?: 模型词组转化器预设结构;
    editorSelectedNpcTransformerPreset?: 词组转化器提示词预设结构;
    editorSelectedSceneTransformerPreset?: 词组转化器提示词预设结构;
    editorSelectedSceneJudgePreset?: 词组转化器提示词预设结构;
    activeModelTransformerPreset?: 模型词组转化器预设结构;
    setModelRulePanelOpen: (open: boolean) => void;
    setActiveRuleSection: (section: 'npc' | 'scene' | 'scene_judge') => void;
    setModelTransformerPresetEditorId: (id: string) => void;
    setNpcTransformerPresetEditorId: (id: string) => void;
    setSceneTransformerPresetEditorId: (id: string) => void;
    setSceneJudgePresetEditorId: (id: string) => void;
    handleSavePresetConfig?: () => Promise<void>;
    handleSelectDefaultNpcTransformerPreset?: (id: string) => void;
    handleSelectDefaultSceneTransformerPreset?: (id: string) => void;
    handleSelectDefaultSceneJudgePreset?: (id: string) => void;
    handleAddModelTransformerPreset?: () => void;
    handleDeleteModelTransformerPreset?: () => void;
    handleExportModelTransformerPresets?: () => void;
    handleImportModelTransformerPresets?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleToggleModelTransformerPreset?: (id: string, enabled: boolean) => void;
    handleAddNpcTransformerPreset?: () => void;
    handleDeleteNpcTransformerPreset?: () => void;
    handleAddSceneTransformerPreset?: () => void;
    handleDeleteSceneTransformerPreset?: () => void;
    handleAddSceneJudgePreset?: () => void;
    handleDeleteSceneJudgePreset?: () => void;
    updateModelTransformerPreset?: (id: string, updater: (preset: 模型词组转化器预设结构) => 模型词组转化器预设结构) => void;
    updateTransformerPreset?: (id: string, updater: (preset: 词组转化器提示词预设结构) => 词组转化器提示词预设结构) => void;
    updatePresetFeature?: (updater: (feature: any) => any) => void;
    onSaveApiConfig?: (config: 接口设置结构) => Promise<void> | void;
}

export const RulesTab: React.FC<RulesTabProps> = ({
    activeRuleSection,
    modelRulePanelOpen,
    busyActionKey,
    presetFeature,
    editorModelTransformerPresets,
    npcTransformerPresets,
    sceneTransformerPresets,
    sceneJudgePresets,
    modelTransformerPresetEditorId,
    npcTransformerPresetEditorId,
    sceneTransformerPresetEditorId,
    sceneJudgePresetEditorId,
    当前生效NPC预设ID,
    当前生效场景预设ID,
    当前生效场景判定预设ID,
    editorSelectedModelTransformerPreset,
    editorSelectedNpcTransformerPreset,
    editorSelectedSceneTransformerPreset,
    editorSelectedSceneJudgePreset,
    activeModelTransformerPreset,
    setModelRulePanelOpen,
    setActiveRuleSection,
    setModelTransformerPresetEditorId,
    setNpcTransformerPresetEditorId,
    setSceneTransformerPresetEditorId,
    setSceneJudgePresetEditorId,
    handleSavePresetConfig,
    handleSelectDefaultNpcTransformerPreset,
    handleSelectDefaultSceneTransformerPreset,
    handleSelectDefaultSceneJudgePreset,
    handleAddModelTransformerPreset,
    handleDeleteModelTransformerPreset,
    handleExportModelTransformerPresets,
    handleImportModelTransformerPresets,
    handleToggleModelTransformerPreset,
    handleAddNpcTransformerPreset,
    handleDeleteNpcTransformerPreset,
    handleAddSceneTransformerPreset,
    handleDeleteSceneTransformerPreset,
    handleAddSceneJudgePreset,
    handleDeleteSceneJudgePreset,
    updateModelTransformerPreset,
    updateTransformerPreset,
    updatePresetFeature,
    onSaveApiConfig
}) => {
    const 规则切换按钮样式 = (active: boolean) => `rounded-full border px-4 py-2 text-xs tracking-[0.18em] uppercase transition-all ${
        active
            ? 'border-wuxia-gold/50 bg-wuxia-gold/15 text-wuxia-gold shadow-[0_0_12px_rgba(212,175,55,0.12)]'
            : 'border-wuxia-gold/15 bg-black/30 text-gray-400 hover:border-wuxia-gold/30 hover:text-wuxia-gold/80'
    }`;

    const 当前规则标题 = activeRuleSection === 'npc'
        ? 'NPC 转化规则'
        : activeRuleSection === 'scene'
            ? '场景转化规则'
            : '场景判定规则';

    return (
        <div className="flex flex-col h-full bg-[#0c0d0f]/90 border border-wuxia-gold/30 rounded shadow-[0_0_30px_rgba(212,175,55,0.05)] p-5 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_100%)] pointer-events-none"></div>
            <div className="relative z-10 flex items-center justify-between gap-4 pb-4 border-b border-wuxia-gold/10">
                <div>
                    <div className="text-wuxia-gold font-serif text-2xl tracking-widest text-shadow-glow">提示词规则中心</div>
                    <div className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Rule Center</div>
                </div>
                <button
                    type="button"
                    onClick={() => { void handleSavePresetConfig?.(); }}
                    disabled={!onSaveApiConfig || busyActionKey === 'save_preset_config'}
                    className={主按钮样式(!onSaveApiConfig || busyActionKey === 'save_preset_config')}
                >
                    保存配置
                </button>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-5 mt-5">
                <div className="rounded border border-wuxia-gold/20 bg-black/35">
                    <button
                        type="button"
                        onClick={() => setModelRulePanelOpen(!modelRulePanelOpen)}
                        className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left"
                    >
                        <div>
                            <div className="text-[11px] tracking-[0.24em] uppercase text-wuxia-gold/50">模型规则集</div>
                            <div className="text-xs text-gray-500 mt-1">选择当前启用的模型规则，并编辑基础模式与锚定模式规则。</div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="text-xs text-wuxia-gold/70">{editorSelectedModelTransformerPreset?.名称 || '未选择规则集'}</div>
                            <span className="text-wuxia-gold/70 text-sm">{modelRulePanelOpen ? '收起' : '展开'}</span>
                        </div>
                    </button>
                    {modelRulePanelOpen && (
                        <div className="px-4 pb-4 border-t border-wuxia-gold/10 space-y-4">
                            <div className="flex flex-wrap gap-2 pt-4">
                                <button type="button" onClick={handleAddModelTransformerPreset} className={次级按钮样式()}>新增规则集</button>
                                <button type="button" onClick={handleDeleteModelTransformerPreset} disabled={!editorSelectedModelTransformerPreset} className={次级按钮样式(true)}>删除当前</button>
                                <button type="button" onClick={handleExportModelTransformerPresets} className={次级按钮样式()}>导出</button>
                                <label className={次级按钮样式()}>
                                    导入
                                    <input type="file" accept="application/json" className="hidden" onChange={(e) => { void handleImportModelTransformerPresets?.(e); }} />
                                </label>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">当前编辑</label>
                                        <select value={modelTransformerPresetEditorId} onChange={(e) => setModelTransformerPresetEditorId(e.target.value)} className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-sm text-gray-300 outline-none focus:border-wuxia-gold/50 transition-all font-serif">
                                            <option value="">未选择规则集</option>
                                            {editorModelTransformerPresets.map((preset) => (
                                                <option key={preset.id} value={preset.id}>{preset.名称}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {editorSelectedModelTransformerPreset ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">规则集名称</label>
                                            <input type="text" value={editorSelectedModelTransformerPreset.名称} className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-sm text-wuxia-gold/90 outline-none focus:border-wuxia-gold/50 transition-all font-serif" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded border border-dashed border-wuxia-gold/20 bg-black/20 p-4 text-sm text-wuxia-gold/40 text-center font-serif">请先选择或新增模型规则集。</div>
                                )}
                        </div>
                    </div>
                )}
                </div>

                <div className="rounded border border-wuxia-gold/20 bg-black/35 p-4 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <div className="text-[11px] tracking-[0.24em] uppercase text-wuxia-gold/50">规则模板</div>
                            <div className="text-xs text-gray-500 mt-1">按模块切换编辑 NPC、场景和场景判定规则。</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => setActiveRuleSection('npc')} className={规则切换按钮样式(activeRuleSection === 'npc')}>NPC 转化规则</button>
                            <button type="button" onClick={() => setActiveRuleSection('scene')} className={规则切换按钮样式(activeRuleSection === 'scene')}>场景转化规则</button>
                            <button type="button" onClick={() => setActiveRuleSection('scene_judge')} className={规则切换按钮样式(activeRuleSection === 'scene_judge')}>场景判定规则</button>
                        </div>
                    </div>
                    <div className="rounded border border-wuxia-gold/10 bg-black/30 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-wuxia-gold/10">
                            <div>
                                <div className="text-sm font-serif text-wuxia-gold/85">{当前规则标题}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {activeRuleSection === 'npc' && '角色图使用基础规则；锚定开启后改用专属锚定规则。'}
                                    {activeRuleSection === 'scene' && '场景图使用空间与构图规则；角色锚定存在时改用场景锚定规则。'}
                                    {activeRuleSection === 'scene_judge' && '用于判断当前文本应生成风景场景还是场景快照。'}
                                </div>
                            </div>
                        </div>

                        {activeRuleSection === 'npc' && (
                            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-4">
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">当前生效</label>
                                        <select value={当前生效NPC预设ID} onChange={(e) => handleSelectDefaultNpcTransformerPreset?.(e.target.value)} className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-sm text-gray-300 outline-none focus:border-wuxia-gold/50 transition-all font-serif">
                                            <option value="">不启用</option>
                                            {npcTransformerPresets.map((preset) => (
                                                <option key={preset.id} value={preset.id}>{preset.名称}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">当前编辑</label>
                                        <select value={npcTransformerPresetEditorId} onChange={(e) => setNpcTransformerPresetEditorId(e.target.value)} className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-sm text-gray-300 outline-none focus:border-wuxia-gold/50 transition-all font-serif">
                                            <option value="">未选择规则</option>
                                            {npcTransformerPresets.map((preset) => (
                                                <option key={preset.id} value={preset.id}>{preset.名称}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {editorSelectedNpcTransformerPreset ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">规则名称</label>
                                            <input type="text" value={editorSelectedNpcTransformerPreset.名称} className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-sm text-wuxia-gold/90 outline-none focus:border-wuxia-gold/50 transition-all font-serif" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">基础转化规则</label>
                                            <textarea value={editorSelectedNpcTransformerPreset.提示词 || ''} rows={8} className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-xs text-gray-300 outline-none focus:border-wuxia-gold/50 transition-all custom-scrollbar resize-y font-mono leading-relaxed" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded border border-dashed border-wuxia-gold/20 bg-black/20 p-4 text-sm text-wuxia-gold/40 text-center">暂无 NPC 转化规则。</div>
                                )}
                        </div>
                        )}

                        {activeRuleSection === 'scene' && (
                            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-4">
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">当前生效</label>
                                        <select value={当前生效场景预设ID} onChange={(e) => handleSelectDefaultSceneTransformerPreset?.(e.target.value)} className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-sm text-gray-300 outline-none focus:border-wuxia-gold/50 transition-all font-serif">
                                            <option value="">不启用</option>
                                            {sceneTransformerPresets.map((preset) => (
                                                <option key={preset.id} value={preset.id}>{preset.名称}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">当前编辑</label>
                                        <select value={sceneTransformerPresetEditorId} onChange={(e) => setSceneTransformerPresetEditorId(e.target.value)} className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-sm text-gray-300 outline-none focus:border-wuxia-gold/50 transition-all font-serif">
                                            <option value="">未选择规则</option>
                                            {sceneTransformerPresets.map((preset) => (
                                                <option key={preset.id} value={preset.id}>{preset.名称}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {editorSelectedSceneTransformerPreset ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">规则名称</label>
                                            <input type="text" value={editorSelectedSceneTransformerPreset.名称} className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-sm text-wuxia-gold/90 outline-none focus:border-wuxia-gold/50 transition-all font-serif" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded border border-dashed border-wuxia-gold/20 bg-black/20 p-4 text-sm text-wuxia-gold/40 text-center">暂无场景转化规则。</div>
                                )}
                        </div>
                        )}

                        {activeRuleSection === 'scene_judge' && (
                            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-4">
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">当前生效</label>
                                        <select value={当前生效场景判定预设ID} onChange={(e) => handleSelectDefaultSceneJudgePreset?.(e.target.value)} className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-sm text-gray-300 outline-none focus:border-wuxia-gold/50 transition-all font-serif">
                                            <option value="">不启用</option>
                                            {sceneJudgePresets.map((preset) => (
                                                <option key={preset.id} value={preset.id}>{preset.名称}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">当前编辑</label>
                                        <select value={sceneJudgePresetEditorId} onChange={(e) => setSceneJudgePresetEditorId(e.target.value)} className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-sm text-gray-300 outline-none focus:border-wuxia-gold/50 transition-all font-serif">
                                            <option value="">未选择规则</option>
                                            {sceneJudgePresets.map((preset) => (
                                                <option key={preset.id} value={preset.id}>{preset.名称}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {editorSelectedSceneJudgePreset ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[11px] text-wuxia-gold/60 uppercase tracking-wider block">规则名称</label>
                                            <input type="text" value={editorSelectedSceneJudgePreset.名称} className="w-full rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-sm text-wuxia-gold/90 outline-none focus:border-wuxia-gold/50 transition-all font-serif" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded border border-dashed border-wuxia-gold/20 bg-black/20 p-4 text-sm text-wuxia-gold/40 text-center">暂无场景判定规则。</div>
                                )}
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RulesTab;