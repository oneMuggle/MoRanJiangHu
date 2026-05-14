/**
 * useAppEffects.ts
 *
 * 提取 App 级别的所有 useEffect、useMemo、useCallback 和辅助函数。
 *
 * 包含：
 * - Context snapshot builder effect
 * - 小说分解错误订阅 effect
 * - 懒加载预加载 effect
 * - 修炼体系强制关闭 effect
 * - 移动端设备键盘快捷键 effect
 * - 约定状态同步 effect
 * - 所有 useMemo 计算值
 * - 时间戳辅助函数
 *
 * @see App.tsx - 原始代码位于 App.tsx
 */

import * as React from 'react';
import { 环境时间转标准串, normalizeCanonicalGameTime, 结构化时间转标准串 } from '../../hooks/useGame/time/timeUtils';
import { 获取图片资源文本地址 } from '../../utils/imageAssets';
import { 构建字体注入样式文本, 构建UI文字CSS变量 } from '../../utils/visualSettings';
import { 小说拆分后台调度服务 } from '../../services/novel-decomposition/novelDecompositionScheduler';
import {
    MobileCharacter,
    MobileInventoryModal,
    MobileEquipmentModal,
    MobileBattleModal,
    MobileSocial,
    MobileWorldModal,
    MobileMapModal,
    MobileSect,
    MobileTask,
    MobileTeamModal,
    MobileKungfuModal,
    MobileStory,
    MobileHeroinePlanModal,
    MobileMemory,
    SettingsPanel,
    MobileSaveLoadModal,
    MobileWorldbookManagerModal,
    MobileNovelDecompositionWorkbenchModal,
    MobileImageManagerModal,
    MobileAgreementModal,
    MobileMusicPlayer,
    MobileDeviceModal,
    CharacterModal,
    InventoryModal,
    SocialModal,
    TaskModal,
    StoryModal,
    MemoryModal,
    WorldModal,
    MapModal,
    SaveLoadModal,
} from '../../components/features/lazyComponents';

// ============================================================================
// 类型
// ============================================================================

interface UseAppEffectsDeps {
    state: any;
    meta: any;
    actions: any;
    setters: any;
    isMobile: boolean;
    modalState: {
        chatContentHidden: boolean;
        setChatContentHidden: React.Dispatch<React.SetStateAction<boolean>>;
        sceneQuickGenHint: boolean;
        setSceneQuickGenHint: React.Dispatch<React.SetStateAction<boolean>>;
        sceneQuickGenToastVisible: boolean;
        setSceneQuickGenToastVisible: React.Dispatch<React.SetStateAction<boolean>>;
        contextSnapshot: unknown;
        setContextSnapshot: React.Dispatch<React.SetStateAction<unknown>>;
    };
}

interface AppEffectsReturn {
    // 辅助函数
    parseActionOptionText: (option: unknown) => string;
    toCanonicalGameTimestamp: (value: unknown) => string | null;
    parseGameTimestampToNumber: (timeValue: unknown) => number;
    formatGameTimestampForDisplay: (timeValue: unknown) => string;

    // 计算值
    tickerEvents: string[];
    renderTickerItems: (items: string[], keyPrefix: string) => React.ReactNode[];
    启用同人模式: boolean;
    启用修炼体系: boolean;
    当前剧情规划: any;
    当前女主剧情规划: any;
    currentEnvTime: string;
    当前背景图片地址: string | null;
    玩家头像地址: string | null;
    主角锚点: any;
    playerProfile: { 姓名: string | undefined; 头像图片URL: string | null };
    fontFaceStyleText: string;
    uiTextStyleVars: React.CSSProperties;
    hideBottomTicker: boolean;
    runtimeStateSections: Record<string, any>;
    latestAssistantMessage: any;
    currentOptions: string[];

    // ref
    最近小说分解报错提示IDRef: React.MutableRefObject<string>;
}

