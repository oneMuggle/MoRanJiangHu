import { unzipSync } from 'fflate';
import type { 当前可用接口结构 } from '../../../utils/apiConfig';
import type { PNG解析参数结构 } from '../../../models/system';
import type { 图片生成结果 } from './imageTasksTypes';
import { 清理末尾斜杠, 合并负面提示词片段, 自动去水印负面提示词, 默认NovelAI负面提示词, 构建图片端点, 构建生图请求头 } from './constants';
import { 解析可能是JSON字符串, 提取图片生成结果 } from './imageTokenizer';
import { 提取OpenAI完整文本, 读取失败详情文本, 协议请求错误 } from '../chatCompletionClient';
import { blob转DataUrl, uint8数组转DataUrl, 推断图片Mime类型 } from './persistence';

// ==================== Negative Prompt Helpers ====================

const 为不支持独立负面字段的模型附加负面提示词 = (prompt: string, negativePrompt?: string): string => {
    const basePrompt = (prompt || '').trim();
    const negative = 合并负面提示词片段(negativePrompt, 自动去水印负面提示词);
    if (!negative) return basePrompt;
    if (!basePrompt) return `Negative prompt: ${negative}`;
    if (/negative\s*prompt\s*:/i.test(basePrompt) || /--negative\b/i.test(basePrompt)) return basePrompt;
    return `${basePrompt}\nNegative prompt: ${negative}`;
};

// ==================== ComfyUI Helpers ====================

const 获取ComfyUI基础地址 = (baseUrlRaw: string): string => {
    return 清理末尾斜杠(baseUrlRaw || '');
};

const 解析ComfyUI工作流 = (workflowText: string): Record<string, unknown> => {
    const trimmed = (workflowText || '').trim();
    if (!trimmed) {
        throw new Error('ComfyUI 缺少 workflow JSON，请先在文生图设置中填写');
    }
    let parsed: unknown;
    try {
        parsed = JSON.parse(trimmed);
    } catch (error: any) {
        throw new Error(`ComfyUI workflow JSON 解析失败：${error?.message || '格式错误'}`);
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('ComfyUI workflow JSON 必须是对象');
    }
    return parsed as Record<string, unknown>;
};

const 注入ComfyUI工作流占位符 = (
    value: unknown,
    replacements: Record<string, string | number>
): unknown => {
    if (typeof value === 'string') {
        const exactToken = Object.entries(replacements).find(([token]) => value === token);
        if (exactToken) {
            return exactToken[1];
        }
        return Object.entries(replacements).reduce((text, [token, replacement]) => {
            return text.split(token).join(String(replacement));
        }, value);
    }
    if (Array.isArray(value)) {
        return value.map((item) => 注入ComfyUI工作流占位符(item, replacements));
    }
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>).map(([key, child]) => [key, 注入ComfyUI工作流占位符(child, replacements)])
        );
    }
    return value;
};

const 构建ComfyUI工作流 = (
    workflowText: string,
    prompt: string,
    negativePrompt: string,
    width: number,
    height: number,
    pngParams?: PNG解析参数结构
): Record<string, unknown> => {
    const hasNegativePlaceholder = /(__NEGATIVE_PROMPT__|\{\{negative_prompt\}\})/.test(workflowText || '');
    const promptValue = hasNegativePlaceholder
        ? prompt
        : 为不支持独立负面字段的模型附加负面提示词(prompt, negativePrompt);
    const replacements: Record<string, string | number> = {
        '__PROMPT__': promptValue,
        '{{prompt}}': promptValue,
        '__NEGATIVE_PROMPT__': negativePrompt,
        '{{negative_prompt}}': negativePrompt,
        '__WIDTH__': width,
        '{{width}}': width,
        '__HEIGHT__': height,
        '{{height}}': height,
        '__SIZE__': `${width}x${height}`,
        '{{size}}': `${width}x${height}`,
        '__STEPS__': Math.max(1, Math.floor(Number(pngParams?.步数) || 28)),
        '{{steps}}': Math.max(1, Math.floor(Number(pngParams?.步数) || 28)),
        '__CFG__': Number.isFinite(Number(pngParams?.CFG强度)) ? Number(pngParams?.CFG强度) : 7,
        '{{cfg}}': Number.isFinite(Number(pngParams?.CFG强度)) ? Number(pngParams?.CFG强度) : 7,
        '__CFG_RESCALE__': Number.isFinite(Number(pngParams?.CFG重缩放)) ? Number(pngParams?.CFG重缩放) : 0,
        '{{cfg_rescale}}': Number.isFinite(Number(pngParams?.CFG重缩放)) ? Number(pngParams?.CFG重缩放) : 0,
        '__SAMPLER__': (pngParams?.采样器 || '').trim() || 'euler',
        '{{sampler}}': (pngParams?.采样器 || '').trim() || 'euler',
        '__SCHEDULER__': (pngParams?.噪声计划 || '').trim() || 'normal',
        '{{scheduler}}': (pngParams?.噪声计划 || '').trim() || 'normal',
        '__SEED__': Number.isFinite(Number(pngParams?.随机种子)) ? Math.max(0, Math.floor(Number(pngParams?.随机种子))) : 0,
        '{{seed}}': Number.isFinite(Number(pngParams?.随机种子)) ? Math.max(0, Math.floor(Number(pngParams?.随机种子))) : 0,
        '__SMEA__': pngParams?.SMEA === true ? 'true' : 'false',
        '{{smea}}': pngParams?.SMEA === true ? 'true' : 'false',
        '__SMEA_DYN__': pngParams?.SMEA动态 === true ? 'true' : 'false',
        '{{smea_dyn}}': pngParams?.SMEA动态 === true ? 'true' : 'false'
    };
    const parsed = 解析ComfyUI工作流(workflowText);
    return 注入ComfyUI工作流占位符(parsed, replacements) as Record<string, unknown>;
};

