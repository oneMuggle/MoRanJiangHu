/**
 * BDSM 关系操作工作流
 * 从 useGame.ts 提取的同步 + 异步 BDSM 关系管理操作
 */
import { useCallback } from 'react';
import { 触发任务生成, 触发日常指令刷新 } from './bdsmTaskTrigger';
import { 生成调教任务, 生成日常指令, 评价任务完成, 生成契约条款, 判定关系阶段推进 } from './bdsmTaskWorkflow';
import { 获取主剧情接口配置 } from '../../utils/apiConfig';
import type { BDSM调教任务, BDSM任务状态, BDSM评价等级, 契约记录 } from '../../models/campusNSFW';
import type { 关系阶段, BDSM日常指令 } from '../../models/campusNSFW/sm';
import type { 日常指令 } from './bdsmMeetingWorkflow';

interface BDSM关系操作依赖 {
    校园系统: { 欲望系统?: { NPC欲望档案?: Record<string, any> } } | null;
    apiConfig: any;
    设置校园系统: (updater: (prev: any) => any) => void;
}

interface 校园NSFW设置 {
    启用校园NSFW深化系统?: boolean;
}

interface BDSM状态更新数据 {
    任务更新?: Array<{ id: string; 状态?: string; 评价?: string }>;
    服从度变化?: Record<string, number>;
    关系阶段推进?: Record<string, string>;
    契约更新?: Array<{ id: string; 违约次数?: number }>;
    里程碑?: Array<{ 类型: string; 时间: string; 描述: string }>;
    日常指令?: any[];
}

interface BDSM见面预约更新数据 {
    npcId: string;
    新状态: '已协商' | '已见面' | '已取消';
}

interface BDSM关系操作返回 {
    更新BDSM关系状态: (npcId: string, updater: (state: any) => any) => void;
    添加BDSM任务: (npcId: string, 任务: Omit<BDSM调教任务, 'id' | '状态' | '发布时间'>) => BDSM调教任务;
    更新BDSM任务状态: (npcId: string, 任务ID: string, 新状态: BDSM任务状态, 评价?: BDSM评价等级) => void;
    更新契约状态: (npcId: string, 新契约: 契约记录) => void;
    添加BDSM里程碑: (npcId: string, 类型: string, 描述: string) => void;
    设置日常指令: (npcId: string, 指令: 日常指令[]) => void;
    请求生成BDSM任务: (npcId: string, npcName: string) => Promise<{ success: boolean; 任务数: number; error?: string }>;
    请求生成BDSM日常指令: (npcId: string, npcName: string) => Promise<{ success: boolean; 指令数: number; error?: string }>;
    请求评价BDSM任务: (npcId: string, 任务ID: string, 执行情况: string) => Promise<{ success: boolean; 评价: string; 服从度变化: number; error?: string }>;
    请求生成BDSM契约: (npcId: string, 契约类型: '口头约定' | '书面契约' | '信物交换') => Promise<{ success: boolean; error?: string }>;
    请求判定BDSM阶段推进: (npcId: string, npcName: string) => Promise<{ advanced: boolean; 新阶段?: string; 理由?: string }>;
    构建BDSM状态更新回调: (nsfw设置: 校园NSFW设置 | undefined) => (bdsmResult: BDSM状态更新数据) => void;
    构建BDSM见面预约更新回调: () => (更新: BDSM见面预约更新数据) => void;
    请求报告任务完成: (taskId: string, npcId: string, executionDescription: string) => Promise<{ evaluation: string; obedienceDelta: number }>;
    请求阶段推进: (npcId: string) => Promise<{ advanced: boolean; newStage?: string; reason?: string }>;
}

