import React, { useState } from 'react';
import { 快速导出为Txt, 快速导出为Json, 快速导出为Md } from '../../../utils/conversationExport';
import type { 聊天记录结构 } from '../../../types';
import GameButton from '../../ui/GameButton';

interface Props {
    history: 聊天记录结构[];
    playerName?: string;
    onClose?: () => void;
}

type 导出格式 = 'txt' | 'json' | 'md';

const ConversationExportPanel: React.FC<Props> = ({ history, playerName, onClose }) => {
    const [selectedFormat, setSelectedFormat] = useState<导出格式>('md');
    const [isExporting, setIsExporting] = useState(false);
    const [exported, setExported] = useState(false);

    const handleExport = async () => {
        if (history.length === 0) {
            alert('当前没有对话记录可导出');
            return;
        }

        setIsExporting(true);
        setExported(false);

        try {
            const 对话标题 = playerName ? `${playerName}的对话记录` : '对话记录';

            switch (selectedFormat) {
                case 'txt':
                    快速导出为Txt(history, playerName, 对话标题);
                    break;
                case 'json':
                    快速导出为Json(history, playerName, 对话标题);
                    break;
                case 'md':
                    快速导出为Md(history, playerName, 对话标题);
                    break;
            }

            setExported(true);
            setTimeout(() => setExported(false), 2000);
        } catch (error) {
            console.error('导出失败:', error);
            alert(`导出失败：${error instanceof Error ? error.message : '未知错误'}`);
        } finally {
            setIsExporting(false);
        }
    };

    const formatOptions: { value: 导出格式; label: string; desc: string }[] = [
        { value: 'md', label: 'Markdown', desc: '.md 格式，适合阅读和分享' },
        { value: 'txt', label: '纯文本', desc: '.txt 格式，通用兼容性' },
        { value: 'json', label: 'JSON', desc: '.json 格式，适合程序处理' },
    ];

    return (
        <div className="p-4 space-y-4">
            <div className="text-center">
                <h3 className="text-lg font-serif text-wuxia-gold mb-1">导出对话记录</h3>
                <p className="text-xs text-gray-500">
                    共 {history.length} 条对话记录
                </p>
            </div>

            <div className="space-y-2">
                <label className="block text-sm text-gray-400 mb-2">选择导出格式</label>
                <div className="grid gap-2">
                    {formatOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setSelectedFormat(option.value)}
                            className={`p-3 rounded-lg border text-left transition-all ${
                                selectedFormat === option.value
                                    ? 'border-wuxia-gold bg-wuxia-gold/10 text-wuxia-gold'
                                    : 'border-gray-700 bg-black/30 text-gray-300 hover:border-gray-500'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{option.label}</span>
                                <span className="text-xs opacity-70">{option.desc}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
                <GameButton
                    onClick={handleExport}
                    disabled={isExporting || history.length === 0}
                    variant="primary"
                    className="flex-1"
                >
                    {isExporting ? '导出中...' : exported ? '已导出 ✓' : '导出'}
                </GameButton>
                {onClose && (
                    <GameButton
                        onClick={onClose}
                        variant="secondary"
                    >
                        关闭
                    </GameButton>
                )}
            </div>

            {exported && (
                <p className="text-center text-xs text-green-500">
                    对话记录已成功导出
                </p>
            )}
        </div>
    );
};

export default ConversationExportPanel;
