import { useState, useRef, useEffect } from 'react';
import {
    processAssistantMessage,
    type AssistantMessage,
    type ConfigWithModels,
    type AssignmentRecommendation,
} from '../../../services/ai/text/configAssistant';
import { 接口设置结构 } from '../../../models/system';
import { 供应商标签 } from '../../../utils/apiConfig';

interface Props {
    onClose: () => void;
    currentSettings: 接口设置结构;
    onApply: (configs: ConfigWithModels[], recommendation: AssignmentRecommendation) => void;
}

export default function ApiConfigAssistant({ onClose, currentSettings, onApply }: Props) {
    const [messages, setMessages] = useState<AssistantMessage[]>([
        {
            role: 'assistant',
            content:
                '你好！我是 API 配置助手。你可以粘贴 API 配置文本，或告诉我你的 API 端点信息，我来帮你自动配置。\n\n格式示例：\napi地址：https://example.com/v1\n令牌：sk-abc123',
        },
    ]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [configs, setConfigs] = useState<ConfigWithModels[]>([]);
    const [recommendation, setRecommendation] = useState<AssignmentRecommendation | null>(null);
    const [showConfigPanel, setShowConfigPanel] = useState(true);
    const [assistantBaseUrl, setAssistantBaseUrl] = useState('');
    const [assistantApiKey, setAssistantApiKey] = useState('');
    const [assistantModel, setAssistantModel] = useState('');
    const [configReady, setConfigReady] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-fill from existing configs
    const autoConfigured = useRef(false);
    useEffect(() => {
        if (autoConfigured.current) return;
        const mainConfig = currentSettings.configs?.find((c) => c.id === currentSettings.activeConfigId);
        if (mainConfig?.baseUrl && mainConfig?.apiKey) {
            setAssistantBaseUrl(mainConfig.baseUrl.replace(/\/+$/, ''));
            setAssistantApiKey(mainConfig.apiKey);
            setAssistantModel(mainConfig.model || '');
            setConfigReady(true);
            setShowConfigPanel(false);
            autoConfigured.current = true;
            // Post a system message to inform user
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: `已自动使用当前配置：${mainConfig.名称 || '未命名'}（${mainConfig.baseUrl.replace(/\/+$/, '')}）\n如需更换助手后端，请点击右上角齿轮图标。`,
                },
            ]);
        }
    }, [currentSettings]);

    const handleConfirmConfig = () => {
        if (assistantBaseUrl.trim() && assistantApiKey.trim()) {
            setAssistantBaseUrl((prev) => prev.trim().replace(/\/+$/, ''));
            setAssistantApiKey((prev) => prev.trim());
            setShowConfigPanel(false);
            setConfigReady(true);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isProcessing) return;
        if (!configReady) {
            setShowConfigPanel(true);
            return;
        }

        const userText = input.trim();
        setInput('');

        // Immediately show user message
        setMessages((prev) => [...prev, { role: 'user', content: userText }]);

        // Add placeholder for assistant response
        const assistantMsgIndex = messages.length + 1; // +1 because we just added user msg
        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

        setIsProcessing(true);

        try {
            const result = await processAssistantMessage(
                userText,
                assistantBaseUrl,
                assistantApiKey,
                assistantModel || undefined,
                configs,
                undefined,
                (_delta, full) => {
                    setMessages((prev) => {
                        const next = [...prev];
                        next[assistantMsgIndex] = { role: 'assistant', content: full };
                        return next;
                    });
                }
            );
            setConfigs(result.configs);
            setRecommendation(result.recommendation);
        } catch (error) {
            const msg = error instanceof Error ? error.message : '处理失败';
            setMessages((prev) => {
                const next = [...prev];
                if (next.length > 0 && next[next.length - 1].role === 'assistant') {
                    next[next.length - 1] = { role: 'error', content: msg };
                } else {
                    next.push({ role: 'error', content: msg });
                }
                return next;
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleApply = () => {
        if (recommendation) {
            onApply(configs, recommendation);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl max-h-[85vh] sm:max-h-[85vh] h-[100dvh] sm:h-auto flex flex-col bg-gray-900/95 border border-wuxia-gold/30 rounded-none sm:rounded-xl shadow-2xl mx-2 sm:mx-4">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-wuxia-gold/20">
                    <h2 className="text-lg font-bold font-serif text-wuxia-gold">AI 配置助手</h2>
                    <div className="flex items-center gap-2">
                        {configReady && (
                            <span className="text-xs text-gray-500 truncate max-w-[200px]">
                                {assistantBaseUrl.replace(/\/+$/, '')}
                            </span>
                        )}
                        <button
                            onClick={() => setShowConfigPanel(!showConfigPanel)}
                            className="text-xs text-wuxia-gold/70 hover:text-wuxia-gold transition-colors"
                            title="配置助手后端"
                        >
                            ⚙
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors text-xl leading-none"
                            aria-label="关闭"
                        >
                            &times;
                        </button>
                    </div>
                </div>

                {/* Config panel */}
                {showConfigPanel && (
                    <AssistantConfigPanel
                        baseUrl={assistantBaseUrl}
                        apiKey={assistantApiKey}
                        model={assistantModel}
                        existingConfigs={currentSettings.configs || []}
                        onBaseUrlChange={setAssistantBaseUrl}
                        onApiKeyChange={setAssistantApiKey}
                        onModelChange={setAssistantModel}
                        onConfirm={handleConfirmConfig}
                        isReady={configReady}
                    />
                )}

                {/* Ready indicator */}
                {configReady && !showConfigPanel && (
                    <div className="px-4 py-2 text-xs text-green-400 border-b border-green-500/20 bg-green-900/10 flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        助手就绪：{assistantBaseUrl.replace(/\/+$/, '')}
                        {assistantModel && <span>· {assistantModel}</span>}
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                    {messages.map((msg, i) => (
                        <MessageBubble key={i} message={msg} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Apply button */}
                {recommendation && (
                    <div className="px-4 py-2 border-t border-wuxia-gold/10">
                        <button
                            onClick={handleApply}
                            className="w-full py-2 rounded-lg bg-green-700/80 hover:bg-green-600 text-white text-sm font-bold transition-colors"
                        >
                            确认应用推荐配置
                        </button>
                    </div>
                )}

                {/* Input */}
                <div className="px-4 py-3 border-t border-wuxia-gold/20">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            placeholder={configReady ? '粘贴 API 配置或输入信息...' : '请先在上方配置助手后端'}
                            disabled={isProcessing || !configReady}
                            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-wuxia-gold focus:outline-none disabled:opacity-50"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isProcessing || !input.trim() || !configReady}
                            className="px-4 py-2 rounded-lg bg-wuxia-gold/20 hover:bg-wuxia-gold/30 text-wuxia-gold text-sm font-bold transition-colors disabled:opacity-40"
                        >
                            {isProcessing ? '处理中...' : '发送'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface PanelProps {
    baseUrl: string;
    apiKey: string;
    model: string;
    existingConfigs: Array<{ id: string; 名称: string; 供应商: string; baseUrl: string; apiKey: string; model: string }>;
    onBaseUrlChange: (v: string) => void;
    onApiKeyChange: (v: string) => void;
    onModelChange: (v: string) => void;
    onConfirm: () => void;
    isReady: boolean;
}

function AssistantConfigPanel({
    baseUrl, apiKey, model, existingConfigs,
    onBaseUrlChange, onApiKeyChange, onModelChange, onConfirm, isReady,
}: PanelProps) {
    return (
        <div className="px-4 py-3 border-b border-wuxia-gold/20 bg-gray-800/50 space-y-3">
            <div className="text-xs text-gray-400">配置助手的 LLM 后端（用于解析你的输入）：</div>

            {/* Quick select from existing configs */}
            {existingConfigs.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {existingConfigs.map((cfg) => (
                        <button
                            key={cfg.id}
                            onClick={() => {
                                onBaseUrlChange(cfg.baseUrl.replace(/\/+$/, ''));
                                onApiKeyChange(cfg.apiKey);
                                onModelChange(cfg.model || '');
                            }}
                            className={`px-2 py-1 rounded text-xs transition-colors ${
                                baseUrl === cfg.baseUrl
                                    ? 'bg-wuxia-gold/30 text-wuxia-gold border border-wuxia-gold/50'
                                    : 'bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:border-wuxia-gold/30'
                            }`}
                        >
                            {cfg.名称 || `${供应商标签[cfg.供应商 as keyof typeof 供应商标签] || '未知'}`}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                <input
                    type="text"
                    value={baseUrl}
                    onChange={(e) => onBaseUrlChange(e.target.value)}
                    placeholder="https://example.com/v1"
                    className="min-w-0 flex-1 sm:flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-xs text-white placeholder-gray-500 focus:border-wuxia-gold focus:outline-none"
                />
                <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => onApiKeyChange(e.target.value)}
                    placeholder="sk-..."
                    className="min-w-0 flex-1 sm:flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-xs text-white placeholder-gray-500 focus:border-wuxia-gold focus:outline-none"
                />
                <input
                    type="text"
                    value={model}
                    onChange={(e) => onModelChange(e.target.value)}
                    placeholder="模型名 (可选)"
                    className="w-24 sm:w-32 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-xs text-white placeholder-gray-500 focus:border-wuxia-gold focus:outline-none"
                />
                <button
                    onClick={onConfirm}
                    disabled={!baseUrl.trim() || !apiKey.trim()}
                    className={`w-full sm:w-auto px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                        isReady
                            ? 'bg-green-600/30 text-green-400 border border-green-500/30'
                            : 'bg-wuxia-gold/20 text-wuxia-gold disabled:opacity-40'
                    }`}
                >
                    {isReady ? '已确认' : '确认'}
                </button>
            </div>
        </div>
    );
}

function MessageBubble({ message }: { message: AssistantMessage }) {
    const isUser = message.role === 'user';
    const isError = message.role === 'error';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words ${
                    isError
                        ? 'bg-red-900/40 text-red-300 border border-red-500/30'
                        : isUser
                        ? 'bg-wuxia-gold/20 text-wuxia-gold'
                        : 'bg-gray-700/60 text-gray-200'
                }`}
            >
                {message.content}
            </div>
        </div>
    );
}