export function 创建BDSM关系操作工作流(deps: BDSM关系操作依赖): BDSM关系操作返回 {
    const { 校园系统, apiConfig, 设置校园系统 } = deps;

    const 更新BDSM关系状态 = useCallback((npcId: string, updater: (state: any) => any) => {
        设置校园系统(prev => {
            if (!prev?.欲望系统?.NPC欲望档案?.[npcId]?.BDSM关系) return prev;
            const 档案 = prev.欲望系统.NPC欲望档案[npcId];
            return {
                ...prev,
                欲望系统: {
                    ...prev.欲望系统,
                    NPC欲望档案: {
                        ...prev.欲望系统.NPC欲望档案,
                        [npcId]: {
                            ...档案,
                            BDSM关系: updater(档案.BDSM关系),
                        },
                    },
                },
            };
        });
    }, [设置校园系统]);

    const 添加BDSM任务 = useCallback((npcId: string, 任务: Omit<BDSM调教任务, 'id' | '状态' | '发布时间'>) => {
        const 新任务: BDSM调教任务 = {
            ...任务,
            id: `bdsm_task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            状态: '待接受' as const,
            发布时间: new Date().toISOString(),
        };
        更新BDSM关系状态(npcId, prev => ({
            ...prev,
            任务历史: [...prev.任务历史, 新任务],
        }));
        return 新任务;
    }, [更新BDSM关系状态]);

    const 更新BDSM任务状态 = useCallback((npcId: string, 任务ID: string, 新状态: BDSM任务状态, 评价?: BDSM评价等级) => {
        更新BDSM关系状态(npcId, prev => ({
            ...prev,
            任务历史: prev.任务历史.map(t =>
                t.id === 任务ID
                    ? { ...t, 状态: 新状态, 评价, 完成时间: 新状态 === '已完成' ? new Date().toISOString() : t.完成时间 }
                    : t
            ),
        }));
    }, [更新BDSM关系状态]);

    const 更新契约状态 = useCallback((npcId: string, 新契约: 契约记录) => {
        更新BDSM关系状态(npcId, prev => ({
            ...prev,
            契约记录: [...prev.契约记录, 新契约],
        }));
    }, [更新BDSM关系状态]);

    const 添加BDSM里程碑 = useCallback((npcId: string, 类型: string, 描述: string) => {
        更新BDSM关系状态(npcId, prev => ({
            ...prev,
            里程碑: [...prev.里程碑, { 类型, 时间: new Date().toISOString(), 描述 }],
        }));
    }, [更新BDSM关系状态]);

    const 设置日常指令 = useCallback((npcId: string, 指令: 日常指令[]) => {
        更新BDSM关系状态(npcId, prev => ({
            ...prev,
            日常指令: 指令,
        }));
    }, [更新BDSM关系状态]);

    // --- 异步 AI 操作 ---

    const 请求生成BDSM任务 = useCallback(async (npcId: string, npcName: string): Promise<{ success: boolean; 任务数: number; error?: string }> => {
        const 档案 = 校园系统?.欲望系统?.NPC欲望档案?.[npcId];
        if (!档案?.BDSM关系) return { success: false, 任务数: 0, error: '未找到BDSM关系' };
        const 关系 = 档案.BDSM关系;
        const 活跃任务 = (关系.任务历史 || []).filter((t: any) => t.状态 === '待接受' || t.状态 === '进行中');

        const 触发结果 = 触发任务生成({ 活跃任务, 关系状态: 关系, npcName });
        if (!触发结果.需要生成) return { success: false, 任务数: 0, error: '当前任务充足，无需生成' };

        const 主剧情Api = 获取主剧情接口配置(apiConfig);
        if (!主剧情Api || !主剧情Api.apiKey) return { success: false, 任务数: 0, error: 'AI 未配置' };

        try {
            const 新任务 = await 生成调教任务({
                契约类型: 关系.契约记录.length > 0 ? 关系.契约记录[关系.契约记录.length - 1].类型 : '口头约定',
                契约状态: 关系.契约记录.length > 0 ? 关系.契约记录[关系.契约记录.length - 1].状态 : '口头约定',
                服从度: 关系.服从度,
                权力倾向: 关系.权力天平 > 0 ? '支配' : '服从',
                关系阶段: 关系.阶段,
                已解锁场景: [],
                历史任务数量: 关系.任务历史.length,
                NPC性格特征: npcName,
            }, 主剧情Api);

            if (新任务.length === 0) return { success: false, 任务数: 0, error: 'AI 未返回有效任务' };

            for (const 任务 of 新任务) {
                添加BDSM任务(npcId, 任务 as any);
            }
            return { success: true, 任务数: 新任务.length };
        } catch (err) {
            console.warn('[BDSM] 任务生成失败:', err);
            return { success: false, 任务数: 0, error: String(err) };
        }
    }, [校园系统, apiConfig, 添加BDSM任务]);

    const 请求生成BDSM日常指令 = useCallback(async (npcId: string, npcName: string): Promise<{ success: boolean; 指令数: number; error?: string }> => {
        const 档案 = 校园系统?.欲望系统?.NPC欲望档案?.[npcId];
        if (!档案?.BDSM关系) return { success: false, 指令数: 0, error: '未找到BDSM关系' };
        const 关系 = 档案.BDSM关系;
        const 现有指令 = 关系.日常指令 || [];

        const 触发结果 = 触发日常指令刷新({ 日常指令: 现有指令, 关系状态: 关系, npcName });
        if (!触发结果.需要刷新) return { success: false, 指令数: 0, error: '指令无需刷新' };

        const 主剧情Api = 获取主剧情接口配置(apiConfig);
        if (!主剧情Api || !主剧情Api.apiKey) return { success: false, 指令数: 0, error: 'AI 未配置' };

        try {
            const 新指令 = await 生成日常指令({
                服从度: 关系.服从度,
                契约状态: 关系.契约记录.length > 0 ? 关系.契约记录[关系.契约记录.length - 1].状态 : '口头约定',
                关系阶段: 关系.阶段,
                已发布指令数: 现有指令.length,
                NPC性格特征: npcName,
            }, 主剧情Api);

            if (新指令.length === 0) return { success: false, 指令数: 0, error: 'AI 未返回有效指令' };

            设置日常指令(npcId, 新指令);
            return { success: true, 指令数: 新指令.length };
        } catch (err) {
            console.warn('[BDSM] 日常指令生成失败:', err);
            return { success: false, 指令数: 0, error: String(err) };
        }
    }, [校园系统, apiConfig, 设置日常指令]);

    const 请求评价BDSM任务 = useCallback(async (
        npcId: string,
        任务ID: string,
        执行情况: string
    ): Promise<{ success: boolean; 评价: string; 服从度变化: number; error?: string }> => {
        const 档案 = 校园系统?.欲望系统?.NPC欲望档案?.[npcId];
        if (!档案?.BDSM关系) return { success: false, 评价: '', 服从度变化: 0, error: '未找到BDSM关系' };
        const 关系 = 档案.BDSM关系;
        const 任务 = (关系.任务历史 || []).find((t: any) => t.id === 任务ID);
        if (!任务) return { success: false, 评价: '', 服从度变化: 0, error: '未找到任务' };

        const 主剧情Api = 获取主剧情接口配置(apiConfig);

        try {
            const 评价结果 = await 评价任务完成(
                { 类型: 任务.类型, 难度: 任务.难度, 描述: 任务.描述 },
                执行情况,
                关系.服从度,
                undefined,
                主剧情Api
            );

            更新BDSM任务状态(npcId, 任务ID, '已完成', 评价结果.评价);

            更新BDSM关系状态(npcId, prev => {
                const 新服从度 = Math.max(0, Math.min(100, (prev.服从度 || 50) + 评价结果.服从度变化));
                return { ...prev, 服从度: 新服从度 };
            });

            return { success: true, 评价: 评价结果.反馈, 服从度变化: 评价结果.服从度变化 };
        } catch (err) {
            console.warn('[BDSM] 任务评价失败:', err);
            return { success: false, 评价: '', 服从度变化: 0, error: String(err) };
        }
    }, [校园系统, apiConfig, 更新BDSM任务状态, 更新BDSM关系状态]);

    const 请求生成BDSM契约 = useCallback(async (
        npcId: string,
        契约类型: '口头约定' | '书面契约' | '信物交换'
    ): Promise<{ success: boolean; error?: string }> => {
        const 档案 = 校园系统?.欲望系统?.NPC欲望档案?.[npcId];
        if (!档案?.BDSM关系) return { success: false, error: '未找到BDSM关系' };
        const 关系 = 档案.BDSM关系;

        const 主剧情Api = 获取主剧情接口配置(apiConfig);
        if (!主剧情Api || !主剧情Api.apiKey) return { success: false, error: 'AI 未配置' };

        try {
            const 契约结果 = await 生成契约条款(
                契约类型,
                关系.阶段,
                关系.服从度,
                关系.权力天平 > 0 ? '支配' : '服从',
                关系.底线列表,
                主剧情Api
            );

            const 新契约: 契约记录 = {
                id: `bdsm_contract_${Date.now()}`,
                类型: 契约类型,
                状态: (契约类型 === '口头约定' ? '口头约定' : '书面契约') as '口头约定' | '书面契约',
                条款列表: 契约结果.条款,
                缔结时间: new Date().toISOString(),
                违约次数: 0,
            };

            更新契约状态(npcId, 新契约);
            添加BDSM里程碑(npcId, '契约', `达成${契约类型}：${契约结果.条款.slice(0, 2).join('、')}`);

            return { success: true };
        } catch (err) {
            console.warn('[BDSM] 契约生成失败:', err);
            return { success: false, error: String(err) };
        }
    }, [校园系统, apiConfig, 更新契约状态, 添加BDSM里程碑]);

    const 请求判定BDSM阶段推进 = useCallback(async (npcId: string, npcName: string): Promise<{ advanced: boolean; 新阶段?: string; 理由?: string }> => {
        const 档案 = 校园系统?.欲望系统?.NPC欲望档案?.[npcId];
        if (!档案?.BDSM关系) return { advanced: false };
        const 关系 = 档案.BDSM关系;

        const 主剧情Api = 获取主剧情接口配置(apiConfig);
        const 已完成任务数 = (关系.任务历史 || []).filter((t: any) => t.状态 === '已完成').length;
        const 完美服从数 = (关系.任务历史 || []).filter((t: any) => t.评价 === '完美服从').length;
        const 违约次数 = (关系.契约记录 || []).reduce((sum: number, c: any) => sum + (c.违约次数 || 0), 0);

        try {
            const 结果 = await 判定关系阶段推进(
                关系.阶段,
                关系.服从度,
                已完成任务数,
                完美服从数,
                违约次数,
                关系.契约记录.length > 0 ? 关系.契约记录[关系.契约记录.length - 1].类型 : '口头约定',
                '',
                主剧情Api
            );

            if (结果.是否推进 && 结果.下一阶段) {
                更新BDSM关系状态(npcId, prev => ({
                    ...prev,
                    阶段: 结果.下一阶段 as any,
                }));
                添加BDSM里程碑(npcId, '阶段推进', `${关系.阶段}→${结果.下一阶段}：${结果.理由}`);
                return { advanced: true, 新阶段: 结果.下一阶段, 理由: 结果.理由 };
            }
            return { advanced: false, 理由: 结果.理由 };
        } catch (err) {
            console.warn('[BDSM] 阶段判定失败:', err);
            return { advanced: false };
        }
    }, [校园系统, apiConfig, 更新BDSM关系状态, 添加BDSM里程碑]);

    // --- handleSend onBDSM 回调 ---

    const 构建BDSM状态更新回调 = (nsfw设置: 校园NSFW设置 | undefined) => {
        const 校园NSFW已启用 = nsfw设置?.启用校园NSFW深化系统 ?? false;
        if (!校园NSFW已启用) return () => {};

        return (bdsmResult: BDSM状态更新数据) => {
            设置校园系统(prev => {
                const 欲望系统 = prev?.欲望系统;
                if (!欲望系统?.NPC欲望档案) return prev;

                const 更新后档案 = { ...欲望系统.NPC欲望档案 };

                if (bdsmResult.任务更新 && bdsmResult.任务更新.length > 0) {
                    for (const [npcId, 档案] of Object.entries(更新后档案)) {
                        const 档案Any = 档案 as any;
                        if (!档案Any.BDSM关系) continue;
                        const 任务列表 = 档案Any.BDSM关系.任务历史 || [];
                        const 更新 = bdsmResult.任务更新!.filter(t =>
                            任务列表.some((t2: any) => t2.id === t.id)
                        );
                        for (const t of 更新) {
                            const idx = 任务列表.findIndex((x: any) => x.id === t.id);
                            if (idx >= 0) {
                                if (t.状态) 任务列表[idx].状态 = t.状态;
                                if (t.评价) 任务列表[idx].评价 = t.评价;
                            }
                        }
                    }
                }

                if (bdsmResult.服从度变化) {
                    for (const [npcId, delta] of Object.entries(bdsmResult.服从度变化)) {
                        if (更新后档案[npcId]?.BDSM关系) {
                            更新后档案[npcId].BDSM关系.服从度 =
                                Math.max(0, Math.min(100,
                                    (更新后档案[npcId].BDSM关系.服从度 || 50) + delta
                                ));
                        }
                    }
                }

                if (bdsmResult.关系阶段推进) {
                    for (const [npcId, 新阶段] of Object.entries(bdsmResult.关系阶段推进)) {
                        if (更新后档案[npcId]?.BDSM关系) {
                            更新后档案[npcId].BDSM关系.阶段 = 新阶段 as any;
                        }
                    }
                }

                if (bdsmResult.契约更新 && bdsmResult.契约更新.length > 0) {
                    for (const [npcId, 档案] of Object.entries(更新后档案)) {
                        const 档案Any = 档案 as any;
                        if (!档案Any.BDSM关系) continue;
                        const 契约列表 = 档案Any.BDSM关系.契约记录 || [];
                        for (const c of bdsmResult.契约更新!) {
                            const idx = 契约列表.findIndex((x: any) => x.id === c.id);
                            if (idx >= 0 && c.违约次数 !== undefined) {
                                契约列表[idx].违约次数 = c.违约次数;
                            }
                        }
                    }
                }

                if (bdsmResult.里程碑 && bdsmResult.里程碑.length > 0) {
                    for (const [npcId, 档案] of Object.entries(更新后档案)) {
                        const 档案Any = 档案 as any;
                        if (!档案Any.BDSM关系) continue;
                        档案Any.BDSM关系.里程碑 = [
                            ...(档案Any.BDSM关系.里程碑 || []),
                            ...bdsmResult.里程碑!
                        ];
                    }
                }

                if (bdsmResult.日常指令 && bdsmResult.日常指令.length > 0) {
                    const 焦点NpcId = Object.keys(更新后档案).find(id =>
                        更新后档案[id]?.BDSM关系
                    );
                    if (焦点NpcId) {
                        更新后档案[焦点NpcId].BDSM关系.日常指令 = bdsmResult.日常指令;
                    }
                }

                return {
                    ...prev,
                    欲望系统: { ...欲望系统, NPC欲望档案: 更新后档案 },
                };
            });
        };
    };

    const 构建BDSM见面预约更新回调 = () => {
        return (更新: BDSM见面预约更新数据) => {
            设置校园系统(prev => {
                const 预约列表 = prev?.见面预约列表 || [];
                const 更新后列表 = 预约列表.map(预约 =>
                    预约.npcId === 更新.npcId
                        ? { ...预约, 状态: 更新.新状态 }
                        : 预约
                );
                return { ...prev, 见面预约列表: 更新后列表 };
            });
        };
    };

    // --- handleReportTaskComplete ---

    const 请求报告任务完成 = async (
        taskId: string,
        npcId: string,
        executionDescription: string
    ): Promise<{ evaluation: string; obedienceDelta: number }> => {
        const 档案 = 校园系统?.欲望系统?.NPC欲望档案?.[npcId];
        if (!档案?.BDSM关系?.任务历史) {
            return { evaluation: '[错误：未找到NPC欲望档案或任务历史]', obedienceDelta: 0 };
        }

        const 任务列表 = 档案.BDSM关系.任务历史;
        const 任务 = 任务列表.find((t: any) => t.id === taskId);
        if (!任务) return { evaluation: '[错误：未找到指定任务]', obedienceDelta: 0 };

        任务.状态 = '已完成';
        任务.完成时间 = new Date().toISOString();

        const 主剧情Api = 获取主剧情接口配置(apiConfig);
        if (!主剧情Api || !主剧情Api.apiKey) {
            return { evaluation: '[AI不可用，无法评价]', obedienceDelta: 0 };
        }

        try {
            const { 构建任务完成评价提示词 } = await import('../../prompts/runtime/bdsmTasks');
            const { 请求模型文本 } = await import('../../services/ai/chatCompletionClient');
            const 评价提示词 = 构建任务完成评价提示词({
                任务类型: 任务.类型,
                任务难度: 任务.难度,
                任务描述: 任务.描述,
                执行情况描述: executionDescription,
                当前服从度: 档案.BDSM关系.服从度,
                NPC性格特征: npcId,
            });

            const 评价结果文本 = await 请求模型文本(主剧情Api, [
                { role: 'system', content: '你是 BDSM 关系中的任务评价系统。' },
                { role: 'user', content: 评价提示词 },
            ], { temperature: 0.7 });

            let 评价: { grade?: string; obedienceChange?: number; feedback?: string } = {};
            try {
                const jsonMatch = 评价结果文本.match(/\{[\s\S]*\}/);
                if (jsonMatch) 评价 = JSON.parse(jsonMatch[0]);
            } catch {
                评价 = { grade: '良好', obedienceChange: 5, feedback: 评价结果文本.slice(0, 100) };
            }

            const 服从度变化 = 评价.obedienceChange ?? 0;

            const { 处理BDSM任务影响 } = await import('./campusNSFWEngine');
            const 评价等级 = (评价.grade || '良好') as '完美服从' | '优秀' | '良好' | '勉强' | '失败' | '拒绝';
            const 结果 = 处理BDSM任务影响({ NPC档案: 档案, 任务评价: 评价等级, 服从度变化 });

            任务.评价 = 评价等级;
            任务.服从度变化 = 服从度变化;

            设置校园系统(prev => {
                const 欲望系统 = (prev?.欲望系统 || {}) as any;
                const 新档案 = { ...(欲望系统.NPC欲望档案?.[npcId] || {}), ...结果.更新后档案 };
                return {
                    ...prev,
                    欲望系统: { ...欲望系统, NPC欲望档案: { ...欲望系统.NPC欲望档案, [npcId]: 新档案 } },
                };
            });

            return { evaluation: 评价.feedback || 评价结果文本.slice(0, 200), obedienceDelta: 服从度变化 };
        } catch (err) {
            console.warn('[BDSM任务评价] 失败:', err);
            return { evaluation: '[评价失败]', obedienceDelta: 0 };
        }
    };

    // --- handleStageAdvance ---

    const 请求阶段推进 = async (npcId: string): Promise<{ advanced: boolean; newStage?: string; reason?: string }> => {
        const 档案 = 校园系统?.欲望系统?.NPC欲望档案?.[npcId];
        if (!档案?.BDSM关系) return { advanced: false };

        const 旧阶段 = 档案.BDSM关系.阶段;
        const { 判定BDSM关系阶段推进 } = await import('./campusNSFWEngine');
        const 结果 = 判定BDSM关系阶段推进(档案);

        if (结果.推进 && 结果.新阶段) {
            设置校园系统(prev => {
                const 欲望系统 = (prev?.欲望系统 || {}) as any;
                const 原档案 = 欲望系统.NPC欲望档案?.[npcId];
                if (!原档案) return prev;
                const 更新后BDSM = {
                    ...原档案.BDSM关系,
                    阶段: 结果.新阶段,
                    里程碑: [
                        ...(原档案.BDSM关系?.里程碑 || []),
                        { 类型: '阶段推进', 时间: new Date().toISOString(), 描述: `关系从 "${旧阶段}" 推进至 "${结果.新阶段}"` },
                    ],
                };
                return {
                    ...prev,
                    欲望系统: { ...欲望系统, NPC欲望档案: { ...欲望系统.NPC欲望档案, [npcId]: { ...原档案, BDSM关系: 更新后BDSM } } },
                };
            });
            return { advanced: true, newStage: 结果.新阶段, reason: 结果.理由 };
        }

        return { advanced: false };
    };

    return {
        更新BDSM关系状态,
        添加BDSM任务,
        更新BDSM任务状态,
        更新契约状态,
        添加BDSM里程碑,
        设置日常指令,
        请求生成BDSM任务,
        请求生成BDSM日常指令,
        请求评价BDSM任务,
        请求生成BDSM契约,
        请求判定BDSM阶段推进,
        构建BDSM状态更新回调,
        构建BDSM见面预约更新回调,
        请求报告任务完成,
        请求阶段推进,
    };
}
