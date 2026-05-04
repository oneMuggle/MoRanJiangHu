import React, { useState, useMemo } from 'react';
import { DeviceMode, MobileApp, DeviceGameContext } from '../../../../models/mobileDevice';
import { getDeviceConfig, getAppName } from '../../../../models/eraDevice';
import { 催眠进化阶段表 } from '../../../../models/campusPhone';
import type { 催眠记录, 催眠App等级, 催眠类型 } from '../../../../types';

interface AppProps {
    eraId: string;
    mode: DeviceMode;
    appId: MobileApp;
    onBack: () => void;
    gameContext?: DeviceGameContext;
    onHypnosisChange?: (updater: (prev: { 催眠记录列表: 催眠记录[]; app等级: 催眠App等级; 累计使用次数: number }) => { 催眠记录列表: 催眠记录[]; app等级: 催眠App等级; 累计使用次数: number }) => void;
}

const 能力配置: Record<催眠类型, { 最大指令长度: number; 持续时间上限: string; 描述: string }> = {
    '暗示植入': { 最大指令长度: 50, 持续时间上限: '7天', 描述: '在潜意识中植入简单暗示' },
    '行为引导': { 最大指令长度: 100, 持续时间上限: '14天', 描述: '引导目标执行特定行为' },
    '记忆修改': { 最大指令长度: 150, 持续时间上限: '30天', 描述: '修改目标的特定记忆' },
    '认知扭曲': { 最大指令长度: 200, 持续时间上限: '永久', 描述: '改变目标的根本认知' },
    '深度控制': { 最大指令长度: 500, 持续时间上限: '永久', 描述: '完全控制目标的行为和思想' },
};

