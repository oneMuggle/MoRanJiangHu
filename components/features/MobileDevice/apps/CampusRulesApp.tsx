import React, { useState } from 'react';
import { DeviceMode, MobileApp, DeviceGameContext } from '../../../../models/mobileDevice';
import { getDeviceConfig, getAppName } from '../../../../models/eraDevice';
import type { 校规条目, 校规影响日志 } from '../../../../types';

interface AppProps {
    eraId: string;
    mode: DeviceMode;
    appId: MobileApp;
    onBack: () => void;
    gameContext?: DeviceGameContext;
    onRulesChange?: (updater: (prev: { 校规列表: 校规条目[]; 影响日志: 校规影响日志[] }) => { 校规列表: 校规条目[]; 影响日志: 校规影响日志[] }) => void;
}

type 校规分类 = '行为规范' | '着装要求' | '作息制度' | '社交规范' | '特殊规定';
type 影响程度 = '轻微' | '中等' | '显著' | '深度';

const 分类列表: 校规分类[] = ['行为规范', '着装要求', '作息制度', '社交规范', '特殊规定'];
const 程度列表: 影响程度[] = ['轻微', '中等', '显著', '深度'];
const 程度颜色: Record<影响程度, string> = {
    '轻微': 'text-green-400',
    '中等': 'text-yellow-400',
    '显著': 'text-orange-400',
    '深度': 'text-red-400',
};

const 空表单: Omit<校规条目, 'id'> = {
    标题: '',
    内容: '',
    分类: '行为规范',
    生效日期: new Date().toISOString().slice(0, 10),
    是否启用: true,
    影响程度: '轻微',
};