const 提取ComfyUI图片地址 = (
    historyPayload: any,
    baseUrlRaw: string
): string | null => {
    if (!historyPayload || typeof historyPayload !== 'object') return null;
    const root = Array.isArray(historyPayload)
        ? historyPayload[0]
        : Object.values(historyPayload as Record<string, unknown>)[0];
    const outputs = root && typeof root === 'object' ? (root as any).outputs : null;
    if (!outputs || typeof outputs !== 'object') return null;
    for (const nodeOutput of Object.values(outputs as Record<string, unknown>)) {
        const images = Array.isArray((nodeOutput as any)?.images) ? (nodeOutput as any).images : [];
        const first = images[0];
        if (!first || typeof first !== 'object') continue;
        const filename = typeof first.filename === 'string' ? first.filename.trim() : '';
        if (!filename) continue;
        const subfolder = typeof first.subfolder === 'string' ? first.subfolder.trim() : '';
        const type = typeof first.type === 'string' ? first.type.trim() : 'output';
        const params = new URLSearchParams({ filename, subfolder, type });
        return `${获取ComfyUI基础地址(baseUrlRaw)}/view?${params.toString()}`;
    }
    return null;
};

const 等待 = async (ms: number, signal?: AbortSignal): Promise<void> => {
    if (!signal) {
        await new Promise((resolve) => setTimeout(resolve, ms));
        return;
    }
    await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
            signal.removeEventListener('abort', onAbort);
            resolve();
        }, ms);
        const onAbort = () => {
            clearTimeout(timer);
            signal.removeEventListener('abort', onAbort);
            reject(new DOMException('Aborted', 'AbortError'));
        };
        if (signal.aborted) {
            onAbort();
            return;
        }
        signal.addEventListener('abort', onAbort);
    });
};

// ==================== SD WebUI Sampler Normalization ====================

const 规范化SD采样器与调度器 = (pngParams?: PNG解析参数结构): { samplerName: string; scheduler?: string } => {
    const rawSampler = (pngParams?.采样器 || '').trim();
    const rawScheduler = (pngParams?.噪声计划 || '').trim().toLowerCase();

    const samplerMap: Record<string, string> = {
        'k_euler': 'Euler',
        'k_euler_ancestral': 'Euler a',
        'k_dpmpp_2m': 'DPM++ 2M',
        'k_dpmpp_2s_ancestral': 'DPM++ 2S a',
        'k_dpmpp_sde': 'DPM++ SDE',
        'k_dpmpp_2m_sde': 'DPM++ 2M SDE'
    };
    const schedulerMap: Record<string, string> = {
        'karras': 'Karras',
        'exponential': 'Exponential',
        'polyexponential': 'Polyexponential',
        'sgm_uniform': 'SGM Uniform',
        'simple': 'Simple',
        'normal': 'Normal'
    };

    let samplerName = rawSampler;
    let scheduler = rawScheduler;

    const parenMatch = rawSampler.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
    if (parenMatch) {
        samplerName = (parenMatch[1] || '').trim();
        scheduler = ((parenMatch[2] || '').trim() || scheduler).toLowerCase();
    }

    const lowerSampler = samplerName.toLowerCase();
    if (lowerSampler.endsWith(' karras')) {
        samplerName = samplerName.slice(0, -7).trim();
        scheduler = scheduler || 'karras';
    } else if (lowerSampler.endsWith(' exponential')) {
        samplerName = samplerName.slice(0, -12).trim();
        scheduler = scheduler || 'exponential';
    }

    samplerName = samplerMap[samplerName] || samplerName || 'DPM++ 2M';
    const normalizedScheduler = schedulerMap[scheduler] || '';

    return {
        samplerName,
        scheduler: normalizedScheduler || undefined
    };
};

