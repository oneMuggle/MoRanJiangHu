import React, { useState } from 'react';
import { 性能监控配置结构 } from '../../../models/system';
import GameButton from '../../ui/GameButton';

interface Props {
    settings: 性能监控配置结构;
    onSave: (settings: 性能监控配置结构) => void;
}

const PerformanceMonitorSettings: React.FC<Props> = ({ settings, onSave }) => {
    const [form, setForm] = useState<性能监控配置结构>(settings);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = () => {
        onSave(form);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-wuxia-gold/30 pb-2">
                <h3 className="text-wuxia-gold font-serif font-bold text-lg">性能监控</h3>
                {showSuccess && <span className="text-green-400 text-xs font-bold animate-pulse">✔ 配置已保存</span>}
            </div>

            {/* 启用性能监控 */}
            <div className="space-y-2 bg-black/20 p-4 rounded border border-gray-800">
                <div className="flex items-center justify-between">
                    <div>
                        <label className="text-xs text-wuxia-cyan font-bold uppercase tracking-widest">启用性能监控</label>
                        <p className="text-gray-500 text-xs mt-1">开启后采集 FPS、AI 响应时间、生图时间等指标</p>
                    </div>
                    <button
                        onClick={() => setForm({ ...form, 启用性能监控: !form.启用性能监控 })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            form.启用性能监控 ? 'bg-wuxia-gold' : 'bg-gray-700'
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                form.启用性能监控 ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>
            </div>

            {/* 显示 FPS */}
            <div className="space-y-2 bg-black/20 p-4 rounded border border-gray-800">
                <div className="flex items-center justify-between">
                    <div>
                        <label className="text-xs text-wuxia-cyan font-bold uppercase tracking-widest">显示 FPS</label>
                        <p className="text-gray-500 text-xs mt-1">在游戏角落显示实时帧率</p>
                    </div>
                    <button
                        onClick={() => setForm({ ...form, 显示FPS: !form.显示FPS })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            form.显示FPS ? 'bg-wuxia-gold' : 'bg-gray-700'
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                form.显示FPS ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>
            </div>

            {/* AI 响应慢阈值 */}
            <div className="space-y-2 bg-black/20 p-4 rounded border border-gray-800">
                <label className="text-xs text-wuxia-cyan font-bold uppercase tracking-widest">AI 响应慢阈值 (ms)</label>
                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        min="1000"
                        max="60000"
                        step="1000"
                        value={form.AI响应慢阈值ms}
                        onChange={(e) => setForm({ ...form, AI响应慢阈值ms: parseInt(e.target.value) || 10000 })}
                        className="bg-black/50 border border-gray-600 p-2 text-white font-mono w-28 text-center focus:border-wuxia-gold outline-none"
                    />
                    <span className="text-gray-500 text-xs">超过该值时输出性能警告（默认 10000ms = 10秒）</span>
                </div>
            </div>

            {/* 生图慢阈值 */}
            <div className="space-y-2 bg-black/20 p-4 rounded border border-gray-800">
                <label className="text-xs text-wuxia-cyan font-bold uppercase tracking-widest">图片生成慢阈值 (ms)</label>
                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        min="5000"
                        max="120000"
                        step="5000"
                        value={form.生图慢阈值ms}
                        onChange={(e) => setForm({ ...form, 生图慢阈值ms: parseInt(e.target.value) || 30000 })}
                        className="bg-black/50 border border-gray-600 p-2 text-white font-mono w-28 text-center focus:border-wuxia-gold outline-none"
                    />
                    <span className="text-gray-500 text-xs">超过该值时输出性能警告（默认 30000ms = 30秒）</span>
                </div>
            </div>

            {/* 保存按钮 */}
            <div className="flex justify-end pt-4 border-t border-gray-800/50">
                <GameButton
                    onClick={handleSave}
                    className="px-6 py-2 bg-wuxia-gold text-black font-bold text-xs tracking-widest hover:bg-white transition-colors"
                >
                    保存配置
                </GameButton>
            </div>

            {/* 说明 */}
            <div className="bg-black/30 p-4 rounded border border-gray-800/50">
                <h4 className="text-wuxia-gold/70 text-xs font-bold uppercase tracking-widest mb-2">说明</h4>
                <ul className="text-gray-500 text-xs space-y-1 list-disc list-inside">
                    <li>FPS 通过 <code className="text-wuxia-cyan">requestAnimationFrame</code> 计算</li>
                    <li>内存信息仅 Chrome 浏览器支持</li>
                    <li>慢操作警告输出到浏览器控制台</li>
                    <li>AI 响应时间包含网络延迟和模型推理时间</li>
                </ul>
            </div>
        </div>
    );
};

export default PerformanceMonitorSettings;