import React, { useEffect, useMemo } from 'react';
import GameButton from '../../ui/GameButton';
import { OrnateBorder } from '../../ui/decorations/OrnateBorder';
import { SectionCollapse } from '../../ui/SectionCollapse';
import InlineSelect from '../../ui/InlineSelect';
import {
    关系侧重选项,
    同人来源类型选项,
    同人融合强度选项,
    开局切入偏好选项,
    属性最大值,
    属性最小值,
    获取难度总属性点,
    格式化角色替换规则摘要
} from '../../../utils/openingConfig';
import { 预设天赋, 预设背景 } from '../../../data/presets';
import { type UseNewGameWizardStateReturn } from './useNewGameWizardState';
import { SearchInput, ChipGroup } from '../../ui/FilterBar';
import { 全部时代配置 } from '../../../models/system';
import { allEraNodes } from '../../../models/eraTheme';

const 时代背景颜色: Record<string, { bg: string; text: string; label: string }> = {
    '古代': { bg: 'bg-amber-900/40', text: 'text-amber-400', label: '古代专属' },
    '近代': { bg: 'bg-blue-900/40', text: 'text-blue-400', label: '近代专属' },
    '现代': { bg: 'bg-green-900/40', text: 'text-green-400', label: '现代专属' },
    '近未来': { bg: 'bg-purple-900/40', text: 'text-purple-400', label: '近未来专属' },
    '未来': { bg: 'bg-cyan-900/40', text: 'text-cyan-400', label: '未来专属' },
};

function 时代标签({ 时代适配 }: { 时代适配?: string[] }) {
    if (!时代适配 || 时代适配.length === 0) return null;
    return (
        <div className="flex flex-wrap gap-1 mt-2">
            {时代适配.map((era) => {
                const style = 时代背景颜色[era];
                if (!style) return null;
                return (
                    <span key={era} className={`text-[10px] px-1.5 py-0.5 rounded ${style.bg} ${style.text}`}>
                        {style.label}
                    </span>
                );
            })}
        </div>
    );
}

type DropdownProps = {
    value: number;
    options: number[];
    suffix: string;
    open: boolean;
    onToggle: () => void;
    onSelect: (next: number) => void;
    containerRef: React.RefObject<HTMLDivElement>;
};

const CompactDropdown: React.FC<DropdownProps> = ({
    value, options, suffix, open, onToggle, onSelect, containerRef,
}) => (
    <div className="relative" ref={containerRef}>
        <button
            type="button"
            onClick={onToggle}
            className="w-full bg-black/40 border border-gray-600 p-3 text-white outline-none focus:border-wuxia-gold rounded-md flex items-center justify-between gap-2"
        >
            <span className="font-mono text-sm">{value}{suffix}</span>
            <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
            </svg>
        </button>
        {open && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-black/95 border border-gray-700 rounded-md shadow-[0_12px_30px_rgba(0,0,0,0.6)] z-50">
                <div className="max-h-[336px] overflow-y-auto custom-scrollbar py-1">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => onSelect(opt)}
                            className={`w-full px-3 h-7 flex items-center text-sm font-mono transition-colors ${
                                opt === value ? 'bg-wuxia-gold/20 text-wuxia-gold' : 'text-gray-300 hover:bg-white/5'
                            }`}
                        >
                            {opt}{suffix}
                        </button>
                    ))}
                </div>
            </div>
        )}
    </div>
);

