import React, { useEffect, useRef, useState } from 'react';
import { 时代主题方案, allEraNodes } from '../../../models/eraTheme';
import { 时代配置, 游戏设置结构 } from '../../../types';
import GameButton from '../../ui/GameButton';
import ToggleSwitch from '../../ui/ToggleSwitch';

interface Props {
    settings: 游戏设置结构;
    onSave: (settings: 游戏设置结构) => void;
    currentEra?: string;
    onEraChange?: (eraId: string) => void;
    availableEras?: 时代配置[];
    eraTheme?: 时代主题方案;
}

const GameSettings: React.FC<Props> = ({ settings, onSave, currentEra, onEraChange, availableEras, eraTheme }) => {
    const [form, setForm] = useState<游戏设置结构>(settings);
    const [showSuccess, setShowSuccess] = useState(false);
    const [openMenu, setOpenMenu] = useState<'perspective' | 'style' | 'ntl' | null>(null);
    const rootRef = useRef<HTMLDivElement | null>(null);

    const 叙事人称选项: Array<{ value: 游戏设置结构['叙事人称']; label: string }> = [
        { value: '第一人称', label: '第一人称 (我)' },
        { value: '第二人称', label: '第二人称 (你)' },
        { value: '第三人称', label: '第三人称 (他/姓名)' }
    ];
    const 剧情风格选项: Array<{ value: 游戏设置结构['剧情风格']; label: string }> = [
        { value: '后宫', label: '后宫' },
        { value: '修炼', label: '修炼' },
        { value: '一般', label: '一般' },
        { value: '修罗场', label: '修罗场' },
        { value: '纯爱', label: '纯爱' },
        { value: 'NTL后宫', label: 'NTL后宫' }
    ];
    const NTL后宫档位选项: Array<{ value: 游戏设置结构['NTL后宫档位']; label: string }> = [
        { value: '禁止乱伦', label: '禁止乱伦' },
        { value: '假乱伦', label: '假乱伦' },
        { value: '无限制', label: '无限制' }
    ];
    useEffect(() => {
        setForm(settings);
    }, [settings]);

    useEffect(() => {
        if (!openMenu) return;

        const handlePointerDown = (event: MouseEvent) => {
            const root = rootRef.current;
            if (!root) return;
            if (event.target instanceof Node && root.contains(event.target)) return;
            setOpenMenu(null);
        };
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpenMenu(null);
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [openMenu]);

    const handleSave = () => {
        onSave(form);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    const 实时应用更新 = (patch: Partial<游戏设置结构>) => {
        const next = { ...form, ...patch };
        setForm(next);
        onSave(next);
    };

    const 渲染内置下拉 = (params: {
        menuKey: 'perspective' | 'style' | 'ntl';
        value: string;
        options: Array<{ value: string; label: string }>;
        onChange: (value: string) => void;
    }) => {
        const selected = params.options.find(option => option.value === params.value);
        const isOpen = openMenu === params.menuKey;

        return (
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setOpenMenu(prev => (prev === params.menuKey ? null : params.menuKey))}
                    className={`w-full bg-black/40 border p-3 text-left rounded-md transition-all flex items-center justify-between ${
                        isOpen ? 'border-wuxia-gold text-white' : 'border-gray-600 text-white'
                    }`}
                >
                    <span>{selected?.label || '请选择'}</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-wuxia-gold' : ''}`}
                    >
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.512a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                </button>

                {isOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-black/95 border border-wuxia-gold/40 rounded-md shadow-[0_10px_30px_rgba(0,0,0,0.45)] overflow-hidden">
                        <div className="max-h-56 overflow-y-auto custom-scrollbar py-1">
                            {params.options.map(option => {
                                const active = option.value === params.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            params.onChange(option.value);
                                            setOpenMenu(null);
                                        }}
                                        className={`w-full px-3 py-2 text-left text-sm transition-colors flex items-center justify-between ${
                                            active
                                                ? 'bg-wuxia-gold/15 text-wuxia-gold'
                                                : 'text-gray-200 hover:bg-white/5'
                                        }`}
                                    >
                                        <span>{option.label}</span>
                                        {active && (
                                            <span className="text-xs text-wuxia-gold/80">当前</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div ref={rootRef} className="space-y-6 animate-fadeIn">
            {availableEras && availableEras.length > 0 && (
                <div className="space-y-3">
                    <div className="text-sm text-wuxia-cyan font-bold">时代背景</div>
                    <div className="text-xs text-gray-400">时代是界面风格的大前提，切换后将改变整体配色、字体与界面文案。</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {availableEras.map((era) => {
                            const isSelected = era.id === (currentEra || 'ancient_eastern_wuxia');
                            const scheme = eraTheme?.id === era.id ? eraTheme : undefined;
                            const colorPreview = scheme
                                ? [scheme.配色['ink-black'], scheme.配色['ink-gray'], scheme.配色['primary'], scheme.配色['secondary']].map(v => `rgb(${v})`)
                                : ['rgb(30 30 30)', 'rgb(60 60 60)', 'rgb(180 180 180)', 'rgb(120 120 120)'];
                            return (
                                <button
                                    key={era.id}
                                    type="button"
                                    onClick={() => onEraChange?.(era.id)}
                                    className={`rounded-xl border p-3 text-left transition-all ${
                                        isSelected
                                            ? 'border-wuxia-gold/60 bg-wuxia-gold/10 ring-1 ring-wuxia-gold/30'
                                            : 'border-gray-700/50 bg-black/30 hover:border-gray-500'
                                    }`}
                                >
                                    <div className="flex items-center gap-1.5 mb-2">
                                        {colorPreview.map((c: string, i: number) => (
                                            <span key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                                        ))}
                                    </div>
                                    <div className="text-sm text-white font-bold">{era.名称}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center border-b border-wuxia-gold/30 pb-3 mb-6">
                <h3 className="text-wuxia-gold font-serif font-bold text-xl">游戏设定</h3>
                {showSuccess && <span className="text-green-400 text-xs font-bold animate-pulse">✔ 设定已保存</span>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm text-wuxia-cyan font-bold">字数要求</label>
                    <input 
                        type="number"
                        min={50}
                        step={10}
                        value={form.字数要求}
                        onChange={(e) => {
                            const n = Number(e.target.value);
                            实时应用更新({ 字数要求: Number.isFinite(n) && n > 0 ? Math.max(50, Math.floor(n)) : 450 });
                        }}
                        className="w-full bg-black/50 border-2 border-transparent focus:border-wuxia-gold p-3 text-white outline-none rounded-md transition-all font-serif tracking-wider"
                        placeholder="例如 450"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-wuxia-cyan font-bold">叙事人称</label>
                    {渲染内置下拉({
                        menuKey: 'perspective',
                        value: form.叙事人称,
                        options: 叙事人称选项,
                        onChange: (value) => 实时应用更新({ 叙事人称: value as 游戏设置结构['叙事人称'] })
                    })}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm text-wuxia-cyan font-bold">剧情风格</label>
                    {渲染内置下拉({
                        menuKey: 'style',
                        value: form.剧情风格,
                        options: 剧情风格选项,
                        onChange: (value) => 实时应用更新({ 剧情风格: value as 游戏设置结构['剧情风格'] })
                    })}
                    <div className="text-xs text-gray-400">将作为 AI 助手消息注入在本轮上下文末尾，并位于 COT 伪装消息之前。</div>
                </div>
                {form.剧情风格 === 'NTL后宫' && (
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm text-wuxia-cyan font-bold">NTL后宫档位</label>
                        {渲染内置下拉({
                            menuKey: 'ntl',
                            value: form.NTL后宫档位,
                            options: NTL后宫档位选项,
                            onChange: (value) => 实时应用更新({ NTL后宫档位: value as 游戏设置结构['NTL后宫档位'] })
                        })}
                        <div className="text-xs text-gray-400">用于控制“禁忌关系”强度，仅在 NTL 后宫风格下生效。</div>
                    </div>
                )}
            </div>

            <div className="space-y-3 rounded-md border border-wuxia-gold/20 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-sm text-wuxia-cyan font-bold">行动选项功能</div>
                        <div className="text-xs text-gray-400 mt-1">开启后，将在上下文注入“行动选项规范”，并要求输出 \`&lt;行动选项&gt;\` 标签。</div>
                    </div>
                    <ToggleSwitch
                        checked={form.启用行动选项 !== false}
                        onChange={(next) => 实时应用更新({ 启用行动选项: next })}
                        ariaLabel="切换行动选项功能"
                    />
                </div>
            </div>

            <div className="space-y-3 rounded-md border border-wuxia-gold/20 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-sm text-wuxia-cyan font-bold">行动选项增强</div>
                        <div className="text-xs text-gray-400 mt-1">开启后，每回合按多种推进速度（缓慢/正常/快速/跳关键节点）分组生成行动选项，用户可自由选择节奏推进。</div>
                    </div>
                    <ToggleSwitch
                        checked={form.启用行动选项增强 === true}
                        onChange={(next) => 实时应用更新({ 启用行动选项增强: next })}
                        ariaLabel="切换行动选项增强"
                    />
                </div>
            </div>

            <div className="space-y-3 rounded-md border border-wuxia-gold/20 bg-black/30 p-4">
                <div className="space-y-2">
                    <div className="text-sm text-wuxia-cyan font-bold">行动选项输入模式</div>
                    <div className="text-xs text-gray-400">点击行动选项时，是将文本追加到输入框，还是替换整个输入框内容。</div>
                    <div className="flex gap-2 mt-2">
                        {(['追加', '替换'] as const).map((mode) => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => 实时应用更新({ 行动选项输入模式: mode })}
                                className={`px-4 py-2 text-sm rounded-md border transition-all ${
                                    form.行动选项输入模式 === mode
                                        ? 'border-wuxia-gold bg-wuxia-gold/15 text-wuxia-gold font-bold'
                                        : 'border-gray-600 text-gray-300 hover:border-wuxia-gold/40 hover:text-white'
                                }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-3 rounded-md border border-wuxia-gold/20 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-sm text-wuxia-cyan font-bold">防止说话（NoControl）</div>
                        <div className="text-xs text-gray-400 mt-1">开启后追加“防止说话/角色边界”提示词，禁止代写玩家言行。</div>
                    </div>
                    <ToggleSwitch
                        checked={form.启用防止说话 !== false}
                        onChange={(next) => 实时应用更新({ 启用防止说话: next })}
                        ariaLabel="切换防止说话"
                    />
                </div>
            </div>

            <div className="space-y-3 rounded-md border border-wuxia-gold/20 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-sm text-wuxia-cyan font-bold">COT伪装历史消息注入</div>
                        <div className="text-xs text-gray-400 mt-1">开启后，会在 \`user:开始任务\` 之后注入一条伪装历史消息，用于强化思考段输出习惯。</div>
                    </div>
                    <ToggleSwitch
                        checked={form.启用COT伪装注入 !== false}
                        onChange={(next) => 实时应用更新({ 启用COT伪装注入: next })}
                        ariaLabel="切换COT伪装历史消息注入"
                    />
                </div>
            </div>

            <div className="space-y-3 rounded-md border border-wuxia-gold/20 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-sm text-wuxia-cyan font-bold">GPT模式</div>
                        <div className="text-xs text-gray-400 mt-1">这里控制主剧情链路。开启后，\`user:开始任务\` 会改为本回合真实用户输入，并移除 AI 角色里的“本回合玩家输入”注入；其他独立 API 可在“独立 API GPT 模式”页单独配置。</div>
                    </div>
                    <ToggleSwitch
                        checked={form.启用GPT模式 === true}
                        onChange={(next) => 实时应用更新({ 启用GPT模式: next })}
                        ariaLabel="切换GPT模式"
                    />
                </div>
            </div>

            <div className="space-y-3 rounded-md border border-wuxia-gold/20 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-sm text-wuxia-cyan font-bold">免责声明输出要求</div>
                        <div className="text-xs text-gray-400 mt-1">开启后，AI 会在本回合最后追加独立免责声明段落；不会插入到正文中间。</div>
                    </div>
                    <ToggleSwitch
                        checked={form.启用免责声明输出 === true}
                        onChange={(next) => 实时应用更新({ 启用免责声明输出: next })}
                        ariaLabel="切换免责声明输出要求"
                    />
                </div>
            </div>

            <div className="space-y-3 rounded-md border border-wuxia-gold/20 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-sm text-wuxia-cyan font-bold">标签检测完整性</div>
                        <div className="text-xs text-gray-400 mt-1">开启后，系统会校验 `&lt;正文&gt;`/`&lt;短期记忆&gt;`/`&lt;命令&gt;` 三个标签是否完整，不完整会直接报错并阻止写入。</div>
                    </div>
                    <ToggleSwitch
                        checked={form.启用标签检测完整性 === true}
                        onChange={(next) => 实时应用更新({ 启用标签检测完整性: next })}
                        ariaLabel="切换标签检测完整性"
                    />
                </div>
            </div>

            <div className="space-y-3 rounded-md border border-wuxia-gold/20 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-sm text-wuxia-cyan font-bold">标签自动修复</div>
                        <div className="text-xs text-gray-400 mt-1">开启后，系统会在解析前自动修复常见标签错误（如重复开标签、缺失闭标签）。</div>
                    </div>
                    <ToggleSwitch
                        checked={form.启用标签修复 !== false}
                        onChange={(next) => 实时应用更新({ 启用标签修复: next })}
                        ariaLabel="切换标签自动修复"
                    />
                </div>
            </div>

            <div className="space-y-3 rounded-md border border-wuxia-gold/20 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-sm text-wuxia-cyan font-bold">生成失败自动重试</div>
                        <div className="text-xs text-gray-400 mt-1">开启后，生成或解析报错时会直接自动重试，最多 3 次；中间不会立即进入错误修改区域或重试确认弹窗。</div>
                    </div>
                    <ToggleSwitch
                        checked={form.启用自动重试 === true}
                        onChange={(next) => 实时应用更新({ 启用自动重试: next })}
                        ariaLabel="切换生成失败自动重试"
                    />
                </div>
            </div>

            <div className="space-y-3 rounded-md border border-wuxia-gold/20 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-sm text-wuxia-cyan font-bold">女主剧情规划</div>
                        <div className="text-xs text-gray-400 mt-1">开启后保留女主规划状态，并启用每回合独立规划分析链路；主剧情只读取状态，不再直接维护女主规划提示词。</div>
                    </div>
                    <ToggleSwitch
                        checked={form.启用女主剧情规划 === true}
                        onChange={(next) => 实时应用更新({ 启用女主剧情规划: next })}
                        ariaLabel="切换女主剧情规划"
                    />
                </div>
            </div>

            <div className="space-y-3 rounded-md border border-wuxia-gold/20 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-sm text-wuxia-cyan font-bold">NSFW模式</div>
                        <div className="text-xs text-gray-400 mt-1">开启后才会注入独立 NSFW 提示词，并在江湖谱中显示女主私密档案 UI；关闭时提示词与 UI 都不生效。</div>
                    </div>
                    <ToggleSwitch
                        checked={form.启用NSFW模式 === true}
                        onChange={(next) => 实时应用更新({ 启用NSFW模式: next })}
                        ariaLabel="切换NSFW模式"
                    />
                </div>
                {form.启用NSFW模式 === true && (
                    <div className="flex items-center justify-between gap-4 pt-2 border-t border-wuxia-gold/10">
                        <div>
                            <div className="text-sm text-wuxia-cyan font-bold">NSFW推进选项</div>
                            <div className="text-xs text-gray-400 mt-1">开启后，根据当前场景和故事节奏，在暧昧场景中自动生成促进亲密关系的行动选项。非暧昧场景不受影响。</div>
                        </div>
                        <ToggleSwitch
                            checked={form.启用NSFW推进选项 === true}
                            onChange={(next) => 实时应用更新({ 启用NSFW推进选项: next })}
                            ariaLabel="切换NSFW推进选项"
                        />
                    </div>
                )}
            </div>

            <div className="space-y-3 rounded-md border border-wuxia-gold/20 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-sm text-wuxia-cyan font-bold">饱腹与水分系统</div>
                        <div className="text-xs text-gray-400 mt-1">关闭后，将停止注入饱腹/口渴相关提示词，并隐藏前端对应状态条；旧存档字段会保留但不再重点管理。</div>
                    </div>
                    <ToggleSwitch
                        checked={form.启用饱腹口渴系统 !== false}
                        onChange={(next) => 实时应用更新({ 启用饱腹口渴系统: next })}
                        ariaLabel="切换饱腹与水分系统"
                    />
                </div>
            </div>

            <div className="space-y-3 rounded-md border border-wuxia-gold/20 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-sm text-wuxia-cyan font-bold">修炼体系相关内容</div>
                        <div className="text-xs text-gray-400 mt-1">关闭后，将停止注入境界/功法/内力/修炼相关提示词与上下文，并关闭前端功法模块；旧存档字段保留但不再重点管理。</div>
                    </div>
                    <ToggleSwitch
                        checked={form.启用修炼体系 !== false}
                        onChange={(next) => 实时应用更新({ 启用修炼体系: next })}
                        ariaLabel="切换修炼体系相关内容"
                    />
                </div>
            </div>

            <div className="space-y-3 rounded-md border border-gray-700/40 bg-black/30 p-4">
                <div className="text-[11px] uppercase tracking-[0.35em] text-wuxia-gold/60 font-mono mb-2">古代体系</div>
                <div className="flex gap-3">
                    {(['武侠', '志怪', '双修'] as const).map((体系) => {
                        const 当前选择 = form.古代体系选择 || '武侠';
                        const isActive = 当前选择 === 体系;
                        return (
                            <button
                                key={体系}
                                type="button"
                                onClick={() => 实时应用更新({ 古代体系选择: 体系 })}
                                className={`flex-1 rounded-lg border px-3 py-2 text-center text-sm transition-all ${
                                    isActive
                                        ? 体系 === '志怪'
                                            ? 'border-green-500/50 bg-green-500/10 text-green-400'
                                            : 体系 === '双修'
                                                ? 'border-purple-500/50 bg-purple-500/10 text-purple-400'
                                                : 'border-wuxia-gold/50 bg-wuxia-gold/10 text-wuxia-gold'
                                        : 'border-gray-800 bg-black/25 text-gray-500 hover:border-gray-600'
                                }`}
                            >
                                {体系 === '武侠' ? '⚔ 武侠' : 体系 === '志怪' ? '🌿 志怪' : '⚔+🌿 双修'}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-3 rounded-md border border-yellow-500/20 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-sm text-yellow-400 font-bold">{(() => { const era = allEraNodes.find(n => n.id === currentEra); return era?.liMode?.name || '子纪元里模式'; })()}</div>
                        <div className="text-xs text-gray-400 mt-1">当前子纪元的暗面模式开关。开启后，设备可切换至时代暗面模式，应用名称、UI 主题色与 AI 提示词将随所选子纪元自动变化。</div>
                    </div>
                    <div className="relative">
                        <ToggleSwitch
                            checked={form.启用子纪元里模式?.[currentEra ?? ''] ?? true}
                            onChange={(next) => {
                                const prev = form.启用子纪元里模式 || {};
                                实时应用更新({ 启用子纪元里模式: { ...prev, [currentEra ?? '']: next } });
                            }}
                            ariaLabel="切换子纪元里模式"
                        />
                        {(form.启用子纪元里模式?.[currentEra ?? ''] ?? true) && (
                            <span className="absolute -inset-2 rounded-lg bg-yellow-500/15 animate-pulse pointer-events-none" />
                        )}
                    </div>
                </div>
                {(form.启用子纪元里模式?.[currentEra ?? ''] ?? true) && (() => {
                    const era = allEraNodes.find(n => n.id === currentEra);
                    const hasLiMode = !!era?.liMode;
                    if (!hasLiMode) return null;
                    const intensityKey = currentEra ?? '';
                    const currentIntensity = form.子纪元里模式强度?.[intensityKey] ?? '露骨';
                    const 强度选项: Array<{ value: '微暗' | '暧昧' | '露骨'; label: string; desc: string }> = [
                        { value: '微暗', label: '微暗', desc: '暗示为主，含蓄内敛' },
                        { value: '暧昧', label: '暧昧', desc: '氛围浓郁，张力十足' },
                        { value: '露骨', label: '露骨', desc: '直白描写，毫无保留' }
                    ];
                    return (
                        <div className="pt-3 border-t border-yellow-500/10">
                            <div className="text-xs text-gray-400 mb-2">里模式强度 — 控制暗面规则的暴露程度</div>
                            <div className="flex gap-2">
                                {强度选项.map(({ value, label, desc }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => {
                                            const prev = form.子纪元里模式强度 || {};
                                            实时应用更新({ 子纪元里模式强度: { ...prev, [intensityKey]: value } });
                                        }}
                                        className={`flex-1 rounded-lg border px-3 py-2 text-center text-sm transition-all ${
                                            currentIntensity === value
                                                ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400 font-bold'
                                                : 'border-gray-800 bg-black/25 text-gray-500 hover:border-gray-600'
                                        }`}
                                        title={desc}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* 阶段选择器 */}
                            <div className="text-xs text-gray-400 mb-2 mt-3">里模式阶段 — 控制 NPC 对亲密行为的心理态度</div>
                            <div className="flex gap-2">
                                {(['平然', '羞耻', '欲望'] as const).map((stage) => {
                                    const currentStage = form.子纪元里模式阶段?.[intensityKey] ?? '羞耻';
                                    const isActive = currentStage === stage;
                                    const colors = {
                                        '平然': isActive ? 'border-green-500/50 bg-green-500/10 text-green-400 font-bold' : 'border-gray-800 bg-black/25 text-gray-500 hover:border-gray-600',
                                        '羞耻': isActive ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400 font-bold' : 'border-gray-800 bg-black/25 text-gray-500 hover:border-gray-600',
                                        '欲望': isActive ? 'border-purple-500/50 bg-purple-500/10 text-purple-400 font-bold' : 'border-gray-800 bg-black/25 text-gray-500 hover:border-gray-600',
                                    };
                                    const descs = {
                                        '平然': '视作日常，自然接受',
                                        '羞耻': '害羞但不抗拒',
                                        '欲望': '主动引导，渴望亲密',
                                    };
                                    return (
                                        <button
                                            key={stage}
                                            type="button"
                                            onClick={() => {
                                                const prev = form.子纪元里模式阶段 || {};
                                                实时应用更新({ 子纪元里模式阶段: { ...prev, [intensityKey]: stage } });
                                            }}
                                            className={`flex-1 rounded-lg border px-3 py-2 text-center text-sm transition-all ${colors[stage]}`}
                                            title={descs[stage]}
                                        >
                                            {stage}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })()}
            </div>

            <div className="space-y-3 rounded-md border border-wuxia-gold/20 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-sm text-wuxia-red font-bold">成人内容</div>
                        <div className="text-xs text-gray-400 mt-1">开启后可显示重口味气运内容。关闭时仅显示一般向内容。</div>
                    </div>
                    <ToggleSwitch
                        checked={form.成人内容 === true}
                        onChange={(next) => 实时应用更新({ 成人内容: next })}
                        ariaLabel="切换成人内容"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm text-wuxia-cyan font-bold">额外要求提示词 (Custom Prompt)</label>
                <textarea 
                    value={form.额外提示词}
                    onChange={(e) => {
                        const nextValue = e.target.value;
                        setForm(prev => ({ ...prev, 额外提示词: nextValue }));
                    }}
                    onBlur={(e) => {
                        const next = { ...form, 额外提示词: e.currentTarget.value };
                        setForm(next);
                        onSave(next);
                    }}
                    className="w-full h-32 bg-black/50 border-2 border-transparent focus:border-wuxia-gold p-3 text-white outline-none rounded-md transition-all resize-none custom-scrollbar"
                    placeholder="在此输入需要追加到 Prompt 最后的特殊指令，例如：'严禁使用现代词汇'..."
                />
            </div>

            <div className="pt-6 border-t border-wuxia-gold/20 mt-8 flex justify-end">
                <GameButton onClick={handleSave} variant="primary" className="w-full md:w-auto px-8">
                    保存设定
                </GameButton>
            </div>
        </div>
    );
};

export default GameSettings;
