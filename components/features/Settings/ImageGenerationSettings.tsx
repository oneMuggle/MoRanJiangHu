import React, { useEffect, useMemo, useState } from 'react';
import {
    接口设置结构,
    功能模型占位配置结构,
    单接口配置结构,
    画师串预设结构,
    画师串预设适用范围类型,
    词组转化器提示词预设结构,
    词组转化器提示词预设类型,
    PNG画风预设结构,
    文生图接口配置结构,
    文生图后端类型,
    文生图预设接口路径类型
} from '../../../types';
import GameButton from '../../ui/GameButton';
import ToggleSwitch from '../../ui/ToggleSwitch';
import InlineSelect from '../../ui/InlineSelect';
import { 规范化接口设置 } from '../../../utils/apiConfig';
import { 自动场景横屏尺寸选项, 自动场景竖屏尺寸选项 } from '../../../utils/imageSizeOptions';

interface Props {
    settings: 接口设置结构;
    onSave: (settings: 接口设置结构) => void;
}

type 生图模型字段 = '文生图模型使用模型' | '场景生图模型使用模型' | '主角生图模型使用模型' | '词组转化器使用模型' | 'PNG提炼使用模型';
type 设置分页 = 'basic' | 'provider' | 'transformer' | 'presets' | 'automation' | 'retry' | 'player';
type 画师串适用页签 = 'npc' | 'scene' | 'player';
type 词组预设页签 = 'nai' | 'npc' | 'scene' | 'player';

const 初始化模型列表 = (): Record<生图模型字段, string[]> => ({
    文生图模型使用模型: [],
    场景生图模型使用模型: [],
    主角生图模型使用模型: [],
    词组转化器使用模型: [],
    PNG提炼使用模型: []
});

const 初始化加载状态 = (): Record<生图模型字段, boolean> => ({
    文生图模型使用模型: false,
    场景生图模型使用模型: false,
    主角生图模型使用模型: false,
    词组转化器使用模型: false,
    PNG提炼使用模型: false
});

const 基础页面选项: Array<{ value: 设置分页; label: string }> = [
    { value: 'basic', label: '基础' },
    { value: 'provider', label: '接口设置' },
    { value: 'transformer', label: '转化器' },
    { value: 'presets', label: '预设管理' },
    { value: 'automation', label: '自动任务' },
    { value: 'retry', label: '重试设置' },
    { value: 'player', label: '主角' }
];

const 文生图后端选项: Array<{ value: 功能模型占位配置结构['文生图后端类型']; label: string }> = [
    { value: 'openai', label: 'OpenAI 兼容' },
    { value: 'grok', label: 'Grok (xAI)' },
    { value: 'novelai', label: 'NovelAI 官方' },
    { value: 'sd_webui', label: 'Stable Diffusion WebUI' },
    { value: 'comfyui', label: 'ComfyUI' }
];

const 接口路径模式选项: Array<{ value: 功能模型占位配置结构['文生图接口路径模式']; label: string }> = [
    { value: 'preset', label: '预设路径' },
    { value: 'custom', label: '自定义路径' }
];

const 预设路径选项映射: Record<功能模型占位配置结构['文生图后端类型'], Array<{
    value: 功能模型占位配置结构['文生图预设接口路径'];
    label: string;
}>> = {
    openai: [
        { value: 'openai_images', label: '/v1/images/generations' },
        { value: 'openai_chat', label: '/v1/chat/completions' }
    ],
    grok: [
        { value: 'openai_chat', label: '/v1/chat/completions' }
    ],
    novelai: [
        { value: 'novelai_generate', label: '/ai/generate-image' }
    ],
    sd_webui: [
        { value: 'sd_txt2img', label: '/sdapi/v1/txt2img' }
    ],
    comfyui: [
        { value: 'comfyui_prompt', label: '/prompt' }
    ]
};

const NovelAI模型建议 = ['nai-diffusion-4-5-full', 'nai-diffusion-4-5-curated', 'nai-diffusion-4-full'];
const NovelAI采样器选项: Array<{ value: 功能模型占位配置结构['NovelAI采样器']; label: string }> = [
    { value: 'k_euler_ancestral', label: 'Euler Ancestral' },
    { value: 'k_euler', label: 'Euler' },
    { value: 'k_dpmpp_2m', label: 'DPM++ 2M' },
    { value: 'k_dpmpp_2s_ancestral', label: 'DPM++ 2S Ancestral' },
    { value: 'k_dpmpp_sde', label: 'DPM++ SDE' },
    { value: 'k_dpmpp_2m_sde', label: 'DPM++ 2M SDE' }
];
const NovelAI噪点表选项: Array<{ value: 功能模型占位配置结构['NovelAI噪点表']; label: string }> = [
    { value: 'karras', label: 'Karras' },
    { value: 'native', label: 'Native' },
    { value: 'exponential', label: 'Exponential' },
    { value: 'polyexponential', label: 'Polyexponential' }
];

const 获取后端设置标签 = (backend: 功能模型占位配置结构['文生图后端类型']): string => {
    switch (backend) {
        case 'sd_webui':
            return 'WebUI 设置';
        case 'comfyui':
            return 'ComfyUI 设置';
        case 'novelai':
            return 'NovelAI 设置';
        case 'openai':
        default:
            return '后端设置';
    }
};

const 图片后端需要模型选择 = (backend: 功能模型占位配置结构['文生图后端类型']): boolean => {
    return backend === 'openai' || backend === 'grok' || backend === 'novelai';
};

const 图片后端需要鉴权 = (backend: 功能模型占位配置结构['文生图后端类型']): boolean => {
    return backend === 'openai' || backend === 'grok' || backend === 'novelai';
};

const ComfyUI工作流占位提示 = '__PROMPT__ / {{prompt}}，__NEGATIVE_PROMPT__ / {{negative_prompt}}，__WIDTH__ / {{width}}，__HEIGHT__ / {{height}}，__STEPS__ / {{steps}}，__CFG__ / {{cfg}}，__CFG_RESCALE__ / {{cfg_rescale}}，__SAMPLER__ / {{sampler}}，__SCHEDULER__ / {{scheduler}}，__SEED__ / {{seed}}，__SMEA__ / {{smea}}，__SMEA_DYN__ / {{smea_dyn}}';

const 页面容器样式 = 'rounded-2xl border border-fuchsia-500/20 bg-black/25 p-5 space-y-5';
const 卡片样式 = 'rounded-xl border border-white/10 bg-black/20 p-4 space-y-4';
const 标签样式 = 'text-sm font-bold text-fuchsia-200';

const 生成预设ID = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const 创建文生图配置模板 = (backend: 文生图后端类型): 文生图接口配置结构 => {
    const now = Date.now();
    return {
        id: 生成预设ID('img_api'),
        名称: `文生图配置 ${new Date(now).toLocaleTimeString()}`,
        后端类型: backend,
        模型: '',
        API地址: backend === 'novelai' ? 'https://image.novelai.net' : backend === 'grok' ? 'https://api.x.ai/v1' : '',
        API密钥: '',
        接口路径模式: 'preset',
        预设接口路径: 预设路径选项映射[backend][0]?.value || 'openai_images',
        自定义接口路径: '',
        响应格式: 'url',
        OpenAI自定义格式: false,
        ComfyUI工作流JSON: '',
        NovelAI启用自定义参数: false,
        NovelAI采样器: 'k_euler_ancestral',
        NovelAI噪点表: 'karras',
        NovelAI步数: 28,
        NovelAI负面提示词: '',
        createdAt: now,
        updatedAt: now
    };
};
const 创建空画师串预设 = (scope: 画师串适用页签): 画师串预设结构 => {
    const now = Date.now();
    return {
        id: 生成预设ID('artist_preset'),
        名称: scope === 'scene' ? '新建场景画师串' : scope === 'player' ? '新建主角画师串' : '新建NPC画师串',
        适用范围: scope as 画师串预设适用范围类型 || 'npc',
        画师串: '',
        正面提示词: '',
        负面提示词: '',
        createdAt: now,
        updatedAt: now
    };
};
const 创建空词组预设 = (scope: 词组预设页签): 词组转化器提示词预设结构 => {
    const now = Date.now();
    return {
        id: 生成预设ID('transformer_preset'),
        名称: scope === 'nai' ? '新建NAI提示词' : scope === 'scene' ? '新建场景提示词' : scope === 'player' ? '新建主角提示词' : '新建NPC提示词',
        类型: scope as 词组转化器提示词预设类型,
        提示词: '',
        createdAt: now,
        updatedAt: now
    };
};

