/** 变量生成进度系统 */

export type 变量生成上下文缓存项 = {
    回合: number;
    玩家输入: string;
    正文: string;
    本回合命令: string[];
    校准说明: string[];
    校准命令: string[];
};

export const 创建变量生成进度系统 = (deps: {
    最近变量生成上下文Ref: React.RefObject<变量生成上下文缓存项[]>;
    变量生成中: boolean;
    set变量生成中: (v: boolean) => void;
    开局变量生成进度: any;
    set开局变量生成进度: (v: any) => void;
    世界演变进行中Ref: React.RefObject<boolean>;
    variableGenerationAbortControllerRef: React.RefObject<AbortController | null>;
    深拷贝: <T,>(data: T) => T;
}) => {
    const 序列化变量校准命令 = (cmd: any): string => {
        const action = typeof cmd?.action === 'string' ? cmd.action : 'set';
        const key = typeof cmd?.key === 'string' ? cmd.key : '';
        if (action === 'delete') return `delete ${key}`;
        try {
            return `${action} ${key} = ${JSON.stringify(cmd?.value ?? null)}`;
        } catch {
            return `${action} ${key} = ${String(cmd?.value ?? null)}`;
        }
    };

    const 提取响应正文文本 = (response: any): string => {
        const logs = Array.isArray(response?.logs) ? response.logs : [];
        const lines = logs
            .map((log: any) => {
                const sender = typeof log?.sender === 'string' ? log.sender.trim() : '旁白';
                const text = typeof log?.text === 'string' ? log.text.trim() : '';
                return text ? `【${sender}】${text}` : '';
            })
            .filter(Boolean);
        return lines.join('\n');
    };

    const 清空变量生成上下文缓存 = () => {
        deps.最近变量生成上下文Ref.current = [];
    };

    const 记录变量生成上下文 = (params: { playerInput: string; response: any }) => {
        const response = params.response;
        if (!response || typeof response !== 'object') return;
        const 正文 = 提取响应正文文本(response);
        const 本回合命令 = Array.isArray(response?.tavern_commands)
            ? response.tavern_commands.map(序列化变量校准命令).filter(Boolean)
            : [];
        const 校准说明 = Array.isArray(response?.variable_calibration_report)
            ? response.variable_calibration_report.map((entry: any) => (typeof entry === 'string' ? entry.trim() : '')).filter(Boolean)
            : [];
        const 校准补充命令 = Array.isArray(response?.variable_calibration_commands)
            ? response.variable_calibration_commands.map(序列化变量校准命令).filter(Boolean)
            : [];
        const 校准命令 = [...校准补充命令].filter(Boolean);
        if (!(params.playerInput || '').trim() && !正文 && 本回合命令.length <= 0 && 校准说明.length <= 0 && 校准命令.length <= 0) {
            return;
        }
        const entry: 变量生成上下文缓存项 = {
            回合: deps.最近变量生成上下文Ref.current.length + 1,
            玩家输入: (params.playerInput || '').trim(),
            正文,
            本回合命令,
            校准说明,
            校准命令
        };
        deps.最近变量生成上下文Ref.current = [...deps.最近变量生成上下文Ref.current, entry].slice(-2);
    };

    const 收集最近变量生成上下文 = (history: any[], limit = 2) => {
        if (deps.最近变量生成上下文Ref.current.length > 0) {
            const safeLimit = Math.max(0, Math.min(3, limit));
            return deps.最近变量生成上下文Ref.current.slice(-safeLimit).map((item) => deps.深拷贝(item));
        }
        const safeLimit = Math.max(0, Math.min(3, limit));
        if (safeLimit <= 0 || !Array.isArray(history)) return [];
        let assistantTurn = 0;
        let latestUserInput = '';
        const records: 变量生成上下文缓存项[] = [];
        history.forEach((item) => {
            if (item?.role === 'user') {
                latestUserInput = typeof item?.content === 'string' ? item.content.trim() : '';
                return;
            }
            if (item?.role !== 'assistant' || !item?.structuredResponse) return;
            assistantTurn += 1;
            const resp = item.structuredResponse;
            const 校准说明 = Array.isArray(resp?.variable_calibration_report)
                ? resp.variable_calibration_report.map((entry: any) => (typeof entry === 'string' ? entry.trim() : '')).filter(Boolean)
                : [];
            const 校准补充命令 = Array.isArray(resp?.variable_calibration_commands)
                ? resp.variable_calibration_commands.map(序列化变量校准命令).filter(Boolean)
                : [];
            const 校准命令 = [...校准补充命令].filter(Boolean);
            const 本回合命令 = Array.isArray(resp?.tavern_commands)
                ? resp.tavern_commands.map(序列化变量校准命令).filter(Boolean)
                : [];
            const 正文 = 提取响应正文文本(resp);
            if (!latestUserInput && !正文 && 本回合命令.length <= 0 && 校准说明.length <= 0 && 校准命令.length <= 0) return;
            records.push({
                回合: assistantTurn,
                玩家输入: latestUserInput,
                正文,
                本回合命令,
                校准说明,
                校准命令
            });
        });
        return records.slice(-safeLimit);
    };

    const 等待世界演变空闲 = async (signal?: AbortSignal, timeoutMs = 20000): Promise<void> => {
        const startedAt = Date.now();
        while (deps.世界演变进行中Ref.current) {
            if (signal?.aborted) {
                throw new DOMException('变量生成已取消', 'AbortError');
            }
            if (Date.now() - startedAt >= timeoutMs) {
                break;
            }
            await new Promise<void>((resolve) => {
                window.setTimeout(resolve, 80);
            });
        }
    };

    const handleCancelVariableGeneration = () => {
        if (deps.variableGenerationAbortControllerRef.current) {
            deps.variableGenerationAbortControllerRef.current.abort();
        }
    };

    return {
        序列化变量校准命令,
        清空变量生成上下文缓存,
        记录变量生成上下文,
        收集最近变量生成上下文,
        等待世界演变空闲,
        handleCancelVariableGeneration
    };
};
