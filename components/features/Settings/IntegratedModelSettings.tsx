import React, { useEffect, useMemo, useState } from 'react';
import { 接口设置结构, 单接口配置结构, 功能模型占位配置结构 } from '../../../types';
import GameButton from '../../ui/GameButton';
import ToggleSwitch from '../../ui/ToggleSwitch';
import InlineSelect from '../../ui/InlineSelect';
import { 规范化接口设置 } from '../../../utils/apiConfig';
import { 默认文章优化提示词 } from '../../../prompts/runtime/defaults';

interface Props {
    settings: 接口设置结构;
    onSave: (settings: 接口设置结构) => void;
}

type SubTab = 'recall' | 'memory_summary' | 'variable' | 'planning' | 'heroine_plan' | 'polish' | 'world_evolution' | 'device_message';

// 自定义 Hook 用于手动输入显示状态
const useShowManualInput = () => {
    return useState<boolean>(false);
};

const IntegratedModelSettings: React.FC<Props> = ({ settings, onSave }) => {
    const [form, setForm] = useState<接口设置结构>(() => 规范化接口设置(settings));
    const [modelOptions, setModelOptions] = useState<string[]>([]);
    const [loadingModels, setLoadingModels] = useState(false);
    const [message, setMessage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [activeSubTab, setActiveSubTab] = useState<SubTab>('memory_summary');

    useEffect(() => {
        const normalized = 规范化接口设置(settings);
        setForm(normalized);
        setModelOptions([]);
    }, [settings]);

    const activeConfig = useMemo<单接口配置结构 | null>(() => {
        if (!form.configs.length) return null;
        const selected = form.configs.find((cfg) => cfg.id === form.activeConfigId);
        return selected || form.configs[0] || null;
    }, [form.activeConfigId, form.configs]);

    const apiConfigOptions = useMemo(() => {
        return form.configs.map((cfg) => ({
            value: cfg.id,
            label: cfg.名称 || cfg.id
        }));
    }, [form.configs]);

    const getConfigById = (configId: string): 单接口配置结构 | undefined => {
        return form.configs.find((cfg) => cfg.id === configId);
    };

    const 主剧情解析模型 = useMemo(() => {
        return (form.功能模型占位.主剧情使用模型 || '').trim();
    }, [form.功能模型占位.主剧情使用模型]);

    const updatePlaceholder = <K extends keyof 功能模型占位配置结构>(key: K, value: 功能模型占位配置结构[K]) => {
        setForm((prev) => ({
            ...prev,
            功能模型占位: {
                ...prev.功能模型占位,
                [key]: value
            }
        }));
    };

    const fetchModelsFromCurrentConfig = async (useIndependent: boolean, independentApiUrl: string, independentApiKey: string): Promise<string[] | null> => {
        const resolvedBaseUrl = useIndependent && independentApiUrl
            ? independentApiUrl
            : (activeConfig?.baseUrl || '');
        const resolvedApiKey = useIndependent && independentApiKey
            ? independentApiKey
            : (activeConfig?.apiKey || '');
        if (!resolvedApiKey || !resolvedBaseUrl) {
            setMessage('请先填写可用的 API Key 与 Base URL（支持独立密钥）。');
            return null;
        }
        try {
            const base = resolvedBaseUrl.replace(/\/+$/, '');
            const normalized = base.replace(/\/v1$/i, '');
            const candidateUrls = Array.from(new Set([
                `${normalized}/v1/models`,
                `${normalized}/models`,
                `${base}/models`
            ]));
            for (const url of candidateUrls) {
                const res = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${resolvedApiKey}`
                    }
                });
                if (!res.ok) continue;
                const data = await res.json();
                if (data && Array.isArray(data.data)) {
                    return data.data.map((m: any) => m?.id).filter(Boolean);
                }
            }
            setMessage('获取失败：返回格式错误。');
            return null;
        } catch (error: any) {
            setMessage(`获取失败：${error.message}`);
            return null;
        }
    };

    const handleFetchModels = async () => {
        setLoadingModels(true);
        setMessage('');
        
        let currentModelKey = '';
        let currentApiUrl = '';
        let currentApiKey = '';
        
        if (activeSubTab === 'recall') {
            currentModelKey = '剧情回忆';
            currentApiUrl = form.功能模型占位.剧情回忆API地址 || '';
            currentApiKey = form.功能模型占位.剧情回忆API密钥 || '';
        } else if (activeSubTab === 'memory_summary') {
            currentModelKey = '记忆总结';
            currentApiUrl = form.功能模型占位.记忆总结API地址 || '';
            currentApiKey = form.功能模型占位.记忆总结API密钥 || '';
        } else if (activeSubTab === 'variable') {
            currentModelKey = '变量生成';
            currentApiUrl = form.功能模型占位.变量计算API地址 || '';
            currentApiKey = form.功能模型占位.变量计算API密钥 || '';
        } else if (activeSubTab === 'planning') {
            currentModelKey = '规划分析';
            currentApiUrl = form.功能模型占位.规划分析API地址 || '';
            currentApiKey = form.功能模型占位.规划分析API密钥 || '';
        } else if (activeSubTab === 'heroine_plan') {
            currentModelKey = '女主规划';
            currentApiUrl = form.功能模型占位.女主规划API地址 || '';
            currentApiKey = form.功能模型占位.女主规划API密钥 || '';
        } else if (activeSubTab === 'polish') {
            currentModelKey = '文章优化';
            currentApiUrl = form.功能模型占位.文章优化API地址 || '';
            currentApiKey = form.功能模型占位.文章优化API密钥 || '';
        } else if (activeSubTab === 'world_evolution') {
            currentModelKey = '世界演变';
            currentApiUrl = form.功能模型占位.世界演变API地址 || '';
            currentApiKey = form.功能模型占位.世界演变API密钥 || '';
        } else if (activeSubTab === 'device_message') {
            currentModelKey = '设备消息';
            currentApiUrl = form.功能模型占位.设备消息API地址 || '';
            currentApiKey = form.功能模型占位.设备消息API密钥 || '';
        }
        
        const isIndependent = activeSubTab === 'recall'
            ? Boolean(form.功能模型占位.剧情回忆独立模型开关)
            : activeSubTab === 'memory_summary'
            ? Boolean(form.功能模型占位.记忆总结独立模型开关)
            : activeSubTab === 'variable'
            ? Boolean(form.功能模型占位.变量计算独立模型开关)
            : activeSubTab === 'planning'
            ? Boolean(form.功能模型占位.规划分析独立模型开关)
            : activeSubTab === 'heroine_plan'
            ? Boolean(form.功能模型占位.女主规划独立模型开关)
            : activeSubTab === 'polish'
            ? Boolean(form.功能模型占位.文章优化独立模型开关)
            : activeSubTab === 'world_evolution'
            ? Boolean(form.功能模型占位.世界演变独立模型开关)
            : Boolean(form.功能模型占位.设备消息独立模型开关);
            
        const models = await fetchModelsFromCurrentConfig(isIndependent, currentApiUrl, currentApiKey);
        if (models) {
            setModelOptions(models);
            setMessage(`${currentModelKey}模型列表获取成功。`);
        }
        setLoadingModels(false);
    };

    const 记忆总结独立开启 = Boolean(form.功能模型占位.记忆总结独立模型开关);
    const 记忆总结API地址 = (form.功能模型占位.记忆总结API地址 || '').trim();
    const 记忆总结API密钥 = (form.功能模型占位.记忆总结API密钥 || '').trim();

    const handleToggleMemorySummary = (checked: boolean) => {
        setForm((prev) => {
            const currentModel = (prev.功能模型占位.记忆总结使用模型 || '').trim();
            return {
                ...prev,
                功能模型占位: {
                    ...prev.功能模型占位,
                    记忆总结独立模型开关: checked,
                    记忆总结使用模型: checked ? (currentModel || 主剧情解析模型 || '') : ''
                }
            };
        });
    };

    const 文章优化独立开启 = Boolean(form.功能模型占位.文章优化独立模型开关);
    const 文章优化API地址 = (form.功能模型占位.文章优化API地址 || '').trim();
    const 文章优化API密钥 = (form.功能模型占位.文章优化API密钥 || '').trim();

    const handleTogglePolish = (checked: boolean) => {
        setForm((prev) => {
            const currentModel = (prev.功能模型占位.文章优化使用模型 || '').trim();
            return {
                ...prev,
                功能模型占位: {
                    ...prev.功能模型占位,
                    文章优化独立模型开关: checked,
                    文章优化使用模型: checked ? (currentModel || 主剧情解析模型 || '') : ''
                }
            };
        });
    };

    const 剧情回忆独立开启 = Boolean(form.功能模型占位.剧情回忆独立模型开关);
    const 剧情回忆API地址 = (form.功能模型占位.剧情回忆API地址 || '').trim();
    const 剧情回忆API密钥 = (form.功能模型占位.剧情回忆API密钥 || '').trim();

    const handleToggleRecall = (checked: boolean) => {
        setForm((prev) => {
            const currentModel = (prev.功能模型占位.剧情回忆使用模型 || '').trim();
            return {
                ...prev,
                功能模型占位: {
                    ...prev.功能模型占位,
                    剧情回忆独立模型开关: checked,
                    剧情回忆使用模型: checked ? (currentModel || 主剧情解析模型 || '') : ''
                }
            };
        });
    };

    const 变量计算独立开启 = Boolean(form.功能模型占位.变量计算独立模型开关);
    const 变量计算API地址 = (form.功能模型占位.变量计算API地址 || '').trim();
    const 变量计算API密钥 = (form.功能模型占位.变量计算API密钥 || '').trim();

    const handleToggleVariable = (checked: boolean) => {
        setForm((prev) => {
            return {
                ...prev,
                功能模型占位: {
                    ...prev.功能模型占位,
                    变量计算独立模型开关: checked,
                    变量计算使用模型: (prev.功能模型占位.变量计算使用模型 || '').trim() || 主剧情解析模型 || ''
                }
            };
        });
    };

    const 规划分析独立开启 = Boolean(form.功能模型占位.规划分析独立模型开关);
    const 规划分析API地址 = (form.功能模型占位.规划分析API地址 || '').trim();
    const 规划分析API密钥 = (form.功能模型占位.规划分析API密钥 || '').trim();

    const handleTogglePlanning = (checked: boolean) => {
        setForm((prev) => ({
            ...prev,
            功能模型占位: {
                ...prev.功能模型占位,
                规划分析独立模型开关: checked,
                规划分析使用模型: (prev.功能模型占位.规划分析使用模型 || '').trim() || 主剧情解析模型 || ''
            }
        }));
    };

    const 女主规划独立开启 = Boolean(form.功能模型占位.女主规划独立模型开关);
    const 女主规划API地址 = (form.功能模型占位.女主规划API地址 || '').trim();
    const 女主规划API密钥 = (form.功能模型占位.女主规划API密钥 || '').trim();

    const handleToggleHeroinePlan = (checked: boolean) => {
        setForm((prev) => ({
            ...prev,
            功能模型占位: {
                ...prev.功能模型占位,
                女主规划独立模型开关: checked,
                女主规划使用模型: (prev.功能模型占位.女主规划使用模型 || '').trim() || 主剧情解析模型 || ''
            }
        }));
    };

    const 世界演变独立开启 = Boolean(form.功能模型占位.世界演变独立模型开关);
    const 世界演变API地址 = (form.功能模型占位.世界演变API地址 || '').trim();
    const 世界演变API密钥 = (form.功能模型占位.世界演变API密钥 || '').trim();

    const handleToggleWorldEvolution = (checked: boolean) => {
        setForm((prev) => {
            const currentModel = (prev.功能模型占位.世界演变使用模型 || '').trim();
            return {
                ...prev,
                功能模型占位: {
                    ...prev.功能模型占位,
                    世界演变独立模型开关: checked,
                    世界演变使用模型: checked ? (currentModel || 主剧情解析模型 || '') : ''
                }
            };
        });
    };

    const 设备消息独立开启 = Boolean(form.功能模型占位.设备消息独立模型开关);

    const handleToggleDeviceMessage = (checked: boolean) => {
        setForm((prev) => ({
            ...prev,
            功能模型占位: {
                ...prev.功能模型占位,
                设备消息独立模型开关: checked,
                设备消息使用模型: checked ? ((prev.功能模型占位.设备消息使用模型 || '').trim() || 主剧情解析模型 || '') : ''
            }
        }));
    };

    const handleSave = () => {
        const normalized = 规范化接口设置(form);
        onSave(normalized);
        setForm(normalized);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    const subTabs = [
        { id: 'recall' as const, label: '剧情回忆' },
        { id: 'memory_summary' as const, label: '记忆总结' },
        { id: 'variable' as const, label: '变量生成' },
        { id: 'planning' as const, label: '规划分析' },
        { id: 'heroine_plan' as const, label: '女主规划' },
        { id: 'polish' as const, label: '文章优化' },
        { id: 'world_evolution' as const, label: '世界演变' },
        { id: 'device_message' as const, label: '设备消息' }
    ];

    // 每个 tab 的 showManualInput 状态
    const [recallShowManualInput, setRecallShowManualInput] = useShowManualInput();
    const [memorySummaryShowManualInput, setMemorySummaryShowManualInput] = useShowManualInput();
    const [variableShowManualInput, setVariableShowManualInput] = useShowManualInput();
    const [planningShowManualInput, setPlanningShowManualInput] = useShowManualInput();
    const [heroinePlanShowManualInput, setHeroinePlanShowManualInput] = useShowManualInput();
    const [polishShowManualInput, setPolishShowManualInput] = useShowManualInput();
    const [worldEvolutionShowManualInput, setWorldEvolutionShowManualInput] = useShowManualInput();
    const [deviceMessageShowManualInput, setDeviceMessageShowManualInput] = useShowManualInput();

const renderSubContent = () => {
        if (activeSubTab === 'recall') {
            const modelValue = (form.功能模型占位.剧情回忆使用模型 || '').trim();
            const selectedConfigId = form.功能模型占位.剧情回忆使用配置ID;
            const selectedRefConfig = selectedConfigId ? getConfigById(selectedConfigId) : null;
            const modelDisplay = 剧情回忆独立开启 ? modelValue : 主剧情解析模型;
            const selectOptions = Array.from(new Set([
                ...modelOptions,
                modelValue,
                主剧情解析模型
            ].map((item) => (item || '').trim()).filter(Boolean)));
            const showManualInput = recallShowManualInput;
            const setShowManualInput = setRecallShowManualInput;

            return (
                <div className="space-y-4">
                    <div className="text-[11px] text-gray-400">
                        当前启用接口配置：{activeConfig?.名称 || '未配置'}。开启独立模型后选择一个已有配置，或手动输入 API 地址和密钥。
                    </div>

                    <label className="flex items-center justify-between gap-3 text-xs text-gray-300">
                        <span>开启剧情回忆独立模型</span>
                        <ToggleSwitch
                            checked={剧情回忆独立开启}
                            onChange={handleToggleRecall}
                            ariaLabel="切换剧情回忆独立模型"
                        />
                    </label>

                    {剧情回忆独立开启 && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-300">引用接口配置</label>
                                <InlineSelect
                                    value={selectedConfigId}
                                    options={apiConfigOptions}
                                    onChange={(configId) => {
                                        updatePlaceholder('剧情回忆使用配置ID', configId);
                                        if (configId) {
                                            const refCfg = getConfigById(configId);
                                            if (refCfg) {
                                                updatePlaceholder('剧情回忆API地址', refCfg.baseUrl || '');
                                                updatePlaceholder('剧情回忆API密钥', refCfg.apiKey || '');
                                            }
                                        }
                                    }}
                                    disabled={apiConfigOptions.length === 0}
                                    placeholder="请选择接口配置"
                                    buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                />
                            </div>

                            <div className="flex gap-3 items-end">
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs text-gray-300">剧情回忆使用模型</label>
                                    <InlineSelect
                                        value={modelDisplay}
                                        options={selectOptions.map((model) => ({ value: model, label: model }))}
                                        onChange={(model) => updatePlaceholder('剧情回忆使用模型', model)}
                                        disabled={selectOptions.length === 0}
                                        placeholder={selectOptions.length ? '请选择模型' : '请先点击获取列表'}
                                        buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                    />
                                </div>
                                <GameButton
                                    onClick={handleFetchModels}
                                    variant="secondary"
                                    className="px-4 py-2 text-xs"
                                    disabled={loadingModels}
                                >
                                    {loadingModels ? '...' : '获取列表'}
                                </GameButton>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowManualInput(!showManualInput)}
                                className="text-xs text-gray-500 hover:text-gray-300"
                            >
                                {showManualInput ? '▲ 隐藏手动输入' : '▼ 显示手动输入'}
                            </button>

                            {showManualInput && (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-300">剧情回忆独立 API 地址</label>
                                        <input
                                            type="text"
                                            value={form.功能模型占位.剧情回忆API地址 || ''}
                                            onChange={(e) => updatePlaceholder('剧情回忆API地址', e.target.value)}
                                            placeholder={selectedRefConfig?.baseUrl || activeConfig?.baseUrl || '留空则复用主剧情 Base URL'}
                                            className="w-full border p-2 text-white rounded-md outline-none bg-black/50 border-gray-700 focus:border-wuxia-gold"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-300">剧情回忆独立 API 密钥</label>
                                        <input
                                            type="password"
                                            value={form.功能模型占位.剧情回忆API密钥 || ''}
                                            onChange={(e) => updatePlaceholder('剧情回忆API密钥', e.target.value)}
                                            placeholder={selectedRefConfig?.apiKey ? '留空则复用配置 Key' : 'sk-...'}
                                            className="w-full border p-2 text-white rounded-md outline-none bg-black/50 border-gray-700 focus:border-wuxia-gold"
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {!剧情回忆独立开启 && (
                        <div className="text-[11px] text-gray-400">当前状态：剧情回忆检索关闭</div>
                    )}

                    <div className="rounded-md border border-wuxia-cyan/25 bg-black/20 p-4 space-y-4">
                        <div className="text-xs text-wuxia-cyan font-bold">剧情回忆检索策略（本地设置）</div>
                        <label className="flex items-center justify-between gap-3 text-xs text-gray-300">
                            <span>静默操作（不弹确认，自动附加回忆）</span>
                            <ToggleSwitch
                                checked={Boolean(form.功能模型占位.剧情回忆静默确认)}
                                onChange={(next) => updatePlaceholder('剧情回忆静默确认', next)}
                                ariaLabel="切换剧情回忆静默操作"
                            />
                        </label>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-300">完整原文回忆条数（最近 N 条）</label>
                            <input
                                type="number"
                                min={1}
                                max={100}
                                value={Number(form.功能模型占位.剧情回忆完整原文条数N || 20)}
                                onChange={(e) => updatePlaceholder('剧情回忆完整原文条数N', Math.max(1, Number(e.target.value) || 20))}
                                className="w-full bg-black/50 border border-gray-700 p-2 text-white rounded-md outline-none focus:border-wuxia-gold"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-300">在第几回合前不触发剧情回忆检索</label>
                            <input
                                type="number"
                                min={1}
                                max={9999}
                                value={Number(form.功能模型占位.剧情回忆最早触发回合 || 10)}
                                onChange={(e) => updatePlaceholder('剧情回忆最早触发回合', Math.max(1, Number(e.target.value) || 10))}
                                className="w-full bg-black/50 border border-gray-700 p-2 text-white rounded-md outline-none focus:border-wuxia-gold"
                            />
                            <div className="text-[11px] text-gray-500">例如填写 6，则回合 1-5 不调用剧情回忆 API，从第 6 回合开始启用。</div>
                        </div>
                    </div>
                </div>
            );
        }

        if (activeSubTab === 'memory_summary') {
            const modelValue = (form.功能模型占位.记忆总结使用模型 || '').trim();
            const selectedConfigId = form.功能模型占位.记忆总结使用配置ID;
            const selectedRefConfig = selectedConfigId ? getConfigById(selectedConfigId) : null;
            const modelDisplay = 记忆总结独立开启 ? modelValue : 主剧情解析模型;
            const selectOptions = Array.from(new Set([
                ...modelOptions,
                modelValue,
                主剧情解析模型
            ].map((item) => (item || '').trim()).filter(Boolean)));
            const showManualInput = memorySummaryShowManualInput;
            const setShowManualInput = setMemorySummaryShowManualInput;

            return (
                <div className="space-y-4">
                    <div className="text-[11px] text-gray-400">
                        当前启用接口配置：{activeConfig?.名称 || '未配置'}。该设置同时作用于"短期转中期""中期转长期"以及 NPC 记忆总结流程；开启独立模型后选择一个已有配置，或手动输入 API 地址和密钥。
                    </div>

                    <label className="flex items-center justify-between gap-3 text-xs text-gray-300">
                        <span>开启记忆总结独立模型</span>
                        <ToggleSwitch
                            checked={记忆总结独立开启}
                            onChange={handleToggleMemorySummary}
                            ariaLabel="切换记忆总结独立模型"
                        />
                    </label>

                    {记忆总结独立开启 && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-300">引用接口配置</label>
                                <InlineSelect
                                    value={selectedConfigId}
                                    options={apiConfigOptions}
                                    onChange={(configId) => {
                                        updatePlaceholder('记忆总结使用配置ID', configId);
                                        if (configId) {
                                            const refCfg = getConfigById(configId);
                                            if (refCfg) {
                                                updatePlaceholder('记忆总结API地址', refCfg.baseUrl || '');
                                                updatePlaceholder('记忆总结API密钥', refCfg.apiKey || '');
                                            }
                                        }
                                    }}
                                    disabled={apiConfigOptions.length === 0}
                                    placeholder="请选择接口配置"
                                    buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                />
                            </div>

                            <div className="flex gap-3 items-end">
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs text-gray-300">记忆总结使用模型</label>
                                    <InlineSelect
                                        value={modelDisplay}
                                        options={selectOptions.map((model) => ({ value: model, label: model }))}
                                        onChange={(model) => updatePlaceholder('记忆总结使用模型', model)}
                                        disabled={selectOptions.length === 0}
                                        placeholder={selectOptions.length ? '请选择模型' : '请先点击获取列表'}
                                        buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                    />
                                </div>
                                <GameButton
                                    onClick={handleFetchModels}
                                    variant="secondary"
                                    className="px-4 py-2 text-xs"
                                    disabled={loadingModels}
                                >
                                    {loadingModels ? '...' : '获取列表'}
                                </GameButton>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowManualInput(!showManualInput)}
                                className="text-xs text-gray-500 hover:text-gray-300"
                            >
                                {showManualInput ? '▲ 隐藏手动输入' : '▼ 显示手动输入'}
                            </button>

                            {showManualInput && (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-300">记忆总结独立 API 地址</label>
                                        <input
                                            type="text"
                                            value={form.功能模型占位.记忆总结API地址 || ''}
                                            onChange={(e) => updatePlaceholder('记忆总结API地址', e.target.value)}
                                            placeholder={selectedRefConfig?.baseUrl || activeConfig?.baseUrl || '留空则复用主剧情 Base URL'}
                                            className="w-full border p-2 text-white rounded-md outline-none bg-black/50 border-gray-700 focus:border-wuxia-gold"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-300">记忆总结独立 API 密钥</label>
                                        <input
                                            type="password"
                                            value={form.功能模型占位.记忆总结API密钥 || ''}
                                            onChange={(e) => updatePlaceholder('记忆总结API密钥', e.target.value)}
                                            placeholder={selectedRefConfig?.apiKey ? '留空则复用配置 Key' : 'sk-...'}
                                            className="w-full border p-2 text-white rounded-md outline-none bg-black/50 border-gray-700 focus:border-wuxia-gold"
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {!记忆总结独立开启 && (
                        <div className="text-[11px] text-gray-400">
                            当前状态：跟随剧情回忆接口，若剧情回忆未启用则回退主剧情接口。
                        </div>
                    )}
                </div>
            );
        }

        if (activeSubTab === 'variable') {
            const modelValue = (form.功能模型占位.变量计算使用模型 || '').trim();
            const selectedConfigId = form.功能模型占位.变量计算使用配置ID;
            const selectedRefConfig = selectedConfigId ? getConfigById(selectedConfigId) : null;
            const modelDisplay = 变量计算独立开启 ? modelValue : 主剧情解析模型;
            const selectOptions = Array.from(new Set([
                ...modelOptions,
                modelValue,
                主剧情解析模型
            ].map((item) => (item || '').trim()).filter(Boolean)));
            const showManualInput = variableShowManualInput;
            const setShowManualInput = setVariableShowManualInput;

            return (
                <div className="space-y-4">
                    <div className="text-[11px] text-gray-400">
                        当前启用接口配置：{activeConfig?.名称 || '未配置'}。开启后，会启用本地确定性修正与独立变量生成链路；开启独立模型后选择一个已有配置，或手动输入 API 地址和密钥。
                    </div>

                    <label className="flex items-center justify-between gap-3 text-xs text-gray-300">
                        <span>启用变量生成</span>
                        <ToggleSwitch
                            checked={变量计算独立开启}
                            onChange={handleToggleVariable}
                            ariaLabel="切换变量生成"
                        />
                    </label>

                    {变量计算独立开启 && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-300">引用接口配置</label>
                                <InlineSelect
                                    value={selectedConfigId}
                                    options={apiConfigOptions}
                                    onChange={(configId) => {
                                        updatePlaceholder('变量计算使用配置ID', configId);
                                        if (configId) {
                                            const refCfg = getConfigById(configId);
                                            if (refCfg) {
                                                updatePlaceholder('变量计算API地址', refCfg.baseUrl || '');
                                                updatePlaceholder('变量计算API密钥', refCfg.apiKey || '');
                                            }
                                        }
                                    }}
                                    disabled={apiConfigOptions.length === 0}
                                    placeholder="请选择接口配置"
                                    buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                />
                            </div>

                            <div className="flex gap-3 items-end">
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs text-gray-300">变量生成使用模型</label>
                                    <InlineSelect
                                        value={modelDisplay}
                                        options={selectOptions.map((model) => ({ value: model, label: model }))}
                                        onChange={(model) => updatePlaceholder('变量计算使用模型', model)}
                                        disabled={selectOptions.length === 0}
                                        placeholder={selectOptions.length ? '请选择模型' : '请先点击获取列表'}
                                        buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                    />
                                </div>
                                <GameButton
                                    onClick={handleFetchModels}
                                    variant="secondary"
                                    className="px-4 py-2 text-xs"
                                    disabled={loadingModels}
                                >
                                    {loadingModels ? '...' : '获取列表'}
                                </GameButton>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowManualInput(!showManualInput)}
                                className="text-xs text-gray-500 hover:text-gray-300"
                            >
                                {showManualInput ? '▲ 隐藏手动输入' : '▼ 显示手动输入'}
                            </button>

                            {showManualInput && (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-300">变量独立 API 地址</label>
                                        <input
                                            type="text"
                                            value={form.功能模型占位.变量计算API地址 || ''}
                                            onChange={(e) => updatePlaceholder('变量计算API地址', e.target.value)}
                                            placeholder={selectedRefConfig?.baseUrl || activeConfig?.baseUrl || '留空则复用主剧情 Base URL'}
                                            className="w-full border p-2 text-white rounded-md outline-none bg-black/50 border-gray-700 focus:border-cyan-400"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-300">变量独立 API 密钥</label>
                                        <input
                                            type="password"
                                            value={form.功能模型占位.变量计算API密钥 || ''}
                                            onChange={(e) => updatePlaceholder('变量计算API密钥', e.target.value)}
                                            placeholder={selectedRefConfig?.apiKey ? '留空则复用配置 Key' : 'sk-...'}
                                            className="w-full border p-2 text-white rounded-md outline-none bg-black/50 border-gray-700 focus:border-cyan-400"
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    <div className="rounded-md border border-cyan-500/20 bg-black/25 p-3 text-[11px] leading-5 text-gray-400">
                        返回内容只用于变量更新，不参与正文生成。变量模型失败时，会自动回退为"主剧情命令 + 本地变量修正"。
                    </div>
                </div>
            );
        }

        if (activeSubTab === 'planning') {
            const modelValue = (form.功能模型占位.规划分析使用模型 || '').trim();
            const selectedConfigId = form.功能模型占位.规划分析使用配置ID;
            const selectedRefConfig = selectedConfigId ? getConfigById(selectedConfigId) : null;
            const modelDisplay = 规划分析独立开启 ? modelValue : 主剧情解析模型;
            const selectOptions = Array.from(new Set([
                ...modelOptions,
                modelValue,
                主剧情解析模型
            ].map((item) => (item || '').trim()).filter(Boolean)));
            const showManualInput = planningShowManualInput;
            const setShowManualInput = setPlanningShowManualInput;

            return (
                <div className="space-y-4">
                    <div className="text-[11px] text-gray-400">当前启用接口配置：{activeConfig?.名称 || '未配置'}。开启独立模型后选择一个已有配置，或手动输入 API 地址和密钥。</div>
                    <label className="flex items-center justify-between gap-3 text-xs text-gray-300">
                        <span>启用规划分析独立模型</span>
                        <ToggleSwitch checked={规划分析独立开启} onChange={handleTogglePlanning} ariaLabel="切换规划分析独立模型" />
                    </label>

                    {规划分析独立开启 && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-300">引用接口配置</label>
                                <InlineSelect
                                    value={selectedConfigId}
                                    options={apiConfigOptions}
                                    onChange={(configId) => {
                                        updatePlaceholder('规划分析使用配置ID', configId);
                                        if (configId) {
                                            const refCfg = getConfigById(configId);
                                            if (refCfg) {
                                                updatePlaceholder('规划分析API地址', refCfg.baseUrl || '');
                                                updatePlaceholder('规划分析API密钥', refCfg.apiKey || '');
                                            }
                                        }
                                    }}
                                    disabled={apiConfigOptions.length === 0}
                                    placeholder="请选择接口配置"
                                    buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                />
                            </div>

                            <div className="flex gap-3 items-end">
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs text-gray-300">规划分析使用模型</label>
                                    <InlineSelect
                                        value={modelDisplay}
                                        options={selectOptions.map((model) => ({ value: model, label: model }))}
                                        onChange={(model) => updatePlaceholder('规划分析使用模型', model)}
                                        disabled={selectOptions.length === 0}
                                        placeholder={selectOptions.length ? '请选择模型' : '请先点击获取列表'}
                                        buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                    />
                                </div>
                                <GameButton onClick={handleFetchModels} variant="secondary" className="px-4 py-2 text-xs" disabled={loadingModels}>
                                    {loadingModels ? '...' : '获取列表'}
                                </GameButton>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowManualInput(!showManualInput)}
                                className="text-xs text-gray-500 hover:text-gray-300"
                            >
                                {showManualInput ? '▲ 隐藏手动输入' : '▼ 显示手动输入'}
                            </button>

                            {showManualInput && (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-300">规划分析独立 API 地址</label>
                                        <input
                                            type="text"
                                            value={form.功能模型占位.规划分析API地址 || ''}
                                            onChange={(e) => updatePlaceholder('规划分析API地址', e.target.value)}
                                            placeholder={selectedRefConfig?.baseUrl || activeConfig?.baseUrl || '留空则复用主剧情 Base URL'}
                                            className="w-full border p-2 text-white rounded-md outline-none bg-black/50 border-gray-700 focus:border-cyan-400"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-300">规划分析独立 API 密钥</label>
                                        <input
                                            type="password"
                                            value={form.功能模型占位.规划分析API密钥 || ''}
                                            onChange={(e) => updatePlaceholder('规划分析API密钥', e.target.value)}
                                            placeholder={selectedRefConfig?.apiKey ? '留空则复用配置 Key' : 'sk-...'}
                                            className="w-full border p-2 text-white rounded-md outline-none bg-black/50 border-gray-700 focus:border-cyan-400"
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            );
        }

        if (activeSubTab === 'heroine_plan') {
            const modelValue = (form.功能模型占位.女主规划使用模型 || '').trim();
            const selectedConfigId = form.功能模型占位.女主规划使用配置ID;
            const selectedRefConfig = selectedConfigId ? getConfigById(selectedConfigId) : null;
            const modelDisplay = 女主规划独立开启 ? modelValue : 主剧情解析模型;
            const selectOptions = Array.from(new Set([
                ...modelOptions,
                modelValue,
                主剧情解析模型
            ].map((item) => (item || '').trim()).filter(Boolean)));
            const showManualInput = heroinePlanShowManualInput;
            const setShowManualInput = setHeroinePlanShowManualInput;

            return (
                <div className="space-y-4">
                    <div className="text-[11px] text-gray-400">当前启用接口配置：{activeConfig?.名称 || '未配置'}。为女主剧情规划提供独立更新模型，失败时回退为主流程状态。开启独立模型后选择一个已有配置，或手动输入 API 地址和密钥。</div>
                    <label className="flex items-center justify-between gap-3 text-xs text-gray-300">
                        <span>启用女主规划独立模型</span>
                        <ToggleSwitch checked={女主规划独立开启} onChange={handleToggleHeroinePlan} ariaLabel="切换女主规划独立模型" />
                    </label>

                    {女主规划独立开启 && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-300">引用接口配置</label>
                                <InlineSelect
                                    value={selectedConfigId}
                                    options={apiConfigOptions}
                                    onChange={(configId) => {
                                        updatePlaceholder('女主规划使用配置ID', configId);
                                        if (configId) {
                                            const refCfg = getConfigById(configId);
                                            if (refCfg) {
                                                updatePlaceholder('女主规划API地址', refCfg.baseUrl || '');
                                                updatePlaceholder('女主规划API密钥', refCfg.apiKey || '');
                                            }
                                        }
                                    }}
                                    disabled={apiConfigOptions.length === 0}
                                    placeholder="请选择接口配置"
                                    buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                />
                            </div>

                            <div className="flex gap-3 items-end">
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs text-gray-300">女主规划使用模型</label>
                                    <InlineSelect
                                        value={modelDisplay}
                                        options={selectOptions.map((model) => ({ value: model, label: model }))}
                                        onChange={(model) => updatePlaceholder('女主规划使用模型', model)}
                                        disabled={selectOptions.length === 0}
                                        placeholder={selectOptions.length ? '请选择模型' : '请先点击获取列表'}
                                        buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                    />
                                </div>
                                <GameButton onClick={handleFetchModels} variant="secondary" className="px-4 py-2 text-xs" disabled={loadingModels}>
                                    {loadingModels ? '...' : '获取列表'}
                                </GameButton>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowManualInput(!showManualInput)}
                                className="text-xs text-gray-500 hover:text-gray-300"
                            >
                                {showManualInput ? '▲ 隐藏手动输入' : '▼ 显示手动输入'}
                            </button>

                            {showManualInput && (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-300">女主规划独立 API 地址</label>
                                        <input
                                            type="text"
                                            value={form.功能模型占位.女主规划API地址 || ''}
                                            onChange={(e) => updatePlaceholder('女主规划API地址', e.target.value)}
                                            placeholder={selectedRefConfig?.baseUrl || activeConfig?.baseUrl || '留空则复用主剧情 Base URL'}
                                            className="w-full border p-2 text-white rounded-md outline-none bg-black/50 border-gray-700 focus:border-pink-400"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-300">女主规划独立 API 密钥</label>
                                        <input
                                            type="password"
                                            value={form.功能模型占位.女主规划API密钥 || ''}
                                            onChange={(e) => updatePlaceholder('女主规划API密钥', e.target.value)}
                                            placeholder={selectedRefConfig?.apiKey ? '留空则复用配置 Key' : 'sk-...'}
                                            className="w-full border p-2 text-white rounded-md outline-none bg-black/50 border-gray-700 focus:border-pink-400"
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            );
        }

        if (activeSubTab === 'polish') {
            const modelValue = (form.功能模型占位.文章优化使用模型 || '').trim();
            const selectedConfigId = form.功能模型占位.文章优化使用配置ID;
            const selectedRefConfig = selectedConfigId ? getConfigById(selectedConfigId) : null;
            const modelDisplay = 文章优化独立开启 ? modelValue : 主剧情解析模型;
            const polishPromptValue = (form.功能模型占位.文章优化提示词 || '').trim().length > 0
                ? form.功能模型占位.文章优化提示词
                : 默认文章优化提示词;
            const selectOptions = Array.from(new Set([
                ...modelOptions,
                modelValue,
                主剧情解析模型
            ].map((item) => (item || '').trim()).filter(Boolean)));
            const showManualInput = polishShowManualInput;
            const setShowManualInput = setPolishShowManualInput;

            return (
                <div className="space-y-4">
                    <div className="text-[11px] text-gray-400">
                        当前启用接口配置：{activeConfig?.名称 || '未配置'}。开启后才会自动润色 正文标签；开启独立模型后选择一个已有配置，或手动输入 API 地址和密钥。
                    </div>

                    <label className="flex items-center justify-between gap-3 text-xs text-gray-300">
                        <span>开启文章优化独立模型</span>
                        <ToggleSwitch
                            checked={文章优化独立开启}
                            onChange={handleTogglePolish}
                            ariaLabel="切换文章优化独立模型"
                        />
                    </label>

                    {文章优化独立开启 && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-300">引用接口配置</label>
                                <InlineSelect
                                    value={selectedConfigId}
                                    options={apiConfigOptions}
                                    onChange={(configId) => {
                                        updatePlaceholder('文章优化使用配置ID', configId);
                                        if (configId) {
                                            const refCfg = getConfigById(configId);
                                            if (refCfg) {
                                                updatePlaceholder('文章优化API地址', refCfg.baseUrl || '');
                                                updatePlaceholder('文章优化API密钥', refCfg.apiKey || '');
                                            }
                                        }
                                    }}
                                    disabled={apiConfigOptions.length === 0}
                                    placeholder="请选择接口配置"
                                    buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                />
                            </div>

                            <div className="flex gap-3 items-end">
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs text-gray-300">文章优化使用模型</label>
                                    <InlineSelect
                                        value={modelDisplay}
                                        options={selectOptions.map((model) => ({ value: model, label: model }))}
                                        onChange={(model) => updatePlaceholder('文章优化使用模型', model)}
                                        disabled={selectOptions.length === 0}
                                        placeholder={selectOptions.length ? '请选择模型' : '请先点击获取列表'}
                                        buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                    />
                                </div>
                                <GameButton
                                    onClick={handleFetchModels}
                                    variant="secondary"
                                    className="px-4 py-2 text-xs"
                                    disabled={loadingModels}
                                >
                                    {loadingModels ? '...' : '获取列表'}
                                </GameButton>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowManualInput(!showManualInput)}
                                className="text-xs text-gray-500 hover:text-gray-300"
                            >
                                {showManualInput ? '▲ 隐藏手动输入' : '▼ 显示手动输入'}
                            </button>

                            {showManualInput && (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-300">文章优化独立 API 地址</label>
                                        <input
                                            type="text"
                                            value={form.功能模型占位.文章优化API地址 || ''}
                                            onChange={(e) => updatePlaceholder('文章优化API地址', e.target.value)}
                                            placeholder={selectedRefConfig?.baseUrl || activeConfig?.baseUrl || '留空则复用主剧情 Base URL'}
                                            className="w-full border p-2 text-white rounded-md outline-none bg-black/50 border-gray-700 focus:border-wuxia-gold"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-300">文章优化独立 API 密钥</label>
                                        <input
                                            type="password"
                                            value={form.功能模型占位.文章优化API密钥 || ''}
                                            onChange={(e) => updatePlaceholder('文章优化API密钥', e.target.value)}
                                            placeholder={selectedRefConfig?.apiKey ? '留空则复用配置 Key' : 'sk-...'}
                                            className="w-full border p-2 text-white rounded-md outline-none bg-black/50 border-gray-700 focus:border-wuxia-gold"
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {!文章优化独立开启 && (
                        <div className="text-[11px] text-gray-400">
                            当前状态：自动润色关闭
                        </div>
                    )}

                    <div className="rounded-md border border-wuxia-cyan/25 bg-black/20 p-4 space-y-3">
                        <div className="text-xs text-wuxia-cyan font-bold">润色提示词</div>
                        <textarea
                            value={polishPromptValue}
                            onChange={(e) => updatePlaceholder('文章优化提示词', e.target.value)}
                            className="w-full h-44 bg-black/50 border border-gray-700 p-3 text-white rounded-md outline-none focus:border-wuxia-gold custom-scrollbar resize-none text-xs leading-relaxed"
                        />
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => updatePlaceholder('文章优化提示词', 默认文章优化提示词)}
                                className="px-3 py-1.5 text-[11px] rounded border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500"
                            >
                                恢复默认提示词
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        const modelValue = (form.功能模型占位.世界演变使用模型 || '').trim();
        const selectedConfigId = form.功能模型占位.世界演变使用配置ID;
        const selectedRefConfig = selectedConfigId ? getConfigById(selectedConfigId) : null;
        const modelDisplay = 世界演变独立开启 ? modelValue : 主剧情解析模型;
        const selectOptions = Array.from(new Set([
            ...modelOptions,
            modelValue,
            主剧情解析模型
        ].map((item) => (item || '').trim()).filter(Boolean)));
        const showManualInput = worldEvolutionShowManualInput;
        const setShowManualInput = setWorldEvolutionShowManualInput;

        return (
            <div className="space-y-4">
                <div className="text-[11px] text-gray-400">
                    当前启用接口配置：{activeConfig?.名称 || '未配置'}。开启独立模型后选择一个已有配置，或手动输入 API 地址和密钥。
                </div>

                <label className="flex items-center justify-between gap-3 text-xs text-gray-300">
                    <span>开启世界演变独立模型</span>
                    <ToggleSwitch
                        checked={世界演变独立开启}
                        onChange={handleToggleWorldEvolution}
                        ariaLabel="切换世界演变独立模型"
                    />
                </label>

                {世界演变独立开启 && (
                    <>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-300">引用接口配置</label>
                            <InlineSelect
                                value={selectedConfigId}
                                options={apiConfigOptions}
                                onChange={(configId) => {
                                    updatePlaceholder('世界演变使用配置ID', configId);
                                    if (configId) {
                                        const refCfg = getConfigById(configId);
                                        if (refCfg) {
                                            updatePlaceholder('世界演变API地址', refCfg.baseUrl || '');
                                            updatePlaceholder('世界演变API密钥', refCfg.apiKey || '');
                                        }
                                    }
                                }}
                                disabled={apiConfigOptions.length === 0}
                                placeholder="请选择接口配置"
                                buttonClassName="bg-black/50 border-gray-600 py-2.5"
                            />
                        </div>

                        <div className="flex gap-3 items-end">
                            <div className="flex-1 space-y-1">
                                <label className="text-xs text-gray-300">世界演变使用模型</label>
                                <InlineSelect
                                    value={modelDisplay}
                                    options={selectOptions.map((model) => ({ value: model, label: model }))}
                                    onChange={(model) => updatePlaceholder('世界演变使用模型', model)}
                                    disabled={selectOptions.length === 0}
                                    placeholder={selectOptions.length ? '请选择模型' : '请先点击获取列表'}
                                    buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                />
                            </div>
                            <GameButton
                                onClick={handleFetchModels}
                                variant="secondary"
                                className="px-4 py-2 text-xs"
                                disabled={loadingModels}
                            >
                                {loadingModels ? '...' : '获取列表'}
                            </GameButton>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowManualInput(!showManualInput)}
                            className="text-xs text-gray-500 hover:text-gray-300"
                        >
                            {showManualInput ? '▲ 隐藏手动输入' : '▼ 显示手动输入'}
                        </button>

                        {showManualInput && (
                            <>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-300">世界演变独立 API 地址</label>
                                    <input
                                        type="text"
                                        value={form.功能模型占位.世界演变API地址 || ''}
                                        onChange={(e) => updatePlaceholder('世界演变API地址', e.target.value)}
                                        placeholder={selectedRefConfig?.baseUrl || activeConfig?.baseUrl || '留空则复用主剧情 Base URL'}
                                        className="w-full border p-2 text-white rounded-md outline-none bg-black/50 border-gray-700 focus:border-wuxia-gold"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-300">世界演变独立 API 密钥</label>
                                    <input
                                        type="password"
                                        value={form.功能模型占位.世界演变API密钥 || ''}
                                        onChange={(e) => updatePlaceholder('世界演变API密钥', e.target.value)}
                                        placeholder={selectedRefConfig?.apiKey ? '留空则复用配置 Key' : 'sk-...'}
                                        className="w-full border p-2 text-white rounded-md outline-none bg-black/50 border-gray-700 focus:border-wuxia-gold"
                                    />
                                </div>
                            </>
                        )}
                    </>
                )}

                {!世界演变独立开启 && (
                    <div className="text-[11px] text-gray-400">
                        当前状态：世界演变自动更新关闭
                    </div>
                )}
            </div>
        );
    }

    if (activeSubTab === 'device_message') {
        const modelValue = (form.功能模型占位.设备消息使用模型 || '').trim();
        const selectedConfigId = form.功能模型占位.设备消息使用配置ID;
        const selectedRefConfig = selectedConfigId ? getConfigById(selectedConfigId) : null;
        const modelDisplay = 设备消息独立开启 ? modelValue : 主剧情解析模型;
        const selectOptions = Array.from(new Set([
            ...modelOptions,
            modelValue,
            主剧情解析模型
        ].map((item) => (item || '').trim()).filter(Boolean)));
        const showManualInput = deviceMessageShowManualInput;
        const setShowManualInput = setDeviceMessageShowManualInput;

        return (
            <div className="space-y-4">
                <div className="text-[11px] text-gray-400">当前启用接口配置：{activeConfig?.名称 || '未配置'}。开启独立模型后选择一个已有配置，或手动输入 API 地址和密钥。</div>
                <label className="flex items-center justify-between gap-3 text-xs text-gray-300">
                    <span>启用设备消息独立模型</span>
                    <ToggleSwitch checked={设备消息独立开启} onChange={handleToggleDeviceMessage} ariaLabel="切换设备消息独立模型" />
                </label>

                {设备消息独立开启 && (
                    <>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-300">引用接口配置</label>
                            <InlineSelect
                                value={selectedConfigId}
                                options={apiConfigOptions}
                                onChange={(configId) => {
                                    updatePlaceholder('设备消息使用配置ID', configId);
                                    if (configId) {
                                        const refCfg = getConfigById(configId);
                                        if (refCfg) {
                                            updatePlaceholder('设备消息API地址', refCfg.baseUrl || '');
                                            updatePlaceholder('设备消息API密钥', refCfg.apiKey || '');
                                        }
                                    }
                                }}
                                disabled={apiConfigOptions.length === 0}
                                placeholder="请选择接口配置"
                                buttonClassName="bg-black/50 border-gray-600 py-2.5"
                            />
                        </div>

                        <div className="flex gap-3 items-end">
                            <div className="flex-1 space-y-1">
                                <label className="text-xs text-gray-300">设备消息使用模型</label>
                                <InlineSelect
                                    value={modelDisplay}
                                    options={selectOptions.map((model) => ({ value: model, label: model }))}
                                    onChange={(model) => updatePlaceholder('设备消息使用模型', model)}
                                    disabled={selectOptions.length === 0}
                                    placeholder={selectOptions.length ? '请选择模型' : '请先点击获取列表'}
                                    buttonClassName="bg-black/50 border-gray-600 py-2.5"
                                />
                            </div>
                            <GameButton onClick={handleFetchModels} variant="secondary" className="px-4 py-2 text-xs" disabled={loadingModels}>
                                {loadingModels ? '...' : '获取列表'}
                            </GameButton>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowManualInput(!showManualInput)}
                            className="text-xs text-gray-500 hover:text-gray-300"
                        >
                            {showManualInput ? '▲ 隐藏手动输入' : '▼ 显示手动输入'}
                        </button>

                        {showManualInput && (
                            <>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-300">设备消息独立 API 地址</label>
                                    <input
                                        type="text"
                                        value={form.功能模型占位.设备消息API地址 || ''}
                                        onChange={(e) => updatePlaceholder('设备消息API地址', e.target.value)}
                                        placeholder={selectedRefConfig?.baseUrl || activeConfig?.baseUrl || '留空则复用主剧情 Base URL'}
                                        className="w-full border p-2 text-white rounded-md outline-none bg-black/50 border-gray-700 focus:border-cyan-400"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-300">设备消息独立 API 密钥</label>
                                    <input
                                        type="password"
                                        value={form.功能模型占位.设备消息API密钥 || ''}
                                        onChange={(e) => updatePlaceholder('设备消息API密钥', e.target.value)}
                                        placeholder={selectedRefConfig?.apiKey ? '留空则复用配置 Key' : 'sk-...'}
                                        className="w-full border p-2 text-white rounded-md outline-none bg-black/50 border-gray-700 focus:border-cyan-400"
                                    />
                                </div>
                            </>
                        )}
                    </>
                )}

                {!设备消息独立开启 && (
                    <div className="text-[11px] text-gray-400">
                        当前状态：设备消息使用主剧情接口
                    </div>
                )}
            </div>
        );
    }

    return null;

    return (
        <div className="space-y-6 text-sm animate-fadeIn">
            <div className="flex justify-between items-center border-b border-wuxia-gold/30 pb-3 mb-6">
                <h3 className="text-wuxia-gold font-serif font-bold text-xl">模型配置</h3>
            </div>

            {/* Sub Tab Navigation */}
            <div className="flex gap-2 border-b border-gray-800 pb-1">
                {subTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveSubTab(tab.id);
                            setModelOptions([]);
                            setMessage('');
                        }}
                        className={`px-4 py-2 text-sm transition-colors ${
                            activeSubTab === tab.id
                                ? 'text-wuxia-gold border-b-2 border-wuxia-gold -mb-[1px]'
                                : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Sub Content */}
            <div className="rounded-md border border-wuxia-gold/20 bg-black/25 p-4">
                {renderSubContent()}
            </div>

            {message && <p className="text-xs text-wuxia-cyan animate-pulse">{message}</p>}

            <div className="pt-6 border-t border-wuxia-gold/20 mt-8">
                <GameButton onClick={handleSave} variant="primary" className="w-full">
                    {showSuccess ? '✔ 配置已保存' : '保存设置'}
                </GameButton>
            </div>
        </div>
    );
};

export default IntegratedModelSettings;