const 开关按钮: React.FC<{
    checked: boolean;
    label: string;
    onToggle: () => void;
}> = ({ checked, label, onToggle }) => (
    <button
        type="button"
        onClick={onToggle}
        className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm transition-all ${
            checked
                ? 'border-wuxia-gold bg-wuxia-gold/10 text-wuxia-gold'
                : 'border-gray-700 bg-black/30 text-gray-300 hover:border-wuxia-gold/35'
        }`}
    >
        <span
            className={`h-2.5 w-2.5 rounded-full transition-all ${
                checked ? 'bg-wuxia-gold shadow-[0_0_10px_rgba(212,175,55,0.65)]' : 'bg-gray-600'
            }`}
        />
        <span>{label}</span>
    </button>
);

const 难度下拉选项 = [
    { value: 'relaxed' as const, label: '轻松 (剧情模式)' },
    { value: 'easy' as const, label: '简单 (初入江湖)' },
    { value: 'normal' as const, label: '正常 (标准体验)' },
    { value: 'hard' as const, label: '困难 (刀光剑影)' },
    { value: 'extreme' as const, label: '极限 (修罗炼狱)' }
];
const 时代选项 = 全部时代配置.map(cfg => ({
    value: cfg.id,
    label: cfg.名称,
    hint: `${cfg.时代} — ${cfg.科技水平描述}`
}));
const 世界版图下拉选项 = [
    { value: '弹丸之地' as const, label: '弹丸之地 (一岛或一城)' },
    { value: '九州宏大' as const, label: '九州宏大 (万里河山)' },
    { value: '无尽位面' as const, label: '无尽位面 (多重世界)' }
];
const 宗门密度下拉选项 = [
    { value: '稀少' as const, label: '稀少 (隐世不出)' },
    { value: '适中' as const, label: '适中 (数大宗门)' },
    { value: '林立' as const, label: '林立 (百家争鸣)' }
];
const 武力等级下拉选项 = [
    { value: '低武' as const, label: '低武 (凡尘江湖)', hint: '拳脚刀剑，人体极限，无真气外放' },
    { value: '中武' as const, label: '中武 (门派林立)', hint: '内功深厚，轻功飞纵，暗器及远' },
    { value: '高武' as const, label: '高武 (宗师时代)', hint: '化境高手，真气外放，秘籍稀缺' },
    { value: '修仙' as const, label: '修仙 (仙凡两界)', hint: '灵气真元，御器飞行，秘境仙缘' }
];
const nsfw场景类型选项 = [
    { value: '无' as const, label: '无 (纯净)', hint: '完全不会出现性相关描写' },
    { value: '点到为止' as const, label: '点到为止', hint: '含蓄描写，不出现敏感词' },
    { value: '适度展开' as const, label: '适度展开', hint: '有限展开，使用委婉词汇' },
    { value: '完全展开' as const, label: '完全展开', hint: '可使用敏感词' }
];
const 能力类型选项 = [
    { value: '传统武侠' as const, label: '传统武侠', hint: '纯内力体系，无超自然能力' },
    { value: '修仙体系' as const, label: '修仙体系', hint: '灵气为基，修仙功法' },
    { value: '超能力线' as const, label: '超能力线', hint: '特异功能，现代/科幻风格' },
    { value: '混合世界' as const, label: '混合世界', hint: '武侠+修仙+超能力并存' }
];
const 超能力分类选项 = [
    { value: '心灵感应' as const, label: '心灵感应', hint: '读心、传心、思维读取' },
    { value: '念力' as const, label: '念力', hint: '隔空移物、念力控物' },
    { value: '预知' as const, label: '预知', hint: '预见未来、占卜、预言' },
    { value: '治愈' as const, label: '治愈', hint: '自愈、治愈他人、生命力操控' },
    { value: '元素操控' as const, label: '元素操控', hint: '火水风土雷等元素' },
    { value: '时空' as const, label: '时空', hint: '瞬移、时间减缓、空间扭曲' },
    { value: '变身' as const, label: '变身', hint: '形态变化、拟态、兽化' },
    { value: '灵能' as const, label: '灵能', hint: '灵魂出窍、灵体攻击' },
    { value: '高科技' as const, label: '高科技', hint: '机械改造、基因药剂' },
    { value: '综合' as const, label: '综合', hint: '多重能力混合' },
    { value: '未觉醒' as const, label: '未觉醒', hint: '潜力存在但未激发' }
];
const 觉醒程度选项 = [
    { value: '未觉醒' as const, label: '未觉醒', hint: '潜能未激发' },
    { value: '初觉' as const, label: '初觉', hint: '微弱、不稳定' },
    { value: '小成' as const, label: '小成', hint: '可主动使用' },
    { value: '大成' as const, label: '大成', hint: '威力可观' },
    { value: '巅峰' as const, label: '巅峰', hint: '化境，越级挑战' }
];

interface NewGameWizardContentProps {
    wizard: UseNewGameWizardStateReturn;
    openEraSelector: () => void;
}

export const NewGameWizardContent: React.FC<NewGameWizardContentProps> = ({ wizard, openEraSelector }) => {
    const {
        step,
        worldConfig, setWorldConfig,
        charName, setCharName, charGender, setCharGender, charAge, setCharAge,
        charAppearance, setCharAppearance, charPersonality, setCharPersonality,
        birthMonth, setBirthMonth, birthDay, setBirthDay, monthOpen, setMonthOpen, dayOpen, setDayOpen, monthRef, dayRef,
        stats, remainingPoints, totalStatBudget,
        selectedBackground, setSelectedBackground,
        selectedTalents,
        selectedQiyun,
        openingConfig, setOpeningConfig, openingConfigEnabled, setOpeningConfigEnabled,
        openingExtraRequirement, setOpeningExtraRequirement,
        自定义天赋列表, 自定义背景列表,
        小说拆分数据集列表,
        customTalent, setCustomTalent, showCustomTalent, 正在编辑天赋名,
        customBackground, setCustomBackground, showCustomBackground, 正在编辑背景名,
        showCustomPresetEditor, customPresetMeta, setCustomPresetMeta,
        正在编辑开局预设ID,
        过滤后背景选项, 过滤后天赋选项, 过滤后气运选项,
        背景搜索词, set背景搜索词,
        天赋搜索词, set天赋搜索词,
        气运搜索词, set气运搜索词,
        气运类别过滤, 选择气运类别,
        气运稀有度过滤, 选择气运稀有度,
        背景分类过滤, set背景分类过滤,
        天赋分类过滤, set天赋分类过滤,
        自动填充开启, set自动填充开启, 自动填充天赋气运,
        背景分类列表, 天赋分类列表,
        当前性别模式,
        背景长期说明, 天赋说明,
        当前附加小说数据集, 当前角色替换规则列表,
        选择性别, handleStatChange, toggleRelationFocus,
        选择附加小说数据集, 新增附加角色替换规则, 更新附加角色替换规则, 删除附加角色替换规则,
        toggleTalent, toggleQiyun, generateRandomQiyun,
        addCustomTalent, addCustomBackground,
        编辑自定义天赋, 删除自定义天赋,
        编辑自定义背景, 删除自定义背景,
        保存当前为自定义开局方案, 重置自定义开局预设编辑,
        自定义开局预设列表, 应用预设到表单,
        当前子纪元默认预设, 当前子纪元默认预设列表, 应用子纪元默认预设,
        编辑自定义开局方案信息, 用当前配置覆盖开局方案, 删除自定义开局方案,
        重置自定义天赋编辑, 重置自定义背景编辑,
        handleGenerate, loading,
        导入手动提示词文件, 导出手动世界观提示词, 导出手动境界提示词, 导出境界提示词模板,
        manualWorldPromptInputRef, manualRealmPromptInputRef,
        setShowCustomBackground, setShowCustomTalent, setShowCustomPresetEditor,
        子纪元里模式开启, 设置子纪元里模式开启,
        子纪元里模式强度, 设置子纪元里模式强度,
        古代体系选择, 设置古代体系选择,
    } = wizard;

    // 选择背景时自动填充天赋气运（仅填充空位）
    useEffect(() => {
        if (selectedBackground.名称) {
            自动填充天赋气运(selectedBackground);
        }
    }, [selectedBackground.名称]);

    const 处理能力类型变更 = (新能力类型: typeof worldConfig.能力类型) => {
        let 新武力等级 = worldConfig.武力等级;
        if (新能力类型 === '修仙体系') {
            新武力等级 = '修仙';
        } else if (新能力类型 === '超能力线') {
            if (新武力等级 === '修仙') 新武力等级 = '高武';
        } else if (新能力类型 === '传统武侠') {
            if (新武力等级 === '修仙') 新武力等级 = '中武';
        }
        setWorldConfig({ ...worldConfig, 能力类型: 新能力类型, 武力等级: 新武力等级 });
    };

    const 当前时代 = 全部时代配置.find(c => c.id === (worldConfig.时代配置ID || 'era_ancient_wuxia'));
    const 组织密度标签 = 当前时代?.组织密度标签 || '宗门密度';
    const 支持体系 = 当前时代?.支持体系;
    const 是否展示体系选择 = Array.isArray(支持体系) && 支持体系.length > 0;

    // 检查当前子纪元是否有里模式定义
    const 有里模式数据 = useMemo(() => {
        const eraId = worldConfig.时代配置ID || '';
        if (!eraId) return false;
        const node = allEraNodes.find(n => n.id === eraId);
        return !!node?.liMode;
    }, [worldConfig.时代配置ID]);

    // 根据体系选择过滤预设卡片
    const 时代预设卡片 = (() => {
        const 原始 = 当前时代?.世界观预设卡片;
        if (!原始 || 原始.length === 0) return [
            { name: '传统武侠', overrides: { 能力类型: '传统武侠' as const, 武力等级: '中武' as const } },
            { name: '修仙世界', overrides: { 能力类型: '修仙体系' as const, 武力等级: '修仙' as const } },
            { name: '高武世界', overrides: { 能力类型: '传统武侠' as const, 武力等级: '高武' as const } },
            { name: '低武江湖', overrides: { 能力类型: '传统武侠' as const, 武力等级: '低武' as const } },
        ];
        if (古代体系选择 === '武侠') return 原始.filter((_, idx) => idx < 4);
        if (古代体系选择 === '志怪') return 原始.filter((_, idx) => idx >= 4);
        return 原始; // 双修: 全部展示
    })();

    const 时代过滤能力类型选项 = (() => {
        const 可用 = 当前时代?.可用能力类型;
        if (!可用) return 能力类型选项;
        return 能力类型选项.filter(o => 可用.includes(o.value));
    })();

    const 过滤后武力等级选项 = (() => {
        if (worldConfig.能力类型 === '修仙体系') {
            return 武力等级下拉选项.filter(o => o.value === '修仙');
        }
        return 武力等级下拉选项.filter(o => o.value !== '修仙');
    })();

    const usedPoints = (Object.values(stats) as number[]).reduce((a, b) => a + b, 0);

    return (
        <>
            {/* STEP 0: WORLD SETTINGS */}
            {step === 0 && (
                <div className="space-y-8 animate-slide-in max-w-5xl mx-auto">
                    <OrnateBorder className="p-6 md:p-7">
                        <div className="border-b border-wuxia-gold/30 pb-4 mb-5">
                            <div className="text-[11px] uppercase tracking-[0.35em] text-wuxia-cyan/70 font-mono">World Core</div>
                            <h3 className="text-2xl font-serif font-bold text-wuxia-gold mt-2">世界观核心</h3>
                            <p className="text-xs text-gray-400 mt-2 leading-6">这里将决定世界的基本规则、势力格局、武道水平和剧情风格。</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm text-wuxia-cyan font-bold">世界名称</label>
                                <input
                                    value={worldConfig.worldName}
                                    onChange={(e) => setWorldConfig({ ...worldConfig, worldName: e.target.value })}
                                    placeholder="例如：九州大陆、太古界、灵域"
                                    className="w-full bg-black/50 border-2 border-transparent focus:border-wuxia-gold p-3 text-white outline-none rounded-md transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-wuxia-cyan font-bold">时代背景</label>
                                <div className="flex gap-2">
                                    <div className="flex-1 px-3 py-2 bg-black/30 border border-gray-700/50 rounded-md text-gray-300 text-sm">
                                        {(() => {
                                            const eraId = worldConfig.时代配置ID || 'era_ancient_wuxia';
                                            const opt = 时代选项.find(item => item.value === eraId);
                                            if (opt) return opt.label;
                                            const node = allEraNodes.find(n => n.id === eraId);
                                            return node?.name || '古代武侠';
                                        })()}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => openEraSelector()}
                                        className="px-4 py-2 bg-wuxia-gold/10 border border-wuxia-gold/30 text-wuxia-gold text-sm rounded-md hover:bg-wuxia-gold/20 transition-colors"
                                    >
                                        详细选择
                                    </button>
                                </div>
                                <div className="text-[11px] text-gray-500 leading-6">
                                    {时代选项.find((item) => item.value === (worldConfig.时代配置ID || 'era_ancient_wuxia'))?.hint}
                                </div>
                                <div className="text-[11px] text-wuxia-cyan/60">点击"详细选择"可浏览全部{时代选项.length}个时代</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div className="space-y-2">
                                <label className="text-sm text-wuxia-cyan font-bold">游戏难度</label>
                                <InlineSelect
                                    value={worldConfig.difficulty}
                                    options={难度下拉选项}
                                    onChange={(difficulty) => setWorldConfig({ ...worldConfig, difficulty })}
                                />
                                <div className="text-[11px] text-gray-500">
                                    总属性点预算：{获取难度总属性点(worldConfig.difficulty)}。
                                </div>
                            </div>
                        </div>

                        {/* 体系选择 + 里模式开关 — 仅古代时代展示 */}
                        {是否展示体系选择 && (
                            <div className="mt-6 space-y-4">
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.35em] text-wuxia-gold/70 font-mono mb-3">体系选择</div>
                                    <div className="flex gap-3">
                                        {支持体系!.map((体系) => (
                                            <button
                                                key={体系}
                                                type="button"
                                                onClick={() => 设置古代体系选择(体系)}
                                                className={`flex-1 rounded-xl border px-4 py-3 text-center transition-all ${
                                                    古代体系选择 === 体系
                                                        ? 体系 === '志怪'
                                                            ? 'border-green-500/50 bg-green-500/10 text-green-400'
                                                            : 体系 === '双修'
                                                                ? 'border-purple-500/50 bg-purple-500/10 text-purple-400'
                                                                : 'border-wuxia-gold/50 bg-wuxia-gold/10 text-wuxia-gold'
                                                        : 'border-gray-800 bg-black/25 text-gray-400 hover:border-gray-600'
                                                }`}
                                            >
                                                <div className="font-bold text-sm">
                                                    {体系 === '武侠' ? '⚔ 武侠' : 体系 === '志怪' ? '🌿 志怪' : '⚔+🌿 双修'}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 子纪元里模式开关 + 强度选择器 */}
                        <div className="mt-6">
                            <div className="relative flex items-center justify-between gap-4 rounded-md border border-yellow-500/20 bg-black/30 px-4 py-3">
                                <div>
                                    <div className="text-sm text-yellow-400 font-bold">子纪元里模式</div>
                                    <div className="text-[11px] text-gray-400">时代暗面规则（随所选时代自动定义）</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={子纪元里模式开启}
                                        onChange={(e) => 设置子纪元里模式开启(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                                </label>
                                {子纪元里模式开启 && (
                                    <span className="absolute -inset-1 rounded-lg bg-yellow-500/15 animate-pulse pointer-events-none" />
                                )}
                            </div>

                            {/* 强度选择器 — 开启时展示 */}
                            {子纪元里模式开启 && 有里模式数据 && (
                                <div className="mt-3 flex gap-2">
                                    {(['微暗', '暧昧', '露骨'] as const).map((level) => {
                                        const isActive = 子纪元里模式强度 === level;
                                        const colors = {
                                            '微暗': isActive ? 'border-blue-500/60 bg-blue-500/15 text-blue-400' : 'border-gray-700 bg-black/25 text-gray-500 hover:border-gray-500',
                                            '暧昧': isActive ? 'border-pink-500/60 bg-pink-500/15 text-pink-400' : 'border-gray-700 bg-black/25 text-gray-500 hover:border-gray-500',
                                            '露骨': isActive ? 'border-red-500/60 bg-red-500/15 text-red-400' : 'border-gray-700 bg-black/25 text-gray-500 hover:border-gray-500',
                                        };
                                        return (
                                            <button
                                                key={level}
                                                type="button"
                                                onClick={() => 设置子纪元里模式强度(level)}
                                                className={`flex-1 rounded-md border px-3 py-2 text-xs font-bold transition-all ${colors[level]}`}
                                            >
                                                {level}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 世界观预设 - moved up for quick-start */}
                        <div className="mt-6">
                            <div className="text-[11px] uppercase tracking-[0.35em] text-wuxia-gold/70 font-mono mb-3">Quick Presets</div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {时代预设卡片.map((preset, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setWorldConfig({ ...worldConfig, ...preset.overrides })}
                                        className="text-left rounded-xl border border-gray-800 bg-black/25 px-4 py-3 hover:border-wuxia-gold/40 hover:bg-black/35 transition-all"
                                    >
                                        <div className="font-bold text-sm font-serif text-gray-200">{preset.name}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div className="space-y-2">
                                <label className="text-sm text-wuxia-cyan font-bold">世界版图</label>
                                <InlineSelect
                                    value={worldConfig.worldSize}
                                    options={世界版图下拉选项}
                                    onChange={(worldSize) => setWorldConfig({ ...worldConfig, worldSize })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-wuxia-cyan font-bold">{组织密度标签}</label>
                                <InlineSelect
                                    value={worldConfig.sectDensity}
                                    options={宗门密度下拉选项}
                                    onChange={(sectDensity) => setWorldConfig({ ...worldConfig, sectDensity })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div className="space-y-2">
                                <label className="text-sm text-wuxia-cyan font-bold">能力类型</label>
                                <InlineSelect
                                    value={worldConfig.能力类型}
                                    options={时代过滤能力类型选项}
                                    onChange={处理能力类型变更}
                                />
                                <div className="text-[11px] text-gray-500 leading-6">
                                    {时代过滤能力类型选项.find((item) => item.value === worldConfig.能力类型)?.hint}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-wuxia-cyan font-bold">武力等级</label>
                                <InlineSelect
                                    value={worldConfig.武力等级}
                                    options={过滤后武力等级选项}
                                    onChange={(武力等级) => setWorldConfig({ ...worldConfig, 武力等级 })}
                                />
                                <div className="text-[11px] text-gray-500 leading-6">
                                    {过滤后武力等级选项.find((item) => item.value === worldConfig.武力等级)?.hint}
                                </div>
                            </div>
                        </div>

                        {worldConfig.能力类型 === '超能力线' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div className="space-y-2">
                                    <label className="text-sm text-wuxia-cyan font-bold">超能力分类</label>
                                    <InlineSelect
                                        value={worldConfig.超能力分类}
                                        options={超能力分类选项}
                                        onChange={(超能力分类) => setWorldConfig({ ...worldConfig, 超能力分类 })}
                                    />
                                    <div className="text-[11px] text-gray-500 leading-6">
                                        {超能力分类选项.find((item) => item.value === worldConfig.超能力分类)?.hint}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-wuxia-cyan font-bold">觉醒程度</label>
                                    <InlineSelect
                                        value={worldConfig.觉醒程度}
                                        options={觉醒程度选项}
                                        onChange={(觉醒程度) => setWorldConfig({ ...worldConfig, 觉醒程度 })}
                                    />
                                    <div className="text-[11px] text-gray-500 leading-6">
                                        {觉醒程度选项.find((item) => item.value === worldConfig.觉醒程度)?.hint}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 rounded-2xl border border-gray-800 bg-black/25 p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-wuxia-cyan font-bold">王朝设定</label>
                                <button
                                    type="button"
                                    onClick={() => setWorldConfig({ ...worldConfig, dynastySetting: 当前时代?.默认王朝占位符 ?? '群雄逐鹿，王朝末年' })}
                                    className="text-[11px] text-gray-500 hover:text-wuxia-gold transition-colors"
                                    title="恢复时代默认"
                                >
                                    ↺ 恢复默认
                                </button>
                            </div>
                            <input
                                value={worldConfig.dynastySetting}
                                onChange={(e) => setWorldConfig({ ...worldConfig, dynastySetting: e.target.value })}
                                placeholder="例如：群雄逐鹿，王朝末年"
                                className="w-full bg-black/50 border-2 border-transparent focus:border-wuxia-gold p-3 text-white outline-none rounded-md transition-all"
                            />
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-wuxia-cyan font-bold">天骄设定</label>
                                <button
                                    type="button"
                                    onClick={() => setWorldConfig({ ...worldConfig, tianjiaoSetting: 当前时代?.默认天骄占位符 ?? '大争之世，天骄并起' })}
                                    className="text-[11px] text-gray-500 hover:text-wuxia-gold transition-colors"
                                    title="恢复时代默认"
                                >
                                    ↺ 恢复默认
                                </button>
                            </div>
                            <input
                                value={worldConfig.tianjiaoSetting}
                                onChange={(e) => setWorldConfig({ ...worldConfig, tianjiaoSetting: e.target.value })}
                                placeholder="例如：大争之世，天骄并起"
                                className="w-full bg-black/50 border-2 border-transparent focus:border-wuxia-gold p-3 text-white outline-none rounded-md transition-all"
                            />
                        </div>

                        <div className="mt-6 rounded-2xl border border-gray-800 bg-black/25 p-4 space-y-2">
                            <label className="text-sm text-wuxia-cyan font-bold">开局额外要求（可选）</label>
                            <textarea
                                value={wizard.openingExtraRequirement}
                                onChange={(e) => wizard.setOpeningExtraRequirement(e.target.value)}
                                placeholder="例如：开局先走日常线，不要直接爆发战斗；先铺垫家族关系。"
                                className="w-full h-20 bg-black/50 border-2 border-transparent focus:border-wuxia-gold p-3 text-white outline-none rounded-md transition-all resize-none"
                            />
                            <div className="text-[11px] text-gray-500">会随开局任务一起发送给模型，仅影响本次开局生成。</div>
                        </div>
                    </OrnateBorder>

                    <OrnateBorder className="p-6 md:p-7 bg-gradient-to-br from-black/65 to-wuxia-red/5">
                        <div className="border-b border-wuxia-gold/30 pb-4 mb-5">
                            <div className="text-[11px] uppercase tracking-[0.35em] text-wuxia-red/70 font-mono">Content Rating</div>
                            <h3 className="text-2xl font-serif font-bold text-wuxia-gold mt-2">内容分级</h3>
                            <p className="text-xs text-gray-400 mt-2 leading-6">控制成人内容和 NSFW 场景的展现程度。</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm text-wuxia-cyan font-bold">NSFW 场景类型</label>
                                <InlineSelect
                                    value={worldConfig.nsfw场景类型}
                                    options={nsfw场景类型选项}
                                    onChange={(nsfw场景类型) => setWorldConfig({ ...worldConfig, nsfw场景类型 })}
                                />
                                <div className="text-[11px] text-gray-500 leading-6">
                                    {nsfw场景类型选项.find((item) => item.value === worldConfig.nsfw场景类型)?.hint}
                                </div>
                            </div>
                        </div>
                    </OrnateBorder>

                    <OrnateBorder className="p-6 md:p-7">
                        <div className="border-b border-wuxia-gold/30 pb-4 mb-5">
                            <div className="text-[11px] uppercase tracking-[0.35em] text-wuxia-cyan/70 font-mono">Manual Prompts</div>
                            <h3 className="text-2xl font-serif font-bold text-wuxia-gold mt-2">手动提示词</h3>
                            <p className="text-xs text-gray-400 mt-2 leading-6">可选导入自定义世界观和境界提示词文件，覆盖默认生成。</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-sm text-wuxia-cyan font-bold">世界观提示词</label>
                                <input
                                    ref={manualWorldPromptInputRef as React.RefObject<HTMLInputElement>}
                                    type="file"
                                    accept=".txt"
                                    onChange={(e) => { void 导入手动提示词文件(e, 'manualWorldPrompt'); }}
                                    className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-wuxia-gold/15 file:text-wuxia-gold hover:file:bg-wuxia-gold/25 file:cursor-pointer"
                                />
                                <div className="text-[11px] text-gray-500">
                                    {worldConfig.manualWorldPrompt.trim()
                                        ? `已导入，长度 ${worldConfig.manualWorldPrompt.length} 字符`
                                        : '尚未导入'}
                                </div>
                                <button
                                    type="button"
                                    onClick={导出手动世界观提示词}
                                    className="text-xs text-wuxia-cyan hover:text-wuxia-gold transition-colors"
                                >
                                    导出当前世界观提示词
                                </button>
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm text-wuxia-cyan font-bold">境界提示词</label>
                                <input
                                    ref={manualRealmPromptInputRef as React.RefObject<HTMLInputElement>}
                                    type="file"
                                    accept=".txt"
                                    onChange={(e) => { void 导入手动提示词文件(e, 'manualRealmPrompt'); }}
                                    className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-wuxia-gold/15 file:text-wuxia-gold hover:file:bg-wuxia-gold/25 file:cursor-pointer"
                                />
                                <div className="text-[11px] text-gray-500">
                                    {worldConfig.manualRealmPrompt.trim()
                                        ? `已导入，长度 ${worldConfig.manualRealmPrompt.length} 字符`
                                        : '尚未导入'}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={导出手动境界提示词}
                                        className="text-xs text-wuxia-cyan hover:text-wuxia-gold transition-colors"
                                    >
                                        导出当前境界提示词
                                    </button>
                                    <button
                                        type="button"
                                        onClick={导出境界提示词模板}
                                        className="text-xs text-wuxia-red hover:text-white transition-colors"
                                    >
                                        导出境界模板
                                    </button>
                                </div>
                            </div>
                        </div>
                    </OrnateBorder>
                </div>
            )}

            {/* STEP 1: CHARACTER BASIC */}
            {step === 1 && (
                <div className="space-y-8 animate-slide-in max-w-5xl mx-auto">
                    <OrnateBorder className="p-6 md:p-7">
                        <div className="border-b border-wuxia-gold/30 pb-4 mb-5">
                            <div className="text-[11px] uppercase tracking-[0.35em] text-wuxia-cyan/70 font-mono">Character Core</div>
                            <h3 className="text-2xl font-serif font-bold text-wuxia-gold mt-2">角色基础</h3>
                            <p className="text-xs text-gray-400 mt-2 leading-6">填写角色的基本信息，这些将作为 AI 生成开局的种子。</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm text-wuxia-cyan font-bold">姓名</label>
                                <input
                                    value={charName}
                                    onChange={(e) => setCharName(e.target.value)}
                                    placeholder="例如：李长风、苏清月"
                                    className="w-full bg-black/50 border-2 border-transparent focus:border-wuxia-gold p-3 text-white outline-none rounded-md transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-wuxia-cyan font-bold">性别</label>
                                <div className="flex gap-2">
                                    {(['男', '女', '自定义'] as const).map((g) => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => 选择性别(g)}
                                            className={`flex-1 py-2.5 rounded-lg border text-sm transition-all ${
                                                当前性别模式 === g
                                                    ? 'border-wuxia-gold bg-wuxia-gold/10 text-wuxia-gold'
                                                    : 'border-gray-700 bg-black/30 text-gray-300 hover:border-wuxia-gold/40'
                                            }`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                                {当前性别模式 === '自定义' && (
                                    <input
                                        value={charGender}
                                        onChange={(e) => setCharGender(e.target.value)}
                                        placeholder="输入自定义性别"
                                        className="mt-2 w-full bg-black/50 border-2 border-transparent focus:border-wuxia-gold p-3 text-white outline-none rounded-md transition-all"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            <div className="space-y-2">
                                <label className="text-sm text-wuxia-cyan font-bold">出生月份</label>
                                <CompactDropdown
                                    value={birthMonth}
                                    options={Array.from({ length: 12 }, (_, i) => i + 1)}
                                    suffix="月"
                                    open={monthOpen}
                                    onToggle={() => { setMonthOpen(!monthOpen); setDayOpen(false); }}
                                    onSelect={(v) => { setBirthMonth(v); setMonthOpen(false); }}
                                    containerRef={monthRef as React.RefObject<HTMLDivElement>}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-wuxia-cyan font-bold">出生日期</label>
                                <CompactDropdown
                                    value={birthDay}
                                    options={Array.from({ length: 31 }, (_, i) => i + 1)}
                                    suffix="日"
                                    open={dayOpen}
                                    onToggle={() => { setDayOpen(!dayOpen); setMonthOpen(false); }}
                                    onSelect={(v) => { setBirthDay(v); setDayOpen(false); }}
                                    containerRef={dayRef as React.RefObject<HTMLDivElement>}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-wuxia-cyan font-bold">年龄</label>
                                <input
                                    type="number"
                                    min={12}
                                    max={80}
                                    value={charAge}
                                    onChange={(e) => setCharAge(Math.max(12, Math.min(80, Number(e.target.value) || 18)))}
                                    className="w-full bg-black/50 border-2 border-transparent focus:border-wuxia-gold p-3 text-white outline-none rounded-md transition-all"
                                />
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm text-wuxia-cyan font-bold">外貌</label>
                                <textarea
                                    value={charAppearance}
                                    onChange={(e) => setCharAppearance(e.target.value)}
                                    placeholder="描述角色的外貌和衣着风格..."
                                    className="w-full h-24 bg-black/50 border-2 border-transparent focus:border-wuxia-gold p-3 text-white outline-none rounded-md transition-all resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-wuxia-cyan font-bold">性格</label>
                                <textarea
                                    value={charPersonality}
                                    onChange={(e) => setCharPersonality(e.target.value)}
                                    placeholder="描述角色的性格特点、行为风格、价值取向..."
                                    className="w-full h-24 bg-black/50 border-2 border-transparent focus:border-wuxia-gold p-3 text-white outline-none rounded-md transition-all resize-none"
                                />
                                <div className="rounded-xl border border-wuxia-gold/20 bg-wuxia-gold/5 p-3 text-[11px] text-gray-400 leading-6">
                                    <span className="text-wuxia-gold/80">COT 聚焦</span>：性格应包含内在矛盾或成长驱动力，避免单维标签。
                                </div>
                            </div>
                        </div>
                    </OrnateBorder>

                    <OrnateBorder className="p-6 md:p-7 bg-gradient-to-br from-black/65 to-wuxia-red/5">
                        <div className="flex items-center justify-between gap-4 border-b border-wuxia-gold/30 pb-4 mb-5">
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.3em] text-wuxia-red/70 font-mono">Stats</div>
                                <h3 className="text-2xl font-serif font-bold text-wuxia-gold mt-2">属性分配</h3>
                                <p className="text-xs text-gray-400 mt-2 leading-6">
                                    {worldConfig.difficulty.toUpperCase()} 难度总预算 {totalStatBudget} 点，当前已用 {usedPoints} 点。
                                </p>
                            </div>
                            <span className={`text-sm font-mono px-3 py-1.5 rounded-lg ${
                                remainingPoints < 0 ? 'bg-red-500/20 text-red-300' : remainingPoints === 0 ? 'bg-wuxia-gold/20 text-wuxia-gold' : 'bg-gray-800 text-gray-300'
                            }`}>
                                剩余 {remainingPoints} 点
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {(Object.keys(stats) as Array<keyof typeof stats>).map((key) => (
                                <div key={key} className="rounded-xl border border-gray-800 bg-black/30 p-4 flex flex-col items-center gap-2">
                                    <div className="text-xs text-gray-400">{key}</div>
                                    <div className="text-xl font-mono font-bold text-wuxia-gold">{stats[key]}</div>
                                    <div className="flex gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleStatChange(key, -1)}
                                            disabled={stats[key] <= 属性最小值}
                                            className="w-8 h-8 rounded-lg border border-gray-700 bg-black/40 text-gray-300 hover:border-wuxia-gold/40 hover:text-wuxia-gold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            -
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleStatChange(key, 1)}
                                            disabled={remainingPoints <= 0 || stats[key] >= 属性最大值}
                                            className="w-8 h-8 rounded-lg border border-gray-700 bg-black/40 text-gray-300 hover:border-wuxia-gold/40 hover:text-wuxia-gold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </OrnateBorder>
                </div>
            )}

            {/* STEP 2: TALENTS & BACKGROUND */}
            {step === 2 && (
                <div className="space-y-8 animate-slide-in max-w-5xl mx-auto">
                    {/* 推荐预设卡片 */}
                    {当前子纪元默认预设列表.length > 0 && (
                        <div className="space-y-4">
                            <div className="text-[11px] uppercase tracking-[0.3em] text-wuxia-gold/70 font-mono">Recommended Presets</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {当前子纪元默认预设列表.map((preset, idx) => (
                                    <div key={idx} className="rounded-lg border border-wuxia-gold/20 bg-gradient-to-br from-wuxia-gold/8 via-black/50 to-wuxia-cyan/5 p-4 flex flex-col">
                                        <h3 className="text-base font-serif font-bold text-wuxia-gold mb-1">{preset.名称}</h3>
                                        <p className="text-xs text-gray-400 mb-3 leading-5 line-clamp-2">{preset.简介}</p>
                                        <button
                                            type="button"
                                            onClick={() => 应用子纪元默认预设(preset)}
                                            className="shrink-0 px-4 py-1.5 rounded-lg bg-wuxia-gold/15 border border-wuxia-gold/40 text-wuxia-gold text-xs font-medium hover:bg-wuxia-gold/25 hover:border-wuxia-gold/60 transition-all self-start mb-3"
                                        >
                                            一键应用
                                        </button>
                                        <div className="space-y-1.5 text-xs mt-auto">
                                            <div>
                                                <span className="text-[10px] tracking-[0.2em] text-gray-500 font-mono">背景</span>
                                                <span className="text-gray-200 ml-2">{preset.背景名称}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] tracking-[0.2em] text-gray-500 font-mono">天赋</span>
                                                <span className="text-gray-200 ml-2">{preset.天赋名称列表.join(' / ')}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] tracking-[0.2em] text-gray-500 font-mono">气运</span>
                                                <span className="text-gray-200 ml-2">{(preset.气运名称列表 || []).join(' / ') || '无'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="text-[11px] text-gray-500">应用后仍可自由修改，预设不会锁定任何选项</div>
                        </div>
                    )}

                    {/* Background Section */}
                    <OrnateBorder className="p-6 md:p-7 bg-gradient-to-br from-black/65 to-wuxia-red/5">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-wuxia-gold/30 pb-4 mb-5">
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.3em] text-wuxia-red/70 font-mono">Identity</div>
                                <h3 className="text-2xl font-serif font-bold text-wuxia-gold mt-2">身世背景</h3>
                                <p className="text-xs text-gray-400 mt-2 leading-6">{背景长期说明}</p>
                            </div>
                            <div className="flex flex-col items-start md:items-end gap-3">
                                <div className="flex items-center gap-3">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={自动填充开启}
                                            onChange={(e) => set自动填充开启(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-wuxia-gold"></div>
                                    </label>
                                    <span className="text-xs text-gray-400">选背景自动填充天赋气运</span>
                                </div>
                                <div className="text-xs text-gray-500">当前: <span className="text-wuxia-gold">{selectedBackground.名称}</span></div>
                                <button
                                    onClick={() => {
                                        if (showCustomBackground) { 重置自定义背景编辑(); return; }
                                        setShowCustomBackground(true);
                                    }}
                                    className="text-xs text-wuxia-cyan hover:text-wuxia-gold transition-colors"
                                >
                                    {showCustomBackground ? '收起自定义身份编辑器' : '+ 自定义身份'}
                                </button>
                            </div>
                        </div>

                        {showCustomBackground && (
                            <OrnateBorder className="p-4 bg-black/35 mb-5">
                                <div className="space-y-3">
                                    <input placeholder="身份名称" value={customBackground.名称} onChange={e => setCustomBackground({...customBackground, 名称: e.target.value})} className="w-full bg-black/50 border-2 border-transparent focus:border-wuxia-cyan p-3 text-sm text-white outline-none rounded-md transition-all" />
                                    <textarea placeholder="背景描述：说明出身、成长环境和早期经历" value={customBackground.描述} onChange={e => setCustomBackground({...customBackground, 描述: e.target.value})} className="w-full h-20 bg-black/50 border-2 border-transparent focus:border-wuxia-cyan p-3 text-sm text-white outline-none rounded-md transition-all resize-none" />
                                    <textarea placeholder="长期效果：说明会长期强化哪些资源、路线或判定" value={customBackground.效果} onChange={e => setCustomBackground({...customBackground, 效果: e.target.value})} className="w-full h-24 bg-black/50 border-2 border-transparent focus:border-wuxia-cyan p-3 text-sm text-white outline-none rounded-md transition-all resize-none" />
                                    <div className="flex gap-2">
                                        <GameButton onClick={addCustomBackground} variant="secondary" className="flex-1 py-2 text-xs">{正在编辑背景名 ? '保存身份修改' : '保存自定义身份'}</GameButton>
                                        <GameButton onClick={重置自定义背景编辑} variant="secondary" className="px-4 py-2 text-xs opacity-80">取消</GameButton>
                                    </div>
                                </div>
                            </OrnateBorder>
                        )}

                        {自定义背景列表.length > 0 && (
                            <div className="mb-5 rounded-2xl border border-gray-800 bg-black/25 p-4">
                                <div className="text-[11px] tracking-[0.25em] text-gray-500 font-mono">已保存自定义身份</div>
                                <div className="mt-3 space-y-2">
                                    {自定义背景列表.map((bg) => (
                                        <div key={bg.名称} className="rounded-xl border border-gray-800 bg-black/30 px-4 py-3 flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="text-sm text-gray-200 truncate">{bg.名称}</div>
                                                <div className="text-[11px] text-gray-500 truncate">{bg.效果}</div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button type="button" onClick={() => setSelectedBackground(bg)} className="text-[11px] text-wuxia-gold hover:text-white">使用</button>
                                                <button type="button" onClick={() => 编辑自定义背景(bg)} className="text-[11px] text-wuxia-cyan hover:text-white">编辑</button>
                                                <button type="button" onClick={() => { void 删除自定义背景(bg.名称); }} className="text-[11px] text-red-400 hover:text-red-200">删除</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <SectionCollapse title="身份选项" subtitle="点击展开查看所有身份" count={过滤后背景选项.length} defaultOpen={false}>
                            <div className="space-y-3 mb-4">
                                <SearchInput value={背景搜索词} onChange={set背景搜索词} placeholder="搜索背景名称、描述或效果..." />
                                <ChipGroup
                                    chips={背景分类列表.map(c => ({ label: c, value: c }))}
                                    selected={背景分类过滤}
                                    onChange={set背景分类过滤}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {过滤后背景选项.length === 0 && (背景搜索词 || 背景分类过滤) ? (
                                <div className="col-span-full text-center py-8 text-gray-500 text-sm">无匹配结果，请尝试其他关键词</div>
                            ) : null}
                            {过滤后背景选项.map((bg, idx) => {
                                const isSelected = selectedBackground.名称 === bg.名称;
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedBackground(bg)}
                                        className={`group relative overflow-hidden rounded-2xl border cursor-pointer transition-all duration-300 ${
                                            isSelected
                                                ? 'border-wuxia-gold bg-gradient-to-br from-wuxia-gold/15 via-black/70 to-black/70 shadow-[0_0_24px_rgba(212,175,55,0.16)]'
                                                : 'border-gray-700 bg-black/25 hover:border-wuxia-gold/45 hover:bg-black/35'
                                        }`}
                                    >
                                        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-wuxia-gold/80 via-wuxia-cyan/70 to-transparent"></div>
                                        <div className="p-5 pl-6">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className={`font-bold text-base font-serif ${isSelected ? 'text-wuxia-gold' : 'text-gray-200'}`}>
                                                    {bg.名称}
                                                    {!预设背景.some(p => p.名称 === bg.名称) ? ' · 自定义' : ''}
                                                </div>
                                                <span className={`text-[10px] tracking-[0.25em] font-mono ${isSelected ? 'text-wuxia-cyan' : 'text-gray-500 group-hover:text-wuxia-cyan/70'}`}>IDENTITY</span>
                                            </div>
                                            <div className="mt-3 text-sm text-gray-400 leading-6">{bg.描述}</div>
                                            <时代标签 时代适配={bg.时代适配} />
                                            <div className="mt-4 rounded-xl border border-white/8 bg-black/30 px-4 py-3 text-sm text-wuxia-cyan/90 leading-6">
                                                <span className="text-wuxia-gold/80 mr-2">长期效果</span>
                                                {bg.效果}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            </div>
                        </SectionCollapse>
                    </OrnateBorder>

                    {/* Talents Section */}
                    <OrnateBorder className="p-6 md:p-7 bg-gradient-to-br from-black/65 to-wuxia-red/5">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-wuxia-gold/30 pb-4 mb-5">
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.3em] text-wuxia-red/70 font-mono">Fate Traits</div>
                                <h3 className="mt-2 text-2xl font-serif font-bold text-wuxia-gold">天赋卷宗</h3>
                                <p className="text-xs text-gray-400 mt-2 leading-6">{天赋说明}</p>
                            </div>
                            <div className="flex flex-col items-start md:items-end gap-3">
                                {selectedTalents.length === 0 ? (
                                    <span className="text-xs text-gray-500">尚未选择天赋</span>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTalents.map((t, idx) => (
                                            <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-wuxia-red/15 border border-wuxia-red/40">
                                                <span className="text-sm text-wuxia-red">{t.名称}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleTalent(t)}
                                                    className="text-gray-400 hover:text-red-400"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="text-[11px] text-gray-500">已选 {selectedTalents.length}/3 个，天赋更偏向长期成长路线，不只决定开局强度。</div>
                                <button
                                    onClick={() => {
                                        if (showCustomTalent) { 重置自定义天赋编辑(); return; }
                                        setShowCustomTalent(true);
                                    }}
                                    className="text-xs text-wuxia-cyan hover:text-wuxia-gold transition-colors"
                                >
                                    {showCustomTalent ? '收起自定义天赋编辑器' : '+ 自定义天赋'}
                                </button>
                            </div>
                        </div>

                        {showCustomTalent && (
                            <OrnateBorder className="p-4 bg-black/35 mb-5">
                                <div className="space-y-3">
                                    <input placeholder="天赋名称" value={customTalent.名称} onChange={e => setCustomTalent({...customTalent, 名称: e.target.value})} className="w-full bg-black/50 border-2 border-transparent focus:border-wuxia-cyan p-3 text-sm text-white outline-none rounded-md transition-all" />
                                    <textarea placeholder="天赋描述：说明天赋偏向与风格" value={customTalent.描述} onChange={e => setCustomTalent({...customTalent, 描述: e.target.value})} className="w-full h-20 bg-black/50 border-2 border-transparent focus:border-wuxia-cyan p-3 text-sm text-white outline-none rounded-md transition-all resize-none" />
                                    <textarea placeholder="长期效果：说明会长期强化哪些成长、判定或路线" value={customTalent.效果} onChange={e => setCustomTalent({...customTalent, 效果: e.target.value})} className="w-full h-24 bg-black/50 border-2 border-transparent focus:border-wuxia-cyan p-3 text-sm text-white outline-none rounded-md transition-all resize-none" />
                                    <div className="flex gap-2">
                                        <GameButton onClick={addCustomTalent} variant="secondary" className="flex-1 py-2 text-xs">{正在编辑天赋名 ? '保存天赋修改' : '保存自定义天赋'}</GameButton>
                                        <GameButton onClick={重置自定义天赋编辑} variant="secondary" className="px-4 py-2 text-xs opacity-80">取消</GameButton>
                                    </div>
                                </div>
                            </OrnateBorder>
                        )}

                        {自定义天赋列表.length > 0 && (
                            <div className="mb-5 rounded-2xl border border-gray-800 bg-black/25 p-4">
                                <div className="text-[11px] tracking-[0.25em] text-gray-500 font-mono">已保存自定义天赋</div>
                                <div className="mt-3 space-y-2">
                                    {自定义天赋列表.map((talent) => (
                                        <div key={talent.名称} className="rounded-xl border border-gray-800 bg-black/30 px-4 py-3 flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="text-sm text-gray-200 truncate">{talent.名称}</div>
                                                <div className="text-[11px] text-gray-500 truncate">{talent.效果}</div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button type="button" onClick={() => toggleTalent(talent)} className="text-[11px] text-wuxia-gold hover:text-white">{selectedTalents.some(item => item.名称 === talent.名称) ? '取消使用' : '使用'}</button>
                                                <button type="button" onClick={() => 编辑自定义天赋(talent)} className="text-[11px] text-wuxia-cyan hover:text-white">编辑</button>
                                                <button type="button" onClick={() => { void 删除自定义天赋(talent.名称); }} className="text-[11px] text-red-400 hover:text-red-200">删除</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </OrnateBorder>

                    {/* Talent Selection */}
                    <OrnateBorder className="p-6 md:p-7">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 border-b border-wuxia-gold/30 pb-4 mb-5">
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.35em] text-wuxia-red/70 font-mono">Talent Matrix</div>
                                <h3 className="text-2xl font-serif font-bold text-wuxia-gold mt-2">天赋选择</h3>
                                <p className="text-xs text-gray-400 mt-2 leading-6">选择最多三个天赋，组合出你的长期成长风格、擅长判定与可走路线。</p>
                            </div>
                            <div className="text-xs text-gray-500">建议搭配：战斗 + 生存 + 社交 / 探索，角色会更立体</div>
                        </div>

                        <SectionCollapse title="天赋列表" subtitle="点击展开查看所有天赋" count={过滤后天赋选项.length} defaultOpen={false}>
                            <div className="space-y-3 mb-4">
                                <SearchInput value={天赋搜索词} onChange={set天赋搜索词} placeholder="搜索天赋名称、描述或效果..." />
                                <ChipGroup
                                    chips={天赋分类列表.map(c => ({ label: c, value: c }))}
                                    selected={天赋分类过滤}
                                    onChange={set天赋分类过滤}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {过滤后天赋选项.length === 0 && (天赋搜索词 || 天赋分类过滤) ? (
                                <div className="col-span-full text-center py-8 text-gray-500 text-sm">无匹配结果，请尝试其他关键词</div>
                            ) : null}
                            {过滤后天赋选项.map((t, idx) => {
                                const isSelected = !!selectedTalents.find(x => x.名称 === t.名称);
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => toggleTalent(t)}
                                        className={`group rounded-2xl border cursor-pointer transition-all duration-300 overflow-hidden ${
                                            isSelected
                                                ? 'border-wuxia-red bg-gradient-to-br from-wuxia-red/15 via-black/70 to-black/70 shadow-[0_0_22px_rgba(190,30,45,0.16)]'
                                                : 'border-gray-700 bg-black/25 hover:border-wuxia-red/45 hover:bg-black/35'
                                        }`}
                                    >
                                        <div className="p-5">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className={`font-bold text-base font-serif ${isSelected ? 'text-wuxia-red' : 'text-gray-200'}`}>
                                                    {t.名称}
                                                    {!预设天赋.some(p => p.名称 === t.名称) ? ' · 自定义' : ''}
                                                </div>
                                                <span className={`text-[10px] tracking-[0.25em] font-mono ${isSelected ? 'text-wuxia-cyan' : 'text-gray-500 group-hover:text-wuxia-cyan/70'}`}>{isSelected ? 'SELECTED' : 'TRAIT'}</span>
                                            </div>
                                            <div className="mt-3 text-sm text-gray-400 leading-6">{t.描述}</div>
                                            <时代标签 时代适配={t.时代适配} />
                                            <div className="mt-4 rounded-xl border border-white/8 bg-black/30 px-4 py-3 text-sm text-wuxia-cyan/90 leading-6">
                                                <span className="text-wuxia-gold/80 mr-2">长期效果</span>
                                                {t.效果}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            </div>
                        </SectionCollapse>
                    </OrnateBorder>

                    {/* Qiyun Section */}
                    <OrnateBorder className="p-6 md:p-7 mt-8">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 border-b border-wuxia-gold/30 pb-4 mb-5">
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.35em] text-wuxia-red/70 font-mono">Fortune Matrix</div>
                                <h3 className="text-2xl font-serif font-bold text-wuxia-gold mt-2">气运卷宗</h3>
                                <p className="text-xs text-gray-400 mt-2 leading-6">气运乃天命所钟，可影响属性修正、判定加成与特殊效果。随机抽取或手动选择皆可。</p>
                            </div>
                            <GameButton onClick={generateRandomQiyun} variant="secondary" className="py-2 text-xs">
                                随机抽取
                            </GameButton>
                        </div>

                        {selectedQiyun.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <span className="text-xs">尚未选择气运</span>
                            </div>
                        ) : (
                            <div className="mb-4 p-4 rounded-xl border border-wuxia-gold/30 bg-black/30">
                                <div className="text-[11px] text-wuxia-gold/70 mb-2">已选气运</div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedQiyun.map((q, idx) => (
                                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-wuxia-red/15 border border-wuxia-red/40">
                                            <span className="text-sm text-wuxia-red">{q.名称}</span>
                                            <button
                                                type="button"
                                                onClick={() => toggleQiyun(q)}
                                                className="text-gray-400 hover:text-red-400"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <SectionCollapse title="气运列表" subtitle="点击展开查看所有气运" count={过滤后气运选项.length} defaultOpen={false}>
                            <div className="space-y-3 mb-4">
                                <SearchInput value={气运搜索词} onChange={set气运搜索词} placeholder="搜索气运名称或描述..." />
                                <ChipGroup
                                    chips={[
                                        { label: '真·气运', value: '真·气运' },
                                        { label: '限制版气运', value: '限制版气运' },
                                        { label: '因果律', value: '因果律' },
                                        { label: '天道规则', value: '天道规则' },
                                        { label: '绝对无敌', value: '绝对无敌' },
                                        { label: '脑洞破防', value: '脑洞破防' },
                                        { label: '法则扭曲', value: '法则扭曲' },
                                        { label: '白嫖躺赢', value: '白嫖躺赢' },
                                        { label: '怠惰降维', value: '怠惰降维' },
                                        { label: '精神暴击', value: '精神暴击' },
                                        { label: '合欢秘辛', value: '合欢秘辛' }
                                    ]}
                                    selected={气运类别过滤}
                                    onChange={选择气运类别}
                                />
                                <ChipGroup
                                    chips={[
                                        { label: '传说', value: '传说' },
                                        { label: '稀有', value: '稀有' },
                                        { label: '普通', value: '普通' }
                                    ]}
                                    selected={气运稀有度过滤}
                                    onChange={选择气运稀有度}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {过滤后气运选项.length === 0 && (气运搜索词 || 气运类别过滤 || 气运稀有度过滤) ? (
                                <div className="col-span-full text-center py-8 text-gray-500 text-sm">无匹配结果，请调整筛选条件</div>
                            ) : null}
                            {过滤后气运选项.map((q, idx) => {
                                const isSelected = !!selectedQiyun.find(x => x.名称 === q.名称);
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => toggleQiyun(q)}
                                        className={`group rounded-2xl border cursor-pointer transition-all duration-300 overflow-hidden ${
                                            isSelected
                                                ? 'border-wuxia-red bg-gradient-to-br from-wuxia-red/15 via-black/70 to-black/70 shadow-[0_0_22px_rgba(190,30,45,0.16)]'
                                                : 'border-gray-700 bg-black/25 hover:border-wuxia-red/45 hover:bg-black/35'
                                        }`}
                                    >
                                        <div className="p-4">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className={`font-bold text-sm font-serif ${isSelected ? 'text-wuxia-red' : 'text-gray-200'}`}>
                                                    {q.名称}
                                                </div>
                                                <span className={`text-[10px] tracking-[0.25em] font-mono ${isSelected ? 'text-wuxia-cyan' : 'text-gray-500'}`}>
                                                    {q.稀有度}
                                                </span>
                                            </div>
                                            <div className="mt-2 text-xs text-gray-400 leading-5">{q.描述}</div>
                                            <时代标签 时代适配={q.时代适配} />
                                            {q.效果.length > 0 && (
                                                <div className="mt-3 rounded-lg border border-white/8 bg-black/30 px-3 py-2 text-xs text-wuxia-cyan/90 leading-5">
                                                    {q.效果[0].描述 || q.效果[0].类型}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            </div>
                        </SectionCollapse>
                    </OrnateBorder>
                </div>
            )}

            {/* STEP 3: OPENING CONFIG */}
            {step === 3 && (
                <div className="space-y-8 animate-slide-in max-w-5xl mx-auto">
                    <OrnateBorder className="p-6 md:p-7">
                        <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-800 bg-black/25 px-4 py-4">
                            <div>
                                <div className="text-sm text-gray-200">启用开局配置</div>
                                <div className="text-[11px] text-gray-500 mt-1">关闭时不额外注入关系侧重、切入偏好和同人融合，按世界观与角色档案自然开局。</div>
                            </div>
                            <开关按钮
                                checked={openingConfigEnabled}
                                label={openingConfigEnabled ? '已启用' : '未启用'}
                                onToggle={() => setOpeningConfigEnabled((prev) => !prev)}
                            />
                        </div>
                    </OrnateBorder>

                    {openingConfigEnabled ? (
                        <>
                        <OrnateBorder className="p-6 md:p-7">
                            <div className="border-b border-wuxia-gold/30 pb-4 mb-5">
                                <div className="text-[11px] uppercase tracking-[0.35em] text-wuxia-cyan/70 font-mono">Opening Structure</div>
                                <h3 className="text-2xl font-serif font-bold text-wuxia-gold mt-2">开局配置</h3>
                                <p className="text-xs text-gray-400 mt-2 leading-6">这里决定初始关系侧重、第一幕切入方式，以及是否让世界观带上同人融合倾向。</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-sm text-wuxia-cyan font-bold">开局切入偏好</label>
                                    <InlineSelect
                                        value={openingConfig.开局切入偏好}
                                        options={开局切入偏好选项.map((item) => ({ value: item.value, label: item.label }))}
                                        onChange={(开局切入偏好) => setOpeningConfig((prev) => ({ ...prev, 开局切入偏好 }))}
                                    />
                                    <div className="text-[11px] text-gray-500 leading-6">
                                        {开局切入偏好选项.find((item) => item.value === openingConfig.开局切入偏好)?.hint}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="text-sm text-wuxia-cyan font-bold">关系侧重（最多 2 项）</label>
                                <div className="mt-3 flex flex-wrap gap-3">
                                    {关系侧重选项.map((item) => {
                                        const active = openingConfig.关系侧重.includes(item.value);
                                        const disabled = !active && openingConfig.关系侧重.length >= 2;
                                        return (
                                            <button
                                                key={item.value}
                                                type="button"
                                                onClick={() => toggleRelationFocus(item.value)}
                                                disabled={disabled}
                                                className={`rounded-full border px-4 py-2 text-sm transition-all ${
                                                    active
                                                        ? 'border-wuxia-gold bg-wuxia-gold/10 text-wuxia-gold'
                                                        : 'border-gray-700 bg-black/30 text-gray-300 hover:border-wuxia-gold/40'
                                                } disabled:cursor-not-allowed disabled:opacity-40`}
                                            >
                                                {item.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="mt-2 text-[11px] text-gray-500">已选 {openingConfig.关系侧重.length}/2。会优先影响初始社交网的情绪结构。</div>
                            </div>
                        </OrnateBorder>

                        <OrnateBorder className="p-6 md:p-7">
                            <div className="border-b border-wuxia-gold/30 pb-4 mb-5">
                                <div className="text-[11px] uppercase tracking-[0.35em] text-wuxia-red/70 font-mono">Fandom Blend</div>
                                <h3 className="text-2xl font-serif font-bold text-wuxia-gold mt-2">同人融合</h3>
                                <p className="text-xs text-gray-400 mt-2 leading-6">仅作用于世界观生成，不会单独进入开局初始化提示词。</p>
                            </div>

                            <div className="space-y-5">
                                <div className="flex items-center justify-between rounded-2xl border border-gray-800 bg-black/25 px-4 py-4">
                                    <div>
                                        <div className="text-sm text-gray-200">启用同人融合</div>
                                        <div className="text-[11px] text-gray-500 mt-1">关闭时完全按原创世界生成。</div>
                                    </div>
                                    <开关按钮
                                        checked={openingConfig.同人融合.enabled}
                                        label={openingConfig.同人融合.enabled ? '已启用' : '已关闭'}
                                        onToggle={() => setOpeningConfig((prev) => ({
                                            ...prev,
                                            同人融合: { ...prev.同人融合, enabled: !prev.同人融合.enabled }
                                        }))}
                                    />
                                </div>

                                {openingConfig.同人融合.enabled && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm text-wuxia-cyan font-bold">作品名</label>
                                            <input
                                                value={openingConfig.同人融合.作品名}
                                                onChange={(e) => setOpeningConfig((prev) => ({
                                                    ...prev,
                                                    同人融合: { ...prev.同人融合, 作品名: e.target.value }
                                                }))}
                                                placeholder="例如：雪中悍刀行 / 诛仙 / 仙剑奇侠传"
                                                className="w-full bg-black/50 border-2 border-transparent focus:border-wuxia-gold p-3 text-white outline-none rounded-md transition-all"
                                            />
                                            <div className="text-[11px] text-gray-500">
                                                若下方启用附加小说，选择数据集时会自动把作品名同步为对应小说，方便同人规划与注入保持一致。
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-wuxia-cyan font-bold">来源类型</label>
                                            <InlineSelect
                                                value={openingConfig.同人融合.来源类型}
                                                options={同人来源类型选项}
                                                onChange={(来源类型) => setOpeningConfig((prev) => ({
                                                    ...prev,
                                                    同人融合: { ...prev.同人融合, 来源类型 }
                                                }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-wuxia-cyan font-bold">融合强度</label>
                                            <InlineSelect
                                                value={openingConfig.同人融合.融合强度}
                                                options={同人融合强度选项.map((item) => ({ value: item.value, label: item.label }))}
                                                onChange={(融合强度) => setOpeningConfig((prev) => ({
                                                    ...prev,
                                                    同人融合: { ...prev.同人融合, 融合强度 }
                                                }))}
                                            />
                                            <div className="text-[11px] text-gray-500 leading-6">
                                                {同人融合强度选项.find((item) => item.value === openingConfig.同人融合.融合强度)?.hint}
                                            </div>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <开关按钮
                                                checked={openingConfig.同人融合.保留原著角色}
                                                label="保留原著角色实体"
                                                onToggle={() => setOpeningConfig((prev) => ({
                                                    ...prev,
                                                    同人融合: { ...prev.同人融合, 保留原著角色: !prev.同人融合.保留原著角色 }
                                                }))}
                                            />
                                            <div className="text-[11px] text-gray-500">关闭时只吸收作品母题、势力气质和设定结构，不直接保留原著角色。</div>
                                        </div>
                                        <div className="space-y-3 md:col-span-2 rounded-2xl border border-wuxia-gold/15 bg-black/25 p-4">
                                            <开关按钮
                                                checked={openingConfig.同人融合.启用角色替换}
                                                label="启用同人角色替换"
                                                onToggle={() => setOpeningConfig((prev) => ({
                                                    ...prev,
                                                    同人融合: {
                                                        ...prev.同人融合,
                                                        启用角色替换: !prev.同人融合.启用角色替换
                                                    }
                                                }))}
                                            />
                                            <div className="text-[11px] text-gray-500 leading-6">
                                                仅在"小说分解注入文本"进入主剧情 / 规划 / 世界演变上下文前做替换，不修改原数据集内容，也不影响外部存储。
                                            </div>
                                            {openingConfig.同人融合.启用角色替换 && (
                                                <div className="space-y-3">
                                                    <label className="text-sm text-wuxia-cyan font-bold">被替换的原著角色名</label>
                                                    <input
                                                        type="text"
                                                        value={openingConfig.同人融合.替换目标角色名}
                                                        onChange={(e) => setOpeningConfig((prev) => ({
                                                            ...prev,
                                                            同人融合: {
                                                                ...prev.同人融合,
                                                                替换目标角色名: e.target.value
                                                            }
                                                        }))}
                                                        placeholder="例如：徐凤年"
                                                        className="w-full bg-black/50 border-2 border-transparent focus:border-wuxia-gold p-3 text-white outline-none rounded-md transition-all"
                                                    />
                                                    <div className="text-[11px] text-gray-500">
                                                        这个主名称默认会在注入时替换成当前主角姓名，不会改动界面外显的原始小说数据。
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <label className="text-sm text-wuxia-cyan font-bold">附加替换规则（可选）</label>
                                                            <button
                                                                type="button"
                                                                onClick={新增附加角色替换规则}
                                                                className="px-3 py-1.5 rounded-full border border-wuxia-gold/35 text-[11px] text-wuxia-gold hover:bg-wuxia-gold/10 transition-colors"
                                                            >
                                                                新增一条
                                                            </button>
                                                        </div>
                                                        {openingConfig.同人融合.附加角色替换规则列表.length > 0 ? (
                                                            <div className="space-y-3">
                                                                {openingConfig.同人融合.附加角色替换规则列表.map((rule, index) => (
                                                                    <div key={`replace-rule-${index}`} className="grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                                                                        <input
                                                                            type="text"
                                                                            value={rule.原名称}
                                                                            onChange={(e) => 更新附加角色替换规则(index, '原名称', e.target.value)}
                                                                            placeholder="原著里的名字，例如：小年"
                                                                            className="w-full bg-black/50 border-2 border-transparent focus:border-wuxia-gold p-3 text-white outline-none rounded-md transition-all"
                                                                        />
                                                                        <input
                                                                            type="text"
                                                                            value={rule.替换为}
                                                                            onChange={(e) => 更新附加角色替换规则(index, '替换为', e.target.value)}
                                                                            placeholder="替换成，例如：阿轩"
                                                                            className="w-full bg-black/50 border-2 border-transparent focus:border-wuxia-gold p-3 text-white outline-none rounded-md transition-all"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => 删除附加角色替换规则(index)}
                                                                            className="px-3 py-2 rounded-md border border-red-500/30 text-sm text-red-300 hover:bg-red-500/10 transition-colors"
                                                                        >
                                                                            删除
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-[11px] text-gray-500">
                                                                可以单独指定别名、小名、称呼或化名要替换成什么名字。
                                                            </div>
                                                        )}
                                                        <div className="text-[11px] text-gray-500">
                                                            附加规则不会再强制绑定当前主角姓名，每条都按你填写的"原名称 -&gt; 替换为"执行。
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-3 md:col-span-2 rounded-2xl border border-wuxia-cyan/20 bg-black/25 p-4">
                                            <开关按钮
                                                checked={openingConfig.同人融合.启用附加小说}
                                                label="启用附加小说分解"
                                                onToggle={() => setOpeningConfig((prev) => ({
                                                    ...prev,
                                                    同人融合: {
                                                        ...prev.同人融合,
                                                        启用附加小说: !prev.同人融合.启用附加小说,
                                                        附加小说数据集ID: !prev.同人融合.启用附加小说 ? prev.同人融合.附加小说数据集ID : ''
                                                    }
                                                }))}
                                            />
                                            <div className="text-[11px] text-gray-500 leading-6">
                                                允许前端同时保存多部小说的分解数据，但本次存档只会注入这里选定的那一部。
                                            </div>
                                            <InlineSelect
                                                value={openingConfig.同人融合.附加小说数据集ID}
                                                options={小说拆分数据集列表.map((dataset) => ({
                                                    value: dataset.id,
                                                    label: dataset.作品名 || dataset.标题 || dataset.id
                                                }))}
                                                onChange={选择附加小说数据集}
                                                placeholder={小说拆分数据集列表.length > 0 ? '选择附加小说数据集' : '暂无已导入的小说分解数据'}
                                                disabled={!openingConfig.同人融合.启用附加小说 || 小说拆分数据集列表.length <= 0}
                                            />
                                            <div className="text-[11px] text-gray-500">
                                                {小说拆分数据集列表.length <= 0
                                                    ? '还没有可选的数据集，请先在首页的小说分解工作台导入 TXT / EPUB 或分解 JSON。'
                                                    : 当前附加小说数据集
                                                        ? `当前选择：${当前附加小说数据集.作品名 || 当前附加小说数据集.标题}，后续主剧情 / 规划分析 / 世界演变都会优先使用这部小说的分解注入。`
                                                        : '启用后请选择一部小说分解数据集。'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </OrnateBorder>
                            </>
                        ) : (
                            <OrnateBorder className="p-6 md:p-7">
                                <div className="text-sm text-gray-300 leading-7">
                                    本次不额外指定关系侧重、开局切入或同人融合。系统将仅依据世界观、角色档案和既有硬约束自然生成开场。
                                </div>
                            </OrnateBorder>
                        )}
                </div>
            )}

            {/* STEP 4: CONFIRMATION */}
            {step === 4 && (
                <div className="h-full flex flex-col items-center justify-start overflow-y-auto custom-scrollbar px-2 py-6 animate-fadeIn">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl md:text-3xl font-serif font-black text-wuxia-gold mb-2" style={{ fontFamily: 'var(--ui-页面标题-font-family, inherit)', fontSize: 'var(--ui-页面标题-font-size, 32px)' }}>天道既定</h2>
                        <p className="text-gray-400 text-xs md:text-sm" style={{ fontFamily: 'var(--ui-辅助文本-font-family, inherit)', fontSize: 'var(--ui-辅助文本-font-size, 12px)' }}>一切准备就绪，即将推演这方世界。</p>
                    </div>

                    <OrnateBorder className="max-w-lg w-full p-4 md:p-6">
                        <div className="text-xs md:text-sm space-y-2 font-mono text-gray-300">
                            <p>世界: <span className="text-white">{worldConfig.worldName}</span></p>
                            <p>时代: <span className="text-white">{(() => { const eraId = worldConfig.时代配置ID || 'era_ancient_wuxia'; const cfg = 全部时代配置.find(c => c.id === eraId); if (cfg) return cfg.名称; const node = allEraNodes.find(n => n.id === eraId); return node?.name || '古代武侠'; })()}</span></p>
                            <p>难度: <span className="text-white uppercase">{worldConfig.difficulty}</span></p>
                            <p>世界观额外要求: <span className="text-white">{worldConfig.worldExtraRequirement.trim() || '无'}</span></p>
                            <p>手动世界观提示词: <span className="text-white">{worldConfig.manualWorldPrompt.trim() ? '已提供' : '未提供'}</span></p>
                            <p>手动境界提示词: <span className="text-white">{worldConfig.manualRealmPrompt.trim() ? '已提供' : '未提供'}</span></p>
                            <p>主角: <span className="text-white">{charName.trim() || '未填写姓名'}</span> <span className='text-gray-500'>({charGender.trim() || '未填写性别'}, {charAge}岁)</span></p>
                            <p>外貌: <span className="text-white">{charAppearance.trim() || '未填写'}</span></p>
                            <p>性格: <span className="text-white">{charPersonality.trim() || '未填写'}</span></p>
                            <p>身份: <span className="text-white">{selectedBackground.名称}</span></p>
                            <p>天赋: <span className="text-white">{selectedTalents.map(t => t.名称).join(', ') || '无'}</span></p>
                            <p>气运: <span className="text-white">{selectedQiyun.length > 0 ? selectedQiyun.map(q => q.名称).join(', ') : '无'}</span></p>
                            <p>开局配置: <span className="text-white">{openingConfigEnabled ? '已启用' : '未启用'}</span></p>
                            <p>关系侧重: <span className="text-white">{openingConfigEnabled ? (openingConfig.关系侧重.join('、') || '无') : '未设置'}</span></p>
                            <p>开局切入: <span className="text-white">{openingConfigEnabled ? openingConfig.开局切入偏好 : '未设置'}</span></p>
                            <p>同人融合: <span className="text-white">{openingConfigEnabled ? (openingConfig.同人融合.enabled ? `${openingConfig.同人融合.作品名 || '未命名作品'} / ${openingConfig.同人融合.融合强度}` : '关闭') : '未设置'}</span></p>
                            <p>角色替换: <span className="text-white">{openingConfigEnabled ? (openingConfig.同人融合.启用角色替换 ? (格式化角色替换规则摘要(当前角色替换规则列表) || '未填写规则') : '关闭') : '未设置'}</span></p>
                            <p>附加小说: <span className="text-white">{openingConfigEnabled ? (openingConfig.同人融合.启用附加小说 ? (当前附加小说数据集?.作品名 || 当前附加小说数据集?.标题 || '未选择数据集') : '关闭') : '未设置'}</span></p>
                        </div>
                    </OrnateBorder>

                    <OrnateBorder className="w-full max-w-lg p-3 md:p-4">
                        <div className="space-y-2">
                            <div className="text-xs text-gray-300 font-bold tracking-widest">开局额外要求（可选）</div>
                            <div className="text-[11px] text-gray-500">会随开局任务一起发送给模型，仅影响本次开局生成。</div>
                            <textarea
                                value={openingExtraRequirement}
                                onChange={(e) => setOpeningExtraRequirement(e.target.value)}
                                placeholder="例如：开局先走日常线，不要直接爆发战斗；先铺垫家族关系。"
                                className="w-full h-24 bg-black/40 border border-gray-700 rounded-md p-3 text-xs text-gray-200 resize-none outline-none focus:border-wuxia-gold/50"
                            />
                        </div>
                    </OrnateBorder>

                    <OrnateBorder className="w-full max-w-lg p-3 md:p-4">
                        <div className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="text-xs text-gray-300 font-bold tracking-widest">保存为自定义开局方案</div>
                                    <div className="text-[11px] text-gray-500 mt-1">这里会保留当前侠客名录页已经调整过的姓名、性别、年龄、外貌、性格、背景、天赋和开局要求。</div>
                                </div>
                                <GameButton
                                    onClick={() => {
                                        if (showCustomPresetEditor) { 重置自定义开局预设编辑(); return; }
                                        setShowCustomPresetEditor(true);
                                    }}
                                    variant="secondary"
                                    className="px-4 py-2 text-xs shrink-0"
                                >
                                    {showCustomPresetEditor ? '收起编辑器' : '保存当前方案'}
                                </GameButton>
                            </div>

                            {showCustomPresetEditor && (
                                <div className="rounded-2xl border border-wuxia-cyan/25 bg-black/30 p-4 space-y-3">
                                    <input
                                        type="text"
                                        placeholder="方案名称"
                                        value={customPresetMeta.名称}
                                        onChange={(e) => setCustomPresetMeta(prev => ({ ...prev, 名称: e.target.value }))}
                                        className="w-full bg-black/50 border-2 border-transparent focus:border-wuxia-cyan p-3 text-white outline-none rounded-md transition-all"
                                    />
                                    <textarea
                                        placeholder="方案简介：说明这套开局适合什么节奏、主题或路线"
                                        value={customPresetMeta.简介}
                                        onChange={(e) => setCustomPresetMeta(prev => ({ ...prev, 简介: e.target.value }))}
                                        className="w-full h-24 bg-black/50 border-2 border-transparent focus:border-wuxia-cyan p-3 text-sm text-white outline-none rounded-md transition-all resize-none"
                                    />
                                    <div className="flex gap-2">
                                        <GameButton onClick={() => { void 保存当前为自定义开局方案(); }} variant="secondary" className="flex-1 py-2 text-xs">
                                            {正在编辑开局预设ID ? '保存方案修改' : '保存自定义方案'}
                                        </GameButton>
                                        <GameButton onClick={重置自定义开局预设编辑} variant="secondary" className="px-4 py-2 text-xs opacity-80">
                                            取消
                                        </GameButton>
                                    </div>
                                </div>
                            )}
                        </div>
                    </OrnateBorder>

                    {自定义开局预设列表.length > 0 && (
                        <OrnateBorder className="w-full max-w-lg p-3 md:p-4">
                            <div className="space-y-3">
                                <div className="text-xs text-gray-300 font-bold tracking-widest">已保存的开局方案</div>
                                <div className="space-y-2 max-h-[240px] md:max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
                                    {自定义开局预设列表.map((preset) => (
                                        <div
                                            key={preset.id}
                                            className="rounded-xl border border-gray-800 bg-black/30 px-4 py-3 flex items-center justify-between gap-3"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm text-gray-200 truncate">{preset.名称}</div>
                                                {preset.简介 && (
                                                    <div className="text-[11px] text-gray-500 truncate">{preset.简介}</div>
                                                )}
                                                <div className="text-[11px] text-gray-600 mt-1">
                                                    世界: {preset.worldConfig?.worldName || '未命名'}
                                                    {preset.character?.姓名 ? ` · 角色: ${preset.character.姓名}` : ''}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => 应用预设到表单(preset)}
                                                    className="text-[11px] text-wuxia-gold hover:text-white"
                                                >
                                                    使用
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => 编辑自定义开局方案信息(preset)}
                                                    className="text-[11px] text-wuxia-cyan hover:text-white"
                                                >
                                                    编辑
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => 用当前配置覆盖开局方案(preset)}
                                                    className="text-[11px] text-amber-400 hover:text-white"
                                                >
                                                    覆盖
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { void 删除自定义开局方案(preset.id); }}
                                                    className="text-[11px] text-red-400 hover:text-red-200"
                                                >
                                                    删除
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </OrnateBorder>
                    )}

                    <div className="hidden md:flex flex-col gap-3 w-full max-w-lg mt-4 mb-2">
                        <GameButton onClick={() => { void handleGenerate(); }} variant="primary" className="w-full py-4 text-lg" disabled={loading}>
                            {loading ? '生成中...' : '一键生成 (世界+剧情)'}
                        </GameButton>
                    </div>
                </div>
            )}
        </>
    );
};