// ==================== NovelAI V4 Prompt Splitting ====================

const 拆分NAIV4提示结构 = (prompt: string): { useCoords?: boolean; useOrder?: boolean; legacyUc?: boolean } | undefined => {
    if (!prompt) return undefined;
    const hasCoords = /__coord:|__REGION__|::coord::/i.test(prompt);
    const hasOrder = /__order:|::order::/i.test(prompt);
    const hasLegacyUc = /__UC__|::uc::/i.test(prompt);
    if (!hasCoords && !hasOrder && !hasLegacyUc) return undefined;
    return {
        useCoords: hasCoords,
        useOrder: hasOrder,
        legacyUc: hasLegacyUc
    };
};

// ==================== NovelAI Request Body Builder ====================

const 构建NovelAI请求体 = (
    prompt: string,
    apiConfig: 当前可用接口结构,
    size: string,
    extraNegativePrompt?: string,
    options?: { 跳过基础负面提示词?: boolean; PNG参数?: PNG解析参数结构 }
): Record<string, unknown> => {
    const model = (apiConfig.model || '').trim();
    if (!model) {
        throw new Error('NovelAI 缺少模型名称，请先填写例如 nai-diffusion-4-5-full');
    }
    const [width, height] = size.split('x').map((value) => Number(value));
    const useCustomParams = apiConfig.NovelAI启用自定义参数 === true;
    const pngSampler = options?.PNG参数?.采样器;
    const pngSteps = options?.PNG参数?.步数;
    const pngScale = options?.PNG参数?.CFG强度;
    const pngNoiseSchedule = (options?.PNG参数?.噪声计划 || '').trim();
    const pngCfgRescale = options?.PNG参数?.CFG重缩放;
    const pngSeed = options?.PNG参数?.随机种子;
    const pngSmea = options?.PNG参数?.SMEA;
    const pngSmeaDyn = options?.PNG参数?.SMEA动态;
    const pngV4Prompt = options?.PNG参数?.V4正向提示;
    const pngV4NegativePrompt = options?.PNG参数?.V4负向提示;
    const pngDynamicThresholding = options?.PNG参数?.动态阈值;
    const pngDynamicThresholdingPercentile = options?.PNG参数?.动态阈值百分位;
    const pngDynamicThresholdingMimic = options?.PNG参数?.动态阈值模拟CFG;
    const pngSkipCfgAboveSigma = options?.PNG参数?.高Sigma跳过CFG;
    const pngSkipCfgBelowSigma = options?.PNG参数?.低Sigma跳过CFG;
    const pngPreferBrownian = options?.PNG参数?.偏好布朗噪声;
    const pngEulerBugCompat = options?.PNG参数?.Euler祖先采样Bug兼容;
    const pngExplikeFineDetail = options?.PNG参数?.精细细节增强;
    const pngMinimizeSigmaInf = options?.PNG参数?.最小化Sigma无穷;
    const sampler = pngSampler || (useCustomParams ? (apiConfig.NovelAI采样器 || 'k_euler_ancestral') : 'k_euler_ancestral');
    const noiseSchedule = pngNoiseSchedule || (useCustomParams ? (apiConfig.NovelAI噪点表 || 'karras') : 'karras');
    const steps = Number.isFinite(pngSteps)
        ? Math.max(1, Math.min(50, Number(pngSteps)))
        : (useCustomParams ? Math.max(1, Math.min(50, Number(apiConfig.NovelAI步数) || 28)) : 28);
    const baseNegativePrompt = useCustomParams
        ? ((apiConfig.NovelAI负面提示词 || '').trim() || 默认NovelAI负面提示词)
        : 默认NovelAI负面提示词;
    const negativePrompt = options?.跳过基础负面提示词 ? '' : baseNegativePrompt;
    const mergedNegativePrompt = 合并负面提示词片段(negativePrompt, extraNegativePrompt, 自动去水印负面提示词);
    const finalNegativePrompt = options?.跳过基础负面提示词
        ? (mergedNegativePrompt || '')
        : (mergedNegativePrompt || negativePrompt || baseNegativePrompt);
    const isNovelAIV4Model = /^nai-diffusion-4(?:-|$)/i.test(model);
    const parameters: Record<string, unknown> = {
        params_version: 3,
        width: Number.isFinite(width) ? width : 1024,
        height: Number.isFinite(height) ? height : 1024,
        scale: Number.isFinite(Number(pngScale)) ? Number(pngScale) : 5,
        sampler,
        steps,
        n_samples: 1,
        ucPreset: 0,
        qualityToggle: true,
        sm: pngSmea === true,
        sm_dyn: pngSmeaDyn === true,
        dynamic_thresholding: pngDynamicThresholding === true,
        controlnet_strength: 1,
        legacy: false,
        add_original_image: false,
        legacy_v3_extend: false,
        prompt,
        noise_schedule: noiseSchedule
    };
    if (!isNovelAIV4Model && finalNegativePrompt) {
        parameters.negative_prompt = finalNegativePrompt;
    }
    if (Number.isFinite(Number(pngCfgRescale))) {
        parameters.cfg_rescale = Number(pngCfgRescale);
    }
    if (Number.isFinite(Number(pngSeed))) {
        parameters.seed = Math.max(0, Math.floor(Number(pngSeed)));
    }
    if (Number.isFinite(Number(pngDynamicThresholdingPercentile))) {
        parameters.dynamic_thresholding_percentile = Number(pngDynamicThresholdingPercentile);
    }
    if (Number.isFinite(Number(pngDynamicThresholdingMimic))) {
        parameters.dynamic_thresholding_mimic_scale = Number(pngDynamicThresholdingMimic);
    }
    if (Number.isFinite(Number(pngSkipCfgAboveSigma))) {
        parameters.skip_cfg_above_sigma = Number(pngSkipCfgAboveSigma);
    }
    if (Number.isFinite(Number(pngSkipCfgBelowSigma))) {
        parameters.skip_cfg_below_sigma = Number(pngSkipCfgBelowSigma);
    }
    if (pngPreferBrownian !== undefined) {
        parameters.prefer_brownian = pngPreferBrownian === true;
    }
    if (pngEulerBugCompat !== undefined) {
        parameters.deliberate_euler_ancestral_bug = pngEulerBugCompat === true;
    }
    if (pngExplikeFineDetail !== undefined) {
        parameters.explike_fine_detail = pngExplikeFineDetail === true;
    }
    if (pngMinimizeSigmaInf !== undefined) {
        parameters.minimize_sigma_inf = pngMinimizeSigmaInf === true;
    }

    if (isNovelAIV4Model) {
        parameters.v4_prompt = {
            use_coords: pngV4Prompt?.useCoords === true,
            use_order: pngV4Prompt?.useOrder === true,
            caption: {
                base_caption: prompt,
                char_captions: []
            },
            legacy_uc: pngV4Prompt?.legacyUc === true
        };
        parameters.v4_negative_prompt = {
            use_coords: pngV4NegativePrompt?.useCoords === true,
            use_order: pngV4NegativePrompt?.useOrder === true,
            caption: {
                base_caption: finalNegativePrompt,
                char_captions: []
            },
            legacy_uc: pngV4NegativePrompt?.legacyUc === true
        };
    }

    if (sampler === 'k_euler_ancestral' && pngEulerBugCompat === undefined && pngPreferBrownian === undefined) {
        parameters.deliberate_euler_ancestral_bug = false;
        parameters.prefer_brownian = true;
    }

    return {
        input: prompt,
        model,
        action: 'generate',
        parameters
    };
};

