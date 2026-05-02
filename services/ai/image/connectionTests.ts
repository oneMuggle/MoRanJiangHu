import type { 当前可用接口结构 } from '../../../utils/apiConfig';
import type { 文生图后端类型 } from '../../../models/system';
import { 清理末尾斜杠, 构建图片端点, 构建生图请求头 } from './constants';
import { 解析可能是JSON字符串, 提取图片生成结果 } from './imageTokenizer';
import { 提取OpenAI完整文本 } from '../chatCompletionClient';

export interface 图片连接测试结果 {
    ok: boolean;
    detail: string;
    backendType: 文生图后端类型;
}

export const testImageConnection = async (
    apiConfig: 当前可用接口结构
): Promise<图片连接测试结果> => {
    const backendType: 文生图后端类型 = apiConfig.图片后端类型 || 'openai';
    const startedAt = Date.now();

    try {
        switch (backendType) {
            case 'sd_webui': {
                const result = await 测试SDWebUI连接(apiConfig, startedAt);
                return { ...result, backendType };
            }
            case 'comfyui': {
                const result = await 测试ComfyUI连接(apiConfig, startedAt);
                return { ...result, backendType };
            }
            case 'novelai': {
                const result = await 测试NovelAI连接(apiConfig, startedAt);
                return { ...result, backendType };
            }
            case 'openai':
            default: {
                const result = await 测试OpenAI兼容连接(apiConfig, startedAt);
                return { ...result, backendType };
            }
            case 'grok': {
                const result = await 测试Grok连接(apiConfig, startedAt);
                return { ...result, backendType };
            }
        }
    } catch (error: any) {
        const elapsed = Date.now() - startedAt;
        const message = error?.message || '未知错误';
        return {
            ok: false,
            backendType,
            detail: `耗时: ${elapsed}ms\n\n错误: ${message}`
        };
    }
};

const 测试SDWebUI连接 = async (
    apiConfig: 当前可用接口结构,
    startedAt: number
): Promise<{ ok: boolean; detail: string }> => {
    const baseUrl = (apiConfig.baseUrl || '').trim();
    if (!baseUrl) return { ok: false, detail: '缺少 Base URL' };

    const endpoint = `${清理末尾斜杠(baseUrl)}/sdapi/v1/cmd-flags`;
    const response = await fetch(endpoint, { method: 'GET' });

    if (!response.ok) {
        const elapsed = Date.now() - startedAt;
        const text = await response.text().catch(() => '');
        return {
            ok: false,
            detail: `耗时: ${elapsed}ms\nHTTP ${response.status}${text ? ` - ${text.slice(0, 300)}` : ''}`
        };
    }

    const elapsed = Date.now() - startedAt;
    const data = await response.json().catch(() => null);
    return {
        ok: true,
        detail: `耗时: ${elapsed}ms\n\n服务状态: 正常${data?.api_cmdline_flags ? '\n命令行参数: 可访问' : ''}`
    };
};

const 提取ComfyUI图片地址 = (
    historyPayload: unknown,
    baseUrlRaw: string
): string | null => {
    if (!historyPayload || typeof historyPayload !== 'object') return null;
    const root = Array.isArray(historyPayload)
        ? historyPayload[0]
        : Object.values(historyPayload as Record<string, unknown>)[0];
    const outputs = root && typeof root === 'object' ? (root as Record<string, unknown>).outputs : null;
    if (!outputs || typeof outputs !== 'object') return null;
    for (const nodeOutput of Object.values(outputs as Record<string, unknown>)) {
        const images = Array.isArray((nodeOutput as Record<string, unknown>)?.images) ? (nodeOutput as Record<string, unknown>).images : [];
        const first = (images as unknown[])[0];
        if (!first || typeof first !== 'object') continue;
        const obj = first as Record<string, unknown>;
        const filename = typeof obj.filename === 'string' ? obj.filename.trim() : '';
        if (!filename) continue;
        const subfolder = typeof obj.subfolder === 'string' ? obj.subfolder.trim() : '';
        const type = typeof obj.type === 'string' ? obj.type.trim() : 'output';
        const params = new URLSearchParams({ filename, subfolder, type });
        const cleanBaseUrl = 清理末尾斜杠(baseUrlRaw);
        return `${cleanBaseUrl}/view?${params.toString()}`;
    }
    return null;
};

