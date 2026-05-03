/**
 * ImageManager Helper Functions
 * Extracted pure functions from ImageManagerModal.tsx
 */

import type { 
    NPC结构, 
    NPC生图任务记录, 
    场景生图任务记录,
    香闺秘档部位类型,
    角色锚点结构,
    PNG画风预设结构
} from '../../../../../types';

export const 获取生图阶段中文 = (stage?: NPC生图任务记录['进度阶段']): string => {
    if (!stage) return '未记录';
    const 生图阶段中文映射: Record<string, string> = {
        queued: '排队中',
        prompting: '词组转换中',
        generating: '生成图片中',
        saving: '保存结果中',
        success: '已完成',
        failed: '失败'
    };
    return 生图阶段中文映射[stage] || stage;
};

export const 从任务状态推导阶段 = (status?: NPC生图任务记录['状态']): NPC生图任务记录['进度阶段'] | undefined => {
    if (!status) return undefined;
    if (status === 'queued') return 'queued';
    if (status === 'running') return 'generating';
    if (status === 'success') return 'success';
    if (status === 'failed') return 'failed';
    return undefined;
};

export const 获取NPC构图文案 = (构图?: NPC生图任务记录['构图'] | 场景生图任务记录['构图'], 部位?: 香闺秘档部位类型): string => {
    if (构图 === '场景') return '场景图片';
    if (构图 === '部位特写') {
        return 部位 ? `${部位}特写` : '部位特写';
    }
    if (构图 === '立绘') return '立绘';
    if (构图 === '半身') return '3:4半身像';
    return '1:1头像';
};

export const 格式化时间 = (timestamp?: number): string => {
    if (!timestamp || !Number.isFinite(timestamp)) return '未记录';
    return new Date(timestamp).toLocaleString();
};

export const 任务标识匹配NPC = (taskNpcKey: string | undefined, npcId: string | undefined): boolean => {
    const key = (taskNpcKey || '').trim();
    const id = (npcId || '').trim();
    if (!key || !id) return false;
    return key === id || key === `id:${id}`;
};

export const 从任务标识提取NPCID = (taskNpcKey: string | undefined): string => {
    const key = (taskNpcKey || '').trim();
    if (!key) return '';
    if (key.startsWith('id:')) return key.slice(3).trim();
    return key;
};

export const 读取NPC展示摘要 = (
    npc?: NPC结构 | null,
    options?: { cultivationSystemEnabled?: boolean }
): string => {
    if (!npc) return '';
    const 显示境界 = options?.cultivationSystemEnabled !== false;
    const fragments = [
        npc.姓名 ? `姓名：${npc.姓名}` : '',
        npc.性别 ? `性别：${npc.性别}` : '',
        Number.isFinite(npc.年龄) ? `年龄：${npc.年龄}` : '',
        显示境界 && npc.境界 ? `境界：${npc.境界}` : '',
        npc.身份 ? `身份：${npc.身份}` : '',
        npc.外貌描写 ? `外貌：${npc.外貌描写}` : '',
        npc.身材描写 ? `身材：${npc.身材描写}` : '',
        npc.衣着风格 ? `衣着：${npc.衣着风格}` : ''
    ].filter(Boolean);
    return fragments.join('\n');
};

export const 读取角色锚点特征摘要 = (anchor?: 角色锚点结构 | null): string => {
    const features = anchor?.结构化特征;
    if (!features) return '未提取结构化特征';
    const lines = Object.entries(features)
        .map(([key, value]) => `${key}：${Array.isArray(value) ? value.filter(Boolean).join(', ') : ''}`)
        .filter((line) => !line.endsWith('：'));
    return lines.length > 0 ? lines.join('\n') : '未提取结构化特征';
};

export const 角色锚点有可用内容 = (anchor?: Partial<角色锚点结构> | null): boolean => {
    const positive = (anchor?.正面提示词 || '')
        .split(',')
        .map((item) => item.trim())
        .some((item) => item.length > 0 && /[\p{L}\p{N}]/u.test(item));
    if (positive) return true;
    const features = anchor?.结构化特征;
    if (!features) return false;
    return Object.values(features).some((value) => (
        Array.isArray(value)
        && value.some((item) => typeof item === 'string' && item.trim().length > 0)
    ));
};

export const 生成预设ID = (prefix: string): string => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const 手动尺寸基准: Record<'1:1' | '3:4' | '9:16' | '16:9', { 宽: number; 高: number; 描述: string }> = {
    '1:1': { 宽: 1024, 高: 1024, 描述: '1:1 正方' },
    '3:4': { 宽: 768, 高: 1024, 描述: '3:4 半身' },
    '9:16': { 宽: 576, 高: 1024, 描述: '9:16 竖构图' },
    '16:9': { 宽: 1024, 高: 576, 描述: '16:9 横构图' }
};

export const 获取手动尺寸预设 = (preset: '1:1' | '3:4' | '9:16' | '16:9', scale: '1x' | '2x') => {
    const base = 手动尺寸基准[preset];
    const factor = scale === '2x' ? 2 : 1;
    return {
        宽: String(base.宽 * factor),
        高: String(base.高 * factor),
        描述: base.描述
    };
};

export const 预设输入拦截键盘事件 = (event: React.KeyboardEvent<HTMLElement>) => {
    event.stopPropagation();
    if (event.key === 'Escape') {
        event.preventDefault();
    }
    if (event.key === 'Enter' && event.currentTarget instanceof HTMLInputElement) {
        event.preventDefault();
    }
};

export const 统计卡: React.FC<{ label: string; value: React.ReactNode; tone?: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = ({ label, value, tone = 'default' }) => {
    const toneClass = {
        default: 'border-gray-800 bg-black/35 text-white',
        success: 'border-emerald-900/40 bg-emerald-950/10 text-emerald-300',
        warning: 'border-amber-900/40 bg-amber-950/10 text-amber-300',
        danger: 'border-red-900/40 bg-red-950/10 text-red-300',
        info: 'border-sky-900/40 bg-sky-950/10 text-sky-300'
    }[tone];

    return (
        <div className={`rounded-xl border p-3 ${toneClass}`}>
            <div className="text-[10px] uppercase tracking-widest opacity-70 mb-1">{label}</div>
            <div className="text-lg md:text-xl font-semibold">{value}</div>
        </div>
    );
};

export const 空状态: React.FC<{ title: string; desc?: string }> = ({ title, desc }) => (
    <div className="min-h-[280px] rounded-2xl border border-dashed border-gray-800 bg-black/20 flex items-center justify-center text-center px-6">
        <div>
            <div className="text-base md:text-lg text-gray-300 font-serif">{title}</div>
            {desc && <div className="text-sm text-gray-500 mt-2 max-w-xl">{desc}</div>}
        </div>
    </div>
);