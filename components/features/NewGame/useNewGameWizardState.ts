import { useEffect, useMemo, useRef, useState } from 'react';
import * as dbService from '../../../services/dbService';
import { 读取小说拆分数据集列表 } from '../../../services/novel-decomposition/novelDecompositionStore';
import { randomQiyun, 气运数据, 气运数据列表 } from '../../../data/qiyun';
import { 预设天赋, 预设背景 } from '../../../data/presets';
import { resolveEraNode } from '../../../models/eraTheme';
import { 开局预设方案结构 } from '../../../data/newGamePresets';
import { 获取子纪元默认预设, 子纪元默认预设结构 } from '../../../data/subEraDefaultPresets';
import { OpeningConfig, WorldGenConfig, 小说拆分数据集结构, 角色数据结构, 天赋结构, 背景结构, 游戏难度 } from '../../../types';
import { 合并去重开局预设方案, 标准化开局预设方案, 生成自定义开局预设ID, 自定义开局预设存储键 } from '../../../utils/customNewGamePresets';
import {
    关系侧重选项,
    同人来源类型选项,
    同人融合强度选项,
    开局切入偏好选项,
    属性最大值,
    属性最小值,
    创建默认属性分配,
    新开局步骤列表,
    默认开局配置,
    获取难度总属性点,
    获取同人角色替换规则列表,
    格式化角色替换规则摘要,
    规范化开局配置,
    规范化可选开局配置
} from '../../../utils/openingConfig';
import { 默认境界母板提示词 } from '../../../prompts/runtime/fandom';
import { 设置键 } from '../../../utils/settingsSchema';
import { 内置时代配置, 获取时代背景 } from '../../../models/system';
import { 时代主题方案列表, 获取时代主题方案 } from '../../../models/eraTheme';
import { 体系类型 } from '../../../types';

// --- Constants ---
const STEPS = [...新开局步骤列表];
const 自定义天赋存储键 = 设置键.自定义天赋;
const 自定义背景存储键 = 设置键.自定义背景;

// --- Types ---
type 自定义开局预设元信息 = { 名称: string; 简介: string };
type 属性结构 = { 力量: number; 敏捷: number; 体质: number; 根骨: number; 悟性: number; 福源: number };

// --- Hook interface ---
interface UseNewGameWizardStateProps {
    onComplete: (
        worldConfig: WorldGenConfig,
        charData: 角色数据结构,
        openingConfig: OpeningConfig | undefined,
        mode: 'all' | 'step',
        openingStreaming: boolean,
        openingExtraPrompt?: string
    ) => void;
    onCancel: () => void;
    loading: boolean;
    currentEra?: string;
    requestConfirm?: (options: { title?: string; message: string; confirmText?: string; cancelText?: string; danger?: boolean }) => Promise<boolean>;
}

export type UseNewGameWizardStateReturn = ReturnType<typeof useNewGameWizardState>;