const 测试ComfyUI连接 = async (
    apiConfig: 当前可用接口结构,
    startedAt: number
): Promise<{ ok: boolean; detail: string }> => {
    const baseUrl = (apiConfig.baseUrl || '').trim();
    if (!baseUrl) return { ok: false, detail: '缺少 Base URL' };

    const cleanBaseUrl = 清理末尾斜杠(baseUrl);
    const details: string[] = [];

    const systemStatsEndpoint = `${cleanBaseUrl}/system_stats`;
    const systemStatsResponse = await fetch(systemStatsEndpoint, { method: 'GET' });

    if (!systemStatsResponse.ok) {
        const elapsed = Date.now() - startedAt;
        const text = await systemStatsResponse.text().catch(() => '');
        return {
            ok: false,
            detail: `耗时: ${elapsed}ms\n服务状态: 不可达 (HTTP ${systemStatsResponse.status}${text ? ` - ${text.slice(0, 200)}` : ''})`
        };
    }

    const systemStatsData = await systemStatsResponse.json().catch(() => null);
    const systemInfo = systemStatsData?.system || {};
    const devicesInfo = systemStatsData?.devices || [];
    details.push(`服务状态: 正常`);
    if (systemInfo.os) details.push(`系统: ${systemInfo.os}`);
    if (devicesInfo.length > 0) {
        const gpu = devicesInfo[0];
        const gpuInfo = [gpu.name, gpu.vram ? `${(gpu.vram / 1024).toFixed(1)}GB VRAM` : '', gpu.type].filter(Boolean).join(' / ');
        details.push(`GPU: ${gpuInfo || '可用'}`);
    }

    const queueEndpoint = `${cleanBaseUrl}/queue`;
    const queueResponse = await fetch(queueEndpoint, { method: 'GET' });
    if (queueResponse.ok) {
        const queueData = await queueResponse.json().catch(() => null);
        details.push(`队列服务: 可用`);
        if (queueData?.queue_running?.length > 0) {
            details.push(`当前任务: ${queueData.queue_running.length} 个正在执行`);
        }
        if (queueData?.queue_pending?.length > 0) {
            details.push(`排队任务: ${queueData.queue_pending.length} 个等待中`);
        }
    }

    const workflowJson = apiConfig.ComfyUI工作流JSON;
    if (workflowJson && workflowJson.trim()) {
        try {
            const parsed = JSON.parse(workflowJson);
            const promptEndpoint = `${cleanBaseUrl}/prompt`;
            const promptResponse = await fetch(promptEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: parsed, client_id: 'wuxia-test' })
            });

            if (promptResponse.ok) {
                const promptData = await promptResponse.json().catch(() => null);
                const promptId = promptData?.prompt_id;
                if (promptId) {
                    details.push(`工作流提交: 成功 (prompt_id: ${promptId.slice(0, 8)}...)`);

                    const historyEndpoint = `${cleanBaseUrl}/history/${promptId}`;
                    let historyOk = false;
                    for (let i = 0; i < 15; i++) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        const historyResponse = await fetch(historyEndpoint, { method: 'GET' });
                        if (historyResponse.ok) {
                            const historyText = await historyResponse.text();
                            if (historyText && historyText !== '{}' && historyText.trim() !== 'null') {
                                const historyData = JSON.parse(historyText);
                                const imageUrl = 提取ComfyUI图片地址(historyData, baseUrl);
                                if (imageUrl) {
                                    details.push(`图片生成: 成功 (${imageUrl.slice(0, 80)}...)`);
                                    historyOk = true;
                                    break;
                                } else {
                                    details.push(`图片生成: 工作流完成但无图片输出`);
                                    historyOk = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (!historyOk) {
                        details.push(`图片生成: 超时(15s)，未收到结果`);
                    }
                } else {
                    details.push(`工作流提交: 未返回 prompt_id`);
                }
            } else {
                const errorText = await promptResponse.text().catch(() => '');
                details.push(`工作流提交: 失败 (HTTP ${promptResponse.status}${errorText ? ` - ${errorText.slice(0, 150)}` : ''})`);
            }
        } catch {
            details.push(`工作流提交: 跳过 (workflow JSON 解析失败)`);
        }
    } else {
        details.push(`工作流提交: 跳过 (未填写 ComfyUI 工作流 JSON)`);
    }

    const elapsed = Date.now() - startedAt;
    return {
        ok: true,
        detail: `耗时: ${elapsed}ms\n\n${details.join('\n')}`
    };
};

const 测试NovelAI连接 = async (
    apiConfig: 当前可用接口结构,
    startedAt: number
): Promise<{ ok: boolean; detail: string }> => {
    const apiKey = (apiConfig.apiKey || '').trim();
    if (!apiKey) return { ok: false, detail: '缺少 NovelAI Persistent API Token' };

    const endpoint = 'https://api.novelai.net/user/subscription';
    const response = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    if (!response.ok) {
        const elapsed = Date.now() - startedAt;
        const text = await response.text().catch(() => '');
        return {
            ok: false,
            detail: `耗时: ${elapsed}ms\nHTTP ${response.status}${text ? ` - ${text.slice(0, 300)}` : ''}`
        };
    }

    const elapsed = Date.now() - startedAt;
    const data = await response.json().catch(() => null);
    return {
        ok: true,
        detail: `耗时: ${elapsed}ms\n\n鉴权状态: 有效${data?.subscription?.tier ? `\n订阅等级: ${data.subscription.tier}` : ''}`
    };
};

