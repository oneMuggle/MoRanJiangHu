import React, { useState, useRef } from 'react';
import GameButton from '../../ui/GameButton';
import type { 记忆系统结构 } from '../../../types';
import { 
    快速导出记忆JSON, 
    快速导出记忆Txt, 
    仅导出回忆档案,
    导出短中期记忆,
    仅导出长期记忆,
    导入记忆文件,
    合并记忆系统
} from '../../../utils/memoryImportExport';

interface Props {
    memorySystem: 记忆系统结构;
    playerName?: string;
    onImport?: (importedMemory: 记忆系统结构) => void;
    onMerge?: (mergedMemory: 记忆系统结构) => void;
    onClose?: () => void;
}

type TabType = 'export' | 'import';
type ExportPreset = 'full' | 'archives' | 'shortMid' | 'longOnly';

const MemoryImportExportPanel: React.FC<Props> = ({ 
    memorySystem, 
    playerName,
    onImport,
    onMerge,
    onClose 
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('export');
    const [exportFormat, setExportFormat] = useState<'json' | 'txt'>('json');
    const [exportPreset, setExportPreset] = useState<ExportPreset>('full');
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importStatus, setImportStatus] = useState<{ 类型: 'success' | 'error' | ''; 消息: string }>({ 类型: '', 消息: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        setIsExporting(true);
        try {
            switch (exportPreset) {
                case 'full':
                    if (exportFormat === 'json') {
                        快速导出记忆JSON(memorySystem, playerName);
                    } else {
                        快速导出记忆Txt(memorySystem, playerName);
                    }
                    break;
                case 'archives':
                    仅导出回忆档案(memorySystem, playerName);
                    break;
                case 'shortMid':
                    导出短中期记忆(memorySystem, playerName);
                    break;
                case 'longOnly':
                    仅导出长期记忆(memorySystem, playerName);
                    break;
            }
        } finally {
            setIsExporting(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        setImportStatus({ 类型: '', 消息: '' });

        try {
            const result = await 导入记忆文件(file);
            
            if (result.成功 && result.记忆) {
                setImportStatus({ 
                    类型: 'success', 
                    消息: `成功导入回忆档案 ${result.记忆.回忆档案.length} 条、短期 ${result.记忆.短期记忆.length} 条、中期 ${result.记忆.中期记忆.length} 条、长期 ${result.记忆.长期记忆.length} 条` 
                });
                onImport?.(result.记忆);
            } else {
                setImportStatus({ 
                    类型: 'error', 
                    消息: result.错误 || '导入失败' 
                });
            }
        } catch (error) {
            setImportStatus({ 
                类型: 'error', 
                消息: `导入失败：${error instanceof Error ? error.message : '未知错误'}` 
            });
        } finally {
            setIsImporting(false);
            // 重置文件输入
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleMergeImport = async () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file) {
            setImportStatus({ 类型: 'error', 消息: '请先选择要导入的文件' });
            return;
        }

        setIsImporting(true);
        setImportStatus({ 类型: '', 消息: '' });

        try {
            const result = await 导入记忆文件(file);
            
            if (result.成功 && result.记忆) {
                const merged = 合并记忆系统(memorySystem, result.记忆);
                setImportStatus({ 
                    类型: 'success', 
                    消息: `合并完成！回忆档案 ${merged.回忆档案.length} 条、短期 ${merged.短期记忆.length} 条、中期 ${merged.中期记忆.length} 条、长期 ${merged.长期记忆.length} 条` 
                });
                onMerge?.(merged);
            } else {
                setImportStatus({ 
                    类型: 'error', 
                    消息: result.错误 || '导入失败' 
                });
            }
        } catch (error) {
            setImportStatus({ 
                类型: 'error', 
                消息: `导入失败：${error instanceof Error ? error.message : '未知错误'}` 
            });
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const exportPresets: { value: ExportPreset; label: string; desc: string }[] = [
        { value: 'full', label: '完整导出', desc: '包含所有记忆层（推荐）' },
        { value: 'archives', label: '仅回忆档案', desc: '仅导出剧情回忆索引' },
        { value: 'shortMid', label: '短中期记忆', desc: '导出短期和中期记忆' },
        { value: 'longOnly', label: '仅长期记忆', desc: '仅导出神魂烙印' },
    ];

    const memoryStats = {
        回忆档案: memorySystem.回忆档案.length,
        即时记忆: memorySystem.即时记忆.length,
        短期记忆: memorySystem.短期记忆.length,
        中期记忆: memorySystem.中期记忆.length,
        长期记忆: memorySystem.长期记忆.length,
    };

    return (
        <div className="p-4 space-y-4">
            {/* 标题 */}
            <div className="text-center">
                <h3 className="text-lg font-serif text-wuxia-gold mb-1">记忆系统导入导出</h3>
                <p className="text-xs text-gray-500">
                    回忆档案 {memoryStats.回忆档案} 条 | 即时 {memoryStats.即时记忆} | 短期 {memoryStats.短期记忆} | 中期 {memoryStats.中期记忆} | 长期 {memoryStats.长期记忆}
                </p>
            </div>

            {/* 标签页 */}
            <div className="flex border-b border-gray-700">
                <button
                    type="button"
                    onClick={() => setActiveTab('export')}
                    className={`flex-1 py-2 text-sm text-center transition-colors ${
                        activeTab === 'export'
                            ? 'text-wuxia-gold border-b-2 border-wuxia-gold'
                            : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    导出记忆
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('import')}
                    className={`flex-1 py-2 text-sm text-center transition-colors ${
                        activeTab === 'import'
                            ? 'text-wuxia-gold border-b-2 border-wuxia-gold'
                            : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    导入记忆
                </button>
            </div>

            {/* 导出面板 */}
            {activeTab === 'export' && (
                <div className="space-y-4">
                    {/* 导出格式 */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">导出格式</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setExportFormat('json')}
                                className={`p-2 rounded-lg border text-center text-sm transition-all ${
                                    exportFormat === 'json'
                                        ? 'border-wuxia-gold bg-wuxia-gold/10 text-wuxia-gold'
                                        : 'border-gray-700 bg-black/30 text-gray-300 hover:border-gray-500'
                                }`}
                            >
                                JSON
                            </button>
                            <button
                                type="button"
                                onClick={() => setExportFormat('txt')}
                                className={`p-2 rounded-lg border text-center text-sm transition-all ${
                                    exportFormat === 'txt'
                                        ? 'border-wuxia-gold bg-wuxia-gold/10 text-wuxia-gold'
                                        : 'border-gray-700 bg-black/30 text-gray-300 hover:border-gray-500'
                                }`}
                            >
                                纯文本
                            </button>
                        </div>
                    </div>

                    {/* 导出预设 */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">导出内容</label>
                        <div className="space-y-2">
                            {exportPresets.map((preset) => (
                                <button
                                    key={preset.value}
                                    type="button"
                                    onClick={() => setExportPreset(preset.value)}
                                    className={`w-full p-3 rounded-lg border text-left text-sm transition-all ${
                                        exportPreset === preset.value
                                            ? 'border-wuxia-gold bg-wuxia-gold/10 text-wuxia-gold'
                                            : 'border-gray-700 bg-black/30 text-gray-300 hover:border-gray-500'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{preset.label}</span>
                                    </div>
                                    <p className="text-xs opacity-70 mt-1">{preset.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <GameButton
                        onClick={handleExport}
                        disabled={isExporting}
                        variant="primary"
                        className="w-full"
                    >
                        {isExporting ? '导出中...' : `导出为 ${exportFormat.toUpperCase()}`}
                    </GameButton>
                </div>
            )}

            {/* 导入面板 */}
            {activeTab === 'import' && (
                <div className="space-y-4">
                    <div className="bg-black/20 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">导入说明</h4>
                        <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                            <li>仅支持 JSON 格式文件导入</li>
                            <li>导入将<span className="text-yellow-500">替换</span>现有记忆系统</li>
                            <li>如需合并，请使用"合并导入"功能</li>
                        </ul>
                    </div>

                    {/* 文件选择 */}
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="memory-import-file"
                        />
                        <label
                            htmlFor="memory-import-file"
                            className="block w-full p-4 border-2 border-dashed border-gray-700 rounded-lg text-center cursor-pointer hover:border-gray-500 transition-colors"
                        >
                            <div className="text-gray-400 text-sm">
                                {isImporting ? '导入中...' : '点击选择 JSON 文件'}
                            </div>
                        </label>
                    </div>

                    {/* 导入状态 */}
                    {importStatus.消息 && (
                        <div className={`p-3 rounded-lg text-sm ${
                            importStatus.类型 === 'success' 
                                ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}>
                            {importStatus.消息}
                        </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex gap-3">
                        <GameButton
                            onClick={handleMergeImport}
                            disabled={isImporting}
                            variant="secondary"
                            className="flex-1"
                        >
                            合并导入
                        </GameButton>
                    </div>

                    <p className="text-xs text-gray-600 text-center">
                        合并导入会将导入的记忆与现有记忆整合
                    </p>
                </div>
            )}

            {/* 关闭按钮 */}
            {onClose && (
                <GameButton
                    onClick={onClose}
                    variant="secondary"
                    className="w-full mt-4"
                >
                    关闭
                </GameButton>
            )}
        </div>
    );
};

export default MemoryImportExportPanel;