const CampusHypnosisApp: React.FC<AppProps> = ({ eraId, mode, appId, onBack, gameContext, onHypnosisChange }) => {
    const config = getDeviceConfig(eraId);
    const appName = config ? getAppName(config, appId, mode) : '催眠App';
    const 催眠系统 = gameContext?.催眠系统;
    const 记录列表 = 催眠系统?.催眠记录列表 || [];
    const app等级 = 催眠系统?.app等级 || { 当前等级: 1, 已使用次数: 0, 升级阈值: 5, 解锁能力: [] };
    const 累计使用 = 催眠系统?.累计使用次数 || 0;

    const [view, setView] = useState<'list' | 'new' | 'records' | 'evolution'>('list');
    const [selectedTarget, setSelectedTarget] = useState<string>('');
    const [selectedType, setSelectedType] = useState<催眠类型>('暗示植入');
    const [instruction, setInstruction] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [lastUpgrade, setLastUpgrade] = useState(false);

    // 当前等级的进化阶段
    const 进化阶段 = 催眠进化阶段表.find(s => s.阶段 === app等级.当前等级) || 催眠进化阶段表[0];
    const 下一等级 = 催眠进化阶段表.find(s => s.阶段 === app等级.当前等级 + 1);
    const 已解锁能力 = 进化阶段.解锁能力;

    // 可用NPC列表
    const npc列表 = useMemo(() => {
        if (!gameContext?.社交) return [];
        return gameContext.社交.map(npc => ({ id: npc.姓名, 姓名: npc.姓名, 关系: npc.关系状态 || '未知' }));
    }, [gameContext?.社交]);

    // 生效中的催眠
    const 生效中催眠 = 记录列表.filter(r => r.是否生效中);

    // 当前选中催眠类型的配置
    const 当前能力 = 能力配置[selectedType];

    // 升级检查
    const checkUpgrade = (newUsage: number): number => {
        for (let i = 催眠进化阶段表.length - 1; i >= 0; i--) {
            if (newUsage >= 催眠进化阶段表[i].所需使用次数) {
                return 催眠进化阶段表[i].阶段;
            }
        }
        return 1;
    };

    const handleExecute = () => {
        if (!selectedTarget || !instruction.trim()) return;
        if (!已解锁能力.includes(selectedType)) return;
        if (instruction.length > 当前能力.最大指令长度) return;

        const newUsage = 累计使用 + 1;
        const newLevel = checkUpgrade(newUsage);

        const newRecord: 催眠记录 = {
            id: `hyp-${Date.now()}`,
            目标NPC: selectedTarget,
            催眠类型: selectedType,
            催眠指令: instruction.trim(),
            生效时间: new Date().toISOString().slice(0, 10),
            持续时间: 当前能力.持续时间上限,
            是否生效中: true,
            效果强度: Math.min(100, 50 + app等级.当前等级 * 10),
        };

        const newStage = 催眠进化阶段表.find(s => s.阶段 === newLevel);
        const newUnlockLevel: 催眠App等级 = {
            当前等级: newLevel,
            已使用次数: newUsage,
            升级阈值: newStage?.所需使用次数 || Infinity,
            解锁能力: (newStage?.解锁能力 || []).map(t => ({
                类型: t,
                ...能力配置[t],
                解锁等级: 催眠进化阶段表.find(s => s.解锁能力.includes(t))?.阶段 || 1,
            })),
        };

        onHypnosisChange?.(() => ({
            催眠记录列表: [...记录列表, newRecord],
            app等级: newUnlockLevel,
            累计使用次数: newUsage,
        }));

        if (newLevel > app等级.当前等级) setLastUpgrade(true);
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            setLastUpgrade(false);
            resetForm();
        }, 2000);
    };

    const handleRelease = (id: string) => {
        onHypnosisChange?.(prev => ({
            ...prev,
            催眠记录列表: prev.催眠记录列表.map(r => r.id === id ? { ...r, 是否生效中: false } : r),
        }));
    };

    const resetForm = () => {
        setView('list');
        setSelectedTarget('');
        setSelectedType(已解锁能力[0] || '暗示植入');
        setInstruction('');
    };

    if (showSuccess) {
        const 新阶段 = lastUpgrade
            ? 催眠进化阶段表.find(s => s.阶段 === checkUpgrade(累计使用 + 1))
            : null;
        return (
            <div className="flex flex-col h-full items-center justify-center p-8 text-center">
                <div className="text-5xl mb-4 animate-pulse">🌀</div>
                <h3 className="text-lg font-bold text-white mb-2">催眠执行成功</h3>
                <p className="text-sm text-gray-400 mb-4">指令已发送至{selectedTarget}的潜意识</p>
                {新阶段 && (
                    <div className="mt-2 px-4 py-2 bg-purple-600/30 border border-purple-500/40 rounded-lg">
                        <p className="text-sm text-purple-300 font-bold">App升级！</p>
                        <p className="text-xs text-purple-400 mt-1">达到阶段：{新阶段.名称}</p>
                        <p className="text-xs text-purple-400">解锁：{新阶段.解锁能力.join('、')}</p>
                    </div>
                )}
            </div>
        );
    }

    if (view === 'new') {
        return (
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                    <button onClick={resetForm} className="text-gray-400 hover:text-white transition-colors">&larr;</button>
                    <h3 className="font-semibold text-white">执行催眠</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* 目标选择 */}
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">催眠目标</label>
                        <select
                            className="w-full bg-gray-800/50 border border-gray-700/50 rounded px-3 py-2 text-sm text-white"
                            value={selectedTarget}
                            onChange={e => setSelectedTarget(e.target.value)}
                        >
                            <option value="">-- 选择NPC --</option>
                            {npc列表.map(npc => (
                                <option key={npc.id} value={npc.id}>{npc.姓名} ({npc.关系})</option>
                            ))}
                        </select>
                    </div>

                    {/* 类型选择 */}
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">催眠类型</label>
                        <div className="grid grid-cols-2 gap-2">
                            {催眠进化阶段表[0].解锁能力.map(能力 => {
                                const isUnlocked = 已解锁能力.includes(能力);
                                const 配置 = 能力配置[能力];
                                return (
                                    <button
                                        key={能力}
                                        onClick={() => isUnlocked && setSelectedType(能力)}
                                        className={`p-2.5 rounded-lg border text-left transition-all ${
                                            isUnlocked
                                                ? selectedType === 能力
                                                    ? 'border-blue-500 bg-blue-600/20'
                                                    : 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600'
                                                : 'border-gray-800/50 bg-gray-900/30 opacity-40 cursor-not-allowed'
                                        }`}
                                        disabled={!isUnlocked}
                                    >
                                        <div className="text-xs text-white font-medium">{能力}</div>
                                        <div className="text-[10px] text-gray-500 mt-0.5">限{配置.最大指令长度}字</div>
                                        {!isUnlocked && <div className="text-[10px] text-red-400 mt-0.5">🔒 未解锁</div>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 指令输入 */}
                    {当前能力 && (
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs text-gray-400">催眠指令</label>
                                <span className={`text-[10px] ${instruction.length > 当前能力.最大指令长度 ? 'text-red-400' : 'text-gray-500'}`}>
                                    {instruction.length}/{当前能力.最大指令长度}
                                </span>
                            </div>
                            <textarea
                                className="w-full bg-gray-800/50 border border-gray-700/50 rounded px-3 py-2 text-sm text-white resize-none"
                                rows={3}
                                value={instruction}
                                onChange={e => setInstruction(e.target.value)}
                                placeholder={`输入催眠指令（最多${当前能力.最大指令长度}字）`}
                            />
                            <p className="text-[10px] text-gray-500 mt-1">持续时间：{当前能力.持续时间上限}</p>
                        </div>
                    )}

                    <button
                        onClick={handleExecute}
                        disabled={!selectedTarget || !instruction.trim() || !已解锁能力.includes(selectedType) || instruction.length > 当前能力.最大指令长度}
                        className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-purple-600 hover:bg-purple-500 text-white"
                    >
                        执行催眠
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
                <span className="text-[10px] text-purple-400">Lv.{app等级.当前等级}</span>
            </div>

            {/* 等级进度 */}
            <div className="px-4 py-2 border-b border-gray-800/50">
                <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                    <span>{进化阶段.名称}</span>
                    {下一等级 && <span>下一级：{下一等级.名称} ({下一等级.所需使用次数}次)</span>}
                </div>
                <div className="w-full bg-gray-800/50 rounded-full h-1.5">
                    <div
                        className="bg-purple-500 h-1.5 rounded-full transition-all"
                        style={{
                            width: 下一等级
                                ? `${Math.min(100, ((累计使用 - 进化阶段.所需使用次数) / (下一等级.所需使用次数 - 进化阶段.所需使用次数)) * 100)}%`
                                : '100%',
                        }}
                    />
                </div>
            </div>

            {/* 快捷操作 */}
            <div className="flex gap-2 px-4 py-3">
                <button
                    onClick={() => setView('new')}
                    className="flex-1 py-2 rounded-lg text-xs font-medium bg-purple-600/80 hover:bg-purple-500 text-white transition-colors"
                >
                    + 新催眠
                </button>
                <button
                    onClick={() => setView(view === 'records' ? 'list' : 'records')}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${view === 'records' ? 'bg-gray-700/50 text-white' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'}`}
                >
                    催眠记录 ({记录列表.length})
                </button>
                <button
                    onClick={() => setView(view === 'evolution' ? 'list' : 'evolution')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${view === 'evolution' ? 'bg-gray-700/50 text-white' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'}`}
                >
                    进化
                </button>
            </div>

            {/* 主内容区 */}
            <div className="flex-1 overflow-y-auto">
                {view === 'evolution' && (
                    <div className="p-4 space-y-3">
                        {催眠进化阶段表.map(stage => {
                            const isCurrent = stage.阶段 === app等级.当前等级;
                            const isUnlocked = stage.阶段 <= app等级.当前等级;
                            return (
                                <div key={stage.阶段} className={`rounded-lg p-3 border transition-all ${isCurrent ? 'border-purple-500 bg-purple-600/10' : isUnlocked ? 'border-gray-700/50 bg-gray-800/30' : 'border-gray-800/30 bg-gray-900/20 opacity-50'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm text-white font-bold">阶段{stage.阶段}：{stage.名称}</span>
                                        {isCurrent && <span className="text-[10px] text-purple-400">(当前)</span>}
                                    </div>
                                    <p className="text-xs text-gray-400">{stage.描述}</p>
                                    <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500">
                                        <span>需要：{stage.所需使用次数}次</span>
                                        <span>|</span>
                                        <span>解锁：{stage.解锁能力.join('、')}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {view === 'records' && (
                    <div className="divide-y divide-gray-800/50">
                        {记录列表.length > 0 ? (
                            记录列表.map(record => (
                                <div key={record.id} className={`px-4 py-3 ${record.是否生效中 ? '' : 'opacity-50'}`}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-sm text-white truncate">{record.目标NPC}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${record.是否生效中 ? 'bg-green-600/30 text-green-400' : 'bg-gray-700/30 text-gray-400'}`}>
                                                    {record.是否生效中 ? '生效中' : '已解除'}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-gray-500">{record.催眠类型} · {record.生效时间}</div>
                                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{record.催眠指令}</p>
                                        </div>
                                        {record.是否生效中 && (
                                            <button onClick={() => handleRelease(record.id)} className="text-[10px] text-gray-400 hover:text-red-400 px-1.5 py-0.5 rounded shrink-0 transition-colors">
                                                解除
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-sm text-gray-500 py-8">暂无催眠记录</div>
                        )}
                    </div>
                )}

                {view === 'list' && (
                    <div className="p-4 space-y-3">
                        {/* 生效中催眠速览 */}
                        {生效中催眠.length > 0 && (
                            <div>
                                <h4 className="text-xs text-gray-400 mb-2">生效中的催眠 ({生效中催眠.length})</h4>
                                <div className="space-y-2">
                                    {生效中催眠.slice(0, 5).map(r => (
                                        <div key={r.id} className="bg-purple-600/10 border border-purple-500/20 rounded-lg px-3 py-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-purple-300 font-medium">{r.目标NPC}</span>
                                                <span className="text-[10px] text-purple-400">{r.催眠类型}</span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-0.5 truncate">{r.催眠指令}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 已解锁能力 */}
                        <div>
                            <h4 className="text-xs text-gray-400 mb-2">已解锁能力</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {已解锁能力.map(能力 => {
                                    const 配置 = 能力配置[能力];
                                    const count = 生效中催眠.filter(r => r.催眠类型 === 能力).length;
                                    return (
                                        <div key={能力} className="bg-gray-800/30 border border-gray-700/40 rounded-lg p-2.5">
                                            <div className="text-xs text-white font-medium">{能力}</div>
                                            <div className="text-[10px] text-gray-500 mt-0.5">{配置.描述}</div>
                                            <div className="text-[10px] text-gray-500 mt-1">生效中：{count}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CampusHypnosisApp;