const 测试OpenAI兼容连接 = async (
    apiConfig: 当前可用接口结构,
    startedAt: number
): Promise<{ ok: boolean; detail: string }> => {
    const apiKey = (apiConfig.apiKey || '').trim();
    const baseUrl = (apiConfig.baseUrl || '').trim();
    const model = (apiConfig.model || '').trim();

    if (!baseUrl) return { ok: false, detail: '缺少 Base URL' };
    if (!apiKey) return { ok: false, detail: '缺少 API Key' };
    if (!model) return { ok: false, detail: '缺少模型名称' };

    const endpoint = 构建图片端点(baseUrl, apiConfig.图片接口路径, apiConfig.图片接口路径模式);
    if (!endpoint) return { ok: false, detail: '无法构建有效的图片生成端点' };

    const isChatCompletions = /\/chat\/completions$/i.test(endpoint);
    const requestBody: Record<string, unknown> = isChatCompletions
        ? {
            model,
            stream: false,
            messages: [{ role: 'user', content: 'Draw a simple red dot on white background' }]
        }
        : {
            model,
            prompt: 'simple red dot',
            n: 1,
            size: '256x256'
        };

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: 构建生图请求头(apiConfig),
        body: JSON.stringify(requestBody)
    });

    const elapsed = Date.now() - startedAt;

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        return {
            ok: false,
            detail: `耗时: ${elapsed}ms\nHTTP ${response.status}${text ? ` - ${text.slice(0, 500)}` : ''}`
        };
    }

    const rawText = await response.text();
    const parsed = 解析可能是JSON字符串(rawText);
    const result = 提取图片生成结果(parsed);

    if (result) {
        return {
            ok: true,
            detail: `耗时: ${elapsed}ms\n\n图片生成: 成功${result.图片URL ? (result.图片URL.startsWith('data:') ? `\nBase64 长度: ${result.图片URL.length}` : `\n图片 URL: ${result.图片URL.slice(0, 100)}`) : result.本地路径 ? `\n本地路径: ${result.本地路径}` : ''}`
        };
    }

    const completionText = parsed ? 提取OpenAI完整文本(parsed) : '';
    const textToParse = completionText || rawText;
    const markdownUrlRegex = /!\[.*?\]\(([^)]+)\)/;
    const markdownMatch = textToParse.match(markdownUrlRegex);
    if (markdownMatch && markdownMatch[1]) {
        return {
            ok: true,
            detail: `耗时: ${elapsed}ms\n\n图片生成: 成功 (Markdown 格式)\n图片 URL: ${markdownMatch[1].trim().slice(0, 100)}`
        };
    }

    return {
        ok: false,
        detail: `耗时: ${elapsed}ms\n\n端点响应成功，但无法解析图片结果:\n${rawText.slice(0, 500)}`
    };
};

const 测试Grok连接 = async (
    apiConfig: 当前可用接口结构,
    startedAt: number
): Promise<{ ok: boolean; detail: string }> => {
    const baseUrl = apiConfig.baseUrl;
    const apiKey = apiConfig.apiKey;
    const model = apiConfig.model || 'grok-2-image';

    if (!baseUrl?.trim()) return { ok: false, detail: '错误: API 基础地址为空' };
    if (!apiKey?.trim()) return { ok: false, detail: '错误: API 密钥为空' };

    const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
    const testPrompt = 'A simple red circle on a white background, minimalist, clean';

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model,
            stream: false,
            messages: [{ role: 'user', content: testPrompt }]
        })
    });

    const elapsed = Date.now() - startedAt;

    if (!response.ok) {
        const detail = await response.text().catch(() => '');
        return {
            ok: false,
            detail: `耗时: ${elapsed}ms\n\nGrok API 请求失败 (${response.status}):\n${detail.slice(0, 500)}`
        };
    }

    const rawText = await response.text();
    const parsed = 解析可能是JSON字符串(rawText);

    if (parsed) {
        const obj = parsed as Record<string, unknown>;
        const choices = Array.isArray(obj?.choices) ? obj.choices : [];
        const content = choices.length > 0 && typeof (choices[0] as Record<string, unknown>)?.message === 'object'
            ? String(((choices[0] as Record<string, unknown>).message as Record<string, unknown>)?.content || '')
            : '';
        const markdownUrlRegex = /!\[.*?\]\(([^)]+)\)/;
        const markdownMatch = content.match(markdownUrlRegex);
        if (markdownMatch && markdownMatch[1]) {
            return {
                ok: true,
                detail: `耗时: ${elapsed}ms\n\nGrok 连接: 成功\n图片 URL: ${markdownMatch[1].trim().slice(0, 100)}`
            };
        }
    }

    return {
        ok: true,
        detail: `耗时: ${elapsed}ms\n\nGrok 连接: 成功\n注意: 测试提示词未返回可解析的图片 URL，请检查模型是否支持图片生成`
    };
};
