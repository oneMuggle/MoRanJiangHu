/**
 * ComfyUI 工作流代理接口
 * 通过 CNB 的 raw 文件访问路径获取工作流 JSON，避免 CNB API 认证限制
 *
 * GET /api/comfyui-workflows
 *   ?action=list           → 返回工作流列表
 *   ?action=get&file=...   → 返回指定工作流的 API 格式 JSON
 */

export async function onRequestGet(context: any) {
    const { request } = context;
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'list';
    const file = url.searchParams.get('file') || '';

    // 工作流文件列表（来自 onemuggle_fz/ComfyUI-yi_dian_tong 仓库）
    const workflowFiles = [
        { path: 'qd-sd15_基础工作流一.json', name: 'SD15 基础工作流一', category: '文生图' },
        { path: 'qd-sd15_基础工作流二.json', name: 'SD15 基础工作流二', category: '文生图' },
        { path: 'SDXL基础文生图.json', name: 'SDXL 基础文生图', category: '文生图' },
        { path: 'flux基础文生图1.json', name: 'Flux 基础文生图 1', category: '文生图' },
        { path: 'flux基础文生图2.json', name: 'Flux 基础文生图 2', category: '文生图' },
        { path: 'flux基础局部重绘.json', name: 'Flux 基础局部重绘', category: '局部重绘' },
        { path: 'flux1-kontext-1.json', name: 'Flux Kontext', category: '文生图' },
        { path: 'hidream基础文生图.json', name: 'HiDream 基础文生图', category: '文生图' },
        { path: 'IL 光辉模型基础文生图.json', name: 'IL 光辉模型基础文生图', category: '文生图' },
        { path: 'ComfyUI-OVI_snicolast版.json', name: 'OVI snicolast', category: '文生图' },
        { path: 'Z-base+千问3反推+SeedVR2-CNB.json', name: 'Z-Base + 千问3反推', category: '图像增强' },
        { path: 'Z-Turbo+千问3反推+SeedVR2-cnb.json', name: 'Z-Turbo + 千问3反推', category: '图像增强' },
        { path: 'LTX-2/LTX-2图生视频.json', name: 'LTX-2 图生视频', category: '视频生成' },
        { path: 'LTX-2/LTX2-文生视频加速版-AI扩写.json', name: 'LTX-2 文生视频加速版', category: '视频生成' },
        { path: 'LTX-2/LTX2-Canny-线稿控制.json', name: 'LTX-2 Canny 线稿控制', category: '视频生成' },
        { path: 'LTX-2/LTX2-depth-深度控制.json', name: 'LTX-2 Depth 深度控制', category: '视频生成' },
        { path: 'LTX-2/LTX2-Pose-姿势参考.json', name: 'LTX-2 Pose 姿势参考', category: '视频生成' },
        { path: 'WAN/Wan基础文生视频.json', name: 'WAN 基础文生视频', category: '视频生成' },
        { path: 'WAN/Wan基础图生视频.json', name: 'WAN 基础图生视频', category: '视频生成' },
        { path: 'WAN/wan2.2/WAN2.2提示词选取.json', name: 'WAN 2.2 提示词选取', category: '视频生成' },
        { path: 'WAN/wan2.2/WAN2.2-KJ-文生视频+AI自动扩写提示词.json', name: 'WAN 2.2 文生视频+AI扩写', category: '视频生成' },
        { path: 'WAN/wan2.2/WAN2.2-KJ-图生视频+AI自动扩写提示词.json', name: 'WAN 2.2 图生视频+AI扩写', category: '视频生成' },
        { path: 'WAN/wan2.2/WAN2.2-S2V-CF版.json', name: 'WAN 2.2 S2V', category: '视频生成' },
        { path: 'WAN/wan2.2/Wan_SV2-CF官流完全体.json', name: 'WAN SV2 官流完全体', category: '视频生成' },
        { path: 'WAN/FusionX/W-FusionX-文生视频.json', name: 'W-FusionX 文生视频', category: '视频生成' },
        { path: 'WAN/FusionX/W-FusionX图生视频.json', name: 'W-FusionX 图生视频', category: '视频生成' },
        { path: 'WAN/FusionX/W-FusionX-参考控制.json', name: 'W-FusionX 参考控制', category: '视频生成' },
        { path: 'WAN/FusionX/W-Fusion首尾帧.json', name: 'W-Fusion 首尾帧', category: '视频生成' },
        { path: 'WAN/VACE/WAN-VACE参考图片生成视频.json', name: 'WAN VACE 参考图片生成', category: '视频生成' },
        { path: 'WAN/VACE/WAN-VACE两张图片组合生成.json', name: 'WAN VACE 两张图片组合', category: '视频生成' },
        { path: 'WAN/VACE/WAN-VACE首尾帧视频.json', name: 'WAN VACE 首尾帧', category: '视频生成' },
        { path: 'WAN/VACE/WAN-VACE-图片+姿势参考生成.json', name: 'WAN VACE 图片+姿势参考', category: '视频生成' },
    ];

    if (action === 'list') {
        return new Response(JSON.stringify({ workflows: workflowFiles }), {
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (action === 'get' && file) {
        if (file.includes('..') || file.startsWith('/')) {
            return new Response(JSON.stringify({ error: '非法文件路径' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const matched = workflowFiles.find((w) => w.path === file);
        if (!matched) {
            return new Response(JSON.stringify({ error: '未找到该工作流' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const rawUrl = `https://cnb.cool/onemuggle_fz/ComfyUI-yi_dian_tong/-/git/raw/main/workflows/${encodeURIComponent(file)}`;

        try {
            const res = await fetch(rawUrl, {
                headers: { 'Accept': 'application/json' },
            } as RequestInit);

            if (!res.ok) {
                return new Response(
                    JSON.stringify({ error: `获取工作流失败: HTTP ${res.status}` }),
                    { status: 502, headers: { 'Content-Type': 'application/json' } }
                );
            }

            const frontendJson = await res.json();
            const needsConversion = Array.isArray(frontendJson.nodes) && Array.isArray(frontendJson.links);

            if (needsConversion) {
                const apiWorkflow = convertToFrontendToApi(frontendJson);
                return new Response(JSON.stringify({ workflow: apiWorkflow, name: matched.name }), {
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            return new Response(JSON.stringify({ workflow: frontendJson, name: matched.name }), {
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (err: unknown) {
            return new Response(
                JSON.stringify({ error: `请求失败: ${err instanceof Error ? err.message : String(err)}` }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    return new Response(JSON.stringify({ error: '未知操作' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
    });
};

/**
 * 内联的 ComfyUI 前端格式转 API 格式转换器
 */
const INPUT_NAME_MAP: Record<string, Record<number, string>> = {
    KSampler: { 0: 'model', 1: 'positive', 2: 'negative', 3: 'latent_image' },
    KSamplerAdvanced: { 0: 'model', 1: 'positive', 2: 'negative', 3: 'latent_image' },
    CLIPTextEncode: { 0: 'clip' },
    VAEDecode: { 0: 'samples', 1: 'vae' },
    VAEEncode: { 0: 'pixels', 1: 'vae' },
    VAEDecodeTiled: { 0: 'samples', 1: 'vae' },
    VAEEncodeTiled: { 0: 'pixels', 1: 'vae' },
    SaveImage: { 0: 'images' },
    PreviewImage: { 0: 'images' },
    EmptyLatentImage: { 0: 'width', 1: 'height', 2: 'batch_size' },
    EmptySD3LatentImage: { 0: 'width', 1: 'height', 2: 'batch_size' },
    CheckpointLoaderSimple: {},
    CLIPSetLastLayer: { 0: 'clip' },
    LoraLoaderModelOnly: { 0: 'model' },
    ImageScale: { 0: 'image' },
    ImageScaleBy: { 0: 'image' },
    ImageUpscaleWithModel: { 0: 'image', 1: 'upscale_model' },
    FluxGuidance: { 0: 'conditioning' },
    ModelSamplingSD3: { 0: 'model' },
    ModelSamplingAuraFlow: { 0: 'model' },
    ConditioningZeroOut: { 0: 'conditioning' },
    RandomNoise: {},
    BasicGuider: { 0: 'model', 1: 'conditioning' },
    CFGGuider: { 0: 'model', 1: 'conditioning' },
    BasicScheduler: { 0: 'model' },
    KSamplerSelect: { 0: 'model' },
    SamplerCustomAdvanced: { 0: 'noise', 1: 'guider', 2: 'sampler', 3: 'sigmas', 4: 'latent_image' },
    Reroute: { 0: 'VALUE' },
    UNETLoader: {},
    DualCLIPLoader: {},
    QuadrupleCLIPLoader: {},
    CLIPLoader: {},
    VAELoader: {},
    UpscaleModelLoader: {},
    LoadImage: {},
};

const WIDGET_NAME_MAP: Record<string, Record<number, string>> = {
    CheckpointLoaderSimple: { 0: 'ckpt_name' },
    VAELoader: { 0: 'vae_name' },
    UpscaleModelLoader: { 0: 'model_name' },
    UNETLoader: { 0: 'model_name', 1: 'weight_dtype' },
    CLIPLoader: { 0: 'clip_name', 1: 'type', 2: 'device' },
    CLIPVisionLoader: { 0: 'clip_name' },
    DualCLIPLoader: { 0: 'clip_name1', 1: 'clip_name2', 2: 'type', 3: 'device' },
    QuadrupleCLIPLoader: { 0: 'clip_name1', 1: 'clip_name2', 2: 'clip_name3', 3: 'clip_name4' },
    TripleCLIPLoader: { 0: 'clip_name1', 1: 'clip_name2', 2: 'clip_name3' },
    CLIPTextEncode: { 0: 'text' },
    CLIPTextEncodeFlux: { 0: 'clip_l', 1: 't5xxl', 2: 'guidance' },
    KSampler: { 0: 'seed', 1: 'control_after_generate', 2: 'steps', 3: 'cfg', 4: 'sampler_name', 5: 'scheduler', 6: 'denoise' },
    KSamplerAdvanced: { 0: 'add_noise', 1: 'noise_seed', 2: 'control_after_generate', 3: 'steps', 4: 'cfg', 5: 'sampler_name', 6: 'scheduler', 7: 'start_at_step', 8: 'end_at_step', 9: 'return_with_leftover_noise' },
    KSamplerSelect: { 0: 'sampler_name' },
    BasicScheduler: { 0: 'scheduler', 1: 'steps', 2: 'denoise' },
    CFGGuider: { 0: 'cfg' },
    RandomNoise: { 0: 'noise_seed', 1: 'control_after_generate' },
    FluxGuidance: { 0: 'guidance' },
    ModelSamplingSD3: { 0: 'sampling_strength' },
    ModelSamplingAuraFlow: { 0: 'sampling_strength' },
    EmptyLatentImage: { 0: 'width', 1: 'height', 2: 'batch_size' },
    EmptySD3LatentImage: { 0: 'width', 1: 'height', 2: 'batch_size' },
    EmptyImage: { 0: 'width', 1: 'height', 2: 'batch_size', 3: 'color' },
    VAEDecodeTiled: { 0: 'tile_size', 1: 'overlap', 2: 'temporal_size', 3: 'temporal_overlap' },
    VAEEncodeTiled: { 0: 'tile_size', 1: 'overlap', 2: 'temporal_size', 3: 'temporal_overlap' },
    ImageScale: { 0: 'upscale_method', 1: 'width', 2: 'height', 3: 'crop' },
    ImageScaleBy: { 0: 'upscale_method', 1: 'scale_by' },
    SaveImage: { 0: 'filename_prefix' },
    LoadImage: { 0: 'image' },
    CLIPSetLastLayer: { 0: 'stop_at_clip_layer' },
    Note: { 0: 'text' },
    LoraLoaderModelOnly: { 0: 'lora_name', 1: 'strength_model' },
    TeaCache: { 0: 'mode', 1: 'rel_l1_thresh', 2: 'start_step' },
};

function convertToFrontendToApi(frontendJson: Record<string, unknown>): Record<string, unknown> {
    const nodes = Array.isArray(frontendJson.nodes) ? frontendJson.nodes : [];
    const links = Array.isArray(frontendJson.links) ? frontendJson.links : [];

    const connectionMap: Record<number, Record<number, [number, number]>> = {};
    for (const link of links) {
        if (!Array.isArray(link) || link.length < 6) continue;
        const [, srcNodeId, srcSlot, tgtNodeId, tgtSlot] = link;
        if (typeof tgtNodeId !== 'number' || typeof tgtSlot !== 'number') continue;
        if (typeof srcNodeId !== 'number' || typeof srcSlot !== 'number') continue;
        if (!connectionMap[tgtNodeId]) connectionMap[tgtNodeId] = {};
        connectionMap[tgtNodeId][tgtSlot] = [srcNodeId, srcSlot];
    }

    const apiWorkflow: Record<string, unknown> = {};
    for (const node of nodes) {
        const nodeId = String((node as any).id);
        const nodeType = (node as any).type || '';
        const widgetsValues: unknown[] = Array.isArray((node as any).widgets_values) ? (node as any).widgets_values : [];

        const inputNames = INPUT_NAME_MAP[nodeType] || {};
        const widgetNames = WIDGET_NAME_MAP[nodeType] || {};
        const inputs: Record<string, unknown> = {};

        for (let i = 0; i < widgetsValues.length; i++) {
            const widgetName = widgetNames[i] || `widget_${i}`;
            const widgetValue = widgetsValues[i];
            if (Array.isArray(widgetValue) && widgetValue.length === 2 && typeof widgetValue[0] === 'boolean') {
                continue;
            }
            inputs[widgetName] = widgetValue;
        }

        const nodeConnections = connectionMap[(node as any).id] || {};
        for (const [slotStr, [srcNodeId, srcSlot]] of Object.entries(nodeConnections)) {
            const slotIndex = parseInt(slotStr);
            const inputName = inputNames[slotIndex] || `_input_${slotIndex}`;
            inputs[inputName] = [String(srcNodeId), srcSlot];
        }

        apiWorkflow[nodeId] = {
            inputs,
            class_type: nodeType,
        };
    }

    return apiWorkflow;
}