export function useNewGameWizardState({ onComplete, onCancel, loading, currentEra, requestConfirm }: UseNewGameWizardStateProps) {
    // --- State: World Config ---
    const [worldConfig, setWorldConfig] = useState<WorldGenConfig>(() => {
        const initialEra = currentEra || 'ancient_eastern_wuxia';
        const era = 内置时代配置.find(c => c.id === initialEra);
        return {
            worldName: '太古界',
            worldSize: era?.默认世界版图 ?? '九州宏大',
            dynastySetting: era?.默认王朝占位符 ?? '群雄逐鹿，王朝末年',
            sectDensity: era?.默认组织密度 ?? '林立',
            tianjiaoSetting: era?.默认天骄占位符 ?? '大争之世，天骄并起',
            武力等级: era?.默认武力等级 ?? '中武',
            nsfw场景类型: '无',
            能力类型: era?.默认能力类型 ?? '传统武侠',
            超能力分类: '未觉醒',
            觉醒程度: '未觉醒',
            时代配置ID: initialEra,
            worldExtraRequirement: '',
            manualWorldPrompt: '',
            manualRealmPrompt: '',
            difficulty: 'normal' as 游戏难度
        };
    });

    // Sync global era setting into wizard world config, applying era defaults
    useEffect(() => {
        if (!currentEra || typeof currentEra !== 'string') return;
        const era = 内置时代配置.find(c => c.id === currentEra);
        if (!era) return;
        setWorldConfig(prev => {
            if (prev.时代配置ID === currentEra) return prev;
            return {
                ...prev,
                时代配置ID: currentEra,
                能力类型: era.默认能力类型 ?? prev.能力类型,
                武力等级: era.默认武力等级 ?? prev.武力等级,
                worldSize: era.默认世界版图 ?? prev.worldSize,
                sectDensity: era.默认组织密度 ?? prev.sectDensity,
                dynastySetting: era.默认王朝占位符 ?? prev.dynastySetting,
                tianjiaoSetting: era.默认天骄占位符 ?? prev.tianjiaoSetting,
            };
        });
        // 同步古代体系选择：如果当前体系不在新时代的支持列表中，重置为第一个有效值
        if (Array.isArray(era.支持体系) && era.支持体系.length > 0) {
            设置古代体系选择(prev => {
                if (era.支持体系.includes(prev)) return prev;
                return era.支持体系[0];
            });
        }
    }, [currentEra]);

    // 子纪元里模式开关：默认开启，用户可手动关闭

    const [selectedQiyun, setSelectedQiyun] = useState<气运数据[]>([]);

    // --- State: Character Config ---
    const [charName, setCharName] = useState('');
    const [charGender, setCharGender] = useState('男');
    const [charAge, setCharAge] = useState(18);
    const [charAppearance, setCharAppearance] = useState('黑发黑眸，面容清秀，衣着朴素利落。');
    const [charPersonality, setCharPersonality] = useState('外冷内热，谨慎克制，遇事先观察再出手。');
    const [birthMonth, setBirthMonth] = useState(1);
    const [birthDay, setBirthDay] = useState(1);
    const [monthOpen, setMonthOpen] = useState(false);
    const [dayOpen, setDayOpen] = useState(false);
    const monthRef = useRef<HTMLDivElement>(null);
    const dayRef = useRef<HTMLDivElement>(null);
    const manualWorldPromptInputRef = useRef<HTMLInputElement>(null);
    const manualRealmPromptInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState(0);
    const [stats, setStats] = useState<属性结构>(创建默认属性分配);
    const [openingConfig, setOpeningConfig] = useState<OpeningConfig>(默认开局配置);
    const [openingConfigEnabled, setOpeningConfigEnabled] = useState(false);
    const [showEraSelector, setShowEraSelector] = useState(false);

    // Talents & Background
    const [selectedBackground, setSelectedBackground] = useState<背景结构>(预设背景[0]);
    const [selectedTalents, setSelectedTalents] = useState<天赋结构[]>([]);
    const [自定义天赋列表, 设置自定义天赋列表] = useState<天赋结构[]>([]);
    const [自定义背景列表, 设置自定义背景列表] = useState<背景结构[]>([]);
    const [自定义开局预设列表, 设置自定义开局预设列表] = useState<开局预设方案结构[]>([]);
    const [小说拆分数据集列表, 设置小说拆分数据集列表] = useState<小说拆分数据集结构[]>([]);
    const [成人内容开启, 设置成人内容开启] = useState(false);
    const [子纪元里模式开启, 设置子纪元里模式开启] = useState(true);
    const [古代体系选择, 设置古代体系选择] = useState<体系类型>('武侠');

    // Search & filter
    const [背景搜索词, set背景搜索词] = useState('');
    const [天赋搜索词, set天赋搜索词] = useState('');
    const [气运搜索词, set气运搜索词] = useState('');
    const [气运类别过滤, set气运类别过滤] = useState<import('../../../data/qiyun').气运类别 | null>(null);
    const [气运稀有度过滤, set气运稀有度过滤] = useState<import('../../../data/qiyun').气运稀有度 | null>(null);

    // Custom Inputs
    const [customTalent, setCustomTalent] = useState<天赋结构>({ 名称: '', 描述: '', 效果: '' });
    const [showCustomTalent, setShowCustomTalent] = useState(false);
    const [正在编辑天赋名, set正在编辑天赋名] = useState('');
    const [customBackground, setCustomBackground] = useState<背景结构>({ 名称: '', 描述: '', 效果: '' });
    const [showCustomBackground, setShowCustomBackground] = useState(false);
    const [正在编辑背景名, set正在编辑背景名] = useState('');
    const [showCustomPresetEditor, setShowCustomPresetEditor] = useState(false);
    const [正在编辑开局预设ID, set正在编辑开局预设ID] = useState('');
    const [customPresetMeta, setCustomPresetMeta] = useState<自定义开局预设元信息>({ 名称: '', 简介: '' });
    const [openingExtraRequirement, setOpeningExtraRequirement] = useState('');

    // --- Logic: Helpers ---
    const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
    const dayOptions = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);

    const 选择气运类别 = (v: string | null) => set气运类别过滤(v as import('../../../data/qiyun').气运类别 | null);
    const 选择气运稀有度 = (v: string | null) => set气运稀有度过滤(v as import('../../../data/qiyun').气运稀有度 | null);

    const 标准化天赋 = (raw: 天赋结构): 天赋结构 | null => {
        const 名称 = raw?.名称?.trim() || '';
        const 描述 = raw?.描述?.trim() || '';
        const 效果 = raw?.效果?.trim() || '';
        if (!名称 || !描述 || !效果) return null;
        return { 名称, 描述, 效果 };
    };
    const 标准化背景 = (raw: 背景结构): 背景结构 | null => {
        const 名称 = raw?.名称?.trim() || '';
        const 描述 = raw?.描述?.trim() || '';
        const 效果 = raw?.效果?.trim() || '';
        if (!名称 || !描述 || !效果) return null;
        return { 名称, 描述, 效果 };
    };
    const 合并去重天赋 = (rawList: 天赋结构[]): 天赋结构[] => {
        const map = new Map<string, 天赋结构>();
        rawList.forEach((item) => {
            const normalized = 标准化天赋(item);
            if (!normalized) return;
            map.set(normalized.名称, normalized);
        });
        return Array.from(map.values());
    };
    const 合并去重背景 = (rawList: 背景结构[]): 背景结构[] => {
        const map = new Map<string, 背景结构>();
        rawList.forEach((item) => {
            const normalized = 标准化背景(item);
            if (!normalized) return;
            map.set(normalized.名称, normalized);
        });
        return Array.from(map.values());
    };

    const 当前时代背景 = useMemo(() => 获取时代背景(worldConfig.时代配置ID), [worldConfig.时代配置ID]);

    const 匹配时代 = (item: { 时代适配?: string[], 子纪元适配?: string[] }) => {
        // 子纪元精确匹配优先
        if (item.子纪元适配 && item.子纪元适配.length > 0) {
            return item.子纪元适配.includes(worldConfig.时代配置ID || '');
        }
        // 回退到时代大类匹配
        return !item.时代适配 || item.时代适配.length === 0 || (当前时代背景 && item.时代适配.includes(当前时代背景));
    };

    const 当前子纪元默认预设 = useMemo((): 子纪元默认预设结构 | undefined => {
        return 获取子纪元默认预设(worldConfig.时代配置ID || '');
    }, [worldConfig.时代配置ID]);

    const 应用子纪元默认预设 = (preset: 子纪元默认预设结构) => {
        const bg = 根据名称查找背景(preset.背景名称);
        const talents = 根据名称查找天赋列表(preset.天赋名称列表);
        const qiyunList = (preset.气运名称列表 || [])
            .map((名称) => 气运数据列表.find(q => q.名称 === 名称))
            .filter((q): q is 气运数据 => Boolean(q));
        setSelectedBackground(bg);
        setSelectedTalents(talents);
        setSelectedQiyun(qiyunList);
    };

    const 全部背景选项 = useMemo(() => {
        const combined = [...预设背景, ...自定义背景列表.filter(item => !预设背景.some(p => p.名称 === item.名称))];
        return combined.filter(item =>
            (!item.适用性别 || item.适用性别 === charGender) &&
            (item.nsfw !== true || worldConfig.nsfw场景类型 !== '无') &&
            匹配时代(item)
        );
    }, [自定义背景列表, charGender, worldConfig.nsfw场景类型, 当前时代背景]);

    const 全部天赋选项 = useMemo(() => {
        const combined = [...预设天赋, ...自定义天赋列表.filter(item => !预设天赋.some(p => p.名称 === item.名称))];
        return combined.filter(item =>
            (!item.适用性别 || item.适用性别 === charGender) &&
            (item.nsfw !== true || worldConfig.nsfw场景类型 !== '无') &&
            匹配时代(item)
        );
    }, [自定义天赋列表, charGender, worldConfig.nsfw场景类型, 当前时代背景]);

    const 全部气运选项 = useMemo(() => {
        return 气运数据列表.filter(item => {
            const nsfwOk = item.nsfw等级 !== undefined && item.nsfw等级 > 0
                ? worldConfig.nsfw场景类型 !== '无'
                : true;
            return nsfwOk && 匹配时代(item);
        });
    }, [worldConfig.nsfw场景类型, 当前时代背景]);

    const 过滤匹配 = (文本: string, 搜索词: string): boolean => {
        if (!搜索词) return true;
        return 文本.includes(搜索词);
    };

    const 过滤后背景选项 = useMemo(() => {
        return 全部背景选项.filter(item =>
            过滤匹配(item.名称, 背景搜索词) || 过滤匹配(item.描述, 背景搜索词) || 过滤匹配(item.效果, 背景搜索词)
        );
    }, [全部背景选项, 背景搜索词]);

    const 过滤后天赋选项 = useMemo(() => {
        return 全部天赋选项.filter(item =>
            过滤匹配(item.名称, 天赋搜索词) || 过滤匹配(item.描述, 天赋搜索词) || 过滤匹配(item.效果, 天赋搜索词)
        );
    }, [全部天赋选项, 天赋搜索词]);

    const 过滤后气运选项 = useMemo(() => {
        return 全部气运选项.filter(item => {
            const 名称匹配 = 过滤匹配(item.名称, 气运搜索词);
            const 描述匹配 = 过滤匹配(item.描述, 气运搜索词);
            const 搜索通过 = 名称匹配 || 描述匹配;
            const 类别通过 = !气运类别过滤 || item.类别 === 气运类别过滤;
            const 稀有度通过 = !气运稀有度过滤 || item.稀有度 === 气运稀有度过滤;
            return 搜索通过 && 类别通过 && 稀有度通过;
        });
    }, [全部气运选项, 气运搜索词, 气运类别过滤, 气运稀有度过滤]);

    const 重置自定义天赋编辑 = () => {
        setCustomTalent({ 名称: '', 描述: '', 效果: '' });
        set正在编辑天赋名('');
        setShowCustomTalent(false);
    };
    const 重置自定义背景编辑 = () => {
        setCustomBackground({ 名称: '', 描述: '', 效果: '' });
        set正在编辑背景名('');
        setShowCustomBackground(false);
    };
    const 重置自定义开局预设编辑 = () => {
        setCustomPresetMeta({ 名称: '', 简介: '' });
        set正在编辑开局预设ID('');
        setShowCustomPresetEditor(false);
    };
    const 根据名称查找背景 = (名称: string): 背景结构 => {
        const hit = [...预设背景, ...自定义背景列表].find(item => item.名称 === 名称);
        return hit || 预设背景[0];
    };
    const 根据名称查找天赋列表 = (名称列表: string[]): 天赋结构[] => (
        名称列表
            .map((名称) => [...预设天赋, ...自定义天赋列表].find(item => item.名称 === 名称))
            .filter((item): item is 天赋结构 => Boolean(item))
            .slice(0, 3)
    );

    const 构建角色数据 = (params?: {
        角色名?: string;
        性别?: string;
        年龄?: number;
        外貌?: string;
        性格?: string;
        出生月?: number;
        出生日?: number;
        属性?: 属性结构;
        背景?: 背景结构;
        天赋列表?: 天赋结构[];
        气运列表?: 气运数据[];
    }): 角色数据结构 => {
        const 最终属性 = params?.属性 || stats;
        const 最终年龄 = params?.年龄 ?? charAge;
        const 初始境界层级 = 1;
        const 初始境界名称 = '';
        const 初始升级经验 = Math.floor(
            110 + 初始境界层级 * 24
            + Math.max(0, 初始境界层级 - 4) * 10
            + Math.max(0, 初始境界层级 - 8) * 12
            + Math.max(0, 初始境界层级 - 12) * 16
            + Math.max(0, 初始境界层级 - 16) * 20
            + Math.max(0, 初始境界层级 - 20) * 26
            + Math.max(0, 初始境界层级 - 24) * 34
            + Math.max(0, 初始境界层级 - 27) * 42
            + Math.max(0, 初始境界层级 - 33) * 56
        );
        const 最大精力 = Math.floor(
            36 + 最终属性.体质 * 6.2 + 最终属性.根骨 * 3.4
            + 初始境界层级 * 5.2
            + Math.max(0, 初始境界层级 - 4) * 2.2
            + Math.max(0, 初始境界层级 - 8) * 2.6
            + Math.max(0, 初始境界层级 - 12) * 3.1
            + Math.max(0, 初始境界层级 - 16) * 3.8
            + Math.max(0, 初始境界层级 - 20) * 4.8
            + Math.max(0, 初始境界层级 - 24) * 6.0
            + Math.max(0, 初始境界层级 - 27) * 7.2
            + Math.max(0, 初始境界层级 - 33) * 9.0
        );
        const 最大内力 = Math.floor(
            18 + 最终属性.根骨 * 7.4 + 最终属性.悟性 * 6.6
            + 初始境界层级 * 6.0
            + Math.max(0, 初始境界层级 - 4) * 2.6
            + Math.max(0, 初始境界层级 - 8) * 3.2
            + Math.max(0, 初始境界层级 - 12) * 4.0
            + Math.max(0, 初始境界层级 - 16) * 5.0
            + Math.max(0, 初始境界层级 - 20) * 6.4
            + Math.max(0, 初始境界层级 - 24) * 8.2
            + Math.max(0, 初始境界层级 - 27) * 9.6
            + Math.max(0, 初始境界层级 - 33) * 12.0
        );
        const 最大饱腹 = Math.floor(
            72 + 最终属性.体质 * 2.2 + 最终属性.力量 * 1.2
            + 初始境界层级 * 2.8
            + Math.max(0, 初始境界层级 - 4) * 0.7
            + Math.max(0, 初始境界层级 - 8) * 0.8
            + Math.max(0, 初始境界层级 - 12) * 1.0
            + Math.max(0, 初始境界层级 - 16) * 1.2
            + Math.max(0, 初始境界层级 - 20) * 1.5
            + Math.max(0, 初始境界层级 - 24) * 1.9
            + Math.max(0, 初始境界层级 - 27) * 2.2
            + Math.max(0, 初始境界层级 - 33) * 2.8
        );
        const 最大口渴 = Math.floor(
            72 + 最终属性.体质 * 2.1 + 最终属性.根骨 * 1.3
            + 初始境界层级 * 2.8
            + Math.max(0, 初始境界层级 - 4) * 0.7
            + Math.max(0, 初始境界层级 - 8) * 0.8
            + Math.max(0, 初始境界层级 - 12) * 1.0
            + Math.max(0, 初始境界层级 - 16) * 1.2
            + Math.max(0, 初始境界层级 - 20) * 1.5
            + Math.max(0, 初始境界层级 - 24) * 1.9
            + Math.max(0, 初始境界层级 - 27) * 2.2
            + Math.max(0, 初始境界层级 - 33) * 2.8
        );
        const 最大负重 = Math.floor(
            82 + 最终属性.力量 * 10.5 + 最终属性.体质 * 2.4
            + 初始境界层级 * 2.4
            + Math.max(0, 初始境界层级 - 4) * 1.2
            + Math.max(0, 初始境界层级 - 8) * 1.4
            + Math.max(0, 初始境界层级 - 12) * 1.8
            + Math.max(0, 初始境界层级 - 16) * 2.2
            + Math.max(0, 初始境界层级 - 20) * 2.8
            + Math.max(0, 初始境界层级 - 24) * 3.5
            + Math.max(0, 初始境界层级 - 27) * 4.0
            + Math.max(0, 初始境界层级 - 33) * 5.0
        );
        const 当前精力 = 最大精力;
        const 当前内力 = Math.floor(最大内力 * 0.9);
        const 当前饱腹 = Math.floor(最大饱腹 * 0.8);
        const 当前口渴 = Math.floor(最大口渴 * 0.8);
        const 总最大血量 = Math.floor(
            92 + 最终属性.体质 * 5.2 + 最终属性.根骨 * 3.0 + 最终属性.力量 * 1.6
            + 初始境界层级 * 5.0
            + Math.max(0, 初始境界层级 - 4) * 2.4
            + Math.max(0, 初始境界层级 - 8) * 2.8
            + Math.max(0, 初始境界层级 - 12) * 3.4
            + Math.max(0, 初始境界层级 - 16) * 4.2
            + Math.max(0, 初始境界层级 - 20) * 5.2
            + Math.max(0, 初始境界层级 - 24) * 6.6
            + Math.max(0, 初始境界层级 - 27) * 7.8
            + Math.max(0, 初始境界层级 - 33) * 9.8
        );
        const 头部最大血量 = Math.round(总最大血量 * 0.15);
        const 胸部最大血量 = Math.round(总最大血量 * 0.22);
        const 腹部最大血量 = Math.round(总最大血量 * 0.20);
        const 左手最大血量 = Math.round(总最大血量 * 0.11);
        const 右手最大血量 = Math.round(总最大血量 * 0.11);
        const 左腿最大血量 = Math.round(总最大血量 * 0.105);
        const 右腿最大血量 = Math.max(
            1,
            总最大血量 - 头部最大血量 - 胸部最大血量 - 腹部最大血量 - 左手最大血量 - 右手最大血量 - 左腿最大血量
        );

        return {
            出生日期: `${params?.出生月 ?? birthMonth}月${params?.出生日 ?? birthDay}日`,
            ...(最终属性 as any),
            姓名: (params?.角色名 ?? charName).trim(),
            性别: (params?.性别 ?? charGender).trim() || '未设定',
            年龄: 最终年龄,
            外貌: (params?.外貌 ?? charAppearance).trim() || '相貌平常，衣着朴素。',
            性格: (params?.性格 ?? charPersonality).trim() || '未设定',
            天赋列表: params?.天赋列表 ?? selectedTalents,
            出身背景: params?.背景 ?? selectedBackground,
            气运列表: params?.气运列表 ?? selectedQiyun,
            称号: '初出茅庐', 境界: 初始境界名称, 境界层级: 初始境界层级,
            所属门派ID: 'none', 门派职位: '无', 门派贡献: 0,
            金钱: { 金元宝: 0, 银子: 0, 铜钱: 0 },
            当前精力, 最大精力,
            当前内力, 最大内力,
            当前饱腹, 最大饱腹,
            当前口渴, 最大口渴,
            当前负重: 0, 最大负重,
            头部当前血量: 头部最大血量, 头部最大血量, 头部状态: '正常',
            胸部当前血量: 胸部最大血量, 胸部最大血量, 胸部状态: '正常',
            腹部当前血量: 腹部最大血量, 腹部最大血量, 腹部状态: '正常',
            左手当前血量: 左手最大血量, 左手最大血量, 左手状态: '正常',
            右手当前血量: 右手最大血量, 右手最大血量, 右手状态: '正常',
            左腿当前血量: 左腿最大血量, 左腿最大血量, 左腿状态: '正常',
            右腿当前血量: 右腿最大血量, 右腿最大血量, 右腿状态: '正常',
            装备: { 头部: '无', 胸部: '无', 盔甲: '无', 内衬: '无', 腿部: '无', 手部: '无', 足部: '无', 主武器: '无', 副武器: '无', 暗器: '无', 背部: '无', 腰部: '无', 坐骑: '无' },
            物品列表: [], 功法列表: [],
            当前经验: 0, 升级经验: 初始升级经验, 玩家BUFF: [], 突破条件: [],
            ...(() => {
                if (!子纪元里模式开启) return {};
                const resolved = resolveEraNode(currentEra);
                const liModeName = resolved?.inherited.liMode?.name || '';
                if (liModeName.includes('武侠')) {
                    return { 武根: { 硬度: 10, 尺寸: 10, 精元储量: 50, 等级: '凡品' } };
                }
                if (liModeName.includes('志怪')) {
                    return { 妖根: { 灵脉: 10, 妖力: 10, 精怪亲和力: 10, 等级: '凡骨' }, 业障: 0, 功德: 0, 灵视能力: false, 已知道法: [] };
                }
                return {};
            })()
        };
    };

    const 应用预设到表单 = (preset: 开局预设方案结构) => {
        const nextWorldConfig: WorldGenConfig = { ...worldConfig, ...preset.worldConfig };
        const nextBackground = 根据名称查找背景(preset.character.背景名称);
        const nextTalents = 根据名称查找天赋列表(preset.character.天赋名称列表);
        setWorldConfig(nextWorldConfig);
        setCharName(preset.character.姓名);
        setCharGender(preset.character.性别);
        setCharAge(preset.character.年龄);
        setBirthMonth(preset.character.出生月);
        setBirthDay(preset.character.出生日);
        setCharAppearance(preset.character.外貌);
        setCharPersonality(preset.character.性格);
        setStats(preset.character.属性);
        setSelectedBackground(nextBackground);
        setSelectedTalents(nextTalents);
        const normalizedOpeningConfig = 规范化可选开局配置(preset.openingConfig);
        setOpeningConfigEnabled(Boolean(normalizedOpeningConfig));
        setOpeningConfig(normalizedOpeningConfig || 默认开局配置());
        setOpeningExtraRequirement(preset.openingExtraRequirement || '');
        setStep(1);
    };

    const 当前性别模式: '男' | '女' | '自定义' = charGender.trim() === '男' || charGender.trim() === '女'
        ? charGender.trim() as '男' | '女'
        : '自定义';

    const 选择性别 = (next: '男' | '女' | '自定义') => {
        if (next === '自定义') {
            setCharGender(prev => (prev.trim() === '男' || prev.trim() === '女') ? '' : prev);
            return;
        }
        setCharGender(next);
        setTimeout(() => {
            setSelectedBackground((prev) => {
                if (prev?.适用性别 && prev.适用性别 !== next) {
                    return 预设背景.find(b => !b.适用性别 || b.适用性别 === next) || 预设背景[0];
                }
                return prev;
            });
            setSelectedTalents((prev) => {
                const filtered = prev.filter(t => !t.适用性别 || t.适用性别 === next);
                if (filtered.length !== prev.length) {
                    return filtered;
                }
                return prev;
            });
        }, 0);
    };

    const totalStatBudget = useMemo(() => 获取难度总属性点(worldConfig.difficulty), [worldConfig.difficulty]);
    const usedPoints = Object.values(stats).reduce((a, b) => a + b, 0);
    const remainingPoints = totalStatBudget - usedPoints;
    const stepProgress = ((step + 1) / STEPS.length) * 100;
    const currentStepLabel = STEPS[step] || '创建';
    const selectedTalentNames = selectedTalents.map(item => item.名称);
    const 背景长期说明 = '背景代表长期身份资源、社会关系、风险来源与成长路径，不应只决定第一幕处境。';
    const 天赋说明 = '天赋代表长期倾向与修行适配，优先影响成长曲线、事件判定与路线优势。';

    const 当前附加小说数据集 = useMemo(
        () => 小说拆分数据集列表.find((item) => item.id === openingConfig.同人融合.附加小说数据集ID) || null,
        [openingConfig.同人融合.附加小说数据集ID, 小说拆分数据集列表]
    );
    const 当前角色替换规则列表 = useMemo(
        () => 获取同人角色替换规则列表(openingConfig, charName),
        [openingConfig, charName]
    );

    const 读取UTF8文本文件 = async (file: File): Promise<string> => (
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
            reader.onerror = () => reject(reader.error || new Error('读取文件失败'));
            reader.readAsText(file, 'utf-8');
        })
    );
    const 导出文本文件 = (filename: string, content: string) => {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    };
    const 导入手动提示词文件 = async (
        event: React.ChangeEvent<HTMLInputElement>,
        field: 'manualWorldPrompt' | 'manualRealmPrompt'
    ) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        try {
            const text = await 读取UTF8文本文件(file);
            setWorldConfig((prev) => ({ ...prev, [field]: text }));
        } catch (error: any) {
            alert(error?.message || '读取文件失败');
        }
    };
    const 导出手动世界观提示词 = () => {
        const content = worldConfig.manualWorldPrompt.trim();
        if (!content) { alert('当前没有可导出的手动世界观提示词。'); return; }
        导出文本文件(`${worldConfig.worldName || 'world'}-世界观提示词.txt`, content);
    };
    const 导出手动境界提示词 = () => {
        const content = worldConfig.manualRealmPrompt.trim();
        if (!content) { alert('当前没有可导出的手动境界提示词。'); return; }
        导出文本文件(`${worldConfig.worldName || 'world'}-境界提示词.txt`, content);
    };
    const 导出境界提示词模板 = () => {
        导出文本文件('境界提示词模板.txt', 默认境界母板提示词);
    };

    // --- Effects ---
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (monthRef.current && monthRef.current.contains(target)) return;
            if (dayRef.current && dayRef.current.contains(target)) return;
            setMonthOpen(false);
            setDayOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const 加载自定义建角配置 = async () => {
            try {
                const [savedTalents, savedBackgrounds, savedStartPresets, savedNovelDatasets, savedGameSettings] = await Promise.all([
                    dbService.读取设置(自定义天赋存储键),
                    dbService.读取设置(自定义背景存储键),
                    dbService.读取设置(自定义开局预设存储键),
                    读取小说拆分数据集列表(),
                    dbService.读取设置(设置键.游戏设置)
                ]);
                if (Array.isArray(savedTalents)) {
                    设置自定义天赋列表(合并去重天赋(savedTalents as 天赋结构[]));
                }
                if (Array.isArray(savedBackgrounds)) {
                    设置自定义背景列表(合并去重背景(savedBackgrounds as 背景结构[]));
                }
                if (Array.isArray(savedStartPresets)) {
                    设置自定义开局预设列表(合并去重开局预设方案(savedStartPresets.map(item => 标准化开局预设方案(item)).filter(Boolean) as 开局预设方案结构[]));
                }
                设置小说拆分数据集列表(savedNovelDatasets);
                if (savedGameSettings && typeof savedGameSettings === 'object') {
                    设置成人内容开启(savedGameSettings.成人内容 === true);
                    // 里武侠/里志怪已不再提供手动开关，统一由子纪元里模式自动推导
                    const loadedEra = currentEra || savedGameSettings.时代配置ID || '';
                    const savedLiModeMap = savedGameSettings.启用子纪元里模式;
                    const loadedLiMode = typeof savedLiModeMap === 'object'
                        ? savedLiModeMap?.[loadedEra]
                        : savedLiModeMap;
                    设置子纪元里模式开启(loadedLiMode !== false);
                    if (savedGameSettings.古代体系选择) 设置古代体系选择(savedGameSettings.古代体系选择 as 体系类型);
                }
            } catch (error) {
                console.error('加载自定义身份/天赋/开局方案失败', error);
            }
        };
        加载自定义建角配置();
    }, []);

    useEffect(() => {
        if (!openingConfig.同人融合.附加小说数据集ID) return;
        if (小说拆分数据集列表.some((item) => item.id === openingConfig.同人融合.附加小说数据集ID)) return;
        setOpeningConfig((prev) => ({
            ...prev,
            同人融合: { ...prev.同人融合, 启用附加小说: false, 附加小说数据集ID: '' }
        }));
    }, [openingConfig.同人融合.附加小说数据集ID, 小说拆分数据集列表]);

    // --- Handlers ---
    const handleStatChange = (key: keyof typeof stats, delta: number) => {
        const current = stats[key];
        if (delta > 0 && remainingPoints <= 0) return;
        if (delta < 0 && current <= 属性最小值) return;
        if (delta > 0 && current >= 属性最大值) return;
        setStats({ ...stats, [key]: current + delta });
    };

    const toggleRelationFocus = (value: OpeningConfig['关系侧重'][number]) => {
        setOpeningConfig((prev) => {
            const exists = prev.关系侧重.includes(value);
            if (exists) return { ...prev, 关系侧重: prev.关系侧重.filter((item) => item !== value) };
            if (prev.关系侧重.length >= 2) return prev;
            return { ...prev, 关系侧重: [...prev.关系侧重, value] };
        });
    };

    const 选择附加小说数据集 = (datasetId: string) => {
        const matched = 小说拆分数据集列表.find((item) => item.id === datasetId) || null;
        setOpeningConfig((prev) => ({
            ...prev,
            同人融合: {
                ...prev.同人融合,
                启用附加小说: Boolean(datasetId),
                附加小说数据集ID: datasetId,
                作品名: matched?.作品名 || matched?.标题 || prev.同人融合.作品名,
                来源类型: '小说'
            }
        }));
    };
    const 新增附加角色替换规则 = () => {
        setOpeningConfig((prev) => ({
            ...prev,
            同人融合: { ...prev.同人融合, 附加角色替换规则列表: [...prev.同人融合.附加角色替换规则列表, { 原名称: '', 替换为: '' }] }
        }));
    };
    const 更新附加角色替换规则 = (index: number, field: '原名称' | '替换为', value: string) => {
        setOpeningConfig((prev) => ({
            ...prev,
            同人融合: {
                ...prev.同人融合,
                附加角色替换规则列表: prev.同人融合.附加角色替换规则列表.map((rule, ruleIndex) =>
                    ruleIndex === index ? { ...rule, [field]: value } : rule
                )
            }
        }));
    };
    const 删除附加角色替换规则 = (index: number) => {
        setOpeningConfig((prev) => ({
            ...prev,
            同人融合: {
                ...prev.同人融合,
                附加角色替换规则列表: prev.同人融合.附加角色替换规则列表.filter((_, ruleIndex) => ruleIndex !== index)
            }
        }));
    };

    const 校验属性点是否合法 = (): boolean => {
        if (remainingPoints < 0) {
            alert(`当前属性总点数超过 ${worldConfig.difficulty.toUpperCase()} 难度上限，请先回收 ${Math.abs(remainingPoints)} 点。`);
            setStep(1);
            return false;
        }
        return true;
    };

    const handleNextStep = () => {
        if (step === 1 && !校验属性点是否合法()) return;
        setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    };

    const toggleTalent = (t: 天赋结构) => {
        if (selectedTalents.find(x => x.名称 === t.名称)) {
            setSelectedTalents(selectedTalents.filter(x => x.名称 !== t.名称));
        } else {
            if (selectedTalents.length >= 3) { alert("最多选择3个天赋"); return; }
            setSelectedTalents([...selectedTalents, t]);
        }
    };

    const toggleQiyun = (q: 气运数据) => {
        if (selectedQiyun.find(x => x.名称 === q.名称)) {
            setSelectedQiyun(selectedQiyun.filter(x => x.名称 !== q.名称));
        } else {
            if (selectedQiyun.length >= 3) return;
            setSelectedQiyun([...selectedQiyun, q]);
        }
    };

    const generateRandomQiyun = () => {
        const random = randomQiyun(3, { excludeNsfw: true, 成人内容开启 });
        if (random.length === 0) return;
        setSelectedQiyun(random);
    };

    const addCustomTalent = async () => {
        const normalized = 标准化天赋(customTalent);
        if (!normalized) { alert("请完整填写自定义天赋（名称/描述/效果）"); return; }
        if (预设天赋.some(item => item.名称 === normalized.名称) && 正在编辑天赋名 !== normalized.名称) {
            alert('该天赋名称与系统预设重复，请改名后保存。');
            return;
        }
        const 原名称 = 正在编辑天赋名 || normalized.名称;
        const 已选同名 = selectedTalents.some(x => x.名称 === 原名称 || x.名称 === normalized.名称);
        if (!已选同名 && selectedTalents.length >= 3) { alert("最多选择3个天赋"); return; }
        const 下一个自定义天赋列表 = 合并去重天赋([
            ...自定义天赋列表.filter(item => item.名称 !== 原名称 && item.名称 !== normalized.名称),
            normalized
        ]);
        设置自定义天赋列表(下一个自定义天赋列表);
        setSelectedTalents(prev => {
            const withoutOriginal = prev.filter(item => item.名称 !== 原名称 && item.名称 !== normalized.名称);
            return [...withoutOriginal, normalized];
        });
        重置自定义天赋编辑();
        try { await dbService.保存设置(自定义天赋存储键, 下一个自定义天赋列表); }
        catch (error) { console.error('保存自定义天赋失败', error); }
    };

    const addCustomBackground = async () => {
        const normalized = 标准化背景(customBackground);
        if (!normalized) { alert("请完整填写自定义身份（名称/描述/效果）"); return; }
        if (预设背景.some(item => item.名称 === normalized.名称) && 正在编辑背景名 !== normalized.名称) {
            alert('该身份名称与系统预设重复，请改名后保存。');
            return;
        }
        const 原名称 = 正在编辑背景名 || normalized.名称;
        const 下一个自定义背景列表 = 合并去重背景([
            ...自定义背景列表.filter(item => item.名称 !== 原名称 && item.名称 !== normalized.名称),
            normalized
        ]);
        设置自定义背景列表(下一个自定义背景列表);
        setSelectedBackground(normalized);
        重置自定义背景编辑();
        try { await dbService.保存设置(自定义背景存储键, 下一个自定义背景列表); }
        catch (error) { console.error('保存自定义身份失败', error); }
    };

    const 编辑自定义天赋 = (item: 天赋结构) => {
        setCustomTalent(item);
        set正在编辑天赋名(item.名称);
        setShowCustomTalent(true);
    };
    const 删除自定义天赋 = async (name: string) => {
        const nextList = 自定义天赋列表.filter(item => item.名称 !== name);
        设置自定义天赋列表(nextList);
        setSelectedTalents(prev => prev.filter(item => item.名称 !== name));
        if (正在编辑天赋名 === name) 重置自定义天赋编辑();
        try { await dbService.保存设置(自定义天赋存储键, nextList); }
        catch (error) { console.error('删除自定义天赋失败', error); }
    };
    const 编辑自定义背景 = (item: 背景结构) => {
        setCustomBackground(item);
        set正在编辑背景名(item.名称);
        setShowCustomBackground(true);
    };
    const 删除自定义背景 = async (name: string) => {
        const nextList = 自定义背景列表.filter(item => item.名称 !== name);
        设置自定义背景列表(nextList);
        if (selectedBackground.名称 === name) setSelectedBackground(预设背景[0]);
        if (正在编辑背景名 === name) 重置自定义背景编辑();
        try { await dbService.保存设置(自定义背景存储键, nextList); }
        catch (error) { console.error('删除自定义身份失败', error); }
    };

    const 构建当前表单开局预设 = (meta?: Partial<自定义开局预设元信息> & { id?: string }): 开局预设方案结构 => ({
        id: meta?.id || 正在编辑开局预设ID || 生成自定义开局预设ID(),
        名称: meta?.名称?.trim() || customPresetMeta.名称.trim(),
        简介: meta?.简介?.trim() || customPresetMeta.简介.trim() || '自定义开局方案',
        worldConfig: {
            ...worldConfig,
            worldExtraRequirement: worldConfig.worldExtraRequirement?.trim() || '',
            manualWorldPrompt: worldConfig.manualWorldPrompt?.trim() || '',
            manualRealmPrompt: worldConfig.manualRealmPrompt?.trim() || ''
        },
        character: {
            姓名: charName.trim(), 性别: charGender.trim(), 年龄: charAge,
            出生月: birthMonth, 出生日: birthDay,
            外貌: charAppearance.trim(), 性格: charPersonality.trim(),
            属性: { ...stats },
            背景名称: selectedBackground?.名称 || '',
            天赋名称列表: selectedTalents.map(item => item.名称).slice(0, 3),
            气运列表: selectedQiyun
        },
        openingConfig: openingConfigEnabled ? 规范化开局配置(openingConfig) : undefined,
        openingStreaming: true,
        openingExtraRequirement: openingExtraRequirement.trim()
    });

    const 保存自定义开局预设列表 = async (nextList: 开局预设方案结构[]) => {
        设置自定义开局预设列表(nextList);
        try { await dbService.保存设置(自定义开局预设存储键, nextList); }
        catch (error) { console.error('保存自定义开局方案失败', error); }
    };

    const 保存当前为自定义开局方案 = async () => {
        const 名称 = customPresetMeta.名称.trim();
        if (!名称) { alert('请先填写方案名称'); return; }
        const 目标ID = 正在编辑开局预设ID || '';
        const 名称冲突 = 自定义开局预设列表.some(item => item.名称 === 名称 && item.id !== 目标ID);
        if (名称冲突) { alert('该方案名称已存在，请改名后保存。'); return; }
        const nextPreset = 标准化开局预设方案(构建当前表单开局预设());
        if (!nextPreset) { alert('当前方案内容无效，无法保存。'); return; }
        const nextList = 合并去重开局预设方案([
            ...自定义开局预设列表.filter(item => item.id !== nextPreset.id),
            nextPreset
        ]);
        await 保存自定义开局预设列表(nextList);
        重置自定义开局预设编辑();
    };

    const 编辑自定义开局方案信息 = (preset: 开局预设方案结构) => {
        setCustomPresetMeta({ 名称: preset.名称, 简介: preset.简介 || '' });
        set正在编辑开局预设ID(preset.id);
        setShowCustomPresetEditor(true);
        setStep(4);
    };

    const 用当前配置覆盖开局方案 = async (preset: 开局预设方案结构) => {
        const nextPreset = 标准化开局预设方案(构建当前表单开局预设({
            id: preset.id, 名称: preset.名称, 简介: preset.简介
        }));
        if (!nextPreset) return;
        const nextList = 合并去重开局预设方案([
            ...自定义开局预设列表.filter(item => item.id !== preset.id),
            nextPreset
        ]);
        await 保存自定义开局预设列表(nextList);
    };

    const 删除自定义开局方案 = async (presetId: string) => {
        const nextList = 自定义开局预设列表.filter(item => item.id !== presetId);
        await 保存自定义开局预设列表(nextList);
        if (正在编辑开局预设ID === presetId) 重置自定义开局预设编辑();
    };

    const handleGenerate = async (preset?: 开局预设方案结构) => {
        const effectiveWorldConfig = preset ? { ...worldConfig, ...preset.worldConfig, 古代体系选择 } : { ...worldConfig, 古代体系选择 };
        const effectiveOpeningConfig = preset
            ? 规范化可选开局配置(preset.openingConfig)
            : (openingConfigEnabled ? 规范化开局配置(openingConfig) : undefined);
        const effectiveName = preset?.character.姓名 ?? charName;
        const effectiveGender = preset?.character.性别 ?? charGender;
        const effectiveRoleReplaceRules = 获取同人角色替换规则列表(effectiveOpeningConfig, effectiveName);
        if (!effectiveName.trim()) { alert("请先填写角色姓名"); setStep(1); return; }
        if (!effectiveGender.trim()) { alert("请先填写角色性别"); setStep(1); return; }
        if (!preset && !校验属性点是否合法()) return;
        if (effectiveOpeningConfig?.同人融合.enabled && !effectiveOpeningConfig.同人融合.作品名.trim()) {
            alert('已启用同人融合，请先填写作品名。'); setStep(3); return;
        }
        if (effectiveOpeningConfig?.同人融合.enabled && effectiveOpeningConfig.同人融合.启用附加小说 && !effectiveOpeningConfig.同人融合.附加小说数据集ID.trim()) {
            alert('已启用附加小说，请先选择一个小说分解数据集。'); setStep(3); return;
        }
        if (effectiveOpeningConfig?.同人融合.enabled && effectiveOpeningConfig.同人融合.启用角色替换 && effectiveRoleReplaceRules.length <= 0) {
            alert('已启用同人角色替换，请先填写至少一条有效替换规则。'); setStep(3); return;
        }
        const charData = preset
            ? 构建角色数据({
                角色名: preset.character.姓名, 性别: preset.character.性别,
                年龄: preset.character.年龄, 外貌: preset.character.外貌,
                性格: preset.character.性格, 出生月: preset.character.出生月,
                出生日: preset.character.出生日, 属性: preset.character.属性,
                背景: 根据名称查找背景(preset.character.背景名称),
                天赋列表: 根据名称查找天赋列表(preset.character.天赋名称列表),
                气运列表: Array.isArray(preset.character.气运列表) ? preset.character.气运列表 : undefined
            })
            : 构建角色数据();
        const effectiveOpeningExtraRequirement = preset?.openingExtraRequirement ?? openingExtraRequirement;
        const ok = requestConfirm
            ? await requestConfirm({ title: '确认创建', message: '开局将直接以流式方式生成并展示开场剧情。是否继续创建？', confirmText: '开始生成' })
            : true;
        if (!ok) return;
        // Persist 子纪元里模式开关到 IndexedDB，里武侠/里志怪由运行时自动推导
        try {
            const savedGameSettings = await dbService.读取设置(设置键.游戏设置) || {};
            const savedEra = currentEra || savedGameSettings.时代配置ID || '';
            const prev = typeof savedGameSettings.启用子纪元里模式 === 'object'
                ? savedGameSettings.启用子纪元里模式
                : {};
            await dbService.保存设置(设置键.游戏设置, { ...savedGameSettings, 时代配置ID: savedEra, 启用子纪元里模式: { ...prev, [savedEra]: 子纪元里模式开启 }, 古代体系选择 });
        } catch (error) {
            console.error('保存游戏设置失败', error);
        }
        onComplete(effectiveWorldConfig, charData, effectiveOpeningConfig, 'all', true, effectiveOpeningExtraRequirement.trim());
    };

    return {
        // State
        step, setStep,
        worldConfig, setWorldConfig,
        selectedQiyun, setSelectedQiyun,
        charName, setCharName, charGender, setCharGender, charAge, setCharAge,
        charAppearance, setCharAppearance, charPersonality, setCharPersonality,
        birthMonth, setBirthMonth, birthDay, setBirthDay,
        monthOpen, setMonthOpen, dayOpen, setDayOpen,
        monthRef, dayRef, manualWorldPromptInputRef, manualRealmPromptInputRef,
        stats, setStats,
        openingConfig, setOpeningConfig, openingConfigEnabled, setOpeningConfigEnabled,
        selectedBackground, setSelectedBackground,
        selectedTalents, setSelectedTalents,
        自定义天赋列表, 设置自定义天赋列表,
        自定义背景列表, 设置自定义背景列表,
        自定义开局预设列表, 设置自定义开局预设列表,
        小说拆分数据集列表, 设置小说拆分数据集列表,
        成人内容开启, 设置成人内容开启,
        子纪元里模式开启, 设置子纪元里模式开启,
        古代体系选择, 设置古代体系选择,
        customTalent, setCustomTalent, showCustomTalent, setShowCustomTalent,
        正在编辑天赋名, set正在编辑天赋名,
        customBackground, setCustomBackground, showCustomBackground, setShowCustomBackground,
        正在编辑背景名, set正在编辑背景名,
        showCustomPresetEditor, setShowCustomPresetEditor,
        正在编辑开局预设ID, set正在编辑开局预设ID,
        customPresetMeta, setCustomPresetMeta,
        openingExtraRequirement, setOpeningExtraRequirement,
        背景搜索词, set背景搜索词,
        天赋搜索词, set天赋搜索词,
        气运搜索词, set气运搜索词,
        气运类别过滤, set气运类别过滤,
        气运稀有度过滤, set气运稀有度过滤,
        选择气运类别, 选择气运稀有度,

        // Computed
        STEPS, monthOptions, dayOptions,
        全部背景选项, 全部天赋选项, 全部气运选项,
        过滤后背景选项, 过滤后天赋选项, 过滤后气运选项,
        当前子纪元默认预设,
        当前性别模式,
        totalStatBudget, usedPoints, remainingPoints,
        stepProgress, currentStepLabel, selectedTalentNames,
        背景长期说明, 天赋说明,
        当前附加小说数据集, 当前角色替换规则列表,

        // Handlers
        标准化天赋, 标准化背景, 合并去重天赋, 合并去重背景,
        重置自定义天赋编辑, 重置自定义背景编辑, 重置自定义开局预设编辑,
        根据名称查找背景, 根据名称查找天赋列表,
        构建角色数据, 应用预设到表单, 应用子纪元默认预设,
        选择性别, handleStatChange, toggleRelationFocus,
        选择附加小说数据集, 新增附加角色替换规则, 更新附加角色替换规则, 删除附加角色替换规则,
        校验属性点是否合法, handleNextStep,
        toggleTalent, toggleQiyun, generateRandomQiyun,
        addCustomTalent, addCustomBackground,
        编辑自定义天赋, 删除自定义天赋,
        编辑自定义背景, 删除自定义背景,
        构建当前表单开局预设,
        保存自定义开局预设列表, 保存当前为自定义开局方案,
        编辑自定义开局方案信息, 用当前配置覆盖开局方案, 删除自定义开局方案,
        handleGenerate,

        // EraSelector
        showEraSelector, setShowEraSelector,
        读取UTF8文本文件, 导出文本文件,
        导入手动提示词文件, 导出手动世界观提示词, 导出手动境界提示词, 导出境界提示词模板,

        // Props passthrough
        onCancel, loading,
    };
}
