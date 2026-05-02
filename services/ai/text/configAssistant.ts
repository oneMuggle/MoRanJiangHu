/**
 * AI Config Assistant — LLM-driven API configuration parser.
 * Parses user-provided API text, fetches models, categorizes them,
 * and returns assignment recommendations.
 */

import { 通用消息, 请求模型文本 } from '../chatCompletionClient';
import type { 当前可用接口结构 } from '../../../utils/apiConfig';
import type { 接口供应商类型 } from '../../../models/system';
import { 推断供应商 } from '../../../utils/apiConfig';
import { autoAssignModels, type AssignmentRecommendation, type ConfigWithModels } from '../../../utils/modelCategorizer';

export { type ConfigWithModels, type AssignmentRecommendation };

const CONFIG_PARSER_SYSTEM_PROMPT = `你是一个 API 配置解析助手。用户会提供 API 端点信息，格式可能是：
- "api地址：https://example.com/v1 令牌：sk-abc123"
- "baseUrl: https://example.com/v1, apiKey: sk-abc123"
- JSON 格式
- 每行一个配置

你的任务是从用户输入中提取 baseUrl 和 apiKey，输出为 JSON 格式：
{"configs": [{"baseUrl": "https://example.com/v1", "apiKey": "sk-abc123"}]}

规则：
1. baseUrl 应该以 /v1 结尾，如果没有则添加
2. apiKey 保持原样
3. 如果用户提供 model 名称，也一并提取
4. 只输出 JSON，不要其他内容
5. 如果无法识别任何配置，返回 {"configs": []}`;

export interface ParsedConfig {
    baseUrl: string;
    apiKey: string;
    model?: string;
}

export interface AssistantMessage {
    role: 'user' | 'assistant' | 'error';
    content: string;
}

export interface AssistantState {
    messages: AssistantMessage[];
    configs: ConfigWithModels[];
    recommendation: AssignmentRecommendation | null;
    isProcessing: boolean;
}

function makeTempConfig(baseUrl: string, apiKey: string, model?: string): 当前可用接口结构 {
    return {
        id: 'temp-assistant-config',
        名称: '助手临时配置',
        供应商: 推断供应商(baseUrl),
        baseUrl: baseUrl.replace(/\/+$/, ''),
        apiKey,
        model: model || '',
        maxTokens: 4096,
        temperature: 0.1,
    };
}

export async function parseUserConfig(
    userInput: string,
    assistantBaseUrl: string,
    assistantApiKey: string,
    assistantModel?: string,
    signal?: AbortSignal,
    onStream?: (delta: string, accumulated: string) => void
): Promise<ParsedConfig[]> {
    const messages: 通用消息[] = [
        { role: 'system', content: CONFIG_PARSER_SYSTEM_PROMPT },
        { role: 'user', content: userInput },
    ];

    const tempConfig = makeTempConfig(assistantBaseUrl, assistantApiKey, assistantModel);

    try {
        const response = await 请求模型文本(tempConfig, messages, {
            temperature: 0.1,
            signal,
            responseFormat: 'json_object',
            streamOptions: onStream ? {
                stream: true,
                onDelta: onStream,
            } : undefined,
        });

        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || response.match(/(\{[\s\S]*\})/);
        const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
        const parsed = JSON.parse(jsonStr) as { configs: Array<{ baseUrl?: string; apiKey?: string; model?: string }> };

        return (parsed.configs || [])
            .filter((c) => c.baseUrl || c.apiKey)
            .map((c) => ({
                baseUrl: c.baseUrl?.replace(/\/+$/, '') || '',
                apiKey: c.apiKey || '',
                model: c.model,
            }));
    } catch {
        // Regex fallback — multi-config extraction
        const results: ParsedConfig[] = [];

        // Try to extract JSON configs first
        const jsonRegex = /\{[^{}]*"(?:url|baseUrl|base_url)"\s*:\s*"([^"]+)"[^{}]*"(?:key|apiKey|api_key|token)"\s*:\s*"([^"]+)"[^{}]*\}/gi;
        for (const m of userInput.matchAll(jsonRegex)) {
            results.push({ baseUrl: m[1].replace(/\/+$/, ''), apiKey: m[2] });
        }

        // Split by blank lines into blocks, extract per-block
        const blocks = userInput.split(/\n\s*\n/);
        for (const block of blocks) {
            const urlMatch = block.match(/(?:api地址|api|baseUrl|base_url|网址|url|地址)\s*[:：]\s*(https?:\/\/[^\s,，]+)/i);
            const keyMatch = block.match(/(?:令牌|apiKey|api_key|密钥|token|key)\s*[:：]\s*([a-zA-Z0-9_\-]{8,})/i);
            if (urlMatch || keyMatch) {
                const baseUrl = (urlMatch?.[1] || '').replace(/\/+$/, '');
                const apiKey = keyMatch?.[1] || '';
                if (baseUrl && apiKey) {
                    if (!results.some(r => r.baseUrl === baseUrl && r.apiKey === apiKey)) {
                        results.push({ baseUrl, apiKey });
                    }
                }
            }
        }

        return results;
    }
}