// ==================== NovelAI Response Parser ====================

const 解析NovelAI图片响应 = async (response: Response): Promise<图片生成结果> => {
    const blob = await response.blob();
    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    if (contentType.startsWith('image/')) {
        return {
            图片URL: await blob转DataUrl(blob)
        };
    }

    const buffer = new Uint8Array(await blob.arrayBuffer());
    try {
        const files = unzipSync(buffer);
        const imageEntry = Object.entries(files).find(([name]) => /\.(png|jpe?g|webp|gif)$/i.test(name));
        if (!imageEntry) {
            throw new Error('压缩包中未找到图片文件');
        }
        const [fileName, imageBytes] = imageEntry;
        return {
            图片URL: uint8数组转DataUrl(imageBytes, 推断图片Mime类型(fileName))
        };
    } catch {
        const detail = await blob.text().catch(() => '');
        throw new Error(`NovelAI 图片响应无法解析${detail ? `: ${detail.slice(0, 200)}` : ''}`);
    }
};

// ==================== Backend Execution Functions ====================

const 执行ComfyUI生图 = async (
    prompt: string,
    apiConfig: 当前可用接口结构,
    responseFormat: 'url' | 'b64_json',
    size: string,
    negativePrompt: string,
    signal?: AbortSignal,
    pngParams?: PNG解析参数结构
): Promise<图片生成结果> => {
    const baseUrl = 获取ComfyUI基础地址(apiConfig.baseUrl);
    if (!baseUrl) throw new Error('ComfyUI 缺少 API 地址');
    const [width, height] = size.split('x').map((value) => Number(value));
    const workflow = 构建ComfyUI工作流(apiConfig.ComfyUI工作流JSON || '', prompt, negativePrompt, width, height, pngParams);
    const promptEndpoint = 构建图片端点(apiConfig.baseUrl, apiConfig.图片接口路径, apiConfig.图片接口路径模式);
    const enqueueResponse = await fetch(promptEndpoint, {
        method: 'POST',
        headers: 构建生图请求头(apiConfig),
        body: JSON.stringify({
            prompt: workflow,
            client_id: 'wuxia-web'
        }),
        signal
    });
    if (!enqueueResponse.ok) {
        const detail = await 读取失败详情文本(enqueueResponse, Number.POSITIVE_INFINITY);
        throw new 协议请求错误(`ComfyUI 请求失败: ${enqueueResponse.status}${detail ? ` - ${detail}` : ''}`, enqueueResponse.status, detail);
    }
    const enqueuePayload = 解析可能是JSON字符串(await enqueueResponse.text()) as Record<string, unknown> | null;
    const promptId = typeof enqueuePayload?.prompt_id === 'string' ? enqueuePayload.prompt_id.trim() : '';
    if (!promptId) {
        throw new Error('ComfyUI 未返回 prompt_id，无法轮询结果');
    }

    const historyEndpoint = `${baseUrl}/history/${encodeURIComponent(promptId)}`;
    while (true) {
        const historyResponse = await fetch(historyEndpoint, {
            method: 'GET',
            headers: 构建生图请求头(apiConfig),
            signal
        });
        if (historyResponse.ok) {
            const historyText = await historyResponse.text();
            const historyPayload = 解析可能是JSON字符串(historyText);
            const imageUrl = 提取ComfyUI图片地址(historyPayload, baseUrl);
            if (imageUrl) {
                if (responseFormat === 'b64_json') {
                    const imageResponse = await fetch(imageUrl, { signal });
                    if (!imageResponse.ok) {
                        throw new Error(`ComfyUI 图片下载失败: ${imageResponse.status}`);
                    }
                    return {
                        图片URL: await blob转DataUrl(await imageResponse.blob()),
                        原始响应: historyText
                    };
                }
                return {
                    图片URL: imageUrl,
                    原始响应: historyText
                };
            }
        }
        await 等待(1000, signal);
    }
};