const ImageGenerationSettings: React.FC<Props> = ({ settings, onSave }) => {
    const [form, setForm] = useState<接口设置结构>(() => 规范化接口设置(settings));
    const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
    const [selectedImageGenConfigId, setSelectedImageGenConfigId] = useState<string | null>(null);
    const [newImageGenBackend, setNewImageGenBackend] = useState<文生图后端类型>('openai');
    const [modelOptions, setModelOptions] = useState<Record<生图模型字段, string[]>>(初始化模型列表);
    const [modelLoading, setModelLoading] = useState<Record<生图模型字段, boolean>>(初始化加载状态);
    const [activePage, setActivePage] = useState<设置分页>('basic');
    const [artistPresetScope, setArtistPresetScope] = useState<画师串适用页签>('npc');
    const [transformerPresetScope, setTransformerPresetScope] = useState<词组预设页签>('nai');
    const [message, setMessage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [testingConnection, setTestingConnection] = useState(false);
    const [testResultModal, setTestResultModal] = useState<{ open: boolean; title: string; content: string; ok: boolean }>({ open: false, title: '', content: '', ok: false });
    const artistImportRef = React.useRef<HTMLInputElement | null>(null);
    const transformerImportRef = React.useRef<HTMLInputElement | null>(null);
    const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
    const [workflowList, setWorkflowList] = useState<Array<{ path: string; name: string; category: string }>>([]);
    const [workflowLoading, setWorkflowLoading] = useState(false);
    const [workflowError, setWorkflowError] = useState('');
    const [workflowFilter, setWorkflowFilter] = useState<string>('all');

    useEffect(() => {
        const normalized = 规范化接口设置(settings);
        setForm(normalized);
        setSelectedConfigId(normalized.activeConfigId || normalized.configs[0]?.id || null);
        const imgConfigs = normalized.功能模型占位.文生图配置列表 || [];
        setSelectedImageGenConfigId(normalized.功能模型占位.当前文生图配置ID || imgConfigs[0]?.id || null);
        setModelOptions(初始化模型列表());
        setModelLoading(初始化加载状态());
        setActivePage('basic');
        setArtistPresetScope('npc');
        setTransformerPresetScope('nai');
    }, [settings]);

    const activeConfig = useMemo<单接口配置结构 | null>(() => {
        if (!form.configs.length) return null;
        return form.configs.find((cfg) => cfg.id === selectedConfigId) || form.configs[0] || null;
    }, [form.configs, selectedConfigId]);

    const 文生图配置列表 = form.功能模型占位.文生图配置列表 || [];
    const 当前文生图配置 = useMemo<文生图接口配置结构 | null>(() => {
        if (!文生图配置列表.length) return null;
        return 文生图配置列表.find((cfg) => cfg.id === selectedImageGenConfigId) || 文生图配置列表[0] || null;
    }, [文生图配置列表, selectedImageGenConfigId]);

    const updateImageGenConfig = (patch: Partial<文生图接口配置结构>) => {
        if (!当前文生图配置) return;
        setForm((prev) => ({
            ...prev,
            功能模型占位: {
                ...prev.功能模型占位,
                文生图配置列表: prev.功能模型占位.文生图配置列表.map((cfg) => 
                    cfg.id === 当前文生图配置.id ? { ...cfg, ...patch, updatedAt: Date.now() } : cfg
                )
            }
        }));
    };

    const handleCreateImageGenConfig = () => {
        const created = 创建文生图配置模板(newImageGenBackend);
        setForm((prev) => ({
            ...prev,
            功能模型占位: {
                ...prev.功能模型占位,
                文生图配置列表: [...(prev.功能模型占位.文生图配置列表 || []), created],
                当前文生图配置ID: created.id
            }
        }));
        setSelectedImageGenConfigId(created.id);
        setMessage(`已新增 ${文生图后端选项.find(b => b.value === newImageGenBackend)?.label || newImageGenBackend} 配置，请填写后保存。`);
    };

    const handleDeleteImageGenConfig = () => {
        if (!当前文生图配置) return;
        setForm((prev) => {
            const remaining = (prev.功能模型占位.文生图配置列表 || []).filter((cfg) => cfg.id !== 当前文生图配置.id);
            const fallbackId = remaining[0]?.id || null;
            setSelectedImageGenConfigId(fallbackId);
            return {
                ...prev,
                功能模型占位: {
                    ...prev.功能模型占位,
                    文生图配置列表: remaining,
                    当前文生图配置ID: fallbackId
                }
            };
        });
        setMessage('配置已删除。');
    };

    const handleLoadWorkflowFromCNB = async () => {
        setWorkflowDialogOpen(true);
        setWorkflowLoading(true);
        setWorkflowError('');
        setWorkflowFilter('all');
        try {
            const res = await fetch('/api/comfyui-workflows?action=list');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setWorkflowList(data.workflows || []);
        } catch (err: unknown) {
            setWorkflowError(`加载工作流列表失败: ${err instanceof Error ? err.message : String(err)}`);
            setWorkflowList([]);
        } finally {
            setWorkflowLoading(false);
        }
    };

    const handleSelectWorkflow = async (workflowPath: string, workflowName: string) => {
        setWorkflowLoading(true);
        setWorkflowError('');
        try {
            const res = await fetch(`/api/comfyui-workflows?action=get&file=${encodeURIComponent(workflowPath)}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data.workflow) {
                updateImageGenConfig({ ComfyUI工作流JSON: JSON.stringify(data.workflow, null, 2) });
                setWorkflowDialogOpen(false);
                setMessage(`已加载工作流: ${workflowName}`);
            } else {
                setWorkflowError('获取工作流失败: 返回为空');
            }
        } catch (err: unknown) {
            setWorkflowError(`加载工作流失败: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setWorkflowLoading(false);
        }
    };

    const 主剧情解析模型 = useMemo(() => {
        return (activeConfig?.model || '').trim() || (form.功能模型占位.主剧情使用模型 || '').trim();
    }, [activeConfig?.model, form.功能模型占位.主剧情使用模型]);

    const 当前后端 = form.功能模型占位.文生图后端类型;
    const 当前场景后端 = form.功能模型占位.场景生图独立接口启用
        ? form.功能模型占位.场景生图后端类型
        : 当前后端;
    const 当前预设路径选项 = 预设路径选项映射[当前后端];
    const 当前预设路径值集合 = new Set(当前预设路径选项.map((item) => item.value));
    const 当前预设路径 = 当前预设路径值集合.has(form.功能模型占位.文生图预设接口路径)
        ? form.功能模型占位.文生图预设接口路径
        : 当前预设路径选项[0]?.value || 'openai_images';
    const 文生图模型选项 = Array.from(new Set(
        (当前后端 === 'novelai' ? NovelAI模型建议 : [])
            .concat(modelOptions.文生图模型使用模型, form.功能模型占位.文生图模型使用模型)
            .map((item) => (item || '').trim())
            .filter(Boolean)
    ));
    const 词组转化器模型选项 = Array.from(new Set(
        modelOptions.词组转化器使用模型
            .concat(form.功能模型占位.词组转化器使用模型, 主剧情解析模型)
            .map((item) => (item || '').trim())
            .filter(Boolean)
    ));
    const PNG提炼模型选项 = Array.from(new Set(
        modelOptions.PNG提炼使用模型
            .concat(form.功能模型占位.PNG提炼使用模型, 主剧情解析模型)
            .map((item) => (item || '').trim())
            .filter(Boolean)
    ));
    const 场景文生图模型选项 = Array.from(new Set(
        (当前场景后端 === 'novelai' ? NovelAI模型建议 : [])
            .concat(modelOptions.场景生图模型使用模型, form.功能模型占位.场景生图模型使用模型, form.功能模型占位.文生图模型使用模型)
            .map((item) => (item || '').trim())
            .filter(Boolean)
    ));
    const 可见页面 = useMemo(() => 基础页面选项.map((item) => (
        item.value === 'provider'
            ? { ...item, label: 获取后端设置标签(当前后端) }
            : item
    )), [当前后端]);
    const 是否强制启用词组转化器 = 当前后端 === 'novelai';
    const artistPresets = useMemo(
        () => (Array.isArray(form.功能模型占位.画师串预设列表) ? form.功能模型占位.画师串预设列表 : [])
            .filter((item) => item && typeof item.id === 'string' && !item.id.startsWith('png_artist_')),
        [form.功能模型占位.画师串预设列表]
    );
    const scopedArtistPresets = useMemo(() => artistPresets.filter((item) => item.适用范围 === artistPresetScope || item.适用范围 === 'all'), [artistPresets, artistPresetScope]);
    const currentArtistPresetId = artistPresetScope === 'scene'
        ? form.功能模型占位.当前场景画师串预设ID
        : form.功能模型占位.当前NPC画师串预设ID;
    const pngStylePresets = useMemo<PNG画风预设结构[]>(
        () => Array.isArray(form.功能模型占位.PNG画风预设列表) ? form.功能模型占位.PNG画风预设列表 : [],
        [form.功能模型占位.PNG画风预设列表]
    );
    const currentAutoPngPresetId = artistPresetScope === 'scene'
        ? form.功能模型占位.当前场景PNG画风预设ID
        : form.功能模型占位.当前NPCPNG画风预设ID;
    const selectedArtistPreset = scopedArtistPresets.find((item) => item.id === currentArtistPresetId)
        || scopedArtistPresets[0]
        || null;
    const transformerPresets = useMemo(() => Array.isArray(form.功能模型占位.词组转化器提示词预设列表) ? form.功能模型占位.词组转化器提示词预设列表 : [], [form.功能模型占位.词组转化器提示词预设列表]);
    const scopedTransformerPresets = useMemo(() => transformerPresets.filter((item) => item.类型 === transformerPresetScope), [transformerPresets, transformerPresetScope]);
    const currentTransformerPresetId = transformerPresetScope === 'nai'
        ? form.功能模型占位.当前NAI词组转化器提示词预设ID
        : transformerPresetScope === 'scene'
            ? form.功能模型占位.当前场景词组转化器提示词预设ID
            : form.功能模型占位.当前NPC词组转化器提示词预设ID;
    const selectedTransformerPreset = scopedTransformerPresets.find((item) => item.id === currentTransformerPresetId)
        || scopedTransformerPresets[0]
        || null;

    const updatePlaceholder = <K extends keyof 功能模型占位配置结构>(key: K, value: 功能模型占位配置结构[K]) => {
        setForm((prev) => ({
            ...prev,
            功能模型占位: {
                ...prev.功能模型占位,
                [key]: value
            }
        }));
    };

    const 更新当前画师串预设ID = (scope: 画师串适用页签, presetId: string) => {
        updatePlaceholder(scope === 'scene' ? '当前场景画师串预设ID' : '当前NPC画师串预设ID', presetId);
    };

    const 更新当前PNG预设ID = (scope: 画师串适用页签, presetId: string) => {
        updatePlaceholder(scope === 'scene' ? '当前场景PNG画风预设ID' : '当前NPCPNG画风预设ID', presetId);
    };

    const 更新当前词组预设ID = (scope: 词组预设页签, presetId: string) => {
        if (scope === 'nai') {
            updatePlaceholder('当前NAI词组转化器提示词预设ID', presetId);
            return;
        }
        if (scope === 'scene') {
            updatePlaceholder('当前场景词组转化器提示词预设ID', presetId);
            return;
        }
        updatePlaceholder('当前NPC词组转化器提示词预设ID', presetId);
    };

    const updateArtistPreset = (presetId: string, updater: (preset: 画师串预设结构) => 画师串预设结构) => {
        setForm((prev) => ({
            ...prev,
            功能模型占位: {
                ...prev.功能模型占位,
                画师串预设列表: (Array.isArray(prev.功能模型占位.画师串预设列表) ? prev.功能模型占位.画师串预设列表 : []).map((preset) => (
                    preset.id === presetId ? updater(preset) : preset
                ))
            }
        }));
    };

    const updateTransformerPreset = (presetId: string, updater: (preset: 词组转化器提示词预设结构) => 词组转化器提示词预设结构) => {
        setForm((prev) => ({
            ...prev,
            功能模型占位: {
                ...prev.功能模型占位,
                词组转化器提示词预设列表: (Array.isArray(prev.功能模型占位.词组转化器提示词预设列表) ? prev.功能模型占位.词组转化器提示词预设列表 : []).map((preset) => (
                    preset.id === presetId ? updater(preset) : preset
                ))
            }
        }));
    };

    const handleAddArtistPreset = () => {
        const nextPreset = 创建空画师串预设(artistPresetScope);
        setForm((prev) => ({
            ...prev,
            功能模型占位: {
                ...prev.功能模型占位,
                画师串预设列表: [...(Array.isArray(prev.功能模型占位.画师串预设列表) ? prev.功能模型占位.画师串预设列表 : []), nextPreset],
                当前NPC画师串预设ID: artistPresetScope === 'npc' ? nextPreset.id : prev.功能模型占位.当前NPC画师串预设ID,
                当前场景画师串预设ID: artistPresetScope === 'scene' ? nextPreset.id : prev.功能模型占位.当前场景画师串预设ID
            }
        }));
    };

    const handleDeleteArtistPreset = () => {
        if (!selectedArtistPreset) return;
        const remaining = artistPresets.filter((item) => item.id !== selectedArtistPreset.id);
        const nextNpcId = form.功能模型占位.当前NPC画师串预设ID === selectedArtistPreset.id
            ? (remaining.find((item) => item.适用范围 === 'npc' || item.适用范围 === 'all')?.id || '')
            : form.功能模型占位.当前NPC画师串预设ID;
        const nextSceneId = form.功能模型占位.当前场景画师串预设ID === selectedArtistPreset.id
            ? (remaining.find((item) => item.适用范围 === 'scene' || item.适用范围 === 'all')?.id || '')
            : form.功能模型占位.当前场景画师串预设ID;
        setForm((prev) => ({
            ...prev,
            功能模型占位: {
                ...prev.功能模型占位,
                画师串预设列表: remaining,
                当前NPC画师串预设ID: nextNpcId,
                当前场景画师串预设ID: nextSceneId
            }
        }));
    };

    const handleAddTransformerPreset = () => {
        const nextPreset = 创建空词组预设(transformerPresetScope);
        setForm((prev) => ({
            ...prev,
            功能模型占位: {
                ...prev.功能模型占位,
                词组转化器提示词预设列表: [...(Array.isArray(prev.功能模型占位.词组转化器提示词预设列表) ? prev.功能模型占位.词组转化器提示词预设列表 : []), nextPreset],
                当前NAI词组转化器提示词预设ID: transformerPresetScope === 'nai' ? nextPreset.id : prev.功能模型占位.当前NAI词组转化器提示词预设ID,
                当前NPC词组转化器提示词预设ID: transformerPresetScope === 'npc' ? nextPreset.id : prev.功能模型占位.当前NPC词组转化器提示词预设ID,
                当前场景词组转化器提示词预设ID: transformerPresetScope === 'scene' ? nextPreset.id : prev.功能模型占位.当前场景词组转化器提示词预设ID
            }
        }));
    };

    const handleDeleteTransformerPreset = () => {
        if (!selectedTransformerPreset) return;
        const remaining = transformerPresets.filter((item) => item.id !== selectedTransformerPreset.id);
        const nextByScope = (scope: 词组预设页签) => remaining.find((item) => item.类型 === scope)?.id || '';
        setForm((prev) => ({
            ...prev,
            功能模型占位: {
                ...prev.功能模型占位,
                词组转化器提示词预设列表: remaining,
                当前NAI词组转化器提示词预设ID: prev.功能模型占位.当前NAI词组转化器提示词预设ID === selectedTransformerPreset.id ? nextByScope('nai') : prev.功能模型占位.当前NAI词组转化器提示词预设ID,
                当前NPC词组转化器提示词预设ID: prev.功能模型占位.当前NPC词组转化器提示词预设ID === selectedTransformerPreset.id ? nextByScope('npc') : prev.功能模型占位.当前NPC词组转化器提示词预设ID,
                当前场景词组转化器提示词预设ID: prev.功能模型占位.当前场景词组转化器提示词预设ID === selectedTransformerPreset.id ? nextByScope('scene') : prev.功能模型占位.当前场景词组转化器提示词预设ID
            }
        }));
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

    const 读取JSON文件 = async (file: File): Promise<any> => {
        const text = await file.text();
        return JSON.parse(text);
    };

    const handleBackendChange = (value: 功能模型占位配置结构['文生图后端类型']) => {
        const fallbackPreset = 预设路径选项映射[value][0]?.value || 'openai_images';
        setForm((prev) => ({
            ...prev,
                功能模型占位: {
                    ...prev.功能模型占位,
                    文生图后端类型: value,
                    文生图预设接口路径: fallbackPreset,
                    NPC生图使用词组转化器: value === 'novelai' ? true : prev.功能模型占位.NPC生图使用词组转化器,
                    文生图模型API地址: value === 'novelai' && !prev.功能模型占位.文生图模型API地址.trim()
                        ? 'https://image.novelai.net'
                        : prev.功能模型占位.文生图模型API地址,
                文生图OpenAI自定义格式: value === 'openai' ? prev.功能模型占位.文生图OpenAI自定义格式 : false,
                文生图响应格式: value === 'openai' ? prev.功能模型占位.文生图响应格式 : 'url'
            }
        }));
        if (activePage === 'provider') setActivePage('provider');
    };

    const handleToggleTransformerIndependent = (checked: boolean) => {
        setForm((prev) => {
            const currentModel = (prev.功能模型占位.词组转化器使用模型 || '').trim();
            return {
                ...prev,
                功能模型占位: {
                    ...prev.功能模型占位,
                    词组转化器启用独立模型: checked,
                    词组转化器使用模型: checked ? (currentModel || 主剧情解析模型 || '') : ''
                }
            };
        });
    };

    const handleToggleSceneMode = (checked: boolean) => {
        setForm((prev) => {
            const currentModel = (prev.功能模型占位.词组转化器使用模型 || '').trim();
            return {
                ...prev,
                功能模型占位: {
                    ...prev.功能模型占位,
                    场景生图启用: checked,
                    词组转化器启用独立模型: checked ? true : prev.功能模型占位.词组转化器启用独立模型,
                    词组转化器使用模型: checked
                        ? (currentModel || 主剧情解析模型 || '')
                        : prev.功能模型占位.词组转化器使用模型
                }
            };
        });
    };

    const handleToggleSceneIndependentImageApi = (checked: boolean) => {
        setForm((prev) => ({
            ...prev,
            功能模型占位: {
                ...prev.功能模型占位,
                场景生图独立接口启用: checked,
                场景生图使用配置ID: checked ? prev.功能模型占位.场景生图使用配置ID : null,
                场景生图后端类型: checked
                    ? prev.功能模型占位.场景生图后端类型
                    : prev.功能模型占位.场景生图后端类型,
                场景生图模型使用模型: checked
                    ? ((prev.功能模型占位.场景生图模型使用模型 || '').trim() || (prev.功能模型占位.文生图模型使用模型 || '').trim())
                    : prev.功能模型占位.场景生图模型使用模型,
                场景生图模型API地址: checked
                    ? ((prev.功能模型占位.场景生图模型API地址 || '').trim() || (prev.功能模型占位.文生图模型API地址 || '').trim())
                    : prev.功能模型占位.场景生图模型API地址,
                场景生图模型API密钥: checked
                    ? ((prev.功能模型占位.场景生图模型API密钥 || '').trim() || (prev.功能模型占位.文生图模型API密钥 || '').trim())
                    : prev.功能模型占位.场景生图模型API密钥
            }
        }));
    };

    const fetchModelsFromCurrentConfig = async (key: 生图模型字段): Promise<string[] | null> => {
        const feature = form.功能模型占位;
        
        const isProviderTab = key === '文生图模型使用模型' && !feature.场景生图独立接口启用;
        
        const providerConfig = isProviderTab ? 当前文生图配置 : null;
        
        const sceneBackend = feature.场景生图独立接口启用 ? feature.场景生图后端类型 : feature.文生图后端类型;
        const targetBackend = key === '文生图模型使用模型'
            ? (isProviderTab && providerConfig ? providerConfig.后端类型 : feature.文生图后端类型)
            : key === '场景生图模型使用模型'
                ? sceneBackend
                : feature.文生图后端类型;
        const customBaseUrl = key === '文生图模型使用模型'
            ? isProviderTab
                ? (providerConfig?.API地址 || '').trim()
                : (feature.文生图模型API地址 || '').trim()
            : key === '场景生图模型使用模型'
                ? ((feature.场景生图独立接口启用 ? feature.场景生图模型API地址 : feature.文生图模型API地址) || '').trim()
                : key === 'PNG提炼使用模型'
                    ? ((feature.PNG提炼启用独立模型 ? feature.PNG提炼API地址 : '') || '').trim()
                    : ((feature.词组转化器启用独立模型 ? feature.词组转化器API地址 : '') || '').trim();
        const customApiKey = key === '文生图模型使用模型'
            ? isProviderTab
                ? (providerConfig?.API密钥 || '').trim()
                : (feature.文生图模型API密钥 || '').trim()
            : key === '场景生图模型使用模型'
                ? ((feature.场景生图独立接口启用 ? feature.场景生图模型API密钥 : feature.文生图模型API密钥) || '').trim()
                : key === 'PNG提炼使用模型'
                    ? ((feature.PNG提炼启用独立模型 ? feature.PNG提炼API密钥 : '') || '').trim()
                    : ((feature.词组转化器启用独立模型 ? feature.词组转化器API密钥 : '') || '').trim();
        const canReuseMainConnection = key !== '场景生图模型使用模型' || !feature.场景生图独立接口启用 || sceneBackend === feature.文生图后端类型;
        const resolvedBaseUrl = customBaseUrl || (canReuseMainConnection ? (activeConfig?.baseUrl || '').trim() : '');
        const resolvedApiKey = customApiKey || (canReuseMainConnection ? (activeConfig?.apiKey || '').trim() : '');
        const targetNeedsModel = key === '词组转化器使用模型' || key === 'PNG提炼使用模型'
            ? true
            : 图片后端需要模型选择(targetBackend);
        const targetNeedsAuth = key === '词组转化器使用模型' || key === 'PNG提炼使用模型'
            ? true
            : 图片后端需要鉴权(targetBackend);

        if (!targetNeedsModel) {
            setMessage(`${文生图后端选项.find((item) => item.value === targetBackend)?.label || '当前后端'}不需要模型选择，也不提供模型列表。`);
            return null;
        }
        if (!resolvedBaseUrl || (targetNeedsAuth && !resolvedApiKey)) {
            setMessage(key === 'PNG提炼使用模型'
                ? '请先填写 PNG 提炼 API 地址与 API Key。'
                : (targetBackend === 'novelai' ? '请先填写 API 地址与 Persistent API Token。' : '请先填写 API 地址与 API Key。'));
            return null;
        }
        try {
            if (targetBackend === 'novelai' && (key === '文生图模型使用模型' || key === '场景生图模型使用模型')) return NovelAI模型建议;
            const base = resolvedBaseUrl.replace(/\/+$/, '');
            const normalized = base.replace(/\/v1$/i, '');
            const candidateUrls = Array.from(new Set([
                `${normalized}/v1/models`,
                `${normalized}/models`,
                `${base}/models`
            ]));
            for (const url of candidateUrls) {
                const res = await fetch(url, {
                    headers: targetNeedsAuth ? { Authorization: `Bearer ${resolvedApiKey}` } : undefined
                });
                if (!res.ok) continue;
                const data = await res.json();
                if (data && Array.isArray(data.data)) {
                    return data.data.map((m: any) => m?.id).filter(Boolean);
                }
            }
            setMessage(`获取模型列表失败：${resolvedBaseUrl}`);
            return null;
        } catch (e: any) {
            setMessage(`获取模型列表失败：${e.message}`);
            return null;
        }
    };

    const handleFetchModels = async (key: 生图模型字段, label: string) => {
        setModelLoading((prev) => ({ ...prev, [key]: true }));
        setMessage('');
        const result = await fetchModelsFromCurrentConfig(key);
        if (result) {
            setModelOptions((prev) => ({ ...prev, [key]: result }));
            setMessage(`${label}获取成功`);
        }
        setModelLoading((prev) => ({ ...prev, [key]: false }));
    };

    const handleTestImageConnection = async (config: 文生图接口配置结构) => {
        const backendType = config.后端类型;
        const isCnbMode = backendType === 'comfyui' && form.功能模型占位.comfyui地址模式 === 'cnb';
        const resolvedBaseUrl = isCnbMode
            ? (form.功能模型占位.cnbComfyui地址?.trim() || '')
            : (config.API地址?.trim() || '');
        const hasBaseUrl = Boolean(resolvedBaseUrl);
        const needsApiKey = backendType === 'openai' || backendType === 'grok' || backendType === 'novelai';
        const needsModel = backendType === 'openai' || backendType === 'grok' || backendType === 'novelai';
        const needsWorkflow = backendType === 'comfyui';

        const missingChecks: string[] = [];
        if (!hasBaseUrl) missingChecks.push(isCnbMode ? 'CNB ComfyUI 地址' : 'API 地址');
        if (needsApiKey && !config.API密钥?.trim()) missingChecks.push('API 密钥');
        if (needsModel && !config.模型?.trim()) missingChecks.push('模型名称');
        if (needsWorkflow && !config.ComfyUI工作流JSON?.trim()) missingChecks.push('ComfyUI 工作流 JSON');
        if (missingChecks.length > 0) {
            setMessage(`请先填写: ${missingChecks.join('、')}`);
            return;
        }

        setMessage('');
        setTestingConnection(true);
        try {
            const imageAIService = await import('../../../services/ai/image');
            const result = await imageAIService.testImageConnection({
                id: config.id,
                名称: config.名称,
                供应商: backendType === 'grok' ? 'grok' : 'openai',
                baseUrl: resolvedBaseUrl,
                apiKey: config.API密钥?.trim() || '',
                model: config.模型?.trim() || '',
                图片后端类型: backendType,
                图片接口路径: config.接口路径模式 === 'custom' ? config.自定义接口路径 : undefined,
                图片接口路径模式: config.接口路径模式,
                图片响应格式: config.响应格式,
                图片走OpenAI自定义格式: config.OpenAI自定义格式 === true,
                ComfyUI工作流JSON: config.ComfyUI工作流JSON
            });
            const backendLabel = 文生图后端选项.find((o) => o.value === result.backendType)?.label || result.backendType;
            const addressLabel = isCnbMode ? `CNB 地址: ${form.功能模型占位.cnbComfyui地址}` : `API 地址: ${config.API地址}`;
            const meta = [
                `配置: ${config.名称 || config.id}`,
                `后端: ${backendLabel}`,
                addressLabel,
                '',
                '---',
                '',
                result.detail
            ].join('\n');
            setTestResultModal({
                open: true,
                title: result.ok ? '连接测试成功' : '连接测试失败',
                content: meta,
                ok: result.ok
            });
        } catch (e: any) {
            setTestResultModal({
                open: true,
                title: '连接测试失败',
                content: String(e?.message || '未知错误'),
                ok: false
            });
        } finally {
            setTestingConnection(false);
        }
    };

    const handleExportArtistPresets = () => {
        导出JSON文件('artist-presets.json', {
            version: 1,
            type: 'artist_prompt_presets',
            presets: artistPresets
        });
        setMessage('画师串预设已导出。');
    };

    const handleExportTransformerPresets = () => {
        导出JSON文件('transformer-presets.json', {
            version: 1,
            type: 'transformer_prompt_presets',
            presets: transformerPresets
        });
        setMessage('词组转化器预设已导出。');
    };

    const handleImportArtistPresets = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const parsed = await 读取JSON文件(file);
            const presets = Array.isArray(parsed?.presets) ? parsed.presets : [];
            const normalized = 规范化接口设置({
                ...form,
                功能模型占位: {
                    ...form.功能模型占位,
                    画师串预设列表: presets
                }
            });
            setForm(normalized);
            setMessage(`已导入 ${normalized.功能模型占位.画师串预设列表.length} 条画师串预设。`);
        } catch (error: any) {
            setMessage(`导入画师串预设失败：${error?.message || '文件格式错误'}`);
        } finally {
            event.target.value = '';
        }
    };

    const handleImportTransformerPresets = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const parsed = await 读取JSON文件(file);
            const presets = Array.isArray(parsed?.presets) ? parsed.presets : [];
            const normalized = 规范化接口设置({
                ...form,
                功能模型占位: {
                    ...form.功能模型占位,
                    词组转化器提示词预设列表: presets
                }
            });
            setForm(normalized);
            setMessage(`已导入 ${normalized.功能模型占位.词组转化器提示词预设列表.length} 条词组转化器预设。`);
        } catch (error: any) {
            setMessage(`导入词组转化器预设失败：${error?.message || '文件格式错误'}`);
        } finally {
            event.target.value = '';
        }
    };

    const handleSave = () => {
        const normalized = 规范化接口设置({
            ...form,
            activeConfigId: selectedConfigId || form.activeConfigId,
            功能模型占位: {
                ...form.功能模型占位,
                词组转化器提示词: '',
                NPC生图使用词组转化器: 当前后端 === 'novelai' ? true : form.功能模型占位.NPC生图使用词组转化器
            }
        });
        onSave(normalized);
        setForm(normalized);
        setSelectedConfigId(normalized.activeConfigId || normalized.configs[0]?.id || null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    const renderBasicPage = () => (
        <div className={页面容器样式}>
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className={卡片样式}>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <div className="text-base font-bold text-fuchsia-200">文生图总开关</div>
                        </div>
                        <ToggleSwitch
                            checked={form.功能模型占位.文生图功能启用}
                            onChange={(next) => updatePlaceholder('文生图功能启用', next)}
                            ariaLabel="切换文生图总开关"
                        />
                    </div>
                </div>
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4">
                    <div className="text-base font-bold text-emerald-200">当前后端</div>
                    <div className="mt-2 text-xl font-serif text-white">
                        {当前文生图配置 ? 文生图后端选项.find((item) => item.value === 当前文生图配置.后端类型)?.label : '请在接口设置中配置'}
                    </div>
                </div>
            </div>

        </div>
    );

    const renderProviderPage = () => {
        if (!当前文生图配置) {
            return (
                <div className={页面容器样式}>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-8 text-center">
                        <div className="mb-4 text-lg font-bold text-fuchsia-200">暂无文生图配置</div>
                        <div className="mb-6 text-sm text-gray-400">请新建一个配置以开始使用文生图功能</div>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <InlineSelect
                                value={newImageGenBackend}
                                options={文生图后端选项}
                                onChange={(value) => setNewImageGenBackend(value as 文生图后端类型)}
                                buttonClassName="bg-black/50 border-gray-600 py-2.5"
                            />
                            <GameButton onClick={handleCreateImageGenConfig} variant="primary">
                                新建配置
                            </GameButton>
                        </div>
                    </div>
                </div>
            );
        }

        const 当前配置后端 = 当前文生图配置.后端类型;
        const 当前配置预设路径选项 = 预设路径选项映射[当前配置后端];

        return (
            <div className={页面容器样式}>
                <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-fuchsia-500/20 bg-fuchsia-950/10 p-4">
                    <div className="flex flex-1 items-center gap-2">
                        <span className="text-sm text-fuchsia-200">当前配置：</span>
                        <InlineSelect
                            value={selectedImageGenConfigId || ''}
                            options={文生图配置列表.map((cfg) => ({ value: cfg.id, label: cfg.名称 }))}
                            onChange={(id) => {
                                setSelectedImageGenConfigId(id);
                                setForm((prev) => ({
                                    ...prev,
                                    功能模型占位: {
                                        ...prev.功能模型占位,
                                        当前文生图配置ID: id
                                    }
                                }));
                            }}
                            buttonClassName="bg-black/50 border-gray-600 py-1.5 text-sm min-w-[140px]"
                            placeholder="选择配置"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <InlineSelect
                            value={newImageGenBackend}
                            options={文生图后端选项}
                            onChange={(value) => setNewImageGenBackend(value as 文生图后端类型)}
                            buttonClassName="bg-black/50 border-gray-600 py-1.5 text-sm"
                        />
                        <GameButton onClick={handleCreateImageGenConfig} variant="secondary" className="text-xs px-3 py-1.5">
                            + 新建
                        </GameButton>
                        <button
                            type="button"
                            onClick={handleDeleteImageGenConfig}
                            disabled={文生图配置列表.length <= 1}
                            className="rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-1.5 text-xs text-red-200 disabled:opacity-40"
                        >
                            删除
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className={标签样式}>配置名称</label>
                    <input
                        type="text"
                        value={当前文生图配置.名称}
                        onChange={(e) => updateImageGenConfig({ 名称: e.target.value })}
                        className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-fuchsia-400"
                    />
                </div>

                <div className={卡片样式}>
                    <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                        <div className="space-y-2">
                            <label className={标签样式}>后端类型</label>
                            <InlineSelect
                                value={当前配置后端}
                                options={文生图后端选项}
                                onChange={(value) => updateImageGenConfig({ 后端类型: value as 文生图后端类型 })}
                                buttonClassName="bg-black/50 border-gray-600 py-2.5"
                            />
                        </div>
                        <div className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-950/10 px-4 py-3 text-sm text-white">
                            {文生图后端选项.find((item) => item.value === 当前配置后端)?.label}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className={标签样式}>API 地址</label>
                            <input
                                type="text"
                                value={当前文生图配置.API地址}
                                onChange={(e) => updateImageGenConfig({ API地址: e.target.value })}
                                placeholder={当前配置后端 === 'novelai'
                                    ? 'https://image.novelai.net'
                                    : 当前配置后端 === 'sd_webui'
                                        ? '例如：http://127.0.0.1:7860'
                                        : 当前配置后端 === 'comfyui'
                                            ? '例如：http://127.0.0.1:8188'
                                            : 'https://api.openai.com/v1'}
                                className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-fuchsia-400"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className={标签样式}>{当前配置后端 === 'novelai' ? 'Persistent API Token' : 'API Key'}</label>
                            <input
                                type="password"
                                value={当前文生图配置.API密钥}
                                onChange={(e) => updateImageGenConfig({ API密钥: e.target.value })}
                                placeholder={当前配置后端 === 'novelai'
                                    ? '在 NovelAI 账户设置中生成 Persistent API Token'
                                    : 当前配置后端 === 'sd_webui' || 当前配置后端 === 'comfyui'
                                        ? '可留空；默认不会发送 Authorization'
                                        : '留空则回退当前接口配置'}
                                className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-fuchsia-400"
                            />
                        </div>
                    </div>
                </div>

            <div className={卡片样式}>
                {图片后端需要模型选择(当前配置后端) ? (
                    <>
                        <div className="flex flex-col gap-3 md:flex-row md:items-end">
                            <div className="flex-1 space-y-2">
                                <label className={标签样式}>模型名称</label>
                                <InlineSelect
                                    value={当前文生图配置.模型}
                                    onChange={(model) => updateImageGenConfig({ 模型: model })}
                                    options={文生图模型选项.map((model) => ({ value: model, label: model }))}
                                    placeholder="请选择或输入模型名"
                                    buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                    panelClassName="max-w-full"
                                />
                            </div>
                            <GameButton
                                onClick={() => handleFetchModels('文生图模型使用模型', '文生图模型列表')}
                                variant="secondary"
                                className="px-4 py-2 text-xs md:min-w-[96px]"
                                disabled={modelLoading.文生图模型使用模型}
                            >
                                {modelLoading.文生图模型使用模型 ? '...' : '获取列表'}
                            </GameButton>
                        </div>
                        <input
                            type="text"
                            value={当前文生图配置.模型}
                            onChange={(e) => updateImageGenConfig({ 模型: e.target.value })}
                            placeholder="例如：gpt-image-1 / nai-diffusion-4-5-full"
                            className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-fuchsia-400"
                        />
                    </>
                ) : (
                    <div className="rounded-xl border border-sky-500/20 bg-sky-950/10 px-4 py-3 text-sm text-sky-100">
                        当前后端直接调用固定生图接口，不需要选择模型名称。
                    </div>
                )}
            </div>

            <div className={卡片样式}>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className={标签样式}>接口路径模式</label>
                        <InlineSelect
                            value={当前文生图配置.接口路径模式}
                            onChange={(value) => updateImageGenConfig({ 接口路径模式: value as 'preset' | 'custom' })}
                            options={接口路径模式选项}
                            buttonClassName="bg-black/50 border-gray-600 py-2.5"
                        />
                    </div>
                </div>

                {当前文生图配置.接口路径模式 === 'preset' ? (
                    <div className="space-y-2">
                        <label className={标签样式}>预设路径</label>
                        <InlineSelect
                            value={当前文生图配置.预设接口路径}
                            onChange={(value) => updateImageGenConfig({ 预设接口路径: value as 文生图预设接口路径类型 })}
                            options={当前配置预设路径选项.map((item) => ({ value: item.value, label: item.label }))}
                            buttonClassName="bg-black/50 border-gray-600 py-2.5"
                        />
                    </div>
                ) : (
                    <div className="space-y-2">
                        <label className={标签样式}>自定义接口路径</label>
                        <input
                            type="text"
                            value={当前文生图配置.自定义接口路径}
                            onChange={(e) => updateImageGenConfig({ 自定义接口路径: e.target.value })}
                            placeholder={当前配置后端 === 'novelai'
                                ? '/ai/generate-image'
                                : 当前配置后端 === 'sd_webui'
                                    ? '/sdapi/v1/txt2img'
                                    : 当前配置后端 === 'comfyui'
                                        ? '/prompt'
                                        : '/v1/images/generations'}
                            className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-fuchsia-400"
                        />
                    </div>
                )}
            </div>

            {当前配置后端 === 'openai' && (
                <div className={卡片样式}>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className={标签样式}>图片响应格式</label>
                            <InlineSelect
                                value={当前文生图配置.响应格式}
                                onChange={(value) => updateImageGenConfig({ 响应格式: value as 'url' | 'b64_json' })}
                                options={[
                                    { value: 'url', label: 'URL' },
                                    { value: 'b64_json', label: 'Base64 / b64_json' }
                                ]}
                                buttonClassName="bg-black/50 border-gray-600 py-2.5"
                            />
                        </div>
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-fuchsia-500/20 bg-fuchsia-950/10 p-3">
                            <div className="text-sm font-bold text-fuchsia-200">OpenAI 兼容图片请求体</div>
                            <ToggleSwitch
                                checked={当前文生图配置.OpenAI自定义格式}
                                onChange={(next) => updateImageGenConfig({ OpenAI自定义格式: next })}
                                ariaLabel="切换 OpenAI 图片请求体"
                            />
                        </div>
                    </div>
                </div>
            )}

            {当前配置后端 === 'novelai' && (
                <div className="rounded-2xl border border-emerald-500/25 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_55%),rgba(1,10,16,0.7)] p-5 space-y-5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-base font-bold text-emerald-200">NovelAI 自定义参数</div>
                        <ToggleSwitch
                            checked={当前文生图配置.NovelAI启用自定义参数}
                            onChange={(next) => updateImageGenConfig({ NovelAI启用自定义参数: next })}
                            ariaLabel="切换 NovelAI 自定义参数"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-emerald-200">采样方法</label>
                            <InlineSelect
                                value={当前文生图配置.NovelAI采样器}
                                onChange={(value) => updateImageGenConfig({ NovelAI采样器: value as any })}
                                options={NovelAI采样器选项}
                                buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                disabled={!当前文生图配置.NovelAI启用自定义参数}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-emerald-200">噪点表</label>
                            <InlineSelect
                                value={当前文生图配置.NovelAI噪点表}
                                onChange={(value) => updateImageGenConfig({ NovelAI噪点表: value as any })}
                                options={NovelAI噪点表选项}
                                buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                disabled={!当前文生图配置.NovelAI启用自定义参数}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-emerald-200">步数</label>
                            <input
                                type="number"
                                min={1}
                                max={50}
                                value={当前文生图配置.NovelAI步数}
                                onChange={(e) => updateImageGenConfig({ NovelAI步数: Math.max(1, Math.min(50, Number(e.target.value) || 28)) })}
                                disabled={!当前文生图配置.NovelAI启用自定义参数}
                                className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-emerald-200">负面提示词</label>
                        <textarea
                            value={当前文生图配置.NovelAI负面提示词}
                            onChange={(e) => updateImageGenConfig({ NovelAI负面提示词: e.target.value })}
                            rows={6}
                            disabled={!当前文生图配置.NovelAI启用自定义参数}
                            placeholder="例如：lowres, bad anatomy, text, watermark"
                            className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-emerald-400 resize-y disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                </div>
            )}

            {当前配置后端 === 'comfyui' && (
                <div className={卡片样式}>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className={标签样式}>地址来源</label>
                            <InlineSelect
                                value={form.功能模型占位.comfyui地址模式}
                                options={[
                                    { value: 'api', label: '使用上方 API 地址' },
                                    { value: 'cnb', label: '使用 CNB ComfyUI 地址' }
                                ]}
                                onChange={(value) => updatePlaceholder('comfyui地址模式', value as 'api' | 'cnb')}
                                buttonClassName="bg-black/50 border-gray-600 py-2.5"
                            />
                        </div>
                        {form.功能模型占位.comfyui地址模式 === 'cnb' && (
                            <div className="space-y-2">
                                <label className={标签样式}>CNB ComfyUI 地址</label>
                                <input
                                    type="text"
                                    value={form.功能模型占位.cnbComfyui地址}
                                    onChange={(e) => updatePlaceholder('cnbComfyui地址', e.target.value)}
                                    placeholder="例如: https://mw4lgca3zk-8188.cnb.run"
                                    className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-fuchsia-400"
                                />
                                <p className="text-xs text-gray-400">启动 CNB 工作区后填入此地址，将直接覆盖 API 地址用于生图</p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className={标签样式}>ComfyUI Workflow JSON</label>
                                <button
                                    type="button"
                                    onClick={handleLoadWorkflowFromCNB}
                                    className="rounded-md bg-cyan-600/20 px-3 py-1 text-xs text-cyan-200 hover:bg-cyan-600/30 transition-colors"
                                >
                                    从 CNB 加载
                                </button>
                            </div>
                            <textarea
                                value={当前文生图配置.ComfyUI工作流JSON}
                                onChange={(e) => updateImageGenConfig({ ComfyUI工作流JSON: e.target.value })}
                                rows={14}
                                placeholder={'粘贴从 ComfyUI 导出的 API workflow JSON。\n可用占位符：__PROMPT__、__NEGATIVE_PROMPT__、__WIDTH__、__HEIGHT__'}
                                className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 font-mono text-white outline-none transition-all focus:border-fuchsia-400 resize-y"
                            />
                        </div>
                    </div>
                    <div className="rounded-xl border border-sky-500/20 bg-sky-950/10 px-4 py-3 text-xs leading-6 text-sky-100">
                        纯原生 ComfyUI 需要 workflow JSON，提交到 <code>/prompt</code> 后再轮询 <code>/history/&#123;prompt_id&#125;</code>。
                        支持占位符：{ComfyUI工作流占位提示}
                    </div>
                </div>
            )}

            {/* CNB 工作流选择对话框 */}
            {workflowDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setWorkflowDialogOpen(false)}>
                    <div
                        className="mx-4 max-h-[80vh] w-full max-w-2xl rounded-2xl border border-cyan-500/30 bg-gray-900 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-cyan-500/20 px-6 py-4">
                            <h3 className="text-lg font-bold text-cyan-200">从 CNB 加载工作流</h3>
                            <button
                                type="button"
                                onClick={() => setWorkflowDialogOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="px-6 py-3">
                            {workflowFilter !== 'all' && workflowList.length > 0 ? (
                                <div className="mb-3 flex flex-wrap gap-2">
                                    {['all', ...new Set(workflowList.map(w => w.category))].map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setWorkflowFilter(cat)}
                                            className={`rounded-full px-3 py-1 text-xs transition-colors ${
                                                workflowFilter === cat
                                                    ? 'bg-cyan-600 text-white'
                                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                        >
                                            {cat === 'all' ? '全部' : cat}
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                            {workflowLoading ? (
                                <div className="py-8 text-center text-gray-400">加载中...</div>
                            ) : workflowError ? (
                                <div className="py-4 text-center text-red-400">{workflowError}</div>
                            ) : workflowList.length === 0 ? (
                                <div className="py-8 text-center text-gray-400">未找到工作流</div>
                            ) : (
                                <div className="max-h-[50vh] space-y-2 overflow-y-auto">
                                    {(workflowFilter === 'all' ? workflowList : workflowList.filter(w => w.category === workflowFilter)).map((wf) => (
                                        <button
                                            key={wf.path}
                                            type="button"
                                            onClick={() => handleSelectWorkflow(wf.path, wf.name)}
                                            className="flex w-full items-center justify-between rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 hover:border-cyan-500/50 hover:bg-gray-800 transition-colors text-left"
                                        >
                                            <div>
                                                <div className="text-sm font-medium text-white">{wf.name}</div>
                                                <div className="text-xs text-gray-500">{wf.path}</div>
                                            </div>
                                            <span className="rounded-full bg-cyan-900/50 px-2 py-0.5 text-xs text-cyan-300">{wf.category}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

    const renderTransformerPage = () => (
        <div className={页面容器样式}>
            <div className={卡片样式}>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="text-base font-bold text-cyan-200">NPC 生图使用词组转化器</div>
                    </div>
                    <ToggleSwitch
                        checked={是否强制启用词组转化器 ? true : form.功能模型占位.NPC生图使用词组转化器}
                        onChange={(next) => updatePlaceholder('NPC生图使用词组转化器', next)}
                        disabled={是否强制启用词组转化器}
                        ariaLabel="切换 NPC 生图词组转化器"
                    />
                </div>
            </div>

            <div className={卡片样式}>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="text-base font-bold text-cyan-200">香闺秘档特写强制裸体语义</div>
                        <div className="mt-1 text-xs leading-6 text-cyan-100/70">关闭后不再额外强塞 `nude, naked, unclothed`，仅按原始描述、词组转化器和画师串生成。</div>
                    </div>
                    <ToggleSwitch
                        checked={form.功能模型占位.香闺秘档特写强制裸体语义}
                        onChange={(next) => updatePlaceholder('香闺秘档特写强制裸体语义', next)}
                        ariaLabel="切换香闺秘档特写强制裸体语义"
                    />
                </div>
            </div>

            <div className={卡片样式}>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="text-base font-bold text-cyan-200">独立转化器模型</div>
                    </div>
                    <ToggleSwitch
                        checked={form.功能模型占位.词组转化器启用独立模型}
                        onChange={handleToggleTransformerIndependent}
                        ariaLabel="切换词组转化器独立模型"
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-cyan-200">转化器接口地址</label>
                        <input
                            type="text"
                            value={form.功能模型占位.词组转化器API地址}
                            onChange={(e) => updatePlaceholder('词组转化器API地址', e.target.value)}
                            placeholder="留空则沿用主剧情接口"
                            disabled={!form.功能模型占位.词组转化器启用独立模型}
                            className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-cyan-200">转化器 API Key</label>
                        <input
                            type="password"
                            value={form.功能模型占位.词组转化器API密钥}
                            onChange={(e) => updatePlaceholder('词组转化器API密钥', e.target.value)}
                            placeholder="留空则沿用主剧情 API Key"
                            disabled={!form.功能模型占位.词组转化器启用独立模型}
                            className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-end">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-bold text-cyan-200">词组转化器模型</label>
                        <InlineSelect
                            value={form.功能模型占位.词组转化器启用独立模型 ? form.功能模型占位.词组转化器使用模型 : 主剧情解析模型}
                            options={词组转化器模型选项.map((model) => ({ value: model, label: model }))}
                            onChange={(model) => updatePlaceholder('词组转化器使用模型', model)}
                            disabled={!form.功能模型占位.词组转化器启用独立模型}
                            placeholder={form.功能模型占位.词组转化器启用独立模型 ? '请选择或输入模型' : `跟随主剧情模型：${主剧情解析模型 || '未设置'}`}
                            buttonClassName="bg-black/50 border-gray-600 py-2.5"
                            panelClassName="max-w-full"
                        />
                    </div>
                    <GameButton
                        onClick={() => handleFetchModels('词组转化器使用模型', '词组转化器模型列表')}
                        variant="secondary"
                        className="px-4 py-2 text-xs md:min-w-[96px]"
                        disabled={modelLoading.词组转化器使用模型}
                    >
                        {modelLoading.词组转化器使用模型 ? '...' : '获取列表'}
                    </GameButton>
                </div>

                {form.功能模型占位.词组转化器启用独立模型 && (
                    <input
                        type="text"
                        value={form.功能模型占位.词组转化器使用模型}
                        onChange={(e) => updatePlaceholder('词组转化器使用模型', e.target.value)}
                        placeholder="例如：gpt-4o-mini / gemini-2.5-flash"
                        className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-cyan-400"
                    />
                )}
            </div>

            <div className={卡片样式}>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="text-base font-bold text-violet-200">PNG 画风提炼独立模型</div>
                        <div className="mt-1 text-xs leading-6 text-violet-100/70">用于 PNG 元数据提炼画风，不影响生图模型。</div>
                    </div>
                    <ToggleSwitch
                        checked={form.功能模型占位.PNG提炼启用独立模型}
                        onChange={(next) => updatePlaceholder('PNG提炼启用独立模型', next)}
                        ariaLabel="切换 PNG 提炼独立模型"
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-violet-200">PNG 提炼接口地址</label>
                        <input
                            type="text"
                            value={form.功能模型占位.PNG提炼API地址}
                            onChange={(e) => updatePlaceholder('PNG提炼API地址', e.target.value)}
                            placeholder="例如：https://api.openai.com/v1"
                            disabled={!form.功能模型占位.PNG提炼启用独立模型}
                            className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-violet-200">PNG 提炼 API Key</label>
                        <input
                            type="password"
                            value={form.功能模型占位.PNG提炼API密钥}
                            onChange={(e) => updatePlaceholder('PNG提炼API密钥', e.target.value)}
                            placeholder="留空则沿用主剧情 API Key"
                            disabled={!form.功能模型占位.PNG提炼启用独立模型}
                            className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-end">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-bold text-violet-200">PNG 提炼模型</label>
                        <InlineSelect
                            value={form.功能模型占位.PNG提炼使用模型}
                            options={PNG提炼模型选项.map((model) => ({ value: model, label: model }))}
                            onChange={(model) => updatePlaceholder('PNG提炼使用模型', model)}
                            disabled={!form.功能模型占位.PNG提炼启用独立模型}
                            placeholder="请选择或输入模型"
                            buttonClassName="bg-black/50 border-gray-600 py-2.5"
                            panelClassName="max-w-full"
                        />
                    </div>
                    <GameButton
                        onClick={() => handleFetchModels('PNG提炼使用模型', 'PNG提炼模型列表')}
                        variant="secondary"
                        className="px-4 py-2 text-xs md:min-w-[96px]"
                        disabled={!form.功能模型占位.PNG提炼启用独立模型 || modelLoading.PNG提炼使用模型}
                    >
                        {modelLoading.PNG提炼使用模型 ? '...' : '获取列表'}
                    </GameButton>
                </div>
                <input
                    type="text"
                    value={form.功能模型占位.PNG提炼使用模型}
                    onChange={(e) => updatePlaceholder('PNG提炼使用模型', e.target.value)}
                    placeholder="例如：gpt-4o-mini / gemini-2.5-flash"
                    disabled={!form.功能模型占位.PNG提炼启用独立模型}
                    className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>

        </div>
    );

    const renderPresetsPage = () => (
        <div className={页面容器样式}>
            <div className={卡片样式}>
                <div className="flex items-center justify-between gap-3">
                    <div className="text-base font-bold text-fuchsia-200">画师串预设</div>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={handleAddArtistPreset} className="rounded-lg border border-fuchsia-500/30 bg-fuchsia-950/20 px-3 py-2 text-xs text-fuchsia-100">新增</button>
                        <button type="button" onClick={handleDeleteArtistPreset} disabled={!selectedArtistPreset} className="rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-2 text-xs text-red-200 disabled:opacity-40">删除</button>
                        <button type="button" onClick={handleExportArtistPresets} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white">导出</button>
                        <button type="button" onClick={() => artistImportRef.current?.click()} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white">导入</button>
                        <input ref={artistImportRef} type="file" accept="application/json" onChange={handleImportArtistPresets} className="hidden" />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
                    <div className="space-y-2">
                        <label className={标签样式}>适用范围</label>
                        <InlineSelect
                            value={artistPresetScope}
                            options={[
                                { value: 'npc', label: 'NPC角色' },
                                { value: 'scene', label: '场景' },
                                { value: 'player', label: '主角' }
                            ]}
                            onChange={(value) => setArtistPresetScope(value as 画师串适用页签)}
                            buttonClassName="bg-black/50 border-gray-600 py-2.5"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className={标签样式}>当前使用预设</label>
                        <InlineSelect
                            value={currentArtistPresetId}
                            options={scopedArtistPresets.map((preset) => ({ value: preset.id, label: preset.名称 }))}
                            onChange={(value) => 更新当前画师串预设ID(artistPresetScope, value)}
                            placeholder="请选择预设"
                            buttonClassName="bg-black/50 border-gray-600 py-2.5"
                        />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
                    <div className="space-y-2">
                        <label className={标签样式}>默认PNG预设</label>
                        <InlineSelect
                            value={currentAutoPngPresetId}
                            options={pngStylePresets.map((preset) => ({ value: preset.id, label: preset.名称 }))}
                            onChange={(value) => 更新当前PNG预设ID(artistPresetScope, value)}
                            placeholder="不启用"
                            buttonClassName="bg-black/50 border-gray-600 py-2.5"
                        />
                    </div>
                </div>

                {selectedArtistPreset ? (
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <label className={标签样式}>预设名称</label>
                            <input
                                type="text"
                                value={selectedArtistPreset.名称}
                                onChange={(e) => updateArtistPreset(selectedArtistPreset.id, (preset) => ({ ...preset, 名称: e.target.value, updatedAt: Date.now() }))}
                                className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-fuchsia-400"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className={标签样式}>正面提示词</label>
                            <textarea
                                value={selectedArtistPreset.正面提示词}
                                onChange={(e) => updateArtistPreset(selectedArtistPreset.id, (preset) => ({ ...preset, 正面提示词: e.target.value, updatedAt: Date.now() }))}
                                rows={5}
                                className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-fuchsia-400 resize-y"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className={标签样式}>负面提示词</label>
                            <textarea
                                value={selectedArtistPreset.负面提示词}
                                onChange={(e) => updateArtistPreset(selectedArtistPreset.id, (preset) => ({ ...preset, 负面提示词: e.target.value, updatedAt: Date.now() }))}
                                rows={4}
                                className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-fuchsia-400 resize-y"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-gray-400">当前范围还没有预设。</div>
                )}
            </div>

            <div className={卡片样式}>
                <div className="flex items-center justify-between gap-3">
                    <div className="text-base font-bold text-cyan-200">词组转化器提示词预设</div>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={handleAddTransformerPreset} className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 px-3 py-2 text-xs text-cyan-100">新增</button>
                        <button type="button" onClick={handleDeleteTransformerPreset} disabled={!selectedTransformerPreset} className="rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-2 text-xs text-red-200 disabled:opacity-40">删除</button>
                        <button type="button" onClick={handleExportTransformerPresets} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white">导出</button>
                        <button type="button" onClick={() => transformerImportRef.current?.click()} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white">导入</button>
                        <input ref={transformerImportRef} type="file" accept="application/json" onChange={handleImportTransformerPresets} className="hidden" />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
                    <div className="space-y-2">
                        <label className={标签样式}>适用类型</label>
                        <InlineSelect
                            value={transformerPresetScope}
                            options={[
                                { value: 'nai', label: 'NAI模式专属' },
                                { value: 'npc', label: 'NPC角色生成' },
                                { value: 'scene', label: '场景专属' },
                                { value: 'player', label: '主角专属' }
                            ]}
                            onChange={(value) => setTransformerPresetScope(value as 词组预设页签)}
                            buttonClassName="bg-black/50 border-gray-600 py-2.5"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className={标签样式}>当前使用预设</label>
                        <InlineSelect
                            value={currentTransformerPresetId}
                            options={scopedTransformerPresets.map((preset) => ({ value: preset.id, label: preset.名称 }))}
                            onChange={(value) => 更新当前词组预设ID(transformerPresetScope, value)}
                            placeholder="请选择预设"
                            buttonClassName="bg-black/50 border-gray-600 py-2.5"
                        />
                    </div>
                </div>

                {selectedTransformerPreset ? (
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <label className={标签样式}>预设名称</label>
                            <input
                                type="text"
                                value={selectedTransformerPreset.名称}
                                onChange={(e) => updateTransformerPreset(selectedTransformerPreset.id, (preset) => ({ ...preset, 名称: e.target.value, updatedAt: Date.now() }))}
                                className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-cyan-400"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className={标签样式}>提示词内容</label>
                            <textarea
                                value={selectedTransformerPreset.提示词}
                                onChange={(e) => updateTransformerPreset(selectedTransformerPreset.id, (preset) => ({ ...preset, 提示词: e.target.value, updatedAt: Date.now() }))}
                                rows={10}
                                className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-cyan-400 resize-y min-h-[220px]"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-gray-400">当前类型还没有预设。</div>
                )}
            </div>
        </div>
    );

    const renderAutomationPage = () => {
        const sceneOrientation = form.功能模型占位.自动场景生图横竖屏 === '竖屏' ? '竖屏' : '横屏';
        const sceneResolutionVerticalOptions = 自动场景竖屏尺寸选项;
        const sceneResolutionHorizontalOptions = 自动场景横屏尺寸选项;
        const sceneResolutionOptions = sceneOrientation === '竖屏'
            ? sceneResolutionVerticalOptions
            : sceneResolutionHorizontalOptions;
        const currentSceneResolution = (form.功能模型占位.自动场景生图分辨率 || '').trim();
        const safeSceneResolution = currentSceneResolution || (sceneOrientation === '竖屏' ? '576x1024' : '1024x576');
        const resolvedSceneResolutionOptions = safeSceneResolution && !sceneResolutionOptions.some((item) => item.value === safeSceneResolution)
            ? [{ value: safeSceneResolution, label: `${safeSceneResolution} (当前)` }, ...sceneResolutionOptions]
            : sceneResolutionOptions;
        const handleSceneOrientationChange = (value: string) => {
            const nextOrientation = value === '竖屏' ? '竖屏' : '横屏';
            updatePlaceholder('自动场景生图横竖屏', nextOrientation);
            const nextOptions = nextOrientation === '竖屏'
                ? sceneResolutionVerticalOptions
                : sceneResolutionHorizontalOptions;
            if (!nextOptions.some((item) => item.value === currentSceneResolution)) {
                updatePlaceholder('自动场景生图分辨率', nextOptions[0]?.value || '');
            }
        };

        return (
            <div className={页面容器样式}>
                <div className={卡片样式}>
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-sky-500/20 bg-sky-950/10 p-4">
                        <div>
                            <div className="text-base font-bold text-sky-200">场景生图模式</div>
                        </div>
                        <ToggleSwitch
                            checked={form.功能模型占位.场景生图启用}
                            onChange={handleToggleSceneMode}
                            ariaLabel="切换场景生图模式"
                        />
                    </div>

                    <div className="rounded-xl border border-sky-900/30 bg-black/20 p-4 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-base font-bold text-sky-200">场景独立生图接口</div>
                            </div>
                            <ToggleSwitch
                                checked={form.功能模型占位.场景生图独立接口启用}
                                onChange={handleToggleSceneIndependentImageApi}
                                ariaLabel="切换场景独立生图接口"
                            />
                        </div>

                        {form.功能模型占位.场景生图独立接口启用 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-sky-200">选择配置</label>
                                    <InlineSelect
                                        value={form.功能模型占位.场景生图使用配置ID || ''}
                                        options={文生图配置列表.map((cfg) => ({ value: cfg.id, label: cfg.名称 }))}
                                        onChange={(id) => {
                                            if (!id) {
                                                updatePlaceholder('场景生图使用配置ID', null);
                                                return;
                                            }
                                            const selected = 文生图配置列表.find((cfg) => cfg.id === id);
                                            if (selected) {
                                                updatePlaceholder('场景生图使用配置ID', id);
                                                updatePlaceholder('场景生图后端类型', selected.后端类型);
                                                updatePlaceholder('场景生图模型API地址', selected.API地址);
                                                updatePlaceholder('场景生图模型API密钥', selected.API密钥);
                                                updatePlaceholder('场景生图模型使用模型', selected.模型);
                                                updatePlaceholder('场景ComfyUI工作流JSON', selected.ComfyUI工作流JSON);
                                            }
                                        }}
                                        buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                        placeholder="选择配置"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-sky-200">场景地址来源</label>
                            <InlineSelect
                                value={form.功能模型占位.场景comfyui地址模式}
                                options={[
                                    { value: 'api', label: '使用上方 API 地址' },
                                    { value: 'cnb', label: '使用 CNB ComfyUI 场景地址' }
                                ]}
                                onChange={(value) => updatePlaceholder('场景comfyui地址模式', value as 'api' | 'cnb')}
                                buttonClassName="bg-black/50 border-gray-600 py-2.5"
                            />
                        </div>
                        {form.功能模型占位.场景comfyui地址模式 === 'cnb' && (
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-sky-200">CNB ComfyUI 场景地址</label>
                                <input
                                    type="text"
                                    value={form.功能模型占位.cnbComfyui场景地址}
                                    onChange={(e) => updatePlaceholder('cnbComfyui场景地址', e.target.value)}
                                    placeholder="留空则复用上方地址"
                                    className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-fuchsia-400"
                                />
                                <p className="text-xs text-gray-400">场景生图可使用独立 CNB 地址，留空则复用上方地址</p>
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-sky-200">场景默认画风</label>
                                <InlineSelect
                                    value={form.功能模型占位.自动场景生图画风}
                                    options={[
                                        { value: '通用', label: '通用' },
                                        { value: '二次元', label: '二次元' },
                                        { value: '国风', label: '国风' },
                                        { value: '写实', label: '写实' }
                                    ]}
                                    onChange={(value) => updatePlaceholder('自动场景生图画风', value as 功能模型占位配置结构['自动场景生图画风'])}
                                    buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-sky-200">场景构图要求</label>
                                <InlineSelect
                                    value={form.功能模型占位.自动场景生图构图要求 || '纯场景'}
                                    options={[
                                        { value: '纯场景', label: '纯场景' },
                                        { value: '故事快照', label: '故事快照' }
                                    ]}
                                    onChange={(value) => updatePlaceholder('自动场景生图构图要求', value as 功能模型占位配置结构['自动场景生图构图要求'])}
                                    buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                />
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-sky-200">场景画面方向</label>
                                <InlineSelect
                                    value={sceneOrientation}
                                    options={[
                                        { value: '横屏', label: '横屏' },
                                        { value: '竖屏', label: '竖屏' }
                                    ]}
                                    onChange={handleSceneOrientationChange}
                                    buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                />
                            </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-sky-200">场景分辨率</label>
                            <InlineSelect
                                value={safeSceneResolution}
                                options={resolvedSceneResolutionOptions}
                                onChange={(value) => updatePlaceholder('自动场景生图分辨率', value)}
                                buttonClassName="bg-black/50 border-gray-600 py-2.5"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-sky-200">自定义分辨率</label>
                        <input
                            type="text"
                            value={safeSceneResolution}
                            onChange={(e) => updatePlaceholder('自动场景生图分辨率', e.target.value)}
                            placeholder="例如：1280x720"
                            className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-sky-400"
                        />
                        <div className="text-xs text-sky-200/70">格式：宽x高（如 1280x720）</div>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="text-base font-bold text-amber-200">NPC 自动生图</div>
                    </div>
                    <ToggleSwitch
                        checked={form.功能模型占位.NPC生图启用}
                        onChange={(next) => updatePlaceholder('NPC生图启用', next)}
                        ariaLabel="切换 NPC 生图"
                    />
                </div>
<div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-amber-200">性别筛选</label>
                            <InlineSelect
                                value={form.功能模型占位.NPC生图性别筛选}
                                options={[
                                    { value: '全部', label: '全部' },
                                    { value: '男', label: '男' },
                                    { value: '女', label: '女' }
                                ]}
                                onChange={(value) => updatePlaceholder('NPC生图性别筛选', value as 功能模型占位配置结构['NPC生图性别筛选'])}
                                buttonClassName="bg-black/50 border-gray-600 py-2.5"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-amber-200">重要性筛选</label>
                            <InlineSelect
                                value={form.功能模型占位.NPC生图重要性筛选}
                                options={[
                                    { value: '全部', label: '全部 NPC' },
                                    { value: '仅重要', label: '只生成重要 NPC' }
                                ]}
                                onChange={(value) => updatePlaceholder('NPC生图重要性筛选', value as 功能模型占位配置结构['NPC生图重要性筛选'])}
                                buttonClassName="bg-black/50 border-gray-600 py-2.5"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-amber-200">NPC 默认画风</label>
                            <InlineSelect
                                value={form.功能模型占位.自动NPC生图画风}
                                options={[
                                    { value: '通用', label: '通用' },
                                    { value: '二次元', label: '二次元' },
                                    { value: '国风', label: '国风' },
                                    { value: '写实', label: '写实' }
                                ]}
                                onChange={(value) => updatePlaceholder('自动NPC生图画风', value as 功能模型占位配置结构['自动NPC生图画风'])}
                                buttonClassName="bg-black/50 border-gray-600 py-2.5"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // 自定义 Hook：提取 renderPlayerPage 中的 useMemo 计算逻辑
    const usePlayerPageData = (form: 接口设置结构, updatePlaceholder: (key: string, value: unknown) => void) => {
        const playerArtistPresets = useMemo(
            () => (Array.isArray(form.功能模型占位.画师串预设列表) ? form.功能模型占位.画师串预设列表 : [])
                .filter((item) => item && typeof item.id === 'string' && !item.id.startsWith('png_artist_')),
            [form.功能模型占位.画师串预设列表]
        );
        const scopedPlayerArtistPresets = useMemo(() => playerArtistPresets.filter((item) => (item.适用范围 as string) === 'player' || (item.适用范围 as string) === 'all'), [playerArtistPresets]);
        const currentPlayerArtistPresetId = form.功能模型占位.主角画师串预设ID;
        const selectedPlayerArtistPreset = scopedPlayerArtistPresets.find((item) => item.id === currentPlayerArtistPresetId)
            || scopedPlayerArtistPresets[0]
            || null;

        const pngPlayerStylePresets = useMemo<PNG画风预设结构[]>(
            () => Array.isArray(form.功能模型占位.PNG画风预设列表) ? form.功能模型占位.PNG画风预设列表 : [],
            [form.功能模型占位.PNG画风预设列表]
        );
        const currentPlayerPngPresetId = form.功能模型占位.主角PNG画风预设ID;
        const selectedPlayerPngPreset = pngPlayerStylePresets.find((item) => item.id === currentPlayerPngPresetId)
            || pngPlayerStylePresets[0]
            || null;

        const transformerPlayerPresets = useMemo(() => Array.isArray(form.功能模型占位.词组转化器提示词预设列表) ? form.功能模型占位.词组转化器提示词预设列表 : [], [form.功能模型占位.词组转化器提示词预设列表]);
        const scopedPlayerTransformerPresets = useMemo(() => transformerPlayerPresets.filter((item) => (item.类型 as string) === 'player' || (item.类型 as string) === 'npc'), [transformerPlayerPresets]);
        const currentPlayerTransformerPresetId = form.功能模型占位.主角词组转化器预设ID;
        const selectedPlayerTransformerPreset = scopedPlayerTransformerPresets.find((item) => item.id === currentPlayerTransformerPresetId)
            || scopedPlayerTransformerPresets[0]
            || null;

        return {
            playerArtistPresets,
            scopedPlayerArtistPresets,
            currentPlayerArtistPresetId,
            selectedPlayerArtistPreset,
            pngPlayerStylePresets,
            currentPlayerPngPresetId,
            selectedPlayerPngPreset,
            transformerPlayerPresets,
            scopedPlayerTransformerPresets,
            currentPlayerTransformerPresetId,
            selectedPlayerTransformerPreset,
        };
    };

    // 在组件顶层调用 Hook
    const playerPageData = usePlayerPageData(form, updatePlaceholder);

    const renderPlayerPage = () => {
        const handleTogglePlayerMode = (checked: boolean) => {
            setForm((prev) => ({
                ...prev,
                功能模型占位: {
                    ...prev.功能模型占位,
                    主角生图启用: checked
                }
            }));
        };

        const 当前主角后端 = form.功能模型占位.主角生图独立接口启用
            ? form.功能模型占位.主角生图后端类型
            : form.功能模型占位.文生图后端类型;
        const 主角文生图模型选项 = Array.from(new Set(
            (当前主角后端 === 'novelai' ? NovelAI模型建议 : [])
                .concat(modelOptions.主角生图模型使用模型, form.功能模型占位.主角生图模型使用模型, form.功能模型占位.文生图模型使用模型)
                .map((item) => (item || '').trim())
                .filter(Boolean)
        ));

        // 使用从 Hook 获取的数据
        const {
            scopedPlayerArtistPresets,
            currentPlayerArtistPresetId,
            selectedPlayerArtistPreset,
            pngPlayerStylePresets,
            currentPlayerPngPresetId,
            selectedPlayerPngPreset,
            scopedPlayerTransformerPresets,
            currentPlayerTransformerPresetId,
            selectedPlayerTransformerPreset,
        } = playerPageData;

        const 更新当前主角画师串预设ID = (presetId: string) => {
            updatePlaceholder('主角画师串预设ID', presetId);
        };

        const 更新当前主角PNG预设ID = (presetId: string) => {
            updatePlaceholder('主角PNG画风预设ID', presetId);
        };

        const 更新当前主角词组预设ID = (presetId: string) => {
            updatePlaceholder('主角词组转化器预设ID', presetId);
        };

        return (
            <div className={页面容器样式}>
                <div className={卡片样式}>
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-950/10 p-4">
                        <div>
                            <div className="text-base font-bold text-amber-200">主角生图独立配置</div>
                        </div>
                        <ToggleSwitch
                            checked={form.功能模型占位.主角生图启用}
                            onChange={handleTogglePlayerMode}
                            ariaLabel="切换主角生图独立配置"
                        />
                    </div>
                </div>

                <div className={卡片样式}>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <div className="text-base font-bold text-amber-200">主角独立接口</div>
                        </div>
                        <ToggleSwitch
                            checked={form.功能模型占位.主角生图独立接口启用}
                            onChange={(next) => {
                                setForm((prev) => ({
                                    ...prev,
                                    功能模型占位: {
                                        ...prev.功能模型占位,
                                        主角生图独立接口启用: next,
                                        主角生图后端类型: next
                                            ? prev.功能模型占位.主角生图后端类型
                                            : prev.功能模型占位.主角生图后端类型,
                                        主角生图模型API地址: next
                                            ? ((prev.功能模型占位.主角生图模型API地址 || '').trim() || (prev.功能模型占位.文生图模型API地址 || '').trim())
                                            : prev.功能模型占位.主角生图模型API地址,
                                        主角生图模型API密钥: next
                                            ? ((prev.功能模型占位.主角生图模型API密钥 || '').trim() || (prev.功能模型占位.文生图模型API密钥 || '').trim())
                                            : prev.功能模型占位.主角生图模型API密钥,
                                        主角生图模型使用模型: next
                                            ? ((prev.功能模型占位.主角生图模型使用模型 || '').trim() || (prev.功能模型占位.文生图模型使用模型 || '').trim())
                                            : prev.功能模型占位.主角生图模型使用模型
                                    }
                                }));
                            }}
                            ariaLabel="切换主角独立接口"
                        />
                    </div>

                    {form.功能模型占位.主角生图独立接口启用 && (
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-amber-200">后端类型</label>
                                    <InlineSelect
                                        value={当前主角后端}
                                        options={文生图后端选项}
                                        onChange={(value) => updatePlaceholder('主角生图后端类型', value as any)}
                                        buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-amber-200">API 地址</label>
                                    <input
                                        type="text"
                                        value={form.功能模型占位.主角生图模型API地址}
                                        onChange={(e) => updatePlaceholder('主角生图模型API地址', e.target.value)}
                                        placeholder="留空则沿用主接口"
                                        className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-amber-400"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 md:flex-row md:items-end">
                                <div className="flex-1 space-y-2">
                                    <label className="text-sm font-bold text-amber-200">模型</label>
                                    <InlineSelect
                                        value={form.功能模型占位.主角生图模型使用模型}
                                        options={主角文生图模型选项.map((model) => ({ value: model, label: model }))}
                                        onChange={(model) => updatePlaceholder('主角生图模型使用模型', model)}
                                        placeholder="请选择或输入模型"
                                        buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                        panelClassName="max-w-full"
                                    />
                                </div>
                                <GameButton
                                    onClick={() => handleFetchModels('主角生图模型使用模型', '主角生图模型列表')}
                                    variant="secondary"
                                    className="px-4 py-2 text-xs md:min-w-[96px]"
                                    disabled={modelLoading.主角生图模型使用模型}
                                >
                                    {modelLoading.主角生图模型使用模型 ? '...' : '获取列表'}
                                </GameButton>
                            </div>
                            <input
                                type="text"
                                value={form.功能模型占位.主角生图模型使用模型}
                                onChange={(e) => updatePlaceholder('主角生图模型使用模型', e.target.value)}
                                placeholder="例如：nai-diffusion-4-5-full"
                                className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-amber-400"
                            />
                        </div>
                    )}
                </div>

                <div className={卡片样式}>
                    <div className="text-base font-bold text-amber-200 mb-4">画师串预设</div>
                    <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-amber-200">当前使用预设</label>
                            <InlineSelect
                                value={currentPlayerArtistPresetId}
                                options={scopedPlayerArtistPresets.map((preset) => ({ value: preset.id, label: preset.名称 }))}
                                onChange={(value) => 更新当前主角画师串预设ID(value)}
                                placeholder="请选择预设"
                                buttonClassName="bg-black/50 border-gray-600 py-2.5"
                            />
                        </div>
                    </div>
                </div>

                <div className={卡片样式}>
                    <div className="text-base font-bold text-amber-200 mb-4">PNG 画风预设</div>
                    <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-amber-200">当前使用预设</label>
                            <InlineSelect
                                value={currentPlayerPngPresetId}
                                options={pngPlayerStylePresets.map((preset) => ({ value: preset.id, label: preset.名称 }))}
                                onChange={(value) => 更新当前主角PNG预设ID(value)}
                                placeholder="不启用"
                                buttonClassName="bg-black/50 border-gray-600 py-2.5"
                            />
                        </div>
                    </div>
                </div>

                <div className={卡片样式}>
                    <div className="text-base font-bold text-amber-200 mb-4">词组转化器预设</div>
                    <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-amber-200">当前使用预设</label>
                            <InlineSelect
                                value={currentPlayerTransformerPresetId}
                                options={scopedPlayerTransformerPresets.map((preset) => ({ value: preset.id, label: preset.名称 }))}
                                onChange={(value) => 更新当前主角词组预设ID(value)}
                                placeholder="请选择预设"
                                buttonClassName="bg-black/50 border-gray-600 py-2.5"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 text-sm animate-fadeIn">
            <div className="rounded-2xl border border-fuchsia-500/30 bg-[radial-gradient(circle_at_top_left,_rgba(217,70,239,0.18),_transparent_42%),linear-gradient(180deg,rgba(16,16,24,0.96),rgba(5,5,10,0.96))] p-5">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                        <h3 className="text-2xl font-bold font-serif text-fuchsia-200">文生图设置</h3>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-right">
                        <div className="text-sm text-gray-400">当前后端</div>
                        <div className="mt-1 text-base text-white">
                            {当前文生图配置 ? 文生图后端选项.find((item) => item.value === 当前文生图配置.后端类型)?.label : '请配置'}
                        </div>
                    </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-5">
                    {可见页面.map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() => setActivePage(item.value)}
                            className={`rounded-xl border px-4 py-3 text-left transition-all ${activePage === item.value
                                ? 'border-fuchsia-400 bg-fuchsia-500/15 text-white shadow-[0_0_0_1px_rgba(217,70,239,0.25)]'
                                : 'border-white/10 bg-black/20 text-gray-300 hover:border-fuchsia-500/40 hover:text-white'
                                }`}
                        >
                            <div className="text-sm font-semibold">{item.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {activePage === 'basic' && renderBasicPage()}
            {activePage === 'provider' && renderProviderPage()}
            {activePage === 'transformer' && renderTransformerPage()}
            {activePage === 'presets' && renderPresetsPage()}
            {activePage === 'automation' && renderAutomationPage()}
            {activePage === 'player' && renderPlayerPage?.()}
            {activePage === 'retry' && (
                <div className={页面容器样式}>
                    <div className={卡片样式}>
                        <div className="text-base font-bold text-fuchsia-200 mb-4">重试次数设置</div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-fuchsia-200">提示词生成重试次数</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="5"
                                    value={form.功能模型占位.提示词生成重试次数 ?? 1}
                                    onChange={(e) => {
                                        const value = Math.max(0, Math.min(5, Number(e.target.value) || 1));
                                        updatePlaceholder('提示词生成重试次数', value);
                                    }}
                                    className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-fuchsia-400"
                                />
                                <p className="text-xs text-gray-400">提示词生成失败时的重试次数 (0-5，默认1)</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-fuchsia-200">图片生成重试次数</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="5"
                                    value={form.功能模型占位.图片生成重试次数 ?? 1}
                                    onChange={(e) => {
                                        const value = Math.max(0, Math.min(5, Number(e.target.value) || 1));
                                        updatePlaceholder('图片生成重试次数', value);
                                    }}
                                    className="w-full rounded-md border-2 border-transparent bg-black/50 p-3 text-white outline-none transition-all focus:border-fuchsia-400"
                                />
                                <p className="text-xs text-gray-400">图片生成失败时的重试次数 (0-5，默认1)</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {message && <p className="animate-pulse text-xs text-wuxia-cyan">{message}</p>}

            <div className="flex gap-3">
                <GameButton
                    onClick={() => handleTestImageConnection(当前文生图配置)}
                    variant="secondary"
                    className="flex-1"
                    disabled={testingConnection}
                >
                    {testingConnection ? '测试中...' : '测试连接'}
                </GameButton>
                <GameButton onClick={handleSave} variant="primary" className="flex-[2]">
                    {showSuccess ? '✔ 文生图配置已保存' : '保存文生图配置'}
                </GameButton>
            </div>

            {testResultModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="mx-4 w-full max-w-lg rounded-xl border border-fuchsia-500/30 bg-gray-900 p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h4 className={`text-lg font-bold font-serif ${testResultModal.ok ? 'text-green-400' : 'text-red-400'}`}>
                                {testResultModal.title || '连接测试结果'}
                            </h4>
                            <button
                                onClick={() => setTestResultModal((prev) => ({ ...prev, open: false }))}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="whitespace-pre-wrap rounded-lg bg-black/40 p-4 text-xs text-gray-200 font-mono max-h-80 overflow-y-auto">
                            {testResultModal.content}
                        </div>
                        <div className="mt-4">
                            <GameButton
                                onClick={() => setTestResultModal((prev) => ({ ...prev, open: false }))}
                                variant={testResultModal.ok ? 'primary' : 'secondary'}
                                className="w-full"
                            >
                                关闭
                            </GameButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageGenerationSettings;
