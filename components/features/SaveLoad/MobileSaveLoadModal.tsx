import React, { useEffect, useState } from 'react';
import * as dbService from '../../../services/dbService';
import { 存档结构 } from '../../../types';
import GameButton from '../../ui/GameButton';
import { useUIText } from '../../../hooks/useUIText';

interface Props {
    onClose: () => void;
    onLoadGame: (save: 存档结构) => void | Promise<void>;
    onSaveGame?: () => void | Promise<void>;
    mode: 'save' | 'load';
    requestConfirm?: (options: { title?: string; message: string; confirmText?: string; cancelText?: string; danger?: boolean }) => Promise<boolean>;
}

const MobileSaveLoadModal: React.FC<Props> = ({ onClose, onLoadGame, onSaveGame, mode, requestConfirm }) => {
    const [saves, setSaves] = useState<存档结构[]>([]);
    const [loading, setLoading] = useState(true);
    const 文案 = useUIText();

    useEffect(() => {
        void loadSaves();
    }, []);

    const loadSaves = async () => {
        setLoading(true);
        try {
            const list = await dbService.读取存档列表();
            setSaves(list);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const ok = requestConfirm
            ? await requestConfirm({ title: '删除存档', message: '确定删除此存档吗？', confirmText: '删除', danger: true })
            : true;
        if (!ok) return;
        await dbService.删除存档(id);
        await loadSaves();
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                <div className="text-wuxia-gold">加载中...</div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95 animate-fadeIn">
            <div className="flex items-center justify-between p-4 border-b border-wuxia-gold/30">
                <h2 className="text-lg font-bold text-wuxia-gold">{mode === 'save' ? 文案.存档标题 : 文案.加载存档标题}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">×</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
                {saves.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">暂无存档</div>
                ) : (
                    <div className="space-y-3">
                        {saves.map((save) => (
                            <div 
                                key={save.id} 
                                className="p-4 rounded-xl border border-wuxia-gold/30 bg-black/40"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-wuxia-gold font-bold">{save.角色数据?.姓名 || '未知角色'}</div>
                                            {save.时代信息 && (
                                                <span className="text-[10px] px-1.5 rounded border border-purple-500/50 text-purple-400 bg-purple-900/10">
                                                    {save.时代信息.名称}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {new Date(save.时间戳).toLocaleString('zh-CN')}
                                        </div>
                                    </div>
                                    {mode === 'load' && (
                                        <button
                                            onClick={() => onLoadGame(save)}
                                            className="px-4 py-2 bg-wuxia-gold/20 text-wuxia-gold rounded-lg text-sm"
                                        >
                                            读取
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(save.id!)}
                                        className="px-3 py-2 text-red-400 text-sm"
                                    >
                                        删除
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {mode === 'save' && onSaveGame && (
                <div className="p-4 border-t border-wuxia-gold/30">
                    <GameButton onClick={onSaveGame} variant="primary" className="w-full">
                        保存当前进度
                    </GameButton>
                </div>
            )}
        </div>
    );
};

export default MobileSaveLoadModal;