const 执行NovelAI生图 = async (
    prompt: string,
    apiConfig: 当前可用接口结构,
    size: string,
    negativePrompt?: string,
    signal?: AbortSignal,
    options?: { 跳过基础负面提示词?: boolean; PNG参数?: PNG解析参数结构 }
): Promise<图片生成结果> => {
    const endpoint = 构建图片端点(apiConfig.baseUrl, apiConfig.图片接口路径, apiConfig.图片接口路径模式);
    if (!endpoint) throw new Error('NovelAI 缺少有效的端点地址');
    const requestBody = 构建NovelAI请求体(prompt, apiConfig, size, negativePrompt, options);
    let response: Response;
    try {
        response = await fetch(endpoint, {
            method: 'POST',
            headers: 构建生图请求头(apiConfig),
            body: JSON.stringify(requestBody),
            signal
        });
    } catch (error: any) {
        throw new Error(`NovelAI 请求失败：${error?.message || '网络异常'}。如果你在本地开发环境，请确认仍在通过 Vite dev server 访问，并使用 https://image.novelai.net 作为基础地址。`);
    }
    if (!response.ok) {
        const detail = await 读取失败详情文本(response, Number.POSITIVE_INFINITY);
        if (response.status >= 500 && !detail) {
            throw new 协议请求错误('图片生成请求失败: 500 - NovelAI 代理握手失败，请重启 Vite 开发服务器后重试。', response.status, detail);
        }
        throw new 协议请求错误(`图片生成请求失败: ${response.status}${detail ? ` - ${detail}` : ''}`, response.status, detail);
    }
    return 解析NovelAI图片响应(response);
};