export async function testAndFetchModels(
    config: { baseUrl: string; apiKey: string }
): Promise<{ id: string; baseUrl: string; apiKey: string; provider: 接口供应商类型; models: string[] }> {
    const provider = 推断供应商(config.baseUrl);
    const base = config.baseUrl.replace(/\/+$/, '');
    const normalized = base.replace(/\/v1$/i, '');

    // Step 1: Try multiple candidate URLs for model list (same pattern as ApiSettings.tsx)
    const candidateUrls = Array.from(new Set([
        `${normalized}/v1/models`,
        `${normalized}/models`,
        `${base}/models`,
    ]));

    for (const url of candidateUrls) {
        try {
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${config.apiKey}` },
                signal: AbortSignal.timeout(8000),
            });
            if (!res.ok) continue;
            const data = await res.json();
            if (data && Array.isArray(data.data)) {
                const models = data.data.map((m: any) => m?.id).filter(Boolean);
                if (models.length > 0) {
                    return {
                        id: crypto.randomUUID(),
                        baseUrl: normalized + '/v1',
                        apiKey: config.apiKey,
                        provider,
                        models,
                    };
                }
            }
        } catch {
            // Try next candidate
        }
    }

    // Step 2: All model list candidates failed — use chat completion to verify connectivity
    // Same approach as testConnection in storyTasks.ts (sends actual LLM request)
    return await fallbackChatTest(normalized + '/v1', config.apiKey, provider);
}

async function fallbackChatTest(
    baseUrl: string,
    apiKey: string,
    provider: 接口供应商类型
): Promise<{ id: string; baseUrl: string; apiKey: string; provider: 接口供应商类型; models: string[] }> {
    // Try with common default model names first, then with a generic one
    const testModels = ['gpt-4o', 'gemini-pro', 'deepseek-chat', 'claude-sonnet-4-6', 'test'];
    let lastError = '';

    for (const model of testModels) {
        try {
            const apiConfig: 当前可用接口结构 = {
                id: 'temp-test',
                名称: '临时测试配置',
                供应商: provider,
                baseUrl,
                apiKey,
                model,
                maxTokens: 16,
                temperature: 0,
            };

            const messages: 通用消息[] = [
                { role: 'user', content: '请只回复 OK' },
            ];

            const result = await 请求模型文本(apiConfig, messages, {
                temperature: 0,
                errorDetailLimit: 200,
            });

            // Connection successful — extract actual model from response if possible
            const actualModel = result.includes('model') ? model : '模型未知';
            return {
                id: crypto.randomUUID(),
                baseUrl,
                apiKey,
                provider,
                models: [actualModel],
            };
        } catch (error) {
            const msg = error instanceof Error ? error.message : '';
            // If it's a model not found error, try next model
            if (msg.toLowerCase().includes('model') && (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('invalid'))) {
                lastError = msg;
                continue;
            }
            // For other errors (auth, network), this is likely a real failure
            lastError = msg;
            break;
        }
    }

    throw new Error(`连接测试失败 (${baseUrl}): ${lastError || '所有测试模型均失败'}`);
}

export async function processAssistantMessage(
    userInput: string,
    assistantBaseUrl: string,
    assistantApiKey: string,
    assistantModel: string | undefined,
    existingConfigs: ConfigWithModels[] = [],
    signal?: AbortSignal,
    onStream?: (delta: string, accumulated: string) => void
): Promise<{ configs: ConfigWithModels[]; recommendation: AssignmentRecommendation | null }> {
    const parsed = await parseUserConfig(userInput, assistantBaseUrl, assistantApiKey, assistantModel, signal, onStream);

    if (parsed.length === 0) {
        return {
            configs: existingConfigs,
            recommendation: null,
        };
    }

    const newConfigs: ConfigWithModels[] = [];
    const errors: string[] = [];

    for (const p of parsed) {
        try {
            const result = await testAndFetchModels(p);
            newConfigs.push(result);
            if (onStream) onStream('', `\n✅ 已连接 ${result.baseUrl} — ${result.models.length} 个模型`);
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            errors.push(`${p.baseUrl}: ${msg}`);
            if (onStream) onStream('', `\n❌ ${p.baseUrl} 失败：${msg}`);
        }
    }

    const allConfigs = [...existingConfigs, ...newConfigs];
    const recommendation = allConfigs.length > 0 ? autoAssignModels(allConfigs) : null;

    if (recommendation && onStream) {
        onStream('', '\n\n📋 推荐配置方案：\n');
        for (const area of recommendation.areas) {
            if (area.assignedModel) {
                onStream('', `- ${area.areaLabel}: ${area.assignedModel}\n`);
            }
        }
        onStream('', '\n点击"确认应用"以应用以上配置。');
    }

    return {
        configs: allConfigs,
        recommendation,
    };
}