const CampusRulesApp: React.FC<AppProps> = ({ eraId, mode, appId, onBack, gameContext, onRulesChange }) => {
    const config = getDeviceConfig(eraId);
    const appName = config ? getAppName(config, appId, mode) : '校规编辑器';
    const 校规系统 = gameContext?.校规系统;
    const [activeFilter, setActiveFilter] = useState<校规分类 | '全部'>('全部');
    const [editingRule, setEditingRule] = useState<校规条目 | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<Omit<校规条目, 'id'>>(空表单);

    const filteredRules = (校规系统?.校规列表 || []).filter(r =>
        activeFilter === '全部' || r.分类 === activeFilter
    );

    const handleSave = () => {
        if (!form.标题.trim() || !form.内容.trim()) return;
        onRulesChange?.(prev => {
            if (editingRule) {
                return {
                    ...prev,
                    校规列表: prev.校规列表.map(r => r.id === editingRule.id ? { ...form, id: editingRule.id } : r),
                };
            }
            const newRule: 校规条目 = { ...form, id: `rule-${Date.now()}` };
            return { ...prev, 校规列表: [...prev.校规列表, newRule] };
        });
        resetForm();
    };

    const handleDelete = (id: string) => {
        onRulesChange?.(prev => ({
            ...prev,
            校规列表: prev.校规列表.filter(r => r.id !== id),
        }));
    };

    const toggleEnabled = (id: string) => {
        onRulesChange?.(prev => ({
            ...prev,
            校规列表: prev.校规列表.map(r => r.id === id ? { ...r, 是否启用: !r.是否启用 } : r),
        }));
    };

    const startEdit = (rule: 校规条目) => {
        setEditingRule(rule);
        setForm({ 标题: rule.标题, 内容: rule.内容, 分类: rule.分类, 生效日期: rule.生效日期, 是否启用: rule.是否启用, 影响程度: rule.影响程度 });
        setShowForm(true);
    };

    const startNew = () => {
        setEditingRule(null);
        setForm(空表单);
        setShowForm(true);
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingRule(null);
        setForm(空表单);
    };

    if (showForm) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                    <button onClick={resetForm} className="text-gray-400 hover:text-white transition-colors">&larr;</button>
                    <h3 className="font-semibold text-white">{editingRule ? '编辑校规' : '新增校规'}</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">标题</label>
                        <input
                            className="w-full bg-gray-800/50 border border-gray-700/50 rounded px-3 py-2 text-sm text-white"
                            value={form.标题}
                            onChange={e => setForm(f => ({ ...f, 标题: e.target.value }))}
                            placeholder="请输入校规标题"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">内容</label>
                        <textarea
                            className="w-full bg-gray-800/50 border border-gray-700/50 rounded px-3 py-2 text-sm text-white resize-none"
                            rows={4}
                            value={form.内容}
                            onChange={e => setForm(f => ({ ...f, 内容: e.target.value }))}
                            placeholder="请输入校规详细内容"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">分类</label>
                            <select
                                className="w-full bg-gray-800/50 border border-gray-700/50 rounded px-3 py-2 text-sm text-white"
                                value={form.分类}
                                onChange={e => setForm(f => ({ ...f, 分类: e.target.value as 校规分类 }))}
                            >
                                {分类列表.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">影响程度</label>
                            <select
                                className="w-full bg-gray-800/50 border border-gray-700/50 rounded px-3 py-2 text-sm text-white"
                                value={form.影响程度}
                                onChange={e => setForm(f => ({ ...f, 影响程度: e.target.value as 影响程度 }))}
                            >
                                {程度列表.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="rule-enabled"
                            checked={form.是否启用}
                            onChange={e => setForm(f => ({ ...f, 是否启用: e.target.checked }))}
                        />
                        <label htmlFor="rule-enabled" className="text-sm text-gray-300">立即启用</label>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={!form.标题.trim() || !form.内容.trim()}
                        className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white"
                    >
                        {editingRule ? '保存修改' : '添加校规'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">&larr;</button>
                <h3 className="font-semibold text-white flex-1">{appName}</h3>
                <button onClick={startNew} className="text-xs bg-blue-600/80 hover:bg-blue-500 text-white px-3 py-1 rounded transition-colors">
                    + 新增
                </button>
            </div>

            {/* 分类筛选 */}
            <div className="flex gap-2 px-4 py-2 border-b border-gray-800/50 overflow-x-auto">
                <button
                    onClick={() => setActiveFilter('全部')}
                    className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors ${activeFilter === '全部' ? 'bg-blue-600/60 text-white' : 'text-gray-400 hover:text-white'}`}
                >全部</button>
                {分类列表.map(c => (
                    <button
                        key={c}
                        onClick={() => setActiveFilter(c)}
                        className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors ${activeFilter === c ? 'bg-blue-600/60 text-white' : 'text-gray-400 hover:text-white'}`}
                    >{c}</button>
                ))}
            </div>

            {/* 校规列表 */}
            <div className="flex-1 overflow-y-auto">
                {filteredRules.length > 0 ? (
                    <div className="divide-y divide-gray-800/50">
                        {filteredRules.map(rule => (
                            <div key={rule.id} className={`px-4 py-3 transition-opacity ${rule.是否启用 ? '' : 'opacity-50'}`}>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm text-white font-medium truncate">{rule.标题}</span>
                                            <span className={`text-[10px] ${程度颜色[rule.影响程度]}`}>{rule.影响程度}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 line-clamp-2">{rule.内容}</p>
                                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500">
                                            <span>{rule.分类}</span>
                                            <span>{rule.生效日期}</span>
                                            <span className={rule.是否启用 ? 'text-green-500' : 'text-gray-500'}>
                                                {rule.是否启用 ? '已启用' : '已禁用'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 shrink-0">
                                        <button onClick={() => toggleEnabled(rule.id)} className="text-[10px] text-gray-400 hover:text-white px-1.5 py-0.5 rounded transition-colors">
                                            {rule.是否启用 ? '禁用' : '启用'}
                                        </button>
                                        <button onClick={() => startEdit(rule)} className="text-[10px] text-gray-400 hover:text-blue-400 px-1.5 py-0.5 rounded transition-colors">
                                            编辑
                                        </button>
                                        <button onClick={() => handleDelete(rule.id)} className="text-[10px] text-gray-400 hover:text-red-400 px-1.5 py-0.5 rounded transition-colors">
                                            删除
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <span className="text-4xl text-gray-600 mb-3">&#128220;</span>
                        <p className="text-sm text-gray-400">暂无校规</p>
                        <p className="text-xs text-gray-500 mt-1">点击右上角"新增"添加第一条校规</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CampusRulesApp;