const 执行OpenAI协议生图 = async (
    prompt: string,
    apiConfig: 当前可用接口结构,
    signal?: AbortSignal,
    options?: { 附加负面提示词?: string; 带内联负面提示词?: string; 跳过基础负面提示词?: boolean }
): Promise<图片生成结果> => {
    const endpoint = 构建图片端点(apiConfig.baseUrl, apiConfig.图片接口路径, apiConfig.图片接口路径模式);
    if (!endpoint) throw new Error('Missing API Base URL');
    const isChatCompletionsEndpoint = /\/chat\/completions$/i.test(endpoint);
    const shouldUseCustomOpenAIPayload = apiConfig.图片走OpenAI自定义格式 === true;
    const responseFormat = apiConfig.图片响应格式 === 'b64_json' ? 'b64_json' : 'url';
    const inlinePrompt = options?.带内联负面提示词 || prompt;

    const requestBody: Record<string, unknown> = isChatCompletionsEndpoint
        ? {
            model: apiConfig.model,
            stream: false,
            messages: [{ role: 'user', content: inlinePrompt }]
        }
        : {
            model: apiConfig.model,
            prompt,
            n: 1,
            size: (options as any)?.size || '1024x1024'
        };

    if (shouldUseCustomOpenAIPayload || responseFormat === 'b64_json') {
        requestBody.response_format = responseFormat === 'b64_json'
            ? { type: 'b64_json' }
            : { type: 'url' };
    }

    let response: Response;
    try {
        response = await fetch(endpoint, {
            method: 'POST',
            headers: 构建生图请求头(apiConfig),
            body: JSON.stringify(requestBody),
            signal
        });
    } catch (error: any) {
        throw error;
    }

    if (!response.ok) {
        const detail = await 读取失败详情文本(response, Number.POSITIVE_INFINITY);
        throw new 协议请求错误(`图片生成请求失败: ${response.status}${detail ? ` - ${detail}` : ''}`, response.status, detail);
    }

    const rawText = await response.text();
    const parsed = 解析可能是JSON字符串(rawText);
    const result = 提取图片生成结果(parsed);

    if (result) {
        return {
            ...result,
            原始响应: rawText
        };
    }

    const completionText = parsed ? 提取OpenAI完整文本(parsed) : '';
    const textToParse = completionText || rawText;
    const markdownUrlRegex = /!\[.*?\]\(([^)]+)\)/;
    const markdownMatch = textToParse.match(markdownUrlRegex);
    if (markdownMatch && markdownMatch[1]) {
        return {
            图片URL: markdownMatch[1].trim(),
            原始响应: rawText
        };
    }

    throw new Error(`图片生成响应无法解析: ${rawText.slice(0, 500)}`);
};

const 执行SDWebUI生图 = async (
    prompt: string,
    apiConfig: 当前可用接口结构,
    size: string,
    negativePrompt: string,
    signal?: AbortSignal,
    pngParams?: PNG解析参数结构
): Promise<图片生成结果> => {
    const endpoint = 构建图片端点(apiConfig.baseUrl, apiConfig.图片接口路径, apiConfig.图片接口路径模式);
    if (!endpoint) throw new Error('SD WebUI 缺少有效的端点地址');
    const [width, height] = size.split('x').map((value) => Number(value));
    const sdSampler = 规范化SD采样器与调度器(pngParams);
    const requestBody: Record<string, unknown> = {
        prompt,
        negative_prompt: negativePrompt || undefined,
        width,
        height,
        steps: Number.isFinite(Number(pngParams?.步数)) ? Math.max(1, Math.floor(Number(pngParams?.步数))) : 28,
        cfg_scale: Number.isFinite(Number(pngParams?.CFG强度)) ? Number(pngParams?.CFG强度) : 7,
        sampler_name: sdSampler.samplerName,
        scheduler: sdSampler.scheduler,
        batch_size: 1,
        n_iter: 1
    };

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: 构建生图请求头(apiConfig),
        body: JSON.stringify(requestBody),
        signal
    });

    if (!response.ok) {
        const detail = await 读取失败详情文本(response, Number.POSITIVE_INFINITY);
        throw new 协议请求错误(`SD WebUI 请求失败: ${response.status}${detail ? ` - ${detail}` : ''}`, response.status, detail);
    }

    const rawText = await response.text();
    const parsed = 解析可能是JSON字符串(rawText);
    const result = 提取图片生成结果(parsed);
    if (!result) {
        throw new Error(`SD WebUI 响应无法解析: ${rawText.slice(0, 500)}`);
    }
    return {
        ...result,
        原始响应: rawText
    };
};