// ============================================================================
// Lazy preload targets (stable arrays)
// ============================================================================

const PRELOAD_TARGETS_MOBILE: Array<{ preload?: () => void }> = [
    MobileCharacter,
    MobileInventoryModal,
    MobileEquipmentModal,
    MobileBattleModal,
    MobileSocial,
    MobileWorldModal,
    MobileMapModal,
    MobileSect,
    MobileTask,
    MobileTeamModal,
    MobileKungfuModal,
    MobileStory,
    MobileHeroinePlanModal,
    MobileMemory,
    SettingsPanel,
    MobileSaveLoadModal,
    MobileWorldbookManagerModal,
    MobileNovelDecompositionWorkbenchModal,
    MobileImageManagerModal,
    MobileAgreementModal,
    MobileMusicPlayer,
    MobileDeviceModal,
];

const PRELOAD_TARGETS_DESKTOP: Array<{ preload?: () => void }> = [
    CharacterModal,
    InventoryModal,
    SocialModal,
    TaskModal,
    StoryModal,
    SettingsPanel,
    MemoryModal,
    WorldModal,
    MapModal,
    SaveLoadModal,
];

// ============================================================================
// 纯辅助函数 (模块级，与组件渲染无关)
// ============================================================================

const parseActionOptionText = (option: unknown): string => {
    if (typeof option === 'string') return option.trim();
    if (typeof option === 'number' || typeof option === 'boolean') return String(option);
    if (option && typeof option === 'object') {
        const obj = option as Record<string, unknown>;
        const candidates = [obj.text, obj.label, obj.action, obj.name, obj.id];
        for (const candidate of candidates) {
            if (typeof candidate === 'string' && candidate.trim().length > 0) {
                return candidate.trim();
            }
        }
    }
    return '';
};

const toCanonicalGameTimestamp = (value: unknown): string | null => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return 结构化时间转标准串(value);
    }
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const direct = normalizeCanonicalGameTime(trimmed);
    if (direct) return direct;
    const match = trimmed.match(/^(\d{1,6})[-/年](\d{1,2})[-/月](\d{1,2})(?:日)?(?:\s+|[T])?(\d{1,2})[:：时](\d{1,2})/);
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4]);
    const minute = Number(match[5]);
    if (
        !Number.isFinite(year) ||
        month < 1 || month > 12 ||
        day < 1 || day > 31 ||
        hour < 0 || hour > 23 ||
        minute < 0 || minute > 59
    ) {
        return null;
    }
    const pad2 = (n: number) => Math.trunc(n).toString().padStart(2, '0');
    return `${Math.trunc(year)}:${pad2(month)}:${pad2(day)}:${pad2(hour)}:${pad2(minute)}`;
};

const parseGameTimestampToNumber = (timeValue: unknown): number => {
    const canonical = toCanonicalGameTimestamp(timeValue);
    if (!canonical) return 0;
    const m = canonical.match(/^(\d{1,6}):(\d{2}):(\d{2}):(\d{2}):(\d{2})$/);
    if (!m) return 0;
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    const hour = Number(m[4]);
    const minute = Number(m[5]);
    return (((year * 12 + month) * 31 + day) * 24 + hour) * 60 + minute;
};

const formatGameTimestampForDisplay = (timeValue: unknown): string => {
    const canonical = toCanonicalGameTimestamp(timeValue);
    if (!canonical) return '未知时间';
    const m = canonical.match(/^(\d{1,6}):(\d{2}):(\d{2}):(\d{2}):(\d{2})$/);
    if (!m) return '未知时间';
    return `${m[1]}年${m[2]}月${m[3]}日 ${m[4]}:${m[5]}`;
};

// ============================================================================
// Hook
// ============================================================================