const 执行Grok生图 = async (
    prompt: string,
    apiConfig: 当前可用接口结构,
    signal?: AbortSignal
): Promise<图片生成结果> => {
    const endpoint = `${(apiConfig.baseUrl || '').replace(/\/+$/, '')}/chat/completions`;
    const model = apiConfig.model || 'grok-2-image';
    const requestBody = {
        model,
        stream: false,
        messages: [{ role: 'user', content: prompt }]
    };

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: 构建生图请求头(apiConfig),
        body: JSON.stringify(requestBody),
        signal
    });

    if (!response.ok) {
        const detail = await 读取失败详情文本(response, Number.POSITIVE_INFINITY);
        throw new 协议请求错误(`Grok 请求失败: ${response.status}${detail ? ` - ${detail}` : ''}`, response.status, detail);
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
                图片URL: markdownMatch[1].trim(),
                原始响应: rawText
            };
        }
    }

    throw new Error(`Grok 响应无法解析到图片 URL: ${rawText.slice(0, 500)}`);
};

// ==================== Main Dispatcher ====================

export const generateImageByPrompt = async (
    prompt: string,
    apiConfig: 当前可用接口结构,
    signal?: AbortSignal,
    options?: { 构图?: '头像' | '半身' | '立绘' | '场景' | '部位特写'; 场景类型?: '场景快照' | '风景场景'; 附加正向提示词?: string; 附加负面提示词?: string; 尺寸?: string; 跳过基础负面提示词?: boolean; PNG参数?: PNG解析参数结构 }
): Promise<图片生成结果> => {
    const endpoint = 构建图片端点(apiConfig.baseUrl, apiConfig.图片接口路径, apiConfig.图片接口路径模式);
    if (!endpoint) throw new Error('Missing API Base URL');

    // For now, the prompt bundle assembly happens in promptBuilder.ts
    // This function expects a ready-to-use prompt
    const normalizedPrompt = (prompt || '').trim();
    if (!normalizedPrompt) throw new Error('Missing image prompt');

    const responseFormat = apiConfig.图片响应格式 === 'b64_json' ? 'b64_json' : 'url';
    const backendType = apiConfig.图片后端类型 || 'openai';
    const negativePromptText = (options?.附加负面提示词 || '').trim();
    const size = options?.尺寸 || '1024x1024';

    if (backendType === 'novelai' && !(apiConfig.apiKey || '').trim()) {
        throw new Error('NovelAI 缺少 Persistent API Token，请先在文生图设置中填写');
    }

    if (backendType === 'comfyui') {
        return await 执行ComfyUI生图(normalizedPrompt, apiConfig, responseFormat, size, negativePromptText, signal, options?.PNG参数);
    }

    if (backendType === 'novelai') {
        return await 执行NovelAI生图(normalizedPrompt, apiConfig, size, negativePromptText, signal, {
            跳过基础负面提示词: options?.跳过基础负面提示词,
            PNG参数: options?.PNG参数
        });
    }

    if (backendType === 'sd_webui') {
        return await 执行SDWebUI生图(normalizedPrompt, apiConfig, size, negativePromptText, signal, options?.PNG参数);
    }

    if (backendType === 'grok') {
        return await 执行Grok生图(normalizedPrompt, apiConfig, signal);
    }

    // Default: OpenAI protocol
    return await 执行OpenAI协议生图(normalizedPrompt, apiConfig, signal, {
        附加负面提示词: negativePromptText,
        跳过基础负面提示词: options?.跳过基础负面提示词
    });
};