export function useAppEffects({
    state,
    meta,
    actions,
    setters,
    isMobile,
    modalState,
}: UseAppEffectsDeps): AppEffectsReturn {
    const { setContextSnapshot } = modalState;

    // --- Context snapshot builder ---
    React.useEffect(() => {
        const shouldBuildSnapshot = state.showSettings
            && (state.activeTab === 'context' || state.activeTab === 'prompt');
        if (!shouldBuildSnapshot) {
            setContextSnapshot(undefined);
            return;
        }
        if (typeof window === 'undefined') {
            void actions.getContextSnapshot().then((snapshot: unknown) => {
                setContextSnapshot(snapshot);
            });
            return;
        }

        let cancelled = false;
        const idleWindow = window as typeof window & {
            requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
            cancelIdleCallback?: (id: number) => void;
        };
        let idleId: number | null = null;
        let timerId: number | null = null;

        const buildSnapshot = async () => {
            if (cancelled) return;
            const nextSnapshot = await actions.getContextSnapshot();
            if (!cancelled) {
                setContextSnapshot(nextSnapshot);
            }
        };

        if (typeof idleWindow.requestIdleCallback === 'function') {
            idleId = idleWindow.requestIdleCallback(() => buildSnapshot(), { timeout: 180 });
        } else {
            timerId = window.setTimeout(buildSnapshot, 0);
        }

        return () => {
            cancelled = true;
            if (idleId !== null && typeof idleWindow.cancelIdleCallback === 'function') {
                idleWindow.cancelIdleCallback(idleId);
            }
            if (timerId !== null) {
                window.clearTimeout(timerId);
            }
        };
    }, [
        state.showSettings,
        state.activeTab,
        state.apiConfig,
        state.gameConfig,
        state.memoryConfig,
        state.prompts,
        state.历史记录,
        state.记忆系统,
        state.社交,
        state.角色,
        state.环境,
        state.世界,
        state.战斗,
        state.玩家门派,
        state.任务列表,
        state.约定列表,
        state.剧情,
        state.女主剧情规划,
        state.开局配置,
        meta.builtinPromptEntries,
        meta.worldbooks,
        actions,
        setContextSnapshot
    ]);

    // --- 小说分解错误订阅 ---
    const 最近小说分解报错提示IDRef = React.useRef('');

    React.useEffect(() => {
        const unsubscribe = 小说拆分后台调度服务.subscribe((schedulerState: any) => {
            const latestErrorLog = [...(schedulerState.recentLogs || [])]
                .reverse()
                .find((log: any) => log.level === 'error');
            if (!latestErrorLog) return;
            if (最近小说分解报错提示IDRef.current === latestErrorLog.id) return;
            最近小说分解报错提示IDRef.current = latestErrorLog.id;
            actions.pushNotification({
                title: '小说分解异常',
                message: latestErrorLog.text,
                tone: 'error'
            });
        });
        return unsubscribe;
    }, [actions]);

    // --- 懒加载预加载 ---
    React.useEffect(() => {
        if (state.view !== 'game' || typeof window === 'undefined') return;

        const preloadTargets = isMobile ? PRELOAD_TARGETS_MOBILE : PRELOAD_TARGETS_DESKTOP;

        let cancelled = false;
        const idleWindow = window as typeof window & {
            requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
            cancelIdleCallback?: (id: number) => void;
        };

        let idleId: number | null = null;
        let timerId: number | null = null;

        const warmup = () => {
            if (cancelled) return;
            preloadTargets.forEach((target: { preload?: () => void }, index: number) => {
                window.setTimeout(() => {
                    if (cancelled) return;
                    void target.preload?.();
                }, index * 160);
            });
        };

        if (typeof idleWindow.requestIdleCallback === 'function') {
            idleId = idleWindow.requestIdleCallback(() => warmup(), { timeout: 1200 });
        } else {
            timerId = window.setTimeout(warmup, 600);
        }

        return () => {
            cancelled = true;
            if (idleId !== null && typeof idleWindow.cancelIdleCallback === 'function') {
                idleWindow.cancelIdleCallback(idleId);
            }
            if (timerId !== null) {
                window.clearTimeout(timerId);
            }
        };
    }, [isMobile, state.view]);

    // --- useMemo: tickerEvents ---
    /* eslint-disable react-hooks/exhaustive-deps */
    const tickerEvents = React.useMemo(() => {
        const ongoingEvents = Array.isArray(state.世界?.进行中事件) ? state.世界.进行中事件 : [];
        const formatted = ongoingEvents
            .sort((a: any, b: any) => parseGameTimestampToNumber(b.开始时间) - parseGameTimestampToNumber(a.开始时间))
            .map((evt: any) => {
                const type = evt.类型 || '事件';
                const start = formatGameTimestampForDisplay(evt.开始时间);
                const title = evt.事件名 || '无标题';
                const location = (Array.isArray(evt.关联地点) ? evt.关联地点[0] : '') || '未知地点';
                return `【${type}】${start} ${title}（${location}）`;
            })
            .filter(Boolean);

        return formatted.length > 0 ? formatted : state.worldEvents;
    }, [state.世界, state.worldEvents]);
    /* eslint-enable react-hooks/exhaustive-deps */

    const renderTickerItems = React.useCallback((items: string[], keyPrefix: string) => (
        items.map((e: string, i: number) => (
            <span key={`${keyPrefix}-${i}`} className="mx-5 inline-block">{e}</span>
        ))
    ), []);

    // --- 同人模式 ---
    const 启用同人模式 = React.useMemo(
        () => state.开局配置?.同人融合?.enabled === true && state.开局配置?.同人融合?.启用附加小说 === true,
        [state.开局配置]
    );
    const 启用修炼体系 = state.gameConfig?.启用修炼体系 !== false;
    const 当前剧情规划 = 启用同人模式 ? state.同人剧情规划 : state.剧情规划;
    const 当前女主剧情规划 = 启用同人模式 ? state.同人女主剧情规划 : state.女主剧情规划;

    // --- 计算值 ---
    const currentEnvTime = React.useMemo(
        () => 环境时间转标准串(state.环境) || state.环境?.时间 || '未知时间',
        [state.环境]
    );
    const 当前背景图片地址 = React.useMemo(() => 获取图片资源文本地址(state.visualConfig?.背景图片), [state.visualConfig?.背景图片]);
    const 玩家头像地址 = React.useMemo(() => {
        const archive = state.角色?.图片档案;
        const selectedAvatarId = typeof archive?.已选头像图片ID === 'string' ? archive.已选头像图片ID.trim() : '';
        const selectedAvatar = (Array.isArray(archive?.生图历史) ? archive!.生图历史 : []).find((item: any) => item?.id === selectedAvatarId)
            || (archive?.最近生图结果?.id === selectedAvatarId ? archive.最近生图结果 : null);
        return 获取图片资源文本地址(selectedAvatar?.本地路径 || selectedAvatar?.图片URL || state.角色?.头像图片URL);
    }, [state.角色]);
    const 主角锚点 = React.useMemo(
        () => actions.getPlayerCharacterAnchor?.() || null,
        [actions]
    );
    const playerProfile = React.useMemo(
        () => ({ 姓名: state.角色?.姓名, 头像图片URL: 玩家头像地址 }),
        [state.角色?.姓名, 玩家头像地址]
    );
    const fontFaceStyleText = React.useMemo(() => 构建字体注入样式文本(state.visualConfig), [state.visualConfig]);
    const uiTextStyleVars = React.useMemo(() => 构建UI文字CSS变量(state.visualConfig), [state.visualConfig]);
    const hideBottomTicker = state.visualConfig?.底部滚动关闭显示 === true;
    const runtimeStateSections = React.useMemo(() => ({
        角色: state.角色,
        环境: state.环境,
        社交: state.社交,
        世界: state.世界,
        战斗: state.战斗,
        剧情: state.剧情,
        女主剧情规划: state.女主剧情规划,
        玩家门派: state.玩家门派,
        任务列表: state.任务列表,
        约定列表: state.约定列表,
        记忆系统: state.记忆系统
    }), [state.角色, state.环境, state.社交, state.世界, state.战斗, state.剧情, state.女主剧情规划, state.玩家门派, state.任务列表, state.约定列表, state.记忆系统]);

    const latestAssistantMessage = React.useMemo(
        () => [...state.历史记录]
            .reverse()
            .find((item: any) => item?.role === 'assistant' && item?.structuredResponse),
        [state.历史记录]
    );
    const currentOptions = React.useMemo(
        () => (latestAssistantMessage?.role === 'assistant' && Array.isArray(latestAssistantMessage.structuredResponse?.action_options))
            ? latestAssistantMessage.structuredResponse.action_options
                .map(parseActionOptionText)
                .filter(item => item.length > 0)
            : [],
        [latestAssistantMessage]
    );

    // --- 修炼体系强制关闭 ---
    React.useEffect(() => {
        if (!启用修炼体系) {
            window.dispatchEvent(new CustomEvent('modal:close', { detail: { id: 'kungfu' } }));
        }
    }, [启用修炼体系]);

    // --- Mobile Device 键盘快捷键 (M 键) ---
    React.useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'm' || e.key === 'M') {
                if (state.view === 'game' && !state.showSettings && !state.showSocial && !state.showInventory && !state.showEquipment && !state.showBattle && !state.showTeam && !state.showKungfu && !state.showWorld && !state.showMap && !state.showSect && !state.showTask && !state.showAgreement && !state.showStory && !state.showHeroinePlan && !state.showMemory && !state.showSaveLoad.show) {
                    actions.openDevice();
                }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [state.view, state.showSettings, state.showSocial, state.showInventory, state.showEquipment, state.showBattle, state.showTeam, state.showKungfu, state.showWorld, state.showMap, state.showSect, state.showTask, state.showAgreement, state.showStory, state.showHeroinePlan, state.showMemory, state.showSaveLoad, actions]);

    // --- 约定状态同步 ---
    /* eslint-disable react-hooks/exhaustive-deps */
    React.useEffect(() => {
        const 校园系统 = state.校园系统 as any;
        if (!校园系统?.见面预约列表?.length || !state.约定列表?.length) return;

        const 更新预约列表 = 校园系统.见面预约列表.map((预约: any) => {
            const 匹配约定 = state.约定列表.find(
                (a: any) => a.对象 === 预约.npcName && a.背景故事?.includes('校园BDSM见面预约')
            );
            if (!匹配约定) return 预约;

            const 新状态映射: Record<string, string> = {
                '已履行': '已见面',
                '已违约': '已违约',
            };
            const 新预约状态 = 新状态映射[匹配约定.当前状态];
            if (新预约状态 && 预约.状态 !== 新预约状态) {
                return { ...预约, 状态: 新预约状态 };
            }
            return 预约;
        });

        if (JSON.stringify(更新预约列表) !== JSON.stringify(校园系统.见面预约列表)) {
            setters.set校园系统?.({ ...校园系统, 见面预约列表: 更新预约列表 });
        }
    }, [state.约定列表, state.校园系统, setters.set校园系统]);
    /* eslint-enable react-hooks/exhaustive-deps */

    return {
        parseActionOptionText,
        toCanonicalGameTimestamp,
        parseGameTimestampToNumber,
        formatGameTimestampForDisplay,
        tickerEvents,
        renderTickerItems,
        启用同人模式,
        启用修炼体系,
        当前剧情规划,
        当前女主剧情规划,
        currentEnvTime,
        当前背景图片地址,
        玩家头像地址,
        主角锚点,
        playerProfile,
        fontFaceStyleText,
        uiTextStyleVars,
        hideBottomTicker,
        runtimeStateSections,
        latestAssistantMessage,
        currentOptions,
        最近小说分解报错提示IDRef,
    };
}
